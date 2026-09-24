<?php

namespace App\Http\Controllers;

use App\Models\LabourWeeklyBill;
use App\Models\LabourWeeklyPayment;
use App\Models\AttendanceRecord;
use App\Models\Worker;
use App\Models\LabourPaymentSession;
use App\Models\LabourPaymentAllocation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\WhatsAppService;

class LabourPaymentController extends Controller
{
    // ═══════════════════════════════════════════════════════════════════════════
    //  NEW: WORKER-CENTRIC PAYMENT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    // ── SETUP TABLES (call once if migrating) ─────────────────────────────────
    public function setupTables(): JsonResponse
    {
        $created = [];
        try {
            if (!Schema::hasTable('labour_payment_sessions')) {
                Schema::create('labour_payment_sessions', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('worker_id');
                    $table->string('worker_name');
                    $table->decimal('total_amount', 12, 2)->default(0);
                    $table->enum('payment_mode', ['cash','bank_transfer','upi','cheque','other'])->default('cash');
                    $table->text('notes')->nullable();
                    $table->timestamp('paid_at')->nullable();
                    $table->unsignedBigInteger('created_by')->nullable();
                    $table->timestamps();
                    $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
                });
                $created[] = 'labour_payment_sessions';
            }

            if (!Schema::hasTable('labour_payment_allocations')) {
                Schema::create('labour_payment_allocations', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('session_id');
                    $table->string('client_name');
                    $table->string('sub_worker_name', 150)->nullable();
                    $table->decimal('shifts_total', 8, 2)->default(0);
                    $table->decimal('earned_total', 12, 2)->default(0);
                    $table->decimal('outstanding_before', 12, 2)->default(0);
                    $table->decimal('allocated', 12, 2)->default(0);
                    $table->decimal('outstanding_after', 12, 2)->default(0);
                    $table->boolean('is_closed')->default(false);
                    $table->timestamps();
                    $table->foreign('session_id')->references('id')->on('labour_payment_sessions')->onDelete('cascade');
                });
                $created[] = 'labour_payment_allocations';
            }

            return response()->json([
                'message' => empty($created) ? 'Tables already exist — all good!' : 'Tables created: ' . implode(', ', $created),
                'created' => $created,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ── WORKER LIST WITH BALANCES ─────────────────────────────────────────────
    public function paymentWorkerList(): JsonResponse
    {
        $workers = Worker::where('is_active', true)->orderBy('name')->get();
        $ids = $workers->pluck('id');

        // Batched aggregates keyed by worker_id, instead of running the same
        // handful of queries once per worker (was up to 7 queries/worker,
        // including two uncached Schema::hasTable() calls, i.e. 500-700+
        // round trips for ~100 workers).
        $hasSessions = Schema::hasTable('labour_payment_sessions');

        $earnedByWorker = AttendanceRecord::whereIn('worker_id', $ids)
            ->selectRaw('worker_id, SUM(amount) as total')
            ->groupBy('worker_id')
            ->pluck('total', 'worker_id');

        $paidByWorker = $hasSessions
            ? LabourPaymentSession::whereIn('worker_id', $ids)
                ->selectRaw('worker_id, SUM(total_amount) as total')
                ->groupBy('worker_id')
                ->pluck('total', 'worker_id')
            : collect();

        $clientsByWorker = AttendanceRecord::whereIn('worker_id', $ids)
            ->whereNotNull('client_name')
            ->select('worker_id', 'client_name')
            ->distinct()
            ->get()
            ->groupBy('worker_id')
            ->map(fn ($rows) => $rows->pluck('client_name')->values());

        $lastSessionByWorker = $hasSessions
            ? LabourPaymentSession::whereIn('worker_id', $ids)
                ->orderByDesc('paid_at')
                ->get()
                ->groupBy('worker_id')
                ->map(fn ($rows) => $rows->first())
            : collect();

        $recentShiftsByWorker = AttendanceRecord::whereIn('worker_id', $ids)
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->selectRaw('worker_id, SUM(shifts_worked) as total')
            ->groupBy('worker_id')
            ->pluck('total', 'worker_id');

        $result = $workers->map(function ($worker) use (
            $earnedByWorker, $paidByWorker, $clientsByWorker, $lastSessionByWorker, $recentShiftsByWorker
        ) {
            $totalEarned = (float) ($earnedByWorker[$worker->id] ?? 0);
            $totalPaid   = (float) ($paidByWorker[$worker->id] ?? 0);
            $balance     = max(0, $totalEarned - $totalPaid);
            $clients     = $clientsByWorker->get($worker->id, collect());
            $lastSession = $lastSessionByWorker->get($worker->id);

            return [
                'id'              => $worker->id,
                'name'            => $worker->name,
                'trade'           => $worker->trade,
                'daily_rate'      => (float) $worker->daily_rate,
                'salary_type'     => $worker->salary_type,
                'monthly_salary'  => (float) $worker->monthly_salary,
                'total_earned'    => $totalEarned,
                'total_paid'      => $totalPaid,
                'balance'         => $balance,
                'clients'         => $clients,
                'clients_count'   => $clients->count(),
                'last_payment_at' => $lastSession?->paid_at,
                'recent_shifts'   => (float) ($recentShiftsByWorker[$worker->id] ?? 0),
            ];
        });

        $totalUnpaid     = $result->sum('balance');
        $workersUnpaid   = $result->where('balance', '>', 0)->count();
        $totalEarnedAll  = $result->sum('total_earned');
        $totalPaidAll    = $result->sum('total_paid');

        return response()->json([
            'data'    => $result->values(),
            'summary' => [
                'total_earned'    => $totalEarnedAll,
                'total_paid'      => $totalPaidAll,
                'total_unpaid'    => $totalUnpaid,
                'workers_unpaid'  => $workersUnpaid,
                'workers_clear'   => $result->count() - $workersUnpaid,
                'total_workers'   => $result->count(),
            ],
        ]);
    }

    // ── WORKER DETAIL WITH CLIENT BREAKDOWN ───────────────────────────────────
    public function paymentWorkerDetail(int $workerId): JsonResponse
    {
        $worker = Worker::findOrFail($workerId);

        // Per client, per person (own worker + each sub-worker) — FIFO order,
        // with legacy blanket-settled amounts folded in oldest-person-first.
        $clientBreakdown = collect($this->buildPersonBreakdown($workerId));

        $totalEarned = $clientBreakdown->sum('earned');
        $totalPaid   = $clientBreakdown->sum('paid');
        $balance     = max(0, $totalEarned - $totalPaid);

        // Payment history
        $sessions = collect();
        if (Schema::hasTable('labour_payment_sessions')) {
            $sessions = LabourPaymentSession::where('worker_id', $workerId)
                ->with('allocations')
                ->orderByDesc('paid_at')
                ->get();
        }

        // Own work vs sub-worker earnings breakdown
        $earningsBreakdown = null;
        if (Schema::hasColumn('attendance_records', 'sub_worker_name')) {
            $rows = AttendanceRecord::where('worker_id', $workerId)
                ->select(
                    DB::raw("COALESCE(sub_worker_name, '__OWN__') as person"),
                    DB::raw('SUM(shifts_worked) as shifts'),
                    DB::raw('COUNT(*) as entries'),
                    DB::raw('SUM(amount) as earned')
                )
                ->groupBy(DB::raw("COALESCE(sub_worker_name, '__OWN__')"))
                ->get();

            $own  = $rows->firstWhere('person', '__OWN__');
            $subs = $rows->filter(fn ($r) => $r->person !== '__OWN__')
                ->map(fn ($r) => [
                    'sub_name' => $r->person,
                    'shifts'   => (float) $r->shifts,
                    'entries'  => (int) $r->entries,
                    'earned'   => (float) $r->earned,
                ])->values();

            $earningsBreakdown = [
                'own' => [
                    'shifts'  => (float) ($own->shifts ?? 0),
                    'entries' => (int) ($own->entries ?? 0),
                    'earned'  => (float) ($own->earned ?? 0),
                ],
                'subs'       => $subs,
                'sub_earned' => (float) $subs->sum('earned'),
            ];
        }

        return response()->json([
            'data' => [
                'worker'             => $worker,
                'client_breakdown'   => $clientBreakdown,
                'earnings_breakdown' => $earningsBreakdown,
                'total_earned'       => $totalEarned,
                'total_paid'         => $totalPaid,
                'balance'            => $balance,
                'sessions'           => $sessions,
            ],
        ]);
    }

    // ── PER-CLIENT × PER-PERSON BREAKDOWN (own worker + each sub-worker) ──────
    // Shared by paymentWorkerDetail() and recordWorkerPayment(). Returns clients
    // in FIFO order (oldest work first), each with a `persons` list (also FIFO
    // within that client) covering the head worker's own attendance ('__OWN__')
    // and every sub-worker referred under them. Payments recorded before this
    // per-person tracking existed are blanket, client-level amounts (no person
    // tag) — those are folded in against the oldest person's balance first so
    // historical totals stay correct without needing a data backfill.
    private function buildPersonBreakdown(int $workerId): array
    {
        $rows = AttendanceRecord::where('worker_id', $workerId)
            ->select(
                DB::raw("COALESCE(client_name, 'Unknown') as client_name"),
                DB::raw("COALESCE(sub_worker_name, '__OWN__') as person"),
                DB::raw('SUM(shifts_worked) as shifts'),
                DB::raw('SUM(amount) as earned'),
                DB::raw('MIN(date) as first_date')
            )
            ->groupBy(DB::raw("COALESCE(client_name, 'Unknown')"), DB::raw("COALESCE(sub_worker_name, '__OWN__')"))
            ->orderBy('first_date')
            ->get();

        $paidSpecific = collect();
        $paidLegacy   = collect();
        if (Schema::hasTable('labour_payment_allocations')) {
            if (Schema::hasColumn('labour_payment_allocations', 'sub_worker_name')) {
                $paidSpecific = DB::table('labour_payment_allocations as lpa')
                    ->join('labour_payment_sessions as lps', 'lpa.session_id', '=', 'lps.id')
                    ->where('lps.worker_id', $workerId)
                    ->whereNotNull('lpa.sub_worker_name')
                    ->select('lpa.client_name', 'lpa.sub_worker_name', DB::raw('SUM(lpa.allocated) as total_paid'))
                    ->groupBy('lpa.client_name', 'lpa.sub_worker_name')
                    ->get()
                    ->keyBy(fn ($r) => $r->client_name . '||' . $r->sub_worker_name);

                $paidLegacy = DB::table('labour_payment_allocations as lpa')
                    ->join('labour_payment_sessions as lps', 'lpa.session_id', '=', 'lps.id')
                    ->where('lps.worker_id', $workerId)
                    ->whereNull('lpa.sub_worker_name')
                    ->select('lpa.client_name', DB::raw('SUM(lpa.allocated) as total_paid'))
                    ->groupBy('lpa.client_name')
                    ->get()
                    ->keyBy('client_name');
            } else {
                $paidLegacy = DB::table('labour_payment_allocations as lpa')
                    ->join('labour_payment_sessions as lps', 'lpa.session_id', '=', 'lps.id')
                    ->where('lps.worker_id', $workerId)
                    ->select('lpa.client_name', DB::raw('SUM(lpa.allocated) as total_paid'))
                    ->groupBy('lpa.client_name')
                    ->get()
                    ->keyBy('client_name');
            }
        }

        $clients = [];
        foreach ($rows->groupBy('client_name') as $clientName => $persons) {
            $remainingLegacy = (float) ($paidLegacy[$clientName]->total_paid ?? 0);
            $personList = [];

            foreach ($persons->sortBy('first_date')->values() as $p) {
                $earned = (float) $p->earned;
                $paid   = (float) ($paidSpecific[$clientName . '||' . $p->person]->total_paid ?? 0);

                $stillOwed = max(0, $earned - $paid);
                if ($remainingLegacy > 0.005 && $stillOwed > 0.005) {
                    $take = min($remainingLegacy, $stillOwed);
                    $paid += $take;
                    $remainingLegacy = round($remainingLegacy - $take, 4);
                }

                $personList[] = [
                    'person'      => $p->person,
                    'is_own'      => $p->person === '__OWN__',
                    'shifts'      => (float) $p->shifts,
                    'earned'      => $earned,
                    'paid'        => round($paid, 2),
                    'outstanding' => round(max(0, $earned - $paid), 2),
                    'first_date'  => $p->first_date,
                ];
            }

            $clientEarned = array_sum(array_column($personList, 'earned'));
            $clientPaid   = array_sum(array_column($personList, 'paid'));

            $clients[] = [
                'client_name' => $clientName,
                'shifts'      => array_sum(array_column($personList, 'shifts')),
                'earned'      => $clientEarned,
                'paid'        => round($clientPaid, 2),
                'outstanding' => round(max(0, $clientEarned - $clientPaid), 2),
                'first_date'  => $persons->min('first_date'),
                'persons'     => $personList,
            ];
        }

        usort($clients, fn ($a, $b) => strcmp($a['first_date'] ?? '', $b['first_date'] ?? ''));

        return $clients;
    }

    // ── RECORD WORKER PAYMENT (selected labour · ordered FIFO close) ──────────
    public function recordWorkerPayment(Request $request, int $workerId): JsonResponse
    {
        $worker = Worker::findOrFail($workerId);

        $data = $request->validate([
            'amount'       => 'required|numeric|min:0.01',
            'payment_mode' => 'nullable|in:cash,bank_transfer,upi,neft,cheque,other',
            'notes'        => 'nullable|string|max:500',
            'clients'      => 'required|array|min:1',
            'clients.*'    => 'string',
            // Optional, granular selection: "Client Name::__OWN__" or
            // "Client Name::sub-worker-name" — which specific labour (head
            // worker or a named sub-worker) to settle within each client.
            // Falls back to settling the whole client when omitted, for
            // backward compatibility.
            'persons'      => 'nullable|array',
            'persons.*'    => 'string',
        ]);

        $totalPayment    = (float) $data['amount'];
        $selectedClients = array_map('strval', $data['clients']);
        $selectedPersons = (!empty($data['persons'])) ? array_map('strval', $data['persons']) : null;

        $clientBreakdown = $this->buildPersonBreakdown($workerId);

        $allTargets = [];
        foreach ($clientBreakdown as $client) {
            foreach ($client['persons'] as $p) {
                $allTargets[] = [
                    'key'         => $client['client_name'] . '::' . $p['person'],
                    'client_name' => $client['client_name'],
                    'person'      => $p['person'],
                    'shifts'      => $p['shifts'],
                    'earned'      => $p['earned'],
                    'outstanding' => $p['outstanding'],
                    'first_date'  => $p['first_date'],
                ];
            }
        }
        usort($allTargets, fn ($a, $b) => strcmp($a['first_date'] ?? '', $b['first_date'] ?? ''));

        $openTargets = array_values(array_filter($allTargets, fn ($t) => $t['outstanding'] > 0.005));
        if (empty($openTargets)) {
            return response()->json(['error' => 'No outstanding balance for this worker.'], 422);
        }

        if ($selectedPersons !== null) {
            $chosen = array_values(array_filter($openTargets, fn ($t) => in_array($t['key'], $selectedPersons, true)));
            $errorLabel = 'Selected labour has no outstanding balance.';
        } else {
            $chosen = array_values(array_filter($openTargets, fn ($t) => in_array($t['client_name'], $selectedClients, true)));
            $errorLabel = 'Selected clients have no outstanding balance.';
        }

        if (empty($chosen)) {
            return response()->json(['error' => $errorLabel], 422);
        }

        $chosenTotal = array_sum(array_column($chosen, 'outstanding'));
        if ($totalPayment > $chosenTotal + 0.005) {
            $label = $selectedPersons !== null ? 'the selected labour' : 'the selected clients';
            return response()->json([
                'error' => 'Amount ₹' . number_format($totalPayment, 2)
                    . ' exceeds the outstanding ₹' . number_format($chosenTotal, 2)
                    . " of {$label}. Select more or reduce the amount.",
            ], 422);
        }

        // Ordered (FIFO) split — reuse orderedSplit() with the composite client::person key
        $splitInput = array_map(fn ($t) => ['name' => $t['key'], 'outstanding' => $t['outstanding']], $chosen);
        $split = $this->orderedSplit($splitInput, $totalPayment);

        DB::beginTransaction();
        try {
            $session = LabourPaymentSession::create([
                'worker_id'    => $workerId,
                'worker_name'  => $worker->name,
                'total_amount' => $totalPayment,
                'payment_mode' => $data['payment_mode'] ?? 'cash',
                'notes'        => $data['notes'] ?? null,
                'paid_at'      => now(),
                'created_by'   => Auth::id(),
                'created_by_name' => Auth::user()?->name,
            ]);

            // Save a row for every client×person combo (0-allocated where not chosen) for full audit trail.
            foreach ($allTargets as $t) {
                $alloc = $split[$t['key']] ?? [
                    'outstanding_before' => $t['outstanding'],
                    'allocated'          => 0.0,
                    'outstanding_after'  => $t['outstanding'],
                    'is_closed'          => $t['outstanding'] <= 0.005,
                ];

                LabourPaymentAllocation::create([
                    'session_id'         => $session->id,
                    'client_name'        => $t['client_name'],
                    'sub_worker_name'    => $t['person'],
                    'shifts_total'       => $t['shifts'],
                    'earned_total'       => $t['earned'],
                    'outstanding_before' => $alloc['outstanding_before'] ?? $t['outstanding'],
                    'allocated'          => $alloc['allocated'],
                    'outstanding_after'  => $alloc['outstanding_after'],
                    'is_closed'          => $alloc['is_closed'],
                ]);
            }

            DB::commit();

            return $this->paymentWorkerDetail($workerId);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Payment failed: ' . $e->getMessage()], 500);
        }
    }

    // ── ORDERED (FIFO) SPLIT — allocate to selected targets, oldest work first ─
    private function orderedSplit(array $items, float $totalPayment): array
    {
        $results   = [];
        $remaining = $totalPayment;

        foreach ($items as $c) {
            $take = round(min($remaining, $c['outstanding']), 2);
            $after = round(max(0, $c['outstanding'] - $take), 2);

            $results[$c['name']] = [
                'outstanding_before' => $c['outstanding'],
                'allocated'          => $take,
                'outstanding_after'  => $after,
                'is_closed'          => $after <= 0.005,
            ];

            $remaining = round($remaining - $take, 4);
            if ($remaining <= 0.005) {
                $remaining = 0;
            }
        }

        return $results;
    }

    // ── DELETE PAYMENT SESSION ────────────────────────────────────────────────
    public function deletePaymentSession(int $sessionId): JsonResponse
    {
        $session = LabourPaymentSession::findOrFail($sessionId);
        $session->delete(); // allocations cascade
        return response()->json(['message' => 'Payment deleted successfully']);
    }

    // ── ALL PAYMENT SESSIONS — every worker, full history, with allocations ───
    public function paymentSessionsList(Request $request): JsonResponse
    {
        if (!Schema::hasTable('labour_payment_sessions')) {
            return response()->json(['data' => [], 'summary' => [
                'total_amount' => 0, 'sessions_count' => 0, 'workers_paid' => 0, 'by_mode' => [],
            ]]);
        }

        $q = LabourPaymentSession::with('allocations')->orderByDesc('paid_at');

        if ($request->filled('worker_id')) {
            $q->where('worker_id', (int) $request->worker_id);
        }
        if ($request->filled('mode')) {
            $q->where('payment_mode', $request->mode);
        }
        if ($request->filled('from_date')) {
            $q->whereDate('paid_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $q->whereDate('paid_at', '<=', $request->to_date);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(function ($w) use ($s) {
                $w->where('worker_name', 'like', "%{$s}%")
                  ->orWhere('notes', 'like', "%{$s}%")
                  ->orWhereHas('allocations', function ($a) use ($s) {
                      $a->where('client_name', 'like', "%{$s}%");
                  });
            });
        }

        $sessions = $q->get()->map(function ($s) {
            $clients = $s->allocations->where('allocated', '>', 0)->values();
            return [
                'id'            => $s->id,
                'worker_id'     => $s->worker_id,
                'worker_name'   => $s->worker_name,
                'total_amount'  => (float) $s->total_amount,
                'payment_mode'  => $s->payment_mode,
                'notes'         => $s->notes,
                'paid_at'       => $s->paid_at,
                'created_by_name' => $s->created_by_name,
                'clients_count' => $clients->count(),
                'clients'       => $clients->map(fn ($a) => [
                    'client_name'        => $a->client_name,
                    'sub_worker_name'    => $a->sub_worker_name, // '__OWN__', a specific sub-worker, or null for pre-migration blanket payments
                    'shifts_total'       => (float) $a->shifts_total,
                    'allocated'          => (float) $a->allocated,
                    'outstanding_before' => (float) $a->outstanding_before,
                    'outstanding_after'  => (float) $a->outstanding_after,
                    'is_closed'          => (bool) $a->is_closed,
                ])->values(),
            ];
        });

        $byMode = $sessions->groupBy('payment_mode')->map(function ($rows, $mode) {
            return [
                'mode'   => $mode,
                'count'  => $rows->count(),
                'amount' => round($rows->sum('total_amount'), 2),
            ];
        })->values();

        return response()->json([
            'data' => $sessions->values(),
            'summary' => [
                'total_amount'   => round($sessions->sum('total_amount'), 2),
                'sessions_count' => $sessions->count(),
                'workers_paid'   => $sessions->pluck('worker_id')->unique()->count(),
                'by_mode'        => $byMode,
            ],
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  LEGACY: WEEKLY BILL SYSTEM (kept for backward compatibility)
    // ═══════════════════════════════════════════════════════════════════════════

    public function index(): JsonResponse
    {
        $bills = LabourWeeklyBill::orderByDesc('week_start')->withCount('payments')->get();
        return response()->json(['data' => $bills]);
    }

    public function show(int $id): JsonResponse
    {
        $bill = LabourWeeklyBill::with([
            'payments' => fn ($q) => $q->orderBy('worker_name'),
        ])->findOrFail($id);

        $attendance = AttendanceRecord::whereBetween('date', [
            $bill->week_start->toDateString(),
            $bill->week_end->toDateString(),
        ])
        ->select('worker_id', 'date', 'shifts_worked', 'amount', 'client_name')
        ->orderBy('date')
        ->get()
        ->groupBy('worker_id');

        $bill->attendance_map = $attendance;

        return response()->json(['data' => $bill]);
    }

    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'week_start' => 'required|date',
            'week_end'   => 'required|date|after_or_equal:week_start',
        ]);

        $weekStart = Carbon::parse($data['week_start'])->toDateString();
        $weekEnd   = Carbon::parse($data['week_end'])->toDateString();

        if (LabourWeeklyBill::where('week_start', $weekStart)->where('week_end', $weekEnd)->exists()) {
            return response()->json(['error' => 'A bill already exists for this week range.'], 409);
        }

        $records = AttendanceRecord::whereBetween('date', [$weekStart, $weekEnd])
            ->select('worker_id','worker_name','daily_rate',
                DB::raw('SUM(shifts_worked) as total_shifts'),
                DB::raw('SUM(amount) as total_earned'))
            ->groupBy('worker_id','worker_name','daily_rate')
            ->get();

        if ($records->isEmpty()) {
            return response()->json(['error' => 'No attendance records found for this date range.'], 422);
        }

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
                'created_by'    => Auth::id(),
            ]);

            // Batch-fetch every worker's most recent prior-week balance in one
            // query instead of one query per worker inside the loop below (was a
            // real N+1 — flagged in the 2026-09-21 speed pass, fixed here).
            $workerIds = $records->pluck('worker_id')->all();
            $prevBalancesByWorker = LabourWeeklyPayment::whereIn('worker_id', $workerIds)
                ->whereHas('bill', fn ($q) => $q->where('week_end', '<', $weekStart))
                ->orderByDesc('id')
                ->get(['worker_id', 'balance_carried'])
                ->groupBy('worker_id')
                ->map(fn ($rows) => (float) ($rows->first()->balance_carried ?? 0));

            foreach ($records as $rec) {
                $prevBalance = (float) ($prevBalancesByWorker[$rec->worker_id] ?? 0);

                $totalDue = (float) $rec->total_earned + $prevBalance;

                LabourWeeklyPayment::create([
                    'bill_id'         => $bill->id,
                    'worker_id'       => $rec->worker_id,
                    'worker_name'     => $rec->worker_name,
                    'daily_rate'      => (float) $rec->daily_rate,
                    'total_shifts'    => (float) $rec->total_shifts,
                    'total_earned'    => (float) $rec->total_earned,
                    'previous_balance'=> $prevBalance,
                    'total_due'       => $totalDue,
                    'amount_paid'     => 0,
                    'balance_carried' => $totalDue,
                    'status'          => 'pending',
                ]);
            }

            $totalDueAll = (float) $bill->payments()->sum('total_due');
            $bill->update(['total_balance' => $totalDueAll]);

            DB::commit();
            return response()->json(['data' => $bill->load('payments'), 'message' => 'Bill generated'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function recordPayments(Request $request, int $billId): JsonResponse
    {
        $bill = LabourWeeklyBill::findOrFail($billId);
        $data = $request->validate([
            'payments'                => 'required|array|min:1',
            'payments.*.id'           => 'required|integer|exists:labour_weekly_payments,id',
            'payments.*.amount_paid'  => 'required|numeric|min:0',
            'payments.*.payment_mode' => 'nullable|in:cash,bank_transfer,upi,neft,cheque,other',
            'payments.*.notes'        => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            foreach ($data['payments'] as $p) {
                $payment = LabourWeeklyPayment::findOrFail($p['id']);
                $paid    = (float) $p['amount_paid'];
                $balance = max(0, $payment->total_due - $paid);
                $status  = $paid <= 0 ? 'pending' : ($balance <= 0 ? 'paid' : 'partial');
                $payment->update([
                    'amount_paid'     => $paid,
                    'balance_carried' => $balance,
                    'payment_mode'    => $p['payment_mode'] ?? 'cash',
                    'notes'           => $p['notes'] ?? null,
                    'paid_at'         => $paid > 0 ? now() : null,
                    'status'          => $status,
                ]);
            }

            $totalPaid    = (float) $bill->payments()->sum('amount_paid');
            $totalDue     = (float) $bill->payments()->sum('total_due');
            $totalBalance = max(0, $totalDue - $totalPaid);
            $allPaid      = $bill->payments()->where('status','!=','paid')->doesntExist();

            $bill->update([
                'total_paid'    => $totalPaid,
                'total_balance' => $totalBalance,
                'status'        => $allPaid ? 'paid' : 'published',
            ]);

            DB::commit();
            return response()->json(['data' => $bill->load('payments'), 'message' => 'Payments recorded']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to record payments'], 500);
        }
    }

    public function sendWhatsApp(int $id): JsonResponse
    {
        $bill = LabourWeeklyBill::with(['payments' => fn ($q) => $q->orderBy('worker_name')])->findOrFail($id);
        if ($bill->payments->isEmpty()) {
            return response()->json(['error' => 'No payment rows found.'], 422);
        }
        $totalDue  = (float) $bill->payments->sum('total_due');
        $pdf       = Pdf::loadView('pdf.labour-bill', ['bill' => $bill, 'totalDue' => $totalDue])
                         ->setPaper('a4','portrait')
                         ->setOptions(['defaultFont' => 'dejavusans', 'isHtml5ParserEnabled' => true]);
        $pdfContent = $pdf->output();
        $startFmt   = Carbon::parse($bill->week_start)->format('d M Y');
        $endFmt     = Carbon::parse($bill->week_end)->format('d M Y');
        $fileName   = "Labour-Bill-{$bill->week_start}-to-{$bill->week_end}.pdf";
        $caption    = "📋 *Weekly Labour Bill — WhiteNode Software Solutions*\nWeek: {$startFmt} → {$endFmt}\nWorkers: {$bill->total_workers}  |  Due: ₹" . number_format($totalDue,2);
        $phone      = config('services.whatsapp.number');
        if (empty($phone)) {
            return response()->json(['error' => 'WHATSAPP_NUMBER not set in .env'], 422);
        }
        $wa   = new WhatsAppService();
        $sent = $wa->sendPDF($phone, $pdfContent, $fileName, $caption);
        return $sent
            ? response()->json(['message' => "PDF sent to WhatsApp (+{$phone}) successfully!"])
            : response()->json(['error' => 'WhatsApp send failed.'], 500);
    }

    public function downloadPDF(int $id): \Symfony\Component\HttpFoundation\Response
    {
        $bill     = LabourWeeklyBill::with(['payments' => fn ($q) => $q->orderBy('worker_name')])->findOrFail($id);
        $totalDue = (float) $bill->payments->sum('total_due');
        $pdf      = Pdf::loadView('pdf.labour-bill', ['bill' => $bill, 'totalDue' => $totalDue])
                        ->setPaper('a4','portrait')
                        ->setOptions(['defaultFont' => 'dejavusans', 'isHtml5ParserEnabled' => true]);
        $fileName = 'Labour-Bill-' . Carbon::parse($bill->week_start)->format('d-M-Y')
                  . '-to-' . Carbon::parse($bill->week_end)->format('d-M-Y') . '.pdf';
        return $pdf->download($fileName);
    }

    public function destroy(int $id): JsonResponse
    {
        LabourWeeklyBill::findOrFail($id)->delete();
        return response()->json(['message' => 'Bill deleted']);
    }
}
