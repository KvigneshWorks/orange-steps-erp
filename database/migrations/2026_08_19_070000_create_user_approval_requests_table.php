<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pending account-creation requests for ALL roles (user / admin / super_admin).
 *
 * Registration no longer creates a row in `users` directly — it creates a row
 * here first. Nothing in `users` exists (and nobody can log in) until the MD
 * approves the request via the emailed/WhatsApp'd link, or from the in-app
 * "Pending Approvals" screen. See App\Http\Controllers\ApprovalController.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_approval_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('password'); // already hashed at submission time
            $table->string('role');     // user | admin | super_admin
            $table->string('status')->default('pending'); // pending | approved | rejected
            $table->string('approval_token', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('decided_at')->nullable();
            $table->string('decided_by')->nullable(); // name/email of whoever approved/rejected
            $table->string('reject_reason')->nullable();
            $table->timestamps();

            $table->index(['email', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_approval_requests');
    }
};
