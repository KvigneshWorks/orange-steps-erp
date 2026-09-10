import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { toast as appToast } from '../../services/toast';
import { ERP_CSS } from '../../styles/ERPTheme';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import RunningLoader from '../../components/RunningLoader';
import Pagination from '../../components/Pagination';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../../utils/keyboardNav';
import { getStoredRole, canDelete } from '../../utils/roleAccess';
import CreatorBadge from '../../components/CreatorBadge';

type PayType = 'daily' | 'weekly' | 'monthly';

interface Category { id: number; name: string; type: 'income' | 'expense'; }
interface SubCategory { id: number; name: string; category_id: number; }
interface BioData { id: number; name: string; category_id?: number; sub_category_id?: number; sub_name_id?: number; is_active?: boolean; }
interface SubName { id: number; alternate_name: string; bio_data_id: number; }
interface WSubName { id: number; worker_id: number; sub_name: string; daily_rate?: number | null; is_active?: boolean; }
// rate is a controlled-input string (not a number) so an empty field can mean
// "no saved rate" without fighting NaN — '' = variable/manual pay, otherwise
// the value to auto-fill (and still editable) in Attendance.
interface SubChip { id: number | null; name: string; rate?: string; }

interface Worker {
    id: number; name: string; worker_code: string; trade: string | null;
    site: string; salary_type: PayType; daily_rate: number; monthly_salary: number;
    description: string | null; is_active: boolean;
    category_id?: number; sub_category_id?: number; bio_data_id?: number; sub_name_id?: number;
    deleted_at?: string;
    created_by_name?: string | null;
}

const CIVIL_TRADES = [
    'General Manpower', 'Helper / Unskilled Manpower', 'Mason (Brick Work)', 'Plastering Mason',
    'Tile Layer / Floor Fixer', 'Marble & Granite Fixer', 'Shuttering Carpenter',
    'Door & Window Carpenter', 'Bar Bender', 'Steel Fixer / Reinforcement', 'Welder',
    'Electrician (Wiring)', 'Plumber', 'Painter', 'Waterproofing Worker', 'POP / Gypsum Worker',
    'Glazier / Glass Work', 'JCB Operator', 'Concrete Mixer Operator', 'Tower Crane Operator',
    'Excavator Operator', 'Truck / Dumper Driver', 'Auto Level / Surveyor', 'Foreman',
    'Site Supervisor', 'Safety Officer', 'Store Keeper', 'Watchman / Security',
];

const PAY_TYPES: { id: PayType; label: string; hint: string; path: string; color: string; bg: string; bd: string }[] = [
    { id: 'daily', label: 'Daily', hint: 'Per Shift', path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#2563EB', bg: 'rgba(37,99,235,0.10)', bd: 'rgba(37,99,235,0.28)' },
    { id: 'weekly', label: 'Weekly', hint: '7-Day Cycle', path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#C47E0A', bg: 'rgba(196,126,10,0.10)', bd: 'rgba(196,126,10,0.28)' },
    { id: 'monthly', label: 'Monthly', hint: 'Fixed Salary', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#60A5FA', bg: 'rgba(37,99,235,0.10)', bd: 'rgba(37,99,235,0.28)' },
];

const BLANK = () => ({
    category_id: '', sub_category_id: '', bio_data_id: '', sub_name_id: '', name: '',
    worker_code: '', trade: '', salary_type: 'daily' as PayType,
    daily_rate: 0, monthly_salary: 0, description: '', is_active: true,
});

function Ic({ n, s = 16, c = 'currentColor' }: { n: string; s?: number; c?: string }) {
    const p = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    const d: Record<string, React.ReactNode> = {
        workers: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8L6 7h12z" /><circle cx="12" cy="14" r="2" /></>,
        edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
        trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></>,
        pdf: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 13h6M9 17h4" /></>,
        search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
        power: <><path d="M18.36 6.64a9 9 0 11-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></>,
        check: <polyline points="20 6 9 17 4 12" />,
        x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
        tag: <><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></>,
        user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
        filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
        inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></>,
        chevD: <path d="M5 8l7 7 7-7" />,
        chevU: <path d="M19 16l-7-7-7 7" />,
        tool: <><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></>,
        folder: <><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></>,
        layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
        restore: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" /></>,
        users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
    };
    return <svg {...p}>{d[n]}</svg>;
}

interface SDDOpt { value: string; label: string; sub?: string; badge?: string; badgeColor?: string; }
interface SDDProps {
    label?: string; required?: boolean; optional?: boolean;
    options: SDDOpt[]; value: string; onChange: (v: string) => void;
    placeholder: string; disabled?: boolean; emptyMsg?: string; iconName?: string;
}

function SDD({ label, required, optional, options, value, onChange, placeholder, disabled = false, emptyMsg = 'No options', iconName }: SDDProps) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [q, setQ] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inp = useRef<HTMLInputElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, btnRef);
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()) || (o.sub || '').toLowerCase().includes(q.toLowerCase()));
    const selected = options.find(o => o.value === value);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQ(''); } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    useEffect(() => { if (open && inp.current) setTimeout(() => inp.current?.focus(), 40); }, [open]);
    const pick = (v: string) => { onChange(v); setOpen(false); setQ(''); };
    return (
        <div className="WR-sdd-root" ref={ref} data-disabled={disabled} style={{ marginBottom: 14 }}>
            {label && <label className="WR-label">{label}{required && <span style={{ color: 'var(--error)', fontSize: 9.5, marginLeft: 2 }}>*</span>}{optional && <span style={{ color: 'var(--text-4)', fontSize: 8, fontStyle: 'italic', marginLeft: 4, fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>optional</span>}</label>}

            <button type="button" ref={btnRef} className={'WR-sdd-btn' + (open ? ' open' : '') + (disabled ? ' dis' : '') + (selected ? ' has' : '')} onClick={() => !disabled && setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    {iconName && <span style={{ flexShrink: 0, opacity: 0.55 }}><Ic n={iconName} s={14} c={selected ? 'var(--ember)' : 'var(--text-4)'} /></span>}
                    {selected ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 800, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selected.badge && <span className="WR-sdd-badge" style={{ background: (selected.badgeColor || 'var(--ember)') + '1a', color: selected.badgeColor || 'var(--ember)', borderColor: (selected.badgeColor || 'var(--ember)') + '44' }}>{selected.badge}</span>}
                            {selected.label}
                        </span>
                    ) : <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-4)', fontStyle: 'italic' }}>{placeholder}</span>}
                </span>
                <span className={'WR-sdd-chev' + (open ? ' open' : '')}><Ic n="chevD" s={13} /></span>
            </button>

            {open && (
                <div className="WR-sdd-panel" ref={panelRef}>
                    <div className="WR-sdd-search-row"><Ic n="search" s={13} c="var(--text-4)" /><input ref={inp} className="WR-sdd-search" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />{q && <button className="WR-sdd-clr" type="button" onClick={() => setQ('')}><Ic n="x" s={10} /></button>}</div>
                    <div className="WR-sdd-list">
                        {value && <div className="WR-sdd-item WR-sdd-clear" role="option" tabIndex={-1} aria-selected={false} onClick={() => pick('')}><Ic n="x" s={10} c="var(--text-4)" /><span>Clear selection</span></div>}
                        {filtered.length === 0 ? <div className="WR-sdd-empty"><Ic n="inbox" s={14} c="var(--text-4)" />{q ? `No match for "${q}"` : emptyMsg}</div> : filtered.map(opt => (
                            <div key={opt.value} role="option" tabIndex={-1} aria-selected={value === opt.value} className={'WR-sdd-item' + (value === opt.value ? ' sel' : '')} onClick={() => pick(opt.value)}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                    {opt.badge && <span className="WR-sdd-badge" style={{ background: (opt.badgeColor || 'var(--ember)') + '1a', color: opt.badgeColor || 'var(--ember)', borderColor: (opt.badgeColor || 'var(--ember)') + '44' }}>{opt.badge}</span>}
                                    <span><div>{opt.label}</div>{opt.sub && <div style={{ fontSize: 9, color: 'var(--text-4)', marginTop: 1 }}>{opt.sub}</div>}</span>
                                </span>
                                {value === opt.value && <Ic n="check" s={12} c="var(--ember)" />}
                            </div>
                        ))}
                    </div>
                    <div className="WR-sdd-footer">{filtered.length} / {options.length}</div>
                </div>
            )}

        </div>
    );
}

function SkillCombo({ value, onChange, extraSkills }: { value: string; onChange: (v: string) => void; extraSkills?: string[] }) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [q, setQ] = useState(value);
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useDropdownPanelArrowNav(open, setOpen, panelRef, inputRef, { autoFocusFirst: false });
    const allTrades = React.useMemo(() => { const base = [...CIVIL_TRADES]; (extraSkills || []).forEach(s => { if (s && !base.some(b => b.toLowerCase() === s.toLowerCase())) base.push(s); }); return base.sort((a, b) => a.localeCompare(b)); }, [extraSkills]);
    useEffect(() => { setQ(value); }, [value]);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = q ? allTrades.filter(s => s.toLowerCase().includes(q.toLowerCase())) : allTrades;
    const isCustom = q && !allTrades.some(s => s.toLowerCase() === q.toLowerCase());
    const select = (s: string) => { onChange(s); setQ(s); setOpen(false); };
    const clear = () => { onChange(''); setQ(''); setOpen(false); };
    return (
        <div className="WR-cmb-root" ref={ref}>
            <div className={'WR-cmb-wrap' + (open ? ' open' : '')}>
                <Ic n="tool" s={14} c="var(--ember)" />
                <input ref={inputRef} className="WR-cmb-input" placeholder="Search trade" value={q} onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
                {q && <button className="WR-cmb-clr" type="button" onMouseDown={e => { e.preventDefault(); clear(); }}><Ic n="x" s={12} /></button>}
                <span className={'WR-cmb-chev' + (open ? ' open' : '')}><Ic n="chevD" s={13} /></span>
            </div>
            {open && (
                <div className="WR-cmb-panel" ref={panelRef}>
                    {!q && <div className="WR-cmb-section">Civil Construction Trades</div>}
                    {filtered.map(s => <div key={s} role="option" tabIndex={-1} aria-selected={value === s} className={'WR-cmb-item' + (value === s ? ' active' : '')} onMouseDown={() => select(s)}>{s}</div>)}
                    {isCustom && <div className="WR-cmb-new" role="option" tabIndex={-1} aria-selected={false} onMouseDown={() => select(q)}>+ Add "{q}" as custom trade</div>}
                    {filtered.length === 0 && !isCustom && <div className="WR-cmb-empty">No match — type to create custom</div>}
                </div>
            )}
        </div>
    );
}

function SubNamesManager({ chips, onAdd, onRemove, onRateChange, suggestions }: {
    chips: SubChip[];
    onAdd: (name: string) => void;
    onRemove: (chip: SubChip) => void;
    onRateChange: (chip: SubChip, rate: string) => void;
    suggestions: string[];
}) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const ref = useRef<HTMLDivElement>(null);
    const inpRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useDropdownPanelArrowNav(open, setOpen, panelRef, inpRef, { autoFocusFirst: false });
    const query = q.trim();
    const chipNames = chips.map(c => c.name.toLowerCase());
    const matched = suggestions
        .filter(s => !chipNames.includes(s.toLowerCase()))
        .filter(s => !query || s.toLowerCase().includes(query.toLowerCase()));
    const exact = chipNames.includes(query.toLowerCase()) || matched.some(s => s.toLowerCase() === query.toLowerCase());
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQ(''); } };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const add = (name: string) => {
        const n = name.trim();
        if (!n) { setQ(''); return; }
        if (chipNames.includes(n.toLowerCase())) {
            appToast.error(`"${n}" is already added as an associate name — no need to add it again.`);
            setQ('');
            inpRef.current?.focus();
            return;
        }
        onAdd(n);
        setQ('');
        inpRef.current?.focus();
    };

    return (
        <div className="WR-subs-root" ref={ref}>
            <div className={'WR-subs-box' + (chips.length ? ' has' : '')} onClick={() => { inpRef.current?.focus(); setOpen(true); }}>
                <Ic n="users" s={14} c={chips.length ? 'var(--ember)' : 'var(--text-4)'} />
                {chips.map(c => (
                    <span key={c.id ?? `new-${c.name}`} className={'WR-sub-chip' + (c.id === null ? ' pending' : '')}>
                        {c.name}
                        <button type="button" className="WR-sub-chip-x" title="Remove" onClick={e => { e.stopPropagation(); onRemove(c); }}>
                            <Ic n="x" s={8} c="currentColor" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inpRef}
                    className="WR-subs-input"
                    placeholder={chips.length ? 'Add another' : 'Add associate name'}
                    value={q}
                    onFocus={() => setOpen(true)}
                    onChange={e => { setQ(e.target.value); setOpen(true); }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); add(query); }
                        if (e.key === 'Backspace' && !q && chips.length) onRemove(chips[chips.length - 1]);
                    }}
                />
            </div>

            {open && (matched.length > 0 || (query && !exact)) && (
                <div className="WR-subs-panel" ref={panelRef}>
                    {matched.length > 0 && <div className="WR-subs-panel-lbl">Existing associate names</div>}
                    {matched.slice(0, 8).map(s => (
                        <div key={s} role="option" tabIndex={-1} aria-selected={false} className="WR-subs-opt" onClick={() => add(s)}>
                            <Ic n="user" s={12} c="var(--text-4)" />{s}
                        </div>
                    ))}
                    {query && !exact && (
                        <div className="WR-subs-add" role="option" tabIndex={-1} aria-selected={false} onClick={() => add(query)}>
                            <Ic n="plus" s={12} c="var(--ember)" />Add “{query}” as new associate name
                        </div>
                    )}
                </div>
            )}

            <div className="WR-subs-hint">Referred / temporary workers under this worker — shows in Attendance sub-name dropdown</div>

            {chips.length > 0 && (
                <div className="WR-subs-rates">
                    <div className="WR-subs-rates-lbl">Optional daily rate per associate name — auto-fills the amount in Attendance (still editable there if the pay varies that day)</div>
                    {chips.map(c => (
                        <div key={c.id ?? `new-${c.name}`} className="WR-subs-rate-row">
                            <span className="WR-subs-rate-name">{c.name}</span>
                            <div className="WR-subs-rate-input-wrap">
                                <span className="WR-subs-rate-prefix">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="WR-subs-rate-input"
                                    placeholder="variable"
                                    value={c.rate ?? ''}
                                    onChange={e => onRateChange(c, e.target.value)}
                                />
                                <span className="WR-subs-rate-suffix">/day</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const CSS = `
@keyframes wr-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes wr-row{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes wr-shine{0%{left:-80%}60%,100%{left:160%}}
/* Premium tab-swap transition — plays every time Register/Workers content
   re-mounts (blur+scale+lift, snappy overshoot), distinct from the plain
   fade-up used for smaller sub-elements. */
@keyframes wr-pageSwap{
  0%{opacity:0;transform:translateY(20px) scale(.97);filter:blur(5px);}
  55%{opacity:1;filter:blur(0);}
  75%{transform:translateY(-2px) scale(1.005);}
  100%{opacity:1;transform:translateY(0) scale(1);}
}
@keyframes wr-rowIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}

/* HERO */
.WR-hero{border-radius:var(--r-xl);overflow:hidden;margin-bottom:20px;box-shadow:0 4px 24px rgba(37,99,235,0.18);animation:wr-in .3s ease both;}
.WR-hero-top{background:linear-gradient(135deg,#1D4ED8 0%,#c47e0a 45%,#60A5FA 100%);padding:22px 26px 20px;position:relative;overflow:hidden;}
.WR-hero-top::before{content:'';position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.05);}
.WR-hero-top::after{content:'';position:absolute;bottom:-30px;right:80px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.04);}
.WR-hero-row{display:flex;align-items:center;gap:16px;position:relative;}
.WR-hero-icon{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.18);border:1.5px solid rgba(255,255,255,0.28);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.WR-hero-title{font-family:var(--font-display);font-size: 24.5px;font-style:italic;color:#fff;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,0.2);}
.WR-hero-sub{font-family:var(--font-mono);font-size: 8px;color:rgba(255,255,255,0.65);letter-spacing:2.5px;text-transform:uppercase;margin-top:5px;}
.WR-hero-chips{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;}
.WR-hero-chip{padding:6px 14px;border-radius:100px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.28);font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:#fff;letter-spacing:1px;white-space:nowrap;}
.WR-hero-chip.accent{background:rgba(255,255,255,0.28);border-color:rgba(255,255,255,0.45);}

/* TABS — flat, bordered segmented control (same clean language as the
   All/Active/Inactive filter below), not a gradient pill. Active segment is
   one solid flat color, no shadow/glow — neat and professional. */
.WR-tabs-bar{display:inline-flex;border:1.5px solid var(--border);border-radius:var(--r-lg);overflow:hidden;background:var(--white);margin-bottom:20px;animation:wr-in .3s .05s ease both;}
.WR-tab{display:flex;align-items:center;gap:7px;padding:9px 18px;font-family:var(--font-mono);font-size: 8.5px;font-weight: 800;letter-spacing:1.3px;text-transform:uppercase;color:var(--text-3);cursor:pointer;border:none;border-right:1.5px solid var(--border);transition:background .16s ease,color .16s ease,transform .16s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;background:var(--white);}
.WR-tab:last-child{border-right:none;}
.WR-tab:hover{color:var(--ember);background:var(--ember-ghost);transform:translateY(-1px);}
.WR-tab:active{transform:translateY(0) scale(.96);}
.WR-tab.active{color:#fff;background:var(--ember);}
.WR-tab-badge{padding:2px 8px;border-radius:100px;font-size: 8px;font-weight: 800;background:var(--ember-ghost);color:var(--ember);border:1px solid var(--ember-border);}
.WR-tab.active .WR-tab-badge{background:rgba(255,255,255,.25);color:#fff;border-color:rgba(255,255,255,.4);}

/* STATS */
.WR-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;animation:wr-in .3s .08s ease both;}
@media(max-width:900px){.WR-stats{grid-template-columns:repeat(2,1fr);}}
.WR-stat{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-xl);padding:16px 18px;box-shadow:var(--sh-card);display:flex;align-items:center;gap:12px;position:relative;overflow:hidden;transition:box-shadow .2s,transform .2s;}
.WR-stat:hover{box-shadow:0 6px 28px rgba(0,0,0,.10);transform:translateY(-2px);}
.WR-stat::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.WR-stat.s-total::after{background:linear-gradient(90deg,var(--ember),rgba(37,99,235,0));}
.WR-stat.s-active::after{background:linear-gradient(90deg,#2563EB,rgba(37,99,235,0));}
.WR-stat.s-inactive::after{background:linear-gradient(90deg,var(--text-4),rgba(100,116,139,0));}
.WR-stat.s-trades::after{background:linear-gradient(90deg,var(--info),rgba(50,120,220,0));}
.WR-stat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.WR-stat.s-total .WR-stat-icon{background:var(--ember-ghost);border:1.5px solid var(--ember-border);}
.WR-stat.s-active .WR-stat-icon{background:rgba(37,99,235,.10);border:1.5px solid rgba(37,99,235,.22);}
.WR-stat.s-inactive .WR-stat-icon{background:var(--off-white);border:1.5px solid var(--border);}
.WR-stat.s-trades .WR-stat-icon{background:var(--info-bg);border:1.5px solid var(--info-bd);}
.WR-stat-lbl{font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:2px;text-transform:uppercase;color:var(--text-4);margin-bottom:4px;}
.WR-stat-val{font-family:var(--font-mono);font-size: 19.5px;font-weight: 900;color:var(--text-1);line-height:1;}
.WR-stat.s-total .WR-stat-val{color:var(--ember);}
.WR-stat.s-active .WR-stat-val{color:#2563EB;}
.WR-stat.s-trades .WR-stat-val{color:var(--info);}

/* FORM CARD */
.WR-form-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-xl);box-shadow:var(--sh-card);overflow:visible;animation:wr-in .3s .1s ease both;}
.WR-form-topbar{height:4px;background:linear-gradient(90deg,#60A5FA,#3B82F6,#60A5FA);border-radius:var(--r-xl) var(--r-xl) 0 0;}
.WR-form-header{display:flex;align-items:center;gap:12px;padding:18px 24px;border-bottom:1px solid var(--border);background:linear-gradient(to bottom,rgba(37,99,235,.04),var(--white));}
.WR-form-hdr-icon{width:40px;height:40px;border-radius:10px;background:var(--ember-ghost);border:1.5px solid var(--ember-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.WR-form-hdr-title{font-family:var(--font-body);font-size: 16px;font-weight: 800;font-style:normal;text-transform:uppercase;letter-spacing:.4px;color:var(--text-1);}
.WR-form-hdr-desc{font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:var(--text-3);letter-spacing:1.5px;text-transform:uppercase;margin-top:3px;}
.WR-form-body{padding:24px;animation:wr-fade .2s ease both;}
@keyframes wr-fade{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}

/* SECTION LABELS */
.WR-sec{display:flex;align-items:center;gap:10px;margin:20px 0 14px;}
.WR-sec:first-child{margin-top:0;}
.WR-sec-num{width:22px;height:22px;border-radius:6px;background:var(--ember-ghost);border:1px solid var(--ember-border);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:var(--ember);flex-shrink:0;}
.WR-sec-lbl{font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:2.5px;text-transform:uppercase;color:var(--text-1);white-space:nowrap;}
.WR-sec-rule{flex:1;height:1px;background:var(--border);}

/* LABELS / INPUTS — bolder, darker text throughout the create form so
   every field reads clearly at a glance. */
.WR-label{display:block;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-1);margin-bottom:7px;}
.WR-label-opt{color:var(--text-3);font-size: 8px;font-style:normal;margin-left:5px;font-weight: 800;letter-spacing:0;text-transform:none;}
.WR-form-card .ERP-input,.WR-form-card .ERP-textarea,.WR-form-card .WR-cmb-input{font-weight: 800;color:var(--text-1);}
.WR-form-card .ERP-input::placeholder,.WR-form-card .ERP-textarea::placeholder{font-weight: 700;}

/* FORM GRID — 2 spacious columns */
.WR-map-row{display:grid;grid-template-columns:1fr 1fr;gap:2px 28px;}
@media(max-width:700px){.WR-map-row{grid-template-columns:1fr;}}
.WR-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:0 28px;}
@media(max-width:800px){.WR-grid-2{grid-template-columns:1fr;}}

/* FIELD SIZE BOOST — more room for large data */
.WR-sdd-btn{min-height:50px;padding:12px 15px;}
.WR-sdd-item{padding:11px 15px;font-size: 11px;}
.WR-sdd-search-row{padding:11px 14px;}
.WR-subs-box{min-height:50px;padding:9px 12px;}
.WR-cmb-wrap{padding:12px 15px;}
.WR-cmb-item{padding:11px 15px;font-size: 11px;}

/* NAME CONFIRMED */
.WR-name-row{display:grid;grid-template-columns:1fr 1fr;gap:0 32px;margin-bottom:4px;}
@media(max-width:800px){.WR-name-row{grid-template-columns:1fr;}}
.WR-name-card{display:flex;align-items:center;gap:10px;padding:11px 14px;background:rgba(37,99,235,.06);border:1.5px solid rgba(37,99,235,.25);border-radius:var(--r-md);margin-bottom:14px;}
.WR-name-card-lbl{font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--text-4);}
.WR-name-card-val{font-family:var(--font-body);font-size: 11.5px;font-weight: 800;color:var(--text-1);margin-top:2px;}
.WR-subname-field{display:flex;align-items:center;gap:8px;padding:10px 13px;border:1.5px solid var(--border);border-radius:var(--r-md);min-height:44px;margin-bottom:14px;background:var(--off-white);}
.WR-subname-field.linked{background:rgba(37,99,235,.05);border-color:rgba(37,99,235,.3);}
.WR-subname-text{font-family:var(--font-body);font-size: 10px;flex:1;color:var(--text-4);font-style:italic;}
.WR-subname-text.linked{color:var(--text-1);font-style:normal;font-weight: 700;}
.WR-subname-badge{padding:2px 8px;border-radius:100px;font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;}
.WR-subname-badge.ok{background:rgba(37,99,235,.10);border:1px solid rgba(37,99,235,.25);color:#2563EB;}

/* ERP inputs used in form */
.ERP-label{display:block;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-1);margin-bottom:7px;}
.ERP-label-opt{color:var(--text-3);font-size: 8px;font-style:normal;margin-left:5px;font-weight: 800;letter-spacing:0;text-transform:none;}
.ERP-input{width:100%;padding:13px 15px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font-body);font-size: 11px;color:var(--text-1);outline:none;transition:all .18s;box-sizing:border-box;}
.ERP-input:focus{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.ERP-hint{font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:var(--text-3);margin-top:5px;}
.ERP-textarea{width:100%;padding:10px 13px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font-body);font-size: 10.5px;color:var(--text-1);outline:none;transition:all .18s;resize:vertical;min-height:90px;box-sizing:border-box;}
.ERP-textarea:focus{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}

/* PAY TYPE CARDS */
.WR-pay-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
@media(max-width:480px){.WR-pay-grid{grid-template-columns:1fr;}}
.WR-pay-card{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px;border:1.5px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;transition:all .18s cubic-bezier(.34,1.56,.64,1);position:relative;}
.WR-pay-card:hover{border-color:var(--ember-mid);background:var(--ember-ghost);}
.WR-pay-card.sel{border-width:2px;}
.WR-pay-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.WR-pay-lbl{font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1px;text-transform:uppercase;color:var(--text-1);}
.WR-pay-hint{font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;color:var(--text-3);}
.WR-pay-chk{position:absolute;top:5px;right:5px;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.5);transition:all .15s;}
.WR-pay-card.sel .WR-pay-chk{opacity:1;transform:scale(1);}

/* RATE INPUT */
.WR-rate-wrap{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:var(--r-md);overflow:hidden;transition:all .18s;margin-bottom:4px;}
.WR-rate-wrap:focus-within{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.WR-rate-pfx{padding:0 15px;font-family:var(--font-mono);font-size: 10.5px;font-weight: 800;color:var(--text-1);background:var(--off-white);border-right:1.5px solid var(--border);height:50px;display:flex;align-items:center;flex-shrink:0;}
.WR-rate-inp{flex:1;padding:0 15px;background:var(--white);border:none;outline:none;font-family:var(--font-mono);font-size: 14px;font-weight: 800;color:var(--text-1);height:50px;}
.WR-rate-tag{padding:0 15px;background:var(--off-white);border-left:1.5px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;height:50px;min-width:84px;}
.WR-rate-tag-lbl{font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:var(--text-1);letter-spacing:.5px;text-transform:uppercase;}

/* SDD STYLES */
.WR-sdd-root{position:relative;width:100%;}
.WR-sdd-root[data-disabled="true"]{opacity:.45;pointer-events:none;}
.WR-sdd-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);cursor:pointer;transition:all .18s;text-align:left;min-height:44px;outline:none;}
.WR-sdd-btn:hover:not(.dis){border-color:var(--ember-mid);background:var(--ember-ghost);}
.WR-sdd-btn.open{border-color:var(--ember);box-shadow:0 0 0 3px var(--ember-ghost);border-bottom-left-radius:0;border-bottom-right-radius:0;}
.WR-sdd-btn.dis{pointer-events:none;opacity:.5;background:var(--off-white);}
.WR-sdd-btn.has{border-color:var(--ember-border);}
.WR-sdd-chev{color:var(--text-4);transition:transform .2s,color .18s;flex-shrink:0;display:flex;}
.WR-sdd-chev.open{transform:rotate(180deg);color:var(--ember);}
.WR-sdd-panel{position:absolute;top:100%;left:0;right:0;z-index:1000;background:var(--white);border:1.5px solid var(--ember);border-top:none;border-bottom-left-radius:var(--r-md);border-bottom-right-radius:var(--r-md);box-shadow:0 12px 32px rgba(0,0,0,.12);overflow:hidden;}
.WR-sdd-search-row{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border);background:var(--off-white);}
.WR-sdd-search{flex:1;background:transparent;border:none;outline:none;font-family:var(--font-body);font-size: 10px;color:var(--text-1);}
.WR-sdd-clr{background:none;border:none;padding:2px;cursor:pointer;color:var(--text-4);display:flex;}
.WR-sdd-clr:hover{color:var(--error);}
.WR-sdd-list{max-height:200px;overflow-y:auto;padding:3px 0;}
.WR-sdd-list::-webkit-scrollbar{width:3px;}
.WR-sdd-list::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:2px;}
.WR-sdd-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 14px;cursor:pointer;transition:background .1s;font-family:var(--font-body);font-size: 10.5px;color:var(--text-2);}
.WR-sdd-item:hover{background:var(--off-white);}
.WR-sdd-item.sel{background:var(--ember-ghost);color:var(--ember);}
.WR-sdd-item.WR-sdd-clear{font-size: 9px;color:var(--text-4);gap:6px;}
.WR-sdd-item.WR-sdd-clear:hover{color:var(--error);background:var(--error-bg);}
.WR-sdd-badge{padding:1px 7px;border-radius:4px;font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:.5px;border:1px solid;flex-shrink:0;}
.WR-sdd-empty{display:flex;align-items:center;gap:8px;padding:14px;color:var(--text-4);font-size: 9.5px;font-style:italic;}
.WR-sdd-footer{padding:6px 12px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size: 8px;color:var(--text-4);text-align:right;}

/* TRADE COMBO */
.WR-cmb-root{position:relative;width:100%;margin-bottom:0;}
.WR-cmb-wrap{display:flex;align-items:center;gap:8px;padding:10px 13px;border:1.5px solid var(--border);border-radius:var(--r-md);transition:all .18s;background:var(--white);}
.WR-cmb-wrap:focus-within,.WR-cmb-wrap.open{border-color:var(--ember);box-shadow:0 0 0 3px var(--ember-ghost);}
.WR-cmb-input{flex:1;background:transparent;border:none;outline:none;font-family:var(--font-body);font-size: 10.5px;color:var(--text-1);min-width:0;}
.WR-cmb-clr{background:none;border:none;padding:2px;cursor:pointer;color:var(--text-4);display:flex;}
.WR-cmb-clr:hover{color:var(--error);}
.WR-cmb-chev{color:var(--text-4);transition:transform .2s;flex-shrink:0;display:flex;}
.WR-cmb-chev.open{transform:rotate(180deg);color:var(--ember);}
.WR-cmb-panel{position:absolute;top:100%;left:0;right:0;z-index:1000;background:var(--white);border:1.5px solid var(--ember);border-top:none;border-bottom-left-radius:var(--r-md);border-bottom-right-radius:var(--r-md);box-shadow:0 12px 32px rgba(0,0,0,.12);max-height:200px;overflow-y:auto;}
.WR-cmb-panel::-webkit-scrollbar{width:3px;}
.WR-cmb-panel::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:2px;}
.WR-cmb-section{padding:8px 14px 4px;font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:2px;text-transform:uppercase;color:var(--text-4);}
.WR-cmb-item{padding:9px 14px;cursor:pointer;font-family:var(--font-body);font-size: 10.5px;color:var(--text-2);transition:background .1s;}
.WR-cmb-item:hover,.WR-cmb-item.active{background:var(--ember-ghost);color:var(--ember);}
.WR-cmb-new{padding:9px 14px;cursor:pointer;font-family:var(--font-body);font-size: 10px;color:var(--ember);font-style:italic;border-top:1px solid var(--border);}
.WR-cmb-new:hover{background:var(--ember-ghost);}
.WR-cmb-empty{padding:12px 14px;font-size: 9.5px;color:var(--text-4);font-style:italic;}

/* FORM FOOTER */
/* Footer — compact, flat, right-aligned buttons instead of one button
   stretched full-width with a shiny animated sweep. */
.WR-form-footer{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--border);background:var(--off-white);}
.WR-submit-btn{padding:9px 20px;background:var(--ember);color:#fff;border:none;border-radius:var(--r-md);font-family:var(--font-mono);font-size: 8.5px;font-weight: 800;letter-spacing:1.3px;text-transform:uppercase;cursor:pointer;transition:background .18s ease,transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease;}
.WR-submit-btn:hover:not(:disabled){background:var(--ember-mid,#3B82F6);transform:translateY(-1px);box-shadow:0 4px 14px rgba(29,78,216,.28);}
.WR-submit-btn:active{transform:translateY(0) scale(.96);}
.WR-submit-btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.WR-update-btn{background:var(--ember);}
.WR-update-btn:hover:not(:disabled){background:var(--ember-mid,#3B82F6);}
.WR-cancel-btn{padding:9px 16px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1.3px;text-transform:uppercase;color:var(--text-2);cursor:pointer;transition:all .18s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;}
.WR-cancel-btn:hover{border-color:var(--error);color:var(--error);background:#FFF5F3;transform:translateY(-1px);}
.WR-cancel-btn:active{transform:translateY(0) scale(.96);}

/* TABLE CARD */
.WR-tbl-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--sh-card);animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both;}
.WR-tbl-header{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--off-white);flex-wrap:wrap;}
.WR-tbl-title{font-family:var(--font-body);font-size: 14px;font-weight: 800;font-style:normal;text-transform:uppercase;letter-spacing:.5px;color:var(--text-1);}
.WR-tbl-actions{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.WR-search-wrap{display:flex;align-items:center;gap:8px;padding:9px 13px;border:1.5px solid var(--border);border-radius:var(--r-md);background:var(--white);transition:all .18s;}
.WR-search-wrap:focus-within{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.WR-search{background:none;border:none;outline:none;font-family:var(--font-body);font-size: 10.5px;font-weight: 700;color:var(--text-1);width:180px;}
.WR-pdf-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:var(--r-md);background:linear-gradient(135deg,#2563EB,#1D4ED8);border:none;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:#fff;cursor:pointer;transition:all .2s;}
.WR-pdf-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(37,99,235,.4);}
.WR-table-wrap{overflow-x:auto;}
.WR-table{width:100%;border-collapse:collapse;font-family:var(--font-body);border:1px solid var(--border);}
/* Bordered box grid + solid header bar, matching the report-page table look. */
/* Same solid-orange header bar used by the Master Data tables (Category,
   Sub-Category, Identification Type…) — bumped a touch larger/bolder here since this
   table carries more columns and denser data. */
.WR-table thead tr{background:var(--surface-2,#E9EEF5);border-bottom:2px solid var(--ember,#2563EB);}
.WR-table th{font-family:var(--font-mono);font-size: 9.5px;font-weight: 800;letter-spacing:1.4px;text-transform:uppercase;color:var(--text-3,#27364A);padding:13px 14px;white-space:nowrap;text-align:center;border-right:1px solid var(--border,#E9EEF5);}
.WR-table th:last-child{border-right:none;}
.WR-table td{padding:12px 14px;border-bottom:1px solid var(--border);border-right:1px solid var(--border);font-size: 10.5px;font-weight: 700;color:var(--text-1);vertical-align:middle;}
.WR-table td:last-child{border-right:none;}
.WR-table tr:last-child td{border-bottom:none;}
.WR-table tbody tr{transition:background .12s;animation:wr-rowIn .32s ease both;}
.WR-table tbody tr:nth-child(even) td{background:var(--off-white,#F8FAFC);}
.WR-table tbody tr:hover td{background:var(--ember-ghost);}
.WR-table tbody tr.inactive td{opacity:.62;}
.WR-name{font-size: 13px;font-weight: 800;color:var(--ember);}
.WR-code{font-family:var(--font-mono);font-size: 9px;font-weight: 700;color:var(--ember-mid);margin-top:2px;}
.WR-cat-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;background:var(--ember-ghost);border:1px solid var(--ember-border);font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;color:var(--ember);}
.WR-subcat-pill{display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;background:var(--off-white);border:1px solid var(--border);font-family:var(--font-mono);font-size: 8px;color:var(--text-3);}
.WR-skill-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;background:var(--ember-ghost);border:1px solid var(--ember-border);font-family:var(--font-mono);font-size: 8px;font-weight: 700;color:var(--ember);}
.WR-pay-badge{display:inline-flex;padding:3px 10px;border-radius:100px;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;text-transform:uppercase;}
.WR-pay-badge.daily{background:rgba(37,99,235,.10);color:#2563EB;border:1px solid rgba(37,99,235,.25);}
.WR-pay-badge.weekly{background:rgba(196,126,10,.10);color:#C47E0A;border:1px solid rgba(196,126,10,.25);}
.WR-pay-badge.monthly{background:var(--ember-ghost);color:var(--ember);border:1px solid var(--ember-border);}
.WR-rate{font-family:var(--font-mono);font-size: 10.5px;font-weight: 800;color:var(--text-1);}
.WR-rate-lbl{font-family:var(--font-mono);font-size: 8px;color:var(--text-4);}
.WR-status-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;}
.WR-status-dot.active{background:#2563EB;box-shadow:0 0 0 2px rgba(37,99,235,.2);}
.WR-status-dot.inactive{background:var(--text-4);}
.WR-tbl-act{display:flex;align-items:center;gap:5px;}
/* Tinted at rest (not just on hover) — same treatment as the Master Data
   tables' edit/delete icon buttons, so this table's action column reads
   consistently with the rest of the app. */
.WR-act-btn{width:30px;height:30px;border-radius:var(--r-sm);border:1px solid var(--ember-border);background:var(--ember-ghost);color:var(--ember);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s ease,background .18s ease,color .18s ease,border-color .18s ease;}
.WR-act-btn:hover{transform:translateY(-2px) scale(1.08);background:var(--ember);color:#fff;border-color:var(--ember);box-shadow:0 5px 14px rgba(37,99,235,.32);}
.WR-act-btn:active{transform:translateY(0) scale(.92);}
.WR-act-btn.del{background:var(--error-bg);color:var(--error);border-color:var(--error-bd);}
.WR-act-btn.del:hover{background:var(--error);color:#fff;border-color:var(--error);box-shadow:0 5px 14px rgba(217,59,85,.32);}

/* TRASH */
.WR-trash-bar{display:flex;align-items:center;gap:10px;padding:11px 20px;background:#fff8f8;border-bottom:1px solid rgba(217,59,85,.22);}
.WR-trash-bar-lbl{font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:2px;text-transform:uppercase;color:#d93b55;}
.WR-trash-row td{background:rgba(217,59,85,.02)!important;}
.WR-trash-row:hover td{background:rgba(217,59,85,.05)!important;}
.WR-restore-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:6px;background:rgba(37,99,235,.08);border:1.5px solid rgba(37,99,235,.25);font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:#2563EB;cursor:pointer;transition:all .15s;white-space:nowrap;}
.WR-restore-btn:hover{background:#2563EB;color:#fff;}
.WR-force-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:6px;background:#fff0f0;border:1.5px solid var(--error);font-family:var(--font-mono);font-size: 8px;font-weight: 800;color:var(--error);cursor:pointer;transition:all .15s;white-space:nowrap;}
.WR-force-btn:hover{background:var(--error);color:#fff;}

/* LOADER — themed ember ring + skeleton rows */
@keyframes wr-spin2{to{transform:rotate(360deg);}}
@keyframes wr-core-pulse{0%,100%{transform:scale(1);box-shadow:0 3px 12px rgba(37,99,235,.35);}50%{transform:scale(0.86);box-shadow:0 3px 20px rgba(37,99,235,.55);}}
@keyframes wr-sheen{to{background-position:-200% center;}}
@keyframes wr-skel-shimmer{0%{background-position:-360px 0;}100%{background-position:360px 0;}}
@keyframes wr-skel-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.WR-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:38px 26px 30px;gap:16px;}
.WR-loader-ring{position:relative;width:52px;height:52px;}
.WR-loader-ring::before{content:'';position:absolute;inset:0;border-radius:50%;border:3px solid var(--ember-ghost);}
.WR-loader-ring::after{content:'';position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:var(--ember);border-right-color:var(--ember-mid);animation:wr-spin2 .75s cubic-bezier(.55,.15,.45,.85) infinite;}
.WR-loader-core{position:absolute;inset:15px;border-radius:50%;background:linear-gradient(135deg,var(--ember),var(--ember-mid));animation:wr-core-pulse 1.1s ease-in-out infinite;}
.WR-loader-lbl{font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:3px;text-transform:uppercase;background:linear-gradient(90deg,var(--ember),var(--ember-mid),var(--ember-pale),var(--ember));background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:wr-sheen 1.5s linear infinite;}
.WR-skel-rows{width:100%;display:flex;flex-direction:column;gap:12px;margin-top:6px;}
.WR-skel-row{display:grid;grid-template-columns:36px 1fr .8fr 1.3fr .9fr .7fr;gap:14px;align-items:center;animation:wr-skel-in .35s ease both;}
.WR-skel-row:nth-child(1){animation-delay:.05s;}
.WR-skel-row:nth-child(2){animation-delay:.13s;}
.WR-skel-row:nth-child(3){animation-delay:.21s;}
.WR-skel-row:nth-child(4){animation-delay:.29s;}
.WR-skel{height:12px;border-radius:6px;background:linear-gradient(90deg,var(--surface-2) 25%,#FFE0BD 50%,var(--surface-2) 75%);background-size:360px 100%;animation:wr-skel-shimmer 1.15s linear infinite;}
.WR-skel.tall{height:26px;border-radius:8px;}
@media(max-width:720px){.WR-skel-row{grid-template-columns:28px 1fr 1fr;}.WR-skel-row .WR-skel:nth-child(n+4){display:none;}}

/* EMPTY */
.WR-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:52px 20px;gap:10px;}
.WR-empty-icon{font-size: 28px;opacity:.2;}
.WR-empty-text{font-family:var(--font-mono);font-size: 8px;letter-spacing:2px;text-transform:uppercase;color:var(--text-4);}

/* TOAST */
.WR-toast{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:var(--r-md);font-family:var(--font-mono);font-size: 9px;font-weight: 800;letter-spacing:.5px;box-shadow:0 8px 24px rgba(0,0,0,.15);animation:wr-in .2s ease both;}
.WR-toast.ok{background:var(--ember);color:#fff;}
.WR-toast.err{background:var(--error);color:#fff;}

/* SUB NAMES MANAGER (referred workers) */
.WR-subs-root{position:relative;margin-bottom:14px;}
.WR-subs-box{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-md);min-height:44px;transition:all .18s;cursor:text;}
.WR-subs-box:focus-within{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.WR-subs-box.has{border-color:var(--ember-border);}
.WR-sub-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 6px 4px 10px;border-radius:100px;background:var(--ember-ghost);border:1px solid var(--ember-border);font-family:var(--font-body);font-size: 9px;font-weight: 800;color:var(--ember);animation:wr-row .15s ease both;}
.WR-sub-chip.pending{background:rgba(37,99,235,.08);border-color:rgba(37,99,235,.3);color:#2563EB;}
.WR-sub-chip-x{width:15px;height:15px;border-radius:50%;border:none;background:rgba(0,0,0,.08);color:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:all .12s;}
.WR-sub-chip-x:hover{background:var(--error);color:#fff;}
.WR-subs-input{flex:1;min-width:130px;background:transparent;border:none;outline:none;font-family:var(--font-body);font-size: 10px;color:var(--text-1);caret-color:var(--ember);padding:4px 2px;}
.WR-subs-input::placeholder{color:var(--text-4);font-style:italic;}
.WR-subs-panel{position:absolute;top:100%;left:0;right:0;z-index:1001;background:var(--white);border:1.5px solid var(--ember);border-radius:0 0 var(--r-md) var(--r-md);border-top:none;box-shadow:0 12px 32px rgba(0,0,0,.12);max-height:180px;overflow-y:auto;}
.WR-subs-panel-lbl{padding:7px 13px 3px;font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-4);}
.WR-subs-opt{display:flex;align-items:center;gap:8px;padding:8px 13px;cursor:pointer;font-family:var(--font-body);font-size: 10px;color:var(--text-2);transition:background .1s;}
.WR-subs-opt:hover{background:var(--ember-ghost);color:var(--ember);}
.WR-subs-add{display:flex;align-items:center;gap:8px;padding:9px 13px;cursor:pointer;font-family:var(--font-body);font-size: 10px;font-weight: 800;color:var(--ember);border-top:1px dashed var(--ember-border);background:var(--ember-ghost);}
.WR-subs-add:hover{background:rgba(37,99,235,.16);}
.WR-subs-hint{font-family:var(--font-mono);font-size: 8px;color:var(--text-4);margin-top:5px;}
.WR-subs-rates{margin-top:10px;padding:10px 12px;background:var(--off-white,#F8FAFC);border:1.5px dashed var(--border);border-radius:var(--r-md);display:flex;flex-direction:column;gap:7px;}
.WR-subs-rates-lbl{font-family:var(--font-mono);font-size: 8px;color:var(--text-4);letter-spacing:.3px;line-height:1.5;}
.WR-subs-rate-row{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.WR-subs-rate-name{font-family:var(--font-body);font-size: 9.5px;font-weight: 800;color:var(--text-2);}
.WR-subs-rate-input-wrap{display:flex;align-items:center;gap:4px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-sm,8px);padding:3px 9px;transition:border-color .15s;}
.WR-subs-rate-input-wrap:focus-within{border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.WR-subs-rate-prefix{font-family:var(--font-mono);font-size: 9px;font-weight: 800;color:var(--ember);}
.WR-subs-rate-input{width:64px;background:transparent;border:none;outline:none;font-family:var(--font-mono);font-size: 9px;font-weight: 800;color:var(--text-2);text-align:right;}
.WR-subs-rate-input::placeholder{color:var(--text-4);font-weight: 700;font-style:italic;}
.WR-subs-rate-input::-webkit-outer-spin-button,.WR-subs-rate-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.WR-subs-rate-suffix{font-family:var(--font-mono);font-size: 8px;color:var(--text-4);}
.WR-tbl-subchip{display:inline-flex;align-items:center;padding:3px 9px;border-radius:100px;background:var(--ember-ghost);border:1px solid var(--ember-border);font-family:var(--font-mono);font-size: 9.5px;font-weight: 800;color:var(--text-1);margin:1px 2px 1px 0;white-space:nowrap;}
.WR-tbl-subchip.big{font-size: 10.5px;padding:4px 10px;}
.WR-tbl-subchip.inactive{background:var(--off-white);border-color:var(--border);color:var(--text-4);text-decoration:line-through;font-weight: 700;}
.WR-tbl-subchip.toggle{cursor:pointer;background:none;border:1px solid var(--border);color:var(--text-4);font-weight: 800;transition:all .15s;}
.WR-tbl-subchip.toggle:hover{border-color:var(--ember-mid);color:var(--ember);background:var(--ember-ghost);}
.WR-tbl-subchip.toggle.more{background:var(--off-white);border-color:var(--border-2);color:var(--text-3);}
.WR-tbl-subchip.toggle.more:hover{background:var(--ember-ghost);border-color:var(--ember-mid);color:var(--ember);}
/* expanded "manage associate names" panel — shown inline in the table cell.
   Card-style treatment (accent bar + shadow) instead of a flat tinted box,
   so it reads as a distinct floating panel rather than part of the row. */
.WR-tbl-sub-expanded{position:relative;display:flex;flex-direction:column;gap:8px;min-width:240px;padding:10px 12px 8px;background:var(--white);border:1.5px solid var(--ember-border);border-radius:12px;box-shadow:0 8px 22px rgba(37,99,235,.14);transform-origin:top center;animation:wr-sdd-drop-in .22s cubic-bezier(.22,1,.36,1) both;}
.WR-tbl-sub-expanded::before{content:'';position:absolute;top:0;left:12px;right:12px;height:2.5px;border-radius:0 0 3px 3px;background:linear-gradient(90deg,var(--ember) 0%,#60A5FA 100%);}
@keyframes wr-sdd-drop-in{0%{opacity:0;transform:translateY(-6px) scale(.96);}100%{opacity:1;transform:translateY(0) scale(1);}}
/* Exit animation — played for ~200ms (matches the setTimeout in
   toggleSubRow) before the panel actually unmounts, so closing feels as
   deliberate as opening instead of the row just vanishing. */
.WR-tbl-sub-expanded.closing{animation:wr-sdd-drop-out .2s cubic-bezier(.4,0,1,1) both;}
@keyframes wr-sdd-drop-out{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-4px) scale(.97);}}
/* Header — icon + "Associate Names · N" label with a dedicated close (X), so the
   panel has a clear top/structure instead of just a stack of rows. */
.WR-tbl-sub-hdr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-bottom:7px;margin-bottom:1px;border-bottom:1px solid var(--border);}
.WR-tbl-sub-hdr-lbl{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-3);}
.WR-tbl-sub-hdr-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:100px;background:var(--ember-ghost);color:var(--ember);font-size: 8.5px;font-weight:800;}
.WR-tbl-sub-close{flex-shrink:0;width:20px;height:20px;border-radius:50%;border:1px solid var(--border);background:var(--white);color:var(--text-4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s cubic-bezier(.34,1.56,.64,1);}
.WR-tbl-sub-close:hover{background:var(--error);border-color:var(--error);color:#fff;transform:rotate(90deg) scale(1.1);}
.WR-tbl-sub-close:active{transform:rotate(90deg) scale(.92);}
/* Active/Inactive groups — small uppercase section label ahead of each
   cluster of rows, same "group header" language as other dropdown lists in
   the app, so a mixed active+inactive list has clear visual structure. */
.WR-tbl-sub-group{display:flex;flex-direction:column;gap:3px;}
.WR-tbl-sub-group-lbl{font-family:var(--font-mono);font-size: 7px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--success);opacity:.75;margin:2px 0 1px 2px;}
.WR-tbl-sub-group-lbl.inactive{color:var(--text-4);}
.WR-tbl-sub-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 5px;border-radius:7px;transition:background .15s ease;}
.WR-tbl-sub-row:hover{background:var(--ember-ghost);}
.WR-tbl-sub-row.inactive{opacity:.75;}
.WR-tbl-sub-row.inactive:hover{background:var(--off-white);}
/* Labelled pill, not a bare tiny icon — reads clearly at a glance and gives
   the click target proper room instead of a cramped 22px dot. */
.WR-tbl-sub-toggle{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:100px;font-family:var(--font-mono);font-size: 8.5px;font-weight: 800;letter-spacing:.6px;text-transform:uppercase;border:1.5px solid transparent;cursor:pointer;transition:all .2s cubic-bezier(.34,1.56,.64,1);position:relative;}
.WR-tbl-sub-toggle.deact{background:var(--ember-ghost);color:#1D4ED8;border-color:var(--ember-border);}
.WR-tbl-sub-toggle.deact:hover{background:linear-gradient(135deg,var(--ember-mid),var(--ember));color:#fff;border-color:transparent;transform:translateY(-1px) scale(1.05);box-shadow:0 5px 16px rgba(37,99,235,.4);}
.WR-tbl-sub-toggle.deact:hover svg{animation:wr-power-pulse .5s ease;}
.WR-tbl-sub-toggle.act{background:rgba(30,156,106,.1);color:var(--success);border-color:rgba(30,156,106,.24);}
.WR-tbl-sub-toggle.act:hover{background:var(--success);color:#fff;border-color:transparent;transform:translateY(-1px) scale(1.05);box-shadow:0 5px 16px rgba(30,156,106,.35);}
.WR-tbl-sub-toggle:active{transform:translateY(0) scale(.96);}
.WR-tbl-sub-toggle:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
@keyframes wr-power-pulse{0%{transform:scale(1);}50%{transform:scale(1.35);}100%{transform:scale(1);}}
/* Icon-only variant — a small round button so "deactivate" reads as a
   distinct, deliberate action-glyph rather than a wordy pill; ring + pulse
   on hover keeps it clearly interactive and different from a plain icon. */
.WR-tbl-sub-toggle.icon-only{width:26px;height:26px;padding:0;justify-content:center;border-radius:50%;gap:0;}
.WR-tbl-sub-toggle.icon-only.deact{background:#fff;color:#1D4ED8;border-color:var(--ember-border);}
.WR-tbl-sub-toggle.icon-only.deact:hover{background:linear-gradient(135deg,var(--ember-mid),var(--ember));color:#fff;border-color:transparent;box-shadow:0 0 0 4px var(--ember-ghost),0 5px 14px rgba(37,99,235,.4);transform:scale(1.12) rotate(-8deg);}
.WR-tbl-sub-toggle.icon-only.act{background:#fff;color:var(--success);border-color:rgba(30,156,106,.28);}
.WR-tbl-sub-toggle.icon-only.act:hover{background:var(--success);color:#fff;border-color:transparent;box-shadow:0 0 0 4px rgba(30,156,106,.14),0 5px 14px rgba(30,156,106,.35);transform:scale(1.12);}
.WR-tbl-sub-toggle.icon-only:active{transform:scale(.92);}
/* Small sequential number badge in front of each associate name — "1, 2, 3…" so
   a long referred-worker list is easy to count/scan at a glance. */
.WR-tbl-subnum{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:var(--ember);color:#fff;font-family:var(--font-mono);font-size: 7.5px;font-weight:800;margin-right:5px;flex-shrink:0;}
.WR-tbl-subchip.inactive .WR-tbl-subnum{background:var(--text-4);}
/* Inline "Deactivated!"/"Activated!" confirmation that pops in right where
   the row's toggle button was, so the feedback appears in-column instead of
   only as a toast that's easy to miss while scanning a long sub-name list. */
@keyframes wr-sub-msg-in{0%{opacity:0;transform:translateX(6px) scale(.9);}60%{opacity:1;transform:translateX(-2px) scale(1.05);}100%{opacity:1;transform:translateX(0) scale(1);}}
.WR-tbl-sub-msg{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:100px;font-family:var(--font-mono);font-size: 8px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;animation:wr-sub-msg-in .3s cubic-bezier(.34,1.56,.64,1) both;}
.WR-tbl-sub-msg.deact{background:rgba(37,99,235,.12);color:#1D4ED8;}
.WR-tbl-sub-msg.act{background:rgba(30,156,106,.12);color:var(--success);}
.WR-tbl-sub-collapse{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:3px;padding:6px;border-radius:7px;border:1px dashed var(--border);background:none;cursor:pointer;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:.5px;text-transform:uppercase;color:var(--text-4);transition:all .15s;}
.WR-tbl-sub-collapse svg{transform:rotate(180deg);}
.WR-tbl-sub-collapse:hover{background:var(--ember-ghost);color:var(--ember);}

/* STATUS FILTER SEGMENT */
.WR-seg{display:flex;border:1.5px solid var(--border);border-radius:var(--r-md);overflow:hidden;background:var(--white);}
.WR-seg-btn{padding:7px 13px;background:none;border:none;font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:.9px;text-transform:uppercase;color:var(--text-3);cursor:pointer;transition:background .15s ease,color .15s ease,transform .15s cubic-bezier(.34,1.56,.64,1);border-right:1px solid var(--border);display:flex;align-items:center;gap:6px;}
.WR-seg-btn:last-child{border-right:none;}
.WR-seg-btn:hover{background:var(--ember-ghost);color:var(--ember);}
.WR-seg-btn:active{transform:scale(.94);}
.WR-seg-btn.on{background:var(--ember);color:#fff;}
.WR-seg-count{padding:1px 7px;border-radius:100px;background:rgba(0,0,0,.07);font-size: 8px;}
.WR-seg-btn.on .WR-seg-count{background:rgba(255,255,255,.25);}

/* ACTIVATE / DEACTIVATE BUTTONS */
.WR-st-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:6px;font-family:var(--font-mono);font-size: 7.5px;font-weight: 800;letter-spacing:.7px;text-transform:uppercase;cursor:pointer;transition:all .15s cubic-bezier(.34,1.56,.64,1);border:1.5px solid;white-space:nowrap;background:var(--white);}
.WR-st-btn.deact{border-color:var(--border);color:var(--text-3);}
.WR-st-btn.deact:hover{border-color:var(--error);color:var(--error);background:#fff6f4;transform:translateY(-1px);}
.WR-st-btn.act{background:var(--ember-ghost);border-color:var(--ember-border);color:var(--ember);}
.WR-st-btn.act:hover{background:var(--ember);color:#fff;transform:translateY(-1px);}
.WR-st-btn:active{transform:translateY(0) scale(.94);}

/* ── REGISTER GRID + LIVE PREVIEW ── */
.WR-reg-grid{display:grid;grid-template-columns:1fr 330px;gap:20px;align-items:start;animation:wr-pageSwap .42s cubic-bezier(.22,1,.36,1) both;}
@media(max-width:1150px){.WR-reg-grid{grid-template-columns:1fr;}}
.WR-preview{position:sticky;top:20px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-xl);box-shadow:var(--sh-card);overflow:hidden;animation:wr-in .35s .12s ease both;}
.WR-prev-top{background:linear-gradient(135deg,#1D4ED8 0%,#c47e0a 50%,#60A5FA 100%);padding:28px 20px 22px;text-align:center;position:relative;overflow:hidden;}
.WR-prev-top::before{content:'';position:absolute;top:-45px;right:-45px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.07);}
.WR-prev-top::after{content:'';position:absolute;bottom:-35px;left:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.05);}
.WR-prev-avatar{width:66px;height:66px;border-radius:50%;margin:0 auto 12px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size: 22px;font-style:italic;font-weight: 800;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.25);position:relative;box-shadow:0 6px 20px rgba(0,0,0,.18);}
.WR-prev-name{font-family:var(--font-display);font-size: 17.5px;font-style:italic;color:#fff;position:relative;text-shadow:0 2px 8px rgba(0,0,0,.2);word-break:break-word;}
.WR-prev-trade{font-family:var(--font-mono);font-size: 8px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.78);margin-top:6px;position:relative;}
.WR-prev-body{padding:6px 18px 10px;}
.WR-prev-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px dashed var(--border);}
.WR-prev-row:last-child{border-bottom:none;}
.WR-prev-k{font-family:var(--font-mono);font-size: 8px;font-weight: 800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-4);flex-shrink:0;}
.WR-prev-v{font-family:var(--font-body);font-size: 10px;font-weight: 800;color:var(--text-1);text-align:right;}
.WR-prev-rate{font-family:var(--font-display);font-size: 20px;font-style:italic;font-weight: 800;color:var(--ember);line-height:1;}
.WR-prev-rate-lbl{font-family:var(--font-mono);font-size: 8px;color:var(--text-4);margin-left:3px;}
.WR-prev-chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;max-width:180px;}
.WR-prev-empty{font-family:var(--font-body);font-size: 9px;color:var(--text-4);font-style:italic;}
.WR-prev-foot{padding:10px 18px;background:var(--off-white);border-top:1px solid var(--border);font-family:var(--font-mono);font-size: 8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-4);display:flex;align-items:center;gap:7px;}
.WR-prev-pulse{width:6px;height:6px;border-radius:50%;background:#2563EB;animation:wr-pulse 1.6s infinite;flex-shrink:0;}
@keyframes wr-pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.35)}50%{box-shadow:0 0 0 5px rgba(37,99,235,0)}}
`;

export default function WorkforceRegister() {
    const userRole = useMemo(() => getStoredRole(), []);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [apiSkills, setApiSkills] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [bioData, setBioData] = useState<BioData[]>([]);
    const [subNames, setSubNames] = useState<SubName[]>([]);
    const [form, setForm] = useState(BLANK());
    const [editId, setEditId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    // Default to Active-only so an inactive worker never shows up in the
    // main list (or downstream in the Attendance dropdown, which reads
    // from the same is_active flag) unless someone explicitly clicks the
    // "Inactive" tab to go look for it.
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [activeTab, setActiveTab] = useState<'register' | 'workers'>('workers');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string; loading: boolean }>({ open: false, id: 0, name: '', loading: false });
    const [allWSubs, setAllWSubs] = useState<WSubName[]>([]);
    const [subChips, setSubChips] = useState<SubChip[]>([]);
    const [removedSubIds, setRemovedSubIds] = useState<number[]>([]);
    // Which worker rows have their Associate Names cell expanded to show everyone,
    // instead of the collapsed "first 2 + N more" preview.
    const [expandedSubRows, setExpandedSubRows] = useState<Set<number>>(new Set());
    // Rows currently mid-collapse — kept expanded in the DOM for one more
    // frame with a "closing" class so the panel plays a shrink/fade-out
    // instead of vanishing instantly (open already animates via
    // wr-sdd-drop-in; this mirrors it on the way out).
    const [closingSubRows, setClosingSubRows] = useState<Set<number>>(new Set());
    const [subToggleBusy, setSubToggleBusy] = useState<number | null>(null);
    // Brief in-column confirmation ("Deactivated!"/"Activated!") shown right
    // where the toggle button was, so the feedback is visible while scanning
    // a long sub-name list instead of relying only on the corner toast.
    const [justToggledSub, setJustToggledSub] = useState<{ id: number; active: boolean } | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    function showToast(type: 'ok' | 'err', text: string) { if (type === 'ok') appToast.success(text); else appToast.error(text); }
    function setF(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [wRes, skRes, mdRes, wsRes] = await Promise.all([
                axiosInstance.get('/api/workforce/workers'),
                axiosInstance.get('/api/workforce/skills'),
                axiosInstance.get('/api/master-data'),
                // include_inactive so the register table can show/reactivate
                // deactivated sub-names too, not just hide them entirely.
                axiosInstance.get('/api/workforce/sub-names?include_inactive=1').catch(() => ({ data: { data: [] } })),
            ]);
            setWorkers(wRes.data.data || []);
            setApiSkills(skRes.data.data || []);
            setAllWSubs(wsRes.data.data || []);
            const md = mdRes.data;
            setCategories(md.categories || []);
            setSubCategories(md.sub_categories || []);
            setBioData(md.bio_data || []);
            setSubNames(md.sub_names || []);
        } catch { showToast('err', 'Failed to load data'); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { loadAll(); }, [loadAll]);

    const expenseCats = categories.filter(c => c.type === 'expense');
    const filteredSubs = subCategories.filter(s => !form.category_id || s.category_id === Number(form.category_id));
    const filteredBio = bioData.filter(b => {
        if (!form.category_id) return true;
        if (b.category_id && b.category_id !== Number(form.category_id)) return false;
        if (form.sub_category_id && b.sub_category_id && b.sub_category_id !== Number(form.sub_category_id)) return false;
        if (b.is_active === false) return false;
        return true;
    });

    function getCatName(w: Worker) { return categories.find(c => c.id === w.category_id)?.name || '--'; }
    function getSubCatName(w: Worker) { return subCategories.find(s => s.id === w.sub_category_id)?.name || '--'; }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) { showToast('err', 'Worker name is required'); return; }
        setSaving(true);
        try {
            // One name = one worker head, always. If a worker with this exact name
            // already exists and we're not editing one, this submission is really
            // "add another associate name to that existing person" — not a request for a
            // second worker record. This is the fix for Ajith getting registered
            // twice (once at ₹500, once at ₹700): the name is now the single source
            // of truth, so a re-submission never spins up a duplicate header again.
            const dupe = !editId
                ? workers.find(w => w.is_active && w.name.trim().toLowerCase() === form.name.trim().toLowerCase())
                : null;

            let workerId = editId;
            if (dupe) {
                workerId = dupe.id;
                showToast('ok', `"${dupe.name}" already exists — adding associate name(s) to that worker instead of creating a duplicate`);
            } else {
                const payload: Record<string, unknown> = {
                    name: form.name.trim(),
                    worker_code: form.worker_code.trim() || undefined,
                    trade: form.trade || null,
                    site: '',
                    salary_type: form.salary_type,
                    daily_rate: form.salary_type !== 'monthly' ? Number(form.daily_rate) : 0,
                    monthly_salary: form.salary_type === 'monthly' ? Number(form.monthly_salary) : 0,
                    description: form.description || null,
                    is_active: form.is_active,
                    worker_type: 'labour',
                    category_id: form.category_id ? Number(form.category_id) : null,
                    sub_category_id: form.sub_category_id ? Number(form.sub_category_id) : null,
                    bio_data_id: form.bio_data_id ? Number(form.bio_data_id) : null,
                    sub_name_id: form.sub_name_id ? Number(form.sub_name_id) : null,
                };
                if (editId) { await axiosInstance.put(`/api/workforce/workers/${editId}`, payload); showToast('ok', 'Worker updated'); }
                else {
                    const res = await axiosInstance.post('/api/workforce/workers', payload);
                    workerId = res.data?.data?.id ?? null;
                    showToast('ok', 'Worker registered');
                }
            }
            // Sub-name add/remove/rate-update calls used to be fired with a
            // silent .catch(() => {}) each — if one failed (e.g. insufficient
            // permission on the remove call), the loop just moved on and the
            // final toast still said "Worker updated", making a failed
            // removal look like it saved. Now every failure is counted and
            // surfaced instead of swallowed.
            let subFailures = 0;
            if (workerId) {
                for (const sid of removedSubIds) {
                    await axiosInstance.delete(`/api/workforce/workers/${workerId}/sub-names/${sid}`).catch(() => { subFailures++; });
                }
                for (const chip of subChips.filter(c => c.id === null)) {
                    await axiosInstance.post(`/api/workforce/workers/${workerId}/sub-names`, {
                        sub_name: chip.name,
                        daily_rate: chip.rate ? Number(chip.rate) : null,
                    }).catch(() => { subFailures++; });
                }
                // Existing associate names — push any rate edit (idempotent if unchanged).
                for (const chip of subChips.filter(c => c.id !== null)) {
                    await axiosInstance.put(`/api/workforce/workers/${workerId}/sub-names/${chip.id}`, {
                        daily_rate: chip.rate ? Number(chip.rate) : null,
                    }).catch(() => { subFailures++; });
                }
            }
            setForm(BLANK()); setEditId(null); setSubChips([]); setRemovedSubIds([]); setActiveTab('workers');
            if (subFailures > 0) {
                showToast('err', `Worker saved, but ${subFailures} associate-name change${subFailures !== 1 ? 's' : ''} failed — you may not have permission, or try again`);
            }
            loadAll();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            showToast('err', msg || 'Save failed');
        } finally { setSaving(false); }
    }

    function startEdit(w: Worker) {
        setEditId(w.id);
        // allWSubs is loaded with include_inactive=1 (so the Workers table can
        // show/reactivate deactivated associate names) — but a previously
        // *removed* sub-name (is_active === false) must NOT be pre-loaded here
        // as if it were still assigned, or it silently reappears in the chip
        // list on every future edit even after being removed and saved,
        // making a successful removal look like it "didn't save".
        setSubChips(allWSubs.filter(s => s.worker_id === w.id && s.is_active !== false).map(s => ({ id: s.id, name: s.sub_name, rate: s.daily_rate != null ? String(s.daily_rate) : '' })));
        setRemovedSubIds([]);
        const derivedSubName = subNames.find(s => s.bio_data_id === Number(w.bio_data_id));
        setForm({
            ...BLANK(),
            name: w.name, worker_code: w.worker_code, trade: w.trade || '',
            salary_type: w.salary_type, daily_rate: w.daily_rate,
            monthly_salary: w.monthly_salary, description: w.description || '', is_active: w.is_active,
            category_id: w.category_id ? String(w.category_id) : '',
            sub_category_id: w.sub_category_id ? String(w.sub_category_id) : '',
            bio_data_id: w.bio_data_id ? String(w.bio_data_id) : '',
            sub_name_id: derivedSubName ? String(derivedSubName.id) : '',
        });
        setActiveTab('register');
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }

    function cancelEdit() { setForm(BLANK()); setEditId(null); setSubChips([]); setRemovedSubIds([]); setActiveTab('workers'); }
    async function confirmDelete() {
        const { id, name } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            await axiosInstance.delete(`/api/workforce/workers/${id}`);
            setWorkers(ws => ws.filter(w => w.id !== id));
            showToast('ok', `"${name}" moved to Recycle Bin`);
        } catch { showToast('err', 'Delete failed'); }
        setDeleteModal({ open: false, id: 0, name: '', loading: false });
    }

    async function toggleActive(w: Worker) {
        try { await axiosInstance.patch(`/api/workforce/workers/${w.id}/toggle-status`); showToast('ok', `${w.name} ${w.is_active ? 'deactivated' : 'activated'}`); loadAll(); }
        catch { showToast('err', 'Status update failed'); }
    }

    // Same idea, one level down — deactivate/reactivate a single referred
    // sub-name without touching the header worker or their other sub-names.
    async function toggleSubActive(sub: WSubName) {
        setSubToggleBusy(sub.id);
        try {
            await axiosInstance.patch(`/api/workforce/workers/${sub.worker_id}/sub-names/${sub.id}/toggle-status`);
            setAllWSubs(list => list.map(s => s.id === sub.id ? { ...s, is_active: !s.is_active } : s));
            showToast('ok', `"${sub.sub_name}" ${sub.is_active ? 'deactivated' : 'activated'}`);
            setJustToggledSub({ id: sub.id, active: !sub.is_active });
            setTimeout(() => setJustToggledSub(cur => (cur?.id === sub.id ? null : cur)), 2200);
        } catch { showToast('err', 'Associate name status update failed'); }
        finally { setSubToggleBusy(null); }
    }

    function toggleSubRow(workerId: number) {
        if (expandedSubRows.has(workerId)) {
            // Closing — play the shrink/fade-out first, then actually
            // collapse once the animation has had time to finish.
            setClosingSubRows(prev => new Set(prev).add(workerId));
            setTimeout(() => {
                setExpandedSubRows(prev => { const next = new Set(prev); next.delete(workerId); return next; });
                setClosingSubRows(prev => { const next = new Set(prev); next.delete(workerId); return next; });
            }, 200);
        } else {
            setExpandedSubRows(prev => new Set(prev).add(workerId));
        }
    }

    // Indexed once per allWSubs change instead of re-scanning the whole
    // sub-names array for every worker on every keystroke (was O(workers x
    // sub-names) on every render).
    const subNamesByWorker = useMemo(() => {
        const map = new Map<number, string[]>();
        for (const s of allWSubs) {
            const list = map.get(s.worker_id);
            if (list) list.push(s.sub_name.toLowerCase());
            else map.set(s.worker_id, [s.sub_name.toLowerCase()]);
        }
        return map;
    }, [allWSubs]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return workers
            .filter(w => statusFilter === 'all' ? true : statusFilter === 'active' ? w.is_active : !w.is_active)
            .filter(w => !q
                || w.name.toLowerCase().includes(q)
                || w.worker_code.toLowerCase().includes(q)
                || (w.trade || '').toLowerCase().includes(q)
                || (subNamesByWorker.get(w.id) || []).some(name => name.includes(q)));
    }, [workers, statusFilter, search, subNamesByWorker]);
    const [mdPage, setMdPage] = useState(1);
    const [mdPerPage, setMdPerPage] = useState(10);
    const mdTotalPages = Math.max(1, Math.ceil(filtered.length / mdPerPage));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const pagedFiltered = filtered.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);
    const activeCount = workers.filter(w => w.is_active).length;
    const rateVal = form.salary_type === 'monthly' ? form.monthly_salary : form.daily_rate;
    const rateLbl = form.salary_type === 'monthly' ? 'per month' : form.salary_type === 'weekly' ? 'per week' : 'per shift';
    const selectedSubName = subNames.find(s => String(s.id) === form.sub_name_id);
    function rateDisplay(w: Worker) { if (w.salary_type === 'monthly') return { val: `${w.monthly_salary.toLocaleString('en-IN')}`, lbl: '/month' }; if (w.salary_type === 'weekly') return { val: `${w.daily_rate.toLocaleString('en-IN')}`, lbl: '/week' }; return { val: `${w.daily_rate.toLocaleString('en-IN')}`, lbl: '/shift' }; }

    return (
        <div className="ERP-page" ref={rootRef}>
            <style>{ERP_CSS}{CSS}</style>

            {/* ── HEADER START ── */}
            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <div className="ERP-eyebrow">
                        <span className="ERP-eyebrow-line" />
                        <span className="ERP-eyebrow-dot" />
                        Workforce &middot; Manpower Management
                    </div>
                    <h1 className="ERP-title MD-page-title">Manpower <span className="ERP-title-em">Register</span></h1>
                </div>
            </div>
            {/* ── HEADER END ── */}

            <div className="ERP-divider" />

            {/* ── STAT CARDS START ── */}
            <div className="ERP-stats">
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),#60A5FA)' }} />
                    <div className="ERP-stat-label">Total Workers</div>
                    <div className="ERP-stat-val" style={{ color: 'var(--ember)', fontSize: 16, fontWeight: 800 }}>{loading ? '--' : workers.length}</div>
                </div>
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#2563EB,#60A5FA)' }} />
                    <div className="ERP-stat-label">Active Workers</div>
                    <div className="ERP-stat-val" style={{ color: '#2563EB', fontSize: 16, fontWeight: 800 }}>{loading ? '--' : activeCount}</div>
                </div>
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#C47E0A,#3B82F6)' }} />
                    <div className="ERP-stat-label">Associate Names</div>
                    <div className="ERP-stat-val" style={{ color: '#C47E0A', fontSize: 16, fontWeight: 800 }}>{loading ? '--' : allWSubs.filter(s => s.is_active !== false).length}</div>
                </div>
                <div className="ERP-stat">
                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,#60A5FA,var(--ember-mid))' }} />
                    <div className="ERP-stat-label">Trades</div>
                    <div className="ERP-stat-val" style={{ color: '#60A5FA', fontSize: 16, fontWeight: 800 }}>{loading ? '--' : [...new Set(workers.map(w => w.trade).filter(Boolean))].length}</div>
                </div>
            </div>
            {/* ── STAT CARDS END ── */}

            {/* TABS START */}
            <div className="WR-tabs-bar">
                <button className={'WR-tab' + (activeTab === 'register' ? ' active' : '')} onClick={() => { if (!editId) { setForm(BLANK()); setSubChips([]); setRemovedSubIds([]); } setActiveTab('register'); }}>
                    <Ic n="plus" s={13} c="currentColor" />
                    {editId ? 'Edit Worker' : 'Register Worker'}
                    {editId && <span className="WR-tab-badge">Editing #{editId}</span>}
                </button>
                <button className={'WR-tab' + (activeTab === 'workers' ? ' active' : '')} onClick={() => { cancelEdit(); setActiveTab('workers'); }}>
                    <Ic n="workers" s={13} c="currentColor" />
                    Workers
                    <span className="WR-tab-badge">{workers.length}</span>
                </button>
            </div>
            {/* TABS END  */}

            {/* ── TAB: REGISTER ── */}
            {activeTab === 'register' && (
                <div className="WR-reg-grid">
                    <div className="ERP-form-card" ref={formRef} style={{ position: 'relative', overflow: 'visible' }}>
                        <div className="ERP-form-topbar" />

                        {/* Register Start */}
                        <div className="WR-form-header">
                            <div className="WR-form-hdr-icon"><Ic n={editId ? 'edit' : 'plus'} s={20} c="var(--ember)" /></div>
                            <div>
                                <div className="WR-form-hdr-title">{editId ? `Edit Worker #${editId}` : 'Register New Worker'}</div>
                                <div className="WR-form-hdr-desc">{editId ? 'Update worker details and save' : 'Link party master · assign trade · set pay rate'}</div>
                            </div>
                            {editId && (
                                <button type="button" onClick={cancelEdit} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', cursor: 'pointer', background: 'var(--white)' }}>
                                    <Ic n="x" s={11} />Cancel
                                </button>
                            )}
                        </div>
                        {/* Register End */}

                        {/* FORM START */}
                        <form onSubmit={handleSubmit}>
                            <div className="ERP-form-body">

                                <div className="WR-sec"><span className="WR-sec-num">01</span><span className="WR-sec-lbl">Account Mapping</span><div className="WR-sec-rule" /></div>

                                {/* 01 ACCOUNT MAPPING START */}
                                <div className="WR-map-row">
                                    <SDD label="Account Head" required iconName="tag"
                                        options={[...expenseCats].sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ value: String(c.id), label: c.name, badge: 'EXP', badgeColor: 'var(--ember)' }))}
                                        value={form.category_id}
                                        onChange={v => { setF('category_id', v); setF('sub_category_id', ''); setF('bio_data_id', ''); setF('sub_name_id', ''); setF('name', ''); }}
                                        placeholder="Select category" emptyMsg="No categories" />
                                    <SDD label="Account Sub-Head" optional iconName="filter"
                                        options={[...filteredSubs].sort((a, b) => a.name.localeCompare(b.name)).map(s => ({ value: String(s.id), label: s.name }))}
                                        value={form.sub_category_id}
                                        onChange={v => { setF('sub_category_id', v); setF('bio_data_id', ''); setF('sub_name_id', ''); setF('name', ''); }}
                                        placeholder={form.category_id ? 'Select sub-category' : 'Select category first'}
                                        disabled={!form.category_id} emptyMsg="No sub-categories" />
                                    <SDD label="Worker Name (Party Master)" iconName="user"
                                        options={[...filteredBio].sort((a, b) => a.name.localeCompare(b.name)).map(b => ({ value: String(b.id), label: b.name }))}
                                        value={form.bio_data_id}
                                        onChange={v => {
                                            const bio = bioData.find(b => String(b.id) === v);
                                            const subNm = bio ? subNames.find(s => s.bio_data_id === bio.id) : undefined;
                                            setF('bio_data_id', v); setF('name', bio ? bio.name : ''); setF('sub_name_id', subNm ? String(subNm.id) : '');
                                        }}
                                        placeholder={form.category_id ? 'Select worker name' : 'Select category first'}
                                        disabled={!form.category_id} emptyMsg="No party master found" />
                                    <div>
                                        {form.bio_data_id ? (
                                            <>
                                                <label className="ERP-label">Worker Name</label>
                                                <div className="WR-name-card">
                                                    <Ic n="check" s={16} c="#2563EB" />
                                                    <div style={{ flex: 1 }}><div className="WR-name-card-lbl">Name Confirmed</div><div className="WR-name-card-val">{form.name}</div></div>
                                                    <button type="button" title="Clear & type manually"
                                                        onClick={() => { setF('bio_data_id', ''); setF('sub_name_id', ''); setF('name', ''); }}
                                                        style={{ border: 'none', background: 'var(--ember-ghost)', color: 'var(--ember)', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 10.5, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>×</button>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ marginBottom: 14 }}>
                                                <label className="ERP-label">Or Enter Name Manually{editId && <span style={{ color: 'var(--error)', fontSize: 9.5, marginLeft: 2 }}>*</span>}</label>
                                                <input className="ERP-input" placeholder="Worker name" value={form.name} onChange={e => setF('name', e.target.value)} required={!form.bio_data_id} />
                                                <div className="ERP-hint">Select from Party Master, or type manually</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* 01 ACCOUNT MAPPING END */}

                                {/* SUB NAMES START */}
                                <div style={{ marginTop: 4 }}>
                                    <label className="ERP-label">
                                        Associate Names <span className="WR-label-opt">optional — referred / temporary workers</span>
                                        {selectedSubName && <span className="WR-subname-badge ok" style={{ marginLeft: 6 }}>Bio: {selectedSubName.alternate_name}</span>}
                                    </label>
                                    <SubNamesManager
                                        chips={subChips}
                                        suggestions={[...new Set(allWSubs.map(s => s.sub_name))].sort((a, b) => a.localeCompare(b))}
                                        onAdd={name => setSubChips(cs => [...cs, { id: null, name, rate: '' }])}
                                        onRemove={chip => {
                                            setSubChips(cs => cs.filter(c => !(c.name === chip.name && c.id === chip.id)));
                                            if (chip.id !== null) setRemovedSubIds(ids => [...ids, chip.id as number]);
                                        }}
                                        onRateChange={(chip, rate) => {
                                            setSubChips(cs => cs.map(c => (c.name === chip.name && c.id === chip.id) ? { ...c, rate } : c));
                                        }}
                                    />
                                </div>
                                {/* SUB NAMES END */}

                                {/* 02 IDENTITY + 03 TRADE */}
                                <div className="WR-grid-2" style={{ marginTop: 20 }}>

                                    {/* IDENTIFY START */}
                                    <div>
                                        <div className="WR-sec"><span className="WR-sec-num">02</span><span className="WR-sec-lbl">Identity</span><div className="WR-sec-rule" /></div>
                                        <div style={{ marginBottom: 14 }}>
                                            <label className="ERP-label">Worker Code <span className="ERP-label-opt">auto-generated if blank</span></label>
                                            <input className="ERP-input" placeholder="Auto-generated" value={form.worker_code} onChange={e => setF('worker_code', e.target.value)} />
                                            <div className="ERP-hint">Leave blank to auto-assign</div>
                                        </div>
                                    </div>
                                    {/* IDENTIFY END */}

                                    {/* TRADE START */}
                                    <div>
                                        <div className="WR-sec"><span className="WR-sec-num">03</span><span className="WR-sec-lbl">Skill / Trade</span><div className="WR-sec-rule" /></div>
                                        <div style={{ marginBottom: 4 }}>
                                            <label className="ERP-label">Trade <span className="ERP-label-opt">optional</span></label>
                                            <SkillCombo value={form.trade || ''} onChange={v => setF('trade', v)} extraSkills={apiSkills} />
                                            <div className="ERP-hint" style={{ marginTop: 6 }}>28 civil trades · type to search · custom entry supported</div>
                                        </div>
                                    </div>
                                    {/* TRADE END */}
                                </div>
                                {/* 02 IDENTIFY +  03 TRADE */}

                                {/* 04 PAY + 05 REMARKS */}
                                <div className="WR-grid-2" style={{ marginTop: 20 }}>
                                    <div>
                                        <div className="WR-sec"><span className="WR-sec-num">04</span><span className="WR-sec-lbl">Pay Type &amp; Rate</span><div className="WR-sec-rule" /></div>

                                        {/* PAY START */}
                                        <div className="WR-pay-grid">
                                            {PAY_TYPES.map(pt => (
                                                <button key={pt.id} type="button"
                                                    className={'WR-pay-card' + (form.salary_type === pt.id ? ' sel' : '')}
                                                    style={form.salary_type === pt.id ? { borderColor: pt.color, boxShadow: `0 4px 16px ${pt.bg}` } : {}}
                                                    onClick={() => setF('salary_type', pt.id)}>
                                                    <div className="WR-pay-icon" style={{ background: pt.bg, border: `1.5px solid ${pt.bd}` }}>
                                                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={pt.color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d={pt.path} /></svg>
                                                    </div>
                                                    <span className="WR-pay-lbl" style={form.salary_type === pt.id ? { color: pt.color } : {}}>{pt.label}</span>
                                                    <span className="WR-pay-hint">{pt.hint}</span>
                                                    <span className="WR-pay-chk" style={{ background: pt.color }}><svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                                                </button>
                                            ))}
                                        </div>
                                        {/* PAY END */}

                                        {/* Label Start */}
                                        <label className="ERP-label">
                                            {form.salary_type === 'monthly' ? 'Monthly Salary' : form.salary_type === 'weekly' ? 'Weekly Rate' : 'Daily Rate (per shift)'}
                                            <span style={{ color: 'var(--error)', fontSize: 9.5, marginLeft: 3 }}>*</span>
                                        </label>
                                        {/* Label End */}

                                        {/* RS Start */}
                                        <div className="WR-rate-wrap">
                                            <span className="WR-rate-pfx">Rs</span>
                                            <input type="number" className="WR-rate-inp" min="0" step="50" placeholder="0"
                                                value={rateVal || ''}
                                                onChange={e => setF(form.salary_type === 'monthly' ? 'monthly_salary' : 'daily_rate', e.target.value)} required />
                                            <div className="WR-rate-tag">
                                                <span className="WR-rate-tag-lbl">{rateLbl}</span>
                                                {form.salary_type === 'monthly' && rateVal > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)' }}>≈ Rs.{Math.round(Number(rateVal) / 26)}/shift</span>}
                                            </div>
                                        </div>
                                        {/* RS End */}
                                    </div>

                                    {/* REMARKS START */}
                                    <div>
                                        <div className="WR-sec"><span className="WR-sec-num">05</span><span className="WR-sec-lbl">Remarks</span><div className="WR-sec-rule" /></div>
                                        <div style={{ marginBottom: editId ? 14 : 0 }}>
                                            <label className="ERP-label">Description <span className="ERP-label-opt">optional</span></label>
                                            <textarea className="ERP-textarea" rows={4} placeholder="Remarks" value={form.description || ''} onChange={e => setF('description', e.target.value)} />
                                        </div>
                                        {editId && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--off-white)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 1, flex: 1 }}>WORKER STATUS</span>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={form.is_active} onChange={e => setF('is_active', e.target.checked)} />
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: form.is_active ? '#2563EB' : 'var(--text-4)', fontWeight: 800 }}>{form.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    {/* REMARKS END */}
                                </div>
                                {/* 04 PAY & 05 REMARKS END  */}
                            </div>

                            {/* Cancel Button Start */}
                            <div className="WR-form-footer">
                                <button type="button" className="WR-cancel-btn" onClick={cancelEdit}>
                                    Cancel
                                </button>
                                <button type="submit" className={'WR-submit-btn' + (editId ? ' WR-update-btn' : '')} disabled={saving}>
                                    {saving ? 'Saving...' : editId ? 'Update Worker' : 'Register Worker'}
                                </button>
                            </div>
                            {/* Cancel Button End */}

                        </form>
                        {/* FORM END */}
                    </div>

                    {/* ── LIVE WORKER PREVIEW START ── */}
                    <aside className="WR-preview">

                        {/* Preview Top Start */}
                        <div className="WR-prev-top">
                            <div className="WR-prev-avatar">
                                {(form.name.trim().split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()) || 'W'}
                            </div>
                            <div className="WR-prev-name">{form.name.trim() || 'New Worker'}</div>
                            <div className="WR-prev-trade">{form.trade || 'Trade not assigned'}</div>
                        </div>
                        {/* Preview Top End */}

                        {/* Prieview Body Start */}
                        <div className="WR-prev-body">
                            {/* Pay Type Start */}
                            <div className="WR-prev-row">
                                <span className="WR-prev-k">Pay Type</span>
                                <span className={'WR-pay-badge ' + form.salary_type}>{form.salary_type}</span>
                            </div>
                            {/* Pay Type End */}

                            {/* Total Start */}
                            <div className="WR-prev-row">
                                <span className="WR-prev-k">{form.salary_type === 'monthly' ? 'Salary' : 'Rate'}</span>
                                <span>
                                    <span className="WR-prev-rate">₹{Number(rateVal || 0).toLocaleString('en-IN')}</span>
                                    <span className="WR-prev-rate-lbl">{rateLbl}</span>
                                </span>
                            </div>
                            {/* Total End */}

                            {/* Category Start */}
                            <div className="WR-prev-row">
                                <span className="WR-prev-k">Account Head</span>
                                <span className="WR-prev-v">
                                    {form.category_id
                                        ? (categories.find(c => String(c.id) === form.category_id)?.name ?? '—')
                                        : <span className="WR-prev-empty">not mapped</span>}
                                </span>
                            </div>
                            {/* Category End */}

                            {/* Worker Code Start */}
                            <div className="WR-prev-row">
                                <span className="WR-prev-k">Worker Code</span>
                                <span className="WR-prev-v" style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5 }}>
                                    {form.worker_code.trim() || <span className="WR-prev-empty">auto-generated</span>}
                                </span>
                            </div>
                            {/* Worker Code End */}

                            {/* Associate Name Start */}
                            <div className="WR-prev-row">
                                <span className="WR-prev-k">Associate Names</span>
                                {subChips.length > 0 ? (
                                    <span className="WR-prev-chips">
                                        {subChips.map(c => <span key={c.id ?? `p-${c.name}`} className="WR-tbl-subchip">↳ {c.name}</span>)}
                                    </span>
                                ) : <span className="WR-prev-empty">none added</span>}
                            </div>
                            {/* Associate Name End */}

                            {/* Status Start */}
                            <div className="WR-prev-row">
                                <span className="WR-prev-k">Status</span>
                                <span>
                                    <span className={'WR-status-dot ' + (form.is_active ? 'active' : 'inactive')} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, color: form.is_active ? '#2563EB' : 'var(--text-4)' }}>
                                        {form.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </span>
                            </div>
                            {/* Status End */}
                        </div>
                        {/* Preview Body End */}

                        {/* Preview Footer Start */}
                        <div className="WR-prev-foot">
                            <span className="WR-prev-pulse" />
                            Live preview — updates as you type
                        </div>
                        {/* Preview Footer End */}

                    </aside>
                    {/* LIVE PREVIEW WORKER END  */}
                </div>
            )}

            {/* ── TAB: WORKERS START ── */}
            {activeTab === 'workers' && (
                <div className="WR-tbl-card">

                    {/* Registered Workers Start */}
                    <div className="WR-tbl-header">
                        <div className="WR-tbl-title">Registered Workers</div>
                        <div className="WR-tbl-actions">
                            {/* Action Button Start */}
                            <div className="WR-seg">
                                {/* All Button Start */}
                                <button className={'WR-seg-btn' + (statusFilter === 'all' ? ' on' : '')} onClick={() => setStatusFilter('all')}>
                                    All <span className="WR-seg-count">{workers.length}</span>
                                </button>
                                {/* All Button End */}

                                {/* Active Button Start */}
                                <button className={'WR-seg-btn' + (statusFilter === 'active' ? ' on' : '')} onClick={() => setStatusFilter('active')}>
                                    Active <span className="WR-seg-count">{activeCount}</span>
                                </button>
                                {/* Active Button End */}

                                {/* Inactive Button Start */}
                                <button className={'WR-seg-btn' + (statusFilter === 'inactive' ? ' on' : '')} onClick={() => setStatusFilter('inactive')}>
                                    Inactive <span className="WR-seg-count">{workers.length - activeCount}</span>
                                </button>
                                {/* Inactive Button End */}
                            </div>
                            {/* Action Button End */}

                            {/* Search Start */}
                            <div className="WR-search-wrap">
                                <Ic n="search" s={13} c="var(--text-4)" />
                                <input className="WR-search" placeholder="Search name, associate name, trade, code" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            {/* Search End */}
                        </div>
                    </div>
                    {/* Registerd Workers End */}

                    {loading ? (
                        <div className="WR-loader">
                            <RunningLoader label="Loading Workers" />
                            <div className="WR-skel-rows">
                                {[0, 1, 2, 3].map(i => (
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

                    ) : filtered.length === 0 ? (
                        <div className="WR-empty">
                            <div className="WR-empty-icon">👷</div>
                            <div className="WR-empty-text">{search ? 'No match found' : 'No workers registered yet'}</div>
                            {!search && <button onClick={() => setActiveTab('register')} style={{ marginTop: 8, padding: '8px 20px', borderRadius: 8, border: '1.5px solid var(--ember)', background: 'var(--ember-ghost)', color: 'var(--ember)', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>Register First Worker</button>}
                        </div>
                    ) : (

                        <div className="WR-table-wrap">
                            {/* Table Start */}
                            <table className="WR-table">

                                {/* Thead Start */}
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Account Head</th>
                                        <th>Account Sub-Head</th>
                                        <th>Worker Name</th>
                                        <th>Associate Names</th>
                                        <th>Trade</th>
                                        <th>Pay Type</th>
                                        <th>Rate</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                {/* Thead End */}

                                {/* Tbody Start */}
                                <tbody>
                                    {pagedFiltered.map((w, i) => {
                                        const rd = rateDisplay(w);
                                        return (
                                            <tr key={w.id} className={w.is_active ? '' : 'inactive'} style={{ animationDelay: `${Math.min(i, 20) * 22}ms` }}>
                                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', textAlign: 'center', width: 44 }}>{(mdSafePage - 1) * mdPerPage + i + 1}</td>
                                                <td>{w.category_id ? <span className="WR-cat-pill"><Ic n="folder" s={9} c="var(--ember)" />{getCatName(w)}</span> : <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>}</td>
                                                <td>{w.sub_category_id ? <span className="WR-subcat-pill">{getSubCatName(w)}</span> : <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>}</td>
                                                <td><div className="WR-name">{w.name}</div><div className="WR-code">{w.worker_code}</div></td>
                                                <td>
                                                    {(() => {
                                                        // Removed associate names must not resurface here at all — not
                                                        // even in a strikethrough "Inactive" group — so this list is
                                                        // scoped to active sub-names only.
                                                        const subs = allWSubs.filter(s => s.worker_id === w.id && s.is_active !== false);
                                                        if (subs.length === 0) return <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>;
                                                        const activeSubs = subs;
                                                        const inactiveSubs: WSubName[] = [];
                                                        const expanded = expandedSubRows.has(w.id);
                                                        const closing = closingSubRows.has(w.id);
                                                        const hiddenCount = subs.length - 2;
                                                        // Sequential 1,2,3… numbering across the whole list (active +
                                                        // inactive, in original order) so the count stays stable and
                                                        // easy to scan regardless of which rows are shown/hidden.
                                                        const numberOf = new Map(subs.map((s, idx) => [s.id, idx + 1]));

                                                        if (!expanded) {
                                                            return (
                                                                <div style={{ maxWidth: 175, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                                                                    {activeSubs.slice(0, 2).map(s => (
                                                                        <span key={s.id} className="WR-tbl-subchip"><span className="WR-tbl-subnum">{numberOf.get(s.id)}</span>{s.sub_name}</span>
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        className={`WR-tbl-subchip toggle${hiddenCount > 0 ? ' more' : ''}`}
                                                                        onClick={() => toggleSubRow(w.id)}
                                                                        title="View / manage all associate names"
                                                                    >
                                                                        {hiddenCount > 0 ? `+${hiddenCount} more` : <Ic n="chevD" s={9} c="currentColor" />}
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div className={`WR-tbl-sub-expanded${closing ? ' closing' : ''}`}>
                                                                <div className="WR-tbl-sub-hdr">
                                                                    <span className="WR-tbl-sub-hdr-lbl"><Ic n="users" s={11} c="var(--ember)" />Associate Names <span className="WR-tbl-sub-hdr-count">{subs.length}</span></span>
                                                                    <button type="button" className="WR-tbl-sub-close" onClick={() => toggleSubRow(w.id)} title="Close" aria-label="Close">
                                                                        <Ic n="x" s={11} c="currentColor" />
                                                                    </button>
                                                                </div>

                                                                {activeSubs.length > 0 && (
                                                                    <div className="WR-tbl-sub-group">
                                                                        <div className="WR-tbl-sub-group-lbl">Active</div>
                                                                        {activeSubs.map(s => (
                                                                            <div key={s.id} className="WR-tbl-sub-row">
                                                                                <span className="WR-tbl-subchip big"><span className="WR-tbl-subnum">{numberOf.get(s.id)}</span>{s.sub_name}</span>
                                                                                {justToggledSub?.id === s.id ? (
                                                                                    <span className="WR-tbl-sub-msg deact"><Ic n="check" s={9} c="currentColor" /> Deactivated!</span>
                                                                                ) : (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="WR-tbl-sub-toggle deact icon-only"
                                                                                        disabled={subToggleBusy === s.id}
                                                                                        onClick={() => toggleSubActive(s)}
                                                                                        title={`Deactivate ${s.sub_name}`}
                                                                                        aria-label={`Deactivate ${s.sub_name}`}
                                                                                    >
                                                                                        <Ic n="power" s={13} c="currentColor" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {inactiveSubs.length > 0 && (
                                                                    <div className="WR-tbl-sub-group">
                                                                        <div className="WR-tbl-sub-group-lbl inactive">Inactive</div>
                                                                        {inactiveSubs.map(s => (
                                                                            <div key={s.id} className="WR-tbl-sub-row inactive">
                                                                                <span className="WR-tbl-subchip big inactive"><span className="WR-tbl-subnum">{numberOf.get(s.id)}</span>{s.sub_name}</span>
                                                                                {justToggledSub?.id === s.id ? (
                                                                                    <span className="WR-tbl-sub-msg act"><Ic n="check" s={9} c="currentColor" /> Activated!</span>
                                                                                ) : (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="WR-tbl-sub-toggle act icon-only"
                                                                                        disabled={subToggleBusy === s.id}
                                                                                        onClick={() => toggleSubActive(s)}
                                                                                        title={`Activate ${s.sub_name}`}
                                                                                        aria-label={`Activate ${s.sub_name}`}
                                                                                    >
                                                                                        <Ic n="check" s={12} c="currentColor" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                <button type="button" className="WR-tbl-sub-collapse" onClick={() => toggleSubRow(w.id)}>
                                                                    Show less <Ic n="chevD" s={9} c="currentColor" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                <td>{w.trade ? <span className="WR-skill-badge">{w.trade}</span> : <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>—</span>}</td>
                                                <td><span className={'WR-pay-badge ' + w.salary_type}>{w.salary_type}</span></td>
                                                <td><div className="WR-rate">Rs.{rd.val}</div><div className="WR-rate-lbl">{rd.lbl}</div></td>

                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                        <span>

                                                            <span className={'WR-status-dot ' + (w.is_active ? 'active' : 'inactive')} />
                                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: w.is_active ? '#2563EB' : 'var(--text-4)' }}>{w.is_active ? 'Active' : 'Inactive'}</span>
                                                        </span>
                                                        {w.is_active ? (
                                                            <button className="WR-st-btn deact" onClick={() => toggleActive(w)} title="Worker left — mark inactive">
                                                                <Ic n="power" s={11} c="currentColor" /> Deactivate
                                                            </button>
                                                        ) : (
                                                            <button className="WR-st-btn act" onClick={() => toggleActive(w)} title="Worker returned — mark active">
                                                                <Ic n="check" s={11} c="currentColor" /> Activate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Center Button Start */}
                                                <td style={{ textAlign: 'center' }}>
                                                    <div className="WR-tbl-act" style={{ justifyContent: 'center' }}>
                                                        <button className="WR-act-btn" onClick={() => startEdit(w)} title="Edit"><Ic n="edit" s={14} c="currentColor" /></button>
                                                        {canDelete(userRole) ? (
                                                            <button className="WR-act-btn del" onClick={() => setDeleteModal({ open: true, id: w.id, name: w.name, loading: false })} title="Move to Recycle Bin"><Ic n="trash" s={14} c="currentColor" /></button>
                                                        ) : (
                                                            <CreatorBadge name={w.created_by_name} />
                                                        )}
                                                    </div>
                                                </td>
                                                {/* Center Button End */}

                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {/* Tbody End */}
                            </table>
                            {/* Table End */}
                        </div>
                    )}
                    {!loading && filtered.length > 0 && (
                        <Pagination
                            page={mdSafePage}
                            totalPages={mdTotalPages}
                            onPageChange={setMdPage}
                            total={filtered.length}
                            perPage={mdPerPage}
                            onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                            itemLabel="workers"
                        />
                    )}
                </div>
            )}
            {/* ── TAB: WORKERS START ── */}

            {/* DELETE MODAL START */}
            <ConfirmDeleteModal
                open={deleteModal.open}
                itemName={deleteModal.name}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: 0, name: '', loading: false })}
                loading={deleteModal.loading}
            />
            {/* DELETE MODAL END  */}

        </div>
    )
}
