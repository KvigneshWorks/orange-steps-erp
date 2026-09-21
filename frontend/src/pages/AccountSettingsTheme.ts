/**
 * Shared premium styling for the whole Account Settings module — Create
 * Account, Pending Approvals, All Accounts, Roles & Permissions. Import
 * `AS_CSS` in every one of those pages (alongside the app-wide `ERP_CSS`)
 * so they render with identical fonts, sizes, spacing and motion instead
 * of drifting apart page by page.
 *
 * Scope is deliberately limited to these 4 pages — nothing here touches
 * shared components (StatCard, Badge, …) or the global ERP_CSS, so the
 * rest of the app is untouched.
 */
export const AS_CSS = `
@keyframes as-card-in {
  0%   { opacity:0; transform:perspective(800px) rotateX(-24deg) translateY(12px) scale(.95); }
  60%  { opacity:1; transform:perspective(800px) rotateX(3deg) translateY(-2px) scale(1.012); }
  100% { opacity:1; transform:perspective(800px) rotateX(0) translateY(0) scale(1); }
}
@keyframes as-chip-pop  { 0% { opacity:0; transform:scale(.7); } 100% { opacity:1; transform:scale(1); } }
@keyframes as-pulse     { 0%,100% { opacity:1; } 50% { opacity:.45; } }
@keyframes as-flash-ok  { 0% { background:rgba(30,156,106,0); } 30% { background:rgba(30,156,106,.14); } 100% { background:rgba(30,156,106,0); } }
@keyframes as-flash-bad { 0% { background:rgba(217,59,85,0); } 30% { background:rgba(217,59,85,.14); } 100% { background:rgba(217,59,85,0); } }
@keyframes as-spin      { to { transform:rotate(360deg); } }
@keyframes as-ring      { 0% { box-shadow:0 0 0 0 rgba(194,65,12,.35); } 100% { box-shadow:0 0 0 10px rgba(194,65,12,0); } }

/* ── Stat tiles: identical animated entrance + hover-lift everywhere ──
   Use directly (className="ERP-stat AS-stat") on a hand-rolled tile, or
   wrap a <StatCard> grid in "AS-stat-grid" — either way every Account
   Settings stat tile moves the same way. */
.AS-stat,
.AS-stat-grid > .ERP-stat {
  position:relative; overflow:hidden;
  animation:as-card-in .5s cubic-bezier(.22,1,.36,1) both;
  transition:transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease;
}
.AS-stat:hover,
.AS-stat-grid > .ERP-stat:hover { transform:translateY(-3px); box-shadow:0 18px 36px -12px rgba(15,23,42,.20); }
.AS-stat:nth-child(1), .AS-stat-grid > .ERP-stat:nth-child(1) { animation-delay:.02s }
.AS-stat:nth-child(2), .AS-stat-grid > .ERP-stat:nth-child(2) { animation-delay:.07s }
.AS-stat:nth-child(3), .AS-stat-grid > .ERP-stat:nth-child(3) { animation-delay:.12s }
.AS-stat:nth-child(4), .AS-stat-grid > .ERP-stat:nth-child(4) { animation-delay:.17s }
.AS-stat-top { position:absolute; top:0; left:0; right:0; height:3px; background:var(--as-c, var(--ember)); }
.AS-stat-ic  { width:26px; height:26px; border-radius:8px; background:var(--as-bg); border:1px solid var(--as-bd); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }

/* ── Filter chips (status / role) ── */
.AS-chip {
  padding:5px 14px; border-radius:100px; cursor:pointer; font-family:var(--font-mono);
  font-size:9.5px; font-weight:700; transition:transform .16s ease, box-shadow .16s ease, background .16s, border-color .16s, color .16s;
  animation:as-chip-pop .3s ease both;
}
.AS-chip:hover { transform:translateY(-2px); box-shadow:0 6px 14px rgba(15,23,42,.10); }
.AS-chip:active { transform:translateY(0) scale(.96); }

/* ── Status pills (pending / approved / rejected / expired) ── */
.AS-pill {
  display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px;
  font-family:var(--font-mono); font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; border:1px solid; white-space:nowrap;
}
.AS-pill-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
.AS-pill.pending  { background:rgba(154,52,18,.10); color:#9A3412; border-color:rgba(154,52,18,.30); }
.AS-pill.pending .AS-pill-dot { animation:as-pulse 1.6s ease-in-out infinite; }
.AS-pill.approved { background:rgba(30,156,106,.10); color:#1E9C6A; border-color:rgba(30,156,106,.28); }
.AS-pill.rejected { background:rgba(217,59,85,.10); color:#D93B55; border-color:rgba(217,59,85,.26); }
.AS-pill.expired  { background:rgba(107,93,72,.10); color:#6B5D48; border-color:rgba(107,93,72,.26); }
.AS-pill.active   { background:rgba(194,65,12,.10); color:var(--ember); border-color:rgba(194,65,12,.28); }

/* ── Role badges — used for both the "requester role" column and the
   role selector in Create Account ── */
.AS-role {
  display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:8px;
  font-size:9.5px; font-weight:800; letter-spacing:.2px; border:1px solid;
}
.AS-role.user        { background:#FDE0CB; color:#C2410C; border-color:#FBC9A8; }
.AS-role.admin       { background:#FDE0CB; color:#DB5B1F; border-color:#FBC9A8; }
.AS-role.super_admin { background:rgba(234,88,12,.09); color:#EA580C; border-color:rgba(234,88,12,.30); }

/* ── Approve / Reject action buttons — premium text-pill treatment,
   matching the All Accounts tab's Edit/Delete buttons: quiet tinted-ghost
   at rest, confident gradient-fill + lift-with-shadow on hover, a crisp
   press-scale on click, and (since these are the two buttons on the whole
   page that genuinely need the admin's attention) a soft continuous
   "needs action" ring-pulse at rest so a waiting request doesn't just
   sit there looking inert. ── */
.AS-act-cell { display:inline-flex; align-items:center; gap:7px; }
.AS-act {
  display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:8px;
  font-family:var(--font-body); font-size:9.5px; font-weight:800; letter-spacing:.045em;
  text-transform:uppercase; cursor:pointer; border:1.3px solid transparent; white-space:nowrap;
  transition:transform .16s cubic-bezier(.22,1,.36,1), box-shadow .16s ease, background .16s ease, color .16s ease, border-color .16s ease;
}
.AS-act:active:not(:disabled) { transform:scale(.93); transition-duration:.08s; }
.AS-act.approve {
  background:rgba(30,156,106,.08); color:#1E9C6A; border-color:rgba(30,156,106,.24);
  animation: as-act-pulse-ok 2.8s ease-in-out infinite;
}
.AS-act.approve:hover:not(:disabled) {
  background:linear-gradient(135deg,#1E9C6A,#22B37F); color:#faf9f7; border-color:transparent;
  transform:translateY(-1px); box-shadow:0 8px 16px -6px rgba(30,156,106,.45); animation-play-state:paused;
}
.AS-act.reject {
  background:rgba(217,59,85,.08); color:#D93B55; border-color:rgba(217,59,85,.22);
  animation: as-act-pulse-bad 2.8s ease-in-out .4s infinite;
}
.AS-act.reject:hover:not(:disabled) {
  background:linear-gradient(135deg,#9A3412,#D93B55); color:#faf9f7; border-color:transparent;
  transform:translateY(-1px); box-shadow:0 8px 16px -6px rgba(217,59,85,.4); animation-play-state:paused;
}
.AS-act:disabled { opacity:.5; cursor:not-allowed; animation:none; }
.AS-act + .AS-act { margin-left: 6px; }
@keyframes as-act-pulse-ok  { 0%,100% { box-shadow:0 0 0 0 rgba(30,156,106,0); }  50% { box-shadow:0 0 0 5px rgba(30,156,106,.16); } }
@keyframes as-act-pulse-bad { 0%,100% { box-shadow:0 0 0 0 rgba(217,59,85,0); }   50% { box-shadow:0 0 0 5px rgba(217,59,85,.14); } }

/* ── Row confirmation flash — Pending Approvals uses this so an
   approve/reject reads as a clear moment, not just a toast ── */
.AS-row-flash-ok  { animation: as-flash-ok .7s ease; }
.AS-row-flash-bad { animation: as-flash-bad .7s ease; }

/* ── Initials avatar — same circle used for the requester column in
   Pending Approvals and the name column in All Accounts ── */
.AS-avatar {
  width:32px; height:32px; border-radius:8px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-size:9.5px; font-weight:800; letter-spacing:.2px;
}

/* ── Role picker cards — Create Account's Super-Admin-only role choice ── */
.AS-role-cards { display:flex; gap:10px; flex-wrap:wrap; }
.AS-role-card {
  flex:1 1 160px; min-width:150px; display:flex; align-items:center; gap:10px;
  padding:12px 14px; border-radius:12px; border:1.5px solid var(--border);
  background:var(--white); cursor:pointer; transition:all .18s cubic-bezier(.22,1,.36,1);
}
.AS-role-card:hover { transform:translateY(-2px); box-shadow:0 10px 24px -10px rgba(15,23,42,.18); }
.AS-role-card.selected { border-color:var(--as-c,var(--ember)); background:var(--as-bg,var(--ember-ghost)); box-shadow:0 0 0 3px var(--as-ring,var(--ember-ghost)); }
.AS-role-card-ic {
  width:34px; height:34px; border-radius:9px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:var(--as-bg); border:1px solid var(--as-bd);
}
.AS-role-card-txt { display:flex; flex-direction:column; gap:1px; }
.AS-role-card-title { font-size:12px; font-weight:800; color:var(--text-1); }
.AS-role-card-sub   { font-size:9.5px; color:var(--text-4); }
.AS-role-card-check {
  margin-left:auto; width:18px; height:18px; border-radius:50%; border:1.5px solid var(--border-2);
  display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .16s;
}
.AS-role-card.selected .AS-role-card-check { border-color:var(--as-c,var(--ember)); background:var(--as-c,var(--ember)); }

/* ── Status banner — Create Account's "waiting for approval" /
   "approved" / "rejected" states, replacing a bare toast with something
   that stays on the page until the admin dismisses it. Rich version:
   pulsing icon rings, a "live" polling pill, a progress stepper, and a
   confetti burst the moment it flips to approved. ── */
@keyframes as-banner-in     { 0% { opacity:0; transform:translateY(16px) scale(.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }
@keyframes as-ring-expand   { 0% { transform:scale(.7); opacity:.55; } 100% { transform:scale(1.7); opacity:0; } }
@keyframes as-icon-pop      { 0% { transform:scale(0) rotate(-20deg); opacity:0; } 60% { transform:scale(1.15) rotate(4deg); opacity:1; } 100% { transform:scale(1) rotate(0); } }
@keyframes as-live-blink    { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(154,52,18,.5); } 50% { opacity:.5; box-shadow:0 0 0 4px rgba(154,52,18,0); } }
@keyframes as-step-glow     { 0%,100% { box-shadow:0 0 0 0 var(--as-bg,rgba(194,65,12,.35)); } 50% { box-shadow:0 0 0 6px transparent; } }
@keyframes as-line-fill     { from { transform:scaleX(0); } to { transform:scaleX(1); } }
@keyframes as-draw          { to { stroke-dashoffset:0; } }
@keyframes as-shake         { 10%,90%{transform:translateX(-1px);} 20%,80%{transform:translateX(2px);} 30%,50%,70%{transform:translateX(-4px);} 40%,60%{transform:translateX(4px);} }
@keyframes as-pill-pop      { 0% { transform:scale(.8); opacity:0; } 100% { transform:scale(1); opacity:1; } }
@keyframes as-confetti-burst{ 0% { opacity:1; transform:rotate(var(--a,0deg)) translateX(0) scale(1); } 100% { opacity:0; transform:rotate(var(--a,0deg)) translateX(64px) scale(.3); } }

.AS-banner {
  position:relative; overflow:hidden; border-radius:20px; padding:26px 26px 22px;
  background:linear-gradient(165deg, var(--white) 0%, var(--as-bg, var(--surface)) 160%);
  border:1.5px solid var(--as-bd, var(--border));
  animation:as-banner-in .5s cubic-bezier(.22,1,.36,1) both;
  box-shadow:0 1px 4px rgba(194,65,12,0.08), 0 20px 48px -20px rgba(15,23,42,.22);
}
.AS-banner::after {
  content:''; position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(circle, var(--as-c,var(--ember)) 1px, transparent 1px);
  background-size:22px 22px; opacity:.05;
}
.AS-banner-top {
  position:absolute; top:0; left:0; right:0; height:4px;
  background:linear-gradient(90deg, var(--as-c,var(--ember)), transparent, var(--as-c,var(--ember)));
  background-size:200% 100%; animation:erp-gradient-x 3s ease infinite;
}
.AS-banner-hdr { position:relative; z-index:1; display:flex; align-items:flex-start; gap:18px; }

.AS-banner-icstage { position:relative; width:56px; height:56px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.AS-banner-ring {
  position:absolute; inset:0; border-radius:50%; border:1.5px solid var(--as-c, var(--ember));
  opacity:0; animation:as-ring-expand 2.2s cubic-bezier(.2,.6,.3,1) infinite;
}
.AS-banner-ring:nth-child(2) { animation-delay:.5s; }
.AS-banner-ring:nth-child(3) { animation-delay:1s; }
.AS-banner-ic {
  position:relative; z-index:1; width:48px; height:48px; border-radius:14px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:var(--as-bg); border:1px solid var(--as-bd);
  box-shadow:0 6px 18px -6px var(--as-bd, rgba(0,0,0,.15));
}
.AS-banner-ic.pop   { animation:as-icon-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
.AS-banner-ic.shake { animation:as-shake .5s ease; }
.as-draw-path { stroke-dasharray:100; stroke-dashoffset:100; animation:as-draw .5s ease .15s forwards; }

.AS-live-pill {
  display:inline-flex; align-items:center; gap:6px; padding:3px 10px 3px 8px; border-radius:100px;
  background:rgba(154,52,18,.08); border:1px solid rgba(154,52,18,.25); color:#9A3412;
  font-family:var(--font-mono); font-size:8px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
  margin-bottom:9px;
}
.AS-live-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:as-live-blink 1.3s ease-in-out infinite; }

.AS-banner-title { position:relative; z-index:1; font-size:16px; font-weight:800; color:var(--text-1); margin-bottom:4px; letter-spacing:-.1px; }
.AS-banner-sub   { position:relative; z-index:1; font-size:12px; color:var(--text-4); line-height:1.6; max-width:56ch; }

.AS-stepper { position:relative; z-index:1; display:flex; align-items:flex-start; margin:22px 0 4px; }
.AS-step { display:flex; flex-direction:column; align-items:center; gap:6px; flex:0 0 auto; width:88px; }
.AS-step-dot {
  width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  border:2px solid var(--border-2); background:var(--white); color:var(--text-4);
  font-size:9px; font-weight:800; transition:all .3s cubic-bezier(.22,1,.36,1); flex-shrink:0;
}
.AS-step.done .AS-step-dot   { border-color:var(--as-c,var(--ember)); background:var(--as-c,var(--ember)); color:#faf9f7; }
.AS-step.active .AS-step-dot { border-color:var(--as-c,var(--ember)); color:var(--as-c,var(--ember)); animation:as-step-glow 1.6s ease-in-out infinite; }
.AS-step-label { font-size:8.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--text-4); text-align:center; }
.AS-step.done .AS-step-label, .AS-step.active .AS-step-label { color:var(--text-2); }
.AS-step-line { flex:1 1 auto; height:2px; background:var(--border); margin:10px -2px 0; position:relative; top:1px; overflow:hidden; }
.AS-step-line.done { background:var(--border); }
.AS-step-line.done::after { content:''; position:absolute; inset:0; background:var(--as-c,var(--ember)); transform-origin:left; animation:as-line-fill .5s ease both; }

.AS-banner-meta  {
  position:relative; z-index:1; margin-top:16px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  font-family:var(--font-mono); font-size:9px; color:var(--text-4);
}
.AS-banner-meta .AS-pill { animation:as-pill-pop .35s cubic-bezier(.34,1.56,.64,1) both; }
.AS-banner-actions { position:relative; z-index:1; margin-top:18px; display:flex; gap:10px; flex-wrap:wrap; }

/* ── Full-page outcome stage — Create Account swaps the whole page body
   for this the moment there's an outcome to show (waiting / approved /
   rejected / expired / active). Centered, generous whitespace, each
   piece fades up in its own beat via .AS-stage-item + inline
   animation-delay, so it reads as a dedicated status page. ── */
@keyframes as-stage-in    { 0% { opacity:0; transform:translateY(18px); } 100% { opacity:1; transform:translateY(0); } }
@keyframes as-glow-pulse2 { 0%,100% { opacity:.32; transform:scale(1); } 50% { opacity:.5; transform:scale(1.08); } }

.AS-stage {
  position:relative; min-height:58vh; display:flex; align-items:center; justify-content:center;
  padding:48px 20px 40px; overflow:hidden;
}
.AS-stage-glow {
  position:absolute; width:360px; height:360px; border-radius:50%;
  background:radial-gradient(circle, var(--as-c,var(--ember)) 0%, transparent 70%);
  opacity:.32; filter:blur(14px); animation:as-glow-pulse2 3.4s ease-in-out infinite;
  pointer-events:none;
}
.AS-stage-card { position:relative; z-index:1; max-width:520px; width:100%; display:flex; flex-direction:column; align-items:center; text-align:center; }
.AS-stage-item { animation:as-stage-in .6s cubic-bezier(.22,1,.36,1) both; }

.AS-stage-icstage { position:relative; width:84px; height:84px; display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
.AS-stage-ring { position:absolute; inset:0; border-radius:50%; border:1.5px solid var(--as-c,var(--ember)); opacity:0; animation:as-ring-expand 2.2s cubic-bezier(.2,.6,.3,1) infinite; }
.AS-stage-ring:nth-child(2) { animation-delay:.5s; }
.AS-stage-ring:nth-child(3) { animation-delay:1s; }
.AS-stage-ic {
  position:relative; z-index:1; width:72px; height:72px; border-radius:20px;
  display:flex; align-items:center; justify-content:center;
  background:var(--as-bg); border:1px solid var(--as-bd);
  box-shadow:0 10px 28px -10px var(--as-bd, rgba(0,0,0,.2));
}
.AS-stage-ic.pop   { animation:as-icon-pop .55s cubic-bezier(.34,1.56,.64,1) both; }
.AS-stage-ic.shake { animation:as-shake .5s ease; }

.AS-stage-title { font-size:22px; font-weight:800; color:var(--text-1); margin-bottom:9px; letter-spacing:-.2px; }
.AS-stage-sub   { font-size:13px; color:var(--text-4); line-height:1.7; max-width:46ch; margin:0 auto; }

.AS-stage .AS-stepper { margin:30px auto 4px; }
.AS-stage .AS-step { width:104px; }

.AS-stage-meta    { margin-top:20px; display:flex; align-items:center; gap:8px; justify-content:center; font-family:var(--font-mono); font-size:9.5px; color:var(--text-4); }
.AS-stage-meta .AS-pill { animation:as-pill-pop .35s cubic-bezier(.34,1.56,.64,1) both; }
.AS-stage-actions { margin-top:28px; }

@media (max-width:480px) {
  .AS-stage-title { font-size:19px; }
  .AS-stage .AS-step { width:80px; }
}

.AS-spinner-sm {
  width:13px; height:13px; border-radius:50%; border:2px solid currentColor; border-top-color:transparent;
  display:inline-block; animation:as-spin .7s linear infinite;
}
.AS-spinner-lg {
  width:22px; height:22px; border-radius:50%; border:2.5px solid var(--as-bd); border-top-color:var(--as-c,var(--ember));
  display:inline-block; animation:as-spin .8s linear infinite;
}

/* Positioned relative to whatever wraps it — used inside the 84px
   .AS-stage-icstage box, so each particle starts at its center (42,42)
   and bursts outward along its own rotated axis. */
.AS-confetti { position:absolute; inset:0; pointer-events:none; overflow:visible; z-index:2; }
.AS-confetti span {
  position:absolute; top:42px; left:42px; width:6px; height:6px; border-radius:2px;
  background:var(--as-c,var(--ember)); opacity:0;
  transform:rotate(var(--a,0deg)) translateX(0) scale(1);
  animation:as-confetti-burst .8s cubic-bezier(.2,.8,.3,1) both;
}

/* ── Confirm/reject modal (Pending Approvals) ── */
.AS-modal-backdrop {
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center; padding:20px;
  background:rgba(35,28,20,.44); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
.AS-modal-card {
  position:relative; width:100%; max-width:400px; padding:26px 24px 22px; border-radius:18px;
  background:var(--white); overflow:hidden;
  box-shadow:0 24px 60px -18px rgba(217,59,85,.3), 0 0 0 1px rgba(217,59,85,.1);
}
.AS-modal-title { font-size:15px; font-weight:800; color:var(--text-1,#231C14); margin-bottom:6px; letter-spacing:.1px; }
.AS-modal-sub   { font-size:11.5px; color:var(--text-3,#6B5D48); line-height:1.55; margin-bottom:16px; }
.AS-modal-textarea {
  width:100%; min-height:76px; resize:vertical; border-radius:10px; border:1.5px solid var(--border);
  padding:10px 12px; font-family:var(--font-body); font-size:12px; color:var(--text-1,#231C14);
  outline:none; transition:border-color .16s; background:var(--surface,#F5F3EF);
}
.AS-modal-textarea:focus { border-color:#D93B55; }
.AS-modal-actions { display:flex; gap:10px; margin-top:18px; }
.AS-modal-btn {
  flex:1; padding:10px 14px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer;
  border:1.5px solid; transition:all .16s;
}
.AS-modal-btn.cancel { background:transparent; color:var(--text-3,#6B5D48); border-color:var(--border); }
.AS-modal-btn.cancel:hover { background:var(--surface,#F5F3EF); }
.AS-modal-btn.confirm { background:#D93B55; color:#faf9f7; border-color:#D93B55; }
.AS-modal-btn.confirm:hover:not(:disabled) { background:#9A3412; }
.AS-modal-btn:disabled { opacity:.6; cursor:not-allowed; }

/* ── Full-page Create Account layout — a sticky "journey" panel on the
   left explaining what happens end-to-end, and the actual form filling
   the rest of the page, instead of a narrow boxed-in card sitting alone
   on an otherwise-empty page. ── */
.AS-create { display:grid; grid-template-columns:328px minmax(0,1fr); gap:26px; align-items:start; animation:as-stage-in .5s cubic-bezier(.22,1,.36,1) both; }
@media (max-width:920px) { .AS-create { grid-template-columns:1fr; } }

.AS-create-side {
  position:sticky; top:20px; overflow:hidden; border-radius:22px; padding:30px 26px 26px;
  background:linear-gradient(165deg, #231C14 0%, var(--ember-mid) 145%);
  color:#faf9f7; box-shadow:0 24px 60px -24px rgba(194,65,12,.45);
}
@media (max-width:920px) { .AS-create-side { position:static; } }
.AS-create-side::after {
  content:''; position:absolute; inset:0; pointer-events:none;
  background-image:radial-gradient(circle, #faf9f7 1px, transparent 1px);
  background-size:20px 20px; opacity:.06;
}
.AS-create-side-ic {
  position:relative; z-index:1; width:46px; height:46px; border-radius:13px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.22); margin-bottom:16px;
}
.AS-create-side-title { position:relative; z-index:1; font-family:var(--font-display); font-size:23px; line-height:1.25; font-weight:400; margin-bottom:10px; }
.AS-create-side-sub   { position:relative; z-index:1; font-size:11.5px; line-height:1.7; color:rgba(255,255,255,.72); margin-bottom:26px; }

.AS-create-flow { position:relative; z-index:1; display:flex; flex-direction:column; }
.AS-create-flow-item { display:flex; gap:12px; }
.AS-create-flow-dot {
  width:26px; height:26px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:800; border:1.5px solid rgba(255,255,255,.3); background:rgba(255,255,255,.08); color:rgba(255,255,255,.65);
  transition:all .2s;
}
.AS-create-flow-item.now .AS-create-flow-dot { background:#faf9f7; border-color:#faf9f7; color:#231C14; animation:as-step-glow 1.8s ease-in-out infinite; }
.AS-create-flow-line { width:1.5px; flex-shrink:0; align-self:stretch; margin:2px 0 2px 12.25px; background:rgba(255,255,255,.22); min-height:22px; }
.AS-create-flow-body { padding-bottom:20px; }
.AS-create-flow-t { font-size:11.5px; font-weight:800; color:#faf9f7; margin-bottom:2px; }
.AS-create-flow-d { font-size:9.5px; color:rgba(255,255,255,.6); line-height:1.5; }
.AS-create-flow-item:last-child .AS-create-flow-body { padding-bottom:0; }

.AS-create-side-note {
  position:relative; z-index:1; margin-top:8px; display:flex; gap:9px; align-items:flex-start;
  padding:12px 13px; border-radius:12px; background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.16);
  font-size:10px; line-height:1.6; color:rgba(255,255,255,.85);
}
.AS-create-side-note svg { flex-shrink:0; margin-top:1px; }

/* ── Form column ── */
.AS-create-main { min-width:0; }
.AS-create-card {
  border-radius:20px; background:var(--white); border:1px solid var(--border);
  box-shadow:0 1px 4px rgba(15,23,42,.04), 0 22px 50px -28px rgba(15,23,42,.20);
  overflow:hidden;
}
.AS-create-card-hdr { display:flex; align-items:center; gap:13px; padding:22px 26px; border-bottom:1px solid var(--border); background:linear-gradient(135deg, rgba(194,65,12,.05), transparent); }
.AS-create-card-ic { width:42px; height:42px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--ember-ghost); border:1px solid var(--ember-border); }
.AS-create-card-title { font-size:15.5px; font-weight:800; color:var(--text-1); }
.AS-create-card-sub   { font-size:10.5px; color:var(--text-4); margin-top:2px; }
.AS-create-card-body  { padding:26px; }

.AS-create-section { display:flex; align-items:center; gap:9px; margin:0 0 14px; }
.AS-create-section:not(:first-child) { margin-top:26px; }
.AS-create-section-num { width:19px; height:19px; border-radius:6px; background:var(--ember-ghost); color:var(--ember); font-family:var(--font-mono); font-size:8.5px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.AS-create-section-lbl { font-family:var(--font-mono); font-size:9px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--text-3); }
.AS-create-section-rule { flex:1; height:1px; background:var(--border); }

.AS-field-ic { position:relative; }
.AS-field-ic-svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--text-4); display:flex; z-index:1; transition:color .16s; }
.AS-field-ic input { padding-left:34px !important; }
.AS-field-ic:focus-within .AS-field-ic-svg { color:var(--ember); }

.AS-pw-meter { display:flex; gap:4px; margin-top:8px; }
.AS-pw-meter span { flex:1; height:3px; border-radius:2px; background:var(--border); transition:background .2s ease; }
.AS-pw-meter.s1 span:nth-child(-n+1) { background:#D93B55; }
.AS-pw-meter.s2 span:nth-child(-n+2) { background:#9A3412; }
.AS-pw-meter.s3 span:nth-child(-n+3) { background:#DB5B1F; }
.AS-pw-meter.s4 span { background:#1E9C6A; }
.AS-pw-hint { font-size:9px; margin-top:5px; font-weight:700; letter-spacing:.02em; }
.AS-pw-hint.s0, .AS-pw-hint.s1 { color:#D93B55; }
.AS-pw-hint.s2 { color:#9A3412; }
.AS-pw-hint.s3 { color:#DB5B1F; }
.AS-pw-hint.s4 { color:#1E9C6A; }

.AS-pw-match { display:flex; align-items:center; gap:5px; margin-top:8px; font-size:9px; font-weight:700; }
.AS-pw-match.ok  { color:#1E9C6A; }
.AS-pw-match.bad { color:#D93B55; }

.AS-create-card-foot { margin-top:26px; padding-top:20px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; }
@media (max-width:520px) { .AS-create-card-foot { justify-content:stretch; } .AS-create-card-foot .ERP-btn { width:100%; justify-content:center; } }

@media(prefers-reduced-motion: reduce){
  .AS-stat, .AS-stat-grid > .ERP-stat, .AS-chip, .AS-role-card, .AS-banner,
  .AS-banner-ring, .AS-banner-ic.pop, .AS-banner-ic.shake, .as-draw-path,
  .AS-live-dot, .AS-step.active .AS-step-dot, .AS-step-line.done::after,
  .AS-banner-meta .AS-pill, .AS-confetti span, .AS-banner-top,
  .AS-stage-glow, .AS-stage-ring, .AS-stage-ic.pop, .AS-stage-ic.shake,
  .AS-stage-item, .AS-stage-meta .AS-pill, .AS-create,
  .AS-create-flow-item.now .AS-create-flow-dot,
  .AS-act.approve, .AS-act.reject { animation:none !important; box-shadow:none !important; }
  .AS-stat, .AS-stat-grid > .ERP-stat, .AS-role-card, .AS-act { transition:none !important; }
  .as-draw-path { stroke-dashoffset:0 !important; }
}
`;
