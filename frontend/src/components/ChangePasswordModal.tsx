import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';

interface Props {
    open: boolean;
    onClose: () => void;
}

const EYE_OPEN = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EYE_OFF = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.3 20.3 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a20.3 20.3 0 01-2.68 3.9M14.12 14.12a3 3 0 11-4.24-4.24" />
        <path d="M1 1l22 22" />
    </svg>
);

function PwField({
    label, value, onChange, show, onToggleShow, autoFocus, placeholder,
}: {
    label: string; value: string; onChange: (v: string) => void; show: boolean;
    onToggleShow: () => void; autoFocus?: boolean; placeholder?: string;
}) {
    return (
        <div className="cpm-field">
            <label className="cpm-label">{label}</label>
            <div className="cpm-input-wrap">
                <input
                    type={show ? 'text' : 'password'}
                    className="cpm-input"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    autoComplete={label === 'Current Password' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="cpm-eye" onClick={onToggleShow} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
                    {show ? EYE_OFF : EYE_OPEN}
                </button>
            </div>
        </div>
    );
}

export default function ChangePasswordModal({ open, onClose }: Props) {
    const [shouldRender, setShouldRender] = useState(open);
    const [closing, setClosing] = useState(false);
    const EXIT_MS = 220;

    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const firstFieldRef = useRef<HTMLDivElement>(null);

    const reset = () => {
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        setShowCurrent(false); setShowNew(false); setShowConfirm(false);
        setLoading(false); setError(null);
    };

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setClosing(false);
        } else if (shouldRender) {
            setClosing(true);
            const t = setTimeout(() => { setShouldRender(false); reset(); }, EXIT_MS);
            return () => clearTimeout(t);
        }
    }, [open]);

    const handleClose = () => { if (!loading) onClose(); };

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, loading]);

    if (!shouldRender) return null;

    const validate = (): string | null => {
        if (!currentPw || !newPw || !confirmPw) return 'Please fill in every field.';
        if (newPw.length < 8) return 'New password must be at least 8 characters.';
        if (newPw !== confirmPw) return 'New password and confirmation do not match.';
        if (newPw === currentPw) return 'New password must be different from your current password.';
        return null;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (loading) return;
        const clientError = validate();
        if (clientError) { setError(clientError); return; }

        setLoading(true);
        setError(null);
        try {
            await axiosInstance.post('/auth/change-password', {
                current_password: currentPw,
                new_password: newPw,
                new_password_confirmation: confirmPw,
            });
            toast.success('Password updated', 'Use your new password next time you sign in.');
            onClose();
        } catch (err: any) {
            const data = err?.response?.data;
            let msg = data?.message || 'Could not update your password. Please try again.';
            if (data?.errors) {
                const firstKey = Object.keys(data.errors)[0];
                if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey][0]) {
                    msg = data.errors[firstKey][0];
                }
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <>
            <style>{`
                @keyframes cpm-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes cpm-backdrop-out { from { opacity: 1; } to { opacity: 0; } }
                @keyframes cpm-modal-in {
                    0%   { opacity: 0; transform: scale(0.92) translateY(14px); filter: blur(3px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
                }
                @keyframes cpm-modal-out {
                    from { opacity: 1; transform: scale(1) translateY(0); }
                    to   { opacity: 0; transform: scale(0.95) translateY(8px); }
                }
                @keyframes cpm-shimmer { from { background-position: -160px 0; } to { background-position: 160px 0; } }
                @keyframes cpm-shake {
                    10%, 90% { transform: translateX(-1px); }
                    20%, 80% { transform: translateX(2px); }
                    30%, 50%, 70% { transform: translateX(-4px); }
                    40%, 60% { transform: translateX(4px); }
                }
                @keyframes cpm-spin { to { transform: rotate(360deg); } }

                .cpm-backdrop {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(20,10,4,0.5);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    animation: cpm-backdrop-in 0.18s ease both;
                    padding: 16px;
                }
                .cpm-backdrop.closing { animation: cpm-backdrop-out 0.22s ease both; }
                .cpm-card {
                    background: #faf9f7;
                    border-radius: 22px;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.05);
                    width: 100%; max-width: 360px;
                    animation: cpm-modal-in 0.36s cubic-bezier(0.34,1.56,0.64,1) both;
                    overflow: hidden;
                }
                .cpm-card.closing { animation: cpm-modal-out 0.22s cubic-bezier(0.4,0,0.6,1) both; }
                .cpm-top-bar {
                    height: 4px; position: relative; overflow: hidden;
                    background: linear-gradient(90deg, var(--ember,#C2410C) 0%, var(--ember-mid,#DB5B1F) 50%, var(--ember-light,#F0834D) 100%);
                }
                .cpm-top-bar::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 50%, transparent);
                    background-size: 160px 100%;
                    animation: cpm-shimmer 1.6s linear infinite;
                }
                .cpm-header {
                    display: flex; align-items: center; gap: 12px;
                    padding: 22px 24px 4px;
                }
                .cpm-icon {
                    width: 40px; height: 40px; flex-shrink: 0;
                    border-radius: 12px;
                    background: rgba(37,99,235,0.1);
                    border: 1px solid rgba(37,99,235,0.22);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--ember,#C2410C);
                }
                .cpm-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 16px; font-weight: 800; color: #231C14;
                    letter-spacing: -0.2px;
                }
                .cpm-subtitle {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px; font-weight: 700; color: #6B5D48;
                    letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;
                }
                .cpm-body { padding: 16px 24px 4px; display: flex; flex-direction: column; gap: 14px; }
                .cpm-field { display: flex; flex-direction: column; gap: 6px; }
                .cpm-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9.5px; font-weight: 800; color: #6B5D48;
                    letter-spacing: 1.5px; text-transform: uppercase;
                }
                .cpm-input-wrap { position: relative; display: flex; align-items: center; }
                .cpm-input {
                    width: 100%;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 13.5px; font-weight: 600; color: #231C14;
                    padding: 10px 38px 10px 12px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(0,0,0,0.09);
                    background: #F5F3EF;
                    outline: none;
                    transition: border-color 0.15s, background 0.15s;
                    box-sizing: border-box;
                }
                .cpm-input:focus {
                    border-color: var(--ember,#C2410C);
                    background: #faf9f7;
                }
                .cpm-eye {
                    position: absolute; right: 8px;
                    background: none; border: none; cursor: pointer;
                    color: #6B5D48; padding: 6px;
                    display: flex; align-items: center; justify-content: center;
                }
                .cpm-eye:hover { color: var(--ember,#C2410C); }
                .cpm-hint {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px; color: #6B5D48; letter-spacing: 0.3px; margin-top: -6px;
                }
                .cpm-error {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 11.5px; font-weight: 700; color: #9A3412;
                    background: #F5F3EF; border: 1px solid rgba(192,57,43,0.18);
                    border-radius: 9px; padding: 9px 12px;
                    animation: cpm-shake 0.4s ease;
                }
                .cpm-footer {
                    display: flex; gap: 8px; justify-content: flex-end;
                    padding: 18px 24px 22px;
                }
                .cpm-btn-cancel {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 11px; font-weight: 700; color: #6B5D48;
                    background: rgba(0,0,0,0.04); border: none;
                    border-radius: 99px; padding: 10px 18px; cursor: pointer;
                    transition: background 0.15s;
                }
                .cpm-btn-cancel:hover:not(:disabled) { background: rgba(0,0,0,0.07); }
                .cpm-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
                .cpm-btn-save {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 11px; font-weight: 800; color: #faf9f7;
                    background: linear-gradient(135deg, var(--ember-mid,#DB5B1F) 0%, var(--ember,#C2410C) 100%);
                    border: none; border-radius: 99px; padding: 10px 20px; cursor: pointer;
                    box-shadow: 0 4px 14px rgba(29,78,216,0.28);
                    transition: transform 0.16s ease, box-shadow 0.16s ease;
                    display: flex; align-items: center; gap: 8px;
                }
                .cpm-btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(29,78,216,0.36); }
                .cpm-btn-save:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
                .cpm-spinner {
                    width: 12px; height: 12px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #faf9f7;
                    border-radius: 50%;
                    animation: cpm-spin 0.7s linear infinite;
                }
            `}</style>

            <div className={`cpm-backdrop${closing ? ' closing' : ''}`} onClick={() => !closing && handleClose()}>
                <form className={`cpm-card${closing ? ' closing' : ''}`} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                    <div className="cpm-top-bar" />
                    <div className="cpm-header">
                        <div className="cpm-icon">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="11" width="14" height="9" rx="2" />
                                <path d="M8 11V7a4 4 0 018 0v4" />
                            </svg>
                        </div>
                        <div>
                            <div className="cpm-title">Change Password</div>
                            <div className="cpm-subtitle">Account Security</div>
                        </div>
                    </div>
                    <div className="cpm-body" ref={firstFieldRef}>
                        {error && <div className="cpm-error">{error}</div>}
                        <PwField label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggleShow={() => setShowCurrent(s => !s)} autoFocus placeholder="Enter current password" />
                        <PwField label="New Password" value={newPw} onChange={setNewPw} show={showNew} onToggleShow={() => setShowNew(s => !s)} placeholder="At least 8 characters" />
                        <div className="cpm-hint" style={{ marginTop: -10 }}>Must be at least 8 characters</div>
                        <PwField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggleShow={() => setShowConfirm(s => !s)} placeholder="Re-enter new password" />
                    </div>
                    <div className="cpm-footer">
                        <button type="button" className="cpm-btn-cancel" onClick={handleClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="cpm-btn-save" disabled={loading}>
                            {loading && <span className="cpm-spinner" />}
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </>,
        document.body
    );
}