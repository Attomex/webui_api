<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FileCpe extends Model
{
    use HasFactory;

    protected $fillable = ['cpe'];

    public function vulnerabilities()
    {
        return $this->hasMany(Vulnerability::class);
    }
}
