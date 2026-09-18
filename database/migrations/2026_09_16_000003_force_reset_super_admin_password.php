<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Follow-up to 2026_09_16_000002_bootstrap_first_super_admin: that migration
 * left an existing account's password untouched, which meant the intended
 * bootstrap password didn't actually work if info@orangesteps.in already
 * existed with a different password. This migration force-resets it (and
 * makes sure the account exists at all, and is super_admin) so login is
 * guaranteed to work with the password below immediately after migrating.
 *
 * CHANGE THIS PASSWORD after logging in (Change Password screen) —
 * this is a known, shared value the moment this file exists on disk.
 */
return new class extends Migration
{
    public function up(): void
    {
        $email    = 'info@orangesteps.in';
        $name     = 'Santhosh — Managing Director';
        // See 2026_09_16_000002_bootstrap_first_super_admin for why this
        // reads from .env instead of being a fixed literal.
        $password = env('SUPER_ADMIN_BOOTSTRAP_PASSWORD', 'orangesteps');

        $existing = DB::table('users')->where('email', $email)->first();

        if ($existing) {
            DB::table('users')
                ->where('id', $existing->id)
                ->update([
                    'name'       => $name,
                    'password'   => Hash::make($password),
                    'role'       => 'super_admin',
                    'updated_at' => now(),
                ]);
            return;
        }

        DB::table('users')->insert([
            'name'              => $name,
            'email'             => $email,
            'password'          => Hash::make($password),
            'role'              => 'super_admin',
            'email_verified_at' => now(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }

    public function down(): void
    {
        // Intentionally a no-op — see 2026_09_16_000002 for the same reasoning.
    }
};
