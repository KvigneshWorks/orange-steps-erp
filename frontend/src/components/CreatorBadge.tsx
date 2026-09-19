export default function CreatorBadge({ name }: { name?: string | null }) {
    const display = name && name.trim() ? name : '—';
    return (
        <span
            title={name ? `Created by ${name}` : 'Creator unknown'}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--text-4, #6B5D48)',
                whiteSpace: 'nowrap',
                maxWidth: 110,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
        >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
            </svg>
            {display}
        </span>
    );
}