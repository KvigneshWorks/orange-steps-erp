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
        Schema::table('categories', function (Blueprint $table) {
            if (! Schema::hasColumn('categories', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            }

            if (! Schema::hasColumn('categories', 'created_by_name')) {
                $table->string('created_by_name')->nullable()->after('code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }

            if (Schema::hasColumn('categories', 'created_by_name')) {
                $table->dropColumn('created_by_name');
            }
        });
    }
};
