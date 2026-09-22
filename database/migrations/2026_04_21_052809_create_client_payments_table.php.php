<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_project_id')->constrained('client_projects')->onDelete('cascade');
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->decimal('gst_amount', 15, 2)->default(0.00)->nullable();
            $table->enum('payment_mode', [
                'cash',
                'cheque',
                'upi',
                'bank_transfer',
                'other'
            ]);
            $table->string('reference_number')->nullable(); // cheque no / UTR / ref
            $table->text('notes')->nullable();
            $table->date('next_due_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_payments');
    }
};