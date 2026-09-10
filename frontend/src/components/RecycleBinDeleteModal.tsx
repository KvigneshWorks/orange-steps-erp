import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { tiltMove, tiltLeave } from '../utils/tilt3d';

interface Props {
    open: boolean;
    title?: string;
    itemName?: string;
    description?: string;
    confirmLabel?: string;
    warnText?: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const EXIT_MS = 280;

export default function RecycleBinDeleteModal({
    open,
    title = 'Permanent Delete',
    itemName,
    description,
    confirmLabel = 'Delete Forever',
    warnText,
    onConfirm,
    onCancel,
    loading = false,
}: Props) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [shouldRender, setShouldRender] = useState(open);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setClosing(false);
        } else if (shouldRender) {
            setClosing(true);
            const t = setTimeout(() => setShouldRender(false), EXIT_MS);
            return () => clearTimeout(t);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter' && !loading) onConfirm();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, loading]);

    useEffect(() => {
        if (open) cancelRef.current?.focus();
    }, [open]);

    if (!shouldRender) return null;

    const line = description || (itemName ? `Delete ${itemName}? This cannot be undone.` : 'This record will be permanently removed from the system.');

    return createPortal(
        <>
            <style>{`
        @keyframes rbdm-bg-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes rbdm-bg-out { from { opacity:1; } to { opacity:0; } }
        @keyframes rbdm-in {
          0%   { opacity:0; transform:perspective(1000px) rotateX(-46deg) translateY(-20px) translateZ(-60px) scale(.9); }
          55%  { opacity:1; transform:perspective(1000px) rotateX(5deg) translateY(2px) translateZ(6px) scale(1.015); }
          100% { opacity:1; transform:perspective(1000px) rotateX(0) translateY(0) translateZ(0) scale(1); }
        }
        @keyframes rbdm-out {
          0%   { opacity:1; transform:perspective(1000px) rotateY(0) translateY(0) scale(1); }
          100% { opacity:0; transform:perspective(1000px) rotateY(-38deg) translateY(14px) translateZ(-80px) scale(.86); }
        }
        @keyframes rbdm-icon-in {
          0%   { transform:perspective(300px) rotateY(-160deg) scale(.3); opacity:0; }
          60%  { transform:perspective(300px) rotateY(14deg) scale(1.08); opacity:1; }
          100% { transform:perspective(300px) rotateY(0) scale(1); }
        }
        @keyframes rbdm-ring  { 0% { transform:scale(.6); opacity:.55; } 100% { transform:scale(2.1); opacity:0; } }
        @keyframes rbdm-shine { 0% { left:-60%; opacity:0; } 18% { opacity:1; } 100% { left:130%; opacity:0; } }
        @keyframes rbdm-spin  { to { transform:rotate(360deg); } }

        .rbdm-backdrop {
          position:fixed; inset:0; z-index:9999;
          background:rgba(20,14,8,0.46);
          backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          animation:rbdm-bg-in .2s ease both; padding:16px;
        }
        .rbdm-backdrop.closing { animation:rbdm-bg-out .24s ease both; }

        .rbdm-slot { transform-style:preserve-3d; width:100%; max-width:360px; }
        .rbdm-slot.enter  { animation:rbdm-in .5s cubic-bezier(.22,1,.36,1) both; }
        .rbdm-slot.closing{ animation:rbdm-out .26s cubic-bezier(.4,0,.7,.4) both; }

        .rbdm-card {
          position:relative; background:#FFFFFF; border-radius:18px; overflow:hidden;
          border:1px solid #E7E2DC;
          box-shadow:0 1px 1px rgba(30,20,10,.05), 0 8px 20px rgba(30,20,10,.10), 0 30px 60px -14px rgba(30,20,10,.22);
          transform-style:preserve-3d;
          transition:transform .35s cubic-bezier(.2,.8,.3,1), box-shadow .35s ease;
          text-align:center;
        }
        .rbdm-shine {
          position:absolute; top:0; left:-60%; width:44%; height:100%; z-index:2;
          background:linear-gradient(115deg, transparent 0%, rgba(255,255,255,.55) 45%, rgba(255,255,255,.85) 50%, rgba(255,255,255,.55) 55%, transparent 100%);
          transform:skewX(-18deg); pointer-events:none; mix-blend-mode:soft-light;
          animation:rbdm-shine 1s ease .2s both;
        }
        .rbdm-topbar { height:4px; background:linear-gradient(90deg,#D93B55 0%,#E8677D 60%,#F2A6B2 100%); }

        .rbdm-body { padding:30px 26px 6px; }
        .rbdm-icon-wrap {
          position:relative; width:56px; height:56px; margin:0 auto 16px;
          border-radius:16px; background:rgba(217,59,85,0.10); border:1.5px solid rgba(217,59,85,0.24);
          display:flex; align-items:center; justify-content:center;
          transform-style:preserve-3d;
          animation:rbdm-icon-in .55s cubic-bezier(.3,1.4,.5,1) .1s both;
        }
        .rbdm-icon-wrap::after {
          content:''; position:absolute; inset:-4px; border-radius:19px; border:1.5px solid #D93B55;
          animation:rbdm-ring .65s ease-out .28s both;
        }
        .rbdm-title {
          font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:16px; font-weight:800;
          color:#241D15; letter-spacing:-.2px; margin-bottom:6px;
        }
        .rbdm-line {
          font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:12.5px; font-weight:500;
          color:#7A6F60; line-height:1.5; margin:0 0 4px;
        }
        .rbdm-warn {
          margin-top:12px; padding:9px 12px; border-radius:10px;
          background:rgba(196,126,10,0.08); border:1px solid rgba(196,126,10,0.22);
          font-family:'JetBrains Mono','Consolas',monospace; font-size:9.5px; font-weight:700;
          color:#C47E0A; letter-spacing:.02em; text-align:left; display:flex; gap:8px; align-items:flex-start;
        }

        .rbdm-footer { display:flex; gap:10px; padding:22px 22px 24px; }
        .rbdm-btn {
          flex:1; font-family:'Space Grotesk','Segoe UI',sans-serif; font-size:11px; font-weight:800;
          border-radius:11px; padding:11px 14px; cursor:pointer; border:none;
          display:flex; align-items:center; justify-content:center; gap:7px;
          transition:transform .16s ease, box-shadow .16s ease, background .16s ease;
        }
        .rbdm-btn-cancel {
          background:#F6F1EA; color:#4A4136; border:1.5px solid #E7E2DC;
        }
        .rbdm-btn-cancel:hover:not(:disabled) { background:#EFE8DE; transform:translateY(-1px); }
        .rbdm-btn-cancel:disabled { opacity:.5; cursor:not-allowed; }
        .rbdm-btn-delete {
          background:linear-gradient(135deg,#E24A63 0%,#D93B55 100%); color:#fff;
          box-shadow:0 6px 16px rgba(217,59,85,.32);
        }
        .rbdm-btn-delete:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 22px rgba(217,59,85,.4); }
        .rbdm-btn-delete:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .rbdm-spinner {
          width:12px; height:12px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff;
          border-radius:50%; animation:rbdm-spin .65s linear infinite;
        }

        @media(prefers-reduced-motion: reduce){
          .rbdm-slot.enter, .rbdm-slot.closing, .rbdm-icon-wrap, .rbdm-icon-wrap::after, .rbdm-shine { animation:none !important; }
          .rbdm-card { transition:none !important; }
        }
      `}</style>

            <div className={`rbdm-backdrop${closing ? ' closing' : ''}`} onClick={() => onCancel()}>
                <div className={`rbdm-slot${closing ? ' closing' : ' enter'}`} onClick={e => e.stopPropagation()}>
                    <div className="rbdm-card" onMouseMove={e => tiltMove(e, 7, 6)} onMouseLeave={tiltLeave}>
                        <div className="rbdm-shine" />
                        <div className="rbdm-topbar" />
                        <div className="rbdm-body">
                            <div className="rbdm-icon-wrap">
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#D93B55" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div className="rbdm-title">{title}</div>
                            <p className="rbdm-line">{line}</p>
                            {warnText && (
                                <div className="rbdm-warn">
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#C47E0A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{warnText}</span>
                                </div>
                            )}
                        </div>
                        <div className="rbdm-footer">
                            <button ref={cancelRef} className="rbdm-btn rbdm-btn-cancel" onClick={onCancel} disabled={loading}>
                                Cancel
                            </button>
                            <button className="rbdm-btn rbdm-btn-delete" onClick={onConfirm} disabled={loading}>
                                {loading && <span className="rbdm-spinner" />}
                                {loading ? 'Deleting…' : confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
