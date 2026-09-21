<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoCacheHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
        // LiteSpeed's own page/object cache (LSCache -- common on cPanel
        // hosting) can still serve a cached copy of an API response even
        // when the standard Cache-Control header says not to cache it. This
        // header explicitly tells LSCache to skip caching for this response.
        $response->headers->set('X-LiteSpeed-Cache-Control', 'no-cache');
        // CDN/edge caches (Cloudflare, Fastly, Varnish-style layers) look at
        // Surrogate-Control specifically, separate from the Cache-Control
        // the browser sees -- set both so no layer in the chain caches this.
        $response->headers->set('Surrogate-Control', 'no-store');

        return $response;
    }
}
