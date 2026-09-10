<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubName extends Model
{
    use HasFactory;

    protected $fillable = [
        'bio_data_id',
        'sub_category_id',
        'alternate_name',
        'classification',
        'description',
        'is_active',
        'created_by',
        'created_by_name',
    ];

    public function bioData()
    {
        return $this->belongsTo(BioData::class, 'bio_data_id');
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }
}
