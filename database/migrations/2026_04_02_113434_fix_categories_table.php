<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'name')) {
                $table->string('name')->unique()->after('id');
            }
            if (!Schema::hasColumn('categories', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
            if (Schema::hasColumn('categories', 'code')) {
                $table->string('code')->nullable()->unique()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['name', 'is_active']);
        });
    }
};
