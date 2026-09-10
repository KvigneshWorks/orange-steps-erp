export default function RunningLoader({ label = 'Loading Records' }: { label?: string }) {
    return (
        // Wrap Start
        <div className="RL-wrap">
            <div className="RL-track">
                <div className="RL-runner">
                    <svg className="RL-flip" width="70" height="76" viewBox="-35 0 100 83" fill="none" style={{ overflow: 'visible' }}>
                        <g className="RL-run-lines" opacity="0.55" stroke="var(--ember-light,#F5A623)" strokeWidth="3.1" strokeLinecap="round">
                            <line className="RL-line l1" x1="-30" y1="32.5" x2="-10" y2="32.5" />
                            <line className="RL-line l2" x1="-25" y1="42.5" x2="-10" y2="42.5" />
                            <line className="RL-line l3" x1="-20" y1="52.5" x2="-10" y2="52.5" />
                        </g>

                        <g className="RL-figure">
                            <g transform="translate(14,22.5)">
                                <g className="RL-arm-back">
                                    <line x1="0" y1="0" x2="-16.3" y2="12.5" stroke="var(--ember)" strokeWidth="9.4" strokeLinecap="round" />
                                    <circle cx="-16.3" cy="12.5" r="4.7" fill="var(--ember)" />
                                </g>
                            </g>

                            <g transform="translate(14,47.5)">
                                <g className="RL-leg-back">
                                    <line x1="0" y1="0" x2="-17.5" y2="22.5" stroke="var(--ember)" strokeWidth="10.6" strokeLinecap="round" />
                                    <circle cx="-17.5" cy="22.5" r="5.4" fill="var(--ember)" />
                                </g>
                            </g>

                            <g transform="rotate(8,14,35)">
                                <line x1="14" y1="18.8" x2="14" y2="48.8" stroke="var(--ember)" strokeWidth="11.9" strokeLinecap="round" />
                            </g>

                            <circle cx="15" cy="8.1" r="10.6" fill="var(--ember)" />
                            <g transform="translate(14,47.5)">
                                <g className="RL-leg-front">
                                    <line x1="0" y1="0" x2="18.8" y2="20" stroke="var(--ember)" strokeWidth="11.3" strokeLinecap="round" />
                                    <circle cx="18.8" cy="20" r="5.7" fill="var(--ember)" />
                                </g>
                            </g>

                            <g transform="translate(14,22.5)">
                                <g className="RL-arm-front">
                                    <line x1="0" y1="0" x2="16.3" y2="10" stroke="var(--ember)" strokeWidth="10" strokeLinecap="round" />
                                    <circle cx="16.3" cy="10" r="4.9" fill="var(--ember)" />
                                </g>
                            </g>

                        </g>
                    </svg>
                </div>
            </div>

            {/* Dots Start */}
            <div className="RL-title">
                {label}
                <span className="RL-dots"><span /><span /><span /></span>
            </div>
            {/* Dots End */}
        </div>
        // Wrap End
    );
}