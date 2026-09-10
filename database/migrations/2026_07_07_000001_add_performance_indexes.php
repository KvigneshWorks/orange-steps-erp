<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Indexes for columns that are filtered/sorted on every dashboard
     * and list-page load (see DashboardController, ClientPortalController).
     * Added defensively — skips any index that already exists.
     */
    public function up(): void
    {
        Schema::table('client_projects', function (Blueprint $table) {
            if (!$this->indexExists('client_projects', 'client_projects_status_index')) {
                $table->index('status');
            }
            if (!$this->indexExists('client_projects', 'client_projects_created_at_index')) {
                $table->index('created_at');
            }
        });

        Schema::table('client_payments', function (Blueprint $table) {
            if (!$this->indexExists('client_payments', 'client_payments_next_due_date_index')) {
                $table->index('next_due_date');
            }
            if (!$this->indexExists('client_payments', 'client_payments_payment_date_index')) {
                $table->index('payment_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('client_projects', function (Blueprint $table) {
            if ($this->indexExists('client_projects', 'client_projects_status_index')) {
                $table->dropIndex('client_projects_status_index');
            }
            if ($this->indexExists('client_projects', 'client_projects_created_at_index')) {
                $table->dropIndex('client_projects_created_at_index');
            }
        });

        Schema::table('client_payments', function (Blueprint $table) {
            if ($this->indexExists('client_payments', 'client_payments_next_due_date_index')) {
                $table->dropIndex('client_payments_next_due_date_index');
            }
            if ($this->indexExists('client_payments', 'client_payments_payment_date_index')) {
                $table->dropIndex('client_payments_payment_date_index');
            }
        });
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $dbName = $connection->getDatabaseName();
        $result = $connection->select(
            "SELECT COUNT(1) AS cnt FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?",
            [$dbName, $table, $indexName]
        );

        return ($result[0]->cnt ?? 0) > 0;
    }
};
