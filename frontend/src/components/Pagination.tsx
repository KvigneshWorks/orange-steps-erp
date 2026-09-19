import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { markPanelOpen, markPanelClosed, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';

export default function Pagination({
    page,
    totalPages,
    onPageChange,
    total,
    perPage,
    onPerPageChange,
    perPageOptions = [10, 15, 25, 50],
    itemLabel = 'records',
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    total: number;
    perPage: number;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    itemLabel?: string;
}) {
    // A proper floating, portal-rendered "per page" menu — same pattern as
    // every other custom dropdown in the app (see CalendarDD) — instead of
    // a bare native <select>, so it gets a styled option list, a checkmark
    // on the active value, and an entrance animation instead of the
    // browser's own unstyled popup. Hooks run unconditionally (before the
    // totalPages<=1 early-return below) per the rules of hooks.
    const [ddOpen, setDdOpen] = useState(false);
    const ddTriggerRef = useRef<HTMLButtonElement>(null);
    const ddPanelRef = useRef<HTMLDivElement | null>(null);
    const [ddPos, setDdPos] = useState<{ top: number; left: number; width: number } | null>(null);

    useEffect(() => {
        if (ddOpen) { markPanelOpen(); return () => markPanelClosed(); }
    }, [ddOpen]);

    useDropdownPanelArrowNav(ddOpen, setDdOpen, ddPanelRef, ddTriggerRef, { optionSelector: '[role="option"]' });
    const onDdTriggerKeyDown = useDropdownTriggerKeyDown(ddOpen, setDdOpen);

    useEffect(() => {
        if (!ddOpen) return;
        const h = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!ddTriggerRef.current?.contains(t) && !ddPanelRef.current?.contains(t)) setDdOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [ddOpen]);

    useLayoutEffect(() => {
        if (!ddOpen || !ddTriggerRef.current) return;
        const reposition = () => {
            if (!ddTriggerRef.current) return;
            const r = ddTriggerRef.current.getBoundingClientRect();
            const pw = Math.max(r.width, 92);
            const ph = perPageOptions.length * 34 + 10;
            const mg = 8;
            let top = r.bottom + 6;
            if (top + ph > window.innerHeight - mg) top = Math.max(mg, r.top - ph - 6);
            let left = r.left;
            if (left + pw > window.innerWidth - mg) left = window.innerWidth - pw - mg;
            setDdPos({ top, left, width: pw });
        };
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [ddOpen, perPageOptions.length]);

    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    const WINDOW = 5;
    const nums: number[] = [];
    if (totalPages <= WINDOW) {
        for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
        let from = Math.max(1, page - 2);
        let to = Math.min(totalPages, from + WINDOW - 1);
        from = Math.max(1, to - WINDOW + 1);
        for (let i = from; i <= to; i++) nums.push(i);
    }

    const ChevronDouble = ({ flip }: { flip?: boolean }) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={flip ? { transform: 'rotate(180deg)' } : undefined}>
            <path d="M18.5 17 12 12l6.5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 17 5 12l6.5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const Chevron = ({ flip }: { flip?: boolean }) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={flip ? { transform: 'rotate(180deg)' } : undefined}>
            <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <div className="ERP-pg">
            <span className="ERP-pg-info">
                <span className="ERP-pg-info-range"><strong>{start}</strong>&ndash;<strong>{end}</strong></span>
                <span className="ERP-pg-info-of">of</span>
                <strong>{total}</strong> {itemLabel}
                <span className="ERP-pg-info-sep" aria-hidden="true" />
                <span className="ERP-pg-info-page">Page <strong>{page}</strong> of {totalPages}</span>
            </span>

            {totalPages > 1 && (
            <div className="ERP-pg-btns">
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === 1}
                    onClick={() => onPageChange(1)}
                    aria-label="First page"
                    title="First page"
                >
                    <ChevronDouble />
                </button>
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                    title="Previous page"
                >
                    <Chevron />
                </button>

                {nums[0] > 1 && <span className="ERP-pg-ellipsis">&hellip;</span>}
                {nums.map(n => (
                    <button
                        type="button"
                        key={n}
                        className={`ERP-pg-btn${n === page ? ' on' : ''}`}
                        onClick={() => onPageChange(n)}
                        aria-current={n === page ? 'page' : undefined}
                    >
                        <span className="ERP-pg-btn-num">{n}</span>
                    </button>
                ))}
                {nums[nums.length - 1] < totalPages && <span className="ERP-pg-ellipsis">&hellip;</span>}

                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                    title="Next page"
                >
                    <Chevron flip />
                </button>
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(totalPages)}
                    aria-label="Last page"
                    title="Last page"
                >
                    <ChevronDouble flip />
                </button>
            </div>
            )}

            {onPerPageChange && (
                <div className="ERP-pg-per">
                    <span>Show</span>
                    <div className="ERP-pg-per-wrap">
                        <button
                            type="button"
                            ref={ddTriggerRef}
                            className={`ERP-pg-per-dd${ddOpen ? ' open' : ''}`}
                            onClick={() => setDdOpen(o => !o)}
                            onKeyDown={onDdTriggerKeyDown}
                            aria-haspopup="listbox"
                            aria-expanded={ddOpen}
                        >
                            <span className="ERP-pg-per-dd-val">{perPage}</span>
                            <svg className="ERP-pg-per-chev" width="9" height="9" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {ddOpen && ddPos && createPortal(
                            <div
                                ref={ddPanelRef}
                                className="ERP-pg-per-panel"
                                role="listbox"
                                aria-label="Rows per page"
                                style={{ top: ddPos.top, left: ddPos.left, minWidth: ddPos.width }}
                            >
                                {perPageOptions.map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        role="option"
                                        aria-selected={n === perPage}
                                        className={`ERP-pg-per-opt${n === perPage ? ' sel' : ''}`}
                                        onClick={() => { onPerPageChange(n); setDdOpen(false); ddTriggerRef.current?.focus(); }}
                                    >
                                        <span>{n}</span>
                                        {n === perPage && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>,
                            document.body
                        )}
                    </div>
                    <span>per page</span>
                </div>
            )}
        </div>
    );
}
