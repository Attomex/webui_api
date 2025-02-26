<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IdentifierCount extends Model
{
    use HasFactory;

    protected $fillable = ['identifier_id', 'count'];

    public $hidden = ['created_at', 'updated_at'];

    // Отношение с таблицей identifiers
    public function identifier()
    {
        return $this->belongsTo(Identifier::class, 'identifier_id');
    }
}
