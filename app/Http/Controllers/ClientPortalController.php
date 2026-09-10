<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientProject;
use App\Models\ClientPayment;
use App\Models\BioData;
use App\Models\IDType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Exception;

class ClientPortalController extends Controller
{
    public function indexClients(): JsonResponse
    {
        // Single SQL query — subquery aggregates avoid loading every payment record
        $rows = DB::table('clients')
            ->whereNull('clients.deleted_at')
            ->leftJoin(
                DB::raw('(SELECT client_id,
                            COUNT(*) AS project_count,
                            COALESCE(SUM(total_budget), 0) AS total_budget
                         FROM client_projects
                         WHERE deleted_at IS NULL
                         GROUP BY client_id) AS proj'),
                'clients.id', '=', 'proj.client_id'
            )
            ->leftJoin(
                DB::raw('(SELECT cp.client_id,
                            COALESCE(SUM(pay.amount), 0)     AS total_collected,
                            COALESCE(SUM(pay.gst_amount), 0) AS total_gst
                         FROM client_payments pay
                         JOIN client_projects cp ON cp.id = pay.client_project_id
                         WHERE pay.deleted_at IS NULL AND cp.deleted_at IS NULL
                         GROUP BY cp.client_id) AS pagg'),
                'clients.id', '=', 'pagg.client_id'
            )
            ->select(
                'clients.id',
                'clients.name',
                'clients.id_number',
                'clients.email',
                'clients.address',
                'clients.city',
                'clients.notes',
                'clients.id_type_id',
                'clients.id_type_name',
                'clients.id_details',
                'clients.created_at',
                DB::raw('COALESCE(proj.project_count, 0) AS project_count'),
                DB::raw('COALESCE(proj.total_budget, 0)   AS total_budget'),
                DB::raw('COALESCE(pagg.total_collected, 0) AS total_collected'),
                DB::raw('COALESCE(pagg.total_gst, 0)       AS total_additional')
            )
            ->orderBy('clients.name')
            ->get();

        $data = $rows->map(function ($row) {
            $budget    = (float) $row->total_budget;
            $collected = (float) $row->total_collected;
            return [
                'id'               => $row->id,
                'name'             => $row->name,
                'id_number'        => $row->id_number,
                'email'            => $row->email,
                'address'          => $row->address,
                'city'             => $row->city,
                'notes'            => $row->notes,
                'total_budget'     => $budget,
                'total_collected'  => $collected,
                'total_additional' => (float) $row->total_additional,
                'total_balance'    => $budget - $collected,
                'project_count'    => (int) $row->project_count,
                'id_type_id'       => $row->id_type_id,
                'id_type_name'     => $row->id_type_name,
                'id_details'       => $row->id_details,
                'created_at'       => $row->created_at
                    ? \Carbon\Carbon::parse($row->created_at)->format('d M Y')
                    : null,
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function storeClient(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'id_number'  => 'required|string|max:20',
            'email'      => 'nullable|email|max:255',
            'address'    => 'nullable|string',
            'city'       => 'nullable|string|max:100',
            'notes'      => 'nullable|string',
            'id_type_id' => 'nullable|integer|exists:id_types,id',
            'id_details' => 'nullable|string|max:100',
        ]);

        if (!empty($data['id_type_id'])) {
            $idType = IDType::find($data['id_type_id']);
            if ($idType) {
                $data['id_type_name'] = $idType->type_name;
            }
        }

        $data['created_by'] = Auth::id();
        $client = Client::create($data);
        $client->load(['projects.payments']);

        return response()->json([
            'success' => true,
            'message' => 'Client created successfully',
            'data'    => $this->formatClient($client),
        ], 201);
    }

    public function showClient(int $id): JsonResponse
    {
        $client = Client::with(['projects.payments'])->find($id);
        if (!$client) {
            return response()->json(['success' => false, 'message' => 'Client not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatClient($client, true),
        ]);
    }

    public function updateClient(Request $request, int $id): JsonResponse
    {
        $client = Client::findOrFail($id);
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'id_number'  => 'required|string|max:20',
            'email'      => 'nullable|email|max:255',
            'address'    => 'nullable|string',
            'city'       => 'nullable|string|max:100',
            'notes'      => 'nullable|string',
            'id_type_id' => 'nullable|integer|exists:id_types,id',
            'id_details' => 'nullable|string|max:100',
        ]);

        if (!empty($data['id_type_id'])) {
            $idType = IDType::find($data['id_type_id']);
            if ($idType) {
                $data['id_type_name'] = $idType->type_name;
            }
        }

        $client->update($data);
        $client->load(['projects.payments']);

        return response()->json([
            'success' => true,
            'message' => 'Client updated successfully',
            'data'    => $this->formatClient($client),
        ]);
    }

    public function destroyClient(int $id): JsonResponse
    {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(['success' => true, 'message' => 'Client deleted successfully']);
    }

    public function getBioDataRecords(): JsonResponse
    {
        try {
            $bioRecords = BioData::with(['category', 'subCategory'])
                ->where('is_active', 1)
                ->orderBy('name')
                ->get()
                ->map(function ($rec) {
                    $subNames = DB::table('sub_names')
                        ->where('bio_data_id', $rec->id)
                        ->where('is_active', 1)
                        ->whereNull('deleted_at')
                        ->pluck('alternate_name')
                        ->toArray();
                    $categoryType = $rec->category?->type ?? 'income';
                    $categoryName = $rec->category?->name ?? 'Uncategorized';

                    return [
                        'id'         => $rec->id,
                        'name'       => $rec->name,
                        'id_details' => $rec->id_details ?? '',
                        'sub_names'  => $subNames,
                        'type'       => $categoryType,
                        'category'   => $categoryName,
                    ];
                });
            \Log::info('BioData API Response', ['count' => $bioRecords->count(), 'records' => $bioRecords->take(3)]);
            return response()->json(['success' => true, 'data' => $bioRecords]);
        } catch (Exception $e) {
            \Log::error('BioData error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch BioData records',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function indexProjects(int $clientId): JsonResponse
    {
        $client = Client::findOrFail($clientId);

        $projects = $client->projects()
            ->with(['payments' => function ($q) {
                $q->orderBy('payment_date', 'desc');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => $this->formatProject($p, true));

        return response()->json(['success' => true, 'data' => $projects]);
    }

    public function storeProject(Request $request, int $clientId): JsonResponse
    {
        $client = Client::findOrFail($clientId);
        $data = $request->validate([
            'project_name' => 'nullable|string|max:255',
            'project_type' => ['required', Rule::in(['construction', 'interior', 'architecture', 'drawing', 'pmc'])],
            'start_date'   => 'required|date',
            'total_budget' => 'required|numeric|min:0',
            'description'  => 'nullable|string',
            'type_notes'   => 'nullable|string',
            'status'       => ['required', Rule::in(['active', 'on_hold', 'completed'])],
        ]);

        $data['client_id']  = $client->id;
        $data['created_by'] = Auth::id();
        $project = ClientProject::create($data);
        $project->load('payments');

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully',
            'data'    => $this->formatProject($project),
        ], 201);
    }

    public function showProject(int $clientId, int $projectId): JsonResponse
    {
        $client = Client::findOrFail($clientId);
        $project = $client->projects()
            ->with(['payments' => function ($q) {
                $q->orderBy('payment_date', 'desc');
            }])
            ->findOrFail($projectId);

        return response()->json([
            'success' => true,
            'data' => $this->formatProject($project, true)
        ]);
    }

    public function updateProject(Request $request, int $clientId, int $projectId): JsonResponse
    {
        $client  = Client::findOrFail($clientId);
        $project = $client->projects()->findOrFail($projectId);
        $data = $request->validate([
            'project_name' => 'nullable|string|max:255',
            'project_type' => ['required', Rule::in(['construction', 'interior', 'architecture', 'drawing', 'pmc'])],
            'start_date'   => 'required|date',
            'total_budget' => 'required|numeric|min:0',
            'description'  => 'nullable|string',
            'type_notes'   => 'nullable|string',
            'status'       => ['required', Rule::in(['active', 'on_hold', 'completed'])],
        ]);
        $project->update($data);
        $project->load('payments');

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully',
            'data'    => $this->formatProject($project),
        ]);
    }

    public function destroyProject(int $clientId, int $projectId): JsonResponse
    {
        $client  = Client::findOrFail($clientId);
        $project = $client->projects()->findOrFail($projectId);
        $project->delete();

        return response()->json(['success' => true, 'message' => 'Project deleted successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  ADD BUDGET TO PROJECT
    // ─────────────────────────────────────────────────────────────────────────
    public function addBudget(Request $request, int $clientId, int $projectId): JsonResponse
    {
        try {
            $client = Client::findOrFail($clientId);
            $project = $client->projects()->findOrFail($projectId);

            $validated = $request->validate([
                'extra_amount' => 'required|numeric|min:0.01',
                'date_added'   => 'required|date',
                'reason'       => 'nullable|string|max:500',
            ]);

            $extraAmount = (float) $validated['extra_amount'];
            $dateAdded = $validated['date_added'];
            $reason = $validated['reason'] ?? null;
            $oldBudget = (float) $project->total_budget;
            $newBudget = $oldBudget + $extraAmount;
            $project->update([
                'total_budget' => $newBudget,
            ]);

            \App\Models\ProjectBudgetHistory::create([
                'client_project_id' => $project->id,
                'extra_amount' => $extraAmount,
                'reason' => $reason,
                'date_added' => $dateAdded,
                'added_by' => Auth::id(),
            ]);
            $budgetNote = "Budget increased by ₹" . number_format($extraAmount, 2) . " on " . Carbon::parse($dateAdded)->format('d M Y');
            if ($reason) {
                $budgetNote .= ". Reason: " . $reason;
            }

            $existingNotes = $project->type_notes;
            $newNotes = $existingNotes
                ? $existingNotes . "\n[" . now()->format('d M Y H:i') . "] " . $budgetNote
                : "[" . now()->format('d M Y H:i') . "] " . $budgetNote;

            $project->update([
                'type_notes' => $newNotes,
            ]);

            $project->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Budget added successfully!',
                'data' => [
                    'project_id' => $project->id,
                    'project_name' => $project->project_name,
                    'previous_budget' => $oldBudget,
                    'added_amount' => $extraAmount,
                    'new_budget' => $newBudget,
                    'collected' => (float) $project->total_collected,
                    'balance' => $newBudget - (float) $project->total_collected,
                    'date_added' => $dateAdded,
                    'reason' => $reason,
                ]
            ]);
        } catch (Exception $e) {
            \Log::error('Add Budget Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add budget: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Budget History
    // ─────────────────────────────────────────────────────────────────────────
    public function budgetHistory(int $clientId, int $projectId): JsonResponse
    {
        try {
            $client = Client::findOrFail($clientId);
            $project = $client->projects()->findOrFail($projectId);

            $history = \App\Models\ProjectBudgetHistory::where('client_project_id', $project->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($h) {
                    return [
                        'id' => $h->id,
                        'project_id' => $h->client_project_id,
                        'extra_amount' => (float) $h->extra_amount,
                        'reason' => $h->reason,
                        'date_added' => $h->date_added->toDateString(),
                        'created_at' => $h->created_at->toDateString(),
                        'added_by' => $h->addedBy?->name,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch budget history',
            ], 500);
        }
    }

    public function updateBudgetHistory(Request $request, int $historyId): JsonResponse
    {
        try {
            $history = \App\Models\ProjectBudgetHistory::findOrFail($historyId);
            $project = ClientProject::findOrFail($history->client_project_id);

            $validated = $request->validate([
                'extra_amount' => 'required|numeric|min:0.01',
                'date_added'   => 'required|date',
                'reason'       => 'nullable|string|max:500',
            ]);

            $oldAmount = (float) $history->extra_amount;
            $newAmount = (float) $validated['extra_amount'];
            $diff = $newAmount - $oldAmount;

            $history->update([
                'extra_amount' => $newAmount,
                'date_added'   => $validated['date_added'],
                'reason'       => $validated['reason'] ?? null,
            ]);

            if ($diff !== 0.0) {
                $project->update(['total_budget' => (float) $project->total_budget + $diff]);
            }
            $project->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Budget entry updated successfully',
                'data' => [
                    'id' => $history->id,
                    'extra_amount' => (float) $history->extra_amount,
                    'reason' => $history->reason,
                    'date_added' => $history->date_added->toDateString(),
                    'new_project_budget' => (float) $project->total_budget,
                ],
            ]);
        } catch (Exception $e) {
            \Log::error('Update Budget History Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update budget entry: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroyBudgetHistory(int $historyId): JsonResponse
    {
        try {
            $history = \App\Models\ProjectBudgetHistory::findOrFail($historyId);
            $project = ClientProject::findOrFail($history->client_project_id);

            $project->update(['total_budget' => max(0, (float) $project->total_budget - (float) $history->extra_amount)]);
            $history->delete();

            return response()->json(['success' => true, 'message' => 'Budget entry deleted successfully']);
        } catch (Exception $e) {
            \Log::error('Delete Budget History Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete budget entry: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  COLLECT PAYMENT
    // ─────────────────────────────────────────────────────────────────────────
    public function collectPayment(Request $request, int $clientId, int $projectId): JsonResponse
    {
        try {
            $client = Client::findOrFail($clientId);
            $project = $client->projects()->findOrFail($projectId);

            $data = $request->validate([
                'amount'        => 'required|numeric|min:0.01',
                'payment_date'  => 'required|date',
                'payment_mode'  => 'required|in:cash,cheque,upi,bank_transfer,other',
                'reference'     => 'nullable|string|max:255',
                'notes'         => 'nullable|string',
            ]);

            $payment = ClientPayment::create([
                'client_project_id' => $project->id,
                'payment_date'      => $data['payment_date'],
                'amount'            => $data['amount'],
                'gst_amount'        => 0,
                'payment_mode'      => $data['payment_mode'],
                'reference_number'  => $data['reference'] ?? null,
                'notes'             => $data['notes'] ?? null,
                'created_by'        => Auth::id(),
            ]);

            $project->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Payment collected successfully!',
                'data' => [
                    'payment' => $this->formatPayment($payment),
                    'project' => [
                        'id' => $project->id,
                        'budget' => (float) $project->total_budget,
                        'collected' => (float) $project->total_collected,
                        'balance' => (float) $project->balance,
                    ]
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Collect Payment Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to collect payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function storePayment(Request $request, int $projectId): JsonResponse
    {
        $project = ClientProject::findOrFail($projectId);

        $data = $request->validate([
            'payment_date'     => 'required|date',
            'amount'           => 'required|numeric|min:0',
            'gst_amount'       => 'nullable|numeric|min:0',
            'payment_mode'     => ['required', Rule::in(['cash', 'cheque', 'upi', 'bank_transfer', 'other'])],
            'reference_number' => 'nullable|string|max:255',
            'notes'            => 'nullable|string',
            'next_due_date'    => 'nullable|date|after:payment_date',
        ]);

        $data['client_project_id'] = $project->id;
        $data['created_by']        = Auth::id();
        $data['gst_amount']        = $data['gst_amount'] ?? 0;

        $payment = ClientPayment::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data'    => $this->formatPayment($payment),
        ], 201);
    }

    public function updatePayment(Request $request, int $paymentId): JsonResponse
    {
        $payment = ClientPayment::findOrFail($paymentId);

        $data = $request->validate([
            'payment_date'     => 'required|date',
            'amount'           => 'required|numeric|min:0',
            'gst_amount'       => 'nullable|numeric|min:0',
            'payment_mode'     => ['required', Rule::in(['cash', 'cheque', 'upi', 'bank_transfer', 'other'])],
            'reference_number' => 'nullable|string|max:255',
            'notes'            => 'nullable|string',
            'next_due_date'    => 'nullable|date',
        ]);

        $data['gst_amount'] = $data['gst_amount'] ?? 0;
        $payment->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Payment updated successfully',
            'data'    => $this->formatPayment($payment),
        ]);
    }

    public function destroyPayment(int $paymentId): JsonResponse
    {
        $payment = ClientPayment::findOrFail($paymentId);
        $payment->delete();

        return response()->json(['success' => true, 'message' => 'Payment deleted successfully']);
    }

    public function summary(): JsonResponse
    {
        // 3 indexed aggregate queries — no Eloquent model loading
        $totalClients = DB::table('clients')->whereNull('deleted_at')->count();

        $proj = DB::table('client_projects')
            ->whereNull('deleted_at')
            ->selectRaw('COUNT(*) as total_projects, COALESCE(SUM(total_budget), 0) as total_budget')
            ->first();

        $pay = DB::table('client_payments as pay')
            ->join('client_projects as cp', 'cp.id', '=', 'pay.client_project_id')
            ->whereNull('pay.deleted_at')
            ->whereNull('cp.deleted_at')
            ->selectRaw('COALESCE(SUM(pay.amount), 0) as total_collected, COALESCE(SUM(pay.gst_amount), 0) as total_additional')
            ->first();

        $totalBudget    = (float) $proj->total_budget;
        $totalCollected = (float) $pay->total_collected;

        return response()->json([
            'success' => true,
            'data'    => [
                'total_clients'    => $totalClients,
                'total_projects'   => (int) $proj->total_projects,
                'total_budget'     => $totalBudget,
                'total_collected'  => $totalCollected,
                'total_additional' => (float) $pay->total_additional,
                'total_balance'    => $totalBudget - $totalCollected,
                'collected_pct'    => $totalBudget > 0
                    ? round(($totalCollected / $totalBudget) * 100, 2)
                    : 0,
            ],
        ]);
    }

    public function upcomingDues(): JsonResponse
    {
        try {
            $today  = Carbon::today();
            $cutoff = Carbon::today()->addDays(30);

            $payments = ClientPayment::with(['project.client'])
                ->whereNotNull('next_due_date')
                ->where('next_due_date', '<=', $cutoff)
                ->orderBy('next_due_date', 'asc')
                ->get();

            $data = $payments->map(function ($pay) use ($today) {
                $dueDate     = Carbon::parse($pay->next_due_date)->startOfDay();
                $daysUntilDue = $today->diffInDays($dueDate, false);
                return [
                    'payment_id'    => $pay->id,
                    'client_name'   => $pay->project?->client?->name    ?? 'Unknown Client',
                    'project_name'  => $pay->project?->project_name     ?? 'Unknown Project',
                    'amount'        => (float) $pay->amount,
                    'next_due_date' => $dueDate->format('d M Y'),
                    'days_until_due' => (int) round($daysUntilDue),
                ];
            })->values();

            return response()->json(['success' => true, 'data' => $data]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming dues',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function monthlyRevenue(): JsonResponse
    {
        try {
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $collected = ClientPayment::whereYear('payment_date', $date->year)
                    ->whereMonth('payment_date', $date->month)
                    ->sum('amount');
                $gstTotal = ClientPayment::whereYear('payment_date', $date->year)
                    ->whereMonth('payment_date', $date->month)
                    ->sum('gst_amount');
                $months[] = [
                    'month_label' => $date->format('M'),
                    'month'       => (int) $date->format('m'),
                    'year'        => (int) $date->format('Y'),
                    'collected'   => (float) $collected,
                    'gst_total'   => (float) $gstTotal,
                    'grand_total' => (float) ($collected + $gstTotal),
                ];
            }
            return response()->json(['success' => true, 'data' => $months]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly revenue',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function recentProjects(): JsonResponse
    {
        try {
            $projects = ClientProject::with(['client', 'payments'])
                ->orderBy('created_at', 'desc')
                ->limit(15)
                ->get()
                ->map(function ($p) {
                    $collected = (float) $p->payments->sum('amount');
                    $budget    = (float) $p->total_budget;
                    $progress  = $budget > 0 ? round(($collected / $budget) * 100) : 0;
                    $statusMap = [
                        'active'    => 'active',
                        'on_hold'   => 'hold',
                        'completed' => 'review',
                    ];

                    return [
                        'id'       => $p->id,
                        'name'     => $p->project_name,
                        'sub'      => ($p->client?->name ?? 'Unknown') . ' · ' . ($p->type_label ?? ucfirst($p->project_type)),
                        'status'   => $statusMap[$p->status] ?? 'pending',
                        'progress' => min($progress, 100),
                        'value'    => '₹' . number_format($budget / 100000, 1) . 'L',
                        'date'     => $p->created_at?->format('d M'),
                        'client_name'   => $p->client?->name ?? '—',
                        'project_type'  => $p->type_label ?? ucfirst($p->project_type),
                        'collected'     => $collected,
                        'balance'       => max(0, $budget - $collected),
                        'raw_budget'    => $budget,
                        'next_due_date' => $p->next_due_date ? \Carbon\Carbon::parse($p->next_due_date)->format('d M Y') : null,
                    ];
                });

            return response()->json(['success' => true, 'data' => $projects]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent projects',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    private function formatClient(Client $c, bool $withProjects = false): array
    {
        $base = [
            'id'               => $c->id,
            'name'             => $c->name,
            'id_number'        => $c->id_number,
            'email'            => $c->email,
            'address'          => $c->address,
            'city'             => $c->city,
            'notes'            => $c->notes,
            'total_budget'     => (float) $c->total_budget,
            'total_collected'  => (float) $c->total_collected,
            'total_additional' => (float) $c->total_additional,
            'total_balance'    => (float) $c->total_balance,
            'project_count'    => $c->project_count,
            'id_type_id'       => $c->id_type_id,
            'id_type_name'     => $c->id_type_name,
            'id_details'       => $c->id_details,
            'created_at'       => $c->created_at?->format('d M Y'),
        ];

        if ($withProjects) {
            $base['projects'] = $c->projects->map(fn($p) => $this->formatProject($p, true));
        }

        return $base;
    }

    private function formatProject(ClientProject $p, bool $withPayments = false): array
    {
        $base = [
            'id'               => $p->id,
            'client_id'        => $p->client_id,
            'project_name'     => $p->project_name,
            'project_type'     => $p->project_type,
            'type_label'       => $p->type_label,
            'start_date'       => $p->start_date?->format('d M Y'),
            'total_budget'     => (float) $p->total_budget,
            'total_collected'  => (float) $p->total_collected,
            'total_additional' => (float) $p->total_gst,
            'balance'          => (float) $p->balance,
            'collected_pct'    => $p->collected_percent,
            'balance_pct'      => $p->balance_percent,
            'next_due_date'    => $p->next_due_date,
            'description'      => $p->description,
            'type_notes'       => $p->type_notes,
            'status'           => $p->status,
            'status_label'     => $p->status_label,
            'created_at'       => $p->created_at?->format('d M Y'),
        ];

        if ($withPayments) {
            $base['payments'] = $p->payments->map(fn($pay) => $this->formatPayment($pay));
        }

        return $base;
    }

    private function formatPayment(ClientPayment $pay): array
    {
        return [
            'id'               => $pay->id,
            'project_id'       => $pay->client_project_id,
            'payment_date'     => $pay->payment_date?->format('Y-m-d'),
            'amount'           => (float) $pay->amount,
            'gst_amount'       => (float) $pay->gst_amount,
            'total_amount'     => (float) $pay->total_amount,
            'payment_mode'     => $pay->payment_mode,
            'mode_label'       => $pay->mode_label,
            'reference_number' => $pay->reference_number,
            'notes'            => $pay->notes,
            'next_due_date'    => $pay->next_due_date?->format('Y-m-d'),
            'created_by_name'  => $pay->createdBy?->name,
            'created_at'       => $pay->created_at?->format('d M Y H:i'),
        ];
    }
}
