<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Remove the unique(worker_id, date) constraint so the same worker can have
 * multiple attendance entries per day (e.g. different clients / shifts).
 * The weekly bill generator already aggregates SUM(shifts_worked) per worker,
 * so multiple rows are handled correctly.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Check if index exists before trying to drop it
        $exists = \Illuminate\Support\Facades\DB::select(
            "SHOW INDEX FROM attendance_records WHERE Key_name = 'attendance_records_worker_id_date_unique'"
        );

        if (!empty($exists)) {
            Schema::table('attendance_records', function (Blueprint $table) {
                $table->dropUnique(['worker_id', 'date']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->unique(['worker_id', 'date']);
        });
    }
};
