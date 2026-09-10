<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_payments', function (Blueprint $table) {

            $table->id();
            $table->foreignId('vendor_id')
                  ->comment('FK → credit_vendors.id')
                  ->constrained('credit_vendors')
                  ->onDelete('cascade');

            $table->foreignId('credit_entry_id')
                  ->nullable()
                  ->comment('FK → credit_entries.id  (nullable = general payment)')
                  ->constrained('credit_entries')
                  ->onDelete('set null');
            $table->date('payment_date')
                  ->comment('Date the payment was made');

            $table->decimal('amount_paid', 12, 2)
                  ->comment('₹ amount paid in THIS transaction');

            $table->enum('payment_mode', [
                'Cash',
                'UPI',
                'NEFT',
                'Cheque',
                'Bank Transfer',
                'Others',
            ])->default('Cash');

            $table->string('reference')->nullable()
                  ->comment('UTR number / Cheque number / UPI transaction ID');

            $table->text('notes')->nullable()
                  ->comment('Optional remark for this payment');

                $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->string('created_by_name')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('vendor_id',        'idx_pay_vendor');
            $table->index('credit_entry_id',  'idx_pay_entry');
            $table->index('payment_date',     'idx_pay_date');
            $table->index('payment_mode',     'idx_pay_mode');
            $table->index('deleted_at',       'idx_pay_deleted');

            $table->index(['vendor_id', 'payment_date'], 'idx_pay_vendor_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_payments');
    }
};
