<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Create an account from inside the app (Account Settings module).
     * Reachable only by an authenticated admin/super_admin (see the
     * role:admin-gated /auth/register route) — there is no public
     * self-registration anymore.
     *
     * - super_admin: creates an Admin or User account directly. Active
     *   immediately, no approval needed.
     * - admin: can only create a User account. The role field is ignored
     *   and forced to 'user'. It always lands in the pending queue for
     *   Super Admin approval (UserApprovalRequest) rather than being
     *   created directly.
     */
    public function register(Request $request)
    {
        $request->merge([
            'name'  => is_string($request->name) ? trim($request->name) : $request->name,
            'email' => is_string($request->email) ? strtolower(trim($request->email)) : $request->email,
        ]);

        $callerRole = $request->user()->role ?? '';

        if ($callerRole === 'super_admin') {
            $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users',
                'password' => ['required', 'confirmed', Password::defaults()],
                'role'     => 'required|string|in:admin,user',
            ]);

            $user = User::create([
                'name'              => $request->name,
                'email'             => $request->email,
                'password'          => Hash::make($request->password),
                'role'              => $request->role,
                'email_verified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'pending' => false,
                'message' => "{$user->name}'s account has been created and can sign in now.",
                'user'    => $user,
            ], 201);
        }

        // Only 'admin' can otherwise reach this route (enforced by the
        // route's role:admin middleware). Role is always forced to 'user'
        // regardless of what's submitted.
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $existingPending = UserApprovalRequest::where('email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existingPending && !$existingPending->isExpired()) {
            return response()->json([
                'success' => true,
                'pending' => true,
                'id'      => $existingPending->id,
                'message' => 'A request for this email is already waiting for Super Admin approval.',
            ], 200);
        }

        $approvalRequest = UserApprovalRequest::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => 'user',
            'status'         => 'pending',
            'approval_token' => Str::random(64),
            'expires_at'     => now()->addHours(24),
        ]);

        // No email/WhatsApp notification — it simply shows up in the Super
        // Admin's Pending Approvals screen.

        return response()->json([
            'success' => true,
            'pending' => true,
            'id'      => $approvalRequest->id,
            'message' => "{$approvalRequest->name}'s account request has been sent to the Super Admin for approval.",
        ], 201);
    }

    /**
     * Lets an admin check the status of a request they submitted
     * (not currently polled by the frontend, kept for future use /
     * the Super Admin's Pending Approvals screen).
     */
    public function registrationStatus(int $id)
    {
        $approvalRequest = UserApprovalRequest::find($id);

        if (!$approvalRequest) {
            return response()->json(['success' => false, 'status' => 'not_found'], 404);
        }

        $status = $approvalRequest->status;
        if ($status === 'pending' && $approvalRequest->isExpired()) {
            $status = 'expired';
        }

        return response()->json([
            'success'        => true,
            'status'         => $status,
            'name'           => $approvalRequest->name,
            'role'           => $approvalRequest->role,
            'reject_reason'  => $status === 'rejected' ? $approvalRequest->reject_reason : null,
        ]);
    }

    /**
     * "All Accounts" tab in Account Settings — super_admin only (see the
     * bare role:-gated /users route). Read-only list, no edit/deactivate
     * actions yet.
     */
    public function listAllUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    /**
     * Login user and return token
     */
    public function login(Request $request)
    {

        $request->merge([
            'email' => is_string($request->email) ? strtolower(trim($request->email)) : $request->email,
        ]);

        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::whereRaw('LOWER(TRIM(email)) = ?', [$request->email])->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $pending = UserApprovalRequest::where('email', $request->email)
                ->where('status', 'pending')
                ->first();

            if ($pending && !$pending->isExpired()) {
                return response()->json([
                    'success' => false,
                    'pending' => true,
                    'message' => 'Your account is still waiting for the MD\'s approval.',
                ], 403);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * Logout user (revoke current token)
     */

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user'    => $request->user(),
        ]);
    }

    /**
     * Change the authenticated user's own password. Available to every
     * role (admin, user, super_admin) — no role middleware, since anyone
     * should be able to update their own credentials.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'      => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'New password must be different from your current password',
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }
}
