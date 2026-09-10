<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabourPaymentSession extends Model
{
    protected $fillable = [
        'worker_id', 'worker_name', 'total_amount',
        'payment_mode', 'notes', 'paid_at', 'created_by', 'created_by_name',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'paid_at'      => 'datetime',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function allocations()
    {
        return $this->hasMany(LabourPaymentAllocation::class, 'session_id');
    }
}
