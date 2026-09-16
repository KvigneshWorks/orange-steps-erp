import { useState, useRef } from 'react';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import './Auth.css';
import { useKeyboardFieldNav } from '../utils/keyboardNav';

interface AuthProps {
    onLoginSuccess: () => void;
}

function AuthArrowIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );
}

// Public self-registration ("Create Account") has been removed from this
// screen entirely — accounts are now created from inside the app, by an
// Admin (pending Super Admin approval) or directly by a Super Admin, via
// the Account Settings module. This component is Sign In only.
export default function Auth({ onLoginSuccess }: AuthProps) {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [shake, setShake] = useState(false);
    const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);

    const triggerShake = (msg: string) => {
        setMessage(msg);
        setMessageType('error');
        setShake(true);
        if (shakeTimer.current) clearTimeout(shakeTimer.current);
        shakeTimer.current = setTimeout(() => setShake(false), 450);
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // The readOnly-until-focused trick (below) stops most browsers from
    // pre-filling on page load, but Chrome/Safari can still slip a saved
    // value in via their own Password Manager UI. This is the only way a
    // page can actually detect that happened — the browser marks the
    // field :-webkit-autofill, which fires the (invisible) CSS animation
    // defined in Auth.css, and we wipe the value back out the instant it
    // fires. Net effect: this page never shows a previously-saved email
    // or password, no matter which path the browser used to fill it.
    const clearIfAutofilled = (e: React.AnimationEvent<HTMLInputElement>) => {
        if (e.animationName !== 'AS-autofillDetect') return;
        const name = e.currentTarget.name;
        setLoginData(prev => (prev[name as 'email' | 'password'] ? { ...prev, [name]: '' } : prev));
    };

    const submitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginData.email.trim() || !loginData.password) {
            triggerShake('Please fill in all required fields.'); return;
        }
        setLoading(true); setMessage('');
        try {
            const res = await axiosInstance.post('/auth/login', {
                ...loginData,
                email: loginData.email.trim().toLowerCase(),
            });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                // Clear any stale local cache on login
                try {
                    Object.keys(localStorage).forEach(k => {
                        if (k.startsWith('erp_cache_')) localStorage.removeItem(k);
                    });
                } catch { }
                // Save session info for navbar display
                const prev = localStorage.getItem('erp_session');
                if (prev) localStorage.setItem('erp_last_session', prev);
                const ua = navigator.userAgent;
                const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
                const browser = /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Browser';
                const os = /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';
                localStorage.setItem('erp_session', JSON.stringify({ loginAt: new Date().toISOString(), browser, os, device: isMobile ? 'mobile' : 'desktop' }));
                localStorage.removeItem('erp_bell_seen_at');
                setMessage('Login successful! Redirecting…');
                setMessageType('success');
                toast.success('Welcome Back!', `Signed in as ${res.data.user?.name || 'user'}`);
                const base = import.meta.env.BASE_URL || '/';
                window.history.pushState({ nav: 'dashboard' }, '', base);
                setTimeout(() => onLoginSuccess(), 1000);
            }
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Invalid credentials. Please try again.');
            setMessageType('error');
        } finally { setLoading(false); }
    };

    const year = new Date().getFullYear();

    return (
        <div ref={rootRef} className="AS-root">
            <style>{ERP_CSS}</style>

            <div className="AS-shell">

                {/* ══════════════════════════════════════
                    LEFT — BRAND PANEL
                ══════════════════════════════════════ */}
                <aside className="AS-brand">
                    <div className="AS-brand-grid" />

                    <div className="AS-brand-top">
                        <div className="AS-brand-logo">
                            <img src={import.meta.env.BASE_URL + 'favicon.png'} alt="WhiteNode Software Solutions" />
                        </div>
                        <div className="AS-brand-name">
                            <span className="AS-brand-name-main"><span className="w-te">White</span><span className="w-hl">Node</span></span>
                            <span className="AS-brand-name-sub">Software Solutions</span>
                        </div>
                    </div>

                    <div className="AS-brand-mid">
                        <span className="AS-brand-tag">Enterprise Resource Planning</span>
                        <h1 className="AS-brand-title">
                            One platform to run<br />your entire business.
                        </h1>
                        <p className="AS-brand-sub">
                            Workforce, daybook, credit and client operations — unified in a single,
                            role-secured ERP built for growing teams.
                        </p>

                        <ul className="AS-brand-features">
                            <li><span className="AS-brand-check"><CheckIcon /></span>Role-based access control</li>
                            <li><span className="AS-brand-check"><CheckIcon /></span>Real-time attendance &amp; payroll</li>
                            <li><span className="AS-brand-check"><CheckIcon /></span>Audit-ready financial records</li>
                        </ul>
                    </div>

                    <div className="AS-brand-foot">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6" />
                        </svg>
                        &copy; {year} WhiteNode Software Solutions. All rights reserved.
                    </div>
                </aside>

                {/* ══════════════════════════════════════
                    RIGHT — FORM PANEL (Sign In only)
                ══════════════════════════════════════ */}
                <main className="AS-panel">
                    <div className="AS-panel-inner">

                        <div className="AS-mobile-brand">
                            <div className="AS-brand-logo">
                                <img src={import.meta.env.BASE_URL + 'favicon.png'} alt="WhiteNode Software Solutions" />
                            </div>
                            <div className="AS-brand-name">
                                <span className="AS-brand-name-main"><span className="w-te">White</span><span className="w-hl">Node</span></span>
                                <span className="AS-brand-name-sub">Software Solutions</span>
                            </div>
                        </div>

                        <div className="AS-form-wrap">
                            <h2 className="AS-form-title">
                                Welcome <span className="AS-t-accent">back</span>
                                <span className="AS-form-title-bar" />
                            </h2>
                            <p className="AS-form-sub">Sign in to access your WhiteNode workspace.</p>

                            <form onSubmit={submitLogin} autoComplete="off" className={shake ? 'A-shake' : ''}>
                                {/* honeypot — absorbs the browser's autofill so it never
                                    lands in the real fields below, and combined with the
                                    readOnly-until-focused trick on those real fields, no
                                    previously-saved email/password ever shows on this page */}
                                <input type="text" name="fakeuser_" style={{ display: 'none' }} readOnly tabIndex={-1} />
                                <input type="password" name="fakepass_" style={{ display: 'none' }} readOnly tabIndex={-1} />

                                <div className="A-field">
                                    <label className="A-field-label">Email Address</label>
                                    <div className="A-input-wrap">
                                        <input
                                            type="email"
                                            className="A-input"
                                            placeholder="you@company.com"
                                            name="email"
                                            id="wn-login-email"
                                            value={loginData.email}
                                            onChange={handleLoginChange}
                                            autoComplete="off"
                                            readOnly
                                            onFocus={e => e.currentTarget.removeAttribute('readonly')}
                                            onAnimationStart={clearIfAutofilled}
                                        />
                                        <span className="A-input-icon">
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className="A-field">
                                    <label className="A-field-label">Password</label>
                                    <div className="A-input-wrap">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="A-input"
                                            placeholder="••••••••••"
                                            name="password"
                                            id="wn-login-password"
                                            value={loginData.password}
                                            onChange={handleLoginChange}
                                            autoComplete="new-password"
                                            readOnly
                                            onFocus={e => e.currentTarget.removeAttribute('readonly')}
                                            onAnimationStart={clearIfAutofilled}
                                        />
                                        <button
                                            type="button"
                                            className="A-input-toggle"
                                            onClick={() => setShowPass(v => !v)}
                                        >
                                            {showPass ? (
                                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="AS-btn primary"
                                    disabled={loading}
                                >
                                    {loading
                                        ? <><span className="A-spin" /> Authenticating…</>
                                        : <>Sign In <span className="A-btn-arrow"><AuthArrowIcon /></span></>
                                    }
                                </button>

                                {message && (
                                    <div className={`A-msg ${messageType}`}>
                                        <svg className="A-msg-icon" viewBox="0 0 20 20" fill="currentColor">
                                            {messageType === 'success'
                                                ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            }
                                        </svg>
                                        {message}
                                    </div>
                                )}
                            </form>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
