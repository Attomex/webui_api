<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Computer;
use App\Models\ReportVulnerability;
use App\Models\IdentifierCount;
use App\Models\FileCpe;
use App\Models\Vulnerability;
use App\Models\Identifier;
use App\Models\File;
use DB;
use Exception;
use Symfony\Component\HttpFoundation\Response;
use App\Services\LoggerService;

class UploadController extends Controller
{
    protected $loggerService;

    public function __construct(LoggerService $loggerService)
    {
        $this->loggerService = $loggerService;
    }

    public function store(Request $request)
    {
        $user = $request->user()->email;
        $startTime = microtime(true);
        $parsed = $request->json()->all();

        DB::beginTransaction();
        try {
            // 1) Проверяем дубликат отчёта
            if (Report::where('report_number', $parsed['reportNumber'])->exists()) {
                return response()->json([
                    'message' => 'Отчёт с таким номером уже был загружен!',
                    'status'  => '400'
                ], Response::HTTP_BAD_REQUEST);
            }

            // 2) Prefetch & cache ключей для bulk операций
            $ids = $cpes = $files = $vulnKeys = [];
            foreach ($parsed['vulnerabilities'] as $v) {
                $ids      = array_merge($ids, explode('; ', $v['id']));
                $cpes    = array_merge($cpes, $v['fileCPE'] ?? []);
                $files   = array_merge($files, $v['files']   ?? []);
                $vulnKeys[]= md5($v['error_level'].$v['title'].$v['description']);
            }
            $ids      = array_unique($ids);
            $cpes    = array_unique($cpes);
            $files   = array_unique($files);
            $vulnKeys= array_unique($vulnKeys);

            // 3) Кэш существующих записей
            $existIds   = Identifier::whereIn('number', $ids)->get()->keyBy('number');
            $existCpes  = FileCpe::whereIn('cpe', $cpes)->get()->keyBy('cpe');
            $existFiles = File::whereIn('file_path', $files)->get()->keyBy('file_path');
            $existV     = Vulnerability::select('id', DB::raw("md5(concat(error_level, name, description)) as hash"))
                            ->whereIn(DB::raw("md5(concat(error_level, name, description))"), $vulnKeys)
                            ->get()->keyBy('hash');

            // 4) Bulk-upsert новых Identifier, FileCpe, File, Vulnerability
            $now = now();
            // Identifiers
            $newIds = [];
            foreach ($ids as $num) {
                if (!isset($existIds[$num])) {
                    $newIds[] = ['number'=>$num,'created_at'=>$now,'updated_at'=>$now];
                }
            }
            if ($newIds) {
                Identifier::insert($newIds);
                $existIds = Identifier::whereIn('number', $ids)->get()->keyBy('number');
            }
            // CPE
            $newCpes = [];
            foreach ($cpes as $c) {
                if (!isset($existCpes[$c])) {
                    $newCpes[] = ['cpe'=>$c,'created_at'=>$now,'updated_at'=>$now];
                }
            }
            if ($newCpes) {
                FileCpe::insert($newCpes);
                $existCpes = FileCpe::whereIn('cpe', $cpes)->get()->keyBy('cpe');
            }
            // Files (bulk insertIgnore)
            if (!empty($files)) {
                $fileRows = [];
                foreach ($files as $f) {
                    $fileRows[] = ['file_path'=>$f,'created_at'=>$now,'updated_at'=>$now];
                }
                DB::table((new File)->getTable())->insertOrIgnore($fileRows);
            }
            // Reload cache всегда, чтобы не было пропущенных ключей
            $existFiles = File::whereIn('file_path', $files)->get()->keyBy('file_path');

            // Vulnerabilities
            $newV = [];
            foreach ($parsed['vulnerabilities'] as $v) {
                $key = md5($v['error_level'].$v['title'].$v['description']);
                if (!isset($existV[$key])) {
                    $newV[] = [
                        'error_level'=> $v['error_level'],
                        'name'=> $v['title'],
                        'description'=> $v['description'],
                        'source_links'=> implode(',', $v['references']),
                        'remediation_measures'=> $v['measures'],
                        'file_cpe_id'=> $existCpes[$v['fileCPE'][0]]->id ?? null,
                        'created_at'=> $now,'updated_at'=> $now,
                    ];
                }
            }
            if ($newV) {
                Vulnerability::insert($newV);
                $existV = Vulnerability::select('id', DB::raw("md5(concat(error_level, name, description)) as hash"))
                            ->whereIn(DB::raw("md5(concat(error_level, name, description))"), $vulnKeys)
                            ->get()->keyBy('hash');
            }

            // 5) Обработка компьютера и предыдущего отчёта
            $computer = Computer::firstOrCreate(['identifier'=>$parsed['computerIdentifier']]);
            $prev = $computer->reports()->where('status','активный')->orderBy('report_date','desc')->first();
            if ($prev) {
                $prev->update(['status'=>'неактивный']);
                $prevIds = DB::table('report_vulnerability_identifiers')
                    ->join('report_vulnerability','report_vulnerability_identifiers.report_vulnerability_id','=','report_vulnerability.id')
                    ->where('report_vulnerability.report_id',$prev->id)
                    ->pluck('identifier_id')->toArray();
                IdentifierCount::whereIn('identifier_id',$prevIds)->where('count','>',0)->decrement('count');
            }

            // 6) Создание нового отчёта
            $report = $computer->reports()->create([
                'report_date'=> $parsed['reportDate'], 'report_number'=> $parsed['reportNumber'],
                'total_critical'=> $parsed['totalCritical'], 'total_high'=> $parsed['totalHigh'],
                'total_medium'=> $parsed['totalMedium'], 'total_low'=> $parsed['totalLow'],
                'status'=>'активный',
            ]);

            // 7) Bulk insert pivots
            $rvRows=[]; foreach ($parsed['vulnerabilities'] as $v) {
                $hash=md5($v['error_level'].$v['title'].$v['description']);
                $rvRows[]= ['report_id'=>$report->id,'vulnerability_id'=>$existV[$hash]->id,
                            'created_at'=>$now,'updated_at'=>$now];
            }
            ReportVulnerability::insertOrIgnore($rvRows);
            $rvs = ReportVulnerability::where('report_id',$report->id)->get()->keyBy('vulnerability_id');

            $rviRows=[]; $rvfRows=[];
            foreach ($parsed['vulnerabilities'] as $v) {
                $hash = md5($v['error_level'].$v['title'].$v['description']);
                $rvId = $rvs[$existV[$hash]->id]->id;
                foreach (explode('; ',$v['id']) as $num) {
                    $iden = $existIds[$num] ?? null;
                    if (!$iden) continue;
                    $rviRows[]=['report_vulnerability_id'=>$rvId,'identifier_id'=>$iden->id,
                                'created_at'=>$now,'updated_at'=>$now];
                    IdentifierCount::firstOrCreate(['identifier_id'=>$iden->id],['count'=>0])->increment('count');
                }
                foreach ($v['files'] as $fp) {
                    if (empty($fp) || !isset($existFiles[$fp])) continue;
                    $file = $existFiles[$fp];
                    $rvfRows[]=['report_vulnerability_id'=>$rvId,'file_id'=>$file->id,
                                'created_at'=>$now,'updated_at'=>$now];
                }
            }
            DB::table('report_vulnerability_identifiers')->insertOrIgnore($rviRows);
            DB::table('report_vulnerability_files')->insertOrIgnore($rvfRows);

            DB::commit();
            $duration = round((microtime(true)-$startTime)*1000,4);
            $this->loggerService->log('Загрузка отчета',$user,['report_number'=>$report->report_number,'report_date'=>$report->report_date]);

            return response()->json(['message'=>'Отчет успешно загружен','uploadDuration'=>$duration]);
        } catch (Exception $e) {
            DB::rollBack();
            $this->loggerService->log('Ошибка при загрузке отчета',$user,['error'=>$e->getMessage()],'error');
            return response()->json(['message'=>"Произошла ошибка: {$e->getMessage()}",'status'=>'500'],Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
            // Сохранение исходного JSON в файл
            // $jsonString = json_encode($parsedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            // $filePath = storage_path('\\app\\reports\\' . uniqid() . '.json');
            // file_put_contents($filePath, $jsonString);


