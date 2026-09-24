<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\TracksDeletedBy;

class SubCategory extends Model
{
    use HasFactory, SoftDeletes, TracksDeletedBy;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'additional_field',
        'is_active',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * All categories this sub-category is linked to (many-to-many).
     * category_id / category() above stays as the "primary" category for
     * backward compatibility with any code that only expects a single one.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_sub_category');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}