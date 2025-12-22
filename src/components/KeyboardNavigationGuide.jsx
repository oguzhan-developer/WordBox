import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Keyboard, Navigation, Focus, Accessibility } from 'lucide-react';

/**
 * Keyboard Navigation Guide - Interactive walkthrough for keyboard users
 * Shows how to navigate the app using keyboard only
 */

const GUIDE_STEPS = [
    {
        id: 'welcome',
        title: 'Klavye Navigasyonu Rehberi',
        description: 'Bu rehber, WordBox uygulamasını sadece klavye kullanarak nasıl gezebileceğinizi gösterir.',
        icon: Keyboard,
        tips: [
            'Tab tuşu ile öğeler arasında ilerleyebilirsiniz',
            'Shift + Tab ile geriye gidebilirsiniz',
            'Enter veya Boşluk ile öğeleri seçebilirsiniz',
            'Escape tuşu ile modalları kapatabilirsiniz'
        ]
    },
    {
        id: 'navigation',
        title: 'Sayfa Navigasyonu',
        description: 'Sayfalar arasında hızlıca geçiş yapmak için kısayolları kullanabilirsiniz.',
        icon: Navigation,
        tips: [
            'G + H → Ana Sayfa',
            'G + L → Kütüphane',
            'G + P → Pratik',
            'G + V → Kelimelerim',
            'G + S → Ayarlar'
        ],
        shortcut: 'G + tuş'
    },
    {
        id: 'focus',
        title: 'Odaklanma ve Seçim',
        description: 'Öğelere odaklanmak ve seçim yapmak için bu tuşları kullanın.',
        icon: Focus,
        tips: [
            'Tab → Sonraki öğeye git',
            'Shift + Tab → Önceki öğeye git',
            'Enter → Öğeyi seç/aç',
            'Boşluk → Toggle/seç',
            'Escape → İptal/kapat'
        ]
    },
    {
        id: 'accessibility',
        title: 'Erişilebilirlik Özellikleri',
        description: 'WordBox, tam erişilebilirlik desteği sunar.',
        icon: Accessibility,
        tips: [
            'Skip to Content linki ile içeriğe atlayın',
            'Ctrl + D ile tema değiştirin',
            'Shift + ? ile kısayol listesini görün',
            'Tüm görseller açıklama içerir',
            'Ekran okuyucu desteği mevcuttur'
        ]
    }
];

export default function KeyboardNavigationGuide({ isOpen, onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    // Track if user has seen guide (for marking as seen)
    const hasSeenGuideRef = useRef(false);
    
    const step = GUIDE_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === GUIDE_STEPS.length - 1;
    
    // Check if user has seen the guide on mount
    useEffect(() => {
        const seen = localStorage.getItem('wordbox-keyboard-guide-seen');
        hasSeenGuideRef.current = seen === 'true';
    }, []);
    
    // Mark guide as seen
    const markAsSeen = useCallback(() => {
        localStorage.setItem('wordbox-keyboard-guide-seen', 'true');
        hasSeenGuideRef.current = true;
    }, []);
    
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowRight':
            case 'Enter':
                if (!isLastStep) {
                    setCurrentStep(prev => prev + 1);
                } else {
                    markAsSeen();
                    onComplete?.();
                    onClose();
                }
                break;
            case 'ArrowLeft':
                if (!isFirstStep) {
                    setCurrentStep(prev => prev - 1);
                }
                break;
        }
    }, [isOpen, isFirstStep, isLastStep, onClose, onComplete, markAsSeen]);
    
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);
    
    // Reset step when opened - use callback to avoid direct setState in effect
    const resetStep = useCallback(() => {
        setCurrentStep(0);
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            // Use setTimeout to move setState out of effect synchronous flow
            const timer = setTimeout(resetStep, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, resetStep]);
    
    if (!isOpen) return null;
    
    const IconComponent = step.icon;
    
    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            aria-describedby="guide-description"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1a1a18] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-white/10">
                {/* Progress bar */}
                <div className="h-1 bg-gray-100 dark:bg-white/10">
                    <div 
                        className="h-full bg-gradient-to-r from-brand-purple to-brand-blue transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / GUIDE_STEPS.length) * 100}%` }}
                    />
                </div>
                
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
                    aria-label="Rehberi kapat"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
                
                {/* Content */}
                <div className="p-8">
                    {/* Step indicator */}
                    <div className="flex justify-center gap-2 mb-6">
                        {GUIDE_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`size-2.5 rounded-full transition-all ${
                                    index === currentStep 
                                        ? 'bg-brand-purple w-8' 
                                        : index < currentStep 
                                            ? 'bg-brand-purple/50' 
                                            : 'bg-gray-200 dark:bg-white/20'
                                }`}
                                aria-label={`Adım ${index + 1}`}
                                aria-current={index === currentStep ? 'step' : undefined}
                            />
                        ))}
                    </div>
                    
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="size-20 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center shadow-lg shadow-brand-purple/30">
                            <IconComponent className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    
                    {/* Title & Description */}
                    <h2 
                        id="guide-title" 
                        className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3"
                    >
                        {step.title}
                    </h2>
                    <p 
                        id="guide-description"
                        className="text-center text-gray-600 dark:text-gray-400 mb-6"
                    >
                        {step.description}
                    </p>
                    
                    {/* Tips */}
                    <div className="space-y-3 mb-8">
                        {step.tips.map((tip, index) => (
                            <div 
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5"
                            >
                                <div className="size-8 rounded-lg bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-brand-purple">{index + 1}</span>
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {tip.includes('→') ? (
                                        <>
                                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-white/10 rounded mr-2">
                                                {tip.split('→')[0].trim()}
                                            </kbd>
                                            {tip.split('→')[1]}
                                        </>
                                    ) : tip}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            disabled={isFirstStep}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                isFirstStep 
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Geri
                        </button>
                        
                        <span className="text-sm text-gray-400">
                            {currentStep + 1} / {GUIDE_STEPS.length}
                        </span>
                        
                        <button
                            onClick={() => {
                                if (isLastStep) {
                                    markAsSeen();
                                    onComplete?.();
                                    onClose();
                                } else {
                                    setCurrentStep(prev => prev + 1);
                                }
                            }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                                isLastStep 
                                    ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg shadow-brand-purple/30 hover:shadow-brand-purple/50' 
                                    : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                            }`}
                        >
                            {isLastStep ? 'Başla' : 'İleri'}
                            {!isLastStep && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                    
                    {/* Skip link for keyboard users */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                markAsSeen();
                                onClose();
                            }}
                            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
                        >
                            Rehberi atla
                        </button>
                    </div>
                </div>
                
                {/* Keyboard hint */}
                <div className="px-8 pb-6">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">←</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">→</kbd>
                            Gezin
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">Enter</kbd>
                            Seç
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[10px]">Esc</kbd>
                            Kapat
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook to show guide for first-time users
export function useKeyboardGuide() {
    const [showGuide, setShowGuide] = useState(false);
    
    useEffect(() => {
        const seen = localStorage.getItem('wordbox-keyboard-guide-seen');
        // Auto-show for keyboard users on first visit
        const isKeyboardUser = window.matchMedia('(hover: none)').matches === false;
        if (!seen && isKeyboardUser) {
            // Delay to not overwhelm user immediately
            const timer = setTimeout(() => setShowGuide(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);
    
    return {
        showGuide,
        openGuide: () => setShowGuide(true),
        closeGuide: () => setShowGuide(false)
    };
}
