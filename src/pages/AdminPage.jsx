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
    Filter,
    GripVertical,
    BookA,
    Link2,
    FileJson,
    Download
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { supabaseService } from '../services/supabaseService';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Modal from '../components/Modal';

// Admin e-posta listesi - sadece bunlar admin paneline erişebilir
const ADMIN_EMAILS = ['oguzhanfinal@gmail.com', 'admin@wordbox.com'];

// Kelime Arama ve Ekleme Bileşeni
// Var olan kelimeler arasında arama yapıp ekleme yapar
function WordSelector({ selectedWords, onChange, disabled = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const toast = useToast();

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const results = await supabaseService.searchWords(searchQuery, { limit: 10 });
                    // Zaten ekli olanları filtrele
                    const filteredResults = results.filter(
                        word => !selectedWords.some(sw => sw.id === word.id)
                    );
                    setSearchResults(filteredResults);
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedWords]);

    const handleAddWord = (word) => {
        const newSelectedWords = [...selectedWords, word];
        onChange(newSelectedWords);
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
        toast.success(`"${word.word}" eklendi`);
    };

    const handleRemoveWord = (wordId) => {
        const newSelectedWords = selectedWords.filter(w => w.id !== wordId);
        onChange(newSelectedWords);
    };

    const handleMoveWord = (index, direction) => {
        const newWords = [...selectedWords];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newWords.length) return;
        [newWords[index], newWords[newIndex]] = [newWords[newIndex], newWords[index]];
        onChange(newWords);
    };

    return (
        <div className="space-y-3">
            {/* Eklenen Kelimeler Listesi */}
            {selectedWords.length > 0 && (
                <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 grid grid-cols-12 gap-2">
                        <span className="col-span-1">#</span>
                        <span className="col-span-3">Kelime</span>
                        <span className="col-span-3">Türkçe</span>
                        <span className="col-span-3">Seviye</span>
                        <span className="col-span-2 text-right">İşlem</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-700 max-h-64 overflow-y-auto">
                        {selectedWords.map((word, index) => (
                            <div key={word.id} className="px-3 py-2 text-sm grid grid-cols-12 gap-2 items-center hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <span className="col-span-1 text-gray-400">{index + 1}</span>
                                <span className="col-span-3 font-medium text-gray-900 dark:text-white truncate">
                                    {word.word}
                                </span>
                                <span className="col-span-3 text-gray-600 dark:text-gray-400 truncate">
                                    {word.meaningsTr?.[0] || word.turkish || '-'}
                                </span>
                                <span className="col-span-3">
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                        word.level === 'A1' ? 'bg-green-100 text-green-700' :
                                        word.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                                        word.level === 'B1' ? 'bg-yellow-100 text-yellow-700' :
                                        word.level === 'B2' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {word.level}
                                    </span>
                                </span>
                                <div className="col-span-2 flex justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleMoveWord(index, -1)}
                                        disabled={index === 0 || disabled}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleMoveWord(index, 1)}
                                        disabled={index === selectedWords.length - 1 || disabled}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWord(word.id)}
                                        disabled={disabled}
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Kelime Sayısı */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Toplam: {selectedWords.length} kelime
            </div>

            {/* Kelime Arama */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Kelime ara... (min 2 karakter)"
                            disabled={disabled}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        />
                        {isSearching && (
                            <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                        )}
                    </div>
                </div>

                {/* Arama Sonuçları Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(word => (
                            <button
                                key={word.id}
                                type="button"
                                onClick={() => handleAddWord(word)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between"
                            >
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">{word.word}</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                                        - {word.meaningsTr?.[0] || word.turkish || 'Anlam yok'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                        word.level === 'A1' ? 'bg-green-100 text-green-700' :
                                        word.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                                        word.level === 'B1' ? 'bg-yellow-100 text-yellow-700' :
                                        word.level === 'B2' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {word.level}
                                    </span>
                                    <Plus className="w-4 h-4 text-green-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        Kelime bulunamadı. Önce "Kelimeler" sekmesinden ekleyin.
                    </div>
                )}
            </div>

            {/* Bilgi */}
            <p className="text-xs text-gray-400 dark:text-gray-500">
                💡 Kelimeler "Kelimeler" sekmesinden eklenir. Burada var olan kelimeler arasından seçim yapılır.
            </p>
        </div>
    );
}

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('news'); // 'news' | 'stories' | 'words' | 'categories'
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState('all'); // 'all' | 'published' | 'draft'
    const [filterLevel, setFilterLevel] = useState('all'); // 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

    // Words state
    const [words, setWords] = useState([]);
    const [wordsPagination, setWordsPagination] = useState({ page: 1, total: 0 });
    const [showWordModal, setShowWordModal] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [wordForm, setWordForm] = useState({
        word: '',
        phonetic: '',
        partOfSpeech: '',
        level: 'B1',
        meaningsTr: [''],
        definitionsEn: [''],
        examplesEn: [''],
        examplesTr: [''],
        synonyms: [],
        antonyms: [],
        usageNotes: '',
        commonMistakes: '',
        imageUrl: '',
        audioUrl: ''
    });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // JSON Import states
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [jsonFile, setJsonFile] = useState(null);
    const [jsonPreview, setJsonPreview] = useState(null);
    const [jsonUploadStatus, setJsonUploadStatus] = useState('idle'); // 'idle' | 'preview' | 'uploading' | 'success' | 'error'
    const [jsonError, setJsonError] = useState(null);
    const [jsonUploadProgress, setJsonUploadProgress] = useState({ current: 0, total: 0 });

    // Form state for news/stories - kelimeler artık ID referansları olarak tutulacak
    const [formData, setFormData] = useState({
        slug: '',
        image: '',
        published_at: new Date().toISOString().split('T')[0],
        read_time_minutes: 5,
        is_published: false,
        category_id: '',
        // Level data - new_words artık kelime objeleri array'i (word id'leri ile)
        levels: {
            A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
            C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, user?.email, isAdmin, filterLevel]); // loadData and navigate excluded intentionally

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'words') {
                await loadWords();
            } else if (activeTab === 'categories') {
                await loadCategories();
            } else {
                // Her zaman kategorileri yükle
                await loadCategories();

                if (activeTab === 'news') {
                    await loadNews();
                } else if (activeTab === 'stories') {
                    await loadStories();
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Veriler yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    // Words yükleme fonksiyonu
    const loadWords = async (page = 1) => {
        try {
            const options = {
                page,
                limit: 50,
                level: filterLevel !== 'all' ? filterLevel : null,
                search: searchQuery.trim() || null
            };

            const { words: wordData, total } = await supabaseService.getAllWords(options);
            setWords(wordData);
            setWordsPagination({ page, total });
        } catch (error) {
            console.error('Error loading words:', error);
            toast.error('Kelimeler yüklenirken hata oluştu');
        }
    };

    const loadCategories = async () => {
        const tableName = activeTab === 'news' || activeTab === 'words' ? 'news_categories' : 'story_categories';
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
                A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 },
                C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: '', comprehension_questions: '[]', word_count: 0 }
            }
        });
        setExpandedLevel('A1');
    };

    // Word form reset
    const resetWordForm = () => {
        setWordForm({
            word: '',
            phonetic: '',
            partOfSpeech: '',
            level: 'B1',
            meaningsTr: [''],
            definitionsEn: [''],
            examplesEn: [''],
            examplesTr: [''],
            synonyms: [],
            antonyms: [],
            usageNotes: '',
            commonMistakes: '',
            imageUrl: '',
            audioUrl: ''
        });
        setEditingWord(null);
    };

    // Word CRUD işlemleri
    const handleAddWord = () => {
        resetWordForm();
        setShowWordModal(true);
    };

    const handleEditWord = (word) => {
        setWordForm({
            word: word.word || '',
            phonetic: word.phonetic || '',
            partOfSpeech: word.partOfSpeech || '',
            level: word.level || 'B1',
            meaningsTr: word.meaningsTr?.length > 0 ? word.meaningsTr : [''],
            definitionsEn: word.definitionsEn?.length > 0 ? word.definitionsEn : [''],
            examplesEn: word.examplesEn?.length > 0 ? word.examplesEn : [''],
            examplesTr: word.examplesTr?.length > 0 ? word.examplesTr : [''],
            synonyms: word.synonyms || [],
            antonyms: word.antonyms || [],
            usageNotes: word.usageNotes || '',
            commonMistakes: word.commonMistakes || '',
            imageUrl: word.imageUrl || '',
            audioUrl: word.audioUrl || ''
        });
        setEditingWord(word);
        setShowWordModal(true);
    };

    const handleSaveWord = async () => {
        try {
            if (!wordForm.word.trim()) {
                toast.error('Kelime gerekli!');
                return;
            }

            if (!wordForm.meaningsTr[0]?.trim()) {
                toast.error('En az bir Türkçe anlam gerekli!');
                return;
            }

            // Boş değerleri filtrele
            const cleanedForm = {
                ...wordForm,
                meaningsTr: wordForm.meaningsTr.filter(m => m.trim()),
                definitionsEn: wordForm.definitionsEn.filter(d => d.trim()),
                examplesEn: wordForm.examplesEn.filter(e => e.trim()),
                examplesTr: wordForm.examplesTr.filter(e => e.trim())
            };

            if (editingWord) {
                await supabaseService.updateWord(editingWord.id, cleanedForm);
                toast.success('Kelime güncellendi!');
            } else {
                await supabaseService.createWord(cleanedForm);
                toast.success('Kelime eklendi!');
            }

            setShowWordModal(false);
            resetWordForm();
            loadWords(wordsPagination.page);
        } catch (error) {
            console.error('Error saving word:', error);
            if (error.code === '23505') {
                toast.error('Bu kelime zaten mevcut!');
            } else {
                toast.error('Kelime kaydedilemedi: ' + error.message);
            }
        }
    };

    const handleDeleteWord = async (word) => {
        if (!confirm(`"${word.word}" kelimesini silmek istediğinize emin misiniz?`)) return;

        try {
            await supabaseService.deleteWord(word.id);
            toast.success('Kelime silindi!');
            loadWords(wordsPagination.page);
        } catch (error) {
            console.error('Error deleting word:', error);
            toast.error('Kelime silinemedi: ' + error.message);
        }
    };

    // JSON Import fonksiyonları
    const handleJsonFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setJsonError('Lütfen geçerli bir JSON dosyası seçin.');
            return;
        }

        setJsonFile(file);
        setJsonError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (!Array.isArray(json)) {
                    setJsonError('JSON formatı hatalı. Kelimeler bir array olmalı.');
                    return;
                }
                if (json.length === 0) {
                    setJsonError('JSON dosyası boş.');
                    return;
                }
                setJsonPreview(json.slice(0, 3)); // İlk 3 kelimeyi göster
                setJsonUploadStatus('preview');
            } catch (err) {
                setJsonError('JSON parse edilemedi: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const handleJsonUpload = async () => {
        if (!jsonFile) return;

        setJsonUploadStatus('uploading');
        setJsonError(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const words = JSON.parse(event.target.result);
                const total = words.length;
                let successCount = 0;
                let errorCount = 0;
                const errors = [];

                for (let i = 0; i < total; i++) {
                    setJsonUploadProgress({ current: i + 1, total });
                    const word = words[i];

                    try {
                        await supabaseService.createWord({
                            word: word.word || '',
                            phonetic: word.phonetic || '',
                            partOfSpeech: word.partOfSpeech || word.part_of_speech || '',
                            level: word.level || 'B1',
                            meaningsTr: word.meaningsTr || word.meanings_tr || [],
                            definitionsEn: word.definitionsEn || word.definitions_en || [],
                            examplesEn: word.examplesEn || word.examples_en || [],
                            examplesTr: word.examplesTr || word.examples_tr || [],
                            synonyms: word.synonyms || [],
                            antonyms: word.antonyms || [],
                            usageNotes: word.usageNotes || word.usage_notes || '',
                            commonMistakes: word.commonMistakes || word.common_mistakes || '',
                            imageUrl: word.imageUrl || word.image_url || '',
                            audioUrl: word.audioUrl || word.audio_url || ''
                        });
                        successCount++;
                    } catch (err) {
                        errorCount++;
                        errors.push({ word: word.word, error: err.message });
                    }
                }

                if (successCount > 0) {
                    toast.success(`${successCount} kelime başarıyla eklendi!`);
                }
                if (errorCount > 0) {
                    toast.error(`${errorCount} kelime eklenemedi.`);
                    console.error('Import errors:', errors);
                }

                setJsonUploadStatus('success');
                loadWords(wordsPagination.page);
            } catch (err) {
                setJsonError('İçe aktarım sırasında hata: ' + err.message);
                setJsonUploadStatus('error');
            }
        };
        reader.readAsText(jsonFile);
    };

    const handleDownloadSampleJson = () => {
        const sampleWords = [
            {
                word: "example",
                phonetic: "/ɪɡˈzæmpəl/",
                partOfSpeech: "noun",
                level: "B1",
                meaningsTr: ["örnek", "misal"],
                definitionsEn: ["A thing characteristic of its kind or illustrating a general rule."],
                examplesEn: ["This is an example of how to use the word."],
                examplesTr: ["Bu kelimeyi nasıl kullanacağınızın bir örneği."],
                synonyms: ["sample", "instance"],
                antonyms: [],
                usageNotes: "Use 'for example' to introduce an illustration.",
                commonMistakes: "",
                imageUrl: "",
                audioUrl: ""
            },
            {
                word: "learn",
                phonetic: "/lɜːrn/",
                partOfSpeech: "verb",
                level: "A1",
                meaningsTr: ["öğrenmek", "kavramak"],
                definitionsEn: ["To gain knowledge or skill."],
                examplesEn: ["I want to learn English."],
                examplesTr: ["İngilizce öğrenmek istiyorum."],
                synonyms: ["study", "acquire"],
                antonyms: ["forget", "ignore"],
                usageNotes: "",
                commonMistakes: "Don't confuse 'learn' with 'teach'.",
                imageUrl: "",
                audioUrl: ""
            }
        ];

        const blob = new Blob([JSON.stringify(sampleWords, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample-words.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Array field güncelleme yardımcı fonksiyonları
    const updateArrayField = (field, index, value) => {
        setWordForm(prev => {
            const arr = [...prev[field]];
            arr[index] = value;
            return { ...prev, [field]: arr };
        });
    };

    const addArrayField = (field) => {
        setWordForm(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayField = (field, index) => {
        setWordForm(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleAddNew = () => {
        if (activeTab === 'words') {
            handleAddWord();
        } else {
            resetFormData();
            setShowAddModal(true);
        }
    };

    const handleEdit = async (item) => {
        const levelsData = activeTab === 'news' ? item.news_levels : item.story_levels;
        const categoryKey = activeTab === 'news' ? 'news_categories' : 'story_categories';

        // Parse levels from database - şimdi junction tablosundan kelimeleri çekeceğiz
        const parsedLevels = {
            A1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            A2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            B1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            B2: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 },
            C1: { enabled: false, title: '', subtitle: '', summary: '', content_text: '', selectedWords: [], key_phrases: [], comprehension_questions: [], word_count: 0 }
        };

        if (levelsData) {
            // Her level için kelimeleri junction tablosundan çek
            await Promise.all(levelsData.map(async (level) => {
                if (parsedLevels[level.level]) {
                    // Junction tablosundan kelimeleri çek
                    let levelWords = [];
                    try {
                        if (activeTab === 'news') {
                            levelWords = await supabaseService.getWordsForNewsLevel(level.id);
                        } else {
                            levelWords = await supabaseService.getWordsForStoryLevel(level.id);
                        }
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
            const wordsTableName = activeTab === 'news' ? 'news_words' : 'story_words';
            const foreignKey = activeTab === 'news' ? 'news_id' : 'story_id';
            const levelForeignKey = activeTab === 'news' ? 'news_level_id' : 'story_level_id';

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

                // Önce eski junction kayıtlarını sil (her level için)
                const oldLevels = await supabase
                    .from(levelsTableName)
                    .select('id')
                    .eq(foreignKey, itemId);

                if (oldLevels.data) {
                    for (const oldLevel of oldLevels.data) {
                        await supabase
                            .from(wordsTableName)
                            .delete()
                            .eq(levelForeignKey, oldLevel.id);
                    }
                }

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

            // Insert levels (kelimeler olmadan)
            for (const [level, data] of enabledLevels) {
                let keyPhrases = data.key_phrases;
                let comprehensionQuestions = data.comprehension_questions;

                // Parse key_phrases (comma separated or JSON)
                if (Array.isArray(keyPhrases)) {
                    // Already an array
                } else if (typeof keyPhrases === 'string') {
                    try {
                        keyPhrases = JSON.parse(keyPhrases);
                    } catch {
                        keyPhrases = keyPhrases.split(',').map(s => s.trim()).filter(Boolean);
                    }
                } else {
                    keyPhrases = [];
                }

                // Parse comprehension_questions (JSON array)
                if (Array.isArray(comprehensionQuestions)) {
                    // Already an array
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
                    [foreignKey]: itemId,
                    level,
                    title: data.title,
                    subtitle: data.subtitle,
                    summary: data.summary,
                    content_text: data.content_text,
                    key_phrases: keyPhrases,
                    comprehension_questions: comprehensionQuestions,
                    word_count: data.word_count || data.content_text.split(/\s+/).filter(Boolean).length
                };

                // Level'ı kaydet
                const { data: insertedLevel, error: levelError } = await supabase
                    .from(levelsTableName)
                    .insert(levelData)
                    .select()
                    .single();

                if (levelError) throw levelError;

                // Junction table'a kelimeleri ekle
                if (data.selectedWords && data.selectedWords.length > 0) {
                    const wordInserts = data.selectedWords.map((word, index) => ({
                        [levelForeignKey]: insertedLevel.id,
                        word_id: word.id,
                        display_order: index,
                        is_highlighted: false
                    }));

                    const { error: wordsError } = await supabase
                        .from(wordsTableName)
                        .insert(wordInserts);

                    if (wordsError) {
                        console.error('Error inserting words:', wordsError);
                        // Hata olsa bile devam et, ana kayıt zaten yapıldı
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
    const _handleAddCategory = () => {
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
    const _parseArrayInput = (value) => {
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
                        onClick={() => setActiveTab('words')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'words'
                                ? 'bg-green-600 text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <BookA size={20} />
                        Kelimeler
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

                {/* Words Tab */}
                {activeTab === 'words' ? (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Kelime ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadWords(1)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                            </div>
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            >
                                <option value="all">Tüm Seviyeler</option>
                                <option value="A1">A1</option>
                                <option value="A2">A2</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C1">C1</option>
                            </select>
                            <button
                                onClick={() => loadWords(1)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600"
                            >
                                <RefreshCw size={20} />
                                Ara
                            </button>
                            <button
                                onClick={() => {
                                    setShowJsonModal(true);
                                    setJsonUploadStatus('idle');
                                    setJsonFile(null);
                                    setJsonPreview(null);
                                    setJsonError(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <FileJson size={20} />
                                JSON ile Yükle
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Toplam: {wordsPagination.total} kelime
                        </div>

                        {/* Words List */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                            </div>
                        ) : words.length === 0 ? (
                            <Card className="p-8 text-center">
                                <BookA className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Henüz kelime eklenmemiş.
                                </p>
                                <button
                                    onClick={handleAddWord}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    İlk Kelimeyi Ekle
                                </button>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {words.map(word => (
                                    <Card key={word.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {word.word}
                                                    </span>
                                                    {word.phonetic && (
                                                        <span className="text-sm text-gray-400">
                                                            {word.phonetic}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                                                        word.level === 'A1' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        word.level === 'A2' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        word.level === 'B1' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        word.level === 'B2' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {word.level}
                                                    </span>
                                                    {word.partOfSpeech && (
                                                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                                                            {word.partOfSpeech}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {word.meaningsTr?.join(', ') || word.turkish || '-'}
                                                    </span>
                                                </div>
                                                {word.definitionsEn?.[0] && (
                                                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-500 truncate">
                                                        📖 {word.definitionsEn[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditWord(word)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWord(word)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {wordsPagination.total > 50 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => loadWords(wordsPagination.page - 1)}
                                    disabled={wordsPagination.page === 1}
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zinc-700 disabled:opacity-50"
                                >
                                    Önceki
                                </button>
                                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                    Sayfa {wordsPagination.page} / {Math.ceil(wordsPagination.total / 50)}
                                </span>
                                <button
                                    onClick={() => loadWords(wordsPagination.page + 1)}
                                    disabled={wordsPagination.page >= Math.ceil(wordsPagination.total / 50)}
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zinc-700 disabled:opacity-50"
                                >
                                    Sonraki
                                </button>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'categories' ? (
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

            {/* Word Add/Edit Modal */}
            <Modal
                isOpen={showWordModal}
                onClose={() => {
                    setShowWordModal(false);
                    resetWordForm();
                }}
                title={editingWord ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}
                size="xl"
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kelime (İngilizce) *
                            </label>
                            <input
                                type="text"
                                value={wordForm.word}
                                onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                                placeholder="example"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fonetik
                            </label>
                            <input
                                type="text"
                                value={wordForm.phonetic}
                                onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })}
                                placeholder="/ɪɡˈzæmpəl/"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sözcük Türü
                            </label>
                            <select
                                value={wordForm.partOfSpeech}
                                onChange={(e) => setWordForm({ ...wordForm, partOfSpeech: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Seçin</option>
                                <option value="noun">Noun (İsim)</option>
                                <option value="verb">Verb (Fiil)</option>
                                <option value="adjective">Adjective (Sıfat)</option>
                                <option value="adverb">Adverb (Zarf)</option>
                                <option value="preposition">Preposition (Edat)</option>
                                <option value="conjunction">Conjunction (Bağlaç)</option>
                                <option value="pronoun">Pronoun (Zamir)</option>
                                <option value="interjection">Interjection (Ünlem)</option>
                                <option value="phrase">Phrase (Deyim)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Seviye
                            </label>
                            <select
                                value={wordForm.level}
                                onChange={(e) => setWordForm({ ...wordForm, level: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            >
                                <option value="A1">A1 - Başlangıç</option>
                                <option value="A2">A2 - Temel</option>
                                <option value="B1">B1 - Orta Öncesi</option>
                                <option value="B2">B2 - Orta</option>
                                <option value="C1">C1 - İleri</option>
                            </select>
                        </div>
                    </div>

                    {/* Türkçe Anlamlar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Türkçe Anlamlar *
                        </label>
                        {wordForm.meaningsTr.map((meaning, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={meaning}
                                    onChange={(e) => updateArrayField('meaningsTr', index, e.target.value)}
                                    placeholder={`Anlam ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                {wordForm.meaningsTr.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('meaningsTr', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayField('meaningsTr')}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={16} /> Anlam Ekle
                        </button>
                    </div>

                    {/* İngilizce Tanımlar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            İngilizce Tanımlar
                        </label>
                        {wordForm.definitionsEn.map((def, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={def}
                                    onChange={(e) => updateArrayField('definitionsEn', index, e.target.value)}
                                    placeholder={`Definition ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                {wordForm.definitionsEn.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('definitionsEn', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayField('definitionsEn')}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={16} /> Tanım Ekle
                        </button>
                    </div>

                    {/* İngilizce Örnek Cümleler */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            İngilizce Örnek Cümleler
                        </label>
                        {wordForm.examplesEn.map((ex, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={ex}
                                    onChange={(e) => updateArrayField('examplesEn', index, e.target.value)}
                                    placeholder={`Example sentence ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                {wordForm.examplesEn.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('examplesEn', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayField('examplesEn')}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={16} /> Örnek Ekle
                        </button>
                    </div>

                    {/* Türkçe Örnek Cümleler */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Türkçe Örnek Cümleler
                        </label>
                        {wordForm.examplesTr.map((ex, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={ex}
                                    onChange={(e) => updateArrayField('examplesTr', index, e.target.value)}
                                    placeholder={`Örnek cümle ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                {wordForm.examplesTr.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('examplesTr', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayField('examplesTr')}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={16} /> Örnek Ekle
                        </button>
                    </div>

                    {/* Notlar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kullanım Notları
                            </label>
                            <textarea
                                value={wordForm.usageNotes}
                                onChange={(e) => setWordForm({ ...wordForm, usageNotes: e.target.value })}
                                placeholder="Özel kullanım durumları..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Yaygın Hatalar
                            </label>
                            <textarea
                                value={wordForm.commonMistakes}
                                onChange={(e) => setWordForm({ ...wordForm, commonMistakes: e.target.value })}
                                placeholder="Sık yapılan hatalar..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <button
                        onClick={() => {
                            setShowWordModal(false);
                            resetWordForm();
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSaveWord}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Save size={20} />
                        {editingWord ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </Modal>

            {/* JSON Import Modal */}
            <Modal
                isOpen={showJsonModal}
                onClose={() => {
                    setShowJsonModal(false);
                    setJsonUploadStatus('idle');
                    setJsonFile(null);
                    setJsonPreview(null);
                    setJsonError(null);
                }}
                title="JSON ile Kelime Yükle"
            >
                <div className="space-y-4">
                    {/* Durum: Idle - Başlangıç */}
                    {jsonUploadStatus === 'idle' && (
                        <div className="text-center py-8">
                            <FileJson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                JSON Dosyası ile Kelime Yükle
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                JSON formatında hazırladığınız kelime listesini yükleyebilirsiniz.
                            </p>

                            {/* Örnek JSON Gösterimi */}
                            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-left text-sm overflow-x-auto mb-6">
                                <pre className="text-xs">{`[
  {
    "word": "example",
    "phonetic": "/ɪɡˈzæmpəl/",
    "partOfSpeech": "noun",
    "level": "B1",
    "meaningsTr": ["örnek", "misal"],
    "definitionsEn": ["A thing characteristic..."],
    "examplesEn": ["This is an example..."],
    "examplesTr": ["Bu bir örnektir..."],
    "synonyms": ["sample", "instance"],
    "antonyms": [],
    "usageNotes": "Use 'for example'...",
    "commonMistakes": "",
    "imageUrl": "",
    "audioUrl": ""
  },
  ...
]`}</pre>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleDownloadSampleJson}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600"
                                >
                                    <Download size={18} />
                                    Örnek JSON İndir
                                </button>
                                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                                    <FileJson size={18} />
                                    JSON Dosyası Seç
                                    <input
                                        type="file"
                                        accept=".json,application/json"
                                        onChange={handleJsonFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Durum: Preview - Önizleme */}
                    {jsonUploadStatus === 'preview' && jsonPreview && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Önizleme (İlk 3 kelime)
                                </h4>
                                <button
                                    onClick={() => {
                                        setJsonUploadStatus('idle');
                                        setJsonFile(null);
                                        setJsonPreview(null);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Başka dosya seç
                                </button>
                            </div>

                            <div className="space-y-3 mb-4">
                                {jsonPreview.map((word, index) => (
                                    <div key={index} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {word.word}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded ${
                                                word.level === 'A1' ? 'bg-green-100 text-green-700' :
                                                word.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                                                word.level === 'B1' ? 'bg-yellow-100 text-yellow-700' :
                                                word.level === 'B2' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {word.level}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {word.meaningsTr?.join(', ') || '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {jsonError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg mb-4">
                                    {jsonError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowJsonModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleJsonUpload}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Upload size={18} />
                                    Yükle
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Durum: Uploading - Yükleniyor */}
                    {jsonUploadStatus === 'uploading' && (
                        <div className="text-center py-8">
                            <RefreshCw className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Kelimeler Yükleniyor...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {jsonUploadProgress.current} / {jsonUploadProgress.total}
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${(jsonUploadProgress.current / jsonUploadProgress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Durum: Success - Başarılı */}
                    {jsonUploadStatus === 'success' && (
                        <div className="text-center py-8">
                            <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Kelimeler Yüklendi!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {jsonUploadProgress.total} kelime başarıyla işlendi.
                            </p>
                            <button
                                onClick={() => {
                                    setShowJsonModal(false);
                                    setJsonUploadStatus('idle');
                                    setJsonFile(null);
                                    setJsonPreview(null);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Tamam
                            </button>
                        </div>
                    )}

                    {/* Durum: Error - Hata */}
                    {jsonUploadStatus === 'error' && (
                        <div className="text-center py-8">
                            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Hata Oluştu
                            </h3>
                            {jsonError && (
                                <p className="text-red-600 dark:text-red-400 mb-6">
                                    {jsonError}
                                </p>
                            )}
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowJsonModal(false);
                                        setJsonUploadStatus('idle');
                                        setJsonFile(null);
                                        setJsonPreview(null);
                                        setJsonError(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg"
                                >
                                    Kapat
                                </button>
                                <button
                                    onClick={() => setJsonUploadStatus('idle')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tekrar Dene
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hata mesajı (ilk seçimde) */}
                    {jsonError && jsonUploadStatus === 'idle' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                            {jsonError}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
