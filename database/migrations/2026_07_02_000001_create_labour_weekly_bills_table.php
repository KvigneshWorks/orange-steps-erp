<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labour_weekly_bills', function (Blueprint $table) {
            $table->id();
            $table->date('week_start');   // Monday
            $table->date('week_end');     // Saturday (or Sunday if opted)
            $table->timestamp('generated_at')->nullable();
            $table->enum('status', ['draft', 'published', 'paid'])->default('draft');
            $table->string('pdf_path')->nullable();
            $table->unsignedInteger('total_workers')->default(0);
            $table->decimal('total_earned', 12, 2)->default(0);
            $table->decimal('total_paid', 12, 2)->default(0);
            $table->decimal('total_balance', 12, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['week_start', 'week_end']);
            $table->index('week_start');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labour_weekly_bills');
    }
};
