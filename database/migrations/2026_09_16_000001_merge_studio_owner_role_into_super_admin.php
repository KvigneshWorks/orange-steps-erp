<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The 'studio_owner' role has been merged into 'super_admin' — the app code
 * (CheckRole middleware, roleAccess.ts, Dashboard.tsx nav) has already been
 * updated to only recognise 'super_admin'. This migration just updates any
 * existing rows so no account is silently left behind on the old role name.
 *
 * 'role' is a plain string column (not a DB-level enum), so this is a pure
 * data update — no schema change needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'studio_owner')
            ->update(['role' => 'super_admin']);

        if (Schema::hasTable('user_approval_requests')) {
            DB::table('user_approval_requests')
                ->where('role', 'studio_owner')
                ->update(['role' => 'super_admin']);
        }
    }

    public function down(): void
    {
        // Data-only migration — which rows were originally 'studio_owner'
        // vs 'super_admin' isn't recoverable, so down() is intentionally a
        // no-op rather than guessing.
    }
};
