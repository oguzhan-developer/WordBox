import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useState, useEffect, useMemo } from 'react';
import { supabaseService } from '../services/supabaseService';
import { getWeeklyActivity, setTodayWords, getBestDayThisWeek } from '../utils/weeklyActivity';
import { getWordOfTheDay, isWordLearnedToday, markWordAsLearned, updateWotdStreak } from '../utils/wordOfTheDay';
import { getDailyGoalStatus, getMotivationMessage } from '../utils/studyGoals';
import { speak } from '../utils/speechSynthesis';
import FocusTimer from '../components/FocusTimer';
import PracticeStreakWidget from '../components/PracticeStreakWidget';

export default function Dashboard() {
    const { user, addWord, addXp } = useUser();
    const [showFocusTimer, setShowFocusTimer] = useState(false);
    const [wotdLearned, setWotdLearned] = useState(false);

    const [featuredNews, setFeaturedNews] = useState({ title: 'Yükleniyor...', newWords: [] });
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    
    // Word of the Day
    const wordOfTheDay = useMemo(() => getWordOfTheDay(), []);
    
    // Study Goals
    const dailyGoalStatus = useMemo(() => getDailyGoalStatus(), [user.wordsToday]);
    const motivation = useMemo(() => getMotivationMessage(), [user.wordsToday]);
    
    // Check if WOTD was already learned
    useEffect(() => {
        setWotdLearned(isWordLearnedToday());
    }, []);
    
    // Handle learning WOTD
    const handleLearnWotd = () => {
        if (wotdLearned) return;
        
        // Add word to vocabulary
        addWord({
            word: wordOfTheDay.word,
            turkish: wordOfTheDay.turkish,
            phonetic: wordOfTheDay.phonetic,
            partOfSpeech: wordOfTheDay.partOfSpeech,
            definition: wordOfTheDay.definition,
            examples: [wordOfTheDay.example],
            level: wordOfTheDay.level,
            status: 'new',
        });
        
        // Mark as learned
        markWordAsLearned();
        const streak = updateWotdStreak();
        setWotdLearned(true);
        
        // Award XP
        addXp(25, `Günün Kelimesi öğrenildi (${streak} gün seri)`);
    };

    // Fetch featured news from Supabase
    useEffect(() => {
        const fetchFeatured = async () => {
            setIsLoadingNews(true);
            const news = await supabaseService.getContentByLevel('news', user.level || 'B1');
            if (news && news.length > 0) {
                setFeaturedNews(news[0]);
            } else {
                setFeaturedNews({ title: 'İçerik Bulunamadı', newWords: [] });
            }
            setIsLoadingNews(false);
        };
        if (user.level) {
            fetchFeatured();
        }
    }, [user.level]);

    // Sync wordsToday to weekly activity
    useEffect(() => {
        if (user.wordsToday > 0) {
            setTodayWords(user.wordsToday);
        }
    }, [user.wordsToday]);

    // Get weekly activity data
    const weeklyActivity = useMemo(() => getWeeklyActivity(), [user.wordsToday]);
    const bestDay = useMemo(() => getBestDayThisWeek(), [user.wordsToday]);
    const weeklyMax = bestDay > 0 ? bestDay : 20; // Minimum scale of 20

    // Calculate stats
    const dailyGoal = user.preferences?.dailyGoal || 20;
    const wordsToday = user.wordsToday || 0;
    const progressPercent = Math.min(100, Math.round((wordsToday / dailyGoal) * 100));
    const nextLevelXp = 2000; // Mock value for next level threshold
    const xpProgress = Math.min(100, Math.round((user.xp / nextLevelXp) * 100));

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 font-display text-slate-900 dark:text-white min-h-screen flex flex-col overflow-x-hidden">
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Hero Section */}
                <section className="flex flex-col lg:flex-row gap-8 mb-12 items-start lg:items-center">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent break-words leading-tight pb-2">
                            Hoş geldin, {user.name?.split(' ')[0] || 'Öğrenci'}! <span className="inline-block animate-bounce">👋</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-lg">Bugünkü hedefine ulaşmak için harika bir gün. Sadece 15 dakika daha pratik yap.</p>
                    </div>
                    {/* Daily Stats Row */}
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        {/* Daily Goal */}
                        <div className="flex items-center gap-4 glass rounded-2xl p-5 shadow-xl border border-white/20 dark:border-slate-700/50 min-w-[200px] flex-1 hover:scale-105 transition-all">
                            <div className="relative size-14">
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                    <path className="text-indigo-600 dark:text-indigo-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" strokeLinecap="round"></path>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Bugünkü Hedef</div>
                                <div className="text-xl font-bold">{wordsToday}/{dailyGoal}</div>
                            </div>
                        </div>
                        {/* Streak */}
                        <div className="flex items-center gap-4 glass rounded-2xl p-5 shadow-xl border border-white/20 dark:border-slate-700/50 min-w-[160px] flex-1 hover:scale-105 transition-all">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Seri</div>
                                <div className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{user.streak} Gün</div>
                            </div>
                        </div>
                        {/* XP */}
                        <div className="flex items-center gap-4 glass rounded-2xl p-5 shadow-xl border border-white/20 dark:border-slate-700/50 min-w-[160px] flex-1 hover:scale-105 transition-all">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Toplam XP</div>
                                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{user.xp}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Daily News */}
                    <article className="glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/50 flex flex-col group hover:scale-105 transition-all duration-300">
                        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden">
                            <img alt="Team working on tech" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={featuredNews.image || "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=600&auto=format&fit=crop"} />
                            <div className="absolute top-4 left-4 glass text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                {featuredNews.level || user.level || 'B1'} Seviyesi
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px]">newspaper</span>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Günün Haberi</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 leading-tight text-gray-900 dark:text-white">{featuredNews.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 5 dk</span>
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium"><span className="material-symbols-outlined text-[16px]">add_circle</span> {featuredNews.newWords?.length || 0} Yeni Kelime</span>
                            </div>
                            <Link to={`/read/${featuredNews.id || 1}`} className="mt-auto w-full gradient-primary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5">
                                Okumaya Başla
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </Link>
                        </div>
                    </article>

                    {/* Card 2: Practice */}
                    <article className="glass-strong rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-slate-700/50 flex flex-col hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[20px]">psychology</span>
                                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Kelime Pratiği</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tekrar Edilecekler</h3>
                            </div>
                            <div className="size-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-white">notifications_active</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                            <div className="text-7xl font-black bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-2 tracking-tighter">
                                {user.vocabulary?.filter(w => w.status !== 'learned').length || 0}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 text-center">Bugün tekrar etmen gereken kelime var.</p>
                            <div className="flex gap-4 w-full justify-center mb-8">
                                <Link to="/practice" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500 transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">quiz</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Test</span>
                                </Link>
                                <Link to="/practice?mode=flashcard" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-emerald-500 transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">style</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Kartlar</span>
                                </Link>
                                <Link to="/practice" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-500 transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">mic</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Konuşma</span>
                                </Link>
                                <Link to="/practice/sprint" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-yellow-500 group-hover:to-amber-500 transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">bolt</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Maraton</span>
                                </Link>
                            </div>
                        </div>
                        <Link to="/practice" className="w-full bg-[#181811] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            Pratiğe Başla
                            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                        </Link>
                    </article>

                    {/* Card 3: Progress Summary */}
                    <article className="bg-white dark:bg-[#2a2a24] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#333] flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-brand-green text-[20px]">trending_up</span>
                                    <span className="text-xs font-bold text-brand-green uppercase tracking-wide">İlerleme Özeti</span>
                                </div>
                                <h3 className="text-lg font-bold">Haftalık Performans</h3>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                            {/* Weekly Chart - Real Data */}
                            <div className="flex items-end justify-between gap-2 h-32 mb-6 px-2">
                                {weeklyActivity.map((day, index) => {
                                    const heightPercent = weeklyMax > 0 ? Math.max(5, (day.words / weeklyMax) * 100) : 5;
                                    const isActive = day.words > 0;
                                    const isToday = day.isToday;
                                    
                                    return (
                                        <div 
                                            key={day.date} 
                                            className={`w-full rounded-t-md relative group transition-all cursor-pointer hover:opacity-80 ${
                                                isToday 
                                                    ? 'bg-brand-green' 
                                                    : isActive 
                                                        ? 'bg-brand-green/50' 
                                                        : 'bg-gray-100 dark:bg-white/5'
                                            }`}
                                            style={{ height: `${heightPercent}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="invisible group-hover:visible absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                {day.day}: {day.words} kelime
                                            </div>
                                            {/* Day label on bottom */}
                                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-medium">
                                                {day.day}
                                            </div>
                                            {/* Today indicator */}
                                            {isToday && day.words > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-green text-white text-xs px-2 py-0.5 rounded font-bold">
                                                    {day.words}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-white/5 pb-3">
                                    <span className="text-gray-500">Toplam Kelime</span>
                                    <span className="font-bold">{user.wordsLearned || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pb-1">
                                    <span className="text-gray-500">Sonraki Seviye (C1)</span>
                                    <span className="font-bold text-brand-blue">{nextLevelXp - (user.xp % nextLevelXp)} XP kaldı</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-blue rounded-full" style={{ width: `${xpProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <a className="mt-6 text-center text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors" href="/progress">
                            Detaylı İstatistikler →
                        </a>
                    </article>
                </section>

                {/* Bottom Widgets */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Word of the Day */}
                    <div className="bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 dark:from-brand-purple/20 dark:to-brand-blue/20 rounded-xl p-5 border border-brand-purple/20 dark:border-brand-purple/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-brand-purple uppercase flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                    Günün Kelimesi
                                </h4>
                                <span className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple text-xs font-bold rounded-full">
                                    {wordOfTheDay.level}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{wordOfTheDay.word}</h3>
                                <button 
                                    onClick={() => speak(wordOfTheDay.word)}
                                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Kelimeyi seslendir"
                                >
                                    <span className="material-symbols-outlined text-brand-purple text-lg">volume_up</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{wordOfTheDay.phonetic}</p>
                            <p className="text-sm text-brand-purple font-bold mb-2">{wordOfTheDay.turkish}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{wordOfTheDay.definition}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 italic mb-4">"{wordOfTheDay.example}"</p>
                            <button
                                onClick={handleLearnWotd}
                                disabled={wotdLearned}
                                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                    wotdLearned
                                        ? 'bg-brand-green/20 text-brand-green cursor-default'
                                        : 'bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:shadow-lg hover:shadow-brand-purple/30 hover:-translate-y-0.5'
                                }`}
                            >
                                {wotdLearned ? (
                                    <>
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        Öğrenildi
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Listeme Ekle (+25 XP)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Badges Carousel */}
                    <div className="bg-white dark:bg-[#2a2a24] rounded-xl p-5 border border-gray-100 dark:border-[#333]">
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Son Rozetler</h4>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {user.earnedBadges && user.earnedBadges.length > 0 ? user.earnedBadges.slice(-4).map((badge, i) => (
                                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                                    <div className="size-14 rounded-full bg-blue-100 border-2 border-brand-blue flex items-center justify-center">
                                        <span className="text-2xl">{badge.icon || '🏅'}</span>
                                    </div>
                                    <span className="text-xs font-medium">{badge.name}</span>
                                </div>
                            )) : (
                                <>
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-40 grayscale">
                                        <div className="size-14 rounded-full bg-yellow-100 border-2 border-primary flex items-center justify-center">
                                            <span className="text-2xl">⚡</span>
                                        </div>
                                        <span className="text-xs font-medium">Hızlı</span>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-40 grayscale">
                                        <div className="size-14 rounded-full bg-blue-100 border-2 border-brand-blue flex items-center justify-center">
                                            <span className="text-2xl">📚</span>
                                        </div>
                                        <span className="text-xs font-medium">Bilgin</span>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-40 grayscale">
                                        <div className="size-14 rounded-full bg-green-100 border-2 border-brand-green flex items-center justify-center">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <span className="text-xs font-medium">Tam</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Practice Streak Widget */}
                    <PracticeStreakWidget variant="full" className="shadow-sm border border-gray-100 dark:border-[#333]" />

                    {/* Study Goals Widget */}
                    <div className="bg-white dark:bg-[#2a2a24] rounded-xl p-5 border border-gray-100 dark:border-[#333]">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-brand-purple">target</span>
                                Günlük Hedefler
                            </h4>
                            <span className="text-xs font-bold text-brand-purple">{dailyGoalStatus.completion}%</span>
                        </div>
                        
                        {/* Motivation message */}
                        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <span className="text-lg">{motivation.emoji}</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{motivation.message}</p>
                        </div>
                        
                        {/* Goal items */}
                        <div className="space-y-3">
                            {dailyGoalStatus.items.slice(0, 3).map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <span className="text-base">{item.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                {item.current}/{item.target}{item.unit || ''}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all ${
                                                    item.percentage >= 100 
                                                        ? 'bg-brand-green' 
                                                        : 'bg-gradient-to-r from-brand-purple to-brand-blue'
                                                }`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    {item.percentage >= 100 && (
                                        <span className="material-symbols-outlined text-brand-green text-sm">check_circle</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <Link 
                            to="/progress" 
                            className="mt-4 block text-center text-xs font-bold text-brand-purple hover:text-purple-700 transition-colors"
                        >
                            Tüm hedefler →
                        </Link>
                    </div>

                    {/* Social Feed */}
                    <div className="bg-white dark:bg-[#2a2a24] rounded-xl p-5 border border-gray-100 dark:border-[#333]">
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Arkadaşların</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-gray-200 overflow-hidden">
                                    <img alt="Avatar" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Ali&background=random" />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold">Ahmet</span> <span className="text-gray-500">50 kelime öğrendi.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-gray-200 overflow-hidden">
                                    <img alt="Avatar" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Zeynep&background=random" />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold">Zeynep</span> <span className="text-gray-500">B1 Seviyesine geçti! 🎉</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vocabulary Stats Widget */}
                    <div className="bg-white dark:bg-[#2a2a24] rounded-xl p-5 border border-gray-100 dark:border-[#333]">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-brand-blue">bar_chart</span>
                                Kelime İstatistikleri
                            </h4>
                        </div>
                        
                        {/* Status Distribution */}
                        {(() => {
                            const vocabulary = user.vocabulary || [];
                            const totalWords = vocabulary.length;
                            const learnedWords = vocabulary.filter(w => w.status === 'learned').length;
                            const reviewingWords = vocabulary.filter(w => w.status === 'reviewing').length;
                            const newWords = vocabulary.filter(w => w.status === 'new').length;
                            
                            const learnedPct = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
                            const reviewingPct = totalWords > 0 ? Math.round((reviewingWords / totalWords) * 100) : 0;
                            const newPct = totalWords > 0 ? Math.round((newWords / totalWords) * 100) : 0;
                            
                            return (
                                <>
                                    {/* Total count */}
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-black bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
                                            {totalWords}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Kelime</p>
                                    </div>
                                    
                                    {/* Progress bar */}
                                    <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden flex mb-4">
                                        {learnedPct > 0 && (
                                            <div 
                                                className="h-full bg-brand-green transition-all" 
                                                style={{ width: `${learnedPct}%` }}
                                                title={`Öğrenildi: ${learnedWords}`}
                                            />
                                        )}
                                        {reviewingPct > 0 && (
                                            <div 
                                                className="h-full bg-brand-orange transition-all" 
                                                style={{ width: `${reviewingPct}%` }}
                                                title={`Tekrar: ${reviewingWords}`}
                                            />
                                        )}
                                        {newPct > 0 && (
                                            <div 
                                                className="h-full bg-brand-blue transition-all" 
                                                style={{ width: `${newPct}%` }}
                                                title={`Yeni: ${newWords}`}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="size-2 rounded-full bg-brand-green" />
                                                <span className="text-xs text-gray-500">Öğrenildi</span>
                                            </div>
                                            <span className="text-sm font-bold text-brand-green">{learnedWords}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="size-2 rounded-full bg-brand-orange" />
                                                <span className="text-xs text-gray-500">Tekrar</span>
                                            </div>
                                            <span className="text-sm font-bold text-brand-orange">{reviewingWords}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="size-2 rounded-full bg-brand-blue" />
                                                <span className="text-xs text-gray-500">Yeni</span>
                                            </div>
                                            <span className="text-sm font-bold text-brand-blue">{newWords}</span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                        
                        <Link 
                            to="/vocabulary" 
                            className="mt-4 block text-center text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors"
                        >
                            Kelime listesi →
                        </Link>
                    </div>
                </section>
            </main>
            
            {/* Focus Timer */}
            <FocusTimer isOpen={showFocusTimer} onClose={() => setShowFocusTimer(false)} />
            
            {/* Focus Timer FAB */}
            <button
                onClick={() => setShowFocusTimer(true)}
                className="fixed bottom-6 right-6 size-14 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50"
                aria-label="Odak Zamanlayıcısını Aç"
            >
                <span className="material-symbols-outlined text-2xl">timer</span>
            </button>
        </div>
    );
}
