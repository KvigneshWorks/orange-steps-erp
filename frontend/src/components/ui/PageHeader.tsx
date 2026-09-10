import React from 'react';

interface PageHeaderProps {
    eyebrow: React.ReactNode;
    title: React.ReactNode;
    titleEm?: React.ReactNode;
    /** Extra class on the <h1>, e.g. "MD-page-title" for the upright-caps master-data variant. */
    titleClassName?: string;
}

/**
 * Canonical ERP page header — eyebrow + title only, same size everywhere.
 * Deliberately does not support a subtitle or status badge: every page header
 * in the app renders identically, so add page-specific info in the page body,
 * not the header.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, titleEm, titleClassName = '' }) => (
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
    </div>
);

export default PageHeader;
