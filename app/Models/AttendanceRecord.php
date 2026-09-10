<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttendanceRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'worker_id', 'bio_data_id', 'client_name',
        'worker_name', 'sub_worker_name', 'is_sub_entry', 'worker_code', 'worker_type',
        'trade', 'site', 'date', 'shifts_worked', 'status',
        'daily_rate', 'amount', 'notes', 'created_by', 'created_by_name',
    ];

    protected $casts = [
        'date'          => 'date',
        'shifts_worked' => 'float',
        'daily_rate'    => 'float',
        'amount'        => 'float',
        'is_sub_entry'  => 'boolean',
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
