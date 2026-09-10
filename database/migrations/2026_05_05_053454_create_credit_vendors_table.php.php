<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * TABLE: credit_entries
     * ─────────────────────────────────────────────────────────────────────────
     * One row = one bill / purchase / credit event
     * One vendor → MANY credit entries
     *
     * RULE: Each bill is its own row.
     *       Total Credit = SUM(credit_amount) WHERE vendor_id = X
     *
     * NEVER store running totals here.
     * ─────────────────────────────────────────────────────────────────────────
     */
    public function up(): void
    {
        Schema::create('credit_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')
                  ->comment('FK → credit_vendors.id')
                  ->constrained('credit_vendors')
                  ->onDelete('cascade');
            $table->date('credit_date')
                  ->comment('Date when the purchase / credit happened');
            $table->string('bill_number')->nullable()
                  ->comment('Vendor invoice / challan number for reference');
            $table->text('description')->nullable()
                  ->comment('What was purchased — "50 sheets plywood 18mm", "3 days labour"');
            $table->decimal('credit_amount', 12, 2)
                  ->comment('₹ amount of THIS entry. Total = SUM of all entries per vendor');
            $table->date('due_date')->nullable()
                  ->comment('Date by which payment is expected');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])
                  ->default('medium')
                  ->comment('Used for sorting and filtering in UI');
            $table->text('notes')->nullable()
                  ->comment('Internal remark — not shown to vendor');
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            $table->string('created_by_name')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('vendor_id',    'idx_entry_vendor');
            $table->index('credit_date',  'idx_entry_date');
            $table->index('due_date',     'idx_entry_due');
            $table->index('priority',     'idx_entry_priority');
            $table->index('deleted_at',   'idx_entry_deleted');
            $table->index(['vendor_id', 'due_date'], 'idx_entry_vendor_due');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_entries');
    }
};
