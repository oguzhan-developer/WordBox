import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Download,
    Upload,
    Plus,
    BookOpen,
    Clock,
    CheckCircle,
    X,
    Trash2,
    ArrowUpDown,
    Volume2,
    Info,
    AlertTriangle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import Card, { StatCard } from '../components/Card';
import { LevelBadge } from '../components/Badge';
import Modal from '../components/Modal';
import QuickAddWord from '../components/QuickAddWord';
import { speak } from '../utils/speechSynthesis';
import {
    exportToJSON,
    exportToCSV,
    exportToAnki,
    exportToQuizlet,
    exportToPrint,
    importFromJSON,
    importFromCSV,
    SUPPORTED_FORMATS
} from '../utils/vocabularyExport';

export default function VocabularyList() {
    const navigate = useNavigate();
    const { user, removeWord, addWord } = useUser();
    const toast = useToast();
    const fileInputRef = useRef(null);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [displayCount, setDisplayCount] = useState(30);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [sortBy, setSortBy] = useState('alphabetical');
    const [sortOrder, setSortOrder] = useState('asc');

    const sortOptions = [
        { id: 'alphabetical', label: 'Alfabetik' },
        { id: 'level', label: 'Seviye' },
        { id: 'date', label: 'Eklenme Tarihi' },
    ];

    const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1'];
    const statuses = [
        { value: 'all', label: 'Tümü', icon: '📚' },
        { value: 'new', label: 'Yeni', icon: '🆕' },
        { value: 'learning', label: 'Öğreniliyor', icon: '📖' },
        { value: 'learned', label: 'Öğrenildi', icon: '✅' },
    ];

    // Debounced search
    useMemo(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Filter and sort vocabulary
    const filteredVocabulary = useMemo(() => {
        let words = [...user.vocabulary];

        // Search filter
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            words = words.filter(word =>
                word.word.toLowerCase().includes(query) ||
                word.turkish.toLowerCase().includes(query) ||
                word.definition?.toLowerCase().includes(query)
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

        // Sort words
        words.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'alphabetical':
                    comparison = a.word.localeCompare(b.word);
                    break;
                case 'level':
                    const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
                    comparison = (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0);
                    break;
                case 'date':
                default:
                    comparison = new Date(a.addedAt) - new Date(b.addedAt);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return words;
    }, [user.vocabulary, debouncedSearch, selectedLevel, selectedStatus, sortBy, sortOrder]);

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

    // Paginated vocabulary
    const paginatedVocabulary = useMemo(() => {
        return filteredVocabulary.slice(0, displayCount);
    }, [filteredVocabulary, displayCount]);

    const hasMore = filteredVocabulary.length > displayCount;

    const loadMore = useCallback(() => {
        setDisplayCount(prev => prev + 30);
    }, []);

    const handleRemoveWord = useCallback((wordId) => {
        if (confirm('Bu kelimeyi silmek istediğine emin misin?')) {
            removeWord(wordId);
            toast.success('Kelime silindi');
        }
    }, [removeWord, toast]);

    const handleSpeak = useCallback((word) => {
        speak(word, { rate: 0.85, pitch: 1.0 });
    }, []);

    // Export
    const handleExport = useCallback((format) => {
        if (user.vocabulary.length === 0) {
            toast.error('Dışa aktarılacak kelime yok');
            return;
        }

        let result;
        switch (format) {
            case 'json':
                result = exportToJSON(user.vocabulary);
                break;
            case 'csv':
                result = exportToCSV(user.vocabulary);
                break;
            case 'anki':
                result = exportToAnki(user.vocabulary);
                break;
            case 'quizlet':
                result = exportToQuizlet(user.vocabulary);
                break;
            case 'print':
                result = exportToPrint(user.vocabulary, {
                    title: 'Kelime Listem',
                    columns: 2,
                    groupByLevel: true
                });
                break;
            default:
                result = exportToJSON(user.vocabulary);
        }

        if (result.success) {
            const message = format === 'print'
                ? 'Yazdırma penceresi açıldı!'
                : `${result.wordCount} kelime dışa aktarıldı!`;
            toast.success(message);
            setShowExportModal(false);
        }
    }, [user.vocabulary, toast]);

    // Import
    const handleFileSelect = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            let result;
            if (file.name.endsWith('.json')) {
                result = await importFromJSON(file);
            } else if (file.name.endsWith('.csv')) {
                result = await importFromCSV(file);
            } else {
                toast.error('Desteklenmeyen dosya formatı. JSON veya CSV kullanın.');
                return;
            }

            setImportResult(result);
        } catch (error) {
            toast.error(error.message);
        }

        e.target.value = '';
    }, [toast]);

    const handleConfirmImport = useCallback(() => {
        if (!importResult?.words) return;

        const existingWords = new Set(user.vocabulary.map(w => w.word.toLowerCase()));
        const newWords = importResult.words.filter(w => !existingWords.has(w.word.toLowerCase()));

        newWords.forEach(word => addWord(word));

        toast.success(`${newWords.length} yeni kelime eklendi!`);
        if (newWords.length < importResult.words.length) {
            toast.info(`${importResult.words.length - newWords.length} kelime zaten listede vardı.`);
        }

        setImportResult(null);
        setShowImportModal(false);
    }, [importResult, user.vocabulary, addWord, toast]);

    // Word detail card component
    const WordDetailCard = ({ word }) => {
        const [expandedExample, setExpandedExample] = useState(null);

        // Parse usage notes
        const usageNotes = word.usageNotes
            ? (typeof word.usageNotes === 'string'
                ? word.usageNotes.split('\n').filter(n => n.trim())
                : word.usageNotes)
            : [];

        // Parse common mistakes
        const commonMistakes = word.commonMistakes
            ? (typeof word.commonMistakes === 'string'
                ? word.commonMistakes.split('\n').filter(m => m.trim())
                : word.commonMistakes)
            : [];

        const toggleExample = (index) => {
            setExpandedExample(expandedExample === index ? null : index);
        };

        return (
            <div className="bg-white dark:bg-[#2a2a24] rounded-xl border border-gray-100 dark:border-[#333] p-4">
                <div className="flex items-start gap-3">
                    {/* Audio Button - Left */}
                    <button
                        onClick={() => handleSpeak(word.word)}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                        title="Sesli oku"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Word Header */}
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{word.word}</h3>
                            {word.phonetic && (
                                <span className="text-gray-400 text-xs">/{word.phonetic}/</span>
                            )}
                            <LevelBadge level={word.level} size="sm" />
                            <span className="text-gray-400 text-xs">{word.partOfSpeech || 'noun'}</span>
                        </div>

                        {/* Turkish Meaning */}
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{word.turkish}</p>

                        {/* Definition */}
                        {word.definition && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{word.definition}</p>
                        )}

                        {/* Examples */}
                        {word.examples && word.examples.length > 0 && (
                            <div className="space-y-1 mb-3">
                                {word.examples.slice(0, 2).map((example, i) => {
                                    const enText = typeof example === 'string' ? example : example.en || example;
                                    const trText = word.examplesTr?.[i] || null;

                                    return (
                                        <div key={i}>
                                            <p
                                                onClick={() => toggleExample(i)}
                                                className="text-gray-600 dark:text-gray-400 text-xs italic cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                "{enText}"
                                            </p>
                                            {expandedExample === i && trText && (
                                                <p className="text-brand-blue dark:text-blue-400 text-xs mt-0.5">
                                                    "{trText}"
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Usage Notes & Common Mistakes */}
                        <div className="flex flex-wrap gap-2">
                            {usageNotes.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                                    <Info className="w-3 h-3" />
                                    {usageNotes[0]}
                                </span>
                            )}
                            {commonMistakes.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded text-xs">
                                    <AlertTriangle className="w-3 h-3" />
                                    {typeof commonMistakes[0] === 'string' ? commonMistakes[0] : commonMistakes[0]?.incorrect + ' → ' + commonMistakes[0]?.correct}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => handleRemoveWord(word.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelime Listem 📖</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {user.vocabulary.length} kelime koleksiyonunda
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowQuickAdd(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Kelime Ekle
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            İçe Aktar
                        </button>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Dışa Aktar
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <Card className="mb-6 bg-white dark:bg-[#2a2a24] border-gray-100 dark:border-[#333]">
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
                                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    {level === 'all' ? 'Tümü' : level}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [sort, order] = e.target.value.split('-');
                                    setSortBy(sort);
                                    setSortOrder(order);
                                }}
                                className="appearance-none pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-transparent dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
                            >
                                {sortOptions.map(option => (
                                    <React.Fragment key={option.id}>
                                        <option value={`${option.id}-asc`}>
                                            {option.label} (Artan)
                                        </option>
                                        <option value={`${option.id}-desc`}>
                                            {option.label} (Azalan)
                                        </option>
                                    </React.Fragment>
                                ))}
                            </select>
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        {statuses.map(status => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedStatus === status.value
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white'
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
                <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{filteredVocabulary.length}</span> kelime gösteriliyor
                    </p>
                </div>

                {/* Word List */}
                {filteredVocabulary.length > 0 ? (
                    <div className="space-y-4">
                        {paginatedVocabulary.map((word) => (
                            <WordDetailCard key={word.id} word={word} />
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="text-center pt-8">
                                <button
                                    onClick={loadMore}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                                >
                                    Daha Fazla Yükle ({filteredVocabulary.length - displayCount} kelime kaldı)
                                </button>
                            </div>
                        )}
                    </div>
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
                            <button
                                onClick={() => navigate('/library')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                            >
                                <BookOpen className="w-4 h-4" />
                                Kütüphaneye Git
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedLevel('all');
                                    setSelectedStatus('all');
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Filtreleri Temizle
                            </button>
                        )}
                    </div>
                )}

            </div>

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Kelimeleri Dışa Aktar"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.vocabulary.length} kelimeyi dışa aktarmak için bir format seçin:
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {SUPPORTED_FORMATS.export.map(format => (
                            <button
                                key={format.id}
                                onClick={() => handleExport(format.id)}
                                className="flex flex-col items-start gap-1 p-4 rounded-xl border border-gray-200 dark:border-[#333] hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
                            >
                                <span className="font-bold text-gray-900 dark:text-white">{format.label}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{format.description}</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{format.extension}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => { setShowImportModal(false); setImportResult(null); }}
                title="Kelimeleri İçe Aktar"
            >
                <div className="space-y-4">
                    {!importResult ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                JSON veya CSV formatında kelime dosyası yükleyin:
                            </p>

                            <div className="space-y-3">
                                {SUPPORTED_FORMATS.import.map(format => (
                                    <div key={format.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <span className="text-lg">📄</span>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">{format.label}</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{format.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <Upload className="w-5 h-5" />
                                Dosya Seç
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">Dosya okundu!</h4>
                                <div className="space-y-1 text-sm text-green-600 dark:text-green-400">
                                    <p>✓ {importResult.validCount} geçerli kelime bulundu</p>
                                    {importResult.skippedCount > 0 && (
                                        <p>⚠ {importResult.skippedCount} kelime atlandı (eksik veri)</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setImportResult(null)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Farklı Dosya
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity"
                                >
                                    İçe Aktar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Quick Add Word Modal */}
            <QuickAddWord
                isOpen={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onAdd={(word) => {
                    addWord(word);
                    toast.success('Kelime eklendi!');
                    setShowQuickAdd(false);
                }}
            />
        </div>
    );
}
