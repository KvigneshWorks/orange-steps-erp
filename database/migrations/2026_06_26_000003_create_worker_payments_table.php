<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worker_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->string('worker_name', 150);
            $table->string('site', 200);
            $table->date('from_date');
            $table->date('to_date');
            $table->decimal('total_shifts', 6, 1)->default(0);
            $table->decimal('total_earned', 12, 2)->default(0); 
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0); 
            $table->enum('payment_mode', ['cash', 'bank_transfer', 'upi', 'cheque', 'other'])->default('cash');
            $table->string('reference_no', 100)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['partial', 'paid', 'advance'])->default('paid');
            $table->date('paid_on');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['worker_id', 'paid_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worker_payments');
    }
};
