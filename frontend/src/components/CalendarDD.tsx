import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { markPanelOpen, markPanelClosed, useDropdownTriggerKeyDown } from '../utils/keyboardNav';

export const today = (): string => new Date().toISOString().slice(0, 10);

const CAL_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseYMD(s: string): Date { const [y, m, d] = (s || today()).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); }
function toYMD(d: Date): string { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${day}`; }
function fmtCalDisplay(s: string): string { if (!s) return ''; const d = parseYMD(s); return `${String(d.getDate()).padStart(2, '0')} ${CAL_MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; }

export interface CalendarDDProps {
    value: string;
    onChange: (v: string) => void;
    min?: string;
    max?: string;
    icon?: React.ReactNode;
    placeholder?: string;
}

export function CalendarDD({ value, onChange, min, max, icon, placeholder = 'Select date' }: CalendarDDProps) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [viewDate, setViewDate] = useState(() => parseYMD(value));
    const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);
    const [monthPick, setMonthPick] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const dayGridRef = useRef<HTMLDivElement>(null);
    const monthGridRef = useRef<HTMLDivElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!wrapRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => { if (!open) setMonthPick(false); }, [open]);

    useLayoutEffect(() => {
        if (!open || !wrapRef.current) { setPanelPos(null); return; }
        const reposition = () => {
            if (!wrapRef.current) return;
            const r = wrapRef.current.getBoundingClientRect();
            const pw = 236, mg = 8;
            let lx = r.left;
            if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
            if (lx < mg) lx = mg;

            const ph = panelRef.current?.offsetHeight || (monthPick ? 236 : 306);
            const spaceBelow = window.innerHeight - r.bottom - mg;
            const spaceAbove = r.top - mg;
            let top: number;
            if (ph <= spaceBelow || spaceBelow >= spaceAbove) {
                top = Math.min(r.bottom + 6, window.innerHeight - ph - mg);
            } else {
                top = r.top - ph - 6;
            }
            top = Math.max(mg, top);

            setPanelPos({
                position: 'fixed', left: lx, top, width: pw, zIndex: 2147483647,
                maxHeight: window.innerHeight - mg * 2, overflowY: 'auto',
            });
        };
        
        reposition();
        const raf = requestAnimationFrame(reposition);
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open, monthPick]);

    useEffect(() => { if (open) setViewDate(parseYMD(value)); }, [open]);

    const minD = min ? parseYMD(min) : null;
    const maxD = max ? parseYMD(max) : null;
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const todayYMD = today();
    const isDisabled = (d: Date) => (!!minD && d < minD) || (!!maxD && d > maxD);

    useEffect(() => {
        if (!open) return;

        const focusInitial = () => {
            const grid = monthPick ? monthGridRef.current : dayGridRef.current;
            if (!grid) return false;
            const sel = grid.querySelector<HTMLButtonElement>('button.sel:not([disabled])');
            const today_ = grid.querySelector<HTMLButtonElement>('button.today:not([disabled])');
            const first = grid.querySelector<HTMLButtonElement>('button:not([disabled])');
            (sel || today_ || first)?.focus();
            return !!(sel || today_ || first);
        };
        let raf = 0;
        if (!focusInitial()) raf = requestAnimationFrame(focusInitial);

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                fieldRef.current?.focus();
                return;
            }
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
            const active = document.activeElement as HTMLElement | null;

            if (monthPick) {
                const grid = monthGridRef.current;
                if (!grid || !active || !grid.contains(active)) return;
                const btns = Array.from(grid.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
                const idx = btns.indexOf(active as HTMLButtonElement);
                if (idx === -1) return;
                const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -4 : 4;
                const next = btns[idx + delta];
                if (next) { e.preventDefault(); next.focus(); }
                return;
            }

            const grid = dayGridRef.current;
            if (!grid || !active || !grid.contains(active)) return;
            const curIdx = Number((active as HTMLElement).dataset.calIdx);
            if (Number.isNaN(curIdx)) return;
            const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -7 : 7;
            const next = grid.querySelector<HTMLButtonElement>(`button[data-cal-idx="${curIdx + delta}"]:not([disabled])`);
            if (next) { e.preventDefault(); next.focus(); }
        };

        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [open, monthPick, year, month]);

    return (
        <div className="ERP-cal-wrap" ref={wrapRef}>
            <div className="ERP-cal-field" ref={fieldRef} tabIndex={0} role="button" aria-haspopup="dialog" aria-expanded={open}
                onClick={() => setOpen(v => !v)} onKeyDown={onTriggerKeyDown} style={{ cursor: 'pointer' }}>
                {icon ?? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
                )}
                <span className="ERP-cal-val">{value ? fmtCalDisplay(value) : placeholder}</span>
            </div>

            {open && panelPos && createPortal(
                <div ref={el => { panelRef.current = el; }} className="ERP-cal-panel" style={panelPos}>
                    <div className="ERP-cal-hdr">
                        {!monthPick && (
                            <button className="ERP-cal-nav" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                        )}
                        <button className="ERP-cal-title-btn" onClick={() => setMonthPick(v => !v)}>
                            {monthPick ? 'Jump to…' : `${CAL_MONTHS[month]} ${year}`}
                            <svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor" style={{ marginLeft: 5, transform: monthPick ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {!monthPick && (
                            <button className="ERP-cal-nav" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        )}
                    </div>

                    {monthPick ? (
                        <div className="ERP-cal-mpick">
                            <div className="ERP-cal-mpick-yr">
                                <button className="ERP-cal-nav" onClick={() => setViewDate(new Date(year - 1, month, 1))}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <span className="ERP-cal-mpick-yr-val">{year}</span>
                                <button className="ERP-cal-nav" onClick={() => setViewDate(new Date(year + 1, month, 1))}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 18l6-6-6-6" /></svg>
                                </button>
                            </div>
                            <div className="ERP-cal-mpick-grid" ref={monthGridRef}>
                                {CAL_MONTHS.map((m, i) => (
                                    <button key={m} className={`ERP-cal-mpick-btn${i === month ? ' sel' : ''}`}
                                        onClick={() => { setViewDate(new Date(year, i, 1)); setMonthPick(false); }}>
                                        {m.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="ERP-cal-week">{CAL_WEEKDAYS.map(w => <span key={w}>{w}</span>)}</div>
                            <div className="ERP-cal-grid" ref={dayGridRef}>
                                {cells.map((d, i) => {
                                    if (!d) return <span key={i} className="ERP-cal-day empty" />;
                                    const ymd = toYMD(d);
                                    const disabled = isDisabled(d);
                                    const isToday = ymd === todayYMD;
                                    const isSel = ymd === value;
                                    return (
                                        <button key={i} className={`ERP-cal-day${isSel ? ' sel' : ''}${isToday && !isSel ? ' today' : ''}`}
                                            disabled={disabled} data-cal-idx={i}
                                            onClick={() => { onChange(ymd); setOpen(false); }}>
                                            {d.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="ERP-cal-footer">
                        <button className="ERP-cal-today-btn" onClick={() => { const t = today(); setMonthPick(false); if (!isDisabled(parseYMD(t))) { onChange(t); setOpen(false); } else { setViewDate(parseYMD(t)); } }}>Today</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default CalendarDD;