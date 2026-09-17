import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { Ic } from '../components/Icon';
import { PageHeader, StatCard, TableCard, Tag } from '../components/ui';

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
const ROLE_TAG_VARIANT: Record<string, 'ember' | 'info' | 'muted'> = { super_admin: 'ember', admin: 'info', user: 'muted' };

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

export default function AllAccounts() {
    const [accounts, setAccounts] = useState<AccountRow[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('users');
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

    return (
        <div className="ERP-page">
            <style>{ERP_CSS}</style>

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

            <div className="ERP-stats">
                <StatCard label="Total Accounts" value={counts.total} />
                <StatCard label="Super Admin" value={counts.super_admin} />
                <StatCard label="Admin" value={counts.admin} />
                <StatCard label="User" value={counts.user} />
            </div>

            <TableCard title="Accounts" count={loading ? undefined : accounts.length}>
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

                {!loading && accounts.length === 0 && (
                    <div className="ERP-empty">
                        <div className="ERP-empty-icon">
                            <Ic d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" sz={28} c="var(--ember-light)" sw={1.8} />
                        </div>
                        <div className="ERP-empty-title">No Accounts Found</div>
                        <div className="ERP-empty-sub">Something went wrong loading the account list</div>
                    </div>
                )}

                {!loading && accounts.length > 0 && (
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
                                {accounts.map((a, i) => (
                                    <tr key={a.id}>
                                        <td className="ERP-t-num ERP-center">{i + 1}</td>
                                        <td className="ERP-t-primary">{a.name}</td>
                                        <td>
                                            <span style={{ fontSize: 9.5, color: 'var(--text-4,#888)', fontFamily: "'JetBrains Mono',monospace" }}>{a.email}</span>
                                        </td>
                                        <td><Tag variant={ROLE_TAG_VARIANT[a.role] || 'muted'}>{ROLE_LABEL[a.role] || a.role}</Tag></td>
                                        <td>
                                            <span style={{ fontSize: 9.5, color: 'var(--text-4,#888)', fontFamily: "'JetBrains Mono',monospace" }}>{fmtDate(a.created_at)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </TableCard>
        </div>
    );
}
