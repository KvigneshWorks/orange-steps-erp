import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Canonical ERP textarea — renders the same .ERP-textarea class used across the app. */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', autoComplete = 'off', ...props }, ref) => (
    <textarea ref={ref} className={`ERP-textarea ${className}`.trim()} autoComplete={autoComplete} {...props} />
));
Textarea.displayName = 'Textarea';

export default Textarea;
