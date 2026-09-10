<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function tables(): array
    {
        return [
            'categories',
            'sub_categories',
            'id_types',
            'bio_data',
            'sub_names',
            'clients',
            'client_projects',
            'client_payments',
            'project_budget_histories',
            'daybook_entries',
            'credit_vendors',
            'credit_entries',
            'credit_payments',
            'workers',
        ];
    }

    public function up(): void
    {
        foreach ($this->tables() as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            $hasDeletedAt = Schema::hasColumn($table, 'deleted_at');

            Schema::table($table, function (Blueprint $t) use ($table, $hasDeletedAt) {
                if (! Schema::hasColumn($table, 'deleted_by')) {
                    $col = $t->foreignId('deleted_by')->nullable();
                    if ($hasDeletedAt) {
                        $col->after('deleted_at');
                    }
                    $col->constrained('users')->onDelete('set null');
                }

                if (! Schema::hasColumn($table, 'deleted_by_name')) {
                    $t->string('deleted_by_name')->nullable()->after('deleted_by');
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables() as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $t) use ($table) {
                if (Schema::hasColumn($table, 'deleted_by')) {
                    $t->dropForeign(['deleted_by']);
                    $t->dropColumn('deleted_by');
                }

                if (Schema::hasColumn($table, 'deleted_by_name')) {
                    $t->dropColumn('deleted_by_name');
                }
            });
        }
    }
};
