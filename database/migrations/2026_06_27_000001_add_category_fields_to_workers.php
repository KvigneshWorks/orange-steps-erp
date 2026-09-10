<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('worker_code');
            $table->unsignedBigInteger('sub_category_id')->nullable()->after('category_id');
            $table->unsignedBigInteger('bio_data_id')->nullable()->after('sub_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn(['category_id', 'sub_category_id', 'bio_data_id']);
        });
    }
};
