import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Volume2, CheckCircle, XCircle, ArrowRight, Trophy, Target, Zap, PenTool, Lightbulb } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import { supabaseService } from '../../services/supabaseService';
import Button from '../../components/Button';
import { calculatePracticeXp } from '../../utils/gamification';
import { speak } from '../../utils/speechSynthesis';
import { recordReview } from '../../utils/spacedRepetition';

export default function FillBlankMode() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, addXp, recordActivity, completePractice, updateWordPractice } = useUser();
    const toast = useToast();
    const inputRef = useRef(null);

    // Settings from URL
    const wordCount = parseInt(searchParams.get('count')) || 20;

    // State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [results, setResults] = useState({ correct: 0, wrong: 0 });
    const [isComplete, setIsComplete] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [startTime] = useState(Date.now());
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [questionTimes, setQuestionTimes] = useState([]);

    // Generate fill-in-the-blank questions
    const generateQuestions = useCallback((words) => {
        return words.map(word => {
            // Create a sentence with blank
            let sentence = word.example || `The word "___" means ${word.translation}.`;
            
            // Replace the word with blank
            if (word.example) {
                const regex = new RegExp(`\\b${word.word}\\b`, 'gi');
                sentence = sentence.replace(regex, '_____');
            }

            // Generate hint (first letter + length)
            const hint = word.word.charAt(0) + '_'.repeat(word.word.length - 1);

            return {
                id: word.id,
                word: word.word,
                translation: word.translation,
                partOfSpeech: word.partOfSpeech,
                level: word.level,
                sentence,
                hint,
                example: word.example
            };
        });
    }, []);

    // Load words
    useEffect(() => {
        const loadWords = async () => {
            let practiceWords = [];

            if (user.vocabulary.length >= wordCount) {
                // Prefer words with examples
                const wordsWithExamples = user.vocabulary.filter(w => w.example);
                const wordsWithoutExamples = user.vocabulary.filter(w => !w.example);
                
                if (wordsWithExamples.length >= wordCount) {
                    practiceWords = [...wordsWithExamples]
                        .sort(() => Math.random() - 0.5)
                        .slice(0, wordCount);
                } else {
                    practiceWords = [
                        ...wordsWithExamples,
                        ...wordsWithoutExamples.slice(0, wordCount - wordsWithExamples.length)
                    ].sort(() => Math.random() - 0.5);
                }
            } else if (user.vocabulary.length > 0) {
                practiceWords = [...user.vocabulary];
                const remaining = wordCount - practiceWords.length;
                const randomWords = await supabaseService.getRandomWords(remaining);
                practiceWords = [...practiceWords, ...randomWords].sort(() => Math.random() - 0.5);
            } else {
                const randomWords = await supabaseService.getRandomWords(wordCount);
                practiceWords = randomWords;
            }

            const generatedQuestions = generateQuestions(practiceWords);
            setQuestions(generatedQuestions);
        };

        loadWords();
    }, [wordCount, user.vocabulary, generateQuestions]);

    const currentQuestion = questions[currentIndex];
    const progress = (currentIndex / questions.length) * 100;

    // Focus input on new question
    useEffect(() => {
        if (inputRef.current && !isAnswered) {
            inputRef.current.focus();
        }
    }, [currentIndex, isAnswered]);

    // Speak word
    const speakWord = useCallback(() => {
        if (!currentQuestion) return;
        speak(currentQuestion.word, {
            rate: 0.85,
            pitch: 1.0,
            volume: 1.0,
        });
    }, [currentQuestion]);

    // Check answer
    const checkAnswer = useCallback(() => {
        if (isAnswered || !userAnswer.trim()) return;

        const timeTaken = Date.now() - questionStartTime;
        setQuestionTimes(prev => [...prev, timeTaken]);

        // Normalize answers for comparison
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = currentQuestion.word.toLowerCase();

        // Check if correct (also accept minor typos - 1 character difference for words > 4 chars)
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
            if (timeTaken < 5000) {
                toast.success('⚡ Hızlı cevap! +5 XP');
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
    }, [isAnswered, userAnswer, currentQuestion, combo, maxCombo, toast, updateWordPractice, user.vocabulary, questionStartTime]);

    // Levenshtein distance for typo tolerance
    const levenshteinDistance = (str1, str2) => {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
                }
            }
        }
        return dp[m][n];
    };

    // Use hint
    const useHint = () => {
        if (!showHint && currentQuestion) {
            setShowHint(true);
            setHintsUsed(prev => prev + 1);
            toast.info(`💡 İpucu: ${currentQuestion.hint}`);
        }
    };

    // Go to next question
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setIsAnswered(false);
            setIsCorrect(false);
            setShowHint(false);
            setQuestionStartTime(Date.now());
        } else {
            completePractice(results.correct + (isCorrect ? 1 : 0), results.wrong + (isCorrect ? 0 : 1));
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
        const quickAnswerBonus = questionTimes.filter(t => t < 5000).length * 5;
        const hintPenalty = hintsUsed * 2;
        const totalXp = Math.max(0, baseXp + comboBonus + quickAnswerBonus - hintPenalty);

        addXp(totalXp, 'Boşluk doldurma testi tamamlandı');
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Sorular hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    const accuracy = currentIndex > 0 || isAnswered
        ? Math.round((results.correct / (results.correct + results.wrong || 1)) * 100)
        : 0;

    const baseXp = calculatePracticeXp(results.correct, results.wrong);
    const comboBonus = Math.floor(maxCombo / 5) * 10;
    const quickAnswerBonus = questionTimes.filter(t => t < 5000).length * 5;
    const hintPenalty = hintsUsed * 2;
    const totalXp = Math.max(0, baseXp + comboBonus + quickAnswerBonus - hintPenalty);

    // Complete screen
    if (isComplete) {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center">
                        {/* Trophy */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/30">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Harika! 🎉
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Boşluk doldurma testini tamamladın!
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
                            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4">
                                <Target className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{accuracy}%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Doğruluk</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{maxCombo}x</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Max Combo</p>
                            </div>
                        </div>

                        {/* Time & XP */}
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 mb-6 text-white">
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
                            {hintsUsed > 0 && (
                                <p className="text-xs opacity-70 mt-2">İpucu kullandın: -{hintPenalty} XP</p>
                            )}
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-6 pb-12">
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
                        <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full font-bold text-sm shadow-lg">
                            +{totalXp} XP
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
                    {/* Word Level Badge */}
                    <div className="flex items-center justify-between mb-4">
                        {currentQuestion.level && (
                            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                                {currentQuestion.level}
                            </span>
                        )}
                        <button
                            onClick={useHint}
                            disabled={showHint}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                showHint 
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' 
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600'
                            }`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            {showHint ? currentQuestion.hint : 'İpucu'}
                        </button>
                    </div>

                    {/* Translation */}
                    <div className="text-center mb-6">
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Bu kelimenin İngilizcesi nedir?</p>
                        <div className="flex items-center justify-center gap-3">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {currentQuestion.translation}
                            </h2>
                        </div>
                        {currentQuestion.partOfSpeech && (
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 italic">
                                ({currentQuestion.partOfSpeech})
                            </p>
                        )}
                    </div>

                    {/* Sentence with blank */}
                    {currentQuestion.example && (
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                <PenTool className="w-4 h-4" />
                                Örnek cümle:
                            </p>
                            <p className="text-gray-800 dark:text-gray-200 italic">
                                "{currentQuestion.sentence}"
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
                            placeholder="Cevabınızı yazın..."
                            className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all outline-none ${
                                isAnswered
                                    ? isCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'border-gray-200 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
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
                            className="mt-4 bg-gradient-to-r from-green-500 to-teal-600"
                        >
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
                            {!isCorrect && (
                                <p className="text-sm">
                                    Doğru cevap: <strong>{currentQuestion.word}</strong>
                                </p>
                            )}
                            <button
                                onClick={speakWord}
                                className="mt-2 flex items-center gap-1 text-sm opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <Volume2 className="w-4 h-4" />
                                Dinle
                            </button>
                        </div>

                        {/* Next Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleNext}
                            className="bg-gradient-to-r from-green-500 to-teal-600"
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
                                Testten çık?
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
