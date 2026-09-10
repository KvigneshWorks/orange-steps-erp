<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('worker_code', 30)->unique();
            $table->enum('worker_type', ['employee', 'labour', 'contractor']);
            $table->string('trade', 100);
            $table->string('site', 200);
            $table->string('phone', 20)->nullable();
            $table->string('contractor_name', 150)->nullable();
            $table->decimal('daily_rate', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
