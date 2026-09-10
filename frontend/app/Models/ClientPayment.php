<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClientPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_project_id', 'payment_date', 'amount', 'gst_amount',
        'payment_mode', 'reference_number', 'notes', 'next_due_date', 'created_by',
    ];

    protected $casts = [
        'payment_date'  => 'date',
        'next_due_date' => 'date',
        'amount'        => 'float',
        'gst_amount'    => 'float',
    ];

    protected $appends = [
        'total_amount',
        'mode_label',
    ];

    public function getTotalAmountAttribute(): float
    {
        return (float) ($this->amount + $this->gst_amount);
    }

    public function getModeLabelAttribute(): string
    {
        return match ($this->payment_mode) {
            'upi'            => 'UPI',
            'bank_transfer'  => 'Bank Transfer',
            'cash'           => 'Cash',
            'cheque'         => 'Cheque',
            default          => ucfirst(str_replace('_', ' ', $this->payment_mode)),
        };
    }
}
