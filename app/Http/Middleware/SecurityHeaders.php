<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds the standard hardening headers browsers use to prevent clickjacking,
 * MIME-sniffing, and cross-origin leakage. This app is a pure JSON API
 * consumed by a separate React SPA (no server-rendered HTML besides the
 * approval-link pages), so the policy here is deliberately strict.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Only sent over HTTPS responses — harmless to set unconditionally,
        // browsers ignore it on plain HTTP anyway, but this makes intent explicit.
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
