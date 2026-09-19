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

/* Premium visual pass: glow rings on each role icon, a shimmering top
   accent bar, role-tinted hover glow (via --rp-c / --rp-bg set inline
   per card), allowed/restricted badges instead of a plain "x . y" line,
   and a staggered slide-in for each capability row. */
const RP_PREMIUM_CSS = `
.RP-grid { perspective: 1200px; }
.RP-card {
  background: linear-gradient(165deg, var(--white) 0%, var(--off-white) 130%);
  box-shadow: 0 1px 3px rgba(15,23,42,.05), 0 18px 40px -26px rgba(15,23,42,.16);
}
.RP-card::before {
  content: ''; position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle, var(--rp-bg, rgba(194,65,12,.10)) 0%, transparent 72%);
  pointer-events: none;
}
.RP-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 26px 54px -22px color-mix(in srgb, var(--rp-c, var(--ember)) 32%, transparent);
}

.RP-topbar { background-size: 200% 100% !important; animation: rp-shimmer 3.2s linear infinite; }
@keyframes rp-shimmer { 0% { background-position: 0% 0; } 100% { background-position: -200% 0; } }

.RP-ic-wrap { position: relative; animation: as-icon-pop .5s cubic-bezier(.22,1,.36,1) both; }
.RP-ic-ring {
  position: absolute; inset: -6px; border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--rp-c, var(--ember)) 30%, transparent);
  animation: as-ring-expand 2.6s cubic-bezier(.22,1,.36,1) infinite;
  pointer-events: none;
}

.RP-title { font-family: var(--font-display); letter-spacing: .01em; }

.RP-badges { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.RP-badge {
  font-family: var(--font-mono); font-size: 8px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
  padding: 2.5px 8px; border-radius: 100px; border: 1px solid;
}
.RP-badge.ok { color: var(--rp-c, var(--ember)); background: var(--rp-bg, var(--ember-ghost)); border-color: color-mix(in srgb, var(--rp-c, var(--ember)) 32%, transparent); }
.RP-badge.no { color: var(--text-4,#8C7C63); background: rgba(140,124,99,.08); border-color: rgba(140,124,99,.22); }

.RP-item {
  opacity: 0; animation: rp-item-in .4s cubic-bezier(.22,1,.36,1) forwards;
  border-radius: 8px; padding: 4px 6px; margin: 0 -6px; transition: background .16s;
}
.RP-item:hover { background: rgba(35,28,20,.035); }
@keyframes rp-item-in { 0% { opacity: 0; transform: translateX(-6px); } 100% { opacity: 1; transform: translateX(0); } }
.RP-list li:nth-child(1) { animation-delay: .05s; }
.RP-list li:nth-child(2) { animation-delay: .11s; }
.RP-list li:nth-child(3) { animation-delay: .17s; }
.RP-list li:nth-child(4) { animation-delay: .23s; }
.RP-list li:nth-child(5) { animation-delay: .29s; }
.RP-list li:nth-child(6) { animation-delay: .35s; }

@media (prefers-reduced-motion: reduce) {
  .RP-topbar, .RP-ic-wrap, .RP-ic-ring, .RP-item { animation: none !important; opacity: 1 !important; }
}
`;

/* Round 2 -- more animation, as asked: a 3D flip-in for each card, a
   light "shine" sweep across the card on hover, a breathing icon, the
   allowed/restricted badges popping in with a bounce, the checkmark /
   cross in every capability row drawing itself in (stroke animation),
   a slow-drifting glow blob behind each icon, and the header / divider
   / note easing in too. Everything here is still page-scoped (.RP-*
   classes and .RP-page only exist on this page). */
const RP_PREMIUM_CSS_2 = `
@keyframes rp-card-in {
  0%   { opacity: 0; transform: perspective(1100px) rotateY(-14deg) rotateX(4deg) translateY(26px) scale(.94); }
  100% { opacity: 1; transform: perspective(1100px) rotateY(0) rotateX(0) translateY(0) scale(1); }
}
.RP-card {
  animation: rp-card-in .7s cubic-bezier(.22,1,.36,1) both;
  transform-style: preserve-3d;
}
.RP-grid > .RP-card:nth-child(1) { animation-delay: .05s; }
.RP-grid > .RP-card:nth-child(2) { animation-delay: .16s; }
.RP-grid > .RP-card:nth-child(3) { animation-delay: .27s; }

.RP-card::after {
  content: ''; position: absolute; top: 0; left: -60%; width: 45%; height: 100%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,.55), transparent);
  transform: skewX(-18deg);
  transition: left .7s cubic-bezier(.22,1,.36,1);
  pointer-events: none;
  z-index: 2;
}
.RP-card:hover::after { left: 130%; }

.RP-card::before { animation: rp-blob-float 6s ease-in-out infinite; }
@keyframes rp-blob-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10px,10px) scale(1.12); } }

.RP-ic-wrap svg { animation: rp-icon-breathe 3.2s ease-in-out infinite; transform-origin: center; }
@keyframes rp-icon-breathe { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.14) rotate(-4deg); } }

@keyframes rp-badge-pop { 0% { opacity: 0; transform: scale(.55); } 65% { transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
.RP-badge.ok { animation: rp-badge-pop .45s cubic-bezier(.34,1.56,.64,1) .38s both; }
.RP-badge.no { animation: rp-badge-pop .45s cubic-bezier(.34,1.56,.64,1) .46s both; }

.RP-cap-ic { flex-shrink: 0; margin-top: 2px; }
.rp-draw { stroke-dasharray: 100; stroke-dashoffset: 100; animation: as-draw .5s ease forwards; }

.RP-page .ERP-divider { transform-origin: left; animation: as-line-fill .55s cubic-bezier(.22,1,.36,1) .05s both; }
.RP-page .ERP-req-note { animation: as-banner-in .5s cubic-bezier(.22,1,.36,1) .1s both; }

@media (prefers-reduced-motion: reduce) {
  .RP-card, .RP-card::before, .RP-card::after, .RP-ic-wrap svg,
  .RP-badge.ok, .RP-badge.no, .rp-draw, .RP-page .ERP-divider, .RP-page .ERP-req-note {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

/* Round 3 -- attractive type treatment for the role name (italic serif,
   gradient-shimmer fill, in the font the rest of the app already loads
   for headings) and a softer humanist face for the capability sentences
   (DM Sans -- already pulled in by index.html for weight variety, just
   not used as a body font anywhere yet). Plus more "always alive"
   motion: a rotating dashed ring behind each icon, a slow ambient pulse
   on the corner glow even at rest, and a vertical connector line that
   threads through the capability list like a timeline. */
const RP_PREMIUM_CSS_3 = `
.RP-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 16px;
  letter-spacing: .015em;
  background: linear-gradient(100deg, var(--rp-c, var(--ember)) 0%, var(--text-1,#231C14) 45%, var(--rp-c, var(--ember)) 90%);
  background-size: 240% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rp-title-shimmer 5s ease-in-out infinite;
}
@keyframes rp-title-shimmer { 0% { background-position: 0% 0; } 50% { background-position: 100% 0; } 100% { background-position: 0% 0; } }

.RP-item span { font-family: 'DM Sans', var(--font-body); font-weight: 500; letter-spacing: .002em; line-height: 1.55; }
.RP-item.no span { font-weight: 400; }

.RP-ic-wrap::before {
  content: ''; position: absolute; inset: -10px; border-radius: 16px;
  border: 1.5px dashed color-mix(in srgb, var(--rp-c, var(--ember)) 38%, transparent);
  animation: rp-spin 7s linear infinite;
  pointer-events: none;
}
@keyframes rp-spin { to { transform: rotate(360deg); } }

@keyframes rp-blob-float {
  0%, 100% { transform: translate(0,0) scale(1);     opacity: .85; }
  50%      { transform: translate(-10px,10px) scale(1.16); opacity: 1; }
}

.RP-list { position: relative; }
.RP-list::before {
  content: ''; position: absolute; left: 24.5px; top: 6px; bottom: 22px; width: 1.5px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--rp-c, var(--ember)) 45%, transparent), transparent 95%);
  transform-origin: top; transform: scaleY(0);
  animation: rp-line-draw .8s cubic-bezier(.22,1,.36,1) .3s forwards;
}
@keyframes rp-line-draw { to { transform: scaleY(1); } }
.RP-cap-ic { position: relative; z-index: 1; background: var(--white); border-radius: 50%; box-shadow: 0 0 0 3px var(--white); }

.RP-badge-num { display: inline-block; font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  .RP-title { animation: none !important; }
  .RP-ic-wrap::before { animation: none !important; }
  .RP-list::before { animation: none !important; transform: scaleY(1) !important; }
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
            <style>{RP_PREMIUM_CSS_2}</style>
            <style>{RP_PREMIUM_CSS_3}</style>

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
