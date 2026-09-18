export const T_CSS = `
:root {
  /* Bridge aliases → ERP design tokens */
  --err: var(--error,#D93B55);
  --purple: #A6491D;
  --t1: var(--text-1,#231C14);
  --t2: var(--text-2,#3A3024);
  --t3: var(--text-3,#524532);
  --t4: var(--text-4,#6B5D48);
  --off: var(--surface,#F2F3F5);
  --surf: var(--surface,#F2F3F5);
  --surf2: rgba(210,199,184,0.22);
  --border2: #C7BCA9;
  --amber: var(--ember-mid,#DB5B1F);
  --display: var(--font-display,'Instrument Serif');
  --body: var(--font-body,'Space Grotesk');
  --mono: var(--font-mono,'JetBrains Mono');
  --r: var(--r-md,10px);
  --rlg: var(--r-lg,16px);
  --rxl: var(--r-xl,22px);
  --sh: var(--sh-card,0 2px 8px rgba(0,0,0,0.05),0 6px 24px rgba(0,0,0,0.04));
  --shh: var(--sh-hover,0 8px 32px rgba(0,0,0,0.09),0 16px 48px rgba(0,0,0,0.06));
  --she: var(--sh-ember,0 4px 18px rgba(194,65,12,0.22));
}
.T *{box-sizing:border-box;margin:0;padding:0;}
.T{font-family:var(--body);background:var(--surf);color:var(--t1);min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;}
.T-main{flex:1;min-width:0;background:var(--surf);}
.T-main{flex:1;min-width:0;background:var(--surf);}
/* ─── Section wrapper ─── */
/* ── Section wrapper ── */
.T-section{animation:T-up .4s cubic-bezier(.22,1,.36,1) both;}
@keyframes T-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes T-upfast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes T-pop{0%{opacity:0;transform:scale(.96) translateY(10px)}60%{transform:scale(1.01)}100%{opacity:1;transform:none}}
@keyframes T-spin{to{transform:rotate(360deg)}}
@keyframes T-shimmer{0%{background-position:-700px 0}100%{background-position:700px 0}}
@keyframes T-rowIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes T-drawer{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@keyframes T-pulse-gentle{0%,100%{box-shadow:0 6px 20px rgba(29,78,216,.28)}50%{box-shadow:0 6px 28px rgba(29,78,216,.48)}}
@keyframes T-ring-pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes T-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes T-glow{0%,100%{box-shadow:0 0 0 0 rgba(29,78,216,0)}50%{box-shadow:0 0 0 6px rgba(29,78,216,0.12)}}
@keyframes T-hdr-reveal{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:none}}
@keyframes T-stat-pop{from{opacity:0;transform:scale(.9) translateY(8px)}to{opacity:1;transform:none}}
@keyframes T-card-in{0%{opacity:0;transform:translateY(24px) scale(.97)}80%{transform:translateY(-2px) scale(1.005)}100%{opacity:1;transform:none}}
@keyframes T-scan{0%{top:-100%}100%{top:100%}}
@keyframes T-border-glow{0%,100%{box-shadow:0 0 0 0 rgba(29,78,216,0),var(--sh)}50%{box-shadow:0 0 0 4px rgba(29,78,216,0.14),var(--shh)}}
@keyframes T-number-tick{from{transform:translateY(6px);opacity:0}to{transform:none;opacity:1}}
@keyframes T-fade-scale{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}
.T-hdr{background:var(--off-white,#F8F8F8);border-bottom:2px solid var(--ember-border);position:relative;z-index:10;animation:T-hdr-reveal .6s cubic-bezier(.22,1,.36,1) both;}
.T-hdr::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--ember),var(--amber),var(--ember-light),var(--amber),var(--ember));background-size:300% 100%;animation:T-shimmer 4s ease infinite;}
/* ── SIMPLE ERP-STYLE HEADER (Report Center) — matches shared SectionHeader pattern ── */
.T-hdr-simple{
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding:20px 36px 18px;background:transparent;
  position:relative;z-index:10;animation:T-hdr-reveal .45s cubic-bezier(.22,1,.36,1) both;
}
.T-hdr-simple-left{display:flex;align-items:center;gap:16px;min-width:0;}
.T-hdr-logo-box{
  width:48px;height:48px;border-radius:14px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.T-hdr-logo-sm{width:100%;height:100%;object-fit:contain;}
.T-hdr-simple-eyebrow{font-family:var(--mono);font-size: 8px;font-weight: 700;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;}
.T-hdr-simple-title{font-family:var(--display);font-size: 23px;font-weight: 600;font-style:italic;color:#1A1A1A;line-height:1.1;}
.T-hdr-simple-title em{font-style:normal;}
.T-hdr-simple-sub{font-family:var(--mono);font-size: 8px;color:#94A3B8;margin-top:3px;letter-spacing:1px;}
.T-hdr-mod-chips{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap;}
.T-hdr-mod-chip{
  font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;
  border-radius:100px;padding:4px 11px;transition:background .18s,color .18s,transform .18s,box-shadow .18s;
  cursor:default;
}
.T-hdr-mod-chip:hover{color:#fff;border-color:transparent!important;transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.18);}
.T-hdr-simple-right{display:flex;align-items:center;gap:12px;flex-shrink:0;flex-wrap:wrap;}
.T-hdr-simple-stat{font-family:var(--mono);font-size: 8px;color:var(--t4);background:var(--ember-ghost);padding:6px 13px;border-radius:100px;border:1px solid var(--ember-border);white-space:nowrap;}
/* ── MODERN COMPACT REFRESH BUTTON ── */
.T-refresh-btn{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  width:34px;height:34px;border-radius:50%;
  background:var(--ember-ghost);border:1.5px solid var(--ember-border);color:var(--ember);
  cursor:pointer;transition:background .2s,border-color .2s,box-shadow .25s,transform .2s;
  position:relative;
}
.T-refresh-btn::after{
  content:'';position:absolute;inset:-4px;border-radius:50%;border:1.5px solid var(--ember-border);
  opacity:0;transform:scale(.8);transition:opacity .25s,transform .25s;
}
.T-refresh-btn:hover:not(:disabled){
  background:linear-gradient(135deg,#60A5FA,#2563EB);border-color:transparent;color:#fff;
  transform:translateY(-2px);box-shadow:0 6px 18px rgba(37,99,235,.35);
}
.T-refresh-btn:hover:not(:disabled) svg{transform:rotate(180deg);}
.T-refresh-btn:hover:not(:disabled)::after{opacity:1;transform:scale(1);}
.T-refresh-btn:active:not(:disabled){transform:translateY(0) scale(.94);}
.T-refresh-btn svg{transition:transform .45s cubic-bezier(.34,1.56,.64,1);}
.T-refresh-btn.spinning{background:linear-gradient(135deg,#60A5FA,#2563EB);border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(37,99,235,.3);}
.T-refresh-btn.spinning svg{animation:T-refresh-spin .7s linear infinite;}
.T-refresh-btn:disabled{cursor:not-allowed;}
@keyframes T-refresh-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.T-stat-card{animation:T-card-in .55s cubic-bezier(.22,1,.36,1) both;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s;}
.T-stat-card:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 12px 36px rgba(0,0,0,.10);}
.T-stat-card::after{content:'';position:absolute;top:-100%;left:0;right:0;height:60%;background:linear-gradient(180deg,rgba(255,255,255,.14),transparent);animation:T-scan 3.5s ease-in-out infinite;pointer-events:none;}
.T-tbl-section{animation:T-fade-scale .4s cubic-bezier(.22,1,.36,1) both;}
.T-tbl-wrap table tbody tr{animation:T-rowIn .28s ease both;}
.T-tbl-wrap table tbody tr:hover{background:var(--ember-ghost)!important;transition:background .15s;}
.T-mod-section{animation:T-up .5s cubic-bezier(.22,1,.36,1) both;}
.T-hdr-top{padding:0 36px;display:flex;align-items:center;min-height:96px;position:relative;overflow:hidden;}
.T-hdr-logo-zone{display:flex;align-items:center;gap:22px;padding:18px 32px 18px 0;border-right:1.5px solid var(--ember-border);}
.T-hdr-logo{width:54px;height:54px;object-fit:contain;border-radius:var(--r);border:2px solid var(--ember-border);box-shadow:var(--she);}
.T-hdr-logo-fallback{width:54px;height:54px;border-radius:var(--r);background:linear-gradient(135deg,var(--ember),var(--amber));display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--mono);font-weight: 800;font-size: 11.5px;letter-spacing:-1px;box-shadow:var(--she);}
.T-hdr-company{padding:20px 0 20px 28px;flex:1;}
.T-hdr-company-name{font-family:var(--display);font-size: 23px;font-style:italic;color:var(--t1);line-height:1.05;margin-bottom:0;}
.T-hdr-company-name em{color:var(--ember);font-style:normal;}
.T-hdr-company-tag{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;color:var(--t3);text-transform:uppercase;margin-bottom:6px;}
.T-hdr-company-details{display:flex;flex-wrap:wrap;gap:14px;margin-top:5px;}
.T-hdr-detail{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size: 8px;color:var(--t3);}
.T-hdr-detail svg{color:var(--ember);flex-shrink:0;}
.T-hdr-right{display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:16px 0 16px 28px;border-left:1px solid var(--border);gap:10px;min-width:210px;}
.T-hdr-gstin{font-family:var(--mono);font-size: 8px;font-weight: 800;color:var(--ember);letter-spacing:1px;background:var(--ember-ghost);border:1.5px solid var(--ember-border);border-radius:var(--r);padding:5px 14px;}
.T-live-badge{display:flex;align-items:center;gap:7px;padding:6px 15px;border-radius:99px;background:var(--success-bg,rgba(30,156,106,0.10));border:1px solid var(--success-bd,rgba(30,156,106,0.28));font-family:var(--mono);font-size: 8px;font-weight: 800;color:var(--success,#1E9C6A);letter-spacing:2px;}
.T-live-dot{width:6px;height:6px;border-radius:50%;background:var(--success,#1E9C6A);animation:T-glow 2s ease-in-out infinite;}
.T-hdr-bottom{background:linear-gradient(135deg,var(--surface,#F2F3F5),var(--off-white,#F8F8F8));border-top:1px solid var(--border);padding:16px 36px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.T-report-title-zone{display:flex;align-items:center;gap:16px;}
.T-report-badge{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;color:var(--ember);text-transform:uppercase;background:var(--ember-ghost);border:1.5px solid var(--ember-border);border-radius:var(--r);padding:4px 12px;}
.T-report-title{font-family:var(--display);font-size: 26.5px;font-style:italic;color:var(--t1);letter-spacing:-.5px;}
.T-report-title em{color:var(--ember);}
.T-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:var(--r);font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border:none;transition:all .18s;}
.T-btn.outline{background:var(--off-white,#F8F8F8);color:var(--t3);border:1.5px solid var(--border);}
.T-btn.outline:hover{border-color:var(--ember-border);color:var(--ember);background:var(--ember-ghost);transform:translateY(-1px);}
.T-btn.primary{background:linear-gradient(135deg,var(--amber),var(--ember));color:#fff;box-shadow:var(--she);}
.T-btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(29,78,216,.30);}
.T-btn.danger{background:var(--error-bg,rgba(217,59,85,0.10));color:var(--error,#D93B55);border:1.5px solid var(--error-bd,rgba(217,59,85,0.26));}
.T-btn.sm{padding:6px 12px;font-size: 8px;}
.T-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}
.T-logout-btn{display:none}
/* ── TDrop premium dropdown ── */
@keyframes TD-open{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}
.TD-wrap{position:relative;isolation:isolate;}
.TD-wrap[data-open=true]{z-index:9998;}
/* Field labels were removed above the dropdowns — the trigger text now
   carries that job on its own, so it needs to read clearly at a glance:
   bolder weight, slightly larger, on all 4 report pages. */
.TD-trigger{display:flex;align-items:center;gap:8px;padding:9px 14px;border:1.5px solid #E2E8F0;border-radius:10px;background:#F8FAFC;cursor:pointer;font-family:var(--body);font-size: 11px;font-weight: 700;color:var(--t1);user-select:none;transition:border-color .18s,box-shadow .18s,background .18s;white-space:nowrap;min-height:42px;}
.TD-trigger:hover{border-color:rgba(29,78,216,0.40);background:#fff;}
.TD-wrap[data-open=true] .TD-trigger{border-color:var(--ember);background:#fff;box-shadow:0 0 0 3px rgba(29,78,216,0.10);}
.TD-val{flex:1;color:var(--t1);font-weight: 800;}
.TD-ph{flex:1;color:var(--t3);font-weight: 800;}
.TD-x{display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:rgba(29,78,216,0.10);border:none;cursor:pointer;color:var(--ember);padding:0;flex-shrink:0;transition:background .15s;}
.TD-x:hover{background:rgba(29,78,216,0.22);}
.TD-caret{flex-shrink:0;color:#B0A098;transition:transform .22s,color .18s;}
.TD-wrap[data-open=true] .TD-caret{transform:rotate(180deg);color:var(--ember);}
/* Compact dropdown sizing — scoped to the Credit Management filter panel only */
.T-cr-compact .TD-wrap{min-width:130px !important;}
.T-cr-compact .TD-trigger{padding:6px 10px !important;min-height:32px !important;gap:6px !important;font-size: 9px !important;border-radius:8px !important;}
.T-cr-compact .TD-val,.T-cr-compact .TD-ph{font-size: 9px !important;}
.T-cr-compact .TD-caret{width:9px !important;height:9px !important;}
.T-cr-compact .TD-x{width:15px !important;height:15px !important;}
.T-cr-compact .T-date-range{border-radius:8px !important;}
.T-cr-compact .T-date-field{padding:6px 10px !important;gap:6px !important;}
.T-cr-compact .T-date-field svg{width:11px !important;height:11px !important;}
.T-cr-compact .T-cal-val{font-size: 9px !important;}
.T-cr-compact .T-date-sep{margin:0 2px !important;}
.T-cr-compact .T-date-arrow{padding:0 4px !important;font-size: 9px !important;}
.T-cr-compact .T-date-clear{width:20px !important;height:20px !important;margin:0 4px !important;}
/* ── Dropdown panel: always opens downward (see MultiSelectDD/SearchDD
   reposition logic), single thin light-grey scrollbar, tidy row structure. ── */
.TD-menu{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 28px rgba(15,23,42,0.12);overflow:hidden;animation:TD-open .18s cubic-bezier(.22,.68,0,1.2) both;transform-origin:top center;display:flex;flex-direction:column;}
.TD-search{display:flex;align-items:center;gap:9px;padding:11px 14px;border-bottom:1px solid var(--border);background:var(--off-white,#F8FAFC);color:var(--t4);flex-shrink:0;}
.TD-search-inp{flex:1;border:none;outline:none;background:transparent;font-family:var(--body);font-size: 10.5px;color:var(--t1);}
.TD-search-inp::placeholder{color:#C4B4A8;}
.TD-search-clear{display:flex;align-items:center;border:none;background:rgba(0,0,0,0.06);border-radius:50%;width:18px;height:18px;cursor:pointer;color:var(--t4);padding:0;justify-content:center;transition:background .15s,color .15s;flex-shrink:0;}
.TD-search-clear:hover{background:rgba(29,78,216,0.14);color:var(--ember);}
.TD-list{max-height:200px;overflow-y:auto;overscroll-behavior:contain;padding:5px;scrollbar-width:thin;scrollbar-color:#D6CEC5 transparent;}
.TD-list::-webkit-scrollbar{width:5px;}
.TD-list::-webkit-scrollbar-track{background:transparent;}
.TD-list::-webkit-scrollbar-thumb{background:#D6CEC5;border-radius:99px;}
.TD-list::-webkit-scrollbar-thumb:hover{background:#C2B7AC;}
/* Rows sit on a shared 5px inset with rounded corners — a clean "pill row"
   list instead of full-bleed dividers, so selection/hover reads clearly. */
.TD-opt{height:38px;padding:0 12px;box-sizing:border-box;font-family:var(--body);font-size: 10.5px;color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;border-radius:8px;transition:background .12s,color .12s;flex-shrink:0;}
.TD-opt:hover{background:var(--ember-ghost,rgba(59,130,246,0.08));color:var(--ember);}
.TD-opt.sel{background:rgba(29,78,216,0.08);color:var(--ember);font-weight: 700;}
.TD-opt-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.TD-check{color:var(--ember);flex-shrink:0;}
.TD-empty{padding:22px 16px;text-align:center;font-family:var(--mono);font-size: 9px;color:var(--t4);letter-spacing:.5px;}
.TD-footer{padding:9px 14px;border-top:1px solid var(--border);background:var(--off-white,#F8FAFC);font-family:var(--mono);font-size: 8px;color:var(--t4);letter-spacing:1px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.TD-bulk{display:flex;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border);background:var(--off-white,#F8FAFC);gap:0;flex-shrink:0;}
.TD-bulk-btn{flex:1;padding:5px 0;border:none;background:none;font-family:var(--mono);font-size: 8px;font-weight: 800;cursor:pointer;letter-spacing:.5px;text-transform:uppercase;color:var(--t4);transition:color .15s;}
.TD-bulk-btn:hover{color:var(--ember);}
.TD-bulk-clear:hover{color:var(--err) !important;}
.TD-bulk-sep{width:1px;height:16px;background:var(--border);flex-shrink:0;margin:0 4px;}
.TD-opt-check{align-items:center;gap:10px;}
.TD-checkbox{width:14px;height:14px;border-radius:4px;border:1.5px solid #C8B8AF;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .15s,background .15s;}
.TD-opt-sub{font-size: 9px;color:var(--t4);margin-left:auto;flex-shrink:0;}
.TD-count{font-size: 8px;background:rgba(29,78,216,0.09);padding:2px 7px;border-radius:99px;font-weight: 800;color:var(--ember);flex-shrink:0;}
.TD-footer-clear{font-family:var(--mono);font-size: 8px;font-weight: 800;color:var(--ember);background:none;border:none;cursor:pointer;padding:0;letter-spacing:.5px;transition:opacity .15s;}
.TD-footer-clear:hover{opacity:.7;}
/* ── premium text inputs ── */
.T-filter-inp{padding:9px 14px 9px 38px;border:1.5px solid #E2E8F0;border-radius:10px;background:#F8FAFC;color:var(--t1);font-size: 10.5px;font-family:var(--body);font-weight: 700;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;min-width:200px;min-height:40px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C4B4A8' stroke-width='2.2'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M21 21l-4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:12px center;}
.T-filter-inp:hover{border-color:rgba(29,78,216,0.35);background:#fff;}
.T-filter-inp:focus{border-color:var(--ember);background:#fff;box-shadow:0 0 0 3px rgba(29,78,216,0.10);}
.T-filter-inp::placeholder{color:#C4B4A8;}
.T-date-inp{padding:9px 14px;border:1.5px solid #E2E8F0;border-radius:10px;background:#F8FAFC;color:var(--t1);font-family:var(--body);font-size: 10.5px;font-weight: 700;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;min-height:40px;}
.T-date-inp:hover{border-color:rgba(29,78,216,0.35);background:#fff;}
.T-date-inp:focus{border-color:var(--ember);background:#fff;box-shadow:0 0 0 3px rgba(29,78,216,0.10);}
/* ── typography upgrades ── */
.T-tbl tbody td{padding:12px 16px;vertical-align:middle;font-family:var(--body);font-size: 10.5px;font-weight: 700;color:var(--t1);}
.T-tbl thead th{padding:12px 16px;text-align:left;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;text-transform:uppercase;color:var(--t3);background:var(--surface-2);border-bottom:2px solid var(--ember);position:sticky;top:0;z-index:2;}
.T-stat-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;text-transform:uppercase;color:var(--t4);margin-bottom:8px;}
.T-stat-val{font-family:var(--display);font-size: 24.5px;font-style:italic;line-height:1;animation:T-stat-pop .5s cubic-bezier(.22,1,.36,1) both;}
.T-card-title{font-family:var(--display);font-size: 17.5px;font-weight: 800;font-style:normal;letter-spacing:.1px;color:var(--t1);}
.T-filter-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;color:var(--t3);text-transform:uppercase;}
.T-ctrl-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;color:var(--t4);text-transform:uppercase;}
.T-hdr-company-name{font-family:var(--display);font-size: 24.5px;font-style:italic;color:var(--t1);line-height:1.05;margin-bottom:0;}
.T-report-title{font-family:var(--display);font-size: 28px;font-style:italic;color:var(--t1);letter-spacing:-.5px;}
.T-section-title{font-family:var(--display);font-size: 19.5px;font-style:italic;color:var(--t1);}
.T-pdf-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:var(--r);font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border:1.5px solid var(--ember-border);transition:all .18s;background:linear-gradient(135deg,var(--amber),var(--ember));color:#fff;box-shadow:0 3px 12px rgba(29,78,216,.22);}
.T-pdf-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 22px rgba(29,78,216,.35);}
.T-pdf-btn:disabled{cursor:not-allowed;transform:none!important;background:var(--off-white,#F1F1F1);color:var(--text-4,#94A3B8);border-color:var(--border);box-shadow:none;opacity:1;}
.T-colbtn{display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border-radius:var(--r);font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border:1.5px solid var(--border);background:var(--off-white,#F8F8F8);color:var(--t3);transition:all .18s;}
.T-colbtn:hover,.T-colbtn[data-open=true]{border-color:var(--ember-border);color:var(--ember);background:var(--ember-ghost);}
.T-colbtn-badge{background:var(--ember-ghost);color:var(--ember);border-radius:99px;padding:1px 6px;font-size: 8px;font-weight: 800;}
.T-coldrop{background:var(--off-white,#F8F8F8);border:1.5px solid var(--ember-border);border-radius:var(--rlg);box-shadow:0 12px 40px rgba(0,0,0,.11);min-width:220px;overflow:hidden;animation:T-upfast .15s ease both;}
.T-coldrop-head{padding:10px 14px;background:var(--ember-ghost);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2px;color:var(--ember);text-transform:uppercase;}
.T-coldrop-action{font-family:var(--mono);font-size: 8px;font-weight: 800;background:none;border:none;cursor:pointer;}
.T-coldrop-action.success{color:var(--success,#1E9C6A);}
.T-coldrop-action.danger{color:var(--error,#D93B55);}
.T-coldrop-list{max-height:190px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#3B82F6 rgba(203,213,225,.15);}
.T-coldrop-list::-webkit-scrollbar{width:3px;}
.T-coldrop-list::-webkit-scrollbar-track{background:rgba(203,213,225,.12);border-radius:99px;}
.T-coldrop-list::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#60A5FA 0%,#3B82F6 45%,#2563EB 100%);border-radius:99px;}
.T-coldrop-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);font-size: 9.5px;transition:background .14s ease;color:var(--ember,#2563EB);}
.T-coldrop-item:hover{background:var(--ember-ghost);}
.T-coldrop-item input{accentColor:var(--ember);width:14px;height:14px;flex-shrink:0;}
.T-coldrop-item span{color:var(--ember,#2563EB);}

/* ── CREDIT REPORT: premium ember Columns button + dropdown (scoped) ── */
.T-colbtn-cr{background:linear-gradient(135deg,var(--ember),var(--ember-mid));color:#fff;border:none;box-shadow:0 3px 10px rgba(29,78,216,.25);}
.T-colbtn-cr:hover,.T-colbtn-cr[data-open=true]{background:linear-gradient(135deg,var(--ember-mid),var(--ember));color:#fff;border:none;box-shadow:0 5px 14px rgba(29,78,216,.34);transform:translateY(-1px);}
.T-colbtn-cr .T-colbtn-badge{background:rgba(255,255,255,.24);color:#fff;}
.T-coldrop-cr{position:relative;border-color:var(--ember-border);box-shadow:0 16px 44px rgba(29,78,216,.16);}
.T-coldrop-cr::before{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;background:linear-gradient(90deg,var(--ember),var(--amber),var(--ember-light),var(--amber),var(--ember));background-size:300% 100%;animation:T-shimmer 4s ease infinite;}
.T-coldrop-cr .T-coldrop-head{background:linear-gradient(135deg,var(--ember),var(--ember-mid));color:#fff;}
.T-coldrop-cr .T-coldrop-action.success{color:#fff;text-decoration:underline;text-underline-offset:2px;}
.T-coldrop-cr .T-coldrop-action.danger{color:rgba(255,255,255,.85);text-decoration:underline;text-underline-offset:2px;}
.T-coldrop-cr .T-coldrop-item:hover{background:var(--ember-ghost);}
.T-fixed-tag{font-size: 7.5px;color:var(--t4);font-family:var(--mono);margin-left:auto;}
.T-ctrl{padding:14px 36px;background:var(--off-white,#F8F8F8);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap;position:relative;z-index:5;}
.T-ctrl-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2px;color:var(--t4);text-transform:uppercase;}
.T-date-inp{padding:7px 12px;border:1.5px solid var(--border);border-radius:var(--r);background:#fff;color:var(--t1);font-family:var(--body);font-size: 9.5px;font-weight: 700;outline:none;transition:all .18s;}
.T-date-inp:focus{border-color:var(--ember);box-shadow:0 0 0 3px var(--ember-ghost);}
.T-select{padding:7px 32px 7px 12px;border:1.5px solid var(--border);border-radius:var(--r);background:#fff;color:var(--t1);font-family:var(--body);font-size: 9.5px;font-weight: 700;outline:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6B6B' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;cursor:pointer;transition:all .18s;}
.T-select:focus{border-color:var(--ember);box-shadow:0 0 0 3px var(--ember-ghost);}
.T-stat-strip{display:flex;border-bottom:1px solid var(--border);background:var(--off);}
.T-stat-cell{flex:1;padding:18px 22px;border-right:1px solid var(--border);transition:all .2s;position:relative;overflow:hidden;}
.T-stat-cell::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--ember-border),transparent);transform:scaleX(0);transition:transform .3s;transform-origin:center;}
.T-stat-cell:hover::before{transform:scaleX(1);}
.T-stat-cell:last-child{border-right:none;}
.T-stat-cell:hover{background:#fff;}
.T-stat-lbl{font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:2px;text-transform:uppercase;color:var(--t4);margin-bottom:7px;}
.T-stat-val{font-family:var(--mono);font-size: 16px;font-weight: 800;font-style:normal;letter-spacing:-.2px;line-height:1;animation:T-stat-pop .5s cubic-bezier(.22,1,.36,1) both;}

/* ── MODE-BREAKDOWN STAT CARDS (matches Cash Book Create Entry page) ── */
.T-mode-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:24px 36px 8px;position:relative;z-index:1;}
@media(max-width:900px){.T-mode-stats{grid-template-columns:1fr;}}
/* Force true white cards — the shared --white token is remapped to off-white elsewhere on this page.
   Also restore ERPTheme's own padding/margins: this page's ".T *{margin:0;padding:0}" reset (below)
   strips them from reused ERP-stat classes since it loads after ERPTheme's rules. */
.T-mode-stats .ERP-stat{background:#fff;border-color:var(--border,#E5E5E5);padding:12px 13px 10px;}
.T-mode-stats .ERP-stat-icon{margin-bottom:8px;}
.T-mode-stats .ERP-stat-label{margin-bottom:4px;}
.T-mode-stat-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:100px;font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;background:var(--off-white,#F8F8F8);color:var(--t4);border:1px solid var(--border);margin-top:4px;}
.T-mode-pay-breakdown{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:5px;width:100%;}
.T-mode-pay-row{display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size: 8px;}
.T-mode-pay-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* Cash/Bank-Holding breakdown chips — same concept + same class names as
   the Daybook create page's .DB-stat-chip-* and the Daybook Transactions
   page, so all three Cash Book screens render identically. */
@keyframes db-hold-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-4deg); } }
.DB-stat-breakdown { display: flex; gap: 7px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); width: 100%; }
.DB-stat-chip { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 8px; border: 1px solid; }
.DB-stat-chip.cash { background: rgba(30,156,106,0.07); border-color: rgba(30,156,106,0.24); }
.DB-stat-chip.bank { background: rgba(8,145,178,0.07); border-color: rgba(8,145,178,0.24); }
.DB-stat-chip-icon { width: 18px; height: 18px; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; animation: db-hold-float 2.8s ease-in-out infinite; }
.DB-stat-chip.cash .DB-stat-chip-icon { background: rgba(30,156,106,0.16); }
.DB-stat-chip.bank .DB-stat-chip-icon { background: rgba(8,145,178,0.16); animation-delay: .35s; }
.DB-stat-chip-icon svg { width: 9px; height: 9px; }
.DB-stat-chip-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.DB-stat-chip-label { font-family: var(--mono); font-size: 6.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--t4); }
.DB-stat-chip-val { font-family: var(--mono); font-size: 10.5px; font-weight: 800; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 480px) { .DB-stat-chip-label { font-size: 6px; } .DB-stat-chip-val { font-size: 9px; } }
@media (prefers-reduced-motion: reduce) { .DB-stat-chip-icon { animation: none; } }

/* ── MODE COLUMN ICON — replaces the spelled-out Mode Pill in the Cash
   Book / client-debit tables' narrow Mode column with a small realistic
   per-mode icon badge instead of text. ── */
.DB-mode-icon { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 7px; border: 1px solid; flex-shrink: 0; transition: transform .18s cubic-bezier(.34,1.56,.64,1); }
.DB-mode-icon:hover { transform: translateY(-1px) scale(1.08) rotate(-4deg); }

/* ── CREDIT REPORT: compact, bold, centered, monochrome stat cards (scoped — Cash Book/Client/Manpower stat cards untouched) ── */
.T-mode-stats-cr{gap:8px;padding:14px 22px 4px;}
.T-mode-stats-cr .ERP-stat{padding:8px 10px 8px;display:flex;flex-direction:column;align-items:center;text-align:center;transition:transform .16s ease,box-shadow .16s ease;}
.T-mode-stats-cr .ERP-stat:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.08);}
.T-mode-stats-cr .ERP-stat-icon{width:26px;height:26px;margin:0 auto 5px;}
.T-mode-stats-cr .ERP-stat-icon svg{width:13px;height:13px;}
.T-mode-stats-cr .ERP-stat-label{margin-bottom:2px;font-size: 8px;font-weight: 800;text-align:center;color:var(--t3);}
.T-mode-stats-cr .ERP-stat-val{font-size: 13.5px!important;font-weight: 800!important;text-align:center;letter-spacing:-.2px;color:var(--t1)!important;}
.T-mode-stats-cr .T-mode-stat-badge{margin:4px auto 0;font-size: 6.5px;padding:1px 7px;}
.T-mode-stats-cr .T-mode-pay-breakdown{margin-top:6px;padding-top:6px;align-items:center;}
.T-mode-stats-cr .T-mode-pay-row{justify-content:center;font-size: 8px;}
.T-mode-stats-cr .T-mode-pay-mode{font-size: 7px;}
.T-mode-stats-cr .T-mode-pay-amt{font-size: 8px;color:var(--t1);}
@media(max-width:900px){.T-mode-stats-cr{grid-template-columns:1fr 1fr;}}
@media(max-width:560px){.T-mode-stats-cr{grid-template-columns:1fr;}}
.T-mode-pay-mode{flex:1;color:var(--t4);font-weight: 700;letter-spacing:.5px;text-transform:uppercase;font-size: 8px;}
.T-mode-pay-amt{font-weight: 800;color:var(--t2,#333);font-size: 8.5px;}
.T-filter{display:flex;align-items:center;gap:10px;padding:12px 22px;background:var(--surf);border-bottom:1px solid var(--border);flex-wrap:wrap;}
.T-filter-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2px;color:var(--t4);text-transform:uppercase;}

/* ── MODERN DATE-RANGE BAR (first-priority filter) ── */
.T-date-bar{display:flex;align-items:center;gap:14px;padding:14px 22px;background:linear-gradient(135deg,#fff,var(--off-white,#F8F8F8));border-bottom:1px solid var(--border);flex-wrap:wrap;}
.T-date-bar-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2px;color:var(--ember);text-transform:uppercase;display:flex;align-items:center;gap:5px;white-space:nowrap;}
.T-date-range{display:flex;align-items:center;background:#fff;border:1.5px solid var(--border);border-radius:var(--r,10px);overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);transition:border-color .2s,box-shadow .2s,transform .2s;animation:T-date-pop .4s cubic-bezier(.22,1,.36,1) both;}
.T-date-range:hover{box-shadow:0 4px 14px rgba(0,0,0,.08);}
.T-date-range:focus-within{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.T-date-field{display:flex;align-items:center;gap:8px;padding:9px 14px;position:relative;}
.T-date-field svg{color:var(--ember);flex-shrink:0;transition:transform .2s;}
.T-date-field:hover svg{transform:scale(1.12);}
.T-date-field input[type=date]{border:none;outline:none;background:transparent;font-family:var(--mono);font-size: 9.5px;font-weight: 700;color:var(--t1);cursor:pointer;}
/* Shared CalendarDD (ERP-cal-field) dropped inside a .T-date-range pill —
   strip its standalone border/background so it blends seamlessly into the
   pill exactly like the old page-local .T-date-field used to. */
.T-date-range .ERP-cal-field{border:none;background:transparent;padding:9px 14px;min-height:0;border-radius:0;gap:8px;}
.T-date-range .ERP-cal-field:hover{background:transparent;border-color:transparent;}
.T-date-range .ERP-cal-field svg{color:var(--ember);}
.T-date-range .ERP-cal-val{font-size: 9.5px;}
.T-cr-compact .T-date-range .ERP-cal-field{padding:6px 10px !important;gap:6px !important;}
.T-cr-compact .T-date-range .ERP-cal-field svg{width:11px !important;height:11px !important;}
.T-cr-compact .T-date-range .ERP-cal-val{font-size: 9px !important;}
.T-date-sep{width:1px;height:22px;background:var(--border);flex-shrink:0;}
.T-date-arrow{color:var(--t4);display:flex;align-items:center;padding:0 8px;font-size: 9.5px;}
.T-date-clear{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;border:none;background:transparent;color:var(--t4);cursor:pointer;margin:0 8px;transition:background .18s,color .18s,transform .3s;flex-shrink:0;}
.T-date-clear:hover{background:var(--err);color:#fff;transform:rotate(90deg);}
/* Report table only reloads/refilters once both dates are picked AND this
   is clicked — appears the instant a draft date differs from the applied
   one, so it's obvious a click is still needed. */
.T-date-apply{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;margin-left:8px;border-radius:100px;border:none;background:linear-gradient(135deg,var(--amber),var(--ember));color:#fff;font-family:var(--mono);font-size: 8.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;box-shadow:0 3px 10px rgba(37,99,235,.32);transition:transform .18s,box-shadow .18s;animation:T-date-pop .22s cubic-bezier(.22,1.4,.36,1) both;flex-shrink:0;}
.T-date-apply:hover{transform:translateY(-1px) scale(1.04);box-shadow:0 5px 16px rgba(37,99,235,.42);}
.T-date-apply:active{transform:translateY(0) scale(.96);}
@keyframes T-date-pop{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:none}}

/* ── MODERN FILTER PANEL (Cash Book Report) ── */
.T-filterpanel{padding:20px 22px 18px;background:linear-gradient(135deg,#fff 0%,var(--off-white,#F8F8F8) 100%);border-bottom:1px solid var(--border);position:relative;overflow:hidden;animation:T-fade-scale .4s cubic-bezier(.22,1,.36,1) both;}
.T-filterpanel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--ember),var(--amber),transparent 75%);}
.T-filterpanel-hd{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2.5px;color:var(--ember);text-transform:uppercase;}
.T-filterpanel-hd svg{animation:T-filt-pulse 2.4s ease-in-out infinite;flex-shrink:0;}
@keyframes T-filt-pulse{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.15) rotate(-6deg)}}
/* Fixed 4-column layout across every report page (Cash Book, Credit, Manpower, Client Portal) —
   fields wrap into a clean 2nd row once a page has more than 4 filters, instead of each page
   reflowing to a different column count via auto-fit. Narrows on smaller screens so fields
   (min 200px wide inside MultiSelectDD/TDrop) never get squeezed below their usable width. */
.T-ffield-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:14px;margin-bottom:14px;}
@media(max-width:1180px){.T-ffield-grid{grid-template-columns:repeat(3,minmax(150px,1fr));}}
@media(max-width:820px){.T-ffield-grid{grid-template-columns:repeat(2,minmax(150px,1fr));}}
@media(max-width:520px){.T-ffield-grid{grid-template-columns:1fr;}}
.T-ffield{display:flex;flex-direction:column;gap:7px;animation:T-ffield-in .45s cubic-bezier(.22,1,.36,1) both;}
.T-ffield:nth-child(1){animation-delay:.03s}
.T-ffield:nth-child(2){animation-delay:.07s}
.T-ffield:nth-child(3){animation-delay:.11s}
.T-ffield:nth-child(4){animation-delay:.15s}
.T-ffield:nth-child(5){animation-delay:.19s}
@keyframes T-ffield-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.T-ffield-lbl{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--t4);transition:color .18s;}
.T-ffield-lbl svg{color:var(--ember);flex-shrink:0;}
.T-ffield:hover .T-ffield-lbl{color:var(--t2);}
.T-fsearch{display:flex;align-items:center;gap:9px;background:#fff;border:1.5px solid var(--border);border-radius:100px;padding:10px 18px;max-width:420px;transition:border-color .2s,box-shadow .2s,transform .2s;}
.T-fsearch:focus-within{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);transform:translateY(-1px);}
.T-fsearch svg{color:var(--t4);flex-shrink:0;}
.T-fsearch input{border:none;outline:none;background:transparent;font-family:var(--body);font-size: 10px;color:var(--t1);width:100%;}
.T-fsearch input::placeholder{color:var(--t4);font-style:italic;}
.T-fclear-btn{display:inline-flex;align-items:center;gap:6px;margin-left:auto;padding:5px 13px;border-radius:100px;border:1.5px solid var(--ember-border);background:var(--ember-ghost);color:var(--ember);font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:background .18s cubic-bezier(.34,1.56,.64,1),transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s;white-space:nowrap;}
.T-fclear-btn:hover{background:var(--ember);color:#fff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(29,78,216,.28);}
.T-fclear-btn:active{transform:translateY(0) scale(.95);}
.T-fchain-hint{font-family:var(--body);font-size: 9px;font-weight: 700;letter-spacing:0;text-transform:none;color:var(--t4);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
@media(max-width:900px){.T-fchain-hint{display:none;}}

/* ── Include Other Sources — two compact iOS-style toggle switches
   (Manpower Management / Credit Management), same ember theme as the rest
   of the filter panel. A slim sliding-knob track reads as a distinct,
   more attractive control than a plain checkbox, and stays compact
   enough that both fit comfortably side by side in one field cell. ── */
.T-source-toggles{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:16px;min-height:32px;}
.T-source-cb{position:relative;display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;white-space:nowrap;font-size: 9px;font-weight: 700;letter-spacing:.1px;color:var(--t3);transition:color .15s ease;}
.T-source-cb:hover{color:var(--ember);}
.T-source-cb input{position:absolute;opacity:0;width:0;height:0;}
.T-source-cb-box{position:relative;display:block;width:30px;height:17px;flex-shrink:0;border-radius:99px;background:var(--border2,#C0C1C5);box-shadow:inset 0 1px 2px rgba(0,0,0,.12);transition:background .22s ease;}
.T-source-cb-box svg{display:none;}
.T-source-cb-box::after{content:'';position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.28);transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
.T-source-cb input:checked + .T-source-cb-box{background:linear-gradient(135deg,var(--ember-mid),var(--ember));box-shadow:inset 0 1px 2px rgba(0,0,0,.08),0 0 0 3px var(--ember-ghost);}
.T-source-cb input:checked + .T-source-cb-box::after{transform:translateX(13px);}
.T-source-cb:has(input:checked){color:var(--ember);}
.T-source-cb:hover .T-source-cb-box{box-shadow:inset 0 1px 2px rgba(0,0,0,.12),0 0 0 3px var(--ember-ghost);}
.T-source-cb input:focus-visible + .T-source-cb-box{box-shadow:inset 0 1px 2px rgba(0,0,0,.12),0 0 0 3px var(--ember-ghost);}

/* ── Action rail (Filter + Reset) — compact icon+word pill buttons, same
   ember theme as the rest of the app, with a spring-easing hover lift and
   press-scale (matching the polish pass applied elsewhere this session)
   instead of the previous flat/static, icon-only, oversized (42px) pair.
   Forced into the grid's last column so it sits directly under whichever
   field lands there. ── */
.T-actions-col{display:flex;flex-direction:column;gap:7px;align-items:flex-end;justify-content:flex-start;grid-column:-2/-1;}
.T-actions-row{display:flex;flex-direction:row;align-items:center;gap:8px;justify-content:flex-end;width:100%;}
.T-stack-btn{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;flex-shrink:0;height:32px;padding:0 15px;border-radius:999px;border:1.5px solid transparent;cursor:pointer;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease,background .18s ease,color .18s ease;}
.T-stack-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}
.T-stack-btn:active:not(:disabled){transform:translateY(0) scale(.95);}
.T-stack-search{background:var(--ember);color:#fff;box-shadow:0 3px 10px rgba(29,78,216,.22);}
.T-stack-search:hover:not(:disabled){background:var(--ember-mid,#3B82F6);transform:translateY(-1px);box-shadow:0 5px 16px rgba(29,78,216,.34);}
.T-stack-reset{background:var(--ember-ghost);color:var(--ember);border-color:var(--ember-border);box-shadow:none;}
.T-stack-reset:hover:not(:disabled){background:var(--ember);color:#fff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(29,78,216,.26);}
.T-stack-reset:hover:not(:disabled) svg{transform:rotate(-90deg);}
.T-stack-reset svg{transition:transform .3s ease;}

/* ── Professional statement table (Cash Book Report) — full grid borders on
   every cell, solid orange header, bold upright (non-italic) CR/DR amounts
   in their own columns, orange client-name accent. ── */
.T-tbl-pro{border:1px solid var(--border);}
.T-tbl-pro thead tr{background:var(--surface-2);border-bottom:2px solid var(--ember);}
.T-tbl-pro thead th{color:var(--t3);background:transparent;border-right:1px solid var(--border);font-weight: 800;}
.T-tbl-pro thead th:last-child{border-right:none;}
.T-tbl-pro tbody td{border-right:1px solid var(--border);border-bottom:1px solid var(--border);}
.T-tbl-pro tbody td:last-child{border-right:none;}
.T-tbl-pro tbody tr:nth-child(even){background:var(--off-white,#F8FAFC);}
.T-tbl-pro tbody tr:hover{background:var(--ember-ghost)!important;}
.T-tbl-client{font-size: 10px;font-weight: 800;color:var(--ember);white-space:normal;word-break:break-word;}
.T-tbl-amt{font-family:var(--mono);font-size: 10.5px;font-weight: 800;font-style:normal;white-space:nowrap;}
.T-tbl-amt.cr{color:var(--success);}
.T-tbl-amt.dr{color:var(--err);}
/* Used by the "All debit activity for [Client]" table — every row there is
   already known to be a debit, so a red alarm color per-row adds nothing;
   plain dark/black reads calmer and more professional for a single-purpose
   amount column (the bold red Total in the footer still stands out fine). */
.T-tbl-amt.neutral{color:var(--t1);}
.T-tbl-null{color:var(--t4);}
.T-tbl-subname{font-size: 9.5px;font-weight: 700;color:var(--t2);}
.T-status-pill{display:inline-block;font-family:var(--mono);font-size: 7px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:100px;white-space:nowrap;}
.T-status-pill.settled{background:rgba(30,156,106,.12);color:var(--success);}
.T-status-pill.due{background:rgba(217,59,85,.12);color:var(--err);}
.T-status-pill.partial{background:rgba(196,126,10,.14);color:var(--warn);}
.T-status-pill.overdue{background:rgba(217,59,85,.16);color:var(--err);}

/* ── Professional standalone summary — replaces the old colSpan'd tfoot
   row; a clean strip below the table, no run-together labels. Chips get
   a subtle hover lift and the Net badge is the clear headline number. ── */
/* ── SHARED TOTALS BAR — used identically by Cash Book/Credit/Client/Manpower
   (replaces the old per-section .T-tbl-summary/.T-credsum split, and
   Manpower's inline <tfoot> total row). Two-block layout: "This Page" on
   the left (the current page's own subtotal) and "Selected" on the right
   (the full filtered result set + a Net pill) — same shape as the totals
   bar built for DaybookTransactions.tsx's .TX-sum-bar earlier. ── */
/* justify-content:space-between (not flex-start default) so the two
   blocks sit at the bar's opposite edges by the container's own leftover
   space, instead of via flex:1 growth on each block — the old flex:1
   approach made each block's own box balloon to fill half the (often
   very wide) report panel, so its content sat pinned to the block's own
   near/far edge with dead air *inside* the block itself before you even
   got to the divider. Blocks are now sized to their content (no grow),
   which reads as two tight, purposeful groups instead of two islands in
   a canyon — much closer to "properly show the UI" than before. */
/* Flattened 2026-08-24 — dropped the shimmering top border and the
   glowing gradient "Net" pill (both read as decorative/marketing rather
   than accounting-professional); Net is now plain bold mono text in the
   CR/DR color, same treatment already applied to the client table's Total
   row and the stat card numbers, so the whole report reads as one
   consistent ledger system instead of mixing flat and glossy elements. */
.T-sumbar{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-top:12px;padding:14px 22px;background:#fff;border:1px solid var(--border);border-radius:var(--rlg,14px);box-shadow:0 1px 3px rgba(0,0,0,.04);position:relative;}
.T-sumbar-divider{width:1px;align-self:stretch;background:var(--border);flex-shrink:0;}
.T-sumbar-block{display:flex;flex-direction:column;gap:7px;flex:0 1 auto;min-width:170px;}
.T-sumbar-block.right{align-items:flex-end;text-align:right;}
.T-sumbar-block-hdr{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);}
.T-sumbar-block.right .T-sumbar-block-hdr{justify-content:flex-end;}
.T-sumbar-block-count{font-family:var(--mono);font-weight: 800;letter-spacing:0;text-transform:none;padding:1px 8px;border-radius:4px;background:var(--off-white,#F8FAFC);border:1px solid var(--border);color:var(--t2);}
.T-sumbar-block-vals{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.T-sumbar-block.right .T-sumbar-block-vals{justify-content:flex-end;}
.T-sumbar-pill{display:inline-flex;align-items:baseline;gap:5px;font-family:var(--mono);font-size: 11px;font-weight: 800;white-space:nowrap;font-variant-numeric:tabular-nums;}
.T-sumbar-pill.cr{color:var(--success);}
.T-sumbar-pill.dr{color:var(--err);}
.T-sumbar-net{display:flex;align-items:baseline;gap:6px;margin-left:4px;padding-left:14px;border-left:1px solid var(--border);}
.T-sumbar-net-lbl{font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:1.2px;text-transform:uppercase;color:var(--t4);}
.T-sumbar-net-val{font-family:var(--mono);font-size: 13px;font-weight: 800;white-space:nowrap;font-variant-numeric:tabular-nums;}
.T-sumbar-net.cr .T-sumbar-net-val{color:var(--success);}
.T-sumbar-net.dr .T-sumbar-net-val{color:var(--err);}
@media(max-width:680px){.T-sumbar{flex-direction:column;align-items:stretch;}.T-sumbar-divider{width:100%;height:1px;align-self:auto;}.T-sumbar-block,.T-sumbar-block.right{align-items:center;text-align:center;}.T-sumbar-block.right .T-sumbar-block-hdr,.T-sumbar-block.right .T-sumbar-block-vals{justify-content:center;}}


/* ── EMPTY-BY-DEFAULT STATE (Cash Book Report) ── */
.T-choose-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 32px 52px;gap:14px;animation:T-fade-scale .5s cubic-bezier(.22,1,.36,1) both;}
.T-choose-empty-orbit{position:relative;width:74px;height:74px;display:flex;align-items:center;justify-content:center;margin-bottom:4px;}
.T-choose-empty-icon{position:relative;z-index:2;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,var(--ember),var(--amber));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 24px rgba(29,78,216,.28);animation:T-choose-float 3s ease-in-out infinite;}
@keyframes T-choose-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.T-choose-ring{position:absolute;inset:0;border-radius:50%;border:1.5px solid var(--ember-border);animation:T-choose-ring-pulse 2.6s ease-out infinite;}
.T-choose-ring.r2{animation-delay:.9s;}
@keyframes T-choose-ring-pulse{0%{transform:scale(.8);opacity:.9}100%{transform:scale(1.7);opacity:0}}
/* Plain bold caps, no italic display serif — matches the mono/caps
   language used everywhere else on this page instead of standing out as a
   slanted "headline" font. */
.T-choose-empty-title{font-family:var(--mono);font-size: 13px;font-weight: 800;font-style:normal;text-transform:uppercase;letter-spacing:1px;color:var(--t1);}
.T-choose-empty-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:4px;}
.T-choose-chip{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--ember);background:var(--ember-ghost);border:1px solid var(--ember-border);border-radius:100px;padding:6px 14px;animation:T-ffield-in .45s cubic-bezier(.22,1,.36,1) both;transition:transform .18s,box-shadow .18s;cursor:default;}
/* Small diamond mark stands in for a per-field icon without needing a
   different SVG for every chip label across all four report sections. */
.T-choose-chip::before{content:'';width:5px;height:5px;flex-shrink:0;background:var(--ember);border-radius:1px;transform:rotate(45deg);}
.T-choose-chip:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(29,78,216,.18);}
.T-choose-chip:nth-child(1){animation-delay:.08s}
.T-choose-chip:nth-child(2){animation-delay:.13s}
.T-choose-chip:nth-child(3){animation-delay:.18s}
.T-choose-chip:nth-child(4){animation-delay:.23s}
.T-choose-chip:nth-child(5){animation-delay:.28s}
.T-choose-empty-sub{font-family:var(--mono);font-size: 8.5px;font-weight: 600;color:var(--t4);max-width:380px;line-height:1.55;}

/* ── CLIENT NAME DEBIT SUMMARY + SOURCE BADGES ──
   Header line ("All debit activity for …") removed 2026-08-23 per request —
   the section is now just the cards, full-width, styled to match the same
   pop-in/shimmer/hover-lift language as the base .ERP-stat cards used
   elsewhere in the app (see ERPTheme.ts .ERP-stat / .ERP-stat-icon /
   .ERP-stat-val) so this looks like one consistent ERP system. */
.T-client-summary{padding:20px 22px 22px;background:linear-gradient(135deg,rgba(29,78,216,.04),transparent);border-bottom:1px solid var(--border);animation:T-fade-scale .35s ease both;}
.T-client-summary-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;}
.T-client-sum-card{position:relative;display:flex;flex-direction:column;gap:8px;padding:18px 18px 16px;background:linear-gradient(165deg,#fff 0%,var(--off-white,#F8F8F8) 100%);border:1px solid var(--border);border-radius:var(--r,10px);overflow:hidden;cursor:default;animation:T-card-pop .5s cubic-bezier(.34,1.56,.64,1) both;transition:border-color .22s ease,transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s cubic-bezier(.22,1,.36,1);box-shadow:0 1px 3px rgba(0,0,0,.04);}
.T-client-sum-card::after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(115deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);transition:left .6s ease;pointer-events:none;}
.T-client-sum-card:hover::after{left:130%;}
.T-client-sum-card:hover{transform:translateY(-4px) scale(1.012);box-shadow:0 14px 28px rgba(0,0,0,.09);}
.T-client-sum-card.total:hover{border-color:var(--ember-border,rgba(29,78,216,.3));}
.T-client-sum-card.daybook:hover{border-color:rgba(40,112,204,.32);}
.T-client-sum-card.labour:hover{border-color:rgba(124,58,237,.32);}
.T-client-sum-card.credit:hover{border-color:rgba(217,158,4,.34);}
.T-client-sum-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.T-client-sum-card.total::before{background:linear-gradient(90deg,var(--ember),var(--amber));}
.T-client-sum-card.daybook::before{background:linear-gradient(90deg,var(--info),#60A5FA);}
.T-client-sum-card.labour::before{background:linear-gradient(90deg,var(--purple),#D98255);}
.T-client-sum-card.credit::before{background:linear-gradient(90deg,var(--warn),#FBBF24);}
.T-client-sum-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;transition:transform .3s cubic-bezier(.34,1.56,.64,1);}
.T-client-sum-card:hover .T-client-sum-icon{transform:translateY(-2px) scale(1.08) rotate(-4deg);}
.T-client-sum-card.total .T-client-sum-icon{background:rgba(29,78,216,.09);box-shadow:0 4px 10px -4px rgba(29,78,216,.35),inset 0 1px 0 rgba(255,255,255,.85);}
.T-client-sum-card.daybook .T-client-sum-icon{background:var(--info-bg,rgba(40,112,204,.09));box-shadow:0 4px 10px -4px rgba(40,112,204,.35),inset 0 1px 0 rgba(255,255,255,.85);}
.T-client-sum-card.labour .T-client-sum-icon{background:rgba(124,58,237,.09);box-shadow:0 4px 10px -4px rgba(124,58,237,.35),inset 0 1px 0 rgba(255,255,255,.85);}
.T-client-sum-card.credit .T-client-sum-icon{background:rgba(217,158,4,.10);box-shadow:0 4px 10px -4px rgba(217,158,4,.35),inset 0 1px 0 rgba(255,255,255,.85);}
.T-client-sum-card.total .T-client-sum-val{color:var(--ember);}
.T-client-sum-card.daybook .T-client-sum-val{color:var(--info);}
.T-client-sum-card.labour .T-client-sum-val{color:var(--purple);}
.T-client-sum-card.credit .T-client-sum-val{color:var(--warn);}
.T-client-sum-lbl{font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--t4);position:relative;z-index:1;}
.T-client-sum-val{font-family:var(--mono);font-size: 23px;font-weight: 800;font-style:normal;font-variant-numeric:tabular-nums;letter-spacing:-.3px;line-height:1.05;position:relative;z-index:1;animation:T-number-tick .4s cubic-bezier(.22,1,.36,1) both;animation-delay:.18s;}
@keyframes T-card-pop{0%{opacity:0;transform:translateY(10px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
.T-src-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;}
.T-src-badge.src-cash-book{background:rgba(26,79,160,.09);color:var(--info);}
.T-src-badge.src-labour-payment{background:rgba(30,156,106,.10);color:var(--success);}
.T-src-badge.src-credit-management{background:var(--ember-ghost);color:var(--ember);}
.T-src-badge.src-credit-bill{background:rgba(220,50,50,.09);color:var(--err);}
.T-src-badge.src-repayment{background:rgba(16,150,90,.09);color:var(--success);}

/* ── CUSTOM CALENDAR POPUP ── */
.T-cal-wrap{position:relative;}
.T-cal-val{font-family:var(--mono);font-size: 9.5px;font-weight: 700;color:var(--t1);user-select:none;}
.T-cal-panel{background:#fff;border:1.5px solid var(--border);border-radius:14px;box-shadow:0 14px 44px rgba(0,0,0,.16);padding:14px;animation:T-cal-pop .22s cubic-bezier(.22,1,.36,1) both;}
@keyframes T-cal-pop{from{opacity:0;transform:translateY(-8px) scale(.96)}to{opacity:1;transform:none}}
.T-cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.T-cal-nav{width:26px;height:26px;border-radius:50%;border:1px solid var(--border);background:#fff;color:var(--t3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s,color .18s,transform .18s;padding:0;}
.T-cal-nav:hover{background:var(--ember);color:#fff;border-color:var(--ember);transform:scale(1.08);}
.T-cal-title{font-family:var(--mono);font-size: 9px;font-weight: 800;letter-spacing:1px;color:var(--t1);text-transform:uppercase;}
.T-cal-title-btn{display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size: 9px;font-weight: 800;letter-spacing:1px;color:var(--t1);text-transform:uppercase;background:transparent;border:none;cursor:pointer;padding:4px 8px;border-radius:8px;transition:background .18s,color .18s;}
.T-cal-title-btn:hover{background:var(--ember-ghost);color:var(--ember);}
.T-cal-mpick{animation:T-cal-pop .18s ease both;}
.T-cal-mpick-yr{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:10px;}
.T-cal-mpick-yr-val{font-family:var(--mono);font-size: 11.5px;font-weight: 800;color:var(--ember);letter-spacing:1px;min-width:44px;text-align:center;}
.T-cal-mpick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.T-cal-mpick-btn{padding:10px 4px;border-radius:9px;border:1px solid var(--border);background:#fff;font-family:var(--mono);font-size: 9px;font-weight: 800;letter-spacing:.5px;color:var(--t2);cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .15s;}
.T-cal-mpick-btn:hover{background:var(--ember-ghost);color:var(--ember);border-color:var(--ember-border);transform:translateY(-1px);}
.T-cal-mpick-btn.sel{background:linear-gradient(135deg,var(--ember),var(--amber));color:#fff;border-color:transparent;box-shadow:0 3px 10px rgba(37,99,235,.3);}
.T-cal-week{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
.T-cal-week span{text-align:center;font-family:var(--mono);font-size: 8px;font-weight: 800;color:var(--t4);text-transform:uppercase;padding:4px 0;display:block;}
.T-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.T-cal-day{aspect-ratio:1;border:none;background:transparent;border-radius:8px;font-family:var(--mono);font-size: 9px;font-weight: 700;color:var(--t2);cursor:pointer;transition:background .15s,color .15s,transform .15s;display:flex;align-items:center;justify-content:center;}
.T-cal-day:hover:not(:disabled){background:var(--ember-ghost);color:var(--ember);}
.T-cal-day.today{border:1.5px solid var(--ember-border);color:var(--ember);font-weight: 800;}
.T-cal-day.sel{background:linear-gradient(135deg,var(--ember),var(--amber));color:#fff;font-weight: 800;box-shadow:0 3px 10px rgba(37,99,235,.35);transform:scale(1.05);}
.T-cal-day:disabled{color:var(--border2,#ccc);cursor:not-allowed;opacity:.45;}
.T-cal-day.empty{cursor:default;}
.T-cal-footer{display:flex;justify-content:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);}
.T-cal-today-btn{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--ember);background:var(--ember-ghost);border:1px solid var(--ember-border);border-radius:100px;padding:5px 14px;cursor:pointer;transition:background .18s,transform .18s;}
.T-cal-today-btn:hover{background:var(--ember);color:#fff;transform:translateY(-1px);}

.T-nfbar{display:flex;align-items:center;gap:10px;padding:12px 22px;background:var(--ember-ghost);border-bottom:1px solid var(--ember-border);flex-wrap:wrap;}
.T-nfbar-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:2px;color:var(--ember);text-transform:uppercase;display:flex;align-items:center;gap:5px;white-space:nowrap;}
.T-active-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:var(--r);color:#fff;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;box-shadow:0 2px 10px rgba(0,0,0,.10);}
.T-active-badge-x{cursor:pointer;opacity:.7;font-size: 11.5px;line-height:1;transition:opacity .15s;}
.T-active-badge-x:hover{opacity:1;}
.T-fstats{display:flex;gap:14px;margin-left:auto;font-family:var(--mono);font-size: 8px;color:var(--t3);flex-wrap:wrap;}
.T-card{background:#fff;border:1px solid var(--border);border-radius:var(--rxl);overflow:hidden;margin:0 36px 28px;box-shadow:var(--sh);position:relative;z-index:1;animation:T-up .5s ease both;transition:box-shadow .3s,transform .2s;}
.T-card:hover{box-shadow:var(--shh);}
.T-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(180deg,var(--ember),var(--amber),transparent);}
.T-card-head{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,var(--off),var(--off-white,#F8F8F8));}
.T-card-head-left{display:flex;align-items:center;gap:12px;}
.T-card-head-right{display:flex;align-items:center;gap:8px;}
.T-card-title{font-family:var(--display);font-size: 16.5px;font-weight: 800;font-style:normal;letter-spacing:.1px;color:var(--t1);}
.T-card-badge{font-family:var(--mono);font-size: 7.5px;font-weight: 800;padding:3px 10px;border-radius:var(--r);letter-spacing:1px;text-transform:uppercase;}
.T-card-icon{width:38px;height:38px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-size: 15px;border:1.5px solid var(--border);}

/* ── Standard module header theme — same flat, bordered treatment for
   every report module (Cash Book/Credit/Client/Manpower). Each module gets one
   accent color only (icon + badge); no gradients, no glow, no shimmer —
   keeps every module card visually identical apart from its accent. ── */
.T-card-icon-db{background:var(--info-bg);border-color:var(--info-bd);color:var(--info);}
.T-card-badge-db{background:var(--info-bg);color:var(--info);border:1px solid var(--info-bd);}
.T-card-icon-cr{background:var(--ember-ghost);border-color:rgba(29,78,216,.22);color:var(--ember);}
.T-card-badge-cr{background:var(--ember-ghost);color:var(--ember);border:1px solid rgba(29,78,216,.22);}
.T-card-icon-cp{background:rgba(166,73,29,.08);border-color:rgba(166,73,29,.22);color:var(--purple);}
.T-card-badge-cp{background:rgba(166,73,29,.08);color:var(--purple);border:1px solid rgba(166,73,29,.22);}
.T-card-icon-lb{background:var(--warn-bg);border-color:var(--warn-bd);color:var(--warn);}
.T-card-badge-lb{background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-bd);}
.T-tbl-wrap{overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;}
.T-tbl-wrap::-webkit-scrollbar{display:none;height:0;}
.T-tbl{width:100%;border-collapse:collapse;font-size: 9.5px;table-layout:fixed;}
/* table-layout:fixed guarantees the table never exceeds its container (no
   horizontal scroll), but splits width evenly across every <th>/<td> unless
   overridden — that would squeeze the trailing amount column exactly the way
   the user reported. Reserve a sensible width for the S.No column and the
   last two columns (which are always the amount/balance columns across every
   report tab: Income/Expense, Credit/Paid/Balance, Paid, etc.) and let the
   remaining, more free-form columns (Client, Narration, Party Name...) share
   what's left and wrap onto a second line instead of forcing overflow. */
.T-tbl th:first-child,.T-tbl td:first-child{width:44px;}
.T-tbl th:last-child,.T-tbl td:last-child,.T-tbl th:nth-last-child(2),.T-tbl td:nth-last-child(2){width:120px;padding-left:8px;padding-right:8px;}
.T-tbl th,.T-tbl td{overflow:hidden;text-overflow:ellipsis;word-break:break-word;}
.T-tbl th:first-child,.T-tbl td:first-child,.T-tbl th:last-child,.T-tbl td:last-child,.T-tbl th:nth-last-child(2),.T-tbl td:nth-last-child(2){white-space:nowrap;word-break:normal;}
.T-tbl thead tr{background:var(--surf2);border-bottom:2px solid var(--ember-border);}
.T-tbl thead th{padding:12px 16px;text-align:left;font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:2px;text-transform:uppercase;color:var(--t3);white-space:nowrap;position:sticky;top:0;z-index:3;background:var(--surf2);}
.T-tbl tbody tr{border-bottom:1px solid var(--border);transition:background .12s;animation:T-rowIn .35s ease both;}
.T-tbl tbody tr:hover{background:var(--ember-ghost);}
.T-tbl tbody td{padding:12px 16px;vertical-align:middle;}
.T-tbl tfoot td{padding:16px;background:linear-gradient(135deg,rgba(29,78,216,.12),rgba(59,130,246,.07));border-top:2.5px solid var(--ember);box-shadow:0 -1px 0 rgba(255,255,255,.6) inset;font-weight: 800;font-family:var(--mono);font-size: 9px;color:var(--t2);}
.T-tbl-total-row td{padding:16px !important;position:relative;}
.T-tbl-total-row td:first-child::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--ember),var(--ember-mid));}
.T-tbl-total-label{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size: 8.5px;font-weight: 800;letter-spacing:1.8px;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,var(--ember,#2563EB),var(--ember-mid,#3B82F6));padding:5px 13px;border-radius:6px;margin-right:12px;vertical-align:middle;box-shadow:0 3px 10px rgba(29,78,216,.38);animation:T-total-glow 2.6s ease-in-out infinite;}
.T-tbl-total-meta{font-family:var(--body);font-size: 9px;font-weight: 700;color:var(--t3);vertical-align:middle;}
/* Flattened from an earlier boxed/glowing pill treatment to a plain bold
   number set in the same professional mono ledger font as the per-row
   amount cells (.T-tbl-amt), so the grand total reads as one accounting
   system with the rest of the table instead of a separately-styled badge. */
.T-tbl-total-amt{display:inline-block;font-family:var(--mono);font-size: 12.5px;font-weight: 800;font-style:normal;letter-spacing:0;white-space:nowrap;}
.T-tbl-total-amt.income{color:var(--success);}
.T-tbl-total-amt.expense{color:var(--err);}
@keyframes T-total-glow{0%,100%{box-shadow:0 3px 10px rgba(29,78,216,.38);}50%{box-shadow:0 3px 18px rgba(29,78,216,.62);}}
.T-pay-tbl{width:100%;border-collapse:collapse;font-size: 9px;}
.T-pay-tbl th{padding:9px 12px;background:var(--info-bg,rgba(40,112,204,0.10));font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--info,#2870CC);border-bottom:1.5px solid var(--info-bd,rgba(40,112,204,0.26));text-align:left;}
.T-pay-tbl td{padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;}
.T-pay-tbl tr:last-child td{border-bottom:none;}
.T-pay-tbl tfoot td{padding:9px 12px;background:var(--info-bg,rgba(40,112,204,0.06));border-top:1.5px solid var(--info-bd,rgba(40,112,204,0.20));font-weight: 800;font-family:var(--mono);font-size: 9px;}
.T-expand-btn{width:28px;height:28px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:#fff;cursor:pointer;color:var(--t4);transition:all .18s;}
.T-expand-btn:hover{border-color:var(--ember-border);color:var(--ember);background:var(--ember-ghost);}
.T-expand-btn.open{background:linear-gradient(135deg,var(--amber),var(--ember));border-color:var(--ember);color:#fff;transform:rotate(90deg);}
.T-drawer{background:var(--off);border-top:1px solid var(--border);animation:T-drawer .22s ease both;}
.T-drawer-tabs{display:flex;padding:0 24px 0 52px;border-bottom:1px solid var(--border);background:#fff;}
.T-dtab{padding:10px 18px;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--t4);cursor:pointer;background:transparent;border:none;border-bottom:2px solid transparent;transition:all .15s;}
.T-dtab.on{color:var(--ember);border-bottom-color:var(--ember);}
.T-drawer-inner{padding:20px 24px 24px 52px;}
.T-cp-drawer{background:var(--off);border-top:1px solid var(--border);animation:T-drawer .22s ease both;}
.T-cp-drawer-inner{padding:18px 22px 22px 52px;}
.T-prog-wrap{display:flex;align-items:center;gap:8px;}
.T-prog-track{flex:1;max-width:90px;height:5px;background:var(--border);border-radius:99px;overflow:hidden;}
.T-prog-fill{height:100%;border-radius:99px;transition:width .7s cubic-bezier(.22,1,.36,1);}
.T-prog-txt{font-family:var(--mono);font-size: 8px;font-weight: 800;}
.T-tl-item{display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--border);transition:background .1s;}
.T-tl-item:hover{background:var(--ember-ghost);}
.T-tl-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.T-tl-date{font-family:var(--mono);font-size: 8.5px;color:var(--t4);min-width:72px;}
.T-tl-label{font-size: 9.5px;font-weight: 700;color:var(--t1);flex:1;}
.T-tl-amt{font-family:var(--display);font-size: 15px;font-weight: 800;font-style:italic;}
.T-cp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
.T-cp-stat{background:#fff;border:1px solid var(--border);border-radius:var(--rlg);padding:14px 16px;transition:box-shadow .2s;}
.T-cp-stat:hover{box-shadow:var(--she);}
.T-cp-stat-lbl{font-family:var(--mono);font-size: 7.5px;font-weight: 800;text-transform:uppercase;letter-spacing:2px;color:var(--t4);margin-bottom:6px;}
.T-cp-stat-val{font-family:var(--display);font-size: 17.5px;font-style:italic;line-height:1;}
/* Flattened 2026-08-24 — Synced line + pagination bar were the last
   glossy pieces of the footer (gradient wash, glow-pulsing dot, gradient
   nav pills, entrance animations). Dropped all of that for plain flat
   panels + solid-color controls so the whole footer (summary bar,
   pagination, synced line) reads as one consistent flat ledger strip
   instead of summary-bar-flat-but-pagination-glossy. */
.T-sync{display:flex;align-items:center;gap:8px;padding:10px 24px;background:var(--off);border-top:1px solid var(--border);font-family:var(--mono);font-size: 8px;color:var(--t4);}
.T-sync-dot{width:5px;height:5px;border-radius:50%;background:var(--success,#1E9C6A);flex-shrink:0;}
.T-pg{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-top:1px solid var(--border);background:#fff;flex-wrap:wrap;gap:10px;}
.T-pg-info{font-family:var(--mono);font-size: 9.5px;font-weight:700;letter-spacing:.3px;color:var(--t3);}
.T-pg-info strong{color:var(--ember);font-weight:900;}
.T-pg-btns{display:flex;align-items:center;gap:5px;padding:4px;background:var(--off-white,#F8FAFC);border:1px solid var(--border);border-radius:10px;}
.T-pg-btn{min-width:30px;width:30px;height:30px;padding:0 5px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;font-family:var(--mono);font-size: 10px;font-weight: 800;color:var(--t3);cursor:pointer;transition:background .15s ease,color .15s ease;}
/* Nav buttons (first/prev/next/last) now use inline SVG chevrons instead of
   «‹›» text glyphs, for a crisper look consistent with the rest of the
   app's icon language — this keeps them perfectly centered either way. */
.T-pg-btn svg{display:block;pointer-events:none;}
.T-pg-btn:hover:not(:disabled):not(.on){color:var(--ember);background:var(--ember-ghost);}
.T-pg-btn:active:not(:disabled){transform:scale(.92);transition-duration:.08s;}
.T-pg-btn.on{background:var(--ember);color:#fff;}
.T-pg-btn:disabled{opacity:.32;cursor:not-allowed;color:var(--t4) !important;}
.T-charts{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 36px 28px;position:relative;z-index:1;}
@media(max-width:800px){.T-charts{grid-template-columns:1fr;}}
@media(max-width:960px){
  .T-filter,.T-nfbar{gap:8px;padding:10px 16px;}
  .TD-trigger{font-size: 9.5px;padding:8px 12px;}
  .T-filter-inp{min-width:150px;font-size: 9.5px;}
}
@media(max-width:700px){
  .T-filter,.T-nfbar{flex-direction:column;align-items:stretch;gap:8px;padding:10px 14px;}
  .TD-wrap{width:100%;}
  .TD-trigger{width:100%;min-width:unset;}
  .T-filter-inp{width:100%;min-width:unset;box-sizing:border-box;}
  .T-filter-lbl,.T-nfbar-lbl{font-size: 8px;}
  .T-fstats{margin-left:0;gap:10px;}
}
@media(max-width:480px){
  .T-card{margin:0 10px 18px;}
  .T-card-head{padding:14px 16px;}
  .T-card-title{font-size: 14px;}
  .T-stat-row{flex-direction:column;}
  .T-stat-cell{min-width:unset;flex:1;border-right:none;border-bottom:1px solid var(--border);}
  .T-tbl thead th,.T-tbl tbody td{padding:8px 10px;font-size: 9px;}
}
.T-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:52px 24px;text-align:center;gap:12px;}
.T-empty-icon{font-size: 38.5px;opacity:.35;animation:T-float 3s ease-in-out infinite;}
.T-empty-title{font-family:var(--display);font-size: 17.5px;font-style:italic;color:var(--t2);}
.T-empty-sub{font-family:var(--mono);font-size: 8px;color:var(--t4);letter-spacing:1px;text-transform:uppercase;}
.T-bg-pattern{position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:0;overflow:hidden;}
.T-bg-pattern::before{content:'';position:absolute;top:-100px;right:-100px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,.04),transparent 70%);}
.T-bg-pattern::after{content:'';position:absolute;bottom:-150px;left:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.03),transparent 70%);}
/* ── Premium Scrollbar — Report Center ── */
@keyframes rc-sb-glow{
  0%,100%{box-shadow:0 0 4px rgba(59,130,246,.38),0 0 10px rgba(29,78,216,.16);}
  50%{box-shadow:0 0 10px rgba(59,130,246,.65),0 0 22px rgba(29,78,216,.28);}
}
.T{scrollbar-width:thin;scrollbar-color:#3B82F6 rgba(203,213,225,.18);}
.T ::-webkit-scrollbar{width:4px;height:4px;}
.T ::-webkit-scrollbar-track{background:rgba(203,213,225,.15);border-radius:99px;}
.T ::-webkit-scrollbar-thumb{
  background:linear-gradient(180deg,#60A5FA 0%,#3B82F6 45%,#2563EB 100%);
  border-radius:99px;
  box-shadow:0 0 4px rgba(59,130,246,.26);
  transition:background .22s ease,box-shadow .22s ease;
}
.T ::-webkit-scrollbar-thumb:hover{
  background:linear-gradient(180deg,#BFDBFE 0%,#3B82F6 42%,#2563EB 100%);
  box-shadow:0 0 8px rgba(59,130,246,.58),0 0 18px rgba(29,78,216,.24);
  animation:rc-sb-glow 1.8s ease-in-out infinite;
}
.T ::-webkit-scrollbar-corner{background:transparent;}
.T-spacer{height:60px;}
.T-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
.T-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;border:1.5px solid;transition:all .15s;}
.T-chip-x{cursor:pointer;opacity:.7;font-size: 9.5px;transition:opacity .15s;}
.T-chip-x:hover{opacity:1;}
/* ── Logo component ── */
.T-logo-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
.T-logo-wrap::after{content:'';position:absolute;inset:-10px;border-radius:26px;background:radial-gradient(circle,rgba(29,78,216,0.20),transparent 65%);z-index:0;pointer-events:none;animation:T-pulse-gentle 3.5s ease-in-out infinite;}
.T-logo-img{width:68px;height:68px;object-fit:contain;border-radius:16px;border:2px solid rgba(29,78,216,0.30);box-shadow:0 4px 18px rgba(29,78,216,0.35),0 1px 4px rgba(0,0,0,0.15);transition:transform .22s,box-shadow .22s;display:block;position:relative;z-index:1;}
.T-logo-img:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 8px 28px rgba(29,78,216,0.52),0 2px 6px rgba(0,0,0,0.18);}
.T-logo-svg{position:relative;z-index:1;filter:drop-shadow(0 4px 18px rgba(29,78,216,0.40)) drop-shadow(0 1px 4px rgba(0,0,0,0.18));transition:transform .22s,filter .22s;display:block;}
.T-logo-svg:hover{transform:translateY(-3px) scale(1.05);filter:drop-shadow(0 8px 28px rgba(29,78,216,0.58)) drop-shadow(0 2px 6px rgba(0,0,0,0.22));}
/* ── Brand typography ── */
.T-hdr-brand{display:flex;flex-direction:column;gap:0;}
.T-hdr-brand-eyebrow{font-family:var(--mono);font-size: 7px;font-weight: 800;letter-spacing:3.5px;color:var(--ember);text-transform:uppercase;margin-bottom:3px;opacity:.85;}
.T-hdr-brand-tagline{font-family:var(--mono);font-size: 8px;color:var(--t3);letter-spacing:.4px;margin-top:4px;line-height:1.4;}
/* ── Header background upgrade ── */
.T-hdr{background:linear-gradient(160deg,#ffffff 0%,#F8FAFC 55%,#fff3ea 100%)!important;}
/* ── Large "T" watermark behind header top ── */
.T-hdr-mark{position:absolute;right:6%;top:50%;transform:translateY(-50%);font-family:var(--display);font-style:italic;font-weight: 800;font-size: 185px;color:rgba(29,78,216,0.032);pointer-events:none;user-select:none;z-index:0;line-height:1;letter-spacing:-8px;}
.T-hdr-top{position:relative;overflow:hidden;}
/* ── Company details grid ── */
.T-hdr-company-details{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;margin-top:6px;}

.T-party-detail{display:flex;flex-direction:column;gap:20px;padding:22px 24px 26px;}
.T-party-card{background:linear-gradient(155deg,#F8FAFC 0%,#fff 45%);border:1.5px solid var(--ember-border);border-radius:var(--rxl);padding:22px 24px;animation:T-card-in .4s cubic-bezier(.22,1,.36,1) both;position:relative;overflow:hidden;}
.T-party-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--ember),var(--amber));}
.T-party-name-slim{font-family:var(--mono);font-size: 8.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--t4);margin-bottom:10px;}
.T-party-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;}
.T-party-name{font-family:var(--display);font-size: 21px;font-style:italic;color:var(--t1);line-height:1.15;}
.T-party-biz{font-family:var(--mono);font-size: 9px;color:var(--t4);margin-top:3px;letter-spacing:.3px;}
.T-party-badges{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.T-party-meta{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px dashed var(--border);font-family:var(--mono);font-size: 9px;color:var(--t3);}
.T-party-meta span{display:inline-flex;align-items:center;gap:5px;}
.T-party-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px;}
.T-party-stat{background:rgba(255,255,255,.7);border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;}
.T-party-stat-lbl{font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:1.2px;text-transform:uppercase;color:var(--t4);margin-bottom:4px;}
.T-party-stat-val{font-family:var(--display);font-size: 17.5px;font-style:italic;white-space:nowrap;}
@media(max-width:640px){.T-party-stats{grid-template-columns:1fr 1fr;}}
.T-party-tabs{display:flex;gap:4px;margin-top:4px;border-bottom:1.5px solid var(--border);}
.T-party-tab{font-family:var(--mono);font-size: 8.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--t4);background:none;border:none;padding:10px 4px;margin-right:18px;cursor:pointer;position:relative;transition:color .15s;}
.T-party-tab:hover{color:var(--t2);}
.T-party-tab.on{color:var(--ember);}
.T-party-tab.on::after{content:'';position:absolute;left:0;right:0;bottom:-1.5px;height:2px;background:var(--ember);border-radius:2px;}
.T-party-panel{padding-top:16px;}
.T-bill-grid,.T-pay-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(258px,1fr));gap:14px;}
.T-bill-card,.T-pay-card{background:#fff;border:1px solid var(--border);border-radius:var(--rlg);padding:15px 16px;transition:box-shadow .2s,transform .2s,border-color .2s;animation:T-card-in .35s cubic-bezier(.22,1,.36,1) both;}
.T-bill-card:hover,.T-pay-card:hover{box-shadow:var(--shh);border-color:var(--ember-border);transform:translateY(-2px);}
.T-bill-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.T-bill-card-no{font-family:var(--mono);font-size: 9px;font-weight: 800;color:var(--purple);}
.T-bill-card-desc{font-size: 9.5px;color:var(--t2);line-height:1.5;margin-top:8px;min-height:18px;}
.T-bill-card-amounts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;padding-top:12px;border-top:1px dashed var(--border);}
.T-bill-amt-lbl{font-family:var(--mono);font-size: 7.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--t4);margin-bottom:2px;}
.T-bill-amt-val{font-family:var(--display);font-size: 12px;font-style:italic;white-space:nowrap;}
.T-bill-card-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;font-family:var(--mono);font-size: 8.5px;color:var(--t4);flex-wrap:wrap;}
.T-pay-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.T-pay-card-amt{font-family:var(--display);font-size: 16.5px;font-weight: 800;font-style:italic;color:var(--success);}
.T-pay-card-meta{display:flex;flex-direction:column;gap:4px;margin-top:10px;font-family:var(--mono);font-size: 8.5px;color:var(--t3);}
.T-pay-card-notes{font-size: 9px;color:var(--t3);margin-top:8px;padding-top:8px;border-top:1px dashed var(--border);font-style:italic;}
.T-pay-card-sync{margin-top:10px;font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;}
.T-pay-card-sync.on{color:var(--success);}
.T-pay-card-sync.off{color:var(--t4);}
.T-party-switch-note{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--ember-ghost);border:1px solid var(--ember-border);border-radius:var(--r);font-family:var(--mono);font-size: 8.5px;color:var(--ember);margin-bottom:2px;}
.T-party-switch-note button{margin-left:auto;background:none;border:1px solid var(--ember-border);color:var(--ember);font-family:var(--mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;text-transform:uppercase;padding:4px 10px;border-radius:99px;cursor:pointer;transition:all .15s;}
.T-party-switch-note button:hover{background:var(--ember);color:#fff;}
`;
