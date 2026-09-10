<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkerPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'worker_id', 'worker_name', 'site',
        'from_date', 'to_date', 'total_shifts', 'total_earned',
        'amount_paid', 'balance', 'payment_mode', 'reference_no',
        'notes', 'status', 'paid_on', 'created_by',
    ];

    protected $casts = [
        'from_date'    => 'date',
        'to_date'      => 'date',
        'paid_on'      => 'date',
        'total_shifts' => 'float',
        'total_earned' => 'float',
        'amount_paid'  => 'float',
        'balance'      => 'float',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
