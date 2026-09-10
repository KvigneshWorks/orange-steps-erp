import React from 'react';

interface BadgeProps {
    variant?: 'income' | 'expense' | 'active' | 'inactive' | 'cat' | 'sub' | 'id-pill';
    children: React.ReactNode;
    className?: string;
    dot?: boolean;
}

/** Canonical ERP badge — renders the same .ERP-badge classes used across the app. */
const Badge: React.FC<BadgeProps> = ({ variant = 'active', children, className = '', dot = true }) => (
    <span className={`ERP-badge ${variant} ${className}`.trim()}>
        {dot && <span className="ERP-badge-dot" />}
        {children}
    </span>
);

export default Badge;

interface TagProps {
    variant?: 'success' | 'danger' | 'info' | 'warn' | 'ember' | 'muted';
    children: React.ReactNode;
    className?: string;
}

/** Plain colored text tag — renders the same .MD-tbl-tag classes used in master-data tables. */
export const Tag: React.FC<TagProps> = ({ variant = 'muted', children, className = '' }) => (
    <span className={`MD-tbl-tag ${variant} ${className}`.trim()}>{children}</span>
);
