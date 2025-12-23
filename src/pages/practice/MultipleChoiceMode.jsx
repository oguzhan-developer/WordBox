import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Volume2, CheckCircle, XCircle, ArrowRight, Trophy, Target, Zap } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import PracticeSummary from '../../components/PracticeSummary';
import { calculatePracticeXp } from '../../utils/gamification';
import { speak } from '../../utils/speechSynthesis';
import { recordReview } from '../../utils/spacedRepetition';

export default function MultipleChoiceMode() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, addXp, recordActivity, completePractice, updateWordPractice } = useUser();
    const toast = useToast();

    // Settings from URL
    const wordCount = parseInt(searchParams.get('count')) || 20;
    const wordSource = searchParams.get('source') || 'all';
    const dbLevel = searchParams.get('level') || user.level || 'B1';

    // State
    const [_allWords, setAllWords] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [results, setResults] = useState({ correct: 0, wrong: 0 });
    const [isComplete, setIsComplete] = useState(false);
    const [endTime, setEndTime] = useState(null);
    const [startTime] = useState(() => Date.now());
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [questionTimes, setQuestionTimes] = useState([]);
    const questionStartTimeRef = useRef(null);
    const [missedWords, setMissedWords] = useState([]);

    // Initialize time refs on mount
    useEffect(() => {
        questionStartTimeRef.current = Date.now();
    }, []);

    // Generate questions from words
    const generateQuestions = useCallback((words, practiceWords) => {
        return practiceWords.map(word => {
            // Get 3 random wrong answers
            const otherWords = words.filter(w => w.id !== word.id);
            const shuffledOthers = otherWords.sort(() => Math.random() - 0.5);
            const wrongAnswers = shuffledOthers.slice(0, 3).map(w => ({
                id: w.id,
                text: w.translation,
                isCorrect: false
            }));

            // Create correct answer
            const correctAnswer = {
                id: word.id,
                text: word.translation,
                isCorrect: true
            };

            // Shuffle all options
            const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

            return {
                id: word.id,
                word: word.word,
                partOfSpeech: word.partOfSpeech,
                level: word.level,
                correctAnswer: word.translation,
                options,
                example: word.example
            };
        });
    }, []);

    // Load words
    useEffect(() => {
        const loadWords = async () => {
            let practiceWords = [];
            let allAvailableWords = [];

            // Use user's vocabulary only
            if (user.vocabulary.length >= wordCount) {
                practiceWords = [...user.vocabulary]
                    .map(w => ({ ...w, translation: w.turkish || w.meaningsTr?.[0] || '' }))
                    .sort(() => Math.random() - 0.5)
                    .slice(0, wordCount);
                allAvailableWords = [...user.vocabulary.map(w => ({ ...w, translation: w.turkish || '' }))];
            } else if (user.vocabulary.length > 0) {
                // If not enough words, use what's available
                practiceWords = [...user.vocabulary]
                    .map(w => ({ ...w, translation: w.turkish || '' }))
                    .sort(() => Math.random() - 0.5);
                allAvailableWords = [...user.vocabulary.map(w => ({ ...w, translation: w.turkish || '' }))];
            }

            // Remove duplicates from allAvailableWords
            const uniqueWords = Array.from(new Map(allAvailableWords.map(w => [w.id, w])).values());

            setAllWords(uniqueWords);
            const generatedQuestions = generateQuestions(uniqueWords, practiceWords);
            setQuestions(generatedQuestions);
        };

        loadWords();
    }, [wordCount, wordSource, dbLevel, user.vocabulary, generateQuestions]);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    // Speak word
    const speakWord = useCallback(() => {
        if (!currentQuestion) return;
        speak(currentQuestion.word, {
            rate: 0.85,
            pitch: 1.0,
            volume: 1.0,
        });
    }, [currentQuestion]);

    // Handle answer selection
    const handleSelectAnswer = useCallback((option) => {
        if (isAnswered) return;

        setSelectedAnswer(option);
        setIsAnswered(true);

        const timeTaken = Date.now() - questionStartTimeRef.current;
        setQuestionTimes(prev => [...prev, timeTaken]);
        
        // Record SRS review
        const wordId = currentQuestion.id || currentQuestion.word;
        recordReview(wordId, option.isCorrect);

        if (option.isCorrect) {
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
            if (timeTaken < 3000) {
                toast.success('⚡ Hızlı cevap! +5 XP');
            }
        } else {
            setResults(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            setCombo(0);
            // Track missed word
            setMissedWords(prev => [...prev, {
                word: currentQuestion.word,
                translation: currentQuestion.correctAnswer
            }]);
        }

        // Update word practice status
        if (currentQuestion.id && user.vocabulary.some(v => v.id === currentQuestion.id)) {
            updateWordPractice(currentQuestion.id, option.isCorrect);
        }
    }, [isAnswered, currentQuestion, combo, maxCombo, toast, updateWordPractice, user.vocabulary]);

    // Go to next question
    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            questionStartTimeRef.current = Date.now();
        } else {
            // Practice complete
            completePractice(results.correct + (selectedAnswer?.isCorrect ? 1 : 0), results.wrong + (selectedAnswer?.isCorrect ? 0 : 1));
            setEndTime(Date.now());
            setIsComplete(true);
        }
    }, [currentIndex, questions.length, results, selectedAnswer, completePractice]);

    // Handle completion
    const handleComplete = () => {
        const baseXp = calculatePracticeXp(results.correct, results.wrong);
        const comboBonus = Math.floor(maxCombo / 5) * 10;
        const quickAnswerBonus = questionTimes.filter(t => t < 3000).length * 5;
        const totalXp = baseXp + comboBonus + quickAnswerBonus;

        addXp(totalXp, 'Çoktan seçmeli test tamamlandı');
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

    // Confirm exit
    const confirmExit = () => {
        navigate('/practice');
    };

    // Loading state
    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto" />
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
    const quickAnswerBonus = questionTimes.filter(t => t < 3000).length * 5;
    const totalXp = baseXp + comboBonus + quickAnswerBonus;

    // Complete screen using PracticeSummary
    if (isComplete) {
        return (
            <PracticeSummary
                practiceType="multiplechoice"
                correct={results.correct}
                wrong={results.wrong}
                totalQuestions={questions.length}
                maxCombo={maxCombo}
                startTime={startTime}
                endTime={endTime}
                totalXp={totalXp}
                comboBonus={comboBonus}
                quickAnswerBonus={quickAnswerBonus}
                accuracy={accuracy}
                onComplete={handleComplete}
                onRetry={() => window.location.reload()}
                missedWords={missedWords}
                isPerfect={results.wrong === 0 && results.correct > 0}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-6 pb-12">
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
                        <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-sm shadow-lg">
                            +{totalXp} XP
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
                    {/* Word Level Badge */}
                    {currentQuestion.level && (
                        <span className="inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-bold mb-4">
                            {currentQuestion.level}
                        </span>
                    )}

                    {/* Question */}
                    <div className="text-center mb-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Bu kelimenin anlamı nedir?</p>
                        <div className="flex items-center justify-center gap-3">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                                {currentQuestion.word}
                            </h2>
                            <button
                                onClick={speakWord}
                                className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                                aria-label="Kelimeyi seslendir"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                        {currentQuestion.partOfSpeech && (
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 italic">
                                ({currentQuestion.partOfSpeech})
                            </p>
                        )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer?.id === option.id;
                            const showCorrect = isAnswered && option.isCorrect;
                            const showWrong = isAnswered && isSelected && !option.isCorrect;

                            let buttonClass = 'w-full p-4 rounded-2xl border-2 text-left font-medium transition-all ';

                            if (!isAnswered) {
                                buttonClass += 'border-gray-200 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-gray-800 dark:text-gray-200';
                            } else if (showCorrect) {
                                buttonClass += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
                            } else if (showWrong) {
                                buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
                            } else {
                                buttonClass += 'border-gray-200 dark:border-slate-600 text-gray-400 dark:text-gray-500 opacity-60';
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelectAnswer(option)}
                                    disabled={isAnswered}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="flex-1">{option.text}</span>
                                        {showCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                                        {showWrong && <XCircle className="w-6 h-6 text-red-500" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback & Next */}
                {isAnswered && (
                    <div className="animate-slideUp">
                        {/* Feedback */}
                        <div className={`rounded-2xl p-4 mb-4 ${selectedAnswer?.isCorrect
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                            <div className="flex items-center gap-2 font-bold mb-1">
                                {selectedAnswer?.isCorrect ? (
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
                            {!selectedAnswer?.isCorrect && (
                                <p className="text-sm">
                                    Doğru cevap: <strong>{currentQuestion.correctAnswer}</strong>
                                </p>
                            )}
                            {currentQuestion.example && (
                                <p className="text-sm mt-2 opacity-80 italic">
                                    Örnek: "{currentQuestion.example}"
                                </p>
                            )}
                        </div>

                        {/* Next Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleNext}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600"
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
                                    onClick={confirmExit}
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
