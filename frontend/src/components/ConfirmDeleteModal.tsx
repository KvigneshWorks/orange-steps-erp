import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

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

const FALL_MS = 480;

export default function ConfirmDeleteModal({
  open,
  title = 'Delete this record?',
  itemName,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [closing, setClosing] = useState(false);
  const EXIT_MS = 260;
  const [falling, setFalling] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setClosing(false);
      setFalling(false);
    } else if (shouldRender) {
      setClosing(true);
      const t = setTimeout(() => setShouldRender(false), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter' && !loading && !falling) handleDelete();
      };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open, loading, falling]);

  const handleDelete = () => {
    if (loading || falling) return;
    setFalling(true);
    setTimeout(onConfirm, FALL_MS);
  };

  if (!shouldRender) return null;

  const line = description || (itemName ? `Delete "${itemName}"? This can be restored later.` : 'This record can be restored later from the Recycle Bin.');

  return createPortal(
    <>
      <style>{`
        @keyframes cdm-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cdm-backdrop-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes cdm-modal-in {
          0%   { opacity: 0; transform: scale(0.88) translateY(18px); filter: blur(4px); }
          60%  { opacity: 1; transform: scale(1.02) translateY(0); filter: blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cdm-modal-out {
          from { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          to   { opacity: 0; transform: scale(0.94) translateY(8px); filter: blur(3px); }
        }

        /* ── Running-figure mascot — ember theme. Structure (outer→inner):
           track (translateX patrol) → static base position → flip (scaleX,
           synced to track's timing) → figure (translateY bob) → static
           joint wrappers → limb rotation. Positioning is ALWAYS a plain SVG
           transform attribute and animation is ALWAYS a separate CSS class
           on its own element — never both on the same node, since a CSS
           transform silently replaces an element's transform attribute
           instead of combining with it. ── */
        @keyframes cdm-run-track { 0%,100% { transform: translateX(0); } 50% { transform: translateX(150px); } }
        @keyframes cdm-run-flip {
          0%, 49.9%  { transform: scaleX(1); }
          50%, 99.9% { transform: scaleX(-1); }
          100%       { transform: scaleX(1); }
        }
        @keyframes cdm-run-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes cdm-run-arm-back  { 0%,100% { transform: rotate(38deg); } 50% { transform: rotate(-28deg); } }
        @keyframes cdm-run-arm-front { 0%,100% { transform: rotate(-28deg); } 50% { transform: rotate(38deg); } }
        @keyframes cdm-run-leg-back  { 0%,100% { transform: rotate(48deg); } 50% { transform: rotate(-38deg); } }
        @keyframes cdm-run-leg-front { 0%,100% { transform: rotate(-38deg); } 50% { transform: rotate(48deg); } }
        @keyframes cdm-run-line {
          0%   { opacity: 0; transform: translateX(8px); }
          45%  { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-8px); }
        }
        /* Delete pressed: track/flip freeze wherever they are, and the
           figure topples and drops out through the bottom of the card —
           the wrap/body/card allow overflow for this. */
        @keyframes cdm-run-fall {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          35%  { transform: translate(4px,14px) rotate(50deg); opacity: 1; }
          100% { transform: translate(-6px,150px) rotate(200deg); opacity: 0; }
        }
        @keyframes cdm-run-lines-out { to { opacity: 0; } }

        .cdm-run-wrap { display: flex; justify-content: center; align-items: flex-end; margin-bottom: 8px; position: relative; min-height: 84px; overflow: visible; }
        .cdm-run-track { animation: cdm-run-track 3.8s ease-in-out infinite; }
        .cdm-run-track.paused { animation-play-state: paused; }
        .cdm-run-flip { animation: cdm-run-flip 3.8s linear infinite; }
        .cdm-run-flip.paused { animation-play-state: paused; }
        .cdm-run-figure { animation: cdm-run-bob 0.78s ease-in-out infinite; }
        .cdm-run-arm-back  { transform-origin: 0 0; animation: cdm-run-arm-back 0.78s ease-in-out infinite; }
        .cdm-run-arm-front { transform-origin: 0 0; animation: cdm-run-arm-front 0.78s ease-in-out infinite; }
        .cdm-run-leg-back  { transform-origin: 0 0; animation: cdm-run-leg-back 0.78s ease-in-out infinite; }
        .cdm-run-leg-front { transform-origin: 0 0; animation: cdm-run-leg-front 0.78s ease-in-out infinite; }
        .cdm-run-line { animation: cdm-run-line 1.2s ease-in-out infinite; }
        .cdm-run-line.l2 { animation-delay: 0.16s; }
        .cdm-run-line.l3 { animation-delay: 0.32s; }
        .cdm-run-figure.falling {
          animation: cdm-run-fall ${FALL_MS}ms cubic-bezier(0.55,0.06,0.68,0.19) forwards;
        }
        .cdm-run-lines.falling { animation: cdm-run-lines-out 0.2s ease forwards; }

        @keyframes cdm-shimmer { from { background-position: -160px 0; } to { background-position: 160px 0; } }
        .cdm-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(20,10,4,0.5);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: cdm-backdrop-in 0.18s ease both;
          padding: 16px;
        }
        .cdm-backdrop.closing { animation: cdm-backdrop-out 0.24s ease both; }
        .cdm-card {
          background: #faf9f7;
          border-radius: 26px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.05);
          width: 100%; max-width: 340px;
          animation: cdm-modal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
          overflow: visible;
          text-align: center;
        }
        .cdm-card.closing { animation: cdm-modal-out 0.26s cubic-bezier(0.4,0,0.6,1) both; }
        .cdm-top-bar {
          height: 4px; position: relative; overflow: hidden;
          border-radius: 26px 26px 0 0;
          background: linear-gradient(90deg, var(--ember,#C2410C) 0%, var(--ember-mid,#EA580C) 50%, var(--ember-light,#F0834D) 100%);
        }
        .cdm-top-bar::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 50%, transparent);
          background-size: 160px 100%;
          animation: cdm-shimmer 1.6s linear infinite;
        }
        .cdm-body {
          padding: 28px 24px 6px;
          overflow: visible;
        }
        .cdm-line {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          color: #231C14;
          margin: 4px 0 0;
          letter-spacing: -0.2px;
          line-height: 1.4;
        }
        .cdm-footer {
          display: flex; gap: 8px; justify-content: center;
          padding: 16px 22px 22px;
        }
        .cdm-btn-cancel {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          color: #faf9f7;
          background: linear-gradient(135deg, var(--ember-mid,#EA580C) 0%, var(--ember,#C2410C) 100%);
          border: none;
          border-radius: 99px;
          padding: 9px 18px;
          cursor: pointer;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
          box-shadow: 0 4px 14px rgba(203,54,9,0.28);
          flex: 1;
        }
        .cdm-btn-cancel:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(203,54,9,0.36); }
        .cdm-btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; }
        .cdm-btn-delete {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          color: #9A3412;
          background: #F5F3EF;
          border: none;
          border-radius: 99px;
          padding: 9px 16px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          flex: 1;
        }
        .cdm-btn-delete:hover:not(:disabled) { background: #FDE0CB; }
        .cdm-btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
        .cdm-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(192,57,43,0.25);
          border-top-color: #9A3412;
          border-radius: 50%;
          animation: cdm-spin 0.7s linear infinite;
        }
        @keyframes cdm-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className={`cdm-backdrop${closing ? ' closing' : ''}`} onClick={() => !falling && onCancel()}>
        <div className={`cdm-card${closing ? ' closing' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="cdm-top-bar" />
          <div className="cdm-body">
            <div className="cdm-run-wrap">
              <svg width="235" height="83" viewBox="-10 0 235 83" fill="none" style={{ overflow: 'visible' }}>
                <g className={`cdm-run-track${falling ? ' paused' : ''}`}>
                  <g transform="translate(25,5)">
                    <g className={`cdm-run-flip${falling ? ' paused' : ''}`}>
                      <g className={`cdm-run-lines${falling ? ' falling' : ''}`} opacity="0.4" stroke="var(--ember-light,#F0834D)" strokeWidth="3.1" strokeLinecap="round">
                        <line className="cdm-run-line l1" x1="-30" y1="32.5" x2="-10" y2="32.5" />
                        <line className="cdm-run-line l2" x1="-25" y1="42.5" x2="-10" y2="42.5" />
                        <line className="cdm-run-line l3" x1="-20" y1="52.5" x2="-10" y2="52.5" />
                      </g>
                      <g className={`cdm-run-figure${falling ? ' falling' : ''}`}>

                        <g transform="translate(14,22.5)">
                          <g className="cdm-run-arm-back">
                            <line x1="0" y1="0" x2="-16.3" y2="12.5" stroke="var(--ember,#C2410C)" strokeWidth="9.4" strokeLinecap="round" />
                            <circle cx="-16.3" cy="12.5" r="4.7" fill="var(--ember,#C2410C)" />
                          </g>
                        </g>

                        <g transform="translate(14,47.5)">
                          <g className="cdm-run-leg-back">
                            <line x1="0" y1="0" x2="-17.5" y2="22.5" stroke="var(--ember,#C2410C)" strokeWidth="10.6" strokeLinecap="round" />
                            <circle cx="-17.5" cy="22.5" r="5.4" fill="var(--ember,#C2410C)" />
                          </g>
                        </g>

                        <g transform="rotate(8,14,35)">
                          <line x1="14" y1="18.8" x2="14" y2="48.8" stroke="var(--ember,#C2410C)" strokeWidth="11.9" strokeLinecap="round" />
                        </g>
                        <circle cx="15" cy="8.1" r="10.6" fill="var(--ember,#C2410C)" />

                        <g transform="translate(14,47.5)">
                          <g className="cdm-run-leg-front">
                            <line x1="0" y1="0" x2="18.8" y2="20" stroke="var(--ember,#C2410C)" strokeWidth="11.3" strokeLinecap="round" />
                            <circle cx="18.8" cy="20" r="5.7" fill="var(--ember,#C2410C)" />
                          </g>
                        </g>

                        <g transform="translate(14,22.5)">
                          <g className="cdm-run-arm-front">
                            <line x1="0" y1="0" x2="16.3" y2="10" stroke="var(--ember,#C2410C)" strokeWidth="10" strokeLinecap="round" />
                            <circle cx="16.3" cy="10" r="4.9" fill="var(--ember,#C2410C)" />
                          </g>
                        </g>

                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <p className="cdm-line">{line}</p>
          </div>
          <div className="cdm-footer">
            <button ref={cancelRef} className="cdm-btn-cancel" onClick={onCancel} disabled={loading || falling}>
              Cancel
            </button>
            <button className="cdm-btn-delete" onClick={handleDelete} disabled={loading || falling}>
              {(loading || falling) && <span className="cdm-spinner" />}
              {loading || falling ? 'Deleting…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
