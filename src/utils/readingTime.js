/**
 * Reading Time Estimation Utility
 * Calculates estimated reading time based on word count and user level
 */

// Words per minute by proficiency level
const WPM_BY_LEVEL = {
    A1: 80,   // Beginner - slow reading
    A2: 100,  // Elementary
    B1: 130,  // Intermediate
    B2: 160,  // Upper-Intermediate
    C1: 200,  // Advanced
    C2: 250,  // Proficient - native-like speed
};

// Default WPM for unknown levels
const DEFAULT_WPM = 130;

/**
 * Calculate reading time in minutes
 * @param {number} wordCount - Number of words in the content
 * @param {string} userLevel - User's proficiency level (A1-C2)
 * @param {string} contentLevel - Content difficulty level (A1-C2)
 * @returns {number} Estimated reading time in minutes
 */
export function calculateReadingTime(wordCount, userLevel = 'B1', contentLevel = 'B1') {
    if (!wordCount || wordCount <= 0) return 0;
    
    // Get base WPM for user level
    const baseWpm = WPM_BY_LEVEL[userLevel?.toUpperCase()] || DEFAULT_WPM;
    
    // Adjust for content difficulty relative to user level
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const userLevelIndex = levels.indexOf(userLevel?.toUpperCase());
    const contentLevelIndex = levels.indexOf(contentLevel?.toUpperCase());
    
    let adjustedWpm = baseWpm;
    if (userLevelIndex >= 0 && contentLevelIndex >= 0) {
        const levelDiff = contentLevelIndex - userLevelIndex;
        // Harder content = slower reading
        if (levelDiff > 0) {
            adjustedWpm = baseWpm * (1 - levelDiff * 0.1); // 10% slower per level above
        } else if (levelDiff < 0) {
            adjustedWpm = baseWpm * (1 + Math.abs(levelDiff) * 0.05); // 5% faster per level below
        }
    }
    
    // Ensure minimum WPM
    adjustedWpm = Math.max(50, adjustedWpm);
    
    // Calculate time and round up
    const minutes = Math.ceil(wordCount / adjustedWpm);
    
    return minutes;
}

/**
 * Format reading time for display
 * @param {number} minutes - Reading time in minutes
 * @returns {string} Formatted reading time
 */
export function formatReadingTime(minutes) {
    if (minutes <= 0) return '< 1 dk';
    if (minutes < 60) return `${minutes} dk`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours} saat`;
    }
    return `${hours} saat ${remainingMinutes} dk`;
}

/**
 * Get reading time with difficulty indicator
 * @param {number} wordCount - Number of words
 * @param {string} userLevel - User's level
 * @param {string} contentLevel - Content level
 * @returns {Object} Reading time info with difficulty
 */
export function getReadingTimeInfo(wordCount, userLevel = 'B1', contentLevel = 'B1') {
    const minutes = calculateReadingTime(wordCount, userLevel, contentLevel);
    const formatted = formatReadingTime(minutes);
    
    // Determine difficulty relative to user
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const userIdx = levels.indexOf(userLevel?.toUpperCase());
    const contentIdx = levels.indexOf(contentLevel?.toUpperCase());
    
    let difficulty = 'normal';
    let difficultyLabel = 'Orta';
    let difficultyColor = 'text-gray-600 dark:text-gray-400';
    
    if (userIdx >= 0 && contentIdx >= 0) {
        const diff = contentIdx - userIdx;
        if (diff <= -2) {
            difficulty = 'veryEasy';
            difficultyLabel = 'Çok Kolay';
            difficultyColor = 'text-green-500';
        } else if (diff === -1) {
            difficulty = 'easy';
            difficultyLabel = 'Kolay';
            difficultyColor = 'text-emerald-500';
        } else if (diff === 0) {
            difficulty = 'normal';
            difficultyLabel = 'Uygun';
            difficultyColor = 'text-blue-500';
        } else if (diff === 1) {
            difficulty = 'challenging';
            difficultyLabel = 'Zorlu';
            difficultyColor = 'text-orange-500';
        } else if (diff >= 2) {
            difficulty = 'hard';
            difficultyLabel = 'Zor';
            difficultyColor = 'text-red-500';
        }
    }
    
    return {
        minutes,
        formatted,
        difficulty,
        difficultyLabel,
        difficultyColor,
        wordsPerMinute: WPM_BY_LEVEL[userLevel?.toUpperCase()] || DEFAULT_WPM
    };
}

/**
 * Calculate progress based on read words
 * @param {number} wordsRead - Number of words read
 * @param {number} totalWords - Total words in content
 * @returns {Object} Progress info
 */
export function getReadingProgress(wordsRead, totalWords) {
    if (!totalWords || totalWords <= 0) return { percentage: 0, remaining: 0, remainingTime: 0 };
    
    const percentage = Math.min(100, Math.round((wordsRead / totalWords) * 100));
    const remaining = Math.max(0, totalWords - wordsRead);
    const remainingTime = calculateReadingTime(remaining);
    
    return {
        percentage,
        remaining,
        remainingTime,
        formattedRemaining: formatReadingTime(remainingTime),
        isComplete: percentage >= 100
    };
}

/**
 * Estimate pages from word count (assuming 250 words per page)
 * @param {number} wordCount - Total words
 * @returns {number} Estimated page count
 */
export function estimatePages(wordCount) {
    const WORDS_PER_PAGE = 250;
    return Math.ceil(wordCount / WORDS_PER_PAGE);
}

/**
 * Get reading time emoji based on duration
 * @param {number} minutes - Reading time in minutes
 * @returns {string} Emoji representing time
 */
export function getReadingTimeEmoji(minutes) {
    if (minutes <= 5) return '⚡';      // Quick read
    if (minutes <= 15) return '☕';     // Coffee break read
    if (minutes <= 30) return '📖';     // Short article
    if (minutes <= 60) return '📚';     // Long read
    return '📕';                        // Very long content
}

export default {
    calculateReadingTime,
    formatReadingTime,
    getReadingTimeInfo,
    getReadingProgress,
    estimatePages,
    getReadingTimeEmoji
};
