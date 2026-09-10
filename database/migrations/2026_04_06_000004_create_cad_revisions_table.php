<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cad_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('file_name');
            $table->integer('revision_number')->default(1);
            $table->text('description')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('project_id');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cad_revisions');
    }
};
