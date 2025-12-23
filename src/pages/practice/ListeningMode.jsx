import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Volume2, CheckCircle, XCircle, ArrowRight, Trophy, Target, Zap, Headphones, Play, RotateCcw, VolumeX } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import { calculatePracticeXp } from '../../utils/gamification';
import { speak } from '../../utils/speechSynthesis';
import { recordReview } from '../../utils/spacedRepetition';
import { levenshteinDistance } from '../../utils/stringUtils';

export default function ListeningMode() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, addXp, recordActivity, completePractice, updateWordPractice } = useUser();
    const toast = useToast();
    const inputRef = useRef(null);

    // Settings from URL
    const wordCount = parseInt(searchParams.get('count')) || 20;
    const _wordSource = searchParams.get('source') || 'all';
    const _dbLevel = searchParams.get('level') || user.level || 'B1';

    // State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [results, setResults] = useState({ correct: 0, wrong: 0 });
    const [isComplete, setIsComplete] = useState(false);
    const [endTime, setEndTime] = useState(null);
    const [startTime] = useState(() => Date.now());
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const questionStartTimeRef = useRef(null);
    const [questionTimes, setQuestionTimes] = useState([]);
    const [playCount, setPlayCount] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

    // Initialize time refs on mount
    useEffect(() => {
        questionStartTimeRef.current = Date.now();
    }, []);

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

            setQuestions(practiceWords);
        };

        loadWords();
    }, [wordCount, user.vocabulary]);

    const currentQuestion = questions[currentIndex];
    const progress = (currentIndex / questions.length) * 100;

    // Play word with TTS - must be defined before effects that use it
    const playWord = useCallback(() => {
        if (!currentQuestion || isSpeaking) return;

        setIsSpeaking(true);
        setPlayCount(prev => prev + 1);

        speak(currentQuestion.word, {
            rate: playCount === 0 ? 0.8 : 0.6, // Slower on repeat
            pitch: 1.0,
            volume: 1.0,
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });

        // Fallback to reset speaking state
        setTimeout(() => setIsSpeaking(false), 3000);
    }, [currentQuestion, isSpeaking, playCount]);

    // Focus input on new question
    useEffect(() => {
        if (inputRef.current && !isAnswered) {
            inputRef.current.focus();
        }
    }, [currentIndex, isAnswered]);

    // Auto-play word on new question
    useEffect(() => {
        if (currentQuestion && !hasAutoPlayed && !isAnswered) {
            const timer = setTimeout(() => {
                playWord();
                setHasAutoPlayed(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, hasAutoPlayed, isAnswered, playWord]);

    // Check answer
    const checkAnswer = useCallback(() => {
        if (isAnswered || !userAnswer.trim()) return;

        const timeTaken = Date.now() - questionStartTimeRef.current;
        setQuestionTimes(prev => [...prev, timeTaken]);

        // Normalize answers
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = currentQuestion.word.toLowerCase();

        // Check if correct (allow 1 character difference for words > 4 chars)
        const isExactMatch = normalizedUserAnswer === normalizedCorrectAnswer;
        const isCloseMatch = currentQuestion.word.length > 4 && 
            levenshteinDistance(normalizedUserAnswer, normalizedCorrectAnswer) <= 1;

        const correct = isExactMatch || isCloseMatch;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (correct) {
            setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
            setCombo(prev => {
                const newCombo = prev + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });

            // Combo bonus
            if (combo + 1 >= 5 && (combo + 1) % 5 === 0) {
                toast.success(`🔥 ${combo + 1}x Combo! Bonus XP!`);
            }

            // Quick answer bonus
            if (timeTaken < 8000) {
                toast.success('⚡ Hızlı cevap! +5 XP');
            }

            // First try bonus
            if (playCount <= 1) {
                toast.success('👂 İlk dinlemede! +3 XP');
            }

            if (isCloseMatch && !isExactMatch) {
                toast.info('✨ Neredeyse doğru! Küçük yazım hatası var.');
            }
        } else {
            setResults(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            setCombo(0);
        }

        // Update word practice status
        if (currentQuestion.id && user.vocabulary.some(v => v.id === currentQuestion.id)) {
            updateWordPractice(currentQuestion.id, correct);
        }

        // SRS tracking
        if (currentQuestion.id) {
            recordReview(currentQuestion.id, correct);
        }
    }, [isAnswered, userAnswer, currentQuestion, combo, maxCombo, toast, updateWordPractice, user.vocabulary, playCount]);

    // Go to next question
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setIsAnswered(false);
            setIsCorrect(false);
            questionStartTimeRef.current = Date.now();
            setPlayCount(0);
            setHasAutoPlayed(false);
        } else {
            completePractice(results.correct + (isCorrect ? 1 : 0), results.wrong + (isCorrect ? 0 : 1));
            setEndTime(Date.now());
            setIsComplete(true);
        }
    }, [currentIndex, questions.length, results, isCorrect, completePractice]);

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (!isAnswered) {
                checkAnswer();
            } else {
                handleNext();
            }
        }
    };

    // Handle completion
    const handleComplete = () => {
        const baseXp = calculatePracticeXp(results.correct, results.wrong);
        const comboBonus = Math.floor(maxCombo / 5) * 10;
        const quickAnswerBonus = questionTimes.filter(t => t < 8000).length * 5;
        const firstTryBonus = questions.filter((_, i) => questionTimes[i] && playCount <= 1).length * 3;
        const totalXp = baseXp + comboBonus + quickAnswerBonus + firstTryBonus;

        addXp(totalXp, 'Dinleme pratiği tamamlandı');
        recordActivity();
        navigate('/practice');
    };

    // Handle exit
    const handleExit = () => {
        if (currentIndex > 0 && !isComplete) {
            setShowExitConfirm(true);
        } else {
            navigate('/practice');
        }
    };

    // Loading state
    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Kelimeler hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    const accuracy = currentIndex > 0 || isAnswered
        ? Math.round((results.correct / (results.correct + results.wrong || 1)) * 100)
        : 0;

    const baseXp = calculatePracticeXp(results.correct, results.wrong);
    const comboBonus = Math.floor(maxCombo / 5) * 10;
    const quickAnswerBonus = questionTimes.filter(t => t < 8000).length * 5;
    const totalXp = baseXp + comboBonus + quickAnswerBonus;

    // Complete screen
    if (isComplete) {
        const totalTime = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;

        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center">
                        {/* Trophy */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Harika Dinleme! 👂
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Dinle & Yaz pratiğini tamamladın!
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{results.correct}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Doğru</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
                                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{results.wrong}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Yanlış</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
                                <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{accuracy}%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Doğruluk</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{maxCombo}x</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Max Combo</p>
                            </div>
                        </div>

                        {/* Time & XP */}
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm opacity-80">Süre</p>
                                    <p className="text-xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-80">Kazanılan XP</p>
                                    <p className="text-3xl font-bold">+{totalXp}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleComplete}
                            >
                                Tamamla ve Devam Et
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                fullWidth
                                onClick={() => window.location.reload()}
                            >
                                Tekrar Oyna
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-6 pb-12">
            <div className="max-w-2xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleExit}
                        className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
                        aria-label="Çık"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Combo */}
                        {combo >= 3 && (
                            <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-bold text-sm animate-pulse">
                                🔥 {combo}x Combo!
                            </div>
                        )}

                        {/* Progress */}
                        <div className="text-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Soru</span>
                            <p className="font-bold text-gray-900 dark:text-white">
                                {currentIndex + 1}/{questions.length}
                            </p>
                        </div>

                        {/* XP */}
                        <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold text-sm shadow-lg">
                            +{totalXp} XP
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
                    {/* Level Badge */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-bold">
                            <Headphones className="w-4 h-4" />
                            Dinle & Yaz
                        </div>
                        {currentQuestion.level && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold">
                                {currentQuestion.level}
                            </span>
                        )}
                    </div>

                    {/* Audio Player */}
                    <div className="text-center mb-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Kelimeyi dinle ve doğru şekilde yaz
                        </p>

                        {/* Play Button */}
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={playWord}
                                disabled={isSpeaking}
                                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all transform ${
                                    isSpeaking
                                        ? 'bg-yellow-500 scale-110 animate-pulse'
                                        : 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-105 hover:shadow-xl hover:shadow-yellow-200 dark:hover:shadow-yellow-900/30'
                                }`}
                            >
                                {isSpeaking ? (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-8 bg-white rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1 h-12 bg-white rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1 h-6 bg-white rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                                        <div className="w-1 h-10 bg-white rounded animate-pulse" style={{ animationDelay: '450ms' }} />
                                        <div className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '600ms' }} />
                                    </div>
                                ) : (
                                    <Play className="w-16 h-16 text-white ml-2" fill="white" />
                                )}
                            </button>

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <button
                                    onClick={playWord}
                                    disabled={isSpeaking}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Tekrar Dinle
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <span>Dinleme: {playCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Translation Hint */}
                    {currentQuestion.translation && (
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 mb-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">İpucu:</span> {currentQuestion.translation}
                            </p>
                        </div>
                    )}

                    {/* Input */}
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isAnswered}
                            placeholder="Duyduğun kelimeyi yaz..."
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all outline-none ${
                                isAnswered
                                    ? isCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'border-gray-200 dark:border-slate-600 focus:border-yellow-500 dark:focus:border-yellow-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                            }`}
                        />
                        {isAnswered && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isCorrect ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    {!isAnswered && (
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={checkAnswer}
                            disabled={!userAnswer.trim()}
                            className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-600"
                        >
                            <Headphones className="w-5 h-5 mr-2" />
                            Kontrol Et
                        </Button>
                    )}
                </div>

                {/* Feedback & Next */}
                {isAnswered && (
                    <div className="animate-slideUp">
                        {/* Feedback */}
                        <div className={`rounded-2xl p-4 mb-4 ${
                            isCorrect
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                            <div className="flex items-center gap-2 font-bold mb-1">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Doğru! 🎉
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        Yanlış! 😔
                                    </>
                                )}
                            </div>
                            <p className="text-sm mb-2">
                                Kelime: <strong>{currentQuestion.word}</strong>
                            </p>
                            {!isCorrect && (
                                <p className="text-sm opacity-80">
                                    Senin cevabın: <span className="line-through">{userAnswer}</span>
                                </p>
                            )}
                            <button
                                onClick={playWord}
                                className="mt-2 flex items-center gap-1 text-sm opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <Volume2 className="w-4 h-4" />
                                Tekrar Dinle
                            </button>
                        </div>

                        {/* Next Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleNext}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600"
                        >
                            {currentIndex < questions.length - 1 ? (
                                <>
                                    Sonraki Soru
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            ) : (
                                <>
                                    Testi Bitir
                                    <Trophy className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Exit Confirmation Modal */}
                {showExitConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Pratikten çık?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                İlerleme kaydedilmeyecek. Emin misin?
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
