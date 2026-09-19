import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ERP_CSS } from './ERPTheme';
import { CalendarDD } from '../components/CalendarDD';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import PageOpenIntro from '../components/PageOpenIntro';

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
interface Client {
  id: number; name: string; id_number: string; notes?: string;
  total_budget: number; total_collected: number;
  total_balance: number; total_additional: number;
  project_count: number; created_at: string;
}

interface Project {
  id: number; client_id: number; project_name: string;
  project_type: string; type_label: string; start_date: string;
  total_budget: number; total_collected: number;
  total_gst: number; balance: number;
  collected_pct: number; balance_pct: number;
  next_due_date?: string; description?: string;
  type_notes?: string; status: string; status_label: string;
  created_at: string; payments?: Payment[];
}

interface Payment {
  id: number; project_id: number; payment_date: string;
  amount: number; gst_amount: number; total_amount: number;
  payment_mode: string; mode_label: string;
  reference_number?: string; notes?: string;
  next_due_date?: string; created_at: string;
}

interface BudgetHistory {
  id: number; project_id: number; extra_amount: number;
  reason?: string; date_added: string; created_at: string;
  added_by?: string;
}

interface Summary {
  total_clients: number; total_projects: number;
  total_budget: number; total_collected: number;
  total_balance: number; collected_pct: number;
}

interface BioRecord {
  id: number; name: string; id_details: string;
  sub_names?: string[];
  type?: string; category?: string;
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d: string) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };
const getDaysUntilDue = (dateStr: string) => { const today = new Date(); today.setHours(0, 0, 0, 0); const due = new Date(dateStr); due.setHours(0, 0, 0, 0); return Math.ceil((due.getTime() - today.getTime()) / 86400000); };
const modeEmoji: Record<string, string> = { cash: '💰', upi: '📲', cheque: '📄', bank_transfer: '🏦', other: '💳' };
const modeClass = (m: string) => m === 'bank_transfer' ? 'mode-bank_transfer' : `mode-${m}`;
const EXPENSE_KW = ['expense', 'expenditure', 'cost', 'vendor', 'supplier', 'payable', 'payment_out', 'purchase'];
const isIncomeBio = (r: BioRecord) => !EXPENSE_KW.some(k => `${r.type || ''} ${r.category || ''}`.toLowerCase().includes(k));
const filterIncomeBio = (recs: BioRecord[]) => recs.filter(isIncomeBio);
const filterAvailableBio = (recs: BioRecord[], existing: string[], exceptName?: string) =>
  filterIncomeBio(recs).filter(r => {
    const n = r.name.trim().toLowerCase();
    if (exceptName && n === exceptName.trim().toLowerCase()) return true;
    return !existing.some(e => e.trim().toLowerCase() === n);
  });
const findBioByName = (recs: BioRecord[], name: string) =>
  recs.find(r => r.name.trim().toLowerCase() === name.trim().toLowerCase());
const getSubNames = (rec?: BioRecord | null): string[] => {
  if (!rec?.sub_names) return [];
  return Array.isArray(rec.sub_names) ? rec.sub_names.filter(Boolean) : [];
};
const TYPE_OPTS = [{ value: 'construction', label: 'Construction' }, { value: 'interior', label: 'Interior' }, { value: 'architecture', label: 'Architecture' }, { value: 'drawing', label: 'Drawing' }, { value: 'pmc', label: 'PMC' }];
const STATUS_OPTS = [{ value: 'active', label: 'Active' }, { value: 'on_hold', label: 'On Hold' }, { value: 'completed', label: 'Completed' }];
const MODE_OPTS = [{ value: 'cash', label: 'Cash' }, { value: 'cheque', label: 'Cheque' }, { value: 'upi', label: 'UPI' }, { value: 'neft', label: 'NEFT' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'other', label: 'Other' }];

/* ═══════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const CSS = `
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
  --pu:  #C2410C; --pu-t: rgba(194,65,12,.07); --pu-r: rgba(194,65,12,.22);
  --co:  var(--info); --co-t: var(--info-bg);  --co-r: var(--info-bd);
  /* Collect Payment / Add Budget / wizard accents — all Project-theme
     orange now (three darker-to-brighter shades kept only so the three
     figures — e.g. Budget vs Collected vs GST — stay visually tellable
     apart), replacing the old teal/amber/purple trio. */
  --jade:  #C2410C; --jade2: #DB5B1F; --jade3: #F0834D;
  --jade-t: rgba(194,65,12,.08); --jade-g: rgba(194,65,12,.18); --jade-r: rgba(194,65,12,.26);
  --gold:  #C2410C; --gold2: #DB5B1F; --gold3: #FBC9A8;
  --gold-t: rgba(194,65,12,.08); --gold-g: rgba(194,65,12,.18); --gold-r: rgba(194,65,12,.26);
  --iris:  #9A3412; --iris2: #9A3412;
  --iris-t: rgba(154,52,18,.08); --iris-r: rgba(154,52,18,.24);
  --cobalt: #9A3412; --cobalt2: #C2410C;
  --cobalt-t: rgba(154,52,18,.08); --cobalt-r: rgba(154,52,18,.24);
  --crimson: #9A3412; --crimson2: #DB5B1F;
  --crimson-t: rgba(154,52,18,.08); --crimson-r: rgba(154,52,18,.24);
  --emerald: #A6491D;
  --emerald-t: rgba(166,73,29,.08); --emerald-r: rgba(166,73,29,.26);
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
@keyframes CP-glow      { 0%,100%{box-shadow:0 0 0 0 rgba(219,91,31,.25)} 50%{box-shadow:0 0 0 6px rgba(219,91,31,.08)} }
@keyframes CP-scanLine  { 0%{left:-60%;opacity:0} 20%{opacity:1} 80%{opacity:.7} 100%{left:120%;opacity:0} }
@keyframes CP-pulseRing { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.7);opacity:0} }
@keyframes CP-numTick   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes CP-detailIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
@keyframes CP-badgePop  { 0%{transform:scale(.82)} 60%{transform:scale(1.07)} 100%{transform:scale(1)} }
@keyframes CP-rowIn     { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
@keyframes CP-txIn      { from{opacity:0;transform:translateX(14px) scale(.97)} to{opacity:1;transform:none} }
@keyframes CP-bdIn      { from{opacity:0} to{opacity:1} }
@keyframes CP-pulseJade { 0%,100%{box-shadow:0 0 0 0 rgba(194,65,12,.5)} 60%{box-shadow:0 0 0 7px rgba(194,65,12,0)} }

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
  0%, 100% { box-shadow: 0 8px 28px rgba(154,52,18,0.28), 0 0 0 0 rgba(154,52,18,0.35); }
  50%      { box-shadow: 0 8px 28px rgba(154,52,18,0.28), 0 0 0 10px rgba(154,52,18,0); }
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
  background: linear-gradient(160deg, #F5F3EF 0%, #FBC9A8 55%, #FBC9A8 100%);
  border: 2px solid #FBC9A8;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
}
@media(max-width:640px){ .CP-closed-celebrate { border-radius: 18px 18px 0 0; } }
.CP-closed-ring {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  border: 2.5px solid rgba(154,52,18,0.18);
  animation: cp-ring-pulse 1s ease-out 0.1s both;
}
.CP-closed-ring2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  border: 1.5px solid rgba(154,52,18,0.09);
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
  background: linear-gradient(135deg, #C2410C, #DB5B1F);
  border: 3px solid rgba(154,52,18,0.18);
  box-shadow: 0 8px 28px rgba(154,52,18,0.28);
  display: flex; align-items: center; justify-content: center;
  animation: cp-check-glow 1.4s ease-in-out 0.7s infinite;
}
.CP-closed-txt {
  font-family: var(--ff-m,'JetBrains Mono',monospace);
  font-size: 19.5px; font-weight: 900; color: #C2410C;
  letter-spacing: 4px; text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(154,52,18,0.10);
}
.CP-closed-sub { font-family: var(--ff-b,'Space Grotesk',sans-serif); font-size: 11.5px; color: #9A3412; margin-top: -8px; font-weight: 700; }
.CP-closed-amt-badge {
  position: relative; padding: 8px 20px; background: #faf9f7;
  border: 1.5px solid #FBC9A8; box-shadow: 0 2px 12px rgba(154,52,18,0.10);
  border-radius: 100px; font-family: var(--ff-m,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 800; color: #C2410C; margin-top: 4px; overflow: hidden;
}
.CP-closed-amt-badge::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(219,91,31,0.35), transparent);
  animation: cp-badge-shimmer 1.6s ease-in-out 0.9s infinite;
}
.CP-confetti-piece { position: absolute; border-radius: 3px; animation: cp-confetti-fly 1.1s ease-out both; }

.CP-root { font-family:var(--ff-b); background:var(--surface); min-height:100%; color:var(--t1); position:relative; -webkit-font-smoothing:antialiased; }
.CP-root *, .CP-root *::before, .CP-root *::after { box-sizing:border-box; }
.CP-root::before { content:''; position:fixed; inset:0; background-image:radial-gradient(circle,rgba(107,93,72,0.07) 1px,transparent 1px); background-size:28px 28px; pointer-events:none; z-index:0; }

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
.CP-btn-primary { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 22px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; border:none; background:linear-gradient(135deg,#DB5B1F 0%,#C2410C 100%); color:#faf9f7; box-shadow:var(--sh-or); transition:transform .2s,box-shadow .2s,background .2s; }
.CP-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:var(--sh-or2); background:linear-gradient(135deg,#F0834D 0%,#C2410C 100%); }
.CP-btn-primary:disabled { opacity:.45; cursor:not-allowed; }
.CP-btn-add-compact { display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:999px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; border:none; background:linear-gradient(135deg,#DB5B1F 0%,#C2410C 100%); color:#faf9f7; box-shadow:0 4px 14px rgba(154,52,18,.32); transition:transform .18s ease,box-shadow .18s ease,background .18s ease; }
.CP-btn-add-compact:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 7px 20px rgba(154,52,18,.45); background:linear-gradient(135deg,#F0834D 0%,#C2410C 100%); }
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
  white-space:nowrap; cursor:pointer; border:none; color:#faf9f7;
  background:linear-gradient(135deg,#DB5B1F 0%,#C2410C 100%);
  box-shadow:0 4px 14px rgba(154,52,18,.32), 0 2px 6px rgba(154,52,18,.2);
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
.CP-btn-header-add:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 8px 20px rgba(154,52,18,.42), 0 3px 8px rgba(154,52,18,.28); }
.CP-btn-header-add:hover::after { left:120%; }
.CP-btn-header-add:active { transform:translateY(0) scale(.96); }
@media(max-width:760px){ .ERP-hdr-right{ padding-top:0; } }
.CP-btn-outline { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 18px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; background:transparent; border:1.5px solid var(--or); color:var(--ember); transition:all .2s; }
.CP-btn-outline:hover { background:linear-gradient(135deg,#DB5B1F,#C2410C); border-color:transparent; color:#faf9f7; box-shadow:var(--sh-or); transform:translateY(-2px); }
.CP-btn-gold { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; white-space:nowrap; cursor:pointer; background:var(--gd-t); border:1.5px solid var(--gd-r); color:var(--gd); transition:all .2s; }
.CP-btn-gold:hover { background:var(--gd); color:#faf9f7; border-color:var(--gd); transform:translateY(-2px); }
.CP-btn-ghost { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 16px; border-radius:var(--r2); font-family:var(--ff-m); font-size: 9px; font-weight: 800; letter-spacing:1.6px; text-transform:uppercase; white-space:nowrap; cursor:pointer; background:var(--w); border:1.5px solid var(--bd); color:var(--t3); transition:all .18s; box-shadow:var(--sh-sm); }
.CP-btn-ghost:hover { border-color:var(--or-r); color:var(--or); background:var(--or-t); transform:translateY(-1px); }
.CP-act { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:var(--r-sm); border:1px solid; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:.8px; text-transform:uppercase; cursor:pointer; transition:all .15s; white-space:nowrap; }
.CP-act-add  { background:var(--or-t); color:var(--or); border-color:var(--or-r); }
.CP-act-add:hover  { background:var(--or); color:#faf9f7; transform:translateY(-1px); }
.CP-act-edit { background:var(--or-t); color:var(--or); border-color:var(--or-r); }
.CP-act-edit:hover { background:var(--or); color:#faf9f7; transform:translateY(-1px); }
.CP-act-del  { background:var(--rd-t); color:var(--rd); border-color:var(--rd-r); }
.CP-act-del:hover  { background:var(--rd); color:#faf9f7; transform:translateY(-1px); }
.CP-act-jade { background:var(--jade-t); color:var(--jade); border-color:var(--jade-r); }
.CP-act-jade:hover { background:var(--jade); color:#faf9f7; transform:translateY(-1px); }

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
  border: 1.5px solid var(--border,#E8E2D8);
  border-radius: 16px;
  overflow: hidden;
  background: var(--white,#faf9f7);
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  margin: 0 40px 32px;
  animation: erp-slide-up 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both;
}
@media(max-width:1100px){ .CP-layout-body{ grid-template-columns:260px 1fr; margin:0 20px 24px; } }
@media(max-width:860px){  .CP-layout-body{ grid-template-columns:1fr; margin:0 14px 18px; } }

/* ── SIDEBAR (left) ── */
.CP-sb {
  border-right: 1.5px solid var(--border,#E8E2D8);
  display: flex; flex-direction: column;
  background: #F5F3EF; overflow: hidden; height: 100%;
}

/* Sidebar hero header */
.CP-sb-hero {
  padding: 14px 14px 10px;
  background: linear-gradient(135deg,#FBC9A8 0%,#faf9f7 100%);
  border-bottom: 1px solid var(--border,#E8E2D8);
  position: relative; overflow: hidden;
}
.CP-sb-hero::before {
  content:''; position:absolute; right:-20px; top:-20px;
  width:80px; height:80px; border-radius:50%;
  background: radial-gradient(circle, rgba(154,52,18,0.07), transparent 70%);
  pointer-events:none;
}
.CP-sb-eyebrow {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--ember,#C2410C); display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
}
.CP-sb-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--ember,#C2410C);
  animation: sb-dot-pulse 2s ease-in-out infinite;
}
@keyframes sb-dot-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.45; transform:scale(0.65); }
}
.CP-sb-title {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 13px; font-weight: 800; color: var(--text-1,#231C14);
  margin-bottom: 8px;
}

/* Search */
.CP-sb-search {
  display: flex; align-items: center; gap: 7px; padding: 8px 11px;
  background: #faf9f7; border: 1.5px solid var(--border,#E8E2D8);
  border-radius: 10px; transition: border-color 0.15s, box-shadow 0.15s;
}
.CP-sb-search:focus-within {
  border-color: var(--ember,#C2410C);
  box-shadow: 0 0 0 3px rgba(154,52,18,0.08);
}
.CP-sb-search input {
  flex: 1; border: none; outline: none; font-size: 9.5px;
  color: var(--text-1); background: transparent;
  font-family: var(--font-mono);
}
.CP-sb-search input::placeholder { color: var(--text-4,#8C7C63); }

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
  color: var(--ember,#C2410C); background: #FBC9A8;
  padding: 1px 7px; border-radius: 100px; border: 1px solid #FBC9A8;
}

/* Client card list scroll */
.CP-cli-list { flex: 1; overflow-y: auto; padding: 4px 0 8px; }
.CP-cli-list::-webkit-scrollbar { width: 4px; }
.CP-cli-list::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius: 2px; }

/* ── Client sidebar card (like CM3-vcard) ── */
.CP-clicard {
  margin: 4px 10px; border-radius: 12px;
  border: 1.5px solid var(--border,#E8E2D8);
  background: #faf9f7; cursor: pointer;
  transition: all 0.18s; position: relative; overflow: hidden;
  animation: vc-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes vc-in {
  from { opacity:0; transform:translateX(-10px); }
  to   { opacity:1; transform:translateX(0); }
}
.CP-clicard:hover {
  border-color: #FBC9A8;
  box-shadow: 0 4px 16px rgba(154,52,18,0.1);
  transform: translateX(2px);
}
.CP-clicard.active {
  border-color: var(--ember,#C2410C);
  background: #FBC9A8;
  box-shadow: 0 4px 20px rgba(154,52,18,0.15);
  transform: translateX(3px);
}
.CP-clicard-accent {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg,#C2410C,#DB5B1F);
  opacity: 0; transition: opacity 0.18s;
}
.CP-clicard:hover .CP-clicard-accent,
.CP-clicard.active .CP-clicard-accent { opacity: 1; }

.CP-clicard-top { display: flex; align-items: center; gap: 10px; padding: 10px 12px 7px; }

.CP-clicard-av {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 900;
  background: #FBC9A8; border: 1.5px solid #FBC9A8; color: #C2410C;
  transition: transform 0.2s, box-shadow 0.2s;
}
.CP-clicard:hover .CP-clicard-av { transform: scale(1.1) rotate(-3deg); box-shadow: 0 4px 12px rgba(154,52,18,0.18); }
.CP-clicard.active .CP-clicard-av { transform: scale(1.06); box-shadow: 0 4px 14px rgba(154,52,18,0.22); }

.CP-clicard-info { flex: 1; min-width: 0; }
.CP-clicard-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#231C14);
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
.CP-clicard-bar-wrap { flex: 1; height: 3px; border-radius: 100px; background: #F5F3EF; overflow: hidden; }
.CP-clicard-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg,#C2410C,#DB5B1F);
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
  background: rgba(154,52,18,0.07); color: #C2410C;
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
  50%     { box-shadow: 0 0 0 4px rgba(154,52,18,0.18), 0 4px 16px rgba(154,52,18,0.12); }
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
  background: linear-gradient(135deg,rgba(154,52,18,0.12),rgba(219,91,31,0.12));
  border: 1.5px dashed rgba(154,52,18,0.35);
  display: flex; align-items: center; justify-content: center;
  animation: CP-tap-pulse 1.8s ease-in-out infinite;
}
@keyframes CP-tap-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(154,52,18,0); }
  50%     { box-shadow: 0 0 0 6px rgba(154,52,18,0.12); }
}
.CP-sb-tap-label { font-family:var(--ff-m); font-size: 8px; letter-spacing:1.5px; text-transform:uppercase; color:var(--ember,#C2410C); }

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
  overflow-y: auto; background: var(--white,#faf9f7); height: 100%;
  display: flex; flex-direction: column;
}

/* Main panel header bar */
.CP-main-hdr {
  padding: 14px 18px 12px;
  background: linear-gradient(135deg,#FBC9A8 0%,#faf9f7 100%);
  border-bottom: 1px solid var(--border,#E8E2D8);
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 5;
}
.CP-main-hdr-left { display: flex; align-items: center; gap: 10px; }
.CP-main-hdr-icon {
  width: 32px; height: 32px; border-radius: 9px;
  background: #FBC9A8; border: 1.5px solid #FBC9A8;
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
.CP-main-content { flex: 1; padding: 12px; background: var(--surface,#F5F3EF); overflow-y: auto; }

/* Empty state (no client selected) */
.CP-main-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; min-height: 380px; color: var(--text-4); text-align: center; padding: 40px;
}
.CP-main-empty-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: #FBC9A8; border: 1.5px solid #FBC9A8;
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
  border: 1.5px solid var(--border,#E8E2D8);
  background: #faf9f7; margin-bottom: 8px;
  transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
  animation: bc-in 0.32s cubic-bezier(0.4,0,0.2,1) both;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
@keyframes bc-in {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
.CP-pjcard:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.12); transform: translateY(-2px); border-color: #FBC9A8; }

/* Left accent column */
.CP-pjcard-left {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 12px 6px; gap: 6px;
  border-right: 1px solid var(--border,#E8E2D8);
  background: linear-gradient(160deg,#FBC9A8 0%,#F5F3EF 100%);
  position: relative; overflow: hidden;
}
.CP-pjcard-left::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
  background: linear-gradient(180deg,#C2410C,#DB5B1F);
  box-shadow: 2px 0 8px rgba(154,52,18,0.2);
}
.CP-pjcard-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 17.5px; font-weight: 900; color: var(--ember,#C2410C);
  line-height: 1; letter-spacing: -1px;
}
.CP-pjcard-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(154,52,18,0.08); border: 1.5px solid rgba(154,52,18,0.2);
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
.CP-pjcard-chip-type { background:#FBC9A8; color:#C2410C; border-color:#FBC9A8; }
.CP-pjcard-chip-status-active    { background:#f0fdf4; color:#1E9C6A; border-color:#6ee7b7; }
.CP-pjcard-chip-status-on_hold   { background:#FDE0CB; color:#9A3412; border-color:#FDE0CB; }
.CP-pjcard-chip-status-completed { background:#FDE0CB; color:#DB5B1F; border-color:#FBC9A8; }
.CP-pjcard-date {
  font-family: var(--font-mono); font-size: 8px; color: var(--text-4);
  display: flex; align-items: center; gap: 4px;
}
.CP-pjcard-prog-row { display:flex; align-items:center; gap:7px; margin-top:2px; }
.CP-pjcard-prog-pct { font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--ember,#C2410C); flex-shrink:0; }
.CP-pjcard-mini-bar { flex:1; height:5px; border-radius:100px; background:#F5F3EF; overflow:hidden; }
.CP-pjcard-mini-fill {
  height:100%; border-radius:100px;
  background:linear-gradient(90deg,#C2410C,#DB5B1F);
  transition:width 1.2s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 1px 3px rgba(154,52,18,0.3);
}
/* Right amount */
.CP-pjcard-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 11px 14px; gap: 5px; flex-shrink: 0;
  border-left: 1px solid var(--border,#E8E2D8);
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
.CP-pjcard-status.open  { background:#FBC9A8; color:#C2410C; border-color:#FBC9A8; }
.CP-pjcard-status.done  { background:#f0fdf4; color:#1E9C6A; border-color:#6ee7b7; }
.CP-pjcard-bal-row { display:flex; gap:5px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
.CP-pjcard-bal-lbl { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); }
/* Actions column — wide with labeled buttons */
.CP-pjcard-acts {
  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
  padding: 8px 7px; gap: 5px; border-left: 1px solid var(--border,#E8E2D8);
  background: linear-gradient(180deg,#F5F3EF,#F5F3EF);
}
.CP-pjcard-act {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  padding: 6px 8px; border-radius: 7px; border: 1.5px solid;
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.CP-pjcard-act.pay { background:#f0fdf4; border-color:#6ee7b7; color:#1E9C6A; }
.CP-pjcard-act.pay:hover { background:#1E9C6A; border-color:#1E9C6A; color:#faf9f7; box-shadow:0 3px 12px rgba(5,150,105,0.3); transform:translateY(-1px); }
.CP-pjcard-act.bgt { background:#FBC9A8; border-color:#FBC9A8; color:#C2410C; }
.CP-pjcard-act.bgt:hover { background:#C2410C; border-color:#C2410C; color:#faf9f7; box-shadow:0 3px 12px rgba(154,52,18,0.3); transform:translateY(-1px); }
.CP-pjcard-act.edt { background:rgba(219,91,31,0.07); border-color:rgba(219,91,31,0.3); color:#DB5B1F; }
.CP-pjcard-act.edt:hover { background:#DB5B1F; border-color:#DB5B1F; color:#faf9f7; box-shadow:0 3px 12px rgba(219,91,31,0.3); transform:translateY(-1px); }
.CP-pjcard-act.del { background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.25); color:#D93B55; }
.CP-pjcard-act.del:hover { background:#D93B55; border-color:#D93B55; color:#faf9f7; box-shadow:0 3px 12px rgba(239,68,68,0.3); transform:translateY(-1px); }
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
  color: var(--ember,#C2410C); background: #FBC9A8;
  padding: 2px 8px; border-radius: 100px; border: 1px solid #FBC9A8;
}
/* Client summary mini-stats inside right panel */
.CP-main-stats {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 10px;
  padding: 14px 14px 12px; background: #faf9f7;
  border-bottom: 1.5px solid var(--border,#E8E2D8);
}
@media(max-width:900px){ .CP-main-stats{ grid-template-columns:repeat(2,1fr); } }
.CP-main-stat {
  padding: 12px 14px 13px; border-radius: 12px;
  background: var(--surface,#F5F3EF);
  border: 1.5px solid var(--border,#E8E2D8);
  position: relative; overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  animation: CP-stagger .35s cubic-bezier(.22,1,.36,1) both;
}
.CP-main-stat::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: var(--stat-ac, linear-gradient(90deg,#C2410C,#DB5B1F));
  border-radius:12px 12px 0 0; transition: height .18s;
}
.CP-main-stat:hover { transform:translateY(-3px); box-shadow:0 6px 20px rgba(0,0,0,0.1); border-color:#FBC9A8; }
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
.CP-skel { background:linear-gradient(90deg,var(--off-white,#F5F3EF) 25%,var(--surface-3,#E8E2D8) 50%,var(--off-white,#F5F3EF) 75%); background-size:700px 100%; animation:CP-shimmer 1.4s infinite linear; border-radius:8px; }
/* EMPTY / FOOTER */
.CP-empty { display:flex; flex-direction:column; align-items:center; padding:60px 24px; text-align:center; }
.CP-empty-ico { width:54px;height:54px;border-radius:50%;background:#FBC9A8;border:1.5px solid #FBC9A8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;opacity:.7; }
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
.CP-detail-prog { background:var(--w,#faf9f7); border:1.5px solid rgba(154,52,18,0.18); border-radius:var(--r2); padding:14px 16px; margin-bottom:16px; }
.CP-detail-prog-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.CP-detail-prog-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 800; color:var(--t4); text-transform:uppercase; letter-spacing:1.5px; }
.CP-detail-prog-pct { font-family:var(--ff-m); font-size: 16px; font-weight: 800; color:var(--ember,#C2410C); letter-spacing:-0.5px; }
.CP-detail-prog-bar { height:7px; background:rgba(154,52,18,0.1); border-radius:99px; overflow:hidden; }
.CP-detail-prog-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#9A3412,#9A3412); animation:CP-barFill .9s .1s cubic-bezier(.34,1.2,.64,1) both; min-width:3px; }
.CP-detail-prog-foot { display:flex; gap:0; margin-top:10px; border-top:1px solid var(--bd); padding-top:10px; }
.CP-detail-prog-kpi { display:flex; flex-direction:column; gap:2px; flex:1; }
.CP-detail-prog-kpi:not(:last-child) { border-right:1px solid var(--bd); padding-right:12px; margin-right:12px; }
.CP-detail-prog-kpi-lbl { font-family:var(--ff-m); font-size: 8px; font-weight: 700; color:var(--t4); text-transform:uppercase; letter-spacing:1px; }
.CP-detail-prog-kpi-val { font-family:var(--ff-m); font-size: 9.5px; font-weight: 800; color:var(--t1); }
.CP-detail-due { display:flex; align-items:center; gap:8px; padding:9px 14px; margin-bottom:16px; background:var(--gd-t); border:1px solid var(--gd-r); border-radius:var(--r2); }
.CP-detail-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:4px; }
/* TRANSACTION FEED — professional ERP ledger style */
.CP-tx-feed { border-radius:var(--r2); overflow:hidden; border:1px solid var(--bd); background:var(--w); margin-bottom:12px; }
.CP-tx-scroll { max-height:320px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(154,52,18,0.25) transparent; }
.CP-tx-scroll::-webkit-scrollbar { width:5px; }
.CP-tx-scroll::-webkit-scrollbar-thumb { background:rgba(154,52,18,0.22); border-radius:99px; }
.CP-tx-scroll::-webkit-scrollbar-track { background:transparent; }
.CP-tx-feed-hdr { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--off-white,#F5F3EF); border-bottom:1.5px solid var(--bd); }
.CP-tx-feed-title { display:flex; align-items:center; gap:7px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.8px; text-transform:uppercase; color:var(--ember,#C2410C); }
.CP-tx-count-badge { background:rgba(154,52,18,0.1); color:var(--ember,#C2410C); font-family:var(--ff-m); font-size: 8px; font-weight: 800; padding:2px 9px; border-radius:20px; border:1px solid rgba(154,52,18,0.2); }
/* ERP ledger row */
.CP-tx-item { display:grid; grid-template-columns:36px 1fr auto; align-items:center; gap:12px; padding:11px 14px; border-bottom:1px solid var(--bd); transition:background .12s; cursor:pointer; position:relative; animation:CP-txIn .32s cubic-bezier(.22,1,.36,1) both; }
.CP-tx-item:hover { background:rgba(154,52,18,0.03); }
.CP-tx-item:last-child { border-bottom:none; }
.CP-tx-item::before { content:''; position:absolute; left:0; top:6px; bottom:6px; width:2.5px; background:var(--ember,#C2410C); border-radius:0 2px 2px 0; opacity:0; transition:opacity .15s; }
.CP-tx-item:hover::before { opacity:1; }
/* Icon — neutral monochrome */
.CP-tx-icon-erp { width:34px; height:34px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(154,52,18,0.07); border:1px solid rgba(154,52,18,0.16); }
.CP-tx-body { min-width:0; }
.CP-tx-amount { font-family:var(--ff-m); font-size: 11px; font-weight: 800; color:var(--t1); line-height:1.2; font-variant-numeric:tabular-nums; white-space:nowrap; }
.CP-tx-meta { display:flex; align-items:center; gap:8px; margin-top:3px; flex-wrap:wrap; }
.CP-tx-date { font-family:var(--ff-m); font-size: 8px; color:var(--t4); display:flex; align-items:center; gap:3px; }
.CP-tx-mode-badge { display:inline-flex; align-items:center; font-family:var(--ff-m); font-size: 7.5px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase; padding:2px 8px; border-radius:20px; border:1px solid; white-space:nowrap; background:rgba(154,52,18,0.07); color:var(--ember,#C2410C); border-color:rgba(154,52,18,0.18); }
.CP-tx-ref { font-family:var(--ff-m); font-size: 8px; color:var(--t4); }
.CP-tx-right { text-align:right; flex-shrink:0; }
.CP-tx-total { font-family:var(--ff-m); font-size: 10.5px; color:var(--success,#1E9C6A); font-weight: 800; line-height:1.2; font-variant-numeric:tabular-nums; white-space:nowrap; }
.CP-tx-gst { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:2px; }
.CP-tx-view-more { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; background:var(--off-white,#F5F3EF); border-top:1px solid var(--bd); font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:1px; color:var(--ember,#C2410C); cursor:pointer; transition:all .18s; }
.CP-tx-view-more:hover { background:rgba(154,52,18,0.06); gap:14px; }
.CP-tx-empty { display:flex; flex-direction:column; align-items:center; padding:32px 24px; background:var(--off-white,#F5F3EF); text-align:center; }
.CP-tx-empty-icon { width:44px; height:44px; border-radius:50%; background:rgba(154,52,18,0.07); border:1.5px dashed rgba(154,52,18,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:11px; }
.CP-tx-empty-title { font-family:var(--ff-b); font-size: 11.5px; font-style:normal; text-transform:uppercase; font-weight: 800; letter-spacing:0.4px; color:var(--t3); margin-bottom:4px; }
.CP-tx-empty-sub   { font-family:var(--ff-m); font-size: 8px; color:var(--t4); letter-spacing:1px; text-transform:uppercase; }
/* ══ COLLECTION PROGRESS PANEL — warm ember theme, 2026 style ══ */
.CP-prog-panel {
  margin:0 14px 10px; border-radius:18px;
  border:1px solid var(--border,#E8E2D8); overflow:hidden;
  background:var(--white,#FAF9F7);
  box-shadow:0 1px 3px rgba(154,52,18,0.05), 0 12px 30px rgba(154,52,18,0.08);
  animation:bc-in 0.3s both;
}
.CP-prog-hdr {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:13px 16px;
  background:linear-gradient(120deg, var(--off-white,#F5F3EF) 0%, var(--surface,#F5F3EF) 55%, #FBEAD8 100%);
  border-bottom:1px solid rgba(194,65,12,0.14);
  position:relative; overflow:hidden;
}
.CP-prog-hdr::after {
  content:''; position:absolute; left:0; right:0; bottom:0; height:2px;
  background:linear-gradient(90deg,#C2410C,#C2410C,#F0834D,transparent);
}
.CP-prog-hdr-left {
  display:flex; align-items:center; gap:8px;
  font-family:var(--ff-m); font-size: 8px; font-weight: 800;
  letter-spacing:1.8px; text-transform:uppercase; color:#6B5D48;
}
.CP-prog-hdr-icon {
  width:24px; height:24px; border-radius:8px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,rgba(194,65,12,0.16),rgba(194,65,12,0.06));
  border:1px solid rgba(194,65,12,0.28);
  box-shadow:0 2px 6px rgba(194,65,12,0.12);
}
.CP-prog-hdr-badge {
  font-family:var(--ff-m); font-size: 8px; font-weight: 800;
  letter-spacing:1px; text-transform:uppercase;
  padding:5px 11px; border-radius:99px; white-space:nowrap;
  border:1px solid transparent;
}
.CP-prog-hdr-badge.good { background:rgba(194,65,12,0.12); color:#C2410C; border-color:rgba(194,65,12,0.28); }
.CP-prog-hdr-badge.mid  { background:rgba(154,52,18,0.14); color:#DB5B1F; border-color:rgba(154,52,18,0.28); }
.CP-prog-hdr-badge.low  { background:rgba(220,38,38,0.12); color:#b91c1c; border-color:rgba(220,38,38,0.24); }
.CP-prog-body {
  display:flex; align-items:center; gap:22px; padding:20px 18px;
  background:radial-gradient(circle at 0% 0%, rgba(194,65,12,0.045), transparent 55%);
}
.CP-prog-ring-wrap {
  flex-shrink:0; position:relative; display:flex; align-items:center; justify-content:center;
}
.CP-prog-ring-wrap::before {
  content:''; position:absolute; inset:-8px; border-radius:50%;
  background:radial-gradient(circle, rgba(194,65,12,0.12) 0%, transparent 72%);
}
.CP-prog-svg {
  width:136px; height:136px; display:block; position:relative;
  filter:drop-shadow(0 6px 16px rgba(194,65,12,0.24));
}
/* Right side — elevated KPI cards */
.CP-prog-stats { flex:1; display:flex; flex-direction:column; gap:9px; min-width:0; }
.CP-kpi-card {
  position:relative; overflow:hidden;
  background:linear-gradient(135deg,var(--white,#FAF9F7) 0%,var(--off-white,#F5F3EF) 100%);
  border:1px solid var(--border,#E8E2D8); border-radius:13px;
  padding:10px 13px 11px;
  box-shadow:0 1px 2px rgba(154,52,18,0.03);
  transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  animation:bc-in 0.35s both;
}
.CP-kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.CP-kpi-card.collected::before { background:linear-gradient(90deg,#C2410C,#C2410C,#F0834D); }
.CP-kpi-card.pending::before   { background:linear-gradient(90deg,#D93B55,#f87171); }
.CP-kpi-card.total::before     { background:linear-gradient(90deg,#9A3412,#DB5B1F); }
.CP-kpi-card:hover { transform:translateY(-2px); box-shadow:0 10px 22px rgba(154,52,18,0.1); border-color:rgba(194,65,12,0.3); }
.CP-kpi-top { display:flex; align-items:center; gap:7px; margin-bottom:7px; }
.CP-kpi-icon {
  width:21px; height:21px; border-radius:7px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.CP-kpi-icon.collected { background:rgba(194,65,12,0.13); }
.CP-kpi-icon.pending   { background:rgba(220,38,38,0.13); }
.CP-kpi-icon.total     { background:rgba(194,65,12,0.13); }
.CP-kpi-lbl { font-family:var(--ff-m); font-size: 8px; color:var(--t4); text-transform:uppercase; letter-spacing:1px; font-weight: 800; }
.CP-kpi-val { font-family:var(--ff-m); font-size: 14px; font-weight: 800; letter-spacing:-0.3px; margin-bottom:7px; font-variant-numeric:tabular-nums; }
/* Animated progress bar */
.CP-kpi-bar-track { height:5px; background:rgba(154,52,18,0.07); border-radius:100px; overflow:hidden; margin-bottom:5px; }
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
  background:rgba(154,52,18,0.04); border-bottom:1px solid var(--bd);
  font-family:var(--ff-m); font-size: 8px; font-weight: 800;
  letter-spacing:1.5px; text-transform:uppercase; color:#C2410C;
}
.CP-pay-block-badge {
  display:inline-flex; align-items:center; justify-content:center;
  background:#C2410C; color:#faf9f7; border-radius:100px;
  font-size: 7.5px; font-weight: 800; min-width:17px; height:17px;
  padding:0 5px; line-height:1; letter-spacing:0;
}
.CP-pay-list { }
.CP-pay-row {
  display:grid; grid-template-columns:minmax(64px,auto) 1fr minmax(78px,auto) auto;
  align-items:center; gap:6px; padding:6px 10px;
  border-bottom:1px solid var(--bd); background:#faf9f7;
  animation:bc-in 0.28s cubic-bezier(0.4,0,0.2,1) both;
  transition:background 0.12s;
}
.CP-pay-row:last-child { border-bottom:none; }
.CP-pay-row:hover { background:rgba(194,65,12,0.045); }
.CP-pay-mode {
  font-family:var(--ff-m); font-size: 7px; font-weight: 800;
  letter-spacing:0.6px; color:#C2410C;
  background:rgba(154,52,18,0.08); border:1px solid rgba(154,52,18,0.18);
  border-radius:5px; padding:2px 6px; white-space:nowrap; flex-shrink:0;
  justify-self:start;
}
/* Highlighted, centered amount */
.CP-pay-amt {
  font-family:var(--ff-m); font-size: 10px; font-weight: 900;
  color:#C2410C; text-align:center; justify-self:center;
  background:linear-gradient(135deg,rgba(194,65,12,0.1),rgba(194,65,12,0.04));
  border:1px solid rgba(194,65,12,0.22); border-radius:7px;
  padding:3px 10px; white-space:nowrap; letter-spacing:-0.2px;
}
/* Highlighted date pill */
.CP-pay-date {
  display:inline-flex; align-items:center; gap:3px; justify-self:end;
  font-family:var(--ff-m); font-size: 7.5px; font-weight: 800; color:#6B5D48;
  background:var(--surface,#F5F3EF); border:1px solid var(--border,#E8E2D8);
  border-radius:6px; padding:3px 7px; white-space:nowrap;
}
.CP-pay-more {
  width:100%; display:flex; align-items:center; justify-content:center; gap:5px;
  padding:7px 12px; text-align:center;
  font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:0.5px; text-transform:uppercase;
  color:#C2410C; cursor:pointer;
  background:rgba(194,65,12,0.045); border:none; border-top:1px solid var(--bd);
  transition:background .15s, color .15s;
}
.CP-pay-more:hover { background:rgba(194,65,12,0.1); color:#9A3412; }
.CP-pay-empty {
  padding:14px 12px; text-align:center;
  font-family:var(--ff-m); font-size: 9px; color:var(--t4); font-style:italic;
}
@media(max-width:420px){
  .CP-pay-row { grid-template-columns:auto 1fr auto auto; gap:4px; padding:6px 8px; }
  .CP-pay-amt { font-size: 9px; padding:2px 7px; }
}

/* ── BUDGET HISTORY ── */
.CP-bgt-hist { margin:0 14px 14px; border-radius:10px; border:1.5px solid rgba(194,65,12,0.25); background:linear-gradient(135deg,#F5F3EF,#faf9f7); overflow:hidden; animation:bc-in 0.35s both; }
.CP-bgt-hist-hdr { display:flex; align-items:center; gap:7px; padding:9px 14px 8px; background:rgba(194,65,12,0.07); border-bottom:1px solid rgba(194,65,12,0.15); font-family:var(--ff-m); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:#9A3412; }
.CP-bgt-hist-count { background:rgba(194,65,12,0.15); color:#9A3412; font-family:var(--ff-m); font-size: 8px; font-weight: 800; padding:1px 7px; border-radius:100px; border:1px solid rgba(194,65,12,0.3); margin-left:auto; }
.CP-bgt-hist-list { padding:8px 12px 10px; display:flex; flex-direction:column; gap:6px; }
.CP-bgt-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; background:#faf9f7; border:1px solid rgba(194,65,12,0.15); animation:bc-in 0.3s cubic-bezier(0.4,0,0.2,1) both; transition:box-shadow .2s, border-color .2s; }
.CP-bgt-item:hover { box-shadow:0 2px 10px rgba(194,65,12,0.1); border-color:rgba(194,65,12,0.3); }
.CP-bgt-item-icon { font-size: 14px; flex-shrink:0; }
.CP-bgt-item-body { flex:1; min-width:0; }
.CP-bgt-item-amt { font-family:var(--ff-m); font-size: 10.5px; font-weight: 800; color:#9A3412; }
.CP-bgt-item-reason { font-family:var(--ff-m); font-size: 8px; color:var(--t4); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.CP-bgt-item-date { display:flex; align-items:center; gap:4px; font-family:var(--ff-m); font-size: 8px; color:var(--t4); flex-shrink:0; }

/* ── DETAIL STAT ANIMATED ── */
.CP-detail-stat { animation:bc-in 0.3s cubic-bezier(0.4,0,0.2,1) both; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; background:#faf9f7; border:1px solid var(--bd); border-radius:10px; text-align:center; }
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
.CP-spinner    { display:inline-block; width:12px; height:12px; border:2px solid rgba(255,255,255,.3); border-top-color:#faf9f7; border-radius:50%; animation:CP-spin .65s linear infinite; }
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
.CP-modal-ttl  { font-family:var(--ff-b); font-size: 15px; font-style:normal; text-transform:uppercase; font-weight: 800; letter-spacing:0.5px; color:#C2410C; line-height:1.1; }
.CP-modal-sub  { font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:#C2410C; margin-top:3px; }
.CP-modal-ttl-ico { width:38px; height:38px; border-radius:var(--r2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
@keyframes CP-cls-pop { 0%{transform:rotate(0) scale(1)} 45%{transform:rotate(-14deg) scale(1.22)} 80%{transform:rotate(4deg) scale(0.95)} 100%{transform:rotate(0) scale(1)} }
.CP-modal-cls  { width:42px; height:42px; border-radius:var(--r2); background:var(--cr2); border:1.5px solid var(--bd); cursor:pointer; font-size: 21px; display:flex; align-items:center; justify-content:center; color:var(--t3); transition:background .15s,border-color .15s,color .15s,box-shadow .15s; line-height:1; flex-shrink:0; }
.CP-modal-cls:hover { background:var(--rd,#D93B55); border-color:var(--rd,#D93B55); color:#faf9f7; box-shadow:0 0 0 3px rgba(217,59,85,.18),0 6px 16px rgba(217,59,85,.24); animation:CP-cls-pop .30s cubic-bezier(.34,1.56,.64,1) both; }

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
  background: rgba(35,28,20,0.52);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: CP-bdIn 0.22s ease both;
}
.CP-fp-modal {
  position: relative;
  background: var(--w,#faf9f7);
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
  background: #faf9f7; border: 1.5px solid #FBC9A8;
  cursor: pointer; color: #9a3412;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.CP-fp-close svg { transition: transform 0.18s; }
.CP-fp-close:hover { background: #FBC9A8; border-color: #F0834D; color: #C2410C; transform: rotate(90deg); box-shadow: 0 3px 10px rgba(154,52,18,0.14); }
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
.CP-wtab.active .CP-wnum { background:var(--gd); color:#faf9f7; }
.CP-wtab.done   .CP-wnum { background:var(--jade); color:#faf9f7; }

/* cci */
.CP-cci { background:var(--gold-t); border:1px solid var(--gold-r); border-radius:var(--r2); padding:12px 14px; margin-bottom:16px; display:flex; align-items:center; gap:11px; }
.CP-cci-av { width:38px; height:38px; border-radius:var(--r2); flex-shrink:0; background:linear-gradient(135deg,var(--or,#C2410C),var(--or2,#DB5B1F)); color:#faf9f7; display:flex; align-items:center; justify-content:center; font-family:var(--ff-d); font-size: 14px; font-style:italic; }

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
.CP-pay-tbl thead tr { background:var(--surface-2,#E8E2D8); border-bottom:2px solid var(--ember,#C2410C); }
.CP-pay-tbl th { padding:9px 12px; text-align:left; white-space:nowrap; font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:.1em; color:var(--text-3,#3A3024); background:transparent; border-bottom:none; border-right:1px solid var(--border,#E8E2D8); }
.CP-pay-tbl th:last-child { border-right:none; }
.CP-pay-tbl th.num, .CP-pay-tbl td.num { text-align:right; }
.CP-pay-tbl td { padding:8px 12px; font-size: 9px; font-weight: 700; border-bottom:1px solid var(--bd); border-right:1px solid var(--bd); color:var(--t1); vertical-align:middle; white-space:nowrap; transition:background .1s; }
.CP-pay-tbl td:last-child { border-right:none; }
.CP-pay-tbl tbody tr { animation:bc-in 0.25s cubic-bezier(0.4,0,0.2,1) both; }
.CP-pay-tbl tr:last-child td { border-bottom:none; }
.CP-pay-tbl tbody tr:nth-child(even) td { background:var(--off-white,#FAF8F4); }
.CP-pay-tbl tbody tr:hover td { background:var(--or-t,rgba(194,65,12,.07)); }
.CP-pay-tbl tfoot td { padding:9px 12px; font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:var(--or,#C2410C); background:var(--or-t,rgba(194,65,12,.08)); border-top:2px solid var(--or-r,rgba(194,65,12,.3)); border-right:1px solid var(--bd); position:sticky; bottom:0; z-index:4; }
.CP-pay-tbl tfoot td:last-child { border-right:none; }

/* Pagination bar under Transaction History */
.CP-tx-page-bar { display:flex; align-items:center; justify-content:space-between; padding:10px 4px 0; }
.CP-tx-page-info { font-family:var(--ff-m); font-size: 8px; font-weight: 800; color:var(--t3); letter-spacing:.04em; }
.CP-tx-page-btns { display:flex; align-items:center; gap:6px; }
.CP-tx-page-btn {
  display:flex; align-items:center; justify-content:center; gap:4px;
  height:26px; padding:0 11px; border-radius:7px;
  background:#faf9f7; border:1.5px solid #FBC9A8; color:#9a3412;
  font-family:var(--ff-m); font-size: 8.5px; font-weight: 800;
  cursor:pointer; transition:background .16s,border-color .16s,color .16s,transform .16s,box-shadow .16s;
}
.CP-tx-page-btn:hover:not(:disabled) { background:#FBC9A8; border-color:#F0834D; color:#C2410C; transform:translateY(-1px); box-shadow:0 3px 8px rgba(154,52,18,0.14); }
.CP-tx-page-btn:active:not(:disabled) { transform:translateY(0) scale(0.96); }
.CP-tx-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.CP-tx-page-num { font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:#C2410C; min-width:20px; text-align:center; }

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
.CP-bud-tbl thead tr { background:var(--surface-2,#E8E2D8); border-bottom:2px solid var(--ember,#C2410C); }
.CP-bud-tbl th { padding:9px 12px; font-family:var(--ff-m); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:.1em; color:var(--text-3,#3A3024); background:transparent; border-bottom:none; border-right:1px solid var(--border,#E8E2D8); text-align:left; white-space:nowrap; }
.CP-bud-tbl th:last-child { border-right:none; }
.CP-bud-tbl th.num,.CP-bud-tbl td.num { text-align:right; }
.CP-bud-tbl td { padding:8px 12px; font-size: 9px; font-weight: 700; border-bottom:1px solid var(--bd); border-right:1px solid var(--bd); color:var(--t1); white-space:nowrap; vertical-align:middle; }
.CP-bud-tbl td:last-child { border-right:none; }
.CP-bud-tbl tbody tr { animation:bc-in 0.25s cubic-bezier(0.4,0,0.2,1) both; }
.CP-bud-tbl tr:last-child td { border-bottom:none; }
.CP-bud-tbl tbody tr:nth-child(even) td { background:var(--off-white,#FAF8F4); }
.CP-bud-tbl tbody tr:hover td { background:var(--or-t,rgba(194,65,12,.07)); }
.CP-bud-tbl tfoot td { padding:9px 12px; font-family:var(--ff-m); font-size: 9px; font-weight: 800; color:var(--or,#C2410C); background:var(--or-t,rgba(194,65,12,.08)); border-top:2px solid var(--or-r,rgba(194,65,12,.3)); border-right:1px solid var(--bd); position:sticky; bottom:0; }
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
.CP-dd-clear { display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px; border-radius:50%; font-size: 8px; color:var(--t4,#8C7C63); cursor:pointer; transition:background .12s,color .12s; }
.CP-dd-clear:hover { background:rgba(217,59,85,.12); color:var(--rd,#D93B55); }
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
.CP-bio-av  { width:26px; height:26px; border-radius:7px; background:linear-gradient(135deg,var(--or,#C2410C),var(--or2,#DB5B1F)); color:#faf9f7; display:flex; align-items:center; justify-content:center; font-family:var(--ff-d); font-size: 9.5px; font-style:italic; flex-shrink:0; }
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
@keyframes CP3d-glow { 0%,100%{box-shadow:0 8px 28px rgba(154,52,18,.1),0 2px 8px rgba(0,0,0,.05)} 50%{box-shadow:0 8px 36px rgba(154,52,18,.18),0 2px 12px rgba(0,0,0,.07)} }
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
.CP-c3d-panel { display:grid; grid-template-columns:260px 1fr; gap:0; background:#faf9f7; border-radius:20px; overflow:hidden; position:relative; border:1.5px solid rgba(154,52,18,.18); box-shadow:0 8px 32px rgba(154,52,18,.12),0 2px 8px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.9); animation:CP3d-glow 3s ease-in-out infinite; }
@media(max-width:900px){ .CP-c3d-panel{ grid-template-columns:1fr; } }

/* Scan line */
.CP-c3d-scan { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(219,91,31,.35),transparent); animation:CP3d-scanline 4s linear infinite; pointer-events:none; z-index:10; }

/* Grid bg */
.CP-c3d-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(154,52,18,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(154,52,18,.04) 1px,transparent 1px); background-size:32px 32px; pointer-events:none; }

/* LEFT — ring section */
.CP-c3d-left { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 28px; border-right:1.5px solid rgba(154,52,18,.12); background:linear-gradient(135deg,rgba(219,91,31,.07) 0%,rgba(154,52,18,.04) 60%,rgba(255,255,255,0) 100%); gap:16px; }
.CP-c3d-ring-stage { position:relative; width:180px; height:180px; flex-shrink:0; }

/* Orbiting dots */
.CP-c3d-orb { position:absolute; top:50%; left:50%; width:8px; height:8px; margin:-4px; }
.CP-c3d-orb-dot { width:8px; height:8px; border-radius:50%; background:radial-gradient(circle,#DB5B1F,#C2410C); box-shadow:0 0 8px rgba(219,91,31,.6); }
.CP-c3d-orb1 { animation:CP3d-orbit 4s linear infinite; }
.CP-c3d-orb2 { animation:CP3d-orbit2 6s linear infinite; }

/* Outer pulsing rings */
.CP-c3d-pulse-ring { position:absolute; inset:-12px; border-radius:50%; border:1.5px solid rgba(154,52,18,.18); animation:CP3d-pulse 2.5s ease-in-out infinite; pointer-events:none; }
.CP-c3d-pulse-ring2 { position:absolute; inset:-24px; border-radius:50%; border:1px solid rgba(219,91,31,.12); animation:CP3d-pulse2 3.2s ease-in-out infinite; pointer-events:none; }

/* SVG ring */
.CP-c3d-ring-svg { position:absolute; inset:0; width:100%; height:100%; transform:rotate(-90deg); filter:drop-shadow(0 0 6px rgba(219,91,31,.3)); }
.CP-c3d-ring-track { fill:none; stroke:rgba(154,52,18,.08); stroke-width:10; }
.CP-c3d-ring-fill { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray:502 502; stroke-dashoffset:502; animation:CP3d-ring-fill 1.8s .4s cubic-bezier(.34,1.2,.64,1) forwards; }
.CP-c3d-ring-spin { fill:none; stroke:rgba(219,91,31,.25); stroke-width:2; stroke-dasharray:8 16; animation:CP3d-spin 8s linear infinite; }
.CP-c3d-ring-spin2 { fill:none; stroke:rgba(154,52,18,.15); stroke-width:1.5; stroke-dasharray:4 20; animation:CP3d-spin-rev 12s linear infinite; }

/* Center label */
.CP-c3d-center-lbl { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.CP-c3d-pct { font-family:var(--ff-m,monospace); font-size: 33.5px; font-weight: 900; color:var(--ember,#C2410C); letter-spacing:-2px; line-height:1; text-shadow:0 0 16px rgba(219,91,31,.25); }
.CP-c3d-pct-sym { font-size: 17.5px; vertical-align:super; font-weight: 800; color:#DB5B1F; }
.CP-c3d-pct-lbl { font-family:var(--ff-m,monospace); font-size: 8px; font-weight: 800; color:rgba(154,52,18,.5); text-transform:uppercase; letter-spacing:2px; }

/* Title below ring */
.CP-c3d-title { font-family:var(--ff-d,serif); font-size: 13px; font-style:italic; color:var(--t1,#231C14); text-align:center; line-height:1.3; }
.CP-c3d-sub { font-family:var(--ff-m,monospace); font-size: 8px; color:var(--t4,#8C7C63); text-transform:uppercase; letter-spacing:2px; text-align:center; }

/* RIGHT — stats section */
.CP-c3d-right { display:flex; flex-direction:column; justify-content:center; padding:32px 36px; gap:24px; position:relative; }

/* Liquid bar */
.CP-c3d-bar-wrap { }
.CP-c3d-bar-lbl { display:flex; justify-content:space-between; margin-bottom:8px; }
.CP-c3d-bar-lbl-txt { font-family:var(--ff-m,monospace); font-size: 8px; font-weight: 800; color:var(--t4,#8C7C63); text-transform:uppercase; letter-spacing:1.5px; }
.CP-c3d-bar-lbl-pct { font-family:var(--ff-m,monospace); font-size: 9px; font-weight: 800; color:var(--ember,#C2410C); }
.CP-c3d-bar-track { height:14px; border-radius:99px; background:rgba(154,52,18,.07); border:1px solid rgba(154,52,18,.12); overflow:hidden; position:relative; }
.CP-c3d-bar-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#C2410C 0%,#DB5B1F 40%,#F0834D 60%,#DB5B1F 80%,#C2410C 100%); background-size:200% 100%; animation:CP3d-liquid 2s linear infinite; position:relative; overflow:hidden; min-width:6px; transition:width 1.2s cubic-bezier(.34,1.2,.64,1); box-shadow:0 0 10px rgba(219,91,31,.35),inset 0 1px 0 rgba(255,255,255,.4); }
.CP-c3d-bar-shine { position:absolute; top:0; bottom:0; width:40%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent); animation:CP3d-shimmer 2.4s ease-in-out infinite; }

/* 3D Stat cards */
.CP-c3d-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
@media(max-width:600px){ .CP-c3d-cards{ grid-template-columns:1fr; } }
.CP-c3d-card { background:#faf9f7; border:1.5px solid rgba(154,52,18,.12); border-radius:14px; padding:16px 18px; position:relative; overflow:hidden; transform-style:preserve-3d; transition:transform .3s,box-shadow .3s; box-shadow:0 2px 12px rgba(154,52,18,.08); }
.CP-c3d-card:hover { transform:translateY(-4px) rotateX(6deg) scale(1.02); box-shadow:0 12px 28px rgba(154,52,18,.14); }
.CP-c3d-card-1 { animation:CP3d-float 4s ease-in-out infinite; }
.CP-c3d-card-2 { animation:CP3d-float2 5s ease-in-out infinite; }
.CP-c3d-card-3 { animation:CP3d-float3 3.5s ease-in-out infinite; }
.CP-c3d-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(219,91,31,.05) 0%,transparent 60%); pointer-events:none; }
.CP-c3d-card-shine { position:absolute; top:-50%; left:-50%; width:60%; height:200%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent); transform:skewX(-20deg); animation:CP3d-shimmer 3s ease-in-out infinite; }
.CP-c3d-card-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; flex-shrink:0; }
.CP-c3d-card-lbl { font-family:var(--ff-m,monospace); font-size: 8px; font-weight: 800; text-transform:uppercase; letter-spacing:1.5px; color:var(--t4,#8C7C63); margin-bottom:4px; }
.CP-c3d-card-val { font-family:var(--ff-m,monospace); font-size: 16px; font-weight: 800; letter-spacing:-0.5px; line-height:1; }
.CP-c3d-card-sub { font-family:var(--ff-m,monospace); font-size: 8px; color:var(--t4,#8C7C63); margin-top:4px; }
.CP-c3d-card-bar { height:3px; border-radius:99px; margin-top:10px; position:relative; overflow:hidden; background:rgba(154,52,18,.07); }
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
`;

/* ═══════════════════════════════════════
   ICONS
═══════════════════════════════════════════ */
const Ic = ({ n, s = 16, c = 'currentColor' }: { n: string; s?: number; c?: string }) => {
  const P: Record<string, string> = {
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    bldg: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    coins: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    plus: 'M12 4v16m-8-8h16',
    search: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    arrow: 'M9 5l7 7-7 7',
    x: 'M6 18L18 6M6 6l12 12',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    cal: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    pay: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    tx: 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  return (
    <>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={P[n] || P.users} />
      </svg>
    </>
  );
};

const Portal = ({ children }: { children: React.ReactNode }) => createPortal(children, document.body);
/* ════════════════════════════════════════
   SUCCESS CELEBRATION
═══════════════════════════════════════════ */
const CP_CONFETTI_COLORS = ['#C2410C', '#DB5B1F', '#FBC9A8', '#FDE0CB', '#FBC9A8', '#faf9f7', '#FBC9A8', '#F0834D', '#FDE0CB'];

function CPConfettiPieces({ seed = 0, count = 22 }: { seed?: number; count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const n = i + seed * 7;
    return {
      id: i,
      color: CP_CONFETTI_COLORS[n % CP_CONFETTI_COLORS.length],
      left: `${4 + (n * 6.1) % 92}%`,
      top: `${12 + (n * 8.3) % 62}%`,
      delay: `${(n * 55) % 550}ms`,
      size: 5 + (n % 4) * 3,
      rotate: n * 41,
      drift: ((n % 5) - 2) * 18,
    };
  });

  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="CP-confetti-piece" style={{
          left: p.left, top: p.top, width: p.size, height: p.size,
          background: p.color, animationDelay: p.delay,
          animationDuration: `${900 + (p.id * 55) % 500}ms`,
          ['--cp-drift' as any]: `${p.drift}px`,
          transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
    </>
  );
}

function CPSparklePieces() {
  const sparks = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${50 + Math.cos((i / 10) * Math.PI * 2) * (30 + (i % 3) * 6)}%`,
    top: `${42 + Math.sin((i / 10) * Math.PI * 2) * (26 + (i % 3) * 5)}%`,
    delay: `${300 + i * 70}ms`,
    size: 6 + (i % 3) * 3,
  }));
  return (
    <>
      {sparks.map(s => (
        <svg key={s.id} className="CP-sparkle" width={s.size} height={s.size} viewBox="0 0 24 24"
          style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          fill="#DB5B1F">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      ))}
    </>
  );
}

function CPSuccessCelebration({ title, sub, amountText, onDone, duration = 1800 }: {
  title: string; sub?: string; amountText?: string; onDone: () => void; duration?: number;
}) {
  const [burstTwo, setBurstTwo] = useState(false);
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    const b = setTimeout(() => setBurstTwo(true), 450);
    return () => { clearTimeout(t); clearTimeout(b); };
  }, []);
  return (
    <div className="CP-closed-celebrate">
      <CPConfettiPieces seed={0} />
      {burstTwo && <CPConfettiPieces seed={1} count={16} />}
      <CPSparklePieces />
      <div className="CP-closed-ring" />
      <div className="CP-closed-ring2" />
      <div className="CP-closed-stamp-wrap">
        <div className="CP-closed-check">
          <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="CP-closed-txt">{title}</div>
        {sub && <div className="CP-closed-sub">{sub}</div>}
        {amountText && <div className="CP-closed-amt-badge">{amountText}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DD — simple option select
═══════════════════════════════════════════ */
function DD({ opts, val, onChange, placeholder, disabled }: {
  opts: { value: string; label: string }[]; val: string;
  onChange: (v: string) => void; placeholder: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [q, setQ] = useState('');
  const [pStyle, setPStyle] = useState<React.CSSProperties>({});
  const wRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, btnRef);
  const filtered = q.trim() ? opts.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : opts;

  const compute = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const ih = Math.min(290, filtered.length * 40 + 56);
    const below = window.innerHeight - r.bottom > ih + 6;
    setPStyle({
      position: 'fixed', left: r.left, width: Math.max(r.width, 180), zIndex: 99999,
      ...(below ? { top: r.bottom + 4 } : { bottom: window.innerHeight - r.top + 4 })
    });
  };

  useEffect(() => {
    if (!open) { setQ(''); return; }
    compute();
    setTimeout(() => searchRef.current?.focus(), 40);
    const h = (e: MouseEvent) => { if (!wRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const sel = opts.find(o => o.value === val);
  return (
    <div className="CP-dd" ref={wRef}>
      <button type="button" ref={btnRef} disabled={disabled}
        className={`CP-dd-trigger${!sel ? ' ph' : ''}${open ? ' open' : ''}`}
        onClick={() => { if (!disabled) { compute(); setOpen(o => !o); } }} onKeyDown={onTriggerKeyDown}>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel ? sel.label : placeholder}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          {val && !disabled && (
            <span className="CP-dd-clear" onMouseDown={e => { e.stopPropagation(); onChange(''); setOpen(false); }}>✕</span>
          )}
          <svg className={`CP-dd-chev${open ? ' open' : ''}`} viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && createPortal(
        <div ref={panelRef} style={{ ...pStyle, background: '#faf9f7', border: '1.5px solid #DB5B1F', borderRadius: 12, boxShadow: '0 12px 36px rgba(0,0,0,.16)', overflow: 'hidden', fontFamily: 'inherit' }}
          onMouseDown={e => e.stopPropagation()}>
          {/* Search Bar Start */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderBottom: '1px solid #E8E2D8', background: '#F5F3EF', position: 'sticky', top: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8C7C63" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              ref={searchRef}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 11.5, color: '#231C14', fontFamily: 'inherit', caret_color: '#DB5B1F' } as any}
              placeholder="Search…"
              value={q}
              onChange={e => { setQ(e.target.value); compute(); }}
            />
            {q && (
              <span style={{ cursor: 'pointer', color: '#8C7C63', fontSize: 9.5, lineHeight: 1, padding: '1px 3px', borderRadius: 4 }}
                onMouseDown={e => { e.stopPropagation(); setQ(''); }}>✕</span>
            )}
          </div>
          {/* SearcH Bar End */}

          {/* Options list Start */}
          <div style={{ maxHeight: 224, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,.12) transparent' }}>
            {filtered.length === 0
              ? <div style={{ padding: '14px 16px', color: '#8C7C63', fontSize: 10.5, fontStyle: 'italic', textAlign: 'center' }}>No match found</div>
              : filtered.map(o => (
                <div key={o.value}
                  role="option" tabIndex={-1} aria-selected={val === o.value}
                  style={{
                    padding: '10px 14px', fontSize: 11.5, fontWeight: val === o.value ? 800 : 600,
                    color: val === o.value ? '#C2410C' : '#3A3024',
                    background: val === o.value ? 'rgba(219,91,31,.08)' : 'transparent',
                    borderBottom: '1px solid #F5F3EF',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (val !== o.value) (e.currentTarget as HTMLDivElement).style.background = '#F5F3EF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = val === o.value ? 'rgba(219,91,31,.08)' : 'transparent'; }}
                  onClick={() => { onChange(o.value); setOpen(false); }}>
                  <span>{o.label}</span>
                  {val === o.value && <span style={{ color: '#DB5B1F', fontWeight: 800, fontSize: 11.5 }}>✓</span>}
                </div>
              ))
            }
          </div>
          {/* Options List End */}

          {/* Footer Count Start */}
          <div style={{ padding: '5px 12px', fontSize: 8, fontWeight: 800, letterSpacing: '.5px', color: '#8C7C63', borderTop: '1px solid #E8E2D8', background: '#F5F3EF', textAlign: 'right', textTransform: 'uppercase' }}>
            {q ? `${filtered.length} of ${opts.length} matches` : `${opts.length} options`}
          </div>
          {/* Footer Count ENd */}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   BioDD — bio record select with search
═══════════════════════════════════════════ */
function BioDD({ options, value, onChange, loading }: {
  options: BioRecord[]; value: string;
  onChange: (name: string, id: string, rec: BioRecord) => void; loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [q, setQ] = useState('');
  const [bioPStyle, setBioPStyle] = useState<React.CSSProperties>({});
  const [bioListMaxH, setBioListMaxH] = useState(220);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef2 = useRef<HTMLButtonElement>(null);
  const inp = useRef<HTMLInputElement>(null);
  const panelRef2 = useRef<HTMLDivElement>(null);
  const onTriggerKeyDown2 = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef2, btnRef2);
  const filtered = options.filter(o =>
    o.name.toLowerCase().includes(q.toLowerCase()) ||
    (o.id_details || '').toLowerCase().includes(q.toLowerCase())
  );
  const selRec = value ? options.find(o => o.name === value) : null;

  const computeBio = () => {
    if (!btnRef2.current) return;
    const r = btnRef2.current.getBoundingClientRect();
    const mg = 10;
    const chrome = 90;
    const avail = Math.max(150, window.innerHeight - r.bottom - 4 - mg);
    setBioListMaxH(Math.max(90, Math.min(220, avail - chrome)));
    setBioPStyle({
      position: 'fixed', left: r.left, top: r.bottom + 4, width: r.width, zIndex: 99999,
    });
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setQ(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => { if (open && inp.current) setTimeout(() => inp.current?.focus(), 50); }, [open]);
  return (
    <div className="CP-dd" ref={ref}>
      <button type="button" ref={btnRef2} disabled={loading}
        className={`CP-dd-trigger${!value ? ' ph' : ''}${open ? ' open' : ''}`}
        onClick={() => { if (!loading) { computeBio(); setOpen(o => !o); } }} onKeyDown={onTriggerKeyDown2}>
        {loading
          ? <span style={{ fontSize: 10.5, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 8 }}><span className="CP-spinner-or" />Loading…</span>
          : value && selRec
            ? <div className="CP-bio-sel">
              <div className="CP-bio-av">{selRec.name.charAt(0)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="CP-bio-nm">{selRec.name}</div>
                {selRec.id_details && <div className="CP-bio-id">{selRec.id_details}</div>}
              </div>
            </div>
            : value
              ? <div className="CP-bio-sel">
                <div className="CP-bio-av" style={{ background: 'rgba(154,52,18,0.15)', color: 'var(--ember,#C2410C)', fontWeight: 800 }}>{value.charAt(0).toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="CP-bio-nm">{value}</div>
                  <div className="CP-bio-id" style={{ fontStyle: 'italic', opacity: 0.7 }}>Click to relink…</div>
                </div>
              </div>
              : <span style={{ color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 7 }}><Ic n="user" s={11} /> Select income client…</span>}
        <svg className={`CP-dd-chev${open ? ' open' : ''}`} viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && createPortal(
        <div ref={panelRef2} style={{
          ...bioPStyle, background: 'var(--white,#faf9f7)', border: '1.5px solid var(--ember-mid,#DB5B1F)', borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,.13)', overflow: 'hidden'
        }}
          onMouseDown={e => e.stopPropagation()}>
          <div style={{
            padding: '7px 12px', background: 'rgba(154,52,18,.06)', borderBottom: '1px solid rgba(154,52,18,.12)',
            fontSize: 8, fontFamily: 'JetBrains Mono,monospace', fontWeight: 800, color: 'var(--ember,#C2410C)', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Ic n="users" s={10} c="var(--ember,#C2410C)" />
            Income clients · {options.length} available
          </div>
          <div style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid var(--border,#D2C7B8)', background: 'var(--off-white,#F5F3EF)' }}>
            <Ic n="search" s={12} />
            <input ref={inp} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 11.5, color: 'var(--text-1)', fontFamily: 'var(--font-body)' }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search clients…" />
            {q && <button type="button" onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>}
          </div>
          <div style={{ maxHeight: bioListMaxH, overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {filtered.length === 0
              ? <div style={{ padding: 16, fontSize: 10.5, color: 'var(--text-4)', fontStyle: 'italic', textAlign: 'center' }}>No match for "{q}"</div>
              : filtered.map(r => (
                <div key={r.id} role="option" tabIndex={-1} aria-selected={value === r.name} style={{
                  padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  background: value === r.name ? 'rgba(154,52,18,0.07)' : 'transparent',
                  borderBottom: '1px solid var(--border,#D2C7B8)', transition: 'background 0.1s'
                }}
                  onMouseOver={e => { if (value !== r.name) (e.currentTarget as HTMLElement).style.background = 'rgba(219,91,31,0.05)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = value === r.name ? 'rgba(154,52,18,0.07)' : 'transparent'; }}
                  onClick={() => { onChange(r.name, r.id_details || '', r); setOpen(false); setQ(''); }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: value === r.name ? 'var(--ember,#C2410C)' : 'var(--ember-ghost,rgba(219,91,31,.12))',
                    color: value === r.name ? '#faf9f7' : 'var(--ember,#C2410C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}><Ic n="user" s={13} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 11.5, color: value === r.name ? 'var(--ember,#C2410C)' : 'var(--text-1)' }}>{r.name}</div>
                    {r.id_details && <div style={{ fontSize: 8.5, color: 'var(--text-4)', fontFamily: 'JetBrains Mono,monospace', marginTop: 1 }}>{r.id_details}</div>}
                  </div>
                  {value === r.name && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ember,#C2410C)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>}
                </div>
              ))}
          </div>
          <div style={{ padding: '5px 12px', fontFamily: 'JetBrains Mono,monospace', fontSize: 8, letterSpacing: '.5px', color: 'var(--text-4)', borderTop: '1px solid var(--border,#D2C7B8)', background: 'var(--off-white,#F5F3EF)', textAlign: 'right' }}>{filtered.length} records</div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SubDD — project name from bio sub_names
═══════════════════════════════════════════ */
function SubDD({ subs, val, onChange, disabled, placeholder }: {
  subs: string[]; val: string; onChange: (v: string) => void;
  disabled?: boolean; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [q, setQ] = useState('');
  const [subPStyle, setSubPStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const btnRef3 = useRef<HTMLButtonElement>(null);
  const panelRef3 = useRef<HTMLDivElement>(null);
  const onTriggerKeyDown3 = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef3, btnRef3);
  const computeSub = () => {
    if (!btnRef3.current) return;
    const r = btnRef3.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom > 240;
    setSubPStyle({
      position: 'fixed', left: r.left, width: r.width, zIndex: 99999,
      ...(below ? { top: r.bottom + 4 } : { bottom: window.innerHeight - r.top + 4 })
    });
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setQ(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  if (disabled) return (
    <div className="CP-dd">
      <button type="button" disabled className="CP-dd-trigger ph">
        <span style={{ fontStyle: 'italic', fontSize: 10.5 }}>Select client first…</span>
        <svg className="CP-dd-chev" viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );

  if (subs.length === 0) return (
    <input className="CP-input" value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Enter project name…'} autoFocus />
  );

  const fsubs = subs.filter(s => s.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="CP-dd" ref={ref}>
      <button type="button" ref={btnRef3} className={`CP-dd-trigger${!val ? ' ph' : ''}${open ? ' open' : ''}`}
        onClick={() => { computeSub(); setOpen(o => !o); }} onKeyDown={onTriggerKeyDown3}>
        {val
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Ic n="bldg" s={12} /><span style={{ fontWeight: 700 }}>{val}</span></span>
          : <span style={{ color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 7 }}><Ic n="bldg" s={12} />{placeholder || `Choose from ${subs.length} names…`}</span>}
        <svg className={`CP-dd-chev${open ? ' open' : ''}`} viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && createPortal(
        <div ref={panelRef3} style={{
          ...subPStyle, background: 'var(--white,#faf9f7)', border: '1.5px solid var(--ember-mid,#DB5B1F)', borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,.13)', overflow: 'hidden'
        }}
          onMouseDown={e => e.stopPropagation()}>
          <div style={{
            padding: '7px 12px', background: 'rgba(154,52,18,.06)', borderBottom: '1px solid rgba(154,52,18,.12)',
            fontSize: 8, fontFamily: 'JetBrains Mono,monospace', fontWeight: 800, color: 'var(--ember,#C2410C)'
          }}>
            {subs.length} project names from BioData
          </div>
          {subs.length > 5 && (
            <div style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid var(--border,#D2C7B8)', background: 'var(--off-white,#F5F3EF)' }}>
              <Ic n="search" s={12} />
              <input style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 11.5, color: 'var(--text-1)', fontFamily: 'var(--font-body)' }}
                value={q} onChange={e => setQ(e.target.value)} placeholder="Filter names…" />
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {fsubs.map(s => (
              <div key={s} role="option" tabIndex={-1} aria-selected={val === s} style={{
                padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: val === s ? 'rgba(154,52,18,0.07)' : 'transparent', borderBottom: '1px solid var(--border,#D2C7B8)',
                color: val === s ? 'var(--ember,#C2410C)' : 'var(--text-1)', fontWeight: val === s ? 800 : 600, fontSize: 12, transition: 'background 0.1s'
              }}
                onMouseOver={e => { if (val !== s) (e.currentTarget as HTMLElement).style.background = 'rgba(219,91,31,0.05)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = val === s ? 'rgba(154,52,18,0.07)' : 'transparent'; }}
                onClick={() => { onChange(s); setOpen(false); setQ(''); }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: val === s ? 'var(--ember,#C2410C)' : 'var(--text-4)', flexShrink: 0 }} />{s}
                </span>
                {val === s && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ember,#C2410C)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>}
              </div>
            ))}
          </div>
          <div style={{
            padding: '5px 12px', fontFamily: 'JetBrains Mono,monospace', fontSize: 8, letterSpacing: '.5px', color: 'var(--text-4)',
            borderTop: '1px solid var(--border,#D2C7B8)', background: 'var(--off-white,#F5F3EF)', textAlign: 'right'
          }}>{fsubs.length} of {subs.length}</div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAYMENT MODAL  (full — collect + budget tabs)
═══════════════════════════════════════════ */
function PaymentModal({ project: initProject, clientId, initialTab = 'collect', onClose, onSaved, initialEditPayment, initialEditBudget }: {
  project: Project; clientId: number;
  initialTab?: 'collect' | 'budget';
  onClose: () => void; onSaved: () => void;
  initialEditPayment?: Payment | null; initialEditBudget?: BudgetHistory | null;
}) {
  const [tab, setTab] = useState<'collect' | 'budget'>(initialTab);
  const [project, setProject] = useState(initProject);
  const emptyCollect = () => ({
    payment_date: new Date().toISOString().split('T')[0],
    amount: '', gst_amount: '', payment_mode: 'cash',
    reference_number: '', notes: '', next_due_date: '',
  });

  const [cf, setCf] = useState(emptyCollect());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [dupModal, setDupModal] = useState<{ open: boolean; pendingStep: 'next' | 'finalSave' | 'skip' | null }>({ open: false, pendingStep: null });
  const [editPayId, setEditPayId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; loading: boolean }>({ open: false, id: 0, loading: false });
  const formRef = useRef<HTMLFormElement>(null);
  const [payments, setPayments] = useState<Payment[]>(asArray<Payment>(initProject.payments));
  const [loadingPays, setLoadingPays] = useState(false);
  const [hasFetched, setHasFetched] = useState(!!initProject.payments);
  const [budgetAmt, setBudgetAmt] = useState('');
  const [budgetReason, setBudgetReason] = useState('');
  const [budgetDate, setBudgetDate] = useState(new Date().toISOString().split('T')[0]);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetMsg, setBudgetMsg] = useState('');
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistory[]>([]);
  const [budgetHistFetched, setBudgetHistFetched] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState<number | null>(null);
  const [deleteBudgetModal, setDeleteBudgetModal] = useState<{ open: boolean; id: number; loading: boolean }>({ open: false, id: 0, loading: false });
  const [txPage, setTxPage] = useState(0);
  const TX_PAGE_SIZE = 5;
  const [budgetPage, setBudgetPage] = useState(0);
  const BUDGET_PAGE_SIZE = 5;
  const [celebrate, setCelebrate] = useState<{ title: string; sub: string; amountText: string } | null>(null);

  const fetchPayments = useCallback(async () => {
    if (hasFetched) return;
    setLoadingPays(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/client-portal/clients/${clientId}/projects/${project.id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setPayments(asArray(res.data.data?.payments));
      setHasFetched(true);
    } catch (e) { console.error(e); } finally { setLoadingPays(false); }
  }, [clientId, project.id, hasFetched]);

  const fetchBudgetHistory = useCallback(async () => {
    if (budgetHistFetched) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/client-portal/clients/${clientId}/projects/${project.id}/budget-history`,
        { headers: { Authorization: `Bearer ${token}` } });
      setBudgetHistory(asArray(res.data.data ?? res.data));
      setBudgetHistFetched(true);
    } catch (e) { setBudgetHistFetched(true); }
  }, [clientId, project.id, budgetHistFetched]);

  useEffect(() => { fetchPayments(); }, []);
  useEffect(() => { if (tab === 'budget') fetchBudgetHistory(); }, [tab]);
  useEffect(() => {
    if (initialEditPayment) { handleEditPay(initialEditPayment); setTab('collect'); }
    else if (initialEditBudget) { handleEditBudget(initialEditBudget); setTab('budget'); }
  }, []);
  const hc = (e: React.ChangeEvent<HTMLInputElement>) => setCf(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cf.payment_date || !cf.amount) { setMsg('Fill required fields'); toast.warning('Required Fields', 'Payment date and amount are required.'); return; }
    setSaving(true); setMsg('');
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const payload = { ...cf, amount: parseFloat(cf.amount), gst_amount: cf.gst_amount ? parseFloat(cf.gst_amount) : 0 };
      if (editPayId) await axiosInstance.put(`/api/client-portal/payments/${editPayId}`, payload, { headers: h });
      else await axiosInstance.post(`/api/client-portal/projects/${project.id}/payments`, payload, { headers: h });
      setHasFetched(false);
      await fetchPayments();
      setHasFetched(true);
      setSaving(false);
      setCelebrate({
        title: 'PAYMENT RECORDED!',
        sub: project.project_name,
        amountText: fmt(parseFloat(cf.amount || '0') + parseFloat(cf.gst_amount || '0')),
      });
    } catch (err: any) { setMsg(err.response?.data?.message || 'Failed to save payment'); setSaving(false); }
  };

  const handleDeletePay = (id: number) => {
    setDeleteModal({ open: true, id, loading: false });
  };

  const confirmDeletePay = async () => {
    setDeleteModal(d => ({ ...d, loading: true }));
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/api/client-portal/payments/${deleteModal.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPayments(p => p.filter(x => x.id !== deleteModal.id));
      onSaved();
    } catch (err: any) { toast.error('Delete Failed', err.response?.data?.message || 'Could not delete the item.'); }
    finally { setDeleteModal({ open: false, id: 0, loading: false }); }
  };

  const handleEditPay = (pay: Payment) => {
    setEditPayId(pay.id);
    setCf({
      payment_date: pay.payment_date ? new Date(pay.payment_date).toISOString().split('T')[0] : '',
      amount: String(pay.amount),
      gst_amount: pay.gst_amount ? String(pay.gst_amount) : '',
      payment_mode: pay.payment_mode,
      reference_number: pay.reference_number || '',
      notes: pay.notes || '',
      next_due_date: pay.next_due_date ? new Date(pay.next_due_date).toISOString().split('T')[0] : '',
    });
    setTab('collect');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmt || parseFloat(budgetAmt) <= 0) { setBudgetMsg('Enter valid amount'); toast.warning('Invalid Amount', 'Please enter a valid budget amount greater than 0.'); return; }
    setBudgetSaving(true); setBudgetMsg('');
    try {
      const token = localStorage.getItem('token');
      const payload = { extra_amount: parseFloat(budgetAmt), reason: budgetReason, date_added: budgetDate };
      if (editBudgetId) await axiosInstance.put(`/api/client-portal/budget-history/${editBudgetId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      else await axiosInstance.post(`/api/client-portal/clients/${clientId}/projects/${project.id}/add-budget`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setBudgetHistFetched(false);
      await fetchBudgetHistory();
      setBudgetSaving(false);
      setCelebrate({
        title: editBudgetId ? 'BUDGET UPDATED!' : 'BUDGET ADDED!',
        sub: project.project_name,
        amountText: fmt(parseFloat(budgetAmt || '0')),
      });
    } catch (err: any) { setBudgetMsg(err.response?.data?.message || 'Failed'); setBudgetSaving(false); }
  };

  const handleEditBudget = (bh: BudgetHistory) => {
    setEditBudgetId(bh.id);
    setBudgetAmt(String(bh.extra_amount));
    setBudgetReason(bh.reason || '');
    setBudgetDate(bh.date_added ? new Date(bh.date_added).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setTab('budget');
  };

  const handleDeleteBudget = (id: number) => setDeleteBudgetModal({ open: true, id, loading: false });

  const confirmDeleteBudget = async () => {
    setDeleteBudgetModal(d => ({ ...d, loading: true }));
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/api/client-portal/budget-history/${deleteBudgetModal.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBudgetHistory(bh => bh.filter(x => x.id !== deleteBudgetModal.id));
      onSaved();
    } catch (err: any) { toast.error('Delete Failed', err.response?.data?.message || 'Could not delete the item.'); }
    finally { setDeleteBudgetModal({ open: false, id: 0, loading: false }); }
  };

  const amtVal = parseFloat(cf.amount || '0');
  const gstVal = parseFloat(cf.gst_amount || '0');
  const totalCollect = amtVal + gstVal;
  const balAfter = Math.max(0, project.balance - amtVal);
  const dueSoon = cf.next_due_date && getDaysUntilDue(cf.next_due_date) <= 15;
  const budgetNew = project.total_budget + (parseFloat(budgetAmt) || 0);
  const totalAmt = payments.reduce((s, p) => s + p.amount, 0);
  const totalGst = payments.reduce((s, p) => s + (p.gst_amount || 0), 0);
  const totalAll = payments.reduce((s, p) => s + p.total_amount, 0);
  const totalBudgetAdded = budgetHistory.reduce((s, b) => s + b.extra_amount, 0);
  const txTotalPages = Math.max(1, Math.ceil(payments.length / TX_PAGE_SIZE));
  const txPageClamped = Math.min(txPage, txTotalPages - 1);
  const txStart = txPageClamped * TX_PAGE_SIZE;
  const txVisible = payments.slice(txStart, txStart + TX_PAGE_SIZE);
  const budgetTotalPages = Math.max(1, Math.ceil(budgetHistory.length / BUDGET_PAGE_SIZE));
  const budgetPageClamped = Math.min(budgetPage, budgetTotalPages - 1);
  const budgetStart = budgetPageClamped * BUDGET_PAGE_SIZE;
  const budgetVisible = budgetHistory.slice(budgetStart, budgetStart + BUDGET_PAGE_SIZE);
  const isCollect = tab === 'collect';
  const accentGrad = isCollect ? 'linear-gradient(90deg,#C2410C,#F0834D)' : 'linear-gradient(90deg,#9A3412,#9A3412)';

  return (
    <Portal>
      <div className="CP-root CP-fp-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="CP-fp-modal CP-fp-modal-lg">
          {celebrate && (
            <CPSuccessCelebration
              title={celebrate.title}
              sub={celebrate.sub}
              amountText={celebrate.amountText}
              onDone={() => {
                setCf(emptyCollect()); setEditPayId(null);
                setBudgetAmt(''); setBudgetReason(''); setBudgetMsg(''); setEditBudgetId(null);
                setCelebrate(null);
                onSaved();
                onClose();
              }}
            />
          )}
          <div className="CP-modal-top" style={{ background: accentGrad }} />
          <div className="CP-modal-body">

            {/* Header Start  */}
            <div className="CP-modal-hdr">
              <div className="CP-modal-hdr-l">
                <div className="CP-modal-ttl-ico" style={{
                  background: isCollect ? 'rgba(194,65,12,.12)' : 'rgba(154,52,18,.12)',
                  border: `1.5px solid ${isCollect ? 'rgba(194,65,12,.26)' : 'rgba(154,52,18,.26)'}`
                }}>
                  <Ic n={isCollect ? 'pay' : 'chart'} s={18} c={isCollect ? 'var(--jade)' : 'var(--gold)'} />
                </div>
                <div>
                  <div className="CP-modal-ttl">{isCollect ? 'Collect Payment' : 'Add Budget'}</div>
                  <div className="CP-modal-sub" style={{ fontSize: 11.5 }}>
                    {project.project_name} · Balance: <span style={{ fontWeight: 800 }}>{fmt(project.balance)}</span>
                  </div>
                </div>
              </div>
              <button className="CP-fp-close" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" s={18} /></button>
            </div>
            {/* Header End */}

            {/* Tabs Start */}
            <div className="CP-modal-tabs">
              <button type="button" className={`CP-modal-tab${tab === 'collect' ? ' active' : ''}`}
                onClick={() => setTab('collect')} style={tab === 'collect' ? { color: 'var(--jade)' } : {}}>
                <Ic n="pay" s={13} /> Collect Payment
              </button>
              <button type="button" className={`CP-modal-tab${tab === 'budget' ? ' active' : ''}`}
                onClick={() => setTab('budget')} style={tab === 'budget' ? { color: 'var(--gold)' } : {}}>
                <Ic n="chart" s={13} /> Add Budget
              </button>
            </div>
            {/* Tabs End */}

            {/* ── COLLECT TAB ── */}
            {tab === 'collect' && (
              <div>
                <div className="CP-mini-cards">
                  {[
                    { lbl: 'Budget', val: fmt(project.total_budget), color: 'var(--gold)', cls: 'gold' },
                    { lbl: 'Collected', val: fmt(project.total_collected), color: 'var(--jade)', cls: 'jade' },
                    { lbl: 'Balance', val: fmt(project.balance), color: 'var(--crimson)', cls: 'crimson' },
                  ].map(s => (
                    <div key={s.lbl} className={`CP-mini-card ${s.cls}`}>
                      <div className="CP-mini-lbl">{s.lbl}</div>
                      <div className="CP-mini-val" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Form Start */}
                <form onSubmit={handleCollect} ref={formRef}>
                  <div className="CP-modal-divider"><span className="CP-modal-div-tag jade">01 — Payment Details</span><div className="CP-modal-div-line" /></div>
                  {/* Mode Start */}
                  <div className="CP-g2">
                    <div className="CP-field">
                      <label className="CP-label"><Ic n="cal" s={10} /> Date <span className="req">*</span></label>
                      <CalendarDD value={cf.payment_date} onChange={v => setCf(p => ({ ...p, payment_date: v }))} />
                    </div>
                    <div className="CP-field">
                      <label className="CP-label">Mode <span className="req">*</span></label>
                      <DD opts={MODE_OPTS} val={cf.payment_mode} onChange={v => setCf(p => ({ ...p, payment_mode: v }))} placeholder="Select mode" />
                    </div>
                  </div>
                  {/* Mode End */}

                  {/* Amount Start */}
                  <div className="CP-g2" style={{ marginTop: 10 }}>
                    {/* Amount Start */}
                    <div className="CP-field">
                      <label className="CP-label">Amount (₹) <span className="req">*</span></label>
                      <input className="CP-input" type="number" name="amount" value={cf.amount} onChange={hc} min="0" step="0.01" placeholder="0.00" required />
                    </div>
                    {/* Amount End */}

                    {/* GST Start */}
                    <div className="CP-field">
                      <label className="CP-label">GST (₹) <span className="opt">(opt)</span></label>
                      <input className="CP-input" type="number" name="gst_amount" value={cf.gst_amount} onChange={hc} min="0" step="0.01" placeholder="0" />
                    </div>
                    {/* GST End */}

                  </div>
                  {/* Amount End */}

                  <div className="CP-modal-divider" style={{ marginTop: 16 }}><span className="CP-modal-div-tag jade">02 — Additional Info</span><div className="CP-modal-div-line" /></div>

                  {/* Reference No Start */}
                  <div className="CP-g2">
                    <div className="CP-field">
                      <label className="CP-label">Reference No. <span className="opt">(opt)</span></label>
                      <input className="CP-input" name="reference_number" value={cf.reference_number} onChange={hc} placeholder="UTR / Cheque no." />
                    </div>
                    <div className="CP-field">
                      <label className="CP-label">
                        <Ic n="cal" s={10} /> Next Due <span className="opt">(opt)</span>
                        {dueSoon && <span style={{ color: 'var(--rd)', fontSize: 8 }}>⚠ Soon!</span>}
                      </label>
                      <CalendarDD value={cf.next_due_date} onChange={v => setCf(p => ({ ...p, next_due_date: v }))} />
                    </div>
                  </div>
                  {/* Reference No End */}

                  {/* Notes Start */}
                  <div className="CP-field" style={{ marginTop: 10 }}>
                    <label className="CP-label">Notes <span className="opt">(opt)</span></label>
                    <input className="CP-input" name="notes" value={cf.notes} onChange={hc} placeholder="Remarks…" />
                  </div>
                  {/* Notes End */}

                  {amtVal > 0 && (
                    <div className="CP-preview jade" style={{ gap: 28 }}>
                      <div><div className="CP-preview-lbl">Total incl. GST</div><div className="CP-preview-val" style={{ color: 'var(--jade)' }}>{fmt(totalCollect)}</div></div>
                      <div><div className="CP-preview-lbl">Balance After</div><div className="CP-preview-val" style={{ color: 'var(--rd)' }}>{fmt(balAfter)}</div></div>
                    </div>
                  )}

                  {/* Saving Start */}
                  <div className="CP-modal-actions">
                    <button type="submit" className="CP-btn-primary" disabled={saving}
                      style={{ background: 'linear-gradient(135deg,var(--jade),var(--jade2))', boxShadow: '0 4px 16px var(--jade-g)' }}>
                      {saving ? <><span className="CP-spinner" />Saving…</> : editPayId ? '✓ Update Payment' : '✓ Record Payment'}
                    </button>
                    {editPayId && <button type="button" className="CP-btn-ghost" onClick={() => { setEditPayId(null); setCf(emptyCollect()); }}>Clear</button>}
                    <button type="button" className="CP-btn-ghost" onClick={onClose}>Cancel</button>
                  </div>
                  {/* Saving End */}
                </form>
                {/* Form End */}

                {/* Transaction Feed - Professional Version with Icons */}
                {(payments.length > 0 || loadingPays) && (
                  <>
                    {/* Transaction History Start */}
                    <div className="CP-modal-divider" style={{ marginTop: 26 }}>
                      <span className="CP-modal-div-tag jade">Transaction History ({payments.length})</span>
                      <div className="CP-modal-div-line" />
                    </div>
                    {/* Transaction History End */}

                    {/* Professional Table Layout */}
                    <div className="CP-pay-tbl-wrap" style={{ marginTop: 8 }}>

                      {/* Table Start */}
                      <table className="CP-pay-tbl" style={{ minWidth: 900, width: '100%' }}>

                        {/* Thead Start */}
                        <thead>
                          <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>S.No</th>
                            <th style={{ width: 100 }}>Date</th>
                            <th style={{ width: 100 }}>Mode</th>
                            <th style={{ width: 120, textAlign: 'right' }}>Amount</th>
                            <th style={{ width: 100, textAlign: 'right' }}>GST</th>
                            <th style={{ width: 120, textAlign: 'right' }}>Total</th>
                            <th style={{ width: 130 }}>Reference</th>
                            <th style={{ width: 110 }}>Next Due</th>
                            <th>Notes</th>
                            <th style={{ width: 80, textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        {/* Thead End */}

                        {/* Tbody Start */}
                        <tbody>
                          {loadingPays ? (
                            <tr>
                              <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--t4)' }}>
                                <span className="CP-spinner-or" style={{ marginRight: 8 }} /> Loading transactions...
                              </td>
                            </tr>
                          ) : (
                            txVisible.map((pay, i) => {
                              const soon = pay.next_due_date && getDaysUntilDue(pay.next_due_date) <= 15;
                              const ModeIcon = () => {
                                switch (pay.payment_mode) {
                                  case 'cash':
                                    return (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="2" y="6" width="20" height="12" rx="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <path d="M6 12h.01M18 12h.01" />
                                      </svg>
                                    );
                                  case 'upi':
                                    return (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                        <path d="M8 8h8v8H8z" />
                                        <path d="M16 8l-4 4-4-4" />
                                        <path d="M8 16l4-4 4 4" />
                                      </svg>
                                    );
                                  case 'cheque':
                                    return (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                        <path d="M7 10h10M7 14h6" />
                                        <path d="M3 8l8-3 10 3" />
                                      </svg>
                                    );
                                  case 'bank_transfer':
                                  case 'neft':
                                    return (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                        <path d="M8 21h8" />
                                        <path d="M12 11v4" />
                                      </svg>
                                    );
                                  default:
                                    return (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                      </svg>
                                    );
                                }
                              };

                              return (
                                <tr key={pay.id} style={{ transition: 'background 0.15s' }}>
                                  <td style={{ textAlign: 'center', fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--t1)' }}>
                                    {txStart + i + 1}
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                      </svg>
                                      <span style={{ fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--t1)' }}>
                                        {fmtDate(pay.payment_date)}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      padding: '4px 10px',
                                      borderRadius: 20,
                                      background: `var(--${pay.payment_mode === 'cash' ? 'jade' : pay.payment_mode === 'upi' ? 'gold' : pay.payment_mode === 'cheque' ? 'iris' : pay.payment_mode === 'neft' ? 'emerald' : 'cobalt'}-t)`,
                                      border: `1px solid var(--${pay.payment_mode === 'cash' ? 'jade' : pay.payment_mode === 'upi' ? 'gold' : pay.payment_mode === 'cheque' ? 'iris' : pay.payment_mode === 'neft' ? 'emerald' : 'cobalt'}-r)`
                                    }}>
                                      <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ModeIcon />
                                      </span>
                                      <span style={{
                                        fontSize: 9,
                                        fontWeight: 800,
                                        color: `var(--${pay.payment_mode === 'cash' ? 'jade' : pay.payment_mode === 'upi' ? 'gold' : pay.payment_mode === 'cheque' ? 'iris' : pay.payment_mode === 'neft' ? 'emerald' : 'cobalt'})`
                                      }}>
                                        {pay.mode_label}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'right', fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--jade)' }}>
                                    {fmt(pay.amount)}
                                  </td>
                                  <td style={{ textAlign: 'right', fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--iris2)' }}>
                                    {pay.gst_amount > 0 ? fmt(pay.gst_amount) : ''}
                                  </td>
                                  <td style={{ textAlign: 'right', fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--gold)' }}>
                                    {fmt(pay.total_amount)}
                                  </td>
                                  <td>
                                    {pay.reference_number ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M4 4v16h16V4H4z" />
                                          <path d="M8 9h8M8 13h6" />
                                        </svg>
                                        <span style={{ fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 700, color: 'var(--t2)' }}>
                                          {pay.reference_number}
                                        </span>
                                      </div>
                                    ) : null}
                                  </td>
                                  <td>
                                    {pay.next_due_date ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {soon && (
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--rd)" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                          </svg>
                                        )}
                                        <span style={{ fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: soon ? 'var(--rd)' : 'var(--gd)' }}>
                                          {fmtDate(pay.next_due_date)}
                                        </span>
                                      </div>
                                    ) : null}
                                  </td>
                                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 9, fontWeight: 700, color: 'var(--t2)' }}>
                                    {pay.notes || ''}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                      <button
                                        className="CP-act CP-act-edit"
                                        style={{ padding: '4px 8px' }}
                                        onClick={() => handleEditPay(pay)}
                                        title="Edit Payment"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                          <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                                          <path d="M3 21h18" />
                                        </svg>
                                      </button>
                                      <button
                                        className="CP-act CP-act-del"
                                        style={{ padding: '4px 8px' }}
                                        onClick={() => handleDeletePay(pay.id)}
                                        title="Delete Payment"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        {/* Tbody End */}

                        {!loadingPays && payments.length > 0 && (
                          <tfoot>
                            <tr>
                              <td colSpan={3} style={{ textTransform: 'uppercase' }}>
                                Totals ({payments.length})
                              </td>
                              <td className="num">
                                {fmt(totalAmt)}
                              </td>
                              <td className="num">
                                {fmt(totalGst)}
                              </td>
                              <td className="num">
                                {fmt(totalAll)}
                              </td>
                              <td colSpan={4} />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    {/* Pagination Start */}
                    {!loadingPays && payments.length > TX_PAGE_SIZE && (
                      <div className="CP-tx-page-bar">
                        <span className="CP-tx-page-info">
                          Showing {txStart + 1}–{Math.min(txStart + TX_PAGE_SIZE, payments.length)} of {payments.length}
                        </span>
                        <div className="CP-tx-page-btns">
                          <button type="button" className="CP-tx-page-btn" disabled={txPageClamped === 0}
                            onClick={() => setTxPage(p => Math.max(0, p - 1))}>
                            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic n="arrow" s={10} /></span> Prev
                          </button>
                          <span className="CP-tx-page-num">{txPageClamped + 1} / {txTotalPages}</span>
                          <button type="button" className="CP-tx-page-btn" disabled={txPageClamped >= txTotalPages - 1}
                            onClick={() => setTxPage(p => Math.min(txTotalPages - 1, p + 1))}>
                            Next <Ic n="arrow" s={10} c="currentColor" />
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Pagination End */}

                    {/* Summary Cards Start */}
                    {!loadingPays && payments.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
                        {[
                          { lbl: 'Total Transactions', val: String(payments.length), color: 'var(--jade)', bg: 'var(--jade-t)', bd: 'var(--jade-r)', icon: 'tx' },
                          { lbl: 'Average Payment', val: fmt(payments.reduce((s, p) => s + p.amount, 0) / payments.length), color: 'var(--gold)', bg: 'var(--gold-t)', bd: 'var(--gold-r)', icon: 'wallet' },
                          { lbl: 'Outstanding Balance', val: fmt(project.balance), color: 'var(--rd)', bg: 'var(--rd-t)', bd: 'var(--rd-r)', icon: 'chart' },
                        ].map(c => (
                          <div key={c.lbl} className="CP-tx-sumcard" style={{ background: c.bg, border: `1.5px solid ${c.bd}` }}>
                            <div className="CP-tx-sumcard-top" style={{ background: c.color }} />
                            <div className="CP-tx-sumcard-row">
                              <div className="CP-tx-sumcard-ic" style={{ background: '#faf9f7', border: `1.5px solid ${c.bd}`, color: c.color }}>
                                <Ic n={c.icon} s={13} c={c.color} />
                              </div>
                              <div>
                                <div className="CP-tx-sumcard-lbl" style={{ color: '#231C14' }}>{c.lbl}</div>
                                <div className="CP-tx-sumcard-val" style={{ color: c.color }}>{c.val}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Summary Cards End */}
                  </>
                )}
              </div>
            )}
            {/* ── COLLECT TAB ── */}

            {/* ── BUDGET TAB START ── */}
            {tab === 'budget' && (
              <div>
                <div className="CP-bstripe">
                  {[
                    { lbl: 'Original Budget', val: fmt(project.total_budget), color: 'var(--gold)' },
                    { lbl: 'Total Collected', val: fmt(project.total_collected), color: 'var(--jade)' },
                    { lbl: 'Remaining Balance', val: fmt(project.balance), color: 'var(--rd)' },
                  ].map(s => (
                    <div key={s.lbl}><div className="CP-bs-lbl">{s.lbl}</div><div className="CP-bs-val" style={{ color: s.color }}>{s.val}</div></div>
                  ))}
                </div>

                {/* Form Start */}
                <form onSubmit={handleBudget}>
                  <div className="CP-modal-divider"><span className="CP-modal-div-tag gold">Budget Addition</span><div className="CP-modal-div-line" /></div>

                  {/* Extra Amount Start */}
                  <div className="CP-g2">
                    <div className="CP-field">
                      <label className="CP-label">Extra Amount (₹) <span className="req">*</span></label>
                      <input className="CP-input" type="number" min="1" step="0.01" value={budgetAmt} onChange={e => setBudgetAmt(e.target.value)} placeholder="e.g. 150000" required autoFocus />
                    </div>
                    <div className="CP-field">
                      <label className="CP-label"><Ic n="cal" s={10} /> Date Added <span className="req">*</span></label>
                      <CalendarDD value={budgetDate} onChange={setBudgetDate} />
                    </div>
                  </div>
                  {/* Extra Amount End */}

                  {/* Reason Start */}
                  <div className="CP-field" style={{ marginTop: 10 }}>
                    <label className="CP-label">Reason / Notes <span className="opt">(opt)</span></label>
                    <input className="CP-input" type="text" value={budgetReason} onChange={e => setBudgetReason(e.target.value)} placeholder="e.g. Scope change, extra flooring…" />
                  </div>
                  {/* Reason End */}

                  {/* Reason End */}
                  {parseFloat(budgetAmt) > 0 && (
                    <div className="CP-preview gold" style={{ marginTop: 14, gap: 14 }}>
                      <Ic n="arrow" s={14} c="var(--gold)" />
                      <div><div className="CP-preview-lbl">New Total Budget</div><div className="CP-preview-val" style={{ color: 'var(--gold)' }}>{fmt(budgetNew)}</div></div>
                    </div>
                  )}
                  {/* Reason End */}

                  {/* Button Start */}
                  <div className="CP-modal-actions">
                    <button type="submit" className="CP-btn-primary" disabled={budgetSaving}
                      style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold2))', boxShadow: '0 4px 16px var(--gold-g)' }}>
                      {budgetSaving ? <><span className="CP-spinner" />Saving…</> : editBudgetId ? '✓ Update Budget Entry' : '✓ Confirm Budget Addition'}
                    </button>
                    {editBudgetId && (
                      <button type="button" className="CP-btn-ghost" onClick={() => { setEditBudgetId(null); setBudgetAmt(''); setBudgetReason(''); setBudgetDate(new Date().toISOString().split('T')[0]); }}>Clear</button>
                    )}
                    <button type="button" className="CP-btn-ghost" onClick={onClose}>Cancel</button>
                  </div>
                  {/* Button End */}

                </form>
                {/* Form End */}

                {/* Budget History Start */}
                <div className="CP-modal-divider" style={{ marginTop: 24 }}>
                  <span className="CP-modal-div-tag iris">Budget History ({budgetHistory.length})</span>
                  <div className="CP-modal-div-line" />
                </div>
                {/* Budget History End */}

                {budgetHistory.length === 0
                  ? <div style={{ padding: '18px 0', textAlign: 'center', fontSize: 10.5, color: 'var(--t4)', fontStyle: 'italic' }}>No budget additions yet.</div>
                  : (
                    <>
                      <div className="CP-bud-tbl-wrap" style={{ marginTop: 8 }}>
                        <table className="CP-bud-tbl" style={{ minWidth: 520, width: '100%' }}>
                          <thead>
                            <tr style={{ background: 'linear-gradient(135deg,#F8F5EC,#F3EDD8)' }}>
                              <th style={{ width: 44, textAlign: 'center' }}>S.No</th>
                              <th style={{ width: 110 }}>Date Added</th>
                              <th className="num" style={{ width: 130 }}>Extra Amount</th>
                              <th>Reason / Notes</th>
                              <th style={{ width: 110 }}>Recorded On</th>
                              <th style={{ width: 70, textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {budgetVisible.map((b, i) => (
                              <tr key={b.id} style={{ animationDelay: `${i * 35}ms` }}>
                                <td style={{ fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--t1)', textAlign: 'center' }}>{budgetStart + i + 1}</td>
                                <td><span style={{ fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 800, color: 'var(--t1)' }}>{fmtDate(b.date_added)}</span></td>
                                <td className="num" style={{ color: 'var(--gold)', fontFamily: 'var(--ff-m)', fontWeight: 800, fontSize: 9 }}>{fmt(b.extra_amount)}</td>
                                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 9, fontWeight: 600, color: 'var(--t2)' }}>{b.reason || <span style={{ color: 'var(--t4)', fontStyle: 'italic' }}>—</span>}</td>
                                <td style={{ fontFamily: 'var(--ff-m)', fontSize: 9, fontWeight: 700, color: 'var(--t3)' }}>{fmtDate(b.created_at)}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                    <button type="button" className="CP-act CP-act-edit" style={{ padding: '4px 8px' }} title="Edit Budget Entry" onClick={() => handleEditBudget(b)}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 3l4 4-7 7H10v-4l7-7z" /><path d="M3 21h18" /></svg>
                                    </button>
                                    <button type="button" className="CP-act CP-act-del" style={{ padding: '4px 8px' }} title="Delete Budget Entry" onClick={() => handleDeleteBudget(b.id)}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3" /></svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={2} style={{ fontFamily: 'var(--ff-m)', fontSize: 8.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#231C14' }}>Total Added ({budgetHistory.length})</td>
                              <td className="num" style={{ color: 'var(--gold)', fontSize: 9, fontWeight: 800 }}>{fmt(totalBudgetAdded)}</td>
                              <td colSpan={3} />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      {budgetHistory.length > BUDGET_PAGE_SIZE && (
                        <div className="CP-tx-page-bar">
                          <span className="CP-tx-page-info">
                            Showing {budgetStart + 1}–{Math.min(budgetStart + BUDGET_PAGE_SIZE, budgetHistory.length)} of {budgetHistory.length}
                          </span>
                          <div className="CP-tx-page-btns">
                            <button type="button" className="CP-tx-page-btn" disabled={budgetPageClamped === 0}
                              onClick={() => setBudgetPage(p => Math.max(0, p - 1))}>
                              <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic n="arrow" s={10} /></span> Prev
                            </button>
                            <span className="CP-tx-page-num">{budgetPageClamped + 1} / {budgetTotalPages}</span>
                            <button type="button" className="CP-tx-page-btn" disabled={budgetPageClamped >= budgetTotalPages - 1}
                              onClick={() => setBudgetPage(p => Math.min(budgetTotalPages - 1, p + 1))}>
                              Next <Ic n="arrow" s={10} c="currentColor" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </div>
            )}
            {/* ── BUDGET TAB ── */}

          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        open={deleteModal.open}
        itemName="this payment"
        description="This payment will be moved to the Recycle Bin."
        onConfirm={confirmDeletePay}
        onCancel={() => setDeleteModal({ open: false, id: 0, loading: false })}
        loading={deleteModal.loading}
      />
      <ConfirmDeleteModal
        open={deleteBudgetModal.open}
        itemName="this budget entry"
        description="This budget entry will be moved to the Recycle Bin, and the project's total budget will be reduced accordingly."
        onConfirm={confirmDeleteBudget}
        onCancel={() => setDeleteBudgetModal({ open: false, id: 0, loading: false })}
        loading={deleteBudgetModal.loading}
      />
    </Portal>
  );
}

/* ═══════════════════════════════════════
   EDIT PROJECT MODAL
═══════════════════════════════════════════ */
function EditProjectModal({ clientId, project, subNames, onClose, onSaved }: {
  clientId: number; project: Project; subNames: string[];
  onClose: () => void; onSaved: () => void;
}) {
  const [pf, setPf] = useState({
    project_name: project.project_name || '',
    project_type: project.project_type,
    start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
    total_budget: String(project.total_budget),
    type_notes: project.type_notes || '',
    status: project.status,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pf.start_date) { setMsg('Start Date is required'); toast.warning('Start Date Required', 'Please select a project start date.'); return; }
    if (!pf.total_budget || parseFloat(pf.total_budget) <= 0) { setMsg('Valid Budget is required'); toast.warning('Budget Required', 'Please enter a valid budget amount.'); return; }
    setSaving(true); setMsg('');
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/api/client-portal/clients/${clientId}/projects/${project.id}`,
        { ...pf, project_name: pf.project_name || '', total_budget: parseFloat(pf.total_budget) },
        { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Saved!'); toast.success('Project Updated!', 'Project details saved successfully'); onSaved(); setTimeout(() => onClose(), 600);
    } catch (err: any) { setMsg(err.response?.data?.message || 'Failed'); toast.error('Save Failed', err.response?.data?.message || 'Could not save project'); }
    finally { setSaving(false); }
  };

  return (
    <Portal>
      <div className="CP-root CP-fp-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="CP-fp-modal">
          <div className="CP-modal-top" style={{ background: 'linear-gradient(90deg,var(--gd),var(--or3))' }} />
          <div className="CP-modal-body">
            <div className="CP-modal-hdr">
              <div className="CP-modal-hdr-l">
                <div className="CP-modal-ttl-ico" style={{ background: 'var(--gd-t)', border: '1.5px solid var(--gd-r)' }}><Ic n="bldg" s={18} c="var(--gd)" /></div>
                <div><div className="CP-modal-ttl">Edit Project</div><div className="CP-modal-sub">{project.project_name || 'Unnamed Project'}</div></div>
              </div>
              <button className="CP-fp-close" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" s={18} /></button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="CP-field" style={{ marginBottom: 12 }}>
                <label className="CP-label">Project Name <span className="opt">(optional)</span></label>
                <SubDD subs={subNames} val={pf.project_name} onChange={v => setPf(p => ({ ...p, project_name: v }))} placeholder="Enter project name…" />
              </div>
              <div className="CP-g2">
                <div className="CP-field"><label className="CP-label">Type <span className="req">*</span></label><DD opts={TYPE_OPTS} val={pf.project_type} onChange={v => setPf(p => ({ ...p, project_type: v }))} placeholder="Select" /></div>
                <div className="CP-field"><label className="CP-label">Status <span className="req">*</span></label><DD opts={STATUS_OPTS} val={pf.status} onChange={v => setPf(p => ({ ...p, status: v }))} placeholder="Select" /></div>
              </div>
              <div className="CP-g2" style={{ marginTop: 10 }}>
                <div className="CP-field"><label className="CP-label">Start Date <span className="req">*</span></label><CalendarDD value={pf.start_date} onChange={v => setPf(p => ({ ...p, start_date: v }))} /></div>
                <div className="CP-field"><label className="CP-label">Budget (₹) <span className="req">*</span></label><input className="CP-input" type="number" value={pf.total_budget} onChange={e => setPf(p => ({ ...p, total_budget: e.target.value }))} required min="0" step="0.01" /></div>
              </div>
              <div className="CP-field" style={{ marginTop: 10 }}>
                <label className="CP-label">Notes <span className="opt">(opt)</span></label>
                <input className="CP-input" value={pf.type_notes} onChange={e => setPf(p => ({ ...p, type_notes: e.target.value }))} />
              </div>
              <div className="CP-modal-actions">
                <button type="submit" className="CP-btn-primary" disabled={saving}
                  style={{ background: 'linear-gradient(135deg,var(--gd),var(--or2))' }}>
                  {saving ? <><span className="CP-spinner" />Saving…</> : '✓ Update Project'}
                </button>
                <button type="button" className="CP-btn-ghost" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ═══════════════════════════════════════════
   ADD PROJECT MODAL
═══════════════════════════════════════════ */
function AddProjectModal({ clientId, clientName, subNames, onClose, onSaved }: {
  clientId: number; clientName: string; subNames: string[];
  onClose: () => void; onSaved: () => void;
}) {
  // Pre-fill with the client's own name — most projects here are just named
  // after the client they belong to, and the user can still edit/clear it.
  const [pf, setPf] = useState({ project_name: clientName || '', project_type: 'construction', start_date: '', total_budget: '', type_notes: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pf.start_date) { setMsg('Start Date is required'); toast.warning('Start Date Required', 'Please select a project start date.'); return; }
    if (!pf.total_budget || parseFloat(pf.total_budget) <= 0) { setMsg('Valid Budget is required'); toast.warning('Budget Required', 'Please enter a valid budget amount.'); return; }
    setSaving(true); setMsg('');
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(`/api/client-portal/clients/${clientId}/projects`,
        { ...pf, project_name: pf.project_name.trim() || null, total_budget: parseFloat(pf.total_budget) },
        { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Project saved!'); toast.success('Project Created!', 'New project added successfully'); onSaved(); setTimeout(() => onClose(), 700);
    } catch (err: any) { setMsg(err.response?.data?.message || 'Failed'); toast.error('Save Failed', err.response?.data?.message || 'Could not create project'); }
    finally { setSaving(false); }
  };

  return (
    <Portal>
      <div className="CP-root CP-fp-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="CP-fp-modal">
          <div className="CP-modal-top" style={{ background: 'linear-gradient(90deg,var(--gd),var(--or3))' }} />
          <div className="CP-modal-body">

            {/* Add Project Start */}
            <div className="CP-modal-hdr">
              <div className="CP-modal-hdr-l">
                <div className="CP-modal-ttl-ico" style={{ background: 'var(--gd-t)', border: '1.5px solid var(--gd-r)' }}><Ic n="bldg" s={18} c="var(--gd)" /></div>
                <div><div className="CP-modal-ttl">Add Project</div><div className="CP-modal-sub">for <span style={{ color: 'var(--gd)', fontWeight: 800 }}>{clientName}</span></div></div>
              </div>
              <button className="CP-fp-close" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" s={18} /></button>
            </div>
            {/* Add Project End */}

            {/* Form Start */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="CP-field" style={{ marginBottom: 12 }}>
                <label className="CP-label">Project Name <span className="opt">{subNames.length > 0 ? `${subNames.length} from BioData` : 'enter manually'}</span></label>
                <SubDD subs={subNames} val={pf.project_name} onChange={v => setPf(p => ({ ...p, project_name: v }))} placeholder="Enter project name (optional)…" />
              </div>
              <div className="CP-g2">
                <div className="CP-field"><label className="CP-label">Type <span className="req">*</span></label><DD opts={TYPE_OPTS} val={pf.project_type} onChange={v => setPf(p => ({ ...p, project_type: v }))} placeholder="Type" /></div>
                <div className="CP-field"><label className="CP-label">Status <span className="req">*</span></label><DD opts={STATUS_OPTS} val={pf.status} onChange={v => setPf(p => ({ ...p, status: v }))} placeholder="Status" /></div>
              </div>
              <div className="CP-g2" style={{ marginTop: 10 }}>
                <div className="CP-field"><label className="CP-label">Start Date <span className="req">*</span></label><CalendarDD value={pf.start_date} onChange={v => setPf(p => ({ ...p, start_date: v }))} /></div>
                <div className="CP-field"><label className="CP-label">Budget (₹) <span className="req">*</span></label><input className="CP-input" type="number" value={pf.total_budget} onChange={e => setPf(p => ({ ...p, total_budget: e.target.value }))} required min="0" step="0.01" placeholder="e.g. 2500000" /></div>
              </div>
              <div className="CP-field" style={{ marginTop: 10 }}>
                <label className="CP-label">Notes <span className="opt">(opt)</span></label>
                <input className="CP-input" value={pf.type_notes} onChange={e => setPf(p => ({ ...p, type_notes: e.target.value }))} placeholder="Additional notes…" />
              </div>
              {parseFloat(pf.total_budget) > 0 && (
                <div className="CP-preview gold" style={{ marginTop: 12, gap: 14 }}>
                  <Ic n="info" s={13} c="var(--gold)" />
                  <div><div className="CP-preview-lbl">Initial Budget</div><div className="CP-preview-val" style={{ color: 'var(--gold)' }}>{fmt(parseFloat(pf.total_budget))}</div></div>
                </div>
              )}
              <p className="CP-req-note"><span style={{ color: 'var(--rd)' }}>*</span> Required: Start Date & Budget</p>
              <div className="CP-modal-actions">
                <button type="submit" className="CP-btn-primary" disabled={saving}
                  style={{ background: 'linear-gradient(135deg,var(--gd),var(--or2))' }}>
                  {saving ? <><span className="CP-spinner" />Saving…</> : '✓ Save Project'}
                </button>
                <button type="button" className="CP-btn-ghost" onClick={onClose}>Cancel</button>
              </div>
            </form>
            {/* Form End */}

          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ═══════════════════════════════════════════
   ADD / EDIT CLIENT MODAL
═══════════════════════════════════════════ */
function ClientModal({ mode, editClient, bioRecords, existingClientNames, namesLoading, onClose, onSaved }: {
  mode: 'add' | 'edit'; editClient?: Client;
  bioRecords: BioRecord[]; existingClientNames: string[];
  namesLoading: boolean; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = mode === 'edit' && !!editClient;
  const [step, setStep] = useState(0);
  const [selectedBio, setSelectedBio] = useState<BioRecord | null>(() =>
    isEdit && editClient ? findBioByName(filterIncomeBio(bioRecords), editClient.name) || null : null
  );
  useEffect(() => {
    if (isEdit && editClient && !selectedBio && bioRecords.length > 0) {
      const m = findBioByName(filterIncomeBio(bioRecords), editClient.name);
      if (m) setSelectedBio(m);
    }
  }, [bioRecords]);

  const [cf, setCf] = useState({ name: editClient?.name || '', id_number: editClient?.id_number || '', notes: editClient?.notes || '' });
  const [pf, setPf] = useState({ project_name: '', project_type: 'construction', start_date: '', total_budget: '', type_notes: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [dupModal, setDupModal] = useState<{ open: boolean; pendingStep: 'next' | 'finalSave' | 'skip' | null }>({ open: false, pendingStep: null });
  const [savedClientId, setSavedClientId] = useState<number | null>(editClient?.id || null);
  const subNames = getSubNames(selectedBio || (isEdit ? findBioByName(filterIncomeBio(bioRecords), editClient!.name) : null));
  const availableBio = filterAvailableBio(bioRecords, existingClientNames, isEdit ? editClient!.name : undefined);

  const handleClientNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cf.name.trim() || !cf.id_number.trim()) { setMsg('Client name and ID are required'); toast.warning('Required Fields', 'Client name and ID number are required.'); return; }
    if (!isEdit) {
      const norm = cf.name.trim().toLowerCase();
      const dup = existingClientNames.find(n => n.trim().toLowerCase() === norm);
      if (dup) {
        setDupModal({ open: true, pendingStep: 'next' });
        return;
      }
    }
    if (isEdit) {
      setSaving(true); setMsg('');
      try {
        const token = localStorage.getItem('token');
        await axiosInstance.put(`/api/client-portal/clients/${editClient!.id}`, cf, { headers: { Authorization: `Bearer ${token}` } });
        setMsg('Client updated!'); toast.success('Client Updated!', `"${cf.name}" saved successfully`); onSaved(); setTimeout(() => onClose(), 600);
      } catch (err: any) { setMsg(err.response?.data?.message || 'Failed'); toast.error('Save Failed', err.response?.data?.message || 'Could not update client'); }
      finally { setSaving(false); }
      return;
    }
    setMsg(''); setStep(1);
  };

  const handleFinalSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const token = localStorage.getItem('token'); const h = { Authorization: `Bearer ${token}` };
      let clientId = savedClientId;
      if (!clientId) {
        const cr = await axiosInstance.post('client-portal/clients', cf, { headers: h });
        clientId = cr.data.data?.id || cr.data.id;
        setSavedClientId(clientId);
      }
      if (pf.start_date && pf.total_budget) {
        await axiosInstance.post(`/api/client-portal/clients/${clientId}/projects`,
          { ...pf, project_name: pf.project_name || '', total_budget: parseFloat(pf.total_budget) },
          { headers: h });
      }
      setMsg('Saved!'); toast.success('Client Saved!', `"${cf.name}" registered successfully`); onSaved(); setTimeout(() => onClose(), 700);
    } catch (err: any) { setMsg(err.response?.data?.message || 'Save failed'); toast.error('Save Failed', err.response?.data?.message || 'Could not save client'); }
    finally { setSaving(false); }
  };

  const handleSkipProject = async () => {
    if (!cf.name.trim() || !cf.id_number.trim()) { setMsg('Required fields missing'); toast.warning('Required Fields', 'Client name and ID number are required.'); return; }
    setSaving(true); setMsg('');
    try {
      const token = localStorage.getItem('token');
      const cr = await axiosInstance.post('client-portal/clients', cf, { headers: { Authorization: `Bearer ${token}` } });
      setSavedClientId(cr.data.data?.id || cr.data.id);
      setMsg('Client saved!'); onSaved(); setTimeout(() => onClose(), 600);
    } catch (err: any) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Portal>
        <div className="CP-root CP-fp-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <div className="CP-fp-modal">
            <div className="CP-modal-top" style={{ background: 'linear-gradient(90deg,#231C14,var(--gd) 60%,var(--or3))' }} />
            <div className="CP-modal-body">
              <div className="CP-modal-hdr">
                <div className="CP-modal-hdr-l">
                  <div className="CP-modal-ttl-ico" style={{ background: 'var(--gd-t)', border: '1.5px solid var(--gd-r)' }}><Ic n={isEdit ? 'edit' : 'user'} s={18} c="var(--gd)" /></div>
                  <div><div className="CP-modal-ttl">{isEdit ? 'Edit Client' : 'Add Client'}</div><div className="CP-modal-sub">{isEdit ? `Editing: ${editClient!.name}` : 'Fill client info, optionally add first project'}</div></div>
                </div>
                <button className="CP-fp-close" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" s={18} /></button>
              </div>

              {!isEdit && (
                <div className="CP-wizard">
                  <button type="button" className={`CP-wtab${step === 0 ? ' active' : ' done'}`} onClick={() => step === 1 && setStep(0)}>
                    <div className="CP-wnum">{step > 0 ? '✓' : '1'}</div><span>Client Info</span>
                  </button>
                  <button type="button" className={`CP-wtab${step === 1 ? ' active' : ''}`}>
                    <div className="CP-wnum">2</div><span>Project Info</span>
                  </button>
                </div>
              )}

              {(step === 0 || isEdit) && (
                <form onSubmit={handleClientNext} noValidate>
                  <div className="CP-modal-divider"><span className="CP-modal-div-tag jade">01 — Identity</span><div className="CP-modal-div-line" /></div>
                  <div className="CP-field" style={{ marginBottom: 12 }}>
                    <label className="CP-label"><Ic n="user" s={10} /> Client Name <span className="req">*</span></label>
                    <BioDD options={availableBio} value={cf.name} loading={namesLoading}
                      onChange={(name, id, rec) => { setSelectedBio(rec); setCf(p => ({ ...p, name, id_number: id })); setPf(p => ({ ...p, project_name: name })); }} />
                  </div>
                  <div className="CP-field" style={{ marginBottom: 12 }}>
                    <label className="CP-label">ID Number <span className="req">*</span></label>
                    <input className="CP-input" value={cf.id_number} onChange={e => setCf(p => ({ ...p, id_number: e.target.value }))} placeholder="Auto-filled from BioData" />
                  </div>
                  {selectedBio && (
                    <div className="CP-cci">
                      <div className="CP-cci-av">{selectedBio.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{selectedBio.name}</div>
                        <div style={{ fontFamily: 'var(--ff-m)', fontSize: 9, color: 'var(--t4)', marginTop: 2 }}>{selectedBio.id_details}</div>
                        {subNames.length > 0 && <span className="CP-chip CP-type-interior" style={{ marginTop: 5 }}>{subNames.length} project names</span>}
                      </div>
                    </div>
                  )}
                  <div className="CP-modal-divider"><span className="CP-modal-div-tag jade">02 — Description</span><div className="CP-modal-div-line" /></div>
                  <div className="CP-field">
                    <label className="CP-label">Notes <span className="opt">(opt)</span></label>
                    <textarea className="CP-textarea CP-input" value={cf.notes} onChange={e => setCf(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes about this client…" />
                  </div>
                  <p className="CP-req-note"><span style={{ color: 'var(--rd)' }}>*</span> Required fields</p>
                  <div className="CP-modal-actions">
                    {isEdit
                      ? <button type="submit" className="CP-btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg,var(--gd),var(--or2))' }}>{saving ? <><span className="CP-spinner" />Updating…</> : '✓ Update Client'}</button>
                      : <>
                        <button type="submit" className="CP-btn-primary" disabled={saving}>Next: Add Project <Ic n="arrow" s={12} c="#faf9f7" /></button>
                        <button type="button" className="CP-btn-ghost" disabled={saving} onClick={handleSkipProject}>{saving ? <><span className="CP-spinner-or" />…</> : 'Save Client Only'}</button>
                      </>}
                    <button type="button" className="CP-btn-ghost" onClick={onClose}>Cancel</button>
                  </div>
                </form>
              )}

              {step === 1 && !isEdit && (
                <form onSubmit={handleFinalSave} noValidate>
                  <div className="CP-cci" style={{ marginBottom: 18 }}>
                    <div className="CP-cci-av">{cf.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 8, fontFamily: 'var(--ff-m)', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Adding project for</div>
                      <div style={{ fontWeight: 800, fontSize: 12.5 }}>{cf.name}</div>
                      <div style={{ fontFamily: 'var(--ff-m)', fontSize: 9, color: 'var(--t4)' }}>{cf.id_number}</div>
                    </div>
                  </div>
                  <div className="CP-modal-divider"><span className="CP-modal-div-tag jade">01 — Project Info</span><div className="CP-modal-div-line" /></div>
                  <div className="CP-field" style={{ marginBottom: 12 }}>
                    <label className="CP-label">Project Name <span className="opt">{subNames.length > 0 ? `${subNames.length} from BioData` : 'enter manually'}</span></label>
                    <SubDD subs={subNames} val={pf.project_name} onChange={v => setPf(p => ({ ...p, project_name: v }))} placeholder="Enter project name…" />
                  </div>
                  <div className="CP-g2">
                    <div className="CP-field"><label className="CP-label">Type <span className="req">*</span></label><DD opts={TYPE_OPTS} val={pf.project_type} onChange={v => setPf(p => ({ ...p, project_type: v }))} placeholder="Select type" /></div>
                    <div className="CP-field"><label className="CP-label">Status <span className="req">*</span></label><DD opts={STATUS_OPTS} val={pf.status} onChange={v => setPf(p => ({ ...p, status: v }))} placeholder="Select status" /></div>
                  </div>
                  <div className="CP-modal-divider" style={{ marginTop: 18 }}><span className="CP-modal-div-tag jade">02 — Budget & Timeline</span><div className="CP-modal-div-line" /></div>
                  <div className="CP-g2">
                    <div className="CP-field"><label className="CP-label"><Ic n="cal" s={10} /> Start Date <span className="req">*</span></label><CalendarDD value={pf.start_date} onChange={v => setPf(p => ({ ...p, start_date: v }))} /></div>
                    <div className="CP-field"><label className="CP-label">Budget (₹) <span className="req">*</span></label><input className="CP-input" type="number" value={pf.total_budget} onChange={e => setPf(p => ({ ...p, total_budget: e.target.value }))} min="0" step="0.01" placeholder="e.g. 2500000" required /></div>
                  </div>
                  <div className="CP-field" style={{ marginTop: 10 }}>
                    <label className="CP-label">Notes <span className="opt">(opt)</span></label>
                    <input className="CP-input" value={pf.type_notes} onChange={e => setPf(p => ({ ...p, type_notes: e.target.value }))} placeholder="Extra notes…" />
                  </div>
                  {parseFloat(pf.total_budget) > 0 && (
                    <div className="CP-preview gold" style={{ marginTop: 12, gap: 14 }}>
                      <Ic n="info" s={13} c="var(--gold)" />
                      <div><div className="CP-preview-lbl">Initial Budget</div><div className="CP-preview-val" style={{ color: 'var(--gold)' }}>{fmt(parseFloat(pf.total_budget))}</div></div>
                    </div>
                  )}
                  <p className="CP-req-note"><span style={{ color: 'var(--rd)' }}>*</span> Required</p>
                  <div className="CP-modal-actions">
                    <button type="submit" className="CP-btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg,var(--gd),var(--or2))' }}>{saving ? <><span className="CP-spinner" />Saving…</> : '✓ Save Client & Project'}</button>
                    <button type="button" className="CP-btn-ghost" disabled={saving} onClick={handleSkipProject}>Save Client Only</button>
                    <button type="button" className="CP-btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Portal>
      <DuplicateWarningModal
        open={dupModal.open}
        entityName="Client"
        duplicateFields={[{ label: 'Name', value: cf.name }]}
        onAddAnyway={() => {
          setDupModal({ open: false, pendingStep: null });
          setStep(1);
        }}
        onCancel={() => setDupModal({ open: false, pendingStep: null })}
        loading={saving}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   PROJECT ROW  (with full wired modals)
═══════════════════════════════════════════ */
function ProjectRow({ clientId, project: init, seqNum, subNames, onRefresh, panelCard }: {
  clientId: number; project: Project; seqNum: number;
  subNames: string[]; onRefresh: () => void; panelCard?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(init);
  const [payModal, setPayModal] = useState<'collect' | 'budget' | null>(null);
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistory[]>([]);
  const [budgetHistFetched, setBudgetHistFetched] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: number; name: string; loading: boolean }>({ open: false, type: '', id: 0, name: '', loading: false });
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingBudget, setEditingBudget] = useState<BudgetHistory | null>(null);
  useEffect(() => { setProject(init); }, [init]);
  useEffect(() => { if (open && panelCard) { fetchBudgetHistory(); } }, [open, panelCard]);

  const refreshProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/client-portal/clients/${clientId}/projects/${project.id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setProject(res.data.data);
      if (res.data.data.payments) setBudgetHistory(bh => bh);
      onRefresh();
    } catch (e) { console.error(e); }
  };

  const fetchBudgetHistory = async () => {
    if (budgetHistFetched) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/client-portal/clients/${clientId}/projects/${project.id}/budget-history`,
        { headers: { Authorization: `Bearer ${token}` } });
      setBudgetHistory(asArray(res.data.data ?? res.data));
      setBudgetHistFetched(true);
    } catch (e) { setBudgetHistFetched(true); }
  };

  const refetchBudgetHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/client-portal/clients/${clientId}/projects/${project.id}/budget-history`,
        { headers: { Authorization: `Bearer ${token}` } });
      setBudgetHistory(asArray(res.data.data ?? res.data));
      setBudgetHistFetched(true);
    } catch (e) { /* keep existing list on failure */ }
  };

  const handleDeleteProject = () => {
    setDeleteModal({ open: true, type: 'project', id: project.id, name: project.project_name, loading: false });
  };

  const confirmDeleteProject = async () => {
    const { type, id } = deleteModal;
    setDeleteModal(d => ({ ...d, loading: true }));
    try {
      const token = localStorage.getItem('token');
      const h = { headers: { Authorization: `Bearer ${token}` } };
      if (type === 'project') {
        await axiosInstance.delete(`/api/client-portal/clients/${clientId}/projects/${id}`, h);
        onRefresh();
      } else if (type === 'payment') {
        await axiosInstance.delete(`/api/client-portal/payments/${id}`, h);
        refreshProject();
      } else if (type === 'budget_history') {
        await axiosInstance.delete(`/api/client-portal/budget-history/${id}`, h);
        setBudgetHistory(bh => bh.filter(x => x.id !== id));
        refreshProject();
      }
    } catch (err: any) { toast.error('Delete Failed', err.response?.data?.message || 'Could not delete the item.'); }
    finally { setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false }); }
  };

  const pct = project.total_budget > 0
    ? Math.round((project.total_collected / project.total_budget) * 100) : 0;

  const balPct = project.total_budget > 0
    ? Math.round((project.total_collected / project.total_budget) * 100) : 0;
  const isPaid = project.balance <= 0;
  const statusKey = (project.status || 'active') as string;
  const fmtInr = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  /* ── PANEL CARD (CM3-bc style) ── */
  if (panelCard) return (
    <>
      <div className="CP-pjcard" style={{ animationDelay: `${seqNum * 40}ms` }}>

        {/* LEFT: seq + folder Icon Start */}
        <div className="CP-pjcard-left">
          <div className="CP-pjcard-num">{String(seqNum).padStart(2, '0')}</div>
          <div className="CP-pjcard-icon">
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={2.5} strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
          </div>
        </div>
        {/* Left: seq + folder Icon End */}

        {/* CENTER: name, chips, progress */}
        <div className="CP-pjcard-body" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
          <div className="CP-pjcard-title">{project.project_name || 'Unnamed Project'}</div>
          <div className="CP-pjcard-meta">
            <span className="CP-pjcard-chip CP-pjcard-chip-type">
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
              {project.type_label}
            </span>
            <span className={`CP-pjcard-chip CP-pjcard-chip-status-${statusKey}`}>
              {statusKey === 'active'
                ? <svg width={6} height={6} viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3" /></svg>
                : statusKey === 'completed'
                  ? <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                  : <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" /></svg>}
              {project.status_label}
            </span>
            <span className="CP-pjcard-date">
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {project.start_date ? new Date(project.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
            </span>
          </div>
          <div className="CP-pjcard-prog-row">
            <span className="CP-pjcard-prog-pct">{balPct}%</span>
            <div className="CP-pjcard-mini-bar">
              <div className="CP-pjcard-mini-fill" style={{ width: `${balPct}%` }} />
            </div>
          </div>
        </div>
        {/* Center: Name*/}

        {/* RIGHT: balance Start */}
        <div className="CP-pjcard-right">
          <div className={`CP-pjcard-amt ${isPaid ? 'grn' : 'red'}`}>
            {isPaid ? fmtInr(project.total_budget) : fmtInr(project.balance)}
          </div>
          <span className={`CP-pjcard-status ${isPaid ? 'done' : 'open'}`}>
            {isPaid ? '✓ SETTLED' : '⚡ BALANCE'}
          </span>
          <div className="CP-pjcard-bal-row">
            <span className="CP-pjcard-bal-lbl">{fmtInr(project.total_collected)} paid</span>
            <span className="CP-pjcard-bal-lbl">/ {fmtInr(project.total_budget)}</span>
          </div>
        </div>
        {/* Balance End */}

        {/* ACTIONS — Labeled Start */}
        <div className="CP-pjcard-acts">
          <button className="CP-pjcard-act pay" onClick={() => setPayModal('collect')}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            Pay
          </button>
          <button className="CP-pjcard-act bgt" onClick={() => setPayModal('budget')}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            Budget
          </button>
          <button className="CP-pjcard-act edt" onClick={() => setEditModal(true)}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit
          </button>
          <button className="CP-pjcard-act del" onClick={handleDeleteProject}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
            Del
          </button>
        </div>
        {/* Actions - Labeled End */}
      </div>

      {/* Expand: 3D ring + 2-col payments + budget history */}
      {open && (
        <div style={{ marginBottom: 8, borderRadius: 12, border: '1.5px solid var(--border,#E8E2D8)', overflow: 'hidden', animation: 'CP-slideDown .28s cubic-bezier(0.4,0,0.2,1) both', background: '#F5F3EF' }}>

          {/* ── COLLECTION PROGRESS PANEL ── */}
          <div className="CP-prog-panel">
            <div className="CP-prog-hdr">
              <div className="CP-prog-hdr-left">
                <span className="CP-prog-hdr-icon">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </span>
                Collection Progress
              </div>
              <span className={`CP-prog-hdr-badge${balPct >= 75 ? ' good' : balPct >= 40 ? ' mid' : ' low'}`}>
                {balPct >= 75 ? 'On Track' : balPct >= 40 ? 'In Progress' : 'Needs Attention'}
              </span>
            </div>
            <div className="CP-prog-body">

              {/* Animated donut ring */}
              <div className="CP-prog-ring-wrap">
                <svg viewBox="0 0 140 140" className="CP-prog-svg">
                  <defs>
                    <linearGradient id={`cg-${project.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C2410C" />
                      <stop offset="50%" stopColor="#C2410C" />
                      <stop offset="100%" stopColor="#F0834D" />
                    </linearGradient>
                    <filter id={`cglow-${project.id}`}>
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* Outer glow ring */}
                  <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(194,65,12,0.08)" strokeWidth="1.5" />
                  {/* Track */}
                  <circle cx="70" cy="70" r="52" fill="none" stroke="#E8E2D8" strokeWidth="14" strokeLinecap="round" />
                  {/* Progress arc */}
                  <circle
                    cx="70" cy="70" r="52"
                    fill="none"
                    stroke={`url(#cg-${project.id})`}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52 * balPct / 100} ${2 * Math.PI * 52}`}
                    strokeDashoffset={2 * Math.PI * 52 * 0.25}
                    filter={`url(#cglow-${project.id})`}
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                  {/* Inner fill */}
                  <circle cx="70" cy="70" r="44" fill="#FAF9F7" />
                  <circle cx="70" cy="70" r="44" fill="none" stroke="rgba(194,65,12,0.16)" strokeWidth="1" />
                  {/* Center % */}
                  <text x="70" y="63" textAnchor="middle" fontSize="24" fontWeight="900" fontFamily="'Georgia',serif" fill="#C2410C">{balPct}%</text>
                  <text x="70" y="77" textAnchor="middle" fontSize="7.5" fontWeight="800" fontFamily="monospace" fill="#6B5D48" letterSpacing="1.5">COLLECTED</text>
                  <text x="70" y="91" textAnchor="middle" fontSize="8" fontWeight="800" fontFamily="monospace" fill="#9A3412">{fmtInr(project.total_collected)}</text>
                </svg>
              </div>
              {/* Animated Donut ring */}

              {/* Right: 3 elevated KPI cards */}
              <div className="CP-prog-stats">

                {/* Collected Start */}
                <div className="CP-kpi-card collected" style={{ animationDelay: '0.1s' }}>
                  <div className="CP-kpi-top">
                    <span className="CP-kpi-icon collected">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    <span className="CP-kpi-lbl">Collected</span>
                  </div>
                  <div className="CP-kpi-val" style={{ color: '#C2410C' }}>{fmtInr(project.total_collected)}</div>
                  <div className="CP-kpi-bar-track">
                    <div className="CP-kpi-bar-fill" style={{ width: `${balPct}%`, background: 'linear-gradient(90deg,#C2410C,#C2410C,#F0834D)', animationDelay: '0.25s' }} />
                  </div>
                  <div className="CP-kpi-sub">{balPct}% of total budget</div>
                </div>
                {/* Collected End */}

                {/* Pending Start */}
                <div className="CP-kpi-card pending" style={{ animationDelay: '0.2s' }}>
                  <div className="CP-kpi-top">
                    <span className="CP-kpi-icon pending">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#D93B55" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </span>
                    <span className="CP-kpi-lbl">Pending</span>
                  </div>
                  <div className="CP-kpi-val" style={{ color: '#D93B55' }}>{fmtInr(project.balance)}</div>
                  <div className="CP-kpi-bar-track">
                    <div className="CP-kpi-bar-fill" style={{ width: `${Math.max(0, 100 - balPct)}%`, background: 'linear-gradient(90deg,#D93B55,#f87171)', animationDelay: '0.40s' }} />
                  </div>
                  <div className="CP-kpi-sub">{Math.max(0, 100 - balPct)}% still due</div>
                </div>
                {/* Pending End */}

                {/* Total Budget Start */}
                <div className="CP-kpi-card total" style={{ animationDelay: '0.3s' }}>
                  <div className="CP-kpi-top">
                    <span className="CP-kpi-icon total">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9A3412" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                    </span>
                    <span className="CP-kpi-lbl">Total Budget</span>
                  </div>
                  <div className="CP-kpi-val" style={{ color: '#9A3412' }}>{fmtInr(project.total_budget)}</div>
                  <div className="CP-kpi-bar-track">
                    <div className="CP-kpi-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#9A3412,#DB5B1F)', animationDelay: '0.55s' }} />
                  </div>
                  <div className="CP-kpi-sub">{project.total_gst > 0 ? `incl. ${fmtInr(project.total_gst)} GST` : 'Project ceiling'}</div>
                </div>
                {/* Total Budget End */}

              </div>
            </div>
          </div>

          {/* ── RECENT PAYMENTS START ── */}
          <div className="CP-pay-block">
            <div className="CP-pay-block-hdr">Recent Payments</div>
            {project.payments && project.payments.length > 0 ? (() => {
              const PAGE = 5;
              const sorted = [...project.payments].sort((a, b) => {
                const at = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
                if (bt !== at) return bt - at;
                return (b.id || 0) - (a.id || 0);
              });
              const visible = showAllPayments ? sorted : sorted.slice(0, PAGE);
              const remaining = sorted.length - PAGE;
              return (
                <div className="CP-pay-list">
                  {visible.map((pay, pi) => {
                    const dt = pay.payment_date ? new Date(pay.payment_date) : null;
                    const dateStr = dt ? dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                    return (
                      <div key={pay.id} className="CP-pay-row" style={{ animationDelay: `${pi * 45}ms` }}>
                        <span className="CP-pay-mode">{(pay.mode_label || pay.payment_mode).toUpperCase()}</span>
                        <span className="CP-pay-amt">{fmtInr(pay.total_amount)}</span>
                        <span className="CP-pay-date">
                          <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          {dateStr}
                        </span>
                        <div style={{ display: 'flex', gap: 4, marginLeft: 6 }}>
                          <button type="button" className="CP-act CP-act-edit" style={{ padding: '3px 7px' }} title="Edit Payment"
                            onClick={() => { setEditingPayment(pay); setPayModal('collect'); }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 3l4 4-7 7H10v-4l7-7z" /><path d="M3 21h18" /></svg>
                          </button>
                          <button type="button" className="CP-act CP-act-del" style={{ padding: '3px 7px' }} title="Delete Payment"
                            onClick={() => setDeleteModal({ open: true, type: 'payment', id: pay.id, name: `payment of ${fmtInr(pay.total_amount)}`, loading: false })}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {remaining > 0 && (
                    <button type="button" className="CP-pay-more" onClick={() => setShowAllPayments(v => !v)}>
                      {showAllPayments ? 'Show less' : `View all ${sorted.length} payments`}
                      <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: showAllPayments ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })() : (
              <div className="CP-pay-empty">No payments recorded yet</div>
            )}
          </div>
          {/* RECENT PAYMENTS END */}

          {/* BUDGET HISTORY */}
          {budgetHistory.length > 0 && (
            <div className="CP-bgt-hist">
              <div className="CP-bgt-hist-hdr">
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#9A3412" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /><circle cx="12" cy="12" r="10" /></svg>
                Budget Additions
                <span className="CP-bgt-hist-count">{budgetHistory.length}</span>
              </div>
              <div className="CP-bgt-hist-list">
                {budgetHistory.map((bh, bi) => {
                  const bdStr = bh.date_added ? new Date(bh.date_added).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  return (
                    <div key={bh.id} className="CP-bgt-item" style={{ animationDelay: `${bi * 60}ms` }}>
                      <div className="CP-bgt-item-icon">💰</div>
                      <div className="CP-bgt-item-body">
                        <div className="CP-bgt-item-amt">+{fmtInr(bh.extra_amount)}</div>
                        {bh.reason && <div className="CP-bgt-item-reason">{bh.reason}</div>}
                      </div>
                      <div className="CP-bgt-item-date">
                        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        {bdStr}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button type="button" className="CP-act CP-act-edit" style={{ padding: '3px 7px' }} title="Edit Budget Entry"
                          onClick={() => { setEditingBudget(bh); setPayModal('budget'); }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 3l4 4-7 7H10v-4l7-7z" /><path d="M3 21h18" /></svg>
                        </button>
                        <button type="button" className="CP-act CP-act-del" style={{ padding: '3px 7px' }} title="Delete Budget Entry"
                          onClick={() => setDeleteModal({ open: true, type: 'budget_history', id: bh.id, name: `budget addition of ${fmtInr(bh.extra_amount)}`, loading: false })}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4h6v3" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {payModal && (
        <PaymentModal initialTab={payModal} project={project} clientId={clientId}
          initialEditPayment={editingPayment} initialEditBudget={editingBudget}
          onClose={() => { setPayModal(null); setEditingPayment(null); setEditingBudget(null); }}
          onSaved={() => { setPayModal(null); setEditingPayment(null); setEditingBudget(null); refreshProject(); refetchBudgetHistory(); }} />
      )}
      {editModal && <EditProjectModal project={project} clientId={clientId} subNames={subNames} onClose={() => setEditModal(false)} onSaved={() => { setEditModal(false); refreshProject(); }} />}
      <ConfirmDeleteModal open={deleteModal.open} itemName={deleteModal.name}
        description="This will be moved to the Recycle Bin."
        onConfirm={confirmDeleteProject} onCancel={() => setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false })} loading={deleteModal.loading} />
    </>
  );

  /* ── TABLE ROW (default) ── */
  return (
    <>
      <div className={`CP-proj-row${open ? ' open' : ''}`} style={{ animationDelay: `${seqNum * 0.04}s` }}>

        {/* S.Num Start */}
        <div className="CP-proj-cell CP-proj-cell-ctr">
          <div className="CP-proj-seq">{seqNum}</div>
        </div>
        {/* S.Num End */}

        {/* Project name + Toggle */}
        <div className="CP-proj-cell" onClick={() => setOpen(!open)} style={{ cursor: 'pointer', gap: 0 }}>
          <div className={`CP-proj-toggle${open ? ' open' : ''}`}>
            <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <div className="CP-proj-avatar">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="CP-proj-name">{project.project_name || 'Unnamed Project'}</div>
            <div className="CP-proj-date">
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 2 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {fmtDate(project.start_date)}
            </div>
          </div>
        </div>
        {/* Project name + Toggle */}

        {/* Type Start */}
        <div className="CP-proj-cell CP-proj-cell-ctr">
          <span className={`CP-chip CP-type-${project.project_type || 'pmc'}`}>{project.type_label}</span>
        </div>
        {/* Type End */}

        {/* Status Start */}
        <div className="CP-proj-cell CP-proj-cell-ctr">
          <span className={`CP-chip CP-status-${project.status || 'active'}`}>
            {project.status === 'active' && <svg width={6} height={6} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>}
            {project.status_label}
          </span>
        </div>
        {/* Status End */}

        {/* Budget Start */}
        <div className="CP-proj-cell CP-proj-cell-rgt">
          <span className="CP-money CP-money-bgt">{fmt(project.total_budget)}</span>
        </div>
        {/* Budget Start */}

        {/* Collected */}
        <div className="CP-proj-cell CP-proj-cell-rgt">
          <span className="CP-money CP-money-col">{fmt(project.total_collected)}</span>
        </div>
        {/* Collected */}

        {/* Progress Start */}
        <div className="CP-proj-cell CP-proj-cell-rgt">
          <div className="CP-prog-wrap">
            <span className="CP-prog-pct">{pct}%</span>
            <div className="CP-prog-track"><div className="CP-prog-fill" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
        {/* Progress End */}

        {/* Balance + Actions */}
        <div className="CP-proj-cell CP-proj-cell-rgt" onClick={e => e.stopPropagation()} style={{ gap: 4, flexWrap: 'wrap' }}>
          <span className="CP-money CP-money-bal">{fmt(project.balance)}</span>
          {/* Pay Start */}
          <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
            <button className="CP-act CP-act-jade" title="Add Payment" onClick={() => setPayModal('collect')}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              Pay
            </button>
            <button className="CP-act CP-act-add" title="Add Budget" onClick={() => setPayModal('budget')}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </button>
            <button className="CP-act CP-act-edit" title="Edit" onClick={() => setEditModal(true)}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button className="CP-act CP-act-del" title="Delete" onClick={handleDeleteProject}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
            </button>
          </div>
          {/* Pay End */}
        </div>
        {/* Balance + Actions */}
      </div>

      {/* ── DETAIL PANEL ── */}
      {open && (
        <div className="CP-detail-panel">
          <div className="CP-detail-stats">
            {[
              { lbl: 'Budget', val: fmt(project.total_budget), color: 'var(--or)' },
              { lbl: 'Collected', val: fmt(project.total_collected), color: 'var(--gr)' },
              { lbl: 'Balance', val: fmt(project.balance), color: 'var(--rd)' },
              { lbl: 'GST Paid', val: fmt(project.total_gst || 0), color: 'var(--gd)' },
            ].map(s => (
              <div key={s.lbl} className="CP-detail-stat">
                <div className="CP-detail-stat-lbl">{s.lbl}</div>
                <div className="CP-detail-stat-val" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Button Start */}
          <div className="CP-detail-prog">
            <div className="CP-detail-prog-hdr">
              <span className="CP-detail-prog-lbl">Collection Progress</span>
              <span className="CP-detail-prog-pct">{project.collected_pct || pct}%</span>
            </div>
            <div className="CP-detail-prog-bar">
              <div className="CP-detail-prog-fill" style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
            </div>
            <div className="CP-detail-prog-foot">
              <div className="CP-detail-prog-kpi">
                <span className="CP-detail-prog-kpi-lbl">Budget</span>
                <span className="CP-detail-prog-kpi-val">{fmt(project.total_budget)}</span>
              </div>
              <div className="CP-detail-prog-kpi">
                <span className="CP-detail-prog-kpi-lbl">Collected</span>
                <span className="CP-detail-prog-kpi-val" style={{ color: '#DB5B1F' }}>{fmt(project.total_collected)}</span>
              </div>
              <div className="CP-detail-prog-kpi">
                <span className="CP-detail-prog-kpi-lbl">Balance</span>
                <span className="CP-detail-prog-kpi-val" style={{ color: 'rgba(255,255,255,0.85)' }}>{fmt(project.balance)}</span>
              </div>
            </div>
          </div>
          {/* Button End */}

          {/* Project Modal Start */}
          {project.next_due_date && (
            <div className="CP-detail-due">
              <Ic n="cal" s={13} c="var(--gd)" />
              <span style={{ fontFamily: 'var(--ff-m)', fontSize: 9.5, color: 'var(--t3)' }}>
                Next due:&nbsp;<strong style={{ color: 'var(--gd)' }}>{fmtDate(project.next_due_date)}</strong>
              </span>
            </div>
          )}
          {/* Project Modal End */}

          {/* Transaction feed — ERP ledger style */}
          {project.payments && project.payments.length > 0 ? (
            <div className="CP-tx-feed" style={{ marginBottom: 14 }}>
              <div className="CP-tx-feed-hdr">
                <div className="CP-tx-feed-title">Recent Transactions</div>
                <div style={{ fontFamily: 'var(--ff-m)', fontSize: 9.5, fontWeight: 800, color: 'var(--success,#1E9C6A)' }}>
                  {fmt(asArray<Payment>(project.payments).reduce((s, p) => s + p.total_amount, 0))}
                </div>
              </div>
              <div className="CP-tx-scroll">
                {project.payments.map((pay, i) => (
                  <div key={pay.id} className="CP-tx-item"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                    onClick={() => setPayModal('collect')}>
                    <div className="CP-tx-icon-erp">
                      <Ic n="pay" s={15} c="var(--ember,#C2410C)" />
                    </div>
                    <div className="CP-tx-body">
                      <div className="CP-tx-amount">{fmt(pay.amount)}</div>
                      <div className="CP-tx-meta">
                        <span className="CP-tx-date"><Ic n="cal" s={9} />{fmtDate(pay.payment_date)}</span>
                        <span className="CP-tx-mode-badge">{pay.mode_label}</span>
                        {pay.reference_number && <span className="CP-tx-ref">#{pay.reference_number}</span>}
                      </div>
                    </div>
                    <div className="CP-tx-right">
                      <div className="CP-tx-total">{fmt(pay.total_amount)}</div>
                      {pay.gst_amount > 0 && <div className="CP-tx-gst">+GST {fmt(pay.gst_amount)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="CP-tx-empty" style={{ marginBottom: 14 }}>
              <div className="CP-tx-empty-icon"><Ic n="pay" s={20} c="var(--ember,#C2410C)" /></div>
              <div className="CP-tx-empty-title">No payments yet</div>
              <div className="CP-tx-empty-sub">Record first payment to see transactions</div>
            </div>
          )}

          {/* Detail Actions Start */}
          <div className="CP-detail-actions">
            <button className="CP-btn-primary"
              style={{ background: 'linear-gradient(135deg,var(--jade),var(--jade2))', boxShadow: '0 4px 16px var(--jade-g)' }}
              onClick={() => setPayModal('collect')}>
              <Ic n="pay" s={15} c="#faf9f7" /> Add Payment
            </button>
            <button className="CP-btn-gold" onClick={() => setPayModal('budget')}>
              <Ic n="chart" s={14} /> Add Budget
            </button>
            <button className="CP-btn-ghost" onClick={() => setEditModal(true)}>
              <Ic n="edit" s={12} /> Edit Project
            </button>
          </div>
          {/* Detail Actions End */}

        </div>
      )}
      {/* ── DETAIL PANEL ── */}

      {/* Modals Start */}
      {payModal && (
        <PaymentModal project={project} clientId={clientId} initialTab={payModal}
          onClose={() => setPayModal(null)} onSaved={refreshProject} />
      )}
      {/* Modals End */}

      {/* Edit Modal Start */}
      {editModal && (
        <EditProjectModal clientId={clientId} project={project} subNames={subNames}
          onClose={() => setEditModal(false)}
          onSaved={() => { setEditModal(false); refreshProject(); }} />
      )}
      {/* Edit Modal End */}

      {/* Confirm Delete Modal Start */}
      <ConfirmDeleteModal
        open={deleteModal.open}
        itemName={deleteModal.name}
        description={deleteModal.type === 'project' ? 'This project and its payments will be moved to the Recycle Bin.' : 'This payment will be moved to the Recycle Bin.'}
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false })}
        loading={deleteModal.loading}
      />
      {/* Confirm Delete Modal End */}

    </>
  );
}

/* ═══════════════════════════════════════════
   CLIENT ROW
═══════════════════════════════════════════ */
function ClientRow({ client: init, seqNum, onRefresh, bioRecords, existingClientNames, panelMode }: {
  client: Client; seqNum: number; onRefresh: () => void; bioRecords: BioRecord[]; existingClientNames: string[]; panelMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState(init);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [addProjModal, setAddProjModal] = useState(false);
  const [editClientModal, setEditClientModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: number; name: string; loading: boolean }>({ open: false, type: '', id: 0, name: '', loading: false });
  useEffect(() => { setClient(init); }, [init]);
  useEffect(() => {
    if (panelMode) { setOpen(true); if (!fetched) loadProjects(); }
  }, [panelMode, init.id]);

  const confirmDelete = async () => {
    const { type, id, name } = deleteModal;
    setDeleteModal(d => ({ ...d, loading: true }));
    try {
      const token = localStorage.getItem('token');
      const h = { headers: { Authorization: `Bearer ${token}` } };
      if (type === 'client') {
        await axiosInstance.delete(`/api/client-portal/clients/${id}`, h);
        onRefresh();
      } else if (type === 'project') {
        await axiosInstance.delete(`/api/client-portal/clients/${client.id}/projects/${id}`, h);
        setProjects(p => p.filter(x => x.id !== id));
        onRefresh();
      } else if (type === 'payment') {
        await axiosInstance.delete(`/api/client-portal/payments/${id}`, h);
      }
    } catch (err: any) {
      toast.error('Delete Failed', err.response?.data?.message || 'Could not delete the item.');
    } finally {
      setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false });
    }
  };

  const loadProjects = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/client-portal/clients/${client.id}/projects`,
        { headers: { Authorization: `Bearer ${token}` } });
      setProjects(asArray(res.data.data));
      setFetched(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const refreshAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const [cr, pr] = await Promise.all([
        axiosInstance.get(`/api/client-portal/clients/${client.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get(`/api/client-portal/clients/${client.id}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setClient(cr.data.data);
      setProjects(asArray(pr.data.data));
      setFetched(true);
      onRefresh();
    } catch (e) { console.error(e); }
  };

  const toggle = () => { const next = !open; setOpen(next); if (next) loadProjects(); };
  const pct = client.total_budget > 0 ? Math.round((client.total_collected / client.total_budget) * 100) : 0;
  const clientBio = findBioByName(filterIncomeBio(bioRecords), client.name);
  const subNames = getSubNames(clientBio);

  if (panelMode) return (
    <>
      {/* Projects Section Start */}
      <div className="CP-main-content" style={{ animation: 'CP-panel-in 0.38s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '80ms' }}>
        <div className="CP-main-section-hdr">
          <div className="CP-main-section-title">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
            Projects · {client.name}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {projects.length > 0 && <span className="CP-main-section-pill">{projects.length} total</span>}
            <button
              onClick={() => setAddProjModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'linear-gradient(135deg,#C2410C,#DB5B1F)', color: '#faf9f7', border: 'none', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 2px 10px rgba(154,52,18,0.25)' }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Project
            </button>
          </div>
        </div>

        {loading
          ? [1, 2, 3].map(i => <div key={i} className="CP-skel" style={{ height: 76, borderRadius: 11, marginBottom: 6 }} />)
          : projects.length === 0
            ? (
              <div className="CP-empty">
                <div className="CP-empty-ico">
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={2}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
                </div>
                <div className="CP-empty-ttl" style={{ fontSize: 16 }}>No Projects Yet</div>
                <div className="CP-empty-sub" style={{ marginBottom: 14 }}>Add the first project to get started</div>
                <button onClick={() => setAddProjModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'linear-gradient(135deg,#C2410C,#DB5B1F)', color: '#faf9f7', border: 'none', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 16px rgba(154,52,18,0.3)' }}>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add First Project
                </button>
              </div>
            )
            : projects.map((proj, idx) => (
              <div key={proj.id} className="CP-proj-enter" style={{ animationDelay: `${120 + idx * 80}ms` }}>
                <ProjectRow
                  project={proj}
                  seqNum={idx + 1}
                  clientId={client.id}
                  onRefresh={refreshAll}
                  subNames={subNames}
                  panelCard={true}
                />
              </div>
            ))
        }
      </div>
      {/* Project Section End */}

      {addProjModal && (
        <AddProjectModal clientId={client.id} clientName={client.name} subNames={subNames}
          onClose={() => setAddProjModal(false)}
          onSaved={() => { setAddProjModal(false); setFetched(false); refreshAll(); }} />
      )}
      {editClientModal && (
        <ClientModal mode="edit" editClient={client} bioRecords={bioRecords}
          existingClientNames={existingClientNames} namesLoading={false}
          onClose={() => setEditClientModal(false)}
          onSaved={() => { setEditClientModal(false); refreshAll(); onRefresh(); }} />
      )}
      <ConfirmDeleteModal
        open={deleteModal.open} itemName={deleteModal.name}
        description={deleteModal.type === 'client' ? 'This client and ALL projects/payments will be moved to the Recycle Bin.' : 'This will be moved to the Recycle Bin.'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false })}
        loading={deleteModal.loading}
      />
    </>
  );

  /* ── TABLE ROW (default) ── */
  return (
    <>
      <div className={`CP-cli-row${open ? ' open' : ''}`} style={{ animationDelay: `${seqNum * 0.04}s` }}>

        {/* S.Num */}
        <div className="CP-cli-cell CP-cli-cell-ctr">
          <div className="CP-seq">{seqNum}</div>
        </div>
        {/* S.Num */}

        {/* Client Name + Expand Toggle Start */}
        <div className="CP-cli-cell" onClick={toggle} style={{ cursor: 'pointer', gap: 0 }}>
          <div className={`CP-expand-arrow${open ? ' open' : ''}`}>
            <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <div className="CP-avatar">{client.name.charAt(0).toUpperCase()}</div>
          <div className="CP-cli-info">
            <div className="CP-cli-name">{client.name}</div>
            <div className="CP-cli-id">
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 3 }}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              {client.id_number || 'No ID'}
            </div>
          </div>
        </div>
        {/* Client Name + Expand Toggle END */}

        {/* PROJECTS COUNT END */}
        <div className="CP-cli-cell CP-cli-cell-ctr" onClick={e => e.stopPropagation()}>
          <span className="CP-badge CP-badge-proj">
            <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
            {client.project_count}
          </span>
        </div>
        {/* Projects Count End */}

        {/* BIO START */}
        <div className="CP-cli-cell CP-cli-cell-ctr" onClick={e => e.stopPropagation()}>
          {subNames.length > 0
            ? <span className="CP-badge CP-badge-bio">
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              {subNames.length}
            </span>
            : <span className="CP-badge" style={{ background: 'var(--cr2)', color: 'var(--t4)', borderColor: 'var(--bd)' }}>—</span>}
        </div>
        {/* BIO END */}

        {/* BUDGET START */}
        <div className="CP-cli-cell CP-cli-cell-rgt" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'right' }}>
            <div className="CP-money CP-money-bgt">{fmt(client.total_budget)}</div>
            {client.total_additional > 0 && <div style={{ fontFamily: 'var(--ff-m)', fontSize: 8, color: 'var(--gd,#9A3412)', marginTop: 1 }}>+{fmt(client.total_additional)} extra</div>}
          </div>
        </div>
        {/* BUDGET END */}

        {/* COLLECTED START */}
        <div className="CP-cli-cell CP-cli-cell-rgt" onClick={e => e.stopPropagation()}>
          <span className="CP-money CP-money-col">{fmt(client.total_collected)}</span>
        </div>
        {/* COLLECTED END */}

        {/* PROGRESS Start */}
        <div className="CP-cli-cell CP-cli-cell-rgt" onClick={e => e.stopPropagation()}>
          <div className="CP-prog-wrap">
            <span className="CP-prog-pct">{pct}%</span>
            <div className="CP-prog-track"><div className="CP-prog-fill" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
        {/* PROGRESS END */}

        {/* Balance + Actions Start */}
        <div className="CP-cli-cell" onClick={e => e.stopPropagation()} style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className="CP-money CP-money-bal">{fmt(client.total_balance)}</span>
          <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
            <button className="CP-act CP-act-add" title="Add project" onClick={() => setAddProjModal(true)}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Proj
            </button>
            <button className="CP-act CP-act-edit" title="Edit" onClick={() => setEditClientModal(true)}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button className="CP-act CP-act-del" title="Delete" onClick={e => { e.stopPropagation(); setDeleteModal({ open: true, type: 'client', id: client.id, name: client.name, loading: false }); }}>
              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
            </button>
          </div>
        </div>
        {/* Balance Actions End */}
      </div>

      {/* ── PROJECTS PANEL ── */}
      {open && (
        <div className="CP-proj-panel">
          <div className="CP-proj-col-head">
            <div style={{ justifyContent: 'center' }}>#</div>
            <div>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
              &nbsp;Project
            </div>
            <div style={{ justifyContent: 'center' }}>Type</div>
            <div style={{ justifyContent: 'center' }}>Status</div>
            <div style={{ justifyContent: 'flex-end' }}>Budget</div>
            <div style={{ justifyContent: 'flex-end' }}>Collected</div>
            <div style={{ justifyContent: 'flex-end' }}>Progress</div>
            <div style={{ justifyContent: 'flex-end' }}>Balance</div>
          </div>

          {loading ? (
            <div style={{ padding: '20px 24px 20px 64px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="CP-spinner-or" />
              <span style={{ fontFamily: 'var(--ff-m)', fontSize: 10.5, color: 'var(--t4)' }}>Loading projects…</span>
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '24px 24px 24px 64px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--ff-m)', fontSize: 10.5, color: 'var(--t4)' }}>No projects yet.</span>
              <button className="CP-act CP-act-add" onClick={() => setAddProjModal(true)}><Ic n="plus" s={9} /> Add First Project</button>
            </div>
          ) : (
            projects.map((p, i) => (
              <ProjectRow key={p.id} clientId={client.id} project={p} seqNum={i + 1}
                subNames={subNames} onRefresh={refreshAll} />
            ))
          )}

          <div style={{ padding: '12px 24px 12px 64px', borderTop: '1px solid var(--bd)', display: 'flex', gap: 8 }}>
            <button className="CP-act CP-act-add" onClick={() => setAddProjModal(true)}><Ic n="plus" s={9} /> Add New Project</button>
          </div>
        </div>
      )}

      {addProjModal && (
        <AddProjectModal clientId={client.id} clientName={client.name} subNames={subNames}
          onClose={() => setAddProjModal(false)}
          onSaved={() => { setAddProjModal(false); setFetched(false); refreshAll(); }} />
      )}
      {editClientModal && (
        <ClientModal
          mode="edit"
          editClient={client}
          bioRecords={bioRecords}
          existingClientNames={existingClientNames}
          namesLoading={false}
          onClose={() => setEditClientModal(false)}
          onSaved={() => { setEditClientModal(false); refreshAll(); onRefresh(); }}
        />
      )}
      <ConfirmDeleteModal
        open={deleteModal.open}
        itemName={deleteModal.name}
        description={deleteModal.type === 'client' ? 'This client and ALL their projects/payments will be moved to the Recycle Bin.' : deleteModal.type === 'project' ? 'This project and its payments will be moved to the Recycle Bin.' : 'This payment will be moved to the Recycle Bin.'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false })}
        loading={deleteModal.loading}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function ClientPortalFull() {
  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [bioRecords, setBioRecords] = useState<BioRecord[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);
  const [modal, setModal] = useState<null | { type: 'add' } | { type: 'edit'; client: Client }>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: number; name: string; loading: boolean }>({ open: false, type: 'client', id: 0, name: '', loading: false });
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useKeyboardFieldNav(pageRef);

  useEffect(() => { loadAll(); fetchBio(); }, []);

  const loadAll = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem('token');
      const h = { headers: { Authorization: `Bearer ${token}` } };
      const [cr, sr] = await Promise.all([
        axiosInstance.get('client-portal/clients', h),
        axiosInstance.get('client-portal/summary', h),
      ]);
      setClients(asArray(cr.data.data));
      setSummary(sr.data.data);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  const fetchBio = async () => {
    setNamesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('client-portal/bio-data', { headers: { Authorization: `Bearer ${token}` } });
      let records: BioRecord[] = res.data.data || res.data.records || (Array.isArray(res.data) ? res.data : []);
      records = records.map(r => ({
        ...r,
        sub_names: Array.isArray(r.sub_names) ? r.sub_names.filter(Boolean) : (r.sub_names ? [String(r.sub_names)] : []),
      }));
      setBioRecords(records);
    } catch (e) { console.error(e); }
    finally { setNamesLoading(false); }
  };

  const handleRefresh = async () => {
    setSpinning(true);
    await Promise.all([loadAll(), fetchBio()]);
    setTimeout(() => setSpinning(false), 600);
  };

  const handleDeleteClient = (id: number, name: string) => {
    setDeleteModal({ open: true, type: 'client', id, name, loading: false });
  };
  const _doDeleteClient = async (id: number, name: string) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/api/client-portal/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadAll();
    } catch (err: any) { toast.error('Action Failed', err.response?.data?.message || 'Something went wrong.'); }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.id_number || '').includes(search)
  );

  const STAT_CARDS = summary ? [
    { icon: 'users', label: 'Total Clients', num: summary.total_clients, prefix: '', color: 'var(--ember,#C2410C)', ac: 'linear-gradient(180deg,#C2410C 0%,transparent 100%)', iconBg: 'rgba(154,52,18,0.09)', iconBd: 'rgba(154,52,18,0.2)', foot: `${summary.total_projects} active projects` },
    { icon: 'bldg', label: 'Active Projects', num: summary.total_projects, prefix: '', color: 'var(--amber,#DB5B1F)', ac: 'linear-gradient(180deg,#DB5B1F 0%,transparent 100%)', iconBg: 'rgba(219,91,31,0.09)', iconBd: 'rgba(219,91,31,0.2)', foot: 'across all clients' },
    { icon: 'wallet', label: 'Total Budget', num: summary.total_budget, prefix: '₹', color: 'var(--amber,#DB5B1F)', ac: 'linear-gradient(180deg,#DB5B1F 0%,transparent 100%)', iconBg: 'rgba(219,91,31,0.09)', iconBd: 'rgba(219,91,31,0.2)', foot: 'contracted value' },
    { icon: 'coins', label: 'Amt Collected', num: summary.total_collected, prefix: '₹', color: '#1E9C6A', ac: 'linear-gradient(180deg,#1E9C6A 0%,transparent 100%)', iconBg: 'rgba(22,163,74,0.09)', iconBd: 'rgba(22,163,74,0.2)', foot: `${summary.collected_pct}% of budget` },
    { icon: 'chart', label: 'Balance Due', num: summary.total_balance, prefix: '₹', color: '#D93B55', ac: 'linear-gradient(180deg,#D93B55 0%,transparent 100%)', iconBg: 'rgba(220,38,38,0.09)', iconBd: 'rgba(220,38,38,0.2)', foot: 'outstanding amount' },
  ] : [];

  const gBgt = filtered.reduce((s, c) => s + c.total_budget, 0);
  const gCol = filtered.reduce((s, c) => s + c.total_collected, 0);
  const gExt = filtered.reduce((s, c) => s + c.total_additional, 0);
  const gBal = filtered.reduce((s, c) => s + c.total_balance, 0);
  const existingClientNames = clients.map(c => c.name);

  return (
    <div className="CP-root" ref={pageRef}>
      <style>{ERP_CSS}{CSS}</style>
      <PageOpenIntro containerRef={pageRef} label="Opening Accounts Receivable…" />
      <div className="CP-wrap">

        {/* ── HEADER START ── */}
        <div style={{ padding: '32px 40px 0' }}>
          <div className="ERP-hdr">
            <div className="ERP-hdr-left">
              <div className="ERP-eyebrow">
                <span className="ERP-eyebrow-line" />
                <span className="ERP-eyebrow-dot" />
                Receivables Management System
              </div>
              <h1 className="ERP-title MD-page-title">Accounts <span className="ERP-title-em">Receivable</span></h1>
            </div>
            <div className="ERP-hdr-right">
              <button className="CP-btn-header-add" onClick={() => setModal({ type: 'add' })}>
                <span className="CP-btn-header-add-ic"><Ic n="plus" s={12} c="#faf9f7" /></span>
                Add Client
              </button>
            </div>
          </div>
          <div className="ERP-divider" />
        </div>
        {/* ── HEADER END ── */}

        {/* STATS START */}
        {fetching ? (
          <div className="ERP-stats" style={{ padding: '24px 40px 0', gridTemplateColumns: 'repeat(5,1fr)' }}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="CP-skel" style={{ height: 138, borderRadius: 16 }} />)}
          </div>
        ) : summary && (
          <div className="ERP-stats" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
            {STAT_CARDS.map((s, i) => (
              <div key={i} className="ERP-stat" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="ERP-stat-accent" style={{ background: s.ac }} />
                <div className="ERP-stat-label">{s.label}</div>
                <div className="ERP-stat-val" style={{ color: s.color, fontSize: 16, fontWeight: 800 }}>
                  {s.prefix && <span style={{ fontFamily: 'var(--ff-m)', fontSize: 11.5, color: 'var(--t4)', verticalAlign: 'super', marginRight: 2 }}>{s.prefix}</span>}
                  {s.prefix === '₹' ? fmt(s.num).slice(1) : String(s.num)}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* STATS END */}

        {/* ── CM3-STYLE 2-COLUMN BODY ── */}
        <div className="CP-layout-body">

          {/* LEFT SIDEBAR START */}
          <div className="CP-sb">

            {/* HERO HEADER START */}
            <div className="CP-sb-hero">
              <div className="CP-sb-eyebrow">
                <span className="CP-sb-dot" />
                Client Registry
              </div>
              <div className="CP-sb-title">Clients</div>
              <div className="CP-sb-search">
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ color: '#C2410C', flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  placeholder="Search clients…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* HERO HEADER END */}

            {/* COUNT BAR START */}
            <div className="CP-sb-count">
              <span className="CP-sb-count-lbl">
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                Clients
              </span>
              <span className="CP-sb-count-num">{filtered.length}</span>
            </div>
            {/* COUNT BAR END  */}

            {/* CLIENT LIST START */}
            <div className="CP-cli-list">
              {fetching
                ? [1, 2, 3, 4].map(i => (
                  <div key={i} className="CP-skel" style={{ height: 78, margin: '4px 10px', borderRadius: 12 }} />
                ))
                : filtered.length === 0
                  ? <div className="CP-empty" style={{ minHeight: 200 }}>
                    <div className="CP-empty-ico">
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    </div>
                    <div className="CP-empty-ttl" style={{ fontSize: 14 }}>No clients</div>
                    <div className="CP-empty-sub">{search ? 'Try another name' : 'Add your first client'}</div>
                  </div>
                  : filtered.map((cli, idx) => {
                    const pct = cli.total_budget > 0 ? Math.round((cli.total_collected / cli.total_budget) * 100) : 0;
                    const isActive = selectedClientId === cli.id;
                    return (
                      <div
                        key={cli.id}
                        className={`CP-clicard${isActive ? ' active' : ''}${idx === 0 ? ' CP-clicard-first' : ''}`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                        onClick={() => setSelectedClientId(isActive ? null : cli.id)}
                      >
                        <div className="CP-clicard-accent" />
                        <div className="CP-clicard-top">
                          <div className="CP-clicard-av">
                            {(cli.name || 'C').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="CP-clicard-info">
                            <div className="CP-clicard-name">{cli.name}</div>
                            <div className="CP-clicard-meta">
                              <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
                              {cli.project_count} proj · {pct}%
                            </div>
                          </div>
                        </div>
                        <div className="CP-clicard-foot">
                          <div className="CP-clicard-bar-wrap">
                            <div className="CP-clicard-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`CP-clicard-bal ${cli.total_balance > 0 ? 'red' : 'grey'}`}>
                            {fmt(cli.total_balance > 0 ? cli.total_balance : cli.total_collected)}
                          </span>
                        </div>
                        {/* Bouncing chevron hint — icon only */}
                        {!isActive && (
                          <div className="CP-clicard-hint">
                            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
            {/* CLIENT LIST END */}
          </div>
          {/* LEFT SIDEBAR END */}

          {/* RIGHT PANEL START */}
          <div className="CP-main-panel">
            {(() => {
              const selCli = clients.find(c => c.id === selectedClientId);
              if (!selCli) return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div className="CP-sb-tap-hint" style={{ opacity: 1 }}>
                    <div className="CP-sb-tap-icon" style={{ width: 64, height: 64 }}>
                      <Ic n="users" s={28} c="#C2410C" />
                    </div>
                    <div className="CP-sb-tap-label" style={{ fontSize: 9, marginTop: 4 }}>
                      Select a client to view details
                    </div>
                  </div>
                </div>
              );
              return (
                <div key={selectedClientId} style={{ height: '100%', animation: 'CP-panel-in 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
                  <ClientRow
                    client={selCli}
                    seqNum={filtered.findIndex(c => c.id === selectedClientId) + 1}
                    onRefresh={loadAll}
                    bioRecords={bioRecords}
                    existingClientNames={existingClientNames}
                    panelMode
                  />
                </div>
              );
            })()}
          </div>
          {/* RIGHT PANEL END */}

        </div>{/* CP-layout-body */}
      </div>{/* CP-wrap */}

      {/* MODALS */}
      {modal && (
        <ClientModal
          mode={modal.type === 'edit' ? 'edit' : 'add'}
          editClient={modal.type === 'edit' ? modal.client : undefined}
          bioRecords={bioRecords}
          existingClientNames={existingClientNames}
          namesLoading={namesLoading}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadAll(); }}
        />
      )}

      <ConfirmDeleteModal
        open={deleteModal.open}
        itemName={deleteModal.name}
        description={deleteModal.type === 'client' ? 'This client and ALL projects/payments will be moved to the Recycle Bin.' : 'This will be moved to the Recycle Bin.'}
        onConfirm={() => {
          const { id, name } = deleteModal;
          setDeleteModal(d => ({ ...d, loading: true }));
          _doDeleteClient(id, name).finally(() =>
            setDeleteModal({ open: false, type: 'client', id: 0, name: '', loading: false })
          );
        }}
        onCancel={() => setDeleteModal(d => ({ ...d, open: false }))}
        loading={deleteModal.loading}
      />
    </div>
  );
}
