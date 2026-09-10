<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $instanceId;
    private string $token;
    private string $baseUrl;

    public function __construct()
    {
        $this->instanceId = config('services.whatsapp.instance_id', '');
        $this->token      = config('services.whatsapp.token', '');
        $this->baseUrl    = "https://api.green-api.com/waInstance{$this->instanceId}";
    }

    public function isConfigured(): bool
    {
        return !empty($this->instanceId) && !empty($this->token);
    }

    /**
     * Send a PDF file to a WhatsApp number.
     * $phone  — digits only, with country code. e.g. 919876543210
     * $pdf    — raw PDF bytes (string)
     */
    public function sendPDF(string $phone, string $pdf, string $fileName, string $caption = ''): bool
    {
        if (!$this->isConfigured()) {
            Log::warning('WhatsApp not configured — skipping send.');
            return false;
        }

        $chatId = preg_replace('/[^0-9]/', '', $phone) . '@c.us';

        try {
            $response = Http::timeout(60)
                ->withoutVerifying()   // fix XAMPP SSL cert issue on Windows
                ->attach('file', $pdf, $fileName, ['Content-Type' => 'application/pdf'])
                ->post("{$this->baseUrl}/sendFileByUpload/{$this->token}", [
                    'chatId'   => $chatId,
                    'fileName' => $fileName,
                    'caption'  => $caption,
                ]);

            if ($response->successful()) {
                Log::info("WhatsApp PDF sent to {$phone}: {$fileName}");
                return true;
            }

            Log::error("WhatsApp send failed [{$response->status()}]: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("WhatsApp exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a plain text message.
     */
    public function sendText(string $phone, string $message): bool
    {
        if (!$this->isConfigured()) {
            Log::warning('WhatsApp not configured — skipping send.');
            return false;
        }

        $chatId = preg_replace('/[^0-9]/', '', $phone) . '@c.us';

        try {
            $response = Http::timeout(30)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/sendMessage/{$this->token}", [
                    'chatId'  => $chatId,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                Log::info("WhatsApp text sent to {$phone}.");
                return true;
            }

            // Was previously silent on failure — logged nowhere, so a bad
            // instance ID/token/phone format looked identical to "sent OK"
            // from the outside. Now it shows up in laravel.log.
            Log::error("WhatsApp text send failed [{$response->status()}] to {$phone}: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("WhatsApp text exception: " . $e->getMessage());
            return false;
        }
    }
}
