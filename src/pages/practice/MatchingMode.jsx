import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Clock, Lightbulb, RotateCcw } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import { wordsData, getRandomWords } from '../../data/words';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { SuccessModal } from '../../components/Modal';
import { calculatePracticeXp } from '../../utils/gamification';

export default function MatchingMode() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, addXp, recordActivity, completePractice } = useUser();
    const toast = useToast();

    // Settings
    const wordCount = Math.min(parseInt(searchParams.get('count')) || 10, 10); // Max 10 for matching

    // State
    const [words, setWords] = useState([]);
    const [shuffledTurkish, setShuffledTurkish] = useState([]);
    const [selectedEnglish, setSelectedEnglish] = useState(null);
    const [selectedTurkish, setSelectedTurkish] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState(new Set());
    const [wrongPair, setWrongPair] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [hints, setHints] = useState(2);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });

    // Load words
    useEffect(() => {
        let practiceWords = [];

        if (user.vocabulary.length >= wordCount) {
            practiceWords = [...user.vocabulary]
                .sort(() => Math.random() - 0.5)
                .slice(0, wordCount);
        } else if (user.vocabulary.length > 0) {
            practiceWords = [...user.vocabulary];
            const remaining = wordCount - practiceWords.length;
            const randomWords = getRandomWords(remaining);
            practiceWords = [...practiceWords, ...randomWords].slice(0, wordCount);
        } else {
            practiceWords = getRandomWords(wordCount);
        }

        setWords(practiceWords);
        // Shuffle Turkish meanings
        setShuffledTurkish([...practiceWords].sort(() => Math.random() - 0.5));
    }, [wordCount, user.vocabulary]);

    // Timer
    useEffect(() => {
        let interval;
        if (isTimerRunning && !isComplete) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, isComplete]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle English word click
    const handleEnglishClick = useCallback((word) => {
        if (matchedPairs.has(word.id)) return;
        setSelectedEnglish(word);
        setWrongPair(null);
    }, [matchedPairs]);

    // Handle Turkish word click
    const handleTurkishClick = useCallback((word) => {
        if (matchedPairs.has(word.id)) return;

        if (!selectedEnglish) {
            // Select Turkish first
            setSelectedTurkish(word);
            setWrongPair(null);
            return;
        }

        // Check if match
        if (selectedEnglish.id === word.id) {
            // Correct match!
            setMatchedPairs(prev => new Set([...prev, word.id]));
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
            setSelectedEnglish(null);
            setSelectedTurkish(null);

            // Check if complete
            if (matchedPairs.size + 1 === words.length) {
                setIsTimerRunning(false);
                setIsComplete(true);
                completePractice(stats.correct + 1, stats.wrong);
            }
        } else {
            // Wrong match
            setWrongPair({ english: selectedEnglish.id, turkish: word.id });
            setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

            // Reset after animation
            setTimeout(() => {
                setSelectedEnglish(null);
                setSelectedTurkish(null);
                setWrongPair(null);
            }, 800);
        }
    }, [selectedEnglish, matchedPairs, words.length, stats, completePractice]);

    // Use hint
    const useHint = () => {
        if (hints <= 0) return;

        // Find a random unmatched pair and match it
        const unmatchedWord = words.find(w => !matchedPairs.has(w.id));
        if (unmatchedWord) {
            setMatchedPairs(prev => new Set([...prev, unmatchedWord.id]));
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
            setHints(prev => prev - 1);

            // Check if complete
            if (matchedPairs.size + 1 === words.length) {
                setIsTimerRunning(false);
                setIsComplete(true);
                completePractice(stats.correct + 1, stats.wrong);
            }
        }
    };

    // Restart
    const restart = () => {
        setMatchedPairs(new Set());
        setSelectedEnglish(null);
        setSelectedTurkish(null);
        setWrongPair(null);
        setTimer(0);
        setIsTimerRunning(true);
        setIsComplete(false);
        setStats({ correct: 0, wrong: 0 });
        setHints(2);
        setShuffledTurkish([...words].sort(() => Math.random() - 0.5));
    };

    // Handle completion
    const handleComplete = () => {
        const xpEarned = calculatePracticeXp(stats.correct, stats.wrong);
        addXp(xpEarned, 'Eşleştirme pratiği tamamlandı');
        recordActivity();
        navigate('/practice');
    };

    if (words.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    const xpEarned = calculatePracticeXp(stats.correct, stats.wrong);
    const progress = (matchedPairs.size / words.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/practice')}
                        className="p-2 rounded-xl hover:bg-white/50 transition-colors text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Timer */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-mono font-bold text-gray-900">{formatTime(timer)}</span>
                        </div>

                        {/* Hints */}
                        <button
                            onClick={useHint}
                            disabled={hints === 0}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${hints > 0
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            <span className="font-medium">{hints}</span>
                        </button>

                        {/* XP */}
                        <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-sm">
                            +{xpEarned} XP
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Instructions */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Eşleştirme Oyunu</h2>
                    <p className="text-gray-600">İngilizce kelimeyi Türkçe anlamıyla eşleştir</p>
                </div>

                {/* Game Board */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    {/* English Column */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 text-center mb-2">🇬🇧 English</h3>
                        {words.map((word) => {
                            const isMatched = matchedPairs.has(word.id);
                            const isSelected = selectedEnglish?.id === word.id;
                            const isWrong = wrongPair?.english === word.id;

                            return (
                                <button
                                    key={`en-${word.id}`}
                                    onClick={() => handleEnglishClick(word)}
                                    disabled={isMatched}
                                    className={`
                    w-full p-4 rounded-xl font-medium text-left transition-all
                    ${isMatched
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default opacity-60'
                                            : isSelected
                                                ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]'
                                                : isWrong
                                                    ? 'bg-red-100 text-red-700 border-2 border-red-300 animate-shake'
                                                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                        }
                  `}
                                >
                                    {word.word}
                                    {isMatched && <span className="float-right">✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Turkish Column */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 text-center mb-2">🇹🇷 Türkçe</h3>
                        {shuffledTurkish.map((word) => {
                            const isMatched = matchedPairs.has(word.id);
                            const isSelected = selectedTurkish?.id === word.id;
                            const isWrong = wrongPair?.turkish === word.id;

                            return (
                                <button
                                    key={`tr-${word.id}`}
                                    onClick={() => handleTurkishClick(word)}
                                    disabled={isMatched}
                                    className={`
                    w-full p-4 rounded-xl font-medium text-left transition-all
                    ${isMatched
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default opacity-60'
                                            : isSelected
                                                ? 'bg-purple-600 text-white shadow-lg scale-[1.02]'
                                                : isWrong
                                                    ? 'bg-red-100 text-red-700 border-2 border-red-300 animate-shake'
                                                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                                        }
                  `}
                                >
                                    {word.turkish}
                                    {isMatched && <span className="float-right">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-8 p-4 bg-white/70 backdrop-blur rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                                <p className="text-xs text-gray-500">Doğru</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-500">{stats.wrong}</p>
                                <p className="text-xs text-gray-500">Yanlış</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{matchedPairs.size}/{words.length}</p>
                                <p className="text-xs text-gray-500">Eşleşme</p>
                            </div>
                        </div>

                        <button
                            onClick={restart}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Yeniden Başla
                        </button>
                    </div>
                </div>
            </div>

            {/* Completion Modal */}
            <SuccessModal
                isOpen={isComplete}
                onClose={handleComplete}
                title="Harika! 🎉"
                message={`Tüm eşleştirmeleri ${formatTime(timer)} içinde tamamladın!`}
                xpEarned={xpEarned}
                buttonText="Devam Et"
            />
        </div>
    );
}
