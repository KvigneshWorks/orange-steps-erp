import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ERP_CSS } from './ERPTheme';
import { T_CSS } from './ReportTheme';
import { CalendarDD } from '../components/CalendarDD';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import RunningLoader from '../components/RunningLoader';
import PageOpenIntro from '../components/PageOpenIntro';
import { getStoredRole, canDelete } from '../utils/roleAccess';
import CreatorBadge from '../components/CreatorBadge';
interface Category { id: number; name: string; type: 'income' | 'expense'; }
interface SubCategory { id: number; name: string; category_id: number; }
interface BioData { id: number; name: string; category_id?: number; }
interface SubName { id: number; alternate_name: string; bio_data_id: number; }

interface TxEntry {
  id: number;
  transaction_date: string;
  amount: number;
  payment_mode: string;
  narration: string | null;
  client_name: string | null;
  category_name: string;
  category_type?: 'income' | 'expense';
  sub_category_name: string | null;
  bio_data_name: string;
  sub_name_name?: string | null;
  created_by_name?: string | null;
  category_id: number;
  sub_category_id: number | null;
  bio_data_id: number;
  sub_name_id?: number | null;
}

interface Stats { income: number; expense: number; balance: number; }

interface EditForm {
  transaction_date: string;
  amount: string;
  payment_mode: string;
  narration: string;
  client_name: string;
  category_id: string;
  sub_category_id: string;
  bio_data_id: string;
  sub_name_id: string;
}

const COMPANY = {
  name: 'OrangeSteps',
  address: 'GRAND BRENTON - 281, Avinashi Rd, Periyar Nagar, Coimbatore, Tamil Nadu 641004',
  phone: '+91 95667-01640',
  email: 'info@orangesteps.in',
};

const PAYMENT_CHIP: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  'Cash': { color: '#1E9C6A', bg: 'rgba(30,156,106,0.08)', border: 'rgba(30,156,106,0.22)', emoji: '💵' },
  'UPI': { color: '#DB5B1F', bg: 'rgba(40,112,204,0.08)', border: 'rgba(40,112,204,0.22)', emoji: '📱' },
  'NEFT': { color: '#9A3412', bg: 'rgba(196,126,10,0.08)', border: 'rgba(196,126,10,0.22)', emoji: '🏦' },
  'Cheque': { color: '#C2410C', bg: 'rgba(155,69,204,0.08)', border: 'rgba(155,69,204,0.22)', emoji: '📄' },
  'Bank Transfer': { color: '#A6491D', bg: 'rgba(8,145,178,0.08)', border: 'rgba(8,145,178,0.22)', emoji: '🔄' },
  'Others': { color: '#6B5D48', bg: 'rgba(107,107,107,0.08)', border: 'rgba(107,107,107,0.22)', emoji: '⋯' },
};

const getChip = (pm: string) => PAYMENT_CHIP[pm] ?? PAYMENT_CHIP['Others'];
const PATHS: Record<string, string> = {
  ledger: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  check: 'M5 13l4 4L19 7',
  x: 'M6 18L18 6M6 6l12 12',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  scale: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  cash: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  bank: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  arrowUp: 'M5 10l7-7m0 0l7 7m-7-7v18',
  arrowDown: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  circle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  chartBar: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  print: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  pdf: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  word: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1v5h5M8 13h2m-2 4h8m-8-2h8',
  chevronDown: 'M5 8l7 7 7-7',
  client: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  note: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  income: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  tag2: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  subname: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
  spark: 'M13 10V3L4 14h7v7l9-11h-7z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  hash: 'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
  id: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
  sparkles: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 5.5L19 7l-5.5 2.5L11 15l-2.5-5.5L3 7l5.5-2.5L11 1z',
  arrowRight: 'M9 5l7 7-7 7',
  loader: 'M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83M16.24 7.76l2.83-2.83M4.93 19.07l2.83-2.83',
};

const Icon = ({ name, size = 16, color = 'currentColor' }: { name: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d={PATHS[name] || PATHS.ledger} />
  </svg>
);

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

interface SDDOpt { value: string; label: string; }
interface SDDProps {
  options: SDDOpt[]; value: string;
  onChange: (v: string) => void; placeholder: string;
  disabled?: boolean; label?: string;
}

function SearchDD({ options, value, onChange, placeholder, disabled = false, label }: SDDProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [query, setQuery] = useState('');
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
      setQuery('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      setOpen(false); setQuery('');
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const computeStyle = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const panelH = Math.min(280, options.length * 38 + 80);
    const goAbove = spaceBelow < panelH && r.top > panelH;
    setPanelStyle({
      position: 'fixed',
      left: r.left,
      width: r.width,
      zIndex: 99999,
      ...(goAbove
        ? { bottom: window.innerHeight - r.top, borderRadius: 'var(--r-md) var(--r-md) 0 0', borderTopWidth: '1.5px', borderBottomWidth: 0 }
        : { top: r.bottom, borderRadius: '0 0 var(--r-md) var(--r-md)', borderTopWidth: 0, borderBottomWidth: '1.5px' }),
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!open) computeStyle();
    setOpen(o => !o);
  };

  const pick = (v: string) => { onChange(v); setOpen(false); setQuery(''); };
  const panel = open ? createPortal(
    <div ref={panelRef} className="SDD-panel" style={panelStyle}>
      <div className="SDD-search-row">
        <Icon name="search" size={12} color="var(--text-4)" />
        <input autoComplete="off" ref={inputRef} className="SDD-search" placeholder="Search…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button className="SDD-clr" onClick={() => setQuery('')}><Icon name="x" size={9} /></button>}
      </div>
      <div className="SDD-list">
        {value && (
          <div className="SDD-item SDD-clear" role="option" tabIndex={-1} aria-selected={false} onClick={() => pick('')}>
            <Icon name="x" size={9} /><span>Clear selection</span>
          </div>
        )}
        {filtered.length === 0
          ? <div className="SDD-empty"><Icon name="inbox" size={14} color="var(--text-4)" /> No results</div>
          : filtered.map(opt => (
            <div key={opt.value}
              role="option" tabIndex={-1} aria-selected={value === opt.value}
              className={`SDD-item${value === opt.value ? ' sel' : ''}`}
              onClick={() => pick(opt.value)}>
              <span>{opt.label}</span>
              {value === opt.value && <Icon name="check" size={11} color="var(--ember)" />}
            </div>
          ))}
      </div>
      <div className="SDD-footer">{filtered.length} / {options.length} results</div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="SDD-root" data-disabled={disabled}>
        {label && <label className="ERP-label">{label}</label>}
        <button type="button" ref={triggerRef}
          className={`SDD-trigger${open ? ' open' : ''}${selected ? ' has-value' : ''}${disabled ? ' disabled' : ''}`}
          onClick={handleToggle} onKeyDown={onTriggerKeyDown}>
          <span className="SDD-content">
            {selected
              ? <span className="SDD-selected">{selected.label}</span>
              : <span className="SDD-ph">{placeholder}</span>}
          </span>
          <span className={`SDD-chevron${open ? ' open' : ''}`}>
            <Icon name="chevronDown" size={12} />
          </span>
        </button>
        {panel}
      </div>
    </>
  );
}

interface MultiSDDProps {
  options: SDDOpt[];
  value: string[];
  onChange: (vals: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  label?: string;
}

function MultiSearchDD({ options, value, onChange, placeholder, disabled = false, label }: MultiSDDProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [query, setQuery] = useState('');
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const selectedLabels = options.filter(o => value.includes(o.value)).map(o => o.label);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false); setQuery('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      setOpen(false); setQuery('');
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const computeStyle = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const panelH = Math.min(300, options.length * 38 + 110);
    const goAbove = spaceBelow < panelH && r.top > panelH;
    setPanelStyle({
      position: 'fixed',
      left: r.left,
      width: r.width,
      zIndex: 99999,
      ...(goAbove
        ? { bottom: window.innerHeight - r.top, borderRadius: 'var(--r-md) var(--r-md) 0 0', borderTopWidth: '1.5px', borderBottomWidth: 0 }
        : { top: r.bottom, borderRadius: '0 0 var(--r-md) var(--r-md)', borderTopWidth: 0, borderBottomWidth: '1.5px' }),
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!open) computeStyle();
    setOpen(o => !o);
  };

  const toggleVal = (v: string) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  const selectAll = () => onChange(filtered.map(o => o.value));
  const clearAll = () => onChange([]);

  const panel = open ? createPortal(
    <div ref={panelRef} className="SDD-panel" style={panelStyle}>
      <div className="SDD-search-row">
        <Icon name="search" size={12} color="var(--text-4)" />
        <input autoComplete="off" ref={inputRef} className="SDD-search" placeholder="Search…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button className="SDD-clr" onClick={() => setQuery('')}><Icon name="x" size={9} /></button>}
      </div>
      <div className="SDD-multi-actions">
        <button type="button" onClick={selectAll}>Select all</button>
        <span>·</span>
        <button type="button" onClick={clearAll}>Clear</button>
        {value.length > 0 && <span className="SDD-multi-count">{value.length} selected</span>}
      </div>
      <div className="SDD-list">
        {filtered.length === 0
          ? <div className="SDD-empty"><Icon name="inbox" size={14} color="var(--text-4)" /> No results</div>
          : filtered.map(opt => {
            const sel = value.includes(opt.value);
            return (
              <div key={opt.value}
                role="option" tabIndex={-1} aria-selected={sel}
                className={`SDD-item SDD-multi-item${sel ? ' sel' : ''}`}
                onClick={() => toggleVal(opt.value)}>
                <span className="SDD-multi-item-lbl">{opt.label}</span>
                <span className={`SDD-checkbox${sel ? ' on' : ''}`}>
                  {sel && <Icon name="check" size={9} color="#faf9f7" />}
                </span>
              </div>
            );
          })}
      </div>
      <div className="SDD-footer">{filtered.length} / {options.length} results</div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="SDD-root" data-disabled={disabled}>
        {label && <label className="ERP-label">{label}</label>}
        <button type="button" ref={triggerRef}
          className={`SDD-trigger${open ? ' open' : ''}${value.length ? ' has-value' : ''}${disabled ? ' disabled' : ''}`}
          onClick={handleToggle} onKeyDown={onTriggerKeyDown}>
          <span className="SDD-content">
            {value.length === 0
              ? <span className="SDD-ph">{placeholder}</span>
              : value.length === 1
                ? <span className="SDD-selected">{selectedLabels[0]}</span>
                : <span className="SDD-selected">{value.length} selected</span>}
          </span>
          {value.length > 0 && <span className="SDD-multi-badge">{value.length}</span>}
          <span className={`SDD-chevron${open ? ' open' : ''}`}>
            <Icon name="chevronDown" size={12} />
          </span>
        </button>
        {panel}
      </div>
    </>
  );
}

interface IncomeNameFilterProps {
  options: SDDOpt[];
  subNameMap: Record<string, SubName[]>;
  values: string[];
  selectedSubNames: Record<string, string[]>;
  onChange: (vals: string[]) => void;
  onSubNameChange: (bioId: string, subIds: string[]) => void;
  onSearch: () => void;
  totalDebitCount: number;
}

function IncomeNameFilter({
  options, subNameMap, values, selectedSubNames,
  onChange, onSubNameChange, onSearch, totalDebitCount,
}: IncomeNameFilterProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
  useDropdownPanelArrowNav(open, setOpen, listRef, triggerRef, { autoFocusFirst: false });
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const hasSelection = values.length > 0;
  const totalSubSel = Object.values(selectedSubNames).reduce((a, b) => a + b.length, 0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  const clearAll = () => onChange([]);
  const handleApply = () => { onSearch(); setOpen(false); };

  return (
    <>
      {/* ── Trigger Button Start ── */}
      <button
        type="button"
        ref={triggerRef}
        className={`INF2-trigger${hasSelection ? ' active' : ''}`}
        onClick={() => setOpen(true)}
        onKeyDown={onTriggerKeyDown}>

        {/* Current Color Start */}
        <div className={`INF2-trigger-icon${hasSelection ? ' active' : ''}`}>
          <Icon name="income" size={15} color="currentColor" />
        </div>
        {/* Current Color End */}

        {/* Income Party Filter Start */}
        <div className="INF2-trigger-body">
          <span className="INF2-trigger-lbl">Income Party Filter</span>
          <span className={`INF2-trigger-val${hasSelection ? ' has' : ''}`}>
            {hasSelection
              ? `${values.length} ${values.length === 1 ? 'party' : 'parties'} selected`
              : 'Click to filter DR entries by income party…'}
          </span>
        </div>
        {/* Income Party FIlter End */}

        {hasSelection && <span className="INF2-trigger-badge">{values.length}</span>}
        {totalSubSel > 0 && <span className="INF2-trigger-sub-badge">{totalSubSel} sub</span>}
        <div className={`INF2-trigger-arrow${hasSelection ? ' active' : ''}`}>
          <Icon name="filter" size={13} color="currentColor" />
        </div>
      </button>
      {/* ── Trigger Button End ── */}

      {/* ── Drawer overlay + panel ── */}
      {open && (
        <>
          <div className="INF2-overlay" onClick={() => setOpen(false)} />
          <div className="INF2-drawer">

            {/* Header Start */}
            <div className="INF2-drawer-hdr">

              {/* Icon Start */}
              <div className="INF2-drawer-hdr-icon">
                <Icon name="income" size={18} color="#faf9f7" />
              </div>
              {/* Icon End */}

              {/* Income Party Filter Start */}
              <div className="INF2-drawer-hdr-text">
                <div className="INF2-drawer-title">Income Party Filter</div>
                <div className="INF2-drawer-subtitle">
                  {options.length} parties · matches bio name or client name in DR entries
                </div>
              </div>
              {/* Income Party Filter End */}

              {/* Icon Start */}
              <button className="INF2-drawer-close" onClick={() => setOpen(false)}>
                <Icon name="x" size={15} color="currentColor" />
              </button>
              {/* Icon End */}
            </div>
            {/* Header End */}

            {/* Search  Bar Start */}
            <div className="INF2-search-wrap">
              <Icon name="search" size={14} color="var(--text-4)" />
              <input autoComplete="off"
                ref={inputRef}
                className="INF2-search"
                placeholder="Search party names…"
                value={query}
                onChange={e => setQuery(e.target.value)} />
              {query && (
                <button className="INF2-search-clr" onClick={() => setQuery('')}>
                  <Icon name="x" size={10} color="currentColor" />
                </button>
              )}
              <span className="INF2-search-pill">{filtered.length} / {options.length}</span>
            </div>
            {/* Search Bar End */}

            {/* Selection summary bar */}
            {hasSelection && (
              <div className="INF2-sel-bar">
                <div className="INF2-sel-bar-left">
                  <Icon name="check" size={11} color="var(--success)" />
                  <strong>{values.length}</strong> selected
                  {totalSubSel > 0 && <> · <strong>{totalSubSel}</strong> sub-names</>}
                </div>
                <button className="INF2-sel-bar-clear" onClick={clearAll}>
                  <Icon name="x" size={9} color="currentColor" /> Clear all
                </button>
              </div>
            )}
            {/* Selection Summary Bar */}

            {/* Party list */}
            <div className="INF2-list" ref={listRef}>
              {filtered.length === 0 ? (
                <div className="INF2-empty">
                  <Icon name="inbox" size={32} color="var(--border-2)" />
                  <span>No parties found</span>
                </div>
              ) : filtered.map(opt => {
                const isSel = values.includes(opt.value);
                const subs = subNameMap[opt.value] || [];
                const selSubIds = selectedSubNames[opt.value] || [];
                return (
                  <div key={opt.value} className={`INF2-item${isSel ? ' sel' : ''}`}>

                    {/* Party Row Start */}
                    <div className="INF2-item-row" role="option" tabIndex={-1} aria-selected={isSel} onClick={() => toggle(opt.value)}>
                      <div className={`INF2-cb${isSel ? ' checked' : ''}`}>
                        {isSel && <Icon name="check" size={10} color="#faf9f7" />}
                      </div>
                      <div className={`INF2-avatar${isSel ? ' sel' : ''}`}>
                        {opt.label.charAt(0).toUpperCase()}
                      </div>
                      <div className="INF2-item-info">
                        <span className="INF2-item-name">{opt.label}</span>
                        {subs.length > 0 && (
                          <span className="INF2-item-meta">
                            <Icon name="subname" size={9} color="currentColor" />
                            {subs.length} sub-name{subs.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isSel && selSubIds.length > 0 && (
                        <span className="INF2-item-sub-sel">{selSubIds.length} sub selected</span>
                      )}
                    </div>
                    {/* Party Row End */}

                    {/* Sub-Names Start */}
                    {isSel && subs.length > 0 && (
                      <div className="INF2-subnames">
                        <div className="INF2-subnames-label">
                          <Icon name="subname" size={9} color="currentColor" />
                          Sub-names for <strong>{opt.label}</strong>
                          {selSubIds.length > 0 &&
                            <span className="INF2-subnames-cnt">{selSubIds.length} selected</span>}
                        </div>
                        <div className="INF2-subnames-grid">
                          {subs.map(sn => {
                            const snSel = selSubIds.includes(String(sn.id));
                            return (
                              <button
                                key={sn.id}
                                type="button"
                                className={`INF2-sub-pill${snSel ? ' sel' : ''}`}
                                onClick={ev => {
                                  ev.stopPropagation();
                                  onSubNameChange(opt.value,
                                    snSel
                                      ? selSubIds.filter(x => x !== String(sn.id))
                                      : [...selSubIds, String(sn.id)]);
                                }}>
                                <div className={`INF2-sub-cb${snSel ? ' checked' : ''}`}>
                                  {snSel && <Icon name="check" size={7} color="#faf9f7" />}
                                </div>
                                {sn.alternate_name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Associate Names End */}

                  </div>
                );
              })}
            </div>
            {/* Party List End */}

            {/* Footer Start */}
            <div className="INF2-drawer-foot">

              {/* DR Entries Match Start */}
              <div className="INF2-foot-info">
                {hasSelection
                  ? <><span className="INF2-foot-count">{totalDebitCount}</span> DR entries match</>
                  : 'Select one or more parties above'}
              </div>
              {/* DR Entries Match End */}

              {/* Cancel Button Start */}
              <div className="INF2-foot-btns">

                {/* Cancel Button Start */}
                <button className="INF2-foot-cancel" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                {/* Cancel Button End */}

                {/* Apply Filter Start */}
                <button
                  className="INF2-foot-apply"
                  disabled={!hasSelection}
                  onClick={handleApply}>
                  <Icon name="search" size={13} color="#faf9f7" />
                  Apply Filter
                  {hasSelection && totalDebitCount > 0 &&
                    <span className="INF2-foot-apply-badge">{totalDebitCount}</span>}
                </button>
                {/* Apply Filter End */}

              </div>
              {/* Cancel Button End */}
            </div>
            {/* Footer End */}
          </div>
        </>
      )}
    </>
  );
}

const authHeader = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = fmt(now);
  switch (preset) {
    case 'today': return { from: today, to: today };
    case 'week': { const m = new Date(now); m.setDate(now.getDate() - ((now.getDay() + 6) % 7)); return { from: fmt(m), to: today }; }
    case 'month': return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    case 'quarter': return { from: fmt(new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)), to: today };
    case 'year': return { from: fmt(new Date(now.getFullYear(), 0, 1)), to: today };
    default: return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
  }
}

function computeStats(entries: TxEntry[], categories: Category[]): Stats {
  let income = 0, expense = 0;
  for (const e of entries) {
    let type = e.category_type;
    if (!type) { const cat = categories.find(c => c.id === e.category_id); type = cat?.type ?? 'expense'; }
    if (type === 'income') income += Number(e.amount);
    else expense += Number(e.amount);
  }
  return { income, expense, balance: income - expense };
}

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray(x.data)) return x.data;
  return [];
}

function getEntryType(entry: TxEntry, categories: Category[]): 'income' | 'expense' {
  if (entry.category_type) return entry.category_type;
  const cat = categories.find(c => c.id === entry.category_id);
  return cat?.type ?? 'expense';
}

async function exportToWord(
  filteredEntries: TxEntry[], categories: Category[],
  fromDate: string, toDate: string,
  displayStats: Stats, activeFilterLabels: string[]
) {
  if (!(window as any).docx) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/docx/8.5.0/docx.umd.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load docx library'));
      document.head.appendChild(s);
    });
  }

  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign,
    PageOrientation, Header, Footer, PageNumber,
  } = (window as any).docx;

  const now = new Date();
  const printedOn = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const C = {
    headerBg: 'F5A623', headerText: 'FFFFFF',
    incomeGreen: '1E9C6A', expenseRed: 'D93B55', balanceBlue: 'F5A623',
    rowAlt: 'FAFAF8', rowWhite: 'FFFFFF', subtleBg: 'FEF8E8',
    borderGray: 'E8E3D8', labelGray: '9C9285', titleNavy: '2C2C2C',
  };

  const border = { style: BorderStyle.SINGLE, size: 1, color: C.borderGray };
  const borders = { top: border, bottom: border, left: border, right: border };
  const CONTENT_W = 15398;
  const COLS = [400, 1100, 1600, 1100, 1200, 1200, 1100, 1200, 1100, 1200, 700, 1498];
  const HEADERS = ['S.No', 'Date', 'Party Name', 'Associate Name', 'Client', 'Account Head', 'Account Sub-Head', 'Payment', 'Amount (₹)', 'Narration', 'CR/DR', 'Notes'];
  const headerRow = new TableRow({
    tableHeader: true,
    children: HEADERS.map((h, i) => new TableCell({
      borders, width: { size: COLS[i], type: WidthType.DXA },
      shading: { fill: C.headerBg, type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [new Paragraph({
        alignment: i >= 8 && i <= 10 ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({ text: h, bold: true, color: C.headerText, size: 17, font: 'Arial' })],
      })],
    })),
  });

  const dataRows = filteredEntries.map((entry, i) => {
    const type = getEntryType(entry, categories);
    const isCr = type === 'income';
    const rowBg = i % 2 === 1 ? C.rowAlt : C.rowWhite;
    const mc = (text: string, opts: { bold?: boolean; color?: string; align?: any; colIdx: number }) =>
      new TableCell({
        borders, width: { size: COLS[opts.colIdx], type: WidthType.DXA },
        shading: { fill: rowBg, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: opts.align ?? AlignmentType.LEFT,
          children: [new TextRun({ text, bold: opts.bold ?? false, color: opts.color ?? '374151', size: 16, font: 'Arial' })],
        })],
      });

    return new TableRow({
      children: [
        mc(String(i + 1), { colIdx: 0, align: AlignmentType.CENTER, color: C.labelGray }),
        mc(formatDate(entry.transaction_date), { colIdx: 1 }),
        mc(entry.bio_data_name, { colIdx: 2, bold: true, color: C.titleNavy }),
        mc(entry.sub_name_name || '—', { colIdx: 3, color: entry.sub_name_name ? '4B5563' : C.labelGray }),
        mc(entry.client_name || '—', { colIdx: 4, color: entry.client_name ? '1E9C6A' : C.labelGray }),
        mc(entry.category_name, { colIdx: 5 }),
        mc(entry.sub_category_name || '—', { colIdx: 6, color: entry.sub_category_name ? '4B5563' : C.labelGray }),
        mc(entry.payment_mode, { colIdx: 7 }),
        mc(`${isCr ? '+' : '-'}${Number(entry.amount).toLocaleString('en-IN')}`,
          { colIdx: 8, bold: true, color: isCr ? C.incomeGreen : C.expenseRed, align: AlignmentType.RIGHT }),
        mc(entry.narration || '—', { colIdx: 9, color: entry.narration ? '4B5563' : C.labelGray }),
        mc(isCr ? 'CR' : 'DR', { colIdx: 10, bold: true, color: isCr ? C.incomeGreen : C.expenseRed, align: AlignmentType.CENTER }),
        mc('', { colIdx: 11 }),
      ]
    });
  });

  const colW3 = Math.floor(CONTENT_W / 3);
  const statsTable = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [colW3, colW3, CONTENT_W - 2 * colW3],
    rows: [new TableRow({
      children: [
        new TableCell({ borders, width: { size: colW3, type: WidthType.DXA }, shading: { fill: 'E6F9F0', type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL CREDIT (CR)', bold: true, size: 16, color: C.incomeGreen, font: 'Arial' })] }), new Paragraph({ children: [new TextRun({ text: `₹ ${displayStats.income.toLocaleString('en-IN')}`, bold: true, size: 32, color: C.incomeGreen, font: 'Arial' })] })] }),
        new TableCell({ borders, width: { size: colW3, type: WidthType.DXA }, shading: { fill: 'FEE8E8', type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL DEBIT (DR)', bold: true, size: 16, color: C.expenseRed, font: 'Arial' })] }), new Paragraph({ children: [new TextRun({ text: `₹ ${displayStats.expense.toLocaleString('en-IN')}`, bold: true, size: 32, color: C.expenseRed, font: 'Arial' })] })] }),
        new TableCell({ borders, width: { size: CONTENT_W - 2 * colW3, type: WidthType.DXA }, shading: { fill: 'FEF8E8', type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [new Paragraph({ children: [new TextRun({ text: 'NET BALANCE', bold: true, size: 16, color: C.balanceBlue, font: 'Arial' })] }), new Paragraph({ children: [new TextRun({ text: `₹ ${Math.abs(displayStats.balance).toLocaleString('en-IN')} ${displayStats.balance >= 0 ? 'CR' : 'DR'}`, bold: true, size: 32, color: displayStats.balance >= 0 ? C.balanceBlue : C.expenseRed, font: 'Arial' })] })] }),
      ]
    })],
  });

  const txTable = new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: COLS, rows: [headerRow, ...dataRows] });
  const doc = new Document({
    creator: COMPANY.name, title: 'Cash Book Transactions Report',
    sections: [{
      properties: { page: { size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.headerBg, space: 4 } }, spacing: { after: 60 }, children: [new TextRun({ text: COMPANY.name, bold: true, size: 28, color: C.titleNavy, font: 'Arial' }), new TextRun({ text: '   |   ', size: 20, color: C.labelGray, font: 'Arial' }), new TextRun({ text: COMPANY.address, size: 18, color: '4B5563', font: 'Arial' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${COMPANY.name}  ·  Cash Book Report  ·  ${printedOn}  ·  Page `, size: 15, color: C.labelGray, font: 'Arial' }), new PageNumber()] })] }) },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, children: [new TextRun({ text: 'DAYBOOK TRANSACTIONS REPORT', bold: true, size: 36, color: C.titleNavy, font: 'Arial' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: `Period: ${formatDate(fromDate)} to ${formatDate(toDate)}  ·  ${filteredEntries.length} Records  ·  ${printedOn}`, size: 19, color: C.labelGray, font: 'Arial' })] }),
        statsTable,
        new Paragraph({ spacing: { before: 160, after: 100 }, children: [] }),
        txTable,
        new Paragraph({ spacing: { before: 240 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 200, after: 40 }, children: [new TextRun({ text: '___________________________', size: 22, color: C.labelGray, font: 'Arial' })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Authorised Signatory', size: 18, bold: true, color: C.titleNavy, font: 'Arial' })] }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `daybook_${fromDate}_to_${toDate}.docx`; a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════════════════════
const TX_CSS = `
/* Wider working area on this page specifically — the table has a lot of
   columns (S No, Date, Client, Category, Sub Category, Party Name, Associate Name,
   Payment Mode, Amount, Narration, Actions), so it benefits from more
   horizontal room than the shared .ERP-page default (36px side padding)
   leaves it. Loads after ERP_CSS in the <style> tag, same specificity,
   so this wins on this page only — every other page keeps the default. */
.ERP-page { padding-left: 16px; padding-right: 16px; }

/* Report-style fused card: a Report-Center-matching header bar (icon +
   title + badge + actions) owns the top border/radius, .T-date-bar and
   .T-filterpanel are plain mid-stack segments (side borders only, no
   radius of their own — each layer's own bottom border is the divider),
   and .TX-toolbar/.TX-tbl-wrap/.TX-empty-card close it off with the
   bottom radius, exactly matching how ReportCenter.tsx nests everything
   inside one .T-card. Kept as separate fused pieces rather than one real
   .T-card wrapper because .T-card's own 36px side margin + full-radius
   border don't fit this page's edge-to-edge layout (see .TX-empty-card
   comment below for the same reasoning). */
.T-card-head.TX-fused-head {
  border: 1.5px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
}
.T-date-bar {
  border-left: 1.5px solid var(--border);
  border-right: 1.5px solid var(--border);
}
.T-filterpanel {
  border-left: 1.5px solid var(--border);
  border-right: 1.5px solid var(--border);
  border-radius: 0;
  margin-bottom: 0;
}
.TX-toolbar {
  padding: 10px 22px;
  background: var(--off-white);
  border: 1.5px solid var(--border);
  border-top: none;
  margin-bottom: 0 !important;
}
.TX-tbl-wrap {
  border-top: none !important;
  border-radius: 0 0 var(--r-xl) var(--r-xl) !important;
  margin-top: 0 !important;
}

/* "Choose a Filter" empty state (shown before any filter is applied) reused
   the generic .T-card component, which brings its own 36px side margin and
   full corner radius — that shrank it into a small, disconnected floating
   box sitting below the full-width filter panel instead of reading as one
   continuous panel. This fuses it the same way .TX-toolbar/.TX-tbl-wrap
   fuse to the filter panel above: flush width, no top border/radius, only
   the bottom corners rounded, no left accent bar. */
.TX-empty-card {
  margin: 0 !important;
  border: 1.5px solid var(--border) !important;
  border-top: none !important;
  border-radius: 0 0 var(--r-xl) var(--r-xl) !important;
}
.TX-empty-card::before {
  display: none;
}

/* ─── TX-page variables ───────────────────────────────────────────────────────
   Fonts, colors, shadows AND radius tokens (--r-sm/md/lg/xl) all come from
   the shared ERP_CSS :root — deliberately NOT redeclared here. A previous
   local :root override (6/10/14/18px) was subtly smaller than ERP_CSS's
   real values (6/10/16/22px), which made every rounded box on this page
   (cards, panels, buttons, table) a different size than the Cash Book create
   page even though the class names matched. Removed for exact parity.
─────────────────────────────────────────────────────────────────────────────── */

/* ── Animations ── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
}
@keyframes borderPulse {
  0%, 100% { border-color: var(--ember-border); }
  50% { border-color: var(--ember); }
}
.animate-in { animation: slideUp 0.4s ease both; }
.animate-fade { animation: fadeIn 0.3s ease both; }
.animate-scale { animation: scaleIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) both; }

/* ══ Stat Cards — deliberately NOT overridden here. .ERP-stats/.ERP-stat*
   come purely from shared ERPTheme (ERP_CSS), the exact same rules the
   Cash Book create page uses, so card width/columns/gap are pixel-identical
   between the two pages. (A previous auto-fit/gap override here was what
   made the two pages' card sizing diverge — removed.) Only the page-local
   sub-line badge is styled here, matching DaybookPage's .DB-stat-overall-badge. ══ */
.TX-stat-sub {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 7.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: rgba(255,255,255,0.07);
  color: var(--text-4);
  border: 1px solid rgba(255,255,255,0.10);
  margin-top: 6px;
}

/* ── Compact stat cards (page-local override): icons removed above, so
   cards are shrunk to a tighter, numbers-and-labels-only footprint, and
   the grid is rebalanced to 3 columns now that "Filtered" was dropped. ── */
.ERP-stats { grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
@media (max-width: 900px) { .ERP-stats { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
@media (max-width: 600px) { .ERP-stats { grid-template-columns: 1fr; } }
.ERP-stat { padding: 12px 14px 10px; }
.ERP-stat-label { margin-bottom: 4px; }
.ERP-stat-val { font-size: 21px !important; }
/* Numbers stay hidden until a filter narrows the data — an unfiltered
   default total reads as "the" answer when it's really just everything. */
.TX-stat-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  font-style: italic;
  color: var(--text-4);
  letter-spacing: 0.2px;
}
/* Cash/Bank-Holding breakdown chips on the Total Credit, Total Debit &
   Net Balance cards — same concept + same class names as the Daybook
   create page's .DB-stat-chip-* so both pages render identically. */
@keyframes db-hold-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-4deg); } }
.DB-stat-breakdown { display: flex; gap: 7px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.06); width: 100%; }
.DB-stat-chip {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border-radius: 8px; border: 1px solid;
}
.DB-stat-chip.cash { background: rgba(30,156,106,0.07); border-color: rgba(30,156,106,0.24); }
.DB-stat-chip.bank { background: rgba(8,145,178,0.07); border-color: rgba(8,145,178,0.24); }
.DB-stat-chip-icon {
  width: 18px; height: 18px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  animation: db-hold-float 2.8s ease-in-out infinite;
}
.DB-stat-chip.cash .DB-stat-chip-icon { background: rgba(30,156,106,0.16); }
.DB-stat-chip.bank .DB-stat-chip-icon { background: rgba(8,145,178,0.16); animation-delay: .35s; }
.DB-stat-chip-icon svg { width: 9px; height: 9px; }
.DB-stat-chip-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.DB-stat-chip-label { font-family: var(--font-mono); font-size: 6.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--text-4); }
.DB-stat-chip-val { font-family: var(--font-mono); font-size: 10.5px; font-weight: 800; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 480px) {
  .DB-stat-chip-label { font-size: 6px; }
  .DB-stat-chip-val { font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .DB-stat-chip-icon { animation: none; }
}

/* ══ Filter Panel ══ */
.TX-filters {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-xl);
  padding: 22px 24px;
  margin-bottom: 20px;
  box-shadow: var(--sh-card);
  animation: scaleIn 0.4s ease both;
  transition: all 0.25s ease;
}
.TX-filters:hover {
  border-color: var(--ember-border);
  box-shadow: var(--sh-hover);
}
.TX-filter-hdr {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.TX-filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-3);
}
.TX-quick-picks {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: auto;
}
.TX-qp {
  padding: 6px 14px;
  border-radius: 40px;
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
  letter-spacing: 0.3px;
}
.TX-qp:hover {
  border-color: var(--ember-border);
  color: var(--ember);
  background: var(--ember-ghost);
  transform: translateY(-1px);
}
.TX-qp.active {
  background: var(--ember);
  border-color: var(--ember);
  color: var(--white);
  box-shadow: 0 4px 12px rgba(37,99,235, 0.25);
}
.TX-filter-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 18px 0;
}
.TX-filter-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
}
.TX-filter-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}
.TX-filter-row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}
@media (max-width: 1100px) {
  .TX-filter-row { grid-template-columns: 1fr 1fr 1fr; }
  .TX-filter-row2, .TX-filter-row3 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 680px) {
  .TX-filter-row, .TX-filter-row2, .TX-filter-row3 { grid-template-columns: 1fr; }
}
.TX-search-wrap {
  position: relative;
}
.TX-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-4);
  pointer-events: none;
}
.TX-search {
  padding: 10px 12px 10px 38px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-1);
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.TX-search::placeholder {
  color: var(--text-4);
  font-style: italic;
}
.TX-search:focus {
  border-color: var(--ember-mid);
  box-shadow: 0 0 0 3px var(--ember-ghost);
}
.TX-filter-reset {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: var(--r-md);
  background: var(--white);
  border: 1.5px solid var(--border);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 42px;
}
.TX-filter-reset:hover {
  border-color: var(--error-bd);
  color: var(--error);
  background: var(--error-bg);
  transform: translateY(-1px);
}
.TX-section-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.TX-section-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-4);
  white-space: nowrap;
}
.TX-section-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border), transparent);
}
.TX-active-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.TX-active-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-4);
}
.TX-active-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 100px;
  background: var(--ember-ghost);
  border: 1px solid var(--ember-border);
  font-size: 9px;
  font-weight: 700;
  color: var(--ember);
  transition: all 0.2s ease;
}
.TX-active-chip:hover {
  background: var(--ember);
  color: var(--white);
  border-color: var(--ember);
}
.TX-active-chip-x {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
  font-size: 11.5px;
  font-weight: 600;
}
.TX-active-chip-x:hover { opacity: 1; }

/* ══ Income Name Filter Section ══ */
.TX-inf-section {
  margin-top: 18px;
}
.TX-inf-section-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.TX-inf-section-lbl {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--success);
}
.TX-inf-section-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  font-size: 9px;
  font-weight: 800;
  color: var(--success);
}
.TX-inf-section-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--success-bd), transparent);
}
.TX-inf-section-note {
  font-size: 9px;
  color: var(--text-4);
  font-style: italic;
}

/* ══ SDD Dropdown ══ */
.SDD-root {
  width: 100%;
  /* no position:relative needed — panel renders via portal into document.body */
}
.SDD-root[data-disabled="true"] {
  opacity: 0.4;
  pointer-events: none;
}
.SDD-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  min-height: 44px;
  outline: none;
}
.SDD-trigger:hover {
  border-color: var(--border-2);
  background: var(--off-white);
}
.SDD-trigger.open {
  border-color: var(--ember-mid);
  box-shadow: 0 0 0 3px var(--ember-ghost);
  /* border-radius stays intact — panel is detached via portal */
}
.SDD-trigger.has-value {
  border-color: var(--ember-border);
}
.SDD-content {
  flex: 1;
  min-width: 0;
}
.SDD-selected {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.SDD-ph {
  font-size: 9.5px;
  color: var(--text-4);
  font-style: italic;
}
.SDD-chevron {
  color: var(--text-4);
  transition: transform 0.2s, color 0.18s;
  flex-shrink: 0;
  display: flex;
}
.SDD-chevron.open {
  transform: rotate(180deg);
  color: var(--ember);
}
.SDD-panel {
  /* position/top/left/width/z-index are set via inline style (portal) */
  background: var(--white);
  border: 1.5px solid var(--ember-mid);
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  animation: sdd-drop 0.14s cubic-bezier(0.34,1.1,0.64,1) both;
}
@keyframes sdd-drop {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}
.SDD-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--off-white);
}
.SDD-search {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 10px;
  color: var(--text-1);
}
.SDD-search::placeholder {
  color: var(--text-4);
}
.SDD-clr {
  background: none;
  border: none;
  padding: 3px;
  cursor: pointer;
  color: var(--text-4);
  display: flex;
  transition: color 0.15s;
}
.SDD-clr:hover {
  color: var(--error);
}
.SDD-list {
  max-height: 210px;
  overflow-y: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #DB5B1F rgba(203,213,225,0.18);
}
.SDD-list::-webkit-scrollbar {
  width: 5px;
}
.SDD-list::-webkit-scrollbar-track {
  background: transparent;
}
.SDD-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  border: none;
}
.SDD-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FBC9A8 0%, #DB5B1F 42%, #C2410C 100%);
  box-shadow: 0 0 8px rgba(59,130,246,0.5);
}
.SDD-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background 0.1s ease;
  font-size: 10.5px;
  color: var(--text-2);
}
.SDD-item:hover {
  background: var(--ember-ghost);
  color: var(--text-1);
}
.SDD-item.sel {
  background: var(--ember-ghost);
  color: var(--ember);
  font-weight: 700;
}
.SDD-clear {
  color: var(--text-4);
  font-size: 9px;
  border-bottom: 1px solid var(--border);
  padding: 8px 14px;
  gap: 7px;
}
.SDD-clear:hover {
  background: var(--error-bg);
  color: var(--error);
}
.SDD-empty {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 16px 14px;
  font-size: 9.5px;
  color: var(--text-4);
}
.SDD-footer {
  padding: 6px 14px;
  border-top: 1px solid var(--border);
  font-size: 9px;
  color: var(--text-4);
  text-align: right;
  background: var(--off-white);
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
}

/* ── Multi-select additions ── */
.SDD-multi-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--off-white);
}
.SDD-multi-actions button {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--ember);
  cursor: pointer;
}
.SDD-multi-actions button:hover { text-decoration: underline; }
.SDD-multi-actions span { color: var(--text-4); font-size: 9px; }
.SDD-multi-count {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 8.5px;
  font-weight: 800;
  color: var(--ember) !important;
  background: var(--ember-ghost);
  padding: 2px 8px;
  border-radius: 100px;
}
.SDD-multi-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.SDD-multi-item-lbl { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.SDD-checkbox {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  border-radius: 5px;
  border: 1.5px solid var(--border-2);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.SDD-multi-item:hover .SDD-checkbox { border-color: var(--ember); transform: scale(1.08); }
.SDD-checkbox.on {
  background: var(--ember);
  border-color: var(--ember);
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(37,99,235,0.3);
}
.SDD-multi-badge {
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 100px;
  background: var(--ember);
  color: #faf9f7;
  font-family: var(--font-mono);
  font-size: 8.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
/* ══ INF2 — Income Name Filter (fixed drawer) ══ */
.INF2-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  cursor: pointer;
  text-align: left;
  outline: none;
  transition: all 0.2s ease;
}
.INF2-trigger:hover {
  border-color: var(--ember);
  background: var(--off-white);
}
.INF2-trigger.active {
  border-color: var(--ember);
  background: color-mix(in srgb, var(--ember) 5%, transparent);
}
.INF2-trigger-icon {
  width: 36px; height: 36px;
  border-radius: var(--r-sm);
  background: var(--off-white);
  border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--text-3);
  transition: all 0.2s;
}
.INF2-trigger-icon.active {
  background: var(--ember);
  border-color: var(--ember);
  color: #faf9f7;
}
.INF2-trigger-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.INF2-trigger-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-3);
}
.INF2-trigger-val {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.INF2-trigger-val.has {
  color: var(--ember);
  font-weight: 700;
}
.INF2-trigger-badge {
  background: var(--ember);
  color: #faf9f7;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.INF2-trigger-sub-badge {
  background: var(--success-bg);
  color: var(--success);
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.INF2-trigger-arrow {
  color: var(--text-4);
  flex-shrink: 0;
  transition: color 0.2s;
}
.INF2-trigger-arrow.active {
  color: var(--ember);
}

/* Chips row */
.INF2-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.INF2-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px 4px 10px;
  background: color-mix(in srgb, var(--ember) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--ember) 35%, transparent);
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--ember);
}
.INF2-chip-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--ember);
  flex-shrink: 0;
}
.INF2-chip-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.INF2-chip-sub {
  background: var(--ember);
  color: #faf9f7;
  font-size: 8px;
  padding: 1px 5px;
  border-radius: 999px;
}
.INF2-chip-x {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ember) 20%, transparent);
  border: none; cursor: pointer; color: var(--ember);
  transition: background 0.15s;
}
.INF2-chip-x:hover { background: var(--ember); color: #faf9f7; }
.INF2-chips-clear {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: transparent;
  border: 1px dashed var(--border-2);
  border-radius: 999px;
  font-size: 9px;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.INF2-chips-clear:hover { border-color: var(--danger); color: var(--danger); }

/* Overlay + Drawer */
.INF2-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(2px);
  z-index: 1000;
  animation: INF2-fadeIn 0.18s ease;
}
.INF2-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 95vw;
  background: var(--white);
  border-left: 1.5px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  box-shadow: -8px 0 32px rgba(0,0,0,0.15);
  animation: INF2-slideIn 0.22s cubic-bezier(0.34, 1.1, 0.64, 1);
}
@keyframes INF2-fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes INF2-slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }

/* Drawer header */
.INF2-drawer-hdr {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 18px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.INF2-drawer-hdr-icon {
  width: 44px; height: 44px;
  border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--ember), color-mix(in srgb, var(--ember) 70%, #000));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.INF2-drawer-hdr-text { flex: 1; min-width: 0; }
.INF2-drawer-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-1);
  font-family: var(--font-display);
}
.INF2-drawer-subtitle {
  font-size: 9px;
  color: var(--text-4);
  margin-top: 2px;
}
.INF2-drawer-close {
  width: 32px; height: 32px;
  border-radius: var(--r-sm);
  background: var(--off-white);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-3);
  transition: all 0.15s;
  flex-shrink: 0;
}
.INF2-drawer-close:hover { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

/* Search bar */
.INF2-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--off-white);
}
.INF2-search {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 10.5px;
  color: var(--text-1);
  outline: none;
  font-family: var(--font-body);
}
.INF2-search::placeholder { color: var(--text-4); }
.INF2-search-clr {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--border-2);
  border: none; cursor: pointer; color: var(--text-3);
}
.INF2-search-clr:hover { background: var(--danger); color: #faf9f7; }
.INF2-search-pill {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-4);
  background: var(--border);
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Selection summary bar */
.INF2-sel-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--success) 8%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--success) 25%, transparent);
  font-size: 9.5px;
  color: var(--text-2);
  flex-shrink: 0;
}
.INF2-sel-bar-left { display: flex; align-items: center; gap: 6px; }
.INF2-sel-bar-left strong { color: var(--success); }
.INF2-sel-bar-clear {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 9px;
  border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent);
  border-radius: 999px;
  background: transparent;
  font-size: 9px;
  color: var(--danger);
  cursor: pointer;
  transition: all 0.15s;
}
.INF2-sel-bar-clear:hover { background: var(--danger-bg); }

/* Party list */
.INF2-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.INF2-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 60px 20px;
  font-size: 10.5px; color: var(--text-4);
}
.INF2-item {
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  background: var(--white);
  overflow: hidden;
  transition: border-color 0.15s, background 0.15s;
}
.INF2-item.sel {
  border-color: var(--ember);
  background: color-mix(in srgb, var(--ember) 4%, transparent);
}
.INF2-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.12s;
}
.INF2-item-row:hover { background: var(--off-white); }
.INF2-item.sel .INF2-item-row:hover {
  background: color-mix(in srgb, var(--ember) 8%, transparent);
}
.INF2-cb {
  width: 20px; height: 20px;
  border-radius: 6px;
  border: 2px solid var(--border-2);
  background: var(--white);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.INF2-cb.checked {
  background: var(--ember);
  border-color: var(--ember);
}
.INF2-avatar {
  width: 34px; height: 34px;
  border-radius: var(--r-sm);
  background: var(--off-white);
  border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--text-3);
  font-family: var(--font-display);
  flex-shrink: 0;
  transition: all 0.15s;
}
.INF2-avatar.sel {
  background: color-mix(in srgb, var(--ember) 15%, transparent);
  border-color: var(--ember);
  color: var(--ember);
}
.INF2-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.INF2-item-name {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.INF2-item.sel .INF2-item-name { color: var(--ember); }
.INF2-item-meta {
  display: flex; align-items: center; gap: 4px;
  font-size: 9px; color: var(--text-4);
}
.INF2-item-sub-sel {
  font-size: 9px;
  font-weight: 800;
  color: var(--success);
  background: var(--success-bg);
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Sub-names section */
.INF2-subnames {
  padding: 10px 14px 12px;
  border-top: 1px dashed color-mix(in srgb, var(--ember) 25%, transparent);
  background: color-mix(in srgb, var(--ember) 3%, transparent);
}
.INF2-subnames-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 8px;
}
.INF2-subnames-cnt {
  background: var(--success);
  color: #faf9f7;
  font-size: 8px;
  padding: 1px 6px;
  border-radius: 999px;
}
.INF2-subnames-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.INF2-sub-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  font-size: 9px;
  font-weight: 700;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.12s;
}
.INF2-sub-pill:hover { border-color: var(--ember); color: var(--ember); }
.INF2-sub-pill.sel {
  background: var(--ember);
  border-color: var(--ember);
  color: #faf9f7;
  font-weight: 800;
}
.INF2-sub-cb {
  width: 13px; height: 13px;
  border-radius: 3px;
  border: 1.5px solid rgba(255,255,255,0.6);
  display: flex; align-items: center; justify-content: center;
}
.INF2-sub-cb.checked { background: rgba(255,255,255,0.3); }

/* Drawer footer */
.INF2-drawer-foot {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  background: var(--off-white);
}
.INF2-foot-info {
  font-size: 9.5px;
  color: var(--text-3);
  flex: 1;
}
.INF2-foot-count {
  font-size: 16px;
  font-weight: 800;
  color: var(--ember);
  font-family: var(--font-mono);
}
.INF2-foot-btns { display: flex; gap: 8px; }
.INF2-foot-cancel {
  padding: 9px 16px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.INF2-foot-cancel:hover { border-color: var(--border-2); color: var(--text-1); }
.INF2-foot-apply {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: var(--ember);
  border: none;
  border-radius: var(--r-sm);
  font-size: 10.5px;
  font-weight: 800;
  color: #faf9f7;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
}
.INF2-foot-apply:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.INF2-foot-apply:disabled { opacity: 0.45; cursor: not-allowed; }
.INF2-foot-apply-badge {
  background: rgba(255,255,255,0.25);
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
}
/* ══ [end INF2] ══ */
.INF-LEGACY-PLACEHOLDER {  }
.INF-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
}
.INF-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  cursor: pointer;
  text-align: left;
  outline: none;
  transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
  min-height: 52px;
}
.INF-trigger:hover {
  border-color: var(--success-bd);
  background: var(--success-bg);
}
.INF-trigger.open {
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(30, 156, 106, 0.08);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.INF-trigger.active {
  border-color: var(--success-bd);
  background: var(--success-bg);
}
.INF-trigger-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.INF-trigger-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  color: var(--success);
  transition: all 0.2s ease;
}
.INF-trigger-icon.active {
  background: var(--success);
  color: var(--white);
  border-color: var(--success);
  box-shadow: 0 3px 8px rgba(30, 156, 106, 0.2);
}
.INF-trigger-txt {
  flex: 1;
  min-width: 0;
}
.INF-trigger-lbl {
  display: block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--success);
  margin-bottom: 2px;
}
.INF-trigger-val {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  color: var(--success);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.INF-trigger-ph {
  display: block;
  font-size: 9.5px;
  color: var(--text-4);
}
.INF-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  background: var(--success);
  color: var(--white);
  border-radius: 100px;
  font-size: 9px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(30, 156, 106, 0.2);
}
.INF-sub-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  border-radius: 100px;
  font-size: 8px;
  font-weight: 800;
  color: var(--success);
  flex-shrink: 0;
}
.INF-apply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 52px;
  flex-shrink: 0;
  border-radius: var(--r-md);
  background: var(--white);
  border: 1.5px solid var(--border);
  color: var(--text-4);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.INF-apply-btn:hover:not(:disabled) {
  border-color: var(--success-bd);
  color: var(--success);
  background: var(--success-bg);
  transform: translateY(-1px);
}
.INF-apply-btn.active {
  background: var(--success);
  border-color: var(--success);
  color: var(--white);
  box-shadow: 0 3px 12px rgba(30, 156, 106, 0.25);
}
.INF-apply-btn.active:hover {
  box-shadow: 0 5px 16px rgba(30, 156, 106, 0.35);
  transform: translateY(-2px);
}
.INF-apply-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.INF-apply-count {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--error);
  color: var(--white);
  border-radius: 100px;
  font-size: 8px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--white);
}
.INF-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--white);
  border: 1.5px solid var(--success);
  border-top: none;
  border-bottom-left-radius: var(--r-md);
  border-bottom-right-radius: var(--r-md);
  box-shadow: 0 16px 40px rgba(30, 156, 106, 0.12);
  overflow: hidden;
  animation: inf-drop 0.16s ease both;
}
@keyframes inf-drop {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}
.INF-panel-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  background: var(--success-bg);
  border-bottom: 1px solid var(--success-bd);
}
.INF-panel-hdr-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.INF-panel-hdr-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success);
  flex-shrink: 0;
}
.INF-panel-hdr-title {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--success);
}
.INF-panel-hdr-pill {
  padding: 2px 8px;
  border-radius: 100px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  font-size: 8px;
  font-weight: 800;
  color: var(--success);
}
.INF-panel-hdr-note {
  font-size: 9px;
  color: var(--text-4);
}
.INF-clear-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: var(--r-sm);
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--success);
  cursor: pointer;
  transition: all 0.14s ease;
}
.INF-clear-btn:hover {
  background: var(--success);
  color: var(--white);
  border-color: var(--success);
}
.INF-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--off-white);
}
.INF-search {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 10.5px;
  color: var(--text-1);
  caret-color: var(--success);
}
.INF-search::placeholder {
  color: var(--text-4);
}
.INF-search-clr {
  background: none;
  border: none;
  padding: 3px;
  cursor: pointer;
  color: var(--text-4);
  display: flex;
  transition: color 0.15s;
}
.INF-search-clr:hover {
  color: var(--success);
}
.INF-search-count-lbl {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-4);
  padding: 2px 8px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  flex-shrink: 0;
}
.INF-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 5px 0;
}
.INF-list::-webkit-scrollbar {
  width: 4px;
}
.INF-list::-webkit-scrollbar-thumb {
  background: var(--success-bd);
  border-radius: 4px;
}
.INF-item-wrap {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;
}
.INF-item-wrap:last-child {
  border-bottom: none;
}
.INF-item-wrap.sel {
  background: var(--success-bg);
}
.INF-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.1s ease;
}
.INF-item:hover {
  background: rgba(30, 156, 106, 0.04);
}
.INF-item.sel {
  background: rgba(30, 156, 106, 0.04);
}
.INF-item-cb {
  width: 18px;
  height: 18px;
  border-radius: var(--r-sm);
  flex-shrink: 0;
  border: 1.5px solid var(--border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  transition: all 0.14s ease;
}
.INF-item-cb.checked {
  background: var(--success);
  border-color: var(--success);
  box-shadow: 0 1px 4px rgba(30, 156, 106, 0.2);
}
.INF-item-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--off-white);
  border: 1px solid var(--border);
  font-size: 10.5px;
  font-weight: 800;
  color: var(--text-3);
  transition: all 0.14s ease;
}
.INF-item-avatar.sel {
  background: var(--success-bg);
  border-color: var(--success-bd);
  color: var(--success);
}
.INF-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.INF-item-name {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.INF-item-wrap.sel .INF-item-name {
  color: var(--text-1);
  font-weight: 800;
}
.INF-item-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: var(--text-4);
}
.INF-item-sub-sel {
  font-size: 8px;
  font-weight: 800;
  padding: 2px 8px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  border-radius: 100px;
  color: var(--success);
  flex-shrink: 0;
}
.INF-subnames {
  padding: 10px 14px 12px 42px;
  background: rgba(30, 156, 106, 0.02);
  border-top: 1px dashed var(--success-bd);
  animation: inf-sub-in 0.15s ease both;
}
@keyframes inf-sub-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: none; }
}
.INF-subnames-hdr {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 8px;
}
.INF-subnames-sel-count {
  margin-left: auto;
  font-size: 8px;
  font-weight: 800;
  color: var(--success);
  padding: 2px 8px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  border-radius: 100px;
}
.INF-subnames-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.INF-sub-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 100px;
  background: var(--white);
  border: 1px solid var(--border-2);
  font-size: 9px;
  font-weight: 700;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.14s ease;
}
.INF-sub-pill:hover {
  border-color: var(--success);
  color: var(--success);
  background: var(--success-bg);
}
.INF-sub-pill.sel {
  background: var(--success-bg);
  border-color: var(--success);
  color: var(--success);
  font-weight: 800;
}
.INF-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  font-size: 9px;
  color: var(--text-4);
  text-align: center;
}
.INF-panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  background: var(--off-white);
}
.INF-panel-foot-info {
  font-size: 9px;
  color: var(--text-4);
  font-weight: 700;
}
.INF-panel-apply {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: var(--r-md);
  background: var(--success);
  border: none;
  color: var(--white);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 8px rgba(30, 156, 106, 0.25);
}
.INF-panel-apply:hover {
  box-shadow: 0 4px 14px rgba(30, 156, 106, 0.35);
  transform: translateY(-1px);
}
.INF-selected-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.INF-tag {
  background: var(--white);
  border: 1px solid var(--success-bd);
  border-left: 3px solid var(--success);
  border-radius: var(--r-md);
  overflow: hidden;
  animation: inf-tag-in 0.18s ease both;
}
@keyframes inf-tag-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: none; }
}
.INF-tag-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--success-bg);
}
.INF-tag-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  font-size: 10.5px;
  font-weight: 900;
  color: var(--success);
}
.INF-tag-name {
  flex: 1;
  font-size: 10.5px;
  font-weight: 800;
  color: var(--text-1);
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.INF-tag-sub-count {
  font-size: 8px;
  font-weight: 800;
  padding: 2px 8px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  border-radius: 100px;
  color: var(--success);
  flex-shrink: 0;
}
.INF-tag-remove {
  width: 26px;
  height: 26px;
  border-radius: var(--r-sm);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text-4);
  cursor: pointer;
  transition: all 0.14s ease;
}
.INF-tag-remove:hover {
  background: var(--error-bg);
  border-color: var(--error-bd);
  color: var(--error);
}
.INF-tag-subs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px 12px;
  border-top: 1px dashed var(--success-bd);
  background: rgba(30, 156, 106, 0.01);
}
.INF-tag-sub-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 100px;
  background: var(--white);
  border: 1px solid var(--border-2);
  font-size: 9px;
  font-weight: 700;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.14s ease;
}
.INF-tag-sub-pill:hover {
  border-color: var(--success);
  color: var(--success);
  background: var(--success-bg);
}
.INF-tag-sub-pill.sel {
  background: var(--success-bg);
  border-color: var(--success);
  color: var(--success);
  font-weight: 800;
}

/* ══ Toolbar ══ */
.TX-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.TX-count {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-3);
}
.TX-count em {
  color: var(--ember);
  font-style: normal;
  font-weight: 800;
}
.TX-toolbar-sep {
  flex: 1;
}
.TX-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.TX-btn:hover {
  border-color: var(--border-2);
  color: var(--text-2);
  background: var(--off-white);
  transform: translateY(-1px);
  box-shadow: var(--sh-hover);
}
/* ── Unified compact refresh button — unique orbit icon, idle pulse + click ripple/spin ── */
@keyframes erpRefreshIdle { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.30); } 50% { box-shadow: 0 0 0 5px rgba(37,99,235,0); } }
@keyframes erpRefreshSpin { to { transform: rotate(360deg); } }
@keyframes erpRefreshRipple { from { transform: scale(0.5); opacity: 0.6; } to { transform: scale(1.9); opacity: 0; } }
.ERP-refresh-btn {
  position: relative;
  width: 28px; height: 28px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid var(--ember-border);
  background: var(--ember-ghost);
  color: var(--ember);
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s, color 0.2s;
  animation: erpRefreshIdle 2.6s ease-in-out infinite;
}
.ERP-refresh-btn svg { transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
.ERP-refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.08);
  background: linear-gradient(135deg,#F0834D,#C2410C);
  border-color: transparent;
  color: #faf9f7;
  box-shadow: 0 6px 16px rgba(37,99,235,0.35);
  animation-play-state: paused;
}
.ERP-refresh-btn:hover:not(:disabled) svg { transform: rotate(180deg); }
.ERP-refresh-btn:active:not(:disabled) { transform: translateY(0) scale(0.92); }
.ERP-refresh-btn.spin svg { animation: erpRefreshSpin 0.7s cubic-bezier(0.4,0,0.2,1); }
.ERP-refresh-btn.spin::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 1.5px solid var(--ember-mid);
  animation: erpRefreshRipple 0.6s ease-out;
  pointer-events: none;
}
.ERP-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; animation: none; }
.TX-btn-pdf {
  background: var(--error-bg);
  border-color: var(--error-bd);
  color: var(--error);
}
.TX-btn-pdf:hover {
  background: var(--error);
  color: var(--white) !important;
  border-color: var(--error);
}
.TX-btn-word {
  background: var(--ember-ghost);
  border-color: var(--ember-border);
  color: var(--ember);
}
.TX-btn-word:hover {
  background: var(--ember);
  color: var(--white) !important;
  border-color: var(--ember);
}
.TX-btn-word:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ══ Table Wrapper — Premium ══ */
.TX-tbl-wrap {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--sh-card);
  transition: all 0.25s ease;
  animation: scaleIn 0.4s ease both;
  animation-delay: 0.1s;
}
.TX-tbl-wrap.name-mode {
  border-color: var(--success-bd);
  box-shadow: 0 4px 20px rgba(30, 156, 106, 0.08);
}
/* Played once when arriving from the "View all N transactions →" link on the
   create-entry page, so it's obvious the full, unfiltered list just loaded —
   an ember ring sweeps in and pulses twice, then fades back to the normal
   border/shadow. */
.TX-tbl-wrap.arrive-highlight {
  animation: tx-tbl-arrive 1.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes tx-tbl-arrive {
  0% {
    transform: scale(0.985);
    box-shadow: 0 0 0 0 rgba(37,99,235, 0.55), var(--sh-card);
    border-color: var(--ember);
  }
  12% {
    transform: scale(1.004);
    box-shadow: 0 0 0 6px rgba(37,99,235, 0.16), var(--sh-card);
    border-color: var(--ember);
  }
  45% {
    box-shadow: 0 0 0 0 rgba(37,99,235, 0), var(--sh-card);
    border-color: var(--ember-border, var(--border));
  }
  60% {
    box-shadow: 0 0 0 5px rgba(37,99,235, 0.12), var(--sh-card);
    border-color: var(--ember);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(37,99,235, 0), var(--sh-card);
    border-color: var(--border);
  }
}
.TX-tbl-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  background: linear-gradient(135deg, var(--off-white) 0%, var(--white) 100%);
  border-bottom: 1px solid var(--border);
}
.TX-tbl-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.TX-tbl-subtitle {
  font-size: 9px;
  color: var(--text-4);
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.TX-tbl-daterange {
  font-weight: 800;
  color: var(--ember);
}
.TX-tbl-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-3);
  box-shadow: var(--sh-card);
}

/* ══ Name Mode Strip ══ */
.TX-name-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 22px;
  background: var(--success-bg);
  border-bottom: 1px solid var(--success-bd);
}
.TX-name-strip-lbl {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--success);
  white-space: nowrap;
}
.TX-name-strip-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}
.TX-name-strip-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  font-size: 9px;
  font-weight: 700;
  color: var(--success);
}
.TX-name-strip-count {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-3);
  white-space: nowrap;
}
.TX-name-strip-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--r-sm);
  background: var(--white);
  border: 1px solid var(--border);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.14s ease;
}
.TX-name-strip-clear:hover {
  border-color: var(--success-bd);
  color: var(--success);
  background: var(--success-bg);
}

/* ══ Table — fixed layout so columns always sum to 100% of the container.
   No min-width / no horizontal scroll at any viewport: long content wraps
   instead of forcing overflow. Below 680px the table collapses into a
   stacked card list (see responsive block further down). ══ */
.ERP-tbl-scroll {
  /* Deliberately capped so ~10 rows are visible before the table itself
     scrolls (its own scrollbar, independent of the page scroll) — the
     header stays pinned via position:sticky on each <th> (see below).
     Width can never exceed the container (table-layout:fixed) so
     overflow-x only ever engages in extreme edge cases. */
  overflow-x: auto;
  overflow-y: auto;
  max-height: 560px;
  scroll-behavior: smooth;
  border-radius: var(--r-md);
  width: 100%;
  max-width: 100%;
}
.ERP-tbl-scroll::-webkit-scrollbar { height: 6px; }
.ERP-tbl-scroll::-webkit-scrollbar-track { background: rgba(203,213,225, 0.15); border-radius: 99px; }
.ERP-tbl-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  transition: background 0.22s ease, box-shadow 0.22s ease;
}
.ERP-tbl-scroll::-webkit-scrollbar-thumb:hover { box-shadow: 0 0 4px rgba(59,130,246, 0.4); }
.ERP-page { scroll-behavior: smooth; }
.ERP-page::-webkit-scrollbar { width: 6px; height: 6px; }
.ERP-page::-webkit-scrollbar-track { background: rgba(203,213,225, 0.15); border-radius: 99px; }
.ERP-page::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  transition: background 0.22s ease, box-shadow 0.22s ease;
}
.ERP-page::-webkit-scrollbar-thumb:hover { box-shadow: 0 0 4px rgba(59,130,246, 0.4); }
.ERP-tbl {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.ERP-tbl thead tr {
  background: var(--surface-2, #E8E2D8);
}
.ERP-tbl thead th {
  padding: 13px 8px;
  text-align: center;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  color: var(--text-3, #3A3024);
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
  border-bottom: 2px solid var(--ember, #C2410C);
  border-right: 1px solid var(--border, #E8E2D8);
  font-family: var(--font-body);
  /* Same light header used by every other table in the app now — kept
     on the <th> itself (not the parent <tr>) rather than moved back to
     the row, since that's what fixed the sticky-header tear-away bug
     ("header color goes up but text doesn't") the last time this was
     tried at the tr level under a scrolling .ERP-tbl-scroll box. Each
     cell just carries its own slice of the same flat color now instead
     of a gradient. */
  background: var(--surface-2, #E8E2D8);
  position: sticky;
  top: 0;
  z-index: 5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.ERP-tbl thead th:first-child {
  border-top-left-radius: var(--r-md);
}
.ERP-tbl thead th:last-child {
  border-top-right-radius: var(--r-md);
  border-right: none;
}
.ERP-tbl tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  background: var(--white);
}
/* Rows fade/slide in with a short stagger so a freshly-filtered table feels
   alive instead of just popping into place. Capped at 12 rows of delay so a
   full page of 25+ doesn't feel sluggish to finish animating. */
.TX-row {
  animation: txRowIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(min(var(--i, 0), 12) * 0.035s);
}
@keyframes txRowIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.ERP-tbl tbody tr:hover {
  background: var(--ember-ghost);
  box-shadow: inset 3px 0 0 var(--ember-mid);
  transform: translateX(2px);
}
.ERP-tbl tbody tr:last-child {
  border-bottom: none;
}
.ERP-tbl tbody td {
  padding: 12px 8px;
  vertical-align: middle;
  text-align: center;
  font-size: 10px;
  color: var(--text-2);
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: var(--font-body);
  border-right: 1px solid var(--border);
}
.ERP-tbl tbody td:last-child {
  border-right: none;
}

/* Make sure cells don't stack on desktop/tablet */
.ERP-tbl thead th,
.ERP-tbl tbody td {
  display: table-cell !important;
}

/* Shared ReportTheme kills hover feedback on .T-date-range .ERP-cal-field
   (background/border become transparent on hover), so the date pickers on
   this page look inert even though fromDate/toDate are live React state.
   Give them a visible hover/active affordance, scoped to this page only. */
.T-date-range .ERP-cal-field {
  cursor: pointer;
  border-radius: var(--r-sm);
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.T-date-range .ERP-cal-field:hover {
  background: var(--ember-ghost) !important;
  box-shadow: inset 0 0 0 1px var(--ember-border);
}
.T-date-bar { flex-wrap: wrap; }
@media (max-width: 680px) {
  .T-date-bar { flex-direction: column; align-items: stretch; gap: 10px; }
  .T-date-range { flex-wrap: wrap; width: 100%; }
  .T-date-field { flex: 1 1 auto; min-width: 0; }
  .TX-quick-picks { flex-wrap: wrap; }

  /* Header + filter header also need to stack/wrap on phone widths */
  .ERP-hdr { flex-wrap: wrap; gap: 12px; }
  .ERP-title { font-size: 21px; }
  .ERP-status-badge { align-self: flex-start; }
  .TX-filter-hdr { flex-wrap: wrap; gap: 10px; }
  .TX-filters { padding: 16px 14px; }
  .TX-pagination { justify-content: center; text-align: center; }
}

/* Shared ERPTheme .ERP-t-desc truncates with ellipsis at a fixed max-width —
   override just on this page's table so narration wraps to multiple lines
   instead of being cut off, matching the "show all data" requirement. */
.ERP-tbl .ERP-t-desc {
  white-space: normal;
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  display: inline;
}

/* ══ Mobile card-list table (≤680px) ══
   Below phone width, a 12-column table has no room to breathe even
   wrapped — instead each row becomes a stacked card. Column labels come
   from the data-label attribute set on every <td> above, no JS branching
   needed. Every field is still shown in full, just vertically. */
@media (max-width: 680px) {
  .ERP-tbl-scroll { overflow: visible; }
  .ERP-tbl, .ERP-tbl thead, .ERP-tbl tbody, .ERP-tbl tr {
    display: block;
    width: 100%;
  }
  .ERP-tbl thead { display: none; }
  .ERP-tbl tfoot { display: none; }
  .ERP-tbl tbody tr {
    border: 1.5px solid var(--border);
    border-radius: var(--r-lg);
    margin-bottom: 12px;
    overflow: hidden;
    background: var(--white);
    box-shadow: var(--sh-card);
  }
  .ERP-tbl tbody tr:last-child { border-bottom: 1.5px solid var(--border); }
  .ERP-tbl tbody td {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    width: 100% !important;
    padding: 10px 14px;
    border-bottom: 1px dashed var(--border);
    text-align: right;
  }
  .ERP-tbl tbody td:last-child { border-bottom: none; }
  .ERP-tbl tbody td::before {
    content: attr(data-label);
    font-family: var(--font-mono);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-4);
    flex-shrink: 0;
    text-align: left;
  }
  .ERP-tbl .ERP-t-desc { text-align: right; }
  .ERP-act-cell { justify-content: flex-end; }
}

/* Header sorting styles - Light Orange theme */
.TX-th-sort {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.95);
  padding: 4px 0;
}
.TX-th-sort:hover {
  color: #FDE0CB;
  transform: translateX(2px);
}
.TX-th-sort.active {
  color: #FFFFFF;
}
.TX-sort-ic {
  font-size: 9px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}
.TX-sort-ic.on {
  opacity: 1;
  color: #FFFFFF;
}

/* Alternate row striping */
.ERP-tbl tbody tr:nth-child(even) {
  background: var(--off-white);
}
.ERP-tbl tbody tr:nth-child(even):hover {
  background: var(--ember-ghost);
}
/* ── Category / Sub Category — plain professional text, no pill/box.
   A small colored dot keeps the at-a-glance color coding without the
   heavy chip look the reference design was moving away from. ── */
.ERP-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-1);
}
.ERP-badge.cat { color: var(--text-1); }
.ERP-badge.sub { color: var(--text-2); }

/* ── Sorting ── */
.TX-th-sort {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: color 0.12s ease;
  color: rgba(255, 255, 255, 0.75);
}
.TX-th-sort:hover {
  color: var(--white);
}
.TX-th-sort.active {
  color: var(--white);
}
.TX-sort-ic {
  font-size: 8px;
  opacity: 0.4;
}
.TX-sort-ic.on {
  opacity: 1;
}

/* ── Amount & CR/DR ── */
.TX-amount {
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
  font-family: var(--font-mono) !important;
}
.TX-amount.income {
  color: var(--success);
}
.TX-amount.expense {
  color: var(--error);
}
/* ── Payment — plain text, color-coded, no chip ── */
.TX-pay {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
}

/* ── Client — plain text, no chip ── */
.TX-client {
  font-size: 10px;
  font-weight: 800;
  color: var(--ember);
  white-space: normal;
  word-break: break-word;
}

/* ── Date — plain text, no chip ── */
.TX-date {
  font-family: var(--font-mono) !important;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-3);
  white-space: nowrap;
}

/* ── Associate Name — plain text, no chip ── */
.TX-subname-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-2);
  white-space: normal;
  word-break: break-word;
}

/* ── Summary Row — professional two-block footer merged straight into the
     table (same tfoot, no separate box): "This Page" totals on the left,
     "Selected" (the full filtered result set) totals on the right, each
     split into CR/DR pills so the Credit column and Debit column each get
     an unambiguous total instead of one blended number. ── */
.TX-sum-row td {
  background: var(--ember-ghost) !important;
  border-top: 2px solid var(--ember-border) !important;
  padding: 0 !important;
  vertical-align: middle !important;
}
.TX-sum-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 22px;
}
.TX-sum-bar-divider {
  width: 1px;
  align-self: stretch;
  background: linear-gradient(180deg, transparent, var(--ember-border), transparent);
  flex-shrink: 0;
}
.TX-sum-block {
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
  min-width: 0;
}
.TX-sum-block.align-right {
  align-items: flex-end;
  text-align: right;
}
.TX-sum-block-hdr {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-3);
}
.TX-sum-block.align-right .TX-sum-block-hdr { justify-content: flex-end; }
.TX-sum-block-count {
  font-family: var(--font-mono);
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  padding: 1px 8px;
  border-radius: 99px;
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text-2);
}
.TX-sum-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 99px;
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  color: var(--success);
  font-size: 8.5px;
  font-weight: 800;
}
.TX-sum-block-vals {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.TX-sum-block.align-right .TX-sum-block-vals { justify-content: flex-end; }
.TX-sum-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  transition: transform 0.16s ease;
}
.TX-sum-pill:hover { transform: translateY(-1px); }
.TX-sum-pill.cr { background: var(--success-bg); color: var(--success); border: 1px solid var(--success-bd); }
.TX-sum-pill.dr { background: var(--error-bg); color: var(--error); border: 1px solid var(--error-bd); }
.TX-sum-net {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
}
.TX-sum-net-lbl {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-4);
}
.TX-sum-net-val {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 99px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.TX-sum-net.cr .TX-sum-net-val { background: linear-gradient(135deg, var(--ember) 0%, var(--ember-mid) 100%); color: var(--white); }
.TX-sum-net.dr .TX-sum-net-val { background: linear-gradient(135deg, var(--error) 0%, #F87171 100%); color: var(--white); }
@media (max-width: 680px) {
  .TX-sum-bar { flex-direction: column; align-items: stretch; gap: 14px; }
  .TX-sum-bar-divider { width: 100%; height: 1px; align-self: auto; }
  .TX-sum-block, .TX-sum-block.align-right { align-items: center; text-align: center; }
  .TX-sum-block.align-right .TX-sum-block-hdr,
  .TX-sum-block.align-right .TX-sum-block-vals { justify-content: center; }
}

/* ── Skeleton ── */
.TX-skeleton {
  background: linear-gradient(90deg, var(--off-white) 25%, var(--surface-3) 50%, var(--off-white) 75%);
  background-size: 600px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: var(--r-md);
}

/* ── Pagination — premium orange-themed pill bar, matching the shared
     .ERP-pg component look but with orange/ember text everywhere (info
     label, per-page select) instead of neutral gray, per project
     branding request. ── */
.TX-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-top: 1.5px solid var(--ember-border);
  background: linear-gradient(180deg, var(--off-white) 0%, rgba(37,99,235,0.04) 100%);
  flex-wrap: wrap;
  gap: 14px;
  animation: txPgIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes txPgIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.TX-pg-info {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 800;
  color: var(--ember);
  letter-spacing: 0.3px;
}
.TX-pg-info strong { color: var(--ember-dark, #C2410C); font-weight: 900; }
.TX-pg-info-sep { margin: 0 8px; color: var(--ember-border); }
.TX-pg-btns {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  background: var(--white);
  border: 1.5px solid var(--ember-border);
  border-radius: 999px;
  box-shadow: 0 3px 12px rgba(37,99,235,0.14);
}
.TX-pg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 5px;
  border-radius: 999px;
  background: transparent;
  border: none;
  font-size: 10px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--ember);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.TX-pg-btn:hover:not(:disabled) {
  color: #faf9f7;
  background: linear-gradient(135deg, var(--ember-mid,#DB5B1F), var(--ember));
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 4px 12px rgba(37,99,235,0.35);
}
.TX-pg-btn:active:not(:disabled) {
  transform: scale(0.9);
  transition-duration: 0.08s;
}
.TX-pg-btn.on {
  background: linear-gradient(135deg, var(--ember-mid,#DB5B1F) 0%, var(--ember) 100%);
  color: #faf9f7;
  box-shadow: 0 4px 14px rgba(37,99,235,0.45);
  transform: scale(1.1);
  animation: txPgPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes txPgPop {
  from { transform: scale(0.6); }
  to { transform: scale(1.1); }
}
.TX-pg-btn.on:hover { transform: scale(1.12); }
.TX-pg-edge { color: var(--ember-mid, #DB5B1F); }
.TX-pg-btn:disabled {
  opacity: 0.32;
  cursor: not-allowed;
  transform: none !important;
  background: transparent !important;
  color: var(--ember-border) !important;
  box-shadow: none !important;
}
.TX-pg-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 32px;
  font-size: 10px;
  font-weight: 900;
  color: var(--ember-border);
  letter-spacing: 1px;
}
.TX-per-pg {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 800;
  color: var(--ember);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* ── Reset All — relocated into the Filters panel header (top-right,
   inside a small button cluster that itself gets margin-left:auto so it
   sits flush right in the already-flex .T-filterpanel-hd), with a livelier
   pop-in + press feel than the shared ReportTheme.ts hover-only version. ── */
.T-filterpanel-hd-lbl { display: inline-flex; align-items: center; gap: 8px; }
.T-filterpanel-hd-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.T-fclear-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px 9px 15px;
  border-radius: 100px;
  border: 1.5px solid var(--ember-border);
  background: var(--white);
  color: var(--ember);
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 0 !important;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: txResetPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.T-fclear-btn:hover {
  background: var(--ember);
  color: #faf9f7;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.32);
}

@keyframes txResetPop {
  from { opacity: 0; transform: scale(0.6) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.T-fclear-btn svg { transition: transform 0.35s ease; }
.T-fclear-btn:hover svg { transform: rotate(-220deg); }
.T-fclear-btn:active { transform: scale(0.9) !important; transition-duration: 0.08s; }

/* ── View Recently Added — a standalone, eye-catching button that shows
   the latest-inserted entries (by id, not transaction_date) across all
   dates. Distinct blue/violet gradient (vs. the page's ember accent) so
   it visually reads as "a different kind of view", with a pulsing glow
   ring to draw the eye and a bouncing bolt icon on hover. ── */
.TX-recent-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px 9px 16px;
  border-radius: 100px;
  border: 1.5px solid var(--ember-border);
  background: var(--ember-ghost);
  color: var(--ember);
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  overflow: visible;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  animation: txResetPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.TX-recent-btn-icon {
  display: inline-flex;
  animation: txRecentIconPulse 2.2s ease-in-out infinite;
}
@keyframes txRecentIconPulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.18) rotate(-8deg); }
}
.TX-recent-btn::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 100px;
  border: 1.5px solid var(--ember-border);
  opacity: 0;
  animation: txRecentRing 2.2s ease-out infinite;
  pointer-events: none;
}
@keyframes txRecentRing {
  0% { opacity: 0.55; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.18); }
}
.TX-recent-btn:hover {
  background: linear-gradient(135deg, var(--ember-mid), var(--ember));
  color: #faf9f7;
  border-color: transparent;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 16px rgba(37,99,235,0.4);
}
.TX-recent-btn:hover .TX-recent-btn-icon { animation: txRecentIconSpin 0.5s ease; }
@keyframes txRecentIconSpin {
  from { transform: rotate(0deg) scale(1.2); }
  to { transform: rotate(360deg) scale(1.2); }
}
.TX-recent-btn:active { transform: scale(0.94) !important; transition-duration: 0.08s; }
.TX-recent-btn.active {
  background: linear-gradient(135deg, var(--ember-mid), var(--ember));
  color: #faf9f7;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(37,99,235,0.45);
}
.TX-recent-btn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34D399;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.6);
  animation: tx-sb-glow 1.6s ease-in-out infinite;
}
@media (max-width: 680px) {
  .T-filterpanel-hd { flex-wrap: wrap; }
  .T-filterpanel-hd-btns { margin-left: 0; width: 100%; justify-content: flex-end; }
}
.TX-per-pg-sel {
  padding: 8px 14px;
  background: var(--white);
  border: 1.5px solid var(--ember-border);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 900;
  color: var(--ember);
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(37,99,235,0.12);
}
.TX-per-pg-sel:hover { border-color: var(--ember); color: #faf9f7; background: var(--ember); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
.TX-per-pg-sel:focus {
  border-color: var(--ember-mid);
  box-shadow: 0 0 0 3px var(--ember-ghost);
}

/* ══ Actions — small icon-only buttons with a lively hover/press feel ══ */
.ERP-act-cell {
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
  overflow: visible;
}
.ERP-act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: var(--r-sm);
  border: 1px solid;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  margin: 0;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.ERP-act svg { transition: transform 0.2s ease; pointer-events: none; }
.ERP-act:active { transform: scale(0.82) !important; transition-duration: 0.08s; }
.ERP-act.edit {
  background: var(--ember-ghost);
  border-color: var(--ember-border);
  color: var(--ember);
  animation: txActPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(min(var(--i, 0), 12) * 0.035s + 0.1s);
}
.ERP-act.edit:hover {
  background: var(--ember);
  color: var(--white);
  border-color: var(--ember);
  transform: translateY(-3px) scale(1.18);
  box-shadow: 0 5px 12px rgba(37,99,235, 0.45);
  z-index: 2;
}
.ERP-act.edit:hover svg { transform: rotate(-14deg) scale(1.1); }
.ERP-act.delete {
  background: var(--error-bg);
  border-color: var(--error-bd);
  color: var(--error);
  animation: txActPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: calc(min(var(--i, 0), 12) * 0.035s + 0.16s);
}
.ERP-act.delete:hover {
  background: var(--error);
  color: var(--white);
  border-color: var(--error);
  transform: translateY(-3px) scale(1.18);
  box-shadow: 0 5px 12px rgba(217, 59, 85, 0.45);
  z-index: 2;
}
.ERP-act.delete:hover svg { transform: scale(1.22) rotate(8deg); }
@keyframes txActPop {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

/* ══ Modal ══ */
.TX-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: tx-fade 0.2s ease both;
}
@keyframes tx-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.TX-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(820px, 96vw);
  max-height: 90vh;
  background: var(--white);
  border-radius: var(--r-xl);
  border: 1px solid var(--border);
  box-shadow: var(--sh-lift);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: tx-rise 0.28s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
@keyframes tx-rise {
  from { opacity: 0; transform: translate(-50%, -47%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.TX-modal[data-type="income"] {
  border-top: 3px solid var(--success);
}
.TX-modal[data-type="expense"] {
  border-top: 3px solid var(--error);
}
.TX-modal-hdr {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--off-white);
}
.TX-modal-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  transition: transform 0.2s ease;
}
.TX-modal-icon.cr {
  background: var(--success-bg);
  border-color: var(--success-bd);
  color: var(--success);
}
.TX-modal-icon.dr {
  background: var(--error-bg);
  border-color: var(--error-bd);
  color: var(--error);
}
.TX-modal-hdr-info {
  flex: 1;
  min-width: 0;
}
.TX-modal-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-4);
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.TX-modal-hdr-title {
  font-size: 16.5px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.3px;
}
.TX-modal-hdr-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  flex-wrap: wrap;
}
.TX-modal-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--r-sm);
  font-size: 9px;
  font-weight: 800;
  border: 1px solid;
}
.TX-modal-pill.cr {
  background: var(--success-bg);
  color: var(--success);
  border-color: var(--success-bd);
}
.TX-modal-pill.dr {
  background: var(--error-bg);
  color: var(--error);
  border-color: var(--error-bd);
}
.TX-modal-pill.id {
  background: var(--ember-ghost);
  color: var(--ember);
  border-color: var(--ember-border);
}
.TX-modal-amt-preview {
  text-align: right;
  padding: 12px 16px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  flex-shrink: 0;
  min-width: 150px;
  box-shadow: var(--sh-card);
  transition: all 0.2s ease;
}
.TX-modal-amt-lbl {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-4);
  margin-bottom: 5px;
}
.TX-modal-amt-val {
  font-size: 21px;
  font-weight: 800;
  font-family: var(--font-mono) !important;
  line-height: 1;
}
.TX-modal-amt-val.cr {
  color: var(--success);
}
.TX-modal-amt-val.dr {
  color: var(--error);
}
.TX-modal-amt-val.neutral {
  color: var(--text-3);
}
.TX-modal-close {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.14s ease;
  flex-shrink: 0;
}
.TX-modal-close:hover {
  border-color: var(--error-bd);
  color: var(--error);
  background: var(--error-bg);
}
.TX-modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.TX-ms {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.TX-ms:last-child {
  border-bottom: none;
}
.TX-ms-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.TX-ms-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}
.TX-ms-icon.amber {
  background: var(--warn-bg);
  color: var(--warn);
  border-color: var(--warn-bd);
}
.TX-ms-icon.blue {
  background: var(--ember-ghost);
  color: var(--ember);
  border-color: var(--ember-border);
}
.TX-ms-icon.green {
  background: var(--success-bg);
  color: var(--success);
  border-color: var(--success-bd);
}
.TX-ms-icon.purple {
  background: rgba(155, 69, 204, 0.08);
  color: #C2410C;
  border-color: rgba(155, 69, 204, 0.2);
}
.TX-ms-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-3);
}
.TX-ms-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border), transparent);
}
.TX-ms-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.TX-ms-grid .span2 {
  grid-column: 1 / -1;
}
.TX-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.TX-field-lbl {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-3);
}
.TX-field-req {
  color: var(--error);
  margin-left: 2px;
}
.TX-field-hint {
  font-size: 9px;
  color: var(--text-4);
  margin-top: -2px;
}
.TX-field-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.TX-date-wrap {
  position: relative;
}
.TX-date-ico {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-4);
}
.TX-date-in {
  padding-left: 36px !important;
}
.TX-amt-wrap {
  position: relative;
}
.TX-amt-pfx {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--off-white);
  border-right: 1px solid var(--border);
  border-radius: var(--r-md) 0 0 var(--r-md);
  font-size: 11.5px;
  font-weight: 800;
  color: var(--text-3);
  pointer-events: none;
  z-index: 1;
  transition: all 0.15s ease;
}
.TX-amt-in {
  padding-left: 54px !important;
  font-family: var(--font-mono) !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.TX-amt-wrap:focus-within .TX-amt-pfx {
  background: var(--ember-ghost);
  border-color: var(--ember-border);
  color: var(--ember);
}
.TX-cat-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  padding: 3px 10px;
  border-radius: var(--r-sm);
  font-size: 9px;
  font-weight: 800;
  animation: fadeIn 0.18s ease;
}
.TX-cat-preview.cr {
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid var(--success-bd);
}
.TX-cat-preview.dr {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid var(--error-bd);
}
.TX-pay-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 8px;
}
.TX-pay-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.TX-pay-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 15px;
  border-radius: var(--r-md);
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 9px;
  font-weight: 800;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
  user-select: none;
}
.TX-pay-pill:hover {
  border-color: var(--border-2);
  color: var(--text-2);
  transform: translateY(-2px);
  box-shadow: var(--sh-hover);
}
.TX-pay-pill.sel-cash {
  background: var(--success-bg);
  color: var(--success);
  border-color: var(--success-bd);
  box-shadow: 0 3px 10px rgba(30, 156, 106, 0.15);
}
.TX-pay-pill.sel-upi {
  background: var(--ember-ghost);
  color: var(--ember);
  border-color: var(--ember-border);
  box-shadow: 0 3px 10px rgba(37,99,235, 0.15);
}
.TX-pay-pill.sel-neft {
  background: var(--warn-bg);
  color: var(--warn);
  border-color: var(--warn-bd);
  box-shadow: 0 3px 10px rgba(196, 126, 10, 0.15);
}
.TX-pay-pill.sel-cheque {
  background: rgba(155, 69, 204, 0.08);
  color: #C2410C;
  border-color: rgba(155, 69, 204, 0.2);
}
.TX-pay-pill.sel-bank-transfer {
  background: rgba(8, 145, 178, 0.08);
  color: #A6491D;
  border-color: rgba(8, 145, 178, 0.2);
}
.TX-pay-pill.sel-others {
  background: var(--surface);
  color: var(--text-3);
  border-color: var(--border);
}
.TX-modal-foot {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--off-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}
.TX-modal-foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  color: var(--text-3);
}
.TX-modal-foot-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.TX-modal-foot-dot.cr {
  background: var(--success);
  box-shadow: 0 0 0 3px rgba(30, 156, 106, 0.15);
}
.TX-modal-foot-dot.dr {
  background: var(--error);
  box-shadow: 0 0 0 3px rgba(217, 59, 85, 0.15);
}
.TX-modal-foot-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}
.TX-modal-cancel {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border: 1.5px solid var(--border);
  background: none;
  border-radius: var(--r-md);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.14s ease;
}
.TX-modal-cancel:hover {
  border-color: var(--border-2);
  color: var(--text-2);
  background: var(--off-white);
}
.TX-modal-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: var(--r-md);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--white);
  cursor: pointer;
  transition: all 0.18s ease;
  border: none;
}
.TX-modal-save.cr {
  background: var(--success);
  box-shadow: 0 3px 12px rgba(30, 156, 106, 0.3);
}
.TX-modal-save.cr:hover:not(:disabled) {
  box-shadow: 0 5px 20px rgba(30, 156, 106, 0.4);
  transform: translateY(-1px);
}
.TX-modal-save.dr {
  background: var(--error);
  box-shadow: 0 3px 12px rgba(217, 59, 85, 0.25);
}
.TX-modal-save.dr:hover:not(:disabled) {
  box-shadow: 0 5px 20px rgba(217, 59, 85, 0.35);
  transform: translateY(-1px);
}
.TX-modal-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
.TX-modal-error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 24px 0;
  padding: 12px 16px;
  background: var(--error-bg);
  border: 1px solid var(--error-bd);
  border-left: 3px solid var(--error);
  border-radius: var(--r-md);
  font-size: 9.5px;
  color: #991B1B;
  animation: fadeIn 0.16s ease;
}

/* ── ERP inputs/selects ── */
.ERP-input, .ERP-select {
  padding: 10px 14px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-1);
  width: 100%;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}
.ERP-input:focus, .ERP-select:focus {
  border-color: var(--ember-mid);
  box-shadow: 0 0 0 3px var(--ember-ghost);
}
.ERP-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  padding-right: 34px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A7862' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 13px;
}
.ERP-select:hover {
  border-color: var(--border-2);
  background-color: var(--off-white);
}
.ERP-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 6px;
}
.ERP-label::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ember);
  flex-shrink: 0;
}
.ERP-field {
  display: flex;
  flex-direction: column;
}

/* ── ERP page header ── */
/* .ERP-hdr / .ERP-eyebrow* / .ERP-title* / .ERP-subtitle / .ERP-divider /
   .ERP-status-badge* / .ERP-status-dot — all deliberately NOT redeclared
   here anymore. They now come purely from shared ERP_CSS, which is what
   the Cash Book create page uses: italic Instrument Serif title, mono
   eyebrow/badge text, ember accent colors throughout. The old local
   versions here used a different font (no font-family = plain sans-serif
   instead of the serif display font), different sizes, and different
   colors (gray/border instead of ember) — that was the header mismatch. */

/* ── ERP spinner ── */
.ERP-spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ── ERP msg ── */
.ERP-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--r-md);
  font-size: 9.5px;
  font-weight: 700;
  margin-bottom: 16px;
  animation: slideUp 0.3s ease both;
}
.ERP-msg.success {
  background: var(--success-bg);
  border: 1px solid var(--success-bd);
  color: var(--success);
}
.ERP-msg.error {
  background: var(--error-bg);
  border: 1px solid var(--error-bd);
  color: var(--error);
}

/* ── ERP empty ── */
.ERP-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 28px;
  text-align: center;
  gap: 12px;
}
.ERP-empty-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--r-xl);
  background: var(--off-white);
  border: 1.5px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ERP-empty-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-1);
}
.ERP-empty-sub {
  font-size: 9.5px;
  color: var(--text-3);
  max-width: 380px;
}

/* ══════════════════════════════════════════════════
   PREMIUM SCROLLBAR — Cash Book Transactions
   ══════════════════════════════════════════════════ */
@keyframes tx-sb-glow {
  0%,100% { box-shadow: 0 0 4px rgba(59,130,246,0.35), 0 0 10px rgba(29,78,216,0.15); }
  50%      { box-shadow: 0 0 9px rgba(59,130,246,0.62), 0 0 20px rgba(29,78,216,0.28); }
}

.TD-list, .INF-list, .INF2-list, .T :is(div,section) {
  scrollbar-width: thin;
  scrollbar-color: #DB5B1F rgba(203,213,225,0.18);
}

.TD-list::-webkit-scrollbar,
.INF-list::-webkit-scrollbar,
.INF2-list::-webkit-scrollbar { width: 3px; height: 3px; }

.T ::-webkit-scrollbar { width: 4px; height: 4px; }

.TD-list::-webkit-scrollbar-track,
.INF-list::-webkit-scrollbar-track,
.INF2-list::-webkit-scrollbar-track,
.T ::-webkit-scrollbar-track {
  background: rgba(203,213,225,0.15);
  border-radius: 99px;
}

.TD-list::-webkit-scrollbar-thumb,
.INF-list::-webkit-scrollbar-thumb,
.INF2-list::-webkit-scrollbar-thumb,
.T ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  border: none;
  box-shadow: 0 0 3px rgba(59,130,246,0.25);
  transition: background 0.22s ease, box-shadow 0.22s ease;
}

.TD-list::-webkit-scrollbar-thumb:hover,
.INF-list::-webkit-scrollbar-thumb:hover,
.INF2-list::-webkit-scrollbar-thumb:hover,
.T ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FBC9A8 0%, #DB5B1F 42%, #C2410C 100%);
  box-shadow: 0 0 8px rgba(59,130,246,0.55), 0 0 16px rgba(29,78,216,0.22);
  animation: tx-sb-glow 1.8s ease-in-out infinite;
}

/* ── Income Party Filter list — a clearer, more "boxed" scroll structure
   for long client lists: a wider, more grabbable thumb than the shared
   3px default, a defined border/inset frame so it reads as its own
   self-contained scrollable region, and a max-height so it never grows
   past a comfortable viewing size even inside the full-height drawer. ── */
.INF2-list {
  position: relative;
  border-top: 1px solid var(--border);
  box-shadow: inset 0 6px 8px -8px rgba(0,0,0,0.12), inset 0 -6px 8px -8px rgba(0,0,0,0.12);
}
.INF2-list::-webkit-scrollbar { width: 7px !important; }
.INF2-list::-webkit-scrollbar-track { margin: 4px 0; }

/* ══════════════════════════════════════════════════
   REQUIRED-FIELD VALIDATION — same shake/scroll/alert
   pattern as the 5 Master Data pages + DaybookPage
   ══════════════════════════════════════════════════ */
@keyframes tx-field-shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.TX-field.err .ERP-input,
.TX-field.err .SDD-trigger,
.TX-field.err .TX-amt-wrap,
.TX-field.err .TX-date-wrap .ERP-cal-field {
  border-color: var(--error) !important;
  background: var(--error-bg) !important;
  animation: tx-field-shake 0.4s ease;
}
.TX-field-error-msg {
  display: flex; align-items: center; gap: 5px;
  margin-top: 2px;
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 800;
  letter-spacing: 0.3px; color: var(--error);
  animation: erp-fade-in 0.2s ease both;
}

/* ── Page-wide running loader (replaces confined TX-skeleton bars) ── */
.TX-loading-wrap { padding: 6px 0 10px; }

/* Page-open intro (the run-then-fall animation) now lives in the shared
   PageOpenIntro component + ERPTheme.ts's .DBI-* classes. */
`;

// ═══════════════════════════════════════════════════════════════════
//  EDIT MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════
function EditModal({
  entry, categories, subCats, bioData, subNames, onClose, onSaved,
}: {
  entry: TxEntry; categories: Category[]; subCats: SubCategory[];
  bioData: BioData[]; subNames: SubName[]; onClose: () => void; onSaved: () => void;
}) {

  const PAYMENT_LIST = [
    { key: 'Cash', emoji: '💵', slug: 'cash' },
    { key: 'UPI', emoji: '📱', slug: 'upi' },
    { key: 'NEFT', emoji: '🏦', slug: 'neft' },
    { key: 'Cheque', emoji: '📄', slug: 'cheque' },
    { key: 'Bank Transfer', emoji: '🔄', slug: 'bank-transfer' },
    { key: 'Others', emoji: '⋯', slug: 'others' },
  ];

  const [form, setForm] = useState<EditForm>({
    transaction_date: entry.transaction_date,
    amount: String(entry.amount),
    payment_mode: entry.payment_mode,
    narration: entry.narration || '',
    client_name: entry.client_name || '',
    category_id: String(entry.category_id),
    sub_category_id: entry.sub_category_id != null ? String(entry.sub_category_id) : '',
    bio_data_id: String(entry.bio_data_id),
    sub_name_id: entry.sub_name_id != null ? String(entry.sub_name_id) : '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const amountFieldRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const categoryFieldRef = useRef<HTMLDivElement>(null);
  const bioFieldRef = useRef<HTMLDivElement>(null);
  const selectedCat = categories.find(c => String(c.id) === form.category_id);
  const entryType = selectedCat?.type ?? entry.category_type ?? 'expense';
  const isCr = entryType === 'income';
  const typeClass = isCr ? 'cr' : 'dr';
  const availSub = form.category_id ? subCats.filter(s => s.category_id === +form.category_id) : subCats;
  const availBio = form.category_id
    ? bioData.filter(b => !b.category_id || b.category_id === +form.category_id)
    : bioData;
  const availSubNames = form.bio_data_id ? subNames.filter(s => s.bio_data_id === +form.bio_data_id) : subNames;
  const parsedAmount = parseFloat(form.amount) || 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setF = (k: keyof EditForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.transaction_date) {
      setErrorField('transaction_date');
      toast.error('Date is required', 'Please fill out this field to continue');
      dateFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setErrorField('amount');
      toast.error('Amount is required', 'Please enter a valid amount greater than 0');
      amountFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      amountInputRef.current?.focus();
      return;
    }

    if (!form.category_id) {
      setErrorField('category_id');
      toast.error('Account Head is required', 'Please fill out this field to continue');
      categoryFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!form.bio_data_id) {
      setErrorField('bio_data_id');
      toast.error('Party Name is required', 'Please fill out this field to continue');
      bioFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true); setError(''); setErrorField(null);

    try {
      await axiosInstance.put(`/api/daybook/${entry.id}`, {
        transaction_date: form.transaction_date,
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
        narration: form.narration || null,
        client_name: form.client_name || null,
        category_id: Number(form.category_id),
        sub_category_id: form.sub_category_id ? Number(form.sub_category_id) : null,
        bio_data_id: Number(form.bio_data_id),
        sub_name_id: form.sub_name_id ? Number(form.sub_name_id) : null,
      }, { headers: authHeader() });
      onSaved(); onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Save failed. Try again.');
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="TX-backdrop" onClick={onClose} />
      <div className="TX-modal" data-type={entryType}>
        <div className="TX-modal-hdr">
          <div className={`TX-modal-icon ${typeClass}`}>
            <Icon name={isCr ? 'trending' : 'cash'} size={18} color="currentColor" />
          </div>
          <div className="TX-modal-hdr-info">
            <div className="TX-modal-eyebrow"><Icon name="edit" size={9} /> Edit Transaction</div>
            <div className="TX-modal-hdr-title">{entry.bio_data_name}</div>
            <div className="TX-modal-hdr-meta">
              <span className={`TX-modal-pill ${typeClass}`}>{isCr ? '↑ Credit' : '↓ Debit'}</span>
              <span className="TX-modal-pill id">TXN-{String(entry.id).padStart(4, '0')}</span>
            </div>
          </div>
          <div className="TX-modal-amt-preview">
            <div className="TX-modal-amt-lbl">Preview</div>
            <div className={`TX-modal-amt-val ${parsedAmount > 0 ? typeClass : 'neutral'}`}>
              {isCr ? '+' : '−'}₹{parsedAmount > 0 ? parsedAmount.toLocaleString('en-IN') : '0'}
            </div>
          </div>
          <button className="TX-modal-close" onClick={onClose}><Icon name="x" size={10} /> Esc</button>
        </div>
        {error && <div className="TX-modal-error"><Icon name="warning" size={13} /> {error}</div>}
        <div className="TX-modal-body">
          {/* Core Transaction */}

          <div className="TX-ms">
            {/* Core Transaction Start */}
            <div className="TX-ms-hdr">
              <div className="TX-ms-icon amber"><Icon name="wallet" size={12} /></div>
              <span className="TX-ms-lbl">Core Transaction</span>
              <div className="TX-ms-rule" />
            </div>
            {/* Core Transaction End */}

            {/* Date & Amount & Payment Mode Start */}
            <div className="TX-ms-grid">

              {/* Date Start */}
              <div className={'TX-field' + (errorField === 'transaction_date' ? ' err' : '')} ref={dateFieldRef}>
                <div className="TX-field-lbl"><Icon name="calendar" size={10} />Date<span className="TX-field-req">*</span></div>
                <div className="TX-date-wrap">
                  <CalendarDD value={form.transaction_date} onChange={v => { setForm(f => ({ ...f, transaction_date: v })); if (errorField === 'transaction_date') setErrorField(null); }} />
                </div>
                {errorField === 'transaction_date' && (
                  <div className="TX-field-error-msg"><Icon name="warning" size={11} color="currentColor" />Please fill out this field</div>
                )}
              </div>
              {/* Date End */}

              {/* Amount Start */}
              <div className={'TX-field' + (errorField === 'amount' ? ' err' : '')} ref={amountFieldRef}>
                <div className="TX-field-lbl"><Icon name="cash" size={10} />Amount<span className="TX-field-req">*</span></div>
                <div className="TX-amt-wrap">
                  <div className="TX-amt-pfx">₹</div>
                  <input autoComplete="off" ref={amountInputRef} type="number" className="ERP-input TX-amt-in" value={form.amount}
                    onChange={e => { setF('amount')(e); if (errorField === 'amount') setErrorField(null); }}
                    min="0.01" step="0.01" placeholder="0.00" />
                </div>
                {errorField === 'amount' && (
                  <div className="TX-field-error-msg"><Icon name="warning" size={11} color="currentColor" />Please fill out this field</div>
                )}
              </div>
              {/* Amount End */}

              {/* Payment Mode Start */}
              <div className="span2">
                <div className="TX-pay-lbl">Payment Mode</div>
                <div className="TX-pay-group">
                  {PAYMENT_LIST.map(pm => (
                    <button key={pm.key} type="button"
                      className={`TX-pay-pill${form.payment_mode === pm.key ? ` sel-${pm.slug}` : ''}`}
                      onClick={() => setForm(f => ({ ...f, payment_mode: pm.key }))}>
                      {pm.emoji} {pm.key}
                    </button>
                  ))}
                </div>
              </div>
              {/* Payment Mode End */}

            </div>
            {/* Date & Amount & Payment Mode End */}

          </div>
          {/* Core Transactions End */}

          {/* Ledger Classification Start */}
          <div className="TX-ms">
            <div className="TX-ms-hdr">
              <div className="TX-ms-icon blue"><Icon name="layers" size={12} /></div>
              <span className="TX-ms-lbl">Ledger Classification</span>
              <div className="TX-ms-rule" />
            </div>
            <div className="TX-ms-grid">

              {/* Category Start */}
              <div className={'TX-field' + (errorField === 'category_id' ? ' err' : '')} ref={categoryFieldRef}>
                <div className="TX-field-lbl"><Icon name="tag2" size={10} />Account Head<span className="TX-field-req">*</span></div>
                <SearchDD
                  options={categories.map(c => ({ value: String(c.id), label: `${c.name} (${c.type === 'income' ? 'CR' : 'DR'})` }))}
                  value={form.category_id}
                  onChange={v => { setForm(f => ({ ...f, category_id: v, sub_category_id: '', bio_data_id: '', sub_name_id: '' })); if (errorField === 'category_id') setErrorField(null); }}
                  placeholder="— Select Account Head —" />
                {selectedCat && (
                  <div className={`TX-cat-preview ${selectedCat.type === 'income' ? 'cr' : 'dr'}`}>
                    <Icon name={selectedCat.type === 'income' ? 'arrowUp' : 'arrowDown'} size={9} />
                    {selectedCat.type === 'income' ? 'Credit / Income' : 'Debit / Expense'}
                  </div>
                )}
                {errorField === 'category_id' && (
                  <div className="TX-field-error-msg"><Icon name="warning" size={11} color="currentColor" />Please fill out this field</div>
                )}
              </div>
              {/* Category End */}

              {/* Sub Categories Start */}
              <div className={`TX-field${!form.category_id || availSub.length === 0 ? ' TX-field-disabled' : ''}`}>
                <div className="TX-field-lbl"><Icon name="tag2" size={10} />Account Sub-Head</div>
                <SearchDD
                  options={availSub.map(s => ({ value: String(s.id), label: s.name }))}
                  value={form.sub_category_id}
                  onChange={v => setForm(f => ({ ...f, sub_category_id: v }))}
                  placeholder={!form.category_id ? '— Select Account Head first —' : '— None —'}
                  disabled={!form.category_id || availSub.length === 0} />
                <div className="TX-field-hint">{availSub.length} sub-categories</div>
              </div>
              {/* Sub Categories End */}

              {/* Please Fill Out the field Start */}
              <div className={'TX-field' + (errorField === 'bio_data_id' ? ' err' : '')} ref={bioFieldRef}>
                <div className="TX-field-lbl"><Icon name="building" size={10} />Party Name<span className="TX-field-req">*</span></div>
                <SearchDD
                  options={availBio.map(b => ({ value: String(b.id), label: b.name }))}
                  value={form.bio_data_id}
                  onChange={v => { setForm(f => ({ ...f, bio_data_id: v, sub_name_id: '' })); if (errorField === 'bio_data_id') setErrorField(null); }}
                  placeholder={!form.category_id ? '— Select Party Name —' : '— Select Party Name —'} />
                {form.category_id && (
                  <div className="TX-field-hint">{availBio.length} related party name{availBio.length === 1 ? '' : 's'}</div>
                )}
                {errorField === 'bio_data_id' && (
                  <div className="TX-field-error-msg"><Icon name="warning" size={11} color="currentColor" />Please fill out this field</div>
                )}
              </div>
              {/* Please Fill Out the Field End */}

              {/* Select Party Name Start */}
              <div className={`TX-field${!form.bio_data_id || availSubNames.length === 0 ? ' TX-field-disabled' : ''}`}>
                <div className="TX-field-lbl"><Icon name="user" size={10} />Associate Name</div>
                <SearchDD
                  options={availSubNames.map(s => ({ value: String(s.id), label: s.alternate_name }))}
                  value={form.sub_name_id}
                  onChange={v => setForm(f => ({ ...f, sub_name_id: v }))}
                  placeholder={!form.bio_data_id ? '— Select Party Name first —' : '— None —'}
                  disabled={!form.bio_data_id || availSubNames.length === 0} />
                <div className="TX-field-hint">{availSubNames.length} sub-names</div>
              </div>
              {/* Select Party Name End */}

            </div>
          </div>

          {/* Additional Details Start */}
          <div className="TX-ms">

            {/* Additonal Details Start */}
            <div className="TX-ms-hdr">
              <div className="TX-ms-icon purple"><Icon name="note" size={12} /></div>
              <span className="TX-ms-lbl">Additional Details</span>
              <div className="TX-ms-rule" />
            </div>
            {/* Additonal Details End */}

            {/* Client Name Start */}
            <div className="TX-ms-grid">
              {/* Client Name Start */}
              <div className="TX-field">
                <div className="TX-field-lbl"><Icon name="client" size={10} />Client Name</div>
                <input autoComplete="off" type="text" className="ERP-input" value={form.client_name} onChange={setF('client_name')} placeholder="Optional" />
              </div>
              {/* Client Name End */}
              <div />

              {/* Narration Start */}
              <div className="TX-field span2">
                <div className="TX-field-lbl"><Icon name="note" size={10} />Narration</div>
                <textarea autoComplete="off" className="ERP-input" value={form.narration} onChange={setF('narration') as any}
                  rows={3} placeholder="Purpose, reference, remarks…"
                  style={{ resize: 'vertical', lineHeight: 1.6, minHeight: 72 }} />
              </div>
              {/* Narration End */}

            </div>
            {/* Client Name End */}
          </div>
          {/* Additional Details End */}
        </div>

        {/* Credit - Debit Start */}
        <div className="TX-modal-foot">

          {/* Payment Mode Start */}
          <div className="TX-modal-foot-left">
            <div className={`TX-modal-foot-dot ${typeClass}`} />
            {isCr ? 'Credit' : 'Debit'} · {form.payment_mode} · TXN-{String(entry.id).padStart(4, '0')}
          </div>
          {/* Payment Mode End */}

          {/* Save Changes Start */}
          <div className="TX-modal-foot-btns">
            <button className="TX-modal-cancel" onClick={onClose}><Icon name="x" size={10} /> Cancel</button>
            <button className={`TX-modal-save ${typeClass}`} onClick={handleSubmit} disabled={saving}>
              {saving ? <><span className="ERP-spinner" /> Saving…</> : <><Icon name="check" size={12} /> Save Changes</>}
            </button>
          </div>
          {/* Save Changes End */}

        </div>
        {/* Credit - Debit End */}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function DaybookTransactions() {
  const [userRole] = useState<string>(() => getStoredRole());
  // Default to "This Month" instead of an unbounded range -- previously
  // every open of this page fetched the FULL, ever-growing transaction
  // history before any filter was touched. Same range the "Month"
  // quick-pick button computes; Week/Quarter/Year and "Recently Added" /
  // "View all" still show everything else on demand, unchanged.
  const [fromDate, setFromDate] = useState(() => getDateRange('month').from);
  const [toDate, setToDate] = useState(() => getDateRange('month').to);
  const [appliedFromDate, setAppliedFromDate] = useState(() => getDateRange('month').from);
  const [appliedToDate, setAppliedToDate] = useState(() => getDateRange('month').to);
  const [quickPick, setQuickPick] = useState('month');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [subCatFilter, setSubCatFilter] = useState<string[]>([]);
  const [bioFilter, setBioFilter] = useState<string[]>([]);
  const [subNameFilter, setSubNameFilter] = useState<string[]>([]);
  const [payFilter, setPayFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [nameBioIds, setNameBioIds] = useState<string[]>([]);
  const [selectedSubNamesPerBio, setSelectedSubNamesPerBio] = useState<Record<string, string[]>>({});
  const [nameFilterActive, setNameFilterActive] = useState(false);
  const [entries, setEntries] = useState<TxEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCats, setSubCats] = useState<SubCategory[]>([]);
  const [bioData, setBioData] = useState<BioData[]>([]);
  const [subNames, setSubNames] = useState<SubName[]>([]);
  const [fetching, setFetching] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [sortCol, setSortCol] = useState('transaction_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [recentMode, setRecentMode] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ cat: string[]; subCat: string[]; bio: string[]; subName: string[]; pay: string[]; type: string[] }>({ cat: [], subCat: [], bio: [], subName: [], pay: [], type: [] });
  const applyFilters = () => {
    setAppliedFilters({ cat: catFilter, subCat: subCatFilter, bio: bioFilter, subName: subNameFilter, pay: payFilter, type: typeFilter });
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setNameFilterActive(nameBioIds.length > 0);
    setPage(1);
    toast.success('Filters Applied', 'Table updated with your selected filters');
  };

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [editEntry, setEditEntry] = useState<TxEntry | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; loading: boolean }>({ open: false, id: 0, loading: false });
  const tableRef = useRef<HTMLDivElement>(null);
  const erpPageRef = useRef<HTMLDivElement>(null);
  useKeyboardFieldNav(erpPageRef);

  useEffect(() => {
    (async () => {
      try {
        const h = authHeader();
        const [c, sc, b, sn] = await Promise.all([
          axiosInstance.get('categories', { headers: h }),
          axiosInstance.get('sub-categories', { headers: h }),
          axiosInstance.get('bio-data', { headers: h }),
          axiosInstance.get('sub-names', { headers: h }),
        ]);
        setCategories(asArray(c.data));
        setSubCats(asArray(sc.data));
        setBioData(asArray(b.data));
        setSubNames(asArray(sn.data));
      } catch (e) { console.error('Master data load failed', e); }
    })();
  }, []);

  const loadEntries = useCallback(async () => {
    setFetching(true);
    try {
      const params: any = {};
      if (appliedFromDate) params.from_date = appliedFromDate;
      if (appliedToDate) params.to_date = appliedToDate;
      if (search) params.search = search;
      let loaded: TxEntry[] = [];
      try {
        const { data } = await axiosInstance.get('daybook/transactions', {
          headers: authHeader(), params,
        });
        loaded = asArray(data.entries ?? data.data ?? data);
      } catch {
        const { data } = await axiosInstance.get('daybook', {
          headers: authHeader(),
          params,
        });
        loaded = asArray(data.entries?.data ?? data.entries ?? data.data ?? data);
      }
      setEntries(loaded.map((e: TxEntry) => ({ ...e, amount: Number(e.amount) })));
    } catch (e) {
      console.error('Failed to load transactions', e);
      setEntries([]);
    } finally { setFetching(false); }
  }, [appliedFromDate, appliedToDate, search]);

  useEffect(() => {
    setPage(1);
    loadEntries();
  }, [loadEntries]);

  const handleQuickPick = (p: string) => {
    setQuickPick(p);
    const r = getDateRange(p);
    setFromDate(r.from);
    setToDate(r.to);
    setAppliedFromDate(r.from);
    setAppliedToDate(r.to);
  };

  const handleRefresh = async () => {
    setSpinning(true);
    await loadEntries();
    setTimeout(() => setSpinning(false), 700);
  };

  // Shared "clear every filter and show everything" reset — used both by the
  // in-page "Recent" button and by the auto-arrival effect below (the
  // "View all N transactions →" link on the create-entry page). Resetting
  // `appliedFilters` (not just the draft cat/subCat/... state) matters: the
  // table renders off `appliedFilters`, so a category/bio/etc filter applied
  // earlier in the session used to keep silently hiding everything even
  // after "Recent" was clicked.
  const resetToShowAll = (toastTitle: string, toastMsg: string) => {
    setSearch(''); setCatFilter([]); setSubCatFilter([]);
    setBioFilter([]); setSubNameFilter([]);
    setPayFilter([]); setTypeFilter([]);
    setAppliedFilters({ cat: [], subCat: [], bio: [], subName: [], pay: [], type: [] });
    setNameBioIds([]); setSelectedSubNamesPerBio({}); setNameFilterActive(false);
    setQuickPick('');
    setFromDate('2000-01-01');
    setToDate(new Date().toISOString().slice(0, 10));
    setAppliedFromDate('2000-01-01');
    setAppliedToDate(new Date().toISOString().slice(0, 10));
    setSortCol('id');
    setSortDir('desc');
    setRecentMode(true);
    setPage(1);
    toast.info(toastTitle, toastMsg);
  };

  const handleViewRecent = () => resetToShowAll('Recently Added', 'Showing the latest entries by date added, across all dates');

  // Arrived here via the "View all N transactions →" link on the create-entry
  // page (DaybookPage sets this sessionStorage flag right before navigating).
  // Clear it immediately so a manual revisit/refresh doesn't keep re-firing
  // this, reset every filter so all entries are guaranteed visible, then
  // scroll the table into view and play a brief highlight so it's obvious
  // the full list just loaded.
  const [justArrivedFromLink, setJustArrivedFromLink] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem('daybook_show_recent')) return;
    sessionStorage.removeItem('daybook_show_recent');
    resetToShowAll('Showing All Transactions', 'Every filter was cleared — the full transaction list is loaded below.');
    setJustArrivedFromLink(true);
    const scrollTimer = setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    const clearTimer = setTimeout(() => setJustArrivedFromLink(false), 1500);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const handleDelete = (id: number) => {
    setDeleteModal({ open: true, id, loading: false });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal(d => ({ ...d, loading: true }));
    try {
      await axiosInstance.delete(`/api/daybook/${id}`, { headers: authHeader() });
      setDeleteModal({ open: false, id: 0, loading: false });
      showMsg('Transaction deleted.', 'success');
      toast.warning('Entry Deleted', 'Transaction moved to Recycle Bin');
      loadEntries();
    } catch (e: any) {
      showMsg(e.response?.data?.message || 'Delete failed', 'error');
      toast.error('Delete Failed', e.response?.data?.message || 'Could not delete entry');
    }
  };

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const incomeCategoryIds = new Set(categories.filter(c => c.type === 'income').map(c => c.id));
  const bioIdsFromIncomeEntries = new Set(
    entries.filter(e => getEntryType(e, categories) === 'income').map(e => String(e.bio_data_id))
  );

  const bioNamesUsedAsClient = new Set(
    entries.map(e => e.client_name?.trim().toLowerCase()).filter(Boolean)
  );

  const incomeBioOptions: SDDOpt[] = bioData
    .filter(b =>
      (b.category_id && incomeCategoryIds.has(b.category_id)) ||
      bioIdsFromIncomeEntries.has(String(b.id)) ||
      bioNamesUsedAsClient.has(b.name.trim().toLowerCase())
    )
    .map(b => ({ value: String(b.id), label: b.name }));

  // Party Name cascade: mirrors the Category → Party Name relation used on the
  // entry-creation form (DaybookPage) — bio_data.category_id is the source
  // of truth, so this covers both income and expense categories, not just
  // expense. When a Sub Category is also picked (a relation that only
  // exists on actual transactions, not in bio_data master data), narrow
  // further using entries recorded under that sub category.
  const bioScopedEntries = subCatFilter.length > 0
    ? entries.filter(e =>
      (catFilter.length === 0 || catFilter.includes(String(e.category_id))) &&
      subCatFilter.includes(String(e.sub_category_id))
    )
    : null;
  const bioNameOptions: SDDOpt[] = bioScopedEntries
    ? Array.from(new Set(bioScopedEntries.map(e => e.bio_data_id)))
      .map(id => bioData.find(b => b.id === id))
      .filter((b): b is BioData => !!b)
      .map(b => ({ value: String(b.id), label: b.name }))
    : (catFilter.length > 0
      ? bioData.filter(b => !b.category_id || catFilter.includes(String(b.category_id)))
      : bioData
    ).map(b => ({ value: String(b.id), label: b.name }));
  const paymentScopedEntries = entries.filter(e =>
    (catFilter.length === 0 || catFilter.includes(String(e.category_id))) &&
    (subCatFilter.length === 0 || subCatFilter.includes(String(e.sub_category_id))) &&
    (bioFilter.length === 0 || bioFilter.includes(String(e.bio_data_id))) &&
    (subNameFilter.length === 0 || subNameFilter.includes(String(e.sub_name_id)))
  );
  const availablePaymentModes = Array.from(
    new Set(paymentScopedEntries.map(e => e.payment_mode).filter(Boolean))
  ).sort();
  const subNameMap: Record<string, SubName[]> = {};
  for (const sn of subNames) {
    const key = String(sn.bio_data_id);
    if (!subNameMap[key]) subNameMap[key] = [];
    subNameMap[key].push(sn);
  }

  const availableSubCats = catFilter.length > 0 ? subCats.filter(s => catFilter.includes(String(s.category_id))) : subCats;
  const availableSubNames = bioFilter.length > 0 ? subNames.filter(s => bioFilter.includes(String(s.bio_data_id))) : subNames;

  const matchesNameFilter = (e: TxEntry): boolean => {
    if (!nameFilterActive || nameBioIds.length === 0) return true;
    if (getEntryType(e, categories) !== 'expense') return false;

    const bioIdStr = String(e.bio_data_id);
    const matchesBioId = nameBioIds.includes(bioIdStr);
    const selectedBioNames = nameBioIds
      .map(id => bioData.find(b => String(b.id) === id)?.name?.trim().toLowerCase())
      .filter(Boolean) as string[];
    const matchesClient = selectedBioNames.some(
      name => e.client_name && e.client_name.trim().toLowerCase() === name
    );

    if (!matchesBioId && !matchesClient) return false;

    if (matchesBioId) {
      const selSubs = selectedSubNamesPerBio[bioIdStr];
      if (selSubs && selSubs.length > 0) {
        const entrySubId = e.sub_name_id != null ? String(e.sub_name_id) : '';
        if (!selSubs.includes(entrySubId)) return false;
      }
    }
    return true;
  };

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const type = getEntryType(e, categories);

    const matchSearch = !q || [
      e.bio_data_name, e.category_name, e.sub_category_name || '',
      e.sub_name_name || '', e.narration || '', e.payment_mode, e.client_name || '',
    ].some(v => v.toLowerCase().includes(q));

    return (
      matchSearch
      && matchesNameFilter(e)
      && (appliedFilters.cat.length === 0 || appliedFilters.cat.includes(String(e.category_id)))
      && (appliedFilters.subCat.length === 0 || appliedFilters.subCat.includes(String(e.sub_category_id)))
      && (appliedFilters.bio.length === 0 || appliedFilters.bio.includes(String(e.bio_data_id)))
      && (appliedFilters.subName.length === 0 || appliedFilters.subName.includes(String(e.sub_name_id)))
      && (appliedFilters.pay.length === 0 || appliedFilters.pay.includes(e.payment_mode))
      && (appliedFilters.type.length === 0 || appliedFilters.type.includes(type))
    );
  }).sort((a, b) => {
    let va: any = (a as any)[sortCol] ?? '';
    let vb: any = (b as any)[sortCol] ?? '';
    if (sortCol === 'amount') { va = Number(a.amount); vb = Number(b.amount); }
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const previewDebitCount = nameBioIds.length > 0
    ? entries.filter(e => {
      if (getEntryType(e, categories) !== 'expense') return false;
      const bioIdStr = String(e.bio_data_id);
      const selectedBioNames = nameBioIds
        .map(id => bioData.find(b => String(b.id) === id)?.name?.trim().toLowerCase())
        .filter(Boolean) as string[];
      const matchesBioId = nameBioIds.includes(bioIdStr);
      const matchesClient = selectedBioNames.some(n => e.client_name && e.client_name.trim().toLowerCase() === n);
      if (!matchesBioId && !matchesClient) return false;
      if (matchesBioId) {
        const selSubs = selectedSubNamesPerBio[bioIdStr];
        if (selSubs && selSubs.length > 0) {
          const entrySubId = e.sub_name_id != null ? String(e.sub_name_id) : '';
          if (!selSubs.includes(entrySubId)) return false;
        }
      }
      return true;
    }).length
    : 0;
  const displayStats = computeStats(filtered, categories);
  const filteredCrCount = filtered.filter(e => getEntryType(e, categories) === 'income').length;
  const filteredDrCount = filtered.length - filteredCrCount;
  const creditByMode: { mode: string; amount: number }[] = [];
  const debitByMode: { mode: string; amount: number }[] = [];
  {
    const creditMap: Record<string, number> = {};
    const debitMap: Record<string, number> = {};
    for (const e of filtered) {
      const amt = Number(e.amount) || 0;
      const mode = e.payment_mode || 'Others';
      if (getEntryType(e, categories) === 'income') creditMap[mode] = (creditMap[mode] || 0) + amt;
      else debitMap[mode] = (debitMap[mode] || 0) + amt;
    }
    creditByMode.push(...Object.entries(creditMap).map(([mode, amount]) => ({ mode, amount })).sort((a, b) => b.amount - a.amount));
    debitByMode.push(...Object.entries(debitMap).map(([mode, amount]) => ({ mode, amount })).sort((a, b) => b.amount - a.amount));
  }
  // Same Cash/Bank-Holding split as the Daybook create page, but scoped to
  // whatever's currently filtered here — "Cash" mode is its own bucket,
  // every other mode (UPI, NEFT, Cheque, Bank Transfer, Others) merges
  // into "Bank" since they all settle to a bank account. Each pair always
  // adds back up to the big total shown above it.
  const modeAmt = (list: { mode: string; amount: number }[], wantCash: boolean) =>
    list.reduce((sum, { mode, amount }) => sum + ((mode === 'Cash') === wantCash ? amount : 0), 0);
  const creditCash = modeAmt(creditByMode, true), creditBank = modeAmt(creditByMode, false);
  const debitCash = modeAmt(debitByMode, true), debitBank = modeAmt(debitByMode, false);
  const netCash = creditCash - debitCash, netBank = creditBank - debitBank;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const pageStats = computeStats(paginated, categories);
  const isNameMode = nameFilterActive && nameBioIds.length > 0;
  // Picking a value in a dropdown only stages it (drives the dropdown UI) —
  // it must NOT flip the page from the "choose filters" prompt to the table.
  // That only happens once "Filter" is clicked and the choice lands in
  // appliedFilters. Date range / search box / Recently Added stay instant.
  const hasAppliedDropdownFilter = (
    appliedFilters.cat.length > 0 || appliedFilters.subCat.length > 0 || appliedFilters.bio.length > 0 ||
    appliedFilters.subName.length > 0 || appliedFilters.pay.length > 0 || appliedFilters.type.length > 0
  );
  const anySelectionMade = !!(
    appliedFromDate || appliedToDate || search || hasAppliedDropdownFilter || isNameMode
  );
  // Chips reflect what's actually APPLIED (appliedFilters), not the staged
  // dropdown picks — otherwise a chip would appear the instant something is
  // selected, before "Filter" is ever clicked, which is exactly the
  // "shows something already" confusion this whole flow is meant to avoid.
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  for (const id of appliedFilters.cat) {
    activeFilters.push({
      label: categories.find(c => String(c.id) === id)?.name || id,
      onRemove: () => { setCatFilter(v => v.filter(x => x !== id)); setAppliedFilters(p => ({ ...p, cat: p.cat.filter(x => x !== id) })); },
    });
  }
  for (const id of appliedFilters.subCat) {
    activeFilters.push({
      label: subCats.find(s => String(s.id) === id)?.name || id,
      onRemove: () => { setSubCatFilter(v => v.filter(x => x !== id)); setAppliedFilters(p => ({ ...p, subCat: p.subCat.filter(x => x !== id) })); },
    });
  }
  for (const id of appliedFilters.bio) {
    activeFilters.push({
      label: `Bio: ${bioData.find(b => String(b.id) === id)?.name || id}`,
      onRemove: () => { setBioFilter(v => v.filter(x => x !== id)); setAppliedFilters(p => ({ ...p, bio: p.bio.filter(x => x !== id) })); },
    });
  }
  for (const id of appliedFilters.subName) {
    activeFilters.push({
      label: `Sub: ${subNames.find(s => String(s.id) === id)?.alternate_name || id}`,
      onRemove: () => { setSubNameFilter(v => v.filter(x => x !== id)); setAppliedFilters(p => ({ ...p, subName: p.subName.filter(x => x !== id) })); },
    });
  }
  for (const mode of appliedFilters.pay) {
    activeFilters.push({
      label: `Pay: ${mode}`,
      onRemove: () => { setPayFilter(v => v.filter(x => x !== mode)); setAppliedFilters(p => ({ ...p, pay: p.pay.filter(x => x !== mode) })); },
    });
  }
  for (const t of appliedFilters.type) {
    activeFilters.push({
      label: t === 'income' ? 'CR Only' : 'DR Only',
      onRemove: () => { setTypeFilter(v => v.filter(x => x !== t)); setAppliedFilters(p => ({ ...p, type: p.type.filter(x => x !== t) })); },
    });
  }
  if (search) activeFilters.push({ label: `"${search}"`, onRemove: () => setSearch('') });

  const SortIco = ({ col }: { col: string }) => (
    <span className={`TX-sort-ic${sortCol === col ? ' on' : ''}`}>
      {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const QUICK_PICKS = [
    { key: 'today', label: 'Today' }, { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' }, { key: 'quarter', label: 'Quarter' }, { key: 'year', label: 'Year' },
  ];

  const handleExportWord = async () => {
    setWordLoading(true);
    try {
      await exportToWord(filtered, categories, appliedFromDate, appliedToDate, displayStats, activeFilters.map(f => f.label));
    } catch (err: any) {
      showMsg('Word export failed: ' + (err.message || 'Unknown error'), 'error');
    } finally { setWordLoading(false); }
  };

  const handlePrint = () => {
    const rows = filtered.map((e, i) => {
      const type = getEntryType(e, categories);
      const isCr = type === 'income';
      return `<tr>
                <td style="text-align:center">${i + 1}</td>
                <td>${formatDate(e.transaction_date)}</td>
                <td><strong>${e.bio_data_name}</strong></td>
                <td style="color:#C2410C;font-size: 9px">${e.sub_name_name || '—'}</td>
                <td>${e.client_name || '—'}</td>
                <td>${e.category_name}</td>
                <td>${e.sub_category_name || '—'}</td>
                <td>${e.payment_mode}</td>
                <td style="text-align:right;font-weight: 800;color:${isCr ? '#1E9C6A' : '#D93B55'}">${isCr ? '+' : '-'}₹${Number(e.amount).toLocaleString('en-IN')}</td>
                <td style="text-align:center"><span style="background:${isCr ? '#E6F9F0' : '#FEE8E8'};color:${isCr ? '#1E9C6A' : '#D93B55'};padding:2px 8px;border-radius:4px;font-size: 8px;font-weight: 800">${isCr ? 'CR' : 'DR'}</span></td>
                <td style="color:#6B5D48;font-size: 9px">${e.narration || '—'}</td>
            </tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cash Book</title>
<style>
  * { font-family: 'DM Sans', Arial, sans-serif; }
  body { font-size: 9px; color: #231C14; margin: 20px; background: #F5F3EF; }
  .hdr { text-align: center; border-bottom: 2px solid #F0834D; padding-bottom: 12px; margin-bottom: 16px; }
  .hdr-logo { height: 44px; margin-bottom: 6px; }
  h1 { font-size: 17.5px; margin: 0 0 4px; color: #231C14; font-weight: 800; letter-spacing: -0.5px; }
  p { font-size: 9px; color: #6B5D48; margin: 3px 0; }
  h2 { font-size: 11.5px; margin: 0 0 4px; color: #231C14; font-weight: 800; }
  .meta { font-size: 9px; color: #6B5D48; margin-bottom: 14px; }
  .stats { display: flex; gap: 16px; margin-bottom: 16px; padding: 12px 0; border-top: 2px solid #F0834D; border-bottom: 1px solid #E8E2D8; }
  .sbox { flex: 1; padding: 10px 14px; border-radius: 8px; }
  .sbox.cr { background: #E6F9F0; }
  .sbox.dr { background: #FEE8E8; }
  .sbox.bl { background: #FDE0CB; }
  .slbl { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; }
  .slbl.cr { color: #1E9C6A; }
  .slbl.dr { color: #D93B55; }
  .slbl.bl { color: #F0834D; }
  .sval { font-size: 17.5px; font-weight: 800; margin-top: 3px; }
  .sval.cr { color: #1E9C6A; }
  .sval.dr { color: #D93B55; }
  .sval.bl { color: #F0834D; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #231C14; color: #faf9f7; text-align: left; padding: 8px 10px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 800; }
  td { padding: 7px 10px; border-bottom: 1px solid #E8E2D8; vertical-align: middle; font-size: 9px; }
  tr:nth-child(even) td { background: #F5F3EF; }
  tfoot td { background: #FDE0CB !important; font-weight: 800; border-top: 2px solid #F0834D !important; }
  @page { margin: 10mm; size: A4 landscape; }
</style></head><body>
<div class="hdr"><img class="hdr-logo" src="${window.location.origin + import.meta.env.BASE_URL + 'favicon.png'}" alt="${COMPANY.name}" /><h1>${COMPANY.name}</h1><p>${COMPANY.address}</p></div>
<h2>Cash Book Transactions Report</h2>
<div class="meta">Period: <strong>${formatDate(appliedFromDate)}</strong> to <strong>${formatDate(appliedToDate)}</strong> · <strong>${filtered.length}</strong> records</div>
<div class="stats">
  <div class="sbox cr"><div class="slbl cr">Total Credit</div><div class="sval cr">₹${displayStats.income.toLocaleString('en-IN')}</div></div>
  <div class="sbox dr"><div class="slbl dr">Total Debit</div><div class="sval dr">₹${displayStats.expense.toLocaleString('en-IN')}</div></div>
  <div class="sbox bl"><div class="slbl bl">Net Balance</div><div class="sval bl">₹${Math.abs(displayStats.balance).toLocaleString('en-IN')} ${displayStats.balance >= 0 ? 'CR' : 'DR'}</div></div>
</div>
<table><thead><tr>
  <th style="text-align:center">S.No</th><th>Date</th><th>Party Name</th><th>Associate Name</th><th>Client</th><th>Account Head</th><th>Account Sub-Head</th><th>Payment</th>
  <th style="text-align:right">Amount</th><th style="text-align:center">CR/DR</th><th>Narration</th>
</tr></thead><tbody>${rows}</tbody>
<tfoot><tr>
  <td colspan="8" style="text-align:right;font-size: 8px;letter-spacing:1px;text-transform:uppercase">Total — ${filtered.length} records</td>
  <td style="text-align:right"><div style="color:#1E9C6A">+₹${displayStats.income.toLocaleString('en-IN')}</div><div style="color:#D93B55">-₹${displayStats.expense.toLocaleString('en-IN')}</div></td>
  <td style="text-align:center;color:${displayStats.balance >= 0 ? '#1E9C6A' : '#D93B55'};font-weight: 800">${displayStats.balance >= 0 ? 'CR' : 'DR'}</td>
  <td style="color:#F0834D;font-weight: 800">₹${Math.abs(displayStats.balance).toLocaleString('en-IN')}</td>
</tr></tfoot></table>
</body></html>`;
    const w = window.open('', '_blank', 'width=1200,height=800');
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 400); }
  };

  return (
    <>
      <div className="ERP-page" ref={erpPageRef}>
        {/* Deliberately NOT using the "T" class here (unlike before): T_CSS's
            base .T rule sets font-family/background/color from broken
            "bridge alias" custom properties (--body/--surf/--t1, defined
            under an invalid `::root` selector in ReportTheme.ts so they
            never actually resolve), and because .T loads after .ERP-page in
            the cascade it was winning and silently breaking the page font.
            All the T-prefixed component classes (T-filterpanel, T-date-bar,
            etc.) are standalone selectors, not descendants of .T, so this
            is safe to drop. */}
        <style>{ERP_CSS}{T_CSS}{TX_CSS}</style>

        <PageOpenIntro containerRef={erpPageRef} label="Opening Transactions…" />

        {/* ── HEADER START ── */}
        <div className="ERP-hdr">
          <div className="ERP-hdr-left">
            <div className="ERP-eyebrow">
              <span className="ERP-eyebrow-line" />
              <span className="ERP-eyebrow-dot" />
              Transaction · Full Ledger
            </div>
            <div className="ERP-title MD-page-title">Day<span className="ERP-title-em">book</span> Transactions</div>
          </div>
        </div>
        {/* ── HEADER END ── */}

        <div className="ERP-divider" />

        <div className="ERP-stats">

          {/* TOTAL CREDIT START */}
          <div className="ERP-stat">
            <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--success),#34D399)' }} />
            <div className="ERP-stat-glow" />
            <div className="ERP-stat-label">Total Credit</div>
            <div className="ERP-stat-val" style={{ color: 'var(--success)', fontSize: 28 }}>
              {anySelectionMade ? (
                <>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                  <AnimCount value={displayStats.income} />
                </>
              ) : <span className="TX-stat-empty">Select a filter</span>}
            </div>
            <div className="TX-stat-sub">{anySelectionMade ? 'CR in range' : 'to view amount'}</div>
            {anySelectionMade && creditByMode.length > 0 && (
              <div className="DB-stat-breakdown">
                <div className="DB-stat-chip cash">
                  <span className="DB-stat-chip-icon"><Icon name="cash" size={9} color="#1E9C6A" /></span>
                  <span className="DB-stat-chip-text">
                    <span className="DB-stat-chip-label">Cash Holding</span>
                    <span className="DB-stat-chip-val">₹{creditCash.toLocaleString('en-IN')}</span>
                  </span>
                </div>
                <div className="DB-stat-chip bank">
                  <span className="DB-stat-chip-icon"><Icon name="bank" size={9} color="#A6491D" /></span>
                  <span className="DB-stat-chip-text">
                    <span className="DB-stat-chip-label">Bank Holding</span>
                    <span className="DB-stat-chip-val">₹{creditBank.toLocaleString('en-IN')}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* TOTAL CREDIT END */}

          {/* TOTAL DEBIT START */}
          <div className="ERP-stat">
            <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--error),#F87171)' }} />
            <div className="ERP-stat-glow" />
            <div className="ERP-stat-label">Total Debit</div>
            <div className="ERP-stat-val" style={{ color: 'var(--error)', fontSize: 28 }}>
              {anySelectionMade ? (
                <>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                  <AnimCount value={displayStats.expense} />
                </>
              ) : <span className="TX-stat-empty">Select a filter</span>}
            </div>
            <div className="TX-stat-sub">{anySelectionMade ? 'DR in range' : 'to view amount'}</div>
            {anySelectionMade && debitByMode.length > 0 && (
              <div className="DB-stat-breakdown">
                <div className="DB-stat-chip cash">
                  <span className="DB-stat-chip-icon"><Icon name="cash" size={9} color="#1E9C6A" /></span>
                  <span className="DB-stat-chip-text">
                    <span className="DB-stat-chip-label">Cash Holding</span>
                    <span className="DB-stat-chip-val">₹{debitCash.toLocaleString('en-IN')}</span>
                  </span>
                </div>
                <div className="DB-stat-chip bank">
                  <span className="DB-stat-chip-icon"><Icon name="bank" size={9} color="#A6491D" /></span>
                  <span className="DB-stat-chip-text">
                    <span className="DB-stat-chip-label">Bank Holding</span>
                    <span className="DB-stat-chip-val">₹{debitBank.toLocaleString('en-IN')}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* TOTAL DEBIT END */}

          {/* NET BALANCE START */}
          <div className="ERP-stat">
            <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--info),#F0834D)' }} />
            <div className="ERP-stat-glow" />
            <div className="ERP-stat-label">Net Balance</div>
            <div className="ERP-stat-val" style={{ color: displayStats.balance >= 0 ? 'var(--success)' : 'var(--error)', fontSize: 28 }}>
              {anySelectionMade ? (
                <>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                  <AnimCount value={Math.abs(displayStats.balance)} />
                </>
              ) : <span className="TX-stat-empty">Select a filter</span>}
            </div>
            <div className="TX-stat-sub">
              {anySelectionMade ? (displayStats.balance >= 0 ? 'Net Surplus' : 'Net Deficit') : 'to view amount'}
            </div>
            {anySelectionMade && filtered.length > 0 && (
              <div className="DB-stat-breakdown">
                <div className="DB-stat-chip cash">
                  <span className="DB-stat-chip-icon"><Icon name="cash" size={9} color="#1E9C6A" /></span>
                  <span className="DB-stat-chip-text">
                    <span className="DB-stat-chip-label">Cash Holding</span>
                    <span className="DB-stat-chip-val" style={{ color: netCash < 0 ? 'var(--error)' : 'var(--text-1)' }}>
                      {netCash < 0 ? '-' : ''}₹{Math.abs(netCash).toLocaleString('en-IN')}
                    </span>
                  </span>
                </div>
                <div className="DB-stat-chip bank">
                  <span className="DB-stat-chip-icon"><Icon name="bank" size={9} color="#A6491D" /></span>
                  <span className="DB-stat-chip-text">
                    <span className="DB-stat-chip-label">Bank Holding</span>
                    <span className="DB-stat-chip-val" style={{ color: netBank < 0 ? 'var(--error)' : 'var(--text-1)' }}>
                      {netBank < 0 ? '-' : ''}₹{Math.abs(netBank).toLocaleString('en-IN')}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* NET BALANCE END */}

        </div>
        {/* ── Stats End ── */}

        {/* ── Ledger Card Header (matches ReportCenter's module card head) Start ── */}
        <div className="T-card-head TX-fused-head">
          <div className="T-card-head-left">
            <div className="T-card-icon T-card-icon-db">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="19" cy="17" r="3.2" /><path d="M21.2 19.2L23 21" /></svg>
            </div>
            <span className="T-card-title">Transaction Ledger</span>
            <span className="T-card-badge T-card-badge-db">Live View</span>
          </div>
          <div className="T-card-head-right">
            <button
              className={`TX-recent-btn${recentMode ? ' active' : ''}`}
              onClick={handleViewRecent}
              title="Show the latest entries by date added, across all dates">
              <span className="TX-recent-btn-icon"><Icon name="spark" size={11} /></span>
              Recently Added
              {recentMode && <span className="TX-recent-btn-dot" />}
            </button>
            <button className="T-pdf-btn" onClick={handlePrint} title="Export current view to PDF">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              Export PDF
            </button>
          </div>
        </div>
        {/* ── Ledger Card Header End ── */}

        {/* ── Date Range Bar Start ── */}
        <div className="T-date-bar">
          <div className="T-date-bar-lbl"><Icon name="calendar" size={11} color="currentColor" /> Date Range</div>

          {/* Date Range Start */}
          <div className="T-date-range">
            <div className="T-date-field">
              <CalendarDD value={fromDate} max={toDate}
                onChange={v => { setFromDate(v); setQuickPick(''); }} />
            </div>
            <div className="T-date-sep" />
            <div className="T-date-field">
              <CalendarDD value={toDate} min={fromDate}
                onChange={v => { setToDate(v); setQuickPick(''); }} />
            </div>
          </div>
          {/* Date Range End */}

          {/* Button Start */}
          <div className="TX-quick-picks">
            {QUICK_PICKS.map(qp => (
              <button key={qp.key} className={`TX-qp${quickPick === qp.key ? ' active' : ''}`}
                onClick={() => handleQuickPick(qp.key)}>{qp.label}</button>
            ))}
          </div>
          {/* Button End */}

        </div>
        {/* ── Date Range Bar End ── */}

        {/* ── Filter Panel ── */}
        <div className="T-filterpanel animate-scale">
          {/* Filter Panel Start */}
          <div className="T-filterpanel-hd">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            Refine Your View
            <span className="T-fchain-hint">Account Head → Account Sub-Head → Party Name → Associate Name</span>
          </div>
          {/* Filter Panel End */}

          {/* Icon Start */}
          <div className="T-ffield-grid">
            {/* Category Start */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="tag2" size={9} />1. Account Head</span>
              <MultiSearchDD
                options={categories.map(c => ({ value: String(c.id), label: `${c.name} (${c.type === 'income' ? 'CR' : 'DR'})` }))}
                value={catFilter}
                onChange={v => {
                  setCatFilter(v); setSubCatFilter([]); setBioFilter([]); setSubNameFilter([]); setPayFilter([]);
                }}
                placeholder="All Account Heads" />
            </div>
            {/* Category End */}

            {/* Sub Category Start */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="tag2" size={9} />2. Account Sub-Head</span>
              <MultiSearchDD
                options={availableSubCats.map(s => ({ value: String(s.id), label: s.name }))}
                value={subCatFilter}
                onChange={v => { setSubCatFilter(v); setBioFilter([]); setSubNameFilter([]); setPayFilter([]); }}
                placeholder={catFilter.length ? 'All Account Sub-Heads' : 'Select Account Head first'}
                disabled={catFilter.length === 0} />
            </div>
            {/* Sub Category End */}

            {/* Party Name Start */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="building" size={9} />3. Party Name</span>
              <MultiSearchDD
                options={bioNameOptions}
                value={bioFilter}
                onChange={v => {
                  setBioFilter(v); setSubNameFilter([]); setPayFilter([]);
                }}
                placeholder={catFilter.length ? 'All Party Names' : 'Select Account Head first'}
                disabled={catFilter.length === 0} />
            </div>
            {/* Party Name End */}

            {/* Party Name End */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="user" size={9} />4. Associate Name</span>
              <MultiSearchDD
                options={availableSubNames.map(s => ({ value: String(s.id), label: s.alternate_name }))}
                value={subNameFilter}
                onChange={v => { setSubNameFilter(v); setPayFilter([]); }}
                placeholder={bioFilter.length ? 'All Associate Names' : 'Select Party Name first'}
                disabled={bioFilter.length === 0} />
            </div>
            {/* Party Name End */}

            {/* Payment Mode Start */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="cash" size={9} />Payment Mode</span>
              <MultiSearchDD
                options={availablePaymentModes.map(p => ({ value: p, label: p }))}
                value={payFilter}
                onChange={v => setPayFilter(v)}
                placeholder={availablePaymentModes.length ? 'All Payment Modes' : 'No payment modes yet'} />
            </div>
            {/* Payment Mode End */}

            {/* CR/DR Start */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="trending" size={9} />Entry Type</span>
              <MultiSearchDD
                options={[{ value: 'income', label: '↑ Credit (Income)' }, { value: 'expense', label: '↓ Debit (Expense)' }]}
                value={typeFilter}
                onChange={v => setTypeFilter(v)}
                placeholder="All Types (CR + DR)" />
            </div>
            {/* CR/DR End */}

            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="list" size={9} />Per Page</span>
              <SearchDD
                options={[10, 25, 50, 100].map(n => ({ value: String(n), label: `${n} rows` }))}
                value={String(perPage)}
                onChange={v => { if (!v) return; setPerPage(+v); setPage(1); }}
                placeholder="Rows per page" />
            </div>

            {/* Income Party Filter */}
            <div className="T-ffield">
              <span className="T-ffield-lbl"><Icon name="income" size={9} />Income Party</span>
              <MultiSearchDD
                options={incomeBioOptions}
                value={nameBioIds}
                onChange={v => {
                  setNameBioIds(v);
                  setSelectedSubNamesPerBio({});
                }}
                placeholder="All Income Parties" />
            </div>
            {/* Income Party Filter */}

            <div className="T-ffield T-actions-col">
              <span className="T-ffield-lbl">&nbsp;</span>
              <div className="T-actions-row">
                <button type="button" className="T-stack-btn T-stack-search" onClick={applyFilters} title="Apply the selected filters to the table" aria-label="Apply filters">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" /></svg>
                  <span>Filter</span>
                </button>
                <button type="button" className="T-stack-btn T-stack-reset" onClick={() => {
                  setSearch(''); setCatFilter([]); setSubCatFilter([]);
                  setBioFilter([]); setSubNameFilter([]);
                  setPayFilter([]); setTypeFilter([]);
                  setNameBioIds([]); setSelectedSubNamesPerBio({}); setNameFilterActive(false);
                  setAppliedFilters({ cat: [], subCat: [], bio: [], subName: [], pay: [], type: [] });
                  if (recentMode) {
                    setRecentMode(false);
                    setFromDate(''); setToDate(''); setQuickPick('');
                    setAppliedFromDate(''); setAppliedToDate('');
                    setSortCol('transaction_date'); setSortDir('desc');
                  }
                }} title="Reset all filters" aria-label="Reset all filters">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.343-5.657" /><path d="M20 4v5h-5" /></svg>
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="T-chips" style={{ marginTop: 14 }}>
              {activeFilters.map((af, i) => (
                <span key={i} className="T-chip" style={{ borderColor: 'var(--ember-border)', color: 'var(--ember)', background: 'var(--ember-ghost)' }}>
                  {af.label}
                  <span className="T-chip-x" onClick={af.onRemove}>×</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {/* ── Filter Panel ── */}

        {!anySelectionMade ? (

          <div className="T-card TX-empty-card">
            <div className="T-choose-empty">
              <div className="T-choose-empty-orbit">
                <div className="T-choose-ring" />
                <div className="T-choose-ring r2" />
                <div className="T-choose-empty-icon"><Icon name="filter" size={22} color="#faf9f7" /></div>
              </div>
              <div className="T-choose-empty-title">Choose a Filter to View Transactions</div>
              <div className="T-choose-empty-sub">
                Pick a date range, category, bio name, payment mode, entry type, or type a search
                term above — matching transactions will appear here.
              </div>
              <div className="T-choose-empty-chips">
                <span className="T-choose-chip">Date Range</span>
                <span className="T-choose-chip">Account Head</span>
                <span className="T-choose-chip">Party Name</span>
                <span className="T-choose-chip">Payment Mode</span>
                <span className="T-choose-chip">Search</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Toolbar Start ── */}
            <div className="TX-toolbar">
              <span className="TX-count">
                Showing&nbsp;
                <em>{filtered.length === 0 ? 0 : Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)}</em>
                &nbsp;of&nbsp;<em>{filtered.length}</em>&nbsp;records
                {isNameMode && <span style={{ marginLeft: 10, color: 'var(--success)', fontWeight: 800 }}>· {nameBioIds.length} income party DR filter</span>}
              </span>
              <div className="TX-toolbar-sep" />
              <button className={`ERP-refresh-btn${spinning ? ' spin' : ''}`} onClick={handleRefresh} title="Refresh" aria-label="Refresh">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12a8 8 0 1 1-2.343-5.657" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 4v5h-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>
            {/* ── Toolbar End ── */}

            {/* ── Table Start ── */}
            <div ref={tableRef} className={`TX-tbl-wrap${isNameMode ? ' name-mode' : ''}${justArrivedFromLink ? ' arrive-highlight' : ''}`}>
              <div className="TX-tbl-hdr">
                <div>
                  <div className="TX-tbl-title">
                    Transaction Ledger
                    {isNameMode && (
                      <span style={{ marginLeft: 10, fontSize: 9.5, background: 'var(--success-bg)', border: '1px solid var(--success-bd)', color: 'var(--success)', fontWeight: 800, padding: '2px 10px', borderRadius: 5 }}>
                        DR Filter · Income Parties
                      </span>
                    )}
                  </div>
                  <div className="TX-tbl-subtitle">
                    <Icon name="calendar" size={11} color="var(--ember)" />
                    <span className="TX-tbl-daterange">{formatDate(appliedFromDate)} → {formatDate(appliedToDate)}</span>
                    &nbsp;· {filtered.length} records ·
                    ₹{displayStats.income.toLocaleString('en-IN')} CR /
                    ₹{displayStats.expense.toLocaleString('en-IN')} DR
                  </div>
                </div>
                <div className="TX-tbl-badge"><Icon name="list" size={11} color="var(--text-4)" />{filtered.length} Records</div>
              </div>

              {fetching ? (
                <div className="TX-loading-wrap">
                  <RunningLoader label="Loading Transactions" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="ERP-empty">
                  <div className="ERP-empty-icon"><Icon name="inbox" size={24} color="var(--text-4)" /></div>
                  <div className="ERP-empty-title">
                    {isNameMode ? 'No DR Entries for Selected Income Parties' : 'No Transactions Found'}
                  </div>
                  <div className="ERP-empty-sub">
                    {isNameMode ? 'The selected parties have no debit entries (by bio name or client name) in this date range.' : 'Adjust filters or date range.'}
                  </div>
                  {isNameMode && (
                    <button onClick={() => { setNameBioIds([]); setSelectedSubNamesPerBio({}); setNameFilterActive(false); }}
                      style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 'var(--r-md)', background: 'var(--success-bg)', border: '1px solid var(--success-bd)', fontSize: 9.5, fontWeight: 800, color: 'var(--success)', cursor: 'pointer' }}>
                      <Icon name="x" size={10} color="currentColor" /> Clear Filter
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="ERP-tbl-scroll">
                    <table className="ERP-tbl">
                      <thead>
                        <tr>
                          <th style={{ width: '4%', textAlign: 'center' }}>S No</th>
                          <th style={{ width: '7%' }}>Date</th>
                          <th style={{ width: '9%' }}>Client</th>
                          <th style={{ width: '8%' }}>Account Head</th>
                          <th style={{ width: '8%' }}>Account Sub-Head</th>
                          <th style={{ width: '9%' }}>Party Name</th>
                          <th style={{ width: '8%' }}>Associate Name</th>
                          <th style={{ width: '7%' }}>Payment Mode</th>
                          <th style={{ width: '8%', textAlign: 'right' }}>CR</th>
                          <th style={{ width: '8%', textAlign: 'right' }}>DR</th>
                          <th style={{ width: '16%' }}>Narration</th>
                          <th style={{ width: '6%', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>

                      {/* Tbody Start */}
                      <tbody>
                        {paginated.map((entry, i) => {
                          const type = getEntryType(entry, categories);
                          const isCr = type === 'income';
                          const chip = getChip(entry.payment_mode);
                          const selectedBioNames = nameBioIds
                            .map(id => bioData.find(b => String(b.id) === id)?.name?.trim().toLowerCase())
                            .filter(Boolean) as string[];
                          const isHL = isNameMode && (
                            nameBioIds.includes(String(entry.bio_data_id)) ||
                            selectedBioNames.some(n => entry.client_name?.trim().toLowerCase() === n)
                          );

                          return (
                            <tr key={entry.id} className="TX-row" style={{ '--i': i, ...(isHL ? { background: 'rgba(30, 156, 106, 0.03)' } : {}) } as React.CSSProperties}>
                              <td data-label="S No" className="ERP-t-num" style={{ textAlign: 'center' }}>
                                {isHL && <span style={{ display: 'inline-block', width: 3, height: 16, background: 'var(--success)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />}
                                {(page - 1) * perPage + i + 1}
                              </td>
                              <td data-label="Date" className="TX-date">{formatDate(entry.transaction_date)}</td>
                              <td data-label="Client">
                                {entry.client_name
                                  ? <span className="TX-client">{entry.client_name}</span>
                                  : <span className="ERP-t-null">—</span>}
                              </td>
                              <td data-label="Account Head">{entry.category_name}</td>
                              <td data-label="Account Sub-Head">
                                {entry.sub_category_name || <span className="ERP-t-null">—</span>}
                              </td>
                              <td data-label="Party Name">
                                <span className="ERP-t-primary" style={isHL ? { color: 'var(--success)' } : undefined}>
                                  {entry.bio_data_name || entry.client_name || '—'}
                                </span>
                              </td>
                              <td data-label="Associate Name">
                                {entry.sub_name_name
                                  ? <span className="TX-subname-badge">{entry.sub_name_name}</span>
                                  : <span className="ERP-t-null">—</span>}
                              </td>
                              <td data-label="Payment Mode">
                                <span className="TX-pay" style={{ color: chip.color }}>
                                  {entry.payment_mode}
                                </span>
                              </td>
                              <td data-label="CR">
                                {isCr
                                  ? <div className="TX-amount income">₹{Number(entry.amount).toLocaleString('en-IN')}</div>
                                  : <span className="ERP-t-null">—</span>}
                              </td>
                              <td data-label="DR">
                                {!isCr
                                  ? <div className="TX-amount expense">₹{Number(entry.amount).toLocaleString('en-IN')}</div>
                                  : <span className="ERP-t-null">—</span>}
                              </td>
                              <td data-label="Narration">
                                {entry.narration
                                  ? <span className="ERP-t-desc" title={entry.narration}>{entry.narration}</span>
                                  : <span className="ERP-t-null">—</span>}
                              </td>
                              <td data-label="Actions" className="ERP-act-cell">
                                <button className="ERP-act edit" title="Edit" onClick={() => setEditEntry(entry)}>
                                  <Icon name="edit" size={10} color="currentColor" />
                                </button>
                                {canDelete(userRole) ? (
                                  <button className="ERP-act delete" title="Delete" onClick={() => handleDelete(entry.id)}>
                                    <Icon name="trash" size={10} color="currentColor" />
                                  </button>
                                ) : (
                                  <CreatorBadge name={entry.created_by_name} />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Tbody End */}

                      <tfoot>
                        <tr className="TX-sum-row">
                          <td colSpan={12}>
                            <div className="TX-sum-bar">

                              {/* ── This Page (Left Start) ── */}
                              <div className="TX-sum-block">
                                <div className="TX-sum-block-hdr">
                                  <Icon name="list" size={10} color="currentColor" />
                                  <span>This Page</span>
                                  <span className="TX-sum-block-count">{paginated.length} of {filtered.length}</span>
                                </div>
                                <div className="TX-sum-block-vals">
                                  <span className="TX-sum-pill cr"><Icon name="arrowUp" size={8} color="currentColor" />₹{pageStats.income.toLocaleString('en-IN')}</span>
                                  <span className="TX-sum-pill dr"><Icon name="arrowDown" size={8} color="currentColor" />₹{pageStats.expense.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                              {/* This Page (Left End) */}

                              <div className="TX-sum-bar-divider" />

                              {/* ── Selected / filtered total (Right Start) ── */}
                              <div className="TX-sum-block align-right">
                                <div className="TX-sum-block-hdr">
                                  <Icon name="filter" size={10} color="currentColor" />
                                  <span>Selected</span>
                                  <span className="TX-sum-block-count">{filtered.length} records</span>
                                  {isNameMode && (
                                    <span className="TX-sum-tag">{nameBioIds.length} income party DR filter</span>
                                  )}
                                </div>

                                <div className="TX-sum-block-vals">
                                  <span className="TX-sum-pill cr"><Icon name="arrowUp" size={8} color="currentColor" />₹{displayStats.income.toLocaleString('en-IN')}</span>
                                  <span className="TX-sum-pill dr"><Icon name="arrowDown" size={8} color="currentColor" />₹{displayStats.expense.toLocaleString('en-IN')}</span>
                                  <div className={`TX-sum-net${displayStats.balance >= 0 ? ' cr' : ' dr'}`}>
                                    <span className="TX-sum-net-lbl">Net</span>
                                    <span className="TX-sum-net-val">₹{Math.abs(displayStats.balance).toLocaleString('en-IN')} {displayStats.balance >= 0 ? 'CR' : 'DR'}</span>
                                  </div>
                                </div>

                              </div>
                              {/* Selected / Filtered Total ( Right End) */}

                            </div>
                          </td>
                        </tr>
                      </tfoot>

                    </table>
                    {/* Table End */}
                  </div>

                  {totalPages > 1 && (
                    <div className="TX-pagination">
                      <span className="TX-pg-info">
                        <strong>{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</strong>
                        &nbsp;of {filtered.length} records
                        <span className="TX-pg-info-sep">·</span>
                        Page <strong>{page}</strong> of {totalPages}
                      </span>
                      <div className="TX-pg-btns">
                        <button className="TX-pg-btn TX-pg-edge" disabled={page === 1} title="First page" onClick={() => setPage(1)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 17l-5-5 5-5M11 17l-5-5 5-5" /></svg>
                        </button>
                        <button className="TX-pg-btn" disabled={page === 1} title="Previous page" onClick={() => setPage(p => p - 1)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        {(() => {
                          const nodes: React.ReactNode[] = [];
                          const windowSize = 5;
                          let items: (number | '…')[] = [];
                          if (totalPages <= windowSize + 2) {
                            items = Array.from({ length: totalPages }, (_, i) => i + 1);
                          } else {
                            const left = Math.max(2, page - 1);
                            const right = Math.min(totalPages - 1, page + 1);
                            items.push(1);
                            if (left > 2) items.push('…');
                            for (let p = left; p <= right; p++) items.push(p);
                            if (right < totalPages - 1) items.push('…');
                            items.push(totalPages);
                          }
                          items.forEach((it, idx) => {
                            if (it === '…') {
                              nodes.push(<span key={`e${idx}`} className="TX-pg-ellipsis">···</span>);
                            } else {
                              nodes.push(
                                <button key={it} className={`TX-pg-btn TX-pg-num${page === it ? ' on' : ''}`} onClick={() => setPage(it)}>
                                  {it}
                                </button>
                              );
                            }
                          });
                          return nodes;
                        })()}

                        <button className="TX-pg-btn" disabled={page === totalPages} title="Next page" onClick={() => setPage(p => p + 1)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                        <button className="TX-pg-btn TX-pg-edge" disabled={page === totalPages} title="Last page" onClick={() => setPage(totalPages)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17l5-5-5-5M13 17l5-5-5-5" /></svg>
                        </button>
                      </div>
                      <div className="TX-per-pg">
                        <span>Show</span>
                        <select className="TX-per-pg-sel" value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }}>
                          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span>per page</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* ── Table End ── */}
          </>
        )}

        {/* ── Edit Modal Start ── */}
        {editEntry && (
          <EditModal
            entry={editEntry}
            categories={categories}
            subCats={subCats}
            bioData={bioData}
            subNames={subNames}
            onClose={() => setEditEntry(null)}
            onSaved={() => { showMsg('Transaction updated successfully.'); loadEntries(); }}
          />
        )}
        {/* ── Edit Modal Start ── */}

      </div>

      <ConfirmDeleteModal
        open={deleteModal.open}
        itemName="this transaction"
        description="This transaction will be moved to the Recycle Bin. You can restore it anytime."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, id: 0, loading: false })}
        loading={deleteModal.loading}
      />
    </>
  );
}