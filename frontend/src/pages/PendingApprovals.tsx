import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { Ic } from '../components/Icon';

/* ── page Animations ── */
const PA_CSS = `
@keyframes pa-card-in {
  0%   { opacity:0; transform:perspective(800px) rotateX(-24deg) translateY(12px) scale(.95); }
  60%  { opacity:1; transform:perspective(800px) rotateX(3deg) translateY(-2px) scale(1.012); }
  100% { opacity:1; transform:perspective(800px) rotateX(0) translateY(0) scale(1); }
}
@keyframes pa-chip-pop { 0% { opacity:0; transform:scale(.7); } 100% { opacity:1; transform:scale(1); } }
@keyframes pa-pulse    { 0%,100% { opacity:1; } 50% { opacity:.45; } }

.PA-stat {
  position:relative; overflow:hidden;
  animation:pa-card-in .5s cubic-bezier(.22,1,.36,1) both;
  transition:transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease;
}
.PA-stat:nth-child(1){ animation-delay:.02s }
.PA-stat:nth-child(2){ animation-delay:.07s }
.PA-stat:nth-child(3){ animation-delay:.12s }
.PA-stat:nth-child(4){ animation-delay:.17s }
.PA-stat:hover { transform:translateY(-3px); box-shadow:0 18px 36px -12px rgba(15,23,42,.20); }
.PA-stat-top { position:absolute; top:0; left:0; right:0; height:3px; background:var(--pa-c); }
.PA-stat-ic  { width:26px; height:26px; border-radius:8px; background:var(--pa-bg); border:1px solid var(--pa-bd); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }

.PA-chip {
  padding:5px 14px; border-radius:100px; cursor:pointer; font-family:'JetBrains Mono',monospace;
  font-size:9.5px; font-weight:700; transition:transform .16s ease, box-shadow .16s ease, background .16s, border-color .16s, color .16s;
  animation:pa-chip-pop .3s ease both;
}
.PA-chip:hover { transform:translateY(-2px); box-shadow:0 6px 14px rgba(15,23,42,.10); }
.PA-chip:active { transform:translateY(0) scale(.96); }

.PA-pill {
  display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px;
  font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; border:1px solid; white-space:nowrap;
}
.PA-pill-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
.PA-pill.pending  { background:rgba(245,166,35,.10); color:#C47E0A; border-color:rgba(245,166,35,.30); }
.PA-pill.pending .PA-pill-dot { animation:pa-pulse 1.6s ease-in-out infinite; }
.PA-pill.approved { background:rgba(30,156,106,.10); color:#1E9C6A; border-color:rgba(30,156,106,.28); }
.PA-pill.rejected { background:rgba(217,59,85,.10); color:#D93B55; border-color:rgba(217,59,85,.26); }
.PA-pill.expired  { background:rgba(100,116,139,.10); color:#64748b; border-color:rgba(100,116,139,.26); }

.PA-role {
  display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:8px;
  font-size:9.5px; font-weight:800; letter-spacing:.2px; border:1px solid;
}
.PA-role.user        { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
.PA-role.admin       { background:#fdf4ff; color:#9333ea; border-color:#e9d5ff; }
.PA-role.super_admin { background:rgba(37,99,235,.09); color:#60A5FA; border-color:rgba(216,169,78,.4); }

.PA-act {
  display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:8px;
  font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; cursor:pointer; border:1px solid; transition:all .18s;
}
.PA-act.approve { background:rgba(30,156,106,.08); color:#1E9C6A; border-color:rgba(30,156,106,.24); }
.PA-act.approve:hover:not(:disabled) { background:#1E9C6A; color:#fff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,156,106,.3); }
.PA-act.reject { background:rgba(217,59,85,.08); color:#D93B55; border-color:rgba(217,59,85,.22); }
.PA-act.reject:hover:not(:disabled) { background:#D93B55; color:#fff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(217,59,85,.3); }
.PA-act:disabled { opacity:.5; cursor:not-allowed; }
.PA-act + .PA-act { margin-left: 6px; }

.PA-modal-backdrop {
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center; padding:20px;
  background:rgba(10,21,48,.44); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
.PA-modal-card {
  position:relative; width:100%; max-width:400px; padding:26px 24px 22px; border-radius:18px;
  background:var(--white); overflow:hidden;
  box-shadow:0 24px 60px -18px rgba(217,59,85,.3), 0 0 0 1px rgba(217,59,85,.1);
}
.PA-modal-title { font-size:15px; font-weight:800; color:var(--text-1,#1a1a1a); margin-bottom:6px; letter-spacing:.1px; }
.PA-modal-sub   { font-size:11.5px; color:var(--text-3,#666); line-height:1.55; margin-bottom:16px; }
.PA-modal-textarea {
  width:100%; min-height:76px; resize:vertical; border-radius:10px; border:1.5px solid var(--border);
  padding:10px 12px; font-family:var(--font-body); font-size:12px; color:var(--text-1,#222);
  outline:none; transition:border-color .16s; background:var(--surface,#fafafa);
}
.PA-modal-textarea:focus { border-color:#D93B55; }
.PA-modal-actions { display:flex; gap:10px; margin-top:18px; }
.PA-modal-btn {
  flex:1; padding:10px 14px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer;
  border:1.5px solid; transition:all .16s;
}
.PA-modal-btn.cancel { background:transparent; color:var(--text-3,#666); border-color:var(--border); }
.PA-modal-btn.cancel:hover { background:var(--surface,#f5f5f5); }
.PA-modal-btn.confirm { background:#D93B55; color:#fff; border-color:#D93B55; }
.PA-modal-btn.confirm:hover:not(:disabled) { background:#c22e47; }
.PA-modal-btn:disabled { opacity:.6; cursor:not-allowed; }

@media(prefers-reduced-motion: reduce){
  .PA-stat, .PA-chip { animation:none !important; }
  .PA-stat { transition:none !important; }
}
`;

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
                    <div style={{ height: 13, borderRadius: 6, width: w, background: 'linear-gradient(90deg,#E9EEF5 25%,#FFE0B2 50%,#E9EEF5 75%)', backgroundSize: '400px 100%', animation: 'erp-shimmer 1.4s infinite linear' }} />
                </td>
            ))}
        </tr>
    );
}

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function PendingApprovals() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [busy, setBusy] = useState('');
    const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null; name: string; reason: string; loading: boolean }>({ open: false, id: null, name: '', reason: '', loading: false });
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

    const doApprove = async (req: ApprovalRequest) => {
        setBusy(`a-${req.id}`);
        try {
            await axiosInstance.post(`approval-requests/${req.id}/approve`, {}, { headers: authH() });
            toast.success('Approved', `${req.name}'s account has been created`);
            setRequests(rs => rs.filter(r => r.id !== req.id));
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
            setRequests(rs => rs.filter(r => r.id !== id));
        } catch (err: any) {
            toast.error('Reject Failed', err?.response?.data?.message || `Could not reject ${name}`);
        } finally {
            setRejectModal({ open: false, id: null, name: '', reason: '', loading: false });
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending' && !isExpired(r)).length;
    const stats = [
        { path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Awaiting Decision', val: filter === 'pending' ? pendingCount : requests.filter(r => r.status === 'pending').length, c: '#60A5FA', bg: 'rgba(245,166,35,0.1)', bd: 'rgba(245,166,35,0.28)' },
        { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Approved', val: requests.filter(r => r.status === 'approved').length, c: '#1E9C6A', bg: 'rgba(30,156,106,0.09)', bd: 'rgba(30,156,106,0.22)' },
        { path: 'M6 18L18 6M6 6l12 12', label: 'Rejected', val: requests.filter(r => r.status === 'rejected').length, c: '#D93B55', bg: 'rgba(217,59,85,0.09)', bd: 'rgba(217,59,85,0.22)' },
        { path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', label: 'Total Requests', val: requests.length, c: '#0A1530', bg: 'rgba(10,21,48,0.06)', bd: 'rgba(10,21,48,0.16)' },
    ];

    return (
        <div className="ERP-page">
            <style>{ERP_CSS}</style>
            <style>{PA_CSS}</style>

            {/* ── HEADER ── */}
            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <div className="ERP-eyebrow">
                        <span className="ERP-eyebrow-line" />
                        <span className="ERP-eyebrow-dot" />
                        System &amp; Maintenance
                    </div>
                    <h1 className="ERP-title MD-page-title">Pending <span className="ERP-title-em">Approvals</span></h1>
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
                        className="ERP-stat PA-stat"
                        key={i}
                        style={{ '--pa-c': s.c, '--pa-bg': s.bg, '--pa-bd': s.bd } as CSSProperties}
                    >
                        <div className="PA-stat-top" />
                        <div className="PA-stat-ic"><Ic d={s.path} sz={13} c={s.c} sw={1.9} /></div>
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
                        className="PA-chip"
                        onClick={() => setFilter(chip.key as typeof filter)}
                        style={{
                            border: `1px solid ${filter === chip.key ? 'var(--ember-border,#60A5FA)' : 'var(--border)'}`,
                            background: filter === chip.key ? 'var(--ember-ghost,rgba(37,99,235,0.08))' : 'var(--white)',
                            color: filter === chip.key ? 'var(--ember,#60A5FA)' : 'var(--text-3,#555)',
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
                            <div className="ERP-card-sub">
                                {loading ? 'Loading…' : requests.length === 0 ? 'Nothing here right now' : `${requests.length} request${requests.length !== 1 ? 's' : ''}`}
                            </div>
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
                    <div className="ERP-empty">
                        <div className="ERP-empty-icon">
                            <Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" sz={28} c="var(--ember-light)" sw={1.8} />
                        </div>
                        <div className="ERP-empty-title">
                            {filter === 'pending' ? 'No Pending Requests' : filter === 'approved' ? 'No Approved Requests Yet' : filter === 'rejected' ? 'No Rejected Requests' : 'No Requests Yet'}
                        </div>
                        <div className="ERP-empty-sub">
                            {filter === 'pending' ? 'New registrations for User, Admin & Super Admin will appear here for your review' : 'Nothing to show for this filter'}
                        </div>
                    </div>
                )}

                {!loading && requests.length > 0 && (
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
                                    {requests.map((req, i) => {
                                        const expired = isExpired(req);
                                        const effectiveStatus = expired ? 'expired' : req.status;
                                        const initials = req.name.trim().slice(0, 2).toUpperCase() || '??';
                                        const aKey = `a-${req.id}`;
                                        const canDecide = req.status === 'pending' && !expired;
                                        return (
                                            <motion.tr
                                                key={req.id}
                                                layout
                                                initial={false}
                                                exit={{ opacity: 0, x: 24, transition: { duration: 0.22, ease: 'easeIn' } }}
                                            >
                                                <td className="ERP-t-num ERP-center">{i + 1}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(10,21,48,.06)', color: '#0A1530', border: '1px solid rgba(10,21,48,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <span className="ERP-t-primary">{req.name}</span>
                                                            <span style={{ fontSize: 9.5, color: 'var(--text-4,#888)', fontFamily: "'JetBrains Mono',monospace" }}>{req.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`PA-role ${req.role}`}>{ROLE_LABEL[req.role] || req.role}</span>
                                                </td>
                                                <td>
                                                    <span className={`PA-pill ${effectiveStatus}`}>
                                                        <span className="PA-pill-dot" />
                                                        {effectiveStatus === 'expired' ? 'Expired' : effectiveStatus === 'pending' ? 'Pending' : effectiveStatus === 'approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                    {req.status === 'rejected' && req.reject_reason && (
                                                        <div style={{ fontSize: 9, color: 'var(--text-4,#999)', marginTop: 4, maxWidth: 180 }}>“{req.reject_reason}”</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 9.5, color: 'var(--text-4,#888)', fontFamily: "'JetBrains Mono',monospace" }}>{fmtDate(req.created_at)}</span>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 9.5, color: expired ? '#D93B55' : 'var(--text-4,#888)', fontFamily: "'JetBrains Mono',monospace" }}>
                                                        {req.status === 'pending' ? fmtDate(req.expires_at) : '—'}
                                                    </span>
                                                </td>
                                                <td className="ERP-center ERP-nowrap">
                                                    {canDecide ? (
                                                        <>
                                                            <button className="PA-act approve" disabled={!!busy} onClick={() => doApprove(req)}>
                                                                {busy === aKey
                                                                    ? <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'erp-spin .6s linear infinite' }} />
                                                                    : <><Ic d="M5 13l4 4L19 7" sz={10} c="currentColor" sw={2} /> Approve</>}
                                                            </button>
                                                            <button className="PA-act reject" disabled={!!busy} onClick={() => openRejectModal(req)}>
                                                                <Ic d="M6 18L18 6M6 6l12 12" sz={10} c="currentColor" sw={2} /> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: 9, color: 'var(--text-4,#aaa)' }}>
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
                )}
            </div>

            {/* ── Reject reason modal ── */}
            <AnimatePresence>
                {rejectModal.open && (
                    <motion.div
                        className="PA-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => !rejectModal.loading && setRejectModal({ open: false, id: null, name: '', reason: '', loading: false })}
                    >
                        <motion.div
                            className="PA-modal-card"
                            initial={{ opacity: 0, scale: 0.9, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -6 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="PA-modal-title">Reject {rejectModal.name}'s request?</div>
                            <div className="PA-modal-sub">This request will be closed and no account will be created. You can optionally add a reason (not shared with the requester automatically).</div>
                            <textarea
                                className="PA-modal-textarea"
                                placeholder="Reason (optional)…"
                                value={rejectModal.reason}
                                onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
                            />
                            <div className="PA-modal-actions">
                                <button
                                    className="PA-modal-btn cancel"
                                    disabled={rejectModal.loading}
                                    onClick={() => setRejectModal({ open: false, id: null, name: '', reason: '', loading: false })}
                                >Cancel</button>
                                <button
                                    className="PA-modal-btn confirm"
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
