import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';
import { getWeeklyActivity, setTodayWords, getBestDayThisWeek } from '../utils/weeklyActivity';
import { getWordOfTheDay, isWordLearnedToday, markWordAsLearned, updateWotdStreak } from '../utils/wordOfTheDay';
import { getDailyGoalStatus, getMotivationMessage } from '../utils/studyGoals';
import { speak } from '../utils/speechSynthesis';
import FocusTimer from '../components/FocusTimer';
import PracticeStreakWidget from '../components/PracticeStreakWidget';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function Dashboard() {
    const { user, addWord, addXp } = useUser();
    const { isOnline } = useNetworkStatus();
    const [showFocusTimer, setShowFocusTimer] = useState(false);
    const [wotdLearned, setWotdLearned] = useState(() => isWordLearnedToday());
    const [wordOfTheDay, setWordOfTheDay] = useState(null);
    const [isLoadingWotd, setIsLoadingWotd] = useState(true);
    const [featuredNews, setFeaturedNews] = useState({ title: 'Yükleniyor...', newWords: [] });
    const [_isLoadingNews, setIsLoadingNews] = useState(true);

    const wordsNeedingReview = useMemo(() =>
        user.vocabulary?.filter(w => w.status !== 'learned').length || 0,
        [user.vocabulary]
    );

    const dailyGoal = useMemo(() =>
        user.preferences?.dailyGoal || 20,
        [user.preferences?.dailyGoal]
    );

    const wordsToday = user.wordsToday || 0;
    const nextLevelXp = 2000; // Mock value for next level threshold

    const progressPercent = useMemo(() =>
        Math.min(100, Math.round((wordsToday / dailyGoal) * 100)),
        [wordsToday, dailyGoal]
    );

    const xpProgress = useMemo(() =>
        Math.min(100, Math.round((user.xp / nextLevelXp) * 100)),
        [user.xp, nextLevelXp]
    );

    // Fetch WOTD and Featured News in parallel
    useEffect(() => {
        if (!user.level) return;

        let cancelled = false;

        const fetchData = async () => {
            setIsLoadingWotd(true);
            setIsLoadingNews(true);

            try {
                // Fetch both in parallel
                const [dbWord, news] = await Promise.all([
                    supabaseService.getWordOfTheDay(user.level || 'B1').catch(() => null),
                    supabaseService.getContentByLevel('news', user.level).catch(() => null)
                ]);

                if (!cancelled) {
                    setWordOfTheDay(dbWord || getWordOfTheDay());
                    setFeaturedNews(news?.[0] || { title: 'İçerik Bulunamadı', newWords: [] });
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                if (!cancelled) {
                    setWordOfTheDay(getWordOfTheDay());
                    setFeaturedNews({ title: 'İçerik Bulunamadı', newWords: [] });
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingWotd(false);
                    setIsLoadingNews(false);
                }
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [user.level]);

    // Study Goals - memoize properly (these read from localStorage, don't depend on wordsToday)
    const dailyGoalStatus = useMemo(() => getDailyGoalStatus(), [wordsToday, dailyGoal]);
    const motivation = useMemo(() => getMotivationMessage(), []);

    // Handle learning WOTD - useCallback to prevent recreating function
    const handleLearnWotd = useCallback(() => {
        if (wotdLearned || !wordOfTheDay) return;

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

        markWordAsLearned();
        const streak = updateWotdStreak();
        setWotdLearned(true);

        addXp(25, `Günün Kelimesi öğrenildi (${streak} gün seri)`);
    }, [wotdLearned, wordOfTheDay, addWord, addXp]);

    // Sync wordsToday to weekly activity (debounced)
    useEffect(() => {
        if (wordsToday > 0) {
            const timer = setTimeout(() => setTodayWords(wordsToday), 500);
            return () => clearTimeout(timer);
        }
    }, [wordsToday]);

    // Get weekly activity data - memoize properly (these read from localStorage)
    const weeklyActivity = useMemo(() => getWeeklyActivity(), []);
    const bestDay = useMemo(() => getBestDayThisWeek(), []);
    const weeklyMax = useMemo(() => Math.max(bestDay, 20), [bestDay]);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-primary-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 font-display text-slate-900 dark:text-white min-h-screen flex flex-col overflow-x-hidden">
            {/* Offline Banner */}
            {!isOnline && (
                <div className="bg-warning text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
                    <WifiOff className="w-4 h-4" />
                    <span>Çevrimdışı moddasın. Bazı özellikler kullanılamayabilir.</span>
                </div>
            )}

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Hero Section */}
                <section className="flex flex-col lg:flex-row gap-8 mb-12 items-start lg:items-center">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-purple to-accent bg-clip-text text-transparent break-words leading-tight pb-2">
                            Hoş geldin, {user.name?.split(' ')[0] || 'Öğrenci'}! <span className="inline-block animate-bounce">👋</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-lg">Bugünkü hedefine ulaşmak için harika bir gün. Sadece 15 dakika daha pratik yap.</p>
                    </div>
                    {/* Daily Stats Row */}
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        {/* Daily Goal */}
                        <div className="flex items-center gap-4 glass rounded-2xl p-5 shadow-xl border border-white/20 dark:border-dark-border min-w-[200px] flex-1 hover:scale-105 transition-all">
                            <div className="relative size-14">
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                    <path className="text-primary dark:text-primary-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" strokeLinecap="round"></path>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary dark:text-primary-400">{progressPercent}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Bugünkü Hedef</div>
                                <div className="text-xl font-bold">{wordsToday}/{dailyGoal}</div>
                            </div>
                        </div>
                        {/* Streak */}
                        <div className="flex items-center gap-4 glass rounded-2xl p-5 shadow-xl border border-white/20 dark:border-dark-border min-w-[160px] flex-1 hover:scale-105 transition-all">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-warning to-accent flex items-center justify-center shadow-lg shadow-accent/30">
                                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Seri</div>
                                <div className="text-xl font-bold bg-gradient-to-r from-warning to-accent bg-clip-text text-transparent">{user.streak} Gün</div>
                            </div>
                        </div>
                        {/* XP */}
                        <div className="flex items-center gap-4 glass rounded-2xl p-5 shadow-xl border border-white/20 dark:border-dark-border min-w-[160px] flex-1 hover:scale-105 transition-all">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-info to-info-600 flex items-center justify-center shadow-lg shadow-info/30">
                                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Toplam XP</div>
                                <div className="text-xl font-bold bg-gradient-to-r from-info to-info-600 bg-clip-text text-transparent">{user.xp}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Daily News */}
                    <article className="glass-strong rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-dark-border flex flex-col group hover:scale-105 transition-all duration-300">
                        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden">
                            <img alt="Team working on tech" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={featuredNews.image || "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=600&auto=format&fit=crop"} />
                            <div className="absolute top-4 left-4 glass text-primary dark:text-primary-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                {featuredNews.level || user.level || 'B1'} Seviyesi
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary dark:text-primary-400 text-[20px]">newspaper</span>
                                <span className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-wide">Günün Haberi</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 leading-tight text-gray-900 dark:text-white">{featuredNews.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 5 dk</span>
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                <span className="flex items-center gap-1 text-secondary dark:text-secondary-400 font-medium"><span className="material-symbols-outlined text-[16px]">add_circle</span> {featuredNews.newWords?.length || 0} Yeni Kelime</span>
                            </div>
                            <Link to={`/read/${featuredNews.id || 1}`} className="mt-auto w-full gradient-primary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/50 transition-all hover:-translate-y-0.5">
                                Okumaya Başla
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </Link>
                        </div>
                    </article>

                    {/* Card 2: Practice */}
                    <article className="glass-strong rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-dark-border flex flex-col hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-accent dark:text-accent-400 text-[20px]">psychology</span>
                                    <span className="text-xs font-bold text-accent dark:text-accent-400 uppercase tracking-wide">Kelime Pratiği</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tekrar Edilecekler</h3>
                            </div>
                            <div className="size-12 bg-gradient-to-br from-warning to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30">
                                <span className="material-symbols-outlined text-white">notifications_active</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                            <div className="text-7xl font-black bg-gradient-to-r from-warning via-accent to-accent-600 bg-clip-text text-transparent mb-2 tracking-tighter">
                                {wordsNeedingReview}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 text-center">Bugün tekrar etmen gereken kelime var.</p>
                            <div className="flex gap-4 w-full justify-center mb-8">
                                <Link to="/practice" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-info group-hover:to-info-600 transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">quiz</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Test</span>
                                </Link>
                                <Link to="/practice?mode=flashcard" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-secondary group-hover:to-secondary-600 transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">style</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Kartlar</span>
                                </Link>
                                <Link to="/practice" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-warning group-hover:to-accent transition-all shadow-lg">
                                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">mic</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Konuşma</span>
                                </Link>
                                <Link to="/practice/sprint" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-14 rounded-2xl glass flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent-400 group-hover:to-accent transition-all shadow-lg">
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
                    <article className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-secondary text-[20px]">trending_up</span>
                                    <span className="text-xs font-bold text-secondary uppercase tracking-wide">İlerleme Özeti</span>
                                </div>
                                <h3 className="text-lg font-bold">Haftalık Performans</h3>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                            {/* Weekly Chart - Real Data - Memoized */}
                            <div className="flex items-end justify-between gap-2 h-32 mb-6 px-2">
                                {weeklyActivity.map((day) => {
                                    const heightPercent = weeklyMax > 0 ? Math.max(5, (day.words / weeklyMax) * 100) : 5;
                                    const isActive = day.words > 0;
                                    const isToday = day.isToday;

                                    return (
                                        <div
                                            key={day.date}
                                            className={`w-full rounded-t-md relative group transition-all cursor-pointer hover:opacity-80 ${
                                                isToday
                                                    ? 'bg-secondary'
                                                    : isActive
                                                        ? 'bg-secondary/50'
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
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs px-2 py-0.5 rounded font-bold">
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
                                    <span className="font-bold text-primary">{nextLevelXp - (user.xp % nextLevelXp)} XP kaldı</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${xpProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <a className="mt-6 text-center text-sm font-bold text-primary hover:text-primary-700 transition-colors" href="/progress">
                            Detaylı İstatistikler →
                        </a>
                    </article>
                </section>

                {/* Bottom Widgets */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Word of the Day */}
                    <div className="bg-gradient-to-br from-purple/10 to-primary/10 dark:from-purple/20 dark:to-primary/20 rounded-xl p-5 border border-purple/20 dark:border-purple/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-purple dark:text-purple-400 uppercase flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                    Günün Kelimesi
                                </h4>
                                {wordOfTheDay && (
                                    <span className="px-2 py-0.5 bg-purple/10 text-purple dark:text-purple-400 text-xs font-bold rounded-full">
                                        {wordOfTheDay.level}
                                    </span>
                                )}
                            </div>
                            {isLoadingWotd || !wordOfTheDay ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{wordOfTheDay.word}</h3>
                                        <button
                                            onClick={() => speak(wordOfTheDay.word)}
                                            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                            aria-label="Kelimeyi seslendir"
                                        >
                                            <span className="material-symbols-outlined text-purple dark:text-purple-400 text-lg">volume_up</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{wordOfTheDay.phonetic}</p>
                                    <p className="text-sm text-purple dark:text-purple-400 font-bold mb-2">{wordOfTheDay.turkish}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{wordOfTheDay.definition}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 italic mb-4">"{wordOfTheDay.example}"</p>
                                    <button
                                        onClick={handleLearnWotd}
                                        disabled={wotdLearned}
                                        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                            wotdLearned
                                                ? 'bg-secondary/20 text-secondary cursor-default'
                                                : 'gradient-purple text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5'
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Badges Carousel */}
                    <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border">
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Son Rozetler</h4>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {user.earnedBadges && user.earnedBadges.length > 0 ? user.earnedBadges.slice(-4).map((badge, i) => (
                                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                                    <div className="size-14 rounded-full bg-info/10 border-2 border-primary flex items-center justify-center">
                                        <span className="text-2xl">{badge.icon || '🏅'}</span>
                                    </div>
                                    <span className="text-xs font-medium">{badge.name}</span>
                                </div>
                            )) : (
                                <>
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-40 grayscale">
                                        <div className="size-14 rounded-full bg-accent/10 border-2 border-primary flex items-center justify-center">
                                            <span className="text-2xl">⚡</span>
                                        </div>
                                        <span className="text-xs font-medium">Hızlı</span>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-40 grayscale">
                                        <div className="size-14 rounded-full bg-info/10 border-2 border-primary flex items-center justify-center">
                                            <span className="text-2xl">📚</span>
                                        </div>
                                        <span className="text-xs font-medium">Bilgin</span>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-40 grayscale">
                                        <div className="size-14 rounded-full bg-secondary/10 border-2 border-secondary flex items-center justify-center">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <span className="text-xs font-medium">Tam</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Practice Streak Widget */}
                    <PracticeStreakWidget variant="full" className="shadow-sm border border-gray-100 dark:border-dark-border" />

                    {/* Study Goals Widget */}
                    <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-purple">target</span>
                                Günlük Hedefler
                            </h4>
                            <span className="text-xs font-bold text-purple">{dailyGoalStatus.completion}%</span>
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
                                                        ? 'bg-secondary'
                                                        : 'gradient-primary'
                                                }`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    {item.percentage >= 100 && (
                                        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Link
                            to="/progress"
                            className="mt-4 block text-center text-xs font-bold text-purple hover:text-purple-700 transition-colors"
                        >
                            Tüm hedefler →
                        </Link>
                    </div>

                    {/* Social Feed */}
                    <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border">
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
                    <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary">bar_chart</span>
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
                                        <div className="text-4xl font-black bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                                            {totalWords}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Kelime</p>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden flex mb-4">
                                        {learnedPct > 0 && (
                                            <div
                                                className="h-full bg-secondary transition-all"
                                                style={{ width: `${learnedPct}%` }}
                                                title={`Öğrenildi: ${learnedWords}`}
                                            />
                                        )}
                                        {reviewingPct > 0 && (
                                            <div
                                                className="h-full bg-accent transition-all"
                                                style={{ width: `${reviewingPct}%` }}
                                                title={`Tekrar: ${reviewingWords}`}
                                            />
                                        )}
                                        {newPct > 0 && (
                                            <div
                                                className="h-full bg-info transition-all"
                                                style={{ width: `${newPct}%` }}
                                                title={`Yeni: ${newWords}`}
                                            />
                                        )}
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="size-2 rounded-full bg-secondary" />
                                                <span className="text-xs text-gray-500">Öğrenildi</span>
                                            </div>
                                            <span className="text-sm font-bold text-secondary">{learnedWords}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="size-2 rounded-full bg-accent" />
                                                <span className="text-xs text-gray-500">Tekrar</span>
                                            </div>
                                            <span className="text-sm font-bold text-accent">{reviewingWords}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="size-2 rounded-full bg-info" />
                                                <span className="text-xs text-gray-500">Yeni</span>
                                            </div>
                                            <span className="text-sm font-bold text-info">{newWords}</span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        <Link
                            to="/vocabulary"
                            className="mt-4 block text-center text-xs font-bold text-primary hover:text-primary-700 transition-colors"
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
                className="fixed bottom-6 right-6 size-14 rounded-2xl gradient-purple text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50"
                aria-label="Odak Zamanlayıcısını Aç"
            >
                <span className="material-symbols-outlined text-2xl">timer</span>
            </button>
        </div>
    );
}
