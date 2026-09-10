<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// id_types was the one Master Data table without creator tracking (it never
// had a "who added this" need until Admin could reach Master Data). Mirrors
// the same created_by/created_by_name pattern already on categories/
// sub_categories/bio_data/sub_names.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('id_types', function (Blueprint $table) {
            if (!Schema::hasColumn('id_types', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('id_types', 'created_by_name')) {
                $table->string('created_by_name')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('id_types', function (Blueprint $table) {
            if (Schema::hasColumn('id_types', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('id_types', 'created_by_name')) {
                $table->dropColumn('created_by_name');
            }
        });
    }
};
