<?php

namespace App\Http\Controllers;

use App\Mail\ApprovalRequestMail;
use App\Mail\RequestReceivedMail;
use App\Models\User;
use App\Models\UserApprovalRequest;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->merge([
            'name'  => is_string($request->name) ? trim($request->name) : $request->name,
            'email' => is_string($request->email) ? strtolower(trim($request->email)) : $request->email,
        ]);

        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role'     => 'required|string|in:admin,studio_owner,user,super_admin',
        ]);

        if (!config('services.approval.required')) {
            $user = User::create([
                'name'              => $request->name,
                'email'             => $request->email,
                'password'          => Hash::make($request->password),
                'role'              => $request->role,
                'email_verified_at' => now(),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'user'    => $user,
                'token'   => $token,
            ], 201);
        }
        $existingPending = UserApprovalRequest::where('email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existingPending && !$existingPending->isExpired()) {
            return response()->json([
                'success' => true,
                'pending' => true,
                'id'      => $existingPending->id,
                'message' => 'A request for this email is already waiting for approval. Please wait for the MD to approve or reject it.',
            ], 200);
        }

        $approvalRequest = UserApprovalRequest::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => $request->role,
            'status'         => 'pending',
            'approval_token' => Str::random(64),
            'expires_at'     => now()->addHours(24),
        ]);

        $this->notifyApprover($approvalRequest);

        // Best-effort confirmation to the requester that their request
        // was received — separate from notifyApprover(), which only
        // emails/WhatsApps the MD. Never blocks registration on failure.
        try {
            Mail::to($approvalRequest->email)->send(new RequestReceivedMail($approvalRequest));
        } catch (\Exception $e) {
            Log::error('Request-received email failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'pending' => true,
            'id'      => $approvalRequest->id,
            'message' => 'Your account request has been sent for approval. You will be able to sign in once the MD approves it.',
        ], 201);
    }

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

    private function notifyApprover(UserApprovalRequest $approvalRequest): void
    {
        $reviewUrl = url("/approvals/{$approvalRequest->approval_token}");

        $approverEmail = config('services.approver.email');
        $approverPhone = config('services.approver.whatsapp');

        if ($approverEmail) {
            try {
                Mail::to($approverEmail)->send(new ApprovalRequestMail($approvalRequest, $reviewUrl));
            } catch (\Exception $e) {
                Log::error('Approval request email failed: ' . $e->getMessage());
            }
        }

        if ($approverPhone) {
            try {
                $roleLabel = ucwords(str_replace('_', ' ', $approvalRequest->role));
                $message = "🔔 *New {$roleLabel} account request — WhiteNode ERP*\n\n"
                    . "Name: {$approvalRequest->name}\n"
                    . "Email: {$approvalRequest->email}\n"
                    . "Role: {$roleLabel}\n\n"
                    . "Review & decide: {$reviewUrl}\n\n"
                    . "This link expires in 24 hours.";
                app(WhatsAppService::class)->sendText($approverPhone, $message);
            } catch (\Exception $e) {
                Log::error('Approval request WhatsApp send failed: ' . $e->getMessage());
            }
        }
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
