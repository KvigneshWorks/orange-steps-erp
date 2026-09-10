import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DuplicateField {
  label: string;
  value: string;
}

interface Props {
  open: boolean;
  entityName?: string;
  duplicateFields?: DuplicateField[];
  onAddAnyway: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DuplicateWarningModal({
  open,
  entityName = 'Record',
  duplicateFields = [],
  onAddAnyway,
  onCancel,
  loading = false,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 80);
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes dwm-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dwm-modal-in {
          from { opacity: 0; transform: scale(0.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dwm-icon-bounce {
          0%,100% { transform: scale(1) rotate(-3deg); }
          50%      { transform: scale(1.15) rotate(3deg); }
        }
        .dwm-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(10,6,3,0.60);
          backdrop-filter: blur(5px);
          display: flex; align-items: center; justify-content: center;
          animation: dwm-in 0.18s ease both;
          padding: 16px;
        }
        .dwm-box {
          background: var(--white, #FDFAF6);
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12);
          width: 100%; max-width: 440px;
          overflow: hidden;
          animation: dwm-modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
          border: 1.5px solid var(--border, #E8E0D4);
        }
        .dwm-accent {
          height: 4px;
          background: linear-gradient(90deg, #F5A623 0%, #E8720C 60%, #C85A00 100%);
        }
        .dwm-body {
          padding: 28px 28px 24px;
        }
        .dwm-icon-row {
          display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;
        }
        .dwm-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(255,107,0,0.10);
          border: 1.5px solid rgba(255,107,0,0.30);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          animation: dwm-icon-bounce 1.8s ease-in-out infinite;
        }
        .dwm-title {
          font-family: var(--font-display, serif);
          font-size: 17.5px; font-style: italic; font-weight: 800;
          color: var(--text-1, #1A1008); margin-bottom: 5px;
        }
        .dwm-subtitle {
          font-family: var(--font-body, sans-serif);
          font-size: 11.5px; color: var(--text-3, #7A6248); line-height: 1.5;
        }
        .dwm-entity-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,107,0,0.10); border: 1px solid rgba(255,107,0,0.30);
          border-radius: 100px; padding: 2px 10px;
          font-family: var(--font-mono, monospace); font-size: 8px; font-weight: 800;
          letter-spacing: 1.5px; text-transform: uppercase; color: #C85A00;
          margin-bottom: 16px;
        }
        .dwm-fields {
          background: var(--off-white, #F5F0E8);
          border: 1px solid var(--border, #E8E0D4);
          border-radius: 10px; overflow: hidden;
          margin-bottom: 22px;
        }
        .dwm-field-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border, #E8E0D4);
        }
        .dwm-field-row:last-child { border-bottom: none; }
        .dwm-field-lbl {
          font-family: var(--font-mono, monospace); font-size: 8px; font-weight: 800;
          letter-spacing: 1px; text-transform: uppercase; color: var(--text-4, #9A8878);
          min-width: 90px; flex-shrink: 0;
        }
        .dwm-field-val {
          font-family: var(--font-body, sans-serif); font-size: 11.5px; font-weight: 700;
          color: #C85A00; flex: 1; min-width: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dwm-hint {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 14px;
          background: rgba(255,107,0,0.07);
          border: 1px solid rgba(255,107,0,0.20);
          border-radius: 8px; margin-bottom: 22px;
          font-family: var(--font-body, sans-serif); font-size: 10.5px;
          color: var(--text-3, #7A6248); line-height: 1.5;
        }
        .dwm-btn-row {
          display: flex; gap: 10px;
        }
        .dwm-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; padding: 11px 18px; border-radius: 10px;
          font-family: var(--font-mono, monospace); font-size: 8.5px; font-weight: 800;
          letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer;
          border: 1.5px solid; transition: all 0.18s; outline: none;
        }
        .dwm-btn:disabled { opacity: 0.55; pointer-events: none; }
        .dwm-btn.cancel {
          background: var(--white, #FDFAF6); color: var(--text-2, #3A2C1A);
          border-color: var(--border, #E8E0D4);
        }
        .dwm-btn.cancel:hover {
          background: var(--off-white, #F5F0E8);
          border-color: var(--border-2, #C8B89A);
        }
        .dwm-btn.add-anyway {
          background: rgba(255,107,0,0.10); color: #C85A00;
          border-color: rgba(255,107,0,0.40);
        }
        .dwm-btn.add-anyway:hover {
          background: #E8720C; color: #fff; border-color: #E8720C;
        }
        @media(max-width:480px){
          .dwm-body { padding: 20px 18px 18px; }
          .dwm-btn-row { flex-direction: column; }
          .dwm-btn { flex: none; }
          .dwm-title { font-size: 15px; }
        }
      `}</style>

      <div className="dwm-backdrop" onClick={onCancel}>
        <div className="dwm-box" onClick={e => e.stopPropagation()}>
          <div className="dwm-accent" />
          <div className="dwm-body">

            <div className="dwm-icon-row">
              <div className="dwm-icon">
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                  stroke="#E8720C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <div className="dwm-title">Duplicate Detected</div>
                <div className="dwm-subtitle">
                  This {entityName.toLowerCase()} already exists in the system.
                </div>
              </div>
            </div>

            <div className="dwm-entity-badge">
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Already exists · {entityName}
            </div>

            {duplicateFields.length > 0 && (
              <div className="dwm-fields">
                {duplicateFields.map((f, i) => (
                  <div key={i} className="dwm-field-row">
                    <span className="dwm-field-lbl">{f.label}</span>
                    <span className="dwm-field-val">{f.value || '—'}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="dwm-hint">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1, color: '#C85A00' }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              Do you still want to save this entry? If it's intentional (e.g. a different person with the same name), click <strong>Add Anyway</strong>.
            </div>

            <div className="dwm-btn-row">
              <button ref={cancelRef} className="dwm-btn cancel" onClick={onCancel} disabled={loading}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button className="dwm-btn add-anyway" onClick={onAddAnyway} disabled={loading}>
                {loading
                  ? <><span style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                  : <>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Add Anyway
                  </>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
