<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('identifier_counts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('identifier_id'); // Внешний ключ для связи с таблицей identifiers
            $table->unsignedInteger('count')->default(0); // Поле для хранения количества
            $table->timestamps();

            $table->foreign('identifier_id')
                ->references('id')
                ->on('identifiers')
                ->onDelete('cascade'); // Удаление записей при удалении связанного идентификатора
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identifier_counts');
    }
};
