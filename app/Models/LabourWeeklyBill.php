<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LabourWeeklyBill extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'week_start', 'week_end', 'generated_at', 'status',
        'pdf_path', 'total_workers', 'total_earned',
        'total_paid', 'total_balance', 'created_by',
    ];

    protected $casts = [
        'week_start'    => 'date',
        'week_end'      => 'date',
        'generated_at'  => 'datetime',
        'total_earned'  => 'float',
        'total_paid'    => 'float',
        'total_balance' => 'float',
    ];

    public function payments()
    {
        return $this->hasMany(LabourWeeklyPayment::class, 'bill_id')
                    ->orderBy('worker_name');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
