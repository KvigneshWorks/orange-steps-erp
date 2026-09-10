<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('credit_entries', 'client_name')) {
                $table->string('client_name')->nullable()->after('vendor_id')
                      ->comment('Client / site name this bill belongs to');
            }
        });

        Schema::table('credit_payments', function (Blueprint $table) {
            if (!Schema::hasColumn('credit_payments', 'client_name')) {
                $table->string('client_name')->nullable()->after('vendor_id')
                      ->comment('Client / site name this payment belongs to');
            }
        });
    }

    public function down(): void
    {
        Schema::table('credit_entries', function (Blueprint $table) {
            if (Schema::hasColumn('credit_entries', 'client_name')) {
                $table->dropColumn('client_name');
            }
        });

        Schema::table('credit_payments', function (Blueprint $table) {
            if (Schema::hasColumn('credit_payments', 'client_name')) {
                $table->dropColumn('client_name');
            }
        });
    }
};
