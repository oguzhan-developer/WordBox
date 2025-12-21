import { Trophy, CheckCircle, XCircle, Target, Zap, Clock, Star, TrendingUp, Award, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { useMemo } from 'react';

/**
 * PracticeSummary - Reusable practice completion screen
 * 
 * @param {Object} props
 * @param {string} props.practiceType - Type of practice (multiplechoice, flashcard, matching, etc.)
 * @param {number} props.correct - Number of correct answers
 * @param {number} props.wrong - Number of wrong answers
 * @param {number} props.totalQuestions - Total questions answered
 * @param {number} props.maxCombo - Maximum combo achieved
 * @param {number} props.startTime - Practice start timestamp
 * @param {number} props.totalXp - Total XP earned
 * @param {number} props.comboBonus - Combo bonus XP
 * @param {number} props.quickAnswerBonus - Quick answer bonus XP
 * @param {number} props.accuracy - Accuracy percentage
 * @param {function} props.onComplete - Callback when user clicks complete
 * @param {function} props.onRetry - Callback when user clicks retry
 * @param {Array} props.missedWords - Array of words answered incorrectly
 * @param {boolean} props.isPerfect - Whether user got all answers correct
 */
export default function PracticeSummary({
    practiceType = 'practice',
    correct = 0,
    wrong = 0,
    totalQuestions = 0,
    maxCombo = 0,
    startTime = Date.now(),
    totalXp = 0,
    comboBonus = 0,
    quickAnswerBonus = 0,
    accuracy = 0,
    onComplete,
    onRetry,
    missedWords = [],
    isPerfect = false
}) {
    // Calculate time
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    // Determine performance tier
    const performanceTier = useMemo(() => {
        if (accuracy === 100) return { tier: 'perfect', title: 'Mükemmel!', icon: '🏆', color: 'from-yellow-400 to-orange-500' };
        if (accuracy >= 90) return { tier: 'excellent', title: 'Harika!', icon: '🌟', color: 'from-green-400 to-emerald-500' };
        if (accuracy >= 70) return { tier: 'good', title: 'İyi!', icon: '👍', color: 'from-blue-400 to-cyan-500' };
        if (accuracy >= 50) return { tier: 'okay', title: 'Fena Değil', icon: '📚', color: 'from-orange-400 to-amber-500' };
        return { tier: 'practice', title: 'Çalışmaya Devam!', icon: '💪', color: 'from-red-400 to-rose-500' };
    }, [accuracy]);
    
    // Practice type labels
    const practiceLabels = {
        multiplechoice: 'Çoktan Seçmeli',
        flashcard: 'Flashcard',
        matching: 'Eşleştirme',
        sprint: 'Sprint',
        fillblank: 'Boşluk Doldurma',
        translation: 'Çeviri',
        listening: 'Dinleme',
        practice: 'Pratik'
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${performanceTier.color} p-8 text-center text-white`}>
                        <div className="text-6xl mb-4">{performanceTier.icon}</div>
                        <h1 className="text-3xl font-bold mb-2">{performanceTier.title}</h1>
                        <p className="text-white/80">
                            {practiceLabels[practiceType] || 'Pratik'} tamamlandı!
                        </p>
                        {isPerfect && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold">
                                <Star className="w-4 h-4" />
                                Mükemmel Seri!
                            </div>
                        )}
                    </div>
                    
                    <div className="p-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{correct}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Doğru</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
                                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{wrong}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Yanlış</p>
                            </div>
                            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-4 text-center">
                                <Target className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{accuracy}%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Doğruluk</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 text-center">
                                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{maxCombo}x</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Max Combo</p>
                            </div>
                        </div>
                        
                        {/* Time & XP Card */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-6 h-6 opacity-80" />
                                    <div>
                                        <p className="text-sm opacity-80">Süre</p>
                                        <p className="text-xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-80">Kazanılan XP</p>
                                    <p className="text-3xl font-bold">+{totalXp}</p>
                                </div>
                            </div>
                            {(comboBonus > 0 || quickAnswerBonus > 0) && (
                                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
                                    {comboBonus > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-4 h-4" />
                                            Combo: +{comboBonus} XP
                                        </span>
                                    )}
                                    {quickAnswerBonus > 0 && (
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            Hızlı: +{quickAnswerBonus} XP
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Missed Words Section */}
                        {missedWords.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                    Tekrar Et ({missedWords.length} kelime)
                                </h3>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {missedWords.map((word, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl"
                                        >
                                            <div>
                                                <span className="font-bold text-gray-900 dark:text-white">{word.word}</span>
                                                <span className="text-gray-400 mx-2">→</span>
                                                <span className="text-gray-600 dark:text-gray-400">{word.translation || word.turkish}</span>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                                                Yanlış
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={onComplete}
                            >
                                Tamamla ve Devam Et
                            </Button>
                            
                            <div className="flex gap-3">
                                {onRetry && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        fullWidth
                                        onClick={onRetry}
                                    >
                                        Tekrar Dene
                                    </Button>
                                )}
                                <Link to="/practice" className="flex-1">
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        fullWidth
                                    >
                                        Farklı Mod
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        
                        {/* Share Button */}
                        <button 
                            className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            onClick={() => {
                                // Could implement sharing functionality here
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'WordBox Pratik Sonucu',
                                        text: `${practiceLabels[practiceType]} modunda ${accuracy}% doğruluk oranı ile ${correct}/${totalQuestions} soru doğru cevapladım! 🎉`
                                    });
                                }
                            }}
                        >
                            <Share2 className="w-4 h-4" />
                            Sonuçları Paylaş
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
