import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Volume2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { CircularProgress } from '../../components/ProgressBar';
import { LevelBadge } from '../../components/Badge';
import { SuccessModal } from '../../components/Modal';
import { calculatePracticeXp } from '../../utils/gamification';
import { speak } from '../../utils/speechSynthesis';
import { recordReview } from '../../utils/spacedRepetition';

export default function FlashcardMode() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, addXp, recordActivity, completePractice, updateWordPractice } = useUser();
    const toast = useToast();

    // Settings from URL
    const wordCount = parseInt(searchParams.get('count')) || 20;
    const _wordSource = searchParams.get('source') || 'all';
    const _dbLevel = searchParams.get('level') || user.level || 'B1';

    // State
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState({ correct: 0, hard: 0, wrong: 0 });
    const [answeredCards, setAnsweredCards] = useState(new Set());
    const [isComplete, setIsComplete] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [combo, setCombo] = useState(0);

    // Load words
    useEffect(() => {
        const loadWords = async () => {
            let practiceWords = [];

            // Use user's vocabulary only
            if (user.vocabulary.length >= wordCount) {
                practiceWords = [...user.vocabulary]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, wordCount);
            } else if (user.vocabulary.length > 0) {
                // If not enough words, use what's available
                practiceWords = [...user.vocabulary].sort(() => Math.random() - 0.5);
            }

            setWords(practiceWords);
        };

        loadWords();
    }, [wordCount, user.vocabulary]);

    const currentWord = words[currentIndex];
    const progress = (answeredCards.size / words.length) * 100;

    // Speak word with enhanced TTS
    const speakWord = useCallback(() => {
        if (!currentWord) return;
        speak(currentWord.word, {
            rate: 0.85,
            pitch: 1.0,
            volume: 1.0,
        });
    }, [currentWord]);

    // Handle answer
    const handleAnswer = useCallback((type) => {
        if (!currentWord || answeredCards.has(currentWord.id)) return;

        setAnsweredCards(prev => new Set([...prev, currentWord.id]));
        
        // Record SRS review
        const wordId = currentWord.id || currentWord.word;
        const isCorrect = type === 'correct';
        recordReview(wordId, isCorrect);

        if (type === 'correct') {
            setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
            setCombo(prev => prev + 1);

            // Combo bonus
            if (combo + 1 >= 5 && (combo + 1) % 5 === 0) {
                toast.success(`🔥 ${combo + 1}x Combo! Bonus XP!`);
            }
        } else if (type === 'hard') {
            setResults(prev => ({ ...prev, hard: prev.hard + 1 }));
            setCombo(0);
        } else {
            setResults(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            setCombo(0);
        }

        // Update word practice status
        if (currentWord.id && user.vocabulary.some(v => v.id === currentWord.id)) {
            updateWordPractice(currentWord.id, type === 'correct');
        }

        // Move to next card or complete
        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsFlipped(false);
            } else {
                // Practice complete
                completePractice(results.correct + 1, results.wrong);
                setIsComplete(true);
            }
        }, 300);
    }, [currentWord, currentIndex, words.length, answeredCards, combo, results, toast, updateWordPractice, completePractice, user.vocabulary]);

    // Navigate cards
    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const goToNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    // Handle completion
    const handleComplete = () => {
        const xpEarned = calculatePracticeXp(results.correct, results.wrong);
        addXp(xpEarned, 'Flashcard pratiği tamamlandı');
        recordActivity();
        navigate('/practice');
    };

    // Handle exit
    const handleExit = () => {
        if (answeredCards.size > 0 && !isComplete) {
            setShowExitConfirm(true);
        } else {
            navigate('/practice');
        }
    };

    if (words.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    const xpEarned = calculatePracticeXp(results.correct, results.wrong);
    const _accuracy = answeredCards.size > 0
        ? Math.round((results.correct / answeredCards.size) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-12">
            <div className="max-w-2xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleExit}
                        className="p-2 rounded-xl hover:bg-white/50 transition-colors text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Progress */}
                        <div className="text-center">
                            <span className="text-sm text-gray-500">İlerleme</span>
                            <p className="font-bold text-gray-900">
                                {answeredCards.size}/{words.length}
                            </p>
                        </div>

                        {/* Combo */}
                        {combo >= 3 && (
                            <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-bold text-sm animate-pulse">
                                🔥 {combo}x Combo!
                            </div>
                        )}

                        {/* XP */}
                        <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-sm">
                            +{xpEarned} XP
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Flashcard */}
                <div
                    className={`card-flip h-96 cursor-pointer mb-8 ${isFlipped ? 'flipped' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className="card-flip-inner relative w-full h-full">
                        {/* Front Side */}
                        <div className="card-flip-front absolute inset-0">
                            <Card className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-xl">
                                {/* Level Badge */}
                                <div className="absolute top-4 right-4">
                                    <LevelBadge level={currentWord.level || 'B1'} />
                                </div>

                                {/* Word */}
                                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
                                    {currentWord.word}
                                </h2>

                                {/* Phonetic */}
                                <p className="text-gray-500 mb-4">{currentWord.phonetic}</p>

                                {/* Listen Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord();
                                    }}
                                    className="p-3 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>

                                {/* Hint */}
                                <p className="absolute bottom-6 text-sm text-gray-400">
                                    Çevirmek için tıkla
                                </p>
                            </Card>
                        </div>

                        {/* Back Side */}
                        <div className="card-flip-back absolute inset-0">
                            <Card className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
                                {/* Part of Speech */}
                                <span className="absolute top-4 left-4 text-sm text-gray-400 italic">
                                    {currentWord.partOfSpeech}
                                </span>

                                {/* Listen Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord();
                                    }}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/50 text-indigo-600 hover:bg-white transition-colors"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>

                                {/* Turkish Meaning */}
                                <h3 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-4 text-center">
                                    {currentWord.turkish}
                                </h3>

                                {/* English Definition */}
                                <p className="text-gray-600 text-center max-w-md mb-6 px-4">
                                    {currentWord.definition}
                                </p>

                                {/* Example */}
                                {currentWord.examples && currentWord.examples[0] && (
                                    <p className="text-sm text-gray-500 italic text-center px-8 line-clamp-2">
                                        "{currentWord.examples[0]}"
                                    </p>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        onClick={() => handleAnswer('wrong')}
                        disabled={answeredCards.has(currentWord?.id)}
                        className="py-4 px-6 rounded-2xl bg-red-500 text-white font-bold text-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        😕 Bilmiyorum
                    </button>
                    <button
                        onClick={() => handleAnswer('hard')}
                        disabled={answeredCards.has(currentWord?.id)}
                        className="py-4 px-6 rounded-2xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        🤔 Zorlandım
                    </button>
                    <button
                        onClick={() => handleAnswer('correct')}
                        disabled={answeredCards.has(currentWord?.id)}
                        className="py-4 px-6 rounded-2xl bg-green-500 text-white font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        ✅ Biliyorum
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Önceki
                    </button>

                    <div className="flex gap-1">
                        {words.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => {
                            const actualIndex = Math.max(0, currentIndex - 2) + i;
                            return (
                                <div
                                    key={actualIndex}
                                    className={`w-2 h-2 rounded-full transition-all ${actualIndex === currentIndex
                                        ? 'bg-indigo-600 w-6'
                                        : answeredCards.has(words[actualIndex]?.id)
                                            ? 'bg-green-400'
                                            : 'bg-gray-300'
                                        }`}
                                />
                            );
                        })}
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentIndex === words.length - 1}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Sonraki
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-8 p-4 bg-white/50 backdrop-blur rounded-2xl">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">{results.correct}</p>
                            <p className="text-xs text-gray-500">Doğru</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-500">{results.hard}</p>
                            <p className="text-xs text-gray-500">Zorlandım</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-500">{results.wrong}</p>
                            <p className="text-xs text-gray-500">Yanlış</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completion Modal */}
            <SuccessModal
                isOpen={isComplete}
                onClose={handleComplete}
                title="Tebrikler! 🎉"
                message={`${words.length} kartı tamamladın!`}
                xpEarned={xpEarned}
                buttonText="Harika!"
            />

            {/* Exit Confirmation */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <Card className="max-w-sm w-full text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Çıkmak istediğine emin misin?</h3>
                        <p className="text-gray-600 mb-6">İlerleme kaydedilmeyecek.</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => setShowExitConfirm(false)}
                            >
                                Devam Et
                            </Button>
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={() => navigate('/practice')}
                            >
                                Çık
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
