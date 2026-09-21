import { useState, useRef, useEffect } from 'react';
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

function GlobeIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4.06V6a1 1 0 001 1h1a1 1 0 011 1 1 1 0 001 1 1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 00-1 1v1a1 1 0 01-1 1 1 1 0 01-1-1v-1a1 1 0 00-.293-.707L7 9.586A1 1 0 016.707 8.88L6 8.172a1 1 0 01.293-.707L7.586 6.17A1 1 0 018 5.87V4.06a6.01 6.01 0 011-.06c.34 0 .673.024 1 .07V4.06z" clipRule="evenodd" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-3.293-3.707a1 1 0 00-1.414-1.414L9 9.172 7.207 7.379a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4 4 0 00-4 4v2H5a1 1 0 00-1 1v9a2 2 0 002 2h8a2 2 0 002-2V8a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm-2 6V5a2 2 0 114 0v2H8z" clipRule="evenodd" />
        </svg>
    );
}

function BoltIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
    );
}

function FileIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
    );
}

const FEATURE_SLIDES = [
    { Icon: ShieldIcon, title: 'Role-based access control', desc: 'Every module is permission-gated — nothing leaks across teams or roles.' },
    { Icon: ClockIcon, title: 'Real-time attendance & payroll', desc: 'Live workforce tracking, wages computed the moment a shift closes.' },
    { Icon: FileIcon, title: 'Audit-ready financial records', desc: 'Every rupee traceable — daybook, credit and client ledgers, always in sync.' },
];

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
    // Backend deliberately returns one generic "Invalid email or password" for
    // both a wrong email and a wrong password (so a bad actor can't use the
    // error to discover which emails are registered). We can't say which
    // field is wrong, so instead we flag BOTH — clear visual cue of exactly
    // where to look, without weakening that protection.
    const [fieldError, setFieldError] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [slide, setSlide] = useState(0);
    const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);

    // Chrome/Edge/Safari match saved logins to a field mainly by its name+id,
    // not just autoComplete. A fresh random suffix on every page load means
    // this form never looks like "the same field" the browser saved a value
    // against before, so there's nothing for it to offer or slip in.
    const fieldSuffix = useRef(Math.random().toString(36).slice(2, 9)).current;

    // Chrome/Edge/Safari's native "pick a saved account" dropdown shows up
    // specifically for type="password" fields. WebKit/Blink browsers also
    // support -webkit-text-security, which can visually mask a plain
    // type="text" field the same way a password field looks -- so on those
    // browsers we render this as text (with the CSS mask on) instead of a
    // real password field, and the browser has nothing to offer a picker
    // for. Firefox has no -webkit-text-security support, so it falls back
    // to a genuine type="password" field there -- never plain, readable text.
    const [maskSupported] = useState(() => {
        try { return CSS.supports('-webkit-text-security', 'disc'); }
        catch { return false; }
    });

    const restartSlideTimer = () => {
        if (slideTimer.current) clearTimeout(slideTimer.current);
        slideTimer.current = setTimeout(() => setSlide(s => (s + 1) % FEATURE_SLIDES.length), 4200);
    };

    useEffect(() => {
        restartSlideTimer();
        return () => { if (slideTimer.current) clearTimeout(slideTimer.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slide]);

    const goToSlide = (i: number) => setSlide(i);

    const triggerShake = (msg: string) => {
        setMessage(msg);
        setMessageType('error');
        setShake(true);
        if (shakeTimer.current) clearTimeout(shakeTimer.current);
        // The CSS animation itself now runs 3 shake cycles (0.4s each) — keep
        // this in sync so the class isn't removed mid-shake.
        shakeTimer.current = setTimeout(() => setShake(false), 1250);
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const field = e.target.dataset.field as 'email' | 'password';
        setFieldError(false);
        setLoginData(prev => ({ ...prev, [field]: e.target.value }));
    };

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
        const field = e.currentTarget.dataset.field as 'email' | 'password';
        setLoginData(prev => (prev[field] ? { ...prev, [field]: '' } : prev));
    };

    const submitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginData.email.trim() || !loginData.password) {
            triggerShake('Please fill in all required fields.'); return;
        }
        setLoading(true); setMessage(''); setFieldError(false);
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
                setLoginSuccess(true);
                toast.success('Welcome Back!', `Signed in as ${res.data.user?.name || 'user'}`);
                const base = import.meta.env.BASE_URL || '/';
                window.history.pushState({ nav: 'dashboard' }, '', base);
                setTimeout(() => onLoginSuccess(), 1000);
            }
        } catch (err: any) {
            const rawMsg = err.response?.data?.message;
            const isBadCredentials = !err.response?.data?.pending;
            if (isBadCredentials) setFieldError(true);
            triggerShake(
                rawMsg === 'Invalid email or password'
                    ? 'The email or password you entered is incorrect. Please check both fields and try again.'
                    : (rawMsg || 'Something went wrong. Please try again.')
            );
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
                            <span className="AS-brand-title-l1">One platform to run</span>
                            <span className="AS-brand-title-l2">your entire business.</span>
                        </h1>
                        <p className="AS-brand-sub">
                            Workforce, daybook, credit and client operations — unified in a single,
                            role-secured ERP built for growing teams.
                        </p>

                        <div className="AS-carousel" onMouseEnter={() => { if (slideTimer.current) clearTimeout(slideTimer.current); }} onMouseLeave={restartSlideTimer}>
                            <div className="AS-carousel-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
                                {FEATURE_SLIDES.map((f, i) => (
                                    <div className={`AS-carousel-slide${i === slide ? ' active' : ''}`} key={i} aria-hidden={i !== slide}>
                                        <span className="AS-brand-check"><f.Icon /></span>
                                        <div className="AS-carousel-slide-body">
                                            <div className="AS-carousel-slide-title">{f.title}</div>
                                            <div className="AS-carousel-slide-desc">{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="AS-carousel-dots">
                                {FEATURE_SLIDES.map((_, i) => (
                                    <button
                                        key={i} type="button"
                                        className={`AS-carousel-dot ${i === slide ? 'active' : ''}`}
                                        onClick={() => goToSlide(i)}
                                        aria-label={`Show feature ${i + 1} of ${FEATURE_SLIDES.length}`}
                                    />
                                ))}
                            </div>
                        </div>
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
                            <span className="AS-form-eyebrow"><LockIcon /> Secure Sign In</span>
                            <h2 className="AS-form-title">
                                Welcome <span className="AS-t-accent">back</span>
                                <span className="AS-form-title-bar" />
                            </h2>
                            <p className="AS-form-sub">Sign in to access your WhiteNode workspace.</p>

                            <div className="AS-trust-row">
                                <span className="AS-trust-chip"><LockIcon /> Bank-grade Security</span>
                                <span className="AS-trust-chip"><GlobeIcon /> Access Anywhere</span>
                                <span className="AS-trust-chip"><BoltIcon /> 99.9% Uptime</span>
                            </div>

                            <form onSubmit={submitLogin} autoComplete="off" className={shake ? 'A-shake' : ''}>
                                {/* honeypot — absorbs the browser's autofill so it never
                                    lands in the real fields below, and combined with the
                                    readOnly-until-focused trick on those real fields, no
                                    previously-saved email/password ever shows on this page */}
                                <input type="text" name={`fakeuser_${fieldSuffix}`} autoComplete="off" data-lpignore="true" data-1p-ignore="true" style={{ display: 'none' }} readOnly tabIndex={-1} />
                                <input type="password" name={`fakepass_${fieldSuffix}`} autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" style={{ display: 'none' }} readOnly tabIndex={-1} />

                                <div className={`A-field ${fieldError ? 'has-error' : ''}`}>
                                    <label className="A-field-label">Email Address</label>
                                    <div className="A-input-wrap">
                                        <input
                                            type="email"
                                            className="A-input"
                                            placeholder="Enter your registered email address"
                                            name={`em_${fieldSuffix}`}
                                            data-field="email"
                                            id={`wn-login-email-${fieldSuffix}`}
                                            value={loginData.email}
                                            onChange={handleLoginChange}
                                            autoComplete="off"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            data-form-type="other"
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

                                <div className={`A-field ${fieldError ? 'has-error' : ''}`}>
                                    <label className="A-field-label">Password</label>
                                    <div className="A-input-wrap">
                                        <input
                                            type={maskSupported ? 'text' : (showPass ? 'text' : 'password')}
                                            className="A-input"
                                            placeholder="Enter your password"
                                            name={`pw_${fieldSuffix}`}
                                            data-field="password"
                                            id={`wn-login-password-${fieldSuffix}`}
                                            value={loginData.password}
                                            onChange={handleLoginChange}
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            data-form-type="other"
                                            readOnly
                                            onFocus={e => e.currentTarget.removeAttribute('readonly')}
                                            onAnimationStart={clearIfAutofilled}
                                            style={maskSupported && !showPass ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
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
                                    className={`AS-btn primary ${loginSuccess ? 'success' : ''}`}
                                    disabled={loading || loginSuccess}
                                >
                                    {loginSuccess
                                        ? <><span className="A-btn-check"><CheckCircleIcon /></span> Welcome back!</>
                                        : loading
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
