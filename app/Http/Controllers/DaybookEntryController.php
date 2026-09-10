<?php

namespace App\Http\Controllers;

use App\Models\DaybookEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DaybookEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->get('date', today()->toDateString());

        $entries = DaybookEntry::with(['category', 'subCategory', 'bioData', 'subName'])
            ->whereDate('transaction_date', $date)
            ->latest()
            ->get()
            ->map(fn($e) => $this->transform($e));

        return response()->json([
            'entries' => $entries,
            'stats'   => $this->getStats($date),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  GET /api/daybook/{daybook}  <-- ADD THIS MISSING METHOD
    // ─────────────────────────────────────────────────────────
    public function show(DaybookEntry $daybook): JsonResponse
    {
        $daybook->load(['category', 'subCategory', 'bioData', 'subName']);

        return response()->json([
            'entry' => $this->transform($daybook),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  GET /api/daybook/transactions?from_date=...&to_date=
    // ─────────────────────────────────────────────────────────
    public function transactions(Request $request): JsonResponse
    {
        $query = DaybookEntry::with(['category', 'subCategory', 'bioData', 'subName'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->filled('from_date')) {
            $fromDate = $request->get('from_date');
            $toDate   = $request->get('to_date', Carbon::now()->toDateString());
            $query->whereBetween('transaction_date', [$fromDate, $toDate]);
        }

        $bioIds = $request->get('bio_ids', []);
        if (is_string($bioIds) && !empty($bioIds)) {
            $bioIds = explode(',', $bioIds);
        }

        if (!empty($bioIds)) {
            $bioNames = \App\Models\BioData::whereIn('id', $bioIds)->pluck('name')->toArray();

            $query->where(function ($q) use ($bioIds, $bioNames) {
                $q->whereIn('bio_data_id', $bioIds);
                if (!empty($bioNames)) {
                    $q->orWhereIn('client_name', $bioNames);
                }
            });
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('narration', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%")
                    ->orWhereHas('bioData',    fn($b) => $b->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('category',   fn($c) => $c->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('subCategory', fn($s) => $s->where('name', 'like', "%{$search}%"))
                    ->orWhere('payment_mode',  'like', "%{$search}%");
            });
        }

        if ($catId = $request->get('category_id')) {
            $query->where('category_id', $catId);
        }

        if ($pay = $request->get('payment_mode')) {
            $query->where('payment_mode', $pay);
        }

        $entries = $query->get()->map(fn($e) => $this->transform($e));

        $income  = $entries->where('category_type', 'income')->sum('amount');
        $expense = $entries->where('category_type', 'expense')->sum('amount');

        return response()->json([
            'entries' => $entries,
            'stats'   => [
                'income'  => round((float) $income,  2),
                'expense' => round((float) $expense, 2),
                'balance' => round((float) ($income - $expense), 2),
                'count'   => $entries->count(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  POST /api/daybook
    // ─────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'transaction_date' => 'required|date',
            'amount'           => 'required|numeric|min:0.01',
            'payment_mode'     => 'required|in:Cash,UPI,NEFT,Cheque,Bank Transfer,Others',
            'category_id'      => 'required|exists:categories,id',
            'sub_category_id'  => 'nullable|exists:sub_categories,id',
            'bio_data_id'      => 'nullable|exists:bio_data,id',
            'sub_name_id'      => 'nullable|exists:sub_names,id',
            'client_name'      => 'nullable|string|max:255',
            'narration'        => 'nullable|string|max:500',
        ]);

        $data['created_by']      = Auth::id();
        $data['created_by_name'] = Auth::user()?->name;

        $entry = DaybookEntry::create($data);
        $entry->load(['category', 'subCategory', 'bioData', 'subName']);

        return response()->json([
            'message' => 'Entry saved successfully.',
            'entry'   => $this->transform($entry),
            'stats'   => $this->getStats($data['transaction_date']),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────
    //  PUT /api/daybook/{daybook}  <-- FIXED parameter name
    // ─────────────────────────────────────────────────────────
    public function update(Request $request, DaybookEntry $daybook): JsonResponse
    {
        $data = $request->validate([
            'transaction_date' => 'required|date',
            'amount'           => 'required|numeric|min:0.01',
            'payment_mode'     => 'required|in:Cash,UPI,NEFT,Cheque,Bank Transfer,Others',
            'category_id'      => 'required|exists:categories,id',
            'sub_category_id'  => 'nullable|exists:sub_categories,id',
            'bio_data_id'      => 'nullable|exists:bio_data,id',
            'sub_name_id'      => 'nullable|exists:sub_names,id',
            'client_name'      => 'nullable|string|max:255',
            'narration'        => 'nullable|string|max:500',
        ]);

        $daybook->update($data);
        $daybook->load(['category', 'subCategory', 'bioData', 'subName']);

        return response()->json([
            'message' => 'Entry updated successfully.',
            'entry'   => $this->transform($daybook),
            'stats'   => $this->getStats($data['transaction_date']),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  DELETE /api/daybook/{daybook}  <-- FIXED parameter name
    // ─────────────────────────────────────────────────────────
    public function destroy(DaybookEntry $daybook): JsonResponse
    {
        $date = $daybook->transaction_date->toDateString();
        $daybook->delete();

        return response()->json([
            'message' => 'Entry deleted successfully.',
            'stats'   => $this->getStats($date),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  Private Helpers
    // ─────────────────────────────────────────────────────────
    private function transform(DaybookEntry $e): array
    {
        return [
            'id'                => $e->id,
            'transaction_date'  => $e->transaction_date->toDateString(),
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
            'created_by_name'   => $e->created_by_name,
        ];
    }

    // Getstats Start
    private function getStats(string $date): array
    {
        $entries = DaybookEntry::with('category')
            ->whereDate('transaction_date', $date)
            ->get();

        $income  = 0.0;
        $expense = 0.0;

        foreach ($entries as $entry) {
            if ($entry->category?->type === 'income') {
                $income += (float) $entry->amount;
            } else {
                $expense += (float) $entry->amount;
            }
        }

        return [
            'income'  => round($income,  2),
            'expense' => round($expense, 2),
            'balance' => round($income - $expense, 2),
        ];
    }
    // GetStats End

    public function allEntries()
    {
        $entries = DB::table('daybook_entries')
            ->leftJoin('categories', 'daybook_entries.category_id', '=', 'categories.id')
            ->leftJoin('sub_categories', 'daybook_entries.sub_category_id', '=', 'sub_categories.id')
            ->leftJoin('bio_data', 'daybook_entries.bio_data_id', '=', 'bio_data.id')
            ->select(
                'daybook_entries.*',
                'categories.name as category_name',
                'categories.type as category_type',
                'sub_categories.name as sub_category_name',
                'bio_data.name as bio_data_name'
            )
            ->whereNull('daybook_entries.deleted_at')
            ->orderBy('daybook_entries.transaction_date', 'desc')
            ->orderBy('daybook_entries.id', 'desc')
            ->get();

        return response()->json(['entries' => $entries]);
    }
}
