import { useState, useEffect } from 'react';
import { Search, Plus, X, RefreshCw, BookA, FileJson, Edit, Trash2, Download, Upload, Check, AlertCircle, Save } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { useToast } from '../Toast';
import Card from '../Card';
import Modal from '../Modal';

export default function AdminWords() {
    const toast = useToast();

    // State
    const [words, setWords] = useState([]);
    const [wordsPagination, setWordsPagination] = useState({ page: 1, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Word Modal state
    const [showWordModal, setShowWordModal] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [wordForm, setWordForm] = useState({
        word: '',
        phonetic: '',
        partOfSpeech: [],
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

    // JSON Import state
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [jsonFile, setJsonFile] = useState(null);
    const [jsonPreview, setJsonPreview] = useState(null);
    const [jsonUploadStatus, setJsonUploadStatus] = useState('idle');
    const [jsonError, setJsonError] = useState(null);
    const [jsonUploadProgress, setJsonUploadProgress] = useState({ current: 0, total: 0 });

    // Load words
    const loadWords = async (page = 1) => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    // Load words on mount
    useEffect(() => {
        loadWords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset word form
    const resetWordForm = () => {
        setWordForm({
            word: '',
            phonetic: '',
            partOfSpeech: [],
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

    // Array field helpers
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

    // Word CRUD
    const handleAddWord = () => {
        resetWordForm();
        setShowWordModal(true);
    };

    const handleEditWord = (word) => {
        let partOfSpeechArr = [];
        if (word.partOfSpeech) {
            if (Array.isArray(word.partOfSpeech)) {
                partOfSpeechArr = word.partOfSpeech;
            } else if (typeof word.partOfSpeech === 'string') {
                partOfSpeechArr = [word.partOfSpeech];
            }
        }

        setWordForm({
            word: word.word || '',
            phonetic: word.phonetic || '',
            partOfSpeech: partOfSpeechArr,
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

    // JSON Import
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
                setJsonPreview(json.slice(0, 3));
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
                            partOfSpeech: Array.isArray(word.partOfSpeech || word.part_of_speech)
                                ? (word.partOfSpeech || word.part_of_speech)
                                : (word.partOfSpeech || word.part_of_speech ? [word.partOfSpeech || word.part_of_speech] : []),
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
                    toast.success(`${successCount} kelime başarıyla eklendi/güncellendi!`);
                }
                if (errorCount > 0) {
                    toast.error(`${errorCount} kelime işlenemedi.`);
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
                partOfSpeech: ["noun", "verb"],
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
                partOfSpeech: ["verb"],
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kelimeler Yönetimi</h2>
                <button
                    onClick={handleAddWord}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} />
                    Yeni Kelime
                </button>
            </div>

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
                                        {word.partOfSpeech && (Array.isArray(word.partOfSpeech) ? word.partOfSpeech : [word.partOfSpeech]).filter(Boolean).length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(word.partOfSpeech) ? word.partOfSpeech : [word.partOfSpeech]).filter(Boolean).map((pos, idx) => (
                                                    <span key={idx} className="text-xs text-gray-400 bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                                                        {pos}
                                                    </span>
                                                ))}
                                            </div>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sözcük Türü (Birden fazla seçilebilir)
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {[
                                    { value: 'Noun', label: 'Noun (İsim)' },
                                    { value: 'Verb', label: 'Verb (Fiil)' },
                                    { value: 'Adjective', label: 'Adjective (Sıfat)' },
                                    { value: 'Adverb', label: 'Adverb (Zarf)' },
                                    { value: 'Preposition', label: 'Preposition (Edat)' },
                                    { value: 'Conjunction', label: 'Conjunction (Bağlaç)' },
                                    { value: 'Pronoun', label: 'Pronoun (Zamir)' },
                                    { value: 'Interjection', label: 'Interjection (Ünlem)' },
                                    { value: 'Phrase', label: 'Phrase (Deyim)' }
                                ].map((pos) => (
                                    <label
                                        key={pos.value}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors text-sm  ${
                                            Array.isArray(wordForm.partOfSpeech) && wordForm.partOfSpeech.includes(pos.value)
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                                                : 'bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(wordForm.partOfSpeech) && wordForm.partOfSpeech.includes(pos.value)}
                                            onChange={(e) => {
                                                const currentPartOfSpeech = Array.isArray(wordForm.partOfSpeech) ? wordForm.partOfSpeech : [];
                                                if (e.target.checked) {
                                                    setWordForm({ ...wordForm, partOfSpeech: [...currentPartOfSpeech, pos.value] });
                                                } else {
                                                    setWordForm({ ...wordForm, partOfSpeech: currentPartOfSpeech.filter(p => p !== pos.value) });
                                                }
                                            }}
                                            className="sr-only"
                                        />
                                        <span className="text-sm">{pos.label}</span>
                                    </label>
                                ))}
                            </div>
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

                    {/* Eş Anlamlılar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Eş Anlamlılar (Synonyms)
                        </label>
                        {wordForm.synonyms.map((syn, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={syn}
                                    onChange={(e) => updateArrayField('synonyms', index, e.target.value)}
                                    placeholder={`Eş anlamlı ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                {wordForm.synonyms.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('synonyms', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayField('synonyms')}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={16} /> Eş Anlamlı Ekle
                        </button>
                    </div>

                    {/* Zıt Anlamlılar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Zıt Anlamlılar (Antonyms)
                        </label>
                        {wordForm.antonyms.map((ant, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={ant}
                                    onChange={(e) => updateArrayField('antonyms', index, e.target.value)}
                                    placeholder={`Zıt anlamlı ${index + 1}`}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                {wordForm.antonyms.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayField('antonyms', index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayField('antonyms')}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={16} /> Zıt Anlamlı Ekle
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
                    {/* Durum: Idle */}
                    {jsonUploadStatus === 'idle' && (
                        <div className="text-center py-8">
                            <FileJson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                JSON Dosyası ile Kelime Yükle
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                JSON formatında hazırladığınız kelime listesini yükleyebilirsiniz.
                            </p>

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

                    {/* Durum: Preview */}
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

                    {/* Durum: Uploading */}
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

                    {/* Durum: Success */}
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

                    {/* Durum: Error */}
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
