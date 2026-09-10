<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('id_number', 20);  // CHANGED from 'phone' to 'id_number'
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->text('notes')->nullable();

            // NEW FIELDS for ID Type tracking
            $table->unsignedBigInteger('id_type_id')->nullable();
            $table->string('id_type_name')->nullable();
            $table->string('id_details', 100)->nullable();

            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
