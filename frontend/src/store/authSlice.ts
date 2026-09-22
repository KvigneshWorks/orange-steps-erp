import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
}

const readStoredUser = (): AuthUser | null => {
    try {
        const raw = sessionStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: readStoredUser(),
    token: sessionStorage.getItem('token'),
    isAuthenticated: !!sessionStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            sessionStorage.setItem('token', action.payload.token);
            sessionStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
