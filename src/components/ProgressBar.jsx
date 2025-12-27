// Progress Bar components - Linear and Circular
export default function ProgressBar({
    value = 0,
    max = 100,
    size = 'md',
    color = 'primary',
    showLabel = false,
    label = '',
    className = '',
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        xs: 'h-1.5',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
    };

    const colors = {
        primary: 'gradient-primary',
        secondary: 'gradient-purple',
        success: 'gradient-secondary',
        warning: 'gradient-accent',
        danger: 'gradient-danger',
        info: 'gradient-info',
        gradient: 'gradient-hero',
    };

    return (
        <div className={`w-full ${className}`}>
            {(showLabel || label) && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    {showLabel && (
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full glass rounded-full overflow-hidden ${sizes[size]} shadow-inner`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out shadow-lg ${colors[color]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// Circular Progress (Ring)
export function CircularProgress({
    value = 0,
    max = 100,
    size = 100,
    strokeWidth = 8,
    color: _color = '#6366f1', // Reserved for future custom color support
    bgColor = '#e2e8f0',
    showValue = true,
    valueLabel = '',
    subtitle = '',
    className = '',
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                className="progress-ring transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                    opacity="0.3"
                />
                {/* Progress circle with gradient */}
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out drop-shadow-lg"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-dark-text">
                        {valueLabel || `${Math.round(percentage)}%`}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-gray-500 dark:text-dark-muted">{subtitle}</span>
                    )}
                </div>
            )}
        </div>
    );
}

// Progress with Steps
export function StepProgress({
    steps = [],
    currentStep = 0,
    className = '',
}) {
    return (
        <div className={`flex items-center ${className}`}>
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    {/* Step Circle */}
                    <div
                        className={`
              flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm
              transition-colors duration-200
              ${index < currentStep
                                ? 'bg-primary-600 text-white'
                                : index === currentStep
                                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }
            `}
                    >
                        {index < currentStep ? '✓' : index + 1}
                    </div>

                    {/* Step Label */}
                    {step && (
                        <span className={`
              ml-2 text-sm hidden sm:inline
              ${index <= currentStep ? 'text-gray-900 dark:text-dark-text font-medium' : 'text-gray-500 dark:text-gray-500'}
            `}>
                            {step}
                        </span>
                    )}

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div className={`
              w-8 sm:w-16 h-1 mx-2
              ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
            `} />
                    )}
                </div>
            ))}
        </div>
    );
}

// XP Progress Bar with level info
export function XpProgressBar({
    currentXp,
    requiredXp,
    currentLevel,
    className = '',
}) {
    const percentage = (currentXp / requiredXp) * 100;

    return (
        <div className={`${className}`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text">Level {currentLevel}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-dark-muted">
                    {currentXp.toLocaleString()} / {requiredXp.toLocaleString()} XP
                </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full gradient-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
