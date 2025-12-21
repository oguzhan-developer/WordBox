import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Zap, Target, TrendingUp, Trophy, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import { wordsData } from '../../data/words';

export default function SprintMode() {
    const navigate = useNavigate();
    const { user, addXp, recordActivity } = useUser();
    const toast = useToast();

    // Game Settings
    const MAX_TIME = 15;

    // Game State
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'finished'
    const [selectedLevel, setSelectedLevel] = useState(user.level || 'B1');
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(MAX_TIME);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });
    const [lastResult, setLastResult] = useState(null); // 'correct', 'wrong', null
    const [showCorrection, setShowCorrection] = useState(false);

    const timerRef = useRef(null);
    const lastWordId = useRef(null);

    // Audio helper
    const playSound = (isCorrect) => {
        const url = isCorrect
            ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
            : 'https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3';
        const audio = new Audio(url);
        audio.volume = 0.4;
        audio.play().catch(() => { }); // Ignore silent errors
    };

    // Generate a new question
    const generateQuestion = useCallback(() => {
        // Filter pool by level
        let pool = wordsData.filter(w => w.level === selectedLevel);

        // If pool is empty (shouldn't happen with our data), fallback to all
        if (pool.length === 0) pool = wordsData;

        let word;
        do {
            word = pool[Math.floor(Math.random() * pool.length)];
        } while (word.id === lastWordId.current && pool.length > 1);

        lastWordId.current = word.id;
        setCurrentWord(word);

        // Generate 3 wrong options
        const otherWords = pool.filter(w => w.id !== word.id);
        const wrongChoices = [...otherWords]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.turkish);

        // Mix correct answer
        const allChoices = [...wrongChoices, word.turkish].sort(() => Math.random() - 0.5);
        setOptions(allChoices);
        setLastResult(null);
        setShowCorrection(false);
    }, [selectedLevel]);

    // Start Game
    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setCombo(0);
        setTimeLeft(MAX_TIME);
        setStats({ correct: 0, wrong: 0 });
        generateQuestion();
    };

    // Timer and Game End Logic
    useEffect(() => {
        if (gameState === 'playing') {
            if (timeLeft <= 0) {
                setGameState('finished');
                if (timerRef.current) clearInterval(timerRef.current);
                return;
            }

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, timeLeft]);

    // Handle Answer
    const handleAnswer = (choice) => {
        if (gameState !== 'playing' || lastResult !== null) return;

        if (choice === currentWord.turkish) {
            // Correct!
            playSound(true);
            setScore(prev => prev + 10 + (combo * 2));
            setCombo(prev => prev + 1);
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
            // Add time but cap at MAX_TIME
            setTimeLeft(prev => Math.min(MAX_TIME, prev + 2));
            setLastResult('correct');

            setTimeout(generateQuestion, 200);
        } else {
            // Wrong!
            playSound(false);
            setCombo(0);
            setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            setTimeLeft(prev => Math.max(0, prev - 3)); // Penalty
            setLastResult('wrong');
            setShowCorrection(true);

            setTimeout(generateQuestion, 800);
        }
    };

    // Finish
    const handleFinish = () => {
        const xpEarned = Math.round(score / 2);
        addXp(xpEarned, 'Kelime Maratonu tamamlandı');
        recordActivity();
        navigate('/dashboard');
    };

    // UI Renderers
    if (gameState === 'start') {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#27272a] rounded-[2.5rem] p-8 border border-gray-100 dark:border-[#333] shadow-2xl animate-fadeIn">
                    <div className="size-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                        <Zap className="w-8 h-8 text-white fill-current" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1 uppercase tracking-tighter italic">MARATON ⚡</h1>
                    <p className="text-brand-blue font-black text-xs text-center mb-6 uppercase tracking-[0.2em]">
                        Hızla Düşün, Doğru Bil, Maratonu Fethet!
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm leading-relaxed px-4">
                        Doğru cevaplar süreni tazeler ama dikkat et, her yanlış cevap seni yavaşlatır!
                    </p>

                    {/* Level Selection */}
                    <div className="mb-8">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block text-center">SEVİYE SEÇ</label>
                        <div className="grid grid-cols-5 gap-2">
                            {levels.map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setSelectedLevel(lvl)}
                                    className={`py-3 rounded-xl font-black transition-all ${selectedLevel === lvl
                                        ? 'bg-yellow-500 text-black scale-110 shadow-lg'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-center group hover:scale-105 transition-transform">
                            <Zap className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-green-700 dark:text-green-400">+2s</div>
                            <div className="text-[10px] text-green-600/70 dark:text-green-400/50 uppercase font-black tracking-widest">DOĞRU</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-center group hover:scale-105 transition-transform">
                            <Clock className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-red-700 dark:text-red-400">-3s</div>
                            <div className="text-[10px] text-red-600/70 dark:text-red-400/50 uppercase font-black tracking-widest">YANLIŞ</div>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                    >
                        BAŞLA <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-6 text-gray-500 hover:text-white transition-colors text-sm font-bold w-full text-center"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        const timeProgress = (timeLeft / MAX_TIME) * 100;

        return (
            <div className={`min-h-screen transition-colors duration-300 ${lastResult === 'correct' ? 'bg-green-50 dark:bg-green-900/10' : lastResult === 'wrong' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-[#18181b]'
                } flex flex-col items-center pt-12 md:pt-20 px-4`}>

                {/* Header Info */}
                <div className="max-w-xl w-full flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/dashboard')} className="size-10 flex items-center justify-center bg-white dark:bg-white/5 shadow-sm rounded-xl text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className={`flex flex-col items-center ${timeLeft < 5 ? 'animate-pulse text-red-500' : 'text-gray-900 dark:text-white'}`}>
                            <div className="text-3xl font-black font-mono leading-none tracking-tighter">{timeLeft}s</div>
                            <div className="text-[9px] uppercase font-black opacity-40 mt-1">SÜRE</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-black font-mono leading-none text-yellow-500 tracking-tighter">{score}</div>
                            <div className="text-[9px] uppercase font-black opacity-40 mt-1">PUAN</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-black text-brand-blue leading-none italic">x{combo + 1}</div>
                        <div className="text-[9px] uppercase font-black opacity-40 text-brand-blue mt-1">KOMBO</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="max-w-xl w-full h-2 bg-white/10 rounded-full mb-16 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${timeLeft < 5 ? 'bg-red-500' : 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]'}`}
                        style={{ width: `${timeProgress}%` }}
                    />
                </div>

                {/* Content */}
                <div className="max-w-xl w-full text-center">
                    <div className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[9px] font-black inline-block mb-8 tracking-[0.2em] uppercase">
                        {selectedLevel} SEVİYESİ
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-2 break-words tracking-tighter uppercase italic">
                        {currentWord?.word}
                    </h2>
                    <p className="text-lg text-gray-500 italic mb-12">
                        {currentWord?.phonetic}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                        {options.map((option, idx) => {
                            const isCorrect = option === currentWord?.turkish;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={lastResult !== null}
                                    className={`
                                        p-6 rounded-3xl text-xl font-black transition-all border-2 uppercase tracking-tight
                                        ${lastResult === null
                                            ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-900 dark:text-white hover:border-yellow-500 hover:scale-[1.02] shadow-sm'
                                            : isCorrect
                                                ? 'bg-yellow-500 border-yellow-500 text-black scale-105 shadow-xl shadow-yellow-500/20'
                                                : lastResult === 'wrong' && option !== currentWord.turkish
                                                    ? 'opacity-20 grayscale border-transparent text-gray-400'
                                                    : ''
                                        }
                                    `}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-10 mt-8">
                        {showCorrection && (
                            <div className="text-red-400 font-bold">
                                Yanlış! Doğru: <span className="text-white underline">{currentWord.turkish}</span>
                            </div>
                        )}
                        {lastResult === 'correct' && (
                            <div className="text-yellow-400 font-bold flex items-center justify-center gap-2 animate-bounce">
                                <Zap className="w-5 h-5 fill-current" /> +2s BONUS!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const xpEarned = Math.round(score / 2);

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#27272a] rounded-[2.5rem] p-10 border border-gray-100 dark:border-[#333] shadow-2xl text-center animate-slideUp">
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase italic tracking-tighter">Süre Doldu!</h1>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6">Oyun Bitti, Skorun Kaydedildi!</p>

                    <div className="text-7xl font-black text-yellow-500 mb-8 drop-shadow-xl">{score}</div>

                    <div className="grid grid-cols-3 gap-3 mb-10">
                        <div className="bg-black/10 p-4 rounded-2xl">
                            <div className="text-green-500 font-bold text-xl">{stats.correct}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Doğru</div>
                        </div>
                        <div className="bg-black/10 p-4 rounded-2xl">
                            <div className="text-red-500 font-bold text-xl">{stats.wrong}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Yanlış</div>
                        </div>
                        <div className="bg-black/10 p-4 rounded-2xl">
                            <div className="text-blue-500 font-bold text-xl">+{xpEarned}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">XP</div>
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:bg-gray-100 transition-all text-lg"
                    >
                        DEVAM ET ➔
                    </button>

                    <button
                        onClick={() => setGameState('start')}
                        className="mt-6 flex items-center justify-center gap-2 text-yellow-500 font-bold w-full hover:text-yellow-400 transition-colors"
                    >
                        <Zap className="w-4 h-4" /> Seviye Değiştir / Yeniden Dene
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
