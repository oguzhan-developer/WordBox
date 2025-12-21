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
        primary: 'glass text-indigo-700 dark:text-indigo-400 shadow-md shadow-indigo-500/20',
        secondary: 'glass text-purple-700 dark:text-purple-400 shadow-md shadow-purple-500/20',
        success: 'glass text-green-700 dark:text-green-400 shadow-md shadow-green-500/20',
        warning: 'glass text-orange-700 dark:text-orange-400 shadow-md shadow-orange-500/20',
        danger: 'glass text-red-700 dark:text-red-400 shadow-md shadow-red-500/20',
        info: 'glass text-blue-700 dark:text-blue-400 shadow-md shadow-blue-500/20',

        // Level badges
        a1: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50',
        a2: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50',
        b1: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/50',
        b2: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/50',
        c1: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50',

        // Rarity badges
        common: 'glass text-gray-700 dark:text-gray-300 border border-gray-300/30',
        uncommon: 'glass text-green-700 dark:text-green-400 border border-green-500/30 shadow-green-500/20',
        rare: 'glass text-blue-700 dark:text-blue-400 border border-blue-500/30 shadow-blue-500/20',
        epic: 'glass text-purple-700 dark:text-purple-400 border border-purple-500/30 shadow-purple-500/20',
        legendary: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50 animate-pulse',

        // Status badges
        new: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50',
        learning: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/50',
        learned: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50',
    };

    const sizes = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-sm',
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
                <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-green-500' :
                        variant === 'warning' ? 'bg-orange-500' :
                            variant === 'danger' ? 'bg-red-500' :
                                'bg-current'
                    }`} />
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

// Category Badge
export function CategoryBadge({ category, className = '' }) {
    const categoryColors = {
        'Technology': 'bg-blue-100 text-blue-700',
        'Teknoloji': 'bg-blue-100 text-blue-700',
        'Environment': 'bg-green-100 text-green-700',
        'Çevre': 'bg-green-100 text-green-700',
        'Science': 'bg-purple-100 text-purple-700',
        'Bilim': 'bg-purple-100 text-purple-700',
        'Health': 'bg-red-100 text-red-700',
        'Sağlık': 'bg-red-100 text-red-700',
        'Sports': 'bg-orange-100 text-orange-700',
        'Spor': 'bg-orange-100 text-orange-700',
        'Business': 'bg-indigo-100 text-indigo-700',
        'İş': 'bg-indigo-100 text-indigo-700',
        'General': 'bg-gray-100 text-gray-700',
        'Education': 'bg-yellow-100 text-yellow-700',
    };

    return (
        <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
      ${categoryColors[category] || 'bg-gray-100 text-gray-700'}
      ${className}
    `}>
            {category}
        </span>
    );
}

// XP Badge
export function XpBadge({ amount, className = '' }) {
    return (
        <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
      bg-gradient-to-r from-yellow-400 to-orange-500 text-white
      ${className}
    `}>
            <span>+{amount}</span>
            <span>XP</span>
        </span>
    );
}
