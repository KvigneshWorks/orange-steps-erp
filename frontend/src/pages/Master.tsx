import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import RunningLoader from '../components/RunningLoader';
import Pagination from '../components/Pagination';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useEffect, useRef, useState } from 'react';
import { Ic } from '../components/Icon';
import { ERP_CSS } from './ERPTheme';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import { getStoredRole, canDelete } from '../utils/roleAccess';

interface Category {
    id: number;
    name: string;
    description?: string;
    type: 'income' | 'expense';
    is_active: boolean;
    created_by_name?: string;
}

interface FormData {
    name: string;
    description: string;
    type: 'income' | 'expense';
    is_active: boolean;
}

const CACHE_KEY = 'erp_cache_categories';
const CACHE_TTL = 5 * 60 * 1000;

function getCached(): Category[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
        return data;
    } catch { return null; }
}

function setCached(data: Category[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* localStorage full — ignore */ }
}

function clearCached() {
    localStorage.removeItem(CACHE_KEY);
}

interface DDOption { value: string; label: string; }
interface DDProps {
    options: DDOption[];
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    disabled?: boolean;
    emptyMsg?: string;
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
                <button
                    type="button"
                    ref={triggerRef}
                    className={`ERP-dd-trigger${!sel ? ' ph' : ''}${open ? ' open' : ''}${disabled ? ' dis' : ''}`}
                    onClick={() => !disabled && setOpen(o => !o)}
                    onKeyDown={onTriggerKeyDown}
                >
                    {sel ? (
                        <span className="ERP-dd-chip">
                            <span className="ERP-dd-chip-dot" />
                            {sel.label}
                        </span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <svg className={`ERP-dd-chevron${open ? ' open' : ''}`} viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {open && (
                    <div className="ERP-dd-panel" ref={panelRef}>
                        <div role="option" tabIndex={-1} aria-selected={!value} className={`ERP-dd-item${!value ? ' sel' : ''}`} onClick={() => { onChange(''); setOpen(false); }}>
                            <span className="ERP-dd-item-ph">{placeholder}</span>
                            {!value && <span className="ERP-dd-item-check">✓</span>}
                        </div>
                        {options.length === 0
                            ? <div className="ERP-dd-empty">{emptyMsg}</div>
                            : options.map(opt => (
                                <div key={opt.value} role="option" tabIndex={-1} aria-selected={value === opt.value} className={`ERP-dd-item${value === opt.value ? ' sel' : ''}`}
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

export const MASTER_CSS = ERP_CSS;

function SkeletonRow() {
    return (
        <tr>
            {[52, 140, 70, 160, 90, 80, 100, 140].map((w, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <div style={{
                        height: 13, borderRadius: 6, width: w,
                        background: 'linear-gradient(90deg,#E8E2D8 25%,#FBC9A8 50%,#E8E2D8 75%)',
                        backgroundSize: '400px 100%',
                        animation: 'erp-shimmer 1.4s infinite linear',
                    }} />
                </td>
            ))}
        </tr>
    );
}

export default function Master() {
    const [userRole] = useState<string>(() => getStoredRole());
    const [formData, setFormData] = useState<FormData>({
        name: '', description: '', type: 'expense', is_active: true,
    });
    const [categories, setCategories] = useState<Category[]>(() => {
        return getCached() || [];
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(() => getCached() === null);
    const [mdPage, setMdPage] = useState(1);
    const [mdPerPage, setMdPerPage] = useState(10);
    const [syncing, setSyncing] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string; loading: boolean }>({ open: false, id: 0, name: '', loading: false });
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingData: typeof formData | null }>({ open: false, fields: [], pendingData: null });
    const [formOpen, setFormOpen] = useState(false);
    const [errorField, setErrorField] = useState<string | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    const nameFieldRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (silent = false) => {
        const cached = getCached();
        if (cached && !silent) {
            setSyncing(true);
        } else if (!cached) {
            setFetching(true);
        }
        try {
            const token = sessionStorage.getItem('token');
            const res = await axiosInstance.get('categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fresh: Category[] = res.data.data || [];
            setCategories(fresh);
            setCached(fresh);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setFetching(false);
            setSyncing(false);
        }
    };

    const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
        if (errorField === e.target.name) setErrorField(null);
    };

    const handleEdit = (cat: Category) => {
        setEditId(cat.id);
        setFormData({
            name: cat.name,
            description: cat.description || '',
            type: cat.type,
            is_active: cat.is_active,
        });
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setFormData({ name: '', description: '', type: 'expense', is_active: true });
        setMessage('');
        setFormOpen(false);
    };

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({ open: true, id, name, loading: false });
    };

    const confirmDelete = async () => {
        const { id, name } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            const token = sessionStorage.getItem('token');
            await axiosInstance.delete(`/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(prev => prev.filter(c => c.id !== id));
            setCached(categories.filter(c => c.id !== id));
            setMessage(`"${name}" moved to Recycle Bin`);
            setTimeout(() => setMessage(''), 3000);
            toast.warning('Account Head Deleted', `"${name}" moved to Recycle Bin`);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to delete';
            setMessage(`Error: ${msg}`);
            setTimeout(() => setMessage(''), 5000);
            toast.error('Delete Failed', msg);
        }
        setDeleteModal({ open: false, id: 0, name: '', loading: false });
    };

    const doSave = async (data: typeof formData) => {
        setLoading(true);
        setMessage('');
        try {
            const token = sessionStorage.getItem('token');
            let finalData = { ...data };
            let response;
            if (editId) {
                response = await axiosInstance.put(`/api/categories/${editId}`, finalData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const updatedCategory = response.data.data || response.data;
                const updatedList = categories.map(c => c.id === editId ? updatedCategory : c);
                setCategories(updatedList);
                setCached(updatedList);
                setMessage('Account Head updated successfully!');
                toast.success('Account Head Updated!', `"${data.name}" saved successfully`);
                setEditId(null);
            } else {
                response = await axiosInstance.post('categories', finalData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newCategory = response.data.data || response.data;
                const updatedList = [newCategory, ...categories];
                setCategories(updatedList);
                setCached(updatedList);
                setMessage('Account Head created successfully!');
                toast.success('Account Head Created!', `"${data.name}" added successfully`);
            }
            setFormData({ name: '', description: '', type: 'expense', is_active: true });
            setFormOpen(false);
            fetchCategories(true);
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to save account head');
            toast.error('Save Failed', err.response?.data?.message || 'Could not save account head');
            fetchCategories(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setErrorField('name');
            toast.error('Account Head Name is required', 'Please fill out this field to continue');
            nameFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            nameInputRef.current?.focus();
            return;
        }
        if (!formData.type) {
            setMessage('Please fill all required fields');
            return;
        }

        if (!editId) {
            const dup = categories.find(c =>
                c.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
                c.type === formData.type
            );
            if (dup) {
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Name', value: dup.name },
                        { label: 'Type', value: dup.type.charAt(0).toUpperCase() + dup.type.slice(1) },
                        { label: 'Description', value: dup.description || '' },
                    ],
                    pendingData: { ...formData },
                });
                return;
            }
        }
        await doSave(formData);
    };

    const handleDupConfirm = async () => {
        if (dupModal.pendingData) {
            setDupModal(d => ({ ...d, open: false }));
            await doSave(dupModal.pendingData);
        }
    };
    const expenseCount = categories.filter(c => c.type === 'expense').length;
    const incomeCount = categories.filter(c => c.type === 'income').length;
    const activeCount = categories.filter(c => c.is_active).length;

    const mdTotalPages = Math.max(1, Math.ceil(categories.length / mdPerPage));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const pagedCategories = categories.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);

    return (
        <div className="ERP-page" ref={rootRef}>
            <style>{ERP_CSS}</style>

            {syncing && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    background: '#231C14', color: '#F0834D',
                    padding: '8px 16px', borderRadius: 100,
                    fontSize: 9.5, fontFamily: 'monospace', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    animation: 'erp-slide-up 0.2s ease',
                }}>
                    <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        border: '2px solid rgba(191,219,254,0.3)',
                        borderTopColor: '#F0834D',
                        display: 'inline-block',
                        animation: 'erp-spin 0.6s linear infinite',
                    }} />
                    Syncing…
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
                    <h1 className="ERP-title MD-page-title">Account <span className="ERP-title-em">Heads</span></h1>
                </div>
            </div>
            {/* HEADER END  */}

            <div className="ERP-divider" />

            {/* STATS START */}
            <div className="ERP-stats">
                {[
                    ['M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', 'Total Account Heads', categories.length],
                    ['M16 8v8M12 11v5M8 14v2M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z', 'Expense Type', expenseCount],
                    ['M3 3h18v18H3V3zm4 4v10m4-7v7m4-4v4', 'Income Type', incomeCount],
                    ['M5 13l4 4L19 7', 'Active', activeCount],
                ].map(([path, label, val], i) => (
                    <div className="ERP-stat" key={i}>
                        <div className="ERP-stat-accent" />
                        <div className="ERP-stat-label">{label}</div>
                        <div className="ERP-stat-val">{val}</div>
                    </div>
                ))}
            </div>
            {/* STATS END */}

            {/* TOOLBAR */}
            <div className="MD-toolbar-bar">
                <div className="MD-toolbar-count"><b>{categories.length}</b> Account Head{categories.length === 1 ? '' : 's'}</div>
                <button className="MD-add-btn" onClick={() => { setEditId(null); setFormData({ name: '', description: '', type: 'expense', is_active: true }); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <Ic d="M12 4v16m-8-8h16" sz={11} c="currentColor" sw={2} />
                    Add Account Head
                </button>
            </div>

            {/* FORM START */}
            {formOpen && (
                <div className="MD-create-grid MD-inline-form">
                    <div className="ERP-form-card">
                        <div className="ERP-form-topbar" />
                        <div className="ERP-form-body">

                            {/* Form Header Start */}
                            <div className="ERP-form-hdr MD-form-hdr">
                                <div className="ERP-form-icon-wrap MD-form-icon-wrap">
                                    <Ic d={editId ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 4v16m-8-8h16'} sz={18} c="#faf9f7" sw={1.8} />
                                </div>
                                <div>
                                    <div className="ERP-form-title MD-form-title">
                                        {editId ? 'Edit Account Head' : 'Add New Account Head'}
                                    </div>
                                </div>
                                {editId && (
                                    <button type="button" className="MD-cancel-pill" onClick={handleCancelEdit}>
                                        <Ic d="M6 18L18 6M6 6l12 12" sz={10} c="currentColor" sw={2} />
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                            {/* Form Header End */}
                            <div className="MD-form-divider" />

                            {/* FORM START */}
                            <form onSubmit={handleSubmit} noValidate>
                                {/* CATEGORY DETAILS START */}
                                <div className="ERP-section MD-first-section">
                                    <span className="ERP-section-tag">01 — Account Head Details</span>
                                    <div className="ERP-section-rule" />
                                </div>
                                {/* CATEGORY DETAILS END  */}

                                {/* Category Name Start */}
                                <div className="ERP-g2">

                                    {/* Category Name Start */}
                                    <div className={'ERP-field' + (errorField === 'name' ? ' MD-field-error' : '')} ref={nameFieldRef}>
                                        <label className="ERP-label req">Account Head Name</label>
                                        <input
                                            ref={nameInputRef}
                                            className="ERP-input"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handle}
                                            placeholder="e.g., Labor Costs"
                                            autoComplete="off"
                                        />
                                        {errorField === 'name' && (
                                            <div className="MD-field-error-msg">
                                                <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                Please fill out this field
                                            </div>
                                        )}
                                    </div>
                                    {/* Category Name End */}

                                    {/* Type Start */}
                                    <div className="ERP-field">
                                        <label className="ERP-label req">Type</label>
                                        <DD
                                            options={[
                                                { value: 'expense', label: 'Expense' },
                                                { value: 'income', label: 'Income' },
                                            ]}
                                            value={formData.type}
                                            onChange={v => setFormData(p => ({ ...p, type: v as 'income' | 'expense' }))}
                                            placeholder="Select Type..."
                                        />
                                    </div>
                                    {/* Type End */}
                                </div>

                                {/* Additional Info Start */}
                                <div className="ERP-section">
                                    <span className="ERP-section-tag">02 — Additional Info</span>
                                    <div className="ERP-section-rule" />
                                </div>
                                {/* Additonal Info End */}

                                <div className="ERP-g2">
                                    <div className="ERP-field">
                                        <label className="ERP-label">Status</label>
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
                                    <div className="ERP-field">
                                        <label className="ERP-label">
                                            Description
                                            <span className="ERP-label-opt">(optional)</span>
                                        </label>
                                        <input className="ERP-input" type="text" name="description"
                                            value={formData.description} autoComplete="off" onChange={handle}
                                            placeholder="Describe this account head..." />
                                    </div>
                                </div>

                                <div className="ERP-req-note">
                                    <span className="ERP-req-star">*</span>
                                    Required fields must be completed before submitting
                                </div>

                                <div className="ERP-btn-row">
                                    <button type="submit" className="ERP-btn primary" disabled={loading}>
                                        {loading
                                            ? <><span className="ERP-spinner" /> {editId ? 'Updating...' : 'Creating...'}</>
                                            : <><Ic d="M5 13l4 4L19 7" sz={13} c="#faf9f7" sw={2.2} /> {editId ? 'Update Account Head' : 'Create Account Head'}</>
                                        }
                                    </button>
                                    <button type="button" className="ERP-btn secondary"
                                        onClick={handleCancelEdit}
                                        disabled={loading}>
                                        {'Cancel'}
                                    </button>
                                </div>

                            </form>
                            {/*  */}
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
                                    <span className={'MD-preview-val' + (formData.name.trim() ? '' : ' empty')}>
                                        {formData.name.trim() || 'Not entered yet'}
                                    </span>
                                </span>
                            </div>
                            <div className="MD-preview-row">
                                <span className="MD-preview-ico"><Ic d="M16 8v8M12 11v5M8 14v2M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" sz={13} c="currentColor" sw={2} /></span>
                                <span className="MD-preview-txt">
                                    <span className="MD-preview-lbl">Type</span>
                                    <span className="MD-preview-val">
                                        <span className={`ERP-badge ${formData.type === 'income' ? 'active' : 'inactive'}`}>
                                            <span className="ERP-badge-dot" />
                                            {formData.type === 'income' ? 'Income' : 'Expense'}
                                        </span>
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

            {/* TABLE START */}
            <div className="ERP-tbl-card MD-tbl-card">

                    {fetching ? (
                        <RunningLoader label="Loading Account Heads" />
                    ) : categories.length === 0 ? (
                        <div className="ERP-empty">
                            <div className="ERP-empty-icon">
                                <Ic d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" sz={26} c="var(--ember-light)" sw={1.8} />
                            </div>
                            <div className="ERP-empty-title">No Account Heads Yet</div>
                            <div className="ERP-empty-sub">Add the first account head using the button above</div>
                        </div>
                    ) : (
                        <div className="ERP-tbl-scroll">
                            <table className="ERP-tbl">
                                <thead>
                                    <tr>
                                        <th className="ERP-center" style={{ width: 52 }}>No.</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Created By</th>
                                        <th className="ERP-center" style={{ width: 180 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedCategories.map((cat, i) => (
                                        <tr key={cat.id}
                                            style={editId === cat.id ? {
                                                background: 'rgba(37,99,235,0.06)',
                                                outline: '2px solid rgba(37,99,235,0.3)',
                                            } : {}}>
                                            <td className="ERP-t-num ERP-center">{(mdSafePage - 1) * mdPerPage + i + 1}</td>
                                            <td className="ERP-t-primary">{cat.name}</td>
                                            <td>{cat.description
                                                ? <span className="ERP-t-desc">{cat.description}</span>
                                                : <span className="ERP-t-null">—</span>}
                                            </td>
                                            <td>
                                                <span className={`MD-tbl-tag ${cat.type === 'income' ? 'success' : 'danger'}`}>
                                                    {cat.type === 'income' ? 'Income' : 'Expense'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`MD-tbl-tag ${cat.is_active ? 'info' : 'muted'}`}>
                                                    {cat.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="ERP-t-creator">
                                                {cat.created_by_name || <span className="ERP-t-null">—</span>}
                                            </td>
                                            <td className="ERP-center ERP-nowrap">
                                                <button className="MD-act-ico edit" title="Edit" onClick={() => handleEdit(cat)}>Edit</button>
                                                {canDelete(userRole) && (
                                                    <button className="MD-act-ico delete" title="Delete" onClick={() => handleDelete(cat.id, cat.name)}>Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!fetching && categories.length > 0 && (
                        <Pagination
                            page={mdSafePage}
                            totalPages={mdTotalPages}
                            onPageChange={setMdPage}
                            total={categories.length}
                            perPage={mdPerPage}
                            onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                            itemLabel="account heads"
                        />
                    )}
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
                entityName="Account Head"
                duplicateFields={dupModal.fields}
                onAddAnyway={handleDupConfirm}
                onCancel={() => setDupModal({ open: false, fields: [], pendingData: null })}
                loading={loading}
            />
        </div>
    );
}
