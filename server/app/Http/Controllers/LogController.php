<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LoggerService;

class LogController extends Controller
{
    protected $loggerService;

    public function __construct(LoggerService $loggerService)
    {
        $this->loggerService = $loggerService;
    }

    public function getAvailableDateRanges()
    {
        $dateRanges = $this->loggerService->getAvailableDateRanges();
        return response()->json($dateRanges);
    }

    public function getLogsByDateRanges(Request $request)
    {
        // \Log::info($request);
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        try {
            $logs = $this->loggerService->getLogsByDateRange($startDate, $endDate);
            return response()->json(['logs' => $logs], 200);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Произошла ошибка при обработке запроса'], 500);
        }
    }
}
