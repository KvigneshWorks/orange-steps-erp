import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import RunningLoader from '../components/RunningLoader';
import Pagination from '../components/Pagination';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Ic } from '../components/Icon';
import { ERP_CSS } from './ERPTheme';
import { Button, IconButton, FormCard, TableCard, Input, Textarea, PageHeader, StatCard, Tag } from '../components/ui';
import { useKeyboardFieldNav } from '../utils/keyboardNav';
import { getStoredRole, canDelete } from '../utils/roleAccess';
import CreatorBadge from '../components/CreatorBadge';

interface IDType {
    id: number;
    type_name: string;
    format_pattern?: string;
    description?: string;
    is_active: boolean;
    created_by_name?: string | null;
}

interface FormData {
    type_name: string;
    format_pattern: string;
    description: string;
}

const CACHE_KEY = 'erp_cache_id_types';
const CACHE_TTL = 5 * 60 * 1000;
function getCached(): IDType[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
        return data;
    } catch { return null; }
}

function setCached(data: IDType[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch { }
}

function clearCached() {
    localStorage.removeItem(CACHE_KEY);
}

function SkeletonRow() {
    return (
        <>
            <tr>
                {[40, 160, 120, 200, 80, 140].map((w, i) => (
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
        </>
    );
}

export default function IDType() {
    const [userRole] = useState<string>(() => getStoredRole());
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string; loading: boolean }>({ open: false, id: 0, name: '', loading: false });
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingData: typeof formData | null }>({ open: false, fields: [], pendingData: null });
    const [idTypes, setIdTypes] = useState<IDType[]>(() => getCached() || []);
    const [formData, setFormData] = useState<FormData>({ type_name: '', format_pattern: '', description: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(() => getCached() === null);
    const [syncing, setSyncing] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [errorField, setErrorField] = useState<string | null>(null);
    const [mdPage, setMdPage] = useState(1);
    const [mdPerPage, setMdPerPage] = useState(10);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    const typeNameFieldRef = useRef<HTMLDivElement>(null);
    const typeNameInputRef = useRef<HTMLInputElement>(null);
    const fetchIdTypes = useCallback(async (silent = false) => {
        const cached = getCached();

        if (cached && !silent) {
            setSyncing(true);
        } else if (!cached) {
            setFetching(true);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get('id-types', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fresh = res.data.data || [];
            setIdTypes(fresh);
            setCached(fresh);
        } catch (err) {
            console.error('Failed to fetch Identification types:', err);
            if (!cached) {
                setDeleteModal({ open: false, id: 0, name: '', loading: false });
                showMessage('Failed to load Identification types', 'error');
            }
        } finally {
            setFetching(false);
            setSyncing(false);
        }
    }, []);

    useEffect(() => {
        fetchIdTypes();
    }, [fetchIdTypes]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!fetching) fetchIdTypes(true);
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetching, fetchIdTypes]);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errorField === e.target.name) setErrorField(null);
    };

    const resetForm = () => {
        setFormData({ type_name: '', format_pattern: '', description: '' });
        setEditingId(null);
        setFormOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.type_name.trim()) {
            setErrorField('type_name');
            toast.error('Identification Type Name is required', 'Please fill out this field to continue');
            typeNameFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            typeNameInputRef.current?.focus();
            return;
        }

        if (!editingId) {
            const dup = idTypes.find(t =>
                t.type_name.trim().toLowerCase() === formData.type_name.trim().toLowerCase()
            );
            if (dup) {
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Type Name', value: dup.type_name },
                        { label: 'Format', value: dup.format_pattern || '' },
                        { label: 'Description', value: dup.description || '' },
                    ],
                    pendingData: { ...formData },
                });
                return;
            }
        }

        setSubmitting(true);

        const originalIdTypes = [...idTypes];
        const tempId = editingId || Date.now();
        const tempItem: IDType = {
            id: tempId,
            type_name: formData.type_name,
            format_pattern: formData.format_pattern || '',
            description: formData.description || '',
            is_active: true,
        };

        if (editingId) {
            setIdTypes(prev => prev.map(t => t.id === editingId ? tempItem : t));
        } else {
            setIdTypes(prev => [tempItem, ...prev]);
        }

        const token = localStorage.getItem('token');
        try {
            if (editingId) {
                await axiosInstance.put(`/api/id-types/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showMessage('Identification Type updated successfully!', 'success');
                toast.success('Identification Type Updated!', `"${formData.type_name}" saved successfully`);
            } else {
                const response = await axiosInstance.post('id-types', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newItem = response.data.data || response.data;
                setIdTypes(prev => prev.map(t => t.id === tempId ? newItem : t));
                showMessage('Identification Type created successfully!', 'success');
                toast.success('Identification Type Created!', `"${formData.type_name}" added successfully`);
            }
            resetForm();
            setCached(idTypes);
            fetchIdTypes(true);
        } catch (err: any) {
            setIdTypes(originalIdTypes);
            setCached(originalIdTypes);
            const errorMsg = err.response?.data?.message || (editingId ? 'Failed to update Identification type' : 'Failed to create Identification type');
            showMessage(errorMsg, 'error');
            toast.error('Save Failed', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDupConfirm = async () => {
        if (!dupModal.pendingData) return;
        const data = dupModal.pendingData;
        setDupModal(d => ({ ...d, open: false }));
        setSubmitting(true);
        const originalIdTypes = [...idTypes];
        const tempId = Date.now();
        const tempItem: IDType = { id: tempId, type_name: data.type_name, format_pattern: data.format_pattern || '', description: data.description || '', is_active: true };
        setIdTypes(prev => [tempItem, ...prev]);
        const token = localStorage.getItem('token');
        try {
            const response = await axiosInstance.post('id-types', data, { headers: { Authorization: `Bearer ${token}` } });
            const newItem = response.data.data || response.data;
            setIdTypes(prev => prev.map(t => t.id === tempId ? newItem : t));
            showMessage('Identification Type created successfully!', 'success');
            resetForm();
            setCached(idTypes);
            fetchIdTypes(true);
        } catch (err: any) {
            setIdTypes(originalIdTypes);
            setCached(originalIdTypes);
            showMessage(err.response?.data?.message || 'Failed to create Identification type', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (idType: IDType) => {
        setFormData({
            type_name: idType.type_name,
            format_pattern: idType.format_pattern || '',
            description: idType.description || ''
        });
        setEditingId(idType.id);
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ✅ Optimistic delete with rollback
    const handleDelete = (id: number, type_name: string) => {
        setDeleteModal({ open: true, id: id, name: type_name, loading: false });
    };
    const confirmDelete = async () => {
        const { id, name } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));

        // Save original for rollback
        const originalIdTypes = [...idTypes];

        // Optimistic delete - remove immediately
        setIdTypes(prev => prev.filter(t => t.id !== id));

        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            await axiosInstance.delete(`/api/id-types/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage(`"${name}" deleted successfully`, 'success');
            toast.warning('Identification Type Deleted', `"${name}" moved to Recycle Bin`);
            setCached(idTypes);
            fetchIdTypes(true);
        } catch (err: any) {
            setIdTypes(originalIdTypes);
            setCached(originalIdTypes);
            showMessage(err.response?.data?.message || 'Failed to delete Identification type', 'error');
            toast.error('Delete Failed', err.response?.data?.message || 'Could not delete Identification type');
            setDeleteModal({ open: false, id: 0, name: '', loading: false });
        } finally {
            setSubmitting(false);
        }
    };

    const activeCount = idTypes.filter(t => t.is_active).length;

    const mdTotalPages = Math.max(1, Math.ceil(idTypes.length / mdPerPage));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const pagedIdTypes = idTypes.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);

    return (
        <>
            <div className="ERP-page" ref={rootRef}>
                <style>{ERP_CSS}</style>

                {/* ── Silent sync badge ── */}
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
                <PageHeader
                    eyebrow="Master Data Configuration"
                    title="Identification Type"
                    titleEm="Management"
                    titleClassName="MD-page-title"
                />
                {/* HEADER END */}

                <div className="ERP-divider" />

                {/* STATS START */}
                <div className="ERP-stats">
                    {([
                        ['M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0M9 12h6m-3-3v6', 'Total Identification Types', idTypes.length],
                        ['M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', 'Active Types', activeCount],
                    ] as [string, string, number][]).map(([path, label, val], i) => (
                        <StatCard key={i} label={label} value={val} />
                    ))}
                </div>
                {/* STATS END */}

                {/* TOOLBAR */}
                <div className="MD-toolbar-bar">
                    <div className="MD-toolbar-count"><b>{idTypes.length}</b> Identification Type{idTypes.length === 1 ? '' : 's'}</div>
                    <button className="MD-add-btn" onClick={() => { resetForm(); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Ic d="M12 4v16m-8-8h16" sz={11} c="currentColor" sw={2} />
                        Add Identification Type
                    </button>
                </div>

                {/* FORM START */}
                {formOpen && (
                <div className="MD-create-grid MD-inline-form">
                <FormCard
                    variant="md"
                    icon={<Ic d={editingId
                        ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        : 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0'}
                        sz={18} c="#faf9f7" sw={1.8} />}
                    title={editingId ? 'Edit Identification Type' : 'Add New Identification Type'}
                    headerExtra={editingId && (
                        <button type="button" className="MD-cancel-pill" onClick={resetForm}>
                            <Ic d="M6 18L18 6M6 6l12 12" sz={10} c="currentColor" sw={2} />
                            Cancel Edit
                        </button>
                    )}
                >
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="ERP-section MD-first-section">
                                <span className="ERP-section-tag">01 — Type Details</span>
                                <div className="ERP-section-rule" />
                            </div>

                            <div className="ERP-g2">
                                <div className={'ERP-field' + (errorField === 'type_name' ? ' MD-field-error' : '')} ref={typeNameFieldRef}>
                                    <label className="ERP-label req">Identification Type Name</label>
                                    <Input ref={typeNameInputRef} type="text" name="type_name"
                                        value={formData.type_name} onChange={handleChange}
                                        placeholder="e.g., Voter ID, Passport" />
                                    {errorField === 'type_name' && (
                                        <div className="MD-field-error-msg">
                                            <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                            Please fill out this field
                                        </div>
                                    )}
                                </div>
                                <div className="ERP-field">
                                    <label className="ERP-label">Format Pattern</label>
                                    <Input type="text" name="format_pattern"
                                        value={formData.format_pattern} onChange={handleChange}
                                        placeholder="e.g., 10 Alphanumeric characters" />
                                    <span className="ERP-hint">Format reference information only</span>
                                </div>
                            </div>

                            <div className="ERP-section">
                                <span className="ERP-section-tag">02 — Additional Info</span>
                                <div className="ERP-section-rule" />
                            </div>

                            <div className="ERP-g1">
                                <div className="ERP-field">
                                    <label className="ERP-label">
                                        Description
                                        <span className="ERP-label-opt">(optional)</span>
                                    </label>
                                    <Textarea name="description"
                                        value={formData.description} onChange={handleChange}
                                        placeholder="Describe this Identification type and its usage context..." />
                                </div>
                            </div>

                            <div className="ERP-req-note">
                                <span className="ERP-req-star">*</span>
                                Identification Type Name is required
                            </div>

                            <div className="ERP-btn-row">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={submitting}
                                    loadingText={editingId ? 'Updating...' : 'Creating...'}
                                    icon={<Ic d="M5 13l4 4L19 7" sz={13} c="#faf9f7" sw={2.2} />}
                                >
                                    {editingId ? 'Update Identification Type' : 'Create Identification Type'}
                                </Button>
                                {(editingId || formData.type_name.trim()) && (
                                    <Button type="button" variant="secondary" onClick={resetForm} disabled={submitting}>
                                        Cancel
                                    </Button>
                                )}
                            </div>

                        </form>
                </FormCard>

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
                                <span className="MD-preview-lbl">Type Name</span>
                                <span className={'MD-preview-val' + (formData.type_name.trim() ? '' : ' empty')}>
                                    {formData.type_name.trim() || 'Not entered yet'}
                                </span>
                            </span>
                        </div>
                        <div className="MD-preview-row">
                            <span className="MD-preview-ico"><Ic d="M4 6h16M4 12h16M4 18h7" sz={13} c="currentColor" sw={2} /></span>
                            <span className="MD-preview-txt">
                                <span className="MD-preview-lbl">Format Pattern</span>
                                <span className={'MD-preview-val' + (formData.format_pattern.trim() ? '' : ' empty')}>
                                    {formData.format_pattern.trim() || 'None'}
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
                {/* FORM END */}

                {/* TABLE START */}
                <TableCard variant="md">
                    {fetching ? (
                        <RunningLoader label="Loading Identification Types" />
                    ) : idTypes.length === 0 ? (
                        <div className="ERP-empty">
                            <div className="ERP-empty-icon">
                                <Ic d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" sz={26} c="var(--ember-light)" sw={1.8} />
                            </div>
                            <div className="ERP-empty-title">No Identification Types Yet</div>
                            <div className="ERP-empty-sub">Add the first Identification Type using the button above</div>
                        </div>
                    ) : (
                        <div className="ERP-tbl-scroll">
                            <table className="ERP-tbl">
                                <thead>
                                    <tr>
                                        <th className="ERP-center" style={{ width: 52 }}>No.</th>
                                        <th>Type Name</th>
                                        <th>Format Pattern</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th className="ERP-center" style={{ width: 180 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedIdTypes.map((it, i) => (
                                        <tr key={it.id}
                                            style={editingId === it.id ? {
                                                background: 'rgba(37,99,235,0.06)',
                                                outline: '2px solid rgba(37,99,235,0.3)',
                                            } : {}}>
                                            <td className="ERP-t-num ERP-center">{(mdSafePage - 1) * mdPerPage + i + 1}</td>
                                            <td className="ERP-t-primary">{it.type_name}</td>
                                            <td>{it.format_pattern ? <span className="ERP-t-code">{it.format_pattern}</span> : <span className="ERP-t-null">—</span>}</td>
                                            <td>{it.description ? <span className="ERP-t-desc">{it.description}</span> : <span className="ERP-t-null">—</span>}</td>
                                            <td>
                                                <Tag variant={it.is_active ? 'info' : 'muted'}>
                                                    {it.is_active ? 'Active' : 'Inactive'}
                                                </Tag>
                                            </td>
                                            <td className="ERP-center ERP-nowrap">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                    <IconButton variant="edit" title="Edit" onClick={() => handleEdit(it)}
                                                        icon={<Ic d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" sz={13} c="currentColor" sw={1.8} />} />
                                                    {canDelete(userRole) ? (
                                                        <IconButton variant="delete" title="Delete" onClick={() => handleDelete(it.id, it.type_name)}
                                                            icon={<Ic d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" sz={13} c="currentColor" sw={1.8} />} />
                                                    ) : (
                                                        <CreatorBadge name={it.created_by_name} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!fetching && idTypes.length > 0 && (
                        <Pagination
                            page={mdSafePage}
                            totalPages={mdTotalPages}
                            onPageChange={setMdPage}
                            total={idTypes.length}
                            perPage={mdPerPage}
                            onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                            itemLabel="Identification Types"
                        />
                    )}
                </TableCard>
                {/* TABLE END */}
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
                entityName="Identification Type"
                duplicateFields={dupModal.fields}
                onAddAnyway={handleDupConfirm}
                onCancel={() => setDupModal({ open: false, fields: [], pendingData: null })}
                loading={submitting}
            />
        </>
    );
}
