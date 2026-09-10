<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkerSubName extends Model
{
    protected $fillable = ['worker_id', 'sub_name', 'daily_rate', 'is_active', 'created_by'];

    protected $casts = [
        'is_active'  => 'boolean',
        'daily_rate' => 'float',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
