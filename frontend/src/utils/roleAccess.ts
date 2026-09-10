// Central place for "who can do what" checks shared across list/table pages.
// Mirrors the backend's CheckRole middleware (backend/app/Http/Middleware/CheckRole.php):
// only super_admin / studio_owner can permanently delete records anywhere in
// the app. Everyone else (admin, user) sees the record's creator name in the
// action column instead of a Delete button.

export interface StoredUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export function getStoredUser(): StoredUser | null {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.name ? parsed : null;
    } catch {
        return null;
    }
}

export function getStoredRole(): string {
    return getStoredUser()?.role ?? '';
}

/** Only super_admin / studio_owner may permanently delete records. */
export function canDelete(role?: string): boolean {
    return role === 'super_admin' || role === 'studio_owner';
}
