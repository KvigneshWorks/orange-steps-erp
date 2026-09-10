<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabourWeeklyBill;
use App\Models\LabourWeeklyPayment;
use App\Models\AttendanceRecord;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class GenerateWeeklyLabourBill extends Command
{
    protected $signature = 'labour:generate-weekly-bill
                              {--week-start= : Override week start date (YYYY-MM-DD)}
                              {--week-end=   : Override week end date (YYYY-MM-DD)}
                              {--no-whatsapp : Skip WhatsApp send}';

    protected $description = 'Generate weekly labour bill, create PDF, and send to WhatsApp (auto every Saturday 12 PM)';

    public function handle(WhatsAppService $wa): int
    {
        $today     = Carbon::today();
        $weekStart = $this->option('week-start')
            ? Carbon::parse($this->option('week-start'))->toDateString()
            : $today->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
        $weekEnd   = $this->option('week-end')
            ? Carbon::parse($this->option('week-end'))->toDateString()
            : $today->toDateString();

        $this->info("📋 Generating bill: {$weekStart} → {$weekEnd}");

        // ── 1. Check duplicate ──────────────────────────────────────────────
        if (LabourWeeklyBill::where('week_start', $weekStart)
                ->where('week_end', $weekEnd)->exists()) {
            $this->warn('Bill already exists for this week. Skipping.');
            return 0;
        }

        // ── 2. Aggregate attendance ──────────────────────────────────────────
        $records = AttendanceRecord::whereBetween('date', [$weekStart, $weekEnd])
            ->select(
                'worker_id', 'worker_name', 'daily_rate',
                DB::raw('SUM(shifts_worked) as total_shifts'),
                DB::raw('SUM(amount)        as total_earned')
            )
            ->groupBy('worker_id', 'worker_name', 'daily_rate')
            ->get();

        if ($records->isEmpty()) {
            $this->warn('No attendance records found. Bill not created.');
            return 0;
        }

        // ── 3. Create bill + payment rows ────────────────────────────────────
        DB::beginTransaction();
        try {
            $bill = LabourWeeklyBill::create([
                'week_start'    => $weekStart,
                'week_end'      => $weekEnd,
                'generated_at'  => now(),
                'status'        => 'draft',
                'total_workers' => $records->count(),
                'total_earned'  => (float) $records->sum('total_earned'),
                'total_paid'    => 0,
                'total_balance' => (float) $records->sum('total_earned'),
                'created_by'    => 1,
            ]);

            foreach ($records as $rec) {
                $prevBalance = (float) (LabourWeeklyPayment::where('worker_id', $rec->worker_id)
                    ->whereHas('bill', fn ($q) => $q->where('week_end', '<', $weekStart))
                    ->orderByDesc('id')
                    ->value('balance_carried') ?? 0);

                $totalDue = (float) $rec->total_earned + $prevBalance;

                LabourWeeklyPayment::create([
                    'bill_id'          => $bill->id,
                    'worker_id'        => $rec->worker_id,
                    'worker_name'      => $rec->worker_name,
                    'daily_rate'       => (float) $rec->daily_rate,
                    'total_shifts'     => (float) $rec->total_shifts,
                    'total_earned'     => (float) $rec->total_earned,
                    'previous_balance' => $prevBalance,
                    'total_due'        => $totalDue,
                    'amount_paid'      => 0,
                    'balance_carried'  => $totalDue,
                    'status'           => 'pending',
                ]);
            }

            $totalDueAll = (float) $bill->payments()->sum('total_due');
            $bill->update(['total_balance' => $totalDueAll]);

            DB::commit();
            $this->info("✓ Bill #{$bill->id} created — {$records->count()} workers, ₹{$totalDueAll} due");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Failed to generate bill: ' . $e->getMessage());
            return 1;
        }

        // ── 4. Generate PDF ──────────────────────────────────────────────────
        $this->info('📄 Generating PDF…');

        try {
            $bill->load('payments');
            $totalDue = $bill->payments->sum('total_due');

            $pdf = Pdf::loadView('pdf.labour-bill', [
                'bill'     => $bill,
                'totalDue' => $totalDue,
            ])
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont'          => 'dejavusans',
                'isRemoteEnabled'      => false,
                'isHtml5ParserEnabled' => true,
            ]);

            $pdfContent = $pdf->output();
            $fileName   = "labour-bill-{$weekStart}-to-{$weekEnd}.pdf";

            // Save to storage for reference
            $storagePath = storage_path("app/labour-bills/{$fileName}");
            if (!is_dir(dirname($storagePath))) {
                mkdir(dirname($storagePath), 0775, true);
            }
            file_put_contents($storagePath, $pdfContent);

            $this->info("✓ PDF saved: {$fileName}");

        } catch (\Exception $e) {
            $this->error('PDF generation failed: ' . $e->getMessage());
            // Bill already created — don't return failure, just skip WhatsApp
            return 0;
        }

        // ── 5. Send via WhatsApp ─────────────────────────────────────────────
        if ($this->option('no-whatsapp')) {
            $this->info('WhatsApp skipped (--no-whatsapp flag).');
            return 0;
        }

        $phone = config('services.whatsapp.number');

        if (empty($phone)) {
            $this->warn('WHATSAPP_NUMBER not set in .env — skipping WhatsApp send.');
            return 0;
        }

        $this->info("📱 Sending PDF to WhatsApp +{$phone}…");

        $weekStartFmt = Carbon::parse($weekStart)->format('d M Y');
        $weekEndFmt   = Carbon::parse($weekEnd)->format('d M Y');
        $caption      = "📋 *Weekly Labour Bill*\n"
                      . "Week: {$weekStartFmt} → {$weekEndFmt}\n"
                      . "Workers: {$bill->total_workers} | Due: ₹" . number_format($totalDue, 2) . "\n"
                      . "Open the ERP to record payments.";

        $sent = $wa->sendPDF($phone, $pdfContent, $fileName, $caption);

        if ($sent) {
            $this->info('✓ PDF sent to WhatsApp successfully!');
        } else {
            $this->warn('WhatsApp send failed — check logs. Bill and PDF are still saved.');
        }

        return 0;
    }
}
