import { useUser } from '../context/UserContext';
import {
    calculateLevel,
    getLevelProgress,
    calculateDailyProgress
} from '../utils/gamification';

export default function ProgressPage() {
    const { user } = useUser();

    if (!user) return null;

    const currentLevel = calculateLevel(user.xp);
    const progress = getLevelProgress(user.xp);
    const dailyProgress = calculateDailyProgress(user.wordsToday, user.preferences?.dailyGoal);

    // Vocabulary distribution
    const vocab = user.vocabulary || [];
    const counts = {
        new: vocab.filter(w => w.status === 'new').length,
        learning: vocab.filter(w => w.status === 'learning').length,
        learned: vocab.filter(w => w.status === 'learned').length,
    };
    const totalVocab = vocab.length || 1; // Avoid division by zero

    const skillStats = [
        { label: 'Okuma', value: Math.min(100, (user.articlesRead || 0) * 5), icon: 'menu_book', color: 'bg-brand-blue' },
        { label: 'Kelime Bilgisi', value: Math.min(100, Math.round((user.wordsLearned / 500) * 100)), icon: 'translate', color: 'bg-brand-green' },
        { label: 'Pratik İstikrarı', value: Math.min(100, (user.practiceCount || 0) * 2), icon: 'bolt', color: 'bg-brand-orange' },
        { label: 'Hatasızlık', value: user.practiceCount > 0 ? Math.round((user.perfectPractices / user.practiceCount) * 100) : 0, icon: 'check_circle', color: 'bg-brand-purple' },
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
                        <div className="size-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined font-fill">local_fire_department</span>
                        </div>
                        <div className="text-3xl font-black">{user.streak} Gün</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Öğrenme Serisi</div>
                    </div>

                    <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined font-fill">stars</span>
                        </div>
                        <div className="text-3xl font-black">{user.xp.toLocaleString()}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Toplam XP</div>
                    </div>

                    <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
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
                                <span className="material-symbols-outlined text-brand-orange">event_available</span>
                                Bugünü Hedefi
                            </h2>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative size-32">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-brand-orange" strokeWidth="3"
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
                                <span className="material-symbols-outlined text-brand-blue">bar_chart</span>
                                Kelime Havuzu Dağılımı
                            </h2>

                            <div className="space-y-6">
                                {/* Stacked Progress Bar */}
                                <div className="h-6 w-full flex rounded-full overflow-hidden bg-gray-100 dark:bg-white/5">
                                    <div style={{ width: `${(counts.learned / totalVocab) * 100}%` }} className="h-full bg-brand-green" />
                                    <div style={{ width: `${(counts.learning / totalVocab) * 100}%` }} className="h-full bg-brand-orange" />
                                    <div style={{ width: `${(counts.new / totalVocab) * 100}%` }} className="h-full bg-brand-blue" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-green/5 border border-brand-green/10">
                                        <div className="size-3 rounded-full bg-brand-green" />
                                        <div>
                                            <div className="text-xl font-black">{counts.learned}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Öğrenildi</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-orange/5 border border-brand-orange/10">
                                        <div className="size-3 rounded-full bg-brand-orange" />
                                        <div>
                                            <div className="text-xl font-black">{counts.learning}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Çalışılıyor</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
                                        <div className="size-3 rounded-full bg-brand-blue" />
                                        <div>
                                            <div className="text-xl font-black">{counts.new}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">Tanımlandı</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Skills & History */}
                    <div className="space-y-8">
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
                                            <div className="size-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
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
                                    <div className="size-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
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
            </main>
        </div>
    );
}
