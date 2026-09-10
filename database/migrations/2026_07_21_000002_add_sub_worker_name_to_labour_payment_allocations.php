<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Lets a payment allocation be tied to a specific person within a client —
// '__OWN__' for the head worker's own attendance, a sub-worker's name (e.g.
// "dinesh") for that sub-worker, or NULL for older/legacy allocations that
// were recorded before per-person settlement existed (a blanket client-level
// payment, not attributable to one person).
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('labour_payment_allocations') && !Schema::hasColumn('labour_payment_allocations', 'sub_worker_name')) {
            Schema::table('labour_payment_allocations', function (Blueprint $table) {
                $table->string('sub_worker_name', 150)->nullable()->after('client_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('labour_payment_allocations') && Schema::hasColumn('labour_payment_allocations', 'sub_worker_name')) {
            Schema::table('labour_payment_allocations', function (Blueprint $table) {
                $table->dropColumn('sub_worker_name');
            });
        }
    }
};
