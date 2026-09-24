import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { memCache } from '../services/memCache';
import { useEffect, useRef, useState } from 'react';
import { ERP_CSS } from '../styles/ERPTheme';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { CalendarDD } from '../components/CalendarDD';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import RunningLoader from '../components/RunningLoader';
import PageOpenIntro from '../components/PageOpenIntro';
import { getStoredRole, canDelete } from '../utils/roleAccess';
import CreatorBadge from '../components/CreatorBadge';
interface Category { id: number; name: string; type: 'income' | 'expense'; }
interface SubCategory { id: number; name: string; category_id: number; category_ids?: number[]; }
interface BioData { id: number; name: string; category_id?: number; sub_category_id?: number | null; }
interface SubName { id: number; alternate_name: string; bio_data_id: number; }

interface DaybookEntry {
    id: number;
    transaction_date: string;
    created_at?: string;
    amount: number;
    payment_mode: string;
    narration: string | null;
    client_name: string | null;
    category_name: string;
    category_type?: 'income' | 'expense';
    sub_category_name: string | null;
    bio_data_name: string;
    sub_name_name?: string;
    created_by_name?: string | null;
    category_id: number;
    sub_category_id: number | null;
    bio_data_id: number;
    sub_name_id?: number;
}

interface Stats { income: number; expense: number; balance: number; }

interface PaymentBreakdown { mode: string; amount: number; }
interface OverallStats {
    totalCredit: number;
    totalDebit: number;
    netBalance: number;
    totalEntries: number;
    creditByMode: PaymentBreakdown[];
    debitByMode: PaymentBreakdown[];
    /* Cash vs. Bank split, in two flavours — "Cash" mode is its own
       bucket, every other mode (UPI, NEFT, Cheque, Bank Transfer,
       Others) merges into "Bank" since they all settle to a bank
       account:
       - debitCash / debitBank: split of Total Debit only — these two
         always add up to totalDebit (e.g. totalDebit 10k = debitCash 7k
         + debitBank 3k).
       - cashHolding / bankHolding: split of Net Balance — net
         (credit − debit) per bucket; these two always add up to
         netBalance. */
    debitCash: number;
    debitBank: number;
    cashHolding: number;
    bankHolding: number;
}

interface FormData {
    transaction_date: string;
    amount: string;
    payment_mode: string;
    category_id: string;
    sub_category_id: string;
    bio_data_id: string;
    sub_name_id: string;
    client_name: string;
    narration: string;
}

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
    list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    arrowUp: 'M5 10l7-7m0 0l7 7m-7-7v18',
    arrowDown: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    cash: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    link: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
    circle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    bank: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    transfer: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    more: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
    search: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
    chevronDown: 'M5 8l7 7 7-7',
    credit: 'M7 11l5-5 5 5M12 6v12',
    debit: 'M17 13l-5 5-5-5M12 18V6',
    back: 'M10 19l-7-7m0 0l7-7m-7 7h18',
};

const Icon = ({ name, size = 16, color = 'currentColor' }: { name: string; size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={PATHS[name] || PATHS.ledger} />
    </svg>
);

interface SearchDDOption { value: string; label: string; badge?: string; badgeColor?: string; }
interface SearchDDProps {
    options: SearchDDOption[];
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    disabled?: boolean;
    emptyMsg?: string;
    label?: string;
    required?: boolean;
}

function SearchDD({ options, value, onChange, placeholder, disabled = false, emptyMsg = 'No options', label, required }: SearchDDProps) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
    const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
    const selected = options.find(o => o.value === value);
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
    const handleSelect = (v: string) => { onChange(v); setOpen(false); setQuery(''); };
    return (
        <>
            <div className="DB-SDD-root" ref={ref} data-disabled={disabled}>
                {label && (
                    // Label Start
                    <label className="ERP-label">
                        {label}
                        {required && <span className="DB-SDD-req">*</span>}
                        {!required && <span className="DB-SDD-opt">optional</span>}
                    </label>
                    // Label End
                )}

                {/* Button Start */}
                <button type="button" ref={triggerRef}
                    className={`DB-SDD-trigger${open ? ' open' : ''}${disabled ? ' disabled' : ''}${selected ? ' has-value' : ''}`}
                    onClick={() => !disabled && setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
                    <span className="DB-SDD-content">
                        {selected ? (
                            <span className="DB-SDD-selected">
                                {selected.badge && (
                                    <span className="DB-SDD-badge" style={{
                                        background: selected.badgeColor ? selected.badgeColor + '18' : 'var(--ember-ghost)',
                                        color: selected.badgeColor || 'var(--ember)',
                                        borderColor: selected.badgeColor ? selected.badgeColor + '44' : 'var(--ember-border)',
                                    }}>
                                        {selected.badge}
                                    </span>
                                )}
                                {selected.label}
                            </span>
                        ) : <span className="DB-SDD-ph">{placeholder}</span>}
                    </span>
                    <span className={`DB-SDD-chevron${open ? ' open' : ''}`}>
                        <Icon name="chevronDown" size={13} />
                    </span>
                </button>
                {/* Button End */}

                {/* Open Start */}
                {open && (
                    <div className="DB-SDD-panel" ref={panelRef}>
                        <div className="DB-SDD-search-row">
                            <Icon name="search" size={13} color="var(--text-4)" />
                            <input autoComplete="off" ref={inputRef} className="DB-SDD-search" placeholder="Search…"
                                value={query} onChange={e => setQuery(e.target.value)} />
                            {query && <button className="DB-SDD-clr" onClick={() => setQuery('')}><Icon name="x" size={10} /></button>}
                        </div>
                        <div className="DB-SDD-list">
                            {value && (
                                <div className="DB-SDD-item DB-SDD-clear" role="option" tabIndex={-1} aria-selected={false} onClick={() => handleSelect('')}>
                                    <Icon name="x" size={10} color="var(--text-4)" /><span>Clear selection</span>
                                </div>
                            )}
                            {filtered.length === 0 ? (
                                <div className="DB-SDD-empty">
                                    <Icon name="inbox" size={14} color="var(--text-4)" />
                                    {query ? `No results for "${query}"` : emptyMsg}
                                </div>
                            ) : filtered.map(opt => (
                                <div key={opt.value} role="option" tabIndex={-1} aria-selected={value === opt.value} className={`DB-SDD-item${value === opt.value ? ' sel' : ''}`}
                                    onClick={() => handleSelect(opt.value)}>
                                    <span className="DB-SDD-item-inner">
                                        <span className="DB-SDD-checkbox">
                                            {value === opt.value && <Icon name="check" size={9} color="#faf9f7" />}
                                        </span>
                                        {opt.badge && (
                                            <span className="DB-SDD-badge" style={{
                                                background: opt.badgeColor ? opt.badgeColor + '18' : 'var(--ember-ghost)',
                                                color: opt.badgeColor || 'var(--ember)',
                                                borderColor: opt.badgeColor ? opt.badgeColor + '44' : 'var(--ember-border)',
                                            }}>
                                                {opt.badge}
                                            </span>
                                        )}
                                        {opt.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="DB-SDD-footer">{filtered.length} / {options.length}</div>
                    </div>
                )}
                {/* Open End */}

            </div>
        </>
    );
}

const PAYMENT_METHODS = [
    { id: 'Cash', label: 'Cash', icon: 'cash', color: '#1E9C6A', bg: 'rgba(30,156,106,0.10)', border: 'rgba(30,156,106,0.30)' },
    { id: 'UPI', label: 'UPI', icon: 'mobile', color: '#DB5B1F', bg: 'rgba(40,112,204,0.10)', border: 'rgba(40,112,204,0.30)' },
    { id: 'NEFT', label: 'NEFT', icon: 'bank', color: '#9A3412', bg: 'rgba(196,126,10,0.10)', border: 'rgba(196,126,10,0.30)' },
    { id: 'Cheque', label: 'Cheque', icon: 'document', color: '#C2410C', bg: 'rgba(155,69,204,0.10)', border: 'rgba(155,69,204,0.30)' },
    { id: 'Bank Transfer', label: 'Bank', icon: 'transfer', color: '#A6491D', bg: 'rgba(8,145,178,0.10)', border: 'rgba(8,145,178,0.30)' },
    { id: 'Others', label: 'Others', icon: 'more', color: '#6B5D48', bg: 'rgba(107,107,107,0.10)', border: 'rgba(107,107,107,0.30)' },
];

function getPaymentMethod(id: string) {
    return PAYMENT_METHODS.find(p => p.id === id)
        ?? { id: 'Cash', label: id || 'Cash', icon: 'cash', color: '#1E9C6A', bg: 'rgba(30,156,106,0.10)', border: 'rgba(30,156,106,0.30)' };
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

const MKEY = 'erp_master_v1';
const MTTL = 10 * 60 * 1000;
interface MasterData {
    categories: Category[];
    subCategories: SubCategory[];
    bioData: BioData[];
    subNames: SubName[];
}

function loadMaster(): MasterData | null {
    try {
        const raw = localStorage.getItem(MKEY);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw) as { ts: number; data: MasterData };
        if (Date.now() - ts > MTTL) { localStorage.removeItem(MKEY); return null; }
        return data;
    } catch { return null; }
}

function saveMaster(data: MasterData) {
    try { localStorage.setItem(MKEY, JSON.stringify({ ts: Date.now(), data })); } catch { }
}

const authHeader = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });
const todayDate = () => new Date().toISOString().split('T')[0];
const EMPTY_FORM = (): FormData => ({
    transaction_date: todayDate(),
    amount: '', payment_mode: 'Cash',
    category_id: '', sub_category_id: '', bio_data_id: '', sub_name_id: '',
    client_name: '', narration: '',
});

function computeStats(entries: DaybookEntry[], categories: Category[]): Stats {
    let income = 0, expense = 0;
    for (const entry of entries) {
        let type = entry.category_type;
        if (!type) { const cat = categories.find(c => c.id === entry.category_id); type = cat?.type ?? 'expense'; }
        if (type === 'income') income += Number(entry.amount);
        else expense += Number(entry.amount);
    }
    return { income, expense, balance: income - expense };
}

function computeOverallStats(allEntries: DaybookEntry[], categories: Category[]): OverallStats {
    let totalCredit = 0, totalDebit = 0;
    const creditMap: Record<string, number> = {};
    const debitMap: Record<string, number> = {};

    for (const entry of allEntries) {
        let type = entry.category_type;
        if (!type) { const cat = categories.find(c => c.id === entry.category_id); type = cat?.type ?? 'expense'; }
        const amt = Number(entry.amount);
        const mode = entry.payment_mode || 'Cash';

        if (type === 'income') {
            totalCredit += amt;
            creditMap[mode] = (creditMap[mode] || 0) + amt;
        } else {
            totalDebit += amt;
            debitMap[mode] = (debitMap[mode] || 0) + amt;
        }
    }

    let cashHolding = 0, bankHolding = 0;
    const allModes = new Set([...Object.keys(creditMap), ...Object.keys(debitMap)]);
    for (const mode of allModes) {
        const net = (creditMap[mode] || 0) - (debitMap[mode] || 0);
        if (mode === 'Cash') cashHolding += net;
        else bankHolding += net;
    }
    const debitCash = debitMap['Cash'] || 0;
    const debitBank = totalDebit - debitCash;

    return {
        totalCredit,
        totalDebit,
        netBalance: totalCredit - totalDebit,
        totalEntries: allEntries.length,
        creditByMode: Object.entries(creditMap).map(([mode, amount]) => ({ mode, amount })).sort((a, b) => b.amount - a.amount),
        debitByMode: Object.entries(debitMap).map(([mode, amount]) => ({ mode, amount })).sort((a, b) => b.amount - a.amount),
        debitCash,
        debitBank,
        cashHolding,
        bankHolding,
    };
}

function PayModeRow({ breakdown }: { breakdown: PaymentBreakdown[] }) {
    if (!breakdown.length) return null;
    return (
        <div className="DB-stat-pay-breakdown">
            {breakdown.map(({ mode, amount }) => {
                const pm = getPaymentMethod(mode);
                return (
                    <div key={mode} className="DB-stat-pay-row">
                        <span className="DB-stat-pay-dot" style={{ background: pm.color }} />
                        <span className="DB-stat-pay-mode">{mode}</span>
                        <span className="DB-stat-pay-amt">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                );
            })}
        </div>
    );
}

const PAGE_CSS = `
@keyframes db-hold-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-4deg); } }

/* ── IN-CARD CASH/BANK BREAKDOWN CHIPS — sit inside the Total Debit and
   Net Balance stat cards, under the main total, to show how much of
   that total is Cash vs. Bank (the two chip amounts always add up to
   the number shown above them). ── */
.DB-stat-breakdown { display: flex; gap: 6px; margin-top: 9px; position: relative; z-index: 1; }
.DB-stat-chip {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 5px;
  padding: 4px 7px; border-radius: 7px; border: 1px solid;
}
.DB-stat-chip.cash { background: rgba(30,156,106,0.07); border-color: rgba(30,156,106,0.24); }
.DB-stat-chip.bank { background: rgba(8,145,178,0.07); border-color: rgba(8,145,178,0.24); }
.DB-stat-chip-icon {
  width: 15px; height: 15px; border-radius: 5px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  animation: db-hold-float 2.8s ease-in-out infinite;
}
.DB-stat-chip.cash .DB-stat-chip-icon { background: rgba(30,156,106,0.16); }
.DB-stat-chip.bank .DB-stat-chip-icon { background: rgba(8,145,178,0.16); animation-delay: .35s; }
.DB-stat-chip-icon svg { width: 8px; height: 8px; }
.DB-stat-chip-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.DB-stat-chip-label { font-family: var(--font-mono); font-size: 6px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--text-4); }
.DB-stat-chip-val { font-family: var(--font-mono); font-size: 9.5px; font-weight: 800; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 480px) {
  .DB-stat-chip-label { font-size: 5.5px; }
  .DB-stat-chip-val { font-size: 8.5px; }
}
@media (prefers-reduced-motion: reduce) {
  .DB-stat-chip-icon { animation: none; }
}

/* ── SEARCHABLE DROPDOWN ── */
.DB-SDD-root { position:relative; width:100%; }
.DB-SDD-root[data-disabled="true"] { opacity:0.45; pointer-events:none; }
.DB-SDD-req  { color:var(--error); font-size: 9px; margin-left:2px; }
.DB-SDD-opt  { color:var(--text-4); font-size: 8px; font-style:italic; letter-spacing:0; font-weight: 600; text-transform:none; margin-left:2px; }
/* Client free-text input */
.DB-client-input-wrap { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); display:flex; align-items:center; gap:8px; padding:10px 13px; min-height:44px; transition:all 0.18s; }
.DB-client-input-wrap:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.DB-client-input { flex:1; background:transparent; border:none; outline:none; font-family:var(--font-body); font-size: 10.5px; font-weight: 700; color:var(--text-1); caret-color:var(--ember); }
.DB-client-input::placeholder { color:var(--text-4); font-style:italic; font-weight: 600; }

.DB-SDD-trigger {
  width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:10px 13px; background:var(--white); border:1.5px solid var(--border);
  border-radius:var(--r-md); cursor:pointer; transition:all 0.18s; text-align:left;
  min-height:44px; outline:none;
}
.DB-SDD-trigger:hover { border-color:var(--border-2); background:var(--off-white); }
.DB-SDD-trigger.open  { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); border-bottom-left-radius:0; border-bottom-right-radius:0; }
.DB-SDD-trigger.disabled { pointer-events:none; opacity:0.5; background:var(--off-white); }
.DB-SDD-trigger.has-value { border-color:var(--ember-border); }
.DB-SDD-content { flex:1; min-width:0; }
.DB-SDD-selected { display:flex; align-items:center; gap:8px; font-family:var(--font-body); font-size: 10.5px; font-weight: 700; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.DB-SDD-ph       { font-family:var(--font-body); font-size: 10px; color:var(--text-4); font-style:italic; }
.DB-SDD-chevron  { color:var(--text-4); transition:transform 0.2s,color 0.18s; flex-shrink:0; display:flex; }
.DB-SDD-chevron.open { transform:rotate(180deg); color:var(--ember); }

.DB-SDD-panel {
  position:absolute; top:100%; left:0; right:0; z-index:999;
  background:var(--white); border:1.5px solid var(--ember-mid); border-top:none;
  border-bottom-left-radius:var(--r-md); border-bottom-right-radius:var(--r-md);
  box-shadow:0 12px 32px rgba(0,0,0,0.12); overflow:hidden;
  animation:sdd-drop 0.14s ease both;
}
@keyframes sdd-drop { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

.DB-SDD-search-row { display:flex; align-items:center; gap:8px; padding:9px 12px; border-bottom:1px solid var(--border); background:var(--off-white); }
.DB-SDD-search { flex:1; background:transparent; border:none; outline:none; font-family:var(--font-body); font-size: 10px; color:var(--text-1); caret-color:var(--ember); }
.DB-SDD-search::placeholder { color:var(--text-4); }
.DB-SDD-clr { background:none; border:none; padding:2px; cursor:pointer; color:var(--text-4); display:flex; }
.DB-SDD-clr:hover { color:var(--error); }

.DB-SDD-list { max-height:185px; overflow-y:auto; padding:3px 0; }
.DB-SDD-list::-webkit-scrollbar { width:3px; }
.DB-SDD-list::-webkit-scrollbar-thumb { background:var(--border-2); border-radius:2px; }

.DB-SDD-item { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:9px 14px; cursor:pointer; transition:background 0.1s; font-family:var(--font-body); font-size: 10.5px; color:var(--text-2); }
.DB-SDD-item:hover { background:rgba(37,99,235,0.07); color:var(--text-1); }
.DB-SDD-item.sel  { background:var(--ember-ghost); color:var(--ember); font-weight: 700; }
.DB-SDD-item-inner { display:flex; align-items:center; gap:8px; flex:1; min-width:0; }
.DB-SDD-checkbox {
  width:16px; height:16px; border-radius:5px; flex-shrink:0;
  border:1.5px solid var(--border-2); background:var(--white);
  display:flex; align-items:center; justify-content:center;
  transition:background .16s, border-color .16s, transform .16s, box-shadow .16s;
}
.DB-SDD-item:hover .DB-SDD-checkbox { border-color:var(--ember-border); }
.DB-SDD-item.sel .DB-SDD-checkbox {
  background:linear-gradient(135deg,var(--ember),var(--ember-mid));
  border-color:var(--ember); box-shadow:0 2px 6px var(--ember-glow);
  transform:scale(1.05);
}
.DB-SDD-clear { color:var(--text-4); font-size: 9px; font-style:italic; border-bottom:1px solid var(--border); padding:7px 14px; }
.DB-SDD-clear:hover { background:rgba(217,59,85,0.06); color:var(--error); }
.DB-SDD-empty { display:flex; align-items:center; gap:8px; padding:14px; font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:0.5px; }
.DB-SDD-badge { display:inline-flex; align-items:center; padding:1px 7px; border-radius:100px; border:1px solid; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px; text-transform:uppercase; flex-shrink:0; }
.DB-SDD-footer { padding:5px 14px; border-top:1px solid var(--border); font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:0.5px; text-align:right; background:var(--off-white); }

/* ── FIX: allow SearchDD panels to escape the card ── */
.ERP-form-card { overflow:visible !important; }
.ERP-form-body  { overflow:visible !important; }
.ERP-form-topbar { border-radius:var(--r-xl) var(--r-xl) 0 0 !important; }

/* ── LAYOUT ── */
.DB-root { display:grid; grid-template-columns:1fr 520px; gap:26px; align-items:start; }
@media(max-width:1280px){ .DB-root { grid-template-columns:1fr 440px; gap:20px; } }
@media(max-width:1060px){ .DB-root { grid-template-columns:1fr 360px; gap:14px; } }
@media(max-width:900px) { .DB-root { grid-template-columns:1fr; gap:16px; } }

/* Total Entries card removed — only Credit/Debit/Net Balance remain, so
   rebalance the stat grid to 3 columns instead of the base 4. */
.ERP-stats { grid-template-columns: repeat(3, 1fr); }
@media(max-width:1100px) { .ERP-stats { grid-template-columns: repeat(3, 1fr); } }
@media(max-width:600px)  { .ERP-stats { grid-template-columns: 1fr; } }

/* ── SECTION HEADERS ── */
.DB-sec { display:flex; align-items:center; gap:10px; margin:24px 0 14px; flex-wrap:wrap; }
.DB-sec:first-child { margin-top:0; }
.DB-sec-num { width:26px; height:26px; border-radius:7px; background:var(--ember-ghost); border:1px solid var(--ember-border); display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size: 8px; font-weight: 800; color:var(--ember); flex-shrink:0; }
.DB-sec-label { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2.5px; color:var(--text-3); text-transform:uppercase; white-space:nowrap; }
.DB-sec-rule { flex:1; height:1px; background:var(--border); min-width:20px; }
@media(max-width:480px){
  .DB-sec { margin:18px 0 12px; }
  .DB-sec-label { font-size: 8px; letter-spacing:1.5px; }
  .DB-cat-pill { margin-left:0; }
}

/* ── FORM GRID ── */
.DB-dd-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
@media(max-width:640px){ .DB-dd-grid { grid-template-columns:1fr; gap:10px; } }
.DB-dd-full { grid-column:1/-1; }

/* ── CATEGORY TYPE PILL ── */
.DB-cat-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:100px; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; border:1px solid; margin-left:auto; }
.DB-cat-pill.income  { background:var(--success-bg); color:var(--success); border-color:var(--success-bd); }
.DB-cat-pill.expense { background:var(--error-bg);   color:var(--error);   border-color:var(--error-bd);   }
.DB-cat-dot { width:5px; height:5px; border-radius:50%; background:currentColor; animation:db-pulse 1.8s infinite; }
@keyframes db-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

/* ── PAYMENT METHOD GRID ── */
.DB-pay-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:9px; }
@media(max-width:900px){ .DB-pay-grid { grid-template-columns:repeat(3,1fr); gap:8px; } }
@media(max-width:480px){ .DB-pay-grid { grid-template-columns:repeat(3,1fr); gap:7px; } }
.DB-pay-card {
  display:flex; flex-direction:column; align-items:center; gap:7px;
  padding:13px 6px 11px; border-radius:10px; border:1.5px solid var(--border);
  cursor:pointer; transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  background:var(--white); position:relative; overflow:hidden; outline:none;
}
.DB-pay-card:hover { transform:translateY(-2px); border-color:var(--border-2); box-shadow:var(--sh-hover); }
.DB-pay-card.sel { transform:translateY(-3px) scale(1.02); }
.DB-pay-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
.DB-pay-label { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:0.8px; text-transform:uppercase; color:var(--text-4); transition:color 0.2s; }
@media(max-width:640px){
  .DB-pay-card { padding:10px 4px 9px; gap:5px; border-radius:8px; }
  .DB-pay-icon { width:30px; height:30px; border-radius:7px; }
  .DB-pay-label { font-size: 7.5px; letter-spacing:0.3px; }
}
@media(max-width:400px){
  .DB-pay-card { padding:8px 3px 7px; gap:4px; }
  .DB-pay-icon { width:26px; height:26px; border-radius:6px; }
  .DB-pay-label { font-size: 7px; }
}
.DB-pay-card.sel .DB-pay-label { color:var(--text-1); }
.DB-pay-check { position:absolute; top:5px; right:5px; width:14px; height:14px; border-radius:50%; background:var(--white); display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0); transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 1px 4px rgba(0,0,0,0.15); }
.DB-pay-card.sel .DB-pay-check { opacity:1; transform:scale(1); }

/* ── AMOUNT FIELD ── */
.DB-amount-wrap { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); display:flex; align-items:center; padding:0 14px; gap:10px; transition:all 0.18s; min-height:62px; }
.DB-amount-wrap:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.DB-amount-prefix { font-family:var(--font-display); font-size: 19.5px; color:var(--ember); font-style:italic; flex-shrink:0; }
.DB-amount-input { flex:1; min-width:0; background:transparent; border:none; outline:none; font-family:var(--font-display); font-size: 26.5px; font-weight: 800; font-style:italic; color:var(--text-1); padding:8px 0; caret-color:var(--ember); }
.DB-amount-input::placeholder { color:var(--text-4); font-size: 19.5px; }
.DB-amount-input::-webkit-inner-spin-button, .DB-amount-input::-webkit-outer-spin-button { -webkit-appearance:none; }
@media(max-width:640px){
  .DB-amount-wrap { min-height:54px; padding:0 11px; gap:8px; }
  .DB-amount-prefix { font-size: 16px; }
  .DB-amount-input { font-size: 21px; }
  .DB-amount-input::placeholder { font-size: 16px; }
}
@media(max-width:400px){
  .DB-amount-input { font-size: 17.5px; }
  .DB-amount-prefix { font-size: 14px; }
}
.DB-amount-badge { display:flex; flex-direction:column; align-items:center; gap:3px; flex-shrink:0; padding:7px 11px; border-radius:var(--r-sm); border:1.5px solid; transition:all 0.2s; }
.DB-amount-badge.income  { background:var(--success-bg); border-color:var(--success-bd); color:var(--success); }
.DB-amount-badge.expense { background:var(--error-bg);   border-color:var(--error-bd);   color:var(--error);   }
.DB-amount-badge.none    { background:var(--surface);    border-color:var(--border);     color:var(--text-4);  }
.DB-amount-badge-lbl { font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:1px; text-transform:uppercase; }

/* ── DATE FIELD ── */
.DB-date-field { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); display:flex; align-items:center; gap:10px; padding:10px 13px; min-height:44px; transition:border-color 0.18s; }
.DB-date-field:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.DB-date-input { background:transparent; border:none; outline:none; font-family:var(--font-mono); font-size: 11px; font-weight: 700; color:var(--text-1); cursor:pointer; flex:1; }
.DB-date-input::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.5; }
/* Shared CalendarDD dropped inside the already-bordered .DB-date-field / .DB-date-wrap
   boxes — strip its own border so it doesn't nest box-in-box. */
.DB-date-field .ERP-cal-field, .DB-date-wrap .ERP-cal-field { border:none; background:transparent; padding:0; min-height:0; }
.DB-date-field .ERP-cal-val { font-size: 11px; }
.DB-date-wrap .ERP-cal-val { font-size: 9.5px; }

/* ── NARRATION FIELD ── */
.DB-narration-wrap { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); transition:all 0.18s; }
.DB-narration-wrap:focus-within { border-color:var(--ember-mid); box-shadow:0 0 0 3px var(--ember-ghost); }
.DB-narration { width:100%; background:transparent; border:none; outline:none; font-family:var(--font-body); font-size: 10.5px; color:var(--text-1); resize:none; caret-color:var(--ember); padding:11px 13px; line-height:1.6; display:block; box-sizing:border-box; }
.DB-narration::placeholder { color:var(--text-4); font-style:italic; }

/* ── TOOLBAR ── */
.DB-toolbar { display:flex; align-items:center; gap:10px; padding:12px 0; margin-bottom:4px; flex-wrap:wrap; }
.DB-toolbar-sep { flex:1; min-width:8px; }
.DB-date-wrap { display:flex; align-items:center; gap:8px; padding:9px 14px; background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-md); transition:border-color 0.18s; box-shadow:var(--sh-card); }
.DB-date-wrap:focus-within { border-color:var(--ember-mid); }
.DB-date-lbl { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2px; color:var(--text-4); text-transform:uppercase; white-space:nowrap; }
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
@media(max-width:520px){
  .DB-toolbar { gap:8px; }
  .DB-date-wrap { flex:1 1 auto; }
  .DB-toolbar-sep { display:none; }
}

/* ── EDIT BANNER ── */
.DB-edit-banner { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 14px; background:var(--warn-bg); border:1px solid var(--warn-bd); border-radius:var(--r-md); margin-bottom:18px; animation:erp-slide-up 0.2s ease both; flex-wrap:wrap; }
.DB-edit-lhs { display:flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size: 8.5px; font-weight: 800; color:var(--warn); flex:1; min-width:0; }
.DB-edit-cancel { display:flex; align-items:center; gap:5px; padding:5px 12px; background:none; border:1px solid var(--warn-bd); border-radius:var(--r-sm); font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--warn); cursor:pointer; transition:all 0.15s; flex-shrink:0; }
.DB-edit-cancel:hover { background:var(--warn); color:#faf9f7; }

/* ── BACK TO TRANSACTIONS BANNER ── */
.DB-back-banner {
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:11px 16px; background:var(--info-bg); border:1.5px solid var(--info-bd);
  border-radius:var(--r-md); margin-bottom:18px;
  animation:erp-slide-up 0.25s ease both; flex-wrap:wrap;
}
.DB-back-lhs { display:flex; align-items:center; gap:9px; font-family:var(--font-mono); font-size: 8.5px; font-weight: 800; color:var(--info); flex:1; min-width:0; }
.DB-back-btn {
  display:flex; align-items:center; gap:6px; padding:6px 14px;
  background:var(--info); color:#faf9f7; border:none;
  border-radius:var(--r-sm); font-family:var(--font-mono); font-size: 8px;
  font-weight: 800; letter-spacing:1.5px; text-transform:uppercase;
  cursor:pointer; transition:all 0.15s; flex-shrink:0; white-space:nowrap;
}
.DB-back-btn:hover { opacity:0.88; transform:translateX(-2px); }
@media(max-width:480px){
  .DB-edit-banner, .DB-back-banner { padding:9px 12px; }
  .DB-edit-lhs, .DB-back-lhs { font-size: 8px; }
}

/* ── MOBILE FORM CARD IMPROVEMENTS ── */
@media(max-width:768px){
  .ERP-form-body { padding:18px 18px 18px !important; }
}
@media(max-width:480px){
  .ERP-form-body { padding:14px 14px 16px !important; }
  .ERP-form-hdr  { gap:10px; padding-bottom:14px; margin-bottom:14px; }
  .ERP-form-icon-wrap { width:38px; height:38px; }
  .ERP-form-title { font-size: 15px; }
  .ERP-form-desc  { font-size: 9px; }
}

/* ── DROPDOWN Z-INDEX STACK ── */
.DB-SDD-panel { z-index:1000; background:#ffffff; background:var(--white,#ffffff); }

/* ── STAT DELTA ── */
.DB-stat-delta { display:flex; align-items:center; gap:5px; margin-top:5px; font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--text-4); letter-spacing:0.5px; }

/* ── NEW: PAYMENT BREAKDOWN IN STAT CARDS ── */
.DB-stat-pay-breakdown {
  margin-top:10px; padding-top:10px;
  border-top:1px solid rgba(255,255,255,0.08);
  display:flex; flex-direction:column; gap:5px; width:100%;
}
.DB-stat-pay-row {
  display:flex; align-items:center; gap:7px;
  font-family:var(--font-mono); font-size: 8px;
}
.DB-stat-pay-dot {
  width:6px; height:6px; border-radius:50%; flex-shrink:0;
}
.DB-stat-pay-mode {
  flex:1; color:var(--text-4); font-weight: 700; letter-spacing:0.5px;
  text-transform:uppercase; font-size: 8px;
}
.DB-stat-pay-amt {
  font-weight: 800; color:var(--text-2); font-size: 8.5px;
}
.DB-stat-overall-badge {
  display:inline-flex; align-items:center; gap:4px;
  padding:2px 8px; border-radius:100px;
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:1px; text-transform:uppercase;
  background:rgba(255,255,255,0.07); color:var(--text-4);
  border:1px solid rgba(255,255,255,0.10); margin-top:4px;
}

/* ── ENTRIES PANEL ── */
.DB-panel { background:var(--white); border:1.5px solid var(--border); border-radius:var(--r-xl); overflow:hidden; box-shadow:var(--sh-card); animation:erp-pop 0.45s 0.2s ease both; display:flex; flex-direction:column; max-height:920px; position:sticky; top:20px; }
@media(max-width:900px){ .DB-panel { position:relative; top:auto; max-height:600px; } }
@media(max-width:520px){ .DB-panel { max-height:480px; border-radius:var(--r-lg); } }
.DB-panel-accent { height:3px; background:linear-gradient(90deg,var(--ember) 0%,#F0834D 40%,#1E9C6A 100%); }
.DB-panel-hdr {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:15px 18px; border-bottom:1px solid var(--border); flex-shrink:0;
  background:linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 65%);
}
.DB-panel-hdr-left { display:flex; align-items:center; gap:10px; min-width:0; }
.DB-panel-hdr-icon {
  width:32px; height:32px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#DB5B1F 0%,#C2410C 100%);
  box-shadow:0 3px 9px rgba(59,130,246,0.35);
}
.DB-panel-title { font-family:var(--font-body); font-size: 12.5px; font-weight: 800; font-style:normal; text-transform:uppercase; letter-spacing:0.5px; color:var(--grey); }
.DB-panel-sub { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px; text-transform:uppercase; color:var(--text-4); margin-top:2px; }
.DB-panel-hdr-right { display:flex; align-items:center; gap:6px; flex-shrink:0; }
.DB-panel-pill {
  display:inline-flex; align-items:center; gap:3px;
  padding:5px 10px; border-radius:100px; border:1.5px solid;
  font-family:var(--font-mono); font-size: 9px; font-weight: 800; letter-spacing:-0.2px;
  white-space:nowrap;
}
.DB-panel-pill.cr { background:var(--success-bg); color:var(--success); border-color:var(--success-bd); }
.DB-panel-pill.dr { background:var(--error-bg);   color:var(--error);   border-color:var(--error-bd);   }
.DB-panel-badge { font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1.5px; padding:4px 11px; border-radius:100px; background:var(--info-bg); color:var(--info); border:1px solid var(--info-bd); text-transform:uppercase; }
@media(max-width:480px){
  .DB-panel-hdr-right { flex-wrap:wrap; justify-content:flex-end; }
  .DB-panel-pill { font-size: 8px; padding:4px 8px; }
}

/* ── MINI STATS ── */
.DB-mini-stats { display:grid; grid-template-columns:1fr 1fr 1fr; border-bottom:1px solid var(--border); flex-shrink:0; }
.DB-mini-stat { padding:11px 14px; border-right:1px solid var(--border); }
.DB-mini-stat:last-child { border-right:none; }
.DB-mini-lbl { font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-4); margin-bottom:3px; display:flex; align-items:center; gap:3px; }
.DB-mini-val { font-family:var(--font-mono); font-size: 9px; font-weight: 800; }
.DB-mini-val.cr  { color:var(--success); }
.DB-mini-val.dr  { color:var(--error); }
.DB-mini-val.bal-pos { color:var(--info); }
.DB-mini-val.bal-neg { color:var(--error); }
@media(max-width:480px){
  .DB-mini-stat { padding:8px 10px; }
  .DB-mini-lbl { font-size: 6.5px; letter-spacing:0.8px; }
  .DB-mini-val { font-size: 9px; }
}

/* ── PREMIUM CR / DR SUMMARY STRIP — same card language as the top
   ERP-stat cards (white card, top accent bar, mono uppercase label,
   bold mono value) instead of the flat tinted-strip look. ── */
.DB-sum-strip {
  display:grid; grid-template-columns:1fr 1fr; gap:10px;
  padding:12px 14px; border-bottom:1px solid var(--border); flex-shrink:0;
  background:var(--off-white);
}
.DB-sum-card {
  display:flex; align-items:center; gap:10px; padding:11px 12px;
  position:relative; overflow:hidden;
  background:var(--white); border:1px solid var(--border); border-radius:var(--r-md);
  transition:transform 0.2s, box-shadow 0.2s;
}
.DB-sum-card:hover { transform:translateY(-2px); box-shadow:var(--sh-hover); }
.DB-sum-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  border-radius:var(--r-lg) var(--r-lg) 0 0;
}
.DB-sum-card.cr::before { background:linear-gradient(90deg,var(--success),#34D399); }
.DB-sum-card.dr::before { background:linear-gradient(90deg,var(--error),#F87171); }
.DB-sum-icon {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  transition:transform 0.2s;
}
.DB-sum-card:hover .DB-sum-icon { transform:scale(1.08); }
.DB-sum-icon.cr { background:var(--success-bg); border:1.5px solid var(--success-bd); }
.DB-sum-icon.dr { background:var(--error-bg);   border:1.5px solid var(--error-bd);   }
.DB-sum-info { display:flex; flex-direction:column; gap:3px; min-width:0; }
.DB-sum-lbl {
  font-family:var(--font-mono); font-size: 7px; font-weight: 800;
  letter-spacing:2px; text-transform:uppercase; color:var(--text-4);
}
.DB-sum-val {
  font-family:var(--font-mono); font-size: 14px; font-weight: 800;
  line-height:1; letter-spacing:-0.4px;
}
.DB-sum-val.cr { color:var(--success); }
.DB-sum-val.dr { color:var(--error); }
@media(max-width:480px){
  .DB-sum-strip { padding:10px 12px; gap:8px; }
  .DB-sum-card { padding:9px 10px; gap:8px; }
  .DB-sum-icon { width:28px; height:28px; border-radius:8px; }
  .DB-sum-val { font-size: 11.5px; }
  .DB-sum-lbl { font-size: 6.5px; letter-spacing:1px; }
}

/* ── LEGEND ── */
.DB-legend { display:flex; align-items:center; gap:10px; padding:9px 16px; border-bottom:1px solid var(--border); flex-shrink:0; background:var(--off-white); }
.DB-legend-item { display:flex; align-items:center; gap:5px; font-family:var(--font-mono); font-size: 7.5px; font-weight: 800; letter-spacing:1px; text-transform:uppercase; }
.DB-legend-dot { width:6px; height:6px; border-radius:50%; }
.DB-legend-sep { flex:1; }
.DB-legend-date { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); }

/* ── ENTRY LIST ── */
.DB-entry-list { flex:1; overflow-y:auto; padding:3px 0; }
.DB-entry-list::-webkit-scrollbar { width:3px; }
.DB-entry-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

/* ── SINGLE ENTRY ── */
.DB-entry { display:flex; align-items:flex-start; gap:9px; padding:12px 16px; border-bottom:1px solid var(--border); transition:background 0.13s; }
.DB-entry:last-child { border-bottom:none; }
.DB-entry:hover { background:rgba(37,99,235,0.04); }
.DB-entry-bar { width:3px; border-radius:2px; align-self:stretch; min-height:36px; flex-shrink:0; margin-top:2px; }
.DB-entry-bar.income  { background:linear-gradient(180deg,#1E9C6A,#15785A); }
.DB-entry-bar.expense { background:linear-gradient(180deg,var(--ember-mid),var(--ember)); }
.DB-entry-body { flex:1; min-width:0; }
.DB-entry-top { display:flex; align-items:center; justify-content:space-between; gap:6px; }
.DB-entry-party { font-family:var(--font-body); font-size: 10.5px; font-weight: 800; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.DB-entry-amount { font-family:var(--font-mono); font-size: 10px; font-weight: 800; white-space:nowrap; flex-shrink:0; }
.DB-entry-amount.income  { color:var(--success); }
.DB-entry-amount.expense { color:var(--error); }
.DB-entry-meta { display:flex; align-items:center; gap:5px; margin-top:3px; flex-wrap:wrap; }
.DB-entry-cat { font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--text-4); letter-spacing:0.8px; text-transform:uppercase; }
.DB-entry-cr-dr { font-family:var(--font-mono); font-size: 7px; font-weight: 800; padding:1px 6px; border-radius:100px; border:1px solid; letter-spacing:1px; text-transform:uppercase; }
.DB-entry-cr-dr.cr { background:var(--success-bg); color:var(--success); border-color:var(--success-bd); }
.DB-entry-cr-dr.dr { background:var(--error-bg);   color:var(--error);   border-color:var(--error-bd);   }
.DB-entry-pay { display:inline-flex; align-items:center; gap:4px; font-family:var(--font-mono); font-size: 8px; padding:2px 7px; border-radius:100px; border:1px solid; font-weight: 800; }
.DB-entry-note { font-family:var(--font-body); font-size: 9px; color:var(--text-4); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-style:italic; }
.DB-entry-client { font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--success); margin-top:2px; display:flex; align-items:center; gap:4px; }
.DB-entry-idx { font-family:var(--font-mono); font-size: 8px; font-weight: 700; color:var(--text-4); width:17px; text-align:right; flex-shrink:0; margin-top:11px; }
.DB-entry-actions { display:flex; gap:3px; flex-shrink:0; margin-top:2px; }
/* Duplicate .DB-ea below (authoritative version is further down in the file) */

/* ── SKELETON ── */
.DB-skeleton { background:linear-gradient(90deg,var(--off-white) 25%,var(--surface-3) 50%,var(--off-white) 75%); background-size:600px 100%; animation:erp-shimmer 1.6s infinite linear; border-radius:var(--r-sm); }

/* ── EMPTY ── */
.DB-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:52px 24px; text-align:center; }
.DB-empty-icon { width:52px; height:52px; border-radius:50%; background:var(--ember-ghost); border:1.5px solid var(--ember-border); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.DB-empty-title { font-family:var(--font-body); font-size: 14px; font-weight: 800; font-style:normal; text-transform:uppercase; letter-spacing:0.4px; color:var(--grey); margin-bottom:4px; }
.DB-empty-sub { font-family:var(--font-mono); font-size: 8px; color:var(--text-4); letter-spacing:1.5px; text-transform:uppercase; }

/* ── VIEW ALL ── */
.DB-view-all { display:flex; align-items:center; justify-content:center; gap:7px; padding:13px; border-top:1px solid var(--border); font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:2px; text-transform:uppercase; color:var(--ember); cursor:pointer; transition:background 0.15s; flex-shrink:0; }
.DB-view-all:hover { background:var(--ember-ghost); }

/* ── PROFESSIONAL ENTRIES TABLE ── */
.DB-tbl-wrap { flex:1; overflow:auto; border-top:1px solid var(--border); -webkit-overflow-scrolling:touch; }
.DB-tbl-wrap::-webkit-scrollbar { width:3px; height:3px; }
.DB-tbl-wrap::-webkit-scrollbar-thumb { background:var(--border-2); border-radius:2px; }
.DB-tbl { width:100%; border-collapse:collapse; font-family:var(--font-body); min-width:540px; }
.DB-tbl-head { background:var(--off-white); position:sticky; top:0; z-index:2; }

/* ── TABLE HEADER ENHANCED ── */
.DB-th { 
  padding:10px 10px; 
  font-family:var(--font-mono); 
  font-size: 8px; 
  font-weight: 800; 
  letter-spacing:1.5px; 
  text-transform:uppercase; 
  color:var(--text-3); 
  text-align:left; 
  border-bottom:2px solid var(--border); 
  white-space:nowrap; 
  background:var(--off-white); 
  position:sticky; 
  top:0; 
  z-index:2; 
}
.DB-th svg { vertical-align:middle; margin-right:4px; opacity:0.7; }
.DB-th-no { width:40px; text-align:center; }
.DB-th-r  { text-align:right; }
.DB-th-act { text-align:center; width:100px; }

/* ── ROW STYLES ENHANCED ── */
.DB-tbl-row { 
  border-bottom:1px solid var(--border); 
  transition:all 0.2s ease; 
  position:relative;
}
.DB-tbl-row:last-child { border-bottom:none; }
.DB-tbl-row:hover { 
  transform:translateX(2px); 
  box-shadow:inset 0 0 0 1px var(--ember-border); 
  background:rgba(37,99,235,0.04); 
}
.DB-tbl-row.income:hover { background:rgba(30,156,106,0.06) !important; }
.DB-tbl-row.expense:hover { background:rgba(217,59,85,0.05) !important; }

.DB-td { 
  padding:10px 10px; 
  font-size: 9.5px; 
  color:var(--text-2); 
  vertical-align:middle; 
}
.DB-td-no { text-align:center; padding:0 6px; position:relative; }
.DB-td-r { text-align:right; }
.DB-td-act { text-align:center; white-space:nowrap; }

/* ── ROW NUMBER ENHANCED ── */
.DB-row-num { 
  font-family:var(--font-mono); 
  font-size: 8px; 
  font-weight: 800; 
  color:var(--text-3); 
  background:var(--off-white); 
  padding:2px 5px; 
  border-radius:3px; 
  letter-spacing:0.5px; 
  line-height:1; 
}
.DB-row-bar { 
  width:3px; 
  border-radius:2px; 
  margin:3px auto 0; 
  height:16px; 
}
.DB-row-bar.income { background:linear-gradient(180deg,#1E9C6A,#34D399); }
.DB-row-bar.expense { background:linear-gradient(180deg,var(--ember-mid),#F87171); }

/* ── CATEGORY WRAPPER ENHANCED ── */
.DB-td-cat-wrap { 
  display:flex; 
  flex-direction:column; 
  gap:3px; 
}
.DB-td-cat { 
  display:flex; 
  align-items:center; 
  font-size: 9.5px; 
  font-weight: 800; 
  color:var(--text-1); 
  line-height:1.3; 
}
.DB-td-sub { 
  display:flex; 
  align-items:center; 
  font-family:var(--font-mono); 
  font-size: 8px; 
  color:var(--text-4); 
  letter-spacing:0.3px; 
  background:var(--off-white); 
  padding:1px 6px; 
  border-radius:3px; 
  width:fit-content; 
}

/* ── CR/DR BADGE ── */
.DB-tbl-cr-dr { 
  display:inline-flex; 
  align-items:center; 
  gap:3px; 
  font-family:var(--font-mono); 
  font-size: 7px; 
  font-weight: 800; 
  padding:1px 6px; 
  border-radius:100px; 
  border:1px solid; 
  letter-spacing:1px; 
  text-transform:uppercase; 
  margin-bottom:2px; 
  width:fit-content; 
}
.DB-tbl-cr-dr.cr { background:var(--success-bg); color:var(--success); border-color:var(--success-bd); }
.DB-tbl-cr-dr.dr { background:var(--error-bg);   color:var(--error);   border-color:var(--error-bd);   }

/* ── PARTY NAME ENHANCED ── */
.DB-td-party { 
  display:flex; 
  align-items:center; 
  gap:6px; 
  font-size: 10px; 
  font-weight: 700; 
  color:var(--text-2); 
  white-space:nowrap; 
}
.DB-td-party span { font-size: 10px; }

/* ── CLIENT NAME ENHANCED ── */
.DB-td-client { 
  display:flex; 
  align-items:center; 
  gap:5px; 
  background:rgba(30,156,106,0.06); 
  padding:2px 8px; 
  border-radius:4px; 
  border:1px solid rgba(30,156,106,0.10); 
  font-size: 9px; 
  font-weight: 700; 
  color:var(--text-2); 
  white-space:nowrap; 
}
.DB-td-client span { font-size: 9px; }

.DB-td-nil { color:var(--text-4); font-size: 9px; }

/* ── AMOUNT ENHANCED ── */
.DB-tbl-amount { 
  display:flex; 
  align-items:center; 
  justify-content:flex-end; 
  gap:3px; 
  font-family:var(--font-mono); 
  font-size: 10.5px; 
  font-weight: 800; 
  white-space:nowrap; 
}
.DB-tbl-amount.income { color:var(--success); }
.DB-tbl-amount.expense { color:var(--error); }
.DB-tbl-sign { font-size: 9px; font-weight: 800; opacity:0.7; }

/* ── NARRATION ENHANCED ── */
.DB-td-note { 
  display:flex; 
  align-items:center; 
  gap:4px; 
  margin-top:3px; 
  padding:1px 6px; 
  background:var(--off-white); 
  border-radius:3px; 
  justify-content:flex-end; 
  font-size: 8px; 
  color:var(--text-4); 
  font-style:italic; 
  white-space:nowrap; 
  overflow:hidden; 
  text-overflow:ellipsis; 
  max-width:120px; 
}
.DB-td-note span { font-size: 8px; color:var(--text-4); }

/* ── PAYMENT METHOD ENHANCED ── */
.DB-tbl-pay { 
  display:inline-flex !important; 
  align-items:center !important; 
  gap:5px !important; 
  padding:4px 10px !important; 
  border-radius:6px !important; 
  border-width:1.5px !important; 
  font-family:var(--font-mono); 
  font-size: 8px !important; 
  font-weight: 800 !important; 
  white-space:nowrap; 
  transition:all 0.2s ease; 
}
.DB-tbl-pay:hover { 
  transform:scale(1.05); 
  box-shadow:0 2px 8px rgba(0,0,0,0.10); 
}

/* ── ACTIONS BUTTONS ENHANCED ── */
.DB-ea {
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:4px 10px;
  border-radius:5px;
  font-family:var(--font-mono);
  font-size: 7.5px;
  font-weight: 800;
  letter-spacing:0.8px;
  text-transform:uppercase;
  cursor:pointer;
  border:1.5px solid;
  transition:opacity 0.2s ease, background 0.15s, color 0.15s, box-shadow 0.15s, border-color 0.15s;
  min-height:28px;
}
.DB-ea.edit {
  background:var(--ember-ghost);
  color:var(--ember);
  border-color:var(--ember-border);
}
.DB-ea.edit:hover {
  background:var(--ember);
  color:#faf9f7;
  border-color:var(--ember);
  box-shadow:0 2px 8px rgba(37,99,235,0.30);
}
.DB-ea.del { 
  background:var(--error-bg); 
  color:var(--error); 
  border-color:var(--error-bd); 
}
.DB-ea.del:hover { 
  background:var(--error); 
  color:#faf9f7; 
  border-color:var(--error); 
  transform:translateY(-1px); 
  box-shadow:0 2px 8px rgba(217,59,85,0.30); 
}

/* ── ENTRY ID BADGE ── */
.DB-entry-id-badge {
  font-family:var(--font-mono);
  font-size: 7px;
  color:var(--text-4);
  background:var(--off-white);
  padding:1px 6px;
  border-radius:3px;
  letter-spacing:0.3px;
}

/* ════════════════════════════════════════════
   PREMIUM RECENT ENTRIES CARD FEED
   ════════════════════════════════════════════ */

/* Live dot pulse */
@keyframes db-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
.DB-rc-live-dot {
  width:7px; height:7px; border-radius:50%;
  background:var(--success); flex-shrink:0;
  animation:db-pulse 1.8s ease-in-out infinite;
  box-shadow:0 0 0 2px var(--success-bg);
}

/* Card list container */
.DB-rc-list { flex:1; overflow-y:auto; }
.DB-rc-list::-webkit-scrollbar { width:3px; }
.DB-rc-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

/* ── Single card animations ── */
@keyframes db-slide-in {
  from { opacity:0; transform:translateX(-16px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes db-new-pop {
  0%   { opacity:0; transform:translateY(-24px) scale(0.95); box-shadow:0 10px 36px rgba(37,99,235,0.25); }
  55%  { opacity:1; transform:translateY(5px) scale(1.015); }
  100% { opacity:1; transform:translateY(0) scale(1); box-shadow:none; }
}
.DB-rc {
  display:flex; align-items:stretch; position:relative;
  border-bottom:1px solid var(--border);
  min-height:64px;
  /* No overflow:hidden — it was clipping the button stagger animation */
  transition:background 0.13s;
  animation:db-slide-in 0.38s cubic-bezier(0.22,1,0.36,1) both;
}
/* New entry drops in from top with spring bounce */
.DB-rc.db-new {
  animation:db-new-pop 0.52s cubic-bezier(0.34,1.56,0.64,1) both;
}
.DB-rc:last-child { border-bottom:none; }
.DB-rc:hover { background:rgba(37,99,235,0.025); }
.DB-rc.income:hover { background:rgba(30,156,106,0.045); }
.DB-rc.expense:hover { background:rgba(217,59,85,0.035); }

/* Left colored accent strip */
.DB-rc-strip {
  width:3px; flex-shrink:0; align-self:stretch;
}
.DB-rc-strip.income  { background:linear-gradient(180deg,#1E9C6A 0%,#34D399 100%); }
.DB-rc-strip.expense { background:linear-gradient(180deg,#F0834D 0%,#D93B55 100%); }

/* Serial number */
.DB-rc-num {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  letter-spacing:0.3px; width:28px; display:flex; align-items:center;
  justify-content:center; flex-shrink:0; text-align:center;
}
.DB-rc-num.income  { color:rgba(30,156,106,0.45); }
.DB-rc-num.expense { color:rgba(37,99,235,0.55); }

/* Body */
.DB-rc-body {
  flex:1; min-width:0; padding:10px 6px 10px 4px;
  display:flex; flex-direction:column; justify-content:center; gap:5px;
}

/* Top row: party name + amount */
.DB-rc-top {
  display:flex; align-items:flex-start; justify-content:space-between; gap:8px;
}
.DB-rc-party {
  display:flex; flex-direction:column; gap:3px; min-width:0; flex:1;
}
.DB-rc-party-name {
  font-family:var(--font-body); font-size: 10px; font-weight: 800;
  color:var(--text-1); line-height:1.2;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.DB-rc-parent {
  display:inline-flex; align-items:center; gap:3px;
  font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:0.3px;
  color:var(--text-3); opacity:0.75;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;
}
.DB-rc-client {
  display:inline-flex; align-items:center; gap:3px;
  font-family:var(--font-mono); font-size: 7px; font-weight: 800; letter-spacing:0.5px;
  color:var(--success); background:var(--success-bg); border:1px solid var(--success-bd);
  padding:1px 6px; border-radius:100px; width:fit-content;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;
}
.DB-rc-amount {
  font-family:var(--font-mono); font-size: 11.5px; font-weight: 800;
  white-space:nowrap; flex-shrink:0; line-height:1.2;
  display:flex; align-items:center; gap:1px;
  letter-spacing:-0.3px;
}
.DB-rc-amount.income  { color:var(--success); }
.DB-rc-amount.expense { color:var(--error); }
.DB-rc-sign { font-size: 9px; font-weight: 800; opacity:0.6; margin-right:1px; }

/* Meta row: badges, category, mode, date */
.DB-rc-meta {
  display:flex; align-items:center; gap:4px; flex-wrap:wrap;
}
.DB-rc-badge {
  display:inline-flex; align-items:center; gap:2px;
  font-family:var(--font-mono); font-size: 6px; font-weight: 800; letter-spacing:1.2px;
  padding:1px 5px; border-radius:100px; border:1px solid; text-transform:uppercase;
  flex-shrink:0; line-height:1.4;
}
.DB-rc-badge.cr { background:var(--success-bg); color:var(--success); border-color:var(--success-bd); }
.DB-rc-badge.dr { background:var(--error-bg);   color:var(--error);   border-color:var(--error-bd);   }
.DB-rc-cat {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  color:var(--text-2); letter-spacing:0.3px; white-space:nowrap;
}
.DB-rc-sub {
  font-family:var(--font-mono); font-size: 7.5px; font-weight: 700; color:var(--text-3);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:90px;
}
.DB-rc-sep { flex:1; min-width:4px; }
.DB-rc-pay {
  display:inline-flex; align-items:center; gap:3px;
  font-family:var(--font-mono); font-size: 7px; font-weight: 800;
  padding:2px 7px; border-radius:4px; border:1px solid;
  white-space:nowrap; flex-shrink:0; letter-spacing:0.3px;
}
.DB-rc-date {
  font-family:var(--font-mono); font-size: 7.5px; color:var(--text-4);
  white-space:nowrap; flex-shrink:0; letter-spacing:0.3px;
}
.DB-rc-note {
  font-family:var(--font-body); font-size: 8px; color:var(--text-3); font-weight: 700;
  font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  max-width:90px; flex-shrink:1;
}

/* Actions — fade in line-by-line on hover (no translateX — parent clips it) */
.DB-rc-act {
  display:flex; flex-direction:column; gap:3px; align-items:flex-end; justify-content:center;
  padding:6px 10px 6px 2px; flex-shrink:0;
}
/* Both buttons hidden by default */
.DB-rc-act .DB-ea {
  opacity:0;
}
/* Edit fades in first — no delay */
.DB-rc:hover .DB-rc-act .DB-ea:nth-child(1) {
  opacity:1;
  transition:opacity 0.18s ease 0ms, background 0.15s, color 0.15s, box-shadow 0.15s, border-color 0.15s;
}
/* Delete fades in second — 130ms after edit is visible */
.DB-rc:hover .DB-rc-act .DB-ea:nth-child(2) {
  opacity:1;
  transition:opacity 0.18s ease 130ms, background 0.15s, color 0.15s, box-shadow 0.15s, border-color 0.15s;
}
/* On small screens always show both */
@media(max-width:520px){
  .DB-rc-act .DB-ea { opacity:1; }
}

/* Skeleton cards */
@keyframes db-rc-shimmer { from{background-position:-600px 0} to{background-position:600px 0} }
.DB-rc-skeleton {
  height:64px;
  background:linear-gradient(90deg,var(--off-white) 25%,var(--surface-3,#F5F3EF) 50%,var(--off-white) 75%);
  background-size:600px 100%;
  animation:db-rc-shimmer 1.5s infinite linear;
  border-bottom:1px solid var(--border);
}

/* ── Recent Entries — tabular layout (replaces the old card feed) ── */
.DB-rc-tbl { width:100%; border-collapse:collapse; }
.DB-rc-tbl thead th {
  position:sticky; top:0; z-index:1;
  background:linear-gradient(180deg, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0.11) 100%);
  border-bottom:2px solid var(--ember-mid);
  box-shadow:0 2px 6px rgba(59,130,246,0.14);
  color:#9A3412; font-family:var(--font-mono); font-size: 7.5px; font-weight: 800;
  letter-spacing:1.2px; text-transform:uppercase; text-align:left;
  padding:9px 8px; white-space:nowrap;
}
.DB-rc-tbl thead th:first-child { padding-left:12px; }
.DB-rc-th-amt, .DB-rc-td-amt { text-align:right; }
.DB-rc-tbl thead th:first-child, .DB-rc-th-act { text-align:center; }
.DB-rc-tbl tbody tr {
  border-bottom:1px solid var(--border);
  transition:background 0.13s;
  animation:db-slide-in 0.38s cubic-bezier(0.22,1,0.36,1) both;
}
.DB-rc-tbl tbody tr:nth-child(even) { background:var(--off-white,#F5F3EF); }
.DB-rc-tbl tbody tr.income { box-shadow:inset 3px 0 0 #1E9C6A; }
.DB-rc-tbl tbody tr.expense { box-shadow:inset 3px 0 0 #F0834D; }
.DB-rc-tbl tbody tr.income:hover { background:rgba(30,156,106,0.06); }
.DB-rc-tbl tbody tr.expense:hover { background:rgba(217,59,85,0.05); }
.DB-rc-tbl tbody tr.db-new { animation:db-new-pop 0.52s cubic-bezier(0.34,1.56,0.64,1) both; }
.DB-rc-tbl td { padding:7px 8px; vertical-align:middle; }
.DB-rc-tbl td:first-child { padding-left:12px; }
.DB-rc-td-num {
  font-family:var(--font-mono); font-size: 8px; font-weight: 800;
  width:20px; text-align:center;
}
.DB-rc-td-num.income  { color:rgba(30,156,106,0.55); }
.DB-rc-td-num.expense { color:rgba(37,99,235,0.65); }
.DB-rc-td-main { min-width:0; }
.DB-rc-td-party {
  font-family:var(--font-body); font-size: 9px; font-weight: 800;
  color:var(--text-1); line-height:1.2; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; max-width:160px;
}
.DB-rc-td-meta { display:flex; align-items:center; gap:4px; flex-wrap:wrap; margin-top:4px; }
.DB-rc-td-amt {
  font-family:var(--font-mono); font-size: 10px; font-weight: 800;
  white-space:nowrap; letter-spacing:-0.2px;
}
.DB-rc-td-amt.income  { color:var(--success); }
.DB-rc-td-amt.expense { color:var(--error); }
.DB-rc-cur { font-family:var(--font-mono); font-size: 8px; opacity:0.65; margin-right:1px; }
.DB-rc-td-date {
  font-family:var(--font-mono); font-size: 7.5px; color:var(--text-4);
  white-space:nowrap; letter-spacing:0.3px;
}
.DB-rc-td-act {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:4px; white-space:nowrap;
}
.DB-rc-td-act .DB-ea {
  min-height:auto; width:22px; height:22px; padding:0;
  justify-content:center; border-radius:6px; gap:0;
}
@keyframes db-act-pop {
  0%   { opacity:0; transform:translateY(7px) scale(0.6); }
  55%  { opacity:1; transform:translateY(-2px) scale(1.12); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}
.DB-rc-tbl tbody tr .DB-rc-td-act .DB-ea {
  opacity:0; transform:translateY(7px) scale(0.6);
  transition:opacity 0.16s ease, transform 0.16s ease, background 0.15s, color 0.15s, box-shadow 0.15s, border-color 0.15s;
}
/* Edit pops in first, Delete follows ~170ms later — a deliberate 1-by-1
   reveal instead of both buttons fading in together. */
.DB-rc-tbl tbody tr:hover .DB-rc-td-act .DB-ea.edit {
  animation:db-act-pop 0.34s cubic-bezier(0.34,1.56,0.64,1) 0ms both;
}
.DB-rc-tbl tbody tr:hover .DB-rc-td-act .DB-ea.del {
  animation:db-act-pop 0.34s cubic-bezier(0.34,1.56,0.64,1) 170ms both;
}
@media(max-width:520px){
  .DB-rc-tbl tbody tr .DB-rc-td-act .DB-ea { opacity:1; transform:none; animation:none; }
}

/* ── UNDO TOAST ── */
@keyframes db-toast-in { from{opacity:0;transform:translateX(-50%) translateY(24px) scale(0.97)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
@keyframes db-toast-out { from{opacity:1;transform:translateX(-50%) translateY(0)} to{opacity:0;transform:translateX(-50%) translateY(24px)} }
.DB-undo-toast {
  position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:14px;
  background:var(--surface-2,#231C14); color:#faf9f7;
  border:1.5px solid rgba(255,255,255,0.10);
  border-radius:14px; padding:14px 18px;
  box-shadow:0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);
  z-index:9999; min-width:360px; max-width:520px;
  animation:db-toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  overflow:hidden;
}
@media(max-width:520px){
  .DB-undo-toast { min-width:auto; width:calc(100% - 32px); bottom:16px; gap:10px; padding:12px 14px; flex-wrap:wrap; }
  .DB-undo-icon { width:30px; height:30px; border-radius:8px; }
  .DB-undo-actions { width:100%; justify-content:flex-end; }
  .DB-undo-title { font-size: 8.5px; }
  .DB-undo-sub { font-size: 9px; }
}
.DB-undo-toast-bar {
  position:absolute; left:0; bottom:0; height:3px; width:100%;
  background:linear-gradient(90deg,var(--error),rgba(217,59,85,0.3));
  animation:db-toast-shrink 6s linear forwards;
  border-radius:0 0 14px 14px;
}
@keyframes db-toast-shrink { from{width:100%} to{width:0%} }
.DB-undo-icon { width:36px; height:36px; border-radius:10px; background:rgba(217,59,85,0.15); border:1px solid rgba(217,59,85,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.DB-undo-body { flex:1; min-width:0; }
.DB-undo-title { font-family:var(--font-mono); font-size: 9px; font-weight: 800; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,0.9); }
.DB-undo-sub { font-family:var(--font-body); font-size: 9px; color:rgba(255,255,255,0.5); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.DB-undo-name { color:rgba(255,255,255,0.8); font-weight: 700; }
.DB-undo-actions { display:flex; gap:7px; flex-shrink:0; }
.DB-undo-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 13px; border-radius:8px; font-family:var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing:1px; text-transform:uppercase; cursor:pointer; border:1px solid; transition:all 0.15s; }
.DB-undo-btn.undo    { background:rgba(37,99,235,0.12); color:var(--ember,#F0834D); border-color:rgba(37,99,235,0.35); }
.DB-undo-btn.undo:hover    { background:var(--ember,#F0834D); color:#faf9f7; border-color:var(--ember,#F0834D); }
.DB-undo-btn.confirm { background:rgba(217,59,85,0.12); color:#F87171; border-color:rgba(217,59,85,0.35); }
.DB-undo-btn.confirm:hover { background:var(--error,#D93B55); color:#faf9f7; border-color:var(--error,#D93B55); }

/* ── FORM WATERMARK ── */
.DB-watermark { position:absolute; top:20px; right:24px; font-family:var(--font-display); font-size: 63.5px; font-style:italic; font-weight: 800; color:rgba(37,99,235,0.05); pointer-events:none; user-select:none; letter-spacing:-3px; line-height:1; }

/* ══ GLOBAL RESPONSIVE OVERRIDES FOR DAYBOOK ══ */

/* 768px — tablet */
@media(max-width:768px){
  .DB-watermark { font-size: 46px; }
  .DB-tbl th.DB-th:nth-child(4),
  .DB-tbl td.DB-td:nth-child(4) { display:none; } /* hide Client column — saves space */
}

/* 520px — large phone */
@media(max-width:520px){
  .DB-watermark { display:none; }
  .ERP-btn-row { flex-wrap:wrap; }
  .ERP-btn { flex:1 1 auto; justify-content:center; padding:11px 16px; }
  .DB-panel-hdr { padding:13px 14px 10px; flex-wrap:wrap; gap:6px; }
  .DB-panel-title { font-size: 13px; }
  .DB-entry-actions { flex-wrap:wrap; }
  .DB-legend { flex-wrap:wrap; gap:8px; padding:7px 12px; }
  .DB-view-all { padding:10px; font-size: 8px; }
}

/* 400px — small phone */
@media(max-width:400px){
  .ERP-btn { font-size: 8px; letter-spacing:1px; }
  .DB-sec-num { width:22px; height:22px; font-size: 8px; border-radius:6px; }
  .DB-SDD-trigger { min-height:40px; padding:8px 11px; }
  .DB-SDD-selected { font-size: 9.5px; }
  .DB-date-field { padding:8px 11px; }
  .DB-date-input { font-size: 9.5px; }
  .DB-narration { font-size: 9.5px; padding:9px 11px; }
  .DB-client-input { font-size: 9.5px; }
  .DB-client-input-wrap { padding:8px 11px; min-height:40px; }
}

/* ══════════════════════════════════════════════════
   PREMIUM SCROLLBAR — Cash Book (ERP Light Surface)
   ══════════════════════════════════════════════════ */
@keyframes db-sb-glow {
  0%,100% { box-shadow: 0 0 4px rgba(59,130,246,0.35), 0 0 10px rgba(29,78,216,0.15); }
  50%      { box-shadow: 0 0 9px rgba(59,130,246,0.62), 0 0 20px rgba(29,78,216,0.28); }
}

.DB-SDD-list, .DB-entry-list, .DB-tbl-wrap, .DB-rc-list {
  scrollbar-width: thin;
  scrollbar-color: #DB5B1F transparent;
}

.DB-SDD-list::-webkit-scrollbar,
.DB-entry-list::-webkit-scrollbar,
.DB-tbl-wrap::-webkit-scrollbar,
.DB-rc-list::-webkit-scrollbar { width: 3px; height: 3px; }

.DB-SDD-list::-webkit-scrollbar-track,
.DB-entry-list::-webkit-scrollbar-track,
.DB-tbl-wrap::-webkit-scrollbar-track,
.DB-rc-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 99px;
}

.DB-SDD-list::-webkit-scrollbar-thumb,
.DB-entry-list::-webkit-scrollbar-thumb,
.DB-tbl-wrap::-webkit-scrollbar-thumb,
.DB-rc-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  border: none;
  box-shadow: 0 0 4px rgba(59,130,246,0.28);
  transition: background 0.22s ease, box-shadow 0.22s ease;
}

.DB-SDD-list::-webkit-scrollbar-thumb:hover,
.DB-entry-list::-webkit-scrollbar-thumb:hover,
.DB-tbl-wrap::-webkit-scrollbar-thumb:hover,
.DB-rc-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FBC9A8 0%, #DB5B1F 40%, #C2410C 100%);
  box-shadow: 0 0 8px rgba(59,130,246,0.55), 0 0 18px rgba(29,78,216,0.25);
  animation: db-sb-glow 1.8s ease-in-out infinite;
}

/* ══════════════════════════════════════════════════
   REQUIRED-FIELD VALIDATION — same shake/scroll/alert
   pattern as the 5 Master Data pages
   ══════════════════════════════════════════════════ */
@keyframes db-field-shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.DB-field-error.DB-amount-wrap,
.DB-field-error .DB-SDD-trigger,
.DB-field-error .DB-client-input-wrap {
  border-color: var(--error) !important;
  background: var(--error-bg) !important;
  animation: db-field-shake 0.4s ease;
}
.DB-field-error-msg {
  display: flex; align-items: center; gap: 5px;
  margin-top: 6px;
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 800;
  letter-spacing: 0.3px; color: var(--error);
  animation: erp-fade-in 0.2s ease both;
}

/* ══════════════════════════════════════════════════
   BOLDER / DARKER CREATE-FORM TEXT — match Master Data pages
   ══════════════════════════════════════════════════ */
.DB-SDD-selected, .DB-amount-input, .DB-narration, .DB-client-input, .DB-date-input {
  font-weight: 800 !important;
  color: var(--text-1) !important;
}
.DB-SDD-ph, .DB-narration::placeholder, .DB-client-input::placeholder, .DB-amount-input::placeholder {
  font-weight: 700 !important;
  color: var(--text-3) !important;
}
.DB-SDD-item { font-weight: 700; color: var(--text-2); }
.ERP-label { font-weight: 800 !important; color: var(--text-2) !important; }

/* ══════════════════════════════════════════════════
   COMPACT / PREMIUM SAVE-ENTRY & CLEAR-FORM BUTTONS
   — same pill language as MD-cancel-pill on Master Data pages
   ══════════════════════════════════════════════════ */
.DB-root .ERP-btn-row { gap: 10px; margin-top: 18px; padding-top: 16px; }
.DB-root .ERP-btn {
  padding: 9px 20px !important;
  font-size: 8.5px !important;
  letter-spacing: 1.2px !important;
  border-radius: 100px !important;
  gap: 6px !important;
  flex: 0 0 auto;
}
.DB-root .ERP-btn.primary {
  box-shadow: 0 3px 10px rgba(59,130,246,0.28) !important;
}
.DB-root .ERP-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59,130,246,0.40) !important;
}
.DB-root .ERP-btn.secondary:hover:not(:disabled) { transform: translateY(-2px); }
.DB-root .ERP-btn .ERP-spinner { width: 11px; height: 11px; }
@media(max-width:520px){
  .DB-root .ERP-btn { flex: 1 1 auto; justify-content: center; }
}

/* ══════════════════════════════════════════════════
   PAGE-WIDE RUNNING LOADER — no confined skeleton box
   ══════════════════════════════════════════════════ */
.DB-rc-list-loading { padding: 6px 0 10px; }

/* Page-open intro (the run-then-fall animation) now lives in the shared
   PageOpenIntro component + ERPTheme.ts's .DBI-* classes — see
   components/PageOpenIntro.tsx for why it's measured via
   getBoundingClientRect() + position:fixed rather than CSS-only. */
`;

export default function Daybook({ onNavigate }: { onNavigate?: (navId: string) => void } = {}) {
    const [userRole] = useState<string>(() => getStoredRole());
    const [form, setForm] = useState<FormData>(EMPTY_FORM());
    const [editId, setEditId] = useState<number | null>(null);
    const [_masterSeed] = useState<MasterData | null>(loadMaster);
    const [categories, setCategories] = useState<Category[]>(() => memCache.get('master:categories') || _masterSeed?.categories || []);
    const [subCategories, setSubCats] = useState<SubCategory[]>(() => memCache.get('master:sub-categories') || _masterSeed?.subCategories || []);
    const [bioData, setBioData] = useState<BioData[]>(() => memCache.get('master:bio-data') || _masterSeed?.bioData || []);
    const [subNames, setSubNames] = useState<SubName[]>(() => memCache.get('master:sub-names') || _masterSeed?.subNames || []);
    const [filteredSub, setFilteredSub] = useState<SubCategory[]>([]);
    const [filteredBio, setFilteredBio] = useState<BioData[]>([]);
    const [filteredSN, setFilteredSN] = useState<SubName[]>([]);
    const [entries, setEntries] = useState<DaybookEntry[]>(() => {
        const cached = memCache.get('daybook?date=' + todayDate());
        return cached?.entries?.data || cached?.entries || [];
    });

    const [stats, setStats] = useState<Stats>({ income: 0, expense: 0, balance: 0 });
    const [allEntries, setAllEntries] = useState<DaybookEntry[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStats>({
        totalCredit: 0, totalDebit: 0, netBalance: 0, totalEntries: 0,
        creditByMode: [], debitByMode: [],
        debitCash: 0, debitBank: 0,
        cashHolding: 0, bankHolding: 0,
    });

    const [viewDate, setViewDate] = useState(todayDate());
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(() => entries.length === 0);
    const [undoToast, setUndoToast] = useState<{ visible: boolean; id: number; label: string; timer: ReturnType<typeof setTimeout> | null }>({ visible: false, id: 0, label: '', timer: null });
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingPayload: ReturnType<typeof buildPayload> | null }>({ open: false, fields: [], pendingPayload: null });
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; entry: DaybookEntry | null }>({ open: false, entry: null });
    const undoRef = useRef<DaybookEntry | null>(null);
    const [cameFromTransactions, setCameFromTransactions] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const erpPageRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(erpPageRef);
    const [errorField, setErrorField] = useState<string | null>(null);
    const categoryFieldRef = useRef<HTMLDivElement>(null);
    const clientFieldRef = useRef<HTMLDivElement>(null);
    const bioFieldRef = useRef<HTMLDivElement>(null);
    const amountFieldRef = useRef<HTMLDivElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);
    const [newEntryId, setNewEntryId] = useState<number | null>(null);
    const prevFirstIdRef = useRef<number | null>(null);
    const selectedCategory = categories.find(c => c.id === +form.category_id);
    const categoryType = selectedCategory?.type || null;
    useEffect(() => { setStats(computeStats(entries, categories)); }, [entries, categories]);
    useEffect(() => {
        setOverallStats(computeOverallStats(allEntries, categories));
    }, [allEntries, categories]);
    // Defensive: allEntries can momentarily hold a non-array value if an
    // API response ever comes back malformed (see loaders below) -- spreading
    // a non-array here used to crash the whole page ("X is not iterable").
    const recentEntries = (Array.isArray(allEntries) ? [...allEntries] : []).sort((a, b) => b.id - a.id).slice(0, 15);
    const recentEntryKey = recentEntries.map(e => e.id).join(',');

    useEffect(() => {
        if (recentEntries.length === 0) return;
        const firstId = recentEntries[0].id;
        if (prevFirstIdRef.current !== null && firstId !== prevFirstIdRef.current) {
            setNewEntryId(firstId);
            const t = setTimeout(() => setNewEntryId(null), 950);
            prevFirstIdRef.current = firstId;
            return () => clearTimeout(t);
        }
        prevFirstIdRef.current = firstId;
    }, [recentEntryKey]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosInstance.get('master-data', { headers: authHeader() });
                const cats = data.categories || [];
                const subs = data.sub_categories || [];
                const bios = data.bio_data || [];
                const sns = data.sub_names || [];
                setCategories(cats); memCache.set('master:categories', cats);
                setSubCats(subs); memCache.set('master:sub-categories', subs);
                setBioData(bios); memCache.set('master:bio-data', bios);
                setSubNames(sns); memCache.set('master:sub-names', sns);
                saveMaster({ categories: cats, subCategories: subs, bioData: bios, subNames: sns });

                const urlParams = new URLSearchParams(window.location.search);
                const editParam = urlParams.get('edit');
                if (editParam) {
                    const editIdNum = parseInt(editParam, 10);
                    if (!isNaN(editIdNum)) {
                        const stored = sessionStorage.getItem('daybook_edit_entry');
                        if (stored) {
                            try {
                                const entry: DaybookEntry = JSON.parse(stored);
                                sessionStorage.removeItem('daybook_edit_entry');
                                setViewDate(entry.transaction_date);
                                _triggerEdit(entry, subs, bios, sns);
                                setCameFromTransactions(true);
                            } catch {
                                await _fetchAndEdit(editIdNum, subs, bios, sns);
                                setCameFromTransactions(true);
                            }
                        } else {
                            await _fetchAndEdit(editIdNum, subs, bios, sns);
                            setCameFromTransactions(true);
                        }
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                }
            } catch (e) { console.error('Master data load failed', e); }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const cached = memCache.get('daybook:all');
                if (Array.isArray(cached)) {
                    setAllEntries(cached);
                    return;
                }
                const { data } = await axiosInstance.get('daybook/all', { headers: authHeader() });
                const rawList = data?.entries?.data ?? data?.entries ?? data;
                const list: DaybookEntry[] = Array.isArray(rawList) ? rawList : [];
                setAllEntries(list);
                memCache.set('daybook:all', list, 2 * 60 * 1000); // 2-min TTL
            } catch (e) {
                console.warn('Could not load all entries for overall stats', e);
            }
        })();
    }, []);

    const _fetchAndEdit = async (id: number, subs: SubCategory[], bios: BioData[], sns: SubName[]) => {
        try {
            const { data } = await axiosInstance.get(`/api/daybook/${id}`, { headers: authHeader() });
            const entry: DaybookEntry = data.entry || data;
            _triggerEdit(entry, subs, bios, sns);
        } catch { console.warn(`Could not fetch entry #${id} directly.`); }
    };

    const _triggerEdit = (entry: DaybookEntry, subs: SubCategory[], bios: BioData[], sns: SubName[]) => {
        const pm = PAYMENT_METHODS.find(p => p.id === entry.payment_mode)?.id || 'Cash';
        const fSub = subs.filter(s => s.category_ids?.length ? s.category_ids.includes(entry.category_id) : s.category_id === entry.category_id);
        let fBio = bios.filter(b => !b.category_id || b.category_id === entry.category_id);
        fBio = fBio.length > 0 ? fBio : bios;
        if (entry.sub_category_id) {
            const bySub = fBio.filter(b => b.sub_category_id === entry.sub_category_id || b.id === entry.bio_data_id);
            if (bySub.length > 0) fBio = bySub;
        }
        const fSN = sns.filter(s => s.bio_data_id === entry.bio_data_id);
        setFilteredSub(fSub.length > 0 ? fSub : subs);
        setFilteredBio(fBio);
        setFilteredSN(fSN);
        setForm({
            transaction_date: entry.transaction_date,
            amount: String(entry.amount),
            payment_mode: pm,
            category_id: String(entry.category_id),
            sub_category_id: entry.sub_category_id ? String(entry.sub_category_id) : '',
            bio_data_id: String(entry.bio_data_id),
            sub_name_id: entry.sub_name_id ? String(entry.sub_name_id) : '',
            client_name: entry.client_name || '',
            narration: entry.narration || '',
        });
        setEditId(entry.id);
        setTimeout(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
    };

    useEffect(() => {
        if (form.category_id) {
            const catId = +form.category_id;
            setFilteredSub(subCategories.filter(s => s.category_ids?.length ? s.category_ids.includes(catId) : s.category_id === catId));

            let bios = bioData.filter(b => !b.category_id || b.category_id === catId);
            bios = bios.length > 0 ? bios : bioData;

            // Narrow further to the chosen Sub Category — a Labour category with
            // Carpenter/Electrician sub-categories should only offer party names
            // that actually belong to the sub-category picked, not every labour name.
            if (form.sub_category_id) {
                const subId = +form.sub_category_id;
                bios = bios.filter(b => b.sub_category_id === subId);
            }

            setFilteredBio(bios);
        } else { setFilteredSub([]); setFilteredBio([]); }
    }, [form.category_id, form.sub_category_id, subCategories, bioData]);

    useEffect(() => {
        if (form.bio_data_id) setFilteredSN(subNames.filter(s => s.bio_data_id === +form.bio_data_id));
        else setFilteredSN([]);
    }, [form.bio_data_id, subNames]);
    const autoJumpDone = useRef(false);

    const loadEntries = async (date: string, isAutoJump = false) => {
        const cached = memCache.get('daybook?date=' + date);
        if (cached) {
            const cachedList: DaybookEntry[] = cached?.entries?.data || cached?.entries || cached || [];
            setEntries(cachedList);
        }
        if (!cached) setFetching(true);
        try {
            const { data } = await axiosInstance.get('daybook', { headers: authHeader(), params: { date } });
            const list: DaybookEntry[] = data.entries?.data || data.entries || [];
            if (list.length === 0 && !autoJumpDone.current && isAutoJump) {
                autoJumpDone.current = true;
                try {
                    const allCached = memCache.get('daybook:all');
                    const allList: DaybookEntry[] = Array.isArray(allCached) ? allCached : [];
                    if (allList.length > 0) {
                        const lastDate = allList[0].transaction_date;
                        if (lastDate && lastDate !== date) {
                            setViewDate(lastDate);
                            setForm(p => ({ ...p, transaction_date: lastDate }));
                            return;
                        }
                    } else {
                        const { data: allData } = await axiosInstance.get('daybook/all', { headers: authHeader() });
                        const fetchedAll: DaybookEntry[] = Array.isArray(allData?.entries) ? allData.entries : [];
                        memCache.set('daybook:all', fetchedAll, 2 * 60 * 1000);
                        if (fetchedAll.length > 0) {
                            const lastDate = fetchedAll[0].transaction_date;
                            if (lastDate && lastDate !== date) {
                                setViewDate(lastDate);
                                setForm(p => ({ ...p, transaction_date: lastDate }));
                                return;
                            }
                        }
                    }
                } catch { }
            }
            setEntries(list);
            memCache.set('daybook?date=' + date, { entries: list });
        } catch (e) { console.error(e); }
        finally { setFetching(false); }
    };

    const isFirstLoad = useRef(true);
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            loadEntries(viewDate, true);
        } else {
            loadEntries(viewDate, false);
        }
    }, [viewDate]);

    const setF = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(p => ({ ...p, [k]: v }));

    const handleEdit = (entry: DaybookEntry) => { _triggerEdit(entry, subCategories, bioData, subNames); };
    const handleDelete = (entry: DaybookEntry) => {
        undoRef.current = entry;
        setEntries(prev => prev.filter(e => e.id !== entry.id));
        setAllEntries(prev => prev.filter(e => e.id !== entry.id));
        setUndoToast(prev => { if (prev.timer) clearTimeout(prev.timer); return prev; });
        const timer = setTimeout(() => _commitDelete(entry.id), 6000);
        setUndoToast({ visible: true, id: entry.id, label: entry.bio_data_name || `Entry #${entry.id}`, timer });
    };

    const _commitDelete = async (id: number) => {
        setUndoToast({ visible: false, id: 0, label: '', timer: null });
        undoRef.current = null;
        try {
            await axiosInstance.delete(`/api/daybook/${id}`, { headers: authHeader() });
            setTimeout(() => loadEntries(viewDate), 300);
            setTimeout(async () => {
                try {
                    const { data } = await axiosInstance.get('daybook/all', { headers: authHeader() });
                    const _rawList = data?.entries?.data ?? data?.entries ?? data;
                    const list: DaybookEntry[] = Array.isArray(_rawList) ? _rawList : [];
                    setAllEntries(list);
                    memCache.set('daybook:all', list, 2 * 60 * 1000);
                } catch { }
            }, 600);
        } catch {
            setMsg('Delete failed — entry restored.');
            toast.error('Delete Failed', 'Entry has been restored');
            if (undoRef.current) setEntries(prev => [undoRef.current!, ...prev]);
            if (undoRef.current) setAllEntries(prev => [undoRef.current!, ...prev]);
        }
    };

    const handleUndoDelete = () => {
        setUndoToast(prev => { if (prev.timer) clearTimeout(prev.timer); return { visible: false, id: 0, label: '', timer: null }; });
        if (undoRef.current) {
            setEntries(prev => {
                const exists = prev.find(e => e.id === undoRef.current!.id);
                if (exists) return prev;
                return [undoRef.current!, ...prev].sort((a, b) =>
                    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime() || b.id - a.id
                );
            });
            setAllEntries(prev => {
                const exists = prev.find(e => e.id === undoRef.current!.id);
                if (exists) return prev;
                return [undoRef.current!, ...prev];
            });
            undoRef.current = null;
        }
    };

    const handleReset = () => {
        setForm({ ...EMPTY_FORM(), transaction_date: viewDate });
        setEditId(null); setMsg(''); setCameFromTransactions(false);
    };

    const buildPayload = () => ({
        transaction_date: form.transaction_date,
        amount: parseFloat(form.amount) || 0,
        payment_mode: form.payment_mode,
        category_id: +form.category_id,
        sub_category_id: form.sub_category_id ? +form.sub_category_id : null,
        bio_data_id: form.bio_data_id ? +form.bio_data_id : null,
        sub_name_id: form.sub_name_id ? +form.sub_name_id : null,
        client_name: form.client_name.trim() || null,
        narration: form.narration || null,
    });

    const doSaveEntry = async (payload: ReturnType<typeof buildPayload>) => {
        setLoading(true); setMsg('');
        try {
            if (editId) {
                const { data } = await axiosInstance.put(`/api/daybook/${editId}`, payload, { headers: authHeader() });
                const updated: DaybookEntry = data.entry || { ...payload, id: editId, category_name: categories.find(c => c.id === payload.category_id)?.name || '', category_type: categories.find(c => c.id === payload.category_id)?.type, sub_category_name: subCategories.find(s => s.id === payload.sub_category_id)?.name || null, bio_data_name: bioData.find(b => b.id === payload.bio_data_id)?.name || '', sub_name_name: subNames.find(s => s.id === payload.sub_name_id)?.alternate_name || null };
                setEntries(prev => prev.map(e => e.id === editId ? updated : e));
                setAllEntries(prev => prev.map(e => e.id === editId ? updated : e));
                if (data.stats) setStats(data.stats);
                setMsg('Entry updated successfully!');
                toast.success('Entry Updated!', 'Cash Book entry saved successfully');
            } else {
                const { data } = await axiosInstance.post('daybook', payload, { headers: authHeader() });
                const created: DaybookEntry = data.entry || { ...payload, id: Date.now(), category_name: categories.find(c => c.id === payload.category_id)?.name || '', category_type: categories.find(c => c.id === payload.category_id)?.type, sub_category_name: subCategories.find(s => s.id === payload.sub_category_id)?.name || null, bio_data_name: bioData.find(b => b.id === payload.bio_data_id)?.name || '', sub_name_name: subNames.find(s => s.id === payload.sub_name_id)?.alternate_name || null };
                setEntries(prev => [created, ...prev]);
                setAllEntries(prev => [created, ...prev]);
                if (data.stats) setStats(data.stats);
                setMsg('Entry saved successfully!');
                toast.success('Entry Saved!', 'New daybook entry recorded successfully');
            }

            handleReset();
            memCache.delete?.('daybook?date=' + form.transaction_date);
            setTimeout(() => loadEntries(viewDate), 800);
            setTimeout(async () => {
                try {
                    const { data } = await axiosInstance.get('daybook/all', { headers: authHeader() });
                    const _rawList = data?.entries?.data ?? data?.entries ?? data;
                    const list: DaybookEntry[] = Array.isArray(_rawList) ? _rawList : [];
                    setAllEntries(list);
                    memCache.set('daybook:all', list, 2 * 60 * 1000);
                } catch { }
            }, 1200);
        } catch (e: any) {
            const errMsg = e.response?.data?.message || 'Save failed. Please try again.';
            setMsg(errMsg);
            toast.error(editId ? 'Update Failed' : 'Save Failed', errMsg);
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.category_id) {
            setErrorField('category_id');
            toast.error('Account Head is required', 'Please fill out this field to continue');
            categoryFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!form.client_name.trim()) {
            setErrorField('client_name');
            toast.error('Client Name is required', 'Please fill out this field to continue');
            clientFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!form.bio_data_id) {
            setErrorField('bio_data_id');
            toast.error('Party Name is required', 'Please fill out this field to continue');
            bioFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!form.amount || parseFloat(form.amount) <= 0) {
            setErrorField('amount');
            toast.error('Amount is required', 'Please fill out this field to continue');
            amountFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            amountInputRef.current?.focus();
            return;
        }

        if (!editId) {
            const amt = parseFloat(form.amount) || 0;
            const dup = entries.find(en =>
                en.transaction_date === form.transaction_date &&
                Math.abs((en.amount ?? 0) - amt) < 0.001 &&
                String(en.category_id) === String(form.category_id) &&
                String(en.bio_data_id) === String(form.bio_data_id)
            );

            if (dup) {
                const catName = categories.find(c => c.id === dup.category_id)?.name || String(dup.category_id);
                const bioName = bioData.find(b => b.id === dup.bio_data_id)?.name || String(dup.bio_data_id);
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Date', value: dup.transaction_date },
                        { label: 'Amount', value: String(dup.amount) },
                        { label: 'Account Head', value: catName },
                        { label: 'Party', value: bioName },
                    ],
                    pendingPayload: buildPayload(),
                });
                return;
            }
        }

        await doSaveEntry(buildPayload());
    };

    const handleDupConfirm = async () => {
        if (dupModal.pendingPayload) {
            const payload = dupModal.pendingPayload;
            setDupModal(d => ({ ...d, open: false }));
            await doSaveEntry(payload);
        }
    };

    const getEntryType = (entry: DaybookEntry): 'income' | 'expense' => {
        if (entry.category_type) return entry.category_type;
        const cat = categories.find(c => c.id === entry.category_id);
        return cat?.type ?? 'expense';
    };

    const allClientNames = Array.from(new Set(bioData.map(b => b.name).filter(Boolean)));
    const incomeCatIds = new Set(categories.filter(c => c.type === 'income').map(c => c.id));
    const incomeBioClientOptions = Array.from(
        new Map(
            bioData
                .filter(b => !!b.category_id && incomeCatIds.has(b.category_id))
                .map(b => [b.name, b])
        ).values()
    ).map(b => ({ value: b.name, label: b.name }));

    const categoryOptions = categories.map(c => ({
        value: String(c.id), label: c.name,
        badge: c.type === 'income' ? 'CR' : 'DR',
        badgeColor: c.type === 'income' ? '#1E9C6A' : '#D93B55',
    }));

    const subCatOptions = filteredSub.map(s => ({ value: String(s.id), label: s.name }));
    const bioOptions = filteredBio.map(b => ({ value: String(b.id), label: b.name }));
    const subNameOptions = filteredSN.map(s => ({ value: String(s.id), label: s.alternate_name }));

    return (
        <>
            <div className="ERP-page" ref={erpPageRef}>
                <style>{ERP_CSS}{PAGE_CSS}</style>

                <PageOpenIntro containerRef={erpPageRef} label="Opening Cash Book…" />

                {/* ── HEADER  START ── */}
                <div className="ERP-hdr">

                    {/* ERP Hdr Left Start */}
                    <div className="ERP-hdr-left">
                        {/* Financial Ledger Start */}
                        <div className="ERP-eyebrow">
                            <span className="ERP-eyebrow-line" />
                            <span className="ERP-eyebrow-dot" />
                            Transaction · Financial Ledger
                        </div>
                        {/* Financial Ledger End */}

                        {/* Record Daily Transactions Start */}
                        <div className="ERP-title MD-page-title">Day<span className="ERP-title-em">book</span></div>
                        {/* Record Transactions Start */}
                        {/* Record Transactions End */}

                    </div>
                    {/* ERP Hdr Left End */}

                </div>
                {/* ── HEADER END ── */}

                <div className="ERP-divider" />

                {/* ── STAT CARDS START ── */}
                <div className="ERP-stats">

                    {/* TOTAL CREDIT START */}
                    <div className="ERP-stat">
                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--success),#34D399)' }} />
                        <div className="ERP-stat-label">Total Credit</div>
                        <div className="ERP-stat-val" style={{ color: 'var(--success)', fontSize: 16, fontWeight: 800 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                            <AnimCount value={overallStats.totalCredit} />
                        </div>
                    </div>
                    {/* TOTAL CREDIT END  */}

                    {/* TOTAL DEBIT START — plus a Cash/Bank breakdown of that
                       same total: debitCash + debitBank always == totalDebit. */}
                    <div className="ERP-stat">
                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--error),#F87171)' }} />
                        <div className="ERP-stat-label">Total Debit</div>
                        <div className="ERP-stat-val" style={{ color: 'var(--error)', fontSize: 16, fontWeight: 800 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                            <AnimCount value={overallStats.totalDebit} />
                        </div>
                        <div className="DB-stat-breakdown">
                            <div className="DB-stat-chip cash">
                                <span className="DB-stat-chip-icon"><Icon name="cash" size={8} color="#1E9C6A" /></span>
                                <span className="DB-stat-chip-text">
                                    <span className="DB-stat-chip-label">Cash Holding</span>
                                    <span className="DB-stat-chip-val">₹<AnimCount value={overallStats.debitCash} /></span>
                                </span>
                            </div>
                            <div className="DB-stat-chip bank">
                                <span className="DB-stat-chip-icon"><Icon name="bank" size={8} color="#A6491D" /></span>
                                <span className="DB-stat-chip-text">
                                    <span className="DB-stat-chip-label">Bank Holding</span>
                                    <span className="DB-stat-chip-val">₹<AnimCount value={overallStats.debitBank} /></span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* TOTAL DEBIT END */}

                    {/* NET BALANCE START — plus a Cash/Bank breakdown of that
                       same net figure: cashHolding + bankHolding always ==
                       netBalance. */}
                    <div className="ERP-stat">
                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--info),#F0834D)' }} />
                        <div className="ERP-stat-label">Net Balance</div>
                        <div className="ERP-stat-val" style={{ color: overallStats.netBalance >= 0 ? 'var(--success)' : 'var(--error)', fontSize: 16, fontWeight: 800 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-4)', verticalAlign: 'super', marginRight: 2 }}>₹</span>
                            <AnimCount value={Math.abs(overallStats.netBalance)} />
                        </div>
                        <div className="DB-stat-breakdown">
                            <div className="DB-stat-chip cash">
                                <span className="DB-stat-chip-icon"><Icon name="cash" size={8} color="#1E9C6A" /></span>
                                <span className="DB-stat-chip-text">
                                    <span className="DB-stat-chip-label">Cash Holding</span>
                                    <span className="DB-stat-chip-val" style={{ color: overallStats.cashHolding < 0 ? 'var(--error)' : 'var(--text-1)' }}>
                                        {overallStats.cashHolding < 0 ? '-' : ''}₹<AnimCount value={Math.abs(overallStats.cashHolding)} />
                                    </span>
                                </span>
                            </div>
                            <div className="DB-stat-chip bank">
                                <span className="DB-stat-chip-icon"><Icon name="bank" size={8} color="#A6491D" /></span>
                                <span className="DB-stat-chip-text">
                                    <span className="DB-stat-chip-label">Bank Holding</span>
                                    <span className="DB-stat-chip-val" style={{ color: overallStats.bankHolding < 0 ? 'var(--error)' : 'var(--text-1)' }}>
                                        {overallStats.bankHolding < 0 ? '-' : ''}₹<AnimCount value={Math.abs(overallStats.bankHolding)} />
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* NET BALANCE END */}
                </div>
                {/* ── STAT CARDS END  ── */}

                {/* ── MAIN GRID START ── */}
                <div className="DB-root" ref={formRef}>

                    {/* ── LEFT: FORM ── */}
                    <div className="ERP-form-card" style={{ position: 'relative', overflow: 'visible' }}>
                        <div className="ERP-form-topbar" />
                        <div className="DB-watermark">₹</div>
                        <div className="ERP-form-body">

                            {/* Form header Start */}
                            <div className="ERP-form-hdr">
                                <div className="ERP-form-icon-wrap">
                                    <Icon name="ledger" size={22} color="var(--ember)" />
                                </div>
                                <div>
                                    <div className="ERP-form-title MD-form-title">{editId ? 'Edit Entry' : 'New Entry'}</div>
                                    <div className="ERP-form-desc">
                                        {editId ? `Updating transaction #${editId}` : 'Account Head type auto-determines Credit / Debit'}
                                    </div>
                                </div>
                                {editId && (
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span className="ERP-badge id-pill">#{editId}</span>
                                    </div>
                                )}
                            </div>
                            {/* Form Header End */}

                            {cameFromTransactions && (
                                <div className="DB-back-banner">
                                    <div className="DB-back-lhs">
                                        <Icon name="back" size={14} color="currentColor" />
                                        Editing entry from Transactions — save or cancel to return
                                    </div>
                                    <button className="DB-back-btn" onClick={() => window.location.href = '/daybook-transactions'}>
                                        <Icon name="back" size={11} color="currentColor" />
                                        Back to Transactions
                                    </button>
                                </div>
                            )}

                            {editId && (
                                <div className="DB-edit-banner">
                                    <div className="DB-edit-lhs">
                                        <Icon name="edit" size={13} color="var(--warn)" />
                                        Editing Entry #{editId} — Changes will overwrite existing record
                                    </div>
                                    <button className="DB-edit-cancel" onClick={handleReset}>
                                        <Icon name="x" size={10} color="currentColor" /> Cancel
                                    </button>
                                </div>
                            )}

                            {/* FORM START */}
                            <form onSubmit={handleSubmit} noValidate>

                                {/* Transaction Date Start */}
                                <div className="DB-sec">
                                    <span className="DB-sec-num">01</span>
                                    <span className="DB-sec-label">Transaction Date</span>
                                    <div className="DB-sec-rule" />
                                </div>
                                {/* Transaction Date End */}

                                {/* Date Start */}
                                <div className="DB-date-field">
                                    <CalendarDD
                                        value={form.transaction_date}
                                        onChange={v => {
                                            setF('transaction_date', v);
                                            setViewDate(v);
                                        }} />
                                </div>
                                {/* Date End */}

                                {/* Category Start */}
                                <div className="DB-sec">
                                    <span className="DB-sec-num">02</span>
                                    <span className="DB-sec-label">Account Head &amp; Party</span>
                                    <div className="DB-sec-rule" />
                                    {categoryType && (
                                        <div className={`DB-cat-pill ${categoryType}`}>
                                            <span className="DB-cat-dot" />
                                            {categoryType === 'income' ? 'Credit Entry' : 'Debit Entry'}
                                        </div>
                                    )}
                                </div>
                                {/* Category End */}

                                {/* Sub-Category Start */}
                                <div className="DB-dd-grid">

                                    {/* Category Start */}
                                    <div className={'DB-dd-full' + (errorField === 'category_id' ? ' DB-field-error' : '')} ref={categoryFieldRef}>
                                        <SearchDD label="Account Head" required
                                            options={categoryOptions} value={form.category_id}
                                            onChange={v => {
                                                setForm(p => ({ ...p, category_id: v, sub_category_id: '', bio_data_id: '', sub_name_id: '' }));
                                                if (errorField === 'category_id') setErrorField(null);
                                            }}
                                            placeholder="Select Account Head…" emptyMsg="No account heads available" />
                                        {errorField === 'category_id' && (
                                            <div className="DB-field-error-msg">
                                                <Icon name="warning" size={11} color="currentColor" />
                                                Please fill out this field
                                            </div>
                                        )}
                                    </div>
                                    {/* Category End */}

                                    {/* Client Name Start */}
                                    <div className={'DB-dd-full' + (errorField === 'client_name' ? ' DB-field-error' : '')} ref={clientFieldRef}>
                                        <SearchDD
                                            label="Client Name"
                                            required
                                            options={incomeBioClientOptions}
                                            value={form.client_name}
                                            onChange={v => { setF('client_name', v); if (errorField === 'client_name') setErrorField(null); }}
                                            placeholder="Search income bio name…"
                                            emptyMsg="No income-based names found"
                                        />
                                        {errorField === 'client_name' && (
                                            <div className="DB-field-error-msg">
                                                <Icon name="warning" size={11} color="currentColor" />
                                                Please fill out this field
                                            </div>
                                        )}
                                    </div>
                                    {/* Client Name End */}

                                    {/* Sub Category Start */}
                                    <SearchDD label="Account Sub-Head"
                                        options={subCatOptions} value={form.sub_category_id}
                                        onChange={v => setForm(p => ({ ...p, sub_category_id: v, bio_data_id: '', sub_name_id: '' }))}
                                        placeholder={!form.category_id ? 'Select Account Head first' : 'Select Account Sub-Head…'}
                                        disabled={!form.category_id}
                                        emptyMsg="No sub-categories for selected category" />
                                    {/* Search Sub Category End */}

                                    {/* Party Master Start */}
                                    <div className={errorField === 'bio_data_id' ? 'DB-field-error' : ''} ref={bioFieldRef}>
                                        <SearchDD label="Party Name" required
                                            options={bioOptions} value={form.bio_data_id}
                                            onChange={v => { setF('bio_data_id', v); if (errorField === 'bio_data_id') setErrorField(null); }}
                                            placeholder={!form.category_id ? 'Select Account Head first' : 'Search Party Name…'}
                                            disabled={!form.category_id}
                                            emptyMsg={form.sub_category_id ? "No parties found for selected sub-category" : "No parties found for selected category"} />
                                        {errorField === 'bio_data_id' && (
                                            <div className="DB-field-error-msg">
                                                <Icon name="warning" size={11} color="currentColor" />
                                                Please fill out this field
                                            </div>
                                        )}
                                    </div>
                                    {/* Party Master End */}

                                    {/* Associate Name Start */}
                                    <SearchDD label="Associate Name"
                                        options={subNameOptions} value={form.sub_name_id}
                                        onChange={v => setF('sub_name_id', v)}
                                        placeholder={!form.bio_data_id ? 'Select Party first' : 'Select Associate Name…'}
                                        disabled={!form.bio_data_id}
                                        emptyMsg="No sub-names for selected party" />
                                    {/* Associate Name End */}
                                </div>
                                {/* Sub-Category End */}

                                {/* Payment Method Start */}
                                <div className="DB-sec">
                                    <span className="DB-sec-num">03</span>
                                    <span className="DB-sec-label">Payment Method</span>
                                    <div className="DB-sec-rule" />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ember)', letterSpacing: 1, fontWeight: 800 }}>
                                        {form.payment_mode}
                                    </span>
                                </div>
                                {/* Payment Method End */}

                                {/* Payment Method Start */}
                                <div className="DB-pay-grid">
                                    {PAYMENT_METHODS.map(pm => {
                                        const isSel = form.payment_mode === pm.id;
                                        return (
                                            <button key={pm.id} type="button"
                                                className={`DB-pay-card${isSel ? ' sel' : ''}`}
                                                style={{
                                                    borderColor: isSel ? pm.color : 'var(--border)',
                                                    background: isSel ? pm.bg : 'var(--white)',
                                                    boxShadow: isSel ? `0 6px 20px ${pm.color}33` : 'var(--sh-card)',
                                                }}
                                                onClick={() => setF('payment_mode', pm.id)}>
                                                <div className="DB-pay-check">
                                                    <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke={pm.color} strokeWidth={3.5}>
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div className="DB-pay-icon" style={{ background: isSel ? pm.color : pm.bg }}>
                                                    <Icon name={pm.icon} size={17} color={isSel ? '#faf9f7' : pm.color} />
                                                </div>
                                                <span className="DB-pay-label" style={{ color: isSel ? pm.color : 'var(--text-4)' }}>
                                                    {pm.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Payment Method End */}

                                {/* Amount and Remarks Start */}
                                <div className="DB-sec">
                                    <span className="DB-sec-num">04</span>
                                    <span className="DB-sec-label">Amount &amp; Remarks</span>
                                    <div className="DB-sec-rule" />
                                </div>
                                {/* Amount and Remarks End */}

                                {/* Amount and Remarks Start */}
                                <div style={{ marginBottom: 13 }} ref={amountFieldRef}>
                                    <label className="ERP-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        Amount <span style={{ color: 'var(--error)', fontSize: 9.5 }}>*</span>
                                    </label>
                                    {/* Debited Amount Start */}
                                    <div className={'DB-amount-wrap' + (errorField === 'amount' ? ' DB-field-error' : '')}>
                                        <span className="DB-amount-prefix">₹</span>
                                        <input autoComplete="off" ref={amountInputRef} type="number" step="0.01" min="0" className="DB-amount-input"
                                            value={form.amount}
                                            onChange={e => { setF('amount', e.target.value); if (errorField === 'amount') setErrorField(null); }}
                                            placeholder="0.00" />
                                        {/* Income or Expense Start */}
                                        <div className={`DB-amount-badge ${categoryType || 'none'}`}>
                                            <Icon name={categoryType === 'income' ? 'credit' : categoryType === 'expense' ? 'debit' : 'scale'} size={13} color="currentColor" />
                                            <span className="DB-amount-badge-lbl">
                                                {categoryType === 'income' ? 'Credit' : categoryType === 'expense' ? 'Debit' : '—'}
                                            </span>
                                        </div>
                                        {/* Income or Expense End */}
                                    </div>
                                    {/* Debited Amount End */}
                                    {errorField === 'amount' && (
                                        <div className="DB-field-error-msg">
                                            <Icon name="warning" size={11} color="currentColor" />
                                            Please fill out this field
                                        </div>
                                    )}
                                </div>
                                {/* Amount and Remarks End */}

                                {/* Narration Start */}
                                <div style={{ marginBottom: 4 }}>
                                    <label className="ERP-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        Narration <span className="ERP-label-opt">optional</span>
                                    </label>
                                    <div className="DB-narration-wrap">
                                        <textarea autoComplete="off" className="DB-narration"
                                            placeholder="Add a note or remark about this transaction…"
                                            value={form.narration}
                                            onChange={e => setF('narration', e.target.value)}
                                            rows={2} />
                                    </div>
                                </div>
                                {/* Narration End */}

                                {/* Action Button Start */}
                                <div className="ERP-btn-row">
                                    {/* Saving Button Start */}
                                    <button type="submit" className="ERP-btn primary" disabled={loading}>
                                        {loading
                                            ? <><span className="ERP-spinner" /> Saving…</>
                                            : <><Icon name="check" size={11} color="currentColor" />{editId ? 'Update Entry' : 'Save Entry'}</>}
                                    </button>
                                    {/* Saving Button End */}

                                    {/* Clear Form Button Start */}
                                    <button type="button" className="ERP-btn secondary" onClick={handleReset} disabled={loading}>
                                        <Icon name="x" size={11} color="currentColor" /> Clear Form
                                    </button>
                                    {/* Clear Form Button End */}
                                </div>
                                {/* Action Button End */}

                            </form>
                            {/* FORM END */}

                        </div>
                    </div>
                    {/* ── LEFT: FORM ── */}

                    {/* ── RIGHT: ENTRIES PANEL ── */}
                    <div className="DB-panel">
                        <div className="DB-panel-accent" />

                        {/* Recent Entries Start — attractive integrated header:
                            title + live record count on the left, Credit/Debit
                            totals as compact inline pills on the right (no more
                            separate 'stat card' boxes below). */}
                        <div className="DB-panel-hdr">
                            <div className="DB-panel-hdr-left">
                                <span className="DB-panel-hdr-icon">
                                    <Icon name="list" size={15} color="#faf9f7" />
                                </span>
                                <div>
                                    <div className="DB-panel-title">Recent Entries</div>
                                    <div className="DB-panel-sub">{allEntries.length} Total Records</div>
                                </div>
                            </div>
                            <div className="DB-panel-hdr-right">
                                <span className="DB-panel-pill cr">
                                    <Icon name="arrowUp" size={9} color="currentColor" />₹<AnimCount value={overallStats.totalCredit} />
                                </span>
                                <span className="DB-panel-pill dr">
                                    <Icon name="arrowDown" size={9} color="currentColor" />₹<AnimCount value={overallStats.totalDebit} />
                                </span>
                                <span className="DB-rc-live-dot" title="Live feed" />
                            </div>
                        </div>
                        {/* Recent Entries End */}

                        {/* ── TABULAR RECENT ENTRIES ── */}
                        <div className="DB-rc-list">
                            {fetching ? (
                                <div className="DB-rc-list-loading">
                                    <RunningLoader label="Loading Entries" />
                                </div>
                            ) : recentEntries.length === 0 ? (
                                <div className="DB-empty">
                                    <div className="DB-empty-icon"><Icon name="inbox" size={22} color="var(--ember)" /></div>
                                    <div className="DB-empty-title">No Entries Yet</div>
                                    <div className="DB-empty-sub">Add your first entry using the form</div>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="DB-rc-tbl">
                                        <thead>
                                            <tr>
                                                <th>S.No</th>
                                                <th>Date</th>
                                                <th>Party / Account Head</th>
                                                <th className="DB-rc-th-amt">Amount</th>
                                                <th className="DB-rc-th-act">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentEntries.map((entry, i) => {
                                                const entryType = getEntryType(entry);
                                                const isCredit = entryType === 'income';
                                                const pm = getPaymentMethod(entry.payment_mode);
                                                const isNew = entry.id === newEntryId;
                                                return (
                                                    <tr
                                                        key={entry.id}
                                                        className={`${entryType}${isNew ? ' db-new' : ''}`}
                                                        style={{ animationDelay: isNew ? '0ms' : `${i * 55}ms` }}
                                                    >
                                                        <td className={`DB-rc-td-num ${entryType}`}>{i + 1}</td>
                                                        <td className="DB-rc-td-date">
                                                            {new Date(entry.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                        </td>
                                                        <td className="DB-rc-td-main">
                                                            <div className="DB-rc-td-party">
                                                                {entry.sub_name_name || entry.bio_data_name || '—'}
                                                                {entry.client_name && <span className="DB-rc-client" style={{ marginLeft: 6 }}>{entry.client_name}</span>}
                                                            </div>
                                                            <div className="DB-rc-td-meta">
                                                                <span className="DB-rc-cat">{entry.category_name}</span>
                                                                {entry.sub_category_name && (
                                                                    <span className="DB-rc-sub">· {entry.sub_category_name}</span>
                                                                )}
                                                                <span className="DB-rc-pay" style={{ color: pm.color, borderColor: pm.border, background: pm.bg }}>
                                                                    <Icon name={pm.icon} size={8} color={pm.color} />
                                                                    {entry.payment_mode}
                                                                </span>
                                                                {entry.narration && (
                                                                    <span className="DB-rc-note" title={entry.narration}>
                                                                        "{entry.narration.length > 16 ? entry.narration.slice(0, 16) + '…' : entry.narration}"
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className={`DB-rc-td-amt ${entryType}`}>
                                                            <span className="DB-rc-cur">₹</span>{Number(entry.amount).toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="DB-rc-td-act">
                                                            <button className="DB-ea edit" onClick={() => handleEdit(entry)} title="Edit Entry">
                                                                <Icon name="edit" size={10} color="currentColor" />
                                                            </button>
                                                            {canDelete(userRole) ? (
                                                                <button className="DB-ea del" onClick={() => setDeleteConfirm({ open: true, entry })} title="Delete Entry">
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
                                    </table>
                                </div>
                            )}
                        </div>
                        {/* ── TABULAR RECENT ENTRIES END ── */}

                        {allEntries.length > 15 && (
                            <div style={{ padding: '11px 16px', borderTop: '1px solid var(--border)', textAlign: 'center', flexShrink: 0 }}>
                                <span
                                    onClick={() => { sessionStorage.setItem('daybook_show_recent', '1'); if (onNavigate) onNavigate('txn-history'); }}
                                    style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--ember)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(37,99,235,0.45)', textUnderlineOffset: 3, letterSpacing: 0, transition: 'color 0.15s, text-decoration-color 0.15s' }}
                                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--ember-dark,#9A3412)'; (e.target as HTMLElement).style.textDecorationColor = 'var(--ember-dark,#9A3412)'; }}
                                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--ember)'; (e.target as HTMLElement).style.textDecorationColor = 'rgba(37,99,235,0.45)'; }}
                                >
                                    View all {allEntries.length} transactions →
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: ENTRIES PANEL ── */}

                </div>
                {/* ── MAIN GRID END ── */}
            </div>

            {/* Duplicate Entry Modal Start */}
            <DuplicateWarningModal
                open={dupModal.open}
                entityName="Cash Book Entry"
                duplicateFields={dupModal.fields}
                onAddAnyway={handleDupConfirm}
                onCancel={() => setDupModal({ open: false, fields: [], pendingPayload: null })}
                loading={loading}
            />
            {/* Duplicate Entry Modal End */}

            {/* ── Delete Confirmation Modal — shared component, same as every other page ── */}
            <ConfirmDeleteModal
                open={deleteConfirm.open}
                itemName={deleteConfirm.entry?.bio_data_name}
                onConfirm={() => {
                    const entry = deleteConfirm.entry!;
                    setDeleteConfirm({ open: false, entry: null });
                    toast.warning('Moved to Recycle Bin', `"${entry.bio_data_name}" entry has been deleted`);
                    handleDelete(entry);
                }}
                onCancel={() => setDeleteConfirm({ open: false, entry: null })}
            />
        </>
    );
}