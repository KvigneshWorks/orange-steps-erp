<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\TracksDeletedBy;

class IDType extends Model
{
    use HasFactory, SoftDeletes, TracksDeletedBy;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'id_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type_name',
        'format_pattern',
        'description',
        'is_active',
        'created_by',
        'created_by_name',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active'   => 'boolean',
            'created_at'  => 'datetime',
            'updated_at'  => 'datetime',
        ];
    }

    /**
     * Optional: Scope for active records only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}