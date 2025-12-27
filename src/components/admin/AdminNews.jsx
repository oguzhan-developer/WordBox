import { useState, useEffect } from 'react';
import { Search, Plus, Save, Trash2, Edit, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { supabaseService } from '../../services/supabaseService';
import { useToast } from '../Toast';
import Card from '../Card';
import Modal from '../Modal';
import WordSelector from './WordSelector';

const initialLevelState = {
    A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
    A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
    B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
    B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
    C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 }
};

export default function AdminNews() {
    const toast = useToast();

    // State
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState('A1');

    // Form state
    const [formData, setFormData] = useState({
        slug: '',
        image: '',
        published_at: new Date().toISOString().split('T')[0],
        read_time_minutes: 5,
        is_published: false,
        category_id: '',
        levels: initialLevelState
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            await loadCategories();
            await loadNews();
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        const { data, error } = await supabase
            .from('news_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error loading categories:', error);
            return;
        }
        setCategories(data || []);
    };

    const loadNews = async () => {
        const { data, error } = await supabase
            .from('news')
            .select(`
                *,
                news_levels (*),
                news_categories (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading news:', error);
            return;
        }
        setItems(data || []);
    };

    const resetFormData = () => {
        setFormData({
            slug: '',
            image: '',
            published_at: new Date().toISOString().split('T')[0],
            read_time_minutes: 5,
            is_published: false,
            category_id: '',
            levels: JSON.parse(JSON.stringify(initialLevelState))
        });
        setExpandedLevel('A1');
    };

    const handleAddNew = () => {
        resetFormData();
        setShowAddModal(true);
    };

    const handleEdit = async (item) => {
        const parsedLevels = {
            A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 }
        };

        if (item.news_levels) {
            await Promise.all(item.news_levels.map(async (level) => {
                if (parsedLevels[level.level]) {
                    let levelWords = [];
                    try {
                        levelWords = await supabaseService.getWordsForNewsLevel(level.id);
                    } catch (err) {
                        console.error('Error loading level words:', err);
                    }

                    parsedLevels[level.level] = {
                        id: level.id,
                        enabled: true,
                        title: level.title || '',
                        subtitle: level.subtitle || '',
                        summary: level.summary || '',
                        content_text: level.content_text || '',
                        selectedWords: levelWords,
                        key_phrases: level.key_phrases || [],
                        comprehension_questions: level.comprehension_questions || [],
                        word_count: level.word_count || 0
                    };
                }
            }));
        }

        setFormData({
            id: item.id,
            slug: item.slug || '',
            image: item.image || '',
            published_at: item.published_at ? item.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
            read_time_minutes: item.read_time_minutes || 5,
            is_published: item.is_published || false,
            category_id: item.news_categories?.id || item.category_id || '',
            levels: parsedLevels
        });

        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        try {
            const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', selectedItem.id);

            if (error) throw error;

            toast.success('Başarıyla silindi!');
            setShowDeleteModal(false);
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Silme işlemi başarısız: ' + error.message);
        }
    };

    const handleSave = async (isEdit = false) => {
        try {
            if (!formData.slug) {
                toast.error('Slug gerekli!');
                return;
            }

            const enabledLevels = Object.entries(formData.levels).filter(([, data]) => data.enabled);
            if (enabledLevels.length === 0) {
                toast.error('En az bir seviye aktif olmalı!');
                return;
            }

            const mainData = {
                slug: formData.slug,
                image: formData.image,
                published_at: formData.published_at,
                read_time_minutes: parseInt(formData.read_time_minutes) || 5,
                is_published: formData.is_published,
                category_id: formData.category_id || null
            };

            let itemId;

            if (isEdit) {
                const { data, error } = await supabase
                    .from('news')
                    .update(mainData)
                    .eq('id', formData.id)
                    .select()
                    .single();

                if (error) throw error;
                itemId = data.id;

                const oldLevels = await supabase
                    .from('news_levels')
                    .select('id')
                    .eq('news_id', itemId);

                if (oldLevels.data) {
                    for (const oldLevel of oldLevels.data) {
                        await supabase
                            .from('news_words')
                            .delete()
                            .eq('news_level_id', oldLevel.id);
                    }
                }

                await supabase
                    .from('news_levels')
                    .delete()
                    .eq('news_id', itemId);
            } else {
                const { data, error } = await supabase
                    .from('news')
                    .insert(mainData)
                    .select()
                    .single();

                if (error) throw error;
                itemId = data.id;
            }

            for (const [level, data] of enabledLevels) {
                let keyPhrases = data.key_phrases;
                let comprehensionQuestions = data.comprehension_questions;

                if (Array.isArray(keyPhrases)) {
                } else if (typeof keyPhrases === 'string') {
                    try {
                        keyPhrases = JSON.parse(keyPhrases);
                    } catch {
                        keyPhrases = keyPhrases.split(',').map(s => s.trim()).filter(Boolean);
                    }
                } else {
                    keyPhrases = [];
                }

                if (Array.isArray(comprehensionQuestions)) {
                } else if (typeof comprehensionQuestions === 'string') {
                    try {
                        comprehensionQuestions = JSON.parse(comprehensionQuestions);
                    } catch {
                        comprehensionQuestions = [];
                    }
                } else {
                    comprehensionQuestions = [];
                }

                const levelData = {
                    news_id: itemId,
                    level,
                    title: data.title,
                    subtitle: data.subtitle,
                    summary: data.summary,
                    content_text: data.content_text,
                    key_phrases: keyPhrases,
                    comprehension_questions: comprehensionQuestions,
                    word_count: data.word_count || data.content_text.split(/\s+/).filter(Boolean).length
                };

                const { data: insertedLevel, error: levelError } = await supabase
                    .from('news_levels')
                    .insert(levelData)
                    .select()
                    .single();

                if (levelError) throw levelError;

                if (data.selectedWords && data.selectedWords.length > 0) {
                    const wordInserts = data.selectedWords.map((word, index) => ({
                        news_level_id: insertedLevel.id,
                        word_id: word.id,
                        display_order: index,
                        is_highlighted: false
                    }));

                    const { error: wordsError } = await supabase
                        .from('news_words')
                        .insert(wordInserts);

                    if (wordsError) {
                        console.error('Error inserting words:', wordsError);
                    }
                }
            }

            toast.success(isEdit ? 'Başarıyla güncellendi!' : 'Başarıyla eklendi!');
            setShowAddModal(false);
            setShowEditModal(false);
            resetFormData();
            loadData();
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Kaydetme başarısız: ' + (error.message || error.details || 'Bilinmeyen hata'));
        }
    };

    const togglePublish = async (item) => {
        try {
            const { error } = await supabase
                .from('news')
                .update({ is_published: !item.is_published })
                .eq('id', item.id);

            if (error) throw error;

            toast.success(item.is_published ? 'Yayından kaldırıldı' : 'Yayınlandı!');
            loadData();
        } catch (error) {
            console.error('Error toggling publish:', error);
            toast.error('İşlem başarısız: ' + error.message);
        }
    };

    const updateLevelData = (level, field, value) => {
        setFormData(prev => ({
            ...prev,
            levels: {
                ...prev.levels,
                [level]: {
                    ...prev.levels[level],
                    [field]: value
                }
            }
        }));
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = !searchQuery ||
            item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.news_levels?.some(l =>
                l.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesFilter = filterPublished === 'all' ||
            (filterPublished === 'published' && item.is_published) ||
            (filterPublished === 'draft' && !item.is_published);

        return matchesSearch && matchesFilter;
    });

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Haberler</h2>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Yeni Haber
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    />
                </div>

                <select
                    value={filterPublished}
                    onChange={(e) => setFilterPublished(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                >
                    <option value="all">Tümü</option>
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                </select>

                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600"
                >
                    <RefreshCw size={20} />
                    Yenile
                </button>
            </div>

            {/* Items List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : filteredItems.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Henüz haber eklenmemiş.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map(item => {
                        const levelsData = item.news_levels;
                        const categoryData = item.news_categories;
                        const firstLevel = levelsData?.[0];

                        return (
                            <Card key={item.id} className="p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {item.image && (
                                        <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-700 flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {firstLevel?.title || item.slug}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {firstLevel?.subtitle || 'Alt başlık yok'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${item.is_published
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {item.is_published ? 'Yayında' : 'Taslak'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {categoryData && (
                                                <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                    {categoryData.icon} {categoryData.name}
                                                </span>
                                            )}
                                            {levelsData?.map(l => (
                                                <span
                                                    key={l.level}
                                                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300"
                                                >
                                                    {l.level}
                                                </span>
                                            ))}
                                            <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-zinc-700 text-gray-500">
                                                {item.read_time_minutes} dk
                                            </span>
                                            <code className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-zinc-700 text-gray-500">
                                                /{item.slug}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => togglePublish(item)}
                                            className={`p-2 rounded-lg transition-colors ${item.is_published
                                                    ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                }`}
                                            title={item.is_published ? 'Yayından kaldır' : 'Yayınla'}
                                        >
                                            {item.is_published ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            title="Düzenle"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Sil"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal || showEditModal}
                onClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetFormData();
                }}
                title={`${showEditModal ? 'Düzenle' : 'Yeni Ekle'}: Haber`}
                size="xl"
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Main Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Slug *
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="haber-basligi-slug"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kategori
                            </label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Kategori seçin</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Görsel URL
                            </label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Yayın Tarihi
                            </label>
                            <input
                                type="date"
                                value={formData.published_at}
                                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Okuma Süresi (dk)
                            </label>
                            <input
                                type="number"
                                value={formData.read_time_minutes}
                                onChange={(e) => setFormData({ ...formData, read_time_minutes: e.target.value })}
                                min="1"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={formData.is_published}
                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Yayınla
                            </label>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {formData.image && (
                        <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-48 object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}

                    {/* Levels Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Seviye İçerikleri
                        </h3>

                        {['A1', 'A2', 'B1', 'B2', 'C1'].map(level => (
                            <div
                                key={level}
                                className="mb-4 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden"
                            >
                                {/* Level Header */}
                                <div
                                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${formData.levels[level].enabled
                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                            : 'bg-gray-50 dark:bg-zinc-800'
                                        }`}
                                    onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.levels[level].enabled}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                updateLevelData(level, 'enabled', e.target.checked);
                                            }}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {level}
                                        </span>
                                        {formData.levels[level].enabled && formData.levels[level].title && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                - {formData.levels[level].title}
                                            </span>
                                        )}
                                    </div>
                                    {expandedLevel === level ? (
                                        <ChevronUp size={20} className="text-gray-500" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-500" />
                                    )}
                                </div>

                                {/* Level Content */}
                                {expandedLevel === level && formData.levels[level].enabled && (
                                    <div className="p-4 space-y-4 bg-white dark:bg-zinc-900">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Başlık *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.levels[level].title}
                                                onChange={(e) => updateLevelData(level, 'title', e.target.value)}
                                                placeholder="İçerik başlığı"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Alt Başlık
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.levels[level].subtitle}
                                                onChange={(e) => updateLevelData(level, 'subtitle', e.target.value)}
                                                placeholder="Kısa açıklama"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Özet
                                            </label>
                                            <textarea
                                                value={formData.levels[level].summary}
                                                onChange={(e) => updateLevelData(level, 'summary', e.target.value)}
                                                placeholder="İçeriğin kısa özeti"
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                İçerik Metni *
                                            </label>
                                            <textarea
                                                value={formData.levels[level].content_text}
                                                onChange={(e) => {
                                                    const text = e.target.value;
                                                    updateLevelData(level, 'content_text', text);
                                                    updateLevelData(level, 'word_count', text.split(/\s+/).filter(Boolean).length);
                                                }}
                                                placeholder="Ana içerik metni..."
                                                rows={8}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-y font-mono text-sm"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Kelime sayısı: {formData.levels[level].word_count}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                📚 Yeni Kelimeler (Words tablosundan seçin)
                                            </label>
                                            <WordSelector
                                                selectedWords={formData.levels[level].selectedWords || []}
                                                onChange={(updatedWords) => updateLevelData(level, 'selectedWords', updatedWords)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Anahtar İfadeler (virgülle ayrılmış)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.levels[level].key_phrases === 'string'
                                                    ? formData.levels[level].key_phrases
                                                    : (Array.isArray(formData.levels[level].key_phrases)
                                                        ? formData.levels[level].key_phrases.join(', ')
                                                        : '')}
                                                onChange={(e) => updateLevelData(level, 'key_phrases', e.target.value)}
                                                placeholder="in addition, for example, on the other hand"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Anlama Soruları (JSON array)
                                            </label>
                                            <textarea
                                                value={typeof formData.levels[level].comprehension_questions === 'string'
                                                    ? formData.levels[level].comprehension_questions
                                                    : JSON.stringify(formData.levels[level].comprehension_questions, null, 2)}
                                                onChange={(e) => updateLevelData(level, 'comprehension_questions', e.target.value)}
                                                placeholder={'[{"question": "What is...?", "options": ["A", "B", "C", "D"], "correct": 0}]'}
                                                rows={4}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-y font-mono text-sm"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">JSON formatında girin</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <button
                        onClick={() => {
                            setShowAddModal(false);
                            setShowEditModal(false);
                            resetFormData();
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => handleSave(showEditModal)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Save size={20} />
                        Kaydet
                    </button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Silme Onayı"
            >
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Bu içeriği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
                        >
                            İptal
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Sil
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
