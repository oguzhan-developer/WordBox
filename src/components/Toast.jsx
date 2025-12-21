import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast types configuration
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500',
        textColor: 'text-green-800',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        textColor: 'text-red-800',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-500',
        textColor: 'text-orange-800',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-800',
    },
    xp: {
        icon: null,
        bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-800',
    },
};

// Individual Toast component
function Toast({ id, type = 'info', message, onClose, duration = 3000 }) {
    const config = toastConfig[type] || toastConfig.info;
    const Icon = config.icon;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <div
            className={`
        flex items-center gap-3 p-4 rounded-xl border shadow-lg
        ${config.bgColor} ${config.borderColor}
        animate-slideDown
        min-w-[300px] max-w-md
      `}
        >
            {type === 'xp' ? (
                <span className="text-2xl">⭐</span>
            ) : Icon ? (
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
            ) : null}

            <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
                {message}
            </p>

            <button
                onClick={() => onClose(id)}
                className={`p-1 rounded-lg hover:bg-white/50 transition-colors ${config.textColor}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Toast Container
export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
}

// Toast Provider
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Convenience methods
    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        xp: (amount) => addToast(`+${amount} XP kazandın!`, 'xp', 3000),
    };

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
