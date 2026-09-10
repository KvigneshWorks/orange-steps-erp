<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('bio_data_id')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('daybook_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('bio_data_id')->nullable(false)->change();
        });
    }
};
