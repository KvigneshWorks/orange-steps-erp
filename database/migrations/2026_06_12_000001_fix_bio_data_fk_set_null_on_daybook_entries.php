<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Change daybook_entries.bio_data_id FK from (no action) → SET NULL
 * so that deleting a bio_data record automatically nullifies the reference
 * in daybook_entries instead of throwing an integrity constraint error.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            // Drop the existing FK constraint
            $table->dropForeign(['bio_data_id']);

            // Re-add with nullOnDelete so deleting bio_data sets the column to NULL
            $table->foreign('bio_data_id')
                  ->references('id')
                  ->on('bio_data')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            $table->dropForeign(['bio_data_id']);

            // Restore original FK (no onDelete action)
            $table->foreign('bio_data_id')
                  ->references('id')
                  ->on('bio_data');
        });
    }
};
