import { useState, useEffect, useCallback, useRef, lazy, Suspense, Fragment } from 'react';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from '../styles/ERPTheme';
import RunningLoader from '../components/RunningLoader';
import { PageHeader } from '../components/ui';
import { getStoredRole } from '../utils/roleAccess';
import ChangePasswordModal from '../components/ChangePasswordModal';
import './Dashboard.css';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    setStats as setStatsAction,
    setLoading as setLoadingAction,
    setPortalSummary as setPortalSummaryAction,
    setSummaryLoading as setSummaryLoadingAction,
    setRecentProjects as setRecentProjectsAction,
} from '../store/dashboardSlice';

const MasterData = lazy(() => import('./MasterData'));
const DaybookPage = lazy(() => import('./DaybookPage'));
const DaybookTransactions = lazy(() => import('./DaybookTransactions'));
const ClientPortalUnified = lazy(() => import('./ClientPortalUnified'));
const CreditManagement = lazy(() => import('./CreditManagement'));
const ReportCenter = lazy(() => import('./ReportCenter'));
const IncomeStatement = lazy(() => import('./IncomeStatement'));
const RecycleBin = lazy(() => import('./RecycleBin'));
const PendingApprovals = lazy(() => import('./PendingApprovals'));
const CreateAccount = lazy(() => import('./CreateAccount'));
const AllAccounts = lazy(() => import('./AllAccounts'));
const RolesPermissions = lazy(() => import('./RolesPermissions'));
const WorkforceRegister = lazy(() => import('./workforce/WorkforceRegister'));
const AttendanceManagement = lazy(() => import('./workforce/AttendanceManagement'));
const LabourPayment = lazy(() => import('./workforce/LabourPayment'));

function SuspenseAnimatedLoader({ label }: { label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}>
            <style>{ERP_CSS}</style>
            <RunningLoader label={label} />
        </div>
    );
}

const tilt3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
};

const resetTilt3D = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = ''; };

interface DashboardProps { onLogout: () => void; }
interface User { id: number; name: string; email: string; role: string; }
interface DashboardStats {
    activeProjects: number; revenue: string; siteInspections: number;
    pendingBOQs: number; teamMembers: number; cadRevisions: number;
}

interface Project {
    id: number; name: string; sub: string;
    status: 'active' | 'pending' | 'review' | 'hold';
    progress: number; value: string; date: string;
}

interface DueNotification {
    payment_id: number;
    client_name: string;
    project_name: string;
    amount: number;
    next_due_date: string;
    days_until_due: number;
}

interface PendingAccountRequest {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    created_at: string;
}

interface CreditDue {
    credit_entry_id: number;
    vendor_name: string;
    bill_number: string;
    credit_amount: number;
    due_date: string;
    days_until_due: number;
    is_overdue: boolean;
    days_overdue: number;
}

interface SessionInfo {
    loginAt: string;
    browser: string;
    os: string;
    device: string;
}

interface MonthlyData {
    month_label: string;
    collected: number;
    gst_total: number;
    grand_total: number;
    month: number;
    year: number;
}

interface PortalSummary {
    total_clients: number;
    total_projects: number;
    total_budget: number;
    total_collected: number;
    total_balance: number;
    collected_pct: number;
}

interface TypeDist {
    label: string;
    count: number;
    pct: number;
    budget: number;
    collected: number;
}

interface RecentProject {
    id: number;
    client_name: string;
    project_name: string;
    project_type: string;
    status: string;
    total_budget: number;
    collected: number;
    balance: number;
    created_at: string;
    raw_budget?: number;
}

/* ──────────────────────────────────────
    NAV STRUCTURE
───────────────────────────────────────── */
const NAV_STRUCTURE = [
    {
        section: 'Core', items: [
            { id: 'dashboard', label: 'Dashboard', badge: null, icon: 'dashboard', children: null },
        ]
    },

    {
        section: 'Core Records', items: [
            {
                id: 'master', label: 'Core Records', badge: null, icon: 'master', children: [
                    { id: 'master-category', label: 'Category' },
                    { id: 'master-subcategory', label: 'Sub-Category' },
                    { id: 'master-idtype', label: 'ID Type' },
                    { id: 'master-biodata', label: 'Contacts' },
                    { id: 'master-subname', label: 'Associates' },
                ]
            },
        ]
    },

    {
        section: 'Cash Book',
        items: [
            {
                id: 'daybook', label: 'Cash Book', badge: null, icon: 'daybook', children: [
                    { id: 'txn-daybook', label: 'New Entry' },
                    { id: 'txn-history', label: 'All Entries' },
                ]
            },
        ]
    },

    {
        section: 'Credit',
        items: [
            { id: 'txn-credit', label: 'Vendor Payments', badge: null, icon: 'money', children: null },
        ]
    },

    {
        section: 'Clients',
        items: [
            { id: 'client', label: 'Client Payments', badge: 'NEW', icon: 'client', children: null },
        ]
    },

    {
        section: 'Manpower', items: [
            {
                id: 'hr', label: 'Manpower', badge: null, icon: 'hr', children: [
                    { id: 'workforce', label: 'Worker List' },
                    { id: 'attendance', label: 'Attendance' },
                    { id: 'labour-payment', label: 'Worker Payments' },
                ]
            },
        ]
    },

    {
        section: 'Reports', items: [
            {
                id: 'report', label: 'Reports', badge: null, icon: 'report', children: [
                    { id: 'report-daybook', label: 'Cash Book Report' },
                    { id: 'report-credit', label: 'Vendor Payments Report' },
                    { id: 'report-labour', label: 'Worker Payments Report' },
                    { id: 'report-client', label: 'Client Payments Report' },
                    { id: 'report-pl', label: 'Profit & Loss' },
                ]
            },
        ]
    },

    {
        section: 'Administration', items: [
            {
                id: 'account-settings', label: 'Account Settings', badge: null, icon: 'shield', children: [
                    { id: 'create-account', label: 'Create Account' },
                    { id: 'pending-approvals', label: 'Pending Approvals' },
                    { id: 'all-accounts', label: 'All Accounts' },
                    { id: 'roles-permissions', label: 'Access Levels' },
                ]
            },
        ]
    },

    {
        section: 'System', items: [
            { id: 'recycle-bin', label: 'Recycle Bin', badge: null, icon: 'trash', children: null },
        ]
    },
];

const ADMIN_ALLOWED = new Set([
    'dashboard',
    'master', 'master-category', 'master-subcategory', 'master-idtype', 'master-biodata', 'master-subname',
    'daybook', 'txn-daybook', 'txn-history',
    'txn-credit',
    'hr', 'workforce', 'attendance', 'labour-payment',
    'report', 'report-daybook', 'report-credit', 'report-labour',
    'account-settings', 'create-account',
]);

const USER_ALLOWED = new Set([
    'dashboard',
    'hr', 'workforce', 'attendance', 'labour-payment',
]);

function filterChildren(items: typeof NAV_STRUCTURE[0]['items'], allowed: Set<string>) {
    return items
        .filter(i => allowed.has(i.id))
        .map(i => ({
            ...i,
            children: i.children ? i.children.filter(c => allowed.has(c.id)) : null,
        }))
        .filter(i => !i.children || i.children.length > 0);
}

function getNav(role?: string) {
    if (role === 'super_admin') return NAV_STRUCTURE;
    if (role === 'admin') {
        return NAV_STRUCTURE
            .filter(s => !['Clients'].includes(s.section))
            .map(s => ({ ...s, items: filterChildren(s.items, ADMIN_ALLOWED) }))
            .filter(s => s.items.length > 0);
    }
    if (role === 'user') {
        return NAV_STRUCTURE
            .filter(s => ['Core', 'Manpower'].includes(s.section))
            .map(s => ({ ...s, items: filterChildren(s.items, USER_ALLOWED) }))
            .filter(s => s.items.length > 0);
    }
    return NAV_STRUCTURE;
}
/* ──────────────────────────────────────
   NAV ICONS
───────────────────────────────────────── */
function NavIcon({ type, active = false }: { type: string; active?: boolean }) {
    const color = active ? '#C2410C' : '#9A3412';
    const s = {
        width: 17, height: 17, fill: 'none', stroke: color,
        strokeWidth: 1.65, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
        style: { flexShrink: 0 as number, transition: 'stroke 0.2s' },
    };

    switch (type) {
        case 'dashboard': return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7M17.5 14v7" /></svg>;
        case 'master': return <svg {...s} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="2.5" /><path d="M4 5v5c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V5" /><path d="M4 10v5c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-5" /><path d="M4 15v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" /></svg>;
        case 'daybook': return <svg {...s} viewBox="0 0 24 24"><path d="M7 16l-4-4 4-4M3 12h14M17 8l4 4-4 4M21 12H7" /></svg>;
        case 'money': return <svg {...s} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M12 10v4M10 12h4" /><circle cx="12" cy="12" r="2.5" /></svg>;
        case 'client': return <svg {...s} viewBox="0 0 24 24"><circle cx="9" cy="7" r="3.5" /><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" /><path d="M16 11l2 2 4-4" /></svg>;
        case 'report': return <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>;
        case 'trash': return <svg {...s} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>;
        case 'hr': return <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
        case 'shield': return <svg {...s} viewBox="0 0 24 24"><path d="M12 2l8 3.5v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6L12 2z" /><path d="M9 12l2 2 4-4" /></svg>;
        default: return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>;
    }
}
/* ──────────────────────────────────────
   SESSION ICON
───────────────────────────────────────── */
function SessIcon({ type, size = 12, color = 'currentColor' }: { type: string; size?: number; color?: string }) {
    const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: { flexShrink: 0 as number } };
    switch (type) {
        case 'calendar': return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
        case 'clock': return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
        case 'desktop': return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></svg>;
        case 'mobile': return <svg {...s} viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>;
        case 'os': return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M3 10h18" /></svg>;
        case 'globe': return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z" /></svg>;
        case 'lock': return <svg {...s} viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
        case 'shield': return <svg {...s} viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /></svg>;
        default: return null;
    }
}
/* ──────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function AnimCounter({ target, duration = 1200 }: { target: string; duration?: number }) {
    const num = parseFloat(target.replace(/[^0-9.]/g, '')) || 0;
    const isNum = !isNaN(num) && target !== '';
    const [display, setDisplay] = useState(0);
    const raf = useRef<number>(0);
    const t0 = useRef<number | null>(null);
    useEffect(() => {
        if (!isNum) return;
        t0.current = null;
        const step = (ts: number) => {
            if (!t0.current) t0.current = ts;
            const p = Math.min((ts - t0.current) / duration, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setDisplay(Math.round(num * e * 10) / 10);
            if (p < 1) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target]);
    if (!isNum) return <>{target}</>;
    return <>{Number.isInteger(display) ? display : display.toFixed(1)}</>;
}
/* ──────────────────────────────────────
   MONTHLY COLLECTION TREND
───────────────────────────────────────── */
function MonthlyRevenueChart({ data, loading }: { data: MonthlyData[]; loading?: boolean }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const fmt = (n: number) => n >= 100000
        ? `₹${(n / 100000).toFixed(1)}L`
        : n >= 1000
            ? `₹${(n / 1000).toFixed(0)}K`
            : `₹${n}`;

    const fmtParts = (n: number): [string, string, string] => n >= 100000
        ? ['₹', (n / 100000).toFixed(1), 'L']
        : n >= 1000
            ? ['₹', (n / 1000).toFixed(0), 'K']
            : ['₹', String(n), ''];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{
                        flex: 1, borderRadius: 6,
                        height: `${40 + Math.random() * 60}%`,
                        background: 'linear-gradient(90deg,#E8E2D8 25%,#F0ECE6 50%,#E8E2D8 75%)',
                        backgroundSize: '300px 100%',
                        animation: `ds-SK-shimmer 1.6s ease infinite`,
                        animationDelay: `${i * 0.1}s`,
                    }} />
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, flexDirection: 'column', gap: 8 }}>
                <svg width="28" height="28" fill="none" stroke="rgba(194,65,12,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 21V13M8 21V9M13 21V5M18 21v-6" /></svg>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--d-ice4)', letterSpacing: '1.5px' }}>NO COLLECTION DATA YET</span>
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => d.collected), 1);
    const currentMonthIdx = data.length - 1;
    const totalCollected = data.reduce((s, d) => s + d.collected, 0);
    const thisMonth = data[currentMonthIdx]?.collected || 0;
    const lastMonth = data[currentMonthIdx - 1]?.collected || 0;
    const growthPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : null;
    const avgVal = totalCollected / data.length;
    const [fmtPre, fmtNum, fmtSuf] = fmtParts(thisMonth);
    const [totPre, totNum, totSuf] = fmtParts(totalCollected);
    const avgPct = Math.min(Math.max((avgVal / maxVal) * 100, 0), 100);

    return (
        <div className="CH-v2" onMouseLeave={() => setHovered(null)}>
            <div className="CH-aurora a1" />
            <div className="CH-aurora a2" />

            {/* Hero Start */}
            <div className="CH-pill-row">

                {/* This Month Start */}
                <div className="CH-pill hero">
                    <div className="CH-pill-ico">
                        <svg width="14" height="14" fill="none" stroke="#faf9f7" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    </div>
                    <div>
                        <div className="CH-pill-lbl">This Month</div>
                        <div className="CH-pill-val hero">{fmtPre}<AnimCounter target={fmtNum} duration={1000} />{fmtSuf}</div>
                    </div>
                </div>
                {/* This Month End */}

                {/* Total Start */}
                <div className="CH-pill">
                    <div className="CH-pill-ico alt">
                        <svg width="13" height="13" fill="none" stroke="#faf9f7" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" /></svg>
                    </div>
                    <div>
                        <div className="CH-pill-lbl">6-Mo Total</div>
                        <div className="CH-pill-val">{totPre}<AnimCounter target={totNum} duration={1200} />{totSuf}</div>
                    </div>
                </div>
                {/* Total End */}

                {growthPct !== null && (
                    <span className={`CH-growth ${parseFloat(growthPct) >= 0 ? 'up' : 'down'}`}>
                        <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ transform: parseFloat(growthPct) >= 0 ? 'none' : 'rotate(180deg)' }}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        {Math.abs(parseFloat(growthPct))}%
                    </span>
                )}

            </div>
            {/* Hero End */}

            {/* Floating Gradient Bar Start */}
            <div className="CH-bars">
                <div className="CH-avg-line" style={{ bottom: `${avgPct}%` }}>
                    <span className="CH-avg-tag">AVG {fmt(avgVal)}</span>
                </div>
                {data.map((d, i) => {
                    const isCurrent = i === currentMonthIdx;
                    const isHov = hovered === i;
                    const pct = Math.max((d.collected / maxVal) * 100, 3);
                    return (
                        <div key={i} className="CH-bar-col" onMouseEnter={() => setHovered(i)}>
                            <div className="CH-bar-track">
                                <div
                                    className={`CH-bar ${isCurrent ? 'current' : ''} ${isHov ? 'hov' : ''}`}
                                    style={{ height: `${pct}%`, animationDelay: `${0.15 + i * 0.07}s` }}
                                >
                                    {isHov && <div className="CH-bar-tooltip">{fmt(d.collected)}</div>}
                                    {isCurrent && <span className="CH-bar-glow-dot" />}
                                </div>
                            </div>
                            <span className={`CH-bar-lbl ${isCurrent ? 'current' : ''}`}>{d.month_label}</span>
                        </div>
                    );
                })}
            </div>
            {/* Floating Gradient Bar Chart End */}
        </div>
    );
}

/* ──────────────────────────────────────
   PROJECT TYPE DISTRIBUTION CHART
───────────────────────────────────────── */
function ProjectTypesChart({ data, loading }: { data: TypeDist[]; loading: boolean }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const COLORS = ['#C2410C', '#DB5B1F', '#F0834D', '#9A3412', '#D98255', '#A6491D', '#EA580C'];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="SK" style={{ width: 80, height: 12, borderRadius: 4 }} />
                        <div className="SK" style={{ flex: 1, height: 8, borderRadius: 4 }} />
                        <div className="SK" style={{ width: 28, height: 12, borderRadius: 4 }} />
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, flexDirection: 'column', gap: 8 }}>
                <svg width="28" height="28" fill="none" stroke="rgba(194,65,12,0.3)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" />
                </svg>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--d-ice4)', letterSpacing: '1.5px' }}>NO PROJECTS YET</span>
            </div>
        );
    }
    const totalProjects = data.reduce((s, d) => s + d.count, 0);
    const hoveredItem = hovered !== null ? data[hovered] : null;

    return (
        <div>
            {/* Header Start */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8.5, color: 'var(--d-ice4)', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: 3 }}>
                        {hoveredItem ? hoveredItem.label : 'Total Projects'}
                    </div>
                    <div style={{
                        fontFamily: "'Instrument Serif',serif", fontSize: 32.5, fontStyle: 'italic', lineHeight: 1, transition: 'color 0.2s',
                        color: hoveredItem ? COLORS[hovered!] : 'var(--d-ice)',
                    }}>
                        {hoveredItem ? hoveredItem.count : totalProjects}
                        {hoveredItem && <span style={{ fontSize: 15.5, marginLeft: 6, fontFamily: 'JetBrains Mono,monospace', fontStyle: 'normal' }}>· {hoveredItem.pct}%</span>}
                    </div>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8.5, color: 'var(--d-ice4)', letterSpacing: '1.4px' }}>{data.length} type{data.length === 1 ? '' : 's'}</span>
            </div>
            {/* Header End */}

            {/* Section Start */}
            <div style={{ display: 'flex', height: 16, borderRadius: 9, overflow: 'hidden', background: 'rgba(0,0,0,.05)', marginBottom: 18, boxShadow: 'inset 0 1px 3px rgba(0,0,0,.05)' }}>
                {data.map((d, i) => (
                    <div
                        key={d.label}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            width: `${d.pct}%`, minWidth: d.pct > 0 ? 4 : 0,
                            background: COLORS[i % COLORS.length],
                            opacity: hovered !== null && hovered !== i ? 0.4 : 1,
                            transform: hovered === i ? 'scaleY(1.15)' : 'scaleY(1)',
                            transition: 'all 0.25s cubic-bezier(.22,1,.36,1)', cursor: 'pointer',
                            animation: `ds-barGrow 0.8s ${i * 0.08}s cubic-bezier(.22,1,.36,1) both`,
                            borderRight: i < data.length - 1 ? '1.5px solid #faf9f7' : 'none',
                        }}
                    />
                ))}
            </div>
            {/* Section End */}

            {/* Tile Grid Start */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {data.map((d, i) => (
                    <div
                        key={d.label}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            padding: '9px 12px', borderRadius: 11, cursor: 'pointer',
                            background: hovered === i ? `${COLORS[i % COLORS.length]}0F` : '#FAF9F7',
                            border: `1px solid ${hovered === i ? COLORS[i % COLORS.length] + '55' : 'var(--d-line)'}`,
                            borderLeft: `3px solid ${COLORS[i % COLORS.length]}`,
                            transition: 'all 0.22s ease', transform: hovered === i ? 'translateY(-2px)' : 'none',
                            animation: `ds-rowIn 0.4s ${i * 0.07}s ease both`,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9.5, color: 'var(--d-ice3)', fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase' }}>{d.label}</span>
                            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, fontWeight: 800, color: COLORS[i % COLORS.length] }}>{d.pct}%</span>
                        </div>
                        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontStyle: 'italic', color: 'var(--d-ice)', lineHeight: 1 }}>{d.count}</div>
                    </div>
                ))}
            </div>
            {/* Tile Grid End */}
        </div>
    );
}

/* ──────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────── */
function NotificationPanel({ notifications, creditNotifs, pendingApprovals, onClose, onNavigate }: {
    notifications: DueNotification[];
    creditNotifs: CreditDue[];
    pendingApprovals: PendingAccountRequest[];
    onClose: () => void;
    onNavigate: (path: string) => void;
}) {
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const safeCredits = Array.isArray(creditNotifs) ? creditNotifs : [];
    const safeApprovals = Array.isArray(pendingApprovals) ? pendingApprovals : [];
    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const urgencyClass = (days: number) => days <= 0 ? 'urgent' : days <= 7 ? 'soon' : 'normal';
    const urgencyLabel = (days: number) => days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days}d`;
    const urgencyColor = (days: number) => days <= 0 ? 'var(--d-red)' : days <= 7 ? 'var(--d-or)' : 'var(--d-blue)';
    const overdue = safeNotifications.filter(n => n.days_until_due <= 0).length;
    const thisWeek = safeNotifications.filter(n => n.days_until_due > 0 && n.days_until_due <= 7).length;
    const upcoming = safeNotifications.filter(n => n.days_until_due > 7 && n.days_until_due <= 20).length;
    const totalCount = safeNotifications.length + safeCredits.length + safeApprovals.length;
    const ROLE_LBL: Record<string, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

    const timeAgo = (iso: string) => {
        const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.round(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.round(hrs / 24)}d ago`;
    };

    return (
        <div className="NP-wrap">
            <div style={{ height: 3, background: overdue > 0 ? 'linear-gradient(to right,#D93B55,#F0834D)' : safeApprovals.length > 0 ? 'linear-gradient(to right,#9A3412,#F0834D)' : 'linear-gradient(to right,#F0834D,#C2410C)', borderRadius: '16px 16px 0 0' }} />
            <div className="NP-head">
                <div className="NP-title">
                    <svg width="14" height="14" fill="none" stroke={overdue > 0 ? '#D93B55' : safeApprovals.length > 0 ? '#9A3412' : '#C2410C'} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                    {totalCount > 0 && <span className="NP-count">{totalCount}</span>}
                </div>
                <button className="NP-clear" onClick={onClose}>Close ×</button>
            </div>

            {safeNotifications.length > 0 && (
                <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {overdue > 0 && <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: 'rgba(217,59,85,.1)', color: 'var(--d-red)', border: '1px solid rgba(217,59,85,.22)' }}>{overdue} OVERDUE</span>}
                    {thisWeek > 0 && <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: 'rgba(194,65,12,.1)', color: 'var(--d-or)', border: '1px solid rgba(194,65,12,.22)' }}>{thisWeek} THIS WEEK</span>}
                    {upcoming > 0 && <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: 'rgba(234,88,12,.1)', color: 'var(--d-blue)', border: '1px solid rgba(234,88,12,.22)' }}>{upcoming} UPCOMING</span>}
                </div>
            )}

            <div className="NP-body">
                {safeCredits.length === 0 && safeNotifications.length === 0 && safeApprovals.length === 0 ? (
                    <div className="NP-empty">
                        <svg width="32" height="32" fill="none" stroke="rgba(194,65,12,0.25)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 10 }}><path d="M5 13l4 4L19 7" /></svg>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 800, color: 'var(--d-ice)', marginBottom: 4 }}>All Caught Up!</div>
                        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, letterSpacing: '1px' }}>Nothing needs your attention right now</div>
                    </div>
                ) : (
                    <>
                        {/* ── Section 0: Account Approvals Start ── */}
                        {safeApprovals.length > 0 && (<>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px 5px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                                <svg width="10" height="10" fill="none" stroke="#9A3412" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(0,0,0,.4)' }}>Account Approvals — Needs Your Review</span>
                                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(154,52,18,.1)', color: '#9A3412' }}>{safeApprovals.length}</span>
                            </div>
                            {safeApprovals.map((req, i) => {
                                const initials = req.name.trim().slice(0, 2).toUpperCase() || '??';
                                return (
                                    <div key={req.id} className="NP-item soon" style={{ animationDelay: `${i * 0.05}s`, borderLeft: '3px solid #9A3412' }} onClick={() => { onNavigate('pending-approvals'); onClose(); }}>
                                        <div className="NP-dot soon" style={{ background: 'rgba(154,52,18,.12)' }}>
                                            <span style={{ fontSize: 9, fontWeight: 800, color: '#9A3412' }}>{initials}</span>
                                        </div>
                                        <div className="NP-info">
                                            <div className="NP-client">{req.name}</div>
                                            <div className="NP-proj">{req.email} · wants {ROLE_LBL[req.role] || req.role} access</div>
                                            <div className="NP-meta">
                                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: '#9A3412', fontWeight: 800 }}>PENDING</span>
                                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--d-ice4)' }}>{timeAgo(req.created_at)}</span>
                                            </div>
                                        </div>
                                        <div style={{ flexShrink: 0, paddingTop: 2 }}>
                                            <svg width="12" height="12" fill="none" stroke="var(--d-ice4)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </>)}
                        {/* Section 0: Account Approvals End */}

                        {/* ── Section 1: Accounts Payable Start ── */}
                        {safeCredits.length > 0 && (<>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px 5px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                                <svg width="10" height="10" fill="none" stroke="var(--d-or)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(0,0,0,.4)' }}>Accounts Payable — Pay to Vendor</span>
                                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: safeCredits.some(c => c.is_overdue) ? 'rgba(217,59,85,.1)' : 'rgba(194,65,12,.1)', color: safeCredits.some(c => c.is_overdue) ? 'var(--d-red)' : 'var(--d-or)' }}>{safeCredits.length}</span>
                            </div>
                            {safeCredits.map((c, i) => {
                                const days = c.is_overdue ? -c.days_overdue : c.days_until_due;
                                const col = days <= 0 ? 'var(--d-red)' : days <= 3 ? 'var(--d-or)' : 'var(--d-blue)';
                                const lbl = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Tomorrow' : `${days}d left`;
                                return (
                                    <div key={c.credit_entry_id} className={`NP-item ${days <= 0 ? 'urgent' : 'soon'}`} style={{ animationDelay: `${i * 0.05}s`, borderLeft: days <= 0 ? '3px solid var(--d-red)' : 'none' }} onClick={() => { onNavigate('txn-credit'); onClose(); }}>
                                        <div className={`NP-dot ${days <= 0 ? 'urgent' : 'soon'}`}>
                                            <svg width="14" height="14" fill="none" stroke={col} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">{days <= 0 ? <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></> : <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>}</svg>
                                        </div>
                                        <div className="NP-info">
                                            <div className="NP-client" style={{ color: days <= 0 ? 'var(--d-red)' : 'inherit' }}>{c.vendor_name}</div>
                                            <div className="NP-proj">Bill #{c.bill_number} · Time to Pay</div>
                                            <div className="NP-meta">
                                                <span className="NP-amt" style={{ color: col }}>₹{c.credit_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                <span className={`NP-days ${days <= 0 ? 'urgent' : 'soon'}`}>{lbl}</span>
                                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, color: 'var(--d-ice4)' }}>{c.due_date}</span>
                                            </div>
                                        </div>
                                        <svg width="12" height="12" fill="none" stroke="var(--d-ice4)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                                    </div>
                                );
                            })}
                        </>)}
                        {/* Section 1 : Accounts Payable End */}

                        {/* ── Section 2: Accounts Receivable Start ── */}
                        {safeNotifications.length > 0 && (<>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px 5px', borderBottom: '1px solid rgba(0,0,0,.06)', borderTop: safeCredits.length > 0 ? '2px solid rgba(0,0,0,.05)' : 'none' }}>
                                <svg width="10" height="10" fill="none" stroke="#C2410C" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(0,0,0,.4)' }}>Accounts Receivable — Collect from Client</span>
                                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(194,65,12,.1)', color: '#C2410C' }}>{safeNotifications.length}</span>
                            </div>

                            {safeNotifications.map((n, i) => {
                                const uc = urgencyClass(n.days_until_due);
                                const col = urgencyColor(n.days_until_due);
                                return (
                                    <div key={n.payment_id} className={`NP-item ${uc}`} style={{ animationDelay: `${i * 0.05}s`, borderLeft: n.days_until_due <= 0 ? '3px solid var(--d-red)' : 'none' }} onClick={() => { onNavigate('client'); onClose(); }}>
                                        <div className={`NP-dot ${uc}`}>
                                            <svg width="14" height="14" fill="none" stroke={col} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                                {uc === 'urgent' ? <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></> : <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>}
                                            </svg>
                                        </div>
                                        <div className="NP-info">
                                            <div className="NP-client">{n.client_name}</div>
                                            <div className="NP-proj">{n.project_name} · Time to Collect</div>
                                            <div className="NP-meta">
                                                <span className="NP-amt" style={{ color: col }}>{fmt(n.amount)}</span>
                                                <span className={`NP-days ${uc}`}>{urgencyLabel(n.days_until_due)}</span>
                                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, color: 'var(--d-ice4)' }}>{n.next_due_date}</span>
                                            </div>
                                        </div>
                                        <div style={{ flexShrink: 0, paddingTop: 2 }}>
                                            <svg width="12" height="12" fill="none" stroke="var(--d-ice4)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </>)}
                        {/* ── Section 2: Accounts Receivable Start ── */}
                    </>
                )}
            </div>

            {safeNotifications.length > 0 && (
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--d-line)', background: '#F5F3EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--d-ice4)', letterSpacing: '1px' }}>Click any item to open Accounts Receivable</span>
                    <button onClick={() => { onNavigate('client'); onClose(); }} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, fontWeight: 800, padding: '5px 12px', borderRadius: 7, background: 'linear-gradient(135deg,#C2410C,#F0834D)', color: '#faf9f7', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}>VIEW ALL →</button>
                </div>
            )}

        </div>
    );
}

/* ──────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function Placeholder({ id }: { id: string }) {
    const lbl = NAV_STRUCTURE.flatMap(s => s.items).flatMap(i => [i, ...(i.children || [])]).find((x: any) => x.id === id)?.label || id;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20, textAlign: 'center', animation: 'ds-pageIn .5s cubic-bezier(.22,1,.36,1) both' }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(194,65,12,0.08)', border: '1px solid rgba(194,65,12,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" fill="none" stroke="#C2410C" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7M17.5 14v7" /></svg>
            </div>
            <div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32.5, fontWeight: 600, fontStyle: 'italic', color: '#231C14', marginBottom: 6 }}>{lbl}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#6B5D48', letterSpacing: '3px', textTransform: 'uppercase' }}>Module · WhiteNode</div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', padding: '8px 22px', borderRadius: 8, background: 'rgba(194,65,12,0.08)', color: '#C2410C', border: '1px solid rgba(194,65,12,0.28)' }}>Coming Soon</div>
        </div>
    );
}

function SectionHeader({ icon, eyebrow, title, subtitle, accent = '#C2410C', actions }: {
    icon: React.ReactNode; eyebrow: string; title: string; subtitle: string; accent?: string; actions?: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0 18px', marginBottom: 8, borderBottom: `2px solid ${accent}22`, animation: 'ds-pageIn .45s cubic-bezier(.22,1,.36,1) both' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: `${accent}12`, border: `1.5px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${accent}16` }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, letterSpacing: '3px', color: accent, textTransform: 'uppercase', marginBottom: 4, fontWeight: 800 }}>{eyebrow}</div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28.5, fontWeight: 600, fontStyle: 'italic', color: '#231C14', lineHeight: 1.1 }}>{title}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#6B5D48', marginTop: 3, letterSpacing: '1px' }}>{subtitle}</div>
            </div>
            {actions && <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
        </div>
    );
}

/* ──────────────────────────────────────
   DASHBOARD CONTENT — fully dynamic
───────────────────────────────────────── */
function DashContent({
    stats, recentProjects, loading, userName,
    monthlyRevenue, monthlyLoading,
    portalSummary, summaryLoading,
    typeDist, typeDistLoading,
    notifications, creditNotifs,
    onNavigate,
}: {
    stats: DashboardStats | null;
    recentProjects: RecentProject[];
    loading: boolean;
    userName: string;
    monthlyRevenue: MonthlyData[];
    monthlyLoading: boolean;
    portalSummary: PortalSummary | null;
    summaryLoading: boolean;
    typeDist: TypeDist[];
    typeDistLoading: boolean;
    notifications: DueNotification[];
    creditNotifs: CreditDue[];
    onNavigate: (id: string) => void;
}) {
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const fmt = (n: number) => n >= 100000
        ? `₹${(n / 100000).toFixed(1)}L`
        : n >= 1000
            ? `₹${(n / 1000).toFixed(0)}K`
            : `₹${n}`;

    const normalizeStatus = (s: string): 'active' | 'pending' | 'review' | 'hold' => {
        const lower = (s || '').toLowerCase();
        if (lower === 'active' || lower === 'in_progress' || lower === 'ongoing') return 'active';
        if (lower === 'pending' || lower === 'new') return 'pending';
        if (lower === 'review' || lower === 'review_pending') return 'review';
        return 'hold';
    };

    const displayProjects = recentProjects.slice(0, 4).map(p => ({
        id: p.id,
        name: p.project_name || p.client_name,
        sub: p.client_name,
        status: normalizeStatus(p.status),
        progress: p.total_budget > 0 ? Math.round((p.collected / p.total_budget) * 100) : 0,
        value: fmt(p.total_budget || p.raw_budget || 0),
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—',
    }));

    const CARDS = [
        {
            lbl: 'Total Projects',
            val: summaryLoading ? '…' : String(portalSummary?.total_projects ?? 0),
            dt: String(recentProjects.filter(p => normalizeStatus(p.status) === 'active').length) + ' active',
            dir: 'up' as const,
            sub: 'added in Accounts Receivable',
            c: '#C2410C', bg: 'rgba(194,65,12,.09)', d: 0,
            iconPath: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7M17.5 14v7" /></>,
        },
        {
            lbl: 'Total Budget',
            val: summaryLoading ? '…' : (portalSummary ? (portalSummary.total_budget / 100000).toFixed(1) : '0'),
            dt: portalSummary ? fmt(portalSummary.total_collected) + ' collected' : '—',
            dir: 'up' as const,
            sub: 'in ₹ Lakhs',
            c: '#F0834D', bg: 'rgba(194,65,12,.09)', d: 0.08,
            iconPath: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></>,
        },
        {
            lbl: 'Total Collected',
            val: summaryLoading ? '…' : (portalSummary ? (portalSummary.total_collected / 100000).toFixed(1) : '0'),
            dt: portalSummary ? `${portalSummary.collected_pct}% of budget` : '—',
            dir: 'up' as const,
            sub: 'in ₹ Lakhs',
            c: '#1E9C6A', bg: 'rgba(30,156,106,.09)', d: 0.16,
            iconPath: <path d="M5 13l4 4L19 7" />,
        },
        {
            lbl: 'Balance Due',
            val: summaryLoading ? '…' : (portalSummary ? (portalSummary.total_balance / 100000).toFixed(1) : '0'),
            dt: portalSummary && portalSummary.total_budget > 0
                ? `${(100 - portalSummary.collected_pct).toFixed(1)}% pending`
                : '—',
            dir: 'down' as const,
            sub: 'in ₹ Lakhs',
            c: '#D93B55', bg: 'rgba(217,59,85,.09)', d: 0.24,
            iconPath: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></>,
        },
        {
            lbl: 'Total Clients',
            val: summaryLoading ? '…' : String(portalSummary?.total_clients ?? 0),
            dt: String(portalSummary?.total_projects ?? 0) + ' projects',
            dir: 'up' as const,
            sub: 'registered clients',
            c: '#EA580C', bg: 'rgba(234,88,12,.09)', d: 0.32,
            iconPath: <><circle cx="9" cy="7" r="3.5" /><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" /><path d="M16 11l2 2 4-4" /></>,
        },
        {
            lbl: 'Team Members',
            val: loading ? '…' : String(stats?.teamMembers ?? 0),
            dt: 'on active roster',
            dir: 'up' as const,
            sub: 'active users',
            c: '#524532', bg: 'rgba(82,69,50,.07)', d: 0.40,
            iconPath: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></>,
        },
    ];

    const activeProjCount = recentProjects.filter(p => normalizeStatus(p.status) === 'active').length;
    const activeProjPct = recentProjects.length > 0
        ? parseFloat(((activeProjCount / recentProjects.length) * 100).toFixed(1))
        : 0;

    const dynKPIs = portalSummary ? [
        { label: 'Collection Rate', val: portalSummary.collected_pct, color: '#C2410C', warn: false },
        {
            label: 'Balance / Budget',
            val: portalSummary.total_budget > 0
                ? parseFloat(((portalSummary.total_balance / portalSummary.total_budget) * 100).toFixed(1))
                : 0,
            color: '#9A3412', warn: true,
        },
        { label: 'Active Client Projects', val: activeProjPct, color: '#EA580C', warn: false },
    ] : [
        { label: 'Collection Rate', val: 0, color: '#C2410C', warn: false },
        { label: 'Balance / Budget', val: 0, color: '#9A3412', warn: true },
        { label: 'Active Client Projects', val: 0, color: '#EA580C', warn: false },
    ];

    const healthGood = portalSummary ? portalSummary.collected_pct >= 50 : false;
    const overdueClientCount = notifications.filter(n => n.days_until_due <= 0).length;
    const overdueCreditCount = creditNotifs.filter(c => c.is_overdue).length;
    const overdueTotal = overdueClientCount + overdueCreditCount;
    const MODULES: Array<{
        id: string; title: string; tag: string; desc: string;
        c: string; bg: string; tagBg: string; tagBorder: string;
        iconPath: React.ReactNode;
        metrics?: { v: string | number; l: string }[];
        tags?: string[];
    }> = [
            {
                id: 'master', title: 'Core Records', tag: 'Setup',
                desc: 'Account Heads, account sub-heads, party master & Identification types — the foundation behind every entry.',
                c: '#C2410C', bg: 'rgba(194,65,12,.09)', tagBg: 'rgba(194,65,12,.08)', tagBorder: 'rgba(194,65,12,.22)',
                iconPath: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="7" rx="1.5" /><rect x="14" y="15" width="7" height="7" rx="1.5" /></>,
                tags: ['Account Heads', 'Account Sub-Heads', 'Party Master', 'Identification Types'],
            },
            {
                id: 'txn-daybook', title: 'Cash Book', tag: 'Explore',
                desc: 'Log day-to-day income & expense transactions with category-linked entries.',
                c: '#F0834D', bg: 'rgba(194,65,12,.09)', tagBg: 'rgba(194,65,12,.08)', tagBorder: 'rgba(194,65,12,.22)',
                iconPath: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></>,
                tags: ['Income', 'Expense', 'Multi-Filter'],
            },
            {
                id: 'txn-credit', title: 'Accounts Payable', tag: 'Explore',
                desc: 'Track vendor credit, dues & payment history in one running ledger.',
                c: '#D93B55', bg: 'rgba(217,59,85,.09)', tagBg: 'rgba(217,59,85,.08)', tagBorder: 'rgba(217,59,85,.22)',
                iconPath: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></>,
                tags: ['Vendor Ledger', 'Due Alerts'],
            },
            {
                id: 'client', title: 'Accounts Receivable', tag: 'Live',
                desc: 'Manage projects, budgets & client collections end-to-end.',
                c: '#1E9C6A', bg: 'rgba(30,156,106,.09)', tagBg: 'rgba(30,156,106,.08)', tagBorder: 'rgba(30,156,106,.22)',
                iconPath: <><circle cx="9" cy="7" r="3.5" /><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" /><path d="M16 11l2 2 4-4" /></>,
                metrics: portalSummary ? [
                    { v: portalSummary.total_clients, l: 'Clients' },
                    { v: `${portalSummary.collected_pct}%`, l: 'Collected' },
                    { v: `${(portalSummary.total_balance / 100000).toFixed(1)}L`, l: 'Balance' },
                ] : undefined,
                tags: ['Budgets', 'Payments', 'Due Reminders'],
            },
            {
                id: 'workforce', title: 'Manpower & Attendance', tag: 'Live',
                desc: 'Attendance, worker registry & wage disbursement tracking.',
                c: '#EA580C', bg: 'rgba(234,88,12,.09)', tagBg: 'rgba(234,88,12,.08)', tagBorder: 'rgba(234,88,12,.22)',
                iconPath: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></>,
                metrics: [{ v: stats?.teamMembers ?? 0, l: 'Team' }],
                tags: ['Attendance', 'Payroll', 'Registry'],
            },
            {
                id: 'report-daybook', title: 'Business Insights', tag: 'Explore',
                desc: 'Cash Book, Credit, Manpower, Client & Income Statement — five report centers, one click away.',
                c: '#524532', bg: 'rgba(82,69,50,.07)', tagBg: 'rgba(82,69,50,.06)', tagBorder: 'rgba(82,69,50,.16)',
                iconPath: <><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /></>,
                metrics: [{ v: 5, l: 'Insights' }],
                tags: ['PDF Export', 'Chained Filters', 'Instant Search'],
            },
        ];

    const QUICK_ACTIONS = [
        { id: 'txn-daybook', lbl: 'New Cash Book Entry', c: '#F0834D', bg: 'rgba(194,65,12,.12)', icon: <><path d="M12 5v14M5 12h14" /></> },
        { id: 'txn-credit', lbl: 'Add Bill', c: '#D93B55', bg: 'rgba(217,59,85,.12)', icon: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></> },
        { id: 'client', lbl: 'Accounts Receivable', c: '#1E9C6A', bg: 'rgba(30,156,106,.12)', icon: <><circle cx="9" cy="7" r="3.5" /><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" /></> },
        { id: 'attendance', lbl: 'Mark Attendance', c: '#EA580C', bg: 'rgba(234,88,12,.12)', icon: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></> },
        { id: 'report-daybook', lbl: 'View Insights', c: '#524532', bg: 'rgba(82,69,50,.1)', icon: <><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /></> },
    ];

    return (
        <div className="PAGE-WRAP DH-page">

            {/* Header Start */}
            <PageHeader eyebrow="Studio Overview" title="Control Panel" titleClassName="MD-page-title" />
            <div className="ERP-divider" />
            {/* Header End */}

            {/* Hero Start */}
            <div className="DH-hero">
                <div className="DH-hero-glow g1" /><div className="DH-hero-glow g2" />
                <div className="DH-sparkle" /><div className="DH-sparkle" /><div className="DH-sparkle" /><div className="DH-sparkle" />
                <div className="DH-hero-main">
                    <div>
                        <span className="DH-hero-eyebrow">{today}</span>
                        <h2 className="DH-hero-title">{greet}{userName ? <>, <em>{userName}</em></> : null}</h2>
                        <p className="DH-hero-sub">Here's the live pulse of your studio — projects, collections and workforce, all in one command view.</p>
                    </div>
                    <div
                        className={`DH-hero-status ${overdueTotal > 0 ? 'urgent' : 'clear'}`}
                        onClick={() => onNavigate(overdueClientCount >= overdueCreditCount ? 'client' : 'txn-credit')}
                        role="button" tabIndex={0}
                    >
                        <span className="DH-hero-status-lbl">{overdueTotal > 0 ? 'Action Needed' : 'All Clear'}</span>
                        <div className="DH-hero-status-body">
                            {overdueTotal > 0 ? (
                                <>
                                    <span className="DH-hero-status-dot" />
                                    <span className="DH-hero-status-val">{overdueTotal}</span>
                                    <span className="DH-hero-status-sub">Overdue</span>
                                </>
                            ) : (
                                <>
                                    <svg className="DH-hero-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E9C6A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                                    <span className="DH-hero-status-sub">No dues overdue</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="DH-quick-row">
                    {QUICK_ACTIONS.map((a, i) => (
                        <div key={a.id} className="DH-quick-pill" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate(a.id)}>
                            <div className="DH-quick-ico" style={{ background: a.bg }}>
                                <svg width="13" height="13" fill="none" stroke={a.c} strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
                            </div>
                            <span className="DH-quick-lbl">{a.lbl}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* Hero End */}

            {/* KPI Tiles Start */}
            {(loading && summaryLoading)
                ? <div className="DH-kpi-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="SK" style={{ height: 132, borderRadius: 18 }} />)}</div>
                : <div className="DH-kpi-grid">
                    {CARDS.map((s, idx) => (
                        <div className="DH-kpi-tile" key={s.lbl} style={{ '--tile-c': s.c, animationDelay: `${s.d}s` } as React.CSSProperties} onMouseMove={tilt3D} onMouseLeave={resetTilt3D}>
                            <div className="DH-kpi-badge" style={{ background: s.bg }}>
                                <svg width="18" height="18" fill="none" stroke={s.c} strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{s.iconPath}</svg>
                            </div>
                            <div className="DH-kpi-val" style={{ color: s.c }}>
                                <AnimCounter target={s.val} duration={900 + idx * 100} />{s.sub.includes('Lakh') ? 'L' : ''}
                            </div>
                            <div className="DH-kpi-lbl">{s.lbl}</div>
                            <span className={`DH-kpi-delta ${s.dir}`}>
                                <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ transform: s.dir === 'up' ? 'none' : 'rotate(180deg)' }}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {s.dt}
                            </span>
                        </div>
                    ))}
                </div>
            }
            {/* KPI Tiles End */}

            {/* Charts Start */}
            <div className="DH-strip-head">
                <div>
                    <div className="DH-strip-eyebrow">Live Analytics</div>
                    <div className="DH-strip-title">Collections &amp; Project Mix</div>
                </div>
                <span className="DH-strip-sub">Auto-refreshes every 5 min</span>
            </div>
            {(loading && monthlyLoading && typeDistLoading)
                ? <div className="DH-chart-row"><div className="SK" style={{ height: 300, borderRadius: 20 }} /><div className="SK" style={{ height: 300, borderRadius: 20 }} /></div>
                : <div className="DH-chart-row">
                    <div className="DH-panel" onMouseMove={tilt3D} onMouseLeave={resetTilt3D}>
                        <div className="DH-panel-hd">
                            <div>
                                <div className="DH-panel-tt">Client Collection Trend</div>
                                <div className="DH-panel-sb">Monthly · Last 6 months · Live data</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="CH-tag" style={{ background: 'rgba(30,156,106,.07)', color: '#1E9C6A', borderColor: 'rgba(30,156,106,.18)' }}>₹ Live</span>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1E9C6A', boxShadow: '0 0 5px rgba(30,156,106,.5)', animation: 'ds-glow 2s infinite' }} />
                            </div>
                        </div>
                        <MonthlyRevenueChart data={monthlyRevenue} loading={monthlyLoading} />
                    </div>

                    <div className="DH-panel" onMouseMove={tilt3D} onMouseLeave={resetTilt3D}>
                        <div className="DH-panel-hd">
                            <div>
                                <div className="DH-panel-tt">Project Type Distribution</div>
                                <div className="DH-panel-sb">Live · By project count · Hover to explore</div>
                            </div>
                            <span className="CH-tag">Studio</span>
                        </div>
                        <ProjectTypesChart data={typeDist} loading={typeDistLoading} />
                    </div>
                </div>
            }
            {/* Charts End */}

            {/* Business Pulse + Recent Projects Start */}
            {(loading && summaryLoading)
                ? <div className="DH-pulse-row"><div className="SK" style={{ height: 300, borderRadius: 20 }} /><div className="SK" style={{ height: 300, borderRadius: 20 }} /></div>
                : <div className="DH-pulse-row">

                    {/* Business Health Start */}
                    <div className="DH-panel" onMouseMove={tilt3D} onMouseLeave={resetTilt3D}>
                        <div className="DH-panel-hd">
                            <div>
                                <div className="DH-panel-tt">Business Health</div>
                                <div className="DH-panel-sb">Live KPI overview, updated in real time</div>
                            </div>
                            <span className="DH-kpi-delta" style={{ color: healthGood ? 'var(--ember)' : 'var(--warn)', background: healthGood ? 'var(--ember-ghost)' : 'var(--warn-bg)' }}>
                                {healthGood ? 'Performing well' : 'Needs attention'}
                            </span>
                        </div>

                        <div className="DH-gauge-row">
                            {dynKPIs.map((k, i) => {
                                const r = 27, circ = 2 * Math.PI * r, pct = Math.min(Math.max(k.val, 0), 100);
                                const dash = circ * (pct / 100);
                                const col = k.color;
                                return (
                                    <div className="DH-gauge" key={k.label} style={{ animation: `dhRise 0.4s ${0.15 + i * 0.08}s ease both` }}>
                                        <div className="DH-gauge-ring">
                                            <svg width="100%" height="100%" viewBox="0 0 66 66" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
                                                <circle cx="33" cy="33" r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth="6" />
                                                <circle
                                                    cx="33" cy="33" r={r} fill="none" stroke={col} strokeWidth="6"
                                                    strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
                                                    style={{ transition: 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)' }}
                                                />
                                            </svg>
                                            <div className="DH-gauge-val" style={{ color: col }}>{k.val}%</div>
                                        </div>
                                        <div className="DH-gauge-lbl">{k.label}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {portalSummary && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, color: 'var(--d-ice)' }}>Financial Composition</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--d-ice4)' }}>Budget {(portalSummary.total_budget / 100000).toFixed(1)}L</span>
                                </div>
                                <div className="DH-fin-bar">
                                    <div className="DH-fin-seg" style={{ width: `${portalSummary.collected_pct}%`, background: 'linear-gradient(to right,#C2410C,#EA580C)' }} />
                                    <div className="DH-fin-seg" style={{ width: `${Math.max(100 - portalSummary.collected_pct, 0)}%`, background: 'linear-gradient(to right,#9A3412,#DB5B1F)', animationDelay: '0.1s' } as React.CSSProperties} />
                                </div>
                                <div className="DH-fin-legend">
                                    <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#C2410C' }} />Collected <b style={{ color: '#C2410C' }}>&nbsp;{(portalSummary.total_collected / 100000).toFixed(1)}L</b></div>
                                    <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#9A3412' }} />Balance <b style={{ color: '#9A3412' }}>&nbsp;{(portalSummary.total_balance / 100000).toFixed(1)}L</b></div>
                                    <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#DB5B1F' }} />Client Dues <b>&nbsp;{notifications.length}</b></div>
                                    <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: 'var(--d-or)' }} />Credit Dues <b>&nbsp;{creditNotifs.length}</b></div>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Business Health End */}

                    {/* Recent Projects Start */}
                    <div className="DH-panel">
                        <div className="DH-panel-hd">
                            <div>
                                <div className="DH-panel-tt">Recent Projects</div>
                                <div className="DH-panel-sb">Latest activity · {displayProjects.length} records</div>
                            </div>
                            <button className="TB-btn" onClick={() => onNavigate('client')}>View All →</button>
                        </div>

                        <div style={{ minHeight: 220, maxHeight: 280, overflowY: 'auto' }}>
                            {displayProjects.length === 0 ? (
                                <div className="DH-empty">
                                    <svg width="26" height="26" fill="none" stroke="rgba(194,65,12,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>
                                    <div className="DH-empty-tt">No projects yet</div>
                                    <div className="DH-empty-sb">Add one from Accounts Receivable</div>
                                </div>
                            ) : (
                                <div>
                                    {displayProjects.map((a, i) => {
                                        const statusColor = a.status === 'active' ? '#C2410C' : a.status === 'pending' ? '#DB5B1F' : a.status === 'review' ? '#EA580C' : '#9A3412';
                                        const initials = (a.name || '?').trim().slice(0, 2).toUpperCase();
                                        return (
                                            <div className="DH-proj-row" key={a.id} style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate('client')}>
                                                <div className="DH-proj-avatar" style={{ background: `linear-gradient(135deg,${statusColor},${statusColor}bb)` }}>{initials}</div>
                                                <div className="DH-proj-body">
                                                    <div className="DH-proj-name">{a.name}</div>
                                                    <div className="DH-proj-sub">{a.sub}</div>
                                                </div>
                                                <span className={`pill ${a.status}`} style={{ flexShrink: 0 }}>
                                                    {a.status === 'active' ? '● Active' : a.status === 'pending' ? '○ Pending' : a.status === 'review' ? '◈ Review' : '⊘ Hold'}
                                                </span>
                                                <div className="DH-proj-track"><div className="DH-proj-fill" style={{ width: `${a.progress}%` }} /></div>
                                                <span className="DH-proj-val">{a.value}</span>
                                            </div>
                                        );
                                    })}
                                    {displayProjects.length > 0 && displayProjects.length < 4 && (
                                        <div className="PL-add" onClick={() => onNavigate('client')}>
                                            <div className="PL-add-ico">
                                                <svg width="15" height="15" fill="none" stroke="var(--d-or)" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                            </div>
                                            <div>
                                                <div className="PL-add-tt">Add another project</div>
                                                <div className="PL-add-sb">Create it in Accounts Receivable to track budget &amp; collections here</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Recent Projects End */}
                </div>
            }
            {/* Business Pulse + Recent Projects End */}

            {/* Dues & Alerts Start */}
            <div className="DH-dues-row">
                <div className="DH-panel">
                    <div className="DH-panel-hd">
                        <div className="DH-panel-tt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" fill="none" stroke={notifications.some(n => n.days_until_due <= 0) ? '#D93B55' : '#1E9C6A'} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
                            Client Payment Dues
                            {notifications.length > 0 && <span className="NP-count" style={{ background: notifications.some(n => n.days_until_due <= 0) ? 'var(--d-red)' : '#1E9C6A' }}>{notifications.length}</span>}
                        </div>
                        <button className="TB-btn" onClick={() => onNavigate('client')}>View Receivables →</button>
                    </div>
                    <div style={{ minHeight: 220, maxHeight: 280, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div className="DH-empty">
                                <svg width="26" height="26" fill="none" stroke="rgba(30,156,106,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                <div className="DH-empty-tt">All caught up</div>
                                <div className="DH-empty-sb">No client dues in the next 20 days</div>
                            </div>
                        ) : notifications.slice(0, 5).map((n, i) => {
                            const uc = n.days_until_due <= 0 ? 'urgent' : n.days_until_due <= 7 ? 'soon' : 'normal';
                            const col = n.days_until_due <= 0 ? 'var(--d-red)' : n.days_until_due <= 7 ? 'var(--d-or)' : 'var(--d-blue)';
                            const lbl = n.days_until_due < 0 ? `${Math.abs(n.days_until_due)}d overdue` : n.days_until_due === 0 ? 'Due today' : n.days_until_due === 1 ? 'Tomorrow' : `${n.days_until_due}d left`;
                            return (
                                <div key={n.payment_id} className="DH-due-row" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate('client')}>
                                    <div className={`DH-due-dot ${uc}`} style={{ background: `${col}18` }}>
                                        <svg width="15" height="15" fill="none" stroke={col} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{uc === 'urgent' ? <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></> : <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>}</svg>
                                    </div>
                                    <div className="DH-due-body">
                                        <div className="DH-due-name">{n.client_name}</div>
                                        <div className="DH-due-sub">{n.project_name}</div>
                                    </div>
                                    <div className="DH-due-meta">
                                        <span className="DH-due-amt" style={{ color: col }}>₹{n.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        <span className="DH-due-tag" style={{ color: col, background: `${col}14` }}>{lbl}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="DH-panel">
                    <div className="DH-panel-hd">
                        <div className="DH-panel-tt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" fill="none" stroke={creditNotifs.some(c => c.is_overdue) ? '#D93B55' : '#C2410C'} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
                            Bill Dues
                            {creditNotifs.length > 0 && <span className="NP-count" style={{ background: creditNotifs.some(c => c.is_overdue) ? 'var(--d-red)' : 'var(--d-or)' }}>{creditNotifs.length}</span>}
                        </div>
                        <button className="TB-btn" onClick={() => onNavigate('txn-credit')}>View Payables →</button>
                    </div>
                    <div style={{ minHeight: 220, maxHeight: 280, overflowY: 'auto' }}>
                        {creditNotifs.length === 0 ? (
                            <div className="DH-empty">
                                <svg width="26" height="26" fill="none" stroke="rgba(194,65,12,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                <div className="DH-empty-tt">No pending bills</div>
                                <div className="DH-empty-sb">Vendor credit ledger is clear</div>
                            </div>
                        ) : creditNotifs.slice(0, 5).map((c, i) => {
                            const days = c.is_overdue ? -c.days_overdue : c.days_until_due;
                            const col = days <= 0 ? 'var(--d-red)' : days <= 3 ? 'var(--d-or)' : 'var(--d-blue)';
                            const lbl = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Tomorrow' : `${days}d left`;
                            return (
                                <div key={c.credit_entry_id} className="DH-due-row" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate('txn-credit')}>
                                    <div className={`DH-due-dot ${days <= 0 ? 'urgent' : ''}`} style={{ background: `${col}18` }}>
                                        <svg width="15" height="15" fill="none" stroke={col} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">{days <= 0 ? <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></> : <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>}</svg>
                                    </div>
                                    <div className="DH-due-body">
                                        <div className="DH-due-name">{c.vendor_name}</div>
                                        <div className="DH-due-sub">Bill #{c.bill_number}</div>
                                    </div>
                                    <div className="DH-due-meta">
                                        <span className="DH-due-amt" style={{ color: col }}>₹{c.credit_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        <span className="DH-due-tag" style={{ color: col, background: `${col}14` }}>{lbl}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Dues & Alerts End */}

            {/* Module Command Grid Start */}
            <SectionHeader
                accent="#C2410C"
                icon={<svg width="20" height="20" fill="none" stroke="#C2410C" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7M17.5 14v7" /></svg>}
                eyebrow="Command Center"
                title="Studio Modules"
                subtitle="Everything in your studio, at a glance"
            />
            <div className="DH-module-grid">
                {MODULES.map((m, idx) => (
                    <div
                        className="DH-module-card" key={m.id}
                        style={{ '--tile-c': m.c, animationDelay: `${idx * 0.06}s` } as React.CSSProperties}
                        onClick={() => onNavigate(m.id)}
                        onMouseMove={tilt3D} onMouseLeave={resetTilt3D}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(m.id); }}
                    >
                        <span className="DH-module-tag" style={{ background: m.tagBg, color: m.c, border: `1px solid ${m.tagBorder}` }}>{m.tag}</span>
                        <div className="DH-module-ico" style={{ background: m.bg }}>
                            <svg width="19" height="19" fill="none" stroke={m.c} strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{m.iconPath}</svg>
                        </div>
                        <div className="DH-module-title">{m.title}</div>
                        <div className="DH-module-desc">{m.desc}</div>
                        {m.metrics && (
                            <div className="DH-module-mets">
                                {m.metrics.map(mt => (
                                    <div key={mt.l}>
                                        <span className="DH-module-met-v" style={{ color: m.c }}>{mt.v}</span>
                                        <span className="DH-module-met-l">{mt.l}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {m.tags && (
                            <div className="DH-module-tagrow">
                                {m.tags.map(t => (
                                    <span className="DH-module-minitag" key={t} style={{ background: m.bg, color: m.c }}>{t}</span>
                                ))}
                            </div>
                        )}
                        <svg className="DH-module-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
                    </div>
                ))}
            </div>
            {/* Module Command Grid End */}

            {/* Workflow Rail Start */}
            <div className="DH-panel DH-flow-panel">
                <div className="DH-panel-hd">
                    <div className="PC-hd-ico">
                        <svg width="19" height="19" fill="none" stroke="var(--d-or)" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
                    </div>
                    <div>
                        <div className="DH-panel-tt">How Your Studio Workflow Connects</div>
                        <div className="DH-panel-sb">One continuous flow, from data entry to reporting</div>
                    </div>
                </div>

                <div className="DH-flow-rail">
                    {[
                        { id: 'master', lbl: 'Core Records', sub: 'Set up once', c: '#C2410C', icon: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="7" rx="1.5" /><rect x="14" y="15" width="7" height="7" rx="1.5" /></> },
                        { id: 'txn-daybook', lbl: 'Cash Book', sub: 'Record entries', c: '#F0834D', icon: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></> },
                        { id: 'txn-credit', lbl: 'Payables', sub: 'Track vendor dues', c: '#D93B55', icon: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></> },
                        { id: 'client', lbl: 'Receivables', sub: 'Bill & collect', c: '#1E9C6A', icon: <><circle cx="9" cy="7" r="3.5" /><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" /></> },
                        { id: 'workforce', lbl: 'Workforce', sub: 'Attendance & pay', c: '#EA580C', icon: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></> },
                        { id: 'report-daybook', lbl: 'Insights', sub: 'See the results', c: '#524532', icon: <><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /></> },
                    ].map((s, i, arr) => (
                        <Fragment key={s.id}>
                            <div className="DH-flow-node" onClick={() => onNavigate(s.id)} style={{ animationDelay: `${i * 0.09}s` }}>
                                <div className="DH-flow-orb" style={{ color: s.c }}>
                                    <svg width="21" height="21" fill="none" stroke={s.c} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                                    <span className="DH-flow-step" style={{ background: s.c }}>{i + 1}</span>
                                </div>
                                <span className="DH-flow-lbl">{s.lbl}</span>
                                <span className="DH-flow-sub">{s.sub}</span>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="DH-flow-connector"><div className="DH-flow-dot" style={{ animationDelay: `${i * 0.4}s` }} /></div>
                            )}
                        </Fragment>
                    ))}
                </div>

                <div className="DH-flow-chips">
                    {[
                        { t: '6 connected modules, 1 studio', d: 0 },
                        { t: 'Master Data as single source of truth', d: 0.06 },
                        { t: 'Chained multi-select filters everywhere', d: 0.12 },
                        { t: 'Live client & credit due tracking', d: 0.18 },
                        { t: 'Client-side instant report filtering', d: 0.24 },
                        { t: '5 dedicated report centers', d: 0.30 },
                        { t: 'Role-based access control', d: 0.36 },
                        { t: 'Fully responsive on mobile', d: 0.42 },
                    ].map(hl => (
                        <span className="DH-flow-chip" key={hl.t} style={{ animationDelay: `${hl.d}s` }}>
                            {/* Text before the check icon (was icon-then-text) — text
                                on the left, icon on the right, per request. */}
                            <span className="DH-flow-chip-txt">{hl.t}</span>
                            <svg className="DH-flow-chip-ico" width="11" height="11" fill="none" stroke="var(--d-or)" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        </span>
                    ))}
                </div>
            </div>
            {/* Workflow Rail End */}

            <div style={{ height: 20 }} />
        </div>
    );
}

/* ──────────────────────────────────────
   LABOUR-ONLY DASHBOARD — shown to the 'user' role instead of DashContent.
   That role's nav/API access is scoped to Manpower Register + Attendance
   only (see USER_ALLOWED / CheckRole middleware), so this deliberately
   drops every Accounts Receivable / Cash Book / Credit / Business Insights widget and shows
   just what's relevant: today's attendance pulse, worker headcount, this
   month's manpower cost, recent activity, and the two pages they can open.
───────────────────────────────────────── */
interface LabourStats { total_workers: number; marked_today: number; present_today: number; month_cost: number; }
interface LabourActivity {
    id: number; worker_name: string; sub_worker_name: string | null; is_sub_entry: boolean;
    site: string; date: string; shifts_worked: number; status: string; amount: number; created_at: string;
}

function LabourDashContent({ userName, onNavigate }: { userName: string; onNavigate: (id: string) => void }) {
    const [stats, setStats] = useState<LabourStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<LabourActivity[]>([]);
    const [activityLoading, setActivityLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

    useEffect(() => {
        const tk = sessionStorage.getItem('token');
        if (!tk) return;
        const H = { Authorization: `Bearer ${tk}` };
        setLoading(true);
        axiosInstance.get('workforce/dashboard-stats', { headers: H })
            .then(r => setStats(r.data?.data ?? null))
            .catch(() => setStats(null))
            .finally(() => setLoading(false));

        setActivityLoading(true);
        axiosInstance.get('workforce/recent-activity', { headers: H, params: { limit: 6 } })
            .then(r => setActivity(r.data?.data ?? []))
            .catch(() => setActivity([]))
            .finally(() => setActivityLoading(false));
    }, []);

    const markedPct = stats && stats.total_workers > 0 ? Math.round((stats.marked_today / stats.total_workers) * 100) : 0;
    const presentRate = stats && stats.marked_today > 0 ? Math.round((stats.present_today / stats.marked_today) * 100) : 0;
    const allMarked = !!stats && stats.total_workers > 0 && stats.marked_today >= stats.total_workers;

    const PROGRESS_GAUGES = [
        { label: 'Marked Today', val: markedPct, color: '#C2410C', warn: false },
        { label: 'Present Rate', val: presentRate, color: '#1E9C6A', warn: false },
    ];

    const KPI_CARDS = [
        {
            lbl: 'Active Workers', val: String(stats?.total_workers ?? 0), dt: 'on the register', dir: 'up' as const, pre: '',
            c: '#EA580C', bg: 'rgba(234,88,12,.09)', d: 0,
            iconPath: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></>,
        },
        {
            lbl: 'Marked Today', val: String(stats?.marked_today ?? 0), dt: `${markedPct}% of workers`, dir: 'up' as const, pre: '',
            c: '#C2410C', bg: 'rgba(194,65,12,.09)', d: 0.08,
            iconPath: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
        },
        {
            lbl: 'Present Today', val: String(stats?.present_today ?? 0), dt: 'marked as present', dir: 'up' as const, pre: '',
            c: '#1E9C6A', bg: 'rgba(30,156,106,.09)', d: 0.16,
            iconPath: <path d="M5 13l4 4L19 7" />,
        },
        {
            lbl: 'This Month', val: stats ? (stats.month_cost / 1000).toFixed(1) : '0', dt: 'manpower cost so far', dir: 'up' as const, pre: '₹', suf: 'K',
            c: '#524532', bg: 'rgba(82,69,50,.07)', d: 0.24,
            iconPath: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></>,
        },
    ];

    const MODULES = [
        {
            id: 'workforce', title: 'Manpower Register', tag: 'Open', desc: 'View, add and manage every worker on the register.',
            c: '#EA580C', bg: 'rgba(234,88,12,.09)', tagBg: 'rgba(234,88,12,.08)', tagBorder: 'rgba(234,88,12,.22)',
            iconPath: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></>,
            metrics: [{ v: stats?.total_workers ?? 0, l: 'Workers' }],
        },
        {
            id: 'attendance', title: 'Attendance', tag: 'Open', desc: 'Mark today\'s attendance and review past entries.',
            c: '#C2410C', bg: 'rgba(194,65,12,.09)', tagBg: 'rgba(194,65,12,.08)', tagBorder: 'rgba(194,65,12,.22)',
            iconPath: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
            metrics: [{ v: stats?.present_today ?? 0, l: 'Present Today' }],
        },
    ];

    return (
        <div className="PAGE-WRAP DH-page">
            <PageHeader eyebrow="Manpower Overview" title="Control Panel" titleClassName="MD-page-title" />
            <div className="ERP-divider" />

            {/* Hero Start */}
            <div className="DH-hero">
                <div className="DH-hero-glow g1" /><div className="DH-hero-glow g2" />
                <div className="DH-hero-main">
                    <div>
                        <span className="DH-hero-eyebrow">{today}</span>
                        <h2 className="DH-hero-title">{greet}{userName ? <>, <em>{userName}</em></> : null}</h2>
                        <p className="DH-hero-sub">Here's today's manpower pulse — worker attendance and headcount, at a glance.</p>
                    </div>
                    <div
                        className={`DH-hero-status ${allMarked ? 'clear' : 'urgent'}`}
                        onClick={() => onNavigate('attendance')}
                        role="button" tabIndex={0}
                    >
                        <span className="DH-hero-status-lbl">{allMarked ? 'All Marked' : 'Attendance Pending'}</span>
                        <div className="DH-hero-status-body">
                            {allMarked ? (
                                <>
                                    <svg className="DH-hero-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E9C6A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                                    <span className="DH-hero-status-sub">Every worker marked today</span>
                                </>
                            ) : (
                                <>
                                    <span className="DH-hero-status-dot" />
                                    <span className="DH-hero-status-val">{(stats?.total_workers ?? 0) - (stats?.marked_today ?? 0)}</span>
                                    <span className="DH-hero-status-sub">not marked yet</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="DH-quick-row">
                    <div className="DH-quick-pill" onClick={() => onNavigate('attendance')}>
                        <div className="DH-quick-ico" style={{ background: 'rgba(194,65,12,.12)' }}>
                            <svg width="13" height="13" fill="none" stroke="#C2410C" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
                        </div>
                        <span className="DH-quick-lbl">Mark Attendance</span>
                    </div>
                    <div className="DH-quick-pill" style={{ animationDelay: '0.05s' }} onClick={() => onNavigate('workforce')}>
                        <div className="DH-quick-ico" style={{ background: 'rgba(234,88,12,.12)' }}>
                            <svg width="13" height="13" fill="none" stroke="#EA580C" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
                        </div>
                        <span className="DH-quick-lbl">Manpower Register</span>
                    </div>
                </div>
            </div>
            {/* Hero End */}

            {/* KPI Tiles Start */}
            {loading
                ? <div className="DH-kpi-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="SK" style={{ height: 132, borderRadius: 18 }} />)}</div>
                : <div className="DH-kpi-grid">
                    {KPI_CARDS.map((s, idx) => (
                        <div className="DH-kpi-tile" key={s.lbl} style={{ '--tile-c': s.c, animationDelay: `${s.d}s` } as React.CSSProperties} onMouseMove={tilt3D} onMouseLeave={resetTilt3D}>
                            <div className="DH-kpi-badge" style={{ background: s.bg }}>
                                <svg width="18" height="18" fill="none" stroke={s.c} strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{s.iconPath}</svg>
                            </div>
                            <div className="DH-kpi-val" style={{ color: s.c }}>
                                {s.pre}<AnimCounter target={s.val} duration={900 + idx * 100} />{s.suf ?? ''}
                            </div>
                            <div className="DH-kpi-lbl">{s.lbl}</div>
                            <span className={`DH-kpi-delta ${s.dir}`}>
                                <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ transform: s.dir === 'up' ? 'none' : 'rotate(180deg)' }}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {s.dt}
                            </span>
                        </div>
                    ))}
                </div>
            }
            {/* KPI Tiles End */}

            {/* Progress + Recent Activity Start */}
            <div className="DH-pulse-row">

                {/* Today's Progress Start */}
                <div className="DH-panel">
                    <div className="DH-panel-hd">
                        <div>
                            <div className="DH-panel-tt">Today's Progress</div>
                            <div className="DH-panel-sb">Live attendance completion</div>
                        </div>
                        <span className="DH-kpi-delta" style={{ color: allMarked ? 'var(--d-green)' : 'var(--d-or)', background: allMarked ? 'rgba(30,156,106,.08)' : 'rgba(194,65,12,.08)' }}>
                            {allMarked ? 'All marked' : `${markedPct}% marked`}
                        </span>
                    </div>

                    <div className="DH-gauge-row">
                        {PROGRESS_GAUGES.map((k, i) => {
                            const r = 27, circ = 2 * Math.PI * r, pct = Math.min(Math.max(k.val, 0), 100);
                            const dash = circ * (pct / 100);
                            return (
                                <div className="DH-gauge" key={k.label} style={{ animation: `dhRise 0.4s ${0.15 + i * 0.08}s ease both` }}>
                                    <div className="DH-gauge-ring">
                                        <svg width="100%" height="100%" viewBox="0 0 66 66" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
                                            <circle cx="33" cy="33" r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth="6" />
                                            <circle
                                                cx="33" cy="33" r={r} fill="none" stroke={k.color} strokeWidth="6"
                                                strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
                                                style={{ transition: 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)' }}
                                            />
                                        </svg>
                                        <div className="DH-gauge-val" style={{ color: k.color }}>{k.val}%</div>
                                    </div>
                                    <div className="DH-gauge-lbl">{k.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, color: 'var(--d-ice)' }}>Headcount</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--d-ice4)' }}>{stats?.total_workers ?? 0} workers</span>
                    </div>
                    <div className="DH-fin-bar">
                        <div className="DH-fin-seg" style={{ width: `${markedPct}%`, background: 'linear-gradient(to right,#C2410C,#F0834D)' }} />
                        <div className="DH-fin-seg" style={{ width: `${Math.max(100 - markedPct, 0)}%`, background: 'linear-gradient(to right,rgba(0,0,0,.08),rgba(0,0,0,.04))', animationDelay: '0.1s' } as React.CSSProperties} />
                    </div>
                    <div className="DH-fin-legend">
                        <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#1E9C6A' }} />Present <b style={{ color: '#1E9C6A' }}>&nbsp;{stats?.present_today ?? 0}</b></div>
                        <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#C2410C' }} />Marked <b style={{ color: '#C2410C' }}>&nbsp;{stats?.marked_today ?? 0}</b></div>
                        <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: 'var(--d-ice4)' }} />Not Marked <b>&nbsp;{Math.max((stats?.total_workers ?? 0) - (stats?.marked_today ?? 0), 0)}</b></div>
                    </div>
                </div>
                {/* Today's Progress End */}

                {/* Recent Activity Start */}
                <div className="DH-panel">
                    <div className="DH-panel-hd">
                        <div>
                            <div className="DH-panel-tt">Recent Attendance Activity</div>
                            <div className="DH-panel-sb">Latest marked entries · {activity.length} shown</div>
                        </div>
                        <button className="TB-btn" onClick={() => onNavigate('attendance')}>View All →</button>
                    </div>
                    <div>
                        {activityLoading ? (
                            <div className="SK" style={{ height: 240, borderRadius: 14 }} />
                        ) : activity.length === 0 ? (
                            <div className="DH-empty">
                                <svg width="26" height="26" fill="none" stroke="rgba(194,65,12,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18" /></svg>
                                <div className="DH-empty-tt">No attendance marked yet</div>
                                <div className="DH-empty-sb">Entries you record will show up here</div>
                            </div>
                        ) : activity.map((a, i) => {
                            const col = a.status === 'present' ? '#1E9C6A' : a.status === 'absent' ? '#D93B55' : '#C2410C';
                            const name = a.is_sub_entry && a.sub_worker_name ? a.sub_worker_name : a.worker_name;
                            const sub = a.is_sub_entry && a.sub_worker_name ? `under ${a.worker_name}` : (a.site || '—');
                            const initials = (name || '?').trim().slice(0, 2).toUpperCase();
                            const dateLbl = new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                            return (
                                <div className="DH-proj-row" key={a.id} style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate('attendance')}>
                                    <div className="DH-proj-avatar" style={{ background: `linear-gradient(135deg,${col},${col}bb)` }}>{initials}</div>
                                    <div className="DH-proj-body">
                                        <div className="DH-proj-name">{name}</div>
                                        <div className="DH-proj-sub">{sub} · {dateLbl} · {a.shifts_worked} shift{a.shifts_worked !== 1 ? 's' : ''}</div>
                                    </div>
                                    <span className="pill" style={{ flexShrink: 0, color: col, background: `${col}14`, borderColor: `${col}33` }}>{a.status.charAt(0).toUpperCase() + a.status.slice(1).replace('_', ' ')}</span>
                                    <span className="DH-proj-val">{fmt(a.amount)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Recent Activity End */}

            </div>
            {/* Progress + Recent Activity End */}

            {/* Module Cards Start */}
            <SectionHeader
                accent="#C2410C"
                icon={<svg width="20" height="20" fill="none" stroke="#C2410C" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>}
                eyebrow="Your Access"
                title="Manpower Modules"
                subtitle="Everything available to your account"
            />
            <div className="DH-module-grid">
                {MODULES.map((m, idx) => (
                    <div
                        className="DH-module-card" key={m.id}
                        style={{ '--tile-c': m.c, animationDelay: `${idx * 0.06}s` } as React.CSSProperties}
                        onClick={() => onNavigate(m.id)}
                        onMouseMove={tilt3D} onMouseLeave={resetTilt3D}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(m.id); }}
                    >
                        <span className="DH-module-tag" style={{ background: m.tagBg, color: m.c, border: `1px solid ${m.tagBorder}` }}>{m.tag}</span>
                        <div className="DH-module-ico" style={{ background: m.bg }}>
                            <svg width="19" height="19" fill="none" stroke={m.c} strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{m.iconPath}</svg>
                        </div>
                        <div className="DH-module-title">{m.title}</div>
                        <div className="DH-module-desc">{m.desc}</div>
                        <div className="DH-module-mets">
                            {m.metrics.map(mt => (
                                <div key={mt.l}>
                                    <span className="DH-module-met-v" style={{ color: m.c }}>{mt.v}</span>
                                    <span className="DH-module-met-l">{mt.l}</span>
                                </div>
                            ))}
                        </div>
                        <svg className="DH-module-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
                    </div>
                ))}
            </div>
            {/* Module Cards End */}

            <div style={{ height: 20 }} />
        </div>
    );
}

/* ──────────────────────────────────────
   ADMIN DASHBOARD — shown to the 'admin' role instead of DashContent.
   Admin's nav/API access covers everything except Accounts Receivable (and its
   report), so this deliberately drops every Accounts Receivable widget — total
   projects/budget/collected/balance, client KPIs, the collection trend
   chart, project-type distribution, recent projects and client dues — and
   replaces them with Cash Book/Credit/Manpower numbers admin actually owns.
───────────────────────────────────────── */
interface DaybookTodayStats { income: number; expense: number; balance: number; }

function AdminDashContent({ userName, onNavigate }: { userName: string; onNavigate: (id: string) => void }) {
    const [labour, setLabour] = useState<LabourStats | null>(null);
    const [labourLoading, setLabourLoading] = useState(true);
    const [daybook, setDaybook] = useState<DaybookTodayStats | null>(null);
    const [daybookLoading, setDaybookLoading] = useState(true);
    const [creditNotifs, setCreditNotifs] = useState<CreditDue[]>([]);
    const [creditLoading, setCreditLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

    useEffect(() => {
        const tk = sessionStorage.getItem('token');
        if (!tk) return;
        const H = { Authorization: `Bearer ${tk}` };

        setLabourLoading(true);
        axiosInstance.get('workforce/dashboard-stats', { headers: H })
            .then(r => setLabour(r.data?.data ?? null))
            .catch(() => setLabour(null))
            .finally(() => setLabourLoading(false));

        setDaybookLoading(true);
        axiosInstance.get('daybook', { headers: H, params: { date: new Date().toISOString().slice(0, 10) } })
            .then(r => setDaybook(r.data?.stats ?? null))
            .catch(() => setDaybook(null))
            .finally(() => setDaybookLoading(false));

        setCreditLoading(true);
        axiosInstance.get('credit-management/notifications', { headers: H })
            .then(r => setCreditNotifs(r.data?.data ?? []))
            .catch(() => setCreditNotifs([]))
            .finally(() => setCreditLoading(false));
    }, []);

    const markedPct = labour && labour.total_workers > 0 ? Math.round((labour.marked_today / labour.total_workers) * 100) : 0;
    const presentRate = labour && labour.marked_today > 0 ? Math.round((labour.present_today / labour.marked_today) * 100) : 0;
    const overdueCredit = creditNotifs.filter(c => c.is_overdue).length;
    const anyLoading = labourLoading || daybookLoading;

    const PROGRESS_GAUGES = [
        { label: 'Marked Today', val: markedPct, color: '#C2410C', warn: false },
        { label: 'Present Rate', val: presentRate, color: '#1E9C6A', warn: false },
    ];

    const KPI_CARDS = [
        {
            lbl: 'Team Members', val: String(labour?.total_workers ?? 0), dt: 'active workers', dir: 'up' as const, pre: '',
            c: '#EA580C', bg: 'rgba(234,88,12,.09)', d: 0,
            iconPath: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></>,
        },
        {
            lbl: 'Present Today', val: String(labour?.present_today ?? 0), dt: `${markedPct}% marked`, dir: 'up' as const, pre: '',
            c: '#1E9C6A', bg: 'rgba(30,156,106,.09)', d: 0.08,
            iconPath: <path d="M5 13l4 4L19 7" />,
        },
        {
            lbl: "Today's Income", val: daybook ? (daybook.income / 1000).toFixed(1) : '0', dt: 'from Cash Book', dir: 'up' as const, pre: '₹', suf: 'K',
            c: '#C2410C', bg: 'rgba(194,65,12,.09)', d: 0.16,
            iconPath: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></>,
        },
        {
            lbl: 'Credit Overdue', val: String(overdueCredit), dt: `${creditNotifs.length} total dues`, dir: overdueCredit > 0 ? 'down' as const : 'up' as const, pre: '',
            c: '#D93B55', bg: 'rgba(217,59,85,.09)', d: 0.24,
            iconPath: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></>,
        },
    ];

    const MODULES = [
        {
            id: 'master', title: 'Core Records', tag: 'Setup', desc: 'Account Heads, account sub-heads, party master & Identification types.',
            c: '#C2410C', bg: 'rgba(194,65,12,.09)', tagBg: 'rgba(194,65,12,.08)', tagBorder: 'rgba(194,65,12,.22)',
            iconPath: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="7" rx="1.5" /><rect x="14" y="15" width="7" height="7" rx="1.5" /></>,
        },
        {
            id: 'txn-daybook', title: 'Cash Book', tag: 'Explore', desc: 'Log day-to-day income & expense transactions.',
            c: '#F0834D', bg: 'rgba(194,65,12,.09)', tagBg: 'rgba(194,65,12,.08)', tagBorder: 'rgba(194,65,12,.22)',
            iconPath: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></>,
            metrics: daybook ? [{ v: fmt(daybook.balance), l: "Today's Balance" }] : undefined,
        },
        {
            id: 'txn-credit', title: 'Accounts Payable', tag: 'Explore', desc: 'Track vendor credit, dues & payment history.',
            c: '#D93B55', bg: 'rgba(217,59,85,.09)', tagBg: 'rgba(217,59,85,.08)', tagBorder: 'rgba(217,59,85,.22)',
            iconPath: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></>,
            metrics: [{ v: creditNotifs.length, l: 'Dues' }],
        },
        {
            id: 'workforce', title: 'Manpower & Attendance', tag: 'Live', desc: 'Attendance, worker registry & wage disbursement.',
            c: '#EA580C', bg: 'rgba(234,88,12,.09)', tagBg: 'rgba(234,88,12,.08)', tagBorder: 'rgba(234,88,12,.22)',
            iconPath: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></>,
            metrics: [{ v: labour?.total_workers ?? 0, l: 'Team' }],
        },
        {
            id: 'report-daybook', title: 'Business Insights', tag: 'Explore', desc: 'Cash Book, Credit & Manpower reports.',
            c: '#524532', bg: 'rgba(82,69,50,.07)', tagBg: 'rgba(82,69,50,.06)', tagBorder: 'rgba(82,69,50,.16)',
            iconPath: <><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /></>,
            metrics: [{ v: 3, l: 'Insights' }],
        },
    ];

    return (
        <div className="PAGE-WRAP DH-page">
            <PageHeader eyebrow="Studio Overview" title="Control Panel" titleClassName="MD-page-title" />
            <div className="ERP-divider" />

            {/* Hero Start */}
            <div className="DH-hero">
                <div className="DH-hero-glow g1" /><div className="DH-hero-glow g2" />
                <div className="DH-hero-main">
                    <div>
                        <span className="DH-hero-eyebrow">{today}</span>
                        <h2 className="DH-hero-title">{greet}{userName ? <>, <em>{userName}</em></> : null}</h2>
                        <p className="DH-hero-sub">Here's today's studio pulse — daybook, credit and workforce, all in one view.</p>
                    </div>
                    <div
                        className={`DH-hero-status ${overdueCredit > 0 ? 'urgent' : 'clear'}`}
                        onClick={() => onNavigate('txn-credit')}
                        role="button" tabIndex={0}
                    >
                        <span className="DH-hero-status-lbl">{overdueCredit > 0 ? 'Action Needed' : 'All Clear'}</span>
                        <div className="DH-hero-status-body">
                            {overdueCredit > 0 ? (
                                <>
                                    <span className="DH-hero-status-dot" />
                                    <span className="DH-hero-status-val">{overdueCredit}</span>
                                    <span className="DH-hero-status-sub">Overdue bills</span>
                                </>
                            ) : (
                                <>
                                    <svg className="DH-hero-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E9C6A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                                    <span className="DH-hero-status-sub">No dues overdue</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="DH-quick-row">
                    {[
                        { id: 'txn-daybook', lbl: 'New Cash Book Entry', c: '#F0834D', bg: 'rgba(194,65,12,.12)', icon: <><path d="M12 5v14M5 12h14" /></> },
                        { id: 'txn-credit', lbl: 'Add Bill', c: '#D93B55', bg: 'rgba(217,59,85,.12)', icon: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></> },
                        { id: 'attendance', lbl: 'Mark Attendance', c: '#EA580C', bg: 'rgba(234,88,12,.12)', icon: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></> },
                        { id: 'report-daybook', lbl: 'View Insights', c: '#524532', bg: 'rgba(82,69,50,.1)', icon: <><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /></> },
                    ].map((a, i) => (
                        <div key={a.id} className="DH-quick-pill" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate(a.id)}>
                            <div className="DH-quick-ico" style={{ background: a.bg }}>
                                <svg width="13" height="13" fill="none" stroke={a.c} strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
                            </div>
                            <span className="DH-quick-lbl">{a.lbl}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* Hero End */}

            {/* KPI Tiles Start */}
            {anyLoading
                ? <div className="DH-kpi-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="SK" style={{ height: 132, borderRadius: 18 }} />)}</div>
                : <div className="DH-kpi-grid">
                    {KPI_CARDS.map((s, idx) => (
                        <div className="DH-kpi-tile" key={s.lbl} style={{ '--tile-c': s.c, animationDelay: `${s.d}s` } as React.CSSProperties} onMouseMove={tilt3D} onMouseLeave={resetTilt3D}>
                            <div className="DH-kpi-badge" style={{ background: s.bg }}>
                                <svg width="18" height="18" fill="none" stroke={s.c} strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{s.iconPath}</svg>
                            </div>
                            <div className="DH-kpi-val" style={{ color: s.c }}>
                                {s.pre}<AnimCounter target={s.val} duration={900 + idx * 100} />{s.suf ?? ''}
                            </div>
                            <div className="DH-kpi-lbl">{s.lbl}</div>
                            <span className={`DH-kpi-delta ${s.dir}`}>
                                <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ transform: s.dir === 'up' ? 'none' : 'rotate(180deg)' }}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {s.dt}
                            </span>
                        </div>
                    ))}
                </div>
            }
            {/* KPI Tiles End */}

            {/* Progress + Credit Dues Start */}
            <div className="DH-pulse-row">

                <div className="DH-panel">
                    <div className="DH-panel-hd">
                        <div>
                            <div className="DH-panel-tt">Today's Progress</div>
                            <div className="DH-panel-sb">Live attendance completion</div>
                        </div>
                        <span className="DH-kpi-delta" style={{ color: markedPct >= 100 ? 'var(--d-green)' : 'var(--d-or)', background: markedPct >= 100 ? 'rgba(30,156,106,.08)' : 'rgba(194,65,12,.08)' }}>
                            {markedPct}% marked
                        </span>
                    </div>
                    <div className="DH-gauge-row">
                        {PROGRESS_GAUGES.map((k, i) => {
                            const r = 27, circ = 2 * Math.PI * r, pct = Math.min(Math.max(k.val, 0), 100);
                            const dash = circ * (pct / 100);
                            return (
                                <div className="DH-gauge" key={k.label} style={{ animation: `dhRise 0.4s ${0.15 + i * 0.08}s ease both` }}>
                                    <div className="DH-gauge-ring">
                                        <svg width="100%" height="100%" viewBox="0 0 66 66" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
                                            <circle cx="33" cy="33" r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth="6" />
                                            <circle cx="33" cy="33" r={r} fill="none" stroke={k.color} strokeWidth="6"
                                                strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
                                                style={{ transition: 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)' }} />
                                        </svg>
                                        <div className="DH-gauge-val" style={{ color: k.color }}>{k.val}%</div>
                                    </div>
                                    <div className="DH-gauge-lbl">{k.label}</div>
                                </div>
                            );
                        })}
                    </div>
                    {daybook && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, color: 'var(--d-ice)' }}>Today's Cash Book</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--d-ice4)' }}>Balance {fmt(daybook.balance)}</span>
                            </div>
                            <div className="DH-fin-legend">
                                <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#1E9C6A' }} />Income <b style={{ color: '#1E9C6A' }}>&nbsp;{fmt(daybook.income)}</b></div>
                                <div className="DH-fin-item"><div className="DH-fin-dot" style={{ background: '#D93B55' }} />Expense <b style={{ color: '#D93B55' }}>&nbsp;{fmt(daybook.expense)}</b></div>
                            </div>
                        </>
                    )}
                </div>

                <div className="DH-panel">
                    <div className="DH-panel-hd">
                        <div className="DH-panel-tt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" fill="none" stroke={overdueCredit > 0 ? '#D93B55' : '#C2410C'} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
                            Bill Dues
                            {creditNotifs.length > 0 && <span className="NP-count" style={{ background: overdueCredit > 0 ? 'var(--d-red)' : 'var(--d-or)' }}>{creditNotifs.length}</span>}
                        </div>
                        <button className="TB-btn" onClick={() => onNavigate('txn-credit')}>View Payables →</button>
                    </div>
                    <div style={{ minHeight: 220, maxHeight: 280, overflowY: 'auto' }}>
                        {creditLoading ? (
                            <div className="SK" style={{ height: 200, borderRadius: 14 }} />
                        ) : creditNotifs.length === 0 ? (
                            <div className="DH-empty">
                                <svg width="26" height="26" fill="none" stroke="rgba(194,65,12,0.3)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                <div className="DH-empty-tt">No pending bills</div>
                                <div className="DH-empty-sb">Vendor credit ledger is clear</div>
                            </div>
                        ) : creditNotifs.slice(0, 6).map((c, i) => {
                            const days = c.is_overdue ? -c.days_overdue : c.days_until_due;
                            const col = days <= 0 ? 'var(--d-red)' : days <= 3 ? 'var(--d-or)' : 'var(--d-blue)';
                            const lbl = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Tomorrow' : `${days}d left`;
                            return (
                                <div key={c.credit_entry_id} className="DH-due-row" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onNavigate('txn-credit')}>
                                    <div className={`DH-due-dot ${days <= 0 ? 'urgent' : ''}`} style={{ background: `${col}18` }}>
                                        <svg width="15" height="15" fill="none" stroke={col} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">{days <= 0 ? <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></> : <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>}</svg>
                                    </div>
                                    <div className="DH-due-body">
                                        <div className="DH-due-name">{c.vendor_name}</div>
                                        <div className="DH-due-sub">Bill #{c.bill_number}</div>
                                    </div>
                                    <div className="DH-due-meta">
                                        <span className="DH-due-amt" style={{ color: col }}>₹{c.credit_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        <span className="DH-due-tag" style={{ color: col, background: `${col}14` }}>{lbl}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Progress + Credit Dues End */}

            {/* Module Command Grid Start */}
            <SectionHeader
                accent="#C2410C"
                icon={<svg width="20" height="20" fill="none" stroke="#C2410C" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7M17.5 14v7" /></svg>}
                eyebrow="Command Center"
                title="Studio Modules"
                subtitle="Everything available to your account"
            />
            <div className="DH-module-grid">
                {MODULES.map((m, idx) => (
                    <div
                        className="DH-module-card" key={m.id}
                        style={{ '--tile-c': m.c, animationDelay: `${idx * 0.06}s` } as React.CSSProperties}
                        onClick={() => onNavigate(m.id)}
                        onMouseMove={tilt3D} onMouseLeave={resetTilt3D}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(m.id); }}
                    >
                        <span className="DH-module-tag" style={{ background: m.tagBg, color: m.c, border: `1px solid ${m.tagBorder}` }}>{m.tag}</span>
                        <div className="DH-module-ico" style={{ background: m.bg }}>
                            <svg width="19" height="19" fill="none" stroke={m.c} strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{m.iconPath}</svg>
                        </div>
                        <div className="DH-module-title">{m.title}</div>
                        <div className="DH-module-desc">{m.desc}</div>
                        {m.metrics && (
                            <div className="DH-module-mets">
                                {m.metrics.map(mt => (
                                    <div key={mt.l}>
                                        <span className="DH-module-met-v" style={{ color: m.c }}>{mt.v}</span>
                                        <span className="DH-module-met-l">{mt.l}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <svg className="DH-module-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
                    </div>
                ))}
            </div>
            {/* Module Command Grid End */}

            {/* Workflow Rail Start */}
            <div className="DH-panel DH-flow-panel">
                <div className="DH-panel-hd">
                    <div className="PC-hd-ico">
                        <svg width="19" height="19" fill="none" stroke="var(--d-or)" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
                    </div>
                    <div>
                        <div className="DH-panel-tt">How Your Studio Workflow Connects</div>
                        <div className="DH-panel-sb">One continuous flow, from data entry to reporting</div>
                    </div>
                </div>

                <div className="DH-flow-rail">
                    {[
                        { id: 'master', lbl: 'Core Records', sub: 'Set up once', c: '#C2410C', icon: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="7" rx="1.5" /><rect x="14" y="15" width="7" height="7" rx="1.5" /></> },
                        { id: 'txn-daybook', lbl: 'Cash Book', sub: 'Record entries', c: '#F0834D', icon: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></> },
                        { id: 'txn-credit', lbl: 'Payables', sub: 'Track vendor dues', c: '#D93B55', icon: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></> },
                        { id: 'workforce', lbl: 'Workforce', sub: 'Attendance & pay', c: '#EA580C', icon: <><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></> },
                        { id: 'report-daybook', lbl: 'Insights', sub: 'See the results', c: '#524532', icon: <><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /></> },
                    ].map((s, i, arr) => (
                        <Fragment key={s.id}>
                            <div className="DH-flow-node" onClick={() => onNavigate(s.id)} style={{ animationDelay: `${i * 0.09}s` }}>
                                <div className="DH-flow-orb" style={{ color: s.c }}>
                                    <svg width="21" height="21" fill="none" stroke={s.c} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                                    <span className="DH-flow-step" style={{ background: s.c }}>{i + 1}</span>
                                </div>
                                <span className="DH-flow-lbl">{s.lbl}</span>
                                <span className="DH-flow-sub">{s.sub}</span>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="DH-flow-connector"><div className="DH-flow-dot" style={{ animationDelay: `${i * 0.4}s` }} /></div>
                            )}
                        </Fragment>
                    ))}
                </div>

                <div className="DH-flow-chips">
                    {[
                        { t: '5 connected modules, 1 studio', d: 0 },
                        { t: 'Master Data as single source of truth', d: 0.06 },
                        { t: 'Chained multi-select filters everywhere', d: 0.12 },
                        { t: 'Live credit due tracking', d: 0.18 },
                        { t: 'Client-side instant report filtering', d: 0.24 },
                        { t: '3 dedicated report centers', d: 0.30 },
                        { t: 'Role-based access control', d: 0.36 },
                        { t: 'Fully responsive on mobile', d: 0.42 },
                    ].map(hl => (
                        <span className="DH-flow-chip" key={hl.t} style={{ animationDelay: `${hl.d}s` }}>
                            <span className="DH-flow-chip-txt">{hl.t}</span>
                            <svg className="DH-flow-chip-ico" width="11" height="11" fill="none" stroke="var(--d-or)" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        </span>
                    ))}
                </div>
            </div>
            {/* Workflow Rail End */}

            <div style={{ height: 20 }} />
        </div>
    );
}

/* ──────────────────────────────────────
   BELL SHAKE HOOK — Triggers
───────────────────────────────────────── */
function useBellShake(notificationCount: number) {
    const [shaking, setShaking] = useState(false);
    const seenKey = 'erp_bell_seen_at';
    useEffect(() => {
        if (notificationCount <= 0) { setShaking(false); return; }
        const seen = localStorage.getItem(seenKey);
        const today = new Date().toDateString();
        if (seen !== today) setShaking(true);
        else setShaking(false);
    }, [notificationCount]);
    const clearShake = () => {
        setShaking(false);
        localStorage.setItem(seenKey, new Date().toDateString());
    };
    return { shaking, clearShake };
}

const TK_ITEMS = ['Control Panel', 'Core Records', 'Cash Book', 'Accounts Payable', 'Accounts Receivable', 'Business Insights'];
const PAGE_LABELS: Record<string, string> = {
    dashboard: 'Control Panel',
    'master': 'Core Records', 'master-category': 'Account Head', 'master-subcategory': 'Account Sub-Head',
    'master-idtype': 'Identification Type', 'master-biodata': 'Party Master', 'master-subname': 'Associate Name',
    'txn-daybook': 'Log Entry', 'txn-history': 'View All Entries',
    'txn-credit': 'Payable Ledger', 'txn-credit-history': 'All Bills',
    client: 'Accounts Receivable',
    workforce: 'Manpower Register',
    attendance: 'Attendance',
    'labour-payment': 'Wage Disbursement',
    'report-daybook': 'Cash Book Report', 'report-credit': 'Accounts Payable Report',
    'report-labour': 'Manpower Report', 'report-client': 'Accounts Receivable Report', 'report-pl': 'Income Statement',
    'recycle-bin': 'Deletion Log',
    'account-settings': 'Account Settings',
    'create-account': 'Create Account',
    'pending-approvals': 'Pending Approvals',
    'all-accounts': 'All Accounts',
    'roles-permissions': 'Roles & Permissions',
};

const TYPE_LABEL: Record<string, string> = {
    construction: 'Construction',
    interior: 'Interior',
    architecture: 'Architecture',
    drawing: 'Drawing',
    pmc: 'PMC',
};

const NAV_ORDER = [
    'dashboard',
    'master', 'master-category', 'master-subcategory', 'master-idtype', 'master-biodata', 'master-subname',
    'txn-daybook', 'txn-history',
    'txn-credit', 'txn-credit-history',
    'client',
    'hr', 'workforce', 'attendance', 'labour-payment',
    'report-daybook', 'report-credit', 'report-labour', 'report-client', 'report-pl',
    'account-settings', 'create-account', 'pending-approvals', 'all-accounts', 'roles-permissions', 'recycle-bin',
];

/* ═══════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function Dashboard({ onLogout }: DashboardProps) {
    const [activeNav, setActiveNav] = useState('dashboard');
    const [visibleNav, setVisibleNav] = useState('dashboard');
    const [transClass, setTransClass] = useState('');
    const [sweepActive, setSweepActive] = useState(false);
    const [flashActive, setFlashActive] = useState(false);
    const transTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sweepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
    // Sidebar starts collapsed on every fresh login/page load — the user
    // opens it themselves via the toggle button instead of it defaulting open.
    const [collapsed, setCollapsed] = useState(true);
    const [autoClosing, setAutoClosing] = useState(false);
    const [mobOpen, setMobOpen] = useState(false);
    const clockRef = useRef<HTMLSpanElement>(null);
    const dispatch = useAppDispatch();
    const { stats, loading, portalSummary, summaryLoading, recentProjects } = useAppSelector(s => s.dashboard);
    const [user, setUser] = useState<User | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<DueNotification[]>([]);
    const [creditNotifs, setCreditNotifs] = useState<CreditDue[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<PendingAccountRequest[]>([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [profileClosing, setProfileClosing] = useState(false);
    const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const closeProfile = useCallback(() => {
        setProfileOpen(o => {
            if (!o) return o;
            setProfileClosing(true);
            if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
            profileCloseTimer.current = setTimeout(() => { setProfileClosing(false); }, 180);
            return false;
        });
    }, []);

    const [sbFootOpen, setSbFootOpen] = useState(false);
    const sbFootRef = useRef<HTMLDivElement>(null);
    const [session, setSession] = useState<SessionInfo | null>(null);
    const [lastSession, setLastSession] = useState<SessionInfo | null>(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyData[]>([]);
    const [monthlyLoading, setMonthlyLoading] = useState(true);
    const [typeDist, setTypeDist] = useState<TypeDist[]>([]);
    const [typeDistLoading, setTypeDistLoading] = useState(true);
    const notifPanelRef = useRef<HTMLDivElement>(null);
    const { shaking, clearShake } = useBellShake(notifications.length + creditNotifs.length + pendingApprovals.length);

    useEffect(() => {
        try {
            const ua = navigator.userAgent;
            const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
            const browser = /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Browser';
            const os = /Windows NT 10/i.test(ua) ? 'Windows 10' : /Windows/i.test(ua) ? 'Windows' : /Mac OS X/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown';
            const stored = sessionStorage.getItem('erp_session');
            const parsed = stored ? JSON.parse(stored) : null;
            const live: SessionInfo = { loginAt: parsed?.loginAt ?? new Date().toISOString(), browser, os, device: isMobile ? 'Mobile' : 'Desktop' };
            setSession(live);
            if (!stored) sessionStorage.setItem('erp_session', JSON.stringify(live));
            const ls = sessionStorage.getItem('erp_last_session');
            if (ls) setLastSession(JSON.parse(ls));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (profileRef.current && !profileRef.current.contains(e.target as Node)) closeProfile(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [closeProfile]);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (sbFootRef.current && !sbFootRef.current.contains(e.target as Node)) setSbFootOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const base = import.meta.env.BASE_URL || '/';
            const cleanPath = path.replace(/^\/+|\/+$/g, '');
            const cleanBase = base.replace(/^\/+|\/+$/g, '');
            let route = '';
            if (cleanPath.startsWith(cleanBase)) {
                route = cleanPath.slice(cleanBase.length).replace(/^\/+|\/+$/g, '');
            } else {
                route = cleanPath;
            }

            if (route) {
                if (['login', 'register', 'landing'].includes(route)) {
                    setActiveNav('dashboard');
                } else {
                    setActiveNav(route);
                }
            } else {
                setActiveNav('dashboard');
            }
        };
        window.addEventListener('popstate', handlePopState);
        handlePopState();
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const targetPath = activeNav === 'dashboard' ? base : `${base}${activeNav}`;
        if (window.location.pathname !== targetPath) {
            window.history.pushState({ nav: activeNav }, '', targetPath);
        }
    }, [activeNav]);

    useEffect(() => {
        const tick = () => { if (clockRef.current) clockRef.current.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); };
        tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const role = user?.role ?? '';
        const allowed =
            (role === 'super_admin') ? null :
                role === 'admin' ? ADMIN_ALLOWED :
                    role === 'user' ? USER_ALLOWED : new Set<string>(['dashboard']);
        if (allowed && !allowed.has(activeNav)) {
            setActiveNav('dashboard');
            return;
        }
        if (activeNav === visibleNav) return;
        clearTimeout(transTimer.current!);
        clearTimeout(sweepTimer.current!);

        const fromIdx = NAV_ORDER.indexOf(visibleNav);
        const toIdx = NAV_ORDER.indexOf(activeNav);
        let enterStyle = 'pt-enterU';
        if (fromIdx !== -1 && toIdx !== -1) {
            enterStyle = toIdx > fromIdx ? 'pt-enterL' : 'pt-enterR';
        } else {
            enterStyle = 'pt-enterF';
        }

        setSweepActive(true);
        setFlashActive(true);
        sweepTimer.current = setTimeout(() => { setSweepActive(false); setFlashActive(false); }, 470);
        setTransClass('pt-exit');

        transTimer.current = setTimeout(() => {
            setVisibleNav(activeNav);
            setTransClass(enterStyle);
            transTimer.current = setTimeout(() => setTransClass('pt-done'), 570);
        }, 195);

        return () => { clearTimeout(transTimer.current!); clearTimeout(sweepTimer.current!); };
    }, [activeNav]);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) setShowNotifPanel(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        const onResize = () => { if (window.innerWidth > 900) setMobOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobOpen]);

    const hasFetched = useRef(false);

    const fetchUser = useCallback(async () => {
        const tk = sessionStorage.getItem('token');
        if (tk) {
            try {
                const r = await axiosInstance.get('auth/me', { headers: { Authorization: `Bearer ${tk}` } });
                const d = r.data?.user || r.data;
                if (d?.name) { setUser(d); return; }
            } catch { }
            try {
                const p = JSON.parse(atob(tk.split('.')[1]));
                if (p?.name || p?.username || p?.sub) {
                    setUser({ id: p.id || 0, name: p.name || p.username || p.sub, email: p.email || '', role: p.role || 'User' });
                    return;
                }
            } catch { }
        }
        try { const s = sessionStorage.getItem('user'); if (s) { const p = JSON.parse(s); if (p?.name) setUser(p); } } catch { }
    }, []);

    const fetchOverview = useCallback(async () => {
        const tk = sessionStorage.getItem('token');
        if (!tk) return;
        const roleNow = getStoredRole();
        if (roleNow === 'user' || roleNow === 'admin') return;
        const H = { Authorization: `Bearer ${tk}` };

        dispatch(setLoadingAction(true));
        dispatch(setSummaryLoadingAction(true));
        setTypeDistLoading(true);
        setMonthlyLoading(true);

        try {
            const res = await axiosInstance.get('dashboard/overview', { headers: H });
            const d = res.data?.data;
            if (!d) return;
            if (d.stats) dispatch(setStatsAction(d.stats));
            if (d.summary) dispatch(setPortalSummaryAction(d.summary));
            const raw: RecentProject[] = d.recentProjects || [];
            dispatch(setRecentProjectsAction(raw));
            if (raw.length > 0) {
                const map: Record<string, { count: number; budget: number; collected: number }> = {};
                for (const p of raw) {
                    const t = p.project_type ?? 'other';
                    if (!map[t]) map[t] = { count: 0, budget: 0, collected: 0 };
                    map[t].count++;
                    map[t].budget += p.raw_budget ?? p.total_budget ?? 0;
                    map[t].collected += p.collected ?? 0;
                }
                const total = Object.values(map).reduce((s, v) => s + v.count, 0) || 1;
                setTypeDist(
                    Object.entries(map)
                        .map(([k, v]) => ({
                            label: TYPE_LABEL[k] ?? (k.charAt(0).toUpperCase() + k.slice(1)),
                            count: v.count,
                            pct: Math.round((v.count / total) * 100),
                            budget: v.budget,
                            collected: v.collected,
                        }))
                        .sort((a, b) => b.pct - a.pct)
                );
            }

            if (d.monthlyRevenue) setMonthlyRevenue(d.monthlyRevenue);
            const dues: DueNotification[] = d.upcomingDues || [];
            setNotifications(dues.filter(n => n.days_until_due <= 20));
            try {
                const cr = await axiosInstance.get('credit-management/notifications', { headers: H });
                setCreditNotifs(cr.data?.data || []);
            } catch { /* silent */ }
        } catch {
            const [sR, sumR, recR, revR, dueR] = await Promise.allSettled([
                axiosInstance.get('dashboard/stats', { headers: H }),
                axiosInstance.get('client-portal/summary', { headers: H }),
                axiosInstance.get('client-portal/recent-projects', { headers: H }),
                axiosInstance.get('client-portal/monthly-revenue', { headers: H }),
                axiosInstance.get('client-portal/upcoming-dues', { headers: H }),
            ]);
            if (sR.status === 'fulfilled') dispatch(setStatsAction(sR.value.data?.data ?? sR.value.data));
            if (sumR.status === 'fulfilled') dispatch(setPortalSummaryAction(sumR.value.data?.data ?? null));
            if (recR.status === 'fulfilled') dispatch(setRecentProjectsAction(recR.value.data?.data || []));
            if (revR.status === 'fulfilled') setMonthlyRevenue(revR.value.data?.data || []);
            if (dueR.status === 'fulfilled') {
                const dues = dueR.value.data?.data || [];
                setNotifications(dues.filter((n: DueNotification) => n.days_until_due <= 20));
            }
            try {
                const cr = await axiosInstance.get('credit-management/notifications', { headers: H });
                setCreditNotifs(cr.data?.data || []);
            } catch { /* silent */ }
        } finally {
            dispatch(setLoadingAction(false));
            dispatch(setSummaryLoadingAction(false));
            setTypeDistLoading(false);
            setMonthlyLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchUser();
        fetchOverview();
    }, []);

    useEffect(() => {
        const id = setInterval(() => fetchOverview(), 5 * 60 * 1000);
        return () => clearInterval(id);
    }, [fetchOverview]);

    useEffect(() => {
        const onNotifRefresh = () => fetchOverview();
        window.addEventListener('erp:notifications-refresh', onNotifRefresh);
        return () => window.removeEventListener('erp:notifications-refresh', onNotifRefresh);
    }, [fetchOverview]);

    /* ── Pending account-approval requests, for the bell — Super Admin
       only. Polls fast (20s) rather than piggy-backing on the 5-minute
       dashboard refresh, so a new request from an Admin's "Create
       Account" page shows up here quickly. */
    const fetchPendingApprovals = useCallback(async () => {
        const tk = sessionStorage.getItem('token');
        if (!tk || getStoredRole() !== 'super_admin') { setPendingApprovals([]); return; }
        try {
            const res = await axiosInstance.get('approval-requests?status=pending', { headers: { Authorization: `Bearer ${tk}` } });
            setPendingApprovals(res.data?.data || []);
        } catch { /* silent — bell just stays as-is until the next tick */ }
    }, []);

    useEffect(() => {
        fetchPendingApprovals();
        const id = setInterval(fetchPendingApprovals, 20 * 1000);
        return () => clearInterval(id);
    }, [fetchPendingApprovals]);

    useEffect(() => {
        const onNotifRefresh = () => fetchPendingApprovals();
        window.addEventListener('erp:notifications-refresh', onNotifRefresh);
        return () => window.removeEventListener('erp:notifications-refresh', onNotifRefresh);
    }, [fetchPendingApprovals]);

    useEffect(() => {
        const LAST_KEY = 'notif_last_check_day';
        const today = new Date().toDateString();
        const lastCheck = localStorage.getItem(LAST_KEY);
        if (lastCheck !== today) {
            localStorage.setItem(LAST_KEY, today);
        }
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchUser(), fetchOverview()]);
        setRefreshing(false);
    };

    const refreshAllData = useCallback(async () => {
        await fetchOverview();
    }, [fetchOverview]);

    const handleLogout = async () => {
        try { const t = sessionStorage.getItem('token'); if (t) await axiosInstance.post('auth/logout', {}, { headers: { Authorization: `Bearer ${t}` } }); }
        catch { } finally {
            const base = import.meta.env.BASE_URL || '/';
            window.history.pushState({ nav: 'login' }, '', `${base}login`);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            toast.info('Signed Out', 'You have been logged out safely');
            onLogout();
        }
    };

    const cancelAutoCollapse = () => {
        if (autoCollapseTimer.current) { clearTimeout(autoCollapseTimer.current); autoCollapseTimer.current = null; }
        setAutoClosing(false);
    };

    const startAutoCollapse = () => {
        if (collapsed) return;
        if (typeof window !== 'undefined' && window.innerWidth <= 900) return; // never auto-collapse on mobile/tablet drawer
        cancelAutoCollapse();
        setAutoClosing(true);
        autoCollapseTimer.current = setTimeout(() => {
            setCollapsed(true);
            setAutoClosing(false);
            autoCollapseTimer.current = null;
        }, 4500);
    };

    useEffect(() => {
        if (mobOpen) { cancelAutoCollapse(); setCollapsed(false); }
    }, [mobOpen]);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 900) { cancelAutoCollapse(); setCollapsed(false); }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const toggleMenu = (id: string) => setOpenMenus(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const navClick = (item: any) => {
        if (item.children) {
            if (!collapsed) { toggleMenu(item.id); }
            else { setCollapsed(false); setTimeout(() => toggleMenu(item.id), 500); }
        } else {
            setActiveNav(item.id);
            setMobOpen(false);
            startAutoCollapse();
        }
    };

    const prevNav = useRef(activeNav);
    useEffect(() => {
        if (prevNav.current === 'client' && activeNav === 'dashboard') {
            fetchOverview();
        }
        prevNav.current = activeNav;
    }, [activeNav]);

    const displayPageLabel = PAGE_LABELS[visibleNav] || visibleNav;
    const userName = user?.name || '';
    const userRole = user?.role || '';
    const initial = userName ? userName.charAt(0).toUpperCase() : '?';
    const tkAll = [...TK_ITEMS, ...TK_ITEMS];
    const urgentCount = notifications.filter(n => n.days_until_due <= 7).length;
    const overdueCount = notifications.filter(n => n.days_until_due <= 0).length;
    return (
        <>
            <style>{ERP_CSS}</style>
            <div className={`ds-sweep-bar ${sweepActive ? 'active' : ''}`} />
            <div className={`ds-trans-flash ${flashActive ? 'active' : ''}`} />
            <div className={`ds-overlay ${mobOpen ? 'vis' : ''}`} onClick={() => setMobOpen(false)} aria-hidden="true" />

            {/* DASHBOARD CONTENT  START */}
            <div className="DS">
                <div className="DS-amb1" /><div className="DS-amb2" /><div className="DS-amb3" />

                <div className="DS-dots" />

                {/* ════ SIDEBAR START ════ */}
                <aside
                    className={`SB ${collapsed ? 'collapsed' : ''} ${mobOpen ? 'mob-open' : ''} ${autoClosing ? 'auto-closing' : ''}`}
                >
                    <button className="SB-toggle" onClick={() => { cancelAutoCollapse(); setCollapsed(c => !c); }} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        <div className="SB-toggle-chevron">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></svg>
                        </div>
                    </button>
                    <div className="SB-inner">

                        <div className="SB-brand">
                            <div className="SB-logo-img-wrap">
                                <img src={import.meta.env.BASE_URL + 'favicon.png'} alt="WhiteNode Software Solutions Logo" className="SB-logo-img" />
                            </div>
                            <div className="SB-wordmark-block">
                                <div className="SB-wordmark-name">
                                    <span className="w-te">White</span>
                                    <span className="w-ss">Node</span>
                                </div>
                                <div className="SB-wordmark-sub">Software Solutions</div>
                            </div>
                            <button className="SB-close" onClick={() => setMobOpen(false)} aria-label="Close menu">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M6 18L18 6" /></svg>
                            </button>
                        </div>

                        <nav className="SB-nav">
                            {getNav(userRole).map(sec => (
                                <div key={sec.section}>
                                    {sec.items.map(item => (
                                        <div key={item.id}>
                                            <div
                                                className={`SB-item ${activeNav === item.id ? 'active' : ''} ${item.children && openMenus.has(item.id) ? 'open' : ''}`}
                                                onClick={() => navClick(item)}
                                                role="button" tabIndex={0}
                                                onKeyDown={e => e.key === 'Enter' && navClick(item)}
                                            >
                                                <div className="SB-item-icon">
                                                    <div className="SB-item-icon-box">
                                                        <NavIcon type={item.icon} active={activeNav === item.id} />
                                                    </div>
                                                </div>
                                                <div className="SB-item-body">
                                                    <span className="SB-item-txt">{item.label}</span>
                                                    {item.id === 'client' && urgentCount > 0
                                                        ? <span className="SB-badge" style={{ background: 'rgba(217,59,85,.12)', color: '#D93B55', borderColor: 'rgba(217,59,85,.28)' }}>{urgentCount} DUE</span>
                                                        : item.badge && <span className="SB-badge">{item.badge}</span>}
                                                    {item.children && (
                                                        <span className="SB-xp">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="SB-tooltip">{item.label}</span>
                                            </div>
                                            {item.children && (
                                                <div className={`SB-sub ${openMenus.has(item.id) ? 'open' : ''}`}>
                                                    {item.children.map((c: { id: string; label: string }) => (
                                                        <div key={c.id}
                                                            className={`SB-sub-item ${activeNav === c.id ? 'active' : ''}`}
                                                            onClick={() => { setActiveNav(c.id); setMobOpen(false); startAutoCollapse(); }}>
                                                            <span className="SB-sub-icon">
                                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
                                                            </span>
                                                            <span className="SB-sub-txt">{c.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </nav>

                        <div className="SB-foot" ref={sbFootRef}>
                            <div className="SB-foot-row">
                                <button
                                    type="button"
                                    className={`SB-foot-trigger ${sbFootOpen ? 'open' : ''}`}
                                    onClick={() => { setSbFootOpen(o => !o); setShowNotifPanel(false); }}
                                    aria-label="Account menu"
                                >
                                    <span className="SB-foot-trigger-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span className="SB-foot-dot" />
                                    </span>
                                    <span className="SB-foot-trigger-txt">Account</span>
                                    <svg className="SB-foot-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 15l-6-6-6 6" />
                                    </svg>
                                </button>

                                {/* Bell — Start */}
                                <div ref={notifPanelRef} className="SB-bell-wrap">
                                    <button
                                        type="button"
                                        className={`SB-bell ${shaking ? 'bell-shake' : ''} ${showNotifPanel ? 'open' : ''} ${(notifications.length + creditNotifs.length + pendingApprovals.length) > 0 ? 'has-notif' : ''}`}
                                        onClick={() => { setShowNotifPanel(o => !o); setSbFootOpen(false); clearShake(); }}
                                        aria-label="Notifications"
                                    >
                                        <svg width="15" height="15" fill="none"
                                            stroke={overdueCount > 0 ? '#D93B55' : pendingApprovals.length > 0 ? '#9A3412' : urgentCount > 0 ? '#C2410C' : 'currentColor'}
                                            strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {(notifications.length + creditNotifs.length + pendingApprovals.length) > 0 && (
                                            <div className="SB-bell-badge">{(notifications.length + creditNotifs.length + pendingApprovals.length) > 9 ? '9+' : notifications.length + creditNotifs.length + pendingApprovals.length}</div>
                                        )}
                                        {(notifications.length + creditNotifs.length + pendingApprovals.length) === 0 && <div className="SB-bell-dot" />}
                                    </button>

                                    {showNotifPanel && (
                                        <NotificationPanel
                                            notifications={notifications}
                                            creditNotifs={creditNotifs}
                                            pendingApprovals={pendingApprovals}
                                            onClose={() => setShowNotifPanel(false)}
                                            onNavigate={(path) => setActiveNav(path)}
                                        />
                                    )}
                                </div>
                                {/* Bell End */}
                            </div>

                            {sbFootOpen && (
                                <div className="SB-foot-pop">
                                    <div className="SB-user">
                                        <div className="SB-user-info">
                                            <span className="SB-un">{userName || <span style={{ opacity: .3, fontStyle: 'italic' }}>Loading…</span>}</span>
                                            <span className="SB-ur">{userRole || 'User'}</span>
                                        </div>
                                    </div>
                                    <div className="SB-status">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div className="SB-dot" />
                                            <span className="SB-st-txt">Online</span>
                                        </div>
                                        <span className="SB-clock" ref={clockRef} />
                                    </div>
                                    {lastSession && (
                                        <div className="SB-lastlogin">
                                            <span className="SB-lastlogin-lbl">Last Login</span>
                                            <span className="SB-lastlogin-val">
                                                {(() => {
                                                    try {
                                                        const d = new Date(lastSession.loginAt);
                                                        const today = new Date();
                                                        const t = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                        const isToday = d.toDateString() === today.toDateString();
                                                        return isToday ? `Today · ${t}` : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ` · ${t}`;
                                                    } catch { return '—'; }
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    <button className="SB-changepass" onClick={() => setShowChangePassword(true)}>
                                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="5" y="11" width="14" height="9" rx="2" />
                                            <path d="M8 11V7a4 4 0 018 0v4" />
                                        </svg>
                                        <span className="SB-cp-txt">Change Password</span>
                                    </button>
                                    <button className="SB-logout" onClick={handleLogout}>
                                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="SB-lo-txt">Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </aside>
                {/* ════ SIDEBAR END ════ */}

                {/* ════ MAIN START ════ */}
                <div className="MC">

                    {/* Mobile Only Start */}
                    <div className={`MOB-ham ${mobOpen ? 'open' : ''}`} onClick={() => setMobOpen(o => !o)} role="button" aria-label={mobOpen ? 'Close menu' : 'Open menu'}>
                        <div className="HAM">
                            <span className="HAM-line" />
                            <span className="HAM-line" />
                            <span className="HAM-line" />
                        </div>
                    </div>
                    {/* Mobile Only End */}

                    {/* Content Start */}
                    <div className={`CC ${transClass}`}>
                        <Suspense fallback={<SuspenseAnimatedLoader label={`Opening ${PAGE_LABELS[visibleNav] || 'Page'}`} />}>
                            {visibleNav === 'dashboard' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    {userRole === 'user' ? (
                                        <LabourDashContent
                                            userName={userName}
                                            onNavigate={(id) => setActiveNav(id)}
                                        />
                                    ) : userRole === 'admin' ? (
                                        <AdminDashContent
                                            userName={userName}
                                            onNavigate={(id) => setActiveNav(id)}
                                        />
                                    ) : (
                                        <DashContent
                                            stats={stats}
                                            recentProjects={recentProjects}
                                            loading={loading}
                                            userName={userName}
                                            monthlyRevenue={monthlyRevenue}
                                            monthlyLoading={monthlyLoading}
                                            portalSummary={portalSummary}
                                            summaryLoading={summaryLoading}
                                            typeDist={typeDist}
                                            typeDistLoading={typeDistLoading}
                                            notifications={notifications}
                                            creditNotifs={creditNotifs}
                                            onNavigate={(id) => setActiveNav(id)}
                                        />
                                    )}
                                </div>
                            )}

                            {(visibleNav === 'master' || visibleNav.startsWith('master-')) && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <MasterData activeNav={activeNav} />
                                </div>
                            )}

                            {visibleNav === 'txn-daybook' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <DaybookPage onNavigate={(id) => setActiveNav(id)} />
                                </div>
                            )}

                            {visibleNav === 'txn-history' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <DaybookTransactions />
                                </div>
                            )}

                            {visibleNav === 'report-daybook' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <ReportCenter section="daybook" />
                                </div>
                            )}

                            {visibleNav === 'report-credit' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <ReportCenter section="credit" />
                                </div>
                            )}

                            {visibleNav === 'report-labour' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <ReportCenter section="labour" />
                                </div>
                            )}

                            {visibleNav === 'report-client' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <ReportCenter section="client" />
                                </div>
                            )}

                            {visibleNav === 'report-pl' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <IncomeStatement />
                                </div>
                            )}

                            {(visibleNav === 'txn-credit' || visibleNav === 'txn-credit-history') && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <CreditManagement />
                                </div>
                            )}

                            <div style={{ display: visibleNav === 'client' ? 'block' : 'none' }}>
                                {visibleNav === 'client' && (
                                    <div className="PAGE-WRAP">
                                        <ClientPortalUnified />
                                    </div>
                                )}
                            </div>

                            {visibleNav === 'create-account' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <CreateAccount />
                                </div>
                            )}

                            {visibleNav === 'pending-approvals' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <PendingApprovals />
                                </div>
                            )}

                            {visibleNav === 'all-accounts' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <AllAccounts />
                                </div>
                            )}

                            {visibleNav === 'roles-permissions' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <RolesPermissions />
                                </div>
                            )}

                            {visibleNav === 'recycle-bin' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <RecycleBin />
                                </div>
                            )}

                            {visibleNav === 'workforce' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <WorkforceRegister />
                                </div>
                            )}

                            {visibleNav === 'attendance' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <AttendanceManagement />
                                </div>
                            )}

                            {visibleNav === 'labour-payment' && (
                                <div key={visibleNav} className="PAGE-WRAP">
                                    <LabourPayment />
                                </div>
                            )}
                        </Suspense>
                    </div>
                    {/* Contend End */}

                </div>
                {/* ════ MAIN END ════ */}

            </div>
            {/* DASHBOARD CONTENT  END */}

            <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
        </>
    );
}