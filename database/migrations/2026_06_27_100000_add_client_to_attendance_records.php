<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_records', 'bio_data_id')) {
                $table->unsignedBigInteger('bio_data_id')->nullable()->after('worker_id');
            }
            if (!Schema::hasColumn('attendance_records', 'client_name')) {
                $table->string('client_name', 150)->nullable()->after('bio_data_id');
            }
        });

        // Add a plain index on worker_id first (MySQL FK needs an index starting with worker_id).
        // Then we can safely drop the unique(worker_id,date) composite so the same
        // worker can be marked for multiple client-sites on the same day.
        if (empty(\DB::select("SHOW INDEX FROM attendance_records WHERE Key_name = 'idx_worker_id'"))) {
            \DB::statement('ALTER TABLE attendance_records ADD INDEX idx_worker_id (worker_id)');
        }
        if (!empty(\DB::select("SHOW INDEX FROM attendance_records WHERE Key_name = 'attendance_records_worker_id_date_unique'"))) {
            \DB::statement('ALTER TABLE attendance_records DROP INDEX attendance_records_worker_id_date_unique');
        }
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table) {
            $columnsToDrop = array_filter(
                ['bio_data_id', 'client_name'],
                fn ($col) => Schema::hasColumn('attendance_records', $col)
            );
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        if (empty(\DB::select("SHOW INDEX FROM attendance_records WHERE Key_name = 'attendance_records_worker_id_date_unique'"))) {
            Schema::table('attendance_records', function (Blueprint $table) {
                $table->unique(['worker_id', 'date']);
            });
        }
        if (!empty(\DB::select("SHOW INDEX FROM attendance_records WHERE Key_name = 'idx_worker_id'"))) {
            \DB::statement('ALTER TABLE attendance_records DROP INDEX idx_worker_id');
        }
    }
};
