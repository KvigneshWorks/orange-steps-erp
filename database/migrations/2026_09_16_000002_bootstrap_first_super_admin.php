<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * One-time bootstrap: public self-registration is gone, so there must be at
 * least one super_admin account for the in-app Account Settings module to
 * ever be reachable. This migration is safe to run more than once (it never
 * duplicates or overwrites an existing password).
 *
 * - If a user with this email already exists, it is simply promoted to
 *   super_admin — its existing password is left untouched.
 * - Otherwise a new account is created with the generated password below.
 *   CHANGE THIS PASSWORD after your first login (Change Password screen).
 */
return new class extends Migration
{
    public function up(): void
    {
        $email = 'info@orangesteps.in';
        $name  = 'Santhosh — Managing Director';

        // Bootstrap password (user-chosen) — only used if a new account is
        // created below. This is a simple word with no numbers/symbols, so
        // it's fine for local dev, but change it via the Change Password
        // screen before this ever goes anywhere near the live server.
        $temporaryPassword = 'orangesteps';

        $existing = DB::table('users')->where('email', $email)->first();

        if ($existing) {
            DB::table('users')
                ->where('id', $existing->id)
                ->update([
                    'role'       => 'super_admin',
                    'name'       => $name,
                    'updated_at' => now(),
                ]);
            return;
        }

        DB::table('users')->insert([
            'name'              => $name,
            'email'             => $email,
            'password'          => Hash::make($temporaryPassword),
            'role'              => 'super_admin',
            'email_verified_at' => now(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }

    public function down(): void
    {
        // Intentionally a no-op — removing the only super_admin account on
        // rollback would lock everyone out of the Account Settings module.
    }
};
