import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import './Auth.css';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';

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

function RoleIcon({ type }: { type: string }) {
    const common = { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (type === 'shield') return <svg {...common}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /></svg>;
    if (type === 'crown') return <svg {...common}><path d="M3 18h18M4 18l-1-9 5 4 4-6 4 6 5-4-1 9" /></svg>;
    return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.31 3.13-6 7-6s7 2.69 7 6" /></svg>;
}

function CheckIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );
}

// Scoped styles for the "waiting for approval" panel's live status states
// (pending / approved / rejected / expired) — kept local to this component
// rather than in Auth.css since they're only ever used here.
const PENDING_STATUS_CSS = `
@keyframes AS-pstatPop {
  0%   { opacity: 0; transform: scale(.4) rotate(-14deg); }
  55%  { opacity: 1; transform: scale(1.14) rotate(3deg); }
  75%  { transform: scale(.95) rotate(-1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes AS-checkDraw {
  to { stroke-dashoffset: 0; }
}
@keyframes AS-ringPulse {
  0%   { box-shadow: 0 0 0 0 rgba(30,156,106,0.38); }
  100% { box-shadow: 0 0 0 16px rgba(30,156,106,0); }
}
@keyframes AS-pstatShake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(5px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(2px); }
}
@keyframes AS-pstatDot {
  0%, 100% { opacity: .3; transform: scale(.75); }
  50%      { opacity: 1;  transform: scale(1.15); }
}
.AS-pstat-icon-wrap {
  width: 64px; height: 64px; margin: 4px auto 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.AS-pstat-pop { animation: AS-pstatPop .55s cubic-bezier(.22,1,.36,1) both; }
.AS-pstat-shake { animation: AS-pstatPop .55s cubic-bezier(.22,1,.36,1) both, AS-pstatShake .5s ease-in-out .55s both; }
.AS-pstat-live {
  display: inline-flex; align-items: center; gap: 7px; margin-top: 18px;
  font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .4px;
  color: var(--text-4, #999); text-transform: uppercase;
}
.AS-pstat-live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--ember, #2563EB);
  animation: AS-pstatDot 1.5s ease-in-out infinite;
}
.AS-pstat-reason {
  max-width: 320px; margin: 14px auto 0; padding: 10px 16px; border-radius: 10px;
  background: rgba(217,59,85,0.06); border: 1px solid rgba(217,59,85,0.18);
  color: var(--text-3, #666); font-size: 12.5px; font-style: italic; line-height: 1.5;
}
@media (prefers-reduced-motion: reduce) {
  .AS-pstat-pop, .AS-pstat-shake, .AS-pstat-live-dot { animation: none !important; }
}
`;

export default function Auth({ onLoginSuccess }: AuthProps) {
    const [page, setPage] = useState<'login' | 'register'>('login');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', password_confirmation: '', role: 'user'
    });

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);
    // Every role (user/admin/super_admin) now goes through MD approval —
    // register() no longer creates a login. This flips once the request
    // has been submitted, swapping the form for a "waiting for approval"
    // panel instead of redirecting to sign-in (there's nothing to sign
    // into yet).
    const [pendingApproval, setPendingApproval] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');
    // id of the UserApprovalRequest row — used to poll for the MD's
    // decision so this screen can flip to a success/sorry state live,
    // instead of just sitting on a static "waiting" message forever.
    const [pendingRequestId, setPendingRequestId] = useState<number | null>(null);
    const [pendingStatus, setPendingStatus] = useState<'pending' | 'approved' | 'rejected' | 'expired'>('pending');
    const [pendingRejectReason, setPendingRejectReason] = useState('');
    const [roleOpen, setRoleOpen] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showPassConf, setShowPassConf] = useState(false);
    const [shake, setShake] = useState(false);
    // Bumped every time we navigate to login/register — used as the
    // form's React `key` so the browser gets a truly fresh set of DOM
    // input nodes each visit, instead of ones it might still associate
    // with a previously-typed password.
    const [formKey, setFormKey] = useState(0);
    const roleRef = useRef<HTMLDivElement>(null);
    const roleTriggerRef = useRef<HTMLDivElement>(null);
    const rolePanelRef = useRef<HTMLDivElement>(null);
    const onRoleTriggerKeyDown = useDropdownTriggerKeyDown(roleOpen, setRoleOpen);
    useDropdownPanelArrowNav(roleOpen, setRoleOpen, rolePanelRef, roleTriggerRef);
    const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // The Role menu is rendered through a portal straight onto <body> and
    // positioned with `fixed` coordinates measured from the trigger — this
    // guarantees it always paints above every other field/row on the page,
    // no matter what stacking context the surrounding form ends up with.
    const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
    useEffect(() => {
        if (!roleOpen) return;
        const updatePos = () => {
            const el = roleTriggerRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setDropPos({ top: r.bottom + 6, left: r.left, width: r.width });
        };
        updatePos();
        window.addEventListener('scroll', updatePos, true);
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
        };
    }, [roleOpen]);

    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);

    const triggerShake = (msg: string) => {
        setMessage(msg);
        setMessageType('error');
        setShake(true);
        if (shakeTimer.current) clearTimeout(shakeTimer.current);
        shakeTimer.current = setTimeout(() => setShake(false), 450);
    };

    const roleOptions = [
        { value: 'user',        label: 'User',        icon: 'user',  desc: 'Manpower Register + Attendance only' },
        { value: 'admin',       label: 'Admin',       icon: 'shield', desc: 'All operations except Accounts Receivable' },
        { value: 'super_admin', label: 'Super Admin', icon: 'crown', desc: 'Full access to all screens' },
    ];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const inTrigger = roleRef.current?.contains(target) ?? false;
            const inMenu = rolePanelRef.current?.contains(target) ?? false;
            if (!inTrigger && !inMenu) setRoleOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { if (roleOpen) { markPanelOpen(); return () => markPanelClosed(); } }, [roleOpen]);

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const base = import.meta.env.BASE_URL || '/';
            const cleanPath = path.replace(/^\/+|\/+$/g, '');
            const cleanBase = base.replace(/^\/+|\/+$/g, '');
            let route = '';
            if (cleanPath.startsWith(cleanBase)) {
                route = cleanPath.slice(cleanBase.length).replace(/^\/+|\/+$/g, '');
            } else { route = cleanPath; }
            if (route === 'register') setPage('register');
            else setPage('login');
        };
        window.addEventListener('popstate', handlePopState);
        handlePopState();
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const targetPath = page === 'login' ? base : `${base}${page}`;
        if (window.location.pathname !== targetPath)
            window.history.pushState({ nav: page }, '', targetPath);
    }, [page]);

    const navigate = (to: 'login' | 'register') => {
        setMessage('');
        setRoleOpen(false);
        setShowPass(false);
        setShowPassConf(false);
        setFormKey(k => k + 1);
        setPendingApproval(false);
        setPendingRequestId(null);
        setPendingStatus('pending');
        setPendingRejectReason('');
        if (to === 'register') setFormData({ name: '', email: '', password: '', password_confirmation: '', role: 'user' });
        if (to === 'login') setLoginData({ email: '', password: '' });
        setPage(to);
    };

    // Poll the MD's decision every 5s while the "waiting for approval"
    // panel is showing and still pending — flips this screen to a live
    // success/sorry state the moment the MD decides, no refresh needed.
    useEffect(() => {
        if (!pendingApproval || !pendingRequestId || pendingStatus !== 'pending') return;
        let cancelled = false;
        const check = async () => {
            try {
                const res = await axiosInstance.get(`/auth/registration-status/${pendingRequestId}`);
                if (cancelled) return;
                const status = res.data?.status as typeof pendingStatus;
                if (status && status !== 'pending') {
                    setPendingStatus(status);
                    if (status === 'rejected') setPendingRejectReason(res.data?.reject_reason || '');
                }
            } catch {
                // Network hiccup — just retry on the next tick, no need to surface it.
            }
        };
        check();
        const interval = setInterval(check, 5000);
        return () => { cancelled = true; clearInterval(interval); };
    }, [pendingApproval, pendingRequestId, pendingStatus]);

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

    const submitRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.password_confirmation) {
            triggerShake('Please fill in all required fields.'); return;
        }
        if (formData.password !== formData.password_confirmation) {
            triggerShake('Passwords do not match.'); return;
        }
        setLoading(true); setMessage('');
        try {
            // Trim name/email before sending — matches the backend's own
            // normalization so a stray space typed/pasted here can never
            // create an account that later fails to log in.
            const res = await axiosInstance.post('/auth/register', {
                ...formData,
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
            });

            // REQUIRE_APPROVAL=false on the backend — the account was
            // created immediately and a login token came back with it,
            // but we deliberately do NOT use that token to sign the
            // person straight into the project. Registering should
            // always hand back to the Login screen so they sign in
            // explicitly with the account they just made.
            if (res.data?.token) {
                toast.success('Account Created!', 'Please sign in to continue');
                const justRegisteredEmail = formData.email.trim().toLowerCase();
                navigate('login');
                setLoginData({ email: justRegisteredEmail, password: '' });
                setMessage('Account created! Sign in below with your new details.');
                setMessageType('success');
                return;
            }

            // Otherwise the approval gate is on — no account/token yet,
            // swap the form for a waiting panel instead of redirecting.
            setPendingMessage(res.data?.message || 'Your account request has been sent for approval.');
            setPendingRequestId(res.data?.id ?? null);
            setPendingStatus('pending');
            setPendingApproval(true);
            toast.success('Request Sent!', 'Waiting for the MD to approve your account');
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Registration failed. Please try again.');
            setMessageType('error');
        } finally { setLoading(false); }
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

    const selectedRole = roleOptions.find(r => r.value === formData.role) || roleOptions[0];
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
                    RIGHT — FORM PANEL
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

                        <div className="AS-tabs">
                            <button
                                type="button"
                                className={`AS-tab${page === 'login' ? ' active' : ''}`}
                                onClick={() => page !== 'login' && navigate('login')}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={`AS-tab${page === 'register' ? ' active' : ''}`}
                                onClick={() => page !== 'register' && navigate('register')}
                            >
                                Create Account
                            </button>
                        </div>

                        {/* ══════════════════════════════
                            LOGIN
                        ══════════════════════════════ */}
                        {page === 'login' && (
                            <div className="AS-form-wrap">
                                <h2 className="AS-form-title">
                                    Welcome <span className="AS-t-accent">back</span>
                                    <span className="AS-form-title-bar" />
                                </h2>
                                <p className="AS-form-sub">Sign in to access your WhiteNode workspace.</p>

                                <form key={formKey} onSubmit={submitLogin} autoComplete="off" className={shake ? 'A-shake' : ''}>
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

                                    <div className="AS-switch">
                                        Don&apos;t have an account?{' '}
                                        <button type="button" className="AS-switch-btn" onClick={() => navigate('register')}>
                                            Create one
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ══════════════════════════════
                            REGISTER — pending / approved / rejected / expired
                        ══════════════════════════════ */}
                        {page === 'register' && pendingApproval && (
                            <div className="AS-form-wrap AS-form-wrap-register" style={{ textAlign: 'center' }}>
                                <style>{PENDING_STATUS_CSS}</style>

                                {pendingStatus === 'pending' && (
                                    <>
                                        <div className="AS-pstat-icon-wrap" style={{ background: 'rgba(37,99,235,0.1)', border: '1.5px solid rgba(37,99,235,0.28)' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ember, #2563EB)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 7v5l3.5 2" />
                                            </svg>
                                        </div>
                                        <h2 className="AS-form-title" style={{ justifyContent: 'center' }}>
                                            Waiting for <span className="AS-t-accent">approval</span>
                                            <span className="AS-form-title-bar" style={{ margin: '10px auto 0' }} />
                                        </h2>
                                        <p className="AS-form-sub" style={{ maxWidth: 340, margin: '14px auto 0' }}>
                                            {pendingMessage}
                                        </p>
                                        <p className="AS-form-sub" style={{ maxWidth: 340, margin: '10px auto 0', fontSize: 12.5, opacity: 0.75 }}>
                                            You'll be able to sign in as soon as the MD approves your request — no further action needed on your side.
                                        </p>
                                        <div className="AS-pstat-live">
                                            <span className="AS-pstat-live-dot" />
                                            Checking for the MD's decision…
                                        </div>
                                        <button
                                            type="button"
                                            className="AS-btn primary"
                                            style={{ marginTop: 22 }}
                                            onClick={() => navigate('login')}
                                        >
                                            Back to Sign In
                                        </button>
                                    </>
                                )}

                                {pendingStatus === 'approved' && (
                                    <>
                                        <div className="AS-pstat-icon-wrap AS-pstat-pop" style={{ background: 'rgba(30,156,106,0.12)', border: '1.5px solid rgba(30,156,106,0.32)', animation: 'AS-ringPulse 1.6s ease-out 1' }}>
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1E9C6A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path className="AS-pstat-check" d="M4 12.5l5 5L20 6" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'AS-checkDraw .5s ease-out .35s forwards' }} />
                                            </svg>
                                        </div>
                                        <h2 className="AS-form-title" style={{ justifyContent: 'center' }}>
                                            You're <span className="AS-t-accent" style={{ color: '#1E9C6A' }}>approved!</span>
                                            <span className="AS-form-title-bar" style={{ margin: '10px auto 0', background: '#1E9C6A' }} />
                                        </h2>
                                        <p className="AS-form-sub" style={{ maxWidth: 340, margin: '14px auto 0' }}>
                                            Welcome aboard — the MD approved your request. Your account is ready.
                                        </p>
                                        <button
                                            type="button"
                                            className="AS-btn primary"
                                            style={{ marginTop: 26, background: '#1E9C6A', borderColor: '#1E9C6A' }}
                                            onClick={() => { setLoginData(prev => ({ ...prev, email: formData.email })); navigate('login'); }}
                                        >
                                            Sign In Now <span className="A-btn-arrow"><AuthArrowIcon /></span>
                                        </button>
                                    </>
                                )}

                                {pendingStatus === 'rejected' && (
                                    <>
                                        <div className="AS-pstat-icon-wrap AS-pstat-pop AS-pstat-shake" style={{ background: 'rgba(217,59,85,0.1)', border: '1.5px solid rgba(217,59,85,0.3)' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D93B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 6l12 12M18 6L6 18" />
                                            </svg>
                                        </div>
                                        <h2 className="AS-form-title" style={{ justifyContent: 'center' }}>
                                            Sorry, <span className="AS-t-accent" style={{ color: '#D93B55' }}>not approved</span>
                                            <span className="AS-form-title-bar" style={{ margin: '10px auto 0', background: '#D93B55' }} />
                                        </h2>
                                        <p className="AS-form-sub" style={{ maxWidth: 340, margin: '14px auto 0' }}>
                                            The MD didn't approve this request, so no account was created.
                                        </p>
                                        {pendingRejectReason && (
                                            <p className="AS-pstat-reason">"{pendingRejectReason}"</p>
                                        )}
                                        <button
                                            type="button"
                                            className="AS-btn primary"
                                            style={{ marginTop: 26 }}
                                            onClick={() => navigate('register')}
                                        >
                                            Try Again
                                        </button>
                                    </>
                                )}

                                {pendingStatus === 'expired' && (
                                    <>
                                        <div className="AS-pstat-icon-wrap AS-pstat-pop" style={{ background: 'rgba(100,116,139,0.1)', border: '1.5px solid rgba(100,116,139,0.28)' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M9 9l6 6M15 9l-6 6" />
                                            </svg>
                                        </div>
                                        <h2 className="AS-form-title" style={{ justifyContent: 'center' }}>
                                            Request <span className="AS-t-accent" style={{ color: '#64748b' }}>expired</span>
                                            <span className="AS-form-title-bar" style={{ margin: '10px auto 0', background: '#64748b' }} />
                                        </h2>
                                        <p className="AS-form-sub" style={{ maxWidth: 340, margin: '14px auto 0' }}>
                                            This request wasn't decided within 24 hours. Please register again.
                                        </p>
                                        <button
                                            type="button"
                                            className="AS-btn primary"
                                            style={{ marginTop: 26 }}
                                            onClick={() => navigate('register')}
                                        >
                                            Register Again
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════
                            REGISTER
                        ══════════════════════════════ */}
                        {page === 'register' && !pendingApproval && (
                            <div className="AS-form-wrap AS-form-wrap-register">
                                <h2 className="AS-form-title">
                                    Create your <span className="AS-t-accent">account</span>
                                    <span className="AS-form-title-bar" />
                                </h2>
                                <p className="AS-form-sub">Set up access to your WhiteNode workspace.</p>

                                <form key={formKey} onSubmit={submitRegister} autoComplete="off" className={shake ? 'A-shake' : ''}>
                                    {/* honeypot — stops browser autofill from targeting real fields */}
                                    <input type="text" name="fakeuser_" style={{ display: 'none' }} readOnly tabIndex={-1} />
                                    <input type="password" name="fakepass_" style={{ display: 'none' }} readOnly tabIndex={-1} />

                                    <div className="A-field-row">
                                        <div className="A-field" style={{ marginBottom: 0 }}>
                                            <label className="A-field-label">Full Name</label>
                                            <div className="A-input-wrap">
                                                <input
                                                    type="text"
                                                    className="A-input"
                                                    placeholder="Enter your full name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleRegisterChange}
                                                    autoComplete="off"
                                                />
                                                <span className="A-input-icon">
                                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Role custom dropdown */}
                                        <div className={`A-drop-wrap${roleOpen ? ' open' : ''}`} style={{ marginBottom: 0 }} ref={roleRef}>
                                            <span className="A-drop-label">Role</span>
                                            <div
                                                className="A-drop-trigger"
                                                ref={roleTriggerRef}
                                                onClick={() => setRoleOpen(v => !v)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => { if (e.key === 'Enter' && roleOpen) { setRoleOpen(false); return; } onRoleTriggerKeyDown(e); }}
                                            >
                                                <span className="A-drop-trigger-icon"><RoleIcon type={selectedRole.icon} /></span>
                                                <span className="A-drop-trigger-txt">{selectedRole.label}</span>
                                                <svg className="A-drop-caret" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>

                                            {roleOpen && dropPos && createPortal(
                                                <div
                                                    className="A-drop-menu A-drop-menu-portal"
                                                    ref={rolePanelRef}
                                                    style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, right: 'auto' }}
                                                >
                                                    {roleOptions.map(opt => (
                                                        <div
                                                            key={opt.value}
                                                            role="option" tabIndex={-1} aria-selected={formData.role === opt.value}
                                                            className={`A-drop-opt${formData.role === opt.value ? ' selected' : ''}`}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, role: opt.value }));
                                                                setRoleOpen(false);
                                                            }}
                                                        >
                                                            <span className="A-drop-opt-icon"><RoleIcon type={opt.icon} /></span>
                                                            <span style={{ display:'flex', flexDirection:'column', gap:1, flex:1 }}>
                                                                <span>{opt.label}</span>
                                                                <span style={{ fontSize: '8px', opacity:.5, fontFamily:'var(--font-mono,monospace)', letterSpacing:'.3px' }}>{opt.desc}</span>
                                                            </span>
                                                            <svg className="A-drop-opt-check" width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ))}
                                                </div>,
                                                document.body
                                            )}
                                        </div>
                                    </div>

                                    <div className="A-field-row">
                                        <div className="A-field" style={{ marginBottom: 0 }}>
                                            <label className="A-field-label">Email Address</label>
                                            <div className="A-input-wrap">
                                                <input
                                                    type="email"
                                                    className="A-input"
                                                    placeholder="you@company.com"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleRegisterChange}
                                                    autoComplete="off"
                                                />
                                                <span className="A-input-icon">
                                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="A-field" style={{ marginBottom: 0 }}>
                                            <label className="A-field-label">Password</label>
                                            <div className="A-input-wrap">
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    className="A-input"
                                                    placeholder="••••••••"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleRegisterChange}
                                                    autoComplete="new-password"
                                                />
                                                <button type="button" className="A-input-toggle" onClick={() => setShowPass(v => !v)}>
                                                    {showPass ? (
                                                        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="A-field-row" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
                                        <div className="A-field" style={{ marginBottom: 0 }}>
                                            <label className="A-field-label">Confirm Password</label>
                                            <div className="A-input-wrap">
                                                <input
                                                    type={showPassConf ? 'text' : 'password'}
                                                    className="A-input"
                                                    placeholder="••••••••"
                                                    name="password_confirmation"
                                                    value={formData.password_confirmation}
                                                    onChange={handleRegisterChange}
                                                    autoComplete="new-password"
                                                />
                                                <button type="button" className="A-input-toggle" onClick={() => setShowPassConf(v => !v)}>
                                                    {showPassConf ? (
                                                        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="AS-btn primary"
                                        disabled={loading}
                                        style={{ marginTop: 18 }}
                                    >
                                        {loading
                                            ? <><span className="A-spin" /> Creating account…</>
                                            : <>Create Account <span className="A-btn-arrow"><AuthArrowIcon /></span></>
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

                                    <div className="AS-switch">
                                        Already have an account?{' '}
                                        <button type="button" className="AS-switch-btn" onClick={() => navigate('login')}>
                                            Sign in
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
