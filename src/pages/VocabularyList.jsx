import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Grid,
    List,
    Filter,
    Download,
    Upload,
    Plus,
    BookOpen,
    Clock,
    CheckCircle,
    X,
    Trash2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import Card, { StatCard } from '../components/Card';
import VocabularyCard, { VocabularyListItem, WordDetailCard } from '../components/VocabularyCard';
import { LevelBadge } from '../components/Badge';
import { SkeletonVocabularyCard, SkeletonListItem } from '../components/Skeleton';
import Modal from '../components/Modal';
import QuickAddWord from '../components/QuickAddWord';
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
    const [viewMode, setViewMode] = useState('grid');
    const [selectedWord, setSelectedWord] = useState(null);
    const [selectedWords, setSelectedWords] = useState(new Set());
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [displayCount, setDisplayCount] = useState(50); // Pagination
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1'];
    const statuses = [
        { value: 'all', label: 'Tümü', icon: '📚' },
        { value: 'new', label: 'Yeni', icon: '🆕' },
        { value: 'learning', label: 'Öğreniliyor', icon: '📖' },
        { value: 'learned', label: 'Öğrenildi', icon: '✅' },
    ];

    // Debounced search with useEffect alternative
    useMemo(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Filter vocabulary - memoized properly with debounced search
    const filteredVocabulary = useMemo(() => {
        let words = [...user.vocabulary];

        // Search filter (debounced)
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

        // Sort by added date (newest first)
        words.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        return words;
    }, [user.vocabulary, debouncedSearch, selectedLevel, selectedStatus]);

    // Stats - memoized
    const stats = useMemo(() => {
        const vocab = user.vocabulary;
        return {
            total: vocab.length,
            new: vocab.filter(w => !w.status || w.status === 'new').length,
            learning: vocab.filter(w => w.status === 'learning').length,
            learned: vocab.filter(w => w.status === 'learned').length,
        };
    }, [user.vocabulary]);
    
    // Paginated vocabulary - only render displayCount items
    const paginatedVocabulary = useMemo(() => {
        return filteredVocabulary.slice(0, displayCount);
    }, [filteredVocabulary, displayCount]);
    
    const hasMore = filteredVocabulary.length > displayCount;
    
    // Load more handler
    const loadMore = useCallback(() => {
        setDisplayCount(prev => prev + 50);
    }, []);

    // Handle word removal - useCallback
    const handleRemoveWord = useCallback((wordId) => {
        removeWord(wordId);
        toast.success('Kelime silindi');
        if (selectedWord?.id === wordId) {
            setSelectedWord(null);
        }
        // Remove from selection if exists
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            newSet.delete(wordId);
            return newSet;
        });
    }, [removeWord, toast, selectedWord]);

    // Handle word selection for bulk actions
    const toggleWordSelection = useCallback((word) => {
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(word.id)) {
                newSet.delete(word.id);
            } else {
                newSet.add(word.id);
            }
            return newSet;
        });
    }, []);

    // Select all filtered words
    const handleSelectAll = useCallback(() => {
        const allIds = new Set(filteredVocabulary.map(w => w.id));
        setSelectedWords(allIds);
    }, [filteredVocabulary]);

    // Clear selection
    const handleClearSelection = useCallback(() => {
        setSelectedWords(new Set());
    }, []);

    // Bulk delete selected words
    const handleBulkDelete = useCallback(() => {
        if (selectedWords.size === 0) {
            toast.error('Silmek için kelime seçin');
            return;
        }

        if (!confirm(`${selectedWords.size} kelime silinecek. Emin misiniz?`)) {
            return;
        }

        selectedWords.forEach(wordId => removeWord(wordId));
        toast.success(`${selectedWords.size} kelime silindi`);
        setSelectedWords(new Set());
        setShowBulkActions(false);
    }, [selectedWords, removeWord, toast]);

    // Export vocabulary - useCallback
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
    
    // Import vocabulary
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
        
        // Reset file input
        e.target.value = '';
    }, [toast]);
    
    // Confirm import
    const handleConfirmImport = useCallback(() => {
        if (!importResult?.words) return;
        
        // Filter out duplicates
        const existingWords = new Set(user.vocabulary.map(w => w.word.toLowerCase()));
        const newWords = importResult.words.filter(w => !existingWords.has(w.word.toLowerCase()));
        
        // Add new words
        newWords.forEach(word => addWord(word));
        
        toast.success(`${newWords.length} yeni kelime eklendi!`);
        if (newWords.length < importResult.words.length) {
            toast.info(`${importResult.words.length - newWords.length} kelime zaten listede vardı.`);
        }
        
        setImportResult(null);
        setShowImportModal(false);
    }, [importResult, user.vocabulary, addWord, toast]);

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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowQuickAdd(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity"
                        >
                            <Download className="w-4 h-4" />
                            Dışa Aktar
                        </button>
                    </div>
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
                            {debouncedSearch && debouncedSearch !== searchQuery && (
                                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                </div>
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

                {/* Results Info & Bulk Actions */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{filteredVocabulary.length}</span> kelime gösteriliyor
                        {debouncedSearch && debouncedSearch !== searchQuery && (
                            <span className="ml-2 text-sm text-gray-500">(Aranıyor...)</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        {selectedWords.size > 0 && (
                            <>
                                <span className="text-sm text-gray-500">{selectedWords.size} seçili</span>
                                <button
                                    onClick={handleClearSelection}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Temizle
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Sil
                                </button>
                            </>
                        )}
                        {!selectedWords.size && filteredVocabulary.length > 0 && (
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Tümünü seç
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {filteredVocabulary.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paginatedVocabulary.map((word, index) => (
                                        <div
                                            key={word.id}
                                            className="animate-fadeIn relative"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            {/* Selection checkbox */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedWords.has(word.id)}
                                                    onChange={() => toggleWordSelection(word)}
                                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                                />
                                            </div>
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
                                    {paginatedVocabulary.map((word, index) => (
                                        <div
                                            key={word.id}
                                            className="animate-fadeIn relative flex items-center gap-3"
                                            style={{ animationDelay: `${index * 20}ms` }}
                                        >
                                            {/* Selection checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedWords.has(word.id)}
                                                onChange={() => toggleWordSelection(word)}
                                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <VocabularyListItem
                                                    word={word}
                                                    onRemove={handleRemoveWord}
                                                    onSelect={setSelectedWord}
                                                    isSelected={selectedWords.has(word.id)}
                                                />
                                            </div>
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
                                        <BookOpen className="w-4 h-4" />
                                        Kütüphaneye Git
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedLevel('all');
                                            setSelectedStatus('all');
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Filtreleri Temizle
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Load More Button */}
                        {hasMore && filteredVocabulary.length > 0 && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={loadMore}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                                >
                                    Daha Fazla Yükle ({filteredVocabulary.length - displayCount} kelime kaldı)
                                </button>
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
                                className="w-full py-3 rounded-xl gradient-primary text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
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
                                    className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
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
