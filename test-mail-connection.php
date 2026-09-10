<?php
// Standalone SMTP/SSL connectivity test — bypasses Laravel entirely.
// Run: php test-mail-connection.php

$host = 'smtpout.secureserver.net';
$ports = [465, 587];

foreach ($ports as $port) {
    echo "\n=== Testing {$host}:{$port} ===\n";

    // Test 1: with certificate verification ON (default)
    $context1 = stream_context_create([
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);
    $errno = 0; $errstr = '';
    $stream = @stream_socket_client(
        "ssl://{$host}:{$port}",
        $errno, $errstr, 10,
        STREAM_CLIENT_CONNECT,
        $context1
    );
    if ($stream) {
        echo "[verify ON]  SUCCESS — banner: " . trim(fgets($stream, 512)) . "\n";
        fclose($stream);
    } else {
        echo "[verify ON]  FAILED — [$errno] $errstr\n";
    }

    // Test 2: with certificate verification OFF
    $context2 = stream_context_create([
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ]);
    $errno = 0; $errstr = '';
    $stream = @stream_socket_client(
        "ssl://{$host}:{$port}",
        $errno, $errstr, 10,
        STREAM_CLIENT_CONNECT,
        $context2
    );
    if ($stream) {
        echo "[verify OFF] SUCCESS — banner: " . trim(fgets($stream, 512)) . "\n";
        fclose($stream);
    } else {
        echo "[verify OFF] FAILED — [$errno] $errstr\n";
    }
}

echo "\n=== OpenSSL / cURL info ===\n";
echo "OPENSSL_VERSION_TEXT: " . (defined('OPENSSL_VERSION_TEXT') ? OPENSSL_VERSION_TEXT : 'n/a') . "\n";
echo "php.ini in use: " . php_ini_loaded_file() . "\n";
echo "curl.cainfo: " . ini_get('curl.cainfo') . "\n";
echo "openssl.cafile: " . ini_get('openssl.cafile') . "\n";
echo "cafile exists & size: ";
$cafile = ini_get('openssl.cafile');
if ($cafile && file_exists($cafile)) {
    echo filesize($cafile) . " bytes\n";
} else {
    echo "NOT FOUND at that path\n";
}
