<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'sub',
        'status',
        'progress',
        'value',
        'user_id',
    ];

    protected $casts = [
        'progress' => 'integer',
        'value' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    public function boqs()
    {
        return $this->hasMany(BOQ::class);
    }

    public function cadRevisions()
    {
        return $this->hasMany(CADRevision::class);
    }
}
