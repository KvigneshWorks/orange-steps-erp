<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\TracksDeletedBy;

class ClientPayment extends Model
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
        'client_project_id', 'payment_date', 'amount', 'gst_amount',
        'payment_mode', 'reference_number', 'notes', 'next_due_date', 'created_by',
    ];

    protected $casts = [
        'payment_date'  => 'date',
        'next_due_date' => 'date',
        'amount'        => 'float',
        'gst_amount'    => 'float',
    ];

    protected $appends = [
        'total_amount',
        'mode_label',
    ];

    public function getTotalAmountAttribute(): float
    {
        return (float) ($this->amount + $this->gst_amount);
    }

    public function getModeLabelAttribute(): string
    {
        return match ($this->payment_mode) {
            'upi'            => 'UPI',
            'bank_transfer'  => 'Bank Transfer',
            'cash'           => 'Cash',
            'cheque'         => 'Cheque',
            default          => ucfirst(str_replace('_', ' ', $this->payment_mode)),
        };
    }

    public function clientProject()
    {
        return $this->belongsTo(ClientProject::class, 'client_project_id');
    }

    // Alias so ->project works the same as ->clientProject
    public function project()
    {
        return $this->belongsTo(ClientProject::class, 'client_project_id');
    }
}
