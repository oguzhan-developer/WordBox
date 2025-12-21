import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { LevelBadge } from '../components/Badge';
import {
    calculateLevel,
    getLevelProgress,
    getXpForNextLevel,
    getLevelTitle
} from '../utils/gamification';

export default function ProfilePage() {
    const { user } = useUser();

    if (!user) return null;

    const currentLevel = calculateLevel(user.xp);
    const progress = getLevelProgress(user.xp);
    const xpToNext = getXpForNextLevel(user.xp);
    const levelTitle = getLevelTitle(currentLevel);

    const stats = [
        { label: 'Seri', value: `${user.streak} Gün`, icon: 'local_fire_department', color: 'text-brand-orange' },
        { label: 'Toplam XP', value: user.xp.toLocaleString(), icon: 'trophy', color: 'text-brand-blue' },
        { label: 'Öğrenilen Kelime', value: user.wordsLearned, icon: 'menu_book', color: 'text-brand-green' },
        { label: 'Pratik Sayısı', value: user.practiceCount, icon: 'fitness_center', color: 'text-brand-purple' },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181811] dark:text-white min-h-screen pb-12">
            {/* Header / Banner Area */}
            <div className="h-48 bg-gradient-to-r from-brand-blue to-brand-purple opacity-80 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute top-20 right-20 w-60 h-60 bg-white rounded-full blur-3xl"></div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-[#2a2a24] rounded-2xl shadow-xl border border-gray-100 dark:border-[#333] p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="size-32 rounded-2xl bg-gray-200 dark:bg-white/5 border-4 border-white dark:border-[#2a2a24] shadow-lg overflow-hidden relative group">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <div>
                                    <LevelBadge level={user.level} size="lg" />
                                </div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">military_tech</span>
                                {levelTitle}
                            </div>
                        </div>

                        <Link
                            to="/settings"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 font-bold transition-all text-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            Ayarlar
                        </Link>
                    </div>
                </div>

                {/* Grid for Stats and Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Stats Grid */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-blue">analytics</span>
                            İstatistikler
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-[#2a2a24] p-5 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm">
                                    <div className={`size-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3 ${stat.color}`}>
                                        <span className="material-symbols-outlined">{stat.icon}</span>
                                    </div>
                                    <div className="text-2xl font-black">{stat.value}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Level Progress */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-orange">trending_up</span>
                            Seviye İlerlemesi
                        </h2>
                        <div className="bg-white dark:bg-[#2a2a24] p-6 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm h-full flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mevcut Seviye</div>
                                    <div className="text-3xl font-black">Lvl {currentLevel}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium text-brand-blue">{xpToNext} XP Kaldı</div>
                                    <div className="text-xl font-bold text-gray-400 uppercase tracking-tighter">Lvl {currentLevel + 1}</div>
                                </div>
                            </div>

                            <div className="relative w-full h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest">{Math.round(progress)}% Tamamlandı</div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500">stars</span>
                            Başarımlar
                        </h2>
                        <span className="text-sm font-bold text-brand-blue">{user.earnedBadges?.length || 0} Rozet</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {user.earnedBadges && user.earnedBadges.length > 0 ? (
                            user.earnedBadges.map((badge, i) => (
                                <div key={i} className="bg-white dark:bg-[#2a2a24] p-4 rounded-xl border border-gray-100 dark:border-[#333] flex flex-col items-center text-center group hover:border-brand-blue/30 transition-all">
                                    <div className="size-20 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3 border-2 border-brand-blue/20 group-hover:scale-110 transition-transform">
                                        <span className="text-4xl">{badge.icon || '🏅'}</span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{badge.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
                                <div className="text-4xl mb-3 opacity-30">🎖️</div>
                                <p className="text-gray-500 font-medium">Henüz hiç rozet kazanmadın. Pratik yapmaya devam et!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
