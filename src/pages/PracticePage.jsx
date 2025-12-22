import { useState, useMemo } from 'react';
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
import { LevelBadge } from '../components/Badge';
import { getSrsStats, getDueWords, BOX_LABELS, BOX_COLORS } from '../utils/spacedRepetition';

export default function PracticePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useUser();

    const [selectedMode, setSelectedMode] = useState(searchParams.get('mode') || null);
    const [wordCount, setWordCount] = useState(20);
    const [wordSource, setWordSource] = useState('all');
    
    // SRS Statistics
    const srsStats = useMemo(() => getSrsStats(user.vocabulary || []), [user.vocabulary]);
    const dueWords = useMemo(() => getDueWords(user.vocabulary || []), [user.vocabulary]);

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

    const wordSources = [
        { value: 'all', label: 'Tüm Kelimeler', count: user.vocabulary.length },
        { value: 'new', label: 'Yeni Kelimeler', count: user.vocabulary.filter(w => w.status === 'new').length },
        { value: 'learning', label: 'Öğreniliyor', count: user.vocabulary.filter(w => w.status === 'learning').length },
        { value: 'review', label: 'Tekrar Zamanı', count: Math.min(user.vocabulary.length, 15) },
    ];

    const wordCounts = [10, 20, 30, 50];

    const startPractice = () => {
        if (!selectedMode) return;
        navigate(`/practice/${selectedMode}?count=${wordCount}&source=${wordSource}`);
    };

    // If no words, show empty state
    if (user.vocabulary.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 pb-12 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Önce kelime ekle!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Pratik yapmak için kelime listende kelime olması gerekiyor.
                        Kütüphaneden içerik okuyarak kelime eklemeye başla.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/library')}
                    >
                        📚 Kütüphaneye Git
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 pb-12">
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
                                    className={`relative text-left p-5 rounded-2xl border-2 transition-all ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-[1.02]'
                                        : mode.available
                                            ? 'border-gray-200 dark:border-[#333] bg-white dark:bg-[#27272a] hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
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
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
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

                {/* Practice Settings */}
                {selectedMode && (
                    <section className="animate-slideUp">
                        <Card className="mb-8 bg-white dark:bg-[#27272a] border-gray-100 dark:border-[#333]">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pratik Ayarları</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Word Source */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Kelime Kaynağı
                                    </label>
                                    <div className="space-y-3">
                                        {wordSources.map((source) => (
                                            <button
                                                key={source.value}
                                                onClick={() => setWordSource(source.value)}
                                                disabled={source.count === 0}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 group ${wordSource === source.value
                                                    ? 'border-indigo-500 dark:border-indigo-400 glass-strong shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30 scale-[1.02]'
                                                    : source.count > 0
                                                        ? 'border-gray-200/80 dark:border-slate-700/60 glass hover:glass-strong hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md hover:scale-[1.01]'
                                                        : 'border-gray-100 dark:border-slate-800 glass opacity-40 cursor-not-allowed'
                                                    }`}
                                            >
                                                <span className={`flex items-center gap-2 transition-all ${wordSource === source.value ? 'font-semibold text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}}`}>
                                                    {wordSource === source.value && <span className="text-lg">✓</span>}
                                                    {source.label}
                                                </span>
                                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${wordSource === source.value
                                                    ? 'gradient-primary text-white shadow-md'
                                                    : 'glass text-gray-600 dark:text-gray-400 group-hover:glass-strong'
                                                    }`}>
                                                    {source.count} kelime
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Word Count */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Kelime Sayısı
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {wordCounts.map((count) => (
                                            <button
                                                key={count}
                                                onClick={() => setWordCount(count)}
                                                disabled={count > user.vocabulary.length}
                                                className={`py-4 rounded-2xl border-2 font-bold text-xl transition-all duration-300 ${wordCount === count
                                                    ? 'border-indigo-500 gradient-primary text-white shadow-lg shadow-indigo-500/50 dark:shadow-indigo-500/30 scale-110'
                                                    : count <= user.vocabulary.length
                                                        ? 'border-gray-200/80 dark:border-slate-700/60 text-gray-700 dark:text-gray-300 glass hover:glass-strong hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md hover:scale-105'
                                                        : 'border-gray-100 dark:border-slate-800 text-gray-300 dark:text-gray-600 glass opacity-40 cursor-not-allowed'
                                                    }`}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Level filter */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Seviye (opsiyonel)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Tümü', 'A1', 'A2', 'B1', 'B2', 'C1'].map((level, index) => (
                                                <button
                                                    key={level}
                                                    className="px-4 py-2.5 rounded-xl text-sm font-semibold glass text-gray-700 dark:text-gray-300 hover:glass-strong hover:scale-105 hover:shadow-md transition-all duration-300 border border-gray-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-semibold text-gray-900 dark:text-white">{wordCount} kelime</span>
                                            {' '}ile{' '}
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {practiceModes.find(m => m.id === selectedMode)?.name}
                                            </span>
                                            {' '}pratiği yapacaksın
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tahmini süre: {practiceModes.find(m => m.id === selectedMode)?.duration}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold">
                                            +{wordCount * 5} XP
                                        </span>
                                    </div>
                                </div>
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
                            setWordSource('all');
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
                            setWordSource('review');
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
