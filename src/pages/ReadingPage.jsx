import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Volume2,
    Bookmark,
    Share2,
    Settings,
    ChevronDown,
    Plus,
    Check,
    X,
    BookOpen,
    Target
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { supabaseService } from '../services/supabaseService';
import Card from '../components/Card';
import { LevelBadge, CategoryBadge } from '../components/Badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { speak } from '../utils/speechSynthesis';
import { recordReadingSession } from '../utils/readingStats';
import { isBookmarked, toggleBookmark } from '../utils/bookmarks';

export default function ReadingPage() {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, addWord, readArticle, addXp, recordActivity } = useUser();
    const toast = useToast();

    const [article, setArticle] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || user.level);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [selectedWord, setSelectedWord] = useState(null);
    const [addedWords, setAddedWords] = useState(new Set());
    const [isCompleted, setIsCompleted] = useState(false);
    const [similarArticles, setSimilarArticles] = useState([]);
    const [isArticleBookmarked, setIsArticleBookmarked] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [showReaderPanel, setShowReaderPanel] = useState(false);
    const readingStartTime = useRef(null);
    const [readerPrefs, setReaderPrefs] = useLocalStorage('reader-preferences', {
        fontSize: 'medium',
        lineHeight: 'relaxed',
        width: 'medium',
        focusMode: false
    });

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    const fontSizeMap = {
        small: 'text-base',
        medium: 'text-lg',
        large: 'text-xl'
    };

    const lineHeightMap = {
        compact: 'leading-normal',
        relaxed: 'leading-relaxed',
        spacious: 'leading-loose'
    };

    const widthMap = {
        narrow: 'lg:max-w-2xl',
        medium: 'lg:max-w-3xl',
        wide: 'lg:max-w-4xl'
    };

    const contentFontClass = fontSizeMap[readerPrefs.fontSize] || fontSizeMap.medium;
    const contentLineHeightClass = lineHeightMap[readerPrefs.lineHeight] || lineHeightMap.relaxed;
    const contentWidthClass = widthMap[readerPrefs.width] || widthMap.medium;

    const updateReaderPref = (key, value) => {
        setReaderPrefs(prev => ({ ...prev, [key]: value }));
    };

    // Load article and similar stories
    useEffect(() => {
        const loadContent = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Try news first, then stories
                let data = await supabaseService.getContentBySlug('news', id, selectedLevel);
                let type = 'news';

                if (!data) {
                    data = await supabaseService.getContentBySlug('story', id, selectedLevel);
                    type = 'story';
                }

                if (data) {
                    setArticle(data);
                    setIsArticleBookmarked(isBookmarked(data.id));
                    // Fetch similar articles from same table
                    const similar = await supabaseService.getContentByLevel(type, selectedLevel);
                    setSimilarArticles(similar.filter(a => a.id !== data.id).slice(0, 3));
                } else {
                    console.warn(`Content with slug ${id} not found.`);
                    setTimeout(() => navigate('/library', { replace: true }), 100);
                }
            } catch (err) {
                console.error("Error loading article:", err);
                navigate('/library');
            } finally {
                setIsLoading(false);
                setIsCompleted(false);
                setReadProgress(0);
                readingStartTime.current = Date.now(); // Start tracking reading time
                window.scrollTo(0, 0);
            }
        };

        loadContent();
    }, [id, selectedLevel]);

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.scrollY;
            const progress = Math.min((scrollTop / documentHeight) * 100, 100);
            setReadProgress(progress);

            // Mark as completed when reaching nearly 100%
            if (progress >= 99 && !isCompleted) {
                setIsCompleted(true);
                readArticle(article?.id);
                addXp(50, 'Makale tamamlandı');
                recordActivity();
                
                // Record reading session for stats
                const timeSpent = readingStartTime.current 
                    ? Math.round((Date.now() - readingStartTime.current) / 1000)
                    : 0;
                recordReadingSession({
                    articleId: article?.id,
                    articleTitle: article?.title,
                    level: selectedLevel,
                    wordsRead: article?.wordCount || article?.content?.split(/\s+/).length || 0,
                    timeSpent,
                    completed: true,
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isCompleted, article, readArticle, addXp, recordActivity, selectedLevel]);

    // Change level
    const handleLevelChange = (level) => {
        setSelectedLevel(level);
        setSearchParams({ level });
        setShowLevelDropdown(false);
    };

    // Speak word with enhanced TTS
    const speakWord = (word) => {
        speak(word, {
            rate: 0.85,
            pitch: 1.0,
            volume: 1.0,
            onError: (error) => {
                console.error('Speech error:', error);
            }
        });
    };

    // Normalize helper for word ids
    const normalizeWord = (text) => text?.trim().toLowerCase();

    // Handle word click
    const handleWordClick = useCallback(async (word, e) => {
        e.stopPropagation();

        const normalized = normalizeWord(word);
        const fallbackId = normalized ? `local-${normalized}` : `local-${Date.now()}`;

        try {
            const results = await supabaseService.searchWords(word);
            const wordInfo = results.find(w => normalizeWord(w.word) === normalized);

            const base = wordInfo || {
                id: fallbackId,
                word,
                turkish: '-',
                definition: 'Bu kelime veritabanında bulunamadı.',
                phonetic: '',
                partOfSpeech: '',
                examples: [],
                level: selectedLevel,
            };

            const derivedId = base.id || fallbackId;
            const alreadyAdded = user.vocabulary.some(v => normalizeWord(v.word) === normalized || v.id === derivedId) || addedWords.has(derivedId);

            setSelectedWord({
                ...base,
                id: derivedId,
                isAdded: alreadyAdded,
            });
        } catch (error) {
            console.error("Word search error:", error);
        }
    }, [user.vocabulary, addedWords, selectedLevel]);

    // Add word to vocabulary
    const handleAddWord = () => {
        if (!selectedWord) return;

        const normalized = normalizeWord(selectedWord.word);
        const fallbackId = selectedWord.id || (normalized ? `local-${normalized}` : `local-${Date.now()}`);

        const payload = {
            id: fallbackId,
            word: selectedWord.word,
            turkish: selectedWord.turkish || '-',
            definition: selectedWord.definition || '',
            phonetic: selectedWord.phonetic || '',
            partOfSpeech: selectedWord.partOfSpeech || '',
            examples: selectedWord.examples || [],
            level: selectedWord.level || selectedLevel,
            source: 'reading',
        };

        addWord(payload);
        setAddedWords(prev => new Set([...prev, payload.id]));
        toast.success(`"${selectedWord.word}" kelime listene eklendi!`);
        toast.xp(5);
        
        // Close the modal after adding word
        setTimeout(() => {
            setSelectedWord(null);
        }, 300);
    };

    // Toggle bookmark
    const handleToggleBookmark = () => {
        if (!article) return;
        
        const content = {
            id: article.id,
            title: article.title,
            type: article.type || 'article',
            level: selectedLevel,
            thumbnail: article.image || null
        };
        
        const newState = toggleBookmark(content);
        setIsArticleBookmarked(newState);
        
        if (newState) {
            toast.success('Favorilere eklendi!');
        } else {
            toast.info('Favorilerden kaldırıldı');
        }
    };

    // Render content with highlighted words
    const renderContent = () => {
        if (!article) return null;

        const paragraphs = article.content.split('\n\n');
        
        // Get user's vocabulary words for comparison
        const userWordSet = new Set(
            user.vocabulary.map(v => normalizeWord(v.word))
        );
        // Also include words added in this session
        const addedWordSet = new Set([...addedWords].map(id => {
            // Extract word from id if it's in local-word format
            if (id.startsWith('local-')) {
                return id.replace('local-', '');
            }
            return id;
        }));

        return paragraphs.map((paragraph, pIndex) => {
            if (!paragraph.trim()) return null;

            // Highlight new words - check if already in user's vocabulary
            let content = paragraph;
            article.newWords?.forEach(word => {
                const normalized = normalizeWord(word);
                const isInVocabulary = userWordSet.has(normalized) || addedWordSet.has(normalized);
                const highlightClass = isInVocabulary ? 'word-highlight-added' : 'word-highlight-new';
                
                const regex = new RegExp(`\\b(${word})\\b`, 'gi');
                content = content.replace(regex, `<span class="${highlightClass}" data-word="$1" data-added="${isInVocabulary}">$1</span>`);
            });

            return (
                <p
                    key={pIndex}
                    className={`mb-6 ${contentFontClass} ${contentLineHeightClass} text-gray-800 dark:text-gray-200`}
                    dangerouslySetInnerHTML={{ __html: content }}
                    onClick={(e) => {
                        // Only open modal for new words, not already added ones
                        if (e.target.classList.contains('word-highlight-new')) {
                            handleWordClick(e.target.dataset.word, e);
                        }
                        // For added words, just speak the word
                        if (e.target.classList.contains('word-highlight-added')) {
                            e.stopPropagation();
                            speakWord(e.target.dataset.word);
                            toast.info(`"${e.target.dataset.word}" zaten listende mevcut`);
                        }
                    }}
                />
            );
        });
    };

    if (isLoading || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18181b]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
                    <p className="text-gray-500 font-medium">İçerik yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b]">
            {/* Progress Bar (Sticky at Top) */}
            <div className="sticky top-0 left-0 right-0 z-[100] h-1 bg-gray-200 dark:bg-white/10">
                <div
                    className="h-full bg-indigo-600 transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    style={{ width: `${isCompleted ? 100 : readProgress}%` }}
                />
            </div>

            {/* Top Control Bar (Scrollable) */}
            <div className="bg-white dark:bg-[#18181b] border-b border-gray-100 dark:border-[#333]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Left */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Geri</span>
                    </button>

                    {/* Center - Level Selector */}
                    <div className="relative z-[70]">
                        <button
                            onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-900 dark:text-white"
                        >
                            <LevelBadge level={selectedLevel} />
                            <span className="font-medium">{selectedLevel} Seviyesi</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showLevelDropdown && (
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-[#27272a] rounded-xl shadow-lg border border-gray-100 dark:border-[#333] py-2 min-w-[200px] animate-slideDown">
                                {(article?.availableLevels || levels).map(level => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelChange(level)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 ${selectedLevel === level ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                            }`}
                                    >
                                        <LevelBadge level={level} />
                                        <span className={selectedLevel === level ? 'font-medium text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-300'}>
                                            {level} Seviyesi
                                        </span>
                                        {selectedLevel === level && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300" title="Dinle">
                            <Volume2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleToggleBookmark}
                            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${
                                isArticleBookmarked 
                                    ? 'text-pink-600 dark:text-pink-400' 
                                    : 'text-gray-600 dark:text-gray-300'
                            }`}
                            title={isArticleBookmarked ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        >
                            <Bookmark className={`w-5 h-5 ${isArticleBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300" title="Paylaş">
                            <Share2 className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowReaderPanel(prev => !prev)}
                                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${showReaderPanel ? 'bg-gray-100 dark:bg-white/10' : 'text-gray-600 dark:text-gray-300'}`}
                                title="Okuma tercihleri"
                                aria-haspopup="dialog"
                                aria-expanded={showReaderPanel}
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {showReaderPanel && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1b1b1f] border border-gray-100 dark:border-[#333] rounded-2xl shadow-2xl p-4 z-[90] animate-slideDown">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Okuma Tercihleri</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Metni göz konforuna göre ayarla.</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">Canlı</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Yazı Boyutu</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[{
                                                    id: 'small',
                                                    label: 'Küçük',
                                                    sample: 'Aa'
                                                }, {
                                                    id: 'medium',
                                                    label: 'Orta',
                                                    sample: 'Aa'
                                                }, {
                                                    id: 'large',
                                                    label: 'Büyük',
                                                    sample: 'Aa'
                                                }].map(option => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => updateReaderPref('fontSize', option.id)}
                                                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${readerPrefs.fontSize === option.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-200 shadow-sm'
                                                            : 'border-gray-100 dark:border-[#333] text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-white/10'}`}
                                                        aria-pressed={readerPrefs.fontSize === option.id}
                                                    >
                                                        <span className="text-lg leading-none">{option.sample}</span>
                                                        <span className="text-[11px] uppercase tracking-wide">{option.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Satır Aralığı</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[{
                                                    id: 'compact',
                                                    label: 'Sıkı'
                                                }, {
                                                    id: 'relaxed',
                                                    label: 'Rahat'
                                                }, {
                                                    id: 'spacious',
                                                    label: 'Ferahl'
                                                }].map(option => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => updateReaderPref('lineHeight', option.id)}
                                                        className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all text-left ${readerPrefs.lineHeight === option.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-200 shadow-sm'
                                                            : 'border-gray-100 dark:border-[#333] text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-white/10'}`}
                                                        aria-pressed={readerPrefs.lineHeight === option.id}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sütun Genişliği</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[{
                                                    id: 'narrow',
                                                    label: 'Dar'
                                                }, {
                                                    id: 'medium',
                                                    label: 'Standart'
                                                }, {
                                                    id: 'wide',
                                                    label: 'Geniş'
                                                }].map(option => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => updateReaderPref('width', option.id)}
                                                        className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${readerPrefs.width === option.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-200 shadow-sm'
                                                            : 'border-gray-100 dark:border-[#333] text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-white/10'}`}
                                                        aria-pressed={readerPrefs.width === option.id}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <button
                                                role="switch"
                                                aria-checked={readerPrefs.focusMode}
                                                onClick={() => updateReaderPref('focusMode', !readerPrefs.focusMode)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${readerPrefs.focusMode
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-200 shadow-sm'
                                                    : 'border-gray-100 dark:border-[#333] text-gray-700 dark:text-gray-200 hover:border-gray-200 dark:hover:border-white/10'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4" />
                                                    <span className="font-semibold">Odak Modu</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${readerPrefs.focusMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-200'}`}>
                                                    {readerPrefs.focusMode ? 'Açık' : 'Kapalı'}
                                                </span>
                                            </button>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Arka planı sadeleştirir, uzun metinlerde göz yorgunluğunu azaltır.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">
                <div className="w-full">

                    {/* Article Content */}
                    <article
                        className={`flex-1 w-full mx-auto ${contentWidthClass} transition-all duration-300 ${readerPrefs.focusMode ? 'bg-white dark:bg-[#0f1115] border border-gray-100 dark:border-gray-800 shadow-2xl rounded-3xl px-4 sm:px-8 py-8 sm:py-10' : ''}`}
                    >
                        {/* Hero Image */}
                        <div className="relative rounded-2xl overflow-hidden mb-8">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full aspect-video object-cover"
                            />
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <CategoryBadge category={article.category} />
                                <LevelBadge level={article.level} />
                            </div>
                        </div>

                        {/* Title & Meta */}
                        <header className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {article.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>📅 {new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span>
                                <span>⏱️ {article.readTime} dk okuma</span>
                                <span>📝 {article.newWords?.length || 0} yeni kelime</span>
                                <span>👁️ {article.views?.toLocaleString()} görüntülenme</span>
                            </div>
                        </header>

                        {/* Article Body */}
                        <div className={`prose prose-lg max-w-none ${contentFontClass} ${contentLineHeightClass}`}>
                            {renderContent()}
                        </div>

                        <div className="mt-16">
                            {/* Bottom Sections: Revealed only when isCompleted is true */}
                            {isCompleted ? (
                                <div className="space-y-12 animate-fadeIn">
                                    {/* Completion Section */}
                                    <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl animate-scaleIn">
                                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                            <div className="relative">
                                                <div className="text-7xl">🏆</div>
                                                <div className="absolute -top-2 -right-2 size-8 bg-yellow-400 rounded-full flex items-center justify-center text-indigo-700 font-black text-sm border-2 border-white shadow-lg">+50</div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black mb-2 italic uppercase">HARİKA BİR OKUMA!</h3>
                                                <p className="text-indigo-100 text-lg opacity-90">Bu makaleyi bitirerek kelime hazneni genişlettin ve 50 XP kazandın.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 min-w-[200px]">
                                                <button
                                                    onClick={() => navigate('/practice')}
                                                    className="px-6 py-4 rounded-xl bg-white text-indigo-700 font-black hover:bg-indigo-50 transition-all shadow-md active:scale-95"
                                                >
                                                    Kelimeleri Pratik Et
                                                </button>
                                                <button
                                                    onClick={() => navigate('/library')}
                                                    className="px-6 py-4 rounded-xl bg-indigo-500/30 text-white font-bold hover:bg-indigo-500/50 transition-all backdrop-blur-sm"
                                                >
                                                    Yeni İçerik Bul
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Words Section */}
                                    <Card className="bg-white dark:bg-[#27272a] border-gray-100 dark:border-[#333] shadow-sm">
                                        <div className="p-2 mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                                <div className="size-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                Bu İçerikte Yeni Kelimeler ({article.newWords?.length || 0})
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Öğrenmek için kelimelere tıkla.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {article.newWords?.map((word, index) => {
                                                // Ideally we'd have pre-fetched these or use a cached lookup
                                                const isAdded = user.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase());

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={(e) => handleWordClick(word, e)}
                                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${isAdded
                                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                                                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-[#333] hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-gray-900 dark:text-white">{word}</span>
                                                        </div>
                                                        {isAdded ? (
                                                            <div className="size-6 bg-green-500 rounded-full flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="size-6 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center transition-colors group-hover:bg-indigo-500">
                                                                <Plus className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={async () => {
                                                for (const word of article.newWords || []) {
                                                    if (!user.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase())) {
                                                        const results = await supabaseService.searchWords(word);
                                                        const wordInfo = results.find(w => w.word.toLowerCase() === word.toLowerCase());
                                                        if (wordInfo) {
                                                            addWord(wordInfo);
                                                            setAddedWords(prev => new Set([...prev, wordInfo.id]));
                                                        }
                                                    }
                                                }
                                                toast.success('Tüm kelimeler eklendi!');
                                            }}
                                            className="w-full mt-6 px-4 py-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Bookmark className="w-5 h-5" />
                                            Hepsini Kelime Listeme Ekle
                                        </button>
                                    </Card>

                                    {/* Similar Stories Section */}
                                    {similarArticles.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                                                    Benzer Hikayeler
                                                </h3>
                                                <div className="h-px flex-1 bg-gray-200 dark:bg-[#333] ml-6 hidden md:block"></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {similarArticles.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => navigate(`/read/${item.id}?level=${selectedLevel}`)}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-gray-100 dark:border-[#333] shadow-sm group-hover:shadow-xl transition-all duration-300">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                            <div className="absolute top-2 left-2">
                                                                <span className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                                    {item.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-gray-200 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                                            {item.title}
                                                        </h4>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 text-sm font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                        </span>
                                        Okumaya devam et...
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                </div>
            </div>

            {/* Word Popup Modal */}
            <Modal
                isOpen={!!selectedWord}
                onClose={() => setSelectedWord(null)}
                size="md"
                showCloseButton={true}
                closeOnOverlay={false}
                id="word-detail-modal"
            >
                {selectedWord && (
                    <div>
                        {/* Word Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedWord.word}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {selectedWord.phonetic && (
                                        <span className="text-gray-500 dark:text-gray-400">{selectedWord.phonetic}</span>
                                    )}
                                    <button
                                        onClick={() => speakWord(selectedWord.word)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400 transition-colors"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {selectedWord.level && <LevelBadge level={selectedWord.level} />}
                        </div>

                        {selectedWord.partOfSpeech && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic mb-4">{selectedWord.partOfSpeech}</p>
                        )}

                        {/* Meanings */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">🇹🇷</span>
                                <p className="font-medium text-gray-900 dark:text-white">{selectedWord.turkish}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-lg">🇬🇧</span>
                                <p className="text-gray-600 dark:text-gray-300">{selectedWord.definition}</p>
                            </div>
                        </div>

                        {/* Examples */}
                        {selectedWord.examples && selectedWord.examples.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase mb-2">Örnek Cümleler</p>
                                <div className="space-y-2">
                                    {selectedWord.examples.slice(0, 2).map((example, i) => (
                                        <p key={i} className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-lg italic">
                                            "{example}"
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Synonyms */}
                        {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase mb-2">Eş Anlamlılar</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedWord.synonyms.map((syn, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-sm text-gray-700 dark:text-gray-300">
                                            {syn}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            {selectedWord.isAdded ? (
                                <button
                                    disabled
                                    className="flex-1 px-4 py-3 rounded-xl bg-green-100 text-green-700 font-medium flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Listene Eklendi
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddWord}
                                    className="flex-1 px-4 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Listeme Ekle
                                </button>
                            )}
                            <button
                                onClick={() => speakWord(selectedWord.word)}
                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Click outside to close level dropdown */}
            {showReaderPanel && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowReaderPanel(false)}
                />
            )}

            {showLevelDropdown && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowLevelDropdown(false)}
                />
            )}
        </div>
    );
}
