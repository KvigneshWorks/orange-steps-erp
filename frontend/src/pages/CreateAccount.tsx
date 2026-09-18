import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { AS_CSS } from './AccountSettingsTheme';
import { Ic } from '../components/Icon';
import { Button, Field, Input, PageHeader } from '../components/ui';
import { getStoredRole } from '../utils/roleAccess';

/**
 * "Create Account" — the replacement for the old public self-registration
 * page. Reachable from the sidebar under Account Settings.
 *
 * - Super Admin: sees a Role picker (Admin / User). The account is created
 *   directly and can log in immediately — shown as an "Active Now" banner.
 * - Admin: no Role picker — every account they create is a User account,
 *   and it always lands in the Super Admin's Pending Approvals queue
 *   (backend forces role='user' + pending regardless of what's sent). The
 *   page then shows a "Waiting for Approval" banner and quietly polls
 *   /auth/registration-status/{id} so it can flip to Approved / Rejected
 *   the moment the Super Admin decides — no refresh needed.
 */

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const POLL_MS = 4000;

interface FormState {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'user';
}

const EMPTY_FORM: FormState = { name: '', email: '', password: '', password_confirmation: '', role: 'user' };

/** 0-4 password strength score — used for the live meter on the Password field. */
function pwScore(pw: string): number {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
}
const PW_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

type OutcomeStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'created';

interface Outcome {
    id: number | null;
    name: string;
    status: OutcomeStatus;
    rejectReason: string | null;
}

const ROLE_CARD: Record<'user' | 'admin', { title: string; sub: string; icon: string; c: string; bg: string; bd: string }> = {
    user: {
        title: 'User', sub: 'Manpower Register & Attendance only',
        icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
        c: '#2563eb', bg: '#eff6ff', bd: '#bfdbfe',
    },
    admin: {
        title: 'Admin', sub: 'Most modules — can create User accounts',
        icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
        c: '#9333ea', bg: '#fdf4ff', bd: '#e9d5ff',
    },
};

const OUTCOME_META: Record<OutcomeStatus, { c: string; bg: string; bd: string }> = {
    pending: { c: '#C47E0A', bg: 'rgba(196,126,10,.10)', bd: 'rgba(196,126,10,.30)' },
    approved: { c: '#1E9C6A', bg: 'rgba(30,156,106,.10)', bd: 'rgba(30,156,106,.28)' },
    created: { c: '#1E9C6A', bg: 'rgba(30,156,106,.10)', bd: 'rgba(30,156,106,.28)' },
    rejected: { c: '#D93B55', bg: 'rgba(217,59,85,.10)', bd: 'rgba(217,59,85,.26)' },
    expired: { c: '#64748b', bg: 'rgba(100,116,139,.10)', bd: 'rgba(100,116,139,.26)' },
};

const CONFETTI_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

/** Big animated status icon — a hand-drawn checkmark / X (stroke-draw
 * animation, pathLength=100 so the dash math doesn't depend on the real
 * path length), a spinner for "pending", or a clock for "expired". */
function BannerIcon({ status, c }: { status: OutcomeStatus; c: string }) {
    if (status === 'pending') {
        return <span className="AS-spinner-lg" style={{ '--as-c': c, width: 30, height: 30, borderWidth: 3 } as any} />;
    }
    if (status === 'approved' || status === 'created') {
        return (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path className="as-draw-path" pathLength={100} d="M5 13l4 4L19 7" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    if (status === 'rejected') {
        return (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path className="as-draw-path" pathLength={100} d="M6 6l12 12" stroke={c} strokeWidth={2.4} strokeLinecap="round" style={{ animationDelay: '.15s' }} />
                <path className="as-draw-path" pathLength={100} d="M18 6L6 18" stroke={c} strokeWidth={2.4} strokeLinecap="round" style={{ animationDelay: '.32s' }} />
            </svg>
        );
    }
    return <Ic d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" sz={30} c={c} sw={2} />;
}

function Confetti() {
    return (
        <div className="AS-confetti">
            {CONFETTI_ANGLES.map((a, i) => (
                <span key={a} style={{ '--a': `${a}deg`, animationDelay: `${i * 0.025}s`, background: i % 3 === 1 ? '#60A5FA' : i % 3 === 2 ? '#F5C542' : undefined } as any} />
            ))}
        </div>
    );
}

/** 3-step progress tracker: Submitted → Under Review → Decision. Skipped
 * entirely for a Super Admin's direct "created" outcome — there's no
 * review queue in that path, so a stepper would just be noise. */
function OutcomeStepper({ status }: { status: OutcomeStatus }) {
    const resolved = status !== 'pending';
    const finalLabel = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : status === 'expired' ? 'Expired' : 'Decision';
    return (
        <div className="AS-stepper">
            <div className="AS-step done">
                <div className="AS-step-dot"><Ic d="M5 13l4 4L19 7" sz={10} c="#fff" sw={3} /></div>
                <div className="AS-step-label">Submitted</div>
            </div>
            <div className="AS-step-line done" />
            <div className={`AS-step ${resolved ? 'done' : 'active'}`}>
                <div className="AS-step-dot">{resolved ? <Ic d="M5 13l4 4L19 7" sz={10} c="#fff" sw={3} /> : '2'}</div>
                <div className="AS-step-label">Under Review</div>
            </div>
            <div className={`AS-step-line ${resolved ? 'done' : ''}`} />
            <div className={`AS-step ${resolved ? 'done' : ''}`}>
                <div className="AS-step-dot">{resolved ? <Ic d="M5 13l4 4L19 7" sz={10} c="#fff" sw={3} /> : '3'}</div>
                <div className="AS-step-label">{finalLabel}</div>
            </div>
        </div>
    );
}

/**
 * Full-page status stage — replaces the compact form the moment there's
 * an outcome to show. Centered, generous whitespace, each element fades
 * up in sequence so it reads as a dedicated status page rather than a
 * small card squeezed above the fold.
 *
 * "Create Another" is deliberately hidden while `pending` — there's
 * nothing to do but wait, so showing it early just invites someone to
 * abandon a request that's still being reviewed. It appears only once
 * the Super Admin has actually decided (approved/rejected) or the
 * request expired, or immediately for a Super Admin's own direct create.
 */
function OutcomeStage({ outcome, onReset }: { outcome: Outcome; onReset: () => void }) {
    const meta = OUTCOME_META[outcome.status];
    const heading =
        outcome.status === 'pending' ? 'Waiting for Super Admin Approval' :
            outcome.status === 'approved' ? 'Approved — Ready to Sign In' :
                outcome.status === 'created' ? 'Account Created — Active Now' :
                    outcome.status === 'rejected' ? 'Request Rejected' : 'Request Expired';
    const sub =
        outcome.status === 'pending'
            ? `${outcome.name}'s request is sitting in the Super Admin's Pending Approvals queue. This page updates on its own the moment it's decided — no need to refresh.`
            : outcome.status === 'approved'
                ? `${outcome.name}'s account has been approved. They can log in with the email and password you entered.`
                : outcome.status === 'created'
                    ? `${outcome.name}'s account is live. They can log in right away with the email and password you entered.`
                    : outcome.status === 'rejected'
                        ? (outcome.rejectReason ? `The Super Admin rejected this request: "${outcome.rejectReason}"` : `The Super Admin rejected ${outcome.name}'s request.`)
                        : `This request was not decided in time and has expired. Please submit it again.`;
    const isSuccess = outcome.status === 'approved' || outcome.status === 'created';
    const resolved = outcome.status !== 'pending';

    return (
        <div className="AS-stage" style={{ '--as-c': meta.c, '--as-bg': meta.bg, '--as-bd': meta.bd } as any}>
            <div className="AS-stage-glow" />
            <div className="AS-stage-card">
                <div className="AS-stage-icstage AS-stage-item" style={{ animationDelay: '0s' }}>
                    {outcome.status === 'pending' && <>
                        <span className="AS-stage-ring" />
                        <span className="AS-stage-ring" />
                        <span className="AS-stage-ring" />
                    </>}
                    <div className={`AS-stage-ic ${outcome.status === 'rejected' ? 'shake' : 'pop'}`}>
                        <BannerIcon status={outcome.status} c={meta.c} />
                    </div>
                    {isSuccess && <Confetti />}
                </div>

                {outcome.status === 'pending' && (
                    <div className="AS-live-pill AS-stage-item" style={{ animationDelay: '.08s' }}>
                        <span className="AS-live-dot" /> Live — checking every 4s
                    </div>
                )}

                <div className="AS-stage-title AS-stage-item" style={{ animationDelay: '.14s' }}>{heading}</div>
                <div className="AS-stage-sub AS-stage-item" style={{ animationDelay: '.2s' }}>{sub}</div>

                {outcome.status !== 'created' && (
                    <div className="AS-stage-item" style={{ animationDelay: '.28s' }}>
                        <OutcomeStepper status={outcome.status} />
                    </div>
                )}

                <div className="AS-stage-meta AS-stage-item" style={{ animationDelay: '.34s' }}>
                    <span className={`AS-pill ${outcome.status === 'created' ? 'active' : outcome.status}`}>
                        <span className="AS-pill-dot" />
                        {outcome.status === 'created' ? 'Active' : outcome.status}
                    </span>
                    <span>{outcome.name}</span>
                </div>

                {resolved && (
                    <div className="AS-stage-actions AS-stage-item" style={{ animationDelay: '.4s' }}>
                        <Button variant="secondary" onClick={onReset} icon={<Ic d="M12 4v16m-8-8h16" sz={12} c="currentColor" sw={2.2} />}>
                            Create Another
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CreateAccount() {
    const role = getStoredRole();
    const isSuperAdmin = role === 'super_admin';

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    useEffect(() => stopPolling, []);

    const startPolling = (id: number) => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const res = await axiosInstance.get(`auth/registration-status/${id}`, { headers: authH() });
                const s = res.data?.status as OutcomeStatus | 'not_found' | undefined;
                if (!s || s === 'pending' || s === 'not_found') return;
                stopPolling();
                setOutcome(o => (o ? { ...o, status: s, rejectReason: res.data?.reject_reason ?? null } : o));
                if (s === 'approved') {
                    toast.success('Approved!', `${res.data?.name || 'The account'} was approved by the Super Admin and can sign in now.`);
                } else if (s === 'rejected') {
                    toast.error('Request Rejected', res.data?.reject_reason || `The Super Admin rejected this request.`);
                }
                window.dispatchEvent(new Event('erp:notifications-refresh'));
            } catch { /* silent — try again next tick */ }
        }, POLL_MS);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrors(er => (er[name] ? { ...er, [name]: '' } : er));
    };

    const resetForm = () => {
        stopPolling();
        setOutcome(null);
        setForm(EMPTY_FORM);
        setErrors({});
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (form.password.length < 8) {
            setErrors(er => ({ ...er, password: 'Must be at least 8 characters' }));
            return;
        }
        if (form.password !== form.password_confirmation) {
            setErrors(er => ({ ...er, password_confirmation: 'Passwords do not match' }));
            toast.error('Password Mismatch', 'Password and confirmation must match');
            return;
        }

        setSubmitting(true);
        try {
            const payload: Record<string, string> = {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                password_confirmation: form.password_confirmation,
            };
            if (isSuperAdmin) payload.role = form.role;

            const res = await axiosInstance.post('auth/register', payload, { headers: authH() });
            const createdName = form.name.trim();

            if (res.data.pending) {
                setOutcome({ id: res.data.id ?? null, name: createdName, status: 'pending', rejectReason: null });
                toast.success('Sent for Approval', res.data.message || `${createdName}'s request was sent to the Super Admin.`);
                if (res.data.id) startPolling(res.data.id);
            } else {
                setOutcome({ id: res.data.user?.id ?? null, name: createdName, status: 'created', rejectReason: null });
                toast.success('Account Created', res.data.message || `${createdName}'s account is active now.`);
            }
            setForm(EMPTY_FORM);
            setErrors({});
            window.dispatchEvent(new Event('erp:notifications-refresh'));
        } catch (err: any) {
            const resp = err?.response?.data;
            if (resp?.errors) {
                const flat: Record<string, string> = {};
                Object.entries(resp.errors as Record<string, string[]>).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setErrors(flat);
                toast.error('Could Not Create Account', Object.values(flat)[0] || 'Please check the form and try again.');
            } else {
                toast.error('Could Not Create Account', resp?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ERP-page">
            <style>{ERP_CSS}</style>
            <style>{AS_CSS}</style>

            <PageHeader eyebrow="Account Settings" title="Create" titleEm="Account" />

            <div className="ERP-divider" />

            {outcome ? (
                <OutcomeStage key={outcome.status} outcome={outcome} onReset={resetForm} />
            ) : (
                <div className="AS-create">
                    {/* ── LEFT: journey panel — what happens end to end ── */}
                    <div className="AS-create-side">
                        <div className="AS-create-side-ic">
                            <Ic d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" sz={19} c="#fff" sw={1.8} />
                        </div>
                        <div className="AS-create-side-title">{isSuperAdmin ? 'Add a teammate' : 'Add a new User'}</div>
                        <div className="AS-create-side-sub">
                            {isSuperAdmin
                                ? 'Create an Admin or User account for OrangeSteps. As Super Admin, anyone you add here can sign in right away — no approval step.'
                                : "Fill in their details on the right. Every account an Admin creates is a User account, sent straight to the Super Admin's Pending Approvals queue."}
                        </div>

                        <div className="AS-create-flow">
                            <div className="AS-create-flow-item now">
                                <div className="AS-create-flow-dot">1</div>
                                <div className="AS-create-flow-body">
                                    <div className="AS-create-flow-t">Fill the form</div>
                                    <div className="AS-create-flow-d">Name, email, password{isSuperAdmin ? ' and a role' : ''} — you're here now</div>
                                </div>
                            </div>
                            <div className="AS-create-flow-line" />
                            {isSuperAdmin ? (
                                <div className="AS-create-flow-item">
                                    <div className="AS-create-flow-dot">2</div>
                                    <div className="AS-create-flow-body">
                                        <div className="AS-create-flow-t">Active immediately</div>
                                        <div className="AS-create-flow-d">No approval needed — they can sign in the moment you hit Create</div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="AS-create-flow-item">
                                        <div className="AS-create-flow-dot">2</div>
                                        <div className="AS-create-flow-body">
                                            <div className="AS-create-flow-t">Waiting for Super Admin</div>
                                            <div className="AS-create-flow-d">Lands in Pending Approvals — this page tracks it live, no refresh needed</div>
                                        </div>
                                    </div>
                                    <div className="AS-create-flow-line" />
                                    <div className="AS-create-flow-item">
                                        <div className="AS-create-flow-dot">3</div>
                                        <div className="AS-create-flow-body">
                                            <div className="AS-create-flow-t">Approved &amp; active</div>
                                            <div className="AS-create-flow-d">They can sign in the moment it's approved</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isSuperAdmin && (
                            <div className="AS-create-side-note">
                                <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={13} c="rgba(255,255,255,.85)" sw={2} />
                                Accounts you create are always User accounts, and need Super Admin approval before they can log in.
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: the form itself ── */}
                    <div className="AS-create-main">
                        <div className="AS-create-card">
                            <div className="AS-create-card-hdr">
                                <div className="AS-create-card-ic">
                                    <Ic d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" sz={18} c="var(--ember)" sw={1.8} />
                                </div>
                                <div>
                                    <div className="AS-create-card-title">{isSuperAdmin ? 'New Admin or User Account' : 'New User Account'}</div>
                                    <div className="AS-create-card-sub">All fields below are required</div>
                                </div>
                            </div>

                            <div className="AS-create-card-body">
                                <form onSubmit={handleSubmit} noValidate>

                                    <div className="AS-create-section">
                                        <span className="AS-create-section-num">01</span>
                                        <span className="AS-create-section-lbl">Identity</span>
                                        <span className="AS-create-section-rule" />
                                    </div>
                                    <div className="ERP-g2">
                                        <Field label="Full Name" error={errors.name}>
                                            <div className="AS-field-ic">
                                                <span className="AS-field-ic-svg"><Ic d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" sz={13} c="currentColor" sw={2} /></span>
                                                <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Priya Sharma" required />
                                            </div>
                                        </Field>
                                        <Field label="Email" error={errors.email}>
                                            <div className="AS-field-ic">
                                                <span className="AS-field-ic-svg"><Ic d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" sz={13} c="currentColor" sw={1.8} /></span>
                                                <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="AS-create-section">
                                        <span className="AS-create-section-num">02</span>
                                        <span className="AS-create-section-lbl">Security</span>
                                        <span className="AS-create-section-rule" />
                                    </div>
                                    <div className="ERP-g2">
                                        <Field label="Password" error={errors.password}>
                                            <div className="AS-field-ic">
                                                <span className="AS-field-ic-svg"><Ic d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" sz={13} c="currentColor" sw={1.8} /></span>
                                                <Input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" required minLength={8} />
                                            </div>
                                            {form.password && (
                                                <>
                                                    <div className={`AS-pw-meter s${pwScore(form.password)}`}><span /><span /><span /><span /></div>
                                                    <div className={`AS-pw-hint s${pwScore(form.password)}`}>{PW_LABEL[pwScore(form.password)]}</div>
                                                </>
                                            )}
                                        </Field>
                                        <Field label="Confirm Password" error={errors.password_confirmation}>
                                            <div className="AS-field-ic">
                                                <span className="AS-field-ic-svg"><Ic d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" sz={13} c="currentColor" sw={1.8} /></span>
                                                <Input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} placeholder="Re-enter password" required minLength={8} />
                                            </div>
                                            {form.password_confirmation && (
                                                <div className={`AS-pw-match ${form.password === form.password_confirmation ? 'ok' : 'bad'}`}>
                                                    <Ic d={form.password === form.password_confirmation ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} sz={10} c="currentColor" sw={2.6} />
                                                    {form.password === form.password_confirmation ? 'Passwords match' : "Doesn't match yet"}
                                                </div>
                                            )}
                                        </Field>
                                    </div>

                                    {isSuperAdmin && (
                                        <>
                                            <div className="AS-create-section">
                                                <span className="AS-create-section-num">03</span>
                                                <span className="AS-create-section-lbl">Access Level</span>
                                                <span className="AS-create-section-rule" />
                                            </div>
                                            <div className="ERP-g1">
                                                <Field label="Role">
                                                    <div className="AS-role-cards">
                                                        {(['user', 'admin'] as const).map(r => {
                                                            const rc = ROLE_CARD[r];
                                                            const selected = form.role === r;
                                                            return (
                                                                <div
                                                                    key={r}
                                                                    className={`AS-role-card${selected ? ' selected' : ''}`}
                                                                    style={{ '--as-c': rc.c, '--as-bg': rc.bg, '--as-bd': rc.bd, '--as-ring': `${rc.bg}` } as any}
                                                                    onClick={() => setForm(f => ({ ...f, role: r }))}
                                                                >
                                                                    <div className="AS-role-card-ic"><Ic d={rc.icon} sz={16} c={rc.c} sw={1.8} /></div>
                                                                    <div className="AS-role-card-txt">
                                                                        <div className="AS-role-card-title">{rc.title}</div>
                                                                        <div className="AS-role-card-sub">{rc.sub}</div>
                                                                    </div>
                                                                    <div className="AS-role-card-check">
                                                                        {selected && <Ic d="M5 13l4 4L19 7" sz={10} c="#fff" sw={3} />}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </Field>
                                            </div>
                                        </>
                                    )}

                                    <div className="AS-create-card-foot">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={submitting}
                                            loadingText={isSuperAdmin ? 'Creating...' : 'Sending...'}
                                            icon={<Ic d="M12 4v16m-8-8h16" sz={13} c="#fff" sw={2.2} />}
                                        >
                                            {isSuperAdmin ? 'Create Account' : 'Send for Approval'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
