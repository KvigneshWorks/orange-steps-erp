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

        // Bootstrap password — pulled from .env so it's never a fixed,
        // known-to-anyone-reading-the-code value once SUPER_ADMIN_BOOTSTRAP_PASSWORD
        // is set on a given environment. Falls back to the original word
        // only so an existing dev setup that never set the .env key keeps
        // working exactly as before. CHANGE THE LOGGED-IN ACCOUNT'S PASSWORD
        // via the Change Password screen regardless — this value (default or
        // .env-set) should never be the password actually in use in production.
        $temporaryPassword = env('SUPER_ADMIN_BOOTSTRAP_PASSWORD', 'orangesteps');

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
