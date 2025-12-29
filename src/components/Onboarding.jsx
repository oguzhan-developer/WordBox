import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

// Onboarding slides data
const onboardingSlides = [
    {
        id: 1,
        title: 'WordBox\'a Hoş Geldin! 👋',
        subtitle: 'İngilizce öğrenmek hiç bu kadar eğlenceli olmamıştı',
        description: 'Kendi hızında öğren, oyunlaştırma sistemiyle motive ol ve gerçek hayatta kullanabileceğin kelimeler öğrendiğinden emin ol.',
        icon: 'waving_hand',
        gradient: 'from-blue-500 to-purple-600',
        bgColor: 'bg-blue-500/10',
        particles: [
            { icon: 'star', x: 10, y: 20, delay: 0 },
            { icon: 'favorite', x: 80, y: 10, delay: 0.2 },
            { icon: 'emoji_events', x: 70, y: 70, delay: 0.4 },
            { icon: 'rocket_launch', x: 20, y: 60, delay: 0.6 },
        ]
    },
    {
        id: 2,
        title: 'Kelime Havuzu',
        subtitle: 'Binlerce kelime parmak ucunda',
        description: 'Seviyene uygun kelimeleri keşfet, kişisel liste oluştur. Telaffuz, örnek cümleler ve Türkçe anlamlarıyle öğren.',
        icon: 'school',
        gradient: 'from-green-500 to-teal-600',
        bgColor: 'bg-green-500/10',
        features: [
            { icon: 'add_circle', text: 'Kolayca kelime ekle' },
            { icon: 'import_export', text: 'JSON/CSV içe/dışa aktar' },
            { icon: 'hearing', text: 'Telaffuz dinle' },
            { icon: 'translate', text: 'Anında çeviri' },
        ]
    },
    {
        id: 3,
        title: '7 Farklı Pratik Modu',
        subtitle: 'Hiç sıkılmayacaksın!',
        description: 'Ezberlemek yerine oyunlarla öğren. Her mod farklı bir becerini geliştirir.',
        gradient: 'from-orange-500 to-red-600',
        bgColor: 'bg-orange-500/10',
        practiceModes: [
            { name: 'Flashcard', icon: 'style', desc: 'Kartlarla öğren' },
            { name: 'Sprint', icon: 'timer', desc: 'Hız yarışı' },
            { name: 'Eşleştirme', icon: 'extension', desc: 'Eşleştir' },
            { name: 'Çoktan Seçmeli', icon: 'quiz', desc: 'Test çöz' },
            { name: 'Boşluk Doldur', icon: 'edit_note', desc: 'Cümle kur' },
            { name: 'Çeviri', icon: 'language', desc: 'Çeviri yap' },
            { name: 'Dinleme', icon: 'headphones', desc: 'Dinle ve yaz' },
        ]
    },
    {
        id: 4,
        title: 'Okuma Materyalleri',
        subtitle: 'Gerçek içeriklerle öğren',
        description: 'Seviyene uygun haberler ve hikayeler oku. Okurken yeni kelimeleri anında öğrenme listene ekle.',
        icon: 'auto_stories',
        gradient: 'from-purple-500 to-pink-600',
        bgColor: 'bg-purple-500/10',
        stats: [
            { value: '1000+', label: 'Hikaye & Haber' },
            { value: 'A1-C1', label: 'Seviye Aralığı' },
            { value: 'Günlük', label: 'Yeni İçerik' },
        ]
    },
    {
        id: 5,
        title: 'Oyunlaştırma Sistemi',
        subtitle: 'Öğrenirken eğlen!',
        description: 'XP kazan, seviye atla, rozetleri topla. Liderlik tablosunda diğerleriyle yarış.',
        gradient: 'from-yellow-500 to-amber-600',
        bgColor: 'bg-yellow-500/10',
        achievements: [
            { icon: 'military_tech', color: 'text-yellow-500', label: 'Rozetler' },
            { icon: 'local_fire_department', color: 'text-orange-500', label: 'Seri' },
            { icon: 'trending_up', color: 'text-green-500', label: 'Seviyeler' },
            { icon: 'leaderboard', color: 'text-blue-500', label: 'Liderlik' },
        ]
    },
    {
        id: 6,
        title: 'Öğrenmeye Başla! 🚀',
        subtitle: 'Yolculuğuna şimdi katıl',
        description: '10.000+ öğrenci her gün WordBox ile İngilizce öğreniyor. Sen de aralarına katıl!',
        icon: 'rocket_launch',
        gradient: 'from-indigo-500 to-blue-600',
        bgColor: 'bg-indigo-500/10',
        isFinal: true,
        ctaText: 'Hemen Kayıt Ol',
        testimonials: [
            { text: '1 ayda A1\'den B1\'e geldim!', author: 'Ayşe K.' },
            { text: 'Ezberlemek yerine gerçekten öğrendim.', author: 'Mehmet Y.' },
            { text: 'Oyunlar çok eğlenceli!', author: 'Zeynep T.' },
        ]
    }
];

export default function Onboarding({ onComplete }) {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const directionRef = useRef(0); // 1 = forward, -1 = backward

    // Refs for GSAP animations
    const containerRef = useRef(null);
    const slideRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const descRef = useRef(null);
    const contentRef = useRef(null);
    const dotsRef = useRef([]);

    // Initialize and animate slides
    useEffect(() => {
        if (!slideRef.current) return;

        // Kill existing animations
        gsap.killTweensOf('*');

        // Create timeline for slide entrance
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Set initial position based on direction, then animate to center
        const direction = directionRef.current;
        const startX = direction === 1 ? 100 : direction === -1 ? -100 : 0;
        gsap.set(slideRef.current, { x: startX, opacity: 0 });

        // Animate background elements to center
        tl.to(slideRef.current, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5
        });

        // Animate title
        if (titleRef.current) {
            tl.fromTo(titleRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5 },
                '-=0.3'
            );
        }

        // Animate subtitle
        if (subtitleRef.current) {
            tl.fromTo(subtitleRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4 },
                '-=0.3'
            );
        }

        // Animate description
        if (descRef.current) {
            tl.fromTo(descRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4 },
                '-=0.2'
            );
        }

        // Animate content elements
        if (contentRef.current) {
            const elements = contentRef.current.children;
            tl.fromTo(elements,
                { opacity: 0, y: 30, stagger: 0.08 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
                '-=0.2'
            );
        }

        // Animate dots
        dotsRef.current.forEach((dot, index) => {
            if (dot) {
                gsap.fromTo(dot,
                    { scale: 0 },
                    { scale: index === currentSlide ? 1.3 : 1, duration: 0.3, delay: index * 0.05 }
                );
            }
        });

        // Reset direction after animation
        setTimeout(() => { directionRef.current = 0; }, 600);

        return () => {
            gsap.killTweensOf('*');
        };
    }, [currentSlide]);

    // Handle next slide
    const handleNext = () => {
        if (currentSlide < onboardingSlides.length - 1) {
            // Set direction for entrance animation (new slide comes from right)
            directionRef.current = 1;
            setCurrentSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
    };

    // Handle previous slide
    const handlePrev = () => {
        if (currentSlide > 0) {
            // Set direction for entrance animation (new slide comes from left)
            directionRef.current = -1;
            setCurrentSlide(currentSlide - 1);
        }
    };

    // Handle skip
    const handleSkip = () => {
        handleComplete();
    };

    // Handle completion
    const handleComplete = () => {
        // Save to localStorage that onboarding was completed
        localStorage.setItem('wordbox_onboarding_completed', 'true');

        // Animate exit
        const tl = gsap.timeline({
            onComplete: () => {
                if (onComplete) {
                    onComplete();
                } else {
                    navigate('/auth');
                }
            }
        });

        tl.to(containerRef.current, {
            opacity: 0,
            scale: 1.1,
            duration: 0.5,
            ease: 'power2.in'
        });
    };

    // Go to specific slide
    const goToSlide = (index) => {
        if (index !== currentSlide) {
            // Set direction: forward = 1, backward = -1
            directionRef.current = index > currentSlide ? 1 : -1;
            setCurrentSlide(index);
        }
    };

    const slide = onboardingSlides[currentSlide];

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 pt-20 overflow-hidden ${
                isDark
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'
            }`}
        >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full ${isDark ? 'bg-white/5' : 'bg-purple-500/10'}`}
                        style={{
                            width: Math.random() * 100 + 20,
                            height: Math.random() * 100 + 20,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div
                ref={slideRef}
                className="relative w-full max-w-5xl mx-auto"
            >
                {/* Skip button - only show on non-final slides */}
                {currentSlide < onboardingSlides.length - 1 && (
                    <button
                        onClick={handleSkip}
                        className={`absolute -top-16 right-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            isDark
                                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Atla
                    </button>
                )}

                {/* Slide card */}
                <div
                    className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl ${
                        isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80 border border-white/50'
                    }`}
                >
                    <div className="flex flex-col lg:flex-row min-h-[600px]">
                        {/* Left side - Visual */}
                        <div className={`lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br ${slide.gradient} text-white relative overflow-hidden`}>
                            {/* Animated background pattern */}
                            <div className="absolute inset-0 opacity-20">
                                <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <circle cx="10" cy="10" r="1" fill="white" fillOpacity="0.5"/>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
                                </svg>
                            </div>

                            {/* Floating particles for first slide */}
                            {slide.particles && (
                                <div className="absolute inset-0">
                                    {slide.particles.map((particle, index) => (
                                        <div
                                            key={index}
                                            className="absolute animate-bounce"
                                            style={{
                                                left: `${particle.x}%`,
                                                top: `${particle.y}%`,
                                                animationDelay: `${particle.delay}s`,
                                                animationDuration: '2s',
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-4xl opacity-60">
                                                {particle.icon}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Main icon */}
                            <div className="relative z-10">
                                <div className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 ${currentSlide === 0 ? 'animate-pulse' : ''}`}>
                                    <span className="material-symbols-outlined text-7xl lg:text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {slide.icon}
                                    </span>
                                </div>

                                {/* Stats for reading slide */}
                                {slide.stats && (
                                    <div className="grid grid-cols-3 gap-4 mt-8">
                                        {slide.stats.map((stat, index) => (
                                            <div key={index} className="text-center">
                                                <div className="text-3xl lg:text-4xl font-bold">{stat.value}</div>
                                                <div className="text-sm opacity-80">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Practice modes grid */}
                                {slide.practiceModes && (
                                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mt-6 max-w-md mx-auto">
                                        {slide.practiceModes.map((mode, index) => (
                                            <div
                                                key={index}
                                                className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/30 transition-all duration-300 hover:scale-105"
                                            >
                                                <span className="material-symbols-outlined text-2xl">{mode.icon}</span>
                                                <p className="text-xs font-medium mt-1">{mode.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Achievements */}
                                {slide.achievements && (
                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        {slide.achievements.map((achievement, index) => (
                                            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-3xl ${achievement.color}`}>
                                                    {achievement.icon}
                                                </span>
                                                <span className="font-medium">{achievement.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Testimonials for final slide */}
                                {slide.testimonials && (
                                    <div className="mt-8 space-y-3 max-w-md mx-auto">
                                        {slide.testimonials.map((testimonial, index) => (
                                            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-left">
                                                <p className="text-sm italic">"{testimonial.text}"</p>
                                                <p className="text-xs font-medium mt-1">- {testimonial.author}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side - Content */}
                        <div className={`lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <div ref={contentRef} className="space-y-6">
                                {/* Title */}
                                <h2
                                    ref={titleRef}
                                    className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}
                                >
                                    {slide.title}
                                </h2>

                                {/* Subtitle */}
                                <p
                                    ref={subtitleRef}
                                    className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                                >
                                    {slide.subtitle}
                                </p>

                                {/* Description */}
                                <p
                                    ref={descRef}
                                    className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                >
                                    {slide.description}
                                </p>

                                {/* Features list */}
                                {slide.features && (
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        {slide.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined ${isDark ? 'text-brand-blue' : 'text-brand-blue'}`}>
                                                    {feature.icon}
                                                </span>
                                                <span className="text-sm font-medium">{feature.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Progress dots */}
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    {onboardingSlides.map((_, index) => (
                                        <button
                                            key={index}
                                            ref={el => dotsRef.current[index] = el}
                                            onClick={() => goToSlide(index)}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                index === currentSlide
                                                    ? `w-8 bg-gradient-to-r ${slide.gradient}`
                                                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                            }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Navigation buttons */}
                                <div className="flex items-center gap-4 pt-4">
                                    {currentSlide > 0 && (
                                        <button
                                            onClick={handlePrev}
                                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                                isDark
                                                    ? 'text-white border border-gray-600 hover:bg-gray-700'
                                                    : 'text-gray-700 border border-gray-300 hover:bg-gray-100'
                                            }`}
                                        >
                                            ← Geri
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${slide.gradient} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                            currentSlide === onboardingSlides.length - 1 ? 'text-lg py-4' : ''
                                        }`}
                                    >
                                        {slide.isFinal ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span>{slide.ctaText}</span>
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </span>
                                        ) : (
                                            'Sonraki'
                                        )}
                                    </button>
                                </div>

                                {/* Slide counter */}
                                <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {currentSlide + 1} / {onboardingSlides.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom hint */}
                {currentSlide < onboardingSlides.length - 1 && (
                    <div className="text-center mt-6">
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Sonraki için veya → tuşuna bas
                        </p>
                    </div>
                )}
            </div>

            {/* Keyboard navigation hint */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('wordbox_onboarding_completed');
        setShowOnboarding(!completed);
    }, []);

    return { showOnboarding, setShowOnboarding };
}
