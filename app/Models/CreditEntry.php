<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use App\Traits\TracksDeletedBy;

class CreditEntry extends Model
{
    use SoftDeletes, TracksDeletedBy;

    protected $table = 'credit_entries';

    protected $fillable = [
        'vendor_id',
        'client_name',
        'credit_date',
        'bill_number',
        'description',
        'credit_amount',
        'due_date',
        'priority',
        'notes',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'credit_date'   => 'date',
        'due_date'      => 'date',
        'credit_amount' => 'float',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
        'deleted_at'    => 'datetime',
    ];

    const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(CreditVendor::class, 'vendor_id');
    }

    public function linkedPayments(): HasMany
    {
        return $this->hasMany(CreditPayment::class, 'credit_entry_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    public function getAmountPaidAttribute(): float
    {
        return round((float) $this->linkedPayments()->sum('amount_paid'), 2);
    }

    public function getBillBalanceAttribute(): float
    {
        return round($this->credit_amount - $this->amount_paid, 2);
    }

    /**
     * Whether this specific bill is fully paid
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->bill_balance <= 0;
    }

    /**
     * Whether due date has passed and bill is unpaid
     */
    public function getIsOverdueAttribute(): bool
    {
        if ($this->is_paid) {
            return false;
        }

        if (!$this->due_date) {
            return false;
        }

        return $this->due_date->lt(Carbon::today());
    }

    /**
     * Days overdue for this specific bill
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->is_overdue) {
            return 0;
        }

        return (int) $this->due_date->diffInDays(Carbon::today());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotNull('due_date')
                     ->whereDate('due_date', '<', Carbon::today());
    }

    public function scopeUpcoming($query, int $days = 7)
    {
        return $query->whereNotNull('due_date')
                     ->whereDate('due_date', '>=', Carbon::today())
                     ->whereDate('due_date', '<=', Carbon::today()->addDays($days));
    }
}
