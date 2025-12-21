import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Theme options
export const THEMES = {
    light: 'light',
    dark: 'dark',
    system: 'system'
};

export function ThemeProvider({ children }) {
    // Get initial theme from localStorage or default to 'system'
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return THEMES.system;
        return localStorage.getItem('wordbox-theme') || THEMES.system;
    });
    
    const [resolvedTheme, setResolvedTheme] = useState('light');
    
    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        
        const applyTheme = (isDark) => {
            if (isDark) {
                root.classList.add('dark');
                setResolvedTheme('dark');
            } else {
                root.classList.remove('dark');
                setResolvedTheme('light');
            }
        };
        
        if (theme === THEMES.system) {
            // Use system preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);
            
            // Listen for system theme changes
            const handler = (e) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            applyTheme(theme === THEMES.dark);
        }
    }, [theme]);
    
    // Persist theme
    useEffect(() => {
        localStorage.setItem('wordbox-theme', theme);
    }, [theme]);
    
    const setThemeValue = (newTheme) => {
        if (Object.values(THEMES).includes(newTheme)) {
            setTheme(newTheme);
        }
    };
    
    const toggleTheme = () => {
        setTheme(current => {
            if (current === THEMES.light) return THEMES.dark;
            if (current === THEMES.dark) return THEMES.light;
            // If system, toggle to opposite of current resolved
            return resolvedTheme === 'dark' ? THEMES.light : THEMES.dark;
        });
    };
    
    const value = {
        theme,
        resolvedTheme,
        setTheme: setThemeValue,
        toggleTheme,
        isDark: resolvedTheme === 'dark',
        isLight: resolvedTheme === 'light',
        isSystem: theme === THEMES.system
    };
    
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
