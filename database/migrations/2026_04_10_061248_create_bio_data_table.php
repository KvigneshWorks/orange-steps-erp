<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bio_data', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('id_type_id')->constrained('id_types')->onDelete('cascade');
            $table->string('id_details');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('sub_category_id')->nullable()->constrained('sub_categories')->onDelete('set null');
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('created_by_name')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bio_data');
    }
};
