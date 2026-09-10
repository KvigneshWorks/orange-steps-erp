<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditPayment extends Model
{
    use SoftDeletes;

    protected $table = 'credit_payments';

    protected $fillable = [
        'vendor_id',
        'client_name',
        'credit_entry_id',
        'daybook_entry_id',
        'payment_date',
        'amount_paid',
        'payment_mode',
        'reference',
        'notes',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount_paid'  => 'float',
        'daybook_entry_id' => 'integer',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
        'deleted_at'   => 'datetime',
    ];

    const PAYMENT_MODES = [
        'Cash',
        'UPI',
        'NEFT',
        'Cheque',
        'Bank Transfer',
        'Others',
    ];


    public function vendor(): BelongsTo
    {
        return $this->belongsTo(CreditVendor::class, 'vendor_id');
    }

    public function creditEntry(): BelongsTo
    {
        return $this->belongsTo(CreditEntry::class, 'credit_entry_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getIsLinkedAttribute(): bool
    {
        return !is_null($this->credit_entry_id);
    }

    public function scopeGeneral($query)
    {
        return $query->whereNull('credit_entry_id');
    }

    public function scopeLinked($query)
    {
        return $query->whereNotNull('credit_entry_id');
    }

    public function scopeByMode($query, string $mode)
    {
        return $query->where('payment_mode', $mode);
    }

    public function scopeDateRange($query, string $from, string $to)
    {
        return $query->whereBetween('payment_date', [$from, $to]);
    }
}
