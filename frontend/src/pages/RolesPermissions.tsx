import { ERP_CSS } from './ERPTheme';
import { Ic } from '../components/Icon';
import { PageHeader } from '../components/ui';

/**
 * "Roles & Permissions" tab in Account Settings — super_admin only.
 * A read-only reference screen: it does not configure anything, it just
 * explains what each role can currently do. The actual rules live in
 * app/Http/Middleware/CheckRole.php (backend) and Dashboard.tsx's
 * ADMIN_ALLOWED / USER_ALLOWED sets (frontend nav) — this page is
 * documentation of that behavior, not a control panel for it.
 */

const RP_CSS = `
.RP-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
@media (max-width:900px) { .RP-grid { grid-template-columns:1fr; } }
.RP-card { position:relative; overflow:hidden; border-radius:16px; background:var(--white); border:1px solid var(--border); }
.RP-topbar { height:4px; }
.RP-hdr { display:flex; align-items:center; gap:11px; padding:18px 18px 14px; }
.RP-ic-wrap { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.RP-title { font-size:13.5px; font-weight:800; color:var(--text-1,#0A1530); }
.RP-sub { font-size:9.5px; color:var(--text-4,#888); font-family:'JetBrains Mono',monospace; margin-top:2px; }
.RP-list { list-style:none; margin:0; padding:0 18px 20px; display:flex; flex-direction:column; gap:9px; }
.RP-item { display:flex; align-items:flex-start; gap:8px; font-size:11px; line-height:1.4; color:var(--text-2,#333); }
.RP-item.no { color:var(--text-4,#999); }
.RP-item svg { flex-shrink:0; margin-top:2px; }
`;

interface Capability {
    text: string;
    allowed: boolean;
}

interface RoleCard {
    role: string;
    label: string;
    color: string;
    bg: string;
    iconPath: string;
    capabilities: Capability[];
}

const ROLES: RoleCard[] = [
    {
        role: 'super_admin',
        label: 'Super Admin',
        color: '#E8720C',
        bg: 'rgba(232,114,12,.10)',
        iconPath: 'M12 2l8 3.5v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6L12 2z',
        capabilities: [
            { text: 'Full access to every module — Core Records, Cash Book, Accounts Payable, Accounts Receivable, Manpower, Reports', allowed: true },
            { text: 'Only role that can see Account Settings’ Pending Approvals, All Accounts & Roles & Permissions tabs', allowed: true },
            { text: 'Create Admin or User accounts directly — active immediately, no approval needed', allowed: true },
            { text: 'Approve or reject Admin-submitted User account requests', allowed: true },
            { text: 'Only role that can permanently delete records (Deletion Log / Recycle Bin)', allowed: true },
        ],
    },
    {
        role: 'admin',
        label: 'Admin',
        color: '#9333EA',
        bg: 'rgba(147,51,234,.10)',
        iconPath: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
        capabilities: [
            { text: 'Core Records, Cash Book, Accounts Payable, Manpower Management, and most Reports', allowed: true },
            { text: 'Create Account tab — can create a User account (always sent for Super Admin approval)', allowed: true },
            { text: 'Cannot create an Admin or Super Admin account', allowed: false },
            { text: 'Cannot see Pending Approvals, All Accounts or Roles & Permissions', allowed: false },
            { text: 'Cannot access Accounts Receivable (Clients) or the Deletion Log', allowed: false },
            { text: 'Cannot permanently delete records — sees who created it instead', allowed: false },
        ],
    },
    {
        role: 'user',
        label: 'User',
        color: '#2563EB',
        bg: 'rgba(37,99,235,.10)',
        iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
        capabilities: [
            { text: 'Control Panel (Dashboard) and Manpower Management only — Register, Attendance, Wage Disbursement', allowed: true },
            { text: 'No access to Account Settings at all', allowed: false },
            { text: 'Cannot create any account', allowed: false },
            { text: 'Cannot permanently delete any record', allowed: false },
            { text: 'No access to Core Records, Cash Book, Accounts Payable, Accounts Receivable or Reports', allowed: false },
        ],
    },
];

function CapIcon({ allowed, color }: { allowed: boolean; color: string }) {
    return allowed
        ? <Ic d="M5 13l4 4L19 7" sz={13} c={color} sw={2.4} />
        : <Ic d="M6 18L18 6M6 6l12 12" sz={13} c="var(--text-4,#bbb)" sw={2} />;
}

export default function RolesPermissions() {
    return (
        <div className="ERP-page">
            <style>{ERP_CSS}</style>
            <style>{RP_CSS}</style>

            <PageHeader eyebrow="Account Settings" title="Roles" titleEm="& Permissions" />

            <div className="ERP-divider" />

            <div className="ERP-req-note" style={{ marginBottom: 20 }}>
                <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={13} c="currentColor" sw={2} />
                This is a read-only reference — it describes what each role can currently do. To change what a role can access, contact whoever maintains the software.
            </div>

            <div className="RP-grid">
                {ROLES.map(r => (
                    <div className="RP-card" key={r.role}>
                        <div className="RP-topbar" style={{ background: r.color }} />
                        <div className="RP-hdr">
                            <div className="RP-ic-wrap" style={{ background: r.bg }}>
                                <Ic d={r.iconPath} sz={19} c={r.color} sw={1.8} />
                            </div>
                            <div>
                                <div className="RP-title">{r.label}</div>
                                <div className="RP-sub">{r.capabilities.filter(c => c.allowed).length} allowed · {r.capabilities.filter(c => !c.allowed).length} restricted</div>
                            </div>
                        </div>
                        <ul className="RP-list">
                            {r.capabilities.map((c, i) => (
                                <li className={`RP-item${c.allowed ? '' : ' no'}`} key={i}>
                                    <CapIcon allowed={c.allowed} color={r.color} />
                                    <span>{c.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
