<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabourWeeklyPayment extends Model
{
    protected $fillable = [
        'bill_id', 'worker_id', 'worker_name', 'daily_rate',
        'total_shifts', 'total_earned', 'previous_balance',
        'total_due', 'amount_paid', 'balance_carried',
        'paid_at', 'payment_mode', 'notes', 'status',
    ];

    protected $casts = [
        'daily_rate'       => 'float',
        'total_shifts'     => 'float',
        'total_earned'     => 'float',
        'previous_balance' => 'float',
        'total_due'        => 'float',
        'amount_paid'      => 'float',
        'balance_carried'  => 'float',
        'paid_at'          => 'datetime',
    ];

    public function bill()
    {
        return $this->belongsTo(LabourWeeklyBill::class, 'bill_id');
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
