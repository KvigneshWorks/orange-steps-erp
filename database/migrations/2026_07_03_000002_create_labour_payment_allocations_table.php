<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labour_payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->string('client_name');
            $table->decimal('shifts_total', 8, 2)->default(0);
            $table->decimal('earned_total', 12, 2)->default(0);
            $table->decimal('outstanding_before', 12, 2)->default(0);
            $table->decimal('allocated', 12, 2)->default(0);
            $table->decimal('outstanding_after', 12, 2)->default(0);
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('labour_payment_sessions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labour_payment_allocations');
    }
};
