<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IDType extends Model
{
    use HasFactory;

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