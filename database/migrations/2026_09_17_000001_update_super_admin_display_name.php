<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Small follow-up to the Super Admin bootstrap: updates the display name
 * on info@orangesteps.in to include the "Mr." honorific, per the user's
 * request.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'info@orangesteps.in')
            ->update([
                'name'       => 'Mr. Santhosh — Managing Director',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('email', 'info@orangesteps.in')
            ->update([
                'name'       => 'Santhosh — Managing Director',
                'updated_at' => now(),
            ]);
    }
};
