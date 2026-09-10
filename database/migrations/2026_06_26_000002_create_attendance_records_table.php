<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->string('worker_name', 150);   // snapshot
            $table->string('worker_code', 30);    // snapshot
            $table->enum('worker_type', ['employee', 'labour', 'contractor']);
            $table->string('trade', 100);
            $table->string('site', 200);
            $table->date('date');
            $table->decimal('shifts_worked', 4, 1)->default(1.0); // 0.5, 1.0, 1.5, 2.0
            $table->enum('status', ['present', 'absent', 'on_leave'])->default('present');
            $table->decimal('daily_rate', 10, 2)->default(0);     // snapshot at mark time
            $table->decimal('amount', 10, 2)->default(0);          // shifts × rate
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['worker_id', 'date']); // one record per worker per day
            $table->index(['date', 'site']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
