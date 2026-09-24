<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adds a many-to-many pivot between categories and sub_categories so a
     * single sub-category (e.g. "Engineer") can be linked to more than one
     * category (e.g. Fuel and Salary) instead of needing a duplicate row
     * per category. The existing sub_categories.category_id column is left
     * in place (used as the "primary" category for backward compatibility
     * with anything still reading it directly, e.g. the Recycle Bin
     * summary) and every existing link is backfilled into the new pivot
     * table so nothing that already worked breaks.
     */
    public function up(): void
    {
        Schema::create('category_sub_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('sub_category_id')->constrained('sub_categories')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['category_id', 'sub_category_id']);
        });

        $now = now();
        $rows = DB::table('sub_categories')->whereNotNull('category_id')->get(['id', 'category_id']);
        $insert = [];
        foreach ($rows as $row) {
            $insert[] = [
                'category_id' => $row->category_id,
                'sub_category_id' => $row->id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        if (!empty($insert)) {
            foreach (array_chunk($insert, 500) as $chunk) {
                DB::table('category_sub_category')->insert($chunk);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('category_sub_category');
    }
};
