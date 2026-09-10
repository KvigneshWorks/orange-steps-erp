<?php

use App\Http\Controllers\ApprovalController;
use Illuminate\Support\Facades\Route;

// ── Account approval flow ── clicked from the emailed/WhatsApp'd
//    notification, no login required (the 64-char token in the URL IS the
//    credential). GET only shows the review page — Approve/Reject are
//    separate POSTs so a link-preview/prefetch bot opening the email can
//    never silently decide the request just by loading the URL.
Route::get('/approvals/{token}',          [ApprovalController::class, 'show']);
Route::post('/approvals/{token}/approve', [ApprovalController::class, 'approve']);
Route::post('/approvals/{token}/reject',  [ApprovalController::class, 'reject']);

Route::get('/', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }

    return response()->json([
        'message' => 'WhiteNode Software Solutions API is running, but React build is missing in public/index.html'
    ]);
});

Route::fallback(function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }

    return response()->json([
        'error' => 'Not Found',
        'message' => 'Route not found.'
    ], 404);
});
