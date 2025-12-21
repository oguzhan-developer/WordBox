import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Logo } from './Logo';
import ThemeToggle from './ThemeToggle';

const navItems = [
    { path: '/dashboard', label: 'Ana Sayfa' },
    { path: '/practice', label: 'Dersler' },
    { path: '/vocabulary', label: 'Kelimelerim' },
    { path: '/library', label: 'Kütüphane' },
];

const notificationsMock = [
    { id: 1, title: 'Günlük hedef tamamlandı', time: '2 dk önce', type: 'success', icon: 'check_circle' },
    { id: 2, title: 'Yeni kelime önerisi: "serendipity"', time: '15 dk önce', type: 'info', icon: 'lightbulb' },
    { id: 3, title: 'Okuma serin 7 güne ulaştı!', time: '1 saat önce', type: 'streak', icon: 'local_fire_department' },
];

export default function Navbar() {
    const location = useLocation();
    const { user, isLoggedIn, logout } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
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
                        <div className="hidden md:flex items-center gap-2 glass rounded-2xl px-3 py-1.5 shadow-lg">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
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
                        <div className="flex items-center gap-3">
                            {/* Level Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass rounded-full shadow-lg">
                                <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">verified</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">Level {user.level || 'B1'}</span>
                            </div>

                            {/* Theme Toggle */}
                            <ThemeToggle variant="icon" />

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    aria-label="Bildirimler"
                                    onClick={() => { setNotificationsOpen((prev) => !prev); setProfileMenuOpen(false); setMobileMenuOpen(false); }}
                                    aria-expanded={notificationsOpen}
                                    aria-haspopup="menu"
                                    className="size-11 flex items-center justify-center rounded-xl glass hover:shadow-lg transition-all relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50 dark:focus:ring-offset-slate-900 hover:-translate-y-0.5"
                                >
                                    <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" aria-hidden="true">notifications</span>
                                    <span className="absolute top-2 right-2 inline-flex items-center justify-center">
                                        <span className="size-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg" />
                                        <span className="absolute inline-flex size-3 rounded-full bg-red-500/60 animate-ping" aria-hidden="true" />
                                    </span>
                                </button>

                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-3 w-80 glass-strong rounded-2xl shadow-2xl backdrop-blur-xl z-[95] border border-white/20 dark:border-slate-700/50">
                                        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400">notifications_active</span>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Bildirimler</p>
                                            </div>
                                            <span className="text-[11px] font-bold uppercase text-indigo-500 dark:text-indigo-400">Canlı</span>
                                        </div>
                                        <ul className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                                            {notificationsMock.map((item) => (
                                                <li key={item.id} className="p-4 flex gap-3 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                                                    <div className="size-11 rounded-xl glass flex items-center justify-center shadow-lg text-indigo-600 dark:text-indigo-400">
                                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{item.title}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.time}</p>
                                                    </div>
                                                    <span className="size-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 self-center shadow-lg" aria-hidden="true" />
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="px-5 py-4 text-center border-t border-gray-200/50 dark:border-slate-700/50">
                                            <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Tümünü gör</button>
                                        </div>
                                    </div>
                                )}

                                {notificationsOpen && (
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} aria-hidden="true" />
                                )}
                            </div>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotificationsOpen(false); setMobileMenuOpen(false); }}
                                    aria-expanded={profileMenuOpen}
                                    aria-haspopup="menu"
                                    className="size-12 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/70 dark:focus:ring-offset-gray-900"
                                >
                                    <img
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-[#1f1f1a]/95 rounded-2xl shadow-xl border border-gray-100 dark:border-[#333] py-2 z-[95] backdrop-blur-md">
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-[#333]">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => setProfileMenuOpen(false)}>Profil</Link>
                                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => setProfileMenuOpen(false)}>Ayarlar</Link>
                                        <button
                                            onClick={() => { logout(); setProfileMenuOpen(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Çıkış Yap
                                        </button>
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
                                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setProfileMenuOpen(false); setNotificationsOpen(false); }}
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
