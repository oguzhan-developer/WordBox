import { useMemo, useState } from 'react';
import { Award, Trophy, Flame, Target, BookOpen, Zap, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import {
    calculateLevel,
    getLevelProgress,
    calculateDailyProgress
} from '../utils/gamification';
import { getWeeklyActivity, getWeeklyTotal, getBestDayThisWeek } from '../utils/weeklyActivity';
import { getReadingStats, getWeeklyReadingSummary, formatReadingTime } from '../utils/readingStats';

export default function ProgressPage() {
    const { user } = useUser();
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Weekly activity data (these read from localStorage)
    const weeklyActivity = useMemo(() => getWeeklyActivity(), []);
    const weeklyTotal = useMemo(() => getWeeklyTotal(), []);
    const bestDay = useMemo(() => getBestDayThisWeek(), []);
    const weeklyMax = bestDay > 0 ? bestDay : 20;
    
    // Reading stats
    const readingStats = useMemo(() => getReadingStats(), []);
    const _weeklyReading = useMemo(() => getWeeklyReadingSummary(), []);

    if (!user) return null;

    const _currentLevel = calculateLevel(user.xp);
    const _progress = getLevelProgress(user.xp);
    const dailyProgress = calculateDailyProgress(user.wordsToday, user.preferences?.dailyGoal);

    // Vocabulary distribution
    const vocab = user.vocabulary || [];
    const counts = {
        new: vocab.filter(w => w.status === 'new').length,
        learning: vocab.filter(w => w.status === 'learning').length,
        learned: vocab.filter(w => w.status === 'learned').length,
    };
    const totalVocab = vocab.length || 1; // Avoid division by zero

    // Badges definition
    const badges = useMemo(() => [
        { id: 'streak7', name: 'Haftalık Seri', icon: Flame, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400', description: '7 gün üst üste pratik yap', unlocked: user.streak >= 7, progress: Math.min(100, (user.streak / 7) * 100) },
        { id: 'streak30', name: 'Aylık Seri', icon: Trophy, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600 dark:text-purple-400', description: '30 gün üst üste pratik yap', unlocked: user.streak >= 30, progress: Math.min(100, (user.streak / 30) * 100) },
        { id: 'words50', name: 'Kelime Ustası', icon: BookOpen, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400', description: '50 kelime öğren', unlocked: user.wordsLearned >= 50, progress: Math.min(100, (user.wordsLearned / 50) * 100) },
        { id: 'words100', name: 'Kelime Efendisi', icon: BookOpen, color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', textColor: 'text-indigo-600 dark:text-indigo-400', description: '100 kelime öğren', unlocked: user.wordsLearned >= 100, progress: Math.min(100, (user.wordsLearned / 100) * 100) },
        { id: 'practice50', name: 'Pratik Canavarı', icon: Target, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400', description: '50 pratik yap', unlocked: (user.practiceCount || 0) >= 50, progress: Math.min(100, ((user.practiceCount || 0) / 50) * 100) },
        { id: 'xp1000', name: 'Bin XP Kulübü', icon: Star, color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400', description: '1000 XP kazan', unlocked: user.xp >= 1000, progress: Math.min(100, (user.xp / 1000) * 100) },
        { id: 'xp5000', name: 'XP Şampiyonu', icon: Zap, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400', description: '5000 XP kazan', unlocked: user.xp >= 5000, progress: Math.min(100, (user.xp / 5000) * 100) },
        { id: 'perfect10', name: 'Mükemmel 10', icon: Award, color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-100 dark:bg-teal-900/30', textColor: 'text-teal-600 dark:text-teal-400', description: '10 hatasız pratik yap', unlocked: (user.perfectPractices || 0) >= 10, progress: Math.min(100, ((user.perfectPractices || 0) / 10) * 100) },
    ], [user.streak, user.wordsLearned, user.practiceCount, user.xp, user.perfectPractices]);

    const skillStats = [
        { label: 'Okuma', value: Math.min(100, (user.articlesRead || 0) * 5), icon: 'menu_book', color: 'bg-primary' },
        { label: 'Kelime Bilgisi', value: Math.min(100, Math.round((user.wordsLearned / 500) * 100)), icon: 'translate', color: 'bg-secondary' },
        { label: 'Pratik İstikrarı', value: Math.min(100, (user.practiceCount || 0) * 2), icon: 'bolt', color: 'bg-warning' },
        { label: 'Hatasızlık', value: user.practiceCount > 0 ? Math.round((user.perfectPractices / user.practiceCount) * 100) : 0, icon: 'check_circle', color: 'bg-accent' },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181811] dark:text-white min-h-screen pb-20 pt-8">
            <main className="max-w-5xl mx-auto px-4">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">İlerleme Analizi</h1>
                    <p className="text-gray-500 dark:text-gray-400">Öğrenme yolculuğundaki detaylı performansın.</p>
                </header>

                {/* Top Row: Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined font-fill">local_fire_department</span>
                        </div>
                        <div className="text-3xl font-black">{user.streak} Gün</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Öğrenme Serisi</div>
                    </div>

                    <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined font-fill">stars</span>
                        </div>
                        <div className="text-3xl font-black">{user.xp.toLocaleString()}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Toplam XP</div>
                    </div>

                    <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined font-fill">menu_book</span>
                        </div>
                        <div className="text-3xl font-black">{user.wordsLearned}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Öğrenilen Kelime</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Middle: Detailed Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Daily Progress */}
                        <div className="bg-white dark:bg-[#2a2a24] p-8 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-warning">event_available</span>
                                Bugünü Hedefi
                            </h2>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative size-32">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-warning" strokeWidth="3"
                                            strokeDasharray={`${dailyProgress}, 100`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black">{Math.round(dailyProgress)}%</span>
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold mb-1">Harika İlerliyorsun!</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Bugünkü {user.preferences?.dailyGoal} kelime hedefine ulaşmak için {Math.max(0, (user.preferences?.dailyGoal || 20) - user.wordsToday)} kelime daha öğrenmen gerekiyor.</p>
                                    <div className="flex justify-center md:justify-start gap-2">
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                            <div className="text-xs text-gray-400 uppercase font-bold">Tamamlanan</div>
                                            <div className="font-bold">{user.wordsToday} Kelime</div>
                                        </div>
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                            <div className="text-xs text-gray-400 uppercase font-bold">Hedef</div>
                                            <div className="font-bold">{user.preferences?.dailyGoal || 20} Kelime</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vocabulary Status Breakdown */}
                        <div className="bg-white dark:bg-[#2a2a24] p-8 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">bar_chart</span>
                                Kelime Havuzu Dağılımı
                            </h2>

                            <div className="space-y-6">
                                {/* Stacked Progress Bar */}
                                <div className="h-6 w-full flex rounded-full overflow-hidden bg-gray-100 dark:bg-white/5">
                                    <div style={{ width: `${(counts.learned / totalVocab) * 100}%` }} className="h-full bg-secondary" />
                                    <div style={{ width: `${(counts.learning / totalVocab) * 100}%` }} className="h-full bg-warning" />
                                    <div style={{ width: `${(counts.new / totalVocab) * 100}%` }} className="h-full bg-primary" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                                        <div className="size-3 rounded-full bg-secondary" />
                                        <div>
                                            <div className="text-xl font-black">{counts.learned}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Öğrenildi</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/10">
                                        <div className="size-3 rounded-full bg-warning" />
                                        <div>
                                            <div className="text-xl font-black">{counts.learning}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Çalışılıyor</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="size-3 rounded-full bg-primary" />
                                        <div>
                                            <div className="text-xl font-black">{counts.new}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Tanımlandı</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Activity Chart */}
                        <div className="bg-white dark:bg-[#2a2a24] p-8 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent">calendar_month</span>
                                    Haftalık Aktivite
                                </h2>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-accent">{weeklyTotal}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase">Bu Hafta Toplam</div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="flex items-end justify-between gap-3 h-40 mb-4">
                                {weeklyActivity.map((day) => {
                                    const heightPercent = weeklyMax > 0 ? Math.max(8, (day.words / weeklyMax) * 100) : 8;
                                    const isActive = day.words > 0;
                                    const isToday = day.isToday;
                                    
                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center">
                                            {/* Value on top */}
                                            <div className={`text-xs font-bold mb-2 ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                                {day.words > 0 ? day.words : '-'}
                                            </div>
                                            
                                            {/* Bar */}
                                            <div 
                                                className={`w-full rounded-t-lg transition-all ${
                                                    isToday 
                                                        ? 'bg-gradient-to-t from-accent to-primary' 
                                                        : isActive 
                                                            ? 'bg-accent/50' 
                                                            : 'bg-gray-100 dark:bg-white/5'
                                                }`}
                                                style={{ height: `${heightPercent}%` }}
                                            />
                                            
                                            {/* Day label */}
                                            <div className={`text-xs mt-2 font-bold ${isToday ? 'text-accent' : 'text-gray-400'}`}>
                                                {day.day}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stats row */}
                            <div className="flex justify-center gap-6 pt-4 border-t border-gray-100 dark:border-white/5">
                                <div className="text-center">
                                    <div className="text-sm font-bold">{bestDay}</div>
                                    <div className="text-xs text-gray-500">En İyi Gün</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold">{Math.round(weeklyTotal / 7)}</div>
                                    <div className="text-xs text-gray-500">Günlük Ort.</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold">{weeklyActivity.filter(d => d.words > 0).length}/7</div>
                                    <div className="text-xs text-gray-500">Aktif Gün</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Skills & History */}
                    <div className="space-y-8">
                        {/* Reading Stats */}
                        <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">auto_stories</span>
                                Okuma İstatistikleri
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="text-2xl font-black text-primary">{readingStats.articlesCompleted}</div>
                                    <div className="text-xs text-gray-500 font-bold">Makale</div>
                                </div>
                                <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                                    <div className="text-2xl font-black text-secondary">{readingStats.totalWordsRead.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 font-bold">Kelime</div>
                                </div>
                                <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                                    <div className="text-2xl font-black text-accent">{formatReadingTime(readingStats.totalTimeSpent)}</div>
                                    <div className="text-xs text-gray-500 font-bold">Toplam Süre</div>
                                </div>
                                <div className="p-3 bg-warning/5 rounded-xl border border-warning/10">
                                    <div className="text-2xl font-black text-warning">{readingStats.averageReadingSpeed}</div>
                                    <div className="text-xs text-gray-500 font-bold">Kelime/dk</div>
                                </div>
                            </div>
                            {readingStats.achievements.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="text-xs text-gray-400 font-bold uppercase mb-2">Başarılar</div>
                                    <div className="flex flex-wrap gap-1">
                                        {readingStats.achievements.map((badge) => (
                                            <span key={badge} className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-lg font-bold">
                                                🏆 {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Skills Radar-ish */}
                        <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                            <h2 className="text-lg font-bold mb-6">Yetenek Dağılımı</h2>
                            <div className="space-y-5">
                                {skillStats.map((skill, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">{skill.icon}</span>
                                                {skill.label}
                                            </div>
                                            <span className="text-xs font-black">{skill.value}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${skill.color} rounded-full transition-all duration-1000`}
                                                style={{ width: `${skill.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Mini Feed */}
                        <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Son Aktiviteler</h2>
                            <div className="space-y-4">
                                {user.readArticles && user.readArticles.length > 0 ? (
                                    user.readArticles.slice(-3).reverse().map((id, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[18px]">article</span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold truncate">Haber Okundu</div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">ID: {id}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-4">Henüz aktivite bulunmuyor.</p>
                                )}
                                <div className="flex gap-3">
                                    <div className="size-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Profil Güncellendi</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Bugün</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div id="badges" className="mt-8">
                    <div className="bg-white dark:bg-[#2a2a24] p-8 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Award className="w-6 h-6 text-amber-500" />
                            Rozetler
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                            Başarılarını kazanarak öğrenme yolculuğunda daha fazla ilerle!
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {badges.map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        onClick={() => setSelectedBadge(badge)}
                                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                            badge.unlocked
                                                ? 'bg-gradient-to-br ' + badge.color + ' border-transparent text-white'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        } hover:scale-105 hover:shadow-lg`}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`size-12 rounded-full flex items-center justify-center mb-2 ${
                                                badge.unlocked ? 'bg-white/20' : badge.bgColor
                                            }`}>
                                                <Icon className={`w-6 h-6 ${badge.unlocked ? 'text-white' : badge.textColor}`} />
                                            </div>
                                            <h3 className={`font-bold text-sm ${badge.unlocked ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                {badge.name}
                                            </h3>
                                            {badge.unlocked && (
                                                <div className="mt-1">
                                                    <Award className="w-4 h-4 text-white/80" />
                                                </div>
                                            )}
                                            {!badge.unlocked && (
                                                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                                        style={{ width: `${badge.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats Row */}
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                            <div className="flex justify-center gap-8 text-center">
                                <div>
                                    <div className="text-2xl font-black text-amber-500">{badges.filter(b => b.unlocked).length}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase">Kazanılan</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-400">{badges.length - badges.filter(b => b.unlocked).length}</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase">Kalan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Detail Modal */}
                {selectedBadge && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBadge(null)}>
                        <div className="bg-white dark:bg-[#2a2a24] rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">{selectedBadge.name}</h3>
                                <button
                                    onClick={() => setSelectedBadge(null)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                                >
                                    <Award className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className={`size-16 rounded-full bg-gradient-to-br ${selectedBadge.color} flex items-center justify-center mx-auto mb-4`}>
                                <selectedBadge.icon className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">{selectedBadge.description}</p>
                            {selectedBadge.unlocked ? (
                                <div className="text-center text-green-600 dark:text-green-400 font-bold">🎉 Kazanıldı!</div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 mb-2">İlerleme</div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                            style={{ width: `${selectedBadge.progress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{Math.round(selectedBadge.progress)}%</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
