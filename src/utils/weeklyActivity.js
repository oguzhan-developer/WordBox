// Weekly Activity Tracking Utility
// Stores daily word counts in localStorage for the last 7 days

const STORAGE_KEY = 'wordbox_weekly_activity';

// Get the start of today (midnight)
const getToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
};

// Get array of last 7 days (YYYY-MM-DD format)
const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
};

// Get day abbreviation in Turkish
export const getDayAbbreviation = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];
    return days[date.getDay()];
};

// Get stored activity data
export const getWeeklyActivity = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        
        const last7Days = getLast7Days();
        const today = getToday();
        
        // Build activity array for last 7 days
        return last7Days.map(dateStr => ({
            date: dateStr,
            day: getDayAbbreviation(dateStr),
            words: data[dateStr] || 0,
            isToday: dateStr === today
        }));
    } catch (error) {
        console.error('Error reading weekly activity:', error);
        return getLast7Days().map(dateStr => ({
            date: dateStr,
            day: getDayAbbreviation(dateStr),
            words: 0,
            isToday: dateStr === getToday()
        }));
    }
};

// Record words for today
export const recordDailyWords = (wordCount) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        
        const today = getToday();
        data[today] = (data[today] || 0) + wordCount;
        
        // Clean up old data (keep only last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
        
        Object.keys(data).forEach(dateKey => {
            if (dateKey < cutoffDate) {
                delete data[dateKey];
            }
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data[today];
    } catch (error) {
        console.error('Error recording daily words:', error);
        return 0;
    }
};

// Set today's word count (absolute, not additive)
export const setTodayWords = (wordCount) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        
        const today = getToday();
        data[today] = wordCount;
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return wordCount;
    } catch (error) {
        console.error('Error setting today words:', error);
        return 0;
    }
};

// Get today's word count
export const getTodayWords = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        const today = getToday();
        return data[today] || 0;
    } catch (error) {
        console.error('Error getting today words:', error);
        return 0;
    }
};

// Get weekly total
export const getWeeklyTotal = () => {
    const activity = getWeeklyActivity();
    return activity.reduce((sum, day) => sum + day.words, 0);
};

// Get best day this week
export const getBestDayThisWeek = () => {
    const activity = getWeeklyActivity();
    return Math.max(...activity.map(d => d.words));
};

// Check if there's any activity this week
export const hasActivityThisWeek = () => {
    const activity = getWeeklyActivity();
    return activity.some(d => d.words > 0);
};

export default {
    getWeeklyActivity,
    recordDailyWords,
    setTodayWords,
    getTodayWords,
    getWeeklyTotal,
    getBestDayThisWeek,
    hasActivityThisWeek,
    getDayAbbreviation
};
