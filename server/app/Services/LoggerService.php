<?php

namespace App\Services;

use Carbon\Carbon;
use RuntimeException;
use InvalidArgumentException;

class LoggerService
{
    protected $logDirectory;
    protected $logFile;
    protected $logLifetimeDays = 30;

    public function __construct()
    {
        $this->logDirectory = storage_path('logs/activity');
        $this->ensureLogDirectoryExists();
        $this->logFile = $this->getCurrentLogFile();
    }

    /**
     * Убеждается, что директория для логов существует.
     * Если директория не существует, пытается её создать.
     *
     * @throws RuntimeException Если не удалось создать директорию.
     */
    protected function ensureLogDirectoryExists()
    {
        if (!file_exists($this->logDirectory)) {
            if (!mkdir($this->logDirectory, 0775, true)) {
                throw new RuntimeException(
                    "Не удалось создать директорию для логов: {$this->logDirectory}. " .
                    "Проверьте права доступа или путь."
                );
            }
        }
    }

    /**
     * Возвращает текущий файл лога.
     * Если срок действия последнего файла истёк, создает новый.
     *
     * @return string Путь к текущему файлу лога.
     * @throws RuntimeException Если не удалось создать файл лога.
     */
    protected function getCurrentLogFile()
    {
        $files = glob($this->logDirectory . '/log_*.log');

        if (!empty($files)) {
            $latestFile = end($files);
            $fileName = basename($latestFile);

            // Извлекаем даты из имени файла
            preg_match('/log_(\d{2}-\d{2}-\d{4})_to_(\d{2}-\d{2}-\d{4})\.log/', $fileName, $matches);

            if (count($matches) === 3) {
                $endDate = Carbon::createFromFormat('d-m-Y', $matches[2]);

                // Если срок жизни файла истёк, создаем новый
                if ($endDate->isPast()) {
                    return $this->createNewLogFile();
                }

                return $latestFile;
            }
        }

        // Если файлов нет или формат не совпадает, создаем новый
        return $this->createNewLogFile();
    }

    /**
     * Создает новый файл лога.
     *
     * @return string Путь к новому файлу лога.
     * @throws RuntimeException Если не удалось создать файл.
     */
    protected function createNewLogFile()
    {
        $startDate = Carbon::now()->format('d-m-Y');
        $endDate = Carbon::now()->addDays($this->logLifetimeDays)->format('d-m-Y');
        $fileName = "log_{$startDate}_to_{$endDate}.log";
        $filePath = $this->logDirectory . '/' . $fileName;

        if (!touch($filePath)) {
            throw new RuntimeException("Не удалось создать файл лога: {$filePath}. Проверьте права доступа.");
        }

        return $filePath;
    }

    /**
     * Логирует действие пользователя.
     *
     * @param string $action Действие пользователя.
     * @param string $user_email Email пользователя.
     * @param array $data Дополнительные данные.
     * @param string $level Уровень логирования.
     * @throws RuntimeException Если не удалось записать лог.
     */
    public function log($action, $user_email, $data = [], $level = 'info')
    {
        $levelTranslations = [
            // 'emergency' => 'Аварийный',
            // 'alert' => 'Тревога',
            // 'critical' => 'Критический',
            'error' => 'Ошибка',
            'warning' => 'Предупреждение',
            // 'notice' => 'Уведомление',
            'info' => 'Информация',
            // 'debug' => 'Отладка',
        ];

        $logEntry = [
            'level' => $levelTranslations[$level] ?? $level,
            'time' => now()->timezone('Europe/Moscow')->format('d-m-Y H:i:s'),
            'user_email' => $user_email,
            'action' => $action,
            'data' => $data,
        ];

        $logEntryJson = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL;
        if (file_put_contents($this->logFile, $logEntryJson, FILE_APPEND) === false) {
            throw new RuntimeException("Не удалось записать лог в файл: {$this->logFile}.");
        }
    }

    /**
     * Возвращает доступные диапазоны дат для логов.
     *
     * @return array Массив с общим диапазоном дат.
     */
    public function getAvailableDateRanges()
    {
        $files = glob($this->logDirectory . '/log_*.log');
        // $dateRanges = [];

        $minStartDate = null;
        $maxEndDate = null;

        foreach ($files as $file) {
            $fileName = basename($file);
            preg_match('/log_(\d{2}-\d{2}-\d{4})_to_(\d{2}-\d{2}-\d{4})\.log/', $fileName, $matches);

            if (count($matches) === 3) {
                $startDate = $matches[1];
                $endDate = $matches[2];

                $startDateCarbon = Carbon::createFromFormat('d-m-Y', $startDate);
                $endDateCarbon = Carbon::createFromFormat('d-m-Y', $endDate);

                // Находим минимальную start_date
                if (!$minStartDate || $startDateCarbon->lt($minStartDate)) {
                    $minStartDate = $startDateCarbon;
                }

                // Находим максимальную end_date
                if (!$maxEndDate || $endDateCarbon->gt($maxEndDate)) {
                    $maxEndDate = $endDateCarbon;
                }

                // $dateRanges[] = [
                //     'start_date' => $startDate,
                //     'end_date' => $endDate,
                //     'file_name' => $fileName,
                // ];
            }
        }

        // Возвращаем общий диапазон и список файлов
        return [
            'overall_start_date' => $minStartDate?->format('d-m-Y'),
            'overall_end_date' => $maxEndDate?->format('d-m-Y'),
            // 'date_ranges' => $dateRanges,
        ];
    }

    /**
     * Возвращает логи за указанный диапазон дат.
     *
     * @param string $startDate Начальная дата (в формате dd-mm-yyyy).
     * @param string $endDate Конечная дата (в формате dd-mm-yyyy).
     * @return array Массив логов.
     * @throws InvalidArgumentException Если формат даты неверный.
     */
    public function getLogsByDateRange($startDate, $endDate)
    {
        $logs = [];
        $files = glob($this->logDirectory . '/log_*.log');

        // Проверяем формат дат
        if (!preg_match('/^\d{2}-\d{2}-\d{4}$/', $startDate) || !preg_match('/^\d{2}-\d{2}-\d{4}$/', $endDate)) {
            throw new InvalidArgumentException("Неверный формат даты. Ожидается формат dd-mm-yyyy.");
        }

        $startDateCarbon = Carbon::createFromFormat('d-m-Y', $startDate)->startOfDay();
        $endDateCarbon = Carbon::createFromFormat('d-m-Y', $endDate)->endOfDay();

        foreach ($files as $file) {
            $fileName = basename($file);
            // Извлекаем даты из имени файла
            preg_match('/log_(\d{2}-\d{2}-\d{4})_to_(\d{2}-\d{2}-\d{4})\.log/', $fileName, $matches);

            if (count($matches) === 3) {
                $fileStartDate = Carbon::createFromFormat('d-m-Y', $matches[1])->startOfDay();
                $fileEndDate = Carbon::createFromFormat('d-m-Y', $matches[2])->endOfDay();

                // Проверяем пересечение диапазонов
                if ($fileStartDate->lte($endDateCarbon) && $fileEndDate->gte($startDateCarbon)) {
                    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    foreach ($lines as $line) {
                        $logEntry = json_decode($line, true);

                        // Проверяем, что время лога соответствует формату
                        if (isset($logEntry['time']) && preg_match('/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/', $logEntry['time'])) {
                            $logTime = Carbon::createFromFormat('d-m-Y H:i:s', $logEntry['time']);

                            // Фильтруем логи по времени, включая границы
                            if ($logTime->betweenIncluded($startDateCarbon, $endDateCarbon)) {
                                $logs[] = $logEntry;
                            }
                        }
                    }
                }
            }
        }

        return $logs;
    }

    // Метод для удаления старых логов, пока неясно нужон или не нужон
    // public function deleteOldLogs()
    // {
    //     $files = glob($this->logDirectory . '/log_*.log');
    //     $threshold = Carbon::now()->subMonths(9);

    //     foreach ($files as $file) {
    //         $fileName = basename($file);
    //         preg_match('/log_(.*)_to_(.*)\.log/', $fileName, $matches);

    //         $fileEndDate = Carbon::createFromFormat('Y-m-d', $matches[2]);

    //         if ($fileEndDate->lt($threshold)) {
    //             unlink($file);
    //         }
    //     }
    // }
}