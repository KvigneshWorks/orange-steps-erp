<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            // salary_type: 'daily' for labour/contractor, 'monthly' for employee
            $table->enum('salary_type', ['daily', 'monthly'])->default('daily')->after('daily_rate');
            $table->decimal('monthly_salary', 10, 2)->default(0)->after('salary_type');
        });
    }

    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn(['salary_type', 'monthly_salary']);
        });
    }
};
