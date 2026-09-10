<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role gate for API routes.
 *
 * Usage: ->middleware('role:admin,super_admin')
 *
 * 'super_admin' and 'studio_owner' are always treated as full-access and
 * bypass this check entirely (mirrors the frontend's getNav() logic in
 * Dashboard.tsx, where super_admin/studio_owner always see every page).
 * Everyone else must have a role explicitly listed in the middleware
 * parameters for the route to be reachable.
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $role = $user->role ?? '';

        // Full-access roles always pass, regardless of the roles listed
        // for this route.
        if (in_array($role, ['super_admin', 'studio_owner'], true)) {
            return $next($request);
        }

        if (!in_array($role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
