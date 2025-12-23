import { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, X, Bookmark, Heart, Clock, TrendingUp } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { LevelBadge } from '../components/Badge';
import { supabaseService } from '../services/supabaseService';
import { useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import { SkeletonContentCard } from '../components/Skeleton';
import { getBookmarks } from '../utils/bookmarks';
import { getReadingStats } from '../utils/readingStats';

export default function Library() {
    const { user } = useUser();

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(user.level);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('news');
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [content, setContent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookmarkIds, setBookmarkIds] = useState([]);
    const [categories, setCategories] = useState([]);

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const types = [
        { value: 'news', label: 'Haberler', icon: '📰' },
        { value: 'story', label: 'Hikayeler', icon: '😄' },
    ];

    // Kategorileri veritabanından yükle
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (selectedType === 'news') {
                    const newsCategories = await supabaseService.getNewsCategories();
                    setCategories(newsCategories);
                } else {
                    const storyCategories = await supabaseService.getStoryCategories();
                    setCategories(storyCategories);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
        // Tip değiştiğinde kategori seçimini sıfırla
        setSelectedCategory('all');
    }, [selectedType]);

    // Bookmark'ları yükle
    useEffect(() => {
        const bookmarks = getBookmarks();
        setBookmarkIds(bookmarks.map(b => b.id));
    }, []);

    // Fetch data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let allContent = [];

                if (selectedType === 'news') {
                    const news = await supabaseService.getContentByLevel('news', selectedLevel);
                    allContent = [...allContent, ...news];
                }

                if (selectedType === 'story') {
                    const stories = await supabaseService.getContentByLevel('story', selectedLevel);
                    allContent = [...allContent, ...stories];
                }

                // Filter by category
                if (selectedCategory !== 'all') {
                    allContent = allContent.filter(item => 
                        item.categorySlug === selectedCategory || item.category === selectedCategory
                    );
                }

                // Filter by search
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    allContent = allContent.filter(item =>
                        item.title.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query)
                    );
                }

                // Filter by bookmarks only
                if (showBookmarksOnly) {
                    allContent = allContent.filter(item => bookmarkIds.includes(item.id));
                }

                setContent(allContent);
            } catch (error) {
                console.error("Failed to fetch content:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedLevel, selectedCategory, selectedType, searchQuery, showBookmarksOnly, bookmarkIds]);

    // Get counts and reading stats
    const _stats = {
        news: content.filter(i => i.type === 'news').length,
        stories: content.filter(i => i.type === 'story').length
    };

    const readingStats = useMemo(() => {
        const stats = getReadingStats();
        return {
            totalArticles: stats.totalArticlesRead || 0,
            totalWords: stats.totalWordsRead || 0,
            totalTime: stats.totalReadTime || 0,
            weeklyWords: stats.weeklySummary?.totalWords || 0
        };
    }, []);

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedLevel(user.level);
        setSelectedCategory('all');
        setSelectedType('news');
        setShowBookmarksOnly(false);
    };

    const hasActiveFilters = searchQuery || selectedLevel !== user.level || selectedCategory !== 'all' || selectedType !== 'news' || showBookmarksOnly;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kütüphane 📚</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Seviyene uygun yüzlerce içerik ile vocabulary pratiği yap
                    </p>

                    {/* Reading Stats Widget */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="font-bold text-gray-900 dark:text-white">Okuma İstatistikleri</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Bu hafta</span>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">{readingStats.totalArticles}</span> makale
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-gray-500">menu_book</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">{readingStats.totalWords.toLocaleString()}</span> kelime
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-gray-500">schedule</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-gray-900 dark:text-white">{Math.floor(readingStats.totalTime / 60)}</span> dk okuma
                                </span>
                            </div>
                            {readingStats.weeklyWords > 0 && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                        +{readingStats.weeklyWords} kelime bu hafta
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Stats */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            📰 Haberler
                        </span>
                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            😄 Hikayeler
                        </span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] p-4 mb-6">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Konu, başlık veya kelime ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#333] bg-transparent dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {/* Filter Toggle (Mobile) */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`sm:hidden flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 dark:border-[#333] dark:text-gray-300'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                                Filtreler
                            </button>

                            {/* View Toggle */}
                            <div className="hidden sm:flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
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
                    </div>

                    {/* Filter Options */}
                    <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-4 pt-4 border-t border-gray-100 dark:border-[#333]`}>
                        <div className="flex flex-wrap gap-4">
                            {/* Content Type */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">İçerik Tipi</label>
                                <div className="flex flex-wrap gap-2">
                                    {types.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setSelectedType(type.value)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedType === type.value
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                                }`}
                                        >
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                    {/* Bookmarks Filter */}
                                    <button
                                        onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${showBookmarksOnly
                                            ? 'bg-pink-600 text-white'
                                            : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                            }`}
                                    >
                                        <Bookmark className="w-4 h-4" />
                                        <span>Favorilerim ({bookmarkIds.length})</span>
                                    </button>
                                </div>
                            </div>

                            {/* Level */}
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Seviye</label>
                                <div className="flex gap-1">
                                    {levels.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedLevel(level)}
                                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${selectedLevel === level
                                                ? 'bg-indigo-600 text-white shadow-md scale-110'
                                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Kategori</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#333] bg-transparent dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                >
                                    <option value="all">Tüm Kategoriler</option>
                                    {categories.map(cat => (
                                        <option key={cat.id || cat.slug} value={cat.slug}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-[#333]">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Aktif Filtreler:</span>
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        "{searchQuery}"
                                        <button onClick={() => setSearchQuery('')}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedLevel !== user.level && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        Seviye: {selectedLevel}
                                        <button onClick={() => setSelectedLevel(user.level)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedCategory !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                        <button onClick={() => setSelectedCategory('all')}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {showBookmarksOnly && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                                        <Bookmark className="w-3 h-3" />
                                        Favorilerim
                                        <button onClick={() => setShowBookmarksOnly(false)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Tümünü temizle
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{content.length}</span> içerik bulundu
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Şu anki seviyen:</span>
                        <LevelBadge level={selectedLevel} />
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                        }`}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonContentCard key={i} />
                        ))}
                    </div>
                ) : content.length > 0 ? (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                        }`}>
                        {content.map((item, index) => (
                            <div key={`${item.type}-${item.id}`} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                                <ContentCard
                                    {...item}
                                    wordCount={item.wordCount || item.word_count || 0}
                                    readTime={item.readTime || item.read_time || Math.ceil((item.wordCount || item.word_count || 0) / 200)}
                                    isNew={index < 2}
                                    isRead={user.readArticles?.includes(item.id)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            İçerik bulunamadı
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Filtreleri değiştirmeyi veya aramayı temizlemeyi deneyin
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                )}

                {/* Load More (Placeholder) */}
                {content.length > 0 && (
                    <div className="text-center mt-8">
                        <button className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors">
                            Daha Fazla Yükle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
