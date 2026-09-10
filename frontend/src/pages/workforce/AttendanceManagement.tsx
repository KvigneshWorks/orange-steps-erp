import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ERP_CSS } from '../../styles/ERPTheme';
import axiosInstance from '../../services/axiosConfig';
import { toast as appToast } from '../../services/toast';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { CalendarDD } from '../../components/CalendarDD';
import RunningLoader from '../../components/RunningLoader';
import Pagination from '../../components/Pagination';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../../utils/keyboardNav';
import { getStoredRole, canDelete } from '../../utils/roleAccess';
import CreatorBadge from '../../components/CreatorBadge';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

interface BioData {
  id: number;
  name: string;
  category_id?: number;
}

interface WorkerSubName {
  id: number;
  worker_id: number;
  sub_name: string;
  daily_rate?: number | null;
}

interface Worker {
  id: number;
  name: string;
  daily_rate: number;
  bio_data_id?: number;
  is_active: boolean;
}

interface AttRec {
  id: number;
  date: string;
  bio_data_id: number;
  client_name: string;
  worker_id: number;
  worker_name: string;
  sub_worker_name: string | null;
  is_sub_entry: boolean;
  shifts: number;
  amount: number;
  daily_rate?: number;
  notes: string;
  created_by_name?: string | null;
}

const CSS = `
/* ── SEARCHABLE DROPDOWN ── */
.AT-SDD-root { position:relative; width:100%; }
.AT-SDD-root[data-disabled="true"] { opacity:0.45; pointer-events:none; }
.AT-SDD-trigger {
  width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:12px 15px; background:var(--white); border:1.5px solid var(--border);
  border-radius:var(--r-md); cursor:pointer; transition:all 0.18s; text-align:left;
  min-height:50px; outline:none;
}
.AT-SDD-trigger:hover { border-color:var(--border-2); background:var(--off-white); }
.AT-SDD-trigger.open  { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); border-bottom-left-radius:0; border-bottom-right-radius:0; }
.AT-SDD-trigger.has-value { border-color:var(--ember-border); }
.AT-SDD-content { flex:1; min-width:0; }
.AT-SDD-selected { font-family:var(--font-body); font-size: 10.5px; font-weight: 800; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.AT-SDD-ph       { font-family:var(--font-body); font-size: 10px; color:var(--text-4); font-style:italic; }
.AT-SDD-chevron  { color:var(--text-4); transition:transform 0.2s,color 0.18s; flex-shrink:0; display:flex; }
.AT-SDD-chevron.open { transform:rotate(180deg); color:var(--ember); }
/* Rendered via createPortal with position:fixed (see SearchDD component) so
   it always escapes ancestor overflow:hidden — e.g. the WR-tbl-card wrapping
   the View Attendance table — instead of getting clipped. */
.AT-SDD-panel {
  background:var(--white); border:1.5px solid var(--ember-mid); border-radius:var(--r-md);
  box-shadow:0 12px 32px rgba(0,0,0,0.16); overflow:hidden;
  animation:at-sdd-drop 0.14s ease both; display:flex; flex-direction:column;
}
@keyframes at-sdd-drop { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
.AT-SDD-search-row { display:flex; align-items:center; gap:8px; padding:9px 12px; border-bottom:1px solid var(--ember-border); background:var(--ember-ghost); }
.AT-SDD-search { flex:1; background:transparent; border:none; outline:none; font-family:var(--font-body); font-size: 10px; color:var(--text-1); caret-color:var(--ember); }
.AT-SDD-search::placeholder { color:var(--text-4); }
/* Same list styling for every dropdown on this page (Client, Worker, Sub
   Name…) — capped at ~5 rows so the panel never grows past the screen,
   with the rest reachable via a slim, fully transparent-track scrollbar. */
.AT-SDD-list { flex:1; min-height:0; max-height:194px; overflow-y:auto; padding:3px 0; scrollbar-width:thin; scrollbar-color:var(--ember-mid) transparent; }
.AT-SDD-list::-webkit-scrollbar { width:4px; }
.AT-SDD-list::-webkit-scrollbar-track { background:transparent; }
.AT-SDD-list::-webkit-scrollbar-thumb { background:linear-gradient(180deg,var(--ember-light),var(--ember-mid),var(--ember)); border-radius:99px; }
.AT-SDD-list::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg,var(--ember-pale),var(--ember-mid),var(--ember)); }
.AT-SDD-item { display:flex; align-items:center; gap:8px; padding:11px 15px; cursor:pointer; transition:background 0.1s; font-family:var(--font-body); font-size: 11px; color:var(--text-2); }
.AT-SDD-item:hover { background:rgba(37,99,235,0.07); color:var(--text-1); }
.AT-SDD-item.sel  { background:var(--ember-ghost); color:var(--ember); font-weight: 700; }
.AT-SDD-item-txt { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.AT-SDD-item-rate { flex-shrink:0; font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--text-4); letter-spacing:.2px; }
.AT-SDD-item.sel .AT-SDD-item-rate { color:var(--ember); }
/* checkbox indicator for the multi-select sub-name list */
.AT-SDD-check { flex-shrink:0; width:16px; height:16px; border-radius:5px; border:1.5px solid var(--ember-border); display:flex; align-items:center; justify-content:center; color:transparent; transition:all .15s cubic-bezier(.34,1.56,.64,1); }
.AT-SDD-check.on { background:var(--ember); border-color:var(--ember); color:#fff; transform:scale(1.05); }
.AT-sub-chip-count { background:var(--ember); min-width:16px; text-align:center; }
.AT-SDD-empty { padding:14px; font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:0.5px; }
.AT-SDD-footer { padding:5px 14px; border-top:1px solid var(--ember-border); font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:0.5px; text-align:right; background:var(--ember-ghost); }

/* ── SHIFT SELECTOR CARDS ── */
.AT-shift-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:7px; }
@media(max-width:480px){ .AT-shift-grid { grid-template-columns:repeat(3,1fr); } }
.AT-shift-card { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:11px 4px; border:1.5px solid var(--border); border-radius:11px; background:var(--white); cursor:pointer; transition:all .2s cubic-bezier(.34,1.56,.64,1); min-height:52px; }
.AT-shift-card:hover { border-color:var(--ember-mid); background:var(--ember-ghost); transform:translateY(-2px); box-shadow:0 4px 12px rgba(37,99,235,.14); }
.AT-shift-card.sel { background:linear-gradient(135deg,#60A5FA,#2563EB); border-color:#2563EB; box-shadow:0 5px 16px rgba(37,99,235,.35); transform:translateY(-2px); }
.AT-shift-num { font-family:var(--font-display); font-size: 15px; font-weight: 800; font-style:italic; color:var(--text-1); line-height:1; transition:color .15s; }
.AT-shift-card.sel .AT-shift-num { color:#fff; text-shadow:0 1px 4px rgba(0,0,0,.2); }
.AT-shift-hint { font-family:var(--font-mono); font-size: 6.8px; font-weight: 800; letter-spacing:.6px; text-transform:uppercase; color:var(--text-4); transition:color .15s; white-space:nowrap; }
.AT-shift-card.sel .AT-shift-hint { color:rgba(255,255,255,.88); }
.AT-shift-check { position:absolute; top:-6px; right:-6px; width:17px; height:17px; border-radius:50%; background:#fff; border:1.5px solid #2563EB; color:#2563EB; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(.4) rotate(-90deg); transition:all .22s cubic-bezier(.34,1.56,.64,1); box-shadow:0 2px 6px rgba(0,0,0,.15); }
.AT-shift-card.sel .AT-shift-check { opacity:1; transform:scale(1) rotate(0deg); }

/* ── LAYOUT ── */
/* Two-column layout — same as DaybookPage's DB-root: form left, sticky
   records panel right. */
.AT-root { display:grid; grid-template-columns:1fr 520px; gap:26px; align-items:start; }
@media(max-width:1280px){ .AT-root { grid-template-columns:1fr 440px; gap:20px; } }
@media(max-width:1060px){ .AT-root { grid-template-columns:1fr 380px; gap:16px; } }
@media(max-width:900px) { .AT-root { grid-template-columns:1fr; gap:20px; } }

/* Records panel — same sticky card as DaybookPage's DB-panel */
.AT-panel { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-xl); overflow:hidden; box-shadow:var(--sh-card); display:flex; flex-direction:column; max-height:820px; position:sticky; top:20px; animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both; }
@media(max-width:900px){ .AT-panel { position:relative; top:auto; max-height:560px; } }
@media(max-width:520px){ .AT-panel { max-height:460px; border-radius:var(--r-lg); } }
.AT-panel-accent { height:3px; flex-shrink:0; background:linear-gradient(90deg,var(--ember) 0%,#60A5FA 100%); }
.AT-panel-hdr { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 13px; border-bottom:1px solid var(--border); flex-shrink:0; gap:10px; flex-wrap:wrap; }
.AT-panel-title { font-family:var(--font-body); font-size: 14px; font-weight: 800; font-style:normal; text-transform:uppercase; letter-spacing:.5px; color:var(--text-1); }
.AT-panel-body { flex:1; overflow-y:auto; }
.AT-panel-body::-webkit-scrollbar { width:4px; }
.AT-panel-body::-webkit-scrollbar-thumb { background:var(--border-2); border-radius:2px; }

/* ── SECTION HEADERS ── */
.AT-sec { display:flex; align-items:center; gap:10px; margin:24px 0 14px; flex-wrap:wrap; }
.AT-sec:first-child { margin-top:0; }
.AT-sec-num { width:26px; height:26px; border-radius:7px; background:var(--ember-ghost); border:1px solid var(--ember-border); display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--ember); flex-shrink:0; }
.AT-sec-label { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2.5px; color:var(--text-1); text-transform:uppercase; white-space:nowrap; }
.AT-sec-rule { flex:1; height:1px; background:var(--border); min-width:20px; }

/* ── FORM GRID ── */
.AT-dd-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
@media(max-width:700px){ .AT-dd-grid { grid-template-columns:1fr; gap:10px; } }
.AT-dd-full { grid-column:1/-1; }
.AT-fld-label { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-1); margin-bottom:7px; display:flex; align-items:center; gap:4px; }

/* ── AMOUNT FIELD ── */
.AT-amount-wrap { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); display:flex; align-items:center; padding:0 14px; gap:10px; transition:all 0.18s; min-height:62px; }
.AT-amount-prefix { font-family:var(--font-display); font-size: 19.5px; color:var(--ember); font-style:italic; flex-shrink:0; }
.AT-amount-display { flex:1; font-family:var(--font-display); font-size: 26.5px; font-weight: 800; font-style:italic; color:var(--text-1); padding:8px 0; }
.AT-amount-display.empty { color:var(--text-4); font-size: 19.5px; }
.AT-amount-formula { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; }
.AT-amount-formula-line { font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--text-3); letter-spacing:0.5px; }
.AT-amount-formula-val { font-family:var(--font-mono); font-size: 9px; font-weight: 800; color:var(--ember); }

/* ── NARRATION FIELD ── */
.AT-narration-wrap { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); transition:all 0.18s; }
.AT-narration-wrap:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.AT-narration { width:100%; background:transparent; border:none; outline:none; font-family:var(--font-body); font-size: 10.5px; color:var(--text-1); resize:none; caret-color:var(--ember); padding:11px 13px; line-height:1.6; display:block; box-sizing:border-box; }
.AT-narration::placeholder { color:var(--text-4); font-style:italic; }

/* ── DATE NAVIGATOR ── */
.AT-date-nav { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.AT-date-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:var(--r-sm); background:var(--white); border:1.5px solid var(--border); cursor:pointer; transition:all 0.15s cubic-bezier(.34,1.56,.64,1); color:var(--text-3); flex-shrink:0; }
.AT-date-btn:hover { border-color:var(--ember-border); color:var(--ember); background:var(--ember-ghost); transform:translateY(-1px); }
.AT-date-btn:active { transform:translateY(0) scale(.92); }
.AT-date-field-wrap { display:flex; align-items:center; gap:8px; padding:7px 12px; background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); transition:border-color 0.18s; }
.AT-date-field-wrap:focus-within { border-color:var(--ember-mid); }
.AT-date-lbl { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2px; color:var(--text-4); text-transform:uppercase; white-space:nowrap; }
.AT-date-input { background:transparent; border:none; outline:none; font-family:var(--font-mono); font-size: 11px; font-weight: 700; color:var(--text-1); cursor:pointer; }
.AT-date-input::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.5; }
.AT-today-btn { padding:7px 13px; background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-3); cursor:pointer; transition:all 0.15s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; }
.AT-today-btn:hover { transform:translateY(-1px); border-color:var(--ember-border); color:var(--ember); background:var(--ember-ghost); }
.AT-today-btn:active { transform:translateY(0) scale(.95); }

/* ── EDIT BANNER ── */
.AT-edit-banner { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 14px; background:var(--warn-bg); border:1px solid var(--warn-bd); border-radius:var(--r-md); margin-bottom:18px; animation:erp-slide-up 0.2s ease both; flex-wrap:wrap; }
.AT-edit-lhs { display:flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size: 8.5px; font-weight: 800; color:var(--warn); flex:1; min-width:0; }
.AT-edit-cancel { display:flex; align-items:center; gap:5px; padding:6px 12px; border-radius:var(--r-sm); background:var(--white); border:1px solid var(--warn-bd); font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:0.8px; text-transform:uppercase; color:var(--warn); cursor:pointer; transition:all 0.15s cubic-bezier(.34,1.56,.64,1); }
.AT-edit-cancel:hover { transform:translateY(-1px); background:var(--warn); color:#fff; }
.AT-edit-cancel:active { transform:translateY(0) scale(.95); }

.AT-submit { display:flex; align-items:center; justify-content:center; gap:7px; padding:9px 20px; background:var(--ember); color:#fff; border:none; border-radius:var(--r-md); font-family:var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing:1.3px; text-transform:uppercase; cursor:pointer; transition:background .18s ease,transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease; }
.AT-submit:hover:not(:disabled) { background:var(--ember-mid,#3B82F6); transform:translateY(-1px); box-shadow:0 4px 14px rgba(29,78,216,.28); }
.AT-submit:active { transform:translateY(0) scale(.96); }
.AT-submit:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

/* ── TODAY'S RECORDS TABLE — badge + compact icon action buttons ── */
.AT-panel-badge { font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--ember); background:var(--ember-ghost); border:1px solid var(--ember-border); padding:3px 10px; border-radius:100px; }
.AT-scroll-hint { display:flex; align-items:center; justify-content:center; gap:7px; padding:9px 14px; border-top:1px solid var(--border); background:var(--off-white); font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-4); }
.AT-scroll-hint svg { animation:at-bounce 1.4s infinite; color:var(--ember); }
@keyframes at-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
.AT-tbl-actions { display:flex; gap:6px; }
.AT-tbl-act { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:var(--r-sm); border:1.5px solid var(--border); background:var(--white); color:var(--text-3); cursor:pointer; transition:all .16s cubic-bezier(.34,1.56,.64,1); }
.AT-tbl-act.edit:hover { background:var(--ember); border-color:var(--ember); color:#fff; transform:translateY(-1px) scale(1.05); }
.AT-tbl-act.del:hover { background:var(--error); border-color:var(--error); color:#fff; transform:translateY(-1px) scale(1.05); }
.AT-tbl-act:active { transform:translateY(0) scale(.92); }

/* ── SKELETON ── */
.AT-skeleton { background:linear-gradient(90deg,var(--off-white) 25%,var(--surface-3) 50%,var(--off-white) 75%); background-size:600px 100%; animation:erp-shimmer 1.6s infinite linear; border-radius:var(--r-sm); }

/* ── TOAST ── */
.AT-toast-wrap { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); z-index:3000; display:flex; flex-direction:column; align-items:center; gap:8px; pointer-events:none; }
.AT-toast { display:flex; align-items:center; gap:10px; padding:11px 20px; border-radius:var(--r-md); font-family:var(--font-mono); font-size: 9px; font-weight: 800; letter-spacing:0.5px; box-shadow:0 8px 28px rgba(0,0,0,0.16); animation:erp-pop 0.3s ease both; }
.AT-toast.success { background:var(--ember); color:#fff; }
.AT-toast.error   { background:var(--error); color:#fff; }

/* ── STAT CARDS (top) ── */
.AT-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
@media(max-width:700px){ .AT-stats { grid-template-columns:1fr 1fr; } }
@media(max-width:480px){ .AT-stats { grid-template-columns:1fr; gap:10px; } }
.AT-stat-card { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-lg); padding:18px 20px; box-shadow:var(--sh-card); display:flex; flex-direction:column; gap:4px; position:relative; overflow:hidden; }
.AT-stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--ember) 0%,#60A5FA 100%); }
.AT-stat-icon { width:38px; height:38px; border-radius:10px; background:var(--ember-ghost); border:1.5px solid var(--ember-border); display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
.AT-stat-label { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2px; text-transform:uppercase; color:var(--text-4); }
.AT-stat-value { font-family:var(--font-display); font-size: 23px; font-style:italic; color:var(--text-1); font-weight: 800; line-height:1; }
.AT-stat-sub { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); margin-top:2px; }

/* ── PAGE HEADER ── */
.AT-page-hdr { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:22px; flex-wrap:wrap; }
.AT-page-title { font-family:var(--font-display); font-size: 24.5px; font-style:italic; color:var(--grey); line-height:1; }
.AT-page-sub { font-family:var(--font-mono); font-size: 8px; font-weight: 700; letter-spacing:2px; text-transform:uppercase; color:var(--text-4); margin-top:4px; }

/* ── FORM CARD ── */
.AT-form-card { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-xl); padding:28px 28px 24px; box-shadow:var(--sh-card); animation:erp-pop 0.4s ease both; }
@media(max-width:520px){ .AT-form-card { padding:20px 16px; } }

/* ── SUB NAME DISPLAY ── */
.AT-sub-display { background:var(--ember-ghost); border:1.5px solid var(--ember-border); border-radius:var(--r-md); padding:10px 14px; min-height:44px; display:flex; align-items:center; gap:8px; }
.AT-sub-display-val { font-family:var(--font-body); font-size: 10.5px; font-weight: 700; color:var(--ember); }
.AT-sub-display-empty { font-family:var(--font-body); font-size: 10px; color:var(--text-4); font-style:italic; }
/* Editable Daily Rate box — same footprint as AT-sub-display but with a live
   numeric input, so a worker's own rate can be overridden per attendance
   entry without touching their saved Worker record. */
.AT-rate-box { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); padding:0 14px; min-height:44px; display:flex; align-items:center; gap:6px; transition:border-color 0.18s; }
.AT-rate-box:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.AT-rate-box-prefix { font-family:var(--font-mono); font-size: 10.5px; font-weight: 800; color:var(--ember); flex-shrink:0; }
.AT-rate-box-input { flex:1; min-width:0; background:transparent; border:none; outline:none; font-family:var(--font-mono); font-size: 10.5px; font-weight: 800; color:var(--text-2); }
.AT-rate-box-input::placeholder { color:var(--text-4); font-weight: 700; }
.AT-rate-box-input::-webkit-outer-spin-button, .AT-rate-box-input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
.AT-rate-box-suffix { font-family:var(--font-mono); font-size: 9px; font-weight: 800; color:var(--text-4); flex-shrink:0; }

/* ── SUB NAME HYBRID DROPDOWN ── */
.AT-SDD-add { display:flex; align-items:center; gap:9px; padding:11px 14px; cursor:pointer; font-family:var(--font-body); font-size: 10px; font-weight: 800; color:var(--ember); border-top:1px dashed var(--ember-border); background:var(--ember-ghost); transition:background 0.12s; }
.AT-SDD-add:hover { background:rgba(37,99,235,0.16); }
.AT-SDD-add-icon { width:18px; height:18px; border-radius:50%; background:var(--ember); color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.AT-SDD-group-lbl { padding:8px 14px 3px; font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-4); }
.AT-sub-chip { font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1px; padding:2px 8px; border-radius:100px; background:var(--ember); color:#fff; flex-shrink:0; text-transform:uppercase; }

/* ── AMOUNT MODE (auto / manual) ── */
.AT-amount-input { flex:1; background:transparent; border:none; outline:none; font-family:var(--font-display); font-size: 26.5px; font-weight: 800; font-style:italic; color:var(--text-1); padding:8px 0; min-width:0; caret-color:var(--ember); }
.AT-amount-input::placeholder { color:var(--text-4); font-size: 17.5px; }
.AT-amount-input::-webkit-outer-spin-button, .AT-amount-input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
.AT-amount-mode { font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1px; padding:3px 9px; border-radius:100px; flex-shrink:0; text-transform:uppercase; }
.AT-amount-mode.auto   { background:var(--surface); color:var(--text-3); border:1px solid var(--border); }
.AT-amount-mode.manual { background:var(--ember-ghost); color:var(--ember); border:1px solid var(--ember-border); }
.AT-sub-hint { display:flex; align-items:center; gap:7px; margin-top:8px; padding:8px 12px; background:var(--ember-ghost); border:1px dashed var(--ember-border); border-radius:var(--r-sm); font-family:var(--font-body); font-size: 9px; color:var(--ember); font-weight: 700; }

/* ── PAGE ANIMATIONS ── */
@keyframes at-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
.AT-anim-1 { animation:at-in .35s .02s ease both; }
.AT-anim-2 { animation:at-in .35s .08s ease both; }
.AT-anim-3 { animation:at-in .35s .14s ease both; }
.AT-anim-4 { animation:at-in .35s .20s ease both; }
.ERP-stat:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,0,0,.10); transition:transform .2s,box-shadow .2s; }

/* ── DROPDOWN AVATARS (manpower list) ── */
.AT-SDD-avatar { width:27px; height:27px; border-radius:50%; background:linear-gradient(135deg,#60A5FA,#2563EB); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size: 8px; font-weight: 800; flex-shrink:0; box-shadow:0 2px 6px rgba(37,99,235,.25); }

/* ── DATE FIELD — standard CalendarDD picker in a bordered box, same
   pattern as DaybookPage's DB-date-field / the View tab's AT-view-datefield ── */
.AT-date-field { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); display:flex; align-items:center; gap:10px; padding:10px 13px; min-height:44px; transition:border-color 0.18s; }
.AT-date-field:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.AT-date-field .ERP-cal-field { border:none; background:transparent; padding:0; min-height:0; }

/* ── PAGE TABS (Record / View) — same flat segmented-control UI + premium
   page-transition as Manpower Register's "Workers/Register" tabs ── */
@keyframes wr-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes wr-pageSwap{
  0%{opacity:0;transform:translateY(20px) scale(.97);filter:blur(5px);}
  55%{opacity:1;filter:blur(0);}
  75%{transform:translateY(-2px) scale(1.005);}
  100%{opacity:1;transform:translateY(0) scale(1);}
}
.WR-tabs-bar{display:inline-flex;border:1.5px solid var(--border);border-radius:var(--r-lg);overflow:hidden;background:var(--white);margin-bottom:20px;animation:wr-in .3s .05s ease both;}
.WR-tab{display:flex;align-items:center;gap:7px;padding:9px 18px;font-family:var(--font-mono);font-size: 8.5px;font-weight: 800;letter-spacing:1.3px;text-transform:uppercase;color:var(--text-3);cursor:pointer;border:none;border-right:1.5px solid var(--border);transition:background .16s ease,color .16s ease,transform .16s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;background:var(--white);}
.WR-tab:last-child{border-right:none;}
.WR-tab:hover{color:var(--ember);background:var(--ember-ghost);transform:translateY(-1px);}
.WR-tab:active{transform:translateY(0) scale(.96);}
.WR-tab.active{color:#fff;background:var(--ember);}
.WR-tab-badge{padding:2px 8px;border-radius:100px;font-size: 8px;font-weight: 800;background:var(--ember-ghost);color:var(--ember);border:1px solid var(--ember-border);}
.WR-tab.active .WR-tab-badge{background:rgba(255,255,255,.25);color:#fff;border-color:rgba(255,255,255,.4);}

/* Record tab wrapper — full-width single column now that the sidebar
   preview is gone; replays the premium page-swap transition on tab switch. */
.AT-record-wrap{display:flex;flex-direction:column;gap:22px;animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both;}

/* ── FORM FOOTER — compact, flat, right-aligned buttons, same professional
   look as Manpower Register's Cancel / Register Worker footer ── */
.AT-form-actions { display:flex; align-items:center; justify-content:flex-end; gap:10px; margin-top:22px; padding:16px 20px; border-top:1px solid var(--border); background:var(--off-white); }
.AT-cancel-btn {
  display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 16px;
  background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md);
  font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.3px; text-transform:uppercase;
  color:var(--text-2); cursor:pointer; transition:all 0.18s cubic-bezier(.34,1.56,.64,1); white-space:nowrap;
}
.AT-cancel-btn:hover { border-color:var(--error); color:var(--error); background:#FFF5F3; transform:translateY(-1px); }
.AT-cancel-btn:active { transform:translateY(0) scale(.96); }
.AT-cancel-btn:disabled { opacity:0.55; cursor:not-allowed; }

/* ── VIEW ATTENDANCE TAB — same table UI as Manpower Register "Workers" tab ── */
.AT-view-note { display:flex; align-items:center; gap:7px; justify-content:center; margin:-8px 0 20px; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px; color:var(--text-4); text-align:center; }
.AT-view-datefield { display:flex; align-items:center; gap:8px; padding:0 12px; height:36px; background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); transition:border-color .18s; }
.AT-view-datefield:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.AT-view-datefield input { background:transparent; border:none; outline:none; font-family:var(--font-mono); font-size: 9.5px; font-weight: 700; color:var(--text-1); cursor:pointer; }
.AT-view-datefield .ERP-cal-field { border:none; background:transparent; padding:0; min-height:0; }
.AT-view-datefield .ERP-cal-val { font-size: 9.5px; }

/* ── VIEW ATTENDANCE FILTER BAR — professional Filter/Reset buttons with a
   funnel icon, same flat language as the report pages' Filter/Reset controls
   (not a magnifying-glass "search" trigger). ── */
.AT-view-filterbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-left:auto; }
.AT-view-worker { min-width:168px; max-width:190px; }
/* Compact, small-text SearchDD variant — used by the View Attendance Manpower
   Name filter. The dropdown panel is portaled to document.body (see the
   SearchDD component), so it can't be reached via an ".AT-view-worker …"
   ancestor selector once open — style it through the "compact" modifier
   class instead, which SearchDD applies to both the trigger and the panel. */
.AT-SDD-trigger.compact { min-height:34px; height:34px; padding:0 10px; gap:6px; }
.AT-SDD-trigger.compact .AT-SDD-content { gap:6px !important; }
.AT-SDD-trigger.compact .AT-SDD-selected { font-size: 9px; font-weight: 700; }
.AT-SDD-trigger.compact .AT-SDD-ph { font-size: 9px; }
.AT-SDD-trigger.compact .AT-SDD-chevron svg { width:11px; height:11px; }
.AT-SDD-panel.compact .AT-SDD-avatar { width:18px; height:18px; font-size: 7.5px; }
.AT-SDD-panel.compact .AT-SDD-item { padding:7px 11px; font-size: 9px; gap:6px; }
.AT-SDD-panel.compact .AT-SDD-search-row { padding:7px 10px; }
.AT-SDD-panel.compact .AT-SDD-search { font-size: 9px; }
.AT-SDD-panel.compact .AT-SDD-empty { font-size: 8px; padding:12px; }
.AT-SDD-panel.compact .AT-SDD-footer { font-size: 7.5px; padding:4px 11px; }
.AT-SDD-panel.compact .AT-SDD-list { max-height:140px; }
.AT-filter-btn { display:flex; align-items:center; justify-content:center; gap:6px; height:30px; padding:0 15px; border-radius:999px; border:1.5px solid transparent; cursor:pointer; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.2px; text-transform:uppercase; white-space:nowrap; transition:background .16s ease, transform .16s cubic-bezier(.34,1.56,.64,1), box-shadow .16s ease; flex-shrink:0; }
.AT-filter-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
.AT-filter-btn:active:not(:disabled) { transform:translateY(0) scale(.95); }
.AT-filter-apply { background:var(--ember); color:#fff; }
.AT-filter-apply:hover:not(:disabled) { background:var(--ember-mid,#3B82F6); transform:translateY(-1px); box-shadow:0 4px 12px rgba(29,78,216,.26); }
.AT-filter-reset { background:var(--ember-ghost); color:var(--ember); border-color:var(--ember-border); }
.AT-filter-reset:hover { background:rgba(37,99,235,.16); transform:translateY(-1px); }
.WR-search-wrap { display:flex; align-items:center; gap:8px; padding:9px 13px; border:1.5px solid var(--border); border-radius:var(--r-md); background:var(--white); transition:all .18s; }
.WR-search-wrap:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.WR-search { background:none; border:none; outline:none; font-family:var(--font-body); font-size: 10.5px; color:var(--text-1); width:180px; }

/* Table card — same bordered box-grid look as Manpower Register "Workers" tab */
.WR-tbl-card { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-xl); overflow:hidden; box-shadow:var(--sh-card); animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both; }
.WR-tbl-header { display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--off-white); flex-wrap:wrap; }
.WR-tbl-title { font-family:var(--font-body); font-size: 14px; font-weight: 800; font-style:normal; text-transform:uppercase; letter-spacing:.5px; color:var(--text-1); }
.WR-tbl-actions { margin-left:auto; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.WR-table-wrap { overflow-x:auto; }
.WR-table { width:100%; border-collapse:collapse; font-family:var(--font-body); border:1px solid var(--border); }
.WR-table thead tr { background:var(--surface-2,#E9EEF5); border-bottom:2px solid var(--ember,#2563EB); }
.WR-table th { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2px; text-transform:uppercase; color:var(--text-3,#27364A); padding:11px 14px; white-space:nowrap; text-align:left; border-right:1px solid var(--border,#E9EEF5); }
.WR-table th:last-child { border-right:none; }
.WR-table td { padding:12px 14px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); font-size: 10.5px; font-weight: 700; color:var(--text-1); vertical-align:middle; }
.WR-table td:last-child { border-right:none; }
.WR-table tr:last-child td { border-bottom:none; }
.WR-table tbody tr { transition:background .12s; animation:wr-rowIn .32s ease both; }
.WR-table tbody tr:nth-child(even) td { background:var(--off-white,#F8FAFC); }
.WR-table tbody tr:hover td { background:var(--ember-ghost); }
.WR-name { font-size: 11px; font-weight: 700; color:var(--text-1); }
.WR-code { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); margin-top:2px; }
.WR-skill-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:100px; background:var(--ember-ghost); border:1px solid var(--ember-border); font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--ember); }
.WR-rate { font-family:var(--font-mono); font-size: 10.5px; font-weight: 800; color:var(--text-1); }
.WR-rate-lbl { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); }

/* View Attendance — grouped-by-manpower-head rows. One row per worker (Ajith),
   with a Total Amount that sums his own pay + every sub-worker's pay that
   day; click the row to expand and see the per-sub-name breakdown beneath. */
.AT-grp-row td { background:var(--white); }
.AT-grp-row.open td { background:var(--ember-ghost); border-bottom-color:var(--ember-border); }
.AT-grp-toggle { display:inline-flex; align-items:center; gap:8px; background:none; border:none; padding:0; cursor:pointer; font:inherit; text-align:left; }
.AT-grp-chevron { color:var(--text-4); flex-shrink:0; transition:transform 0.18s, color 0.18s; }
.AT-grp-chevron.open { transform:rotate(90deg); color:var(--ember); }
.AT-grp-sub-row td { background:var(--surface,#F8FAFC); border-right:1px solid var(--border); font-size: 9.5px; }
.AT-grp-sub-row:hover td { background:var(--ember-ghost); }
@keyframes wr-rowIn { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }

/* Loader + empty state — same as Manpower Register "Workers" tab */
@keyframes wr-spin2 { to{transform:rotate(360deg);} }
@keyframes wr-core-pulse { 0%,100%{transform:scale(1);box-shadow:0 3px 12px rgba(37,99,235,.35);} 50%{transform:scale(0.86);box-shadow:0 3px 20px rgba(37,99,235,.55);} }
@keyframes wr-sheen { to{background-position:-200% center;} }
@keyframes wr-skel-shimmer { 0%{background-position:-360px 0;} 100%{background-position:360px 0;} }
@keyframes wr-skel-in { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
.WR-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:38px 26px 30px; gap:16px; }
.WR-loader-ring { position:relative; width:52px; height:52px; }
.WR-loader-ring::before { content:''; position:absolute; inset:0; border-radius:50%; border:3px solid var(--ember-ghost); }
.WR-loader-ring::after { content:''; position:absolute; inset:0; border-radius:50%; border:3px solid transparent; border-top-color:var(--ember); border-right-color:var(--ember-mid); animation:wr-spin2 .75s cubic-bezier(.55,.15,.45,.85) infinite; }
.WR-loader-core { position:absolute; inset:15px; border-radius:50%; background:linear-gradient(135deg,var(--ember),var(--ember-mid)); animation:wr-core-pulse 1.1s ease-in-out infinite; }
.WR-loader-lbl { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:3px; text-transform:uppercase; background:linear-gradient(90deg,var(--ember),var(--ember-mid),var(--ember-pale),var(--ember)); background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation:wr-sheen 1.5s linear infinite; }
.WR-skel-rows { width:100%; display:flex; flex-direction:column; gap:12px; margin-top:6px; }
.WR-skel-row { display:grid; grid-template-columns:36px 1fr .8fr 1.3fr .9fr .7fr; gap:14px; align-items:center; animation:wr-skel-in .35s ease both; }
.WR-skel-row:nth-child(1){animation-delay:.05s;} .WR-skel-row:nth-child(2){animation-delay:.13s;} .WR-skel-row:nth-child(3){animation-delay:.21s;} .WR-skel-row:nth-child(4){animation-delay:.29s;}
.WR-skel { height:12px; border-radius:6px; background:linear-gradient(90deg,var(--surface-2) 25%,#FFE0BD 50%,var(--surface-2) 75%); background-size:360px 100%; animation:wr-skel-shimmer 1.15s linear infinite; }
.WR-skel.tall { height:26px; border-radius:8px; }
.WR-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:52px 20px; gap:10px; }
.WR-empty-icon { font-size: 28px; opacity:.2; }
.WR-empty-text { font-family:var(--font-mono); font-size: 8px; letter-spacing:2px; text-transform:uppercase; color:var(--text-4); }
`;

const SHIFT_OPTIONS = [0.5, 1, 1.5, 2, 2.5];
const SHIFT_LABELS: Record<number, string> = {
  0.5: 'Half Day',
  1: 'Full Day',
  1.5: '1½ Shift',
  2: 'Double',
  2.5: '2½ Shift',
};

interface SearchDDProps {
  items: { id: number; label: string }[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  footer?: string;
  avatars?: boolean;
  compact?: boolean;
}

const initialsOf = (label: string) =>
  label.trim().split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?';

function SearchDD({ items, value, onChange, placeholder = 'Select…', disabled = false, footer, avatars = false, compact = false }: SearchDDProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [q, setQ] = useState('');
  const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  const selected = items.find(i => i.id === value);
  const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : items;

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false); setQ('');
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) { setPanelPos(null); return; }
    const reposition = () => {
      if (!rootRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      const pw = Math.max(r.width, 220), mg = 8;
      let lx = r.left;
      if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
      if (lx < mg) lx = mg;
      const spaceBelow = Math.max(160, window.innerHeight - r.bottom - mg);
      setPanelPos({ position: 'fixed', left: lx, top: r.bottom + 6, width: pw, maxHeight: Math.min(340, spaceBelow), zIndex: 2147483647 });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  return (
    <div className={`AT-SDD-root${compact ? ' compact' : ''}`} data-disabled={disabled ? 'true' : 'false'} ref={rootRef}>

      {/* Button Start */}
      <button
        type="button"
        ref={triggerRef}
        className={`AT-SDD-trigger${compact ? ' compact' : ''}${open ? ' open' : ''}${selected ? ' has-value' : ''}`}
        onClick={() => { if (!disabled) { setOpen(o => !o); setQ(''); } }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="AT-SDD-content" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {selected
            ? (<>
              {avatars && <span className="AT-SDD-avatar">{initialsOf(selected.label)}</span>}
              <span className="AT-SDD-selected">{selected.label}</span>
            </>)
            : <span className="AT-SDD-ph">{placeholder}</span>}
        </span>
        <span className={`AT-SDD-chevron${open ? ' open' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {/* Button End */}

      {open && panelPos && createPortal(
        // Open Start
        <div ref={el => { panelRef.current = el; }} className={`AT-SDD-panel${compact ? ' compact' : ''}`} style={panelPos}>
          <div className="AT-SDD-search-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-4)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input ref={searchRef} className="AT-SDD-search" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="AT-SDD-list">
            {value !== null && (
              <div className="AT-SDD-item" role="option" tabIndex={-1} aria-selected={false} style={{ color: 'var(--text-4)', fontSize: '10.5px', fontStyle: 'italic' }}
                onClick={() => { onChange(null); setOpen(false); setQ(''); }}>
                — Clear selection
              </div>
            )}

            {filtered.length === 0
              ? <div className="AT-SDD-empty">No results</div>
              : filtered.map(item => (
                <div
                  key={item.id}
                  role="option" tabIndex={-1} aria-selected={item.id === value}
                  className={`AT-SDD-item${item.id === value ? ' sel' : ''}`}
                  onClick={() => { onChange(item.id); setOpen(false); setQ(''); }}
                >
                  {avatars && <span className="AT-SDD-avatar">{initialsOf(item.label)}</span>}
                  {item.label}
                </div>
              ))
            }
          </div>
          {footer && <div className="AT-SDD-footer">{footer}</div>}
        </div>,
        // Open End
        document.body
      )}
    </div>
  );
}

interface SubNameDDProps {
  names: WorkerSubName[];
  // Multiple sub-names can be checked at once — value is always an array.
  // While editing a saved record (multiple=false) it holds at most one name
  // and picking a different one replaces it, since one record can only ever
  // carry one sub_worker_name.
  value: string[];
  onToggle: (name: string) => void;
  onClear: () => void;
  onAdd: (name: string) => void;
  disabled?: boolean;
  multiple?: boolean;
}

function SubNameDD({ names, value, onToggle, onClear, onAdd, disabled = false, multiple = true }: SubNameDDProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  const query = q.trim();
  const filtered = query
    ? names.filter(n => n.sub_name.toLowerCase().includes(query.toLowerCase()))
    : names;
  const exactMatch = names.some(n => n.sub_name.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false); setQ('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Multi mode: checking a box just toggles it, the panel stays open so
  // several names can be picked in one go. Single mode (editing a record):
  // picking a name selects it and closes, matching the old one-shot combo.
  const rowClick = (name: string) => {
    onToggle(name);
    if (!multiple) { setOpen(false); setQ(''); }
  };

  return (
    <div className="AT-SDD-root" data-disabled={disabled ? 'true' : 'false'} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`AT-SDD-trigger${open ? ' open' : ''}${value.length ? ' has-value' : ''}`}
        onClick={() => { if (!disabled) { setOpen(o => !o); setQ(''); } }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="AT-SDD-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {value.length === 0 ? (
            <span className="AT-SDD-ph">None — self attendance</span>
          ) : value.length === 1 ? (
            <><span className="AT-sub-chip">Sub</span><span className="AT-SDD-selected">{value[0]}</span></>
          ) : (
            <>
              <span className="AT-sub-chip AT-sub-chip-count">{value.length}</span>
              <span className="AT-SDD-selected" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.join(', ')}</span>
            </>
          )}
        </span>
        <span className={`AT-SDD-chevron${open ? ' open' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="AT-SDD-panel" ref={panelRef}>
          <div className="AT-SDD-search-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-4)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              className="AT-SDD-search"
              placeholder="Search or type a new name…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (query && !exactMatch) { onAdd(query); setQ(''); if (!multiple) setOpen(false); }
                  else if (filtered.length === 1) rowClick(filtered[0].sub_name);
                }
              }}
            />
          </div>
          <div className="AT-SDD-list">
            <div className="AT-SDD-item" role="option" tabIndex={-1} aria-selected={false} style={{ color: 'var(--text-4)', fontSize: '10.5px', fontStyle: 'italic' }}
              onClick={() => { onClear(); setOpen(false); setQ(''); }}>
              — None (worker's own attendance)
            </div>
            {names.length > 0 && (
              <div className="AT-SDD-group-lbl">
                {multiple ? 'Check all who worked today' : 'Saved associate names'}
              </div>
            )}
            {filtered.length === 0 && query === '' && names.length === 0 && (
              <div className="AT-SDD-empty">No associate names yet — type a name to add</div>
            )}
            {filtered.map(item => {
              const checked = value.includes(item.sub_name);
              return (
                <div
                  key={item.id}
                  role="option" tabIndex={-1} aria-selected={checked}
                  className={`AT-SDD-item${checked ? ' sel' : ''}`}
                  onClick={() => rowClick(item.sub_name)}
                >
                  {multiple && (
                    <span className={`AT-SDD-check${checked ? ' on' : ''}`}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                  )}
                  <span className="AT-SDD-item-txt">{item.sub_name}</span>
                  {item.daily_rate != null && <span className="AT-SDD-item-rate">₹{item.daily_rate}/day</span>}
                </div>
              );
            })}
          </div>
          {query !== '' && !exactMatch && (
            <div className="AT-SDD-add" role="option" tabIndex={-1} aria-selected={false} onClick={() => { onAdd(query); setQ(''); if (!multiple) setOpen(false); }}>
              <span className="AT-SDD-add-icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              Add “{query}” as new associate name
            </div>
          )}
          <div className="AT-SDD-footer">
            {multiple && value.length > 0 ? `${value.length} selected · ` : ''}{names.length} saved · type to add new
          </div>
        </div>
      )}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
interface FormState {
  clientBioId: number | null;
  workerId: number | null;
  // Multiple sub-names can be checked at once — one attendance record gets
  // created per name on submit (the backend schema is one sub_worker_name
  // per row), while this field lets the form show/edit them as a single
  // combined selection with one combined Total Amount.
  subNames: string[];
  shifts: number | '';
  manualAmount: string;
  // True while manualAmount was set BY US from the selected sub-names' saved
  // rates × shifts (not typed by the user) — lets shift/selection changes
  // keep recalculating it live. Flips to false the instant the user edits
  // the amount box directly, so their override is never clobbered by a
  // later shift change.
  manualAmountAuto: boolean;
  // Empty string = use the worker's own saved daily_rate. A non-empty value
  // overrides it for THIS entry only (e.g. Ajith paid ₹700 on a day he'd
  // normally get ₹500) without touching the worker's saved rate record.
  rateOverride: string;
  notes: string;
}

const defaultForm = (): FormState => ({
  clientBioId: null, workerId: null, subNames: [], shifts: '', manualAmount: '', manualAmountAuto: false, rateOverride: '', notes: ''
});

// Sum of a set of sub-names' saved daily rates × shifts (shifts defaults to
// 1 when left blank, matching the single-select auto-fill formula this
// replaces) — null if any selected name has no saved rate, since then we
// can't auto-fill and the user has to type the amount themselves.
function sumSubRates(names: string[], master: WorkerSubName[], shifts: number | ''): number | null {
  if (names.length === 0) return null;
  let total = 0;
  for (const n of names) {
    const rate = master.find(s => s.sub_name === n)?.daily_rate;
    if (rate == null) return null;
    total += Math.round((Number(shifts) || 1) * rate * 100) / 100;
  }
  return Math.round(total * 100) / 100;
}

// Same recalculation sumSubRates does, but with a fallback for sub-names that
// have no saved daily_rate at all — which is the common case when editing an
// existing sub entry, since most sub-workers are never registered with a
// rate and were simply paid a typed-in amount. Instead of giving up (leaving
// the amount frozen forever), fall back to an "implied" per-shift rate
// derived from the record's own saved amount ÷ shifts (passed in by the
// caller, only while editing) and scale that by the new shift count. This is
// what lets changing Shift — or swapping the associate name — during an edit keep
// the Total Amount in sync even when nobody ever set up a saved rate.
function computeSubAmount(names: string[], master: WorkerSubName[], shifts: number | '', impliedRate: number | null): number | null {
  const sum = sumSubRates(names, master, shifts);
  if (sum != null) return sum;
  if (impliedRate != null && names.length > 0) {
    return Math.round((Number(shifts) || 1) * impliedRate * 100) / 100;
  }
  return null;
}

// Divides one combined Total Amount across several sub-names into the
// individual per-record amounts the backend actually stores (one row per
// sub_worker_name). When the total is still the untouched auto-sum, each
// person simply gets their own rate × shifts back. When the user typed a
// custom total, it's split proportionally by each person's saved rate (or
// evenly if rates aren't available) — the last name always absorbs the
// rounding remainder so the parts sum to exactly the entered total.
function splitAmountAcrossNames(
  names: string[], master: WorkerSubName[], total: number, shifts: number | '', auto: boolean
): { name: string; amount: number }[] {
  if (names.length === 0) return [];
  if (names.length === 1) return [{ name: names[0], amount: total }];

  const rates = names.map(n => master.find(s => s.sub_name === n)?.daily_rate ?? null);
  const allHaveRates = rates.every(r => r != null);

  if (auto && allHaveRates) {
    return names.map((n, i) => ({
      name: n,
      amount: Math.round((Number(shifts) || 1) * (rates[i] as number) * 100) / 100,
    }));
  }

  if (allHaveRates) {
    const rateSum = rates.reduce((s, r) => s + (r as number), 0) || 1;
    const out: { name: string; amount: number }[] = [];
    let running = 0;
    names.forEach((n, i) => {
      if (i === names.length - 1) {
        out.push({ name: n, amount: Math.round((total - running) * 100) / 100 });
      } else {
        const share = Math.round(total * ((rates[i] as number) / rateSum) * 100) / 100;
        running += share;
        out.push({ name: n, amount: share });
      }
    });
    return out;
  }

  // No saved rates to weight by at all — split evenly.
  const even = Math.floor((total / names.length) * 100) / 100;
  return names.map((n, i) => ({
    name: n,
    amount: i === names.length - 1 ? Math.round((total - even * (names.length - 1)) * 100) / 100 : even,
  }));
}

export default function AttendanceManagement() {
  const [userRole] = useState<string>(() => getStoredRole());
  const [categories, setCategories] = useState<Category[]>([]);
  const [bioData, setBioData] = useState<BioData[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [subNames, setSubNames] = useState<WorkerSubName[]>([]);
  const skipSubResetRef = useRef(false);
  // True once the user has typed directly into the Amount box during the
  // current edit/entry session — once set, we never re-enable auto-recalc
  // for them, so their manual override always wins over a saved rate.
  const userTypedAmountRef = useRef(false);
  // The "implied" per-shift rate (saved amount ÷ saved shifts) for the sub
  // entry currently being edited — set the instant Edit is clicked, cleared
  // the instant editing ends. Lets computeSubAmount() keep the Total Amount
  // in sync with Shift/sub-name changes even for sub-names with no saved
  // daily rate, instead of only working when a rate happens to be configured.
  const editImpliedRateRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useKeyboardFieldNav(rootRef);
  const [records, setRecords] = useState<AttRec[]>([]);
  const [date, setDate] = useState(today());
  const [form, setForm] = useState<FormState>(defaultForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [recLoading, setRecLoading] = useState(false);
  const [pageTab, setPageTab] = useState<'record' | 'view'>('record');
  const [viewDate, setViewDate] = useState(today());
  const [viewDateTo, setViewDateTo] = useState(today());
  const [viewRecords, setViewRecords] = useState<AttRec[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewShownFrom, setViewShownFrom] = useState<string | null>(null);
  const [viewShownTo, setViewShownTo] = useState<string | null>(null);
  const viewLoadedOnceRef = useRef(false);
  const [viewSearch, setViewSearch] = useState('');
  const [viewWorkerFilter, setViewWorkerFilter] = useState<number | null>(null);
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    appToast[type](msg);
  }, []);

  const incomeBio = bioData.filter(b => {
    const cat = categories.find(c => c.id === b.category_id);
    return cat?.type === 'income';
  });

  const selectedWorker = workers.find(w => w.id === form.workerId) ?? null;
  const isSubEntry = form.subNames.length > 0;
  const effectiveRate = form.rateOverride !== '' ? Number(form.rateOverride) : (selectedWorker?.daily_rate ?? 0);
  const autoAmount = selectedWorker && form.shifts !== ''
    ? Math.round(Number(form.shifts) * effectiveRate * 100) / 100
    : 0;
  const amount = isSubEntry
    ? (form.manualAmount === '' ? 0 : Math.round(Number(form.manualAmount) * 100) / 100)
    : autoAmount;

  const totalShifts = records.reduce((s, r) => s + r.shifts, 0);
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const presentCount = new Set(records.map(r =>
    r.sub_worker_name ? `${r.worker_id}:${r.sub_worker_name.toLowerCase()}` : `${r.worker_id}`
  )).size;

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [wRes, mdRes] = await Promise.all([
          axiosInstance.get('/api/workforce/workers'),
          axiosInstance.get('/api/master-data'),
        ]);
        const wData = wRes.data?.data ?? [];
        setWorkers(wData.filter((w: Worker) => w.is_active));
        const md = mdRes.data ?? {};
        setCategories(md.categories ?? []);
        setBioData(md.bio_data ?? []);
      } catch {
        showToast('Failed to load master data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadMaster();
  }, [showToast]);

  const loadRecords = useCallback(async () => {
    setRecLoading(true);
    try {
      const res = await axiosInstance.get('/api/workforce/attendance', { params: { date } });
      const raw = res.data?.data ?? res.data?.attendance ?? res.data;
      const arr: any[] = Array.isArray(raw) ? raw : [];
      setRecords(arr.map(r => ({ ...r, shifts: r.shifts_worked ?? r.shifts ?? 0 })));
    } catch {
      showToast('Failed to load records', 'error');
    } finally {
      setRecLoading(false);
    }
  }, [date, showToast]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const loadViewRecords = useCallback(async (from: string, to: string) => {
    if (to < from) {
      showToast('To date cannot be before From date', 'error');
      return;
    }
    setViewLoading(true);
    setViewSearch('');
    try {
      const res = await axiosInstance.get('/api/workforce/attendance', { params: { from_date: from, to_date: to } });
      const raw = res.data?.data ?? res.data?.attendance ?? res.data;
      const arr: any[] = Array.isArray(raw) ? raw : [];
      setViewRecords(arr.map(r => ({ ...r, shifts: r.shifts_worked ?? r.shifts ?? 0 })));
      setViewShownFrom(from);
      setViewShownTo(to);
    } catch {
      showToast('Failed to load records', 'error');
    } finally {
      setViewLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (pageTab === 'view' && !viewLoadedOnceRef.current) {
      viewLoadedOnceRef.current = true;
      loadViewRecords(viewDate, viewDateTo);
    }
  }, [pageTab, viewDate, viewDateTo, loadViewRecords]);

  useEffect(() => {
    if (skipSubResetRef.current) {
      skipSubResetRef.current = false;
    } else {
      setForm(f => ({ ...f, subNames: [], manualAmount: '', manualAmountAuto: false, rateOverride: '' }));
    }
    if (!form.workerId) { setSubNames([]); return; }
    // Two different worker records can share the same person's name (e.g. "Ajith"
    // registered twice at different daily rates, each with their own sub-names
    // added). Picking either one should pool sub-names from every active worker
    // record sharing that name, so all of them show up together instead of only
    // whichever specific duplicate record happens to be selected.
    const pickedName = (workers.find(w => w.id === form.workerId)?.name || '').trim().toLowerCase();
    const matchingIds = pickedName
      ? workers.filter(w => w.name.trim().toLowerCase() === pickedName).map(w => w.id)
      : [form.workerId];
    Promise.all(matchingIds.map(id =>
      axiosInstance.get(`/api/workforce/workers/${id}/sub-names`)
        .then(res => (res.data?.data ?? []) as WorkerSubName[])
        .catch(() => [] as WorkerSubName[])
    )).then(lists => {
      const seen = new Set<string>();
      const merged: WorkerSubName[] = [];
      lists.flat().forEach(s => {
        const key = s.sub_name.trim().toLowerCase();
        if (!seen.has(key)) { seen.add(key); merged.push(s); }
      });
      merged.sort((a, b) => a.sub_name.localeCompare(b.sub_name));
      setSubNames(merged);
    }).catch(() => setSubNames([]));
  }, [form.workerId, workers]);

  // Editing a sub-entry: the sub-name's saved rate is fetched asynchronously
  // above, so it usually isn't known yet the instant handleEdit runs. Once it
  // arrives, flip manualAmountAuto on (without touching the amount shown
  // right now) so the very next Shift click recalculates the amount from
  // that rate — matching how a brand-new entry behaves — instead of the
  // shift changing while the amount silently stays frozen at whatever was
  // saved before. Skipped once the user has typed their own amount.
  useEffect(() => {
    if (!editId || form.manualAmountAuto || userTypedAmountRef.current) return;
    const sum = computeSubAmount(form.subNames, subNames, form.shifts, editImpliedRateRef.current);
    if (sum != null) setForm(f => (f.manualAmountAuto ? f : { ...f, manualAmountAuto: true }));
  }, [editId, subNames, form.subNames, form.shifts, form.manualAmountAuto]);

  const addSubName = async (name: string) => {
    if (!form.workerId) return;
    try {
      const res = await axiosInstance.post(`/api/workforce/workers/${form.workerId}/sub-names`, { sub_name: name });
      const sub: WorkerSubName = res.data?.data;
      const updatedMaster = subNames.some(s => s.sub_name.toLowerCase() === sub.sub_name.toLowerCase())
        ? subNames
        : [...subNames, sub].sort((a, b) => a.sub_name.localeCompare(b.sub_name));
      setSubNames(updatedMaster);
      setForm(f => {
        // Editing a saved record represents exactly one row, so a newly
        // added name replaces rather than joins the selection there.
        const nextNames = editId ? [sub.sub_name] : (f.subNames.includes(sub.sub_name) ? f.subNames : [...f.subNames, sub.sub_name]);
        const sum = sumSubRates(nextNames, updatedMaster, f.shifts);
        return {
          ...f,
          subNames: nextNames,
          manualAmount: sum != null ? String(sum) : f.manualAmount,
          manualAmountAuto: sum != null,
        };
      });
      showToast(`Associate name "${sub.sub_name}" added`);
    } catch {
      showToast('Failed to add associate name', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientBioId || !form.workerId) {
      showToast('Please fill Client and Worker', 'error');
      return;
    }
    if (isSubEntry && (form.manualAmount === '' || Number(form.manualAmount) <= 0)) {
      showToast(`Enter the amount for ${form.subNames.join(', ')}`, 'error');
      return;
    }
    if (!isSubEntry && form.shifts === '') {
      showToast('Please select Shifts', 'error');
      return;
    }

    setSaving(true);
    const basePayload = {
      date,
      bio_data_id: form.clientBioId,
      worker_id: form.workerId,
      shifts_worked: form.shifts === '' ? null : Number(form.shifts),
      // Self-attendance rate for THIS entry only — defaults to the worker's own
      // saved rate unless overridden in the Daily Rate field.
      daily_rate: isSubEntry ? null : effectiveRate,
      notes: form.notes,
    };

    try {
      if (editId) {
        // One saved record = one sub_worker_name, so editing always sends
        // exactly the (at most one) name currently selected.
        await axiosInstance.put(`/api/workforce/attendance/${editId}`, {
          ...basePayload,
          sub_worker_name: form.subNames[0] ?? null,
          manual_amount: isSubEntry ? Number(form.manualAmount) : null,
        });
        showToast('Attendance updated');
      } else if (isSubEntry && form.subNames.length > 1) {
        // Multiple sub-names selected — one attendance row per person,
        // each carrying its own share of the combined Total Amount.
        const split = splitAmountAcrossNames(form.subNames, subNames, Number(form.manualAmount), form.shifts, form.manualAmountAuto);
        await Promise.all(split.map(s => axiosInstance.post('/api/workforce/attendance', {
          ...basePayload,
          sub_worker_name: s.name,
          manual_amount: s.amount,
        })));
        showToast(`Attendance recorded for ${split.length} sub-names`);
      } else {
        await axiosInstance.post('/api/workforce/attendance', {
          ...basePayload,
          sub_worker_name: form.subNames[0] ?? null,
          manual_amount: isSubEntry ? Number(form.manualAmount) : null,
        });
        showToast('Attendance recorded');
      }
      setForm(defaultForm());
      setEditId(null);
      userTypedAmountRef.current = false;
      editImpliedRateRef.current = null;
      loadRecords();
    } catch {
      showToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rec: AttRec) => {
    setEditId(rec.id);
    skipSubResetRef.current = true;
    userTypedAmountRef.current = false;
    const recSubNames = rec.sub_worker_name ? [rec.sub_worker_name] : [];
    // Derive this record's own implied per-shift rate from what was actually
    // saved (amount ÷ shifts) — this is what lets Shift changes (and sub-name
    // swaps) recalculate the amount below even when the sub-name has no
    // saved daily_rate configured, which is the common case.
    const impliedRate = (rec.is_sub_entry && Number(rec.shifts) > 0 && Number(rec.amount) > 0)
      ? Number(rec.amount) / Number(rec.shifts)
      : null;
    editImpliedRateRef.current = impliedRate;
    setForm({
      clientBioId: rec.bio_data_id,
      workerId: rec.worker_id,
      subNames: recSubNames,
      shifts: rec.shifts || '',
      manualAmount: rec.is_sub_entry ? String(rec.amount) : '',
      // Editing a saved record shows its actual saved amount as-is, so
      // changing shift never silently overwrites what was actually paid —
      // BUT the moment a rate is known for it (a real saved sub-name rate,
      // or — now — the implied rate derived above), this flips to true so
      // the very next Shift click *does* recalculate the amount, same as
      // adding a fresh entry. Checked here too in case it's cached already;
      // the effect below also catches it once the saved-rate list loads.
      manualAmountAuto: rec.is_sub_entry ? computeSubAmount(recSubNames, subNames, rec.shifts || '', impliedRate) != null : false,
      rateOverride: !rec.is_sub_entry && rec.daily_rate != null ? String(rec.daily_rate) : '',
      notes: rec.notes ?? '',
    });
    setPageTab('record');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* DELETE */
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await axiosInstance.delete(`/api/workforce/attendance/${deleteModal.id}`);
      showToast('Record deleted — moved to Recycle Bin');
      loadRecords();
      if (viewShownFrom && viewShownTo) loadViewRecords(viewShownFrom, viewShownTo);
    } catch {
      showToast('Delete failed', 'error');
    }
    setDeleteModal({ open: false, id: null });
  };
  // Delete 

  const cancelEdit = () => { setForm(defaultForm()); setEditId(null); userTypedAmountRef.current = false; editImpliedRateRef.current = null; };
  // Memoized so it's referentially stable across renders that don't touch
  // its own inputs — groupedViewRows below depends on this array and its
  // useMemo was being defeated every render by a fresh array here.
  const viewFiltered = React.useMemo(() => viewRecords.filter(r =>
    (!viewWorkerFilter || r.worker_id === viewWorkerFilter)
    && (!viewSearch
      || r.worker_name.toLowerCase().includes(viewSearch.toLowerCase())
      || (r.sub_worker_name || '').toLowerCase().includes(viewSearch.toLowerCase())
      || (r.client_name || '').toLowerCase().includes(viewSearch.toLowerCase()))),
    [viewRecords, viewWorkerFilter, viewSearch]);

  // Group the flat attendance list by manpower head (worker_id) so Ajith's own
  // entry plus every sub-worker entry under him show under one combined-total
  // row. Every group's breakdown (Sadasiv → dinesh, Sadasiv → saroj, ...) is
  // shown automatically by default — tracking COLLAPSED ids (rather than
  // expanded ones) means an empty set naturally means "everything visible",
  // with a toggle still available per row if you want to declutter one down.
  const [collapsedViewGroups, setCollapsedViewGroups] = useState<Set<number>>(new Set());
  const toggleViewGroup = (workerId: number) => {
    setCollapsedViewGroups(prev => {
      const next = new Set(prev);
      if (next.has(workerId)) next.delete(workerId); else next.add(workerId);
      return next;
    });
  };
  const groupedViewRows = React.useMemo(() => {
    const map = new Map<number, { workerId: number; workerName: string; clients: Set<string>; dates: Set<string>; totalShifts: number; totalAmount: number; entries: AttRec[] }>();
    viewFiltered.forEach(r => {
      if (!map.has(r.worker_id)) {
        map.set(r.worker_id, { workerId: r.worker_id, workerName: r.worker_name, clients: new Set(), dates: new Set(), totalShifts: 0, totalAmount: 0, entries: [] });
      }
      const g = map.get(r.worker_id)!;
      if (r.client_name) g.clients.add(r.client_name);
      if (r.date) g.dates.add(String(r.date).slice(0, 10));
      g.totalShifts += Number(r.shifts) || 0;
      g.totalAmount += Number(r.amount) || 0;
      g.entries.push(r);
    });
    // Self-attendance entry (if any) first, then sub-entries alphabetically,
    // then by date within each so the breakdown reads chronologically.
    map.forEach(g => g.entries.sort((a, b) => {
      if (a.is_sub_entry !== b.is_sub_entry) return a.is_sub_entry ? 1 : -1;
      const nameCmp = (a.sub_worker_name || '').localeCompare(b.sub_worker_name || '');
      return nameCmp !== 0 ? nameCmp : a.date.localeCompare(b.date);
    }));
    return [...map.values()].sort((a, b) => a.workerName.localeCompare(b.workerName));
  }, [viewFiltered]);
  // API returns `date` as a full ISO datetime (Laravel's `date` cast serializes
  // as e.g. "2026-07-24T00:00:00.000000Z"), not a plain YYYY-MM-DD — slice to
  // the date portion first so this doesn't produce "Invalid Date".
  const fmtShortDate = (d: string) => {
    const ymd = (d || '').slice(0, 10);
    return ymd ? new Date(ymd + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
  };
  const [mdPage, setMdPage] = useState(1);
  const [mdPerPage, setMdPerPage] = useState(10);
  const mdTotalPages = Math.max(1, Math.ceil(groupedViewRows.length / mdPerPage));
  const mdSafePage = Math.min(mdPage, mdTotalPages);
  const pagedViewRows = groupedViewRows.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);
  const resetViewFilters = () => {
    setViewWorkerFilter(null);
    setViewSearch('');
    const t = today();
    setViewDate(t);
    setViewDateTo(t);
    loadViewRecords(t, t);
  };
  const workerItems = [...workers].sort((a, b) => a.name.localeCompare(b.name)).map(w => ({
    id: w.id,
    label: w.name,
  }));
  const clientItems = [...incomeBio].sort((a, b) => a.name.localeCompare(b.name)).map(b => ({ id: b.id, label: b.name }));

  if (loading) return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2, 3].map(i => <div key={i} className="AT-skeleton" style={{ height: '60px', borderRadius: '12px' }} />)}
    </div>
  );

  return (
    <div ref={rootRef}>
      <style>{ERP_CSS}{CSS}</style>

      {/* ── HEADER START ── */}
      <div className="ERP-hdr">
        <div className="ERP-hdr-left">
          <div className="ERP-eyebrow">
            <span className="ERP-eyebrow-line" />
            <span className="ERP-eyebrow-dot" />
            Workforce &middot; Daily Attendance
          </div>
          <h1 className="ERP-title MD-page-title">Attendance <span className="ERP-title-em">Register</span></h1>
        </div>
      </div>
      <div className="ERP-divider" />
      {/* ── HEADER END ── */}

      {/* DELETE MODAL */}
      <ConfirmDeleteModal
        open={deleteModal.open}
        title="Delete Attendance Record"
        description="Delete this attendance record? This will move it to the recycle bin."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
      {/* DELETE MODAL */}

      {/* PAGE TABS START */}
      <div className="WR-tabs-bar">
        <button
          className={'WR-tab' + (pageTab === 'record' ? ' active' : '')}
          onClick={() => setPageTab('record')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Record Attendance
        </button>
        <button
          className={'WR-tab' + (pageTab === 'view' ? ' active' : '')}
          onClick={() => setPageTab('view')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          View Attendance
          <span className="WR-tab-badge">{viewRecords.length}</span>
        </button>
      </div>
      {/* ── PAGE TABS END ── */}

      {pageTab === 'record' && (
        <div className="AT-record-wrap">
          {/* ── STAT CARDS START ── */}
          <div className="ERP-stats">
            <div className="ERP-stat AT-anim-1">
              <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),#60A5FA)' }} />
              <div className="ERP-stat-label">Workers Present</div>
              <div className="ERP-stat-val" style={{ color: 'var(--ember)', fontSize: 16, fontWeight: 800 }}>{presentCount}</div>
            </div>
            <div className="ERP-stat AT-anim-2">
              <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#2563EB,#60A5FA)' }} />
              <div className="ERP-stat-label">Total Shifts</div>
              <div className="ERP-stat-val" style={{ color: '#2563EB', fontSize: 16, fontWeight: 800 }}>{totalShifts}</div>
            </div>
            <div className="ERP-stat AT-anim-3">
              <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#C47E0A,#3B82F6)' }} />
              <div className="ERP-stat-label">Total Amount</div>
              <div className="ERP-stat-val" style={{ color: '#C47E0A', fontSize: 16, fontWeight: 800 }}>₹{totalAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="ERP-stat AT-anim-4">
              <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#60A5FA,var(--ember-mid))' }} />
              <div className="ERP-stat-label">Sub Entries</div>
              <div className="ERP-stat-val" style={{ color: '#60A5FA', fontSize: 16, fontWeight: 800 }}>{records.filter(r => r.is_sub_entry).length}</div>
            </div>
          </div>
          {/* ── STAT CARDS END ── */}

          {/* MAIN GRID */}
          <div className="AT-root">
            {/* LEFT FORM START */}
            <div>
              <div className="ERP-form-card AT-anim-2" style={{ position: 'relative', overflow: 'visible' }}>
                <div className="ERP-form-topbar" />
                <div className="ERP-form-body">
                  {editId && (
                    <div className="AT-edit-banner">
                      <div className="AT-edit-lhs">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editing record #{editId}
                      </div>
                      <button className="AT-edit-cancel" onClick={cancelEdit}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* FORM START */}
                  <form onSubmit={handleSubmit}>
                    {/* SECTION 1 — DATE START (merged into the create form) */}
                    <div className="AT-sec">
                      <div className="AT-sec-num">1</div>
                      <div className="AT-sec-label">Attendance Date</div>
                      <div className="AT-sec-rule" />
                    </div>
                    <div className="AT-date-field" style={{ marginBottom: 18, maxWidth: 260 }}>
                      <CalendarDD value={date} onChange={setDate} />
                    </div>
                    {/* SECTION 1 — DATE END */}

                    {/* SECTION 2 — CLIENT START */}
                    <div className="AT-sec">
                      <div className="AT-sec-num">2</div>
                      <div className="AT-sec-label">Client / Site</div>
                      <div className="AT-sec-rule" />
                    </div>
                    {/* SECTION 2 — CLIENT END */}

                    {/* INCOME ACCOUNT START */}
                    <div className="AT-fld-label">
                      Client Name <span style={{ color: 'var(--error)' }}>*</span>
                      <span style={{ color: 'var(--text-3)', fontWeight: 800, fontStyle: 'normal', fontSize: '8px', textTransform: 'none', letterSpacing: 0 }}> income accounts only</span>
                    </div>
                    {/* INCOME ACCOUNT END */}

                    <SearchDD
                      items={clientItems}
                      value={form.clientBioId}
                      onChange={id => setForm(f => ({ ...f, clientBioId: id }))}
                      placeholder="Select client"
                      footer={`${clientItems.length} income accounts`}
                    />

                    {/* SECTION 3 — WORKER START */}
                    <div className="AT-sec">
                      <div className="AT-sec-num">3</div>
                      <div className="AT-sec-label">Worker Details</div>
                      <div className="AT-sec-rule" />
                    </div>
                    {/* SECTION 3 — WORKER END */}

                    {/* LABOUR NAME START */}
                    <div className="AT-dd-grid">
                      {/* Manpower Name Start */}
                      <div>
                        <div className="AT-fld-label">Manpower Name <span style={{ color: 'var(--error)' }}>*</span></div>
                        <SearchDD
                          items={workerItems}
                          value={form.workerId}
                          onChange={id => setForm(f => ({ ...f, workerId: id }))}
                          placeholder="Select worker"
                          footer={`${workers.length} registered workers`}
                          avatars
                        />
                      </div>
                      {/* Manpower Name End */}

                      {/* Associate Name Start */}
                      <div>
                        <div className="AT-fld-label">
                          Associate Name
                          <span style={{ color: 'var(--text-3)', fontWeight: 800, fontStyle: 'normal', fontSize: '8px', textTransform: 'none', letterSpacing: 0 }}> optional — check all referred workers who worked today</span>
                        </div>
                        <SubNameDD
                          names={subNames}
                          value={form.subNames}
                          multiple={!editId}
                          onToggle={name => {
                            // Editing a saved record can only ever carry one
                            // sub_worker_name, so picking a name there replaces
                            // the selection instead of adding to it.
                            setForm(f => {
                              const nextNames = editId
                                ? [name]
                                : (f.subNames.includes(name) ? f.subNames.filter(n => n !== name) : [...f.subNames, name]);
                              // Recalculate from each checked name's saved rate where
                              // possible; while editing, an un-rated name falls back
                              // to this record's own implied rate (see
                              // editImpliedRateRef) instead of freezing the total.
                              const sum = computeSubAmount(nextNames, subNames, f.shifts, editImpliedRateRef.current);
                              return {
                                ...f,
                                subNames: nextNames,
                                manualAmount: nextNames.length === 0 ? '' : (sum != null ? String(sum) : f.manualAmount),
                                manualAmountAuto: nextNames.length > 0 && sum != null,
                              };
                            });
                          }}
                          onClear={() => setForm(f => ({ ...f, subNames: [], manualAmount: '', manualAmountAuto: false }))}
                          onAdd={addSubName}
                          disabled={!form.workerId}
                        />
                      </div>
                      {/* Associate Name End */}

                    </div>
                    {/* Manpower Name End */}

                    {isSubEntry && selectedWorker && (
                      <div className="AT-sub-hint">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                        {(() => {
                          const selectedSubs = form.subNames.map(n => subNames.find(s => s.sub_name === n)).filter(Boolean) as WorkerSubName[];
                          const allHaveRates = selectedSubs.length === form.subNames.length && selectedSubs.every(s => s.daily_rate != null);
                          if (form.subNames.length === 1) {
                            return allHaveRates
                              ? <>Sub-worker entry: {selectedWorker.name} → {form.subNames[0]}. Amount auto-filled from {form.subNames[0]}'s saved rate (₹{selectedSubs[0].daily_rate}/day) — edit it below if today's pay is different.</>
                              : <>Sub-worker entry: {selectedWorker.name} → {form.subNames[0]}. Enter the amount directly — {selectedWorker.name}'s daily rate will not be used.</>;
                          }
                          return allHaveRates
                            ? <>{form.subNames.length} sub-workers under {selectedWorker.name}: {form.subNames.join(', ')}. Amount auto-summed from their saved rates — {form.subNames.length} separate attendance records will be created, edit the total below if today's pay differs.</>
                            : <>{form.subNames.length} sub-workers under {selectedWorker.name}: {form.subNames.join(', ')}. Some don't have a saved rate — enter the combined amount directly; it'll be split across all {form.subNames.length} of them.</>;
                        })()}
                      </div>
                    )}

                    {/* SECTION 4 — SHIFT & AMOUNT */}
                    <div className="AT-sec">
                      <div className="AT-sec-num">4</div>
                      <div className="AT-sec-label">Shift & Amount</div>
                      <div className="AT-sec-rule" />
                    </div>
                    {/* SECTION 4 — SHIFT & AMOUNT */}

                    {/* SHIFT & AMOUNT START */}
                    <div className="AT-dd-grid">
                      <div>

                        {/* SHIFT START */}
                        <div className="AT-fld-label">
                          Shift {isSubEntry
                            ? <span style={{ color: 'var(--text-3)', fontWeight: 800, fontStyle: 'normal', fontSize: '8px', textTransform: 'none', letterSpacing: 0 }}>optional for sub entry</span>
                            : <span style={{ color: 'var(--error)' }}>*</span>}
                        </div>
                        {/* SHIFT END */}

                        {/* SHIFT OPTIONS START */}
                        <div className="AT-shift-grid">
                          {SHIFT_OPTIONS.map(s => {
                            const sel = form.shifts === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                className={`AT-shift-card${sel ? ' sel' : ''}`}
                                onClick={() => setForm(f => {
                                  const newShifts = sel ? '' : s;
                                  // Sub-entry(ies) with no manual override yet: keep the
                                  // (summed) amount recalculating live as shift changes
                                  // (e.g. dinesh ₹700/day → 1.5 shifts → ₹1,050
                                  // automatically; same for several names at once). Uses
                                  // each name's saved rate where available, and falls back
                                  // to this record's own implied per-shift rate while
                                  // editing a sub-name with no saved rate configured.
                                  const shouldRecalc = f.subNames.length > 0 && f.manualAmountAuto;
                                  const sum = shouldRecalc ? computeSubAmount(f.subNames, subNames, newShifts, editImpliedRateRef.current) : null;
                                  return {
                                    ...f,
                                    shifts: newShifts,
                                    manualAmount: sum != null ? String(sum) : f.manualAmount,
                                  };
                                })}
                                title={`${s} shift${s !== 1 ? 's' : ''}`}
                              >
                                <span className="AT-shift-num">{s}</span>
                                <span className="AT-shift-hint">{SHIFT_LABELS[s]}</span>
                                <span className="AT-shift-check">
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {/* SHIFT OPTIONS END */}

                      </div>

                      {/* DAILY RATE START */}
                      <div>
                        <div className="AT-fld-label">
                          Daily Rate
                          {!isSubEntry && selectedWorker && (
                            <span style={{ color: 'var(--text-3)', fontWeight: 800, fontStyle: 'normal', fontSize: '8px', textTransform: 'none', letterSpacing: 0 }}> editable for today only</span>
                          )}
                        </div>
                        {isSubEntry ? (
                          <div className="AT-sub-display" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                            <span className="AT-sub-display-empty" style={{ textDecoration: 'line-through' }}>₹{selectedWorker?.daily_rate}/day — not used for sub</span>
                          </div>
                        ) : selectedWorker ? (
                          <div className="AT-rate-box">
                            <span className="AT-rate-box-prefix">₹</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="AT-rate-box-input"
                              placeholder={String(selectedWorker.daily_rate)}
                              value={form.rateOverride}
                              onChange={e => setForm(f => ({ ...f, rateOverride: e.target.value }))}
                              title={`Defaults to ${selectedWorker.name}'s saved rate (₹${selectedWorker.daily_rate}/day) — change it here just for this entry`}
                            />
                            <span className="AT-rate-box-suffix">/day</span>
                          </div>
                        ) : (
                          <div className="AT-sub-display" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                            <span className="AT-sub-display-empty">Select worker to see rate</span>
                          </div>
                        )}
                      </div>
                      {/* DAILY RATE END */}

                    </div>
                    {/* SHIFT & AMOUNT END */}

                    {/* AMOUNT DISPLAY / INPUT */}
                    <div style={{ marginTop: '13px' }}>
                      <div className="AT-fld-label">
                        Total Amount {isSubEntry && <span style={{ color: 'var(--error)' }}>*</span>}
                      </div>
                      <div className="AT-amount-wrap" style={amount > 0 ? { borderColor: 'var(--ember-border)' } : {}}>
                        <span className="AT-amount-prefix">₹</span>
                        {isSubEntry ? (
                          <input
                            className="AT-amount-input"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={form.subNames.length > 1 ? `Combined amount for ${form.subNames.length} sub-names…` : `Enter amount for ${form.subNames[0]}…`}
                            value={form.manualAmount}
                            onChange={e => { userTypedAmountRef.current = true; setForm(f => ({ ...f, manualAmount: e.target.value, manualAmountAuto: false })); }}
                          />
                        ) : (
                          <span className={`AT-amount-display${amount === 0 ? ' empty' : ''}`}>
                            {amount > 0 ? amount.toLocaleString('en-IN') : '0.00'}
                          </span>
                        )}
                        {!isSubEntry && selectedWorker && form.shifts !== '' && (
                          <div className="AT-amount-formula">
                            <span className="AT-amount-formula-line">{form.shifts} shift{form.shifts !== 1 ? 's' : ''} ×</span>
                            <span className="AT-amount-formula-line">₹{effectiveRate}/day</span>
                            <span className="AT-amount-formula-val">= ₹{amount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <span className={`AT-amount-mode ${isSubEntry && !form.manualAmountAuto ? 'manual' : 'auto'}`}>
                          {isSubEntry ? (form.manualAmountAuto ? 'Auto' : 'Manual') : 'Auto'}
                        </span>
                      </div>
                    </div>
                    {/* AMOUNT DISPLAY / INPUT END  */}

                    {/* SECTION 5 — DESCRIPTION START */}
                    <div className="AT-sec">
                      <div className="AT-sec-num">5</div>
                      <div className="AT-sec-label">Description</div>
                      <div className="AT-sec-rule" />
                    </div>
                    {/*SECTION 5 — DESCRIPTION END */}

                    <div className="AT-fld-label">Notes / Remarks</div>

                    <div className="AT-narration-wrap">
                      <textarea
                        className="AT-narration"
                        rows={3}
                        placeholder="Add site notes, task description, or any remarks…"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      />
                    </div>

                    {/* SUBMIT START */}
                    <div className="AT-form-actions">
                      <button type="button" className="AT-cancel-btn" onClick={cancelEdit} disabled={saving}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        Cancel
                      </button>
                      <button className="AT-submit" type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'db-spin 0.6s linear infinite' }}>
                              <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                            Saving…
                          </>
                        ) : editId ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Update Attendance
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                            Record Attendance
                          </>
                        )}
                      </button>
                    </div>
                    {/* SUBMIT END */}

                  </form>
                  {/* FORM END  */}
                </div>
              </div>
            </div>
            {/* Left Form End */}

            {/* ── RIGHT: TODAY'S RECORDS PANEL (sticky) — same UI as DaybookPage's DB-panel ── */}
            <div className="AT-panel">
              <div className="AT-panel-accent" />
              <div className="AT-panel-hdr">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ember)" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  </svg>
                  <span className="AT-panel-title">Today's Records</span>
                </div>
                <span className="AT-panel-badge">{Math.min(records.length, 15)} of {records.length}</span>
              </div>

              <div className="AT-panel-body">
                {recLoading ? (
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1, 2, 3].map(i => <div key={i} className="AT-skeleton" style={{ height: 48 }} />)}
                  </div>
                ) : records.length === 0 ? (
                  <div className="WR-empty">
                    <div className="WR-empty-icon">🗓️</div>
                    <div className="WR-empty-text">No attendance for this date</div>
                  </div>
                ) : (
                  <table className="WR-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Worker</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.slice(0, 15).map((rec, idx) => (
                        <tr key={rec.id} style={{ animationDelay: `${Math.min(idx, 20) * 22}ms` }}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', textAlign: 'center', width: 34 }}>{idx + 1}</td>
                          <td>
                            <div className="WR-name">{rec.worker_name}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 3 }}>
                              {rec.sub_worker_name && <span className="WR-skill-badge">{rec.sub_worker_name}</span>}
                              {rec.client_name && (
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 800, color: 'var(--text-3)' }}>{rec.client_name}</span>
                              )}
                              {(!rec.is_sub_entry || rec.shifts > 0) && (
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, color: 'var(--ember)' }}>
                                  {rec.shifts} shift{rec.shifts !== 1 ? 's' : ''}
                                </span>
                              )}
                              {rec.notes && (
                                <span style={{ fontSize: 9, color: 'var(--text-4)', fontStyle: 'italic' }} title={rec.notes}>
                                  "{rec.notes.length > 16 ? rec.notes.slice(0, 16) + '…' : rec.notes}"
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}><div className="WR-rate">₹{rec.amount.toLocaleString('en-IN')}</div></td>
                          <td>
                            <div className="AT-tbl-actions">
                              <button className="AT-tbl-act edit" title="Edit" onClick={() => handleEdit(rec)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              {canDelete(userRole) ? (
                                <button className="AT-tbl-act del" title="Delete" onClick={() => setDeleteModal({ open: true, id: rec.id })}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                                </button>
                              ) : (
                                <CreatorBadge name={rec.created_by_name} />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {records.length > 15 && (
                <div className="AT-scroll-hint" style={{ flexShrink: 0 }}>
                  Showing 15 of {records.length} — see View Attendance tab for the full list
                </div>
              )}
            </div>
            {/* ── RIGHT: TODAY'S RECORDS PANEL END ── */}

          </div>
          {/* MAIN GRID (AT-root) END */}
        </div>
      )}

      {pageTab === 'view' && (
        <>
          {/* ── VIEW ATTENDANCE — same table UI as Manpower Register "Workers" tab ── */}
          <div className="WR-tbl-card">
            <div className="WR-tbl-header">
              <div className="WR-tbl-title">
                {viewShownFrom && viewShownTo
                  ? (viewShownFrom === viewShownTo
                      ? new Date(viewShownFrom + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : `${new Date(viewShownFrom + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(viewShownTo + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`)
                  : 'Attendance Records'}
              </div>
              <div className="AT-view-filterbar">
                {/* From date filter */}
                <div className="AT-view-datefield">
                  <span className="AT-date-lbl" style={{ marginRight: 2 }}>From</span>
                  <CalendarDD value={viewDate} onChange={setViewDate} />
                </div>

                {/* To date filter */}
                <div className="AT-view-datefield">
                  <span className="AT-date-lbl" style={{ marginRight: 2 }}>To</span>
                  <CalendarDD value={viewDateTo} onChange={setViewDateTo} />
                </div>

                {/* Manpower Name filter */}
                <div className="AT-view-worker">
                  <SearchDD
                    items={workerItems}
                    value={viewWorkerFilter}
                    onChange={setViewWorkerFilter}
                    placeholder="All workers"
                    footer={`${workerItems.length} registered workers`}
                    compact
                  />
                </div>

                {/* Filter button — professional funnel icon, not a search trigger */}
                <button
                  className="AT-filter-btn AT-filter-apply"
                  disabled={viewLoading}
                  onClick={() => loadViewRecords(viewDate, viewDateTo)}
                >
                  {viewLoading ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'db-spin 0.6s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 5h17L14 13.2V19l-4 2v-7.8L3.5 5z" /></svg>
                  )}
                  Filter
                </button>

                {/* Reset — clears worker filter, search, and date back to today */}
                <button className="AT-filter-btn AT-filter-reset" onClick={resetViewFilters}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 1 3 6.7" /><path d="M3 21v-6h6" /></svg>
                  Reset
                </button>

                <div className="WR-search-wrap">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input className="WR-search" placeholder="Search name, associate name, client" value={viewSearch} onChange={e => setViewSearch(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="AT-view-note" style={{ margin: '14px 0 0' }}>
              Pick a From &amp; To date and worker above, then click <strong style={{ color: 'var(--ember)' }}>&nbsp;Filter&nbsp;</strong> to load it — nothing loads automatically except today.
            </div>

            {viewLoading ? (
              <div className="WR-loader">
                <RunningLoader label="Loading Attendance" />
                <div className="WR-skel-rows">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="WR-skel-row">
                      <div className="WR-skel" />
                      <div className="WR-skel tall" />
                      <div className="WR-skel" />
                      <div className="WR-skel tall" />
                      <div className="WR-skel" />
                      <div className="WR-skel" />
                    </div>
                  ))}
                </div>
              </div>
            ) : viewFiltered.length === 0 ? (
              <div className="WR-empty">
                <div className="WR-empty-icon">🗓️</div>
                <div className="WR-empty-text">{(viewSearch || viewWorkerFilter) ? 'No match found' : 'No attendance for this period'}</div>
              </div>
            ) : (
              <div className="WR-table-wrap">
                <table className="WR-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Manpower Head</th>
                      <th>Date</th>
                      <th>Client / Site</th>
                      <th>Shifts</th>
                      <th>Total Amount</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedViewRows.map((g, idx) => {
                      const expanded = !collapsedViewGroups.has(g.workerId);
                      const clientLabel = g.clients.size === 0 ? '—' : g.clients.size === 1 ? [...g.clients][0] : `${g.clients.size} clients`;
                      const sortedDates = [...g.dates].sort();
                      const dateLabel = sortedDates.length === 0 ? '—'
                        : sortedDates.length === 1 ? fmtShortDate(sortedDates[0])
                        : `${fmtShortDate(sortedDates[0])} – ${fmtShortDate(sortedDates[sortedDates.length - 1])}`;
                      return (
                        <React.Fragment key={g.workerId}>
                          <tr style={{ animationDelay: `${Math.min(idx, 20) * 22}ms` }} className={expanded ? 'AT-grp-row open' : 'AT-grp-row'}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', textAlign: 'center', width: 44 }}>{(mdSafePage - 1) * mdPerPage + idx + 1}</td>
                            <td>
                              <button type="button" className="AT-grp-toggle" onClick={() => toggleViewGroup(g.workerId)} title={expanded ? 'Collapse' : 'Show breakdown'}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`AT-grp-chevron${expanded ? ' open' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                                <div className="WR-name">{g.workerName}</div>
                                {g.entries.length > 1 && <span className="WR-skill-badge">{g.entries.length} entries</span>}
                              </button>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{dateLabel}{sortedDates.length > 1 && <span style={{ display: 'block', color: 'var(--text-4)', fontSize: 8 }}>{sortedDates.length} days</span>}</td>
                            <td>{clientLabel}</td>
                            <td>{g.totalShifts > 0 ? `${g.totalShifts} shift${g.totalShifts !== 1 ? 's' : ''}` : <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>}</td>
                            <td><div className="WR-rate">₹{g.totalAmount.toLocaleString('en-IN')}</div></td>
                            <td style={{ color: 'var(--text-4)', fontSize: 9.5, fontStyle: 'italic' }}>{g.entries.length > 1 ? 'see breakdown' : (g.entries[0]?.notes || '—')}</td>
                            <td>
                              {g.entries.length === 1 && (
                                <div className="AT-tbl-actions">
                                  <button className="AT-tbl-act edit" title="Edit" onClick={() => handleEdit(g.entries[0])}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  </button>
                                  {canDelete(userRole) ? (
                                    <button className="AT-tbl-act del" title="Delete" onClick={() => setDeleteModal({ open: true, id: g.entries[0].id })}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                                    </button>
                                  ) : (
                                    <CreatorBadge name={g.entries[0].created_by_name} />
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                          {expanded && g.entries.map(rec => (
                            <tr key={rec.id} className="AT-grp-sub-row">
                              <td />
                              <td style={{ paddingLeft: 30 }}>
                                {rec.sub_worker_name ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: 'var(--text-4)', fontSize: 9.5, fontWeight: 700 }}>{g.workerName} →</span>
                                    <span className="WR-skill-badge">{rec.sub_worker_name}</span>
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-3)', fontSize: 9.5, fontStyle: 'italic' }}>{g.workerName} (self)</span>
                                )}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{fmtShortDate(rec.date)}</td>
                              <td>{rec.client_name || <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>}</td>
                              <td>{(!rec.is_sub_entry || rec.shifts > 0) ? `${rec.shifts} shift${rec.shifts !== 1 ? 's' : ''}` : <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>}</td>
                              <td><div className="WR-rate">₹{rec.amount.toLocaleString('en-IN')}</div></td>
                              <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-4)', fontStyle: rec.notes ? 'italic' : 'normal' }}>{rec.notes || '—'}</td>
                              <td>
                                <div className="AT-tbl-actions">
                                  <button className="AT-tbl-act edit" title="Edit" onClick={() => handleEdit(rec)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  </button>
                                  {canDelete(userRole) ? (
                                    <button className="AT-tbl-act del" title="Delete" onClick={() => setDeleteModal({ open: true, id: rec.id })}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                                    </button>
                                  ) : (
                                    <CreatorBadge name={rec.created_by_name} />
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!viewLoading && groupedViewRows.length > 0 && (
              <Pagination
                page={mdSafePage}
                totalPages={mdTotalPages}
                onPageChange={setMdPage}
                total={groupedViewRows.length}
                perPage={mdPerPage}
                onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                itemLabel="manpower heads"
              />
            )}
          </div>
          {/* ── VIEW ATTENDANCE END ── */}
        </>
      )}
    </div>
  );
}