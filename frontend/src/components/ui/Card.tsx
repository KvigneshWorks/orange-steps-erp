import React from 'react';

interface FormCardProps {
    icon: React.ReactNode;
    title: React.ReactNode;
    desc?: React.ReactNode;
    headerExtra?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** 'md' applies the master-data upright-title modifier classes (.MD-form-hdr etc). */
    variant?: 'default' | 'md';
}

/** Canonical ERP form card — renders the same .ERP-form-card structure used across the app. */
export const FormCard: React.FC<FormCardProps> = ({ icon, title, desc, headerExtra, children, className = '', variant = 'default' }) => {
    const md = variant === 'md';
    return (
        <div className={`ERP-form-card ${className}`.trim()}>
            <div className="ERP-form-topbar" />
            <div className="ERP-form-body">
                <div className={`ERP-form-hdr${md ? ' MD-form-hdr' : ''}`}>
                    <div className={`ERP-form-icon-wrap${md ? ' MD-form-icon-wrap' : ''}`}>{icon}</div>
                    <div>
                        <div className={`ERP-form-title${md ? ' MD-form-title' : ''}`}>{title}</div>
                        {desc && <div className="ERP-form-desc">{desc}</div>}
                    </div>
                    {headerExtra}
                </div>
                {md && <div className="MD-form-divider" />}
                {children}
            </div>
        </div>
    );
};

interface TableCardProps {
    /** Omit entirely to render a plain table card with no header row (the standard for master-data tables). */
    title?: React.ReactNode;
    sub?: React.ReactNode;
    count?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** 'md' applies the master-data table modifier classes (.MD-tbl-card). */
    variant?: 'default' | 'md';
}

/** Canonical ERP table card — renders the same .ERP-tbl-card structure used across the app. */
export const TableCard: React.FC<TableCardProps> = ({ title, sub, count, children, className = '', variant = 'default' }) => {
    const md = variant === 'md';
    return (
        <div className={`ERP-tbl-card ${md ? 'MD-tbl-card ' : ''}${className}`.trim()}>
            {title && (
                <div className="ERP-tbl-hdr">
                    <div>
                        <div className={`ERP-tbl-title${md ? ' MD-tbl-title' : ''}`}>{title}</div>
                        {sub && <div className="ERP-tbl-sub">{sub}</div>}
                    </div>
                    {count !== undefined && <div className="ERP-tbl-count">{count}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default { FormCard, TableCard };
