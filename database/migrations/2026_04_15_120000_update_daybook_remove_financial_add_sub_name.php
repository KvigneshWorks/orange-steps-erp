<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {

            if (Schema::hasColumn('daybook_entries', 'transaction_type')) {
                $table->dropColumn('transaction_type');
            }

            if (Schema::hasColumn('daybook_entries', 'amount')) {
                $table->dropColumn('amount');
            }

            if (Schema::hasColumn('daybook_entries', 'payment_mode')) {
                $table->dropColumn('payment_mode');
            }

            if (!Schema::hasColumn('daybook_entries', 'sub_name_id')) {
                $table->foreignId('sub_name_id')
                      ->nullable()
                      ->constrained('sub_names')
                      ->onDelete('set null')
                      ->after('sub_category_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {

            if (Schema::hasColumn('daybook_entries', 'sub_name_id')) {
                $table->dropForeign(['sub_name_id']);
                $table->dropColumn('sub_name_id');
            }

            if (!Schema::hasColumn('daybook_entries', 'transaction_type')) {
                $table->enum('transaction_type', ['income', 'expense'])->index();
            }

            if (!Schema::hasColumn('daybook_entries', 'amount')) {
                $table->decimal('amount', 15, 2)->default(0.00);
            }

            if (!Schema::hasColumn('daybook_entries', 'payment_mode')) {
                $table->enum('payment_mode', [
                    'Cash', 'UPI', 'NEFT', 'Cheque', 'Bank Transfer', 'Others'
                ])->default('Cash');
            }
        });
    }
};
