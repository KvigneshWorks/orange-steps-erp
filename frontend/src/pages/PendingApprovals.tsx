import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { AS_CSS } from './AccountSettingsTheme';
import { Ic } from '../components/Icon';
import { PageHeader } from '../components/ui';
import Pagination from '../components/Pagination';


/* ── Types ──── */
interface ApprovalRequest {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'user' | 'admin' | 'super_admin';
    status: 'pending' | 'approved' | 'rejected';
    expires_at: string;
    decided_at: string | null;
    decided_by: string | null;
    reject_reason: string | null;
    created_at: string;
}

const ROLE_LABEL: Record<string, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

function fmtDate(iso: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function isExpired(req: ApprovalRequest) {
    if (req.status !== 'pending') return false;
    return new Date(req.expires_at).getTime() < Date.now();
}

function SkeletonRow() {
    return (
        <tr>
            {[44, 190, 200, 100, 100, 120, 160].map((w, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <div style={{ height: 13, borderRadius: 6, width: w, background: 'linear-gradient(90deg,#E8E2D8 25%,#FDE0CB 50%,#E8E2D8 75%)', backgroundSize: '400px 100%', animation: 'erp-shimmer 1.4s infinite linear' }} />
                </td>
            ))}
        </tr>
    );
}

const authH = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });

/* Page-scoped only: every font on the Pending Approvals page rendered
   uppercase + bolder, per explicit request. Scoped under .PA-allcaps so it
   never leaks into any other page even though the underlying classes
   (ERP-*, AS-*) are shared globally. */
const PA_ALLCAPS_CSS = `
.PA-allcaps, .PA-allcaps * {
  text-transform: uppercase;
  font-weight: 800;
  font-style: normal;
}
.PA-allcaps h1.ERP-title,
.PA-allcaps .ERP-card-title {
  font-weight: 900;
}
.PA-allcaps input,
.PA-allcaps textarea {
  text-transform: uppercase;
}
.PA-allcaps textarea::placeholder,
.PA-allcaps input::placeholder {
  text-transform: uppercase;
}
`;

/* Per-filter empty-state icon + colour -- gives "No Pending Requests" /
   "No Approved Requests Yet" / etc. a distinct, on-brand icon instead of
   reusing one generic checkmark for every state. */
const EMPTY_META: Record<'pending' | 'approved' | 'rejected' | 'all', { path: string; c: string; bg: string; bd: string }> = {
    pending: { path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', c: '#F0834D', bg: 'rgba(240,131,77,0.12)', bd: 'rgba(240,131,77,0.30)' },
    approved: { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', c: '#1E9C6A', bg: 'rgba(30,156,106,0.12)', bd: 'rgba(30,156,106,0.28)' },
    rejected: { path: 'M6 18L18 6M6 6l12 12', c: '#D93B55', bg: 'rgba(217,59,85,0.12)', bd: 'rgba(217,59,85,0.26)' },
    all: { path: 'M5 5h14l3 7v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7l3-7z M22 12h-6l-2 3h-4l-2-3H2', c: '#231C14', bg: 'rgba(35,28,20,0.08)', bd: 'rgba(35,28,20,0.20)' },
};

/* Page-scoped only: full-page layout (the card now fills whatever height
   the page has instead of sitting short above a lot of empty warm-white
   space), a de-duplicated / animated empty state with per-filter icon
   rings, and a couple of small entrance touches. Scoped under
   .PA-allcaps so none of it leaks into any other page that shares the
   ERP-* / AS-* classes. */
const PA_FULL_CSS = `
.PA-allcaps.ERP-page { display: flex; flex-direction: column; }
.PA-allcaps .ERP-card { flex: 1; min-height: 0; }
.PA-allcaps .ERP-empty { flex: 1; }

.PA-empty-ic-wrap { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.PA-empty-ic-wrap .ERP-empty-icon { margin-bottom: 0; animation: as-icon-pop .55s cubic-bezier(.22,1,.36,1) .1s both; }
.PA-empty-ring {
  position: absolute; width: 54px; height: 54px; border-radius: 50%;
  border: 1.5px solid var(--pa-bd, var(--ember-border));
  animation: as-ring-expand 2.2s cubic-bezier(.22,1,.36,1) infinite;
}
.PA-allcaps .ERP-empty-title { animation: as-banner-in .5s cubic-bezier(.22,1,.36,1) .22s both; }
.PA-allcaps .ERP-empty-sub   { animation: as-banner-in .5s cubic-bezier(.22,1,.36,1) .3s both; }

@media (prefers-reduced-motion: reduce) {
  .PA-empty-ic-wrap .ERP-empty-icon, .PA-empty-ring, .PA-allcaps .ERP-empty-title, .PA-allcaps .ERP-empty-sub {
    animation: none !important; opacity: 1 !important;
  }
}
`;

export default function PendingApprovals() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [busy, setBusy] = useState('');
    const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null; name: string; reason: string; loading: boolean }>({ open: false, id: null, name: '', reason: '', loading: false });
    const [flashRow, setFlashRow] = useState<{ id: number; kind: 'ok' | 'bad' } | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const hasFetched = useRef(false);

    const loadRequests = useCallback(async (status: string = filter) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`approval-requests?status=${status}`, { headers: authH() });
            setRequests(res.data.data || []);
        } catch {
            toast.error('Load Failed', 'Could not load approval requests');
        } finally { setLoading(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => {
        if (!hasFetched.current) { hasFetched.current = true; loadRequests(filter); return; }
        loadRequests(filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    useEffect(() => { setPage(1); }, [filter]);

    const doApprove = async (req: ApprovalRequest) => {
        setBusy(`a-${req.id}`);
        try {
            await axiosInstance.post(`approval-requests/${req.id}/approve`, {}, { headers: authH() });
            toast.success('Approved', `${req.name}'s account has been created`);
            window.dispatchEvent(new Event('erp:notifications-refresh'));
            setFlashRow({ id: req.id, kind: 'ok' });
            setTimeout(() => {
                setRequests(rs => rs.filter(r => r.id !== req.id));
                setFlashRow(f => (f?.id === req.id ? null : f));
            }, 650);
        } catch (err: any) {
            toast.error('Approve Failed', err?.response?.data?.message || `Could not approve ${req.name}`);
        } finally { setBusy(''); }
    };

    const openRejectModal = (req: ApprovalRequest) => {
        setRejectModal({ open: true, id: req.id, name: req.name, reason: '', loading: false });
    };

    const doReject = async () => {
        const { id, name, reason } = rejectModal;
        if (!id) return;
        setRejectModal(m => ({ ...m, loading: true }));
        try {
            await axiosInstance.post(`approval-requests/${id}/reject`, { reason }, { headers: authH() });
            toast.success('Rejected', `${name}'s request has been rejected`);
            window.dispatchEvent(new Event('erp:notifications-refresh'));
            setFlashRow({ id, kind: 'bad' });
            setTimeout(() => {
                setRequests(rs => rs.filter(r => r.id !== id));
                setFlashRow(f => (f?.id === id ? null : f));
            }, 650);
        } catch (err: any) {
            toast.error('Reject Failed', err?.response?.data?.message || `Could not reject ${name}`);
        } finally {
            setRejectModal({ open: false, id: null, name: '', reason: '', loading: false });
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending' && !isExpired(r)).length;
    const stats = [
        { path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Awaiting Decision', val: filter === 'pending' ? pendingCount : requests.filter(r => r.status === 'pending').length, c: '#F0834D', bg: 'rgba(240,131,77,0.1)', bd: 'rgba(240,131,77,0.28)' },
        { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Approved', val: requests.filter(r => r.status === 'approved').length, c: '#1E9C6A', bg: 'rgba(30,156,106,0.09)', bd: 'rgba(30,156,106,0.22)' },
        { path: 'M6 18L18 6M6 6l12 12', label: 'Rejected', val: requests.filter(r => r.status === 'rejected').length, c: '#D93B55', bg: 'rgba(217,59,85,0.09)', bd: 'rgba(217,59,85,0.22)' },
        { path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', label: 'Total Requests', val: requests.length, c: '#231C14', bg: 'rgba(35,28,20,0.06)', bd: 'rgba(35,28,20,0.16)' },
    ];

    return (
        <div className="ERP-page PA-allcaps">
            <style>{ERP_CSS}</style>
            <style>{AS_CSS}</style>
            <style>{PA_ALLCAPS_CSS}</style>
            <style>{PA_FULL_CSS}</style>

            {/* ── HEADER ── */}
            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <PageHeader eyebrow="Account Settings" title="Pending" titleEm="Approvals" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        className={`ERP-refresh-btn${loading ? ' spin' : ''}`}
                        onClick={() => loadRequests(filter)}
                        disabled={loading || !!busy}
                        title="Refresh"
                        aria-label="Refresh"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M20 12a8 8 0 1 1-2.343-5.657" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 4v5h-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ERP-divider" />

            {/* ── STATS ── */}
            <div className="ERP-stats">
                {stats.map((s, i) => (
                    <div
                        className="ERP-stat AS-stat"
                        key={i}
                        style={{ '--as-c': s.c, '--as-bg': s.bg, '--as-bd': s.bd } as CSSProperties}
                    >
                        <div className="AS-stat-top" />
                        <div className="AS-stat-ic"><Ic d={s.path} sz={13} c={s.c} sw={1.9} /></div>
                        <div className="ERP-stat-label">{s.label}</div>
                        <div className="ERP-stat-val">{s.val}</div>
                    </div>
                ))}
            </div>

            {/* ── FILTER CHIPS ── */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '0 0 20px' }}>
                {[
                    { key: 'pending', label: 'Pending' },
                    { key: 'approved', label: 'Approved' },
                    { key: 'rejected', label: 'Rejected' },
                    { key: 'all', label: 'All' },
                ].map((chip, i) => (
                    <button
                        key={chip.key}
                        className="AS-chip"
                        onClick={() => setFilter(chip.key as typeof filter)}
                        style={{
                            border: `1px solid ${filter === chip.key ? 'var(--ember-border,#F0834D)' : 'var(--border)'}`,
                            background: filter === chip.key ? 'var(--ember-ghost,rgba(194,65,12,0.08))' : 'var(--white)',
                            color: filter === chip.key ? 'var(--ember,#F0834D)' : 'var(--text-3,#524532)',
                            animationDelay: `${i * 0.03}s`,
                        }}
                    >{chip.label}</button>
                ))}
            </div>

            {/* ── TABLE CARD ── */}
            <div className="ERP-card">
                <div className="ERP-card-topbar" />
                <div className="ERP-card-hdr">
                    <div className="ERP-card-hdr-left">
                        <div className="ERP-card-icon-wrap">
                            <Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" sz={18} c="var(--ember-light)" sw={1.8} />
                        </div>
                        <div>
                            <div className="ERP-card-title">Account Requests</div>
                            {(loading || requests.length > 0) && (
                                <div className="ERP-card-sub">
                                    {loading ? 'Loading…' : `${requests.length} request${requests.length !== 1 ? 's' : ''}`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="ERP-tbl-scroll">
                        <table className="ERP-tbl">
                            <thead><tr>
                                {['No.', 'Requester', 'Role', 'Status', 'Requested', 'Expires', 'Actions'].map(h => <th key={h}>{h}</th>)}
                            </tr></thead>
                            <tbody>{[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}</tbody>
                        </table>
                    </div>
                )}

                {!loading && requests.length === 0 && (
                    <div className="ERP-empty" key={filter}>
                        <div className="PA-empty-ic-wrap" style={{ '--pa-bd': EMPTY_META[filter].bd } as CSSProperties}>
                            <span className="PA-empty-ring" />
                            <span className="PA-empty-ring" style={{ animationDelay: '.45s' }} />
                            <div className="ERP-empty-icon" style={{ background: EMPTY_META[filter].bg, borderColor: EMPTY_META[filter].bd }}>
                                <Ic d={EMPTY_META[filter].path} sz={28} c={EMPTY_META[filter].c} sw={1.8} />
                            </div>
                        </div>
                        <div className="ERP-empty-title">
                            {filter === 'pending' ? 'No Pending Requests' : filter === 'approved' ? 'No Approved Requests Yet' : filter === 'rejected' ? 'No Rejected Requests' : 'No Requests Yet'}
                        </div>
                        <div className="ERP-empty-sub">
                            {filter === 'pending' ? 'New registrations for User, Admin & Super Admin will appear here for your review' : 'Nothing to show for this filter'}
                        </div>
                    </div>
                )}

                {!loading && requests.length > 0 && (() => {
                    const totalPages = Math.max(1, Math.ceil(requests.length / perPage));
                    const safePage = Math.min(page, totalPages);
                    const pagedRequests = requests.slice((safePage - 1) * perPage, safePage * perPage);
                    return (
                    <>
                    <div className="ERP-tbl-scroll">
                        <table className="ERP-tbl">
                            <thead>
                                <tr>
                                    <th className="ERP-center" style={{ width: 44 }}>No.</th>
                                    <th>Requester</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Requested</th>
                                    <th>Expires</th>
                                    <th className="ERP-center" style={{ width: 190 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {pagedRequests.map((req, i) => {
                                        const expired = isExpired(req);
                                        const effectiveStatus = expired ? 'expired' : req.status;
                                        const initials = req.name.trim().slice(0, 2).toUpperCase() || '??';
                                        const aKey = `a-${req.id}`;
                                        const flash = flashRow?.id === req.id ? flashRow.kind : null;
                                        const canDecide = req.status === 'pending' && !expired && !flash;
                                        return (
                                            <motion.tr
                                                key={req.id}
                                                layout
                                                initial={false}
                                                exit={{ opacity: 0, x: 24, transition: { duration: 0.22, ease: 'easeIn' } }}
                                                className={flash === 'ok' ? 'AS-row-flash-ok' : flash === 'bad' ? 'AS-row-flash-bad' : ''}
                                            >
                                                <td className="ERP-t-num ERP-center">{(safePage - 1) * perPage + i + 1}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(35,28,20,.06)', color: '#231C14', border: '1px solid rgba(35,28,20,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <span className="ERP-t-primary">{req.name}</span>
                                                            <span style={{ fontSize: 9.5, color: 'var(--text-4,#6B5D48)', fontFamily: "'JetBrains Mono',monospace" }}>{req.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`AS-role ${req.role}`}>{ROLE_LABEL[req.role] || req.role}</span>
                                                </td>
                                                <td>
                                                    <span className={`AS-pill ${effectiveStatus}`}>
                                                        <span className="AS-pill-dot" />
                                                        {effectiveStatus === 'expired' ? 'Expired' : effectiveStatus === 'pending' ? 'Pending' : effectiveStatus === 'approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                    {req.status === 'rejected' && req.reject_reason && (
                                                        <div style={{ fontSize: 9, color: 'var(--text-4,#8C7C63)', marginTop: 4, maxWidth: 180 }}>“{req.reject_reason}”</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 9.5, color: 'var(--text-4,#6B5D48)', fontFamily: "'JetBrains Mono',monospace" }}>{fmtDate(req.created_at)}</span>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 9.5, color: expired ? '#D93B55' : 'var(--text-4,#6B5D48)', fontFamily: "'JetBrains Mono',monospace" }}>
                                                        {req.status === 'pending' ? fmtDate(req.expires_at) : '—'}
                                                    </span>
                                                </td>
                                                <td className="ERP-center ERP-nowrap">
                                                    {canDecide ? (
                                                        <span className="AS-act-cell">
                                                            <button className="AS-act approve" disabled={!!busy} onClick={() => doApprove(req)}>
                                                                {busy === aKey
                                                                    ? <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'erp-spin .6s linear infinite' }} />
                                                                    : 'Approve'}
                                                            </button>
                                                            <button className="AS-act reject" disabled={!!busy} onClick={() => openRejectModal(req)}>
                                                                Reject
                                                            </button>
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: 9, color: 'var(--text-4,#8C7C63)' }}>
                                                            {req.decided_by ? `by ${req.decided_by}` : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {requests.length > 0 && (
                        <Pagination
                            page={safePage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            total={requests.length}
                            perPage={perPage}
                            onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
                            itemLabel="requests"
                        />
                    )}
                    </>
                    );
                })()}
            </div>

            {/* ── Reject reason modal ── */}
            <AnimatePresence>
                {rejectModal.open && (
                    <motion.div
                        className="AS-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => !rejectModal.loading && setRejectModal({ open: false, id: null, name: '', reason: '', loading: false })}
                    >
                        <motion.div
                            className="AS-modal-card"
                            initial={{ opacity: 0, scale: 0.9, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -6 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="AS-modal-title">Reject {rejectModal.name}'s request?</div>
                            <div className="AS-modal-sub">This request will be closed and no account will be created. You can optionally add a reason (not shared with the requester automatically).</div>
                            <textarea autoComplete="off"
                                className="AS-modal-textarea"
                                placeholder="Reason (optional)…"
                                value={rejectModal.reason}
                                onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
                            />
                            <div className="AS-modal-actions">
                                <button
                                    className="AS-modal-btn cancel"
                                    disabled={rejectModal.loading}
                                    onClick={() => setRejectModal({ open: false, id: null, name: '', reason: '', loading: false })}
                                >Cancel</button>
                                <button
                                    className="AS-modal-btn confirm"
                                    disabled={rejectModal.loading}
                                    onClick={doReject}
                                >{rejectModal.loading ? 'Rejecting…' : 'Reject Request'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
