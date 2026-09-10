<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('project_name');
            $table->enum('project_type', [
                'construction',
                'interior',
                'architecture',
                'drawing',
                'pmc'
            ]);
            $table->date('start_date');
            $table->decimal('total_budget', 15, 2);
            $table->text('description')->nullable();
            $table->text('type_notes')->nullable(); 
            $table->enum('status', ['active', 'on_hold', 'completed'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_projects');
    }
};