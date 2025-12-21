import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

export default function Dashboard() {
    const { user } = useUser();

    const [featuredNews, setFeaturedNews] = useState({ title: 'Yükleniyor...', newWords: [] });
    const [isLoadingNews, setIsLoadingNews] = useState(true);

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

    // Calculate stats
    const dailyGoal = user.preferences?.dailyGoal || 20;
    const wordsToday = user.wordsToday || 0;
    const progressPercent = Math.min(100, Math.round((wordsToday / dailyGoal) * 100));
    const nextLevelXp = 2000; // Mock value for next level threshold
    const xpProgress = Math.min(100, Math.round((user.xp / nextLevelXp) * 100));

    // Mock leader data if simple ranking
    const rank = 42;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181811] dark:text-white min-h-screen flex flex-col overflow-x-hidden">
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Hero Section */}
                <section className="flex flex-col lg:flex-row gap-8 mb-12 items-start lg:items-center">
                    <div className="flex-1">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Hoş geldin, {user.name?.split(' ')[0] || 'Öğrenci'}! <span className="inline-block animate-pulse">👋</span></h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-lg">Bugünkü hedefine ulaşmak için harika bir gün. Sadece 15 dakika daha pratik yap.</p>
                    </div>
                    {/* Daily Stats Row */}
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        {/* Daily Goal */}
                        <div className="flex items-center gap-4 bg-white dark:bg-[#2a2a24] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#333] min-w-[200px] flex-1">
                            <div className="relative size-14">
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-100 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                    <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3"></path>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progressPercent}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Bugünkü Hedef</div>
                                <div className="text-lg font-bold">{wordsToday}/{dailyGoal}</div>
                            </div>
                        </div>
                        {/* Streak */}
                        <div className="flex items-center gap-4 bg-white dark:bg-[#2a2a24] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#333] min-w-[160px] flex-1">
                            <div className="size-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Seri</div>
                                <div className="text-lg font-bold text-brand-orange">{user.streak} Gün</div>
                            </div>
                        </div>
                        {/* XP */}
                        <div className="flex items-center gap-4 bg-white dark:bg-[#2a2a24] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#333] min-w-[160px] flex-1">
                            <div className="size-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Toplam XP</div>
                                <div className="text-lg font-bold text-brand-blue">{user.xp}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Daily News */}
                    <article className="bg-white dark:bg-[#2a2a24] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#333] flex flex-col group hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                            <img alt="Team working on tech" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={featuredNews.image || "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=600&auto=format&fit=crop"} />
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {featuredNews.level || user.level || 'B1'} Seviyesi
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-brand-blue text-[20px]">newspaper</span>
                                <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">Günün Haberi</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 leading-tight">{featuredNews.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 5 dk</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="flex items-center gap-1 text-brand-green font-medium"><span className="material-symbols-outlined text-[16px]">add_circle</span> {featuredNews.newWords?.length || 0} Yeni Kelime</span>
                            </div>
                            <Link to={`/read/${featuredNews.id || 1}`} className="mt-auto w-full bg-primary hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                Okumaya Başla
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </Link>
                        </div>
                    </article>

                    {/* Card 2: Practice */}
                    <article className="bg-white dark:bg-[#2a2a24] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#333] flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-brand-orange text-[20px]">psychology</span>
                                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wide">Kelime Pratiği</span>
                                </div>
                                <h3 className="text-lg font-bold">Tekrar Edilecekler</h3>
                            </div>
                            <div className="size-10 bg-brand-orange/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-orange">notifications_active</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                            <div className="text-6xl font-black text-[#181811] dark:text-white mb-2 tracking-tighter">
                                {user.vocabulary?.filter(w => w.status !== 'learned').length || 0}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">Bugün tekrar etmen gereken kelime var.</p>
                            <div className="flex gap-4 w-full justify-center mb-8">
                                <Link to="/practice" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-12 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-brand-blue/10 group-hover:border-brand-blue/30 transition-colors">
                                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:text-brand-blue">quiz</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Test</span>
                                </Link>
                                <Link to="/practice?mode=flashcard" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-12 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-brand-green/10 group-hover:border-brand-green/30 transition-colors">
                                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:text-brand-green">style</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Kartlar</span>
                                </Link>
                                <Link to="/practice" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-12 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:border-brand-orange/30 transition-colors">
                                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:text-brand-orange">mic</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Konuşma</span>
                                </Link>
                                <Link to="/practice/sprint" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="size-12 rounded-full bg-yellow-400/10 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-700/30 flex items-center justify-center group-hover:bg-yellow-400/20 group-hover:border-yellow-400/50 transition-colors">
                                        <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-500">bolt</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Maraton</span>
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
                            {/* Fake Chart */}
                            <div className="flex items-end justify-between gap-2 h-32 mb-6 px-2">
                                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-t-md relative group h-[40%]">
                                    <div className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">Pt</div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-t-md relative group h-[60%]">
                                    <div className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">Sa</div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-t-md relative group h-[45%]"></div>
                                <div className="w-full bg-brand-green/30 rounded-t-md relative group h-[75%]"></div>
                                <div className="w-full bg-brand-green/60 rounded-t-md relative group h-[85%]"></div>
                                <div className="w-full bg-brand-green rounded-t-md relative group h-[95%]">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded font-bold">{user.wordsToday || 120}</div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-t-md relative group h-[20%]"></div>
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

                    {/* Leaderboard Mini */}
                    <div className="bg-white dark:bg-[#2a2a24] rounded-xl p-5 border border-gray-100 dark:border-[#333] flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-1">Lider Tablosu</h4>
                            <p className="text-2xl font-bold">#{rank} <span className="text-sm font-normal text-brand-green ml-2">▲ 3 sıra</span></p>
                            <p className="text-xs text-gray-500 mt-1">Bu hafta rakiplerin çok çalışıyor!</p>
                        </div>
                        <div className="size-12 bg-primary/20 text-yellow-700 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined">leaderboard</span>
                        </div>
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
                </section>
            </main>
        </div>
    );
}
