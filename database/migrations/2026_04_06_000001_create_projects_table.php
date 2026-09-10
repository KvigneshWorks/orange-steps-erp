<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sub')->nullable(); 
            $table->enum('status', ['active', 'pending', 'review', 'hold'])->default('pending');
            $table->integer('progress')->default(0);
            $table->decimal('value', 12, 2)->default(0);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->index('status');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
