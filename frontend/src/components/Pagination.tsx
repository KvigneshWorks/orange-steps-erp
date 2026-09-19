export default function Pagination({
    page,
    totalPages,
    onPageChange,
    total,
    perPage,
    onPerPageChange,
    perPageOptions = [10, 15, 25, 50],
    itemLabel = 'records',
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    total: number;
    perPage: number;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    itemLabel?: string;
}) {
    if (totalPages <= 1) return null;

    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    const WINDOW = 5;
    const nums: number[] = [];
    if (totalPages <= WINDOW) {
        for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
        let from = Math.max(1, page - 2);
        let to = Math.min(totalPages, from + WINDOW - 1);
        from = Math.max(1, to - WINDOW + 1);
        for (let i = from; i <= to; i++) nums.push(i);
    }

    const ChevronDouble = ({ flip }: { flip?: boolean }) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={flip ? { transform: 'rotate(180deg)' } : undefined}>
            <path d="M18.5 17 12 12l6.5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 17 5 12l6.5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const Chevron = ({ flip }: { flip?: boolean }) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={flip ? { transform: 'rotate(180deg)' } : undefined}>
            <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <div className="ERP-pg">
            <span className="ERP-pg-info">
                <span className="ERP-pg-info-range"><strong>{start}</strong>&ndash;<strong>{end}</strong></span>
                <span className="ERP-pg-info-of">of</span>
                <strong>{total}</strong> {itemLabel}
                <span className="ERP-pg-info-sep" aria-hidden="true" />
                <span className="ERP-pg-info-page">Page <strong>{page}</strong> of {totalPages}</span>
            </span>

            <div className="ERP-pg-btns">
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === 1}
                    onClick={() => onPageChange(1)}
                    aria-label="First page"
                    title="First page"
                >
                    <ChevronDouble />
                </button>
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                    title="Previous page"
                >
                    <Chevron />
                </button>

                {nums[0] > 1 && <span className="ERP-pg-ellipsis">&hellip;</span>}
                {nums.map(n => (
                    <button
                        type="button"
                        key={n}
                        className={`ERP-pg-btn${n === page ? ' on' : ''}`}
                        onClick={() => onPageChange(n)}
                        aria-current={n === page ? 'page' : undefined}
                    >
                        <span className="ERP-pg-btn-num">{n}</span>
                    </button>
                ))}
                {nums[nums.length - 1] < totalPages && <span className="ERP-pg-ellipsis">&hellip;</span>}

                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                    title="Next page"
                >
                    <Chevron flip />
                </button>
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(totalPages)}
                    aria-label="Last page"
                    title="Last page"
                >
                    <ChevronDouble flip />
                </button>
            </div>

            {onPerPageChange && (
                <div className="ERP-pg-per">
                    <span>Show</span>
                    <div className="ERP-pg-per-wrap">
                        <select
                            className="ERP-pg-per-sel"
                            value={perPage}
                            onChange={e => onPerPageChange(+e.target.value)}
                        >
                            {perPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <svg className="ERP-pg-per-chev" width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span>per page</span>
                </div>
            )}
        </div>
    );
}
