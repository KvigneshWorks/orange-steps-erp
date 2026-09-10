<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\TracksDeletedBy;

class DaybookEntry extends Model
{
    use HasFactory, SoftDeletes, TracksDeletedBy;

    protected $table = 'daybook_entries';

    protected $fillable = [
        'transaction_date',
        'amount',
        'payment_mode',
        'category_id',
        'sub_category_id',
        'bio_data_id',
        'sub_name_id',
        'client_name',
        'narration',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
        'bio_data_id' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function bioData()
    {
        return $this->belongsTo(BioData::class);
    }

    public function subName()
    {
        return $this->belongsTo(SubName::class, 'sub_name_id');
    }

    public function getPartyNameAttribute(): string
    {
        if ($this->bioData) {
            return $this->bioData->name;
        }
        if ($this->subName) {
            return $this->subName->alternate_name;
        }
        return '—';
    }

    public function getCategoryNameAttribute(): string
    {
        return $this->category?->name ?? 'N/A';
    }
}
