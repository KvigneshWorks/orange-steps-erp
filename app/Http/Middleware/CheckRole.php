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
 * 'super_admin' is always treated as full-access and bypasses this check
 * entirely (mirrors the frontend's getNav() logic in Dashboard.tsx, where
 * super_admin always sees every page). The legacy 'studio_owner' role has
 * been merged into 'super_admin' and no longer exists.
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

        // Full-access role always passes, regardless of the roles listed
        // for this route.
        if ($role === 'super_admin') {
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
