<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sub_names', function (Blueprint $table) {
            // Drop the existing foreign key first
            $table->dropForeign(['sub_category_id']);

            // Make the column nullable
            $table->foreignId('sub_category_id')
                  ->nullable()
                  ->change();

            // Re-add the foreign key constraint
            $table->foreign('sub_category_id')
                  ->references('id')
                  ->on('sub_categories')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('sub_names', function (Blueprint $table) {
            $table->dropForeign(['sub_category_id']);

            $table->foreignId('sub_category_id')
                  ->nullable(false)
                  ->change();

            $table->foreign('sub_category_id')
                  ->references('id')
                  ->on('sub_categories')
                  ->onDelete('cascade');
        });
    }
};
