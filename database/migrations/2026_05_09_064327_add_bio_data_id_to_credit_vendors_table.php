<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('credit_vendors', 'bio_data_id')) {
                $table->unsignedBigInteger('bio_data_id')->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('credit_vendors', function (Blueprint $table) {
            if (Schema::hasColumn('credit_vendors', 'bio_data_id')) {
                $table->dropColumn('bio_data_id');
            }
        });
    }
};
