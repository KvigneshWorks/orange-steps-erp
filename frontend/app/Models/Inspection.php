<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'inspector_id',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }
}
