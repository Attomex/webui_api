<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\MainPageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MainPageAdminController;
use App\Http\Controllers\SelectFieldController;
use App\Http\Controllers\ViewController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\CompareReportsController;
use App\Http\Controllers\DownloadController;

Route::get('/cards', [MainPageController::class, 'index'])->middleware('guest');

Route::prefix('admin')->middleware('jwt.auth')->group(function () {
    Route::get('/latestbase', [MainPageAdminController::class, 'getVulnerabilityBase']);
    Route::get('/computerscount', [MainPageAdminController::class, 'computersCount']);
    Route::get('/reportscount', [MainPageAdminController::class, 'reportsCount']);
    Route::get('/identifierscount', [MainPageAdminController::class, 'identifiersCount']);

    Route::get('/view', [ViewController::class, 'getFiles']);
    Route::delete('/view', [ViewController::class, 'destroy']);
    Route::post('/upload', [UploadController::class, 'store']);
    Route::get('/download', [ViewController::class, 'getFiles']);
    Route::get('/download-report', [DownloadController::class, 'download']);
    Route::get('/comparison', [CompareReportsController::class, 'compareReports']);

    Route::get('/createadmin', [AuthController::class, 'getUsers']);
    Route::post('/createadmin', [AuthController::class, 'register']);
    Route::delete('/deleteadmin/{id}', [AuthController::class, 'destroy']);

    Route::get('/getComputersIdentifiers', [SelectFieldController::class, 'getComputersIdentifiers']);
    Route::get('/getReportsByComputer', [SelectFieldController::class, 'getReportsByComputer']);

    Route::get('/view/vulnerabilities', [ViewController::class, 'getVulnerabilities']);

});

Route::prefix('logs')->middleware('jwt.auth')->group(function () {
    Route::get('/date-ranges', [LogController::class, 'getAvailableDateRanges']);
    Route::get('/by-date', [LogController::class, 'getLogsByDateRanges']);
    Route::post('/send', [LogController::class, 'sendLog']);
});

Route::prefix('auth')->group(function () {
    Route::middleware('jwt.auth')->group(function () {
        // Route::get('/check', [AuthController::class, 'checkAuth']);
        Route::get('/logout', [AuthController::class, 'logout']);
    });
    Route::post('/login', [AuthController::class, 'login']);
});


// require __DIR__.'/auth.php';