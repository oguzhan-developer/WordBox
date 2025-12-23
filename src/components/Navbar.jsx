import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Logo } from './Logo';
import ThemeToggle from './ThemeToggle';
import { Star, Award, Target, BookOpen } from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Ana Sayfa' },
    { path: '/practice', label: 'Dersler' },
    { path: '/vocabulary', label: 'Kelimelerim' },
    { path: '/library', label: 'Kütüphane' },
];

export default function Navbar() {
    const location = useLocation();
    const { user, isLoggedIn, logout } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { isOnline } = useNetworkStatus();

    const isActive = (path) => location.pathname === path;

    if (!isLoggedIn) {
        return (
            <nav className="sticky top-0 z-[90] w-full glass-strong shadow-lg border-b border-white/20 dark:border-slate-700/50">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Logo to="/" size="md" />
                        <Link
                            to="/auth"
                            className="gradient-primary text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            {/* Skip to Content Link - Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
            >
                İçeriğe Atla
            </a>
            
            {!isOnline && (
                <div
                    className="w-full bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-100 border-b border-red-200 dark:border-red-800 text-sm"
                    role="status"
                    aria-live="assertive"
                >
                    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">wifi_off</span>
                        <span>Bağlantı yok. Çevrimdışı çalışıyorsunuz.</span>
                    </div>
                </div>
            )}

            <nav className="sticky top-0 z-[90] w-full glass-strong shadow-xl border-b border-white/20 dark:border-slate-700/50">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Logo to="/dashboard" size="md" />

                        {/* Center Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-1.5 glass rounded-2xl px-2 py-1.5 shadow-lg">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative text-sm font-semibold px-3 py-2 rounded-xl transition-all ${
                                            active
                                                ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Combined Level & XP Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full shadow-lg hover:shadow-xl transition-all cursor-default group">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-white leading-none">verified</span>
                                    <span className="text-xs font-bold text-white">{user.level || 'B1'}</span>
                                </div>
                                <div className="w-px h-3 bg-white/30"></div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-white fill-white" />
                                    <span className="text-xs font-bold text-white">{user.xp || 0}</span>
                                </div>
                            </div>

                            {/* Theme Toggle */}
                            <ThemeToggle variant="icon" />

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => { setProfileMenuOpen(!profileMenuOpen); setMobileMenuOpen(false); }}
                                    aria-expanded={profileMenuOpen}
                                    aria-haspopup="menu"
                                    className="size-12 rounded-full overflow-hidden cursor-pointer border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/70 dark:focus:ring-offset-gray-900 bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500"
                                >
                                    {(() => {
                                        const avatar = user.avatar;
                                        if (!avatar) {
                                            return <span className="flex items-center justify-center w-full h-full text-lg font-bold text-white">{(user.name || 'A')[0].toUpperCase()}</span>;
                                        }
                                        // Gradient avatar
                                        if (avatar.startsWith('{')) {
                                            try {
                                                const parsed = JSON.parse(avatar);
                                                return (
                                                    <>
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${parsed.color} rounded-full`}></div>
                                                        <span className="relative z-10 flex items-center justify-center w-full h-full text-lg font-bold text-white">{parsed.value || (user.name || 'A')[0].toUpperCase()}</span>
                                                    </>
                                                );
                                            } catch { /* URL fallback */ }
                                        }
                                        // Emoji avatar
                                        if (/^[\p{Emoji}\p{Emoji_Component}]+$/u.test(avatar) && avatar.length < 10) {
                                            return <span className="flex items-center justify-center w-full h-full text-2xl">{avatar}</span>;
                                        }
                                        // URL avatar
                                        return <img alt="User Avatar" className="w-full h-full object-cover" src={avatar} />;
                                    })()}
                                </button>

                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#1f1f1a]/95 rounded-2xl shadow-xl border border-gray-100 dark:border-[#333] overflow-hidden z-[95] backdrop-blur-md">
                                        {/* XP & Level Display */}
                                        <div className="mx-2 mt-2 px-4 py-3 border-b border-gray-100 dark:border-[#333] bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-amber-900/20 rounded-t-xl">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3">{user.email}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">verified</span>
                                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Level {user.level || 'B1'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{user.xp || 0} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="px-2 pb-2">
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 rounded-t-xl" onClick={() => setProfileMenuOpen(false)}>
                                                <span className="material-symbols-outlined text-lg">person</span>
                                                Profil
                                            </Link>
                                            <Link to="/vocabulary" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => setProfileMenuOpen(false)}>
                                                <BookOpen className="w-4 h-4" />
                                                Kelimelerim
                                            </Link>
                                            <Link to="/progress" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => setProfileMenuOpen(false)}>
                                                <Target className="w-4 h-4" />
                                                İlerleme
                                            </Link>
                                            <Link to="/progress#badges" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => setProfileMenuOpen(false)}>
                                                <Award className="w-4 h-4" />
                                                Rozetler
                                            </Link>
                                            <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => setProfileMenuOpen(false)}>
                                                <span className="material-symbols-outlined text-lg">settings</span>
                                                Ayarlar
                                            </Link>
                                            <div className="border-t border-gray-100 dark:border-[#333] my-1 mx-2"></div>
                                            <button
                                                onClick={() => { logout(); setProfileMenuOpen(false); }}
                                                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl"
                                            >
                                                <span className="material-symbols-outlined text-lg">logout</span>
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Overlay to close dropdown */}
                                {profileMenuOpen && (
                                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/70 dark:focus:ring-offset-gray-900"
                                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setProfileMenuOpen(false); }}
                                aria-expanded={mobileMenuOpen}
                                aria-label="Menüyü aç/kapat"
                            >
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">menu</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 dark:border-[#333] mt-2 space-y-2 bg-white/90 dark:bg-[#181811]/95 rounded-2xl shadow-lg animate-slideDown">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`block px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                                        isActive(item.path)
                                            ? 'bg-primary/10 text-black dark:text-white'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
