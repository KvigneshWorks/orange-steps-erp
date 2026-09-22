<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\TracksDeletedBy;

class ProjectBudgetHistory extends Model
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
    use SoftDeletes, TracksDeletedBy;

    protected $table = 'project_budget_histories';

    protected $fillable = [
        'client_project_id',
        'extra_amount',
        'reason',
        'date_added',
        'added_by',
    ];

    protected $casts = [
        'extra_amount' => 'decimal:2',
        'date_added' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(ClientProject::class, 'client_project_id');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
