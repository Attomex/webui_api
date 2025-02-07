<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VulnerabilityBase;
use App\Models\Computer;
use App\Models\Report;

class MainPageAdminController extends Controller
{
    public function getVulnerabilityBase() {
        $latest = VulnerabilityBase::latest('date')->first();
        $latest = $latest?->toArray();
        return response()->json(['latest' => $latest]);
    }

    public function computersCount() {
        $count = Computer::count();
        return response()->json(["count" => $count]);
    }

    public function reportsCount() {
        $count = Report::count();
        return response()->json(["count" => $count]);;
    }
}
