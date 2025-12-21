import { useTheme, THEMES } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'icon', showLabel = false }) {
    const { theme, toggleTheme, isDark, setTheme } = useTheme();
    
    // Simple icon toggle
    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
                aria-label={isDark ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
                title={isDark ? 'Aydınlık Tema' : 'Karanlık Tema'}
            >
                <span className="material-symbols-outlined text-xl">
                    {isDark ? 'light_mode' : 'dark_mode'}
                </span>
            </button>
        );
    }
    
    // Switch toggle with label
    if (variant === 'switch') {
        return (
            <div className="flex items-center justify-between">
                {showLabel && (
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-xl text-gray-500">
                            {isDark ? 'dark_mode' : 'light_mode'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {isDark ? 'Karanlık Tema' : 'Aydınlık Tema'}
                        </span>
                    </div>
                )}
                <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        isDark 
                            ? 'bg-indigo-600' 
                            : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    role="switch"
                    aria-checked={isDark}
                    aria-label="Tema değiştir"
                >
                    <span
                        className={`inline-block size-5 transform rounded-full bg-white shadow-lg transition-transform ${
                            isDark ? 'translate-x-8' : 'translate-x-1'
                        }`}
                    >
                        <span className="flex items-center justify-center size-full text-xs">
                            {isDark ? '🌙' : '☀️'}
                        </span>
                    </span>
                </button>
            </div>
        );
    }
    
    // Segmented control with system option
    if (variant === 'segmented') {
        return (
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/10 rounded-xl">
                <button
                    onClick={() => setTheme(THEMES.light)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        theme === THEMES.light
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    aria-pressed={theme === THEMES.light}
                >
                    <span className="material-symbols-outlined text-lg">light_mode</span>
                    {showLabel && <span>Aydınlık</span>}
                </button>
                <button
                    onClick={() => setTheme(THEMES.dark)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        theme === THEMES.dark
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    aria-pressed={theme === THEMES.dark}
                >
                    <span className="material-symbols-outlined text-lg">dark_mode</span>
                    {showLabel && <span>Karanlık</span>}
                </button>
                <button
                    onClick={() => setTheme(THEMES.system)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        theme === THEMES.system
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    aria-pressed={theme === THEMES.system}
                >
                    <span className="material-symbols-outlined text-lg">devices</span>
                    {showLabel && <span>Sistem</span>}
                </button>
            </div>
        );
    }
    
    return null;
}
