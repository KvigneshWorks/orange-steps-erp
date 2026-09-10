<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientProject;
use App\Models\ClientPayment;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        try {
            $totalCollected = ClientPayment::sum('amount');
            $totalLakhs     = round($totalCollected / 100000, 1);
            $activeProjects  = ClientProject::where('status', 'active')->count();
            $pendingProjects = ClientProject::where('status', 'on_hold')->count();
            $siteInspections = 0;
            $pendingBOQs     = 0;
            $teamMembers     = 0;
            $cadRevisions    = 0;
            try { $siteInspections = \App\Models\Inspection::count(); } catch (\Throwable $e) {}
            try { $pendingBOQs     = \App\Models\BOQ::where('status', 'pending')->count(); } catch (\Throwable $e) {}
            try { $teamMembers     = \App\Models\User::where('is_active', true)->count(); } catch (\Throwable $e) {}
            try { $cadRevisions    = \App\Models\CADRevision::whereMonth('created_at', now()->month)->count(); } catch (\Throwable $e) {}

            return response()->json([
                'success' => true,
                'data'    => [
                    'activeProjects'   => $activeProjects,
                    'revenue'          => '₹' . $totalLakhs,
                    'siteInspections'  => $siteInspections,
                    'pendingBOQs'      => $pendingBOQs,
                    'teamMembers'      => $teamMembers,
                    'cadRevisions'     => $cadRevisions,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'activeProjects'  => 0,
                    'revenue'         => '₹0',
                    'siteInspections' => 0,
                    'pendingBOQs'     => 0,
                    'teamMembers'     => 0,
                    'cadRevisions'    => 0,
                ],
            ]);
        }
    }

    public function projects(): JsonResponse
    {
        try {
            $projects = ClientProject::with(['client', 'payments'])
                ->orderBy('created_at', 'desc')
                ->limit(15)
                ->get()
                ->map(function ($p) {
                    $collected = (float) $p->payments->sum('amount');
                    $budget    = (float) $p->total_budget;
                    $progress  = $budget > 0 ? (int) round(($collected / $budget) * 100) : 0;
                    $pillStatus = match ($p->status) {
                        'active'    => 'active',
                        'on_hold'   => 'hold',
                        'completed' => 'review',
                        default     => 'pending',
                    };

                    return [
                        'id'       => $p->id,
                        'name'     => $p->project_name,
                        'sub'      => ($p->client?->name ?? 'Unknown') . ' · ' . ucfirst($p->project_type),
                        'status'   => $pillStatus,
                        'progress' => min($progress, 100),
                        'value'    => $budget >= 100000
                            ? '₹' . number_format($budget / 100000, 1) . 'L'
                            : '₹' . number_format($budget / 1000, 0) . 'K',
                        'date'    => $p->created_at?->format('d M'),
                    ];
                });
            return response()->json(['success' => true, 'data' => $projects]);
        } catch (\Throwable $e) {
            return response()->json(['success' => true, 'data' => []]);
        }
    }
}
