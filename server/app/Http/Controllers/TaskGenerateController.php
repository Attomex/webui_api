<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\File;
use App\Models\ReportVulnerability;

class TaskGenerateController extends Controller
{
    public function generateTask(Request $request)
    {
        // Валидация входных данных
        $data = $request->json()->all();
        $reportNumber = $data['report_number'] ?? null;
        $filesData = $data['files'] ?? [];

        if (! $reportNumber || empty($filesData)) {
            return response()->json(['error' => 'Invalid input data'], 422);
        }

        // Получаем отчет по номеру
        $report = Report::where('report_number', $reportNumber)->first();
        if (! $report) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $result = [];

        foreach ($filesData as $fileData) {
            $filePath = $fileData['file'];
            $errorLevels = $fileData['error_levels'];

            // Извлекаем имя файла для гибкого поиска в БД
            $basename = basename(preg_replace('/\\\\/', '/', $filePath));
            $file = File::where('file_path', 'like', '%' . $basename . '%')->first();

            if (! $file) {
                // Если файл не найден, возвращаем пустой массив уязвимостей
                $result[] = ['file' => $filePath, 'vulnerabilities' => []];
                continue;
            }

            // Получаем связи "отчет-уязвимость" для этого файла и отчета
            $rvsForFile = ReportVulnerability::with(['vulnerability', 'identifiers'])
                ->where('report_id', $report->id)
                ->whereHas('files', function ($q) use ($file) {
                    $q->where('files.id', $file->id);
                })
                ->get();

            // Приводим уровни ошибок к нижнему регистру
            $limits = collect($errorLevels)
                ->mapWithKeys(fn($limit, $level) => [strtolower($level) => $limit])
                ->toArray();

            // Группируем по уровню ошибки
            $grouped = $rvsForFile->groupBy(fn($rv) => strtolower($rv->vulnerability->error_level));

            // Формируем массив уязвимостей для файла
            $vulnsOut = [];
            foreach ($limits as $level => $limit) {
                if (! isset($grouped[$level])) {
                    continue;
                }
                $grouped[$level]
                    ->take($limit)
                    ->each(function ($rv) use (&$vulnsOut) {
                        $ids = $rv->identifiers->pluck('number')->filter()->values()->toArray();
                        $vulnsOut[] = [
                            'identifiers' => $ids,
                            'vulnerability' => [
                                'name' => $rv->vulnerability->name,
                                'error_level' => $rv->vulnerability->error_level,
                                'description' => $rv->vulnerability->description,
                                'source_links' => $rv->vulnerability->source_links,
                                'remediation_measures' => $rv->vulnerability->remediation_measures,
                            ],
                            'identifiers_count' => count($ids),
                        ];
                    });
            }

            $result[] = [
                'file' => $filePath,
                'vulnerabilities' => $vulnsOut,
            ];
        }

        return response()->json($result);
    }
}
