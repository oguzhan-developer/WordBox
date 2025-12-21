import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Navbar() {
    const location = useLocation();
    const { user, isLoggedIn, logout } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    if (!isLoggedIn) {
        return (
            <nav className="w-full bg-white/80 dark:bg-[#181811]/80 backdrop-blur-md border-b border-[#e6e6db] dark:border-[#333]">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-black">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight hidden sm:block">WordBox</h1>
                        </Link>
                        <Link
                            to="/auth"
                            className="text-sm font-bold bg-primary hover:bg-yellow-300 text-black py-2 px-4 rounded-lg transition-colors"
                        >
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="w-full bg-white/80 dark:bg-[#181811]/80 backdrop-blur-md border-b border-[#e6e6db] dark:border-[#333]">
            <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="size-10 bg-primary rounded-lg flex items-center justify-center text-black">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight hidden sm:block">WordBox</h1>
                    </div>

                    {/* Center Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/dashboard"
                            className={`text-base font-bold transition-colors ${isActive('/dashboard') ? 'text-black dark:text-white border-b-2 border-primary pb-0.5' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            Ana Sayfa
                        </Link>
                        <Link
                            to="/practice"
                            className={`text-base font-bold transition-colors ${isActive('/practice') ? 'text-black dark:text-white border-b-2 border-primary pb-0.5' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            Dersler
                        </Link>
                        <Link
                            to="/vocabulary"
                            className={`text-base font-bold transition-colors ${isActive('/vocabulary') ? 'text-black dark:text-white border-b-2 border-primary pb-0.5' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            Kelimelerim
                        </Link>
                        <Link
                            to="/library"
                            className={`text-base font-bold transition-colors ${isActive('/library') ? 'text-black dark:text-white border-b-2 border-primary pb-0.5' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            Kütüphane
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Level Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-300 rounded-full">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            <span className="text-xs font-bold">Level {user.level || 'B1'}</span>
                        </div>

                        {/* Notifications */}
                        <button className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {/* Profile */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="size-12 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-white shadow-sm"
                            >
                                <img
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2a2a24] rounded-xl shadow-lg border border-gray-100 dark:border-[#333] py-1 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-[#333]">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5" onClick={() => setProfileMenuOpen(false)}>Profil</Link>
                                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5" onClick={() => setProfileMenuOpen(false)}>Ayarlar</Link>
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
                            className="md:hidden size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">menu</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 dark:border-[#333] mt-2 space-y-2">
                        <Link
                            to="/dashboard"
                            className={`block px-4 py-2 text-sm font-bold rounded-lg ${isActive('/dashboard') ? 'bg-primary/10 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Ana Sayfa
                        </Link>
                        <Link
                            to="/practice"
                            className={`block px-4 py-2 text-sm font-bold rounded-lg ${isActive('/practice') ? 'bg-primary/10 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dersler
                        </Link>
                        <Link
                            to="/vocabulary"
                            className={`block px-4 py-2 text-sm font-bold rounded-lg ${isActive('/vocabulary') ? 'bg-primary/10 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Kelimelerim
                        </Link>
                        <Link
                            to="/library"
                            className={`block px-4 py-2 text-sm font-bold rounded-lg ${isActive('/library') ? 'bg-primary/10 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Topluluk (Kütüphane)
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
