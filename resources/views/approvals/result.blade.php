<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Approval Request — WhiteNode ERP</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    padding:24px;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
    background:
      radial-gradient(620px 420px at 85% -6%, rgba(59,130,246,0.20), transparent 60%),
      radial-gradient(560px 460px at -8% 18%, rgba(30,64,175,0.22), transparent 60%),
      radial-gradient(680px 520px at 92% 98%, rgba(216,169,78,0.14), transparent 60%),
      linear-gradient(160deg, #050912 0%, #0A1530 42%, #0D2148 78%, #0A1830 100%);
    color:#F6F0E4;
  }
  .card {
    width:100%; max-width:480px;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(246,240,228,0.12);
    border-radius:16px;
    padding:38px 34px 32px;
    box-shadow:0 30px 70px rgba(0,0,0,0.45);
  }
  .eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 14px; border-radius:100px;
    background:rgba(216,169,78,0.10); border:1px solid rgba(216,169,78,0.4);
    font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
    color:#E8C97C; margin-bottom:18px;
  }
  h1 { font-size:22px; font-weight:800; color:#FAF6EC; margin-bottom:8px; letter-spacing:-0.3px; }
  p.sub { font-size:14px; color:#B7C0D6; line-height:1.6; margin-bottom:22px; }
  .row { display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px solid rgba(246,240,228,0.08); font-size:13.5px; }
  .row:last-child { border-bottom:none; }
  .row .k { color:#8296C2; }
  .row .v { color:#F0EADD; font-weight:600; text-align:right; }
  .role-badge {
    display:inline-block; padding:3px 10px; border-radius:6px;
    background:rgba(216,169,78,0.12); border:1px solid rgba(216,169,78,0.35);
    color:#E8C97C; font-size:12px; font-weight:700;
  }
  .warn {
    margin-top:16px; padding:12px 14px; border-radius:10px;
    background:rgba(232,182,91,0.08); border:1px solid rgba(232,182,91,0.3);
    color:#E4B65B; font-size:12.5px; line-height:1.6;
  }
  .actions { display:flex; gap:12px; margin-top:26px; }
  form { flex:1; }
  button {
    width:100%; padding:13px 0; border-radius:10px; border:none; cursor:pointer;
    font-size:14px; font-weight:700; font-family:inherit;
    transition:transform 0.15s ease, opacity 0.15s ease;
  }
  button:active { transform:scale(0.97); }
  .btn-approve { background:linear-gradient(135deg,#E8C97C,#D8A94E); color:#0A1530; }
  .btn-reject { background:rgba(217,59,85,0.10); border:1.5px solid rgba(217,59,85,0.4); color:#F0899A; }
  .reason-field {
    width:100%; margin-top:10px; padding:9px 11px; border-radius:8px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(246,240,228,0.14);
    color:#F0EADD; font-size:12.5px; font-family:inherit; resize:vertical; min-height:44px;
  }
  .status-icon {
    width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    margin-bottom:18px;
  }
  .expiry-note { margin-top:18px; font-size:11.5px; color:#7C89A8; text-align:center; }
</style>
</head>
<body>
<div class="card">

@if($mode === 'review' && $req && $req->isPending() && !$expired)
  <div class="eyebrow">Approval Needed</div>
  <h1>New {{ ucwords(str_replace('_',' ', $req->role)) }} request</h1>
  <p class="sub">Review the details below, then approve or reject.</p>

  <div class="row"><span class="k">Name</span><span class="v">{{ $req->name }}</span></div>
  <div class="row"><span class="k">Email</span><span class="v">{{ $req->email }}</span></div>
  <div class="row"><span class="k">Role</span><span class="v"><span class="role-badge">{{ ucwords(str_replace('_',' ', $req->role)) }}</span></span></div>
  <div class="row"><span class="k">Requested</span><span class="v">{{ $req->created_at->format('d M Y, h:i A') }}</span></div>

  @if($req->role === 'super_admin')
  <div class="warn">⚠️ Super Admin gets full access to every screen and every record in the ERP. Only approve this if you recognize the request.</div>
  @endif

  <div class="actions">
    <form method="POST" action="{{ url('/approvals/'.$req->approval_token.'/approve') }}">
      @csrf
      <button type="submit" class="btn-approve">✓ Approve</button>
    </form>
    <form method="POST" action="{{ url('/approvals/'.$req->approval_token.'/reject') }}">
      @csrf
      <textarea name="reason" class="reason-field" placeholder="Reason (optional)…"></textarea>
      <button type="submit" class="btn-reject" style="margin-top:10px;">✕ Reject</button>
    </form>
  </div>
  <div class="expiry-note">Expires {{ $req->expires_at->format('d M Y, h:i A') }}</div>

@elseif($mode === 'approved')
  <div class="eyebrow" style="background:rgba(52,211,153,0.1); border-color:rgba(52,211,153,0.4); color:#6EE7B7;">Approved</div>
  <h1>{{ $req->name }} is now a {{ ucwords(str_replace('_',' ', $req->role)) }}</h1>
  <p class="sub">Their account has been created. They can sign in now with {{ $req->email }}.</p>

@elseif($mode === 'rejected')
  <div class="eyebrow" style="background:rgba(217,59,85,0.1); border-color:rgba(217,59,85,0.4); color:#F0899A;">Rejected</div>
  <h1>Request rejected</h1>
  <p class="sub">{{ $req->name }}'s request for {{ ucwords(str_replace('_',' ', $req->role)) }} access was rejected. No account was created.</p>

@elseif($mode === 'expired' || $expired)
  <div class="eyebrow" style="background:rgba(217,59,85,0.1); border-color:rgba(217,59,85,0.4); color:#F0899A;">Link Expired</div>
  <h1>This request has expired</h1>
  <p class="sub">Approval links are valid for 24 hours. Ask {{ $req->name ?? 'the requester' }} to submit the registration form again.</p>

@elseif($mode === 'already-decided' && $req)
  <div class="eyebrow">Already {{ ucfirst($req->status) }}</div>
  <h1>This request was already {{ $req->status }}</h1>
  <p class="sub">
    {{ $req->name }}'s request was {{ $req->status }} on {{ optional($req->decided_at)->format('d M Y, h:i A') }}
    @if($req->decided_by) by {{ $req->decided_by }} @endif.
  </p>

@else
  <div class="eyebrow" style="background:rgba(217,59,85,0.1); border-color:rgba(217,59,85,0.4); color:#F0899A;">Not Found</div>
  <h1>Invalid or unknown link</h1>
  <p class="sub">This approval link doesn't match any request. It may have been mistyped or already used.</p>
@endif

</div>
</body>
</html>
