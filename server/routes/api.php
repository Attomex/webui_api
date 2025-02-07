<?php

use App\Http\Controllers\MainPageController;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\ReportController;
// use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\MainPageAdminController;
use App\Http\Controllers\SelectFieldController;
use App\Http\Controllers\ViewController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\CompareReportsController;

// Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
//     return $request->user();
// });

// Route::get('/test2', function (Request $request) {
//     $lala = $request->input('lala');

//     if($lala == 1) {
//         return response()->json(['dada' => 2]);
//     } elseif($lala == 2) {
//         return response()->json(['dada' => 4]);
//     } else {
//         return response()->json(['error' => 'Invalid value for lala'], 400);
//     }
// });

// Route::middleware('guest')->post('/register', [RegisteredUserController::class, 'store']);

// Route::middleware('guest')->post('/login', [AuthenticatedSessionController::class, 'store']);

Route::get('/cards', [MainPageController::class, 'index'])->middleware('guest');

Route::prefix('admin')->group(function () {
    Route::get('/latestbase', [MainPageAdminController::class, 'getVulnerabilityBase']);
    Route::get('/computerscount', [MainPageAdminController::class, 'computersCount']);
    Route::get('/reportscount', [MainPageAdminController::class, 'reportsCount']);

    Route::get('/view', [ViewController::class, 'getFiles']);
    Route::post('/upload', [UploadController::class, 'store']);
    Route::get('/download', [ViewController::class, 'getFiles']);
    Route::get('/comparison', [CompareReportsController::class, 'compareReports']);
    
    Route::get('/getComputersIdentifiers', [SelectFieldController::class, 'getComputersIdentifiers']);
    Route::get('/getReportsByComputer', [SelectFieldController::class, 'getReportsByComputer']);

    Route::get('/view/vulnerabilities', [ViewController::class, 'getVulnerabilities']);
    // Route::get('/auth/logout', [AuthenticatedSessionController::class, 'logout']);
});

// Route::post('/auth/login', [AuthenticatedSessionController::class, 'login']);

// require __DIR__.'/auth.php';