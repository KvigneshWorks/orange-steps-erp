<?php

namespace App\Http\Controllers;

use App\Models\BOQ;
use App\Models\User;
use App\Models\Project;
use App\Models\CADRevision;
use App\Models\Inspection;
use App\Models\ClientProject;
use App\Models\ClientPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Clear every cached dashboard section (stats, portal summary,
     * recent projects, monthly revenue, projects list). Call this from
     * any controller after a write that changes client/project/payment/
     * inspection/BOQ/CAD-revision data, so the dashboard reflects the
     * change immediately instead of waiting for each cache key's TTL
     * to expire on its own.
     */
    public static function clearCache(): void
    {
        Cache::forget('dashboard_stats');
        Cache::forget('dashboard_portal_summary');
        Cache::forget('dashboard_recent_projects');
        Cache::forget('dashboard_monthly_revenue');
        Cache::forget('dashboard_projects');
    }

    public function stats(): JsonResponse
    {
        try {
            $totalValue  = Project::where('status', 'active')->sum('value');
            $totalLakhs  = round($totalValue / 100000, 1);

            $teamMembers = User::where('role', 'team')->count();
            if ($teamMembers === 0) {
                $teamMembers = User::count();
            }

            $data = [
                'activeProjects'  => Project::where('status', 'active')->count(),
                'revenue'         => '₹' . $totalLakhs . 'L',
                'siteInspections' => Inspection::count(),
                'pendingBOQs'     => BOQ::where('status', 'pending')->count(),
                'teamMembers'     => $teamMembers,
                'cadRevisions'    => CADRevision::count(),
            ];

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            Log::error('Dashboard stats failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard stats.',
                'data'    => [
                    'activeProjects'  => 0,
                    'revenue'         => '₹0L',
                    'siteInspections' => 0,
                    'pendingBOQs'     => 0,
                    'teamMembers'     => 0,
                    'cadRevisions'    => 0,
                ],
            ]);
        }
    }

    /**
     * Single endpoint that returns ALL dashboard data in one request.
     * Replaces 6 separate frontend API calls with 1.
     * Each section is individually cached so partial cache hits still work.
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $tk = $request->bearerToken();

            // 1. Stats (cached 5 min)
            $stats = Cache::remember('dashboard_stats', 300, function () {
                $totalValue  = Project::where('status', 'active')->sum('value');
                $totalLakhs  = round($totalValue / 100000, 1);
                $teamMembers = User::where('role', 'team')->count() ?: User::count();
                return [
                    'activeProjects'  => Project::where('status', 'active')->count(),
                    'revenue'         => '₹' . $totalLakhs . 'L',
                    'siteInspections' => Inspection::count(),
                    'pendingBOQs'     => BOQ::where('status', 'pending')->count(),
                    'teamMembers'     => $teamMembers,
                    'cadRevisions'    => CADRevision::count(),
                ];
            });

            // 2. Portal summary (cached 2 min)
            $summary = Cache::remember('dashboard_portal_summary', 120, function () {
                $clients         = \App\Models\Client::with(['projects.payments'])->get();
                $totalBudget     = 0;
                $totalCollected  = 0;
                $totalProjects   = 0;
                foreach ($clients as $c) {
                    foreach ($c->projects as $p) {
                        $totalBudget    += (float) $p->total_budget;
                        $totalCollected += (float) ($p->total_collected ?? $p->payments->sum('amount'));
                        $totalProjects++;
                    }
                }
                return [
                    'total_clients'   => $clients->count(),
                    'total_projects'  => $totalProjects,
                    'total_budget'    => $totalBudget,
                    'total_collected' => $totalCollected,
                    'total_balance'   => $totalBudget - $totalCollected,
                    'collected_pct'   => $totalBudget > 0
                        ? round(($totalCollected / $totalBudget) * 100, 2) : 0,
                ];
            });

            // 3. Recent projects (cached 2 min)
            $recentProjects = Cache::remember('dashboard_recent_projects', 120, function () {
                return ClientProject::with(['client', 'payments'])
                    ->orderBy('created_at', 'desc')
                    ->limit(15)
                    ->get()
                    ->map(function ($p) {
                        $collected = (float) $p->payments->sum('amount');
                        $budget    = (float) $p->total_budget;
                        $statusMap = ['active' => 'active', 'on_hold' => 'hold', 'completed' => 'review'];
                        return [
                            'id'           => $p->id,
                            'name'         => $p->project_name,
                            'sub'          => ($p->client?->name ?? 'Unknown') . ' · ' . ucfirst($p->project_type ?? ''),
                            'status'       => $statusMap[$p->status] ?? 'pending',
                            'progress'     => $budget > 0 ? min((int) round(($collected / $budget) * 100), 100) : 0,
                            'value'        => $budget >= 100000
                                ? '₹' . number_format($budget / 100000, 1) . 'L'
                                : '₹' . number_format($budget / 1000, 0) . 'K',
                            'date'         => $p->created_at?->format('d M'),
                            'client_name'  => $p->client?->name ?? '—',
                            'project_name' => $p->project_name,
                            'project_type' => ucfirst($p->project_type ?? ''),
                            'collected'    => $collected,
                            'balance'      => max(0, $budget - $collected),
                            'raw_budget'   => $budget,
                        ];
                    });
            });

            // 4. Monthly revenue — last 6 months (cached 10 min)
            $monthlyRevenue = Cache::remember('dashboard_monthly_revenue', 600, function () {
                $months = [];
                for ($i = 5; $i >= 0; $i--) {
                    $date      = Carbon::now()->subMonths($i);
                    $collected = ClientPayment::whereYear('payment_date', $date->year)
                        ->whereMonth('payment_date', $date->month)->sum('amount');
                    $gst       = ClientPayment::whereYear('payment_date', $date->year)
                        ->whereMonth('payment_date', $date->month)->sum('gst_amount');
                    $months[]  = [
                        'month_label' => $date->format('M'),
                        'month'       => (int) $date->format('m'),
                        'year'        => (int) $date->format('Y'),
                        'collected'   => (float) $collected,
                        'gst_total'   => (float) $gst,
                        'grand_total' => (float) ($collected + $gst),
                    ];
                }
                return $months;
            });

            // 5. Upcoming dues within 20 days — deliberately NOT cached (unlike the
            // sections above). This powers the Dashboard's "Client Payment Dues"
            // panel, and it needs to reflect a newly-added/edited payment due
            // date immediately rather than up to 5 minutes late.
            $upcomingDues = (function () {
                $today  = Carbon::today();
                $cutoff = Carbon::today()->addDays(20);
                return ClientPayment::with(['clientProject.client'])
                    ->whereNotNull('next_due_date')
                    ->whereBetween('next_due_date', [$today, $cutoff])
                    ->orderBy('next_due_date')
                    ->get()
                    ->map(function ($pay) use ($today) {
                        $due = Carbon::parse($pay->next_due_date)->startOfDay();
                        return [
                            'payment_id'     => $pay->id,
                            'client_name'    => $pay->clientProject?->client?->name ?? 'Unknown',
                            'project_name'   => $pay->clientProject?->project_name ?? 'Unknown',
                            'amount'         => (float) $pay->amount,
                            'next_due_date'  => $due->format('d M Y'),
                            'days_until_due' => (int) round($today->diffInDays($due, false)),
                        ];
                    })
                    ->values();
            })();

            return response()->json([
                'success' => true,
                'data'    => [
                    'stats'           => $stats,
                    'summary'         => $summary,
                    'recentProjects'  => $recentProjects,
                    'monthlyRevenue'  => $monthlyRevenue,
                    'upcomingDues'    => $upcomingDues,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Dashboard overview failed', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to load dashboard.'], 500);
        }
    }

    public function projects(): JsonResponse
    {
        try {
            $projects = Cache::remember('dashboard_projects', 120, function () {

                return ClientProject::with([
                    'client:id,name',
                    'payments:id,project_id,amount',
                ])
                    ->select(
                        'id',
                        'client_id',
                        'project_name',
                        'project_type',
                        'status',
                        'total_budget',
                        'created_at'
                    )
                    ->orderBy('created_at', 'desc')
                    ->limit(15)
                    ->get()
                    ->map(function ($p) {
                        $collected  = (float) $p->payments->sum('amount');
                        $budget     = (float) $p->total_budget;
                        $progress   = $budget > 0
                            ? min((int) round(($collected / $budget) * 100), 100)
                            : 0;

                        $pillStatus = match ($p->status) {
                            'active'    => 'active',
                            'on_hold'   => 'hold',
                            'completed' => 'review',
                            default     => 'pending',
                        };

                        return [
                            'id'       => $p->id,
                            'name'     => $p->project_name,
                            'sub'      => ($p->client?->name ?? 'Unknown') . ' · ' . ucfirst($p->project_type ?? ''),
                            'status'   => $pillStatus,
                            'progress' => $progress,
                            'value'    => $budget >= 100000
                                ? '₹' . number_format($budget / 100000, 1) . 'L'
                                : '₹' . number_format($budget / 1000, 0) . 'K',
                            'date'     => $p->created_at?->format('d M'),
                        ];
                    });
            });

            return response()->json(['success' => true, 'data' => $projects]);
        } catch (\Throwable $e) {
            Log::error('Dashboard projects failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load projects.',
                'data'    => [],
            ]);
        }
    }
}
