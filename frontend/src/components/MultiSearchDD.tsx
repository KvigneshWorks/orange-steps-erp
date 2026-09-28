import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { markPanelOpen, markPanelClosed, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';

export interface MultiSearchDDOpt { value: string; label: string; }

interface MultiSearchDDProps {
    options: MultiSearchDDOpt[];
    value: string[];
    onChange: (vals: string[]) => void;
    placeholder: string;
    disabled?: boolean;
    label?: string;
    emptyMsg?: string;
}

/* ──────────────────────────────────────
   MultiSearchDD — a searchable, portal-rendered multi-select dropdown.
   Same trigger/panel/checkbox pattern already used for sub-category
   pickers elsewhere in the app (Daybook's income filter), extracted here
   as a shared component so any page needing a proper "N selected"
   dropdown instead of an always-expanded checkbox grid can reuse it.
───────────────────────────────────────── */
export default function MultiSearchDD({ options, value, onChange, placeholder, disabled = false, label, emptyMsg = 'No results' }: MultiSearchDDProps) {
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
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input autoComplete="off" ref={inputRef} className="SDD-search" placeholder="Search…"
                    value={query} onChange={e => setQuery(e.target.value)} />
                {query && (
                    <button type="button" className="SDD-clr" onClick={() => setQuery('')}>
                        <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
            <div className="SDD-multi-actions">
                <button type="button" onClick={selectAll}>Select all</button>
                <span>·</span>
                <button type="button" onClick={clearAll}>Clear</button>
                {value.length > 0 && <span className="SDD-multi-count">{value.length} selected</span>}
            </div>
            <div className="SDD-list">
                {filtered.length === 0
                    ? (
                        <div className="SDD-empty">
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            {emptyMsg}
                        </div>
                    )
                    : filtered.map(opt => {
                        const sel = value.includes(opt.value);
                        return (
                            <div key={opt.value}
                                role="option" tabIndex={-1} aria-selected={sel}
                                className={`SDD-item SDD-multi-item${sel ? ' sel' : ''}`}
                                onClick={() => toggleVal(opt.value)}>
                                <span className="SDD-multi-item-lbl">{opt.label}</span>
                                <span className={`SDD-checkbox${sel ? ' on' : ''}`}>
                                    {sel && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#faf9f7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>}
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
                {label && <label className="ERP-label req">{label}</label>}
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
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l7 7 7-7" /></svg>
                    </span>
                </button>
                {panel}
            </div>
        </>
    );
}
