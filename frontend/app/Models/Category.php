<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'is_active',
        'created_by',
        'created_by_name'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active categories only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Relationship: Who created this category
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}