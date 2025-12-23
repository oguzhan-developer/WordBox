import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Volume2,
    Check,
    CheckCheck,
    Sparkles,
    Loader2,
    RefreshCw,
    Filter,
    Star,
    Zap
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { supabaseService } from '../services/supabaseService';
import Card from '../components/Card';
import Button from '../components/Button';
import { LevelBadge } from '../components/Badge';
import { speak } from '../utils/speechSynthesis';

// Seviye seçim butonları
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MAX_WORDS = 20;

// Kelime kartı bileşeni
function WordCard({ word, isAdded, isSelected, isFavorite, onAdd, onToggleSelect, onSpeak, onToggleFavorite }) {
    const handleSpeak = (e) => {
        e.stopPropagation();
        onSpeak(word.word);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        onToggleFavorite(word);
    };

    return (
        <Card
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer
                ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}
                ${isAdded ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-slate-800'}
            `}
            onClick={() => !isAdded && onToggleSelect(word)}
        >
            {/* Selection checkbox */}
            {!isAdded && (
                <div className="absolute top-3 left-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(word)}
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500
                                   dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Added badge */}
            {isAdded && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-800
                                text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Eklendi
                </div>
            )}

            {/* Favorite button */}
            <div className="absolute top-3 right-12 flex items-center gap-1">
                <button
                    onClick={handleFavorite}
                    className={`p-1.5 rounded-full transition-colors ${
                        isFavorite
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
                    }`}
                    title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Level badge */}
            <div className="absolute top-3 right-3">
                <LevelBadge level={word.level} size="sm" />
            </div>

            {/* Word content */}
            <div className="pt-10 pb-4 px-4">
                {/* Word */}
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {word.word}
                    </h3>
                    <button
                        onClick={handleSpeak}
                        className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 
                                   transition-colors text-indigo-600 dark:text-indigo-400"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Phonetic */}
                {word.phonetic && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {word.phonetic}
                    </p>
                )}

                {/* Part of speech */}
                {word.partOfSpeech && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 italic mb-4">
                        {word.partOfSpeech}
                    </p>
                )}

                {/* Turkish meaning */}
                <div className="text-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 
                                dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl mb-3">
                    <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                        {word.turkish || word.meaningsTr?.[0] || '-'}
                    </p>
                </div>

                {/* English definition */}
                {(word.definition || word.definitionsEn?.[0]) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3 line-clamp-2">
                        {word.definition || word.definitionsEn?.[0]}
                    </p>
                )}

                {/* Example */}
                {(word.examples?.[0] || word.examplesEn?.[0]) && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center line-clamp-2">
                            "{word.examples?.[0] || word.examplesEn?.[0]}"
                        </p>
                    </div>
                )}
            </div>

            {/* Action button */}
            <div className="px-4 pb-4">
                {isAdded ? (
                    <button
                        disabled
                        className="w-full py-3 bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 
                                   rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" />
                        Listende Var
                    </button>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd(word);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                                   hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl 
                                   font-medium flex items-center justify-center gap-2 transition-all
                                   hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4" />
                        Listeme Ekle
                    </button>
                )}
            </div>
        </Card>
    );
}

export default function LearnNewWordsPage() {
    const navigate = useNavigate();
    const { user, addWord, addXp } = useUser();
    const toast = useToast();

    // State
    const [selectedLevel, setSelectedLevel] = useState(user.level || 'B1');
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWords, setSelectedWords] = useState(new Set());
    const [addedWords, setAddedWords] = useState(new Set());
    const [addedCount, setAddedCount] = useState(0);
    const [favoriteWords, setFavoriteWords] = useState(new Set());

    // Kullanıcının mevcut kelimelerinin ID'leri
    const userWordIds = useMemo(() => {
        return new Set(user.vocabulary.map(w => w.word?.toLowerCase()));
    }, [user.vocabulary]);

    // Kelimeleri getir
    const fetchWords = useCallback(async () => {
        setLoading(true);
        try {
            const dbWords = await supabaseService.getWordsByLevel(selectedLevel);
            
            // Kullanıcıda olmayan kelimeleri filtrele
            const newWords = dbWords.filter(w => !userWordIds.has(w.word?.toLowerCase()));
            
            // Rastgele karıştır ve limitle
            const shuffled = newWords.sort(() => Math.random() - 0.5);
            const limited = shuffled.slice(0, MAX_WORDS);
            
            setWords(limited);
            setSelectedWords(new Set());
            
            if (limited.length === 0 && dbWords.length > 0) {
                toast.info('Bu seviyedeki tüm kelimeleri zaten öğrendin! 🎉');
            } else if (limited.length === 0) {
                toast.warning('Bu seviye için henüz kelime yok.');
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            toast.error('Kelimeler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [selectedLevel, userWordIds, toast]);

    // Seviye değiştiğinde kelimeleri getir
    useEffect(() => {
        fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLevel]); // fetchWords excluded - we only want to refetch when level changes

    // Konuşma
    const handleSpeak = useCallback((text) => {
        speak(text, {
            rate: 0.85,
            pitch: 1.0,
            volume: 1.0,
        });
    }, []);

    // Kelime seçimi toggle
    const handleToggleSelect = useCallback((word) => {
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

    // Tek kelime ekle
    const handleAddWord = useCallback((word) => {
        if (addedWords.has(word.id)) {
            toast.info('Bu kelime zaten eklendi');
            return;
        }

        // Kelimeyi normalize et
        const normalizedWord = {
            id: word.id,
            word: word.word,
            turkish: word.turkish || word.meaningsTr?.[0] || '',
            definition: word.definition || word.definitionsEn?.[0] || '',
            phonetic: word.phonetic || '',
            partOfSpeech: word.partOfSpeech || '',
            level: word.level,
            examples: word.examples || word.examplesEn || [],
            synonyms: word.synonyms || [],
            antonyms: word.antonyms || [],
            status: 'new',
            addedAt: new Date().toISOString(),
        };

        addWord(normalizedWord);
        setAddedWords(prev => new Set([...prev, word.id]));
        setAddedCount(prev => prev + 1);
        
        // XP ver
        addXp(5, 'Yeni kelime eklendi');
        
        toast.success(`"${word.word}" listene eklendi! +5 XP 🎉`);

        // 5 kelime eklendiyse özel mesaj
        if ((addedCount + 1) % 5 === 0) {
            toast.success(`🔥 ${addedCount + 1} kelime ekledin! Harika gidiyorsun!`);
        }
    }, [addWord, addXp, addedWords, addedCount, toast]);

    // Seçili kelimeleri toplu ekle
    const handleAddSelected = useCallback(() => {
        const wordsToAdd = words.filter(w => selectedWords.has(w.id) && !addedWords.has(w.id));
        
        if (wordsToAdd.length === 0) {
            toast.info('Eklenecek kelime seçilmedi');
            return;
        }

        let addedNow = 0;
        wordsToAdd.forEach(word => {
            const normalizedWord = {
                id: word.id,
                word: word.word,
                turkish: word.turkish || word.meaningsTr?.[0] || '',
                definition: word.definition || word.definitionsEn?.[0] || '',
                phonetic: word.phonetic || '',
                partOfSpeech: word.partOfSpeech || '',
                level: word.level,
                examples: word.examples || word.examplesEn || [],
                synonyms: word.synonyms || [],
                antonyms: word.antonyms || [],
                status: 'new',
                addedAt: new Date().toISOString(),
            };
            addWord(normalizedWord);
            addedNow++;
        });

        // Eklenen kelimeleri işaretle
        setAddedWords(prev => {
            const newSet = new Set(prev);
            wordsToAdd.forEach(w => newSet.add(w.id));
            return newSet;
        });
        setAddedCount(prev => prev + addedNow);
        setSelectedWords(new Set());

        // XP ver (kelime başına 5 XP)
        const totalXp = addedNow * 5;
        addXp(totalXp, `${addedNow} yeni kelime eklendi`);

        toast.success(`${addedNow} kelime eklendi! +${totalXp} XP 🎉`);
    }, [words, selectedWords, addedWords, addWord, addXp, toast]);

    // Hepsini ekle
    const handleAddAll = useCallback(() => {
        const wordsToAdd = words.filter(w => !addedWords.has(w.id));
        
        if (wordsToAdd.length === 0) {
            toast.info('Tüm kelimeler zaten eklenmiş');
            return;
        }

        let addedNow = 0;
        wordsToAdd.forEach(word => {
            const normalizedWord = {
                id: word.id,
                word: word.word,
                turkish: word.turkish || word.meaningsTr?.[0] || '',
                definition: word.definition || word.definitionsEn?.[0] || '',
                phonetic: word.phonetic || '',
                partOfSpeech: word.partOfSpeech || '',
                level: word.level,
                examples: word.examples || word.examplesEn || [],
                synonyms: word.synonyms || [],
                antonyms: word.antonyms || [],
                status: 'new',
                addedAt: new Date().toISOString(),
            };
            addWord(normalizedWord);
            addedNow++;
        });

        // Eklenen kelimeleri işaretle
        setAddedWords(prev => {
            const newSet = new Set(prev);
            wordsToAdd.forEach(w => newSet.add(w.id));
            return newSet;
        });
        setAddedCount(prev => prev + addedNow);

        // XP ver
        const totalXp = addedNow * 5;
        addXp(totalXp, `${addedNow} yeni kelime eklendi`);

        toast.success(`🎉 Tüm kelimeler eklendi! ${addedNow} kelime +${totalXp} XP`);
    }, [words, addedWords, addWord, addXp, toast]);

    // Hepsini seç
    const handleSelectAll = useCallback(() => {
        const selectableWords = words.filter(w => !addedWords.has(w.id));
        if (selectedWords.size === selectableWords.length) {
            // Tümünü kaldır
            setSelectedWords(new Set());
        } else {
            // Tümünü seç
            setSelectedWords(new Set(selectableWords.map(w => w.id)));
        }
    }, [words, addedWords, selectedWords]);

    // İstatistikler
    const stats = useMemo(() => {
        const available = words.filter(w => !addedWords.has(w.id)).length;
        const added = addedWords.size;
        const selected = selectedWords.size;
        return { available, added, selected };
    }, [words, addedWords, selectedWords]);

    // Favori toggle
    const handleToggleFavorite = useCallback((word) => {
        setFavoriteWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(word.id)) {
                newSet.delete(word.id);
            } else {
                newSet.add(word.id);
            }
            return newSet;
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 
                        dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/vocabulary')}
                            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 
                                       transition-colors text-gray-600 dark:text-gray-400"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white 
                                           flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                Yeni Kelimeler Öğren
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Seviyene uygun yeni kelimeler keşfet ve listene ekle
                            </p>
                        </div>
                    </div>

                    {/* Session stats */}
                    {addedCount > 0 && (
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
                                        from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                            <Zap className="w-5 h-5" />
                            <span className="font-bold">+{addedCount * 5} XP</span>
                            <span className="text-green-100">({addedCount} kelime)</span>
                        </div>
                    )}
                </div>

                {/* Level Selector */}
                <Card className="mb-6 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                Seviye Seç:
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {LEVELS.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all
                                        ${selectedLevel === level
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={fetchWords}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 
                                       text-indigo-700 dark:text-indigo-300 rounded-xl font-medium
                                       hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors
                                       disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Yenile
                        </button>
                    </div>
                </Card>

                {/* Bulk Actions */}
                {words.length > 0 && (
                    <Card className="mb-6 p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 
                                               hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={stats.selected > 0 && stats.selected === stats.available}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 
                                                   focus:ring-indigo-500 cursor-pointer"
                                    />
                                    {stats.selected > 0 ? `${stats.selected} seçili` : 'Tümünü seç'}
                                </button>

                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 
                                                     dark:text-blue-300 rounded-lg font-medium">
                                        {stats.available} mevcut
                                    </span>
                                    {stats.added > 0 && (
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 
                                                         dark:text-green-300 rounded-lg font-medium">
                                            {stats.added} eklendi
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {stats.selected > 0 && (
                                    <Button
                                        onClick={handleAddSelected}
                                        className="flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Seçilenleri Ekle ({stats.selected})
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleAddAll}
                                    disabled={stats.available === 0}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Hepsini Ekle
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Kelimeler yükleniyor...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && words.length === 0 && (
                    <Card className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Kelime Bulunamadı
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Bu seviyede öğrenebileceğin yeni kelime kalmadı veya veritabanında kelime yok.
                        </p>
                        <Button onClick={() => setSelectedLevel(prev => prev === 'C1' ? 'A1' : LEVELS[LEVELS.indexOf(prev) + 1])}>
                            Başka Seviye Dene
                        </Button>
                    </Card>
                )}

                {/* Word Grid */}
                {!loading && words.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {words.map((word) => (
                            <WordCard
                                key={word.id}
                                word={word}
                                isAdded={addedWords.has(word.id)}
                                isSelected={selectedWords.has(word.id)}
                                isFavorite={favoriteWords.has(word.id)}
                                onAdd={handleAddWord}
                                onToggleSelect={handleToggleSelect}
                                onSpeak={handleSpeak}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                )}

                {/* Session Summary - Fixed at bottom when words added */}
                {addedCount > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <Card className="flex items-center gap-4 px-6 py-3 shadow-2xl border-2 border-indigo-200 
                                         dark:border-indigo-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {addedCount} kelime eklendi
                                </span>
                            </div>
                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">
                                <Zap className="w-5 h-5" />
                                +{addedCount * 5} XP
                            </div>
                            <Button
                                size="sm"
                                onClick={() => navigate('/vocabulary')}
                            >
                                Kelimelerime Git
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
