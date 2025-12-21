/**
 * Reading Statistics Utility
 * Tracks reading habits and provides analytics
 * Stored in localStorage for persistence
 */

const STORAGE_KEY = 'wordbox_reading_stats';

// Default stats structure
const defaultStats = {
  totalWordsRead: 0,
  totalTimeSpent: 0, // in seconds
  articlesCompleted: 0,
  articlesStarted: 0,
  averageReadingSpeed: 0, // words per minute
  longestSession: 0, // in seconds
  favoriteLevel: 'B1',
  readingHistory: [], // Array of reading sessions
  dailyStats: {}, // { '2025-01-21': { words: 100, time: 300, articles: 2 } }
  achievements: [],
};

// Get today's date string
const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Load stats from localStorage
export const getReadingStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultStats, ...JSON.parse(stored) };
    }
    return defaultStats;
  } catch (e) {
    console.error('Error loading reading stats:', e);
    return defaultStats;
  }
};

// Save stats to localStorage
const saveStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving reading stats:', e);
  }
};

/**
 * Record a reading session
 * @param {Object} session - Reading session data
 * @param {string} session.articleId - Article identifier
 * @param {string} session.articleTitle - Article title
 * @param {string} session.level - Article level (A1-C2)
 * @param {number} session.wordsRead - Number of words read
 * @param {number} session.timeSpent - Time spent reading (seconds)
 * @param {boolean} session.completed - Whether article was completed
 */
export const recordReadingSession = (session) => {
  const stats = getReadingStats();
  const todayKey = getTodayKey();
  
  // Update totals
  stats.totalWordsRead += session.wordsRead || 0;
  stats.totalTimeSpent += session.timeSpent || 0;
  
  if (session.completed) {
    stats.articlesCompleted += 1;
  } else {
    stats.articlesStarted += 1;
  }
  
  // Update longest session
  if (session.timeSpent > stats.longestSession) {
    stats.longestSession = session.timeSpent;
  }
  
  // Calculate average reading speed (words per minute)
  if (stats.totalTimeSpent > 0) {
    stats.averageReadingSpeed = Math.round((stats.totalWordsRead / stats.totalTimeSpent) * 60);
  }
  
  // Add to reading history (keep last 50)
  stats.readingHistory = [
    {
      ...session,
      date: new Date().toISOString(),
    },
    ...stats.readingHistory.slice(0, 49),
  ];
  
  // Update daily stats
  if (!stats.dailyStats[todayKey]) {
    stats.dailyStats[todayKey] = { words: 0, time: 0, articles: 0 };
  }
  stats.dailyStats[todayKey].words += session.wordsRead || 0;
  stats.dailyStats[todayKey].time += session.timeSpent || 0;
  if (session.completed) {
    stats.dailyStats[todayKey].articles += 1;
  }
  
  // Update favorite level based on most read
  const levelCounts = {};
  stats.readingHistory.forEach(h => {
    levelCounts[h.level] = (levelCounts[h.level] || 0) + 1;
  });
  const maxLevel = Object.entries(levelCounts).reduce(
    (max, [level, count]) => count > max.count ? { level, count } : max,
    { level: 'B1', count: 0 }
  );
  stats.favoriteLevel = maxLevel.level;
  
  // Clean up old daily stats (keep last 90 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoffKey = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}-${String(cutoffDate.getDate()).padStart(2, '0')}`;
  Object.keys(stats.dailyStats).forEach(key => {
    if (key < cutoffKey) {
      delete stats.dailyStats[key];
    }
  });
  
  // Check for achievements
  checkAchievements(stats);
  
  saveStats(stats);
  return stats;
};

/**
 * Check and award achievements
 */
const checkAchievements = (stats) => {
  const achievements = [
    { id: 'first_article', name: 'İlk Okuma', condition: () => stats.articlesCompleted >= 1 },
    { id: 'reader_10', name: 'Okuyucu', condition: () => stats.articlesCompleted >= 10 },
    { id: 'reader_50', name: 'Kitap Kurdu', condition: () => stats.articlesCompleted >= 50 },
    { id: 'words_1000', name: '1000 Kelime', condition: () => stats.totalWordsRead >= 1000 },
    { id: 'words_10000', name: '10K Kelime', condition: () => stats.totalWordsRead >= 10000 },
    { id: 'speed_reader', name: 'Hızlı Okuyucu', condition: () => stats.averageReadingSpeed >= 200 },
    { id: 'marathon', name: 'Maraton', condition: () => stats.longestSession >= 1800 }, // 30 min
    { id: 'daily_streak_7', name: 'Haftalık Seri', condition: () => getDailyStreak(stats) >= 7 },
  ];
  
  achievements.forEach(achievement => {
    if (!stats.achievements.includes(achievement.id) && achievement.condition()) {
      stats.achievements.push(achievement.id);
    }
  });
};

/**
 * Calculate current daily reading streak
 */
const getDailyStreak = (stats) => {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    if (stats.dailyStats[key] && stats.dailyStats[key].articles > 0) {
      streak++;
    } else if (i > 0) {
      // Allow missing today, but break streak if any other day is missing
      break;
    }
  }
  
  return streak;
};

/**
 * Get reading streak
 */
export const getReadingStreak = () => {
  const stats = getReadingStats();
  return getDailyStreak(stats);
};

/**
 * Get weekly reading summary
 */
export const getWeeklyReadingSummary = () => {
  const stats = getReadingStats();
  const result = [];
  const today = new Date();
  const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];
  
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const dayData = stats.dailyStats[key] || { words: 0, time: 0, articles: 0 };
    
    result.push({
      date: key,
      day: dayNames[checkDate.getDay()],
      ...dayData,
      isToday: i === 0,
    });
  }
  
  return result;
};

/**
 * Get monthly reading summary
 */
export const getMonthlyReadingSummary = () => {
  const stats = getReadingStats();
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  let totalWords = 0;
  let totalTime = 0;
  let totalArticles = 0;
  let activeDays = 0;
  
  for (let i = 1; i <= daysInMonth; i++) {
    const checkDate = new Date(today.getFullYear(), today.getMonth(), i);
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const dayData = stats.dailyStats[key];
    
    if (dayData) {
      totalWords += dayData.words || 0;
      totalTime += dayData.time || 0;
      totalArticles += dayData.articles || 0;
      if (dayData.articles > 0) activeDays++;
    }
  }
  
  return {
    totalWords,
    totalTime,
    totalArticles,
    activeDays,
    daysInMonth,
  };
};

/**
 * Format time duration for display
 */
export const formatReadingTime = (seconds) => {
  if (seconds < 60) return `${seconds}sn`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}dk`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}sa ${mins}dk`;
};

/**
 * Get today's reading stats
 */
export const getTodayReadingStats = () => {
  const stats = getReadingStats();
  const todayKey = getTodayKey();
  return stats.dailyStats[todayKey] || { words: 0, time: 0, articles: 0 };
};

/**
 * Reset all reading stats (for testing/debugging)
 */
export const resetReadingStats = () => {
  localStorage.removeItem(STORAGE_KEY);
  return defaultStats;
};
