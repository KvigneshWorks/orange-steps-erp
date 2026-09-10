<?php

namespace App\Http\Controllers;

use App\Mail\ApprovalGrantedMail;
use App\Mail\ApprovalRejectedMail;
use App\Models\User;
use App\Models\UserApprovalRequest;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Handles both approval surfaces:
 *  - Public, token-based (clicked from the email/WhatsApp notification —
 *    no login required, the 64-char token IS the credential).
 *  - Authenticated, super_admin-only JSON API for the in-app
 *    "Pending Approvals" screen.
 */
class ApprovalController extends Controller
{
    // ── Public, token-based (web routes) ──────────────────────────────

    /** GET /approvals/{token} — read-only review page, no side effects. */
    public function show(string $token)
    {
        $approvalRequest = UserApprovalRequest::where('approval_token', $token)->first();

        return view('approvals.result', [
            'mode'   => 'review',
            'req'    => $approvalRequest,
            'expired' => $approvalRequest && $approvalRequest->isExpired() && $approvalRequest->isPending(),
        ]);
    }

    /** POST /approvals/{token}/approve — creates the real user. */
    public function approve(string $token)
    {
        $approvalRequest = UserApprovalRequest::where('approval_token', $token)->first();

        if (!$approvalRequest || !$approvalRequest->isPending()) {
            return view('approvals.result', ['mode' => 'already-decided', 'req' => $approvalRequest]);
        }

        if ($approvalRequest->isExpired()) {
            return view('approvals.result', ['mode' => 'expired', 'req' => $approvalRequest]);
        }

        $this->createUserFromRequest($approvalRequest, 'MD (email/WhatsApp link)');

        return view('approvals.result', ['mode' => 'approved', 'req' => $approvalRequest]);
    }

    /** POST /approvals/{token}/reject */
    public function reject(string $token, Request $request)
    {
        $approvalRequest = UserApprovalRequest::where('approval_token', $token)->first();

        if (!$approvalRequest || !$approvalRequest->isPending()) {
            return view('approvals.result', ['mode' => 'already-decided', 'req' => $approvalRequest]);
        }

        $this->rejectRequest(
            $approvalRequest,
            'MD (email/WhatsApp link)',
            $request->string('reason')->trim()->value() ?: null,
        );

        return view('approvals.result', ['mode' => 'rejected', 'req' => $approvalRequest]);
    }

    // ── Authenticated JSON API (in-app "Pending Approvals" screen) ────

    /** GET /api/approval-requests?status=pending|approved|rejected|all */
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $query = UserApprovalRequest::query()->orderByDesc('created_at');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        return response()->json([
            'success' => true,
            'data'    => $query->get(),
        ]);
    }

    /** POST /api/approval-requests/{id}/approve */
    public function approveApi(Request $request, int $id)
    {
        $approvalRequest = UserApprovalRequest::findOrFail($id);

        if (!$approvalRequest->isPending()) {
            return response()->json(['success' => false, 'message' => 'This request has already been decided.'], 409);
        }

        if ($approvalRequest->isExpired()) {
            return response()->json(['success' => false, 'message' => 'This request has expired.'], 410);
        }

        $approverName = $request->user()->name ?? 'MD';
        $this->createUserFromRequest($approvalRequest, $approverName);

        return response()->json(['success' => true, 'message' => "{$approvalRequest->name} approved and account created."]);
    }

    /** POST /api/approval-requests/{id}/reject  { reason?: string } */
    public function rejectApi(Request $request, int $id)
    {
        $approvalRequest = UserApprovalRequest::findOrFail($id);

        if (!$approvalRequest->isPending()) {
            return response()->json(['success' => false, 'message' => 'This request has already been decided.'], 409);
        }

        $approverName = $request->user()->name ?? 'MD';

        $this->rejectRequest(
            $approvalRequest,
            $approverName,
            $request->string('reason')->trim()->value() ?: null,
        );

        return response()->json(['success' => true, 'message' => "{$approvalRequest->name}'s request was rejected."]);
    }

    // ── Shared ─────────────────────────────────────────────────────────

    private function createUserFromRequest(UserApprovalRequest $approvalRequest, string $decidedBy): void
    {
        // Direct DB insert (not User::create()) — the password on the
        // pending request is already bcrypt-hashed from registration time,
        // and this sidesteps any ambiguity around Eloquent's 'hashed' cast
        // re-hashing an already-hashed value.
        $userId = DB::table('users')->insertGetId([
            'name'              => $approvalRequest->name,
            'email'             => $approvalRequest->email,
            'password'          => $approvalRequest->password,
            'role'              => $approvalRequest->role,
            'email_verified_at' => now(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        $approvalRequest->update([
            'status'     => 'approved',
            'decided_at' => now(),
            'decided_by' => $decidedBy,
        ]);

        // Best-effort heads-up to the requester that they can now log in —
        // only if they gave a phone number (not collected by the current
        // register form, so this is a no-op today; kept for when it is).
        if ($approvalRequest->phone) {
            try {
                app(WhatsAppService::class)->sendText(
                    $approvalRequest->phone,
                    "✅ Your WhiteNode ERP account has been approved! You can now sign in with {$approvalRequest->email}."
                );
            } catch (\Exception $e) {
                // Non-fatal — the account already exists either way.
            }
        }

        // Email confirmation to the requester — the account already exists
        // by this point regardless of whether this send succeeds.
        try {
            $loginUrl = rtrim(config('services.frontend.url'), '/') . '/login';
            Mail::to($approvalRequest->email)->send(new ApprovalGrantedMail($approvalRequest, $loginUrl));
        } catch (\Exception $e) {
            Log::error('Approval-granted email failed: ' . $e->getMessage());
        }
    }

    /**
     * Shared by both reject surfaces (token-based and in-app API): marks
     * the request rejected and best-effort emails the requester. The
     * account never existed for a rejected request, so there's nothing
     * else to undo here.
     */
    private function rejectRequest(UserApprovalRequest $approvalRequest, string $decidedBy, ?string $reason): void
    {
        $approvalRequest->update([
            'status'        => 'rejected',
            'decided_at'    => now(),
            'decided_by'    => $decidedBy,
            'reject_reason' => $reason,
        ]);

        try {
            Mail::to($approvalRequest->email)->send(new ApprovalRejectedMail($approvalRequest));
        } catch (\Exception $e) {
            Log::error('Approval-rejected email failed: ' . $e->getMessage());
        }
    }
}
