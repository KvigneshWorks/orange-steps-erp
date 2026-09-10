<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('daybook_entries', 'amount')) {
                $table->decimal('amount', 15, 2)->default(0.00)->after('transaction_date');
            }
            if (!Schema::hasColumn('daybook_entries', 'payment_mode')) {
                $table->enum('payment_mode', [
                    'Cash', 'UPI', 'NEFT', 'Cheque', 'Bank Transfer', 'Others'
                ])->default('Cash')->after('amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            if (Schema::hasColumn('daybook_entries', 'payment_mode')) {
                $table->dropColumn('payment_mode');
            }
            if (Schema::hasColumn('daybook_entries', 'amount')) {
                $table->dropColumn('amount');
            }
        });
    }
};
