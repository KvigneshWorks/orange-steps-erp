<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Optional per-sub-name rate (e.g. "dinesh" under Ajith usually gets
        // ₹450/day). Nullable because sub-workers are often casual/temporary
        // labour whose pay varies day to day — when null, Attendance keeps
        // requiring a fully manual amount like it always has; when set, it's
        // just used as an editable starting point so the amount auto-fills.
        Schema::table('worker_sub_names', function (Blueprint $table) {
            if (!Schema::hasColumn('worker_sub_names', 'daily_rate')) {
                $table->decimal('daily_rate', 10, 2)->nullable()->after('sub_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('worker_sub_names', function (Blueprint $table) {
            if (Schema::hasColumn('worker_sub_names', 'daily_rate')) {
                $table->dropColumn('daily_rate');
            }
        });
    }
};
