<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('labour_payment_sessions')) {
            return;
        }

        Schema::table('labour_payment_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('labour_payment_sessions', 'created_by_name')) {
                $table->string('created_by_name')->nullable()->after('created_by');
            }
        });

        DB::statement('UPDATE labour_payment_sessions s JOIN users u ON u.id = s.created_by SET s.created_by_name = u.name WHERE s.created_by_name IS NULL');
    }

    public function down(): void
    {
        if (!Schema::hasTable('labour_payment_sessions')) {
            return;
        }

        Schema::table('labour_payment_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('labour_payment_sessions', 'created_by_name')) {
                $table->dropColumn('created_by_name');
            }
        });
    }
};
