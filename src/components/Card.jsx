// Reusable Card component
export default function Card({
    children,
    className = '',
    hover = false,
    padding = 'md',
    rounded = 'xl',
    shadow = 'md',
    glass = false,
    onClick,
    ...props
}) {
    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
    };

    const roundeds = {
        none: '',
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
    };

    const shadows = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50',
        lg: 'shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50',
        xl: 'shadow-2xl shadow-gray-300/50 dark:shadow-slate-900/70',
    };

    const baseStyles = glass 
        ? 'glass' 
        : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700';

    const hoverStyles = hover 
        ? 'cursor-pointer hover:shadow-2xl hover:shadow-gray-300/50 dark:hover:shadow-slate-900/70 hover:-translate-y-1 transition-all duration-300 hover:scale-[1.02]' 
        : 'transition-all duration-300';

    return (
        <div
            className={`
        ${baseStyles}
        ${paddings[padding]}
        ${roundeds[rounded]}
        ${shadows[shadow]}
        ${hoverStyles}
        ${className}
      `}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}

// Card Header
export function CardHeader({ children, className = '' }) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

// Card Title
export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
            {children}
        </h3>
    );
}

// Card Description
export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>
            {children}
        </p>
    );
}

// Card Content
export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

// Card Footer
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`mt-4 pt-4 border-t border-gray-100 dark:border-[#333] ${className}`}>
            {children}
        </div>
    );
}

// Stat Card
export function StatCard({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    trendUp = true,
    iconBgColor = 'bg-indigo-100',
    iconColor = 'text-indigo-600',
    className = ''
}) {
    return (
        <Card className={`${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`p-3 rounded-xl ${iconBgColor} dark:bg-opacity-20`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendUp ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        <span>{trendUp ? '↑' : '↓'}</span>
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
