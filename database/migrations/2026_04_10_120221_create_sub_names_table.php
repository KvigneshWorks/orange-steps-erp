<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sub_names', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sub_category_id')
                  ->constrained('sub_categories')
                  ->onDelete('cascade');
            $table->string('alternate_name');
            $table->string('classification');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('created_by_name')->nullable();
            $table->timestamps();
            $table->unique(['sub_category_id', 'alternate_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sub_names');
    }
};
