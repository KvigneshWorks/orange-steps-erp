<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\TracksDeletedBy;

class ProjectBudgetHistory extends Model
{
    use SoftDeletes, TracksDeletedBy;

    protected $table = 'project_budget_histories';

    protected $fillable = [
        'client_project_id',
        'extra_amount',
        'reason',
        'date_added',
        'added_by',
    ];

    protected $casts = [
        'extra_amount' => 'decimal:2',
        'date_added' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(ClientProject::class, 'client_project_id');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
