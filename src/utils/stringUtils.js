/**
 * String manipulation and comparison utilities
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo tolerance in answer validation
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance between strings
 */
export const levenshteinDistance = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
            }
        }
    }
    return dp[m][n];
};

/**
 * Check if answer is approximately correct (typo tolerance)
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Expected correct answer
 * @param {number} maxDistance - Maximum allowed edit distance (default: 1)
 * @returns {boolean} - Whether the answer is approximately correct
 */
export const isApproximateMatch = (userAnswer, correctAnswer, maxDistance = 1) => {
    const normalized1 = userAnswer.toLowerCase().trim();
    const normalized2 = correctAnswer.toLowerCase().trim();
    
    // Exact match
    if (normalized1 === normalized2) return true;
    
    // Typo tolerance for longer words
    if (normalized1.length > 4 && normalized2.length > 4) {
        return levenshteinDistance(normalized1, normalized2) <= maxDistance;
    }
    
    return false;
};

/**
 * Normalize text for comparison
 * @param {string} text - Input text
 * @returns {string} - Normalized text
 */
export const normalizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase().trim();
};
