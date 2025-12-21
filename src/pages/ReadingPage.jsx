import { useState, useEffect, useCallback } from 'react';
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
import { getNewsById } from '../data/news';
import { wordsData } from '../data/words';
import Card from '../components/Card';
import { LevelBadge, CategoryBadge } from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

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
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    // Load article
    useEffect(() => {
        const articleData = getNewsById(id, selectedLevel);
        if (articleData) {
            setArticle(articleData);
        } else {
            navigate('/library');
        }
    }, [id, selectedLevel, navigate]);

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.scrollY;
            const progress = Math.min((scrollTop / documentHeight) * 100, 100);
            setReadProgress(progress);

            // Mark as completed when reaching 90%
            if (progress >= 90 && !isCompleted) {
                setIsCompleted(true);
                setShowCompletionModal(true);
                readArticle(article?.id);
                addXp(50, 'Makale tamamlandı');
                recordActivity();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isCompleted, article, readArticle, addXp, recordActivity]);

    // Change level
    const handleLevelChange = (level) => {
        setSelectedLevel(level);
        setSearchParams({ level });
        setShowLevelDropdown(false);
    };

    // Speak word
    const speakWord = (word) => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    };

    // Handle word click
    const handleWordClick = useCallback((word, e) => {
        e.stopPropagation();

        // Find word data
        const wordInfo = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());

        if (wordInfo) {
            setSelectedWord({
                ...wordInfo,
                isAdded: user.vocabulary.some(v => v.id === wordInfo.id) || addedWords.has(wordInfo.id)
            });
        } else {
            // Create basic word info if not in database
            setSelectedWord({
                word: word,
                turkish: '-',
                definition: 'Bu kelime veritabanında bulunamadı.',
                phonetic: '',
                partOfSpeech: '',
                examples: [],
                isAdded: false
            });
        }
    }, [user.vocabulary, addedWords]);

    // Add word to vocabulary
    const handleAddWord = () => {
        if (selectedWord && selectedWord.id) {
            addWord(selectedWord);
            setAddedWords(prev => new Set([...prev, selectedWord.id]));
            setSelectedWord(prev => ({ ...prev, isAdded: true }));
            toast.success(`"${selectedWord.word}" kelime listene eklendi!`);
            toast.xp(5);
        }
    };

    // Render content with highlighted words
    const renderContent = () => {
        if (!article) return null;

        const paragraphs = article.content.split('\n\n');

        return paragraphs.map((paragraph, pIndex) => {
            if (!paragraph.trim()) return null;

            // Highlight new words
            let content = paragraph;
            article.newWords?.forEach(word => {
                const regex = new RegExp(`\\b(${word})\\b`, 'gi');
                content = content.replace(regex, `<span class="word-highlight-new" data-word="$1">$1</span>`);
            });

            return (
                <p
                    key={pIndex}
                    className="mb-6 text-lg leading-relaxed text-gray-800 dark:text-gray-200"
                    dangerouslySetInnerHTML={{ __html: content }}
                    onClick={(e) => {
                        if (e.target.classList.contains('word-highlight-new')) {
                            handleWordClick(e.target.dataset.word, e);
                        }
                    }}
                />
            );
        });
    };

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] pt-16">
            {/* Progress Bar */}
            <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-gray-200">
                <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            {/* Top Control Bar */}
            <div className="fixed top-17 left-0 right-0 z-30 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#333]">
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
                    <div className="relative">
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
                                {levels.map(level => (
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
                        <button
                            onClick={() => speakWord(article.title)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                            title="Dinle"
                        >
                            <Volume2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300" title="Kaydet">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300" title="Paylaş">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Article Content */}
                    <article className="flex-1 lg:max-w-3xl">
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
                        <div className="prose prose-lg max-w-none">
                            {renderContent()}
                        </div>

                        {/* Completion Section */}
                        {isCompleted && (
                            <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl">🎉</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Tebrikler!</h3>
                                        <p className="text-green-700 dark:text-green-400">Bu içeriği tamamladın. +50 XP kazandın!</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => navigate('/practice')}
                                        className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                                    >
                                        🎯 Kelimeleri Pratik Et
                                    </button>
                                    <button
                                        onClick={() => navigate('/library')}
                                        className="px-6 py-3 rounded-xl border border-green-600 text-green-700 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                        📚 Yeni İçerik Oku
                                    </button>
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:w-80 space-y-6">
                        {/* New Words */}
                        <Card className="sticky top-36 bg-white dark:bg-[#27272a] border-gray-100 dark:border-[#333]">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Bu İçerikte Yeni Kelimeler ({article.newWords?.length || 0})
                            </h3>

                            <div className="max-h-[400px] overflow-y-auto space-y-2 hide-scrollbar">
                                {article.newWords?.map((word, index) => {
                                    const wordInfo = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
                                    const isAdded = user.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase()) ||
                                        addedWords.has(wordInfo?.id);

                                    return (
                                        <div
                                            key={index}
                                            onClick={(e) => handleWordClick(word, e)}
                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isAdded
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{word}</span>
                                                {wordInfo && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{wordInfo.turkish}</span>
                                                )}
                                            </div>
                                            {isAdded ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    article.newWords?.forEach(word => {
                                        const wordInfo = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
                                        if (wordInfo && !user.vocabulary.some(v => v.id === wordInfo.id)) {
                                            addWord(wordInfo);
                                            setAddedWords(prev => new Set([...prev, wordInfo.id]));
                                        }
                                    });
                                    toast.success('Tüm kelimeler eklendi!');
                                }}
                                className="w-full mt-4 px-4 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                            >
                                Tümünü Ekle
                            </button>
                        </Card>

                        {/* Quick Quiz */}
                        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-100 dark:border-purple-800">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Hızlı Quiz</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Bu içeriği anladın mı? 5 soruluk quiz çöz!
                                    </p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                        +50 XP
                                    </span>
                                </div>
                            </div>
                            <button className="w-full mt-4 px-4 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
                                Quiz'e Başla
                            </button>
                        </Card>
                    </aside>
                </div>
            </div>

            {/* Word Popup Modal */}
            <Modal
                isOpen={!!selectedWord}
                onClose={() => setSelectedWord(null)}
                size="md"
                showCloseButton={true}
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
            {showLevelDropdown && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowLevelDropdown(false)}
                />
            )}
        </div>
    );
}
