import{C as e,D as t,b as n,v as r,x as i,y as a}from"./index-CD8rYwlu.js";import{t as o}from"./Icon-CDp_vm-r.js";import{n as s,t as c}from"./proxy-ByjA7We4.js";var l=t(e(),1),u=r(),d=`
@keyframes pa-card-in {
  0%   { opacity:0; transform:perspective(800px) rotateX(-24deg) translateY(12px) scale(.95); }
  60%  { opacity:1; transform:perspective(800px) rotateX(3deg) translateY(-2px) scale(1.012); }
  100% { opacity:1; transform:perspective(800px) rotateX(0) translateY(0) scale(1); }
}
@keyframes pa-chip-pop { 0% { opacity:0; transform:scale(.7); } 100% { opacity:1; transform:scale(1); } }
@keyframes pa-pulse    { 0%,100% { opacity:1; } 50% { opacity:.45; } }

.PA-stat {
  position:relative; overflow:hidden;
  animation:pa-card-in .5s cubic-bezier(.22,1,.36,1) both;
  transition:transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease;
}
.PA-stat:nth-child(1){ animation-delay:.02s }
.PA-stat:nth-child(2){ animation-delay:.07s }
.PA-stat:nth-child(3){ animation-delay:.12s }
.PA-stat:nth-child(4){ animation-delay:.17s }
.PA-stat:hover { transform:translateY(-3px); box-shadow:0 18px 36px -12px rgba(30,20,10,.20); }
.PA-stat-top { position:absolute; top:0; left:0; right:0; height:3px; background:var(--pa-c); }
.PA-stat-ic  { width:26px; height:26px; border-radius:8px; background:var(--pa-bg); border:1px solid var(--pa-bd); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }

.PA-chip {
  padding:5px 14px; border-radius:100px; cursor:pointer; font-family:'JetBrains Mono',monospace;
  font-size:9.5px; font-weight:700; transition:transform .16s ease, box-shadow .16s ease, background .16s, border-color .16s, color .16s;
  animation:pa-chip-pop .3s ease both;
}
.PA-chip:hover { transform:translateY(-2px); box-shadow:0 6px 14px rgba(30,20,10,.10); }
.PA-chip:active { transform:translateY(0) scale(.96); }

.PA-pill {
  display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px;
  font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; border:1px solid; white-space:nowrap;
}
.PA-pill-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
.PA-pill.pending  { background:rgba(245,166,35,.10); color:#C47E0A; border-color:rgba(245,166,35,.30); }
.PA-pill.pending .PA-pill-dot { animation:pa-pulse 1.6s ease-in-out infinite; }
.PA-pill.approved { background:rgba(30,156,106,.10); color:#1E9C6A; border-color:rgba(30,156,106,.28); }
.PA-pill.rejected { background:rgba(217,59,85,.10); color:#D93B55; border-color:rgba(217,59,85,.26); }
.PA-pill.expired  { background:rgba(100,116,139,.10); color:#64748b; border-color:rgba(100,116,139,.26); }

.PA-role {
  display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:8px;
  font-size:9.5px; font-weight:800; letter-spacing:.2px; border:1px solid;
}
.PA-role.user        { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
.PA-role.admin       { background:#fdf4ff; color:#9333ea; border-color:#e9d5ff; }
.PA-role.super_admin { background:rgba(255,107,0,.09); color:#D8A94E; border-color:rgba(216,169,78,.4); }

.PA-act {
  display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:8px;
  font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; cursor:pointer; border:1px solid; transition:all .18s;
}
.PA-act.approve { background:rgba(30,156,106,.08); color:#1E9C6A; border-color:rgba(30,156,106,.24); }
.PA-act.approve:hover:not(:disabled) { background:#1E9C6A; color:#fff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,156,106,.3); }
.PA-act.reject { background:rgba(217,59,85,.08); color:#D93B55; border-color:rgba(217,59,85,.22); }
.PA-act.reject:hover:not(:disabled) { background:#D93B55; color:#fff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(217,59,85,.3); }
.PA-act:disabled { opacity:.5; cursor:not-allowed; }
.PA-act + .PA-act { margin-left: 6px; }

.PA-modal-backdrop {
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center; padding:20px;
  background:rgba(10,21,48,.44); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
.PA-modal-card {
  position:relative; width:100%; max-width:400px; padding:26px 24px 22px; border-radius:18px;
  background:var(--white); overflow:hidden;
  box-shadow:0 24px 60px -18px rgba(217,59,85,.3), 0 0 0 1px rgba(217,59,85,.1);
}
.PA-modal-title { font-size:15px; font-weight:800; color:var(--text-1,#1a1a1a); margin-bottom:6px; letter-spacing:.1px; }
.PA-modal-sub   { font-size:11.5px; color:var(--text-3,#666); line-height:1.55; margin-bottom:16px; }
.PA-modal-textarea {
  width:100%; min-height:76px; resize:vertical; border-radius:10px; border:1.5px solid var(--border);
  padding:10px 12px; font-family:var(--font-body); font-size:12px; color:var(--text-1,#222);
  outline:none; transition:border-color .16s; background:var(--surface,#fafafa);
}
.PA-modal-textarea:focus { border-color:#D93B55; }
.PA-modal-actions { display:flex; gap:10px; margin-top:18px; }
.PA-modal-btn {
  flex:1; padding:10px 14px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer;
  border:1.5px solid; transition:all .16s;
}
.PA-modal-btn.cancel { background:transparent; color:var(--text-3,#666); border-color:var(--border); }
.PA-modal-btn.cancel:hover { background:var(--surface,#f5f5f5); }
.PA-modal-btn.confirm { background:#D93B55; color:#fff; border-color:#D93B55; }
.PA-modal-btn.confirm:hover:not(:disabled) { background:#c22e47; }
.PA-modal-btn:disabled { opacity:.6; cursor:not-allowed; }

@media(prefers-reduced-motion: reduce){
  .PA-stat, .PA-chip { animation:none !important; }
  .PA-stat { transition:none !important; }
}
`,f={user:`User`,admin:`Admin`,super_admin:`Super Admin`};function p(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleString(void 0,{day:`2-digit`,month:`short`,hour:`2-digit`,minute:`2-digit`})}function m(e){return e.status===`pending`?new Date(e.expires_at).getTime()<Date.now():!1}function h(){return(0,u.jsx)(`tr`,{children:[44,190,200,100,100,120,160].map((e,t)=>(0,u.jsx)(`td`,{style:{padding:`14px 16px`},children:(0,u.jsx)(`div`,{style:{height:13,borderRadius:6,width:e,background:`linear-gradient(90deg,#FFF3E0 25%,#FFE0B2 50%,#FFF3E0 75%)`,backgroundSize:`400px 100%`,animation:`erp-shimmer 1.4s infinite linear`}})},t))})}var g=()=>({Authorization:`Bearer ${localStorage.getItem(`token`)}`});function _(){let[e,t]=(0,l.useState)([]),[r,_]=(0,l.useState)(!0),[v,y]=(0,l.useState)(`pending`),[b,x]=(0,l.useState)(``),[S,C]=(0,l.useState)({open:!1,id:null,name:``,reason:``,loading:!1}),w=(0,l.useRef)(!1),T=(0,l.useCallback)(async(e=v)=>{_(!0);try{t((await i.get(`approval-requests?status=${e}`,{headers:g()})).data.data||[])}catch{n.error(`Load Failed`,`Could not load approval requests`)}finally{_(!1)}},[v]);(0,l.useEffect)(()=>{if(!w.current){w.current=!0,T(v);return}T(v)},[v]);let E=async e=>{x(`a-${e.id}`);try{await i.post(`approval-requests/${e.id}/approve`,{},{headers:g()}),n.success(`Approved`,`${e.name}'s account has been created`),t(t=>t.filter(t=>t.id!==e.id))}catch(t){n.error(`Approve Failed`,t?.response?.data?.message||`Could not approve ${e.name}`)}finally{x(``)}},D=e=>{C({open:!0,id:e.id,name:e.name,reason:``,loading:!1})},O=async()=>{let{id:e,name:r,reason:a}=S;if(e){C(e=>({...e,loading:!0}));try{await i.post(`approval-requests/${e}/reject`,{reason:a},{headers:g()}),n.success(`Rejected`,`${r}'s request has been rejected`),t(t=>t.filter(t=>t.id!==e))}catch(e){n.error(`Reject Failed`,e?.response?.data?.message||`Could not reject ${r}`)}finally{C({open:!1,id:null,name:``,reason:``,loading:!1})}}},k=e.filter(e=>e.status===`pending`&&!m(e)).length,A=[{path:`M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z`,label:`Awaiting Decision`,val:v===`pending`?k:e.filter(e=>e.status===`pending`).length,c:`#F5A623`,bg:`rgba(245,166,35,0.1)`,bd:`rgba(245,166,35,0.28)`},{path:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,label:`Approved`,val:e.filter(e=>e.status===`approved`).length,c:`#1E9C6A`,bg:`rgba(30,156,106,0.09)`,bd:`rgba(30,156,106,0.22)`},{path:`M6 18L18 6M6 6l12 12`,label:`Rejected`,val:e.filter(e=>e.status===`rejected`).length,c:`#D93B55`,bg:`rgba(217,59,85,0.09)`,bd:`rgba(217,59,85,0.22)`},{path:`M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0`,label:`Total Requests`,val:e.length,c:`#0A1530`,bg:`rgba(10,21,48,0.06)`,bd:`rgba(10,21,48,0.16)`}];return(0,u.jsxs)(`div`,{className:`ERP-page`,children:[(0,u.jsx)(`style`,{children:a}),(0,u.jsx)(`style`,{children:d}),(0,u.jsxs)(`div`,{className:`ERP-hdr`,children:[(0,u.jsxs)(`div`,{className:`ERP-hdr-left`,children:[(0,u.jsxs)(`div`,{className:`ERP-eyebrow`,children:[(0,u.jsx)(`span`,{className:`ERP-eyebrow-line`}),(0,u.jsx)(`span`,{className:`ERP-eyebrow-dot`}),`System & Maintenance`]}),(0,u.jsxs)(`h1`,{className:`ERP-title MD-page-title`,children:[`Pending `,(0,u.jsx)(`span`,{className:`ERP-title-em`,children:`Approvals`})]})]}),(0,u.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:(0,u.jsx)(`button`,{className:`ERP-refresh-btn${r?` spin`:``}`,onClick:()=>T(v),disabled:r||!!b,title:`Refresh`,"aria-label":`Refresh`,children:(0,u.jsxs)(`svg`,{width:`13`,height:`13`,viewBox:`0 0 24 24`,fill:`none`,children:[(0,u.jsx)(`path`,{d:`M20 12a8 8 0 1 1-2.343-5.657`,stroke:`currentColor`,strokeWidth:`2.3`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,u.jsx)(`path`,{d:`M20 4v5h-5`,stroke:`currentColor`,strokeWidth:`2.3`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,u.jsx)(`circle`,{cx:`12`,cy:`12`,r:`1.5`,fill:`currentColor`})]})})})]}),(0,u.jsx)(`div`,{className:`ERP-divider`}),(0,u.jsx)(`div`,{className:`ERP-stats`,children:A.map((e,t)=>(0,u.jsxs)(`div`,{className:`ERP-stat PA-stat`,style:{"--pa-c":e.c,"--pa-bg":e.bg,"--pa-bd":e.bd},children:[(0,u.jsx)(`div`,{className:`PA-stat-top`}),(0,u.jsx)(`div`,{className:`PA-stat-ic`,children:(0,u.jsx)(o,{d:e.path,sz:13,c:e.c,sw:1.9})}),(0,u.jsx)(`div`,{className:`ERP-stat-label`,children:e.label}),(0,u.jsx)(`div`,{className:`ERP-stat-val`,children:e.val})]},t))}),(0,u.jsx)(`div`,{style:{display:`flex`,gap:7,flexWrap:`wrap`,margin:`0 0 20px`},children:[{key:`pending`,label:`Pending`},{key:`approved`,label:`Approved`},{key:`rejected`,label:`Rejected`},{key:`all`,label:`All`}].map((e,t)=>(0,u.jsx)(`button`,{className:`PA-chip`,onClick:()=>y(e.key),style:{border:`1px solid ${v===e.key?`var(--ember-border,#f5a623)`:`var(--border)`}`,background:v===e.key?`var(--ember-ghost,rgba(255,107,0,0.08))`:`var(--white)`,color:v===e.key?`var(--ember,#f5a623)`:`var(--text-3,#555)`,animationDelay:`${t*.03}s`},children:e.label},e.key))}),(0,u.jsxs)(`div`,{className:`ERP-card`,children:[(0,u.jsx)(`div`,{className:`ERP-card-topbar`}),(0,u.jsx)(`div`,{className:`ERP-card-hdr`,children:(0,u.jsxs)(`div`,{className:`ERP-card-hdr-left`,children:[(0,u.jsx)(`div`,{className:`ERP-card-icon-wrap`,children:(0,u.jsx)(o,{d:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,sz:18,c:`var(--ember-light)`,sw:1.8})}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`div`,{className:`ERP-card-title`,children:`Account Requests`}),(0,u.jsx)(`div`,{className:`ERP-card-sub`,children:r?`Loading…`:e.length===0?`Nothing here right now`:`${e.length} request${e.length===1?``:`s`}`})]})]})}),r&&(0,u.jsx)(`div`,{className:`ERP-tbl-scroll`,children:(0,u.jsxs)(`table`,{className:`ERP-tbl`,children:[(0,u.jsx)(`thead`,{children:(0,u.jsx)(`tr`,{children:[`No.`,`Requester`,`Role`,`Status`,`Requested`,`Expires`,`Actions`].map(e=>(0,u.jsx)(`th`,{children:e},e))})}),(0,u.jsx)(`tbody`,{children:[1,2,3,4].map(e=>(0,u.jsx)(h,{},e))})]})}),!r&&e.length===0&&(0,u.jsxs)(`div`,{className:`ERP-empty`,children:[(0,u.jsx)(`div`,{className:`ERP-empty-icon`,children:(0,u.jsx)(o,{d:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,sz:28,c:`var(--ember-light)`,sw:1.8})}),(0,u.jsx)(`div`,{className:`ERP-empty-title`,children:v===`pending`?`No Pending Requests`:v===`approved`?`No Approved Requests Yet`:v===`rejected`?`No Rejected Requests`:`No Requests Yet`}),(0,u.jsx)(`div`,{className:`ERP-empty-sub`,children:v===`pending`?`New registrations for User, Admin & Super Admin will appear here for your review`:`Nothing to show for this filter`})]}),!r&&e.length>0&&(0,u.jsx)(`div`,{className:`ERP-tbl-scroll`,children:(0,u.jsxs)(`table`,{className:`ERP-tbl`,children:[(0,u.jsx)(`thead`,{children:(0,u.jsxs)(`tr`,{children:[(0,u.jsx)(`th`,{className:`ERP-center`,style:{width:44},children:`No.`}),(0,u.jsx)(`th`,{children:`Requester`}),(0,u.jsx)(`th`,{children:`Role`}),(0,u.jsx)(`th`,{children:`Status`}),(0,u.jsx)(`th`,{children:`Requested`}),(0,u.jsx)(`th`,{children:`Expires`}),(0,u.jsx)(`th`,{className:`ERP-center`,style:{width:190},children:`Actions`})]})}),(0,u.jsx)(`tbody`,{children:(0,u.jsx)(s,{mode:`popLayout`,children:e.map((e,t)=>{let n=m(e),r=n?`expired`:e.status,i=e.name.trim().slice(0,2).toUpperCase()||`??`,a=`a-${e.id}`,s=e.status===`pending`&&!n;return(0,u.jsxs)(c.tr,{layout:!0,initial:!1,exit:{opacity:0,x:24,transition:{duration:.22,ease:`easeIn`}},children:[(0,u.jsx)(`td`,{className:`ERP-t-num ERP-center`,children:t+1}),(0,u.jsx)(`td`,{children:(0,u.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:9},children:[(0,u.jsx)(`div`,{style:{width:32,height:32,borderRadius:8,background:`rgba(10,21,48,.06)`,color:`#0A1530`,border:`1px solid rgba(10,21,48,.14)`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:9.5,fontWeight:800,flexShrink:0},children:i}),(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:1},children:[(0,u.jsx)(`span`,{className:`ERP-t-primary`,children:e.name}),(0,u.jsx)(`span`,{style:{fontSize:9.5,color:`var(--text-4,#888)`,fontFamily:`'JetBrains Mono',monospace`},children:e.email})]})]})}),(0,u.jsx)(`td`,{children:(0,u.jsx)(`span`,{className:`PA-role ${e.role}`,children:f[e.role]||e.role})}),(0,u.jsxs)(`td`,{children:[(0,u.jsxs)(`span`,{className:`PA-pill ${r}`,children:[(0,u.jsx)(`span`,{className:`PA-pill-dot`}),r===`expired`?`Expired`:r===`pending`?`Pending`:r===`approved`?`Approved`:`Rejected`]}),e.status===`rejected`&&e.reject_reason&&(0,u.jsxs)(`div`,{style:{fontSize:9,color:`var(--text-4,#999)`,marginTop:4,maxWidth:180},children:[`“`,e.reject_reason,`”`]})]}),(0,u.jsx)(`td`,{children:(0,u.jsx)(`span`,{style:{fontSize:9.5,color:`var(--text-4,#888)`,fontFamily:`'JetBrains Mono',monospace`},children:p(e.created_at)})}),(0,u.jsx)(`td`,{children:(0,u.jsx)(`span`,{style:{fontSize:9.5,color:n?`#D93B55`:`var(--text-4,#888)`,fontFamily:`'JetBrains Mono',monospace`},children:e.status===`pending`?p(e.expires_at):`—`})}),(0,u.jsx)(`td`,{className:`ERP-center ERP-nowrap`,children:s?(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(`button`,{className:`PA-act approve`,disabled:!!b,onClick:()=>E(e),children:b===a?(0,u.jsx)(`span`,{style:{width:8,height:8,borderRadius:`50%`,border:`2px solid currentColor`,borderTopColor:`transparent`,display:`inline-block`,animation:`erp-spin .6s linear infinite`}}):(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(o,{d:`M5 13l4 4L19 7`,sz:10,c:`currentColor`,sw:2}),` Approve`]})}),(0,u.jsxs)(`button`,{className:`PA-act reject`,disabled:!!b,onClick:()=>D(e),children:[(0,u.jsx)(o,{d:`M6 18L18 6M6 6l12 12`,sz:10,c:`currentColor`,sw:2}),` Reject`]})]}):(0,u.jsx)(`span`,{style:{fontSize:9,color:`var(--text-4,#aaa)`},children:e.decided_by?`by ${e.decided_by}`:`—`})})]},e.id)})})})]})})]}),(0,u.jsx)(s,{children:S.open&&(0,u.jsx)(c.div,{className:`PA-modal-backdrop`,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},onClick:()=>!S.loading&&C({open:!1,id:null,name:``,reason:``,loading:!1}),children:(0,u.jsxs)(c.div,{className:`PA-modal-card`,initial:{opacity:0,scale:.9,y:14},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.92,y:-6},transition:{type:`spring`,stiffness:340,damping:26},onClick:e=>e.stopPropagation(),children:[(0,u.jsxs)(`div`,{className:`PA-modal-title`,children:[`Reject `,S.name,`'s request?`]}),(0,u.jsx)(`div`,{className:`PA-modal-sub`,children:`This request will be closed and no account will be created. You can optionally add a reason (not shared with the requester automatically).`}),(0,u.jsx)(`textarea`,{className:`PA-modal-textarea`,placeholder:`Reason (optional)…`,value:S.reason,onChange:e=>C(t=>({...t,reason:e.target.value}))}),(0,u.jsxs)(`div`,{className:`PA-modal-actions`,children:[(0,u.jsx)(`button`,{className:`PA-modal-btn cancel`,disabled:S.loading,onClick:()=>C({open:!1,id:null,name:``,reason:``,loading:!1}),children:`Cancel`}),(0,u.jsx)(`button`,{className:`PA-modal-btn confirm`,disabled:S.loading,onClick:O,children:S.loading?`Rejecting…`:`Reject Request`})]})]})})})]})}export{_ as default};