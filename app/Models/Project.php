<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
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
