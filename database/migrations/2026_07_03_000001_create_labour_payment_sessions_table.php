<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labour_payment_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('worker_id');
            $table->string('worker_name');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->enum('payment_mode', ['cash','bank_transfer','upi','cheque','other'])->default('cash');
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labour_payment_sessions');
    }
};
