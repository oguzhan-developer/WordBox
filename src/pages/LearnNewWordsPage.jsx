import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Volume2,
    XCircle,
    Sparkles,
    Loader2,
    RotateCcw,
    Trophy,
    Info,
    AlertTriangle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { supabaseService } from '../services/supabaseService';
import { LevelBadge } from '../components/Badge';
import { speak } from '../utils/speechSynthesis';

const WORDS_PER_SESSION = 10;
const XP_PER_WORD = 10;

export default function LearnNewWordsPage() {
    const navigate = useNavigate();
    const { user, addXp } = useUser();
    const toast = useToast();

    // State
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [learnedCount, setLearnedCount] = useState(0);
    const [knownCount, setKnownCount] = useState(0);
    const [direction, setDirection] = useState(null);
    const hasPlayedSound = useRef(false);

    const currentWord = words[currentIndex];
    const progress = currentIndex + 1;
    const totalWords = words.length;

    // Kelimeleri getir
    const fetchWords = useCallback(async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const randomWords = await supabaseService.getRandomWordsForLearning(
                user.id,
                user.level || 'B1',
                WORDS_PER_SESSION
            );
            setWords(randomWords);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionComplete(randomWords.length === 0);
        } catch (error) {
            console.error('Error fetching words:', error);
            toast.error('Kelimeler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [user.id, user.level, toast]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    // Başarı sesi çal
    useEffect(() => {
        if (sessionComplete && learnedCount > 0 && !hasPlayedSound.current) {
            hasPlayedSound.current = true;
            playSuccessSound();
        }
        // Session yeniden başlatınca ref'i sıfırla
        if (!sessionComplete) {
            hasPlayedSound.current = false;
        }
    }, [sessionComplete, learnedCount]);

    const playSuccessSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
            const duration = 0.15;

            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                const startTime = audioContext.currentTime + (index * 0.05);
                const endTime = startTime + duration;

                oscillator.start(startTime);
                oscillator.stop(endTime);

                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
            });

            audioContext.close();
        } catch (e) {
            console.log('Audio play failed:', e);
        }
    };

    // Sesli oku
    const handleSpeak = useCallback(() => {
        if (currentWord) {
            speak(currentWord.word, { rate: 0.85, pitch: 1.0 });
        }
    }, [currentWord]);

    // Kartı çevir
    const toggleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    // Biliyorum - Kelimeyi bildiği olarak işaretle, pas geç
    const handleKnow = useCallback(async () => {
        if (!currentWord) return;

        setDirection('right');
        await supabaseService.markWordAsKnown(user.id, currentWord.id);
        setKnownCount(prev => prev + 1);

        setTimeout(() => {
            setIsFlipped(false);
            setDirection(null);

            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setSessionComplete(true);
            }
        }, 300);
    }, [currentWord, user.id, currentIndex, words.length]);

    // Bilmiyorum - Kelimeyi öğrenme listesine ekle
    const handleLearning = useCallback(async () => {
        if (!currentWord) return;

        setDirection('left');
        const addedWord = await supabaseService.learnWord(user.id, currentWord.id);

        if (addedWord) {
            setLearnedCount(prev => prev + 1);
            addXp(XP_PER_WORD, 'Yeni kelime öğrenildi');
            // Toast kaldırıldı
        }

        setTimeout(() => {
            setIsFlipped(false);
            setDirection(null);

            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setSessionComplete(true);
            }
        }, 300);
    }, [currentWord, user.id, currentIndex, words.length, addXp]);

    // Yeni oturum başlat
    const handleNewSession = useCallback(() => {
        setLearnedCount(0);
        setKnownCount(0);
        setSessionComplete(false);
        fetchWords();
    }, [fetchWords]);

    // Kelimelerim sayfasına git
    const goToVocabulary = useCallback(() => {
        navigate('/vocabulary');
    }, [navigate]);

    // Parse usage notes and common mistakes
    const usageNotes = currentWord?.usageNotes
        ? (typeof currentWord.usageNotes === 'string'
            ? currentWord.usageNotes.split('\n').filter(n => n.trim())
            : currentWord.usageNotes)
        : [];

    const commonMistakes = currentWord?.commonMistakes
        ? (typeof currentWord.commonMistakes === 'string'
            ? currentWord.commonMistakes.split('\n').filter(m => m.trim())
            : currentWord.commonMistakes)
        : [];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Kelimeler yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Session complete state
    if (sessionComplete) {
        const totalXp = learnedCount * XP_PER_WORD;
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <div className="bg-white dark:bg-[#2a2a24] rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-[#333]">
                        {learnedCount > 0 ? (
                            <>
                                <div className="w-16 h-16 bg-primary/10 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="w-8 h-8 text-primary dark:text-primary-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Tebrikler!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Oturumu tamamladın
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-secondary/10 dark:bg-secondary-900/20 rounded-xl p-3">
                                        <div className="text-2xl font-bold text-secondary dark:text-secondary-400">{learnedCount}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Öğrenilen</div>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-primary-900/20 rounded-xl p-3">
                                        <div className="text-2xl font-bold text-primary dark:text-primary-400">+{totalXp}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Kazanılan XP</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-5xl mb-3">📚</div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Bu seviyede yeni kelime kalmadı!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {knownCount > 0 ? `${knownCount} kelimeyi zaten biliyorsun.` : 'Tüm kelimeleri öğrendin.'}
                                </p>
                            </>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={goToVocabulary}
                                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kelimelerime Git
                            </button>
                            <button
                                onClick={handleNewSession}
                                className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Yeni Oturum
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No words available state
    if (words.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <div className="bg-white dark:bg-[#2a2a24] rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-[#333]">
                        <div className="text-5xl mb-3">📚</div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Bu seviyede kelime bulunamadı
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            Başka bir seviye deneyebilir veya kütüphaneden içerik okuyarak kelime ekleyebilirsin.
                        </p>
                        <button
                            onClick={goToVocabulary}
                            className="py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kelimelerime Git
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Flashcard view
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={goToVocabulary}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Progress */}
                    <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {progress} / {totalWords} kelime
                        </div>
                        <div className="w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${(progress / totalWords) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="w-8" />
                </div>

                 
                {/* Flashcard */}
                <div className="perspective-1000 mb-4">
                    <div
                        className={`relative w-full min-h-[280px] transition-all duration-500 ${
                            isFlipped ? 'flipped' : ''
                        }`}
                        onClick={toggleFlip}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                    >
                        {/* Front - English */}
                        <div className="absolute inset-0 bg-white dark:bg-[#2a2a24] rounded-2xl shadow-lg border border-gray-200 dark:border-[#333] p-6 flex flex-col items-center justify-center"
                            style={{
                                backfaceVisibility: 'hidden',
                            }}>
                            {/* Level badge */}
                            <div className="absolute top-3 right-3">
                                <LevelBadge level={currentWord.level} size="sm" />
                            </div>

                            {/* Word */}
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                                {currentWord.word}
                            </h2>

                            {/* Phonetic */}
                            {currentWord.phonetic && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                    /{currentWord.phonetic}/
                                </p>
                            )}

                            {/* Part of speech */}
                            {currentWord.partOfSpeech && (Array.isArray(currentWord.partOfSpeech) ? currentWord.partOfSpeech : [currentWord.partOfSpeech]).filter(Boolean).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {(Array.isArray(currentWord.partOfSpeech) ? currentWord.partOfSpeech : [currentWord.partOfSpeech]).filter(Boolean).map((pos, idx) => (
                                        <span key={idx} className="px-2.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                            {pos}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Audio button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSpeak();
                                }}
                                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>

                            {/* Tap hint */}
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
                                Çeviri için dokunun
                            </p>
                        </div>

                        {/* Back - Turkish */}
                        <div className="absolute inset-0 bg-primary rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center overflow-y-auto"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}>
                            {/* Turkish meaning */}
                            <h2 className="text-2xl font-bold text-white text-center mb-3">
                                {currentWord.turkish || currentWord.meaningsTr?.[0] || '-'}
                            </h2>

                            {/* Definition */}
                            {currentWord.definition && (
                                <p className="text-white/90 text-center text-sm max-w-md mb-3">
                                    {currentWord.definition}
                                </p>
                            )}

                            {/* Examples with Turkish */}
                            {currentWord.examples && currentWord.examples.length > 0 && (
                                <div className="w-full max-w-md space-y-1.5 mb-3">
                                    {currentWord.examples.slice(0, 2).map((example, i) => {
                                        const enText = typeof example === 'string' ? example : example.en || example;
                                        const trText = currentWord.examplesTr?.[i] || (typeof example === 'object' ? example.tr : null);

                                        return (
                                            <div key={i} className="bg-white/10 rounded-lg p-2">
                                                <p className="text-white text-xs italic">"{enText}"</p>
                                                {trText && <p className="text-white/70 text-xs mt-0.5">"{trText}"</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Usage Notes */}
                            {usageNotes.length > 0 && (
                                <div className="w-full max-w-md mb-2">
                                    <div className="flex items-center gap-1 text-blue-300 text-xs font-medium mb-1">
                                        <Info className="w-3 h-3" />
                                        Kullanım
                                    </div>
                                    <p className="text-white/80 text-xs">{usageNotes[0]}</p>
                                </div>
                            )}

                            {/* Common Mistakes */}
                            {commonMistakes.length > 0 && (
                                <div className="w-full max-w-md">
                                    <div className="flex items-center gap-1 text-amber-300 text-xs font-medium mb-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Dikkat
                                    </div>
                                    <p className="text-white/80 text-xs">
                                        {typeof commonMistakes[0] === 'string'
                                            ? commonMistakes[0]
                                            : `${commonMistakes[0]?.incorrect} → ${commonMistakes[0]?.correct}`}
                                    </p>
                                </div>
                            )}

                            {/* Tap hint */}
                            <p className="text-white/50 text-xs mt-3">
                                Tekrar dokunun
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={handleKnow}
                        className="flex-1 max-w-[160px] py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <XCircle className="w-5 h-5" />
                        Biliyorum
                    </button>
                    <button
                        onClick={handleLearning}
                        className="flex-1 max-w-[160px] py-3 bg-primary hover:bg-primary-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Sparkles className="w-5 h-5" />
                        Öğren
                    </button>
                </div>

                {/* XP hint */}
                <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-3">
                    Öğren butonu ile kelime listene eklenir (+{XP_PER_WORD} XP)
                </p>
            </div>

            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
