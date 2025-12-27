// Badge component for levels, status, and labels
export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    icon: Icon,
    dot = false,
}) {
    const variants = {
        default: 'glass text-gray-700 dark:text-gray-300 shadow-md',
        primary: 'glass text-primary-600 dark:text-primary-400 shadow-md shadow-primary-500/20',
        secondary: 'glass text-secondary-600 dark:text-secondary-400 shadow-md shadow-secondary-500/20',
        success: 'glass text-secondary-600 dark:text-secondary-400 shadow-md shadow-secondary-500/20',
        warning: 'glass text-accent-600 dark:text-accent-400 shadow-md shadow-accent-500/20',
        danger: 'glass text-danger-600 dark:text-danger-400 shadow-md shadow-danger-500/20',
        info: 'glass text-info-600 dark:text-info-400 shadow-md shadow-info-500/20',

        // Level badges - Using consistent color palette
        a1: 'bg-gradient-to-r from-info-500 to-info-600 text-white shadow-lg shadow-info-500/30',
        a2: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/30',
        b1: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30',
        b2: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-500/30',
        c1: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',

        // Rarity badges
        common: 'glass text-gray-700 dark:text-gray-300 border border-gray-300/30',
        uncommon: 'glass text-secondary-600 dark:text-secondary-400 border border-secondary-500/30 shadow-secondary-500/20',
        rare: 'glass text-info-600 dark:text-info-400 border border-info-500/30 shadow-info-500/20',
        epic: 'glass text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-purple-500/20',
        legendary: 'bg-gradient-to-r from-accent-400 via-warning-500 to-accent-600 text-white shadow-lg shadow-accent-500/50 animate-pulse',

        // Status badges - Using consistent color palette
        new: 'bg-gradient-to-r from-info-500 to-info-600 text-white shadow-lg shadow-info-500/30',
        learning: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30',
        learned: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/30',
    };

    const sizes = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-sm',
    };

    const dotColors = {
        success: 'bg-secondary-500',
        warning: 'bg-accent-500',
        danger: 'bg-danger-500',
        info: 'bg-info-500',
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        default: 'bg-current',
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-bold rounded-full transition-all hover:scale-105
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />
            )}
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
}

// Level Badge specifically for English levels
export function LevelBadge({ level, size = 'md', className = '' }) {
    const levelLower = level.toLowerCase();
    return (
        <Badge variant={levelLower} size={size} className={className}>
            {level}
        </Badge>
    );
}

// Status Badge for word learning status
export function StatusBadge({ status, size = 'sm', className = '' }) {
    const statusLabels = {
        new: 'Yeni',
        learning: 'Öğreniliyor',
        learned: 'Öğrenildi',
    };

    return (
        <Badge variant={status} size={size} className={className}>
            {statusLabels[status] || status}
        </Badge>
    );
}

// Category Badge - Using consistent colors
export function CategoryBadge({ category, className = '' }) {
    const categoryColors = {
        'Technology': 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
        'Teknoloji': 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
        'Environment': 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
        'Çevre': 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
        'Science': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Bilim': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Health': 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
        'Sağlık': 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
        'Sports': 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
        'Spor': 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
        'Business': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
        'İş': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
        'General': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        'Education': 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
        'Eğitim': 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    };

    return (
        <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
      ${categoryColors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}
      ${className}
    `}>
            {category}
        </span>
    );
}

// XP Badge - Using accent color
export function XpBadge({ amount, className = '' }) {
    return (
        <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
      bg-gradient-to-r from-accent-400 to-accent-600 text-white shadow-lg shadow-accent-500/30
      ${className}
    `}>
            <span>+{amount}</span>
            <span>XP</span>
        </span>
    );
}
