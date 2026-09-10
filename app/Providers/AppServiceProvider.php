<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Schema\Blueprint;
use Symfony\Component\Mailer\Transport\Smtp\SmtpTransport;
use Symfony\Component\Mailer\Transport\Smtp\Stream\SocketStream;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
            if (!empty($_SERVER['HTTP_X_AUTHORIZATION'])) {
                $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_X_AUTHORIZATION'];
            } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } elseif (!empty($_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'])) {
                $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'];
            }
        }
        if (function_exists('request') && request() && !request()->headers->has('Authorization') && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
            request()->headers->set('Authorization', $_SERVER['HTTP_AUTHORIZATION']);
        }

        if ($this->app->environment('production') || request()->isSecure() || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') || str_starts_with(config('app.url'), 'https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);
        $this->relaxLocalMailSslVerification();
    }

    /**
     * Auto-add deleted_at to all master tables so soft deletes work
     * without needing to manually run php artisan migrate.
     */
    private function ensureSoftDeleteColumns(): void
    {
        $tables = [
            'categories',
            'sub_categories',
            'id_types',
            'sub_names',
            'bio_data',
        ];

        try {
            foreach ($tables as $table) {
                if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                    Schema::table($table, function (Blueprint $t) {
                        $t->softDeletes();
                    });
                }
            }
        } catch (\Throwable $e) {
            // Silently skip if DB not available during boot
        }
    }

    /**
     * Local XAMPP/Windows PHP + some of GoDaddy's SMTP backend nodes
     * (smtpout.secureserver.net is load-balanced across many servers)
     * fail strict TLS certificate-chain verification even with a fresh
     * CA bundle installed — the specific backend node doesn't send its
     * full intermediate chain. Laravel's declarative
     * config('mail.mailers.smtp.stream') option was not reliably being
     * picked up here, so this mutates the live Symfony transport
     * directly right after Laravel builds it.
     *
     * `local` environment ONLY. Production (cPanel/Linux hosting) keeps
     * full certificate verification — this must never run there.
     */
    private function relaxLocalMailSslVerification(): void
    {
        if (!$this->app->environment('local')) {
            return;
        }

        if (config('mail.default') !== 'smtp') {
            return;
        }

        try {
            $transport = Mail::mailer('smtp')->getSymfonyTransport();

            if ($transport instanceof SmtpTransport) {
                $stream = $transport->getStream();

                if ($stream instanceof SocketStream) {
                    $stream->setStreamOptions(array_replace_recursive(
                        $stream->getStreamOptions(),
                        [
                            'ssl' => [
                                'verify_peer' => false,
                                'verify_peer_name' => false,
                                'allow_self_signed' => true,
                            ],
                        ]
                    ));
                }
            }
        } catch (\Throwable $e) {
            // Never let a mail-transport tweak break the app boot.
        }
    }
}
