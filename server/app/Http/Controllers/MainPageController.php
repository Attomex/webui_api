<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Exception;
use Symfony\Component\HttpFoundation\Response;

class MainPageController extends Controller
{
    public function index()
    {
        try {
            // $reports = Report::with('computer')->get();

            $reports = Report::with(['computer' => function ($query) {
                $query->select('id', 'identifier'); // Укажите нужные поля из модели Computer
            }])->where('status', 'активный')->get(['computer_id', 'report_date', 'total_critical', 'total_high', 'total_medium', 'total_low']);

            // $reports->each(function ($report) {
            //     $report->criticalErrors = $report->total_critical;
            //     $report->highErrors = $report->total_high;
            //     $report->mediumErrors = $report->total_medium;
            //     $report->lowErrors = $report->total_low;
            // });

            return response()->json($reports);

        } catch (Exception $e) {
            return response()->json(['error' => "Не удалось получить отчеты"], Response::HTTP_METHOD_NOT_ALLOWED);
        }

    }
}
