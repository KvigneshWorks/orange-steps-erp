<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function show(string $token)
    {
        $approvalRequest = UserApprovalRequest::where('approval_token', $token)->first();

        return view('approvals.result', [
            'mode'   => 'review',
            'req'    => $approvalRequest,
            'expired' => $approvalRequest && $approvalRequest->isExpired() && $approvalRequest->isPending(),
        ]);
    }

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

    private function createUserFromRequest(UserApprovalRequest $approvalRequest, string $decidedBy): void
    {
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
    }

    private function rejectRequest(UserApprovalRequest $approvalRequest, string $decidedBy, ?string $reason): void
    {
        $approvalRequest->update([
            'status'        => 'rejected',
            'decided_at'    => now(),
            'decided_by'    => $decidedBy,
            'reject_reason' => $reason,
        ]);
    }
}
