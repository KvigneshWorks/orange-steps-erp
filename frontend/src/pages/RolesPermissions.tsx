import { useState, useEffect } from 'react';
import { ERP_CSS } from './ERPTheme';
import { AS_CSS } from './AccountSettingsTheme';
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
.RP-card {
  position:relative; overflow:hidden; border-radius:16px; background:var(--white); border:1px solid var(--border);
  transition:transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease;
}
.RP-card:hover { transform:translateY(-3px); box-shadow:0 18px 36px -12px rgba(15,23,42,.20); }
@media(prefers-reduced-motion: reduce){ .RP-card { transition:none !important; } }
.RP-topbar { height:4px; }
.RP-hdr { display:flex; align-items:center; gap:11px; padding:18px 18px 14px; }
.RP-ic-wrap { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.RP-title { font-size:13.5px; font-weight:800; color:var(--text-1,#231C14); }
.RP-sub { font-size:9.5px; color:var(--text-4,#6B5D48); font-family:'JetBrains Mono',monospace; margin-top:2px; }
.RP-list { list-style:none; margin:0; padding:0 18px 20px; display:flex; flex-direction:column; gap:9px; }
.RP-item { display:flex; align-items:flex-start; gap:8px; font-size:11px; line-height:1.4; color:var(--text-2,#3A3024); }
.RP-item.no { color:var(--text-4,#8C7C63); }
.RP-item svg { flex-shrink:0; margin-top:2px; }
`;

/* Premium visual pass -- kept deliberately restrained after feedback
   that the earlier spinning/shimmering/3D-flip version felt gimmicky
   rather than professional. Everything below is a ONE-TIME entrance
   (fade + slight rise, staggered per card/row) plus a confident,
   role-tinted hover state. Nothing loops or animates at rest --
   no spinning rings, no shine sweeps, no breathing icons, no
   perpetually shimmering text -- because a read-only reference page
   should feel calm and considered, not busy. */
const RP_PREMIUM_CSS = `
@keyframes rp-card-in {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.RP-card {
  background: linear-gradient(165deg, var(--white) 0%, var(--off-white) 130%);
  box-shadow: 0 1px 3px rgba(15,23,42,.05), 0 18px 40px -26px rgba(15,23,42,.16);
  animation: rp-card-in .5s cubic-bezier(.22,1,.36,1) both;
}
.RP-grid > .RP-card:nth-child(1) { animation-delay: .04s; }
.RP-grid > .RP-card:nth-child(2) { animation-delay: .12s; }
.RP-grid > .RP-card:nth-child(3) { animation-delay: .20s; }

.RP-card::before {
  content: ''; position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle, var(--rp-bg, rgba(194,65,12,.10)) 0%, transparent 72%);
  pointer-events: none;
}
.RP-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 22px 44px -20px color-mix(in srgb, var(--rp-c, var(--ember)) 30%, transparent);
}

.RP-ic-wrap { position: relative; animation: as-icon-pop .5s cubic-bezier(.22,1,.36,1) .1s both; }
.RP-ic-ring {
  position: absolute; inset: -6px; border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--rp-c, var(--ember)) 26%, transparent);
}

.RP-title { font-family: var(--font-body); font-weight: 800; letter-spacing: -.1px; color: var(--rp-c, var(--text-1,#231C14)); }

.RP-badges { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.RP-badge {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
  padding: 2.5px 8px; border-radius: 100px; border: 1px solid;
  opacity: 0; animation: rp-badge-in .4s cubic-bezier(.22,1,.36,1) .3s both;
}
.RP-badge.no { animation-delay: .36s; }
@keyframes rp-badge-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.RP-badge.ok { color: var(--rp-c, var(--ember)); background: var(--rp-bg, var(--ember-ghost)); border-color: color-mix(in srgb, var(--rp-c, var(--ember)) 32%, transparent); }
.RP-badge.no { color: var(--text-4,#8C7C63); background: rgba(140,124,99,.08); border-color: rgba(140,124,99,.22); }
.RP-badge-num { display: inline-block; font-variant-numeric: tabular-nums; }

.RP-item {
  opacity: 0; animation: rp-item-in .4s cubic-bezier(.22,1,.36,1) forwards;
  border-radius: 8px; padding: 4px 6px; margin: 0 -6px; transition: background .16s;
}
.RP-item:hover { background: rgba(35,28,20,.035); }
@keyframes rp-item-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
.RP-list li:nth-child(1) { animation-delay: .16s; }
.RP-list li:nth-child(2) { animation-delay: .21s; }
.RP-list li:nth-child(3) { animation-delay: .26s; }
.RP-list li:nth-child(4) { animation-delay: .31s; }
.RP-list li:nth-child(5) { animation-delay: .36s; }
.RP-list li:nth-child(6) { animation-delay: .41s; }

.RP-cap-ic { flex-shrink: 0; margin-top: 2px; }
.rp-draw { stroke-dasharray: 100; stroke-dashoffset: 100; animation: as-draw .45s ease forwards; }

.RP-page .ERP-divider { transform-origin: left; animation: as-line-fill .5s cubic-bezier(.22,1,.36,1) both; }
.RP-page .ERP-req-note { animation: as-banner-in .45s cubic-bezier(.22,1,.36,1) .05s both; }

@media (prefers-reduced-motion: reduce) {
  .RP-card, .RP-ic-wrap, .RP-badge, .RP-item, .rp-draw,
  .RP-page .ERP-divider, .RP-page .ERP-req-note {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
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
        color: '#EA580C',
        bg: 'rgba(234,88,12,.10)',
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
        color: '#DB5B1F',
        bg: 'rgba(219,91,31,.10)',
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
        color: '#C2410C',
        bg: 'rgba(194,65,12,.10)',
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

function CapIcon({ allowed, color, delay = 0 }: { allowed: boolean; color: string; delay?: number }) {
    if (allowed) {
        return (
            <svg className="RP-cap-ic" width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path className="rp-draw" pathLength={100} d="M5 13l4 4L19 7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${delay}s` }} />
            </svg>
        );
    }
    return (
        <svg className="RP-cap-ic" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path className="rp-draw" pathLength={100} d="M6 18L18 6M6 6l12 12" stroke="var(--text-4,#8C7C63)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${delay}s` }} />
        </svg>
    );
}

/** Counts up 0 -> target once, after startDelay -- the "Allowed" /
 * "Restricted" badges tick up live instead of just appearing, which is
 * the bit of genuinely-live motion on an otherwise static reference page. */
function useCountUp(target: number, duration = 700, startDelay = 0) {
    const [n, setN] = useState(0);
    useEffect(() => {
        let raf = 0;
        let start: number | null = null;
        setN(0);
        const timer = setTimeout(() => {
            const step = (ts: number) => {
                if (start === null) start = ts;
                const p = Math.min((ts - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                setN(Math.round(eased * target));
                if (p < 1) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        }, startDelay * 1000);
        return () => { clearTimeout(timer); if (raf) cancelAnimationFrame(raf); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration, startDelay]);
    return n;
}

function RoleCardTile({ r }: { r: RoleCard }) {
    const allowedTotal = r.capabilities.filter(c => c.allowed).length;
    const restrictedTotal = r.capabilities.filter(c => !c.allowed).length;
    const allowedN = useCountUp(allowedTotal, 650, 0.38);
    const restrictedN = useCountUp(restrictedTotal, 650, 0.46);

    return (
        <div className="RP-card" style={{ '--rp-c': r.color, '--rp-bg': r.bg } as any}>
            <div className="RP-topbar" style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}aa, ${r.color})` }} />
            <div className="RP-hdr">
                <div className="RP-ic-wrap" style={{ background: r.bg }}>
                    <span className="RP-ic-ring" />
                    <Ic d={r.iconPath} sz={19} c={r.color} sw={1.8} />
                </div>
                <div>
                    <div className="RP-title">{r.label}</div>
                    <div className="RP-badges">
                        <span className="RP-badge ok"><span className="RP-badge-num">{allowedN}</span> Allowed</span>
                        <span className="RP-badge no"><span className="RP-badge-num">{restrictedN}</span> Restricted</span>
                    </div>
                </div>
            </div>
            <ul className="RP-list">
                {r.capabilities.map((c, i) => (
                    <li className={`RP-item${c.allowed ? '' : ' no'}`} key={i}>
                        <CapIcon allowed={c.allowed} color={r.color} delay={0.12 + i * 0.06} />
                        <span>{c.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function RolesPermissions() {
    return (
        <div className="ERP-page RP-page">
            <style>{ERP_CSS}</style>
            <style>{AS_CSS}</style>
            <style>{RP_CSS}</style>
            <style>{RP_PREMIUM_CSS}</style>

            <PageHeader eyebrow="Account Settings" title="Roles" titleEm="& Permissions" />

            <div className="ERP-divider" />

            <div className="ERP-req-note" style={{ marginBottom: 20 }}>
                <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={13} c="currentColor" sw={2} />
                This is a read-only reference — it describes what each role can currently do. To change what a role can access, contact whoever maintains the software.
            </div>

            <div className="RP-grid ERP-stagger">
                {ROLES.map(r => <RoleCardTile key={r.role} r={r} />)}
            </div>
        </div>
    );
}
