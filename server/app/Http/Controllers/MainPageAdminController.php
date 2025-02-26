<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VulnerabilityBase;
use App\Models\Computer;
use App\Models\Report;
use App\Models\IdentifierCount;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MainPageAdminController extends Controller
{
    public function getVulnerabilityBase()
    {
        $cacheKey = 'vulnerability_base_latest';

        // Получаем текущие данные из базы данных
        $latestFromDB = VulnerabilityBase::latest('date')->first()?->toArray();

        // Получаем данные из кэша
        $latestFromCache = Cache::get($cacheKey);

        // Если данные в базе изменились или их нет в кэше, обновляем кэш
        if ($latestFromDB !== $latestFromCache) {
            Log::info("Данные в базе изменились. Обновляем кэш для ключа: {$cacheKey}");
            Cache::put($cacheKey, $latestFromDB, 3600);
        }

        // Возвращаем данные из кэша
        $latest = Cache::get($cacheKey);

        return response()->json(['latest' => $latest]);
    }

    /**
     * Получить количество записей в таблице Computer.
     */
    public function computersCount()
    {
        $cacheKey = 'computers_count';

        // Получаем текущие данные из базы данных
        $countFromDB = Computer::count();

        // Получаем данные из кэша
        $countFromCache = Cache::get($cacheKey);

        // Если данные в базе изменились или их нет в кэше, обновляем кэш
        if ($countFromDB !== $countFromCache) {
            Log::info("Данные в базе изменились. Обновляем кэш для ключа: {$cacheKey}");
            Cache::put($cacheKey, $countFromDB, 3600);
        }

        // Возвращаем данные из кэша
        $count = Cache::get($cacheKey);

        return response()->json(['count' => $count]);
    }

    /**
     * Получить количество записей в таблице Report.
     */
    public function reportsCount()
    {
        // Ключи для кэширования
        $cacheKeyTotal = 'reports_count_total';
        $cacheKeyActive = 'reports_count_active';
        $cacheKeyInactive = 'reports_count_inactive';

        // Получаем текущие данные из базы данных
        $totalCount = Report::count();
        $activeCount = Report::where('status', 'активный')->count();
        $inactiveCount = Report::where('status', 'неактивный')->count();

        // Получаем данные из кэша
        $cachedTotal = Cache::get($cacheKeyTotal);
        $cachedActive = Cache::get($cacheKeyActive);
        $cachedInactive = Cache::get($cacheKeyInactive);

        // Если данные в базе изменились или их нет в кэше, обновляем кэш
        if ($totalCount !== $cachedTotal || $activeCount !== $cachedActive || $inactiveCount !== $cachedInactive) {
            Log::info("Данные в базе изменились. Обновляем кэш для отчётов.");

            Cache::put($cacheKeyTotal, $totalCount, 3600); // Кэшируем на 1 час
            Cache::put($cacheKeyActive, $activeCount, 3600); // Кэшируем на 1 час
            Cache::put($cacheKeyInactive, $inactiveCount, 3600); // Кэшируем на 1 час
        }

        // Возвращаем данные из кэша
        return response()->json([
            'total' => Cache::get($cacheKeyTotal),
            'active' => Cache::get($cacheKeyActive),
            'inactive' => Cache::get($cacheKeyInactive),
        ]);
    }

    public function identifiersCount()
    {
        // Ключ для кэширования данных
        $cacheKey = 'top_identifiers';
        // Ключ для хэша данных
        $hashKey = 'top_identifiers_hash';

        // Получаем текущие данные из базы
        $topIdentifiers = IdentifierCount::with('identifier')
            ->orderBy('count', 'desc')
            ->take(15)
            ->get();

        // Форматируем данные
        $currentData = $topIdentifiers->map(function ($item) {
            return [
                'identifier_id' => $item->identifier_id,
                'identifier_number' => $item->identifier->number,
                'count' => $item->count,
            ];
        });

        // Создаем хэш текущих данных
        $currentHash = md5(serialize($currentData));

        // Получаем хэш закэшированных данных
        $cachedHash = Cache::get($hashKey);

        // Если хэши не совпадают или кэш пуст, обновляем кэш
        if ($cachedHash !== $currentHash || !Cache::has($cacheKey)) {
            // Сохраняем новые данные в кэш
            Cache::put($cacheKey, $currentData, 3600); // Кэшируем на 1 час
            // Сохраняем новый хэш
            Cache::put($hashKey, $currentHash, 3600);
        }

        // Получаем данные из кэша
        $result = Cache::get($cacheKey);

        return response()->json($result);
    }


}