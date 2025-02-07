<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Computer;
use App\Models\Report;
use Exception;
use Symfony\Component\HttpFoundation\Response;

class SelectFieldController extends Controller
{
    public function getComputersIdentifiers()
    {
        try {
            $identifiers = Computer::all();
            $response = response()->json($identifiers);

            return $response;
        } catch (Exception $e) {
            return response()->json(['error' => "Не удалось получить идентификаторы компьютеров"], Response::HTTP_METHOD_NOT_ALLOWED);
        }
    }


    public function getReportsByComputer(Request $request)
    {
        $computerIdentifier = $request->query('computer_identifier');
        $reportDate = $request->query('report_date');

        $computer = Computer::where('identifier', $computerIdentifier)->first();

        if (!$computer) {
            return response()->json(['error' => 'Computer not found'], 404);
        }

        $query = Report::where('computer_id', $computer->id);

        if ($reportDate) {
            $query->where('report_date', $reportDate);
        }

        $reports = $query->get();

        return response()->json($reports);
    }
}
