<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserApprovalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'approval_token',
        'expires_at',
        'decided_at',
        'decided_by',
        'reject_reason',
    ];

    protected $hidden = [
        'password',
        'approval_token',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
