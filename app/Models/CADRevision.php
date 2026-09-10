<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CADRevision extends Model
{
    protected $table = 'cad_revisions';

    protected $fillable = [
        'project_id',
        'file_name',
        'revision_number',
        'description',
        'user_id',
    ];

    protected $casts = [
        'revision_number' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
