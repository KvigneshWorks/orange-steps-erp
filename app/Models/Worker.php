<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\TracksDeletedBy;

class Worker extends Model
{
    use HasFactory, SoftDeletes, TracksDeletedBy;

    protected $fillable = [
        'name', 'worker_code', 'worker_type', 'trade', 'site',
        'phone', 'contractor_name', 'daily_rate', 'salary_type',
        'monthly_salary', 'description', 'is_active', 'created_by', 'created_by_name',
        'category_id', 'sub_category_id', 'bio_data_id',
    ];

    protected $casts = [
        'daily_rate'     => 'float',
        'monthly_salary' => 'float',
        'is_active'      => 'boolean',
    ];

    /**
     * Effective daily rate for attendance amount calculations.
     * daily/weekly → daily_rate per shift
     * monthly      → monthly_salary ÷ 26 working days
     */
    public function getEffectiveDailyRateAttribute(): float
    {
        if ($this->salary_type === 'monthly' && $this->monthly_salary > 0) {
            return round($this->monthly_salary / 26, 2);
        }
        return (float) $this->daily_rate;
    }

    /**
     * Display rate label for UI
     */
    public function getRateLabelAttribute(): string
    {
        return match($this->salary_type) {
            'monthly' => '₹' . number_format($this->monthly_salary, 0) . '/mo',
            'weekly'  => '₹' . number_format($this->daily_rate, 0) . '/wk',
            default   => '₹' . number_format($this->daily_rate, 0) . '/shift',
        };
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function payments()
    {
        return $this->hasMany(WorkerPayment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
