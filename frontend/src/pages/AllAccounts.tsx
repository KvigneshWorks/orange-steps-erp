import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { AS_CSS } from './AccountSettingsTheme';
import { Ic } from '../components/Icon';
import { PageHeader, StatCard, TableCard } from '../components/ui';

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

@media (prefers-reduced-motion: reduce) {
  .AA-empty-ic-wrap .ERP-empty-icon, .AA-empty-ring, .AA-full .ERP-empty-title, .AA-full .ERP-empty-sub {
    animation: none !important; opacity: 1 !important;
  }
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
            {[36, 190, 220, 110, 120].map((w, i) => (
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
    const hasFetched = useRef(false);

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
                                {['No.', 'Name', 'Email', 'Role', 'Joined'].map(h => <th key={h}>{h}</th>)}
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
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((a, i) => {
                                    const initials = a.name.trim().slice(0, 2).toUpperCase() || '??';
                                    return (
                                        <tr key={a.id}>
                                            <td className="ERP-t-num ERP-center">{i + 1}</td>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </TableCard>
        </div>
    );
}
