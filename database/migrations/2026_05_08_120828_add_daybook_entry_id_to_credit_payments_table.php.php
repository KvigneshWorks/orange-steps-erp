<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_payments', function (Blueprint $table) {
            $table->unsignedBigInteger('daybook_entry_id')->nullable()->after('credit_entry_id');
        });
    }

    public function down(): void
    {
        Schema::table('credit_payments', function (Blueprint $table) {
            $table->dropColumn('daybook_entry_id');
        });
    }
};
