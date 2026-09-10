<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class WorkerController extends Controller
{
    // ══════════════════════════════════════════════════
    //  WORKERS CRUD
    // ══════════════════════════════════════════════════

    public function index(Request $r)
    {
        // Was previously also computing lifetime SUM/GROUP BY aggregates over
        // attendance_records + worker_payments for every worker on every call
        // (2 full scans of the fastest-growing table in the app, on every
        // load of the Attendance and Workforce Register pages) — but neither
        // of this endpoint's two callers actually reads total_shifts /
        // total_earned / total_paid / balance from the response. Removed;
        // pages that need worker balances (e.g. Labour Payment) have their
        // own dedicated endpoint for that. Short cache kept since the plain
        // list/search query is still worth not re-running on rapid re-renders.
        $q = Worker::query();

        if ($r->search) {
            $s = $r->search;
            $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                    ->orWhere('worker_code', 'like', "%$s%")
                    ->orWhere('trade', 'like', "%$s%")
                    ->orWhere('site', 'like', "%$s%");
            });
        }

        if ($r->worker_type)          $q->where('worker_type', $r->worker_type);
        if ($r->site)                 $q->where('site', 'like', '%' . $r->site . '%');
        if ($r->filled('is_active'))  $q->where('is_active', $r->boolean('is_active'));

        $workers = $q->orderBy('name')->get();

        return response()->json(['data' => $workers]);
    }

    public function skills()
    {
        $skills = Worker::whereNotNull('trade')->where('trade', '!=', '')
            ->distinct()->orderBy('trade')->pluck('trade');
        return response()->json(['data' => $skills]);
    }

    public function sites()
    {
        $sites = Worker::whereNotNull('site')->where('site', '!=', '')
            ->distinct()->orderBy('site')->pluck('site');
        return response()->json(['data' => $sites]);
    }

    public function trashed()
    {
        $workers = Worker::onlyTrashed()->orderByDesc('deleted_at')->get();
        return response()->json(['data' => $workers]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'name'            => 'required|string|max:150',
            'worker_code'     => 'nullable|string|max:30|unique:workers,worker_code',
            'worker_type'     => 'nullable|in:employee,labour,contractor',
            'trade'           => 'nullable|string|max:100',
            'site'            => 'nullable|string|max:200',
            'phone'           => 'nullable|string|max:20',
            'contractor_name' => 'nullable|string|max:150',
            'salary_type'     => 'required|in:daily,weekly,monthly',
            'daily_rate'      => 'nullable|numeric|min:0',
            'monthly_salary'  => 'nullable|numeric|min:0',
            'description'     => 'nullable|string|max:500',
            'is_active'       => 'boolean',
            'category_id'     => 'nullable|integer',
            'sub_category_id' => 'nullable|integer',
            'bio_data_id'     => 'nullable|integer',
        ]);

        $data['site']            = $data['site']            ?? '';
        $data['trade']           = $data['trade']           ?? '';
        $data['phone']           = $data['phone']           ?? '';
        $data['contractor_name'] = $data['contractor_name'] ?? '';
        $data['description']     = $data['description']     ?? '';

        if (empty($data['worker_code'])) {
            $prefix = 'WRK-' . date('ymd') . '-';
            $last   = Worker::withTrashed()
                ->where('worker_code', 'like', $prefix . '%')
                ->orderByDesc('worker_code')->value('worker_code');
            $seq    = $last ? ((int)substr($last, -3)) + 1 : 1;
            $data['worker_code'] = $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
        }

        $data['worker_type']    = $data['worker_type']    ?? 'labour';
        $data['created_by']     = Auth::id();
        $data['created_by_name'] = Auth::user()?->name;
        $data['daily_rate']     = $data['daily_rate']     ?? 0;
        $data['monthly_salary'] = $data['monthly_salary'] ?? 0;

        $worker = Worker::create($data);
        Cache::increment('workers_index_version');
        return response()->json(['data' => $worker, 'message' => 'Worker registered successfully'], 201);
    }

    public function update(Request $r, $id)
    {
        $worker = Worker::findOrFail($id);

        $data = $r->validate([
            'name'            => 'required|string|max:150',
            'worker_code'     => 'nullable|string|max:30|unique:workers,worker_code,' . $id,
            'worker_type'     => 'nullable|in:employee,labour,contractor',
            'trade'           => 'nullable|string|max:100',
            'site'            => 'nullable|string|max:200',
            'phone'           => 'nullable|string|max:20',
            'contractor_name' => 'nullable|string|max:150',
            'salary_type'     => 'required|in:daily,weekly,monthly',
            'daily_rate'      => 'nullable|numeric|min:0',
            'monthly_salary'  => 'nullable|numeric|min:0',
            'description'     => 'nullable|string|max:500',
            'is_active'       => 'boolean',
            'category_id'     => 'nullable|integer',
            'sub_category_id' => 'nullable|integer',
            'bio_data_id'     => 'nullable|integer',
        ]);

        $data['site']            = $data['site']            ?? '';
        $data['trade']           = $data['trade']           ?? '';
        $data['phone']           = $data['phone']           ?? '';
        $data['contractor_name'] = $data['contractor_name'] ?? '';
        $data['description']     = $data['description']     ?? '';
        $data['daily_rate']      = $data['daily_rate']      ?? 0;
        $data['monthly_salary']  = $data['monthly_salary']  ?? 0;

        $worker->update($data);
        Cache::increment('workers_index_version');
        return response()->json(['data' => $worker, 'message' => 'Worker updated']);
    }

    public function toggleStatus($id)
    {
        $worker = Worker::findOrFail($id);
        $worker->update(['is_active' => !$worker->is_active]);
        Cache::increment('workers_index_version');
        return response()->json(['data' => $worker, 'message' => 'Status updated']);
    }

    public function destroy($id)
    {
        Worker::findOrFail($id)->delete();
        Cache::increment('workers_index_version');
        return response()->json(['message' => 'Worker removed']);
    }
}
