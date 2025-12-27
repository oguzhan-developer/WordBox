import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Layers,
    Shuffle,
    PenTool,
    Languages,
    CheckSquare,
    Headphones,
    Clock,
    Zap,
    Lock
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { getSrsStats, BOX_LABELS, BOX_COLORS } from '../utils/spacedRepetition';

export default function PracticePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useUser();

    const [selectedMode, setSelectedMode] = useState(searchParams.get('mode') || null);
    const [wordCount, setWordCount] = useState(20);

    // SRS Statistics - memoized
    const srsStats = useMemo(() => getSrsStats(user.vocabulary || []), [user.vocabulary]);

    const practiceModes = [
        {
            id: 'flashcard',
            name: 'Flashcards',
            icon: Layers,
            description: 'Klasik kart sistemi ile öğren',
            duration: '10 dk',
            available: true,
            color: 'from-blue-500 to-indigo-600',
        },
        {
            id: 'matching',
            name: 'Eşleştirme',
            icon: Shuffle,
            description: 'Kelimeleri anlamlarıyla eşleştir',
            duration: '8 dk',
            available: true,
            color: 'from-purple-500 to-pink-600',
        },
        {
            id: 'sprint',
            name: 'Kelime Maratonu',
            icon: Zap,
            description: '60 saniyede ne kadar kelime bilebilirsin?',
            duration: '1 dk',
            available: true,
            color: 'from-yellow-400 to-orange-600 font-bold',
        },
        {
            id: 'fillblank',
            name: 'Boşluk Doldurma',
            icon: PenTool,
            description: 'Cümledeki boşluğu tamamla',
            duration: '15 dk',
            available: true,
            color: 'from-green-500 to-teal-600',
        },
        {
            id: 'translation',
            name: 'Çeviri Pratiği',
            icon: Languages,
            description: 'TR ↔ EN çeviri yap',
            duration: '12 dk',
            available: true,
            color: 'from-orange-500 to-red-600',
        },
        {
            id: 'multiplechoice',
            name: 'Çoktan Seçmeli',
            icon: CheckSquare,
            description: 'Doğru anlamı seç',
            duration: '10 dk',
            available: true,
            color: 'from-cyan-500 to-blue-600',
        },
        {
            id: 'listening',
            name: 'Dinle & Yaz',
            icon: Headphones,
            description: 'Dinleyip doğru yaz',
            duration: '15 dk',
            available: true,
            color: 'from-yellow-500 to-orange-600',
        },
    ];

    // Start practice - useCallback (must be before early returns)
    const startPractice = useCallback(() => {
        if (!selectedMode) return;

        const params = new URLSearchParams({
            count: wordCount,
            source: 'all'
        });

        navigate(`/practice/${selectedMode}?${params.toString()}`);
    }, [selectedMode, wordCount, navigate]);

    // If less than 5 words, show motivational message
    if (user.vocabulary.length < 5) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-gray-50 dark:bg-[#18181b] flex items-center justify-center px-4">
                <div className="w-full max-w-sm mx-auto text-center">
                    <div className="text-7xl mb-6">📚</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Pratik yapmadan önce en az 5 kelime öğrenmelisin.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Şu ana kadar {user.vocabulary.length} kelime öğrendin.
                    </p>

                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/vocabulary/learn')}
                        className="w-full mb-3"
                    >
                        ✨ Yeni Kelimeler Öğren
                    </Button>

                    <button
                        onClick={() => navigate('/library')}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        veya Kütüphaneye git →
                    </button>
                </div>
            </div>
        );
    }

    // Auto-start practice if less than 10 words (skip word count selection)
    const shouldAutoStart = user.vocabulary.length < 10;
    const autoWordCount = Math.min(user.vocabulary.length, 10);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-8 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelime Pratiği 🎯</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {user.vocabulary.length} kelime ile pratik yap
                    </p>
                </div>

                {/* SRS Overview */}
                <section className="mb-8">
                    <div className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 dark:from-brand-purple/20 dark:to-brand-blue/20 rounded-2xl p-6 border border-brand-purple/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-purple">psychology</span>
                                    Akıllı Tekrar Sistemi
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Bugün tekrar edilmesi gereken {srsStats.dueToday} kelime var</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-brand-green/10 text-brand-green rounded-lg text-sm font-bold">
                                    %{srsStats.averageAccuracy} Doğruluk
                                </div>
                                <div className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-bold">
                                    {srsStats.mastered} Uzman
                                </div>
                            </div>
                        </div>
                        
                        {/* Box Distribution */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                            {[1, 2, 3, 4, 5, 6].map((box) => (
                                <div key={box} className="flex flex-col items-center">
                                    <div className={`w-full h-24 sm:h-20 rounded-lg ${BOX_COLORS[box]} bg-opacity-20 flex items-end justify-center p-1 overflow-hidden`}>
                                        <div 
                                            className={`w-full ${BOX_COLORS[box]} rounded-t-md transition-all duration-500 ease-out`}
                                            style={{ 
                                                height: `${Math.max(15, Math.min(95, (srsStats.boxes[box] / Math.max(1, srsStats.total)) * 100))}%` 
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold mt-2 text-gray-900 dark:text-white">{srsStats.boxes[box]}</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center break-words w-full px-1">{BOX_LABELS[box]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Practice Mode Selection */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pratik Modunu Seç</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {practiceModes.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = selectedMode === mode.id;

                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => mode.available && setSelectedMode(mode.id)}
                                    disabled={!mode.available}
                                    aria-label={`${mode.name} pratik modu ${isSelected ? 'seçili' : ''} ${!mode.available ? 'kilitli' : ''}`}
                                    aria-pressed={isSelected}
                                    role="radio"
                                    aria-checked={isSelected}
                                    tabIndex={mode.available ? 0 : -1}
                                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 transform ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-[1.02]'
                                        : mode.available
                                            ? 'border-gray-200 dark:border-[#333] bg-white dark:bg-[#27272a] hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:scale-[1.01] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#18181b]'
                                            : 'border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#27272a]/50 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    {/* Lock icon for unavailable modes */}
                                    {!mode.available && (
                                        <div className="absolute top-3 right-3 p-1.5 bg-gray-200 rounded-full">
                                            <Lock className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}

                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 transition-transform duration-300 ${isSelected ? 'scale-110' : mode.available ? 'group-hover:scale-110' : ''}`}>
                                        <Icon className="w-6 h-6 text-white transition-transform duration-300" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{mode.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{mode.description}</p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {mode.duration}
                                        </span>
                                        {mode.available && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <Zap className="w-3.5 h-3.5" />
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Practice Settings - Simplified */}
                {selectedMode && (
                    <section className="animate-slideUp">
                        <div className="bg-indigo-600 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="w-5 h-5" />
                                        <span className="font-semibold">
                                            {practiceModes.find(m => m.id === selectedMode)?.name}
                                        </span>
                                    </div>
                                    <p className="text-indigo-100 text-sm">
                                        {user.vocabulary.length} kelime hazır
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-white text-2xl font-bold">+{wordCount * 5}</div>
                                    <div className="text-indigo-200 text-xs">XP kazanç</div>
                                </div>
                            </div>
                        </div>

                        {/* Word Count - Simple */}
                        <Card className="bg-white dark:bg-[#27272a] border-gray-100 dark:border-[#333]">
                            {shouldAutoStart ? (
                                // Auto-start: No word count selection, use all words
                                <div className="text-center py-4">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {user.vocabulary.length} kelimen var, hepsini kullanarak pratik yap!
                                    </p>
                                    <Button
                                        variant="primary"
                                        size="xl"
                                        fullWidth
                                        onClick={() => navigate(`/practice/${selectedMode}?count=${autoWordCount}&source=all`)}
                                    >
                                        🚀 {autoWordCount} Kelime ile Başla
                                    </Button>
                                </div>
                            ) : (
                                // Normal: Show word count selection
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kaç kelime?</h2>
                                        <span className="text-sm text-gray-500">Tahmini {Math.ceil(wordCount / 5)} dakika</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[10, 20, 30].map((count) => (
                                            <button
                                                key={count}
                                                onClick={() => setWordCount(count)}
                                                className={`py-4 rounded-xl border-2 font-bold text-xl transition-all ${
                                                    wordCount === count
                                                        ? 'border-indigo-500 bg-indigo-500 text-white scale-105'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                                                }`}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        variant="primary"
                                        size="xl"
                                        fullWidth
                                        className="mt-6"
                                        onClick={startPractice}
                                    >
                                        🚀 Pratiğe Başla
                                    </Button>
                                </>
                            )}
                        </Card>
                    </section>
                )}

                {/* Quick Actions - Always visible */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                        hover
                        onClick={() => {
                            setSelectedMode('flashcard');
                            setWordCount(20);
                            setTimeout(() => {
                                navigate(`/practice/flashcard?count=20&source=all`);
                            }, 100);
                        }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
                                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Hızlı Başla</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">20 kelime ile Flashcard pratiği</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        hover
                        onClick={() => {
                            setSelectedMode('flashcard');
                            setWordCount(15);
                            setTimeout(() => {
                                navigate(`/practice/flashcard?count=15&source=review`);
                            }, 100);
                        }}
                        className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 border-orange-100 dark:border-orange-900/50 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/40 rounded-2xl">
                                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Tekrar Zamanı</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {Math.min(user.vocabulary.length, 15)} kelime tekrar bekliyor
                                </p>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
