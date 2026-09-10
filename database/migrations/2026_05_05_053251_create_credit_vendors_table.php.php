<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_vendors', function (Blueprint $table) {

            $table->id();
            $table->foreignId('category_id')
                  ->comment('FK → categories.id  (Paint Shop / Labour / Plywood etc.)')
                  ->constrained('categories')
                  ->onDelete('restrict');

            $table->foreignId('sub_category_id')
                  ->nullable()
                  ->comment('FK → sub_categories.id  (optional sub grouping)')
                  ->constrained('sub_categories')
                  ->onDelete('set null');
            $table->string('party_name')
                  ->comment('Free-text manual entry — becomes the unique account name');
            $table->string('phone', 20)->nullable()
                  ->comment('Contact number — optional');
            $table->string('business_name')->nullable()
                  ->comment('Shop / Firm name if different from party_name');
            $table->text('address')->nullable()
                  ->comment('Optional address for record keeping');
            $table->string('gstin', 20)->nullable()
                  ->comment('Optional GST number');
            $table->boolean('is_active')
                  ->default(true)
                  ->comment('Soft disable without deleting history');
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->string('created_by_name')->nullable()
                  ->comment('Snapshot of user name at creation time');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['category_id', 'party_name'], 'idx_vendor_cat_party');
            $table->index('sub_category_id',             'idx_vendor_subcat');
            $table->index('is_active',                   'idx_vendor_active');
            $table->index('deleted_at',                  'idx_vendor_deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_vendors');
    }
};
