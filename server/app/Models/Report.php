<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = ['report_date', 'report_number', 'total_critical', 'total_high', 'total_medium', 'total_low', 'computer_id'];

    protected $hidden = ['created_at', 'updated_at'];

    public function computer()
    {
        return $this->belongsTo(Computer::class);
    }

    public function vulnerabilities()
    {
        return $this->belongsToMany(Vulnerability::class, 'report_vulnerability')->withTimestamps();
    }
}