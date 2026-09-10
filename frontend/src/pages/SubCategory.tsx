import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import RunningLoader from '../components/RunningLoader';
import Pagination from '../components/Pagination';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Ic } from '../components/Icon';
import { ERP_CSS } from './ERPTheme';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import { getStoredRole, canDelete } from '../utils/roleAccess';

const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return data as T;
    } catch { return null; }
}

function setCached(key: string, data: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch { }
}

const CACHE_CATS = 'erp_cache_categories';
const CACHE_SUBS = 'erp_cache_sub_categories';

interface DDOption { value: string; label: string; }
interface DDProps {
    options: DDOption[]; value: string; onChange: (v: string) => void;
    placeholder: string; disabled?: boolean; emptyMsg?: string;
}

interface SubCategory {
    id: number; category_id: number; name: string;
    description?: string; additional_field?: string;
    is_active: boolean; created_by_name?: string;
}

interface Category { id: number; name: string; }

interface FormData {
    category_id: string; name: string; description: string;
    additional_field: string; is_active: boolean;
}

function DD({ options, value, onChange, placeholder, disabled = false, emptyMsg = 'No options available' }: DDProps) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const sel = options.find(o => o.value === value);
    return (
        <>
            <div className="ERP-dd" ref={ref}>
                <button type="button" ref={triggerRef}
                    className={`ERP-dd-trigger${!sel ? ' ph' : ''}${open ? ' open' : ''}${disabled ? ' dis' : ''}`}
                    onClick={() => !disabled && setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
                    {sel
                        ? <span className="ERP-dd-chip"><span className="ERP-dd-chip-dot" />{sel.label}</span>
                        : <span>{placeholder}</span>}
                    <svg className={`ERP-dd-chevron${open ? ' open' : ''}`} viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                {open && (
                    <div className="ERP-dd-panel" ref={panelRef}>
                        <div role="option" tabIndex={-1} aria-selected={!value} className={`ERP-dd-item${!value ? ' sel' : ''}`}
                            onClick={() => { onChange(''); setOpen(false); }}>
                            <span className="ERP-dd-item-ph">{placeholder}</span>
                            {!value && <span className="ERP-dd-item-check">✓</span>}
                        </div>
                        {options.length === 0
                            ? <div className="ERP-dd-empty">{emptyMsg}</div>
                            : options.map(opt => (
                                <div key={opt.value}
                                    role="option" tabIndex={-1} aria-selected={value === opt.value}
                                    className={`ERP-dd-item${value === opt.value ? ' sel' : ''}`}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}>
                                    <span>{opt.label}</span>
                                    {value === opt.value && <span className="ERP-dd-item-check">✓</span>}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </>
    );
}

const SkeletonRow = () => (
    <tr>
        {[40, 160, 130, 180, 80, 100, 140].map((w, i) => (
            <td key={i} style={{ padding: '14px 16px' }}>
                <div style={{
                    height: 13, borderRadius: 6, width: w,
                    background: 'linear-gradient(90deg,#E9EEF5 25%,#DBEAFE 50%,#E9EEF5 75%)',
                    backgroundSize: '400px 100%',
                    animation: 'erp-shimmer 1.4s infinite linear',
                }} />
            </td>
        ))}
    </tr>
);

export default function SubCategory() {
    const [userRole] = useState<string>(() => getStoredRole());
    const emptyForm = (): FormData => ({
        category_id: '', name: '', description: '', additional_field: '', is_active: true,
    });

    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string; loading: boolean }>({ open: false, id: 0, name: '', loading: false });
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingData: typeof formData | null }>({ open: false, fields: [], pendingData: null });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [errorField, setErrorField] = useState<string | null>(null);
    const [mdPage, setMdPage] = useState(1);
    const [mdPerPage, setMdPerPage] = useState(10);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    const categoryFieldRef = useRef<HTMLDivElement>(null);
    const nameFieldRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Category[]>(() =>
        getCached<Category[]>(CACHE_CATS) || []
    );

    const [subCategories, setSubCategories] = useState<SubCategory[]>(() =>
        getCached<SubCategory[]>(CACHE_SUBS) || []
    );

    const [fetching, setFetching] = useState(() =>
        getCached<SubCategory[]>(CACHE_SUBS) === null
    );

    useEffect(() => {
        const fetchPromises = [];
        if (!getCached<Category[]>(CACHE_CATS)) {
            fetchPromises.push(fetchCategories());
        }
        if (!getCached<SubCategory[]>(CACHE_SUBS)) {
            fetchPromises.push(syncSubCategories());
        } else {
            syncSubCategories(true);
        }
        if (fetchPromises.length > 0) {
            Promise.all(fetchPromises);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get('categories', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            });
            const fresh: Category[] = res.data.data || [];
            setCategories(fresh);
            setCached(CACHE_CATS, fresh);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    }, []);

    const syncSubCategories = useCallback(async (silent = false) => {
        const cached = getCached<SubCategory[]>(CACHE_SUBS);
        if (!cached && !silent) {
            setFetching(true);
        } else if (cached && !silent) {
            setSyncing(true);
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get('sub-categories', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000,
            });
            const fresh: SubCategory[] = res.data.data || [];
            setSubCategories(fresh);
            setCached(CACHE_SUBS, fresh);
        } catch (err) {
            console.error('Failed to fetch sub-categories:', err);
        } finally {
            setFetching(false);
            setSyncing(false);
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!fetching && subCategories.length > 0) {
                syncSubCategories(true);
                fetchCategories();
            }
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetching, subCategories.length, syncSubCategories, fetchCategories]);

    const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
        if (errorField === e.target.name) setErrorField(null);
    };

    const handleEdit = useCallback((sc: SubCategory) => {
        setEditId(sc.id);
        setFormData({
            category_id: sc.category_id.toString(),
            name: sc.name,
            description: sc.description || '',
            additional_field: sc.additional_field || '',
            is_active: sc.is_active,
        });
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditId(null);
        setFormData(emptyForm());
        setMessage('');
        setFormOpen(false);
    }, []);

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({ open: true, id: id, name: name, loading: false });
    };

    const confirmDelete = useCallback(async () => {
        const { id, name } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete(`/api/sub-categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            });
            setSubCategories(prev => prev.filter(s => s.id !== id));
            localStorage.removeItem(CACHE_SUBS);
            setDeleteModal({ open: false, id: 0, name: '', loading: false });
            setMessage(`"${name}" moved to Recycle Bin`);
            setTimeout(() => setMessage(''), 3000);
            toast.warning('Account Sub-Head Deleted', `"${name}" moved to Recycle Bin`);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to delete';
            setMessage(`Error: ${msg}`);
            setDeleteModal({ open: false, id: 0, name: '', loading: false });
            setTimeout(() => setMessage(''), 5000);
            toast.error('Delete Failed', msg);
        }
    }, [deleteModal]);

    const doSaveSub = useCallback(async (data: typeof formData) => {
        setLoading(true);
        setMessage('');
        const originalSubCategories = [...subCategories];
        const originalEditId = editId;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            if (editId) {
                const response = await axiosInstance.put(`/api/sub-categories/${editId}`, data, { headers });
                const updatedItem = response.data.data || response.data;
                setSubCategories(prev => prev.map(s => s.id === editId ? updatedItem : s));
                setMessage('Account Sub-Head updated successfully!');
                toast.success('Account Sub-Head Updated!', `"${data.name}" saved successfully`);
                setEditId(null);
            } else {
                const response = await axiosInstance.post('sub-categories', data, { headers });
                const newItem = response.data.data || response.data;
                setSubCategories(prev => [newItem, ...prev]);
                setMessage('Account Sub-Head created successfully!');
                toast.success('Account Sub-Head Created!', `"${data.name}" added successfully`);
            }
            setFormData(emptyForm());
            setCached(CACHE_SUBS, subCategories);
            syncSubCategories(true);
            setFormOpen(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setSubCategories(originalSubCategories);
            setCached(CACHE_SUBS, originalSubCategories);
            setEditId(originalEditId);
            setMessage(err.response?.data?.message || 'Failed to save account sub-head');
            toast.error('Save Failed', err.response?.data?.message || 'Could not save account sub-head');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, editId, subCategories, syncSubCategories]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_id) {
            setErrorField('category_id');
            toast.error('Parent Account Head is required', 'Please fill out this field to continue');
            categoryFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!formData.name.trim()) {
            setErrorField('name');
            toast.error('Account Sub-Head Name is required', 'Please fill out this field to continue');
            nameFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            nameInputRef.current?.focus();
            return;
        }

        if (!editId) {
            const dup = subCategories.find(s =>
                s.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
                String(s.category_id) === String(formData.category_id)
            );
            if (dup) {
                const catName = categories.find(c => c.id === dup.category_id)?.name || String(dup.category_id);
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Name', value: dup.name },
                        { label: 'Account Head', value: catName },
                    ],
                    pendingData: { ...formData },
                });
                return;
            }
        }

        await doSaveSub(formData);
    }, [formData, editId, subCategories, categories, doSaveSub]);

    const handleDupConfirm = async () => {
        if (dupModal.pendingData) {
            setDupModal(d => ({ ...d, open: false }));
            await doSaveSub(dupModal.pendingData);
        }
    };

    const getCategoryName = useCallback((id: number) =>
        categories.find(c => c.id === id)?.name || '—', [categories]
    );

    const activeCount = subCategories.filter(s => s.is_active).length;

    const mdTotalPages = Math.max(1, Math.ceil(subCategories.length / mdPerPage));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const pagedSubCategories = subCategories.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);

    return (
        <>
            <div className="ERP-page" ref={rootRef}>
                <style>{ERP_CSS}</style>

                {syncing && (
                    <div style={{
                        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                        background: '#0F172A', color: '#60A5FA',
                        padding: '6px 14px', borderRadius: 100,
                        fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        animation: 'fadeInUp 0.2s ease',
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#60A5FA',
                            animation: 'pulse 1s infinite',
                        }} />
                        Syncing...
                    </div>
                )}

                {/* HEADER START */}
                <div className="ERP-hdr">
                    <div className="ERP-hdr-left">
                        <div className="ERP-eyebrow">
                            <span className="ERP-eyebrow-line" />
                            <span className="ERP-eyebrow-dot" />
                            Configuration &amp; Setup
                        </div>
                        <h1 className="ERP-title MD-page-title">Account <span className="ERP-title-em">Sub-Heads</span></h1>
                    </div>
                </div>
                {/* HEADER END */}

                <div className="ERP-divider" />

                {/* STATS - Using Memoized Values Start */}
                <div className="ERP-stats">
                    {[
                        ['M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', 'Total Account Sub-Heads', subCategories.length],
                        ['M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 'Parent Account Heads', categories.length],
                        ['M5 13l4 4L19 7', 'Active', activeCount],
                    ].map(([path, label, val], i) => (
                        <div className="ERP-stat" key={i}>
                            <div className="ERP-stat-accent" />
                            <div className="ERP-stat-label">{label}</div>
                            <div className="ERP-stat-val">{val}</div>
                        </div>
                    ))}
                </div>

                {/* TOOLBAR */}
                <div className="MD-toolbar-bar">
                    <div className="MD-toolbar-count"><b>{subCategories.length}</b> Account Sub-Head{subCategories.length === 1 ? '' : 's'}</div>
                    <button className="MD-add-btn" onClick={() => { setEditId(null); setFormData(emptyForm()); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Ic d="M12 4v16m-8-8h16" sz={11} c="currentColor" sw={2} />
                        Add Account Sub-Head
                    </button>
                </div>
                {/* STATS - Using Memorized Values End */}

                {/* FORM Start */}
                {formOpen && (
                    <div className="MD-create-grid MD-inline-form">
                        <div className="ERP-form-card">
                            <div className="ERP-form-topbar" />
                            <div className="ERP-form-body">

                                <div className="ERP-form-hdr MD-form-hdr">
                                    <div className="ERP-form-icon-wrap MD-form-icon-wrap">
                                        <Ic d={editId
                                            ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                            : 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'}
                                            sz={18} c="#fff" sw={1.8} />
                                    </div>
                                    <div>
                                        <div className="ERP-form-title MD-form-title">
                                            {editId ? 'Edit Account Sub-Head' : 'Add New Account Sub-Head'}
                                        </div>
                                    </div>
                                    {editId && (
                                        <button type="button" className="MD-cancel-pill" onClick={handleCancelEdit}>
                                            <Ic d="M6 18L18 6M6 6l12 12" sz={10} c="currentColor" sw={2} />
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                                <div className="MD-form-divider" />

                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="ERP-section MD-first-section">
                                        <span className="ERP-section-tag">01 — Classification</span>
                                        <div className="ERP-section-rule" />
                                    </div>

                                    <div className="ERP-g3">
                                        <div className={'ERP-field' + (errorField === 'category_id' ? ' MD-field-error' : '')} ref={categoryFieldRef}>
                                            <label className="ERP-label req">Parent Account Head</label>
                                            <DD
                                                options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                                                value={formData.category_id}
                                                onChange={v => { setFormData(p => ({ ...p, category_id: v })); if (errorField === 'category_id') setErrorField(null); }}
                                                placeholder="Select Parent Account Head..."
                                                emptyMsg="No account heads found"
                                            />
                                            {errorField === 'category_id' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                        <div className={'ERP-field' + (errorField === 'name' ? ' MD-field-error' : '')} ref={nameFieldRef}>
                                            <label className="ERP-label req">Account Sub-Head Name</label>
                                            <input ref={nameInputRef} className="ERP-input" type="text" name="name"
                                                value={formData.name} onChange={handle}
                                                placeholder="e.g., Plumbing Services" autoComplete="off" />
                                            {errorField === 'name' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                        <div className="ERP-field">
                                            <label className="ERP-label req">Status</label>
                                            <DD
                                                options={[
                                                    { value: 'true', label: 'Active' },
                                                    { value: 'false', label: 'Inactive' },
                                                ]}
                                                value={formData.is_active ? 'true' : 'false'}
                                                onChange={v => setFormData(p => ({ ...p, is_active: v === 'true' }))}
                                                placeholder="Select Status..."
                                            />
                                        </div>
                                    </div>

                                    <div className="ERP-section">
                                        <span className="ERP-section-tag">02 — Additional Info</span>
                                        <div className="ERP-section-rule" />
                                    </div>

                                    <div className="ERP-g2">
                                        <div className="ERP-field">
                                            <label className="ERP-label">
                                                Description
                                                <span className="ERP-label-opt">(optional)</span>
                                            </label>
                                            <textarea className="ERP-textarea" name="description"
                                                value={formData.description} onChange={handle}
                                                autoComplete="off" placeholder="Describe this account sub-head…" />
                                        </div>
                                        <div className="ERP-field">
                                            <label className="ERP-label">
                                                Additional Fields
                                                <span className="ERP-label-opt">(optional)</span>
                                            </label>
                                            <textarea className="ERP-textarea" name="additional_field"
                                                value={formData.additional_field} onChange={handle}
                                                autoComplete="off" placeholder="Any additional information…" />
                                        </div>
                                    </div>

                                    <div className="ERP-req-note">
                                        <span className="ERP-req-star">*</span>
                                        Parent Account Head and Name are required
                                    </div>

                                    <div className="ERP-btn-row">
                                        <button type="submit" className="ERP-btn primary" disabled={loading}>
                                            {loading
                                                ? <><span className="ERP-spinner" /> {editId ? 'Updating…' : 'Creating…'}</>
                                                : <><Ic d="M5 13l4 4L19 7" sz={13} c="#fff" sw={2.2} /> {editId ? 'Update Account Sub-Head' : 'Create Account Sub-Head'}</>}
                                        </button>
                                        <button type="button" className="ERP-btn secondary"
                                            onClick={handleCancelEdit} disabled={loading}>
                                            {'Cancel'}
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
                                    <span className="MD-preview-ico"><Ic d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Parent Account Head</span>
                                        <span className={'MD-preview-val' + (formData.category_id ? '' : ' empty')}>
                                            {formData.category_id ? getCategoryName(Number(formData.category_id)) : 'Not selected yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M7 8h10M7 12h10M7 16h6" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Name</span>
                                        <span className={'MD-preview-val' + (formData.name.trim() ? '' : ' empty')}>
                                            {formData.name.trim() || 'Not entered yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M4 6h16M4 12h16M4 18h7" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Additional Field</span>
                                        <span className={'MD-preview-val' + (formData.additional_field.trim() ? '' : ' empty')}>
                                            {formData.additional_field.trim() || 'None'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M5 13l4 4L19 7" sz={13} c="currentColor" sw={2.2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Status</span>
                                        <span className="MD-preview-val">
                                            <span className={`ERP-badge ${formData.is_active ? 'active' : 'inactive'}`}>
                                                <span className="ERP-badge-dot" />
                                                {formData.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M4 6h16M4 12h16M4 18h7" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Description</span>
                                        <span className={'MD-preview-val' + (formData.description.trim() ? '' : ' empty')}>
                                            {formData.description.trim() || 'No description'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="MD-preview-foot">Updates live as you type</div>
                        </div>
                    </div>
                )}
                {/* FORM End */}

                {/* TABLE with skeleton Loader Start */}
                <div className="ERP-tbl-card MD-tbl-card">

                        {fetching ? (
                            <RunningLoader label="Loading Account Sub-Heads" />
                        ) : subCategories.length === 0 ? (
                            <div className="ERP-empty">
                                <div className="ERP-empty-icon">
                                    <Ic d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" sz={26} c="var(--ember-light)" sw={1.8} />
                                </div>
                                <div className="ERP-empty-title">No Account Sub-Heads Yet</div>
                                <div className="ERP-empty-sub">Add the first account sub-head using the button above</div>
                            </div>
                        ) : (
                            <div className="ERP-tbl-scroll">
                                <table className="ERP-tbl">
                                    <thead>
                                        <tr>
                                            <th className="ERP-center" style={{ width: 52 }}>SNo.</th>
                                            <th>Name</th>
                                            <th>Parent Account Head</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Created By</th>
                                            <th className="ERP-center" style={{ width: 180 }}>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pagedSubCategories.map((sc, i) => (
                                            <tr key={sc.id}
                                                style={editId === sc.id ? {
                                                    background: 'rgba(37,99,235,0.06)',
                                                    outline: '2px solid rgba(37,99,235,0.3)',
                                                } : {}}>
                                                <td className="ERP-t-num ERP-center">{(mdSafePage - 1) * mdPerPage + i + 1}</td>
                                                <td className="ERP-t-primary">{sc.name}</td>
                                                <td>
                                                    <span className="MD-tbl-tag info">{getCategoryName(sc.category_id)}</span>
                                                </td>
                                                <td>
                                                    {sc.description
                                                        ? <span className="ERP-t-desc">{sc.description}</span>
                                                        : <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td>
                                                    <span className={`MD-tbl-tag ${sc.is_active ? 'info' : 'muted'}`}>
                                                        {sc.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="ERP-t-creator">
                                                    {sc.created_by_name || <span className="ERP-t-null">—</span>}
                                                </td>
                                                <td className="ERP-center ERP-nowrap">
                                                    <button className="MD-act-ico edit" title="Edit" onClick={() => handleEdit(sc)}>
                                                        <Ic d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" sz={13} c="currentColor" sw={1.8} />
                                                    </button>
                                                    {canDelete(userRole) && (
                                                        <button className="MD-act-ico delete" title="Delete" onClick={() => handleDelete(sc.id, sc.name)}>
                                                            <Ic d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" sz={13} c="currentColor" sw={1.8} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!fetching && subCategories.length > 0 && (
                            <Pagination
                                page={mdSafePage}
                                totalPages={mdTotalPages}
                                onPageChange={setMdPage}
                                total={subCategories.length}
                                perPage={mdPerPage}
                                onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                                itemLabel="account sub-heads"
                            />
                        )}
                </div>
            </div>
            {/* TABLE END */}
            <ConfirmDeleteModal
                open={deleteModal.open}
                itemName={deleteModal.name}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, id: 0, name: '', loading: false })}
                loading={deleteModal.loading}
            />
            <DuplicateWarningModal
                open={dupModal.open}
                entityName="Account Sub-Head"
                duplicateFields={dupModal.fields}
                onAddAnyway={handleDupConfirm}
                onCancel={() => setDupModal({ open: false, fields: [], pendingData: null })}
                loading={loading}
            />
        </>
    );
}
