<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Report;
use App\Models\FileCpe;
use App\Models\ReportVulnerability;
use App\Models\File;
use App\Models\ReportVulnerabilityFile;
use App\Models\ReportVulnerabilityIdentifier;
use App\Models\Computer;
use Symfony\Component\HttpFoundation\Response;
use App\Services\LoggerService;

class ViewController extends Controller
{
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

            $errorLevels = [
                'critical' => $report->total_critical,
                'high' => $report->total_high,
                'medium' => $report->total_medium,
                'low' => $report->total_low,
            ];


            return response()->json([
                'report_id' => $report->id,
                'files' => array_values($files),
                'errorLevels' => $errorLevels,
                'reportStatus' => $report->status,
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
                ->with(['identifiers', 'vulnerability.fileCpe']) // Загружаем идентификаторы и уязвимости
                ->get();

            // Создаем массив для хранения данных
            $vulnerabilitiesData = [];

            // Обрабатываем каждую уязвимость
            foreach ($reportVulnerabilities as $reportVuln) {
                $vulnerability = $reportVuln->vulnerability;

                $vulnerabilitiesData[] = [
                    'identifiers' => $reportVuln->identifiers->pluck('number')->implode('; '),
                    'error_level' => $vulnerability->error_level,
                    'name' => $vulnerability->name,
                    'description' => $vulnerability->description,
                    'remediation_measures' => $vulnerability->remediation_measures,
                    'source_links' => explode(',', $vulnerability->source_links),
                    'cpe' => $vulnerability->fileCpe->cpe
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

    public function searchByDates(Request $request)
    {
        $reports = Report::with(['computer' => function ($query) {
            $query->select('id', 'identifier'); // Укажите нужные поля из модели Computer
        }])->whereBetween('report_date', [$request->start_date, $request->end_date])->get(['computer_id', 'report_date', 'report_number']);

        $this->loggerService->log('Поиск', $request->user()->email, [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date
        ]);

        return response()->json([
            'reports' => $reports]);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'computer_identifier' => 'required|string',
            'report_date' => 'required|date',
            'report_number' => 'required|string'
        ]);

        DB::transaction(function () use ($validated) {
            $report = Report::whereHas('computer', function ($q) use ($validated) {
                $q->where('identifier', $validated['computer_identifier']);
            })
                ->where([
                    ['report_number', $validated['report_number']],
                    ['report_date', $validated['report_date']]
                ])
                ->firstOrFail();

            $reportVulnerabilityIds = ReportVulnerability::where('report_id', $report->id)
                ->pluck('id');

            if ($report->status === 'активный') {
                $identifiers = ReportVulnerabilityIdentifier::whereIn(
                    'report_vulnerability_id',
                    $reportVulnerabilityIds
                )->with('identifier.identifierCount')->get();

                $identifiers->groupBy('identifier_id')->each(function ($items, $identifierId) {
                    if ($countRecord = $items->first()->identifier->identifierCount) {
                        $countRecord->decrement('count', $items->count());

                        // if ($countRecord->fresh()->count <= 0) {
                        //     $countRecord->delete();
                        // }
                    }
                });
            }

            if ($reportVulnerabilityIds->isNotEmpty()) {
                ReportVulnerabilityFile::whereIn('report_vulnerability_id', $reportVulnerabilityIds)
                    ->delete();

                ReportVulnerabilityIdentifier::whereIn('report_vulnerability_id', $reportVulnerabilityIds)
                    ->delete();

                ReportVulnerability::where('report_id', $report->id)->delete();
            }

            $report->delete();
        });

        return response()->json(['message' => 'Report deleted successfully'], 200);
    }
}
