<?php

namespace App\Http\Controllers;

use App\Models\DaybookEntry;
use App\Models\CreditVendor;
use App\Models\CreditEntry;
use App\Models\CreditPayment;
use App\Models\ClientProject;
use App\Models\ClientPayment;
use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    private function dateRange(Request $request): array
    {
        return [
            'from' => $request->get('from_date', Carbon::now()->startOfMonth()->toDateString()),
            'to'   => $request->get('to_date',   Carbon::now()->toDateString()),
        ];
    }

    private function ok(mixed $data, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    private function fail(string $message, int $status = 500): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message], $status);
    }

    public function summary(Request $request): JsonResponse
    {
        try {
            ['from' => $from, 'to' => $to] = $this->dateRange($request);

            // ── Daybook ──────────────────────────────────────────────────────
            $dbEntries = DaybookEntry::with('category')
                ->whereBetween('transaction_date', [$from, $to])
                ->get();

            $dbIncome  = 0.0;
            $dbExpense = 0.0;
            foreach ($dbEntries as $e) {
                if ($e->category?->type === 'income') {
                    $dbIncome  += (float) $e->amount;
                } else {
                    $dbExpense += (float) $e->amount;
                }
            }

            // ── Credit ───────────────────────────────────────────────────────
            // Direct DB aggregates — no N+1, no accessors needed for summary
            $crTotalCredit = (float) CreditEntry::whereNull('deleted_at')->sum('credit_amount');
            $crTotalPaid   = (float) CreditPayment::whereNull('deleted_at')->sum('amount_paid');
            $crOutstanding = round($crTotalCredit - $crTotalPaid, 2);

            // CreditEntry->is_paid uses getAmountPaidAttribute (linkedPayments sum)
            // so we eager-load linkedPayments to avoid N+1
            $crOverdueCount = CreditEntry::with('linkedPayments')
                ->whereNull('deleted_at')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', Carbon::today())
                ->get()
                ->filter(fn($e) => !$e->is_paid)
                ->count();

            $crUpcomingCount = CreditEntry::with('linkedPayments')
                ->whereNull('deleted_at')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '>=', Carbon::today())
                ->whereDate('due_date', '<=', Carbon::today()->addDays(7))
                ->get()
                ->filter(fn($e) => !$e->is_paid)
                ->count();

            $crVendorCount   = CreditVendor::whereNull('deleted_at')->count();
            $crActiveVendors = CreditVendor::whereNull('deleted_at')->where('is_active', true)->count();

            // ── Client Portal ────────────────────────────────────────────────
            // ClientProject->total_collected is an accessor (payments->sum('amount'))
            // Use direct DB aggregates here for summary speed
            $cpBudget    = (float) ClientProject::whereNull('deleted_at')->sum('total_budget');
            $cpCollected = (float) ClientPayment::whereNull('deleted_at')->sum('amount');
            $cpBalance   = round($cpBudget - $cpCollected, 2);
            $cpClients   = Client::whereNull('deleted_at')->count();
            $cpProjects  = ClientProject::whereNull('deleted_at')->count();
            $cpPct       = $cpBudget > 0 ? round(($cpCollected / $cpBudget) * 100, 2) : 0;

            return $this->ok([
                'date_range' => ['from' => $from, 'to' => $to],
                'daybook' => [
                    'income'      => round($dbIncome,  2),
                    'expense'     => round($dbExpense, 2),
                    'balance'     => round($dbIncome - $dbExpense, 2),
                    'entry_count' => $dbEntries->count(),
                ],
                'credit' => [
                    'total_credit'   => round($crTotalCredit, 2),
                    'total_paid'     => round($crTotalPaid,   2),
                    'balance'        => $crOutstanding,
                    'outstanding'    => $crOutstanding,
                    'overdue_count'  => $crOverdueCount,
                    'upcoming_count' => $crUpcomingCount,
                    'total_vendors'  => $crVendorCount,
                    'active_vendors' => $crActiveVendors,
                ],
                'portal' => [
                    'total_budget'    => round($cpBudget,    2),
                    'total_collected' => round($cpCollected, 2),
                    'total_balance'   => $cpBalance,
                    'collected_pct'   => $cpPct,
                    'total_clients'   => $cpClients,
                    'total_projects'  => $cpProjects,
                ],
            ], 'Report summary retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate summary: ' . $e->getMessage());
        }
    }

    public function daybook(Request $request): JsonResponse
    {
        try {
            ['from' => $from, 'to' => $to] = $this->dateRange($request);

            $query = DaybookEntry::with(['category', 'subCategory', 'bioData', 'subName'])
                ->whereBetween('transaction_date', [$from, $to])
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc');

            if ($mode = $request->get('payment_mode')) {
                $query->where('payment_mode', $mode);
            }
            if ($catId = $request->get('category_id')) {
                $query->where('category_id', $catId);
            }
            if ($bioId = $request->get('bio_data_id')) {
                $query->where('bio_data_id', $bioId);
            }
            if ($subNameId = $request->get('sub_name_id')) {
                $query->where('sub_name_id', $subNameId);
            }
            if ($search = $request->get('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('narration',    'like', "%{$search}%")
                        ->orWhere('client_name', 'like', "%{$search}%")
                        ->orWhereHas('bioData',     fn($b) => $b->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('category',    fn($c) => $c->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('subCategory', fn($s) => $s->where('name', 'like', "%{$search}%"))
                        ->orWhere('payment_mode',   'like', "%{$search}%");
                });
            }

            $entries = $query->get();
            $income  = 0.0;
            $expense = 0.0;

            $rows = $entries->map(function ($e) use (&$income, &$expense) {
                $type = $e->category?->type;
                if ($type === 'income') {
                    $income  += (float) $e->amount;
                } else {
                    $expense += (float) $e->amount;
                }
                return [
                    'id'                => $e->id,
                    'transaction_date'  => $e->transaction_date instanceof Carbon
                        ? $e->transaction_date->toDateString()
                        : $e->transaction_date,
                    'amount'            => (float) $e->amount,
                    'payment_mode'      => $e->payment_mode,
                    'narration'         => $e->narration,
                    'client_name'       => $e->client_name,
                    'category_id'       => $e->category_id,
                    'category_name'     => $e->category?->name,
                    'category_type'     => $e->category?->type,
                    'sub_category_id'   => $e->sub_category_id,
                    'sub_category_name' => $e->subCategory?->name,
                    'bio_data_id'       => $e->bio_data_id,
                    'bio_data_name'     => $e->bioData?->name,
                    'sub_name_id'       => $e->sub_name_id,
                    'sub_name_name'     => $e->subName?->alternate_name,
                ];
            });

            return $this->ok([
                'entries' => $rows,
                'stats'   => [
                    'income'  => round($income,  2),
                    'expense' => round($expense, 2),
                    'balance' => round($income - $expense, 2),
                    'count'   => $rows->count(),
                ],
                'filters_applied' => [
                    'from_date'    => $from,
                    'to_date'      => $to,
                    'payment_mode' => $request->get('payment_mode'),
                    'category_id'  => $request->get('category_id'),
                    'bio_data_id'  => $request->get('bio_data_id'),
                    'sub_name_id'  => $request->get('sub_name_id'),
                    'search'       => $request->get('search'),
                ],
            ], 'Daybook report retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate daybook report: ' . $e->getMessage());
        }
    }

    public function recentProjects(Request $request)
    {
        try {
            \Log::info('Recent projects endpoint called');

            $limit = min((int) $request->get('limit', 10), 50);

            $projects = ClientProject::with(['client', 'payments'])
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            \Log::info('Found ' . $projects->count() . ' projects');

            $formatted = $projects->map(function ($project) {
                $collected = (float) $project->payments->sum('amount');
                $budget = (float) $project->total_budget;

                return [
                    'id' => $project->id,
                    'project_name' => $project->project_name,
                    'client_name' => $project->client->name ?? 'Unknown',
                    'client_id' => $project->client_id,
                    'project_type' => $project->project_type,
                    'status' => $project->status,
                    'total_budget' => $budget,
                    'collected' => $collected,
                    'balance' => $budget - $collected,
                    'raw_budget' => $budget,
                    'created_at' => $project->created_at,
                    'payments' => $project->payments->map(function ($pm) {
                        return [
                            'id' => $pm->id,
                            'payment_date' => $pm->payment_date,
                            'amount' => (float) $pm->amount,
                            'gst_amount' => (float) ($pm->gst_amount ?? 0),
                            'total_amount' => (float) ($pm->amount + ($pm->gst_amount ?? 0)),
                            'payment_mode' => $pm->payment_mode,
                            'mode_label' => $pm->mode_label,
                            'reference_number' => $pm->reference_number,
                            'notes' => $pm->notes,
                        ];
                    }),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formatted
            ]);
        } catch (\Exception $e) {
            \Log::error('Recent projects error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    public function credit(Request $request): JsonResponse
    {
        try {
            $query = CreditVendor::with([
                'category:id,name',
                'subCategory:id,name',
                'bioData:id,name',
                'creditEntries.linkedPayments',
                'creditPayments',
            ])
                ->whereNull('credit_vendors.deleted_at');

            if ($catId = $request->get('category_id')) {
                $query->where('category_id', $catId);
            }
            if ($subCatId = $request->get('sub_category_id')) {
                $query->where('sub_category_id', $subCatId);
            }
            // active / inactive filter (balance/overdue/partial handled after map)
            if (in_array($request->get('status'), ['active', 'inactive'])) {
                $active = $request->get('status') === 'active';
                $query->where('is_active', $active);
            }

            $vendors = $query->orderBy('party_name')->get();

            $rows = $vendors->map(function ($v) {
                // ── CreditVendor accessors ────────────────────────────────
                // NOTE: because we eager-loaded creditEntries.linkedPayments
                // and creditPayments, the accessors use the in-memory collections
                // and make ZERO extra DB queries
                $totalCredit = $v->total_credit;    // accessor
                $totalPaid   = $v->total_paid;      // accessor
                $balance     = $v->balance;         // accessor
                $status      = $v->status;          // accessor: clear|overdue|partial|pending
                $daysOverdue = $v->days_overdue;    // accessor: int

                // ── CreditEntry rows ──────────────────────────────────────
                $entries = $v->creditEntries->map(fn($e) => [
                    'id'            => $e->id,
                    'client_name'   => $e->client_name,
                    'credit_date'   => $e->credit_date instanceof Carbon
                        ? $e->credit_date->toDateString()
                        : $e->credit_date,
                    'bill_number'   => $e->bill_number,
                    'description'   => $e->description,
                    'credit_amount' => (float) $e->credit_amount,
                    'due_date'      => $e->due_date instanceof Carbon
                        ? $e->due_date->toDateString()
                        : $e->due_date,
                    'priority'      => $e->priority ?? 'medium',
                    'notes'         => $e->notes,
                    // All from CreditEntry accessors (no extra queries — linkedPayments eager-loaded)
                    'amount_paid'   => $e->amount_paid,
                    'bill_balance'  => $e->bill_balance,
                    'is_paid'       => $e->is_paid,
                    'is_overdue'    => $e->is_overdue,
                    'days_overdue'  => $e->days_overdue,
                ]);

                // ── CreditPayment rows ────────────────────────────────────
                $payments = $v->creditPayments->map(fn($pm) => [
                    'id'               => $pm->id,
                    'client_name'      => $pm->client_name,
                    'payment_date'     => $pm->payment_date instanceof Carbon
                        ? $pm->payment_date->toDateString()
                        : $pm->payment_date,
                    'amount_paid'      => (float) $pm->amount_paid,
                    'payment_mode'     => $pm->payment_mode,
                    'reference'        => $pm->reference,
                    'notes'            => $pm->notes,
                    'daybook_entry_id' => $pm->daybook_entry_id,
                    'credit_entry_id'  => $pm->credit_entry_id,
                    'is_linked'        => $pm->is_linked,  // accessor: !is_null(credit_entry_id)
                ]);

                return [
                    'id'                   => $v->id,
                    'party_name'           => $v->party_name,
                    'business_name'        => $v->business_name,
                    'phone'                => $v->phone,
                    'gstin'                => $v->gstin,
                    'address'              => $v->address,
                    'bio_data_id'          => $v->bio_data_id,
                    'bio_data_name'        => $v->bioData?->name,
                    'category_name'        => $v->category?->name,
                    'sub_category_name'    => $v->subCategory?->name,
                    'is_active'            => (bool) $v->is_active,
                    'total_credit'         => $totalCredit,
                    'total_credit_amount'  => $totalCredit,
                    'total_paid'           => $totalPaid,
                    'total_paid_amount'    => $totalPaid,
                    'balance'              => $balance,
                    'outstanding_balance'  => $balance,
                    'status'               => $status,
                    'days_overdue'         => $daysOverdue > 0 ? $daysOverdue : null,
                    'last_transaction_date' => $v->last_transaction_date,
                    'entry_count'          => $v->creditEntries->count(),
                    'credit_entries_count' => $v->creditEntries->count(),
                    'payment_count'        => $v->creditPayments->count(),
                    'credit_payments_count' => $v->creditPayments->count(),
                    'has_balance'          => $balance > 0,
                    'created_by_name'      => $v->created_by_name,
                    // Full arrays for drawer tabs
                    'entries'              => $entries,
                    'payments'             => $payments,
                ];
            });

            // Post-map status filters (requires accessor values)
            $statusFilter = $request->get('status');
            if ($statusFilter === 'balance') {
                $rows = $rows->filter(fn($r) => $r['has_balance']);
            } elseif (in_array($statusFilter, ['clear', 'overdue', 'partial', 'pending'])) {
                $rows = $rows->filter(fn($r) => $r['status'] === $statusFilter);
            }

            // ── Global summary ────────────────────────────────────────────
            $totalCredit  = (float) CreditEntry::whereNull('deleted_at')->sum('credit_amount');
            $totalPaid    = (float) CreditPayment::whereNull('deleted_at')->sum('amount_paid');
            $totalBalance = round($totalCredit - $totalPaid, 2);

            $overdueCount = CreditEntry::with('linkedPayments')
                ->whereNull('deleted_at')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', Carbon::today())
                ->get()
                ->filter(fn($e) => !$e->is_paid)
                ->count();

            $upcomingCount = CreditEntry::with('linkedPayments')
                ->whereNull('deleted_at')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '>=', Carbon::today())
                ->whereDate('due_date', '<=', Carbon::today()->addDays(7))
                ->get()
                ->filter(fn($e) => !$e->is_paid)
                ->count();

            return $this->ok([
                'vendors' => $rows->values(),
                'summary' => [
                    'total_vendors'  => $vendors->count(),
                    'active_vendors' => $vendors->where('is_active', true)->count(),
                    'total_credit'   => round($totalCredit, 2),
                    'total_paid'     => round($totalPaid,   2),
                    'balance'        => $totalBalance,
                    'outstanding'    => $totalBalance,
                    'overdue_count'  => $overdueCount,
                    'upcoming_count' => $upcomingCount,
                ],
            ], 'Credit report retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate credit report: ' . $e->getMessage());
        }
    }

    public function getAllPayments(Request $request): JsonResponse
    {
        try {
            $payments = ClientPayment::whereNull('deleted_at')
                ->orderBy('payment_date', 'desc')
                ->get()
                ->map(function ($pm) {
                    return [
                        'id'                => $pm->id,
                        'client_project_id' => (int) $pm->client_project_id,
                        'payment_date'      => $pm->payment_date instanceof \Carbon\Carbon
                            ? $pm->payment_date->toDateString()
                            : (string) $pm->payment_date,
                        'amount'            => (float) $pm->amount,
                        'gst_amount'        => (float) ($pm->gst_amount ?? 0),
                        'total_amount'      => (float) $pm->amount + (float) ($pm->gst_amount ?? 0),
                        'payment_mode'      => $pm->payment_mode ?? 'cash',
                        'mode_label'        => ucfirst($pm->payment_mode ?? 'cash'),
                        'reference_number'  => $pm->reference_number,
                        'notes'             => $pm->notes,
                        'next_due_date'     => $pm->next_due_date,
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => $payments,
                'count'   => $payments->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data'    => [],
            ], 500);
        }
    }

    public function portal(Request $request): JsonResponse
    {
        try {
            Log::info('Portal report endpoint called');

            $limit = min((int) $request->get('limit', 200), 500);

            $projects = ClientProject::with(['client', 'payments'])
                ->whereNull('client_projects.deleted_at')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            Log::info('Found ' . $projects->count() . ' projects');

            $rows = [];
            foreach ($projects as $project) {
                $collected = (float) $project->payments->sum('amount');
                $gstTotal = (float) $project->payments->sum('gst_amount');
                $budget = (float) $project->total_budget;
                $balance = $budget - $collected;
                $collectedPct = $budget > 0 ? round(($collected / $budget) * 100, 2) : 0;

                $paymentsList = [];
                foreach ($project->payments as $payment) {
                    $paymentsList[] = [
                        'id' => $payment->id,
                        'payment_date' => $payment->payment_date,
                        'amount' => (float) $payment->amount,
                        'gst_amount' => (float) ($payment->gst_amount ?? 0),
                        'total_amount' => (float) ($payment->amount + ($payment->gst_amount ?? 0)),
                        'payment_mode' => $payment->payment_mode,
                        'mode_label' => $payment->mode_label,
                        'reference_number' => $payment->reference_number,
                        'notes' => $payment->notes,
                        'next_due_date' => $payment->next_due_date,
                    ];
                }

                $rows[] = [
                    'id' => $project->id,
                    'project_name' => $project->project_name ?? 'Unnamed Project',
                    'name' => $project->project_name ?? 'Unnamed Project',
                    'client_name' => $project->client?->name ?? 'Unknown Client',
                    'client_id' => $project->client_id,
                    'project_type' => $project->project_type ?? 'construction',
                    'type_label' => $project->type_label,
                    'status' => $project->status ?? 'active',
                    'status_label' => $project->status_label,
                    'start_date' => $project->start_date?->toDateString(),
                    'description' => $project->description,
                    'type_notes' => $project->type_notes,
                    'total_budget' => $budget,
                    'raw_budget' => $budget,
                    'total_collected' => $collected,
                    'collected' => $collected,
                    'gst_total' => $gstTotal,
                    'balance' => $balance,
                    'collected_pct' => $collectedPct,
                    'payment_count' => $project->payments->count(),
                    'payments' => $paymentsList,
                ];
            }

            // Global summary
            $totalBudget = (float) ClientProject::whereNull('deleted_at')->sum('total_budget');
            $totalCollected = (float) ClientPayment::whereNull('deleted_at')->sum('amount');
            $totalBalance = round($totalBudget - $totalCollected, 2);
            $collectedPct = $totalBudget > 0 ? round(($totalCollected / $totalBudget) * 100, 2) : 0;

            $totalClients = Client::whereNull('deleted_at')->count();
            $totalProjects = ClientProject::whereNull('deleted_at')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'projects' => $rows,
                    'summary' => [
                        'total_clients' => $totalClients,
                        'total_projects' => $totalProjects,
                        'total_budget' => round($totalBudget, 2),
                        'total_collected' => round($totalCollected, 2),
                        'total_balance' => $totalBalance,
                        'collected_pct' => $collectedPct,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Portal report failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate portal report: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function monthlyRevenue(Request $request): JsonResponse
    {
        try {
            $months = min(max((int) $request->get('months', 6), 1), 24);
            $result = [];

            for ($i = $months - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);

                $collected = (float) ClientPayment::whereNull('deleted_at')
                    ->whereYear('payment_date',  $date->year)
                    ->whereMonth('payment_date', $date->month)
                    ->sum('amount');

                $gstTotal = (float) ClientPayment::whereNull('deleted_at')
                    ->whereYear('payment_date',  $date->year)
                    ->whereMonth('payment_date', $date->month)
                    ->sum('gst_amount');

                $dbIncome  = 0.0;
                $dbExpense = 0.0;
                DaybookEntry::with('category')
                    ->whereYear('transaction_date',  $date->year)
                    ->whereMonth('transaction_date', $date->month)
                    ->get()
                    ->each(function ($e) use (&$dbIncome, &$dbExpense) {
                        if ($e->category?->type === 'income') {
                            $dbIncome  += (float) $e->amount;
                        } else {
                            $dbExpense += (float) $e->amount;
                        }
                    });

                $result[] = [
                    'month_label' => $date->format('M'),
                    'month'       => (int) $date->format('m'),
                    'year'        => (int) $date->format('Y'),
                    'month_year'  => $date->format('M Y'),
                    'collected'   => $collected,
                    'gst_total'   => $gstTotal,
                    'grand_total' => $collected + $gstTotal,
                    'total'       => $collected + $gstTotal,
                    'db_income'   => round($dbIncome,  2),
                    'db_expense'  => round($dbExpense, 2),
                    'db_net'      => round($dbIncome - $dbExpense, 2),
                ];
            }

            return $this->ok($result, 'Monthly revenue retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate monthly revenue: ' . $e->getMessage());
        }
    }

    public function incomeStatement(Request $request): JsonResponse
    {
        try {
            ['from' => $from, 'to' => $to] = $this->dateRange($request);

            $entries = DaybookEntry::with(['category', 'subCategory'])
                ->whereBetween('transaction_date', [$from, $to])
                ->get();

            $incomeRows  = [];
            $expenseRows = [];

            foreach ($entries as $e) {
                $cat  = $e->category?->name ?? 'Uncategorized';
                $sub  = $e->subCategory?->name ?? 'General';
                $type = $e->category?->type ?? 'expense';
                $amt  = (float) $e->amount;
                $key  = $cat . '::' . $sub;

                if ($type === 'income') {
                    if (!isset($incomeRows[$key])) {
                        $incomeRows[$key] = ['category' => $cat, 'sub_category' => $sub, 'amount' => 0.0, 'count' => 0];
                    }
                    $incomeRows[$key]['amount'] += $amt;
                    $incomeRows[$key]['count']++;
                } else {
                    if (!isset($expenseRows[$key])) {
                        $expenseRows[$key] = ['category' => $cat, 'sub_category' => $sub, 'amount' => 0.0, 'count' => 0];
                    }
                    $expenseRows[$key]['amount'] += $amt;
                    $expenseRows[$key]['count']++;
                }
            }

            usort($incomeRows,  fn($a, $b) => $b['amount'] <=> $a['amount']);
            usort($expenseRows, fn($a, $b) => $b['amount'] <=> $a['amount']);

            $totalIncome  = array_sum(array_column($incomeRows,  'amount'));
            $totalExpense = array_sum(array_column($expenseRows, 'amount'));

            return $this->ok([
                'date_range'    => ['from' => $from, 'to' => $to],
                'income'        => array_values(array_map(fn($r) => [...$r, 'amount' => round($r['amount'], 2)], $incomeRows)),
                'expense'       => array_values(array_map(fn($r) => [...$r, 'amount' => round($r['amount'], 2)], $expenseRows)),
                'total_income'  => round($totalIncome,  2),
                'total_expense' => round($totalExpense, 2),
                'net_profit'    => round($totalIncome - $totalExpense, 2),
                'is_profitable' => $totalIncome >= $totalExpense,
                'profit_margin' => $totalIncome > 0
                    ? round((($totalIncome - $totalExpense) / $totalIncome) * 100, 2)
                    : 0,
            ], 'Income statement retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate income statement: ' . $e->getMessage());
        }
    }

    public function showProject($clientId, $projectId)
    {
        try {
            \Log::info('Show project called', ['client_id' => $clientId, 'project_id' => $projectId]);

            $project = ClientProject::with(['client', 'payments'])
                ->where('client_id', $clientId)
                ->where('id', $projectId)
                ->first();

            if (!$project) {
                return response()->json(['success' => false, 'message' => 'Project not found'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $project->id,
                    'project_name' => $project->project_name,
                    'client_name' => $project->client->name ?? 'Unknown',
                    'client_id' => $project->client_id,
                    'project_type' => $project->project_type,
                    'type_label' => $project->type_label,
                    'status' => $project->status,
                    'status_label' => $project->status_label,
                    'total_budget' => (float) $project->total_budget,
                    'total_collected' => (float) $project->total_collected,
                    'balance' => (float) $project->balance,
                    'collected_pct' => (float) $project->collected_percent,
                    'payments' => $project->payments->map(function ($pm) {
                        return [
                            'id' => $pm->id,
                            'payment_date' => $pm->payment_date,
                            'amount' => (float) $pm->amount,
                            'gst_amount' => (float) ($pm->gst_amount ?? 0),
                            'total_amount' => (float) $pm->total_amount,
                            'payment_mode' => $pm->payment_mode,
                            'mode_label' => $pm->mode_label,
                            'reference_number' => $pm->reference_number,
                            'notes' => $pm->notes,
                            'next_due_date' => $pm->next_due_date,
                        ];
                    }),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Show project failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
