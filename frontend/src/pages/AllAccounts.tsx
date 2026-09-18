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
const ROLE_AVATAR_BG: Record<string, string> = { super_admin: 'rgba(232,114,12,.10)', admin: '#fdf4ff', user: '#eff6ff' };
const ROLE_AVATAR_FG: Record<string, string> = { super_admin: '#E8720C', admin: '#9333ea', user: '#2563eb' };

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
                    <div style={{ height: 13, borderRadius: 6, width: w, background: 'linear-gradient(90deg,#E9EEF5 25%,#FFE0B2 50%,#E9EEF5 75%)', backgroundSize: '400px 100%', animation: 'erp-shimmer 1.4s infinite linear' }} />
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
        <div className="ERP-page">
            <style>{ERP_CSS}</style>
            <style>{AS_CSS}</style>

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
                            border: `1px solid ${filter === chip.key ? 'var(--ember-border,#60A5FA)' : 'var(--border)'}`,
                            background: filter === chip.key ? 'var(--ember-ghost,rgba(37,99,235,0.08))' : 'var(--white)',
                            color: filter === chip.key ? 'var(--ember,#60A5FA)' : 'var(--text-3,#555)',
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
                    <div className="ERP-empty">
                        <div className="ERP-empty-icon">
                            <Ic d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" sz={28} c="var(--ember-light)" sw={1.8} />
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
                                                    <div className="AS-avatar" style={{ background: ROLE_AVATAR_BG[a.role] || 'rgba(10,21,48,.06)', color: ROLE_AVATAR_FG[a.role] || '#0A1530' }}>{initials}</div>
                                                    <span className="ERP-t-primary">{a.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: 9.5, color: 'var(--text-4,#888)', fontFamily: 'var(--font-mono)' }}>{a.email}</span>
                                            </td>
                                            <td><span className={`AS-role ${a.role}`}>{ROLE_LABEL[a.role] || a.role}</span></td>
                                            <td>
                                                <span style={{ fontSize: 9.5, color: 'var(--text-4,#888)', fontFamily: 'var(--font-mono)' }}>{fmtDate(a.created_at)}</span>
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
