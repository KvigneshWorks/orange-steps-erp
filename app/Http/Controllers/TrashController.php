<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

use App\Models\Category;
use App\Models\SubCategory;
use App\Models\IDType;
use App\Models\BioData;
use App\Models\SubName;
use App\Models\Client;
use App\Models\ClientProject;
use App\Models\ClientPayment;
use App\Models\ProjectBudgetHistory;
use App\Models\DaybookEntry;
use App\Models\CreditVendor;
use App\Models\CreditEntry;
use App\Models\CreditPayment;
use App\Models\Worker;

class TrashController extends Controller
{
    private function modelMap(): array
    {
        return [
            'categories'      => ['model' => Category::class,      'label' => 'Category',       'name_col' => 'name'],
            'sub_categories'  => ['model' => SubCategory::class,   'label' => 'Sub Category',   'name_col' => 'name'],
            'id_types'        => ['model' => IDType::class,         'label' => 'ID Type',        'name_col' => 'type_name'],
            'bio_data'        => ['model' => BioData::class,        'label' => 'Bio Data',       'name_col' => 'name'],
            'sub_names'       => ['model' => SubName::class,        'label' => 'Sub Name',       'name_col' => 'alternate_name'],
            'clients'         => ['model' => Client::class,         'label' => 'Client',         'name_col' => 'name'],
            'client_projects' => ['model' => ClientProject::class,  'label' => 'Project',        'name_col' => 'project_name'],
            'client_payments' => ['model' => ClientPayment::class,  'label' => 'Payment',        'name_col' => 'id'],
            'project_budget_histories' => ['model' => ProjectBudgetHistory::class, 'label' => 'Budget Addition', 'name_col' => 'reason'],
            'daybook_entries' => ['model' => DaybookEntry::class,   'label' => 'Daybook Entry',  'name_col' => 'narration'],
            'credit_vendors'  => ['model' => CreditVendor::class,   'label' => 'Credit Ledger',  'name_col' => 'party_name'],
            'credit_entries'  => ['model' => CreditEntry::class,    'label' => 'Credit Entry',   'name_col' => 'id'],
            'credit_payments' => ['model' => CreditPayment::class,  'label' => 'Credit Payment', 'name_col' => 'id'],
            'workers'         => ['model' => Worker::class,          'label' => 'Worker',         'name_col' => 'name'],
        ];
    }

    public function index(): JsonResponse
    {
        $map    = $this->modelMap();
        $groups = [];
        $total  = 0;

        foreach ($map as $key => $cfg) {
            try {
                $records = $cfg['model']::onlyTrashed()
                    ->orderByDesc('deleted_at')
                    ->limit(200)
                    ->get()
                    ->map(fn($r) => $this->format($r, $key, $cfg));

                if ($records->isNotEmpty()) {
                    $groups[] = [
                        'key'     => $key,
                        'label'   => $cfg['label'],
                        'count'   => $records->count(),
                        'records' => $records,
                    ];
                    $total += $records->count();
                }
            } catch (\Throwable $e) {
                Log::warning("Trash: failed to load {$key}", ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['success' => true, 'total' => $total, 'data' => $groups]);
    }

    public function restore(string $type, int $id): JsonResponse
    {
        $cfg = $this->modelMap()[$type] ?? null;
        if (!$cfg) return response()->json(['success' => false, 'message' => 'Unknown model'], 404);

        try {
            $cfg['model']::onlyTrashed()->findOrFail($id)->restore();
            return response()->json(['success' => true, 'message' => 'Record restored successfully']);
        } catch (\Throwable $e) {
            Log::error("Trash restore failed: {$type}/{$id} — " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function forceDelete(string $type, int $id): JsonResponse
    {
        $cfg = $this->modelMap()[$type] ?? null;
        if (!$cfg) return response()->json(['success' => false, 'message' => 'Unknown model'], 404);

        try {
            $cfg['model']::onlyTrashed()->findOrFail($id)->forceDelete();
            return response()->json(['success' => true, 'message' => 'Record permanently deleted']);
        } catch (\Throwable $e) {
            Log::error("Trash forceDelete failed: {$type}/{$id} — " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function restoreAll(string $type): JsonResponse
    {
        $cfg = $this->modelMap()[$type] ?? null;
        if (!$cfg) return response()->json(['success' => false, 'message' => 'Unknown model'], 404);

        try {
            $count = $cfg['model']::onlyTrashed()->restore();
            return response()->json(['success' => true, 'message' => "{$count} records restored"]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Failed to restore'], 500);
        }
    }

    public function forceDeleteAll(string $type): JsonResponse
    {
        $cfg = $this->modelMap()[$type] ?? null;
        if (!$cfg) return response()->json(['success' => false, 'message' => 'Unknown model'], 404);

        try {
            $count = $cfg['model']::onlyTrashed()->count();
            $cfg['model']::onlyTrashed()->forceDelete();
            return response()->json(['success' => true, 'message' => "{$count} records permanently deleted"]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete'], 500);
        }
    }

    private function format($record, string $key, array $cfg): array
    {
        $nameCol = $cfg['name_col'];
        $name    = $record->{$nameCol} ?? "#{$record->id}";

        $subtitle = match ($key) {
            'sub_categories'  => 'Category ID: ' . ($record->category_id ?? '—'),
            'bio_data'        => 'Category: '    . ($record->category_id ?? '—'),
            'sub_names'       => 'Bio Data ID: ' . ($record->bio_data_id ?? '—'),
            'client_projects' => ucfirst($record->project_type ?? '') . ' · Client #' . ($record->client_id ?? '—'),
            'client_payments' => '₹' . number_format((float)($record->amount ?? 0), 2) . ' · ' . ($record->payment_date ?? '—'),
            'daybook_entries' => '₹' . number_format((float)($record->amount ?? 0), 2) . ' · ' . ($record->transaction_date ?? '—'),
            'credit_entries'  => '₹' . number_format((float)($record->credit_amount ?? 0), 2) . ' · ' . ($record->credit_date ?? '—'),
            'credit_payments' => '₹' . number_format((float)($record->amount_paid ?? 0), 2) . ' · ' . ($record->payment_date ?? '—'),
            'workers'         => ($record->trade ?: 'Labour') . ' · ' . ($record->worker_code ?? '—'),
            default           => $record->description ?? $record->email ?? $record->code ?? '',
        };

        return [
            'id'              => $record->id,
            'name'            => (string) $name,
            'subtitle'        => (string) $subtitle,
            'deleted_at'      => $record->deleted_at?->diffForHumans() ?? '—',
            'deleted_raw'     => $record->deleted_at?->toDateTimeString() ?? '',
            'deleted_date'    => $record->deleted_at?->format('d M Y') ?? '—',
            'deleted_time'    => $record->deleted_at?->format('h:i A') ?? '—',
            'deleted_by_name' => $record->deleted_by_name ?? 'Unknown',
        ];
    }
}