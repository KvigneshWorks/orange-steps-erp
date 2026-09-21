import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DuplicateWarningModal from '../components/DuplicateWarningModal';
import RunningLoader from '../components/RunningLoader';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { useEffect, useState, useRef } from 'react';
import { Ic } from '../components/Icon';
import { ERP_CSS } from './ERPTheme';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';
import Pagination from '../components/Pagination';
import { getStoredRole, canDelete } from '../utils/roleAccess';
import CreatorBadge from '../components/CreatorBadge';

interface SubName {
    id: number;
    bio_data_name?: string;
    alternate_name: string;
    classification: string;
    description?: string;
    is_active: boolean;
    bio_data_id?: number;
    created_by_name?: string | null;
}

interface BioData {
    id: number;
    name: string;
}

interface FormData {
    bio_data_id: string;
    alternate_name: string;
    classification: string;
    description: string;
}

interface DDOption { value: string; label: string; }

function DD({ options, value, onChange, placeholder, disabled = false, emptyMsg = 'No options available' }: {
    options: DDOption[];
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    disabled?: boolean;
    emptyMsg?: string;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <>
            <div className="ERP-dd" ref={ref}>
                <button
                    type="button"
                    ref={triggerRef}
                    className={`ERP-dd-trigger${!selected ? ' ph' : ''}${open ? ' open' : ''}${disabled ? ' dis' : ''}`}
                    onClick={() => !disabled && setOpen(prev => !prev)}
                    onKeyDown={onTriggerKeyDown}
                >
                    {selected ? (
                        <span className="ERP-dd-chip">
                            <span className="ERP-dd-chip-dot" />
                            {selected.label}
                        </span>
                    ) : (
                        <span className="ERP-dd-placeholder">{placeholder}</span>
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

                        {options.length === 0 ? (
                            <div className="ERP-dd-empty">{emptyMsg}</div>
                        ) : (
                            options.map(opt => (
                                <div
                                    key={opt.value}
                                    role="option" tabIndex={-1} aria-selected={value === opt.value}
                                    className={`ERP-dd-item${value === opt.value ? ' sel' : ''}`}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && <span className="ERP-dd-item-check">✓</span>}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

const EMPTY: FormData = {
    bio_data_id: '',
    alternate_name: '',
    classification: '',
    description: '',
};

export default function SubName() {
    const [userRole] = useState<string>(() => getStoredRole());
    const [formData, setFormData] = useState<FormData>(EMPTY);

    const [subNames, setSubNames] = useState<SubName[]>([]);
    const [bioDataList, setBioDataList] = useState<BioData[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string; loading: boolean }>({ open: false, id: 0, name: '', loading: false });
    const [dupModal, setDupModal] = useState<{ open: boolean; fields: { label: string; value: string }[]; pendingData: typeof formData | null }>({ open: false, fields: [], pendingData: null });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [mdPage, setMdPage] = useState(1);
    const [mdPerPage, setMdPerPage] = useState(10);
    const [editId, setEditId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [errorField, setErrorField] = useState<string | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    const bioDataFieldRef = useRef<HTMLDivElement>(null);
    const altNameFieldRef = useRef<HTMLDivElement>(null);
    const altNameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBioData();
        fetchData();
    }, []);

    const fetchBioData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get('bio-data', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBioDataList(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch bio-data:', err);
        }
    };

    const fetchData = async () => {
        try {
            setFetching(true);
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get('sub-names', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubNames(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch sub-names:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errorField === e.target.name) setErrorField(null);
    };

    const doSaveSubName = async (data: typeof formData) => {
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const payload = { ...data, bio_data_id: Number(data.bio_data_id) };
            if (editId) {
                await axiosInstance.put(`/api/sub-names/${editId}`, payload, { headers });
                setMessage('Associate Name updated successfully!');
                toast.success('Associate Name Updated!', `"${data.alternate_name}" saved successfully`);
            } else {
                await axiosInstance.post('sub-names', payload, { headers });
                setMessage('Associate Name created successfully!');
                toast.success('Associate Name Created!', `"${data.alternate_name}" added successfully`);
            }
            setEditId(null);
            setFormData(EMPTY);
            setFormOpen(false);
            await fetchData();
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Operation failed. Please try again.');
            toast.error('Save Failed', err.response?.data?.message || 'Could not save associate name');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bio_data_id) {
            setErrorField('bio_data_id');
            toast.error('Party Record is required', 'Please fill out this field to continue');
            bioDataFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!formData.alternate_name.trim()) {
            setErrorField('alternate_name');
            toast.error('Alternate Name is required', 'Please fill out this field to continue');
            altNameFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            altNameInputRef.current?.focus();
            return;
        }

        if (!editId) {
            const dup = subNames.find(s =>
                s.alternate_name.trim().toLowerCase() === formData.alternate_name.trim().toLowerCase() &&
                String(s.bio_data_id) === String(formData.bio_data_id)
            );
            if (dup) {
                const bioName = bioDataList.find(b => b.id === dup.bio_data_id)?.name || String(dup.bio_data_id);
                setDupModal({
                    open: true,
                    fields: [
                        { label: 'Alternate Name', value: dup.alternate_name },
                        { label: 'Person', value: bioName },
                        { label: 'Classification', value: dup.classification || '' },
                    ],
                    pendingData: { ...formData },
                });
                return;
            }
        }

        await doSaveSubName(formData);
    };

    const handleDupConfirm = async () => {
        if (dupModal.pendingData) {
            setDupModal(d => ({ ...d, open: false }));
            await doSaveSubName(dupModal.pendingData);
        }
    };

    const handleEdit = (sn: SubName) => {
        setEditId(sn.id);
        setFormData({
            bio_data_id: sn.bio_data_id ? String(sn.bio_data_id) : '',
            alternate_name: sn.alternate_name || '',
            classification: sn.classification || '',
            description: sn.description || '',
        });
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({ open: true, id: id, name: name, loading: false });
    };
    const confirmDelete = async () => {
        const { id, name } = deleteModal;
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete(`/api/sub-names/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteModal({ open: false, id: 0, name: '', loading: false });
            setMessage(`"${name}" deleted successfully`);
            toast.warning('Associate Name Deleted', `"${name}" moved to Recycle Bin`);
            await fetchData();
        } catch (err: any) {
            setMessage('Failed to delete record');
            toast.error('Delete Failed', 'Could not delete this associate name');
        }
    };

    const mdTotalPages = Math.max(1, Math.ceil(subNames.length / mdPerPage));
    const mdSafePage = Math.min(mdPage, mdTotalPages);
    const pagedSubNames = subNames.slice((mdSafePage - 1) * mdPerPage, mdSafePage * mdPerPage);

    return (
        <>
            <div className="ERP-page" ref={rootRef}>
                <style>{ERP_CSS}</style>

                {/* HEADER START*/}
                <div className="ERP-hdr">
                    <div className="ERP-hdr-left">
                        <div className="ERP-eyebrow">
                            <span className="ERP-eyebrow-line" />
                            <span className="ERP-eyebrow-dot" />
                            Identity &amp; Alias Management
                        </div>
                        <h1 className="ERP-title MD-page-title">Associate <span className="ERP-title-em">Names</span></h1>
                    </div>
                </div>
                {/* HEADER END  */}

                <div className="ERP-divider" />

                {/* STATS START */}
                <div className="ERP-stats">
                    {([
                        ['M7 8h10M7 12h10M7 16h10', 'Total Associate Names', subNames.length],
                        ['M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', 'Linked Party Records', bioDataList.length],
                    ] as [string, string, number][]).map(([path, label, val], i) => (
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
                    <div className="MD-toolbar-count"><b>{subNames.length}</b> Associate Name{subNames.length === 1 ? '' : 's'}</div>
                    <button className="MD-add-btn" onClick={() => { setFormData(EMPTY); setEditId(null); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Ic d="M12 4v16m-8-8h16" sz={11} c="currentColor" sw={2} />
                        Add Associate Name
                    </button>
                </div>

                {/* FORM START */}
                {formOpen && (
                    <div className="MD-create-grid MD-inline-form">
                        <div className="ERP-form-card">
                            <div className="ERP-form-topbar" />
                            <div className="ERP-form-body">

                                <div className="ERP-form-hdr MD-form-hdr">
                                    <div className="ERP-form-icon-wrap MD-form-icon-wrap">
                                        <Ic d="M7 8h10M7 12h10M7 16h6" sz={18} c="#fff" sw={1.8} />
                                    </div>
                                    <div>
                                        <div className="ERP-form-title MD-form-title">{editId ? 'Edit Associate Name' : 'Add New Associate Name'}</div>
                                    </div>
                                </div>
                                <div className="MD-form-divider" />

                                {/* Form Start */}
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="ERP-section MD-first-section">
                                        <span className="ERP-section-tag">01 — Linkage</span>
                                        <div className="ERP-section-rule" />
                                    </div>

                                    <div className="ERP-g2">
                                        <div className={'ERP-field' + (errorField === 'bio_data_id' ? ' MD-field-error' : '')} ref={bioDataFieldRef}>
                                            <label className="ERP-label req">Party Record</label>
                                            <DD
                                                options={bioDataList.map(b => ({ value: String(b.id), label: b.name }))}
                                                value={formData.bio_data_id}
                                                onChange={v => { setFormData(p => ({ ...p, bio_data_id: v })); if (errorField === 'bio_data_id') setErrorField(null); }}
                                                placeholder="Select Party Record..."
                                            />
                                            {errorField === 'bio_data_id' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>

                                        <div className={'ERP-field' + (errorField === 'alternate_name' ? ' MD-field-error' : '')} ref={altNameFieldRef}>
                                            <label className="ERP-label req">Alternate / Associate Name</label>
                                            <input
                                                ref={altNameInputRef}
                                                className="ERP-input"
                                                type="text"
                                                name="alternate_name"
                                                value={formData.alternate_name}
                                                onChange={handleChange}
                                                autoComplete='off'
                                                placeholder="Enter alternate or short name"
                                            />
                                            {errorField === 'alternate_name' && (
                                                <div className="MD-field-error-msg">
                                                    <Ic d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" sz={11} c="currentColor" sw={2} />
                                                    Please fill out this field
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ERP-section">
                                        <span className="ERP-section-tag">02 — Classification</span>
                                        <div className="ERP-section-rule" />
                                    </div>

                                    <div className="ERP-g2">
                                        <div className="ERP-field">
                                            <label className="ERP-label ">Classification <span className="ERP-label-opt">(Optional)</span></label>
                                            <input
                                                className="ERP-input"
                                                type="text"
                                                name="classification"
                                                value={formData.classification}
                                                onChange={handleChange}
                                                autoComplete='off'
                                                placeholder="e.g., Tier-1, Premium, Standard, VIP"
                                            />
                                        </div>
                                        <div className="ERP-field">
                                            <label className="ERP-label">
                                                Description <span className="ERP-label-opt">(Optional)</span>
                                            </label>
                                            <input
                                                className="ERP-input"
                                                type="text"
                                                name="description"
                                                autoComplete='off'
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Additional notes or remarks..."
                                            />
                                        </div>
                                    </div>

                                    <div className="ERP-btn-row">
                                        <button type="submit" className="ERP-btn primary" disabled={loading}>
                                            {loading ? (
                                                <><span className="ERP-spinner" /> {editId ? 'Updating...' : 'Creating...'}</>
                                            ) : (
                                                <><Ic d="M5 13l4 4L19 7" sz={13} c="#fff" sw={2.2} />
                                                    {editId ? 'Update Associate Name' : 'Add Associate Name'}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="ERP-btn secondary"
                                            onClick={() => {
                                                setFormData(EMPTY);
                                                setEditId(null);
                                                setFormOpen(false);
                                            }}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                </form>
                                {/* FORM END */}

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
                                        <span className="MD-preview-lbl">Party Record</span>
                                        <span className={'MD-preview-val' + (formData.bio_data_id ? '' : ' empty')}>
                                            {formData.bio_data_id ? (bioDataList.find(b => String(b.id) === formData.bio_data_id)?.name || '—') : 'Not selected yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M7 8h10M7 12h10M7 16h6" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Alternate Name</span>
                                        <span className={'MD-preview-val' + (formData.alternate_name.trim() ? '' : ' empty')}>
                                            {formData.alternate_name.trim() || 'Not entered yet'}
                                        </span>
                                    </span>
                                </div>
                                <div className="MD-preview-row">
                                    <span className="MD-preview-ico"><Ic d="M4 6h16M4 12h16M4 18h7" sz={13} c="currentColor" sw={2} /></span>
                                    <span className="MD-preview-txt">
                                        <span className="MD-preview-lbl">Classification</span>
                                        <span className={'MD-preview-val' + (formData.classification.trim() ? '' : ' empty')}>
                                            {formData.classification.trim() || 'None'}
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
                <div className="ERP-tbl-card MD-tbl-card">
                        {fetching ? (
                            <RunningLoader label="Loading Associate Names" />
                        ) : subNames.length === 0 ? (
                            <div className="ERP-empty">
                                <div className="ERP-empty-icon"><Ic d="M7 8h10M7 12h10M7 16h10" sz={26} c="var(--ember-light)" sw={1.8} /></div>
                                <div className="ERP-empty-title">No Associate Names Yet</div>
                                <div className="ERP-empty-sub">Add your first associate name using the button above</div>
                            </div>
                        ) : (
                            <div className="ERP-tbl-scroll">
                                <table className="ERP-tbl">
                                    <thead>
                                        <tr>
                                            <th className="ERP-center" style={{ width: 52 }}>No.</th>
                                            <th>Party Name</th>
                                            <th>Alternate Name</th>
                                            <th>Classification</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th className="ERP-center" style={{ width: 160 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedSubNames.map((sn, i) => (
                                            <tr key={sn.id}>
                                                <td className="ERP-t-num ERP-center">{(mdSafePage - 1) * mdPerPage + i + 1}</td>
                                                <td><span className="MD-tbl-tag info">{sn.bio_data_name || <span className="ERP-t-null">—</span>}</span></td>
                                                <td className="ERP-t-primary">{sn.alternate_name}</td>
                                                <td>
                                                    <span className="MD-tbl-tag warn">{sn.classification}</span>
                                                </td>
                                                <td>{sn.description ? <span className="ERP-t-desc">{sn.description}</span> : <span className="ERP-t-null">—</span>}</td>
                                                <td>
                                                    <span className={`MD-tbl-tag ${sn.is_active ? 'info' : 'muted'}`}>
                                                        {sn.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="ERP-center ERP-nowrap">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                        <button className="MD-act-ico edit" title="Edit" onClick={() => handleEdit(sn)}>Edit</button>
                                                        {canDelete(userRole) ? (
                                                            <button className="MD-act-ico delete" title="Delete" onClick={() => handleDelete(sn.id, sn.alternate_name)}>Delete</button>
                                                        ) : (
                                                            <CreatorBadge name={sn.created_by_name} />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!fetching && subNames.length > 0 && (
                            <Pagination
                                page={mdSafePage}
                                totalPages={mdTotalPages}
                                onPageChange={setMdPage}
                                total={subNames.length}
                                perPage={mdPerPage}
                                onPerPageChange={n => { setMdPerPage(n); setMdPage(1); }}
                                itemLabel="associate names"
                            />
                        )}
                    </div>
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
                entityName="Associate Name"
                duplicateFields={dupModal.fields}
                onAddAnyway={handleDupConfirm}
                onCancel={() => setDupModal({ open: false, fields: [], pendingData: null })}
                loading={loading}
            />
        </>
    );
}
