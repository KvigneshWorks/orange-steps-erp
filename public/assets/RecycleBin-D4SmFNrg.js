import{C as e,D as t,S as n,b as r,v as i,x as a,y as o}from"./index-o01vRmXM.js";import{t as s}from"./Icon-BwmQI0VD.js";import{n as c,t as l}from"./proxy-XlPwCsFC.js";var u=t(e(),1),d=n();function f(e,t=10,n=8){let r=e.currentTarget,i=r.getBoundingClientRect(),a=(e.clientX-i.left)/i.width,o=(.5-(e.clientY-i.top)/i.height)*t,s=(a-.5)*t;r.style.transform=`perspective(700px) rotateX(${o}deg) rotateY(${s}deg) translateZ(${n}px)`}function p(e){e.currentTarget.style.transform=``}var m=i(),h=280;function g({open:e,title:t=`Permanent Delete`,itemName:n,description:r,confirmLabel:i=`Delete Forever`,warnText:a,onConfirm:o,onCancel:s,loading:c=!1}){let l=(0,u.useRef)(null),[g,_]=(0,u.useState)(e),[v,y]=(0,u.useState)(!1);if((0,u.useEffect)(()=>{if(e)_(!0),y(!1);else if(g){y(!0);let e=setTimeout(()=>_(!1),h);return()=>clearTimeout(e)}},[e]),(0,u.useEffect)(()=>{if(!e)return;let t=e=>{e.key===`Escape`&&s(),e.key===`Enter`&&!c&&o()};return document.addEventListener(`keydown`,t),()=>document.removeEventListener(`keydown`,t)},[e,c]),(0,u.useEffect)(()=>{e&&l.current?.focus()},[e]),!g)return null;let b=r||(n?`Delete ${n}? This cannot be undone.`:`This record will be permanently removed from the system.`);return(0,d.createPortal)((0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`style`,{children:`
        @keyframes rbdm-bg-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes rbdm-bg-out { from { opacity:1; } to { opacity:0; } }
        @keyframes rbdm-in {
          0%   { opacity:0; transform:perspective(1000px) rotateX(-46deg) translateY(-20px) translateZ(-60px) scale(.9); }
          55%  { opacity:1; transform:perspective(1000px) rotateX(5deg) translateY(2px) translateZ(6px) scale(1.015); }
          100% { opacity:1; transform:perspective(1000px) rotateX(0) translateY(0) translateZ(0) scale(1); }
        }
        @keyframes rbdm-out {
          0%   { opacity:1; transform:perspective(1000px) rotateY(0) translateY(0) scale(1); }
          100% { opacity:0; transform:perspective(1000px) rotateY(-38deg) translateY(14px) translateZ(-80px) scale(.86); }
        }
        @keyframes rbdm-icon-in {
          0%   { transform:perspective(300px) rotateY(-160deg) scale(.3); opacity:0; }
          60%  { transform:perspective(300px) rotateY(14deg) scale(1.08); opacity:1; }
          100% { transform:perspective(300px) rotateY(0) scale(1); }
        }
        @keyframes rbdm-ring  { 0% { transform:scale(.6); opacity:.55; } 100% { transform:scale(2.1); opacity:0; } }
        @keyframes rbdm-shine { 0% { left:-60%; opacity:0; } 18% { opacity:1; } 100% { left:130%; opacity:0; } }
        @keyframes rbdm-spin  { to { transform:rotate(360deg); } }

        .rbdm-backdrop {
          position:fixed; inset:0; z-index:9999;
          background:rgba(20,14,8,0.46);
          backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          animation:rbdm-bg-in .2s ease both; padding:16px;
        }
        .rbdm-backdrop.closing { animation:rbdm-bg-out .24s ease both; }

        .rbdm-slot { transform-style:preserve-3d; width:100%; max-width:360px; }
        .rbdm-slot.enter  { animation:rbdm-in .5s cubic-bezier(.22,1,.36,1) both; }
        .rbdm-slot.closing{ animation:rbdm-out .26s cubic-bezier(.4,0,.7,.4) both; }

        .rbdm-card {
          position:relative; background:#FFFFFF; border-radius:18px; overflow:hidden;
          border:1px solid #E7E2DC;
          box-shadow:0 1px 1px rgba(30,20,10,.05), 0 8px 20px rgba(30,20,10,.10), 0 30px 60px -14px rgba(30,20,10,.22);
          transform-style:preserve-3d;
          transition:transform .35s cubic-bezier(.2,.8,.3,1), box-shadow .35s ease;
          text-align:center;
        }
        .rbdm-shine {
          position:absolute; top:0; left:-60%; width:44%; height:100%; z-index:2;
          background:linear-gradient(115deg, transparent 0%, rgba(255,255,255,.55) 45%, rgba(255,255,255,.85) 50%, rgba(255,255,255,.55) 55%, transparent 100%);
          transform:skewX(-18deg); pointer-events:none; mix-blend-mode:soft-light;
          animation:rbdm-shine 1s ease .2s both;
        }
        .rbdm-topbar { height:4px; background:linear-gradient(90deg,#D93B55 0%,#E8677D 60%,#F2A6B2 100%); }

        .rbdm-body { padding:30px 26px 6px; }
        .rbdm-icon-wrap {
          position:relative; width:56px; height:56px; margin:0 auto 16px;
          border-radius:16px; background:rgba(217,59,85,0.10); border:1.5px solid rgba(217,59,85,0.24);
          display:flex; align-items:center; justify-content:center;
          transform-style:preserve-3d;
          animation:rbdm-icon-in .55s cubic-bezier(.3,1.4,.5,1) .1s both;
        }
        .rbdm-icon-wrap::after {
          content:''; position:absolute; inset:-4px; border-radius:19px; border:1.5px solid #D93B55;
          animation:rbdm-ring .65s ease-out .28s both;
        }
        .rbdm-title {
          font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:16px; font-weight:800;
          color:#241D15; letter-spacing:-.2px; margin-bottom:6px;
        }
        .rbdm-line {
          font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:12.5px; font-weight:500;
          color:#7A6F60; line-height:1.5; margin:0 0 4px;
        }
        .rbdm-warn {
          margin-top:12px; padding:9px 12px; border-radius:10px;
          background:rgba(196,126,10,0.08); border:1px solid rgba(196,126,10,0.22);
          font-family:'JetBrains Mono','Consolas',monospace; font-size:9.5px; font-weight:700;
          color:#C47E0A; letter-spacing:.02em; text-align:left; display:flex; gap:8px; align-items:flex-start;
        }

        .rbdm-footer { display:flex; gap:10px; padding:22px 22px 24px; }
        .rbdm-btn {
          flex:1; font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:11px; font-weight:800;
          border-radius:11px; padding:11px 14px; cursor:pointer; border:none;
          display:flex; align-items:center; justify-content:center; gap:7px;
          transition:transform .16s ease, box-shadow .16s ease, background .16s ease;
        }
        .rbdm-btn-cancel {
          background:#F6F1EA; color:#4A4136; border:1.5px solid #E7E2DC;
        }
        .rbdm-btn-cancel:hover:not(:disabled) { background:#EFE8DE; transform:translateY(-1px); }
        .rbdm-btn-cancel:disabled { opacity:.5; cursor:not-allowed; }
        .rbdm-btn-delete {
          background:linear-gradient(135deg,#E24A63 0%,#D93B55 100%); color:#fff;
          box-shadow:0 6px 16px rgba(217,59,85,.32);
        }
        .rbdm-btn-delete:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 22px rgba(217,59,85,.4); }
        .rbdm-btn-delete:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .rbdm-spinner {
          width:12px; height:12px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff;
          border-radius:50%; animation:rbdm-spin .65s linear infinite;
        }

        @media(prefers-reduced-motion: reduce){
          .rbdm-slot.enter, .rbdm-slot.closing, .rbdm-icon-wrap, .rbdm-icon-wrap::after, .rbdm-shine { animation:none !important; }
          .rbdm-card { transition:none !important; }
        }
      `}),(0,m.jsx)(`div`,{className:`rbdm-backdrop${v?` closing`:``}`,onClick:()=>s(),children:(0,m.jsx)(`div`,{className:`rbdm-slot${v?` closing`:` enter`}`,onClick:e=>e.stopPropagation(),children:(0,m.jsxs)(`div`,{className:`rbdm-card`,onMouseMove:e=>f(e,7,6),onMouseLeave:p,children:[(0,m.jsx)(`div`,{className:`rbdm-shine`}),(0,m.jsx)(`div`,{className:`rbdm-topbar`}),(0,m.jsxs)(`div`,{className:`rbdm-body`,children:[(0,m.jsx)(`div`,{className:`rbdm-icon-wrap`,children:(0,m.jsx)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`#D93B55`,strokeWidth:2.2,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,m.jsx)(`path`,{d:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`})})}),(0,m.jsx)(`div`,{className:`rbdm-title`,children:t}),(0,m.jsx)(`p`,{className:`rbdm-line`,children:b}),a&&(0,m.jsxs)(`div`,{className:`rbdm-warn`,children:[(0,m.jsx)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`#C47E0A`,strokeWidth:2.4,strokeLinecap:`round`,strokeLinejoin:`round`,style:{flexShrink:0,marginTop:1},children:(0,m.jsx)(`path`,{d:`M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z`})}),(0,m.jsx)(`span`,{children:a})]})]}),(0,m.jsxs)(`div`,{className:`rbdm-footer`,children:[(0,m.jsx)(`button`,{ref:l,className:`rbdm-btn rbdm-btn-cancel`,onClick:s,disabled:c,children:`Cancel`}),(0,m.jsxs)(`button`,{className:`rbdm-btn rbdm-btn-delete`,onClick:o,disabled:c,children:[c&&(0,m.jsx)(`span`,{className:`rbdm-spinner`}),c?`Deleting…`:i]})]})]})})})]}),document.body)}var _=`
@keyframes rb-card-in {
  0%   { opacity:0; transform:perspective(800px) rotateX(-28deg) translateY(14px) scale(.94); }
  60%  { opacity:1; transform:perspective(800px) rotateX(4deg) translateY(-2px) scale(1.016); }
  100% { opacity:1; transform:perspective(800px) rotateX(0) translateY(0) scale(1); }
}
@keyframes rb-float     { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-6px) rotate(-3deg); } }
@keyframes rb-chip-pop  { 0% { opacity:0; transform:scale(.7); } 100% { opacity:1; transform:scale(1); } }

.RB-stat {
  position:relative; transform-style:preserve-3d; overflow:hidden;
  transition:transform .35s cubic-bezier(.2,.8,.3,1), box-shadow .35s ease;
  animation:rb-card-in .5s cubic-bezier(.22,1,.36,1) both;
  will-change:transform;
}
.RB-stat:nth-child(1){ animation-delay:.02s }
.RB-stat:nth-child(2){ animation-delay:.07s }
.RB-stat:nth-child(3){ animation-delay:.12s }
.RB-stat:nth-child(4){ animation-delay:.17s }
.RB-stat:hover { box-shadow:0 18px 36px -12px rgba(15,23,42,.20); }
.RB-stat-top { position:absolute; top:0; left:0; right:0; height:3px; background:var(--rb-c); }
.RB-stat-ic  { width:26px; height:26px; border-radius:8px; background:var(--rb-bg); border:1px solid var(--rb-bd); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }

.RB-chip {
  padding:5px 14px; border-radius:100px; cursor:pointer; font-family:'JetBrains Mono',monospace;
  font-size:9.5px; font-weight:700; transition:transform .16s ease, box-shadow .16s ease, background .16s, border-color .16s, color .16s;
  animation:rb-chip-pop .3s ease both;
}
.RB-chip:hover { transform:translateY(-2px); box-shadow:0 6px 14px rgba(15,23,42,.10); }
.RB-chip:active { transform:translateY(0) scale(.96); }

.RB-group {
  position:relative; margin-bottom:10px; border-radius:14px; overflow:hidden;
  border:1px solid var(--border); background:var(--white);
  box-shadow:0 1px 2px rgba(15,23,42,.04);
  animation:rb-card-in .5s cubic-bezier(.22,1,.36,1) both;
  transition:transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease;
}
.RB-group:hover { transform:translateY(-3px); box-shadow:0 14px 30px -12px rgba(15,23,42,.16); }
.RB-group-hdr { position:relative; display:flex; align-items:center; justify-content:space-between; padding:12px 18px 12px 16px; gap:12px; flex-wrap:wrap; border-left:4px solid var(--rb-c); }
.RB-group-ic  { width:30px; height:30px; border-radius:9px; background:var(--rb-bg); border:1px solid var(--rb-bd); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.RB-group-dot { width:7px; height:7px; border-radius:50%; background:var(--rb-c); flex-shrink:0; box-shadow:0 0 6px var(--rb-c); }
.RB-group-btn {
  display:inline-flex; align-items:center; gap:6px; padding:6px 13px; border-radius:8px;
  font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; cursor:pointer; border:1px solid; transition:all .18s;
}
.RB-group-btn.restore { background:rgba(30,156,106,.08); color:#1E9C6A; border-color:rgba(30,156,106,.24); }
.RB-group-btn.restore:hover:not(:disabled) { background:#1E9C6A; color:#fff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,156,106,.3); }
.RB-group-btn.danger  { background:rgba(217,59,85,.08); color:#D93B55; border-color:rgba(217,59,85,.22); }
.RB-group-btn.danger:hover:not(:disabled) { background:#D93B55; color:#fff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(217,59,85,.3); }
.RB-group-btn:disabled { opacity:.5; cursor:not-allowed; }

.RB-float { display:inline-flex; animation:rb-float 3.4s ease-in-out infinite; }

/* ── Compact row polish ── */
.RB-group-hdr { padding:10px 16px 10px 14px; }
.RB-group-btn { padding:5px 11px; }
.RB-group-btn.restore:hover:not(:disabled),
.RB-group-btn.danger:hover:not(:disabled) { transform:translateY(-1px) scale(1.03); }
.ERP-act.edit, .ERP-act.delete { transition:transform .16s ease, box-shadow .16s ease, background .16s, color .16s; }
.ERP-act.edit:hover:not(:disabled), .ERP-act.delete:hover:not(:disabled) { transform:translateY(-1px) scale(1.05); }

/* ── Bin success FX overlay ── */
.RB-fx-backdrop {
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center;
  background:rgba(15,23,42,.34); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
.RB-fx-card {
  position:relative; width:264px; padding:24px 22px 16px; border-radius:18px;
  background:var(--white); text-align:center; overflow:hidden;
  box-shadow:0 24px 60px -18px rgba(15,23,42,.4), 0 0 0 1px rgba(15,23,42,.05);
}
.RB-fx-card.RB-fx-restore { box-shadow:0 24px 60px -18px rgba(30,156,106,.38), 0 0 0 1px rgba(30,156,106,.14); }
.RB-fx-card.RB-fx-delete  { box-shadow:0 24px 60px -18px rgba(217,59,85,.38), 0 0 0 1px rgba(217,59,85,.14); }
.RB-fx-icon  { display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
.RB-fx-title { font-size:15px; font-weight:800; color:var(--text-1,#1a1a1a); margin-bottom:4px; letter-spacing:.1px; }
.RB-fx-msg   { font-size:11px; color:var(--text-3,#666); line-height:1.55; padding:0 4px; }
.RB-fx-bar   { position:absolute; left:0; bottom:0; height:3px; width:100%; transform-origin:left; background:linear-gradient(90deg,var(--ember,#2563EB),var(--ember-light,#60A5FA)); }
.RB-fx-card.RB-fx-restore .RB-fx-bar { background:linear-gradient(90deg,#1E9C6A,#3ec98c); }
.RB-fx-card.RB-fx-delete  .RB-fx-bar { background:linear-gradient(90deg,#D93B55,#f0637c); }

@media(prefers-reduced-motion: reduce){
  .RB-stat, .RB-group, .RB-chip, .RB-float { animation:none !important; }
  .RB-stat, .RB-group { transition:none !important; }
}
`;function v({kind:e}){let t=e===`delete`,n=t?`#D93B55`:`#1E9C6A`;return(0,m.jsxs)(`svg`,{width:`72`,height:`72`,viewBox:`0 0 24 24`,fill:`none`,children:[(0,m.jsx)(`path`,{d:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7`,stroke:n,strokeWidth:`1.6`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,m.jsx)(l.path,{d:`M10 11v6M14 11v6`,stroke:n,strokeWidth:`1.6`,strokeLinecap:`round`,initial:{opacity:.45},animate:{opacity:[.45,1,.45]},transition:{duration:1.4,repeat:1/0,ease:`easeInOut`}}),(0,m.jsxs)(l.g,{style:{transformOrigin:`4px 7px`},initial:{rotate:0},animate:{rotate:t?[0,-34,-34,0]:[0,-48,-48,0]},transition:{duration:1.3,times:[0,.28,.62,1],ease:`easeInOut`},children:[(0,m.jsx)(`path`,{d:`M4 7h16`,stroke:n,strokeWidth:`1.8`,strokeLinecap:`round`}),(0,m.jsx)(`path`,{d:`M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3`,stroke:n,strokeWidth:`1.6`,strokeLinecap:`round`,strokeLinejoin:`round`})]}),(0,m.jsx)(l.rect,{x:`10.5`,width:`3`,height:`3`,rx:`0.8`,fill:n,initial:t?{y:1,opacity:1}:{y:13,opacity:0},animate:t?{y:[1,12,12],opacity:[1,1,0]}:{y:[13,-2],opacity:[0,1,1]},transition:{duration:1.15,delay:t?.18:.4,ease:`easeInOut`}}),!t&&[0,1,2].map(e=>(0,m.jsx)(l.circle,{cx:12,cy:4,r:`1`,fill:`#60A5FA`,initial:{opacity:0,x:0,y:0},animate:{opacity:[0,1,0],x:[0,(e-1)*8],y:[0,-6-e*2]},transition:{duration:.7,delay:.95}},e))]})}var y={categories:{dot:`#2563EB`,bg:`#F3E8FF`,color:`#2563EB`,border:`#DDD6FE`,icon:`M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z`},sub_categories:{dot:`#C47E0A`,bg:`#fef3c7`,color:`#C47E0A`,border:`#fde68a`,icon:`M4 6h16M4 10h16M4 14h10`},id_types:{dot:`#2563eb`,bg:`#eff6ff`,color:`#2563eb`,border:`#bfdbfe`,icon:`M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1`},bio_data:{dot:`#16a34a`,bg:`#f0fdf4`,color:`#16a34a`,border:`#bbf7d0`,icon:`M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z`},sub_names:{dot:`#9333ea`,bg:`#fdf4ff`,color:`#9333ea`,border:`#e9d5ff`,icon:`M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0`},clients:{dot:`#D93B55`,bg:`#fff1f2`,color:`#D93B55`,border:`#fecdd3`,icon:`M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4`},client_projects:{dot:`#0284c7`,bg:`#f0f9ff`,color:`#0284c7`,border:`#bae6fd`,icon:`M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2`},client_payments:{dot:`#15803d`,bg:`#f0fdf4`,color:`#15803d`,border:`#bbf7d0`,icon:`M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z`},daybook_entries:{dot:`#ca8a04`,bg:`#fefce8`,color:`#ca8a04`,border:`#fef08a`,icon:`M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z`},credit_vendors:{dot:`#7C3AED`,bg:`#F3E8FF`,color:`#7C3AED`,border:`#DDD6FE`,icon:`M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5`},credit_entries:{dot:`#be185d`,bg:`#fdf2f8`,color:`#be185d`,border:`#fbcfe8`,icon:`M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z`},credit_payments:{dot:`#0f766e`,bg:`#f0fdfa`,color:`#0f766e`,border:`#99f6e4`,icon:`M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z`},workers:{dot:`#60A5FA`,bg:`#F3E8FF`,color:`#c47e0a`,border:`#fde68a`,icon:`M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z`}},b={dot:`#64748b`,bg:`#f8fafc`,color:`#64748b`,border:`#cbd5e1`,icon:`M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8`};function x(){return(0,m.jsx)(`tr`,{children:[44,160,200,100,110,120].map((e,t)=>(0,m.jsx)(`td`,{style:{padding:`14px 16px`},children:(0,m.jsx)(`div`,{style:{height:13,borderRadius:6,width:e,background:`linear-gradient(90deg,#E9EEF5 25%,#FFE0B2 50%,#E9EEF5 75%)`,backgroundSize:`400px 100%`,animation:`erp-shimmer 1.4s infinite linear`}})},t))})}var S=()=>({Authorization:`Bearer ${localStorage.getItem(`token`)}`});function C(){let[e,t]=(0,u.useState)([]),[n,i]=(0,u.useState)(!0),[d,h]=(0,u.useState)(0),[C,w]=(0,u.useState)(`all`),[T,E]=(0,u.useState)(``),[D,O]=(0,u.useState)({open:!1,type:``,id:null,label:``,all:!1,loading:!1}),k=(0,u.useRef)(!1),[A,j]=(0,u.useState)({show:!1,kind:`restore`,title:``,message:``}),M=(0,u.useRef)(null),N=(e,t,n)=>{M.current&&clearTimeout(M.current),j({show:!0,kind:e,title:t,message:n}),M.current=setTimeout(()=>j(e=>({...e,show:!1})),2e3)};(0,u.useEffect)(()=>()=>{M.current&&clearTimeout(M.current)},[]);let P=(0,u.useCallback)(async()=>{i(!0);try{let e=await a.get(`trash`,{headers:S()});t(e.data.data||[]),h(e.data.total||0)}catch{r.error(`Load Failed`,`Could not load recycle bin records`)}finally{i(!1)}},[]);(0,u.useEffect)(()=>{k.current||(k.current=!0,P())},[P]);let F=async(e,n,i)=>{E(`r-${e}-${n}`);try{await a.post(`trash/${e}/${n}/restore`,{},{headers:S()}),N(`restore`,`Restored!`,`"${i}" has been restored successfully`),t(t=>t.map(t=>t.key===e?{...t,records:t.records.filter(e=>e.id!==n),count:t.count-1}:t).filter(e=>e.count>0)),h(e=>e-1)}catch{r.error(`Restore Failed`,`Could not restore "${i}"`)}finally{E(``)}},I=async()=>{let{type:e,id:n,label:i,all:o}=D;O(e=>({...e,loading:!0}));try{o?(await a.delete(`trash/${e}/force-all`,{headers:S()}),N(`delete`,`Permanently Deleted`,`All ${i} records have been deleted`),await P()):(await a.delete(`trash/${e}/${n}/force`,{headers:S()}),N(`delete`,`Permanently Deleted`,`${i} has been permanently removed`),t(t=>t.map(t=>t.key===e?{...t,records:t.records.filter(e=>e.id!==n),count:t.count-1}:t).filter(e=>e.count>0)),h(e=>e-1))}catch{r.error(`Delete Failed`,`Could not permanently delete the record`)}finally{O({open:!1,type:``,id:null,label:``,all:!1,loading:!1}),E(``)}},L=async(e,t)=>{E(`ra-${e}`);try{await a.post(`trash/${e}/restore-all`,{},{headers:S()}),N(`restore`,`All Restored!`,`All ${t} records have been restored`),await P()}catch{r.error(`Restore Failed`,`Could not restore all records`)}finally{E(``)}},R=C===`all`?e:e.filter(e=>e.key===C),z=e.length;return(0,m.jsxs)(`div`,{className:`ERP-page`,children:[(0,m.jsx)(`style`,{children:o}),(0,m.jsx)(`style`,{children:_}),(0,m.jsxs)(`div`,{className:`ERP-hdr`,children:[(0,m.jsxs)(`div`,{className:`ERP-hdr-left`,children:[(0,m.jsxs)(`div`,{className:`ERP-eyebrow`,children:[(0,m.jsx)(`span`,{className:`ERP-eyebrow-line`}),(0,m.jsx)(`span`,{className:`ERP-eyebrow-dot`}),`System & Maintenance`]}),(0,m.jsxs)(`h1`,{className:`ERP-title MD-page-title`,children:[`Deletion `,(0,m.jsx)(`span`,{className:`ERP-title-em`,children:`Log`})]})]}),(0,m.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:(0,m.jsx)(`button`,{className:`ERP-refresh-btn${n?` spin`:``}`,onClick:P,disabled:n||!!T,title:`Refresh`,"aria-label":`Refresh`,children:(0,m.jsxs)(`svg`,{width:`13`,height:`13`,viewBox:`0 0 24 24`,fill:`none`,children:[(0,m.jsx)(`path`,{d:`M20 12a8 8 0 1 1-2.343-5.657`,stroke:`currentColor`,strokeWidth:`2.3`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,m.jsx)(`path`,{d:`M20 4v5h-5`,stroke:`currentColor`,strokeWidth:`2.3`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,m.jsx)(`circle`,{cx:`12`,cy:`12`,r:`1.5`,fill:`currentColor`})]})})})]}),(0,m.jsx)(`div`,{className:`ERP-divider`}),(0,m.jsx)(`div`,{className:`ERP-stats`,children:[{path:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,label:`Total Deleted`,val:d,c:`#2563EB`,bg:`rgba(37,99,235,0.09)`,bd:`rgba(37,99,235,0.24)`},{path:`M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z`,label:`Modules`,val:z,c:`#2870CC`,bg:`rgba(40,112,204,0.09)`,bd:`rgba(40,112,204,0.22)`},{path:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,label:`Restorable`,val:d,c:`#1E9C6A`,bg:`rgba(30,156,106,0.09)`,bd:`rgba(30,156,106,0.22)`},{path:`M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z`,label:`Permanent Risk`,val:d,c:`#D93B55`,bg:`rgba(217,59,85,0.09)`,bd:`rgba(217,59,85,0.22)`}].map((e,t)=>(0,m.jsxs)(`div`,{className:`ERP-stat RB-stat`,style:{"--rb-c":e.c,"--rb-bg":e.bg,"--rb-bd":e.bd},onMouseMove:e=>f(e,9,8),onMouseLeave:p,children:[(0,m.jsx)(`div`,{className:`RB-stat-top`}),(0,m.jsx)(`div`,{className:`RB-stat-ic`,children:(0,m.jsx)(s,{d:e.path,sz:13,c:e.c,sw:1.9})}),(0,m.jsx)(`div`,{className:`ERP-stat-label`,children:e.label}),(0,m.jsx)(`div`,{className:`ERP-stat-val`,children:e.val})]},t))}),!n&&e.length>0&&(0,m.jsx)(`div`,{style:{display:`flex`,gap:7,flexWrap:`wrap`,margin:`0 0 20px`},children:[{key:`all`,label:`All (${d})`},...e.map(e=>({key:e.key,label:`${e.label} (${e.count})`}))].map((e,t)=>(0,m.jsx)(`button`,{className:`RB-chip`,onClick:()=>w(e.key),style:{border:`1px solid ${C===e.key?`var(--ember-border,#60A5FA)`:`var(--border)`}`,background:C===e.key?`var(--ember-ghost,rgba(37,99,235,0.08))`:`var(--white)`,color:C===e.key?`var(--ember,#60A5FA)`:`var(--text-3,#555)`,animationDelay:`${t*.03}s`},children:e.label},e.key))}),(0,m.jsxs)(`div`,{className:`ERP-card`,children:[(0,m.jsx)(`div`,{className:`ERP-card-topbar`}),(0,m.jsx)(`div`,{className:`ERP-card-hdr`,children:(0,m.jsxs)(`div`,{className:`ERP-card-hdr-left`,children:[(0,m.jsx)(`div`,{className:`ERP-card-icon-wrap`,children:(0,m.jsx)(s,{d:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,sz:18,c:`var(--ember-light)`,sw:1.8})}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{className:`ERP-card-title`,children:`Deleted Records`}),(0,m.jsx)(`div`,{className:`ERP-card-sub`,children:n?`Loading…`:d===0?`Deletion log is empty`:`${d} record${d===1?``:`s`} across ${z} module${z===1?``:`s`}`})]})]})}),n&&(0,m.jsx)(`div`,{className:`ERP-tbl-scroll`,children:(0,m.jsxs)(`table`,{className:`ERP-tbl`,children:[(0,m.jsx)(`thead`,{children:(0,m.jsx)(`tr`,{children:[`No.`,`Module`,`Name`,`Details`,`Deleted By`,`Deleted At`,`Actions`].map(e=>(0,m.jsx)(`th`,{children:e},e))})}),(0,m.jsx)(`tbody`,{children:[1,2,3,4,5].map(e=>(0,m.jsx)(x,{},e))})]})}),!n&&e.length===0&&(0,m.jsxs)(`div`,{className:`ERP-empty`,children:[(0,m.jsx)(`div`,{className:`ERP-empty-icon RB-float`,children:(0,m.jsx)(s,{d:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,sz:28,c:`var(--ember-light)`,sw:1.8})}),(0,m.jsx)(`div`,{className:`ERP-empty-title`,children:`Deletion Log is Empty`}),(0,m.jsx)(`div`,{className:`ERP-empty-sub`,children:`Deleted records from all modules will appear here`})]}),(0,m.jsx)(c,{mode:`popLayout`,children:!n&&R.map((e,t)=>{let n=y[e.key]??b,r=`ra-${e.key}`;return(0,m.jsxs)(l.div,{layout:!0,initial:!1,exit:{opacity:0,scale:.94,height:0,marginBottom:0,transition:{duration:.28,ease:`easeInOut`}},className:`RB-group`,style:{"--rb-c":n.color,"--rb-bg":n.bg,"--rb-bd":n.border,animationDelay:`${t*.05}s`},children:[(0,m.jsxs)(`div`,{className:`RB-group-hdr`,children:[(0,m.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:9},children:[(0,m.jsx)(`span`,{className:`RB-group-dot`}),(0,m.jsx)(`div`,{className:`RB-group-ic`,children:(0,m.jsx)(s,{d:n.icon,sz:14,c:n.color,sw:1.8})}),(0,m.jsx)(`span`,{style:{fontSize:10.5,fontWeight:800,color:`var(--text-2,#444)`,letterSpacing:`.2px`},children:e.label}),(0,m.jsx)(`span`,{style:{background:`var(--surface)`,border:`1px solid var(--border)`,borderRadius:100,padding:`1px 8px`,fontSize:9,fontFamily:`'JetBrains Mono',monospace`,color:`var(--text-4,#888)`},children:e.count})]}),(0,m.jsxs)(`div`,{style:{display:`flex`,gap:6},children:[(0,m.jsx)(`button`,{className:`RB-group-btn restore`,disabled:!!T,onClick:()=>L(e.key,e.label),children:T===r?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`span`,{style:{width:8,height:8,borderRadius:`50%`,border:`2px solid currentColor`,borderTopColor:`transparent`,display:`inline-block`,animation:`erp-spin .6s linear infinite`}}),` Restoring…`]}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(s,{d:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,sz:10,c:`currentColor`,sw:2}),` Restore All`]})}),(0,m.jsxs)(`button`,{className:`RB-group-btn danger`,disabled:!!T,onClick:()=>O({open:!0,type:e.key,id:null,label:`all ${e.count} ${e.label}`,all:!0,loading:!1}),children:[(0,m.jsx)(s,{d:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,sz:10,c:`currentColor`,sw:2}),` Delete All`]})]})]}),(0,m.jsx)(`div`,{className:`ERP-tbl-scroll`,children:(0,m.jsxs)(`table`,{className:`ERP-tbl`,children:[(0,m.jsx)(`thead`,{children:(0,m.jsxs)(`tr`,{children:[(0,m.jsx)(`th`,{className:`ERP-center`,style:{width:44},children:`No.`}),(0,m.jsx)(`th`,{children:`Name`}),(0,m.jsx)(`th`,{children:`Details`}),(0,m.jsx)(`th`,{children:`Deleted By`}),(0,m.jsx)(`th`,{children:`Deleted At`}),(0,m.jsx)(`th`,{className:`ERP-center`,style:{width:180},children:`Actions`})]})}),(0,m.jsx)(`tbody`,{children:(0,m.jsx)(c,{mode:`popLayout`,children:e.records.map((t,r)=>{let i=`r-${e.key}-${t.id}`,a=`d-${e.key}-${t.id}`,o=t.name.trim().slice(0,2).toUpperCase()||`??`;return(0,m.jsxs)(l.tr,{layout:!0,initial:!1,exit:{opacity:0,x:24,transition:{duration:.22,ease:`easeIn`}},children:[(0,m.jsx)(`td`,{className:`ERP-t-num ERP-center`,children:r+1}),(0,m.jsx)(`td`,{children:(0,m.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:9},children:[(0,m.jsx)(`div`,{style:{width:32,height:32,borderRadius:8,background:n.bg,color:n.color,border:`1px solid ${n.border}`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:9.5,fontWeight:800,flexShrink:0},children:o}),(0,m.jsx)(`span`,{className:`ERP-t-primary`,children:t.name})]})}),(0,m.jsx)(`td`,{children:t.subtitle?(0,m.jsx)(`span`,{className:`ERP-t-desc`,children:t.subtitle}):(0,m.jsx)(`span`,{className:`ERP-t-null`,children:`—`})}),(0,m.jsx)(`td`,{children:(0,m.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[(0,m.jsx)(`span`,{style:{width:18,height:18,borderRadius:`50%`,background:n.bg,color:n.color,border:`1px solid ${n.border}`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:8,fontWeight:800,flexShrink:0},children:(t.deleted_by_name||`U`).trim().slice(0,1).toUpperCase()}),(0,m.jsx)(`span`,{style:{fontSize:10,color:`var(--text-2,#444)`,fontWeight:700},children:t.deleted_by_name||`Unknown`})]})}),(0,m.jsx)(`td`,{children:(0,m.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:5},children:[(0,m.jsx)(s,{d:`M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z`,sz:12,c:`var(--text-4,#aaa)`,sw:1.8}),(0,m.jsx)(`span`,{style:{fontSize:9.5,color:`var(--text-4,#888)`,fontFamily:`'JetBrains Mono',monospace`},children:t.deleted_at})]})}),(0,m.jsxs)(`td`,{className:`ERP-center ERP-nowrap`,children:[(0,m.jsx)(`button`,{className:`ERP-act edit`,disabled:!!T,onClick:()=>F(e.key,t.id,t.name),children:T===i?(0,m.jsx)(m.Fragment,{children:(0,m.jsx)(`span`,{style:{width:8,height:8,borderRadius:`50%`,border:`2px solid currentColor`,borderTopColor:`transparent`,display:`inline-block`,animation:`erp-spin .6s linear infinite`}})}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(s,{d:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,sz:11,c:`currentColor`,sw:1.8}),` Restore`]})}),(0,m.jsx)(`button`,{className:`ERP-act delete`,disabled:!!T,onClick:()=>O({open:!0,type:e.key,id:t.id,label:`"${t.name}"`,all:!1,loading:!1}),children:T===a?(0,m.jsx)(m.Fragment,{children:(0,m.jsx)(`span`,{style:{width:8,height:8,borderRadius:`50%`,border:`2px solid currentColor`,borderTopColor:`transparent`,display:`inline-block`,animation:`erp-spin .6s linear infinite`}})}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(s,{d:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,sz:11,c:`currentColor`,sw:1.8}),` Delete`]})})]})]},t.id)})})})]})})]},e.key)})})]}),(0,m.jsx)(c,{children:A.show&&(0,m.jsx)(l.div,{className:`RB-fx-backdrop`,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.22},onClick:()=>j(e=>({...e,show:!1})),children:(0,m.jsxs)(l.div,{className:`RB-fx-card RB-fx-${A.kind}`,initial:{opacity:0,scale:.78,y:16},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.86,y:-8},transition:{type:`spring`,stiffness:340,damping:24},onClick:e=>e.stopPropagation(),children:[(0,m.jsx)(`div`,{className:`RB-fx-icon`,children:(0,m.jsx)(v,{kind:A.kind})}),(0,m.jsx)(`div`,{className:`RB-fx-title`,children:A.title}),(0,m.jsx)(`div`,{className:`RB-fx-msg`,children:A.message}),(0,m.jsx)(l.div,{className:`RB-fx-bar`,initial:{scaleX:1},animate:{scaleX:0},transition:{duration:2,ease:`linear`}})]})})}),(0,m.jsx)(g,{open:D.open,title:`Permanent Delete`,itemName:D.label,description:`This action cannot be undone. The record will be permanently removed from the system.`,confirmLabel:`Delete Forever`,onConfirm:I,onCancel:()=>O({open:!1,type:``,id:null,label:``,all:!1,loading:!1}),loading:D.loading})]})}export{C as default};