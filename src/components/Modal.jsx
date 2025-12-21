import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

// Focus trap utility
const useFocusTrap = (isOpen, modalRef) => {
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const modal = modalRef.current;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        modal.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => {
            modal.removeEventListener('keydown', handleTab);
        };
    }, [isOpen, modalRef]);
};

// Modal component with overlay
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlay = true,
    className = '',
    id,
}) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Focus trap
    useFocusTrap(isOpen, modalRef);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open & restore focus
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Restore focus to element that opened modal
            if (previousActiveElement.current && previousActiveElement.current.focus) {
                previousActiveElement.current.focus();
            }
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = useCallback((e) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
        }
    }, [closeOnOverlay, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full mx-4',
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={id ? `${id}-title` : undefined}
            aria-describedby={id ? `${id}-description` : undefined}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={handleOverlayClick}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`
          relative w-full ${sizes[size]} bg-white dark:bg-[#27272a] rounded-2xl shadow-2xl
          animate-slideUp
          ${className}
        `}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-[#333]">
                        {title && (
                            <h2 
                                id={id ? `${id}-title` : undefined}
                                className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white"
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                aria-label="Modalı kapat"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div 
                    id={id ? `${id}-description` : undefined}
                    className="p-4 sm:p-6"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

// Confirmation Modal
export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Emin misiniz?',
    message = 'Bu işlemi geri alamazsınız.',
    confirmText = 'Onayla',
    cancelText = 'İptal',
    variant = 'danger', // danger, warning, info
}) {
    const variants = {
        danger: {
            icon: '⚠️',
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: '⚡',
            buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        },
        info: {
            icon: 'ℹ️',
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        },
    };

    const { icon, buttonClass } = variants[variant];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${buttonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// Success Modal (for achievements, completions, etc.)
export function SuccessModal({
    isOpen,
    onClose,
    title = 'Tebrikler! 🎉',
    message,
    xpEarned,
    badge,
    buttonText = 'Harika!',
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                {message && <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>}

                {/* XP Display */}
                {xpEarned && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold mb-4">
                        <span>+{xpEarned}</span>
                        <span>XP</span>
                    </div>
                )}

                {/* Badge Display */}
                {badge && (
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl mb-4">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="font-medium text-gray-900 dark:text-white">{badge.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{badge.description}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                    {buttonText}
                </button>
            </div>
        </Modal>
    );
}
