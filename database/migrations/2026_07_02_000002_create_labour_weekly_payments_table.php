<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labour_weekly_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')
                  ->constrained('labour_weekly_bills')
                  ->onDelete('cascade');
            $table->foreignId('worker_id')
                  ->constrained('workers')
                  ->onDelete('cascade');
            $table->string('worker_name', 150);
            $table->decimal('daily_rate', 10, 2)->default(0);

            // This week's attendance
            $table->decimal('total_shifts', 6, 1)->default(0);
            $table->decimal('total_earned', 12, 2)->default(0);

            // Carry-over from previous week
            $table->decimal('previous_balance', 12, 2)->default(0);

            // Running total
            $table->decimal('total_due', 12, 2)->default(0);   // earned + previous

            // Payment recorded Saturday evening
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance_carried', 12, 2)->default(0); // total_due − paid

            $table->timestamp('paid_at')->nullable();
            $table->enum('payment_mode', ['cash', 'bank_transfer', 'upi', 'cheque', 'other'])
                  ->default('cash');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'partial', 'paid'])->default('pending');
            $table->timestamps();

            $table->unique(['bill_id', 'worker_id']);
            $table->index(['worker_id', 'bill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labour_weekly_payments');
    }
};
