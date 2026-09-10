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

    return (
        <div className="ERP-pg">
            <span className="ERP-pg-info">
                <strong>{start}</strong>&ndash;<strong>{end}</strong> of <strong>{total}</strong> {itemLabel}
                <span className="ERP-pg-info-sep">&middot;</span>
                Page <strong>{page}</strong> of {totalPages}
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
                    «
                </button>
                <button
                    type="button"
                    className="ERP-pg-btn"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                    title="Previous page"
                >
                    ‹
                </button>

                {nums[0] > 1 && <span className="ERP-pg-ellipsis">&hellip;</span>}
                {nums.map(n => (
                    <button
                        type="button"
                        key={n}
                        className={`ERP-pg-btn${n === page ? ' on' : ''}`}
                        onClick={() => onPageChange(n)}
                    >
                        {n}
                    </button>
                ))}
                {nums[nums.length - 1] < totalPages && <span className="ERP-pg-ellipsis">&hellip;</span>}

                <button
                    type="button"
                    className="ERP-pg-btn"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                    title="Next page"
                >
                    ›
                </button>
                <button
                    type="button"
                    className="ERP-pg-btn ERP-pg-edge"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(totalPages)}
                    aria-label="Last page"
                    title="Last page"
                >
                    »
                </button>
            </div>

            {onPerPageChange && (
                <div className="ERP-pg-per">
                    <span>Show</span>
                    <select
                        className="ERP-pg-per-sel"
                        value={perPage}
                        onChange={e => onPerPageChange(+e.target.value)}
                    >
                        {perPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>per page</span>
                </div>
            )}
        </div>
    );
}
