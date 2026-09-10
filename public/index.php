<?php

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED);

// Fix Authorization header stripped by Apache / FastCGI / PHP-FPM in cPanel
if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
    if (!empty($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_X_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        foreach ($requestHeaders as $headerKey => $headerVal) {
            $lowerKey = strtolower($headerKey);
            if ($lowerKey === 'authorization' || $lowerKey === 'x-authorization') {
                $_SERVER['HTTP_AUTHORIZATION'] = $headerVal;
                break;
            }
        }
    }
}

// Fix subdirectory internal rewrites (Option B) for cPanel
if (isset($_SERVER['SCRIPT_NAME']) && str_contains($_SERVER['SCRIPT_NAME'], '/public/index.php')) {
    if (isset($_SERVER['REQUEST_URI']) && !str_contains($_SERVER['REQUEST_URI'], '/public/')) {
        $_SERVER['SCRIPT_NAME'] = str_replace('/public/index.php', '/index.php', $_SERVER['SCRIPT_NAME']);
        $_SERVER['PHP_SELF'] = str_replace('/public/index.php', '/index.php', $_SERVER['PHP_SELF']);
    }
}

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
