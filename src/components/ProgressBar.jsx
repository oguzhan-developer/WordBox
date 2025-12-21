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
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-5',
    };

    const colors = {
        primary: 'bg-indigo-600',
        secondary: 'bg-purple-600',
        success: 'bg-green-500',
        warning: 'bg-orange-500',
        danger: 'bg-red-500',
        gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    };

    return (
        <div className={`w-full ${className}`}>
            {(showLabel || label) && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{label}</span>
                    {showLabel && (
                        <span className="text-sm font-medium text-gray-900">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
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
    color = '#4F46E5',
    bgColor = '#E5E7EB',
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
                className="progress-ring"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">
                        {valueLabel || `${Math.round(percentage)}%`}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-gray-500">{subtitle}</span>
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
                                ? 'bg-indigo-600 text-white'
                                : index === currentStep
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                    : 'bg-gray-200 text-gray-500'
                            }
            `}
                    >
                        {index < currentStep ? '✓' : index + 1}
                    </div>

                    {/* Step Label */}
                    {step && (
                        <span className={`
              ml-2 text-sm hidden sm:inline
              ${index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'}
            `}>
                            {step}
                        </span>
                    )}

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div className={`
              w-8 sm:w-16 h-1 mx-2
              ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}
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
                    <span className="text-sm font-medium text-gray-900">Level {currentLevel}</span>
                </div>
                <span className="text-sm text-gray-500">
                    {currentXp.toLocaleString()} / {requiredXp.toLocaleString()} XP
                </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
