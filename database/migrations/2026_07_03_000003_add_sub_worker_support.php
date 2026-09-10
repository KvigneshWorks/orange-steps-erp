<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-worker saved sub names (temporary referred workers)
        if (!Schema::hasTable('worker_sub_names')) {
            Schema::create('worker_sub_names', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('worker_id');
                $table->string('sub_name', 150);
                $table->boolean('is_active')->default(true);
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();

                $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
                $table->unique(['worker_id', 'sub_name']);
            });
        }

        // Sub-entry columns on attendance
        Schema::table('attendance_records', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_records', 'sub_worker_name')) {
                $table->string('sub_worker_name', 150)->nullable()->after('worker_name');
            }
            if (!Schema::hasColumn('attendance_records', 'is_sub_entry')) {
                $table->boolean('is_sub_entry')->default(false)->after('sub_worker_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            if (Schema::hasColumn('attendance_records', 'sub_worker_name')) {
                $table->dropColumn('sub_worker_name');
            }
            if (Schema::hasColumn('attendance_records', 'is_sub_entry')) {
                $table->dropColumn('is_sub_entry');
            }
        });
        Schema::dropIfExists('worker_sub_names');
    }
};
