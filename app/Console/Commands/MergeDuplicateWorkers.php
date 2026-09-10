<?php

namespace App\Console\Commands;

use App\Models\AttendanceRecord;
use App\Models\LabourPaymentSession;
use App\Models\LabourWeeklyPayment;
use App\Models\Worker;
use App\Models\WorkerPayment;
use App\Models\WorkerSubName;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-time data fix: several worker records were accidentally created for the
 * same real person (e.g. "Ajith" registered twice at ₹500 and ₹700, each with
 * their own sub-names). This finds every group of workers sharing the same
 * name and merges each group into a single surviving record (the oldest —
 * lowest id — one), moving every sub-name, attendance row, and payment record
 * onto it before removing the now-empty duplicates.
 *
 * The surviving worker keeps its own daily_rate — the other rate isn't lost
 * forever, it's just no longer the default; Attendance now lets you type a
 * different rate per entry (see AttendanceController@store/update), and you
 * can also just edit the surviving worker's rate directly in Workforce
 * Register any time.
 */
class MergeDuplicateWorkers extends Command
{
    protected $signature = 'workers:merge-duplicates
        {name? : Only merge workers with this exact name (case-insensitive). Omit to scan every worker and merge every duplicate-named group found.}
        {--dry-run : Show what would be merged without changing anything.}';

    protected $description = 'Merge worker records that share the same name into one, moving all sub-names and attendance/payment history onto the survivor.';

    public function handle(): int
    {
        $nameFilter = $this->argument('name');
        $dryRun = (bool) $this->option('dry-run');

        $query = Worker::query()->orderBy('id');
        if ($nameFilter) {
            $query->whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($nameFilter))]);
        }
        $workers = $query->get();

        $groups = $workers->groupBy(fn (Worker $w) => strtolower(trim($w->name)));
        $duplicateGroups = $groups->filter(fn ($g) => $g->count() > 1);

        if ($duplicateGroups->isEmpty()) {
            $this->info($nameFilter
                ? "No duplicate workers found named \"{$nameFilter}\"."
                : 'No duplicate-named workers found — nothing to merge.');
            return self::SUCCESS;
        }

        foreach ($duplicateGroups as $name => $group) {
            $sorted = $group->sortBy('id')->values();
            $survivor = $sorted->first();
            $dupes = $sorted->slice(1);

            $this->newLine();
            $this->info(sprintf(
                'Merging "%s": survivor #%d (rate ₹%s/day) ← absorbing #%s',
                $survivor->name,
                $survivor->id,
                $survivor->daily_rate,
                $dupes->pluck('id')->implode(', #')
            ));

            foreach ($dupes as $d) {
                $subCount = WorkerSubName::where('worker_id', $d->id)->count();
                $attCount = AttendanceRecord::where('worker_id', $d->id)->count();
                $payCount = WorkerPayment::where('worker_id', $d->id)->count();
                $this->line("  #{$d->id} (rate ₹{$d->daily_rate}/day): {$subCount} sub-names, {$attCount} attendance rows, {$payCount} payments");
            }

            if ($dryRun) {
                continue;
            }

            DB::transaction(function () use ($survivor, $dupes) {
                foreach ($dupes as $d) {
                    // Sub-names: move over, but skip ones that already exist on the
                    // survivor (unique worker_id+sub_name constraint would reject them).
                    WorkerSubName::where('worker_id', $d->id)->get()->each(function (WorkerSubName $sub) use ($survivor) {
                        $exists = WorkerSubName::where('worker_id', $survivor->id)
                            ->whereRaw('LOWER(TRIM(sub_name)) = ?', [strtolower(trim($sub->sub_name))])
                            ->exists();
                        if ($exists) {
                            $sub->delete();
                        } else {
                            $sub->update(['worker_id' => $survivor->id]);
                        }
                    });

                    // Attendance history: repoint + refresh the denormalized snapshot
                    // columns so past records display the survivor's identity.
                    AttendanceRecord::where('worker_id', $d->id)->update([
                        'worker_id'   => $survivor->id,
                        'worker_name' => $survivor->name,
                        'worker_code' => $survivor->worker_code,
                        'worker_type' => $survivor->worker_type,
                        'trade'       => $survivor->trade,
                        'site'        => $survivor->site,
                    ]);

                    // Payment history
                    WorkerPayment::where('worker_id', $d->id)->update([
                        'worker_id'   => $survivor->id,
                        'worker_name' => $survivor->name,
                    ]);
                    LabourPaymentSession::where('worker_id', $d->id)->update([
                        'worker_id'   => $survivor->id,
                        'worker_name' => $survivor->name,
                    ]);
                    LabourWeeklyPayment::where('worker_id', $d->id)->update([
                        'worker_id'   => $survivor->id,
                        'worker_name' => $survivor->name,
                    ]);

                    // The duplicate is now empty — remove it (soft delete).
                    $d->delete();
                }
            });

            $this->info('  done.');
        }

        $this->newLine();
        $this->info($dryRun ? 'Dry run complete — nothing was changed.' : 'Merge complete.');
        return self::SUCCESS;
    }
}
