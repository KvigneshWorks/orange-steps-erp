<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Adds a created_by_name snapshot column to workers & attendance_records,
 * mirroring the same pattern already used on categories/sub_categories/
 * bio_data/sub_names/daybook_entries/credit_vendors/credit_entries/
 * credit_payments — a plain string copy of the creator's name at record-
 * creation time, so list views can show "Created by X" without an extra
 * join/eager-load on every request. Existing rows are backfilled from the
 * users table via their existing created_by foreign key.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            if (!Schema::hasColumn('workers', 'created_by_name')) {
                $table->string('created_by_name')->nullable()->after('created_by');
            }
        });

        Schema::table('attendance_records', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_records', 'created_by_name')) {
                $table->string('created_by_name')->nullable()->after('created_by');
            }
        });

        // Backfill existing rows from users.name via created_by.
        DB::statement('UPDATE workers w JOIN users u ON u.id = w.created_by SET w.created_by_name = u.name WHERE w.created_by_name IS NULL');
        DB::statement('UPDATE attendance_records a JOIN users u ON u.id = a.created_by SET a.created_by_name = u.name WHERE a.created_by_name IS NULL');
    }

    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            if (Schema::hasColumn('workers', 'created_by_name')) {
                $table->dropColumn('created_by_name');
            }
        });

        Schema::table('attendance_records', function (Blueprint $table) {
            if (Schema::hasColumn('attendance_records', 'created_by_name')) {
                $table->dropColumn('created_by_name');
            }
        });
    }
};
