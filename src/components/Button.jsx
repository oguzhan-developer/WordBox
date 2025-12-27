import { memo, useMemo } from 'react';

// Reusable Button component with variants
const Button = memo(function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    ariaLabel,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';

    const variants = useMemo(() => ({
        // Primary - Indigo gradient
        primary: 'gradient-primary text-white hover:shadow-lg hover:shadow-primary-500/50 focus:ring-primary-500 hover:-translate-y-0.5 active:scale-95 font-semibold',
        // Secondary - Glass with primary color
        secondary: 'glass text-primary-600 dark:text-primary-400 border-2 border-primary-500/20 hover:border-primary-500/40 hover:shadow-lg hover:shadow-primary-500/20 focus:ring-primary-500 hover:-translate-y-0.5',
        // Ghost - Subtle
        ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 focus:ring-gray-500 backdrop-blur-sm',
        // Danger - Rose gradient
        danger: 'gradient-danger text-white hover:shadow-lg hover:shadow-danger-500/50 focus:ring-danger-500 hover:-translate-y-0.5 active:scale-95',
        // Success - Emerald gradient
        success: 'gradient-secondary text-white hover:shadow-lg hover:shadow-secondary-500/50 focus:ring-secondary-500 hover:-translate-y-0.5 active:scale-95',
        // Warning - Amber/Orange gradient
        warning: 'gradient-accent text-white hover:shadow-lg hover:shadow-accent-500/50 focus:ring-accent-500 hover:-translate-y-0.5 active:scale-95',
        // Info - Sky gradient
        info: 'gradient-info text-white hover:shadow-lg hover:shadow-info-500/50 focus:ring-info-500 hover:-translate-y-0.5 active:scale-95',
        // Outline - Border only
        outline: 'bg-transparent border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 focus:ring-gray-500 backdrop-blur-sm',
    }), []);

    const sizes = useMemo(() => ({
        xs: 'px-3 py-1.5 text-xs gap-1.5',
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-6 py-2.5 text-sm gap-2',
        lg: 'px-8 py-3 text-base gap-2.5',
        xl: 'px-10 py-4 text-lg gap-3',
    }), []);

    const iconSizes = useMemo(() => ({
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6',
    }), []);

    const buttonClasses = useMemo(() => `
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
    `.trim(), [variant, size, fullWidth, className, baseStyles, variants, sizes]);

    return (
        <button
            className={buttonClasses}
            disabled={disabled || loading}
            aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
            aria-busy={loading}
            aria-disabled={disabled}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className={`animate-spin ${iconSizes[size]}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Yükleniyor...</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} aria-hidden="true" />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} aria-hidden="true" />}
                </>
            )}
        </button>
    );
});

export default Button;

// Icon Button variant
export const IconButton = memo(function IconButton({
    icon: IconComponent,
    variant = 'ghost',
    size = 'md',
    className = '',
    ariaLabel,
    ...props
}) {
    const sizes = useMemo(() => ({
        xs: 'p-1',
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
        xl: 'p-4',
    }), []);

    const iconSizes = useMemo(() => ({
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-7 h-7',
    }), []);

    const variants = useMemo(() => ({
        primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary: 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        danger: 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20',
        success: 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20',
    }), []);

    const buttonClasses = useMemo(() => `
        rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 active:scale-95
        ${variants[variant]}
        ${sizes[size]}
        ${className}
    `.trim(), [variant, size, className, variants, sizes]);

    return (
        <button
            className={buttonClasses}
            aria-label={ariaLabel}
            {...props}
        >
            <IconComponent className={iconSizes[size]} aria-hidden="true" />
        </button>
    );
});
