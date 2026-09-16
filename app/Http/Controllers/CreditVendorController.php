<?php

namespace App\Http\Controllers;

use App\Models\CreditVendor;
use App\Models\CreditEntry;
use App\Models\CreditPayment;
use App\Models\DaybookEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;

class CreditVendorController extends Controller
{
    private const DEFAULT_PER_PAGE = 20;
    private const MAX_PER_PAGE = 100;
    private const UPCOMING_DAYS_DEFAULT = 7;

    private function actor(): array
    {
        $user = Auth::user();
        return [
            'created_by'      => $user?->id,
            'created_by_name' => $user?->name ?? 'System',
        ];
    }

    private function ok($data, string $message = 'Success', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    private function fail(string $message, int $status = 422, array $errors = []): JsonResponse
    {
        $response = ['success' => false, 'message' => $message];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $status);
    }

    private function formatEntry(CreditEntry $entry): array
    {
        return [
            'id'              => $entry->id,
            'vendor_id'       => $entry->vendor_id,
            'client_name'     => $entry->client_name,
            'credit_date'     => $entry->credit_date?->format('Y-m-d'),
            'bill_number'     => $entry->bill_number,
            'description'     => $entry->description,
            'credit_amount'   => (float) $entry->credit_amount,
            'due_date'        => $entry->due_date?->format('Y-m-d'),
            'priority'        => $entry->priority,
            'notes'           => $entry->notes,
            'amount_paid'     => (float) $entry->amount_paid,
            'bill_balance'    => (float) $entry->bill_balance,
            'is_paid'         => $entry->is_paid,
            'is_overdue'      => $entry->is_overdue,
            'days_overdue'    => $entry->days_overdue,
            'settled_at'      => $entry->is_paid
                                    ? $entry->linkedPayments()->max('payment_date')
                                    : null,
            'created_by_name' => $entry->created_by_name,
            'created_at'      => $entry->created_at?->format('Y-m-d H:i:s'),
            'updated_at'      => $entry->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function formatPayment(CreditPayment $payment): array
    {
        return [
            'id'               => $payment->id,
            'vendor_id'        => $payment->vendor_id,
            // Fall back to the linked bill's client_name for older payments recorded before
            // repayments started inheriting it automatically at creation time.
            'client_name'      => $payment->client_name ?: $payment->creditEntry?->client_name,
            'credit_entry_id'  => $payment->credit_entry_id,
            'daybook_entry_id' => $payment->daybook_entry_id,
            'bill_number'      => $payment->creditEntry?->bill_number,
            'bill_description' => $payment->creditEntry?->description,
            'payment_date'     => $payment->payment_date?->format('Y-m-d'),
            'amount_paid'      => (float) $payment->amount_paid,
            'payment_mode'     => $payment->payment_mode,
            'reference'        => $payment->reference,
            'notes'            => $payment->notes,
            'is_linked'        => $payment->is_linked,
            'created_by_name'  => $payment->created_by_name,
            'created_at'       => $payment->created_at?->format('Y-m-d H:i:s'),
            'updated_at'       => $payment->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function findVendorOrFail(int $id): CreditVendor
    {
        return CreditVendor::findOrFail($id);
    }

    private function findEntryOrFail(int $id): CreditEntry
    {
        return CreditEntry::findOrFail($id);
    }

    private function findPaymentOrFail(int $id): CreditPayment
    {
        return CreditPayment::findOrFail($id);
    }

    // =========================================================================
    // VENDORS
    // =========================================================================

    public function indexVendors(Request $request): JsonResponse
    {
        try {
            $query = CreditVendor::with(['category:id,name', 'subCategory:id,name']);

            if ($request->filled('category_id')) {
                $query->byCategory((int) $request->category_id);
            }
            if ($request->filled('sub_category_id')) {
                $query->bySubCategory((int) $request->sub_category_id);
            }
            if ($request->boolean('active_only', false)) {
                $query->active();
            }
            if ($request->filled('search')) {
                $searchTerm = '%' . $request->search . '%';
                $query->where(function ($qb) use ($searchTerm) {
                    $qb->where('party_name', 'like', $searchTerm)
                        ->orWhere('business_name', 'like', $searchTerm)
                        ->orWhere('phone', 'like', $searchTerm)
                        ->orWhere('gstin', 'like', $searchTerm);
                });
            }

            $perPage = min((int) $request->get('per_page', self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
            $vendors = $query->orderBy('party_name')->paginate($perPage);
            $vendors->getCollection()->transform(fn($v) => $v->toSummaryArray());

            return $this->ok($vendors, 'Vendors retrieved successfully');
        } catch (\Throwable $e) {
            \Log::error('CreditVendor indexVendors failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return $this->fail('Failed to retrieve vendors: ' . $e->getMessage(), 500);
        }
    }

    public function storeVendor(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'bio_data_id'     => 'nullable|exists:bio_data,id',
                'category_id'     => 'required|exists:categories,id',
                'sub_category_id' => 'nullable|exists:sub_categories,id',
                'party_name'      => 'required|string|max:255',
                'phone'           => 'nullable|string|max:20',
                'business_name'   => 'nullable|string|max:255',
                'address'         => 'nullable|string',
                'gstin'           => 'nullable|string|max:20|unique:credit_vendors,gstin',
                'is_active'       => 'boolean',
            ]);

            $vendor = CreditVendor::create(array_merge($validated, $this->actor()));

            return $this->ok(
                $vendor->fresh()->toSummaryArray(),
                'Vendor created successfully',
                201
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->fail('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->fail('Failed to create vendor: ' . $e->getMessage(), 500);
        }
    }

    public function showVendor(int $id): JsonResponse
    {
        try {
            $vendor = CreditVendor::with([
                'category:id,name',
                'subCategory:id,name',
                'creditEntries'  => fn($q) => $q->latest('credit_date'),
                'creditPayments' => fn($q) => $q->latest('payment_date'),
            ])->findOrFail($id);

            $summary = $vendor->toSummaryArray();
            $summary['entries']  = $vendor->creditEntries->map(fn($e) => $this->formatEntry($e));
            $summary['payments'] = $vendor->creditPayments->map(fn($p) => $this->formatPayment($p));
            $statTotalCredit = (float) $vendor->creditEntries()->reorder()->sum('credit_amount');
            $statTotalPaid   = (float) $vendor->creditPayments()->reorder()->whereNotNull('credit_entry_id')->sum('amount_paid');
            $summary['statistics'] = [
                'total_entries'       => $vendor->creditEntries()->reorder()->count(),
                'total_payments'      => $vendor->creditPayments()->reorder()->count(),
                'total_credit_amount' => $statTotalCredit,
                'total_paid_amount'   => $statTotalPaid,
                'outstanding_balance' => round($statTotalCredit - $statTotalPaid, 2),
            ];

            return $this->ok($summary, 'Vendor retrieved successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Throwable $e) {
            return $this->fail('Failed to retrieve vendor: ' . $e->getMessage(), 500);
        }
    }

    public function updateVendor(Request $request, int $id): JsonResponse
    {
        try {
            $vendor = $this->findVendorOrFail($id);

            $validated = $request->validate([
                'bio_data_id'     => 'nullable|exists:bio_data,id',
                'category_id'     => 'sometimes|exists:categories,id',
                'sub_category_id' => 'nullable|exists:sub_categories,id',
                'party_name'      => 'sometimes|string|max:255',
                'phone'           => 'nullable|string|max:20',
                'business_name'   => 'nullable|string|max:255',
                'address'         => 'nullable|string',
                'gstin'           => 'nullable|string|max:20|unique:credit_vendors,gstin,' . $id,
                'is_active'       => 'boolean',
            ]);

            $vendor->update($validated);

            return $this->ok(
                $vendor->fresh()->toSummaryArray(),
                'Vendor updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->fail('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->fail('Failed to update vendor: ' . $e->getMessage(), 500);
        }
    }

    public function destroyVendor(int $id): JsonResponse
    {
        try {
            $vendor = $this->findVendorOrFail($id);

            DB::beginTransaction();
            // Cascade soft-delete all entries and payments for this vendor
            $vendor->creditPayments()->each(fn($p) => $p->delete());
            $vendor->creditEntries()->each(fn($e) => $e->delete());
            $vendor->delete();
            DB::commit();

            return $this->ok(null, 'Vendor ledger moved to Recycle Bin');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to delete vendor: ' . $e->getMessage(), 500);
        }
    }

    // =========================================================================
    // CREDIT ENTRIES
    // =========================================================================

    public function indexEntries(Request $request, int $vendorId): JsonResponse
    {
        try {
            $this->findVendorOrFail($vendorId);

            $query = CreditEntry::where('vendor_id', $vendorId)
                ->with(['linkedPayments' => function ($q) {
                    $q->select('id', 'credit_entry_id', 'amount_paid', 'payment_date', 'payment_mode');
                }]);

            if ($request->filled('priority')) {
                $query->byPriority($request->priority);
            }
            if ($request->boolean('overdue', false)) {
                $query->overdue();
            }
            if ($request->boolean('upcoming', false)) {
                $query->upcoming((int) $request->get('days', self::UPCOMING_DAYS_DEFAULT));
            }
            if ($request->boolean('unpaid', false)) {
                $query->where('is_paid', false);
            }

            $perPage = min((int) $request->get('per_page', self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
            $entries = $query->orderBy('credit_date', 'desc')->paginate($perPage);
            $entries->getCollection()->transform(fn($e) => $this->formatEntry($e));

            return $this->ok($entries, 'Entries retrieved successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Throwable $e) {
            return $this->fail('Failed to retrieve entries: ' . $e->getMessage(), 500);
        }
    }

    public function storeEntry(Request $request, int $vendorId): JsonResponse
    {
        try {
            $this->findVendorOrFail($vendorId);

            $validated = $request->validate([
                'bill_number'   => 'required|string|max:100',
                'client_name'   => 'nullable|string|max:255',
                'credit_date'   => 'required|date',
                'description'   => 'nullable|string|max:500',
                'credit_amount' => 'required|numeric|min:0.01',
                'due_date'      => 'nullable|date|after_or_equal:credit_date',
                'priority'      => ['nullable', Rule::in(CreditEntry::PRIORITIES)],
                'notes'         => 'nullable|string|max:1000',
            ]);

            DB::beginTransaction();
            // Bill / invoice number is now entered manually by the user
            // instead of being auto-assigned. No uniqueness constraint is
            // enforced here since real-world vendor invoice numbers can
            // legitimately repeat across vendors.
            $entry = CreditEntry::create(array_merge($validated, [
                'vendor_id' => $vendorId,
            ], $this->actor()));
            DB::commit();

            return $this->ok($this->formatEntry($entry), 'Credit entry added successfully', 201);
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->fail('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to add credit entry: ' . $e->getMessage(), 500);
        }
    }

    public function updateEntry(Request $request, int $entryId): JsonResponse
    {
        try {
            $entry = $this->findEntryOrFail($entryId);

            // bill_number is manually entered, so it's editable like any
            // other field.
            $validated = $request->validate([
                'bill_number'   => 'sometimes|required|string|max:100',
                'client_name'   => 'nullable|string|max:255',
                'credit_date'   => 'sometimes|date',
                'description'   => 'nullable|string|max:500',
                'credit_amount' => 'sometimes|numeric|min:0.01',
                'due_date'      => 'nullable|date|after_or_equal:credit_date',
                'priority'      => ['nullable', Rule::in(CreditEntry::PRIORITIES)],
                'notes'         => 'nullable|string|max:1000',
            ]);

            if (isset($validated['credit_amount']) && $validated['credit_amount'] < $entry->amount_paid) {
                return $this->fail(
                    'Cannot reduce credit amount below the amount already paid (₹' . number_format($entry->amount_paid, 2) . ')',
                    422
                );
            }

            DB::beginTransaction();
            $entry->update($validated);
            $entry->refresh();
            DB::commit();

            return $this->ok($this->formatEntry($entry), 'Entry updated successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Credit entry not found', 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->fail('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to update entry: ' . $e->getMessage(), 500);
        }
    }

    public function destroyEntry(int $entryId): JsonResponse
    {
        try {
            $entry    = $this->findEntryOrFail($entryId);
            $vendorId = $entry->vendor_id;

            DB::beginTransaction();

            // 1. Soft-delete payments directly linked to this bill
            $linkedCount = $entry->linkedPayments()->count();
            $entry->linkedPayments()->each(fn($p) => $p->delete());

            // 2. Soft-delete this bill
            $entry->delete();

            // 3. If no bills remain for this vendor, clean up all orphaned/general payments
            $remainingBills = CreditEntry::where('vendor_id', $vendorId)->count();
            $orphanCount = 0;
            if ($remainingBills === 0) {
                $orphanPayments = CreditPayment::where('vendor_id', $vendorId)->get();
                $orphanCount    = $orphanPayments->count();
                $orphanPayments->each(fn($p) => $p->delete());
            }

            DB::commit();

            $totalDeleted = $linkedCount + $orphanCount;
            return $this->ok(
                ['deleted_payments' => $totalDeleted],
                $totalDeleted > 0
                    ? "Bill and {$totalDeleted} payment(s) moved to Recycle Bin"
                    : 'Bill moved to Recycle Bin'
            );
        } catch (ModelNotFoundException $e) {
            return $this->fail('Credit entry not found', 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to delete entry: ' . $e->getMessage(), 500);
        }
    }

    // =========================================================================
    // CREDIT PAYMENTS
    // =========================================================================

    public function indexPayments(Request $request, int $vendorId): JsonResponse
    {
        try {
            $this->findVendorOrFail($vendorId);
            $query = CreditPayment::where('vendor_id', $vendorId)
                ->with(['creditEntry:id,bill_number,description,credit_amount']);
            if ($request->filled('mode')) {
                $query->byMode($request->mode);
            }
            if ($request->filled('from_date') && $request->filled('to_date')) {
                $query->dateRange($request->from_date, $request->to_date);
            }
            if ($request->boolean('linked_only', false)) {
                $query->whereNotNull('credit_entry_id');
            }
            if ($request->boolean('unlinked_only', false)) {
                $query->whereNull('credit_entry_id');
            }

            $perPage = min((int) $request->get('per_page', self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
            $payments = $query->orderBy('payment_date', 'desc')->paginate($perPage);
            $payments->getCollection()->transform(fn($p) => $this->formatPayment($p));

            return $this->ok($payments, 'Payments retrieved successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Throwable $e) {
            return $this->fail('Failed to retrieve payments: ' . $e->getMessage(), 500);
        }
    }

    public function storePayment(Request $request, int $vendorId): JsonResponse
    {
        try {
            $vendor = $this->findVendorOrFail($vendorId);

            $validated = $request->validate([
                'client_name'     => 'nullable|string|max:255',
                'payment_date'    => 'required|date',
                'amount_paid'     => 'required|numeric|min:0.01',
                'payment_mode'    => ['required', Rule::in(CreditPayment::PAYMENT_MODES)],
                'reference'       => 'nullable|string|max:100',
                'notes'           => 'nullable|string|max:1000',
                'credit_entry_id' => 'nullable|exists:credit_entries,id',
            ]);

            if (!empty($validated['credit_entry_id'])) {
                $entry = CreditEntry::findOrFail($validated['credit_entry_id']);
                if ($entry->vendor_id !== $vendor->id) {
                    return $this->fail('Credit entry does not belong to this vendor', 422);
                }
                $remainingBalance = $entry->credit_amount - $entry->amount_paid;
                if ($validated['amount_paid'] > $remainingBalance) {
                    return $this->fail(
                        sprintf('Payment amount (₹%.2f) exceeds remaining bill balance (₹%.2f)', $validated['amount_paid'], $remainingBalance),
                        422
                    );
                }
                // Auto-inherit the client name from the linked bill when not explicitly provided
                if (empty($validated['client_name']) && !empty($entry->client_name)) {
                    $validated['client_name'] = $entry->client_name;
                }
            }

            DB::beginTransaction();
            $payment = CreditPayment::create(array_merge($validated, [
                'vendor_id' => $vendorId,
            ], $this->actor()));
            DB::commit();

            $response = $this->formatPayment($payment);
            $response['vendor_summary'] = $vendor->fresh()->toSummaryArray();

            return $this->ok($response, 'Payment recorded successfully', 201);
        } catch (ModelNotFoundException $e) {
            return $this->fail('Resource not found', 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->fail('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to record payment: ' . $e->getMessage(), 500);
        }
    }

    public function updatePayment(Request $request, int $paymentId): JsonResponse
    {
        try {
            $payment = $this->findPaymentOrFail($paymentId);

            $validated = $request->validate([
                'client_name'     => 'nullable|string|max:255',
                'payment_date'    => 'sometimes|date',
                'amount_paid'     => 'sometimes|numeric|min:0.01',
                'payment_mode'    => ['sometimes', Rule::in(CreditPayment::PAYMENT_MODES)],
                'reference'       => 'nullable|string|max:100',
                'notes'           => 'nullable|string|max:1000',
                'credit_entry_id' => 'nullable|exists:credit_entries,id',
                'daybook_entry_id'=> 'nullable|integer',
            ]);

            if (array_key_exists('credit_entry_id', $validated) && $validated['credit_entry_id']) {
                $entry = CreditEntry::findOrFail($validated['credit_entry_id']);
                if ($entry->vendor_id !== $payment->vendor_id) {
                    return $this->fail('Credit entry does not belong to the same vendor', 422);
                }
                if (isset($validated['amount_paid'])) {
                    // Exclude the current payment's existing contribution to this entry's paid total
                    $alreadyPaidByThis = ($payment->credit_entry_id === $entry->id) ? $payment->amount_paid : 0;
                    $otherPayments = $entry->credit_amount - ($entry->amount_paid - $alreadyPaidByThis);
                    $remainingBalance = max(0, $otherPayments);
                    if ($validated['amount_paid'] > $remainingBalance) {
                        return $this->fail(
                            sprintf('Payment amount (₹%.2f) exceeds bill balance (₹%.2f)', $validated['amount_paid'], $remainingBalance),
                            422
                        );
                    }
                }
                if (empty($validated['client_name']) && !empty($entry->client_name)) {
                    $validated['client_name'] = $entry->client_name;
                }
            }

            DB::beginTransaction();
            $payment->update($validated);
            DB::commit();

            return $this->ok($this->formatPayment($payment->fresh()), 'Payment updated successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Payment not found', 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->fail('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to update payment: ' . $e->getMessage(), 500);
        }
    }

    public function destroyPayment(int $paymentId): JsonResponse
    {
        try {
            $payment = $this->findPaymentOrFail($paymentId);

            DB::beginTransaction();

            // Also delete the linked Daybook entry if one was created during sync
            if ($payment->daybook_entry_id) {
                DaybookEntry::find($payment->daybook_entry_id)?->delete();
            }

            $payment->delete();
            DB::commit();

            return $this->ok(null, 'Payment deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Payment not found', 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->fail('Failed to delete payment: ' . $e->getMessage(), 500);
        }
    }

    // =========================================================================
    // SUMMARY & METADATA
    // =========================================================================

    public function summary(Request $request): JsonResponse
    {
        try {
            $categoryId    = $request->filled('category_id') ? (int) $request->category_id : null;
            $subCategoryId = $request->filled('sub_category_id') ? (int) $request->sub_category_id : null;

            $vendorQ = CreditVendor::query();
            if ($categoryId)    $vendorQ->byCategory($categoryId);
            if ($subCategoryId) $vendorQ->bySubCategory($subCategoryId);

            $vendorIds = $vendorQ->pluck('id');

            if ($vendorIds->isEmpty()) {
                return $this->ok([
                    'total_vendors'      => 0,
                    'active_vendors'     => 0,
                    'total_credit'       => 0,
                    'total_paid'         => 0,
                    'balance'            => 0,
                    'overdue_count'      => 0,
                    'upcoming_count'     => 0,
                    'priority_breakdown' => [],
                    'payment_mode_last30'=> [],
                ], 'Summary retrieved successfully');
            }

            $totalCredit   = CreditEntry::whereIn('vendor_id', $vendorIds)->sum('credit_amount');
            // Only count payments allocated to specific bills — unallocated (skip) payments
            // are recorded in the daybook but don't reduce a bill's balance
            $totalPaid     = CreditPayment::whereIn('vendor_id', $vendorIds)
                                ->whereNotNull('credit_entry_id')
                                ->sum('amount_paid');
            $totalVendors  = $vendorIds->count();
            $activeVendors = CreditVendor::whereIn('id', $vendorIds)->where('is_active', true)->count();

            $overdueCount = CreditEntry::whereIn('vendor_id', $vendorIds)
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', now()->toDateString())
                ->count();

            $upcomingDays  = (int) $request->get('days', self::UPCOMING_DAYS_DEFAULT);
            $upcomingCount = CreditEntry::whereIn('vendor_id', $vendorIds)
                ->whereNotNull('due_date')
                ->whereDate('due_date', '>=', now()->toDateString())
                ->whereDate('due_date', '<=', now()->addDays($upcomingDays)->toDateString())
                ->count();

            $priorityBreakdown = CreditEntry::whereIn('vendor_id', $vendorIds)
                ->selectRaw('priority, COUNT(*) as cnt, SUM(credit_amount) as total')
                ->groupBy('priority')
                ->get()
                ->map(fn($item) => [
                    'count'   => (int) $item->cnt,
                    'total'   => (float) $item->total,
                    'paid'    => 0.0,
                    'balance' => (float) $item->total,
                ]);

            $paymentModeBreakdown = CreditPayment::whereIn('vendor_id', $vendorIds)
                ->where('payment_date', '>=', now()->subDays(30)->toDateString())
                ->selectRaw('payment_mode, COUNT(*) as cnt, SUM(amount_paid) as total')
                ->groupBy('payment_mode')
                ->get()
                ->map(fn($item) => [
                    'count' => (int) $item->cnt,
                    'total' => (float) $item->total,
                ]);

            return $this->ok([
                'total_vendors'       => $totalVendors,
                'active_vendors'      => $activeVendors,
                'total_credit'        => (float) $totalCredit,
                'total_paid'          => round((float) $totalPaid, 2),
                'balance'             => round((float) ($totalCredit - $totalPaid), 2),
                'overdue_count'       => $overdueCount,
                'upcoming_count'      => $upcomingCount,
                'priority_breakdown'  => $priorityBreakdown,
                'payment_mode_last30' => $paymentModeBreakdown,
            ], 'Summary retrieved successfully');
        } catch (\Throwable $e) {
            return $this->fail('Failed to generate summary: ' . $e->getMessage(), 500);
        }
    }

    public function meta(): JsonResponse
    {
        return $this->ok([
            'priorities'         => CreditEntry::PRIORITIES,
            'payment_modes'      => CreditPayment::PAYMENT_MODES,
            'priority_labels'    => [
                'low'    => 'Low Priority',
                'medium' => 'Medium Priority',
                'high'   => 'High Priority',
                'urgent' => 'Urgent',
            ],
            'payment_mode_labels' => [
                'cash'          => 'Cash',
                'bank_transfer' => 'Bank Transfer',
                'cheque'        => 'Cheque',
                'credit_card'   => 'Credit Card',
                'debit_card'    => 'Debit Card',
                'upi'           => 'UPI',
                'other'         => 'Other',
            ],
        ], 'Metadata retrieved successfully');
    }

    public function vendorBalanceSheet(int $vendorId): JsonResponse
    {
        try {
            $vendor  = $this->findVendorOrFail($vendorId);
            $entries = CreditEntry::where('vendor_id', $vendorId)
                ->with(['linkedPayments' => fn($q) => $q->orderBy('payment_date', 'desc')])
                ->orderBy('credit_date', 'desc')
                ->get();

            return $this->ok([
                'vendor'       => $vendor->toSummaryArray(),
                'total_credit' => (float) $entries->sum('credit_amount'),
                'total_paid'   => (float) $entries->sum('amount_paid'),
                'balance'      => (float) ($entries->sum('credit_amount') - $entries->sum('amount_paid')),
                'entries'      => $entries->map(fn($e) => [
                    'entry'    => $this->formatEntry($e),
                    'payments' => $e->linkedPayments->map(fn($p) => $this->formatPayment($p)),
                ]),
            ], 'Balance sheet retrieved successfully');
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vendor not found', 404);
        } catch (\Throwable $e) {
            return $this->fail('Failed to retrieve balance sheet: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/credit-management/notifications
     * Returns overdue + upcoming-30-day credit entries for navbar bell.
     */
    public function getNotifications(): JsonResponse
    {
        try {
            $today  = Carbon::today();
            $cutoff = Carbon::today()->addDays(30);

            $entries = CreditEntry::with('vendor')
                ->whereNotNull('due_date')
                ->where(function ($q) use ($today, $cutoff) {
                    $q->whereDate('due_date', '<', $today)   // overdue
                      ->orWhere(function ($q2) use ($today, $cutoff) {
                          $q2->whereDate('due_date', '>=', $today)
                             ->whereDate('due_date', '<=', $cutoff);
                      });
                })
                ->orderBy('due_date', 'asc')
                ->get();

            $data = $entries->map(function ($entry) use ($today) {
                $dueDate      = Carbon::parse($entry->due_date)->startOfDay();
                $daysUntilDue = (int) round($today->diffInDays($dueDate, false));
                return [
                    'credit_entry_id' => $entry->id,
                    'vendor_name'     => $entry->vendor?->party_name ?? 'Vendor',
                    'bill_number'     => $entry->bill_number ?? '-',
                    'credit_amount'   => (float) $entry->credit_amount,
                    'due_date'        => $dueDate->format('d M Y'),
                    'days_until_due'  => $daysUntilDue,
                    'type'            => $daysUntilDue < 0 ? 'overdue' : 'upcoming',
                    'priority'        => $entry->priority,
                    'bill_balance'    => (float) $entry->bill_balance,
                ];
            });

            return $this->ok($data, 'Notifications retrieved successfully');
        } catch (\Throwable $e) {
            return $this->fail('Failed to retrieve notifications: ' . $e->getMessage(), 500);
        }
    }
}
