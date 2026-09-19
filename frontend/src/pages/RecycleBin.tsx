import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { Ic } from '../components/Icon';
import RecycleBinDeleteModal from '../components/RecycleBinDeleteModal';
import { tiltMove, tiltLeave } from '../utils/tilt3d';

const RB_CSS = `
@keyframes rb-card-in {
  0%   { opacity:0; transform:perspective(800px) rotateX(-28deg) translateY(14px) scale(.94); }
  60%  { opacity:1; transform:perspective(800px) rotateX(4deg) translateY(-2px) scale(1.016); }
  100% { opacity:1; transform:perspective(800px) rotateX(0) translateY(0) scale(1); }
}
@keyframes rb-float     { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-6px) rotate(-3deg); } }
@keyframes rb-chip-pop  { 0% { opacity:0; transform:scale(.7); } 100% { opacity:1; transform:scale(1); } }

.RB-stat {
  position:relative; transform-style:preserve-3d; overflow:hidden;
  transition:transform .35s cubic-bezier(.2,.8,.3,1), box-shadow .35s ease;
  animation:rb-card-in .5s cubic-bezier(.22,1,.36,1) both;
  will-change:transform;
}
.RB-stat:nth-child(1){ animation-delay:.02s }
.RB-stat:nth-child(2){ animation-delay:.07s }
.RB-stat:nth-child(3){ animation-delay:.12s }
.RB-stat:nth-child(4){ animation-delay:.17s }
.RB-stat:hover { box-shadow:0 18px 36px -12px rgba(15,23,42,.20); }
.RB-stat-top { position:absolute; top:0; left:0; right:0; height:3px; background:var(--rb-c); }
.RB-stat-ic  { width:26px; height:26px; border-radius:8px; background:var(--rb-bg); border:1px solid var(--rb-bd); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }

.RB-chip {
  padding:5px 14px; border-radius:100px; cursor:pointer; font-family:'JetBrains Mono',monospace;
  font-size:9.5px; font-weight:700; transition:transform .16s ease, box-shadow .16s ease, background .16s, border-color .16s, color .16s;
  animation:rb-chip-pop .3s ease both;
}
.RB-chip:hover { transform:translateY(-2px); box-shadow:0 6px 14px rgba(15,23,42,.10); }
.RB-chip:active { transform:translateY(0) scale(.96); }

.RB-group {
  position:relative; margin-bottom:10px; border-radius:14px; overflow:hidden;
  border:1px solid var(--border); background:var(--white);
  box-shadow:0 1px 2px rgba(15,23,42,.04);
  animation:rb-card-in .5s cubic-bezier(.22,1,.36,1) both;
  transition:transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease;
}
.RB-group:hover { transform:translateY(-3px); box-shadow:0 14px 30px -12px rgba(15,23,42,.16); }
.RB-group-hdr { position:relative; display:flex; align-items:center; justify-content:space-between; padding:12px 18px 12px 16px; gap:12px; flex-wrap:wrap; border-left:4px solid var(--rb-c); }
.RB-group-ic  { width:30px; height:30px; border-radius:9px; background:var(--rb-bg); border:1px solid var(--rb-bd); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.RB-group-dot { width:7px; height:7px; border-radius:50%; background:var(--rb-c); flex-shrink:0; box-shadow:0 0 6px var(--rb-c); }
.RB-group-btn {
  display:inline-flex; align-items:center; gap:6px; padding:6px 13px; border-radius:8px;
  font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; cursor:pointer; border:1px solid; transition:all .18s;
}
.RB-group-btn.restore { background:rgba(30,156,106,.08); color:#1E9C6A; border-color:rgba(30,156,106,.24); }
.RB-group-btn.restore:hover:not(:disabled) { background:#1E9C6A; color:#faf9f7; transform:translateY(-1px); box-shadow:0 4px 12px rgba(30,156,106,.3); }
.RB-group-btn.danger  { background:rgba(217,59,85,.08); color:#D93B55; border-color:rgba(217,59,85,.22); }
.RB-group-btn.danger:hover:not(:disabled) { background:#D93B55; color:#faf9f7; transform:translateY(-1px); box-shadow:0 4px 12px rgba(217,59,85,.3); }
.RB-group-btn:disabled { opacity:.5; cursor:not-allowed; }

.RB-float { display:inline-flex; animation:rb-float 3.4s ease-in-out infinite; }

/* ── Compact row polish ── */
.RB-group-hdr { padding:10px 16px 10px 14px; }
.RB-group-btn { padding:5px 11px; }
.RB-group-btn.restore:hover:not(:disabled),
.RB-group-btn.danger:hover:not(:disabled) { transform:translateY(-1px) scale(1.03); }
.ERP-act.edit, .ERP-act.delete { transition:transform .16s ease, box-shadow .16s ease, background .16s, color .16s; }
.ERP-act.edit:hover:not(:disabled), .ERP-act.delete:hover:not(:disabled) { transform:translateY(-1px) scale(1.05); }

/* ── Bin success FX overlay ── */
.RB-fx-backdrop {
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center;
  background:rgba(15,23,42,.34); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
}
.RB-fx-card {
  position:relative; width:264px; padding:24px 22px 16px; border-radius:18px;
  background:var(--white); text-align:center; overflow:hidden;
  box-shadow:0 24px 60px -18px rgba(15,23,42,.4), 0 0 0 1px rgba(15,23,42,.05);
}
.RB-fx-card.RB-fx-restore { box-shadow:0 24px 60px -18px rgba(30,156,106,.38), 0 0 0 1px rgba(30,156,106,.14); }
.RB-fx-card.RB-fx-delete  { box-shadow:0 24px 60px -18px rgba(217,59,85,.38), 0 0 0 1px rgba(217,59,85,.14); }
.RB-fx-icon  { display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
.RB-fx-title { font-size:15px; font-weight:800; color:var(--text-1,#231C14); margin-bottom:4px; letter-spacing:.1px; }
.RB-fx-msg   { font-size:11px; color:var(--text-3,#6B5D48); line-height:1.55; padding:0 4px; }
.RB-fx-bar   { position:absolute; left:0; bottom:0; height:3px; width:100%; transform-origin:left; background:linear-gradient(90deg,var(--ember,#C2410C),var(--ember-light,#F0834D)); }
.RB-fx-card.RB-fx-restore .RB-fx-bar { background:linear-gradient(90deg,#1E9C6A,#34D399); }
.RB-fx-card.RB-fx-delete  .RB-fx-bar { background:linear-gradient(90deg,#D93B55,#F87171); }

@media(prefers-reduced-motion: reduce){
  .RB-stat, .RB-group, .RB-chip, .RB-float { animation:none !important; }
  .RB-stat, .RB-group { transition:none !important; }
}
`;

function BinFxIcon({ kind }: { kind: 'restore' | 'delete' }) {
    const isDelete = kind === 'delete';
    const color = isDelete ? '#D93B55' : '#1E9C6A';
    return (
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none">

            {/* Static Bucket Start */}
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <motion.path
                d="M10 11v6M14 11v6" stroke={color} strokeWidth="1.6" strokeLinecap="round"
                initial={{ opacity: 0.45 }}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Static Bucket End */}

            {/* Swinging Lid Start */}
            <motion.g
                style={{ transformOrigin: '4px 7px' }}
                initial={{ rotate: 0 }}
                animate={{ rotate: isDelete ? [0, -34, -34, 0] : [0, -48, -48, 0] }}
                transition={{ duration: 1.3, times: [0, 0.28, 0.62, 1], ease: 'easeInOut' }}
            >
                <path d="M4 7h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
            {/* Swinging Lid End */}

            {/* Item Start */}
            <motion.rect
                x="10.5" width="3" height="3" rx="0.8" fill={color}
                initial={isDelete ? { y: 1, opacity: 1 } : { y: 13, opacity: 0 }}
                animate={isDelete ? { y: [1, 12, 12], opacity: [1, 1, 0] } : { y: [13, -2], opacity: [0, 1, 1] }}
                transition={{ duration: 1.15, delay: isDelete ? 0.18 : 0.4, ease: 'easeInOut' }}
            />
            {/* Item End */}

            {/* Celebratory  Start */}
            {!isDelete && [0, 1, 2].map(i => (
                <motion.circle
                    key={i} cx={12} cy={4} r="1" fill="#F0834D"
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], x: [0, (i - 1) * 8], y: [0, -6 - i * 2] }}
                    transition={{ duration: 0.7, delay: 0.95 }}
                />
            ))}
            {/* Celebratory End */}
        </svg>
    );
}

/* ── Types ───── */
interface TrashRecord { id: number; name: string; subtitle: string; deleted_at: string; deleted_raw: string; deleted_date?: string; deleted_time?: string; deleted_by_name?: string; }
interface TrashGroup { key: string; label: string; count: number; records: TrashRecord[]; }

/* ── Module colours ────────────────── */
const MOD: Record<string, { dot: string; bg: string; color: string; border: string; icon: string }> = {
    categories: { dot: '#C2410C', bg: '#FBC9A8', color: '#C2410C', border: '#FBC9A8', icon: 'M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' },
    sub_categories: { dot: '#9A3412', bg: '#FDE0CB', color: '#9A3412', border: '#FDE0CB', icon: 'M4 6h16M4 10h16M4 14h10' },
    id_types: { dot: '#C2410C', bg: '#FDE0CB', color: '#C2410C', border: '#FBC9A8', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1' },
    bio_data: { dot: '#F0834D', bg: '#f0fdf4', color: '#F0834D', border: '#bbf7d0', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    sub_names: { dot: '#DB5B1F', bg: '#FDE0CB', color: '#DB5B1F', border: '#FBC9A8', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    clients: { dot: '#D93B55', bg: '#fff1f2', color: '#D93B55', border: '#fecdd3', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    client_projects: { dot: '#DB5B1F', bg: '#FDE0CB', color: '#DB5B1F', border: '#FBC9A8', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    client_payments: { dot: '#9A3412', bg: '#f0fdf4', color: '#9A3412', border: '#bbf7d0', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z' },
    daybook_entries: { dot: '#A6491D', bg: '#FDE0CB', color: '#A6491D', border: '#FBC9A8', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    credit_vendors: { dot: '#C2410C', bg: '#FBC9A8', color: '#C2410C', border: '#FBC9A8', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
    credit_entries: { dot: '#EA580C', bg: '#FDE0CB', color: '#EA580C', border: '#fbcfe8', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    credit_payments: { dot: '#D98255', bg: '#FDE0CB', color: '#D98255', border: '#FBC9A8', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z' },
    workers: { dot: '#F0834D', bg: '#FBC9A8', color: '#9A3412', border: '#FDE0CB', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
};

const fallback = { dot: '#6B5D48', bg: '#F5F3EF', color: '#6B5D48', border: '#D2C7B8', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8' };

/* ── Skeleton row ────────── */
function SkeletonRow() {
    return (
        <tr>
            {[44, 160, 200, 100, 110, 120].map((w, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <div style={{ height: 13, borderRadius: 6, width: w, background: 'linear-gradient(90deg,#E8E2D8 25%,#FDE0CB 50%,#E8E2D8 75%)', backgroundSize: '400px 100%', animation: 'erp-shimmer 1.4s infinite linear' }} />
                </td>
            ))}
        </tr>
    );
}

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function RecycleBin() {
    const [groups, setGroups] = useState<TrashGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState('all');
    const [busy, setBusy] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: number | null; label: string; all: boolean; loading: boolean }>({ open: false, type: '', id: null, label: '', all: false, loading: false });
    const hasFetched = useRef(false);
    const [binFx, setBinFx] = useState<{ show: boolean; kind: 'restore' | 'delete'; title: string; message: string }>({ show: false, kind: 'restore', title: '', message: '' });
    const binFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fireBinFx = (kind: 'restore' | 'delete', title: string, message: string) => {
        if (binFxTimer.current) clearTimeout(binFxTimer.current);
        setBinFx({ show: true, kind, title, message });
        binFxTimer.current = setTimeout(() => setBinFx(f => ({ ...f, show: false })), 2000);
    };
    useEffect(() => () => { if (binFxTimer.current) clearTimeout(binFxTimer.current); }, []);

    const loadTrash = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('trash', { headers: authH() });
            setGroups(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch {
            toast.error('Load Failed', 'Could not load recycle bin records');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        loadTrash();
    }, [loadTrash]);

    const doRestore = async (type: string, id: number, name: string) => {
        const key = `r-${type}-${id}`;
        setBusy(key);
        try {
            await axiosInstance.post(`trash/${type}/${id}/restore`, {}, { headers: authH() });
            fireBinFx('restore', 'Restored!', `"${name}" has been restored successfully`);
            setGroups(g => g.map(grp => grp.key === type ? { ...grp, records: grp.records.filter(r => r.id !== id), count: grp.count - 1 } : grp).filter(grp => grp.count > 0));
            setTotal(t => t - 1);
        } catch {
            toast.error('Restore Failed', `Could not restore "${name}"`);
        } finally { setBusy(''); }
    };

    const doPermDelete = async () => {
        const { type, id, label, all } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            if (all) {
                await axiosInstance.delete(`trash/${type}/force-all`, { headers: authH() });
                fireBinFx('delete', 'Permanently Deleted', `All ${label} records have been deleted`);
                await loadTrash();
            } else {
                await axiosInstance.delete(`trash/${type}/${id}/force`, { headers: authH() });
                fireBinFx('delete', 'Permanently Deleted', `${label} has been permanently removed`);
                setGroups(g => g.map(grp => grp.key === type ? { ...grp, records: grp.records.filter(r => r.id !== id), count: grp.count - 1 } : grp).filter(grp => grp.count > 0));
                setTotal(t => t - 1);
            }
        } catch {
            toast.error('Delete Failed', 'Could not permanently delete the record');
        } finally { setDeleteModal({ open: false, type: '', id: null, label: '', all: false, loading: false }); setBusy(''); }
    };

    const doRestoreAll = async (type: string, label: string) => {
        setBusy(`ra-${type}`);
        try {
            await axiosInstance.post(`trash/${type}/restore-all`, {}, { headers: authH() });
            fireBinFx('restore', 'All Restored!', `All ${label} records have been restored`);
            await loadTrash();
        } catch {
            toast.error('Restore Failed', 'Could not restore all records');
        } finally { setBusy(''); }
    };

    const filtered = filter === 'all' ? groups : groups.filter(g => g.key === filter);
    const totalModules = groups.length;

    return (
        <div className="ERP-page">
            <style>{ERP_CSS}</style>
            <style>{RB_CSS}</style>

            {/* ── HEADER ── */}
            <div className="ERP-hdr">
                <div className="ERP-hdr-left">
                    <div className="ERP-eyebrow">
                        <span className="ERP-eyebrow-line" />
                        <span className="ERP-eyebrow-dot" />
                        System &amp; Maintenance
                    </div>
                    <h1 className="ERP-title MD-page-title">Deletion <span className="ERP-title-em">Log</span></h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        className={`ERP-refresh-btn${loading ? ' spin' : ''}`}
                        onClick={loadTrash}
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
                {[
                    { path: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', label: 'Total Deleted', val: total, c: '#C2410C', bg: 'rgba(37,99,235,0.09)', bd: 'rgba(37,99,235,0.24)' },
                    { path: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Modules', val: totalModules, c: '#DB5B1F', bg: 'rgba(40,112,204,0.09)', bd: 'rgba(40,112,204,0.22)' },
                    { path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Restorable', val: total, c: '#1E9C6A', bg: 'rgba(30,156,106,0.09)', bd: 'rgba(30,156,106,0.22)' },
                    { path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', label: 'Permanent Risk', val: total, c: '#D93B55', bg: 'rgba(217,59,85,0.09)', bd: 'rgba(217,59,85,0.22)' },
                ].map((s, i) => (
                    <div
                        className="ERP-stat RB-stat"
                        key={i}
                        style={{ '--rb-c': s.c, '--rb-bg': s.bg, '--rb-bd': s.bd } as CSSProperties}
                        onMouseMove={e => tiltMove(e, 9, 8)}
                        onMouseLeave={tiltLeave}
                    >
                        <div className="RB-stat-top" />
                        <div className="RB-stat-ic"><Ic d={s.path} sz={13} c={s.c} sw={1.9} /></div>
                        <div className="ERP-stat-label">{s.label}</div>
                        <div className="ERP-stat-val">{s.val}</div>
                    </div>
                ))}
            </div>

            {/* ── FILTER CHIPS ── */}
            {!loading && groups.length > 0 && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '0 0 20px' }}>
                    {[{ key: 'all', label: `All (${total})` }, ...groups.map(g => ({ key: g.key, label: `${g.label} (${g.count})` }))].map((chip, i) => (
                        <button
                            key={chip.key}
                            className="RB-chip"
                            onClick={() => setFilter(chip.key)}
                            style={{
                                border: `1px solid ${filter === chip.key ? 'var(--ember-border,#F0834D)' : 'var(--border)'}`,
                                background: filter === chip.key ? 'var(--ember-ghost,rgba(37,99,235,0.08))' : 'var(--white)',
                                color: filter === chip.key ? 'var(--ember,#F0834D)' : 'var(--text-3,#524532)',
                                animationDelay: `${i * 0.03}s`,
                            }}
                        >{chip.label}</button>
                    ))}
                </div>
            )}

            {/* ── TABLE CARD ── */}
            <div className="ERP-card">
                <div className="ERP-card-topbar" />
                <div className="ERP-card-hdr">
                    <div className="ERP-card-hdr-left">
                        <div className="ERP-card-icon-wrap">
                            <Ic d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" sz={18} c="var(--ember-light)" sw={1.8} />
                        </div>
                        <div>
                            <div className="ERP-card-title">Deleted Records</div>
                            <div className="ERP-card-sub">
                                {loading ? 'Loading…' : total === 0 ? 'Deletion log is empty' : `${total} record${total !== 1 ? 's' : ''} across ${totalModules} module${totalModules !== 1 ? 's' : ''}`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skeleton */}
                {loading && (
                    <div className="ERP-tbl-scroll">
                        <table className="ERP-tbl">
                            <thead><tr>
                                {['No.', 'Module', 'Name', 'Details', 'Deleted By', 'Deleted At', 'Actions'].map(h => <th key={h}>{h}</th>)}
                            </tr></thead>
                            <tbody>{[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}</tbody>
                        </table>
                    </div>
                )}

                {/* Empty */}
                {!loading && groups.length === 0 && (
                    <div className="ERP-empty">
                        <div className="ERP-empty-icon RB-float">
                            <Ic d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" sz={28} c="var(--ember-light)" sw={1.8} />
                        </div>
                        <div className="ERP-empty-title">Deletion Log is Empty</div>
                        <div className="ERP-empty-sub">Deleted records from all modules will appear here</div>
                    </div>
                )}

                {/* Groups → table rows */}
                <AnimatePresence mode="popLayout">
                    {!loading && filtered.map((group, gi) => {
                        const mc = MOD[group.key] ?? fallback;
                        const raKey = `ra-${group.key}`;
                        return (
                            <motion.div
                                key={group.key}
                                layout
                                initial={false}
                                exit={{ opacity: 0, scale: 0.94, height: 0, marginBottom: 0, transition: { duration: 0.28, ease: 'easeInOut' } }}
                                className="RB-group"
                                style={{ '--rb-c': mc.color, '--rb-bg': mc.bg, '--rb-bd': mc.border, animationDelay: `${gi * 0.05}s` } as CSSProperties}
                            >
                                {/* Group header */}
                                <div className="RB-group-hdr">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                        <span className="RB-group-dot" />
                                        <div className="RB-group-ic">
                                            <Ic d={mc.icon} sz={14} c={mc.color} sw={1.8} />
                                        </div>
                                        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-2,#524532)', letterSpacing: '.2px' }}>{group.label}</span>
                                        <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '1px 8px', fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'var(--text-4,#6B5D48)' }}>{group.count}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="RB-group-btn restore" disabled={!!busy} onClick={() => doRestoreAll(group.key, group.label)}>
                                            {busy === raKey
                                                ? <><span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'erp-spin .6s linear infinite' }} /> Restoring…</>
                                                : <><Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" sz={10} c="currentColor" sw={2} /> Restore All</>}
                                        </button>
                                        <button className="RB-group-btn danger" disabled={!!busy} onClick={() => setDeleteModal({ open: true, type: group.key, id: null, label: `all ${group.count} ${group.label}`, all: true, loading: false })}>
                                            <Ic d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" sz={10} c="currentColor" sw={2} /> Delete All
                                        </button>
                                    </div>
                                </div>

                                {/* Records table */}
                                <div className="ERP-tbl-scroll">
                                    <table className="ERP-tbl">
                                        <thead>
                                            <tr>
                                                <th className="ERP-center" style={{ width: 44 }}>No.</th>
                                                <th>Name</th>
                                                <th>Details</th>
                                                <th>Deleted By</th>
                                                <th>Deleted At</th>
                                                <th className="ERP-center" style={{ width: 180 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence mode="popLayout">
                                                {group.records.map((rec, i) => {
                                                    const rKey = `r-${group.key}-${rec.id}`;
                                                    const dKey = `d-${group.key}-${rec.id}`;
                                                    const initials = rec.name.trim().slice(0, 2).toUpperCase() || '??';
                                                    return (
                                                        <motion.tr
                                                            key={rec.id}
                                                            layout
                                                            initial={false}
                                                            exit={{ opacity: 0, x: 24, transition: { duration: 0.22, ease: 'easeIn' } }}
                                                        >
                                                            <td className="ERP-t-num ERP-center">{i + 1}</td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                                                                    <span className="ERP-t-primary">{rec.name}</span>
                                                                </div>
                                                            </td>
                                                            <td>{rec.subtitle
                                                                ? <span className="ERP-t-desc">{rec.subtitle}</span>
                                                                : <span className="ERP-t-null">—</span>}
                                                            </td>
                                                            <td>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                                                                        {(rec.deleted_by_name || 'U').trim().slice(0, 1).toUpperCase()}
                                                                    </span>
                                                                    <span style={{ fontSize: 10, color: 'var(--text-2,#524532)', fontWeight: 700 }}>{rec.deleted_by_name || 'Unknown'}</span>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                    <Ic d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" sz={12} c="var(--text-4,#8C7C63)" sw={1.8} />
                                                                    <span style={{ fontSize: 9.5, color: 'var(--text-4,#6B5D48)', fontFamily: "'JetBrains Mono',monospace" }}>{rec.deleted_at}</span>
                                                                </span>
                                                            </td>
                                                            <td className="ERP-center ERP-nowrap">
                                                                <button className="ERP-act edit" disabled={!!busy} onClick={() => doRestore(group.key, rec.id, rec.name)}>
                                                                    {busy === rKey
                                                                        ? <><span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'erp-spin .6s linear infinite' }} /></>
                                                                        : <><Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" sz={11} c="currentColor" sw={1.8} /> Restore</>}
                                                                </button>
                                                                <button className="ERP-act delete" disabled={!!busy} onClick={() => setDeleteModal({ open: true, type: group.key, id: rec.id, label: `"${rec.name}"`, all: false, loading: false })}>
                                                                    {busy === dKey
                                                                        ? <><span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'erp-spin .6s linear infinite' }} /></>
                                                                        : <><Ic d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" sz={11} c="currentColor" sw={1.8} /> Delete</>}
                                                                </button>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ── Bin success FX overlay ── */}
            <AnimatePresence>
                {binFx.show && (
                    <motion.div
                        className="RB-fx-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={() => setBinFx(f => ({ ...f, show: false }))}
                    >
                        <motion.div
                            className={`RB-fx-card RB-fx-${binFx.kind}`}
                            initial={{ opacity: 0, scale: 0.78, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.86, y: -8 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="RB-fx-icon"><BinFxIcon kind={binFx.kind} /></div>
                            <div className="RB-fx-title">{binFx.title}</div>
                            <div className="RB-fx-msg">{binFx.message}</div>
                            <motion.div
                                className="RB-fx-bar"
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: 2, ease: 'linear' }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Confirm Delete Modal ── */}
            <RecycleBinDeleteModal
                open={deleteModal.open}
                title="Permanent Delete"
                itemName={deleteModal.label}
                description="This action cannot be undone. The record will be permanently removed from the system."
                confirmLabel="Delete Forever"
                onConfirm={doPermDelete}
                onCancel={() => setDeleteModal({ open: false, type: '', id: null, label: '', all: false, loading: false })}
                loading={deleteModal.loading}
            />
        </div>
    );
}
