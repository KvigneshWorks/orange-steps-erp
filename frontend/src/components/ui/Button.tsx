import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
    loading?: boolean;
    loadingText?: React.ReactNode;
    children?: React.ReactNode;
}

/** Canonical ERP button — renders the same .ERP-btn classes used across the app. */
const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    icon,
    loading = false,
    loadingText,
    children,
    className = '',
    disabled,
    type = 'button',
    ...props
}) => {
    return (
        <button
            type={type}
            className={`ERP-btn ${variant} ${className}`.trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading
                ? <><span className="ERP-spinner" /> {loadingText ?? children}</>
                : <>{icon}{children}</>}
        </button>
    );
};

export default Button;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'edit' | 'delete';
    icon: React.ReactNode;
}

/** Icon-only row-action button — renders the same .MD-act-ico classes used in table rows. */
export const IconButton: React.FC<IconButtonProps> = ({ variant = 'edit', icon, className = '', ...props }) => (
    <button className={`MD-act-ico ${variant} ${className}`.trim()} {...props}>
        {icon}
    </button>
);
