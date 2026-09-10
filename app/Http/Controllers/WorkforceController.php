<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\AttendanceRecord;
use App\Models\WorkerPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WorkforceController extends Controller
{
    // ══════════════════════════════════════════════════
    //  WORKERS
    // ══════════════════════════════════════════════════
    public function indexWorkers(Request $r)
    {
        $q = Worker::withTrashed(false)->with([]);

        if ($r->search) {
            $s = $r->search;
            $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                    ->orWhere('worker_code', 'like', "%$s%")
                    ->orWhere('trade', 'like', "%$s%")
                    ->orWhere('site', 'like', "%$s%");
            });
        }

        if ($r->worker_type) $q->where('worker_type', $r->worker_type);
        if ($r->site)        $q->where('site', 'like', '%' . $r->site . '%');
        if ($r->filled('is_active')) $q->where('is_active', $r->boolean('is_active'));

        $workers = $q->orderBy('name')->get();

        $ids = $workers->pluck('id');
        $stats = AttendanceRecord::whereIn('worker_id', $ids)
            ->select('worker_id', DB::raw('SUM(shifts_worked) as total_shifts'), DB::raw('SUM(amount) as total_earned'), DB::raw('COUNT(*) as total_days'))
            ->groupBy('worker_id')
            ->get()
            ->keyBy('worker_id');

        $paid = WorkerPayment::whereIn('worker_id', $ids)
            ->select('worker_id', DB::raw('SUM(amount_paid) as total_paid'))
            ->groupBy('worker_id')
            ->get()
            ->keyBy('worker_id');

        $workers->each(function ($w) use ($stats, $paid) {
            $s = $stats[$w->id] ?? null;
            $p = $paid[$w->id] ?? null;
            $w->total_shifts  = $s ? (float)$s->total_shifts : 0;
            $w->total_earned  = $s ? (float)$s->total_earned : 0;
            $w->total_paid    = $p ? (float)$p->total_paid   : 0;
            $w->balance       = $w->total_earned - $w->total_paid;
        });

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

    public function storeWorker(Request $r)
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
        ]);

        $data['site'] = $data['site'] ?? '';

        if (empty($data['worker_code'])) {
            $prefix = 'WRK-' . date('ymd') . '-';
            $last   = Worker::withTrashed()->where('worker_code', 'like', $prefix . '%')
                ->orderByDesc('worker_code')->value('worker_code');
            $seq    = $last ? ((int)substr($last, -3)) + 1 : 1;
            $data['worker_code'] = $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
        }

        $data['worker_type']   = $data['worker_type']   ?? 'labour';
        $data['created_by']    = Auth::id();
        $data['daily_rate']    = $data['daily_rate']    ?? 0;
        $data['monthly_salary'] = $data['monthly_salary'] ?? 0;
        $worker = Worker::create($data);

        return response()->json(['data' => $worker, 'message' => 'Worker registered successfully'], 201);
    }

    public function updateWorker(Request $r, $id)
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
        ]);

        $data['site'] = $data['site'] ?? '';
        $data['daily_rate']    = $data['daily_rate']    ?? 0;
        $data['monthly_salary'] = $data['monthly_salary'] ?? 0;
        $worker->update($data);
        return response()->json(['data' => $worker, 'message' => 'Worker updated']);
    }

    public function toggleWorkerStatus($id)
    {
        $worker = Worker::findOrFail($id);
        $worker->update(['is_active' => !$worker->is_active]);
        return response()->json(['data' => $worker, 'message' => 'Status updated']);
    }

    public function destroyWorker($id)
    {
        $worker = Worker::findOrFail($id);
        $worker->delete();
        return response()->json(['message' => 'Worker removed']);
    }

    // ══════════════════════════════════════════════════
    //  ATTENDANCE RECORDS
    // ══════════════════════════════════════════════════

    public function indexAttendance(Request $r)
    {
        $q = AttendanceRecord::query();
        if ($r->from_date) $q->whereDate('date', '>=', $r->from_date);
        if ($r->to_date)   $q->whereDate('date', '<=', $r->to_date);
        if ($r->site)      $q->where('site', 'like', '%' . $r->site . '%');
        if ($r->worker_id) $q->where('worker_id', $r->worker_id);
        if ($r->status)    $q->where('status', $r->status);
        if ($r->worker_type) $q->where('worker_type', $r->worker_type);
        if ($r->date)      $q->whereDate('date', $r->date);

        $records = $q->orderBy('date', 'desc')->orderBy('worker_name')->get();

        return response()->json(['data' => $records]);
    }

    public function storeAttendance(Request $r)
    {
        $data = $r->validate([
            'worker_id'     => 'required|exists:workers,id',
            'date'          => 'required|date',
            'shifts_worked' => 'required|in:0.5,1,1.5,2,2.5,3',
            'status'        => 'required|in:present,absent,on_leave',
            'notes'         => 'nullable|string|max:500',
        ]);

        $worker    = Worker::findOrFail($data['worker_id']);
        $shifts    = (float)$data['shifts_worked'];
        $effRate   = $worker->effective_daily_rate;
        $amount    = $data['status'] === 'present' ? round($shifts * $effRate, 2) : 0;

        $record = AttendanceRecord::updateOrCreate(
            ['worker_id' => $data['worker_id'], 'date' => $data['date']],
            [
                'worker_name'   => $worker->name,
                'worker_code'   => $worker->worker_code,
                'worker_type'   => $worker->worker_type,
                'trade'         => $worker->trade ?? '',
                'site'          => $worker->site,
                'shifts_worked' => $shifts,
                'status'        => $data['status'],
                'daily_rate'    => $effRate,
                'amount'        => $amount,
                'notes'         => $data['notes'] ?? null,
                'created_by'    => Auth::id(),
            ]
        );

        return response()->json(['data' => $record, 'message' => 'Attendance saved'], 201);
    }

    public function updateAttendance(Request $r, $id)
    {
        $record = AttendanceRecord::findOrFail($id);

        $data = $r->validate([
            'shifts_worked' => 'required|in:0.5,1,1.5,2,2.5,3',
            'status'        => 'required|in:present,absent,on_leave',
            'notes'         => 'nullable|string|max:500',
        ]);

        $shifts = (float)$data['shifts_worked'];
        $amount = $data['status'] === 'present' ? $shifts * $record->daily_rate : 0;

        $record->update([
            'shifts_worked' => $shifts,
            'status'        => $data['status'],
            'amount'        => $amount,
            'notes'         => $data['notes'] ?? null,
        ]);

        return response()->json(['data' => $record, 'message' => 'Record updated']);
    }

    public function destroyAttendance($id)
    {
        AttendanceRecord::findOrFail($id)->delete();
        return response()->json(['message' => 'Record deleted']);
    }

    public function bulkMarkAttendance(Request $r)
    {
        $data = $r->validate([
            'worker_ids'    => 'required|array',
            'worker_ids.*'  => 'exists:workers,id',
            'date'          => 'required|date',
            'shifts_worked' => 'required|in:0.5,1,1.5,2,2.5,3',
            'status'        => 'required|in:present,absent,on_leave',
        ]);

        $created = 0;
        $shifts  = (float)$data['shifts_worked'];
        foreach ($data['worker_ids'] as $wid) {
            $worker = Worker::find($wid);
            if (!$worker || !$worker->is_active) continue;

            $effRate = $worker->effective_daily_rate;
            $amount  = $data['status'] === 'present' ? round($shifts * $effRate, 2) : 0;

            AttendanceRecord::updateOrCreate(
                ['worker_id' => $wid, 'date' => $data['date']],
                [
                    'worker_name'   => $worker->name,
                    'worker_code'   => $worker->worker_code,
                    'worker_type'   => $worker->worker_type,
                    'trade'         => $worker->trade ?? '',
                    'site'          => $worker->site,
                    'shifts_worked' => $shifts,
                    'status'        => $data['status'],
                    'daily_rate'    => $effRate,
                    'amount'        => $amount,
                    'notes'         => null,
                    'created_by'    => Auth::id(),
                ]
            );
            $created++;
        }

        return response()->json(['message' => "$created records saved", 'count' => $created]);
    }

    // ══════════════════════════════════════════════════
    //  PAYMENTS
    // ══════════════════════════════════════════════════
    public function indexPayments(Request $r)
    {
        $q = WorkerPayment::query();

        if ($r->worker_id) $q->where('worker_id', $r->worker_id);
        if ($r->site)      $q->where('site', 'like', '%' . $r->site . '%');
        if ($r->from_date) $q->whereDate('paid_on', '>=', $r->from_date);
        if ($r->to_date)   $q->whereDate('paid_on', '<=', $r->to_date);
        if ($r->status)    $q->where('status', $r->status);

        $payments = $q->orderBy('paid_on', 'desc')->get();

        return response()->json(['data' => $payments]);
    }

    public function storePayment(Request $r)
    {
        $data = $r->validate([
            'worker_id'    => 'required|exists:workers,id',
            'from_date'    => 'required|date',
            'to_date'      => 'required|date|after_or_equal:from_date',
            'amount_paid'  => 'required|numeric|min:0.01',
            'payment_mode' => 'required|in:cash,bank_transfer,upi,cheque,other',
            'reference_no' => 'nullable|string|max:100',
            'notes'        => 'nullable|string|max:500',
            'paid_on'      => 'required|date',
        ]);

        $worker = Worker::findOrFail($data['worker_id']);
        $totalEarned = AttendanceRecord::where('worker_id', $data['worker_id'])
            ->whereBetween('date', [$data['from_date'], $data['to_date']])
            ->where('status', 'present')
            ->sum('amount');
        $totalShifts = AttendanceRecord::where('worker_id', $data['worker_id'])
            ->whereBetween('date', [$data['from_date'], $data['to_date']])
            ->where('status', 'present')
            ->sum('shifts_worked');

        $balance = $totalEarned - $data['amount_paid'];
        $status  = $balance <= 0 ? 'paid' : ($data['amount_paid'] > $totalEarned ? 'advance' : 'partial');

        $payment = WorkerPayment::create([
            'worker_id'    => $data['worker_id'],
            'worker_name'  => $worker->name,
            'site'         => $worker->site,
            'from_date'    => $data['from_date'],
            'to_date'      => $data['to_date'],
            'total_shifts' => (float)$totalShifts,
            'total_earned' => (float)$totalEarned,
            'amount_paid'  => $data['amount_paid'],
            'balance'      => $balance,
            'payment_mode' => $data['payment_mode'],
            'reference_no' => $data['reference_no'] ?? null,
            'notes'        => $data['notes'] ?? null,
            'status'       => $status,
            'paid_on'      => $data['paid_on'],
            'created_by'   => Auth::id(),
        ]);

        return response()->json(['data' => $payment, 'message' => 'Payment recorded'], 201);
    }

    public function destroyPayment($id)
    {
        WorkerPayment::findOrFail($id)->delete();
        return response()->json(['message' => 'Payment deleted']);
    }

    // ══════════════════════════════════════════════════
    //  REPORT & SUMMARY
    // ══════════════════════════════════════════════════

    public function labourReport(Request $r)
    {
        $r->validate([
            'from_date' => 'required|date',
            'to_date'   => 'required|date',
        ]);

        $q = AttendanceRecord::whereBetween('date', [$r->from_date, $r->to_date])
            ->where('status', 'present');

        if ($r->site) $q->where('site', 'like', '%' . $r->site . '%');
        if ($r->worker_type) $q->where('worker_type', $r->worker_type);

        $rows = $q->select(
            'worker_id',
            'worker_name',
            'worker_code',
            'worker_type',
            'trade',
            'site',
            DB::raw('SUM(shifts_worked) as total_shifts'),
            DB::raw('MAX(daily_rate) as daily_rate'),
            DB::raw('SUM(amount) as total_amount')
        )
            ->groupBy('worker_id', 'worker_name', 'worker_code', 'worker_type', 'trade', 'site')
            ->orderBy('worker_name')
            ->get();

        $workerIds = $rows->pluck('worker_id');
        $payments  = WorkerPayment::whereIn('worker_id', $workerIds)
            ->where(function ($q) use ($r) {
                $q->whereBetween('from_date', [$r->from_date, $r->to_date])
                    ->orWhereBetween('to_date', [$r->from_date, $r->to_date]);
            })
            ->select('worker_id', DB::raw('SUM(amount_paid) as paid'))
            ->groupBy('worker_id')
            ->get()
            ->keyBy('worker_id');

        $rows->each(function ($row) use ($payments) {
            $row->total_shifts = (float)$row->total_shifts;
            $row->daily_rate   = (float)$row->daily_rate;
            $row->total_amount = (float)$row->total_amount;
            $paid = $payments[$row->worker_id] ?? null;
            $row->total_paid   = $paid ? (float)$paid->paid : 0;
            $row->balance      = $row->total_amount - $row->total_paid;
        });

        $summary = [
            'total_workers' => $rows->count(),
            'total_shifts'  => (float)$rows->sum('total_shifts'),
            'total_earned'  => (float)$rows->sum('total_amount'),
            'total_paid'    => (float)$rows->sum('total_paid'),
            'balance'       => (float)$rows->sum('balance'),
        ];

        return response()->json(['data' => $rows, 'summary' => $summary]);
    }

    public function dashboardStats()
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        return response()->json([
            'total_workers'      => Worker::where('is_active', true)->count(),
            'marked_today'       => AttendanceRecord::whereDate('date', $today)->count(),
            'present_today'      => AttendanceRecord::whereDate('date', $today)->where('status', 'present')->count(),
            'month_cost'         => (float)AttendanceRecord::whereBetween('date', [$monthStart, $today])->sum('amount'),
            'unpaid_balance'     => (float)DB::table('workers as w')
                ->join('attendance_records as a', 'w.id', '=', 'a.worker_id')
                ->leftJoin('worker_payments as p', 'w.id', '=', 'p.worker_id')
                ->whereNull('w.deleted_at')
                ->whereNull('a.deleted_at')
                ->whereNull('p.deleted_at')
                ->selectRaw('COALESCE(SUM(a.amount),0) - COALESCE(SUM(p.amount_paid),0) as bal')
                ->value('bal'),
        ]);
    }
}
