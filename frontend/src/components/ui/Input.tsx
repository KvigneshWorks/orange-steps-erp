import React from 'react';

interface FieldWrapProps {
    label?: React.ReactNode;
    optional?: boolean;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    children: React.ReactNode;
}

/** Shared .ERP-field/.ERP-label wrapper used by Input, Select and Textarea below. */
export const Field: React.FC<FieldWrapProps> = ({ label, optional, hint, error, children }) => (
    <div className={`ERP-field${error ? ' MD-field-error' : ''}`}>
        {label && (
            <label className={`ERP-label${optional ? '' : ' req'}`}>
                {label}
                {optional && <span className="ERP-label-opt">(optional)</span>}
            </label>
        )}
        {children}
        {hint && !error && <span className="ERP-hint">{hint}</span>}
        {error && <div className="MD-field-error-msg">{error}</div>}
    </div>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Canonical ERP text input — renders the same .ERP-input class used across the app. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', autoComplete = 'off', ...props }, ref) => (
    <input ref={ref} className={`ERP-input ${className}`.trim()} autoComplete={autoComplete} {...props} />
));
Input.displayName = 'Input';

export default Input;
