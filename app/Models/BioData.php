<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\TracksDeletedBy;

class BioData extends Model
{
    use HasFactory, SoftDeletes, TracksDeletedBy;

    protected $table = 'bio_data';

    protected $fillable = [
        'name',
        'id_type_id',
        'id_details',
        'category_id',
        'sub_category_id',
        'address',
        'description',
        'is_active',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'amount'    => 'decimal:2',
    ];

    public function idType()
    {
        return $this->belongsTo(IDType::class, 'id_type_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
