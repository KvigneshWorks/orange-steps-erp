import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** Canonical ERP native select — renders the same .ERP-select class used across the app. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', children, ...props }, ref) => (
    <select ref={ref} className={`ERP-select ${className}`.trim()} {...props}>
        {children}
    </select>
));
Select.displayName = 'Select';

export default Select;
