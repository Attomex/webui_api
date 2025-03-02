<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\ReportVulnerability;
use App\Models\File;
use App\Models\Computer;
use Symfony\Component\HttpFoundation\Response;
use App\Services\LoggerService;

class ViewController extends Controller
{
    // public function view(Request $request)
    // {
    //     // Получаем данные из запроса
    //     $computerIdentifier = $request->input('computer_identifier');
    //     $reportNumber = $request->input('report_number');
    //     $date = $request->input('report_date');

    //     // Находим компьютер по идентификатору
    //     $computer = Computer::where('identifier', $computerIdentifier)->first();
    //     if (!$computer) {
    //         return response()->json(['error' => 'Компьютер не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
    //     }

    //     // Ищем отчёт для этого компьютера
    //     $report = Report::where('computer_id', $computer->id)
    //         ->where('report_number', $reportNumber)
    //         ->where('report_date', $date)
    //         ->first();

    //     if (!$report) {
    //         return response()->json(['error' => 'Отчёт не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
    //     }

    //     try {
    //         // Получаем все уязвимости через промежуточную таблицу report_vulnerability
    //         $reportVulnerabilities = ReportVulnerability::where('report_id', $report->id)
    //             ->with(['files', 'identifiers', 'vulnerability']) // Загружаем файлы, идентификаторы и сами уязвимости
    //             ->get();

    //         // Создаем массив для хранения данных
    //         $filesData = [];

    //         // Обрабатываем каждую уязвимость
    //         foreach ($reportVulnerabilities as $reportVuln) {
    //             $vulnerabilityData = [
    //                 'identifiers' => $reportVuln->identifiers->pluck('number')->implode('; '), // Собираем идентификаторы
    //                 'error_level' => $reportVuln->vulnerability->error_level,
    //                 'name' => $reportVuln->vulnerability->name,
    //                 'description' => $reportVuln->vulnerability->description,
    //                 'remediation_measures' => $reportVuln->vulnerability->remediation_measures,
    //                 'source_links' => explode(',', $reportVuln->vulnerability->source_links),
    //             ];

    //             // Добавляем уязвимость в соответствующий файл
    //             foreach ($reportVuln->files as $file) {
    //                 $filePath = $file->file_path;
    //                 if (!isset($filesData[$filePath])) {
    //                     $filesData[$filePath] = [];
    //                 }
    //                 $filesData[$filePath][] = $vulnerabilityData;
    //             }
    //         }
    //         // $jsonString = json_encode($filesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    //         // $filePath = storage_path('\\app\\reports\\' . uniqid() . '.json');
    //         // file_put_contents($filePath, $jsonString);
    //         return response()->json([
    //             'vulnerabilities' => $filesData,
    //             'message' => 'Успешно получены уязвимости',
    //         ]);
    //     } catch (\Exception $e) {
    //         \Log::error('Ошибка при получении уязвимостей: ' . $e->getMessage());
    //         return response()->json(['error' => 'Произошла ошибка при получении уязвимостей', 'status' => '500'], Response::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    // }

    protected $loggerService;

    public function __construct(LoggerService $loggerService)
    {
        $this->loggerService = $loggerService;
    }

    public function getFiles(Request $request)
    {
        $user = $request->user()->email;
        // Получаем данные из запроса
        $computerIdentifier = $request->input('computer_identifier');
        $reportNumber = $request->input('report_number');
        $date = $request->input('report_date');

        // Находим компьютер по идентификатору
        $computer = Computer::where('identifier', $computerIdentifier)->first();
        if (!$computer) {
            return response()->json(['error' => 'Компьютер не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
        }

        // Ищем отчёт для этого компьютера
        $report = Report::where('computer_id', $computer->id)
            ->where('report_number', $reportNumber)
            ->where('report_date', $date)
            ->first();

        if (!$report) {
            return response()->json(['error' => 'Отчёт не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Получаем все файлы, связанные с отчётом
            $reportVulnerabilities = ReportVulnerability::where('report_id', $report->id)
                ->with('files')
                ->get();

            // Создаем массив для хранения данных
            $files = [];
            $fileCount = 0; // Счетчик файлов

            // Обрабатываем каждый файл
            foreach ($reportVulnerabilities as $reportVuln) {
                foreach ($reportVuln->files as $file) {
                    // Добавляем файл в массив только если он еще не был добавлен
                    if (!isset($files[$file->file_path])) {
                        $files[$file->file_path] = $file;
                        $fileCount++; // Увеличиваем счетчик файлов
                    }
                }
            }

            $this->loggerService->log('Получение файлов', $user, [
                'computer_identifier' => $computerIdentifier,
                'report_number' => $reportNumber,
                'report_date' => $date,
                'files_count' => $fileCount,
            ]);

            return response()->json([
                'report_id' => $report->id,
                'files' => array_values($files),
                'filesCount' => $fileCount,
                'message' => 'Успешно получены файлы',
            ]);
        } catch (\Exception $e) {
            // \Log::error('Ошибка при получении файлов: ' . $e->getMessage());
            $this->loggerService->log('Ошибка при получении файлов', $user, [
                'computer_identifier' => $computerIdentifier,
                'report_number' => $reportNumber,
                'report_date' => $date,
                'error' => $e->getMessage(),
            ], 'ERROR');
            return response()->json(['error' => 'Произошла ошибка при получении файлов', 'status' => '500'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getVulnerabilities(Request $request)
{
    $user = $request->user()->email;

    // Получаем данные из запроса
    $fileId = $request->query('fileId');
    $reportId = $request->query('reportId');

    // Проверяем, что fileId и reportId переданы
    if (!$fileId || !$reportId) {
        return response()->json([
            'error' => 'Необходимо указать fileId и reportId',
            'status' => '400',
        ], Response::HTTP_BAD_REQUEST);
    }

    $file = File::where('id', $fileId)->first();
    if (!$file) {
        return response()->json(['error' => 'Файл не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
    }

    try {
        // Получаем все уязвимости, связанные с указанным файлом и отчётом
        $reportVulnerabilities = ReportVulnerability::where('report_id', $reportId)
            ->whereHas('files', function ($query) use ($fileId) {
                $query->where('files.id', $fileId); // Фильтруем по fileId
            })
            ->with(['identifiers', 'vulnerability']) // Загружаем идентификаторы и уязвимости
            ->get();

        // Создаем массив для хранения данных
        $vulnerabilitiesData = [];

        // Обрабатываем каждую уязвимость
        foreach ($reportVulnerabilities as $reportVuln) {
            $vulnerabilitiesData[] = [
                'identifiers' => $reportVuln->identifiers->pluck('number')->implode('; '), // Собираем идентификаторы
                'error_level' => $reportVuln->vulnerability->error_level,
                'name' => $reportVuln->vulnerability->name,
                'description' => $reportVuln->vulnerability->description,
                'remediation_measures' => $reportVuln->vulnerability->remediation_measures,
                'source_links' => explode(',', $reportVuln->vulnerability->source_links),
            ];
        }

        $this->loggerService->log('Получение связных уязвимостей', $user, [
            'file_id' => $fileId,
            'report_id' => $reportId,
        ]);

        return response()->json([
            'file' => $file,
            'vulnerabilities' => $vulnerabilitiesData,
            'message' => 'Успешно получены уязвимости',
        ]);
    } catch (\Exception $e) {
        $this->loggerService->log('Ошибка при получении уязвимостей', $user, [
            'file_id' => $fileId,
            'report_id' => $reportId,
            'error' => $e->getMessage(),
        ], 'error');
        \Log::error('Ошибка при получении уязвимостей: ' . $e->getMessage());
        return response()->json([
            'error' => 'Произошла ошибка при получении уязвимостей',
            'status' => '500',
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
}
