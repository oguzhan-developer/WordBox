import { useState, useMemo } from 'react';
import {
    Search,
    Grid,
    List,
    Filter,
    Download,
    Plus,
    BookOpen,
    Clock,
    CheckCircle,
    X
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import Card, { StatCard } from '../components/Card';
import VocabularyCard, { VocabularyListItem, WordDetailCard } from '../components/VocabularyCard';
import { LevelBadge } from '../components/Badge';

export default function VocabularyList() {
    const { user, removeWord } = useUser();
    const toast = useToast();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedWord, setSelectedWord] = useState(null);
    const [selectedWords, setSelectedWords] = useState(new Set());

    const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1'];
    const statuses = [
        { value: 'all', label: 'Tümü', icon: '📚' },
        { value: 'new', label: 'Yeni', icon: '🆕' },
        { value: 'learning', label: 'Öğreniliyor', icon: '📖' },
        { value: 'learned', label: 'Öğrenildi', icon: '✅' },
    ];

    // Filter vocabulary
    const filteredVocabulary = useMemo(() => {
        let words = [...user.vocabulary];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            words = words.filter(word =>
                word.word.toLowerCase().includes(query) ||
                word.turkish.toLowerCase().includes(query)
            );
        }

        // Level filter
        if (selectedLevel !== 'all') {
            words = words.filter(word => word.level === selectedLevel);
        }

        // Status filter
        if (selectedStatus !== 'all') {
            words = words.filter(word => (word.status || 'new') === selectedStatus);
        }

        // Sort by added date (newest first)
        words.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        return words;
    }, [user.vocabulary, searchQuery, selectedLevel, selectedStatus]);

    // Stats
    const stats = useMemo(() => {
        const vocab = user.vocabulary;
        return {
            total: vocab.length,
            new: vocab.filter(w => !w.status || w.status === 'new').length,
            learning: vocab.filter(w => w.status === 'learning').length,
            learned: vocab.filter(w => w.status === 'learned').length,
        };
    }, [user.vocabulary]);

    // Handle word removal
    const handleRemoveWord = (wordId) => {
        removeWord(wordId);
        toast.success('Kelime silindi');
        if (selectedWord?.id === wordId) {
            setSelectedWord(null);
        }
    };

    // Handle word selection for bulk actions
    const toggleWordSelection = (word) => {
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(word.id)) {
                newSet.delete(word.id);
            } else {
                newSet.add(word.id);
            }
            return newSet;
        });
    };

    // Export vocabulary
    const handleExport = () => {
        const data = user.vocabulary.map(w => ({
            word: w.word,
            turkish: w.turkish,
            level: w.level,
            status: w.status || 'new'
        }));

        const csv = [
            'Word,Turkish,Level,Status',
            ...data.map(d => `${d.word},${d.turkish},${d.level},${d.status}`)
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocabulary.csv';
        a.click();

        toast.success('Kelimeler dışa aktarıldı!');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelime Listem 📖</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {user.vocabulary.length} kelime koleksiyonunda
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Dışa Aktar
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={BookOpen}
                        title="Toplam"
                        value={stats.total}
                        iconBgColor="bg-indigo-100"
                        iconColor="text-indigo-600"
                    />
                    <StatCard
                        icon={Plus}
                        title="Yeni"
                        value={stats.new}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={Clock}
                        title="Öğreniliyor"
                        value={stats.learning}
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-600"
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Öğrenildi"
                        value={stats.learned}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                    />
                </div>

                {/* Filters */}
                <Card className="mb-6 bg-white dark:bg-[#27272a] border-gray-100 dark:border-[#333]">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Kelime veya anlam ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-transparent dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Level Filter */}
                        <div className="flex gap-1">
                            {levels.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLevel === level
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    {level === 'all' ? 'Tümü' : level}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#333] shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#333] shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-[#333]">
                        {statuses.map(status => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedStatus === status.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                    }`}
                            >
                                <span>{status.icon}</span>
                                <span>{status.label}</span>
                                {status.value !== 'all' && (
                                    <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                        {stats[status.value] || 0}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{filteredVocabulary.length}</span> kelime gösteriliyor
                    </p>
                    {selectedWords.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{selectedWords.size} seçili</span>
                            <button
                                onClick={() => setSelectedWords(new Set())}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Seçimi temizle
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {filteredVocabulary.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredVocabulary.map((word, index) => (
                                        <div
                                            key={word.id}
                                            className="animate-fadeIn"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <VocabularyCard
                                                word={word}
                                                onRemove={handleRemoveWord}
                                                onPractice={() => { }}
                                                onToggleFavorite={() => { }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredVocabulary.map((word, index) => (
                                        <div
                                            key={word.id}
                                            className="animate-fadeIn"
                                            style={{ animationDelay: `${index * 20}ms` }}
                                        >
                                            <VocabularyListItem
                                                word={word}
                                                onRemove={handleRemoveWord}
                                                onSelect={setSelectedWord}
                                                isSelected={selectedWords.has(word.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* Empty State */
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📚</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {user.vocabulary.length === 0
                                        ? 'Henüz kelime eklemedin'
                                        : 'Sonuç bulunamadı'
                                    }
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {user.vocabulary.length === 0
                                        ? 'Kütüphaneden içerik okuyarak kelime eklemeye başla!'
                                        : 'Farklı filtreler deneyebilirsin'
                                    }
                                </p>
                                {user.vocabulary.length === 0 ? (
                                    <a
                                        href="/library"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                                    >
                                        📚 Kütüphaneye Git
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedLevel('all');
                                            setSelectedStatus('all');
                                        }}
                                        className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                    >
                                        Filtreleri Temizle
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Detail Sidebar */}
                    {selectedWord && viewMode === 'list' && (
                        <div className="hidden lg:block w-80">
                            <WordDetailCard
                                word={selectedWord}
                                onClose={() => setSelectedWord(null)}
                                onPractice={() => { }}
                                onRemove={handleRemoveWord}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
