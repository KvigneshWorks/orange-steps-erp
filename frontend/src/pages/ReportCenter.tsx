import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../services/axiosConfig';
import { ERP_CSS } from './ERPTheme';
import { T_CSS } from './ReportTheme';
import { toast } from '../services/toast';
import { CalendarDD } from '../components/CalendarDD';
import { markPanelOpen, markPanelClosed, useKeyboardFieldNav, useDropdownTriggerKeyDown, useDropdownPanelArrowNav } from '../utils/keyboardNav';

const COMPANY = {
    name: 'OrangeSteps',
    fullName: 'OrangeSteps',
    address: 'GRAND BRENTON - 281, Avinashi Rd, Periyar Nagar, Coimbatore, Tamil Nadu 641004',
    phone: '+91 95667-01640',
    email: 'info@orangesteps.in',
    website: 'https://www.orangesteps.in',
    tagline: 'ERP Software',
    gstin: 'GSTIN: 33XXXXX0000X0XX',
    logoPath: import.meta.env.BASE_URL + 'favicon.png',
    logo2Path: import.meta.env.BASE_URL + 'favicon.png',
    logoDarkPath: import.meta.env.BASE_URL + 'favicon.png',
};

const PDF_COLORS = {
    ember: [255, 107, 0] as [number, number, number],
    emberMid: [254, 147, 7] as [number, number, number],
    emberLight: [255, 159, 58] as [number, number, number],
    emberPale: [253, 200, 122] as [number, number, number],
    offWhite: [253, 247, 239] as [number, number, number],
    surface: [250, 242, 231] as [number, number, number],
    surface2: [244, 232, 215] as [number, number, number],
    surface3: [236, 220, 197] as [number, number, number],
    text1: [36, 28, 18] as [number, number, number],
    text2: [76, 64, 50] as [number, number, number],
    text3: [119, 103, 90] as [number, number, number],
    onEmber: [255, 250, 245] as [number, number, number],
    success: [30, 156, 106] as [number, number, number],
    danger: [217, 59, 85] as [number, number, number],
};

const ErpLogo = ({ size = 62 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="T-logo-svg">

        <defs>
            <linearGradient id="teLg1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>
            <linearGradient id="teLg2" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#DB5B1F" />
                <stop offset="60%" stopColor="#DB5B1F" />
                <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <radialGradient id="teLg3" cx="40%" cy="30%" r="55%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
        </defs>

        <rect width="80" height="80" rx="16" fill="url(#teLg1)" />
        <rect width="80" height="80" rx="16" fill="url(#teLg3)" />
        <line x1="0" y1="26.7" x2="80" y2="26.7" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <line x1="0" y1="53.4" x2="80" y2="53.4" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <line x1="26.7" y1="0" x2="26.7" y2="80" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <line x1="53.4" y1="0" x2="53.4" y2="80" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <rect width="80" height="1.5" rx="0" fill="rgba(255,255,255,0.20)" />
        <rect x="0" y="0" width="4" height="80" rx="0" fill="rgba(219,91,31,0.55)" />
        <rect x="0" y="62" width="80" height="18" fill="url(#teLg2)" />
        <rect x="0" y="62" width="80" height="2.5" fill="rgba(255,255,255,0.22)" />
        <rect x="11" y="18" width="58" height="12" rx="4" fill="white" />
        <rect x="31" y="30" width="18" height="25" rx="4" fill="white" />
        <text x="63.5" y="75.5" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="800" fontSize="9.5" fill="rgba(251,201,168,0.96)">S</text>
        <rect x="7" y="7" width="10" height="2" rx="1" fill="rgba(255,255,255,0.38)" />
        <rect x="7" y="7" width="2" height="10" rx="1" fill="rgba(255,255,255,0.38)" />
        <rect x="63" y="7" width="10" height="2" rx="1" fill="rgba(255,255,255,0.38)" />
        <rect x="71" y="7" width="2" height="10" rx="1" fill="rgba(255,255,255,0.38)" />
    </svg>
);

/* ===============================
   AUTH HELPERS
================================== */
const tk = (): string | null => sessionStorage.getItem('token');
const H = (): Record<string, string> => ({ Authorization: `Bearer ${tk()}` });
const setToken = (t: string) => sessionStorage.setItem('token', t);
const clearToken = () => sessionStorage.removeItem('token');
const AUTH_FAIL_EVENT = 'auth:fail';
const fireAuthFail = () => window.dispatchEvent(new Event(AUTH_FAIL_EVENT));
interface DaybookEntry {
    id?: number; transaction_date?: string; amount?: number | string;
    payment_mode?: string; category_id?: string | number;
    category_name?: string; sub_category_name?: string; sub_category_id?: string | number;
    category_type?: string; bio_data_name?: string; bio_data_id?: number | string;
    client_name?: string; sub_name_name?: string; sub_name_id?: number | string;
    narration?: string;
    source?: 'labour' | 'credit';[key: string]: unknown;
}

interface BioData { id: number; name: string; category_id?: number; sub_category_id?: number; }
interface SubName { id: number; alternate_name: string; bio_data_id: number; }
interface SubCategoryMaster { id: number; name: string; category_id?: number; category_ids?: number[]; }
interface CategoryOption { id: string; name: string; type?: 'income' | 'expense'; }
interface DbStats { income?: number; expense?: number; balance?: number; labourUnpaid?: number; creditUnpaid?: number; }
interface DbFilter { payment_modes: string[]; category_ids: string[]; sub_category_ids: string[]; search: string; bio_data_ids: string[]; sub_name_ids: string[]; client_names: string[]; }
interface CreditSummary { balance?: number; total_credit?: number; total_paid?: number; overdue_count?: number; upcoming_count?: number; total_vendors?: number; active_vendors?: number; }
interface CreditVendor { id?: number; party_name?: string; business_name?: string; category_id?: number | string; category_name?: string; sub_category_id?: number | string; sub_category_name?: string; phone?: string; total_credit?: number | string; total_paid?: number | string; balance?: number | string; total_credit_amount?: number | string; total_paid_amount?: number | string; outstanding_balance?: number | string; status?: string; is_active?: boolean; days_overdue?: number; last_transaction_date?: string; entry_count?: number; payment_count?: number; credit_entries_count?: number; credit_payments_count?: number; entries?: CreditEntry[]; payments?: CreditPayment[];[key: string]: unknown; }
interface CreditEntry { id: number; credit_date: string; bill_number?: string; description?: string; credit_amount: number; due_date?: string; priority?: string; amount_paid: number; bill_balance: number; is_paid: boolean; is_overdue: boolean; days_overdue: number; client_name?: string; }
interface CreditPayment { id: number; payment_date: string; amount_paid: number; payment_mode: string; reference?: string; notes?: string; daybook_entry_id?: number; client_name?: string; credit_entry_id?: number | null; }
interface AllPaymentClient { client_name: string; sub_worker_name?: string | null; shifts_total?: number; allocated: number; outstanding_before: number; outstanding_after: number; is_closed: boolean; }
interface AllPaymentSession { id: number; worker_id: number; worker_name: string; total_amount: number; payment_mode: string; notes: string | null; paid_at: string; clients_count: number; clients: AllPaymentClient[]; }
interface AttendanceRow { id: number; worker_id: number; bio_data_id?: number | null; client_name?: string | null; worker_name: string; sub_worker_name?: string | null; is_sub_entry?: boolean; worker_code?: string; worker_type?: string; trade?: string; site?: string; date: string; shifts_worked: number | string; status?: string; daily_rate: number | string; amount: number | string; notes?: string | null; }
interface LabourWorker { id: number; name: string; trade?: string; daily_rate?: number; salary_type?: string; monthly_salary?: number; total_earned: number; total_paid: number; balance: number; clients?: string[]; clients_count?: number; last_payment_at?: string | null; recent_shifts?: number; }
interface ClientDebitRow {
    source: 'Cash Book' | 'Wage Disbursement' | 'Accounts Payable'; date: string; label: string; sub?: string; mode: string; amount: number;
    bio_name?: string; sub_name?: string; category?: string; type?: string; narration?: string; client?: string;
}

interface ClientPortalSummary { total_clients?: number; total_projects?: number; total_budget?: number; total_collected?: number; total_balance?: number; collected_pct?: number; }
interface ClientPayment { id: number; payment_date: string; amount: number; gst_amount?: number; total_amount: number; payment_mode: string; mode_label?: string; reference_number?: string; notes?: string; }
interface ClientProject { id?: number; project_name?: string; name?: string; client_name?: string; project_type?: string; type_label?: string; status?: string; status_label?: string; total_budget?: number | string; raw_budget?: number | string; total_collected?: number | string; collected?: number | string; balance?: number | string; collected_pct?: number; client_id?: number; payments?: ClientPayment[];[key: string]: unknown; }
interface MonthlyData { total?: number; collected?: number; month?: string; month_label?: string; grand_total?: number; }
const fmtINR = (n: number | string | undefined | null): string => {
    if (n === undefined || n === null || n === '') return '—';
    const num = parseFloat(String(n));
    if (isNaN(num)) return '—';
    if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const fmtFull = (n: number | string | undefined | null): string => {
    const num = parseFloat(String(n ?? 0));
    const safe = isNaN(num) ? 0 : num;
    return `₹${safe.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtINR_PDF = (n: number | string | undefined | null): string => {
    if (n === undefined || n === null || n === '') return '—';
    const num = parseFloat(String(n));
    if (isNaN(num)) return '—';
    const neg = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    const formatted = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${neg}Rs. ${formatted}`;
};

const pdfSanitize = (s: string): string => s
    .replace(/[‒–—―−]/g, '-')
    .replace(/[·•‧]/g, '-')
    .replace(/[→➜➤⇒⟶↦▸›]/g, '->')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\x7E]/g, '');

const pdfSafe = (text: string | undefined | null): string => {
    if (!text) return '-';
    return pdfSanitize(String(text)).replace(/₹/g, 'Rs. ').replace(/\s{2,}/g, ' ').trim() || '-';
};

const pdfSafeNarration = (text: string | undefined | null, maxLen = 130): string => {
    const safe = pdfSafe(text);
    if (safe === '-' || safe.length <= maxLen) return safe;
    return safe.slice(0, maxLen - 1).trimEnd() + '...';
};

const fmtDate = (d: string | undefined | null | unknown): string => {
    if (!d || typeof d !== 'string') return '—';
    try {
        let ds = d; if (!ds.includes('T') && !ds.includes(' ')) ds += 'T00:00:00';
        const p = new Date(ds); if (isNaN(p.getTime())) return d;
        return p.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    } catch { return d; }
};

const labelForType = (t?: string): string => ({ construction: 'Construction', interior: 'Interior', architecture: 'Architecture', drawing: 'Drawing', pmc: 'PMC' }[t || ''] || t || '—');
const labelForStatus = (s?: string): string => ({ active: 'Active', on_hold: 'On Hold', completed: 'Completed' }[s || ''] || s || '—');
const labelForMode = (m?: string): string => ({ cash: 'Cash', upi: 'UPI', neft: 'NEFT', cheque: 'Cheque', bank_transfer: 'Bank Transfer', other: 'Other' }[m || ''] || m || '—');
const today = (): string => new Date().toISOString().slice(0, 10);
const startOfMonth = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};
const monthStart = (): string => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const resolveVendorBalance = (v: CreditVendor): number => parseFloat(String(v.balance ?? v.outstanding_balance ?? 0));
const resolveVendorCredit = (v: CreditVendor): number => parseFloat(String(v.total_credit ?? v.total_credit_amount ?? 0));
const resolveVendorPaid = (v: CreditVendor): number => parseFloat(String(v.total_paid ?? v.total_paid_amount ?? 0));
const resolveVendorEntryCount = (v: CreditVendor): number | string => v.entry_count ?? v.credit_entries_count ?? '—';
const resolveVendorPaymentCount = (v: CreditVendor): number | string => v.payment_count ?? v.credit_payments_count ?? '—';
const resolveVendorActive = (v: CreditVendor): boolean => { if (typeof v.is_active === 'boolean') return v.is_active; if (v.status) return v.status !== 'inactive'; return true; };
const resolveVendorStatus = (v: CreditVendor): string => { if (v.status && v.status !== 'active' && v.status !== 'inactive') return v.status; return resolveVendorActive(v) ? 'active' : 'inactive'; };
const resolveProjectBudget = (p: ClientProject): number => parseFloat(String(p.total_budget ?? p.raw_budget ?? 0));
const resolveProjectCollected = (p: ClientProject): number => parseFloat(String(p.total_collected ?? p.collected ?? 0));
const resolveProjectName = (p: ClientProject): string => p.project_name || p.name || '—';
const resolveProjectBalance = (p: ClientProject): number => { if (p.balance !== undefined && p.balance !== null) return parseFloat(String(p.balance)); return Math.max(0, resolveProjectBudget(p) - resolveProjectCollected(p)); };
const resolveProjectPct = (p: ClientProject): number => { if (p.collected_pct !== undefined) return Number(p.collected_pct); const b = resolveProjectBudget(p), c = resolveProjectCollected(p); return b > 0 ? Math.round((c / b) * 100) : 0; };
const normId = (v: unknown): string => String(v ?? '').trim();
const loadScript = (src: string): Promise<void> => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = rej;
    document.head.appendChild(s);
});

const fetchImageAsDataURL = async (path: string): Promise<string> => {
    try {
        const res = await fetch(path);
        if (!res.ok) { console.warn('[PDF] logo fetch failed:', path, res.status); return ''; }
        const blob = await res.blob();
        return await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => { console.warn('[PDF] logo FileReader failed:', path); resolve(''); };
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.warn('[PDF] logo load error:', path, err);
        return '';
    }
};

const svgPathToPngDataURL = async (path: string, printSizePx = 120): Promise<string> => {
    try {
        const svgDataUrl = await fetchImageAsDataURL(path);
        if (!svgDataUrl) return '';
        const size = printSizePx * 4;
        return await new Promise<string>(resolve => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(''); return; }
                ctx.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => { console.warn('[PDF] logo SVG rasterize failed:', path); resolve(''); };
            img.src = svgDataUrl;
        });
    } catch (err) {
        console.warn('[PDF] logo rasterize error:', path, err);
        return '';
    }
};

const getLogoBase64 = (): Promise<string> => svgPathToPngDataURL(COMPANY.logoDarkPath);
const getLogo2Base64 = async (): Promise<{ url: string; ratio: number }> => {
    const url = await fetchImageAsDataURL(COMPANY.logo2Path);
    if (!url) return { url: '', ratio: 1 };
    const ratio = await new Promise<number>(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.width && img.height ? img.width / img.height : 1);
        img.onerror = () => resolve(1);
        img.src = url;
    });
    return { url, ratio };
};

const rotatedWatermarkCache = new Map<string, Promise<string>>();
const getRotatedWatermark = (url: string, angleDeg: number): Promise<string> => {
    if (!url) return Promise.resolve('');
    const cacheKey = `${url}::${angleDeg}`;
    let cached = rotatedWatermarkCache.get(cacheKey);
    if (cached) return cached;
    cached = new Promise<string>(resolve => {
        try {
            const img = new Image();
            img.onload = () => {
                try {
                    const diag = Math.ceil(Math.sqrt(img.width * img.width + img.height * img.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = diag; canvas.height = diag;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(url); return; }
                    ctx.translate(diag / 2, diag / 2);
                    ctx.rotate(angleDeg * Math.PI / 180);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                    resolve(canvas.toDataURL('image/png'));
                } catch { resolve(url); }
            };
            img.onerror = () => resolve(url);
            img.src = url;
        } catch { resolve(url); }
    });
    rotatedWatermarkCache.set(cacheKey, cached);
    return cached;
};

const drawPdfBackground = (doc: any) => {
    const W = doc.internal.pageSize.getWidth(), PH = doc.internal.pageSize.getHeight();
    doc.setFillColor(252, 249, 245); doc.rect(0, 0, W, PH, 'F');
    doc.setFillColor(255, 240, 228); doc.rect(0, 0, 4, PH, 'F');
    doc.setFillColor(255, 240, 228); doc.rect(W - 4, 0, 4, PH, 'F');
};

const drawPdfTextWatermark = (doc: any) => {
    const W = doc.internal.pageSize.getWidth(), PH = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(130);
    doc.setTextColor(248, 232, 220);
    doc.text('O', W / 2, PH / 2 + 40, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(246, 225, 210);
    doc.text('OrangeSteps', W / 2, PH / 2 + 60, { align: 'center' });
};

const drawPdfLogoBox = (doc: any, x: number, y: number, size: number) => {
    doc.setFillColor(203, 54, 9); doc.rect(x, y, size, size, 'F');
    doc.setFillColor(254, 147, 7); doc.rect(x, y + size * 0.72, size, size * 0.28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size * 2.2);
    doc.setTextColor(255, 255, 255);
    doc.text('T', x + size * 0.5, y + size * 0.68, { align: 'center' });
    doc.setFontSize(size * 0.9);
    doc.setTextColor(22, 22, 30);
    doc.text('S', x + size * 0.5, y + size * 0.93, { align: 'center' });
};

const drawContinuationHeader = (doc: any, _logo: string, _watermark: string, title: string) => {
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...PDF_COLORS.offWhite); doc.rect(0, 0, W, 12, 'F');
    doc.setFillColor(...PDF_COLORS.ember); doc.rect(0, 0, 1.6, 12, 'F');
    doc.setFillColor(...PDF_COLORS.emberPale); doc.rect(0, 12, W, 0.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...PDF_COLORS.ember);
    doc.text(title, 16, 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...PDF_COLORS.text3);
    doc.text(COMPANY.fullName, W - 10, 8, { align: 'right' });
};

const buildPdfHeader = async (
    doc: any, rightTag: string,
    _emphasis: { label: string; value: string }[]
): Promise<{ startY: number; logo: string; watermark: string; watermarkRatio: number }> => {
    const [logo, wm] = await Promise.all([getLogoBase64(), getLogo2Base64()]);
    const watermark = wm.url, watermarkRatio = wm.ratio;
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(...PDF_COLORS.ember); doc.rect(0, 0, W, 1.2, 'F');
    doc.setFillColor(...PDF_COLORS.offWhite); doc.rect(0, 1.2, W, 23.8, 'F');
    doc.setFillColor(...PDF_COLORS.ember); doc.rect(0, 1.2, 1.6, 23.8, 'F');
    doc.setDrawColor(...PDF_COLORS.emberPale); doc.setLineWidth(0.3); doc.line(0, 25, W, 25);
    const nameParts = COMPANY.fullName.match(/^(White)(Node)/i);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    if (nameParts) {
        let nx = 30;
        doc.setTextColor(...PDF_COLORS.text1); doc.text(nameParts[1].toUpperCase(), nx, 9); nx += doc.getTextWidth(nameParts[1].toUpperCase());
        doc.setTextColor(...PDF_COLORS.ember); doc.text(nameParts[2].toUpperCase(), nx, 9);
    } else {
        doc.setTextColor(...PDF_COLORS.text1); doc.text(COMPANY.fullName.toUpperCase(), 30, 9);
    }

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...PDF_COLORS.ember);
    doc.text(COMPANY.tagline.toUpperCase(), 30, 14);
    doc.setFontSize(6); doc.setTextColor(...PDF_COLORS.text3);
    doc.text(COMPANY.address, 30, 19);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...PDF_COLORS.ember);
    if (COMPANY.gstin) doc.text(COMPANY.gstin, W - 10, 7, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(...PDF_COLORS.text2);
    doc.text(COMPANY.email, W - 10, 11.5, { align: 'right' });
    doc.text(COMPANY.phone, W - 10, 16, { align: 'right' });
    doc.text(COMPANY.website, W - 10, 20.5, { align: 'right' });
    void rightTag;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(...PDF_COLORS.text3);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - 10, 30, { align: 'right' });
    return { startY: 32, logo, watermark, watermarkRatio };
};

const buildPdfFooter = async (doc: any, logo = '', watermark = '', watermarkRatio = 1) => {
    const pc = doc.internal.getNumberOfPages();
    const W = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const GState = (window as any).jspdf?.GState;
    const rotatedWm = watermark && GState ? await getRotatedWatermark(watermark, -35) : '';
    for (let i = 1; i <= pc; i++) {
        doc.setPage(i);
        if (rotatedWm && GState) {
            try {
                const wmSize = Math.min(W, PH) * 0.62;
                const wmX = (W - wmSize) / 2, wmY = (PH - wmSize) / 2;
                doc.setGState(new GState({ opacity: 0.05 }));
                doc.addImage(rotatedWm, 'PNG', wmX, wmY, wmSize, wmSize);
                doc.setGState(new GState({ opacity: 1.0 }));
            } catch { /* ignore if watermark image unavailable */ }
        }

        doc.setFillColor(...PDF_COLORS.offWhite); doc.rect(0, PH - 20, W, 20, 'F');
        doc.setDrawColor(...PDF_COLORS.emberPale); doc.setLineWidth(0.4);
        doc.line(10, PH - 16, W - 10, PH - 16);
        doc.setFillColor(...PDF_COLORS.emberPale); doc.rect(0, PH - 1, W, 1, 'F');
        if (logo) {
            try {
                const logoH = 8, logoW = Math.min(logoH * watermarkRatio, 20);
                const logoY = PH - 8 - logoH / 2;
                doc.addImage(logo, 'PNG', 10, logoY, logoW, logoH);
            } catch {
                doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...PDF_COLORS.text1);
                doc.text(COMPANY.fullName, 10, PH - 7);
            }
        } else {
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...PDF_COLORS.text1);
            doc.text(COMPANY.fullName, 10, PH - 7);
        }

        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...PDF_COLORS.text2);
        doc.text(COMPANY.website || '', W - 10, PH - 7, { align: 'right' });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...PDF_COLORS.ember);
        doc.text(`Page ${i} of ${pc}`, W / 2, PH - 7, { align: 'center' });
        if (i === pc) {
            const sx = W - 68, sy = PH - 42, boxW = 56, boxH = 19;
            doc.setFillColor(255, 255, 255); doc.rect(sx - 2, sy, boxW, boxH, 'F');
            doc.setDrawColor(...PDF_COLORS.emberPale); doc.setLineWidth(0.4); doc.rect(sx - 2, sy, boxW, boxH);
            doc.setFillColor(...PDF_COLORS.emberPale); doc.rect(sx - 2, sy, boxW, 1, 'F');
            doc.setDrawColor(...PDF_COLORS.emberPale); doc.setLineWidth(0.3);
            doc.line(sx + 3, sy + 12, sx + boxW - 7, sy + 12);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(...PDF_COLORS.text3);
            doc.text('Authorised Signatory', sx + boxW / 2 - 2, sy + 15, { align: 'center' });
            doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(...PDF_COLORS.text1);
            doc.text(COMPANY.fullName, sx + boxW / 2 - 2, sy + 17.8, { align: 'center' });
        }
        if (logo && i === 1) {
            try { doc.addImage(logo, 'PNG', 8, 3, 20, 20); }
            catch { /* ignore — logo image may be CORS-blocked */ }
        }
    }
};

/* ===================================================================
   COLUMN DEFINITIONS
====================================================================== */
const DB_COLUMNS = [
    { key: 'sno', label: 'S.No', required: true },
    { key: 'date', label: 'Date' },
    { key: 'client', label: 'Client' },
    { key: 'category', label: 'Account Head' },
    { key: 'sub_category', label: 'Account Sub-Head' },
    { key: 'bio_name', label: 'Party Name' },
    { key: 'sub_name', label: 'Associate Name' },
    { key: 'mode', label: 'Mode' },
    { key: 'narration', label: 'Narration' },
    { key: 'amount', label: 'Amount' },
];

const CR_COLUMNS = [
    { key: 'sno', label: 'S.No', required: true }, { key: 'date', label: 'Last Activity', required: true },
    { key: 'client', label: 'Client', required: true },
    { key: 'category', label: 'Account Head', required: true }, { key: 'party', label: 'Party', required: true },
    { key: 'notes', label: 'Bill' },
    { key: 'credit', label: 'Credit', required: true },
    { key: 'paid', label: 'Paid', required: true }, { key: 'balance', label: 'Balance', required: true },
];

const CR_SUMMARY_COLUMNS = [
    { key: 'expand', label: '', required: true }, { key: 'sno', label: 'S.No', required: true },
    { key: 'last_txn', label: 'Last Txn' },
    { key: 'party_name', label: 'Party Name' }, { key: 'category', label: 'Account Head' },
    { key: 'phone', label: 'Phone' }, { key: 'total_credit', label: 'Total Credit' },
    { key: 'paid', label: 'Paid' }, { key: 'balance', label: 'Balance' },
    { key: 'days_overdue', label: 'Overdue' }, { key: 'status', label: 'Status' },
    { key: 'entries_pmts', label: 'Entries/Pmts' },
];

const CP_COLUMNS = [
    { key: 'sno', label: 'S.No', required: true }, { key: 'date', label: 'Date' },
    { key: 'client', label: 'Client' }, { key: 'project', label: 'Project' },
    { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' },
    { key: 'mode', label: 'Mode' }, { key: 'reference', label: 'Reference' },
    { key: 'notes', label: 'Notes' }, { key: 'paid', label: 'Paid' },
];

const LB_COLUMNS = [
    { key: 'sno', label: 'S.No', required: true }, { key: 'date', label: 'Date', required: true }, { key: 'client', label: 'Client' },
    { key: 'worker', label: 'Worker' }, { key: 'sub_name', label: 'Associate Name' },
    { key: 'shifts', label: 'Shifts' }, { key: 'earned', label: 'Earned' },
    { key: 'paid', label: 'Paid' }, { key: 'balance', label: 'Balance' },
    { key: 'status', label: 'Status' },
];

/* ===================================================================
   LOGIN SCREEN
====================================================================== */
const LOGIN_CSS = `
.L-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface,#F5F3EF);
  font-family: var(--font-body,'Space Grotesk'),sans-serif;
  position: relative;
  overflow: hidden;
}
.L-wrap::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(154,52,18,.08), transparent 65%);
  pointer-events: none;
}
.L-wrap::after {
  content: '';
  position: absolute;
  bottom: -160px; left: -80px;
  width: 520px; height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(219,91,31,.05), transparent 65%);
  pointer-events: none;
}
.L-card {
  background: var(--off-white,#F5F3EF);
  border: 1.5px solid var(--ember-border,rgba(154,52,18,0.28));
  border-radius: var(--r-xl,22px);
  box-shadow: 0 8px 48px rgba(0,0,0,.09), 0 2px 8px rgba(0,0,0,.04);
  padding: 48px 44px 44px;
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 2;
  animation: L-pop .55s cubic-bezier(.22,1,.36,1) both;
}
.L-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: var(--r-xl,22px) var(--r-xl,22px) 0 0;
  background: linear-gradient(90deg, var(--ember,#C2410C), var(--ember-mid,#DB5B1F), var(--ember,#C2410C));
  background-size: 300% 100%;
  animation: L-shimmer 4s ease infinite;
}
@keyframes L-pop { from { opacity:0; transform: scale(.94) translateY(18px); } to { opacity:1; transform: none; } }
@keyframes L-shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }
@keyframes L-spin { to { transform: rotate(360deg); } }
@keyframes L-shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
.L-logo-zone {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
}
.L-logo {
  width: 52px; height: 52px;
  object-fit: contain;
  border-radius: var(--r-md,10px);
  border: 2px solid var(--ember-border,rgba(154,52,18,0.28));
  box-shadow: 0 4px 18px rgba(154,52,18,.16);
  background: #FAF9F7;
}
.L-logo-fallback {
  width: 52px; height: 52px;
  border-radius: var(--r-md,10px);
  background: linear-gradient(135deg,var(--ember,#C2410C),var(--ember-mid,#DB5B1F));
  display: flex; align-items: center; justify-content: center;
  color: #faf9f7;
  font-family: var(--font-mono,'JetBrains Mono'),monospace;
  font-weight: 800; font-size: 10.5px;
  box-shadow: 0 4px 18px rgba(154,52,18,.28);
}
.L-co-name {
  font-family: var(--font-body,'Space Grotesk'),sans-serif;
  font-size: 15px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-1,#231C14);
  line-height: 1;
}
.L-co-name em {
  background: linear-gradient(90deg, var(--ember,#C2410C) 0%, #F0834D 45%, var(--ember,#C2410C) 100%);
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: normal;
}
.L-co-tag {
  font-family: var(--font-mono,'JetBrains Mono'),monospace;
  font-size: 7.5px;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: var(--text-3,#6B5D48);
  text-transform: uppercase;
  margin-top: 4px;
}
.L-title {
  font-family: var(--font-display,'Instrument Serif'),serif;
  font-size: 24.5px;
  font-weight: 800;
  font-style: italic;
  color: var(--text-1,#231C14);
  margin-bottom: 6px;
}
.L-title em { color: var(--ember,#C2410C); }
.L-sub {
  font-family: var(--font-mono,'JetBrains Mono'),monospace;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--text-3,#6B5D48);
  margin-bottom: 32px;
}
.L-field { margin-bottom: 18px; }
.L-label {
  display: block;
  font-family: var(--font-mono,'JetBrains Mono'),monospace;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-2,#3A3024);
  margin-bottom: 7px;
}
.L-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--border,#D2C7B8);
  border-radius: var(--r-md,10px);
  background: #faf9f7;
  color: var(--text-1,#231C14);
  font-family: var(--font-body,'Space Grotesk'),sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  outline: none;
  transition: all .18s;
  box-sizing: border-box;
}
.L-input:focus {
  border-color: var(--ember,#C2410C);
  box-shadow: 0 0 0 3px var(--ember-ghost,rgba(219,91,31,0.10));
  background: #faf9f7;
}
.L-input.err { border-color: var(--error,#D93B55); box-shadow: 0 0 0 3px var(--error-bg,rgba(217,59,85,0.10)); }
.L-pw-wrap { position: relative; }
.L-pw-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--text-3,#6B5D48);
  display: flex; align-items: center; justify-content: center;
  padding: 0; transition: color .15s;
}
.L-pw-toggle:hover { color: var(--ember,#C2410C); }
.L-err-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--error-bg,rgba(217,59,85,0.10));
  border: 1px solid var(--error-bd,rgba(217,59,85,0.26));
  border-radius: var(--r-sm,6px);
  padding: 10px 14px;
  margin-bottom: 20px;
  font-size: 10px;
  color: var(--error,#D93B55);
  animation: L-shake .4s ease both;
}
.L-submit {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg,var(--ember-mid,#DB5B1F),var(--ember,#C2410C));
  color: #faf9f7;
  border: none;
  border-radius: var(--r-md,10px);
  font-family: var(--font-mono,'JetBrains Mono'),monospace;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(154,52,18,.28);
  transition: all .18s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 8px;
}
.L-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(154,52,18,.38); }
.L-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.L-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #faf9f7;
  border-radius: 50%;
  animation: L-spin .65s linear infinite;
}
.L-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 22px 0 8px;
}
.L-divider-line { flex: 1; height: 1px; background: var(--border,#D2C7B8); }
.L-divider-txt { font-family: var(--font-mono,'JetBrains Mono'),monospace; font-size: 8px; color: var(--text-4,#6B5D48); letter-spacing: 1.5px; }
.L-footer {
  margin-top: 28px;
  text-align: center;
  font-family: var(--font-mono,'JetBrains Mono'),monospace;
  font-size: 8px;
  color: var(--text-4,#6B5D48);
  letter-spacing: 1px;
}
`;

function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logoErr, setLogoErr] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    useEffect(() => { emailRef.current?.focus(); }, []);
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
        setLoading(true); setError('');
        try {
            let token = '';
            const endpoints = ['auth/login', 'login', 'user/login'];
            let lastErr = '';
            for (const ep of endpoints) {
                try {
                    const res = await axiosInstance.post(ep, { email: email.trim(), password });
                    const d = res.data;
                    token = d.token || d.access_token || d.data?.token || d.data?.access_token || '';
                    if (token) break;
                } catch (err: any) {
                    lastErr = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials';
                    if (err.response?.status === 422 || err.response?.status === 401) break;
                }
            }
            if (!token) { setError(lastErr || 'Login failed. Check your credentials and try again.'); return; }
            setToken(token);
            onLogin();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="L-wrap">
            <style>{ERP_CSS}{LOGIN_CSS}</style>
            <div className="L-card">
                {/* Logo Start */}
                <div className="L-logo-zone">
                    {!logoErr
                        ? <img src={COMPANY.logoPath} alt={COMPANY.name} className="L-logo" onError={() => setLogoErr(true)} />
                        : <div className="L-logo-fallback">W<span style={{ fontSize: 9 }}>N</span></div>}
                    {/* Logo Start */}
                    <div>
                        <div className="L-co-name">White<em>Node</em></div>
                        <div className="L-co-tag">{COMPANY.tagline}</div>
                    </div>
                    {/* Logo End */}
                </div>
                {/* Logo End */}
                <div className="L-title">Welcome <em>Back</em></div>
                <div className="L-sub">ERP Report Center · Secure Sign In</div>
                {error && (
                    <div className="L-err-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}

                {/* Form Start */}
                <form onSubmit={handleSubmit}>

                    {/* Email Field Start */}
                    <div className="L-field">
                        <label className="L-label" htmlFor="l-email">Email Address</label>
                        <input
                            ref={emailRef}
                            id="l-email"
                            type="email"
                            className={`L-input${error ? ' err' : ''}`}
                            placeholder="you@orangesteps.in"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>
                    {/* Email Field End */}

                    {/* Password Field Start */}
                    <div className="L-field">
                        <label className="L-label" htmlFor="l-pw">Password</label>
                        <div className="L-pw-wrap">
                            <input
                                id="l-pw"
                                type={showPw ? 'text' : 'password'}
                                className={`L-input${error ? ' err' : ''}`}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                autoComplete="current-password"
                                disabled={loading}
                                style={{ paddingRight: 44 }}
                            />
                            {/* Button Start */}
                            <button type="button" className="L-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                                {showPw
                                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                            </button>
                            {/* Button End */}
                        </div>
                    </div>
                    {/* Password Field End */}

                    {/* Button Start */}
                    <button type="submit" className="L-submit" disabled={loading || !email || !password}>
                        {loading
                            ? <><span className="L-spinner" />Signing in…</>
                            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>Sign In to Report Center</>}
                    </button>
                    {/* Button End */}

                </form>
                {/* Form End */}

                {/* SECURED START */}
                <div className="L-divider">
                    <div className="L-divider-line" />
                    <span className="L-divider-txt">SECURED</span>
                    <div className="L-divider-line" />
                </div>
                {/* SECURED END */}

                {/* FOOTER START */}
                <div className="L-footer">
                    {COMPANY.fullName}{COMPANY.website ? ` · ${COMPANY.website}` : ''}<br />
                    <span style={{ marginTop: 4, display: 'block', opacity: .7 }}>Your session is encrypted and token-secured</span>
                </div>
                {/* FOOTER END */}
            </div>
        </div>
    );
}

/* ===================================================================
   COLUMN SELECTOR
====================================================================== */
function ColumnSelector({ columns, visible, onChange, premium = false }: {
    columns: { key: string; label: string; required?: boolean }[];
    visible: Set<string>; onChange: (v: Set<string>) => void; premium?: boolean;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, btnRef);
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!ref.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn);
    }, []);
    useLayoutEffect(() => {
        if (!open || !ref.current) { setPanelPos(null); return; }
        const reposition = () => {
            if (!ref.current) return;
            const r = ref.current.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; }
            const pw = Math.max(r.width, 240);
            const mg = 8;
            let lx = r.right - pw;
            if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
            if (lx < mg) lx = mg;
            const spaceBelow = window.innerHeight - r.bottom - mg;
            const spaceAbove = r.top - mg;
            const desired = 280;
            if (spaceBelow >= 160 || spaceBelow >= spaceAbove) {
                setPanelPos({ position: 'fixed', left: lx, top: r.bottom + 6, width: pw, zIndex: 2147483647 });
            } else {
                setPanelPos({ position: 'fixed', left: lx, bottom: window.innerHeight - r.top + 6, width: pw, zIndex: 2147483647 });
            }
        };
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open]);
    const toggle = (key: string) => { const next = new Set(visible); if (next.has(key)) next.delete(key); else next.add(key); onChange(next); };
    const visibleCount = columns.filter(c => !c.required && visible.has(c.key)).length;
    const totalOptional = columns.filter(c => !c.required).length;
    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button ref={btnRef} onClick={() => setOpen(o => !o)} onKeyDown={onTriggerKeyDown} className={`T-colbtn${premium ? ' T-colbtn-cr' : ''}`} data-open={open}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h10M4 18h7" /></svg>
                Columns <span className="T-colbtn-badge">{visibleCount}/{totalOptional}</span>
            </button>
            {open && panelPos && createPortal(
                <div ref={el => { panelRef.current = el; }} className={`T-coldrop${premium ? ' T-coldrop-cr' : ''}`} style={panelPos}>
                    <div className="T-coldrop-head">
                        <span>Visible Columns</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => onChange(new Set(columns.map(c => c.key)))} className="T-coldrop-action success">All</button>
                            <button onClick={() => onChange(new Set(columns.filter(c => c.required).map(c => c.key)))} className="T-coldrop-action danger">Clear</button>
                        </div>
                    </div>
                    <div className="T-coldrop-list">
                        {columns.map(col => (
                            <label key={col.key} className="T-coldrop-item" style={{ opacity: col.required ? 0.5 : 1, cursor: col.required ? 'not-allowed' : 'pointer' }}>
                                <input autoComplete="off" type="checkbox" checked={visible.has(col.key)} onChange={() => !col.required && toggle(col.key)} disabled={col.required} />
                                <span style={{ fontWeight: visible.has(col.key) ? 700 : 500 }}>{col.label || col.key}</span>
                                {col.required && <span className="T-fixed-tag">FIXED</span>}
                            </label>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

/* ===================================================================
   MULTI-SELECT 
====================================================================== */
interface DDOpt { value: string; label: string; sub?: string; count?: number; }
function MultiSelectDD({ opts, values, onChange, placeholder, disabled = false, accent = 'ember', labelMap, hideSelected = false }: {
    opts: DDOpt[]; values: string[]; onChange: (v: string[]) => void;
    placeholder: string; disabled?: boolean; accent?: 'ember' | 'purple' | 'info';
    labelMap?: Record<string, string>; hideSelected?: boolean;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [q, setQ] = useState('');
    const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const inp = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
    const ac = accent === 'purple' ? 'var(--purple)' : accent === 'info' ? 'var(--info)' : 'var(--ember)';
    const filtered = useMemo(() =>
        opts.filter(o => (!hideSelected || !values.includes(o.value)) &&
            (o.label.toLowerCase().includes(q.toLowerCase()) ||
                (o.sub || '').toLowerCase().includes(q.toLowerCase()))),
        [opts, q, hideSelected, values]);
    const hasVal = values.length > 0;
    const trigLabel = hasVal
        ? (values.length === 1
            ? (opts.find(o => o.value === values[0])?.label || labelMap?.[values[0]] || values[0])
            : `${values.length} selected`)
        : placeholder;

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!ref.current?.contains(t) && !panelRef.current?.contains(t)) {
                setOpen(false); setQ('');
            }
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useLayoutEffect(() => {
        if (!open || !ref.current) { setPanelPos(null); return; }
        const reposition = () => {
            if (!ref.current) return;
            const r = ref.current.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; }
            const pw = Math.max(r.width, 240);
            const mg = 8;
            let lx = r.left;
            if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
            if (lx < mg) lx = mg;
            const spaceBelow = Math.max(140, window.innerHeight - r.bottom - mg);
            const desired = 360;
            setPanelPos({ position: 'fixed', left: lx, top: r.bottom + 6, width: pw, maxHeight: Math.min(desired, spaceBelow), overflowY: 'auto', zIndex: 2147483647 });
        };

        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open]);

    useEffect(() => {
        if (open && panelPos) setTimeout(() => inp.current?.focus(), 20);
    }, [open, panelPos]);

    const toggle = (val: string) => onChange(values.includes(val) ? values.filter(v => v !== val) : [...values, val]);
    const clearAll = () => { onChange([]); setQ(''); };
    const selectAll = () => onChange(filtered.map(o => o.value));

    return (
        <div ref={ref} className="TD-wrap" data-open={open}
            style={{ minWidth: 200, opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? 'none' : 'auto', cursor: disabled ? 'not-allowed' : undefined }}>

            {/* Trigger Start */}
            <div className="TD-trigger" ref={triggerRef} tabIndex={0} role="button" aria-haspopup="listbox" aria-expanded={open}
                onClick={() => setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
                <span className={hasVal ? 'TD-val' : 'TD-ph'} style={{ color: hasVal ? ac : undefined }}>
                    {trigLabel}
                </span>
                {hasVal && (
                    <button className="TD-x" onClick={e => { e.stopPropagation(); clearAll(); }}>
                        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                <svg className="TD-caret" width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
            {/* Trigger End */}

            {/* Portal Panel */}
            {open && panelPos && createPortal(
                <div ref={el => { panelRef.current = el; }} className="TD-menu" style={panelPos}>

                    {/* Search Start */}
                    <div className="TD-search">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
                        </svg>
                        <input autoComplete="off" ref={inp} className="TD-search-inp" value={q}
                            onChange={e => setQ(e.target.value)} placeholder="Search…" />
                        {q && (
                            <button className="TD-search-clear" onClick={() => setQ('')}>
                                <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* Search End */}

                    {/* Bulk Actions Start */}
                    <div className="TD-bulk">
                        <button className="TD-bulk-btn" style={{ color: ac }} onClick={selectAll}>Select All</button>
                        <span className="TD-bulk-sep" />
                        <button className="TD-bulk-btn TD-bulk-clear" onClick={clearAll}>Clear All</button>
                    </div>
                    {/* BUlk Actions End */}

                    {/* Scrollable List Start */}
                    <div className="TD-list">
                        {filtered.length === 0
                            ? <div className="TD-empty">No results for &ldquo;{q}&rdquo;</div>
                            : filtered.map(o => {
                                const sel = values.includes(o.value);
                                return (
                                    <div key={o.value}
                                        role="option" tabIndex={-1} aria-selected={sel}
                                        className={'TD-opt TD-opt-check' + (sel ? ' sel' : '')}
                                        onClick={() => toggle(o.value)}>
                                        <span className="TD-opt-label" style={{ color: sel ? ac : undefined }}>
                                            {o.label}
                                        </span>
                                        {o.sub && <span className="TD-opt-sub">{o.sub}</span>}
                                        {o.count !== undefined && <span className="TD-count">{o.count}</span>}
                                        <div className="TD-checkbox"
                                            style={{ borderColor: sel ? ac : undefined, background: sel ? ac : undefined }}>
                                            {sel && (
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    {/* Scrollable List End */}

                    {/* Footer Start */}
                    <div className="TD-footer">
                        {values.length > 0
                            ? <>{values.length} selected · {filtered.length}/{opts.length}</>
                            : <>{filtered.length} of {opts.length} options</>
                        }
                        {values.length > 0 && (
                            <button className="TD-footer-clear" onClick={clearAll}>Clear</button>
                        )}
                    </div>
                    {/* Footer End */}
                </div>,
                document.body
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   TDrop
═══════════════════════════════════════════════════════════════ */
interface TDropOpt { value: string; label: string; }
function TDrop({ value, onChange, opts, placeholder = 'All', minWidth = 200, disabled = false }: {
    value: string; onChange: (v: string) => void;
    opts: TDropOpt[]; placeholder?: string; minWidth?: number; disabled?: boolean;
}) {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState('');
    const [panelPos, setPanelPos] = React.useState<React.CSSProperties | null>(null);
    const wrapRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        const h = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!wrapRef.current?.contains(t) && !panelRef.current?.contains(t)) {
                setOpen(false); setQ('');
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    React.useLayoutEffect(() => {
        if (!open || !wrapRef.current) { setPanelPos(null); return; }
        const reposition = () => {
            if (!wrapRef.current) return;
            const r = wrapRef.current.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; }
            const pw = Math.max(r.width, 240);
            const mg = 8;
            let lx = r.left;
            if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
            if (lx < mg) lx = mg;
            const spaceBelow = Math.max(140, window.innerHeight - r.bottom - mg);
            const desired = 360;
            setPanelPos({ position: 'fixed', left: lx, top: r.bottom + 6, width: pw, maxHeight: Math.min(desired, spaceBelow), overflowY: 'auto', zIndex: 2147483647 });
        };
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open, minWidth]);
    React.useEffect(() => {
        if (open && panelPos) setTimeout(() => inputRef.current?.focus(), 20);
    }, [open, panelPos]);
    const filtered = React.useMemo(() =>
        opts.filter(o => o.label.toLowerCase().includes(q.toLowerCase())), [opts, q]);
    const selected = opts.find(o => o.value === value);
    const clear = () => { onChange(''); setOpen(false); setQ(''); };

    return (
        <div className="TD-wrap" ref={wrapRef} data-open={open} data-disabled={disabled}
            style={{ minWidth, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : undefined }}>
            {/* Height Start */}
            <div className="TD-trigger" onClick={() => !disabled && setOpen(v => !v)}
                style={disabled ? { pointerEvents: 'none' } : undefined}>
                <span className={selected ? 'TD-val' : 'TD-ph'}>
                    {selected ? selected.label : placeholder}
                </span>
                {selected && (
                    <button className="TD-x" onClick={e => { e.stopPropagation(); clear(); }}>
                        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                <svg className="TD-caret" width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
            {/* Height End */}

            {open && panelPos && createPortal(
                <div ref={el => { panelRef.current = el; }} className="TD-menu" style={panelPos}>

                    {/* Search Start */}
                    <div className="TD-search">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
                        </svg>
                        <input autoComplete="off" ref={inputRef} className="TD-search-inp" value={q}
                            onChange={e => setQ(e.target.value)} placeholder="Search…" />
                        {q && (
                            <button className="TD-search-clear" onClick={() => setQ('')}>
                                <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* Search End */}

                    {/* Show All Start */}
                    <div className="TD-bulk">
                        <button className="TD-bulk-btn" style={{ color: 'var(--ember)' }}
                            onClick={() => { onChange(''); setQ(''); }}>
                            Show All
                        </button>
                        <span className="TD-bulk-sep" />
                        <button className="TD-bulk-btn TD-bulk-clear" onClick={clear}>Clear</button>
                    </div>
                    {/* Show All End */}

                    {/* View Box Start */}
                    <div className="TD-list">
                        {filtered.length === 0
                            ? <div className="TD-empty">No results for &ldquo;{q}&rdquo;</div>
                            : filtered.map(o => {
                                const sel = value === o.value;
                                return (
                                    <div key={o.value}
                                        className={'TD-opt TD-opt-check' + (sel ? ' sel' : '')}
                                        onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}>
                                        <div className="TD-checkbox"
                                            style={{ borderColor: sel ? 'var(--ember)' : undefined, background: sel ? 'var(--ember)' : undefined }}>
                                            {sel && (
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="TD-opt-label">{o.label}</span>
                                    </div>
                                );
                            })
                        }
                    </div>
                    {/* View Box End */}

                    {/* Footer Start */}
                    <div className="TD-footer">
                        {filtered.length} of {opts.length} options
                        {value && (
                            <button className="TD-footer-clear" onClick={clear}>Clear</button>
                        )}
                    </div>
                    {/* Footer End */}

                </div>,
                document.body
            )}
        </div>
    );
}

/* ===================================================================
   SINGLE SEARCH DROPDOWN
====================================================================== */
function SearchDD({ opts, value, onChange, placeholder, disabled = false, accent = 'ember' }: {
    opts: DDOpt[]; value: string; onChange: (v: string) => void;
    placeholder: string; disabled?: boolean; accent?: 'ember' | 'purple' | 'info';
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) { markPanelOpen(); return () => markPanelClosed(); } }, [open]);
    const [q, setQ] = useState('');
    const [panelPos, setPanelPos] = useState<React.CSSProperties | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const inp = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const onTriggerKeyDown = useDropdownTriggerKeyDown(open, setOpen);
    useDropdownPanelArrowNav(open, setOpen, panelRef, triggerRef);
    const ac = accent === 'purple' ? 'var(--purple)' : accent === 'info' ? 'var(--info)' : 'var(--ember)';
    const filtered = useMemo(() =>
        opts.filter(o => o.label.toLowerCase().includes(q.toLowerCase()) ||
            (o.sub || '').toLowerCase().includes(q.toLowerCase())),
        [opts, q]);
    const selected = opts.find(o => o.value === value);

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!ref.current?.contains(t) && !panelRef.current?.contains(t)) {
                setOpen(false); setQ('');
            }
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useLayoutEffect(() => {
        if (!open || !ref.current) { setPanelPos(null); return; }
        const reposition = () => {
            if (!ref.current) return;
            const r = ref.current.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; }
            const pw = Math.max(r.width, 240);
            const mg = 8;
            let lx = r.left;
            if (lx + pw > window.innerWidth - mg) lx = window.innerWidth - pw - mg;
            if (lx < mg) lx = mg;
            const spaceBelow = Math.max(140, window.innerHeight - r.bottom - mg);
            const desired = 360;
            setPanelPos({ position: 'fixed', left: lx, top: r.bottom + 6, width: pw, maxHeight: Math.min(desired, spaceBelow), overflowY: 'auto', zIndex: 2147483647 });
        };
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open]);

    useEffect(() => {
        if (open && panelPos) setTimeout(() => inp.current?.focus(), 20);
    }, [open, panelPos]);

    const Chk = () => (
        <svg className="TD-check" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div ref={ref} className="TD-wrap" data-open={open}
            style={{ minWidth: 200, opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? 'none' : 'auto', cursor: disabled ? 'not-allowed' : undefined }}>
            <div className="TD-trigger" ref={triggerRef} tabIndex={0} role="button" aria-haspopup="listbox" aria-expanded={open}
                onClick={() => setOpen(o => !o)} onKeyDown={onTriggerKeyDown}>
                <span className={selected ? 'TD-val' : 'TD-ph'} style={{ color: selected ? ac : undefined }}>
                    {selected ? selected.label : placeholder}
                </span>
                {selected && (
                    <button className="TD-x" onClick={e => { e.stopPropagation(); onChange(''); setQ(''); }}>
                        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                <svg className="TD-caret" width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>

            {open && panelPos && createPortal(
                <div ref={el => { panelRef.current = el; }} className="TD-menu" style={panelPos}>
                    {/* PlaceHolder Start */}
                    <div className="TD-search">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
                        </svg>
                        <input autoComplete="off" ref={inp} className="TD-search-inp" value={q}
                            onChange={e => setQ(e.target.value)} placeholder="Search…" />
                        {q && (
                            <button className="TD-search-clear" onClick={() => setQ('')}>
                                <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* PlaceHolder End */}

                    {/* No Results Start */}
                    <div className="TD-list">
                        {value && (
                            <div className="TD-opt" role="option" tabIndex={-1} aria-selected={false} onClick={() => { onChange(''); setOpen(false); setQ(''); }}>
                                <span className="TD-opt-label" style={{ color: 'var(--err)' }}>✕ Clear selection</span>
                            </div>
                        )}
                        {filtered.length === 0
                            ? <div className="TD-empty">No results for &ldquo;{q}&rdquo;</div>
                            : filtered.map(o => (
                                <div key={o.value}
                                    role="option" tabIndex={-1} aria-selected={value === o.value}
                                    className={'TD-opt' + (value === o.value ? ' sel' : '')}
                                    onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}>
                                    <span className="TD-opt-label" style={{ color: value === o.value ? ac : undefined }}>
                                        {o.label}
                                    </span>
                                    {o.sub && <span className="TD-opt-sub">{o.sub}</span>}
                                    {value === o.value && <Chk />}
                                </div>
                            ))
                        }
                    </div>
                    {/* NO Results End */}
                    <div className="TD-footer">{filtered.length} of {opts.length} options</div>
                </div>,
                document.body
            )}
        </div>
    );
}

/* ===================================================================
   PILL
====================================================================== */
const PILL_MAP: Record<string, { bg: string; c: string }> = {
    income: { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    expense: { bg: 'var(--error-bg,rgba(217,59,85,0.10))', c: 'var(--error,#D93B55)' },
    paid: { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    clear: { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    completed: { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    overdue: { bg: 'var(--error-bg,rgba(217,59,85,0.10))', c: 'var(--error,#D93B55)' },
    on_hold: { bg: 'var(--error-bg,rgba(217,59,85,0.10))', c: 'var(--error,#D93B55)' },
    high: { bg: 'var(--error-bg,rgba(217,59,85,0.10))', c: 'var(--error,#D93B55)' },
    partial: { bg: 'var(--warn-bg,rgba(154,52,18,0.10))', c: 'var(--warn,#9A3412)' },
    upi: { bg: 'var(--warn-bg,rgba(154,52,18,0.10))', c: 'var(--warn,#9A3412)' },
    UPI: { bg: 'var(--warn-bg,rgba(154,52,18,0.10))', c: 'var(--warn,#9A3412)' },
    Cheque: { bg: 'var(--warn-bg,rgba(154,52,18,0.10))', c: 'var(--warn,#9A3412)' },
    cheque: { bg: 'var(--warn-bg,rgba(154,52,18,0.10))', c: 'var(--warn,#9A3412)' },
    pending: { bg: 'var(--info-bg,rgba(219,91,31,0.10))', c: 'var(--info,#DB5B1F)' },
    active: { bg: 'var(--info-bg,rgba(219,91,31,0.10))', c: 'var(--info,#DB5B1F)' },
    medium: { bg: 'var(--info-bg,rgba(219,91,31,0.10))', c: 'var(--info,#DB5B1F)' },
    NEFT: { bg: 'rgba(166,73,29,0.10)', c: '#A6491D' },
    'Bank Transfer': { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    bank_transfer: { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    low: { bg: 'var(--success-bg,rgba(30,156,106,0.10))', c: 'var(--success,#1E9C6A)' },
    cash: { bg: 'rgba(140,124,99,0.12)', c: 'var(--text-3,#6B5D48)' },
    Cash: { bg: 'rgba(140,124,99,0.12)', c: 'var(--text-3,#6B5D48)' },
    inactive: { bg: 'rgba(140,124,99,0.12)', c: 'var(--text-3,#6B5D48)' },
    due: { bg: 'var(--error-bg,rgba(217,59,85,0.10))', c: 'var(--error,#D93B55)' },
};

const Pill = ({ label }: { label: string }) => {
    if (!label) return <span style={{ color: 'var(--t4)' }}>—</span>;
    const s = PILL_MAP[label] || PILL_MAP[label.toLowerCase()] || { bg: 'rgba(140,124,99,0.12)', c: 'var(--text-3,#6B5D48)' };
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 4, background: s.bg, color: s.c, fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />{label}</span>;
};

const SK = ({ h = 40 }: { h?: number }) => <div style={{ height: h, background: 'linear-gradient(90deg,var(--surface,#F5F3EF) 25%,rgba(255,255,255,0.85) 50%,var(--surface,#F5F3EF) 75%)', backgroundSize: '700px 100%', animation: 'T-shimmer 1.8s ease infinite', borderRadius: 6, marginBottom: 8 }} />;

function MiniBarChart({ data, loading }: { data: MonthlyData[]; loading: boolean }) {
    const [hov, setHov] = useState<number | null>(null);
    if (loading) return <div style={{ padding: 20 }}><SK h={120} /></div>;
    if (!data?.length) return <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t4)' }}>No monthly data</div>;
    const max = Math.max(...data.map(d => d.total || d.collected || d.grand_total || 0), 1);
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, padding: '20px 24px 12px' }}>
                {data.map((d, i) => {
                    const val = d.total || d.collected || d.grand_total || 0; const pct = (val / max) * 100;
                    return (
                        <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative', cursor: 'pointer' }} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
                            {hov === i && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: 'var(--text-1,#231C14)', color: '#faf9f7', borderRadius: 5, padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 8, whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>{fmtINR(val)}</div>}
                            <div style={{ width: '100%', height: `${Math.max(pct, 4)}%`, borderRadius: '3px 3px 0 0', background: 'linear-gradient(180deg,var(--ember),var(--amber))', opacity: hov !== null && hov !== i ? .4 : 1, transition: 'all .25s', boxShadow: hov === i ? 'var(--sh-ember,0 4px 18px rgba(154,52,18,0.22))' : 'none' }} />
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '0 24px 16px' }}>
                {data.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--t4)' }}>{d.month_label || d.month || `M${i + 1}`}</div>)}
            </div>
        </>
    );
}

function AgingBars({ overdue, pending, paid, total, loading }: { overdue: number; pending: number; paid: number; total: number; loading: boolean; }) {
    if (loading) return <div style={{ padding: 20 }}>{[1, 2, 3].map(i => <SK key={i} h={32} />)}</div>;
    const st = total > 0 ? total : 1;
    return (
        <div style={{ padding: '20px 24px' }}>
            {[
                { label: 'Outstanding Balance', val: overdue, color: 'var(--error,#D93B55)', pct: (overdue / st) * 100 },
                { label: 'Pending (Unallocated)', val: pending, color: 'var(--warn,#9A3412)', pct: (pending / st) * 100 },
                { label: 'Total Paid', val: paid, color: 'var(--success,#1E9C6A)', pct: (paid / st) * 100 },
            ].map((b, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--t2)' }}>{b.label}</span>
                        <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontStyle: 'italic', color: b.color }}>{fmtINR(b.val)}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(b.pct, 100)}%`, background: b.color, borderRadius: 99, transition: 'width .9s cubic-bezier(.22,1,.36,1)' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--t4)', marginTop: 3, textAlign: 'right' }}>{b.pct.toFixed(1)}% of total</div>
                </div>
            ))}
        </div>
    );
}

function ModDiv({ num, label }: { num: string; label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '36px 36px 20px', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ember), var(--amber))', color: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 10.5, flexShrink: 0, boxShadow: 'var(--sh-ember,0 4px 18px rgba(154,52,18,0.22))', animation: 'T-pulse-gentle 3s ease-in-out infinite' }}>{num}</div>
                <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1.5px solid var(--ember-border)', animation: 'T-ring-pulse 3s ease-in-out infinite' }} />
            </div>
            <div style={{ flex: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 7.5, fontWeight: 800, letterSpacing: 3, color: 'var(--ember)', textTransform: 'uppercase', marginBottom: 3 }}>MODULE {num}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 19.5, fontStyle: 'italic', color: 'var(--t1)', whiteSpace: 'nowrap' }}>{label}</div>
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--ember-border),rgba(219,91,31,.06))' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 10px rgba(219,91,31,.45)', animation: 'T-pulse-gentle 2s ease-in-out infinite' }} />
        </div>
    );
}

function PdfBtn({ label, onClick, loading, disabled }: { label: string; onClick: () => void; loading: boolean; disabled: boolean }) {
    return (
        <button onClick={onClick} disabled={disabled || loading} className="T-pdf-btn" title={disabled ? 'Choose a filter and load data in the table first' : `Export ${label} to PDF`}>
            {loading ? <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#faf9f7', borderRadius: '50%', display: 'inline-block', animation: 'T-spin .65s linear infinite' }} /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
            {loading ? 'Generating…' : 'Export PDF'}
        </button>
    );
}

/* ===================================================================
   MAIN COMPONENT
====================================================================== */
export type ReportSection = 'all' | 'daybook' | 'credit' | 'labour' | 'client';

export default function ReportCenter({ section = 'all' }: { section?: ReportSection }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!tk());
    useEffect(() => {
        const handler = () => setIsAuthenticated(false);
        window.addEventListener(AUTH_FAIL_EVENT, handler);
        return () => window.removeEventListener(AUTH_FAIL_EVENT, handler);
    }, []);

    const handleLogin = () => setIsAuthenticated(true);
    const handleLogout = () => {
        clearToken();
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }
    return <ReportDashboard onLogout={handleLogout} section={section} />;
}

const T_ACCENT: Record<ReportSection, string> = { all: '#C2410C', daybook: '#C2410C', credit: '#C2410C', labour: '#C2410C', client: '#C2410C' };
const MODE_COLORS: Record<string, string> = {
    Cash: '#1E9C6A', UPI: '#DB5B1F', NEFT: '#9A3412', Cheque: '#C2410C',
    'Bank Transfer': '#A6491D', Others: '#6B5D48',
};

const modeColor = (mode: string) => MODE_COLORS[mode] || '#6B5D48';

const MODE_COLORS_RGB: Record<string, [number, number, number]> = {
    Cash: [30, 156, 106], UPI: [40, 112, 204], NEFT: [196, 126, 10],
    Cheque: [155, 69, 204], 'Bank Transfer': [8, 145, 178], Others: [107, 107, 107],
};

const pdfTint = (rgb: [number, number, number], amt: number): [number, number, number] =>
    [rgb[0], rgb[1], rgb[2]].map(c => Math.round(c + (255 - c) * amt)) as [number, number, number];

function drawModeBadge(doc: any, mode: string, cx: number, cy: number) {
    const key = mode && MODE_COLORS_RGB[mode] ? mode : 'Others';
    const rgb = MODE_COLORS_RGB[key];
    const bg = pdfTint(rgb, 0.87);
    const bd = pdfTint(rgb, 0.55);
    const half = 2.5;

    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.setDrawColor(bd[0], bd[1], bd[2]);
    doc.setLineWidth(0.15);
    doc.roundedRect(cx - half, cy - half, half * 2, half * 2, 0.8, 0.8, 'FD');
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.setLineWidth(0.26);

    switch (key) {
        case 'Cash':
            doc.roundedRect(cx - 1.5, cy - 1.05, 3, 2.1, 0.35, 0.35, 'S');
            doc.circle(cx, cy, 0.5, 'S');
            break;
        case 'UPI':
            doc.roundedRect(cx - 0.9, cy - 1.5, 1.8, 3, 0.35, 0.35, 'S');
            doc.line(cx - 0.35, cy + 0.95, cx + 0.35, cy + 0.95);
            break;
        case 'NEFT':
            doc.triangle(cx - 1.5, cy - 0.35, cx + 1.5, cy - 0.35, cx, cy - 1.55, 'S');
            doc.line(cx - 1.5, cy - 0.35, cx - 1.5, cy + 1.25);
            doc.line(cx - 0.6, cy - 0.05, cx - 0.6, cy + 1.05);
            doc.line(cx + 0.6, cy - 0.05, cx + 0.6, cy + 1.05);
            doc.line(cx + 1.5, cy - 0.35, cx + 1.5, cy + 1.25);
            doc.line(cx - 1.7, cy + 1.25, cx + 1.7, cy + 1.25);
            break;
        case 'Cheque':
            doc.roundedRect(cx - 1.6, cy - 1.2, 3.2, 2.4, 0.3, 0.3, 'S');
            doc.line(cx - 0.95, cy - 0.35, cx + 0.95, cy - 0.35);
            doc.line(cx - 0.95, cy + 0.35, cx + 0.35, cy + 0.35);
            break;
        case 'Bank Transfer':
            doc.line(cx - 1.6, cy - 0.55, cx + 1.1, cy - 0.55);
            doc.line(cx + 0.4, cy - 1.15, cx + 1.3, cy - 0.55);
            doc.line(cx + 0.4, cy + 0.05, cx + 1.3, cy - 0.55);
            doc.line(cx + 1.6, cy + 0.55, cx - 1.1, cy + 0.55);
            doc.line(cx - 0.4, cy + 1.15, cx - 1.3, cy + 0.55);
            doc.line(cx - 0.4, cy - 0.05, cx - 1.3, cy + 0.55);
            break;
        default:
            doc.circle(cx - 1, cy, 0.35, 'F');
            doc.circle(cx, cy, 0.35, 'F');
            doc.circle(cx + 1, cy, 0.35, 'F');
    }
}

const STAT_ICON_PATHS: Record<string, string> = {
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    cash: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    bank: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    scale: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V4a2 2 0 00-2-2H6.5A2.5 2.5 0 004 4.5v15z',
    people: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    card: 'M2 7h20M2 7a2 2 0 012-2h16a2 2 0 012 2M2 7v10a2 2 0 002 2h16a2 2 0 002-2V7M6 15h4',
    mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    transfer: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    more: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
};

const MODE_ICON_NAME: Record<string, string> = {
    Cash: 'cash', UPI: 'mobile', NEFT: 'bank', Cheque: 'document', 'Bank Transfer': 'transfer', Others: 'more',
};

const ModeIcon = ({ mode }: { mode: string }) => {
    if (!mode || mode === '—') return <span className="T-tbl-null">—</span>;
    const color = modeColor(mode);
    return (
        <span className="DB-mode-icon" style={{ background: color + '18', borderColor: color + '40' }} title={mode}>
            <StatIcon name={MODE_ICON_NAME[mode] || 'more'} size={11} color={color} />
        </span>
    );
};

const StatIcon = ({ name, color, size = 17 }: { name: string; color: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d={STAT_ICON_PATHS[name]} />
    </svg>
);

function ReportDashboard({ onLogout, section }: { onLogout: () => void; section: ReportSection }) {
    const hdrAccent = T_ACCENT[section];
    const [fromDate, setFromDate] = useState('2000-01-01');
    const [toDate, setToDate] = useState(today());
    const [fromDateDraft, setFromDateDraft] = useState('2000-01-01');
    const [toDateDraft, setToDateDraft] = useState(today());
    const [dbFromTouched, setDbFromTouched] = useState(false);
    const [dbToTouched, setDbToTouched] = useState(false);
    const [dbDateApplied, setDbDateApplied] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [serverError, setServerError] = useState(false);
    const flagServerError = (e: any) => { if (!e?.response) setServerError(true); };
    const [dbEntries, setDbEntries] = useState<DaybookEntry[]>([]);
    const [dbAllEntries, setDbAllEntries] = useState<DaybookEntry[]>([]);
    const [dbLoading, setDbLoading] = useState(true);
    const [dbStats, setDbStats] = useState<DbStats | null>(null);
    const DB_FILTER_EMPTY: DbFilter = { payment_modes: [], category_ids: [], sub_category_ids: [], search: '', bio_data_ids: [], sub_name_ids: [], client_names: [] };
    const [dbFilter, setDbFilter] = useState<DbFilter>({ payment_modes: [], category_ids: [], sub_category_ids: [], search: '', bio_data_ids: [], sub_name_ids: [], client_names: [] });
    const [dbFilterDraft, setDbFilterDraft] = useState<DbFilter>({ payment_modes: [], category_ids: [], sub_category_ids: [], search: '', bio_data_ids: [], sub_name_ids: [], client_names: [] });
    const [dbIncludeLabour, setDbIncludeLabour] = useState(false);
    const [dbIncludeCredit, setDbIncludeCredit] = useState(false);
    const [dbIncludeLabourDraft, setDbIncludeLabourDraft] = useState(false);
    const [dbIncludeCreditDraft, setDbIncludeCreditDraft] = useState(false);
    const [dbSearchPulse, setDbSearchPulse] = useState(false);
    const [dbCategories, setDbCategories] = useState<CategoryOption[]>([]);
    const [catTypeMap, setCatTypeMap] = useState<Record<string, 'income' | 'expense'>>({});
    const [laborSessions, setLaborSessions] = useState<AllPaymentSession[]>([]);
    const [laborLoading, setLaborLoading] = useState(true);
    const [lbAttendance, setLbAttendance] = useState<AttendanceRow[]>([]);
    const [lbWorkers, setLbWorkers] = useState<LabourWorker[]>([]);
    const [lbNameFilters, setLbNameFilters] = useState<string[]>([]);
    const [lbClientNameFilters, setLbClientNameFilters] = useState<string[]>([]);
    const [lbSiteFilters, setLbSiteFilters] = useState<string[]>([]);
    const [lbPaymentModeFilters, setLbPaymentModeFilters] = useState<string[]>([]);
    const [lbDateFrom, setLbDateFrom] = useState('2000-01-01');
    const [lbDateTo, setLbDateTo] = useState(today());
    const [lbDateFromDraft, setLbDateFromDraft] = useState('2000-01-01');
    const [lbDateToDraft, setLbDateToDraft] = useState(today());
    const [lbDateFromTouched, setLbDateFromTouched] = useState(false);
    const [lbDateToTouched, setLbDateToTouched] = useState(false);
    const [lbDateApplied, setLbDateApplied] = useState(false);
    const [lbSubNameFilters, setLbSubNameFilters] = useState<string[]>([]);
    const [lbNameFiltersDraft, setLbNameFiltersDraft] = useState<string[]>([]);
    const [lbSubNameFiltersDraft, setLbSubNameFiltersDraft] = useState<string[]>([]);
    const [lbClientNameFiltersDraft, setLbClientNameFiltersDraft] = useState<string[]>([]);
    const [lbSiteFiltersDraft, setLbSiteFiltersDraft] = useState<string[]>([]);
    const [lbPaymentModeFiltersDraft, setLbPaymentModeFiltersDraft] = useState<string[]>([]);
    const [lbSearchPulse, setLbSearchPulse] = useState(false);
    const [lbPdfLoading, setLbPdfLoading] = useState(false);
    const [lbVisibleCols, setLbVisibleCols] = useState<Set<string>>(new Set(LB_COLUMNS.map(c => c.key)));
    const [bioDataList, setBioDataList] = useState<BioData[]>([]);
    const [subNameList, setSubNameList] = useState<SubName[]>([]);
    const [subCategoryList, setSubCategoryList] = useState<SubCategoryMaster[]>([]);
    const [dbPage, setDbPage] = useState(1);
    const [dbPdfLoading, setDbPdfLoading] = useState(false);
    const [dbVisibleCols, setDbVisibleCols] = useState<Set<string>>(new Set(DB_COLUMNS.map(c => c.key)));
    const [dbPerPage, setDbPerPage] = useState(25);
    const [crPage, setCrPage] = useState(1);
    const [cpPage, setCpPage] = useState(1);
    const [lbPage, setLbPage] = useState(1);
    const REPORT_PER_PAGE = 25;
    const [crPerPage, setCrPerPage] = useState(25);
    const [cpPerPage, setCpPerPage] = useState(25);
    const [lbPerPage, setLbPerPage] = useState(25);
    const safeCrPerPage = crPerPage > 0 ? crPerPage : 25;
    const safeCpPerPage = cpPerPage > 0 ? cpPerPage : 25;
    const safeLbPerPage = lbPerPage > 0 ? lbPerPage : 25;
    const [crSummary, setCrSummary] = useState<CreditSummary | null>(null);
    const [crVendors, setCrVendors] = useState<CreditVendor[]>([]);
    const [crLoading, setCrLoading] = useState(true);
    const [crStatusFilters, setCrStatusFilters] = useState<string[]>([]);
    const [crNameFilters, setCrNameFilters] = useState<string[]>([]);
    const [crCategoryIdFilters, setCrCategoryIdFilters] = useState<string[]>([]);
    const [crSubCategoryIdFilters, setCrSubCategoryIdFilters] = useState<string[]>([]);
    const [crPaymentModeFilters, setCrPaymentModeFilters] = useState<string[]>([]);
    const [crClientNameFilters, setCrClientNameFilters] = useState<string[]>([]);
    const [crStatusFiltersDraft, setCrStatusFiltersDraft] = useState<string[]>([]);
    const [crNameFiltersDraft, setCrNameFiltersDraft] = useState<string[]>([]);
    const [crCategoryIdFiltersDraft, setCrCategoryIdFiltersDraft] = useState<string[]>([]);
    const [crSubCategoryIdFiltersDraft, setCrSubCategoryIdFiltersDraft] = useState<string[]>([]);
    const [crPaymentModeFiltersDraft, setCrPaymentModeFiltersDraft] = useState<string[]>([]);
    const [crClientNameFiltersDraft, setCrClientNameFiltersDraft] = useState<string[]>([]);
    const [crSearchPulse, setCrSearchPulse] = useState(false);
    const [crDateFrom, setCrDateFrom] = useState('2000-01-01');
    const [crDateTo, setCrDateTo] = useState(today());
    const [crDateFromDraft, setCrDateFromDraft] = useState('2000-01-01');
    const [crDateToDraft, setCrDateToDraft] = useState(today());
    const [crDateFromTouched, setCrDateFromTouched] = useState(false);
    const [crDateToTouched, setCrDateToTouched] = useState(false);
    const [crDateApplied, setCrDateApplied] = useState(false);
    const [openVendorIds, setOpenVendorIds] = useState<Set<number>>(new Set());
    const [vendorTab, setVendorTab] = useState<Record<number, 'bills' | 'payments' | 'timeline'>>({});
    const [crPdfLoading, setCrPdfLoading] = useState(false);
    const [crVisibleCols, setCrVisibleCols] = useState<Set<string>>(new Set(CR_COLUMNS.map(c => c.key)));
    const [cpSummary, setCpSummary] = useState<ClientPortalSummary | null>(null);
    const [cpProjects, setCpProjects] = useState<ClientProject[]>([]);
    const [cpMonthly, setCpMonthly] = useState<MonthlyData[]>([]);
    const [cpLoading, setCpLoading] = useState(true);
    const [cpAllLoaded, setCpAllLoaded] = useState(false);
    const [cpLoadingStatus, setCpLoadingStatus] = useState('');
    const [cpStatusFilters, setCpStatusFilters] = useState<string[]>([]);
    const [cpClientNameFilters, setCpClientNameFilters] = useState<string[]>([]);
    const [cpTypeFilters, setCpTypeFilters] = useState<string[]>([]);
    const [cpPaymentModeFilters, setCpPaymentModeFilters] = useState<string[]>([]);
    const [cpStatusFiltersDraft, setCpStatusFiltersDraft] = useState<string[]>([]);
    const [cpClientNameFiltersDraft, setCpClientNameFiltersDraft] = useState<string[]>([]);
    const [cpTypeFiltersDraft, setCpTypeFiltersDraft] = useState<string[]>([]);
    const [cpPaymentModeFiltersDraft, setCpPaymentModeFiltersDraft] = useState<string[]>([]);
    const [cpSearchPulse, setCpSearchPulse] = useState(false);
    const [cpDateFrom, setCpDateFrom] = useState('2000-01-01');
    const [cpDateTo, setCpDateTo] = useState(today());
    const [cpDateFromDraft, setCpDateFromDraft] = useState('2000-01-01');
    const [cpDateToDraft, setCpDateToDraft] = useState(today());
    const [cpDateFromTouched, setCpDateFromTouched] = useState(false);
    const [cpDateToTouched, setCpDateToTouched] = useState(false);
    const [cpDateApplied, setCpDateApplied] = useState(false);
    const [openProjectId, setOpenProjectId] = useState<number | null>(null);
    const [cpPdfLoading, setCpPdfLoading] = useState(false);
    const [cpVisibleCols, setCpVisibleCols] = useState<Set<string>>(new Set(CP_COLUMNS.map(c => c.key)));
    const bioOpts: DDOpt[] = React.useMemo(() => {
        if (!dbFilterDraft.category_ids.length) return [];
        const idCounts: Record<string, number> = {}; const nameCounts: Record<string, number> = {};
        dbAllEntries.forEach(e => { const bid = normId(e.bio_data_id); if (bid) idCounts[bid] = (idCounts[bid] || 0) + 1; const cn = (e.client_name || '').trim().toLowerCase(); if (cn) nameCounts[cn] = (nameCounts[cn] || 0) + 1; });
        return bioDataList
            .filter(b => dbFilterDraft.category_ids.includes(String(b.category_id ?? '')))
            .filter(b => !dbFilterDraft.sub_category_ids.length || dbFilterDraft.sub_category_ids.includes(String(b.sub_category_id ?? '')))
            .map(b => { const idC = idCounts[normId(b.id)] || 0; const nameC = nameCounts[b.name.trim().toLowerCase()] || 0; return { value: normId(b.id), label: b.name, count: Math.max(idC, nameC) }; });
    }, [bioDataList, dbAllEntries, dbFilterDraft.category_ids, dbFilterDraft.sub_category_ids]);
    const bioLabelMap: Record<string, string> = React.useMemo(() => Object.fromEntries(bioDataList.map(b => [normId(b.id), b.name])), [bioDataList]);
    const subLabelMap: Record<string, string> = React.useMemo(() => Object.fromEntries(subNameList.map(s => [normId(s.id), s.alternate_name])), [subNameList]);
    const availSubNames = dbFilterDraft.bio_data_ids.length > 0
        ? subNameList.filter(s => { const sid = normId(s.bio_data_id); if (dbFilterDraft.bio_data_ids.includes(sid)) return true; const bioName = bioLabelMap[sid]; if (bioName && dbFilterDraft.bio_data_ids.includes(normId(bioName))) return true; return false; })
        : [];
    const subNameOpts: DDOpt[] = availSubNames.map(s => ({ value: normId(s.id), label: s.alternate_name }));
    const crNonLabourVendors = React.useMemo(() => crVendors.filter(v => (v.category_name || '').trim().toLowerCase() !== 'labour'), [crVendors]);
    const crCategoryIdOpts: DDOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: DDOpt[] = [];
        crNonLabourVendors.forEach(v => {
            const id = v.category_id != null ? String(v.category_id) : '';
            if (id && v.category_name && !seen.has(id)) { seen.add(id); out.push({ value: id, label: v.category_name }); }
        });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [crNonLabourVendors]);
    const crSubCategoryIdOpts: DDOpt[] = React.useMemo(() => {
        if (!crCategoryIdFiltersDraft.length) return [];
        return subCategoryList
            .filter(sc => sc.category_ids?.length ? sc.category_ids.some(id => crCategoryIdFiltersDraft.includes(String(id))) : crCategoryIdFiltersDraft.includes(String(sc.category_id ?? '')))
            .map(sc => ({ value: normId(sc.id), label: sc.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [subCategoryList, crCategoryIdFiltersDraft]);
    const crVendorNameOpts: DDOpt[] = React.useMemo(() => {
        if (!crCategoryIdFiltersDraft.length) return [];
        const seen = new Set<string>();
        return crNonLabourVendors
            .filter(v => crCategoryIdFiltersDraft.includes(String(v.category_id ?? '')))
            .filter(v => !crSubCategoryIdFiltersDraft.length || crSubCategoryIdFiltersDraft.includes(String(v.sub_category_id ?? '')))
            .filter(v => v.party_name && !seen.has(v.party_name) && seen.add(v.party_name))
            .map(v => ({ value: v.party_name!, label: v.party_name! }));
    }, [crNonLabourVendors, crCategoryIdFiltersDraft, crSubCategoryIdFiltersDraft]);
    const cpTypeOpts: DDOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: DDOpt[] = [];
        cpProjects.forEach(p => {
            const t = (p.project_type || '').toLowerCase();
            if (t && !seen.has(t)) { seen.add(t); out.push({ value: t, label: labelForType(p.project_type) }); }
        });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [cpProjects]);

    const cpStatusOpts: DDOpt[] = React.useMemo(() => {
        const label = (s: string) => s === 'active' ? 'Active' : s === 'on_hold' ? 'On Hold' : s === 'completed' ? 'Completed' : s;
        const seen = new Set<string>(); const out: DDOpt[] = [];
        cpProjects
            .filter(p => !cpTypeFiltersDraft.length || cpTypeFiltersDraft.includes((p.project_type || '').toLowerCase()))
            .forEach(p => { const st = (p.status || '').toLowerCase(); if (st && !seen.has(st)) { seen.add(st); out.push({ value: st, label: label(st) }); } });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [cpProjects, cpTypeFiltersDraft]);

    const cpClientNameOpts: DDOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: DDOpt[] = [];
        cpProjects
            .filter(p => !cpTypeFiltersDraft.length || cpTypeFiltersDraft.includes((p.project_type || '').toLowerCase()))
            .filter(p => !cpStatusFiltersDraft.length || cpStatusFiltersDraft.includes((p.status || '').toLowerCase()))
            .forEach(p => { if (p.client_name && !seen.has(p.client_name)) { seen.add(p.client_name); out.push({ value: p.client_name, label: p.client_name }); } });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [cpProjects, cpTypeFiltersDraft, cpStatusFiltersDraft]);

    const entryCatTypeMap: Record<string, 'income' | 'expense'> = React.useMemo(() => {
        const map: Record<string, 'income' | 'expense'> = {};
        dbAllEntries.forEach(e => {
            if (e.category_id != null && (e.category_type === 'income' || e.category_type === 'expense')) {
                map[String(e.category_id)] = e.category_type as 'income' | 'expense';
            }
        });
        return map;
    }, [dbAllEntries]);

    const dbClientNameOpts: TDropOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        const add = (nm: string | null | undefined, label?: string) => {
            const t = (nm || '').trim();
            if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push({ value: t, label: label || t }); }
        };

        bioDataList.forEach(b => {
            const catId = b.category_id != null ? String(b.category_id) : '';
            const isIncome = !!catId && (catTypeMap[catId] === 'income' || entryCatTypeMap[catId] === 'income');
            if (!isIncome) return;
            const nm = (b.name || '').trim();
            add(nm);
            subNameList.filter(s => normId(s.bio_data_id) === normId(b.id)).forEach(s => {
                const snm = (s.alternate_name || '').trim();
                if (snm) add(snm, `${snm} (${nm})`);
            });
        });

        dbAllEntries.forEach(e => add(e.client_name));
        laborSessions.forEach(s => (s.clients || []).forEach(c => add(c.client_name)));
        crVendors.forEach(v => {
            (v.entries || []).forEach(en => add(en.client_name));
            (v.payments || []).forEach(p => add(p.client_name));
        });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [bioDataList, subNameList, catTypeMap, entryCatTypeMap, dbAllEntries, laborSessions, crVendors]);
    const dbExpenseCategoryOpts: TDropOpt[] = React.useMemo(() => {
        if (dbCategories.length) {
            return dbCategories
                .filter(c => c.type === 'expense')
                .map(c => ({ value: c.id, label: c.name }))
                .sort((a, b) => a.label.localeCompare(b.label));
        }
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        dbAllEntries.forEach(e => {
            const id = e.category_id != null ? String(e.category_id) : '';
            if (e.category_type === 'expense' && id && e.category_name && !seen.has(id)) { seen.add(id); out.push({ value: id, label: e.category_name }); }
        });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [dbCategories, dbAllEntries]);
    const dbSubCategoryOpts: TDropOpt[] = React.useMemo(() => {
        if (!dbFilterDraft.category_ids.length) return [];
        return subCategoryList
            .filter(sc => dbFilterDraft.category_ids.includes(String(sc.category_id ?? '')))
            .map(sc => ({ value: normId(sc.id), label: sc.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [subCategoryList, dbFilterDraft.category_ids]);
    const labourAsDaybookRows: DaybookEntry[] = React.useMemo(() => {
        const rows: DaybookEntry[] = [];
        laborSessions.forEach((s, si) => {
            const paidAt = (s.paid_at || '').slice(0, 10);
            if (fromDate && paidAt < fromDate) return;
            if (toDate && paidAt > toDate) return;
            (s.clients || []).forEach((c, ci) => {
                const amt = Number(c.allocated) || 0;
                if (amt <= 0) return;
                rows.push({
                    id: -1_000_000 - si * 1000 - ci,
                    transaction_date: paidAt,
                    amount: amt,
                    payment_mode: s.payment_mode || 'Cash',
                    narration: s.notes || '',
                    client_name: c.client_name || '',
                    category_name: 'Wage Disbursement',
                    category_type: 'expense',
                    category_id: -1,
                    sub_category_name: '',
                    sub_category_id: '',
                    bio_data_name: s.worker_name || 'Worker',
                    bio_data_id: -1,
                    sub_name_name: '',
                    sub_name_id: '',
                    source: 'labour',
                });
            });
        });
        return rows;
    }, [laborSessions, fromDate, toDate]);
    const creditAsDaybookRows: DaybookEntry[] = React.useMemo(() => {
        const rows: DaybookEntry[] = [];
        crVendors.forEach((v, vi) => {
            const vEntries = (v.entries || []) as CreditEntry[];
            ((v.payments || []) as CreditPayment[]).forEach((p, pi) => {
                const paid = Number(p.amount_paid) || 0;
                if (paid <= 0) return;
                const d = (p.payment_date || '').slice(0, 10);
                if (fromDate && d < fromDate) return;
                if (toDate && d > toDate) return;
                const linkedBill = p.credit_entry_id != null ? vEntries.find(e => e.id === p.credit_entry_id) : undefined;
                rows.push({
                    id: -2_000_000 - vi * 1000 - pi,
                    transaction_date: d,
                    amount: paid,
                    payment_mode: p.payment_mode || 'Credit',
                    narration: p.notes || linkedBill?.description || (linkedBill?.bill_number ? `Bill #${linkedBill.bill_number}` : ''),
                    client_name: p.client_name || linkedBill?.client_name || '',
                    category_name: v.category_name || 'Accounts Payable',
                    category_type: 'expense',
                    category_id: -2,
                    sub_category_name: '',
                    sub_category_id: '',
                    bio_data_name: v.party_name || v.business_name || 'Vendor',
                    bio_data_id: -2,
                    sub_name_name: '',
                    sub_name_id: '',
                    source: 'credit',
                });
            });
        });
        return rows;
    }, [crVendors, fromDate, toDate]);
    useEffect(() => {
        const load = async () => {
            const token = tk(); if (!token) return;
            try {
                const masterRes = await axiosInstance.get('master-data', { headers: H(), timeout: 15000 });
                const bios = masterRes.data?.bio_data;
                const subs = masterRes.data?.sub_names;
                const cats = masterRes.data?.categories;
                const subCats = masterRes.data?.sub_categories;
                setBioDataList(Array.isArray(bios) ? bios : []);
                setSubNameList(Array.isArray(subs) ? subs : []);
                setSubCategoryList(Array.isArray(subCats) ? subCats : []);
                if (Array.isArray(cats) && cats.length) {
                    const map: Record<string, 'income' | 'expense'> = {};
                    cats.forEach((c: { id: number | string; type?: string }) => { if (c?.id != null && (c.type === 'income' || c.type === 'expense')) map[String(c.id)] = c.type; });
                    setCatTypeMap(map);
                    setDbCategories(cats
                        .filter((c: { id: number | string; name?: string; type?: string }) => c?.id != null && c.name)
                        .map((c: { id: number | string; name: string; type?: string }) => ({ id: String(c.id), name: c.name, type: c.type === 'income' ? 'income' : 'expense' })));
                } else {
                    console.warn('[ReportCenter] /master-data returned no categories — Client Name filter will fall back to entries-only matching.');
                }
            } catch (e) { console.error('[ReportCenter] master-data fetch failed', e); flagServerError(e); }
        };
        load();
    }, []);

    const applyDbNameFilter = useCallback((entries: DaybookEntry[], bioIds: string[], subIds: string[]): DaybookEntry[] => {
        if (!bioIds.length) return entries;
        const selectedBioNamesLower = bioIds.map(id => bioDataList.find(b => normId(b.id) === id)?.name?.trim().toLowerCase()).filter(Boolean) as string[];
        let filtered = entries.filter(e => { const idMatch = bioIds.includes(normId(e.bio_data_id)); const nameMatch = !!e.client_name && selectedBioNamesLower.includes(e.client_name.trim().toLowerCase()); return idMatch || nameMatch; });
        if (subIds.length > 0) filtered = filtered.filter(e => subIds.includes(normId(e.sub_name_id)));
        return filtered;
    }, [bioDataList]);

    const computeStats = (entries: DaybookEntry[]): DbStats => { let income = 0, expense = 0; for (const e of entries) { const a = Number(e.amount) || 0; if (e.category_type === 'income') income += a; else expense += a; } return { income, expense, balance: income - expense }; };

    const fetchDaybook = useCallback(async () => {
        setDbLoading(true); setServerError(false);
        try {
            const token = tk(); if (!token) { setDbAllEntries([]); setDbEntries([]); setDbStats(null); return; }
            const params: Record<string, string> = { from_date: fromDate, to_date: toDate };

            let entries: DaybookEntry[] = [];
            let serverStats: DbStats | null = null;

            try {
                const res = await axiosInstance.get('reports/daybook', { headers: H(), params });
                const d = res.data?.data ?? res.data;
                entries = Array.isArray(d?.entries) ? d.entries
                    : Array.isArray(d?.data?.entries) ? d.data.entries
                        : Array.isArray(d) ? d : [];
                if (d?.stats) {
                    serverStats = {
                        income: parseFloat(d.stats.income ?? 0),
                        expense: parseFloat(d.stats.expense ?? 0),
                        balance: parseFloat(d.stats.balance ?? 0),
                    };
                }
            } catch {
                try {
                    const res = await axiosInstance.get('daybook/transactions', { headers: H(), params });
                    const d = res.data?.data ?? res.data;
                    entries = Array.isArray(d?.entries) ? d.entries
                        : Array.isArray(d?.data) ? d.data
                            : Array.isArray(d) ? d : [];
                } catch {
                    try {
                        const res = await axiosInstance.get('daybook', { headers: H(), params });
                        const d = res.data?.data ?? res.data;
                        entries = Array.isArray(d?.entries?.data) ? d.entries.data
                            : Array.isArray(d?.entries) ? d.entries
                                : Array.isArray(d?.data) ? d.data
                                    : Array.isArray(d) ? d : [];
                    } catch (e3) { console.error('All daybook endpoints failed', e3); }
                }
            }

            entries = entries.map((e: DaybookEntry) => ({ ...e, amount: Number(e.amount) }));
            // NOTE: dbCategories is populated from the /master-data Category
            // master list (see the master-data load effect above), which is
            // what dbExpenseCategoryOpts reads for the Category filter dropdown.
            // Do NOT overwrite it here with categories derived from loaded
            // entries only — that has no `type` field and previously clobbered
            // the master-data version on every entries fetch, making expense
            // categories with no transactions yet (and, once type went
            // missing, ALL categories) disappear from the filter.
            setDbAllEntries(entries);
            if (serverStats) setDbStats(serverStats);
            setDbPage(1);
        } catch (e) { console.error('fetchDaybook failed', e); flagServerError(e); setDbAllEntries([]); setDbEntries([]); setDbStats(null); } finally { setDbLoading(false); }
    }, [fromDate, toDate]);

    useEffect(() => {
        let filtered = applyDbNameFilter(dbAllEntries, dbFilter.bio_data_ids, dbFilter.sub_name_ids);
        if (dbFilter.category_ids.length) filtered = filtered.filter(e => dbFilter.category_ids.includes(normId(e.category_id)));
        if (dbFilter.sub_category_ids.length) filtered = filtered.filter(e => dbFilter.sub_category_ids.includes(normId(e.sub_category_id)));
        if (dbFilter.payment_modes.length) filtered = filtered.filter(e => dbFilter.payment_modes.includes(e.payment_mode || ''));
        if (dbFilter.search) {
            const q = dbFilter.search.trim().toLowerCase();
            filtered = filtered.filter(e =>
                (e.narration || '').toLowerCase().includes(q) ||
                (e.client_name || '').toLowerCase().includes(q) ||
                (e.bio_data_name || '').toLowerCase().includes(q) ||
                (e.category_name || '').toLowerCase().includes(q) ||
                (e.payment_mode || '').toLowerCase().includes(q));
        }

        let otherRows: DaybookEntry[] = [];
        if (dbIncludeLabour) otherRows = otherRows.concat(labourAsDaybookRows);
        if (dbIncludeCredit) otherRows = otherRows.concat(creditAsDaybookRows);
        if (dbFilter.payment_modes.length) otherRows = otherRows.filter(e => dbFilter.payment_modes.includes(e.payment_mode || ''));
        if (dbFilter.search) {
            const q = dbFilter.search.trim().toLowerCase();
            otherRows = otherRows.filter(e =>
                (e.narration || '').toLowerCase().includes(q) ||
                (e.bio_data_name || '').toLowerCase().includes(q) ||
                (e.category_name || '').toLowerCase().includes(q) ||
                (e.payment_mode || '').toLowerCase().includes(q));
        }

        // Manpower / Credit are source filters, not "also include" add-ons —
        // switching one (or both) on shows ONLY that source's entries instead
        // of piling them on top of the normal Cash Book list. With neither on,
        // the view stays exactly what it always was: plain Cash Book entries.
        const combined = (dbIncludeLabour || dbIncludeCredit) ? otherRows : filtered;
        setDbEntries(combined);
        if (dbIncludeLabour || dbIncludeCredit) {
            // The stat cards for the Manpower/Credit toggle show the TOTAL
            // OUTSTANDING (unpaid) balance right now — a deliberately
            // different number from the paid-transaction rows in the table
            // below ("what's still owed" vs "what was actually paid"; see
            // [[daybook_report_source_toggle_and_paid_amount_fix]] for why
            // the table itself stays paid-only). Mirrors the balance already
            // shown on the standalone Accounts Payable / Wage Disbursement
            // report tabs — a snapshot, so it's intentionally NOT scoped to
            // the Cash Book From/To range or the Search/Payment Mode filters.
            // Kept as two separate figures (not just one merged total) so
            // that with BOTH toggles on, the UI can show Manpower and Credit
            // each in their own stat card instead of silently adding two
            // unrelated outstanding balances into one number.
            const labourUnpaid = dbIncludeLabour ? lbWorkers.reduce((s, w) => s + (Number(w.balance) || 0), 0) : 0;
            const creditUnpaid = dbIncludeCredit ? (crSummary?.balance || 0) : 0;
            const unpaid = labourUnpaid + creditUnpaid;
            setDbStats({ income: 0, expense: unpaid, balance: -unpaid, labourUnpaid, creditUnpaid });
        } else {
            setDbStats(computeStats(combined));
        }
        setDbPage(1);
    }, [dbAllEntries, dbFilter.bio_data_ids, dbFilter.sub_name_ids, dbFilter.category_ids, dbFilter.sub_category_ids, dbFilter.payment_modes, dbFilter.search, applyDbNameFilter, dbIncludeLabour, dbIncludeCredit, labourAsDaybookRows, creditAsDaybookRows, lbWorkers, crSummary]);

    // dbDateApplied included here too — a Date Range on its own (no other
    // filter picked) already populates the table (see the `!dbAnyFilterActive
    // && !dbDateApplied` check below), but before this fix it did NOT count
    // as "a filter is active" for the stat cards / summary bar / pagination
    // blocks, which all gate on dbAnyFilterActive — so filtering by date
    // alone showed a working table with no stat cards above it. Folding
    // dbDateApplied in here fixes all of those at once from one place.
    const dbAnyFilterActive = !!(dbFilter.bio_data_ids.length || dbFilter.category_ids.length || dbFilter.sub_category_ids.length || dbFilter.payment_modes.length || dbFilter.search || dbFilter.client_names.length || dbIncludeLabour || dbIncludeCredit || dbDateApplied);
    const dbAnyDraftActive = !!(dbFilterDraft.bio_data_ids.length || dbFilterDraft.category_ids.length || dbFilterDraft.sub_category_ids.length || dbFilterDraft.payment_modes.length || dbFilterDraft.search || dbFilterDraft.client_names.length || dbIncludeLabourDraft || dbIncludeCreditDraft || dbAnyFilterActive || dbFromTouched || dbToTouched || dbDateApplied);

    // Org-wide (not per-client) outstanding balances — same snapshot figures
    // already used by the Manpower/Credit toggle cards below (lbWorkers'
    // balances / crSummary.balance, intentionally not scoped to the Cash Book
    // date range — "what's still owed" is a live snapshot, not a
    // period figure), reused here for the Date-Range stat card set.
    const dbGlobalLabourUnpaid = useMemo(() => lbWorkers.reduce((s, w) => s + (Number(w.balance) || 0), 0), [lbWorkers]);
    const dbGlobalCreditUnpaid = crSummary?.balance || 0;

    const commitDbFilters = () => {
        setFromDate(fromDateDraft);
        setToDate(toDateDraft);
        if (dbFromTouched && dbToTouched) setDbDateApplied(true);
        setDbFilter(dbFilterDraft);
        setDbIncludeLabour(dbIncludeLabourDraft);
        setDbIncludeCredit(dbIncludeCreditDraft);
        setDbPage(1);
        setDbSearchPulse(true);
        setTimeout(() => setDbSearchPulse(false), 600);
    };
    const resetDbFilters = () => {
        setDbFilter(DB_FILTER_EMPTY);
        setDbFilterDraft(DB_FILTER_EMPTY);
        setDbIncludeLabour(false);
        setDbIncludeCredit(false);
        setDbIncludeLabourDraft(false);
        setDbIncludeCreditDraft(false);
        setDbPage(1);
        // Single Reset now also clears the date range — it's the one control
        // for the whole panel, so it shouldn't leave a stale date filter behind.
        setFromDate('2000-01-01'); setFromDateDraft('2000-01-01'); setDbFromTouched(false);
        setToDate(today()); setToDateDraft(today()); setDbToTouched(false);
        setDbDateApplied(false);
    };

    // Client Name selected → the table is Cash Book-only. This is a Cash Book
    // Report, so Wage Disbursement / Accounts Payable transactions never show
    // as table rows here regardless of the (now-hidden-in-this-view)
    // Manpower/Credit toggles — those two feed the stat cards below instead
    // (Total Unpaid Manpower / Total Unpaid Credit), not the row list. See
    // [[daybook_report_client_daybook_only_table]].
    const clientDebitRows: ClientDebitRow[] = useMemo(() => {
        if (!dbFilter.client_names.length) return [];
        const targets = new Set(dbFilter.client_names.map(n => n.trim().toLowerCase()));
        const matchName = (nm: string | null | undefined): string | undefined => {
            const t = (nm || '').trim();
            return t && targets.has(t.toLowerCase()) ? t : undefined;
        };
        const modeOk = (mode: string | null | undefined) => !dbFilter.payment_modes.length || dbFilter.payment_modes.includes(mode || '');
        const q = dbFilter.search.trim().toLowerCase();
        const searchOk = (...fields: (string | null | undefined)[]) => !q || fields.some(f => (f || '').toLowerCase().includes(q));
        const rows: ClientDebitRow[] = [];

        // Cash Book rows only, narrowed by Category/Sub Category/Bio
        // Data/Associate Name/Mode/Search exactly like the main Cash Book table, so
        // whatever Category you've picked up in "Refine Your View" carries
        // through to this client-filtered view too.
        let dbCandidates = applyDbNameFilter(dbAllEntries, dbFilter.bio_data_ids, dbFilter.sub_name_ids);
        if (dbFilter.category_ids.length) dbCandidates = dbCandidates.filter(e => dbFilter.category_ids.includes(normId(e.category_id)));
        if (dbFilter.sub_category_ids.length) dbCandidates = dbCandidates.filter(e => dbFilter.sub_category_ids.includes(normId(e.sub_category_id)));
        dbCandidates.forEach(e => {
            const matched = matchName(e.client_name);
            if (e.category_type === 'expense' && matched && modeOk(e.payment_mode) && searchOk(e.narration, e.category_name, e.bio_data_name)) {
                rows.push({
                    source: 'Cash Book', date: e.transaction_date || '', label: e.category_name || 'Expense', sub: e.narration, mode: e.payment_mode || '—', amount: Number(e.amount) || 0,
                    bio_name: e.bio_data_name, sub_name: e.sub_name_name, category: e.category_name, type: e.category_type, narration: e.narration, client: matched,
                });
            }
        });

        return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [dbFilter.client_names, dbFilter.category_ids, dbFilter.sub_category_ids, dbFilter.bio_data_ids, dbFilter.sub_name_ids, dbFilter.payment_modes, dbFilter.search, dbAllEntries, applyDbNameFilter]);

    const clientDebitTotals = useMemo(() => {
        const bySource: Record<string, number> = {};
        let grand = 0;
        clientDebitRows.forEach(r => { bySource[r.source] = (bySource[r.source] || 0) + r.amount; grand += r.amount; });
        return { bySource, grand };
    }, [clientDebitRows]);

    // Cash vs. Bank split of the "Total Cash Book Expenses" figure above —
    // same Cash Holding / Bank Holding concept as the create page, scoped
    // to just this client's Cash Book rows. "Cash" mode is its own bucket,
    // every other mode merges into "Bank".
    const clientCashBookCashBank = useMemo(() => {
        let cash = 0, bank = 0;
        clientDebitRows.forEach(r => {
            if (r.source !== 'Cash Book') return;
            if (r.mode === 'Cash') cash += r.amount; else bank += r.amount;
        });
        return { cash, bank };
    }, [clientDebitRows]);

    // Per-client OUTSTANDING (unpaid) balances — a deliberately different
    // number from clientDebitRows' Wage Disbursement / Accounts Payable rows
    // above (those are actual paid transactions). "Total Unpaid Manpower"
    // scopes the same balance concept used for the no-client-selected stat
    // card (see [[daybook_report_source_toggle_and_paid_amount_fix]]) down
    // to just this client, since a labour worker/credit vendor can owe money
    // tied to several different clients at once.
    const clientLabourUnpaid = React.useMemo(() => {
        if (!dbFilter.client_names.length) return 0;
        const targets = new Set(dbFilter.client_names.map(n => n.trim().toLowerCase()));
        // Mirrors the backend's own per-(worker, sub-worker, client) formula
        // (LabourPaymentController::buildPersonBreakdown — outstanding =
        // earned − paid) computed FRESH from every attendance record and
        // every payment allocation, rather than reading one past session's
        // outstanding_after snapshot. A snapshot only reflects what was
        // earned as of THAT payment — if the worker has kept working (and
        // accruing more) at this client's site since their last payment, a
        // "latest session wins" read understates what's actually owed today.
        const key = (workerId: number, sub: string | null | undefined, client: string) =>
            `${workerId}|${(sub || '').trim().toLowerCase()}|${client.toLowerCase()}`;
        const earned = new Map<string, number>();
        lbAttendance.forEach(a => {
            const t = (a.client_name || '').trim();
            if (!t || !targets.has(t.toLowerCase())) return;
            const k = key(a.worker_id, a.sub_worker_name, t);
            earned.set(k, (earned.get(k) || 0) + (Number(a.amount) || 0));
        });
        const paid = new Map<string, number>();
        laborSessions.forEach(s => {
            (s.clients || []).forEach(c => {
                const t = (c.client_name || '').trim();
                if (!t || !targets.has(t.toLowerCase())) return;
                const k = key(s.worker_id, c.sub_worker_name, t);
                paid.set(k, (paid.get(k) || 0) + (Number(c.allocated) || 0));
            });
        });
        let total = 0;
        earned.forEach((e, k) => { total += Math.max(0, e - (paid.get(k) || 0)); });
        return total;
    }, [dbFilter.client_names, lbAttendance, laborSessions]);

    const clientCreditUnpaid = React.useMemo(() => {
        if (!dbFilter.client_names.length) return 0;
        const targets = new Set(dbFilter.client_names.map(n => n.trim().toLowerCase()));
        let total = 0;
        // Each CreditEntry's bill_balance is already an independent
        // per-bill remaining amount (not a running total), so summing
        // across matching bills — unlike Manpower's outstanding_after above —
        // is safe without a "latest wins" step.
        crVendors.forEach(v => {
            ((v.entries || []) as CreditEntry[]).forEach(e => {
                const t = (e.client_name || '').trim();
                if (t && targets.has(t.toLowerCase())) total += Number(e.bill_balance) || 0;
            });
        });
        return total;
    }, [dbFilter.client_names, crVendors]);

    const dbModeBreakdown = useMemo(() => {
        const creditMap: Record<string, number> = {}; const debitMap: Record<string, number> = {};
        for (const e of dbEntries) {
            const amt = Number(e.amount) || 0; const mode = e.payment_mode || 'Cash';
            if (e.category_type === 'income') creditMap[mode] = (creditMap[mode] || 0) + amt;
            else debitMap[mode] = (debitMap[mode] || 0) + amt;
        }
        const toArr = (m: Record<string, number>) => Object.entries(m).map(([mode, amount]) => ({ mode, amount })).sort((a, b) => b.amount - a.amount);
        return { credit: toArr(creditMap), debit: toArr(debitMap) };
    }, [dbEntries]);

    // Cash vs. Bank split of the figures above — "Cash" mode is its own
    // bucket, every other mode (UPI, NEFT, Cheque, Bank Transfer, Others)
    // merges into "Bank" since they all settle to a bank account. Same
    // concept as the Daybook create page's Cash Holding / Bank Holding
    // split, scoped to whatever's currently filtered here.
    const dbCashBank = useMemo(() => {
        const split = (arr: { mode: string; amount: number }[]) => arr.reduce(
            (acc, { mode, amount }) => { if (mode === 'Cash') acc.cash += amount; else acc.bank += amount; return acc; },
            { cash: 0, bank: 0 }
        );
        const cr = split(dbModeBreakdown.credit), dr = split(dbModeBreakdown.debit);
        return {
            creditCash: cr.cash, creditBank: cr.bank,
            debitCash: dr.cash, debitBank: dr.bank,
            netCash: cr.cash - dr.cash, netBank: cr.bank - dr.bank,
        };
    }, [dbModeBreakdown]);

    const fetchCredit = useCallback(async () => {
        setCrLoading(true); setServerError(false);
        try {
            const token = tk(); if (!token) { setCrVendors([]); return; }
            const params = { from_date: crDateFrom || '2000-01-01', to_date: crDateTo || today() };
            let summary: CreditSummary | null = null, vendors: CreditVendor[] = [];

            try {
                const res = await axiosInstance.get('reports/credit', { headers: H(), params });
                const outer = res.data;
                const d = outer?.data ?? outer;
                const rawVendors: any[] = Array.isArray(d?.vendors) ? d.vendors : [];
                const rawSum = d?.summary ?? {};
                summary = {
                    total_vendors: rawSum.total_vendors || 0,
                    active_vendors: rawSum.active_vendors || 0,
                    total_credit: parseFloat(rawSum.total_credit || 0),
                    total_paid: parseFloat(rawSum.total_paid || 0),
                    balance: parseFloat(rawSum.balance ?? rawSum.outstanding ?? 0),
                    overdue_count: rawSum.overdue_count || 0,
                    upcoming_count: rawSum.upcoming_count || 0,
                };
                vendors = rawVendors.map((v: any) => ({
                    id: v.id,
                    party_name: v.party_name,
                    business_name: v.business_name,
                    category_id: v.category_id,
                    category_name: v.category_name,
                    sub_category_id: v.sub_category_id,
                    sub_category_name: v.sub_category_name,
                    phone: v.phone,
                    is_active: v.is_active,
                    status: v.status,
                    total_credit: parseFloat(v.total_credit ?? v.total_credit_amount ?? 0),
                    total_paid: parseFloat(v.total_paid ?? v.total_paid_amount ?? 0),
                    balance: parseFloat(v.balance ?? v.outstanding_balance ?? 0),
                    days_overdue: v.days_overdue,
                    last_transaction_date: v.last_transaction_date,
                    entry_count: v.entry_count ?? v.credit_entries_count,
                    payment_count: v.payment_count ?? v.credit_payments_count,
                    entries: v.entries || [],
                    payments: v.payments || [],
                }));
            } catch {
                try {
                    const [sumRes, vendRes] = await Promise.all([
                        axiosInstance.get('credit-management/summary', { headers: H() }),
                        axiosInstance.get('credit-management/vendors', { headers: H(), params: { per_page: 500 } }),
                    ]);
                    const raw = sumRes.data?.data || sumRes.data;
                    summary = { total_vendors: raw.total_vendors || 0, active_vendors: raw.active_vendors || 0, total_credit: parseFloat(raw.total_credit || 0), total_paid: parseFloat(raw.total_paid || 0), balance: parseFloat(raw.outstanding ?? raw.balance ?? 0), overdue_count: raw.overdue_count || 0, upcoming_count: raw.upcoming_count || 0 };
                    const rv = vendRes.data?.data; const rawV = Array.isArray(rv) ? rv : Array.isArray(rv?.data) ? rv.data : [];
                    vendors = rawV.map((v: any) => ({ id: v.id, party_name: v.party_name, business_name: v.business_name, category_id: v.category_id, category_name: v.category_name, sub_category_id: v.sub_category_id, sub_category_name: v.sub_category_name, phone: v.phone, is_active: v.is_active, status: v.is_active ? 'active' : 'inactive', total_credit: parseFloat(v.total_credit_amount || 0), total_paid: parseFloat(v.total_paid_amount || 0), balance: parseFloat(v.outstanding_balance || 0), days_overdue: v.days_overdue, last_transaction_date: v.last_transaction_date, entry_count: v.credit_entries_count, payment_count: v.credit_payments_count, entries: v.entries || [], payments: v.payments || [] }));
                } catch (e2) { console.error('All credit endpoints failed', e2); }
            }
            setCrSummary(summary); setCrVendors(vendors);
        } catch (e) { console.error('fetchCredit failed', e); flagServerError(e); setCrVendors([]); } finally { setCrLoading(false); }
    }, [crDateFrom, crDateTo]);

    const fetchVendorDetail = useCallback(async (vendorId: number) => {
        try {
            const token = tk(); if (!token) return;
            const res = await axiosInstance.get(`credit-management/vendors/${vendorId}`, { headers: H() });
            const detail = res.data?.data || res.data;
            setCrVendors(prev => prev.map(v => v.id === vendorId ? { ...v, entries: detail.entries || [], payments: detail.payments || [] } : v));
        } catch (e) { console.error('fetchVendorDetail failed', e); }
    }, []);

    const fetchPortal = useCallback(async () => {
        setCpLoading(true); setCpAllLoaded(false); setCpLoadingStatus('Fetching projects…'); setServerError(false);
        try {
            const token = tk(); if (!token) { setCpProjects([]); setCpLoading(false); return; }
            const headers = H();

            let allProjects: ClientProject[] = [];
            let summary: ClientPortalSummary | null = null;
            let monthly: MonthlyData[] = [];

            try {
                setCpLoadingStatus('Loading portal data…');
                const res = await axiosInstance.get('reports/portal', { headers, params: { limit: 500 } });
                const outer = res.data;
                const d = outer?.data ?? outer;
                const rawProjects: any[] = Array.isArray(d?.projects) ? d.projects
                    : Array.isArray(d?.data?.projects) ? d.data.projects
                        : Array.isArray(d) ? d : [];
                const rawSum = d?.summary ?? {};
                summary = {
                    total_clients: rawSum.total_clients || 0,
                    total_projects: rawSum.total_projects || 0,
                    total_budget: parseFloat(rawSum.total_budget || 0),
                    total_collected: parseFloat(rawSum.total_collected || 0),
                    total_balance: parseFloat(rawSum.total_balance || 0),
                    collected_pct: parseFloat(rawSum.collected_pct || 0),
                };
                allProjects = rawProjects.map((p: any) => ({
                    id: p.id,
                    client_id: p.client_id,
                    project_name: p.project_name || p.name || 'Unnamed Project',
                    name: p.project_name || p.name,
                    client_name: p.client_name || 'Unknown Client',
                    project_type: p.project_type || 'construction',
                    type_label: p.type_label || labelForType(p.project_type),
                    status: p.status || 'active',
                    status_label: p.status_label || labelForStatus(p.status),
                    total_budget: parseFloat(p.total_budget ?? p.raw_budget ?? 0),
                    raw_budget: parseFloat(p.total_budget ?? p.raw_budget ?? 0),
                    total_collected: parseFloat(p.total_collected ?? p.collected ?? 0),
                    collected: parseFloat(p.total_collected ?? p.collected ?? 0),
                    balance: parseFloat(p.balance ?? 0),
                    collected_pct: parseFloat(p.collected_pct ?? 0),
                    payments: Array.isArray(p.payments) ? p.payments.map((pm: any) => ({
                        id: pm.id,
                        payment_date: pm.payment_date,
                        amount: parseFloat(pm.amount || 0),
                        gst_amount: parseFloat(pm.gst_amount || 0),
                        total_amount: parseFloat(pm.total_amount ?? pm.amount ?? 0),
                        payment_mode: pm.payment_mode || 'cash',
                        mode_label: pm.mode_label || labelForMode(pm.payment_mode),
                        reference_number: pm.reference_number || '',
                        notes: pm.notes || '',
                    })) : [],
                }));
            } catch (err1) {
                console.warn('reports/portal failed, trying client-portal fallback:', err1);
                try {
                    try { const res = await axiosInstance.get('client-portal/summary', { headers }); const d = res.data?.data || res.data; summary = { total_clients: d.total_clients || 0, total_projects: d.total_projects || 0, total_budget: parseFloat(d.total_budget || 0), total_collected: parseFloat(d.total_collected || 0), total_balance: parseFloat(d.total_balance || 0), collected_pct: parseFloat(d.collected_pct || 0) }; } catch { }
                    let clients: any[] = [];
                    try { const res = await axiosInstance.get('client-portal/clients', { headers }); clients = res.data?.data || []; } catch { setCpSummary(summary); setCpProjects([]); setCpLoading(false); setCpLoadingStatus(''); return; }
                    if (!clients.length) { setCpSummary(summary); setCpProjects([]); setCpLoading(false); setCpLoadingStatus(''); setCpAllLoaded(true); return; }
                    setCpLoadingStatus(`Loading ${clients.length} clients…`);
                    const clientProjectResults = await Promise.allSettled(clients.map((client: any) => axiosInstance.get(`client-portal/clients/${client.id}/projects`, { headers })));
                    for (let ci = 0; ci < clients.length; ci++) {
                        const client = clients[ci]; const result = clientProjectResults[ci];
                        if (result.status === 'rejected') continue;
                        const projects: any[] = result.value.data?.data || [];
                        for (const p of projects) { allProjects.push({ id: p.id, client_id: client.id, project_name: p.project_name || p.name || 'Unnamed Project', name: p.project_name || p.name, client_name: client.name, project_type: p.project_type || 'construction', type_label: p.type_label || labelForType(p.project_type), status: p.status || 'active', status_label: p.status_label || labelForStatus(p.status), total_budget: parseFloat(p.total_budget || 0), raw_budget: parseFloat(p.total_budget || 0), total_collected: parseFloat(p.total_collected || p.collected || 0), collected: parseFloat(p.total_collected || p.collected || 0), balance: parseFloat(p.balance || 0), collected_pct: parseFloat(p.collected_pct || 0), payments: [] }); }
                    }
                } catch (err2) { console.error('All portal endpoints failed', err2); }
            }

            if (!summary && allProjects.length > 0) {
                const uniqueClients = new Set(allProjects.map(p => p.client_id)).size;
                const totalBudget = allProjects.reduce((s, p) => s + (parseFloat(String(p.total_budget)) || 0), 0);
                const totalCollected = allProjects.reduce((s, p) => s + (parseFloat(String(p.total_collected)) || 0), 0);
                summary = { total_clients: uniqueClients, total_projects: allProjects.length, total_budget: totalBudget, total_collected: totalCollected, total_balance: totalBudget - totalCollected, collected_pct: totalBudget > 0 ? (totalCollected / totalBudget) * 100 : 0 };
            }

            try { const res = await axiosInstance.get('reports/monthly-revenue', { headers, params: { months: 6 } }); monthly = res.data?.data || []; } catch { }

            setCpSummary(summary); setCpProjects(allProjects); setCpMonthly(monthly); setCpAllLoaded(true); setCpLoadingStatus('');
        } catch (err) { console.error('fetchPortal failed', err); flagServerError(err); setCpProjects([]); setCpMonthly([]); setCpSummary(null); setCpLoadingStatus(''); } finally { setCpLoading(false); }
    }, []);

    const fetchProjectDetail = useCallback(async (p: ClientProject) => {
        if (!p.id || !p.client_id) return;
        try {
            const token = tk(); if (!token) return;
            let detail: any = null;
            try {
                const res = await axiosInstance.get(`client-portal/clients/${p.client_id}/projects/${p.id}`, { headers: H() });
                detail = res.data?.data || res.data;
            } catch {
                const res = await axiosInstance.get(`reports/portal`, { headers: H(), params: { limit: 500 } });
                const d = res.data?.data ?? res.data;
                const found = (Array.isArray(d?.projects) ? d.projects : []).find((pr: any) => pr.id === p.id);
                if (found) detail = found;
            }
            if (!detail) return;
            const rawPayments: any[] = detail?.payments || [];
            const payments: ClientPayment[] = rawPayments.map((pm: any) => ({ id: pm.id, payment_date: pm.payment_date, amount: parseFloat(pm.amount || 0), gst_amount: parseFloat(pm.gst_amount || 0), total_amount: parseFloat(pm.total_amount || pm.amount || 0), payment_mode: pm.payment_mode || 'cash', mode_label: pm.mode_label || labelForMode(pm.payment_mode), reference_number: pm.reference_number || pm.reference || '', notes: pm.notes || '' }));
            const collected = payments.reduce((s, pm) => s + pm.amount, 0); const budget = parseFloat(String(p.total_budget || 0));
            setCpProjects(prev => prev.map(pr => pr.id === p.id ? { ...pr, payments, total_collected: parseFloat(detail?.total_collected ?? String(collected)), collected: parseFloat(detail?.total_collected ?? String(collected)), balance: parseFloat(detail?.balance ?? String(budget - collected)), collected_pct: parseFloat(detail?.collected_pct ?? String(budget > 0 ? (collected / budget) * 100 : 0)) } : pr));
        } catch (err) { console.error('fetchProjectDetail failed', err); }
    }, []);

    const fetchLabor = useCallback(async () => {
        setLaborLoading(true); setServerError(false);
        try {
            const token = tk(); if (!token) { setLaborSessions([]); return; }
            const res = await axiosInstance.get('/api/workforce/payment/sessions', { headers: H() });
            const raw = res.data?.data ?? [];
            setLaborSessions(Array.isArray(raw) ? raw : []);
        } catch (e) { console.error('fetchLabor failed', e); flagServerError(e); setLaborSessions([]); }
        finally { setLaborLoading(false); }
    }, []);

    const fetchLbAttendance = useCallback(async () => {
        try {
            const token = tk(); if (!token) { setLbAttendance([]); return; }
            const res = await axiosInstance.get('/api/workforce/attendance', { headers: H() });
            const raw = res.data?.data ?? [];
            setLbAttendance(Array.isArray(raw) ? raw : []);
        } catch (e) { console.error('fetchLbAttendance failed', e); flagServerError(e); setLbAttendance([]); }
    }, []);

    const fetchLbWorkers = useCallback(async () => {
        try {
            const token = tk(); if (!token) { setLbWorkers([]); return; }
            const res = await axiosInstance.get('/api/workforce/payment/workers', { headers: H() });
            const raw = res.data?.data ?? [];
            setLbWorkers(Array.isArray(raw) ? raw : []);
        } catch (e) { console.error('fetchLbWorkers failed', e); flagServerError(e); setLbWorkers([]); }
    }, []);

    useEffect(() => { fetchDaybook(); }, [fetchDaybook]);
    useEffect(() => { fetchCredit(); }, [fetchCredit]);
    useEffect(() => { fetchPortal(); }, [fetchPortal]);
    useEffect(() => { fetchLabor(); }, [fetchLabor]);
    useEffect(() => { fetchLbAttendance(); }, [fetchLbAttendance]);
    useEffect(() => { fetchLbWorkers(); }, [fetchLbWorkers]);

    const filteredVendors = React.useMemo(() => crNonLabourVendors.filter(v => {
        if (crCategoryIdFilters.length > 0 && !crCategoryIdFilters.includes(String(v.category_id ?? ''))) return false;
        if (crSubCategoryIdFilters.length > 0 && !crSubCategoryIdFilters.includes(String(v.sub_category_id ?? ''))) return false;
        if (crNameFilters.length > 0 && !crNameFilters.includes(v.party_name || '')) return false;
        if (crStatusFilters.length === 0) return true;
        return crStatusFilters.some(sf => {
            if (sf === 'active') return resolveVendorActive(v);
            if (sf === 'inactive') return !resolveVendorActive(v);
            if (sf === 'balance') return resolveVendorBalance(v) > 0;
            if (v.status) return v.status.toLowerCase() === sf.toLowerCase();
            return true;
        });
    }), [crNonLabourVendors, crCategoryIdFilters, crSubCategoryIdFilters, crNameFilters, crStatusFilters]);

    const filteredProjects = React.useMemo(() => cpProjects.filter(p => {
        if (cpClientNameFilters.length > 0 && !cpClientNameFilters.includes(p.client_name || '')) return false;
        if (cpStatusFilters.length > 0 && !cpStatusFilters.includes((p.status || '').toLowerCase())) return false;
        if (cpTypeFilters.length > 0 && !cpTypeFilters.includes((p.project_type || '').toLowerCase())) return false;
        return true;
    }), [cpProjects, cpClientNameFilters, cpStatusFilters, cpTypeFilters]);

    const filteredCrStats = React.useMemo(() => {
        return { credit: filteredVendors.reduce((s, v) => s + resolveVendorCredit(v), 0), paid: filteredVendors.reduce((s, v) => s + resolveVendorPaid(v), 0), balance: filteredVendors.reduce((s, v) => s + resolveVendorBalance(v), 0) };
    }, [filteredVendors]);
    const crAnyFilterActive = !!(crNameFilters.length || crCategoryIdFilters.length || crSubCategoryIdFilters.length || crStatusFilters.length || crPaymentModeFilters.length || crClientNameFilters.length);
    const crHasSelection = crAnyFilterActive || crDateApplied;
    const crSelectionLabel = crNameFilters.length > 0 ? crNameFilters.join(', ') : crClientNameFilters.length > 0 ? crClientNameFilters.join(', ') : 'Selected Filters';
    const crAnyDraftActive = !!(crNameFiltersDraft.length || crCategoryIdFiltersDraft.length || crSubCategoryIdFiltersDraft.length || crStatusFiltersDraft.length || crPaymentModeFiltersDraft.length || crClientNameFiltersDraft.length || crAnyFilterActive || crDateFromTouched || crDateToTouched || crDateApplied);
    const commitCrFilters = () => {
        setCrDateFrom(crDateFromDraft);
        setCrDateTo(crDateToDraft);
        if (crDateFromTouched && crDateToTouched) setCrDateApplied(true);
        setCrNameFilters(crNameFiltersDraft);
        setCrCategoryIdFilters(crCategoryIdFiltersDraft);
        setCrSubCategoryIdFilters(crSubCategoryIdFiltersDraft);
        setCrStatusFilters(crStatusFiltersDraft);
        setCrPaymentModeFilters(crPaymentModeFiltersDraft);
        setCrClientNameFilters(crClientNameFiltersDraft);
        setCrPage(1);
        setCrSearchPulse(true);
        setTimeout(() => setCrSearchPulse(false), 600);
    };

    const resetCrFilters = () => {
        setCrNameFilters([]); setCrNameFiltersDraft([]);
        setCrCategoryIdFilters([]); setCrCategoryIdFiltersDraft([]);
        setCrSubCategoryIdFilters([]); setCrSubCategoryIdFiltersDraft([]);
        setCrStatusFilters([]); setCrStatusFiltersDraft([]);
        setCrPaymentModeFilters([]); setCrPaymentModeFiltersDraft([]);
        setCrClientNameFilters([]); setCrClientNameFiltersDraft([]);
        setCrDateFrom('2000-01-01'); setCrDateFromDraft('2000-01-01'); setCrDateFromTouched(false);
        setCrDateTo(today()); setCrDateToDraft(today()); setCrDateToTouched(false);
        setCrDateApplied(false);
    };

    type CreditPartyRow = {
        id: string; date: string; kind: 'bill' | 'payment'; party: string; category?: string;
        reference: string; mode?: string; credit?: number; paid?: number; balance?: number;
        notes?: string; synced?: boolean; clientName?: string; paymentModes?: string[];
        billCount?: number; dates?: string[];
        status?: 'paid' | 'partial' | 'due'; isOverdue?: boolean;
    };
    const crClientNameOpts: TDropOpt[] = React.useMemo(() => {
        if (!crCategoryIdFiltersDraft.length) return [];
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        crNonLabourVendors
            .filter(v => crCategoryIdFiltersDraft.includes(String(v.category_id ?? '')))
            .filter(v => !crSubCategoryIdFiltersDraft.length || crSubCategoryIdFiltersDraft.includes(String(v.sub_category_id ?? '')))
            .filter(v => !crNameFiltersDraft.length || crNameFiltersDraft.includes(v.party_name || ''))
            .forEach(v => {
                ((v.entries as CreditEntry[]) || []).forEach(e => {
                    const nm = (e.client_name || '').trim();
                    if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); }
                });
                ((v.payments as CreditPayment[]) || []).forEach(p => {
                    const nm = (p.client_name || '').trim();
                    if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); }
                });
            });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [crNonLabourVendors, crCategoryIdFiltersDraft, crSubCategoryIdFiltersDraft, crNameFiltersDraft]);
    const creditPartyRows: CreditPartyRow[] = React.useMemo(() => {
        const rows: CreditPartyRow[] = [];
        filteredVendors.forEach(v => {
            const vPayments = (v.payments as CreditPayment[]) || [];
            const party = v.party_name || '—';
            ((v.entries as CreditEntry[]) || []).forEach(e => {
                const clientName = (e.client_name || '').trim();
                const linked = vPayments.filter(p => p.credit_entry_id === e.id);
                const paymentModes = new Set<string>();
                const dates: string[] = [];
                const ed = (e.credit_date || '').slice(0, 10);
                if (ed) dates.push(ed);
                let lastDate = ed;
                linked.forEach(p => {
                    if (p.payment_mode) paymentModes.add(p.payment_mode);
                    const pd = (p.payment_date || '').slice(0, 10);
                    if (pd) { dates.push(pd); if (pd > lastDate) lastDate = pd; }
                });
                const status: 'paid' | 'partial' | 'due' = e.is_paid ? 'paid' : (e.amount_paid || 0) > 0 ? 'partial' : 'due';
                const billLabel = e.bill_number ? `Bill #${e.bill_number}` : 'Bill';
                rows.push({
                    id: `bill-${e.id}`, date: lastDate, kind: 'bill' as const, party,
                    category: v.category_name, reference: billLabel,
                    mode: Array.from(paymentModes).join(', ') || undefined,
                    credit: e.credit_amount || 0, paid: e.amount_paid || 0, balance: e.bill_balance || 0,
                    notes: e.description || billLabel,
                    clientName: clientName || undefined, paymentModes: Array.from(paymentModes),
                    billCount: 1, dates,
                    status, isOverdue: !!e.is_overdue,
                });
            });
        });

        const partySet = new Set(crNameFilters.map(n => n.trim().toLowerCase()));
        const partyFiltered = partySet.size > 0
            ? rows.filter(r => partySet.has((r.party || '').trim().toLowerCase()))
            : rows;
        const modeFiltered = crPaymentModeFilters.length > 0
            ? partyFiltered.filter(r => (r.paymentModes || []).some(m => crPaymentModeFilters.includes(m)))
            : partyFiltered;
        const clientSet = new Set(crClientNameFilters.map(n => n.trim().toLowerCase()));
        const clientFiltered = clientSet.size > 0
            ? modeFiltered.filter(r => clientSet.has((r.clientName || '').trim().toLowerCase()))
            : modeFiltered;
        const dateFiltered = (crDateFrom || crDateTo) ? clientFiltered.filter(r => {
            const ds = r.dates || [];
            return ds.some(d => {
                if (!d) return false;
                if (crDateFrom && d < crDateFrom) return false;
                if (crDateTo && d > crDateTo) return false;
                return true;
            });
        }) : clientFiltered;
        return dateFiltered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [filteredVendors, crNameFilters, crPaymentModeFilters, crClientNameFilters, crDateFrom, crDateTo]);

    const creditPartyTotals = React.useMemo(() => {
        let credit = 0, paid = 0;
        creditPartyRows.forEach(r => { credit += r.credit || 0; paid += r.paid || 0; });
        return { credit, paid, balance: credit - paid };
    }, [creditPartyRows]);
    const totalCrPages = Math.max(1, Math.ceil(creditPartyRows.length / safeCrPerPage));
    const paginatedCreditPartyRows = creditPartyRows.slice((crPage - 1) * safeCrPerPage, crPage * safeCrPerPage);
    const creditPartyPageTotals = React.useMemo(() => {
        let credit = 0, paid = 0;
        paginatedCreditPartyRows.forEach(r => { credit += r.credit || 0; paid += r.paid || 0; });
        return { credit, paid, balance: credit - paid };
    }, [paginatedCreditPartyRows]);

    const filteredCpStats = React.useMemo(() => {
        if (!cpClientNameFilters.length && !cpStatusFilters.length && !cpTypeFilters.length) return null;
        const budget = filteredProjects.reduce((s, p) => s + resolveProjectBudget(p), 0);
        const collected = filteredProjects.reduce((s, p) => s + resolveProjectCollected(p), 0);
        const balance = filteredProjects.reduce((s, p) => s + resolveProjectBalance(p), 0);
        return { budget, collected, balance, pct: budget > 0 ? (collected / budget) * 100 : 0 };
    }, [filteredProjects, cpClientNameFilters, cpStatusFilters, cpTypeFilters]);

    type ClientPartyRow = {
        id: string; date: string; client: string; project: string; type?: string; status?: string;
        mode?: string; reference?: string; paid: number; notes?: string;
    };

    const cpPartyRows: ClientPartyRow[] = React.useMemo(() => {
        const rows: ClientPartyRow[] = [];
        filteredProjects.forEach(p => {
            ((p.payments as ClientPayment[]) || []).forEach(pm => {
                rows.push({
                    id: `pmt-${pm.id}`, date: pm.payment_date, client: p.client_name || '—', project: resolveProjectName(p),
                    type: p.project_type, status: p.status, mode: pm.payment_mode, reference: pm.reference_number || undefined,
                    paid: pm.amount, notes: pm.notes || undefined,
                });
            });
        });
        const modeFiltered = cpPaymentModeFilters.length > 0 ? rows.filter(r => cpPaymentModeFilters.includes(r.mode || '')) : rows;
        const dateFiltered = (cpDateFrom || cpDateTo) ? modeFiltered.filter(r => {
            const d = (r.date || '').slice(0, 10);
            if (!d) return false;
            if (cpDateFrom && d < cpDateFrom) return false;
            if (cpDateTo && d > cpDateTo) return false;
            return true;
        }) : modeFiltered;
        return dateFiltered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [filteredProjects, cpPaymentModeFilters, cpDateFrom, cpDateTo]);

    const cpPartyTotals = React.useMemo(() => {
        const paid = cpPartyRows.reduce((s, r) => s + (r.paid || 0), 0);
        return { paid };
    }, [cpPartyRows]);
    const totalCpPages = Math.max(1, Math.ceil(cpPartyRows.length / safeCpPerPage));
    const paginatedCpPartyRows = cpPartyRows.slice((cpPage - 1) * safeCpPerPage, cpPage * safeCpPerPage);
    const cpPartyPageTotals = React.useMemo(() => {
        const paid = paginatedCpPartyRows.reduce((s, r) => s + (r.paid || 0), 0);
        return { paid };
    }, [paginatedCpPartyRows]);

    const cpAnyFilterActive = !!(cpClientNameFilters.length || cpStatusFilters.length || cpTypeFilters.length || cpPaymentModeFilters.length);
    const cpHasSelection = cpAnyFilterActive || cpDateApplied;
    const cpSelectionLabel = cpClientNameFilters.length > 0 ? cpClientNameFilters.join(', ') : 'Selected Filters';
    const cpAnyDraftActive = !!(cpTypeFiltersDraft.length || cpStatusFiltersDraft.length || cpClientNameFiltersDraft.length || cpPaymentModeFiltersDraft.length || cpAnyFilterActive || cpDateFromTouched || cpDateToTouched || cpDateApplied);
    const commitCpFilters = () => {
        setCpDateFrom(cpDateFromDraft);
        setCpDateTo(cpDateToDraft);
        if (cpDateFromTouched && cpDateToTouched) setCpDateApplied(true);
        setCpTypeFilters(cpTypeFiltersDraft);
        setCpStatusFilters(cpStatusFiltersDraft);
        setCpClientNameFilters(cpClientNameFiltersDraft);
        setCpPaymentModeFilters(cpPaymentModeFiltersDraft);
        setCpPage(1);
        setCpSearchPulse(true);
        setTimeout(() => setCpSearchPulse(false), 600);
    };

    const resetCpFilters = () => {
        setCpTypeFilters([]); setCpTypeFiltersDraft([]);
        setCpStatusFilters([]); setCpStatusFiltersDraft([]);
        setCpClientNameFilters([]); setCpClientNameFiltersDraft([]);
        setCpPaymentModeFilters([]); setCpPaymentModeFiltersDraft([]);
        setCpDateFrom('2000-01-01'); setCpDateFromDraft('2000-01-01'); setCpDateFromTouched(false);
        setCpDateTo(today()); setCpDateToDraft(today()); setCpDateToTouched(false);
        setCpDateApplied(false);
    };

    useEffect(() => {
        if (!cpHasSelection) return;
        filteredProjects.forEach(p => {
            const pmts = (p.payments as ClientPayment[]) || [];
            if (pmts.length === 0 && resolveProjectCollected(p) > 0) fetchProjectDetail(p);
        });
    }, [cpHasSelection, filteredProjects]);

    const safeDbPerPage = dbPerPage > 0 ? dbPerPage : 25;
    const totalDbPages = Math.max(1, Math.ceil(dbEntries.length / safeDbPerPage));
    const paginatedDbEntries = dbEntries.slice((dbPage - 1) * safeDbPerPage, dbPage * safeDbPerPage);
    const dbPageStats = computeStats(paginatedDbEntries);
    const selectedBioNames = dbFilter.bio_data_ids.map(v => bioLabelMap[normId(v)] || v).filter(Boolean);
    const selectedSubNames = dbFilter.sub_name_ids.map(v => subLabelMap[normId(v)] || v).filter(Boolean);
    const cpPct = cpSummary?.collected_pct || 0;
    const crOutstanding = crSummary?.balance || 0, crTotal = crSummary?.total_credit || 0, crPaid = crSummary?.total_paid || 0;

    const toggleVendor = async (id: number) => {
        if (openVendorIds.has(id)) { setOpenVendorIds(prev => { const next = new Set(prev); next.delete(id); return next; }); return; }
        setOpenVendorIds(prev => new Set(prev).add(id));
        const v = crVendors.find(v => v.id === id);
        if (v && !v.entries?.length) await fetchVendorDetail(id);
        if (!vendorTab[id]) setVendorTab(prev => ({ ...prev, [id]: 'bills' }));
    };

    useEffect(() => {
        if (crNameFilters.length === 0) return;
        const matches = filteredVendors.filter(v => v.id != null && crNameFilters.includes(v.party_name || ''));
        matches.forEach(v => {
            const id = v.id!;
            if (!openVendorIds.has(id)) {
                setOpenVendorIds(prev => new Set(prev).add(id));
                if (!v.entries?.length) fetchVendorDetail(id);
                if (!vendorTab[id]) setVendorTab(prev => ({ ...prev, [id]: 'bills' }));
            }
        });
    }, [crNameFilters, filteredVendors]);

    const toggleProject = async (p: ClientProject) => {
        if (!p.id) return;
        if (openProjectId === p.id) { setOpenProjectId(null); return; }
        setOpenProjectId(p.id);
        if (!p.payments || p.payments.length === 0) { if (resolveProjectCollected(p) > 0) await fetchProjectDetail(p); }
    };

    const lbSiteOpts: TDropOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        lbAttendance.forEach(a => { const nm = (a.site || '').trim(); if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); } });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [lbAttendance]);

    const lbWorkerNameOpts: TDropOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        if (lbSiteFilters.length) {
            const siteSet = new Set(lbSiteFilters.map(s => s.trim().toLowerCase()));
            lbAttendance.forEach(a => {
                if (!siteSet.has((a.site || '').trim().toLowerCase())) return;
                const nm = (a.worker_name || '').trim(); if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); }
            });
        } else {
            lbWorkers.forEach(w => { const nm = (w.name || '').trim(); if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); } });
            lbAttendance.forEach(a => { const nm = (a.worker_name || '').trim(); if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); } });
        }
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [lbWorkers, lbAttendance, lbSiteFilters]);
    const lbClientNameOpts: TDropOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        lbAttendance.forEach(a => { const nm = (a.client_name || '').trim(); if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); } });
        laborSessions.forEach(s => (s.clients || []).forEach(c => { const nm = (c.client_name || '').trim(); if (nm && !seen.has(nm.toLowerCase())) { seen.add(nm.toLowerCase()); out.push({ value: nm, label: nm }); } }));
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [lbAttendance, laborSessions]);

    const lbSubNameOpts: TDropOpt[] = React.useMemo(() => {
        const seen = new Set<string>(); const out: TDropOpt[] = [];
        const workerSet = new Set(lbNameFiltersDraft.map(n => n.trim().toLowerCase()));
        lbAttendance.forEach(a => {
            const sub = (a.sub_worker_name || '').trim();
            if (!sub) return;
            if (workerSet.size > 0 && !workerSet.has((a.worker_name || '').trim().toLowerCase())) return;
            if (!seen.has(sub.toLowerCase())) { seen.add(sub.toLowerCase()); out.push({ value: sub, label: sub }); }
        });
        return out.sort((a, b) => a.label.localeCompare(b.label));
    }, [lbAttendance, lbNameFiltersDraft]);

    type LabourEntryDetail = { kind: 'shift' | 'payment'; date: string; shifts?: number; amount: number; mode?: string; notes?: string };
    type LabourGroupRow = {
        key: string; client: string; worker: string; subName?: string; isOwn: boolean;
        shifts: number; earned: number; paid: number; balance: number;
        modes: Set<string>; lastDate: string;
        entries: LabourEntryDetail[]; payments: LabourEntryDetail[];
    };

    const labourPartyRows: LabourGroupRow[] = React.useMemo(() => {
        const groups = new Map<string, LabourGroupRow>();
        const getGroup = (client: string, worker: string, person: string | undefined, isOwn: boolean) => {
            const key = `${client}::${worker}::${isOwn ? '__OWN__' : (person || '')}`;
            let g = groups.get(key);
            if (!g) {
                g = { key, client, worker, subName: isOwn ? undefined : person, isOwn, shifts: 0, earned: 0, paid: 0, balance: 0, modes: new Set(), lastDate: '', entries: [], payments: [] };
                groups.set(key, g);
            }
            return g;
        };

        const clientWorkerOrder = new Map<string, string[]>();
        lbAttendance.forEach(a => {
            const client = a.client_name || 'Unknown';
            const worker = a.worker_name || '—';
            const isSub = !!a.sub_worker_name;
            const g = getGroup(client, worker, a.sub_worker_name || undefined, !isSub);
            const shifts = parseFloat(String(a.shifts_worked || 0));
            const amount = parseFloat(String(a.amount || 0));
            g.shifts += shifts; g.earned += amount;
            g.entries.push({ kind: 'shift', date: a.date, shifts, amount, notes: a.notes || undefined });
            if (a.date > g.lastDate) g.lastDate = a.date;

            const cwKey = `${client}::${worker}`;
            const order = clientWorkerOrder.get(cwKey) || [];
            if (!order.includes(g.key)) { order.push(g.key); clientWorkerOrder.set(cwKey, order); }
        });

        clientWorkerOrder.forEach((keys, cwKey) => {
            keys.sort((ka, kb) => {
                const ga = groups.get(ka)!, gb = groups.get(kb)!;
                const da = ga.entries.reduce((m, e) => !m || e.date < m ? e.date : m, '');
                const db = gb.entries.reduce((m, e) => !m || e.date < m ? e.date : m, '');
                return da.localeCompare(db);
            });
            clientWorkerOrder.set(cwKey, keys);
        });

        const legacyByClientWorker = new Map<string, LabourEntryDetail[]>();
        laborSessions.forEach(s => {
            (s.clients || []).forEach(c => {
                if (!(c.allocated > 0)) return;
                const client = c.client_name || 'Unknown';
                const worker = s.worker_name || '—';
                const person = c.sub_worker_name;
                const isOwn = person === '__OWN__';
                const entry: LabourEntryDetail = { kind: 'payment', date: s.paid_at, amount: c.allocated, mode: s.payment_mode, notes: s.notes || undefined };
                if (person && !isOwn) {
                    const g = getGroup(client, worker, person, false);
                    g.paid += c.allocated; g.payments.push(entry); g.modes.add(s.payment_mode);
                    if (s.paid_at > g.lastDate) g.lastDate = s.paid_at;
                } else if (isOwn) {
                    const g = getGroup(client, worker, undefined, true);
                    g.paid += c.allocated; g.payments.push(entry); g.modes.add(s.payment_mode);
                    if (s.paid_at > g.lastDate) g.lastDate = s.paid_at;
                } else {
                    const cwKey = `${client}::${worker}`;
                    const list = legacyByClientWorker.get(cwKey) || [];
                    list.push(entry);
                    legacyByClientWorker.set(cwKey, list);
                }
            });
        });
        legacyByClientWorker.forEach((entries, cwKey) => {
            const order = clientWorkerOrder.get(cwKey) || [];
            let idx = 0;
            entries.forEach(entry => {
                let remaining = entry.amount;
                while (remaining > 0.005 && idx < order.length) {
                    const g = groups.get(order[idx])!;
                    const owed = Math.max(0, g.earned - g.paid);
                    if (owed <= 0.005) { idx++; continue; }
                    const take = Math.min(owed, remaining);
                    g.paid += take;
                    remaining -= take;
                    if (idx === 0 || g.payments.length === 0) g.payments.push({ ...entry, amount: take });
                    if (entry.date > g.lastDate) g.lastDate = entry.date;
                    if (owed - take <= 0.005) idx++;
                }
                if (remaining > 0.005 && order.length > 0) {
                    const g = groups.get(order[0])!;
                    g.paid += remaining; g.payments.push({ ...entry, amount: remaining });
                    if (entry.date > g.lastDate) g.lastDate = entry.date;
                }
            });
        });

        groups.forEach(g => { g.balance = Math.max(0, g.earned - g.paid); });

        let out = Array.from(groups.values());

        const siteSet = new Set(lbSiteFilters.map(n => n.trim().toLowerCase()));
        if (siteSet.size > 0) out = out;
        const workerSet = new Set(lbNameFilters.map(n => n.trim().toLowerCase()));
        if (workerSet.size > 0) out = out.filter(g => workerSet.has(g.worker.trim().toLowerCase()));
        const subSet = new Set(lbSubNameFilters.map(n => n.trim().toLowerCase()));
        if (subSet.size > 0) out = out.filter(g => !g.isOwn && subSet.has((g.subName || '').trim().toLowerCase()));
        const clientSet = new Set(lbClientNameFilters.map(n => n.trim().toLowerCase()));
        if (clientSet.size > 0) out = out.filter(g => clientSet.has(g.client.trim().toLowerCase()));
        if (lbPaymentModeFilters.length > 0) out = out.filter(g => lbPaymentModeFilters.some(m => g.modes.has(m)));
        if (lbDateFrom || lbDateTo) {
            const inRange = (d: string) => {
                const day = (d || '').slice(0, 10);
                if (!day) return false;
                if (lbDateFrom && day < lbDateFrom) return false;
                if (lbDateTo && day > lbDateTo) return false;
                return true;
            };
            out = out
                .map(g => {
                    const entries = g.entries.filter(e => inRange(e.date));
                    const payments = g.payments.filter(e => inRange(e.date));
                    const shifts = entries.reduce((s, e) => s + (e.shifts || 0), 0);
                    const earned = entries.reduce((s, e) => s + e.amount, 0);
                    const paid = payments.reduce((s, e) => s + e.amount, 0);
                    const lastDate = [...entries, ...payments].reduce((m, e) => !m || e.date > m ? e.date : m, '');
                    return { ...g, entries, payments, shifts, earned, paid, balance: Math.max(0, earned - paid), lastDate };
                })
                .filter(g => g.entries.length > 0 || g.payments.length > 0);
        }

        out.forEach(g => {
            g.entries.sort((a, b) => b.date.localeCompare(a.date));
            g.payments.sort((a, b) => b.date.localeCompare(a.date));
        });
        // Biggest amount first — matches how the report is meant to be scanned
        // (who earned the most this period), not chronological recency.
        return out.sort((a, b) => b.earned - a.earned);
    }, [lbAttendance, laborSessions, lbNameFilters, lbSubNameFilters, lbClientNameFilters, lbSiteFilters, lbPaymentModeFilters, lbDateFrom, lbDateTo]);

    const lbRowDateLabel = (g: LabourGroupRow): string => {
        const dates = Array.from(new Set([...g.entries, ...g.payments].map(e => (e.date || '').slice(0, 10)))).filter(Boolean).sort();
        if (dates.length === 0) return '—';
        if (dates.length === 1) return fmtDate(dates[0]);
        return `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}`;
    };

    const labourPartyTotals = React.useMemo(() => {
        let earned = 0, paid = 0, balance = 0;
        labourPartyRows.forEach(g => { earned += g.earned; paid += g.paid; balance += g.balance; });
        return { earned, paid, balance };
    }, [labourPartyRows]);
    const totalLbPages = Math.max(1, Math.ceil(labourPartyRows.length / safeLbPerPage));
    const paginatedLabourPartyRows = labourPartyRows.slice((lbPage - 1) * safeLbPerPage, lbPage * safeLbPerPage);
    const labourPartyPageTotals = React.useMemo(() => {
        let earned = 0, paid = 0, balance = 0;
        paginatedLabourPartyRows.forEach(g => { earned += g.earned; paid += g.paid; balance += g.balance; });
        return { earned, paid, balance };
    }, [paginatedLabourPartyRows]);

    const lbAnyFilterActive = !!(lbNameFilters.length || lbSubNameFilters.length || lbClientNameFilters.length || lbSiteFilters.length || lbPaymentModeFilters.length);
    const lbHasSelection = lbAnyFilterActive || lbDateApplied;
    const lbAnyDraftActive = !!(lbNameFiltersDraft.length || lbSubNameFiltersDraft.length || lbClientNameFiltersDraft.length || lbSiteFiltersDraft.length || lbPaymentModeFiltersDraft.length || lbAnyFilterActive || lbDateFromTouched || lbDateToTouched || lbDateApplied);
    const commitLbFilters = () => {
        setLbDateFrom(lbDateFromDraft);
        setLbDateTo(lbDateToDraft);
        if (lbDateFromTouched && lbDateToTouched) setLbDateApplied(true);
        setLbNameFilters(lbNameFiltersDraft);
        setLbSubNameFilters(lbSubNameFiltersDraft);
        setLbClientNameFilters(lbClientNameFiltersDraft);
        setLbSiteFilters(lbSiteFiltersDraft);
        setLbPaymentModeFilters(lbPaymentModeFiltersDraft);
        setLbPage(1);
        setLbSearchPulse(true);
        setTimeout(() => setLbSearchPulse(false), 600);
    };

    const resetLbFilters = () => {
        setLbNameFilters([]); setLbNameFiltersDraft([]);
        setLbSubNameFilters([]); setLbSubNameFiltersDraft([]);
        setLbClientNameFilters([]); setLbClientNameFiltersDraft([]);
        setLbSiteFilters([]); setLbSiteFiltersDraft([]);
        setLbPaymentModeFilters([]); setLbPaymentModeFiltersDraft([]);
        // Single Reset now also clears the date range — it's the one control
        // for the whole panel, so it shouldn't leave a stale date filter behind.
        setLbDateFrom('2000-01-01'); setLbDateFromDraft('2000-01-01'); setLbDateFromTouched(false);
        setLbDateTo(today()); setLbDateToDraft(today()); setLbDateToTouched(false);
        setLbDateApplied(false);
    };

    const lbSelectionLabel = lbNameFilters.length > 0 ? lbNameFilters.join(', ') : lbClientNameFilters.length > 0 ? lbClientNameFilters.join(', ') : 'Selected Filters';
    const PDF_TABLE_NEUTRAL = {
        headBg: [246, 246, 244] as [number, number, number],
        headText: [42, 40, 36] as [number, number, number],
        headLine: [205, 200, 192] as [number, number, number],
        bodyText: [58, 54, 48] as [number, number, number],
        altRow: [251, 250, 248] as [number, number, number],
        line: [222, 217, 208] as [number, number, number],
    };

    const getPdfTableStyles = (colCount = 8) => ({
        styles: {
            fontSize: colCount > 8 ? 6.5 : 8,
            cellPadding: { top: 2.2, right: 2.2, bottom: 2.2, left: 2.2 },
            font: 'helvetica',
            textColor: PDF_TABLE_NEUTRAL.bodyText,
            lineColor: PDF_TABLE_NEUTRAL.line,
            lineWidth: 0.2,
            valign: 'middle' as const,
            halign: 'center' as const,
            overflow: 'linebreak' as const,
        },

        headStyles: {
            fillColor: PDF_TABLE_NEUTRAL.headBg,
            textColor: PDF_TABLE_NEUTRAL.headText,
            fontSize: colCount > 8 ? 7 : 8,
            fontStyle: 'bold' as const,
            cellPadding: { top: 3, right: 2.2, bottom: 3, left: 2.2 },
            halign: 'center' as const,
            lineColor: PDF_TABLE_NEUTRAL.headLine,
            lineWidth: 0.4,
        },

        footStyles: {
            fillColor: PDF_TABLE_NEUTRAL.headBg,
            textColor: PDF_TABLE_NEUTRAL.headText,
            fontSize: colCount > 8 ? 7.5 : 8,
            fontStyle: 'bold' as const,
            lineColor: PDF_TABLE_NEUTRAL.headLine,
            lineWidth: 0.4,
        },

        alternateRowStyles: {
            fillColor: PDF_TABLE_NEUTRAL.altRow,
            textColor: PDF_TABLE_NEUTRAL.bodyText,
        },

        bodyStyles: {
            fillColor: [255, 255, 255] as [number, number, number],
            textColor: PDF_TABLE_NEUTRAL.bodyText,
        },
        tableLineColor: PDF_TABLE_NEUTRAL.line,
        tableLineWidth: 0.2,
    });

    const drawPdfTotalBox = (
        doc: any, y: number, items: { label: string; value: string; color?: [number, number, number] }[]
    ): number => {
        const W = doc.internal.pageSize.getWidth();
        const boxX = 10, boxW = W - 20, boxH = 18;
        doc.setFillColor(255, 255, 255); doc.rect(boxX, y, boxW, boxH, 'F');
        doc.setDrawColor(...PDF_COLORS.emberPale); doc.setLineWidth(0.5); doc.rect(boxX, y, boxW, boxH);
        doc.setFillColor(...PDF_COLORS.ember); doc.rect(boxX, y, 2, boxH, 'F');
        const segW = boxW / items.length;
        items.forEach((it, idx) => {
            const cx = boxX + segW * idx + segW / 2;
            const c = it.color || PDF_COLORS.ember;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...c);
            doc.text(it.label.toUpperCase(), cx, y + 6.5, { align: 'center' });
            doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...PDF_COLORS.text1);
            doc.text(it.value, cx, y + 14, { align: 'center' });
            if (idx > 0) { doc.setDrawColor(...PDF_TABLE_NEUTRAL.line); doc.setLineWidth(0.3); doc.line(boxX + segW * idx, y + 3, boxX + segW * idx, y + boxH - 3); }
        });
        return y + boxH;
    };

    const exportDaybookPDF = async () => {
        setDbPdfLoading(true);
        try {
            if (dbEntries.length === 0) {
                toast.warning('No data to export', 'Adjust your filters and try again.');
                setDbPdfLoading(false);
                return;
            }
            console.log('Exporting PDF with', dbEntries.length, 'entries');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            await new Promise(resolve => setTimeout(resolve, 100));

            const { jsPDF } = (window as any).jspdf;
            if (!jsPDF) {
                throw new Error('jsPDF not loaded');
            }

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const namePart = selectedBioNames.length > 0
                ? selectedBioNames.join('-').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40)
                : dbFilter.search
                    ? dbFilter.search.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 30)
                    : null;
            const pdfFileName = namePart
                ? `Daybook_${namePart}_${fromDate}_${toDate}.pdf`
                : `Daybook_${fromDate}_${toDate}.pdf`;

            const { startY: hdrY, logo, watermark, watermarkRatio } = await buildPdfHeader(doc, '', [
                { label: 'Report', value: 'Cash Book Transactions' },
                { label: 'Period', value: `${fmtDate(fromDate)} – ${fmtDate(toDate)}` },
                ...(selectedBioNames.length ? [{ label: 'Bio', value: selectedBioNames.join(', ') }] : []),
                ...(dbFilter.search ? [{ label: 'Search', value: dbFilter.search }] : []),
            ]);
            const db = (k: string) => dbVisibleCols.has(k);
            const cols: { header: string; key: string; align?: string }[] = [];
            if (db('sno')) cols.push({ header: 'S.No', key: 'sno', align: 'center' });
            if (db('date')) cols.push({ header: 'Date', key: 'date', align: 'center' });
            if (db('client')) cols.push({ header: 'Client', key: 'client' });
            if (db('category')) cols.push({ header: 'Account Head', key: 'category' });
            if (db('sub_category')) cols.push({ header: 'Account Sub-Head', key: 'sub_category' });
            if (db('bio_name')) cols.push({ header: 'Party Name', key: 'bio_name' });
            if (db('sub_name')) cols.push({ header: 'Associate Name', key: 'sub_name' });
            if (db('mode')) cols.push({ header: 'Mode', key: 'mode', align: 'center' });
            if (db('narration')) cols.push({ header: 'Narration', key: 'narration', align: 'left' });
            if (db('amount')) cols.push({ header: 'Amount (Rs.)', key: 'amount', align: 'right' });
            const DB_COL_WIDTH: Record<string, number> = {
                sno: 8, date: 17, client: 26, category: 20, sub_category: 22,
                bio_name: 26, sub_name: 20, mode: 16, amount: 24,
            };

            const fixedWidth = cols.filter(c => c.key !== 'narration').reduce((s, c) => s + (DB_COL_WIDTH[c.key] || 20), 0);
            const columnStyles: Record<number, { cellWidth: number; halign?: 'left' | 'center' | 'right'; overflow?: 'linebreak' }> = {};
            cols.forEach((c, idx) => {
                columnStyles[idx] = {
                    cellWidth: c.key === 'narration' ? Math.max(277 - fixedWidth, 40) : (DB_COL_WIDTH[c.key] || 20),
                    // Only set halign when this column asks for something
                    // other than the table default — an explicit `undefined`
                    // here would override the base center-align with autoTable's
                    // own left-align fallback instead of inheriting it.
                    ...(c.align ? { halign: c.align as 'left' | 'center' | 'right' } : {}),
                    // Explicit per-column overflow (belt-and-suspenders on top
                    // of the base styles.overflow) — narration is the one
                    // column whose text length isn't bounded by the data
                    // itself (it's free-text, sometimes a long list of
                    // worker names), so it's the column most likely to hit
                    // any wrap-calculation edge case and spill past the
                    // cell/table border. Being explicit here, plus the hard
                    // pdfSafeNarration() length cap on the text itself,
                    // means it can never escape its column width.
                    ...(c.key === 'narration' ? { overflow: 'linebreak' as const } : {}),
                };
            });

            const rows = dbEntries.map((e, i) => {
                const row: any[] = [];
                cols.forEach(col => {
                    if (col.key === 'sno') row.push(String(i + 1));
                    else if (col.key === 'date') row.push(fmtDate(e.transaction_date) || '—');
                    else if (col.key === 'client') row.push(e.client_name || '—');
                    else if (col.key === 'category') row.push(e.category_name || '—');
                    else if (col.key === 'sub_category') row.push(e.sub_category_name || '—');
                    else if (col.key === 'bio_name') row.push(e.bio_data_name || '—');
                    else if (col.key === 'sub_name') row.push(e.sub_name_name || '—');
                    else if (col.key === 'mode') row.push('');
                    else if (col.key === 'amount') {
                        const signed = (e.category_type === 'income' ? 1 : -1) * (Number(e.amount) || 0);
                        row.push(fmtINR_PDF(signed));
                    }
                    else if (col.key === 'narration') row.push(pdfSafeNarration(e.narration?.toString()));
                    else row.push('—');
                });
                return row;
            });

            console.log('Rows count:', rows.length, 'Cols:', cols.length);

            const incomeVal = Number(dbStats?.income) || 0;
            const expenseVal = Number(dbStats?.expense) || 0;
            const startY = drawPdfTotalBox(doc, hdrY + 1, [
                { label: 'Total Income', value: fmtINR_PDF(incomeVal), color: PDF_COLORS.success },
                { label: 'Total Expense', value: fmtINR_PDF(expenseVal), color: PDF_COLORS.danger },
                { label: 'Net Balance', value: fmtINR_PDF(incomeVal - expenseVal), color: PDF_COLORS.ember },
            ]) + 4;

            (doc as any).autoTable({
                head: [cols.map(c => c.header)],
                body: rows,
                startY,
                margin: { left: 10, right: 10, top: 10, bottom: 28 },
                tableWidth: 277,
                columnStyles,
                didParseCell: (data: any) => {
                    if (data.section === 'body' && cols[data.column.index]?.key === 'amount') {
                        const entry = dbEntries[data.row.index];
                        data.cell.styles.textColor = entry?.category_type === 'income' ? PDF_COLORS.success : PDF_COLORS.danger;
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
                didDrawCell: (data: any) => {
                    if (data.section === 'body' && cols[data.column.index]?.key === 'mode') {
                        const entry = dbEntries[data.row.index];
                        if (entry?.payment_mode) {
                            drawModeBadge(doc, entry.payment_mode, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2);
                        }
                    }
                },
                ...getPdfTableStyles(cols.length),
            });

            await buildPdfFooter(doc, logo, watermark, watermarkRatio);
            doc.save(pdfFileName);

        } catch (e) {
            console.error('PDF Error:', e);
            toast.error('PDF generation failed', (e as Error).message);
        } finally {
            setDbPdfLoading(false);
        }
    };

    const exportClientDebitPDF = async () => {
        setDbPdfLoading(true);
        try {
            if (clientDebitRows.length === 0) {
                toast.warning('No data to export', 'Adjust your filters and try again.');
                setDbPdfLoading(false);
                return;
            }

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            await new Promise(resolve => setTimeout(resolve, 100));

            const { jsPDF } = (window as any).jspdf;
            if (!jsPDF) throw new Error('jsPDF not loaded');

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const clientPart = String(dbFilter.client_names.join('-') || 'Client').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40);
            const dateStr = new Date().toISOString().slice(0, 10);
            const pdfFileName = `Daybook_ClientDebit_${clientPart}_${dateStr}.pdf`;
            const { startY: hdrY, logo, watermark, watermarkRatio } = await buildPdfHeader(doc, '', [
                { label: 'Report', value: 'Client Debit Activity' },
                { label: dbFilter.client_names.length > 1 ? 'Clients' : 'Client', value: String(dbFilter.client_names.join(', ') || '—') },
                { label: 'Sources', value: 'Cash Book, Wage Disbursement, Credit' },
                { label: 'Period', value: `${fmtDate(fromDate)} – ${fmtDate(toDate)}` },
            ]);
            const startY = drawPdfTotalBox(doc, hdrY + 1, [
                { label: `Total Debited — ${dbFilter.client_names.join(', ') || 'Client'}`, value: fmtINR_PDF(clientDebitTotals.grand), color: PDF_COLORS.danger },
            ]) + 4;

            const cols = [
                { header: 'S.No', align: 'center' },
                { header: 'Date', align: 'center' },
                { header: 'Source', align: 'center' },
                { header: 'Party Name' },
                { header: 'Associate Name' },
                { header: 'Client' },
                { header: 'Account Head' },
                { header: 'Mode', align: 'center' },
                { header: 'Narration' },
                { header: 'Income (Rs.)', align: 'right' },
                { header: 'Expense (Rs.)', align: 'right' },
            ];

            const rows = clientDebitRows.map((r, i) => [
                String(i + 1),
                fmtDate(r.date) || '—',
                String(r.source || '—'),
                String(r.bio_name || '—'),
                String(r.sub_name || '—'),
                String(r.client || '—'),
                String(r.category || '—'),
                '',
                pdfSafeNarration(String(r.narration || r.sub || '—')),
                '—',
                fmtINR_PDF(r.amount),
            ]);

            const columnStyles = {
                0: { cellWidth: 8, halign: 'center' as const },
                1: { cellWidth: 17, halign: 'center' as const },
                2: { cellWidth: 24, halign: 'center' as const },
                3: { cellWidth: 26 },
                4: { cellWidth: 20 },
                5: { cellWidth: 26 },
                6: { cellWidth: 22 },
                7: { cellWidth: 18, halign: 'center' as const },
                8: { cellWidth: 72, halign: 'left' as const, overflow: 'linebreak' as const },
                9: { cellWidth: 19, halign: 'right' as const },
                10: { cellWidth: 25, halign: 'right' as const },
            };

            const modeColIdx = cols.findIndex(c => c.header === 'Mode');
            (doc as any).autoTable({
                head: [cols.map(c => c.header)],
                body: rows,
                startY,
                margin: { left: 10, right: 10, top: 10, bottom: 28 },
                tableWidth: 277,
                columnStyles,
                didDrawCell: (data: any) => {
                    if (data.section === 'body' && data.column.index === modeColIdx) {
                        const r = clientDebitRows[data.row.index];
                        if (r?.mode && r.mode !== '—') {
                            drawModeBadge(doc, r.mode, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2);
                        }
                    }
                },
                ...getPdfTableStyles(cols.length),
            });

            await buildPdfFooter(doc, logo, watermark, watermarkRatio);
            doc.save(pdfFileName);
        } catch (e) {
            console.error('PDF Error:', e);
            toast.error('PDF generation failed', (e as Error).message);
        } finally {
            setDbPdfLoading(false);
        }
    };

    const exportCreditPartyPDF = async () => {
        setCrPdfLoading(true);
        try {
            if (creditPartyRows.length === 0) {
                toast.warning('No data to export', 'Adjust your filters and try again.');
                setCrPdfLoading(false);
                return;
            }

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            await new Promise(resolve => setTimeout(resolve, 100));
            const { jsPDF } = (window as any).jspdf;
            if (!jsPDF) throw new Error('jsPDF not loaded');

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const namePart = String(crSelectionLabel || 'Credit').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40);
            const dateStr = new Date().toISOString().slice(0, 10);
            const pdfFileName = `AccountsPayableReport_${namePart}_${dateStr}.pdf`;

            const { startY: hdrY, logo, watermark, watermarkRatio } = await buildPdfHeader(doc, '', [
                { label: 'Report', value: 'Accounts Payable' },
                { label: crNameFilters.length > 0 ? 'Biller' : 'Client', value: crSelectionLabel },
                { label: 'Records', value: String(creditPartyRows.length) },
                { label: 'Period', value: `${fmtDate(fromDate)} – ${fmtDate(toDate)}` },
            ]);
            const startY = drawPdfTotalBox(doc, hdrY + 1, [
                { label: 'Total Credit', value: fmtINR_PDF(creditPartyTotals.credit), color: PDF_COLORS.danger },
                { label: 'Total Paid', value: fmtINR_PDF(creditPartyTotals.paid), color: PDF_COLORS.success },
                { label: 'Balance', value: fmtINR_PDF(creditPartyTotals.credit - creditPartyTotals.paid), color: PDF_COLORS.ember },
            ]) + 4;

            const cols = [
                { header: 'S.No', align: 'center' },
                { header: 'Date', align: 'center' },
                { header: 'Client' },
                { header: 'Account Head' },
                { header: 'Party' },
                { header: 'Status', align: 'center' },
                { header: 'Reference', align: 'center' },
                { header: 'Mode', align: 'center' },
                { header: 'Notes' },
                { header: 'Credit (Rs.)', align: 'right' },
                { header: 'Paid (Rs.)', align: 'right' },
                { header: 'Balance (Rs.)', align: 'right' },
            ];

            const rows = creditPartyRows.map((r, i) => [
                String(i + 1),
                fmtDate(r.date) || '—',
                String(r.clientName || '—'),
                String(r.category || '—'),
                String(r.party || '—'),
                r.status === 'paid' ? 'Paid' : r.status === 'partial' ? 'Partial' : r.isOverdue ? 'Overdue' : 'Due',
                String(r.reference || '—'),
                '',
                pdfSafeNarration(r.notes),
                r.kind === 'bill' ? fmtINR_PDF(r.credit) : '—',
                fmtINR_PDF(r.paid),
                r.balance !== undefined ? fmtINR_PDF(r.balance) : '—',
            ]);

            const columnStyles = {
                0: { cellWidth: 8, halign: 'center' as const },
                1: { cellWidth: 16, halign: 'center' as const },
                2: { cellWidth: 24 },
                3: { cellWidth: 20 },
                4: { cellWidth: 24 },
                5: { cellWidth: 20, halign: 'center' as const },
                6: { cellWidth: 18, halign: 'center' as const },
                7: { cellWidth: 16, halign: 'center' as const },
                8: { cellWidth: 71, halign: 'left' as const, overflow: 'linebreak' as const },
                9: { cellWidth: 20, halign: 'right' as const },
                10: { cellWidth: 20, halign: 'right' as const },
                11: { cellWidth: 20, halign: 'right' as const },
            };

            (doc as any).autoTable({
                head: [cols.map(c => c.header)],
                body: rows,
                startY,
                margin: { left: 10, right: 10, top: 10, bottom: 28 },
                tableWidth: 277,
                columnStyles,
                didParseCell: (data: any) => {
                    if (data.section !== 'body') return;
                    const r = creditPartyRows[data.row.index];
                    if (!r) return;
                    if (data.column.index === 9 && r.kind === 'bill') { data.cell.styles.textColor = PDF_COLORS.danger; data.cell.styles.fontStyle = 'bold'; }
                    if (data.column.index === 10) { data.cell.styles.textColor = PDF_COLORS.success; data.cell.styles.fontStyle = 'bold'; }
                    if (data.column.index === 11 && r.balance !== undefined) {
                        data.cell.styles.textColor = (r.balance || 0) > 0 ? PDF_COLORS.danger : PDF_COLORS.success;
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
                didDrawCell: (data: any) => {
                    // Only draw a badge when a payment actually has a mode —
                    // an unpaid bill row genuinely has none, and drawing an
                    // "Others" icon there would wrongly imply a payment exists.
                    if (data.section === 'body' && data.column.index === 7) {
                        const r = creditPartyRows[data.row.index];
                        if (r?.mode && r.mode !== '—') {
                            drawModeBadge(doc, r.mode, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2);
                        }
                    }
                },
                ...getPdfTableStyles(cols.length),
            });

            await buildPdfFooter(doc, logo, watermark, watermarkRatio);
            doc.save(pdfFileName);
        } catch (e) {
            console.error('PDF Error:', e);
            toast.error('PDF generation failed', (e as Error).message);
        } finally {
            setCrPdfLoading(false);
        }
    };

    const exportCreditPDF = async () => {
        setCrPdfLoading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            const { jsPDF } = (window as any).jspdf; const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const namePart = crNameFilters.length > 0
                ? crNameFilters.join('-').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40)
                : crCategoryIdFilters.length > 0
                    ? crCategoryIdFilters.map(id => crCategoryIdOpts.find(o => o.value === id)?.label || id).join('-').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 30)
                    : crStatusFilters.length > 0
                        ? crStatusFilters.join('-')
                        : null;
            const dateStr = new Date().toISOString().slice(0, 10);
            const pdfFileName = namePart
                ? `AccountsPayable_${namePart}_${dateStr}.pdf`
                : `AccountsPayable_Report_${dateStr}.pdf`;

            const { startY: hdrY, logo, watermark, watermarkRatio } = await buildPdfHeader(doc, `${filteredVendors.length} vendors`, [
                { label: 'Report', value: 'Accounts Payable' },
                ...(crNameFilters.length ? [{ label: 'Party', value: crNameFilters.join(', ') }] : []),
                ...(crStatusFilters.length ? [{ label: 'Status', value: crStatusFilters.join(', ') }] : []),
            ]);
            const cr = (_k: string) => true;
            const cols: { header: string; key: string; align?: string }[] = [];
            if (cr('sno')) cols.push({ header: 'S:No', key: 'sno', align: 'center' });
            if (cr('last_txn')) cols.push({ header: 'Last Txn', key: 'last_txn', align: 'center' });
            if (cr('party_name')) cols.push({ header: 'Party Name', key: 'party_name' });
            if (cr('category')) cols.push({ header: 'Account Head', key: 'category' });
            if (cr('phone')) cols.push({ header: 'Phone', key: 'phone', align: 'center' });
            if (cr('total_credit')) cols.push({ header: 'Total Credit (Rs.)', key: 'total_credit', align: 'right' });
            if (cr('paid')) cols.push({ header: 'Paid (Rs.)', key: 'paid', align: 'right' });
            if (cr('balance')) cols.push({ header: 'Balance (Rs.)', key: 'balance', align: 'right' });
            if (cr('days_overdue')) cols.push({ header: 'Days Overdue', key: 'days_overdue', align: 'center' });
            if (cr('status')) cols.push({ header: 'Status', key: 'status', align: 'center' });
            if (cr('entries_pmts')) cols.push({ header: 'Entries/Pmts', key: 'entries_pmts', align: 'center' });

            const rows = filteredVendors.map((v, i) => cols.map(c => {
                if (c.key === 'sno') return String(i + 1);
                if (c.key === 'party_name') return v.party_name || '—';
                if (c.key === 'category') return v.category_name || '—';
                if (c.key === 'phone') return v.phone || '—';
                if (c.key === 'total_credit') return fmtINR_PDF(resolveVendorCredit(v));
                if (c.key === 'paid') return fmtINR_PDF(resolveVendorPaid(v));
                if (c.key === 'balance') return fmtINR_PDF(resolveVendorBalance(v));
                if (c.key === 'days_overdue') return v.days_overdue && Number(v.days_overdue) > 0 ? `${v.days_overdue} days` : '—';
                if (c.key === 'status') return resolveVendorStatus(v);
                if (c.key === 'last_txn') return fmtDate(v.last_transaction_date);
                if (c.key === 'entries_pmts') return `${resolveVendorEntryCount(v)} / ${resolveVendorPaymentCount(v)}`;
                return '—';
            }));

            const totalCreditSum = filteredVendors.reduce((s, v) => s + resolveVendorCredit(v), 0);
            const totalPaidSum = filteredVendors.reduce((s, v) => s + resolveVendorPaid(v), 0);
            const totalBalanceSum = filteredVendors.reduce((s, v) => s + resolveVendorBalance(v), 0);
            const startY = drawPdfTotalBox(doc, hdrY + 1, [
                { label: 'Total Credit', value: fmtINR_PDF(totalCreditSum), color: PDF_COLORS.danger },
                { label: 'Total Paid', value: fmtINR_PDF(totalPaidSum), color: PDF_COLORS.success },
                { label: 'Balance', value: fmtINR_PDF(totalBalanceSum), color: PDF_COLORS.ember },
            ]) + 4;

            // Explicit width for every column so the table can never exceed
            // the printable 277mm — previously Last Txn/Party Name/Category/
            // Phone/Days Overdue/Status/Entries-Pmts had no cellWidth at all.
            const CR_VENDOR_COL_WIDTH: Record<string, number> = {
                sno: 8, last_txn: 18, party_name: 40, category: 22, phone: 22,
                total_credit: 30, paid: 28, balance: 28, days_overdue: 20,
                status: 18, entries_pmts: 22,
            };
            const columnStyles: Record<number, object> = {};
            cols.forEach((c, idx) => {
                columnStyles[idx] = {
                    cellWidth: CR_VENDOR_COL_WIDTH[c.key] || 22,
                    ...(c.align ? { halign: c.align } : {}),
                };
            });

            (doc as any).autoTable({
                head: [cols.map(c => c.header)],
                body: rows,
                startY,
                margin: { left: 10, right: 10, top: 10, bottom: 28 },
                tableWidth: 277,
                columnStyles,
                ...getPdfTableStyles(cols.length),
            });
            await buildPdfFooter(doc, logo, watermark, watermarkRatio);
            doc.save(pdfFileName);
        } catch (e) { console.error(e); toast.error('PDF generation failed', 'Please try again.'); } finally { setCrPdfLoading(false); }
    };

    const exportClientPortalPDF = async () => {
        setCpPdfLoading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            const { jsPDF } = (window as any).jspdf; const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            const namePart = cpClientNameFilters.length > 0
                ? cpClientNameFilters.join('-').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40)
                : cpStatusFilters.length > 0
                    ? cpStatusFilters.join('-')
                    : null;
            const dateStr = new Date().toISOString().slice(0, 10);
            const pdfFileName = namePart
                ? `AccountsReceivable_${namePart}_${dateStr}.pdf`
                : `AccountsReceivable_Report_${dateStr}.pdf`;
            const { startY: hdrY, logo, watermark, watermarkRatio } = await buildPdfHeader(doc, `${cpPartyRows.length} records`, [
                { label: 'Report', value: 'Accounts Receivable' },
                ...(cpClientNameFilters.length ? [{ label: 'Client', value: cpClientNameFilters.join(', ') }] : []),
                ...(cpStatusFilters.length ? [{ label: 'Status', value: cpStatusFilters.join(', ') }] : []),
            ]);
            const startY = drawPdfTotalBox(doc, hdrY + 1, [
                { label: 'Total Paid', value: fmtINR_PDF(cpPartyTotals.paid), color: PDF_COLORS.success },
            ]) + 4;
            const cp = (k: string) => cpVisibleCols.has(k);
            const cols: { header: string; key: string; align?: string }[] = [];
            if (cp('sno')) cols.push({ header: 'S.No', key: 'sno', align: 'center' });
            if (cp('date')) cols.push({ header: 'Date', key: 'date', align: 'center' });
            if (cp('client')) cols.push({ header: 'Client', key: 'client' });
            if (cp('project')) cols.push({ header: 'Project', key: 'project' });
            if (cp('type')) cols.push({ header: 'Type', key: 'type', align: 'center' });
            if (cp('status')) cols.push({ header: 'Status', key: 'status', align: 'center' });
            if (cp('mode')) cols.push({ header: 'Mode', key: 'mode', align: 'center' });
            if (cp('reference')) cols.push({ header: 'Reference', key: 'reference' });
            if (cp('notes')) cols.push({ header: 'Notes', key: 'notes' });
            if (cp('paid')) cols.push({ header: 'Paid (Rs.)', key: 'paid', align: 'right' });

            const rows = cpPartyRows.map((r, i) => cols.map(c => {
                if (c.key === 'sno') return String(i + 1);
                if (c.key === 'date') return fmtDate(r.date);
                if (c.key === 'client') return r.client;
                if (c.key === 'project') return r.project;
                if (c.key === 'type') return labelForType(r.type);
                if (c.key === 'status') return labelForStatus(r.status);
                if (c.key === 'mode') return r.mode ? labelForMode(r.mode) : '—';
                if (c.key === 'reference') return r.reference || '—';
                if (c.key === 'paid') return fmtINR_PDF(r.paid);
                if (c.key === 'notes') return pdfSafeNarration(r.notes);
                return '—';
            }));

            // Every column except Notes gets a fixed width; Notes absorbs
            // whatever's left of the printable 277mm so the table can never
            // exceed the page regardless of which optional columns the user
            // has toggled on via the Columns selector (previously this table
            // had no explicit tableWidth and left every column — including
            // Notes — to autoTable's unconstrained "auto" sizing, which could
            // add up to more than the page's printable width).
            const CP_COL_WIDTH: Record<string, number> = {
                sno: 8, date: 17, client: 30, project: 28, type: 20,
                status: 20, mode: 18, reference: 24, paid: 26,
            };
            const cpFixedWidth = cols.filter(c => c.key !== 'notes').reduce((s, c) => s + (CP_COL_WIDTH[c.key] || 20), 0);
            const columnStyles: Record<number, object> = {};
            cols.forEach((c, idx) => {
                columnStyles[idx] = {
                    cellWidth: c.key === 'notes' ? Math.max(277 - cpFixedWidth, 40) : (CP_COL_WIDTH[c.key] || 20),
                    ...(c.align ? { halign: c.align } : {}),
                    ...(c.key === 'notes' ? { halign: 'left' as const, overflow: 'linebreak' as const } : {}),
                };
            });

            (doc as any).autoTable({
                head: [cols.map(c => c.header)],
                body: rows,
                startY,
                margin: { left: 10, right: 10, top: 10, bottom: 28 },
                tableWidth: 277,
                columnStyles,
                ...getPdfTableStyles(cols.length),
            });

            await buildPdfFooter(doc, logo, watermark, watermarkRatio);
            doc.save(pdfFileName);
        } catch (e) { console.error(e); toast.error('PDF generation failed', 'Please try again.'); } finally { setCpPdfLoading(false); }
    };

    const exportLabourPDF = async () => {
        setLbPdfLoading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
            const { jsPDF } = (window as any).jspdf; const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const namePart = lbNameFilters.length > 0
                ? lbNameFilters.join('-').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40)
                : lbClientNameFilters.length > 0
                    ? lbClientNameFilters.join('-').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40)
                    : null;
            const dateStr = new Date().toISOString().slice(0, 10);
            const pdfFileName = namePart
                ? `WageDisbursement_${namePart}_${dateStr}.pdf`
                : `WageDisbursement_Report_${dateStr}.pdf`;
            const { startY: hdrY, logo, watermark, watermarkRatio } = await buildPdfHeader(doc, '', [
                { label: 'Report', value: 'Wage Disbursement' },
                ...(lbNameFilters.length ? [{ label: 'Worker', value: lbNameFilters.join(', ') }] : []),
                ...(lbClientNameFilters.length ? [{ label: 'Client', value: lbClientNameFilters.join(', ') }] : []),
            ]);

            // Summary stat card right under the header, before the table —
            // same treatment every other report PDF now gives its totals,
            // showing Total Earned / Total Paid / Net Balance at a glance.
            const startY = drawPdfTotalBox(doc, hdrY + 1, [
                { label: 'Total Earned', value: fmtINR_PDF(labourPartyTotals.earned), color: PDF_COLORS.danger },
                { label: 'Total Paid', value: fmtINR_PDF(labourPartyTotals.paid), color: PDF_COLORS.success },
                { label: 'Net Balance', value: fmtINR_PDF(labourPartyTotals.balance), color: PDF_COLORS.ember },
            ]) + 4;

            const lb = (k: string) => lbVisibleCols.has(k);
            const cols: { header: string; key: string; align?: string }[] = [];
            if (lb('sno')) cols.push({ header: 'S.No', key: 'sno', align: 'center' });
            if (lb('date')) cols.push({ header: 'Date', key: 'date', align: 'center' });
            if (lb('client')) cols.push({ header: 'Client', key: 'client', align: 'center' });
            if (lb('worker')) cols.push({ header: 'Worker', key: 'worker', align: 'center' });
            if (lb('sub_name')) cols.push({ header: 'Associate Name', key: 'sub_name', align: 'center' });
            if (lb('shifts')) cols.push({ header: 'Shifts', key: 'shifts', align: 'center' });
            if (lb('earned')) cols.push({ header: 'Earned (Rs.)', key: 'earned', align: 'center' });
            if (lb('paid')) cols.push({ header: 'Paid (Rs.)', key: 'paid', align: 'center' });
            if (lb('balance')) cols.push({ header: 'Balance (Rs.)', key: 'balance', align: 'center' });
            if (lb('status')) cols.push({ header: 'Status', key: 'status', align: 'center' });

            const rows = labourPartyRows.map((g, i) => cols.map(c => {
                if (c.key === 'sno') return String(i + 1);
                if (c.key === 'date') return lbRowDateLabel(g);
                if (c.key === 'worker') return g.worker;
                if (c.key === 'sub_name') return g.isOwn ? 'Own Work' : (g.subName || '—');
                if (c.key === 'client') return g.client || '—';
                if (c.key === 'shifts') return g.shifts ? String(g.shifts) : '—';
                if (c.key === 'earned') return fmtINR_PDF(g.earned);
                if (c.key === 'paid') return fmtINR_PDF(g.paid);
                if (c.key === 'balance') return fmtINR_PDF(g.balance);
                if (c.key === 'status') return g.balance > 0.005 ? 'Due' : 'Clear';
                return '—';
            }));

            // Mirror the on-screen table's Total row: one merged label cell
            // ("Total N labour · selection"), then the same Earned/Paid/
            // Balance totals shown under the live preview's tfoot. The
            // aggregate status reads as a proper standing (Outstanding /
            // Fully Settled) rather than reusing the per-row Due/Clear tag.
            const nonAmountKeys = cols.filter(c => !['earned', 'paid', 'balance', 'status'].includes(c.key));
            const totalRow: any[] = [];
            if (nonAmountKeys.length > 0) {
                totalRow.push({ content: `TOTAL  (${labourPartyRows.length} manpower · ${lbSelectionLabel})`, colSpan: nonAmountKeys.length, styles: { halign: 'center' } });
            }
            if (lb('earned')) totalRow.push(fmtINR_PDF(labourPartyTotals.earned));
            if (lb('paid')) totalRow.push(fmtINR_PDF(labourPartyTotals.paid));
            if (lb('balance')) totalRow.push(fmtINR_PDF(labourPartyTotals.balance));
            if (lb('status')) totalRow.push((labourPartyTotals.balance || 0) > 0.005 ? 'Outstanding' : 'Fully Settled');

            // Explicit width for every column (previously Client/Worker/Sub
            // Name/Status had none, so autoTable auto-sized them with no
            // ceiling — safe most of the time, but with no tableWidth set
            // either, a run of long names could push the table past the
            // printable area). All 10 possible columns sum to just under the
            // 277mm printable width, so the table is safe with any subset
            // of columns toggled on via the Columns selector.
            const LB_COL_WIDTH: Record<string, number> = {
                sno: 8, date: 22, client: 42, worker: 42, sub_name: 38, shifts: 18,
                earned: 28, paid: 28, balance: 28, status: 23,
            };
            const columnStyles: Record<number, object> = {};
            cols.forEach((c, idx) => {
                columnStyles[idx] = { halign: 'center', cellWidth: LB_COL_WIDTH[c.key] || 25 };
            });

            // buildPdfFooter draws a fixed "Authorised Signatory" box starting
            // 42mm above the bottom of the LAST page only. Reserve that same
            // 42mm (plus a small gap) as the table's own page-break threshold
            // so a long table never prints its Total row underneath it —
            // autoTable will start a fresh page for any row that would land
            // inside that zone.
            const SIGNATURE_ZONE_MM = 46;
            (doc as any).autoTable({
                head: [cols.map(c => c.header)],
                body: rows,
                foot: [totalRow],
                startY,
                margin: { left: 10, right: 10, top: 10, bottom: SIGNATURE_ZONE_MM },
                tableWidth: 277,
                columnStyles,
                ...getPdfTableStyles(cols.length),
            });

            // Belt-and-braces: if the table still ends up close to where the
            // signature box will be drawn (e.g. a very short table that
            // never triggered autoTable's own page-break), push to a clean
            // page so nothing gets drawn over.
            const PH = doc.internal.pageSize.getHeight();
            const finalY = (doc as any).lastAutoTable?.finalY ?? startY;
            if (finalY > PH - SIGNATURE_ZONE_MM) {
                doc.addPage();
            }

            await buildPdfFooter(doc, logo, watermark, watermarkRatio);
            doc.save(pdfFileName);
        } catch (e) { console.error(e); toast.error('PDF generation failed', 'Please try again.'); } finally { setLbPdfLoading(false); }
    };

    const db = (k: string) => dbVisibleCols.has(k);
    const dbColSpan = dbVisibleCols.size + (db('amount') ? 1 : 0);
    const cr = (k: string) => crVisibleCols.has(k);
    const crCol = cr;
    const cp = (k: string) => cpVisibleCols.has(k);

    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);

    return (
        <div className="T" ref={rootRef}>
            <style>{ERP_CSS}{T_CSS}</style>
            <div className="T-bg-pattern" />

            {/* === HEADER START === */}
            <div className="ERP-hdr" style={{ padding: '20px 36px 18px', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div className="ERP-hdr-left" style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    {/* Financial Intelligence Start */}
                    <div>
                        <div className="ERP-eyebrow" style={{ color: hdrAccent, marginBottom: 6 }}>
                            <span className="ERP-eyebrow-line" style={{ background: hdrAccent }} />
                            <span className="ERP-eyebrow-dot" style={{ background: hdrAccent }} />
                            Financial Intelligence
                        </div>
                        <h1 className="ERP-title MD-page-title" style={{ marginBottom: 6 }}>
                            {section === 'all' && <>ERP <span className="ERP-title-em" style={{ color: hdrAccent }}>Business Insights</span> Center</>}
                            {section === 'daybook' && <><span className="ERP-title-em" style={{ color: hdrAccent }}>Cash Book</span> Report</>}
                            {section === 'credit' && <><span className="ERP-title-em" style={{ color: hdrAccent }}>Accounts Payable</span> Report</>}
                            {section === 'labour' && <><span className="ERP-title-em" style={{ color: hdrAccent }}>Manpower</span> Report</>}
                            {section === 'client' && <><span className="ERP-title-em" style={{ color: hdrAccent }}>Accounts Receivable</span> Report</>}
                        </h1>
                    </div>
                    {/* Financial Intellegience End */}
                </div>
            </div>
            <div className="ERP-divider" style={{ marginBottom: 0, marginLeft: 36, marginRight: 36 }} />
            {/* === HEADER END  === */}

            <div className="T-main">

                {/* Connectivity banner — shown when a fetch never got an HTTP
                    response at all (timeout / connection refused), meaning
                    the API server itself is unreachable rather than any one
                    report having a bug. Previously this failed silently
                    (console.error only) and the page just looked empty. */}
                {serverError && (
                    <div style={{
                        margin: '0 0 20px', padding: '13px 18px', borderRadius: 12,
                        background: 'rgba(217,59,85,.08)', border: '1px solid rgba(217,59,85,.3)',
                        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D93B55" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ fontWeight: 800, fontSize: 12, color: '#D93B55' }}>Can't reach the server</div>
                            <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 2 }}>
                                The backend didn't respond in time — check that XAMPP's Apache &amp; MySQL are running, then retry.
                            </div>
                        </div>
                        <button type="button"
                            onClick={() => { setServerError(false); fetchDaybook(); fetchCredit(); fetchPortal(); fetchLabor(); fetchLbAttendance(); fetchLbWorkers(); }}
                            style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #D93B55', background: '#faf9f7', color: '#D93B55', fontWeight: 800, fontSize: 10.5, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0 }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* === OVERVIEW SECTION START === */}
                {section === 'all' && (
                    <div className="T-section">
                        <div style={{ padding: 'clamp(14px, 4vw, 28px) clamp(14px, 5vw, 36px) 8px', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))', gap: 24 }}>
                                <div className="T-card" style={{ margin: 0 }}>
                                    <div className="T-card-head">
                                        <div className="T-card-head-left"><div className="T-card-icon" style={{ background: 'rgba(154,52,18,.07)', fontSize: 14 }}>📈</div><span className="T-card-title">Monthly Collection</span><span className="T-card-badge" style={{ background: 'rgba(154,52,18,.08)', color: 'var(--info)' }}>CLIENT</span></div>
                                        <span style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>{cpMonthly.length > 0 && `Last ${cpMonthly.length} months`}</span>
                                    </div>
                                    <MiniBarChart data={cpMonthly} loading={cpLoading} />
                                    <div className="T-sync"><span className="T-sync-dot" />{cpMonthly.length} months · Total: <strong>{fmtINR(cpMonthly.reduce((s, m) => s + (m.total || m.collected || 0), 0))}</strong></div>
                                </div>
                                <div className="T-card" style={{ margin: 0 }}>
                                    <div className="T-card-head">
                                        <div className="T-card-head-left"><div className="T-card-icon" style={{ background: 'var(--ember-ghost)', fontSize: 14 }}>⚡</div><span className="T-card-title">Credit Status</span><span className="T-card-badge" style={{ background: 'var(--ember-ghost)', color: 'var(--ember)' }}>CREDIT</span></div>
                                        <span style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>{crVendors.length} vendors</span>
                                    </div>
                                    <AgingBars overdue={crOutstanding} pending={Math.max(0, crTotal - crPaid - crOutstanding)} paid={crPaid} total={crTotal + crPaid} loading={crLoading} />
                                    <div className="T-sync"><span className="T-sync-dot" />{crVendors.length} vendors · Total Credit: <strong>{fmtINR(crTotal)}</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}{/* === OVERVIEW SECTION END === */}

                {/* === MODULE 1: DAYBOOK START === */}
                {(section === 'all' || section === 'daybook') && (
                    <div className="T-section" style={{ paddingTop: 28 }}>
                        <div className="T-card">
                            <div className="T-card-head">
                                <div className="T-card-head-left"><div className="T-card-icon T-card-icon-db"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="19" cy="17" r="3.2" /><path d="M21.2 19.2L23 21" /></svg></div><span className="T-card-title">Cash Book Transactions</span><span className="T-card-badge T-card-badge-db">MODULE 1</span></div>
                                <div className="T-card-head-right">{dbFilter.client_names.length === 0 && <ColumnSelector columns={DB_COLUMNS} visible={dbVisibleCols} onChange={setDbVisibleCols} />}<PdfBtn label="Cash Book" onClick={dbFilter.client_names.length > 0 ? exportClientDebitPDF : exportDaybookPDF} loading={dbPdfLoading} disabled={dbFilter.client_names.length > 0 ? clientDebitRows.length === 0 : !dbAnyFilterActive || dbEntries.length === 0} /></div>
                            </div>
                            {dbAnyFilterActive && dbFilter.client_names.length === 0 && dbStats && (
                                <div className="T-mode-stats">
                                    {(dbIncludeLabour || dbIncludeCredit) ? (
                                        // Manpower/Credit toggle is on — exclusive-source view, each
                                        // gets its own outstanding-unpaid box (unchanged, see
                                        // [[daybook_report_source_toggle_and_paid_amount_fix]]).
                                        <>
                                            {dbIncludeLabour && (
                                                <div className="ERP-stat">
                                                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--err),#F87171)' }} />
                                                    <div className="ERP-stat-label">Outstanding Manpower Dues</div>
                                                    <div className="ERP-stat-val" style={{ color: 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbStats.labourUnpaid || 0)}</div>
                                                </div>
                                            )}
                                            {dbIncludeCredit && (
                                                <div className="ERP-stat">
                                                    <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--err),#F87171)' }} />
                                                    <div className="ERP-stat-label">Credit Outstanding (Unpaid)</div>
                                                    <div className="ERP-stat-val" style={{ color: 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbStats.creditUnpaid || 0)}</div>
                                                </div>
                                            )}
                                        </>
                                    ) : dbDateApplied ? (
                                        // A Date Range was explicitly picked & applied (with neither
                                        // Manpower/Credit toggle on) — show the same 4-box concept as
                                        // the Client Name view (Cash Book / Manpower / Credit / Total),
                                        // just at the org-wide level instead of per-client. Category/
                                        // Sub Category/Party Master/etc-only filtering (no date picked)
                                        // keeps the plain Total Credit/Debit/Net Balance cards below
                                        // instead — see [[daybook_report_client_daybook_only_table]].
                                        <>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--info),#F0834D)' }} />
                                                <div className="ERP-stat-label">Cash Book</div>
                                                <div className="ERP-stat-val" style={{ color: 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbStats.expense || 0)}</div>
                                            </div>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--purple),#D98255)' }} />
                                                <div className="ERP-stat-label">Manpower</div>
                                                <div className="ERP-stat-val" style={{ color: 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbGlobalLabourUnpaid)}</div>
                                            </div>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--warn),#F0834D)' }} />
                                                <div className="ERP-stat-label">Credit</div>
                                                <div className="ERP-stat-val" style={{ color: 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbGlobalCreditUnpaid)}</div>
                                            </div>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),var(--amber))' }} />
                                                <div className="ERP-stat-label">Total Balance</div>
                                                <div className="ERP-stat-val" style={{ color: 'var(--ember)', fontSize: 16, fontWeight: 800 }}>{fmtFull((dbStats.expense || 0) + dbGlobalLabourUnpaid + dbGlobalCreditUnpaid)}</div>
                                            </div>
                                        </>
                                    ) : (
                                        // No date range applied — only Category/Sub Category/Bio
                                        // Data/Associate Name/Mode/Search picked. Plain Credit/Debit/Net.
                                        <>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--success),#34D399)' }} />
                                                <div className="ERP-stat-label">Total Credit</div>
                                                <div className="ERP-stat-val" style={{ color: 'var(--success)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbStats.income || 0)}</div>
                                                {dbModeBreakdown.credit.length > 0 && (
                                                    <div className="DB-stat-breakdown">
                                                        <div className="DB-stat-chip cash">
                                                            <span className="DB-stat-chip-icon"><StatIcon name="cash" size={9} color="#1E9C6A" /></span>
                                                            <span className="DB-stat-chip-text">
                                                                <span className="DB-stat-chip-label">Cash Holding</span>
                                                                <span className="DB-stat-chip-val">{fmtFull(dbCashBank.creditCash)}</span>
                                                            </span>
                                                        </div>
                                                        <div className="DB-stat-chip bank">
                                                            <span className="DB-stat-chip-icon"><StatIcon name="bank" size={9} color="#A6491D" /></span>
                                                            <span className="DB-stat-chip-text">
                                                                <span className="DB-stat-chip-label">Bank Holding</span>
                                                                <span className="DB-stat-chip-val">{fmtFull(dbCashBank.creditBank)}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--err),#F87171)' }} />
                                                <div className="ERP-stat-label">Total Debit</div>
                                                <div className="ERP-stat-val" style={{ color: 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(dbStats.expense || 0)}</div>
                                                {dbModeBreakdown.debit.length > 0 && (
                                                    <div className="DB-stat-breakdown">
                                                        <div className="DB-stat-chip cash">
                                                            <span className="DB-stat-chip-icon"><StatIcon name="cash" size={9} color="#1E9C6A" /></span>
                                                            <span className="DB-stat-chip-text">
                                                                <span className="DB-stat-chip-label">Cash Holding</span>
                                                                <span className="DB-stat-chip-val">{fmtFull(dbCashBank.debitCash)}</span>
                                                            </span>
                                                        </div>
                                                        <div className="DB-stat-chip bank">
                                                            <span className="DB-stat-chip-icon"><StatIcon name="bank" size={9} color="#A6491D" /></span>
                                                            <span className="DB-stat-chip-text">
                                                                <span className="DB-stat-chip-label">Bank Holding</span>
                                                                <span className="DB-stat-chip-val">{fmtFull(dbCashBank.debitBank)}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ERP-stat">
                                                <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--info),#F0834D)' }} />
                                                <div className="ERP-stat-label">Net Balance</div>
                                                <div className="ERP-stat-val" style={{ color: (dbStats.balance || 0) >= 0 ? 'var(--success)' : 'var(--err)', fontSize: 16, fontWeight: 800 }}>{fmtFull(Math.abs(dbStats.balance || 0))}</div>
                                                {dbEntries.length > 0 && (
                                                    <div className="DB-stat-breakdown">
                                                        <div className="DB-stat-chip cash">
                                                            <span className="DB-stat-chip-icon"><StatIcon name="cash" size={9} color="#1E9C6A" /></span>
                                                            <span className="DB-stat-chip-text">
                                                                <span className="DB-stat-chip-label">Cash Holding</span>
                                                                <span className="DB-stat-chip-val" style={{ color: dbCashBank.netCash < 0 ? 'var(--err)' : 'var(--t1)' }}>
                                                                    {dbCashBank.netCash < 0 ? '-' : ''}{fmtFull(Math.abs(dbCashBank.netCash))}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="DB-stat-chip bank">
                                                            <span className="DB-stat-chip-icon"><StatIcon name="bank" size={9} color="#A6491D" /></span>
                                                            <span className="DB-stat-chip-text">
                                                                <span className="DB-stat-chip-label">Bank Holding</span>
                                                                <span className="DB-stat-chip-val" style={{ color: dbCashBank.netBank < 0 ? 'var(--err)' : 'var(--t1)' }}>
                                                                    {dbCashBank.netBank < 0 ? '-' : ''}{fmtFull(Math.abs(dbCashBank.netBank))}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {dbFilter.client_names.length > 0 && (
                                // All Debit Activity Start — always all 4 boxes now:
                                // Cash Book Expense, Total Unpaid Manpower, Total Unpaid
                                // Credit, and a 4th "Total Expenses" card that sums
                                // the three. No longer gated behind the Manpower/Credit
                                // toggles — those toggles are hidden entirely once a
                                // client is selected (see
                                // [[daybook_report_client_daybook_only_table]]).
                                <div className="T-client-summary">
                                    <div className="T-client-summary-cards">
                                        <div className="T-client-sum-card daybook" style={{ animationDelay: '0ms' }}>
                                            <div className="T-client-sum-icon"><StatIcon name="book" color="var(--info)" /></div>
                                            <span className="T-client-sum-lbl">Total Cash Book Expenses</span>
                                            <span className="T-client-sum-val">{fmtFull(clientDebitTotals.bySource['Cash Book'] || 0)}</span>
                                            {(clientDebitTotals.bySource['Cash Book'] || 0) > 0 && (
                                                <div className="DB-stat-breakdown" style={{ marginTop: 2 }}>
                                                    <div className="DB-stat-chip cash">
                                                        <span className="DB-stat-chip-icon"><StatIcon name="cash" size={9} color="#1E9C6A" /></span>
                                                        <span className="DB-stat-chip-text">
                                                            <span className="DB-stat-chip-label">Cash Holding</span>
                                                            <span className="DB-stat-chip-val">{fmtFull(clientCashBookCashBank.cash)}</span>
                                                        </span>
                                                    </div>
                                                    <div className="DB-stat-chip bank">
                                                        <span className="DB-stat-chip-icon"><StatIcon name="bank" size={9} color="#A6491D" /></span>
                                                        <span className="DB-stat-chip-text">
                                                            <span className="DB-stat-chip-label">Bank Holding</span>
                                                            <span className="DB-stat-chip-val">{fmtFull(clientCashBookCashBank.bank)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="T-client-sum-card labour" style={{ animationDelay: '90ms' }}>
                                            <div className="T-client-sum-icon"><StatIcon name="people" color="var(--purple)" /></div>
                                            <span className="T-client-sum-lbl">Outstanding Manpower Dues</span>
                                            <span className="T-client-sum-val">{fmtFull(clientLabourUnpaid)}</span>
                                        </div>
                                        <div className="T-client-sum-card credit" style={{ animationDelay: '180ms' }}>
                                            <div className="T-client-sum-icon"><StatIcon name="card" color="var(--warn)" /></div>
                                            <span className="T-client-sum-lbl">Credit Unpaid Amount</span>
                                            <span className="T-client-sum-val">{fmtFull(clientCreditUnpaid)}</span>
                                        </div>
                                        <div className="T-client-sum-card total" style={{ animationDelay: '270ms' }}>
                                            <div className="T-client-sum-icon"><StatIcon name="cash" color="var(--ember)" /></div>
                                            <span className="T-client-sum-lbl">Total Expenses</span>
                                            <span className="T-client-sum-val">{fmtFull((clientDebitTotals.bySource['Cash Book'] || 0) + clientLabourUnpaid + clientCreditUnpaid)}</span>
                                        </div>
                                    </div>
                                </div>
                                // All Debit Activity End
                            )}
                            {/* Date Range Start */}
                            <div className="T-date-bar">
                                {/* Span Start */}
                                <span className="T-date-bar-lbl">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                    Date Range
                                </span>
                                {/* Span End */}

                                <div className="T-date-range">
                                    <CalendarDD value={dbFromTouched ? fromDateDraft : ''} max={toDateDraft} placeholder="From Date"
                                        onChange={v => { setFromDateDraft(v); setDbFromTouched(true); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    <span className="T-date-sep" />
                                    <span className="T-date-arrow">→</span>
                                    <span className="T-date-sep" />
                                    <CalendarDD value={dbToTouched ? toDateDraft : ''} min={fromDateDraft} max={today()} placeholder="To Date"
                                        onChange={v => { setToDateDraft(v); setDbToTouched(true); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    {/* Single Filter/Reset pair below applies (or clears) the date range
                                        together with every other filter — no separate controls here. */}
                                </div>
                            </div>
                            {/* Date Range End */}

                            <div className="T-filterpanel">
                                {/* Refine Your View Start */}
                                <div className="T-filterpanel-hd">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                                    Refine Your View
                                    <span className="T-fchain-hint">Account Head → Account Sub-Head → Party Name → Associate Name → Client Name</span>
                                </div>
                                {/* Refine Your View End */}

                                {/* Table Field Start */}
                                <div className="T-ffield-grid">

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.59 13.41L12 22l-9-9V4h9l9 9.41a2 2 0 010 2.83z" /><circle cx="7.5" cy="7.5" r="1.4" /></svg>1. Account Head</span>
                                        <MultiSelectDD opts={dbExpenseCategoryOpts} values={dbFilterDraft.category_ids}
                                            onChange={v => { setDbFilterDraft(f => ({ ...f, category_ids: v, sub_category_ids: [], bio_data_ids: [], sub_name_ids: [] })); }}
                                            placeholder="Choose Account Head" accent="ember" />
                                    </div>

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4v8a4 4 0 004 4h10" /><path d="M14 12l4 4-4 4" /></svg>2. Account Sub-Head</span>
                                        <MultiSelectDD opts={dbSubCategoryOpts} values={dbFilterDraft.sub_category_ids}
                                            onChange={v => { setDbFilterDraft(f => ({ ...f, sub_category_ids: v, bio_data_ids: [], sub_name_ids: [] })); }}
                                            disabled={!dbFilterDraft.category_ids.length || dbSubCategoryOpts.length === 0}
                                            placeholder={!dbFilterDraft.category_ids.length ? 'Choose Account Head first' : dbSubCategoryOpts.length === 0 ? 'No account sub-heads for this account head' : 'Choose Account Sub-Head'} accent="ember" />
                                    </div>

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>3. Party Name</span>
                                        <MultiSelectDD opts={bioOpts} values={dbFilterDraft.bio_data_ids}
                                            onChange={v => { setDbFilterDraft(f => ({ ...f, bio_data_ids: v, sub_name_ids: [] })); }}
                                            disabled={!dbFilterDraft.category_ids.length || bioOpts.length === 0}
                                            placeholder={!dbFilterDraft.category_ids.length ? 'Choose Account Head first' : bioOpts.length === 0 ? 'No bio names for this selection' : 'Choose Party Name'} accent="ember" hideSelected />
                                    </div>

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 21c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" /></svg>4. Associate Name</span>
                                        <MultiSelectDD opts={subNameOpts} values={dbFilterDraft.sub_name_ids}
                                            onChange={v => { setDbFilterDraft(f => ({ ...f, sub_name_ids: v })); }}
                                            disabled={!dbFilterDraft.bio_data_ids.length || subNameOpts.length === 0}
                                            placeholder={!dbFilterDraft.bio_data_ids.length ? 'Choose Party Name first' : subNameOpts.length === 0 ? 'No associate names added' : 'Choose Associate Name'} accent="ember" hideSelected />
                                    </div>

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" /><path d="M2 10h20" /></svg>Mode</span>
                                        <MultiSelectDD opts={['Cash', 'UPI', 'NEFT', 'Cheque', 'Bank Transfer', 'Others'].map(m => ({ value: m, label: m }))} values={dbFilterDraft.payment_modes}
                                            onChange={v => { setDbFilterDraft(f => ({ ...f, payment_modes: v })); }}
                                            placeholder="All Modes" accent="ember" />
                                    </div>

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>Search</span>
                                        <div className="T-fsearch" style={{ maxWidth: 'none', width: '100%', borderRadius: 10 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                                            <input autoComplete="off" placeholder="Search narration or party…" value={dbFilterDraft.search} onChange={e => { setDbFilterDraft(f => ({ ...f, search: e.target.value })); }}
                                                onKeyDown={e => { if (e.key === 'Enter') commitDbFilters(); }} />
                                        </div>
                                    </div>

                                    {/* Manpower Start — "Include Other Sources" checkboxes removed
                                        entirely 2026-08-24 (both the Client-selected AND no-client
                                        views). dbIncludeLabour/dbIncludeCredit stay in the code as
                                        state (always false now, since nothing can set them true
                                        anymore) purely so the toggle-branch logic elsewhere doesn't
                                        need to be ripped out too — it's just permanently unreachable.
                                        See [[daybook_report_source_toggle_and_paid_amount_fix]]. */}
                                    {/* Manpower End */}

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M14.5 14.3c2.5.4 4.5 2.3 4.5 5.7" /></svg>5. Client Name</span>
                                        <MultiSelectDD opts={dbClientNameOpts} values={dbFilterDraft.client_names}
                                            onChange={v => { setDbFilterDraft(f => ({ ...f, client_names: v })); }}
                                            placeholder={dbClientNameOpts.length === 0 ? 'No client names yet' : 'Choose Client Name'} accent="ember" hideSelected />
                                    </div>

                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>Per Page</span>
                                        <SearchDD opts={[10, 25, 50, 100].map(n => ({ value: String(n), label: `${n} rows` }))}
                                            value={String(dbPerPage)}
                                            onChange={v => {
                                                /* SearchDD is a generic reusable dropdown that always
                                                   offers an "x" clear button + "Clear selection" row,
                                                   which fires onChange(''). That's correct for filter
                                                   fields where "no selection" is meaningful, but Per
                                                   Page must always be a positive number — +'' silently
                                                   coerces to 0, which made totalDbPages become Infinity
                                                   (Math.ceil(n / 0)) and the row slice empty
                                                   (arr.slice(0,0)), i.e. exactly the "records exist in
                                                   the stats but the table says No Transactions Found,
                                                   Page 1 of Infinity" bug. Guard against that by simply
                                                   ignoring a clear/invalid value and keeping the
                                                   current page size instead of ever accepting <=0. */
                                                const n = +v;
                                                if (n > 0) { setDbPerPage(n); setDbPage(1); }
                                            }}
                                            placeholder="25 rows" accent="ember" />
                                    </div>

                                    <div className="T-ffield T-actions-col">
                                        <span className="T-ffield-lbl">&nbsp;</span>
                                        <div className="T-actions-row">
                                            <button type="button" className={`T-stack-btn T-stack-search${dbSearchPulse ? ' pulsed' : ''}`}
                                                onClick={commitDbFilters} title="Apply filters" aria-label="Apply filters">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" /></svg>
                                                <span>Filter</span>
                                            </button>
                                            <button type="button" className="T-stack-btn T-stack-reset" disabled={!dbAnyDraftActive}
                                                onClick={resetDbFilters} title="Reset all filters" aria-label="Reset all filters">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.343-5.657" /><path d="M20 4v5h-5" /></svg>
                                                <span>Reset</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                {/* Table Field Grid End */}
                            </div>

                            <div className="T-tbl-wrap">
                                {dbLoading ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>{[1, 2, 3, 4, 5].map(i => <SK key={i} h={44} />)}</div> : !dbAnyFilterActive && !dbDateApplied ? (
                                    <div className="T-choose-empty">
                                        <div className="T-choose-empty-orbit">
                                            <div className="T-choose-ring r1" />
                                            <div className="T-choose-ring r2" />
                                            <div className="T-choose-empty-icon">
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="19" cy="17" r="3.2" /><path d="M21.2 19.2L23 21" /></svg>
                                            </div>
                                        </div>
                                        <div className="T-choose-empty-title">Choose a filter to view data</div>
                                        <div className="T-choose-empty-sub">Start with an Account Head, then drill down through Account Sub-Head → Party Name → Associate Name — or jump straight to a Client Name or Mode. Every field supports picking multiple values at once. The Cash Book Report stays empty until then.</div>
                                        <div className="T-choose-empty-chips">
                                            <span className="T-choose-chip">Account Head</span>
                                            <span className="T-choose-chip">Account Sub-Head</span>
                                            <span className="T-choose-chip">Party Name</span>
                                            <span className="T-choose-chip">Associate Name</span>
                                            <span className="T-choose-chip">Client Name</span>
                                            <span className="T-choose-chip">Mode</span>
                                        </div>
                                    </div>
                                ) : dbFilter.client_names.length > 0 ? (
                                    clientDebitRows.length === 0 ? (
                                        <div className="T-choose-empty">
                                            <div className="T-choose-empty-icon">📭</div>
                                            <div className="T-choose-empty-title">No debit records found</div>
                                            <div className="T-choose-empty-sub">No matching Cash Book, Wage Disbursement, or Accounts Payable entries for &ldquo;{dbFilter.client_names.join(', ')}&rdquo;.</div>
                                        </div>
                                    ) : (
                                        // Table Start — uses the same "professional" table language
                                        // (T-tbl-pro / T-tbl-client / T-tbl-amt) as the default Cash Book
                                        // table below, instead of its own ad hoc inline colors, so the
                                        // font/weight/color treatment matches whichever table is showing.
                                        <table className="T-tbl T-tbl-pro">
                                            <thead><tr><th>S.No</th><th style={{ width: 68 }}>Date</th><th style={{ width: 100 }}>Client</th><th style={{ width: 100 }}>Account Head</th><th style={{ width: 92 }}>Source</th><th style={{ width: 100 }}>Party Name</th><th style={{ width: 100 }}>Associate Name</th><th style={{ width: 64 }}>Mode</th><th>Narration</th><th>Income</th><th>Expense</th></tr></thead>
                                            <tbody>
                                                {clientDebitRows.map((r, i) => (
                                                    <tr key={i} style={{ animationDelay: `${i * 12}ms` }}>
                                                        <td style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t4)', fontWeight: 800 }}>{i + 1}</td>
                                                        <td style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--t2)' }}>{fmtDate(r.date)}</td>
                                                        <td><span className="T-tbl-client">{r.client}</span></td>
                                                        <td>{r.category || <span className="T-tbl-null">—</span>}</td>
                                                        <td><span className={`T-src-badge src-${r.source.replace(/\s+/g, '-').toLowerCase()}`}>{r.source}</span></td>
                                                        <td>{r.bio_name ? <span style={{ fontWeight: 800, color: 'var(--t1)' }}>{r.bio_name}</span> : <span className="T-tbl-null">—</span>}</td>
                                                        <td>{r.sub_name ? <span className="T-tbl-subname">{r.sub_name}</span> : <span className="T-tbl-null">—</span>}</td>
                                                        <td><ModeIcon mode={r.mode} /></td>
                                                        <td style={{ minWidth: 220, maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--t3)', fontSize: 9.5, lineHeight: 1.5 }}>{r.narration || r.sub || '—'}</td>
                                                        <td><span className="T-tbl-null">—</span></td>
                                                        <td><span className="T-tbl-amt neutral">{fmtFull(r.amount)}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot><tr className="T-tbl-total-row">
                                                <td colSpan={9}>
                                                    <span className="T-tbl-total-label">Total</span>
                                                    {/* Client names are already named in the header above ("All debit
                                                        activity for X") — repeating the full list here again was just
                                                        noise. This now matches the record-count + date-range shape
                                                        already used by the "Synced …" line below the table. */}
                                                    <span className="T-tbl-total-meta">{clientDebitRows.length} record{clientDebitRows.length === 1 ? '' : 's'} · {fmtDate(fromDate)} → {fmtDate(toDate)}</span>
                                                </td>
                                                <td></td>
                                                <td><span className="T-tbl-total-amt expense">{fmtFull(clientDebitTotals.grand)}</span></td>
                                            </tr></tfoot>
                                        </table>
                                        // Table End
                                    )
                                ) : (
                                    <table className="T-tbl T-tbl-pro">

                                        <thead><tr>{db('sno') && <th>S.No</th>}{db('date') && <th style={{ width: 68 }}>Date</th>}{db('client') && <th style={{ width: 100 }}>Client</th>}{db('category') && <th style={{ width: 100 }}>Account Head</th>}{db('sub_category') && <th style={{ width: 100 }}>Account Sub-Head</th>}{db('bio_name') && <th style={{ width: 100 }}>Party Name</th>}{db('sub_name') && <th style={{ width: 100 }}>Associate Name</th>}{db('mode') && <th style={{ width: 64 }}>Mode</th>}{db('narration') && <th>Narration</th>}{db('amount') && <th style={{ textAlign: 'center' }}>Credit (CR)</th>}{db('amount') && <th style={{ textAlign: 'center' }}>Debit (DR)</th>}</tr></thead>
                                        <tbody>
                                            {paginatedDbEntries.length === 0 ? (
                                                <tr><td colSpan={dbColSpan}>
                                                    <div className="T-empty">
                                                        <div className="T-empty-icon">📭</div>
                                                        <div className="T-empty-title">No Transactions Found</div>
                                                        <div className="T-empty-sub">{dbAllEntries.length === 0 ? 'No transactions in this date range' : dbFilter.bio_data_ids.length ? `No transactions for "${selectedBioNames.join(', ')}"` : 'Adjust filters'}</div>
                                                        {(dbFilter.bio_data_ids.length > 0 || dbFilter.sub_name_ids.length > 0) && <button className="T-btn danger sm" style={{ marginTop: 10 }} onClick={() => { setDbFilter(f => ({ ...f, bio_data_ids: [], sub_name_ids: [] })); setDbFilterDraft(f => ({ ...f, bio_data_ids: [], sub_name_ids: [] })); }}>✕ Clear Bio filter</button>}
                                                    </div>
                                                </td></tr>
                                            ) : paginatedDbEntries.map((e, i) => {
                                                const isIncome = e.category_type === 'income';
                                                return (
                                                    <tr key={i} style={{ animationDelay: `${i * 12}ms` }}>
                                                        {db('sno') && <td style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t4)', fontWeight: 800 }}>{(dbPage - 1) * safeDbPerPage + i + 1}</td>}
                                                        {db('date') && <td style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--t2)' }}>{fmtDate(e.transaction_date)}</td>}
                                                        {db('client') && <td>{e.client_name ? <span className="T-tbl-client">{e.client_name}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                        {db('category') && <td>{e.category_name || '—'}{e.source && <span className={`T-src-badge src-${e.source === 'labour' ? 'labour-payment' : 'credit-management'}`} style={{ marginLeft: 6 }}>{e.source === 'labour' ? 'Wage Disbursement' : 'Credit'}</span>}</td>}
                                                        {db('sub_category') && <td>{e.sub_category_name || <span className="T-tbl-null">—</span>}</td>}
                                                        {db('bio_name') && <td><span style={{ fontWeight: 800, color: dbFilter.bio_data_ids.includes(normId(e.bio_data_id)) ? 'var(--ember)' : 'var(--t1)' }}>{e.bio_data_name || '—'}</span></td>}
                                                        {db('sub_name') && <td>{e.sub_name_name ? <span className="T-tbl-subname">{e.sub_name_name}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                        {db('mode') && <td><ModeIcon mode={e.payment_mode || ''} /></td>}
                                                        {db('narration') && <td style={{ minWidth: 220, maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--t3)', fontSize: 9.5, lineHeight: 1.5 }}>{e.narration || '—'}</td>}
                                                        {db('amount') && <td style={{ textAlign: 'center' }}>{isIncome ? <span className="T-tbl-amt cr">₹{Number(e.amount ?? 0).toLocaleString('en-IN')}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                        {db('amount') && <td style={{ textAlign: 'center' }}>{!isIncome ? <span className="T-tbl-amt dr">₹{Number(e.amount ?? 0).toLocaleString('en-IN')}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        {db('amount') && paginatedDbEntries.length > 0 && (
                                            <tfoot><tr className="T-tbl-total-row">
                                                <td colSpan={Math.max(1, dbColSpan - 2)}>
                                                    <span className="T-tbl-total-label">Total</span>
                                                    <span className="T-tbl-total-meta">{dbEntries.length} record{dbEntries.length === 1 ? '' : 's'} · {fmtDate(fromDate)} → {fmtDate(toDate)}</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}><span className="T-tbl-total-amt income">{fmtFull(dbStats?.income || 0)}</span></td>
                                                <td style={{ textAlign: 'center' }}><span className="T-tbl-total-amt expense">{fmtFull(dbStats?.expense || 0)}</span></td>
                                            </tr></tfoot>
                                        )}
                                    </table>
                                )}
                            </div>

                            {dbAnyFilterActive && dbFilter.client_names.length === 0 && dbEntries.length > 0 && (
                                <div className="T-sumbar">
                                    <div className="T-sumbar-block">
                                        <div className="T-sumbar-block-hdr">
                                            <span>This Page</span>
                                            <span className="T-sumbar-block-count">{paginatedDbEntries.length} of {dbEntries.length}</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill cr">CR {fmtFull(dbPageStats.income)}</span>
                                            <span className="T-sumbar-pill dr">DR {fmtFull(dbPageStats.expense)}</span>
                                        </div>
                                    </div>
                                    <div className="T-sumbar-divider" />
                                    <div className="T-sumbar-block right">
                                        <div className="T-sumbar-block-hdr">
                                            <span>Selected</span>
                                            <span className="T-sumbar-block-count">{dbEntries.length} records</span>
                                            {selectedBioNames.length > 0 && <span className="T-sumbar-block-count">Bio: {selectedBioNames.join(', ')}</span>}
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill cr">CR {fmtFull(dbStats?.income || 0)}</span>
                                            <span className="T-sumbar-pill dr">DR {fmtFull(dbStats?.expense || 0)}</span>
                                            <div className={`T-sumbar-net${(dbStats?.balance ?? 0) >= 0 ? ' cr' : ' dr'}`}>
                                                <span className="T-sumbar-net-lbl">Net</span>
                                                <span className="T-sumbar-net-val">{fmtFull(Math.abs(dbStats?.balance ?? 0))} {(dbStats?.balance ?? 0) >= 0 ? 'CR' : 'DR'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {dbAnyFilterActive && dbFilter.client_names.length === 0 && dbEntries.length > 0 && (
                                <div className="T-pg">
                                    <span className="T-pg-info">
                                        Showing <strong>{(dbPage - 1) * safeDbPerPage + 1}–{Math.min(dbPage * safeDbPerPage, dbEntries.length)}</strong> of <strong>{dbEntries.length}</strong> records &middot; Page {dbPage} of {totalDbPages}
                                    </span>
                                    <div className="T-pg-btns">
                                        {/* Nav arrows are only meaningful once there's more than
                                            one page — with a single page they were all disabled
                                            at once (opacity .32), which just read as a broken,
                                            washed-out control cluster around a single "1". */}
                                        {totalDbPages > 1 && <>
                                            <button className="T-pg-btn" title="First page" disabled={dbPage === 1} onClick={() => setDbPage(1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 17 13 12 18 7" /><polyline points="11 17 6 12 11 7" /></svg></button>
                                            <button className="T-pg-btn" title="Previous page" disabled={dbPage === 1} onClick={() => setDbPage(p => p - 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                                        </>}
                                        {(() => {
                                            /* Windowed page-number buttons (up to 5). The previous
                                               formula (`pg = page-2+i`, clamped by re-deriving `pg =
                                               i+1` or `pg = total-4+i` when out of range) could
                                               produce the *same* page number twice within one array
                                               when totalPages was small (<=5) — e.g. totalPages=2,
                                               page=1 yielded [1,2,1,2,2], hence React's "two children
                                               with the same key `1`/`2`" warning on every report tab.
                                               Deriving a single window start (clamped to stay in
                                               range) and stepping +1 guarantees distinct, sequential
                                               page numbers every time. */
                                            const winLen = Math.min(5, totalDbPages);
                                            const start = Math.max(1, Math.min(dbPage - Math.floor(winLen / 2), totalDbPages - winLen + 1));
                                            return Array.from({ length: winLen }, (_, i) => start + i).map(pg => (
                                                <button key={pg} className={`T-pg-btn${dbPage === pg ? ' on' : ''}`} onClick={() => setDbPage(pg)}>{pg}</button>
                                            ));
                                        })()}
                                        {totalDbPages > 1 && <>
                                            <button className="T-pg-btn" title="Next page" disabled={dbPage === totalDbPages} onClick={() => setDbPage(p => p + 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                                            <button className="T-pg-btn" title="Last page" disabled={dbPage === totalDbPages} onClick={() => setDbPage(totalDbPages)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 17 11 12 6 7" /><polyline points="13 17 18 12 13 7" /></svg></button>
                                        </>}
                                    </div>
                                </div>
                            )}
                            <div className="T-sync"><span className="T-sync-dot" />{dbAnyFilterActive ? <>Synced · {fromDate} → {toDate} · {dbFilter.client_names.length > 0 ? `${clientDebitRows.length} debit records` : `${dbEntries.length} total${selectedBioNames.length ? ` · Filtered: ${selectedBioNames.join(', ')}` : ''}`}</> : <>Waiting for a filter selection…</>}</div>
                        </div>
                    </div>
                )}{/* === MODULE 1: DAYBOOK END === */}

                {/* === MODULE 2: CREDIT START === */}
                {(section === 'all' || section === 'credit') && (
                    <div className="T-section" style={{ paddingTop: 28 }}>
                        <div className="T-card">

                            <div className="T-card-head">
                                <div className="T-card-head-left"><div className="T-card-icon T-card-icon-cr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /><path d="M6 15h4" /></svg></div><span className="T-card-title">Accounts Payable</span><span className="T-card-badge T-card-badge-cr">MODULE 2</span></div>
                                <div className="T-card-head-right">{crHasSelection && creditPartyRows.length > 0 && <ColumnSelector columns={CR_COLUMNS} visible={crVisibleCols} onChange={setCrVisibleCols} premium />}<PdfBtn label="Credit" onClick={crHasSelection ? exportCreditPartyPDF : exportCreditPDF} loading={crPdfLoading} disabled={!crHasSelection || creditPartyRows.length === 0} /></div>
                            </div>

                            {crHasSelection && (
                                <div className="T-mode-stats T-mode-stats-cr">
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),var(--ember-mid))' }} />
                                        <div className="ERP-stat-label">Total Credit</div>
                                        <div className="ERP-stat-val">{fmtFull(creditPartyTotals.credit)}</div>
                                    </div>

                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),var(--ember-mid))' }} />
                                        <div className="ERP-stat-label">Total Paid</div>
                                        <div className="ERP-stat-val">{fmtFull(creditPartyTotals.paid)}</div>
                                    </div>

                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--ember),var(--ember-mid))' }} />
                                        <div className="ERP-stat-label">Outstanding Balance</div>
                                        <div className="ERP-stat-val">{fmtFull(Math.abs(creditPartyTotals.balance))}</div>
                                    </div>

                                </div>
                            )}

                            {/* Date Range Start */}
                            <div className="T-date-bar">
                                <span className="T-date-bar-lbl">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                    Date Range
                                </span>
                                {/* Date field Start */}
                                <div className="T-date-range">
                                    <CalendarDD value={crDateFromTouched ? crDateFromDraft : ''} max={crDateToDraft || undefined} placeholder="From Date"
                                        onChange={v => { setCrDateFromDraft(v); setCrDateFromTouched(true); if (v) toast.info('Date Filter', `From ${fmtDate(v)}`); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    <span className="T-date-sep" />
                                    <span className="T-date-arrow">→</span>
                                    <span className="T-date-sep" />
                                    <CalendarDD value={crDateToTouched ? crDateToDraft : ''} min={crDateFromDraft || undefined} placeholder="To Date"
                                        onChange={v => { setCrDateToDraft(v); setCrDateToTouched(true); if (v) toast.info('Date Filter', `To ${fmtDate(v)}`); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    {/* Single Filter/Reset pair below applies (or clears) the date range
                                        together with every other filter — no separate controls here. */}
                                </div>
                                {/* Date End */}
                            </div>
                            {/* Date Range End */}

                            <div className="T-filterpanel">

                                {/* Clear All Start */}
                                <div className="T-filterpanel-hd">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                                    Refine Your View
                                    <span className="T-fchain-hint">Account Head → Account Sub-Head → Biller Name → Client Name → Mode</span>
                                </div>
                                {/* Clear All End */}

                                <div className="T-ffield-grid">
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.59 13.41L12 22l-9-9V4h9l9 9.41a2 2 0 010 2.83z" /><circle cx="7.5" cy="7.5" r="1.4" /></svg>1. Account Head</span>
                                        <MultiSelectDD opts={crCategoryIdOpts} values={crCategoryIdFiltersDraft} onChange={v => { setCrCategoryIdFiltersDraft(v); setCrSubCategoryIdFiltersDraft([]); setCrNameFiltersDraft([]); setCrClientNameFiltersDraft([]); }} placeholder="Choose Account Head" accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4v8a4 4 0 004 4h10" /><path d="M14 12l4 4-4 4" /></svg>2. Account Sub-Head</span>
                                        <MultiSelectDD opts={crSubCategoryIdOpts} values={crSubCategoryIdFiltersDraft}
                                            onChange={v => { setCrSubCategoryIdFiltersDraft(v); setCrNameFiltersDraft([]); setCrClientNameFiltersDraft([]); }}
                                            disabled={!crCategoryIdFiltersDraft.length}
                                            placeholder={!crCategoryIdFiltersDraft.length ? 'Choose Account Head first' : crSubCategoryIdOpts.length === 0 ? 'No account sub-heads' : 'Choose Account Sub-Head'} accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>3. Biller Name</span>
                                        <MultiSelectDD opts={crVendorNameOpts} values={crNameFiltersDraft}
                                            onChange={v => { setCrNameFiltersDraft(v); setCrClientNameFiltersDraft([]); }}
                                            disabled={!crCategoryIdFiltersDraft.length}
                                            placeholder={!crCategoryIdFiltersDraft.length ? 'Choose Account Head first' : crVendorNameOpts.length === 0 ? 'No billers' : 'Choose Biller Name'} accent="ember" hideSelected />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M14.5 14.3c2.5.4 4.5 2.3 4.5 5.7" /></svg>4. Client Name</span>
                                        <MultiSelectDD opts={crClientNameOpts} values={crClientNameFiltersDraft} onChange={v => setCrClientNameFiltersDraft(v)}
                                            disabled={!crCategoryIdFiltersDraft.length}
                                            placeholder={!crCategoryIdFiltersDraft.length ? 'Choose Account Head first' : crClientNameOpts.length === 0 ? 'No client names yet' : 'Choose Client Name'} accent="ember" hideSelected />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" /><path d="M2 10h20" /></svg>Mode</span>
                                        <MultiSelectDD opts={['Cash', 'UPI', 'NEFT', 'Cheque', 'Bank Transfer', 'Others'].map(m => ({ value: m, label: m }))} values={crPaymentModeFiltersDraft} onChange={v => setCrPaymentModeFiltersDraft(v)} placeholder="All Modes" accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4v8a4 4 0 004 4h10" /><path d="M14 12l4 4-4 4" /></svg>Status</span>
                                        <MultiSelectDD opts={[{ value: "active", label: "Active Only" }, { value: "inactive", label: "Inactive" }, { value: "balance", label: "Has Balance" }, { value: "overdue", label: "Overdue" }, { value: "partial", label: "Partial" }, { value: "clear", label: "Clear" }]} values={crStatusFiltersDraft} onChange={v => setCrStatusFiltersDraft(v)} placeholder="All Statuses" accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>Per Page</span>
                                        <SearchDD opts={[10, 25, 50, 100].map(n => ({ value: String(n), label: `${n} rows` }))}
                                            value={String(crPerPage)}
                                            onChange={v => { const n = +v; if (n > 0) { setCrPerPage(n); setCrPage(1); } }}
                                            placeholder="25 rows" accent="ember" />
                                    </div>
                                    <div className="T-ffield T-actions-col">
                                        <span className="T-ffield-lbl">&nbsp;</span>
                                        <div className="T-actions-row">
                                            <button type="button" className={`T-stack-btn T-stack-search${crSearchPulse ? ' pulsed' : ''}`}
                                                onClick={commitCrFilters} title="Apply filters" aria-label="Apply filters">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" /></svg>
                                                <span>Filter</span>
                                            </button>
                                            <button type="button" className="T-stack-btn T-stack-reset" disabled={!crAnyDraftActive}
                                                onClick={resetCrFilters} title="Reset all filters" aria-label="Reset all filters">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.343-5.657" /><path d="M20 4v5h-5" /></svg>
                                                <span>Reset</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {crHasSelection ? (
                                <div className="T-tbl-wrap">
                                    {crLoading ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>{[1, 2, 3].map(i => <SK key={i} h={44} />)}</div>
                                        : creditPartyRows.length === 0 ? (
                                            <div className="T-choose-empty">
                                                <div className="T-choose-empty-icon">📭</div>
                                                <div className="T-choose-empty-title">No credit records found</div>
                                                <div className="T-choose-empty-sub">No bills or repayments for {crSelectionLabel}.</div>
                                            </div>
                                        ) : (
                                            <table className="T-tbl T-tbl-pro">
                                                <thead><tr>
                                                    {crCol('sno') && <th>S.No</th>}
                                                    {crCol('date') && <th style={{ width: 80 }}>Last Activity</th>}
                                                    {crCol('client') && <th style={{ width: 108 }}>Client</th>}
                                                    {crCol('category') && <th style={{ width: 108 }}>Account Head</th>}
                                                    {crCol('party') && <th style={{ width: 108 }}>Party</th>}
                                                    {crCol('notes') && <th>Bill</th>}
                                                    {crCol('credit') && <th style={{ textAlign: 'center', width: 100 }}>Credit</th>}
                                                    {crCol('paid') && <th style={{ textAlign: 'center', width: 100 }}>Paid</th>}
                                                    {crCol('balance') && <th style={{ textAlign: 'center', width: 100 }}>Balance</th>}
                                                </tr></thead>
                                                <tbody>
                                                    {paginatedCreditPartyRows.map((r, i) => (
                                                        <tr key={r.id} style={{ animationDelay: `${i * 12}ms` }}>
                                                            {crCol('sno') && <td style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t4)', fontWeight: 800 }}>{(crPage - 1) * safeCrPerPage + i + 1}</td>}
                                                            {crCol('date') && <td style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--t2)' }}>{fmtDate(r.date)}</td>}
                                                            {crCol('client') && <td>{r.clientName ? <span className="T-tbl-client">{r.clientName}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {crCol('category') && <td>{r.category || <span className="T-tbl-null">—</span>}</td>}
                                                            {crCol('party') && <td><span style={{ fontWeight: 800 }}>{r.party}</span></td>}
                                                            {crCol('notes') && <td style={{ minWidth: 200, maxWidth: 340 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                                    <span style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--t3)', fontSize: 9.5, lineHeight: 1.5 }}>{r.notes || '—'}</span>
                                                                    <span className={`T-status-pill ${r.status === 'paid' ? 'settled' : r.status === 'partial' ? 'partial' : r.isOverdue ? 'overdue' : 'due'}`}>
                                                                        {r.status === 'paid' ? 'Paid' : r.status === 'partial' ? 'Partial' : r.isOverdue ? 'Overdue' : 'Due'}
                                                                    </span>
                                                                </div>
                                                            </td>}
                                                            {crCol('credit') && <td style={{ textAlign: 'center' }}>{r.kind === 'bill' ? <span className="T-tbl-amt dr">{fmtFull(r.credit)}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {crCol('paid') && <td style={{ textAlign: 'center' }}>{(r.paid || 0) > 0 ? <span className="T-tbl-amt cr">{fmtFull(r.paid)}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {crCol('balance') && <td style={{ textAlign: 'center' }}>
                                                                {r.balance !== undefined ? (
                                                                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                                                        <span className={`T-tbl-amt ${(r.balance || 0) > 0 ? 'dr' : 'cr'}`}>{fmtFull(r.balance)}</span>
                                                                        <span className={`T-status-pill ${(r.balance || 0) > 0 ? 'due' : 'settled'}`}>{(r.balance || 0) > 0 ? 'Due' : 'Settled'}</span>
                                                                    </div>
                                                                ) : <span className="T-tbl-null">—</span>}
                                                            </td>}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                </div>
                            ) : null}

                            {crHasSelection && creditPartyRows.length > 0 && (
                                <div className="T-sumbar">
                                    <div className="T-sumbar-block">
                                        <div className="T-sumbar-block-hdr">
                                            <span>This Page</span>
                                            <span className="T-sumbar-block-count">{paginatedCreditPartyRows.length} of {creditPartyRows.length}</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill dr">Credit {fmtFull(creditPartyPageTotals.credit)}</span>
                                            <span className="T-sumbar-pill cr">Paid {fmtFull(creditPartyPageTotals.paid)}</span>
                                        </div>
                                    </div>
                                    <div className="T-sumbar-divider" />
                                    <div className="T-sumbar-block right">
                                        <div className="T-sumbar-block-hdr">
                                            <span>Selected — {crSelectionLabel}</span>
                                            <span className="T-sumbar-block-count">{creditPartyRows.length} records</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill dr">Credit {fmtFull(creditPartyTotals.credit)}</span>
                                            <span className="T-sumbar-pill cr">Paid {fmtFull(creditPartyTotals.paid)}</span>
                                            <div className={`T-sumbar-net${(creditPartyTotals.balance ?? 0) > 0 ? ' dr' : ' cr'}`}>
                                                <span className="T-sumbar-net-lbl">Balance Due</span>
                                                <span className="T-sumbar-net-val">{fmtFull(Math.abs(creditPartyTotals.balance ?? 0))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {crHasSelection && creditPartyRows.length > 0 && totalCrPages > 1 && (
                                <div className="T-pg">
                                    <span className="T-pg-info">
                                        Showing <strong>{(crPage - 1) * safeCrPerPage + 1}–{Math.min(crPage * safeCrPerPage, creditPartyRows.length)}</strong> of <strong>{creditPartyRows.length}</strong> records &middot; Page {crPage} of {totalCrPages}
                                    </span>
                                    <div className="T-pg-btns">
                                        {totalCrPages > 1 && <>
                                            <button className="T-pg-btn" title="First page" disabled={crPage === 1} onClick={() => setCrPage(1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 17 13 12 18 7" /><polyline points="11 17 6 12 11 7" /></svg></button>
                                            <button className="T-pg-btn" title="Previous page" disabled={crPage === 1} onClick={() => setCrPage(p => p - 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                                        </>}
                                        {(() => {
                                            const winLen = Math.min(5, totalCrPages);
                                            const start = Math.max(1, Math.min(crPage - Math.floor(winLen / 2), totalCrPages - winLen + 1));
                                            return Array.from({ length: winLen }, (_, i) => start + i).map(pg => (
                                                <button key={pg} className={`T-pg-btn${crPage === pg ? ' on' : ''}`} onClick={() => setCrPage(pg)}>{pg}</button>
                                            ));
                                        })()}
                                        {totalCrPages > 1 && <>
                                            <button className="T-pg-btn" title="Next page" disabled={crPage === totalCrPages} onClick={() => setCrPage(p => p + 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                                            <button className="T-pg-btn" title="Last page" disabled={crPage === totalCrPages} onClick={() => setCrPage(totalCrPages)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 17 11 12 6 7" /><polyline points="13 17 18 12 13 7" /></svg></button>
                                        </>}
                                    </div>
                                </div>
                            )}

                            {!crHasSelection && (
                                <div className="T-tbl-wrap">
                                    <div className="T-choose-empty">
                                        <div className="T-choose-empty-orbit">
                                            <div className="T-choose-ring r1" />
                                            <div className="T-choose-ring r2" />
                                            <div className="T-choose-empty-icon">
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
                                            </div>
                                        </div>
                                        <div className="T-choose-empty-title">Choose a filter to view credit data</div>
                                        <div className="T-choose-empty-sub">Pick a Biller Name, Client Name, Account Head, Payment Mode, Status, or a date range above — the Accounts Payable Report stays empty until then.</div>
                                        <div className="T-choose-empty-chips">
                                            <span className="T-choose-chip">Biller Name</span>
                                            <span className="T-choose-chip">Client Name</span>
                                            <span className="T-choose-chip">Account Head</span>
                                            <span className="T-choose-chip">Payment Mode</span>
                                            <span className="T-choose-chip">Status</span>
                                            <span className="T-choose-chip">Date Range</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {crHasSelection && <div className="T-sync"><span className="T-sync-dot" />Synced · {creditPartyRows.length} record{creditPartyRows.length === 1 ? '' : 's'} · {crNameFilters.length > 0 ? 'Party' : 'Client'}: {crSelectionLabel}</div>}
                        </div>
                    </div>
                )}{/* === MODULE 2: CREDIT END === */}

                {/* === MODULE 3: CLIENT PORTAL START === */}
                {(section === 'all' || section === 'client') && (
                    <div className="T-section" style={{ paddingTop: 28 }}>
                        <div className="T-card">

                            <div className="T-card-head">
                                <div className="T-card-head-left"><div className="T-card-icon T-card-icon-cp"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="8.5" cy="8" r="3" /><path d="M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="16.5" cy="9" r="2.4" /><path d="M14.8 14.1c2.9.4 4.7 2.8 4.7 5.9" /></svg></div><span className="T-card-title">Accounts Receivable</span><span className="T-card-badge T-card-badge-cp">MODULE 3</span></div>
                                <div className="T-card-head-right">
                                    {!cpAllLoaded && cpLoading && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ember)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 11, height: 11, border: '2px solid var(--ember-border)', borderTopColor: 'var(--ember)', borderRadius: '50%', display: 'inline-block', animation: 'T-spin .65s linear infinite' }} />{cpLoadingStatus || 'Loading…'}</span>}
                                    <ColumnSelector columns={CP_COLUMNS} visible={cpVisibleCols} onChange={setCpVisibleCols} />
                                    <PdfBtn label="Client" onClick={exportClientPortalPDF} loading={cpPdfLoading} disabled={!cpHasSelection || cpPartyRows.length === 0} />
                                </div>
                            </div>

                            {cpHasSelection && (
                                <div className="T-mode-stats">
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--warn),#F0834D)' }} />
                                        <div className="ERP-stat-label">Total Budget</div>
                                        <div className="ERP-stat-val" style={{ color: 'var(--warn)', fontSize: 16, fontWeight: 800 }}>{fmtFull(filteredCpStats?.budget || 0)}</div>
                                    </div>
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--success),#34D399)' }} />
                                        <div className="ERP-stat-label">Total Collected</div>
                                        <div className="ERP-stat-val" style={{ color: 'var(--success)', fontSize: 16, fontWeight: 800 }}>{fmtFull(cpPartyTotals.paid)}</div>
                                    </div>
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: (filteredCpStats?.balance || 0) > 0 ? 'linear-gradient(90deg,var(--err),#F87171)' : 'linear-gradient(90deg,var(--success),#34D399)' }} />
                                        <div className="ERP-stat-label">Outstanding Balance</div>
                                        <div className="ERP-stat-val" style={{ color: (filteredCpStats?.balance || 0) > 0 ? 'var(--err)' : 'var(--success)', fontSize: 16, fontWeight: 800 }}>{fmtFull(Math.abs(filteredCpStats?.balance || 0))}</div>
                                    </div>
                                </div>
                            )}

                            <div className="T-date-bar">
                                <span className="T-date-bar-lbl">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                    Date Range
                                </span>
                                <div className="T-date-range">
                                    <CalendarDD value={cpDateFromTouched ? cpDateFromDraft : ''} max={cpDateToDraft || undefined} placeholder="From Date"
                                        onChange={v => { setCpDateFromDraft(v); setCpDateFromTouched(true); if (v) toast.info('Date Filter', `From ${fmtDate(v)}`); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    <span className="T-date-sep" />
                                    <span className="T-date-arrow">→</span>
                                    <span className="T-date-sep" />
                                    <CalendarDD value={cpDateToTouched ? cpDateToDraft : ''} min={cpDateFromDraft || undefined} placeholder="To Date"
                                        onChange={v => { setCpDateToDraft(v); setCpDateToTouched(true); if (v) toast.info('Date Filter', `To ${fmtDate(v)}`); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    {/* Single Filter/Reset pair below applies (or clears) the date range
                                        together with every other filter — no separate controls here. */}
                                </div>
                            </div>

                            <div className="T-filterpanel">
                                <div className="T-filterpanel-hd">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ animation: 'none' }}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                                    Refine Your View
                                    <span className="T-fchain-hint">Type → Status → Client Name → Mode</span>
                                </div>
                                <div className="T-ffield-grid">
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.59 13.41L12 22l-9-9V4h9l9 9.41a2 2 0 010 2.83z" /><circle cx="7.5" cy="7.5" r="1.4" /></svg>1. Project Type</span>
                                        <MultiSelectDD opts={cpTypeOpts} values={cpTypeFiltersDraft} onChange={v => { setCpTypeFiltersDraft(v); setCpStatusFiltersDraft([]); setCpClientNameFiltersDraft([]); }} placeholder="All Types" accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 4v8a4 4 0 004 4h10" /><path d="M14 12l4 4-4 4" /></svg>2. Status</span>
                                        <MultiSelectDD opts={cpStatusOpts} values={cpStatusFiltersDraft}
                                            onChange={v => { setCpStatusFiltersDraft(v); setCpClientNameFiltersDraft([]); }}
                                            placeholder={cpStatusOpts.length === 0 ? 'No statuses' : 'All Statuses'} accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M14.5 14.3c2.5.4 4.5 2.3 4.5 5.7" /></svg>3. Client Name</span>
                                        <MultiSelectDD opts={cpClientNameOpts} values={cpClientNameFiltersDraft}
                                            onChange={v => setCpClientNameFiltersDraft(v)}
                                            placeholder={cpClientNameOpts.length === 0 ? 'No clients' : 'Choose Client Name'} accent="ember" hideSelected />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" /><path d="M2 10h20" /></svg>Mode</span>
                                        <MultiSelectDD opts={[{ value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'cheque', label: 'Cheque' }, { value: 'other', label: 'Other' }]} values={cpPaymentModeFiltersDraft} onChange={v => setCpPaymentModeFiltersDraft(v)} placeholder="All Modes" accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>Per Page</span>
                                        <SearchDD opts={[10, 25, 50, 100].map(n => ({ value: String(n), label: `${n} rows` }))}
                                            value={String(cpPerPage)}
                                            onChange={v => { const n = +v; if (n > 0) { setCpPerPage(n); setCpPage(1); } }}
                                            placeholder="25 rows" accent="ember" />
                                    </div>
                                    <div className="T-ffield T-actions-col">
                                        <span className="T-ffield-lbl">&nbsp;</span>
                                        <div className="T-actions-row">
                                            <button type="button" className={`T-stack-btn T-stack-search${cpSearchPulse ? ' pulsed' : ''}`}
                                                onClick={commitCpFilters} title="Apply filters" aria-label="Apply filters">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" /></svg>
                                                <span>Filter</span>
                                            </button>
                                            <button type="button" className="T-stack-btn T-stack-reset" disabled={!cpAnyDraftActive}
                                                onClick={resetCpFilters} title="Reset all filters" aria-label="Reset all filters">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.343-5.657" /><path d="M20 4v5h-5" /></svg>
                                                <span>Reset</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {cpHasSelection ? (
                                <div className="T-tbl-wrap">
                                    {cpLoading && !cpAllLoaded ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>{[1, 2, 3].map(i => <SK key={i} h={44} />)}</div>
                                        : cpPartyRows.length === 0 ? (
                                            <div className="T-choose-empty">
                                                <div className="T-choose-empty-icon">📭</div>
                                                <div className="T-choose-empty-title">No client records found</div>
                                                <div className="T-choose-empty-sub">No payments for {cpSelectionLabel}.</div>
                                            </div>
                                        ) : (
                                            <table className="T-tbl T-tbl-pro">
                                                <thead><tr>{cpVisibleCols.has('sno') && <th>S.No</th>}{cpVisibleCols.has('date') && <th style={{ width: 68 }}>Date</th>}{cpVisibleCols.has('client') && <th style={{ width: 100 }}>Client</th>}{cpVisibleCols.has('project') && <th style={{ width: 110 }}>Project</th>}{cpVisibleCols.has('type') && <th style={{ width: 90 }}>Type</th>}{cpVisibleCols.has('status') && <th style={{ width: 90 }}>Status</th>}{cpVisibleCols.has('mode') && <th style={{ width: 64 }}>Mode</th>}{cpVisibleCols.has('reference') && <th style={{ width: 100 }}>Reference</th>}{cpVisibleCols.has('notes') && <th>Notes</th>}{cpVisibleCols.has('paid') && <th style={{ textAlign: 'center' }}>Paid</th>}</tr></thead>
                                                <tbody>
                                                    {paginatedCpPartyRows.map((r, i) => (
                                                        <tr key={r.id} style={{ animationDelay: `${i * 12}ms` }}>
                                                            {cpVisibleCols.has('sno') && <td style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t4)', fontWeight: 800 }}>{(cpPage - 1) * safeCpPerPage + i + 1}</td>}
                                                            {cpVisibleCols.has('date') && <td style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--t2)' }}>{fmtDate(r.date)}</td>}
                                                            {cpVisibleCols.has('client') && <td>{r.client && r.client !== '—' ? <span className="T-tbl-client">{r.client}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {cpVisibleCols.has('project') && <td style={{ fontSize: 9.5, color: 'var(--t3)' }}>{r.project || <span className="T-tbl-null">—</span>}</td>}
                                                            {cpVisibleCols.has('type') && <td>{r.type ? <Pill label={labelForType(r.type)} /> : <span className="T-tbl-null">—</span>}</td>}
                                                            {cpVisibleCols.has('status') && <td>{r.status ? <Pill label={labelForStatus(r.status)} /> : <span className="T-tbl-null">—</span>}</td>}
                                                            {cpVisibleCols.has('mode') && <td>{r.mode ? <Pill label={labelForMode(r.mode)} /> : <span className="T-tbl-null">—</span>}</td>}
                                                            {cpVisibleCols.has('reference') && <td style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--purple)' }}>{r.reference || <span className="T-tbl-null">—</span>}</td>}
                                                            {cpVisibleCols.has('notes') && <td style={{ minWidth: 200, maxWidth: 340, whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--t3)', fontSize: 9.5, lineHeight: 1.5 }}>{r.notes || '—'}</td>}
                                                            {cpVisibleCols.has('paid') && <td style={{ textAlign: 'center' }}>{(r.paid || 0) > 0 ? <span className="T-tbl-amt cr">{fmtFull(r.paid)}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                </div>
                            ) : null}

                            {cpHasSelection && cpPartyRows.length > 0 && (
                                <div className="T-sumbar">
                                    <div className="T-sumbar-block">
                                        <div className="T-sumbar-block-hdr">
                                            <span>This Page</span>
                                            <span className="T-sumbar-block-count">{paginatedCpPartyRows.length} of {cpPartyRows.length}</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill cr">Paid {fmtFull(cpPartyPageTotals.paid)}</span>
                                        </div>
                                    </div>
                                    <div className="T-sumbar-divider" />
                                    <div className="T-sumbar-block right">
                                        <div className="T-sumbar-block-hdr">
                                            <span>Selected — {cpSelectionLabel}</span>
                                            <span className="T-sumbar-block-count">{cpPartyRows.length} records</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <div className="T-sumbar-net cr">
                                                <span className="T-sumbar-net-lbl">Total Collected</span>
                                                <span className="T-sumbar-net-val">{fmtFull(cpPartyTotals.paid)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {cpHasSelection && cpPartyRows.length > 0 && totalCpPages > 1 && (
                                <div className="T-pg">
                                    <span className="T-pg-info">
                                        Showing <strong>{(cpPage - 1) * safeCpPerPage + 1}–{Math.min(cpPage * safeCpPerPage, cpPartyRows.length)}</strong> of <strong>{cpPartyRows.length}</strong> records &middot; Page {cpPage} of {totalCpPages}
                                    </span>
                                    <div className="T-pg-btns">
                                        {totalCpPages > 1 && <>
                                            <button className="T-pg-btn" title="First page" disabled={cpPage === 1} onClick={() => setCpPage(1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 17 13 12 18 7" /><polyline points="11 17 6 12 11 7" /></svg></button>
                                            <button className="T-pg-btn" title="Previous page" disabled={cpPage === 1} onClick={() => setCpPage(p => p - 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                                        </>}
                                        {(() => {
                                            const winLen = Math.min(5, totalCpPages);
                                            const start = Math.max(1, Math.min(cpPage - Math.floor(winLen / 2), totalCpPages - winLen + 1));
                                            return Array.from({ length: winLen }, (_, i) => start + i).map(pg => (
                                                <button key={pg} className={`T-pg-btn${cpPage === pg ? ' on' : ''}`} onClick={() => setCpPage(pg)}>{pg}</button>
                                            ));
                                        })()}
                                        {totalCpPages > 1 && <>
                                            <button className="T-pg-btn" title="Next page" disabled={cpPage === totalCpPages} onClick={() => setCpPage(p => p + 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                                            <button className="T-pg-btn" title="Last page" disabled={cpPage === totalCpPages} onClick={() => setCpPage(totalCpPages)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 17 11 12 6 7" /><polyline points="13 17 18 12 13 7" /></svg></button>
                                        </>}
                                    </div>
                                </div>
                            )}
                            {!cpHasSelection && (
                                <div className="T-tbl-wrap">
                                    <div className="T-choose-empty">
                                        <div className="T-choose-empty-orbit">
                                            <div className="T-choose-ring r1" />
                                            <div className="T-choose-ring r2" />
                                            <div className="T-choose-empty-icon">
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M14.5 14.3c2.5.4 4.5 2.3 4.5 5.7" /></svg>
                                            </div>
                                        </div>
                                        <div className="T-choose-empty-title">Choose a filter to view client data</div>
                                        <div className="T-choose-empty-sub">Start with a Project Type, then drill down through Status → Client Name — or jump straight to Mode. The Accounts Receivable Report stays empty until then.</div>
                                        <div className="T-choose-empty-chips">
                                            <span className="T-choose-chip">Project Type</span>
                                            <span className="T-choose-chip">Status</span>
                                            <span className="T-choose-chip">Client Name</span>
                                            <span className="T-choose-chip">Mode</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {cpHasSelection && <div className="T-sync"><span className="T-sync-dot" />Synced · {cpPartyRows.length} record{cpPartyRows.length === 1 ? '' : 's'} · Client: {cpSelectionLabel}</div>}
                        </div>
                    </div>
                )}{/* === MODULE 3: CLIENT PORTAL END === */}

                {/* === MODULE 4: LABOUR START === */}
                {(section === 'all' || section === 'labour') && (
                    <div className="T-section" style={{ paddingTop: 28 }}>
                        <div className="T-card">

                            <div className="T-card-head">
                                <div className="T-card-head-left"><div className="T-card-icon T-card-icon-lb"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 14.5a8.5 8.5 0 0117 0" /><path d="M2 14.5h20v2a1.4 1.4 0 01-1.4 1.4H3.4A1.4 1.4 0 012 16.5z" /><path d="M12 6v2.5" /></svg></div><span className="T-card-title">Wage Disbursement Report</span><span className="T-card-badge T-card-badge-lb">MODULE 4</span></div>
                                <div className="T-card-head-right"><ColumnSelector columns={LB_COLUMNS} visible={lbVisibleCols} onChange={setLbVisibleCols} /><PdfBtn label="Wage Disbursement" onClick={exportLabourPDF} loading={lbPdfLoading} disabled={!lbHasSelection || labourPartyRows.length === 0} /></div>
                            </div>

                            {lbHasSelection && (
                                <div className="T-mode-stats">
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--info),#F0834D)' }} />
                                        <div className="ERP-stat-label">Total Earned</div>
                                        <div className="ERP-stat-val" style={{ color: 'var(--info)', fontSize: 16, fontWeight: 800 }}>{fmtFull(labourPartyTotals.earned)}</div>
                                    </div>
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: 'linear-gradient(90deg,var(--success),#34D399)' }} />
                                        <div className="ERP-stat-label">Total Paid</div>
                                        <div className="ERP-stat-val" style={{ color: 'var(--success)', fontSize: 16, fontWeight: 800 }}>{fmtFull(labourPartyTotals.paid)}</div>
                                    </div>
                                    <div className="ERP-stat">
                                        <div className="ERP-stat-accent" style={{ background: labourPartyTotals.balance > 0 ? 'linear-gradient(90deg,var(--err),#F87171)' : 'linear-gradient(90deg,var(--success),#34D399)' }} />
                                        <div className="ERP-stat-label">Outstanding Balance</div>
                                        <div className="ERP-stat-val" style={{ color: labourPartyTotals.balance > 0 ? 'var(--err)' : 'var(--success)', fontSize: 16, fontWeight: 800 }}>{fmtFull(Math.abs(labourPartyTotals.balance))}</div>
                                    </div>
                                </div>
                            )}

                            <div className="T-date-bar">
                                <span className="T-date-bar-lbl">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                    Date Range
                                </span>
                                <div className="T-date-range">
                                    <CalendarDD value={lbDateFromTouched ? lbDateFromDraft : ''} max={lbDateToDraft || undefined}
                                        onChange={v => { setLbDateFromDraft(v); setLbDateFromTouched(true); if (v) toast.info('Date Filter', `From ${fmtDate(v)}`); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    <span className="T-date-sep" />
                                    <span className="T-date-arrow">→</span>
                                    <span className="T-date-sep" />
                                    <CalendarDD value={lbDateToTouched ? lbDateToDraft : ''} min={lbDateFromDraft || undefined}
                                        onChange={v => { setLbDateToDraft(v); setLbDateToTouched(true); if (v) toast.info('Date Filter', `To ${fmtDate(v)}`); }}
                                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
                                    {/* Date range no longer has its own Filter/Clear buttons — picking a
                                        date here just fills the draft; the single Filter/Reset pair
                                        below the Refine panel applies (or clears) everything together. */}
                                </div>
                            </div>

                            <div className="T-filterpanel">
                                <div className="T-filterpanel-hd">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                                    Refine Your View
                                    <span className="T-fchain-hint">Worker Name → Associate Name → Client Name → Mode</span>
                                    {/* One Filter/Reset pair for the whole panel (date range included) —
                                        see T-actions-row below. No separate Clear All here anymore. */}
                                </div>
                                <div className="T-ffield-grid">
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>1. Worker Name</span>
                                        <MultiSelectDD opts={lbWorkerNameOpts} values={lbNameFiltersDraft} onChange={v => { setLbNameFiltersDraft(v); setLbSubNameFiltersDraft([]); }} placeholder="Choose Worker Name" accent="ember" hideSelected />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M14.5 14.3c2.5.4 4.5 2.3 4.5 5.7" /></svg>2. Associate Name</span>
                                        <MultiSelectDD opts={lbSubNameOpts} values={lbSubNameFiltersDraft} onChange={v => setLbSubNameFiltersDraft(v)} placeholder={lbSubNameOpts.length === 0 ? 'No associate names yet' : 'Choose Associate Name'} accent="ember" hideSelected />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>3. Client Name</span>
                                        <MultiSelectDD opts={lbClientNameOpts} values={lbClientNameFiltersDraft} onChange={v => setLbClientNameFiltersDraft(v)} placeholder={lbClientNameOpts.length === 0 ? 'No client names yet' : 'Choose Client Name'} accent="ember" hideSelected />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" /><path d="M2 10h20" /></svg>4. Mode</span>
                                        <MultiSelectDD opts={[{ value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'cheque', label: 'Cheque' }, { value: 'other', label: 'Other' }]} values={lbPaymentModeFiltersDraft} onChange={v => setLbPaymentModeFiltersDraft(v)} placeholder="All Modes" accent="ember" />
                                    </div>
                                    <div className="T-ffield">
                                        <span className="T-ffield-lbl"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>Per Page</span>
                                        <SearchDD opts={[10, 25, 50, 100].map(n => ({ value: String(n), label: `${n} rows` }))}
                                            value={String(lbPerPage)}
                                            onChange={v => { const n = +v; if (n > 0) { setLbPerPage(n); setLbPage(1); } }}
                                            placeholder="25 rows" accent="ember" />
                                    </div>
                                    <div className="T-ffield T-actions-col">
                                        <span className="T-ffield-lbl">&nbsp;</span>
                                        <div className="T-actions-row">
                                            <button type="button" className={`T-stack-btn T-stack-search${lbSearchPulse ? ' pulsed' : ''}`}
                                                onClick={commitLbFilters} title="Apply filters" aria-label="Apply filters">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" /></svg>
                                                <span>Filter</span>
                                            </button>
                                            <button type="button" className="T-stack-btn T-stack-reset" disabled={!lbAnyDraftActive}
                                                onClick={resetLbFilters} title="Reset all filters" aria-label="Reset all filters">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.343-5.657" /><path d="M20 4v5h-5" /></svg>
                                                <span>Reset</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {lbHasSelection ? (
                                <div className="T-tbl-wrap">
                                    {laborLoading ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>{[1, 2, 3].map(i => <SK key={i} h={44} />)}</div>
                                        : labourPartyRows.length === 0 ? (
                                            <div className="T-choose-empty">
                                                <div className="T-choose-empty-icon">📭</div>
                                                <div className="T-choose-empty-title">No manpower records found</div>
                                                <div className="T-choose-empty-sub">No shifts or payments for {lbSelectionLabel}.</div>
                                            </div>
                                        ) : (
                                            <table className="T-tbl T-tbl-pro">
                                                <thead><tr>
                                                    {lbVisibleCols.has('sno') && <th>S.No</th>}
                                                    {lbVisibleCols.has('date') && <th>Date</th>}
                                                    {lbVisibleCols.has('client') && <th>Client</th>}
                                                    {lbVisibleCols.has('worker') && <th>Worker</th>}
                                                    {lbVisibleCols.has('sub_name') && <th>Associate Name</th>}
                                                    {lbVisibleCols.has('shifts') && <th style={{ textAlign: 'center' }}>Shifts</th>}
                                                    {lbVisibleCols.has('earned') && <th style={{ textAlign: 'center' }}>Earned</th>}
                                                    {lbVisibleCols.has('paid') && <th style={{ textAlign: 'center' }}>Paid</th>}
                                                    {lbVisibleCols.has('balance') && <th style={{ textAlign: 'center' }}>Balance</th>}
                                                    {lbVisibleCols.has('status') && <th style={{ textAlign: 'center' }}>Status</th>}
                                                </tr></thead>
                                                <tbody>
                                                    {paginatedLabourPartyRows.map((g, i) => (
                                                        <tr key={g.key} style={{ animationDelay: `${i * 12}ms` }}>
                                                            {lbVisibleCols.has('sno') && <td style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t4)', fontWeight: 800 }}>{(lbPage - 1) * safeLbPerPage + i + 1}</td>}
                                                            {lbVisibleCols.has('date') && <td style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{lbRowDateLabel(g)}</td>}
                                                            {lbVisibleCols.has('client') && <td>{g.client ? <span className="T-tbl-client">{g.client}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {lbVisibleCols.has('worker') && <td><span style={{ fontWeight: 800 }}>{g.worker}</span></td>}
                                                            {lbVisibleCols.has('sub_name') && <td>{g.isOwn ? <span className="T-tbl-null">Own Work</span> : g.subName ? <span className="T-tbl-subname">{g.subName}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {lbVisibleCols.has('shifts') && <td style={{ textAlign: 'center' }}>{g.shifts ? <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--t2)' }}>{g.shifts}</span> : <span className="T-tbl-null">—</span>}</td>}
                                                            {lbVisibleCols.has('earned') && <td style={{ textAlign: 'center' }}><span className="T-tbl-amt dr">{fmtFull(g.earned)}</span></td>}
                                                            {lbVisibleCols.has('paid') && <td style={{ textAlign: 'center' }}><span className="T-tbl-amt cr">{fmtFull(g.paid)}</span></td>}
                                                            {lbVisibleCols.has('balance') && <td style={{ textAlign: 'center' }}><span style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: g.balance > 0.005 ? 'var(--err)' : 'var(--success)' }}>{fmtFull(g.balance)}</span></td>}
                                                            {lbVisibleCols.has('status') && <td style={{ textAlign: 'center' }}><Pill label={g.balance > 0.005 ? 'Due' : 'Clear'} /></td>}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                </div>
                            ) : (
                                <div className="T-tbl-wrap">
                                    <div className="T-choose-empty">
                                        <div className="T-choose-empty-orbit">
                                            <div className="T-choose-ring r1" />
                                            <div className="T-choose-ring r2" />
                                            <div className="T-choose-empty-icon">
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                        </div>
                                        <div className="T-choose-empty-title">Choose a filter, then press Search</div>
                                        <div className="T-choose-empty-sub">Start with a Worker Name, then drill down through Associate Name → Client Name — or jump straight to Mode. The Manpower Report stays empty until you apply a filter.</div>
                                        <div className="T-choose-empty-chips">
                                            <span className="T-choose-chip">Worker Name</span>
                                            <span className="T-choose-chip">Associate Name</span>
                                            <span className="T-choose-chip">Client Name</span>
                                            <span className="T-choose-chip">Mode</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {lbHasSelection && labourPartyRows.length > 0 && (
                                <div className="T-sumbar">
                                    <div className="T-sumbar-block">
                                        <div className="T-sumbar-block-hdr">
                                            <span>This Page</span>
                                            <span className="T-sumbar-block-count">{paginatedLabourPartyRows.length} of {labourPartyRows.length}</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill dr">Earned {fmtFull(labourPartyPageTotals.earned)}</span>
                                            <span className="T-sumbar-pill cr">Paid {fmtFull(labourPartyPageTotals.paid)}</span>
                                        </div>
                                    </div>
                                    <div className="T-sumbar-divider" />
                                    <div className="T-sumbar-block right">
                                        <div className="T-sumbar-block-hdr">
                                            <span>Selected — {lbSelectionLabel}</span>
                                            <span className="T-sumbar-block-count">{labourPartyRows.length} manpower</span>
                                        </div>
                                        <div className="T-sumbar-block-vals">
                                            <span className="T-sumbar-pill dr">Earned {fmtFull(labourPartyTotals.earned)}</span>
                                            <span className="T-sumbar-pill cr">Paid {fmtFull(labourPartyTotals.paid)}</span>
                                            <div className={`T-sumbar-net${(labourPartyTotals.balance || 0) > 0.005 ? ' dr' : ' cr'}`}>
                                                <span className="T-sumbar-net-lbl">{(labourPartyTotals.balance || 0) > 0.005 ? 'Due' : 'Clear'}</span>
                                                <span className="T-sumbar-net-val">{fmtFull(labourPartyTotals.balance || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {lbHasSelection && labourPartyRows.length > 0 && totalLbPages > 1 && (
                                <div className="T-pg">
                                    <span className="T-pg-info">
                                        Showing <strong>{(lbPage - 1) * safeLbPerPage + 1}–{Math.min(lbPage * safeLbPerPage, labourPartyRows.length)}</strong> of <strong>{labourPartyRows.length}</strong> manpower &middot; Page {lbPage} of {totalLbPages}
                                    </span>
                                    <div className="T-pg-btns">
                                        {totalLbPages > 1 && <>
                                            <button className="T-pg-btn" title="First page" disabled={lbPage === 1} onClick={() => setLbPage(1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 17 13 12 18 7" /><polyline points="11 17 6 12 11 7" /></svg></button>
                                            <button className="T-pg-btn" title="Previous page" disabled={lbPage === 1} onClick={() => setLbPage(p => p - 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                                        </>}
                                        {(() => {
                                            const winLen = Math.min(5, totalLbPages);
                                            const start = Math.max(1, Math.min(lbPage - Math.floor(winLen / 2), totalLbPages - winLen + 1));
                                            return Array.from({ length: winLen }, (_, i) => start + i).map(pg => (
                                                <button key={pg} className={`T-pg-btn${lbPage === pg ? ' on' : ''}`} onClick={() => setLbPage(pg)}>{pg}</button>
                                            ));
                                        })()}
                                        {totalLbPages > 1 && <>
                                            <button className="T-pg-btn" title="Next page" disabled={lbPage === totalLbPages} onClick={() => setLbPage(p => p + 1)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                                            <button className="T-pg-btn" title="Last page" disabled={lbPage === totalLbPages} onClick={() => setLbPage(totalLbPages)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 17 11 12 6 7" /><polyline points="13 17 18 12 13 7" /></svg></button>
                                        </>}
                                    </div>
                                </div>
                            )}
                            {lbHasSelection && <div className="T-sync"><span className="T-sync-dot" />Synced · {labourPartyRows.length} record{labourPartyRows.length === 1 ? '' : 's'} · {lbNameFilters.length > 0 ? 'Worker' : 'Client'}: {lbSelectionLabel}</div>}
                        </div>
                    </div>
                )}{/* === MODULE 4: LABOUR END === */}

            </div>
        </div>
    );
}
