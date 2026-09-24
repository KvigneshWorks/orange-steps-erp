import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ERP_CSS } from '../../styles/ERPTheme';
import axiosInstance from '../../services/axiosConfig';
import { toast as appToast } from '../../services/toast';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { CalendarDD } from '../../components/CalendarDD';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../../utils/keyboardNav';
import { getStoredRole, canDelete } from '../../utils/roleAccess';
import CreatorBadge from '../../components/CreatorBadge';

interface WorkerSummary {
  id: number;
  name: string;
  trade: string | null;
  daily_rate: number;
  salary_type: string;
  monthly_salary: number;
  total_earned: number;
  total_paid: number;
  balance: number;
  clients: string[];
  clients_count: number;
  last_payment_at: string | null;
  recent_shifts: number;
}

interface PageSummary {
  total_earned: number;
  total_paid: number;
  total_unpaid: number;
  workers_unpaid: number;
  workers_clear: number;
  total_workers: number;
}

interface ClientPerson {
  person: string;
  is_own: boolean;
  shifts: number;
  earned: number;
  paid: number;
  outstanding: number;
  first_date?: string | null;
}

interface ClientBreakdown {
  client_name: string;
  shifts: number;
  earned: number;
  paid: number;
  outstanding: number;
  first_date?: string | null;
  persons?: ClientPerson[];
}

interface PaymentAllocation {
  id: number;
  client_name: string;
  sub_worker_name?: string | null;
  shifts_total: number;
  earned_total: number;
  outstanding_before: number;
  allocated: number;
  outstanding_after: number;
  is_closed: boolean;
}

interface PaymentSession {
  id: number;
  total_amount: number;
  payment_mode: string;
  notes: string | null;
  paid_at: string;
  allocations: PaymentAllocation[];
  created_by_name?: string | null;
}

interface AllPaymentClient {
  client_name: string;
  allocated: number;
  outstanding_before: number;
  outstanding_after: number;
  is_closed: boolean;
}

interface AllPaymentSession {
  id: number;
  worker_id: number;
  worker_name: string;
  total_amount: number;
  payment_mode: string;
  notes: string | null;
  paid_at: string;
  clients_count: number;
  clients: AllPaymentClient[];
  created_by_name?: string | null;
}

interface PaymentModeStat { mode: string; count: number; amount: number; }
interface PaymentsSummary {
  total_amount: number;
  sessions_count: number;
  workers_paid: number;
  by_mode: PaymentModeStat[];
}

interface SubEarning {
  sub_name: string;
  shifts: number;
  entries: number;
  earned: number;
}

interface EarningsBreakdown {
  own: { shifts: number; entries: number; earned: number };
  subs: SubEarning[];
  sub_earned: number;
}

interface WorkerDetail {
  worker: {
    id: number;
    name: string;
    trade: string | null;
    daily_rate: number;
    salary_type: string;
    monthly_salary: number;
    category_id?: number | null;
    sub_category_id?: number | null;
  };
  client_breakdown: ClientBreakdown[];
  earnings_breakdown: EarningsBreakdown | null;
  total_earned: number;
  total_paid: number;
  balance: number;
  sessions: PaymentSession[];
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#F0834D,#C2410C)',
];

const MODE_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  neft: 'NEFT',
  cheque: 'Cheque',
  other: 'Other',
};

interface DBCategory { id: number; name: string; type?: string; }
interface DBSubCategory { id: number; name: string; category_id: number; category_ids?: number[]; }
interface DBBio { id: number; name: string; category_id?: number; category_name?: string; }
interface DBSubName { id: number; alternate_name: string; bio_data_id: number; }
const DB_MODE_MAP: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  neft: 'NEFT',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  other: 'Others',
};

const PER_PAGE = 10;
const PAY_PAGE_SIZE = 15;

function buildPageNumbers(total: number, current: number): (number | '…')[] {
  const nums: (number | '…')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return nums;
}

const MODE_META: Record<string, { label: string; color: string; icon: string }> = {
  cash: { label: 'Cash', color: '#1E9C6A', icon: 'cash' },
  upi: { label: 'UPI', color: '#DB5B1F', icon: 'mobile' },
  neft: { label: 'NEFT', color: '#9A3412', icon: 'bank' },
  bank_transfer: { label: 'Bank Transfer', color: '#A6491D', icon: 'transfer' },
  cheque: { label: 'Cheque', color: '#C2410C', icon: 'document' },
  other: { label: 'Other', color: '#6B5D48', icon: 'more' },
};

const CSS = `
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
  --text-3: #231C14;
  --text-4: #6B5D48;
  /* Dedicated darker/bolder color for ₹ amount figures specifically —
     var(--ember) itself stays the vivid brand orange (still used for
     buttons/borders/badges/icons throughout this page); amount displays
     switch to this instead, wherever they were reading off --ember. */
  --amt-strong: #9A3412;
  font-weight: 700;
  text-transform: uppercase;
}
.WP-page input, .WP-page select, .WP-page button, .WP-page textarea { font-weight: inherit; text-transform: none; }

.WP-hero {
  background:linear-gradient(135deg,#231C14 0%,#3A3024 40%,#231C14 100%);
  border-bottom:1.5px solid rgba(194,65,12,0.18);
  padding:24px 32px; position:relative; overflow:hidden;
}
.WP-hero::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(194,65,12,0.07) 0%,transparent 70%);
  pointer-events:none;
}
.WP-hero-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; position:relative; }
.WP-hero-icon {
  width:48px; height:48px; border-radius:13px; flex-shrink:0;
  background:linear-gradient(135deg,#F0834D,#C2410C);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 16px rgba(194,65,12,0.35);
}
.WP-hero-title { font-family:var(--font-body); font-size: 19.5px; font-weight: 800; font-style:normal; color:#C2410C; margin:0 0 2px; }
.WP-hero-sub { font-family:var(--font-mono); font-size: 8px; letter-spacing:2px; color:#6B5D48; text-transform:uppercase; }
.WP-hero-right { margin-left:auto; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

.WP-body { padding:24px 32px; flex:1; }
@media(max-width:900px){ .WP-body { padding:16px; } }

.WP-btn {
  display:inline-flex; align-items:center; gap:6px; padding:7px 14px;
  border-radius:8px; border:none; cursor:pointer; font-family:var(--font-mono);
  font-size: 8px; font-weight: 800; letter-spacing:1.3px; text-transform:uppercase;
  transition:all 0.18s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; flex-shrink:0;
}
.WP-btn-primary { background:linear-gradient(135deg,#F0834D,#C2410C); color:#faf9f7; position:relative; overflow:hidden; }
.WP-btn-primary::before {
  content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
  animation:wp-shine 3s ease-in-out infinite; pointer-events:none;
}
@keyframes wp-shine { 0%{left:-80%} 50%,100%{left:130%} }
.WP-btn-primary:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(194,65,12,0.4); }
.WP-btn-green { background:linear-gradient(135deg,#F0834D,#C2410C); color:#faf9f7; box-shadow:0 4px 14px rgba(194,65,12,0.32); }
.WP-btn-green:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(194,65,12,0.45); }
.WP-btn-ghost { background:rgba(255,255,255,0.06); color:#8C7C63; border:1.5px solid rgba(255,255,255,0.1); }
.WP-btn-ghost:hover { transform:translateY(-1px); background:rgba(255,255,255,0.1); color:#faf9f7; }
.WP-btn-outline { background:transparent; color:var(--text-3); border:1.5px solid var(--border); }
.WP-btn-outline:hover { transform:translateY(-1px); border-color:var(--ember-mid); color:var(--ember); background:var(--ember-ghost); }
.WP-btn-red { background:linear-gradient(135deg,#D93B55,var(--ember)); color:#faf9f7; }
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
.WP-back-btn:hover { transform:translateY(-1px); border-color:var(--ember-mid); color:var(--ember); box-shadow:0 4px 14px rgba(194,65,12,.2); }
.WP-back-btn:hover .WP-back-btn-ico { background:var(--ember); color:#faf9f7; }
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
.LP-view-tab.active { color:#faf9f7; background:var(--ember); }
.LP-view-tab-badge { padding:2px 8px; border-radius:100px; font-size: 8px; font-weight: 800; background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }
.LP-view-tab.active .LP-view-tab-badge { background:rgba(255,255,255,.25); color:#faf9f7; border-color:rgba(255,255,255,.4); }

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
.LP-compact thead tr { background:var(--surface-2,#E8E2D8) !important; border-bottom:2px solid var(--ember,#C2410C) !important; }
.LP-compact th { color:var(--text-3,#3A3024) !important; border-right:1px solid var(--border,#E8E2D8); }
.LP-compact th:last-child { border-right:none; }
.LP-compact td { padding:12px 16px; font-size: 10.5px; font-weight: 700; color:var(--text-1); border-right:1px solid var(--border); }
.LP-compact td:last-child { border-right:none; }
.LP-compact tbody tr:nth-child(even) td { background:var(--off-white,#F5F3EF); }
.LP-compact .ERP-t-num { color:var(--text-2); }

/* ── ORANGE UI: exact match with the Master-Data view tables (BioData,
   Category, etc. — the shared .ERP-tbl base look) — same header font/
   letter-spacing/padding, same uppercase body text, same plain-dark
   cell color with only the primary Name column staying accent-orange.
   Scoped to Wage Disbursement's view-page tables only, never touches the
   shared .ERP-tbl base elsewhere. ── */
.LP-orange-tbl th { background: var(--surface-2, #E8E2D8) !important; color: var(--text-3, #3A3024) !important; border-bottom: 2px solid var(--ember, #C2410C) !important; }
.LP-orange-tbl.LP-compact th { font-size: 8px !important; font-weight: 800 !important; letter-spacing: 2.5px !important; padding: 12px 16px !important; }
.LP-orange-tbl.LP-compact td { padding: 13px 16px; text-transform: uppercase; letter-spacing: .25px; }
@keyframes lp-row-in { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:none} }
.LP-row { cursor:pointer; animation:lp-row-in .38s ease both; transition:box-shadow .18s, background .18s; }
/* Plain fade-in for sub-worker rows when the Show/Hide toggle expands
   them. The earlier version scaled/translated the <tr> itself, which
   table rows don't support cleanly — mid-animation it broke the row's
   cell borders out of alignment with its neighbours (looked like a
   glitchy boxed-grid row). Opacity-only avoids that entirely and reads
   as professional rather than bouncy. */
@keyframes lp-subrow-in { from { opacity:0; } to { opacity:1; } }
.LP-subrow-anim { animation: lp-subrow-in .35s ease both; }
.LP-row:hover { background:rgba(194,65,12,0.04); }
.LP-row:active { transform:scale(.998); }
.LP-row td { transition:color .15s; }
.LP-mini-avatar {
  width:32px; height:32px; border-radius:9px; flex-shrink:0;
  display:inline-flex; align-items:center; justify-content:center;
  font-family:var(--font-mono); font-weight: 800; font-size: 9px; color:#faf9f7; letter-spacing:.5px;
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
  transform:translateY(-2px) scale(1.05); box-shadow:0 4px 12px rgba(194,65,12,.2);
}
.LP-pgn-btn:active:not(:disabled) { transform:translateY(0) scale(.94); }
.LP-pgn-btn.on {
  background:linear-gradient(135deg,#F0834D,#C2410C); border-color:transparent; color:#faf9f7;
  box-shadow:0 3px 12px rgba(194,65,12,.38); transform:translateY(-1px);
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

/* ── PREMIUM LOADING OVERLAY (worker click) — plain themed spinner badge,
   matching the app's standard .ERP-spinner ring language instead of a
   novelty mascot animation. ── */
@keyframes lp-fade { from{opacity:0} to{opacity:1} }
.LP-overlay {
  position:fixed; inset:0; z-index:998;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px;
  background:rgba(15,23,42,.45); backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px);
  animation:lp-fade .25s ease both;
}
.LP-loader-badge {
  position:relative; width:60px; height:60px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,var(--ember-mid,#DB5B1F),var(--ember,#C2410C));
  box-shadow:0 10px 28px rgba(194,65,12,.4);
}
.LP-loader-ring {
  position:absolute; inset:-7px; border-radius:50%;
  border:3px solid rgba(255,255,255,.16); border-top-color:#faf9f7;
  animation: erp-spin 0.85s linear infinite;
}
.LP-loader-title { font-family:var(--font-display); font-size: 16px; font-weight: 800; font-style:normal; color:#faf9f7; text-align:center; }
.LP-loader-sub {
  font-family:var(--font-mono); font-size: 8px; letter-spacing:2.5px; text-transform:uppercase;
  color:rgba(255,255,255,.65); display:flex; align-items:center; justify-content:center; gap:8px; margin-top:6px;
}
.LP-loader-dots { display:inline-flex; gap:4px; }
.LP-loader-dots span {
  width:5px; height:5px; border-radius:50%; background:#F0834D; display:inline-block;
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
@keyframes lp-avatar-ring { 0%{box-shadow:0 0 0 0 rgba(194,65,12,.4)} 100%{box-shadow:0 0 0 12px rgba(194,65,12,0)} }
.LP-hero {
  position:relative; overflow:hidden;
  background:linear-gradient(135deg,rgba(194,65,12,.10) 0%,var(--white) 45%,rgba(194,65,12,.04) 100%);
  border:1.5px solid var(--ember-border); border-radius:18px;
  padding:22px 26px; margin-bottom:20px;
  display:flex; align-items:center; gap:18px; flex-wrap:wrap;
  animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both; box-shadow:var(--sh-card);
}
/* Plain static top accent line — was a continuously sliding rainbow
   gradient (lp-slide-grad, infinite loop); that read as an odd moving
   line unique to this module, so it's now a fixed two-tone bar matching
   the same static accent pattern used elsewhere (e.g. Attendance's
   .AT-stat-card::before). */
.LP-hero::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg,var(--ember) 0%,#F0834D 100%);
}
.LP-hero::after {
  content:'₹'; position:absolute; right:20px; bottom:-30px;
  font-family:var(--font-display); font-style:italic; font-size: 105.5px;
  color:rgba(194,65,12,.08); pointer-events:none; line-height:1;
}
.LP-hero-avatar {
  width:58px; height:58px; border-radius:16px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-mono); font-weight: 800; font-size: 16.5px; color:#faf9f7; letter-spacing:.5px;
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
.LP-chip:hover { transform:translateY(-1px); box-shadow:0 3px 10px rgba(194,65,12,.18); }
.LP-chip b { color:var(--ember); font-weight: 800; }

/* ── DETAIL PANELS · POLISH & ENTRANCE ── */
.WP-layout > * { animation:wr-pageSwap .45s cubic-bezier(.22,1,.36,1) both; }
.WP-layout > *:nth-child(2) { animation-delay:.12s; }
.WP-panel { border-radius:16px; box-shadow:var(--sh-card); transition:box-shadow .25s; }
.WP-panel:hover { box-shadow:0 10px 30px rgba(194,65,12,.09); }
.LP-panel-ico {
  width:26px; height:26px; border-radius:8px; flex-shrink:0;
  background:linear-gradient(135deg,var(--ember-ghost),rgba(194,65,12,0.16)); border:1px solid var(--ember-border);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 2px 8px rgba(194,65,12,.15);
}
.LP-count-pill {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:.6px;
  padding:3px 10px; border-radius:100px; background:var(--ember); color:#faf9f7;
  border:1px solid var(--ember); text-transform:uppercase; white-space:nowrap;
  box-shadow:0 2px 8px rgba(194,65,12,.3);
}
.LP-anim-row { animation:lp-row-in .35s ease both; }
.LP-prog { height:3px; border-radius:100px; background:var(--off-white); overflow:hidden; margin-top:5px; width:100%; max-width:140px; border:1px solid var(--border); }
.LP-prog i { display:block; height:100%; border-radius:100px; background:linear-gradient(90deg,#F0834D,#C2410C); transition:width .6s ease; }
.LP-prog-lbl { font-family:var(--font-mono); font-size: 7px; color:var(--text-4); margin-top:3px; letter-spacing:.3px; }

/* ── PAY FORM · STEP BADGES & MICRO-ANIMATIONS ── */
.LP-step {
  width:16px; height:16px; border-radius:5px; flex-shrink:0;
  background:linear-gradient(135deg,#F0834D,#C2410C); color:#faf9f7;
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  display:inline-flex; align-items:center; justify-content:center;
  box-shadow:0 2px 8px rgba(194,65,12,.35);
}
.LP-step-line {
  display:flex; align-items:center; gap:8px; margin:16px 0 12px;
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing:1.5px; text-transform:uppercase; color:#DB5B1F;
}
.WP-session { animation:lp-row-in .35s ease both; transition:background .15s; }
.WP-session:hover { background:rgba(194,65,12,.04); }

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
.LP-dd-item:hover { background:rgba(194,65,12,.07); }
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
.LP-dd-list-mode { max-height:170px; padding:5px; scrollbar-width:thin; scrollbar-color:rgba(194,65,12,0.35) transparent; }
.LP-dd-list-mode::-webkit-scrollbar { width:6px; background:transparent; }
.LP-dd-list-mode::-webkit-scrollbar-track { background:transparent; }
.LP-dd-list-mode::-webkit-scrollbar-thumb { background:rgba(194,65,12,0.3); border-radius:100px; }
.LP-dd-list-mode::-webkit-scrollbar-thumb:hover { background:rgba(194,65,12,0.5); }
.LP-dd-item-mode { border-radius:7px; padding:9px 10px; gap:10px; }
.LP-dd-item-mode.sel { background:var(--ember-ghost); }
.LP-dd-item-mode:hover .LP-dd-mode-txt { color:var(--ember); }
@keyframes lp-dd-check-pop { 0%{opacity:0; transform:scale(0.4);} 60%{opacity:1; transform:scale(1.2);} 100%{opacity:1; transform:scale(1);} }
.LP-dd-check {
  width:16px; height:16px; border-radius:5px; border:2px solid var(--border,#D2C7B8); flex-shrink:0;
  display:flex; align-items:center; justify-content:center; background:#faf9f7;
  transition:all .16s cubic-bezier(.34,1.56,.64,1);
}
.LP-dd-check svg { animation:lp-dd-check-pop .22s cubic-bezier(.34,1.56,.64,1) both; }
.LP-dd-check.checked { border-color:var(--ember); background:linear-gradient(135deg,var(--ember-mid,#DB5B1F),var(--ember)); }

/* ── DAYBOOK SYNC SECTION (same pattern as Credit Management) ── */
.LP-sync-toggle {
  margin-left:auto; display:inline-flex; align-items:center; gap:7px; cursor:pointer;
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px;
  text-transform:uppercase; color:#DB5B1F; user-select:none;
}
.LP-sync-toggle input { width:15px; height:15px; accent-color:#C2410C; cursor:pointer; margin:0; }
.LP-db-details-toggle {
  display:inline-flex; align-items:center; gap:5px; cursor:pointer;
  background:var(--white); border:1px solid var(--ember-border); border-radius:100px;
  padding:4px 10px; font-family:var(--font-mono); font-size: 7px; font-weight: 800;
  letter-spacing:.8px; text-transform:uppercase; color:var(--ember); transition:all .18s;
}
.LP-db-details-toggle:hover { background:var(--ember); color:#faf9f7; border-color:var(--ember); }
.LP-db-details-toggle svg { transition:transform .2s ease; }
.LP-db-details-toggle.open svg { transform:rotate(180deg); }
.LP-db-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media(max-width:760px){ .LP-db-grid { grid-template-columns:1fr; } }
.LP-db-span { grid-column:1/-1; }
.LP-db-warn {
  display:flex; align-items:center; gap:6px; margin-bottom:10px; padding:7px 11px;
  background:rgba(194,65,12,.08); border:1px solid rgba(194,65,12,.25); border-radius:8px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 700; letter-spacing:.3px;
  color:#9A3412;
}
.LP-db-warn button {
  background:none; border:none; padding:0; margin:0; color:#C2410C; font-weight: 800;
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
.LP-db-entry-status.partial { background:rgba(154,52,18,.15); color:#9A3412; }
.LP-db-entry-amt { font-family:var(--font-mono); font-weight: 800; font-size: 9.5px; color:#1E9C6A; flex-shrink:0; }

.WP-badge {
  display:inline-flex; align-items:center; padding:3px 9px; border-radius:100px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase;
}
.WP-badge-unpaid  { background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }
.WP-badge-partial { background:rgba(154,52,18,0.10); color:#9A3412; border:1px solid rgba(154,52,18,0.25); }
.WP-badge-clear   { background:var(--off-white); color:var(--text-3); border:1px solid var(--border); }
.WP-badge-closed  { background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }

.WP-detail-header {
  background:linear-gradient(135deg,rgba(194,65,12,0.06) 0%,rgba(194,65,12,0.02) 100%);
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

/* Header/cell typography, sticky treatment and hover now match the
   app-wide .ERP-tbl standard exactly, so this breakdown table reads like
   every other list view in the software; the fixed column widths, totals
   row and section-header rows stay as-is since they're structural, not
   decorative. */
.WP-tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
.WP-tbl th {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2.5px; text-transform:uppercase;
  color:var(--text-3,#3A3024); padding:12px 12px; border-bottom:2px solid var(--ember,#C2410C); border-right:none;
  background:var(--surface-2,#E8E2D8); text-align:center; white-space:nowrap; line-height:1.3;
  position:sticky; top:0; z-index:10;
}
.WP-tbl th:last-child { border-right:none; }
.WP-tbl td { padding:12px; border-bottom:1px solid var(--border); border-right:none; font-family:var(--font-body); font-size: 10.5px; font-weight:700; color:var(--text-2); vertical-align:middle; transition:background .15s, box-shadow .15s; line-height:1.35; text-align:center; text-transform:uppercase; letter-spacing:.25px; }
.WP-tbl td:last-child { border-right:none; }
.WP-tbl td, .WP-tbl th { overflow:hidden; text-overflow:ellipsis; }
.WP-tbl tr:last-child td { border-bottom:none; }
.WP-tbl tbody tr:not(.WP-tbl-total):hover td { background:var(--ember-ghost); }
.WP-tbl tbody tr:not(.WP-tbl-total):hover .WP-tbl-name { color:var(--ember); }
.WP-tbl-name { transition:color .15s; }
.WP-tbl-total { background:rgba(194,65,12,0.04); animation:wp-total-in .3s ease both; }
@keyframes wp-total-in { from{opacity:0} to{opacity:1} }
.WP-tbl-total td { font-family:var(--font-mono); font-weight: 900; color:var(--amt-strong); border-top:1.5px solid var(--border); border-bottom:none; padding-top:8px; padding-bottom:8px; }
.WP-tbl-total td:first-child { text-transform:uppercase; letter-spacing:.8px; font-size: 8px; color:var(--text-3); }
.WP-tbl-settled td:first-child { border-left:3px solid #9A3412; opacity:0.7; }
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
  color:#9A3412; cursor:pointer; transition:all .16s ease;
}
.LP-subtoggle svg { transition:transform .18s ease; }
.LP-subtoggle.open svg { transform:rotate(180deg); }
.LP-subtoggle:hover { background:linear-gradient(135deg,var(--ember-mid,#DB5B1F),var(--ember)); color:#faf9f7; border-color:transparent; }
.LP-subnum {
  display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px;
  border-radius:50%; background:var(--ember); color:#faf9f7; font-family:var(--font-mono);
  font-size: 8px; font-weight:800;
}
/* Full-width row separating the Person and Client groups inside one merged
   table, standing in for what used to be two separate panel headers. */
.WP-tbl-section td {
  background:var(--ember-ghost); border-bottom:1px solid var(--ember-border);
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px;
  text-transform:uppercase; color:#C2410C; padding:7px 12px; text-align:left;
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
  0%, 100% { box-shadow: 0 8px 28px rgba(154,52,18,0.28), 0 0 0 0 rgba(154,52,18,0.35); }
  50%      { box-shadow: 0 8px 28px rgba(154,52,18,0.28), 0 0 0 10px rgba(154,52,18,0); }
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
  background: linear-gradient(160deg, #F5F3EF 0%, #FBC9A8 55%, #FBC9A8 100%);
  border: 2px solid #FBC9A8;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 20; border-radius: 10.5px; overflow: hidden;
}
.LP-cel-ring {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  border: 2.5px solid rgba(154,52,18,0.18);
  animation: lp-cel-ring-pulse 1s ease-out 0.1s both;
}
.LP-cel-ring2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  border: 1.5px solid rgba(154,52,18,0.09);
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
  background: linear-gradient(135deg, #C2410C, #DB5B1F);
  border: 3px solid rgba(154,52,18,0.18);
  box-shadow: 0 8px 28px rgba(154,52,18,0.28);
  display: flex; align-items: center; justify-content: center;
  animation: lp-cel-check-glow 1.4s ease-in-out 0.7s infinite;
}
.LP-cel-txt {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 17px; font-weight: 900; color: #C2410C;
  letter-spacing: 3px; text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(154,52,18,0.10);
}
.LP-cel-sub {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10.5px; color: #9A3412; margin-top: -8px; font-weight: 700;
}
.LP-cel-amt-badge {
  position: relative;
  padding: 8px 20px;
  background: #faf9f7;
  border: 1.5px solid #FBC9A8;
  box-shadow: 0 2px 12px rgba(154,52,18,0.10);
  border-radius: 100px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 15px; font-weight: 800; color: #C2410C; margin-top: 4px;
  overflow: hidden;
}
.LP-cel-amt-badge::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(219,91,31,0.35), transparent);
  animation: lp-cel-badge-shimmer 1.6s ease-in-out 0.9s infinite;
}
.LP-cel-confetti {
  position: absolute; border-radius: 3px;
  animation: lp-cel-confetti-fly 1.1s ease-out both;
}

/* ── STEP 2 CARD (matches Step 1 structure) ── */
.LP-step2-card {
  border:1px solid var(--ember-border); border-radius:11px; background:var(--white);
  margin-bottom:12px; overflow:visible;
  box-shadow:0 2px 8px rgba(0,0,0,.03);
}
/* No entrance animation on this card: an animated container (even one whose
   animation has already finished) creates a CSS stacking context, which
   traps the Party/Category/Sub-Head/Associate Name dropdown panels below —
   they stop floating above the Cash Book Entry Preview card underneath and
   instead get painted behind/under it, reading as overlapping text. */
.LP-step2-head {
  display:flex; align-items:center; gap:7px; padding:8px 12px;
  background:linear-gradient(135deg,rgba(194,65,12,.10),rgba(194,65,12,.04));
  border-bottom:1px solid var(--ember-border); border-radius:9.5px 9.5px 0 0;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:1.2px; text-transform:uppercase; color:#DB5B1F;
}
.LP-step2-body { padding:13px 12px; }
.LP-dd-trigger { min-height:46px; box-sizing:border-box; border-radius:10px; }
.LP-dd-trigger.open { border-bottom-left-radius:0; border-bottom-right-radius:0; }

/* ── CLIENT PICK LIST (Step 1 — choose bills to close) ── */
@keyframes wp-pick-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
.WP-client-pick { border:1px solid var(--ember-border); border-radius:11px; overflow:hidden; margin-bottom:14px; background:var(--white); animation:wp-pick-in .3s ease both; box-shadow:0 1px 5px rgba(0,0,0,.03); }
.WP-pick-head { display:flex; align-items:center; gap:7px; padding:8px 12px; background:linear-gradient(135deg,rgba(194,65,12,.10),rgba(194,65,12,.04)); border-bottom:1px solid var(--ember-border); font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.2px; text-transform:uppercase; color:#DB5B1F; }
.WP-pick-actions { margin-left:auto; display:flex; gap:5px; }
.WP-pick-link {
  display:inline-flex; align-items:center; gap:4px;
  border-radius:100px; font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:.8px; cursor:pointer; text-transform:uppercase; padding:5px 12px;
  transition:all .18s cubic-bezier(.34,1.56,.64,1);
}
.WP-pick-link.all {
  background:linear-gradient(135deg,#DB5B1F,#C2410C); border:1px solid transparent;
  color:#faf9f7; box-shadow:0 2px 8px rgba(194,65,12,.3);
}
.WP-pick-link.all:hover { transform:translateY(-1px) scale(1.03); box-shadow:0 4px 14px rgba(194,65,12,.45); }
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
.WP-pick-tablewrap::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#F0834D,#C2410C); border-radius:100px; }
.WP-pick-tablewrap::-webkit-scrollbar-thumb:hover { background:var(--ember); }
.WP-pick-table { width:100%; border-collapse:collapse; }
.WP-pick-table thead th {
  position:sticky; top:0; z-index:1;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.2px; text-transform:uppercase;
  color:var(--text-3,#3A3024); padding:8px 10px; border-bottom:2px solid var(--ember,#C2410C);
  background:var(--surface-2,#E8E2D8); text-align:left; white-space:nowrap;
}
.WP-pick-table tbody tr {
  cursor:pointer; border-bottom:1px solid var(--border);
  transition:background .15s, box-shadow .15s;
  animation:lp-subrow-in .5s cubic-bezier(.34,1.56,.64,1) both;
}
.WP-pick-table tbody tr:last-child { border-bottom:none; }
.WP-pick-table tbody tr:hover { background:rgba(194,65,12,.06); }
.WP-pick-table tbody tr.on { background:linear-gradient(90deg,rgba(194,65,12,.12),rgba(194,65,12,.04)); }
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
.WP-pick-chk:checked { background:linear-gradient(135deg,#F0834D,#C2410C); border-color:transparent; box-shadow:0 2px 8px rgba(194,65,12,.4); }
.WP-pick-chk:checked::after {
  content:''; position:absolute; left:5.5px; top:2px; width:4px; height:9px;
  border:solid #faf9f7; border-width:0 2px 2px 0; transform:rotate(45deg);
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
.LP-pick-prog i { display:block; height:100%; border-radius:100px; background:linear-gradient(90deg,#F0834D,#C2410C); transition:width .45s ease; }
.LP-max-chip {
  flex-shrink:0; padding:4px 10px; border-radius:100px; border:1px solid var(--ember-border);
  background:var(--ember-ghost); color:var(--ember); font-family:var(--font-mono);
  font-size: 8px; font-weight: 800; letter-spacing:1px; text-transform:uppercase;
  cursor:pointer; transition:all .18s;
}
.LP-max-chip:hover:not(:disabled) { background:var(--ember); color:#faf9f7; transform:translateY(-1px); box-shadow:0 3px 10px rgba(194,65,12,.3); }
.LP-max-chip:disabled { opacity:.4; cursor:not-allowed; }

.WP-split-preview {
  background:linear-gradient(135deg,rgba(194,65,12,0.07),rgba(194,65,12,0.02));
  border:1.5px solid rgba(194,65,12,0.32); border-radius:12px; overflow:hidden; margin-top:16px;
  animation:wp-pick-in .3s ease both;
  box-shadow:0 6px 20px rgba(194,65,12,.1);
}
.WP-split-head {
  padding:11px 16px; background:linear-gradient(135deg,#F0834D,#C2410C); border-bottom:1px solid rgba(194,65,12,0.15);
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.8px;
  text-transform:uppercase; color:#faf9f7; display:flex; align-items:center; gap:7px;
}
.WP-split-tbl { width:100%; border-collapse:collapse; }
.WP-split-tbl th {
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase;
  color:var(--text-4); padding:9px 14px; border-bottom:1px solid rgba(194,65,12,0.15);
  background:rgba(194,65,12,0.05); text-align:left;
}
.WP-split-tbl td { padding:10px 14px; font-family:var(--font-mono); font-size: 9.5px; border-bottom:1px solid rgba(194,65,12,0.1); }
.WP-split-tbl tr:last-child td { border-bottom:none; }
.WP-split-closed { color:#9A3412 !important; font-weight: 800; }
.WP-split-bar {
  display:flex; align-items:center; gap:18px; padding:12px 16px;
  border-top:1px solid rgba(194,65,12,0.15); background:rgba(194,65,12,0.08); flex-wrap:wrap;
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
.WP-alloc-closed  { color:#9A3412; font-weight: 800; }
.WP-alloc-partial { color:#DB5B1F; font-weight: 800; }

/* ── ALLOCATION ROW — simple, single-line, professional ── */
.LP-alloc-card {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:8px 12px; border-radius:8px; background:var(--white); border:1px solid var(--border);
  transition:border-color .15s;
}
.LP-alloc-card:hover { border-color:var(--border-2); }
.LP-alloc-left { display:flex; align-items:center; gap:8px; min-width:0; }
.LP-alloc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.LP-alloc-dot.closed  { background:#9A3412; }
.LP-alloc-dot.partial { background:#DB5B1F; }
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
.WP-toast-ok  { background:#9A3412; color:#faf9f7; }
.WP-toast-err { background:#D93B55; color:#faf9f7; }

.WP-loading {
  display:flex; align-items:center; justify-content:center; padding:64px 20px; gap:10px;
  font-family:var(--font-mono); font-size: 8px; letter-spacing:2px; text-transform:uppercase; color:var(--text-4);
}
.WP-loading-dot {
  width:6px; height:6px; border-radius:50%; background:#F0834D; display:inline-block;
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
`;

const authHeader = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });
const todayStr = () => new Date().toISOString().split('T')[0];
const fmt = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const fmtDateTime = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateFull = (d: string) => {
  const dt = new Date(d);
  return {
    date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const rateLabel = (w: { salary_type: string; daily_rate: number; monthly_salary: number }) => {
  if (w.salary_type === 'monthly' && w.monthly_salary > 0)
    return `${w.monthly_salary.toLocaleString('en-IN')}/mo`;
  if (w.salary_type === 'weekly' && w.daily_rate > 0)
    return `${(w.daily_rate || 0).toLocaleString('en-IN')}/wk`;
  return `${(w.daily_rate || 0).toLocaleString('en-IN')}/shift`;
};

function orderedSplit(
  items: { key: string; outstanding: number }[],
  amount: number
): Record<string, { allocated: number; outstanding_after: number; is_closed: boolean }> {
  const results: Record<string, { allocated: number; outstanding_after: number; is_closed: boolean }> = {};
  let remaining = amount;
  for (const c of items) {
    const take = parseFloat(Math.min(remaining, c.outstanding).toFixed(2));
    const after = parseFloat(Math.max(0, c.outstanding - take).toFixed(2));
    results[c.key] = { allocated: take, outstanding_after: after, is_closed: after <= 0.005 };
    remaining = parseFloat((remaining - take).toFixed(4));
    if (remaining <= 0.005) remaining = 0;
  }
  return results;
}

function Ico({ n, s = 16, c = 'currentColor' }: { n: string; s?: number; c?: string }) {
  const icons: Record<string, string> = {
    pay: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    money: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
    expand: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
    collapse: 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z',
    search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    labour: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    split: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
    setup: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    history: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{ flexShrink: 0 }}>
      <path d={icons[n] ?? icons.pay} />
    </svg>
  );
}

const SPATHS: Record<string, string> = {
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  cash: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  scale: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  circle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  arrowUp: 'M5 10l7-7m0 0l7 7m-7-7v18',
  arrowDown: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  transfer: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  bank: 'M3 21h18M4 10h16M6 10v11m4-11v11m4-11v11m4-11v11M12 3l8 4H4l8-4z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  more: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
  searchS: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  x: 'M6 18L18 6M6 6l12 12',
  checkS: 'M5 13l4 4L19 7',
  chevronDown: 'M5 8l7 7 7-7',
  inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  alert: 'M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1.5 1.5 0 003.5 20.5h17a1.5 1.5 0 001.39-2.46L13.71 3.86a1.5 1.5 0 00-2.42 0z',
};

function SIco({ n, s = 16, c = 'currentColor' }: { n: string; s?: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={SPATHS[n] ?? SPATHS.list} />
    </svg>
  );
}

// ── Success celebration (confetti/ring/stamp), ported from Credit Management's
// SuccessCelebration so Record Payment gets the same colorful, premium
// success moment instead of a plain toast. ──
const LP_CONFETTI_COLORS = ['#C2410C', '#DB5B1F', '#FBC9A8', '#FDE0CB', '#FBC9A8', '#faf9f7', '#FBC9A8', '#F0834D', '#FDE0CB'];

function LPConfettiPieces({ seed = 0, count = 22 }: { seed?: number; count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const n = i + seed * 7;
    return {
      id: i,
      color: LP_CONFETTI_COLORS[n % LP_CONFETTI_COLORS.length],
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
        <div key={p.id} className="LP-cel-confetti" style={{
          left: p.left, top: p.top, width: p.size, height: p.size,
          background: p.color, animationDelay: p.delay,
          animationDuration: `${900 + (p.id * 55) % 500}ms`,
          ['--lp-cel-drift' as any]: `${p.drift}px`,
          transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
    </>
  );
}

function LPSparklePieces() {
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
        <svg key={s.id} className="LP-cel-sparkle" width={s.size} height={s.size} viewBox="0 0 24 24"
          style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          fill="#DB5B1F">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      ))}
    </>
  );
}

function LPSuccessCelebration({ title, sub, amountText, onDone, duration = 1800 }: {
  title: string; sub?: string; amountText?: string; onDone: () => void; duration?: number;
}) {
  const [burstTwo, setBurstTwo] = useState(false);
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    const b = setTimeout(() => setBurstTwo(true), 450);
    return () => { clearTimeout(t); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="LP-cel-ov">
      <LPConfettiPieces seed={0} />
      {burstTwo && <LPConfettiPieces seed={1} count={16} />}
      <LPSparklePieces />
      <div className="LP-cel-ring" />
      <div className="LP-cel-ring2" />
      <div className="LP-cel-stamp-wrap">
        <div className="LP-cel-check">
          <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="LP-cel-txt">{title}</div>
        {sub && <div className="LP-cel-sub">{sub}</div>}
        {amountText && <div className="LP-cel-amt-badge">{amountText}</div>}
      </div>
    </div>
  );
}

function AnimCount({ value, duration = 900 }: { value: number; duration?: number }) {
  const [disp, setDisp] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number>(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current, to = value;
    start.current = null;
    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const p = Math.min((ts - start.current) / duration, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisp(Math.round(from + (to - from) * e));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else prev.current = to;
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{disp.toLocaleString('en-IN')}</>;
}

function ModeSticker({ mode }: { mode: string }) {
  const m = MODE_META[mode] ?? MODE_META.other;
  return (
    <span
      className="LP-mode-badge"
      style={{ background: m.color + '18', color: m.color, borderColor: m.color + '44' }}
    >
      <SIco n={m.icon} s={11} c={m.color} />
      {m.label}
    </span>
  );
}

function AllocCard({ name, before, after, allocated, closed }: {
  name: string; before: number; after: number; allocated: number; closed: boolean;
}) {
  return (
    <div className={`LP-alloc-card ${closed ? 'closed' : 'partial'}`}>
      <div className="LP-alloc-left">
        <span className={`LP-alloc-dot ${closed ? 'closed' : 'partial'}`} />
        <span className="LP-alloc-card-name">{name}</span>
        <span className="LP-alloc-status">{closed ? 'Closed' : 'Partial'}</span>
      </div>
      <div className="LP-alloc-right">
        <span className="LP-alloc-flow">₹{fmt(before)} → ₹{fmt(after)}</span>
        <span className="LP-alloc-paid">₹{fmt(allocated)}</span>
      </div>
    </div>
  );
}

function ModeDD({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [query, setQuery] = useState('');
  const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !panelRef.current?.contains(t)) { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  useLayoutEffect(() => {
    if (!open || !ref.current) { setPanelPos(null); return; }
    const reposition = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const pw = Math.max(r.width, 220), mg = 8;
      let lx = r.left;
      if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
      if (lx < mg) lx = mg;
      const spaceBelow = Math.max(160, window.innerHeight - r.bottom - mg);
      setPanelPos({ position: 'fixed', left: lx, top: r.bottom + 6, width: pw, maxHeight: Math.min(320, spaceBelow), zIndex: 2147483647 });
    };
    
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const options = Object.entries(MODE_META)
    .filter(([, m]) => m.label.toLowerCase().includes(query.toLowerCase()));
  const pick = (v: string) => { onChange(v); setOpen(false); setQuery(''); };
  return (
    <div className="LP-dd LP-dd-mode" ref={ref}>

      {/* Select Mode Start */}
      <button type="button" ref={triggerRef} className={`LP-dd-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
        <span className="LP-dd-content">
          {MODE_META[value]
            ? <span className="LP-dd-mode-txt">{MODE_META[value].label}</span>
            : <span className="LP-dd-ph">Select mode…</span>}
        </span>
        <span className={`LP-dd-chevron${open ? ' open' : ''}`}><SIco n="chevronDown" s={13} /></span>
      </button>
      {/* Select Mode End */}

      {open && panelPos && createPortal(
        <div ref={el => { panelRef.current = el; }} className="LP-dd-panel LP-dd-panel-mode" style={panelPos}>

          {/* Options List Start */}
          <div className="LP-dd-list LP-dd-list-mode">
            {options.map(([k]) => (
              <div key={k} role="option" tabIndex={-1} aria-selected={value === k} className={`LP-dd-item LP-dd-item-mode${value === k ? ' sel' : ''}`} onClick={() => pick(k)}>
                <span className={`LP-dd-check${value === k ? ' checked' : ''}`}>
                  {value === k && (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="LP-dd-mode-txt">{MODE_META[k].label}</span>
              </div>
            ))}
          </div>
          {/* Options List End */}

        </div>,
        document.body
      )}
    </div>
  );
}

function ModeFilterDD({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  const q = query.toLowerCase();
  const showAll = 'all modes'.includes(q);
  const options = Object.entries(MODE_META).filter(([, m]) => m.label.toLowerCase().includes(q));
  const pick = (v: string) => { onChange(v); setOpen(false); setQuery(''); };

  return (
    <div className="LP-dd LP-dd-filter" ref={ref}>
      <button type="button" ref={triggerRef} className={`LP-dd-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
        <span className="LP-dd-content">
          {value && MODE_META[value]
            ? <ModeSticker mode={value} />
            : <span className="LP-dd-sel-label">All Modes</span>}
        </span>
        <span className={`LP-dd-chevron${open ? ' open' : ''}`}><SIco n="chevronDown" s={13} /></span>
      </button>

      {open && (
        <div className="LP-dd-panel" ref={panelRef}>
          <div className="LP-dd-search-row">
            <SIco n="searchS" s={13} c="var(--text-4)" />
            <input autoComplete="off"
              ref={inputRef}
              className="LP-dd-search"
              placeholder="Search payment mode…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" className="LP-dd-clr" onClick={() => setQuery('')}>
                <SIco n="x" s={10} />
              </button>
            )}
          </div>

          <div className="LP-dd-list">
            {showAll && (
              <div role="option" tabIndex={-1} aria-selected={value === ''} className={`LP-dd-item${value === '' ? ' sel' : ''}`} onClick={() => pick('')}>
                <span className="LP-dd-item-main">
                  <span className="LP-dd-sel-label">All Modes</span>
                  <span className="LP-dd-item-sub">Every payment method</span>
                </span>
                {value === '' && <SIco n="checkS" s={12} c="var(--ember)" />}
              </div>
            )}

            {options.length === 0 && !showAll ? (
              <div className="LP-dd-empty">
                <SIco n="inbox" s={14} c="var(--text-4)" />
                No results for "{query}"
              </div>
            ) : options.map(([k]) => (
              <div key={k} role="option" tabIndex={-1} aria-selected={value === k} className={`LP-dd-item${value === k ? ' sel' : ''}`} onClick={() => pick(k)}>
                <ModeSticker mode={k} />
                {value === k && <SIco n="checkS" s={12} c="var(--ember)" />}
              </div>
            ))}
          </div>

          <div className="LP-dd-footer">{options.length + (showAll ? 1 : 0)} options</div>
        </div>
      )}
    </div>
  );
}

interface LPDDOption { value: string; label: string; sub?: string; }
function LPDD({ options, value, onChange, placeholder, disabled = false, emptyMsg = 'No options' }: {
  options: LPDDOption[]; value: string; onChange: (v: string) => void;
  placeholder: string; disabled?: boolean; emptyMsg?: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find(o => o.value === value);
  const pick = (v: string) => { onChange(v); setOpen(false); setQuery(''); };

  return (
    <div className="LP-dd" ref={ref} style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>

      {/* Button Start */}
      <button type="button" ref={triggerRef} className={`LP-dd-trigger${open ? ' open' : ''}`} onClick={() => !disabled && setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
        <span className="LP-dd-content">
          {selected
            ? <span className="LP-dd-sel-label">{selected.label}</span>
            : <span className="LP-dd-ph">{placeholder}</span>}
        </span>
        <span className={`LP-dd-chevron${open ? ' open' : ''}`}><SIco n="chevronDown" s={13} /></span>
      </button>
      {/* Button End */}

      {/* Open Start */}
      {open && (
        <div className="LP-dd-panel" ref={panelRef}>

          {/* Set Name Start */}
          <div className="LP-dd-search-row">
            <SIco n="searchS" s={13} c="var(--text-4)" />
            <input autoComplete="off"
              ref={inputRef}
              className="LP-dd-search"
              placeholder="Search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" className="LP-dd-clr" onClick={() => setQuery('')}>
                <SIco n="x" s={10} />
              </button>
            )}
          </div>
          {/* Set Name End */}

          {/* Clear Section Start */}
          <div className="LP-dd-list">
            {value && (
              <div className="LP-dd-item LP-dd-clear" role="option" tabIndex={-1} aria-selected={false} onClick={() => pick('')}>
                <SIco n="x" s={10} c="var(--text-4)" /><span>Clear selection</span>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="LP-dd-empty">
                <SIco n="inbox" s={14} c="var(--text-4)" />
                {query ? `No results for "${query}"` : emptyMsg}
              </div>
            ) : filtered.map(opt => (
              <div key={opt.value} role="option" tabIndex={-1} aria-selected={value === opt.value} className={`LP-dd-item${value === opt.value ? ' sel' : ''}`} onClick={() => pick(opt.value)}>
                <span className="LP-dd-item-main">
                  <span className="LP-dd-sel-label">{opt.label}</span>
                  {opt.sub && <span className="LP-dd-item-sub">{opt.sub}</span>}
                </span>
                {value === opt.value && <SIco n="checkS" s={12} c="var(--ember)" />}
              </div>
            ))}
          </div>
          {/* Clear Section End */}
          <div className="LP-dd-footer">{filtered.length} / {options.length}</div>
        </div>
      )}
      {/* Open End */}
    </div>
  );
}

export default function LabourPayment() {
  const [userRole] = useState<string>(() => getStoredRole());
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const [pageSummary, setPageSummary] = useState<PageSummary | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerDetail | null>(null);
  const [showSubEarnings, setShowSubEarnings] = useState(false);
  const [celebrate, setCelebrate] = useState<{ show: boolean; sub: string; amountText: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'clear'>('all');
  const [page, setPage] = useState(1);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('cash');
  const [payNotes, setPayNotes] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  // The "select at least one…" hints below the picker tables only appear
  // once the user has actually tried to record a payment without picking
  // anything — not permanently, which read as a static instruction rather
  // than a warning.
  const [pickAttempted, setPickAttempted] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyModeFilter, setHistoryModeFilter] = useState('');
  const [historyFromDate, setHistoryFromDate] = useState('');
  const [historyToDate, setHistoryToDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedHistoryRow, setExpandedHistoryRow] = useState<number | null>(null);
  const [pageTab, setPageTab] = useState<'workers' | 'payments'>('workers');
  const [allSessions, setAllSessions] = useState<AllPaymentSession[]>([]);
  const [sessionsSummary, setSessionsSummary] = useState<PaymentsSummary | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsSearch, setSessionsSearch] = useState('');
  const [sessionsModeFilter, setSessionsModeFilter] = useState('');
  const [sessionsFromDate, setSessionsFromDate] = useState('');
  const [sessionsToDate, setSessionsToDate] = useState('');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [expandedAllSession, setExpandedAllSession] = useState<number | null>(null);
  const sessionsLoadedOnceRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useKeyboardFieldNav(rootRef);
  const [masterCats, setMasterCats] = useState<DBCategory[]>([]);
  const [masterSubs, setMasterSubs] = useState<DBSubCategory[]>([]);
  const [masterBios, setMasterBios] = useState<DBBio[]>([]);
  const [masterSNs, setMasterSNs] = useState<DBSubName[]>([]);
  const [syncDaybook, setSyncDaybook] = useState(true);
  const [dbDetailsOpen, setDbDetailsOpen] = useState(false);
  // The preview card itself stays closed by default — only opens when the
  // user actually wants to check what's about to be posted, instead of
  // taking up space on every load.
  const [dbPreviewOpen, setDbPreviewOpen] = useState(false);
  const [dbParty, setDbParty] = useState('');
  const [dbCat, setDbCat] = useState('');
  const [dbSub, setDbSub] = useState('');
  const [dbSN, setDbSN] = useState('');
  const [dbNarration, setDbNarration] = useState('');
  const showToast = (type: 'ok' | 'err', text: string) => {
    if (type === 'ok') appToast.success(text); else appToast.error(text);
  };

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/workforce/payment/workers');
      const raw = res.data?.data ?? res.data;
      setWorkers(Array.isArray(raw) ? raw : []);
      setPageSummary(res.data?.summary ?? null);
      setNeedsSetup(false);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 500 || status === 404) {
        setNeedsSetup(true);
      } else {
        showToast('err', 'Failed to load workers');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkers(); }, [loadWorkers]);
  const loadAllSessions = useCallback(async (opts?: { search?: string; mode?: string; from?: string; to?: string }) => {
    setSessionsLoading(true);
    try {
      const params: Record<string, string> = {};
      const s = opts?.search ?? sessionsSearch;
      const m = opts?.mode ?? sessionsModeFilter;
      const f = opts?.from ?? sessionsFromDate;
      const t = opts?.to ?? sessionsToDate;
      if (s) params.search = s;
      if (m) params.mode = m;
      if (f) params.from_date = f;
      if (t) params.to_date = t;
      const res = await axiosInstance.get('/api/workforce/payment/sessions', { params });
      const raw = res.data?.data ?? [];
      setAllSessions(Array.isArray(raw) ? raw : []);
      setSessionsSummary(res.data?.summary ?? null);
    } catch {
      showToast('err', 'Failed to load payment history');
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionsSearch, sessionsModeFilter, sessionsFromDate, sessionsToDate]);

  useEffect(() => {
    if (pageTab === 'payments' && !sessionsLoadedOnceRef.current) {
      sessionsLoadedOnceRef.current = true;
      loadAllSessions();
    }
  }, [pageTab, loadAllSessions]);

  useEffect(() => {
    if (!sessionsLoadedOnceRef.current) return;
    const t = setTimeout(() => loadAllSessions(), 350);
    return () => clearTimeout(t);
  }, [sessionsSearch, sessionsModeFilter, sessionsFromDate, sessionsToDate]);
  useEffect(() => { setPaymentsPage(1); }, [sessionsSearch, sessionsModeFilter, sessionsFromDate, sessionsToDate]);
  useEffect(() => { setHistoryPage(1); }, [historySearch, historyModeFilter, historyFromDate, historyToDate]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('master-data', { headers: authHeader() });
        setMasterCats(data.categories || []);
        setMasterSubs(data.sub_categories || []);
        setMasterBios(data.bio_data || []);
        setMasterSNs(data.sub_names || []);
      } catch {
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedWorker) return;
    const wname = selectedWorker.worker.name.toLowerCase().trim();
    const matched = masterBios.find(b => b.name.toLowerCase().trim() === wname);
    setDbParty(matched ? String(matched.id) : '');
    const labCat = masterCats.find(c =>
      (c.type || '').toLowerCase() === 'expense' && /labou?r|wage|salar|worker/i.test(c.name)
    );
    setDbCat(labCat ? String(labCat.id) : '');

    const workerSubCatId = selectedWorker.worker.sub_category_id;
    let subCatMatch = workerSubCatId
      ? masterSubs.find(s => s.id === Number(workerSubCatId) && (!labCat || (s.category_ids?.length ? s.category_ids.includes(labCat.id) : s.category_id === labCat.id)))
      : undefined;
    if (!subCatMatch && selectedWorker.worker.trade) {
      const tradeName = selectedWorker.worker.trade.trim().toLowerCase();
      subCatMatch = masterSubs.find(s => (!labCat || (s.category_ids?.length ? s.category_ids.includes(labCat.id) : s.category_id === labCat.id)) && s.name.trim().toLowerCase() === tradeName);
    }
    setDbSub(subCatMatch ? String(subCatMatch.id) : '');

    // Associate Name is no longer guessed here from "whichever sub-worker
    // earned the most overall" — that had nothing to do with who actually
    // gets settled in a given payment (see the effect below, which sets it
    // from the real payment selection instead).
    setDbSN('');
    setDbNarration(`Wage payment — ${selectedWorker.worker.name}`);
  }, [selectedWorker?.worker.id, masterBios, masterCats, masterSubs, masterSNs]);


  const runSetup = async () => {
    setSettingUp(true);
    try {
      await axiosInstance.get('/api/workforce/payment/setup');
      showToast('ok', 'Database ready!');
      setNeedsSetup(false);
      await loadWorkers();
    } catch {
      showToast('err', 'Setup failed — check server logs');
    } finally {
      setSettingUp(false);
    }
  };

  const openWorker = async (id: number) => {
    setDetailLoading(true);
    setPayAmount(''); setPayMode('cash'); setPayNotes(''); setExpandedSession(null);
    setSelectedClients([]);
    setShowFullHistory(false); setHistorySearch(''); setHistoryModeFilter(''); setHistoryFromDate(''); setHistoryToDate(''); setHistoryPage(1); setExpandedHistoryRow(null);
    setShowSubEarnings(false);
    try {
      const res = await axiosInstance.get(`/api/workforce/payment/workers/${id}`);
      setSelectedWorker(res.data?.data ?? res.data);
    } catch {
      showToast('err', 'Failed to load worker');
    } finally {
      setDetailLoading(false);
    }
  };

  // Resolves (and, if needed, creates) a sub_names master record for one
  // specific person's name under a given party — used both for the manual
  // "Associate Name" picker and for auto-resolving each Cash Book entry to
  // the actual person who was paid, instead of one name for everyone.
  const resolveSubNameIdByName = async (rawName: string, bioId: number): Promise<number | null> => {
    const name = rawName.trim();
    if (!name || !bioId) return null;
    const existing = masterSNs.find(sn =>
      sn.bio_data_id === bioId && sn.alternate_name.trim().toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.id;
    try {
      const res = await axiosInstance.post('sub-names',
        { alternate_name: name, bio_data_id: bioId },
        { headers: authHeader() }
      );
      const created = res.data?.data ?? res.data;
      if (created?.id) {
        setMasterSNs(prev => [...prev, { id: created.id, alternate_name: name, bio_data_id: bioId }]);
        return created.id;
      }
      const listRes = await axiosInstance.get('sub-names', { headers: authHeader() });
      const raw = listRes.data?.data ?? listRes.data ?? [];
      const list: DBSubName[] = Array.isArray(raw) ? raw : [];
      const found = list.find(sn =>
        sn.bio_data_id === bioId && (sn.alternate_name || '').trim().toLowerCase() === name.toLowerCase()
      );
      if (found) {
        setMasterSNs(list);
        return found.id;
      }
      return null;
    } catch {
      return null;
    }
  };

  const resolveSubNameId = async (): Promise<number | null> => {
    if (!dbSN) return null;
    if (dbSN.startsWith('id:')) return +dbSN.slice(3);
    if (!dbSN.startsWith('name:') || !dbParty) return null;
    return resolveSubNameIdByName(dbSN.slice(5), +dbParty);
  };

  const handlePay = async () => {
    if (!selectedWorker) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) { showToast('err', 'Enter a valid amount'); return; }
    if (selectedClients.length === 0) { setPickAttempted(true); showToast('err', 'Select at least one client to pay against'); return; }
    if (selectedPersons.length === 0) { setPickAttempted(true); showToast('err', 'Select at least one worker to settle'); return; }
    const selTotal = chosenPersonTargets.reduce((s, p) => s + p.outstanding, 0);
    if (amount > selTotal + 0.005) {
      showToast('err', `Amount exceeds selected worker's outstanding (₹${fmt(selTotal)})`);
      return;
    }
    if (syncDaybook) {
      if (!dbParty) { showToast('err', 'Select a Party Name for Cash Book sync (or turn sync off)'); return; }
      if (!dbCat) { showToast('err', 'Select an Expense Account Head for Cash Book sync (or turn sync off)'); return; }
    }
    setSaving(true);

    try {
      const res = await axiosInstance.post(
        `/api/workforce/payment/workers/${selectedWorker.worker.id}/pay`,
        { amount, payment_mode: payMode, notes: payNotes || null, clients: selectedClients, persons: selectedPersons }
      );
      const updatedWorker: WorkerDetail = res.data?.data ?? res.data;
      let daybookSynced = false;
      let syncedCount = 0;
      const failedLabels: string[] = [];
      if (syncDaybook) {
        try {
          // Each Cash Book entry is resolved to the SPECIFIC person that
          // allocation was actually paid to (from the backend's per-allocation
          // sub_worker_name, or from the chosen person when the backend
          // fallback path runs) — never the single manually-picked Associate
          // Name applied to every entry. The manual picker is now only a
          // fallback for legacy sessions that predate per-person tracking.
          const manualSnId = dbSN ? await resolveSubNameId() : null;
          const narrationBase = dbNarration || `Wage payment — ${selectedWorker.worker.name}`;
          const personSnCache = new Map<string, number | null>();
          const resolvePersonSn = async (person: string): Promise<number | null> => {
            const key = person.trim().toLowerCase();
            if (personSnCache.has(key)) return personSnCache.get(key) ?? null;
            const id = await resolveSubNameIdByName(person, +dbParty);
            personSnCache.set(key, id);
            return id;
          };
          const buildPayload = (amt: number, client: string | null, statusTag: string, snId: number | null, personLabel: string) => {
            const pl: Record<string, unknown> = {
              transaction_date: todayStr(),
              amount: amt,
              payment_mode: DB_MODE_MAP[payMode] || 'Cash',
              category_id: +dbCat,
              bio_data_id: +dbParty,
              narration: (client ? `${narrationBase} · ${client}${personLabel}${statusTag}` : `${narrationBase}${personLabel}${statusTag}`),
            };
            if (dbSub) pl.sub_category_id = +dbSub;
            if (snId) pl.sub_name_id = snId;
            if (client) pl.client_name = client;
            return pl;
          };
          const newSession = (updatedWorker?.sessions || []).reduce<PaymentSession | null>(
            (latest, s) => (!latest || s.id > latest.id) ? s : latest, null
          );
          const allocations = newSession?.allocations ?? [];
          type PayEntry = { amt: number; client: string | null; statusTag: string; person: string | null; isOwn: boolean; knownPerson: boolean };
          const entries: PayEntry[] = allocations
            .filter(a => a.allocated > 0.005)
            .map(a => {
              const raw = a.sub_worker_name;
              const isOwn = raw === '__OWN__';
              return {
                amt: a.allocated,
                client: a.client_name,
                statusTag: a.is_closed ? ' (bill closed)' : ' (partial)',
                person: (raw && !isOwn) ? raw : null,
                isOwn,
                knownPerson: raw !== null && raw !== undefined,
              };
            });
          if (entries.length === 0) {
            const targets = chosenPersonTargets.map(p => ({ key: p.key, outstanding: p.outstanding }));
            const split = orderedSplit(targets, amount);
            for (const p of chosenPersonTargets) {
              const alloc = split[p.key];
              if (alloc && alloc.allocated > 0.005) {
                entries.push({
                  amt: alloc.allocated,
                  client: p.client_name,
                  statusTag: alloc.is_closed ? ' (bill closed)' : ' (partial)',
                  person: p.is_own ? null : p.person,
                  isOwn: p.is_own,
                  knownPerson: true,
                });
              }
            }
          }

          const allocatedTotal = entries.reduce((s, e) => s + e.amt, 0);
          const leftover = parseFloat((amount - allocatedTotal).toFixed(2));
          if (leftover > 0.005) {
            entries.push({ amt: leftover, client: null, statusTag: ' (advance / unallocated)', person: null, isOwn: false, knownPerson: false });
          }

          if (entries.length === 0) {
            entries.push({ amt: amount, client: selectedClients.length > 0 ? selectedClients.join(', ') : null, statusTag: '', person: null, isOwn: false, knownPerson: false });
          }

          for (const e of entries) {
            try {
              let snId: number | null = null;
              let personLabel = '';
              if (e.isOwn) {
                snId = null;
              } else if (e.person) {
                snId = await resolvePersonSn(e.person);
                personLabel = ` (${e.person})`;
              } else if (!e.knownPerson) {
                snId = manualSnId;
                if (manualSnId && dbSNName) personLabel = ` (${dbSNName})`;
              }
              await axiosInstance.post('daybook', buildPayload(e.amt, e.client, e.statusTag, snId, personLabel), { headers: authHeader() });
              syncedCount++;
            } catch {
              failedLabels.push(e.client ? `${e.client} (₹${fmt(e.amt)})` : `Advance ₹${fmt(e.amt)}`);
            }
          }
          daybookSynced = syncedCount > 0;
        } catch {
          showToast('err', 'Payment saved, but Cash Book sync failed — add the entry manually in Cash Book');
        }
      }
      setSelectedWorker(updatedWorker);
      setPayAmount(''); setPayMode('cash'); setPayNotes(''); setSelectedClients([]); setSelectedPersons([]); setPickAttempted(false);
      if (!syncDaybook) {
        setCelebrate({ show: true, sub: `Paid to ${selectedWorker.worker.name}`, amountText: `₹${fmt(amount)}` });
      } else if (failedLabels.length > 0) {
        showToast('err', `Payment saved — ${syncedCount} Cash Book ${syncedCount === 1 ? 'entry' : 'entries'} synced, but failed for: ${failedLabels.join(', ')}. Add manually in Cash Book.`);
      } else if (daybookSynced) {
        setCelebrate({ show: true, sub: `${selectedWorker.worker.name} · ${syncedCount} Cash Book ${syncedCount === 1 ? 'entry' : 'entries'} synced`, amountText: `₹${fmt(amount)}` });
      }
      loadWorkers();
      window.dispatchEvent(new Event('erp:notifications-refresh'));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast('err', msg || 'Payment failed');
    } finally {
      setSaving(false);
    }
  };

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; sessionId: number | null; label: string; loading: boolean }>(
    { open: false, sessionId: null, label: '', loading: false }
  );

  const askDeleteSession = (session: { id: number; total_amount: number; paid_at: string; payment_mode: string }) => {
    setDeleteModal({
      open: true,
      sessionId: session.id,
      label: `₹${fmt(session.total_amount)} · ${fmtDateTime(session.paid_at)} · ${MODE_LABELS[session.payment_mode] || session.payment_mode}`,
      loading: false,
    });
  };

  const confirmDeleteSession = async () => {
    if (!deleteModal.sessionId) return;
    setDeleteModal(d => ({ ...d, loading: true }));
    try {
      await axiosInstance.delete(`/api/workforce/payment/sessions/${deleteModal.sessionId}`);
      if (selectedWorker) {
        const res = await axiosInstance.get(`/api/workforce/payment/workers/${selectedWorker.worker.id}`);
        setSelectedWorker(res.data?.data ?? res.data);
      }
      showToast('ok', 'Payment deleted');
      loadWorkers();
      if (sessionsLoadedOnceRef.current) loadAllSessions();
    } catch {
      showToast('err', 'Failed to delete');
    } finally {
      setDeleteModal({ open: false, sessionId: null, label: '', loading: false });
    }
  };

  const personKey = (clientName: string, person: string) => `${clientName}::${person}`;

  const availablePersons = useMemo(() => {
    if (!selectedWorker) return [] as (ClientPerson & { key: string; client_name: string })[];
    const out: (ClientPerson & { key: string; client_name: string })[] = [];
    selectedWorker.client_breakdown
      .filter(c => selectedClients.includes(c.client_name))
      .forEach(c => {
        (c.persons || []).filter(p => p.outstanding > 0.005).forEach(p => {
          out.push({ ...p, key: personKey(c.client_name, p.person), client_name: c.client_name });
        });
      });
    return out;
  }, [selectedWorker, selectedClients]);

  const chosenPersonTargets = useMemo(
    () => availablePersons.filter(p => selectedPersons.includes(p.key)),
    [availablePersons, selectedPersons]
  );

  // Keeps "Associate Name" (and therefore the Cash Book Sync preview) in
  // sync with who is actually selected to be settled in this payment —
  // Steps 1–2 above — instead of a static per-worker default. Unambiguous
  // only when exactly one non-"own work" person is selected; for 0, 2+, or
  // an own-work-only selection there's no single associate that applies (each
  // Cash Book entry resolves its own associate automatically at save time —
  // see handlePay), so it's left blank and the per-entry breakdown covers it.
  useEffect(() => {
    if (!selectedWorker) return;
    const nonOwn = chosenPersonTargets.filter(p => !p.is_own);
    if (nonOwn.length === 1 && nonOwn[0].person) {
      const subName = nonOwn[0].person;
      const matched = dbParty
        ? masterSNs.find(sn => sn.bio_data_id === +dbParty && sn.alternate_name.trim().toLowerCase() === subName.trim().toLowerCase())
        : undefined;
      setDbSN(matched ? `id:${matched.id}` : `name:${subName}`);
    } else if (chosenPersonTargets.length > 0) {
      setDbSN('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenPersonTargets, dbParty, masterSNs]);

  const selectedClientsOutstanding = useMemo(() => {
    if (!selectedWorker) return 0;
    return selectedWorker.client_breakdown
      .filter(c => selectedClients.includes(c.client_name))
      .reduce((s, c) => s + c.outstanding, 0);
  }, [selectedWorker, selectedClients]);

  const splitPreview = useMemo(() => {
    const amount = parseFloat(payAmount);
    if (!selectedWorker || !amount || amount <= 0) return null;
    if (chosenPersonTargets.length === 0) return null;
    return orderedSplit(chosenPersonTargets.map(p => ({ key: p.key, outstanding: p.outstanding })), amount);
  }, [payAmount, selectedWorker, chosenPersonTargets]);

  const selectedOutstanding = useMemo(
    () => chosenPersonTargets.reduce((s, p) => s + p.outstanding, 0),
    [chosenPersonTargets]
  );

  const toggleClient = (name: string) => {
    setSelectedClients(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
    setSelectedPersons([]);
  };

  const togglePerson = (key: string) => {
    setSelectedPersons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredWorkers = useMemo(() => {
    return workers
      .filter(w => {
        const q = search.toLowerCase();
        if (q && !w.name.toLowerCase().includes(q) && !(w.trade || '').toLowerCase().includes(q)) return false;
        if (filter === 'unpaid' && w.balance <= 0) return false;
        if (filter === 'clear' && w.balance > 0) return false;
        return true;
      })
      .sort((a, b) => b.balance - a.balance);
  }, [workers, search, filter]);
  useEffect(() => { setPage(1); }, [search, filter]);
  const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedWorkers = useMemo(
    () => filteredWorkers.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [filteredWorkers, safePage]
  );

  const pageNumbers = useMemo(() => {
    const nums: (number | '…')[] = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) nums.push(p);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    return nums;
  }, [totalPages, safePage]);
  const paymentsTotalPages = Math.max(1, Math.ceil(allSessions.length / PAY_PAGE_SIZE));
  const safePaymentsPage = Math.min(paymentsPage, paymentsTotalPages);
  const pagedSessions = useMemo(
    () => allSessions.slice((safePaymentsPage - 1) * PAY_PAGE_SIZE, safePaymentsPage * PAY_PAGE_SIZE),
    [allSessions, safePaymentsPage]
  );

  const paymentsPageNumbers = useMemo(
    () => buildPageNumbers(paymentsTotalPages, safePaymentsPage),
    [paymentsTotalPages, safePaymentsPage]
  );

  const parsedAmount = parseFloat(payAmount) || 0;
  const balanceAfter = selectedWorker ? Math.max(0, selectedWorker.balance - parsedAmount) : 0;
  // Party Name here is scoped to Labour/Wage bio-data only — this is the
  // Wage Distribution payment screen, so showing every party across every
  // category (clients, vendors, etc.) made the picker noisy and let a
  // non-labour party get chosen by mistake. Same "labour-ish" match used
  // for auto-picking the Expense Account Head above (labCat), applied by
  // category id here — bio_data rows only carry category_id from the
  // /master-data endpoint, never a category_name (that field was always
  // undefined, which is why the very first version of this filter matched
  // nothing and emptied the whole dropdown).
  const labourCategoryIds = new Set(
    masterCats
      .filter(c => (c.type || '').toLowerCase() === 'expense' && /labou?r|wage|salar|worker/i.test(c.name))
      .map(c => c.id)
  );
  const partyOptions = masterBios
    .filter(b => b.category_id != null && labourCategoryIds.has(b.category_id))
    .map(b => {
      const catName = masterCats.find(c => c.id === b.category_id)?.name;
      return { value: String(b.id), label: b.name, sub: catName };
    });
  const expCatOptions = masterCats
    .filter(c => !c.type || c.type.toLowerCase() === 'expense')
    .map(c => ({ value: String(c.id), label: c.name }));
  const dbSubOptions = dbCat
    ? masterSubs.filter(s => s.category_ids?.length ? s.category_ids.includes(+dbCat) : s.category_id === +dbCat).map(s => ({ value: String(s.id), label: s.name }))
    : [];

  const masterSNsForParty = dbParty ? masterSNs.filter(sn => sn.bio_data_id === +dbParty) : [];
  const workerSubNames = selectedWorker?.earnings_breakdown?.subs.map(sb => sb.sub_name) ?? [];
  const snOptions: { value: string; label: string; sub?: string }[] = [
    ...masterSNsForParty.map(sn => ({ value: `id:${sn.id}`, label: sn.alternate_name, sub: 'Core Records' })),
    ...workerSubNames
      .filter(n => !masterSNsForParty.some(sn => sn.alternate_name.trim().toLowerCase() === n.trim().toLowerCase()))
      .map(n => ({ value: `name:${n}`, label: n, sub: 'Manpower Register' })),
  ];

  const dbPartyName = masterBios.find(b => String(b.id) === dbParty)?.name || '';
  const dbCatName = masterCats.find(c => String(c.id) === dbCat)?.name || '';
  const dbSubName = masterSubs.find(s => String(s.id) === dbSub)?.name || '';
  const dbSNName = dbSN.startsWith('id:')
    ? (masterSNs.find(sn => String(sn.id) === dbSN.slice(3))?.alternate_name || '')
    : dbSN.startsWith('name:') ? dbSN.slice(5) : '';
  const dbEntriesPreview = (selectedWorker && splitPreview)
    ? chosenPersonTargets
      .map(p => ({ client: p.client_name, person: p.person, isOwn: p.is_own, alloc: splitPreview[p.key] }))
      .filter(e => e.alloc && e.alloc.allocated > 0.005)
    : [];
  const workerBioMatched = selectedWorker
    ? masterBios.find(b => b.name.toLowerCase().trim() === selectedWorker.worker.name.toLowerCase().trim())
    : undefined;

  // ── RENDER ────
  return (
    <div className="WP-page" ref={rootRef}>
      <style>{ERP_CSS}{CSS}</style>

      {/* BODY START */}
      <div className="WP-body">

        {/* ── HEADER START ── */}
        <div className="ERP-hdr">
          <div className="ERP-hdr-left">
            <div className="ERP-eyebrow">
              <span className="ERP-eyebrow-line" />
              <span className="ERP-eyebrow-dot" />
              Workforce &middot; Wage Disbursements
            </div>
            <h1 className="ERP-title MD-page-title">Wage <span className="ERP-title-em">Disbursements</span></h1>
          </div>
        </div>
        <div className="ERP-divider" />
        {/* ── HEADER END ── */}

        {/* SETUP REQUIRED START */}
        {needsSetup && !loading && (
          <div className="WP-setup-card">
            <div style={{ fontSize: 37, marginBottom: 14 }}>🛠️</div>
            <div className="WP-setup-title">One-time Setup Required</div>
            <div className="WP-setup-body">
              The new worker-centric payment system needs two database tables
              (<code>labour_payment_sessions</code> and <code>labour_payment_allocations</code>).
              Click below to create them automatically — or run <code>php artisan migrate</code> in your terminal.
            </div>
            <button className="WP-btn WP-btn-primary" onClick={runSetup} disabled={settingUp}>
              <Ico n="setup" s={14} c="#faf9f7" />
              {settingUp ? 'Creating Tables…' : 'Create Tables Now'}
            </button>
          </div>
        )}
        {/* SETUP REQUIRED END */}

        {/* ── WORKER DETAIL VIEW ───── */}
        {selectedWorker && (
          <>
            {/* All Workers Start */}
            <button className="WP-back-btn" onClick={() => setSelectedWorker(null)}>
              <span className="WP-back-btn-ico"><Ico n="back" s={12} /></span> All Workers
            </button>
            {/* All Workers End */}

            {!showFullHistory ? (
              <>
                {/* ── WORKER HERO HEADER (animated) ── */}
                <div className="LP-hero">

                  {/* Worker Start */}
                  <div
                    className="LP-hero-avatar"
                    style={{ background: avatarColor(selectedWorker.worker.id) }}
                  >
                    {initials(selectedWorker.worker.name)}
                  </div>
                  {/* Worker End */}

                  {/* Worker Details Start */}
                  <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                    <div className="LP-hero-name">{selectedWorker.worker.name}</div>
                    <div className="LP-hero-chips">
                      {/* Real trade only — a generic "Worker" placeholder chip
                          isn't a fact worth showing, so it's simply omitted
                          instead of displaying an empty-value label. */}
                      {selectedWorker.worker.trade && (
                        <span className="LP-chip">
                          <Ico n="labour" s={10} c="var(--ember)" />
                          {selectedWorker.worker.trade}
                        </span>
                      )}
                      <span className="LP-chip"><Ico n="money" s={10} c="var(--ember)" /> ₹{rateLabel(selectedWorker.worker)}</span>
                      <span className="LP-chip"><Ico n="split" s={10} c="var(--ember)" /> {selectedWorker.client_breakdown.length} Client{selectedWorker.client_breakdown.length !== 1 ? 's' : ''}</span>
                      <span className="LP-chip"><Ico n="history" s={10} c="var(--ember)" /> {selectedWorker.sessions.length} Payment{selectedWorker.sessions.length !== 1 ? 's' : ''}</span>
                      <span className="LP-chip" style={selectedWorker.balance > 0
                        ? { borderColor: 'var(--error-bd)', background: 'var(--error-bg)', color: 'var(--error)' }
                        : { borderColor: 'var(--success-bd)', background: 'var(--success-bg)', color: 'var(--success)' }}>
                        {selectedWorker.balance > 0 ? '● Balance Due' : '✓ All Clear'}
                      </span>
                    </div>
                  </div>  
                  {/* Worker Details End */}
                </div>
                {/* ── WORKER HERO HEADER END ── */}

                {/* ── STAT CARDS ── */}
                <div className="ERP-stats">

                  {/* TOTAL EARNED START */}
                  <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--success),#34D399)' }} />
                    <div className="ERP-stat-label">Total Earned</div>
                    <div className="ERP-stat-val" style={{ color: 'var(--success)', fontSize: 13, fontWeight: 800 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                      <AnimCount value={Math.round(selectedWorker.total_earned)} />
                    </div>
                  </div>
                  {/* TOTAL EARNED END */}

                  {/* PAID SO FAR START */}
                  <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--warn),var(--ember-mid))' }} />
                    <div className="ERP-stat-label">Paid So Far</div>
                    <div className="ERP-stat-val" style={{ color: 'var(--warn)', fontSize: 13, fontWeight: 800 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                      <AnimCount value={Math.round(selectedWorker.total_paid)} />
                    </div>
                  </div>
                  {/* PAID SO FAR END */}

                  {/* OUTSTANDING START */}
                  <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--error),#F87171)' }} />
                    <div className="ERP-stat-label">Outstanding</div>
                    <div className="ERP-stat-val" style={{ color: selectedWorker.balance > 0 ? 'var(--error)' : 'var(--success)', fontSize: 13, fontWeight: 800 }}>
                      {selectedWorker.balance > 0 ? (
                        <>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                          <AnimCount value={Math.round(selectedWorker.balance)} />
                        </>
                      ) : '✓ Clear'}
                    </div>
                  </div>
                  {/* OUTSTANDING END */}

                  {/* PAYMENTS COUNT START */}
                  <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--info),#F0834D)' }} />
                    <div className="ERP-stat-label">Payments</div>
                    <div className="ERP-stat-val" style={{ color: 'var(--info)', fontSize: 13, fontWeight: 800 }}>
                      <AnimCount value={selectedWorker.sessions.length} />
                    </div>
                  </div>
                  {/* PAYMENTS COUNT END */}

                </div>
                {/* ── STAT CARDS END ── */}

                {/* ── Breakdown Panels ── now ONE real <table> instead of two —
                     person rows and client rows share the same 7 columns,
                     separated only by a full-width section-label row. Paid/
                     Outstanding are tracked per client (not per person), so
                     those two cells are just "—" on person rows rather than
                     invented numbers. */}
                <div className="WP-layout">
                  <div className="WP-panel">
                    <div className="WP-panel-head">
                      <span className="LP-panel-ico"><Ico n="labour" s={14} c="var(--ember)" /></span>
                      <span className="WP-panel-title">Earnings &amp; Client Breakdown</span>
                      <span className="LP-count-pill">
                        {selectedWorker.client_breakdown.length} client{selectedWorker.client_breakdown.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="WP-tbl WP-tbl-fixed">
                        <colgroup>
                          <col style={{ width: '6%' }} />
                          <col style={{ width: '32%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '14%' }} />
                          <col style={{ width: '14%' }} />
                          <col style={{ width: '13%' }} />
                        </colgroup>

                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Name</th>
                            <th>Shifts</th>
                            <th>Earned</th>
                            <th>Paid</th>
                            <th>Outstanding</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {/* ── Person section ── */}
                          {selectedWorker.earnings_breakdown && selectedWorker.earnings_breakdown.subs.length > 0 && (
                            <>
                              <tr className="WP-tbl-section">
                                <td colSpan={7}>
                                  Earnings Breakdown — Own &amp; Sub Workers · {selectedWorker.earnings_breakdown.subs.length} sub worker{selectedWorker.earnings_breakdown.subs.length !== 1 ? 's' : ''}
                                </td>
                              </tr>
                              <tr>
                                <td className="ERP-t-num"><span className="LP-subnum">1</span></td>
                                <td>
                                  <div className="WP-tbl-name">{selectedWorker.worker.name}</div>
                                  <div className="WP-tbl-sub">Own work · head worker</div>
                                  <button
                                    type="button"
                                    className={`LP-subtoggle${showSubEarnings ? ' open' : ''}`}
                                    onClick={() => setShowSubEarnings(v => !v)}
                                  >
                                    {showSubEarnings ? 'Hide' : 'Show'} {selectedWorker.earnings_breakdown.subs.length} sub worker{selectedWorker.earnings_breakdown.subs.length !== 1 ? 's' : ''}
                                    <SIco n="chevronDown" s={9} c="currentColor" />
                                  </button>
                                </td>
                                <td><span className="WP-amt">{selectedWorker.earnings_breakdown.own.shifts}</span></td>
                                <td><span className="WP-amt">₹{fmt(selectedWorker.earnings_breakdown.own.earned)}</span></td>
                                <td><span className="WP-amt WP-amt-zero">—</span></td>
                                <td><span className="WP-amt WP-amt-zero">—</span></td>
                                <td>
                                  <span className="ERP-badge clear">
                                    <span className="ERP-badge-dot" />Own
                                  </span>
                                </td>
                              </tr>
                              {showSubEarnings && selectedWorker.earnings_breakdown.subs.map((s, si) => (
                                <tr key={s.sub_name} className="LP-subrow-anim" style={{ animationDelay: `${si * 0.09}s` }}>
                                  <td className="ERP-t-num"><span className="LP-subnum">{si + 2}</span></td>
                                  <td>
                                    <div className="WP-tbl-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                      {s.sub_name}
                                    </div>
                                    <div className="WP-tbl-sub">referred by {selectedWorker.worker.name}</div>
                                  </td>
                                  <td><span className="WP-amt">{s.shifts || '—'}</span></td>
                                  <td><span className="WP-amt">₹{fmt(s.earned)}</span></td>
                                  <td><span className="WP-amt WP-amt-zero">—</span></td>
                                  <td><span className="WP-amt WP-amt-zero">—</span></td>
                                  <td>
                                    <span className="ERP-badge unpaid">
                                      <span className="ERP-badge-dot" />Sub
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              <tr className="WP-tbl-total">
                                <td />
                                <td>TOTAL — {selectedWorker.worker.name}</td>
                                <td />
                                <td>₹{fmt(selectedWorker.total_earned)}</td>
                                <td />
                                <td />
                                <td />
                              </tr>
                            </>
                          )}

                          {/* ── Client section ── */}
                          <tr className="WP-tbl-section">
                            <td colSpan={7}>
                              Client-wise Breakdown · {selectedWorker.client_breakdown.length} client{selectedWorker.client_breakdown.length !== 1 ? 's' : ''}
                            </td>
                          </tr>
                          {selectedWorker.client_breakdown.map((c, ci) => {
                            const settled = c.outstanding <= 0;
                            const paidPct = c.earned > 0 ? Math.min(100, Math.round((c.paid / c.earned) * 100)) : 0;
                            return (
                              <tr
                                key={c.client_name}
                                className={`LP-anim-row ${settled ? 'WP-tbl-settled' : 'WP-tbl-outstanding'}`}
                                style={{ animationDelay: `${ci * 0.06}s` }}
                              >
                                <td className="ERP-t-num">{ci + 1}</td>
                                <td>
                                  <div className="WP-tbl-name">{c.client_name}</div>
                                  <div className="LP-prog"><i style={{ width: `${paidPct}%` }} /></div>
                                  <div className="LP-prog-lbl">{paidPct}% settled</div>
                                </td>
                                <td>
                                  <span className="WP-amt">{c.shifts}</span>
                                </td>
                                <td>
                                  <span className="WP-amt">₹{fmt(c.earned)}</span>
                                </td>
                                <td>
                                  <span className={`WP-amt ${c.paid > 0 ? 'WP-amt-paid' : 'WP-amt-zero'}`}>
                                    {c.paid > 0 ? `₹${fmt(c.paid)}` : '—'}
                                  </span>
                                </td>
                                <td>
                                  {c.outstanding > 0
                                    ? <span className="WP-amt WP-amt-due">₹{fmt(c.outstanding)}</span>
                                    : <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--success)', fontSize: 10.5 }}>✓ Clear</span>}
                                </td>
                                <td>
                                  <span className={`ERP-badge ${settled ? 'clear' : 'unpaid'}`}>
                                    <span className="ERP-badge-dot" />
                                    {settled ? 'Settled' : 'Unpaid'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="WP-tbl-total">
                            <td />
                            <td>TOTAL</td>
                            <td>
                              {selectedWorker.client_breakdown.reduce((sum, c) => sum + (c.shifts || 0), 0)}
                            </td>
                            <td>₹{fmt(selectedWorker.total_earned)}</td>
                            <td>₹{fmt(selectedWorker.total_paid)}</td>
                            <td>
                              {selectedWorker.balance > 0 ? `₹${fmt(selectedWorker.balance)}` : '✓ Clear'}
                            </td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* merged panel end */}

                </div>
                {/* ── Breakdown panels end ── */}

                {/* ── Record Payment + Payment History — paired side by side ── */}
                <div className="WP-pay-layout">

                  {/* LEFT: Payment Form */}
                  <div style={{ position: 'relative' }}>
                    {celebrate?.show && (
                      <LPSuccessCelebration
                        title="Payment Recorded!"
                        sub={celebrate.sub}
                        amountText={celebrate.amountText}
                        onDone={() => setCelebrate(null)}
                      />
                    )}
                    {/* Payment Form Start */}
                    {selectedWorker.balance > 0 ? (
                      <div className="WP-panel LP-pay-panel">
                        <div className="WP-panel-head">
                          <span className="LP-panel-ico"><Ico n="money" s={14} c="var(--ember)" /></span>
                          <span className="WP-panel-title">Record Payment</span>
                          <span className="LP-count-pill">₹{fmt(selectedWorker.balance)} due</span>
                        </div>
                        <div className="WP-pay-section">

                          {/* ── STEP 1: CHOOSE CLIENTS START ── */}
                          <div className="WP-client-pick">

                            {/* Select Clients Start */}
                            <div className="WP-pick-head">
                              <span className="LP-step">1</span>
                              Select clients to settle (oldest work first)
                              <div className="WP-pick-actions">
                                <button type="button" className="WP-pick-link all"
                                  onClick={() => setSelectedClients(selectedWorker.client_breakdown.filter(c => c.outstanding > 0).map(c => c.client_name))}>
                                  <SIco n="checkS" s={10} c="currentColor" /> All
                                </button>
                                <button type="button" className="WP-pick-link none" onClick={() => setSelectedClients([])}>
                                  <SIco n="x" s={9} c="currentColor" /> None
                                </button>
                              </div>
                            </div>
                            {/* Select Client End */}

                            <div className="WP-pick-tablewrap">
                              <table className="WP-pick-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: 26 }} />
                                    <th style={{ width: 30 }}>No.</th>
                                    <th>Client</th>
                                    <th>Since</th>
                                    <th style={{ textAlign: 'right' }}>Outstanding</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedWorker.client_breakdown.filter(c => c.outstanding > 0).map((c, idx) => {
                                    const on = selectedClients.includes(c.client_name);
                                    return (
                                      <tr
                                        key={c.client_name}
                                        className={on ? 'on' : ''}
                                        onClick={() => toggleClient(c.client_name)}
                                        style={{ animationDelay: `${Math.min(idx, 10) * 0.07}s` }}
                                      >
                                        <td className="WP-pick-chkcell" onClick={e => e.stopPropagation()}>
                                          <input autoComplete="off"
                                            type="checkbox"
                                            className="WP-pick-chk"
                                            checked={on}
                                            onChange={() => toggleClient(c.client_name)}
                                          />
                                        </td>
                                        <td className="WP-pick-num">{idx + 1}</td>
                                        <td className="WP-pick-primary">{c.client_name}</td>
                                        <td className="WP-pick-meta">
                                          {c.first_date ? new Date(c.first_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="WP-pick-amt">₹{fmt(c.outstanding)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Outstanding Start */}
                            {(selectedClients.length > 0 || pickAttempted) && (
                              <div className={`WP-pick-foot${selectedClients.length === 0 ? ' warn-blink' : ''}`}>
                                {selectedClients.length > 0
                                  ? <>
                                    Selected: <b>{selectedClients.length}</b> client{selectedClients.length !== 1 ? 's' : ''} · Outstanding <b style={{ color: 'var(--amt-strong)' }}>₹{fmt(selectedClientsOutstanding)}</b> of ₹{fmt(selectedWorker.balance)}
                                    <div className="LP-pick-prog">
                                      <i style={{ width: `${selectedWorker.balance > 0 ? Math.min(100, Math.round((selectedClientsOutstanding / selectedWorker.balance) * 100)) : 0}%` }} />
                                    </div>
                                  </>
                                  : <><SIco n="alert" s={10} c="currentColor" /> Select at least one client — payment will close bills in FIFO order</>}
                              </div>
                            )}
                            {/* Outstanding End */}

                          </div>
                          {/* ── STEP 1: CHOOSE CLIENTS END ── */}

                          {/* ── STEP 2: CHOOSE LABOUR TO SETTLE START ── */}
                          <div className="WP-client-pick">

                            {/* Select Manpower Start */}
                            <div className="WP-pick-head">
                              <span className="LP-step">2</span>
                              Select workers to settle (from the client{selectedClients.length !== 1 ? 's' : ''} above)
                              <div className="WP-pick-actions">
                                <button type="button" className="WP-pick-link all"
                                  disabled={availablePersons.length === 0}
                                  onClick={() => setSelectedPersons(availablePersons.map(p => p.key))}>
                                  <SIco n="checkS" s={10} c="currentColor" /> All
                                </button>
                                <button type="button" className="WP-pick-link none" onClick={() => setSelectedPersons([])}>
                                  <SIco n="x" s={9} c="currentColor" /> None
                                </button>
                              </div>
                            </div>
                            {/* Select Manpower End */}

                            {selectedClients.length === 0 ? (
                              pickAttempted ? (
                                <div className="WP-pick-foot warn-blink">
                                  <SIco n="alert" s={10} c="currentColor" /> Select a client above first — the workers (own work + any sub-workers) working under them will list here.
                                </div>
                              ) : (
                                <div className="WP-pick-empty-hint">
                                  <SIco n="arrowUp" s={12} c="var(--text-4)" />
                                  Pick a client above to load their workers
                                </div>
                              )
                            ) : availablePersons.length === 0 ? (
                              <div className="WP-pick-foot">No outstanding balance for the selected client{selectedClients.length !== 1 ? 's' : ''}.</div>
                            ) : (
                              <div className="WP-pick-tablewrap">
                                <table className="WP-pick-table">
                                  <thead>
                                    <tr>
                                      <th style={{ width: 26 }} />
                                      <th style={{ width: 30 }}>No.</th>
                                      <th>Manpower</th>
                                      <th>Client</th>
                                      <th style={{ textAlign: 'center' }}>Shifts</th>
                                      <th style={{ textAlign: 'right' }}>Outstanding</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {availablePersons.map((p, idx) => {
                                      const on = selectedPersons.includes(p.key);
                                      const label = p.is_own ? `${selectedWorker.worker.name} · Own Work` : p.person;
                                      return (
                                        <tr
                                          key={p.key}
                                          className={on ? 'on' : ''}
                                          onClick={() => togglePerson(p.key)}
                                          style={{ animationDelay: `${Math.min(idx, 10) * 0.07}s` }}
                                        >
                                          <td className="WP-pick-chkcell" onClick={e => e.stopPropagation()}>
                                            <input autoComplete="off"
                                              type="checkbox"
                                              className="WP-pick-chk"
                                              checked={on}
                                              onChange={() => togglePerson(p.key)}
                                            />
                                          </td>
                                          <td className="WP-pick-num">{idx + 1}</td>
                                          <td className="WP-pick-primary">{label}</td>
                                          <td className="WP-pick-meta">{p.client_name}</td>
                                          <td className="WP-pick-meta" style={{ textAlign: 'center' }}>{p.shifts}</td>
                                          <td className="WP-pick-amt">₹{fmt(p.outstanding)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Outstanding Start */}
                            {(selectedPersons.length > 0 || pickAttempted) && selectedClients.length > 0 && (
                              <div className={`WP-pick-foot${selectedPersons.length === 0 ? ' warn-blink' : ''}`}>
                                {selectedPersons.length > 0
                                  ? <>
                                    Selected: <b>{selectedPersons.length}</b> worker(s) · Outstanding <b style={{ color: 'var(--amt-strong)' }}>₹{fmt(selectedOutstanding)}</b>
                                    <div className="LP-pick-prog">
                                      <i style={{ width: `${selectedWorker.balance > 0 ? Math.min(100, Math.round((selectedOutstanding / selectedWorker.balance) * 100)) : 0}%` }} />
                                    </div>
                                  </>
                                  : <><SIco n="alert" s={10} c="currentColor" /> Select at least one worker — payment will close their bill(s) in FIFO order</>}
                              </div>
                            )}
                            {/* Outstanding End */}

                          </div>
                          {/* ── STEP 2: CHOOSE LABOUR TO SETTLE END ── */}

                          {/* ── STEP 3: AMOUNT & MODE ── */}
                          <div className="LP-step2-card">

                            {/* Payment Mode Start */}
                            <div className="LP-step2-head">
                              <span className="LP-step">3</span>
                              Enter amount &amp; payment mode
                            </div>
                            {/* Payment Mode End */}

                            <div className="LP-step2-body">
                              <div className="WP-field-grid WP-field-grid-2col">

                                {/* Amount Start — its own full-width row */}
                                <div className="WP-field WP-field-full">
                                  <label className="WP-field-lbl">Amount</label>
                                  <div className="WP-amount-wrap">
                                    <span className="WP-amount-prefix">₹</span>
                                    <input autoComplete="off"
                                      type="number"
                                      className="WP-amount-input"
                                      placeholder="0"
                                      value={payAmount}
                                      min={0}
                                      step={0.01}
                                      onChange={e => setPayAmount(e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="LP-max-chip"
                                      title="Fill selected worker's full outstanding"
                                      disabled={selectedOutstanding <= 0}
                                      onClick={() => setPayAmount(selectedOutstanding.toFixed(2))}
                                    >
                                      Max
                                    </button>
                                  </div>
                                </div>
                                {/* Amount End */}

                                {/* Mode Start */}
                                <div className="WP-field">
                                  <label className="WP-field-lbl">Mode</label>
                                  <ModeDD value={payMode} onChange={setPayMode} />
                                </div>
                                {/* Mode End */}

                                {/* Notes Start */}
                                <div className="WP-field">
                                  <label className="WP-field-lbl">Notes (optional)</label>
                                  <input autoComplete="off"
                                    type="text"
                                    className="WP-notes"
                                    placeholder="advance, partial payment…"
                                    value={payNotes}
                                    onChange={e => setPayNotes(e.target.value)}
                                  />
                                </div>
                                {/* Notes End */}
                              </div>
                            </div>
                          </div>
                          {/* ── STEP 3: AMOUNT & MODE END ── */}

                          {/* Live Split Preview Start */}
                          {splitPreview && (
                            <div className="WP-split-preview">
                              {/* Live Preview Start */}
                              <div className="WP-split-head">
                                <Ico n="split" s={13} c="#faf9f7" />
                                Live Preview — Ordered Close (FIFO · oldest bill first)
                              </div>
                              {/* Live Preview End */}

                              {/* Table Start */}
                              <div style={{ overflowX: 'auto' }}>
                                <table className="WP-split-tbl">

                                  {/* Thead Start */}
                                  <thead>
                                    <tr>
                                      <th>Manpower</th>
                                      <th style={{ textAlign: 'right' }}>Owed</th>
                                      <th style={{ textAlign: 'right' }}>Gets</th>
                                      <th style={{ textAlign: 'right' }}>After</th>
                                      <th style={{ textAlign: 'center' }}>Status</th>
                                    </tr>
                                  </thead>
                                  {/* Thead End */}

                                  {/* Tbody Start */}
                                  <tbody>
                                    {chosenPersonTargets.map(p => {
                                      const sp = splitPreview[p.key];
                                      if (!sp) return null;
                                      const label = p.is_own ? `${selectedWorker.worker.name} (Own)` : p.person;
                                      return (
                                        <tr key={p.key}>
                                          <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                                            {label}
                                            <span style={{ display: 'block', fontSize: 8.5, fontWeight: 600, color: 'var(--text-4)' }}>{p.client_name}</span>
                                          </td>
                                          <td style={{ textAlign: 'right', color: 'var(--amt-strong)' }}>₹{fmt(p.outstanding)}</td>
                                          <td style={{ textAlign: 'right', color: 'var(--amt-strong)', fontWeight: 800 }}>
                                            ₹{fmt(sp.allocated)}
                                          </td>
                                          <td style={{ textAlign: 'right' }}>
                                            {sp.outstanding_after > 0
                                              ? <span style={{ color: 'var(--amt-strong)', fontWeight: 800 }}>₹{fmt(sp.outstanding_after)}</span>
                                              : <span className="WP-split-closed">✓ CLOSED</span>}
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <span className={`WP-badge ${sp.is_closed ? 'WP-badge-closed' : 'WP-badge-partial'}`}>
                                              {sp.is_closed ? 'Closed' : 'Partial'}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  {/* Tbody End */}
                                </table>
                              </div>
                              {/* Table End */}

                              {/* Paying Start */}
                              <div className="WP-split-bar">
                                <div className="WP-split-bar-item">
                                  Paying: <b>₹{fmt(parsedAmount)}</b>
                                </div>
                                {/* Paying End */}

                                {/* Balance Start */}
                                <div className="WP-split-bar-item">
                                  Balance after: <b style={{ color: 'var(--amt-strong)' }}>
                                    {balanceAfter > 0 ? `₹${fmt(balanceAfter)}` : '✓ Fully Cleared'}
                                  </b>
                                </div>
                                {/* Balance End */}

                                {/* Selected Start */}
                                <div className="WP-split-bar-item">
                                  Closed: <b style={{ color: '#9A3412' }}>
                                    {Object.values(splitPreview).filter(s => s.is_closed).length}
                                  </b>/{selectedPersons.length} selected
                                </div>
                                {/* Selected End */}

                              </div>
                            </div>
                          )}
                          {/* Live Split Preview End */}

                          {/* WP Pay Footer Start */}
                          <div className="WP-pay-footer">
                            <div className="WP-pay-total">
                              {selectedPersons.length > 0
                                ? <>Selected outstanding: <span>₹{fmt(selectedOutstanding)}</span></>
                                : <>Total outstanding: <span>₹{fmt(selectedWorker.balance)}</span></>}
                              {parsedAmount > 0 && selectedPersons.length > 0 && parsedAmount <= selectedOutstanding + 0.005 && (
                                <>
                                  {' '}→ After payment: <span style={{ color: 'var(--amt-strong)' }}>
                                    {selectedOutstanding - parsedAmount > 0.005 ? `₹${fmt(selectedOutstanding - parsedAmount)}` : '✓ Selected bills clear'}
                                  </span>
                                </>
                              )}
                              {selectedPersons.length > 0 && parsedAmount > selectedOutstanding + 0.005 && (
                                <span style={{ color: 'var(--ember)', marginLeft: 8, fontWeight: 800 }}>
                                  ⚠ Amount exceeds selected outstanding
                                </span>
                              )}
                            </div>
                            {/* Button Start */}

                            {/* CLear Start */}
                            <button
                              className="WP-btn WP-btn-outline WP-btn-sm"
                              onClick={() => { setPayAmount(''); setPayNotes(''); setSelectedClients([]); setSelectedPersons([]); setPickAttempted(false); }}
                            >
                              Clear
                            </button>
                            {/* Clear End */}

                            {/* Delete Start */}
                            <button
                              className="WP-btn WP-btn-green"
                              onClick={handlePay}
                              disabled={saving || !payAmount || parsedAmount <= 0 || selectedPersons.length === 0 || parsedAmount > selectedOutstanding + 0.005}
                            >
                              <Ico n="check" s={14} c="#faf9f7" />
                              {saving
                                ? (syncDaybook ? 'Saving & Syncing…' : 'Saving…')
                                : (syncDaybook ? 'Confirm & Sync Payment' : 'Confirm Payment')}
                            </button>
                            {/* Delete End */}

                            {/* Button End */}
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="WP-panel" style={{ padding: '28px', textAlign: 'center' }}>
                        <div style={{ fontSize: 31.5, marginBottom: 8 }}>✅</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 800, color: '#9A3412', letterSpacing: 1 }}>
                          ALL PAYMENTS CLEARED
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)', marginTop: 6 }}>
                          No outstanding balance for {selectedWorker.worker.name}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Left Form End  */}

                  {/* RIGHT: DAYBOOK SYNC + PAYMENT HISTORY, stacked ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* ── DAYBOOK SYNC ── */}
                    {selectedWorker.balance > 0 && (
                      <div className="LP-step2-card">
                        <div className="LP-step2-head">
                          <span className="LP-step">4</span>
                          Cash Book Sync
                          <label className="LP-sync-toggle">
                            <input autoComplete="off"
                              type="checkbox"
                              checked={syncDaybook}
                              onChange={e => setSyncDaybook(e.target.checked)}
                            />
                            Post to Cash Book automatically
                          </label>
                          {syncDaybook && (
                            <button
                              type="button"
                              className={`LP-db-details-toggle${dbDetailsOpen ? ' open' : ''}`}
                              onClick={() => setDbDetailsOpen(o => !o)}
                            >
                              {dbDetailsOpen ? 'Hide details' : 'Edit party / category'}
                              <SIco n="chevronDown" s={9} c="currentColor" />
                            </button>
                          )}
                        </div>

                        {syncDaybook ? (
                          <div className="LP-step2-body">
                            {dbDetailsOpen && (
                              <div className="LP-db-grid">
                                <div className="WP-field">
                                  <label className="WP-field-lbl">Party Name *</label>
                                  <LPDD
                                    options={partyOptions}
                                    value={dbParty}
                                    onChange={v => { setDbParty(v); setDbSN(''); }}
                                    placeholder="Select party…"
                                    emptyMsg="No parties found"
                                  />
                                  {workerBioMatched && dbParty === String(workerBioMatched.id) && (
                                    <div className="LP-hint">✓ Auto-matched: {workerBioMatched.name}</div>
                                  )}
                                </div>
                                <div className="WP-field">
                                  <label className="WP-field-lbl">Expense Account Head *</label>
                                  <LPDD
                                    options={expCatOptions}
                                    value={dbCat}
                                    onChange={v => { setDbCat(v); setDbSub(''); }}
                                    placeholder="Select category…"
                                    emptyMsg="No expense categories"
                                  />
                                  {dbCat && dbCatName && (
                                    <div className="LP-hint">✓ Posts as Debit — {dbCatName}</div>
                                  )}
                                </div>
                                <div className="WP-field">
                                  <label className="WP-field-lbl">Account Sub-Head</label>
                                  <LPDD
                                    options={dbSubOptions}
                                    value={dbSub}
                                    onChange={setDbSub}
                                    placeholder={!dbCat ? 'Select category first…' : dbSubOptions.length === 0 ? 'No sub-categories' : 'Select sub-category…'}
                                    disabled={!dbCat || dbSubOptions.length === 0}
                                    emptyMsg="No sub-categories"
                                  />
                                </div>
                                <div className="WP-field">
                                  <label className="WP-field-lbl">Associate Name (if different from Party)</label>
                                  <LPDD
                                    options={snOptions}
                                    value={dbSN}
                                    onChange={setDbSN}
                                    placeholder={snOptions.length === 0
                                      ? (dbParty ? 'No associate names for this worker' : 'Select party first…')
                                      : 'Select associate name…'}
                                    disabled={snOptions.length === 0}
                                    emptyMsg="No associate names"
                                  />
                                  {dbSNName && dbSN.startsWith('id:') && (
                                    <div className="LP-hint">✓ Entry will be tagged under associate name: {dbSNName}</div>
                                  )}
                                  {dbSNName && dbSN.startsWith('name:') && (
                                    <div className="LP-hint">✓ From Manpower Register — will be added to Master &amp; tagged in Cash Book: {dbSNName}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {!workerBioMatched && !dbDetailsOpen && (
                              <div className="LP-db-warn">
                                <SIco n="alert" s={10} c="#C2410C" />
                                No party auto-matched — <button type="button" onClick={() => setDbDetailsOpen(true)}>select one</button> before recording.
                              </div>
                            )}

                            {/* ── DAYBOOK ENTRY PREVIEW START ── */}
                            <div className="LP-db-preview">
                              <button
                                type="button"
                                className="LP-db-preview-head"
                                onClick={() => setDbPreviewOpen(o => !o)}
                              >
                                <SIco n="circle" s={11} c="#1E9C6A" />
                                Cash Book Entry Preview
                                <span className={`LP-db-preview-chev${dbPreviewOpen ? ' open' : ''}`}>
                                  <SIco n="chevronDown" s={11} c="#1E9C6A" />
                                </span>
                              </button>

                              {dbPreviewOpen && (
                              <>
                              {/* Preview Body Start */}
                              <div className="LP-db-preview-body">
                                <span>Date: <b>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b></span>
                                <span>Mode: <b>{DB_MODE_MAP[payMode] || 'Cash'}</b></span>
                                <span>Party: <b>{dbPartyName || '—'}</b></span>
                                <span>Account Head: <b>{dbCatName || '—'}</b></span>
                                {dbSubName && <span>Sub-cat: <b>{dbSubName}</b></span>}
                                {dbSNName && <span>Associate Name: <b>{dbSNName}</b></span>}
                                <span className="LP-db-span">Narration: <b>{dbNarration || '—'}</b></span>
                                {/* Reflects exactly who was picked in Step 2 above for THIS
                                    payment — not the worker's full sub-worker roster. Each name
                                    here gets its own Cash Book entry with its own associate
                                    name resolved automatically (see handlePay), independent of
                                    the single Associate Name field above. */}
                                {chosenPersonTargets.length > 0 && (
                                  <span className="LP-db-span">
                                    Workers in This Payment: <b>{chosenPersonTargets.length}</b> — {chosenPersonTargets.map(p => p.is_own ? 'Own Work' : p.person).join(', ')}
                                  </span>
                                )}
                              </div>
                              {/* Preview Bod */}

                              {/* Per-client Entry Split Start */}
                              {dbEntriesPreview.length > 0 ? (
                                <div className="LP-db-entries">
                                  <div className="LP-db-entries-title">
                                    {dbEntriesPreview.length} Cash Book {dbEntriesPreview.length === 1 ? 'entry' : 'entries'} will be created — one per worker settled
                                  </div>
                                  {dbEntriesPreview.map((e, i) => (
                                    <div key={`${e.client}::${e.person}`} className="LP-db-entry">
                                      <span className="LP-db-entry-num">{i + 1}</span>
                                      <span className="LP-db-entry-client">{e.client}{e.isOwn ? ' · Own Work' : ` · ${e.person}`}</span>
                                      <span className={`LP-db-entry-status ${e.alloc.is_closed ? 'closed' : 'partial'}`}>
                                        {e.alloc.is_closed ? 'Bill Closed' : 'Partial'}
                                      </span>
                                      <span className="LP-db-entry-amt">₹{fmt(e.alloc.allocated)}</span>
                                    </div>
                                  ))}
                                </div>
                                // Per Client Entry Split End
                              ) : (
                                <div className="LP-db-entries">
                                  <div className="LP-db-entry">
                                    <span className="LP-db-entry-client" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                                      {selectedPersons.length > 0 ? 'Enter an amount to preview the split' : 'Select clients & workers, then enter amount to preview entries'}
                                    </span>
                                    <span className="LP-db-entry-amt">{parsedAmount > 0 ? `₹${fmt(parsedAmount)}` : '—'}</span>
                                  </div>
                                </div>
                              )}
                              </>
                              )}
                            </div>
                            {/* DAYBOOK ENTRY PREVIEW END  */}
                          </div>
                        ) : (
                          <div className="LP-db-note">
                            Sync is off — this payment will NOT create a Cash Book entry.
                          </div>
                        )}
                      </div>
                    )}
                    {/* ── DAYBOOK SYNC END ── */}

                    {/* RIGHT: PAYMENT HISTORY START */}
                    <div className="WP-panel" style={{ display: 'flex', flexDirection: 'column' }}>

                      {/* Payment History Start */}
                      <div className="WP-panel-head">
                        <span className="LP-panel-ico"><Ico n="history" s={14} c="var(--ember)" /></span>
                        <span className="WP-panel-title">Payment History</span>
                        <span className="LP-count-pill">
                          {selectedWorker.sessions.length > 5 ? `Last 5 of ${selectedWorker.sessions.length}` : `${selectedWorker.sessions.length} record${selectedWorker.sessions.length !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      {/* Payment History End */}

                      {/* Payment Records Start */}
                      <div className="WP-history-list">
                        {selectedWorker.sessions.length === 0 ? (
                          <div className="WP-history-empty">
                            <div style={{ fontSize: 24.5, marginBottom: 8 }}>📭</div>
                            No Payment Records yet
                          </div>
                        ) : (
                          selectedWorker.sessions.slice(0, 5).map((session, sidx) => (
                            <div key={session.id} className="WP-session" style={{ animationDelay: `${sidx * 0.05}s` }}>
                              <div
                                className="WP-session-header"
                                onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                              >
                                <div className="WP-session-icon">
                                  <Ico n="check" s={16} c="#9A3412" />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div className="WP-session-amount" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    ₹{fmt(session.total_amount)}
                                    <ModeSticker mode={session.payment_mode} />
                                  </div>
                                  <div className="WP-session-meta">
                                    {fmtDateTime(session.paid_at)}
                                    {session.allocations && session.allocations.length > 0 && (
                                      <>&nbsp;·{' '}
                                        <span className="WP-session-names">
                                          {[...new Set(session.allocations.map(a => a.sub_worker_name || selectedWorker.worker.name))].join(', ')}
                                        </span>
                                      </>
                                    )}
                                    {session.notes && <>&nbsp;· {session.notes}</>}
                                  </div>
                                </div>

                                {/* Session Actions Start */}
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                  {canDelete(userRole) ? (
                                    <button
                                      className="WP-btn WP-btn-red WP-btn-sm"
                                      onClick={e => { e.stopPropagation(); askDeleteSession(session); }}
                                      title="Delete payment"
                                    >
                                      <Ico n="trash" s={11} c="#faf9f7" />
                                    </button>
                                  ) : (
                                    <CreatorBadge name={session.created_by_name} />
                                  )}
                                  <Ico
                                    n={expandedSession === session.id ? 'collapse' : 'expand'}
                                    s={18}
                                    c="var(--text-4)"
                                  />
                                </div>
                                {/* Session Actions End */}
                              </div>

                              {expandedSession === session.id && (
                                <div className="WP-session-allocs">
                                  {session.allocations.filter(a => a.allocated > 0).map(a => (
                                    <AllocCard
                                      key={a.id}
                                      name={a.client_name}
                                      before={a.outstanding_before}
                                      after={a.outstanding_after}
                                      allocated={a.allocated}
                                      closed={a.is_closed}
                                    />
                                  ))}

                                  {session.allocations.filter(a => a.allocated > 0).length === 0 && (
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)', padding: '4px 0' }}>
                                      No allocations Recorded
                                    </div>
                                  )}

                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      {/* Payment Records End */}

                      {selectedWorker.sessions.length > 5 && (
                        <button className="WP-view-all-btn" onClick={() => setShowFullHistory(true)}>
                          View All {selectedWorker.sessions.length} Transactions
                          <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
                            <Ico n="back" s={11} c="currentColor" />
                          </span>
                        </button>
                      )}

                    </div>
                    {/* RIGHT: PAYMENT HISTORY END */}

                  </div>
                  {/* RIGHT COLUMN END */}
                </div>
              </>
            ) : (
              /* ── FULL PAYMENT HISTORY — dedicated screen, this worker only ── */
              (() => {
                const filteredHistory = selectedWorker.sessions.filter(s => {
                  if (historyModeFilter && s.payment_mode !== historyModeFilter) return false;
                  const paidDateStr = new Date(s.paid_at).toISOString().split('T')[0];
                  if (historyFromDate && paidDateStr < historyFromDate) return false;
                  if (historyToDate && paidDateStr > historyToDate) return false;
                  if (!historySearch) return true;
                  const q = historySearch.toLowerCase();
                  return (s.notes || '').toLowerCase().includes(q)
                    || s.allocations.some(a => a.client_name.toLowerCase().includes(q));
                });
                const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / PAY_PAGE_SIZE));
                const safeHistoryPage = Math.min(historyPage, historyTotalPages);
                const pagedHistory = filteredHistory.slice((safeHistoryPage - 1) * PAY_PAGE_SIZE, safeHistoryPage * PAY_PAGE_SIZE);
                const historyPageNumbers = buildPageNumbers(historyTotalPages, safeHistoryPage);
                return (
                  <>
                    {/* ── FULL HISTORY HEADER ── */}
                    <div className="LP-hero" style={{ marginBottom: 20 }}>
                      <div className="LP-hero-avatar" style={{ background: avatarColor(selectedWorker.worker.id) }}>
                        {initials(selectedWorker.worker.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                        <div className="LP-hero-name">{selectedWorker.worker.name} — Full Payment History</div>
                        <div className="LP-hero-chips">
                          <span className="LP-chip"><b>{selectedWorker.sessions.length}</b> Total Transaction{selectedWorker.sessions.length !== 1 ? 's' : ''}</span>
                          <span className="LP-chip">Paid <b>₹{fmt(selectedWorker.total_paid)}</b></span>
                        </div>
                      </div>
                      <button className="WP-back-btn" style={{ marginBottom: 0, flexShrink: 0 }} onClick={() => setShowFullHistory(false)}>
                        <span className="WP-back-btn-ico"><Ico n="back" s={12} /></span> Back to Worker
                      </button>
                    </div>
                    {/* ── FULL HISTORY HEADER END ── */}

                    <div className="ERP-tbl-card">
                      <div className="ERP-tbl-hdr">
                        <div>
                          <div className="ERP-tbl-title">All Transactions</div>
                          <div className="ERP-tbl-sub">Every payment recorded for {selectedWorker.worker.name} — click a row for the client-wise split</div>
                        </div>
                        <div className="LP-tbl-toolbar">
                          <div className="LP-date-range">
                            <div className="LP-date-field">
                              <CalendarDD value={historyFromDate} onChange={setHistoryFromDate} max={historyToDate} />
                            </div>
                            <span className="LP-date-sep">to</span>
                            <div className="LP-date-field">
                              <CalendarDD value={historyToDate} onChange={setHistoryToDate} min={historyFromDate} />
                            </div>
                            {(historyFromDate || historyToDate) && (
                              <button
                                type="button"
                                className="LP-date-clear"
                                title="Clear date range"
                                onClick={() => { setHistoryFromDate(''); setHistoryToDate(''); }}
                              >
                                <SIco n="x" s={13} />
                              </button>
                            )}
                          </div>
                          <ModeFilterDD value={historyModeFilter} onChange={setHistoryModeFilter} />
                          <div className="WP-search-wrap">
                            <span className="WP-search-icon">
                              <Ico n="search" s={15} c="var(--text-4)" />
                            </span>
                            <input autoComplete="off"
                              type="text"
                              className="WP-search"
                              placeholder="Search client, notes…"
                              value={historySearch}
                              onChange={e => setHistorySearch(e.target.value)}
                            />
                          </div>
                          <span className="ERP-tbl-count">{filteredHistory.length} / {selectedWorker.sessions.length}</span>
                        </div>
                      </div>

                      {filteredHistory.length === 0 ? (
                        <div className="ERP-empty">
                          <div className="ERP-empty-icon">
                            <Ico n="history" s={24} c="var(--ember)" />
                          </div>
                          <div className="ERP-empty-title">No transactions found</div>
                          <div className="ERP-empty-sub">
                            {historySearch || historyModeFilter || historyFromDate || historyToDate ? 'No payments match your search or filter' : 'No payments recorded yet'}
                          </div>
                        </div>
                      ) : (
                        <div className="ERP-tbl-scroll LP-tbl-scroll">
                          <table className="ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl">
                            <colgroup>
                              <col style={{ width: 52 }} />
                              <col style={{ width: '16%' }} />
                              <col style={{ width: '20%' }} />
                              <col style={{ width: '12%' }} />
                              <col style={{ width: '10%' }} />
                              <col style={{ width: '21%' }} />
                              <col style={{ width: '9%' }} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'center' }}>S.No</th>
                                <th>Date &amp; Time</th>
                                <th>Amount</th>
                                <th style={{ textAlign: 'center' }}>Mode</th>
                                <th style={{ textAlign: 'center' }}>Clients</th>
                                <th>Paid To (top client)</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody key={safeHistoryPage} className="LP-page-fade">
                              {pagedHistory.map((session, i) => {
                                const paidAllocs = session.allocations.filter(a => a.allocated > 0);
                                const dt = fmtDateFull(session.paid_at);
                                const topClient = paidAllocs.slice().sort((a, b) => b.allocated - a.allocated)[0];
                                return (
                                  <React.Fragment key={session.id}>
                                    <tr
                                      className="LP-row LP-pay-row"
                                      style={{ animationDelay: `${i * 0.035}s` }}
                                      onClick={() => setExpandedHistoryRow(expandedHistoryRow === session.id ? null : session.id)}
                                    >
                                      <td className="ERP-t-num">{(safeHistoryPage - 1) * PAY_PAGE_SIZE + i + 1}</td>
                                      <td>
                                        <div className="LP-dt-cell">
                                          <span className="LP-dt-date">{dt.date}</span>
                                          <span className="LP-dt-time">{dt.time}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <span className="WP-amt WP-amt-paid LP-amt-highlight">₹{fmt(session.total_amount)}</span>
                                      </td>
                                      <td style={{ textAlign: 'center' }}><ModeSticker mode={session.payment_mode} /></td>
                                      <td style={{ textAlign: 'center' }}>
                                        <span className="ERP-badge id-num">{paidAllocs.length}</span>
                                      </td>
                                      <td>
                                        {topClient ? (
                                          <div className="LP-paidto">
                                            <span className="LP-worker-name LP-paidto-name">{topClient.client_name}</span>
                                            {paidAllocs.length > 1 && (
                                              <span className="LP-paidto-more">+{paidAllocs.length - 1}</span>
                                            )}
                                          </div>
                                        ) : (
                                          <span style={{ fontSize: 10, color: 'var(--text-4)', fontStyle: 'italic' }}>
                                            {session.notes || 'No allocation'}
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
                                          {canDelete(userRole) ? (
                                            <button
                                              className="WP-btn WP-btn-red WP-btn-sm"
                                              onClick={e => { e.stopPropagation(); askDeleteSession(session); }}
                                              title="Delete payment"
                                            >
                                              <Ico n="trash" s={11} c="#faf9f7" />
                                            </button>
                                          ) : (
                                            <CreatorBadge name={session.created_by_name} />
                                          )}
                                          <Ico n={expandedHistoryRow === session.id ? 'collapse' : 'expand'} s={16} c="var(--text-4)" />
                                        </div>
                                      </td>
                                    </tr>
                                    {expandedHistoryRow === session.id && (
                                      <tr className="LP-expand-row">
                                        <td colSpan={7}>
                                          <div className="WP-session-allocs" style={{ padding: '12px 6px' }}>
                                            <div className="LP-expand-meta">
                                              <span>Session {session.id}</span>
                                              <span>{dt.date}, {dt.time}</span>
                                              <span>{MODE_LABELS[session.payment_mode] || session.payment_mode}</span>
                                              {session.notes && <span>{session.notes}</span>}
                                            </div>
                                            {paidAllocs.length === 0 ? (
                                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)', padding: '4px 0' }}>
                                                No allocations recorded
                                              </div>
                                            ) : paidAllocs.map(a => (
                                              <AllocCard
                                                key={a.id}
                                                name={a.client_name}
                                                before={a.outstanding_before}
                                                after={a.outstanding_after}
                                                allocated={a.allocated}
                                                closed={a.is_closed}
                                              />
                                            ))}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {filteredHistory.length > PAY_PAGE_SIZE && (
                        <div className="LP-pgn">
                          <span className="LP-pgn-info">
                            Showing <b>{(safeHistoryPage - 1) * PAY_PAGE_SIZE + 1}</b>–<b>{Math.min(safeHistoryPage * PAY_PAGE_SIZE, filteredHistory.length)}</b> of <b>{filteredHistory.length}</b> transactions
                          </span>
                          <button
                            className="LP-pgn-btn"
                            disabled={safeHistoryPage <= 1}
                            onClick={() => setHistoryPage(safeHistoryPage - 1)}
                          >
                            ‹ Prev
                          </button>
                          {historyPageNumbers.map((p, idx) =>
                            p === '…' ? (
                              <span key={`hdots-${idx}`} className="LP-pgn-dots">…</span>
                            ) : (
                              <button
                                key={p}
                                className={`LP-pgn-btn ${p === safeHistoryPage ? 'on' : ''}`}
                                onClick={() => setHistoryPage(p)}
                              >
                                {p}
                              </button>
                            )
                          )}
                          <button
                            className="LP-pgn-btn"
                            disabled={safeHistoryPage >= historyTotalPages}
                            onClick={() => setHistoryPage(safeHistoryPage + 1)}
                          >
                            Next ›
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()
            )}
          </>
        )}

        {/* ── WORKER LIST VIEW ──────── */}
        {!selectedWorker && !needsSetup && (
          <>
            {/* ── PAGE TABS — Workers / All Payments ── */}
            <div className="LP-view-tabs">
              <button
                className={'LP-view-tab' + (pageTab === 'workers' ? ' active' : '')}
                onClick={() => setPageTab('workers')}
              >
                <Ico n="labour" s={13} c="currentColor" />
                Workers
              </button>
              <button
                className={'LP-view-tab' + (pageTab === 'payments' ? ' active' : '')}
                onClick={() => setPageTab('payments')}
              >
                <Ico n="history" s={13} c="currentColor" />
                All Payments
                {sessionsSummary && <span className="LP-view-tab-badge">{sessionsSummary.sessions_count}</span>}
              </button>
            </div>
            {/* ── PAGE TABS END ── */}

            {pageTab === 'workers' && (
              <>
                {/* ── STAT CARDS (same UI as Cash Book create page) ── */}
                {pageSummary && (
                  <div className="ERP-stats">

                    {/* TOTAL WORKERS START */}
                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),#F0834D)' }} />
                      <div className="ERP-stat-label">Total Workers</div>
                      <div className="ERP-stat-val" style={{ color: 'var(--ember)', fontSize: 13, fontWeight: 800 }}>
                        <AnimCount value={pageSummary.total_workers} />
                      </div>
                    </div>
                    {/* TOTAL WORKERS END */}

                    {/* TOTAL EARNED START */}
                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#C2410C,#F0834D)' }} />
                      <div className="ERP-stat-label">Total Earned</div>
                      <div className="ERP-stat-val" style={{ color: 'var(--amt-strong)', fontSize: 13, fontWeight: 800 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                        <AnimCount value={Math.round(pageSummary.total_earned)} />
                      </div>
                    </div>
                    {/* TOTAL EARNED END */}

                    {/* TOTAL PAID START */}
                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#9A3412,#DB5B1F)' }} />
                      <div className="ERP-stat-label">Total Paid</div>
                      <div className="ERP-stat-val" style={{ color: 'var(--amt-strong)', fontSize: 13, fontWeight: 800 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                        <AnimCount value={Math.round(pageSummary.total_paid)} />
                      </div>
                    </div>
                    {/* TOTAL PAID END */}

                    {/* TOTAL UNPAID START */}
                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#F0834D,var(--ember-mid))' }} />
                      <div className="ERP-stat-label">Total Unpaid</div>
                      <div className="ERP-stat-val" style={{ color: 'var(--amt-strong)', fontSize: 13, fontWeight: 800 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                        <AnimCount value={Math.round(pageSummary.total_unpaid)} />
                      </div>
                    </div>
                    {/* TOTAL UNPAID END */}

                  </div>
                )}
                {/* ── STAT CARDS END ── */}

                {/* ── ALL WORKERS TABLE (Master-data style, compact) ── */}
                <div className="ERP-tbl-card">

                  {/* Table Header Start */}
                  <div className="ERP-tbl-hdr">
                    <div>
                      <div className="ERP-tbl-title">All Workers</div>
                      <div className="ERP-tbl-sub">Click a row to view breakdown &amp; record payment</div>
                    </div>
                    <div className="LP-tbl-toolbar">
                      <div className="WP-tabs">
                        {(['all', 'unpaid', 'clear'] as const).map(f => (
                          <button
                            key={f}
                            className={`WP-tab ${filter === f ? 'WP-tab-active' : ''}`}
                            onClick={() => setFilter(f)}
                          >
                            {f === 'all' ? 'All' : f === 'unpaid' ? 'Unpaid' : 'Cleared'}
                          </button>
                        ))}
                      </div>
                      <div className="WP-search-wrap">
                        <span className="WP-search-icon">
                          <Ico n="search" s={15} c="var(--text-4)" />
                        </span>
                        <input autoComplete="off"
                          type="text"
                          className="WP-search"
                          placeholder="Search worker…"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>
                      <span className="ERP-tbl-count">{filteredWorkers.length} / {workers.length}</span>
                    </div>
                  </div>
                  {/* Table Header End */}

                  {/* Table or Loading (skeleton shimmer rows) */}
                  {loading ? (
                    <div className="ERP-tbl-scroll LP-tbl-scroll">
                      <table className="ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl">
                        <colgroup>
                          <col style={{ width: 52 }} />
                          <col style={{ width: '21%' }} />
                          <col style={{ width: '9%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '9%' }} />
                          <col style={{ width: '9%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'center' }}>S.No</th>
                            <th>Worker</th>
                            <th>Rate</th>
                            <th style={{ textAlign: 'right' }}>Earned</th>
                            <th style={{ textAlign: 'right' }}>Paid</th>
                            <th style={{ textAlign: 'right' }}>Outstanding</th>
                            <th style={{ textAlign: 'center' }}>Clients</th>
                            <th style={{ textAlign: 'center' }}>Last Paid</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="LP-skel-row" style={{ animationDelay: `${i * 0.06}s` }}>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 16 }} /></td>
                              <td>
                                <div className="LP-worker-cell">
                                  <span className="LP-skel LP-skel-avatar" />
                                  <span>
                                    <span className="LP-skel" style={{ width: 110, display: 'block' }} />
                                    <span className="LP-skel" style={{ width: 60, height: 8, display: 'block', marginTop: 5 }} />
                                  </span>
                                </div>
                              </td>
                              <td><span className="LP-skel" style={{ width: 55 }} /></td>
                              <td style={{ textAlign: 'right' }}><span className="LP-skel" style={{ width: 70 }} /></td>
                              <td style={{ textAlign: 'right' }}><span className="LP-skel" style={{ width: 70 }} /></td>
                              <td style={{ textAlign: 'right' }}><span className="LP-skel" style={{ width: 70 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 20 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 46 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 56, height: 18, borderRadius: 100 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 46, height: 24, borderRadius: 8 }} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : filteredWorkers.length === 0 ? (
                    <div className="ERP-empty">
                      <div className="ERP-empty-icon">
                        <Ico n="labour" s={24} c="var(--ember)" />
                      </div>
                      <div className="ERP-empty-title">No workers found</div>
                      <div className="ERP-empty-sub">
                        {workers.length === 0
                          ? 'Add workers in the Workforce module first'
                          : 'No workers match your search or filter'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="ERP-tbl-scroll LP-tbl-scroll">
                        <table className="ERP-tbl LP-compact LP-orange-tbl">
                          <thead>
                            <tr>
                              <th style={{ width: 52, textAlign: 'center' }}>S.No</th>
                              <th>Worker</th>
                              <th>Rate</th>
                              <th style={{ textAlign: 'right' }}>Earned</th>
                              <th style={{ textAlign: 'right' }}>Paid</th>
                              <th style={{ textAlign: 'right' }}>Outstanding</th>
                              <th style={{ textAlign: 'center' }}>Clients</th>
                              <th style={{ textAlign: 'center' }}>Last Paid</th>
                              <th style={{ textAlign: 'center' }}>Status</th>
                              <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedWorkers.map((w, i) => {
                              const hasBalance = w.balance > 0;
                              return (
                                <tr
                                  key={`${w.id}-${safePage}`}
                                  className="LP-row"
                                  style={{ animationDelay: `${i * 0.045}s` }}
                                  onClick={() => openWorker(w.id)}
                                >
                                  <td className="ERP-t-num">{(safePage - 1) * PER_PAGE + i + 1}</td>
                                  <td>
                                    <div className="LP-worker-cell">
                                      <span className="LP-mini-avatar" style={{ background: avatarColor(w.id) }}>
                                        {initials(w.name)}
                                      </span>
                                      <span style={{ minWidth: 0 }}>
                                        <span className="LP-worker-name" style={{ display: 'block' }}>{w.name}</span>
                                        {w.trade && <span className="LP-worker-trade" style={{ display: 'block' }}>{w.trade}</span>}
                                      </span>
                                    </div>
                                  </td>
                                  <td><span className="LP-rate">₹{rateLabel(w)}</span></td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="WP-amt">₹{fmt(w.total_earned)}</span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className={`WP-amt ${w.total_paid > 0 ? 'WP-amt-paid' : 'WP-amt-zero'}`}>
                                      {w.total_paid > 0 ? `₹${fmt(w.total_paid)}` : '—'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    {hasBalance
                                      ? <span className="WP-amt WP-amt-due">₹{fmt(w.balance)}</span>
                                      : <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--success)', fontSize: 9.5 }}>✓ Clear</span>}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="ERP-badge id-num">{w.clients_count}</span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="LP-last">
                                      {w.last_payment_at ? fmtShort(w.last_payment_at) : 'never'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className={`ERP-badge ${hasBalance ? 'unpaid' : 'clear'}`}>
                                      <span className="ERP-badge-dot" />
                                      {hasBalance ? 'Unpaid' : 'Clear'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <button
                                      className="ERP-tbtn primary"
                                      onClick={e => { e.stopPropagation(); openWorker(w.id); }}
                                    >
                                      Pay
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* ── PAGINATION BAR — only worth showing once there's actually
                           more than one page (i.e. more than 10 workers) ── */}
                      {totalPages > 1 && (
                        <div className="LP-pgn">
                          <span className="LP-pgn-info">
                            Showing <b>{(safePage - 1) * PER_PAGE + 1}</b>–<b>{Math.min(safePage * PER_PAGE, filteredWorkers.length)}</b> of <b>{filteredWorkers.length}</b> workers
                          </span>
                          <button
                            className="LP-pgn-btn LP-pgn-nav prev"
                            disabled={safePage <= 1}
                            onClick={() => setPage(safePage - 1)}
                          >
                            <SIco n="chevronDown" s={9} c="currentColor" /> Prev
                          </button>
                          {pageNumbers.map((p, idx) =>
                            p === '…' ? (
                              <span key={`dots-${idx}`} className="LP-pgn-dots">…</span>
                            ) : (
                              <button
                                key={p}
                                className={`LP-pgn-btn ${p === safePage ? 'on' : ''}`}
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </button>
                            )
                          )}
                          <button
                            className="LP-pgn-btn LP-pgn-nav next"
                            disabled={safePage >= totalPages}
                            onClick={() => setPage(safePage + 1)}
                          >
                            Next <SIco n="chevronDown" s={9} c="currentColor" />
                          </button>
                        </div>
                      )}
                      {/* ── PAGINATION BAR END ── */}
                    </>
                  )}
                </div>
                {/* ── ALL WORKERS TABLE END ── */}
              </>
            )}

            {pageTab === 'payments' && (
              <>
                {/* ── ALL PAYMENTS SUMMARY STATS ── */}
                {sessionsSummary && (
                  <div className="ERP-stats">
                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),#F0834D)' }} />
                      <div className="ERP-stat-label">Total Paid</div>
                      <div className="ERP-stat-val" style={{ color: 'var(--amt-strong)', fontSize: 13, fontWeight: 800 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                        <AnimCount value={Math.round(sessionsSummary.total_amount)} />
                      </div>
                    </div>

                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#C2410C,#F0834D)' }} />
                      <div className="ERP-stat-label">Payment Sessions</div>
                      <div className="ERP-stat-val" style={{ color: '#C2410C', fontSize: 13, fontWeight: 800 }}>
                        <AnimCount value={sessionsSummary.sessions_count} />
                      </div>
                    </div>

                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#9A3412,#DB5B1F)' }} />
                      <div className="ERP-stat-label">Workers Paid</div>
                      <div className="ERP-stat-val" style={{ color: '#9A3412', fontSize: 13, fontWeight: 800 }}>
                        <AnimCount value={sessionsSummary.workers_paid} />
                      </div>
                    </div>

                    <div className="ERP-stat">
                      <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#F0834D,var(--ember-mid))' }} />
                      <div className="ERP-stat-label">By Mode</div>
                      <div className="LP-stat-rows" style={{ marginTop: 6 }}>
                        {sessionsSummary.by_mode.length === 0 ? (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)' }}>No payments yet</div>
                        ) : sessionsSummary.by_mode.map(m => (
                          <div className="LP-stat-row" key={m.mode}>
                            <span className="LP-stat-dot" style={{ background: MODE_META[m.mode]?.color || 'var(--text-4)' }} />
                            <span className="LP-stat-mode">{MODE_LABELS[m.mode] || m.mode}</span>
                            <span className="LP-stat-amt">₹{fmt(m.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* ── ALL PAYMENTS SUMMARY STATS END ── */}

                {/* ── ALL PAYMENTS TABLE ── */}
                <div className="ERP-tbl-card">
                  <div className="ERP-tbl-hdr">
                    <div>
                      <div className="ERP-tbl-title">All Payments</div>
                      <div className="ERP-tbl-sub">Full payment history across every worker — click a row for the client-wise split</div>
                    </div>
                    <div className="LP-tbl-toolbar">
                      <div className="LP-date-range">
                        <div className="LP-date-field">
                          <CalendarDD value={sessionsFromDate} onChange={setSessionsFromDate} max={sessionsToDate} />
                        </div>
                        <span className="LP-date-sep">to</span>
                        <div className="LP-date-field">
                          <CalendarDD value={sessionsToDate} onChange={setSessionsToDate} min={sessionsFromDate} />
                        </div>
                        {(sessionsFromDate || sessionsToDate) && (
                          <button
                            type="button"
                            className="LP-date-clear"
                            title="Clear date range"
                            onClick={() => { setSessionsFromDate(''); setSessionsToDate(''); }}
                          >
                            <SIco n="x" s={13} />
                          </button>
                        )}
                      </div>
                      <ModeFilterDD value={sessionsModeFilter} onChange={setSessionsModeFilter} />
                      <div className="WP-search-wrap">
                        <span className="WP-search-icon">
                          <Ico n="search" s={15} c="var(--text-4)" />
                        </span>
                        <input autoComplete="off"
                          type="text"
                          className="WP-search"
                          placeholder="Search worker, client, notes…"
                          value={sessionsSearch}
                          onChange={e => setSessionsSearch(e.target.value)}
                        />
                      </div>
                      <span className="ERP-tbl-count">{allSessions.length} records</span>
                    </div>
                  </div>

                  {sessionsLoading ? (
                    <div className="ERP-tbl-scroll LP-tbl-scroll">
                      <table className="ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl">
                        <colgroup>
                          <col style={{ width: 52 }} />
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '21%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '9%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '8%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'center' }}>S.No</th>
                            <th>Date &amp; Time</th>
                            <th>Paid To</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th style={{ textAlign: 'center' }}>Mode</th>
                            <th style={{ textAlign: 'center' }}>Clients</th>
                            <th>Notes</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="LP-skel-row" style={{ animationDelay: `${i * 0.06}s` }}>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 16 }} /></td>
                              <td><span className="LP-skel" style={{ width: 70 }} /></td>
                              <td><span className="LP-skel" style={{ width: 110 }} /></td>
                              <td style={{ textAlign: 'right' }}><span className="LP-skel" style={{ width: 60 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 50 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 20 }} /></td>
                              <td><span className="LP-skel" style={{ width: 90 }} /></td>
                              <td style={{ textAlign: 'center' }}><span className="LP-skel" style={{ width: 24 }} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : allSessions.length === 0 ? (
                    <div className="ERP-empty">
                      <div className="ERP-empty-icon">
                        <Ico n="history" s={24} c="var(--ember)" />
                      </div>
                      <div className="ERP-empty-title">No payments found</div>
                      <div className="ERP-empty-sub">
                        {sessionsSearch || sessionsModeFilter || sessionsFromDate || sessionsToDate ? 'No payments match your search or filter' : 'Payments recorded against workers will show up here'}
                      </div>
                    </div>
                  ) : (
                    <div className="ERP-tbl-scroll LP-tbl-scroll">
                      <table className="ERP-tbl LP-compact WP-tbl-fixed LP-orange-tbl">
                        <colgroup>
                          <col style={{ width: 52 }} />
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '21%' }} />
                          <col style={{ width: '11%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '9%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '8%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'center' }}>S.No</th>
                            <th>Date &amp; Time</th>
                            <th>Paid To</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th style={{ textAlign: 'center' }}>Mode</th>
                            <th style={{ textAlign: 'center' }}>Clients</th>
                            <th>Notes</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody key={safePaymentsPage} className="LP-page-fade">
                          {pagedSessions.map((s, i) => {
                            const dt = fmtDateFull(s.paid_at);
                            return (
                              <React.Fragment key={s.id}>
                                <tr
                                  className="LP-row LP-pay-row"
                                  style={{ animationDelay: `${i * 0.035}s` }}
                                  onClick={() => setExpandedAllSession(expandedAllSession === s.id ? null : s.id)}
                                >
                                  <td className="ERP-t-num">{(safePaymentsPage - 1) * PAY_PAGE_SIZE + i + 1}</td>
                                  <td>
                                    <div className="LP-dt-cell">
                                      <span className="LP-dt-date">{dt.date}</span>
                                      <span className="LP-dt-time">{dt.time}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="LP-worker-cell LP-paidto">
                                      <span className="LP-mini-avatar" style={{ background: avatarColor(s.worker_id) }}>
                                        {initials(s.worker_name)}
                                      </span>
                                      <span className="LP-worker-name LP-paidto-name">{s.worker_name}</span>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="WP-amt WP-amt-paid LP-amt-highlight">₹{fmt(s.total_amount)}</span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <ModeSticker mode={s.payment_mode} />
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="ERP-badge id-num">{s.clients_count}</span>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: 10, color: 'var(--text-3)', fontStyle: s.notes ? 'normal' : 'italic' }}>
                                      {s.notes || '—'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
                                      {canDelete(userRole) ? (
                                        <button
                                          className="WP-btn WP-btn-red WP-btn-sm"
                                          onClick={e => { e.stopPropagation(); askDeleteSession(s); }}
                                          title="Delete payment"
                                        >
                                          <Ico n="trash" s={11} c="#faf9f7" />
                                        </button>
                                      ) : (
                                        <CreatorBadge name={s.created_by_name} />
                                      )}
                                      <Ico n={expandedAllSession === s.id ? 'collapse' : 'expand'} s={16} c="var(--text-4)" />
                                    </div>
                                  </td>
                                </tr>
                                {expandedAllSession === s.id && (
                                  <tr className="LP-expand-row">
                                    <td colSpan={8}>
                                      <div className="WP-session-allocs" style={{ padding: '12px 6px' }}>
                                        <div className="LP-expand-meta">
                                          <span>Session {s.id}</span>
                                          <span>{dt.date}, {dt.time}</span>
                                          <span>{MODE_LABELS[s.payment_mode] || s.payment_mode}</span>
                                        </div>
                                        {s.clients.length === 0 ? (
                                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)', padding: '4px 0' }}>
                                            No allocations recorded
                                          </div>
                                        ) : s.clients.map(c => (
                                          <AllocCard
                                            key={c.client_name}
                                            name={c.client_name}
                                            before={c.outstanding_before}
                                            after={c.outstanding_after}
                                            allocated={c.allocated}
                                            closed={c.is_closed}
                                          />
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!sessionsLoading && allSessions.length > PAY_PAGE_SIZE && (
                    <div className="LP-pgn">
                      <span className="LP-pgn-info">
                        Showing <b>{(safePaymentsPage - 1) * PAY_PAGE_SIZE + 1}</b>–<b>{Math.min(safePaymentsPage * PAY_PAGE_SIZE, allSessions.length)}</b> of <b>{allSessions.length}</b> payments
                      </span>
                      <button
                        className="LP-pgn-btn"
                        disabled={safePaymentsPage <= 1}
                        onClick={() => setPaymentsPage(safePaymentsPage - 1)}
                      >
                        ‹ Prev
                      </button>
                      {paymentsPageNumbers.map((p, idx) =>
                        p === '…' ? (
                          <span key={`pdots-${idx}`} className="LP-pgn-dots">…</span>
                        ) : (
                          <button
                            key={p}
                            className={`LP-pgn-btn ${p === safePaymentsPage ? 'on' : ''}`}
                            onClick={() => setPaymentsPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        className="LP-pgn-btn"
                        disabled={safePaymentsPage >= paymentsTotalPages}
                        onClick={() => setPaymentsPage(safePaymentsPage + 1)}
                      >
                        Next ›
                      </button>
                    </div>
                  )}
                </div>
                {/* ── ALL PAYMENTS TABLE END ── */}
              </>
            )}
          </>
        )}
      </div>
      {/* BODY END  */}

      {/* ── PREMIUM LOADING OVERLAY START ── */}
      {detailLoading && (
        <div className="LP-overlay">
          <div className="LP-loader-badge">
            <span className="LP-loader-ring" />
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M6.5 3h8l4 4v13a1 1 0 01-1 1h-11a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="#faf9f7" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M14.5 3v4h4" stroke="#faf9f7" strokeWidth="1.6" strokeLinejoin="round" />
              <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" stroke="#faf9f7" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="8.5" y1="14.8" x2="15.5" y2="14.8" stroke="#faf9f7" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="8.5" y1="18.1" x2="12.5" y2="18.1" stroke="#faf9f7" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div className="LP-loader-title">Opening Worker Ledger</div>
            <div className="LP-loader-sub">
              Fetching earnings &amp; payments
              <span className="LP-loader-dots"><span /><span /><span /></span>
            </div>
          </div>
        </div>
      )}
      {/* ── PREMIUM LOADING OVERLAY END ── */}

      {/* ── CONFIRM DELETE PAYMENT MODAL (same as other pages) ── */}
      <ConfirmDeleteModal
        open={deleteModal.open}
        title="Delete Payment"
        itemName={deleteModal.label}
        description="Are you sure you want to delete this payment record?"
        confirmLabel="Delete Payment"
        warnText={<>The paid amount will be <strong>added back to the worker's outstanding balance</strong>. This action cannot be undone.</>}
        onConfirm={confirmDeleteSession}
        onCancel={() => setDeleteModal({ open: false, sessionId: null, label: '', loading: false })}
        loading={deleteModal.loading}
      />
      {/* ── CONFIRM DELETE PAYMENT MODAL END ── */}

    </div>
  );
}