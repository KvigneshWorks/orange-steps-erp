<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('project_budget_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_project_id')->constrained('client_projects')->onDelete('cascade');
            $table->decimal('extra_amount', 15, 2);
            $table->string('reason')->nullable();
            $table->date('date_added');
            $table->foreignId('added_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('project_budget_histories');
    }
};
