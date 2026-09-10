import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../services/axiosConfig';
import { ERP_CSS } from './ERPTheme';
import Pagination from '../components/Pagination';
import { CalendarDD } from '../components/CalendarDD';
import { useKeyboardFieldNav } from '../utils/keyboardNav';

const COMPANY = {
    fullName: 'WhiteNode Software Solutions',
    address: '281, GRAND BRENTON 1st Floor, Avinashi Rd, Coimbatore, Tamil Nadu 641004',
    phone: '+91 94885 42342',
    email: 'contact@whitenode.in',
    gstin: 'GSTIN: 00XXXXX0000X0XX',
    website: 'www.whitenode.in',
    tagline: 'Software Solutions',
    logoPath: import.meta.env.BASE_URL + 'favicon.png',
    logo2Path: import.meta.env.BASE_URL + 'favicon.png',
};

interface ClientPaymentRow { id: number; payment_date: string; amount: number; gst_amount: number; total_amount: number; payment_mode: string; mode_label: string; reference_number: string | null; notes: string | null; project_name: string; project_id: number | null; }
interface ClientCollection { client_id: number; client_name: string; total: number; payments: ClientPaymentRow[]; }
interface DaybookIncomeRow { id: number; transaction_date: string; amount: number; payment_mode: string; narration: string | null; client_name: string | null; category_name: string; sub_category_name: string | null; party_name: string; }
interface MonthlyRow { month: string; label: string; client_income: number; daybook_income: number; total: number; }
interface Summary { total_income: number; total_client_income: number; total_daybook_income: number; client_count: number; payment_count: number; daybook_entry_count: number; }
interface ISData { date_range: { from: string; to: string }; summary: Summary; client_collections: ClientCollection[]; daybook_income: DaybookIncomeRow[]; monthly: MonthlyRow[]; }
const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n: number) => { if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`; if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`; if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)} K`; return fmt(n); };
const fmtPDF = (n: number) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// jsPDF's standard Helvetica font has no real glyph or width metric for
// anything outside its base WinAnsi set — ₹, arrows, em/en-dashes, middle
// dots, curly quotes, emoji, etc. all fall back to a guessed width for
// wrapping while the character itself renders wrong (or as a stray wrong
// glyph), and that mismatch is what makes autoTable's narration column
// run past its border. Rather than special-case every character that
// might show up, common ones get mapped to a plain ASCII equivalent
// first, then anything else outside printable ASCII is stripped entirely
// — mirrors ReportCenter.tsx's pdfSafe()/pdfSanitize().
const isPdfSafe = (text: string | undefined | null): string => {
    if (!text) return '-';
    return String(text)
        .replace(/₹/g, 'Rs. ')
        .replace(/[‒–—―−]/g, '-')
        .replace(/[·•‧]/g, '-')
        .replace(/[→➜➤⇒⟶↦▸›]/g, '->')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/…/g, '...')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\s{2,}/g, ' ').trim() || '-';
};
const fmtDate = (d: string) => { if (!d) return '—'; try { const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };
const MODE_COLOR: Record<string, string> = { cash: '#1e9c6a', Cash: '#1e9c6a', upi: '#2870cc', UPI: '#2870cc', bank_transfer: '#7c3aed', 'Bank Transfer': '#7c3aed', cheque: '#c47e0a', Cheque: '#c47e0a', neft: '#2870cc', NEFT: '#2870cc', other: '#6b7280', Others: '#6b7280' };
const ErpLogo = ({ size = 62 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 18px rgba(29,78,216,0.40)) drop-shadow(0 1px 4px rgba(0,0,0,0.18))', transition: 'transform .22s,filter .22s', display: 'block' }}>

        <defs>
            <linearGradient id="isLg1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="isLg2" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" /><stop offset="60%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <radialGradient id="isLg3" cx="40%" cy="30%" r="55%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
        </defs>

        <rect width="80" height="80" rx="16" fill="url(#isLg1)" />
        <rect width="80" height="80" rx="16" fill="url(#isLg3)" />
        <line x1="0" y1="26.7" x2="80" y2="26.7" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <line x1="0" y1="53.4" x2="80" y2="53.4" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <line x1="26.7" y1="0" x2="26.7" y2="80" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <line x1="53.4" y1="0" x2="53.4" y2="80" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <rect width="80" height="1.5" fill="rgba(255,255,255,0.20)" />
        <rect x="0" y="0" width="4" height="80" fill="rgba(59,130,246,0.55)" />
        <rect x="0" y="62" width="80" height="18" fill="url(#isLg2)" />
        <rect x="0" y="62" width="80" height="2.5" fill="rgba(255,255,255,0.22)" />
        <rect x="11" y="18" width="58" height="12" rx="4" fill="white" />
        <rect x="31" y="30" width="18" height="25" rx="4" fill="white" />
        <text x="63.5" y="75.5" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="800" fontSize="9.5" fill="rgba(219,234,254,0.96)">S</text>
        <rect x="7" y="7" width="10" height="2" rx="1" fill="rgba(255,255,255,0.38)" />
        <rect x="7" y="7" width="2" height="10" rx="1" fill="rgba(255,255,255,0.38)" />
        <rect x="63" y="7" width="10" height="2" rx="1" fill="rgba(255,255,255,0.38)" />
        <rect x="71" y="7" width="2" height="10" rx="1" fill="rgba(255,255,255,0.38)" />
    </svg>
);

const PATHS: Record<string, string> = {
    income: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    client: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    daybook: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    chevron: 'M19 9l-7 7-7-7',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    pdf: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    search: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
    filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    empty: 'M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    arrowUp: 'M5 10l7-7m0 0l7 7m-7-7v18',
    warn: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
};

const Icon = ({ name, size = 16 }: { name: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={PATHS[name] || PATHS.income} />
    </svg>
);

/* ═══════════════════════════════════════════════════════
   PDF Start
══════════════════════════════════════════════════════════ */
const loadScript = (src: string): Promise<void> => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = rej;
    document.head.appendChild(s);
});

const getLogoB64 = (): Promise<string> => new Promise(r => { const i = new Image(); i.crossOrigin = 'anonymous'; i.src = COMPANY.logoPath; i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d')!.drawImage(i, 0, 0); try { r(c.toDataURL('image/png')); } catch { r(''); } }; i.onerror = () => r(''); });
const getLogo2B64 = (): Promise<string> => new Promise(r => { const i = new Image(); i.crossOrigin = 'anonymous'; i.src = COMPANY.logo2Path; i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d')!.drawImage(i, 0, 0); try { r(c.toDataURL('image/png')); } catch { r(''); } }; i.onerror = () => r(''); });
const isBuildPdfHeader = async (
    doc: any, title: string, subtitle: string, rightTag: string
): Promise<{ startY: number; logo: string; watermark: string }> => {
    const [logo, watermark] = await Promise.all([getLogoB64(), getLogo2B64()]);
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(255, 255, 255); doc.setTextColor(0, 0, 0); doc.setDrawColor(0, 0, 0);
    doc.setFillColor(203, 54, 9); doc.rect(0, 0, W, 2.5, 'F');
    doc.setFillColor(255, 250, 245); doc.rect(0, 2.5, W, 37.5, 'F');
    doc.setFillColor(203, 54, 9); doc.rect(0, 2.5, 3, 37.5, 'F');
    doc.setFillColor(255, 235, 215); doc.rect(3, 2.5, W - 3, 37.5, 'F');
    doc.setDrawColor(220, 130, 70); doc.setLineWidth(0.3); doc.line(0, 40, W, 40);
    // Same two-line lockup as the app/other reports: brand name once
    // ("WHITENODE"), "SOFTWARE SOLUTIONS" as its own tag underneath —
    // fullName also contains that tagline, so printing it in full here
    // would duplicate it right below.
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(150, 60, 20); doc.text(COMPANY.fullName.replace(/\s*Software Solutions\s*$/i, '').toUpperCase(), 37, 16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(170, 90, 40); doc.text(COMPANY.tagline.toUpperCase(), 37, 23);
    doc.setFontSize(6.5); doc.setTextColor(160, 100, 60); doc.text(COMPANY.address, 37, 29.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(203, 54, 9); doc.text(COMPANY.gstin, W - 10, 11, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(160, 90, 50);
    doc.text(COMPANY.email, W - 10, 18, { align: 'right' }); doc.text(COMPANY.phone, W - 10, 24, { align: 'right' }); doc.text(COMPANY.website, W - 10, 30, { align: 'right' });
    doc.setFillColor(218, 105, 45); doc.rect(0, 40, W, 22, 'F');
    doc.setFillColor(203, 54, 9); doc.rect(0, 40, 3, 22, 'F');
    doc.setFillColor(245, 165, 90); doc.rect(0, 62, W, 1.2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 252, 248); doc.text(title, 16, 52);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(255, 230, 195); if (subtitle) doc.text(subtitle, 16, 58.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 245, 210); doc.text(rightTag, W - 10, 52, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(255, 225, 185); doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - 10, 58.5, { align: 'right' });
    return { startY: 65, logo, watermark };
};

const isDrawContHeader = (doc: any, title: string) => {
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(255, 255, 255); doc.setTextColor(0, 0, 0); doc.setDrawColor(0, 0, 0);
    doc.setFillColor(218, 105, 45); doc.rect(0, 0, W, 12, 'F');
    doc.setFillColor(203, 54, 9); doc.rect(0, 0, 3, 12, 'F');
    doc.setFillColor(245, 165, 90); doc.rect(0, 12, W, 0.8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 252, 248); doc.text(title, 16, 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(255, 225, 185); doc.text(COMPANY.fullName, W - 10, 8, { align: 'right' });
};

const isBuildPdfFooter = async (doc: any, logo: string, watermark: string) => {
    const pc = doc.internal.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const GState = (window as any).jspdf?.GState;
    for (let i = 1; i <= pc; i++) {
        doc.setPage(i);
        if (watermark && GState) {
            try { const sz = 90, wx = (W - sz) / 2, wy = (H - sz) / 2; doc.setGState(new GState({ opacity: 0.06 })); doc.addImage(watermark, 'PNG', wx, wy, sz, sz); doc.setGState(new GState({ opacity: 1.0 })); } catch { }
        }
        doc.setFillColor(255, 246, 238); doc.rect(0, H - 26, W, 26, 'F');
        doc.setDrawColor(220, 140, 80); doc.setLineWidth(0.4); doc.line(10, H - 22, W - 10, H - 22);
        doc.setFillColor(245, 165, 90); doc.rect(0, H - 2.5, W, 2.5, 'F');
        doc.setFillColor(203, 54, 9); doc.rect(0, H - 3.2, W, 0.7, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(140, 60, 20); doc.text(COMPANY.fullName, 10, H - 12);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(160, 90, 45); doc.text(COMPANY.website, W - 10, H - 12, { align: 'right' });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(203, 54, 9); doc.text(`Page ${i} of ${pc}`, W / 2, H - 12, { align: 'center' });
        if (i === pc) {
            const sx = W - 76, sy = H - 49;
            doc.setFillColor(255, 252, 248); doc.rect(sx - 2, sy, 66, 26, 'F');
            doc.setDrawColor(220, 140, 80); doc.setLineWidth(0.4); doc.rect(sx - 2, sy, 66, 26);
            doc.setFillColor(218, 105, 45); doc.rect(sx - 2, sy, 66, 2.5, 'F');
            doc.setDrawColor(210, 160, 110); doc.setLineWidth(0.3); doc.line(sx + 4, sy + 17, sx + 58, sy + 17);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(155, 85, 45); doc.text('Authorised Signatory', sx + 31, sy + 21, { align: 'center' });
            doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(130, 55, 18); doc.text(COMPANY.fullName, sx + 31, sy + 25, { align: 'center' });
        }
        if (logo) {
            try { if (i === 1) doc.addImage(logo, 'PNG', 8, 5, 26, 26); else doc.addImage(logo, 'PNG', 5, 1.5, 8, 8); } catch { }
        }
    }
};

async function exportIncomePDF(data: ISData, fromDate: string, toDate: string) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const s = data.summary;
    const { startY, logo, watermark } = await isBuildPdfHeader(
        doc,
        'INCOME STATEMENT',
        `Period: ${fmtDate(fromDate)} – ${fmtDate(toDate)}`,
        `${s.payment_count + s.daybook_entry_count} entries`
    );

    let curY = startY;
    doc.setFillColor(255, 248, 240); doc.rect(8, curY, W - 16, 30, 'F');
    doc.setDrawColor(220, 140, 80); doc.setLineWidth(0.3); doc.rect(8, curY, W - 16, 30);
    doc.setFillColor(218, 105, 45); doc.rect(8, curY, W - 16, 6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 248, 230); doc.text('FINANCIAL SUMMARY', 12, curY + 4.2);

    const cw = (W - 16) / 3;
    [
        ['Total Income', fmtPDF(s.total_income)],
        ['Client Collections', fmtPDF(s.total_client_income)],
        ['Cash Book Income', fmtPDF(s.total_daybook_income)],
        ['Total Clients', String(s.client_count)],
        ['Total Payments', String(s.payment_count)],
        ['Cash Book Entries', String(s.daybook_entry_count)],
    ].forEach(([lbl, val], idx) => {
        const col = idx % 3, row = Math.floor(idx / 3);
        const x = 10 + col * cw, y = curY + 9 + row * 9.5;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(140, 70, 20); doc.text(lbl, x, y);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(203, 54, 9); doc.text(val, x, y + 5);
    });

    curY += 34;
    if (data.client_collections.length > 0) {
        doc.setFillColor(218, 105, 45); doc.rect(8, curY, W - 16, 7, 'F');
        doc.setFillColor(203, 54, 9); doc.rect(8, curY, 3, 7, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 252, 248);
        doc.text('CLIENT COLLECTIONS', 14, curY + 4.8);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(255, 225, 185);
        doc.text(`${s.client_count} clients · ${s.payment_count} payments`, W - 12, curY + 4.8, { align: 'right' });
        curY += 10;
        const rows: string[][] = [];
        data.client_collections.forEach(c => {
            c.payments.forEach((p, pi) => {
                rows.push([
                    pi === 0 ? String(rows.filter(r => r[0] !== '').length + 1) : '',
                    fmtDate(p.payment_date),
                    pi === 0 ? c.client_name : '',
                    p.project_name || '—',
                    p.mode_label,
                    p.reference_number || '—',
                    fmtPDF(p.amount),
                    p.gst_amount > 0 ? fmtPDF(p.gst_amount) : '—',
                    fmtPDF(p.total_amount),
                ]);
            });
        });
        (doc as any).autoTable({
            startY: curY,
            head: [['S.No', 'Date', 'Client', 'Project', 'Mode', 'Ref', 'Amount', 'GST', 'Total']],
            body: rows,
            foot: [['', '', '', '', '', '', '', `Total:`, fmtPDF(s.total_client_income)]],
            margin: { left: 8, right: 8 },
            styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2.8, textColor: [40, 30, 20], fillColor: [252, 249, 245], lineColor: [220, 180, 150], lineWidth: 0.2 },
            headStyles: { fillColor: [203, 54, 9], textColor: [255, 252, 248], fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
            footStyles: { fillColor: [255, 235, 215], textColor: [150, 60, 10], fontStyle: 'bold', fontSize: 8 },
            alternateRowStyles: { fillColor: [255, 248, 242] },
            columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 20 }, 2: { cellWidth: 28, fontStyle: 'bold' }, 3: { cellWidth: 30 }, 4: { cellWidth: 15 }, 5: { cellWidth: 18 }, 6: { cellWidth: 22, halign: 'right' }, 7: { cellWidth: 18, halign: 'right' }, 8: { cellWidth: 22, halign: 'right', fontStyle: 'bold' } },
            didDrawPage: (data: any) => {
                if (data.pageNumber > 1) isDrawContHeader(doc, 'INCOME STATEMENT – Client Collections');
                data.settings.margin.top = 16;
            },
        });
        curY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (data.daybook_income.length > 0) {
        const PH = doc.internal.pageSize.getHeight();
        if (curY > PH - 50) { doc.addPage(); isDrawContHeader(doc, 'INCOME STATEMENT – Cash Book Income'); curY = 16; }
        doc.setFillColor(218, 105, 45); doc.rect(8, curY, W - 16, 7, 'F');
        doc.setFillColor(203, 54, 9); doc.rect(8, curY, 3, 7, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 252, 248);
        doc.text('DAYBOOK INCOME ENTRIES', 14, curY + 4.8);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(255, 225, 185);
        doc.text(`${s.daybook_entry_count} entries`, W - 12, curY + 4.8, { align: 'right' });
        curY += 10;

        const dbRows = data.daybook_income.map((e, i) => [
            String(i + 1), fmtDate(e.transaction_date), e.category_name,
            e.party_name, e.client_name || '—', e.payment_mode,
            isPdfSafe(e.narration), fmtPDF(e.amount),
        ]);

        (doc as any).autoTable({
            startY: curY,
            head: [['S.No', 'Date', 'Account Head', 'Party', 'Client', 'Mode', 'Narration', 'Amount']],
            body: dbRows,
            foot: [['', '', '', '', '', '', 'Total', fmtPDF(s.total_daybook_income)]],
            margin: { left: 8, right: 8 },
            styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2.8, textColor: [40, 30, 20], fillColor: [252, 249, 245], lineColor: [220, 180, 150], lineWidth: 0.2, overflow: 'linebreak' },
            headStyles: { fillColor: [203, 54, 9], textColor: [255, 252, 248], fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
            footStyles: { fillColor: [255, 235, 215], textColor: [150, 60, 10], fontStyle: 'bold', fontSize: 8 },
            alternateRowStyles: { fillColor: [255, 248, 242] },
            columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 21 }, 2: { cellWidth: 24 }, 3: { cellWidth: 26 }, 4: { cellWidth: 20 }, 5: { cellWidth: 16 }, 6: { cellWidth: 38 }, 7: { cellWidth: 24, halign: 'right', fontStyle: 'bold' } },
            didDrawPage: (data: any) => {
                if (data.pageNumber > 1) isDrawContHeader(doc, 'INCOME STATEMENT – Cash Book Income');
                data.settings.margin.top = 16;
            },
        });
    }

    await isBuildPdfFooter(doc, logo, watermark);
    doc.save(`Income_Statement_${fromDate}_${toDate}.pdf`);
}

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const IS_CSS = `
${ERP_CSS}

.IS-page{padding:32px 36px;background:var(--surface);min-height:100%;font-family:var(--font-body);color:var(--text-1);}

/* ── Logo hero banner ── */
.IS-hero{display:flex;align-items:center;gap:16px;background:transparent;border-bottom:2px solid rgba(29,78,216,0.13);padding:20px 0 18px;margin-bottom:8px;position:relative;overflow:visible;animation:erp-slide-up .45s cubic-bezier(.22,1,.36,1) both;}
.IS-hero-logo{flex-shrink:0;position:relative;z-index:1;width:48px;height:48px;border-radius:14px;background:rgba(29,78,216,0.07);border:1.5px solid rgba(29,78,216,0.16);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(29,78,216,0.10);overflow:hidden;}
.IS-hero-body{flex:1;position:relative;z-index:1;min-width:0;}
.IS-hero-eyebrow{display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size: 8px;font-weight: 700;letter-spacing:3px;text-transform:uppercase;color:var(--ember);margin-bottom:4px;}
.IS-hero-eyebrow-line{display:none;}
.IS-hero-title{font-family:var(--font-display);font-size: 23px;font-weight: 600;font-style:italic;line-height:1.1;color:#1A1A1A;}
.IS-hero-title em{font-style:normal;color:var(--ember);background:none;-webkit-text-fill-color:currentColor;}
.IS-hero-sub{font-family:var(--font-mono);font-size: 8px;color:#94A3B8;margin-top:3px;letter-spacing:1px;}
.IS-hero-actions{display:flex;gap:10px;position:relative;z-index:1;flex-shrink:0;}

/* ── Buttons ── */
.IS-btn{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 18px;border-radius:var(--r-sm);font-size: 9.5px;font-weight: 800;cursor:pointer;border:none;transition:all .15s;font-family:var(--font-body);white-space:nowrap;letter-spacing:.02em;}
.IS-btn.primary{background:linear-gradient(135deg,var(--ember-mid),var(--ember));color:#fff;box-shadow:0 2px 12px rgba(29,78,216,.28);}
.IS-btn.primary:hover{transform:translateY(-1px);box-shadow:var(--sh-ember);}
.IS-btn.ghost{background:var(--off-white);color:var(--text-2);border:1px solid var(--border);}
.IS-btn.ghost:hover{background:var(--ember-ghost);color:var(--ember);border-color:var(--ember-border);}
.IS-btn.pdf-btn{background:linear-gradient(135deg,var(--ember),var(--ember-mid));color:#fff;box-shadow:0 2px 12px rgba(29,78,216,.25);}
.IS-btn.pdf-btn:hover{transform:translateY(-1px);box-shadow:var(--sh-ember);}
.IS-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}
.IS-spin{width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:erp-spin .7s linear infinite;display:inline-block;flex-shrink:0;}
.IS-spin.dark{border-color:rgba(0,0,0,.12);border-top-color:var(--ember);}

/* ── Filters ── */
.IS-filters{display:flex;align-items:center;gap:10px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-lg);padding:12px 16px;box-shadow:var(--sh-card);flex-wrap:wrap;margin-bottom:28px;animation:erp-slide-up .35s ease .08s both;}
.IS-filter-lbl{font-size: 9px;font-weight: 800;color:var(--text-3);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;}
.IS-date-in{height:34px;padding:0 10px;border:1px solid var(--border);border-radius:var(--r-sm);font-size: 9.5px;font-family:var(--font-mono);color:var(--text-1);background:var(--off-white);transition:border-color .15s,box-shadow .15s;}
.IS-date-in:focus{outline:none;border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);}
.IS-sep{width:1px;height:22px;background:var(--border);margin:0 2px;}
.IS-quick-btn{height:28px;padding:0 12px;border-radius:20px;font-size: 9px;font-weight: 800;cursor:pointer;border:1px solid var(--border);background:var(--off-white);color:var(--text-3);transition:all .14s;font-family:var(--font-mono);}
.IS-quick-btn:hover{border-color:var(--ember-mid);color:var(--ember);background:var(--ember-ghost);}

/* ── Stat cards ── */
.IS-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
@media(max-width:1100px){.IS-stats{grid-template-columns:repeat(2,1fr);}}
@media(max-width:640px){.IS-stats{grid-template-columns:1fr;}}
.IS-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px 24px 18px;display:flex;flex-direction:column;gap:6px;box-shadow:var(--sh-card);position:relative;overflow:hidden;animation:erp-slide-up .5s ease both;transition:box-shadow .2s,transform .2s;}
.IS-card:hover{box-shadow:var(--sh-hover);transform:translateY(-3px);}
.IS-card::before{content:'';position:absolute;inset:0 0 auto 0;height:3px;}
.IS-card-0::before{background:linear-gradient(90deg,#2563EB,#3B82F6,#BFDBFE);}
.IS-card-1::before{background:linear-gradient(90deg,#1e9c6a,#2bcf8e);}
.IS-card-2::before{background:linear-gradient(90deg,#2870cc,#5b9af8);}
.IS-card-3::before{background:linear-gradient(90deg,#7c3aed,#a78bfa);}
.IS-card-glow{position:absolute;bottom:-20px;right:-20px;width:100px;height:100px;border-radius:50%;opacity:.07;}
.IS-card-0 .IS-card-glow{background:var(--ember);}
.IS-card-1 .IS-card-glow{background:#1e9c6a;}
.IS-card-2 .IS-card-glow{background:#2870cc;}
.IS-card-3 .IS-card-glow{background:#7c3aed;}
.IS-card-icon{width:42px;height:42px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;margin-bottom:4px;}
.IS-card-0 .IS-card-icon{background:var(--ember-ghost);color:var(--ember);}
.IS-card-1 .IS-card-icon{background:var(--success-bg);color:var(--success);}
.IS-card-2 .IS-card-icon{background:var(--info-bg);color:var(--info);}
.IS-card-3 .IS-card-icon{background:rgba(124,58,237,.1);color:#7c3aed;}
.IS-card-lbl{font-size: 9px;font-weight: 700;color:var(--text-4);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.07em;}
.IS-card-val{font-size: 23px;font-weight: 800;font-family:var(--font-mono);line-height:1;}
.IS-card-0 .IS-card-val{color:var(--ember);}
.IS-card-1 .IS-card-val{color:var(--success);}
.IS-card-2 .IS-card-val{color:var(--info);}
.IS-card-3 .IS-card-val{color:#7c3aed;}
.IS-card-sub{font-size: 9px;color:var(--text-4);display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.IS-card-badge{display:inline-flex;align-items:center;font-size: 9px;font-family:var(--font-mono);font-weight: 800;padding:2px 8px;border-radius:10px;}
.IS-card-0 .IS-card-badge{background:var(--ember-ghost);color:var(--ember);}
.IS-card-1 .IS-card-badge{background:var(--success-bg);color:var(--success);}
.IS-card-2 .IS-card-badge{background:var(--info-bg);color:var(--info);}
.IS-card-3 .IS-card-badge{background:rgba(124,58,237,.1);color:#7c3aed;}

/* ── 3D Chart ── */
.IS-chart-wrap{background:#fff;border:1px solid rgba(29,78,216,0.14);border-top:3px solid var(--ember-mid);border-radius:var(--r-xl);padding:26px 28px;margin-bottom:28px;box-shadow:0 2px 16px rgba(29,78,216,0.07),0 1px 4px rgba(0,0,0,0.04);position:relative;overflow:hidden;animation:erp-slide-up .5s ease .12s both;}
.IS-chart-wrap::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 0%,rgba(59,130,246,0.06),transparent 60%),radial-gradient(ellipse at 70% 100%,rgba(40,112,204,0.04),transparent 60%);pointer-events:none;}
.IS-chart-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;z-index:1;flex-wrap:wrap;gap:12px;}
.IS-chart-title-txt{font-size: 13px;font-weight: 800;color:var(--text-1);display:flex;align-items:center;gap:9px;font-family:var(--font-body);}
.IS-chart-title-txt svg{color:var(--ember);}
.IS-chart-period{font-size: 9px;font-family:var(--font-mono);color:var(--text-4);margin-top:2px;}
.IS-chart-legend{display:flex;gap:18px;}
.IS-legend-item{display:flex;align-items:center;gap:7px;font-size: 9px;color:var(--text-3);font-family:var(--font-mono);font-weight: 700;}
.IS-legend-dot{width:12px;height:12px;border-radius:3px;}

/* 3D perspective stage */
.IS-3d-stage{perspective:600px;perspective-origin:50% 60%;position:relative;z-index:1;background:linear-gradient(180deg,rgba(255,246,237,0.6),rgba(255,249,244,0.8));border-radius:var(--r-lg);padding:16px 8px 8px;}
.IS-3d-floor{display:flex;gap:8px;align-items:flex-end;min-height:200px;padding:0 8px 0 8px;transform:rotateX(12deg);transform-style:preserve-3d;overflow-x:auto;}

.IS-3d-col{display:flex;flex-direction:column;align-items:center;flex:1;min-width:48px;max-width:72px;gap:0;transform-style:preserve-3d;}
.IS-3d-bars-stack{display:flex;flex-direction:column;align-items:center;width:80%;gap:3px;transform-style:preserve-3d;}

/* 3D bar */
.IS-3d-bar{width:100%;position:relative;border-radius:4px 4px 0 0;transform-style:preserve-3d;cursor:pointer;transition:filter .18s;}
.IS-3d-bar:hover{filter:brightness(1.15);}
/* front face gradient */
.IS-3d-bar-client{background:linear-gradient(180deg,#60A5FA 0%,#fe7a07 30%,#2563EB 100%);box-shadow:inset 1px 0 0 rgba(255,255,255,.25),inset -1px 0 0 rgba(0,0,0,.2),0 -1px 0 rgba(255,200,100,.4);}
.IS-3d-bar-db{background:linear-gradient(180deg,#7ab8ff 0%,#4896f5 30%,#1e5bb8 100%);box-shadow:inset 1px 0 0 rgba(255,255,255,.25),inset -1px 0 0 rgba(0,0,0,.2),0 -1px 0 rgba(150,200,255,.4);}
/* right side face */
.IS-3d-bar::after{content:'';position:absolute;top:0;right:-5px;width:5px;bottom:0;transform-origin:left;transform:rotateY(90deg) translateX(-50%);border-radius:0 4px 0 0;}
.IS-3d-bar-client::after{background:linear-gradient(180deg,#1D4ED8,#1D4ED8);}
.IS-3d-bar-db::after{background:linear-gradient(180deg,#1a4a90,#0d2555);}
/* top cap */
.IS-3d-bar::before{content:'';position:absolute;top:-4px;left:0;right:-5px;height:5px;transform-origin:bottom;transform:rotateX(90deg) translateY(50%);border-radius:4px 4px 0 0;}
.IS-3d-bar-client::before{background:linear-gradient(90deg,#ffcc60,#ff9020);}
.IS-3d-bar-db::before{background:linear-gradient(90deg,#90ccff,#3080e0);}

.IS-3d-val{font-size: 8.5px;font-family:var(--font-mono);font-weight: 800;color:var(--ember);margin-bottom:6px;text-align:center;}
.IS-3d-floor-line{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(29,78,216,0.15),transparent);margin-top:4px;}
.IS-3d-label{font-size: 8px;font-family:var(--font-mono);color:var(--text-4);text-align:center;margin-top:8px;line-height:1.4;transform:rotateX(-12deg);}
.IS-chart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;color:var(--text-4);gap:10px;font-size: 10.5px;}
/* glow rings */
@keyframes IS-glow-pulse{0%,100%{opacity:.2;transform:scale(1);}50%{opacity:.4;transform:scale(1.05);}}
.IS-chart-glow-ring{position:absolute;border-radius:50%;border:1px solid rgba(29,78,216,.15);animation:IS-glow-pulse 3s ease-in-out infinite;pointer-events:none;}

/* ── Tabs ── */
.IS-tabs{display:flex;gap:4px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-md);padding:4px;box-shadow:var(--sh-card);width:fit-content;margin-bottom:20px;animation:erp-fade-in .4s ease .18s both;}
.IS-tab{display:flex;align-items:center;gap:7px;padding:9px 20px;border-radius:8px;font-size: 10.5px;font-weight: 700;cursor:pointer;border:none;background:transparent;color:var(--text-3);transition:all .18s;font-family:var(--font-body);}
.IS-tab.active{background:linear-gradient(135deg,var(--ember),var(--ember-mid));color:#fff;box-shadow:0 3px 12px rgba(29,78,216,.28);}
.IS-tab:not(.active):hover{background:var(--surface);color:var(--text-1);}
.IS-tab-badge{font-size: 9px;font-family:var(--font-mono);font-weight: 800;padding:2px 8px;border-radius:12px;}
.IS-tab.active .IS-tab-badge{background:rgba(255,255,255,.22);color:#fff;}
.IS-tab:not(.active) .IS-tab-badge{background:var(--surface-2);color:var(--text-4);}

/* ── Table section ── */
.IS-section{background:var(--white);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--sh-card);overflow:hidden;animation:erp-slide-up .45s ease .22s both;}
.IS-sec-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:10px;}
.IS-sec-title{font-size: 11.5px;font-weight: 800;color:var(--text-1);display:flex;align-items:center;gap:8px;}
.IS-sec-count{font-size: 9px;font-family:var(--font-mono);color:var(--text-4);background:var(--surface-2);padding:2px 8px;border-radius:10px;}
.IS-search-wrap{position:relative;}
.IS-search-in{height:34px;padding:0 10px 0 32px;border:1px solid var(--border);border-radius:var(--r-sm);font-size: 9.5px;background:var(--off-white);color:var(--text-1);width:180px;transition:all .15s;font-family:var(--font-body);}
.IS-search-in:focus{outline:none;border-color:var(--ember-mid);box-shadow:0 0 0 3px var(--ember-ghost);width:220px;}
.IS-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-4);pointer-events:none;}

/* Client accordion */
.IS-client-row{border-bottom:1px solid var(--surface-2);}
.IS-client-row:last-child{border-bottom:none;}
.IS-client-hd{display:flex;align-items:center;gap:14px;padding:15px 22px;cursor:pointer;transition:background .12s;user-select:none;}
.IS-client-hd:hover{background:rgba(59,130,246,.04);}
.IS-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--ember),var(--ember-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-weight: 800;font-size: 14px;font-family:var(--font-mono);flex-shrink:0;box-shadow:0 3px 10px rgba(29,78,216,.3);}
.IS-client-info{flex:1;min-width:0;}
.IS-client-name{font-size: 11.5px;font-weight: 800;color:var(--text-1);}
.IS-client-meta{font-size: 9px;color:var(--text-4);font-family:var(--font-mono);margin-top:2px;}
.IS-client-total{font-family:var(--font-mono);font-weight: 800;color:var(--ember);font-size: 15px;white-space:nowrap;}
.IS-chevron{color:var(--text-4);transition:transform .22s cubic-bezier(.4,0,.2,1);flex-shrink:0;}
.IS-chevron.open{transform:rotate(180deg);}

/* Payment sub-table */
.IS-pmt-wrap{border-top:1px solid var(--surface-2);background:var(--surface);animation:erp-slide-down .2s ease both;}
.IS-pmt-tbl{width:100%;border-collapse:collapse;}
.IS-pmt-tbl th{font-size: 9px;font-weight: 800;color:var(--text-4);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.07em;padding:9px 16px;background:var(--surface-2);text-align:left;}
.IS-pmt-tbl th:nth-last-child(-n+3){text-align:right;}
.IS-pmt-tbl td{font-size: 9.5px;color:var(--text-2);padding:11px 16px;border-top:1px solid var(--surface-3);vertical-align:middle;}
.IS-pmt-tbl td:nth-last-child(-n+3){text-align:right;}
.IS-pmt-tbl tr:hover td{background:rgba(59,130,246,.04);}
.IS-amt-green{font-family:var(--font-mono);font-weight: 800;color:var(--success);font-size: 10.5px;}
.IS-amt-bold{font-family:var(--font-mono);font-weight: 800;color:var(--text-1);font-size: 10.5px;}
.IS-mode-chip{display:inline-flex;align-items:center;font-size: 9px;font-family:var(--font-mono);font-weight: 800;padding:3px 9px;border-radius:12px;}

/* Cash Book table */
.IS-db-wrap{overflow-x:auto;}
.IS-db-tbl{width:100%;border-collapse:collapse;}
.IS-db-tbl th{font-size: 9px;font-weight: 800;color:var(--text-4);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.07em;padding:10px 18px;background:var(--surface);text-align:left;position:sticky;top:0;}
.IS-db-tbl th:last-child{text-align:right;}
.IS-db-tbl td{font-size: 10.5px;color:var(--text-2);padding:13px 18px;border-top:1px solid var(--surface-2);vertical-align:middle;}
.IS-db-tbl td:last-child{text-align:right;}
.IS-db-tbl tr:hover td{background:rgba(59,130,246,.04);}
.IS-db-amount{font-family:var(--font-mono);font-weight: 800;color:var(--success);font-size: 13px;}
.IS-cat-chip{display:inline-flex;align-items:center;gap:5px;background:var(--ember-ghost);border:1px solid var(--ember-border);color:var(--ember);font-size: 9px;font-family:var(--font-mono);font-weight: 800;padding:3px 9px;border-radius:12px;}
.IS-narr{font-size: 9.5px;color:var(--text-3);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* Footer */
.IS-footer{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-top:2px solid var(--border);background:linear-gradient(90deg,var(--surface),var(--off-white));}
.IS-footer-info{font-size: 9.5px;color:var(--text-4);font-family:var(--font-mono);}
.IS-footer-total{display:flex;align-items:center;gap:16px;}
.IS-footer-lbl{font-size: 9px;font-weight: 800;color:var(--text-3);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em;}
.IS-footer-val{font-size: 17.5px;font-weight: 800;color:var(--ember);font-family:var(--font-mono);}

/* Empty */
.IS-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 20px;gap:12px;color:var(--text-4);}
.IS-empty-title{font-size: 14px;font-weight: 800;color:var(--text-3);}

/* Error */
.IS-err{display:flex;align-items:center;gap:10px;background:var(--error-bg);border:1px solid var(--error-bd);border-radius:var(--r-md);padding:13px 16px;margin-bottom:20px;color:var(--error);font-size: 10.5px;}

/* Skeleton */
.IS-skel{background:linear-gradient(90deg,var(--surface-2) 25%,var(--surface-3) 50%,var(--surface-2) 75%);background-size:800px 100%;animation:erp-shimmer 1.5s infinite;border-radius:var(--r-sm);}
`;

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
export default function IncomeStatement() {
    const today = new Date();
    const defaultFrom = `${today.getFullYear()}-01-01`;
    const defaultTo = today.toISOString().slice(0, 10);
    const [fromDate, setFromDate] = useState(defaultFrom);
    const [toDate, setToDate] = useState(defaultTo);
    const rootRef = useRef<HTMLDivElement>(null);
    useKeyboardFieldNav(rootRef);
    const [data, setData] = useState<ISData | null>(null);
    const [loading, setLoading] = useState(false);
    const [pdfLoad, setPdfLoad] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'client' | 'daybook'>('client');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [logoErr, setLogoErr] = useState(false);
    const [clPage, setClPage] = useState(1);
    const [clPerPage, setClPerPage] = useState(10);
    const [dbPage, setDbPage] = useState(1);
    const [dbPerPage, setDbPerPage] = useState(10);

    const fetchData = useCallback(async (from = fromDate, to = toDate) => {
        setLoading(true); setError('');
        try {
            const res = await axiosInstance.get('/reports/income-statement', { params: { from_date: from, to_date: to } });
            if (res.data?.success) {
                setData(res.data.data);
                const ids = (res.data.data.client_collections as ClientCollection[]).slice(0, 3).map((c: ClientCollection) => c.client_id);
                setExpanded(new Set(ids));
            } else { setError(res.data?.message || 'Failed to load.'); }
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load income statement. Please try again.');
        } finally { setLoading(false); }
    }, [fromDate, toDate]);

    useEffect(() => { fetchData(); }, []);
    const toggleExpand = (id: number) => setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const setQuick = (key: string) => {
        const y = today.getFullYear(), m = today.getMonth();
        const presets: Record<string, [string, string]> = {
            year: [`${y}-01-01`, defaultTo],
            month: [`${y}-${String(m + 1).padStart(2, '0')}-01`, defaultTo],
            q1: [`${y}-01-01`, `${y}-03-31`], q2: [`${y}-04-01`, `${y}-06-30`],
            q3: [`${y}-07-01`, `${y}-09-30`], q4: [`${y}-10-01`, `${y}-12-31`],
        };
        const [f, t] = presets[key] || [defaultFrom, defaultTo];
        setFromDate(f); setToDate(t); fetchData(f, t);
    };

    const filteredClients = (data?.client_collections ?? []).filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()));
    const filteredDB = (data?.daybook_income ?? []).filter(e => [e.party_name, e.category_name, e.narration ?? '', e.client_name ?? ''].join(' ').toLowerCase().includes(search.toLowerCase()));
    const monthly = data?.monthly ?? [];
    const clTotalPages = Math.max(1, Math.ceil(filteredClients.length / clPerPage));
    const clSafePage = Math.min(clPage, clTotalPages);
    const pagedClients = filteredClients.slice((clSafePage - 1) * clPerPage, clSafePage * clPerPage);
    const dbTotalPages = Math.max(1, Math.ceil(filteredDB.length / dbPerPage));
    const dbSafePage = Math.min(dbPage, dbTotalPages);
    const pagedDB = filteredDB.slice((dbSafePage - 1) * dbPerPage, dbSafePage * dbPerPage);
    const maxTotal = monthly.length ? Math.max(...monthly.map(m => m.total), 1) : 1;
    const CHART_H = 170;

    return (
        <>
            <style>{IS_CSS}</style>
            <div className="IS-page" ref={rootRef}>

                {/* ── Header Start ── */}
                <div className="ERP-hdr" style={{ alignItems: 'center' }}>
                    {/* Financial Report Start */}
                    <div>
                        <div className="ERP-eyebrow">
                            <span className="ERP-eyebrow-line" />
                            <span className="ERP-eyebrow-dot" />
                            Financial Reports · {COMPANY.fullName}
                        </div>
                        <h1 className="ERP-title MD-page-title">Income <span className="ERP-title-em">Statement</span></h1>
                    </div>
                    {/* Financial Report End */}

                    {/* Current Color Start */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>

                        {/* Refresh Start */}
                        <button className={`ERP-refresh-btn${loading ? ' spin' : ''}`} onClick={() => fetchData()} disabled={loading} title="Refresh" aria-label="Refresh">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M20 12a8 8 0 1 1-2.343-5.657" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 4v5h-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            </svg>
                        </button>
                        {/* Refresh End */}

                        {data && (
                            // Export PDF Start
                            <button className="IS-btn pdf-btn" disabled={pdfLoad}
                                onClick={async () => { setPdfLoad(true); try { await exportIncomePDF(data, fromDate, toDate); } finally { setPdfLoad(false); } }}>
                                {pdfLoad ? <span className="IS-spin" /> : <Icon name="pdf" size={14} />}
                                Export PDF
                            </button>
                            // Export PDF End
                        )}
                    </div>
                    {/* Current Color End */}
                </div>
                {/* Header End */}

                <div className="ERP-divider" />

                {/* ── Filter Start── */}
                <div className="IS-filters">
                    <Icon name="calendar" size={14} />
                    <span className="IS-filter-lbl">Period</span>
                    <CalendarDD value={fromDate} onChange={setFromDate} max={toDate} />
                    <span style={{ color: 'var(--text-4)', fontSize: 10.5 }}>—</span>
                    <CalendarDD value={toDate} onChange={setToDate} min={fromDate} />
                    <button className="IS-btn primary" style={{ height: 34 }} onClick={() => fetchData(fromDate, toDate)} disabled={loading}>
                        {loading ? <span className="IS-spin" /> : <Icon name="chart" size={13} />}
                        Generate
                    </button>
                    <span className="IS-sep" />
                    {[['This Year', 'year'], ['This Month', 'month'], ['Q1', 'q1'], ['Q2', 'q2'], ['Q3', 'q3'], ['Q4', 'q4']].map(([lbl, key]) => (
                        <button key={key} className="IS-quick-btn" onClick={() => setQuick(key)}>{lbl}</button>
                    ))}
                </div>
                {/* Filter End */}

                {/* ── Error Start ── */}
                {error && <div className="IS-err"><Icon name="warn" size={16} />{error}</div>}
                {/* ── Error End ── */}

                {/* ── Stat Card Start ── */}
                {data ? (
                    <div className="IS-stats">
                        {[
                            { lbl: 'Total Income', val: fmtShort(data.summary.total_income), sub: `${data.summary.payment_count + data.summary.daybook_entry_count} entries`, badge: 'All Sources', icon: 'income' },
                            { lbl: 'Client Collections', val: fmtShort(data.summary.total_client_income), sub: `${data.summary.payment_count} payments`, badge: `${data.summary.client_count} clients`, icon: 'client' },
                            { lbl: 'Cash Book Income', val: fmtShort(data.summary.total_daybook_income), sub: `${data.summary.daybook_entry_count} entries`, badge: 'Income Type', icon: 'daybook' },
                            { lbl: 'Collection Share', val: data.summary.total_income > 0 ? (data.summary.total_client_income / data.summary.total_income * 100).toFixed(1) + '%' : '0%', sub: 'from Accounts Receivable', badge: 'of income', icon: 'arrowUp' },
                        ].map((c, i) => (
                            <div key={i} className={`IS-card IS-card-${i}`} style={{ animationDelay: `${i * 0.07}s` }}>
                                <div className="IS-card-glow" />
                                <div className="IS-card-icon"><Icon name={c.icon} size={20} /></div>
                                <div className="IS-card-lbl">{c.lbl}</div>
                                <div className="IS-card-val">{c.val}</div>
                                <div className="IS-card-sub">
                                    <span className="IS-card-badge">{c.badge}</span>
                                    {c.sub}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : loading && (
                    <div className="IS-stats">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`IS-card IS-card-${i}`} style={{ animationDelay: `${i * 0.07}s` }}>
                                <div className="IS-skel" style={{ width: 42, height: 42, borderRadius: 8, marginBottom: 10 }} />
                                <div className="IS-skel" style={{ width: '55%', height: 10, marginBottom: 10 }} />
                                <div className="IS-skel" style={{ width: '80%', height: 26 }} />
                            </div>
                        ))}
                    </div>
                )}
                {/* Stat Card End */}

                {/* ── 3D Monthly Chart ── */}
                {data && (
                    <div className="IS-chart-wrap">
                        {/* Monthly Breaken Start */}
                        <div className="IS-chart-hdr">
                            
                            <div>
                                {/* Monthly Breakdown Start */}
                                <div className="IS-chart-title-txt">
                                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ember)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <path d={PATHS.chart} />
                                    </svg>
                                    Monthly Breakdown
                                </div>
                                {/* Monthly Breakdown End */}
                                <div className="IS-chart-period">{fmtDate(fromDate)} – {fmtDate(toDate)}</div>
                            </div>

                            {/* Collections Start */}
                            <div className="IS-chart-legend">

                                {/* Client Collections Start */}
                                <div className="IS-legend-item">
                                    <div className="IS-legend-dot" style={{ background: 'linear-gradient(135deg,#60A5FA,#2563EB)' }} />
                                    Client Collections
                                </div>
                                {/* Client Collections End */}

                                {/* Cash Book Income Start */}
                                <div className="IS-legend-item">
                                    <div className="IS-legend-dot" style={{ background: 'linear-gradient(135deg,#7ab8ff,#1e5bb8)' }} />
                                    Cash Book Income
                                </div>
                                {/* Cash Book Income End */}

                            </div>
                            {/* Collections End */}
                        </div>
                        {/* Monthly Breakdown End */}

                        {/* Monthly Start */}
                        {monthly.length === 0 ? (
                            <div className="IS-chart-empty">
                                <Icon name="chart" size={38} />
                                No data for selected period
                            </div>
                        ) : (
                            // Monthly End

                            // Income Start
                            <div className="IS-3d-stage">
                                <div className="IS-3d-floor">
                                    {monthly.map((m, i) => {
                                        const clientH = m.client_income > 0 ? Math.max((m.client_income / maxTotal) * CHART_H, 10) : 0;
                                        const dbH = m.daybook_income > 0 ? Math.max((m.daybook_income / maxTotal) * CHART_H, 10) : 0;
                                        const totalH = clientH + dbH;
                                        return (
                                            <div key={i} className="IS-3d-col">
                                                {totalH > 0 && <div className="IS-3d-val">{fmtShort(m.total)}</div>}
                                                <div className="IS-3d-bars-stack">
                                                    {dbH > 0 && (
                                                        <div className="IS-3d-bar IS-3d-bar-db"
                                                            title={`${m.label}\nDaybook: ${fmt(m.daybook_income)}`}
                                                            style={{ height: dbH, animation: `erp-slide-up .55s ease ${i * 0.05}s both` }} />
                                                    )}
                                                    {clientH > 0 && (
                                                        <div className="IS-3d-bar IS-3d-bar-client"
                                                            title={`${m.label}\nClient: ${fmt(m.client_income)}`}
                                                            style={{ height: clientH, animation: `erp-slide-up .55s ease ${i * 0.05 + 0.06}s both` }} />
                                                    )}
                                                    {clientH === 0 && dbH === 0 && (
                                                        <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,.12)', borderRadius: 4 }} />
                                                    )}
                                                </div>
                                                <div className="IS-3d-floor-line" />
                                                <div className="IS-3d-label">{m.label.replace(' ', '\n')}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            // Income End
                        )}
                    </div>
                )}

                {/* ── Tabs Start ── */}
                {data && (
                    <div className="IS-tabs">
                        {/* CLient COllections Start */}
                        <button className={`IS-tab ${tab === 'client' ? 'active' : ''}`} onClick={() => { setTab('client'); setSearch(''); }}>
                            <Icon name="client" size={14} />
                            Client Collections
                            <span className="IS-tab-badge">{data.client_collections.length}</span>
                        </button>
                        {/* Client Collections End */}

                        {/* Cash Book Income Start */}
                        <button className={`IS-tab ${tab === 'daybook' ? 'active' : ''}`} onClick={() => { setTab('daybook'); setSearch(''); }}>
                            <Icon name="daybook" size={14} />
                            Cash Book Income
                            <span className="IS-tab-badge">{data.daybook_income.length}</span>
                        </button>
                        {/* Cash Book Income End */}
                    </div>
                )}
                {/* ── Tabs End ── */}

                {/* ── Section Start ── */}
                {data && (
                    <div className="IS-section">

                        {/* Cash Book Income Entries Start */}
                        <div className="IS-sec-hdr">

                            {/* Client Collections Start */}
                            <div className="IS-sec-title">
                                <Icon name={tab === 'client' ? 'client' : 'daybook'} size={16} />
                                {tab === 'client' ? 'Client Collections' : 'Cash Book Income Entries'}
                                <span className="IS-sec-count">{tab === 'client' ? `${filteredClients.length} clients` : `${filteredDB.length} entries`}</span>
                            </div>
                            {/* Client Collections End */}

                            {/* Search Start */}
                            <div className="IS-search-wrap">
                                <span className="IS-search-ico"><Icon name="search" size={13} /></span>
                                <input className="IS-search-in" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            {/* Search End */}

                        </div>
                        {/* Cash Book Income Entries End */}

                        {/* CLIENT TAB START */}
                        {tab === 'client' && (
                            <>
                                {filteredClients.length === 0 ? (
                                    <div className="IS-empty">
                                        <Icon name="empty" size={52} />
                                        <div className="IS-empty-title">No client collections</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-4)' }}>No payments received in this period</div>
                                    </div>
                                ) : pagedClients.map((client, ci) => (
                                    <div key={client.client_id} className="IS-client-row" style={{ animation: `erp-slide-up .35s ease ${ci * 0.04}s both` }}>

                                        {/* Start Client Name  */}
                                        <div className="IS-client-hd" onClick={() => toggleExpand(client.client_id)}>
                                            <div className="IS-avatar">{client.client_name.charAt(0).toUpperCase()}</div>
                                            <div className="IS-client-info">
                                                <div className="IS-client-name">{client.client_name}</div>
                                                <div className="IS-client-meta">
                                                    {client.payments.length} payment{client.payments.length !== 1 ? 's' : ''}
                                                    {' · '}
                                                    {[...new Set(client.payments.map(p => p.project_name).filter(Boolean))].join(', ') || '—'}
                                                </div>
                                            </div>
                                            <div className="IS-client-total">{fmt(client.total)}</div>
                                            <div className={`IS-chevron ${expanded.has(client.client_id) ? 'open' : ''}`}><Icon name="chevron" size={18} /></div>
                                        </div>
                                        {/* End Client Name */}

                                        {/* Table Start */}
                                        {expanded.has(client.client_id) && (
                                            <div className="IS-pmt-wrap">
                                                <table className="IS-pmt-tbl">
                                                    <thead>
                                                        <tr><th>Date</th><th>Project</th><th>Mode</th><th>Reference</th><th>Amount</th><th>GST</th><th>Total</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {client.payments.map(p => {
                                                            const mc = MODE_COLOR[p.payment_mode] ?? '#6b7280';
                                                            return (
                                                                <tr key={p.id}>
                                                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, whiteSpace: 'nowrap' }}>{fmtDate(p.payment_date)}</td>
                                                                    <td style={{ fontWeight: 700, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_name || '—'}</td>
                                                                    <td><span className="IS-mode-chip" style={{ background: mc + '18', color: mc, border: `1px solid ${mc}35` }}>{p.mode_label}</span></td>
                                                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)' }}>{p.reference_number || '—'}</td>
                                                                    <td className="IS-amt-green">{fmt(p.amount)}</td>
                                                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)' }}>{p.gst_amount > 0 ? fmt(p.gst_amount) : '—'}</td>
                                                                    <td className="IS-amt-bold">{fmt(p.total_amount)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {/* Table End */}
                                    </div>
                                ))}

                                {filteredClients.length > 0 && (
                                    <Pagination
                                        page={clSafePage}
                                        totalPages={clTotalPages}
                                        onPageChange={setClPage}
                                        total={filteredClients.length}
                                        perPage={clPerPage}
                                        onPerPageChange={n => { setClPerPage(n); setClPage(1); }}
                                        itemLabel="clients"
                                    />
                                )}

                                {/* Total Client Income Start */}
                                <div className="IS-footer">
                                    <div className="IS-footer-info">{data.summary.payment_count} payments · {data.summary.client_count} clients</div>
                                    <div className="IS-footer-total">
                                        <span className="IS-footer-lbl">Total Client Income</span>
                                        <span className="IS-footer-val">{fmt(data.summary.total_client_income)}</span>
                                    </div>
                                </div>
                                {/* Total Client Income End */}
                            </>
                        )}
                        {/* CLIENT TAB END  */}

                        {/* DAYBOOK tab Start */}
                        {tab === 'daybook' && (
                            <>
                                {filteredDB.length === 0 ? (
                                    <div className="IS-empty">
                                        <Icon name="empty" size={52} />
                                        <div className="IS-empty-title">No income entries</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-4)' }}>No daybook income entries in this period</div>
                                    </div>
                                ) : (
                                    // Table Start
                                    <div className="IS-db-wrap">
                                        <table className="IS-db-tbl">
                                            <thead>
                                                <tr><th>S.No</th><th>Date</th><th>Account Head</th><th>Party / Client</th><th>Mode</th><th>Narration</th><th>Amount</th></tr>
                                            </thead>
                                            <tbody>
                                                {pagedDB.map((e, i) => {
                                                    const mc = MODE_COLOR[e.payment_mode] ?? '#6b7280';
                                                    return (
                                                        <tr key={e.id} style={{ animation: `erp-slide-up .3s ease ${i * 0.02}s both` }}>
                                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', width: 36 }}>{(dbSafePage - 1) * dbPerPage + i + 1}</td>
                                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, whiteSpace: 'nowrap' }}>{fmtDate(e.transaction_date)}</td>
                                                            <td>
                                                                <div className="IS-cat-chip"><Icon name="tag" size={10} />{e.category_name}</div>
                                                                {e.sub_category_name && <div style={{ fontSize: 9, color: 'var(--text-4)', marginTop: 3 }}>{e.sub_category_name}</div>}
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 800, fontSize: 11.5 }}>{e.party_name}</div>
                                                                {e.client_name && <div style={{ fontSize: 9.5, color: 'var(--text-4)', marginTop: 1 }}>{e.client_name}</div>}
                                                            </td>
                                                            <td><span className="IS-mode-chip" style={{ background: mc + '18', color: mc, border: `1px solid ${mc}35` }}>{e.payment_mode}</span></td>
                                                            <td><div className="IS-narr">{e.narration || '—'}</div></td>
                                                            <td className="IS-db-amount">{fmt(e.amount)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    // Tabs End
                                )}
                                {filteredDB.length > 0 && (
                                    <Pagination
                                        page={dbSafePage}
                                        totalPages={dbTotalPages}
                                        onPageChange={setDbPage}
                                        total={filteredDB.length}
                                        perPage={dbPerPage}
                                        onPerPageChange={n => { setDbPerPage(n); setDbPage(1); }}
                                        itemLabel="entries"
                                    />
                                )}
                                {/* Footer Start */}
                                <div className="IS-footer">
                                    <div className="IS-footer-info">{data.summary.daybook_entry_count} income entries</div>
                                    {/* Total Cash Book Income Start */}
                                    <div className="IS-footer-total">
                                        <span className="IS-footer-lbl">Total Cash Book Income</span>
                                        <span className="IS-footer-val">{fmt(data.summary.total_daybook_income)}</span>
                                    </div>
                                    {/* Total Cash Book Income End */}
                                </div>
                                {/* Footer End */}
                            </>
                        )}
                        {/* DAYBOOK tab End */}
                    </div>
                )}
                {/* Section End */}

                {/* Skeleton Start */}
                {loading && !data && (
                    <div className="IS-section">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="IS-skel" style={{ height: 54, borderRadius: 0, borderBottom: '1px solid var(--surface-2)', animationDelay: `${i * 0.08}s` }} />
                        ))}
                    </div>
                )}
                {/* Skeleton End  */}
            </div>
        </>
    );
}
