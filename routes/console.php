<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Auto-generate weekly labour payment bill every Saturday at 12:00 PM
// Every Saturday at 12:00 PM  (cron: minute hour day month weekday)
Schedule::command('labour:generate-weekly-bill')
    ->cron('0 12 * * 6')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/labour-bill.log'));
