<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BOQ extends Model
{
    protected $table = 'boqs';

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'amount',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
