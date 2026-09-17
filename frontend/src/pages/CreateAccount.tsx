import { useState, type ChangeEvent, type FormEvent } from 'react';
import axiosInstance from '../services/axiosConfig';
import { toast } from '../services/toast';
import { ERP_CSS } from './ERPTheme';
import { Ic } from '../components/Icon';
import { Button, FormCard, Field, Input, Select, PageHeader } from '../components/ui';
import { getStoredRole } from '../utils/roleAccess';

/**
 * "Create Account" — the replacement for the old public self-registration
 * page. Reachable from the sidebar under Account Settings.
 *
 * - Super Admin: sees a Role picker (Admin / User). The account is created
 *   directly and can log in immediately.
 * - Admin: no Role picker — every account they create is a User account,
 *   and it always lands in the Super Admin's Pending Approvals queue
 *   (backend forces role='user' + pending regardless of what's sent).
 */

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

interface FormState {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'user';
}

const EMPTY_FORM: FormState = { name: '', email: '', password: '', password_confirmation: '', role: 'user' };

export default function CreateAccount() {
    const role = getStoredRole();
    const isSuperAdmin = role === 'super_admin';

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrors(er => (er[name] ? { ...er, [name]: '' } : er));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (form.password.length < 8) {
            setErrors(er => ({ ...er, password: 'Must be at least 8 characters' }));
            return;
        }
        if (form.password !== form.password_confirmation) {
            setErrors(er => ({ ...er, password_confirmation: 'Passwords do not match' }));
            toast.error('Password Mismatch', 'Password and confirmation must match');
            return;
        }

        setSubmitting(true);
        try {
            const payload: Record<string, string> = {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                password_confirmation: form.password_confirmation,
            };
            if (isSuperAdmin) payload.role = form.role;

            const res = await axiosInstance.post('auth/register', payload, { headers: authH() });

            if (res.data.pending) {
                toast.success('Sent for Approval', res.data.message || `${form.name}'s request was sent to the Super Admin.`);
            } else {
                toast.success('Account Created', res.data.message || `${form.name}'s account is active now.`);
            }
            setForm(EMPTY_FORM);
            setErrors({});
        } catch (err: any) {
            const resp = err?.response?.data;
            if (resp?.errors) {
                const flat: Record<string, string> = {};
                Object.entries(resp.errors as Record<string, string[]>).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setErrors(flat);
                toast.error('Could Not Create Account', Object.values(flat)[0] || 'Please check the form and try again.');
            } else {
                toast.error('Could Not Create Account', resp?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ERP-page">
            <style>{ERP_CSS}</style>

            <PageHeader
                eyebrow="Account Settings"
                title="Create"
                titleEm="Account"
            />

            <div className="ERP-divider" />

            {!isSuperAdmin && (
                <div className="ERP-req-note" style={{ marginBottom: 20 }}>
                    <Ic
                        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        sz={13} c="currentColor" sw={2}
                    />
                    Accounts you create are always User accounts, and need Super Admin approval before they can log in.
                </div>
            )}

            <div className="MD-create-grid MD-inline-form">
                <FormCard
                    variant="md"
                    icon={
                        <Ic
                            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                            sz={18} c="#fff" sw={1.8}
                        />
                    }
                    title={isSuperAdmin ? 'New Admin or User Account' : 'New User Account'}
                >
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="ERP-g2">
                            <Field label="Full Name" error={errors.name}>
                                <Input
                                    name="name" value={form.name} onChange={handleChange}
                                    placeholder="e.g., Priya Sharma" required
                                />
                            </Field>
                            <Field label="Email" error={errors.email}>
                                <Input
                                    type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="name@example.com" required
                                />
                            </Field>
                        </div>

                        <div className="ERP-g2">
                            <Field label="Password" error={errors.password}>
                                <Input
                                    type="password" name="password" value={form.password} onChange={handleChange}
                                    placeholder="Minimum 8 characters" required minLength={8}
                                />
                            </Field>
                            <Field label="Confirm Password" error={errors.password_confirmation}>
                                <Input
                                    type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                                    placeholder="Re-enter password" required minLength={8}
                                />
                            </Field>
                        </div>

                        {isSuperAdmin && (
                            <div className="ERP-g1">
                                <Field label="Role">
                                    <Select name="role" value={form.role} onChange={handleChange}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </Select>
                                </Field>
                            </div>
                        )}

                        <div className="ERP-btn-row">
                            <Button
                                type="submit"
                                variant="primary"
                                loading={submitting}
                                loadingText={isSuperAdmin ? 'Creating...' : 'Sending...'}
                                icon={<Ic d="M12 4v16m-8-8h16" sz={13} c="#fff" sw={2.2} />}
                            >
                                {isSuperAdmin ? 'Create Account' : 'Send for Approval'}
                            </Button>
                        </div>
                    </form>
                </FormCard>
            </div>
        </div>
    );
}
