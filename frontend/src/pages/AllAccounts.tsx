import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { AS_CSS } from './AccountSettingsTheme';
import { Ic } from '../components/Icon';
import { PageHeader, StatCard, TableCard, Field, Input } from '../components/ui';
import Pagination from '../components/Pagination';
import RecycleBinDeleteModal from '../components/RecycleBinDeleteModal';

/**
 * "All Accounts" tab in Account Settings — super_admin only. Read-only
 * list of every account in the system (Super Admin / Admin / User).
 */

interface AccountRow {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    created_at: string;
}

const ROLE_LABEL: Record<string, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };
const ROLE_AVATAR_BG: Record<string, string> = { super_admin: 'rgba(232,114,12,.10)', admin: '#FDE0CB', user: '#FDE0CB' };
const ROLE_AVATAR_FG: Record<string, string> = { super_admin: '#EA580C', admin: '#DB5B1F', user: '#C2410C' };

const ROLE_CARD: Record<'user' | 'admin' | 'super_admin', { title: string; sub: string; icon: string; c: string; bg: string; bd: string }> = {
    user: {
        title: 'User', sub: 'Manpower Register & Attendance only',
        icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
        c: '#C2410C', bg: '#FDE0CB', bd: '#FBC9A8',
    },
    admin: {
        title: 'Admin', sub: 'Most modules — can create User accounts',
        icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
        c: '#DB5B1F', bg: '#FDE0CB', bd: '#FBC9A8',
    },
    super_admin: {
        title: 'Super Admin', sub: 'Full access — every module & setting',
        icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
        c: '#EA580C', bg: 'rgba(234,88,12,.09)', bd: 'rgba(234,88,12,.30)',
    },
};

/* Per-filter empty-state icon + colour, matching the same on-brand
   treatment given to Pending Approvals. */
const EMPTY_META: Record<'all' | 'super_admin' | 'admin' | 'user', { path: string; c: string; bg: string; bd: string }> = {
    all: { path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', c: '#231C14', bg: 'rgba(35,28,20,0.08)', bd: 'rgba(35,28,20,0.20)' },
    super_admin: { path: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', c: '#EA580C', bg: 'rgba(232,114,12,.12)', bd: 'rgba(232,114,12,.30)' },
    admin: { path: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', c: '#DB5B1F', bg: 'rgba(219,91,31,.12)', bd: 'rgba(219,91,31,.28)' },
    user: { path: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', c: '#C2410C', bg: 'rgba(194,65,12,.12)', bd: 'rgba(194,65,12,.26)' },
};

/* Page-scoped only: same premium treatment as Pending Approvals -- one
   bold / upright / all-caps font everywhere, the table card stretched to
   fill the full page height, and a livelier, ringed, per-role-coloured
   empty state. Scoped under .AA-full so it never leaks into any other
   page that shares the ERP-* / AS-* classes. */
const AA_FULL_CSS = `
.AA-full, .AA-full * {
  text-transform: uppercase;
  font-weight: 800;
  font-style: normal;
}

.AA-full.ERP-page { display: flex; flex-direction: column; }
.AA-full .ERP-tbl-card { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.AA-full .ERP-empty { flex: 1; }

.AA-empty-ic-wrap { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.AA-empty-ic-wrap .ERP-empty-icon { margin-bottom: 0; animation: as-icon-pop .55s cubic-bezier(.22,1,.36,1) .1s both; }
.AA-empty-ring {
  position: absolute; width: 54px; height: 54px; border-radius: 50%;
  border: 1.5px solid var(--aa-bd, var(--ember-border));
  animation: as-ring-expand 2.2s cubic-bezier(.22,1,.36,1) infinite;
}
.AA-full .ERP-empty-title { animation: as-banner-in .5s cubic-bezier(.22,1,.36,1) .22s both; }
.AA-full .ERP-empty-sub   { animation: as-banner-in .5s cubic-bezier(.22,1,.36,1) .3s both; }

.AA-full .AS-avatar { transition: transform .16s cubic-bezier(.22,1,.36,1); }
.AA-full tbody tr:hover .AS-avatar { transform: scale(1.1); }

@keyframes aa-pg-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.AA-full .ERP-pg {
  animation: aa-pg-in .45s cubic-bezier(.22,1,.36,1) both;
}

@keyframes aa-row-in {
  from { opacity: 0; transform: translateY(7px); }
  to   { opacity: 1; transform: translateY(0); }
}

.AA-full .ERP-tbl-scroll tbody tr {
  animation: aa-row-in .4s cubic-bezier(.22,1,.36,1) both;
}
.AA-full .ERP-tbl-scroll tbody tr:nth-child(1) { animation-delay: 0.02s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(2) { animation-delay: 0.055s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(3) { animation-delay: 0.09s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(4) { animation-delay: 0.125s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(5) { animation-delay: 0.16s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(6) { animation-delay: 0.195s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(7) { animation-delay: 0.23s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(8) { animation-delay: 0.265s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(9) { animation-delay: 0.3s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(10) { animation-delay: 0.335s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(11) { animation-delay: 0.37s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(12) { animation-delay: 0.405s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(13) { animation-delay: 0.44s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(14) { animation-delay: 0.475s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(15) { animation-delay: 0.51s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(16) { animation-delay: 0.545s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(17) { animation-delay: 0.58s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(18) { animation-delay: 0.615s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(19) { animation-delay: 0.65s; }
.AA-full .ERP-tbl-scroll tbody tr:nth-child(20) { animation-delay: 0.685s; }

@media (prefers-reduced-motion: reduce) {
  .AA-empty-ic-wrap .ERP-empty-icon, .AA-empty-ring, .AA-full .ERP-empty-title, .AA-full .ERP-empty-sub,
  .AA-full .ERP-pg, .AA-full .ERP-tbl-scroll tbody tr {
    animation: none !important; opacity: 1 !important;
  }
}

/* ── Edit Account modal — same AS-modal-* shell as the shared
   Pending-Approvals reject modal, but ember-toned instead of the red
   danger tint that class carries by default (this is an edit, not a
   destructive action). ── */
.AA-edit-card {
  box-shadow: 0 24px 60px -18px rgba(194,65,12,.26), 0 0 0 1px rgba(194,65,12,.10) !important;
  max-width: 420px !important;
}
.AS-modal-btn.save {
  background: linear-gradient(135deg,#C2410C,#EA580C);
  color: #faf9f7;
  border-color: #C2410C;
}
.AS-modal-btn.save:hover:not(:disabled) {
  background: linear-gradient(135deg,#9A3412,#C2410C);
}
.AA-edit-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 4px; }
.AA-edit-roles-label {
  font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em;
  color: var(--text-3,#6B5D48); margin-bottom: 7px;
}

/* ── Row action buttons — small text pills, not icons: quiet ghost state
   at rest, a confident gradient-fill lift on hover/focus. Edit stays in
   the app's ember/orange family; Delete uses the same red already used
   for every other destructive action in this app (Recycle Bin, reject
   request) -- not a "financial" red, a "this is destructive" red. ── */
.AA-act-cell { display: flex; gap: 7px; justify-content: center; align-items: center; }
.AA-act-btn {
  font-family: var(--font-body);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .045em;
  padding: 6px 13px;
  border-radius: 8px;
  cursor: pointer;
  border: 1.3px solid transparent;
  transition: transform .16s cubic-bezier(.22,1,.36,1), box-shadow .16s ease, background .16s ease, color .16s ease, border-color .16s ease;
  white-space: nowrap;
}
.AA-act-btn:active { transform: scale(.93); transition-duration: .08s; }

.AA-act-btn.edit {
  background: rgba(194,65,12,.07);
  color: #C2410C;
  border-color: rgba(194,65,12,.20);
}
.AA-act-btn.edit:hover {
  background: linear-gradient(135deg,#C2410C,#EA580C);
  color: #FAF9F7;
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px -6px rgba(194,65,12,.45);
}

.AA-act-btn.delete {
  background: rgba(217,59,85,.07);
  color: #D93B55;
  border-color: rgba(217,59,85,.20);
}
.AA-act-btn.delete:hover {
  background: linear-gradient(135deg,#9A3412,#D93B55);
  color: #FAF9F7;
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px -6px rgba(217,59,85,.4);
}

@media (prefers-reduced-motion: reduce) {
  .AA-act-btn, .AA-act-btn:hover, .AA-act-btn:active { transition: none !important; transform: none !important; }
}
`;

type RoleFilter = 'all' | 'super_admin' | 'admin' | 'user';

function fmtDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function SkeletonRow() {
    return (
        <tr>
            {[36, 190, 220, 110, 120, 70].map((w, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <div style={{ height: 13, borderRadius: 6, width: w, background: 'linear-gradient(90deg,#E8E2D8 25%,#FDE0CB 50%,#E8E2D8 75%)', backgroundSize: '400px 100%', animation: 'erp-shimmer 1.4s infinite linear' }} />
                </td>
            ))}
        </tr>
    );
}

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AllAccounts() {
    const [accounts, setAccounts] = useState<AccountRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RoleFilter>('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const hasFetched = useRef(false);

    // Who's logged in right now, so we can hide "delete" on your own row --
    // the backend blocks self-delete too, but hiding it here avoids a
    // pointless failed attempt.
    const currentUserId = useMemo(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw)?.id ?? null : null;
        } catch { return null; }
    }, []);

    const [editModal, setEditModal] = useState<{
        open: boolean; id: number | null; name: string; email: string;
        role: 'user' | 'admin' | 'super_admin'; loading: boolean; errors: Record<string, string>;
    }>({ open: false, id: null, name: '', email: '', role: 'user', loading: false, errors: {} });

    const [deleteModal, setDeleteModal] = useState<{
        open: boolean; id: number | null; name: string; loading: boolean;
    }>({ open: false, id: null, name: '', loading: false });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('users', { headers: authH() });
            setAccounts(res.data.data || []);
        } catch {
            toast.error('Load Failed', 'Could not load accounts');
        } finally {
            setLoading(false);
        }
    }, []);

    const openEdit = (a: AccountRow) => setEditModal({ open: true, id: a.id, name: a.name, email: a.email, role: a.role, loading: false, errors: {} });
    const closeEdit = () => { if (!editModal.loading) setEditModal(m => ({ ...m, open: false })); };

    const saveEdit = async () => {
        if (!editModal.id) return;
        setEditModal(m => ({ ...m, loading: true, errors: {} }));
        try {
            const res = await axiosInstance.put(`users/${editModal.id}`, {
                name: editModal.name.trim(),
                email: editModal.email.trim().toLowerCase(),
                role: editModal.role,
            }, { headers: authH() });
            toast.success('Account Updated', res.data.message || 'Changes saved');
            setAccounts(prev => prev.map(a => a.id === editModal.id
                ? { ...a, name: editModal.name.trim(), email: editModal.email.trim().toLowerCase(), role: editModal.role }
                : a));
            setEditModal({ open: false, id: null, name: '', email: '', role: 'user', loading: false, errors: {} });
        } catch (err: any) {
            const resp = err?.response?.data;
            if (resp?.errors) {
                const flat: Record<string, string> = {};
                Object.keys(resp.errors).forEach(k => { flat[k] = resp.errors[k][0]; });
                setEditModal(m => ({ ...m, loading: false, errors: flat }));
            } else {
                toast.error('Update Failed', resp?.message || 'Could not update account');
                setEditModal(m => ({ ...m, loading: false }));
            }
        }
    };

    const openDelete = (a: AccountRow) => setDeleteModal({ open: true, id: a.id, name: a.name, loading: false });
    const closeDelete = () => { if (!deleteModal.loading) setDeleteModal(m => ({ ...m, open: false })); };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setDeleteModal(m => ({ ...m, loading: true }));
        try {
            const res = await axiosInstance.delete(`users/${deleteModal.id}`, { headers: authH() });
            toast.success('Account Deleted', res.data.message || 'Account permanently removed');
            setAccounts(prev => prev.filter(a => a.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null, name: '', loading: false });
        } catch (err: any) {
            toast.error('Delete Failed', err?.response?.data?.message || 'Could not delete account');
            setDeleteModal(m => ({ ...m, loading: false }));
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        load();
    }, [load]);

    const counts = {
        total: accounts.length,
        super_admin: accounts.filter(a => a.role === 'super_admin').length,
        admin: accounts.filter(a => a.role === 'admin').length,
        user: accounts.filter(a => a.role === 'user').length,
    };

    const visible = useMemo(
        () => (filter === 'all' ? accounts : accounts.filter(a => a.role === filter)),
        [accounts, filter]
    );

    // Jump back to page 1 whenever the role filter changes the result set.
    useEffect(() => { setPage(1); }, [filter]);

    const totalPages = Math.max(1, Math.ceil(visible.length / perPage));
    const safePage = Math.min(page, totalPages);
    const paged = useMemo(
        () => visible.slice((safePage - 1) * perPage, safePage * perPage),
        [visible, safePage, perPage]
    );

    return (
        <div className="ERP-page AA-full">
            <style>{ERP_CSS}</style>
            <style>{AS_CSS}</style>
            <style>{AA_FULL_CSS}</style>

            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <PageHeader eyebrow="Account Settings" title="All" titleEm="Accounts" />
                </div>
                <button
                    className={`ERP-refresh-btn${loading ? ' spin' : ''}`}
                    onClick={load}
                    disabled={loading}
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

            <div className="ERP-divider" />

            <div className="ERP-stats AS-stat-grid">
                <StatCard label="Total Accounts" value={counts.total} />
                <StatCard label="Super Admin" value={counts.super_admin} />
                <StatCard label="Admin" value={counts.admin} />
                <StatCard label="User" value={counts.user} />
            </div>

            {/* ── ROLE FILTER CHIPS ── */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '0 0 20px' }}>
                {[
                    { key: 'all', label: 'All' },
                    { key: 'super_admin', label: 'Super Admin' },
                    { key: 'admin', label: 'Admin' },
                    { key: 'user', label: 'User' },
                ].map((chip, i) => (
                    <button
                        key={chip.key}
                        className="AS-chip"
                        onClick={() => setFilter(chip.key as RoleFilter)}
                        style={{
                            border: `1px solid ${filter === chip.key ? 'var(--ember-border,#F0834D)' : 'var(--border)'}`,
                            background: filter === chip.key ? 'var(--ember-ghost,rgba(37,99,235,0.08))' : 'var(--white)',
                            color: filter === chip.key ? 'var(--ember,#F0834D)' : 'var(--text-3,#524532)',
                            animationDelay: `${i * 0.03}s`,
                        }}
                    >{chip.label}</button>
                ))}
            </div>

            <TableCard title="Accounts" count={loading ? undefined : visible.length}>
                {loading && (
                    <div className="ERP-tbl-scroll">
                        <table className="ERP-tbl">
                            <thead><tr>
                                {['No.', 'Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => <th key={h}>{h}</th>)}
                            </tr></thead>
                            <tbody>{[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}</tbody>
                        </table>
                    </div>
                )}

                {!loading && visible.length === 0 && (
                    <div className="ERP-empty" key={filter}>
                        <div className="AA-empty-ic-wrap" style={{ '--aa-bd': EMPTY_META[filter].bd } as any}>
                            <span className="AA-empty-ring" />
                            <span className="AA-empty-ring" style={{ animationDelay: '.45s' }} />
                            <div className="ERP-empty-icon" style={{ background: EMPTY_META[filter].bg, borderColor: EMPTY_META[filter].bd }}>
                                <Ic d={EMPTY_META[filter].path} sz={28} c={EMPTY_META[filter].c} sw={1.8} />
                            </div>
                        </div>
                        <div className="ERP-empty-title">{accounts.length === 0 ? 'No Accounts Found' : 'No Accounts Match This Filter'}</div>
                        <div className="ERP-empty-sub">{accounts.length === 0 ? 'Something went wrong loading the account list' : 'Try a different role filter'}</div>
                    </div>
                )}

                {!loading && visible.length > 0 && (
                    <div className="ERP-tbl-scroll">
                        <table className="ERP-tbl">
                            <thead>
                                <tr>
                                    <th className="ERP-center" style={{ width: 44 }}>No.</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th className="ERP-center" style={{ width: 90 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody key={safePage}>
                                {paged.map((a, i) => {
                                    const initials = a.name.trim().slice(0, 2).toUpperCase() || '??';
                                    return (
                                        <tr key={a.id}>
                                            <td className="ERP-t-num ERP-center">{(safePage - 1) * perPage + i + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                    <div className="AS-avatar" style={{ background: ROLE_AVATAR_BG[a.role] || 'rgba(10,21,48,.06)', color: ROLE_AVATAR_FG[a.role] || '#231C14' }}>{initials}</div>
                                                    <span className="ERP-t-primary">{a.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: 9.5, color: 'var(--text-4,#6B5D48)', fontFamily: 'var(--font-mono)' }}>{a.email}</span>
                                            </td>
                                            <td><span className={`AS-role ${a.role}`}>{ROLE_LABEL[a.role] || a.role}</span></td>
                                            <td>
                                                <span style={{ fontSize: 9.5, color: 'var(--text-4,#6B5D48)', fontFamily: 'var(--font-mono)' }}>{fmtDate(a.created_at)}</span>
                                            </td>
                                            <td className="AA-act-cell">
                                                <button className="AA-act-btn edit" onClick={() => openEdit(a)}>Edit</button>
                                                {a.id !== currentUserId && (
                                                    <button className="AA-act-btn delete" onClick={() => openDelete(a)}>Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && visible.length > 0 && (
                    <Pagination
                        page={safePage}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        total={visible.length}
                        perPage={perPage}
                        onPerPageChange={n => { setPerPage(n); setPage(1); }}
                        itemLabel="accounts"
                    />
                )}
            </TableCard>

            {/* ── Edit Account modal ── */}
            <AnimatePresence>
                {editModal.open && (
                    <motion.div
                        className="AS-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeEdit}
                    >
                        <motion.div
                            className="AS-modal-card AA-edit-card"
                            initial={{ opacity: 0, scale: 0.9, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -6 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="AS-modal-title">Edit Account</div>
                            <div className="AS-modal-sub">Update this account's name, email, or role. Changes apply immediately.</div>

                            <div className="AA-edit-fields">
                                <Field label="Name" error={editModal.errors.name}>
                                    <Input
                                        value={editModal.name}
                                        onChange={e => setEditModal(m => ({ ...m, name: e.target.value }))}
                                        placeholder="Full name"
                                    />
                                </Field>
                                <Field label="Email" error={editModal.errors.email}>
                                    <Input
                                        type="email"
                                        value={editModal.email}
                                        onChange={e => setEditModal(m => ({ ...m, email: e.target.value }))}
                                        placeholder="name@company.com"
                                    />
                                </Field>
                                <div>
                                    <div className="AA-edit-roles-label">Role</div>
                                    <div className="AS-role-cards">
                                        {(['user', 'admin', 'super_admin'] as const).map(r => {
                                            const rc = ROLE_CARD[r];
                                            const selected = editModal.role === r;
                                            return (
                                                <div
                                                    key={r}
                                                    className={`AS-role-card${selected ? ' selected' : ''}`}
                                                    style={{ '--as-c': rc.c, '--as-bg': rc.bg, '--as-bd': rc.bd, '--as-ring': rc.bg } as any}
                                                    onClick={() => setEditModal(m => ({ ...m, role: r }))}
                                                >
                                                    <div className="AS-role-card-ic"><Ic d={rc.icon} sz={16} c={rc.c} sw={1.8} /></div>
                                                    <div className="AS-role-card-txt">
                                                        <div className="AS-role-card-title">{rc.title}</div>
                                                        <div className="AS-role-card-sub">{rc.sub}</div>
                                                    </div>
                                                    <div className="AS-role-card-check">
                                                        {selected && <Ic d="M5 13l4 4L19 7" sz={10} c="#faf9f7" sw={3} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {editModal.errors.role && <div className="MD-field-error-msg">{editModal.errors.role}</div>}
                                </div>
                            </div>

                            <div className="AS-modal-actions">
                                <button className="AS-modal-btn cancel" disabled={editModal.loading} onClick={closeEdit}>Cancel</button>
                                <button className="AS-modal-btn save" disabled={editModal.loading} onClick={saveEdit}>
                                    {editModal.loading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Account modal — genuine permanent delete from the
                 database, not the app's usual move-to-Recycle-Bin pattern,
                 per explicit request. Backend refuses (and this dialog
                 warns up front) if the account has ever created real
                 business records. ── */}
            <RecycleBinDeleteModal
                open={deleteModal.open}
                title="Delete Account"
                itemName={deleteModal.name ? `"${deleteModal.name}"` : undefined}
                description={deleteModal.name ? `Permanently delete ${deleteModal.name}'s account? This removes it from the database completely — not the Recycle Bin — and cannot be undone.` : undefined}
                confirmLabel="Delete Forever"
                warnText="Blocked automatically if this account has ever created a client, project, worker, or payment record — those need to be reassigned or removed first."
                onConfirm={confirmDelete}
                onCancel={closeDelete}
                loading={deleteModal.loading}
            />
        </div>
    );
}
