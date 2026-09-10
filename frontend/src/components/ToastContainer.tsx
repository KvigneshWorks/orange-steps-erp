import { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { subscribeToast, ToastMessage } from '../services/toast';

const IC: Record<string, string> = {
    success: 'M5 13l4 4L19 7',
    error: 'M6 6l12 12M18 6L6 18',
    info: 'M12 8h.01M12 12v5',
    warning: 'M12 7v6m0 4h.01',
    x: 'M6 18L18 6M6 6l12 12',
};

const PALETTE = {
    success: { c: '#1E9C6A', bg: 'rgba(30,156,106,0.10)', bd: 'rgba(30,156,106,0.24)', label: 'Success' },
    error: { c: '#D93B55', bg: 'rgba(217,59,85,0.10)', bd: 'rgba(217,59,85,0.22)', label: 'Error' },
    info: { c: '#2870CC', bg: 'rgba(40,112,204,0.10)', bd: 'rgba(40,112,204,0.22)', label: 'Info' },
    warning: { c: '#C47E0A', bg: 'rgba(196,126,10,0.10)', bd: 'rgba(196,126,10,0.22)', label: 'Warning' },
};

const CSS = `
@keyframes pt-in {
  0%   { opacity:0; transform:perspective(900px) rotateX(-64deg) translateY(-24px) translateZ(-50px) scale(.9); }
  55%  { opacity:1; transform:perspective(900px) rotateX(7deg) translateY(2px) translateZ(4px) scale(1.018); }
  100% { opacity:1; transform:perspective(900px) rotateX(0) translateY(0) translateZ(0) scale(1); }
}
@keyframes pt-out {
  0%   { opacity:1; transform:perspective(900px) rotateY(0) translateX(0) translateZ(0) scale(1); max-height:140px; margin-bottom:0; }
  100% { opacity:0; transform:perspective(900px) rotateY(52deg) translateX(46px) translateZ(-70px) scale(.78); max-height:0; margin-bottom:-10px; }
}
@keyframes pt-icon-in {
  0%   { transform:perspective(300px) rotateY(-150deg) scale(.3); opacity:0; }
  60%  { transform:perspective(300px) rotateY(16deg) scale(1.1); opacity:1; }
  100% { transform:perspective(300px) rotateY(0) scale(1); }
}
@keyframes pt-ring   { 0% { transform:scale(.6); opacity:.55; } 100% { transform:scale(2); opacity:0; } }
@keyframes pt-shine  { 0% { left:-60%; opacity:0; } 18% { opacity:1; } 100% { left:130%; opacity:0; } }
@keyframes pt-drain  { from { width:100%; } to { width:0%; } }

.PT-wrap {
  position:fixed; top:72px; right:18px; z-index:2147483647;
  display:flex; flex-direction:column; align-items:flex-end; gap:12px;
  pointer-events:none; width:max-content; max-width:min(340px, calc(100vw - 24px));
}
.PT-slot {
  transform-style:preserve-3d;
  animation:pt-in .52s cubic-bezier(.22,1,.36,1) both;
}
.PT-slot.exiting { animation:pt-out .3s cubic-bezier(.4,0,.7,.4) both; pointer-events:none; }

.PT-card {
  pointer-events:auto; position:relative; cursor:default;
  width:min(320px, calc(100vw - 32px));
  display:flex; align-items:stretch;
  border-radius:12px; overflow:hidden;
  background:#FFFFFF;
  border:1px solid #E7E2DC;
  box-shadow:0 1px 1px rgba(30,20,10,0.04), 0 4px 10px rgba(30,20,10,0.06), 0 16px 32px -8px rgba(30,20,10,0.12);
  transform-style:preserve-3d;
  transition:transform .35s cubic-bezier(.2,.8,.3,1), box-shadow .35s ease;
  will-change:transform;
}
.PT-card:hover { box-shadow:0 2px 4px rgba(30,20,10,0.05), 0 10px 22px rgba(30,20,10,0.09), 0 26px 48px -10px rgba(30,20,10,0.16); }

.PT-shine {
  position:absolute; top:0; left:-60%; width:46%; height:100%; z-index:2;
  background:linear-gradient(115deg, transparent 0%, rgba(255,255,255,.5) 45%, rgba(255,255,255,.8) 50%, rgba(255,255,255,.5) 55%, transparent 100%);
  transform:skewX(-18deg);
  animation:pt-shine 1s ease .18s both;
  pointer-events:none; mix-blend-mode:soft-light;
}

.PT-bar { width:4px; flex-shrink:0; background:linear-gradient(180deg, var(--pt-c), var(--pt-c)); box-shadow:1px 0 6px var(--pt-bg); }

.PT-body { position:relative; flex:1; display:flex; align-items:flex-start; gap:11px; padding:13px 12px 13px 13px; min-width:0; }

.PT-icon {
  position:relative; flex-shrink:0; width:26px; height:26px; margin-top:1px;
  border-radius:8px; background:var(--pt-bg); border:1px solid var(--pt-bd);
  display:flex; align-items:center; justify-content:center;
  transform-style:preserve-3d;
  animation:pt-icon-in .5s cubic-bezier(.3,1.4,.5,1) .12s both;
}
.PT-icon::after {
  content:''; position:absolute; inset:-3px; border-radius:10px; border:1.5px solid var(--pt-c);
  animation:pt-ring .6s ease-out .3s both;
}

.PT-texts { min-width:0; flex:1; }
.PT-label {
  font-family:'JetBrains Mono','Consolas',monospace; font-size:8px; font-weight:700;
  letter-spacing:.14em; text-transform:uppercase; color:var(--pt-c);
  margin-bottom:2px;
}
.PT-title {
  font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:12.5px; font-weight:700;
  color:#241D15; line-height:1.35; letter-spacing:-.01em;
}
.PT-sub {
  font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:11px; font-weight:500;
  color:#7A6F60; margin-top:2px; line-height:1.4;
}

.PT-close {
  flex-shrink:0; width:20px; height:20px; border-radius:6px; margin-top:0;
  border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
  background:transparent; color:#A69A87; transition:background .15s, color .15s, transform .15s;
}
.PT-close:hover { background:#F4EFE8; color:#4A4136; transform:scale(1.1); }

.PT-track { position:absolute; left:0; right:0; bottom:0; height:2px; background:transparent; }
.PT-fill { height:100%; background:var(--pt-c); opacity:.55; animation:pt-drain linear both; }

@media(max-width:640px){
  .PT-wrap { top:calc(10px + env(safe-area-inset-top,0px)); left:0; right:0; align-items:center; padding:0 12px; width:auto; max-width:none; }
  .PT-card { width:min(340px, calc(100vw - 24px)); }
  .PT-body { padding:11px 10px 11px 11px; gap:9px; }
}
@media(prefers-reduced-motion: reduce){
  .PT-slot, .PT-slot.exiting, .PT-icon, .PT-icon::after, .PT-shine { animation:none !important; }
  .PT-card { transition:none !important; }
}
`;

function ToastCard({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    const p = PALETTE[toast.type] || PALETTE.info;
    const dur = toast.duration ?? 1500;
    const [exiting, setExiting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const remainingRef = useRef(dur);
    const startedRef = useRef(Date.now());

    const dismiss = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    }, [toast.id, onRemove]);

    useEffect(() => {
        startedRef.current = Date.now();
        timerRef.current = setTimeout(dismiss, dur);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [dismiss, dur]);

    const handleEnter = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        remainingRef.current -= Date.now() - startedRef.current;
    }, []);

    const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 12;
        const ry = (px - 0.5) * 12;
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
    }, []);

    const handleLeave = useCallback(() => {
        if (cardRef.current) cardRef.current.style.transform = '';
        startedRef.current = Date.now();
        timerRef.current = setTimeout(dismiss, Math.max(remainingRef.current, 300));
    }, [dismiss]);

    return (
        <div className={`PT-slot${exiting ? ' exiting' : ''}`}>
            <div className="PT-card" ref={cardRef}
                style={{ '--pt-c': p.c, '--pt-bg': p.bg, '--pt-bd': p.bd } as CSSProperties}
                onMouseEnter={handleEnter} onMouseMove={handleMove} onMouseLeave={handleLeave}>
                <div className="PT-shine" />
                <div className="PT-bar" />
                <div className="PT-body">
                    <div className="PT-icon">
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                            stroke={p.c} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                            <path d={IC[toast.type] || IC.info} />
                        </svg>
                    </div>

                    <div className="PT-texts">
                        <div className="PT-label">{p.label}</div>
                        <div className="PT-title">{toast.title}</div>
                        {toast.subtitle && <div className="PT-sub">{toast.subtitle}</div>}
                    </div>

                    <button className="PT-close" onClick={dismiss} aria-label="Dismiss">
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
                            <path d={IC.x} />
                        </svg>
                    </button>

                    <div className="PT-track">
                        <div className="PT-fill" style={{ animationDuration: `${dur}ms` }} />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        document.getElementById('uc-styles')?.remove();
        document.getElementById('ct-styles')?.remove();
        return subscribeToast(t => setToasts(prev => [...prev.slice(-3), t]));
    }, []);

    const remove = useCallback((id: string) =>
        setToasts(prev => prev.filter(t => t.id !== id)), []);
    if (toasts.length === 0) return null;

    return createPortal(
        <div className="PT-wrap">
            <style>{CSS}</style>
            {toasts.map(t => <ToastCard key={t.id} toast={t} onRemove={remove} />)}
        </div>,
        document.body
    );
}