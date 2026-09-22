<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\TracksDeletedBy;

class ClientProject extends Model
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
    use HasFactory, SoftDeletes, TracksDeletedBy;

    protected $fillable = [
        'client_id',
        'project_name',
        'project_type',
        'start_date',
        'total_budget',
        'description',
        'type_notes',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'total_budget' => 'decimal:2',
    ];

    protected $appends = [
        'total_collected',
        'total_gst',
        'balance',
        'collected_percent',
        'balance_percent',
        'next_due_date',
        'status_label',
        'type_label',
    ];

    public function payments()
    {
        return $this->hasMany(ClientPayment::class, 'client_project_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function getTotalCollectedAttribute(): float
    {
        return (float) $this->payments->sum('amount');
    }

    public function getTotalGstAttribute(): float
    {
        return (float) $this->payments->sum('gst_amount');
    }

    public function getBalanceAttribute(): float
    {
        return (float) $this->total_budget - $this->total_collected;
    }

    public function getCollectedPercentAttribute(): float
    {
        if ($this->total_budget <= 0) return 0;
        return round(($this->total_collected / $this->total_budget) * 100, 2);
    }

    public function getBalancePercentAttribute(): float
    {
        return round(100 - $this->collected_percent, 2);
    }

    public function getNextDueDateAttribute(): ?string
    {
        $latest = $this->payments()
            ->whereNotNull('next_due_date')
            ->orderBy('payment_date', 'desc')
            ->first();

        return $latest?->next_due_date?->format('Y-m-d');
    }

    public function getStatusLabelAttribute(): string
    {
        return ucfirst(str_replace('_', ' ', $this->status));
    }

    public function getTypeLabelAttribute(): string
    {
        return ucfirst($this->project_type);
    }
}
