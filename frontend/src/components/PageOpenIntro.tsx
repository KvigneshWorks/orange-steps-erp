import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

type Phase = 'idle' | 'walking' | 'falling' | 'exiting' | 'done';

const WALK_MS = 1500;
const FALL_MS = 620;
const EXIT_MS = 260;

export default function PageOpenIntro({
    containerRef,
    label = 'Opening…',
    ready = true,
    confineToContainer = false,
}: {
    containerRef: RefObject<HTMLElement | null>;
    label?: string;
    ready?: boolean;
    confineToContainer?: boolean;
}) {
    const [phase, setPhase] = useState<Phase>(ready ? 'walking' : 'idle');
    const [bounds, setBounds] = useState<{ left: number; width: number; top?: number; height?: number } | null>(null);
    useLayoutEffect(() => {
        if (ready) setPhase(p => (p === 'idle' ? 'walking' : p));
    }, [ready]);

    useLayoutEffect(() => {
        if (phase === 'idle' || phase === 'done') return;
        const measure = () => {
            const el = containerRef.current;
            if (el) {
                const r = el.getBoundingClientRect();
                setBounds(confineToContainer
                    ? { left: r.left, width: r.width, top: r.top, height: r.height }
                    : { left: r.left, width: r.width });
            }
        };
        measure();
        const t = setTimeout(measure, 60);
        window.addEventListener('resize', measure);
        return () => { clearTimeout(t); window.removeEventListener('resize', measure); };
    }, [containerRef, phase === 'idle', confineToContainer]);

    useEffect(() => {
        if (phase !== 'walking') return;
        const t = setTimeout(() => setPhase('falling'), WALK_MS);
        return () => clearTimeout(t);
    }, [phase]);
    useEffect(() => {
        if (phase !== 'falling') return;
        const t = setTimeout(() => setPhase('exiting'), FALL_MS);
        return () => clearTimeout(t);
    }, [phase]);
    useEffect(() => {
        if (phase !== 'exiting') return;
        const t = setTimeout(() => setPhase('done'), EXIT_MS);
        return () => clearTimeout(t);
    }, [phase]);

    if (phase === 'done' || phase === 'idle') return null;

    const style: React.CSSProperties = bounds
        ? {
            left: bounds.left, width: bounds.width,
            ...(confineToContainer && bounds.top != null
                ? { top: bounds.top, height: bounds.height, bottom: 'auto' }
                : {}),
        }
        : { left: 0, right: 0 };

    return (
        <div
            className={'DBI-overlay' + (phase === 'exiting' ? ' exiting' : '')}
            style={style}
        >
            <div className="DBI-track">
                <div className={'DBI-runner' + (phase === 'falling' || phase === 'exiting' ? ' falling' : '')}>
                    <svg width="94" height="102" viewBox="-35 0 100 83" fill="none" style={{ overflow: 'visible' }}>
                        <g className="DBI-lines" opacity="0.55" stroke="var(--ember-light,#F0834D)" strokeWidth="3.1" strokeLinecap="round">
                            <line className="RL-line l1" x1="-30" y1="32.5" x2="-10" y2="32.5" />
                            <line className="RL-line l2" x1="-25" y1="42.5" x2="-10" y2="42.5" />
                            <line className="RL-line l3" x1="-20" y1="52.5" x2="-10" y2="52.5" />
                        </g>
                        <g className="DBI-figure">
                            <g transform="translate(14,22.5)">
                                <g className="DBI-arm-back">
                                    <line x1="0" y1="0" x2="-16.3" y2="12.5" stroke="var(--ember)" strokeWidth="9.4" strokeLinecap="round" />
                                    <circle cx="-16.3" cy="12.5" r="4.7" fill="var(--ember)" />
                                </g>
                            </g>
                            <g transform="translate(14,47.5)">
                                <g className="DBI-leg-back">
                                    <line x1="0" y1="0" x2="-17.5" y2="22.5" stroke="var(--ember)" strokeWidth="10.6" strokeLinecap="round" />
                                    <circle cx="-17.5" cy="22.5" r="5.4" fill="var(--ember)" />
                                </g>
                            </g>
                            <g transform="rotate(8,14,35)">
                                <line x1="14" y1="18.8" x2="14" y2="48.8" stroke="var(--ember)" strokeWidth="11.9" strokeLinecap="round" />
                            </g>
                            <circle cx="15" cy="8.1" r="10.6" fill="var(--ember)" />
                            <g transform="translate(14,47.5)">
                                <g className="DBI-leg-front">
                                    <line x1="0" y1="0" x2="18.8" y2="20" stroke="var(--ember)" strokeWidth="11.3" strokeLinecap="round" />
                                    <circle cx="18.8" cy="20" r="5.7" fill="var(--ember)" />
                                </g>
                            </g>
                            <g transform="translate(14,22.5)">
                                <g className="DBI-arm-front">
                                    <line x1="0" y1="0" x2="16.3" y2="10" stroke="var(--ember)" strokeWidth="10" strokeLinecap="round" />
                                    <circle cx="16.3" cy="10" r="4.9" fill="var(--ember)" />
                                </g>
                            </g>
                        </g>
                    </svg>
                </div>
                <div className="DBI-label">{label}</div>
            </div>
        </div>
    );
}