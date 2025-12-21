import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Newspaper,
    BookOpen,
    Save,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Check,
    X,
    Upload,
    RefreshCw,
    Search,
    Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Modal from '../components/Modal';

// Admin e-posta listesi - sadece bunlar admin paneline erişebilir
const ADMIN_EMAILS = ['oguzhanfinal@gmail.com', 'admin@wordbox.com'];

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('news'); // 'news' | 'stories' | 'categories'
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState('all'); // 'all' | 'published' | 'draft'

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Form state for news/stories
    const [formData, setFormData] = useState({
        slug: '',
        image: '',
        published_at: new Date().toISOString().split('T')[0],
        read_time_minutes: 5,
        is_published: false,
        category_id: '',
        // Level data (will be stored in separate table)
        levels: {
            A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 }
        }
    });

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        name_en: '',
        slug: '',
        icon: '',
        color: '#3B82F6'
    });

    const [expandedLevel, setExpandedLevel] = useState('A1');

    // Admin kontrolü
    const isAdmin = user?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());

    useEffect(() => {
        // user henüz yüklenmediyse bekle
        if (!user?.email) {
            return;
        }
        
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, [activeTab, user?.email, isAdmin]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Her zaman kategorileri yükle
            await loadCategories();

            if (activeTab === 'news') {
                await loadNews();
            } else if (activeTab === 'stories') {
                await loadStories();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Veriler yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        const tableName = activeTab === 'news' ? 'news_categories' : 'story_categories';
        const { data, error } = await supabase
            .from(tableName)
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

    const loadStories = async () => {
        const { data, error } = await supabase
            .from('stories')
            .select(`
                *,
                story_levels (*),
                story_categories (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading stories:', error);
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
            levels: {
                A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: '[]', key_phrases: '', comprehension_questions: '[]', word_count: 0 }
            }
        });
        setExpandedLevel('A1');
    };

    const handleAddNew = () => {
        resetFormData();
        setShowAddModal(true);
    };

    const handleEdit = (item) => {
        const levelsData = activeTab === 'news' ? item.news_levels : item.story_levels;
        const categoryKey = activeTab === 'news' ? 'news_categories' : 'story_categories';

        // Parse levels from database
        const parsedLevels = {
            A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', new_words: [], key_phrases: [], comprehension_questions: [], word_count: 0 }
        };

        if (levelsData) {
            levelsData.forEach(level => {
                if (parsedLevels[level.level]) {
                    parsedLevels[level.level] = {
                        enabled: true,
                        title: level.title || '',
                        subtitle: level.subtitle || '',
                        summary: level.summary || '',
                        content_text: level.content_text || '',
                        new_words: level.new_words || [],
                        key_phrases: level.key_phrases || [],
                        comprehension_questions: level.comprehension_questions || [],
                        word_count: level.word_count || 0
                    };
                }
            });
        }

        setFormData({
            id: item.id,
            slug: item.slug || '',
            image: item.image || '',
            published_at: item.published_at ? item.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
            read_time_minutes: item.read_time_minutes || 5,
            is_published: item.is_published || false,
            category_id: item[categoryKey]?.id || item.category_id || '',
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
            const tableName = activeTab === 'news' ? 'news' : 'stories';
            const { error } = await supabase
                .from(tableName)
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
            const tableName = activeTab === 'news' ? 'news' : 'stories';
            const levelsTableName = activeTab === 'news' ? 'news_levels' : 'story_levels';
            const foreignKey = activeTab === 'news' ? 'news_id' : 'story_id';

            // Validate form
            if (!formData.slug) {
                toast.error('Slug gerekli!');
                return;
            }

            // Check if at least one level is enabled
            const enabledLevels = Object.entries(formData.levels).filter(([, data]) => data.enabled);
            if (enabledLevels.length === 0) {
                toast.error('En az bir seviye aktif olmalı!');
                return;
            }

            // Prepare main table data
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
                // Update existing
                const { data, error } = await supabase
                    .from(tableName)
                    .update(mainData)
                    .eq('id', formData.id)
                    .select()
                    .single();

                if (error) throw error;
                itemId = data.id;

                // Delete existing levels and re-insert
                await supabase
                    .from(levelsTableName)
                    .delete()
                    .eq(foreignKey, itemId);
            } else {
                // Insert new
                const { data, error } = await supabase
                    .from(tableName)
                    .insert(mainData)
                    .select()
                    .single();

                if (error) throw error;
                itemId = data.id;
            }

            // Insert levels
            const levelsToInsert = enabledLevels.map(([level, data]) => {
                // Parse string values to arrays if needed
                let newWords = data.new_words;
                let keyPhrases = data.key_phrases;
                let comprehensionQuestions = data.comprehension_questions;

                // Parse new_words (JSON array)
                if (typeof newWords === 'string') {
                    try {
                        newWords = JSON.parse(newWords);
                    } catch {
                        newWords = [];
                    }
                }

                // Parse key_phrases (comma separated or JSON)
                if (typeof keyPhrases === 'string') {
                    try {
                        keyPhrases = JSON.parse(keyPhrases);
                    } catch {
                        keyPhrases = keyPhrases.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }

                // Parse comprehension_questions (JSON array)
                if (typeof comprehensionQuestions === 'string') {
                    try {
                        comprehensionQuestions = JSON.parse(comprehensionQuestions);
                    } catch {
                        comprehensionQuestions = [];
                    }
                }

                return {
                    [foreignKey]: itemId,
                    level,
                    title: data.title,
                    subtitle: data.subtitle,
                    summary: data.summary,
                    content_text: data.content_text,
                    new_words: newWords,
                    key_phrases: keyPhrases,
                    comprehension_questions: comprehensionQuestions,
                    word_count: data.word_count || data.content_text.split(/\s+/).filter(Boolean).length
                };
            });

            const { error: levelsError } = await supabase
                .from(levelsTableName)
                .insert(levelsToInsert);

            if (levelsError) throw levelsError;

            toast.success(isEdit ? 'Başarıyla güncellendi!' : 'Başarıyla eklendi!');
            setShowAddModal(false);
            setShowEditModal(false);
            resetFormData();
            loadData();
        } catch (error) {
            console.error('Error saving:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            toast.error('Kaydetme başarısız: ' + (error.message || error.details || 'Bilinmeyen hata'));
        }
    };

    const togglePublish = async (item) => {
        try {
            const tableName = activeTab === 'news' ? 'news' : 'stories';
            const { error } = await supabase
                .from(tableName)
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

    // Category CRUD
    const handleAddCategory = () => {
        setCategoryForm({ name: '', name_en: '', slug: '', icon: '', color: '#3B82F6' });
        setSelectedItem(null);
    };

    const handleSaveCategory = async () => {
        try {
            const tableName = activeTab === 'news' ? 'news_categories' : 'story_categories';

            if (!categoryForm.name || !categoryForm.slug) {
                toast.error('İsim ve slug gerekli!');
                return;
            }

            if (selectedItem?.id) {
                // Update
                const { error } = await supabase
                    .from(tableName)
                    .update(categoryForm)
                    .eq('id', selectedItem.id);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from(tableName)
                    .insert(categoryForm);

                if (error) throw error;
            }

            toast.success('Kategori kaydedildi!');
            setCategoryForm({ name: '', name_en: '', slug: '', icon: '', color: '#3B82F6' });
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Kategori kaydedilemedi: ' + error.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const tableName = activeTab === 'news' ? 'news_categories' : 'story_categories';
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Kategori silindi!');
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Kategori silinemedi: ' + error.message);
        }
    };

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = !searchQuery ||
            item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (activeTab === 'news' ? item.news_levels : item.story_levels)?.some(l =>
                l.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesFilter = filterPublished === 'all' ||
            (filterPublished === 'published' && item.is_published) ||
            (filterPublished === 'draft' && !item.is_published);

        return matchesSearch && matchesFilter;
    });

    // Update level data helper
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

    // Parse JSON array input
    const parseArrayInput = (value) => {
        try {
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') {
                if (value.startsWith('[')) {
                    return JSON.parse(value);
                }
                // Virgülle ayrılmış değerler
                return value.split(',').map(s => s.trim()).filter(Boolean);
            }
            return [];
        } catch {
            return [];
        }
    };

    // User henüz yüklenmemişse loading göster
    if (!user?.email) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Erişim Reddedildi
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bu sayfaya erişim yetkiniz bulunmamaktadır.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        E-posta: {user?.email}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            🛠️ Admin Paneli
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Haber ve hikaye içeriklerini yönet
                        </p>
                    </div>

                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Yeni Ekle
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'news'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <Newspaper size={20} />
                        Haberler
                    </button>
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'stories'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <BookOpen size={20} />
                        Hikayeler
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'categories'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <Filter size={20} />
                        Kategoriler
                    </button>
                </div>

                {/* Categories Tab */}
                {activeTab === 'categories' ? (
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Kategorileri Yönet
                        </h2>

                        {/* Tab switch for news/story categories */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => { setActiveTab('news'); setTimeout(() => setActiveTab('categories'), 0); }}
                                className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            >
                                Haber Kategorileri
                            </button>
                            <button
                                onClick={() => { setActiveTab('stories'); setTimeout(() => setActiveTab('categories'), 0); }}
                                className="px-3 py-1 text-sm rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            >
                                Hikaye Kategorileri
                            </button>
                        </div>

                        {/* Category Form */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                            <input
                                type="text"
                                placeholder="Kategori Adı (TR)"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                            <input
                                type="text"
                                placeholder="Category Name (EN)"
                                value={categoryForm.name_en}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                            <input
                                type="text"
                                placeholder="slug"
                                value={categoryForm.slug}
                                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                            <input
                                type="text"
                                placeholder="icon (emoji)"
                                value={categoryForm.icon}
                                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                            <input
                                type="color"
                                value={categoryForm.color}
                                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                                className="w-full h-10 rounded-lg cursor-pointer"
                            />
                            <button
                                onClick={handleSaveCategory}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Kaydet
                            </button>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                            <span className="text-gray-500 ml-2">({cat.name_en})</span>
                                        </div>
                                        <span
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <code className="text-xs bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded">
                                            {cat.slug}
                                        </code>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setCategoryForm(cat);
                                                setSelectedItem(cat);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <>
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
                                    Henüz içerik eklenmemiş.
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredItems.map(item => {
                                    const levelsData = activeTab === 'news' ? item.news_levels : item.story_levels;
                                    const categoryData = activeTab === 'news' ? item.news_categories : item.story_categories;
                                    const firstLevel = levelsData?.[0];

                                    return (
                                        <Card key={item.id} className="p-4">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                {/* Image */}
                                                {item.image && (
                                                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-700 flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
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

                                                {/* Actions */}
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
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal || showEditModal}
                onClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetFormData();
                }}
                title={`${showEditModal ? 'Düzenle' : 'Yeni Ekle'}: ${activeTab === 'news' ? 'Haber' : 'Hikaye'}`}
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Yeni Kelimeler (JSON array)
                                            </label>
                                            <textarea
                                                value={typeof formData.levels[level].new_words === 'string'
                                                    ? formData.levels[level].new_words
                                                    : JSON.stringify(formData.levels[level].new_words, null, 2)}
                                                onChange={(e) => updateLevelData(level, 'new_words', e.target.value)}
                                                placeholder={'[{"word": "example", "definition": "an instance", "turkish": "örnek"}]'}
                                                rows={4}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-y font-mono text-sm"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">JSON formatında girin</p>
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
        </div>
    );
}
