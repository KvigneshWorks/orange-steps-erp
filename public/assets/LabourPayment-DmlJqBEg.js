import{C as e,D as t,S as n,a as r,b as i,i as a,n as o,o as s,r as c,s as l,t as u,v as d,x as f,y as p}from"./index-o01vRmXM.js";import{t as m}from"./ConfirmDeleteModal-Bype6Eoe.js";import{t as h}from"./CalendarDD-BMFFtXy7.js";import{t as g}from"./CreatorBadge-DP_gxSSu.js";var _=t(e(),1),v=n(),y=d(),b=[`linear-gradient(135deg,#60A5FA,#2563EB)`],x={cash:`Cash`,bank_transfer:`Bank Transfer`,upi:`UPI`,cheque:`Cheque`,other:`Other`},ee={cash:`Cash`,upi:`UPI`,bank_transfer:`Bank Transfer`,cheque:`Cheque`,other:`Others`},S=10,C=15;function te(e,t){let n=[];for(let r=1;r<=e;r++)r===1||r===e||Math.abs(r-t)<=1?n.push(r):n[n.length-1]!==`…`&&n.push(`…`);return n}var w={cash:{label:`Cash`,color:`#1E9C6A`,icon:`cash`},upi:{label:`UPI`,color:`#2870CC`,icon:`mobile`},bank_transfer:{label:`Bank Transfer`,color:`#0891B2`,icon:`transfer`},cheque:{label:`Cheque`,color:`#9B45CC`,icon:`document`},other:{label:`Other`,color:`#6B6B6B`,icon:`more`}},ne=`
.WP-page { display:flex; flex-direction:column; min-height:100vh; }

/* ── PAGE-WIDE PROFESSIONAL TYPOGRAPHY PASS ──────────────────────────────
   Darken and bolden text across this page specifically (scoped to .WP-page
   only — these two variables are shared theme tokens used everywhere else
   in the app, so redefining them here does not affect other pages). Every
   rule below that already sets its own explicit color/font-weight keeps
   winning by normal cascade specificity; this only raises the BASELINE for
   text that didn't otherwise specify one, and lifts the muted grays up to a
   noticeably darker, more legible shade. */
.WP-page {
  --text-3: #1E293B;
  --text-4: #334155;
  /* Dedicated darker/bolder color for ₹ amount figures specifically —
     var(--ember) itself stays the vivid brand orange (still used for
     buttons/borders/badges/icons throughout this page); amount displays
     switch to this instead, wherever they were reading off --ember. */
  --amt-strong: #1D4ED8;
  font-weight: 700;
  text-transform: uppercase;
}
.WP-page input, .WP-page select, .WP-page button, .WP-page textarea { font-weight: inherit; text-transform: none; }

.WP-hero {
  background:linear-gradient(135deg,#0F172A 0%,#2d1f08 40%,#0F172A 100%);
  border-bottom:1.5px solid rgba(37,99,235,0.18);
  padding:24px 32px; position:relative; overflow:hidden;
}
.WP-hero::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(37,99,235,0.07) 0%,transparent 70%);
  pointer-events:none;
}
.WP-hero-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; position:relative; }
.WP-hero-icon {
  width:48px; height:48px; border-radius:13px; flex-shrink:0;
  background:linear-gradient(135deg,#60A5FA,#2563EB);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 16px rgba(37,99,235,0.35);
}
.WP-hero-title { font-family:var(--font-body); font-size: 19.5px; font-weight: 800; font-style:normal; color:#2563EB; margin:0 0 2px; }
.WP-hero-sub { font-family:var(--font-mono); font-size: 8px; letter-spacing:2px; color:#334155; text-transform:uppercase; }
.WP-hero-right { margin-left:auto; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

.WP-body { padding:24px 32px; flex:1; }
@media(max-width:900px){ .WP-body { padding:16px; } }

.WP-btn {
  display:inline-flex; align-items:center; gap:6px; padding:7px 14px;
  border-radius:8px; border:none; cursor:pointer; font-family:var(--font-mono);
  font-size: 8px; font-weight: 800; letter-spacing:1.3px; text-transform:uppercase;
  transition:all 0.18s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; flex-shrink:0;
}
.WP-btn-primary { background:linear-gradient(135deg,#60A5FA,#2563EB); color:#fff; position:relative; overflow:hidden; }
.WP-btn-primary::before {
  content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
  animation:wp-shine 3s ease-in-out infinite; pointer-events:none;
}
@keyframes wp-shine { 0%{left:-80%} 50%,100%{left:130%} }
.WP-btn-primary:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(37,99,235,0.4); }
.WP-btn-green { background:linear-gradient(135deg,#60A5FA,#2563EB); color:#fff; box-shadow:0 4px 14px rgba(37,99,235,0.32); }
.WP-btn-green:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(37,99,235,0.45); }
.WP-btn-ghost { background:rgba(255,255,255,0.06); color:#bbb; border:1.5px solid rgba(255,255,255,0.1); }
.WP-btn-ghost:hover { transform:translateY(-1px); background:rgba(255,255,255,0.1); color:#fff; }
.WP-btn-outline { background:transparent; color:var(--text-3); border:1.5px solid var(--border); }
.WP-btn-outline:hover { transform:translateY(-1px); border-color:var(--ember-mid); color:var(--ember); background:var(--ember-ghost); }
.WP-btn-red { background:linear-gradient(135deg,#D93B55,var(--ember)); color:#fff; }
.WP-btn-red:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(239,68,68,0.35); }
.WP-btn-sm { padding:4px 10px; font-size: 7.5px; letter-spacing:.9px; }
.WP-btn:active:not(:disabled) { transform:translateY(0) scale(.95) !important; }
.WP-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
.WP-back-btn {
  display:inline-flex; align-items:center; gap:7px; padding:5px 12px 5px 6px; margin-bottom:20px;
  background:var(--white); border:1.5px solid var(--border); border-radius:100px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.1px;
  text-transform:uppercase; color:var(--text-1); cursor:pointer; transition:all 0.18s cubic-bezier(.34,1.56,.64,1);
  box-shadow:0 1px 4px rgba(0,0,0,.05);
}
.WP-back-btn-ico {
  display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px;
  border-radius:50%; background:var(--ember-ghost); color:var(--ember); flex-shrink:0;
  transition:all .18s;
}
.WP-back-btn:hover { transform:translateY(-1px); border-color:var(--ember-mid); color:var(--ember); box-shadow:0 4px 14px rgba(37,99,235,.2); }
.WP-back-btn:hover .WP-back-btn-ico { background:var(--ember); color:#fff; }
.WP-back-btn:active { transform:translateY(0) scale(.95); }

/* ── DAYBOOK-STYLE STAT CARD EXTRAS (badge + breakdown rows) ── */
.LP-stat-badge {
  display:inline-flex; align-items:center; gap:4px;
  padding:2px 8px; border-radius:100px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:1px; text-transform:uppercase;
  background:var(--off-white); color:var(--text-4);
  border:1px solid var(--border); margin-top:4px;
  position:relative; z-index:1;
}
.LP-stat-rows {
  margin-top:10px; padding-top:10px; border-top:1px solid var(--border);
  display:flex; flex-direction:column; gap:5px; width:100%;
  position:relative; z-index:1;
}
.LP-stat-row { display:flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size: 8px; }
.LP-stat-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.LP-stat-mode { flex:1; color:var(--text-4); font-weight: 700; letter-spacing:0.5px; text-transform:uppercase; font-size: 8px; }
.LP-stat-amt { font-weight: 800; color:var(--amt-strong); font-size: 8.5px; }

.WP-search-wrap { position:relative; }
.WP-search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); pointer-events:none; }
.WP-search {
  width:200px; padding:8px 12px 8px 34px;
  background:var(--white); border:1.5px solid var(--border); border-radius:8px;
  font-family:var(--font-body); font-size: 10.5px; color:var(--text-1); outline:none; transition:all 0.15s;
}
.WP-search:focus { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }

.WP-tabs { display:flex; gap:4px; }
.WP-tab {
  padding:6px 12px; border-radius:7px; font-family:var(--font-mono); font-size: 7.5px;
  font-weight: 800; letter-spacing:.9px; text-transform:uppercase; cursor:pointer;
  border:1.5px solid var(--border); color:var(--text-4); background:transparent; transition:all 0.15s cubic-bezier(.34,1.56,.64,1);
}
.WP-tab:hover { border-color:var(--ember-mid); color:var(--ember); transform:translateY(-1px); }
.WP-tab:active { transform:translateY(0) scale(.95); }
.WP-tab-active { background:var(--ember-ghost); border-color:var(--ember-mid); color:var(--ember); }

/* ── PAGE-LEVEL TABS: Workers / All Payments — same flat bordered
   segmented-control UI used on the Register/Attendance pages ── */
.LP-view-tabs { display:inline-flex; border:1.5px solid var(--border); border-radius:var(--r-lg); overflow:hidden; background:var(--white); margin-bottom:20px; animation:lp-hero-in .3s .05s ease both; }
.LP-view-tab {
  display:flex; align-items:center; gap:8px; padding:14px 28px; font-family:var(--font-mono); font-size: 10px;
  font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-3); cursor:pointer;
  border:none; border-right:1.5px solid var(--border); transition:background .16s ease, color .16s ease;
  white-space:nowrap; background:var(--white);
}
.LP-view-tab:last-child { border-right:none; }
.LP-view-tab:hover { color:var(--ember); background:var(--ember-ghost); }
.LP-view-tab.active { color:#fff; background:var(--ember); }
.LP-view-tab-badge { padding:2px 8px; border-radius:100px; font-size: 8px; font-weight: 800; background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }
.LP-view-tab.active .LP-view-tab-badge { background:rgba(255,255,255,.25); color:#fff; border-color:rgba(255,255,255,.4); }

/* ── EXPANDABLE ROW (All Payments client split) ── */
.LP-expand-row td { background:var(--off-white); border-bottom:1px solid var(--border); padding:0 14px; animation:lp-hero-in .2s ease both; }

.WP-avatar {
  border-radius:11px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-weight: 800; color:white; letter-spacing:.5px; font-family:var(--font-mono);
}

/* ── COMPACT WORKER TABLE (Master-data style, dense rows) ── */
.LP-tbl-toolbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
.LP-tbl-scroll { max-height:none; overflow-y:visible; }

/* Bordered box-grid table format — same tabular, column-lined look as the
   Register/Attendance pages, scoped to this table only. */
.LP-compact { border:1px solid var(--border); }
.LP-compact thead tr { background:var(--surface-2,#E9EEF5) !important; border-bottom:2px solid var(--ember,#2563EB) !important; }
.LP-compact th { color:var(--text-3,#27364A) !important; border-right:1px solid var(--border,#E9EEF5); }
.LP-compact th:last-child { border-right:none; }
.LP-compact td { padding:12px 16px; font-size: 10.5px; font-weight: 700; color:var(--text-1); border-right:1px solid var(--border); }
.LP-compact td:last-child { border-right:none; }
.LP-compact tbody tr:nth-child(even) td { background:var(--off-white,#F8FAFC); }
.LP-compact .ERP-t-num { color:var(--text-2); }

/* ── ORANGE UI: exact match with the Master-Data view tables (BioData,
   Category, etc. — the shared .ERP-tbl base look) — same header font/
   letter-spacing/padding, same uppercase body text, same plain-dark
   cell color with only the primary Name column staying accent-orange.
   Scoped to Wage Disbursement's view-page tables only, never touches the
   shared .ERP-tbl base elsewhere. ── */
.LP-orange-tbl th { background: var(--surface-2, #E9EEF5) !important; color: var(--text-3, #27364A) !important; border-bottom: 2px solid var(--ember, #2563EB) !important; }
.LP-orange-tbl.LP-compact th { font-size: 8px !important; font-weight: 800 !important; letter-spacing: 2.5px !important; padding: 12px 16px !important; }
.LP-orange-tbl.LP-compact td { padding: 13px 16px; text-transform: uppercase; letter-spacing: .25px; }
@keyframes lp-row-in { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:none} }
.LP-row { cursor:pointer; animation:lp-row-in .38s ease both; transition:box-shadow .18s, background .18s; }
/* Premium cascading reveal for sub-worker rows when the Show/Hide toggle
   expands them — bouncier scale+slide than the flat .LP-anim-row fade, with
   a brief highlight sweep so each row reads as landing "one by one". */
@keyframes lp-subrow-in {
  0%   { opacity:0; transform:translateY(-8px) scale(.96); background:rgba(37,99,235,0.14); }
  55%  { opacity:1; transform:translateY(2px) scale(1.015); }
  100% { opacity:1; transform:translateY(0) scale(1); background:transparent; }
}
.LP-subrow-anim { animation: lp-subrow-in .6s cubic-bezier(.34,1.56,.64,1) both; }
.LP-row:hover { box-shadow:inset 3px 0 0 var(--ember); background:rgba(37,99,235,0.04); }
.LP-row:active { transform:scale(.998); }
.LP-row td { transition:color .15s; }
.LP-mini-avatar {
  width:32px; height:32px; border-radius:9px; flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  font-family:var(--font-mono); font-weight: 800; font-size: 9px; color:#fff; letter-spacing:.5px;
  transition:transform .2s;
}
.LP-row:hover .LP-mini-avatar { transform:scale(1.12) rotate(-4deg); }
.LP-worker-cell { display:flex; align-items:center; gap:10px; min-width:0; }
.LP-worker-name { font-weight: 800; font-size: 12.5px; color:var(--ember); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.LP-worker-trade { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:.5px; text-transform:uppercase; margin-top:2px; }
.LP-rate { font-family:var(--font-mono); font-size: 9px; font-weight: 800; color:var(--text-1); white-space:nowrap; }
.LP-last { font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--text-3); white-space:nowrap; }

/* ── DATE + TIME CELL — single compact line ── */
.LP-dt-cell { display:flex; align-items:baseline; gap:5px; }
.LP-dt-date { font-family:var(--font-mono); font-size: 9px; font-weight: 700; color:var(--text-2); white-space:nowrap; }
.LP-dt-time { font-family:var(--font-mono); font-size: 8.5px; color:var(--text-4); white-space:nowrap; }

/* ── "PAID TO" RECIPIENT — simple, no extra caption ── */
.LP-paidto { display:flex; align-items:center; gap:6px; }
.LP-paidto-name { display:block; }
.LP-paidto-more { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); font-weight: 700; }
.LP-amt-highlight { font-weight: 800; color:var(--amt-strong); }
.LP-pay-row:hover .LP-mini-avatar { box-shadow:0 0 0 3px var(--ember-ghost); }

/* ── EXPANDED ROW META STRIP — one compact line ── */
.LP-expand-meta {
  display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:0 2px 10px;
  font-family:var(--font-mono); font-size: 8.5px; color:var(--text-4); letter-spacing:.2px;
}
.LP-expand-meta b { color:var(--text-3); font-weight: 700; }
.LP-expand-meta span:not(:last-child)::after { content:'·'; margin-left:6px; color:var(--border-2); }
.ERP-badge.unpaid { background:var(--ember-ghost); color:var(--ember); border-color:var(--ember-border); }
.ERP-badge.clear  { background:var(--surface-2); color:var(--text-4); border-color:var(--border); }

/* ── PAGINATION BAR ── */
.LP-pgn {
  display:flex; align-items:center; gap:6px; padding:13px 20px; flex-wrap:wrap;
  border-top:1px solid var(--border); background:var(--off-white);
  animation:lp-row-in .3s ease both;
}
.LP-pgn-info { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:1px; text-transform:uppercase; margin-right:auto; }
.LP-pgn-info b { color:var(--ember); font-weight: 800; }
.LP-pgn-btn {
  min-width:33px; height:33px; padding:0 12px;
  display:inline-flex; align-items:center; justify-content:center; gap:5px;
  border-radius:100px; border:1.5px solid var(--border); background:var(--white);
  color:var(--text-3); font-family:var(--font-mono); font-size: 8.5px; font-weight: 800;
  letter-spacing:.5px; cursor:pointer; transition:all .18s cubic-bezier(.34,1.56,.64,1);
}
.LP-pgn-btn:hover:not(:disabled):not(.on) {
  border-color:var(--ember-mid); color:var(--ember);
  transform:translateY(-2px) scale(1.05); box-shadow:0 4px 12px rgba(37,99,235,.2);
}
.LP-pgn-btn:active:not(:disabled) { transform:translateY(0) scale(.94); }
.LP-pgn-btn.on {
  background:linear-gradient(135deg,#60A5FA,#2563EB); border-color:transparent; color:#fff;
  box-shadow:0 3px 12px rgba(37,99,235,.38); transform:translateY(-1px);
  animation:lp-pgn-pop .3s ease both;
}
@keyframes lp-pgn-pop { from{transform:scale(.8) translateY(-1px); opacity:.6} to{transform:scale(1) translateY(-1px); opacity:1} }
.LP-pgn-btn:disabled { opacity:.35; cursor:not-allowed; }
.LP-pgn-dots { color:var(--text-4); font-family:var(--font-mono); font-size: 9px; padding:0 3px; user-select:none; }
.LP-pgn-nav { text-transform:uppercase; }
.LP-pgn-nav.prev svg { transform:rotate(90deg); }
.LP-pgn-nav.next svg { transform:rotate(-90deg); }

/* ── PAGE-SWITCH FADE (table body re-entrance on page change) ── */
@keyframes lp-page-fade { from{opacity:0} to{opacity:1} }
.LP-page-fade { animation:lp-page-fade .3s ease both; display:table-row-group; }

/* ── SKELETON SHIMMER LOADING (table) ── */
@keyframes lp-shimmer { from{background-position:-420px 0} to{background-position:420px 0} }
.LP-skel {
  display:inline-block; height:12px; border-radius:6px;
  background:linear-gradient(90deg,var(--off-white) 25%,var(--surface-3) 50%,var(--off-white) 75%);
  background-size:420px 100%; animation:lp-shimmer 1.4s infinite linear;
}
.LP-skel-avatar { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.LP-skel-row td { padding:10px 14px; }
.LP-skel-row { animation:lp-row-in .3s ease both; }

/* ── PREMIUM LOADING OVERLAY (worker click) — running-man mascot, no card ── */
@keyframes lp-fade { from{opacity:0} to{opacity:1} }
@keyframes lp-slide-grad { from{background-position:0 0} to{background-position:200% 0} }
.LP-overlay {
  position:fixed; inset:0; z-index:998;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px;
  background:rgba(15,23,42,.45); backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px);
  animation:lp-fade .25s ease both;
}
/* Running-figure mascot — same ember-theme structure as ConfirmDeleteModal's
   cdm-run-* set (track→flip→figure→limb-joint pattern). Positioning is
   always a plain SVG transform attribute; animation is always a separate
   CSS class on its own nested element — a CSS transform on the same node
   would silently replace the static attribute instead of combining with it. */
@keyframes lp-run-track { 0%,100% { transform: translateX(0); } 50% { transform: translateX(150px); } }
@keyframes lp-run-flip {
  0%, 49.9%  { transform: scaleX(1); }
  50%, 99.9% { transform: scaleX(-1); }
  100%       { transform: scaleX(1); }
}
@keyframes lp-run-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes lp-run-arm-back  { 0%,100% { transform: rotate(38deg); } 50% { transform: rotate(-28deg); } }
@keyframes lp-run-arm-front { 0%,100% { transform: rotate(-28deg); } 50% { transform: rotate(38deg); } }
@keyframes lp-run-leg-back  { 0%,100% { transform: rotate(48deg); } 50% { transform: rotate(-38deg); } }
@keyframes lp-run-leg-front { 0%,100% { transform: rotate(-38deg); } 50% { transform: rotate(48deg); } }
@keyframes lp-run-line {
  0%   { opacity: 0; transform: translateX(8px); }
  45%  { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-8px); }
}
.LP-run-wrap { display:flex; justify-content:center; align-items:flex-end; position:relative; min-height:84px; overflow:visible; }
.LP-run-track { animation: lp-run-track 3.8s ease-in-out infinite; }
.LP-run-flip { animation: lp-run-flip 3.8s linear infinite; }
.LP-run-figure { animation: lp-run-bob 0.78s ease-in-out infinite; }
.LP-run-arm-back  { transform-origin: 0 0; animation: lp-run-arm-back 0.78s ease-in-out infinite; }
.LP-run-arm-front { transform-origin: 0 0; animation: lp-run-arm-front 0.78s ease-in-out infinite; }
.LP-run-leg-back  { transform-origin: 0 0; animation: lp-run-leg-back 0.78s ease-in-out infinite; }
.LP-run-leg-front { transform-origin: 0 0; animation: lp-run-leg-front 0.78s ease-in-out infinite; }
.LP-run-line { animation: lp-run-line 1.2s ease-in-out infinite; }
.LP-run-line.l2 { animation-delay: 0.16s; }
.LP-run-line.l3 { animation-delay: 0.32s; }
.LP-loader-title { font-family:var(--font-display); font-size: 16px; font-weight: 800; font-style:normal; color:#fff; text-align:center; }
.LP-loader-sub {
  font-family:var(--font-mono); font-size: 8px; letter-spacing:2.5px; text-transform:uppercase;
  color:rgba(255,255,255,.65); display:flex; align-items:center; justify-content:center; gap:8px; margin-top:6px;
}
.LP-loader-dots { display:inline-flex; gap:4px; }
.LP-loader-dots span {
  width:5px; height:5px; border-radius:50%; background:#60A5FA; display:inline-block;
  animation:wp-bounce 1s ease-in-out infinite;
}
.LP-loader-dots span:nth-child(2) { animation-delay:.15s; }
.LP-loader-dots span:nth-child(3) { animation-delay:.3s; }

/* ── DETAIL VIEW · PREMIUM WORKER HERO ──
   Row-click → detail-view reveal now uses the same "premium page swap" the
   other two Manpower pages use for their tab switches (Manpower Register's
   .WR-tbl-card/.WR-reg-grid, Attendance's .AT-record-wrap) — blur+scale
   overshoot on the same easing curve — instead of the plain translateY
   fade this used before, so all 3 pages read as one consistent system. */
@keyframes lp-hero-in { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none} }
@keyframes wr-pageSwap {
  0%{opacity:0;transform:translateY(20px) scale(.97);filter:blur(5px);}
  55%{opacity:1;filter:blur(0);}
  75%{transform:translateY(-2px) scale(1.005);}
  100%{opacity:1;transform:translateY(0) scale(1);}
}
@keyframes lp-avatar-ring { 0%{box-shadow:0 0 0 0 rgba(37,99,235,.4)} 100%{box-shadow:0 0 0 12px rgba(37,99,235,0)} }
.LP-hero {
  position:relative; overflow:hidden;
  background:linear-gradient(135deg,rgba(37,99,235,.10) 0%,var(--white) 45%,rgba(37,99,235,.04) 100%);
  border:1.5px solid var(--ember-border); border-radius:18px;
  padding:22px 26px; margin-bottom:20px;
  display:flex; align-items:center; gap:18px; flex-wrap:wrap;
  animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both; box-shadow:var(--sh-card);
}
.LP-hero::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg,var(--ember),#60A5FA,#ffd27a,#60A5FA,var(--ember));
  background-size:200% 100%; animation:lp-slide-grad 2.4s linear infinite;
}
.LP-hero::after {
  content:'₹'; position:absolute; right:20px; bottom:-30px;
  font-family:var(--font-display); font-style:italic; font-size: 105.5px;
  color:rgba(37,99,235,.08); pointer-events:none; line-height:1;
}
.LP-hero-avatar {
  width:58px; height:58px; border-radius:16px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-mono); font-weight: 800; font-size: 16.5px; color:#fff; letter-spacing:.5px;
  animation:lp-avatar-ring 2s ease-out infinite;
}
.LP-hero-name { font-family:var(--font-body); font-size: 18.5px; font-weight: 800; font-style:normal; color:var(--text-1); line-height:1.1; margin-bottom:6px; }
.LP-hero-chips { display:flex; gap:5px; flex-wrap:wrap; }
.LP-chip {
  display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:100px;
  font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:.6px; text-transform:uppercase;
  background:var(--white); border:1px solid var(--ember-border); color:var(--text-3);
  transition:all .18s;
}
.LP-chip:hover { transform:translateY(-1px); box-shadow:0 3px 10px rgba(37,99,235,.18); }
.LP-chip b { color:var(--ember); font-weight: 800; }

/* ── DETAIL PANELS · POLISH & ENTRANCE ── */
.WP-layout > * { animation:wr-pageSwap .45s cubic-bezier(.22,1,.36,1) both; }
.WP-layout > *:nth-child(2) { animation-delay:.12s; }
.WP-panel { border-radius:16px; box-shadow:var(--sh-card); transition:box-shadow .25s; }
.WP-panel:hover { box-shadow:0 10px 30px rgba(37,99,235,.09); }
.LP-panel-ico {
  width:26px; height:26px; border-radius:8px; flex-shrink:0;
  background:linear-gradient(135deg,var(--ember-ghost),rgba(37,99,235,0.16)); border:1px solid var(--ember-border);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 2px 8px rgba(37,99,235,.15);
}
.LP-count-pill {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:.6px;
  padding:3px 10px; border-radius:100px; background:var(--ember); color:#fff;
  border:1px solid var(--ember); text-transform:uppercase; white-space:nowrap;
  box-shadow:0 2px 8px rgba(37,99,235,.3);
}
.LP-anim-row { animation:lp-row-in .35s ease both; }
.LP-prog { height:3px; border-radius:100px; background:var(--off-white); overflow:hidden; margin-top:5px; width:100%; max-width:140px; border:1px solid var(--border); }
.LP-prog i { display:block; height:100%; border-radius:100px; background:linear-gradient(90deg,#60A5FA,#2563EB); transition:width .6s ease; }
.LP-prog-lbl { font-family:var(--font-mono); font-size: 7px; color:var(--text-4); margin-top:3px; letter-spacing:.3px; }

/* ── PAY FORM · STEP BADGES & MICRO-ANIMATIONS ── */
.LP-step {
  width:16px; height:16px; border-radius:5px; flex-shrink:0;
  background:linear-gradient(135deg,#60A5FA,#2563EB); color:#fff;
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  display:inline-flex; align-items:center; justify-content:center;
  box-shadow:0 2px 8px rgba(37,99,235,.35);
}
.LP-step-line {
  display:flex; align-items:center; gap:8px; margin:16px 0 12px;
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing:1.5px; text-transform:uppercase; color:#3B82F6;
}
.WP-session { animation:lp-row-in .35s ease both; transition:background .15s; }
.WP-session:hover { background:rgba(37,99,235,.04); }

/* ── MODE STICKER BADGE ── */
.LP-mode-badge {
  display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px;
  border:1px solid; font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing:1px; text-transform:uppercase; white-space:nowrap;
}

/* ── SEARCHABLE MODE DROPDOWN (Cash Book-style) ── */
@keyframes lp-dd-drop { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
.LP-dd { position:relative; width:100%; min-width:175px; }
.LP-dd-filter { width:auto; min-width:150px; }
.LP-dd-filter .LP-dd-trigger { min-height:38px; padding:7px 11px; border-radius:9px; }
.LP-dd-filter .LP-dd-panel { min-width:210px; }

/* ── DATE RANGE PICKER (All Payments toolbar) ── */
.LP-date-range { display:flex; align-items:center; gap:6px; }
.LP-date-field {
  display:flex; align-items:center; gap:7px; padding:0 11px; height:38px;
  background:var(--white); border:1.5px solid var(--border); border-radius:9px; transition:border-color .18s;
}
.LP-date-field:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.LP-date-field input {
  background:transparent; border:none; outline:none; font-family:var(--font-mono);
  font-size: 9px; font-weight: 700; color:var(--text-1); cursor:pointer; width:104px;
}
/* Shared CalendarDD dropped inside the already-bordered .LP-date-field box */
.LP-date-field .ERP-cal-field { border:none; background:transparent; padding:0; min-height:0; }
.LP-date-field .ERP-cal-val { font-size: 9px; }
.LP-date-sep { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:1px; text-transform:uppercase; }
.LP-date-clear {
  display:flex; align-items:center; justify-content:center; width:38px; height:38px;
  border:1.5px solid var(--border); border-radius:9px; background:var(--white); color:var(--text-4);
  cursor:pointer; transition:all .15s; flex-shrink:0;
}
.LP-date-clear:hover { border-color:var(--ember-mid); color:var(--ember); background:var(--ember-ghost); }
.LP-dd-trigger {
  width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:8px 12px; background:var(--white); border:1.5px solid var(--border);
  border-radius:8px; cursor:pointer; transition:all .18s; text-align:left;
  min-height:41px; outline:none;
}
.LP-dd-trigger:hover { border-color:var(--border-2); background:var(--off-white); }
.LP-dd-trigger.open { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); border-bottom-left-radius:0; border-bottom-right-radius:0; }
.LP-dd-content { flex:1; min-width:0; display:flex; align-items:center; }
.LP-dd-ph { font-family:var(--font-body); font-size: 10px; color:var(--text-4); font-style:normal; }
.LP-dd-chevron { color:var(--text-4); transition:transform .2s, color .18s; flex-shrink:0; display:flex; }
.LP-dd-chevron.open { transform:rotate(180deg); color:var(--ember); }
.LP-dd-panel {
  position:absolute; top:100%; left:0; right:0; z-index:1000;
  background:var(--white); border:1.5px solid var(--ember-mid); border-top:none;
  border-bottom-left-radius:8px; border-bottom-right-radius:8px;
  box-shadow:0 12px 32px rgba(0,0,0,.12); overflow:hidden;
  animation:lp-dd-drop .14s ease both;
}
.LP-dd-search-row { display:flex; align-items:center; gap:8px; padding:8px 11px; border-bottom:1px solid var(--border); background:var(--off-white); }
.LP-dd-search { flex:1; background:transparent; border:none; outline:none; font-family:var(--font-body); font-size: 10px; color:var(--text-1); caret-color:var(--ember); min-width:0; }
.LP-dd-search::placeholder { color:var(--text-4); }
.LP-dd-clr { background:none; border:none; padding:2px; cursor:pointer; color:var(--text-4); display:flex; }
.LP-dd-clr:hover { color:var(--error); }
.LP-dd-list { max-height:200px; overflow-y:auto; padding:3px 0; }
.LP-dd-item { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 12px; cursor:pointer; transition:background .1s; }
.LP-dd-item:hover { background:rgba(37,99,235,.07); }
.LP-dd-item.sel { background:var(--ember-ghost); }
.LP-dd-clear { color:var(--text-4); font-family:var(--font-body); font-size: 9px; font-style:normal; font-weight: 700; border-bottom:1px solid var(--border); padding:7px 12px; justify-content:flex-start; }
.LP-dd-clear:hover { background:rgba(217,59,85,.06); color:var(--error); }
.LP-dd-empty { display:flex; align-items:center; gap:8px; padding:13px; font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:.5px; }
.LP-dd-footer { padding:5px 12px; border-top:1px solid var(--border); font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:.5px; text-align:right; background:var(--off-white); }
.LP-dd-sel-label { font-family:var(--font-body); font-size: 10px; font-weight: 700; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.LP-dd-item-main { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
.LP-dd-item-sub { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:.5px; }

/* ── PAYMENT MODE DROPDOWN — professional checkbox-style, plain text only
   (no colored icon badges), orange theme, transparent inset scrollbar.
   Scoped to .LP-dd-mode so the generic .LP-dd-* dropdown used elsewhere
   (filters, client/party pickers) is untouched. ── */
.LP-dd-mode-txt { font-family:var(--font-body); font-size: 10.5px; font-weight: 700; color:var(--text-1); }
.LP-dd-panel-mode { border-radius:9px; border:1.5px solid var(--ember-mid); }
.LP-dd-list-mode { max-height:170px; padding:5px; scrollbar-width:thin; scrollbar-color:rgba(37,99,235,0.35) transparent; }
.LP-dd-list-mode::-webkit-scrollbar { width:6px; background:transparent; }
.LP-dd-list-mode::-webkit-scrollbar-track { background:transparent; }
.LP-dd-list-mode::-webkit-scrollbar-thumb { background:rgba(37,99,235,0.3); border-radius:100px; }
.LP-dd-list-mode::-webkit-scrollbar-thumb:hover { background:rgba(37,99,235,0.5); }
.LP-dd-item-mode { border-radius:7px; padding:9px 10px; gap:10px; }
.LP-dd-item-mode.sel { background:var(--ember-ghost); }
.LP-dd-item-mode:hover .LP-dd-mode-txt { color:var(--ember); }
@keyframes lp-dd-check-pop { 0%{opacity:0; transform:scale(0.4);} 60%{opacity:1; transform:scale(1.2);} 100%{opacity:1; transform:scale(1);} }
.LP-dd-check {
  width:16px; height:16px; border-radius:5px; border:2px solid var(--border,#D4D5D8); flex-shrink:0;
  display:flex; align-items:center; justify-content:center; background:#fff;
  transition:all .16s cubic-bezier(.34,1.56,.64,1);
}
.LP-dd-check svg { animation:lp-dd-check-pop .22s cubic-bezier(.34,1.56,.64,1) both; }
.LP-dd-check.checked { border-color:var(--ember); background:linear-gradient(135deg,var(--ember-mid,#3B82F6),var(--ember)); }

/* ── DAYBOOK SYNC SECTION (same pattern as Credit Management) ── */
.LP-sync-toggle {
  margin-left:auto; display:inline-flex; align-items:center; gap:7px; cursor:pointer;
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px;
  text-transform:uppercase; color:#3B82F6; user-select:none;
}
.LP-sync-toggle input { width:15px; height:15px; accent-color:#2563EB; cursor:pointer; margin:0; }
.LP-db-details-toggle {
  display:inline-flex; align-items:center; gap:5px; cursor:pointer;
  background:var(--white); border:1px solid var(--ember-border); border-radius:100px;
  padding:4px 10px; font-family:var(--font-mono); font-size: 7px; font-weight: 800;
  letter-spacing:.8px; text-transform:uppercase; color:var(--ember); transition:all .18s;
}
.LP-db-details-toggle:hover { background:var(--ember); color:#fff; border-color:var(--ember); }
.LP-db-details-toggle svg { transition:transform .2s ease; }
.LP-db-details-toggle.open svg { transform:rotate(180deg); }
.LP-db-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; animation:wp-pick-in .25s ease both; }
@media(max-width:760px){ .LP-db-grid { grid-template-columns:1fr; } }
.LP-db-span { grid-column:1/-1; }
.LP-db-warn {
  display:flex; align-items:center; gap:6px; margin-bottom:10px; padding:7px 11px;
  background:rgba(37,99,235,.08); border:1px solid rgba(37,99,235,.25); border-radius:8px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 700; letter-spacing:.3px;
  color:#92400e;
}
.LP-db-warn button {
  background:none; border:none; padding:0; margin:0; color:#2563EB; font-weight: 800;
  text-decoration:underline; cursor:pointer; font-family:inherit; font-size:inherit;
}
.LP-hint { font-family:var(--font-mono); font-size: 7px; font-weight: 800; color:#1E9C6A; margin-top:4px; letter-spacing:.3px; }
.LP-db-preview {
  margin-top:12px; border:1px solid rgba(30,156,106,.3); border-radius:9px;
  background:linear-gradient(135deg,rgba(30,156,106,.07),rgba(30,156,106,.02));
  overflow:hidden; animation:wp-pick-in .3s ease both;
}
.LP-db-preview-head {
  width:100%; display:flex; align-items:center; gap:6px; padding:7px 12px;
  background:rgba(30,156,106,.1); border:none; border-bottom:1px solid rgba(30,156,106,.18);
  font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:1.1px;
  text-transform:uppercase; color:#1E9C6A; cursor:pointer; transition:background .15s;
}
.LP-db-preview-head:hover { background:rgba(30,156,106,.16); }
.LP-db-preview-chev { margin-left:auto; display:flex; transition:transform .2s ease; }
.LP-db-preview-chev.open { transform:rotate(180deg); }
.LP-db-preview-body {
  padding:10px 12px; display:grid; grid-template-columns:1fr 1fr; gap:5px 12px;
  font-family:var(--font-body); font-size: 9px; color:#1E9C6A;
}
@media(max-width:600px){ .LP-db-preview-body { grid-template-columns:1fr; } }
.LP-db-preview-body b { color:#1E9C6A; font-weight: 800; }
.LP-db-note {
  padding:8px 12px; font-family:var(--font-mono); font-size: 7.5px; letter-spacing:.3px;
  color:var(--text-4);
}
.LP-db-entries { border-top:1px dashed rgba(30,156,106,.35); padding:7px 12px 9px; display:flex; flex-direction:column; gap:5px; }
.LP-db-entries-title { font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:.8px; text-transform:uppercase; color:#1E9C6A; margin-bottom:2px; }
.LP-db-entry { display:flex; align-items:center; gap:7px; font-family:var(--font-body); font-size: 9px; color:#1E9C6A; animation:lp-row-in .3s ease both; }
.LP-db-entry-num { font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:#1E9C6A; background:rgba(30,156,106,.12); border:1px solid rgba(30,156,106,.25); border-radius:100px; padding:1px 7px; flex-shrink:0; }
.LP-db-entry-client { flex:1; font-weight: 700; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.LP-db-entry-status { font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase; padding:2px 7px; border-radius:100px; flex-shrink:0; }
.LP-db-entry-status.closed { background:rgba(30,156,106,.15); color:#1E9C6A; }
.LP-db-entry-status.partial { background:rgba(196,126,10,.15); color:#92400e; }
.LP-db-entry-amt { font-family:var(--font-mono); font-weight: 800; font-size: 9.5px; color:#1E9C6A; flex-shrink:0; }

.WP-badge {
  display:inline-flex; align-items:center; padding:3px 9px; border-radius:100px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase;
}
.WP-badge-unpaid  { background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }
.WP-badge-partial { background:rgba(196,126,10,0.10); color:#C47E0A; border:1px solid rgba(196,126,10,0.25); }
.WP-badge-clear   { background:var(--off-white); color:var(--text-3); border:1px solid var(--border); }
.WP-badge-closed  { background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }

.WP-detail-header {
  background:linear-gradient(135deg,rgba(37,99,235,0.06) 0%,rgba(37,99,235,0.02) 100%);
  border:1px solid var(--ember-border); border-radius:11px;
  padding:12px 16px; margin-bottom:12px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;
}
.WP-detail-name { font-family:var(--font-body); font-size: 15.5px; font-weight: 800; font-style:normal; color:var(--text-1); margin:0 0 2px; }
.WP-detail-meta { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:1.1px; text-transform:uppercase; }

.WP-layout { display:flex; flex-direction:column; gap:14px; margin-bottom:14px; }

/* Record Payment + Payment History side-by-side row (used to be crammed into one narrow left column) */
.WP-pay-layout { display:grid; grid-template-columns:1.35fr 1fr; gap:14px; align-items:start; }
@media(max-width:1100px){ .WP-pay-layout { grid-template-columns:1fr; } }

/* Balanced, fixed column widths so breakdown tables don't squish to one side */
.WP-tbl-fixed { table-layout:fixed; }
.WP-tbl-fixed col.c-num  { width:48px; }
.WP-tbl-fixed col.c-name { width:auto; }
.WP-tbl-fixed col.c-num-sm { width:11%; }
.WP-tbl-fixed col.c-status { width:110px; }

.WP-panel { background:var(--white); border:1px solid var(--border); border-radius:11px; overflow:hidden; }
.WP-panel-head {
  padding:11px 15px; border-bottom:1px solid var(--border);
  background:linear-gradient(to bottom, var(--off-white), var(--white));
  display:flex; align-items:center; gap:8px;
}
.WP-panel-title { font-family:var(--font-body); font-size: 11px; font-style:normal; font-weight: 800; letter-spacing:.2px; color:var(--text-1); flex:1; }
/* Separates two data sections sharing one merged panel card. */
.WP-panel-divider { height:10px; background:var(--off-white); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }

.WP-tbl { width:100%; border-collapse:collapse; table-layout:fixed; border:1px solid var(--border); }
.WP-tbl th {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2.5px; text-transform:uppercase;
  color:#fff; padding:9px 12px; border-bottom:none; border-right:1px solid rgba(255,255,255,.22);
  background:linear-gradient(135deg,var(--ember-mid,#3B82F6),var(--ember,#2563EB)); text-align:center; white-space:nowrap; line-height:1.3;
}
.WP-tbl th:last-child { border-right:none; }
.WP-tbl td { padding:9px 12px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); font-size: 11px; color:var(--text-2); vertical-align:middle; transition:background .15s; line-height:1.35; text-align:center; text-transform:uppercase; letter-spacing:.25px; }
.WP-tbl td:last-child { border-right:none; }
.WP-tbl td, .WP-tbl th { overflow:hidden; text-overflow:ellipsis; }
.WP-tbl tr:last-child td { border-bottom:none; }
.WP-tbl tbody tr:not(.WP-tbl-total):hover td { background:rgba(37,99,235,0.05); }
.WP-tbl tbody tr:not(.WP-tbl-total):hover .WP-tbl-name { color:var(--ember); }
.WP-tbl-name { transition:color .15s; }
.WP-tbl-total { background:rgba(37,99,235,0.04); animation:wp-total-in .3s ease both; }
@keyframes wp-total-in { from{opacity:0} to{opacity:1} }
.WP-tbl-total td { font-family:var(--font-mono); font-weight: 900; color:var(--amt-strong); border-top:1.5px solid var(--border); border-bottom:none; padding-top:8px; padding-bottom:8px; }
.WP-tbl-total td:first-child { text-transform:uppercase; letter-spacing:.8px; font-size: 8px; color:var(--text-3); }
.WP-tbl-settled td:first-child { border-left:3px solid #C47E0A; opacity:0.7; }
.WP-tbl-outstanding td:first-child { border-left:3px solid rgba(239,68,68,0.4); }
.WP-amt { font-family:var(--font-mono); font-weight: 800; white-space:nowrap; color:var(--text-1); font-size: 11px; }
.WP-amt-due   { color:var(--amt-strong); }
.WP-amt-paid  { color:var(--amt-strong); }
.WP-amt-zero  { color:var(--text-4); }
.WP-tbl-name  { font-weight: 800; color:var(--ember); line-height:1.3; font-size: 12px; text-transform:uppercase; letter-spacing:.25px; }
.WP-tbl-sub   { font-family:var(--font-mono); font-size: 8.5px; color:var(--text-4); margin-top:2px; }

/* ── Sub-worker collapse toggle (sits directly beneath the head worker's
   name) + numbered badge on each sub row, mirroring the numbered-chip
   pattern used in Manpower Register's Associate Names column. ── */
.LP-subtoggle {
  display:inline-flex; align-items:center; gap:4px; margin-top:4px; padding:4px 9px;
  border-radius:100px; border:1px solid var(--ember-border); background:var(--ember-ghost);
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase;
  color:#1D4ED8; cursor:pointer; transition:all .16s ease;
}
.LP-subtoggle svg { transition:transform .18s ease; }
.LP-subtoggle.open svg { transform:rotate(180deg); }
.LP-subtoggle:hover { background:linear-gradient(135deg,var(--ember-mid,#3B82F6),var(--ember)); color:#fff; border-color:transparent; }
.LP-subnum {
  display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px;
  border-radius:50%; background:var(--ember); color:#fff; font-family:var(--font-mono);
  font-size: 8px; font-weight:800;
}
/* Full-width row separating the Person and Client groups inside one merged
   table, standing in for what used to be two separate panel headers. */
.WP-tbl-section td {
  background:var(--ember-ghost); border-bottom:1px solid var(--ember-border);
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px;
  text-transform:uppercase; color:#2563EB; padding:7px 12px; text-align:left;
}
.WP-tbl-section:first-child td { border-top:none; }

.WP-pay-section { padding:12px; border-top:1px solid var(--border); background:var(--off-white); }
.WP-pay-section-title {
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase;
  color:var(--text-3); margin-bottom:10px;
}
.WP-field-grid { display:grid; grid-template-columns:1.15fr 0.95fr 1.25fr; gap:12px; align-items:end; }
@media(max-width:760px){ .WP-field-grid { grid-template-columns:1fr; } }
.WP-field { display:flex; flex-direction:column; gap:5px; min-width:0; }
/* 2×2 layout: Amount gets its own full-width row up top, Mode + Notes share
   the row underneath — used by the "Enter amount & payment mode" step. */
.WP-field-grid-2col { grid-template-columns:1fr 1fr; row-gap:12px; }
@media(max-width:520px){ .WP-field-grid-2col { grid-template-columns:1fr; } }
.WP-field-full { grid-column:1/-1; }
.WP-field-full .WP-amount-wrap { min-height:44px; padding:0 13px; }
.WP-field-full .WP-amount-prefix { font-size: 14px; }
.WP-field-full .WP-amount-input { font-size: 15px; }
.WP-field-lbl { font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:1.1px; text-transform:uppercase; color:var(--text-3); }
.WP-amount-wrap {
  display:flex; align-items:center; gap:7px; min-height:38px; box-sizing:border-box;
  background:var(--white); border:1px solid var(--border); border-radius:8px; padding:0 11px;
  transition:all 0.15s;
}
.WP-amount-wrap:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.WP-amount-prefix { font-family:var(--font-mono); font-size: 11px; font-weight: 800; color:var(--text-4); }
.WP-amount-input {
  flex:1; background:transparent; border:none; padding:7px 0; min-width:0; width:100%;
  font-family:var(--font-mono); font-size: 11.5px; font-weight: 800; color:var(--text-1); outline:none;
}
.WP-select {
  background:var(--white); border:1px solid var(--border); border-radius:7px;
  padding:7px 10px; font-family:var(--font-mono); font-size: 9px; color:var(--text-1);
  outline:none; cursor:pointer; transition:all 0.15s;
}
.WP-select:focus { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.WP-notes {
  background:var(--white); border:1px solid var(--border); border-radius:8px;
  padding:7px 11px; font-family:var(--font-body); font-size: 9px; color:var(--text-1);
  outline:none; resize:none; transition:all 0.15s; box-sizing:border-box; width:100%;
  min-height:38px;
}
.WP-notes:focus { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.WP-pay-footer {
  display:flex; align-items:center; justify-content:flex-end; gap:10px; margin-top:12px; flex-wrap:wrap;
  padding:11px 14px; background:var(--white); border:1px solid var(--border); border-radius:10px;
  animation:wp-pick-in .3s ease both; box-shadow:0 2px 10px rgba(0,0,0,.03);
}
.WP-pay-total { flex:1; font-family:var(--font-mono); font-size: 8.5px; color:var(--text-4); min-width:180px; }
.WP-pay-total span { font-weight: 800; color:var(--text-1); }

/* ── PAY PANEL — allow Mode dropdown to escape (no clipping) ── */
.LP-pay-panel { overflow:visible !important; }
.LP-pay-panel .WP-panel-head { border-radius:10.5px 10.5px 0 0; }
.LP-pay-panel .WP-pay-section { border-radius:0 0 10.5px 10.5px; }
.LP-pay-panel { position:relative; }

/* ── SUCCESS CELEBRATION (confetti/ring/stamp) — same colorful language as
   Credit Management's post-save celebration, played over the Record Payment
   panel instead of a plain toast. ── */
@keyframes lp-cel-stamp-in {
  0%  { transform: scale(2.5) rotate(-8deg); opacity: 0; }
  50% { transform: scale(0.92) rotate(2deg); opacity: 1; }
  70% { transform: scale(1.08) rotate(-2deg); }
  85% { transform: scale(0.97) rotate(1deg); }
  100%{ transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes lp-cel-check-glow {
  0%, 100% { box-shadow: 0 8px 28px rgba(29,78,216,0.28), 0 0 0 0 rgba(29,78,216,0.35); }
  50%      { box-shadow: 0 8px 28px rgba(29,78,216,0.28), 0 0 0 10px rgba(29,78,216,0); }
}
@keyframes lp-cel-confetti-pop { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
@keyframes lp-cel-confetti-fly {
  0%   { opacity:1; transform:translate(0,0) rotate(0deg); }
  100% { opacity:0; transform:translate(var(--lp-cel-drift,0), -130px) rotate(720deg); }
}
@keyframes lp-cel-ring-pulse {
  0%   { transform:scale(0.6); opacity:0.8; }
  100% { transform:scale(2.2); opacity:0; }
}
@keyframes lp-cel-sparkle-twinkle {
  0%   { opacity:0; transform:scale(0) rotate(0deg); }
  40%  { opacity:1; transform:scale(1.15) rotate(45deg); }
  70%  { opacity:1; transform:scale(0.9) rotate(75deg); }
  100% { opacity:0; transform:scale(0.4) rotate(120deg); }
}
@keyframes lp-cel-badge-shimmer {
  0%   { transform: translateX(-120%) skewX(-15deg); }
  100% { transform: translateX(220%) skewX(-15deg); }
}
.LP-cel-ov {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #F1F5F9 0%, #F3E8FF 55%, #EDE9FE 100%);
  border: 2px solid #BFDBFE;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 20; border-radius: 10.5px; overflow: hidden;
}
.LP-cel-ring {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  border: 2.5px solid rgba(29,78,216,0.18);
  animation: lp-cel-ring-pulse 1s ease-out 0.1s both;
}
.LP-cel-ring2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  border: 1.5px solid rgba(29,78,216,0.09);
  animation: lp-cel-ring-pulse 1.1s ease-out 0.25s both;
}
.LP-cel-sparkle {
  position: absolute; z-index: 2; pointer-events: none;
  animation: lp-cel-sparkle-twinkle 1s ease-out both;
}
.LP-cel-stamp-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  animation: lp-cel-stamp-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
  position: relative; z-index: 1;
}
.LP-cel-check {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  border: 3px solid rgba(29,78,216,0.18);
  box-shadow: 0 8px 28px rgba(29,78,216,0.28);
  display: flex; align-items: center; justify-content: center;
  animation: lp-cel-check-glow 1.4s ease-in-out 0.7s infinite;
}
.LP-cel-txt {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 17px; font-weight: 900; color: #2563EB;
  letter-spacing: 3px; text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(29,78,216,0.10);
}
.LP-cel-sub {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10.5px; color: #92400e; margin-top: -8px; font-weight: 700;
}
.LP-cel-amt-badge {
  position: relative;
  padding: 8px 20px;
  background: #fff;
  border: 1.5px solid #BFDBFE;
  box-shadow: 0 2px 12px rgba(29,78,216,0.10);
  border-radius: 100px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 15px; font-weight: 800; color: #2563EB; margin-top: 4px;
  overflow: hidden;
}
.LP-cel-amt-badge::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent);
  animation: lp-cel-badge-shimmer 1.6s ease-in-out 0.9s infinite;
}
.LP-cel-confetti {
  position: absolute; border-radius: 3px;
  animation: lp-cel-confetti-fly 1.1s ease-out both;
}

/* ── STEP 2 CARD (matches Step 1 structure) ── */
.LP-step2-card {
  border:1px solid var(--ember-border); border-radius:11px; background:var(--white);
  margin-bottom:12px; animation:wp-pick-in .3s ease both; overflow:visible;
  box-shadow:0 2px 8px rgba(0,0,0,.03);
}
.LP-step2-head {
  display:flex; align-items:center; gap:7px; padding:8px 12px;
  background:linear-gradient(135deg,rgba(37,99,235,.10),rgba(37,99,235,.04));
  border-bottom:1px solid var(--ember-border); border-radius:9.5px 9.5px 0 0;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:1.2px; text-transform:uppercase; color:#3B82F6;
}
.LP-step2-body { padding:13px 12px; }
.LP-dd-trigger { min-height:46px; box-sizing:border-box; border-radius:10px; }
.LP-dd-trigger.open { border-bottom-left-radius:0; border-bottom-right-radius:0; }

/* ── CLIENT PICK LIST (Step 1 — choose bills to close) ── */
@keyframes wp-pick-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
.WP-client-pick { border:1px solid var(--ember-border); border-radius:11px; overflow:hidden; margin-bottom:14px; background:var(--white); animation:wp-pick-in .3s ease both; box-shadow:0 1px 5px rgba(0,0,0,.03); }
.WP-pick-head { display:flex; align-items:center; gap:7px; padding:8px 12px; background:linear-gradient(135deg,rgba(37,99,235,.10),rgba(37,99,235,.04)); border-bottom:1px solid var(--ember-border); font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.2px; text-transform:uppercase; color:#3B82F6; }
.WP-pick-actions { margin-left:auto; display:flex; gap:5px; }
.WP-pick-link {
  display:inline-flex; align-items:center; gap:4px;
  border-radius:100px; font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:.8px; cursor:pointer; text-transform:uppercase; padding:5px 12px;
  transition:all .18s cubic-bezier(.34,1.56,.64,1);
}
.WP-pick-link.all {
  background:linear-gradient(135deg,#3B82F6,#2563EB); border:1px solid transparent;
  color:#fff; box-shadow:0 2px 8px rgba(37,99,235,.3);
}
.WP-pick-link.all:hover { transform:translateY(-1px) scale(1.03); box-shadow:0 4px 14px rgba(37,99,235,.45); }
.WP-pick-link.none {
  background:var(--white); border:1px solid var(--border-2); color:var(--text-3);
}
.WP-pick-link.none:hover { border-color:var(--error); color:var(--error); background:#fff5f5; transform:translateY(-1px); }
.WP-pick-link:active { transform:translateY(0) scale(.95); }
.WP-pick-link:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }
/* Scrollable body — keeps the panel a fixed, sane height no matter whether
   there are 2 clients or 50+; the header/footer above and below stay put.
   A real <table> now (was a stack of label rows) — proper columns, no
   initials-avatar clutter, sticky header while scrolling. */
.WP-pick-tablewrap {
  max-height:300px; overflow-y:auto; overflow-x:auto;
  scrollbar-width:thin; scrollbar-color:var(--ember-mid) transparent;
}
.WP-pick-tablewrap::-webkit-scrollbar { width:6px; height:6px; }
.WP-pick-tablewrap::-webkit-scrollbar-track { background:transparent; }
.WP-pick-tablewrap::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#60A5FA,#2563EB); border-radius:100px; }
.WP-pick-tablewrap::-webkit-scrollbar-thumb:hover { background:var(--ember); }
.WP-pick-table { width:100%; border-collapse:collapse; }
.WP-pick-table thead th {
  position:sticky; top:0; z-index:1;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.2px; text-transform:uppercase;
  color:var(--text-3,#27364A); padding:8px 10px; border-bottom:2px solid var(--ember,#2563EB);
  background:var(--surface-2,#E9EEF5); text-align:left; white-space:nowrap;
}
.WP-pick-table tbody tr {
  cursor:pointer; border-bottom:1px solid var(--border);
  transition:background .15s, box-shadow .15s;
  animation:lp-subrow-in .5s cubic-bezier(.34,1.56,.64,1) both;
}
.WP-pick-table tbody tr:last-child { border-bottom:none; }
.WP-pick-table tbody tr:hover { background:rgba(37,99,235,.06); }
.WP-pick-table tbody tr.on { background:linear-gradient(90deg,rgba(37,99,235,.12),rgba(37,99,235,.04)); box-shadow:inset 3px 0 0 var(--ember); }
.WP-pick-table td {
  padding:10px 12px; font-family:var(--font-body); font-size: 10px; color:var(--text-1);
  vertical-align:middle; white-space:nowrap;
}
.WP-pick-table td.WP-pick-chkcell { width:30px; cursor:default; }
.WP-pick-table td.WP-pick-num { font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; color:var(--ember); }
.WP-pick-table td.WP-pick-primary { font-weight: 800; font-size: 11.5px; color:var(--text-1); }
.WP-pick-table td.WP-pick-meta { font-family:var(--font-mono); font-size: 7.5px; color:var(--text-4); letter-spacing:.3px; }
.WP-pick-table td.WP-pick-amt { font-family:var(--font-mono); font-size: 10px; font-weight: 800; color:var(--amt-strong); text-align:right; }
.WP-pick-chk {
  appearance:none; -webkit-appearance:none; width:19px; height:19px; margin:0;
  border:2px solid var(--border-2); border-radius:6px; background:var(--white);
  cursor:pointer; flex-shrink:0; position:relative; transition:all .18s;
}
.WP-pick-chk:hover { border-color:var(--ember-mid); transform:scale(1.06); }
.WP-pick-chk:checked { background:linear-gradient(135deg,#60A5FA,#2563EB); border-color:transparent; box-shadow:0 2px 8px rgba(37,99,235,.4); }
.WP-pick-chk:checked::after {
  content:''; position:absolute; left:5.5px; top:2px; width:4px; height:9px;
  border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg);
  animation:lp-chk-pop .18s ease both;
}
@keyframes lp-chk-pop { from{opacity:0; transform:rotate(45deg) scale(.5)} to{opacity:1; transform:rotate(45deg) scale(1)} }
.WP-pick-foot { padding:7px 12px; background:var(--off-white); border-top:1px solid var(--border); font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:.3px; }
.WP-pick-foot b { color:var(--text-1); }
/* Calm "waiting on you" placeholder — replaces step 2's table before a
   client is picked. Distinct from .warn-blink: this is normal guidance,
   not an error, so it stays quiet with a gentle up-nudge instead of
   sitting there as flat static text. */
.WP-pick-empty-hint {
  display:flex; align-items:center; justify-content:center; gap:7px;
  padding:22px 14px; font-family:var(--font-mono); font-size: 8.5px; font-weight: 700;
  color:var(--text-4); letter-spacing:.3px; text-align:center;
  animation:wp-empty-nudge 1.8s ease-in-out infinite;
}
@keyframes wp-empty-nudge { 0%,100% { transform:translateY(0); opacity:.85; } 50% { transform:translateY(-3px); opacity:1; } }
/* Only shown after a failed submit attempt — blinks a couple of times to
   read as an alert, not a permanent instruction sitting under the table. */
.WP-pick-foot.warn-blink { background:rgba(217,59,85,.08); color:var(--error); font-weight: 700; animation:wp-warn-blink 1.1s ease-in-out 2; }
@keyframes wp-warn-blink { 0%,100% { opacity:1; } 50% { opacity:.35; } }
.LP-pick-prog { height:3px; border-radius:100px; background:var(--white); border:1px solid var(--border); overflow:hidden; margin-top:5px; }
.LP-pick-prog i { display:block; height:100%; border-radius:100px; background:linear-gradient(90deg,#60A5FA,#2563EB); transition:width .45s ease; }
.LP-max-chip {
  flex-shrink:0; padding:4px 10px; border-radius:100px; border:1px solid var(--ember-border);
  background:var(--ember-ghost); color:var(--ember); font-family:var(--font-mono);
  font-size: 8px; font-weight: 800; letter-spacing:1px; text-transform:uppercase;
  cursor:pointer; transition:all .18s;
}
.LP-max-chip:hover:not(:disabled) { background:var(--ember); color:#fff; transform:translateY(-1px); box-shadow:0 3px 10px rgba(37,99,235,.3); }
.LP-max-chip:disabled { opacity:.4; cursor:not-allowed; }

.WP-split-preview {
  background:linear-gradient(135deg,rgba(37,99,235,0.07),rgba(37,99,235,0.02));
  border:1.5px solid rgba(37,99,235,0.32); border-radius:12px; overflow:hidden; margin-top:16px;
  animation:wp-pick-in .3s ease both;
  box-shadow:0 6px 20px rgba(37,99,235,.1);
}
.WP-split-head {
  padding:11px 16px; background:linear-gradient(135deg,#60A5FA,#2563EB); border-bottom:1px solid rgba(37,99,235,0.15);
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.8px;
  text-transform:uppercase; color:#fff; display:flex; align-items:center; gap:7px;
}
.WP-split-tbl { width:100%; border-collapse:collapse; }
.WP-split-tbl th {
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase;
  color:var(--text-4); padding:9px 14px; border-bottom:1px solid rgba(37,99,235,0.15);
  background:rgba(37,99,235,0.05); text-align:left;
}
.WP-split-tbl td { padding:10px 14px; font-family:var(--font-mono); font-size: 9.5px; border-bottom:1px solid rgba(37,99,235,0.1); }
.WP-split-tbl tr:last-child td { border-bottom:none; }
.WP-split-closed { color:#C47E0A !important; font-weight: 800; }
.WP-split-bar {
  display:flex; align-items:center; gap:18px; padding:12px 16px;
  border-top:1px solid rgba(37,99,235,0.15); background:rgba(37,99,235,0.08); flex-wrap:wrap;
}
.WP-split-bar-item { font-family:var(--font-mono); font-size: 9px; color:var(--text-4); }
.WP-split-bar-item b { color:var(--text-1); }

.WP-history-list { max-height:540px; overflow-y:auto; }
.WP-view-all-btn {
  display:flex; align-items:center; justify-content:center; gap:7px; width:100%;
  padding:12px 16px; border:none; border-top:1px solid var(--border); background:var(--off-white);
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase;
  color:var(--ember); cursor:pointer; transition:all .15s;
}
.WP-view-all-btn:hover { background:var(--ember-ghost); gap:10px; }
.WP-history-empty {
  padding:32px 16px; text-align:center;
  font-family:var(--font-mono); font-size: 8px; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-4);
}
.WP-session { padding:13px 16px; border-bottom:1px solid var(--border); }
.WP-session:last-child { border-bottom:none; }
.WP-session-header { display:flex; align-items:flex-start; gap:10px; cursor:pointer; }
.WP-session-icon {
  width:32px; height:32px; border-radius:8px; flex-shrink:0;
  background:rgba(22,163,74,0.12); display:flex; align-items:center; justify-content:center;
}
.WP-session-amount { font-family:var(--font-mono); font-size: 11.5px; font-weight: 800; color:var(--text-1); }
.WP-session-meta { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); margin-top:2px; }
.WP-session-names { font-weight: 800; color:var(--text-1); }
.WP-session-allocs {
  margin-top:10px; padding:12px; background:var(--off-white); border-radius:10px; border:1px solid var(--border);
  display:flex; flex-direction:column; gap:9px;
}
.WP-alloc-row {
  display:flex; align-items:center; justify-content:space-between; padding:5px 0;
  border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size: 9px;
}
.WP-alloc-row:last-child { border-bottom:none; }
.WP-alloc-name { color:var(--text-2); font-weight: 700; }
.WP-alloc-closed  { color:#C47E0A; font-weight: 800; }
.WP-alloc-partial { color:#3B82F6; font-weight: 800; }

/* ── ALLOCATION ROW — simple, single-line, professional ── */
.LP-alloc-card {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:8px 12px; border-radius:8px; background:var(--white); border:1px solid var(--border);
  transition:border-color .15s;
}
.LP-alloc-card:hover { border-color:var(--border-2); }
.LP-alloc-left { display:flex; align-items:center; gap:8px; min-width:0; }
.LP-alloc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.LP-alloc-dot.closed  { background:#C47E0A; }
.LP-alloc-dot.partial { background:#3B82F6; }
.LP-alloc-card-name { font-family:var(--font-body); font-size: 10px; font-weight: 700; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.LP-alloc-status { font-family:var(--font-mono); font-size: 8px; letter-spacing:.5px; text-transform:uppercase; color:var(--text-4); }
.LP-alloc-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.LP-alloc-flow { font-family:var(--font-mono); font-size: 8.5px; color:var(--text-4); white-space:nowrap; }
.LP-alloc-paid { font-family:var(--font-mono); font-size: 10px; font-weight: 800; color:var(--amt-strong); white-space:nowrap; }

.WP-toast {
  position:fixed; bottom:24px; right:24px; z-index:9999;
  display:flex; align-items:center; gap:10px; padding:12px 18px;
  border-radius:10px; font-family:var(--font-mono); font-size: 9px; font-weight: 800;
  letter-spacing:.5px; box-shadow:0 8px 24px rgba(0,0,0,0.2);
  animation:wp-toast-in 0.2s ease both;
}
@keyframes wp-toast-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
.WP-toast-ok  { background:#C47E0A; color:#fff; }
.WP-toast-err { background:#D93B55; color:#fff; }

.WP-loading {
  display:flex; align-items:center; justify-content:center; padding:64px 20px; gap:10px;
  font-family:var(--font-mono); font-size: 8px; letter-spacing:2px; text-transform:uppercase; color:var(--text-4);
}
.WP-loading-dot {
  width:6px; height:6px; border-radius:50%; background:#60A5FA; display:inline-block;
  animation:wp-bounce 1s ease-in-out infinite;
}
.WP-loading-dot:nth-child(2) { animation-delay:.15s; }
.WP-loading-dot:nth-child(3) { animation-delay:.3s; }
@keyframes wp-bounce { 0%,80%,100%{transform:scale(.8);opacity:.4} 40%{transform:scale(1.2);opacity:1} }

.WP-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; }
.WP-empty-icon {
  width:54px; height:54px; border-radius:14px;
  background:var(--ember-ghost); border:1.5px solid var(--ember-border);
  display:flex; align-items:center; justify-content:center;
}
.WP-empty-text { font-family:var(--font-mono); font-size: 8px; letter-spacing:2px; text-transform:uppercase; color:var(--text-4); text-align:center; max-width:280px; }

.WP-setup-card {
  background:var(--white); border:1.5px solid var(--ember-border); border-radius:14px;
  padding:36px; text-align:center; max-width:480px; margin:40px auto;
}
.WP-setup-title { font-family:var(--font-body); font-size: 17.5px; font-weight: 800; font-style:normal; color:var(--text-1); margin:0 0 8px; }
.WP-setup-body { font-family:var(--font-body); font-size: 10.5px; color:var(--text-3); margin-bottom:22px; line-height:1.6; }
`,re=()=>({Authorization:`Bearer ${localStorage.getItem(`token`)}`}),ie=()=>new Date().toISOString().split(`T`)[0],T=e=>e.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2}),ae=e=>new Date(e).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`}),oe=e=>new Date(e).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}),se=e=>{let t=new Date(e);return{date:t.toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}),time:t.toLocaleTimeString(`en-IN`,{hour:`2-digit`,minute:`2-digit`,hour12:!0})}},ce=e=>{let t=e.trim().split(/\s+/);return t.length>=2?(t[0][0]+t[t.length-1][0]).toUpperCase():e.slice(0,2).toUpperCase()},le=e=>b[e%b.length],ue=e=>e.salary_type===`monthly`&&e.monthly_salary>0?`${e.monthly_salary.toLocaleString(`en-IN`)}/mo`:e.salary_type===`weekly`&&e.daily_rate>0?`${(e.daily_rate||0).toLocaleString(`en-IN`)}/wk`:`${(e.daily_rate||0).toLocaleString(`en-IN`)}/shift`;function de(e,t){let n={},r=t;for(let t of e){let e=parseFloat(Math.min(r,t.outstanding).toFixed(2)),i=parseFloat(Math.max(0,t.outstanding-e).toFixed(2));n[t.key]={allocated:e,outstanding_after:i,is_closed:i<=.005},r=parseFloat((r-e).toFixed(4)),r<=.005&&(r=0)}return n}function E({n:e,s:t=16,c:n=`currentColor`}){let r={pay:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z`,back:`M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z`,check:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z`,money:`M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z`,expand:`M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z`,collapse:`M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z`,search:`M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z`,trash:`M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z`,labour:`M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z`,split:`M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z`,setup:`M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z`,history:`M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z`};return(0,y.jsx)(`svg`,{width:t,height:t,viewBox:`0 0 24 24`,fill:n,style:{flexShrink:0},children:(0,y.jsx)(`path`,{d:r[e]??r.pay})})}var fe={trending:`M13 7h8m0 0v8m0-8l-8 8-4-4-6 6`,cash:`M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z`,scale:`M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3`,user:`M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z`,list:`M4 6h16M4 10h16M4 14h16M4 18h16`,circle:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,tag:`M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z`,arrowUp:`M5 10l7-7m0 0l7 7m-7-7v18`,arrowDown:`M19 14l-7 7m0 0l-7-7m7 7V3`,mobile:`M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z`,transfer:`M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4`,document:`M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z`,more:`M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z`,searchS:`M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z`,x:`M6 18L18 6M6 6l12 12`,checkS:`M5 13l4 4L19 7`,chevronDown:`M5 8l7 7 7-7`,inbox:`M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4`,alert:`M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1.5 1.5 0 003.5 20.5h17a1.5 1.5 0 001.39-2.46L13.71 3.86a1.5 1.5 0 00-2.42 0z`};function D({n:e,s:t=16,c:n=`currentColor`}){return(0,y.jsx)(`svg`,{width:t,height:t,viewBox:`0 0 24 24`,fill:`none`,stroke:n,strokeWidth:1.75,strokeLinecap:`round`,strokeLinejoin:`round`,style:{flexShrink:0},children:(0,y.jsx)(`path`,{d:fe[e]??fe.list})})}var pe=[`#2563EB`,`#3B82F6`,`#BFDBFE`,`#fde68a`,`#F3E8FF`,`#fff`,`#EDE9FE`,`#60A5FA`,`#fef3c7`];function me({seed:e=0,count:t=22}){return(0,y.jsx)(y.Fragment,{children:Array.from({length:t},(t,n)=>{let r=n+e*7;return{id:n,color:pe[r%pe.length],left:`${4+r*6.1%92}%`,top:`${12+r*8.3%62}%`,delay:`${r*55%550}ms`,size:5+r%4*3,rotate:r*41,drift:(r%5-2)*18}}).map(e=>(0,y.jsx)(`div`,{className:`LP-cel-confetti`,style:{left:e.left,top:e.top,width:e.size,height:e.size,background:e.color,animationDelay:e.delay,animationDuration:`${900+e.id*55%500}ms`,"--lp-cel-drift":`${e.drift}px`,transform:`rotate(${e.rotate}deg)`}},e.id))})}function he(){return(0,y.jsx)(y.Fragment,{children:Array.from({length:10},(e,t)=>({id:t,left:`${50+Math.cos(t/10*Math.PI*2)*(30+t%3*6)}%`,top:`${42+Math.sin(t/10*Math.PI*2)*(26+t%3*5)}%`,delay:`${300+t*70}ms`,size:6+t%3*3})).map(e=>(0,y.jsx)(`svg`,{className:`LP-cel-sparkle`,width:e.size,height:e.size,viewBox:`0 0 24 24`,style:{left:e.left,top:e.top,animationDelay:e.delay},fill:`#3B82F6`,children:(0,y.jsx)(`path`,{d:`M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z`})},e.id))})}function ge({title:e,sub:t,amountText:n,onDone:r,duration:i=1800}){let[a,o]=(0,_.useState)(!1);return(0,_.useEffect)(()=>{let e=setTimeout(r,i),t=setTimeout(()=>o(!0),450);return()=>{clearTimeout(e),clearTimeout(t)}},[]),(0,y.jsxs)(`div`,{className:`LP-cel-ov`,children:[(0,y.jsx)(me,{seed:0}),a&&(0,y.jsx)(me,{seed:1,count:16}),(0,y.jsx)(he,{}),(0,y.jsx)(`div`,{className:`LP-cel-ring`}),(0,y.jsx)(`div`,{className:`LP-cel-ring2`}),(0,y.jsxs)(`div`,{className:`LP-cel-stamp-wrap`,children:[(0,y.jsx)(`div`,{className:`LP-cel-check`,children:(0,y.jsx)(`svg`,{width:42,height:42,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,y.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})}),(0,y.jsx)(`div`,{className:`LP-cel-txt`,children:e}),t&&(0,y.jsx)(`div`,{className:`LP-cel-sub`,children:t}),n&&(0,y.jsx)(`div`,{className:`LP-cel-amt-badge`,children:n})]})]})}function O({value:e,duration:t=900}){let[n,r]=(0,_.useState)(0),i=(0,_.useRef)(null),a=(0,_.useRef)(0),o=(0,_.useRef)(0);return(0,_.useEffect)(()=>{let n=o.current,s=e;i.current=null;let c=e=>{i.current||=e;let l=Math.min((e-i.current)/t,1),u=l===1?1:1-2**(-10*l);r(Math.round(n+(s-n)*u)),l<1?a.current=requestAnimationFrame(c):o.current=s};return a.current=requestAnimationFrame(c),()=>cancelAnimationFrame(a.current)},[e,t]),(0,y.jsx)(y.Fragment,{children:n.toLocaleString(`en-IN`)})}function _e({mode:e}){let t=w[e]??w.other;return(0,y.jsxs)(`span`,{className:`LP-mode-badge`,style:{background:t.color+`18`,color:t.color,borderColor:t.color+`44`},children:[(0,y.jsx)(D,{n:t.icon,s:11,c:t.color}),t.label]})}function ve({name:e,before:t,after:n,allocated:r,closed:i}){return(0,y.jsxs)(`div`,{className:`LP-alloc-card ${i?`closed`:`partial`}`,children:[(0,y.jsxs)(`div`,{className:`LP-alloc-left`,children:[(0,y.jsx)(`span`,{className:`LP-alloc-dot ${i?`closed`:`partial`}`}),(0,y.jsx)(`span`,{className:`LP-alloc-card-name`,children:e}),(0,y.jsx)(`span`,{className:`LP-alloc-status`,children:i?`Closed`:`Partial`})]}),(0,y.jsxs)(`div`,{className:`LP-alloc-right`,children:[(0,y.jsxs)(`span`,{className:`LP-alloc-flow`,children:[`₹`,T(t),` → ₹`,T(n)]}),(0,y.jsxs)(`span`,{className:`LP-alloc-paid`,children:[`₹`,T(r)]})]})]})}function ye({value:e,onChange:t}){let[n,r]=(0,_.useState)(!1);(0,_.useEffect)(()=>{if(n)return o(),()=>u()},[n]);let[i,s]=(0,_.useState)(``),[l,d]=(0,_.useState)(null),f=(0,_.useRef)(null),p=(0,_.useRef)(null),m=(0,_.useRef)(null),h=(0,_.useRef)(null),g=a(n,r);c(n,r,p,h),(0,_.useEffect)(()=>{let e=e=>{let t=e.target;!f.current?.contains(t)&&!p.current?.contains(t)&&(r(!1),s(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]),(0,_.useEffect)(()=>{n&&m.current&&setTimeout(()=>m.current?.focus(),50)},[n]),(0,_.useLayoutEffect)(()=>{if(!n||!f.current){d(null);return}let e=()=>{if(!f.current)return;let e=f.current.getBoundingClientRect(),t=Math.max(e.width,220),n=e.left;n+t>window.innerWidth-8&&(n=window.innerWidth-t-8),n<8&&(n=8);let r=Math.max(160,window.innerHeight-e.bottom-8);d({position:`fixed`,left:n,top:e.bottom+6,width:t,maxHeight:Math.min(320,r),zIndex:2147483647})};return e(),window.addEventListener(`scroll`,e,!0),window.addEventListener(`resize`,e),()=>{window.removeEventListener(`scroll`,e,!0),window.removeEventListener(`resize`,e)}},[n]);let b=Object.entries(w).filter(([,e])=>e.label.toLowerCase().includes(i.toLowerCase())),x=e=>{t(e),r(!1),s(``)};return(0,y.jsxs)(`div`,{className:`LP-dd LP-dd-mode`,ref:f,children:[(0,y.jsxs)(`button`,{type:`button`,ref:h,className:`LP-dd-trigger${n?` open`:``}`,onClick:()=>r(e=>!e),onKeyDown:g,children:[(0,y.jsx)(`span`,{className:`LP-dd-content`,children:w[e]?(0,y.jsx)(`span`,{className:`LP-dd-mode-txt`,children:w[e].label}):(0,y.jsx)(`span`,{className:`LP-dd-ph`,children:`Select mode…`})}),(0,y.jsx)(`span`,{className:`LP-dd-chevron${n?` open`:``}`,children:(0,y.jsx)(D,{n:`chevronDown`,s:13})})]}),n&&l&&(0,v.createPortal)((0,y.jsx)(`div`,{ref:e=>{p.current=e},className:`LP-dd-panel LP-dd-panel-mode`,style:l,children:(0,y.jsx)(`div`,{className:`LP-dd-list LP-dd-list-mode`,children:b.map(([t])=>(0,y.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":e===t,className:`LP-dd-item LP-dd-item-mode${e===t?` sel`:``}`,onClick:()=>x(t),children:[(0,y.jsx)(`span`,{className:`LP-dd-check${e===t?` checked`:``}`,children:e===t&&(0,y.jsx)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:3.2,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,y.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})}),(0,y.jsx)(`span`,{className:`LP-dd-mode-txt`,children:w[t].label})]},t))})}),document.body)]})}function be({value:e,onChange:t}){let[n,r]=(0,_.useState)(!1);(0,_.useEffect)(()=>{if(n)return o(),()=>u()},[n]);let[i,s]=(0,_.useState)(``),l=(0,_.useRef)(null),d=(0,_.useRef)(null),f=(0,_.useRef)(null),p=(0,_.useRef)(null),m=a(n,r);c(n,r,f,p),(0,_.useEffect)(()=>{let e=e=>{l.current&&!l.current.contains(e.target)&&(r(!1),s(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]),(0,_.useEffect)(()=>{n&&d.current&&setTimeout(()=>d.current?.focus(),50)},[n]);let h=i.toLowerCase(),g=`all modes`.includes(h),v=Object.entries(w).filter(([,e])=>e.label.toLowerCase().includes(h)),b=e=>{t(e),r(!1),s(``)};return(0,y.jsxs)(`div`,{className:`LP-dd LP-dd-filter`,ref:l,children:[(0,y.jsxs)(`button`,{type:`button`,ref:p,className:`LP-dd-trigger${n?` open`:``}`,onClick:()=>r(e=>!e),onKeyDown:m,children:[(0,y.jsx)(`span`,{className:`LP-dd-content`,children:e&&w[e]?(0,y.jsx)(_e,{mode:e}):(0,y.jsx)(`span`,{className:`LP-dd-sel-label`,children:`All Modes`})}),(0,y.jsx)(`span`,{className:`LP-dd-chevron${n?` open`:``}`,children:(0,y.jsx)(D,{n:`chevronDown`,s:13})})]}),n&&(0,y.jsxs)(`div`,{className:`LP-dd-panel`,ref:f,children:[(0,y.jsxs)(`div`,{className:`LP-dd-search-row`,children:[(0,y.jsx)(D,{n:`searchS`,s:13,c:`var(--text-4)`}),(0,y.jsx)(`input`,{ref:d,className:`LP-dd-search`,placeholder:`Search payment mode…`,value:i,onChange:e=>s(e.target.value)}),i&&(0,y.jsx)(`button`,{type:`button`,className:`LP-dd-clr`,onClick:()=>s(``),children:(0,y.jsx)(D,{n:`x`,s:10})})]}),(0,y.jsxs)(`div`,{className:`LP-dd-list`,children:[g&&(0,y.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":e===``,className:`LP-dd-item${e===``?` sel`:``}`,onClick:()=>b(``),children:[(0,y.jsxs)(`span`,{className:`LP-dd-item-main`,children:[(0,y.jsx)(`span`,{className:`LP-dd-sel-label`,children:`All Modes`}),(0,y.jsx)(`span`,{className:`LP-dd-item-sub`,children:`Every payment method`})]}),e===``&&(0,y.jsx)(D,{n:`checkS`,s:12,c:`var(--ember)`})]}),v.length===0&&!g?(0,y.jsxs)(`div`,{className:`LP-dd-empty`,children:[(0,y.jsx)(D,{n:`inbox`,s:14,c:`var(--text-4)`}),`No results for "`,i,`"`]}):v.map(([t])=>(0,y.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":e===t,className:`LP-dd-item${e===t?` sel`:``}`,onClick:()=>b(t),children:[(0,y.jsx)(_e,{mode:t}),e===t&&(0,y.jsx)(D,{n:`checkS`,s:12,c:`var(--ember)`})]},t))]}),(0,y.jsxs)(`div`,{className:`LP-dd-footer`,children:[v.length+ +!!g,` options`]})]})]})}function xe({options:e,value:t,onChange:n,placeholder:r,disabled:i=!1,emptyMsg:s=`No options`}){let[l,d]=(0,_.useState)(!1);(0,_.useEffect)(()=>{if(l)return o(),()=>u()},[l]);let[f,p]=(0,_.useState)(``),m=(0,_.useRef)(null),h=(0,_.useRef)(null),g=(0,_.useRef)(null),v=(0,_.useRef)(null),b=a(l,d);c(l,d,g,v),(0,_.useEffect)(()=>{let e=e=>{m.current&&!m.current.contains(e.target)&&(d(!1),p(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]),(0,_.useEffect)(()=>{l&&h.current&&setTimeout(()=>h.current?.focus(),50)},[l]);let x=e.filter(e=>e.label.toLowerCase().includes(f.toLowerCase())),ee=e.find(e=>e.value===t),S=e=>{n(e),d(!1),p(``)};return(0,y.jsxs)(`div`,{className:`LP-dd`,ref:m,style:i?{opacity:.5,pointerEvents:`none`}:void 0,children:[(0,y.jsxs)(`button`,{type:`button`,ref:v,className:`LP-dd-trigger${l?` open`:``}`,onClick:()=>!i&&d(e=>!e),onKeyDown:b,children:[(0,y.jsx)(`span`,{className:`LP-dd-content`,children:ee?(0,y.jsx)(`span`,{className:`LP-dd-sel-label`,children:ee.label}):(0,y.jsx)(`span`,{className:`LP-dd-ph`,children:r})}),(0,y.jsx)(`span`,{className:`LP-dd-chevron${l?` open`:``}`,children:(0,y.jsx)(D,{n:`chevronDown`,s:13})})]}),l&&(0,y.jsxs)(`div`,{className:`LP-dd-panel`,ref:g,children:[(0,y.jsxs)(`div`,{className:`LP-dd-search-row`,children:[(0,y.jsx)(D,{n:`searchS`,s:13,c:`var(--text-4)`}),(0,y.jsx)(`input`,{ref:h,className:`LP-dd-search`,placeholder:`Search…`,value:f,onChange:e=>p(e.target.value)}),f&&(0,y.jsx)(`button`,{type:`button`,className:`LP-dd-clr`,onClick:()=>p(``),children:(0,y.jsx)(D,{n:`x`,s:10})})]}),(0,y.jsxs)(`div`,{className:`LP-dd-list`,children:[t&&(0,y.jsxs)(`div`,{className:`LP-dd-item LP-dd-clear`,role:`option`,tabIndex:-1,"aria-selected":!1,onClick:()=>S(``),children:[(0,y.jsx)(D,{n:`x`,s:10,c:`var(--text-4)`}),(0,y.jsx)(`span`,{children:`Clear selection`})]}),x.length===0?(0,y.jsxs)(`div`,{className:`LP-dd-empty`,children:[(0,y.jsx)(D,{n:`inbox`,s:14,c:`var(--text-4)`}),f?`No results for "${f}"`:s]}):x.map(e=>(0,y.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":t===e.value,className:`LP-dd-item${t===e.value?` sel`:``}`,onClick:()=>S(e.value),children:[(0,y.jsxs)(`span`,{className:`LP-dd-item-main`,children:[(0,y.jsx)(`span`,{className:`LP-dd-sel-label`,children:e.label}),e.sub&&(0,y.jsx)(`span`,{className:`LP-dd-item-sub`,children:e.sub})]}),t===e.value&&(0,y.jsx)(D,{n:`checkS`,s:12,c:`var(--ember)`})]},e.value))]}),(0,y.jsxs)(`div`,{className:`LP-dd-footer`,children:[x.length,` / `,e.length]})]})]})}function Se(){let[e]=(0,_.useState)(()=>l()),[t,n]=(0,_.useState)([]),[a,o]=(0,_.useState)(null),[c,u]=(0,_.useState)(null),[d,v]=(0,_.useState)(!1),[b,fe]=(0,_.useState)(null),[pe,me]=(0,_.useState)(!0),[he,Se]=(0,_.useState)(!1),[Ce,we]=(0,_.useState)(!1),[Te,Ee]=(0,_.useState)(!1),[De,Oe]=(0,_.useState)(!1),[ke,Ae]=(0,_.useState)(``),[je,Me]=(0,_.useState)(`all`),[Ne,Pe]=(0,_.useState)(1),[k,Fe]=(0,_.useState)(``),[Ie,Le]=(0,_.useState)(`cash`),[Re,ze]=(0,_.useState)(``),[A,j]=(0,_.useState)([]),[M,N]=(0,_.useState)([]),[Be,Ve]=(0,_.useState)(!1),[He,Ue]=(0,_.useState)(null),[We,Ge]=(0,_.useState)(!1),[Ke,qe]=(0,_.useState)(``),[Je,Ye]=(0,_.useState)(``),[P,Xe]=(0,_.useState)(``),[F,Ze]=(0,_.useState)(``),[Qe,$e]=(0,_.useState)(1),[et,tt]=(0,_.useState)(null),[I,nt]=(0,_.useState)(`workers`),[L,rt]=(0,_.useState)([]),[R,it]=(0,_.useState)(null),[at,ot]=(0,_.useState)(!1),[st,ct]=(0,_.useState)(``),[z,lt]=(0,_.useState)(``),[B,ut]=(0,_.useState)(``),[V,dt]=(0,_.useState)(``),[ft,pt]=(0,_.useState)(1),[mt,ht]=(0,_.useState)(null),gt=(0,_.useRef)(!1),_t=(0,_.useRef)(null);r(_t);let[vt,yt]=(0,_.useState)([]),[bt,xt]=(0,_.useState)([]),[St,Ct]=(0,_.useState)([]),[wt,Tt]=(0,_.useState)([]),[H,Et]=(0,_.useState)(!0),[Dt,Ot]=(0,_.useState)(!1),[kt,At]=(0,_.useState)(!1),[U,jt]=(0,_.useState)(``),[W,Mt]=(0,_.useState)(``),[Nt,Pt]=(0,_.useState)(``),[G,Ft]=(0,_.useState)(``),[It,Lt]=(0,_.useState)(``),K=(e,t)=>{e===`ok`?i.success(t):i.error(t)},Rt=(0,_.useCallback)(async()=>{me(!0);try{let e=await f.get(`/api/workforce/payment/workers`),t=e.data?.data??e.data;n(Array.isArray(t)?t:[]),o(e.data?.summary??null),Ee(!1)}catch(e){let t=e?.response?.status;t===500||t===404?Ee(!0):K(`err`,`Failed to load workers`)}finally{me(!1)}},[]);(0,_.useEffect)(()=>{Rt()},[Rt]);let zt=(0,_.useCallback)(async e=>{ot(!0);try{let t={},n=e?.search??st,r=e?.mode??z,i=e?.from??B,a=e?.to??V;n&&(t.search=n),r&&(t.mode=r),i&&(t.from_date=i),a&&(t.to_date=a);let o=await f.get(`/api/workforce/payment/sessions`,{params:t}),s=o.data?.data??[];rt(Array.isArray(s)?s:[]),it(o.data?.summary??null)}catch{K(`err`,`Failed to load payment history`)}finally{ot(!1)}},[st,z,B,V]);(0,_.useEffect)(()=>{I===`payments`&&!gt.current&&(gt.current=!0,zt())},[I,zt]),(0,_.useEffect)(()=>{if(!gt.current)return;let e=setTimeout(()=>zt(),350);return()=>clearTimeout(e)},[st,z,B,V]),(0,_.useEffect)(()=>{pt(1)},[st,z,B,V]),(0,_.useEffect)(()=>{$e(1)},[Ke,Je,P,F]),(0,_.useEffect)(()=>{(async()=>{try{let{data:e}=await f.get(`master-data`,{headers:re()});yt(e.categories||[]),xt(e.sub_categories||[]),Ct(e.bio_data||[]),Tt(e.sub_names||[])}catch{}})()},[]),(0,_.useEffect)(()=>{if(!c)return;let e=c.worker.name.toLowerCase().trim(),t=St.find(t=>t.name.toLowerCase().trim()===e);jt(t?String(t.id):``);let n=vt.find(e=>(e.type||``).toLowerCase()===`expense`&&/labou?r|wage|salar|worker/i.test(e.name));Mt(n?String(n.id):``);let r=c.worker.sub_category_id,i=r?bt.find(e=>e.id===Number(r)&&(!n||e.category_id===n.id)):void 0;if(!i&&c.worker.trade){let e=c.worker.trade.trim().toLowerCase();i=bt.find(t=>(!n||t.category_id===n.id)&&t.name.trim().toLowerCase()===e)}Pt(i?String(i.id):``);let a=c.earnings_breakdown?.subs??[];if(a.length>0){let e=[...a].sort((e,t)=>t.earned-e.earned)[0].sub_name,n=t?wt.find(n=>n.bio_data_id===t.id&&n.alternate_name.trim().toLowerCase()===e.trim().toLowerCase()):void 0;Ft(n?`id:${n.id}`:`name:${e}`)}else Ft(``);Lt(a.length>0?`Wage disbursement — ${a.map(e=>e.sub_name).join(`, `)} → ${c.worker.name}`:`Wage disbursement — ${c.worker.name}`)},[c?.worker.id,St,vt,bt,wt]);let Bt=async()=>{Oe(!0);try{await f.get(`/api/workforce/payment/setup`),K(`ok`,`Database ready!`),Ee(!1),await Rt()}catch{K(`err`,`Setup failed — check server logs`)}finally{Oe(!1)}},Vt=async e=>{Se(!0),Fe(``),Le(`cash`),ze(``),Ue(null),j([]),Ge(!1),qe(``),Ye(``),Xe(``),Ze(``),$e(1),tt(null),v(!1);try{let t=await f.get(`/api/workforce/payment/workers/${e}`);u(t.data?.data??t.data)}catch{K(`err`,`Failed to load worker`)}finally{Se(!1)}},Ht=async()=>{if(!G)return null;if(G.startsWith(`id:`))return+G.slice(3);if(!G.startsWith(`name:`)||!U)return null;let e=G.slice(5).trim(),t=wt.find(t=>t.bio_data_id===+U&&t.alternate_name.trim().toLowerCase()===e.toLowerCase());if(t)return t.id;try{let t=await f.post(`sub-names`,{alternate_name:e,bio_data_id:+U},{headers:re()}),n=t.data?.data??t.data;if(n?.id)return Tt(t=>[...t,{id:n.id,alternate_name:e,bio_data_id:+U}]),n.id;let r=await f.get(`sub-names`,{headers:re()}),i=r.data?.data??r.data??[],a=Array.isArray(i)?i:[],o=a.find(t=>t.bio_data_id===+U&&(t.alternate_name||``).trim().toLowerCase()===e.toLowerCase());return o?(Tt(a),o.id):null}catch{return null}},Ut=async()=>{if(!c)return;let e=parseFloat(k);if(!e||e<=0){K(`err`,`Enter a valid amount`);return}if(A.length===0){Ve(!0),K(`err`,`Select at least one client to pay against`);return}if(M.length===0){Ve(!0),K(`err`,`Select at least one worker to settle`);return}let t=q.reduce((e,t)=>e+t.outstanding,0);if(e>t+.005){K(`err`,`Amount exceeds selected worker's outstanding (₹${T(t)})`);return}if(H){if(!U){K(`err`,`Select a Party Name for Cash Book sync (or turn sync off)`);return}if(!W){K(`err`,`Select an Expense Account Head for Cash Book sync (or turn sync off)`);return}}we(!0);try{let t=await f.post(`/api/workforce/payment/workers/${c.worker.id}/pay`,{amount:e,payment_mode:Ie,notes:Re||null,clients:A,persons:M}),n=t.data?.data??t.data,r=!1,i=0,a=[];if(H)try{let t=G?await Ht():null,o=It||`Wage disbursement — ${c.worker.name}`,s=!t&&G&&$?` · Sub: ${$}`:``,l=(e,n,r)=>{let i={transaction_date:ie(),amount:e,payment_mode:ee[Ie]||`Cash`,category_id:+W,bio_data_id:+U,narration:(n?`${o} · ${n}${r}`:`${o}${r}`)+s};return Nt&&(i.sub_category_id=+Nt),t&&(i.sub_name_id=t),n&&(i.client_name=n),i},u=((n?.sessions||[]).reduce((e,t)=>!e||t.id>e.id?t:e,null)?.allocations??[]).filter(e=>e.allocated>.005).map(e=>({amt:e.allocated,client:e.client_name,statusTag:e.is_closed?` (bill closed)`:` (partial)`}));if(u.length===0){let t=de(q.map(e=>({key:e.key,outstanding:e.outstanding})),e);for(let e of q){let n=t[e.key];n&&n.allocated>.005&&u.push({amt:n.allocated,client:e.client_name,statusTag:n.is_closed?` (bill closed)`:` (partial)`})}}let d=u.reduce((e,t)=>e+t.amt,0),p=parseFloat((e-d).toFixed(2));p>.005&&u.push({amt:p,client:null,statusTag:` (advance / unallocated)`}),u.length===0&&u.push({amt:e,client:A.length>0?A.join(`, `):null,statusTag:``});for(let e of u)try{await f.post(`daybook`,l(e.amt,e.client,e.statusTag),{headers:re()}),i++}catch{a.push(e.client?`${e.client} (₹${T(e.amt)})`:`Advance ₹${T(e.amt)}`)}r=i>0}catch{K(`err`,`Payment saved, but Cash Book sync failed — add the entry manually in Cash Book`)}u(n),Fe(``),Le(`cash`),ze(``),j([]),N([]),Ve(!1),H?a.length>0?K(`err`,`Payment saved — ${i} Cash Book ${i===1?`entry`:`entries`} synced, but failed for: ${a.join(`, `)}. Add manually in Cash Book.`):r&&fe({show:!0,sub:`${c.worker.name} · ${i} Cash Book ${i===1?`entry`:`entries`} synced`,amountText:`₹${T(e)}`}):fe({show:!0,sub:`Paid to ${c.worker.name}`,amountText:`₹${T(e)}`}),Rt(),window.dispatchEvent(new Event(`erp:notifications-refresh`))}catch(e){let t=e?.response?.data?.error;K(`err`,t||`Payment failed`)}finally{we(!1)}},[Wt,Gt]=(0,_.useState)({open:!1,sessionId:null,label:``,loading:!1}),Kt=e=>{Gt({open:!0,sessionId:e.id,label:`₹${T(e.total_amount)} · ${oe(e.paid_at)} · ${x[e.payment_mode]||e.payment_mode}`,loading:!1})},qt=async()=>{if(Wt.sessionId){Gt(e=>({...e,loading:!0}));try{if(await f.delete(`/api/workforce/payment/sessions/${Wt.sessionId}`),c){let e=await f.get(`/api/workforce/payment/workers/${c.worker.id}`);u(e.data?.data??e.data)}K(`ok`,`Payment deleted`),Rt(),gt.current&&zt()}catch{K(`err`,`Failed to delete`)}finally{Gt({open:!1,sessionId:null,label:``,loading:!1})}}},Jt=(e,t)=>`${e}::${t}`,Yt=(0,_.useMemo)(()=>{if(!c)return[];let e=[];return c.client_breakdown.filter(e=>A.includes(e.client_name)).forEach(t=>{(t.persons||[]).filter(e=>e.outstanding>.005).forEach(n=>{e.push({...n,key:Jt(t.client_name,n.person),client_name:t.client_name})})}),e},[c,A]),q=(0,_.useMemo)(()=>Yt.filter(e=>M.includes(e.key)),[Yt,M]),Xt=(0,_.useMemo)(()=>c?c.client_breakdown.filter(e=>A.includes(e.client_name)).reduce((e,t)=>e+t.outstanding,0):0,[c,A]),Zt=(0,_.useMemo)(()=>{let e=parseFloat(k);return!c||!e||e<=0||q.length===0?null:de(q.map(e=>({key:e.key,outstanding:e.outstanding})),e)},[k,c,q]),J=(0,_.useMemo)(()=>q.reduce((e,t)=>e+t.outstanding,0),[q]),Qt=e=>{j(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),N([])},$t=e=>{N(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},Y=(0,_.useMemo)(()=>t.filter(e=>{let t=ke.toLowerCase();return!(t&&!e.name.toLowerCase().includes(t)&&!(e.trade||``).toLowerCase().includes(t)||je===`unpaid`&&e.balance<=0||je===`clear`&&e.balance>0)}).sort((e,t)=>t.balance-e.balance),[t,ke,je]);(0,_.useEffect)(()=>{Pe(1)},[ke,je]);let en=Math.max(1,Math.ceil(Y.length/S)),X=Math.min(Ne,en),tn=(0,_.useMemo)(()=>Y.slice((X-1)*S,X*S),[Y,X]),nn=(0,_.useMemo)(()=>{let e=[];for(let t=1;t<=en;t++)t===1||t===en||Math.abs(t-X)<=1?e.push(t):e[e.length-1]!==`…`&&e.push(`…`);return e},[en,X]),rn=Math.max(1,Math.ceil(L.length/C)),Z=Math.min(ft,rn),an=(0,_.useMemo)(()=>L.slice((Z-1)*C,Z*C),[L,Z]),on=(0,_.useMemo)(()=>te(rn,Z),[rn,Z]),Q=parseFloat(k)||0,sn=c?Math.max(0,c.balance-Q):0,cn=St.map(e=>({value:String(e.id),label:e.name,sub:e.category_name})),ln=vt.filter(e=>!e.type||e.type.toLowerCase()===`expense`).map(e=>({value:String(e.id),label:e.name})),un=W?bt.filter(e=>e.category_id===+W).map(e=>({value:String(e.id),label:e.name})):[],dn=U?wt.filter(e=>e.bio_data_id===+U):[],fn=c?.earnings_breakdown?.subs.map(e=>e.sub_name)??[],pn=[...dn.map(e=>({value:`id:${e.id}`,label:e.alternate_name,sub:`Core Records`})),...fn.filter(e=>!dn.some(t=>t.alternate_name.trim().toLowerCase()===e.trim().toLowerCase())).map(e=>({value:`name:${e}`,label:e,sub:`Manpower Register`}))],mn=St.find(e=>String(e.id)===U)?.name||``,hn=vt.find(e=>String(e.id)===W)?.name||``,gn=bt.find(e=>String(e.id)===Nt)?.name||``,$=G.startsWith(`id:`)?wt.find(e=>String(e.id)===G.slice(3))?.alternate_name||``:G.startsWith(`name:`)?G.slice(5):``,_n=c&&Zt?q.map(e=>({client:e.client_name,person:e.person,isOwn:e.is_own,alloc:Zt[e.key]})).filter(e=>e.alloc&&e.alloc.allocated>.005):[],vn=c?St.find(e=>e.name.toLowerCase().trim()===c.worker.name.toLowerCase().trim()):void 0;return(0,y.jsxs)(`div`,{className:`WP-page`,ref:_t,children:[(0,y.jsxs)(`style`,{children:[p,ne]}),(0,y.jsxs)(`div`,{className:`WP-body`,children:[(0,y.jsx)(`div`,{className:`ERP-hdr`,children:(0,y.jsxs)(`div`,{className:`ERP-hdr-left`,children:[(0,y.jsxs)(`div`,{className:`ERP-eyebrow`,children:[(0,y.jsx)(`span`,{className:`ERP-eyebrow-line`}),(0,y.jsx)(`span`,{className:`ERP-eyebrow-dot`}),`Workforce · Wage Disbursements`]}),(0,y.jsxs)(`h1`,{className:`ERP-title MD-page-title`,children:[`Wage `,(0,y.jsx)(`span`,{className:`ERP-title-em`,children:`Disbursements`})]})]})}),(0,y.jsx)(`div`,{className:`ERP-divider`}),Te&&!pe&&(0,y.jsxs)(`div`,{className:`WP-setup-card`,children:[(0,y.jsx)(`div`,{style:{fontSize:37,marginBottom:14},children:`🛠️`}),(0,y.jsx)(`div`,{className:`WP-setup-title`,children:`One-time Setup Required`}),(0,y.jsxs)(`div`,{className:`WP-setup-body`,children:[`The new worker-centric payment system needs two database tables (`,(0,y.jsx)(`code`,{children:`labour_payment_sessions`}),` and `,(0,y.jsx)(`code`,{children:`labour_payment_allocations`}),`). Click below to create them automatically — or run `,(0,y.jsx)(`code`,{children:`php artisan migrate`}),` in your terminal.`]}),(0,y.jsxs)(`button`,{className:`WP-btn WP-btn-primary`,onClick:Bt,disabled:De,children:[(0,y.jsx)(E,{n:`setup`,s:14,c:`#fff`}),De?`Creating Tables…`:`Create Tables Now`]})]}),c&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`button`,{className:`WP-back-btn`,onClick:()=>u(null),children:[(0,y.jsx)(`span`,{className:`WP-back-btn-ico`,children:(0,y.jsx)(E,{n:`back`,s:12})}),` All Workers`]}),We?(()=>{let t=c.sessions.filter(e=>{if(Je&&e.payment_mode!==Je)return!1;let t=new Date(e.paid_at).toISOString().split(`T`)[0];if(P&&t<P||F&&t>F)return!1;if(!Ke)return!0;let n=Ke.toLowerCase();return(e.notes||``).toLowerCase().includes(n)||e.allocations.some(e=>e.client_name.toLowerCase().includes(n))}),n=Math.max(1,Math.ceil(t.length/C)),r=Math.min(Qe,n),i=t.slice((r-1)*C,r*C),a=te(n,r);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`LP-hero`,style:{marginBottom:20},children:[(0,y.jsx)(`div`,{className:`LP-hero-avatar`,style:{background:le(c.worker.id)},children:ce(c.worker.name)}),(0,y.jsxs)(`div`,{style:{flex:1,minWidth:0,position:`relative`,zIndex:1},children:[(0,y.jsxs)(`div`,{className:`LP-hero-name`,children:[c.worker.name,` — Full Payment History`]}),(0,y.jsxs)(`div`,{className:`LP-hero-chips`,children:[(0,y.jsxs)(`span`,{className:`LP-chip`,children:[(0,y.jsx)(`b`,{children:c.sessions.length}),` Total Transaction`,c.sessions.length===1?``:`s`]}),(0,y.jsxs)(`span`,{className:`LP-chip`,children:[`Paid `,(0,y.jsxs)(`b`,{children:[`₹`,T(c.total_paid)]})]})]})]}),(0,y.jsxs)(`button`,{className:`WP-back-btn`,style:{marginBottom:0,flexShrink:0},onClick:()=>Ge(!1),children:[(0,y.jsx)(`span`,{className:`WP-back-btn-ico`,children:(0,y.jsx)(E,{n:`back`,s:12})}),` Back to Worker`]})]}),(0,y.jsxs)(`div`,{className:`ERP-tbl-card`,children:[(0,y.jsxs)(`div`,{className:`ERP-tbl-hdr`,children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`div`,{className:`ERP-tbl-title`,children:`All Transactions`}),(0,y.jsxs)(`div`,{className:`ERP-tbl-sub`,children:[`Every payment recorded for `,c.worker.name,` — click a row for the client-wise split`]})]}),(0,y.jsxs)(`div`,{className:`LP-tbl-toolbar`,children:[(0,y.jsxs)(`div`,{className:`LP-date-range`,children:[(0,y.jsx)(`div`,{className:`LP-date-field`,children:(0,y.jsx)(h,{value:P,onChange:Xe,max:F})}),(0,y.jsx)(`span`,{className:`LP-date-sep`,children:`to`}),(0,y.jsx)(`div`,{className:`LP-date-field`,children:(0,y.jsx)(h,{value:F,onChange:Ze,min:P})}),(P||F)&&(0,y.jsx)(`button`,{type:`button`,className:`LP-date-clear`,title:`Clear date range`,onClick:()=>{Xe(``),Ze(``)},children:(0,y.jsx)(D,{n:`x`,s:13})})]}),(0,y.jsx)(be,{value:Je,onChange:Ye}),(0,y.jsxs)(`div`,{className:`WP-search-wrap`,children:[(0,y.jsx)(`span`,{className:`WP-search-icon`,children:(0,y.jsx)(E,{n:`search`,s:15,c:`var(--text-4)`})}),(0,y.jsx)(`input`,{type:`text`,className:`WP-search`,placeholder:`Search client, notes…`,value:Ke,onChange:e=>qe(e.target.value)})]}),(0,y.jsxs)(`span`,{className:`ERP-tbl-count`,children:[t.length,` / `,c.sessions.length]})]})]}),t.length===0?(0,y.jsxs)(`div`,{className:`ERP-empty`,children:[(0,y.jsx)(`div`,{className:`ERP-empty-icon`,children:(0,y.jsx)(E,{n:`history`,s:24,c:`var(--ember)`})}),(0,y.jsx)(`div`,{className:`ERP-empty-title`,children:`No transactions found`}),(0,y.jsx)(`div`,{className:`ERP-empty-sub`,children:Ke||Je||P||F?`No payments match your search or filter`:`No payments recorded yet`})]}):(0,y.jsx)(`div`,{className:`ERP-tbl-scroll LP-tbl-scroll`,children:(0,y.jsxs)(`table`,{className:`ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl`,children:[(0,y.jsxs)(`colgroup`,{children:[(0,y.jsx)(`col`,{style:{width:52}}),(0,y.jsx)(`col`,{style:{width:`16%`}}),(0,y.jsx)(`col`,{style:{width:`20%`}}),(0,y.jsx)(`col`,{style:{width:`12%`}}),(0,y.jsx)(`col`,{style:{width:`10%`}}),(0,y.jsx)(`col`,{style:{width:`21%`}}),(0,y.jsx)(`col`,{style:{width:`9%`}})]}),(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`S.No`}),(0,y.jsx)(`th`,{children:`Date & Time`}),(0,y.jsx)(`th`,{children:`Amount`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Mode`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Clients`}),(0,y.jsx)(`th`,{children:`Paid To (top client)`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Action`})]})}),(0,y.jsx)(`tbody`,{className:`LP-page-fade`,children:i.map((t,n)=>{let i=t.allocations.filter(e=>e.allocated>0),a=se(t.paid_at),o=i.slice().sort((e,t)=>t.allocated-e.allocated)[0];return(0,y.jsxs)(_.Fragment,{children:[(0,y.jsxs)(`tr`,{className:`LP-row LP-pay-row`,style:{animationDelay:`${n*.035}s`},onClick:()=>tt(et===t.id?null:t.id),children:[(0,y.jsx)(`td`,{className:`ERP-t-num`,children:(r-1)*C+n+1}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{className:`LP-dt-cell`,children:[(0,y.jsx)(`span`,{className:`LP-dt-date`,children:a.date}),(0,y.jsx)(`span`,{className:`LP-dt-time`,children:a.time})]})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`WP-amt WP-amt-paid LP-amt-highlight`,children:[`₹`,T(t.total_amount)]})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(_e,{mode:t.payment_mode})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`ERP-badge id-num`,children:i.length})}),(0,y.jsx)(`td`,{children:o?(0,y.jsxs)(`div`,{className:`LP-paidto`,children:[(0,y.jsx)(`span`,{className:`LP-worker-name LP-paidto-name`,children:o.client_name}),i.length>1&&(0,y.jsxs)(`span`,{className:`LP-paidto-more`,children:[`+`,i.length-1]})]}):(0,y.jsx)(`span`,{style:{fontSize:10,color:`var(--text-4)`,fontStyle:`italic`},children:t.notes||`No allocation`})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsxs)(`div`,{style:{display:`flex`,gap:4,justifyContent:`center`,alignItems:`center`},children:[s(e)?(0,y.jsx)(`button`,{className:`WP-btn WP-btn-red WP-btn-sm`,onClick:e=>{e.stopPropagation(),Kt(t)},title:`Delete payment`,children:(0,y.jsx)(E,{n:`trash`,s:11,c:`#fff`})}):(0,y.jsx)(g,{name:t.created_by_name}),(0,y.jsx)(E,{n:et===t.id?`collapse`:`expand`,s:16,c:`var(--text-4)`})]})})]}),et===t.id&&(0,y.jsx)(`tr`,{className:`LP-expand-row`,children:(0,y.jsx)(`td`,{colSpan:7,children:(0,y.jsxs)(`div`,{className:`WP-session-allocs`,style:{padding:`12px 6px`},children:[(0,y.jsxs)(`div`,{className:`LP-expand-meta`,children:[(0,y.jsxs)(`span`,{children:[`Session `,t.id]}),(0,y.jsxs)(`span`,{children:[a.date,`, `,a.time]}),(0,y.jsx)(`span`,{children:x[t.payment_mode]||t.payment_mode}),t.notes&&(0,y.jsx)(`span`,{children:t.notes})]}),i.length===0?(0,y.jsx)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,color:`var(--text-4)`,padding:`4px 0`},children:`No allocations recorded`}):i.map(e=>(0,y.jsx)(ve,{name:e.client_name,before:e.outstanding_before,after:e.outstanding_after,allocated:e.allocated,closed:e.is_closed},e.id))]})})})]},t.id)})},r)]})}),t.length>C&&(0,y.jsxs)(`div`,{className:`LP-pgn`,children:[(0,y.jsxs)(`span`,{className:`LP-pgn-info`,children:[`Showing `,(0,y.jsx)(`b`,{children:(r-1)*C+1}),`–`,(0,y.jsx)(`b`,{children:Math.min(r*C,t.length)}),` of `,(0,y.jsx)(`b`,{children:t.length}),` transactions`]}),(0,y.jsx)(`button`,{className:`LP-pgn-btn`,disabled:r<=1,onClick:()=>$e(r-1),children:`‹ Prev`}),a.map((e,t)=>e===`…`?(0,y.jsx)(`span`,{className:`LP-pgn-dots`,children:`…`},`hdots-${t}`):(0,y.jsx)(`button`,{className:`LP-pgn-btn ${e===r?`on`:``}`,onClick:()=>$e(e),children:e},e)),(0,y.jsx)(`button`,{className:`LP-pgn-btn`,disabled:r>=n,onClick:()=>$e(r+1),children:`Next ›`})]})]})]})})():(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`LP-hero`,children:[(0,y.jsx)(`div`,{className:`LP-hero-avatar`,style:{background:le(c.worker.id)},children:ce(c.worker.name)}),(0,y.jsxs)(`div`,{style:{flex:1,minWidth:0,position:`relative`,zIndex:1},children:[(0,y.jsx)(`div`,{className:`LP-hero-name`,children:c.worker.name}),(0,y.jsxs)(`div`,{className:`LP-hero-chips`,children:[c.worker.trade&&(0,y.jsxs)(`span`,{className:`LP-chip`,children:[(0,y.jsx)(E,{n:`labour`,s:10,c:`var(--ember)`}),c.worker.trade]}),(0,y.jsxs)(`span`,{className:`LP-chip`,children:[(0,y.jsx)(E,{n:`money`,s:10,c:`var(--ember)`}),` ₹`,ue(c.worker)]}),(0,y.jsxs)(`span`,{className:`LP-chip`,children:[(0,y.jsx)(E,{n:`split`,s:10,c:`var(--ember)`}),` `,c.client_breakdown.length,` Client`,c.client_breakdown.length===1?``:`s`]}),(0,y.jsxs)(`span`,{className:`LP-chip`,children:[(0,y.jsx)(E,{n:`history`,s:10,c:`var(--ember)`}),` `,c.sessions.length,` Payment`,c.sessions.length===1?``:`s`]}),(0,y.jsx)(`span`,{className:`LP-chip`,style:c.balance>0?{borderColor:`var(--error-bd)`,background:`var(--error-bg)`,color:`var(--error)`}:{borderColor:`var(--success-bd)`,background:`var(--success-bg)`,color:`var(--success)`},children:c.balance>0?`● Balance Due`:`✓ All Clear`})]})]})]}),(0,y.jsxs)(`div`,{className:`ERP-stats`,children:[(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--success),#34D399)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Earned`}),(0,y.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--success)`,fontSize:13,fontWeight:800},children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:9.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(c.total_earned)})]})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--warn),var(--ember-mid))`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Paid So Far`}),(0,y.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--warn)`,fontSize:13,fontWeight:800},children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:9.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(c.total_paid)})]})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--error),#F87171)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Outstanding`}),(0,y.jsx)(`div`,{className:`ERP-stat-val`,style:{color:c.balance>0?`var(--error)`:`var(--success)`,fontSize:13,fontWeight:800},children:c.balance>0?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:9.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(c.balance)})]}):`✓ Clear`})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--info),#60A5FA)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Payments`}),(0,y.jsx)(`div`,{className:`ERP-stat-val`,style:{color:`var(--info)`,fontSize:13,fontWeight:800},children:(0,y.jsx)(O,{value:c.sessions.length})})]})]}),(0,y.jsx)(`div`,{className:`WP-layout`,children:(0,y.jsxs)(`div`,{className:`WP-panel`,children:[(0,y.jsxs)(`div`,{className:`WP-panel-head`,children:[(0,y.jsx)(`span`,{className:`LP-panel-ico`,children:(0,y.jsx)(E,{n:`labour`,s:14,c:`var(--ember)`})}),(0,y.jsx)(`span`,{className:`WP-panel-title`,children:`Earnings & Client Breakdown`}),(0,y.jsxs)(`span`,{className:`LP-count-pill`,children:[c.client_breakdown.length,` client`,c.client_breakdown.length===1?``:`s`]})]}),(0,y.jsx)(`div`,{style:{overflowX:`auto`},children:(0,y.jsxs)(`table`,{className:`WP-tbl WP-tbl-fixed`,children:[(0,y.jsxs)(`colgroup`,{children:[(0,y.jsx)(`col`,{style:{width:`6%`}}),(0,y.jsx)(`col`,{style:{width:`32%`}}),(0,y.jsx)(`col`,{style:{width:`12%`}}),(0,y.jsx)(`col`,{style:{width:`16%`}}),(0,y.jsx)(`col`,{style:{width:`14%`}}),(0,y.jsx)(`col`,{style:{width:`14%`}}),(0,y.jsx)(`col`,{style:{width:`13%`}})]}),(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{children:`No.`}),(0,y.jsx)(`th`,{children:`Name`}),(0,y.jsx)(`th`,{children:`Shifts`}),(0,y.jsx)(`th`,{children:`Earned`}),(0,y.jsx)(`th`,{children:`Paid`}),(0,y.jsx)(`th`,{children:`Outstanding`}),(0,y.jsx)(`th`,{children:`Status`})]})}),(0,y.jsxs)(`tbody`,{children:[c.earnings_breakdown&&c.earnings_breakdown.subs.length>0&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`tr`,{className:`WP-tbl-section`,children:(0,y.jsxs)(`td`,{colSpan:7,children:[`Earnings Breakdown — Own & Sub Workers · `,c.earnings_breakdown.subs.length,` sub worker`,c.earnings_breakdown.subs.length===1?``:`s`]})}),(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`td`,{className:`ERP-t-num`,children:(0,y.jsx)(`span`,{className:`LP-subnum`,children:`1`})}),(0,y.jsxs)(`td`,{children:[(0,y.jsx)(`div`,{className:`WP-tbl-name`,children:c.worker.name}),(0,y.jsx)(`div`,{className:`WP-tbl-sub`,children:`Own work · head worker`}),(0,y.jsxs)(`button`,{type:`button`,className:`LP-subtoggle${d?` open`:``}`,onClick:()=>v(e=>!e),children:[d?`Hide`:`Show`,` `,c.earnings_breakdown.subs.length,` sub worker`,c.earnings_breakdown.subs.length===1?``:`s`,(0,y.jsx)(D,{n:`chevronDown`,s:9,c:`currentColor`})]})]}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt`,children:c.earnings_breakdown.own.shifts})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`WP-amt`,children:[`₹`,T(c.earnings_breakdown.own.earned)]})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt WP-amt-zero`,children:`—`})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt WP-amt-zero`,children:`—`})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`ERP-badge clear`,children:[(0,y.jsx)(`span`,{className:`ERP-badge-dot`}),`Own`]})})]}),d&&c.earnings_breakdown.subs.map((e,t)=>(0,y.jsxs)(`tr`,{className:`LP-subrow-anim`,style:{animationDelay:`${t*.09}s`},children:[(0,y.jsx)(`td`,{className:`ERP-t-num`,children:(0,y.jsx)(`span`,{className:`LP-subnum`,children:t+2})}),(0,y.jsxs)(`td`,{children:[(0,y.jsx)(`div`,{className:`WP-tbl-name`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:6},children:e.sub_name}),(0,y.jsxs)(`div`,{className:`WP-tbl-sub`,children:[`referred by `,c.worker.name]})]}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt`,children:e.shifts||`—`})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`WP-amt`,children:[`₹`,T(e.earned)]})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt WP-amt-zero`,children:`—`})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt WP-amt-zero`,children:`—`})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`ERP-badge unpaid`,children:[(0,y.jsx)(`span`,{className:`ERP-badge-dot`}),`Sub`]})})]},e.sub_name)),(0,y.jsxs)(`tr`,{className:`WP-tbl-total`,children:[(0,y.jsx)(`td`,{}),(0,y.jsxs)(`td`,{children:[`TOTAL — `,c.worker.name]}),(0,y.jsx)(`td`,{}),(0,y.jsxs)(`td`,{children:[`₹`,T(c.total_earned)]}),(0,y.jsx)(`td`,{}),(0,y.jsx)(`td`,{}),(0,y.jsx)(`td`,{})]})]}),(0,y.jsx)(`tr`,{className:`WP-tbl-section`,children:(0,y.jsxs)(`td`,{colSpan:7,children:[`Client-wise Breakdown · `,c.client_breakdown.length,` client`,c.client_breakdown.length===1?``:`s`]})}),c.client_breakdown.map((e,t)=>{let n=e.outstanding<=0,r=e.earned>0?Math.min(100,Math.round(e.paid/e.earned*100)):0;return(0,y.jsxs)(`tr`,{className:`LP-anim-row ${n?`WP-tbl-settled`:`WP-tbl-outstanding`}`,style:{animationDelay:`${t*.06}s`},children:[(0,y.jsx)(`td`,{className:`ERP-t-num`,children:t+1}),(0,y.jsxs)(`td`,{children:[(0,y.jsx)(`div`,{className:`WP-tbl-name`,children:e.client_name}),(0,y.jsx)(`div`,{className:`LP-prog`,children:(0,y.jsx)(`i`,{style:{width:`${r}%`}})}),(0,y.jsxs)(`div`,{className:`LP-prog-lbl`,children:[r,`% settled`]})]}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt`,children:e.shifts})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`WP-amt`,children:[`₹`,T(e.earned)]})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`WP-amt ${e.paid>0?`WP-amt-paid`:`WP-amt-zero`}`,children:e.paid>0?`₹${T(e.paid)}`:`—`})}),(0,y.jsx)(`td`,{children:e.outstanding>0?(0,y.jsxs)(`span`,{className:`WP-amt WP-amt-due`,children:[`₹`,T(e.outstanding)]}):(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontWeight:800,color:`var(--success)`,fontSize:10.5},children:`✓ Clear`})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`ERP-badge ${n?`clear`:`unpaid`}`,children:[(0,y.jsx)(`span`,{className:`ERP-badge-dot`}),n?`Settled`:`Unpaid`]})})]},e.client_name)}),(0,y.jsxs)(`tr`,{className:`WP-tbl-total`,children:[(0,y.jsx)(`td`,{}),(0,y.jsx)(`td`,{children:`TOTAL`}),(0,y.jsx)(`td`,{children:c.client_breakdown.reduce((e,t)=>e+(t.shifts||0),0)}),(0,y.jsxs)(`td`,{children:[`₹`,T(c.total_earned)]}),(0,y.jsxs)(`td`,{children:[`₹`,T(c.total_paid)]}),(0,y.jsx)(`td`,{children:c.balance>0?`₹${T(c.balance)}`:`✓ Clear`}),(0,y.jsx)(`td`,{})]})]})]})})]})}),(0,y.jsxs)(`div`,{className:`WP-pay-layout`,children:[(0,y.jsxs)(`div`,{style:{position:`relative`},children:[b?.show&&(0,y.jsx)(ge,{title:`Payment Recorded!`,sub:b.sub,amountText:b.amountText,onDone:()=>fe(null)}),c.balance>0?(0,y.jsxs)(`div`,{className:`WP-panel LP-pay-panel`,children:[(0,y.jsxs)(`div`,{className:`WP-panel-head`,children:[(0,y.jsx)(`span`,{className:`LP-panel-ico`,children:(0,y.jsx)(E,{n:`money`,s:14,c:`var(--ember)`})}),(0,y.jsx)(`span`,{className:`WP-panel-title`,children:`Record Payment`}),(0,y.jsxs)(`span`,{className:`LP-count-pill`,children:[`₹`,T(c.balance),` due`]})]}),(0,y.jsxs)(`div`,{className:`WP-pay-section`,children:[(0,y.jsxs)(`div`,{className:`WP-client-pick`,children:[(0,y.jsxs)(`div`,{className:`WP-pick-head`,children:[(0,y.jsx)(`span`,{className:`LP-step`,children:`1`}),`Select clients to settle (oldest work first)`,(0,y.jsxs)(`div`,{className:`WP-pick-actions`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`WP-pick-link all`,onClick:()=>j(c.client_breakdown.filter(e=>e.outstanding>0).map(e=>e.client_name)),children:[(0,y.jsx)(D,{n:`checkS`,s:10,c:`currentColor`}),` All`]}),(0,y.jsxs)(`button`,{type:`button`,className:`WP-pick-link none`,onClick:()=>j([]),children:[(0,y.jsx)(D,{n:`x`,s:9,c:`currentColor`}),` None`]})]})]}),(0,y.jsx)(`div`,{className:`WP-pick-tablewrap`,children:(0,y.jsxs)(`table`,{className:`WP-pick-table`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{width:26}}),(0,y.jsx)(`th`,{style:{width:30},children:`No.`}),(0,y.jsx)(`th`,{children:`Client`}),(0,y.jsx)(`th`,{children:`Since`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Outstanding`})]})}),(0,y.jsx)(`tbody`,{children:c.client_breakdown.filter(e=>e.outstanding>0).map((e,t)=>{let n=A.includes(e.client_name);return(0,y.jsxs)(`tr`,{className:n?`on`:``,onClick:()=>Qt(e.client_name),style:{animationDelay:`${Math.min(t,10)*.07}s`},children:[(0,y.jsx)(`td`,{className:`WP-pick-chkcell`,onClick:e=>e.stopPropagation(),children:(0,y.jsx)(`input`,{type:`checkbox`,className:`WP-pick-chk`,checked:n,onChange:()=>Qt(e.client_name)})}),(0,y.jsx)(`td`,{className:`WP-pick-num`,children:t+1}),(0,y.jsx)(`td`,{className:`WP-pick-primary`,children:e.client_name}),(0,y.jsx)(`td`,{className:`WP-pick-meta`,children:e.first_date?new Date(e.first_date).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}):`—`}),(0,y.jsxs)(`td`,{className:`WP-pick-amt`,children:[`₹`,T(e.outstanding)]})]},e.client_name)})})]})}),(A.length>0||Be)&&(0,y.jsx)(`div`,{className:`WP-pick-foot${A.length===0?` warn-blink`:``}`,children:A.length>0?(0,y.jsxs)(y.Fragment,{children:[`Selected: `,(0,y.jsx)(`b`,{children:A.length}),` client`,A.length===1?``:`s`,` · Outstanding `,(0,y.jsxs)(`b`,{style:{color:`var(--amt-strong)`},children:[`₹`,T(Xt)]}),` of ₹`,T(c.balance),(0,y.jsx)(`div`,{className:`LP-pick-prog`,children:(0,y.jsx)(`i`,{style:{width:`${c.balance>0?Math.min(100,Math.round(Xt/c.balance*100)):0}%`}})})]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(D,{n:`alert`,s:10,c:`currentColor`}),` Select at least one client — payment will close bills in FIFO order`]})})]}),(0,y.jsxs)(`div`,{className:`WP-client-pick`,children:[(0,y.jsxs)(`div`,{className:`WP-pick-head`,children:[(0,y.jsx)(`span`,{className:`LP-step`,children:`2`}),`Select workers to settle (from the client`,A.length===1?``:`s`,` above)`,(0,y.jsxs)(`div`,{className:`WP-pick-actions`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`WP-pick-link all`,disabled:Yt.length===0,onClick:()=>N(Yt.map(e=>e.key)),children:[(0,y.jsx)(D,{n:`checkS`,s:10,c:`currentColor`}),` All`]}),(0,y.jsxs)(`button`,{type:`button`,className:`WP-pick-link none`,onClick:()=>N([]),children:[(0,y.jsx)(D,{n:`x`,s:9,c:`currentColor`}),` None`]})]})]}),A.length===0?Be?(0,y.jsxs)(`div`,{className:`WP-pick-foot warn-blink`,children:[(0,y.jsx)(D,{n:`alert`,s:10,c:`currentColor`}),` Select a client above first — the workers (own work + any sub-workers) working under them will list here.`]}):(0,y.jsxs)(`div`,{className:`WP-pick-empty-hint`,children:[(0,y.jsx)(D,{n:`arrowUp`,s:12,c:`var(--text-4)`}),`Pick a client above to load their workers`]}):Yt.length===0?(0,y.jsxs)(`div`,{className:`WP-pick-foot`,children:[`No outstanding balance for the selected client`,A.length===1?``:`s`,`.`]}):(0,y.jsx)(`div`,{className:`WP-pick-tablewrap`,children:(0,y.jsxs)(`table`,{className:`WP-pick-table`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{width:26}}),(0,y.jsx)(`th`,{style:{width:30},children:`No.`}),(0,y.jsx)(`th`,{children:`Manpower`}),(0,y.jsx)(`th`,{children:`Client`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Shifts`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Outstanding`})]})}),(0,y.jsx)(`tbody`,{children:Yt.map((e,t)=>{let n=M.includes(e.key),r=e.is_own?`${c.worker.name} · Own Work`:e.person;return(0,y.jsxs)(`tr`,{className:n?`on`:``,onClick:()=>$t(e.key),style:{animationDelay:`${Math.min(t,10)*.07}s`},children:[(0,y.jsx)(`td`,{className:`WP-pick-chkcell`,onClick:e=>e.stopPropagation(),children:(0,y.jsx)(`input`,{type:`checkbox`,className:`WP-pick-chk`,checked:n,onChange:()=>$t(e.key)})}),(0,y.jsx)(`td`,{className:`WP-pick-num`,children:t+1}),(0,y.jsx)(`td`,{className:`WP-pick-primary`,children:r}),(0,y.jsx)(`td`,{className:`WP-pick-meta`,children:e.client_name}),(0,y.jsx)(`td`,{className:`WP-pick-meta`,style:{textAlign:`center`},children:e.shifts}),(0,y.jsxs)(`td`,{className:`WP-pick-amt`,children:[`₹`,T(e.outstanding)]})]},e.key)})})]})}),(M.length>0||Be)&&A.length>0&&(0,y.jsx)(`div`,{className:`WP-pick-foot${M.length===0?` warn-blink`:``}`,children:M.length>0?(0,y.jsxs)(y.Fragment,{children:[`Selected: `,(0,y.jsx)(`b`,{children:M.length}),` worker(s) · Outstanding `,(0,y.jsxs)(`b`,{style:{color:`var(--amt-strong)`},children:[`₹`,T(J)]}),(0,y.jsx)(`div`,{className:`LP-pick-prog`,children:(0,y.jsx)(`i`,{style:{width:`${c.balance>0?Math.min(100,Math.round(J/c.balance*100)):0}%`}})})]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(D,{n:`alert`,s:10,c:`currentColor`}),` Select at least one worker — payment will close their bill(s) in FIFO order`]})})]}),(0,y.jsxs)(`div`,{className:`LP-step2-card`,children:[(0,y.jsxs)(`div`,{className:`LP-step2-head`,children:[(0,y.jsx)(`span`,{className:`LP-step`,children:`3`}),`Enter amount & payment mode`]}),(0,y.jsx)(`div`,{className:`LP-step2-body`,children:(0,y.jsxs)(`div`,{className:`WP-field-grid WP-field-grid-2col`,children:[(0,y.jsxs)(`div`,{className:`WP-field WP-field-full`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Amount`}),(0,y.jsxs)(`div`,{className:`WP-amount-wrap`,children:[(0,y.jsx)(`span`,{className:`WP-amount-prefix`,children:`₹`}),(0,y.jsx)(`input`,{type:`number`,className:`WP-amount-input`,placeholder:`0`,value:k,min:0,step:.01,onChange:e=>Fe(e.target.value)}),(0,y.jsx)(`button`,{type:`button`,className:`LP-max-chip`,title:`Fill selected worker's full outstanding`,disabled:J<=0,onClick:()=>Fe(J.toFixed(2)),children:`Max`})]})]}),(0,y.jsxs)(`div`,{className:`WP-field`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Mode`}),(0,y.jsx)(ye,{value:Ie,onChange:Le})]}),(0,y.jsxs)(`div`,{className:`WP-field`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Notes (optional)`}),(0,y.jsx)(`input`,{type:`text`,className:`WP-notes`,placeholder:`advance, partial payment…`,value:Re,onChange:e=>ze(e.target.value)})]})]})})]}),Zt&&(0,y.jsxs)(`div`,{className:`WP-split-preview`,children:[(0,y.jsxs)(`div`,{className:`WP-split-head`,children:[(0,y.jsx)(E,{n:`split`,s:13,c:`#fff`}),`Live Preview — Ordered Close (FIFO · oldest bill first)`]}),(0,y.jsx)(`div`,{style:{overflowX:`auto`},children:(0,y.jsxs)(`table`,{className:`WP-split-tbl`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{children:`Manpower`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Owed`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Gets`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`After`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Status`})]})}),(0,y.jsx)(`tbody`,{children:q.map(e=>{let t=Zt[e.key];return t?(0,y.jsxs)(`tr`,{children:[(0,y.jsxs)(`td`,{style:{fontWeight:700,color:`var(--text-1)`},children:[e.is_own?`${c.worker.name} (Own)`:e.person,(0,y.jsx)(`span`,{style:{display:`block`,fontSize:8.5,fontWeight:600,color:`var(--text-4)`},children:e.client_name})]}),(0,y.jsxs)(`td`,{style:{textAlign:`right`,color:`var(--amt-strong)`},children:[`₹`,T(e.outstanding)]}),(0,y.jsxs)(`td`,{style:{textAlign:`right`,color:`var(--amt-strong)`,fontWeight:800},children:[`₹`,T(t.allocated)]}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:t.outstanding_after>0?(0,y.jsxs)(`span`,{style:{color:`var(--amt-strong)`,fontWeight:800},children:[`₹`,T(t.outstanding_after)]}):(0,y.jsx)(`span`,{className:`WP-split-closed`,children:`✓ CLOSED`})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`WP-badge ${t.is_closed?`WP-badge-closed`:`WP-badge-partial`}`,children:t.is_closed?`Closed`:`Partial`})})]},e.key):null})})]})}),(0,y.jsxs)(`div`,{className:`WP-split-bar`,children:[(0,y.jsxs)(`div`,{className:`WP-split-bar-item`,children:[`Paying: `,(0,y.jsxs)(`b`,{children:[`₹`,T(Q)]})]}),(0,y.jsxs)(`div`,{className:`WP-split-bar-item`,children:[`Balance after: `,(0,y.jsx)(`b`,{style:{color:`var(--amt-strong)`},children:sn>0?`₹${T(sn)}`:`✓ Fully Cleared`})]}),(0,y.jsxs)(`div`,{className:`WP-split-bar-item`,children:[`Closed: `,(0,y.jsx)(`b`,{style:{color:`#C47E0A`},children:Object.values(Zt).filter(e=>e.is_closed).length}),`/`,M.length,` selected`]})]})]}),(0,y.jsxs)(`div`,{className:`WP-pay-footer`,children:[(0,y.jsxs)(`div`,{className:`WP-pay-total`,children:[M.length>0?(0,y.jsxs)(y.Fragment,{children:[`Selected outstanding: `,(0,y.jsxs)(`span`,{children:[`₹`,T(J)]})]}):(0,y.jsxs)(y.Fragment,{children:[`Total outstanding: `,(0,y.jsxs)(`span`,{children:[`₹`,T(c.balance)]})]}),Q>0&&M.length>0&&Q<=J+.005&&(0,y.jsxs)(y.Fragment,{children:[` `,`→ After payment: `,(0,y.jsx)(`span`,{style:{color:`var(--amt-strong)`},children:J-Q>.005?`₹${T(J-Q)}`:`✓ Selected bills clear`})]}),M.length>0&&Q>J+.005&&(0,y.jsx)(`span`,{style:{color:`var(--ember)`,marginLeft:8,fontWeight:800},children:`⚠ Amount exceeds selected outstanding`})]}),(0,y.jsx)(`button`,{className:`WP-btn WP-btn-outline WP-btn-sm`,onClick:()=>{Fe(``),ze(``),j([]),N([]),Ve(!1)},children:`Clear`}),(0,y.jsxs)(`button`,{className:`WP-btn WP-btn-green`,onClick:Ut,disabled:Ce||!k||Q<=0||M.length===0||Q>J+.005,children:[(0,y.jsx)(E,{n:`check`,s:14,c:`#fff`}),Ce?H?`Saving & Syncing…`:`Saving…`:H?`Confirm & Sync Payment`:`Confirm Payment`]})]})]})]}):(0,y.jsxs)(`div`,{className:`WP-panel`,style:{padding:`28px`,textAlign:`center`},children:[(0,y.jsx)(`div`,{style:{fontSize:31.5,marginBottom:8},children:`✅`}),(0,y.jsx)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:9.5,fontWeight:800,color:`#C47E0A`,letterSpacing:1},children:`ALL PAYMENTS CLEARED`}),(0,y.jsxs)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,color:`var(--text-4)`,marginTop:6},children:[`No outstanding balance for `,c.worker.name]})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[c.balance>0&&(0,y.jsxs)(`div`,{className:`LP-step2-card`,children:[(0,y.jsxs)(`div`,{className:`LP-step2-head`,children:[(0,y.jsx)(`span`,{className:`LP-step`,children:`4`}),`Cash Book Sync`,(0,y.jsxs)(`label`,{className:`LP-sync-toggle`,children:[(0,y.jsx)(`input`,{type:`checkbox`,checked:H,onChange:e=>Et(e.target.checked)}),`Post to Cash Book automatically`]}),H&&(0,y.jsxs)(`button`,{type:`button`,className:`LP-db-details-toggle${Dt?` open`:``}`,onClick:()=>Ot(e=>!e),children:[Dt?`Hide details`:`Edit party / category`,(0,y.jsx)(D,{n:`chevronDown`,s:9,c:`currentColor`})]})]}),H?(0,y.jsxs)(`div`,{className:`LP-step2-body`,children:[Dt&&(0,y.jsxs)(`div`,{className:`LP-db-grid`,children:[(0,y.jsxs)(`div`,{className:`WP-field`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Party Name in Cash Book *`}),(0,y.jsx)(xe,{options:cn,value:U,onChange:e=>{jt(e),Ft(``)},placeholder:`Select party…`,emptyMsg:`No parties found`}),vn&&U===String(vn.id)&&(0,y.jsxs)(`div`,{className:`LP-hint`,children:[`✓ Auto-matched: `,vn.name]})]}),(0,y.jsxs)(`div`,{className:`WP-field`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Expense Account Head *`}),(0,y.jsx)(xe,{options:ln,value:W,onChange:e=>{Mt(e),Pt(``)},placeholder:`Select category…`,emptyMsg:`No expense categories`}),W&&hn&&(0,y.jsxs)(`div`,{className:`LP-hint`,children:[`✓ Posts as Debit — `,hn]})]}),(0,y.jsxs)(`div`,{className:`WP-field`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Account Sub-Head`}),(0,y.jsx)(xe,{options:un,value:Nt,onChange:Pt,placeholder:W?un.length===0?`No sub-categories`:`Select sub-category…`:`Select category first…`,disabled:!W||un.length===0,emptyMsg:`No sub-categories`})]}),(0,y.jsxs)(`div`,{className:`WP-field`,children:[(0,y.jsx)(`label`,{className:`WP-field-lbl`,children:`Associate Name (referred / temporary worker)`}),(0,y.jsx)(xe,{options:pn,value:G,onChange:Ft,placeholder:pn.length===0?U?`No associate names for this worker`:`Select party first…`:`Select associate name…`,disabled:pn.length===0,emptyMsg:`No associate names`}),$&&G.startsWith(`id:`)&&(0,y.jsxs)(`div`,{className:`LP-hint`,children:[`✓ Entry will be tagged under associate name: `,$]}),$&&G.startsWith(`name:`)&&(0,y.jsxs)(`div`,{className:`LP-hint`,children:[`✓ From Manpower Register — will be added to Master & tagged in Cash Book: `,$]})]})]}),!vn&&!Dt&&(0,y.jsxs)(`div`,{className:`LP-db-warn`,children:[(0,y.jsx)(D,{n:`alert`,s:10,c:`#2563EB`}),`No party auto-matched — `,(0,y.jsx)(`button`,{type:`button`,onClick:()=>Ot(!0),children:`select one`}),` before recording.`]}),(0,y.jsxs)(`div`,{className:`LP-db-preview`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`LP-db-preview-head`,onClick:()=>At(e=>!e),children:[(0,y.jsx)(D,{n:`circle`,s:11,c:`#1E9C6A`}),`Cash Book Entry Preview`,(0,y.jsx)(`span`,{className:`LP-db-preview-chev${kt?` open`:``}`,children:(0,y.jsx)(D,{n:`chevronDown`,s:11,c:`#1E9C6A`})})]}),kt&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`LP-db-preview-body`,children:[(0,y.jsxs)(`span`,{children:[`Date: `,(0,y.jsx)(`b`,{children:new Date().toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`})})]}),(0,y.jsxs)(`span`,{children:[`Mode: `,(0,y.jsx)(`b`,{children:ee[Ie]||`Cash`})]}),(0,y.jsxs)(`span`,{children:[`Party: `,(0,y.jsx)(`b`,{children:mn||`—`})]}),(0,y.jsxs)(`span`,{children:[`Account Head: `,(0,y.jsx)(`b`,{children:hn||`—`})]}),gn&&(0,y.jsxs)(`span`,{children:[`Sub-cat: `,(0,y.jsx)(`b`,{children:gn})]}),$&&(0,y.jsxs)(`span`,{children:[`Associate Name: `,(0,y.jsx)(`b`,{children:$})]}),(0,y.jsxs)(`span`,{className:`LP-db-span`,children:[`Narration: `,(0,y.jsx)(`b`,{children:It||`—`})]}),!!c?.earnings_breakdown?.subs?.length&&(0,y.jsxs)(`span`,{className:`LP-db-span`,children:[`Sub Workers Included: `,(0,y.jsx)(`b`,{children:c.earnings_breakdown.subs.length}),` — `,c.earnings_breakdown.subs.map(e=>e.sub_name).join(`, `)]})]}),_n.length>0?(0,y.jsxs)(`div`,{className:`LP-db-entries`,children:[(0,y.jsxs)(`div`,{className:`LP-db-entries-title`,children:[_n.length,` Cash Book `,_n.length===1?`entry`:`entries`,` will be created — one per worker settled`]}),_n.map((e,t)=>(0,y.jsxs)(`div`,{className:`LP-db-entry`,children:[(0,y.jsx)(`span`,{className:`LP-db-entry-num`,children:t+1}),(0,y.jsxs)(`span`,{className:`LP-db-entry-client`,children:[e.client,e.isOwn?` · Own Work`:` · ${e.person}`]}),(0,y.jsx)(`span`,{className:`LP-db-entry-status ${e.alloc.is_closed?`closed`:`partial`}`,children:e.alloc.is_closed?`Bill Closed`:`Partial`}),(0,y.jsxs)(`span`,{className:`LP-db-entry-amt`,children:[`₹`,T(e.alloc.allocated)]})]},`${e.client}::${e.person}`))]}):(0,y.jsx)(`div`,{className:`LP-db-entries`,children:(0,y.jsxs)(`div`,{className:`LP-db-entry`,children:[(0,y.jsx)(`span`,{className:`LP-db-entry-client`,style:{fontStyle:`italic`,opacity:.8},children:M.length>0?`Enter an amount to preview the split`:`Select clients & workers, then enter amount to preview entries`}),(0,y.jsx)(`span`,{className:`LP-db-entry-amt`,children:Q>0?`₹${T(Q)}`:`—`})]})})]})]})]}):(0,y.jsx)(`div`,{className:`LP-db-note`,children:`Sync is off — this payment will NOT create a Cash Book entry.`})]}),(0,y.jsxs)(`div`,{className:`WP-panel`,style:{display:`flex`,flexDirection:`column`},children:[(0,y.jsxs)(`div`,{className:`WP-panel-head`,children:[(0,y.jsx)(`span`,{className:`LP-panel-ico`,children:(0,y.jsx)(E,{n:`history`,s:14,c:`var(--ember)`})}),(0,y.jsx)(`span`,{className:`WP-panel-title`,children:`Payment History`}),(0,y.jsx)(`span`,{className:`LP-count-pill`,children:c.sessions.length>5?`Last 5 of ${c.sessions.length}`:`${c.sessions.length} record${c.sessions.length===1?``:`s`}`})]}),(0,y.jsx)(`div`,{className:`WP-history-list`,children:c.sessions.length===0?(0,y.jsxs)(`div`,{className:`WP-history-empty`,children:[(0,y.jsx)(`div`,{style:{fontSize:24.5,marginBottom:8},children:`📭`}),`No Payment Records yet`]}):c.sessions.slice(0,5).map((t,n)=>(0,y.jsxs)(`div`,{className:`WP-session`,style:{animationDelay:`${n*.05}s`},children:[(0,y.jsxs)(`div`,{className:`WP-session-header`,onClick:()=>Ue(He===t.id?null:t.id),children:[(0,y.jsx)(`div`,{className:`WP-session-icon`,children:(0,y.jsx)(E,{n:`check`,s:16,c:`#C47E0A`})}),(0,y.jsxs)(`div`,{style:{flex:1},children:[(0,y.jsxs)(`div`,{className:`WP-session-amount`,style:{display:`flex`,alignItems:`center`,gap:8,flexWrap:`wrap`},children:[`₹`,T(t.total_amount),(0,y.jsx)(_e,{mode:t.payment_mode})]}),(0,y.jsxs)(`div`,{className:`WP-session-meta`,children:[oe(t.paid_at),t.allocations&&t.allocations.length>0&&(0,y.jsxs)(y.Fragment,{children:[`\xA0·`,` `,(0,y.jsx)(`span`,{className:`WP-session-names`,children:[...new Set(t.allocations.map(e=>e.sub_worker_name||c.worker.name))].join(`, `)})]}),t.notes&&(0,y.jsxs)(y.Fragment,{children:[`\xA0· `,t.notes]})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,gap:4,alignItems:`center`},children:[s(e)?(0,y.jsx)(`button`,{className:`WP-btn WP-btn-red WP-btn-sm`,onClick:e=>{e.stopPropagation(),Kt(t)},title:`Delete payment`,children:(0,y.jsx)(E,{n:`trash`,s:11,c:`#fff`})}):(0,y.jsx)(g,{name:t.created_by_name}),(0,y.jsx)(E,{n:He===t.id?`collapse`:`expand`,s:18,c:`var(--text-4)`})]})]}),He===t.id&&(0,y.jsxs)(`div`,{className:`WP-session-allocs`,children:[t.allocations.filter(e=>e.allocated>0).map(e=>(0,y.jsx)(ve,{name:e.client_name,before:e.outstanding_before,after:e.outstanding_after,allocated:e.allocated,closed:e.is_closed},e.id)),t.allocations.filter(e=>e.allocated>0).length===0&&(0,y.jsx)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,color:`var(--text-4)`,padding:`4px 0`},children:`No allocations Recorded`})]})]},t.id))}),c.sessions.length>5&&(0,y.jsxs)(`button`,{className:`WP-view-all-btn`,onClick:()=>Ge(!0),children:[`View All `,c.sessions.length,` Transactions`,(0,y.jsx)(`span`,{style:{display:`inline-flex`,transform:`rotate(180deg)`},children:(0,y.jsx)(E,{n:`back`,s:11,c:`currentColor`})})]})]})]})]})]})]}),!c&&!Te&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)(`div`,{className:`LP-view-tabs`,children:[(0,y.jsxs)(`button`,{className:`LP-view-tab`+(I===`workers`?` active`:``),onClick:()=>nt(`workers`),children:[(0,y.jsx)(E,{n:`labour`,s:13,c:`currentColor`}),`Workers`]}),(0,y.jsxs)(`button`,{className:`LP-view-tab`+(I===`payments`?` active`:``),onClick:()=>nt(`payments`),children:[(0,y.jsx)(E,{n:`history`,s:13,c:`currentColor`}),`All Payments`,R&&(0,y.jsx)(`span`,{className:`LP-view-tab-badge`,children:R.sessions_count})]})]}),I===`workers`&&(0,y.jsxs)(y.Fragment,{children:[a&&(0,y.jsxs)(`div`,{className:`ERP-stats`,children:[(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--ember),#60A5FA)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Workers`}),(0,y.jsx)(`div`,{className:`ERP-stat-val`,style:{color:`var(--ember)`,fontSize:13,fontWeight:800},children:(0,y.jsx)(O,{value:a.total_workers})})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#2563EB,#60A5FA)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Earned`}),(0,y.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--amt-strong)`,fontSize:13,fontWeight:800},children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:12.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(a.total_earned)})]})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#C47E0A,#3B82F6)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Paid`}),(0,y.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--amt-strong)`,fontSize:13,fontWeight:800},children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:12.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(a.total_paid)})]})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#60A5FA,var(--ember-mid))`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Unpaid`}),(0,y.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--amt-strong)`,fontSize:13,fontWeight:800},children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:12.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(a.total_unpaid)})]})]})]}),(0,y.jsxs)(`div`,{className:`ERP-tbl-card`,children:[(0,y.jsxs)(`div`,{className:`ERP-tbl-hdr`,children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`div`,{className:`ERP-tbl-title`,children:`All Workers`}),(0,y.jsx)(`div`,{className:`ERP-tbl-sub`,children:`Click a row to view breakdown & record payment`})]}),(0,y.jsxs)(`div`,{className:`LP-tbl-toolbar`,children:[(0,y.jsx)(`div`,{className:`WP-tabs`,children:[`all`,`unpaid`,`clear`].map(e=>(0,y.jsx)(`button`,{className:`WP-tab ${je===e?`WP-tab-active`:``}`,onClick:()=>Me(e),children:e===`all`?`All`:e===`unpaid`?`Unpaid`:`Cleared`},e))}),(0,y.jsxs)(`div`,{className:`WP-search-wrap`,children:[(0,y.jsx)(`span`,{className:`WP-search-icon`,children:(0,y.jsx)(E,{n:`search`,s:15,c:`var(--text-4)`})}),(0,y.jsx)(`input`,{type:`text`,className:`WP-search`,placeholder:`Search worker…`,value:ke,onChange:e=>Ae(e.target.value)})]}),(0,y.jsxs)(`span`,{className:`ERP-tbl-count`,children:[Y.length,` / `,t.length]})]})]}),pe?(0,y.jsx)(`div`,{className:`ERP-tbl-scroll LP-tbl-scroll`,children:(0,y.jsxs)(`table`,{className:`ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl`,children:[(0,y.jsxs)(`colgroup`,{children:[(0,y.jsx)(`col`,{style:{width:52}}),(0,y.jsx)(`col`,{style:{width:`21%`}}),(0,y.jsx)(`col`,{style:{width:`9%`}}),(0,y.jsx)(`col`,{style:{width:`11%`}}),(0,y.jsx)(`col`,{style:{width:`11%`}}),(0,y.jsx)(`col`,{style:{width:`12%`}}),(0,y.jsx)(`col`,{style:{width:`8%`}}),(0,y.jsx)(`col`,{style:{width:`10%`}}),(0,y.jsx)(`col`,{style:{width:`9%`}}),(0,y.jsx)(`col`,{style:{width:`9%`}})]}),(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`S.No`}),(0,y.jsx)(`th`,{children:`Worker`}),(0,y.jsx)(`th`,{children:`Rate`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Earned`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Paid`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Outstanding`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Clients`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Last Paid`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Status`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Action`})]})}),(0,y.jsx)(`tbody`,{children:Array.from({length:6}).map((e,t)=>(0,y.jsxs)(`tr`,{className:`LP-skel-row`,style:{animationDelay:`${t*.06}s`},children:[(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:16}})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{className:`LP-worker-cell`,children:[(0,y.jsx)(`span`,{className:`LP-skel LP-skel-avatar`}),(0,y.jsxs)(`span`,{children:[(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:110,display:`block`}}),(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:60,height:8,display:`block`,marginTop:5}})]})]})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:55}})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:70}})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:70}})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:70}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:20}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:46}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:56,height:18,borderRadius:100}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:46,height:24,borderRadius:8}})})]},t))})]})}):Y.length===0?(0,y.jsxs)(`div`,{className:`ERP-empty`,children:[(0,y.jsx)(`div`,{className:`ERP-empty-icon`,children:(0,y.jsx)(E,{n:`labour`,s:24,c:`var(--ember)`})}),(0,y.jsx)(`div`,{className:`ERP-empty-title`,children:`No workers found`}),(0,y.jsx)(`div`,{className:`ERP-empty-sub`,children:t.length===0?`Add workers in the Workforce module first`:`No workers match your search or filter`})]}):(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`div`,{className:`ERP-tbl-scroll LP-tbl-scroll`,children:(0,y.jsxs)(`table`,{className:`ERP-tbl LP-compact LP-orange-tbl`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{width:52,textAlign:`center`},children:`S.No`}),(0,y.jsx)(`th`,{children:`Worker`}),(0,y.jsx)(`th`,{children:`Rate`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Earned`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Paid`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Outstanding`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Clients`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Last Paid`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Status`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Action`})]})}),(0,y.jsx)(`tbody`,{children:tn.map((e,t)=>{let n=e.balance>0;return(0,y.jsxs)(`tr`,{className:`LP-row`,style:{animationDelay:`${t*.045}s`},onClick:()=>Vt(e.id),children:[(0,y.jsx)(`td`,{className:`ERP-t-num`,children:(X-1)*S+t+1}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{className:`LP-worker-cell`,children:[(0,y.jsx)(`span`,{className:`LP-mini-avatar`,style:{background:le(e.id)},children:ce(e.name)}),(0,y.jsxs)(`span`,{style:{minWidth:0},children:[(0,y.jsx)(`span`,{className:`LP-worker-name`,style:{display:`block`},children:e.name}),e.trade&&(0,y.jsx)(`span`,{className:`LP-worker-trade`,style:{display:`block`},children:e.trade})]})]})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`span`,{className:`LP-rate`,children:[`₹`,ue(e)]})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsxs)(`span`,{className:`WP-amt`,children:[`₹`,T(e.total_earned)]})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsx)(`span`,{className:`WP-amt ${e.total_paid>0?`WP-amt-paid`:`WP-amt-zero`}`,children:e.total_paid>0?`₹${T(e.total_paid)}`:`—`})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:n?(0,y.jsxs)(`span`,{className:`WP-amt WP-amt-due`,children:[`₹`,T(e.balance)]}):(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontWeight:800,color:`var(--success)`,fontSize:9.5},children:`✓ Clear`})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`ERP-badge id-num`,children:e.clients_count})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-last`,children:e.last_payment_at?ae(e.last_payment_at):`never`})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsxs)(`span`,{className:`ERP-badge ${n?`unpaid`:`clear`}`,children:[(0,y.jsx)(`span`,{className:`ERP-badge-dot`}),n?`Unpaid`:`Clear`]})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsxs)(`button`,{className:`ERP-act edit`,onClick:t=>{t.stopPropagation(),Vt(e.id)},children:[(0,y.jsx)(E,{n:`pay`,s:11,c:`currentColor`}),`Pay`]})})]},`${e.id}-${X}`)})})]})}),en>1&&(0,y.jsxs)(`div`,{className:`LP-pgn`,children:[(0,y.jsxs)(`span`,{className:`LP-pgn-info`,children:[`Showing `,(0,y.jsx)(`b`,{children:(X-1)*S+1}),`–`,(0,y.jsx)(`b`,{children:Math.min(X*S,Y.length)}),` of `,(0,y.jsx)(`b`,{children:Y.length}),` workers`]}),(0,y.jsxs)(`button`,{className:`LP-pgn-btn LP-pgn-nav prev`,disabled:X<=1,onClick:()=>Pe(X-1),children:[(0,y.jsx)(D,{n:`chevronDown`,s:9,c:`currentColor`}),` Prev`]}),nn.map((e,t)=>e===`…`?(0,y.jsx)(`span`,{className:`LP-pgn-dots`,children:`…`},`dots-${t}`):(0,y.jsx)(`button`,{className:`LP-pgn-btn ${e===X?`on`:``}`,onClick:()=>Pe(e),children:e},e)),(0,y.jsxs)(`button`,{className:`LP-pgn-btn LP-pgn-nav next`,disabled:X>=en,onClick:()=>Pe(X+1),children:[`Next `,(0,y.jsx)(D,{n:`chevronDown`,s:9,c:`currentColor`})]})]})]})]})]}),I===`payments`&&(0,y.jsxs)(y.Fragment,{children:[R&&(0,y.jsxs)(`div`,{className:`ERP-stats`,children:[(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--ember),#60A5FA)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Paid`}),(0,y.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--amt-strong)`,fontSize:13,fontWeight:800},children:[(0,y.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:9.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,y.jsx)(O,{value:Math.round(R.total_amount)})]})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#2563EB,#60A5FA)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Payment Sessions`}),(0,y.jsx)(`div`,{className:`ERP-stat-val`,style:{color:`#2563EB`,fontSize:13,fontWeight:800},children:(0,y.jsx)(O,{value:R.sessions_count})})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#C47E0A,#3B82F6)`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`Workers Paid`}),(0,y.jsx)(`div`,{className:`ERP-stat-val`,style:{color:`#C47E0A`,fontSize:13,fontWeight:800},children:(0,y.jsx)(O,{value:R.workers_paid})})]}),(0,y.jsxs)(`div`,{className:`ERP-stat`,children:[(0,y.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#60A5FA,var(--ember-mid))`}}),(0,y.jsx)(`div`,{className:`ERP-stat-label`,children:`By Mode`}),(0,y.jsx)(`div`,{className:`LP-stat-rows`,style:{marginTop:6},children:R.by_mode.length===0?(0,y.jsx)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,color:`var(--text-4)`},children:`No payments yet`}):R.by_mode.map(e=>(0,y.jsxs)(`div`,{className:`LP-stat-row`,children:[(0,y.jsx)(`span`,{className:`LP-stat-dot`,style:{background:w[e.mode]?.color||`var(--text-4)`}}),(0,y.jsx)(`span`,{className:`LP-stat-mode`,children:x[e.mode]||e.mode}),(0,y.jsxs)(`span`,{className:`LP-stat-amt`,children:[`₹`,T(e.amount)]})]},e.mode))})]})]}),(0,y.jsxs)(`div`,{className:`ERP-tbl-card`,children:[(0,y.jsxs)(`div`,{className:`ERP-tbl-hdr`,children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`div`,{className:`ERP-tbl-title`,children:`All Payments`}),(0,y.jsx)(`div`,{className:`ERP-tbl-sub`,children:`Full payment history across every worker — click a row for the client-wise split`})]}),(0,y.jsxs)(`div`,{className:`LP-tbl-toolbar`,children:[(0,y.jsxs)(`div`,{className:`LP-date-range`,children:[(0,y.jsx)(`div`,{className:`LP-date-field`,children:(0,y.jsx)(h,{value:B,onChange:ut,max:V})}),(0,y.jsx)(`span`,{className:`LP-date-sep`,children:`to`}),(0,y.jsx)(`div`,{className:`LP-date-field`,children:(0,y.jsx)(h,{value:V,onChange:dt,min:B})}),(B||V)&&(0,y.jsx)(`button`,{type:`button`,className:`LP-date-clear`,title:`Clear date range`,onClick:()=>{ut(``),dt(``)},children:(0,y.jsx)(D,{n:`x`,s:13})})]}),(0,y.jsx)(be,{value:z,onChange:lt}),(0,y.jsxs)(`div`,{className:`WP-search-wrap`,children:[(0,y.jsx)(`span`,{className:`WP-search-icon`,children:(0,y.jsx)(E,{n:`search`,s:15,c:`var(--text-4)`})}),(0,y.jsx)(`input`,{type:`text`,className:`WP-search`,placeholder:`Search worker, client, notes…`,value:st,onChange:e=>ct(e.target.value)})]}),(0,y.jsxs)(`span`,{className:`ERP-tbl-count`,children:[L.length,` records`]})]})]}),at?(0,y.jsx)(`div`,{className:`ERP-tbl-scroll LP-tbl-scroll`,children:(0,y.jsxs)(`table`,{className:`ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl`,children:[(0,y.jsxs)(`colgroup`,{children:[(0,y.jsx)(`col`,{style:{width:52}}),(0,y.jsx)(`col`,{style:{width:`15%`}}),(0,y.jsx)(`col`,{style:{width:`21%`}}),(0,y.jsx)(`col`,{style:{width:`11%`}}),(0,y.jsx)(`col`,{style:{width:`10%`}}),(0,y.jsx)(`col`,{style:{width:`9%`}}),(0,y.jsx)(`col`,{style:{width:`16%`}}),(0,y.jsx)(`col`,{style:{width:`8%`}})]}),(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`S.No`}),(0,y.jsx)(`th`,{children:`Date & Time`}),(0,y.jsx)(`th`,{children:`Paid To`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Amount`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Mode`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Clients`}),(0,y.jsx)(`th`,{children:`Notes`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Action`})]})}),(0,y.jsx)(`tbody`,{children:Array.from({length:6}).map((e,t)=>(0,y.jsxs)(`tr`,{className:`LP-skel-row`,style:{animationDelay:`${t*.06}s`},children:[(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:16}})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:70}})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:110}})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:60}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:50}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:20}})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:90}})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`LP-skel`,style:{width:24}})})]},t))})]})}):L.length===0?(0,y.jsxs)(`div`,{className:`ERP-empty`,children:[(0,y.jsx)(`div`,{className:`ERP-empty-icon`,children:(0,y.jsx)(E,{n:`history`,s:24,c:`var(--ember)`})}),(0,y.jsx)(`div`,{className:`ERP-empty-title`,children:`No payments found`}),(0,y.jsx)(`div`,{className:`ERP-empty-sub`,children:st||z||B||V?`No payments match your search or filter`:`Payments recorded against workers will show up here`})]}):(0,y.jsx)(`div`,{className:`ERP-tbl-scroll LP-tbl-scroll`,children:(0,y.jsxs)(`table`,{className:`ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl`,children:[(0,y.jsxs)(`colgroup`,{children:[(0,y.jsx)(`col`,{style:{width:52}}),(0,y.jsx)(`col`,{style:{width:`15%`}}),(0,y.jsx)(`col`,{style:{width:`21%`}}),(0,y.jsx)(`col`,{style:{width:`11%`}}),(0,y.jsx)(`col`,{style:{width:`10%`}}),(0,y.jsx)(`col`,{style:{width:`9%`}}),(0,y.jsx)(`col`,{style:{width:`16%`}}),(0,y.jsx)(`col`,{style:{width:`8%`}})]}),(0,y.jsx)(`thead`,{children:(0,y.jsxs)(`tr`,{children:[(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`S.No`}),(0,y.jsx)(`th`,{children:`Date & Time`}),(0,y.jsx)(`th`,{children:`Paid To`}),(0,y.jsx)(`th`,{style:{textAlign:`right`},children:`Amount`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Mode`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Clients`}),(0,y.jsx)(`th`,{children:`Notes`}),(0,y.jsx)(`th`,{style:{textAlign:`center`},children:`Action`})]})}),(0,y.jsx)(`tbody`,{className:`LP-page-fade`,children:an.map((t,n)=>{let r=se(t.paid_at);return(0,y.jsxs)(_.Fragment,{children:[(0,y.jsxs)(`tr`,{className:`LP-row LP-pay-row`,style:{animationDelay:`${n*.035}s`},onClick:()=>ht(mt===t.id?null:t.id),children:[(0,y.jsx)(`td`,{className:`ERP-t-num`,children:(Z-1)*C+n+1}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{className:`LP-dt-cell`,children:[(0,y.jsx)(`span`,{className:`LP-dt-date`,children:r.date}),(0,y.jsx)(`span`,{className:`LP-dt-time`,children:r.time})]})}),(0,y.jsx)(`td`,{children:(0,y.jsxs)(`div`,{className:`LP-worker-cell LP-paidto`,children:[(0,y.jsx)(`span`,{className:`LP-mini-avatar`,style:{background:le(t.worker_id)},children:ce(t.worker_name)}),(0,y.jsx)(`span`,{className:`LP-worker-name LP-paidto-name`,children:t.worker_name})]})}),(0,y.jsx)(`td`,{style:{textAlign:`right`},children:(0,y.jsxs)(`span`,{className:`WP-amt WP-amt-paid LP-amt-highlight`,children:[`₹`,T(t.total_amount)]})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(_e,{mode:t.payment_mode})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsx)(`span`,{className:`ERP-badge id-num`,children:t.clients_count})}),(0,y.jsx)(`td`,{children:(0,y.jsx)(`span`,{style:{fontSize:10,color:`var(--text-3)`,fontStyle:t.notes?`normal`:`italic`},children:t.notes||`—`})}),(0,y.jsx)(`td`,{style:{textAlign:`center`},children:(0,y.jsxs)(`div`,{style:{display:`flex`,gap:4,justifyContent:`center`,alignItems:`center`},children:[s(e)?(0,y.jsx)(`button`,{className:`WP-btn WP-btn-red WP-btn-sm`,onClick:e=>{e.stopPropagation(),Kt(t)},title:`Delete payment`,children:(0,y.jsx)(E,{n:`trash`,s:11,c:`#fff`})}):(0,y.jsx)(g,{name:t.created_by_name}),(0,y.jsx)(E,{n:mt===t.id?`collapse`:`expand`,s:16,c:`var(--text-4)`})]})})]}),mt===t.id&&(0,y.jsx)(`tr`,{className:`LP-expand-row`,children:(0,y.jsx)(`td`,{colSpan:8,children:(0,y.jsxs)(`div`,{className:`WP-session-allocs`,style:{padding:`12px 6px`},children:[(0,y.jsxs)(`div`,{className:`LP-expand-meta`,children:[(0,y.jsxs)(`span`,{children:[`Session `,t.id]}),(0,y.jsxs)(`span`,{children:[r.date,`, `,r.time]}),(0,y.jsx)(`span`,{children:x[t.payment_mode]||t.payment_mode})]}),t.clients.length===0?(0,y.jsx)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,color:`var(--text-4)`,padding:`4px 0`},children:`No allocations recorded`}):t.clients.map(e=>(0,y.jsx)(ve,{name:e.client_name,before:e.outstanding_before,after:e.outstanding_after,allocated:e.allocated,closed:e.is_closed},e.client_name))]})})})]},t.id)})},Z)]})}),!at&&L.length>C&&(0,y.jsxs)(`div`,{className:`LP-pgn`,children:[(0,y.jsxs)(`span`,{className:`LP-pgn-info`,children:[`Showing `,(0,y.jsx)(`b`,{children:(Z-1)*C+1}),`–`,(0,y.jsx)(`b`,{children:Math.min(Z*C,L.length)}),` of `,(0,y.jsx)(`b`,{children:L.length}),` payments`]}),(0,y.jsx)(`button`,{className:`LP-pgn-btn`,disabled:Z<=1,onClick:()=>pt(Z-1),children:`‹ Prev`}),on.map((e,t)=>e===`…`?(0,y.jsx)(`span`,{className:`LP-pgn-dots`,children:`…`},`pdots-${t}`):(0,y.jsx)(`button`,{className:`LP-pgn-btn ${e===Z?`on`:``}`,onClick:()=>pt(e),children:e},e)),(0,y.jsx)(`button`,{className:`LP-pgn-btn`,disabled:Z>=rn,onClick:()=>pt(Z+1),children:`Next ›`})]})]})]})]})]}),he&&(0,y.jsxs)(`div`,{className:`LP-overlay`,children:[(0,y.jsx)(`div`,{className:`LP-run-wrap`,children:(0,y.jsx)(`svg`,{width:`235`,height:`83`,viewBox:`-10 0 235 83`,fill:`none`,style:{overflow:`visible`},children:(0,y.jsx)(`g`,{className:`LP-run-track`,children:(0,y.jsx)(`g`,{transform:`translate(25,5)`,children:(0,y.jsxs)(`g`,{className:`LP-run-flip`,children:[(0,y.jsxs)(`g`,{className:`LP-run-lines`,opacity:`0.55`,stroke:`var(--ember-light,#60A5FA)`,strokeWidth:`3.1`,strokeLinecap:`round`,children:[(0,y.jsx)(`line`,{className:`LP-run-line l1`,x1:`-30`,y1:`32.5`,x2:`-10`,y2:`32.5`}),(0,y.jsx)(`line`,{className:`LP-run-line l2`,x1:`-25`,y1:`42.5`,x2:`-10`,y2:`42.5`}),(0,y.jsx)(`line`,{className:`LP-run-line l3`,x1:`-20`,y1:`52.5`,x2:`-10`,y2:`52.5`})]}),(0,y.jsxs)(`g`,{className:`LP-run-figure`,children:[(0,y.jsx)(`g`,{transform:`translate(14,22.5)`,children:(0,y.jsxs)(`g`,{className:`LP-run-arm-back`,children:[(0,y.jsx)(`line`,{x1:`0`,y1:`0`,x2:`-16.3`,y2:`12.5`,stroke:`var(--ember-light,#60A5FA)`,strokeWidth:`9.4`,strokeLinecap:`round`}),(0,y.jsx)(`circle`,{cx:`-16.3`,cy:`12.5`,r:`4.7`,fill:`var(--ember-light,#60A5FA)`})]})}),(0,y.jsx)(`g`,{transform:`translate(14,47.5)`,children:(0,y.jsxs)(`g`,{className:`LP-run-leg-back`,children:[(0,y.jsx)(`line`,{x1:`0`,y1:`0`,x2:`-17.5`,y2:`22.5`,stroke:`var(--ember-light,#60A5FA)`,strokeWidth:`10.6`,strokeLinecap:`round`}),(0,y.jsx)(`circle`,{cx:`-17.5`,cy:`22.5`,r:`5.4`,fill:`var(--ember-light,#60A5FA)`})]})}),(0,y.jsx)(`g`,{transform:`rotate(8,14,35)`,children:(0,y.jsx)(`line`,{x1:`14`,y1:`18.8`,x2:`14`,y2:`48.8`,stroke:`var(--ember-light,#60A5FA)`,strokeWidth:`11.9`,strokeLinecap:`round`})}),(0,y.jsx)(`circle`,{cx:`15`,cy:`8.1`,r:`10.6`,fill:`var(--ember-light,#60A5FA)`}),(0,y.jsx)(`g`,{transform:`translate(14,47.5)`,children:(0,y.jsxs)(`g`,{className:`LP-run-leg-front`,children:[(0,y.jsx)(`line`,{x1:`0`,y1:`0`,x2:`18.8`,y2:`20`,stroke:`var(--ember-light,#60A5FA)`,strokeWidth:`11.3`,strokeLinecap:`round`}),(0,y.jsx)(`circle`,{cx:`18.8`,cy:`20`,r:`5.7`,fill:`var(--ember-light,#60A5FA)`})]})}),(0,y.jsx)(`g`,{transform:`translate(14,22.5)`,children:(0,y.jsxs)(`g`,{className:`LP-run-arm-front`,children:[(0,y.jsx)(`line`,{x1:`0`,y1:`0`,x2:`16.3`,y2:`10`,stroke:`var(--ember-light,#60A5FA)`,strokeWidth:`10`,strokeLinecap:`round`}),(0,y.jsx)(`circle`,{cx:`16.3`,cy:`10`,r:`4.9`,fill:`var(--ember-light,#60A5FA)`})]})})]})]})})})})}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`div`,{className:`LP-loader-title`,children:`Opening Worker Ledger`}),(0,y.jsxs)(`div`,{className:`LP-loader-sub`,children:[`Fetching earnings & payments`,(0,y.jsxs)(`span`,{className:`LP-loader-dots`,children:[(0,y.jsx)(`span`,{}),(0,y.jsx)(`span`,{}),(0,y.jsx)(`span`,{})]})]})]})]}),(0,y.jsx)(m,{open:Wt.open,title:`Delete Payment`,itemName:Wt.label,description:`Are you sure you want to delete this payment record?`,confirmLabel:`Delete Payment`,warnText:(0,y.jsxs)(y.Fragment,{children:[`The paid amount will be `,(0,y.jsx)(`strong`,{children:`added back to the worker's outstanding balance`}),`. This action cannot be undone.`]}),onConfirm:qt,onCancel:()=>Gt({open:!1,sessionId:null,label:``,loading:!1}),loading:Wt.loading})]})}export{Se as default};