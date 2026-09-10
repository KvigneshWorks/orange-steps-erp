import React from 'react';

interface StatCardProps {
    label: React.ReactNode;
    value: React.ReactNode;
    valueStyle?: React.CSSProperties;
}

/** Canonical ERP stat tile — renders the same .ERP-stat structure used across the app. */
const StatCard: React.FC<StatCardProps> = ({ label, value, valueStyle }) => (
    <div className="ERP-stat">
        <div className="ERP-stat-accent" />
        <div className="ERP-stat-label">{label}</div>
        <div className="ERP-stat-val" style={valueStyle}>{value}</div>
    </div>
);

export default StatCard;
