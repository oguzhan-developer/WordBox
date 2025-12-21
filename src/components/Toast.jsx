import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast types configuration with dark mode support
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-500 dark:text-green-400',
        textColor: 'text-green-800 dark:text-green-200',
        role: 'status',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-500 dark:text-red-400',
        textColor: 'text-red-800 dark:text-red-200',
        role: 'alert',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        iconColor: 'text-orange-500 dark:text-orange-400',
        textColor: 'text-orange-800 dark:text-orange-200',
        role: 'alert',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-500 dark:text-blue-400',
        textColor: 'text-blue-800 dark:text-blue-200',
        role: 'status',
    },
    xp: {
        icon: null,
        bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        role: 'status',
    },
};

// Individual Toast component
function Toast({ id, type = 'info', message, onClose, duration = 3000 }) {
    const [isExiting, setIsExiting] = useState(false);
    const config = toastConfig[type] || toastConfig.info;
    const Icon = config.icon;

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match animation duration
    }, [id, onClose]);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, handleClose]);

    return (
        <div
            role={config.role}
            aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={`
        flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        ${isExiting ? 'animate-slideUp' : 'animate-slideDown'}
        min-w-[300px] max-w-md
        transition-all duration-300
      `}
        >
            {type === 'xp' ? (
                <span className="text-2xl" role="img" aria-label="star">⭐</span>
            ) : Icon ? (
                <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} aria-hidden="true" />
            ) : null}

            <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
                {message}
            </p>

            <button
                onClick={handleClose}
                aria-label="Bildirimi kapat"
                className={`p-1 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${config.iconColor}`}
            >
                <X className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    );
}

// Toast Container
export function ToastContainer({ toasts, removeToast }) {
    return (
        <div 
            className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none"
            aria-label="Bildirimler"
        >
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        {...toast}
                        onClose={removeToast}
                    />
                </div>
            ))}
        </div>
    );
}

// Toast Provider
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random(); // More unique ID
        setToasts((prev) => {
            // Limit to max 5 toasts
            const newToasts = [...prev, { id, message, type, duration }];
            return newToasts.slice(-5);
        });
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Convenience methods
    const toast = useCallback({
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        xp: (amount) => addToast(`+${amount} XP kazandın!`, 'xp', 3000),
    }, [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default Toast;
