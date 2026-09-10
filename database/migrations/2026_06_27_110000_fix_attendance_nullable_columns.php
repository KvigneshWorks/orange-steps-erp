<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->string('trade', 100)->nullable()->default(null)->change();
            $table->string('site',  200)->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->string('trade', 100)->nullable(false)->change();
            $table->string('site',  200)->nullable(false)->change();
        });
    }
};
