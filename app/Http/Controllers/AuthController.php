<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
     * Edit an existing account (Super Admin only — "All Accounts" tab).
     * Name, email and role are all editable here. Guards against demoting
     * the very last remaining Super Admin away from that role, which
     * would leave nobody able to manage accounts at all.
     */
    public function updateUser(Request $request, $id)
    {
        $target = User::findOrFail($id);

        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $target->id,
            'role'  => 'required|in:super_admin,admin,user',
        ]);

        if ($target->role === 'super_admin' && $request->role !== 'super_admin') {
            $otherSuperAdmins = User::where('role', 'super_admin')->where('id', '!=', $target->id)->count();
            if ($otherSuperAdmins === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot change this account\'s role — it is the last remaining Super Admin.',
                ], 422);
            }
        }

        $target->name  = trim($request->name);
        $target->email = strtolower(trim($request->email));
        $target->role  = $request->role;
        $target->save();

        return response()->json([
            'success' => true,
            'message' => 'Account updated successfully',
            'data'    => $target->only(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }

    /**
     * Permanently delete an account (Super Admin only — "All Accounts"
     * tab). This is a genuine hard delete from the users table — the
     * User model has no SoftDeletes trait/column — not the app's usual
     * move-to-Recycle-Bin pattern used elsewhere, per explicit request
     * to remove the account fully from the database.
     *
     * Guards, in order:
     *  1. Can't delete your own logged-in account (would lock you out
     *     mid-session).
     *  2. Can't delete the last remaining Super Admin (would lock
     *     everyone out of account management).
     *  3. Can't delete an account that has ever created real business
     *     records. `projects.user_id` and `cad_revisions.user_id` are
     *     onDelete('cascade') in this schema — deleting through those
     *     would silently wipe that user's projects/CAD revisions, so
     *     they're checked and blocked explicitly rather than letting the
     *     cascade run. clients/client_projects/client_payments/workers/
     *     attendance_records/worker_payments .created_by are
     *     onDelete('restrict') — checked the same way here for a clean
     *     message instead of a raw SQL foreign-key error. Every other
     *     created_by/added_by/inspector_id/deleted_by column on this
     *     table across the schema is onDelete('set null') and is safe to
     *     let happen automatically.
     */
    public function destroyUser(Request $request, $id)
    {
        $target = User::findOrFail($id);

        if ((int) $request->user()->id === (int) $target->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account while logged in.',
            ], 422);
        }

        if ($target->role === 'super_admin') {
            $otherSuperAdmins = User::where('role', 'super_admin')->where('id', '!=', $target->id)->count();
            if ($otherSuperAdmins === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete this account — it is the last remaining Super Admin.',
                ], 422);
            }
        }

        $blockers = [];
        if (DB::table('projects')->where('user_id', $target->id)->exists()) $blockers[] = 'projects';
        if (DB::table('cad_revisions')->where('user_id', $target->id)->exists()) $blockers[] = 'CAD revisions';
        if (DB::table('clients')->where('created_by', $target->id)->exists()) $blockers[] = 'clients';
        if (DB::table('client_projects')->where('created_by', $target->id)->exists()) $blockers[] = 'client projects';
        if (DB::table('client_payments')->where('created_by', $target->id)->exists()) $blockers[] = 'client payments';
        if (DB::table('workers')->where('created_by', $target->id)->exists()) $blockers[] = 'workers';
        if (DB::table('attendance_records')->where('created_by', $target->id)->exists()) $blockers[] = 'attendance records';
        if (DB::table('worker_payments')->where('created_by', $target->id)->exists()) $blockers[] = 'worker payments';

        if (!empty($blockers)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this account — it has created ' . implode(', ', $blockers) . '. Those records need to be reassigned or removed first.',
            ], 422);
        }

        $target->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account permanently deleted',
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
