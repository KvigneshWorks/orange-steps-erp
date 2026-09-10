<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabourPaymentAllocation extends Model
{
    protected $fillable = [
        'session_id', 'client_name', 'sub_worker_name', 'shifts_total', 'earned_total',
        'outstanding_before', 'allocated', 'outstanding_after', 'is_closed',
    ];

    protected $casts = [
        'shifts_total'       => 'float',
        'earned_total'       => 'float',
        'outstanding_before' => 'float',
        'allocated'          => 'float',
        'outstanding_after'  => 'float',
        'is_closed'          => 'boolean',
    ];

    public function session()
    {
        return $this->belongsTo(LabourPaymentSession::class, 'session_id');
    }
}
