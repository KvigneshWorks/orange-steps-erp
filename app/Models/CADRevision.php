<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CADRevision extends Model
{

    /**
     * Auto-invalidate the dashboard cache the instant this model changes —
     * from ANY code path (any controller, tinker, a queued job, future
     * code), not just the ones that remember to call it manually. This is
     * the safety net behind the explicit DashboardController::clearCache()
     * calls already placed in the write endpoints.
     */
    protected static function booted(): void
    {
        static::created(fn () => \App\Http\Controllers\DashboardController::clearCache());
        static::updated(fn () => \App\Http\Controllers\DashboardController::clearCache());
        static::deleted(fn () => \App\Http\Controllers\DashboardController::clearCache());
        static::restored(fn () => \App\Http\Controllers\DashboardController::clearCache());
    }
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
