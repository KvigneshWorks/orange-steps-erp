import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DashboardStats {
    activeProjects: number; revenue: string; siteInspections: number;
    pendingBOQs: number; teamMembers: number; cadRevisions: number;
}

export interface PortalSummary {
    total_clients: number;
    total_projects: number;
    total_budget: number;
    total_collected: number;
    total_balance: number;
    collected_pct: number;
}

export interface RecentProject {
    id: number;
    client_name: string;
    project_name: string;
    project_type: string;
    status: string;
    total_budget: number;
    collected: number;
    balance: number;
    created_at: string;
    raw_budget?: number;
}

interface DashboardState {
    stats: DashboardStats | null;
    loading: boolean;
    portalSummary: PortalSummary | null;
    summaryLoading: boolean;
    recentProjects: RecentProject[];
}

const initialState: DashboardState = {
    stats: null,
    loading: true,
    portalSummary: null,
    summaryLoading: true,
    recentProjects: [],
};

// The core Control Panel KPI data (stats / portalSummary / recentProjects)
// lives here instead of local useState, so it's readable from anywhere in
// the component tree without prop-drilling and stays in sync everywhere
// it's rendered.
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setStats(state, action: PayloadAction<DashboardStats | null>) {
            state.stats = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setPortalSummary(state, action: PayloadAction<PortalSummary | null>) {
            state.portalSummary = action.payload;
        },
        setSummaryLoading(state, action: PayloadAction<boolean>) {
            state.summaryLoading = action.payload;
        },
        setRecentProjects(state, action: PayloadAction<RecentProject[]>) {
            state.recentProjects = action.payload;
        },
    },
});

export const {
    setStats,
    setLoading,
    setPortalSummary,
    setSummaryLoading,
    setRecentProjects,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
