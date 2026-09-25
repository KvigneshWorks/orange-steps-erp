import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { ERP_CSS } from './ERPTheme';
import { CalendarDD } from '../components/CalendarDD';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import PageOpenIntro from '../components/PageOpenIntro';
import Pagination from '../components/Pagination';
import { getStoredRole, canDelete } from '../utils/roleAccess';
import CreatorBadge from '../components/CreatorBadge';
interface Category { id: number; name: string; type?: 'income' | 'expense'; }
interface SubCategory { id: number; name: string; category_id: number; category_ids?: number[]; }
interface BioData {
    id: number; name: string;
    category_id?: number; sub_category_id?: number; category_name?: string;
}

interface Vendor {
    id: number; bio_data_id: number; client_bio_data_id?: number;
    party_name: string; client_name?: string;
    business_name: string | null; phone: string | null;
    address: string | null; gstin: string | null;
    category_id: number; category_name: string;
    sub_category_id: number | null; sub_category_name: string | null;
    is_active: boolean; total_credit: number; total_paid: number; balance: number;
    status: 'clear' | 'pending' | 'partial' | 'overdue';
    days_overdue: number; last_transaction_date: string | null;
    entry_count: number; payment_count: number;
}

interface CreditEntry {
    id: number; vendor_id: number; client_name?: string | null; credit_date: string;
    bill_number: string | null; description: string | null;
    credit_amount: number; due_date: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes: string | null; amount_paid: number; bill_balance: number;
    is_paid: boolean; is_overdue: boolean; days_overdue: number;
    settled_at?: string | null; closed_at?: string | null;
    created_by_name?: string; created_at?: string;
}

interface CreditPayment {
    id: number; vendor_id: number; client_name?: string | null; payment_date: string;
    amount_paid: number; payment_mode: string; reference: string | null;
    notes: string | null; credit_entry_id: number | null; is_linked: boolean;
    daybook_entry_id?: number | null; bill_number?: string | null;
    bill_description?: string | null; created_by_name?: string; created_at?: string;
}

interface SummaryData {
    total_credit: number; total_paid: number; balance: number;
    total_vendors: number; active_vendors: number;
    overdue_count: number; upcoming_count: number;
}

const STATUS_CONFIG = {
    clear: { label: 'Clear', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    pending: { label: 'Pending', color: '#DB5B1F', bg: '#FDE0CB', border: '#FBC9A8' },
    partial: { label: 'Partial', color: '#DB5B1F', bg: '#FDE0CB', border: '#FDE0CB' },
    overdue: { label: 'Overdue', color: '#D93B55', bg: '#fef2f2', border: '#fecaca' },
};

const PRIORITY_CONFIG = {
    low: { label: 'Low', color: '#8C7C63', bg: '#F5F3EF', border: '#E3DDD3' },
    medium: { label: 'Medium', color: '#DB5B1F', bg: '#FDE0CB', border: '#FBC9A8' },
    high: { label: 'High', color: '#DB5B1F', bg: '#FDE0CB', border: '#FDE0CB' },
    urgent: { label: 'Urgent', color: '#D93B55', bg: '#fef2f2', border: '#fecaca' },
};

const PAYMENT_MODES = ['Cash', 'UPI', 'NEFT', 'Cheque', 'Bank Transfer', 'Others'];
const CREDIT_COLOR = { primary: '#D93B55', light: '#fef2f2', border: '#fecaca', mid: '#D93B55', gradient: 'linear-gradient(135deg, #D93B55, #b91c1c)' };
const PAYMENT_COLOR = { primary: '#A6491D', light: '#FDE0CB', border: '#FBC9A8', mid: '#A6491D', gradient: 'linear-gradient(135deg, #A6491D, #9A3412)' };
const authHeader = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });
const fmt = (n: number) =>
    `₹${Math.round(Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const todayStr = () => new Date().toISOString().split('T')[0];
function apiErrMsg(e: any, fallback: string): string {
    const data = e?.response?.data;
    const errors = data?.errors;
    if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        const firstVal = firstKey ? errors[firstKey] : null;
        const firstMsg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
        if (firstMsg) return String(firstMsg);
    }
    return data?.message || fallback;
}

function vendorColor(name: string) {
    const palette = [
        { bg: '#FDE0CB', color: '#9A3412', border: '#FDE0CB' },
        { bg: '#d1fae5', color: '#1E9C6A', border: '#6ee7b7' },
        { bg: '#FDE0CB', color: '#C2410C', border: '#F0834D' },
        { bg: '#FBC9A8', color: '#db2777', border: '#f9a8d4' },
        { bg: '#FBC9A8', color: '#A6491D', border: '#F0834D' },
        { bg: '#FDE0CB', color: '#A6491D', border: '#D98255' },
    ];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    return palette[Math.abs(h) % palette.length];
}

function AnimCount({ value }: { value: number }) {
    const [disp, setDisp] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);
    const prevRef = useRef(0);
    useEffect(() => {
        const from = prevRef.current, to = value, dur = 900;
        startRef.current = null;
        const step = (ts: number) => {
            if (!startRef.current) startRef.current = ts;
            const p = Math.min((ts - startRef.current) / dur, 1);
            const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            setDisp(Math.round(from + (to - from) * e));
            if (p < 1) rafRef.current = requestAnimationFrame(step);
            else prevRef.current = to;
        };
        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value]);
    return <>{disp.toLocaleString('en-IN')}</>;
}

const P: Record<string, string> = {
    plus: 'M12 5v14m-7-7h14',
    x: 'M6 18L18 6M6 6l12 12',
    check: 'M5 13l4 4L19 7',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    cash: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    warn: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    circle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    up: 'M5 10l7-7m0 0l7 7m-7-7v18',
    down: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    scale: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    sync: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    chevron: 'M19 9l-7 7-7-7',
    receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    arrow: 'M17 8l4 4m0 0l-4 4m4-4H3',
    close: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    client: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
};

const Ic = ({ n, sz = 16, c = 'currentColor' }: { n: string; sz?: number; c?: string }) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={P[n] || P.tag} />
    </svg>
);

interface SDDOpt { value: string; label: string; sub?: string; }
function SDD({
    options, value, onChange, placeholder, disabled = false,
    emptyMsg = 'No options', label, required, accent = 'var(--ember-mid,#DB5B1F)',
}: {
    options: SDDOpt[]; value: string; onChange: (v: string) => void;
    placeholder: string; disabled?: boolean; emptyMsg?: string;
    label?: string; required?: boolean; accent?: string;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [q, setQ] = useState('');
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const inp = useRef<HTMLInputElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(q.toLowerCase()) ||
        (o.sub || '').toLowerCase().includes(q.toLowerCase())
    );
    const sel = options.find(o => o.value === value);

    useEffect(() => {
        if (!open) return;
        const fn = (e: MouseEvent) => {
            const t = e.target as Node;
            if (triggerRef.current?.contains(t)) return;
            if (panelRef.current?.contains(t)) return;
            setOpen(false); setQ('');
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = (e: Event) => {
            if (panelRef.current?.contains(e.target as Node)) return;
            setOpen(false); setQ('');
        };
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
    }, [open]);

    useEffect(() => { if (open && inp.current) setTimeout(() => inp.current?.focus(), 40); }, [open]);

    const computeStyle = () => {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        const mg = 8;
        const ph = panelRef.current?.offsetHeight || Math.min(222, options.length * 28 + 96);
        const spaceBelow = window.innerHeight - r.bottom - mg;
        const spaceAbove = r.top - mg;
        let top: number;
        if (ph <= spaceBelow || spaceBelow >= spaceAbove) {
            top = Math.min(r.bottom + 4, window.innerHeight - ph - mg);
        } else {
            top = r.top - ph - 4;
        }
        top = Math.max(mg, top);
        setPanelStyle({
            position: 'fixed', left: r.left, top, width: r.width, zIndex: 99999,
            maxHeight: window.innerHeight - mg * 2, overflowY: 'auto', borderRadius: 12,
        });
    };

    useLayoutEffect(() => {
        if (!open) return;
        computeStyle();
        const raf = requestAnimationFrame(computeStyle);
        return () => cancelAnimationFrame(raf);
    }, [open]);

    const pick = (v: string) => { onChange(v); setOpen(false); setQ(''); };

    const handleToggle = () => {
        if (disabled) return;
        if (!open) computeStyle();
        setOpen(o => !o);
    };

    const panel = open ? createPortal(
        <div ref={panelRef} className="CM3-sdd-panel" style={panelStyle}>

            <div className="CM3-sdd-search">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text-4,#6B5D48)" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input autoComplete="off" ref={inp} value={q} onChange={e => setQ(e.target.value)} placeholder="Type to search…" className="CM3-sdd-inp" />
                {q && <button onClick={() => { setQ(''); inp.current?.focus(); }} className="CM3-sdd-clr">
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>}
            </div>

            {/* Clear Selection Start */}
            <div className="CM3-sdd-list">
                {value && !q && (
                    <div onClick={() => pick('')} role="option" tabIndex={-1} aria-selected={false} className="CM3-sdd-item CM3-sdd-clear">
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        Clear selection
                    </div>
                )}
                {filtered.length === 0
                    ? <div className="CM3-sdd-empty">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-4,#6B5D48)" strokeWidth={1.5} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <span>{q ? `No results for "${q}"` : emptyMsg}</span>
                    </div>
                    : filtered.map(opt => {
                        const isSel = value === opt.value;
                        return (
                            <div key={opt.value} onClick={() => pick(opt.value)} role="option" tabIndex={-1} aria-selected={isSel} className={`CM3-sdd-item${isSel ? ' selected' : ''}`}>
                                <div className="CM3-sdd-av" style={{ background: isSel ? accent + '20' : 'var(--surface,#F0ECE6)', color: isSel ? accent : 'var(--text-3,#6B5D48)', borderColor: isSel ? accent + '40' : 'transparent' }}>
                                    {opt.label.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="CM3-sdd-item-text">
                                    <div className="CM3-sdd-item-label">{opt.label}</div>
                                    {opt.sub && <div className="CM3-sdd-sub">{opt.sub}</div>}
                                </div>
                                {isSel && <div className="CM3-sdd-check" style={{ color: accent }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg></div>}
                            </div>
                        );
                    })}
            </div>
            {/* Clear Selection End */}

            {/* Footer Start */}
            <div className="CM3-sdd-footer">
                <span>{filtered.length === options.length ? `${options.length} options` : `${filtered.length} of ${options.length}`}</span>
                {value && <span style={{ color: accent, fontWeight: 800 }}>1 selected</span>}
            </div>
            {/* Footer End */}
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
                {label && (
                    <div className="CM3-field-label">
                        {label}{required && <span className="CM3-req">*</span>}
                    </div>
                )}

                {/* Button Start */}
                <button type="button" ref={triggerRef} onClick={handleToggle} onKeyDown={onTriggerKeyDown}
                    className={`CM3-sdd-trigger${open ? ' open' : ''}${sel ? ' has-val' : ''}`}
                    style={{ '--sdd-accent': accent } as React.CSSProperties}>
                    {sel && (
                        <div className="CM3-sdd-trig-av" style={{ background: accent + '18', color: accent, borderColor: accent + '33' }}>
                            {sel.label.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <span className={`CM3-sdd-val${sel ? '' : ' ph'}`}>
                        {sel ? sel.label : placeholder}
                        {sel?.sub && <span className="CM3-sdd-val-sub"> · {sel.sub}</span>}
                    </span>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke={open ? accent : 'var(--text-4,#6B5D48)'} strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none' }}>
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                {/* Button End */}
                {panel}
            </div>
        </>
    );
}

function ClientPicker({ value, onChange, options, placeholder, accent = PAYMENT_COLOR.primary }: {
    value: string; onChange: (v: string) => void;
    options: { label: string; sub?: string }[];
    placeholder?: string; accent?: string;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [q, setQ] = useState('');
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
    const wrapRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useDropdownPanelArrowNav(open, setOpen, panelRef, inputRef);

    const filtered = q.trim()
        ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
        : options;

    useEffect(() => {
        if (!open) return;
        const fn = (e: MouseEvent) => {
            if (panelRef.current?.contains(e.target as Node)) return;
            if (wrapRef.current?.contains(e.target as Node)) return;
            setOpen(false); setQ('');
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = () => { setOpen(false); setQ(''); };
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
    }, [open]);

    const computePanel = () => {
        if (!wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - r.bottom;
        const goAbove = spaceBelow < 220 && r.top > 220;
        setPanelStyle({
            position: 'fixed',
            left: r.left,
            width: r.width,
            zIndex: 99999,
            ...(goAbove
                ? { bottom: window.innerHeight - r.top + 2, borderRadius: '12px 12px 0 0' }
                : { top: r.bottom + 2, borderRadius: '0 0 12px 12px' }),
        });
    };

    const handleFocus = () => { computePanel(); setOpen(true); };
    const pick = (label: string) => { onChange(label); setQ(''); setOpen(false); };
    const clear = () => { onChange(''); setQ(''); inputRef.current?.focus(); };
    const panel = open ? createPortal(
        <div ref={panelRef} style={{ ...panelStyle, background: '#faf9f7', border: `1.5px solid ${accent}30`, boxShadow: '0 8px 28px rgba(0,0,0,0.10)', overflow: 'hidden' }}>

            {/* Search row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: '1px solid #E8E2D8', background: '#F5F3EF' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#8C7C63" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input autoComplete="off"
                    autoFocus
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Search or type any name…"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: 'var(--text-1,#231C14)', fontFamily: 'var(--font-body)' }}
                />
                {q && <button type="button" onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C7C63', display: 'flex', padding: 2, borderRadius: 4 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>}
            </div>
            {/* Search row */}

            {/* List Start */}
            <div style={{ maxHeight: 200, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                {q.trim() && !options.find(o => o.label.toLowerCase() === q.toLowerCase()) && (
                    <div onClick={() => pick(q.trim())} role="option" tabIndex={-1} aria-selected={false}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', borderBottom: '1px solid #F0ECE6', background: '#F5F3EF' }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: accent + '18', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>+</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>Use "{q.trim()}"</div>
                            <div style={{ fontSize: 8.5, color: '#8C7C63', letterSpacing: '0.04em' }}>Save as new client name</div>
                        </div>
                    </div>
                )}
                {filtered.length === 0 && !q.trim() ? (
                    <div style={{ padding: '16px 14px', textAlign: 'center', fontSize: 10.5, color: '#8C7C63' }}>No clients found — type any name above</div>
                ) : filtered.map((opt, i) => {
                    const isSel = value === opt.label;
                    const vc = vendorColor(opt.label);
                    return (
                        <div key={i} onClick={() => pick(opt.label)} role="option" tabIndex={-1} aria-selected={isSel}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', background: isSel ? accent + '08' : undefined, borderBottom: '1px solid #F0ECE6', transition: 'background .1s' }}>
                            <div style={{ width: 26, height: 26, borderRadius: 7, background: vc.bg, color: vc.color, border: `1px solid ${vc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                                {opt.label.slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: isSel ? 800 : 600, color: isSel ? accent : 'var(--text-1,#231C14)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</div>
                                {opt.sub && <div style={{ fontSize: 8.5, color: '#8C7C63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{opt.sub}</div>}
                            </div>
                            {isSel && <svg style={{ color: accent, flexShrink: 0 }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>}
                        </div>
                    );
                })}
            </div>
            {/* List End */}

            {/* Footer Start */}
            <div style={{ padding: '4px 12px', background: '#F5F3EF', borderTop: '1px solid #E8E2D8', fontSize: 8, color: '#8C7C63', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                <span>{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
                {value && <span style={{ color: accent, fontWeight: 800 }}>✓ {value}</span>}
            </div>
            {/* Footer End */}

        </div>,
        document.body
    ) : null;

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                {/* Person Icon Start */}
                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: value ? accent : '#8C7C63' }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                {/* Person Icon End */}

                <input
                    ref={inputRef}
                    type="text"
                    className="CM3-input"
                    value={value}
                    onFocus={handleFocus}
                    onChange={e => { onChange(e.target.value); computePanel(); setOpen(true); }}
                    placeholder={placeholder || 'Search or type client / site name…'}
                    autoComplete="off"
                    style={{ paddingLeft: 32, paddingRight: value ? 32 : 12, borderColor: open ? accent : undefined, boxShadow: open ? `0 0 0 3px ${accent}18` : undefined, transition: 'border-color .18s, box-shadow .18s' }}
                />

                {/* Clear Button Start */}
                {value && (
                    <button type="button" onClick={clear}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8C7C63', display: 'flex', padding: 3, borderRadius: 4 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                )}
                {/* Clear Button End */}
            </div>
            {panel}
        </div>
    );
}

// Css for Credit Management Page Start
const CSS = `
/* ── PAGE ── */
.CM3-page {
    font-family: var(--font-body, 'Space Grotesk', sans-serif);
    background: var(--surface, #F0ECE6);
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
    background: rgba(166,73,29,0.08); border: 1px solid rgba(166,73,29,0.2);
    border-radius: 100px;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 8px; font-weight: 800;
    color: #A6491D; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s;
}
.CM3-sync-pill:hover { background: rgba(166,73,29,0.14); transform: translateY(-1px); }
.CM3-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: #A6491D; animation: erp-pulse-dot 2s ease-in-out infinite; }

/* ── STAT CARDS ── */
.CM3-stat {
    background: var(--white,#faf9f7);
    border: 1px solid var(--border,#D2C7B8);
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
    background: var(--glow, rgba(194,65,12,0.07));
    transition: transform 0.3s;
}
.CM3-stat:hover .CM3-stat-glow { transform: scale(1.3); }

.CM3-stat-icon {
    width: 36px; height: 36px; border-radius: var(--r-md,10px);
    background: var(--icon-bg, var(--ember-ghost,rgba(219,91,31,0.10)));
    border: 1px solid var(--icon-border, var(--ember-border,rgba(154,52,18,0.28)));
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    position: relative; z-index: 1;
    transition: transform 0.2s;
}
.CM3-stat:hover .CM3-stat-icon { transform: scale(1.08) rotate(-3deg); }

.CM3-stat-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 8px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--text-4, #8C7C63); margin-bottom: 6px;
    position: relative; z-index: 1;
}
.CM3-stat-val {
    font-family: var(--font-body, 'Space Grotesk', sans-serif);
    font-size: 28px; font-style: normal; font-weight: 800;
    letter-spacing: -1px; line-height: 1;
    color: var(--val-color, #3A3024);
    position: relative; z-index: 1;
}
.CM3-stat-foot { font-size: 9px; color: var(--text-4, #8C7C63); margin-top: 6px; }
.DB-stat-delta { display:flex; align-items:center; gap:5px; margin-top:5px; font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--text-4); letter-spacing:0.5px; }
/* ── Open Ledger Account button ── */
.CM3-add-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; background:var(--ember,#C2410C); color:#faf9f7; border:none; border-radius:8px; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:.5px; text-transform:uppercase; cursor:pointer; transition:background .18s,transform .15s; white-space:nowrap; }
.CM3-add-btn:hover { background:var(--ember-dark,#9A3412); transform:translateY(-1px); }
/* ── Main detail panel ── */
.CM3-main { overflow-y:auto; background:var(--white,#faf9f7); height:100%; }
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
    border: 1.5px solid var(--border, #E8E2D8);
    border-radius: 16px;
    overflow: hidden;
    background: var(--white, #faf9f7);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    animation: erp-slide-up 0.45s 0.1s cubic-bezier(0.22,1,0.36,1) both;
}
@media(max-width:1024px){ .CM3-body{grid-template-columns:1fr; min-height:auto} }

/* ── SIDEBAR ── */
/* ══ SIDEBAR REDESIGN ═══════════════════════════════════════════════ */
.CM3-sidebar {
  border-right: 1.5px solid var(--border,#E8E2D8);
  display: flex; flex-direction: column;
  background: #F5F3EF; overflow: hidden; height: 100%;
}

/* ── Sidebar Hero Header ── */
.CM3-sb-hero {
  padding: 14px 14px 10px;
  background: linear-gradient(135deg,#FBC9A8 0%,#faf9f7 100%);
  border-bottom: 1px solid var(--border,#E8E2D8);
  position: relative; overflow: hidden;
}
.CM3-sb-hero::before {
  content:''; position:absolute; right:-20px; top:-20px;
  width:80px; height:80px; border-radius:50%;
  background: radial-gradient(circle, rgba(154,52,18,0.07), transparent 70%);
  pointer-events:none;
}
.CM3-sb-eyebrow {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--ember,#C2410C); display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
}
.CM3-sb-eyebrow-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--ember,#C2410C);
  animation: sb-dot-pulse 2s ease-in-out infinite;
}
@keyframes sb-dot-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.5; transform:scale(0.7); }
}
.CM3-sb-title {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 13px; font-weight: 800; color: var(--text-1,#231C14);
  text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 8px;
}

/* ── Search box ── */
.CM3-search {
  display: flex; align-items: center; gap: 7px; padding: 8px 11px;
  background: #faf9f7; border: 1.5px solid var(--border,#E8E2D8);
  border-radius: 10px; transition: border-color 0.15s, box-shadow 0.15s;
}
.CM3-search:focus-within {
  border-color: var(--ember,#C2410C);
  box-shadow: 0 0 0 3px rgba(154,52,18,0.08);
}
.CM3-search input {
  flex: 1; border: none; outline: none; font-size: 9.5px;
  color: var(--text-1,#231C14); background: transparent;
}
.CM3-search input::placeholder { color: var(--text-4,#6B5D48); }
.CM3-alloc-search-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; position: sticky; top: 0; z-index: 1; }
.CM3-alloc-search { box-shadow: 0 4px 10px rgba(0,0,0,0.03); flex: 1; margin-bottom: 0 !important; }
.CM3-alloc-client-count {
  flex-shrink: 0; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.4px; color: #9A3412; background: #FDE0CB; border: 1px solid #FBC9A8;
  border-radius: 100px; padding: 6px 12px; white-space: nowrap;
  animation: cm3-chip-pop 0.22s ease both;
}

/* ── Add vendor button ── */
.CM3-add-btn {
  margin: 10px 12px 0; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px; background: linear-gradient(135deg,#C2410C,#DB5B1F);
  color: #faf9f7; border: none; border-radius: 10px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8.5px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; transition: all 0.22s;
  box-shadow: 0 4px 16px rgba(154,52,18,0.28);
  position: relative; overflow: hidden;
}
.CM3-add-btn::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  pointer-events:none;
}
.CM3-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(154,52,18,0.4); }
.CM3-add-btn:active { transform: translateY(0); }

/* ── Filter chips bar ── */
.CM3-filters {
  display: flex; gap: 4px; flex-wrap: wrap;
  padding: 8px 12px; border-bottom: 1px solid var(--border,#E8E2D8);
  background: #F0ECE6;
}
.CM3-chip {
  padding: 3px 9px; border-radius: 100px; border: 1.5px solid var(--border,#E8E2D8);
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; background: #faf9f7; color: var(--text-4,#6B5D48);
  transition: all 0.15s;
}
.CM3-chip:hover { border-color: #FBC9A8; color: #C2410C; background: #FBC9A8; }
.CM3-chip.on { background: #FBC9A8; border-color: #FBC9A8; color: #C2410C; font-weight: 800; }

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
  font-size: 8px; font-weight: 800; color: var(--ember,#C2410C);
  background: #FBC9A8; padding: 1px 7px; border-radius: 100px;
  border: 1px solid #FBC9A8;
}

/* ── Vendor list scroll ── */
.CM3-vlist { flex: 1; overflow-y: auto; padding: 4px 0; }
.CM3-vlist::-webkit-scrollbar { width: 4px; }
.CM3-vlist::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius: 2px; }

/* ── Category drill-down (sidebar) ── */
.CM3-catcard {
  margin: 4px 10px; border-radius: 12px;
  border: 1.5px solid var(--border,#E8E2D8);
  background: #faf9f7; cursor: pointer;
  display: flex; align-items: center; gap: 10px; padding: 11px 12px;
  transition: all 0.18s; position: relative; overflow: hidden;
  animation: vc-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
}
.CM3-catcard:hover {
  border-color: #FBC9A8;
  box-shadow: 0 4px 16px rgba(154,52,18,0.1);
  transform: translateX(2px);
}
.CM3-catcard:hover .CM3-vcard-accent { opacity: 1; }
.CM3-catcard-icon {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #FBC9A8; border: 1.5px solid #FBC9A8;
}
.CM3-catcard-info { flex: 1; min-width: 0; }
.CM3-catcard-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#231C14);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.CM3-catcard-sub {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 700; color: #3A3024; margin-top: 2px; letter-spacing: 0.4px;
}
.CM3-catcard-chev { color: var(--text-4,#6B5D48); flex-shrink: 0; transition: transform 0.18s, color 0.18s; }
.CM3-catcard:hover .CM3-catcard-chev { color: var(--ember,#C2410C); transform: translateX(2px); }

/* Back-to-categories breadcrumb (shown when a category is drilled into) */
.CM3-cat-back {
  display: flex; align-items: center; gap: 8px; width: calc(100% - 20px);
  margin: 2px 10px 8px; padding: 8px 10px; border-radius: 10px;
  border: 1.5px dashed var(--border,#E8E2D8); background: #faf9f7;
  cursor: pointer; transition: all 0.15s;
}
.CM3-cat-back:hover { border-color: #FBC9A8; background: #FBC9A8; }
.CM3-cat-back:hover .CM3-cat-back-name { color: #C2410C; }
.CM3-cat-back svg { flex-shrink: 0; color: var(--text-3,#6B5D48); }
.CM3-cat-back:hover svg { color: #C2410C; }
.CM3-cat-back-name {
  flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 9.5px;
  color: var(--text-1,#231C14); transition: color 0.15s;
}
.CM3-cat-back-count {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; color: var(--ember,#C2410C);
  background: #FBC9A8; padding: 1px 7px; border-radius: 100px; border: 1px solid #FBC9A8;
  flex-shrink: 0;
}

/* ── Category summary (shown in the right/main panel the instant a
   category is touched, before any single ledger is opened) ── */
.CM3-catsum { padding: 22px 26px 30px; height: 100%; overflow-y: auto; }
.CM3-catsum-hdr { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.CM3-catsum-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(154,52,18,0.09); border: 1.5px solid rgba(154,52,18,0.18);
}
.CM3-catsum-eyebrow {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--ember,#C2410C); margin-bottom: 2px;
}
.CM3-catsum-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 16.5px; color: var(--text-1,#231C14); text-transform: uppercase; letter-spacing: 0.3px; }
.CM3-catsum-sub { font-size: 9px; font-weight: 700; color: var(--text-4,#6B5D48); margin-top: 2px; }
.CM3-catsum-stats {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px;
}
@media (max-width: 640px) { .CM3-catsum-stats { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 420px) { .CM3-catsum-stats { grid-template-columns: 1fr; } }
.CM3-catsum-stat {
  border: 1.5px solid var(--border,#E8E2D8); border-radius: 12px; background: var(--white,#faf9f7);
  padding: 13px 15px;
}
.CM3-catsum-stat-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--text-4,#8C7C63);
  display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
}
.CM3-catsum-stat-val { font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 16px; }
.CM3-catsum-stat-val.credit-color { color: #D93B55; }
.CM3-catsum-stat-val.payment-color { color: #A6491D; }
.CM3-catsum-stat-val.balance-color { color: #9A3412; }
.CM3-catsum-listhdr {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  letter-spacing: 1.6px; text-transform: uppercase; color: var(--text-3,#6B5D48); margin-bottom: 10px;
}
.CM3-catsum-list { display: flex; flex-direction: column; gap: 8px; }
.CM3-catsum-row {
  display: flex; align-items: center; gap: 12px;
  border: 1.5px solid var(--border,#E8E2D8); border-radius: 12px; background: var(--white,#faf9f7);
  padding: 11px 14px; cursor: pointer; transition: all 0.15s;
}
.CM3-catsum-row:hover { border-color: #FBC9A8; background: #FBC9A8; transform: translateX(2px); }
.CM3-catsum-row-info { flex: 1; min-width: 0; }
.CM3-catsum-row-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 9.5px;
  color: #A6491D; text-transform: uppercase; letter-spacing: 0.2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.CM3-catsum-row-meta {
  display: flex; align-items: center; gap: 5px; font-size: 8.5px; font-weight: 700;
  color: var(--text-4,#6B5D48); margin-top: 2px;
}
.CM3-catsum-row-amt { text-align: right; flex-shrink: 0; }
.CM3-catsum-row-bal { display: block; font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 11.5px; color: #9A3412; }
.CM3-catsum-row-bal-lbl { display: block; font-size: 7.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--text-4,#6B5D48); margin-top: 1px; }

/* ── Vendor card (new design) ── */
.CM3-vcard {
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
.CM3-vcard:hover {
  border-color: #FBC9A8;
  box-shadow: 0 4px 16px rgba(154,52,18,0.1);
  transform: translateX(2px);
}
.CM3-vcard.active {
  border-color: var(--ember,#C2410C);
  background: #FBC9A8;
  box-shadow: 0 4px 20px rgba(154,52,18,0.15);
  transform: translateX(3px);
}
.CM3-vcard-accent {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg,#C2410C,#DB5B1F);
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
.CM3-vcard.active .CM3-vavatar { transform: scale(1.08); box-shadow: 0 4px 14px rgba(154,52,18,0.22); }

.CM3-vcard-info { flex: 1; min-width: 0; }
.CM3-vname {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 9.5px; font-weight: 800; color: #A6491D; text-transform: uppercase; letter-spacing: 0.2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.CM3-vmeta {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 700; color: #3A3024; margin-top: 2px;
  display: flex; align-items: center; gap: 4px; letter-spacing: 0.5px;
}
.CM3-vmeta-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}
.CM3-vclient {
  font-size: 8.5px; color: #A6491D; margin-top: 2px; font-weight: 700;
  display: flex; align-items: center; gap: 3px;
}

/* balance + mini bar */
.CM3-vcard-foot {
  padding: 0 12px 9px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.CM3-vcard-bar-wrap { flex: 1; height: 3px; border-radius: 100px; background: #F0ECE6; overflow: hidden; }
.CM3-vcard-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg,#C2410C,#DB5B1F);
  transition: width 1s cubic-bezier(0.4,0,0.2,1);
}
.CM3-vbal-new {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 900; white-space: nowrap; flex-shrink: 0;
}
.CM3-vbal-new.red  { color: #D93B55; }
.CM3-vbal-new.grey { color: var(--text-4,#6B5D48); }

/* ERP-stat grid spacing */
.CM3-page .ERP-stats { margin-bottom: 20px; }
.CM3-vitem-actions { display:none; }
.CM3-vitm-btn { display:none; }

/* ── DETAIL PANEL ── */
.CM3-detail { display: flex; flex-direction: column; overflow: hidden; background: var(--white,#faf9f7); }

.CM3-welcome {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    flex: 1; gap: 14px; padding: 60px; text-align: center;
    animation: erp-fade-in 0.4s ease both;
}
.CM3-welcome-icon {
    width: 76px; height: 76px; border-radius: 22px;
    background: #FDE0CB; border: 2px solid #FDE0CB;
    display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
    animation: cm3-welcome-float 3s ease-in-out infinite;
}
@keyframes cm3-welcome-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.CM3-welcome-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; text-transform: uppercase; letter-spacing: 0.4px; font-size: 17.5px; font-weight: 800; color: var(--text-1,#231C14); }
.CM3-welcome-sub { font-size: 9.5px; color: var(--text-4,#6B5D48); max-width: 300px; line-height: 1.6; }

/* ── VENDOR HEADER — light style ── */
.CM3-vhdr {
    background: linear-gradient(135deg, #F5F3EF 0%, #fef9ed 100%);
    padding: 20px 24px;
    border-bottom: 1.5px solid var(--ember-border,#D98255);
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
.CM3-vhdr-name { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 16.5px; font-weight: 900; font-style: normal; color: #A6491D; text-transform: uppercase; letter-spacing: 0.3px; text-shadow: 0 1px 0 rgba(255,255,255,.4); }
.CM3-vhdr-cat { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; color: #3A3024; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
.CM3-vhdr-client-strip {
    display: flex; align-items: center; gap: 6px; margin-top: 6px;
    padding: 4px 10px; background: rgba(166,73,29,0.08);
    border: 1px solid rgba(166,73,29,0.2); border-radius: 6px; width: fit-content;
}
.CM3-vhdr-client-label { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #A6491D; }
.CM3-vhdr-client-name { font-size: 9px; font-weight: 800; color: #9A3412; }
.CM3-vhdr-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ── ACTION BUTTONS ── */
.CM3-act {
    display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--r-md,10px);
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 8px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; border: none; transition: all 0.18s;
}
.CM3-act.credit { background: ${CREDIT_COLOR.gradient}; color: #faf9f7; box-shadow: 0 3px 10px rgba(220,38,38,0.25); }
.CM3-act.credit:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(220,38,38,0.35); }
.CM3-act.payment { background: ${PAYMENT_COLOR.gradient}; color: #faf9f7; box-shadow: 0 3px 10px rgba(166,73,29,0.25); }
.CM3-act.payment:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(166,73,29,0.35); }
.CM3-act.payment:disabled { background: #E3DDD3; color: #8C7C63; box-shadow: none; cursor: not-allowed; transform: none; }
.CM3-act.ghost {
    background: var(--white,#faf9f7); color: var(--text-2,#3A3024);
    border: 1.5px solid var(--border,#E8E2D8);
}
.CM3-act.ghost:hover { border-color: var(--ember-border,#D98255); background: var(--off-white,#F5F3EF); transform: translateY(-1px); }

/* ── BAL STRIP — light tones ── */
.CM3-bal-strip { display: grid; grid-template-columns: repeat(3,1fr); border-bottom: 1.5px solid var(--border,#E8E2D8); }
@media (max-width: 480px) { .CM3-bal-strip { grid-template-columns: 1fr; } }
.CM3-bal-cell { padding: 14px 20px; border-right: 1px solid var(--border,#E8E2D8); background: var(--white,#faf9f7); }
.CM3-bal-cell:last-child { border-right: none; }
.CM3-bal-lbl { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #524532; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
.CM3-bal-val { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; font-size: 16.5px; font-weight: 900; }
.CM3-bal-val.credit-color { color: #D93B55; }
.CM3-bal-val.payment-color { color: #A6491D; }
.CM3-bal-val.balance-color { color: #9A3412; }

.CM3-client-cell {
    grid-column: 1/-1; padding: 8px 20px;
    background: rgba(166,73,29,0.05);
    border-bottom: 1px solid rgba(166,73,29,0.15);
    display: flex; align-items: center; gap: 8px;
}
.CM3-client-cell-lbl { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #A6491D; }
.CM3-client-cell-name { font-size: 9.5px; font-weight: 800; color: #9A3412; }

/* ── PROGRESS ── */
.CM3-prog { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: var(--off-white,#F5F3EF); border-bottom: 1px solid var(--border,#E8E2D8); }
.CM3-prog-bar { flex: 1; height: 5px; background: var(--border,#E8E2D8); border-radius: 100px; overflow: hidden; }
.CM3-prog-fill { height: 100%; background: ${PAYMENT_COLOR.gradient}; border-radius: 100px; transition: width 0.9s ease; }
.CM3-prog-txt { font-size: 9px; font-weight: 800; color: #9A3412; }

/* ── TABS ── */
.CM3-tabs-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: var(--white,#faf9f7); border-bottom: 1.5px solid var(--border,#E8E2D8); }
.CM3-tabs { display: flex; gap: 0; }
.CM3-tab {
    padding: 14px 18px;
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 8px; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; color: #524532;
    cursor: pointer; border: none; background: transparent;
    border-bottom: 2.5px solid transparent; transition: all 0.15s; white-space: nowrap;
}
.CM3-tab:hover { color: #231C14; }
.CM3-tab.credit-tab.on { color: #D93B55; border-bottom-color: #D93B55; }
.CM3-tab.payment-tab.on { color: #A6491D; border-bottom-color: #A6491D; }
.CM3-tab.tl-tab.on { color: #9A3412; border-bottom-color: #9A3412; }
.CM3-tab-add {
    display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: var(--r-md,10px);
    border: 1.5px solid; font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 8px; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; cursor: pointer; transition: all 0.15s; background: transparent;
}
.CM3-tab-add.credit { color: #D93B55; border-color: #fecaca; }
.CM3-tab-add.credit:hover { background: #fef2f2; }
.CM3-tab-add.payment { color: #A6491D; border-color: #FBC9A8; }
.CM3-tab-add.payment:hover { background: #FDE0CB; }

/* ── CONTENT ── */
.CM3-content { flex: 1; overflow-y: auto; padding: 12px; background: var(--surface,#F0ECE6); display: flex; flex-direction: column; }
.CM3-content::-webkit-scrollbar { width: 5px; }
.CM3-content::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius: 3px; }

/* ── ENTRY CARDS ── */
/* ── NEW BILL CARDS ── */
/* ══ BILL CARDS: Professional 4-col grid ══════════════════════════ */
.CM3-bc {
  display: grid;
  grid-template-columns: 62px 1fr auto 32px;
  border-radius: 11px; overflow: hidden;
  border: 1px solid var(--border,#E8E2D8);
  background: #faf9f7;
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
.CM3-bc.bc-neardue { border-color: #FDE0CB; }
.CM3-bc.bc-ok { border-color: var(--border,#E8E2D8); }
.CM3-bc.bc-closed { background: #F5F3EF; border-color: #E3DDD3; opacity: 0.84; }

/* ── SETTLED DATE STAMP ── */
.CM3-bc-settled-stamp {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 9px 12px; gap: 3px; flex-shrink: 0;
  min-width: 130px; border-left: 1px solid #d1fae5;
  background: linear-gradient(160deg,#f0fdf4,#FAF9F7);
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
  border-right: 1px solid var(--border,#E8E2D8);
  background: linear-gradient(160deg, #FBC9A8 0%, #faf9f7 100%);
  position: relative; overflow: hidden;
}
.CM3-bc-left::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, #C2410C, #DB5B1F);
}
.CM3-bc.bc-overdue .CM3-bc-left { background: linear-gradient(160deg,#fef2f2,#faf9f7); }
.CM3-bc.bc-overdue .CM3-bc-left::before { background: linear-gradient(180deg,#D93B55,#f87171); }
.CM3-bc.bc-neardue .CM3-bc-left { background: linear-gradient(160deg,#FDE0CB,#faf9f7); }
.CM3-bc.bc-neardue .CM3-bc-left::before { background: linear-gradient(180deg,#DB5B1F,#F0834D); }
.CM3-bc.bc-closed .CM3-bc-left { background: linear-gradient(160deg,#f0fdf4,#F5F3EF); }
.CM3-bc.bc-closed .CM3-bc-left::before { background: linear-gradient(180deg,#10b981,#34d399); }

.CM3-bc-num-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 6px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--text-4); line-height: 1;
}
.CM3-bc-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 900; color: var(--ember,#C2410C);
  line-height: 1; letter-spacing: -1px;
}
.CM3-bc.bc-overdue .CM3-bc-num { color: #D93B55; }
.CM3-bc.bc-neardue .CM3-bc-num { color: #9A3412; }
.CM3-bc.bc-closed .CM3-bc-num { color: #1E9C6A; }

.CM3-bc-icon-ring {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(154,52,18,0.08); border: 1.5px solid rgba(154,52,18,0.18);
  display: flex; align-items: center; justify-content: center; margin-top: 2px;
  transition: transform 0.2s;
}
.CM3-bc:hover .CM3-bc-icon-ring { transform: scale(1.12); }
.CM3-bc.bc-overdue .CM3-bc-icon-ring { background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.25); }
.CM3-bc.bc-neardue .CM3-bc-icon-ring { background:rgba(154,52,18,0.1); border-color:rgba(154,52,18,0.25); }
.CM3-bc.bc-closed .CM3-bc-icon-ring { background:rgba(5,150,105,0.08); border-color:rgba(5,150,105,0.2); }

/* ── CENTER BODY ── */
.CM3-bc-body {
  padding: 9px 12px; display: flex; flex-direction: column;
  gap: 3px; min-width: 0; justify-content: center;
}
.CM3-bc-row1 { display: flex; align-items: center; gap: 6px; min-width: 0; }
.CM3-bc-vendor {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 10px; font-weight: 800; color: var(--text-1,#231C14);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;
}
.CM3-bc.bc-closed .CM3-bc-vendor { color: var(--text-3,#524532); }
.CM3-bc-ref {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800;
  color: #524532; background: #F0ECE6; padding: 1.5px 5px;
  border-radius: 4px; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;
}
.CM3-bc-row2 {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.CM3-bc-desc { font-size: 9px; color: var(--text-4,#6B5D48); }
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
.CM3-bc-chip.date   { color:var(--text-4); background:var(--off-white,#F0ECE6); border-color:var(--border); }
.CM3-bc-chip.p-high { color:#D93B55; background:#fef2f2; border-color:#fca5a5; }
.CM3-bc-chip.p-medium { color:#9A3412; background:#FDE0CB; border-color:#FDE0CB; }
.CM3-bc-chip.p-low  { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }
.CM3-bc-chip.due-overdue { color:#D93B55; background:#fef2f2; border-color:#fca5a5; animation: cm3-pulse-red 2s infinite; }
.CM3-bc-chip.due-near   { color:#9A3412; background:#FDE0CB; border-color:#FDE0CB; }
.CM3-bc-chip.due-ok     { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }
.CM3-bc-chip.note       { color:#A6491D; background:#FDE0CB; border-color:#FBC9A8; }
.CM3-bc-chip.client     { color:#A6491D; background:#FDE0CB; border-color:#FBC9A8; }
.CM3-bc-chip.settled    { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }

/* ── RIGHT AMOUNT PANEL ── */
.CM3-bc-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 9px 12px; gap: 4px; flex-shrink: 0;
  min-width: 140px; border-left: 1px solid var(--border,#E8E2D8);
}
.CM3-bc-amt {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 14px; font-weight: 800; font-style: normal;
  color: #D93B55; line-height: 1;
}
.CM3-bc.bc-closed .CM3-bc-amt { color: #6B5D48; font-size: 13px; }
.CM3-bc-status {
  font-family: var(--font-mono); font-size: 7px; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 2px 8px; border-radius: 100px; border: 1px solid;
}
.CM3-bc-status.open   { color:#C2410C; background:#FBC9A8; border-color:#FBC9A8; }
.CM3-bc-status.closed { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }

.CM3-bc-mini-bar {
  width: 100%; height: 4px; border-radius: 100px; background: #F0ECE6;
  overflow: hidden; position: relative;
}
.CM3-bc-mini-fill {
  position: absolute; left: 0; top: 0; height: 100%;
  background: linear-gradient(90deg, #C2410C, #DB5B1F);
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 4px rgba(154,52,18,0.3);
}
.CM3-bc-bal-row {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; gap: 4px;
}
.CM3-bc-total-lbl { font-family:var(--font-mono); font-size: 8px; color:#C2410C; font-weight: 800; }
.CM3-bc-bal-lbl   { font-family:var(--font-mono); font-size: 8px; color:#D93B55;  font-weight: 800; }

/* ── ACTION COLUMN ── */
.CM3-bc-acts {
  display: flex; flex-direction: column; flex-shrink: 0;
  border-left: 1px solid var(--border,#E8E2D8); align-self: stretch; width: 32px;
}
.CM3-bc-act {
  flex: 1; background: none; border: none; cursor: pointer;
  color: var(--text-4,#6B5D48);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.14s, color 0.14s;
}
.CM3-bc-act + .CM3-bc-act { border-top: 1px solid var(--border,#E8E2D8); }
.CM3-bc-act.edit:hover { background: #FDE0CB; color: #DB5B1F; }
.CM3-bc-act.del:hover  { background: #fef2f2; color: #D93B55; }

/* ══ BILLS TABLE (compact, professional, light theme, responsive — no row-select) ══ */
.CM3-billtbl-wrap {
  overflow-y: auto; overflow-x: hidden; flex: 1; min-height: 340px; width: 100%;
  border: 1.5px solid var(--border,#E8E2D8); border-radius: 14px;
  background: #faf9f7; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
}
.CM3-billtbl-wrap > table { flex-shrink: 0; }
.CM3-billtbl-wrap::-webkit-scrollbar { width: 6px; height: 5px; }
.CM3-billtbl-wrap::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius: 3px; }
.CM3-billtbl-wrap::-webkit-scrollbar-thumb:hover { background: #FBC9A8; }
/* table-layout:fixed + fixed % column widths means content wraps instead of
   overflowing, so the wrap never needs a horizontal scrollbar at any width. */
.CM3-billtbl { width: 100%; table-layout: fixed; border-collapse: collapse; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9.5px; }
.CM3-billtbl col.c-sno { width: 5%; }
.CM3-billtbl col.c-client { width: 19%; } .CM3-billtbl col.c-date { width: 9%; }
.CM3-billtbl col.c-credit { width: 13%; } .CM3-billtbl col.c-paid { width: 12%; }
.CM3-billtbl col.c-balance { width: 13%; } .CM3-billtbl col.c-status { width: 15%; }
.CM3-billtbl col.c-acts { width: 14%; }
.CM3-billtbl thead th {
  /* Same header language as every other table in the app (.ERP-tbl):
     light surface, dark uppercase mono-weight text, ember underline —
     instead of this table's previous solid-orange/white-text header. */
  background: var(--surface-2,#E8E2D8); color: var(--text-3,#524532);
  font-size: 8px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;
  padding: 11px 9px; text-align: left; white-space: nowrap;
  border-bottom: 2px solid var(--ember,#C2410C);
  position: sticky; top: 0; z-index: 2;
}
.CM3-billtbl thead th:first-child { border-top-left-radius: 12px; }
.CM3-billtbl thead th:last-child { border-top-right-radius: 12px; }
.CM3-billtbl tbody td {
  padding: 10px 9px; border-bottom: 1px solid var(--border,#E8E2D8);
  vertical-align: middle; color: #231C14; font-weight: 800;
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
.CM3-billtbl tbody tr:nth-child(even) td { background: var(--surface,#F5F3EF); }
.CM3-billtbl tbody tr:last-child td { border-bottom: none; }
.CM3-billtbl tbody tr:hover td { background: var(--ember-ghost,#FBC9A8); }
/* Was: box-shadow: inset 3px 0 0 ... on every <td> in the row — an inset
   shadow is per-cell, so that drew a thin blue line down the LEFT edge of
   every single column, not just the row's own left edge, which is what
   showed up as the row being carved into vertical stripes on hover. Kept
   the row highlight, dropped the stray lines. */
.CM3-billtbl tbody tr.row-closed { opacity: 0.6; }
.CM3-billtbl tbody tr.row-closed:hover td { opacity: 1; background: #F5F3EF; }
@media (max-width: 720px) {
    .CM3-billtbl, .CM3-billtbl thead th, .CM3-billtbl tbody td { font-size: 8px; }
    .CM3-billtbl thead th, .CM3-billtbl tbody td { padding: 7px 5px; }
    .CM3-billtbl-status { font-size: 7.5px; padding: 3px 6px; }
}

/* S.No badge — small numbered pill instead of plain text */
.CM3-billtbl-sno {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; height: 22px; padding: 0 6px; border-radius: 7px;
  background: var(--ember-ghost, #fff1e6); border: 1px solid #FBC9A8;
  color: #C2410C; font-weight: 800; font-size: 9px; letter-spacing: 0.2px;
}
.CM3-billtbl-num { color: var(--text-3,#524532); font-weight: 800; }
.CM3-billtbl-client { color: #C2410C; font-weight: 800; }
.CM3-billtbl-ref {
  display: inline-block; font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 800; color: #231C14;
  background: var(--surface,#F0ECE6); border: 1px solid var(--border,#E8E2D8);
  border-radius: 5px; padding: 1.5px 7px;
}
.CM3-billtbl-amt { font-weight: 800; white-space: nowrap; }
.CM3-billtbl-amt.due { color: #D93B55; }
.CM3-billtbl-amt.paid { color: #1E9C6A; }

/* Priority — plain colored text, no dot/icon */
.CM3-billtbl-priority { font-size: 8.5px; font-weight: 800; text-transform: capitalize; letter-spacing: 0.2px; }
.CM3-billtbl-priority.high   { color: #D93B55; }
.CM3-billtbl-priority.medium { color: #9A3412; }
.CM3-billtbl-priority.low    { color: #524532; }

/* Status — plain colored text, no pill/badge chrome */
.CM3-billtbl-status {
  font-size: 8.5px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase;
  white-space: normal; line-height: 1.3;
}
.CM3-billtbl-status.open    { color: #C2410C; }
.CM3-billtbl-status.overdue { color: #D93B55; }
.CM3-billtbl-status.near    { color: #9A3412; }
.CM3-billtbl-status.closed  { color: #1E9C6A; }
.CM3-billtbl-acts { display: flex; gap: 5px; justify-content: flex-end; overflow: hidden; }
/* Compact override for this one narrow table cell only — the shared
   .ERP-tbtn style (used identically everywhere else) is untouched;
   this class just tightens the padding/font so Edit+Delete fit inside
   the Actions column instead of spilling into Status next to it. */
.CM3-billtbl-acts .ERP-tbtn { padding: 5px 9px; font-size: 8px; }
.CM3-billtbl-acts .ERP-tbtn + .ERP-tbtn { margin-left: 0; }

/* Custom checkbox to match theme (used in header + row checks) */
.CM3-billtbl-cb {
  width: 15px; height: 15px; border-radius: 4px; flex-shrink: 0;
  border: 1.5px solid var(--border,#E8E2D8); appearance: none; -webkit-appearance: none;
  background: #faf9f7; cursor: pointer; position: relative; transition: all 0.15s; vertical-align: middle;
}
.CM3-billtbl-cb:hover { border-color: #FBC9A8; }
.CM3-billtbl-cb:checked { background: linear-gradient(135deg,#C2410C,#DB5B1F); border-color: #C2410C; }
.CM3-billtbl-cb:checked::after {
  content: ''; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px;
  border: solid #faf9f7; border-width: 0 2px 2px 0; transform: rotate(45deg);
}
thead .CM3-billtbl-cb { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.12); }
thead .CM3-billtbl-cb:checked { background: #faf9f7; border-color: #faf9f7; }
thead .CM3-billtbl-cb:checked::after { border-color: #C2410C; }

/* ══ REPAYMENT CARDS ════════════════════════════════════════════════ */
.CM3-pm-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 6px;
  border-bottom: 1px solid var(--border,#E8E2D8);
  background: linear-gradient(90deg,#FDE0CB,#faf9f7);
  margin-bottom: 4px;
}
.CM3-pm-hdr-title {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7.5px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
  color: #A6491D; display: flex; align-items: center; gap: 5px;
}
.CM3-pm-hdr-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #A6491D;
  animation: sb-dot-pulse 2s ease-in-out infinite;
}
.CM3-pm-hdr-total {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 800; color: #A6491D;
}

.CM3-pmc {
  display: grid;
  grid-template-columns: 58px 1fr auto 32px;
  border-radius: 11px; overflow: hidden;
  border: 1px solid var(--border,#E8E2D8);
  background: #faf9f7; margin-bottom: 6px;
  transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
  animation: bc-in 0.32s cubic-bezier(0.4,0,0.2,1) both;
}
.CM3-pmc:hover {
  border-color: #FBC9A8;
  box-shadow: 0 4px 18px rgba(166,73,29,0.12);
  transform: translateY(-1px);
}

/* Left teal panel */
.CM3-pmc-left {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px 4px; gap: 4px;
  border-right: 1px solid var(--border,#E8E2D8);
  background: linear-gradient(160deg,#FDE0CB 0%,#faf9f7 100%);
  position: relative; overflow: hidden;
}
.CM3-pmc-left::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
  background: linear-gradient(180deg,#A6491D,#A6491D);
}
.CM3-pmc-num-lbl {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 6px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
  color: #A6491D; line-height: 1;
}
.CM3-pmc-num {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 15px; font-weight: 900; color: #A6491D; line-height: 1; letter-spacing: -1px;
}
.CM3-pmc-icon-ring {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(166,73,29,0.1); border: 1.5px solid rgba(166,73,29,0.25);
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
  font-size: 10px; font-weight: 800; color: var(--text-1,#231C14);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
}
.CM3-pmc-mode {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; color: #A6491D;
  background: #FDE0CB; padding: 1.5px 6px; border-radius: 4px;
  border: 1px solid #FBC9A8; white-space: nowrap; flex-shrink: 0;
}
.CM3-pmc-row2 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.CM3-pmc-desc { font-size: 9px; color: var(--text-4,#6B5D48); }
.CM3-pmc-dot  { color: var(--border); font-size: 8px; }
.CM3-pmc-row3 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 2px; }

.CM3-pmc-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 7.5px; font-weight: 800;
  padding: 1.5px 6px; border-radius: 100px; border: 1px solid; white-space: nowrap;
  line-height: 14px;
}
.CM3-pmc-chip.date    { color:var(--text-4); background:var(--off-white,#F0ECE6); border-color:var(--border); }
.CM3-pmc-chip.synced  { color:#1E9C6A; background:#f0fdf4; border-color:#6ee7b7; }
.CM3-pmc-chip.unsynced{ color:#6B5D48; background:#F5F3EF; border-color:#E3DDD3; }
.CM3-pmc-chip.ref     { color:#A6491D; background:#FDE0CB; border-color:#FBC9A8; }
.CM3-pmc-chip.client  { color:#A6491D; background:#FDE0CB; border-color:#FBC9A8; }

/* Right amount panel */
.CM3-pmc-right {
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  padding: 9px 12px; gap: 4px; flex-shrink: 0;
  min-width: 120px; border-left: 1px solid var(--border,#E8E2D8);
}
.CM3-pmc-amt {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 14px; font-weight: 800; font-style: normal;
  color: #A6491D; line-height: 1;
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
  border-left: 1px solid var(--border,#E8E2D8); align-self: stretch; width: 58px;
}
.CM3-pmc-act {
  flex: 1; background: none; border: none; cursor: pointer;
  color: var(--text-4,#6B5D48);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-body); font-size: 8px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
  transition: background 0.14s, color 0.14s;
}
.CM3-pmc-act + .CM3-pmc-act { border-top: 1px solid var(--border,#E8E2D8); }
.CM3-pmc-act.edit:hover { background: #FDE0CB; color: #DB5B1F; }
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
@keyframes cm3-client-row-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes cm3-pulse-red {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%      { box-shadow: 0 0 0 4px rgba(239,68,68,0.14); }
}

.CM3-ecard {
    background: var(--white,#faf9f7); border: 1px solid var(--border,#D2C7B8); border-radius: var(--r-md,12px);
    margin-bottom: 8px; display: flex; overflow: hidden;
    transition: all 0.18s; cursor: default;
    box-shadow: var(--sh-card, 0 1px 4px rgba(0,0,0,0.08));
    animation: erp-pop 0.3s ease both;
}
.CM3-ecard:hover { border-color: var(--ember-border,#D98255); box-shadow: 0 4px 16px rgba(194,65,12,0.1); transform: translateY(-1px); }
.CM3-ecard-bar { width: 4px; flex-shrink: 0; }
.CM3-ecard-bar.credit-bar { background: ${CREDIT_COLOR.gradient}; }
.CM3-ecard-bar.payment-bar { background: ${PAYMENT_COLOR.gradient}; }
.CM3-ecard-body { flex: 1; padding: 13px 14px; min-width: 0; }
.CM3-ecard-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.CM3-ecard-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10.5px; font-weight: 800; color: var(--text-1,#231C14); }
.CM3-ecard-subtitle { font-size: 9px; color: var(--text-4,#8C7C63); margin-top: 1px; }
.CM3-ecard-amt { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 13px; font-weight: 800; font-style: normal; white-space: nowrap; }
.CM3-ecard-amt.credit-amt { color: #D93B55; }
.CM3-ecard-amt.payment-amt { color: #A6491D; }
.CM3-ecard-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.CM3-ecard-date { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; color: var(--text-4,#8C7C63); font-weight: 700; letter-spacing: 0.5px; }
/* Action column — stacked edit + delete */
.CM3-ecard-actions {
    display: flex; flex-direction: column; flex-shrink: 0;
    border-left: 1px solid var(--border,#E8E2D8); width: 36px;
}
.CM3-ecard-act {
    flex: 1; background: none; border: none; cursor: pointer;
    color: var(--text-4,#6B5D48); display: flex; align-items: center; justify-content: center;
    transition: background 0.14s, color 0.14s;
}
.CM3-ecard-act + .CM3-ecard-act { border-top: 1px solid var(--border,#E8E2D8); }
.CM3-ecard-act.act-edit:hover  { background: #FDE0CB; color: #DB5B1F; }
.CM3-ecard-act.act-del:hover   { background: #fef2f2; color: #D93B55; }
/* legacy single del kept for any stray use */
.CM3-ecard-del {
    width: 36px; flex-shrink: 0; background: none; border: none; cursor: pointer;
    color: var(--text-4,#6B5D48); display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; border-left: 1px solid var(--border,#E8E2D8);
}
.CM3-ecard-del:hover { background: #fef2f2; color: #D93B55; }
.CM3-card-client { font-size: 8px; display: flex; align-items: center; gap: 3px; color: #A6491D; font-weight: 700; }

/* ── MINI PROGRESS ── */
.CM3-miniprog { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.CM3-miniprog-bar { flex: 1; height: 3px; background: var(--border,#E8E2D8); border-radius: 100px; overflow: hidden; }
.CM3-miniprog-fill { height: 100%; background: ${PAYMENT_COLOR.gradient}; border-radius: 100px; transition: width 0.6s ease; }
.CM3-miniprog-txt { font-size: 8px; color: var(--text-4,#6B5D48); white-space: nowrap; }

/* ── TAGS ── */
.CM3-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; border: 1px solid; font-size: 8px; font-weight: 800; letter-spacing: 0.04em; }
.CM3-dot { width: 5px; height: 5px; border-radius: 50%; }
.CM3-synced { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; font-size: 8px; font-weight: 800; color: #A6491D; background: #FDE0CB; border: 1px solid #FBC9A8; }
.CM3-unsynced { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; font-size: 8px; font-weight: 800; color: #8C7C63; background: #F5F3EF; border: 1px solid #E3DDD3; }

/* ── TIMELINE ── */
.CM3-tl { padding: 8px 0; }
.CM3-tl-item { display: flex; gap: 14px; padding: 10px 4px; position: relative; animation: cm3-card-in 0.3s ease both; }
.CM3-tl-item::before { content: ''; position: absolute; left: 15px; top: 28px; bottom: -8px; width: 1px; background: var(--border,#E8E2D8); }
.CM3-tl-item:last-child::before { display: none; }
.CM3-tl-dot { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1.5px solid; }
.CM3-tl-dot.credit-dot { background: #fef2f2; border-color: #fecaca; }
.CM3-tl-dot.payment-dot { background: #FDE0CB; border-color: #FBC9A8; }
.CM3-tl-body { flex: 1; min-width: 0; }
.CM3-tl-label { font-size: 9.5px; font-weight: 800; color: var(--text-1,#231C14); }
.CM3-tl-sub { font-size: 9px; color: var(--text-4,#6B5D48); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 2px; }
.CM3-tl-amt { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; font-size: 12.5px; font-weight: 800; }
.CM3-tl-amt.credit-tl { color: #D93B55; }
.CM3-tl-amt.payment-tl { color: #A6491D; }

/* ── EMPTY STATE ── */
.CM3-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 52px 20px; text-align: center; }
.CM3-empty-ic { width: 58px; height: 58px; border-radius: 16px; display: flex; align-items: center; justify-content: center; animation: cm3-welcome-float 3s ease-in-out infinite; }
.CM3-empty-ic.credit-empty { background: #fef2f2; border: 1.5px solid #fecaca; }
.CM3-empty-ic.payment-empty { background: #FDE0CB; border: 1.5px solid #FBC9A8; }
.CM3-empty-title { font-size: 13px; font-weight: 800; color: var(--text-1,#231C14); }
.CM3-empty-sub { font-size: 9px; color: var(--text-4,#6B5D48); max-width: 240px; line-height: 1.6; }

/* ── SKELETON ── */
.CM3-skel { background: linear-gradient(90deg, #F0ECE6 25%, #E8E2D8 50%, #F0ECE6 75%); background-size: 200% 100%; border-radius: 8px; animation: cm3-skel 1.4s infinite; }
@keyframes cm3-skel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── LEGEND ── */
.CM3-legend { display: flex; align-items: center; gap: 12px; padding: 8px 20px; background: var(--off-white,#F5F3EF); border-bottom: 1px solid var(--border,#E8E2D8); flex-wrap: wrap; }
.CM3-legend-lbl { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-4,#6B5D48); }

/* ── SYNC BANNER ── */
.CM3-sync-banner {
    display: flex; align-items: center; gap: 10px; padding: 10px 20px;
    background: #FDE0CB; border-bottom: 1px solid #FBC9A8; font-size: 9.5px; color: #A6491D;
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
    background: rgba(35,28,20,0.52);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: cm3-overlay-in 0.22s ease both;
}
.CM3-modal {
    position: relative;
    background: var(--white,#faf9f7);
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
    border-bottom: 1.5px solid #FBC9A8; flex-shrink:0;
    background: linear-gradient(135deg, #FBC9A8, #FBC9A8);
    border-radius: 20px 20px 0 0;
}
.CM3-mhdr.credit-top, .CM3-mhdr.payment-top, .CM3-mhdr.ledger-top {
    background: linear-gradient(135deg, #FBC9A8, #FBC9A8);
}
.CM3-mhdr-ic {
    width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: #faf9f7 !important; border: 1.5px solid #FBC9A8 !important;
    animation: cm3-icon-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
}
.CM3-mtitle { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 20px; font-weight: 900; font-style: normal; color: #231C14; }
.CM3-msub { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 9px; font-weight: 700; color: #524532; margin-top: 4px; }
.CM3-msub-tag {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  color: var(--ember,#C2410C); text-transform: uppercase;
  font-weight: 800; letter-spacing: 0.6px; font-size: 8.5px;
}
/* Close control — compact X icon button in the header corner, standard
   dismissible-dialog convention. Rotates open on hover/press for a livelier
   feel than a flat icon swap. */
.CM3-mclose {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: #faf9f7; border: 1.5px solid #FBC9A8;
    cursor: pointer; color: #9a3412;
    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.CM3-mclose svg { transition: transform 0.18s; }
.CM3-mclose:hover {
    background: #FBC9A8; border-color: #F0834D; color: #C2410C;
    transform: rotate(90deg); box-shadow: 0 3px 10px rgba(154,52,18,0.14);
}
.CM3-mclose:active { transform: rotate(90deg) scale(0.9); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

/* ── DIALOG BODY ── */
.CM3-mbody {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 20px 22px;
    scroll-behavior: smooth; overscroll-behavior: contain;
}
.CM3-mbody::-webkit-scrollbar { width: 3px; }
.CM3-mbody::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius:3px; }
.CM3-mbody::-webkit-scrollbar-track { background: transparent; }

.CM3-mfoot { display:flex; align-items:center; justify-content:flex-end; gap:8px; padding:14px 22px; border-top:1.5px solid var(--border,#E8E2D8); background:var(--surface,#F0ECE6); flex-shrink:0; border-radius: 0 0 20px 20px; }
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
    color: #231C14; margin-bottom: 5px;
    display: flex; gap: 6px; align-items: center;
}
.CM3-req { color: var(--error,#D93B55); font-size: 11px; }
.CM3-label {
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 10.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
    color: #231C14; margin-bottom: 5px; display: flex; align-items: center; gap: 6px;
}
.CM3-label .req { color: var(--error,#D93B55); }
.CM3-input {
    width: 100%; padding: 10px 13px; background: var(--white,#faf9f7);
    border: 1.5px solid var(--border,#D2C7B8); border-radius: var(--r-md,10px);
    font-family: var(--font-body,'Space Grotesk',sans-serif);
    font-size: 13px; font-weight: 800; color: #231C14;
    transition: border-color 0.18s, box-shadow 0.18s; outline: none; box-sizing: border-box;
}
.CM3-input:focus { border-color: var(--ember-mid,#DB5B1F); box-shadow: 0 0 0 3px var(--ember-ghost,rgba(219,91,31,0.10)); }
.CM3-input::placeholder { color: #6B5D48; font-style: normal; font-weight: 700; }
/* Category locked to context (opened from a Category Overview panel) — shown
   read-only instead of the usual dropdown, since it isn't selectable here. */
.CM3-locked-field {
    width: 100%; padding: 8px 12px; box-sizing: border-box;
    background: #FBC9A8; border: 1.5px solid #FBC9A8; border-radius: var(--r-md,10px);
    font-family: var(--font-body,'Space Grotesk',sans-serif);
    font-size: 10.5px; font-weight: 800; color: #C2410C;
    display: flex; align-items: center; gap: 8px;
}
.CM3-textarea {
    width: 100%; padding: 10px 13px; background: var(--white,#faf9f7);
    border: 1.5px solid var(--border,#D2C7B8); border-radius: var(--r-md,10px);
    font-family: var(--font-body,'Space Grotesk',sans-serif);
    font-size: 13px; font-weight: 800; color: #231C14;
    resize: vertical; min-height: 64px;
    transition: border-color 0.18s, box-shadow 0.18s; outline: none; box-sizing: border-box;
}
.CM3-textarea:focus { border-color: var(--ember-mid,#DB5B1F); box-shadow: 0 0 0 3px var(--ember-ghost,rgba(219,91,31,0.10)); }
.CM3-textarea::placeholder { color: #6B5D48; font-style: normal; font-weight: 700; }

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
.CM3-sdd-trigger{width:100%;display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--white,#faf9f7);border:1.5px solid #E3DDD3;border-radius:10px;cursor:pointer;min-height:40px;transition:border-color .18s,box-shadow .18s;outline:none;}
.CM3-sdd-trigger:hover{border-color:#C8B8AF;background:#F5F3EF;}
.CM3-sdd-trigger.open{border-color:var(--sdd-accent,#DB5B1F);box-shadow:0 0 0 3px color-mix(in srgb,var(--sdd-accent,#DB5B1F) 12%,transparent);}
.CM3-sdd-trigger.has-val{border-color:rgba(154,52,18,0.30);}
.CM3-sdd-trig-av{width:20px;height:20px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;font-weight: 800;border:1px solid transparent;}
/* Matches .CM3-input's 11px/700 exactly — a dropdown's selected value and a
   typed input's value are both just "the value of a field" and should read
   at the same size/weight throughout Accounts Payable. */
.CM3-sdd-val{font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 13px;font-weight: 800;color:#231C14;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
.CM3-sdd-val.ph{color:var(--text-4,#8C7C63);font-weight: 600;}
.CM3-sdd-val-sub{color:#524532;font-size: 11px;margin-left:4px;}
/* ── SDD Panel ── */
.CM3-sdd-panel{background:#faf9f7;border:1.5px solid rgba(154,52,18,0.15);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08),0 8px 28px rgba(0,0,0,0.07);overflow:hidden;animation:sdd-open .18s cubic-bezier(.22,.68,0,1.15) both;transform-origin:top center;}
/* Search */
.CM3-sdd-search{display:flex;align-items:center;gap:8px;padding:7px 11px;border-bottom:1px solid #E8E2D8;background:#F5F3EF;}
.CM3-sdd-inp{flex:1;border:none;outline:none;background:transparent;font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 12.5px;font-weight:700;color:#231C14;}
.CM3-sdd-inp::placeholder{color:var(--text-4,#8C7C63);}
.CM3-sdd-clr{display:flex;align-items:center;justify-content:center;width:16px;height:16px;background:none;border:none;cursor:pointer;color:var(--text-4,#8C7C63);border-radius:4px;transition:all .15s;flex-shrink:0;}
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
.CM3-sdd-item.selected{background:rgba(154,52,18,0.05);}
.CM3-sdd-av{width:20px;height:20px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;font-weight: 800;border:1px solid transparent;}
.CM3-sdd-item-text{flex:1;min-width:0;}
.CM3-sdd-item-label{font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 12px;font-weight: 800;color:#231C14;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.CM3-sdd-item.selected .CM3-sdd-item-label{color:var(--ember,#C2410C);font-weight: 700;}
.CM3-sdd-check{display:flex;align-items:center;flex-shrink:0;}
.CM3-sdd-clear{color:var(--error,#D93B55);gap:6px;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;font-weight: 700;letter-spacing:.3px;border-bottom:1px solid #E8E2D8;}
.CM3-sdd-clear:hover{background:#fef2f2;}
.CM3-sdd-empty{padding:12px 14px;text-align:center;color:#524532;font-family:var(--font-body,'Space Grotesk',sans-serif);font-size: 11px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:6px;}
.CM3-sdd-sub{font-size: 9.5px;color:#524532;margin-top:1px;letter-spacing:.3px;font-family:var(--font-mono,'JetBrains Mono',monospace);text-transform:uppercase;}
/* Footer */
.CM3-sdd-footer{padding:4px 11px;background:#F5F3EF;border-top:1px solid #E8E2D8;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size: 8px;color:var(--text-4,#8C7C63);letter-spacing:.6px;display:flex;align-items:center;justify-content:space-between;}

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
.CM3-btn.payment { background: linear-gradient(135deg, var(--ember,#C2410C), var(--ember-mid,#DB5B1F)); color: #faf9f7; box-shadow: var(--sh-ember,0 4px 18px rgba(154,52,18,0.28)); }
.CM3-btn.primary:hover,
.CM3-btn.credit:hover,
.CM3-btn.payment:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(154,52,18,0.38); }
.CM3-btn.ghost { background: var(--white,#faf9f7); color: var(--text-2,#3A3024); border: 1.5px solid var(--border,#E8E2D8); }
.CM3-btn.ghost:hover { transform: translateY(-1px); border-color: var(--ember-border,#D98255); background: var(--off-white,#F5F3EF); }
.CM3-btn.back { background: var(--surface,#F0ECE6); color: var(--text-3,#6B5D48); border: 1.5px solid var(--border,#E8E2D8); }
.CM3-btn.back:hover { transform: translateY(-1px); border-color: var(--ember-border,#D98255); background: var(--off-white,#F5F3EF); }
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
    border-top-color: #faf9f7; border-radius: 50%; animation: erp-spin 0.7s linear infinite;
}

/* ── STEP WIZARD ── */
.CM3-steps { display:flex; align-items:center; gap:0; padding:10px 20px; background:var(--off-white,#F5F3EF); border-bottom:1px solid var(--border,#E8E2D8); flex-shrink:0; }
.CM3-step { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.CM3-step-dot {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--border,#E8E2D8); background: var(--white,#faf9f7);
    font-size: 9px; font-weight: 800; color: var(--text-4,#6B5D48);
    transition: all 0.2s;
}
.CM3-step.active .CM3-step-dot { border-color: var(--ember-mid,#DB5B1F); background: linear-gradient(135deg,var(--ember,#C2410C),var(--ember-mid,#DB5B1F)); color: #faf9f7; }
.CM3-step.done .CM3-step-dot { border-color: #10b981; background: #10b981; color: #faf9f7; }
.CM3-step-lbl { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--text-4,#8C7C63); transition: color 0.2s; }
.CM3-step.active .CM3-step-lbl { color: var(--ember-mid,#DB5B1F); }
.CM3-step.done .CM3-step-lbl { color: #10b981; }
.CM3-step-line { width: 24px; height: 1.5px; background: var(--border,#E8E2D8); margin: 0 4px; }
.CM3-step.done + .CM3-step .CM3-step-line { background: #10b981; }

/* ── STEP CONTENT ── */
.CM3-step-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.CM3-step-num { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; font-size: 28px; font-weight: 800; color: var(--border,#D2C7B8); line-height: 1; }
.CM3-step-ttl { font-family: var(--font-body,'Space Grotesk',sans-serif); font-style: normal; text-transform: uppercase; letter-spacing: 0.3px; font-size: 13px; font-weight: 800; color: var(--text-1,#231C14); }
.CM3-step-desc { font-size: 11.5px; font-weight: 600; color: #3A3024; margin-top: 3px; }

/* ── SECTION SEPARATOR (like BioData section tag) ── */
.CM3-section { display: flex; align-items: center; gap: 10px; margin: 18px 0 12px; }
.CM3-section-tag {
    font-family: var(--font-mono,'JetBrains Mono',monospace);
    font-size: 9.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--ember,#C2410C); white-space: nowrap;
    background: rgba(154,52,18,0.07); padding: 4px 11px; border-radius: 100px;
    border: 1px solid var(--ember-border,rgba(154,52,18,0.18));
}
.CM3-section-rule { flex: 1; height: 1px; background: var(--border,#E8E2D8); }
.CM3-section-sep { height: 1px; background: var(--border,#E8E2D8); margin: 14px 0; }

/* ── PREVIEW / CONFIRM CARDS ── */
.CM3-prev-card { background: #FDE0CB; border: 1.5px solid #FDE0CB; border-radius: 10px; padding: 12px 16px; margin-top: 12px; }
.CM3-prev-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.CM3-prev-lbl { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #9A3412; }
.CM3-prev-val { font-size: 13px; font-weight: 800; color: #9A3412; }

.CM3-sel-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--surface,#F0ECE6); border: 1.5px solid var(--border,#E8E2D8); border-radius: 10px; margin-top: 10px; }
.CM3-sel-av { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 900; flex-shrink: 0; border: 1.5px solid; }
.CM3-sel-name { font-size: 13.5px; font-weight: 800; color: #231C14; }
.CM3-sel-sub { font-size: 10.5px; color: #524532; margin-top: 1px; }
.CM3-sel-badge { margin-left: auto; padding: 4px 11px; background: #FDE0CB; border: 1px solid #FDE0CB; border-radius: 100px; font-size: 9.5px; font-weight: 800; color: #9A3412; letter-spacing: 0.06em; text-transform: uppercase; }
.CM3-sel-badge.teal { background: ${PAYMENT_COLOR.light}; border-color: ${PAYMENT_COLOR.border}; color: ${PAYMENT_COLOR.primary}; }

/* ── NOTICE BOXES ── */
.CM3-notice {
    display: flex; align-items: flex-start; gap: 9px; padding: 11px 14px;
    border-radius: 9px; font-size: 11.5px; font-weight: 600; border: 1px solid; margin-bottom: 14px;
}
.CM3-notice.red { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.CM3-notice.teal { background: #FDE0CB; border-color: #FBC9A8; color: #065f46; }
.CM3-notice.blue { background: #FDE0CB; border-color: #FBC9A8; color: #9A3412; }

/* ── MANDATORY CLIENT BOX ── */
.CM3-mandatory-client { border: 2px solid rgba(166,73,29,0.3); border-radius: 12px; overflow: hidden; }
.CM3-mandatory-client-hdr { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(166,73,29,0.06); border-bottom: 1px solid rgba(166,73,29,0.15); }
.CM3-mandatory-client-title { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${PAYMENT_COLOR.primary}; }
.CM3-mandatory-client-body { padding: 12px 14px; }

/* ── DAYBOOK BOX ──
   Smaller box, smaller text, and a real 3-column grid for the short fields
   (Party / Category / Sub-category) instead of the 2-col layout that pushed
   Sub-category onto its own half-empty row. */
.CM3-db-box { padding: 10px 12px; border: 1.5px solid ${PAYMENT_COLOR.border}; border-radius: 8px; background: rgba(166,73,29,0.03); margin-top: 12px; }
.CM3-db-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.CM3-db-toggle-title { font-size: 8.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: ${PAYMENT_COLOR.primary}; display: flex; align-items: center; gap: 5px; }
.CM3-db-toggle-sub { font-size: 8px; font-weight: 600; color: #524532; margin-top: 2px; }

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
.CM3-db-hint { font-size: 8px; color: ${PAYMENT_COLOR.primary}; margin-top: 2px; font-weight: 700; }
.CM3-db-client-box { display: flex; align-items: center; gap: 5px; padding: 5px 8px; background: rgba(0,0,0,0.03); border: 1.5px solid var(--bd,#D2C7B8); border-radius: 7px; min-height: 26px; }

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
    padding: 6px 14px; background: var(--off-white,#F5F3EF);
    border: 1px solid var(--border,#E8E2D8); border-radius: 8px;
    font-size: 9px; font-weight: 800; color: var(--text-3,#6B5D48); letter-spacing: 0.08em;
    transition: all 0.2s;
}
.CM3-ledger-pill:hover { border-color: var(--ember-border,#D98255); color: var(--ember,#F0834D); }

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
  0%,100% { box-shadow: 0 0 4px rgba(219,91,31,0.35), 0 0 10px rgba(154,52,18,0.15); }
  50%      { box-shadow: 0 0 9px rgba(219,91,31,0.62), 0 0 20px rgba(154,52,18,0.28); }
}

.CM3-vlist, .CM3-content, .CM3-mbody, .CM3-sdd-list {
  scrollbar-width: thin;
  scrollbar-color: #DB5B1F rgba(210,199,184,0.18);
}

.CM3-vlist::-webkit-scrollbar,
.CM3-content::-webkit-scrollbar,
.CM3-mbody::-webkit-scrollbar,
.CM3-sdd-list::-webkit-scrollbar { width: 3px; height: 3px; }

.CM3-vlist::-webkit-scrollbar-track,
.CM3-content::-webkit-scrollbar-track,
.CM3-mbody::-webkit-scrollbar-track,
.CM3-sdd-list::-webkit-scrollbar-track {
  background: rgba(210,199,184,0.15);
  border-radius: 99px;
}

.CM3-vlist::-webkit-scrollbar-thumb,
.CM3-content::-webkit-scrollbar-thumb,
.CM3-mbody::-webkit-scrollbar-thumb,
.CM3-sdd-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  border: none;
  box-shadow: 0 0 3px rgba(219,91,31,0.25);
  transition: background 0.22s ease, box-shadow 0.22s ease;
}

.CM3-vlist::-webkit-scrollbar-thumb:hover,
.CM3-content::-webkit-scrollbar-thumb:hover,
.CM3-mbody::-webkit-scrollbar-thumb:hover,
.CM3-sdd-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FBC9A8 0%, #DB5B1F 42%, #C2410C 100%);
  box-shadow: 0 0 8px rgba(219,91,31,0.55), 0 0 16px rgba(154,52,18,0.22);
  animation: cm-sb-glow 1.8s ease-in-out infinite;
}

/* ── BILL ALLOCATION STEP (Select Client / Select Bill) ──
   Full-size ERP form dialog, not a compact popup -- this is a real ledger
   operation (choosing which client/bill a repayment posts against), so it
   gets the same generous scale as a proper accounting-software form: wide
   card, roomy padding, bigger type. Still a floating card over a dim/blurred
   backdrop rather than a full-screen takeover. */
.CM3-alloc-overlay {
  position: fixed; inset: 0;
  background: rgba(35,28,20,0.55);
  backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
  z-index: 11000; display: flex; align-items: center; justify-content: center; padding: 28px;
  animation: cm3-overlay-in 0.22s ease both;
}
.CM3-alloc-modal {
  background: var(--white,#faf9f7); border-radius: 24px; width: 100%; max-width: 1080px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.11), 0 40px 100px rgba(0,0,0,0.26);
  overflow: hidden; display: flex; flex-direction: column;
  animation: cm3-modal-in 0.46s cubic-bezier(0.22,1,0.36,1) both;
  max-height: min(94dvh, 90vh);
}
@media (max-width: 1240px) {
    .CM3-alloc-modal { max-width: calc(100vw - 48px); }
}
@media (max-width: 640px) {
    .CM3-alloc-overlay { padding: 0; align-items: flex-end; }
    .CM3-alloc-modal { max-width: 100%; border-radius: 18px 18px 0 0; max-height: min(96dvh,96vh); }
}
.CM3-alloc-hdr {
  padding: 26px 32px 22px; border-bottom: 1.5px solid var(--border,#E8E2D8); flex-shrink: 0;
  background: var(--surface,#F5F3EF); position: relative;
}
/* "Back" — this step sits inside the repayment wizard, so dismissing it
   returns to the previous step rather than closing the whole flow; kept as
   a labeled control (not a bare X) so that distinction stays legible. */
.CM3-alloc-back-fab {
  position: absolute; top: 16px; right: 22px;
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid #FBC9A8;
  background: linear-gradient(135deg, #FBC9A8 0%, #F0834D 150%);
  color: #9A3412;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(154,52,18,0.16);
  animation: cm3-back-pop 0.36s cubic-bezier(0.34,1.56,0.64,1) both,
             cm3-back-ring 2.6s ease-in-out 0.7s infinite;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
}
.CM3-alloc-back-fab svg { display: block; transform: rotate(180deg); transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
.CM3-alloc-back-fab:hover {
  background: linear-gradient(135deg, #F0834D 0%, #C2410C 150%); border-color: #C2410C; color: #faf9f7;
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 8px 20px rgba(154,52,18,0.34);
}
.CM3-alloc-back-fab:hover svg { transform: rotate(180deg) translateX(-2px) scale(1.1); }
.CM3-alloc-back-fab:active { transform: translateY(0) scale(0.92); box-shadow: 0 2px 6px rgba(0,0,0,0.10); }
@keyframes cm3-back-pop {
  from { opacity: 0; transform: scale(0.4) rotate(-90deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes cm3-back-ring {
  0%, 100% { box-shadow: 0 2px 8px rgba(154,52,18,0.16), 0 0 0 0 rgba(154,52,18,0.24); }
  50%      { box-shadow: 0 2px 8px rgba(154,52,18,0.16), 0 0 0 7px rgba(154,52,18,0); }
}
@media (prefers-reduced-motion: reduce) {
  .CM3-alloc-back-fab { animation: none; }
}
/* Kept for the other repayment-step modal's "Cancel" (text+icon pill) --
   unrelated to the Back control above, left as-is. */
.CM3-alloc-close {
  position: absolute; top: 16px; right: 22px;
  display: flex; align-items: center; gap: 7px;
  height: 32px; padding: 0 15px 0 6px; border-radius: 100px;
  border: 1.5px solid #FBC9A8;
  background: linear-gradient(135deg,#FBC9A8,#FBC9A8);
  cursor: pointer;
  color: #9a3412;
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.CM3-alloc-close-ic {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: #faf9f7; border: 1.5px solid #FBC9A8;
  transition: border-color 0.18s;
}
.CM3-alloc-close svg { transform: rotate(180deg); transition: transform 0.18s; }
.CM3-alloc-close:hover {
  background: linear-gradient(135deg,#FBC9A8,#FBC9A8); border-color: #F0834D; color: #C2410C;
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(154,52,18,0.18);
}
.CM3-alloc-close:hover .CM3-alloc-close-ic { border-color: #F0834D; }
.CM3-alloc-close:hover svg { transform: rotate(180deg) translateX(3px); }
.CM3-alloc-close:active { transform: translateY(0) scale(0.96); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.CM3-alloc-title { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 17px; font-weight: 800; font-style: normal; color: #231C14; text-transform: uppercase; letter-spacing: 0.3px; }
.CM3-alloc-sub { font-size: 11.5px; font-weight: 700; color: #524532; margin-top: 5px; }
/* Icon badge next to the title — matches the icon-boxes on the other 3 full
   pages (Ledger/Bill/Payment) and gives this step a pop-in entrance. */
@keyframes cm3-badge-pop { from{opacity:0; transform:scale(0.5) rotate(-10deg);} to{opacity:1; transform:scale(1) rotate(0);} }
.CM3-alloc-hdr-row { display: flex; align-items: center; gap: 16px; }
.CM3-alloc-hdr-ic {
  width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #faf9f7; border: 1.5px solid #FBC9A8;
  animation: cm3-badge-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes cm3-chip-pop { from{opacity:0; transform:translateY(-3px) scale(0.9);} to{opacity:1; transform:none;} }
@keyframes cm3-chip-pulse { 0%,100%{ box-shadow:0 0 0 0 rgba(154,52,18,0.28); } 50%{ box-shadow:0 0 0 5px rgba(154,52,18,0); } }
.CM3-alloc-chip { display:inline-flex; align-items:center; gap:5px; padding: 4px 10px; border-radius: 6px; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; margin-top: 8px; background: var(--white,#faf9f7); border: 1px solid var(--border,#E8E2D8); color: #524532; animation: cm3-chip-pop 0.22s ease both; }
.CM3-alloc-chip.amber { color: #9A3412; border-color: #FDE0CB; background: #FDE0CB; animation: cm3-chip-pop 0.22s ease both, cm3-chip-pulse 1.8s ease-in-out 0.3s infinite; }
.CM3-alloc-body { flex: 1; overflow-y: auto; padding: 26px 32px; display: flex; flex-direction: column; gap: 14px; min-height: 0; }
.CM3-alloc-body::-webkit-scrollbar { width: 3px; }
.CM3-alloc-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
/* Bill picker — real table (rows & columns), orange header + warm-white body,
   matching the same Bills-table theme used across the rest of Accounts Payable.
   The wrap scrolls its own body with a sticky header, so a client with many bills
   scrolls inside the table instead of stretching the whole modal off-screen. */
.CM3-alloc-billtbl-wrap {
  border: 1.5px solid var(--border,#E8E2D8); border-radius: 14px;
  max-height: 52vh; overflow-y: auto; overflow-x: hidden;
}
.CM3-alloc-billtbl-wrap::-webkit-scrollbar { width: 6px; }
.CM3-alloc-billtbl-wrap::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius: 3px; }
.CM3-alloc-billtbl-wrap::-webkit-scrollbar-thumb:hover { background: #FBC9A8; }
.CM3-alloc-billtbl { width: 100%; border-collapse: collapse; }
.CM3-alloc-billtbl thead th {
  background: var(--surface-2,#E8E2D8); color: var(--text-3,#524532);
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 9px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase;
  padding: 13px 16px; text-align: left; white-space: nowrap;
  border-bottom: 2px solid var(--ember,#C2410C);
  position: sticky; top: 0; z-index: 1;
}
.CM3-alloc-billtbl tbody tr { cursor: pointer; }
.CM3-alloc-billtbl tbody tr.bill-row { animation: cm3-row-pop-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
.CM3-alloc-billtbl tbody tr.bill-row:nth-child(odd) td { background: var(--surface,#F5F3EF); }
.CM3-alloc-billtbl tbody tr.bill-row:not(:last-child) td { border-bottom: 1px solid var(--border,#E8E2D8); }
.CM3-alloc-billtbl tbody tr.bill-row td { transition: background 0.18s, box-shadow 0.2s; box-shadow: inset 0 0 0 0 transparent; }
.CM3-alloc-billtbl tbody tr.bill-row:hover td { background: #FBC9A8; }
.CM3-alloc-billtbl tbody tr.bill-row:hover td:first-child { box-shadow: inset 4px 0 0 0 #DB5B1F; }
.CM3-alloc-billtbl tbody tr.bill-row.selected td:first-child { box-shadow: inset 4px 0 0 0 #C2410C; }
.CM3-alloc-billtbl tbody tr.bill-row.selected td { background: #fff1e6; }
.CM3-alloc-billtbl tbody tr.bill-row.closed-bill { opacity: 0.45; pointer-events: none; }
.CM3-alloc-billtbl td { padding: 13px 16px; vertical-align: middle; font-size: 11px; }
.CM3-alloc-billtbl-check-cell { width: 30px; }
.CM3-alloc-billtbl-inv { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 10.5px; font-weight: 800; color: #231C14; }
.CM3-alloc-billtbl-client { font-size: 10.5px; font-weight: 800; color: #C2410C; }
.CM3-alloc-billtbl-amt { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 10.5px; font-weight: 800; color: #3A3024; white-space: nowrap; }
.CM3-alloc-billtbl-date { font-size: 10.5px; color: #524532; white-space: nowrap; }
.CM3-alloc-billtbl-bal-cell { text-align: right; }
.CM3-alloc-billtbl-bal { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 11.5px; font-weight: 800; color: #231C14; white-space: nowrap; }
.CM3-alloc-billtbl-preview-row td { padding: 0 12px 9px; background: #FBC9A8; border-bottom: 1px solid var(--border,#E8E2D8); }
/* Checkbox-style bill selector — square, animated check glyph pops in,
   filled orange (will close the bill) or amber (partial payment) when picked. */
@keyframes cm3-check-pop { 0%{opacity:0; transform:scale(0.4);} 60%{opacity:1; transform:scale(1.2);} 100%{opacity:1; transform:scale(1);} }
.CM3-alloc-check {
  width: 22px; height: 22px; border-radius: 7px; border: 2px solid var(--border,#D2C7B8);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #faf9f7; transition: all 0.16s cubic-bezier(0.34,1.56,0.64,1);
}
.CM3-alloc-check svg { animation: cm3-check-pop 0.24s cubic-bezier(0.34,1.56,0.64,1) both; }
.CM3-alloc-check.will-close {
  border-color: #C2410C; background: linear-gradient(135deg,#C2410C,#DB5B1F);
  transform: scale(1.08); box-shadow: 0 2px 8px rgba(154,52,18,0.35);
}
.CM3-alloc-check.will-partial {
  border-color: #DB5B1F; background: linear-gradient(135deg,#DB5B1F,#F0834D);
  transform: scale(1.08); box-shadow: 0 2px 8px rgba(154,52,18,0.3);
}
.CM3-alloc-billtbl tbody tr.bill-row:hover .CM3-alloc-check { border-color: #FBC9A8; }
.CM3-alloc-bill {
  display: flex; align-items: center; gap: 14px; padding: 20px 22px;
  border: 1.5px solid var(--border,#E8E2D8); border-radius: 14px;
  cursor: pointer; transition: all 0.15s; background: var(--white,#faf9f7);
}
.CM3-alloc-bill:hover { border-color: #FBC9A8; background: #FBC9A8; }
.CM3-alloc-bill.selected { border-color: #C2410C; background: #FBC9A8; box-shadow: 0 0 0 3px rgba(154,52,18,0.10); }
.CM3-alloc-bill.will-close { border-color: #C2410C; background: #FBC9A8; }
.CM3-alloc-bill.will-partial { border-color: #DB5B1F; background: #FDE0CB; }
.CM3-alloc-bill.closed-bill { opacity: 0.42; pointer-events: none; background: #F5F3EF; }
.CM3-alloc-radio {
  width: 17px; height: 17px; border-radius: 50%; border: 2px solid var(--border,#D2C7B8);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.CM3-alloc-bill.selected .CM3-alloc-radio,
.CM3-alloc-bill.will-close .CM3-alloc-radio { border-color: #C2410C; background: #C2410C; transform: scale(1.05); }
.CM3-alloc-bill.will-partial .CM3-alloc-radio { border-color: #DB5B1F; background: #DB5B1F; }
.CM3-alloc-radio-dot { width: 6px; height: 6px; border-radius: 50%; background: #faf9f7; }
.CM3-alloc-info { flex: 1; min-width: 0; }
.CM3-alloc-bill-num { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-4,#8C7C63); }
.CM3-alloc-bill-desc { font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10.5px; font-weight: 700; color: var(--text-1,#231C14); margin-top: 2px; }
.CM3-alloc-bill-meta { display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap; }
.CM3-alloc-bill-remaining { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 9px; font-weight: 800; color: #D93B55; }
.CM3-alloc-bill-date { font-size: 9px; color: var(--text-4,#8C7C63); }
.CM3-alloc-bill-closed-tag { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 100px; background: #FBC9A8; border: 1px solid #FBC9A8; color: #C2410C; }
.CM3-alloc-bill-overdue { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800; letter-spacing: 0.7px; padding: 2px 7px; border-radius: 100px; background: #fef2f2; border: 1px solid #fecaca; color: #D93B55; }
.CM3-alloc-preview { margin-top: 5px; padding: 5px 8px; border-radius: 7px; font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8.5px; font-weight: 800; display: flex; align-items: center; gap: 5px; animation: cm3-chip-pop 0.2s ease both; }
.CM3-alloc-preview.closes { background: #FBC9A8; color: #C2410C; border: 1px solid #FBC9A8; }
.CM3-alloc-preview.partial { background: #FDE0CB; color: #9A3412; border: 1px solid #FDE0CB; }

/* ── Client drill-down (premium, mirrors sidebar Category→Names UX) ── */
.CM3-alloc-back {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 8px 10px; margin-bottom: 4px; border-radius: 8px;
  border: 1px dashed var(--border,#E8E2D8); background: #faf9f7;
  cursor: pointer; transition: background 0.15s, border-color 0.15s; text-align: left;
  animation: cm3-page-in 0.2s ease both;
}
.CM3-alloc-back:hover { border-color: #D2C7B8; background: var(--surface,#F5F3EF); }
.CM3-alloc-back-ic {
  width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface,#F0ECE6); border: 1px solid var(--border,#E8E2D8); color: #524532;
  transition: transform 0.18s;
}
.CM3-alloc-back:hover .CM3-alloc-back-ic { transform: translateX(-2px); }
.CM3-alloc-back-name {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-weight: 800; font-size: 11px;
  color: #231C14;
}
.CM3-alloc-back-count {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8px; font-weight: 800;
  color: #524532; background: var(--surface,#F0ECE6); padding: 2px 8px; border-radius: 100px; border: 1px solid var(--border,#E8E2D8); flex-shrink: 0;
}

/* Client picker — real table (rows & columns), bigger modal, readable font.
   Scrolls its own body with a sticky header once the client list runs long. */
.CM3-alloc-tbl-wrap {
  border: 1.5px solid var(--border,#E8E2D8); border-radius: 14px;
  max-height: 46vh; overflow-y: auto; overflow-x: hidden;
}
.CM3-alloc-tbl-wrap::-webkit-scrollbar { width: 6px; }
.CM3-alloc-tbl-wrap::-webkit-scrollbar-thumb { background: var(--border,#E8E2D8); border-radius: 3px; }
.CM3-alloc-tbl-wrap::-webkit-scrollbar-thumb:hover { background: #FBC9A8; }
.CM3-alloc-tbl { width: 100%; border-collapse: collapse; }
.CM3-alloc-tbl thead th {
  background: var(--surface-2,#E8E2D8); color: var(--text-3,#524532);
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8.5px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase;
  padding: 9px 16px; text-align: left;
  border-bottom: 2px solid var(--ember,#C2410C);
  position: sticky; top: 0; z-index: 1;
}
.CM3-alloc-tbl tbody tr {
  cursor: pointer; animation: cm3-client-row-in 0.34s cubic-bezier(0.22,1,0.36,1) both;
  transition: transform 0.16s cubic-bezier(0.22,1,0.36,1);
}
.CM3-alloc-tbl tbody tr:nth-child(odd) td { background: var(--surface,#F5F3EF); }
.CM3-alloc-tbl tbody tr td { transition: background 0.18s, box-shadow 0.2s; box-shadow: inset 0 0 0 0 transparent; }
.CM3-alloc-tbl tbody tr:hover td:first-child { box-shadow: inset 4px 0 0 0 #DB5B1F; }
.CM3-alloc-tbl tbody tr:not(:last-child) td { border-bottom: 1px solid var(--border,#E8E2D8); }
.CM3-alloc-tbl tbody tr:hover td { background: #FBC9A8; }
.CM3-alloc-tbl tbody tr:active td { background: #ffe9d5; }
.CM3-alloc-tbl td { padding: 9px 16px; vertical-align: middle; }
.CM3-alloc-tbl-name {
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 11.5px; font-weight: 800; color: #231C14;
  display: flex; align-items: center; gap: 10px;
}
.CM3-alloc-tbl-avatar {
  width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg,#DB5B1F,#C2410C); color: #faf9f7;
  font-family: var(--font-body,'Space Grotesk',sans-serif); font-size: 10.5px; font-weight: 800;
  box-shadow: 0 2px 6px rgba(154,52,18,0.22);
  transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
}
.CM3-alloc-tbl tbody tr:hover .CM3-alloc-tbl-avatar { transform: scale(1.1) rotate(-4deg); }
.CM3-alloc-tbl-bills-pill {
  display: inline-flex; align-items: center; font-size: 9.5px; font-weight: 800;
  color: #524532; background: var(--white,#faf9f7); border: 1px solid var(--border,#E8E2D8);
  border-radius: 100px; padding: 3px 10px;
}
.CM3-alloc-tbl-due { font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 11.5px; font-weight: 800; color: #231C14; text-align: right; }
.CM3-alloc-tbl-chev { text-align: right; width: 80px; white-space: nowrap; }
.CM3-alloc-tbl-chev svg { color: #6B5D48; transition: transform 0.2s, color 0.2s; vertical-align: middle; }
.CM3-alloc-tbl-select {
  font-family: var(--font-mono,'JetBrains Mono',monospace); font-size: 8.5px; font-weight: 800;
  letter-spacing: 0.6px; text-transform: uppercase; color: #C2410C; margin-right: 6px;
  opacity: 0; transform: translateX(4px); transition: opacity 0.18s, transform 0.18s;
}
.CM3-alloc-tbl tbody tr:hover .CM3-alloc-tbl-select { opacity: 1; transform: translateX(0); }
.CM3-alloc-tbl tbody tr:hover .CM3-alloc-tbl-chev svg { color: #C2410C; transform: translateX(3px); }

.CM3-alloc-footer { padding: 22px 32px; border-top: 1.5px solid var(--border,#E8E2D8); display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0; background: var(--surface,#F0ECE6); }

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
  0%, 100% { box-shadow: 0 8px 28px rgba(154,52,18,0.28), 0 0 0 0 rgba(154,52,18,0.35); }
  50%      { box-shadow: 0 8px 28px rgba(154,52,18,0.28), 0 0 0 10px rgba(154,52,18,0); }
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
  background: linear-gradient(160deg, #F0ECE6 0%, #FBC9A8 55%, #FBC9A8 100%);
  border: 2px solid #FBC9A8;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 10; border-radius: 20px; overflow: hidden;
}
.CM3-closed-ring {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  border: 2.5px solid rgba(154,52,18,0.18);
  animation: cm3-ring-pulse 1s ease-out 0.1s both;
}
.CM3-closed-ring2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  border: 1.5px solid rgba(154,52,18,0.09);
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
  background: linear-gradient(135deg, #C2410C, #DB5B1F);
  border: 3px solid rgba(154,52,18,0.18);
  box-shadow: 0 8px 28px rgba(154,52,18,0.28);
  display: flex; align-items: center; justify-content: center;
  animation: cm3-check-glow 1.4s ease-in-out 0.7s infinite;
}
.CM3-closed-txt {
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 19.5px; font-weight: 900; color: #C2410C;
  letter-spacing: 4px; text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(154,52,18,0.10);
}
.CM3-closed-sub {
  font-family: var(--font-body,'Space Grotesk',sans-serif);
  font-size: 11.5px; color: #9A3412; margin-top: -8px; font-weight: 700;
}
.CM3-closed-amt-badge {
  position: relative;
  padding: 8px 20px;
  background: #faf9f7;
  border: 1.5px solid #FBC9A8;
  box-shadow: 0 2px 12px rgba(154,52,18,0.10);
  border-radius: 100px;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 16px; font-weight: 800; color: #C2410C; margin-top: 4px;
  overflow: hidden;
}
.CM3-closed-amt-badge::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(90deg, transparent, rgba(219,91,31,0.35), transparent);
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
  background: #FBC9A8; border: 1.5px solid #FBC9A8; color: #C2410C;
  font-family: var(--font-mono,'JetBrains Mono',monospace);
  font-size: 8px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
}
.CM3-closed-stamp-dot { width: 5px; height: 5px; border-radius: 50%; background: #C2410C; }

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
  background: #FDE0CB; border: 1px solid #FDE0CB; color: #9A3412;
  font-size: 9px; font-weight: 700; margin-top: 4px;
}
`;
// Css for Credit Management Page End

function LedgerFormModal({ categories, subCategories, bioData, vendors, onClose, onSaved, editVendor, presetCategoryId }: {
    categories: Category[]; subCategories: SubCategory[]; bioData: BioData[]; vendors: Vendor[];
    onClose: () => void; onSaved: () => void; editVendor: Vendor | null; presetCategoryId?: number | null;
}) {
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [errorField, setErrorField] = useState<'category' | 'bio_data' | null>(null);
    const categoryFieldRef = useRef<HTMLDivElement>(null);
    const bioFieldRef = useRef<HTMLDivElement>(null);
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingPayload: object | null }>({ open: false, fields: [], pendingPayload: null });
    const lockedCategory = !editVendor && presetCategoryId != null
        ? categories.find(c => c.id === presetCategoryId) || null
        : null;
    const [form, setForm] = useState({
        category_id: editVendor?.category_id ? String(editVendor.category_id)
            : lockedCategory ? String(lockedCategory.id) : '',
        sub_category_id: editVendor?.sub_category_id ? String(editVendor.sub_category_id) : '',
        bio_data_id: editVendor?.bio_data_id ? String(editVendor.bio_data_id) : '',
    });
    const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
    const expCats = categories.filter(c => !c.type || c.type.toLowerCase() === 'expense');
    const filteredSubs = form.category_id ? subCategories.filter(s => s.category_ids?.length ? s.category_ids.includes(+form.category_id) : s.category_id === +form.category_id) : [];
    const expCatIds = new Set(expCats.map(c => c.id));
    const expBioData = bioData.filter(b => b.category_id ? expCatIds.has(b.category_id) : true)
        .filter(b => {
            if (!form.category_id) return true;
            if (b.category_id && b.category_id !== +form.category_id) return false;
            if (form.sub_category_id && b.sub_category_id && b.sub_category_id !== +form.sub_category_id) return false;
            return true;
        });
    const selBio = bioData.find(b => String(b.id) === form.bio_data_id);
    const selCat = categories.find(c => String(c.id) === form.category_id);
    const selSub = subCategories.find(s => String(s.id) === form.sub_category_id);
    const handleCatChange = (v: string) => setForm(p => ({ ...p, category_id: v, sub_category_id: '', bio_data_id: '' }));
    const handleSubChange = (v: string) => setForm(p => ({ ...p, sub_category_id: v, bio_data_id: '' }));
    const canStep0 = !!form.category_id;
    const canStep1 = !!form.bio_data_id;
    const doSaveVendor = async (payload: object) => {
        setSaving(true); setMsg('');
        try {
            if (editVendor) {
                await axiosInstance.put(`/api/credit-management/vendors/${editVendor.id}`, payload, { headers: authHeader() });
                toast.success('Vendor Updated!', 'Vendor record saved successfully');
            } else {
                await axiosInstance.post('credit-management/vendors', payload, { headers: authHeader() });
                toast.success('Vendor Added!', 'New vendor registered successfully');
            }
            onSaved();
        } catch (e: any) { const m = apiErrMsg(e, 'Could not save vendor'); setMsg(m); toast.error('Save Failed', m); }
        finally { setSaving(false); }
    }

    const handleSubmit = async () => {
        if (!form.category_id || !form.bio_data_id) { setMsg('Please select account head and party name.'); toast.warning('Required Fields', 'Please select an Account Head and Party Name.'); return; }
        const payload = {
            category_id: +form.category_id,
            sub_category_id: form.sub_category_id ? +form.sub_category_id : null,
            bio_data_id: +form.bio_data_id,
            party_name: selBio?.name || '',
        };
        if (!editVendor) {
            const dup = vendors.find(v => v.bio_data_id === +form.bio_data_id);
            if (dup) {
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Party Name', value: dup.party_name },
                    ],
                    pendingPayload: payload,
                });
                return;
            }
        }
        await doSaveVendor(payload);
    };

    const STEPS = ['Classification', 'Party Name', 'Confirm'];
    const categoryLabel = selCat?.name || 'Party';

    const portal = createPortal(
        <div className="CM3-overlay" onClick={onClose}>
            <div className="CM3-modal CM3-modal-lg" onClick={e => e.stopPropagation()}>
                <div className="CM3-mhdr ledger-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="CM3-mhdr-ic">
                            <Ic n="layers" sz={18} c="#C2410C" />
                        </div>
                        <div>
                            <div className="CM3-mtitle">{editVendor ? 'Edit Ledger Account' : 'Open Ledger Account'}</div>
                            <div className="CM3-msub">{editVendor ? `Editing: ${editVendor.party_name}` : 'Create a credit ledger — vendor, manpower, contractor, etc.'}</div>
                        </div>
                    </div>
                    <button className="CM3-mclose" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" sz={18} /></button>
                </div>

                <div className="CM3-steps">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`CM3-step${i === step ? ' active' : i < step ? ' done' : ''}`}>
                            <div className="CM3-step-dot">
                                {i < step ? <Ic n="check" sz={11} c="#faf9f7" /> : <span>{i + 1}</span>}
                            </div>
                            <span className="CM3-step-lbl">{s}</span>
                            {i < STEPS.length - 1 && <div className="CM3-step-line" />}
                        </div>
                    ))}
                </div>

                <div className="CM3-mbody">
                    {step === 0 && (
                        <div>
                            {/* Classification Start */}
                            <div className="CM3-step-head">
                                <div className="CM3-step-num">01</div>
                                <div>
                                    <div className="CM3-step-ttl">Select Classification</div>
                                    <div className="CM3-step-desc">Choose expense category — Vendor, Manpower, Contractor, Materials, etc.</div>
                                </div>
                            </div>
                            {/* Classification End */}

                            {/* Expense Account Head Start */}
                            <div className="CM3-grid1">
                                {lockedCategory ? (
                                    <div className="CM3-field">
                                        <label className="CM3-label">Expense Account Head</label>
                                        <div className="CM3-locked-field">
                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
                                            {lockedCategory.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div ref={categoryFieldRef} className={`CM3-field${errorField === 'category' ? ' err' : ''}`}>
                                        <SDD label="Expense Account Head" required
                                            options={expCats.map(c => ({ value: String(c.id), label: c.name }))}
                                            value={form.category_id} onChange={v => { handleCatChange(v); if (errorField === 'category') setErrorField(null); }}
                                            placeholder="Select expense category…"
                                            emptyMsg="No expense categories found" />
                                        {errorField === 'category' && <div className="CM3-field-err-msg">Please select a category to continue</div>}
                                    </div>
                                )}
                                <SDD label="Account Sub-Head (Optional)"
                                    options={filteredSubs.map(s => ({ value: String(s.id), label: s.name }))}
                                    value={form.sub_category_id} onChange={handleSubChange}
                                    placeholder={!form.category_id ? 'Select category first…' : filteredSubs.length === 0 ? 'No sub-categories' : 'Select sub-category…'}
                                    disabled={!form.category_id || filteredSubs.length === 0}
                                    emptyMsg="No sub-categories" />
                            </div>
                            {/* Expense Account Head End */}
                            {selCat && (
                                <div className="CM3-prev-card" style={{ marginTop: 14 }}>
                                    <div className="CM3-prev-row">
                                        <span className="CM3-prev-lbl">Account Head</span>
                                        <span className="CM3-prev-val">{selCat.name}</span>
                                    </div>
                                    {selSub && (
                                        <div className="CM3-prev-row" style={{ marginTop: 6 }}>
                                            <span className="CM3-prev-lbl">Account Sub-Head</span>
                                            <span className="CM3-prev-val">{selSub.name}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            {/* Name & Client Start */}
                            <div className="CM3-step-head">
                                <div className="CM3-step-num">02</div>
                                <div>
                                    <div className="CM3-step-ttl">{categoryLabel} Name & Client</div>
                                    <div className="CM3-step-desc">Both party name and client are required to create a ledger.</div>
                                </div>
                            </div>
                            {/* Name & Client End */}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 8, marginBottom: 16, fontSize: 10.5 }}>
                                <Ic n="check" sz={13} c="#10b981" />
                                <span style={{ fontWeight: 700, color: '#065f46' }}>
                                    {selCat?.name}{selSub ? ` › ${selSub.name}` : ''}
                                </span>
                            </div>

                            <div className="CM3-grid1">
                                <div>
                                    {/* Name Start */}
                                    <div className="CM3-notice blue" style={{ marginBottom: 10 }}>
                                        <Ic n="user" sz={13} c="#C2410C" />
                                        <div><strong>{categoryLabel} Name *</strong> — From expense party master under <em>{selCat?.name}</em></div>
                                    </div>
                                    {/* Name End */}
                                    <div ref={bioFieldRef} className={`CM3-field${errorField === 'bio_data' ? ' err' : ''}`}>
                                        <SDD label={`${categoryLabel} Name`} required
                                            options={expBioData.map(b => ({ value: String(b.id), label: b.name, sub: b.category_name }))}
                                            value={form.bio_data_id} onChange={v => { setF('bio_data_id', v); if (errorField === 'bio_data') setErrorField(null); }}
                                            placeholder={`Search ${categoryLabel.toLowerCase()} names…`}
                                            emptyMsg={`No party master record found for ${selCat?.name}. Add one in Party Master first.`} />
                                        {errorField === 'bio_data' && <div className="CM3-field-err-msg">{categoryLabel} Name is required</div>}
                                    </div>
                                    {selBio && (
                                        <div className="CM3-sel-card">
                                            <div className="CM3-sel-av" style={{ ...(() => { const vc = vendorColor(selBio.name); return { background: vc.bg, color: vc.color, borderColor: vc.border }; })() }}>
                                                {selBio.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="CM3-sel-name">{selBio.name}</div>
                                                <div className="CM3-sel-sub">{selBio.category_name || selCat?.name}{selSub ? ` › ${selSub.name}` : ''}</div>
                                            </div>
                                            <div className="CM3-sel-badge">{categoryLabel}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="CM3-notice" style={{ marginTop: 8, background: 'rgba(166,73,29,0.06)', border: '1px solid rgba(166,73,29,0.2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Ic n="client" sz={13} c={PAYMENT_COLOR.primary} />
                                    <span style={{ fontSize: 9.5, color: PAYMENT_COLOR.primary }}>Client name is added per bill & repayment — not here.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            {/* Confirm Ledger Start */}
                            <div className="CM3-step-head">
                                <div className="CM3-step-num">03</div>
                                <div>
                                    <div className="CM3-step-ttl">Confirm Ledger</div>
                                    <div className="CM3-step-desc">Review the details before saving</div>
                                </div>
                            </div>
                            {/* Confirm Ledger End */}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Account Head', val: `${selCat?.name || '—'}${selSub ? ` › ${selSub.name}` : ''}`, ic: 'tag', color: '#DB5B1F' },
                                    { label: 'Party Name', val: selBio?.name || '—', ic: 'user', color: '#DB5B1F' },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'var(--surface,#F0ECE6)', border: '1.5px solid var(--border,#E8E2D8)', borderRadius: 10 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 9, background: row.color + '15', border: `1px solid ${row.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Ic n={row.ic} sz={16} c={row.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-4,#6B5D48)' }}>{row.label}</div>
                                            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-1,#231C14)' }}>{row.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="CM3-mfoot" style={{ justifyContent: 'space-between' }}>
                    <div>
                        {step > 0 && <button className="CM3-btn back icon-only" onClick={() => setStep(s => s - 1)} disabled={saving} title="Back" aria-label="Back"><Ic n="arrow" sz={12} /></button>}
                    </div>
                    {/* Cancel button Start */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="CM3-btn ghost" onClick={onClose}>Cancel</button>
                        {step === 0 && <button className="CM3-btn primary" onClick={() => {
                            if (canStep0) { setMsg(''); setErrorField(null); setStep(1); }
                            else {
                                setMsg('Please select a category first.');
                                setErrorField('category');
                                toast.error('Account Head Required', 'Please select an account head to continue.');
                                categoryFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }}>Next →</button>}
                        {step === 1 && <button className="CM3-btn primary" onClick={() => {
                            if (canStep1) { setMsg(''); setErrorField(null); setStep(2); }
                            else {
                                setMsg('Party name is required.');
                                setErrorField('bio_data');
                                toast.error('Required Field', `${categoryLabel} Name is required.`);
                                bioFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }}>Review →</button>}
                        {step === 2 && (
                            <button className="CM3-btn primary" onClick={handleSubmit} disabled={saving}>
                                {saving ? <><span className="CM3-spin" /> Saving…</> : <><Ic n="check" sz={12} c="#faf9f7" /> {editVendor ? 'Update Ledger Account' : 'Create Ledger Account'}</>}
                            </button>
                        )}
                    </div>
                    {/* Cancel Button End */}
                </div>
            </div>
        </div>
        , document.body);

    return (
        <>
            {portal}
            <DuplicateWarningModal
                open={dupModal.open}
                entityName="Ledger Account"
                duplicateFields={dupModal.fields}
                onAddAnyway={async () => {
                    if (dupModal.pendingPayload) {
                        setDupModal(d => ({ ...d, open: false }));
                        await doSaveVendor(dupModal.pendingPayload);
                    }
                }}
                onCancel={() => setDupModal({ open: false, fields: [], pendingPayload: null })}
                loading={saving}
            />
        </>
    );
}

// ─── CREDIT ENTRY MODAL ─────────
function CreditEntryModal({ vendor, bioData, categories, editEntry, onClose, onSaved }: {
    vendor: Vendor; bioData: BioData[]; categories: Category[];
    editEntry?: CreditEntry;
    onClose: () => void; onSaved: () => void;
}) {
    const isEdit = !!editEntry;
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [errorField, setErrorField] = useState<'bill_number' | 'client_name' | 'credit_amount' | null>(null);
    const billFieldRef = useRef<HTMLDivElement>(null);
    const billInputRef = useRef<HTMLInputElement>(null);
    const clientFieldRef = useRef<HTMLDivElement>(null);
    const amountFieldRef = useRef<HTMLDivElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const [celebrate, setCelebrate] = useState(false);
    const [form, setForm] = useState({
        credit_date: editEntry?.credit_date || todayStr(),
        bill_number: editEntry?.bill_number || '',
        description: editEntry?.description || '',
        credit_amount: editEntry ? String(Math.round(editEntry.credit_amount)) : '',
        due_date: editEntry?.due_date || '',
        priority: editEntry?.priority || 'medium',
        notes: editEntry?.notes || '',
        client_name: editEntry?.client_name || '',
    });
    const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
    const incCatIds = new Set(categories.filter(c => c.type === 'income').map(c => c.id));
    const clientOptions = bioData
        .filter(b => b.category_id ? incCatIds.has(b.category_id) : true)
        .map(b => ({ value: b.name, label: b.name, sub: b.category_name }));
    const handleSubmit = async () => {
        if (!form.bill_number.trim()) {
            setErrorField('bill_number');
            toast.error('Bill / Invoice No Required', 'Please enter a bill / invoice number to continue.');
            billFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            billInputRef.current?.focus();
            return;
        }
        if (!form.client_name.trim()) {
            setErrorField('client_name');
            toast.error('Client Required', 'Please select a Client / Site Name to continue.');
            clientFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!form.credit_amount || +form.credit_amount <= 0) {
            setErrorField('credit_amount');
            toast.error('Amount Required', 'Please enter a valid credit amount greater than 0.');
            amountFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            amountInputRef.current?.focus();
            return;
        }
        setErrorField(null);
        setSaving(true); setMsg('');
        const payload = {
            ...form,
            bill_number: form.bill_number.trim(),
            credit_amount: Math.round(+form.credit_amount),
            due_date: form.due_date || null,
            notes: form.notes || null,
            priority: form.priority || null,
        };
        try {
            if (isEdit && editEntry) {
                await axiosInstance.put(`/api/credit-management/entries/${editEntry.id}`, payload, { headers: authHeader() });
                toast.success('Bill Updated!', `Bill #${editEntry.id} updated for ${vendor.party_name}`);
                onSaved();
            } else {
                await axiosInstance.post(`/api/credit-management/vendors/${vendor.id}/entries`, payload, { headers: authHeader() });
                setSaving(false);
                setCelebrate(true);
                return;
            }
        } catch (e: any) {
            const m = apiErrMsg(e, 'Could not save credit entry');
            setMsg(m);
            toast.error(isEdit ? 'Update Failed' : 'Save Failed', m);
        }
        finally { setSaving(false); }
    };

    return createPortal(
        <div className="CM3-overlay" onClick={onClose}>
            <div className="CM3-modal CM3-modal-lg" onClick={e => e.stopPropagation()}>
                {celebrate && (
                    <SuccessCelebration
                        title="BILL SAVED!"
                        sub={vendor.party_name}
                        amountText={`${fmt(+form.credit_amount)} Recorded`}
                        onDone={onSaved}
                    />
                )}
                <div className="CM3-mhdr credit-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="CM3-mhdr-ic">
                            <Ic n="receipt" sz={17} c="#C2410C" />
                        </div>
                        <div>
                            <div className="CM3-mtitle">{isEdit ? 'Edit Bill' : 'Add Bill'}</div>
                            <div className="CM3-msub">
                                <span className="CM3-msub-tag">
                                    ({vendor.party_name} · {vendor.category_name}{vendor.sub_category_name ? ` › ${vendor.sub_category_name}` : ''})
                                </span>
                                {form.client_name ? ` · Client: ${form.client_name}` : ''}
                            </div>
                        </div>
                    </div>
                    <button className="CM3-mclose" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" sz={18} /></button>
                </div>
                <div className="CM3-mbody">

                    {/* Bill Start */}
                    <div className="CM3-notice red">
                        <Ic n="receipt" sz={14} c={CREDIT_COLOR.mid} />
                        <div><strong>Bill</strong> — Records in ledger only. Payments will sync to Cash Book.</div>
                    </div>
                    {/* Bill End */}

                    {/* ── 01 Bill Details Start ── */}
                    <div className="CM3-section"><span className="CM3-section-tag">01 — Bill Details</span><div className="CM3-section-rule" /></div>
                    <div className="CM3-grid2">
                        <div className="CM3-field">
                            <label className="CM3-label">Credit Date <span className="req">*</span></label>
                            <CalendarDD value={form.credit_date} onChange={v => setF('credit_date', v)} />
                        </div>
                        <div className={`CM3-field${errorField === 'bill_number' ? ' err' : ''}`} ref={billFieldRef}>
                            <label className="CM3-label">Bill / Invoice No <span className="req">*</span></label>
                            <input autoComplete="off" ref={billInputRef} type="text" className="CM3-input" placeholder="Enter bill / invoice number…" value={form.bill_number}
                                onChange={e => { setF('bill_number', e.target.value); if (errorField === 'bill_number') setErrorField(null); }} />
                            {errorField === 'bill_number' && <div className="CM3-field-err-msg">Bill / Invoice No is required</div>}
                        </div>
                    </div>
                    {/* ── 01 Bill Details End ── */}

                    {/* ── 02 Client Name Start ── */}
                    <div className="CM3-section"><span className="CM3-section-tag">02 — Client / Site Name</span><div className="CM3-section-rule" /></div>
                    <div className="CM3-grid2">
                        <div className={`CM3-field${errorField === 'client_name' ? ' err' : ''}`} style={{ gridColumn: '1/-1' }} ref={clientFieldRef}>
                            <ClientPicker
                                value={form.client_name}
                                onChange={v => { setF('client_name', v); if (errorField === 'client_name') setErrorField(null); }}
                                options={clientOptions}
                                placeholder="Search or type client / site name…"
                                accent={CREDIT_COLOR.mid}
                            />
                            {errorField === 'client_name' && <div className="CM3-field-err-msg">Client / Site Name is required</div>}
                        </div>
                    </div>
                    {/* ── 02 Client Name End ── */}

                    {/* ── 03 Amount & Due Start ── */}
                    <div className="CM3-section"><span className="CM3-section-tag">03 — Amount & Due Date</span><div className="CM3-section-rule" /></div>
                    <div className="CM3-grid2">
                        <div className={`CM3-field${errorField === 'credit_amount' ? ' err' : ''}`} ref={amountFieldRef}>
                            <label className="CM3-label">Credit Amount (₹) <span className="req">*</span></label>
                            <input autoComplete="off" ref={amountInputRef} type="number" step="1" min="0" className="CM3-input" placeholder="0" value={form.credit_amount}
                                onChange={e => { setF('credit_amount', e.target.value.replace(/[.,].*$/, '')); if (errorField === 'credit_amount') setErrorField(null); }} />
                            {errorField === 'credit_amount' && <div className="CM3-field-err-msg">Enter a valid amount greater than 0</div>}
                        </div>
                        <div className="CM3-field">
                            <label className="CM3-label">Due Date</label>
                            <CalendarDD value={form.due_date} onChange={v => setF('due_date', v)} />
                        </div>
                    </div>
                    {/* ── 03 Amount & Due End ── */}

                    {/* ── 04 Priority & Notes Start ── */}
                    <div className="CM3-section"><span className="CM3-section-tag">04 — Priority & Notes</span><div className="CM3-section-rule" /></div>
                    <div className="CM3-grid2">
                        <div className="CM3-field">
                            <SDD options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]}
                                label="Priority" value={form.priority} onChange={v => setF('priority', v)} placeholder="Select priority…" accent={CREDIT_COLOR.mid} />
                        </div>
                        <div className="CM3-field">
                            <label className="CM3-label">Notes</label>
                            <input autoComplete="off" type="text" className="CM3-input" placeholder="Internal remark…" value={form.notes} onChange={e => setF('notes', e.target.value)} />
                        </div>
                        <div className="CM3-field" style={{ gridColumn: '1/-1' }}>
                            <label className="CM3-label">Description</label>
                            <input autoComplete="off" type="text" className="CM3-input" placeholder="Work done / material supplied…" value={form.description} onChange={e => setF('description', e.target.value)} />
                        </div>
                    </div>
                    {/* ── 04 Priority & Notes End ── */}
                </div>
                {/* Cancel Button Start */}
                <div className="CM3-mfoot">
                    <button className="CM3-btn ghost" onClick={onClose}>Cancel</button>
                    <button className="CM3-btn credit" onClick={handleSubmit} disabled={saving}>
                        {saving ? <><span className="CM3-spin" /> Saving…</> : <><Ic n={isEdit ? 'edit' : 'receipt'} sz={12} c="#faf9f7" />{isEdit ? ' Update Bill' : ' Add Bill'}</>}
                    </button>
                </div>
                {/* Cancel Button End */}
            </div>
        </div>
        , document.body);
}

const CONFETTI_COLORS = ['#C2410C', '#DB5B1F', '#FBC9A8', '#FDE0CB', '#FBC9A8', '#faf9f7', '#FBC9A8', '#F0834D', '#FDE0CB'];
function ConfettiPieces({ seed = 0, count = 22 }: { seed?: number; count?: number }) {
    const pieces = Array.from({ length: count }, (_, i) => {
        const n = i + seed * 7;
        return {
            id: i,
            color: CONFETTI_COLORS[n % CONFETTI_COLORS.length],
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
                <div key={p.id} className="CM3-confetti-piece" style={{
                    left: p.left, top: p.top, width: p.size, height: p.size,
                    background: p.color, animationDelay: p.delay,
                    animationDuration: `${900 + (p.id * 55) % 500}ms`,
                    ['--cm3-drift' as any]: `${p.drift}px`,
                    transform: `rotate(${p.rotate}deg)`,
                }} />
            ))}
        </>
    );
}

function SparklePieces() {
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
                <svg key={s.id} className="CM3-sparkle" width={s.size} height={s.size} viewBox="0 0 24 24"
                    style={{ left: s.left, top: s.top, animationDelay: s.delay }}
                    fill="#DB5B1F">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                </svg>
            ))}
        </>
    );
}

function SuccessCelebration({ title, sub, amountText, onDone, duration = 1800 }: {
    title: string; sub?: string; amountText?: string; onDone: () => void; duration?: number;
}) {
    const [burstTwo, setBurstTwo] = useState(false);
    useEffect(() => {
        const t = setTimeout(onDone, duration);
        const b = setTimeout(() => setBurstTwo(true), 450);
        return () => { clearTimeout(t); clearTimeout(b); };
    }, []);
    return (
        <div className="CM3-closed-celebrate CM3-success-ov">
            <ConfettiPieces seed={0} />
            {burstTwo && <ConfettiPieces seed={1} count={16} />}
            <SparklePieces />
            <div className="CM3-closed-ring" />
            <div className="CM3-closed-ring2" />
            <div className="CM3-closed-stamp-wrap">
                <div className="CM3-closed-check">
                    <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </div>
                <div className="CM3-closed-txt">{title}</div>
                {sub && <div className="CM3-closed-sub">{sub}</div>}
                {amountText && <div className="CM3-closed-amt-badge">{amountText}</div>}
            </div>
        </div>
    );
}

type AllocPlanEntry = { entry_id: number; amount: number; client_name?: string };

type SmartSplitRow = { bill: CreditEntry; allocated: number; isClosed: boolean; extraFromRedist: number };
type SmartSplitResult = { plan: AllocPlanEntry[]; hasRedist: boolean; rows: SmartSplitRow[]; originalPerBill: number; totalSurplus: number };

function computeSmartSplit(totalAmount: number, openBills: CreditEntry[]): SmartSplitResult {
    if (!openBills.length) return { plan: [], hasRedist: false, rows: [], originalPerBill: 0, totalSurplus: 0 };
    const allocs = new Map<number, number>();
    const closedSet = new Set<number>();
    let remaining = Math.round(totalAmount);
    let uncapped = [...openBills];
    const originalPerBill = Math.round(totalAmount / openBills.length);

    while (remaining > 0.5 && uncapped.length > 0) {
        const perBill = remaining / uncapped.length;
        const overflowing = uncapped.filter(b => b.bill_balance + 0.5 < perBill);
        if (overflowing.length === 0) {
            uncapped.forEach((b, i) => {
                if (i === uncapped.length - 1) {
                    allocs.set(b.id, Math.round(remaining));
                } else {
                    const amt = Math.round(perBill);
                    allocs.set(b.id, amt);
                    remaining = Math.round(remaining - amt);
                }
            });
            remaining = 0; break;
        }
        for (const b of overflowing) {
            allocs.set(b.id, Math.round(b.bill_balance));
            remaining = Math.round(remaining - b.bill_balance);
            closedSet.add(b.id);
        }
        uncapped = uncapped.filter(b => !closedSet.has(b.id));
    }

    const hasRedist = openBills.some(b => b.bill_balance + 0.5 < originalPerBill);
    const totalSurplus = Math.round(
        openBills.filter(b => closedSet.has(b.id) && b.bill_balance + 0.5 < originalPerBill)
            .reduce((s, b) => s + (originalPerBill - b.bill_balance), 0));

    const rows: SmartSplitRow[] = openBills.map(b => {
        const allocated = allocs.get(b.id) ?? 0;
        return {
            bill: b, allocated,
            isClosed: allocated >= b.bill_balance - 0.5,
            extraFromRedist: Math.max(0, Math.round(allocated - originalPerBill)),
        };
    });
    const plan = rows.filter(r => r.allocated > 0).map(r => ({ entry_id: r.bill.id, amount: r.allocated }));
    return { plan, hasRedist, rows, originalPerBill, totalSurplus };
}

function BillAllocateModal({ paymentAmount, paymentDate, entries, onPlanConfirmed, onSkip, onClose }: {
    paymentAmount: number; paymentDate: string;
    entries: CreditEntry[];
    onPlanConfirmed: (plan: AllocPlanEntry[]) => void;
    onSkip: () => void;
    onClose: () => void;
}) {
    const [remaining, setRemaining] = useState(paymentAmount);
    const [plan, setPlan] = useState<AllocPlanEntry[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [justClosed, setJustClosed] = useState<Set<number>>(new Set());
    const [celebration, setCelebration] = useState<{ show: boolean; billNum: string; amount: number }>({ show: false, billNum: '', amount: 0 });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const pOrd: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const sortedEntries = [...entries].sort((a, b) => {
        if (a.is_paid !== b.is_paid) return a.is_paid ? 1 : -1;
        return (pOrd[a.priority] ?? 3) - (pOrd[b.priority] ?? 3);
    });

    const liveOpen = sortedEntries.filter(e => !e.is_paid && !justClosed.has(e.id));
    const selBill = liveOpen.find(e => e.id === selected);
    const applyAmount = selBill ? Math.round(Math.min(remaining, selBill.bill_balance)) : 0;
    const wouldClose = selBill ? remaining >= selBill.bill_balance : false;
    const carryOver = selBill ? Math.round(Math.max(0, remaining - selBill.bill_balance)) : 0;
    const isDone = liveOpen.length === 0 || remaining <= 0;

    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [clientSearch, setClientSearch] = useState('');
    const clientGroups = (() => {
        const map = new Map<string, CreditEntry[]>();
        liveOpen.forEach(e => {
            const key = e.client_name || 'No Client Assigned';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(e);
        });
        return Array.from(map.entries())
            .map(([name, bills]) => ({ name, bills, totalDue: bills.reduce((s, b) => s + b.bill_balance, 0) }))
            .sort((a, b) => a.name.localeCompare(b.name));
    })();
    const activeClientBills = selectedClient ? (clientGroups.find(g => g.name === selectedClient)?.bills || []) : [];
    const filteredClientGroups = clientSearch.trim()
        ? clientGroups.filter(g => g.name.toLowerCase().includes(clientSearch.trim().toLowerCase()))
        : clientGroups;
    useEffect(() => {
        if (selectedClient && !clientGroups.some(g => g.name === selectedClient)) {
            setSelectedClient(null);
        }
    }, [liveOpen.length]);

    const triggerCelebration = (billNum: string, amount: number) => {
        setCelebration({ show: true, billNum, amount });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCelebration({ show: false, billNum: '', amount: 0 }), 2300);
    };

    const handleApply = () => {
        if (!selected || !selBill) return;
        const billNum = String(sortedEntries.indexOf(selBill) + 1).padStart(2, '0');
        const newPlanEntry: AllocPlanEntry = { entry_id: selected, amount: applyAmount };
        const updatedPlan = [...plan, newPlanEntry];
        setPlan(updatedPlan);
        const isFinalStep = wouldClose ? carryOver <= 0 : true;
        if (wouldClose) {
            setJustClosed(prev => new Set([...prev, selected]));
            setSelected(null);
            setRemaining(Math.round(carryOver));
        } else {
            setRemaining(0);
        }
        if (isFinalStep) {
            onPlanConfirmed(updatedPlan);
        } else {
            triggerCelebration(billNum, applyAmount);
        }
    };

    const handleConfirm = () => {
        const finalPlan = remaining > 0
            ? [...plan, { entry_id: 0, amount: remaining, client_name: selectedClient || undefined }]
            : plan;
        onPlanConfirmed(finalPlan);
    };

    const saving = false;

    return createPortal(
        <div className="CM3-alloc-overlay">
            <div className="CM3-alloc-modal" style={{ position: 'relative' }} ref={pageRef}>

                {/* ── BILL CLOSED CELEBRATION START ── */}
                {celebration.show && (
                    <div className="CM3-closed-celebrate">
                        <ConfettiPieces />
                        <SparklePieces />
                        <div className="CM3-closed-ring" />
                        <div className="CM3-closed-ring2" />
                        <div className="CM3-closed-stamp-wrap">
                            <div className="CM3-closed-check">
                                <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>
                            <div className="CM3-closed-txt">BILL CLOSED!</div>
                            <div className="CM3-closed-sub">BILL NUM: {celebration.billNum}</div>
                            <div className="CM3-closed-amt-badge">{fmt(celebration.amount)} — Settled ✓</div>
                            {remaining > 0 && (
                                <div style={{ fontSize: 10.5, color: '#9A3412', marginTop: 6, fontWeight: 700, background: '#faf9f7', border: '1px solid #FBC9A8', borderRadius: 100, padding: '4px 14px' }}>
                                    {fmt(remaining)} remaining → select next bill…
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* ── BILL CLOSED CELEBRATION END ── */}

                {/* ── HEADER START ── */}
                <div className="CM3-alloc-hdr">
                    <button className="CM3-alloc-back-fab" onClick={onClose} title="Back" aria-label="Back">
                        <Ic n="arrow" sz={16} />
                    </button>
                    <div className="CM3-alloc-hdr-row">
                        <div className="CM3-alloc-hdr-ic">
                            <Ic n={isDone ? 'check' : !selectedClient ? 'client' : 'receipt'} sz={22} c="#C2410C" />
                        </div>
                        <div>
                            <div className="CM3-alloc-title">
                                {isDone ? 'All Done!' : !selectedClient ? 'Select Client' : remaining < paymentAmount ? 'Choose Next Bill' : 'Select Bill'}
                            </div>
                            <div className="CM3-alloc-sub">
                                {isDone ? 'All open bills settled.' : !selectedClient ? 'Choose a client, then pick a bill to apply this repayment to' : 'Pick a bill to apply this repayment to'}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        <span className="CM3-alloc-chip teal">
                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                            Total: {fmt(paymentAmount)}
                        </span>
                        {remaining < paymentAmount && remaining > 0 && (
                            <span className="CM3-alloc-chip amber">
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>
                                Remaining: {fmt(remaining)}
                            </span>
                        )}
                        {remaining === paymentAmount && (
                            <span className="CM3-alloc-chip teal">· {fmtDate(paymentDate)}</span>
                        )}
                    </div>
                </div>
                {/* ── HEADER END ── */}

                {/* ── BODY START ── */}
                <div className="CM3-alloc-body">
                    {liveOpen.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={1.5} strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', fontStyle: 'normal', color: '#C2410C' }}>All Bills Settled</div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-4)' }}>No more open bills to allocate</div>
                        </div>
                    )}
                    {!selectedClient ? (
                        <>
                            {clientGroups.length > 0 && (
                                <div className="CM3-alloc-search-row">
                                    <div className="CM3-search CM3-alloc-search">
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth={2.5} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                                        <input autoComplete="off" placeholder="Search client…" value={clientSearch}
                                            onChange={e => setClientSearch(e.target.value)} autoFocus />
                                        {clientSearch && (
                                            <button onClick={() => setClientSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', lineHeight: 1, padding: 0 }}>✕</button>
                                        )}
                                    </div>
                                    <span className="CM3-alloc-client-count">
                                        {filteredClientGroups.length}{clientSearch ? ` of ${clientGroups.length}` : ''} {clientGroups.length === 1 ? 'client' : 'clients'}
                                    </span>
                                </div>
                            )}
                            {filteredClientGroups.length === 0 && clientSearch && (
                                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 10.5, color: 'var(--text-4)' }}>
                                    No client matches "{clientSearch}"
                                </div>
                            )}
                            {filteredClientGroups.length > 0 && (
                                <div className="CM3-alloc-tbl-wrap">
                                    <table className="CM3-alloc-tbl">
                                        {/* Table Header Start */}
                                        <thead>
                                            <tr>
                                                <th>Client Name</th>
                                                <th>Bills</th>
                                                <th style={{ textAlign: 'right' }}>Total Due</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        {/* Table Body End */}

                                        {/* Tbody Start */}
                                        <tbody>
                                            {filteredClientGroups.map((g, gIdx) => (
                                                <tr key={g.name}
                                                    style={{ animationDelay: `${Math.min(gIdx, 10) * 30}ms` }}
                                                    onClick={() => setSelectedClient(g.name)}
                                                    title={`Select ${g.name}`}>
                                                    <td className="CM3-alloc-tbl-name">
                                                        <span className="CM3-alloc-tbl-avatar">{g.name.trim().charAt(0).toUpperCase()}</span>
                                                        {g.name}
                                                    </td>
                                                    <td className="CM3-alloc-tbl-bills">
                                                        <span className="CM3-alloc-tbl-bills-pill">{g.bills.length} {g.bills.length === 1 ? 'bill' : 'bills'}</span>
                                                    </td>
                                                    <td className="CM3-alloc-tbl-due">{fmt(g.totalDue)}</td>
                                                    <td className="CM3-alloc-tbl-chev">
                                                        <span className="CM3-alloc-tbl-select">Select</span>
                                                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m9 18 6-6-6-6" /></svg>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/* Tbody End */}
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button className="CM3-alloc-back" onClick={() => setSelectedClient(null)}>
                                <span className="CM3-alloc-back-ic">
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m15 18-6-6 6-6" /></svg>
                                </span>
                                <span className="CM3-alloc-back-name">{selectedClient}</span>
                                <span className="CM3-alloc-back-count">{activeClientBills.length}</span>
                            </button>
                            <div className="CM3-alloc-billtbl-wrap">
                                <table className="CM3-alloc-billtbl">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Invoice No</th>
                                            <th>Client</th>
                                            <th>Credit Amt</th>
                                            <th>Date</th>
                                            <th>Due</th>
                                            <th style={{ textAlign: 'right' }}>Balance Due</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeClientBills.map((e, bIdx) => {
                                            const billNum = String(sortedEntries.indexOf(e) + 1).padStart(2, '0');
                                            const isSel = selected === e.id;
                                            const willClose = isSel && remaining >= e.bill_balance;
                                            const willPartial = isSel && remaining < e.bill_balance;
                                            const daysUntilDue = e.due_date
                                                ? Math.ceil((new Date(e.due_date).getTime() - Date.now()) / 86400000)
                                                : null;
                                            return (
                                                <Fragment key={e.id}>
                                                    <tr className={`bill-row${isSel ? ' selected' : ''}`} style={{ animationDelay: `${bIdx * 30}ms` }} onClick={() => setSelected(e.id)}>
                                                        <td className="CM3-alloc-billtbl-check-cell">
                                                            <div className={`CM3-alloc-check${isSel ? (willClose ? ' will-close' : ' will-partial') : ''}`}>
                                                                {isSel && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                                                            </div>
                                                        </td>
                                                        <td className="CM3-alloc-billtbl-inv">#{billNum} · {e.bill_number || `ID ${e.id}`}</td>
                                                        <td className="CM3-alloc-billtbl-client">{e.client_name || e.description || `Bill ${billNum}`}</td>
                                                        <td className="CM3-alloc-billtbl-amt">{fmt(e.credit_amount)}</td>
                                                        <td className="CM3-alloc-billtbl-date">{fmtDate(e.credit_date)}</td>
                                                        <td>
                                                            {e.due_date && daysUntilDue !== null && daysUntilDue < 0 ? (
                                                                <span className="CM3-alloc-bill-overdue">{Math.abs(daysUntilDue)}d overdue</span>
                                                            ) : e.due_date && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 5 ? (
                                                                <span className="CM3-alloc-bill-overdue" style={{ background: '#FDE0CB', border: '1px solid #FDE0CB', color: '#9A3412' }}>Due in {daysUntilDue}d</span>
                                                            ) : <span style={{ color: 'var(--text-4,#6B5D48)' }}>—</span>}
                                                        </td>
                                                        <td className="CM3-alloc-billtbl-bal-cell">
                                                            <div className="CM3-alloc-billtbl-bal">{fmt(e.bill_balance)}</div>
                                                            {e.credit_amount > e.bill_balance && (
                                                                <div style={{ fontSize: 8, color: 'var(--text-4,#6B5D48)', marginTop: 2, fontWeight: 600 }}>of {fmt(e.credit_amount)} total</div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {isSel && (willClose || willPartial) && (
                                                        <tr className="CM3-alloc-billtbl-preview-row">
                                                            <td colSpan={7}>
                                                                {willClose && (
                                                                    <div className="CM3-alloc-preview closes">
                                                                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                                        Will CLOSE this bill — {fmt(e.bill_balance)} applied
                                                                        {carryOver > 0 && <span style={{ marginLeft: 4, opacity: 0.85 }}>· {fmt(carryOver)} carries over</span>}
                                                                    </div>
                                                                )}
                                                                {willPartial && (
                                                                    <div className="CM3-alloc-preview partial">
                                                                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                                                                        Partial — {fmt(remaining)} applied · {fmt(e.bill_balance - remaining)} still due
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
                {/* ── BODY END  ── */}

                {/* ── FOOTER START ── */}
                <div className="CM3-alloc-footer">
                    {isDone ? (
                        <button className="CM3-btn payment" style={{ background: 'linear-gradient(135deg,#C2410C,#DB5B1F)', border: 'none' }} onClick={handleConfirm}>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            Save Payment &amp; Apply
                        </button>
                    ) : (
                        <>
                            {/* AUTO SPLIT BUTTON START  */}
                            <button className="CM3-btn ghost" onClick={onSkip}>
                                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>
                                Auto-Split Across All Bills
                            </button>
                            {/* AUTO SPLIT BUTTON END */}

                            {/* SELECT A BILL TO CONTINUE START */}
                            <button className="CM3-btn payment" style={{ background: selected ? 'linear-gradient(135deg,#C2410C,#DB5B1F)' : 'rgba(154,52,18,0.35)', border: 'none', cursor: selected ? 'pointer' : 'default' }}
                                onClick={handleApply} disabled={!selected}>
                                {!selected
                                    ? <>
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                        Select a Bill to Continue
                                    </>
                                    : wouldClose
                                        ? <>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                            Close Bill &amp; Apply {fmt(applyAmount)}
                                        </>
                                        : <>Apply {fmt(applyAmount)} to Bill</>
                                }
                            </button>
                            {/* SELECT A BILL TO CONTINUE END */}
                        </>
                    )}
                </div>
                {/* ── FOOTER END  ── */}
            </div>
        </div>,
        document.body
    );
}

/* ── SMART SPLIT PREVIEW MODAL ── */
function SmartSplitPreviewModal({ totalAmount, result, onConfirm, onCancel }: {
    totalAmount: number; result: SmartSplitResult;
    onConfirm: (plan: AllocPlanEntry[]) => void; onCancel: () => void;
}) {
    const smallBills = result.rows.filter(r => r.isClosed && r.bill.bill_balance < result.originalPerBill - 0.005);
    const bigBills = result.rows.filter(r => !r.isClosed);

    return createPortal(
        <div className="CM3-alloc-overlay">
            <div className="CM3-alloc-modal" style={{ maxWidth: 540 }}>

                {/* HEADER START */}
                <div className="CM3-alloc-hdr">

                    {/* Cancel Button Start */}
                    <button className="CM3-alloc-close" onClick={onCancel} title="Cancel">
                        <span className="CM3-alloc-close-ic"><Ic n="arrow" sz={11} /></span> Cancel
                    </button>
                    {/* Cancel Button End */}

                    {/* Smart redistribution Preview Start */}
                    <div className="CM3-alloc-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>
                        Smart Redistribution Preview
                    </div>
                    {/* Smart redistribution Preview End */}

                    {/* Smart Redistribution Subtitle Start */}
                    <div className="CM3-alloc-sub">
                        {smallBills.length} bill{smallBills.length > 1 ? 's are' : ' is'} smaller than the equal share — surplus redistributed automatically
                    </div>
                    {/* Smart Redistribution Subtitle End */}

                    {/* Equal Share Start */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        <span className="CM3-alloc-chip teal">
                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                            Total: {fmt(totalAmount)}
                        </span>
                        <span className="CM3-alloc-chip amber">Equal share: {fmt(result.originalPerBill)} / bill</span>
                        {result.totalSurplus > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: '#FBC9A8', color: '#be185d', border: '1px solid #fbcfe8', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: '0.06em' }}>
                                ↺ {fmt(result.totalSurplus)} redistributed
                            </span>
                        )}
                    </div>
                    {/* Equal Share End */}
                </div>
                {/* HEADER END */}

                {/* INFO BANNER START */}
                <div style={{ margin: '0 16px 4px', padding: '10px 14px', background: '#FDE0CB', border: '1px solid #FDE0CB', borderRadius: 8, fontSize: 10.5, color: '#9A3412', lineHeight: 1.6 }}>
                    <strong>{smallBills.map(r => r.bill.client_name || r.bill.description || `Bill #${r.bill.id}`).join(', ')}</strong>
                    {smallBills.length > 1 ? ' are' : ' is'} smaller than the equal share of <strong>{fmt(result.originalPerBill)}</strong>.
                    {result.totalSurplus > 0 && bigBills.length > 0 && (
                        <> The surplus of <strong>{fmt(result.totalSurplus)}</strong> has been redistributed equally to the remaining {bigBills.length} bill{bigBills.length !== 1 ? 's' : ''}.</>
                    )}
                </div>
                {/* INFO BANNER END */}

                {/* BILL ROWS START  */}
                <div className="CM3-alloc-body" style={{ maxHeight: 340 }}>
                    {result.rows.map((row, i) => (
                        <div key={row.bill.id}
                            className={`CM3-alloc-bill${row.isClosed ? ' will-close' : ' will-partial'}`}
                            style={{ cursor: 'default', gap: 12 }}>

                            {/* Status icon Start */}
                            <div style={{
                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                background: row.isClosed ? '#d1fae5' : '#FBC9A8',
                                border: `1px solid ${row.isClosed ? '#6ee7b7' : '#FBC9A8'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11.5, fontWeight: 800,
                                color: row.isClosed ? '#1E9C6A' : '#9A3412',
                            }}>
                                {row.isClosed ? '✓' : String(i + 1).padStart(2, '0')}
                            </div>
                            {/* Status Icon END */}

                            {/* Bill info Start */}
                            <div className="CM3-alloc-info" style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: 11.5, color: 'var(--text-1,#231C14)', marginBottom: 3 }}>
                                    {row.bill.client_name || row.bill.description || `Bill #${row.bill.id}`}
                                </div>
                                <div style={{ fontSize: 9.5, color: '#524532', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span>Balance: {fmt(row.bill.bill_balance)}</span>
                                    {row.isClosed && row.bill.bill_balance < result.originalPerBill - 0.005 && (
                                        <span style={{ color: '#9A3412', fontWeight: 700 }}>
                                            → saved {fmt(result.originalPerBill - row.bill.bill_balance)} surplus
                                        </span>
                                    )}
                                    {row.extraFromRedist > 0 && (
                                        <span style={{ color: '#1E9C6A', fontWeight: 700 }}>
                                            +{fmt(row.extraFromRedist)} from redistribution
                                        </span>
                                    )}
                                </div>
                                {row.isClosed
                                    ? <div className="CM3-alloc-preview closes" style={{ marginTop: 6 }}>
                                        ✓ Bill will be CLOSED — {fmt(row.allocated)} applied
                                    </div>
                                    : <div className="CM3-alloc-preview partial" style={{ marginTop: 6 }}>
                                        Partial — {fmt(row.allocated)} applied · {fmt(row.bill.bill_balance - row.allocated)} still due
                                    </div>
                                }
                            </div>
                            {/* Bill Info End */}

                            {/* Amount Start */}
                            <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 84 }}>
                                <div style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#6B5D48', marginBottom: 4 }}>Allocated</div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, lineHeight: 1,
                                    color: row.isClosed ? '#1E9C6A' : '#C2410C',
                                }}>{fmt(row.allocated)}</div>
                            </div>
                            {/* Amount End */}
                        </div>
                    ))}

                    {/* Total Start */}
                    <div style={{ margin: '10px 0 0', padding: '10px 16px', background: '#F0ECE6', borderRadius: 8, border: '1px solid #E3DDD3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#524532' }}>TOTAL ALLOCATED</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17.5, fontWeight: 800, color: '#231C14' }}>{fmt(totalAmount)}</span>
                    </div>
                    {/* Total End */}

                </div>
                {/* INFO BILLS END */}

                {/* Footer Start  */}
                <div className="CM3-alloc-footer">
                    <button className="CM3-btn ghost" onClick={onCancel}>Cancel — Go Back</button>
                    <button className="CM3-btn payment"
                        style={{ background: 'linear-gradient(135deg,#C2410C,#DB5B1F)', border: 'none' }}
                        onClick={() => onConfirm(result.plan)}>
                        ✓ Confirm &amp; Save Smart Split
                    </button>
                </div>
                {/* Footer End */}
            </div>
        </div>,
        document.body
    );
}

function PaymentModal({ vendor, bioData, categories, subCategories, editPayment, vendorEntries, onClose, onSaved }: {
    vendor: Vendor; bioData: BioData[]; categories: Category[]; subCategories: SubCategory[];
    editPayment?: CreditPayment; vendorEntries?: CreditEntry[];
    onClose: () => void; onSaved: (r: { daybook_synced: boolean }) => void;
}) {
    const isEdit = !!editPayment;
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [errorField, setErrorField] = useState<'amount_paid' | 'daybook_bio_data_id' | 'daybook_category_id' | null>(null);
    const amountFieldRef = useRef<HTMLDivElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const daybookPartyFieldRef = useRef<HTMLDivElement>(null);
    const daybookCategoryFieldRef = useRef<HTMLDivElement>(null);
    const [showAllocModal, setShowAllocModal] = useState(false);
    const [redistData, setRedistData] = useState<{ show: boolean; result: SmartSplitResult | null }>({ show: false, result: null });
    const [celebrate, setCelebrate] = useState<{ show: boolean; amountText: string; sub: string; daybookSynced: boolean } | null>(null);
    const autoCategory = String(vendor.category_id || '');
    const autoSubCategory = String(vendor.sub_category_id || '');
    const matchedBio = bioData.find(b => b.name.toLowerCase().trim() === vendor.party_name.toLowerCase().trim());

    const matchedPayMode = editPayment?.payment_mode
        ? (PAYMENT_MODES.find(m => m.toLowerCase() === editPayment.payment_mode.toLowerCase()) || editPayment.payment_mode)
        : 'Cash';

    const [form, setForm] = useState({
        payment_date: editPayment?.payment_date || todayStr(),
        amount_paid: editPayment ? String(Math.round(Number(editPayment.amount_paid) || 0)) : '',
        payment_mode: matchedPayMode,
        reference: editPayment?.reference || '',
        notes: editPayment?.notes || '',
        sync_to_daybook: isEdit ? false : true,
        daybook_bio_data_id: matchedBio ? String(matchedBio.id) : '',
        daybook_category_id: autoCategory,
        daybook_sub_category_id: autoSubCategory,
        daybook_narration: `Payment — ${vendor.party_name}`,
    });
    const setF = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

    const handleDaybookCatChange = (v: string) => { setForm(p => ({ ...p, daybook_category_id: v, daybook_sub_category_id: '' })); };

    const expCats = categories.filter(c => !c.type || c.type.toLowerCase() === 'expense');
    const allBioOptions = bioData.map(b => ({ value: String(b.id), label: b.name, sub: b.category_name }));
    const expCatOptions = expCats.map(c => ({ value: String(c.id), label: c.name }));
    const daybookSubCats = form.daybook_category_id ? subCategories.filter(s => s.category_ids?.length ? s.category_ids.includes(+form.daybook_category_id) : s.category_id === +form.daybook_category_id) : [];
    const payModeOptions = PAYMENT_MODES.map(m => ({ value: m, label: m }));
    const selDaybookSub = subCategories.find(s => String(s.id) === form.daybook_sub_category_id);
    const openBillClients = [...new Set(
        (vendorEntries ?? []).filter(e => !e.is_paid && e.client_name).map(e => e.client_name!)
    )];
    const previewClientName = openBillClients.length === 1
        ? openBillClients[0]
        : openBillClients.length > 1
            ? 'Auto — varies per bill'
            : null;

    const handleSubmit = async () => {
        if (!form.amount_paid || Math.round(+form.amount_paid) <= 0) {
            setErrorField('amount_paid');
            toast.error('Amount Required', 'Please enter a valid payment amount greater than 0.');
            amountFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            amountInputRef.current?.focus();
            return;
        }
        if (!isEdit && form.sync_to_daybook) {
            if (!form.daybook_bio_data_id) {
                setErrorField('daybook_bio_data_id');
                toast.error('Party Required', 'Select a Party Name to sync with Cash Book.');
                daybookPartyFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            if (!form.daybook_category_id) {
                setErrorField('daybook_category_id');
                toast.error('Account Head Required', 'Select an Account Head to sync with Cash Book.');
                daybookCategoryFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }
        setErrorField(null);
        setMsg('');
        if (isEdit && editPayment) {
            setSaving(true);
            const basicPayload = { payment_date: form.payment_date, amount_paid: Math.round(+form.amount_paid), payment_mode: form.payment_mode, reference: form.reference || null, notes: form.notes || null };
            try {
                await axiosInstance.put(`credit-management/payments/${editPayment.id}`, basicPayload, { headers: authHeader() });
                toast.success('Payment Updated!', `Payment #${editPayment.id} updated successfully`);
                onSaved({ daybook_synced: false });
            } catch (e: any) {
                const m = apiErrMsg(e, 'Update failed');
                setMsg(m); setSaving(false);
                toast.error('Update Failed', m);
            }
            return;
        }
        const openBills = vendorEntries?.filter(e => !e.is_paid) ?? [];
        if (openBills.length > 0) {
            setShowAllocModal(true);
        } else {
            handleConfirmedSave([]);
        }
    };

    const handleConfirmedSave = async (plan: AllocPlanEntry[]) => {
        setSaving(true); setMsg('');
        const H = authHeader();
        const totalAmount = Math.round(+form.amount_paid);
        try {
            type SavedPayment = { paymentId: number; amount: number; entryId: number | null };
            const savedPayments: SavedPayment[] = [];

            if (plan.length === 0) {
                const openBills = vendorEntries?.filter(e => !e.is_paid) ?? [];
                if (openBills.length > 0) {
                    const perBill = Math.floor(totalAmount / openBills.length);
                    for (let i = 0; i < openBills.length; i++) {
                        const bill = openBills[i];
                        const allocAmt = i === openBills.length - 1
                            ? Math.round(totalAmount - perBill * (openBills.length - 1))
                            : perBill;
                        const allocCapped = Math.min(allocAmt, Math.round(bill.bill_balance));
                        const pmRes = await axiosInstance.post(`credit-management/vendors/${vendor.id}/payments`, {
                            payment_date: form.payment_date, amount_paid: allocCapped,
                            payment_mode: form.payment_mode, reference: form.reference || null, notes: form.notes || null,
                            credit_entry_id: bill.id,
                        }, { headers: H });
                        const pid = pmRes.data.data?.id;
                        if (pid) savedPayments.push({ paymentId: pid, amount: allocCapped, entryId: bill.id });
                    }
                } else {
                    const distinctClients = new Set((vendorEntries || []).map(e => (e.client_name || '').trim()).filter(Boolean));
                    const soleVendorClient = distinctClients.size === 1 ? [...distinctClients][0] : undefined;
                    const pmRes = await axiosInstance.post(`credit-management/vendors/${vendor.id}/payments`, {
                        payment_date: form.payment_date, amount_paid: totalAmount,
                        payment_mode: form.payment_mode, reference: form.reference || null, notes: form.notes || null,
                        ...(soleVendorClient ? { client_name: soleVendorClient } : {}),
                    }, { headers: H });
                    const pid = pmRes.data.data?.id;
                    if (pid) savedPayments.push({ paymentId: pid, amount: totalAmount, entryId: null });
                }
            } else {
                for (const alloc of plan) {
                    const pmRes = await axiosInstance.post(`credit-management/vendors/${vendor.id}/payments`, {
                        payment_date: form.payment_date, amount_paid: alloc.amount,
                        payment_mode: form.payment_mode, reference: form.reference || null, notes: form.notes || null,
                        ...(alloc.entry_id > 0 ? { credit_entry_id: alloc.entry_id } : {}),
                        ...(alloc.entry_id <= 0 && alloc.client_name ? { client_name: alloc.client_name } : {}),
                    }, { headers: H });
                    const pid = pmRes.data.data?.id;
                    if (pid) savedPayments.push({ paymentId: pid, amount: alloc.amount, entryId: alloc.entry_id > 0 ? alloc.entry_id : null });
                }
            }

            let daybookSynced = false;
            if (form.sync_to_daybook && savedPayments.length > 0) {
                const nowStr = new Date().toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true,
                });
                try {
                    for (const sp of savedPayments) {
                        const billEntry = sp.entryId ? vendorEntries?.find(e => e.id === sp.entryId) : null;
                        const billClientName = billEntry?.client_name ?? null;
                        const billPart = billClientName || (sp.entryId ? `Bill #${sp.entryId}` : 'General');
                        const narration = (form.daybook_narration && savedPayments.length === 1)
                            ? form.daybook_narration
                            : `Payment — ${vendor.party_name} | ${billPart} | ₹${sp.amount.toLocaleString('en-IN')} | ${nowStr}`;
                        const daybookPayload: Record<string, any> = {
                            transaction_date: form.payment_date,
                            amount: sp.amount,
                            payment_mode: form.payment_mode,
                            category_id: +form.daybook_category_id,
                            bio_data_id: +form.daybook_bio_data_id,
                            narration,
                            ...(billClientName ? { client_name: billClientName } : {}),
                        };
                        if (form.daybook_sub_category_id) daybookPayload.sub_category_id = +form.daybook_sub_category_id;
                        const dbRes = await axiosInstance.post('daybook', daybookPayload, { headers: H });
                        const dbEntryId = dbRes.data.entry?.id;
                        if (dbEntryId) {
                            try { await axiosInstance.put(`credit-management/payments/${sp.paymentId}`, { daybook_entry_id: dbEntryId }, { headers: H }); } catch { }
                        }
                    }
                    daybookSynced = true;
                } catch (syncErr: any) {
                    setMsg(`Payment saved, Cash Book sync failed: ${syncErr.response?.data?.message || syncErr.message}`);
                    setSaving(false); onSaved({ daybook_synced: false }); return;
                }
            }
            setSaving(false);
            window.dispatchEvent(new Event('erp:notifications-refresh'));
            setCelebrate({
                show: true,
                amountText: `${fmt(totalAmount)}${daybookSynced ? ' · Synced to Cash Book' : ''}`,
                sub: vendor.party_name,
                daybookSynced,
            });
        } catch (e: any) { const m = apiErrMsg(e, 'Could not record payment'); setMsg(m); toast.error(isEdit ? 'Update Failed' : 'Payment Failed', m); setSaving(false); }
    };

    const portal = createPortal(
        <div className="CM3-overlay" onClick={onClose}>
            <div className="CM3-modal CM3-modal-lg" onClick={e => e.stopPropagation()}>
                {celebrate?.show && (
                    <SuccessCelebration
                        title="PAYMENT RECORDED!"
                        sub={celebrate.sub}
                        amountText={celebrate.amountText}
                        onDone={() => onSaved({ daybook_synced: celebrate.daybookSynced })}
                    />
                )}

                <div className="CM3-mhdr payment-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="CM3-mhdr-ic">
                            <Ic n="cash" sz={17} c="#C2410C" />
                        </div>
                        <div>
                            <div className="CM3-mtitle">{isEdit ? 'Edit Payment' : 'Record Payment'}</div>
                            <div className="CM3-msub" style={{ color: '#C2410C', fontSize: 11.5, fontWeight: 800 }}>
                                {vendor.party_name} · {vendor.category_name}{vendor.sub_category_name ? ` › ${vendor.sub_category_name}` : ''}
                                {isEdit ? ` · Editing payment #${editPayment?.id}` : ` · Outstanding: ${fmt(vendor.balance)}`}
                            </div>
                        </div>
                    </div>
                    <button className="CM3-mclose" onClick={onClose} title="Close" aria-label="Close"><Ic n="x" sz={18} /></button>
                </div>

                <div className="CM3-mbody">
                    {/* Edit Mode: original record snapshot Start */}
                    {isEdit && editPayment && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'center', padding: '10px 14px', background: PAYMENT_COLOR.light, border: `1px solid ${PAYMENT_COLOR.border}`, borderRadius: 10, marginBottom: 16, fontSize: 9.5 }}>
                            <span style={{ fontWeight: 800, color: PAYMENT_COLOR.primary, textTransform: 'uppercase', fontSize: 8, letterSpacing: '0.06em' }}>Editing Payment #{editPayment.id}</span>
                            <span style={{ color: 'var(--text-3,#524532)' }}>Original Amount: <strong style={{ color: 'var(--text-1,#231C14)' }}>{fmt(editPayment.amount_paid)}</strong></span>
                            {editPayment.client_name && (
                                <span style={{ color: 'var(--text-3,#524532)' }}>Client: <strong style={{ color: 'var(--text-1,#231C14)' }}>{editPayment.client_name}</strong></span>
                            )}
                            {(editPayment.bill_number || editPayment.bill_description) && (
                                <span style={{ color: 'var(--text-3,#524532)' }}>Linked Bill: <strong style={{ color: 'var(--text-1,#231C14)' }}>{editPayment.bill_number ? `#${editPayment.bill_number}` : editPayment.bill_description}</strong></span>
                            )}
                            <span style={{ color: 'var(--text-3,#524532)' }}>
                                Cash Book: {editPayment.daybook_entry_id
                                    ? <strong style={{ color: PAYMENT_COLOR.primary }}>Synced (DB #{editPayment.daybook_entry_id})</strong>
                                    : <strong style={{ color: 'var(--text-4,#6B5D48)' }}>Not synced</strong>}
                            </span>
                        </div>
                    )}
                    {/* Edit Mode: original record snapshot End */}

                    {/* Cash Book Start */}
                    <div className="CM3-notice teal">
                        <Ic n="sync" sz={13} c={PAYMENT_COLOR.primary} />
                        {isEdit
                            ? <div><strong>Editing repayment details</strong> — Cash Book sync settings are locked once recorded; only date, amount, mode, reference & notes can be updated here.</div>
                            : <div><strong>Auto-syncs to Cash Book</strong> — category, sub-category, party & client auto-filled from ledger profile</div>}
                    </div>
                    {/* Cash Book End */}

                    {/* ── 01 Payment Details Start ── */}
                    <div className="CM3-section"><span className="CM3-section-tag">01 — Payment Details</span><div className="CM3-section-rule" /></div>
                    <div className="CM3-grid2 CM3-pd-grid">

                        {/* Payment Date Start */}
                        <div className="CM3-field">
                            <label className="CM3-label">Payment Date <span className="req">*</span></label>
                            <CalendarDD value={form.payment_date} onChange={v => setF('payment_date', v)} />
                        </div>
                        {/* Payment Date End */}

                        {/* Amount Paid Start */}
                        <div className={`CM3-field${errorField === 'amount_paid' ? ' err' : ''}`} ref={amountFieldRef}>
                            <label className="CM3-label">Amount Paid (₹) <span className="req">*</span></label>
                            <input autoComplete="off" ref={amountInputRef} type="number" step="1" min="0" className="CM3-input"
                                placeholder={`Max: ${fmt(vendor.balance)}`}
                                value={form.amount_paid}
                                onChange={e => { setF('amount_paid', e.target.value.replace(/[.,].*$/, '')); if (errorField === 'amount_paid') setErrorField(null); }}
                                style={{ borderColor: PAYMENT_COLOR.border }} />
                            {errorField === 'amount_paid' && <div className="CM3-field-err-msg">Enter a valid amount greater than 0</div>}
                        </div>
                        {/* Amount Paid End */}

                        {/* Payment Mode Start */}
                        <div className="CM3-field">
                            <SDD label="Payment Mode" required accent={PAYMENT_COLOR.primary}
                                options={payModeOptions} value={form.payment_mode}
                                onChange={v => setF('payment_mode', v)} placeholder="Select mode…" />
                        </div>
                        {/* Payment Mode End */}

                        {/* Reference Number Start */}
                        <div className="CM3-field">
                            <label className="CM3-label">Reference / UTR</label>
                            <input autoComplete="off" type="text" className="CM3-input" placeholder="Cheque / UPI ID / UTR…" value={form.reference} onChange={e => setF('reference', e.target.value)} />
                        </div>
                        {/* Reference Number End */}

                        {/* Notes Start */}
                        <div className="CM3-field" style={{ gridColumn: '1/-1' }}>
                            <label className="CM3-label">Notes</label>
                            <input autoComplete="off" type="text" className="CM3-input" placeholder="Internal note…" value={form.notes} onChange={e => setF('notes', e.target.value)} />
                        </div>
                        {/* Notes End */}
                    </div>
                    {/* ── 01 Payment Details End ── */}

                    {/* ── 02 Cash Book ── */}
                    {!isEdit && <><div className="CM3-section"><span className="CM3-section-tag">02 — Cash Book Sync</span><div className="CM3-section-rule" /></div>
                        <div className="CM3-db-box">
                            <label className="CM3-db-toggle">
                                <input autoComplete="off" type="checkbox" checked={form.sync_to_daybook}
                                    onChange={e => setF('sync_to_daybook', e.target.checked)}
                                    style={{ width: 16, height: 16, accentColor: PAYMENT_COLOR.primary }} />
                                <div>
                                    <div className="CM3-db-toggle-title"><Ic n="book" sz={11} c="currentColor" /> Post to Cash Book Automatically</div>
                                    <div className="CM3-db-toggle-sub">Creates matching expense entry in Cash Book</div>
                                </div>
                            </label>
                            {form.sync_to_daybook && (
                                <div style={{ marginTop: 10 }}>
                                    <div className="CM3-db-grid">
                                        <div className={`CM3-field${errorField === 'daybook_bio_data_id' ? ' err' : ''}`} ref={daybookPartyFieldRef}>
                                            <SDD label="Party Name in Cash Book" required accent={PAYMENT_COLOR.primary}
                                                options={allBioOptions} value={form.daybook_bio_data_id}
                                                onChange={v => { setF('daybook_bio_data_id', v); if (errorField === 'daybook_bio_data_id') setErrorField(null); }} placeholder="Select party…" />
                                            {matchedBio && form.daybook_bio_data_id === String(matchedBio.id) && (
                                                <div className="CM3-db-hint">✓ Auto-matched: {matchedBio.name}</div>
                                            )}
                                            {errorField === 'daybook_bio_data_id' && <div className="CM3-field-err-msg">Party Name is required</div>}
                                        </div>
                                        <div className={`CM3-field${errorField === 'daybook_category_id' ? ' err' : ''}`} ref={daybookCategoryFieldRef}>
                                            <SDD label="Expense Account Head" required accent={PAYMENT_COLOR.primary}
                                                options={expCatOptions} value={form.daybook_category_id}
                                                onChange={v => { handleDaybookCatChange(v); if (errorField === 'daybook_category_id') setErrorField(null); }} placeholder="Select category…" />
                                            {autoCategory && form.daybook_category_id === autoCategory && (
                                                <div className="CM3-db-hint">✓ Auto-filled: {vendor.category_name}</div>
                                            )}
                                            {errorField === 'daybook_category_id' && <div className="CM3-field-err-msg">Account Head is required</div>}
                                        </div>
                                        <div className="CM3-field">
                                            <SDD label="Account Sub-Head" accent={PAYMENT_COLOR.primary}
                                                options={daybookSubCats.map(s => ({ value: String(s.id), label: s.name }))}
                                                value={form.daybook_sub_category_id} onChange={v => setF('daybook_sub_category_id', v)}
                                                placeholder={!form.daybook_category_id ? 'Select category first…' : daybookSubCats.length === 0 ? 'No sub-categories' : 'Select sub-category…'}
                                                disabled={!form.daybook_category_id || daybookSubCats.length === 0}
                                                emptyMsg="No sub-categories" />
                                        </div>
                                        <div className="CM3-field" style={{ gridColumn: '1/-1' }}>
                                            <label className="CM3-field-label">Client Name</label>
                                            <div className="CM3-db-client-box">
                                                {previewClientName ? (
                                                    <>
                                                        <Ic n="client" sz={10} c={PAYMENT_COLOR.primary} />
                                                        <span style={{ fontSize: 8.5, fontWeight: 800, color: '#231C14' }}>{previewClientName}</span>
                                                        <span style={{ fontSize: 7.5, color: PAYMENT_COLOR.primary, marginLeft: 'auto', fontWeight: 700 }}>Auto-filled from bill</span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: 8, color: '#8C7C63', fontWeight: 700, fontStyle: 'normal' }}>No client assigned to open bills</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="CM3-field" style={{ gridColumn: '1/-1' }}>
                                            <label className="CM3-field-label">Cash Book Narration</label>
                                            <input autoComplete="off" type="text" className="CM3-input" value={form.daybook_narration}
                                                onChange={e => setF('daybook_narration', e.target.value)}
                                                placeholder="Narration for daybook entry…" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>}
                    {/* ── 03 Cash Book ──  */}
                </div>

                {/* Cancel Start */}
                <div className="CM3-mfoot">
                    <button className="CM3-btn ghost" onClick={onClose}>Cancel</button>
                    <button className="CM3-btn payment" onClick={handleSubmit} disabled={saving}>
                        {saving
                            ? <><span className="CM3-spin" /> {isEdit ? 'Updating…' : (form.sync_to_daybook ? 'Saving & Syncing…' : 'Saving…')}</>
                            : isEdit
                                ? <><Ic n="edit" sz={12} c="#faf9f7" /> Update Payment</>
                                : <><Ic n="check" sz={12} c="#faf9f7" /> Add Payment</>}
                    </button>
                </div>
                {/* Cancel End */}

            </div>
        </div>
        , document.body);

    const allocation = showAllocModal && vendorEntries ? (
        <BillAllocateModal
            paymentAmount={Math.round(+form.amount_paid)}
            paymentDate={form.payment_date}
            entries={vendorEntries}
            onPlanConfirmed={(plan) => { setShowAllocModal(false); handleConfirmedSave(plan); }}
            onSkip={() => {
                setShowAllocModal(false);
                const openBills = (vendorEntries ?? []).filter(e => !e.is_paid);
                const result = computeSmartSplit(Math.round(+form.amount_paid), openBills);
                if (result.hasRedist) {
                    setRedistData({ show: true, result });
                } else {
                    handleConfirmedSave([]);
                }
            }}
            onClose={() => setShowAllocModal(false)}
        />
    ) : null;

    const redistModal = redistData.show && redistData.result ? (
        <SmartSplitPreviewModal
            totalAmount={Math.round(+form.amount_paid)}
            result={redistData.result}
            onConfirm={(plan) => { setRedistData({ show: false, result: null }); handleConfirmedSave(plan); }}
            onCancel={() => setRedistData({ show: false, result: null })}
        />
    ) : null;

    return <>{portal}{allocation}{redistModal}</>;
}

// ─── VENDOR DETAIL ──────────
function VendorDetail({ vendor, onReload, onVendorDeleted, bioData, categories, subCategories }: {
    vendor: Vendor; onReload: () => void; onVendorDeleted: () => void; bioData: BioData[];
    categories: Category[]; subCategories: SubCategory[];
}) {
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: number; ids?: number[]; name: string; loading: boolean }>({ open: false, type: '', id: 0, name: '', loading: false });
    const [detail, setDetail] = useState<{ vendor: Vendor; entries: CreditEntry[]; payments: CreditPayment[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'entries' | 'payments' | 'timeline' | 'clients'>('entries');
    const [expandedClient, setExpandedClient] = useState<string | null>(null);
    const [showCredit, setShowCredit] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');
    const [editEntry, setEditEntry] = useState<CreditEntry | null>(null);
    const [editPayment, setEditPayment] = useState<CreditPayment | null>(null);
    const [billPage, setBillPage] = useState(1);
    const [billPerPage, setBillPerPage] = useState(10);
    const [pmPage, setPmPage] = useState(1);
    const [pmPerPage, setPmPerPage] = useState(10);
    const [userRole] = useState<string>(() => getStoredRole());
    const loadDetail = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/credit-management/vendors/${vendor.id}`, { headers: authHeader() });
            setDetail({ vendor: data.data, entries: data.data.entries || [], payments: data.data.payments || [] });
        } catch (e) { console.error(e); }
        finally { if (!silent) setLoading(false); }
    }, [vendor.id]);
    useEffect(() => { loadDetail(); }, [loadDetail]);
    const handleDelEntry = (id: number) => { setDeleteModal({ open: true, type: "entry", id, name: "this credit entry", loading: false }); };
    const handleDelPayment = (id: number) => { setDeleteModal({ open: true, type: "payment", id, name: "this payment", loading: false }); };

    if (loading) return (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[80, 60, 60, 60].map((h, i) => <div key={i} className="CM3-skel" style={{ height: h }} />)}
        </div>
    );

    const v = detail?.vendor ?? vendor;
    const sc = STATUS_CONFIG[v.status];
    const vc = vendorColor(v.party_name);
    const entries = detail?.entries ?? [];
    const payments = detail?.payments ?? [];
    type TL = { type: 'cr' | 'pm'; date: string; label: string; sub: string; amount: number; synced?: boolean; };
    const timeline: TL[] = [
        ...entries.map(e => ({ type: 'cr' as const, date: e.credit_date, label: e.client_name ? `${e.client_name} — ${v.party_name}` : v.party_name, sub: e.description || e.bill_number || `Bill #${e.id}`, amount: e.credit_amount })),
        ...payments.map(p => ({ type: 'pm' as const, date: p.payment_date, label: p.client_name ? `${p.client_name} — ${v.party_name}` : v.party_name, sub: `${p.payment_mode}${p.reference ? ` · ${p.reference}` : ''}`, amount: p.amount_paid, synced: !!p.daybook_entry_id })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    type ClientGroup = { name: string; entries: CreditEntry[]; totalBilled: number; totalPaid: number; balance: number; };
    const clientGroups: ClientGroup[] = [];
    const clientMap = new Map<string, ClientGroup>();
    for (const e of entries) {
        const key = e.client_name || '(No Client)';
        if (!clientMap.has(key)) clientMap.set(key, { name: key, entries: [], totalBilled: 0, totalPaid: 0, balance: 0 });
        const g = clientMap.get(key)!;
        g.entries.push(e);
        g.totalBilled += e.credit_amount;
        g.totalPaid += e.amount_paid;
        g.balance = g.totalBilled - g.totalPaid;
    }
    clientMap.forEach(g => clientGroups.push(g));
    clientGroups.sort((a, b) => b.balance - a.balance);
    const paidPct = v.total_credit > 0 ? Math.min(100, (v.total_paid / v.total_credit) * 100) : 0;

    // ── Bills table: compact tabular view (read-only rows — no click-to-select) so
    // a client with many bills doesn't need endless scrolling through big cards.
    const sortedBillEntries = [...entries].sort((a, b) => {
        if (a.is_paid !== b.is_paid) return a.is_paid ? 1 : -1;
        const pOrd: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (pOrd[a.priority] ?? 3) - (pOrd[b.priority] ?? 3);
    });
    const billTotalPages = Math.max(1, Math.ceil(sortedBillEntries.length / billPerPage));
    const billSafePage = Math.min(billPage, billTotalPages);
    const pagedBillEntries = sortedBillEntries.slice((billSafePage - 1) * billPerPage, billSafePage * billPerPage);
    const pmTotalPages = Math.max(1, Math.ceil(payments.length / pmPerPage));
    const pmSafePage = Math.min(pmPage, pmTotalPages);
    const pagedPayments = payments.slice((pmSafePage - 1) * pmPerPage, pmSafePage * pmPerPage);

    return (
        <>
            <div className="CM3-detail">
                {/* Vendor Header Start */}
                <div className="CM3-vhdr">

                    {/* Category Name Start */}
                    <div className="CM3-vhdr-left">
                        <div className="CM3-vhdr-avatar" style={{ background: vc.bg, color: vc.color, borderColor: vc.border }}>
                            {v.party_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="CM3-vhdr-name">{v.party_name}</div>
                            <div className="CM3-vhdr-cat">{v.category_name}{v.sub_category_name ? ` › ${v.sub_category_name}` : ''}</div>
                            {clientGroups.length > 0 && (
                                <div className="CM3-vhdr-client-strip">
                                    <Ic n="client" sz={11} c={PAYMENT_COLOR.primary} />
                                    <span className="CM3-vhdr-client-label">{clientGroups.length} client{clientGroups.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span className="CM3-tag" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                                    <span className="CM3-dot" style={{ background: sc.color }} />{sc.label}
                                    {v.days_overdue > 0 && ` · ${v.days_overdue}d`}
                                </span>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#3A3024' }}>{v.entry_count} bills · {v.payment_count} payments</span>
                            </div>
                        </div>
                    </div>
                    {/* Category Name End */}

                    {/* Button Start */}
                    <div className="CM3-vhdr-actions">

                        {/* Add Bill Start */}
                        <button className="CM3-act credit" onClick={() => setShowCredit(true)}>
                            <Ic n="receipt" sz={13} c="#faf9f7" /> Add Bill
                        </button>
                        {/* Add Bill End */}

                        {/* Repayment Start */}
                        <button className="CM3-act payment" disabled={v.balance <= 0} onClick={() => setShowPayment(true)}>
                            <Ic n="cash" sz={13} c="#faf9f7" /> Repayment
                        </button>
                        {/* Repayment End */}

                        {/* Edit Start */}
                        <button className="CM3-act ghost" onClick={() => setShowEdit(true)}>
                            <Ic n="edit" sz={13} c="currentColor" /> Edit
                        </button>
                        {/* Edit End */}

                    </div>
                    {/* Button End */}

                </div>
                {/* Vendor Header End */}

                {/* Balance Strip Start */}
                <div style={{ borderBottom: '1.5px solid var(--border,#E8E2D8)' }}>
                    <div className="CM3-bal-strip">
                        {/* Total Credit Start */}
                        <div className="CM3-bal-cell">
                            <div className="CM3-bal-lbl"><Ic n="down" sz={9} c={CREDIT_COLOR.mid} />Total Credit</div>
                            <div className="CM3-bal-val credit-color">{fmt(v.total_credit)}</div>
                        </div>
                        {/* Total Credit End */}

                        {/* Total Repaid Start */}
                        <div className="CM3-bal-cell">
                            <div className="CM3-bal-lbl"><Ic n="up" sz={9} c={PAYMENT_COLOR.primary} />Total Repaid</div>
                            <div className="CM3-bal-val payment-color">{fmt(v.total_paid)}</div>
                        </div>
                        {/* Total Repaid End */}

                        {/* Balance Due Start */}
                        <div className="CM3-bal-cell">
                            <div className="CM3-bal-lbl"><Ic n="scale" sz={9} c="#9A3412" />Balance Due</div>
                            <div className="CM3-bal-val balance-color">{fmt(v.balance)}</div>
                        </div>
                        {/* Balance Due End */}
                    </div>
                </div>
                {/* Balance Strip End */}

                {/* Progress Start */}
                {v.total_credit > 0 && (
                    <div className="CM3-prog">
                        <div className="CM3-prog-bar"><div className="CM3-prog-fill" style={{ width: `${paidPct}%` }} /></div>
                        <span className="CM3-prog-txt">{Math.round(paidPct)}% repaid</span>
                        <span style={{ fontSize: 9, color: '#524532', fontWeight: 800, marginLeft: 8 }}>Last: {fmtDate(v.last_transaction_date)}</span>
                    </div>
                )}
                {/* Progress End */}

                {syncMsg && (
                    <div className="CM3-sync-banner">
                        <Ic n="circle" sz={16} c={PAYMENT_COLOR.primary} />
                        <span><strong>Cash Book Synced —</strong> {syncMsg}</span>
                    </div>
                )}

                {/* Tabs Start */}
                <div className="CM3-tabs-bar">
                    <div className="CM3-tabs">
                        <button className={`CM3-tab credit-tab${tab === 'entries' ? ' on' : ''}`} onClick={() => setTab('entries')}>Bills ({entries.length})</button>
                        <button className={`CM3-tab payment-tab${tab === 'payments' ? ' on' : ''}`} onClick={() => setTab('payments')}>Payments ({payments.length})</button>
                        <button className={`CM3-tab${tab === 'clients' ? ' on' : ''}`} onClick={() => setTab('clients')} style={{ color: tab === 'clients' ? PAYMENT_COLOR.primary : undefined }}>By Client ({clientGroups.length})</button>
                        <button className={`CM3-tab tl-tab${tab === 'timeline' ? ' on' : ''}`} onClick={() => setTab('timeline')}>Timeline</button>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {tab === 'entries' && <button className="CM3-tab-add credit" onClick={() => setShowCredit(true)}><Ic n="plus" sz={11} c="currentColor" /> Bill</button>}
                        {tab === 'payments' && <button className="CM3-tab-add payment" onClick={() => setShowPayment(true)}><Ic n="plus" sz={11} c="currentColor" /> Repayment</button>}
                    </div>
                </div>
                {/* Tabs End */}

                {/* Content */}
                <div className="CM3-content">
                    {tab === 'entries' && (
                        entries.length === 0 ? (
                            <div className="CM3-empty">
                                <div className="CM3-empty-ic credit-empty"><Ic n="inbox" sz={22} c={CREDIT_COLOR.mid} /></div>
                                <div className="CM3-empty-title">No Bills Yet</div>
                                <div className="CM3-empty-sub">Add bills to track credit</div>
                            </div>
                        ) : (
                            <>
                                <div className="CM3-billtbl-wrap">
                                    <table className="CM3-billtbl">
                                        <colgroup>
                                            <col className="c-sno" /><col className="c-client" />
                                            <col className="c-date" />
                                            <col className="c-credit" /><col className="c-paid" /><col className="c-balance" />
                                            <col className="c-status" /><col className="c-acts" />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th>S.no</th>
                                                <th>Client</th>
                                                <th>Date</th>
                                                <th style={{ textAlign: 'right' }}>Credit Amt</th>
                                                <th style={{ textAlign: 'right' }}>Paid</th>
                                                <th style={{ textAlign: 'right' }}>Balance</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedBillEntries.map((e, eIdx) => {
                                                const billNum = String((billSafePage - 1) * billPerPage + eIdx + 1).padStart(2, '0');
                                                const daysUntilDue = e.due_date
                                                    ? Math.ceil((new Date(e.due_date).getTime() - Date.now()) / 86400000)
                                                    : null;
                                                const isOverdue = !e.is_paid && daysUntilDue !== null && daysUntilDue < 0;
                                                const isNearDue = !e.is_paid && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 5;
                                                const settledDate = e.settled_at || e.updated_at || e.credit_date;
                                                const settledD = e.is_paid && settledDate ? new Date(settledDate) : null;

                                                return (
                                                    <tr key={e.id}
                                                        className={e.is_paid ? 'row-closed' : ''}
                                                        style={{ animationDelay: `${eIdx * 25}ms` }}>
                                                        <td><span className="CM3-billtbl-sno">{billNum}</span></td>
                                                        <td>{e.client_name ? (
                                                            <span className="CM3-billtbl-client">{e.client_name}</span>
                                                        ) : <span style={{ color: 'var(--text-4,#6B5D48)' }}>—</span>}</td>
                                                        <td>{fmtDate(e.credit_date)}</td>
                                                        <td className="CM3-billtbl-amt" style={{ textAlign: 'right' }}>{fmt(e.credit_amount)}</td>
                                                        <td className="CM3-billtbl-amt paid" style={{ textAlign: 'right' }}>{fmt(e.amount_paid)}</td>
                                                        <td className="CM3-billtbl-amt due" style={{ textAlign: 'right' }}>{e.is_paid ? '—' : fmt(e.bill_balance)}</td>
                                                        <td>
                                                            {e.is_paid ? (
                                                                <span className="CM3-billtbl-status closed">Settled{settledD ? ` · ${settledD.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}</span>
                                                            ) : isOverdue ? (
                                                                <span className="CM3-billtbl-status overdue">Overdue</span>
                                                            ) : isNearDue ? (
                                                                <span className="CM3-billtbl-status near">Due Soon</span>
                                                            ) : (
                                                                <span className="CM3-billtbl-status open">To Repay</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="CM3-billtbl-acts">
                                                                <button className="ERP-tbtn edit" title="Edit" onClick={() => setEditEntry(e)}>Edit</button>
                                                                {canDelete(userRole) ? (
                                                                    <button className="ERP-tbtn delete" title="Delete" onClick={() => handleDelEntry(e.id)}>Delete</button>
                                                                ) : (
                                                                    <CreatorBadge name={e.created_by_name} />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {sortedBillEntries.length > 0 && (
                                    <Pagination
                                        page={billSafePage}
                                        totalPages={billTotalPages}
                                        onPageChange={setBillPage}
                                        total={sortedBillEntries.length}
                                        perPage={billPerPage}
                                        onPerPageChange={n => { setBillPerPage(n); setBillPage(1); }}
                                        itemLabel="bills"
                                    />
                                )}
                            </>
                        )
                    )}

                    {tab === 'payments' && (
                        <>
                            {/* Repayments Header Bar Start */}
                            <div className="CM3-pm-hdr">
                                <div className="CM3-pm-hdr-title">
                                    <div className="CM3-pm-hdr-dot" />
                                    Repayment History · {payments.length} entries
                                </div>
                                <div className="CM3-pm-hdr-total">
                                    −{fmt(payments.reduce((s, p) => s + Number(p.amount_paid), 0))} total
                                </div>
                            </div>
                            {/* Repayments Header Bar End */}

                            {payments.length === 0 ? (
                                <div className="CM3-empty" style={{ padding: '40px 16px' }}>
                                    <div className="CM3-empty-ic payment-empty"><Ic n="cash" sz={22} c={PAYMENT_COLOR.primary} /></div>
                                    <div className="CM3-empty-title">No Payments Yet</div>
                                    <div className="CM3-empty-sub">Record a repayment — auto-posts to Cash Book</div>
                                </div>
                            ) : pagedPayments.map((pm, pmIdx) => {
                                const pmNum = String((pmSafePage - 1) * pmPerPage + pmIdx + 1).padStart(2, '0');
                                const pmTitle = pm.client_name ? `${pm.client_name} — ${v.party_name}` : v.party_name;
                                return (
                                    <div className="CM3-pmc" key={pm.id} style={{ animationDelay: `${pmIdx * 40}ms` }}>

                                        {/* Payment Number + Icon Start */}
                                        <div className="CM3-pmc-left">
                                            <div className="CM3-pmc-num-lbl">PAY</div>
                                            <div className="CM3-pmc-num">{pmNum}</div>
                                            <div className="CM3-pmc-icon-ring">
                                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#A6491D" strokeWidth={2.5} strokeLinecap="round">
                                                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Payment Number + Icon End */}

                                        {/* CENTER: Details */}
                                        <div className="CM3-pmc-body">
                                            {/* PAYMENT MODE START */}
                                            <div className="CM3-pmc-row1">
                                                <span className="CM3-pmc-vendor">{pmTitle}</span>
                                                <span className="CM3-pmc-mode">{pm.payment_mode}</span>
                                            </div>
                                            {/* PAYMENT MODE END */}

                                            {/* REFERENCE START */}
                                            <div className="CM3-pmc-row2">
                                                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                                <span className="CM3-pmc-desc">{fmtDate(pm.payment_date)}</span>
                                                {pm.reference && (
                                                    <><span className="CM3-pmc-dot">·</span>
                                                        <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth={2}><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                                        <span className="CM3-pmc-desc">{pm.reference}</span></>
                                                )}
                                            </div>
                                            {/* REFERENCE END */}

                                            {/* ROW 3: CHIPS START */}
                                            <div className="CM3-pmc-row3">
                                                {pm.daybook_entry_id ? (
                                                    <span className="CM3-pmc-chip synced">
                                                        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6 9 17l-5-5" /></svg>
                                                        DB #{pm.daybook_entry_id} Synced
                                                    </span>
                                                ) : (
                                                    <span className="CM3-pmc-chip unsynced">
                                                        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                        Not in Cash Book
                                                    </span>
                                                )}
                                                {pm.reference && <span className="CM3-pmc-chip ref">#{pm.reference}</span>}
                                                {pm.client_name && (
                                                    <span className="CM3-pmc-chip client">
                                                        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                        {pm.client_name}
                                                    </span>
                                                )}
                                                {pm.notes && (
                                                    <span className="CM3-pmc-chip date" title={pm.notes}>
                                                        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                                        Note
                                                    </span>
                                                )}
                                            </div>
                                            {/* ROW 3: CHIPS END */}
                                        </div>

                                        {/* AMOUNT PAID START */}
                                        <div className="CM3-pmc-right">
                                            <div className="CM3-pmc-amt">−{fmt(pm.amount_paid)}</div>
                                            <span className="CM3-pmc-status">✓ REPAID</span>
                                        </div>
                                        {/* AMOUNT PAID END */}

                                        {/* ACTION BUTTON START */}
                                        <div className="CM3-pmc-acts">
                                            <button className="CM3-pmc-act edit" title="Edit" onClick={() => setEditPayment(pm)}>Edit</button>
                                            {canDelete(userRole) ? (
                                                <button className="CM3-pmc-act del" title="Delete" onClick={() => handleDelPayment(pm.id)}>Delete</button>
                                            ) : (
                                                <CreatorBadge name={pm.created_by_name} />
                                            )}
                                        </div>
                                        {/* ACTION BUTTON END */}
                                    </div>
                                );
                            })}
                            {payments.length > 0 && (
                                <Pagination
                                    page={pmSafePage}
                                    totalPages={pmTotalPages}
                                    onPageChange={setPmPage}
                                    total={payments.length}
                                    perPage={pmPerPage}
                                    onPerPageChange={n => { setPmPerPage(n); setPmPage(1); }}
                                    itemLabel="repayments"
                                />
                            )}
                        </>
                    )}

                    {tab === 'clients' && (
                        clientGroups.length === 0 ? (
                            <div className="CM3-empty">
                                <div className="CM3-empty-ic" style={{ background: 'rgba(166,73,29,0.08)', border: '1.5px solid rgba(166,73,29,0.2)' }}><Ic n="client" sz={22} c={PAYMENT_COLOR.primary} /></div>
                                <div className="CM3-empty-title">No Clients Yet</div>
                                <div className="CM3-empty-sub">Client names appear here once bills are added</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {clientGroups.map((cg, ci) => {
                                    const isOpen = expandedClient === cg.name;
                                    const cgColor = vendorColor(cg.name);
                                    const cgPct = cg.totalBilled > 0 ? Math.min(100, (cg.totalPaid / cg.totalBilled) * 100) : 0;
                                    const cgPmts = payments.filter(p => (p.client_name || '(No Client)') === cg.name);
                                    return (
                                        <div key={ci} style={{ border: `1.5px solid var(--border,#E8E2D8)`, borderRadius: 12, overflow: 'hidden', background: 'var(--bg,#faf9f7)', animationDelay: `${ci * 40}ms` }}>

                                            {/* Client header Row Start */}
                                            <div onClick={() => setExpandedClient(isOpen ? null : cg.name)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: isOpen ? 'rgba(166,73,29,0.04)' : undefined }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 8, background: cgColor.bg, border: `1.5px solid ${cgColor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 9.5, color: cgColor.color, flexShrink: 0 }}>
                                                    {cg.name.slice(0, 2).toUpperCase()}
                                                </div>

                                                {/* Payment Start */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-1,#231C14)' }}>{cg.name}</div>
                                                    <div style={{ fontSize: 9, color: 'var(--text-4,#6B5D48)' }}>{cg.entries.length} bill{cg.entries.length !== 1 ? 's' : ''} · {cgPmts.length} payment{cgPmts.length !== 1 ? 's' : ''}</div>
                                                </div>
                                                {/* Payment End */}

                                                {/* Balance Start */}
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontSize: 10.5, fontWeight: 800, color: cg.balance > 0 ? CREDIT_COLOR.mid : '#1E9C6A' }}>{fmt(cg.balance)}</div>
                                                    <div style={{ fontSize: 9, color: 'var(--text-4,#6B5D48)' }}>balance</div>
                                                </div>
                                                {/* Balance End */}

                                                <Ic n={isOpen ? 'up' : 'down'} sz={12} c="var(--text-4,#6B5D48)" />
                                            </div>
                                            {/* Client Header Row End */}

                                            {/* Mini Progress Bar Start */}
                                            <div style={{ height: 3, background: 'var(--border,#E8E2D8)', margin: '0 14px' }}>
                                                <div style={{ height: '100%', width: `${cgPct}%`, background: PAYMENT_COLOR.primary, borderRadius: 2, transition: 'width 0.4s' }} />
                                            </div>
                                            {/* Mini Progress Bar End */}

                                            {/* Totals Row Start */}
                                            <div style={{ display: 'flex', gap: 0, borderBottom: isOpen ? '1px solid var(--border,#E8E2D8)' : undefined }}>
                                                {[
                                                    { label: 'Billed', val: cg.totalBilled, color: CREDIT_COLOR.mid },
                                                    { label: 'Repaid', val: cg.totalPaid, color: PAYMENT_COLOR.primary },
                                                    { label: 'Due', val: cg.balance, color: cg.balance > 0 ? '#9A3412' : '#1E9C6A' },
                                                ].map((cell, ci2) => (
                                                    <div key={ci2} style={{ flex: 1, padding: '7px 14px', borderRight: ci2 < 2 ? '1px solid var(--border,#E8E2D8)' : undefined }}>
                                                        <div style={{ fontSize: 8, color: 'var(--text-4,#6B5D48)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{cell.label}</div>
                                                        <div style={{ fontSize: 10.5, fontWeight: 800, color: cell.color }}>{fmt(cell.val)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Total Row End */}

                                            {/* Expanded: merged Bills + Repayments table, one row per record, Client shown as its own column */}
                                            {isOpen && (() => {
                                                type CgRow = { id: string; date: string; type: 'bill' | 'payment'; ref: string; amount: number; statusNode: React.ReactNode };
                                                const rows: CgRow[] = [
                                                    ...cg.entries.map(e => ({
                                                        id: `bill-${e.id}`, date: e.credit_date, type: 'bill' as const,
                                                        ref: e.bill_number ? `#${e.bill_number}` : (e.description || `Bill #${e.id}`),
                                                        amount: e.credit_amount,
                                                        statusNode: e.is_paid
                                                            ? <span style={{ color: '#1E9C6A', fontWeight: 800 }}>✓ Paid</span>
                                                            : <span style={{ color: '#9A3412', fontWeight: 800 }}>{fmt(e.bill_balance)} due</span>,
                                                    })),
                                                    ...cgPmts.map(p => ({
                                                        id: `pmt-${p.id}`, date: p.payment_date, type: 'payment' as const,
                                                        ref: `${p.payment_mode}${p.reference ? ` · ${p.reference}` : ''}`,
                                                        amount: p.amount_paid,
                                                        statusNode: p.daybook_entry_id
                                                            ? <span style={{ color: '#1E9C6A', fontWeight: 800, fontSize: 8 }}>✓ Cash Book</span>
                                                            : <span style={{ color: 'var(--text-4,#6B5D48)', fontSize: 8 }}>—</span>,
                                                    })),
                                                ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
                                                const th: React.CSSProperties = { textAlign: 'left', padding: '6px 10px', fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-4,#6B5D48)', borderBottom: '1.5px solid var(--border,#E8E2D8)', whiteSpace: 'nowrap' };
                                                const td: React.CSSProperties = { padding: '7px 10px', fontSize: 9.5, color: 'var(--text-2,#524532)', borderBottom: '1px solid var(--border,#E8E2D8)', whiteSpace: 'nowrap' };
                                                return (
                                                    <div style={{ padding: '8px 14px 12px' }}>
                                                        {rows.length === 0 ? (
                                                            <div style={{ fontSize: 9.5, color: 'var(--text-4,#6B5D48)', padding: '10px 0' }}>No bills or repayments for this client yet.</div>
                                                        ) : (
                                                            <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border,#E8E2D8)' }}>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={th}>#</th>
                                                                            <th style={th}>Date</th>
                                                                            <th style={th}>Type</th>
                                                                            <th style={th}>Reference</th>
                                                                            <th style={th}>Client</th>
                                                                            <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                                                                            <th style={{ ...th, textAlign: 'right' }}>Balance / Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rows.map((r, ri) => (
                                                                            <tr key={r.id}>
                                                                                <td style={{ ...td, color: 'var(--text-4,#6B5D48)' }}>{ri + 1}</td>
                                                                                <td style={td}>{fmtDate(r.date)}</td>
                                                                                <td style={td}>
                                                                                    <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: r.type === 'bill' ? 'rgba(154,52,18,0.08)' : PAYMENT_COLOR.light, color: r.type === 'bill' ? CREDIT_COLOR.mid : PAYMENT_COLOR.primary, border: `1px solid ${r.type === 'bill' ? 'rgba(154,52,18,0.2)' : PAYMENT_COLOR.border}` }}>
                                                                                        {r.type === 'bill' ? 'Bill' : 'Payment'}
                                                                                    </span>
                                                                                </td>
                                                                                <td style={{ ...td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref}</td>
                                                                                <td style={{ ...td, fontWeight: 700, color: 'var(--text-1,#231C14)' }}>{cg.name}</td>
                                                                                <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: r.type === 'bill' ? CREDIT_COLOR.mid : PAYMENT_COLOR.primary }}>
                                                                                    {r.type === 'bill' ? '+' : '−'}{fmt(r.amount)}
                                                                                </td>
                                                                                <td style={{ ...td, textAlign: 'right' }}>{r.statusNode}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot>
                                                                        <tr>
                                                                            <td colSpan={5} style={{ ...td, fontWeight: 800, color: 'var(--text-1,#231C14)', borderBottom: 'none' }}>Total</td>
                                                                            <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: PAYMENT_COLOR.primary, borderBottom: 'none' }}>{fmt(cg.totalPaid)}</td>
                                                                            <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: cg.balance > 0 ? '#9A3412' : '#1E9C6A', borderBottom: 'none' }}>{fmt(cg.balance)} due</td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {/* Isopen End  */}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}


                    {tab === 'timeline' && (
                        timeline.length === 0 ? (
                            <div className="CM3-empty">
                                <div className="CM3-empty-ic" style={{ background: '#FDE0CB', border: '1.5px solid #FDE0CB' }}><Ic n="list" sz={22} c="#9A3412" /></div>
                                <div className="CM3-empty-title">No Activity</div>
                                <div className="CM3-empty-sub">Bills & payments appear here</div>
                            </div>
                        ) : (
                            <div className="CM3-tl">
                                {timeline.map((item, i) => (
                                    <div className="CM3-tl-item" key={i}>
                                        <div className={`CM3-tl-dot ${item.type === 'cr' ? 'credit-dot' : 'payment-dot'}`}>
                                            <Ic n={item.type === 'cr' ? 'down' : 'up'} sz={8} c={item.type === 'cr' ? CREDIT_COLOR.mid : PAYMENT_COLOR.primary} />
                                        </div>
                                        <div className="CM3-tl-body">
                                            <div className="CM3-tl-label">{item.label}</div>
                                            <div className="CM3-tl-sub">
                                                <span>{item.sub}</span>
                                                <span>·</span>
                                                <span>{fmtDate(item.date)}</span>
                                                {item.type === 'pm' && (
                                                    item.synced
                                                        ? <span className="CM3-synced" style={{ fontSize: 8 }}><Ic n="book" sz={7} c="currentColor" /> Cash Book</span>
                                                        : <span className="CM3-unsynced" style={{ fontSize: 8 }}>No DB</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`CM3-tl-amt ${item.type === 'cr' ? 'credit-tl' : 'payment-tl'}`}>
                                            {item.type === 'cr' ? '+' : '−'}{fmt(item.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {showCredit && <CreditEntryModal vendor={v} bioData={bioData} categories={categories} onClose={() => setShowCredit(false)} onSaved={() => { setShowCredit(false); loadDetail(true); onReload(); }} />}
                {editEntry && <CreditEntryModal vendor={v} bioData={bioData} categories={categories} editEntry={editEntry} onClose={() => setEditEntry(null)} onSaved={() => { setEditEntry(null); loadDetail(true); onReload(); }} />}
                {showPayment && (
                    <PaymentModal vendor={v} bioData={bioData} categories={categories} subCategories={subCategories}
                        vendorEntries={entries}
                        onClose={() => setShowPayment(false)}
                        onSaved={({ daybook_synced }) => {
                            setShowPayment(false); loadDetail(true); onReload();
                            if (daybook_synced) {
                                setSyncMsg(`Repayment recorded and posted to Cash Book on ${fmtDate(todayStr())}.`);
                                setTimeout(() => setSyncMsg(''), 6000);
                            }
                        }}
                    />
                )}
                {editPayment && (
                    <PaymentModal vendor={v} bioData={bioData} categories={categories} subCategories={subCategories}
                        editPayment={editPayment}
                        onClose={() => setEditPayment(null)}
                        onSaved={(_) => { setEditPayment(null); loadDetail(true); onReload(); }}
                    />
                )}
                {showEdit && (
                    <LedgerFormModal categories={categories} subCategories={subCategories} bioData={bioData} vendors={[]}
                        editVendor={v} onClose={() => setShowEdit(false)}
                        onSaved={() => { setShowEdit(false); loadDetail(true); onReload(); }}
                    />
                )}
                {deleteModal.open && (
                    <ConfirmDeleteModal
                        open={deleteModal.open}
                        title={deleteModal.type === 'vendor' ? 'Delete Vendor?' : deleteModal.type === 'entry' ? 'Delete Bill?' : 'Delete Repayment?'}
                        description={`This will permanently remove ${deleteModal.name} and cannot be undone.`}
                        loading={deleteModal.loading}
                        onCancel={() => setDeleteModal(prev => ({ ...prev, open: false }))}
                        onConfirm={async () => {
                            setDeleteModal(prev => ({ ...prev, loading: true }));
                            try {
                                if (deleteModal.type === 'entry') {
                                    await axiosInstance.delete(`credit-management/entries/${deleteModal.id}`, { headers: authHeader() });
                                    toast.warning('Bill Deleted', `"${deleteModal.name}" removed successfully`);
                                } else if (deleteModal.type === 'payment') {
                                    await axiosInstance.delete(`credit-management/payments/${deleteModal.id}`, { headers: authHeader() });
                                    toast.warning('Payment Deleted', `"${deleteModal.name}" removed successfully`);
                                } else if (deleteModal.type === 'vendor') {
                                    await axiosInstance.delete(`credit-management/vendors/${deleteModal.id}`, { headers: authHeader() });
                                    toast.warning('Vendor Deleted', `"${deleteModal.name}" removed successfully`);
                                    setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false });
                                    onVendorDeleted();
                                    return;
                                }
                                setDeleteModal({ open: false, type: '', id: 0, name: '', loading: false });
                                loadDetail(true);
                                onReload();
                            } catch {
                                toast.error('Failed to delete');
                                setDeleteModal(prev => ({ ...prev, loading: false }));
                            }
                        }}
                    />
                )}
            </div>
        </>
    );
}

// ─── MAIN PAGE START ─────────
export default function CreditManagement() {
    const [userRole] = useState<string>(() => getStoredRole());
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [bioData, setBioData] = useState<BioData[]>([]);
    const [showNew, setShowNew] = useState(false);
    // Set when "Open Ledger Account" is opened from inside a Category Overview panel — locks
    // Step 0's category field to that category instead of asking the user to pick
    // one they're already looking at.
    const [newLedgerCatId, setNewLedgerCatId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<{ id: number | null; name: string } | null>(null);
    const erpPageRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(erpPageRef);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const H = authHeader();
            const [vRes, sRes, mRes] = await Promise.all([
                axiosInstance.get('credit-management/vendors', { headers: H, params: { per_page: 100 } }),
                axiosInstance.get('credit-management/summary', { headers: H }),
                axiosInstance.get('master-data', { headers: H }),
            ]);
            setVendors(vRes.data.data?.data || vRes.data.data || []);
            setSummary(sRes.data.data || null);
            setCategories(mRes.data.categories || []);
            setSubCategories(mRes.data.sub_categories || []);
            setBioData(mRes.data.bio_data || []);
        } catch (e) { console.error(e); }
        finally { if (!silent) setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = vendors.filter(v => {
        const q = search.toLowerCase();
        const matchSearch = !q || v.party_name.toLowerCase().includes(q) || (v.category_name || '').toLowerCase().includes(q);
        const matchStatus = !filterStatus || v.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Group vendors/ledgers by their category so the sidebar can drill down:
    // Category list first → touch a category → see all ledger names inside it.
    const categoryGroups = useMemo(() => {
        const map = new Map<string, { id: number | null; name: string; vendors: Vendor[] }>();
        filtered.forEach(v => {
            const name = v.category_name || 'Uncategorized';
            const key = v.category_id != null ? `id:${v.category_id}` : `name:${name}`;
            if (!map.has(key)) map.set(key, { id: v.category_id ?? null, name, vendors: [] });
            map.get(key)!.vendors.push(v);
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [filtered]);

    const activeGroup = selectedCategory
        ? (categoryGroups.find(g => (g.id ?? -1) === (selectedCategory.id ?? -1) && g.name === selectedCategory.name)
            || { id: selectedCategory.id, name: selectedCategory.name, vendors: [] as Vendor[] })
        : null;

    const [vgPage, setVgPage] = useState(1);
    const [vgPerPage, setVgPerPage] = useState(5);
    const vgTotalPages = Math.max(1, Math.ceil((activeGroup?.vendors.length || 0) / vgPerPage));
    const vgSafePage = Math.min(vgPage, vgTotalPages);
    const pagedGroupVendors = activeGroup ? activeGroup.vendors.slice((vgSafePage - 1) * vgPerPage, vgSafePage * vgPerPage) : [];

    // Aggregate totals across every ledger linked to the currently-selected
    // category — shown as the right-side stat card the instant a category
    // is touched, before any single ledger is opened.
    const categorySummary = activeGroup ? activeGroup.vendors.reduce((acc, v) => ({
        credited: acc.credited + (v.total_credit || 0),
        repaid: acc.repaid + (v.total_paid || 0),
        outstanding: acc.outstanding + (v.balance || 0),
    }), { credited: 0, repaid: 0, outstanding: 0 }) : null;

    const sum = summary;

    if (loading) return (
        <div className="ERP-page" ref={erpPageRef}>
            <style>{ERP_CSS}{CSS}</style>

            <PageOpenIntro containerRef={erpPageRef} label="Opening Accounts Payable…" />

            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <div className="ERP-eyebrow">
                        <span className="ERP-eyebrow-line" />
                        <span className="ERP-eyebrow-dot" />
                        Credit &amp; Payment Ledger
                    </div>
                    <h1 className="ERP-title MD-page-title">Accounts <span className="ERP-title-em">Payable</span></h1>
                </div>
            </div>
            <div className="ERP-divider" />
            <div className="ERP-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[1, 2, 3].map(i => <div key={i} className="CM3-skel" style={{ height: 130, borderRadius: 16 }} />)}
            </div>
            <div className="CM3-skel" style={{ height: 480, borderRadius: 16, marginTop: 14 }} />
        </div>
    );

    return (
        <div className="ERP-page" ref={erpPageRef}>
            <style>{ERP_CSS}{CSS}</style>

            <PageOpenIntro containerRef={erpPageRef} label="Opening Accounts Payable…" />

            {/* ── HEADER START ── */}
            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <div className="ERP-eyebrow">
                        <span className="ERP-eyebrow-line" />
                        <span className="ERP-eyebrow-dot" />
                        Credit &amp; Payment Ledger
                    </div>
                    <h1 className="ERP-title MD-page-title">Accounts <span className="ERP-title-em">Payable</span></h1>
                </div>
            </div>
            <div className="ERP-divider" />
            {/* ── HEADER END ── */}

            {/* ── STAT CARDS START ── */}
            <div className="ERP-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>

                {/* Total Paid Start  */}
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#A6491D,#A6491D)' }} />
                    <div className="ERP-stat-label">Total Repaid</div>
                    <div className="ERP-stat-val" style={{ color: '#A6491D', fontSize: 16, fontWeight: 800 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                        <AnimCount value={Math.round(sum?.total_paid ?? 0)} />
                    </div>
                </div>
                {/* Total Paid End */}

                {/* Total Outstanding Start */}
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember,#C2410C),var(--ember-mid,#DB5B1F))' }} />
                    <div className="ERP-stat-label">Total Outstanding</div>
                    <div className="ERP-stat-val" style={{ color: 'var(--ember,#C2410C)', fontSize: 16, fontWeight: 800 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                        <AnimCount value={Math.round(sum?.balance ?? 0)} />
                    </div>
                </div>
                {/* Total Outstanding End */}

                {/* Vendors OverDue Start */}
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#D93B55,#f87171)' }} />
                    <div className="ERP-stat-label">Overdue</div>
                    <div className="ERP-stat-val" style={{ color: '#D93B55', fontSize: 16, fontWeight: 800 }}>
                        <AnimCount value={sum?.overdue_count ?? 0} />
                    </div>
                </div>
                {/* Vendors OverDue End */}

            </div>
            {/* ── STAT CARDS END ── */}

            {/* ── BODY START ── */}
            <div className="CM3-body">

                {/* Sidebar Start */}
                <div className="CM3-sidebar">

                    {/*  Hero Header Start */}
                    <div className="CM3-sb-hero">
                        <div className="CM3-sb-eyebrow">
                            <div className="CM3-sb-eyebrow-dot" />
                            Payable Ledger
                        </div>
                        <div className="CM3-sb-title">Vendors</div>
                        <div className="CM3-search">
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth={2.5} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                            <input autoComplete="off" placeholder="Search vendors…" value={search}
                                onChange={e => setSearch(e.target.value)} />
                            {search && (
                                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', lineHeight: 1, padding: 0 }}>✕</button>
                            )}
                        </div>
                    </div>
                    {/* Hero Header End */}

                    {/*  Open Ledger Account Button Start  */}
                    <button className="CM3-add-btn" onClick={() => { setNewLedgerCatId(null); setShowNew(true); }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        Open Ledger Account
                    </button>
                    {/* Open Ledger Account Button End */}

                    {/* ── Filter chips ── */}
                    <div className="CM3-filters">
                        {(['', 'pending', 'partial', 'overdue', 'clear'] as const).map(s => (
                            <button key={s} className={`CM3-chip${filterStatus === s ? ' on' : ''}`}
                                onClick={() => setFilterStatus(s)}>
                                {s === '' ? '⬤ All' : STATUS_CONFIG[s]?.label || s}
                            </button>
                        ))}
                    </div>
                    {/* Filter Chips End */}

                    {/* ── Category / Vendor count ── */}
                    <div className="CM3-sb-count">
                        <span className="CM3-sb-count-lbl">
                            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                            {selectedCategory ? 'Ledgers' : 'Account Heads'}
                        </span>
                        <span className="CM3-sb-count-num">{selectedCategory ? activeGroup!.vendors.length : categoryGroups.length}</span>
                    </div>
                    {/* Category / Vendor Count End */}

                    {/* ── Category → Vendor drill-down list Start ── */}
                    <div className="CM3-vlist">
                        {!selectedCategory ? (
                            categoryGroups.length === 0 ? (
                                <div className="CM3-empty" style={{ padding: '32px 16px' }}>
                                    <div className="CM3-empty-icon"><Ic n="inbox" sz={32} c="var(--text-4)" /></div>
                                    <div className="CM3-empty-title">No categories found</div>
                                    <div className="CM3-empty-sub">Try a different filter or add a ledger</div>
                                </div>
                            ) : categoryGroups.map((g, gIdx) => {
                                const catBalance = g.vendors.reduce((s, v) => s + (v.balance || 0), 0);
                                return (
                                    <div key={g.id ?? g.name}
                                        className="CM3-catcard"
                                        style={{ animationDelay: `${gIdx * 35}ms` }}
                                        onClick={() => { setSelectedCategory({ id: g.id, name: g.name }); setSelectedVendor(null); }}>
                                        <div className="CM3-vcard-accent" />
                                        <div className="CM3-catcard-icon"><Ic n="layers" sz={16} c="var(--ember,#C2410C)" /></div>
                                        <div className="CM3-catcard-info">
                                            <div className="CM3-catcard-name">{g.name}</div>
                                            <div className="CM3-catcard-sub">
                                                {g.vendors.length} {g.vendors.length === 1 ? 'ledger' : 'ledgers'}
                                                {catBalance > 0 ? ` · ${fmt(catBalance)} due` : ''}
                                            </div>
                                        </div>
                                        <svg className="CM3-catcard-chev" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m9 18 6-6-6-6" /></svg>
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                <button className="CM3-cat-back" onClick={() => { setSelectedCategory(null); setSelectedVendor(null); }}>
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m15 18-6-6 6-6" /></svg>
                                    <span className="CM3-cat-back-name">{selectedCategory.name}</span>
                                    <span className="CM3-cat-back-count">{activeGroup!.vendors.length}</span>
                                </button>
                                {activeGroup!.vendors.length === 0 ? (
                                    <div className="CM3-empty" style={{ padding: '32px 16px' }}>
                                        <div className="CM3-empty-icon"><Ic n="inbox" sz={32} c="var(--text-4)" /></div>
                                        <div className="CM3-empty-title">No ledgers found</div>
                                        <div className="CM3-empty-sub">Try a different filter or add a ledger</div>
                                    </div>
                                ) : pagedGroupVendors.map((v, vIdx) => {
                                    const vc = vendorColor(v.party_name);
                                    const sc = STATUS_CONFIG[v.status];
                                    const clientBio = v.client_bio_data_id ? bioData.find(b => b.id === v.client_bio_data_id) : null;
                                    const clientName = clientBio?.name || v.client_name || null;
                                    const isActive = selectedVendor?.id === v.id;
                                    const paidPctV = v.total_credit > 0 ? Math.min(100, (v.total_paid / v.total_credit) * 100) : 0;
                                    return (
                                        <div key={v.id}
                                            className={`CM3-vcard${isActive ? ' active' : ''}`}
                                            style={{ animationDelay: `${vIdx * 35}ms` }}
                                            onClick={() => setSelectedVendor(v)}>
                                            <div className="CM3-vcard-accent" />

                                            {/* Top row: Avatar + Info + Balance */}
                                            <div className="CM3-vcard-top">
                                                <div className="CM3-vavatar" style={{ background: vc.bg, color: vc.color, borderColor: vc.border }}>
                                                    {v.party_name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="CM3-vcard-info">
                                                    <div className="CM3-vname">{v.party_name}</div>
                                                    <div className="CM3-vmeta">
                                                        <span className="CM3-vmeta-dot" style={{ background: sc.color }} />
                                                        {sc.label}
                                                        {v.days_overdue > 0 && <span style={{ color: '#D93B55' }}>· {v.days_overdue}d overdue</span>}
                                                    </div>
                                                    {clientName && (
                                                        <div className="CM3-vclient">
                                                            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                            {clientName}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`CM3-vbal-new${v.balance > 0 ? ' red' : ' grey'}`}>
                                                    {fmt(v.balance)}
                                                </div>
                                            </div>
                                            {/* Top Row: Avatar + Info + Balance End */}

                                            {/* Footer Start */}
                                            <div className="CM3-vcard-foot">
                                                <div className="CM3-vcard-bar-wrap">
                                                    <div className="CM3-vcard-bar-fill" style={{ width: `${paidPctV}%` }} />
                                                </div>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)', flexShrink: 0 }}>
                                                    {Math.round(paidPctV)}% repaid
                                                </span>
                                            </div>
                                            {/* Footer End  */}
                                        </div>
                                    );
                                })}
                                {activeGroup!.vendors.length > 0 && (
                                    <Pagination
                                        page={vgSafePage}
                                        totalPages={vgTotalPages}
                                        onPageChange={setVgPage}
                                        total={activeGroup!.vendors.length}
                                        perPage={vgPerPage}
                                        onPerPageChange={n => { setVgPerPage(n); setVgPage(1); }}
                                        perPageOptions={[5, 10, 15, 25]}
                                        itemLabel="ledgers"
                                    />
                                )}
                            </>
                        )}
                    </div>
                    {/* Category → Vendor drill-down list End */}
                </div>
                {/* Sidebar End */}

                {/* Detail Panel Start */}
                <div className="CM3-main">
                    {selectedVendor ? (
                        <VendorDetail
                            key={selectedVendor.id}
                            vendor={selectedVendor}
                            categories={categories}
                            subCategories={subCategories}
                            bioData={bioData}
                            onReload={() => load(true)}
                            onVendorDeleted={() => { setSelectedVendor(null); load(true); }}
                        />
                    ) : selectedCategory && activeGroup && categorySummary ? (
                        <div className="CM3-catsum">
                            <div className="CM3-catsum-hdr">
                                <div className="CM3-catsum-icon"><Ic n="layers" sz={20} c="var(--ember,#C2410C)" /></div>
                                <div style={{ flex: 1 }}>
                                    <div className="CM3-catsum-eyebrow">Account Head Overview</div>
                                    <div className="CM3-catsum-title">{selectedCategory.name}</div>
                                    <div className="CM3-catsum-sub">{activeGroup.vendors.length} linked ledger{activeGroup.vendors.length !== 1 ? 's' : ''}</div>
                                </div>
                                {selectedCategory.id != null && (
                                    <button className="CM3-add-btn" onClick={() => { setNewLedgerCatId(selectedCategory.id); setShowNew(true); }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                        Open Ledger Account
                                    </button>
                                )}
                            </div>

                            <div className="CM3-catsum-stats">
                                <div className="CM3-catsum-stat">
                                    <div className="CM3-catsum-stat-lbl"><Ic n="down" sz={9} c={CREDIT_COLOR.mid} />Total Credited</div>
                                    <div className="CM3-catsum-stat-val credit-color">{fmt(categorySummary.credited)}</div>
                                </div>
                                <div className="CM3-catsum-stat">
                                    <div className="CM3-catsum-stat-lbl"><Ic n="up" sz={9} c={PAYMENT_COLOR.primary} />Total Repaid</div>
                                    <div className="CM3-catsum-stat-val payment-color">{fmt(categorySummary.repaid)}</div>
                                </div>
                                <div className="CM3-catsum-stat">
                                    <div className="CM3-catsum-stat-lbl"><Ic n="scale" sz={9} c="#9A3412" />Outstanding</div>
                                    <div className="CM3-catsum-stat-val balance-color">{fmt(categorySummary.outstanding)}</div>
                                </div>
                            </div>

                            <div className="CM3-catsum-listhdr">Linked Ledgers</div>
                            <div className="CM3-catsum-list">
                                {activeGroup.vendors.length === 0 ? (
                                    <div className="CM3-empty" style={{ padding: '32px 16px' }}>
                                        <div className="CM3-empty-icon"><Ic n="inbox" sz={32} c="var(--text-4)" /></div>
                                        <div className="CM3-empty-title">No ledgers found</div>
                                        <div className="CM3-empty-sub">Add a ledger under this category to get started</div>
                                    </div>
                                ) : activeGroup.vendors.map(v => {
                                    const vc = vendorColor(v.party_name);
                                    const sc = STATUS_CONFIG[v.status];
                                    return (
                                        <div key={v.id} className="CM3-catsum-row" onClick={() => setSelectedVendor(v)}>
                                            <div className="CM3-vavatar" style={{ background: vc.bg, color: vc.color, borderColor: vc.border, width: 32, height: 32, fontSize: 9.5 }}>
                                                {v.party_name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="CM3-catsum-row-info">
                                                <div className="CM3-catsum-row-name">{v.party_name}</div>
                                                <div className="CM3-catsum-row-meta">
                                                    <span className="CM3-dot" style={{ background: sc.color }} />
                                                    {sc.label}
                                                    {v.days_overdue > 0 && ` · ${v.days_overdue}d overdue`}
                                                </div>
                                            </div>
                                            <div className="CM3-catsum-row-amt">
                                                <span className="CM3-catsum-row-bal">{fmt(v.balance)}</span>
                                                <span className="CM3-catsum-row-bal-lbl">Outstanding</span>
                                            </div>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--text-4)', flexShrink: 0 }}><path d="m9 18 6-6-6-6" /></svg>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="CM3-welcome">
                            <div className="CM3-welcome-icon">
                                <Ic n="wallet" sz={38} c="#9A3412" />
                            </div>
                            <div className="CM3-welcome-title">Accounts Payable</div>
                            <div className="CM3-welcome-sub">Select a vendor from the sidebar to view their payable ledger, or add a new vendor to get started.</div>
                            <button className="CM3-add-btn" style={{ marginTop: 8 }} onClick={() => { setNewLedgerCatId(null); setShowNew(true); }}>
                                <Ic n="plus" sz={14} c="#faf9f7" /> Open Ledger Account
                            </button>
                        </div>
                    )}
                </div>
                {/* Detail Panel End */}

            </div>
            {/* ── BODY END ── */}

            {/* New Ledger Modal Start */}
            {showNew && (
                <LedgerFormModal
                    categories={categories}
                    subCategories={subCategories}
                    bioData={bioData}
                    vendors={vendors}
                    presetCategoryId={newLedgerCatId}
                    onClose={() => { setShowNew(false); setNewLedgerCatId(null); }}
                    onSaved={() => { setShowNew(false); setNewLedgerCatId(null); load(true); }}
                />
            )}
            {/* New Ledger Modal End */}
        </div>
    );
}
