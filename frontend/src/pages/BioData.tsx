import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import RunningLoader from '../components/RunningLoader';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Ic } from '../components/Icon';
import { ERP_CSS } from './ERPTheme';
import Pagination from '../components/Pagination';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import { getStoredRole, canDelete } from '../utils/roleAccess';

interface Category { id: number; name: string; }
interface SubCategory { id: number; name: string; category_id: number; category_ids?: number[]; }
interface IDType { id: number; type_name: string; }
interface BioRecord {
    id: number; name: string; id_type_id?: number; id_type_name?: string;
    id_details: string; category_id?: number; category_name?: string;
    sub_category_id?: number; sub_category_name?: string;
    address?: string; description?: string; created_by_name?: string;
}

interface FormData {
    name: string; id_type_id: string; id_details: string;
    category_id: string; sub_category_id: string; address: string; description: string;
}

interface SDDOption { value: string; label: string; }
interface SDDProps {
    options: SDDOption[]; value: string; onChange: (v: string) => void;
    placeholder: string; disabled?: boolean; emptyMsg?: string;
    label?: string; required?: boolean; optional?: boolean;
}

/* ══════════════════════════════════════════════════════════════
   SearchDD — ERP light theme
══════════════════════════════════════════════════════════════ */
function SearchDD({
    options, value, onChange, placeholder,
    disabled = false, emptyMsg = 'No options available',
    label, required, optional,
}: SDDProps) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
    const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false); setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);
    const handleSelect = (v: string) => { onChange(v); setOpen(false); setQuery(''); };

    return (
        <>
            <div
                className="SDD-root"
                ref={ref}
                style={{
                    position: 'relative',
                    zIndex: open ? 9999 : 1,
                    ...(disabled ? { opacity: 0.45, pointerEvents: 'none' } : {}),
                }}
            >
                {label && (
                    <label className="ERP-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        {label}
                        {required && <span style={{ color: 'var(--error)', fontSize: 9.5 }}>*</span>}
                        {optional && <span className="ERP-label-opt">(optional)</span>}
                    </label>
                )}

                <button
                    type="button"
                    ref={triggerRef}
                    className={`SDD-trigger${open ? ' open' : ''}${selected ? ' has-value' : ''}`}
                    onClick={() => setOpen(o => !o)}
                    onKeyDown={onTriggerKeyDown}
                >
                    <span className="SDD-trigger-content">
                        {selected
                            ? <span className="SDD-selected">{selected.label}</span>
                            : <span className="SDD-placeholder">{placeholder}</span>}
                    </span>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        style={{
                            flexShrink: 0, transition: 'transform 0.2s',
                            transform: open ? 'rotate(180deg)' : 'none',
                            color: open ? 'var(--ember)' : 'var(--border-2)',
                        }}>
                        <path d="M5 8l7 7 7-7" />
                    </svg>
                </button>

                {open && (
                    <div className="SDD-panel" ref={panelRef}>

                        {/*  */}
                        <div className="SDD-search-wrap">
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                                stroke="var(--text-4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                            </svg>
                            <input autoComplete="off" ref={inputRef} className="SDD-search" placeholder="Search..."
                                value={query} onChange={e => setQuery(e.target.value)}
                                onClick={e => e.stopPropagation()} />
                            {query && (
                                <button className="SDD-clear-q" onClick={() => setQuery('')} type="button">
                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                                        stroke="var(--text-4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="SDD-list">
                            {value && (
                                <div className="SDD-item SDD-clear-item" role="option" tabIndex={-1} aria-selected={false} onClick={() => handleSelect('')}>
                                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Clear selection</span>
                                </div>
                            )}
                            {filtered.length === 0
                                ? <div className="SDD-empty">{query ? `No results for "${query}"` : emptyMsg}</div>
                                : filtered.map(opt => (
                                    <div key={opt.value}
                                        role="option" tabIndex={-1} aria-selected={value === opt.value}
                                        className={`SDD-item${value === opt.value ? ' selected' : ''}`}
                                        onClick={() => handleSelect(opt.value)}>
                                        <span style={{ flex: 1 }}>{opt.label}</span>
                                        {value === opt.value && (
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                                                stroke="var(--ember)" strokeWidth={2.5}
                                                strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                        </div>
                        <div className="SDD-footer">{filtered.length} of {options.length} options</div>
                    </div>
                )}
            </div>
        </>
    );
}

const SDD_CSS = `
/* CRITICAL: allow dropdowns to overflow the card */
.ERP-form-card { overflow: visible !important; }
.ERP-form-body { overflow: visible !important; }

/* Preserve rounded corners on the top bar visually */
.ERP-form-topbar {
    border-radius: var(--r-xl) var(--r-xl) 0 0 !important;
}

.SDD-root { width: 100%; }

.SDD-trigger {
    width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 13px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--r-md); cursor: pointer; transition: all 0.18s;
    text-align: left; min-height: 44px; outline: none;
}
.SDD-trigger:hover   { border-color: var(--border-2); background: var(--off-white); }
.SDD-trigger.open    {
    border-color: var(--ember-mid);
    box-shadow: 0 0 0 3px var(--ember-ghost);
    border-bottom-left-radius: 0; border-bottom-right-radius: 0;
}
.SDD-trigger.has-value { border-color: var(--ember-border); }

.SDD-trigger-content { flex: 1; min-width: 0; }
.SDD-selected    {
    font-family: var(--font-body); font-size: 11px; font-weight: 700;
    color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
}
.SDD-placeholder { font-family: var(--font-body); font-size: 11px; color: var(--text-4); font-style: italic; font-weight: 600; }

.SDD-panel {
    position: absolute; top: 100%; left: 0; right: 0;
    z-index: 99999;
    background: var(--white);
    border: 1.5px solid var(--ember-mid);
    border-top: none;
    border-bottom-left-radius: var(--r-md); border-bottom-right-radius: var(--r-md);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(37,99,235,0.12);
    animation: sdd-drop 0.14s ease both;
}
@keyframes sdd-drop { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }

.SDD-search-wrap {
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    background: var(--off-white);
}
.SDD-search {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: var(--font-body); font-size: 10.5px; color: var(--text-1);
    caret-color: var(--ember-mid);
}
.SDD-search::placeholder { color: var(--text-4); font-style: italic; }
.SDD-clear-q {
    background: none; border: none; padding: 2px; cursor: pointer;
    display: flex; color: var(--text-4); transition: color 0.15s;
}
.SDD-clear-q:hover { color: var(--ember); }

.SDD-list { max-height: 200px; overflow-y: auto; }
.SDD-list::-webkit-scrollbar { width: 4px; }
.SDD-list::-webkit-scrollbar-track { background: var(--off-white); }
.SDD-list::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 2px; }
.SDD-list::-webkit-scrollbar-thumb:hover { background: var(--ember-border); }

.SDD-item {
    display: flex; align-items: center; gap: 8px; padding: 10px 14px;
    cursor: pointer; transition: background 0.12s;
    font-family: var(--font-body); font-size: 10.5px; color: var(--text-2);
    border-bottom: 1px solid var(--border);
}
.SDD-item:last-child { border-bottom: none; }
.SDD-item:hover    { background: var(--ember-ghost); color: var(--text-1); }
.SDD-item.selected { background: var(--ember-ghost); color: var(--ember); font-weight: 700; }

.SDD-clear-item { color: var(--text-4); font-size: 9px; font-style: italic; gap: 6px; }
.SDD-clear-item:hover { background: var(--error-bg) !important; color: var(--error) !important; }

.SDD-empty {
    padding: 18px 14px;
    font-family: var(--font-mono); font-size: 9px;
    color: var(--text-4); font-style: italic; letter-spacing: 0.5px;
    text-align: center;
}
.SDD-footer {
    padding: 6px 14px; border-top: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 8px; color: var(--text-4);
    letter-spacing: 0.5px; text-align: right;
    background: var(--surface);
    border-radius: 0 0 var(--r-md) var(--r-md);
}

.ERP-label.req::after { content: ' *'; color: var(--error); }
.ERP-label-opt { font-size: 9px; font-weight: 600; color: var(--text-4); font-style: italic; margin-left: 6px; }

/* ── Premium scrollbar ── */
@keyframes bio-sb-glow {
  0%,100% { box-shadow: 0 0 4px rgba(59,130,246,0.35); }
  50%      { box-shadow: 0 0 9px rgba(59,130,246,0.65), 0 0 18px rgba(29,78,216,0.25); }
}
.SDD-list { scrollbar-width: thin; scrollbar-color: #DB5B1F rgba(203,213,225,0.18); }
.SDD-list::-webkit-scrollbar { width: 3px; }
.SDD-list::-webkit-scrollbar-track { background: rgba(203,213,225,0.15); border-radius: 99px; }
.SDD-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #F0834D 0%, #DB5B1F 45%, #C2410C 100%);
  border-radius: 99px;
  box-shadow: 0 0 3px rgba(59,130,246,0.25);
  transition: background 0.22s ease, box-shadow 0.22s ease;
}
.SDD-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FBC9A8 0%, #DB5B1F 42%, #C2410C 100%);
  box-shadow: 0 0 8px rgba(59,130,246,0.55), 0 0 16px rgba(29,78,216,0.22);
  animation: bio-sb-glow 1.8s ease-in-out infinite;
}
`;

const EMPTY: FormData = {
    name: '', id_type_id: '', id_details: '',
    category_id: '', sub_category_id: '', address: '', description: '',
};

const authH = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.warn('No token found in localStorage');
        return {};
    }
    return { Authorization: `Bearer ${token}` };
};

/* ═══════════════════════════════════════════════════════════
   BioData Page
══════════════════════════════════════════════════════════════ */
export default function BioData() {
    const [userRole] = useState<string>(() => getStoredRole());
    const [form, setForm] = useState<FormData>(EMPTY);
    const [editId, setEditId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCats] = useState<SubCategory[]>([]);
    const [idTypes, setIdTypes] = useState<IDType[]>([]);
    const [records, setRecords] = useState<BioRecord[]>([]);
    const [filteredSub, setFilteredSub] = useState<SubCategory[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string; loading: boolean }>({ open: false, id: 0, name: '', loading: false });
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingPayload: FormData | null }>({ open: false, fields: [], pendingPayload: null });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const formTopRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    const [errorField, setErrorField] = useState<string | null>(null);
    const nameFieldRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const idTypeFieldRef = useRef<HTMLDivElement>(null);
    const idDetailsFieldRef = useRef<HTMLDivElement>(null);
    const idDetailsInputRef = useRef<HTMLInputElement>(null);
    const categoryFieldRef = useRef<HTMLDivElement>(null);

    // View-table filter state — category filter applies live, but the
    // name search is manual: it only runs on Enter or clicking the
    // search icon, not on every keystroke (per explicit request).
    const [filterCategoryId, setFilterCategoryId] = useState('');
    const [nameSearchInput, setNameSearchInput] = useState('');
    const [nameSearchTerm, setNameSearchTerm] = useState('');

    const runNameSearch = () => setNameSearchTerm(nameSearchInput.trim());
    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') runNameSearch();
    };
    const resetTableFilters = () => {
        setFilterCategoryId(''); setNameSearchInput(''); setNameSearchTerm('');
    };

    const filteredRecords = useMemo(() => {
        return records.filter(rec => {
            const matchesCategory = !filterCategoryId || String(rec.category_id) === filterCategoryId;
            const matchesSearch = !nameSearchTerm || rec.name.toLowerCase().includes(nameSearchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [records, filterCategoryId, nameSearchTerm]);

    const [mdPage, setMdPage] = useState(1);
    const [mdPerPage, setMdPerPage] = useState(10);
    const mdTotalPages = Math.max(1, Math.ceil(filteredRecords.length / mdPerPage));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const pagedRecords = filteredRecords.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            setFetching(true);
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found');
                setFetching(false);
                return;
            }

            const h = { headers: { Authorization: `Bearer ${token}` } };

            const [c, s, i, r] = await Promise.all([
                axiosInstance.get('categories', h),
                axiosInstance.get('sub-categories', h),
                axiosInstance.get('id-types', h),
                axiosInstance.get('bio-data', h),
            ]);

            setCategories(c.data.data || []);
            setSubCats(s.data.data || []);
            setIdTypes(i.data.data || []);
            console.log('📋 bio-data raw response:', r.data);
            console.log('📋 bio-data parsed:', r.data?.data, 'length:', r.data?.data?.length);
            setRecords(Array.isArray(r.data.data) ? r.data.data : []);

        } catch (err) {
            console.error('Fetch error:', err);
            if (err.response?.status === 401) {
                // Token expired or invalid
                sessionStorage.removeItem('token');
                // Optionally redirect to login
                // window.location.href = '/login';
            }
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (form.category_id) {
            {
                const catId = parseInt(form.category_id);
                setFilteredSub(subCategories.filter(sc =>
                    sc.category_ids?.length ? sc.category_ids.includes(catId) : sc.category_id === catId
                ));
            }
        } else {
            setFilteredSub([]);
        }
        setForm(p => ({ ...p, sub_category_id: '' }));
    }, [form.category_id, subCategories]);

    const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
        if (errorField === e.target.name) setErrorField(null);
    };

    const handleEdit = (rec: BioRecord) => {
        setForm({
            name: rec.name,
            id_type_id: rec.id_type_id ? String(rec.id_type_id) : '',
            id_details: rec.id_details || '',
            category_id: rec.category_id ? String(rec.category_id) : '',
            sub_category_id: rec.sub_category_id ? String(rec.sub_category_id) : '',
            address: rec.address || '',
            description: rec.description || '',
        });
        setEditId(rec.id);
        setFormOpen(true);
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({ open: true, id: id, name: name, loading: false });
    };
    const confirmDelete = async () => {
        const { id, name } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            await axiosInstance.delete(`/api/bio-data/${id}`, { headers: authH() });
            setDeleteModal({ open: false, id: 0, name: '', loading: false });
            setMsg(`"${name}" deleted successfully`);
            toast.warning('Record Deleted', `"${name}" moved to Recycle Bin`);
            fetchAll();
        } catch (err: any) {
            setMsg(err.response?.data?.message || 'Failed to delete');
            toast.error('Delete Failed', err.response?.data?.message || 'Could not delete record');
        }
        setDeleteModal({ open: false, id: 0, name: '', loading: false });
    };

    const handleReset = () => { setForm(EMPTY); setEditId(null); setMsg(''); setFormOpen(false); };

    const doSave = async (payload: FormData) => {
        setLoading(true); setMsg('');
        try {
            const h = { headers: authH() };
            if (editId) {
                await axiosInstance.put(`/api/bio-data/${editId}`, payload, h);
                setMsg('Party Master updated successfully!');
                toast.success('Party Master Updated!', 'Changes saved successfully');
            } else {
                await axiosInstance.post('bio-data', payload, h);
                setMsg('Party Master registered successfully!');
                toast.success('Party Master Registered!', 'New record added successfully');
            }
            handleReset();
            setTimeout(fetchAll, 300);
        } catch (err: any) {
            setMsg(err.response?.data?.message || 'Failed to save');
            toast.error('Save Failed', err.response?.data?.message || 'Could not save record');
        }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setErrorField('name');
            toast.error('Full Name is required', 'Please fill out this field to continue');
            nameFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            nameInputRef.current?.focus();
            return;
        }
        if (!form.id_type_id) {
            setErrorField('id_type_id');
            toast.error('Identification Type is required', 'Please fill out this field to continue');
            idTypeFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!form.id_details.trim()) {
            setErrorField('id_details');
            toast.error('ID Number is required', 'Please fill out this field to continue');
            idDetailsFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            idDetailsInputRef.current?.focus();
            return;
        }
        if (!form.category_id) {
            setErrorField('category_id');
            toast.error('Account Head is required', 'Please fill out this field to continue');
            categoryFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!editId) {
            const dup = records.find(r =>
                r.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
                String(r.id_type_id || '') === String(form.id_type_id) &&
                (r.id_details || '').trim().toLowerCase() === form.id_details.trim().toLowerCase()
            );
            if (dup) {
                const idTypeName = idTypes.find(it => String(it.id) === form.id_type_id)?.type_name || form.id_type_id;
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Name', value: dup.name },
                        { label: 'Identification Type', value: idTypeName },
                        { label: 'ID Details', value: dup.id_details || '' },
                        { label: 'Account Head', value: dup.category_name || '' },
                    ],
                    pendingPayload: { ...form },
                });
                return;
            }
        }
        await doSave(form);
    };

    const handleDupConfirm = async () => {
        if (dupModal.pendingPayload) {
            setDupModal(d => ({ ...d, open: false }));
            await doSave(dupModal.pendingPayload);
        }
    };

    const selIdType = idTypes.find(it => it.id === parseInt(form.id_type_id));
    const catOptions = categories.map(c => ({ value: String(c.id), label: c.name }));
    const subOptions = filteredSub.map(s => ({ value: String(s.id), label: s.name }));
    const idtOptions = idTypes.map(it => ({ value: String(it.id), label: it.type_name }));

    const stats: [string, string, number][] = [
        ['M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 'Total Records', records.length],
        ['M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0', 'Identification Types', idTypes.length],
        ['M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', 'Account Heads', categories.length],
        ['M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 'Account Sub-Heads', subCategories.length],
    ];

    return (
        <>
            <div className="ERP-page" ref={rootRef}>
                <style>{ERP_CSS}{SDD_CSS}</style>

                {/* ── HEADER START ── */}
                <div className="ERP-hdr">
                    <div className="ERP-hdr-left">
                        <div className="ERP-eyebrow">
                            <span className="ERP-eyebrow-line" />
                            <span className="ERP-eyebrow-dot" />
                            People &amp; Identity Registry
                        </div>
                        <h1 className="ERP-title MD-page-title">Party <span className="ERP-title-em">Master</span></h1>
                    </div>
                </div>
                {/* HEADER END */}

                <div className="ERP-divider" />

                {/* ── STATS CARD START ── */}
                <div className="ERP-stats">
                    {stats.map(([path, label, val], i) => (
                        <div className="ERP-stat" key={i}>
                            <div className="ERP-stat-accent" />
                            <div className="ERP-stat-label">{label}</div>
                            <div className="ERP-stat-val">{val}</div>
                        </div>
                    ))}
                </div>
                {/* STATS CARD END */}

                {/* TOOLBAR */}
                <div className="MD-toolbar-bar">
                    <div className="MD-toolbar-count"><b>{records.length}</b> Party Master record{records.length === 1 ? '' : 's'}</div>
                    <button className="MD-add-btn" onClick={() => { handleReset(); setFormOpen(true); formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                        <Ic d="M12 4v16m-8-8h16" sz={11} c="currentColor" sw={2} />
                        Add Party Master
                    </button>
                </div>

                {/* ── FORM CARD START ── */}
                {formOpen && (
                    <div className="MD-create-grid MD-inline-form">
                        <div className="ERP-form-card" ref={formTopRef}>
                            <div className="ERP-form-topbar" />
                            <div className="ERP-form-body">
                                <div className="ERP-form-hdr MD-form-hdr">
                                    <div className="ERP-form-icon-wrap MD-form-icon-wrap">
                                        <Ic d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            sz={18} c="#faf9f7" sw={1.8} />
                                    </div>
                                    <div>
                                        <div className="ERP-form-title MD-form-title">
                                            {editId ? `Edit Party Master — #${editId}` : 'Register New Party Master'}
                                        </div>
                                    </div>
                                    {editId && (
                                        <button type="button" className="MD-cancel-pill" onClick={handleReset}>
                                            <Ic d="M6 18L18 6M6 6l12 12" sz={10} c="currentColor" sw={2} />
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                                <div className="MD-form-divider" />

                                {/* FORM START */}
                                <form onSubmit={handleSubmit} noValidate>

                                    {/* Identity Start */}
                                    <div className="ERP-section MD-first-section">
                                        <span className="ERP-section-tag">01 — Identity</span>
                                        <div className="ERP-section-rule" />
                                    </div>
                                    {/* Identify End */}

                                    {/* Full Name Start */}
                                    <div className="ERP-g3">
                                        <div className={'ERP-field' + (errorField === 'name' ? ' MD-field-error' : '')} ref={nameFieldRef}>
                                            <label className="ERP-label req">
                                                Full Name
                                                <span style={{
                                                    fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 800, letterSpacing: '1px',
                                                    color: 'var(--ember)', background: 'var(--ember-ghost)', border: '1px solid var(--ember-border)',
                                                    borderRadius: 100, padding: '2px 7px', textTransform: 'uppercase',
                                                }}>ABC · Auto Caps</span>
                                            </label>
                                            <input ref={nameInputRef} className="ERP-input ERP-input-caps" type="text" name="name"
                                                value={form.name} autoComplete="off"
                                                onChange={e => {
                                                    setForm(p => ({ ...p, name: e.target.value.toUpperCase() }));
                                                    if (errorField === 'name') setErrorField(null);
                                                }}
                                                placeholder="Enter full name" />
                                            {errorField === 'name' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                        <div className={'ERP-field' + (errorField === 'id_type_id' ? ' MD-field-error' : '')} ref={idTypeFieldRef}>
                                            <SearchDD
                                                label="Identification Type" required
                                                options={idtOptions} value={form.id_type_id}
                                                onChange={v => { setForm(p => ({ ...p, id_type_id: v, id_details: '' })); if (errorField === 'id_type_id') setErrorField(null); }}
                                                placeholder="Select Identification Type..."
                                                emptyMsg="No Identification types available"
                                            />
                                            {errorField === 'id_type_id' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                        <div className={'ERP-field' + (errorField === 'id_details' ? ' MD-field-error' : '')} ref={idDetailsFieldRef}>
                                            <label className="ERP-label req">
                                                {selIdType ? `${selIdType.type_name} Number` : 'ID Number'}
                                            </label>
                                            <input ref={idDetailsInputRef} className="ERP-input" type="text" name="id_details"
                                                value={form.id_details} onChange={handle} autoComplete="off"
                                                placeholder={selIdType
                                                    ? `Enter ${selIdType.type_name} number`
                                                    : 'Select an Identification type first'}
                                                disabled={!form.id_type_id} />
                                            {errorField === 'id_details' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Full Name End */}

                                    {/* 02 — Classification */}
                                    <div className="ERP-section">
                                        <span className="ERP-section-tag">02 — Classification</span>
                                        <div className="ERP-section-rule" />
                                    </div>
                                    <div className="ERP-g2">
                                        {/* Category Start */}

                                        <div className={'ERP-field' + (errorField === 'category_id' ? ' MD-field-error' : '')} ref={categoryFieldRef}>
                                            <SearchDD
                                                label="Account Head" required
                                                options={catOptions} value={form.category_id}
                                                onChange={v => { setForm(p => ({ ...p, category_id: v })); if (errorField === 'category_id') setErrorField(null); }}
                                                placeholder="Select Account Head..."
                                                emptyMsg="No categories available"
                                            />
                                            {errorField === 'category_id' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                        {/* Category End */}

                                        {/* Sub Category Start */}
                                        <div className="ERP-field">
                                            <SearchDD
                                                label="Account Sub-Head" optional
                                                options={subOptions} value={form.sub_category_id}
                                                onChange={v => setForm(p => ({ ...p, sub_category_id: v }))}
                                                placeholder={!form.category_id ? 'Select an account head first' : 'Select Account Sub-Head...'}
                                                disabled={!form.category_id}
                                                emptyMsg="No sub-categories for this category"
                                            />
                                        </div>
                                        {/* Sub Category End */}
                                    </div>

                                    {/* 03 — Additional Info */}
                                    <div className="ERP-section">
                                        <span className="ERP-section-tag">03 — Additional Info</span>
                                        <div className="ERP-section-rule" />
                                    </div>
                                    {/* Additional Info End */}

                                    {/* Address Start */}
                                    <div className="ERP-g1">
                                        <div className="ERP-field">
                                            <label className="ERP-label">
                                                Address <span className="ERP-label-opt">(optional)</span>
                                            </label>
                                            <input className="ERP-input" type="text" name="address"
                                                value={form.address} autoComplete="off" onChange={handle}
                                                placeholder="Enter address" />
                                        </div>
                                        <div className="ERP-field">
                                            <label className="ERP-label">
                                                Description / Notes <span className="ERP-label-opt">(optional)</span>
                                            </label>
                                            <textarea className="ERP-textarea" name="description"
                                                value={form.description} autoComplete="off" onChange={handle}
                                                placeholder="Additional notes or remarks..." />
                                        </div>
                                    </div>
                                    {/* Address End */}

                                    {/* Required Field Must Be Completed Start */}
                                    <div className="ERP-req-note">
                                        <span className="ERP-req-star">*</span>
                                        Required fields must be completed before submitting
                                    </div>
                                    {/* Required Field Must Be Completed End */}

                                    <div className="ERP-btn-row">
                                        <button type="submit" className="ERP-btn primary" disabled={loading}>
                                            {loading
                                                ? <><span className="ERP-spinner" /> Saving...</>
                                                : <><Ic d="M5 13l4 4L19 7" sz={13} c="#faf9f7" sw={2.2} />
                                                    {editId ? 'Save Changes' : 'Register Party Master'}</>}
                                        </button>
                                        <button type="button" className="ERP-btn secondary"
                                            onClick={handleReset} disabled={loading}>
                                            Cancel
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>

                        {/* LIVE PREVIEW — right side */}
                        <div className="MD-preview-card">
                            <div className="MD-preview-head">
                                <span className="MD-preview-head-dot" />
                                <span className="MD-preview-head-txt">Live Preview</span>
                            </div>
                            <div className="MD-preview-body">
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M7 8h10M7 12h10M7 16h6" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Name</span>
                                        <span className={'MD-preview-val' + (form.name.trim() ? '' : ' empty')}>
                                            {form.name.trim() || 'Not entered yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M4 6h16M4 12h16M4 18h7" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Identification Type</span>
                                        <span className={'MD-preview-val' + (form.id_type_id ? '' : ' empty')}>
                                            {form.id_type_id ? (idTypes.find(it => String(it.id) === form.id_type_id)?.type_name || '—') : 'Not selected yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M4 6h16M4 12h16M4 18h7" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">ID Details</span>
                                        <span className={'MD-preview-val' + (form.id_details.trim() ? '' : ' empty')}>
                                            {form.id_details.trim() || 'None'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Account Head</span>
                                        <span className={'MD-preview-val' + (form.category_id ? '' : ' empty')}>
                                            {form.category_id ? (categories.find(c => String(c.id) === form.category_id)?.name || '—') : 'Not selected yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Account Sub-Head</span>
                                        <span className={'MD-preview-val' + (form.sub_category_id ? '' : ' empty')}>
                                            {form.sub_category_id ? (subCategories.find(s => String(s.id) === form.sub_category_id)?.name || '—') : 'Not selected yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Address</span>
                                        <span className={'MD-preview-val' + (form.address.trim() ? '' : ' empty')}>
                                            {form.address.trim() || 'No address'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="MD-preview-foot">Updates live as you type</div>
                        </div>
                    </div>
                )}

                {/* ── TABLE CARD START ── */}
                <div className="ERP-tbl-card MD-tbl-card">
                        {/* Filter Bar Start */}
                        <div className="MD-tbl-filter-bar">
                            <div className="MD-tbl-filter-item" style={{ minWidth: 220 }}>
                                <span className="MD-tbl-filter-lbl">Filter by Account Head</span>
                                <SearchDD
                                    options={[{ value: '', label: 'All Account Heads' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                                    value={filterCategoryId}
                                    onChange={setFilterCategoryId}
                                    placeholder="All Account Heads"
                                />
                            </div>
                            <div className="MD-tbl-filter-item">
                                <span className="MD-tbl-filter-lbl">Search by Name</span>
                                <div className="MD-tbl-search-row">
                                    <input
                                        className="MD-tbl-search-input"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Type a name, then press Enter or tap search..."
                                        value={nameSearchInput}
                                        onChange={e => setNameSearchInput(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                    />
                                    <button type="button" className="MD-tbl-search-btn" title="Search" onClick={runNameSearch}>
                                        <Ic d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" sz={14} c="#faf9f7" sw={2.2} />
                                    </button>
                                </div>
                            </div>
                            {(filterCategoryId || nameSearchTerm) && (
                                <button type="button" className="MD-tbl-reset-pill" onClick={resetTableFilters}>
                                    <Ic d="M6 18L18 6M6 6l12 12" sz={10} c="currentColor" sw={2} />
                                    Clear Filters
                                </button>
                            )}
                        </div>
                        {/* Filter Bar End */}

                        {/* Fetching Start */}
                        {fetching ? (
                            <RunningLoader label="Loading Party Records" />
                        ) : records.length === 0 ? (
                            <div className="ERP-empty">
                                <div className="ERP-empty-icon">
                                    <Ic d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        sz={26} c="var(--ember)" sw={1.8} />
                                </div>
                                <div className="ERP-empty-title">No Records Yet</div>
                                <div className="ERP-empty-sub">Add the first party master entry using the button above</div>
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="ERP-empty">
                                <div className="ERP-empty-icon">
                                    <Ic d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" sz={26} c="var(--ember)" sw={1.8} />
                                </div>
                                <div className="ERP-empty-title">No Matching Records</div>
                                <div className="ERP-empty-sub">Try a different account head or search term</div>
                            </div>
                        ) : (

                            <div className="ERP-tbl-scroll">
                                <table className="ERP-tbl">

                                    {/* Thead Start */}
                                    <thead>
                                        <tr>
                                            <th className="ERP-center" style={{ width: 52 }}>No.</th>
                                            <th>Name</th>
                                            <th>Identification Type</th>
                                            <th>ID Number</th>
                                            <th>Account Head</th>
                                            <th>Account Sub-Head</th>
                                            <th>Address</th>
                                            <th>Added By</th>
                                            <th className="ERP-center" style={{ width: 180 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    {/* Thead End */}

                                    {/* Tbody Start */}
                                    <tbody>
                                        {pagedRecords.map((rec, i) => (
                                            <tr key={rec.id}
                                                style={editId === rec.id ? { background: 'rgba(37,99,235,0.06)' } : {}}>
                                                <td className="ERP-t-num ERP-center">{(mdSafePage - 1) * mdPerPage + i + 1}</td>
                                                <td className="ERP-t-primary">{rec.name}</td>
                                                <td>
                                                    {rec.id_type_name
                                                        ? <span className="MD-tbl-tag ember">{rec.id_type_name}</span>
                                                        : <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td>
                                                    {rec.id_details
                                                        ? <span className="MD-tbl-tag muted">{rec.id_details}</span>
                                                        : <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td>
                                                    {rec.category_name
                                                        ? <span className="MD-tbl-tag info">{rec.category_name}</span>
                                                        : <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td>
                                                    {rec.sub_category_name
                                                        ? <span className="MD-tbl-tag warn">{rec.sub_category_name}</span>
                                                        : <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td>
                                                    {rec.address
                                                        ? <span className="ERP-t-desc">{rec.address}</span>
                                                        : <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td className="ERP-t-creator">
                                                    {rec.created_by_name || <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td className="ERP-center ERP-nowrap">
                                                    <button className="MD-act-ico edit" title="Edit" onClick={() => handleEdit(rec)}>Edit</button>
                                                    {canDelete(userRole) && (
                                                        <button className="MD-act-ico delete" title="Delete" onClick={() => handleDelete(rec.id, rec.name)}>Delete</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!fetching && filteredRecords.length > 0 && (
                            <Pagination
                                page={mdSafePage}
                                totalPages={mdTotalPages}
                                onPageChange={setMdPage}
                                total={filteredRecords.length}
                                perPage={mdPerPage}
                                onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                                itemLabel="records"
                            />
                        )}
                </div>
            </div>
            <ConfirmDeleteModal
                open={deleteModal.open}
                itemName={deleteModal.name}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: 0, name: '', loading: false })}
                loading={deleteModal.loading}
            />
            <DuplicateWarningModal
                open={dupModal.open}
                entityName="Party Master"
                duplicateFields={dupModal.fields}
                onAddAnyway={handleDupConfirm}
                onCancel={() => setDupModal({ open: false, fields: [], pendingPayload: null })}
                loading={loading}
            />
        </>
    );
}
