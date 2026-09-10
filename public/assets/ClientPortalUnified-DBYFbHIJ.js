import{C as e,D as t,S as n,a as r,b as i,i as a,n as o,r as s,t as c,v as l,x as u,y as d}from"./index-o01vRmXM.js";import{t as f}from"./ConfirmDeleteModal-Bype6Eoe.js";import{t as p}from"./DuplicateWarningModal-D5XgHHaB.js";import{t as m}from"./CalendarDD-BMFFtXy7.js";import{t as h}from"./PageOpenIntro-Bi4xyFTG.js";var g=n(),_=t(e(),1),v=l(),y=e=>Array.isArray(e)?e:[],b=e=>`₹`+e.toLocaleString(`en-IN`,{maximumFractionDigits:0}),x=e=>e?new Date(e).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}):`—`,S=e=>{let t=new Date;t.setHours(0,0,0,0);let n=new Date(e);return n.setHours(0,0,0,0),Math.ceil((n.getTime()-t.getTime())/864e5)},C=[`expense`,`expenditure`,`cost`,`vendor`,`supplier`,`payable`,`payment_out`,`purchase`],w=e=>!C.some(t=>`${e.type||``} ${e.category||``}`.toLowerCase().includes(t)),T=e=>e.filter(w),E=(e,t,n)=>T(e).filter(e=>{let r=e.name.trim().toLowerCase();return n&&r===n.trim().toLowerCase()?!0:!t.some(e=>e.trim().toLowerCase()===r)}),D=(e,t)=>e.find(e=>e.name.trim().toLowerCase()===t.trim().toLowerCase()),O=e=>e?.sub_names&&Array.isArray(e.sub_names)?e.sub_names.filter(Boolean):[],k=[{value:`construction`,label:`Construction`},{value:`interior`,label:`Interior`},{value:`architecture`,label:`Architecture`},{value:`drawing`,label:`Drawing`},{value:`pmc`,label:`PMC`}],A=[{value:`active`,label:`Active`},{value:`on_hold`,label:`On Hold`},{value:`completed`,label:`Completed`}],j=[{value:`cash`,label:`Cash`},{value:`cheque`,label:`Cheque`},{value:`upi`,label:`UPI`},{value:`bank_transfer`,label:`Bank Transfer`},{value:`other`,label:`Other`}],M=`
/* ── CP variable bridge: maps old CP tokens → ERPTheme variables ── */
.CP-root {
  --or:    var(--ember-mid);  --or2: var(--ember-mid);  --or3: var(--ember-light);
  --or-t:  var(--ember-ghost); --or-g: var(--ember-glow); --or-r: var(--ember-border);
  --w:     var(--white);  --cr0: var(--surface);  --cr1: var(--off-white);  --cr2: var(--surface);  --cr3: var(--surface-2);
  --bd:    var(--border);  --bd2: var(--border-2);
  --t1:    var(--text-1);  --t2:  var(--text-2);  --t3:  var(--text-3);  --t4:  var(--text-4);
  --gr:  var(--success); --gr-t: var(--success-bg);  --gr-r: var(--success-bd);
  --rd:  var(--error);   --rd-t: var(--error-bg);   --rd-r: var(--error-bd);
  --gd:  var(--warn);    --gd-t: var(--warn-bg);    --gd-r: var(--warn-bd);
  --pu:  #6A24B8; --pu-t: rgba(106,36,184,.07); --pu-r: rgba(106,36,184,.22);
  --co:  var(--info); --co-t: var(--info-bg);  --co-r: var(--info-bd);
  /* Collect Payment / Add Budget / wizard accents — all Project-theme
     orange now (three darker-to-brighter shades kept only so the three
     figures — e.g. Budget vs Collected vs GST — stay visually tellable
     apart), replacing the old teal/amber/purple trio. */
  --jade:  #2563EB; --jade2: #3B82F6; --jade3: #60A5FA;
  --jade-t: rgba(37,99,235,.08); --jade-g: rgba(37,99,235,.18); --jade-r: rgba(37,99,235,.26);
  --gold:  #7C3AED; --gold2: #9333EA; --gold3: #A78BFA;
  --gold-t: rgba(124,58,237,.08); --gold-g: rgba(124,58,237,.18); --gold-r: rgba(124,58,237,.26);
  --iris:  #9A3412; --iris2: #1D4ED8;
  --iris-t: rgba(29,78,216,.08); --iris-r: rgba(29,78,216,.24);
  --cobalt: #1743AC; --cobalt2: #2563EB;
  --cobalt-t: rgba(23,67,172,.08); --cobalt-r: rgba(23,67,172,.24);
  --crimson: #B01F35; --crimson2: #DC2626;
  --crimson-t: rgba(176,31,53,.08); --crimson-r: rgba(176,31,53,.24);
  --emerald: #047054;
  --emerald-t: rgba(4,112,84,.08); --emerald-r: rgba(4,112,84,.26);
  --sh-sm:  var(--sh-card);
  --sh-md:  var(--sh-hover);
  --sh-lg:  0 10px 38px rgba(0,0,0,.11),0 20px 60px rgba(0,0,0,.06);
  --sh-or:  var(--sh-ember);
  --sh-or2: var(--sh-ember-lg);
  --ff-d: var(--font-display);
  --ff-b: var(--font-body);
  --ff-m: var(--font-mono);
  --ff-n: var(--font-mono);
  --r1: var(--r-sm); --r2: var(--r-md); --r3: var(--r-lg); --r4: var(--r-xl);
}

@keyframes CP-slideUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
@keyframes CP-slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
@keyframes CP-fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes CP-popIn     { 0%{opacity:0;transform:translateY(18px)} 70%{transform:translateY(-3px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes CP-spin      { to{transform:rotate(360deg)} }
@keyframes CP-pulseDot  { 0%,100%{box-shadow:0 0 0 0 rgba(30,127,90,.5)} 55%{box-shadow:0 0 0 7px rgba(30,127,90,0)} }
@keyframes CP-shimmer   { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
@keyframes CP-barFill   { from{width:0} to{width:100%} }
@keyframes CP-stagger   { from{opacity:0;transform:translateY(10px) scale(.985)} to{opacity:1;transform:none} }
@keyframes CP-flip3d    { 0%{opacity:0;transform:perspective(600px) rotateX(90deg)} 60%{transform:perspective(600px) rotateX(-6deg);opacity:1} 100%{transform:perspective(600px) rotateX(0)} }
@keyframes CP-float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes CP-glow      { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.25)} 50%{box-shadow:0 0 0 6px rgba(59,130,246,.08)} }
@keyframes CP-scanLine  { 0%{left:-60%;opacity:0} 20%{opacity:1} 80%{opacity:.7} 100%{left:120%;opacity:0} }
@keyframes CP-pulseRing { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.7);opacity:0} }
@keyframes CP-numTick   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes CP-detailIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
@keyframes CP-badgePop  { 0%{transform:scale(.82)} 60%{transform:scale(1.07)} 100%{transform:scale(1)} }
@keyframes CP-rowIn     { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
@keyframes CP-txIn      { from{opacity:0;transform:translateX(14px) scale(.97)} to{opacity:1;transform:none} }
@keyframes CP-bdIn      { from{opacity:0} to{opacity:1} }
@keyframes CP-pulseJade { 0%,100%{box-shadow:0 0 0 0 rgba(6,107,102,.5)} 60%{box-shadow:0 0 0 7px rgba(6,107,102,0)} }

/* ── SUCCESS CELEBRATION — ported from Accounts Payable's post-payment
   animation (confetti burst, twinkling sparkles, glow-pulsing check,
   shimmering amount badge). Covers the whole full-page form as the sole
   success signal, replacing a plain toast. Keyframe/class names are
   CP-prefixed (not CM3-) so both pages can be mounted at once without
   colliding. */
@keyframes cp-stamp-in {
  0%  { transform: scale(2.5) rotate(-8deg); opacity: 0; }
  50% { transform: scale(0.92) rotate(2deg); opacity: 1; }
  70% { transform: scale(1.08) rotate(-2deg); }
  85% { transform: scale(0.97) rotate(1deg); }
  100%{ transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes cp-check-glow {
  0%, 100% { box-shadow: 0 8px 28px rgba(29,78,216,0.28), 0 0 0 0 rgba(29,78,216,0.35); }
  50%      { box-shadow: 0 8px 28px rgba(29,78,216,0.28), 0 0 0 10px rgba(29,78,216,0); }
}
@keyframes cp-confetti-fly {
  0%   { opacity:1; transform:translate(0,0) rotate(0deg); }
  100% { opacity:0; transform:translate(var(--cp-drift,0), -130px) rotate(720deg); }
}
@keyframes cp-ring-pulse {
  0%   { transform:scale(0.6); opacity:0.8; }
  100% { transform:scale(2.2); opacity:0; }
}
@keyframes cp-sparkle-twinkle {
  0%   { opacity:0; transform:scale(0) rotate(0deg); }
  40%  { opacity:1; transform:scale(1.15) rotate(45deg); }
  70%  { opacity:1; transform:scale(0.9) rotate(75deg); }
  100% { opacity:0; transform:scale(0.4) rotate(120deg); }
}
@keyframes cp-badge-shimmer {
  0%   { transform: translateX(-120%) skewX(-15deg); }
  100% { transform: translateX(220%) skewX(-15deg); }
}
.CP-closed-celebrate {
  position: absolute; inset: 0; z-index: 20; border-radius: 22px;
  background: linear-gradient(160deg, #F1F5F9 0%, #F3E8FF 55%, #EDE9FE 100%);
  border: 2px solid #BFDBFE;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
}
@media(max-width:640px){ .CP-closed-celebrate { border-radius: 18px 18px 0 0; } }
.CP-closed-ring {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  border: 2.5px solid rgba(29,78,216,0.18);
  animation: cp-ring-pulse 1s ease-out 0.1s both;
}
.CP-closed-ring2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  border: 1.5px solid rgba(29,78,216,0.09);
  animation: cp-ring-pulse 1.1s ease-out 0.25s both;
}
.CP-sparkle { position: absolute; z-index: 2; pointer-events: none; animation: cp-sparkle-twinkle 1s ease-out both; }
.CP-closed-stamp-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  animation: cp-stamp-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
  position: relative; z-index: 1;
}
.CP-closed-check {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  border: 3px solid rgba(29,78,216,0.18);
  box-shadow: 0 8px 28px rgba(29,78,216,0.28);
  display: flex; align-items: center; justify-content: center;
  animation: cp-check-glow 1.4s ease-in-out 0.7s infinite;
}
.CP-closed-txt {
  font-family: var(--ff-m,'JetBrains Mono',monospace);
  font-size: 19.5px; font-weight: 900; color: #2563EB;
  letter-spacing: 4px; text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(29,78,216,0.10);
}
.CP-closed-sub { font-family: var(--ff-b,'Space Grotesk',sans-serif); font-size: 11.5px; color: #92400e; margin-top: -8px; font-weight: 700; }
.CP-closed-amt-badge {
  position: relative; padding: 8px 20px; background: #fff;
  border: 1.5px solid #BFDBFE; box-shadow: 0 2px 12px rgba(29,78,216,0.10);
  border-radius: 100px; font-family: var(--ff-m,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 800; color: #2563EB; margin-top: 4px; overflow: hidden;
}
.CP-closed-amt-badge::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent);
  animation: cp-badge-shimmer 1.6s ease-in-out 0.9s infinite;
}
.CP-confetti-piece { position: absolute; border-radius: 3px; animation: cp-confetti-fly 1.1s ease-out both; }

.CP-root { font-family:var(--ff-b); background:var(--surface); min-height:100%; color:var(--t1); position:relative; -webkit-font-smoothing:antialiased; }
.CP-root *, .CP-root *::before, .CP-root *::after { box-sizing:border-box; }
.CP-root::before { content:''; position:fixed; inset:0; background-image:radial-gradient(circle,rgba(107,107,107,0.07) 1px,transparent 1px); background-size:28px 28px; pointer-events:none; z-index:0; }

/* Page-open runner intro (see PageOpenIntro.tsx). Same mechanism as the
   main Accounts Payable / Cash Book pages: real content is hidden with
   plain opacity — fully transparent, no blur/color layer — while the
   runner plays, then crossfades back in the instant it starts exiting. */
.CP-root:has(> .DBI-overlay) > *:not(.DBI-overlay) {
  opacity: 0;
  pointer-events: none;
}
.CP-root:has(> .DBI-overlay.exiting) > *:not(.DBI-overlay) {
  opacity: 1;
  transition: opacity 0.26s ease;
  pointer-events: auto;
}

.CP-wrap { width:100%; padding:0 0 56px; position:relative; z-index:1; box-sizing:border-box; }
@media(max-width:1200px){ .CP-wrap{ padding:0 0 48px; } }
@media(max-width:900px){ .CP-wrap{ padding:0 0 36px; } }
@media(max-width:600px){ .CP-wrap{ padding:0 0 28px; } }

/* HEADER */
.CP-hdr { padding:28px 32px 22px; border-bottom:1px solid var(--bd); margin-bottom:28px; animation:CP-slideUp .45s cubic-bezier(.22,1,.36,1) both; position:relative; overflow:hidden; }
@media(max-width:900px){ .CP-hdr{ padding:22px 20px 18px; } }
@media(max-width:600px){ .CP-hdr{ padding:16px 14px 14px; } }
.CP-hdr-inner { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px; }
.CP-brand { display:flex; align-items:center; gap:18px; }
.CP-brand-icon { width:52px; height:52px; background:var(--or-t); border:1.5px solid var(--or-r); border-radius:var(--r3); display:flex; align-items:center; justify-content:center; color:var(--or); flex-shrink:0; }
.CP-brand-tag { font-family:var(--ff-m); font-size: 8px; font-weight: 700; letter-spacing:3px; text-transform:uppercase; color:var(--or); display:flex; align-items:center; gap:8px; margin-bottom:4px; }
.CP-brand-tag::before { content:''; display:inline-block; width:20px; height:2px; border-radius:2px; background:linear-gradient(90deg,var(--or),var(--or3)); }
.CP-brand-name { font-family:var(--ff-d); font-size: 31.5px; font-style:italic; color:var(--t1); letter-spacing:-.6px; line-height:1; }
.CP-brand-name em { color:var(--or); font-style:normal; }
.CP-brand-sub { font-family:var(--ff-b); font-size: 9.5px; color:var(--t4); margin-top:3px; }
.CP-hdr-actions { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.CP-live-badge { display:flex; align-items:center; gap:8px; padding:9px 20px; background:var(--w); border:1.5px solid var(--or-r); border-radius:100px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:2px; text-transform:uppercase; color:var(--or); box-shadow:var(--sh-sm); }
.CP-live-dot { width:6px; height:6px; border-radius:50%; background:var(--or); animation:erp-pulse-dot 2s ease-in-out infinite; position:relative; }
.CP-live-dot::after { content:''; position:absolute; inset:-3px; border-radius:50%; background:var(--or-g); animation:CP-pulseRing 2.2s ease-in-out infinite; }

/* BUTTONS */
.CP-btn-primary { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 22px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; border:none; background:linear-gradient(135deg,#3B82F6 0%,#2563EB 100%); color:#fff; box-shadow:var(--sh-or); transition:transform .2s,box-shadow .2s,background .2s; }
.CP-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:var(--sh-or2); background:linear-gradient(135deg,#60A5FA 0%,#2563EB 100%); }
.CP-btn-primary:disabled { opacity:.45; cursor:not-allowed; }
.CP-btn-add-compact { display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:999px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; border:none; background:linear-gradient(135deg,#3B82F6 0%,#2563EB 100%); color:#fff; box-shadow:0 4px 14px rgba(29,78,216,.32); transition:transform .18s ease,box-shadow .18s ease,background .18s ease; }
.CP-btn-add-compact:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 7px 20px rgba(29,78,216,.45); background:linear-gradient(135deg,#60A5FA 0%,#2563EB 100%); }
.CP-btn-add-compact:active { transform:translateY(0) scale(.97); }

/* Header-level "Add Client" action — sits in the page header next to the
   title (like a standard ERP primary action), instead of floating in its
   own isolated strip below the stat cards. Compact pill (not the oversized
   44px version) with a soft icon badge, gradient fill, shine sweep on
   hover, and a pop-in entrance so it reads as a deliberate, lively control. */
.ERP-hdr-right { display:flex; align-items:center; flex-shrink:0; padding-top:4px; }
@keyframes CP-hdrAddPop { 0%{opacity:0; transform:scale(0.7) translateY(-4px);} 65%{opacity:1; transform:scale(1.05) translateY(0);} 100%{opacity:1; transform:scale(1) translateY(0);} }
.CP-btn-header-add {
  position:relative; overflow:hidden;
  display:inline-flex; align-items:center; gap:7px;
  height:34px; padding:0 16px 0 6px; border-radius:100px;
  font-family:var(--ff-m); font-size: 8.5px; font-weight: 800; letter-spacing:1.2px; text-transform:uppercase;
  white-space:nowrap; cursor:pointer; border:none; color:#fff;
  background:linear-gradient(135deg,#3B82F6 0%,#2563EB 100%);
  box-shadow:0 4px 14px rgba(29,78,216,.32), 0 2px 6px rgba(29,78,216,.2);
  transition:transform .2s ease, box-shadow .2s ease;
  animation: CP-hdrAddPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
}
.CP-btn-header-add-ic {
  display:flex; align-items:center; justify-content:center;
  width:22px; height:22px; border-radius:50%;
  background:rgba(255,255,255,.22); flex-shrink:0;
}
.CP-btn-header-add::after {
  content:''; position:absolute; top:0; bottom:0; left:-60%; width:40%;
  background:linear-gradient(115deg, transparent, rgba(255,255,255,.35), transparent);
  transform:skewX(-20deg); transition:left .5s ease;
}
.CP-btn-header-add:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 8px 20px rgba(29,78,216,.42), 0 3px 8px rgba(29,78,216,.28); }
.CP-btn-header-add:hover::after { left:120%; }
.CP-btn-header-add:active { transform:translateY(0) scale(.96); }
@media(max-width:760px){ .ERP-hdr-right{ padding-top:0; } }
.CP-btn-outline { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 18px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; background:transparent; border:1.5px solid var(--or); color:var(--ember); transition:all .2s; }
.CP-btn-outline:hover { background:linear-gradient(135deg,#3B82F6,#2563EB); border-color:transparent; color:#fff; box-shadow:var(--sh-or); transform:translateY(-2px); }
.CP-btn-gold { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; white-space:nowrap; cursor:pointer; background:var(--gd-t); border:1.5px solid var(--gd-r); color:var(--gd); transition:all .2s; }
.CP-btn-gold:hover { background:var(--gd); color:#fff; border-color:var(--gd); transform:translateY(-2px); }
.CP-btn-ghost { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 16px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; background:var(--w); border:1.5px solid var(--bd); color:var(--t3); transition:all .18s; box-shadow:var(--sh-sm); }
.CP-btn-ghost:hover { border-color:var(--or-r); color:var(--or); background:var(--or-t); transform:translateY(-1px); }
.CP-act { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:var(--r-sm); border:1px solid; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:.8px; text-transform:uppercase; cursor:pointer; transition:all .15s; white-space:nowrap; }
.CP-act-add  { background:var(--or-t); color:var(--or); border-color:var(--or-r); }
.CP-act-add:hover  { background:var(--or); color:#fff; transform:translateY(-1px); }
.CP-act-edit { background:var(--or-t); color:var(--or); border-color:var(--or-r); }
.CP-act-edit:hover { background:var(--or); color:#fff; transform:translateY(-1px); }
.CP-act-del  { background:var(--rd-t); color:var(--rd); border-color:var(--rd-r); }
.CP-act-del:hover  { background:var(--rd); color:#fff; transform:translateY(-1px); }
.CP-act-jade { background:var(--jade-t); color:var(--jade); border-color:var(--jade-r); }
.CP-act-jade:hover { background:var(--jade); color:#fff; transform:translateY(-1px); }

/* STATS */
.CP-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:32px; }
@media(max-width:1400px){ .CP-stats{ grid-template-columns:repeat(5,1fr); gap:12px; } }
@media(max-width:1100px){ .CP-stats{ grid-template-columns:repeat(3,1fr); gap:12px; } }
@media(max-width:700px){  .CP-stats{ grid-template-columns:repeat(2,1fr); gap:10px; } }
@media(max-width:420px){  .CP-stats{ grid-template-columns:1fr; gap:8px; } }
.CP-stat { background:var(--w); border:1px solid var(--bd); border-radius:var(--r3); padding:20px 20px 16px; position:relative; overflow:hidden; transition:border-color .22s,transform .22s,box-shadow .22s; box-shadow:var(--sh-sm); cursor:default; animation:CP-slideUp .4s ease both; }
.CP-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--or),var(--or3)); border-radius:var(--r3) var(--r3) 0 0; animation:CP-barFill .8s .2s ease both; }
.CP-stat::after { content:''; position:absolute; bottom:-24px; right:-24px; width:80px; height:80px; border-radius:50%; background:radial-gradient(circle,var(--or-t) 0%,transparent 70%); pointer-events:none; }
.CP-stat:hover { transform:translateY(-3px); box-shadow:var(--sh-md); border-color:var(--or-r); }
.CP-stat-ico { width:36px; height:36px; border-radius:var(--r2); background:var(--or-t); border:1px solid var(--or-r); display:flex; align-items:center; justify-content:center; margin-bottom:14px; position:relative; z-index:1; color:var(--or); transition:all .22s; }
.CP-stat-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 700; letter-spacing:2.5px; text-transform:uppercase; color:var(--t4); margin-bottom:6px; position:relative; z-index:1; }
.CP-stat-val { font-family:var(--ff-d); font-size: 26.5px; font-style:italic; color:var(--grey); line-height:1; letter-spacing:-0.5px; position:relative; z-index:1; animation:CP-flip3d .7s cubic-bezier(.22,1,.36,1) both; display:flex; align-items:baseline; gap:2px; }
.CP-stat-val.or { color:var(--or); font-style:normal; font-family:var(--ff-m); font-size: 19.5px; font-weight: 800; letter-spacing:-0.5px; font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; }
.CP-stat-val.gr { color:var(--gr); font-style:normal; font-family:var(--ff-m); font-size: 19.5px; font-weight: 800; letter-spacing:-0.5px; font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; }
.CP-stat-val.rd { color:var(--rd); font-style:normal; font-family:var(--ff-m); font-size: 19.5px; font-weight: 800; letter-spacing:-0.5px; font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; }
.CP-stat-pfx { font-family:var(--ff-m); font-size:.48em; font-weight: 700; opacity:.65; align-self:flex-start; margin-top:.18em; letter-spacing:0; }
.CP-stat-sub { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:7px; display:flex; align-items:center; gap:5px; position:relative; z-index:1; letter-spacing:.3px; }

/* TOOLBAR */
.CP-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:24px; padding:0 32px; animation:CP-slideUp .4s .05s ease both; }
@media(max-width:900px){ .CP-toolbar{ padding:0 20px; } }
@media(max-width:600px){ .CP-toolbar{ padding:0 14px; } }
.CP-search-wrap { position:relative; flex:1; max-width:360px; }
.CP-search-ico  { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--t4); pointer-events:none; }
.CP-search-inp  { width:100%; padding:12px 16px 12px 44px; background:var(--w); border:1.5px solid var(--bd); border-radius:var(--r2); font-family:var(--ff-b); font-size: 10.5px; font-weight: 700; color:var(--t1); outline:none; transition:all .2s; }
.CP-search-inp:focus { border-color:var(--or2); box-shadow:0 0 0 3px var(--or-t); }
.CP-search-inp::placeholder { color:var(--t4); font-style:italic; }
.CP-count-chip { font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1px; text-transform:uppercase; color:var(--or); background:var(--or-t); padding:6px 14px; border-radius:100px; border:1px solid var(--or-r); }

/* ══ CM3-STYLE 2-COLUMN LAYOUT ════════════════════════════════ */

/* Page layout — same as CM3-page */
.CP-layout-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  flex: 1;
  min-height: 600px;
  border: 1.5px solid var(--border,#E9EEF5);
  border-radius: 16px;
  overflow: hidden;
  background: var(--white,#fff);
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  margin: 0 40px 32px;
  animation: erp-slide-up 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both;
}
@media(max-width:1100px){ .CP-layout-body{ grid-template-columns:260px 1fr; margin:0 20px 24px; } }
@media(max-width:860px){  .CP-layout-body{ grid-template-columns:1fr; margin:0 14px 18px; } }

/* ── SIDEBAR (left) ── */
.CP-sb {
  border-right: 1.5px solid var(--border,#E9EEF5);
  display: flex; flex-direction: column;
  background: #F8FAFC; overflow: hidden; height: 100%;
}

/* Sidebar hero header */
.CP-sb-hero {
  padding: 14px 14px 10px;
  background: linear-gradient(135deg,#F3E8FF 0%,#fff 100%);
  border-bottom: 1px solid var(--border,#E9EEF5);
  position: relative; overflow: hidden;
}
.CP-sb-hero::before {
  content:''; position:absolute; right:-20px; top:-20px;
  width:80px; height:80px; border-radius:50%;
  background: radial-gradient(circle, rgba(29,78,216,0.07), transparent 70%);
  pointer-events:none;
}
.CP-sb-eyebrow {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--ember,#2563EB); display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
}
.CP-sb-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--ember,#2563EB);
  animation: sb-dot-pulse 2s ease-in-out infinite;
}
@keyframes sb-dot-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.45; transform:scale(0.65); }
}
.CP-sb-title {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 13px; font-weight: 800; color: var(--text-1,#0F172A);
  margin-bottom: 8px;
}

/* Search */
.CP-sb-search {
  display: flex; align-items: center; gap: 7px; padding: 8px 11px;
  background: #fff; border: 1.5px solid var(--border,#E9EEF5);
  border-radius: 10px; transition: border-color 0.15s, box-shadow 0.15s;
}
.CP-sb-search:focus-within {
  border-color: var(--ember,#2563EB);
  box-shadow: 0 0 0 3px rgba(29,78,216,0.08);
}
.CP-sb-search input {
  flex: 1; border: none; outline: none; font-size: 9.5px;
  color: var(--text-1); background: transparent;
  font-family: var(--font-mono);
}
.CP-sb-search input::placeholder { color: var(--text-4,#9ca3af); }

/* Count row */
.CP-sb-count {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 14px 4px;
}
.CP-sb-count-lbl {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-4);
}
.CP-sb-count-num {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  color: var(--ember,#2563EB); background: #F3E8FF;
  padding: 1px 7px; border-radius: 100px; border: 1px solid #BFDBFE;
}

/* Client card list scroll */
.CP-cli-list { flex: 1; overflow-y: auto; padding: 4px 0 8px; }
.CP-cli-list::-webkit-scrollbar { width: 4px; }
.CP-cli-list::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius: 2px; }

/* ── Client sidebar card (like CM3-vcard) ── */
.CP-clicard {
  margin: 4px 10px; border-radius: 12px;
  border: 1.5px solid var(--border,#E9EEF5);
  background: #fff; cursor: pointer;
  transition: all 0.18s; position: relative; overflow: hidden;
  animation: vc-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes vc-in {
  from { opacity:0; transform:translateX(-10px); }
  to   { opacity:1; transform:translateX(0); }
}
.CP-clicard:hover {
  border-color: #BFDBFE;
  box-shadow: 0 4px 16px rgba(29,78,216,0.1);
  transform: translateX(2px);
}
.CP-clicard.active {
  border-color: var(--ember,#2563EB);
  background: #F3E8FF;
  box-shadow: 0 4px 20px rgba(29,78,216,0.15);
  transform: translateX(3px);
}
.CP-clicard-accent {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg,#2563EB,#3B82F6);
  opacity: 0; transition: opacity 0.18s;
}
.CP-clicard:hover .CP-clicard-accent,
.CP-clicard.active .CP-clicard-accent { opacity: 1; }

.CP-clicard-top { display: flex; align-items: center; gap: 10px; padding: 10px 12px 7px; }

.CP-clicard-av {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 900;
  background: #F3E8FF; border: 1.5px solid #BFDBFE; color: #2563EB;
  transition: transform 0.2s, box-shadow 0.2s;
}
.CP-clicard:hover .CP-clicard-av { transform: scale(1.1) rotate(-3deg); box-shadow: 0 4px 12px rgba(29,78,216,0.18); }
.CP-clicard.active .CP-clicard-av { transform: scale(1.06); box-shadow: 0 4px 14px rgba(29,78,216,0.22); }

.CP-clicard-info { flex: 1; min-width: 0; }
.CP-clicard-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#0F172A);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.CP-clicard-meta {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-4);
  margin-top: 2px; display: flex; align-items: center; gap: 4px;
}

.CP-clicard-foot {
  padding: 0 12px 9px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.CP-clicard-bar-wrap { flex: 1; height: 3px; border-radius: 100px; background: #f1f5f9; overflow: hidden; }
.CP-clicard-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg,#2563EB,#3B82F6);
  transition: width 1s cubic-bezier(0.4,0,0.2,1);
}
.CP-clicard-bal {
  font-family: var(--font-mono); font-size: 9px; font-weight: 900;
  white-space: nowrap; flex-shrink: 0;
}
.CP-clicard-bal.red  { color: #D93B55; }
.CP-clicard-bal.grey { color: var(--text-4); }

/* ── CLICK HINT CHEVRON ── */
.CP-clicard-hint {
  position: absolute; right: 9px; top: 50%;
  transform: translateY(-50%);
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(29,78,216,0.07); color: #2563EB;
  opacity: 0.55; transition: opacity 0.2s, transform 0.2s;
  animation: CP-hint-slide 1.6s ease-in-out infinite;
}
.CP-clicard:hover .CP-clicard-hint { opacity: 1; transform: translateY(-50%) scale(1.15); }
.CP-clicard.active .CP-clicard-hint { display: none; }
@keyframes CP-hint-slide {
  0%,100% { right: 9px; opacity: 0.55; }
  50%      { right: 5px; opacity: 0.9; }
}

/* First card attention pulse on load */
.CP-clicard-first:not(.active) {
  animation: vc-in 0.35s cubic-bezier(0.22,1,0.36,1) both, CP-card-attention 0.7s 1.2s ease-in-out 3;
}
@keyframes CP-card-attention {
  0%,100% { box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  50%     { box-shadow: 0 0 0 4px rgba(29,78,216,0.18), 0 4px 16px rgba(29,78,216,0.12); }
}

/* Sidebar tap-hint when no client selected */
.CP-sb-tap-hint {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 0 8px; opacity: 0.65;
  animation: CP-tap-float 2s ease-in-out infinite;
}
@keyframes CP-tap-float {
  0%,100% { transform: translateY(0); opacity: 0.65; }
  50%     { transform: translateY(-4px); opacity: 1; }
}
.CP-sb-tap-icon {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg,rgba(29,78,216,0.12),rgba(59,130,246,0.12));
  border: 1.5px dashed rgba(29,78,216,0.35);
  display: flex; align-items: center; justify-content: center;
  animation: CP-tap-pulse 1.8s ease-in-out infinite;
}
@keyframes CP-tap-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(29,78,216,0); }
  50%     { box-shadow: 0 0 0 6px rgba(29,78,216,0.12); }
}
.CP-sb-tap-label { font-family:var(--ff-m); font-size: 8px; letter-spacing:1.5px; text-transform:uppercase; color:var(--ember,#2563EB); }

/* ── RIGHT PANEL staggered entry ── */
.CP-panel-enter { animation: CP-panel-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes CP-panel-in {
  from { opacity:0; transform:translateX(22px) scale(0.98); }
  to   { opacity:1; transform:translateX(0) scale(1); }
}
.CP-stat-enter { animation: CP-stat-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes CP-stat-pop {
  from { opacity:0; transform:translateY(14px) scale(0.88); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.CP-proj-enter { animation: CP-proj-slide 0.36s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes CP-proj-slide {
  from { opacity:0; transform:translateX(18px); }
  to   { opacity:1; transform:translateX(0); }
}

/* ── MAIN PANEL (right) ── */
.CP-main-panel {
  overflow-y: auto; background: var(--white,#fff); height: 100%;
  display: flex; flex-direction: column;
}

/* Main panel header bar */
.CP-main-hdr {
  padding: 14px 18px 12px;
  background: linear-gradient(135deg,#F3E8FF 0%,#fff 100%);
  border-bottom: 1px solid var(--border,#E9EEF5);
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 5;
}
.CP-main-hdr-left { display: flex; align-items: center; gap: 10px; }
.CP-main-hdr-icon {
  width: 32px; height: 32px; border-radius: 9px;
  background: #F3E8FF; border: 1.5px solid #BFDBFE;
  display: flex; align-items: center; justify-content: center;
}
.CP-main-hdr-title {
  font-family: var(--font-body);
  font-size: 13px; font-style: normal; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.4px;
  color: var(--text-1); line-height: 1.1;
}
.CP-main-hdr-sub {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-4); margin-top: 2px;
}

/* Main panel content area */
.CP-main-content { flex: 1; padding: 12px; background: var(--surface,#F1F5F9); overflow-y: auto; }

/* Empty state (no client selected) */
.CP-main-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; min-height: 380px; color: var(--text-4); text-align: center; padding: 40px;
}
.CP-main-empty-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: #F3E8FF; border: 1.5px solid #BFDBFE;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; opacity: 0.7;
}
.CP-main-empty-title {
  font-family: var(--font-body); font-size: 14px; font-weight: 800; font-style: normal;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-2); margin-bottom: 6px;
}
.CP-main-empty-sub {
  font-family: var(--font-mono); font-size: 8px; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--text-4);
}

/* ── PROJECT CARD (like CM3-bc) ── */
.CP-pjcard {
  display: grid;
  grid-template-columns: 68px 1fr 160px 88px;
  border-radius: 12px; overflow: hidden;
  border: 1.5px solid var(--border,#E9EEF5);
  background: #fff; margin-bottom: 8px;
  transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
  animation: bc-in 0.32s cubic-bezier(0.4,0,0.2,1) both;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
@keyframes bc-in {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
.CP-pjcard:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.12); transform: translateY(-2px); border-color: #BFDBFE; }

/* Left accent column */
.CP-pjcard-left {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 12px 6px; gap: 6px;
  border-right: 1px solid var(--border,#E9EEF5);
  background: linear-gradient(160deg,#F3E8FF 0%,#F8FAFC 100%);
  position: relative; overflow: hidden;
}
.CP-pjcard-left::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
  background: linear-gradient(180deg,#2563EB,#3B82F6);
  box-shadow: 2px 0 8px rgba(29,78,216,0.2);
}
.CP-pjcard-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 17.5px; font-weight: 900; color: var(--ember,#2563EB);
  line-height: 1; letter-spacing: -1px;
}
.CP-pjcard-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(29,78,216,0.08); border: 1.5px solid rgba(29,78,216,0.2);
  display: flex; align-items: center; justify-content: center;
  transition: transform .18s;
}
.CP-pjcard:hover .CP-pjcard-icon { transform: rotate(-8deg) scale(1.1); }

/* Center body */
.CP-pjcard-body {
  padding: 11px 14px; display: flex; flex-direction: column;
  gap: 5px; min-width: 0; justify-content: center;
}
.CP-pjcard-title {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 11.5px; font-weight: 800; color: var(--text-1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.2px;
}
.CP-pjcard-meta {
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}
.CP-pjcard-chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 100px;
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  border: 1px solid; white-space: nowrap; letter-spacing: 0.3px;
}
.CP-pjcard-chip-type { background:#F3E8FF; color:#2563EB; border-color:#BFDBFE; }
.CP-pjcard-chip-status-active    { background:#f0fdf4; color:#1E9C6A; border-color:#6ee7b7; }
.CP-pjcard-chip-status-on_hold   { background:#fffbeb; color:#C47E0A; border-color:#fde68a; }
.CP-pjcard-chip-status-completed { background:#eff6ff; color:#2870CC; border-color:#bfdbfe; }
.CP-pjcard-date {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-4);
  display: flex; align-items: center; gap: 4px;
}
.CP-pjcard-prog-row { display:flex; align-items:center; gap:7px; margin-top:2px; }
.CP-pjcard-prog-pct { font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--ember,#2563EB); flex-shrink:0; }
.CP-pjcard-mini-bar { flex:1; height:5px; border-radius:100px; background:#f1f5f9; overflow:hidden; }
.CP-pjcard-mini-fill {
  height:100%; border-radius:100px;
  background:linear-gradient(90deg,#2563EB,#3B82F6);
  transition:width 1.2s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 1px 3px rgba(29,78,216,0.3);
}
/* Right amount */
.CP-pjcard-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 11px 14px; gap: 5px; flex-shrink: 0;
  border-left: 1px solid var(--border,#E9EEF5);
}
.CP-pjcard-amt {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 800; font-style: normal; line-height: 1;
  letter-spacing: -0.5px; font-variant-numeric: tabular-nums;
}
.CP-pjcard-amt.red { color: #D93B55; }
.CP-pjcard-amt.grn { color: #1E9C6A; }
.CP-pjcard-status {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 100px; border: 1px solid;
}
.CP-pjcard-status.open  { background:#F3E8FF; color:#2563EB; border-color:#BFDBFE; }
.CP-pjcard-status.done  { background:#f0fdf4; color:#1E9C6A; border-color:#6ee7b7; }
.CP-pjcard-bal-row { display:flex; gap:5px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
.CP-pjcard-bal-lbl { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); }
/* Actions column — wide with labeled buttons */
.CP-pjcard-acts {
  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
  padding: 8px 7px; gap: 5px; border-left: 1px solid var(--border,#E9EEF5);
  background: linear-gradient(180deg,#F8FAFC,#F1F5F9);
}
.CP-pjcard-act {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  padding: 6px 8px; border-radius: 7px; border: 1.5px solid;
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.CP-pjcard-act.pay { background:#f0fdf4; border-color:#6ee7b7; color:#1E9C6A; }
.CP-pjcard-act.pay:hover { background:#1E9C6A; border-color:#1E9C6A; color:#fff; box-shadow:0 3px 12px rgba(5,150,105,0.3); transform:translateY(-1px); }
.CP-pjcard-act.bgt { background:#F3E8FF; border-color:#BFDBFE; color:#2563EB; }
.CP-pjcard-act.bgt:hover { background:#2563EB; border-color:#2563EB; color:#fff; box-shadow:0 3px 12px rgba(29,78,216,0.3); transform:translateY(-1px); }
.CP-pjcard-act.edt { background:rgba(59,130,246,0.07); border-color:rgba(59,130,246,0.3); color:#2870CC; }
.CP-pjcard-act.edt:hover { background:#2870CC; border-color:#2870CC; color:#fff; box-shadow:0 3px 12px rgba(59,130,246,0.3); transform:translateY(-1px); }
.CP-pjcard-act.del { background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.25); color:#D93B55; }
.CP-pjcard-act.del:hover { background:#D93B55; border-color:#D93B55; color:#fff; box-shadow:0 3px 12px rgba(239,68,68,0.3); transform:translateY(-1px); }
/* Section header inside main panel */
.CP-main-section-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 4px 6px; margin-bottom: 4px;
}
.CP-main-section-title {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--text-4);
  display: flex; align-items: center; gap: 6px;
}
.CP-main-section-pill {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  color: var(--ember,#2563EB); background: #F3E8FF;
  padding: 2px 8px; border-radius: 100px; border: 1px solid #BFDBFE;
}
/* Client summary mini-stats inside right panel */
.CP-main-stats {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 10px;
  padding: 14px 14px 12px; background: #fff;
  border-bottom: 1.5px solid var(--border,#E9EEF5);
}
@media(max-width:900px){ .CP-main-stats{ grid-template-columns:repeat(2,1fr); } }
.CP-main-stat {
  padding: 12px 14px 13px; border-radius: 12px;
  background: var(--surface,#F1F5F9);
  border: 1.5px solid var(--border,#E9EEF5);
  position: relative; overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  animation: CP-stagger .35s cubic-bezier(.22,1,.36,1) both;
}
.CP-main-stat::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: var(--stat-ac, linear-gradient(90deg,#2563EB,#3B82F6));
  border-radius:12px 12px 0 0; transition: height .18s;
}
.CP-main-stat:hover { transform:translateY(-3px); box-shadow:0 6px 20px rgba(0,0,0,0.1); border-color:#BFDBFE; }
.CP-main-stat:hover::before { height:4px; }
.CP-main-stat-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px; border: 1px solid;
  transition: transform .18s;
}
.CP-main-stat:hover .CP-main-stat-icon { transform: scale(1.1) rotate(-4deg); }
.CP-main-stat-lbl {
  font-family: var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--text-4); margin-bottom: 5px;
}
.CP-main-stat-val {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 18.5px; font-style: normal; font-weight: 800; line-height: 1;
  letter-spacing: -0.5px; font-variant-numeric: tabular-nums;
}
.CP-main-stat-sub {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-4); margin-top: 3px;
}
/* SKELETON */
.CP-skel { background:linear-gradient(90deg,var(--off-white,#F1F5F9) 25%,var(--surface-3,#E9EEF5) 50%,var(--off-white,#F1F5F9) 75%); background-size:700px 100%; animation:CP-shimmer 1.4s infinite linear; border-radius:8px; }
/* EMPTY / FOOTER */
.CP-empty { display:flex; flex-direction:column; align-items:center; padding:60px 24px; text-align:center; }
.CP-empty-ico { width:54px;height:54px;border-radius:50%;background:#F3E8FF;border:1.5px solid #BFDBFE;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;opacity:.7; }
.CP-empty-ttl { font-family:var(--font-body);font-size: 16px;font-style:normal;text-transform:uppercase;font-weight: 800;letter-spacing:0.5px;color:var(--text-2);margin-bottom:6px; }
.CP-empty-sub { font-family:var(--font-mono);font-size: 8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-4); }
/* PROJECT DETAIL PANEL */
.CP-detail-panel { background:var(--white); border-top:1px solid var(--bd); padding:20px 24px 24px 76px; animation:CP-detailIn .25s cubic-bezier(.22,1,.36,1) both; }
.CP-detail-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
@media(max-width:640px){ .CP-detail-stats{ grid-template-columns:repeat(2,1fr); } }
.CP-detail-stat { background:var(--w); border:1px solid var(--bd); border-radius:var(--r2); padding:13px 15px; position:relative; overflow:hidden; transition:transform .2s,box-shadow .2s; }
.CP-detail-stat:hover { transform:translateY(-2px); box-shadow:var(--sh-sm); }
.CP-detail-stat::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(180deg,var(--or),var(--or3)); }
.CP-detail-stat-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--t4); margin-bottom:6px; }
.CP-detail-stat-val { font-family:var(--ff-n); font-size: 17.5px; font-style:normal; font-weight: 800; animation:CP-numTick .4s ease both; font-variant-numeric:tabular-nums; }
.CP-detail-prog { background:var(--w,#fff); border:1.5px solid rgba(29,78,216,0.18); border-radius:var(--r2); padding:14px 16px; margin-bottom:16px; }
.CP-detail-prog-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.CP-detail-prog-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 800; color:var(--t4); text-transform:uppercase; letter-spacing:1.5px; }
.CP-detail-prog-pct { font-family:var(--ff-m); font-size: 16px; font-weight: 800; color:var(--ember,#2563EB); letter-spacing:-0.5px; }
.CP-detail-prog-bar { height:7px; background:rgba(29,78,216,0.1); border-radius:99px; overflow:hidden; }
.CP-detail-prog-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#1D4ED8,#1D4ED8); animation:CP-barFill .9s .1s cubic-bezier(.34,1.2,.64,1) both; min-width:3px; }
.CP-detail-prog-foot { display:flex; gap:0; margin-top:10px; border-top:1px solid var(--bd); padding-top:10px; }
.CP-detail-prog-kpi { display:flex; flex-direction:column; gap:2px; flex:1; }
.CP-detail-prog-kpi:not(:last-child) { border-right:1px solid var(--bd); padding-right:12px; margin-right:12px; }
.CP-detail-prog-kpi-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 700; color:var(--t4); text-transform:uppercase; letter-spacing:1px; }
.CP-detail-prog-kpi-val { font-family:var(--ff-m); font-size: 9.5px; font-weight: 800; color:var(--t1); }
.CP-detail-due { display:flex; align-items:center; gap:8px; padding:9px 14px; margin-bottom:16px; background:var(--gd-t); border:1px solid var(--gd-r); border-radius:var(--r2); }
.CP-detail-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:4px; }
/* TRANSACTION FEED — professional ERP ledger style */
.CP-tx-feed { border-radius:var(--r2); overflow:hidden; border:1px solid var(--bd); background:var(--w); margin-bottom:12px; }
.CP-tx-scroll { max-height:320px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(29,78,216,0.25) transparent; }
.CP-tx-scroll::-webkit-scrollbar { width:5px; }
.CP-tx-scroll::-webkit-scrollbar-thumb { background:rgba(29,78,216,0.22); border-radius:99px; }
.CP-tx-scroll::-webkit-scrollbar-track { background:transparent; }
.CP-tx-feed-hdr { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--off-white,#F8FAFC); border-bottom:1.5px solid var(--bd); }
.CP-tx-feed-title { display:flex; align-items:center; gap:7px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.8px; text-transform:uppercase; color:var(--ember,#2563EB); }
.CP-tx-count-badge { background:rgba(29,78,216,0.1); color:var(--ember,#2563EB); font-family:var(--ff-m); font-size: 8px; font-weight: 800; padding:2px 9px; border-radius:20px; border:1px solid rgba(29,78,216,0.2); }
/* ERP ledger row */
.CP-tx-item { display:grid; grid-template-columns:36px 1fr auto; align-items:center; gap:12px; padding:11px 14px; border-bottom:1px solid var(--bd); transition:background .12s; cursor:pointer; position:relative; animation:CP-txIn .32s cubic-bezier(.22,1,.36,1) both; }
.CP-tx-item:hover { background:rgba(29,78,216,0.03); }
.CP-tx-item:last-child { border-bottom:none; }
.CP-tx-item::before { content:''; position:absolute; left:0; top:6px; bottom:6px; width:2.5px; background:var(--ember,#2563EB); border-radius:0 2px 2px 0; opacity:0; transition:opacity .15s; }
.CP-tx-item:hover::before { opacity:1; }
/* Icon — neutral monochrome */
.CP-tx-icon-erp { width:34px; height:34px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(29,78,216,0.07); border:1px solid rgba(29,78,216,0.16); }
.CP-tx-body { min-width:0; }
.CP-tx-amount { font-family:var(--ff-m); font-size: 11px; font-weight: 800; color:var(--t1); line-height:1.2; font-variant-numeric:tabular-nums; white-space:nowrap; }
.CP-tx-meta { display:flex; align-items:center; gap:8px; margin-top:3px; flex-wrap:wrap; }
.CP-tx-date { font-family:var(--ff-m); font-size: 8px; color:var(--t4); display:flex; align-items:center; gap:3px; }
.CP-tx-mode-badge { display:inline-flex; align-items:center; font-family:var(--ff-m); font-size: 7.5px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase; padding:2px 8px; border-radius:20px; border:1px solid; white-space:nowrap; background:rgba(29,78,216,0.07); color:var(--ember,#2563EB); border-color:rgba(29,78,216,0.18); }
.CP-tx-ref { font-family:var(--ff-m); font-size: 8px; color:var(--t4); }
.CP-tx-right { text-align:right; flex-shrink:0; }
.CP-tx-total { font-family:var(--ff-m); font-size: 10.5px; color:var(--success,#1E7A5A); font-weight: 800; line-height:1.2; font-variant-numeric:tabular-nums; white-space:nowrap; }
.CP-tx-gst { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:2px; }
.CP-tx-view-more { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; background:var(--off-white,#F8FAFC); border-top:1px solid var(--bd); font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:1px; color:var(--ember,#2563EB); cursor:pointer; transition:all .18s; }
.CP-tx-view-more:hover { background:rgba(29,78,216,0.06); gap:14px; }
.CP-tx-empty { display:flex; flex-direction:column; align-items:center; padding:32px 24px; background:var(--off-white,#F8FAFC); text-align:center; }
.CP-tx-empty-icon { width:44px; height:44px; border-radius:50%; background:rgba(29,78,216,0.07); border:1.5px dashed rgba(29,78,216,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:11px; }
.CP-tx-empty-title { font-family:var(--ff-b); font-size: 11.5px; font-style:normal; text-transform:uppercase; font-weight: 800; letter-spacing:0.4px; color:var(--t3); margin-bottom:4px; }
.CP-tx-empty-sub   { font-family:var(--ff-m); font-size: 8px; color:var(--t4); letter-spacing:1px; text-transform:uppercase; }
/* ══ COLLECTION PROGRESS PANEL — warm ember theme, 2026 style ══ */
.CP-prog-panel {
  margin:0 14px 10px; border-radius:18px;
  border:1px solid var(--border,#E2E8F0); overflow:hidden;
  background:var(--white,#FFFFFF);
  box-shadow:0 1px 3px rgba(29,78,216,0.05), 0 12px 30px rgba(29,78,216,0.08);
  animation:bc-in 0.3s both;
}
.CP-prog-hdr {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:13px 16px;
  background:linear-gradient(120deg, var(--off-white,#F8FAFC) 0%, var(--surface,#F1F5F9) 55%, #FBEAD8 100%);
  border-bottom:1px solid rgba(37,99,235,0.14);
  position:relative; overflow:hidden;
}
.CP-prog-hdr::after {
  content:''; position:absolute; left:0; right:0; bottom:0; height:2px;
  background:linear-gradient(90deg,#2563EB,#2563EB,#ffb347,transparent);
}
.CP-prog-hdr-left {
  display:flex; align-items:center; gap:8px;
  font-family:var(--ff-m); font-size: 8px; font-weight: 800;
  letter-spacing:1.8px; text-transform:uppercase; color:#64748B;
}
.CP-prog-hdr-icon {
  width:24px; height:24px; border-radius:8px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,rgba(37,99,235,0.16),rgba(37,99,235,0.06));
  border:1px solid rgba(37,99,235,0.28);
  box-shadow:0 2px 6px rgba(37,99,235,0.12);
}
.CP-prog-hdr-badge {
  font-family:var(--ff-m); font-size: 8px; font-weight: 800;
  letter-spacing:1px; text-transform:uppercase;
  padding:5px 11px; border-radius:99px; white-space:nowrap;
  border:1px solid transparent;
}
.CP-prog-hdr-badge.good { background:rgba(37,99,235,0.12); color:#2563EB; border-color:rgba(37,99,235,0.28); }
.CP-prog-hdr-badge.mid  { background:rgba(196,126,10,0.14); color:#3B82F6; border-color:rgba(196,126,10,0.28); }
.CP-prog-hdr-badge.low  { background:rgba(220,38,38,0.12); color:#b91c1c; border-color:rgba(220,38,38,0.24); }
.CP-prog-body {
  display:flex; align-items:center; gap:22px; padding:20px 18px;
  background:radial-gradient(circle at 0% 0%, rgba(37,99,235,0.045), transparent 55%);
}
.CP-prog-ring-wrap {
  flex-shrink:0; position:relative; display:flex; align-items:center; justify-content:center;
}
.CP-prog-ring-wrap::before {
  content:''; position:absolute; inset:-8px; border-radius:50%;
  background:radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 72%);
}
.CP-prog-svg {
  width:136px; height:136px; display:block; position:relative;
  filter:drop-shadow(0 6px 16px rgba(37,99,235,0.24));
}
/* Right side — elevated KPI cards */
.CP-prog-stats { flex:1; display:flex; flex-direction:column; gap:9px; min-width:0; }
.CP-kpi-card {
  position:relative; overflow:hidden;
  background:linear-gradient(135deg,var(--white,#FFFFFF) 0%,var(--off-white,#F8FAFC) 100%);
  border:1px solid var(--border,#E2E8F0); border-radius:13px;
  padding:10px 13px 11px;
  box-shadow:0 1px 2px rgba(29,78,216,0.03);
  transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  animation:bc-in 0.35s both;
}
.CP-kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.CP-kpi-card.collected::before { background:linear-gradient(90deg,#2563EB,#2563EB,#ffb347); }
.CP-kpi-card.pending::before   { background:linear-gradient(90deg,#D93B55,#f87171); }
.CP-kpi-card.total::before     { background:linear-gradient(90deg,#1D4ED8,#3B82F6); }
.CP-kpi-card:hover { transform:translateY(-2px); box-shadow:0 10px 22px rgba(29,78,216,0.1); border-color:rgba(37,99,235,0.3); }
.CP-kpi-top { display:flex; align-items:center; gap:7px; margin-bottom:7px; }
.CP-kpi-icon {
  width:21px; height:21px; border-radius:7px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.CP-kpi-icon.collected { background:rgba(37,99,235,0.13); }
.CP-kpi-icon.pending   { background:rgba(220,38,38,0.13); }
.CP-kpi-icon.total     { background:rgba(37,99,235,0.13); }
.CP-kpi-lbl { font-family:var(--ff-m); font-size: 8px; color:var(--t4); text-transform:uppercase; letter-spacing:1px; font-weight: 800; }
.CP-kpi-val { font-family:var(--ff-m); font-size: 14px; font-weight: 800; letter-spacing:-0.3px; margin-bottom:7px; font-variant-numeric:tabular-nums; }
/* Animated progress bar */
.CP-kpi-bar-track { height:5px; background:rgba(29,78,216,0.07); border-radius:100px; overflow:hidden; margin-bottom:5px; }
@keyframes CP-bar-grow { from { width:0 !important; } }
.CP-kpi-bar-fill { height:100%; border-radius:100px; animation:CP-bar-grow 1s cubic-bezier(0.4,0,0.2,1) both; }
.CP-kpi-sub { font-family:var(--ff-m); font-size: 7.5px; color:var(--t4); letter-spacing:0.3px; }
@media(max-width:520px){
  .CP-prog-body { flex-direction:column; align-items:stretch; gap:14px; }
  .CP-prog-ring-wrap { display:flex; justify-content:center; }
}
/* ══ COMPACT PAYMENT LIST ══ */
.CP-pay-block { margin:0 14px 12px; border-radius:10px; border:1.5px solid var(--bd); overflow:hidden; }
.CP-pay-block-hdr {
  display:flex; align-items:center; gap:7px; padding:7px 11px;
  background:rgba(29,78,216,0.04); border-bottom:1px solid var(--bd);
  font-family:var(--ff-m); font-size: 8px; font-weight: 800;
  letter-spacing:1.5px; text-transform:uppercase; color:#2563EB;
}
.CP-pay-block-badge {
  display:inline-flex; align-items:center; justify-content:center;
  background:#2563EB; color:#fff; border-radius:100px;
  font-size: 7.5px; font-weight: 800; min-width:17px; height:17px;
  padding:0 5px; line-height:1; letter-spacing:0;
}
.CP-pay-list { }
.CP-pay-row {
  display:grid; grid-template-columns:minmax(64px,auto) 1fr minmax(78px,auto) auto;
  align-items:center; gap:6px; padding:6px 10px;
  border-bottom:1px solid var(--bd); background:#fff;
  animation:bc-in 0.28s cubic-bezier(0.4,0,0.2,1) both;
  transition:background 0.12s;
}
.CP-pay-row:last-child { border-bottom:none; }
.CP-pay-row:hover { background:rgba(37,99,235,0.045); }
.CP-pay-mode {
  font-family:var(--ff-m); font-size: 7px; font-weight: 800;
  letter-spacing:0.6px; color:#2563EB;
  background:rgba(29,78,216,0.08); border:1px solid rgba(29,78,216,0.18);
  border-radius:5px; padding:2px 6px; white-space:nowrap; flex-shrink:0;
  justify-self:start;
}
/* Highlighted, centered amount */
.CP-pay-amt {
  font-family:var(--ff-m); font-size: 10px; font-weight: 900;
  color:#2563EB; text-align:center; justify-self:center;
  background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(37,99,235,0.04));
  border:1px solid rgba(37,99,235,0.22); border-radius:7px;
  padding:3px 10px; white-space:nowrap; letter-spacing:-0.2px;
}
/* Highlighted date pill */
.CP-pay-date {
  display:inline-flex; align-items:center; gap:3px; justify-self:end;
  font-family:var(--ff-m); font-size: 7.5px; font-weight: 800; color:#64748B;
  background:var(--surface,#F1F5F9); border:1px solid var(--border,#E2E8F0);
  border-radius:6px; padding:3px 7px; white-space:nowrap;
}
.CP-pay-more {
  width:100%; display:flex; align-items:center; justify-content:center; gap:5px;
  padding:7px 12px; text-align:center;
  font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:0.5px; text-transform:uppercase;
  color:#2563EB; cursor:pointer;
  background:rgba(37,99,235,0.045); border:none; border-top:1px solid var(--bd);
  transition:background .15s, color .15s;
}
.CP-pay-more:hover { background:rgba(37,99,235,0.1); color:#1D4ED8; }
.CP-pay-empty {
  padding:14px 12px; text-align:center;
  font-family:var(--ff-m); font-size: 9px; color:var(--t4); font-style:italic;
}
@media(max-width:420px){
  .CP-pay-row { grid-template-columns:auto 1fr auto auto; gap:4px; padding:6px 8px; }
  .CP-pay-amt { font-size: 9px; padding:2px 7px; }
}

/* ── BUDGET HISTORY ── */
.CP-bgt-hist { margin:0 14px 14px; border-radius:10px; border:1.5px solid rgba(37,99,235,0.25); background:linear-gradient(135deg,#F8FAFC,#fff); overflow:hidden; animation:bc-in 0.35s both; }
.CP-bgt-hist-hdr { display:flex; align-items:center; gap:7px; padding:9px 14px 8px; background:rgba(37,99,235,0.07); border-bottom:1px solid rgba(37,99,235,0.15); font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:#1D4ED8; }
.CP-bgt-hist-count { background:rgba(37,99,235,0.15); color:#1D4ED8; font-family:var(--ff-m); font-size: 8px; font-weight: 800; padding:1px 7px; border-radius:100px; border:1px solid rgba(37,99,235,0.3); margin-left:auto; }
.CP-bgt-hist-list { padding:8px 12px 10px; display:flex; flex-direction:column; gap:6px; }
.CP-bgt-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; background:#fff; border:1px solid rgba(37,99,235,0.15); animation:bc-in 0.3s cubic-bezier(0.4,0,0.2,1) both; transition:box-shadow .2s, border-color .2s; }
.CP-bgt-item:hover { box-shadow:0 2px 10px rgba(37,99,235,0.1); border-color:rgba(37,99,235,0.3); }
.CP-bgt-item-icon { font-size: 14px; flex-shrink:0; }
.CP-bgt-item-body { flex:1; min-width:0; }
.CP-bgt-item-amt { font-family:var(--ff-m); font-size: 10.5px; font-weight: 800; color:#1D4ED8; }
.CP-bgt-item-reason { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.CP-bgt-item-date { display:flex; align-items:center; gap:4px; font-family:var(--ff-m); font-size: 8px; color:var(--t4); flex-shrink:0; }

/* ── DETAIL STAT ANIMATED ── */
.CP-detail-stat { animation:bc-in 0.3s cubic-bezier(0.4,0,0.2,1) both; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; background:#fff; border:1px solid var(--bd); border-radius:10px; text-align:center; }
.CP-detail-stat-lbl { font-family:var(--ff-m); font-size: 8px; color:var(--t4); text-transform:uppercase; letter-spacing:1px; }
.CP-detail-stat-val { font-family:var(--ff-m); font-size: 10.5px; font-weight: 800; }

/* TABLE FOOTER */
.CP-tbl-foot { display:grid; grid-template-columns:48px 1fr 80px 100px 120px 120px 90px 120px 1fr; padding:13px 24px; background:var(--surface-2); border-top:2px solid var(--or); }
.CP-foot-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:2px; text-transform:uppercase; color:var(--t4); display:flex; align-items:center; }
.CP-foot-val { font-family:var(--ff-m); font-size: 10px; font-weight: 800; display:flex; justify-content:flex-end; align-items:center; animation:CP-numTick .5s ease both; }

/* EMPTY */
.CP-empty { display:flex; flex-direction:column; align-items:center; padding:60px 24px; text-align:center; }
.CP-empty-ico { width:54px; height:54px; border-radius:50%; background:var(--or-t); border:1.5px solid var(--or-r); display:flex; align-items:center; justify-content:center; margin-bottom:16px; color:var(--or); opacity:.8; }
.CP-empty-ttl { font-family:var(--ff-b); font-size: 16px; font-style:normal; text-transform:uppercase; font-weight: 800; letter-spacing:0.5px; color:var(--grey); margin-bottom:6px; }
.CP-empty-sub { font-family:var(--ff-m); font-size: 8px; letter-spacing:1.5px; text-transform:uppercase; color:var(--t4); max-width:340px; }

/* SKELETON */
.CP-skel { background:linear-gradient(90deg,var(--off-white) 25%,var(--surface-3) 50%,var(--off-white) 75%); background-size:700px 100%; animation:CP-shimmer 1.6s infinite linear; border-radius:var(--r2); }

/* SPINNER */
.CP-spinner    { display:inline-block; width:12px; height:12px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:CP-spin .65s linear infinite; }
.CP-spinner-or { display:inline-block; width:14px; height:14px; border:2px solid var(--or-r); border-top-color:var(--or); border-radius:50%; animation:CP-spin .65s linear infinite; }

/* MODAL SYSTEM */
.CP-modal-bg  { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.55); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; animation:CP-bdIn .18s ease both; }
.CP-modal-box { background:var(--w); border-radius:22px; width:100%; max-width:580px; max-height:90vh; overflow-y:auto; overflow-x:hidden; box-shadow:0 24px 64px rgba(0,0,0,.18),0 4px 16px rgba(0,0,0,.1); animation:CP-popIn .32s cubic-bezier(0.34,1.56,0.64,1) both; border:1px solid var(--bd); scrollbar-width:thin; scrollbar-color:var(--bd) transparent; }
.CP-modal-box::-webkit-scrollbar { width:3px; }
.CP-modal-box::-webkit-scrollbar-thumb { background:var(--bd2); border-radius:3px; }
.CP-modal-top { height:3px; border-radius:var(--r4) var(--r4) 0 0; overflow:hidden; }
.CP-modal-top::after { content:''; display:none; }
.CP-modal-body { padding:20px 24px 28px; }
.CP-modal-hdr  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; gap:12px; }
.CP-modal-hdr-l{ display:flex; align-items:center; gap:11px; }
.CP-modal-ttl  { font-family:var(--ff-b); font-size: 15px; font-style:normal; text-transform:uppercase; font-weight: 800; letter-spacing:0.5px; color:#2563EB; line-height:1.1; }
.CP-modal-sub  { font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:#2563EB; margin-top:3px; }
.CP-modal-ttl-ico { width:38px; height:38px; border-radius:var(--r2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
@keyframes CP-cls-pop { 0%{transform:rotate(0) scale(1)} 45%{transform:rotate(-14deg) scale(1.22)} 80%{transform:rotate(4deg) scale(0.95)} 100%{transform:rotate(0) scale(1)} }
.CP-modal-cls  { width:42px; height:42px; border-radius:var(--r2); background:var(--cr2); border:1.5px solid var(--bd); cursor:pointer; font-size: 21px; display:flex; align-items:center; justify-content:center; color:var(--t3); transition:background .15s,border-color .15s,color .15s,box-shadow .15s; line-height:1; flex-shrink:0; }
.CP-modal-cls:hover { background:var(--rd,#c0312a); border-color:var(--rd,#c0312a); color:#fff; box-shadow:0 0 0 3px rgba(192,49,42,.18),0 6px 16px rgba(192,49,42,.24); animation:CP-cls-pop .30s cubic-bezier(.34,1.56,.64,1) both; }

/* FORM DIALOG SYSTEM — Add Client / Collect Payment / Add Budget / Add
   Project. Centered popup dialog over a dim/blurred backdrop, sized like
   Accounts Payable's Add Ledger/Bill/Repayment dialogs (not a full page):
   a floating rounded card with a staged pop-in (card overshoots slightly
   then settles, header icon pops a beat later) and an X to dismiss. */
@keyframes CP-fpModalIn {
  0%   { opacity:0; transform:scale(0.86) translateY(32px); filter:blur(4px); }
  55%  { opacity:1; transform:scale(1.018) translateY(-3px); filter:blur(0); }
  100% { opacity:1; transform:scale(1) translateY(0); filter:blur(0); }
}
@keyframes CP-fpIconPop {
  0%   { opacity:0; transform:scale(0.5) rotate(-10deg); }
  65%  { opacity:1; transform:scale(1.14) rotate(4deg); }
  100% { opacity:1; transform:scale(1) rotate(0deg); }
}
.CP-fp-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15,23,42,0.52);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: CP-bdIn 0.22s ease both;
}
.CP-fp-modal {
  position: relative;
  background: var(--w,#fff);
  border-radius: 22px; width: 100%; max-width: 960px; min-height: min(740px, 88dvh); max-height: min(94dvh, 92vh);
  box-shadow: 0 6px 28px rgba(0,0,0,0.10), 0 32px 88px rgba(0,0,0,0.24); border: none;
  /* The modal card itself no longer scrolls (overflow:hidden + flex column)
     — only .CP-modal-body does, internally. Previously the card itself was
     the scroll container, which left the absolutely-positioned success
     celebration (a sibling, inset:0 relative to this box) sized to less
     than the full card in some cases — it now reliably covers the whole
     dialog (top strip + body), matching Accounts Payable's version. */
  overflow: hidden; display: flex; flex-direction: column;
  animation: CP-fpModalIn 0.42s cubic-bezier(0.22,1,0.36,1) both;
}
.CP-fp-modal .CP-modal-top { border-radius: 22px 22px 0 0; flex-shrink: 0; }
.CP-fp-modal .CP-modal-body { padding: 22px 26px 28px; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; }
/* Collect Payment / Add Budget carries a full Transaction/Budget History
   table + summary cards below the form, so it needs noticeably more room
   than the simpler Add Client / Add Project forms. */
.CP-fp-modal.CP-fp-modal-lg { max-width: 1020px; min-height: min(760px, 88dvh); }
.CP-fp-modal .CP-modal-body::-webkit-scrollbar { width: 3px; }
.CP-fp-modal .CP-modal-body::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 3px; }
.CP-fp-modal .CP-modal-ttl-ico { animation: CP-fpIconPop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
@media(max-width:640px){
  .CP-fp-overlay { padding:0; align-items:flex-end; }
  .CP-fp-modal { max-width:100%; min-height:0; border-radius:18px 18px 0 0; max-height:min(94dvh,94vh); }
  .CP-fp-modal .CP-modal-top { border-radius: 18px 18px 0 0; }
}

/* Close (X) button — standard dismissible-dialog control, replacing the old
   "Back" pill now this is a popup again, not a full page. Rotates open on
   hover/press for a livelier feel than a flat icon swap. */
.CP-fp-close {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  background: #fff; border: 1.5px solid #BFDBFE;
  cursor: pointer; color: #9a3412;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.CP-fp-close svg { transition: transform 0.18s; }
.CP-fp-close:hover { background: #F3E8FF; border-color: #60A5FA; color: #2563EB; transform: rotate(90deg); box-shadow: 0 3px 10px rgba(29,78,216,0.14); }
.CP-fp-close:active { transform: rotate(90deg) scale(0.9); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

/* modal tabs */
.CP-modal-tabs { display:flex; gap:0; margin-bottom:22px; background:var(--surface); border-radius:var(--r2); padding:4px; border:1px solid var(--bd); }
.CP-modal-tab  { flex:1; padding:9px 12px; border-radius:var(--r1); font-family:var(--ff-b); font-size: 9.5px; font-weight: 700; cursor:pointer; text-align:center; transition:all .2s; border:none; background:transparent; color:var(--t3); }
.CP-modal-tab.active { background:var(--w); color:var(--t1); box-shadow:var(--sh-sm); }

/* form elements */
.CP-modal-divider { display:flex; align-items:center; gap:10px; margin:16px 0 12px; }
.CP-modal-div-tag { font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:2px; text-transform:uppercase; padding:4px 11px; border-radius:var(--r-sm); }
.CP-modal-div-tag.jade { color:var(--jade); background:var(--jade-t); border:1px solid var(--jade-r); }
.CP-modal-div-tag.gold { color:var(--gold); background:var(--gold-t); border:1px solid var(--gold-r); }
.CP-modal-div-tag.iris { color:var(--iris2); background:var(--iris-t); border:1px solid var(--iris-r); }
.CP-modal-div-line { flex:1; height:1px; background:var(--bd); }
.CP-g2 { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
.CP-g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
@media(max-width:480px){ .CP-g2,.CP-g3{ grid-template-columns:1fr; } }
.CP-field { display:flex; flex-direction:column; gap:5px; }
.CP-label { font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:2.5px; text-transform:uppercase; color:var(--t3); display:flex; align-items:center; gap:5px; }
.CP-label .req { color:var(--rd); font-size: 9.5px; line-height:1; }
.CP-label .opt { font-family:var(--ff-b); font-size: 8px; color:var(--t4); font-weight: 600; letter-spacing:0; text-transform:none; font-style:italic; }
.CP-input, .CP-textarea { padding:9px 12px; border-radius:var(--r2); border:1.5px solid var(--bd); background:var(--w); font-family:var(--ff-b); font-size: 10.5px; font-weight: 700; color:var(--t1); outline:none; width:100%; box-sizing:border-box; transition:border-color .16s,box-shadow .16s; }
.CP-input:focus,.CP-textarea:focus { border-color:var(--or2); box-shadow:0 0 0 3px var(--or-t); }
.CP-textarea { resize:vertical; min-height:70px; line-height:1.6; }

/* mini stat cards in modals */
.CP-mini-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; }
.CP-mini-card  { border-radius:var(--r2); padding:12px 14px; position:relative; overflow:hidden; }
.CP-mini-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; border-radius:var(--r2) 0 0 var(--r2); }
.CP-mini-card.jade   { background:var(--jade-t); border:1px solid var(--jade-r); }
.CP-mini-card.jade::before { background:var(--jade); }
.CP-mini-card.gold   { background:var(--gold-t); border:1px solid var(--gold-r); }
.CP-mini-card.gold::before { background:var(--gold); }
.CP-mini-card.crimson{ background:var(--crimson-t); border:1px solid var(--crimson-r); }
.CP-mini-card.crimson::before { background:var(--crimson); }
.CP-mini-lbl { font-family:var(--ff-m); font-size: 7.5px; font-weight: 800; text-transform:uppercase; letter-spacing:.08em; color:var(--t4); margin-bottom:5px; }
.CP-mini-val { font-family:var(--ff-n); font-size: 16px; font-style:normal; font-weight: 800; line-height:1; font-variant-numeric:tabular-nums; }

/* preview */
.CP-preview { border-radius:11px; padding:13px 16px; display:flex; align-items:center; gap:20px; margin-top:14px; }
.CP-preview.jade { background:var(--jade-t); border:1px solid var(--jade-r); }
.CP-preview.gold { background:var(--gold-t); border:1px solid var(--gold-r); }
.CP-preview-lbl { font-family:var(--ff-m); font-size: 8px; color:var(--t4); text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
.CP-preview-val { font-family:var(--ff-n); font-size: 17.5px; font-style:normal; font-weight: 800; line-height:1; font-variant-numeric:tabular-nums; }

/* bstripe */
.CP-bstripe { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; background:var(--gold-t); border:1px solid var(--gold-r); border-radius:11px; padding:13px 15px; margin-bottom:18px; }
.CP-bs-lbl  { font-family:var(--ff-m); font-size: 7.5px; color:var(--t4); text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; }
.CP-bs-val  { font-family:var(--ff-n); font-size: 13px; font-style:normal; font-weight: 800; line-height:1; font-variant-numeric:tabular-nums; }

/* wizard */
.CP-wizard { display:flex; gap:0; margin-bottom:22px; border-radius:var(--r2); overflow:hidden; border:1px solid var(--bd); }
.CP-wtab   { flex:1; padding:11px 12px; display:flex; align-items:center; gap:8px; font-family:var(--ff-b); font-size: 9.5px; font-weight: 700; cursor:pointer; transition:all .18s; background:var(--surface); color:var(--t3); border:none; border-right:1px solid var(--bd); }
.CP-wtab:last-child { border-right:none; }
.CP-wtab.active { background:var(--w); color:var(--gd); }
.CP-wtab.done   { background:var(--jade-t); color:var(--jade); }
.CP-wnum { width:21px; height:21px; border-radius:50%; background:var(--bd); display:flex; align-items:center; justify-content:center; font-size: 9px; font-weight: 800; font-family:var(--ff-m); flex-shrink:0; }
.CP-wtab.active .CP-wnum { background:var(--gd); color:#fff; }
.CP-wtab.done   .CP-wnum { background:var(--jade); color:#fff; }

/* cci */
.CP-cci { background:var(--gold-t); border:1px solid var(--gold-r); border-radius:var(--r2); padding:12px 14px; margin-bottom:16px; display:flex; align-items:center; gap:11px; }
.CP-cci-av { width:38px; height:38px; border-radius:var(--r2); flex-shrink:0; background:linear-gradient(135deg,var(--or,#2563EB),var(--or2,#3B82F6)); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--ff-d); font-size: 14px; font-style:italic; }

/* modal actions */
.CP-modal-actions { display:flex; gap:9px; margin-top:22px; flex-wrap:wrap; padding-top:18px; border-top:1px solid var(--bd); align-items:center; }
.CP-modal-msg { display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:10px; margin-top:12px; font-size: 10.5px; font-weight: 700; border:1px solid; animation:CP-slideUp .2s ease both; }
.CP-modal-msg.ok  { background:var(--emerald-t); color:var(--emerald); border-color:var(--emerald-r); }
.CP-modal-msg.err { background:var(--rd-t); color:var(--rd); border-color:var(--rd-r); }

/* payment table */
.CP-pay-tbl-wrap { border-radius:var(--r2); border:1.5px solid var(--bd); overflow-y:auto; overflow-x:hidden; background:var(--w); scrollbar-width:thin; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
.CP-pay-tbl-wrap::-webkit-scrollbar { width:4px; height:4px; }
.CP-pay-tbl-wrap::-webkit-scrollbar-thumb { background:var(--bd2); border-radius:4px; }
.CP-pay-tbl { width:100%; border-collapse:collapse; font-size: 9px; }
.CP-pay-tbl thead { position:sticky; top:0; z-index:5; }
.CP-pay-tbl thead tr { background:var(--surface-2,#E9EEF5); border-bottom:2px solid var(--ember,#2563EB); }
.CP-pay-tbl th { padding:9px 12px; text-align:left; white-space:nowrap; font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:.1em; color:var(--text-3,#27364A); background:transparent; border-bottom:none; border-right:1px solid var(--border,#E9EEF5); }
.CP-pay-tbl th:last-child { border-right:none; }
.CP-pay-tbl th.num, .CP-pay-tbl td.num { text-align:right; }
.CP-pay-tbl td { padding:8px 12px; font-size: 9px; font-weight: 700; border-bottom:1px solid var(--bd); border-right:1px solid var(--bd); color:var(--t1); vertical-align:middle; white-space:nowrap; transition:background .1s; }
.CP-pay-tbl td:last-child { border-right:none; }
.CP-pay-tbl tbody tr { animation:bc-in 0.25s cubic-bezier(0.4,0,0.2,1) both; }
.CP-pay-tbl tr:last-child td { border-bottom:none; }
.CP-pay-tbl tbody tr:nth-child(even) td { background:var(--off-white,#FAF8F4); }
.CP-pay-tbl tbody tr:hover td { background:var(--or-t,rgba(37,99,235,.07)); }
.CP-pay-tbl tfoot td { padding:9px 12px; font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:var(--or,#2563EB); background:var(--or-t,rgba(37,99,235,.08)); border-top:2px solid var(--or-r,rgba(37,99,235,.3)); border-right:1px solid var(--bd); position:sticky; bottom:0; z-index:4; }
.CP-pay-tbl tfoot td:last-child { border-right:none; }

/* Pagination bar under Transaction History */
.CP-tx-page-bar { display:flex; align-items:center; justify-content:space-between; padding:10px 4px 0; }
.CP-tx-page-info { font-family:var(--ff-m); font-size: 8px; font-weight: 800; color:var(--t3); letter-spacing:.04em; }
.CP-tx-page-btns { display:flex; align-items:center; gap:6px; }
.CP-tx-page-btn {
  display:flex; align-items:center; justify-content:center; gap:4px;
  height:26px; padding:0 11px; border-radius:7px;
  background:#fff; border:1.5px solid #BFDBFE; color:#9a3412;
  font-family:var(--ff-m); font-size: 8.5px; font-weight: 800;
  cursor:pointer; transition:background .16s,border-color .16s,color .16s,transform .16s,box-shadow .16s;
}
.CP-tx-page-btn:hover:not(:disabled) { background:#F3E8FF; border-color:#60A5FA; color:#2563EB; transform:translateY(-1px); box-shadow:0 3px 8px rgba(29,78,216,0.14); }
.CP-tx-page-btn:active:not(:disabled) { transform:translateY(0) scale(0.96); }
.CP-tx-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.CP-tx-page-num { font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:#2563EB; min-width:20px; text-align:center; }

/* Transaction summary cards (Total Transactions / Average Payment / Outstanding Balance) */
.CP-tx-sumcard { position:relative; overflow:hidden; border-radius:11px; padding:12px 14px; transition:transform .16s,box-shadow .16s; }
.CP-tx-sumcard:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.08); }
.CP-tx-sumcard-top { position:absolute; top:0; left:0; right:0; height:3px; }
.CP-tx-sumcard-row { display:flex; align-items:center; gap:10px; }
.CP-tx-sumcard-ic { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.CP-tx-sumcard-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
.CP-tx-sumcard-val { font-family:var(--ff-m); font-size: 16px; font-weight: 800; line-height:1; font-variant-numeric:tabular-nums; }
.CP-bud-tbl-wrap { border-radius:var(--r2); border:1.5px solid var(--bd); overflow-y:auto; overflow-x:hidden; background:var(--w); scrollbar-width:thin; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
.CP-bud-tbl { width:100%; border-collapse:collapse; font-size: 9px; }
.CP-bud-tbl thead tr { background:var(--surface-2,#E9EEF5); border-bottom:2px solid var(--ember,#2563EB); }
.CP-bud-tbl th { padding:9px 12px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:.1em; color:var(--text-3,#27364A); background:transparent; border-bottom:none; border-right:1px solid var(--border,#E9EEF5); text-align:left; white-space:nowrap; }
.CP-bud-tbl th:last-child { border-right:none; }
.CP-bud-tbl th.num,.CP-bud-tbl td.num { text-align:right; }
.CP-bud-tbl td { padding:8px 12px; font-size: 9px; font-weight: 700; border-bottom:1px solid var(--bd); border-right:1px solid var(--bd); color:var(--t1); white-space:nowrap; vertical-align:middle; }
.CP-bud-tbl td:last-child { border-right:none; }
.CP-bud-tbl tbody tr { animation:bc-in 0.25s cubic-bezier(0.4,0,0.2,1) both; }
.CP-bud-tbl tr:last-child td { border-bottom:none; }
.CP-bud-tbl tbody tr:nth-child(even) td { background:var(--off-white,#FAF8F4); }
.CP-bud-tbl tbody tr:hover td { background:var(--or-t,rgba(37,99,235,.07)); }
.CP-bud-tbl tfoot td { padding:9px 12px; font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:var(--or,#2563EB); background:var(--or-t,rgba(37,99,235,.08)); border-top:2px solid var(--or-r,rgba(37,99,235,.3)); border-right:1px solid var(--bd); position:sticky; bottom:0; }
.CP-bud-tbl tfoot td:last-child { border-right:none; }
.CP-req-note { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:10px; display:flex; align-items:center; gap:5px; }

/* custom DD */
.CP-dd { position:relative; width:100%; }
.CP-dd-trigger { width:100%; padding:10px 13px; border-radius:var(--r2); border:1.5px solid var(--bd); background:var(--w); font-family:var(--ff-b); font-size: 11px; font-weight: 700; color:var(--t1); display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:border-color .16s,box-shadow .16s; text-align:left; gap:7px; min-height:44px; box-sizing:border-box; }
.CP-dd-trigger.ph { color:var(--t4); font-style:italic; font-weight: 600; }
.CP-dd-trigger.open,.CP-dd-trigger:hover:not(:disabled) { border-color:var(--or2); box-shadow:0 0 0 3px var(--or-t); }
.CP-dd-trigger:disabled { opacity:.5; cursor:not-allowed; background:var(--off-white); }
.CP-dd-chev { width:14px; height:14px; color:var(--t4); transition:transform .2s,color .15s; flex-shrink:0; }
.CP-dd-chev.open { transform:rotate(180deg); color:var(--or); }
.CP-dd-clear { display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px; border-radius:50%; font-size: 8px; color:var(--t4,#aaa); cursor:pointer; transition:background .12s,color .12s; }
.CP-dd-clear:hover { background:rgba(192,49,42,.12); color:var(--rd,#c0312a); }
.CP-dd-panel { position:absolute; left:0; right:0; top:calc(100% + 4px); background:var(--w); border:1.5px solid var(--or2); border-radius:var(--r2); box-shadow:0 12px 32px rgba(0,0,0,.12); z-index:99999; overflow:hidden; animation:erp-slide-down .14s ease both; }
.CP-dd-item { padding:10px 14px; font-family:var(--ff-b); font-size: 10.5px; font-weight: 700; cursor:pointer; display:flex; align-items:center; justify-content:space-between; transition:background .1s; color:var(--t2); border-bottom:1px solid var(--bd); }
.CP-dd-item:last-child { border-bottom:none; }
.CP-dd-item:hover { background:var(--or-t); color:var(--t1); }
.CP-dd-item.sel { color:var(--or); font-weight: 800; background:var(--or-t); }
.CP-dd-check { color:var(--or); font-weight: 800; font-size: 10.5px; }
.CP-dd-search { display:flex; align-items:center; gap:7px; padding:8px 12px; border-bottom:1px solid var(--bd); background:var(--off-white); position:sticky; top:0; }
.CP-dd-search-inp { flex:1; background:transparent; border:none; outline:none; font-size: 10.5px; color:var(--t1); font-family:var(--ff-b); caret-color:var(--or); }
.CP-dd-list { max-height:200px; overflow-y:auto; }
.CP-dd-list::-webkit-scrollbar { width:3px; }
.CP-dd-list::-webkit-scrollbar-thumb { background:var(--bd2); border-radius:3px; }
.CP-dd-footer { padding:5px 12px; font-family:var(--ff-m); font-size: 8px; letter-spacing:.5px; color:var(--t4); border-top:1px solid var(--bd); background:var(--off-white); text-align:right; }
.CP-bio-sel { display:flex; align-items:center; gap:9px; flex:1; min-width:0; }
.CP-bio-av  { width:26px; height:26px; border-radius:7px; background:linear-gradient(135deg,var(--or,#2563EB),var(--or2,#3B82F6)); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--ff-d); font-size: 9.5px; font-style:italic; flex-shrink:0; }
.CP-bio-nm  { font-size: 10.5px; font-weight: 800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.CP-bio-id  { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:1px; }

/* CP-tx-grid removed — single-column ledger layout */

/* ══ COMPREHENSIVE RESPONSIVE ══ */
/* Large Desktop (1400px+): full columns */
@media(min-width:1400px){
  .CP-col-head,.CP-cli-row,.CP-tbl-foot{ grid-template-columns:48px 1fr 80px 100px 130px 130px 90px 130px 1fr; }
  .CP-proj-col-head,.CP-proj-row{ grid-template-columns:38px 1fr 88px 96px 110px 110px 90px 108px 1fr; }
}

/* Medium desktop (1100-1399px) */
@media(max-width:1399px) and (min-width:1101px){
  .CP-col-head,.CP-cli-row,.CP-tbl-foot{ grid-template-columns:44px 1fr 76px 92px 116px 116px 84px 116px 1fr; }
  .CP-proj-col-head,.CP-proj-row{ grid-template-columns:34px 1fr 80px 88px 100px 100px 82px 100px 1fr; }
}

/* Tablet landscape (900-1100px) */
@media(max-width:1100px){
  .CP-col-head,.CP-cli-row,.CP-tbl-foot{ grid-template-columns:40px 1fr 96px 108px 140px; }
  .CP-proj-col-head,.CP-proj-row{ grid-template-columns:34px 1fr 86px 94px 100px; padding-left:14px!important; }
  .CP-detail-panel{ padding-left:14px; }
  .CP-hide-md{ display:none!important; }
}

/* Tablet portrait (640-900px) */
@media(max-width:900px){
  .CP-col-head,.CP-cli-row,.CP-tbl-foot{ grid-template-columns:36px 1fr 90px 130px; padding:0 16px; }
  .CP-proj-col-head,.CP-proj-row{ grid-template-columns:30px 1fr 84px 90px; padding:0 16px 0 10px!important; }
  .CP-hdr-inner{ flex-direction:column; gap:16px; }
  .CP-hdr-actions{ width:100%; justify-content:flex-end; }
  .CP-brand-name{ font-size: 24.5px; }
  .CP-detail-stats{ grid-template-columns:repeat(2,1fr); }
  .CP-stat-val{ font-size: 19.5px; } .CP-stat-val.or,.CP-stat-val.gr,.CP-stat-val.rd{ font-size: 16px; }
}

/* Mobile large (480-640px) */
@media(max-width:640px){
  .CP-col-head,.CP-cli-row,.CP-tbl-foot{ grid-template-columns:30px 1fr 110px; padding:0 12px; }
  .CP-proj-col-head,.CP-proj-row{ grid-template-columns:26px 1fr 90px; padding:0 12px 0 8px!important; }
  .CP-hide-sm{ display:none!important; }
  .CP-stats{ grid-template-columns:repeat(2,1fr); gap:8px; }
  .CP-stat{ padding:16px 14px 13px; }
  .CP-stat-val{ font-size: 17.5px; } .CP-stat-val.or,.CP-stat-val.gr,.CP-stat-val.rd{ font-size: 15px; }
  .CP-brand-icon{ width:44px; height:44px; }
  .CP-brand-name{ font-size: 21px; }
  .CP-tbl-top-bar{ padding:14px 16px; }
  .CP-tx-grid{ grid-template-columns:1fr; }
  .CP-tx-grid .CP-tx-item{ border-right:none; }
  .CP-detail-panel{ padding:16px 12px 18px 12px; }
  .CP-detail-actions{ flex-wrap:wrap; }
}

.DB-stat-delta { display:flex; align-items:center; gap:5px; margin-top:6px; font-family:var(--ff-m); font-size: 8px; font-weight: 700; color:var(--t4); letter-spacing:0.5px; }
.CP-root .ERP-stats { padding: 24px 40px 0; margin-bottom: 28px; }
@media(max-width:1200px){ .CP-root .ERP-stats{ padding:20px 28px 0; } }
@media(max-width:900px){ .CP-root .ERP-stats{ padding:16px 18px 0; grid-template-columns:repeat(3,1fr)!important; } }
@media(max-width:600px){ .CP-root .ERP-stats{ padding:12px 12px 0; grid-template-columns:repeat(2,1fr)!important; gap:10px!important; } }
@media(max-width:420px){ .CP-root .ERP-stats{ grid-template-columns:repeat(2,1fr)!important; padding:10px 10px 0; gap:8px!important; } }
/* ══════════════════════════════════════════════════
   3D COLLECTION PROGRESS — FULL ANIMATED PANEL
══════════════════════════════════════════════════ */
@keyframes CP3d-spin { to { transform:rotate(360deg); } }
@keyframes CP3d-spin-rev { to { transform:rotate(-360deg); } }
@keyframes CP3d-float { 0%,100%{transform:translateY(0) rotateX(0deg)} 50%{transform:translateY(-8px) rotateX(4deg)} }
@keyframes CP3d-float2 { 0%,100%{transform:translateY(0) rotateX(0deg)} 50%{transform:translateY(-6px) rotateX(-3deg)} }
@keyframes CP3d-float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes CP3d-liquid { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
@keyframes CP3d-shimmer { 0%{left:-100%} 100%{left:200%} }
@keyframes CP3d-pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.08)} }
@keyframes CP3d-pulse2 { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.4;transform:scale(1.15)} }
@keyframes CP3d-glow { 0%,100%{box-shadow:0 8px 28px rgba(29,78,216,.1),0 2px 8px rgba(0,0,0,.05)} 50%{box-shadow:0 8px 36px rgba(29,78,216,.18),0 2px 12px rgba(0,0,0,.07)} }
@keyframes CP3d-bar-flow { 0%{background-position:0 0} 100%{background-position:60px 0} }
@keyframes CP3d-orbit { 0%{transform:rotate(0deg) translateX(58px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(58px) rotate(-360deg)} }
@keyframes CP3d-orbit2 { 0%{transform:rotate(180deg) translateX(52px) rotate(-180deg)} 100%{transform:rotate(540deg) translateX(52px) rotate(-540deg)} }
@keyframes CP3d-ring-fill { from{stroke-dashoffset:628} to{stroke-dashoffset:var(--dash-end,0)} }
@keyframes CP3d-scanline { 0%{top:-100%} 100%{top:200%} }
@keyframes CP3d-particle { 0%{transform:translateY(0) scale(1);opacity:.8} 100%{transform:translateY(-80px) scale(0);opacity:0} }

.CP-c3d { margin:0 32px 28px; animation:CP-slideUp .5s .06s cubic-bezier(.22,1,.36,1) both; perspective:1200px; }
@media(max-width:900px){ .CP-c3d{ margin:0 20px 20px; } }
@media(max-width:600px){ .CP-c3d{ margin:0 14px 16px; } }

/* Main panel */
.CP-c3d-panel { display:grid; grid-template-columns:260px 1fr; gap:0; background:#fff; border-radius:20px; overflow:hidden; position:relative; border:1.5px solid rgba(29,78,216,.18); box-shadow:0 8px 32px rgba(29,78,216,.12),0 2px 8px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.9); animation:CP3d-glow 3s ease-in-out infinite; }
@media(max-width:900px){ .CP-c3d-panel{ grid-template-columns:1fr; } }

/* Scan line */
.CP-c3d-scan { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(59,130,246,.35),transparent); animation:CP3d-scanline 4s linear infinite; pointer-events:none; z-index:10; }

/* Grid bg */
.CP-c3d-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(29,78,216,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(29,78,216,.04) 1px,transparent 1px); background-size:32px 32px; pointer-events:none; }

/* LEFT — ring section */
.CP-c3d-left { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 28px; border-right:1.5px solid rgba(29,78,216,.12); background:linear-gradient(135deg,rgba(59,130,246,.07) 0%,rgba(29,78,216,.04) 60%,rgba(255,255,255,0) 100%); gap:16px; }
.CP-c3d-ring-stage { position:relative; width:180px; height:180px; flex-shrink:0; }

/* Orbiting dots */
.CP-c3d-orb { position:absolute; top:50%; left:50%; width:8px; height:8px; margin:-4px; }
.CP-c3d-orb-dot { width:8px; height:8px; border-radius:50%; background:radial-gradient(circle,#3B82F6,#2563EB); box-shadow:0 0 8px rgba(59,130,246,.6); }
.CP-c3d-orb1 { animation:CP3d-orbit 4s linear infinite; }
.CP-c3d-orb2 { animation:CP3d-orbit2 6s linear infinite; }

/* Outer pulsing rings */
.CP-c3d-pulse-ring { position:absolute; inset:-12px; border-radius:50%; border:1.5px solid rgba(29,78,216,.18); animation:CP3d-pulse 2.5s ease-in-out infinite; pointer-events:none; }
.CP-c3d-pulse-ring2 { position:absolute; inset:-24px; border-radius:50%; border:1px solid rgba(59,130,246,.12); animation:CP3d-pulse2 3.2s ease-in-out infinite; pointer-events:none; }

/* SVG ring */
.CP-c3d-ring-svg { position:absolute; inset:0; width:100%; height:100%; transform:rotate(-90deg); filter:drop-shadow(0 0 6px rgba(59,130,246,.3)); }
.CP-c3d-ring-track { fill:none; stroke:rgba(29,78,216,.08); stroke-width:10; }
.CP-c3d-ring-fill { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray:502 502; stroke-dashoffset:502; animation:CP3d-ring-fill 1.8s .4s cubic-bezier(.34,1.2,.64,1) forwards; }
.CP-c3d-ring-spin { fill:none; stroke:rgba(59,130,246,.25); stroke-width:2; stroke-dasharray:8 16; animation:CP3d-spin 8s linear infinite; }
.CP-c3d-ring-spin2 { fill:none; stroke:rgba(29,78,216,.15); stroke-width:1.5; stroke-dasharray:4 20; animation:CP3d-spin-rev 12s linear infinite; }

/* Center label */
.CP-c3d-center-lbl { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.CP-c3d-pct { font-family:var(--ff-m,monospace); font-size: 33.5px; font-weight: 900; color:var(--ember,#2563EB); letter-spacing:-2px; line-height:1; text-shadow:0 0 16px rgba(59,130,246,.25); }
.CP-c3d-pct-sym { font-size: 17.5px; vertical-align:super; font-weight: 800; color:#3B82F6; }
.CP-c3d-pct-lbl { font-family:var(--ff-m,monospace); font-size: 8px; font-weight: 800; color:rgba(29,78,216,.5); text-transform:uppercase; letter-spacing:2px; }

/* Title below ring */
.CP-c3d-title { font-family:var(--ff-d,serif); font-size: 13px; font-style:italic; color:var(--t1,#111); text-align:center; line-height:1.3; }
.CP-c3d-sub { font-family:var(--ff-m,monospace); font-size: 8px; color:var(--t4,#aaa); text-transform:uppercase; letter-spacing:2px; text-align:center; }

/* RIGHT — stats section */
.CP-c3d-right { display:flex; flex-direction:column; justify-content:center; padding:32px 36px; gap:24px; position:relative; }

/* Liquid bar */
.CP-c3d-bar-wrap { }
.CP-c3d-bar-lbl { display:flex; justify-content:space-between; margin-bottom:8px; }
.CP-c3d-bar-lbl-txt { font-family:var(--ff-m,monospace); font-size: 8px; font-weight: 800; color:var(--t4,#aaa); text-transform:uppercase; letter-spacing:1.5px; }
.CP-c3d-bar-lbl-pct { font-family:var(--ff-m,monospace); font-size: 9px; font-weight: 800; color:var(--ember,#2563EB); }
.CP-c3d-bar-track { height:14px; border-radius:99px; background:rgba(29,78,216,.07); border:1px solid rgba(29,78,216,.12); overflow:hidden; position:relative; }
.CP-c3d-bar-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#2563EB 0%,#3B82F6 40%,#ffb347 60%,#3B82F6 80%,#2563EB 100%); background-size:200% 100%; animation:CP3d-liquid 2s linear infinite; position:relative; overflow:hidden; min-width:6px; transition:width 1.2s cubic-bezier(.34,1.2,.64,1); box-shadow:0 0 10px rgba(59,130,246,.35),inset 0 1px 0 rgba(255,255,255,.4); }
.CP-c3d-bar-shine { position:absolute; top:0; bottom:0; width:40%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent); animation:CP3d-shimmer 2.4s ease-in-out infinite; }

/* 3D Stat cards */
.CP-c3d-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
@media(max-width:600px){ .CP-c3d-cards{ grid-template-columns:1fr; } }
.CP-c3d-card { background:#fff; border:1.5px solid rgba(29,78,216,.12); border-radius:14px; padding:16px 18px; position:relative; overflow:hidden; transform-style:preserve-3d; transition:transform .3s,box-shadow .3s; box-shadow:0 2px 12px rgba(29,78,216,.08); }
.CP-c3d-card:hover { transform:translateY(-4px) rotateX(6deg) scale(1.02); box-shadow:0 12px 28px rgba(29,78,216,.14); }
.CP-c3d-card-1 { animation:CP3d-float 4s ease-in-out infinite; }
.CP-c3d-card-2 { animation:CP3d-float2 5s ease-in-out infinite; }
.CP-c3d-card-3 { animation:CP3d-float3 3.5s ease-in-out infinite; }
.CP-c3d-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(59,130,246,.05) 0%,transparent 60%); pointer-events:none; }
.CP-c3d-card-shine { position:absolute; top:-50%; left:-50%; width:60%; height:200%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent); transform:skewX(-20deg); animation:CP3d-shimmer 3s ease-in-out infinite; }
.CP-c3d-card-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; flex-shrink:0; }
.CP-c3d-card-lbl { font-family:var(--ff-m,monospace); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:1.5px; color:var(--t4,#aaa); margin-bottom:4px; }
.CP-c3d-card-val { font-family:var(--ff-m,monospace); font-size: 16px; font-weight: 800; letter-spacing:-0.5px; line-height:1; }
.CP-c3d-card-sub { font-family:var(--ff-m,monospace); font-size: 8px; color:var(--t4,#aaa); margin-top:4px; }
.CP-c3d-card-bar { height:3px; border-radius:99px; margin-top:10px; position:relative; overflow:hidden; background:rgba(29,78,216,.07); }
.CP-c3d-card-bar-fill { height:100%; border-radius:99px; animation:CP3d-liquid 1.8s linear infinite; background-size:200% 100%; }


/* Mobile small (<480px) */
@media(max-width:480px){
  .CP-col-head,.CP-cli-row,.CP-tbl-foot{ grid-template-columns:28px 1fr 100px; padding:0 10px; }
  .CP-proj-col-head,.CP-proj-row{ grid-template-columns:24px 1fr 86px; padding:0 10px 0 6px!important; }
  .CP-stats{ grid-template-columns:1fr 1fr; }
  .CP-stat-val{ font-size: 16px; } .CP-stat-val.or,.CP-stat-val.gr,.CP-stat-val.rd{ font-size: 14px; }
  .CP-brand-name{ font-size: 19.5px; }
  .CP-modal-box{ border-radius:22px 22px 0 0; }
  .CP-modal-bg{ align-items:flex-end; padding:0; }
  .CP-g2,.CP-g3,.CP-mini-cards,.CP-bstripe{ grid-template-columns:1fr; }
  .CP-search-wrap{ max-width:100%; }
  .CP-toolbar{ flex-direction:column; align-items:stretch; }
  .CP-toolbar > *{ width:100%; justify-content:center; }
}
`,N=({n:e,s:t=16,c:n=`currentColor`})=>{let r={users:`M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z`,bldg:`M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4`,wallet:`M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z`,coins:`M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z`,chart:`M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z`,plus:`M12 4v16m-8-8h16`,search:`M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z`,refresh:`M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15`,edit:`M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z`,arrow:`M9 5l7 7-7 7`,x:`M6 18L18 6M6 6l12 12`,folder:`M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z`,list:`M4 6h16M4 10h16M4 14h16M4 18h16`,tag:`M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z`,cal:`M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z`,pay:`M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z`,trash:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,user:`M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z`,home:`M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10`,tx:`M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4`,info:`M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z`};return(0,v.jsx)(v.Fragment,{children:(0,v.jsx)(`svg`,{width:t,height:t,viewBox:`0 0 24 24`,fill:`none`,stroke:n,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,v.jsx)(`path`,{d:r[e]||r.users})})})},P=({children:e})=>(0,g.createPortal)(e,document.body),F=[`#2563EB`,`#3B82F6`,`#BFDBFE`,`#fde68a`,`#F3E8FF`,`#fff`,`#EDE9FE`,`#60A5FA`,`#fef3c7`];function I({seed:e=0,count:t=22}){return(0,v.jsx)(v.Fragment,{children:Array.from({length:t},(t,n)=>{let r=n+e*7;return{id:n,color:F[r%F.length],left:`${4+r*6.1%92}%`,top:`${12+r*8.3%62}%`,delay:`${r*55%550}ms`,size:5+r%4*3,rotate:r*41,drift:(r%5-2)*18}}).map(e=>(0,v.jsx)(`div`,{className:`CP-confetti-piece`,style:{left:e.left,top:e.top,width:e.size,height:e.size,background:e.color,animationDelay:e.delay,animationDuration:`${900+e.id*55%500}ms`,"--cp-drift":`${e.drift}px`,transform:`rotate(${e.rotate}deg)`}},e.id))})}function L(){return(0,v.jsx)(v.Fragment,{children:Array.from({length:10},(e,t)=>({id:t,left:`${50+Math.cos(t/10*Math.PI*2)*(30+t%3*6)}%`,top:`${42+Math.sin(t/10*Math.PI*2)*(26+t%3*5)}%`,delay:`${300+t*70}ms`,size:6+t%3*3})).map(e=>(0,v.jsx)(`svg`,{className:`CP-sparkle`,width:e.size,height:e.size,viewBox:`0 0 24 24`,style:{left:e.left,top:e.top,animationDelay:e.delay},fill:`#3B82F6`,children:(0,v.jsx)(`path`,{d:`M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z`})},e.id))})}function R({title:e,sub:t,amountText:n,onDone:r,duration:i=1800}){let[a,o]=(0,_.useState)(!1);return(0,_.useEffect)(()=>{let e=setTimeout(r,i),t=setTimeout(()=>o(!0),450);return()=>{clearTimeout(e),clearTimeout(t)}},[]),(0,v.jsxs)(`div`,{className:`CP-closed-celebrate`,children:[(0,v.jsx)(I,{seed:0}),a&&(0,v.jsx)(I,{seed:1,count:16}),(0,v.jsx)(L,{}),(0,v.jsx)(`div`,{className:`CP-closed-ring`}),(0,v.jsx)(`div`,{className:`CP-closed-ring2`}),(0,v.jsxs)(`div`,{className:`CP-closed-stamp-wrap`,children:[(0,v.jsx)(`div`,{className:`CP-closed-check`,children:(0,v.jsx)(`svg`,{width:42,height:42,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,v.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})}),(0,v.jsx)(`div`,{className:`CP-closed-txt`,children:e}),t&&(0,v.jsx)(`div`,{className:`CP-closed-sub`,children:t}),n&&(0,v.jsx)(`div`,{className:`CP-closed-amt-badge`,children:n})]})]})}function z({opts:e,val:t,onChange:n,placeholder:r,disabled:i}){let[l,u]=(0,_.useState)(!1);(0,_.useEffect)(()=>{if(l)return o(),()=>c()},[l]);let[d,f]=(0,_.useState)(``),[p,m]=(0,_.useState)({}),h=(0,_.useRef)(null),y=(0,_.useRef)(null),b=(0,_.useRef)(null),x=(0,_.useRef)(null),S=a(l,u);s(l,u,x,y);let C=d.trim()?e.filter(e=>e.label.toLowerCase().includes(d.toLowerCase())):e,w=()=>{if(!y.current)return;let e=y.current.getBoundingClientRect(),t=Math.min(290,C.length*40+56),n=window.innerHeight-e.bottom>t+6;m({position:`fixed`,left:e.left,width:Math.max(e.width,180),zIndex:99999,...n?{top:e.bottom+4}:{bottom:window.innerHeight-e.top+4}})};(0,_.useEffect)(()=>{if(!l){f(``);return}w(),setTimeout(()=>b.current?.focus(),40);let e=e=>{h.current?.contains(e.target)||u(!1)};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[l]);let T=e.find(e=>e.value===t);return(0,v.jsxs)(`div`,{className:`CP-dd`,ref:h,children:[(0,v.jsxs)(`button`,{type:`button`,ref:y,disabled:i,className:`CP-dd-trigger${T?``:` ph`}${l?` open`:``}`,onClick:()=>{i||(w(),u(e=>!e))},onKeyDown:S,children:[(0,v.jsx)(`span`,{style:{flex:1,textAlign:`left`,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:T?T.label:r}),(0,v.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:3,flexShrink:0},children:[t&&!i&&(0,v.jsx)(`span`,{className:`CP-dd-clear`,onMouseDown:e=>{e.stopPropagation(),n(``),u(!1)},children:`✕`}),(0,v.jsx)(`svg`,{className:`CP-dd-chev${l?` open`:``}`,viewBox:`0 0 20 20`,fill:`none`,children:(0,v.jsx)(`path`,{d:`M5 7.5l5 5 5-5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})})]})]}),l&&(0,g.createPortal)((0,v.jsxs)(`div`,{ref:x,style:{...p,background:`#fff`,border:`1.5px solid #3B82F6`,borderRadius:12,boxShadow:`0 12px 36px rgba(0,0,0,.16)`,overflow:`hidden`,fontFamily:`inherit`},onMouseDown:e=>e.stopPropagation(),children:[(0,v.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:7,padding:`8px 12px`,borderBottom:`1px solid #eee`,background:`#F8FAFC`,position:`sticky`,top:0},children:[(0,v.jsxs)(`svg`,{width:`13`,height:`13`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#aaa`,strokeWidth:`2`,children:[(0,v.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,v.jsx)(`path`,{d:`m21 21-4.35-4.35`})]}),(0,v.jsx)(`input`,{ref:b,style:{flex:1,background:`transparent`,border:`none`,outline:`none`,fontSize:11.5,color:`#222`,fontFamily:`inherit`,caret_color:`#3B82F6`},placeholder:`Search…`,value:d,onChange:e=>{f(e.target.value),w()}}),d&&(0,v.jsx)(`span`,{style:{cursor:`pointer`,color:`#aaa`,fontSize:9.5,lineHeight:1,padding:`1px 3px`,borderRadius:4},onMouseDown:e=>{e.stopPropagation(),f(``)},children:`✕`})]}),(0,v.jsx)(`div`,{style:{maxHeight:224,overflowY:`auto`,scrollbarWidth:`thin`,scrollbarColor:`rgba(0,0,0,.12) transparent`},children:C.length===0?(0,v.jsx)(`div`,{style:{padding:`14px 16px`,color:`#aaa`,fontSize:10.5,fontStyle:`italic`,textAlign:`center`},children:`No match found`}):C.map(e=>(0,v.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":t===e.value,style:{padding:`10px 14px`,fontSize:11.5,fontWeight:t===e.value?800:600,color:t===e.value?`#2563EB`:`#333`,background:t===e.value?`rgba(59,130,246,.08)`:`transparent`,borderBottom:`1px solid #F1F5F9`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,cursor:`pointer`,transition:`background .1s`},onMouseEnter:n=>{t!==e.value&&(n.currentTarget.style.background=`#F1F5F9`)},onMouseLeave:n=>{n.currentTarget.style.background=t===e.value?`rgba(59,130,246,.08)`:`transparent`},onClick:()=>{n(e.value),u(!1)},children:[(0,v.jsx)(`span`,{children:e.label}),t===e.value&&(0,v.jsx)(`span`,{style:{color:`#3B82F6`,fontWeight:800,fontSize:11.5},children:`✓`})]},e.value))}),(0,v.jsx)(`div`,{style:{padding:`5px 12px`,fontSize:8,fontWeight:800,letterSpacing:`.5px`,color:`#bbb`,borderTop:`1px solid #eee`,background:`#F8FAFC`,textAlign:`right`,textTransform:`uppercase`},children:d?`${C.length} of ${e.length} matches`:`${e.length} options`})]}),document.body)]})}function B({options:e,value:t,onChange:n,loading:r}){let[i,l]=(0,_.useState)(!1);(0,_.useEffect)(()=>{if(i)return o(),()=>c()},[i]);let[u,d]=(0,_.useState)(``),[f,p]=(0,_.useState)({}),[m,h]=(0,_.useState)(220),y=(0,_.useRef)(null),b=(0,_.useRef)(null),x=(0,_.useRef)(null),S=(0,_.useRef)(null),C=a(i,l);s(i,l,S,b);let w=e.filter(e=>e.name.toLowerCase().includes(u.toLowerCase())||(e.id_details||``).toLowerCase().includes(u.toLowerCase())),T=t?e.find(e=>e.name===t):null,E=()=>{if(!b.current)return;let e=b.current.getBoundingClientRect(),t=Math.max(150,window.innerHeight-e.bottom-4-10);h(Math.max(90,Math.min(220,t-90))),p({position:`fixed`,left:e.left,top:e.bottom+4,width:e.width,zIndex:99999})};return(0,_.useEffect)(()=>{if(!i)return;let e=e=>{y.current?.contains(e.target)||(l(!1),d(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[i]),(0,_.useEffect)(()=>{i&&x.current&&setTimeout(()=>x.current?.focus(),50)},[i]),(0,v.jsxs)(`div`,{className:`CP-dd`,ref:y,children:[(0,v.jsxs)(`button`,{type:`button`,ref:b,disabled:r,className:`CP-dd-trigger${t?``:` ph`}${i?` open`:``}`,onClick:()=>{r||(E(),l(e=>!e))},onKeyDown:C,children:[r?(0,v.jsxs)(`span`,{style:{fontSize:10.5,color:`var(--t4)`,display:`flex`,alignItems:`center`,gap:8},children:[(0,v.jsx)(`span`,{className:`CP-spinner-or`}),`Loading…`]}):t&&T?(0,v.jsxs)(`div`,{className:`CP-bio-sel`,children:[(0,v.jsx)(`div`,{className:`CP-bio-av`,children:T.name.charAt(0)}),(0,v.jsxs)(`div`,{style:{minWidth:0},children:[(0,v.jsx)(`div`,{className:`CP-bio-nm`,children:T.name}),T.id_details&&(0,v.jsx)(`div`,{className:`CP-bio-id`,children:T.id_details})]})]}):t?(0,v.jsxs)(`div`,{className:`CP-bio-sel`,children:[(0,v.jsx)(`div`,{className:`CP-bio-av`,style:{background:`rgba(29,78,216,0.15)`,color:`var(--ember,#2563EB)`,fontWeight:800},children:t.charAt(0).toUpperCase()}),(0,v.jsxs)(`div`,{style:{minWidth:0},children:[(0,v.jsx)(`div`,{className:`CP-bio-nm`,children:t}),(0,v.jsx)(`div`,{className:`CP-bio-id`,style:{fontStyle:`italic`,opacity:.7},children:`Click to relink…`})]})]}):(0,v.jsxs)(`span`,{style:{color:`var(--t4)`,display:`flex`,alignItems:`center`,gap:7},children:[(0,v.jsx)(N,{n:`user`,s:11}),` Select income client…`]}),(0,v.jsx)(`svg`,{className:`CP-dd-chev${i?` open`:``}`,viewBox:`0 0 20 20`,fill:`none`,children:(0,v.jsx)(`path`,{d:`M5 7.5l5 5 5-5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})})]}),i&&(0,g.createPortal)((0,v.jsxs)(`div`,{ref:S,style:{...f,background:`var(--white,#fff)`,border:`1.5px solid var(--ember-mid,#3B82F6)`,borderRadius:12,boxShadow:`0 12px 32px rgba(0,0,0,.13)`,overflow:`hidden`},onMouseDown:e=>e.stopPropagation(),children:[(0,v.jsxs)(`div`,{style:{padding:`7px 12px`,background:`rgba(29,78,216,.06)`,borderBottom:`1px solid rgba(29,78,216,.12)`,fontSize:8,fontFamily:`JetBrains Mono,monospace`,fontWeight:800,color:`var(--ember,#2563EB)`,display:`flex`,alignItems:`center`,gap:6},children:[(0,v.jsx)(N,{n:`users`,s:10,c:`var(--ember,#2563EB)`}),`Income clients · `,e.length,` available`]}),(0,v.jsxs)(`div`,{style:{padding:`7px 12px`,display:`flex`,alignItems:`center`,gap:7,borderBottom:`1px solid var(--border,#D4D5D8)`,background:`var(--off-white,#F8FAFC)`},children:[(0,v.jsx)(N,{n:`search`,s:12}),(0,v.jsx)(`input`,{ref:x,style:{flex:1,background:`transparent`,border:`none`,outline:`none`,fontSize:11.5,color:`var(--text-1)`,fontFamily:`var(--font-body)`},value:u,onChange:e=>d(e.target.value),placeholder:`Search clients…`}),u&&(0,v.jsx)(`button`,{type:`button`,onClick:()=>d(``),style:{background:`none`,border:`none`,cursor:`pointer`,color:`var(--text-4)`,fontSize:16,lineHeight:1,padding:0},children:`×`})]}),(0,v.jsx)(`div`,{style:{maxHeight:m,overflowY:`auto`,scrollbarWidth:`thin`},children:w.length===0?(0,v.jsxs)(`div`,{style:{padding:16,fontSize:10.5,color:`var(--text-4)`,fontStyle:`italic`,textAlign:`center`},children:[`No match for "`,u,`"`]}):w.map(e=>(0,v.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":t===e.name,style:{padding:`9px 14px`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:10,background:t===e.name?`rgba(29,78,216,0.07)`:`transparent`,borderBottom:`1px solid var(--border,#D4D5D8)`,transition:`background 0.1s`},onMouseOver:n=>{t!==e.name&&(n.currentTarget.style.background=`rgba(59,130,246,0.05)`)},onMouseOut:n=>{n.currentTarget.style.background=t===e.name?`rgba(29,78,216,0.07)`:`transparent`},onClick:()=>{n(e.name,e.id_details||``,e),l(!1),d(``)},children:[(0,v.jsx)(`div`,{style:{width:28,height:28,borderRadius:8,background:t===e.name?`var(--ember,#2563EB)`:`var(--ember-ghost,rgba(59,130,246,.12))`,color:t===e.name?`#fff`:`var(--ember,#2563EB)`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,v.jsx)(N,{n:`user`,s:13})}),(0,v.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,v.jsx)(`div`,{style:{fontWeight:800,fontSize:11.5,color:t===e.name?`var(--ember,#2563EB)`:`var(--text-1)`},children:e.name}),e.id_details&&(0,v.jsx)(`div`,{style:{fontSize:8.5,color:`var(--text-4)`,fontFamily:`JetBrains Mono,monospace`,marginTop:1},children:e.id_details})]}),t===e.name&&(0,v.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--ember,#2563EB)`,strokeWidth:`2.5`,children:(0,v.jsx)(`path`,{d:`M20 6L9 17l-5-5`})})]},e.id))}),(0,v.jsxs)(`div`,{style:{padding:`5px 12px`,fontFamily:`JetBrains Mono,monospace`,fontSize:8,letterSpacing:`.5px`,color:`var(--text-4)`,borderTop:`1px solid var(--border,#D4D5D8)`,background:`var(--off-white,#F8FAFC)`,textAlign:`right`},children:[w.length,` records`]})]}),document.body)]})}function V({subs:e,val:t,onChange:n,disabled:r,placeholder:i}){let[l,u]=(0,_.useState)(!1);(0,_.useEffect)(()=>{if(l)return o(),()=>c()},[l]);let[d,f]=(0,_.useState)(``),[p,m]=(0,_.useState)({}),h=(0,_.useRef)(null),y=(0,_.useRef)(null),b=(0,_.useRef)(null),x=a(l,u);s(l,u,b,y);let S=()=>{if(!y.current)return;let e=y.current.getBoundingClientRect(),t=window.innerHeight-e.bottom>240;m({position:`fixed`,left:e.left,width:e.width,zIndex:99999,...t?{top:e.bottom+4}:{bottom:window.innerHeight-e.top+4}})};if((0,_.useEffect)(()=>{if(!l)return;let e=e=>{h.current?.contains(e.target)||(u(!1),f(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[l]),r)return(0,v.jsx)(`div`,{className:`CP-dd`,children:(0,v.jsxs)(`button`,{type:`button`,disabled:!0,className:`CP-dd-trigger ph`,children:[(0,v.jsx)(`span`,{style:{fontStyle:`italic`,fontSize:10.5},children:`Select client first…`}),(0,v.jsx)(`svg`,{className:`CP-dd-chev`,viewBox:`0 0 20 20`,fill:`none`,children:(0,v.jsx)(`path`,{d:`M5 7.5l5 5 5-5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})})]})});if(e.length===0)return(0,v.jsx)(`input`,{className:`CP-input`,value:t,onChange:e=>n(e.target.value),placeholder:i||`Enter project name…`,autoFocus:!0});let C=e.filter(e=>e.toLowerCase().includes(d.toLowerCase()));return(0,v.jsxs)(`div`,{className:`CP-dd`,ref:h,children:[(0,v.jsxs)(`button`,{type:`button`,ref:y,className:`CP-dd-trigger${t?``:` ph`}${l?` open`:``}`,onClick:()=>{S(),u(e=>!e)},onKeyDown:x,children:[t?(0,v.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:7},children:[(0,v.jsx)(N,{n:`bldg`,s:12}),(0,v.jsx)(`span`,{style:{fontWeight:700},children:t})]}):(0,v.jsxs)(`span`,{style:{color:`var(--t4)`,display:`flex`,alignItems:`center`,gap:7},children:[(0,v.jsx)(N,{n:`bldg`,s:12}),i||`Choose from ${e.length} names…`]}),(0,v.jsx)(`svg`,{className:`CP-dd-chev${l?` open`:``}`,viewBox:`0 0 20 20`,fill:`none`,children:(0,v.jsx)(`path`,{d:`M5 7.5l5 5 5-5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})})]}),l&&(0,g.createPortal)((0,v.jsxs)(`div`,{ref:b,style:{...p,background:`var(--white,#fff)`,border:`1.5px solid var(--ember-mid,#3B82F6)`,borderRadius:12,boxShadow:`0 12px 32px rgba(0,0,0,.13)`,overflow:`hidden`},onMouseDown:e=>e.stopPropagation(),children:[(0,v.jsxs)(`div`,{style:{padding:`7px 12px`,background:`rgba(29,78,216,.06)`,borderBottom:`1px solid rgba(29,78,216,.12)`,fontSize:8,fontFamily:`JetBrains Mono,monospace`,fontWeight:800,color:`var(--ember,#2563EB)`},children:[e.length,` project names from BioData`]}),e.length>5&&(0,v.jsxs)(`div`,{style:{padding:`7px 12px`,display:`flex`,alignItems:`center`,gap:7,borderBottom:`1px solid var(--border,#D4D5D8)`,background:`var(--off-white,#F8FAFC)`},children:[(0,v.jsx)(N,{n:`search`,s:12}),(0,v.jsx)(`input`,{style:{flex:1,background:`transparent`,border:`none`,outline:`none`,fontSize:11.5,color:`var(--text-1)`,fontFamily:`var(--font-body)`},value:d,onChange:e=>f(e.target.value),placeholder:`Filter names…`})]}),(0,v.jsx)(`div`,{style:{maxHeight:200,overflowY:`auto`,scrollbarWidth:`thin`},children:C.map(e=>(0,v.jsxs)(`div`,{role:`option`,tabIndex:-1,"aria-selected":t===e,style:{padding:`9px 14px`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,background:t===e?`rgba(29,78,216,0.07)`:`transparent`,borderBottom:`1px solid var(--border,#D4D5D8)`,color:t===e?`var(--ember,#2563EB)`:`var(--text-1)`,fontWeight:t===e?800:600,fontSize:12,transition:`background 0.1s`},onMouseOver:n=>{t!==e&&(n.currentTarget.style.background=`rgba(59,130,246,0.05)`)},onMouseOut:n=>{n.currentTarget.style.background=t===e?`rgba(29,78,216,0.07)`:`transparent`},onClick:()=>{n(e),u(!1),f(``)},children:[(0,v.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,v.jsx)(`span`,{style:{width:6,height:6,borderRadius:`50%`,background:t===e?`var(--ember,#2563EB)`:`var(--text-4)`,flexShrink:0}}),e]}),t===e&&(0,v.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--ember,#2563EB)`,strokeWidth:`2.5`,children:(0,v.jsx)(`path`,{d:`M20 6L9 17l-5-5`})})]},e))}),(0,v.jsxs)(`div`,{style:{padding:`5px 12px`,fontFamily:`JetBrains Mono,monospace`,fontSize:8,letterSpacing:`.5px`,color:`var(--text-4)`,borderTop:`1px solid var(--border,#D4D5D8)`,background:`var(--off-white,#F8FAFC)`,textAlign:`right`},children:[C.length,` of `,e.length]})]}),document.body)]})}function H({project:e,clientId:t,initialTab:n=`collect`,onClose:r,onSaved:a,initialEditPayment:o,initialEditBudget:s}){let[c,l]=(0,_.useState)(n),[d,p]=(0,_.useState)(e),h=()=>({payment_date:new Date().toISOString().split(`T`)[0],amount:``,gst_amount:``,payment_mode:`cash`,reference_number:``,notes:``,next_due_date:``}),[g,C]=(0,_.useState)(h()),[w,T]=(0,_.useState)(!1),[E,D]=(0,_.useState)(``),[O,k]=(0,_.useState)({open:!1,pendingStep:null}),[A,M]=(0,_.useState)(null),[F,I]=(0,_.useState)({open:!1,id:0,loading:!1}),L=(0,_.useRef)(null),[B,V]=(0,_.useState)(y(e.payments)),[H,U]=(0,_.useState)(!1),[W,G]=(0,_.useState)(!!e.payments),[K,q]=(0,_.useState)(``),[ee,J]=(0,_.useState)(``),[te,ne]=(0,_.useState)(new Date().toISOString().split(`T`)[0]),[re,ie]=(0,_.useState)(!1),[ae,oe]=(0,_.useState)(``),[Y,se]=(0,_.useState)([]),[ce,le]=(0,_.useState)(!1),[X,ue]=(0,_.useState)(null),[de,fe]=(0,_.useState)({open:!1,id:0,loading:!1}),[pe,me]=(0,_.useState)(0),[he,ge]=(0,_.useState)(0),[_e,ve]=(0,_.useState)(null),ye=(0,_.useCallback)(async()=>{if(!W){U(!0);try{let e=localStorage.getItem(`token`);V(y((await u.get(`/api/client-portal/clients/${t}/projects/${d.id}`,{headers:{Authorization:`Bearer ${e}`}})).data.data?.payments)),G(!0)}catch(e){console.error(e)}finally{U(!1)}}},[t,d.id,W]),be=(0,_.useCallback)(async()=>{if(!ce)try{let e=localStorage.getItem(`token`),n=await u.get(`/api/client-portal/clients/${t}/projects/${d.id}/budget-history`,{headers:{Authorization:`Bearer ${e}`}});se(y(n.data.data??n.data)),le(!0)}catch{le(!0)}},[t,d.id,ce]);(0,_.useEffect)(()=>{ye()},[]),(0,_.useEffect)(()=>{c===`budget`&&be()},[c]),(0,_.useEffect)(()=>{o?(Te(o),l(`collect`)):s&&(De(s),l(`budget`))},[]);let xe=e=>C(t=>({...t,[e.target.name]:e.target.value})),Se=async e=>{if(e.preventDefault(),!g.payment_date||!g.amount){D(`Fill required fields`),i.warning(`Required Fields`,`Payment date and amount are required.`);return}T(!0),D(``);try{let e={Authorization:`Bearer ${localStorage.getItem(`token`)}`},t={...g,amount:parseFloat(g.amount),gst_amount:g.gst_amount?parseFloat(g.gst_amount):0};A?await u.put(`/api/client-portal/payments/${A}`,t,{headers:e}):await u.post(`/api/client-portal/projects/${d.id}/payments`,t,{headers:e}),G(!1),await ye(),G(!0),T(!1),ve({title:`PAYMENT RECORDED!`,sub:d.project_name,amountText:b(parseFloat(g.amount||`0`)+parseFloat(g.gst_amount||`0`))})}catch(e){D(e.response?.data?.message||`Failed to save payment`),T(!1)}},Ce=e=>{I({open:!0,id:e,loading:!1})},we=async()=>{I(e=>({...e,loading:!0}));try{let e=localStorage.getItem(`token`);await u.delete(`/api/client-portal/payments/${F.id}`,{headers:{Authorization:`Bearer ${e}`}}),V(e=>e.filter(e=>e.id!==F.id)),a()}catch(e){i.error(`Delete Failed`,e.response?.data?.message||`Could not delete the item.`)}finally{I({open:!1,id:0,loading:!1})}},Te=e=>{M(e.id),C({payment_date:e.payment_date?new Date(e.payment_date).toISOString().split(`T`)[0]:``,amount:String(e.amount),gst_amount:e.gst_amount?String(e.gst_amount):``,payment_mode:e.payment_mode,reference_number:e.reference_number||``,notes:e.notes||``,next_due_date:e.next_due_date?new Date(e.next_due_date).toISOString().split(`T`)[0]:``}),l(`collect`),setTimeout(()=>L.current?.scrollIntoView({behavior:`smooth`,block:`start`}),80)},Ee=async e=>{if(e.preventDefault(),!K||parseFloat(K)<=0){oe(`Enter valid amount`),i.warning(`Invalid Amount`,`Please enter a valid budget amount greater than 0.`);return}ie(!0),oe(``);try{let e=localStorage.getItem(`token`),n={extra_amount:parseFloat(K),reason:ee,date_added:te};X?await u.put(`/api/client-portal/budget-history/${X}`,n,{headers:{Authorization:`Bearer ${e}`}}):await u.post(`/api/client-portal/clients/${t}/projects/${d.id}/add-budget`,n,{headers:{Authorization:`Bearer ${e}`}}),le(!1),await be(),ie(!1),ve({title:X?`BUDGET UPDATED!`:`BUDGET ADDED!`,sub:d.project_name,amountText:b(parseFloat(K||`0`))})}catch(e){oe(e.response?.data?.message||`Failed`),ie(!1)}},De=e=>{ue(e.id),q(String(e.extra_amount)),J(e.reason||``),ne(e.date_added?new Date(e.date_added).toISOString().split(`T`)[0]:new Date().toISOString().split(`T`)[0]),l(`budget`)},Oe=e=>fe({open:!0,id:e,loading:!1}),ke=async()=>{fe(e=>({...e,loading:!0}));try{let e=localStorage.getItem(`token`);await u.delete(`/api/client-portal/budget-history/${de.id}`,{headers:{Authorization:`Bearer ${e}`}}),se(e=>e.filter(e=>e.id!==de.id)),a()}catch(e){i.error(`Delete Failed`,e.response?.data?.message||`Could not delete the item.`)}finally{fe({open:!1,id:0,loading:!1})}},Ae=parseFloat(g.amount||`0`),je=Ae+parseFloat(g.gst_amount||`0`),Me=Math.max(0,d.balance-Ae),Ne=g.next_due_date&&S(g.next_due_date)<=15,Pe=d.total_budget+(parseFloat(K)||0),Fe=B.reduce((e,t)=>e+t.amount,0),Ie=B.reduce((e,t)=>e+(t.gst_amount||0),0),Le=B.reduce((e,t)=>e+t.total_amount,0),Re=Y.reduce((e,t)=>e+t.extra_amount,0),ze=Math.max(1,Math.ceil(B.length/5)),Be=Math.min(pe,ze-1),Z=Be*5,Ve=B.slice(Z,Z+5),He=Math.max(1,Math.ceil(Y.length/5)),Ue=Math.min(he,He-1),Q=Ue*5,We=Y.slice(Q,Q+5),$=c===`collect`,Ge=$?`linear-gradient(90deg,#066B66,#12BDB4)`:`linear-gradient(90deg,#1D4ED8,#C47E0A)`;return(0,v.jsxs)(P,{children:[(0,v.jsx)(`div`,{className:`CP-root CP-fp-overlay`,onClick:e=>{e.target===e.currentTarget&&r()},children:(0,v.jsxs)(`div`,{className:`CP-fp-modal CP-fp-modal-lg`,children:[_e&&(0,v.jsx)(R,{title:_e.title,sub:_e.sub,amountText:_e.amountText,onDone:()=>{C(h()),M(null),q(``),J(``),oe(``),ue(null),ve(null),a(),r()}}),(0,v.jsx)(`div`,{className:`CP-modal-top`,style:{background:Ge}}),(0,v.jsxs)(`div`,{className:`CP-modal-body`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr-l`,children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl-ico`,style:{background:$?`rgba(6,107,102,.12)`:`rgba(29,78,216,.12)`,border:`1.5px solid ${$?`rgba(6,107,102,.26)`:`rgba(29,78,216,.26)`}`},children:(0,v.jsx)(N,{n:$?`pay`:`chart`,s:18,c:$?`var(--jade)`:`var(--gold)`})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl`,children:$?`Collect Payment`:`Add Budget`}),(0,v.jsxs)(`div`,{className:`CP-modal-sub`,style:{fontSize:11.5},children:[d.project_name,` · Balance: `,(0,v.jsx)(`span`,{style:{fontWeight:800},children:b(d.balance)})]})]})]}),(0,v.jsx)(`button`,{className:`CP-fp-close`,onClick:r,title:`Close`,"aria-label":`Close`,children:(0,v.jsx)(N,{n:`x`,s:18})})]}),(0,v.jsxs)(`div`,{className:`CP-modal-tabs`,children:[(0,v.jsxs)(`button`,{type:`button`,className:`CP-modal-tab${c===`collect`?` active`:``}`,onClick:()=>l(`collect`),style:c===`collect`?{color:`var(--jade)`}:{},children:[(0,v.jsx)(N,{n:`pay`,s:13}),` Collect Payment`]}),(0,v.jsxs)(`button`,{type:`button`,className:`CP-modal-tab${c===`budget`?` active`:``}`,onClick:()=>l(`budget`),style:c===`budget`?{color:`var(--gold)`}:{},children:[(0,v.jsx)(N,{n:`chart`,s:13}),` Add Budget`]})]}),c===`collect`&&(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-mini-cards`,children:[{lbl:`Budget`,val:b(d.total_budget),color:`var(--gold)`,cls:`gold`},{lbl:`Collected`,val:b(d.total_collected),color:`var(--jade)`,cls:`jade`},{lbl:`Balance`,val:b(d.balance),color:`var(--crimson)`,cls:`crimson`}].map(e=>(0,v.jsxs)(`div`,{className:`CP-mini-card ${e.cls}`,children:[(0,v.jsx)(`div`,{className:`CP-mini-lbl`,children:e.lbl}),(0,v.jsx)(`div`,{className:`CP-mini-val`,style:{color:e.color},children:e.val})]},e.lbl))}),(0,v.jsxs)(`form`,{onSubmit:Se,ref:L,children:[(0,v.jsxs)(`div`,{className:`CP-modal-divider`,children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag jade`,children:`01 — Payment Details`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[(0,v.jsx)(N,{n:`cal`,s:10}),` Date `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(m,{value:g.payment_date,onChange:e=>C(t=>({...t,payment_date:e}))})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Mode `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:j,val:g.payment_mode,onChange:e=>C(t=>({...t,payment_mode:e})),placeholder:`Select mode`})]})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,style:{marginTop:10},children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Amount (₹) `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`number`,name:`amount`,value:g.amount,onChange:xe,min:`0`,step:`0.01`,placeholder:`0.00`,required:!0})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`GST (₹) `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`number`,name:`gst_amount`,value:g.gst_amount,onChange:xe,min:`0`,step:`0.01`,placeholder:`0`})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-divider`,style:{marginTop:16},children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag jade`,children:`02 — Additional Info`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Reference No. `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,name:`reference_number`,value:g.reference_number,onChange:xe,placeholder:`UTR / Cheque no.`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[(0,v.jsx)(N,{n:`cal`,s:10}),` Next Due `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`}),Ne&&(0,v.jsx)(`span`,{style:{color:`var(--rd)`,fontSize:8},children:`⚠ Soon!`})]}),(0,v.jsx)(m,{value:g.next_due_date,onChange:e=>C(t=>({...t,next_due_date:e}))})]})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginTop:10},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Notes `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,name:`notes`,value:g.notes,onChange:xe,placeholder:`Remarks…`})]}),Ae>0&&(0,v.jsxs)(`div`,{className:`CP-preview jade`,style:{gap:28},children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-preview-lbl`,children:`Total incl. GST`}),(0,v.jsx)(`div`,{className:`CP-preview-val`,style:{color:`var(--jade)`},children:b(je)})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-preview-lbl`,children:`Balance After`}),(0,v.jsx)(`div`,{className:`CP-preview-val`,style:{color:`var(--rd)`},children:b(Me)})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-actions`,children:[(0,v.jsx)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:w,style:{background:`linear-gradient(135deg,var(--jade),var(--jade2))`,boxShadow:`0 4px 16px var(--jade-g)`},children:w?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner`}),`Saving…`]}):A?`✓ Update Payment`:`✓ Record Payment`}),A&&(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:()=>{M(null),C(h())},children:`Clear`}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:r,children:`Cancel`})]})]}),(B.length>0||H)&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`div`,{className:`CP-modal-divider`,style:{marginTop:26},children:[(0,v.jsxs)(`span`,{className:`CP-modal-div-tag jade`,children:[`Transaction History (`,B.length,`)`]}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsx)(`div`,{className:`CP-pay-tbl-wrap`,style:{marginTop:8},children:(0,v.jsxs)(`table`,{className:`CP-pay-tbl`,style:{minWidth:900,width:`100%`},children:[(0,v.jsx)(`thead`,{children:(0,v.jsxs)(`tr`,{children:[(0,v.jsx)(`th`,{style:{width:40,textAlign:`center`},children:`S.No`}),(0,v.jsx)(`th`,{style:{width:100},children:`Date`}),(0,v.jsx)(`th`,{style:{width:100},children:`Mode`}),(0,v.jsx)(`th`,{style:{width:120,textAlign:`right`},children:`Amount`}),(0,v.jsx)(`th`,{style:{width:100,textAlign:`right`},children:`GST`}),(0,v.jsx)(`th`,{style:{width:120,textAlign:`right`},children:`Total`}),(0,v.jsx)(`th`,{style:{width:130},children:`Reference`}),(0,v.jsx)(`th`,{style:{width:110},children:`Next Due`}),(0,v.jsx)(`th`,{children:`Notes`}),(0,v.jsx)(`th`,{style:{width:80,textAlign:`center`},children:`Actions`})]})}),(0,v.jsx)(`tbody`,{children:H?(0,v.jsx)(`tr`,{children:(0,v.jsxs)(`td`,{colSpan:10,style:{padding:`40px`,textAlign:`center`,color:`var(--t4)`},children:[(0,v.jsx)(`span`,{className:`CP-spinner-or`,style:{marginRight:8}}),` Loading transactions...`]})}):Ve.map((e,t)=>{let n=e.next_due_date&&S(e.next_due_date)<=15;return(0,v.jsxs)(`tr`,{style:{transition:`background 0.15s`},children:[(0,v.jsx)(`td`,{style:{textAlign:`center`,fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--t1)`},children:Z+t+1}),(0,v.jsx)(`td`,{children:(0,v.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[(0,v.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`,ry:`2`}),(0,v.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,v.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,v.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--t1)`},children:x(e.payment_date)})]})}),(0,v.jsx)(`td`,{children:(0,v.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:6,padding:`4px 10px`,borderRadius:20,background:`var(--${e.payment_mode===`cash`?`jade`:e.payment_mode===`upi`?`gold`:e.payment_mode===`cheque`?`iris`:`cobalt`}-t)`,border:`1px solid var(--${e.payment_mode===`cash`?`jade`:e.payment_mode===`upi`?`gold`:e.payment_mode===`cheque`?`iris`:`cobalt`}-r)`},children:[(0,v.jsx)(`span`,{style:{width:16,height:16,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,v.jsx)(()=>{switch(e.payment_mode){case`cash`:return(0,v.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`rect`,{x:`2`,y:`6`,width:`20`,height:`12`,rx:`2`}),(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`2`}),(0,v.jsx)(`path`,{d:`M6 12h.01M18 12h.01`})]});case`upi`:return(0,v.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`path`,{d:`M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z`}),(0,v.jsx)(`path`,{d:`M8 8h8v8H8z`}),(0,v.jsx)(`path`,{d:`M16 8l-4 4-4-4`}),(0,v.jsx)(`path`,{d:`M8 16l4-4 4 4`})]});case`cheque`:return(0,v.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`rect`,{x:`3`,y:`5`,width:`18`,height:`14`,rx:`2`}),(0,v.jsx)(`path`,{d:`M7 10h10M7 14h6`}),(0,v.jsx)(`path`,{d:`M3 8l8-3 10 3`})]});case`bank_transfer`:return(0,v.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`rect`,{x:`2`,y:`7`,width:`20`,height:`14`,rx:`2`}),(0,v.jsx)(`path`,{d:`M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16`}),(0,v.jsx)(`path`,{d:`M8 21h8`}),(0,v.jsx)(`path`,{d:`M12 11v4`})]});default:return(0,v.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,v.jsx)(`path`,{d:`M12 6v6l4 2`})]})}},{})}),(0,v.jsx)(`span`,{style:{fontSize:9,fontWeight:800,color:`var(--${e.payment_mode===`cash`?`jade`:e.payment_mode===`upi`?`gold`:e.payment_mode===`cheque`?`iris`:`cobalt`})`},children:e.mode_label})]})}),(0,v.jsx)(`td`,{style:{textAlign:`right`,fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--jade)`},children:b(e.amount)}),(0,v.jsx)(`td`,{style:{textAlign:`right`,fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--iris2)`},children:e.gst_amount>0?b(e.gst_amount):``}),(0,v.jsx)(`td`,{style:{textAlign:`right`,fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--gold)`},children:b(e.total_amount)}),(0,v.jsx)(`td`,{children:e.reference_number?(0,v.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:4},children:[(0,v.jsxs)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,v.jsx)(`path`,{d:`M4 4v16h16V4H4z`}),(0,v.jsx)(`path`,{d:`M8 9h8M8 13h6`})]}),(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:700,color:`var(--t2)`},children:e.reference_number})]}):null}),(0,v.jsx)(`td`,{children:e.next_due_date?(0,v.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:4},children:[n&&(0,v.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--rd)`,strokeWidth:`2`,children:[(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,v.jsx)(`line`,{x1:`12`,y1:`8`,x2:`12`,y2:`12`}),(0,v.jsx)(`line`,{x1:`12`,y1:`16`,x2:`12.01`,y2:`16`})]}),(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:n?`var(--rd)`:`var(--gd)`},children:x(e.next_due_date)})]}):null}),(0,v.jsx)(`td`,{style:{maxWidth:180,overflow:`hidden`,textOverflow:`ellipsis`,fontSize:9,fontWeight:700,color:`var(--t2)`},children:e.notes||``}),(0,v.jsx)(`td`,{style:{textAlign:`center`},children:(0,v.jsxs)(`div`,{style:{display:`flex`,gap:4,justifyContent:`center`},children:[(0,v.jsx)(`button`,{className:`CP-act CP-act-edit`,style:{padding:`4px 8px`},onClick:()=>Te(e),title:`Edit Payment`,children:(0,v.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`path`,{d:`M17 3l4 4-7 7H10v-4l7-7z`}),(0,v.jsx)(`path`,{d:`M3 21h18`})]})}),(0,v.jsx)(`button`,{className:`CP-act CP-act-del`,style:{padding:`4px 8px`},onClick:()=>Ce(e.id),title:`Delete Payment`,children:(0,v.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:(0,v.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3`})})})]})})]},e.id)})}),!H&&B.length>0&&(0,v.jsx)(`tfoot`,{children:(0,v.jsxs)(`tr`,{children:[(0,v.jsxs)(`td`,{colSpan:3,style:{textTransform:`uppercase`},children:[`Totals (`,B.length,`)`]}),(0,v.jsx)(`td`,{className:`num`,children:b(Fe)}),(0,v.jsx)(`td`,{className:`num`,children:b(Ie)}),(0,v.jsx)(`td`,{className:`num`,children:b(Le)}),(0,v.jsx)(`td`,{colSpan:4})]})})]})}),!H&&B.length>5&&(0,v.jsxs)(`div`,{className:`CP-tx-page-bar`,children:[(0,v.jsxs)(`span`,{className:`CP-tx-page-info`,children:[`Showing `,Z+1,`–`,Math.min(Z+5,B.length),` of `,B.length]}),(0,v.jsxs)(`div`,{className:`CP-tx-page-btns`,children:[(0,v.jsxs)(`button`,{type:`button`,className:`CP-tx-page-btn`,disabled:Be===0,onClick:()=>me(e=>Math.max(0,e-1)),children:[(0,v.jsx)(`span`,{style:{display:`inline-flex`,transform:`rotate(180deg)`},children:(0,v.jsx)(N,{n:`arrow`,s:10})}),` Prev`]}),(0,v.jsxs)(`span`,{className:`CP-tx-page-num`,children:[Be+1,` / `,ze]}),(0,v.jsxs)(`button`,{type:`button`,className:`CP-tx-page-btn`,disabled:Be>=ze-1,onClick:()=>me(e=>Math.min(ze-1,e+1)),children:[`Next `,(0,v.jsx)(N,{n:`arrow`,s:10,c:`currentColor`})]})]})]}),!H&&B.length>0&&(0,v.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(3, 1fr)`,gap:10,marginTop:16},children:[{lbl:`Total Transactions`,val:String(B.length),color:`var(--jade)`,bg:`var(--jade-t)`,bd:`var(--jade-r)`,icon:`tx`},{lbl:`Average Payment`,val:b(B.reduce((e,t)=>e+t.amount,0)/B.length),color:`var(--gold)`,bg:`var(--gold-t)`,bd:`var(--gold-r)`,icon:`wallet`},{lbl:`Outstanding Balance`,val:b(d.balance),color:`var(--rd)`,bg:`var(--rd-t)`,bd:`var(--rd-r)`,icon:`chart`}].map(e=>(0,v.jsxs)(`div`,{className:`CP-tx-sumcard`,style:{background:e.bg,border:`1.5px solid ${e.bd}`},children:[(0,v.jsx)(`div`,{className:`CP-tx-sumcard-top`,style:{background:e.color}}),(0,v.jsxs)(`div`,{className:`CP-tx-sumcard-row`,children:[(0,v.jsx)(`div`,{className:`CP-tx-sumcard-ic`,style:{background:`#fff`,border:`1.5px solid ${e.bd}`,color:e.color},children:(0,v.jsx)(N,{n:e.icon,s:13,c:e.color})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-tx-sumcard-lbl`,style:{color:`#0F172A`},children:e.lbl}),(0,v.jsx)(`div`,{className:`CP-tx-sumcard-val`,style:{color:e.color},children:e.val})]})]})]},e.lbl))})]})]}),c===`budget`&&(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-bstripe`,children:[{lbl:`Original Budget`,val:b(d.total_budget),color:`var(--gold)`},{lbl:`Total Collected`,val:b(d.total_collected),color:`var(--jade)`},{lbl:`Remaining Balance`,val:b(d.balance),color:`var(--rd)`}].map(e=>(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-bs-lbl`,children:e.lbl}),(0,v.jsx)(`div`,{className:`CP-bs-val`,style:{color:e.color},children:e.val})]},e.lbl))}),(0,v.jsxs)(`form`,{onSubmit:Ee,children:[(0,v.jsxs)(`div`,{className:`CP-modal-divider`,children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag gold`,children:`Budget Addition`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Extra Amount (₹) `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`number`,min:`1`,step:`0.01`,value:K,onChange:e=>q(e.target.value),placeholder:`e.g. 150000`,required:!0,autoFocus:!0})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[(0,v.jsx)(N,{n:`cal`,s:10}),` Date Added `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(m,{value:te,onChange:ne})]})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginTop:10},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Reason / Notes `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`text`,value:ee,onChange:e=>J(e.target.value),placeholder:`e.g. Scope change, extra flooring…`})]}),parseFloat(K)>0&&(0,v.jsxs)(`div`,{className:`CP-preview gold`,style:{marginTop:14,gap:14},children:[(0,v.jsx)(N,{n:`arrow`,s:14,c:`var(--gold)`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-preview-lbl`,children:`New Total Budget`}),(0,v.jsx)(`div`,{className:`CP-preview-val`,style:{color:`var(--gold)`},children:b(Pe)})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-actions`,children:[(0,v.jsx)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:re,style:{background:`linear-gradient(135deg,var(--gold),var(--gold2))`,boxShadow:`0 4px 16px var(--gold-g)`},children:re?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner`}),`Saving…`]}):X?`✓ Update Budget Entry`:`✓ Confirm Budget Addition`}),X&&(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:()=>{ue(null),q(``),J(``),ne(new Date().toISOString().split(`T`)[0])},children:`Clear`}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:r,children:`Cancel`})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-divider`,style:{marginTop:24},children:[(0,v.jsxs)(`span`,{className:`CP-modal-div-tag iris`,children:[`Budget History (`,Y.length,`)`]}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),Y.length===0?(0,v.jsx)(`div`,{style:{padding:`18px 0`,textAlign:`center`,fontSize:10.5,color:`var(--t4)`,fontStyle:`italic`},children:`No budget additions yet.`}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`div`,{className:`CP-bud-tbl-wrap`,style:{marginTop:8},children:(0,v.jsxs)(`table`,{className:`CP-bud-tbl`,style:{minWidth:520,width:`100%`},children:[(0,v.jsx)(`thead`,{children:(0,v.jsxs)(`tr`,{style:{background:`linear-gradient(135deg,#F8F5EC,#F3EDD8)`},children:[(0,v.jsx)(`th`,{style:{width:44,textAlign:`center`},children:`S.No`}),(0,v.jsx)(`th`,{style:{width:110},children:`Date Added`}),(0,v.jsx)(`th`,{className:`num`,style:{width:130},children:`Extra Amount`}),(0,v.jsx)(`th`,{children:`Reason / Notes`}),(0,v.jsx)(`th`,{style:{width:110},children:`Recorded On`}),(0,v.jsx)(`th`,{style:{width:70,textAlign:`center`},children:`Actions`})]})}),(0,v.jsx)(`tbody`,{children:We.map((e,t)=>(0,v.jsxs)(`tr`,{style:{animationDelay:`${t*35}ms`},children:[(0,v.jsx)(`td`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--t1)`,textAlign:`center`},children:Q+t+1}),(0,v.jsx)(`td`,{children:(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:800,color:`var(--t1)`},children:x(e.date_added)})}),(0,v.jsx)(`td`,{className:`num`,style:{color:`var(--gold)`,fontFamily:`var(--ff-m)`,fontWeight:800,fontSize:9},children:b(e.extra_amount)}),(0,v.jsx)(`td`,{style:{maxWidth:200,overflow:`hidden`,textOverflow:`ellipsis`,fontSize:9,fontWeight:600,color:`var(--t2)`},children:e.reason||(0,v.jsx)(`span`,{style:{color:`var(--t4)`,fontStyle:`italic`},children:`—`})}),(0,v.jsx)(`td`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,fontWeight:700,color:`var(--t3)`},children:x(e.created_at)}),(0,v.jsx)(`td`,{style:{textAlign:`center`},children:(0,v.jsxs)(`div`,{style:{display:`flex`,gap:4,justifyContent:`center`},children:[(0,v.jsx)(`button`,{type:`button`,className:`CP-act CP-act-edit`,style:{padding:`4px 8px`},title:`Edit Budget Entry`,onClick:()=>De(e),children:(0,v.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`path`,{d:`M17 3l4 4-7 7H10v-4l7-7z`}),(0,v.jsx)(`path`,{d:`M3 21h18`})]})}),(0,v.jsx)(`button`,{type:`button`,className:`CP-act CP-act-del`,style:{padding:`4px 8px`},title:`Delete Budget Entry`,onClick:()=>Oe(e.id),children:(0,v.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:(0,v.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3`})})})]})})]},e.id))}),(0,v.jsx)(`tfoot`,{children:(0,v.jsxs)(`tr`,{children:[(0,v.jsxs)(`td`,{colSpan:2,style:{fontFamily:`var(--ff-m)`,fontSize:8.5,fontWeight:800,textTransform:`uppercase`,letterSpacing:`.08em`,color:`#0F172A`},children:[`Total Added (`,Y.length,`)`]}),(0,v.jsx)(`td`,{className:`num`,style:{color:`var(--gold)`,fontSize:9,fontWeight:800},children:b(Re)}),(0,v.jsx)(`td`,{colSpan:3})]})})]})}),Y.length>5&&(0,v.jsxs)(`div`,{className:`CP-tx-page-bar`,children:[(0,v.jsxs)(`span`,{className:`CP-tx-page-info`,children:[`Showing `,Q+1,`–`,Math.min(Q+5,Y.length),` of `,Y.length]}),(0,v.jsxs)(`div`,{className:`CP-tx-page-btns`,children:[(0,v.jsxs)(`button`,{type:`button`,className:`CP-tx-page-btn`,disabled:Ue===0,onClick:()=>ge(e=>Math.max(0,e-1)),children:[(0,v.jsx)(`span`,{style:{display:`inline-flex`,transform:`rotate(180deg)`},children:(0,v.jsx)(N,{n:`arrow`,s:10})}),` Prev`]}),(0,v.jsxs)(`span`,{className:`CP-tx-page-num`,children:[Ue+1,` / `,He]}),(0,v.jsxs)(`button`,{type:`button`,className:`CP-tx-page-btn`,disabled:Ue>=He-1,onClick:()=>ge(e=>Math.min(He-1,e+1)),children:[`Next `,(0,v.jsx)(N,{n:`arrow`,s:10,c:`currentColor`})]})]})]})]})]})]})]})}),(0,v.jsx)(f,{open:F.open,itemName:`this payment`,description:`This payment will be moved to the Recycle Bin.`,onConfirm:we,onCancel:()=>I({open:!1,id:0,loading:!1}),loading:F.loading}),(0,v.jsx)(f,{open:de.open,itemName:`this budget entry`,description:`This budget entry will be moved to the Recycle Bin, and the project's total budget will be reduced accordingly.`,onConfirm:ke,onCancel:()=>fe({open:!1,id:0,loading:!1}),loading:de.loading})]})}function U({clientId:e,project:t,subNames:n,onClose:r,onSaved:a}){let[o,s]=(0,_.useState)({project_name:t.project_name||``,project_type:t.project_type,start_date:t.start_date?new Date(t.start_date).toISOString().split(`T`)[0]:``,total_budget:String(t.total_budget),type_notes:t.type_notes||``,status:t.status}),[c,l]=(0,_.useState)(!1),[d,f]=(0,_.useState)(``);return(0,v.jsx)(P,{children:(0,v.jsx)(`div`,{className:`CP-root CP-fp-overlay`,onClick:e=>{e.target===e.currentTarget&&r()},children:(0,v.jsxs)(`div`,{className:`CP-fp-modal`,children:[(0,v.jsx)(`div`,{className:`CP-modal-top`,style:{background:`linear-gradient(90deg,var(--gd),var(--or3))`}}),(0,v.jsxs)(`div`,{className:`CP-modal-body`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr-l`,children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl-ico`,style:{background:`var(--gd-t)`,border:`1.5px solid var(--gd-r)`},children:(0,v.jsx)(N,{n:`bldg`,s:18,c:`var(--gd)`})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl`,children:`Edit Project`}),(0,v.jsx)(`div`,{className:`CP-modal-sub`,children:t.project_name||`Unnamed Project`})]})]}),(0,v.jsx)(`button`,{className:`CP-fp-close`,onClick:r,title:`Close`,"aria-label":`Close`,children:(0,v.jsx)(N,{n:`x`,s:18})})]}),(0,v.jsxs)(`form`,{onSubmit:async n=>{if(n.preventDefault(),!o.start_date){f(`Start Date is required`),i.warning(`Start Date Required`,`Please select a project start date.`);return}if(!o.total_budget||parseFloat(o.total_budget)<=0){f(`Valid Budget is required`),i.warning(`Budget Required`,`Please enter a valid budget amount.`);return}l(!0),f(``);try{let n=localStorage.getItem(`token`);await u.put(`/api/client-portal/clients/${e}/projects/${t.id}`,{...o,project_name:o.project_name||``,total_budget:parseFloat(o.total_budget)},{headers:{Authorization:`Bearer ${n}`}}),f(`Saved!`),i.success(`Project Updated!`,`Project details saved successfully`),a(),setTimeout(()=>r(),600)}catch(e){f(e.response?.data?.message||`Failed`),i.error(`Save Failed`,e.response?.data?.message||`Could not save project`)}finally{l(!1)}},noValidate:!0,children:[(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginBottom:12},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Project Name `,(0,v.jsx)(`span`,{className:`opt`,children:`(optional)`})]}),(0,v.jsx)(V,{subs:n,val:o.project_name,onChange:e=>s(t=>({...t,project_name:e})),placeholder:`Enter project name…`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Type `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:k,val:o.project_type,onChange:e=>s(t=>({...t,project_type:e})),placeholder:`Select`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Status `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:A,val:o.status,onChange:e=>s(t=>({...t,status:e})),placeholder:`Select`})]})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,style:{marginTop:10},children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Start Date `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(m,{value:o.start_date,onChange:e=>s(t=>({...t,start_date:e}))})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Budget (₹) `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`number`,value:o.total_budget,onChange:e=>s(t=>({...t,total_budget:e.target.value})),required:!0,min:`0`,step:`0.01`})]})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginTop:10},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Notes `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,value:o.type_notes,onChange:e=>s(t=>({...t,type_notes:e.target.value}))})]}),(0,v.jsxs)(`div`,{className:`CP-modal-actions`,children:[(0,v.jsx)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:c,style:{background:`linear-gradient(135deg,var(--gd),var(--or2))`},children:c?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner`}),`Saving…`]}):`✓ Update Project`}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:r,children:`Cancel`})]})]})]})]})})})}function W({clientId:e,clientName:t,subNames:n,onClose:r,onSaved:a}){let[o,s]=(0,_.useState)({project_name:``,project_type:`construction`,start_date:``,total_budget:``,type_notes:``,status:`active`}),[c,l]=(0,_.useState)(!1),[d,f]=(0,_.useState)(``);return(0,v.jsx)(P,{children:(0,v.jsx)(`div`,{className:`CP-root CP-fp-overlay`,onClick:e=>{e.target===e.currentTarget&&r()},children:(0,v.jsxs)(`div`,{className:`CP-fp-modal`,children:[(0,v.jsx)(`div`,{className:`CP-modal-top`,style:{background:`linear-gradient(90deg,var(--gd),var(--or3))`}}),(0,v.jsxs)(`div`,{className:`CP-modal-body`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr-l`,children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl-ico`,style:{background:`var(--gd-t)`,border:`1.5px solid var(--gd-r)`},children:(0,v.jsx)(N,{n:`bldg`,s:18,c:`var(--gd)`})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl`,children:`Add Project`}),(0,v.jsxs)(`div`,{className:`CP-modal-sub`,children:[`for `,(0,v.jsx)(`span`,{style:{color:`var(--gd)`,fontWeight:800},children:t})]})]})]}),(0,v.jsx)(`button`,{className:`CP-fp-close`,onClick:r,title:`Close`,"aria-label":`Close`,children:(0,v.jsx)(N,{n:`x`,s:18})})]}),(0,v.jsxs)(`form`,{onSubmit:async t=>{if(t.preventDefault(),!o.start_date){f(`Start Date is required`),i.warning(`Start Date Required`,`Please select a project start date.`);return}if(!o.total_budget||parseFloat(o.total_budget)<=0){f(`Valid Budget is required`),i.warning(`Budget Required`,`Please enter a valid budget amount.`);return}l(!0),f(``);try{let t=localStorage.getItem(`token`);await u.post(`/api/client-portal/clients/${e}/projects`,{...o,project_name:o.project_name.trim()||null,total_budget:parseFloat(o.total_budget)},{headers:{Authorization:`Bearer ${t}`}}),f(`Project saved!`),i.success(`Project Created!`,`New project added successfully`),a(),setTimeout(()=>r(),700)}catch(e){f(e.response?.data?.message||`Failed`),i.error(`Save Failed`,e.response?.data?.message||`Could not create project`)}finally{l(!1)}},noValidate:!0,children:[(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginBottom:12},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Project Name `,(0,v.jsx)(`span`,{className:`opt`,children:n.length>0?`${n.length} from BioData`:`enter manually`})]}),(0,v.jsx)(V,{subs:n,val:o.project_name,onChange:e=>s(t=>({...t,project_name:e})),placeholder:`Enter project name (optional)…`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Type `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:k,val:o.project_type,onChange:e=>s(t=>({...t,project_type:e})),placeholder:`Type`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Status `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:A,val:o.status,onChange:e=>s(t=>({...t,status:e})),placeholder:`Status`})]})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,style:{marginTop:10},children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Start Date `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(m,{value:o.start_date,onChange:e=>s(t=>({...t,start_date:e}))})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Budget (₹) `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`number`,value:o.total_budget,onChange:e=>s(t=>({...t,total_budget:e.target.value})),required:!0,min:`0`,step:`0.01`,placeholder:`e.g. 2500000`})]})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginTop:10},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Notes `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,value:o.type_notes,onChange:e=>s(t=>({...t,type_notes:e.target.value})),placeholder:`Additional notes…`})]}),parseFloat(o.total_budget)>0&&(0,v.jsxs)(`div`,{className:`CP-preview gold`,style:{marginTop:12,gap:14},children:[(0,v.jsx)(N,{n:`info`,s:13,c:`var(--gold)`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-preview-lbl`,children:`Initial Budget`}),(0,v.jsx)(`div`,{className:`CP-preview-val`,style:{color:`var(--gold)`},children:b(parseFloat(o.total_budget))})]})]}),(0,v.jsxs)(`p`,{className:`CP-req-note`,children:[(0,v.jsx)(`span`,{style:{color:`var(--rd)`},children:`*`}),` Required: Start Date & Budget`]}),(0,v.jsxs)(`div`,{className:`CP-modal-actions`,children:[(0,v.jsx)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:c,style:{background:`linear-gradient(135deg,var(--gd),var(--or2))`},children:c?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner`}),`Saving…`]}):`✓ Save Project`}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:r,children:`Cancel`})]})]})]})]})})})}function G({mode:e,editClient:t,bioRecords:n,existingClientNames:r,namesLoading:a,onClose:o,onSaved:s}){let c=e===`edit`&&!!t,[l,d]=(0,_.useState)(0),[f,h]=(0,_.useState)(()=>c&&t&&D(T(n),t.name)||null);(0,_.useEffect)(()=>{if(c&&t&&!f&&n.length>0){let e=D(T(n),t.name);e&&h(e)}},[n]);let[g,y]=(0,_.useState)({name:t?.name||``,id_number:t?.id_number||``,notes:t?.notes||``}),[x,S]=(0,_.useState)({project_name:``,project_type:`construction`,start_date:``,total_budget:``,type_notes:``,status:`active`}),[C,w]=(0,_.useState)(!1),[j,M]=(0,_.useState)(``),[F,I]=(0,_.useState)({open:!1,pendingStep:null}),[L,R]=(0,_.useState)(t?.id||null),H=O(f||(c?D(T(n),t.name):null)),U=E(n,r,c?t.name:void 0),W=async e=>{if(e.preventDefault(),!g.name.trim()||!g.id_number.trim()){M(`Client name and ID are required`),i.warning(`Required Fields`,`Client name and ID number are required.`);return}if(!c){let e=g.name.trim().toLowerCase();if(r.find(t=>t.trim().toLowerCase()===e)){I({open:!0,pendingStep:`next`});return}}if(c){w(!0),M(``);try{let e=localStorage.getItem(`token`);await u.put(`/api/client-portal/clients/${t.id}`,g,{headers:{Authorization:`Bearer ${e}`}}),M(`Client updated!`),i.success(`Client Updated!`,`"${g.name}" saved successfully`),s(),setTimeout(()=>o(),600)}catch(e){M(e.response?.data?.message||`Failed`),i.error(`Save Failed`,e.response?.data?.message||`Could not update client`)}finally{w(!1)}return}M(``),d(1)},G=async e=>{e.preventDefault(),w(!0),M(``);try{let e={Authorization:`Bearer ${localStorage.getItem(`token`)}`},t=L;if(!t){let n=await u.post(`client-portal/clients`,g,{headers:e});t=n.data.data?.id||n.data.id,R(t)}x.start_date&&x.total_budget&&await u.post(`/api/client-portal/clients/${t}/projects`,{...x,project_name:x.project_name||``,total_budget:parseFloat(x.total_budget)},{headers:e}),M(`Saved!`),i.success(`Client Saved!`,`"${g.name}" registered successfully`),s(),setTimeout(()=>o(),700)}catch(e){M(e.response?.data?.message||`Save failed`),i.error(`Save Failed`,e.response?.data?.message||`Could not save client`)}finally{w(!1)}},K=async()=>{if(!g.name.trim()||!g.id_number.trim()){M(`Required fields missing`),i.warning(`Required Fields`,`Client name and ID number are required.`);return}w(!0),M(``);try{let e=localStorage.getItem(`token`),t=await u.post(`client-portal/clients`,g,{headers:{Authorization:`Bearer ${e}`}});R(t.data.data?.id||t.data.id),M(`Client saved!`),s(),setTimeout(()=>o(),600)}catch(e){M(e.response?.data?.message||`Failed`)}finally{w(!1)}};return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(P,{children:(0,v.jsx)(`div`,{className:`CP-root CP-fp-overlay`,onClick:e=>{e.target===e.currentTarget&&o()},children:(0,v.jsxs)(`div`,{className:`CP-fp-modal`,children:[(0,v.jsx)(`div`,{className:`CP-modal-top`,style:{background:`linear-gradient(90deg,#080C18,var(--gd) 60%,var(--or3))`}}),(0,v.jsxs)(`div`,{className:`CP-modal-body`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr`,children:[(0,v.jsxs)(`div`,{className:`CP-modal-hdr-l`,children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl-ico`,style:{background:`var(--gd-t)`,border:`1.5px solid var(--gd-r)`},children:(0,v.jsx)(N,{n:c?`edit`:`user`,s:18,c:`var(--gd)`})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-modal-ttl`,children:c?`Edit Client`:`Add Client`}),(0,v.jsx)(`div`,{className:`CP-modal-sub`,children:c?`Editing: ${t.name}`:`Fill client info, optionally add first project`})]})]}),(0,v.jsx)(`button`,{className:`CP-fp-close`,onClick:o,title:`Close`,"aria-label":`Close`,children:(0,v.jsx)(N,{n:`x`,s:18})})]}),!c&&(0,v.jsxs)(`div`,{className:`CP-wizard`,children:[(0,v.jsxs)(`button`,{type:`button`,className:`CP-wtab${l===0?` active`:` done`}`,onClick:()=>l===1&&d(0),children:[(0,v.jsx)(`div`,{className:`CP-wnum`,children:l>0?`✓`:`1`}),(0,v.jsx)(`span`,{children:`Client Info`})]}),(0,v.jsxs)(`button`,{type:`button`,className:`CP-wtab${l===1?` active`:``}`,children:[(0,v.jsx)(`div`,{className:`CP-wnum`,children:`2`}),(0,v.jsx)(`span`,{children:`Project Info`})]})]}),(l===0||c)&&(0,v.jsxs)(`form`,{onSubmit:W,noValidate:!0,children:[(0,v.jsxs)(`div`,{className:`CP-modal-divider`,children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag jade`,children:`01 — Identity`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginBottom:12},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[(0,v.jsx)(N,{n:`user`,s:10}),` Client Name `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(B,{options:U,value:g.name,loading:a,onChange:(e,t,n)=>{h(n),y(n=>({...n,name:e,id_number:t})),S(e=>({...e,project_name:``}))}})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginBottom:12},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`ID Number `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(`input`,{className:`CP-input`,value:g.id_number,onChange:e=>y(t=>({...t,id_number:e.target.value})),placeholder:`Auto-filled from BioData`})]}),f&&(0,v.jsxs)(`div`,{className:`CP-cci`,children:[(0,v.jsx)(`div`,{className:`CP-cci-av`,children:f.name.charAt(0)}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontWeight:800,fontSize:11.5},children:f.name}),(0,v.jsx)(`div`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,color:`var(--t4)`,marginTop:2},children:f.id_details}),H.length>0&&(0,v.jsxs)(`span`,{className:`CP-chip CP-type-interior`,style:{marginTop:5},children:[H.length,` project names`]})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-divider`,children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag jade`,children:`02 — Description`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Notes `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`textarea`,{className:`CP-textarea CP-input`,value:g.notes,onChange:e=>y(t=>({...t,notes:e.target.value})),placeholder:`Any notes about this client…`})]}),(0,v.jsxs)(`p`,{className:`CP-req-note`,children:[(0,v.jsx)(`span`,{style:{color:`var(--rd)`},children:`*`}),` Required fields`]}),(0,v.jsxs)(`div`,{className:`CP-modal-actions`,children:[c?(0,v.jsx)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:C,style:{background:`linear-gradient(135deg,var(--gd),var(--or2))`},children:C?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner`}),`Updating…`]}):`✓ Update Client`}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:C,children:[`Next: Add Project `,(0,v.jsx)(N,{n:`arrow`,s:12,c:`#fff`})]}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,disabled:C,onClick:K,children:C?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner-or`}),`…`]}):`Save Client Only`})]}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:o,children:`Cancel`})]})]}),l===1&&!c&&(0,v.jsxs)(`form`,{onSubmit:G,noValidate:!0,children:[(0,v.jsxs)(`div`,{className:`CP-cci`,style:{marginBottom:18},children:[(0,v.jsx)(`div`,{className:`CP-cci-av`,children:g.name.charAt(0)}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontSize:8,fontFamily:`var(--ff-m)`,color:`var(--t4)`,textTransform:`uppercase`,letterSpacing:`.06em`,marginBottom:2},children:`Adding project for`}),(0,v.jsx)(`div`,{style:{fontWeight:800,fontSize:12.5},children:g.name}),(0,v.jsx)(`div`,{style:{fontFamily:`var(--ff-m)`,fontSize:9,color:`var(--t4)`},children:g.id_number})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-divider`,children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag jade`,children:`01 — Project Info`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginBottom:12},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Project Name `,(0,v.jsx)(`span`,{className:`opt`,children:H.length>0?`${H.length} from BioData`:`enter manually`})]}),(0,v.jsx)(V,{subs:H,val:x.project_name,onChange:e=>S(t=>({...t,project_name:e})),placeholder:`Enter project name…`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Type `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:k,val:x.project_type,onChange:e=>S(t=>({...t,project_type:e})),placeholder:`Select type`})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Status `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(z,{opts:A,val:x.status,onChange:e=>S(t=>({...t,status:e})),placeholder:`Select status`})]})]}),(0,v.jsxs)(`div`,{className:`CP-modal-divider`,style:{marginTop:18},children:[(0,v.jsx)(`span`,{className:`CP-modal-div-tag jade`,children:`02 — Budget & Timeline`}),(0,v.jsx)(`div`,{className:`CP-modal-div-line`})]}),(0,v.jsxs)(`div`,{className:`CP-g2`,children:[(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[(0,v.jsx)(N,{n:`cal`,s:10}),` Start Date `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(m,{value:x.start_date,onChange:e=>S(t=>({...t,start_date:e}))})]}),(0,v.jsxs)(`div`,{className:`CP-field`,children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Budget (₹) `,(0,v.jsx)(`span`,{className:`req`,children:`*`})]}),(0,v.jsx)(`input`,{className:`CP-input`,type:`number`,value:x.total_budget,onChange:e=>S(t=>({...t,total_budget:e.target.value})),min:`0`,step:`0.01`,placeholder:`e.g. 2500000`,required:!0})]})]}),(0,v.jsxs)(`div`,{className:`CP-field`,style:{marginTop:10},children:[(0,v.jsxs)(`label`,{className:`CP-label`,children:[`Notes `,(0,v.jsx)(`span`,{className:`opt`,children:`(opt)`})]}),(0,v.jsx)(`input`,{className:`CP-input`,value:x.type_notes,onChange:e=>S(t=>({...t,type_notes:e.target.value})),placeholder:`Extra notes…`})]}),parseFloat(x.total_budget)>0&&(0,v.jsxs)(`div`,{className:`CP-preview gold`,style:{marginTop:12,gap:14},children:[(0,v.jsx)(N,{n:`info`,s:13,c:`var(--gold)`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{className:`CP-preview-lbl`,children:`Initial Budget`}),(0,v.jsx)(`div`,{className:`CP-preview-val`,style:{color:`var(--gold)`},children:b(parseFloat(x.total_budget))})]})]}),(0,v.jsxs)(`p`,{className:`CP-req-note`,children:[(0,v.jsx)(`span`,{style:{color:`var(--rd)`},children:`*`}),` Required`]}),(0,v.jsxs)(`div`,{className:`CP-modal-actions`,children:[(0,v.jsx)(`button`,{type:`submit`,className:`CP-btn-primary`,disabled:C,style:{background:`linear-gradient(135deg,var(--gd),var(--or2))`},children:C?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`span`,{className:`CP-spinner`}),`Saving…`]}):`✓ Save Client & Project`}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,disabled:C,onClick:K,children:`Save Client Only`}),(0,v.jsx)(`button`,{type:`button`,className:`CP-btn-ghost`,onClick:()=>d(0),children:`← Back`})]})]})]})]})})}),(0,v.jsx)(p,{open:F.open,entityName:`Client`,duplicateFields:[{label:`Name`,value:g.name}],onAddAnyway:()=>{I({open:!1,pendingStep:null}),d(1)},onCancel:()=>I({open:!1,pendingStep:null}),loading:C})]})}function K({clientId:e,project:t,seqNum:n,subNames:r,onRefresh:a,panelCard:o}){let[s,c]=(0,_.useState)(!1),[l,d]=(0,_.useState)(t),[p,m]=(0,_.useState)(null),[h,g]=(0,_.useState)([]),[S,C]=(0,_.useState)(!1),[w,T]=(0,_.useState)(!1),[E,D]=(0,_.useState)({open:!1,type:``,id:0,name:``,loading:!1}),[O,k]=(0,_.useState)(!1),[A,j]=(0,_.useState)(null),[M,P]=(0,_.useState)(null);(0,_.useEffect)(()=>{d(t)},[t]),(0,_.useEffect)(()=>{s&&o&&I()},[s,o]);let F=async()=>{try{let t=localStorage.getItem(`token`),n=await u.get(`/api/client-portal/clients/${e}/projects/${l.id}`,{headers:{Authorization:`Bearer ${t}`}});d(n.data.data),n.data.data.payments&&g(e=>e),a()}catch(e){console.error(e)}},I=async()=>{if(!S)try{let t=localStorage.getItem(`token`),n=await u.get(`/api/client-portal/clients/${e}/projects/${l.id}/budget-history`,{headers:{Authorization:`Bearer ${t}`}});g(y(n.data.data??n.data)),C(!0)}catch{C(!0)}},L=async()=>{try{let t=localStorage.getItem(`token`),n=await u.get(`/api/client-portal/clients/${e}/projects/${l.id}/budget-history`,{headers:{Authorization:`Bearer ${t}`}});g(y(n.data.data??n.data)),C(!0)}catch{}},R=()=>{D({open:!0,type:`project`,id:l.id,name:l.project_name,loading:!1})},z=async()=>{let{type:t,id:n}=E;D(e=>({...e,loading:!0}));try{let r={headers:{Authorization:`Bearer ${localStorage.getItem(`token`)}`}};t===`project`?(await u.delete(`/api/client-portal/clients/${e}/projects/${n}`,r),a()):t===`payment`?(await u.delete(`/api/client-portal/payments/${n}`,r),F()):t===`budget_history`&&(await u.delete(`/api/client-portal/budget-history/${n}`,r),g(e=>e.filter(e=>e.id!==n)),F())}catch(e){i.error(`Delete Failed`,e.response?.data?.message||`Could not delete the item.`)}finally{D({open:!1,type:``,id:0,name:``,loading:!1})}},B=l.total_budget>0?Math.round(l.total_collected/l.total_budget*100):0,V=l.total_budget>0?Math.round(l.total_collected/l.total_budget*100):0,W=l.balance<=0,G=l.status||`active`,K=e=>new Intl.NumberFormat(`en-IN`,{style:`currency`,currency:`INR`,maximumFractionDigits:0}).format(e);return o?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`div`,{className:`CP-pjcard`,style:{animationDelay:`${n*40}ms`},children:[(0,v.jsxs)(`div`,{className:`CP-pjcard-left`,children:[(0,v.jsx)(`div`,{className:`CP-pjcard-num`,children:String(n).padStart(2,`0`)}),(0,v.jsx)(`div`,{className:`CP-pjcard-icon`,children:(0,v.jsx)(`svg`,{width:11,height:11,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})})})]}),(0,v.jsxs)(`div`,{className:`CP-pjcard-body`,onClick:()=>c(!s),style:{cursor:`pointer`},children:[(0,v.jsx)(`div`,{className:`CP-pjcard-title`,children:l.project_name||`Unnamed Project`}),(0,v.jsxs)(`div`,{className:`CP-pjcard-meta`,children:[(0,v.jsxs)(`span`,{className:`CP-pjcard-chip CP-pjcard-chip-type`,children:[(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})}),l.type_label]}),(0,v.jsxs)(`span`,{className:`CP-pjcard-chip CP-pjcard-chip-status-${G}`,children:[G===`active`?(0,v.jsx)(`svg`,{width:6,height:6,viewBox:`0 0 6 6`,fill:`currentColor`,children:(0,v.jsx)(`circle`,{cx:`3`,cy:`3`,r:`3`})}):G===`completed`?(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,v.jsx)(`polyline`,{points:`20 6 9 17 4 12`})}):(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,v.jsx)(`line`,{x1:`10`,y1:`15`,x2:`10`,y2:`9`}),(0,v.jsx)(`line`,{x1:`14`,y1:`15`,x2:`14`,y2:`9`})]}),l.status_label]}),(0,v.jsxs)(`span`,{className:`CP-pjcard-date`,children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,children:[(0,v.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`}),(0,v.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,v.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,v.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),l.start_date?new Date(l.start_date).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}):`No date`]})]}),(0,v.jsxs)(`div`,{className:`CP-pjcard-prog-row`,children:[(0,v.jsxs)(`span`,{className:`CP-pjcard-prog-pct`,children:[V,`%`]}),(0,v.jsx)(`div`,{className:`CP-pjcard-mini-bar`,children:(0,v.jsx)(`div`,{className:`CP-pjcard-mini-fill`,style:{width:`${V}%`}})})]})]}),(0,v.jsxs)(`div`,{className:`CP-pjcard-right`,children:[(0,v.jsx)(`div`,{className:`CP-pjcard-amt ${W?`grn`:`red`}`,children:K(W?l.total_budget:l.balance)}),(0,v.jsx)(`span`,{className:`CP-pjcard-status ${W?`done`:`open`}`,children:W?`✓ SETTLED`:`⚡ BALANCE`}),(0,v.jsxs)(`div`,{className:`CP-pjcard-bal-row`,children:[(0,v.jsxs)(`span`,{className:`CP-pjcard-bal-lbl`,children:[K(l.total_collected),` paid`]}),(0,v.jsxs)(`span`,{className:`CP-pjcard-bal-lbl`,children:[`/ `,K(l.total_budget)]})]})]}),(0,v.jsxs)(`div`,{className:`CP-pjcard-acts`,children:[(0,v.jsxs)(`button`,{className:`CP-pjcard-act pay`,onClick:()=>m(`collect`),children:[(0,v.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`rect`,{x:`1`,y:`4`,width:`22`,height:`16`,rx:`2`}),(0,v.jsx)(`line`,{x1:`1`,y1:`10`,x2:`23`,y2:`10`})]}),`Pay`]}),(0,v.jsxs)(`button`,{className:`CP-pjcard-act bgt`,onClick:()=>m(`budget`),children:[(0,v.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`line`,{x1:`12`,y1:`1`,x2:`12`,y2:`23`}),(0,v.jsx)(`path`,{d:`M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6`})]}),`Budget`]}),(0,v.jsxs)(`button`,{className:`CP-pjcard-act edt`,onClick:()=>T(!0),children:[(0,v.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`path`,{d:`M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7`}),(0,v.jsx)(`path`,{d:`M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z`})]}),`Edit`]}),(0,v.jsxs)(`button`,{className:`CP-pjcard-act del`,onClick:R,children:[(0,v.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`polyline`,{points:`3 6 5 6 21 6`}),(0,v.jsx)(`path`,{d:`M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2`})]}),`Del`]})]})]}),s&&(0,v.jsxs)(`div`,{style:{marginBottom:8,borderRadius:12,border:`1.5px solid var(--border,#E9EEF5)`,overflow:`hidden`,animation:`CP-slideDown .28s cubic-bezier(0.4,0,0.2,1) both`,background:`#F8FAFC`},children:[(0,v.jsxs)(`div`,{className:`CP-prog-panel`,children:[(0,v.jsxs)(`div`,{className:`CP-prog-hdr`,children:[(0,v.jsxs)(`div`,{className:`CP-prog-hdr-left`,children:[(0,v.jsx)(`span`,{className:`CP-prog-hdr-icon`,children:(0,v.jsxs)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,v.jsx)(`polyline`,{points:`12 6 12 12 16 14`})]})}),`Collection Progress`]}),(0,v.jsx)(`span`,{className:`CP-prog-hdr-badge${V>=75?` good`:V>=40?` mid`:` low`}`,children:V>=75?`On Track`:V>=40?`In Progress`:`Needs Attention`})]}),(0,v.jsxs)(`div`,{className:`CP-prog-body`,children:[(0,v.jsx)(`div`,{className:`CP-prog-ring-wrap`,children:(0,v.jsxs)(`svg`,{viewBox:`0 0 140 140`,className:`CP-prog-svg`,children:[(0,v.jsxs)(`defs`,{children:[(0,v.jsxs)(`linearGradient`,{id:`cg-${l.id}`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`100%`,children:[(0,v.jsx)(`stop`,{offset:`0%`,stopColor:`#2563EB`}),(0,v.jsx)(`stop`,{offset:`50%`,stopColor:`#2563EB`}),(0,v.jsx)(`stop`,{offset:`100%`,stopColor:`#ffb347`})]}),(0,v.jsxs)(`filter`,{id:`cglow-${l.id}`,children:[(0,v.jsx)(`feGaussianBlur`,{stdDeviation:`3`,result:`blur`}),(0,v.jsxs)(`feMerge`,{children:[(0,v.jsx)(`feMergeNode`,{in:`blur`}),(0,v.jsx)(`feMergeNode`,{in:`SourceGraphic`})]})]})]}),(0,v.jsx)(`circle`,{cx:`70`,cy:`70`,r:`62`,fill:`none`,stroke:`rgba(37,99,235,0.08)`,strokeWidth:`1.5`}),(0,v.jsx)(`circle`,{cx:`70`,cy:`70`,r:`52`,fill:`none`,stroke:`#E9EEF5`,strokeWidth:`14`,strokeLinecap:`round`}),(0,v.jsx)(`circle`,{cx:`70`,cy:`70`,r:`52`,fill:`none`,stroke:`url(#cg-${l.id})`,strokeWidth:`14`,strokeLinecap:`round`,strokeDasharray:`${2*Math.PI*52*V/100} ${2*Math.PI*52}`,strokeDashoffset:2*Math.PI*52*.25,filter:`url(#cglow-${l.id})`,style:{transition:`stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)`}}),(0,v.jsx)(`circle`,{cx:`70`,cy:`70`,r:`44`,fill:`#FFFFFF`}),(0,v.jsx)(`circle`,{cx:`70`,cy:`70`,r:`44`,fill:`none`,stroke:`rgba(37,99,235,0.16)`,strokeWidth:`1`}),(0,v.jsxs)(`text`,{x:`70`,y:`63`,textAnchor:`middle`,fontSize:`24`,fontWeight:`900`,fontFamily:`'Georgia',serif`,fill:`#2563EB`,children:[V,`%`]}),(0,v.jsx)(`text`,{x:`70`,y:`77`,textAnchor:`middle`,fontSize:`7.5`,fontWeight:`800`,fontFamily:`monospace`,fill:`#64748B`,letterSpacing:`1.5`,children:`COLLECTED`}),(0,v.jsx)(`text`,{x:`70`,y:`91`,textAnchor:`middle`,fontSize:`8`,fontWeight:`800`,fontFamily:`monospace`,fill:`#1D4ED8`,children:K(l.total_collected)})]})}),(0,v.jsxs)(`div`,{className:`CP-prog-stats`,children:[(0,v.jsxs)(`div`,{className:`CP-kpi-card collected`,style:{animationDelay:`0.1s`},children:[(0,v.jsxs)(`div`,{className:`CP-kpi-top`,children:[(0,v.jsx)(`span`,{className:`CP-kpi-icon collected`,children:(0,v.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:2.6,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,v.jsx)(`polyline`,{points:`20 6 9 17 4 12`})})}),(0,v.jsx)(`span`,{className:`CP-kpi-lbl`,children:`Collected`})]}),(0,v.jsx)(`div`,{className:`CP-kpi-val`,style:{color:`#2563EB`},children:K(l.total_collected)}),(0,v.jsx)(`div`,{className:`CP-kpi-bar-track`,children:(0,v.jsx)(`div`,{className:`CP-kpi-bar-fill`,style:{width:`${V}%`,background:`linear-gradient(90deg,#2563EB,#2563EB,#ffb347)`,animationDelay:`0.25s`}})}),(0,v.jsxs)(`div`,{className:`CP-kpi-sub`,children:[V,`% of total budget`]})]}),(0,v.jsxs)(`div`,{className:`CP-kpi-card pending`,style:{animationDelay:`0.2s`},children:[(0,v.jsxs)(`div`,{className:`CP-kpi-top`,children:[(0,v.jsx)(`span`,{className:`CP-kpi-icon pending`,children:(0,v.jsxs)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`#D93B55`,strokeWidth:2.6,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,v.jsx)(`line`,{x1:`12`,y1:`8`,x2:`12`,y2:`12`}),(0,v.jsx)(`line`,{x1:`12`,y1:`16`,x2:`12.01`,y2:`16`})]})}),(0,v.jsx)(`span`,{className:`CP-kpi-lbl`,children:`Pending`})]}),(0,v.jsx)(`div`,{className:`CP-kpi-val`,style:{color:`#D93B55`},children:K(l.balance)}),(0,v.jsx)(`div`,{className:`CP-kpi-bar-track`,children:(0,v.jsx)(`div`,{className:`CP-kpi-bar-fill`,style:{width:`${Math.max(0,100-V)}%`,background:`linear-gradient(90deg,#D93B55,#f87171)`,animationDelay:`0.40s`}})}),(0,v.jsxs)(`div`,{className:`CP-kpi-sub`,children:[Math.max(0,100-V),`% still due`]})]}),(0,v.jsxs)(`div`,{className:`CP-kpi-card total`,style:{animationDelay:`0.3s`},children:[(0,v.jsxs)(`div`,{className:`CP-kpi-top`,children:[(0,v.jsx)(`span`,{className:`CP-kpi-icon total`,children:(0,v.jsxs)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`#1D4ED8`,strokeWidth:2.6,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,v.jsx)(`rect`,{x:`2`,y:`7`,width:`20`,height:`14`,rx:`2`}),(0,v.jsx)(`path`,{d:`M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16`})]})}),(0,v.jsx)(`span`,{className:`CP-kpi-lbl`,children:`Total Budget`})]}),(0,v.jsx)(`div`,{className:`CP-kpi-val`,style:{color:`#1D4ED8`},children:K(l.total_budget)}),(0,v.jsx)(`div`,{className:`CP-kpi-bar-track`,children:(0,v.jsx)(`div`,{className:`CP-kpi-bar-fill`,style:{width:`100%`,background:`linear-gradient(90deg,#1D4ED8,#3B82F6)`,animationDelay:`0.55s`}})}),(0,v.jsx)(`div`,{className:`CP-kpi-sub`,children:l.total_gst>0?`incl. ${K(l.total_gst)} GST`:`Project ceiling`})]})]})]})]}),(0,v.jsxs)(`div`,{className:`CP-pay-block`,children:[(0,v.jsx)(`div`,{className:`CP-pay-block-hdr`,children:`Recent Payments`}),l.payments&&l.payments.length>0?(()=>{let e=[...l.payments].sort((e,t)=>{let n=e.created_at?new Date(e.created_at).getTime():0,r=t.created_at?new Date(t.created_at).getTime():0;return r===n?(t.id||0)-(e.id||0):r-n}),t=O?e:e.slice(0,5),n=e.length-5;return(0,v.jsxs)(`div`,{className:`CP-pay-list`,children:[t.map((e,t)=>{let n=e.payment_date?new Date(e.payment_date):null,r=n?n.toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}):`—`;return(0,v.jsxs)(`div`,{className:`CP-pay-row`,style:{animationDelay:`${t*45}ms`},children:[(0,v.jsx)(`span`,{className:`CP-pay-mode`,children:(e.mode_label||e.payment_mode).toUpperCase()}),(0,v.jsx)(`span`,{className:`CP-pay-amt`,children:K(e.total_amount)}),(0,v.jsxs)(`span`,{className:`CP-pay-date`,children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.2,children:[(0,v.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`}),(0,v.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,v.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,v.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),r]}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:4,marginLeft:6},children:[(0,v.jsx)(`button`,{type:`button`,className:`CP-act CP-act-edit`,style:{padding:`3px 7px`},title:`Edit Payment`,onClick:()=>{j(e),m(`collect`)},children:(0,v.jsxs)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`path`,{d:`M17 3l4 4-7 7H10v-4l7-7z`}),(0,v.jsx)(`path`,{d:`M3 21h18`})]})}),(0,v.jsx)(`button`,{type:`button`,className:`CP-act CP-act-del`,style:{padding:`3px 7px`},title:`Delete Payment`,onClick:()=>D({open:!0,type:`payment`,id:e.id,name:`payment of ${K(e.total_amount)}`,loading:!1}),children:(0,v.jsx)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:(0,v.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3`})})})]})]},e.id)}),n>0&&(0,v.jsxs)(`button`,{type:`button`,className:`CP-pay-more`,onClick:()=>k(e=>!e),children:[O?`Show less`:`View all ${e.length} payments`,(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.6,strokeLinecap:`round`,strokeLinejoin:`round`,style:{transform:O?`rotate(180deg)`:`none`,transition:`transform .2s`},children:(0,v.jsx)(`polyline`,{points:`6 9 12 15 18 9`})})]})]})})():(0,v.jsx)(`div`,{className:`CP-pay-empty`,children:`No payments recorded yet`})]}),h.length>0&&(0,v.jsxs)(`div`,{className:`CP-bgt-hist`,children:[(0,v.jsxs)(`div`,{className:`CP-bgt-hist-hdr`,children:[(0,v.jsxs)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`#1D4ED8`,strokeWidth:2.5,strokeLinecap:`round`,children:[(0,v.jsx)(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),(0,v.jsx)(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`}),(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`})]}),`Budget Additions`,(0,v.jsx)(`span`,{className:`CP-bgt-hist-count`,children:h.length})]}),(0,v.jsx)(`div`,{className:`CP-bgt-hist-list`,children:h.map((e,t)=>{let n=e.date_added?new Date(e.date_added).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}):`—`;return(0,v.jsxs)(`div`,{className:`CP-bgt-item`,style:{animationDelay:`${t*60}ms`},children:[(0,v.jsx)(`div`,{className:`CP-bgt-item-icon`,children:`💰`}),(0,v.jsxs)(`div`,{className:`CP-bgt-item-body`,children:[(0,v.jsxs)(`div`,{className:`CP-bgt-item-amt`,children:[`+`,K(e.extra_amount)]}),e.reason&&(0,v.jsx)(`div`,{className:`CP-bgt-item-reason`,children:e.reason})]}),(0,v.jsxs)(`div`,{className:`CP-bgt-item-date`,children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,children:[(0,v.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`}),(0,v.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,v.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,v.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),n]}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:4,flexShrink:0},children:[(0,v.jsx)(`button`,{type:`button`,className:`CP-act CP-act-edit`,style:{padding:`3px 7px`},title:`Edit Budget Entry`,onClick:()=>{P(e),m(`budget`)},children:(0,v.jsxs)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:[(0,v.jsx)(`path`,{d:`M17 3l4 4-7 7H10v-4l7-7z`}),(0,v.jsx)(`path`,{d:`M3 21h18`})]})}),(0,v.jsx)(`button`,{type:`button`,className:`CP-act CP-act-del`,style:{padding:`3px 7px`},title:`Delete Budget Entry`,onClick:()=>D({open:!0,type:`budget_history`,id:e.id,name:`budget addition of ${K(e.extra_amount)}`,loading:!1}),children:(0,v.jsx)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,children:(0,v.jsx)(`path`,{d:`M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3`})})})]})]},e.id)})})]})]}),p&&(0,v.jsx)(H,{initialTab:p,project:l,clientId:e,initialEditPayment:A,initialEditBudget:M,onClose:()=>{m(null),j(null),P(null)},onSaved:()=>{m(null),j(null),P(null),F(),L()}}),w&&(0,v.jsx)(U,{project:l,clientId:e,subNames:r,onClose:()=>T(!1),onSaved:()=>{T(!1),F()}}),(0,v.jsx)(f,{open:E.open,itemName:E.name,description:`This will be moved to the Recycle Bin.`,onConfirm:z,onCancel:()=>D({open:!1,type:``,id:0,name:``,loading:!1}),loading:E.loading})]}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`div`,{className:`CP-proj-row${s?` open`:``}`,style:{animationDelay:`${n*.04}s`},children:[(0,v.jsx)(`div`,{className:`CP-proj-cell CP-proj-cell-ctr`,children:(0,v.jsx)(`div`,{className:`CP-proj-seq`,children:n})}),(0,v.jsxs)(`div`,{className:`CP-proj-cell`,onClick:()=>c(!s),style:{cursor:`pointer`,gap:0},children:[(0,v.jsx)(`div`,{className:`CP-proj-toggle${s?` open`:``}`,children:(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:3,strokeLinecap:`round`,children:(0,v.jsx)(`polyline`,{points:`9 18 15 12 9 6`})})}),(0,v.jsx)(`div`,{className:`CP-proj-avatar`,children:(0,v.jsx)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})})}),(0,v.jsxs)(`div`,{style:{minWidth:0},children:[(0,v.jsx)(`div`,{className:`CP-proj-name`,children:l.project_name||`Unnamed Project`}),(0,v.jsxs)(`div`,{className:`CP-proj-date`,children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,style:{verticalAlign:`middle`,marginRight:2},children:[(0,v.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`}),(0,v.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,v.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,v.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),x(l.start_date)]})]})]}),(0,v.jsx)(`div`,{className:`CP-proj-cell CP-proj-cell-ctr`,children:(0,v.jsx)(`span`,{className:`CP-chip CP-type-${l.project_type||`pmc`}`,children:l.type_label})}),(0,v.jsx)(`div`,{className:`CP-proj-cell CP-proj-cell-ctr`,children:(0,v.jsxs)(`span`,{className:`CP-chip CP-status-${l.status||`active`}`,children:[l.status===`active`&&(0,v.jsx)(`svg`,{width:6,height:6,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,v.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`})}),l.status_label]})}),(0,v.jsx)(`div`,{className:`CP-proj-cell CP-proj-cell-rgt`,children:(0,v.jsx)(`span`,{className:`CP-money CP-money-bgt`,children:b(l.total_budget)})}),(0,v.jsx)(`div`,{className:`CP-proj-cell CP-proj-cell-rgt`,children:(0,v.jsx)(`span`,{className:`CP-money CP-money-col`,children:b(l.total_collected)})}),(0,v.jsx)(`div`,{className:`CP-proj-cell CP-proj-cell-rgt`,children:(0,v.jsxs)(`div`,{className:`CP-prog-wrap`,children:[(0,v.jsxs)(`span`,{className:`CP-prog-pct`,children:[B,`%`]}),(0,v.jsx)(`div`,{className:`CP-prog-track`,children:(0,v.jsx)(`div`,{className:`CP-prog-fill`,style:{width:`${B}%`}})})]})}),(0,v.jsxs)(`div`,{className:`CP-proj-cell CP-proj-cell-rgt`,onClick:e=>e.stopPropagation(),style:{gap:4,flexWrap:`wrap`},children:[(0,v.jsx)(`span`,{className:`CP-money CP-money-bal`,children:b(l.balance)}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:3,marginLeft:4},children:[(0,v.jsxs)(`button`,{className:`CP-act CP-act-jade`,title:`Add Payment`,onClick:()=>m(`collect`),children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`rect`,{x:`1`,y:`4`,width:`22`,height:`16`,rx:`2`}),(0,v.jsx)(`line`,{x1:`1`,y1:`10`,x2:`23`,y2:`10`})]}),`Pay`]}),(0,v.jsx)(`button`,{className:`CP-act CP-act-add`,title:`Add Budget`,onClick:()=>m(`budget`),children:(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`line`,{x1:`12`,y1:`1`,x2:`12`,y2:`23`}),(0,v.jsx)(`path`,{d:`M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6`})]})}),(0,v.jsx)(`button`,{className:`CP-act CP-act-edit`,title:`Edit`,onClick:()=>T(!0),children:(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`path`,{d:`M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7`}),(0,v.jsx)(`path`,{d:`M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z`})]})}),(0,v.jsx)(`button`,{className:`CP-act CP-act-del`,title:`Delete`,onClick:R,children:(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`polyline`,{points:`3 6 5 6 21 6`}),(0,v.jsx)(`path`,{d:`M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2`})]})})]})]})]}),s&&(0,v.jsxs)(`div`,{className:`CP-detail-panel`,children:[(0,v.jsx)(`div`,{className:`CP-detail-stats`,children:[{lbl:`Budget`,val:b(l.total_budget),color:`var(--or)`},{lbl:`Collected`,val:b(l.total_collected),color:`var(--gr)`},{lbl:`Balance`,val:b(l.balance),color:`var(--rd)`},{lbl:`GST Paid`,val:b(l.total_gst||0),color:`var(--gd)`}].map(e=>(0,v.jsxs)(`div`,{className:`CP-detail-stat`,children:[(0,v.jsx)(`div`,{className:`CP-detail-stat-lbl`,children:e.lbl}),(0,v.jsx)(`div`,{className:`CP-detail-stat-val`,style:{color:e.color},children:e.val})]},e.lbl))}),(0,v.jsxs)(`div`,{className:`CP-detail-prog`,children:[(0,v.jsxs)(`div`,{className:`CP-detail-prog-hdr`,children:[(0,v.jsx)(`span`,{className:`CP-detail-prog-lbl`,children:`Collection Progress`}),(0,v.jsxs)(`span`,{className:`CP-detail-prog-pct`,children:[l.collected_pct||B,`%`]})]}),(0,v.jsx)(`div`,{className:`CP-detail-prog-bar`,children:(0,v.jsx)(`div`,{className:`CP-detail-prog-fill`,style:{width:`${Math.max(B,B>0?2:0)}%`}})}),(0,v.jsxs)(`div`,{className:`CP-detail-prog-foot`,children:[(0,v.jsxs)(`div`,{className:`CP-detail-prog-kpi`,children:[(0,v.jsx)(`span`,{className:`CP-detail-prog-kpi-lbl`,children:`Budget`}),(0,v.jsx)(`span`,{className:`CP-detail-prog-kpi-val`,children:b(l.total_budget)})]}),(0,v.jsxs)(`div`,{className:`CP-detail-prog-kpi`,children:[(0,v.jsx)(`span`,{className:`CP-detail-prog-kpi-lbl`,children:`Collected`}),(0,v.jsx)(`span`,{className:`CP-detail-prog-kpi-val`,style:{color:`#ffb84d`},children:b(l.total_collected)})]}),(0,v.jsxs)(`div`,{className:`CP-detail-prog-kpi`,children:[(0,v.jsx)(`span`,{className:`CP-detail-prog-kpi-lbl`,children:`Balance`}),(0,v.jsx)(`span`,{className:`CP-detail-prog-kpi-val`,style:{color:`rgba(255,255,255,0.85)`},children:b(l.balance)})]})]})]}),l.next_due_date&&(0,v.jsxs)(`div`,{className:`CP-detail-due`,children:[(0,v.jsx)(N,{n:`cal`,s:13,c:`var(--gd)`}),(0,v.jsxs)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:9.5,color:`var(--t3)`},children:[`Next due:\xA0`,(0,v.jsx)(`strong`,{style:{color:`var(--gd)`},children:x(l.next_due_date)})]})]}),l.payments&&l.payments.length>0?(0,v.jsxs)(`div`,{className:`CP-tx-feed`,style:{marginBottom:14},children:[(0,v.jsxs)(`div`,{className:`CP-tx-feed-hdr`,children:[(0,v.jsx)(`div`,{className:`CP-tx-feed-title`,children:`Recent Transactions`}),(0,v.jsx)(`div`,{style:{fontFamily:`var(--ff-m)`,fontSize:9.5,fontWeight:800,color:`var(--success,#1E7A5A)`},children:b(y(l.payments).reduce((e,t)=>e+t.total_amount,0))})]}),(0,v.jsx)(`div`,{className:`CP-tx-scroll`,children:l.payments.map((e,t)=>(0,v.jsxs)(`div`,{className:`CP-tx-item`,style:{animationDelay:`${Math.min(t,8)*40}ms`},onClick:()=>m(`collect`),children:[(0,v.jsx)(`div`,{className:`CP-tx-icon-erp`,children:(0,v.jsx)(N,{n:`pay`,s:15,c:`var(--ember,#2563EB)`})}),(0,v.jsxs)(`div`,{className:`CP-tx-body`,children:[(0,v.jsx)(`div`,{className:`CP-tx-amount`,children:b(e.amount)}),(0,v.jsxs)(`div`,{className:`CP-tx-meta`,children:[(0,v.jsxs)(`span`,{className:`CP-tx-date`,children:[(0,v.jsx)(N,{n:`cal`,s:9}),x(e.payment_date)]}),(0,v.jsx)(`span`,{className:`CP-tx-mode-badge`,children:e.mode_label}),e.reference_number&&(0,v.jsxs)(`span`,{className:`CP-tx-ref`,children:[`#`,e.reference_number]})]})]}),(0,v.jsxs)(`div`,{className:`CP-tx-right`,children:[(0,v.jsx)(`div`,{className:`CP-tx-total`,children:b(e.total_amount)}),e.gst_amount>0&&(0,v.jsxs)(`div`,{className:`CP-tx-gst`,children:[`+GST `,b(e.gst_amount)]})]})]},e.id))})]}):(0,v.jsxs)(`div`,{className:`CP-tx-empty`,style:{marginBottom:14},children:[(0,v.jsx)(`div`,{className:`CP-tx-empty-icon`,children:(0,v.jsx)(N,{n:`pay`,s:20,c:`var(--ember,#2563EB)`})}),(0,v.jsx)(`div`,{className:`CP-tx-empty-title`,children:`No payments yet`}),(0,v.jsx)(`div`,{className:`CP-tx-empty-sub`,children:`Record first payment to see transactions`})]}),(0,v.jsxs)(`div`,{className:`CP-detail-actions`,children:[(0,v.jsxs)(`button`,{className:`CP-btn-primary`,style:{background:`linear-gradient(135deg,var(--jade),var(--jade2))`,boxShadow:`0 4px 16px var(--jade-g)`},onClick:()=>m(`collect`),children:[(0,v.jsx)(N,{n:`pay`,s:15,c:`#fff`}),` Add Payment`]}),(0,v.jsxs)(`button`,{className:`CP-btn-gold`,onClick:()=>m(`budget`),children:[(0,v.jsx)(N,{n:`chart`,s:14}),` Add Budget`]}),(0,v.jsxs)(`button`,{className:`CP-btn-ghost`,onClick:()=>T(!0),children:[(0,v.jsx)(N,{n:`edit`,s:12}),` Edit Project`]})]})]}),p&&(0,v.jsx)(H,{project:l,clientId:e,initialTab:p,onClose:()=>m(null),onSaved:F}),w&&(0,v.jsx)(U,{clientId:e,project:l,subNames:r,onClose:()=>T(!1),onSaved:()=>{T(!1),F()}}),(0,v.jsx)(f,{open:E.open,itemName:E.name,description:E.type===`project`?`This project and its payments will be moved to the Recycle Bin.`:`This payment will be moved to the Recycle Bin.`,onConfirm:z,onCancel:()=>D({open:!1,type:``,id:0,name:``,loading:!1}),loading:E.loading})]})}function q({client:e,seqNum:t,onRefresh:n,bioRecords:r,existingClientNames:a,panelMode:o}){let[s,c]=(0,_.useState)(!1),[l,d]=(0,_.useState)(e),[p,m]=(0,_.useState)([]),[h,g]=(0,_.useState)(!1),[x,S]=(0,_.useState)(!1),[C,w]=(0,_.useState)(!1),[E,k]=(0,_.useState)(!1),[A,j]=(0,_.useState)({open:!1,type:``,id:0,name:``,loading:!1});(0,_.useEffect)(()=>{d(e)},[e]),(0,_.useEffect)(()=>{o&&(c(!0),x||P())},[o,e.id]);let M=async()=>{let{type:e,id:t,name:r}=A;j(e=>({...e,loading:!0}));try{let r={headers:{Authorization:`Bearer ${localStorage.getItem(`token`)}`}};e===`client`?(await u.delete(`/api/client-portal/clients/${t}`,r),n()):e===`project`?(await u.delete(`/api/client-portal/clients/${l.id}/projects/${t}`,r),m(e=>e.filter(e=>e.id!==t)),n()):e===`payment`&&await u.delete(`/api/client-portal/payments/${t}`,r)}catch(e){i.error(`Delete Failed`,e.response?.data?.message||`Could not delete the item.`)}finally{j({open:!1,type:``,id:0,name:``,loading:!1})}},P=async()=>{if(!x){g(!0);try{let e=localStorage.getItem(`token`);m(y((await u.get(`/api/client-portal/clients/${l.id}/projects`,{headers:{Authorization:`Bearer ${e}`}})).data.data)),S(!0)}catch(e){console.error(e)}finally{g(!1)}}},F=async()=>{try{let e=localStorage.getItem(`token`),[t,r]=await Promise.all([u.get(`/api/client-portal/clients/${l.id}`,{headers:{Authorization:`Bearer ${e}`}}),u.get(`/api/client-portal/clients/${l.id}/projects`,{headers:{Authorization:`Bearer ${e}`}})]);d(t.data.data),m(y(r.data.data)),S(!0),n()}catch(e){console.error(e)}},I=()=>{let e=!s;c(e),e&&P()},L=l.total_budget>0?Math.round(l.total_collected/l.total_budget*100):0,R=O(D(T(r),l.name));return o?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`div`,{className:`CP-main-content`,style:{animation:`CP-panel-in 0.38s cubic-bezier(0.22,1,0.36,1) both`,animationDelay:`80ms`},children:[(0,v.jsxs)(`div`,{className:`CP-main-section-hdr`,children:[(0,v.jsxs)(`div`,{className:`CP-main-section-title`,children:[(0,v.jsx)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})}),`Projects · `,l.name]}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:6},children:[p.length>0&&(0,v.jsxs)(`span`,{className:`CP-main-section-pill`,children:[p.length,` total`]}),(0,v.jsxs)(`button`,{onClick:()=>w(!0),style:{display:`flex`,alignItems:`center`,gap:5,padding:`5px 12px`,background:`linear-gradient(135deg,#2563EB,#3B82F6)`,color:`#fff`,border:`none`,borderRadius:8,fontFamily:`var(--font-mono)`,fontSize:8,fontWeight:800,letterSpacing:1.5,textTransform:`uppercase`,cursor:`pointer`,boxShadow:`0 2px 10px rgba(29,78,216,0.25)`},children:[(0,v.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),(0,v.jsx)(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})]}),`Add Project`]})]})]}),h?[1,2,3].map(e=>(0,v.jsx)(`div`,{className:`CP-skel`,style:{height:76,borderRadius:11,marginBottom:6}},e)):p.length===0?(0,v.jsxs)(`div`,{className:`CP-empty`,children:[(0,v.jsx)(`div`,{className:`CP-empty-ico`,children:(0,v.jsx)(`svg`,{width:22,height:22,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:2,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})})}),(0,v.jsx)(`div`,{className:`CP-empty-ttl`,style:{fontSize:16},children:`No Projects Yet`}),(0,v.jsx)(`div`,{className:`CP-empty-sub`,style:{marginBottom:14},children:`Add the first project to get started`}),(0,v.jsxs)(`button`,{onClick:()=>w(!0),style:{display:`inline-flex`,alignItems:`center`,gap:6,padding:`10px 20px`,background:`linear-gradient(135deg,#2563EB,#3B82F6)`,color:`#fff`,border:`none`,borderRadius:10,fontFamily:`var(--font-mono)`,fontSize:8,fontWeight:800,letterSpacing:2,textTransform:`uppercase`,cursor:`pointer`,boxShadow:`0 4px 16px rgba(29,78,216,0.3)`},children:[(0,v.jsxs)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),(0,v.jsx)(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})]}),`Add First Project`]})]}):p.map((e,t)=>(0,v.jsx)(`div`,{className:`CP-proj-enter`,style:{animationDelay:`${120+t*80}ms`},children:(0,v.jsx)(K,{project:e,seqNum:t+1,clientId:l.id,onRefresh:F,subNames:R,panelCard:!0})},e.id))]}),C&&(0,v.jsx)(W,{clientId:l.id,clientName:l.name,subNames:R,onClose:()=>w(!1),onSaved:()=>{w(!1),S(!1),F()}}),E&&(0,v.jsx)(G,{mode:`edit`,editClient:l,bioRecords:r,existingClientNames:a,namesLoading:!1,onClose:()=>k(!1),onSaved:()=>{k(!1),F(),n()}}),(0,v.jsx)(f,{open:A.open,itemName:A.name,description:A.type===`client`?`This client and ALL projects/payments will be moved to the Recycle Bin.`:`This will be moved to the Recycle Bin.`,onConfirm:M,onCancel:()=>j({open:!1,type:``,id:0,name:``,loading:!1}),loading:A.loading})]}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`div`,{className:`CP-cli-row${s?` open`:``}`,style:{animationDelay:`${t*.04}s`},children:[(0,v.jsx)(`div`,{className:`CP-cli-cell CP-cli-cell-ctr`,children:(0,v.jsx)(`div`,{className:`CP-seq`,children:t})}),(0,v.jsxs)(`div`,{className:`CP-cli-cell`,onClick:I,style:{cursor:`pointer`,gap:0},children:[(0,v.jsx)(`div`,{className:`CP-expand-arrow${s?` open`:``}`,children:(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:3,strokeLinecap:`round`,children:(0,v.jsx)(`polyline`,{points:`9 18 15 12 9 6`})})}),(0,v.jsx)(`div`,{className:`CP-avatar`,children:l.name.charAt(0).toUpperCase()}),(0,v.jsxs)(`div`,{className:`CP-cli-info`,children:[(0,v.jsx)(`div`,{className:`CP-cli-name`,children:l.name}),(0,v.jsxs)(`div`,{className:`CP-cli-id`,children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,style:{verticalAlign:`middle`,marginRight:3},children:[(0,v.jsx)(`rect`,{x:`2`,y:`3`,width:`20`,height:`14`,rx:`2`}),(0,v.jsx)(`line`,{x1:`8`,y1:`21`,x2:`16`,y2:`21`}),(0,v.jsx)(`line`,{x1:`12`,y1:`17`,x2:`12`,y2:`21`})]}),l.id_number||`No ID`]})]})]}),(0,v.jsx)(`div`,{className:`CP-cli-cell CP-cli-cell-ctr`,onClick:e=>e.stopPropagation(),children:(0,v.jsxs)(`span`,{className:`CP-badge CP-badge-proj`,children:[(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})}),l.project_count]})}),(0,v.jsx)(`div`,{className:`CP-cli-cell CP-cli-cell-ctr`,onClick:e=>e.stopPropagation(),children:R.length>0?(0,v.jsxs)(`span`,{className:`CP-badge CP-badge-bio`,children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`path`,{d:`M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2`}),(0,v.jsx)(`circle`,{cx:`12`,cy:`7`,r:`4`})]}),R.length]}):(0,v.jsx)(`span`,{className:`CP-badge`,style:{background:`var(--cr2)`,color:`var(--t4)`,borderColor:`var(--bd)`},children:`—`})}),(0,v.jsx)(`div`,{className:`CP-cli-cell CP-cli-cell-rgt`,onClick:e=>e.stopPropagation(),children:(0,v.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,v.jsx)(`div`,{className:`CP-money CP-money-bgt`,children:b(l.total_budget)}),l.total_additional>0&&(0,v.jsxs)(`div`,{style:{fontFamily:`var(--ff-m)`,fontSize:8,color:`var(--gd,#C47E0A)`,marginTop:1},children:[`+`,b(l.total_additional),` extra`]})]})}),(0,v.jsx)(`div`,{className:`CP-cli-cell CP-cli-cell-rgt`,onClick:e=>e.stopPropagation(),children:(0,v.jsx)(`span`,{className:`CP-money CP-money-col`,children:b(l.total_collected)})}),(0,v.jsx)(`div`,{className:`CP-cli-cell CP-cli-cell-rgt`,onClick:e=>e.stopPropagation(),children:(0,v.jsxs)(`div`,{className:`CP-prog-wrap`,children:[(0,v.jsxs)(`span`,{className:`CP-prog-pct`,children:[L,`%`]}),(0,v.jsx)(`div`,{className:`CP-prog-track`,children:(0,v.jsx)(`div`,{className:`CP-prog-fill`,style:{width:`${L}%`}})})]})}),(0,v.jsxs)(`div`,{className:`CP-cli-cell`,onClick:e=>e.stopPropagation(),style:{gap:6,flexWrap:`wrap`},children:[(0,v.jsx)(`span`,{className:`CP-money CP-money-bal`,children:b(l.total_balance)}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:3,marginLeft:`auto`},children:[(0,v.jsxs)(`button`,{className:`CP-act CP-act-add`,title:`Add project`,onClick:()=>w(!0),children:[(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),(0,v.jsx)(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})]}),`Proj`]}),(0,v.jsx)(`button`,{className:`CP-act CP-act-edit`,title:`Edit`,onClick:()=>k(!0),children:(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`path`,{d:`M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7`}),(0,v.jsx)(`path`,{d:`M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z`})]})}),(0,v.jsx)(`button`,{className:`CP-act CP-act-del`,title:`Delete`,onClick:e=>{e.stopPropagation(),j({open:!0,type:`client`,id:l.id,name:l.name,loading:!1})},children:(0,v.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,v.jsx)(`polyline`,{points:`3 6 5 6 21 6`}),(0,v.jsx)(`path`,{d:`M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2`})]})})]})]})]}),s&&(0,v.jsxs)(`div`,{className:`CP-proj-panel`,children:[(0,v.jsxs)(`div`,{className:`CP-proj-col-head`,children:[(0,v.jsx)(`div`,{style:{justifyContent:`center`},children:`#`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})}),`\xA0Project`]}),(0,v.jsx)(`div`,{style:{justifyContent:`center`},children:`Type`}),(0,v.jsx)(`div`,{style:{justifyContent:`center`},children:`Status`}),(0,v.jsx)(`div`,{style:{justifyContent:`flex-end`},children:`Budget`}),(0,v.jsx)(`div`,{style:{justifyContent:`flex-end`},children:`Collected`}),(0,v.jsx)(`div`,{style:{justifyContent:`flex-end`},children:`Progress`}),(0,v.jsx)(`div`,{style:{justifyContent:`flex-end`},children:`Balance`})]}),h?(0,v.jsxs)(`div`,{style:{padding:`20px 24px 20px 64px`,display:`flex`,alignItems:`center`,gap:10},children:[(0,v.jsx)(`span`,{className:`CP-spinner-or`}),(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:10.5,color:`var(--t4)`},children:`Loading projects…`})]}):p.length===0?(0,v.jsxs)(`div`,{style:{padding:`24px 24px 24px 64px`,display:`flex`,alignItems:`center`,gap:12},children:[(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:10.5,color:`var(--t4)`},children:`No projects yet.`}),(0,v.jsxs)(`button`,{className:`CP-act CP-act-add`,onClick:()=>w(!0),children:[(0,v.jsx)(N,{n:`plus`,s:9}),` Add First Project`]})]}):p.map((e,t)=>(0,v.jsx)(K,{clientId:l.id,project:e,seqNum:t+1,subNames:R,onRefresh:F},e.id)),(0,v.jsx)(`div`,{style:{padding:`12px 24px 12px 64px`,borderTop:`1px solid var(--bd)`,display:`flex`,gap:8},children:(0,v.jsxs)(`button`,{className:`CP-act CP-act-add`,onClick:()=>w(!0),children:[(0,v.jsx)(N,{n:`plus`,s:9}),` Add New Project`]})})]}),C&&(0,v.jsx)(W,{clientId:l.id,clientName:l.name,subNames:R,onClose:()=>w(!1),onSaved:()=>{w(!1),S(!1),F()}}),E&&(0,v.jsx)(G,{mode:`edit`,editClient:l,bioRecords:r,existingClientNames:a,namesLoading:!1,onClose:()=>k(!1),onSaved:()=>{k(!1),F(),n()}}),(0,v.jsx)(f,{open:A.open,itemName:A.name,description:A.type===`client`?`This client and ALL their projects/payments will be moved to the Recycle Bin.`:A.type===`project`?`This project and its payments will be moved to the Recycle Bin.`:`This payment will be moved to the Recycle Bin.`,onConfirm:M,onCancel:()=>j({open:!1,type:``,id:0,name:``,loading:!1}),loading:A.loading})]})}function ee(){let[e,t]=(0,_.useState)([]),[n,a]=(0,_.useState)(null),[o,s]=(0,_.useState)(!0),[c,l]=(0,_.useState)(``),[p,m]=(0,_.useState)(!1),[g,x]=(0,_.useState)([]),[S,C]=(0,_.useState)(!1),[w,T]=(0,_.useState)(null),[E,D]=(0,_.useState)({open:!1,type:`client`,id:0,name:``,loading:!1}),[O,k]=(0,_.useState)(null),A=(0,_.useRef)(null);r(A),(0,_.useEffect)(()=>{j(),P()},[]);let j=async()=>{s(!0);try{let e={headers:{Authorization:`Bearer ${localStorage.getItem(`token`)}`}},[n,r]=await Promise.all([u.get(`client-portal/clients`,e),u.get(`client-portal/summary`,e)]);t(y(n.data.data)),a(r.data.data)}catch(e){console.error(e)}finally{s(!1)}},P=async()=>{C(!0);try{let e=localStorage.getItem(`token`),t=await u.get(`client-portal/bio-data`,{headers:{Authorization:`Bearer ${e}`}}),n=t.data.data||t.data.records||(Array.isArray(t.data)?t.data:[]);n=n.map(e=>({...e,sub_names:Array.isArray(e.sub_names)?e.sub_names.filter(Boolean):e.sub_names?[String(e.sub_names)]:[]})),x(n)}catch(e){console.error(e)}finally{C(!1)}},F=async(e,t)=>{try{let t=localStorage.getItem(`token`);await u.delete(`/api/client-portal/clients/${e}`,{headers:{Authorization:`Bearer ${t}`}}),j()}catch(e){i.error(`Action Failed`,e.response?.data?.message||`Something went wrong.`)}},I=e.filter(e=>e.name.toLowerCase().includes(c.toLowerCase())||(e.id_number||``).includes(c)),L=n?[{icon:`users`,label:`Total Clients`,num:n.total_clients,prefix:``,color:`var(--ember,#2563EB)`,ac:`linear-gradient(180deg,#2563EB 0%,transparent 100%)`,iconBg:`rgba(29,78,216,0.09)`,iconBd:`rgba(29,78,216,0.2)`,foot:`${n.total_projects} active projects`},{icon:`bldg`,label:`Active Projects`,num:n.total_projects,prefix:``,color:`var(--amber,#3B82F6)`,ac:`linear-gradient(180deg,#3B82F6 0%,transparent 100%)`,iconBg:`rgba(59,130,246,0.09)`,iconBd:`rgba(59,130,246,0.2)`,foot:`across all clients`},{icon:`wallet`,label:`Total Budget`,num:n.total_budget,prefix:`₹`,color:`var(--amber,#3B82F6)`,ac:`linear-gradient(180deg,#3B82F6 0%,transparent 100%)`,iconBg:`rgba(59,130,246,0.09)`,iconBd:`rgba(59,130,246,0.2)`,foot:`contracted value`},{icon:`coins`,label:`Amt Collected`,num:n.total_collected,prefix:`₹`,color:`#1E9C6A`,ac:`linear-gradient(180deg,#1E9C6A 0%,transparent 100%)`,iconBg:`rgba(22,163,74,0.09)`,iconBd:`rgba(22,163,74,0.2)`,foot:`${n.collected_pct}% of budget`},{icon:`chart`,label:`Balance Due`,num:n.total_balance,prefix:`₹`,color:`#D93B55`,ac:`linear-gradient(180deg,#D93B55 0%,transparent 100%)`,iconBg:`rgba(220,38,38,0.09)`,iconBd:`rgba(220,38,38,0.2)`,foot:`outstanding amount`}]:[];I.reduce((e,t)=>e+t.total_budget,0),I.reduce((e,t)=>e+t.total_collected,0),I.reduce((e,t)=>e+t.total_additional,0),I.reduce((e,t)=>e+t.total_balance,0);let R=e.map(e=>e.name);return(0,v.jsxs)(`div`,{className:`CP-root`,ref:A,children:[(0,v.jsxs)(`style`,{children:[d,M]}),(0,v.jsx)(h,{containerRef:A,label:`Opening Accounts Receivable…`}),(0,v.jsxs)(`div`,{className:`CP-wrap`,children:[(0,v.jsxs)(`div`,{style:{padding:`32px 40px 0`},children:[(0,v.jsxs)(`div`,{className:`ERP-hdr`,children:[(0,v.jsxs)(`div`,{className:`ERP-hdr-left`,children:[(0,v.jsxs)(`div`,{className:`ERP-eyebrow`,children:[(0,v.jsx)(`span`,{className:`ERP-eyebrow-line`}),(0,v.jsx)(`span`,{className:`ERP-eyebrow-dot`}),`Receivables Management System`]}),(0,v.jsxs)(`h1`,{className:`ERP-title MD-page-title`,children:[`Accounts `,(0,v.jsx)(`span`,{className:`ERP-title-em`,children:`Receivable`})]})]}),(0,v.jsx)(`div`,{className:`ERP-hdr-right`,children:(0,v.jsxs)(`button`,{className:`CP-btn-header-add`,onClick:()=>T({type:`add`}),children:[(0,v.jsx)(`span`,{className:`CP-btn-header-add-ic`,children:(0,v.jsx)(N,{n:`plus`,s:12,c:`#fff`})}),`Add Client`]})})]}),(0,v.jsx)(`div`,{className:`ERP-divider`})]}),o?(0,v.jsx)(`div`,{className:`ERP-stats`,style:{padding:`24px 40px 0`,gridTemplateColumns:`repeat(5,1fr)`},children:[1,2,3,4,5].map(e=>(0,v.jsx)(`div`,{className:`CP-skel`,style:{height:138,borderRadius:16}},e))}):n&&(0,v.jsx)(`div`,{className:`ERP-stats`,style:{gridTemplateColumns:`repeat(5,1fr)`},children:L.map((e,t)=>(0,v.jsxs)(`div`,{className:`ERP-stat`,style:{animationDelay:`${t*.06}s`},children:[(0,v.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:e.ac}}),(0,v.jsx)(`div`,{className:`ERP-stat-label`,children:e.label}),(0,v.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:e.color,fontSize:16,fontWeight:800},children:[e.prefix&&(0,v.jsx)(`span`,{style:{fontFamily:`var(--ff-m)`,fontSize:11.5,color:`var(--t4)`,verticalAlign:`super`,marginRight:2},children:e.prefix}),e.prefix===`₹`?b(e.num).slice(1):String(e.num)]})]},t))}),(0,v.jsxs)(`div`,{className:`CP-layout-body`,children:[(0,v.jsxs)(`div`,{className:`CP-sb`,children:[(0,v.jsxs)(`div`,{className:`CP-sb-hero`,children:[(0,v.jsxs)(`div`,{className:`CP-sb-eyebrow`,children:[(0,v.jsx)(`span`,{className:`CP-sb-dot`}),`Client Registry`]}),(0,v.jsx)(`div`,{className:`CP-sb-title`,children:`Clients`}),(0,v.jsxs)(`div`,{className:`CP-sb-search`,children:[(0,v.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,style:{color:`#2563EB`,flexShrink:0},children:[(0,v.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,v.jsx)(`line`,{x1:`21`,y1:`21`,x2:`16.65`,y2:`16.65`})]}),(0,v.jsx)(`input`,{placeholder:`Search clients…`,value:c,onChange:e=>l(e.target.value)})]})]}),(0,v.jsxs)(`div`,{className:`CP-sb-count`,children:[(0,v.jsxs)(`span`,{className:`CP-sb-count-lbl`,children:[(0,v.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,style:{verticalAlign:`middle`,marginRight:3},children:[(0,v.jsx)(`path`,{d:`M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2`}),(0,v.jsx)(`circle`,{cx:`9`,cy:`7`,r:`4`}),(0,v.jsx)(`path`,{d:`M23 21v-2a4 4 0 00-3-3.87`}),(0,v.jsx)(`path`,{d:`M16 3.13a4 4 0 010 7.75`})]}),`Clients`]}),(0,v.jsx)(`span`,{className:`CP-sb-count-num`,children:I.length})]}),(0,v.jsx)(`div`,{className:`CP-cli-list`,children:o?[1,2,3,4].map(e=>(0,v.jsx)(`div`,{className:`CP-skel`,style:{height:78,margin:`4px 10px`,borderRadius:12}},e)):I.length===0?(0,v.jsxs)(`div`,{className:`CP-empty`,style:{minHeight:200},children:[(0,v.jsx)(`div`,{className:`CP-empty-ico`,children:(0,v.jsxs)(`svg`,{width:22,height:22,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:2,children:[(0,v.jsx)(`path`,{d:`M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2`}),(0,v.jsx)(`circle`,{cx:`9`,cy:`7`,r:`4`})]})}),(0,v.jsx)(`div`,{className:`CP-empty-ttl`,style:{fontSize:14},children:`No clients`}),(0,v.jsx)(`div`,{className:`CP-empty-sub`,children:c?`Try another name`:`Add your first client`})]}):I.map((e,t)=>{let n=e.total_budget>0?Math.round(e.total_collected/e.total_budget*100):0,r=O===e.id;return(0,v.jsxs)(`div`,{className:`CP-clicard${r?` active`:``}${t===0?` CP-clicard-first`:``}`,style:{animationDelay:`${t*60}ms`},onClick:()=>k(r?null:e.id),children:[(0,v.jsx)(`div`,{className:`CP-clicard-accent`}),(0,v.jsxs)(`div`,{className:`CP-clicard-top`,children:[(0,v.jsx)(`div`,{className:`CP-clicard-av`,children:(e.name||`C`).slice(0,2).toUpperCase()}),(0,v.jsxs)(`div`,{className:`CP-clicard-info`,children:[(0,v.jsx)(`div`,{className:`CP-clicard-name`,children:e.name}),(0,v.jsxs)(`div`,{className:`CP-clicard-meta`,children:[(0,v.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,v.jsx)(`path`,{d:`M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z`})}),e.project_count,` proj · `,n,`%`]})]})]}),(0,v.jsxs)(`div`,{className:`CP-clicard-foot`,children:[(0,v.jsx)(`div`,{className:`CP-clicard-bar-wrap`,children:(0,v.jsx)(`div`,{className:`CP-clicard-bar-fill`,style:{width:`${n}%`}})}),(0,v.jsx)(`span`,{className:`CP-clicard-bal ${e.total_balance>0?`red`:`grey`}`,children:b(e.total_balance>0?e.total_balance:e.total_collected)})]}),!r&&(0,v.jsx)(`div`,{className:`CP-clicard-hint`,children:(0,v.jsx)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:3,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,v.jsx)(`polyline`,{points:`9 18 15 12 9 6`})})})]},e.id)})})]}),(0,v.jsx)(`div`,{className:`CP-main-panel`,children:(()=>{let t=e.find(e=>e.id===O);return t?(0,v.jsx)(`div`,{style:{height:`100%`,animation:`CP-panel-in 0.4s cubic-bezier(0.22,1,0.36,1) both`},children:(0,v.jsx)(q,{client:t,seqNum:I.findIndex(e=>e.id===O)+1,onRefresh:j,bioRecords:g,existingClientNames:R,panelMode:!0})},O):(0,v.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`center`,height:`100%`},children:(0,v.jsxs)(`div`,{className:`CP-sb-tap-hint`,style:{opacity:1},children:[(0,v.jsx)(`div`,{className:`CP-sb-tap-icon`,style:{width:64,height:64},children:(0,v.jsx)(N,{n:`users`,s:28,c:`#2563EB`})}),(0,v.jsx)(`div`,{className:`CP-sb-tap-label`,style:{fontSize:9,marginTop:4},children:`Select a client to view details`})]})})})()})]})]}),w&&(0,v.jsx)(G,{mode:w.type===`edit`?`edit`:`add`,editClient:w.type===`edit`?w.client:void 0,bioRecords:g,existingClientNames:R,namesLoading:S,onClose:()=>T(null),onSaved:()=>{T(null),j()}}),(0,v.jsx)(f,{open:E.open,itemName:E.name,description:E.type===`client`?`This client and ALL projects/payments will be moved to the Recycle Bin.`:`This will be moved to the Recycle Bin.`,onConfirm:()=>{let{id:e,name:t}=E;D(e=>({...e,loading:!0})),F(e,t).finally(()=>D({open:!1,type:`client`,id:0,name:``,loading:!1}))},onCancel:()=>D(e=>({...e,open:!1})),loading:E.loading})]})}export{ee as default};