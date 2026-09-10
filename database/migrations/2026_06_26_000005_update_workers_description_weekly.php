<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            // Unified description field
            $table->text('description')->nullable()->after('monthly_salary');
        });

        // Extend salary_type enum to include 'weekly'
        DB::statement("ALTER TABLE workers MODIFY COLUMN salary_type ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'daily'");

        // Also extend attendance_records worker_type — make nullable for unified workers
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->string('worker_type', 30)->default('labour')->change();
        });
    }

    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        DB::statement("ALTER TABLE workers MODIFY COLUMN salary_type ENUM('daily','monthly') NOT NULL DEFAULT 'daily'");
    }
};
