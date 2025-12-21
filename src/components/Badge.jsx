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
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-indigo-100 text-indigo-700',
        secondary: 'bg-purple-100 text-purple-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-orange-100 text-orange-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',

        // Level badges
        a1: 'bg-blue-500 text-white',
        a2: 'bg-green-500 text-white',
        b1: 'bg-orange-500 text-white',
        b2: 'bg-red-500 text-white',
        c1: 'bg-purple-500 text-white',

        // Rarity badges
        common: 'bg-gray-100 text-gray-700 border border-gray-300',
        uncommon: 'bg-green-100 text-green-700 border border-green-300',
        rare: 'bg-blue-100 text-blue-700 border border-blue-300',
        epic: 'bg-purple-100 text-purple-700 border border-purple-300',
        legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',

        // Status badges
        new: 'bg-blue-500 text-white animate-pulse',
        learning: 'bg-orange-500 text-white',
        learned: 'bg-green-500 text-white',
    };

    const sizes = {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1 font-medium rounded-full
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
