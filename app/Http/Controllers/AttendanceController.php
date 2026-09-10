<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\BioData;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function dashboardStats()
    {
        $today      = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        return response()->json(['data' => [
            'total_workers' => Worker::where('is_active', true)->count(),
            'marked_today'  => AttendanceRecord::where('date', $today)->count(),
            'present_today' => AttendanceRecord::where('date', $today)->where('status', 'present')->count(),
            'month_cost'    => (float) AttendanceRecord::whereBetween('date', [$monthStart, $today])->sum('amount'),
        ]]);
    }

    public function recentActivity(Request $r)
    {
        $limit = min((int) $r->get('limit', 6), 20);
        $records = AttendanceRecord::orderBy('created_at', 'desc')
            ->limit($limit)
            ->get(['id', 'worker_name', 'sub_worker_name', 'is_sub_entry', 'site', 'date', 'shifts_worked', 'status', 'amount', 'created_at']);

        return response()->json(['data' => $records]);
    }

    public function index(Request $r)
    {
        if ($r->trashed) {
            $q = AttendanceRecord::onlyTrashed();
        } else {
            $q = AttendanceRecord::query();
        }

        if ($r->date)      $q->where('date', $r->date);
        if ($r->from_date) $q->where('date', '>=', $r->from_date);
        if ($r->to_date)   $q->where('date', '<=', $r->to_date);
        if ($r->worker_id) $q->where('worker_id', $r->worker_id);

        $records = $q->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $records]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'worker_id'       => 'required|exists:workers,id',
            'bio_data_id'     => 'nullable|exists:bio_data,id',
            'date'            => 'required|date',
            'shifts_worked'   => 'nullable|in:0.5,1,1.5,2,2.5,3',
            'sub_worker_name' => 'nullable|string|max:150',
            'manual_amount'   => 'nullable|numeric|min:0.01',
            'daily_rate'      => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string|max:500',
        ]);

        $worker     = Worker::findOrFail($data['worker_id']);
        $subName    = isset($data['sub_worker_name']) ? trim((string) $data['sub_worker_name']) : '';
        $isSubEntry = $subName !== '';

        if ($isSubEntry) {
            if (empty($data['manual_amount'])) {
                return response()->json(['error' => 'Amount is required for a sub-worker entry.'], 422);
            }
            $shifts  = (float) ($data['shifts_worked'] ?? 1);
            $effRate = 0;
            $amount  = round((float) $data['manual_amount'], 2);

            // Remember this sub name for the worker (dropdown next time)
            \App\Models\WorkerSubName::firstOrCreate(
                ['worker_id' => $worker->id, 'sub_name' => $subName],
                ['is_active' => true, 'created_by' => Auth::id()]
            );
        } else {
            // NORMAL ENTRY (worker's own attendance): shifts × daily rate. The rate
            // defaults to the worker's saved rate but can be overridden per entry
            // (e.g. a worker who's sometimes paid ₹500/day and sometimes ₹700/day
            // depending on the job that day) without changing the worker's own
            // saved daily_rate record.
            if (empty($data['shifts_worked'])) {
                return response()->json(['error' => 'Shifts are required.'], 422);
            }
            $shifts  = (float) $data['shifts_worked'];
            $effRate = isset($data['daily_rate']) && $data['daily_rate'] !== ''
                ? (float) $data['daily_rate']
                : ($worker->effective_daily_rate ?? $worker->daily_rate ?? 0);
            $amount  = round($shifts * $effRate, 2);
        }

        // Resolve client name snapshot
        $clientName = null;
        if (!empty($data['bio_data_id'])) {
            $bio = BioData::find($data['bio_data_id']);
            $clientName = $bio ? $bio->name : null;
        }

        $record = AttendanceRecord::create([
            'worker_id'       => $data['worker_id'],
            'date'            => $data['date'],
            'bio_data_id'     => $data['bio_data_id'] ?? null,
            'client_name'     => $clientName,
            'worker_name'     => $worker->name,
            'sub_worker_name' => $isSubEntry ? $subName : null,
            'is_sub_entry'    => $isSubEntry,
            'worker_code'   => $worker->worker_code,
            'worker_type'   => $worker->worker_type ?? 'labour',
            'trade'         => $worker->trade ?? '',
            'site'          => $worker->site ?? '',
            'shifts_worked' => $shifts,
            'status'        => 'present',
            'daily_rate'    => $effRate,
            'amount'        => $amount,
            'notes'         => $data['notes'] ?? null,
            'created_by'    => Auth::id(),
            'created_by_name' => Auth::user()?->name,
        ]);

        return response()->json(
            ['data' => $record, 'message' => 'Attendance saved'],
            201
        );
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    public function update(Request $r, $id)
    {
        $record = AttendanceRecord::findOrFail($id);

        $data = $r->validate([
            'bio_data_id'     => 'nullable|exists:bio_data,id',
            'shifts_worked'   => 'nullable|in:0.5,1,1.5,2,2.5,3',
            'sub_worker_name' => 'nullable|string|max:150',
            'manual_amount'   => 'nullable|numeric|min:0.01',
            'daily_rate'      => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string|max:500',
        ]);

        $subName    = isset($data['sub_worker_name']) ? trim((string) $data['sub_worker_name']) : '';
        $isSubEntry = $subName !== '';

        if ($isSubEntry) {
            if (empty($data['manual_amount'])) {
                return response()->json(['error' => 'Amount is required for a sub-worker entry.'], 422);
            }
            $shifts  = (float) ($data['shifts_worked'] ?? $record->shifts_worked ?? 1);
            $amount  = round((float) $data['manual_amount'], 2);
            $effRate = 0; // rate not applicable for sub entries

            \App\Models\WorkerSubName::firstOrCreate(
                ['worker_id' => $record->worker_id, 'sub_name' => $subName],
                ['is_active' => true, 'created_by' => Auth::id()]
            );
        } else {
            if (empty($data['shifts_worked'])) {
                return response()->json(['error' => 'Shifts are required.'], 422);
            }
            $shifts  = (float) $data['shifts_worked'];
            $effRate = isset($data['daily_rate']) && $data['daily_rate'] !== ''
                ? (float) $data['daily_rate']
                : $record->daily_rate;
            $amount  = round($shifts * $effRate, 2);
        }

        // Update client snapshot if bio_data_id changed
        $clientName = $record->client_name;
        if (array_key_exists('bio_data_id', $data)) {
            if (!empty($data['bio_data_id'])) {
                $bio = BioData::find($data['bio_data_id']);
                $clientName = $bio ? $bio->name : null;
            } else {
                $clientName = null;
            }
        }

        $record->update([
            'bio_data_id'     => $data['bio_data_id'] ?? null,
            'client_name'     => $clientName,
            'sub_worker_name' => $isSubEntry ? $subName : null,
            'is_sub_entry'    => $isSubEntry,
            'shifts_worked'   => $shifts,
            'status'          => 'present',
            'daily_rate'      => $isSubEntry ? 0 : $effRate,
            'amount'          => $amount,
            'notes'           => $data['notes'] ?? null,
        ]);

        return response()->json(['data' => $record, 'message' => 'Entry updated']);
    }

    // ── SOFT DELETE ──────────────────────────────────────────────────────────
    public function destroy($id)
    {
        AttendanceRecord::findOrFail($id)->delete();
        return response()->json(['message' => 'Entry moved to trash']);
    }

    // ── RESTORE ──────────────────────────────────────────────────────────────
    public function restore($id)
    {
        $record = AttendanceRecord::onlyTrashed()->findOrFail($id);
        $record->restore();
        return response()->json(['message' => 'Entry restored']);
    }

    // ── SUB NAMES: LIST ALL (for register table) ─────────────────────────────
    // The Workforce Register's "view all" table needs to see and manage both
    // active and inactive sub-names (mirroring how it already shows inactive
    // workers with an Activate button), so it passes ?include_inactive=1.
    // Every other caller (e.g. the Attendance sub-name picker) omits it and
    // keeps getting active-only names, unchanged from before.
    public function allSubNames(Request $r)
    {
        $q = \App\Models\WorkerSubName::query();
        if (!$r->boolean('include_inactive')) {
            $q->where('is_active', true);
        }
        $names = $q->orderBy('sub_name')->get(['id', 'worker_id', 'sub_name', 'daily_rate', 'is_active']);

        return response()->json(['data' => $names]);
    }

    // ── SUB NAMES: LIST PER WORKER ───────────────────────────────────────────
    public function subNames($workerId)
    {
        $names = \App\Models\WorkerSubName::where('worker_id', $workerId)
            ->where('is_active', true)
            ->orderBy('sub_name')
            ->get(['id', 'worker_id', 'sub_name', 'daily_rate']);

        return response()->json(['data' => $names]);
    }

    // ── SUB NAMES: ADD NEW ───────────────────────────────────────────────────
    public function storeSubName(Request $r, $workerId)
    {
        Worker::findOrFail($workerId);

        $data = $r->validate([
            'sub_name'   => 'required|string|max:150',
            'daily_rate' => 'nullable|numeric|min:0',
        ]);

        $name = trim($data['sub_name']);
        if ($name === '') {
            return response()->json(['error' => 'Sub name cannot be empty.'], 422);
        }

        $sub = \App\Models\WorkerSubName::firstOrCreate(
            ['worker_id' => $workerId, 'sub_name' => $name],
            ['is_active' => true, 'created_by' => Auth::id(), 'daily_rate' => $data['daily_rate'] ?? null]
        );
        // If it already existed and a rate was sent this time, keep it up to date.
        if (isset($data['daily_rate']) && $data['daily_rate'] !== '' && (float) $sub->daily_rate !== (float) $data['daily_rate']) {
            $sub->update(['daily_rate' => $data['daily_rate']]);
        }

        return response()->json(['data' => $sub, 'message' => 'Sub name saved'], 201);
    }

    // ── SUB NAMES: UPDATE RATE ────────────────────────────────────────────────
    public function updateSubName(Request $r, $workerId, $subId)
    {
        $sub = \App\Models\WorkerSubName::where('worker_id', $workerId)->findOrFail($subId);

        $data = $r->validate([
            'daily_rate' => 'nullable|numeric|min:0',
        ]);

        $sub->update(['daily_rate' => $data['daily_rate'] ?? null]);
        return response()->json(['data' => $sub, 'message' => 'Sub name rate updated']);
    }

    // ── SUB NAMES: REMOVE ────────────────────────────────────────────────────
    public function deleteSubName($workerId, $subId)
    {
        $sub = \App\Models\WorkerSubName::where('worker_id', $workerId)->findOrFail($subId);
        $sub->update(['is_active' => false]);
        return response()->json(['message' => 'Sub name removed']);
    }

    // ── SUB NAMES: TOGGLE ACTIVE/INACTIVE ─────────────────────────────────────
    // Same mental model as the worker's own toggle-status button — a sub
    // name (referred/temporary worker) can leave and come back without
    // losing their record or saved rate.
    public function toggleSubNameStatus($workerId, $subId)
    {
        $sub = \App\Models\WorkerSubName::where('worker_id', $workerId)->findOrFail($subId);
        $sub->update(['is_active' => !$sub->is_active]);
        return response()->json([
            'data' => $sub,
            'message' => $sub->is_active ? 'Sub name activated' : 'Sub name deactivated',
        ]);
    }
}
