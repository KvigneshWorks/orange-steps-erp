<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use App\Traits\TracksDeletedBy;

class CreditVendor extends Model
{
    use SoftDeletes, TracksDeletedBy;

    protected $table = 'credit_vendors';

    protected $fillable = [
        'bio_data_id',
        'category_id',
        'sub_category_id',
        'party_name',
        'phone',
        'business_name',
        'address',
        'gstin',
        'is_active',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    public function bioData(): BelongsTo
    {
        return $this->belongsTo(BioData::class, 'bio_data_id');
    }

    public function creditEntries(): HasMany
    {
        return $this->hasMany(CreditEntry::class, 'vendor_id')
            ->orderBy('credit_date', 'desc');
    }

    public function creditPayments(): HasMany
    {
        return $this->hasMany(CreditPayment::class, 'vendor_id')
            ->orderBy('payment_date', 'desc');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTotalCreditAttribute(): float
    {
        return (float) $this->creditEntries()->reorder()->sum('credit_amount');
    }

    public function getTotalPaidAttribute(): float
    {
        return (float) $this->creditPayments()->reorder()->whereNotNull('credit_entry_id')->sum('amount_paid');
    }

    public function getBalanceAttribute(): float
    {
        $totalCredit = (float) $this->creditEntries()->reorder()->sum('credit_amount');
        $totalPaid   = (float) $this->creditPayments()->reorder()->whereNotNull('credit_entry_id')->sum('amount_paid');
        return round($totalCredit - $totalPaid, 2);
    }

    public function getStatusAttribute(): string
    {
        $balance   = $this->balance;
        $totalPaid = $this->total_paid;

        if ($balance <= 0) {
            return 'clear';
        }

        $hasOverdue = $this->creditEntries()->reorder()
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', Carbon::today())
            ->exists();

        if ($hasOverdue) {
            return 'overdue';
        }

        if ($totalPaid > 0) {
            return 'partial';
        }

        return 'pending';
    }

    public function getDaysOverdueAttribute(): int
    {
        if ($this->status !== 'overdue') {
            return 0;
        }

        $oldestDue = $this->creditEntries()->reorder()
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', Carbon::today())
            ->min('due_date');

        if (!$oldestDue) {
            return 0;
        }

        return (int) Carbon::parse($oldestDue)->diffInDays(Carbon::today());
    }

    public function getLastTransactionDateAttribute(): ?string
    {
        $lastCredit  = $this->creditEntries()->reorder()->max('credit_date');
        $lastPayment = $this->creditPayments()->reorder()->max('payment_date');

        if (!$lastCredit && !$lastPayment) return null;
        if (!$lastCredit)  return $lastPayment;
        if (!$lastPayment) return $lastCredit;

        return $lastCredit > $lastPayment ? $lastCredit : $lastPayment;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeBySubCategory($query, int $subCategoryId)
    {
        return $query->where('sub_category_id', $subCategoryId);
    }

    public function toSummaryArray(): array
    {
        // ✅ Use preloaded aggregates (set by indexVendors via withSum/withCount/withMax).
        // Falls back to individual queries only when called outside that context (e.g. after store/update).
        $totalCredit = (float) $this->creditEntries()->reorder()->sum('credit_amount');
        $totalPaid   = (float) $this->creditPayments()->reorder()->whereNotNull('credit_entry_id')->sum('amount_paid');
        $balance     = round($totalCredit - $totalPaid, 2);

        if ($balance <= 0) {
            $status      = 'clear';
            $daysOverdue = 0;
        } else {
            $overdueCount = $this->creditEntries()->reorder()
                ->whereNotNull('due_date')->whereDate('due_date', '<', Carbon::today())->count();

            if ($overdueCount > 0) {
                $status      = 'overdue';
                $oldestDue   = $this->creditEntries()->reorder()
                    ->whereNotNull('due_date')->whereDate('due_date', '<', Carbon::today())->min('due_date');
                $daysOverdue = $oldestDue ? (int) Carbon::parse($oldestDue)->diffInDays(Carbon::today()) : 0;
            } elseif ($totalPaid > 0) {
                $status      = 'partial';
                $daysOverdue = 0;
            } else {
                $status      = 'pending';
                $daysOverdue = 0;
            }
        }

        $lastCredit  = $this->creditEntries()->reorder()->max('credit_date');
        $lastPayment = $this->creditPayments()->reorder()->max('payment_date');
        if (!$lastCredit && !$lastPayment)   $lastTx = null;
        elseif (!$lastCredit)                $lastTx = $lastPayment;
        elseif (!$lastPayment)               $lastTx = $lastCredit;
        else                                 $lastTx = $lastCredit > $lastPayment ? $lastCredit : $lastPayment;

        return [
            'id'                    => $this->id,
            'bio_data_id'           => $this->bio_data_id,
            'party_name'            => $this->party_name,
            'business_name'         => $this->business_name,
            'phone'                 => $this->phone,
            'address'               => $this->address,
            'gstin'                 => $this->gstin,
            'category_id'           => $this->category_id,
            'category_name'         => $this->category?->name,
            'sub_category_id'       => $this->sub_category_id,
            'sub_category_name'     => $this->subCategory?->name,
            'is_active'             => $this->is_active,
            'total_credit'          => $totalCredit,
            'total_paid'            => $totalPaid,
            'balance'               => $balance,
            'status'                => $status,
            'days_overdue'          => $daysOverdue,
            'last_transaction_date' => $lastTx,
            'entry_count'           => (int) $this->creditEntries()->reorder()->count(),
            'payment_count'         => (int) $this->creditPayments()->reorder()->count(),
            'created_by_name'       => $this->created_by_name,
            'created_at'            => $this->created_at?->format('Y-m-d'),
        ];
    }
}
