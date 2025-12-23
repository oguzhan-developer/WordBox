import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { supabaseService } from '../services/supabaseService';
import {
    updateStreak,
    checkNewBadges,
    xpRewards
} from '../utils/gamification';

// Create the context
const UserContext = createContext(null);

// Default user state (fallback)
const defaultUser = {
    id: null,
    name: '',
    email: '',
    avatar: null,
    level: 'B1',
    xp: 0,
    streak: 0,
    lastPracticeDate: null,
    wordsLearned: 0,
    wordsToday: 0,
    articlesRead: 0,
    readArticles: [],
    practiceCount: 0,
    perfectPractices: 0,
    vocabulary: [],
    earnedBadges: [],
    completedLevels: [],
    preferences: {
        // Learning
        dailyGoal: 20,
        level: 'B1', // Default target level
        difficultyAdaptation: true,
        voiceAccent: 'american', // american, british
        aiPersonalization: true,

        // Vocabulary
        repetitionIntensity: 'normal', // low, normal, high
        reviewFrequency: 'daily',
        practiceModes: { flashcards: true, matching: true, speaking: true },
        translationDirection: 'en-tr', // en-tr, tr-en, both
        accent: 'us', // us, uk

        // Notifications
        notifications: {
            email: true,
            push: true,
            dailyReminder: '09:00',
            streakWarning: true,
            weeklySummary: true,
        },

        // Appearance
        theme: 'system', // light, dark, system
        fontSize: 'medium', // small, medium, large
        readingMode: 'normal', // normal, focus
        animationIntensity: 'normal', // reduced, normal
        highContrast: false,

        // Privacy
        publicProfile: true,
        activityVisibility: true,

        // Legacy/Root (for backward compat if needed, though we should migrate)
        soundEffects: true,
        darkMode: false,
    },
};

// Map Supabase Profile to App User Structure
const mapProfileToUser = (profile, email) => {
    if (!profile) return defaultUser;

    return {
        id: profile.id,
        email: email || '',
        name: profile.full_name || '',
        avatar: profile.avatar_url,
        level: profile.level || 'B1',

        xp: profile.xp || 0,
        streak: profile.streak || 0,
        lastPracticeDate: profile.last_practice_date,

        wordsLearned: profile.words_learned || 0,
        wordsToday: profile.words_today || 0,
        articlesRead: profile.articles_read || 0,
        practiceCount: profile.practice_count || 0,
        perfectPractices: profile.perfect_practices || 0,

        vocabulary: profile.vocabulary || [], // JSONB
        earnedBadges: profile.earned_badges || [], // JSONB
        preferences: profile.preferences || defaultUser.preferences, // JSONB
        completedLevels: profile.completed_levels || [], // JSONB
        readArticles: profile.read_articles || [], // JSONB
    };
};

export function UserProvider({ children }) {
    const [user, setUser] = useState(defaultUser);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newBadges, setNewBadges] = useState([]);

    // Helper to handle successful auth
    const handleAuthSuccess = async (sessionUser) => {
        // Optimistically set user as logged in with metadata we have
        setIsLoggedIn(true);
        setUser(prev => ({
            ...prev,
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.user_metadata?.name || '',
            // Keep other defaults until profile loads
        }));
        setLoading(false); // Stop global loading immediately

        // Fetch profile in background
        console.log("Fetching profile in background for:", sessionUser.id);
        fetchProfile(sessionUser);
    };

    // Initial Auth Check & Subscription
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    if (session) {
                        console.log("Session found, initializing user...");
                        await handleAuthSuccess(session.user);
                    } else {
                        console.log("No session found.");
                        setUser(defaultUser);
                        setIsLoggedIn(false);
                    }
                }
            } catch (err) {
                console.error("Auth init error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state change:", event);
            if (event === 'SIGNED_IN' && session) {
                await handleAuthSuccess(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(defaultUser);
                setIsLoggedIn(false);
                setLoading(false);
            }
        });

        initAuth();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally empty - init only on mount

    // Theme Switch Logic
    useEffect(() => {
        if (!user || !user.preferences) return;

        const theme = user.preferences.theme; // 'light', 'dark'
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.preferences?.theme]); // Only react to theme preference changes

    // Font Size Logic
    useEffect(() => {
        if (!user || !user.preferences) return;

        const fontSize = user.preferences.fontSize; // 'small', 'medium', 'large'
        const root = window.document.documentElement;

        let scale = '16px'; // Default (rem = 16px)
        switch (fontSize) {
            case 'small':
                scale = '14px'; // 87.5%
                break;
            case 'large':
                scale = '18px'; // 112.5%
                break;
            case 'medium':
            default:
                scale = '16px';
        }

        root.style.fontSize = scale;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.preferences?.fontSize]); // Only react to fontSize preference changes

    // Check reset daily stats (only logic, sync is handled in recordActivity or separately)
    useEffect(() => {
        if (!isLoggedIn || !user.id || !user.lastPracticeDate) return;

        const today = new Date().toDateString();
        const lastActivity = new Date(user.lastPracticeDate).toDateString();

        if (lastActivity && lastActivity !== today && user.wordsToday > 0) {
            updateProfile({ words_today: 0 }); // Reset wordsToday in DB
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, user.lastPracticeDate]); // Intentionally minimal deps to run once per date change


    // Fetch Profile from DB
    const fetchProfile = async (auth_user) => {
        try {
            // Create a timeout promise for the database query
            const dbQueryPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', auth_user.id)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            );

            // Race them
            let data = null;
            let error = null;

            try {
                const result = await Promise.race([dbQueryPromise, timeoutPromise]);
                data = result.data;
                error = result.error;
            } catch (err) {
                console.warn("Profile fetch timed out or failed:", err.message);
                // Proceed without throwing to ensure we don't crash
            }

            if (error && error.code !== 'PGRST116') throw error; // Still throw if it's a real DB error, not just not found

            // Fetch user's vocabulary from user_words table regardless of profile status
            console.log("Fetching user vocabulary...");
            const vocabulary = await supabaseService.getUserWords(auth_user.id);
            console.log(`Loaded ${vocabulary.length} words from database`);

            if (data) {
                console.log("Profile found, updating user state.");
                const profileUser = mapProfileToUser(data, auth_user.email);
                
                setUser({
                    ...profileUser,
                    vocabulary: vocabulary,
                    wordsLearned: vocabulary.length,
                });
            } else {
                console.log("Profile missing/timeout. Using basic auth data + vocabulary.");
                // Even without profile, set vocabulary
                setUser(prev => ({
                    ...prev,
                    vocabulary: vocabulary,
                    wordsLearned: vocabulary.length,
                }));
            }
        } catch (error) {
            console.error('Error in fetchProfile wrapper:', error);
        }
    };

    // Generic Update Profile Helper
    const updateProfile = async (updates) => {
        if (!user.id) return;

        // Optimistic UI Update (partial)
        // We need to map back to local state keys
        const localUpdates = {};
        if (updates.xp !== undefined) localUpdates.xp = updates.xp;
        if (updates.streak !== undefined) localUpdates.streak = updates.streak;
        if (updates.last_practice_date !== undefined) localUpdates.lastPracticeDate = updates.last_practice_date;
        if (updates.words_learned !== undefined) localUpdates.wordsLearned = updates.words_learned;
        if (updates.words_today !== undefined) localUpdates.wordsToday = updates.words_today;
        if (updates.articles_read !== undefined) localUpdates.articlesRead = updates.articles_read;
        if (updates.practice_count !== undefined) localUpdates.practiceCount = updates.practice_count;
        if (updates.perfect_practices !== undefined) localUpdates.perfectPractices = updates.perfect_practices;
        if (updates.vocabulary !== undefined) localUpdates.vocabulary = updates.vocabulary;
        if (updates.earned_badges !== undefined) localUpdates.earnedBadges = updates.earned_badges;
        if (updates.preferences !== undefined) localUpdates.preferences = updates.preferences;
        if (updates.preferences !== undefined) localUpdates.preferences = updates.preferences;
        if (updates.completed_levels !== undefined) localUpdates.completedLevels = updates.completed_levels;
        if (updates.read_articles !== undefined) localUpdates.readArticles = updates.read_articles;
        if (updates.level !== undefined) localUpdates.level = updates.level;
        if (updates.avatar_url !== undefined) localUpdates.avatar = updates.avatar_url;

        setUser(prev => ({ ...prev, ...localUpdates }));

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating profile:', error);
            // Ideally revert local state here on failure, but for now log it.
        }
    };


    // --- Public Actions ---

    const login = async ({ email, password }) => {
        console.log("Login attempted for:", email);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error("Supabase login error:", error);
            throw error;
        }
        console.log("Supabase login successful");
    };

    const register = async (name, email, password, level) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    level
                }
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };


    const addXp = (amount, _reason = '') => {
        if (!user.id) return;

        const newXp = user.xp + amount;
        // Check for new badges
        const userStats = { ...user, xp: newXp }; // Mocking updated state for check
        const badges = checkNewBadges(userStats, user.earnedBadges.map(b => b.id));

        let dbUpdates = { xp: newXp };
        let earnedBadges = [...user.earnedBadges];

        if (badges.length > 0) {
            setNewBadges(badges);
            const badgeXp = badges.reduce((sum, badge) => sum + badge.xpReward, 0);
            dbUpdates.xp = newXp + badgeXp; // Add badge reward

            const newBadgesList = badges.map(b => ({ ...b, earnedAt: new Date().toISOString() }));
            earnedBadges = [...earnedBadges, ...newBadgesList];
            dbUpdates.earned_badges = earnedBadges;
        }

        updateProfile(dbUpdates);
    };

    const recordActivity = () => {
        if (!user.id) return;

        const today = new Date().toISOString();
        const newStreak = updateStreak(user.streak, user.lastPracticeDate);

        let dbUpdates = {
            streak: newStreak,
            last_practice_date: today
        };

        // Check for streak badges
        // We simulate the update state
        const userStats = { ...user, streak: newStreak };
        const badges = checkNewBadges(userStats, user.earnedBadges.map(b => b.id));

        if (badges.length > 0) {
            setNewBadges(badges);
            const badgeXp = badges.reduce((sum, badge) => sum + badge.xpReward, 0);

            // We need to account for existing xp... but wait, recordActivity is often called separately?
            // Assuming current 'user.xp' is up to date (or close enough). 
            // Ideally we'd transact this but client-side logic is simpler:
            dbUpdates.xp = user.xp + badgeXp;

            const newBadgesList = badges.map(b => ({ ...b, earnedAt: today }));
            dbUpdates.earned_badges = [...user.earnedBadges, ...newBadgesList];
        }

        updateProfile(dbUpdates);
    };

    const addWord = async (word) => {
        if (!user.id) return;

        // Check if word already exists in vocabulary by word text
        const existingWord = user.vocabulary.find(w => 
            w.id === word.id || 
            w.word?.toLowerCase() === word.word?.toLowerCase()
        );
        if (existingWord) {
            console.log('Word already in vocabulary:', word.word);
            return;
        }

        try {
            // Add to database
            const addedWord = await supabaseService.addUserWord(user.id, word.id, 'manual');
            
            if (!addedWord) {
                console.log('Word already added (duplicate)');
                return;
            }

            // Optimistically update UI
            const newWord = {
                ...word,
                addedAt: new Date().toISOString(),
                status: 'new',
                practiceCount: 0,
                correctCount: 0,
                lastPractice: null,
                nextReview: null,
            };

            const newVocab = [...user.vocabulary, newWord];
            
            setUser(prev => ({
                ...prev,
                vocabulary: newVocab,
                wordsLearned: newVocab.length,
                wordsToday: prev.wordsToday + 1,
            }));

            // Update profile stats
            updateProfile({
                words_today: user.wordsToday + 1,
                xp: user.xp + xpRewards.addWord
            });

            console.log('Word added successfully:', word.word);
        } catch (err) {
            console.error('Error adding word:', err);
        }
    };

    const removeWord = async (wordId) => {
        if (!user.id) return;
        
        try {
            // Remove from database
            await supabaseService.removeUserWord(user.id, wordId);
            
            // Optimistically update UI
            const newVocab = user.vocabulary.filter(w => w.id !== wordId);
            setUser(prev => ({
                ...prev,
                vocabulary: newVocab,
                wordsLearned: newVocab.length,
            }));
            
            console.log('Word removed successfully');
        } catch (err) {
            console.error('Error removing word:', err);
        }
    };

    const updateWordPractice = async (wordId, isCorrect) => {
        if (!user.id) return;

        try {
            // Update in database
            await supabaseService.updateUserWordPractice(user.id, wordId, isCorrect);
            
            // Optimistically update UI
            const updatedVocab = user.vocabulary.map(word => {
                if (word.id !== wordId) return word;

                const newCorrectCount = isCorrect ? (word.correctCount || 0) + 1 : word.correctCount;
                const newPracticeCount = (word.practiceCount || 0) + 1;

                let newStatus = word.status;
                if (newCorrectCount >= 5) newStatus = 'learned';
                else if (newPracticeCount >= 1) newStatus = 'learning';

                return {
                    ...word,
                    practiceCount: newPracticeCount,
                    correctCount: newCorrectCount,
                    lastPractice: new Date().toISOString(),
                    status: newStatus,
                };
            });

            setUser(prev => ({ ...prev, vocabulary: updatedVocab }));
            console.log('Word practice updated');
        } catch (err) {
            console.error('Error updating word practice:', err);
        }
    };

    const completePractice = (correctCount, wrongCount) => {
        if (!user.id) return;
        const isPerfect = wrongCount === 0 && correctCount > 0;

        updateProfile({
            practice_count: user.practiceCount + 1,
            perfect_practices: isPerfect ? user.perfectPractices + 1 : user.perfectPractices
        });
    };

    const readArticle = (articleId) => {
        if (!user.id || !articleId) return;

        // Check if already read
        const isAlreadyRead = user.readArticles?.includes(articleId);

        if (!isAlreadyRead) {
            const updatedReadArticles = [...(user.readArticles || []), articleId];

            updateProfile({
                read_articles: updatedReadArticles,
                articles_read: user.articlesRead + 1,
                xp: user.xp + xpRewards.readArticle
            });
        }
    };

    const updatePreferences = (newPreferences) => {
        if (!user.id) return;
        const updatedPrefs = { ...user.preferences, ...newPreferences };
        updateProfile({ preferences: updatedPrefs });
    };

    const updateLevel = (newLevel) => {
        if (!user.id) return;
        updateProfile({ level: newLevel });
    };

    const updateAvatar = (avatarData) => {
        if (!user.id) return;
        // avatarData can be: string (emoji) or object (gradient avatar with {value, color})
        const avatarValue = typeof avatarData === 'object' ? JSON.stringify(avatarData) : avatarData;
        updateProfile({ avatar_url: avatarValue });
        // Update local state immediately for responsiveness
        setUser(prev => ({ ...prev, avatar: avatarValue }));
    };

    const clearNewBadges = () => {
        setNewBadges([]);
    };

    const changePassword = async (currentPassword, newPassword) => {
        if (!user.email) throw new Error('Kullanıcı e-postası bulunamadı.');

        // Re-authenticate user to verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            throw new Error('Mevcut parola hatalı.');
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            throw updateError;
        }
    };

    const value = {
        user,
        isLoggedIn,
        loading, // Exposed so UI can show spinner
        newBadges,
        login,
        register,
        logout,
        changePassword,
        addXp,
        recordActivity,
        addWord,
        removeWord,
        updateWordPractice,
        completePractice,
        readArticle,
        updatePreferences,
        updateLevel,
        updateAvatar,
        clearNewBadges,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext };
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

export default UserContext;
