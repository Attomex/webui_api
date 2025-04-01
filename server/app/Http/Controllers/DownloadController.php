<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Report;
use App\Models\Computer;
use App\Models\ReportVulnerability;
use App\Services\LoggerService;
use Log;

class DownloadController extends Controller
{
    protected $loggerService;

    public function __construct(LoggerService $loggerService)
    {
        $this->loggerService = $loggerService;
    }

    public function download(Request $request)
    {
        // получаем юзера
        $user = $request->user()->email;
        // Получаем данные из запроса
        $computerIdentifier = $request->input('computer_identifier');
        $reportNumber = $request->input('report_number');
        $reportDate = $request->input('report_date');

        // Находим компьютер по идентификатору
        $computer = Computer::where('identifier', $computerIdentifier)->first();
        if (!$computer) {
            return response()->json(['error' => 'Компьютер не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
        }

        // Ищем отчёт для этого компьютера
        $report = Report::where('computer_id', $computer->id)
            ->where('report_number', $reportNumber)
            ->where('report_date', $reportDate)
            ->first();

        if (!$report) {
            return response()->json(['error' => 'Отчёт не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Получаем все уязвимости через промежуточную таблицу report_vulnerability
            $reportVulnerabilities = ReportVulnerability::where('report_id', $report->id)
                ->with(['files', 'identifiers', 'vulnerability']) // Загружаем файлы, идентификаторы и сами уязвимости
                ->get();

            // Создаем массив для хранения данных
            $vulnerabilitiesData = [];

            // Обрабатываем каждую уязвимость
            foreach ($reportVulnerabilities as $reportVuln) {
                $vulnerabilityData = [
                    'identifiers' => $reportVuln->identifiers->pluck('number')->toArray(), // Собираем идентификаторы
                    'error_level' => $reportVuln->vulnerability->error_level,
                    'name' => $reportVuln->vulnerability->name,
                    'description' => $reportVuln->vulnerability->description,
                    'remediation_measures' => $reportVuln->vulnerability->remediation_measures,
                    'source_links' => explode(',', $reportVuln->vulnerability->source_links),
                    'files' => $reportVuln->files->pluck('file_path')->toArray(), // Собираем пути к файлам
                ];

                // Добавляем уязвимость в общий массив
                $vulnerabilitiesData[] = $vulnerabilityData;
            }
            $this->loggerService->log('Скачивание отчёта', $user, [
                'status' => 'Успешно получены данные отчёта',
                'computer' => $computerIdentifier,
                'report_date' => $reportDate,
                'report_number' => $reportNumber
            ]);

            $errorLevels = [
                'critical' => $report->total_critical,
                'high' => $report->total_high,
                'medium' => $report->total_medium,
                'low' => $report->total_low,
            ];

            // Возвращаем данные в структурированном виде
            return response()->json([
                'vulnerabilities' => $vulnerabilitiesData,
                'errorLevels' => $errorLevels,
                'statusReport' => $report->status,
                'message' => 'Успешно получены данные отчёта',
            ]);
        } catch (\Exception $e) {
            // Log::error('Ошибка при получении данных отчёта: ' . $e->getMessage());
            $this->loggerService->log('Скачивание отчёта', $user, [
                'status' => 'Произошла ошибка при получении данных отчёта',
                'computer' => $computerIdentifier,
                'report_date' => $reportDate,
                'report_number' => $reportNumber,
                'error' => $e->getMessage()
            ]);
            return response()->json(
                ['error' => 'Произошла ошибка при получении данных отчёта', 'status' => '500'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
