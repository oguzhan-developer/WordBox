import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast types configuration with dark mode support
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'glass-strong',
        borderColor: 'border-green-500/30',
        iconColor: 'text-green-500 dark:text-green-400',
        textColor: 'text-green-800 dark:text-green-200',
        role: 'status',
        gradient: 'from-green-500/10 to-emerald-500/10',
    },
    error: {
        icon: XCircle,
        bgColor: 'glass-strong',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-500 dark:text-red-400',
        textColor: 'text-red-800 dark:text-red-200',
        role: 'alert',
        gradient: 'from-red-500/10 to-rose-500/10',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'glass-strong',
        borderColor: 'border-orange-500/30',
        iconColor: 'text-orange-500 dark:text-orange-400',
        textColor: 'text-orange-800 dark:text-orange-200',
        role: 'alert',
        gradient: 'from-orange-500/10 to-amber-500/10',
    },
    info: {
        icon: Info,
        bgColor: 'glass-strong',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-500 dark:text-blue-400',
        textColor: 'text-blue-800 dark:text-blue-200',
        role: 'status',
        gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    xp: {
        icon: null,
        bgColor: 'glass-strong bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        role: 'status',
        gradient: 'from-yellow-500/20 to-orange-500/20',
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
        flex items-center gap-3 p-4 rounded-2xl border shadow-2xl
        ${config.bgColor} ${config.borderColor}
        ${isExiting ? 'animate-slideUp' : 'animate-slideDown'}
        min-w-[320px] max-w-md
        transition-all duration-300 hover:scale-105
      `}
        >
            {type === 'xp' ? (
                <div className="size-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl" role="img" aria-label="star">⭐</span>
                </div>
            ) : Icon ? (
                <div className={`size-10 rounded-xl glass flex items-center justify-center ${config.iconColor} shadow-lg`}>
                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                </div>
            ) : null}

            <p className={`flex-1 text-sm font-semibold ${config.textColor}`}>
                {message}
            </p>

            <button
                onClick={handleClose}
                aria-label="Bildirimi kapat"
                className={`size-8 rounded-xl glass hover:bg-red-500/10 transition-all hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 ${config.iconColor}`}
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
            className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none"
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
    const toast = useMemo(() => ({
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        xp: (amount) => addToast(`+${amount} XP kazandın!`, 'xp', 3000),
    }), [addToast]);

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
