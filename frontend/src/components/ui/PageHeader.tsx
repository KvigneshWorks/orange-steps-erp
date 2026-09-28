import React from 'react';

interface PageHeaderProps {
    eyebrow: React.ReactNode;
    title: React.ReactNode;
    titleEm?: React.ReactNode;
    /** Extra class on the <h1>, e.g. "MD-page-title" for the upright-caps master-data variant. */
    titleClassName?: string;
    /** Optional primary action (e.g. an "Add …" button) rendered on the right,
     *  same row as the eyebrow/title — mirrors the direct .ERP-hdr markup used
     *  on pages that don't go through this component. Omit for a plain header. */
    right?: React.ReactNode;
}

/**
 * Canonical ERP page header — eyebrow + title, plus an optional right-side
 * action. Deliberately does not support a subtitle or status badge: every
 * page header in the app renders identically, so add page-specific info in
 * the page body, not the header.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, titleEm, titleClassName = '', right }) => (
    <div className="ERP-hdr">
        <div className="ERP-hdr-left">
            <div className="ERP-eyebrow">
                <span className="ERP-eyebrow-line" />
                <span className="ERP-eyebrow-dot" />
                {eyebrow}
            </div>
            <h1 className={`ERP-title ${titleClassName}`.trim()}>
                {title} {titleEm && <span className="ERP-title-em">{titleEm}</span>}
            </h1>
        </div>
        {right && <div className="ERP-hdr-right">{right}</div>}
    </div>
);

export default PageHeader;
