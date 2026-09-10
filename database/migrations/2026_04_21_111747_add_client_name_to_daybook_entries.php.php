<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('daybook_entries', 'client_name')) {
                $table->string('client_name', 255)
                      ->nullable()
                      ->after('bio_data_id')
                      ->comment('Client name — populated only for income-type category entries');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            if (Schema::hasColumn('daybook_entries', 'client_name')) {
                $table->dropColumn('client_name');
            }
        });
    }
};
