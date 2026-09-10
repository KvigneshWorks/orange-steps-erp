import{C as e,D as t,S as n,a as r,b as i,i as a,n as o,o as s,r as c,s as l,t as u,v as d,x as f,y as p}from"./index-9Lh4Nivu.js";import{t as m}from"./ConfirmDeleteModal-tyJvQfS0.js";import{t as h}from"./DuplicateWarningModal-LLvS5M8w.js";import{t as g}from"./CalendarDD-BN59z7Pr.js";import{t as _}from"./PageOpenIntro-Du5fXwHg.js";import{t as v}from"./Pagination-B_cVACI3.js";import{t as y}from"./CreatorBadge-D6HGLrdH.js";var b=t(e(),1),x=n(),S=d(),C={clear:{label:`Clear`,color:`#10b981`,bg:`#ecfdf5`,border:`#a7f3d0`},pending:{label:`Pending`,color:`#3b82f6`,bg:`#eff6ff`,border:`#bfdbfe`},partial:{label:`Partial`,color:`#f59e0b`,bg:`#fffbeb`,border:`#fde68a`},overdue:{label:`Overdue`,color:`#D93B55`,bg:`#fef2f2`,border:`#fecaca`}},w=[`Cash`,`UPI`,`NEFT`,`Cheque`,`Bank Transfer`,`Others`],T={primary:`#D93B55`,light:`#fef2f2`,border:`#fecaca`,mid:`#D93B55`,gradient:`linear-gradient(135deg, #D93B55, #b91c1c)`},E={primary:`#0d9488`,light:`#f0fdfa`,border:`#99f6e4`,mid:`#14b8a6`,gradient:`linear-gradient(135deg, #0d9488, #0f766e)`},D=()=>({Authorization:`Bearer ${localStorage.getItem(`token`)}`}),O=e=>`₹${Math.round(Number(e)||0).toLocaleString(`en-IN`,{minimumFractionDigits:0,maximumFractionDigits:0})}`,k=e=>e?new Date(e+`T00:00:00`).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`}):`—`,A=()=>new Date().toISOString().split(`T`)[0];function j(e,t){let n=e?.response?.data,r=n?.errors;if(r&&typeof r==`object`){let e=Object.keys(r)[0],t=e?r[e]:null,n=Array.isArray(t)?t[0]:t;if(n)return String(n)}return n?.message||t}function M(e){let t=[{bg:`#fef3c7`,color:`#C47E0A`,border:`#fde68a`},{bg:`#d1fae5`,color:`#1E9C6A`,border:`#6ee7b7`},{bg:`#dbeafe`,color:`#2563eb`,border:`#93c5fd`},{bg:`#fce7f3`,color:`#db2777`,border:`#f9a8d4`},{bg:`#ede9fe`,color:`#7c3aed`,border:`#c4b5fd`},{bg:`#cffafe`,color:`#0891b2`,border:`#67e8f9`}],n=0;for(let t=0;t<e.length;t++)n=n*31+e.charCodeAt(t)&4294967295;return t[Math.abs(n)%t.length]}function N({value:e}){let[t,n]=(0,b.useState)(0),r=(0,b.useRef)(null),i=(0,b.useRef)(0),a=(0,b.useRef)(0);return(0,b.useEffect)(()=>{let t=a.current,o=e;r.current=null;let s=e=>{r.current||=e;let c=Math.min((e-r.current)/900,1),l=c===1?1:1-2**(-10*c);n(Math.round(t+(o-t)*l)),c<1?i.current=requestAnimationFrame(s):a.current=o};return i.current=requestAnimationFrame(s),()=>cancelAnimationFrame(i.current)},[e]),(0,S.jsx)(S.Fragment,{children:t.toLocaleString(`en-IN`)})}var P={plus:`M12 5v14m-7-7h14`,x:`M6 18L18 6M6 6l12 12`,check:`M5 13l4 4L19 7`,trash:`M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16`,cash:`M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z`,search:`M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z`,warn:`M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z`,circle:`M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`,inbox:`M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4`,list:`M4 6h16M4 10h16M4 14h16M4 18h16`,user:`M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z`,up:`M5 10l7-7m0 0l7 7m-7-7v18`,down:`M19 14l-7 7m0 0l-7-7m7 7V3`,scale:`M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3`,edit:`M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z`,book:`M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253`,sync:`M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15`,tag:`M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z`,chevron:`M19 9l-7 7-7-7`,receipt:`M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2`,wallet:`M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z`,arrow:`M17 8l4 4m0 0l-4 4m4-4H3`,close:`M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z`,layers:`M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5`,client:`M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z`,building:`M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4`},F=({n:e,sz:t=16,c:n=`currentColor`})=>(0,S.jsx)(`svg`,{width:t,height:t,viewBox:`0 0 24 24`,fill:`none`,stroke:n,strokeWidth:1.8,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:P[e]||P.tag})});function I({options:e,value:t,onChange:n,placeholder:r,disabled:i=!1,emptyMsg:s=`No options`,label:l,required:d,accent:f=`var(--ember-mid,#3B82F6)`}){let[p,m]=(0,b.useState)(!1);(0,b.useEffect)(()=>{if(p)return o(),()=>u()},[p]);let[h,g]=(0,b.useState)(``),[_,v]=(0,b.useState)({}),y=(0,b.useRef)(null),C=(0,b.useRef)(null),w=(0,b.useRef)(null),T=a(p,m);c(p,m,C,y);let E=e.filter(e=>e.label.toLowerCase().includes(h.toLowerCase())||(e.sub||``).toLowerCase().includes(h.toLowerCase())),D=e.find(e=>e.value===t);(0,b.useEffect)(()=>{if(!p)return;let e=e=>{let t=e.target;y.current?.contains(t)||C.current?.contains(t)||(m(!1),g(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[p]),(0,b.useEffect)(()=>{if(!p)return;let e=e=>{C.current?.contains(e.target)||(m(!1),g(``))};return window.addEventListener(`scroll`,e,!0),window.addEventListener(`resize`,e),()=>{window.removeEventListener(`scroll`,e,!0),window.removeEventListener(`resize`,e)}},[p]),(0,b.useEffect)(()=>{p&&w.current&&setTimeout(()=>w.current?.focus(),40)},[p]);let O=()=>{if(!y.current)return;let t=y.current.getBoundingClientRect(),n=C.current?.offsetHeight||Math.min(222,e.length*28+96),r=window.innerHeight-t.bottom-8,i=t.top-8,a;a=n<=r||r>=i?Math.min(t.bottom+4,window.innerHeight-n-8):t.top-n-4,a=Math.max(8,a),v({position:`fixed`,left:t.left,top:a,width:t.width,zIndex:99999,maxHeight:window.innerHeight-16,overflowY:`auto`,borderRadius:12})};(0,b.useLayoutEffect)(()=>{if(!p)return;O();let e=requestAnimationFrame(O);return()=>cancelAnimationFrame(e)},[p]);let k=e=>{n(e),m(!1),g(``)},A=()=>{i||(p||O(),m(e=>!e))},j=p?(0,x.createPortal)((0,S.jsxs)(`div`,{ref:C,className:`CM3-sdd-panel`,style:_,children:[(0,S.jsxs)(`div`,{className:`CM3-sdd-search`,children:[(0,S.jsxs)(`svg`,{width:14,height:14,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--text-4,#9ca3af)`,strokeWidth:2,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,S.jsx)(`path`,{d:`m21 21-4.35-4.35`})]}),(0,S.jsx)(`input`,{ref:w,value:h,onChange:e=>g(e.target.value),placeholder:`Type to search…`,className:`CM3-sdd-inp`}),h&&(0,S.jsx)(`button`,{onClick:()=>{g(``),w.current?.focus()},className:`CM3-sdd-clr`,children:(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M18 6 6 18M6 6l12 12`})})})]}),(0,S.jsxs)(`div`,{className:`CM3-sdd-list`,children:[t&&!h&&(0,S.jsxs)(`div`,{onClick:()=>k(``),role:`option`,tabIndex:-1,"aria-selected":!1,className:`CM3-sdd-item CM3-sdd-clear`,children:[(0,S.jsx)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M18 6 6 18M6 6l12 12`})}),`Clear selection`]}),E.length===0?(0,S.jsxs)(`div`,{className:`CM3-sdd-empty`,children:[(0,S.jsxs)(`svg`,{width:20,height:20,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--text-4,#9ca3af)`,strokeWidth:1.5,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,S.jsx)(`path`,{d:`m21 21-4.35-4.35`})]}),(0,S.jsx)(`span`,{children:h?`No results for "${h}"`:s})]}):E.map(e=>{let n=t===e.value;return(0,S.jsxs)(`div`,{onClick:()=>k(e.value),role:`option`,tabIndex:-1,"aria-selected":n,className:`CM3-sdd-item${n?` selected`:``}`,children:[(0,S.jsx)(`div`,{className:`CM3-sdd-av`,style:{background:n?f+`20`:`var(--surface,#f2f3f5)`,color:n?f:`var(--text-3,#6b6b6b)`,borderColor:n?f+`40`:`transparent`},children:e.label.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{className:`CM3-sdd-item-text`,children:[(0,S.jsx)(`div`,{className:`CM3-sdd-item-label`,children:e.label}),e.sub&&(0,S.jsx)(`div`,{className:`CM3-sdd-sub`,children:e.sub})]}),n&&(0,S.jsx)(`div`,{className:`CM3-sdd-check`,style:{color:f},children:(0,S.jsx)(`svg`,{width:14,height:14,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})})]},e.value)})]}),(0,S.jsxs)(`div`,{className:`CM3-sdd-footer`,children:[(0,S.jsx)(`span`,{children:E.length===e.length?`${e.length} options`:`${E.length} of ${e.length}`}),t&&(0,S.jsx)(`span`,{style:{color:f,fontWeight:800},children:`1 selected`})]})]}),document.body):null;return(0,S.jsx)(S.Fragment,{children:(0,S.jsxs)(`div`,{style:{opacity:i?.5:1,pointerEvents:i?`none`:`auto`},children:[l&&(0,S.jsxs)(`div`,{className:`CM3-field-label`,children:[l,d&&(0,S.jsx)(`span`,{className:`CM3-req`,children:`*`})]}),(0,S.jsxs)(`button`,{type:`button`,ref:y,onClick:A,onKeyDown:T,className:`CM3-sdd-trigger${p?` open`:``}${D?` has-val`:``}`,style:{"--sdd-accent":f},children:[D&&(0,S.jsx)(`div`,{className:`CM3-sdd-trig-av`,style:{background:f+`18`,color:f,borderColor:f+`33`},children:D.label.slice(0,2).toUpperCase()}),(0,S.jsxs)(`span`,{className:`CM3-sdd-val${D?``:` ph`}`,children:[D?D.label:r,D?.sub&&(0,S.jsxs)(`span`,{className:`CM3-sdd-val-sub`,children:[` · `,D.sub]})]}),(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:p?f:`var(--text-4,#9ca3af)`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,style:{flexShrink:0,transition:`transform 0.22s`,transform:p?`rotate(180deg)`:`none`},children:(0,S.jsx)(`path`,{d:`M6 9l6 6 6-6`})})]}),j]})})}function L({value:e,onChange:t,options:n,placeholder:r,accent:i=E.primary}){let[a,s]=(0,b.useState)(!1);(0,b.useEffect)(()=>{if(a)return o(),()=>u()},[a]);let[l,d]=(0,b.useState)(``),[f,p]=(0,b.useState)({}),m=(0,b.useRef)(null),h=(0,b.useRef)(null),g=(0,b.useRef)(null);c(a,s,h,g);let _=l.trim()?n.filter(e=>e.label.toLowerCase().includes(l.toLowerCase())):n;(0,b.useEffect)(()=>{if(!a)return;let e=e=>{h.current?.contains(e.target)||m.current?.contains(e.target)||(s(!1),d(``))};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[a]),(0,b.useEffect)(()=>{if(!a)return;let e=()=>{s(!1),d(``)};return window.addEventListener(`scroll`,e,!0),window.addEventListener(`resize`,e),()=>{window.removeEventListener(`scroll`,e,!0),window.removeEventListener(`resize`,e)}},[a]);let v=()=>{if(!m.current)return;let e=m.current.getBoundingClientRect(),t=window.innerHeight-e.bottom<220&&e.top>220;p({position:`fixed`,left:e.left,width:e.width,zIndex:99999,...t?{bottom:window.innerHeight-e.top+2,borderRadius:`12px 12px 0 0`}:{top:e.bottom+2,borderRadius:`0 0 12px 12px`}})},y=()=>{v(),s(!0)},C=e=>{t(e),d(``),s(!1)},w=()=>{t(``),d(``),g.current?.focus()},T=a?(0,x.createPortal)((0,S.jsxs)(`div`,{ref:h,style:{...f,background:`#fff`,border:`1.5px solid ${i}30`,boxShadow:`0 8px 28px rgba(0,0,0,0.10)`,overflow:`hidden`},children:[(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8,padding:`7px 12px`,borderBottom:`1px solid #E9EEF5`,background:`#F8FAFC`},children:[(0,S.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`#94a3b8`,strokeWidth:2,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,S.jsx)(`path`,{d:`m21 21-4.35-4.35`})]}),(0,S.jsx)(`input`,{autoFocus:!0,value:l,onChange:e=>d(e.target.value),placeholder:`Search or type any name…`,style:{flex:1,border:`none`,outline:`none`,background:`transparent`,fontSize:11,color:`var(--text-1,#0F172A)`,fontFamily:`var(--font-body)`}}),l&&(0,S.jsx)(`button`,{type:`button`,onClick:()=>d(``),style:{background:`none`,border:`none`,cursor:`pointer`,color:`#94a3b8`,display:`flex`,padding:2,borderRadius:4},children:(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M18 6 6 18M6 6l12 12`})})})]}),(0,S.jsxs)(`div`,{style:{maxHeight:200,overflowY:`auto`,overscrollBehavior:`contain`},children:[l.trim()&&!n.find(e=>e.label.toLowerCase()===l.toLowerCase())&&(0,S.jsxs)(`div`,{onClick:()=>C(l.trim()),role:`option`,tabIndex:-1,"aria-selected":!1,style:{display:`flex`,alignItems:`center`,gap:10,padding:`8px 14px`,cursor:`pointer`,borderBottom:`1px solid #F1F5F9`,background:`#F8FAFC`},children:[(0,S.jsx)(`div`,{style:{width:24,height:24,borderRadius:6,background:i+`18`,color:i,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:12.5,fontWeight:800,flexShrink:0},children:`+`}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{style:{fontSize:11,fontWeight:700,color:i},children:[`Use "`,l.trim(),`"`]}),(0,S.jsx)(`div`,{style:{fontSize:8.5,color:`#94a3b8`,letterSpacing:`0.04em`},children:`Save as new client name`})]})]}),_.length===0&&!l.trim()?(0,S.jsx)(`div`,{style:{padding:`16px 14px`,textAlign:`center`,fontSize:10.5,color:`#94a3b8`},children:`No clients found — type any name above`}):_.map((t,n)=>{let r=e===t.label,a=M(t.label);return(0,S.jsxs)(`div`,{onClick:()=>C(t.label),role:`option`,tabIndex:-1,"aria-selected":r,style:{display:`flex`,alignItems:`center`,gap:10,padding:`8px 14px`,cursor:`pointer`,background:r?i+`08`:void 0,borderBottom:`1px solid #F1F5F9`,transition:`background .1s`},children:[(0,S.jsx)(`div`,{style:{width:26,height:26,borderRadius:7,background:a.bg,color:a.color,border:`1px solid ${a.border}`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:8,fontWeight:800,flexShrink:0},children:t.label.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,S.jsx)(`div`,{style:{fontSize:11,fontWeight:r?800:600,color:r?i:`var(--text-1,#0F172A)`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:t.label}),t.sub&&(0,S.jsx)(`div`,{style:{fontSize:8.5,color:`#94a3b8`,textTransform:`uppercase`,letterSpacing:`0.04em`},children:t.sub})]}),r&&(0,S.jsx)(`svg`,{style:{color:i,flexShrink:0},width:14,height:14,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})]},n)})]}),(0,S.jsxs)(`div`,{style:{padding:`4px 12px`,background:`#F8FAFC`,borderTop:`1px solid #E9EEF5`,fontSize:8,color:`#94a3b8`,fontFamily:`var(--font-mono)`,letterSpacing:`0.05em`,display:`flex`,justifyContent:`space-between`},children:[(0,S.jsxs)(`span`,{children:[_.length,` client`,_.length===1?``:`s`]}),e&&(0,S.jsxs)(`span`,{style:{color:i,fontWeight:800},children:[`✓ `,e]})]})]}),document.body):null;return(0,S.jsxs)(`div`,{ref:m,style:{position:`relative`},children:[(0,S.jsxs)(`div`,{style:{position:`relative`},children:[(0,S.jsx)(`div`,{style:{position:`absolute`,left:10,top:`50%`,transform:`translateY(-50%)`,pointerEvents:`none`,color:e?i:`#94a3b8`},children:(0,S.jsxs)(`svg`,{width:14,height:14,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,children:[(0,S.jsx)(`path`,{d:`M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2`}),(0,S.jsx)(`circle`,{cx:`12`,cy:`7`,r:`4`})]})}),(0,S.jsx)(`input`,{ref:g,type:`text`,className:`CM3-input`,value:e,onFocus:y,onChange:e=>{t(e.target.value),v(),s(!0)},placeholder:r||`Search or type client / site name…`,autoComplete:`off`,style:{paddingLeft:32,paddingRight:e?32:12,borderColor:a?i:void 0,boxShadow:a?`0 0 0 3px ${i}18`:void 0,transition:`border-color .18s, box-shadow .18s`}}),e&&(0,S.jsx)(`button`,{type:`button`,onClick:w,style:{position:`absolute`,right:8,top:`50%`,transform:`translateY(-50%)`,background:`none`,border:`none`,cursor:`pointer`,color:`#94a3b8`,display:`flex`,padding:3,borderRadius:4},children:(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M18 6 6 18M6 6l12 12`})})})]}),T]})}var ee=`
/* ── PAGE ── */
.CM3-page {
    font-family: var(--font-body, 'Space Grotesk', sans-serif);
    background: var(--surface, #F2F3F5);
    min-height: 100vh;
    padding: 32px 36px;
    animation: erp-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both;
    position: relative; overflow-x: hidden;
    display: flex; flex-direction: column;
}
@media (max-width: 768px) { .CM3-page { padding: 18px 14px; } }

/* ── SYNC PILL ── */
.CM3-sync-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    background: rgba(13,148,136,0.08); border: 1px solid rgba(13,148,136,0.2);
    border-radius: 100px;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 8px; font-weight: 800;
    color: #0d9488; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s;
}
.CM3-sync-pill:hover { background: rgba(13,148,136,0.14); transform: translateY(-1px); }
.CM3-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: #14b8a6; animation: erp-pulse-dot 2s ease-in-out infinite; }

/* ── STAT CARDS ── */
.CM3-stat {
    background: var(--white,#fff);
    border: 1px solid var(--border,#D4D5D8);
    border-radius: var(--r-lg,16px);
    padding: 20px 22px;
    position: relative; overflow: hidden;
    cursor: default;
    transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
    box-shadow: var(--sh-card, 0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06));
}
.CM3-stat:hover { transform: translateY(-3px); box-shadow: var(--sh-hover, 0 4px 20px rgba(0,0,0,0.12)); border-color: var(--ember-border); }

.CM3-stat-accent {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--ac);
    transition: height 0.2s;
}
.CM3-stat:hover .CM3-stat-accent { height: 4px; }

.CM3-stat-glow {
    position: absolute; top: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--glow, rgba(37,99,235,0.07));
    transition: transform 0.3s;
}
.CM3-stat:hover .CM3-stat-glow { transform: scale(1.3); }

.CM3-stat-icon {
    width: 36px; height: 36px; border-radius: var(--r-md,10px);
    background: var(--icon-bg, var(--ember-ghost,rgba(59,130,246,0.10)));
    border: 1px solid var(--icon-border, var(--ember-border,rgba(29,78,216,0.28)));
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    position: relative; z-index: 1;
    transition: transform 0.2s;
}
.CM3-stat:hover .CM3-stat-icon { transform: scale(1.08) rotate(-3deg); }

.CM3-stat-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 8px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--text-4, #94A3B8); margin-bottom: 6px;
    position: relative; z-index: 1;
}
.CM3-stat-val {
    font-family: var(--font-body, 'Space Grotesk', sans-serif);
    font-size: 28px; font-style: normal; font-weight: 800;
    letter-spacing: -1px; line-height: 1;
    color: var(--val-color, #3A3A3A);
    position: relative; z-index: 1;
}
.CM3-stat-foot { font-size: 9px; color: var(--text-4, #94A3B8); margin-top: 6px; }
.DB-stat-delta { display:flex; align-items:center; gap:5px; margin-top:5px; font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--text-4); letter-spacing:0.5px; }
/* ── Open Ledger Account button ── */
.CM3-add-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; background:var(--ember,#2563EB); color:#fff; border:none; border-radius:8px; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase; cursor:pointer; transition:background .18s,transform .15s; white-space:nowrap; }
.CM3-add-btn:hover { background:var(--ember-dark,#1D4ED8); transform:translateY(-1px); }
/* ── Main detail panel ── */
.CM3-main { overflow-y:auto; background:var(--white,#fff); height:100%; }
/* ── Empty state ── */
.CM3-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; min-height:320px; color:var(--text-4); text-align:center; padding:40px; }
.CM3-empty-icon { opacity:.35; margin-bottom:16px; }
.CM3-empty-title { font-family:var(--font-body,'Space Grotesk',sans-serif); font-size: 13px; font-weight: 800; font-style:normal; text-transform: uppercase; letter-spacing: 0.3px; color:var(--text-2); margin-bottom:6px; }
.CM3-empty-sub { font-size: 10.5px; color:var(--text-4); }

/* ── BODY LAYOUT ── */
.CM3-body {
    display: grid;
    grid-template-columns: 320px 1fr;
    flex: 1;
    min-height: 500px;
    border: 1.5px solid var(--border, #E9EEF5);
    border-radius: 16px;
    overflow: hidden;
    background: var(--white, #fff);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    animation: erp-slide-up 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both;
}
@media(max-width:1024px){ .CM3-body{grid-template-columns:1fr; min-height:auto} }

/* ── SIDEBAR ── */
/* ══ SIDEBAR REDESIGN ═══════════════════════════════════════════════ */
.CM3-sidebar {
  border-right: 1.5px solid var(--border,#E9EEF5);
  display: flex; flex-direction: column;
  background: #F8FAFC; overflow: hidden; height: 100%;
}

/* ── Sidebar Hero Header ── */
.CM3-sb-hero {
  padding: 14px 14px 10px;
  background: linear-gradient(135deg,#F3E8FF 0%,#fff 100%);
  border-bottom: 1px solid var(--border,#E9EEF5);
  position: relative; overflow: hidden;
}
.CM3-sb-hero::before {
  content:''; position:absolute; right:-20px; top:-20px;
  width:80px; height:80px; border-radius:50%;
  background: radial-gradient(circle, rgba(29,78,216,0.07), transparent 70%);
  pointer-events:none;
}
.CM3-sb-eyebrow {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--ember,#2563EB); display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
}
.CM3-sb-eyebrow-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--ember,#2563EB);
  animation: sb-dot-pulse 2s ease-in-out infinite;
}
@keyframes sb-dot-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.5; transform:scale(0.7); }
}
.CM3-sb-title {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 13px; font-weight: 800; color: var(--text-1,#0F172A);
  text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 8px;
}

/* ── Search box ── */
.CM3-search {
  display: flex; align-items: center; gap: 7px; padding: 8px 11px;
  background: #fff; border: 1.5px solid var(--border,#E9EEF5);
  border-radius: 10px; transition: border-color 0.15s, box-shadow 0.15s;
}
.CM3-search:focus-within {
  border-color: var(--ember,#2563EB);
  box-shadow: 0 0 0 3px rgba(29,78,216,0.08);
}
.CM3-search input {
  flex: 1; border: none; outline: none; font-size: 9.5px;
  color: var(--text-1,#0F172A); background: transparent;
}
.CM3-search input::placeholder { color: var(--text-4,#9ca3af); }
.CM3-alloc-search { margin-bottom: 4px; position: sticky; top: 0; z-index: 1; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }

/* ── Add vendor button ── */
.CM3-add-btn {
  margin: 10px 12px 0; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px; background: linear-gradient(135deg,#2563EB,#3B82F6);
  color: #fff; border: none; border-radius: 10px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8.5px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; transition: all 0.22s;
  box-shadow: 0 4px 16px rgba(29,78,216,0.28);
  position: relative; overflow: hidden;
}
.CM3-add-btn::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  pointer-events:none;
}
.CM3-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(29,78,216,0.4); }
.CM3-add-btn:active { transform: translateY(0); }

/* ── Filter chips bar ── */
.CM3-filters {
  display: flex; gap: 4px; flex-wrap: wrap;
  padding: 8px 12px; border-bottom: 1px solid var(--border,#E9EEF5);
  background: #F1F5F9;
}
.CM3-chip {
  padding: 3px 9px; border-radius: 100px; border: 1.5px solid var(--border,#E9EEF5);
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; background: #fff; color: var(--text-4,#9ca3af);
  transition: all 0.15s;
}
.CM3-chip:hover { border-color: #BFDBFE; color: #2563EB; background: #F3E8FF; }
.CM3-chip.on { background: #F3E8FF; border-color: #BFDBFE; color: #2563EB; font-weight: 800; }

/* ── Vendor count pill ── */
.CM3-sb-count {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 14px 4px;
}
.CM3-sb-count-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--text-4);
}
.CM3-sb-count-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; color: var(--ember,#2563EB);
  background: #F3E8FF; padding: 1px 7px; border-radius: 100px;
  border: 1px solid #BFDBFE;
}

/* ── Vendor list scroll ── */
.CM3-vlist { flex: 1; overflow-y: auto; padding: 4px 0; }
.CM3-vlist::-webkit-scrollbar { width: 4px; }
.CM3-vlist::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius: 2px; }

/* ── Category drill-down (sidebar) ── */
.CM3-catcard {
  margin: 4px 10px; border-radius: 12px;
  border: 1.5px solid var(--border,#E9EEF5);
  background: #fff; cursor: pointer;
  display: flex; align-items: center; gap: 10px; padding: 11px 12px;
  transition: all 0.18s; position: relative; overflow: hidden;
  animation: vc-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
}
.CM3-catcard:hover {
  border-color: #BFDBFE;
  box-shadow: 0 4px 16px rgba(29,78,216,0.1);
  transform: translateX(2px);
}
.CM3-catcard:hover .CM3-vcard-accent { opacity: 1; }
.CM3-catcard-icon {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #F3E8FF; border: 1.5px solid #BFDBFE;
}
.CM3-catcard-info { flex: 1; min-width: 0; }
.CM3-catcard-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#0F172A);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.CM3-catcard-sub {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 700; color: #374151; margin-top: 2px; letter-spacing: 0.4px;
}
.CM3-catcard-chev { color: var(--text-4,#9ca3af); flex-shrink: 0; transition: transform 0.18s, color 0.18s; }
.CM3-catcard:hover .CM3-catcard-chev { color: var(--ember,#2563EB); transform: translateX(2px); }

/* Back-to-categories breadcrumb (shown when a category is drilled into) */
.CM3-cat-back {
  display: flex; align-items: center; gap: 8px; width: calc(100% - 20px);
  margin: 2px 10px 8px; padding: 8px 10px; border-radius: 10px;
  border: 1.5px dashed var(--border,#E9EEF5); background: #fff;
  cursor: pointer; transition: all 0.15s;
}
.CM3-cat-back:hover { border-color: #BFDBFE; background: #F3E8FF; }
.CM3-cat-back:hover .CM3-cat-back-name { color: #2563EB; }
.CM3-cat-back svg { flex-shrink: 0; color: var(--text-3,#6B6B6B); }
.CM3-cat-back:hover svg { color: #2563EB; }
.CM3-cat-back-name {
  flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 9.5px;
  color: var(--text-1,#0F172A); transition: color 0.15s;
}
.CM3-cat-back-count {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; color: var(--ember,#2563EB);
  background: #F3E8FF; padding: 1px 7px; border-radius: 100px; border: 1px solid #BFDBFE;
  flex-shrink: 0;
}

/* ── Category summary (shown in the right/main panel the instant a
   category is touched, before any single ledger is opened) ── */
.CM3-catsum { padding: 22px 26px 30px; height: 100%; overflow-y: auto; }
.CM3-catsum-hdr { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.CM3-catsum-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(29,78,216,0.09); border: 1.5px solid rgba(29,78,216,0.18);
}
.CM3-catsum-eyebrow {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--ember,#2563EB); margin-bottom: 2px;
}
.CM3-catsum-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 16.5px; color: var(--text-1,#0F172A); text-transform: uppercase; letter-spacing: 0.3px; }
.CM3-catsum-sub { font-size: 9px; font-weight: 700; color: var(--text-4,#9ca3af); margin-top: 2px; }
.CM3-catsum-stats {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px;
}
@media (max-width: 640px) { .CM3-catsum-stats { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 420px) { .CM3-catsum-stats { grid-template-columns: 1fr; } }
.CM3-catsum-stat {
  border: 1.5px solid var(--border,#E9EEF5); border-radius: 12px; background: var(--white,#fff);
  padding: 13px 15px;
}
.CM3-catsum-stat-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--text-4,#94A3B8);
  display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
}
.CM3-catsum-stat-val { font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 16px; }
.CM3-catsum-stat-val.credit-color { color: #D93B55; }
.CM3-catsum-stat-val.payment-color { color: #0d9488; }
.CM3-catsum-stat-val.balance-color { color: #C47E0A; }
.CM3-catsum-listhdr {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  letter-spacing: 1.6px; text-transform: uppercase; color: var(--text-3,#6B6B6B); margin-bottom: 10px;
}
.CM3-catsum-list { display: flex; flex-direction: column; gap: 8px; }
.CM3-catsum-row {
  display: flex; align-items: center; gap: 12px;
  border: 1.5px solid var(--border,#E9EEF5); border-radius: 12px; background: var(--white,#fff);
  padding: 11px 14px; cursor: pointer; transition: all 0.15s;
}
.CM3-catsum-row:hover { border-color: #BFDBFE; background: #F3E8FF; transform: translateX(2px); }
.CM3-catsum-row-info { flex: 1; min-width: 0; }
.CM3-catsum-row-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 9.5px;
  color: #7C3AED; text-transform: uppercase; letter-spacing: 0.2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.CM3-catsum-row-meta {
  display: flex; align-items: center; gap: 5px; font-size: 8.5px; font-weight: 700;
  color: var(--text-4,#9ca3af); margin-top: 2px;
}
.CM3-catsum-row-amt { text-align: right; flex-shrink: 0; }
.CM3-catsum-row-bal { display: block; font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 11.5px; color: #C47E0A; }
.CM3-catsum-row-bal-lbl { display: block; font-size: 7.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--text-4,#9ca3af); margin-top: 1px; }

/* ── Vendor card (new design) ── */
.CM3-vcard {
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
.CM3-vcard:hover {
  border-color: #BFDBFE;
  box-shadow: 0 4px 16px rgba(29,78,216,0.1);
  transform: translateX(2px);
}
.CM3-vcard.active {
  border-color: var(--ember,#2563EB);
  background: #F3E8FF;
  box-shadow: 0 4px 20px rgba(29,78,216,0.15);
  transform: translateX(3px);
}
.CM3-vcard-accent {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg,#2563EB,#3B82F6);
  opacity: 0; transition: opacity 0.18s;
  border-radius: 3px 0 0 3px;
}
.CM3-vcard:hover .CM3-vcard-accent,
.CM3-vcard.active .CM3-vcard-accent { opacity: 1; }

/* Card inner layout */
.CM3-vcard-top {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px 7px;
}
.CM3-vavatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 900; border: 1.5px solid;
  transition: transform 0.2s, box-shadow 0.2s;
}
.CM3-vcard:hover .CM3-vavatar { transform: scale(1.1) rotate(-3deg); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.CM3-vcard.active .CM3-vavatar { transform: scale(1.08); box-shadow: 0 4px 14px rgba(29,78,216,0.22); }

.CM3-vcard-info { flex: 1; min-width: 0; }
.CM3-vname {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 9.5px; font-weight: 800; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.CM3-vmeta {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 700; color: #374151; margin-top: 2px;
  display: flex; align-items: center; gap: 4px; letter-spacing: 0.5px;
}
.CM3-vmeta-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}
.CM3-vclient {
  font-size: 8.5px; color: #0d9488; margin-top: 2px; font-weight: 700;
  display: flex; align-items: center; gap: 3px;
}

/* balance + mini bar */
.CM3-vcard-foot {
  padding: 0 12px 9px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.CM3-vcard-bar-wrap { flex: 1; height: 3px; border-radius: 100px; background: #f1f5f9; overflow: hidden; }
.CM3-vcard-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg,#2563EB,#3B82F6);
  transition: width 1s cubic-bezier(0.4,0,0.2,1);
}
.CM3-vbal-new {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 900; white-space: nowrap; flex-shrink: 0;
}
.CM3-vbal-new.red  { color: #D93B55; }
.CM3-vbal-new.grey { color: var(--text-4,#9ca3af); }

/* ERP-stat grid spacing */
.CM3-page .ERP-stats { margin-bottom: 20px; }
.CM3-vitem-actions { display:none; }
.CM3-vitm-btn { display:none; }

/* ── DETAIL PANEL ── */
.CM3-detail { display: flex; flex-direction: column; overflow: hidden; background: var(--white,#fff); }

.CM3-welcome {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    flex: 1; gap: 14px; padding: 60px; text-align: center;
    animation: erp-fade-in 0.4s ease both;
}
.CM3-welcome-icon {
    width: 76px; height: 76px; border-radius: 22px;
    background: #fffbeb; border: 2px solid #fde68a;
    display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
    animation: cm3-welcome-float 3s ease-in-out infinite;
}
@keyframes cm3-welcome-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.CM3-welcome-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; text-transform: uppercase; letter-spacing: 0.4px; font-size: 17.5px; font-weight: 800; color: var(--text-1,#0F172A); }
.CM3-welcome-sub { font-size: 9.5px; color: var(--text-4,#9ca3af); max-width: 300px; line-height: 1.6; }

/* ── VENDOR HEADER — light style ── */
.CM3-vhdr {
    background: linear-gradient(135deg, #F8FAFC 0%, #fef9ed 100%);
    padding: 20px 24px;
    border-bottom: 1.5px solid var(--ember-border,#f5d87a);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.CM3-vhdr-left { display: flex; align-items: flex-start; gap: 14px; }
.CM3-vhdr-avatar {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 900; border: 2px solid; flex-shrink: 0;
    transition: transform 0.2s;
}
.CM3-vhdr-avatar:hover { transform: scale(1.06) rotate(-3deg); }
.CM3-vhdr-name { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 16.5px; font-weight: 900; font-style: normal; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.3px; text-shadow: 0 1px 0 rgba(255,255,255,.4); }
.CM3-vhdr-cat { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
.CM3-vhdr-client-strip {
    display: flex; align-items: center; gap: 6px; margin-top: 6px;
    padding: 4px 10px; background: rgba(13,148,136,0.08);
    border: 1px solid rgba(13,148,136,0.2); border-radius: 6px; width: fit-content;
}
.CM3-vhdr-client-label { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #0d9488; }
.CM3-vhdr-client-name { font-size: 9px; font-weight: 800; color: #0f766e; }
.CM3-vhdr-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ── ACTION BUTTONS ── */
.CM3-act {
    display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--r-md,10px);
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 8px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; border: none; transition: all 0.18s;
}
.CM3-act.credit { background: ${T.gradient}; color: #fff; box-shadow: 0 3px 10px rgba(220,38,38,0.25); }
.CM3-act.credit:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(220,38,38,0.35); }
.CM3-act.payment { background: ${E.gradient}; color: #fff; box-shadow: 0 3px 10px rgba(13,148,136,0.25); }
.CM3-act.payment:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(13,148,136,0.35); }
.CM3-act.payment:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; transform: none; }
.CM3-act.ghost {
    background: var(--white,#fff); color: var(--text-2,#3d3d3d);
    border: 1.5px solid var(--border,#E9EEF5);
}
.CM3-act.ghost:hover { border-color: var(--ember-border,#f5d87a); background: var(--off-white,#F8FAFC); transform: translateY(-1px); }

/* ── BAL STRIP — light tones ── */
.CM3-bal-strip { display: grid; grid-template-columns: repeat(3,1fr); border-bottom: 1.5px solid var(--border,#E9EEF5); }
@media (max-width: 480px) { .CM3-bal-strip { grid-template-columns: 1fr; } }
.CM3-bal-cell { padding: 14px 20px; border-right: 1px solid var(--border,#E9EEF5); background: var(--white,#fff); }
.CM3-bal-cell:last-child { border-right: none; }
.CM3-bal-lbl { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #4b5563; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
.CM3-bal-val { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; font-size: 16.5px; font-weight: 900; }
.CM3-bal-val.credit-color { color: #D93B55; }
.CM3-bal-val.payment-color { color: #0d9488; }
.CM3-bal-val.balance-color { color: #C47E0A; }

.CM3-client-cell {
    grid-column: 1/-1; padding: 8px 20px;
    background: rgba(13,148,136,0.05);
    border-bottom: 1px solid rgba(13,148,136,0.15);
    display: flex; align-items: center; gap: 8px;
}
.CM3-client-cell-lbl { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; }
.CM3-client-cell-name { font-size: 9.5px; font-weight: 800; color: #0f766e; }

/* ── PROGRESS ── */
.CM3-prog { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: var(--off-white,#F8FAFC); border-bottom: 1px solid var(--border,#E9EEF5); }
.CM3-prog-bar { flex: 1; height: 5px; background: var(--border,#E9EEF5); border-radius: 100px; overflow: hidden; }
.CM3-prog-fill { height: 100%; background: ${E.gradient}; border-radius: 100px; transition: width 0.9s ease; }
.CM3-prog-txt { font-size: 9px; font-weight: 800; color: #0f766e; }

/* ── TABS ── */
.CM3-tabs-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: var(--white,#fff); border-bottom: 1.5px solid var(--border,#E9EEF5); }
.CM3-tabs { display: flex; gap: 0; }
.CM3-tab {
    padding: 14px 18px;
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 8px; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; color: #4b5563;
    cursor: pointer; border: none; background: transparent;
    border-bottom: 2.5px solid transparent; transition: all 0.15s; white-space: nowrap;
}
.CM3-tab:hover { color: #0F172A; }
.CM3-tab.credit-tab.on { color: #D93B55; border-bottom-color: #D93B55; }
.CM3-tab.payment-tab.on { color: #0d9488; border-bottom-color: #0d9488; }
.CM3-tab.tl-tab.on { color: #C47E0A; border-bottom-color: #C47E0A; }
.CM3-tab-add {
    display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: var(--r-md,10px);
    border: 1.5px solid; font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 8px; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; cursor: pointer; transition: all 0.15s; background: transparent;
}
.CM3-tab-add.credit { color: #D93B55; border-color: #fecaca; }
.CM3-tab-add.credit:hover { background: #fef2f2; }
.CM3-tab-add.payment { color: #0d9488; border-color: #99f6e4; }
.CM3-tab-add.payment:hover { background: #f0fdfa; }

/* ── CONTENT ── */
.CM3-content { flex: 1; overflow-y: auto; padding: 12px; background: var(--surface,#F1F5F9); }
.CM3-content::-webkit-scrollbar { width: 5px; }
.CM3-content::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius: 3px; }

/* ── ENTRY CARDS ── */
/* ── NEW BILL CARDS ── */
/* ══ BILL CARDS: Professional 4-col grid ══════════════════════════ */
.CM3-bc {
  display: grid;
  grid-template-columns: 62px 1fr auto 32px;
  border-radius: 11px; overflow: hidden;
  border: 1px solid var(--border,#E9EEF5);
  background: #fff;
  margin-bottom: 6px;
  transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
  animation: bc-in 0.32s cubic-bezier(0.4,0,0.2,1) both;
  position: relative;
}
.CM3-bc:hover {
  box-shadow: 0 5px 22px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}
.CM3-bc.bc-overdue { border-color: #fca5a5; box-shadow: 0 0 0 2px rgba(239,68,68,0.08); }
.CM3-bc.bc-overdue:hover { box-shadow: 0 5px 22px rgba(239,68,68,0.18), 0 0 0 2px rgba(239,68,68,0.12); }
.CM3-bc.bc-neardue { border-color: #fde68a; }
.CM3-bc.bc-ok { border-color: var(--border,#E9EEF5); }
.CM3-bc.bc-closed { background: #F8FAFC; border-color: #e4e7ec; opacity: 0.84; }

/* ── SETTLED DATE STAMP ── */
.CM3-bc-settled-stamp {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 9px 12px; gap: 3px; flex-shrink: 0;
  min-width: 130px; border-left: 1px solid #d1fae5;
  background: linear-gradient(160deg,#f0fdf4,#fafdf7);
}
.CM3-bc-settled-date {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 12.5px; font-weight: 800; font-style: normal;
  color: #1E9C6A; line-height: 1.1; text-align: right;
}
.CM3-bc-settled-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  color: #6ee7b7; text-align: right;
}
.CM3-bc-settled-amt {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; color: #1E9C6A; margin-top: 2px;
  background: #dcfce7; padding: 1.5px 7px; border-radius: 100px;
  border: 1px solid #6ee7b7;
}

/* ── LEFT ACCENT PANEL ── */
.CM3-bc-left {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px 4px; gap: 4px;
  border-right: 1px solid var(--border,#E9EEF5);
  background: linear-gradient(160deg, #F3E8FF 0%, #fff 100%);
  position: relative; overflow: hidden;
}
.CM3-bc-left::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, #2563EB, #3B82F6);
}
.CM3-bc.bc-overdue .CM3-bc-left { background: linear-gradient(160deg,#fef2f2,#fff); }
.CM3-bc.bc-overdue .CM3-bc-left::before { background: linear-gradient(180deg,#D93B55,#f87171); }
.CM3-bc.bc-neardue .CM3-bc-left { background: linear-gradient(160deg,#fffbeb,#fff); }
.CM3-bc.bc-neardue .CM3-bc-left::before { background: linear-gradient(180deg,#f59e0b,#fbbf24); }
.CM3-bc.bc-closed .CM3-bc-left { background: linear-gradient(160deg,#f0fdf4,#F8FAFC); }
.CM3-bc.bc-closed .CM3-bc-left::before { background: linear-gradient(180deg,#10b981,#34d399); }

.CM3-bc-num-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 6px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--text-4); line-height: 1;
}
.CM3-bc-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 900; color: var(--ember,#2563EB);
  line-height: 1; letter-spacing: -1px;
}
.CM3-bc.bc-overdue .CM3-bc-num { color: #D93B55; }
.CM3-bc.bc-neardue .CM3-bc-num { color: #C47E0A; }
.CM3-bc.bc-closed .CM3-bc-num { color: #1E9C6A; }

.CM3-bc-icon-ring {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(29,78,216,0.08); border: 1.5px solid rgba(29,78,216,0.18);
  display: flex; align-items: center; justify-content: center; margin-top: 2px;
  transition: transform 0.2s;
}
.CM3-bc:hover .CM3-bc-icon-ring { transform: scale(1.12); }
.CM3-bc.bc-overdue .CM3-bc-icon-ring { background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.25); }
.CM3-bc.bc-neardue .CM3-bc-icon-ring { background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.25); }
.CM3-bc.bc-closed .CM3-bc-icon-ring { background:rgba(5,150,105,0.08); border-color:rgba(5,150,105,0.2); }

/* ── CENTER BODY ── */
.CM3-bc-body {
  padding: 9px 12px; display: flex; flex-direction: column;
  gap: 3px; min-width: 0; justify-content: center;
}
.CM3-bc-row1 { display: flex; align-items: center; gap: 6px; min-width: 0; }
.CM3-bc-vendor {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#0F172A);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;
}
.CM3-bc.bc-closed .CM3-bc-vendor { color: var(--text-3,#6b7280); }
.CM3-bc-ref {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  color: #6b7280; background: #f3f4f6; padding: 1.5px 5px;
  border-radius: 4px; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;
}
.CM3-bc-row2 {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.CM3-bc-desc { font-size: 9px; color: var(--text-4,#9ca3af); }
.CM3-bc-dot { color: var(--border); font-size: 8px; }
.CM3-bc-row3 {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 2px;
}

/* chips */
.CM3-bc-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono); font-size: 7.5px; font-weight: 800;
  padding: 1.5px 6px; border-radius: 100px; border: 1px solid; white-space: nowrap;
  line-height: 14px;
}
.CM3-bc-chip.date   { color:var(--text-4); background:var(--off-white,#F1F5F9); border-color:var(--border); }
.CM3-bc-chip.p-high { color:#D93B55; background:#fef2f2; border-color:#fca5a5; }
.CM3-bc-chip.p-medium { color:#C47E0A; background:#fffbeb; border-color:#fde68a; }
.CM3-bc-chip.p-low  { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }
.CM3-bc-chip.due-overdue { color:#D93B55; background:#fef2f2; border-color:#fca5a5; animation: cm3-pulse-red 2s infinite; }
.CM3-bc-chip.due-near   { color:#C47E0A; background:#fffbeb; border-color:#fde68a; }
.CM3-bc-chip.due-ok     { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }
.CM3-bc-chip.note       { color:#7c3aed; background:#faf5ff; border-color:#ddd6fe; }
.CM3-bc-chip.client     { color:#0d9488; background:#f0fdfa; border-color:#99f6e4; }
.CM3-bc-chip.settled    { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }

/* ── RIGHT AMOUNT PANEL ── */
.CM3-bc-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 9px 12px; gap: 4px; flex-shrink: 0;
  min-width: 140px; border-left: 1px solid var(--border,#E9EEF5);
}
.CM3-bc-amt {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 14px; font-weight: 800; font-style: normal;
  color: #D93B55; line-height: 1;
}
.CM3-bc.bc-closed .CM3-bc-amt { color: #9ca3af; font-size: 13px; }
.CM3-bc-status {
  font-family: var(--font-mono); font-size: 7px; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 2px 8px; border-radius: 100px; border: 1px solid;
}
.CM3-bc-status.open   { color:#2563EB; background:#F3E8FF; border-color:#BFDBFE; }
.CM3-bc-status.closed { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }

.CM3-bc-mini-bar {
  width: 100%; height: 4px; border-radius: 100px; background: #f1f5f9;
  overflow: hidden; position: relative;
}
.CM3-bc-mini-fill {
  position: absolute; left: 0; top: 0; height: 100%;
  background: linear-gradient(90deg, #2563EB, #3B82F6);
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 4px rgba(29,78,216,0.3);
}
.CM3-bc-bal-row {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; gap: 4px;
}
.CM3-bc-total-lbl { font-family:var(--font-mono); font-size: 8px; color:#2563EB; font-weight: 800; }
.CM3-bc-bal-lbl   { font-family:var(--font-mono); font-size: 8px; color:#D93B55;  font-weight: 800; }

/* ── ACTION COLUMN ── */
.CM3-bc-acts {
  display: flex; flex-direction: column; flex-shrink: 0;
  border-left: 1px solid var(--border,#E9EEF5); align-self: stretch; width: 32px;
}
.CM3-bc-act {
  flex: 1; background: none; border: none; cursor: pointer;
  color: var(--text-4,#9ca3af);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.14s, color 0.14s;
}
.CM3-bc-act + .CM3-bc-act { border-top: 1px solid var(--border,#E9EEF5); }
.CM3-bc-act.edit:hover { background: #eff6ff; color: #3b82f6; }
.CM3-bc-act.del:hover  { background: #fef2f2; color: #D93B55; }

/* ══ BILLS TABLE (compact, professional, light theme, responsive — no row-select) ══ */
.CM3-billtbl-wrap {
  overflow-y: auto; overflow-x: hidden; max-height: 322px; width: 100%;
  border: 1.5px solid var(--border,#E9EEF5); border-radius: 14px;
  background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.CM3-billtbl-wrap::-webkit-scrollbar { width: 6px; height: 5px; }
.CM3-billtbl-wrap::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius: 3px; }
.CM3-billtbl-wrap::-webkit-scrollbar-thumb:hover { background: #BFDBFE; }
/* table-layout:fixed + fixed % column widths means content wraps instead of
   overflowing, so the wrap never needs a horizontal scrollbar at any width. */
.CM3-billtbl { width: 100%; table-layout: fixed; border-collapse: collapse; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9.5px; }
.CM3-billtbl col.c-sno { width: 4%; } .CM3-billtbl col.c-inv { width: 11%; }
.CM3-billtbl col.c-client { width: 14%; } .CM3-billtbl col.c-date { width: 7%; }
.CM3-billtbl col.c-due { width: 6%; } .CM3-billtbl col.c-priority { width: 7%; }
.CM3-billtbl col.c-credit { width: 10%; } .CM3-billtbl col.c-paid { width: 9%; }
.CM3-billtbl col.c-balance { width: 10%; } .CM3-billtbl col.c-status { width: 16%; }
.CM3-billtbl col.c-acts { width: 6%; }
.CM3-billtbl thead th {
  /* Same header language as every other table in the app (.ERP-tbl):
     light surface, dark uppercase mono-weight text, ember underline —
     instead of this table's previous solid-orange/white-text header. */
  background: var(--surface-2,#E9EEF5); color: var(--text-3,#27364A);
  font-size: 8px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;
  padding: 11px 9px; text-align: left; white-space: nowrap;
  border-bottom: 2px solid var(--ember,#2563EB);
  position: sticky; top: 0; z-index: 2;
}
.CM3-billtbl thead th:first-child { border-top-left-radius: 12px; }
.CM3-billtbl thead th:last-child { border-top-right-radius: 12px; }
.CM3-billtbl tbody td {
  padding: 10px 9px; border-bottom: 1px solid var(--border,#E9EEF5);
  vertical-align: middle; color: #0F172A; font-weight: 800;
  transition: background 0.14s; overflow-wrap: break-word;
}
.CM3-billtbl tbody tr { animation: bc-in 0.28s cubic-bezier(0.4,0,0.2,1) both; }
.CM3-billtbl tbody tr:nth-child(1) { animation-delay: 0.02s; }
.CM3-billtbl tbody tr:nth-child(2) { animation-delay: 0.05s; }
.CM3-billtbl tbody tr:nth-child(3) { animation-delay: 0.08s; }
.CM3-billtbl tbody tr:nth-child(4) { animation-delay: 0.11s; }
.CM3-billtbl tbody tr:nth-child(5) { animation-delay: 0.14s; }
.CM3-billtbl tbody tr:nth-child(6) { animation-delay: 0.17s; }
.CM3-billtbl tbody tr:nth-child(7) { animation-delay: 0.20s; }
.CM3-billtbl tbody tr:nth-child(n+8) { animation-delay: 0.23s; }
.CM3-billtbl tbody tr:nth-child(even) td { background: var(--surface,#F8FAFC); }
.CM3-billtbl tbody tr:last-child td { border-bottom: none; }
.CM3-billtbl tbody tr:hover td { background: var(--ember-ghost,#F3E8FF); box-shadow: inset 3px 0 0 var(--ember-mid,#3B82F6); }
.CM3-billtbl tbody tr.row-closed { opacity: 0.6; }
.CM3-billtbl tbody tr.row-closed:hover td { opacity: 1; background: #f8fafc; }
@media (max-width: 720px) {
    .CM3-billtbl, .CM3-billtbl thead th, .CM3-billtbl tbody td { font-size: 8px; }
    .CM3-billtbl thead th, .CM3-billtbl tbody td { padding: 7px 5px; }
    .CM3-billtbl-status { font-size: 7.5px; padding: 3px 6px; }
}

/* S.No badge — small numbered pill instead of plain text */
.CM3-billtbl-sno {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; height: 22px; padding: 0 6px; border-radius: 7px;
  background: var(--ember-ghost, #fff1e6); border: 1px solid #BFDBFE;
  color: #2563EB; font-weight: 800; font-size: 9px; letter-spacing: 0.2px;
}
.CM3-billtbl-num { color: var(--text-3,#6b7280); font-weight: 800; }
.CM3-billtbl-client { color: #2563EB; font-weight: 800; }
.CM3-billtbl-ref {
  display: inline-block; font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 800; color: #0F172A;
  background: var(--surface,#F1F5F9); border: 1px solid var(--border,#E9EEF5);
  border-radius: 5px; padding: 1.5px 7px;
}
.CM3-billtbl-amt { font-weight: 800; white-space: nowrap; }
.CM3-billtbl-amt.due { color: #D93B55; }
.CM3-billtbl-amt.paid { color: #1E9C6A; }

/* Priority — plain colored text, no dot/icon */
.CM3-billtbl-priority { font-size: 8.5px; font-weight: 800; text-transform: capitalize; letter-spacing: 0.2px; }
.CM3-billtbl-priority.high   { color: #D93B55; }
.CM3-billtbl-priority.medium { color: #C47E0A; }
.CM3-billtbl-priority.low    { color: #6b7280; }

/* Status — plain colored text, no pill/badge chrome */
.CM3-billtbl-status {
  font-size: 8.5px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase;
  white-space: normal; line-height: 1.3;
}
.CM3-billtbl-status.open    { color: #2563EB; }
.CM3-billtbl-status.overdue { color: #D93B55; }
.CM3-billtbl-status.near    { color: #C47E0A; }
.CM3-billtbl-status.closed  { color: #1E9C6A; }
.CM3-billtbl-acts { display: flex; gap: 4px; justify-content: flex-end; }
.CM3-billtbl-act {
  width: 25px; height: 25px; border-radius: 7px; border: 1px solid var(--border,#E9EEF5);
  background: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-4,#9ca3af); transition: all 0.16s; flex-shrink: 0;
}
.CM3-billtbl-act:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.1); }
.CM3-billtbl-act.edit:hover { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }
.CM3-billtbl-act.del:hover  { background: #fef2f2; color: #D93B55; border-color: #fecaca; }

/* Custom checkbox to match theme (used in header + row checks) */
.CM3-billtbl-cb {
  width: 15px; height: 15px; border-radius: 4px; flex-shrink: 0;
  border: 1.5px solid var(--border,#E9EEF5); appearance: none; -webkit-appearance: none;
  background: #fff; cursor: pointer; position: relative; transition: all 0.15s; vertical-align: middle;
}
.CM3-billtbl-cb:hover { border-color: #BFDBFE; }
.CM3-billtbl-cb:checked { background: linear-gradient(135deg,#2563EB,#3B82F6); border-color: #2563EB; }
.CM3-billtbl-cb:checked::after {
  content: ''; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px;
  border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
}
thead .CM3-billtbl-cb { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.12); }
thead .CM3-billtbl-cb:checked { background: #fff; border-color: #fff; }
thead .CM3-billtbl-cb:checked::after { border-color: #2563EB; }

/* ══ REPAYMENT CARDS ════════════════════════════════════════════════ */
.CM3-pm-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 6px;
  border-bottom: 1px solid var(--border,#E9EEF5);
  background: linear-gradient(90deg,#f0fdfa,#fff);
  margin-bottom: 4px;
}
.CM3-pm-hdr-title {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7.5px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  color: #0d9488; display: flex; align-items: center; gap: 5px;
}
.CM3-pm-hdr-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #0d9488;
  animation: sb-dot-pulse 2s ease-in-out infinite;
}
.CM3-pm-hdr-total {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 800; color: #0d9488;
}

.CM3-pmc {
  display: grid;
  grid-template-columns: 58px 1fr auto 32px;
  border-radius: 11px; overflow: hidden;
  border: 1px solid var(--border,#E9EEF5);
  background: #fff; margin-bottom: 6px;
  transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
  animation: bc-in 0.32s cubic-bezier(0.4,0,0.2,1) both;
}
.CM3-pmc:hover {
  border-color: #99f6e4;
  box-shadow: 0 4px 18px rgba(13,148,136,0.12);
  transform: translateY(-1px);
}

/* Left teal panel */
.CM3-pmc-left {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px 4px; gap: 4px;
  border-right: 1px solid var(--border,#E9EEF5);
  background: linear-gradient(160deg,#f0fdfa 0%,#fff 100%);
  position: relative; overflow: hidden;
}
.CM3-pmc-left::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
  background: linear-gradient(180deg,#0d9488,#14b8a6);
}
.CM3-pmc-num-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 6px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  color: #0d9488; line-height: 1;
}
.CM3-pmc-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 15px; font-weight: 900; color: #0d9488; line-height: 1; letter-spacing: -1px;
}
.CM3-pmc-icon-ring {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(13,148,136,0.1); border: 1.5px solid rgba(13,148,136,0.25);
  display: flex; align-items: center; justify-content: center; margin-top: 2px;
  transition: transform 0.2s;
}
.CM3-pmc:hover .CM3-pmc-icon-ring { transform: scale(1.12); }

/* Center body */
.CM3-pmc-body {
  padding: 9px 12px; display: flex; flex-direction: column;
  gap: 3px; min-width: 0; justify-content: center;
}
.CM3-pmc-row1 { display: flex; align-items: center; gap: 6px; min-width: 0; }
.CM3-pmc-vendor {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#0F172A);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
}
.CM3-pmc-mode {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; color: #0d9488;
  background: #f0fdfa; padding: 1.5px 6px; border-radius: 4px;
  border: 1px solid #99f6e4; white-space: nowrap; flex-shrink: 0;
}
.CM3-pmc-row2 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.CM3-pmc-desc { font-size: 9px; color: var(--text-4,#9ca3af); }
.CM3-pmc-dot  { color: var(--border); font-size: 8px; }
.CM3-pmc-row3 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 2px; }

.CM3-pmc-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7.5px; font-weight: 800;
  padding: 1.5px 6px; border-radius: 100px; border: 1px solid; white-space: nowrap;
  line-height: 14px;
}
.CM3-pmc-chip.date    { color:var(--text-4); background:var(--off-white,#F1F5F9); border-color:var(--border); }
.CM3-pmc-chip.synced  { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }
.CM3-pmc-chip.unsynced{ color:#9ca3af; background:#f9fafb; border-color:#e5e7eb; }
.CM3-pmc-chip.ref     { color:#7c3aed; background:#faf5ff; border-color:#ddd6fe; }
.CM3-pmc-chip.client  { color:#0d9488; background:#f0fdfa; border-color:#99f6e4; }

/* Right amount panel */
.CM3-pmc-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 9px 12px; gap: 4px; flex-shrink: 0;
  min-width: 120px; border-left: 1px solid var(--border,#E9EEF5);
}
.CM3-pmc-amt {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 14px; font-weight: 800; font-style: normal;
  color: #0d9488; line-height: 1;
}
.CM3-pmc-status {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  padding: 2px 8px; border-radius: 100px;
  color: #1E9C6A; background: #f0fdf4; border: 1px solid #6ee7b7;
}

/* Action col */
.CM3-pmc-acts {
  display: flex; flex-direction: column; flex-shrink: 0;
  border-left: 1px solid var(--border,#E9EEF5); align-self: stretch; width: 32px;
}
.CM3-pmc-act {
  flex: 1; background: none; border: none; cursor: pointer;
  color: var(--text-4,#9ca3af);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.14s, color 0.14s;
}
.CM3-pmc-act + .CM3-pmc-act { border-top: 1px solid var(--border,#E9EEF5); }
.CM3-pmc-act.edit:hover { background: #eff6ff; color: #3b82f6; }
.CM3-pmc-act.del:hover  { background: #fef2f2; color: #D93B55; }

/* ── ANIMATIONS ── */
@keyframes bc-in {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
/* Bouncier row entrance for the Select Client / Select Bill tables — a bit more
   lively than the flat bc-in fade, per the "attractive with animation" ask. */
@keyframes cm3-row-pop-in {
  from { opacity:0; transform:translateY(10px) scale(0.98); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes cm3-pulse-red {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%      { box-shadow: 0 0 0 4px rgba(239,68,68,0.14); }
}

.CM3-ecard {
    background: var(--white,#fff); border: 1px solid var(--border,#D4D5D8); border-radius: var(--r-md,12px);
    margin-bottom: 8px; display: flex; overflow: hidden;
    transition: all 0.18s; cursor: default;
    box-shadow: var(--sh-card, 0 1px 4px rgba(0,0,0,0.08));
    animation: erp-pop 0.3s ease both;
}
.CM3-ecard:hover { border-color: var(--ember-border,#f5d87a); box-shadow: 0 4px 16px rgba(37,99,235,0.1); transform: translateY(-1px); }
.CM3-ecard-bar { width: 4px; flex-shrink: 0; }
.CM3-ecard-bar.credit-bar { background: ${T.gradient}; }
.CM3-ecard-bar.payment-bar { background: ${E.gradient}; }
.CM3-ecard-body { flex: 1; padding: 13px 14px; min-width: 0; }
.CM3-ecard-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.CM3-ecard-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10.5px; font-weight: 800; color: var(--text-1,#0F172A); }
.CM3-ecard-subtitle { font-size: 9px; color: var(--text-4,#94A3B8); margin-top: 1px; }
.CM3-ecard-amt { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 13px; font-weight: 800; font-style: normal; white-space: nowrap; }
.CM3-ecard-amt.credit-amt { color: #D93B55; }
.CM3-ecard-amt.payment-amt { color: #0d9488; }
.CM3-ecard-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.CM3-ecard-date { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; color: var(--text-4,#94A3B8); font-weight: 700; letter-spacing: 0.5px; }
/* Action column — stacked edit + delete */
.CM3-ecard-actions {
    display: flex; flex-direction: column; flex-shrink: 0;
    border-left: 1px solid var(--border,#E9EEF5); width: 36px;
}
.CM3-ecard-act {
    flex: 1; background: none; border: none; cursor: pointer;
    color: var(--text-4,#9ca3af); display: flex; align-items: center; justify-content: center;
    transition: background 0.14s, color 0.14s;
}
.CM3-ecard-act + .CM3-ecard-act { border-top: 1px solid var(--border,#E9EEF5); }
.CM3-ecard-act.act-edit:hover  { background: #eff6ff; color: #3b82f6; }
.CM3-ecard-act.act-del:hover   { background: #fef2f2; color: #D93B55; }
/* legacy single del kept for any stray use */
.CM3-ecard-del {
    width: 36px; flex-shrink: 0; background: none; border: none; cursor: pointer;
    color: var(--text-4,#9ca3af); display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; border-left: 1px solid var(--border,#E9EEF5);
}
.CM3-ecard-del:hover { background: #fef2f2; color: #D93B55; }
.CM3-card-client { font-size: 8px; display: flex; align-items: center; gap: 3px; color: #0d9488; font-weight: 700; }

/* ── MINI PROGRESS ── */
.CM3-miniprog { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.CM3-miniprog-bar { flex: 1; height: 3px; background: var(--border,#E9EEF5); border-radius: 100px; overflow: hidden; }
.CM3-miniprog-fill { height: 100%; background: ${E.gradient}; border-radius: 100px; transition: width 0.6s ease; }
.CM3-miniprog-txt { font-size: 8px; color: var(--text-4,#9ca3af); white-space: nowrap; }

/* ── TAGS ── */
.CM3-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; border: 1px solid; font-size: 8px; font-weight: 800; letter-spacing: 0.04em; }
.CM3-dot { width: 5px; height: 5px; border-radius: 50%; }
.CM3-synced { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; font-size: 8px; font-weight: 800; color: #0d9488; background: #f0fdfa; border: 1px solid #99f6e4; }
.CM3-unsynced { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; font-size: 8px; font-weight: 800; color: #94a3b8; background: #f8fafc; border: 1px solid #e2e8f0; }

/* ── TIMELINE ── */
.CM3-tl { padding: 8px 0; }
.CM3-tl-item { display: flex; gap: 14px; padding: 10px 4px; position: relative; animation: cm3-card-in 0.3s ease both; }
.CM3-tl-item::before { content: ''; position: absolute; left: 15px; top: 28px; bottom: -8px; width: 1px; background: var(--border,#E9EEF5); }
.CM3-tl-item:last-child::before { display: none; }
.CM3-tl-dot { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1.5px solid; }
.CM3-tl-dot.credit-dot { background: #fef2f2; border-color: #fecaca; }
.CM3-tl-dot.payment-dot { background: #f0fdfa; border-color: #99f6e4; }
.CM3-tl-body { flex: 1; min-width: 0; }
.CM3-tl-label { font-size: 9.5px; font-weight: 800; color: var(--text-1,#0F172A); }
.CM3-tl-sub { font-size: 9px; color: var(--text-4,#9ca3af); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 2px; }
.CM3-tl-amt { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; font-size: 12.5px; font-weight: 800; }
.CM3-tl-amt.credit-tl { color: #D93B55; }
.CM3-tl-amt.payment-tl { color: #0d9488; }

/* ── EMPTY STATE ── */
.CM3-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 52px 20px; text-align: center; }
.CM3-empty-ic { width: 58px; height: 58px; border-radius: 16px; display: flex; align-items: center; justify-content: center; animation: cm3-welcome-float 3s ease-in-out infinite; }
.CM3-empty-ic.credit-empty { background: #fef2f2; border: 1.5px solid #fecaca; }
.CM3-empty-ic.payment-empty { background: #f0fdfa; border: 1.5px solid #99f6e4; }
.CM3-empty-title { font-size: 13px; font-weight: 800; color: var(--text-1,#0F172A); }
.CM3-empty-sub { font-size: 9px; color: var(--text-4,#9ca3af); max-width: 240px; line-height: 1.6; }

/* ── SKELETON ── */
.CM3-skel { background: linear-gradient(90deg, #f1f5f9 25%, #E9EEF5 50%, #f1f5f9 75%); background-size: 200% 100%; border-radius: 8px; animation: cm3-skel 1.4s infinite; }
@keyframes cm3-skel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── LEGEND ── */
.CM3-legend { display: flex; align-items: center; gap: 12px; padding: 8px 20px; background: var(--off-white,#F8FAFC); border-bottom: 1px solid var(--border,#E9EEF5); flex-wrap: wrap; }
.CM3-legend-lbl { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-4,#9ca3af); }

/* ── SYNC BANNER ── */
.CM3-sync-banner {
    display: flex; align-items: center; gap: 10px; padding: 10px 20px;
    background: #f0fdfa; border-bottom: 1px solid #99f6e4; font-size: 9.5px; color: #0d9488;
    animation: cm3-slide-down 0.3s ease both;
}
@keyframes cm3-slide-down { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }

/* ── FORM DIALOG (Open Ledger Account / Add Bill / Record Payment) ──
   Centered popup dialog — dim/blurred backdrop behind a floating rounded
   card, not a full in-app page. Click the backdrop or the X to dismiss.
   Sized generously (not a cramped little box) so the multi-field forms
   have real breathing room, with a livelier staged pop-in: the card
   overshoots slightly then settles, and the header icon pops in a beat
   after so the entrance reads as a designed sequence, not a flat fade. */
@keyframes cm3-overlay-in { from{opacity:0} to{opacity:1} }
@keyframes cm3-modal-in {
    0%   { opacity:0; transform:scale(0.86) translateY(32px); filter:blur(4px); }
    55%  { opacity:1; transform:scale(1.018) translateY(-3px); filter:blur(0); }
    100% { opacity:1; transform:scale(1) translateY(0); filter:blur(0); }
}
@keyframes cm3-icon-pop {
    0%   { opacity:0; transform:scale(0.5) rotate(-10deg); }
    65%  { opacity:1; transform:scale(1.14) rotate(4deg); }
    100% { opacity:1; transform:scale(1) rotate(0deg); }
}
.CM3-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,0.52);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: cm3-overlay-in 0.22s ease both;
}
.CM3-modal {
    position: relative;
    background: var(--white,#fff);
    border-radius: 22px;
    width: 100%; max-width: 620px;
    box-shadow: 0 6px 28px rgba(0,0,0,0.10), 0 32px 88px rgba(0,0,0,0.24);
    overflow: hidden; display: flex; flex-direction: column;
    animation: cm3-modal-in 0.42s cubic-bezier(0.22,1,0.36,1) both;
    max-height: min(93dvh, 90vh);
}
/* Full-modal success celebration (Add Bill / Repayment) — sits above the
   whole dialog (header+body+footer), matching the Bill-Closed celebration. */
.CM3-success-ov { border-radius: 22px; z-index: 20; }
.CM3-modal-lg { max-width: 980px; min-height: min(740px, 88dvh); }
@media(max-width:640px){
    .CM3-overlay { padding:0; align-items:flex-end; }
    .CM3-modal, .CM3-modal-lg { max-width:100%; min-height:0; border-radius:18px 18px 0 0; max-height:min(94dvh,94vh); }
    .CM3-success-ov { border-radius:18px 18px 0 0; }
}

/* Header — warm-white base with an orange tint, the same project theme used
   across the Bills table / repayment modals, instead of a flat neutral gray. */
.CM3-mhdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1.5px solid #BFDBFE; flex-shrink:0;
    background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
    border-radius: 20px 20px 0 0;
}
.CM3-mhdr.credit-top, .CM3-mhdr.payment-top, .CM3-mhdr.ledger-top {
    background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
}
.CM3-mhdr-ic {
    width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: #fff !important; border: 1.5px solid #BFDBFE !important;
    animation: cm3-icon-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
}
.CM3-mtitle { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 20px; font-weight: 900; font-style: normal; color: #0F172A; }
.CM3-msub { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 9px; font-weight: 700; color: #4b5563; margin-top: 4px; }
.CM3-msub-tag {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  color: var(--ember,#2563EB); text-transform: uppercase;
  font-weight: 800; letter-spacing: 0.6px; font-size: 8.5px;
}
/* Close control — compact X icon button in the header corner, standard
   dismissible-dialog convention. Rotates open on hover/press for a livelier
   feel than a flat icon swap. */
.CM3-mclose {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: #fff; border: 1.5px solid #BFDBFE;
    cursor: pointer; color: #9a3412;
    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.CM3-mclose svg { transition: transform 0.18s; }
.CM3-mclose:hover {
    background: #F3E8FF; border-color: #60A5FA; color: #2563EB;
    transform: rotate(90deg); box-shadow: 0 3px 10px rgba(29,78,216,0.14);
}
.CM3-mclose:active { transform: rotate(90deg) scale(0.9); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

/* ── DIALOG BODY ── */
.CM3-mbody {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 20px 22px;
    scroll-behavior: smooth; overscroll-behavior: contain;
}
.CM3-mbody::-webkit-scrollbar { width: 3px; }
.CM3-mbody::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius:3px; }
.CM3-mbody::-webkit-scrollbar-track { background: transparent; }

.CM3-mfoot { display:flex; align-items:center; justify-content:flex-end; gap:8px; padding:14px 22px; border-top:1.5px solid var(--border,#E9EEF5); background:var(--surface,#F1F5F9); flex-shrink:0; border-radius: 0 0 20px 20px; }
@media(max-width:640px){
    .CM3-mhdr { border-radius: 18px 18px 0 0; }
    .CM3-mfoot { border-radius: 0; }
}

/* ── FORM FIELDS ── */
.CM3-grid1 { display: grid; grid-template-columns: 1fr; gap: 13px; }
.CM3-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 13px 20px; }
@media(max-width:600px) { .CM3-grid2 { grid-template-columns: 1fr; } }
.CM3-field { display: flex; flex-direction: column; gap: 0; }
.CM3-field-label {
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 10.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
    color: #1f2430; margin-bottom: 5px;
    display: flex; gap: 6px; align-items: center;
}
.CM3-req { color: var(--error,#D93B55); font-size: 11px; }
.CM3-label {
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 10.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
    color: #1f2430; margin-bottom: 5px; display: flex; align-items: center; gap: 6px;
}
.CM3-label .req { color: var(--error,#D93B55); }
.CM3-input {
    width: 100%; padding: 10px 13px; background: var(--white,#fff);
    border: 1.5px solid var(--border,#D4D5D8); border-radius: var(--r-md,10px);
    font-family: var(--font-body,'Space Grotesk',sans-serif);
    font-size: 13px; font-weight: 800; color: #0d0905;
    transition: border-color 0.18s, box-shadow 0.18s; outline: none; box-sizing: border-box;
}
.CM3-input:focus { border-color: var(--ember-mid,#3B82F6); box-shadow: 0 0 0 3px var(--ember-ghost,rgba(59,130,246,0.10)); }
.CM3-input::placeholder { color: #9ca3af; font-style: normal; font-weight: 700; }
/* Category locked to context (opened from a Category Overview panel) — shown
   read-only instead of the usual dropdown, since it isn't selectable here. */
.CM3-locked-field {
    width: 100%; padding: 8px 12px; box-sizing: border-box;
    background: #F3E8FF; border: 1.5px solid #BFDBFE; border-radius: var(--r-md,10px);
    font-family: var(--font-body,'Space Grotesk',sans-serif);
    font-size: 10.5px; font-weight: 800; color: #2563EB;
    display: flex; align-items: center; gap: 8px;
}
.CM3-textarea {
    width: 100%; padding: 10px 13px; background: var(--white,#fff);
    border: 1.5px solid var(--border,#D4D5D8); border-radius: var(--r-md,10px);
    font-family: var(--font-body,'Space Grotesk',sans-serif);
    font-size: 13px; font-weight: 800; color: #0d0905;
    resize: vertical; min-height: 64px;
    transition: border-color 0.18s, box-shadow 0.18s; outline: none; box-sizing: border-box;
}
.CM3-textarea:focus { border-color: var(--ember-mid,#3B82F6); box-shadow: 0 0 0 3px var(--ember-ghost,rgba(59,130,246,0.10)); }
.CM3-textarea::placeholder { color: #9ca3af; font-style: normal; font-weight: 700; }

/* ── Required-field validation (shake + red border + inline message) ──
   Matches the shake/scroll/toast pattern already used in Cash Book and the
   Master Data pages, extended here to the Accounts Payable modals. */
@keyframes cm3-field-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
}
.CM3-field.err .CM3-input,
.CM3-field.err .CM3-textarea,
.CM3-field.err .CM3-sdd-trigger {
  border-color: var(--error,#D93B55) !important;
  animation: cm3-field-shake 0.4s ease;
}
.CM3-field-err-msg {
  display: flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 800; color: var(--error,#D93B55);
  margin-top: 4px;
}

/* ── SDD Portal Dropdown ── */
@keyframes sdd-open{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}
/* ── SDD Trigger ── */
.CM3-sdd-trigger{width:100%;display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--white,#fff);border:1.5px solid #E2E8F0;border-radius:10px;cursor:pointer;min-height:40px;transition:border-color .18s,box-shadow .18s;outline:none;}
.CM3-sdd-trigger:hover{border-color:#C8B8AF;background:#F8FAFC;}
.CM3-sdd-trigger.open{border-color:var(--sdd-accent,#3B82F6);box-shadow:0 0 0 3px color-mix(in srgb,var(--sdd-accent,#3B82F6) 12%,transparent);}
.CM3-sdd-trigger.has-val{border-color:rgba(29,78,216,0.30);}
.CM3-sdd-trig-av{width:20px;height:20px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;font-weight: 800;border:1px solid transparent;}
/* Matches .CM3-input's 11px/700 exactly — a dropdown's selected value and a
   typed input's value are both just "the value of a field" and should read
   at the same size/weight throughout Accounts Payable. */
.CM3-sdd-val{font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 13px;font-weight: 800;color:#0d0905;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
.CM3-sdd-val.ph{color:var(--text-4,#94A3B8);font-weight: 600;}
.CM3-sdd-val-sub{color:#6b7280;font-size: 11px;margin-left:4px;}
/* ── SDD Panel ── */
.CM3-sdd-panel{background:#fff;border:1.5px solid rgba(29,78,216,0.15);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08),0 8px 28px rgba(0,0,0,0.07);overflow:hidden;animation:sdd-open .18s cubic-bezier(.22,.68,0,1.15) both;transform-origin:top center;}
/* Search */
.CM3-sdd-search{display:flex;align-items:center;gap:8px;padding:7px 11px;border-bottom:1px solid #E9EEF5;background:#F8FAFC;}
.CM3-sdd-inp{flex:1;border:none;outline:none;background:transparent;font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 12.5px;font-weight:700;color:#0d0905;}
.CM3-sdd-inp::placeholder{color:var(--text-4,#94A3B8);}
.CM3-sdd-clr{display:flex;align-items:center;justify-content:center;width:16px;height:16px;background:none;border:none;cursor:pointer;color:var(--text-4,#94A3B8);border-radius:4px;transition:all .15s;flex-shrink:0;}
.CM3-sdd-clr:hover{background:#fef2f2;color:#D93B55;}
/* List */
.CM3-sdd-list{max-height:160px;overflow-y:auto;overscroll-behavior:contain;}
.CM3-sdd-list::-webkit-scrollbar{width:3px;}
.CM3-sdd-list::-webkit-scrollbar-thumb{background:#E0D4CC;border-radius:3px;}
.CM3-sdd-list::-webkit-scrollbar-track{background:transparent;}
/* Items */
.CM3-sdd-item{display:flex;align-items:center;gap:8px;padding:6px 11px;cursor:pointer;border-bottom:1px solid #FAF5F0;transition:background .1s;}
.CM3-sdd-item:last-child{border-bottom:none;}
.CM3-sdd-item:hover{background:#FDF7F3;}
.CM3-sdd-item.selected{background:rgba(29,78,216,0.05);}
.CM3-sdd-av{width:20px;height:20px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;font-weight: 800;border:1px solid transparent;}
.CM3-sdd-item-text{flex:1;min-width:0;}
.CM3-sdd-item-label{font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 12px;font-weight: 800;color:#0d0905;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.CM3-sdd-item.selected .CM3-sdd-item-label{color:var(--ember,#2563EB);font-weight: 700;}
.CM3-sdd-check{display:flex;align-items:center;flex-shrink:0;}
.CM3-sdd-clear{color:var(--error,#D93B55);gap:6px;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;font-weight: 700;letter-spacing:.3px;border-bottom:1px solid #E9EEF5;}
.CM3-sdd-clear:hover{background:#fef2f2;}
.CM3-sdd-empty{padding:12px 14px;text-align:center;color:#6b7280;font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 11px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:6px;}
.CM3-sdd-sub{font-size: 9.5px;color:#6b7280;margin-top:1px;letter-spacing:.3px;font-family:var(--font-mono,'JetBrains Mono',monospace);text-transform:uppercase;}
/* Footer */
.CM3-sdd-footer{padding:4px 11px;background:#F8FAFC;border-top:1px solid #E9EEF5;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;color:var(--text-4,#94A3B8);letter-spacing:.6px;display:flex;align-items:center;justify-content:space-between;}

/* ── MODAL BUTTONS ── */
.CM3-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 20px;
    min-height: 38px;
    border-radius: 9px;
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 10px; font-weight: 800; letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer; border: none; transition: all 0.18s;
}
.CM3-btn.primary,
.CM3-btn.credit,
.CM3-btn.payment { background: linear-gradient(135deg, var(--ember,#2563EB), var(--ember-mid,#3B82F6)); color: #fff; box-shadow: var(--sh-ember,0 4px 18px rgba(29,78,216,0.28)); }
.CM3-btn.primary:hover,
.CM3-btn.credit:hover,
.CM3-btn.payment:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(29,78,216,0.38); }
.CM3-btn.ghost { background: var(--white,#fff); color: var(--text-2,#3d3d3d); border: 1.5px solid var(--border,#E9EEF5); }
.CM3-btn.ghost:hover { transform: translateY(-1px); border-color: var(--ember-border,#f5d87a); background: var(--off-white,#F8FAFC); }
.CM3-btn.back { background: var(--surface,#F1F5F9); color: var(--text-3,#64748b); border: 1.5px solid var(--border,#E9EEF5); }
.CM3-btn.back:hover { transform: translateY(-1px); border-color: var(--ember-border,#f5d87a); background: var(--off-white,#F8FAFC); }
/* Icon-only variant — used for the step-wizard "Back" control so it reads
   as a compact, professional nav affordance instead of a bulky labeled
   button; the shared arrow glyph is reused rotated 180deg to point left. */
.CM3-btn.icon-only { width: 34px; padding: 0; gap: 0; }
.CM3-btn.icon-only svg { transform: rotate(180deg); transition: transform 0.18s; }
.CM3-btn.icon-only:hover svg { transform: rotate(180deg) translateX(-2px); }
.CM3-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }

/* ── SPINNER ── */
.CM3-spin {
    display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%; animation: erp-spin 0.7s linear infinite;
}

/* ── STEP WIZARD ── */
.CM3-steps { display:flex; align-items:center; gap:0; padding:10px 20px; background:var(--off-white,#F8FAFC); border-bottom:1px solid var(--border,#E9EEF5); flex-shrink:0; }
.CM3-step { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.CM3-step-dot {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--border,#E9EEF5); background: var(--white,#fff);
    font-size: 9px; font-weight: 800; color: var(--text-4,#9ca3af);
    transition: all 0.2s;
}
.CM3-step.active .CM3-step-dot { border-color: var(--ember-mid,#3B82F6); background: linear-gradient(135deg,var(--ember,#2563EB),var(--ember-mid,#3B82F6)); color: #fff; }
.CM3-step.done .CM3-step-dot { border-color: #10b981; background: #10b981; color: #fff; }
.CM3-step-lbl { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--text-4,#94A3B8); transition: color 0.2s; }
.CM3-step.active .CM3-step-lbl { color: var(--ember-mid,#3B82F6); }
.CM3-step.done .CM3-step-lbl { color: #10b981; }
.CM3-step-line { width: 24px; height: 1.5px; background: var(--border,#E9EEF5); margin: 0 4px; }
.CM3-step.done + .CM3-step .CM3-step-line { background: #10b981; }

/* ── STEP CONTENT ── */
.CM3-step-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.CM3-step-num { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; font-size: 28px; font-weight: 800; color: var(--border,#D4D5D8); line-height: 1; }
.CM3-step-ttl { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; text-transform: uppercase; letter-spacing: 0.3px; font-size: 13px; font-weight: 800; color: var(--text-1,#0F172A); }
.CM3-step-desc { font-size: 11.5px; font-weight: 600; color: #374151; margin-top: 3px; }

/* ── SECTION SEPARATOR (like BioData section tag) ── */
.CM3-section { display: flex; align-items: center; gap: 10px; margin: 18px 0 12px; }
.CM3-section-tag {
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 9.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--ember,#2563EB); white-space: nowrap;
    background: rgba(29,78,216,0.07); padding: 4px 11px; border-radius: 100px;
    border: 1px solid var(--ember-border,rgba(29,78,216,0.18));
}
.CM3-section-rule { flex: 1; height: 1px; background: var(--border,#E9EEF5); }
.CM3-section-sep { height: 1px; background: var(--border,#E9EEF5); margin: 14px 0; }

/* ── PREVIEW / CONFIRM CARDS ── */
.CM3-prev-card { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-top: 12px; }
.CM3-prev-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.CM3-prev-lbl { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #78350f; }
.CM3-prev-val { font-size: 13px; font-weight: 800; color: #C47E0A; }

.CM3-sel-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--surface,#F1F5F9); border: 1.5px solid var(--border,#E9EEF5); border-radius: 10px; margin-top: 10px; }
.CM3-sel-av { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 900; flex-shrink: 0; border: 1.5px solid; }
.CM3-sel-name { font-size: 13.5px; font-weight: 800; color: #0d0905; }
.CM3-sel-sub { font-size: 10.5px; color: #6b7280; margin-top: 1px; }
.CM3-sel-badge { margin-left: auto; padding: 4px 11px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 100px; font-size: 9.5px; font-weight: 800; color: #C47E0A; letter-spacing: 0.06em; text-transform: uppercase; }
.CM3-sel-badge.teal { background: ${E.light}; border-color: ${E.border}; color: ${E.primary}; }

/* ── NOTICE BOXES ── */
.CM3-notice {
    display: flex; align-items: flex-start; gap: 9px; padding: 11px 14px;
    border-radius: 9px; font-size: 11.5px; font-weight: 600; border: 1px solid; margin-bottom: 14px;
}
.CM3-notice.red { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.CM3-notice.teal { background: #f0fdfa; border-color: #99f6e4; color: #065f46; }
.CM3-notice.blue { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }

/* ── MANDATORY CLIENT BOX ── */
.CM3-mandatory-client { border: 2px solid rgba(13,148,136,0.3); border-radius: 12px; overflow: hidden; }
.CM3-mandatory-client-hdr { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(13,148,136,0.06); border-bottom: 1px solid rgba(13,148,136,0.15); }
.CM3-mandatory-client-title { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${E.primary}; }
.CM3-mandatory-client-body { padding: 12px 14px; }

/* ── DAYBOOK BOX ──
   Smaller box, smaller text, and a real 3-column grid for the short fields
   (Party / Category / Sub-category) instead of the 2-col layout that pushed
   Sub-category onto its own half-empty row. */
.CM3-db-box { padding: 10px 12px; border: 1.5px solid ${E.border}; border-radius: 8px; background: rgba(13,148,136,0.03); margin-top: 12px; }
.CM3-db-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.CM3-db-toggle-title { font-size: 8.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: ${E.primary}; display: flex; align-items: center; gap: 5px; }
.CM3-db-toggle-sub { font-size: 8px; font-weight: 600; color: #6b7280; margin-top: 2px; }

/* 3-up grid for the daybook fields — Party / Category / Sub-category share one
   row; Client Name and Narration span the full width below. */
.CM3-db-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 10px; }
@media(max-width:760px) { .CM3-db-grid { grid-template-columns: 1fr 1fr; } }

/* Everything inside the daybook box runs a notch smaller than the rest of the
   form — it's a secondary/auto-filled section, not the primary input step. */
.CM3-db-box .CM3-field-label { font-size: 8px; margin-bottom: 2px; }
.CM3-db-box .CM3-sdd-trigger { min-height: 26px; padding: 4px 8px; gap: 5px; }
.CM3-db-box .CM3-sdd-trig-av { width: 14px; height: 14px; border-radius: 4px; font-size: 6.5px; }
.CM3-db-box .CM3-sdd-val { font-size: 10px; }
.CM3-db-box .CM3-sdd-val-sub { font-size: 8.5px; }
.CM3-db-box .CM3-input { min-height: 28px; padding: 5px 9px; font-size: 10px; }
.CM3-db-hint { font-size: 8px; color: ${E.primary}; margin-top: 2px; font-weight: 700; }
.CM3-db-client-box { display: flex; align-items: center; gap: 5px; padding: 5px 8px; background: rgba(0,0,0,0.03); border: 1.5px solid var(--bd,#e2e2e2); border-radius: 7px; min-height: 26px; }

/* ── PAYMENT DETAILS (01) ──
   Was bumped bigger than the rest of the form in an earlier pass; per the
   later "everything in Accounts Payable should be one consistent size,
   except the Cash Book Sync box" instruction, this now matches the standard
   .CM3-label/.CM3-input sizing used everywhere else instead of its own
   larger scale — only the Cash Book Sync box stays deliberately smaller. */
.CM3-pd-grid .CM3-sdd-trigger { min-height: 40px; }
.CM3-pd-grid .CM3-sdd-trig-av { width: 22px; height: 22px; font-size: 8px; }

/* ── MSG ── */
.CM3-msg { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 9px; font-size: 9.5px; font-weight: 700; margin-top: 12px; animation: erp-fade-in 0.2s ease both; }
.CM3-msg.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.CM3-msg.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #1E9C6A; }

/* ── LEDGER COUNT PILL (legacy, kept for safety) ── */
.CM3-ledger-pill {
    padding: 6px 14px; background: var(--off-white,#F8FAFC);
    border: 1px solid var(--border,#E9EEF5); border-radius: 8px;
    font-size: 9px; font-weight: 800; color: var(--text-3,#64748b); letter-spacing: 0.08em;
    transition: all 0.2s;
}
.CM3-ledger-pill:hover { border-color: var(--ember-border,#f5d87a); color: var(--ember,#60A5FA); }

/* ── COLOR LEGEND PILLS ── */
.CM3-legend-pill {
    display: flex; align-items: center; gap: 6px; padding: 6px 12px;
    border-radius: 8px; font-size: 9px; font-weight: 800; letter-spacing: 0.06em;
    transition: transform 0.15s;
}
.CM3-legend-pill:hover { transform: translateY(-1px); }

/* ══════════════════════════════════════════════════════
   PREMIUM SCROLLBAR — Accounts Payable (ERP Light)
   ══════════════════════════════════════════════════════ */
@keyframes cm-sb-glow {
  0%,100% { box-shadow: 0 0 4px rgba(59,130,246,0.35), 0 0 10px rgba(29,78,216,0.15); }
  50%      { box-shadow: 0 0 9px rgba(59,130,246,0.62), 0 0 20px rgba(29,78,216,0.28); }
}

.CM3-vlist, .CM3-content, .CM3-mbody, .CM3-sdd-list {
  scrollbar-width: thin;
  scrollbar-color: #3B82F6 rgba(203,213,225,0.18);
}

.CM3-vlist::-webkit-scrollbar,
.CM3-content::-webkit-scrollbar,
.CM3-mbody::-webkit-scrollbar,
.CM3-sdd-list::-webkit-scrollbar { width: 3px; height: 3px; }

.CM3-vlist::-webkit-scrollbar-track,
.CM3-content::-webkit-scrollbar-track,
.CM3-mbody::-webkit-scrollbar-track,
.CM3-sdd-list::-webkit-scrollbar-track {
  background: rgba(203,213,225,0.15);
  border-radius: 99px;
}

.CM3-vlist::-webkit-scrollbar-thumb,
.CM3-content::-webkit-scrollbar-thumb,
.CM3-mbody::-webkit-scrollbar-thumb,
.CM3-sdd-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #60A5FA 0%, #3B82F6 45%, #2563EB 100%);
  border-radius: 99px;
  border: none;
  box-shadow: 0 0 3px rgba(59,130,246,0.25);
  transition: background 0.22s ease, box-shadow 0.22s ease;
}

.CM3-vlist::-webkit-scrollbar-thumb:hover,
.CM3-content::-webkit-scrollbar-thumb:hover,
.CM3-mbody::-webkit-scrollbar-thumb:hover,
.CM3-sdd-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #BFDBFE 0%, #3B82F6 42%, #2563EB 100%);
  box-shadow: 0 0 8px rgba(59,130,246,0.55), 0 0 16px rgba(29,78,216,0.22);
  animation: cm-sb-glow 1.8s ease-in-out infinite;
}

/* ── BILL ALLOCATION STEP (Select Client / Select Bill) ──
   Centered popup dialog, matching the other 3 forms — sized bigger than a
   plain form dialog since it hosts a real data table, but still a floating
   card over a dim/blurred backdrop rather than taking over the screen. */
.CM3-alloc-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.52);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  z-index: 11000; display: flex; align-items: center; justify-content: center; padding: 24px;
  animation: cm3-overlay-in 0.22s ease both;
}
.CM3-alloc-modal {
  background: var(--white,#fff); border-radius: 22px; width: 100%; max-width: 860px;
  box-shadow: 0 6px 28px rgba(0,0,0,0.10), 0 32px 88px rgba(0,0,0,0.24);
  overflow: hidden; display: flex; flex-direction: column;
  animation: cm3-modal-in 0.42s cubic-bezier(0.22,1,0.36,1) both;
  max-height: min(92dvh, 88vh);
}
@media (max-width: 1080px) {
    .CM3-alloc-modal { max-width: calc(100vw - 32px); }
}
@media (max-width: 640px) {
    .CM3-alloc-overlay { padding: 0; align-items: flex-end; }
    .CM3-alloc-modal { max-width: 100%; border-radius: 18px 18px 0 0; max-height: min(94dvh,94vh); }
}
.CM3-alloc-hdr {
  padding: 18px 22px 16px; border-bottom: 1.5px solid var(--border,#E9EEF5); flex-shrink: 0;
  background: var(--surface,#F8FAFC); position: relative;
}
/* "Back" — this step sits inside the repayment wizard, so dismissing it
   returns to the previous step rather than closing the whole flow; kept as
   a labeled control (not a bare X) so that distinction stays legible. */
.CM3-alloc-close {
  position: absolute; top: 16px; right: 22px;
  display: flex; align-items: center; gap: 7px;
  height: 32px; padding: 0 15px 0 6px; border-radius: 100px;
  border: 1.5px solid #BFDBFE;
  background: linear-gradient(135deg,#F3E8FF,#EDE9FE);
  cursor: pointer;
  color: #9a3412;
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.CM3-alloc-close-ic {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: #fff; border: 1.5px solid #BFDBFE;
  transition: border-color 0.18s;
}
.CM3-alloc-close svg { transform: rotate(180deg); transition: transform 0.18s; }
.CM3-alloc-close:hover {
  background: linear-gradient(135deg,#EDE9FE,#DDD6FE); border-color: #60A5FA; color: #2563EB;
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(29,78,216,0.18);
}
.CM3-alloc-close:hover .CM3-alloc-close-ic { border-color: #60A5FA; }
.CM3-alloc-close:hover svg { transform: rotate(180deg) translateX(3px); }
.CM3-alloc-close:active { transform: translateY(0) scale(0.96); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.CM3-alloc-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 13.5px; font-weight: 800; font-style: normal; color: #0F172A; text-transform: uppercase; letter-spacing: 0.3px; }
.CM3-alloc-sub { font-size: 9.5px; font-weight: 700; color: #6b7280; margin-top: 4px; }
/* Icon badge next to the title — matches the icon-boxes on the other 3 full
   pages (Ledger/Bill/Payment) and gives this step a pop-in entrance. */
@keyframes cm3-badge-pop { from{opacity:0; transform:scale(0.5) rotate(-10deg);} to{opacity:1; transform:scale(1) rotate(0);} }
.CM3-alloc-hdr-row { display: flex; align-items: center; gap: 12px; }
.CM3-alloc-hdr-ic {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #fff; border: 1.5px solid #BFDBFE;
  animation: cm3-badge-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes cm3-chip-pop { from{opacity:0; transform:translateY(-3px) scale(0.9);} to{opacity:1; transform:none;} }
@keyframes cm3-chip-pulse { 0%,100%{ box-shadow:0 0 0 0 rgba(217,119,6,0.28); } 50%{ box-shadow:0 0 0 5px rgba(217,119,6,0); } }
.CM3-alloc-chip { display:inline-flex; align-items:center; gap:5px; padding: 4px 10px; border-radius: 6px; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; margin-top: 8px; background: var(--white,#fff); border: 1px solid var(--border,#E9EEF5); color: #4b5563; animation: cm3-chip-pop 0.22s ease both; }
.CM3-alloc-chip.amber { color: #92400e; border-color: #fde68a; background: #fffbeb; animation: cm3-chip-pop 0.22s ease both, cm3-chip-pulse 1.8s ease-in-out 0.3s infinite; }
.CM3-alloc-body { flex: 1; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.CM3-alloc-body::-webkit-scrollbar { width: 3px; }
.CM3-alloc-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
/* Bill picker — real table (rows & columns), orange header + warm-white body,
   matching the same Bills-table theme used across the rest of Accounts Payable.
   The wrap scrolls its own body with a sticky header, so a client with many bills
   scrolls inside the table instead of stretching the whole modal off-screen. */
.CM3-alloc-billtbl-wrap {
  border: 1.5px solid var(--border,#E9EEF5); border-radius: 12px;
  max-height: 48vh; overflow-y: auto; overflow-x: hidden;
}
.CM3-alloc-billtbl-wrap::-webkit-scrollbar { width: 6px; }
.CM3-alloc-billtbl-wrap::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius: 3px; }
.CM3-alloc-billtbl-wrap::-webkit-scrollbar-thumb:hover { background: #BFDBFE; }
.CM3-alloc-billtbl { width: 100%; border-collapse: collapse; }
.CM3-alloc-billtbl thead th {
  background: var(--surface-2,#E9EEF5); color: var(--text-3,#27364A);
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase;
  padding: 9px 12px; text-align: left; white-space: nowrap;
  border-bottom: 2px solid var(--ember,#2563EB);
  position: sticky; top: 0; z-index: 1;
}
.CM3-alloc-billtbl tbody tr { cursor: pointer; }
.CM3-alloc-billtbl tbody tr.bill-row { animation: cm3-row-pop-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
.CM3-alloc-billtbl tbody tr.bill-row:nth-child(odd) td { background: var(--surface,#F8FAFC); }
.CM3-alloc-billtbl tbody tr.bill-row:not(:last-child) td { border-bottom: 1px solid var(--border,#E9EEF5); }
.CM3-alloc-billtbl tbody tr.bill-row td { transition: background 0.18s, box-shadow 0.2s; box-shadow: inset 0 0 0 0 transparent; }
.CM3-alloc-billtbl tbody tr.bill-row:hover td { background: #F3E8FF; }
.CM3-alloc-billtbl tbody tr.bill-row:hover td:first-child { box-shadow: inset 4px 0 0 0 #3B82F6; }
.CM3-alloc-billtbl tbody tr.bill-row.selected td:first-child { box-shadow: inset 4px 0 0 0 #2563EB; }
.CM3-alloc-billtbl tbody tr.bill-row.selected td { background: #fff1e6; }
.CM3-alloc-billtbl tbody tr.bill-row.closed-bill { opacity: 0.45; pointer-events: none; }
.CM3-alloc-billtbl td { padding: 9px 12px; vertical-align: middle; }
.CM3-alloc-billtbl-check-cell { width: 30px; }
.CM3-alloc-billtbl-inv { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; color: #0F172A; }
.CM3-alloc-billtbl-client { font-size: 9px; font-weight: 800; color: #2563EB; }
.CM3-alloc-billtbl-amt { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; color: #374151; white-space: nowrap; }
.CM3-alloc-billtbl-date { font-size: 9px; color: #6b7280; white-space: nowrap; }
.CM3-alloc-billtbl-bal-cell { text-align: right; }
.CM3-alloc-billtbl-bal { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; color: #0F172A; white-space: nowrap; }
.CM3-alloc-billtbl-preview-row td { padding: 0 12px 9px; background: #F3E8FF; border-bottom: 1px solid var(--border,#E9EEF5); }
/* Checkbox-style bill selector — square, animated check glyph pops in,
   filled orange (will close the bill) or amber (partial payment) when picked. */
@keyframes cm3-check-pop { 0%{opacity:0; transform:scale(0.4);} 60%{opacity:1; transform:scale(1.2);} 100%{opacity:1; transform:scale(1);} }
.CM3-alloc-check {
  width: 18px; height: 18px; border-radius: 6px; border: 2px solid var(--border,#D4D5D8);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #fff; transition: all 0.16s cubic-bezier(0.34,1.56,0.64,1);
}
.CM3-alloc-check svg { animation: cm3-check-pop 0.24s cubic-bezier(0.34,1.56,0.64,1) both; }
.CM3-alloc-check.will-close {
  border-color: #2563EB; background: linear-gradient(135deg,#2563EB,#3B82F6);
  transform: scale(1.08); box-shadow: 0 2px 8px rgba(29,78,216,0.35);
}
.CM3-alloc-check.will-partial {
  border-color: #f59e0b; background: linear-gradient(135deg,#f59e0b,#fbbf24);
  transform: scale(1.08); box-shadow: 0 2px 8px rgba(245,158,11,0.3);
}
.CM3-alloc-billtbl tbody tr.bill-row:hover .CM3-alloc-check { border-color: #BFDBFE; }
.CM3-alloc-bill {
  display: flex; align-items: center; gap: 14px; padding: 20px 22px;
  border: 1.5px solid var(--border,#E9EEF5); border-radius: 14px;
  cursor: pointer; transition: all 0.15s; background: var(--white,#fff);
}
.CM3-alloc-bill:hover { border-color: #BFDBFE; background: #F3E8FF; }
.CM3-alloc-bill.selected { border-color: #2563EB; background: #F3E8FF; box-shadow: 0 0 0 3px rgba(29,78,216,0.10); }
.CM3-alloc-bill.will-close { border-color: #2563EB; background: #F3E8FF; }
.CM3-alloc-bill.will-partial { border-color: #f59e0b; background: #fffbeb; }
.CM3-alloc-bill.closed-bill { opacity: 0.42; pointer-events: none; background: #f8fafc; }
.CM3-alloc-radio {
  width: 17px; height: 17px; border-radius: 50%; border: 2px solid var(--border,#D4D5D8);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.CM3-alloc-bill.selected .CM3-alloc-radio,
.CM3-alloc-bill.will-close .CM3-alloc-radio { border-color: #2563EB; background: #2563EB; transform: scale(1.05); }
.CM3-alloc-bill.will-partial .CM3-alloc-radio { border-color: #f59e0b; background: #f59e0b; }
.CM3-alloc-radio-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; }
.CM3-alloc-info { flex: 1; min-width: 0; }
.CM3-alloc-bill-num { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-4,#94A3B8); }
.CM3-alloc-bill-desc { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10.5px; font-weight: 700; color: var(--text-1,#0F172A); margin-top: 2px; }
.CM3-alloc-bill-meta { display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap; }
.CM3-alloc-bill-remaining { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; color: #D93B55; }
.CM3-alloc-bill-date { font-size: 9px; color: var(--text-4,#94A3B8); }
.CM3-alloc-bill-closed-tag { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 100px; background: #F3E8FF; border: 1px solid #BFDBFE; color: #2563EB; }
.CM3-alloc-bill-overdue { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 0.7px; padding: 2px 7px; border-radius: 100px; background: #fef2f2; border: 1px solid #fecaca; color: #D93B55; }
.CM3-alloc-preview { margin-top: 5px; padding: 5px 8px; border-radius: 7px; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8.5px; font-weight: 800; display: flex; align-items: center; gap: 5px; animation: cm3-chip-pop 0.2s ease both; }
.CM3-alloc-preview.closes { background: #F3E8FF; color: #2563EB; border: 1px solid #BFDBFE; }
.CM3-alloc-preview.partial { background: #fffbeb; color: #C47E0A; border: 1px solid #fde68a; }

/* ── Client drill-down (premium, mirrors sidebar Category→Names UX) ── */
.CM3-alloc-back {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 8px 10px; margin-bottom: 4px; border-radius: 8px;
  border: 1px dashed var(--border,#E9EEF5); background: #fff;
  cursor: pointer; transition: background 0.15s, border-color 0.15s; text-align: left;
  animation: cm3-page-in 0.2s ease both;
}
.CM3-alloc-back:hover { border-color: #d1d5db; background: var(--surface,#F8FAFC); }
.CM3-alloc-back-ic {
  width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface,#F1F5F9); border: 1px solid var(--border,#E9EEF5); color: #4b5563;
  transition: transform 0.18s;
}
.CM3-alloc-back:hover .CM3-alloc-back-ic { transform: translateX(-2px); }
.CM3-alloc-back-name {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 11px;
  color: #0F172A;
}
.CM3-alloc-back-count {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  color: #6b7280; background: var(--surface,#F1F5F9); padding: 2px 8px; border-radius: 100px; border: 1px solid var(--border,#E9EEF5); flex-shrink: 0;
}

/* Client picker — real table (rows & columns), bigger modal, readable font.
   Scrolls its own body with a sticky header once the client list runs long. */
.CM3-alloc-tbl-wrap {
  border: 1.5px solid var(--border,#E9EEF5); border-radius: 12px;
  max-height: 48vh; overflow-y: auto; overflow-x: hidden;
}
.CM3-alloc-tbl-wrap::-webkit-scrollbar { width: 6px; }
.CM3-alloc-tbl-wrap::-webkit-scrollbar-thumb { background: var(--border,#E9EEF5); border-radius: 3px; }
.CM3-alloc-tbl-wrap::-webkit-scrollbar-thumb:hover { background: #BFDBFE; }
.CM3-alloc-tbl { width: 100%; border-collapse: collapse; }
.CM3-alloc-tbl thead th {
  background: var(--surface-2,#E9EEF5); color: var(--text-3,#27364A);
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase;
  padding: 9px 12px; text-align: left;
  border-bottom: 2px solid var(--ember,#2563EB);
  position: sticky; top: 0; z-index: 1;
}
.CM3-alloc-tbl tbody tr {
  cursor: pointer; animation: cm3-row-pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
}
.CM3-alloc-tbl tbody tr:nth-child(odd) td { background: var(--surface,#F8FAFC); }
.CM3-alloc-tbl tbody tr td { transition: background 0.18s, box-shadow 0.2s; box-shadow: inset 0 0 0 0 transparent; }
.CM3-alloc-tbl tbody tr:hover td:first-child { box-shadow: inset 4px 0 0 0 #3B82F6; }
.CM3-alloc-tbl tbody tr:not(:last-child) td { border-bottom: 1px solid var(--border,#E9EEF5); }
.CM3-alloc-tbl tbody tr:hover td { background: #F3E8FF; }
.CM3-alloc-tbl tbody tr:active td { background: #ffe9d5; }
.CM3-alloc-tbl td { padding: 9px 12px; vertical-align: middle; }
.CM3-alloc-tbl-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10px; font-weight: 800; color: #0F172A;
  display: flex; align-items: center; gap: 8px;
}
.CM3-alloc-tbl-avatar {
  width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg,#3B82F6,#2563EB); color: #fff;
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10px; font-weight: 800;
  box-shadow: 0 2px 6px rgba(29,78,216,0.22);
}
.CM3-alloc-tbl-bills-pill {
  display: inline-flex; align-items: center; font-size: 9px; font-weight: 800;
  color: #6b7280; background: var(--white,#fff); border: 1px solid var(--border,#E9EEF5);
  border-radius: 100px; padding: 3px 10px;
}
.CM3-alloc-tbl-due { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 10.5px; font-weight: 800; color: #0F172A; text-align: right; }
.CM3-alloc-tbl-chev { text-align: right; width: 80px; white-space: nowrap; }
.CM3-alloc-tbl-chev svg { color: #9ca3af; transition: transform 0.2s, color 0.2s; vertical-align: middle; }
.CM3-alloc-tbl-select {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8.5px; font-weight: 800;
  letter-spacing: 0.6px; text-transform: uppercase; color: #2563EB; margin-right: 6px;
  opacity: 0; transform: translateX(4px); transition: opacity 0.18s, transform 0.18s;
}
.CM3-alloc-tbl tbody tr:hover .CM3-alloc-tbl-select { opacity: 1; transform: translateX(0); }
.CM3-alloc-tbl tbody tr:hover .CM3-alloc-tbl-chev svg { color: #2563EB; transform: translateX(3px); }

.CM3-alloc-footer { padding: 16px 22px; border-top: 1.5px solid var(--border,#E9EEF5); display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; background: var(--surface,#F1F5F9); }

/* ── BILL CLOSED / PAYMENT CELEBRATION ──
   Now the single success signal (no more redundant toast alongside it), so it
   carries more animation weight: a bigger/wider confetti burst, a twinkling
   sparkle ring, a glow-pulsing check icon, and a shimmer sweep on the amount
   badge instead of the plainer version from before. */
@keyframes cm3-stamp-in {
  0%  { transform: scale(2.5) rotate(-8deg); opacity: 0; }
  50% { transform: scale(0.92) rotate(2deg); opacity: 1; }
  70% { transform: scale(1.08) rotate(-2deg); }
  85% { transform: scale(0.97) rotate(1deg); }
  100%{ transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes cm3-check-glow {
  0%, 100% { box-shadow: 0 8px 28px rgba(29,78,216,0.28), 0 0 0 0 rgba(29,78,216,0.35); }
  50%      { box-shadow: 0 8px 28px rgba(29,78,216,0.28), 0 0 0 10px rgba(29,78,216,0); }
}
@keyframes cm3-confetti-pop { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
@keyframes cm3-confetti-fly {
  0%   { opacity:1; transform:translate(0,0) rotate(0deg); }
  100% { opacity:0; transform:translate(var(--cm3-drift,0), -130px) rotate(720deg); }
}
@keyframes cm3-ring-pulse {
  0%   { transform:scale(0.6); opacity:0.8; }
  100% { transform:scale(2.2); opacity:0; }
}
@keyframes cm3-sparkle-twinkle {
  0%   { opacity:0; transform:scale(0) rotate(0deg); }
  40%  { opacity:1; transform:scale(1.15) rotate(45deg); }
  70%  { opacity:1; transform:scale(0.9) rotate(75deg); }
  100% { opacity:0; transform:scale(0.4) rotate(120deg); }
}
@keyframes cm3-badge-shimmer {
  0%   { transform: translateX(-120%) skewX(-15deg); }
  100% { transform: translateX(220%) skewX(-15deg); }
}
.CM3-closed-celebrate {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #F1F5F9 0%, #F3E8FF 55%, #EDE9FE 100%);
  border: 2px solid #BFDBFE;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 10; border-radius: 20px; overflow: hidden;
}
.CM3-closed-ring {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  border: 2.5px solid rgba(29,78,216,0.18);
  animation: cm3-ring-pulse 1s ease-out 0.1s both;
}
.CM3-closed-ring2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  border: 1.5px solid rgba(29,78,216,0.09);
  animation: cm3-ring-pulse 1.1s ease-out 0.25s both;
}
.CM3-sparkle {
  position: absolute; z-index: 2; pointer-events: none;
  animation: cm3-sparkle-twinkle 1s ease-out both;
}
.CM3-closed-stamp-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  animation: cm3-stamp-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
  position: relative; z-index: 1;
}
.CM3-closed-check {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  border: 3px solid rgba(29,78,216,0.18);
  box-shadow: 0 8px 28px rgba(29,78,216,0.28);
  display: flex; align-items: center; justify-content: center;
  animation: cm3-check-glow 1.4s ease-in-out 0.7s infinite;
}
.CM3-closed-txt {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 19.5px; font-weight: 900; color: #2563EB;
  letter-spacing: 4px; text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(29,78,216,0.10);
}
.CM3-closed-sub {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 11.5px; color: #92400e; margin-top: -8px; font-weight: 700;
}
.CM3-closed-amt-badge {
  position: relative;
  padding: 8px 20px;
  background: #fff;
  border: 1.5px solid #BFDBFE;
  box-shadow: 0 2px 12px rgba(29,78,216,0.10);
  border-radius: 100px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 800; color: #2563EB; margin-top: 4px;
  overflow: hidden;
}
.CM3-closed-amt-badge::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent);
  animation: cm3-badge-shimmer 1.6s ease-in-out 0.9s infinite;
}
.CM3-confetti-piece {
  position: absolute; border-radius: 3px;
  animation: cm3-confetti-fly 1.1s ease-out both;
}

/* ── CLOSED BILL STAMP ── */
.CM3-closed-stamp {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 100px;
  background: #F3E8FF; border: 1.5px solid #BFDBFE; color: #2563EB;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
}
.CM3-closed-stamp-dot { width: 5px; height: 5px; border-radius: 50%; background: #2563EB; }

/* ── OVERDUE WARNING STRIP ── */
.CM3-due-warn {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 8px;
  background: #fef2f2; border: 1px solid #fecaca; color: #D93B55;
  font-size: 9px; font-weight: 700; margin-top: 4px;
}
.CM3-due-near {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 8px;
  background: #fffbeb; border: 1px solid #fde68a; color: #C47E0A;
  font-size: 9px; font-weight: 700; margin-top: 4px;
}
`;function R({categories:e,subCategories:t,bioData:n,vendors:r,onClose:a,onSaved:o,editVendor:s,presetCategoryId:c}){let[l,u]=(0,b.useState)(0),[d,p]=(0,b.useState)(!1),[m,g]=(0,b.useState)(``),[_,v]=(0,b.useState)(null),y=(0,b.useRef)(null),C=(0,b.useRef)(null),[w,T]=(0,b.useState)({open:!1,fields:[],pendingPayload:null}),O=!s&&c!=null&&e.find(e=>e.id===c)||null,[k,A]=(0,b.useState)({category_id:s?.category_id?String(s.category_id):O?String(O.id):``,sub_category_id:s?.sub_category_id?String(s.sub_category_id):``,bio_data_id:s?.bio_data_id?String(s.bio_data_id):``}),N=(e,t)=>A(n=>({...n,[e]:t})),P=e.filter(e=>!e.type||e.type.toLowerCase()===`expense`),L=k.category_id?t.filter(e=>e.category_id===+k.category_id):[],ee=new Set(P.map(e=>e.id)),R=n.filter(e=>e.category_id?ee.has(e.category_id):!0).filter(e=>k.category_id?!(e.category_id&&e.category_id!==+k.category_id||k.sub_category_id&&e.sub_category_id&&e.sub_category_id!==+k.sub_category_id):!0),z=n.find(e=>String(e.id)===k.bio_data_id),B=e.find(e=>String(e.id)===k.category_id),V=t.find(e=>String(e.id)===k.sub_category_id),H=e=>A(t=>({...t,category_id:e,sub_category_id:``,bio_data_id:``})),U=e=>A(t=>({...t,sub_category_id:e,bio_data_id:``})),te=!!k.category_id,ne=!!k.bio_data_id,W=async e=>{p(!0),g(``);try{s?(await f.put(`/api/credit-management/vendors/${s.id}`,e,{headers:D()}),i.success(`Vendor Updated!`,`Vendor record saved successfully`)):(await f.post(`credit-management/vendors`,e,{headers:D()}),i.success(`Vendor Added!`,`New vendor registered successfully`)),o()}catch(e){let t=j(e,`Could not save vendor`);g(t),i.error(`Save Failed`,t)}finally{p(!1)}},re=async()=>{if(!k.category_id||!k.bio_data_id){g(`Please select account head and party name.`),i.warning(`Required Fields`,`Please select an Account Head and Party Name.`);return}let e={category_id:+k.category_id,sub_category_id:k.sub_category_id?+k.sub_category_id:null,bio_data_id:+k.bio_data_id,party_name:z?.name||``};if(!s){let t=r.find(e=>e.bio_data_id===+k.bio_data_id);if(t){T({open:!0,fields:[{label:`Party Name`,value:t.party_name}],pendingPayload:e});return}}await W(e)},G=[`Classification`,`Party Name`,`Confirm`],K=B?.name||`Party`;return(0,S.jsxs)(S.Fragment,{children:[(0,x.createPortal)((0,S.jsx)(`div`,{className:`CM3-overlay`,onClick:a,children:(0,S.jsxs)(`div`,{className:`CM3-modal CM3-modal-lg`,onClick:e=>e.stopPropagation(),children:[(0,S.jsxs)(`div`,{className:`CM3-mhdr ledger-top`,children:[(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:[(0,S.jsx)(`div`,{className:`CM3-mhdr-ic`,children:(0,S.jsx)(F,{n:`layers`,sz:18,c:`#2563EB`})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-mtitle`,children:s?`Edit Ledger Account`:`Open Ledger Account`}),(0,S.jsx)(`div`,{className:`CM3-msub`,children:s?`Editing: ${s.party_name}`:`Create a credit ledger — vendor, manpower, contractor, etc.`})]})]}),(0,S.jsx)(`button`,{className:`CM3-mclose`,onClick:a,title:`Close`,"aria-label":`Close`,children:(0,S.jsx)(F,{n:`x`,sz:18})})]}),(0,S.jsx)(`div`,{className:`CM3-steps`,children:G.map((e,t)=>(0,S.jsxs)(`div`,{className:`CM3-step${t===l?` active`:t<l?` done`:``}`,children:[(0,S.jsx)(`div`,{className:`CM3-step-dot`,children:t<l?(0,S.jsx)(F,{n:`check`,sz:11,c:`#fff`}):(0,S.jsx)(`span`,{children:t+1})}),(0,S.jsx)(`span`,{className:`CM3-step-lbl`,children:e}),t<G.length-1&&(0,S.jsx)(`div`,{className:`CM3-step-line`})]},t))}),(0,S.jsxs)(`div`,{className:`CM3-mbody`,children:[l===0&&(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`CM3-step-head`,children:[(0,S.jsx)(`div`,{className:`CM3-step-num`,children:`01`}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-step-ttl`,children:`Select Classification`}),(0,S.jsx)(`div`,{className:`CM3-step-desc`,children:`Choose expense category — Vendor, Manpower, Contractor, Materials, etc.`})]})]}),(0,S.jsxs)(`div`,{className:`CM3-grid1`,children:[O?(0,S.jsxs)(`div`,{className:`CM3-field`,children:[(0,S.jsx)(`label`,{className:`CM3-label`,children:`Expense Account Head`}),(0,S.jsxs)(`div`,{className:`CM3-locked-field`,children:[(0,S.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,S.jsx)(`rect`,{x:`4`,y:`10`,width:`16`,height:`10`,rx:`2`}),(0,S.jsx)(`path`,{d:`M8 10V7a4 4 0 018 0v3`})]}),O.name]})]}):(0,S.jsxs)(`div`,{ref:y,className:`CM3-field${_===`category`?` err`:``}`,children:[(0,S.jsx)(I,{label:`Expense Account Head`,required:!0,options:P.map(e=>({value:String(e.id),label:e.name})),value:k.category_id,onChange:e=>{H(e),_===`category`&&v(null)},placeholder:`Select expense category…`,emptyMsg:`No expense categories found`}),_===`category`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Please select a category to continue`})]}),(0,S.jsx)(I,{label:`Account Sub-Head (Optional)`,options:L.map(e=>({value:String(e.id),label:e.name})),value:k.sub_category_id,onChange:U,placeholder:k.category_id?L.length===0?`No sub-categories`:`Select sub-category…`:`Select category first…`,disabled:!k.category_id||L.length===0,emptyMsg:`No sub-categories`})]}),B&&(0,S.jsxs)(`div`,{className:`CM3-prev-card`,style:{marginTop:14},children:[(0,S.jsxs)(`div`,{className:`CM3-prev-row`,children:[(0,S.jsx)(`span`,{className:`CM3-prev-lbl`,children:`Account Head`}),(0,S.jsx)(`span`,{className:`CM3-prev-val`,children:B.name})]}),V&&(0,S.jsxs)(`div`,{className:`CM3-prev-row`,style:{marginTop:6},children:[(0,S.jsx)(`span`,{className:`CM3-prev-lbl`,children:`Account Sub-Head`}),(0,S.jsx)(`span`,{className:`CM3-prev-val`,children:V.name})]})]})]}),l===1&&(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`CM3-step-head`,children:[(0,S.jsx)(`div`,{className:`CM3-step-num`,children:`02`}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`CM3-step-ttl`,children:[K,` Name & Client`]}),(0,S.jsx)(`div`,{className:`CM3-step-desc`,children:`Both party name and client are required to create a ledger.`})]})]}),(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8,padding:`8px 12px`,background:`#ecfdf5`,border:`1px solid #6ee7b7`,borderRadius:8,marginBottom:16,fontSize:10.5},children:[(0,S.jsx)(F,{n:`check`,sz:13,c:`#10b981`}),(0,S.jsxs)(`span`,{style:{fontWeight:700,color:`#065f46`},children:[B?.name,V?` › ${V.name}`:``]})]}),(0,S.jsxs)(`div`,{className:`CM3-grid1`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`CM3-notice blue`,style:{marginBottom:10},children:[(0,S.jsx)(F,{n:`user`,sz:13,c:`#2563eb`}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`strong`,{children:[K,` Name *`]}),` — From expense party master under `,(0,S.jsx)(`em`,{children:B?.name})]})]}),(0,S.jsxs)(`div`,{ref:C,className:`CM3-field${_===`bio_data`?` err`:``}`,children:[(0,S.jsx)(I,{label:`${K} Name`,required:!0,options:R.map(e=>({value:String(e.id),label:e.name,sub:e.category_name})),value:k.bio_data_id,onChange:e=>{N(`bio_data_id`,e),_===`bio_data`&&v(null)},placeholder:`Search ${K.toLowerCase()} names…`,emptyMsg:`No party master record found for ${B?.name}. Add one in Party Master first.`}),_===`bio_data`&&(0,S.jsxs)(`div`,{className:`CM3-field-err-msg`,children:[K,` Name is required`]})]}),z&&(0,S.jsxs)(`div`,{className:`CM3-sel-card`,children:[(0,S.jsx)(`div`,{className:`CM3-sel-av`,style:{...(()=>{let e=M(z.name);return{background:e.bg,color:e.color,borderColor:e.border}})()},children:z.name.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-sel-name`,children:z.name}),(0,S.jsxs)(`div`,{className:`CM3-sel-sub`,children:[z.category_name||B?.name,V?` › ${V.name}`:``]})]}),(0,S.jsx)(`div`,{className:`CM3-sel-badge`,children:K})]})]}),(0,S.jsxs)(`div`,{className:`CM3-notice`,style:{marginTop:8,background:`rgba(13,148,136,0.06)`,border:`1px solid rgba(13,148,136,0.2)`,borderRadius:8,padding:`8px 12px`,display:`flex`,alignItems:`center`,gap:8},children:[(0,S.jsx)(F,{n:`client`,sz:13,c:E.primary}),(0,S.jsx)(`span`,{style:{fontSize:9.5,color:E.primary},children:`Client name is added per bill & repayment — not here.`})]})]})]}),l===2&&(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`CM3-step-head`,children:[(0,S.jsx)(`div`,{className:`CM3-step-num`,children:`03`}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-step-ttl`,children:`Confirm Ledger`}),(0,S.jsx)(`div`,{className:`CM3-step-desc`,children:`Review the details before saving`})]})]}),(0,S.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:10},children:[{label:`Account Head`,val:`${B?.name||`—`}${V?` › ${V.name}`:``}`,ic:`tag`,color:`#f59e0b`},{label:`Party Name`,val:z?.name||`—`,ic:`user`,color:`#3b82f6`}].map(e=>(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12,padding:`13px 16px`,background:`var(--surface,#F1F5F9)`,border:`1.5px solid var(--border,#E9EEF5)`,borderRadius:10},children:[(0,S.jsx)(`div`,{style:{width:36,height:36,borderRadius:9,background:e.color+`15`,border:`1px solid ${e.color}33`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,S.jsx)(F,{n:e.ic,sz:16,c:e.color})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{style:{fontSize:8,fontWeight:800,textTransform:`uppercase`,letterSpacing:`0.1em`,color:`var(--text-4,#9ca3af)`},children:e.label}),(0,S.jsx)(`div`,{style:{fontSize:12.5,fontWeight:800,color:`var(--text-1,#0F172A)`},children:e.val})]})]},e.label))})]})]}),(0,S.jsxs)(`div`,{className:`CM3-mfoot`,style:{justifyContent:`space-between`},children:[(0,S.jsx)(`div`,{children:l>0&&(0,S.jsx)(`button`,{className:`CM3-btn back icon-only`,onClick:()=>u(e=>e-1),disabled:d,title:`Back`,"aria-label":`Back`,children:(0,S.jsx)(F,{n:`arrow`,sz:12})})}),(0,S.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,S.jsx)(`button`,{className:`CM3-btn ghost`,onClick:a,children:`Cancel`}),l===0&&(0,S.jsx)(`button`,{className:`CM3-btn primary`,onClick:()=>{te?(g(``),v(null),u(1)):(g(`Please select a category first.`),v(`category`),i.error(`Account Head Required`,`Please select an account head to continue.`),y.current?.scrollIntoView({behavior:`smooth`,block:`center`}))},children:`Next →`}),l===1&&(0,S.jsx)(`button`,{className:`CM3-btn primary`,onClick:()=>{ne?(g(``),v(null),u(2)):(g(`Party name is required.`),v(`bio_data`),i.error(`Required Field`,`${K} Name is required.`),C.current?.scrollIntoView({behavior:`smooth`,block:`center`}))},children:`Review →`}),l===2&&(0,S.jsx)(`button`,{className:`CM3-btn primary`,onClick:re,disabled:d,children:d?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`CM3-spin`}),` Saving…`]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(F,{n:`check`,sz:12,c:`#fff`}),` `,s?`Update Ledger Account`:`Create Ledger Account`]})})]})]})]})}),document.body),(0,S.jsx)(h,{open:w.open,entityName:`Ledger Account`,duplicateFields:w.fields,onAddAnyway:async()=>{w.pendingPayload&&(T(e=>({...e,open:!1})),await W(w.pendingPayload))},onCancel:()=>T({open:!1,fields:[],pendingPayload:null}),loading:d})]})}function z({vendor:e,bioData:t,categories:n,editEntry:r,onClose:a,onSaved:o}){let s=!!r,[c,l]=(0,b.useState)(!1),[u,d]=(0,b.useState)(``),[p,m]=(0,b.useState)(null),h=(0,b.useRef)(null),_=(0,b.useRef)(null),v=(0,b.useRef)(null),y=(0,b.useRef)(null),C=(0,b.useRef)(null),[w,E]=(0,b.useState)(!1),[k,M]=(0,b.useState)({credit_date:r?.credit_date||A(),bill_number:r?.bill_number||``,description:r?.description||``,credit_amount:r?String(Math.round(r.credit_amount)):``,due_date:r?.due_date||``,priority:r?.priority||`medium`,notes:r?.notes||``,client_name:r?.client_name||``}),N=(e,t)=>M(n=>({...n,[e]:t})),P=new Set(n.filter(e=>e.type===`income`).map(e=>e.id)),ee=t.filter(e=>e.category_id?P.has(e.category_id):!0).map(e=>({value:e.name,label:e.name,sub:e.category_name}));return(0,x.createPortal)((0,S.jsx)(`div`,{className:`CM3-overlay`,onClick:a,children:(0,S.jsxs)(`div`,{className:`CM3-modal CM3-modal-lg`,onClick:e=>e.stopPropagation(),children:[w&&(0,S.jsx)(U,{title:`BILL SAVED!`,sub:e.party_name,amountText:`${O(+k.credit_amount)} Recorded`,onDone:o}),(0,S.jsxs)(`div`,{className:`CM3-mhdr credit-top`,children:[(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:[(0,S.jsx)(`div`,{className:`CM3-mhdr-ic`,children:(0,S.jsx)(F,{n:`receipt`,sz:17,c:`#2563EB`})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-mtitle`,children:s?`Edit Bill`:`Add Bill`}),(0,S.jsxs)(`div`,{className:`CM3-msub`,children:[(0,S.jsxs)(`span`,{className:`CM3-msub-tag`,children:[`(`,e.party_name,` · `,e.category_name,e.sub_category_name?` › ${e.sub_category_name}`:``,`)`]}),k.client_name?` · Client: ${k.client_name}`:``]})]})]}),(0,S.jsx)(`button`,{className:`CM3-mclose`,onClick:a,title:`Close`,"aria-label":`Close`,children:(0,S.jsx)(F,{n:`x`,sz:18})})]}),(0,S.jsxs)(`div`,{className:`CM3-mbody`,children:[(0,S.jsxs)(`div`,{className:`CM3-notice red`,children:[(0,S.jsx)(F,{n:`receipt`,sz:14,c:T.mid}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:`Bill`}),` — Records in ledger only. Payments will sync to Cash Book.`]})]}),(0,S.jsxs)(`div`,{className:`CM3-section`,children:[(0,S.jsx)(`span`,{className:`CM3-section-tag`,children:`01 — Bill Details`}),(0,S.jsx)(`div`,{className:`CM3-section-rule`})]}),(0,S.jsxs)(`div`,{className:`CM3-grid2`,children:[(0,S.jsxs)(`div`,{className:`CM3-field`,children:[(0,S.jsxs)(`label`,{className:`CM3-label`,children:[`Credit Date `,(0,S.jsx)(`span`,{className:`req`,children:`*`})]}),(0,S.jsx)(g,{value:k.credit_date,onChange:e=>N(`credit_date`,e)})]}),(0,S.jsxs)(`div`,{className:`CM3-field${p===`bill_number`?` err`:``}`,ref:h,children:[(0,S.jsxs)(`label`,{className:`CM3-label`,children:[`Bill / Invoice No `,(0,S.jsx)(`span`,{className:`req`,children:`*`})]}),(0,S.jsx)(`input`,{ref:_,type:`text`,className:`CM3-input`,placeholder:`Enter bill / invoice number…`,value:k.bill_number,onChange:e=>{N(`bill_number`,e.target.value),p===`bill_number`&&m(null)}}),p===`bill_number`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Bill / Invoice No is required`})]})]}),(0,S.jsxs)(`div`,{className:`CM3-section`,children:[(0,S.jsx)(`span`,{className:`CM3-section-tag`,children:`02 — Client / Site Name`}),(0,S.jsx)(`div`,{className:`CM3-section-rule`})]}),(0,S.jsx)(`div`,{className:`CM3-grid2`,children:(0,S.jsxs)(`div`,{className:`CM3-field${p===`client_name`?` err`:``}`,style:{gridColumn:`1/-1`},ref:v,children:[(0,S.jsx)(L,{value:k.client_name,onChange:e=>{N(`client_name`,e),p===`client_name`&&m(null)},options:ee,placeholder:`Search or type client / site name…`,accent:T.mid}),p===`client_name`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Client / Site Name is required`})]})}),(0,S.jsxs)(`div`,{className:`CM3-section`,children:[(0,S.jsx)(`span`,{className:`CM3-section-tag`,children:`03 — Amount & Due Date`}),(0,S.jsx)(`div`,{className:`CM3-section-rule`})]}),(0,S.jsxs)(`div`,{className:`CM3-grid2`,children:[(0,S.jsxs)(`div`,{className:`CM3-field${p===`credit_amount`?` err`:``}`,ref:y,children:[(0,S.jsxs)(`label`,{className:`CM3-label`,children:[`Credit Amount (₹) `,(0,S.jsx)(`span`,{className:`req`,children:`*`})]}),(0,S.jsx)(`input`,{ref:C,type:`number`,step:`1`,min:`0`,className:`CM3-input`,placeholder:`0`,value:k.credit_amount,onChange:e=>{N(`credit_amount`,e.target.value.replace(/[.,].*$/,``)),p===`credit_amount`&&m(null)}}),p===`credit_amount`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Enter a valid amount greater than 0`})]}),(0,S.jsxs)(`div`,{className:`CM3-field`,children:[(0,S.jsx)(`label`,{className:`CM3-label`,children:`Due Date`}),(0,S.jsx)(g,{value:k.due_date,onChange:e=>N(`due_date`,e)})]})]}),(0,S.jsxs)(`div`,{className:`CM3-section`,children:[(0,S.jsx)(`span`,{className:`CM3-section-tag`,children:`04 — Priority & Notes`}),(0,S.jsx)(`div`,{className:`CM3-section-rule`})]}),(0,S.jsxs)(`div`,{className:`CM3-grid2`,children:[(0,S.jsx)(`div`,{className:`CM3-field`,children:(0,S.jsx)(I,{options:[{value:`low`,label:`Low`},{value:`medium`,label:`Medium`},{value:`high`,label:`High`},{value:`urgent`,label:`Urgent`}],label:`Priority`,value:k.priority,onChange:e=>N(`priority`,e),placeholder:`Select priority…`,accent:T.mid})}),(0,S.jsxs)(`div`,{className:`CM3-field`,children:[(0,S.jsx)(`label`,{className:`CM3-label`,children:`Notes`}),(0,S.jsx)(`input`,{type:`text`,className:`CM3-input`,placeholder:`Internal remark…`,value:k.notes,onChange:e=>N(`notes`,e.target.value)})]}),(0,S.jsxs)(`div`,{className:`CM3-field`,style:{gridColumn:`1/-1`},children:[(0,S.jsx)(`label`,{className:`CM3-label`,children:`Description`}),(0,S.jsx)(`input`,{type:`text`,className:`CM3-input`,placeholder:`Work done / material supplied…`,value:k.description,onChange:e=>N(`description`,e.target.value)})]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-mfoot`,children:[(0,S.jsx)(`button`,{className:`CM3-btn ghost`,onClick:a,children:`Cancel`}),(0,S.jsx)(`button`,{className:`CM3-btn credit`,onClick:async()=>{if(!k.bill_number.trim()){m(`bill_number`),i.error(`Bill / Invoice No Required`,`Please enter a bill / invoice number to continue.`),h.current?.scrollIntoView({behavior:`smooth`,block:`center`}),_.current?.focus();return}if(!k.client_name.trim()){m(`client_name`),i.error(`Client Required`,`Please select a Client / Site Name to continue.`),v.current?.scrollIntoView({behavior:`smooth`,block:`center`});return}if(!k.credit_amount||+k.credit_amount<=0){m(`credit_amount`),i.error(`Amount Required`,`Please enter a valid credit amount greater than 0.`),y.current?.scrollIntoView({behavior:`smooth`,block:`center`}),C.current?.focus();return}m(null),l(!0),d(``);let t={...k,bill_number:k.bill_number.trim(),credit_amount:Math.round(+k.credit_amount),due_date:k.due_date||null,notes:k.notes||null,priority:k.priority||null};try{if(s&&r)await f.put(`/api/credit-management/entries/${r.id}`,t,{headers:D()}),i.success(`Bill Updated!`,`Bill #${r.id} updated for ${e.party_name}`),o();else{await f.post(`/api/credit-management/vendors/${e.id}/entries`,t,{headers:D()}),l(!1),E(!0);return}}catch(e){let t=j(e,`Could not save credit entry`);d(t),i.error(s?`Update Failed`:`Save Failed`,t)}finally{l(!1)}},disabled:c,children:c?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`CM3-spin`}),` Saving…`]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(F,{n:s?`edit`:`receipt`,sz:12,c:`#fff`}),s?` Update Bill`:` Add Bill`]})})]})]})}),document.body)}var B=[`#2563EB`,`#3B82F6`,`#BFDBFE`,`#fde68a`,`#F3E8FF`,`#fff`,`#EDE9FE`,`#60A5FA`,`#fef3c7`];function V({seed:e=0,count:t=22}){return(0,S.jsx)(S.Fragment,{children:Array.from({length:t},(t,n)=>{let r=n+e*7;return{id:n,color:B[r%B.length],left:`${4+r*6.1%92}%`,top:`${12+r*8.3%62}%`,delay:`${r*55%550}ms`,size:5+r%4*3,rotate:r*41,drift:(r%5-2)*18}}).map(e=>(0,S.jsx)(`div`,{className:`CM3-confetti-piece`,style:{left:e.left,top:e.top,width:e.size,height:e.size,background:e.color,animationDelay:e.delay,animationDuration:`${900+e.id*55%500}ms`,"--cm3-drift":`${e.drift}px`,transform:`rotate(${e.rotate}deg)`}},e.id))})}function H(){return(0,S.jsx)(S.Fragment,{children:Array.from({length:10},(e,t)=>({id:t,left:`${50+Math.cos(t/10*Math.PI*2)*(30+t%3*6)}%`,top:`${42+Math.sin(t/10*Math.PI*2)*(26+t%3*5)}%`,delay:`${300+t*70}ms`,size:6+t%3*3})).map(e=>(0,S.jsx)(`svg`,{className:`CM3-sparkle`,width:e.size,height:e.size,viewBox:`0 0 24 24`,style:{left:e.left,top:e.top,animationDelay:e.delay},fill:`#3B82F6`,children:(0,S.jsx)(`path`,{d:`M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z`})},e.id))})}function U({title:e,sub:t,amountText:n,onDone:r,duration:i=1800}){let[a,o]=(0,b.useState)(!1);return(0,b.useEffect)(()=>{let e=setTimeout(r,i),t=setTimeout(()=>o(!0),450);return()=>{clearTimeout(e),clearTimeout(t)}},[]),(0,S.jsxs)(`div`,{className:`CM3-closed-celebrate CM3-success-ov`,children:[(0,S.jsx)(V,{seed:0}),a&&(0,S.jsx)(V,{seed:1,count:16}),(0,S.jsx)(H,{}),(0,S.jsx)(`div`,{className:`CM3-closed-ring`}),(0,S.jsx)(`div`,{className:`CM3-closed-ring2`}),(0,S.jsxs)(`div`,{className:`CM3-closed-stamp-wrap`,children:[(0,S.jsx)(`div`,{className:`CM3-closed-check`,children:(0,S.jsx)(`svg`,{width:42,height:42,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})}),(0,S.jsx)(`div`,{className:`CM3-closed-txt`,children:e}),t&&(0,S.jsx)(`div`,{className:`CM3-closed-sub`,children:t}),n&&(0,S.jsx)(`div`,{className:`CM3-closed-amt-badge`,children:n})]})]})}function te(e,t){if(!t.length)return{plan:[],hasRedist:!1,rows:[],originalPerBill:0,totalSurplus:0};let n=new Map,r=new Set,i=Math.round(e),a=[...t],o=Math.round(e/t.length);for(;i>.5&&a.length>0;){let e=i/a.length,t=a.filter(t=>t.bill_balance+.5<e);if(t.length===0){a.forEach((t,r)=>{if(r===a.length-1)n.set(t.id,Math.round(i));else{let r=Math.round(e);n.set(t.id,r),i=Math.round(i-r)}}),i=0;break}for(let e of t)n.set(e.id,Math.round(e.bill_balance)),i=Math.round(i-e.bill_balance),r.add(e.id);a=a.filter(e=>!r.has(e.id))}let s=t.some(e=>e.bill_balance+.5<o),c=Math.round(t.filter(e=>r.has(e.id)&&e.bill_balance+.5<o).reduce((e,t)=>e+(o-t.bill_balance),0)),l=t.map(e=>{let t=n.get(e.id)??0;return{bill:e,allocated:t,isClosed:t>=e.bill_balance-.5,extraFromRedist:Math.max(0,Math.round(t-o))}});return{plan:l.filter(e=>e.allocated>0).map(e=>({entry_id:e.bill.id,amount:e.allocated})),hasRedist:s,rows:l,originalPerBill:o,totalSurplus:c}}function ne({paymentAmount:e,paymentDate:t,entries:n,onPlanConfirmed:r,onSkip:i,onClose:a}){let[o,s]=(0,b.useState)(e),[c,l]=(0,b.useState)([]),[u,d]=(0,b.useState)(null),[f,p]=(0,b.useState)(new Set),[m,h]=(0,b.useState)({show:!1,billNum:``,amount:0}),g=(0,b.useRef)(null),_=(0,b.useRef)(null),v={high:0,medium:1,low:2},y=[...n].sort((e,t)=>e.is_paid===t.is_paid?(v[e.priority]??3)-(v[t.priority]??3):e.is_paid?1:-1),C=y.filter(e=>!e.is_paid&&!f.has(e.id)),w=y.filter(e=>e.is_paid||f.has(e.id)),T=C.find(e=>e.id===u),E=T?Math.round(Math.min(o,T.bill_balance)):0,D=T?o>=T.bill_balance:!1,A=T?Math.round(Math.max(0,o-T.bill_balance)):0,j=C.length===0||o<=0,[M,N]=(0,b.useState)(null),[P,I]=(0,b.useState)(``),L=(()=>{let e=new Map;return C.forEach(t=>{let n=t.client_name||`No Client Assigned`;e.has(n)||e.set(n,[]),e.get(n).push(t)}),Array.from(e.entries()).map(([e,t])=>({name:e,bills:t,totalDue:t.reduce((e,t)=>e+t.bill_balance,0)})).sort((e,t)=>e.name.localeCompare(t.name))})(),ee=M&&L.find(e=>e.name===M)?.bills||[],R=P.trim()?L.filter(e=>e.name.toLowerCase().includes(P.trim().toLowerCase())):L;(0,b.useEffect)(()=>{M&&!L.some(e=>e.name===M)&&N(null)},[C.length]);let z=(e,t)=>{h({show:!0,billNum:e,amount:t}),g.current&&clearTimeout(g.current),g.current=setTimeout(()=>h({show:!1,billNum:``,amount:0}),2300)};return(0,x.createPortal)((0,S.jsx)(`div`,{className:`CM3-alloc-overlay`,children:(0,S.jsxs)(`div`,{className:`CM3-alloc-modal`,style:{position:`relative`},ref:_,children:[m.show&&(0,S.jsxs)(`div`,{className:`CM3-closed-celebrate`,children:[(0,S.jsx)(V,{}),(0,S.jsx)(H,{}),(0,S.jsx)(`div`,{className:`CM3-closed-ring`}),(0,S.jsx)(`div`,{className:`CM3-closed-ring2`}),(0,S.jsxs)(`div`,{className:`CM3-closed-stamp-wrap`,children:[(0,S.jsx)(`div`,{className:`CM3-closed-check`,children:(0,S.jsx)(`svg`,{width:42,height:42,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})}),(0,S.jsx)(`div`,{className:`CM3-closed-txt`,children:`BILL CLOSED!`}),(0,S.jsxs)(`div`,{className:`CM3-closed-sub`,children:[`BILL NUM: `,m.billNum]}),(0,S.jsxs)(`div`,{className:`CM3-closed-amt-badge`,children:[O(m.amount),` — Settled ✓`]}),o>0&&(0,S.jsxs)(`div`,{style:{fontSize:10.5,color:`#92400e`,marginTop:6,fontWeight:700,background:`#fff`,border:`1px solid #BFDBFE`,borderRadius:100,padding:`4px 14px`},children:[O(o),` remaining → select next bill…`]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-hdr`,children:[(0,S.jsxs)(`button`,{className:`CM3-alloc-close`,onClick:a,title:`Back`,children:[(0,S.jsx)(`span`,{className:`CM3-alloc-close-ic`,children:(0,S.jsx)(F,{n:`arrow`,sz:11})}),` Back`]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-hdr-row`,children:[(0,S.jsx)(`div`,{className:`CM3-alloc-hdr-ic`,children:(0,S.jsx)(F,{n:j?`check`:M?`receipt`:`client`,sz:17,c:`#2563EB`})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-alloc-title`,children:j?`All Done!`:M?o<e?`Choose Next Bill`:`Select Bill`:`Select Client`}),(0,S.jsx)(`div`,{className:`CM3-alloc-sub`,children:j?`All open bills settled.`:M?`Pick a bill to apply this repayment to`:`Choose a client, then pick a bill to apply this repayment to`})]})]}),(0,S.jsxs)(`div`,{style:{display:`flex`,gap:8,flexWrap:`wrap`,marginTop:8},children:[(0,S.jsxs)(`span`,{className:`CM3-alloc-chip teal`,children:[(0,S.jsx)(`svg`,{width:11,height:11,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6`})}),`Total: `,O(e)]}),o<e&&o>0&&(0,S.jsxs)(`span`,{className:`CM3-alloc-chip amber`,children:[(0,S.jsx)(`svg`,{width:11,height:11,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M13 2 4 14h6l-1 8 9-12h-6l1-8z`})}),`Remaining: `,O(o)]}),o===e&&(0,S.jsxs)(`span`,{className:`CM3-alloc-chip teal`,children:[`· `,k(t)]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-body`,children:[C.length===0&&(0,S.jsxs)(`div`,{style:{textAlign:`center`,padding:`32px 0`,display:`flex`,flexDirection:`column`,alignItems:`center`,gap:10},children:[(0,S.jsx)(`svg`,{width:44,height:44,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:1.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})}),(0,S.jsx)(`div`,{style:{fontFamily:`var(--font-body)`,fontSize:13,fontWeight:800,textTransform:`uppercase`,letterSpacing:`0.3px`,fontStyle:`normal`,color:`#2563EB`},children:`All Bills Settled`}),(0,S.jsx)(`div`,{style:{fontSize:10.5,color:`var(--text-4)`},children:`No more open bills to allocate`})]}),M?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(`button`,{className:`CM3-alloc-back`,onClick:()=>N(null),children:[(0,S.jsx)(`span`,{className:`CM3-alloc-back-ic`,children:(0,S.jsx)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,S.jsx)(`path`,{d:`m15 18-6-6 6-6`})})}),(0,S.jsx)(`span`,{className:`CM3-alloc-back-name`,children:M}),(0,S.jsx)(`span`,{className:`CM3-alloc-back-count`,children:ee.length})]}),(0,S.jsx)(`div`,{className:`CM3-alloc-billtbl-wrap`,children:(0,S.jsxs)(`table`,{className:`CM3-alloc-billtbl`,children:[(0,S.jsx)(`thead`,{children:(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`th`,{}),(0,S.jsx)(`th`,{children:`Invoice No`}),(0,S.jsx)(`th`,{children:`Client`}),(0,S.jsx)(`th`,{children:`Credit Amt`}),(0,S.jsx)(`th`,{children:`Date`}),(0,S.jsx)(`th`,{children:`Due`}),(0,S.jsx)(`th`,{style:{textAlign:`right`},children:`Balance Due`})]})}),(0,S.jsx)(`tbody`,{children:ee.map((e,t)=>{let n=String(y.indexOf(e)+1).padStart(2,`0`),r=u===e.id,i=r&&o>=e.bill_balance,a=r&&o<e.bill_balance,s=e.due_date?Math.ceil((new Date(e.due_date).getTime()-Date.now())/864e5):null;return(0,S.jsxs)(b.Fragment,{children:[(0,S.jsxs)(`tr`,{className:`bill-row${r?` selected`:``}`,style:{animationDelay:`${t*30}ms`},onClick:()=>d(e.id),children:[(0,S.jsx)(`td`,{className:`CM3-alloc-billtbl-check-cell`,children:(0,S.jsx)(`div`,{className:`CM3-alloc-check${r?i?` will-close`:` will-partial`:``}`,children:r&&(0,S.jsx)(`svg`,{width:`11`,height:`11`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:`3`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})})})}),(0,S.jsxs)(`td`,{className:`CM3-alloc-billtbl-inv`,children:[`#`,n,` · `,e.bill_number||`ID ${e.id}`]}),(0,S.jsx)(`td`,{className:`CM3-alloc-billtbl-client`,children:e.client_name||e.description||`Bill ${n}`}),(0,S.jsx)(`td`,{className:`CM3-alloc-billtbl-amt`,children:O(e.credit_amount)}),(0,S.jsx)(`td`,{className:`CM3-alloc-billtbl-date`,children:k(e.credit_date)}),(0,S.jsx)(`td`,{children:e.due_date&&s!==null&&s<0?(0,S.jsxs)(`span`,{className:`CM3-alloc-bill-overdue`,children:[Math.abs(s),`d overdue`]}):e.due_date&&s!==null&&s>=0&&s<=5?(0,S.jsxs)(`span`,{className:`CM3-alloc-bill-overdue`,style:{background:`#fffbeb`,border:`1px solid #fde68a`,color:`#C47E0A`},children:[`Due in `,s,`d`]}):(0,S.jsx)(`span`,{style:{color:`var(--text-4,#9ca3af)`},children:`—`})}),(0,S.jsxs)(`td`,{className:`CM3-alloc-billtbl-bal-cell`,children:[(0,S.jsx)(`div`,{className:`CM3-alloc-billtbl-bal`,children:O(e.bill_balance)}),e.credit_amount>e.bill_balance&&(0,S.jsxs)(`div`,{style:{fontSize:8,color:`var(--text-4,#9ca3af)`,marginTop:2,fontWeight:600},children:[`of `,O(e.credit_amount),` total`]})]})]}),r&&(i||a)&&(0,S.jsx)(`tr`,{className:`CM3-alloc-billtbl-preview-row`,children:(0,S.jsxs)(`td`,{colSpan:7,children:[i&&(0,S.jsxs)(`div`,{className:`CM3-alloc-preview closes`,children:[(0,S.jsx)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})}),`Will CLOSE this bill — `,O(e.bill_balance),` applied`,A>0&&(0,S.jsxs)(`span`,{style:{marginLeft:4,opacity:.85},children:[`· `,O(A),` carries over`]})]}),a&&(0,S.jsxs)(`div`,{className:`CM3-alloc-preview partial`,children:[(0,S.jsxs)(`svg`,{width:10,height:10,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,S.jsx)(`path`,{d:`M12 8v4M12 16h.01`})]}),`Partial — `,O(o),` applied · `,O(e.bill_balance-o),` still due`]})]})})]},e.id)})})]})})]}):(0,S.jsxs)(S.Fragment,{children:[L.length>0&&(0,S.jsxs)(`div`,{className:`CM3-search CM3-alloc-search`,children:[(0,S.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--text-4)`,strokeWidth:2.5,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,S.jsx)(`path`,{d:`m21 21-4.35-4.35`})]}),(0,S.jsx)(`input`,{placeholder:`Search client…`,value:P,onChange:e=>I(e.target.value),autoFocus:!0}),P&&(0,S.jsx)(`button`,{onClick:()=>I(``),style:{background:`none`,border:`none`,cursor:`pointer`,color:`var(--text-4)`,lineHeight:1,padding:0},children:`✕`})]}),R.length===0&&P&&(0,S.jsxs)(`div`,{style:{textAlign:`center`,padding:`20px 0`,fontSize:10.5,color:`var(--text-4)`},children:[`No client matches "`,P,`"`]}),R.length>0&&(0,S.jsx)(`div`,{className:`CM3-alloc-tbl-wrap`,children:(0,S.jsxs)(`table`,{className:`CM3-alloc-tbl`,children:[(0,S.jsx)(`thead`,{children:(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`th`,{children:`Client Name`}),(0,S.jsx)(`th`,{children:`Bills`}),(0,S.jsx)(`th`,{style:{textAlign:`right`},children:`Total Due`}),(0,S.jsx)(`th`,{})]})}),(0,S.jsx)(`tbody`,{children:R.map((e,t)=>(0,S.jsxs)(`tr`,{style:{animationDelay:`${t*30}ms`},onClick:()=>N(e.name),title:`Select ${e.name}`,children:[(0,S.jsxs)(`td`,{className:`CM3-alloc-tbl-name`,children:[(0,S.jsx)(`span`,{className:`CM3-alloc-tbl-avatar`,children:e.name.trim().charAt(0).toUpperCase()}),e.name]}),(0,S.jsx)(`td`,{className:`CM3-alloc-tbl-bills`,children:(0,S.jsxs)(`span`,{className:`CM3-alloc-tbl-bills-pill`,children:[e.bills.length,` `,e.bills.length===1?`bill`:`bills`]})}),(0,S.jsx)(`td`,{className:`CM3-alloc-tbl-due`,children:O(e.totalDue)}),(0,S.jsxs)(`td`,{className:`CM3-alloc-tbl-chev`,children:[(0,S.jsx)(`span`,{className:`CM3-alloc-tbl-select`,children:`Select`}),(0,S.jsx)(`svg`,{width:15,height:15,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,S.jsx)(`path`,{d:`m9 18 6-6-6-6`})})]})]},e.name))})]})})]}),w.length>0&&(0,S.jsxs)(`div`,{style:{marginTop:4},children:[(0,S.jsx)(`div`,{style:{fontSize:8,fontWeight:800,letterSpacing:`1.5px`,textTransform:`uppercase`,color:`var(--text-4)`,marginBottom:6,paddingTop:6,borderTop:`1px solid var(--border)`},children:`Already Closed`}),w.map(e=>{let t=String(y.indexOf(e)+1).padStart(2,`0`),n=f.has(e.id);return(0,S.jsxs)(`div`,{className:`CM3-alloc-bill closed-bill`,style:{background:n?`#F3E8FF`:void 0},children:[(0,S.jsxs)(`div`,{className:`CM3-alloc-info`,children:[(0,S.jsxs)(`div`,{className:`CM3-alloc-bill-num`,children:[`BILL NUM: `,t,` · `,e.bill_number||`#${e.id}`]}),(0,S.jsx)(`div`,{className:`CM3-alloc-bill-desc`,children:e.description||`Bill ${t}`})]}),(0,S.jsx)(`span`,{className:`CM3-alloc-bill-closed-tag`,children:n?`✓ Just Closed`:`✓ Closed`})]},e.id)})]})]}),(0,S.jsx)(`div`,{className:`CM3-alloc-footer`,children:j?(0,S.jsxs)(`button`,{className:`CM3-btn payment`,style:{background:`linear-gradient(135deg,#2563EB,#3B82F6)`,border:`none`},onClick:()=>{r(o>0?[...c,{entry_id:0,amount:o,client_name:M||void 0}]:c)},children:[(0,S.jsx)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})}),`Save Payment & Apply`]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(`button`,{className:`CM3-btn ghost`,onClick:i,children:[(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M13 2 4 14h6l-1 8 9-12h-6l1-8z`})}),`Auto-Split Across All Bills`]}),(0,S.jsx)(`button`,{className:`CM3-btn payment`,style:{background:u?`linear-gradient(135deg,#2563EB,#3B82F6)`:`rgba(29,78,216,0.35)`,border:`none`,cursor:u?`pointer`:`default`},onClick:()=>{if(!u||!T)return;let e=String(y.indexOf(T)+1).padStart(2,`0`),t={entry_id:u,amount:E},n=[...c,t];l(n);let i=D?A<=0:!0;D?(p(e=>new Set([...e,u])),d(null),s(Math.round(A))):s(0),i?r(n):z(e,E)},disabled:!u,children:u?D?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})}),`Close Bill & Apply `,O(E)]}):(0,S.jsxs)(S.Fragment,{children:[`Apply `,O(E),` to Bill`]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`svg`,{width:12,height:12,viewBox:`0 0 24 24`,fill:`none`,stroke:`#fff`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M12 19V5M5 12l7-7 7 7`})}),`Select a Bill to Continue`]})})]})})]})}),document.body)}function W({totalAmount:e,result:t,onConfirm:n,onCancel:r}){let i=t.rows.filter(e=>e.isClosed&&e.bill.bill_balance<t.originalPerBill-.005),a=t.rows.filter(e=>!e.isClosed);return(0,x.createPortal)((0,S.jsx)(`div`,{className:`CM3-alloc-overlay`,children:(0,S.jsxs)(`div`,{className:`CM3-alloc-modal`,style:{maxWidth:540},children:[(0,S.jsxs)(`div`,{className:`CM3-alloc-hdr`,children:[(0,S.jsxs)(`button`,{className:`CM3-alloc-close`,onClick:r,title:`Cancel`,children:[(0,S.jsx)(`span`,{className:`CM3-alloc-close-ic`,children:(0,S.jsx)(F,{n:`arrow`,sz:11})}),` Cancel`]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-title`,style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,S.jsx)(`svg`,{width:17,height:17,viewBox:`0 0 24 24`,fill:`none`,stroke:`#2563EB`,strokeWidth:2.5,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,S.jsx)(`path`,{d:`M13 2 4 14h6l-1 8 9-12h-6l1-8z`})}),`Smart Redistribution Preview`]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-sub`,children:[i.length,` bill`,i.length>1?`s are`:` is`,` smaller than the equal share — surplus redistributed automatically`]}),(0,S.jsxs)(`div`,{style:{display:`flex`,gap:8,flexWrap:`wrap`,marginTop:8},children:[(0,S.jsxs)(`span`,{className:`CM3-alloc-chip teal`,children:[(0,S.jsx)(`svg`,{width:11,height:11,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6`})}),`Total: `,O(e)]}),(0,S.jsxs)(`span`,{className:`CM3-alloc-chip amber`,children:[`Equal share: `,O(t.originalPerBill),` / bill`]}),t.totalSurplus>0&&(0,S.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:4,padding:`4px 10px`,borderRadius:100,background:`#fce7f3`,color:`#be185d`,border:`1px solid #fbcfe8`,fontFamily:`var(--font-mono)`,fontSize:8,fontWeight:800,letterSpacing:`0.06em`},children:[`↺ `,O(t.totalSurplus),` redistributed`]})]})]}),(0,S.jsxs)(`div`,{style:{margin:`0 16px 4px`,padding:`10px 14px`,background:`#fffbeb`,border:`1px solid #fde68a`,borderRadius:8,fontSize:10.5,color:`#92400e`,lineHeight:1.6},children:[(0,S.jsx)(`strong`,{children:i.map(e=>e.bill.client_name||e.bill.description||`Bill #${e.bill.id}`).join(`, `)}),i.length>1?` are`:` is`,` smaller than the equal share of `,(0,S.jsx)(`strong`,{children:O(t.originalPerBill)}),`.`,t.totalSurplus>0&&a.length>0&&(0,S.jsxs)(S.Fragment,{children:[` The surplus of `,(0,S.jsx)(`strong`,{children:O(t.totalSurplus)}),` has been redistributed equally to the remaining `,a.length,` bill`,a.length===1?``:`s`,`.`]})]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-body`,style:{maxHeight:340},children:[t.rows.map((e,n)=>(0,S.jsxs)(`div`,{className:`CM3-alloc-bill${e.isClosed?` will-close`:` will-partial`}`,style:{cursor:`default`,gap:12},children:[(0,S.jsx)(`div`,{style:{width:30,height:30,borderRadius:8,flexShrink:0,background:e.isClosed?`#d1fae5`:`#F3E8FF`,border:`1px solid ${e.isClosed?`#6ee7b7`:`#DDD6FE`}`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:11.5,fontWeight:800,color:e.isClosed?`#1E9C6A`:`#C47E0A`},children:e.isClosed?`✓`:String(n+1).padStart(2,`0`)}),(0,S.jsxs)(`div`,{className:`CM3-alloc-info`,style:{flex:1},children:[(0,S.jsx)(`div`,{style:{fontWeight:800,fontSize:11.5,color:`var(--text-1,#0F172A)`,marginBottom:3},children:e.bill.client_name||e.bill.description||`Bill #${e.bill.id}`}),(0,S.jsxs)(`div`,{style:{fontSize:9.5,color:`#6b7280`,display:`flex`,gap:8,flexWrap:`wrap`,alignItems:`center`},children:[(0,S.jsxs)(`span`,{children:[`Balance: `,O(e.bill.bill_balance)]}),e.isClosed&&e.bill.bill_balance<t.originalPerBill-.005&&(0,S.jsxs)(`span`,{style:{color:`#C47E0A`,fontWeight:700},children:[`→ saved `,O(t.originalPerBill-e.bill.bill_balance),` surplus`]}),e.extraFromRedist>0&&(0,S.jsxs)(`span`,{style:{color:`#1E9C6A`,fontWeight:700},children:[`+`,O(e.extraFromRedist),` from redistribution`]})]}),e.isClosed?(0,S.jsxs)(`div`,{className:`CM3-alloc-preview closes`,style:{marginTop:6},children:[`✓ Bill will be CLOSED — `,O(e.allocated),` applied`]}):(0,S.jsxs)(`div`,{className:`CM3-alloc-preview partial`,style:{marginTop:6},children:[`Partial — `,O(e.allocated),` applied · `,O(e.bill.bill_balance-e.allocated),` still due`]})]}),(0,S.jsxs)(`div`,{style:{textAlign:`right`,flexShrink:0,minWidth:84},children:[(0,S.jsx)(`div`,{style:{fontSize:8,fontWeight:800,textTransform:`uppercase`,letterSpacing:`1.2px`,color:`#9ca3af`,marginBottom:4},children:`Allocated`}),(0,S.jsx)(`div`,{style:{fontFamily:`var(--font-mono)`,fontSize:16,fontWeight:800,lineHeight:1,color:e.isClosed?`#1E9C6A`:`#2563EB`},children:O(e.allocated)})]})]},e.bill.id)),(0,S.jsxs)(`div`,{style:{margin:`10px 0 0`,padding:`10px 16px`,background:`#f3f4f6`,borderRadius:8,border:`1px solid #e5e7eb`,display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,fontWeight:800,textTransform:`uppercase`,letterSpacing:`1.2px`,color:`#6b7280`},children:`TOTAL ALLOCATED`}),(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:17.5,fontWeight:800,color:`#0F172A`},children:O(e)})]})]}),(0,S.jsxs)(`div`,{className:`CM3-alloc-footer`,children:[(0,S.jsx)(`button`,{className:`CM3-btn ghost`,onClick:r,children:`Cancel — Go Back`}),(0,S.jsx)(`button`,{className:`CM3-btn payment`,style:{background:`linear-gradient(135deg,#2563EB,#3B82F6)`,border:`none`},onClick:()=>n(t.plan),children:`✓ Confirm & Save Smart Split`})]})]})}),document.body)}function re({vendor:e,bioData:t,categories:n,subCategories:r,editPayment:a,vendorEntries:o,onClose:s,onSaved:c}){let l=!!a,[u,d]=(0,b.useState)(!1),[p,m]=(0,b.useState)(``),[h,_]=(0,b.useState)(null),v=(0,b.useRef)(null),y=(0,b.useRef)(null),C=(0,b.useRef)(null),T=(0,b.useRef)(null),[k,M]=(0,b.useState)(!1),[N,P]=(0,b.useState)({show:!1,result:null}),[L,ee]=(0,b.useState)(null),R=String(e.category_id||``),z=String(e.sub_category_id||``),B=t.find(t=>t.name.toLowerCase().trim()===e.party_name.toLowerCase().trim()),V=a?.payment_mode?w.find(e=>e.toLowerCase()===a.payment_mode.toLowerCase())||a.payment_mode:`Cash`,[H,re]=(0,b.useState)({payment_date:a?.payment_date||A(),amount_paid:a?String(Math.round(Number(a.amount_paid)||0)):``,payment_mode:V,reference:a?.reference||``,notes:a?.notes||``,sync_to_daybook:!l,daybook_bio_data_id:B?String(B.id):``,daybook_category_id:R,daybook_sub_category_id:z,daybook_narration:`Payment — ${e.party_name}`}),G=(e,t)=>re(n=>({...n,[e]:t})),K=e=>{re(t=>({...t,daybook_category_id:e,daybook_sub_category_id:``}))},q=n.filter(e=>!e.type||e.type.toLowerCase()===`expense`),ie=t.map(e=>({value:String(e.id),label:e.name,sub:e.category_name})),ae=q.map(e=>({value:String(e.id),label:e.name})),J=H.daybook_category_id?r.filter(e=>e.category_id===+H.daybook_category_id):[],oe=w.map(e=>({value:e,label:e}));r.find(e=>String(e.id)===H.daybook_sub_category_id);let Y=[...new Set((o??[]).filter(e=>!e.is_paid&&e.client_name).map(e=>e.client_name))],se=Y.length===1?Y[0]:Y.length>1?`Auto — varies per bill`:null,X=async()=>{if(!H.amount_paid||Math.round(+H.amount_paid)<=0){_(`amount_paid`),i.error(`Amount Required`,`Please enter a valid payment amount greater than 0.`),v.current?.scrollIntoView({behavior:`smooth`,block:`center`}),y.current?.focus();return}if(!l&&H.sync_to_daybook){if(!H.daybook_bio_data_id){_(`daybook_bio_data_id`),i.error(`Party Required`,`Select a Party Name to sync with Cash Book.`),C.current?.scrollIntoView({behavior:`smooth`,block:`center`});return}if(!H.daybook_category_id){_(`daybook_category_id`),i.error(`Account Head Required`,`Select an Account Head to sync with Cash Book.`),T.current?.scrollIntoView({behavior:`smooth`,block:`center`});return}}if(_(null),m(``),l&&a){d(!0);let e={payment_date:H.payment_date,amount_paid:Math.round(+H.amount_paid),payment_mode:H.payment_mode,reference:H.reference||null,notes:H.notes||null};try{await f.put(`credit-management/payments/${a.id}`,e,{headers:D()}),i.success(`Payment Updated!`,`Payment #${a.id} updated successfully`),c({daybook_synced:!1})}catch(e){let t=j(e,`Update failed`);m(t),d(!1),i.error(`Update Failed`,t)}return}(o?.filter(e=>!e.is_paid)??[]).length>0?M(!0):ce([])},ce=async t=>{d(!0),m(``);let n=D(),r=Math.round(+H.amount_paid);try{let i=[];if(t.length===0){let t=o?.filter(e=>!e.is_paid)??[];if(t.length>0){let a=Math.floor(r/t.length);for(let o=0;o<t.length;o++){let s=t[o],c=o===t.length-1?Math.round(r-a*(t.length-1)):a,l=Math.min(c,Math.round(s.bill_balance)),u=(await f.post(`credit-management/vendors/${e.id}/payments`,{payment_date:H.payment_date,amount_paid:l,payment_mode:H.payment_mode,reference:H.reference||null,notes:H.notes||null,credit_entry_id:s.id},{headers:n})).data.data?.id;u&&i.push({paymentId:u,amount:l,entryId:s.id})}}else{let t=new Set((o||[]).map(e=>(e.client_name||``).trim()).filter(Boolean)),a=t.size===1?[...t][0]:void 0,s=(await f.post(`credit-management/vendors/${e.id}/payments`,{payment_date:H.payment_date,amount_paid:r,payment_mode:H.payment_mode,reference:H.reference||null,notes:H.notes||null,...a?{client_name:a}:{}},{headers:n})).data.data?.id;s&&i.push({paymentId:s,amount:r,entryId:null})}}else for(let r of t){let t=(await f.post(`credit-management/vendors/${e.id}/payments`,{payment_date:H.payment_date,amount_paid:r.amount,payment_mode:H.payment_mode,reference:H.reference||null,notes:H.notes||null,...r.entry_id>0?{credit_entry_id:r.entry_id}:{},...r.entry_id<=0&&r.client_name?{client_name:r.client_name}:{}},{headers:n})).data.data?.id;t&&i.push({paymentId:t,amount:r.amount,entryId:r.entry_id>0?r.entry_id:null})}let a=!1;if(H.sync_to_daybook&&i.length>0){let t=new Date().toLocaleString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`,hour12:!0});try{for(let r of i){let a=(r.entryId?o?.find(e=>e.id===r.entryId):null)?.client_name??null,s=a||(r.entryId?`Bill #${r.entryId}`:`General`),c=H.daybook_narration&&i.length===1?H.daybook_narration:`Payment — ${e.party_name} | ${s} | ₹${r.amount.toLocaleString(`en-IN`)} | ${t}`,l={transaction_date:H.payment_date,amount:r.amount,payment_mode:H.payment_mode,category_id:+H.daybook_category_id,bio_data_id:+H.daybook_bio_data_id,narration:c,...a?{client_name:a}:{}};H.daybook_sub_category_id&&(l.sub_category_id=+H.daybook_sub_category_id);let u=(await f.post(`daybook`,l,{headers:n})).data.entry?.id;if(u)try{await f.put(`credit-management/payments/${r.paymentId}`,{daybook_entry_id:u},{headers:n})}catch{}}a=!0}catch(e){m(`Payment saved, Cash Book sync failed: ${e.response?.data?.message||e.message}`),d(!1),c({daybook_synced:!1});return}}d(!1),window.dispatchEvent(new Event(`erp:notifications-refresh`)),ee({show:!0,amountText:`${O(r)}${a?` · Synced to Cash Book`:``}`,sub:e.party_name,daybookSynced:a})}catch(e){let t=j(e,`Could not record payment`);m(t),i.error(l?`Update Failed`:`Payment Failed`,t),d(!1)}};return(0,S.jsxs)(S.Fragment,{children:[(0,x.createPortal)((0,S.jsx)(`div`,{className:`CM3-overlay`,onClick:s,children:(0,S.jsxs)(`div`,{className:`CM3-modal CM3-modal-lg`,onClick:e=>e.stopPropagation(),children:[L?.show&&(0,S.jsx)(U,{title:`PAYMENT RECORDED!`,sub:L.sub,amountText:L.amountText,onDone:()=>c({daybook_synced:L.daybookSynced})}),(0,S.jsxs)(`div`,{className:`CM3-mhdr payment-top`,children:[(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:[(0,S.jsx)(`div`,{className:`CM3-mhdr-ic`,children:(0,S.jsx)(F,{n:`cash`,sz:17,c:`#2563EB`})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-mtitle`,children:l?`Edit Payment`:`Record Payment`}),(0,S.jsxs)(`div`,{className:`CM3-msub`,style:{color:`#2563EB`,fontSize:11.5,fontWeight:800},children:[e.party_name,` · `,e.category_name,e.sub_category_name?` › ${e.sub_category_name}`:``,l?` · Editing payment #${a?.id}`:` · Outstanding: ${O(e.balance)}`]})]})]}),(0,S.jsx)(`button`,{className:`CM3-mclose`,onClick:s,title:`Close`,"aria-label":`Close`,children:(0,S.jsx)(F,{n:`x`,sz:18})})]}),(0,S.jsxs)(`div`,{className:`CM3-mbody`,children:[l&&a&&(0,S.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`6px 18px`,alignItems:`center`,padding:`10px 14px`,background:E.light,border:`1px solid ${E.border}`,borderRadius:10,marginBottom:16,fontSize:9.5},children:[(0,S.jsxs)(`span`,{style:{fontWeight:800,color:E.primary,textTransform:`uppercase`,fontSize:8,letterSpacing:`0.06em`},children:[`Editing Payment #`,a.id]}),(0,S.jsxs)(`span`,{style:{color:`var(--text-3,#6b7280)`},children:[`Original Amount: `,(0,S.jsx)(`strong`,{style:{color:`var(--text-1,#0F172A)`},children:O(a.amount_paid)})]}),a.client_name&&(0,S.jsxs)(`span`,{style:{color:`var(--text-3,#6b7280)`},children:[`Client: `,(0,S.jsx)(`strong`,{style:{color:`var(--text-1,#0F172A)`},children:a.client_name})]}),(a.bill_number||a.bill_description)&&(0,S.jsxs)(`span`,{style:{color:`var(--text-3,#6b7280)`},children:[`Linked Bill: `,(0,S.jsx)(`strong`,{style:{color:`var(--text-1,#0F172A)`},children:a.bill_number?`#${a.bill_number}`:a.bill_description})]}),(0,S.jsxs)(`span`,{style:{color:`var(--text-3,#6b7280)`},children:[`Cash Book: `,a.daybook_entry_id?(0,S.jsxs)(`strong`,{style:{color:E.primary},children:[`Synced (DB #`,a.daybook_entry_id,`)`]}):(0,S.jsx)(`strong`,{style:{color:`var(--text-4,#9ca3af)`},children:`Not synced`})]})]}),(0,S.jsxs)(`div`,{className:`CM3-notice teal`,children:[(0,S.jsx)(F,{n:`sync`,sz:13,c:E.primary}),l?(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:`Editing repayment details`}),` — Cash Book sync settings are locked once recorded; only date, amount, mode, reference & notes can be updated here.`]}):(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:`Auto-syncs to Cash Book`}),` — category, sub-category, party & client auto-filled from ledger profile`]})]}),(0,S.jsxs)(`div`,{className:`CM3-section`,children:[(0,S.jsx)(`span`,{className:`CM3-section-tag`,children:`01 — Payment Details`}),(0,S.jsx)(`div`,{className:`CM3-section-rule`})]}),(0,S.jsxs)(`div`,{className:`CM3-grid2 CM3-pd-grid`,children:[(0,S.jsxs)(`div`,{className:`CM3-field`,children:[(0,S.jsxs)(`label`,{className:`CM3-label`,children:[`Payment Date `,(0,S.jsx)(`span`,{className:`req`,children:`*`})]}),(0,S.jsx)(g,{value:H.payment_date,onChange:e=>G(`payment_date`,e)})]}),(0,S.jsxs)(`div`,{className:`CM3-field${h===`amount_paid`?` err`:``}`,ref:v,children:[(0,S.jsxs)(`label`,{className:`CM3-label`,children:[`Amount Paid (₹) `,(0,S.jsx)(`span`,{className:`req`,children:`*`})]}),(0,S.jsx)(`input`,{ref:y,type:`number`,step:`1`,min:`0`,className:`CM3-input`,placeholder:`Max: ${O(e.balance)}`,value:H.amount_paid,onChange:e=>{G(`amount_paid`,e.target.value.replace(/[.,].*$/,``)),h===`amount_paid`&&_(null)},style:{borderColor:E.border}}),h===`amount_paid`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Enter a valid amount greater than 0`})]}),(0,S.jsx)(`div`,{className:`CM3-field`,children:(0,S.jsx)(I,{label:`Payment Mode`,required:!0,accent:E.primary,options:oe,value:H.payment_mode,onChange:e=>G(`payment_mode`,e),placeholder:`Select mode…`})}),(0,S.jsxs)(`div`,{className:`CM3-field`,children:[(0,S.jsx)(`label`,{className:`CM3-label`,children:`Reference / UTR`}),(0,S.jsx)(`input`,{type:`text`,className:`CM3-input`,placeholder:`Cheque / UPI ID / UTR…`,value:H.reference,onChange:e=>G(`reference`,e.target.value)})]}),(0,S.jsxs)(`div`,{className:`CM3-field`,style:{gridColumn:`1/-1`},children:[(0,S.jsx)(`label`,{className:`CM3-label`,children:`Notes`}),(0,S.jsx)(`input`,{type:`text`,className:`CM3-input`,placeholder:`Internal note…`,value:H.notes,onChange:e=>G(`notes`,e.target.value)})]})]}),!l&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(`div`,{className:`CM3-section`,children:[(0,S.jsx)(`span`,{className:`CM3-section-tag`,children:`02 — Cash Book Sync`}),(0,S.jsx)(`div`,{className:`CM3-section-rule`})]}),(0,S.jsxs)(`div`,{className:`CM3-db-box`,children:[(0,S.jsxs)(`label`,{className:`CM3-db-toggle`,children:[(0,S.jsx)(`input`,{type:`checkbox`,checked:H.sync_to_daybook,onChange:e=>G(`sync_to_daybook`,e.target.checked),style:{width:16,height:16,accentColor:E.primary}}),(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{className:`CM3-db-toggle-title`,children:[(0,S.jsx)(F,{n:`book`,sz:11,c:`currentColor`}),` Post to Cash Book Automatically`]}),(0,S.jsx)(`div`,{className:`CM3-db-toggle-sub`,children:`Creates matching expense entry in Cash Book`})]})]}),H.sync_to_daybook&&(0,S.jsx)(`div`,{style:{marginTop:10},children:(0,S.jsxs)(`div`,{className:`CM3-db-grid`,children:[(0,S.jsxs)(`div`,{className:`CM3-field${h===`daybook_bio_data_id`?` err`:``}`,ref:C,children:[(0,S.jsx)(I,{label:`Party Name in Cash Book`,required:!0,accent:E.primary,options:ie,value:H.daybook_bio_data_id,onChange:e=>{G(`daybook_bio_data_id`,e),h===`daybook_bio_data_id`&&_(null)},placeholder:`Select party…`}),B&&H.daybook_bio_data_id===String(B.id)&&(0,S.jsxs)(`div`,{className:`CM3-db-hint`,children:[`✓ Auto-matched: `,B.name]}),h===`daybook_bio_data_id`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Party Name is required`})]}),(0,S.jsxs)(`div`,{className:`CM3-field${h===`daybook_category_id`?` err`:``}`,ref:T,children:[(0,S.jsx)(I,{label:`Expense Account Head`,required:!0,accent:E.primary,options:ae,value:H.daybook_category_id,onChange:e=>{K(e),h===`daybook_category_id`&&_(null)},placeholder:`Select category…`}),R&&H.daybook_category_id===R&&(0,S.jsxs)(`div`,{className:`CM3-db-hint`,children:[`✓ Auto-filled: `,e.category_name]}),h===`daybook_category_id`&&(0,S.jsx)(`div`,{className:`CM3-field-err-msg`,children:`Account Head is required`})]}),(0,S.jsx)(`div`,{className:`CM3-field`,children:(0,S.jsx)(I,{label:`Account Sub-Head`,accent:E.primary,options:J.map(e=>({value:String(e.id),label:e.name})),value:H.daybook_sub_category_id,onChange:e=>G(`daybook_sub_category_id`,e),placeholder:H.daybook_category_id?J.length===0?`No sub-categories`:`Select sub-category…`:`Select category first…`,disabled:!H.daybook_category_id||J.length===0,emptyMsg:`No sub-categories`})}),(0,S.jsxs)(`div`,{className:`CM3-field`,style:{gridColumn:`1/-1`},children:[(0,S.jsx)(`label`,{className:`CM3-field-label`,children:`Client Name`}),(0,S.jsx)(`div`,{className:`CM3-db-client-box`,children:se?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(F,{n:`client`,sz:10,c:E.primary}),(0,S.jsx)(`span`,{style:{fontSize:8.5,fontWeight:800,color:`#1a1a1a`},children:se}),(0,S.jsx)(`span`,{style:{fontSize:7.5,color:E.primary,marginLeft:`auto`,fontWeight:700},children:`Auto-filled from bill`})]}):(0,S.jsx)(`span`,{style:{fontSize:8,color:`#aaa`,fontWeight:700,fontStyle:`normal`},children:`No client assigned to open bills`})})]}),(0,S.jsxs)(`div`,{className:`CM3-field`,style:{gridColumn:`1/-1`},children:[(0,S.jsx)(`label`,{className:`CM3-field-label`,children:`Cash Book Narration`}),(0,S.jsx)(`input`,{type:`text`,className:`CM3-input`,value:H.daybook_narration,onChange:e=>G(`daybook_narration`,e.target.value),placeholder:`Narration for daybook entry…`})]})]})})]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-mfoot`,children:[(0,S.jsx)(`button`,{className:`CM3-btn ghost`,onClick:s,children:`Cancel`}),(0,S.jsx)(`button`,{className:`CM3-btn payment`,onClick:X,disabled:u,children:u?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`CM3-spin`}),` `,l?`Updating…`:H.sync_to_daybook?`Saving & Syncing…`:`Saving…`]}):l?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(F,{n:`edit`,sz:12,c:`#fff`}),` Update Payment`]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(F,{n:`check`,sz:12,c:`#fff`}),` Add Payment`]})})]})]})}),document.body),k&&o?(0,S.jsx)(ne,{paymentAmount:Math.round(+H.amount_paid),paymentDate:H.payment_date,entries:o,onPlanConfirmed:e=>{M(!1),ce(e)},onSkip:()=>{M(!1);let e=(o??[]).filter(e=>!e.is_paid),t=te(Math.round(+H.amount_paid),e);t.hasRedist?P({show:!0,result:t}):ce([])},onClose:()=>M(!1)}):null,N.show&&N.result?(0,S.jsx)(W,{totalAmount:Math.round(+H.amount_paid),result:N.result,onConfirm:e=>{P({show:!1,result:null}),ce(e)},onCancel:()=>P({show:!1,result:null})}):null]})}function G({vendor:e,onReload:t,onVendorDeleted:n,bioData:r,categories:a,subCategories:o}){let[c,u]=(0,b.useState)({open:!1,type:``,id:0,name:``,loading:!1}),[d,p]=(0,b.useState)(null),[h,g]=(0,b.useState)(!0),[_,x]=(0,b.useState)(`entries`),[w,j]=(0,b.useState)(null),[N,P]=(0,b.useState)(!1),[I,L]=(0,b.useState)(!1),[ee,B]=(0,b.useState)(!1),[V,H]=(0,b.useState)(``),[U,te]=(0,b.useState)(null),[ne,W]=(0,b.useState)(null),[G,K]=(0,b.useState)(1),[q,ie]=(0,b.useState)(10),[ae,J]=(0,b.useState)(1),[oe,Y]=(0,b.useState)(10),[se]=(0,b.useState)(()=>l()),X=(0,b.useCallback)(async(t=!1)=>{t||g(!0);try{let{data:t}=await f.get(`/api/credit-management/vendors/${e.id}`,{headers:D()});p({vendor:t.data,entries:t.data.entries||[],payments:t.data.payments||[]})}catch(e){console.error(e)}finally{t||g(!1)}},[e.id]);(0,b.useEffect)(()=>{X()},[X]);let ce=e=>{u({open:!0,type:`entry`,id:e,name:`this credit entry`,loading:!1})},le=e=>{u({open:!0,type:`payment`,id:e,name:`this payment`,loading:!1})};if(h)return(0,S.jsx)(`div`,{style:{padding:20,display:`flex`,flexDirection:`column`,gap:10},children:[80,60,60,60].map((e,t)=>(0,S.jsx)(`div`,{className:`CM3-skel`,style:{height:e}},t))});let Z=d?.vendor??e,ue=C[Z.status],de=M(Z.party_name),fe=d?.entries??[],Q=d?.payments??[],pe=[...fe.map(e=>({type:`cr`,date:e.credit_date,label:e.client_name?`${e.client_name} — ${Z.party_name}`:Z.party_name,sub:e.description||e.bill_number||`Bill #${e.id}`,amount:e.credit_amount})),...Q.map(e=>({type:`pm`,date:e.payment_date,label:e.client_name?`${e.client_name} — ${Z.party_name}`:Z.party_name,sub:`${e.payment_mode}${e.reference?` · ${e.reference}`:``}`,amount:e.amount_paid,synced:!!e.daybook_entry_id}))].sort((e,t)=>t.date.localeCompare(e.date)),$=[],me=new Map;for(let e of fe){let t=e.client_name||`(No Client)`;me.has(t)||me.set(t,{name:t,entries:[],totalBilled:0,totalPaid:0,balance:0});let n=me.get(t);n.entries.push(e),n.totalBilled+=e.credit_amount,n.totalPaid+=e.amount_paid,n.balance=n.totalBilled-n.totalPaid}me.forEach(e=>$.push(e)),$.sort((e,t)=>t.balance-e.balance);let he=Z.total_credit>0?Math.min(100,Z.total_paid/Z.total_credit*100):0,ge=[...fe].sort((e,t)=>{if(e.is_paid!==t.is_paid)return e.is_paid?1:-1;let n={high:0,medium:1,low:2};return(n[e.priority]??3)-(n[t.priority]??3)}),_e=Math.max(1,Math.ceil(ge.length/q)),ve=Math.min(G,_e),ye=ge.slice((ve-1)*q,ve*q),be=Math.max(1,Math.ceil(Q.length/oe)),xe=Math.min(ae,be),Se=Q.slice((xe-1)*oe,xe*oe);return(0,S.jsx)(S.Fragment,{children:(0,S.jsxs)(`div`,{className:`CM3-detail`,children:[(0,S.jsxs)(`div`,{className:`CM3-vhdr`,children:[(0,S.jsxs)(`div`,{className:`CM3-vhdr-left`,children:[(0,S.jsx)(`div`,{className:`CM3-vhdr-avatar`,style:{background:de.bg,color:de.color,borderColor:de.border},children:Z.party_name.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{className:`CM3-vhdr-name`,children:Z.party_name}),(0,S.jsxs)(`div`,{className:`CM3-vhdr-cat`,children:[Z.category_name,Z.sub_category_name?` › ${Z.sub_category_name}`:``]}),$.length>0&&(0,S.jsxs)(`div`,{className:`CM3-vhdr-client-strip`,children:[(0,S.jsx)(F,{n:`client`,sz:11,c:E.primary}),(0,S.jsxs)(`span`,{className:`CM3-vhdr-client-label`,children:[$.length,` client`,$.length===1?``:`s`]})]}),(0,S.jsxs)(`div`,{style:{marginTop:6,display:`flex`,alignItems:`center`,gap:8,flexWrap:`wrap`},children:[(0,S.jsxs)(`span`,{className:`CM3-tag`,style:{background:ue.bg,color:ue.color,borderColor:ue.border},children:[(0,S.jsx)(`span`,{className:`CM3-dot`,style:{background:ue.color}}),ue.label,Z.days_overdue>0&&` · ${Z.days_overdue}d`]}),(0,S.jsxs)(`span`,{style:{fontSize:9,fontWeight:700,color:`#374151`},children:[Z.entry_count,` bills · `,Z.payment_count,` payments`]})]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-vhdr-actions`,children:[(0,S.jsxs)(`button`,{className:`CM3-act credit`,onClick:()=>P(!0),children:[(0,S.jsx)(F,{n:`receipt`,sz:13,c:`#fff`}),` Add Bill`]}),(0,S.jsxs)(`button`,{className:`CM3-act payment`,disabled:Z.balance<=0,onClick:()=>L(!0),children:[(0,S.jsx)(F,{n:`cash`,sz:13,c:`#fff`}),` Repayment`]}),(0,S.jsxs)(`button`,{className:`CM3-act ghost`,onClick:()=>B(!0),children:[(0,S.jsx)(F,{n:`edit`,sz:13,c:`currentColor`}),` Edit`]})]})]}),(0,S.jsxs)(`div`,{style:{borderBottom:`1.5px solid var(--border,#E9EEF5)`},children:[$.length>0&&(0,S.jsxs)(`div`,{className:`CM3-client-cell`,style:{cursor:`pointer`},onClick:()=>x(`clients`),children:[(0,S.jsx)(F,{n:`client`,sz:12,c:E.primary}),(0,S.jsxs)(`span`,{className:`CM3-client-cell-lbl`,children:[$.length,` Client`,$.length===1?``:`s`]}),(0,S.jsx)(`span`,{className:`CM3-client-cell-name`,children:$.map(e=>e.name).join(`, `)})]}),(0,S.jsxs)(`div`,{className:`CM3-bal-strip`,children:[(0,S.jsxs)(`div`,{className:`CM3-bal-cell`,children:[(0,S.jsxs)(`div`,{className:`CM3-bal-lbl`,children:[(0,S.jsx)(F,{n:`down`,sz:9,c:T.mid}),`Total Credit`]}),(0,S.jsx)(`div`,{className:`CM3-bal-val credit-color`,children:O(Z.total_credit)})]}),(0,S.jsxs)(`div`,{className:`CM3-bal-cell`,children:[(0,S.jsxs)(`div`,{className:`CM3-bal-lbl`,children:[(0,S.jsx)(F,{n:`up`,sz:9,c:E.primary}),`Total Repaid`]}),(0,S.jsx)(`div`,{className:`CM3-bal-val payment-color`,children:O(Z.total_paid)})]}),(0,S.jsxs)(`div`,{className:`CM3-bal-cell`,children:[(0,S.jsxs)(`div`,{className:`CM3-bal-lbl`,children:[(0,S.jsx)(F,{n:`scale`,sz:9,c:`#C47E0A`}),`Balance Due`]}),(0,S.jsx)(`div`,{className:`CM3-bal-val balance-color`,children:O(Z.balance)})]})]})]}),Z.total_credit>0&&(0,S.jsxs)(`div`,{className:`CM3-prog`,children:[(0,S.jsx)(`div`,{className:`CM3-prog-bar`,children:(0,S.jsx)(`div`,{className:`CM3-prog-fill`,style:{width:`${he}%`}})}),(0,S.jsxs)(`span`,{className:`CM3-prog-txt`,children:[Math.round(he),`% repaid`]}),(0,S.jsxs)(`span`,{style:{fontSize:9,color:`#4b5563`,fontWeight:800,marginLeft:8},children:[`Last: `,k(Z.last_transaction_date)]})]}),V&&(0,S.jsxs)(`div`,{className:`CM3-sync-banner`,children:[(0,S.jsx)(F,{n:`circle`,sz:16,c:E.primary}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`strong`,{children:`Cash Book Synced —`}),` `,V]})]}),(0,S.jsxs)(`div`,{className:`CM3-tabs-bar`,children:[(0,S.jsxs)(`div`,{className:`CM3-tabs`,children:[(0,S.jsxs)(`button`,{className:`CM3-tab credit-tab${_===`entries`?` on`:``}`,onClick:()=>x(`entries`),children:[`Bills (`,fe.length,`)`]}),(0,S.jsxs)(`button`,{className:`CM3-tab payment-tab${_===`payments`?` on`:``}`,onClick:()=>x(`payments`),children:[`Payments (`,Q.length,`)`]}),(0,S.jsxs)(`button`,{className:`CM3-tab${_===`clients`?` on`:``}`,onClick:()=>x(`clients`),style:{color:_===`clients`?E.primary:void 0},children:[`By Client (`,$.length,`)`]}),(0,S.jsx)(`button`,{className:`CM3-tab tl-tab${_===`timeline`?` on`:``}`,onClick:()=>x(`timeline`),children:`Timeline`})]}),(0,S.jsxs)(`div`,{style:{display:`flex`,gap:6},children:[_===`entries`&&(0,S.jsxs)(`button`,{className:`CM3-tab-add credit`,onClick:()=>P(!0),children:[(0,S.jsx)(F,{n:`plus`,sz:11,c:`currentColor`}),` Bill`]}),_===`payments`&&(0,S.jsxs)(`button`,{className:`CM3-tab-add payment`,onClick:()=>L(!0),children:[(0,S.jsx)(F,{n:`plus`,sz:11,c:`currentColor`}),` Repayment`]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-content`,children:[_===`entries`&&(fe.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,children:[(0,S.jsx)(`div`,{className:`CM3-empty-ic credit-empty`,children:(0,S.jsx)(F,{n:`inbox`,sz:22,c:T.mid})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No Bills Yet`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Add bills to track credit`})]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`div`,{className:`CM3-billtbl-wrap`,children:(0,S.jsxs)(`table`,{className:`CM3-billtbl`,children:[(0,S.jsxs)(`colgroup`,{children:[(0,S.jsx)(`col`,{className:`c-sno`}),(0,S.jsx)(`col`,{className:`c-inv`}),(0,S.jsx)(`col`,{className:`c-client`}),(0,S.jsx)(`col`,{className:`c-date`}),(0,S.jsx)(`col`,{className:`c-due`}),(0,S.jsx)(`col`,{className:`c-priority`}),(0,S.jsx)(`col`,{className:`c-credit`}),(0,S.jsx)(`col`,{className:`c-paid`}),(0,S.jsx)(`col`,{className:`c-balance`}),(0,S.jsx)(`col`,{className:`c-status`}),(0,S.jsx)(`col`,{className:`c-acts`})]}),(0,S.jsx)(`thead`,{children:(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`th`,{children:`S.no`}),(0,S.jsx)(`th`,{children:`Invoice No`}),(0,S.jsx)(`th`,{children:`Client`}),(0,S.jsx)(`th`,{children:`Date`}),(0,S.jsx)(`th`,{children:`Due`}),(0,S.jsx)(`th`,{children:`Priority`}),(0,S.jsx)(`th`,{style:{textAlign:`right`},children:`Credit Amt`}),(0,S.jsx)(`th`,{style:{textAlign:`right`},children:`Paid`}),(0,S.jsx)(`th`,{style:{textAlign:`right`},children:`Balance`}),(0,S.jsx)(`th`,{children:`Status`}),(0,S.jsx)(`th`,{style:{textAlign:`right`},children:`Actions`})]})}),(0,S.jsx)(`tbody`,{children:ye.map((e,t)=>{let n=String((ve-1)*q+t+1).padStart(2,`0`),r=e.due_date?Math.ceil((new Date(e.due_date).getTime()-Date.now())/864e5):null,i=!e.is_paid&&r!==null&&r<0,a=!e.is_paid&&r!==null&&r>=0&&r<=5,o=e.settled_at||e.updated_at||e.credit_date,c=e.is_paid&&o?new Date(o):null;return(0,S.jsxs)(`tr`,{className:e.is_paid?`row-closed`:``,style:{animationDelay:`${t*25}ms`},children:[(0,S.jsx)(`td`,{children:(0,S.jsx)(`span`,{className:`CM3-billtbl-sno`,children:n})}),(0,S.jsxs)(`td`,{children:[(0,S.jsx)(`span`,{className:`CM3-billtbl-ref`,children:e.bill_number||`ID ${e.id}`}),e.description&&(0,S.jsx)(`div`,{style:{fontSize:8.5,color:`#4b5563`,fontWeight:800,marginTop:3},children:e.description})]}),(0,S.jsx)(`td`,{children:e.client_name?(0,S.jsx)(`span`,{className:`CM3-billtbl-client`,children:e.client_name}):(0,S.jsx)(`span`,{style:{color:`var(--text-4,#9ca3af)`},children:`—`})}),(0,S.jsx)(`td`,{children:k(e.credit_date)}),(0,S.jsx)(`td`,{children:e.is_paid?(0,S.jsx)(`span`,{style:{color:`var(--text-4,#9ca3af)`},children:`—`}):e.due_date&&r!==null?(0,S.jsx)(`span`,{style:{color:i?`#D93B55`:a?`#C47E0A`:`var(--text-3,#6b7280)`,fontWeight:800},children:i?`${Math.abs(r)}d overdue`:r===0?`Today`:`${r}d`}):(0,S.jsx)(`span`,{style:{color:`var(--text-4,#9ca3af)`},children:`—`})}),(0,S.jsx)(`td`,{children:!e.is_paid&&(0,S.jsx)(`span`,{className:`CM3-billtbl-priority ${e.priority}`,children:e.priority})}),(0,S.jsx)(`td`,{className:`CM3-billtbl-amt`,style:{textAlign:`right`},children:O(e.credit_amount)}),(0,S.jsx)(`td`,{className:`CM3-billtbl-amt paid`,style:{textAlign:`right`},children:O(e.amount_paid)}),(0,S.jsx)(`td`,{className:`CM3-billtbl-amt due`,style:{textAlign:`right`},children:e.is_paid?`—`:O(e.bill_balance)}),(0,S.jsx)(`td`,{children:e.is_paid?(0,S.jsxs)(`span`,{className:`CM3-billtbl-status closed`,children:[`Settled`,c?` · ${c.toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`})}`:``]}):i?(0,S.jsx)(`span`,{className:`CM3-billtbl-status overdue`,children:`Overdue`}):a?(0,S.jsx)(`span`,{className:`CM3-billtbl-status near`,children:`Due Soon`}):(0,S.jsx)(`span`,{className:`CM3-billtbl-status open`,children:`To Repay`})}),(0,S.jsx)(`td`,{children:(0,S.jsxs)(`div`,{className:`CM3-billtbl-acts`,children:[(0,S.jsx)(`button`,{className:`CM3-billtbl-act edit`,title:`Edit`,onClick:()=>te(e),children:(0,S.jsx)(F,{n:`edit`,sz:11})}),s(se)?(0,S.jsx)(`button`,{className:`CM3-billtbl-act del`,title:`Delete`,onClick:()=>ce(e.id),children:(0,S.jsx)(F,{n:`trash`,sz:11})}):(0,S.jsx)(y,{name:e.created_by_name})]})})]},e.id)})})]})}),ge.length>0&&(0,S.jsx)(v,{page:ve,totalPages:_e,onPageChange:K,total:ge.length,perPage:q,onPerPageChange:e=>{ie(e),K(1)},itemLabel:`bills`})]})),_===`payments`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(`div`,{className:`CM3-pm-hdr`,children:[(0,S.jsxs)(`div`,{className:`CM3-pm-hdr-title`,children:[(0,S.jsx)(`div`,{className:`CM3-pm-hdr-dot`}),`Repayment History · `,Q.length,` entries`]}),(0,S.jsxs)(`div`,{className:`CM3-pm-hdr-total`,children:[`−`,O(Q.reduce((e,t)=>e+Number(t.amount_paid),0)),` total`]})]}),Q.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,style:{padding:`40px 16px`},children:[(0,S.jsx)(`div`,{className:`CM3-empty-ic payment-empty`,children:(0,S.jsx)(F,{n:`cash`,sz:22,c:E.primary})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No Payments Yet`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Record a repayment — auto-posts to Cash Book`})]}):Se.map((e,t)=>{let n=String((xe-1)*oe+t+1).padStart(2,`0`),r=e.client_name?`${e.client_name} — ${Z.party_name}`:Z.party_name;return(0,S.jsxs)(`div`,{className:`CM3-pmc`,style:{animationDelay:`${t*40}ms`},children:[(0,S.jsxs)(`div`,{className:`CM3-pmc-left`,children:[(0,S.jsx)(`div`,{className:`CM3-pmc-num-lbl`,children:`PAY`}),(0,S.jsx)(`div`,{className:`CM3-pmc-num`,children:n}),(0,S.jsx)(`div`,{className:`CM3-pmc-icon-ring`,children:(0,S.jsx)(`svg`,{width:11,height:11,viewBox:`0 0 24 24`,fill:`none`,stroke:`#0d9488`,strokeWidth:2.5,strokeLinecap:`round`,children:(0,S.jsx)(`path`,{d:`M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6`})})})]}),(0,S.jsxs)(`div`,{className:`CM3-pmc-body`,children:[(0,S.jsxs)(`div`,{className:`CM3-pmc-row1`,children:[(0,S.jsx)(`span`,{className:`CM3-pmc-vendor`,children:r}),(0,S.jsx)(`span`,{className:`CM3-pmc-mode`,children:e.payment_mode})]}),(0,S.jsxs)(`div`,{className:`CM3-pmc-row2`,children:[(0,S.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--text-4)`,strokeWidth:2,children:[(0,S.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`}),(0,S.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,S.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,S.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),(0,S.jsx)(`span`,{className:`CM3-pmc-desc`,children:k(e.payment_date)}),e.reference&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`CM3-pmc-dot`,children:`·`}),(0,S.jsx)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--text-4)`,strokeWidth:2,children:(0,S.jsx)(`path`,{d:`M7 20l4-16m2 16l4-16M6 9h14M4 15h14`})}),(0,S.jsx)(`span`,{className:`CM3-pmc-desc`,children:e.reference})]})]}),(0,S.jsxs)(`div`,{className:`CM3-pmc-row3`,children:[e.daybook_entry_id?(0,S.jsxs)(`span`,{className:`CM3-pmc-chip synced`,children:[(0,S.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,S.jsx)(`path`,{d:`M20 6 9 17l-5-5`})}),`DB #`,e.daybook_entry_id,` Synced`]}):(0,S.jsxs)(`span`,{className:`CM3-pmc-chip unsynced`,children:[(0,S.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,children:[(0,S.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,S.jsx)(`line`,{x1:`15`,y1:`9`,x2:`9`,y2:`15`}),(0,S.jsx)(`line`,{x1:`9`,y1:`9`,x2:`15`,y2:`15`})]}),`Not in Cash Book`]}),e.reference&&(0,S.jsxs)(`span`,{className:`CM3-pmc-chip ref`,children:[`#`,e.reference]}),e.client_name&&(0,S.jsxs)(`span`,{className:`CM3-pmc-chip client`,children:[(0,S.jsxs)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,S.jsx)(`path`,{d:`M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2`}),(0,S.jsx)(`circle`,{cx:`12`,cy:`7`,r:`4`})]}),e.client_name]}),e.notes&&(0,S.jsxs)(`span`,{className:`CM3-pmc-chip date`,title:e.notes,children:[(0,S.jsx)(`svg`,{width:8,height:8,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,S.jsx)(`path`,{d:`M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z`})}),`Note`]})]})]}),(0,S.jsxs)(`div`,{className:`CM3-pmc-right`,children:[(0,S.jsxs)(`div`,{className:`CM3-pmc-amt`,children:[`−`,O(e.amount_paid)]}),(0,S.jsx)(`span`,{className:`CM3-pmc-status`,children:`✓ REPAID`})]}),(0,S.jsxs)(`div`,{className:`CM3-pmc-acts`,children:[(0,S.jsx)(`button`,{className:`CM3-pmc-act edit`,title:`Edit`,onClick:()=>W(e),children:(0,S.jsx)(F,{n:`edit`,sz:10})}),s(se)?(0,S.jsx)(`button`,{className:`CM3-pmc-act del`,title:`Delete`,onClick:()=>le(e.id),children:(0,S.jsx)(F,{n:`trash`,sz:10})}):(0,S.jsx)(y,{name:e.created_by_name})]})]},e.id)}),Q.length>0&&(0,S.jsx)(v,{page:xe,totalPages:be,onPageChange:J,total:Q.length,perPage:oe,onPerPageChange:e=>{Y(e),J(1)},itemLabel:`repayments`})]}),_===`clients`&&($.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,children:[(0,S.jsx)(`div`,{className:`CM3-empty-ic`,style:{background:`rgba(13,148,136,0.08)`,border:`1.5px solid rgba(13,148,136,0.2)`},children:(0,S.jsx)(F,{n:`client`,sz:22,c:E.primary})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No Clients Yet`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Client names appear here once bills are added`})]}):(0,S.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:8},children:$.map((e,t)=>{let n=w===e.name,r=M(e.name),i=e.totalBilled>0?Math.min(100,e.totalPaid/e.totalBilled*100):0,a=Q.filter(t=>(t.client_name||`(No Client)`)===e.name);return(0,S.jsxs)(`div`,{style:{border:`1.5px solid var(--border,#E9EEF5)`,borderRadius:12,overflow:`hidden`,background:`var(--bg,#fff)`,animationDelay:`${t*40}ms`},children:[(0,S.jsxs)(`div`,{onClick:()=>j(n?null:e.name),style:{display:`flex`,alignItems:`center`,gap:10,padding:`10px 14px`,cursor:`pointer`,background:n?`rgba(13,148,136,0.04)`:void 0},children:[(0,S.jsx)(`div`,{style:{width:34,height:34,borderRadius:8,background:r.bg,border:`1.5px solid ${r.border}`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontWeight:800,fontSize:9.5,color:r.color,flexShrink:0},children:e.name.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,S.jsx)(`div`,{style:{fontSize:11.5,fontWeight:800,color:`var(--text-1,#0F172A)`},children:e.name}),(0,S.jsxs)(`div`,{style:{fontSize:9,color:`var(--text-4,#9ca3af)`},children:[e.entries.length,` bill`,e.entries.length===1?``:`s`,` · `,a.length,` payment`,a.length===1?``:`s`]})]}),(0,S.jsxs)(`div`,{style:{textAlign:`right`,flexShrink:0},children:[(0,S.jsx)(`div`,{style:{fontSize:10.5,fontWeight:800,color:e.balance>0?T.mid:`#1E9C6A`},children:O(e.balance)}),(0,S.jsx)(`div`,{style:{fontSize:9,color:`var(--text-4,#9ca3af)`},children:`balance`})]}),(0,S.jsx)(F,{n:n?`up`:`down`,sz:12,c:`var(--text-4,#9ca3af)`})]}),(0,S.jsx)(`div`,{style:{height:3,background:`var(--border,#E9EEF5)`,margin:`0 14px`},children:(0,S.jsx)(`div`,{style:{height:`100%`,width:`${i}%`,background:E.primary,borderRadius:2,transition:`width 0.4s`}})}),(0,S.jsx)(`div`,{style:{display:`flex`,gap:0,borderBottom:n?`1px solid var(--border,#E9EEF5)`:void 0},children:[{label:`Billed`,val:e.totalBilled,color:T.mid},{label:`Repaid`,val:e.totalPaid,color:E.primary},{label:`Due`,val:e.balance,color:e.balance>0?`#C47E0A`:`#1E9C6A`}].map((e,t)=>(0,S.jsxs)(`div`,{style:{flex:1,padding:`7px 14px`,borderRight:t<2?`1px solid var(--border,#E9EEF5)`:void 0},children:[(0,S.jsx)(`div`,{style:{fontSize:8,color:`var(--text-4,#9ca3af)`,textTransform:`uppercase`,letterSpacing:`0.07em`},children:e.label}),(0,S.jsx)(`div`,{style:{fontSize:10.5,fontWeight:800,color:e.color},children:O(e.val)})]},t))}),n&&(()=>{let t=[...e.entries.map(e=>({id:`bill-${e.id}`,date:e.credit_date,type:`bill`,ref:e.bill_number?`#${e.bill_number}`:e.description||`Bill #${e.id}`,amount:e.credit_amount,statusNode:e.is_paid?(0,S.jsx)(`span`,{style:{color:`#1E9C6A`,fontWeight:800},children:`✓ Paid`}):(0,S.jsxs)(`span`,{style:{color:`#C47E0A`,fontWeight:800},children:[O(e.bill_balance),` due`]})})),...a.map(e=>({id:`pmt-${e.id}`,date:e.payment_date,type:`payment`,ref:`${e.payment_mode}${e.reference?` · ${e.reference}`:``}`,amount:e.amount_paid,statusNode:e.daybook_entry_id?(0,S.jsx)(`span`,{style:{color:`#1E9C6A`,fontWeight:800,fontSize:8},children:`✓ Cash Book`}):(0,S.jsx)(`span`,{style:{color:`var(--text-4,#9ca3af)`,fontSize:8},children:`—`})}))].sort((e,t)=>(t.date||``).localeCompare(e.date||``)),n={textAlign:`left`,padding:`6px 10px`,fontSize:8,fontWeight:800,textTransform:`uppercase`,letterSpacing:`0.06em`,color:`var(--text-4,#9ca3af)`,borderBottom:`1.5px solid var(--border,#E9EEF5)`,whiteSpace:`nowrap`},r={padding:`7px 10px`,fontSize:9.5,color:`var(--text-2,#4b5563)`,borderBottom:`1px solid var(--border,#E9EEF5)`,whiteSpace:`nowrap`};return(0,S.jsx)(`div`,{style:{padding:`8px 14px 12px`},children:t.length===0?(0,S.jsx)(`div`,{style:{fontSize:9.5,color:`var(--text-4,#9ca3af)`,padding:`10px 0`},children:`No bills or repayments for this client yet.`}):(0,S.jsx)(`div`,{style:{overflowX:`auto`,borderRadius:8,border:`1px solid var(--border,#E9EEF5)`},children:(0,S.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`},children:[(0,S.jsx)(`thead`,{children:(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`th`,{style:n,children:`#`}),(0,S.jsx)(`th`,{style:n,children:`Date`}),(0,S.jsx)(`th`,{style:n,children:`Type`}),(0,S.jsx)(`th`,{style:n,children:`Reference`}),(0,S.jsx)(`th`,{style:n,children:`Client`}),(0,S.jsx)(`th`,{style:{...n,textAlign:`right`},children:`Amount`}),(0,S.jsx)(`th`,{style:{...n,textAlign:`right`},children:`Balance / Status`})]})}),(0,S.jsx)(`tbody`,{children:t.map((t,n)=>(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`td`,{style:{...r,color:`var(--text-4,#9ca3af)`},children:n+1}),(0,S.jsx)(`td`,{style:r,children:k(t.date)}),(0,S.jsx)(`td`,{style:r,children:(0,S.jsx)(`span`,{style:{fontSize:8,fontWeight:800,padding:`2px 7px`,borderRadius:20,background:t.type===`bill`?`rgba(29,78,216,0.08)`:E.light,color:t.type===`bill`?T.mid:E.primary,border:`1px solid ${t.type===`bill`?`rgba(29,78,216,0.2)`:E.border}`},children:t.type===`bill`?`Bill`:`Payment`})}),(0,S.jsx)(`td`,{style:{...r,maxWidth:220,overflow:`hidden`,textOverflow:`ellipsis`},children:t.ref}),(0,S.jsx)(`td`,{style:{...r,fontWeight:700,color:`var(--text-1,#0F172A)`},children:e.name}),(0,S.jsxs)(`td`,{style:{...r,textAlign:`right`,fontWeight:800,color:t.type===`bill`?T.mid:E.primary},children:[t.type===`bill`?`+`:`−`,O(t.amount)]}),(0,S.jsx)(`td`,{style:{...r,textAlign:`right`},children:t.statusNode})]},t.id))}),(0,S.jsx)(`tfoot`,{children:(0,S.jsxs)(`tr`,{children:[(0,S.jsx)(`td`,{colSpan:5,style:{...r,fontWeight:800,color:`var(--text-1,#0F172A)`,borderBottom:`none`},children:`Total`}),(0,S.jsx)(`td`,{style:{...r,textAlign:`right`,fontWeight:800,color:E.primary,borderBottom:`none`},children:O(e.totalPaid)}),(0,S.jsxs)(`td`,{style:{...r,textAlign:`right`,fontWeight:800,color:e.balance>0?`#C47E0A`:`#1E9C6A`,borderBottom:`none`},children:[O(e.balance),` due`]})]})})]})})})})()]},t)})})),_===`timeline`&&(pe.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,children:[(0,S.jsx)(`div`,{className:`CM3-empty-ic`,style:{background:`#fffbeb`,border:`1.5px solid #fde68a`},children:(0,S.jsx)(F,{n:`list`,sz:22,c:`#C47E0A`})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No Activity`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Bills & payments appear here`})]}):(0,S.jsx)(`div`,{className:`CM3-tl`,children:pe.map((e,t)=>(0,S.jsxs)(`div`,{className:`CM3-tl-item`,children:[(0,S.jsx)(`div`,{className:`CM3-tl-dot ${e.type===`cr`?`credit-dot`:`payment-dot`}`,children:(0,S.jsx)(F,{n:e.type===`cr`?`down`:`up`,sz:8,c:e.type===`cr`?T.mid:E.primary})}),(0,S.jsxs)(`div`,{className:`CM3-tl-body`,children:[(0,S.jsx)(`div`,{className:`CM3-tl-label`,children:e.label}),(0,S.jsxs)(`div`,{className:`CM3-tl-sub`,children:[(0,S.jsx)(`span`,{children:e.sub}),(0,S.jsx)(`span`,{children:`·`}),(0,S.jsx)(`span`,{children:k(e.date)}),e.type===`pm`&&(e.synced?(0,S.jsxs)(`span`,{className:`CM3-synced`,style:{fontSize:8},children:[(0,S.jsx)(F,{n:`book`,sz:7,c:`currentColor`}),` Cash Book`]}):(0,S.jsx)(`span`,{className:`CM3-unsynced`,style:{fontSize:8},children:`No DB`}))]})]}),(0,S.jsxs)(`div`,{className:`CM3-tl-amt ${e.type===`cr`?`credit-tl`:`payment-tl`}`,children:[e.type===`cr`?`+`:`−`,O(e.amount)]})]},t))}))]}),N&&(0,S.jsx)(z,{vendor:Z,bioData:r,categories:a,onClose:()=>P(!1),onSaved:()=>{P(!1),X(!0),t()}}),U&&(0,S.jsx)(z,{vendor:Z,bioData:r,categories:a,editEntry:U,onClose:()=>te(null),onSaved:()=>{te(null),X(!0),t()}}),I&&(0,S.jsx)(re,{vendor:Z,bioData:r,categories:a,subCategories:o,vendorEntries:fe,onClose:()=>L(!1),onSaved:({daybook_synced:e})=>{L(!1),X(!0),t(),e&&(H(`Repayment recorded and posted to Cash Book on ${k(A())}.`),setTimeout(()=>H(``),6e3))}}),ne&&(0,S.jsx)(re,{vendor:Z,bioData:r,categories:a,subCategories:o,editPayment:ne,onClose:()=>W(null),onSaved:e=>{W(null),X(!0),t()}}),ee&&(0,S.jsx)(R,{categories:a,subCategories:o,bioData:r,vendors:[],editVendor:Z,onClose:()=>B(!1),onSaved:()=>{B(!1),X(!0),t()}}),c.open&&(0,S.jsx)(m,{open:c.open,title:c.type===`vendor`?`Delete Vendor?`:c.type===`entry`?`Delete Bill?`:`Delete Repayment?`,description:`This will permanently remove ${c.name} and cannot be undone.`,loading:c.loading,onCancel:()=>u(e=>({...e,open:!1})),onConfirm:async()=>{u(e=>({...e,loading:!0}));try{if(c.type===`entry`)await f.delete(`credit-management/entries/${c.id}`,{headers:D()}),i.warning(`Bill Deleted`,`"${c.name}" removed successfully`);else if(c.type===`payment`)await f.delete(`credit-management/payments/${c.id}`,{headers:D()}),i.warning(`Payment Deleted`,`"${c.name}" removed successfully`);else if(c.type===`vendor`){await f.delete(`credit-management/vendors/${c.id}`,{headers:D()}),i.warning(`Vendor Deleted`,`"${c.name}" removed successfully`),u({open:!1,type:``,id:0,name:``,loading:!1}),n();return}u({open:!1,type:``,id:0,name:``,loading:!1}),X(!0),t()}catch{i.error(`Failed to delete`),u(e=>({...e,loading:!1}))}}})]})})}function K(){let[e]=(0,b.useState)(()=>l()),[t,n]=(0,b.useState)([]),[i,a]=(0,b.useState)(null),[o,s]=(0,b.useState)(null),[c,u]=(0,b.useState)(!0),[d,m]=(0,b.useState)(``),[h,g]=(0,b.useState)(``),[y,x]=(0,b.useState)([]),[w,k]=(0,b.useState)([]),[A,j]=(0,b.useState)([]),[P,I]=(0,b.useState)(!1),[L,z]=(0,b.useState)(null),[B,V]=(0,b.useState)(null),H=(0,b.useRef)(null);r(H);let U=(0,b.useCallback)(async(e=!1)=>{e||u(!0);try{let e=D(),[t,r,i]=await Promise.all([f.get(`credit-management/vendors`,{headers:e}),f.get(`credit-management/summary`,{headers:e}),f.get(`master-data`,{headers:e})]);n(t.data.data?.data||t.data.data||[]),a(r.data.data||null),x(i.data.categories||[]),k(i.data.sub_categories||[]),j(i.data.bio_data||[])}catch(e){console.error(e)}finally{e||u(!1)}},[]);(0,b.useEffect)(()=>{U()},[U]);let te=t.filter(e=>{let t=d.toLowerCase(),n=!t||e.party_name.toLowerCase().includes(t)||(e.category_name||``).toLowerCase().includes(t),r=!h||e.status===h;return n&&r}),ne=(0,b.useMemo)(()=>{let e=new Map;return te.forEach(t=>{let n=t.category_name||`Uncategorized`,r=t.category_id==null?`name:${n}`:`id:${t.category_id}`;e.has(r)||e.set(r,{id:t.category_id??null,name:n,vendors:[]}),e.get(r).vendors.push(t)}),Array.from(e.values()).sort((e,t)=>e.name.localeCompare(t.name))},[te]),W=B?ne.find(e=>(e.id??-1)===(B.id??-1)&&e.name===B.name)||{id:B.id,name:B.name,vendors:[]}:null,[re,K]=(0,b.useState)(1),[q,ie]=(0,b.useState)(10),ae=Math.max(1,Math.ceil((W?.vendors.length||0)/q)),J=Math.min(re,ae),oe=W?W.vendors.slice((J-1)*q,J*q):[],Y=W?W.vendors.reduce((e,t)=>({credited:e.credited+(t.total_credit||0),repaid:e.repaid+(t.total_paid||0),outstanding:e.outstanding+(t.balance||0)}),{credited:0,repaid:0,outstanding:0}):null,se=i;return c?(0,S.jsxs)(`div`,{className:`ERP-page`,ref:H,children:[(0,S.jsxs)(`style`,{children:[p,ee]}),(0,S.jsx)(_,{containerRef:H,label:`Opening Accounts Payable…`}),(0,S.jsx)(`div`,{className:`ERP-hdr`,children:(0,S.jsxs)(`div`,{className:`ERP-hdr-left`,children:[(0,S.jsxs)(`div`,{className:`ERP-eyebrow`,children:[(0,S.jsx)(`span`,{className:`ERP-eyebrow-line`}),(0,S.jsx)(`span`,{className:`ERP-eyebrow-dot`}),`Credit & Payment Ledger`]}),(0,S.jsxs)(`h1`,{className:`ERP-title MD-page-title`,children:[`Accounts `,(0,S.jsx)(`span`,{className:`ERP-title-em`,children:`Payable`})]})]})}),(0,S.jsx)(`div`,{className:`ERP-divider`}),(0,S.jsx)(`div`,{className:`ERP-stats`,style:{gridTemplateColumns:`repeat(3, 1fr)`},children:[1,2,3].map(e=>(0,S.jsx)(`div`,{className:`CM3-skel`,style:{height:130,borderRadius:16}},e))}),(0,S.jsx)(`div`,{className:`CM3-skel`,style:{height:480,borderRadius:16,marginTop:14}})]}):(0,S.jsxs)(`div`,{className:`ERP-page`,ref:H,children:[(0,S.jsxs)(`style`,{children:[p,ee]}),(0,S.jsx)(_,{containerRef:H,label:`Opening Accounts Payable…`}),(0,S.jsx)(`div`,{className:`ERP-hdr`,children:(0,S.jsxs)(`div`,{className:`ERP-hdr-left`,children:[(0,S.jsxs)(`div`,{className:`ERP-eyebrow`,children:[(0,S.jsx)(`span`,{className:`ERP-eyebrow-line`}),(0,S.jsx)(`span`,{className:`ERP-eyebrow-dot`}),`Credit & Payment Ledger`]}),(0,S.jsxs)(`h1`,{className:`ERP-title MD-page-title`,children:[`Accounts `,(0,S.jsx)(`span`,{className:`ERP-title-em`,children:`Payable`})]})]})}),(0,S.jsx)(`div`,{className:`ERP-divider`}),(0,S.jsxs)(`div`,{className:`ERP-stats`,style:{gridTemplateColumns:`repeat(3, 1fr)`},children:[(0,S.jsxs)(`div`,{className:`ERP-stat`,children:[(0,S.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#0d9488,#14b8a6)`}}),(0,S.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Repaid`}),(0,S.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`#0d9488`,fontSize:16,fontWeight:800},children:[(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:12.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,S.jsx)(N,{value:Math.round(se?.total_paid??0)})]})]}),(0,S.jsxs)(`div`,{className:`ERP-stat`,children:[(0,S.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,var(--ember,#2563EB),var(--ember-mid,#3B82F6))`}}),(0,S.jsx)(`div`,{className:`ERP-stat-label`,children:`Total Outstanding`}),(0,S.jsxs)(`div`,{className:`ERP-stat-val`,style:{color:`var(--ember,#2563EB)`,fontSize:16,fontWeight:800},children:[(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:12.5,color:`var(--text-4)`,verticalAlign:`super`,marginRight:2},children:`₹`}),(0,S.jsx)(N,{value:Math.round(se?.balance??0)})]})]}),(0,S.jsxs)(`div`,{className:`ERP-stat`,children:[(0,S.jsx)(`div`,{className:`ERP-stat-accent`,style:{background:`linear-gradient(90deg,#D93B55,#f87171)`}}),(0,S.jsx)(`div`,{className:`ERP-stat-label`,children:`Overdue`}),(0,S.jsx)(`div`,{className:`ERP-stat-val`,style:{color:`#D93B55`,fontSize:16,fontWeight:800},children:(0,S.jsx)(N,{value:se?.overdue_count??0})})]})]}),(0,S.jsxs)(`div`,{className:`CM3-body`,children:[(0,S.jsxs)(`div`,{className:`CM3-sidebar`,children:[(0,S.jsxs)(`div`,{className:`CM3-sb-hero`,children:[(0,S.jsxs)(`div`,{className:`CM3-sb-eyebrow`,children:[(0,S.jsx)(`div`,{className:`CM3-sb-eyebrow-dot`}),`Payable Ledger`]}),(0,S.jsx)(`div`,{className:`CM3-sb-title`,children:`Vendors`}),(0,S.jsxs)(`div`,{className:`CM3-search`,children:[(0,S.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`var(--text-4)`,strokeWidth:2.5,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,S.jsx)(`path`,{d:`m21 21-4.35-4.35`})]}),(0,S.jsx)(`input`,{placeholder:`Search vendors…`,value:d,onChange:e=>m(e.target.value)}),d&&(0,S.jsx)(`button`,{onClick:()=>m(``),style:{background:`none`,border:`none`,cursor:`pointer`,color:`var(--text-4)`,lineHeight:1,padding:0},children:`✕`})]})]}),(0,S.jsxs)(`button`,{className:`CM3-add-btn`,onClick:()=>{z(null),I(!0)},children:[(0,S.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,S.jsx)(`line`,{x1:`12`,y1:`8`,x2:`12`,y2:`16`}),(0,S.jsx)(`line`,{x1:`8`,y1:`12`,x2:`16`,y2:`12`})]}),`Open Ledger Account`]}),(0,S.jsx)(`div`,{className:`CM3-filters`,children:[``,`pending`,`partial`,`overdue`,`clear`].map(e=>(0,S.jsx)(`button`,{className:`CM3-chip${h===e?` on`:``}`,onClick:()=>g(e),children:e===``?`⬤ All`:C[e]?.label||e},e))}),(0,S.jsxs)(`div`,{className:`CM3-sb-count`,children:[(0,S.jsxs)(`span`,{className:`CM3-sb-count-lbl`,children:[(0,S.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,style:{verticalAlign:`middle`,marginRight:3},children:[(0,S.jsx)(`path`,{d:`M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2`}),(0,S.jsx)(`circle`,{cx:`9`,cy:`7`,r:`4`}),(0,S.jsx)(`path`,{d:`M23 21v-2a4 4 0 00-3-3.87`}),(0,S.jsx)(`path`,{d:`M16 3.13a4 4 0 010 7.75`})]}),B?`Ledgers`:`Account Heads`]}),(0,S.jsx)(`span`,{className:`CM3-sb-count-num`,children:B?W.vendors.length:ne.length})]}),(0,S.jsx)(`div`,{className:`CM3-vlist`,children:B?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(`button`,{className:`CM3-cat-back`,onClick:()=>{V(null),s(null)},children:[(0,S.jsx)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,S.jsx)(`path`,{d:`m15 18-6-6 6-6`})}),(0,S.jsx)(`span`,{className:`CM3-cat-back-name`,children:B.name}),(0,S.jsx)(`span`,{className:`CM3-cat-back-count`,children:W.vendors.length})]}),W.vendors.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,style:{padding:`32px 16px`},children:[(0,S.jsx)(`div`,{className:`CM3-empty-icon`,children:(0,S.jsx)(F,{n:`inbox`,sz:32,c:`var(--text-4)`})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No ledgers found`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Try a different filter or add a ledger`})]}):oe.map((e,t)=>{let n=M(e.party_name),r=C[e.status],i=(e.client_bio_data_id?A.find(t=>t.id===e.client_bio_data_id):null)?.name||e.client_name||null,a=o?.id===e.id,c=e.total_credit>0?Math.min(100,e.total_paid/e.total_credit*100):0;return(0,S.jsxs)(`div`,{className:`CM3-vcard${a?` active`:``}`,style:{animationDelay:`${t*35}ms`},onClick:()=>s(e),children:[(0,S.jsx)(`div`,{className:`CM3-vcard-accent`}),(0,S.jsxs)(`div`,{className:`CM3-vcard-top`,children:[(0,S.jsx)(`div`,{className:`CM3-vavatar`,style:{background:n.bg,color:n.color,borderColor:n.border},children:e.party_name.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{className:`CM3-vcard-info`,children:[(0,S.jsx)(`div`,{className:`CM3-vname`,children:e.party_name}),(0,S.jsxs)(`div`,{className:`CM3-vmeta`,children:[(0,S.jsx)(`span`,{className:`CM3-vmeta-dot`,style:{background:r.color}}),r.label,e.days_overdue>0&&(0,S.jsxs)(`span`,{style:{color:`#D93B55`},children:[`· `,e.days_overdue,`d overdue`]})]}),i&&(0,S.jsxs)(`div`,{className:`CM3-vclient`,children:[(0,S.jsxs)(`svg`,{width:9,height:9,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:[(0,S.jsx)(`path`,{d:`M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2`}),(0,S.jsx)(`circle`,{cx:`12`,cy:`7`,r:`4`})]}),i]})]}),(0,S.jsx)(`div`,{className:`CM3-vbal-new${e.balance>0?` red`:` grey`}`,children:O(e.balance)})]}),(0,S.jsxs)(`div`,{className:`CM3-vcard-foot`,children:[(0,S.jsx)(`div`,{className:`CM3-vcard-bar-wrap`,children:(0,S.jsx)(`div`,{className:`CM3-vcard-bar-fill`,style:{width:`${c}%`}})}),(0,S.jsxs)(`span`,{style:{fontFamily:`var(--font-mono)`,fontSize:8,color:`var(--text-4)`,flexShrink:0},children:[Math.round(c),`% repaid`]})]})]},e.id)}),W.vendors.length>0&&(0,S.jsx)(v,{page:J,totalPages:ae,onPageChange:K,total:W.vendors.length,perPage:q,onPerPageChange:e=>{ie(e),K(1)},itemLabel:`ledgers`})]}):ne.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,style:{padding:`32px 16px`},children:[(0,S.jsx)(`div`,{className:`CM3-empty-icon`,children:(0,S.jsx)(F,{n:`inbox`,sz:32,c:`var(--text-4)`})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No categories found`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Try a different filter or add a ledger`})]}):ne.map((e,t)=>{let n=e.vendors.reduce((e,t)=>e+(t.balance||0),0);return(0,S.jsxs)(`div`,{className:`CM3-catcard`,style:{animationDelay:`${t*35}ms`},onClick:()=>{V({id:e.id,name:e.name}),s(null)},children:[(0,S.jsx)(`div`,{className:`CM3-vcard-accent`}),(0,S.jsx)(`div`,{className:`CM3-catcard-icon`,children:(0,S.jsx)(F,{n:`layers`,sz:16,c:`var(--ember,#2563EB)`})}),(0,S.jsxs)(`div`,{className:`CM3-catcard-info`,children:[(0,S.jsx)(`div`,{className:`CM3-catcard-name`,children:e.name}),(0,S.jsxs)(`div`,{className:`CM3-catcard-sub`,children:[e.vendors.length,` `,e.vendors.length===1?`ledger`:`ledgers`,n>0?` · ${O(n)} due`:``]})]}),(0,S.jsx)(`svg`,{className:`CM3-catcard-chev`,width:14,height:14,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,children:(0,S.jsx)(`path`,{d:`m9 18 6-6-6-6`})})]},e.id??e.name)})})]}),(0,S.jsx)(`div`,{className:`CM3-main`,children:o?(0,S.jsx)(G,{vendor:o,categories:y,subCategories:w,bioData:A,onReload:()=>U(!0),onVendorDeleted:()=>{s(null),U(!0)}},o.id):B&&W&&Y?(0,S.jsxs)(`div`,{className:`CM3-catsum`,children:[(0,S.jsxs)(`div`,{className:`CM3-catsum-hdr`,children:[(0,S.jsx)(`div`,{className:`CM3-catsum-icon`,children:(0,S.jsx)(F,{n:`layers`,sz:20,c:`var(--ember,#2563EB)`})}),(0,S.jsxs)(`div`,{style:{flex:1},children:[(0,S.jsx)(`div`,{className:`CM3-catsum-eyebrow`,children:`Account Head Overview`}),(0,S.jsx)(`div`,{className:`CM3-catsum-title`,children:B.name}),(0,S.jsxs)(`div`,{className:`CM3-catsum-sub`,children:[W.vendors.length,` linked ledger`,W.vendors.length===1?``:`s`]})]}),B.id!=null&&(0,S.jsxs)(`button`,{className:`CM3-add-btn`,onClick:()=>{z(B.id),I(!0)},children:[(0,S.jsxs)(`svg`,{width:13,height:13,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,strokeLinecap:`round`,children:[(0,S.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,S.jsx)(`line`,{x1:`12`,y1:`8`,x2:`12`,y2:`16`}),(0,S.jsx)(`line`,{x1:`8`,y1:`12`,x2:`16`,y2:`12`})]}),`Open Ledger Account`]})]}),(0,S.jsxs)(`div`,{className:`CM3-catsum-stats`,children:[(0,S.jsxs)(`div`,{className:`CM3-catsum-stat`,children:[(0,S.jsxs)(`div`,{className:`CM3-catsum-stat-lbl`,children:[(0,S.jsx)(F,{n:`down`,sz:9,c:T.mid}),`Total Credited`]}),(0,S.jsx)(`div`,{className:`CM3-catsum-stat-val credit-color`,children:O(Y.credited)})]}),(0,S.jsxs)(`div`,{className:`CM3-catsum-stat`,children:[(0,S.jsxs)(`div`,{className:`CM3-catsum-stat-lbl`,children:[(0,S.jsx)(F,{n:`up`,sz:9,c:E.primary}),`Total Repaid`]}),(0,S.jsx)(`div`,{className:`CM3-catsum-stat-val payment-color`,children:O(Y.repaid)})]}),(0,S.jsxs)(`div`,{className:`CM3-catsum-stat`,children:[(0,S.jsxs)(`div`,{className:`CM3-catsum-stat-lbl`,children:[(0,S.jsx)(F,{n:`scale`,sz:9,c:`#C47E0A`}),`Outstanding`]}),(0,S.jsx)(`div`,{className:`CM3-catsum-stat-val balance-color`,children:O(Y.outstanding)})]})]}),(0,S.jsx)(`div`,{className:`CM3-catsum-listhdr`,children:`Linked Ledgers`}),(0,S.jsx)(`div`,{className:`CM3-catsum-list`,children:W.vendors.length===0?(0,S.jsxs)(`div`,{className:`CM3-empty`,style:{padding:`32px 16px`},children:[(0,S.jsx)(`div`,{className:`CM3-empty-icon`,children:(0,S.jsx)(F,{n:`inbox`,sz:32,c:`var(--text-4)`})}),(0,S.jsx)(`div`,{className:`CM3-empty-title`,children:`No ledgers found`}),(0,S.jsx)(`div`,{className:`CM3-empty-sub`,children:`Add a ledger under this category to get started`})]}):W.vendors.map(e=>{let t=M(e.party_name),n=C[e.status];return(0,S.jsxs)(`div`,{className:`CM3-catsum-row`,onClick:()=>s(e),children:[(0,S.jsx)(`div`,{className:`CM3-vavatar`,style:{background:t.bg,color:t.color,borderColor:t.border,width:32,height:32,fontSize:9.5},children:e.party_name.slice(0,2).toUpperCase()}),(0,S.jsxs)(`div`,{className:`CM3-catsum-row-info`,children:[(0,S.jsx)(`div`,{className:`CM3-catsum-row-name`,children:e.party_name}),(0,S.jsxs)(`div`,{className:`CM3-catsum-row-meta`,children:[(0,S.jsx)(`span`,{className:`CM3-dot`,style:{background:n.color}}),n.label,e.days_overdue>0&&` · ${e.days_overdue}d overdue`]})]}),(0,S.jsxs)(`div`,{className:`CM3-catsum-row-amt`,children:[(0,S.jsx)(`span`,{className:`CM3-catsum-row-bal`,children:O(e.balance)}),(0,S.jsx)(`span`,{className:`CM3-catsum-row-bal-lbl`,children:`Outstanding`})]}),(0,S.jsx)(`svg`,{width:14,height:14,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2.5,style:{color:`var(--text-4)`,flexShrink:0},children:(0,S.jsx)(`path`,{d:`m9 18 6-6-6-6`})})]},e.id)})})]}):(0,S.jsxs)(`div`,{className:`CM3-welcome`,children:[(0,S.jsx)(`div`,{className:`CM3-welcome-icon`,children:(0,S.jsx)(F,{n:`wallet`,sz:38,c:`#C47E0A`})}),(0,S.jsx)(`div`,{className:`CM3-welcome-title`,children:`Accounts Payable`}),(0,S.jsx)(`div`,{className:`CM3-welcome-sub`,children:`Select a vendor from the sidebar to view their payable ledger, or add a new vendor to get started.`}),(0,S.jsxs)(`button`,{className:`CM3-add-btn`,style:{marginTop:8},onClick:()=>{z(null),I(!0)},children:[(0,S.jsx)(F,{n:`plus`,sz:14,c:`#fff`}),` Open Ledger Account`]})]})})]}),P&&(0,S.jsx)(R,{categories:y,subCategories:w,bioData:A,vendors:t,presetCategoryId:L,onClose:()=>{I(!1),z(null)},onSaved:()=>{I(!1),z(null),U(!0)}})]})}export{K as default};