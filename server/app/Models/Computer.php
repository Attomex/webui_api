<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Computer extends Model
{
    use HasFactory;

    protected $fillable = ['identifier'];

    protected $hidden = ['created_at', 'updated_at'];

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
