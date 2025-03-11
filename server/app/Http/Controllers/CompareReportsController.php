<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Computer;
use App\Models\ReportVulnerability;
use Symfony\Component\HttpFoundation\Response;

class CompareReportsController extends Controller
{
    public function compareReports(Request $request)
    {
        $newReportNumber = $request->input('new_report_number');
        $newReportDate = $request->input('new_report_date');
        $oldReportNumber = $request->input('old_report_number');
        $oldReportDate = $request->input('old_report_date');
        $computerIdentifier = $request->input('computer_identifier');

        // Находим компьютер по идентификатору
        $computer = Computer::where('identifier', $computerIdentifier)->first();
        if (!$computer) {
            return response()->json(['error' => 'Компьютер не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
        }

        // Находим новый и старый отчеты
        $newReport = Report::where('computer_id', $computer->id)
            ->where('report_number', $newReportNumber)
            ->where('report_date', $newReportDate)
            ->first();

        $oldReport = Report::where('computer_id', $computer->id)
            ->where('report_number', $oldReportNumber)
            ->where('report_date', $oldReportDate)
            ->first();

        if (!$newReport || !$oldReport) {
            return response()->json(['error' => 'Один из отчётов не найден', 'status' => '400'], Response::HTTP_BAD_REQUEST);
        }

        // Получаем уязвимости для нового отчета
        $newVulnerabilities = ReportVulnerability::where('report_id', $newReport->id)
            ->with(['vulnerability', 'identifiers', 'files'])
            ->get()
            ->flatMap(function ($reportVulnerability, $index) {
                $vulnerability = $reportVulnerability->vulnerability;
                $identifiers_id = $reportVulnerability->identifiers->pluck('id');
                $identifiers = $reportVulnerability->identifiers->pluck('number')->toArray();
                $files = $reportVulnerability->files->pluck('file_path')->toArray();

                // Создаем массив уязвимостей, где каждая уязвимость представлена для каждого идентификатора
                return $reportVulnerability->identifiers->map(function ($identifier) use ($vulnerability, $identifiers, $files, $identifiers_id, $index) {
                    return [
                        'number' => $index + 1,
                        'id' => $vulnerability->id,
                        'identifier_id' => $identifiers_id,
                        'identifiers' => $identifiers, // Все идентификаторы уязвимости
                        'error_level' => $vulnerability->error_level,
                        'name' => $vulnerability->name,
                        'description' => $vulnerability->description,
                        'remediation_measures' => $vulnerability->remediation_measures,
                        'source_links' => explode(',', $vulnerability->source_links),
                        'files' => $files, // Добавляем файлы
                    ];
                })->keyBy('identifier_id');
            })
            ->toArray();

        // Получаем уязвимости для старого отчета
        $oldVulnerabilities = ReportVulnerability::where('report_id', $oldReport->id)
            ->with(['vulnerability', 'identifiers', 'files'])
            ->get()
            ->flatMap(function ($reportVulnerability, $index) {
                $vulnerability = $reportVulnerability->vulnerability;
                $identifiers_id = $reportVulnerability->identifiers->pluck('id');
                $identifiers = $reportVulnerability->identifiers->pluck('number')->toArray();
                $files = $reportVulnerability->files->pluck('file_path')->toArray();

                // Создаем массив уязвимостей, где каждая уязвимость представлена для каждого идентификатора
                return $reportVulnerability->identifiers->map(function ($identifier) use ($vulnerability, $identifiers, $files, $identifiers_id, $index) {
                    return [
                        'number' => $index + 1,
                        'id' => $vulnerability->id,
                        'identifier_id' => $identifiers_id,
                        'identifiers' => $identifiers, // Все идентификаторы уязвимости
                        'error_level' => $vulnerability->error_level,
                        'name' => $vulnerability->name,
                        'description' => $vulnerability->description,
                        'remediation_measures' => $vulnerability->remediation_measures,
                        'source_links' => explode(',', $vulnerability->source_links),
                        'files' => $files, // Добавляем файлы
                    ];
                })->keyBy('identifier_id');
            })
            ->toArray();

        // Сравниваем уязвимости
        $appearedVulnerabilities = array_diff_key($newVulnerabilities, $oldVulnerabilities);
        $remainingVulnerabilities = array_intersect_key($newVulnerabilities, $oldVulnerabilities);
        $fixedVulnerabilities = array_diff_key($oldVulnerabilities, $newVulnerabilities);

        // // Формируем массив с результатами
        // $results = [
        //     'appeared_vulnerabilities' => array_values($appearedVulnerabilities),
        //     'remaining_vulnerabilities' => array_values($remainingVulnerabilities),
        //     'fixed_vulnerabilities' => array_values($fixedVulnerabilities),
        // ];

        // // Преобразуем массив в JSON
        // $jsonResults = json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        // // Сохраняем результаты в файл
        // $filePath = storage_path('app/comparison_results.json'); // Путь к файлу в директории storage/app
        // file_put_contents($filePath, $jsonResults);

        return response()->json([
            'appeared_vulnerabilities' => array_values($appearedVulnerabilities),
            'remaining_vulnerabilities' => array_values($remainingVulnerabilities),
            'fixed_vulnerabilities' => array_values($fixedVulnerabilities),
            'message' => 'Успешно сравнены отчёты',
        ]);
    }
}