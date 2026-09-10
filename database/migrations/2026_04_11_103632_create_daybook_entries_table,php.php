<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daybook_entries', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date')->index();
            $table->foreignId('category_id')
                  ->constrained('categories')
                  ->onDelete('restrict');
            $table->foreignId('sub_category_id')
                  ->nullable()
                  ->constrained('sub_categories')
                  ->onDelete('set null');
            $table->foreignId('bio_data_id')
                  ->constrained('bio_data')
                  ->onDelete('restrict');
            $table->enum('transaction_type', ['income', 'expense'])->index();
            $table->decimal('amount', 15, 2)->default(0.00);
            $table->enum('payment_mode', [
                'Cash',
                'UPI',
                'NEFT',
                'Cheque',
                'Bank Transfer',
                'Others'
            ])->default('Cash');
            $table->text('narration')->nullable();
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            $table->string('created_by_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['transaction_date', 'transaction_type']);
            $table->index('bio_data_id');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daybook_entries');
    }
};
