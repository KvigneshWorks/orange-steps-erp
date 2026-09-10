export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    subtitle?: string;
    duration?: number;
}

type Listener = (t: ToastMessage) => void;
const listeners: Listener[] = [];

function emit(data: Omit<ToastMessage, 'id'>) {
    const msg: ToastMessage = { duration: 1500, ...data, id: Math.random().toString(36).slice(2) };
    listeners.forEach(fn => fn(msg));
}

export function subscribeToast(fn: Listener) {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); };
}

export const toast = {
    /** Console test helper: window.__toast.success('Saved!', 'Entry #12') */
    success: (title: string, subtitle?: string, duration?: number) =>
        emit({ type: 'success', title, subtitle, duration }),
    error: (title: string, subtitle?: string, duration?: number) =>
        emit({ type: 'error', title, subtitle, duration }),
    info: (title: string, subtitle?: string, duration?: number) =>
        emit({ type: 'info', title, subtitle, duration }),
    warning: (title: string, subtitle?: string, duration?: number) =>
        emit({ type: 'warning', title, subtitle, duration }),
};

// Dev helper — test from browser console on any page: __toast.success('Hello!')
if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__toast = toast;
}
