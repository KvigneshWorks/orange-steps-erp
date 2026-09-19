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

            $dbEntries = DaybookEntry::with('category')
                ->whereBetween('transaction_date', [$from, $to])
                ->get();

            $dbIncome = 0.0;
            $dbExpense = 0.0;
            foreach ($dbEntries as $e) {
                if ($e->category?->type === 'income') {
                    $dbIncome += (float) $e->amount;
                } else {
                    $dbExpense += (float) $e->amount;
                }
            }

            $crTotalCredit = (float) CreditEntry::whereNull('deleted_at')->sum('credit_amount');
            $crTotalPaid = (float) CreditPayment::whereNull('deleted_at')->sum('amount_paid');
            $crOutstanding = round($crTotalCredit - $crTotalPaid, 2);

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

            $crVendorCount = CreditVendor::whereNull('deleted_at')->count();
            $crActiveVendors = CreditVendor::whereNull('deleted_at')->where('is_active', true)->count();

            $cpBudget = (float) ClientProject::whereNull('deleted_at')->sum('total_budget');
            $cpCollected = (float) ClientPayment::whereNull('deleted_at')->sum('amount');
            $cpBalance = round($cpBudget - $cpCollected, 2);
            $cpClients = Client::whereNull('deleted_at')->count();
            $cpProjects = ClientProject::whereNull('deleted_at')->count();
            $cpPct = $cpBudget > 0 ? round(($cpCollected / $cpBudget) * 100, 2) : 0;

            return $this->ok([
                'date_range' => ['from' => $from, 'to' => $to],
                'daybook' => [
                    'income' => round($dbIncome, 2),
                    'expense' => round($dbExpense, 2),
                    'balance' => round($dbIncome - $dbExpense, 2),
                    'entry_count' => $dbEntries->count(),
                ],
                'credit' => [
                    'total_credit' => round($crTotalCredit, 2),
                    'total_paid' => round($crTotalPaid, 2),
                    'balance' => $crOutstanding,
                    'outstanding' => $crOutstanding,
                    'overdue_count' => $crOverdueCount,
                    'upcoming_count' => $crUpcomingCount,
                    'total_vendors' => $crVendorCount,
                    'active_vendors' => $crActiveVendors,
                ],
                'portal' => [
                    'total_budget' => round($cpBudget, 2),
                    'total_collected' => round($cpCollected, 2),
                    'total_balance' => $cpBalance,
                    'collected_pct' => $cpPct,
                    'total_clients' => $cpClients,
                    'total_projects' => $cpProjects,
                ],
            ], 'Report summary retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate summary: ' . $e->getMessage());
        }
    }

    public function portal(Request $request): JsonResponse
    {
        try {
            $limit = min((int) $request->get('limit', 200), 500);

            $projects = ClientProject::with(['client', 'payments'])
                ->whereNull('client_projects.deleted_at')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            $rows = $projects->map(function ($project) {
                $collected = (float) ($project->total_collected ?? $project->payments->sum('amount'));
                $budget = (float) $project->total_budget;
                $balance = $budget - $collected;
                $collectedPct = $budget > 0 ? round(($collected / $budget) * 100, 2) : 0;

                $paymentsList = $project->payments->map(fn($payment) => [
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
                ])->values();

                return [
                    'id' => $project->id,
                    'project_name' => $project->project_name ?? 'Unnamed Project',
                    'client_name' => $project->client?->name ?? 'Unknown Client',
                    'client_id' => $project->client_id,
                    'project_type' => $project->project_type ?? 'construction',
                    'status' => $project->status ?? 'active',
                    'total_budget' => $budget,
                    'total_collected' => $collected,
                    'balance' => $balance,
                    'collected_pct' => $collectedPct,
                    'payments' => $paymentsList,
                ];
            });

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
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate portal report: ' . $e->getMessage(),
                'data' => null
            ], 500);
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

            if ($pay = $request->get('payment_mode')) {
                $query->where('payment_mode', $pay);
            }
            if ($catId = $request->get('category_id')) {
                $query->where('category_id', $catId);
            }
            if ($search = $request->get('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('narration', 'like', "%{$search}%")
                        ->orWhere('client_name', 'like', "%{$search}%")
                        ->orWhereHas('bioData', fn($b) => $b->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$search}%"))
                        ->orWhere('payment_mode', 'like', "%{$search}%");
                });
            }

            $entries = $query->get()->map(fn($e) => [
                'id'                => $e->id,
                'transaction_date'  => $e->transaction_date?->toDateString(),
                'amount'            => (float) $e->amount,
                'payment_mode'      => $e->payment_mode,
                'narration'         => $e->narration,
                'client_name'       => $e->client_name,
                'category_id'       => $e->category_id,
                'sub_category_id'   => $e->sub_category_id,
                'bio_data_id'       => $e->bio_data_id,
                'sub_name_id'       => $e->sub_name_id,
                'category_name'     => $e->category?->name,
                'category_type'     => $e->category?->type,
                'sub_category_name' => $e->subCategory?->name,
                'bio_data_name'     => $e->bioData?->name,
                'sub_name_name'     => $e->subName?->alternate_name,
            ]);

            $income  = $entries->where('category_type', 'income')->sum('amount');
            $expense = $entries->where('category_type', 'expense')->sum('amount');

            return $this->ok([
                'entries' => $entries->values(),
                'stats'   => [
                    'income'  => round((float) $income,  2),
                    'expense' => round((float) $expense, 2),
                    'balance' => round((float) ($income - $expense), 2),
                    'count'   => $entries->count(),
                ],
            ], 'Daybook report retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate daybook report: ' . $e->getMessage());
        }
    }

    public function credit(Request $request): JsonResponse
    {
        try {
            ['from' => $from, 'to' => $to] = $this->dateRange($request);

            $vendors = CreditVendor::with([
                'category:id,name',
                'subCategory:id,name',
                'creditEntries' => fn($query) => $query
                    ->whereNull('deleted_at')
                    ->whereBetween('credit_date', [$from, $to])
                    ->orderBy('credit_date', 'desc'),
                'creditPayments' => fn($query) => $query
                    ->whereNull('deleted_at')
                    ->whereBetween('payment_date', [$from, $to])
                    ->orderBy('payment_date', 'desc'),
            ])
                ->whereNull('deleted_at')
                ->orderBy('party_name')
                ->get();

            $rows = $vendors->map(function ($v) {
                $totalCredit = (float) $v->creditEntries->sum('credit_amount');
                $totalPaid   = (float) $v->creditPayments->sum('amount_paid');
                $balance     = round($totalCredit - $totalPaid, 2);

                $lastCredit  = $v->creditEntries->max('credit_date');
                $lastPayment = $v->creditPayments->max('payment_date');
                if (!$lastCredit && !$lastPayment) {
                    $lastDate = null;
                } elseif (!$lastCredit) {
                    $lastDate = $lastPayment;
                } elseif (!$lastPayment) {
                    $lastDate = $lastCredit;
                } else {
                    $lastDate = max($lastCredit, $lastPayment);
                }

                $overdue = $v->creditEntries
                    ->filter(fn($e) => $e->due_date && \Carbon\Carbon::parse($e->due_date)->isPast() && !$e->is_paid)
                    ->count();

                $entryClientMap = $v->creditEntries->pluck('client_name', 'id');

                return [
                    'id'                    => $v->id,
                    'party_name'            => $v->party_name,
                    'business_name'         => $v->business_name,
                    'phone'                 => $v->phone,
                    'category_id'           => $v->category_id,
                    'category_name'         => $v->category?->name,
                    'sub_category_id'       => $v->sub_category_id,
                    'sub_category_name'     => $v->subCategory?->name,
                    'is_active'             => $v->is_active,
                    'status'                => $v->is_active ? 'active' : 'inactive',
                    'total_credit'          => $totalCredit,
                    'total_paid'            => $totalPaid,
                    'balance'               => $balance,
                    'entry_count'           => $v->creditEntries->count(),
                    'payment_count'         => $v->creditPayments->count(),
                    'days_overdue'          => $overdue,
                    'last_transaction_date' => $lastDate,
                    'entries'               => $v->creditEntries->map(fn($e) => [
                        'id'            => $e->id,
                        'client_name'   => $e->client_name,
                        'credit_date'   => $e->credit_date?->format('Y-m-d'),
                        'bill_number'   => $e->bill_number,
                        'description'   => $e->description,
                        'credit_amount' => (float) $e->credit_amount,
                        'due_date'      => $e->due_date?->format('Y-m-d'),
                        'priority'      => $e->priority,
                        'amount_paid'   => (float) $e->amount_paid,
                        'bill_balance'  => (float) $e->bill_balance,
                        'is_paid'       => $e->is_paid,
                        'is_overdue'    => $e->is_overdue,
                    ])->values(),
                    'payments' => $v->creditPayments->map(fn($p) => [
                        'id'              => $p->id,
                        'client_name'     => $p->client_name ?: ($p->credit_entry_id ? ($entryClientMap[$p->credit_entry_id] ?? null) : null),
                        'payment_date'    => $p->payment_date?->format('Y-m-d'),
                        'amount_paid'     => (float) $p->amount_paid,
                        'payment_mode'    => $p->payment_mode,
                        'reference'       => $p->reference,
                        'notes'           => $p->notes,
                        'daybook_entry_id' => $p->daybook_entry_id,
                        'credit_entry_id' => $p->credit_entry_id,
                    ])->values(),
                ];
            });

            $totalCredit = round((float) $rows->sum(fn($vendor) => (float) ($vendor['total_credit'] ?? 0)), 2);
            $totalPaid = round((float) $rows->sum(fn($vendor) => (float) ($vendor['total_paid'] ?? 0)), 2);
            $balance = round($totalCredit - $totalPaid, 2);
            $activeVendors = $vendors->where('is_active', true)->count();
            $vendorsWithActivity = $rows->filter(fn($vendor) => ($vendor['entry_count'] ?? 0) > 0 || ($vendor['payment_count'] ?? 0) > 0)->count();

            $overdueCount = $rows->sum(fn($vendor) => (int) collect($vendor['entries'] ?? [])->filter(fn($e) => $e['due_date'] && \Carbon\Carbon::parse($e['due_date'])->isPast() && !$e['is_paid'])->count());
            $upcomingCount = $rows->sum(fn($vendor) => (int) collect($vendor['entries'] ?? [])->filter(fn($e) => $e['due_date'] && \Carbon\Carbon::parse($e['due_date'])->between(now(), now()->addDays(7), true) && !$e['is_paid'])->count());

            return $this->ok([
                'vendors' => $rows->values(),
                'summary' => [
                    'total_vendors'  => $vendorsWithActivity,
                    'active_vendors' => $activeVendors,
                    'total_credit'   => $totalCredit,
                    'total_paid'     => $totalPaid,
                    'balance'        => $balance,
                    'outstanding'    => $balance,
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
        return $this->ok([], 'Success');
    }

    public function monthlyRevenue(Request $request): JsonResponse
    {
        return $this->ok([], 'Success');
    }

    public function incomeStatement(Request $request): JsonResponse
    {
        try {
            $from = $request->get('from_date', Carbon::now()->startOfYear()->toDateString());
            $to   = $request->get('to_date',   Carbon::now()->toDateString());

            /* ── Client Portal Collections ──────────────────────────── */
            $payments = ClientPayment::with([
                'clientProject' => fn($q) => $q->withTrashed(),
                'clientProject.client',
            ])
                ->whereNull('client_payments.deleted_at')
                ->whereBetween('payment_date', [$from, $to])
                ->orderBy('payment_date', 'desc')
                ->get();

            // Group by client
            $clientMap = [];
            foreach ($payments as $p) {
                $client  = $p->clientProject?->client;
                $project = $p->clientProject;
                $cId     = $client?->id ?? 0;
                $cName   = $client?->name ?? 'Unknown Client';

                if (!isset($clientMap[$cId])) {
                    $clientMap[$cId] = [
                        'client_id'   => $cId,
                        'client_name' => $cName,
                        'total'       => 0.0,
                        'payments'    => [],
                    ];
                }
                $clientMap[$cId]['total'] += (float) $p->amount;
                $clientMap[$cId]['payments'][] = [
                    'id'               => $p->id,
                    'payment_date'     => $p->payment_date?->toDateString(),
                    'amount'           => (float) $p->amount,
                    'gst_amount'       => (float) ($p->gst_amount ?? 0),
                    'total_amount'     => (float) ($p->amount + ($p->gst_amount ?? 0)),
                    'payment_mode'     => $p->payment_mode,
                    'mode_label'       => $p->mode_label,
                    'reference_number' => $p->reference_number,
                    'notes'            => $p->notes,
                    'project_name'     => $project?->project_name ?? '—',
                    'project_id'       => $project?->id,
                ];
            }
            $clientCollections = array_values($clientMap);
            usort($clientCollections, fn($a, $b) => $b['total'] <=> $a['total']);
            $totalClientCollected = array_sum(array_column($clientCollections, 'total'));

            /* ── Daybook Income Entries ──────────────────────────────── */
            $dbIncomeEntries = DaybookEntry::with(['category', 'subCategory', 'bioData', 'subName'])
                ->whereHas('category', fn($q) => $q->where('type', 'income'))
                ->whereBetween('transaction_date', [$from, $to])
                ->orderBy('transaction_date', 'desc')
                ->get()
                ->map(fn($e) => [
                    'id'                => $e->id,
                    'transaction_date'  => $e->transaction_date?->toDateString(),
                    'amount'            => (float) $e->amount,
                    'payment_mode'      => $e->payment_mode,
                    'narration'         => $e->narration,
                    'client_name'       => $e->client_name,
                    'category_name'     => $e->category?->name ?? '—',
                    'sub_category_name' => $e->subCategory?->name,
                    'party_name'        => $e->bioData?->name ?? $e->subName?->alternate_name ?? '—',
                ]);

            $totalDaybookIncome = $dbIncomeEntries->sum('amount');

            /* ── Monthly Breakdown ───────────────────────────────────── */
            $clientMonthly = [];
            foreach ($payments as $p) {
                $month = $p->payment_date?->format('Y-m');
                if (!$month) continue;
                $clientMonthly[$month] = ($clientMonthly[$month] ?? 0) + (float) $p->amount;
            }

            $daybookMonthly = [];
            foreach ($dbIncomeEntries as $e) {
                $month = substr($e['transaction_date'] ?? '', 0, 7);
                if (!$month) continue;
                $daybookMonthly[$month] = ($daybookMonthly[$month] ?? 0) + $e['amount'];
            }

            $allMonths = array_unique(array_merge(array_keys($clientMonthly), array_keys($daybookMonthly)));
            sort($allMonths);
            $monthly = array_map(fn($m) => [
                'month'          => $m,
                'label'          => Carbon::parse($m . '-01')->format('M Y'),
                'client_income'  => round((float)($clientMonthly[$m]  ?? 0), 2),
                'daybook_income' => round((float)($daybookMonthly[$m] ?? 0), 2),
                'total'          => round((float)(($clientMonthly[$m] ?? 0) + ($daybookMonthly[$m] ?? 0)), 2),
            ], $allMonths);

            return $this->ok([
                'date_range' => ['from' => $from, 'to' => $to],
                'summary' => [
                    'total_income'         => round($totalClientCollected + $totalDaybookIncome, 2),
                    'total_client_income'  => round((float) $totalClientCollected, 2),
                    'total_daybook_income' => round((float) $totalDaybookIncome, 2),
                    'client_count'         => count($clientCollections),
                    'payment_count'        => $payments->count(),
                    'daybook_entry_count'  => $dbIncomeEntries->count(),
                ],
                'client_collections' => $clientCollections,
                'daybook_income'     => $dbIncomeEntries->values(),
                'monthly'            => array_values($monthly),
            ], 'Income statement retrieved successfully');
        } catch (\Exception $e) {
            return $this->fail('Failed to generate income statement: ' . $e->getMessage());
        }
    }

    public function recentProjects(Request $request)
    {
        return response()->json(['success' => true, 'data' => []]);
    }

    public function showProject($clientId, $projectId)
    {
        return response()->json(['success' => true, 'data' => null]);
    }
}
