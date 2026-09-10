<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\TracksDeletedBy;

class Client extends Model
{
    use HasFactory, SoftDeletes, TracksDeletedBy;

    protected $table = 'clients';

    protected $fillable = [
        'name', 'id_number', 'email', 'address', 'city',
        'notes', 'created_by', 'id_type_id', 'id_type_name', 'id_details',
    ];

    protected $casts = [
        'id' => 'integer',
        'created_by' => 'integer',
        'id_type_id' => 'integer',
    ];

    protected $appends = [
        'total_budget',
        'total_collected',
        'total_additional',
        'total_balance',
        'project_count',
        'budget_status',
        'full_id',
    ];

    public function projects(): HasMany
    {
        return $this->hasMany(ClientProject::class, 'client_id', 'id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function getTotalBudgetAttribute(): float
    {
        return (float) $this->projects->sum('total_budget');
    }

    public function getTotalCollectedAttribute(): float
    {
        return (float) $this->projects->sum('total_collected');
    }

    public function getTotalAdditionalAttribute(): float
    {
        return (float) $this->projects->sum('total_gst');
    }

    public function getTotalBalanceAttribute(): float
    {
        return (float) $this->total_budget - $this->total_collected;
    }

    public function getProjectCountAttribute(): int
    {
        return $this->projects->count();
    }

    public function getFullIdAttribute(): ?string
    {
        return ($this->id_type_name && $this->id_details)
            ? "{$this->id_type_name}: {$this->id_details}"
            : $this->id_number;
    }

    public function getBudgetStatusAttribute(): string
    {
        if ($this->total_budget <= 0) return 'no_budget';
        $percentage = ($this->total_collected / $this->total_budget) * 100;
        return match (true) {
            $percentage >= 100 => 'collected',
            $percentage >= 75  => 'high',
            $percentage >= 50  => 'medium',
            default           => 'low',
        };
    }

    // Scopes for easy filtering in Controller
    public function scopeSearch($query, $term)
    {
        return $query->where('name', 'like', "%{$term}%")
                     ->orWhere('id_number', 'like', "%{$term}%");
    }
}
