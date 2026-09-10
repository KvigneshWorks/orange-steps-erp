<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sub_names', function (Blueprint $table) {
            $table->dropForeign(['sub_category_id']);
            $table->dropUnique(['sub_category_id', 'alternate_name']);
            $table->foreignId('bio_data_id')
                  ->nullable()
                  ->constrained('bio_data')
                  ->onDelete('cascade')
                  ->after('sub_category_id');

            $table->unique(
                ['bio_data_id', 'alternate_name'],
                'sub_names_bio_data_id_alternate_name_unique'
            );

            $table->foreign('sub_category_id')
                  ->references('id')
                  ->on('sub_categories')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('sub_names', function (Blueprint $table) {
            $table->dropForeign(['bio_data_id']);
            $table->dropUnique(['bio_data_id', 'alternate_name']);

            $table->dropColumn('bio_data_id');
            $table->foreign('sub_category_id')
                  ->references('id')
                  ->on('sub_categories')
                  ->onDelete('cascade');
            $table->unique(
                ['sub_category_id', 'alternate_name'],
                'sub_names_sub_category_id_alternate_name_unique'
            );
        });
    }
};
