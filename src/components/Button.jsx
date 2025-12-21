// Reusable Button component with variants
export default function Button({
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
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'gradient-primary text-white hover:opacity-90 focus:ring-indigo-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
        secondary: 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:ring-indigo-500',
        ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md active:scale-95',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-md active:scale-95',
        warning: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md active:scale-95',
        outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500',
    };

    const sizes = {
        xs: 'px-2 py-1 text-xs gap-1',
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
        xl: 'px-8 py-4 text-lg gap-3',
    };

    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6',
    };

    return (
        <button
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
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
                    {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
                </>
            )}
        </button>
    );
}

// Icon Button variant
export function IconButton({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    className = '',
    ariaLabel,
    ...props
}) {
    const sizes = {
        xs: 'p-1',
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
        xl: 'p-4',
    };

    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-7 h-7',
    };

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
        secondary: 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
    };

    return (
        <button
            className={`
        rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 active:scale-95
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            aria-label={ariaLabel}
            {...props}
        >
            <Icon className={iconSizes[size]} aria-hidden="true" />
        </button>
    );
}
