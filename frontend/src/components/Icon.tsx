import React from 'react';

export function Ic({ d, sz = 18, c = 'currentColor', sw = 1.8 }: { d: string; sz?: number; c?: string; sw?: number }) {
    return (
        <svg width={sz} height={sz} fill="none" stroke={c} strokeWidth={sw} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

export default Ic;
