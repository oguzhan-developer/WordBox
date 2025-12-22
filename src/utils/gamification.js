import { badgesData, checkBadgeEarned } from '../data/badges';

// XP required for each level
export const levelThresholds = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1350,   // Level 7
    1750,   // Level 8
    2200,   // Level 9
    2700,   // Level 10
    3250,   // Level 11
    3850,   // Level 12
    4500,   // Level 13
    5200,   // Level 14
    6000,   // Level 15
    6900,   // Level 16
    7900,   // Level 17
    9000,   // Level 18
    10200,  // Level 19
    11500,  // Level 20
    13000,  // Level 21
    14700,  // Level 22
    16600,  // Level 23
    18700,  // Level 24
    21000,  // Level 25
];

// Calculate level from XP
export const calculateLevel = (xp) => {
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (xp >= levelThresholds[i]) {
            return i + 1;
        }
    }
    return 1;
};

// Get XP needed for next level
export const getXpForNextLevel = (xp) => {
    const currentLevel = calculateLevel(xp);
    if (currentLevel >= levelThresholds.length) {
        return 0; // Max level reached
    }
    return levelThresholds[currentLevel] - xp;
};

// Get progress percentage to next level
export const getLevelProgress = (xp) => {
    const currentLevel = calculateLevel(xp);
    if (currentLevel >= levelThresholds.length) {
        return 100;
    }

    const currentLevelXp = levelThresholds[currentLevel - 1];
    const nextLevelXp = levelThresholds[currentLevel];
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

    return Math.min(Math.max(progress, 0), 100);
};

// XP rewards for different actions
export const xpRewards = {
    readArticle: 20,
    completeArticle: 50,
    addWord: 5,
    practiceWord: 2,
    correctAnswer: 10,
    wrongAnswer: 2,
    perfectPractice: 25, // Bonus for 100% accuracy
    streak3Days: 30,
    streak7Days: 75,
    streak14Days: 150,
    streak30Days: 300,
    dailyGoal: 20,
};

// Calculate XP for a practice session
export const calculatePracticeXp = (correctCount, wrongCount, _isComplete = true) => {
    let xp = 0;

    // XP for correct answers
    xp += correctCount * xpRewards.correctAnswer;

    // XP for wrong answers (participation credit)
    xp += wrongCount * xpRewards.wrongAnswer;

    // Bonus for perfect practice
    if (wrongCount === 0 && correctCount > 0) {
        xp += xpRewards.perfectPractice;
    }

    return xp;
};

// Check if user is on a streak
export const checkStreak = (lastPracticeDate) => {
    if (!lastPracticeDate) return false;

    const last = new Date(lastPracticeDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const diffTime = today - last;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Streak continues if practiced yesterday or today
    return diffDays <= 1;
};

// Update streak count
export const updateStreak = (currentStreak, lastPracticeDate) => {
    if (!lastPracticeDate) {
        return 1;
    }

    const last = new Date(lastPracticeDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const diffTime = today - last;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
        // Same day, no streak change
        return currentStreak;
    } else if (diffDays === 1) {
        // Consecutive day, increment streak
        return currentStreak + 1;
    } else {
        // Streak broken, start fresh
        return 1;
    }
};

// Check for newly earned badges
export const checkNewBadges = (userStats, earnedBadgeIds = []) => {
    const newBadges = [];

    badgesData.forEach(badge => {
        // Skip already earned badges
        if (earnedBadgeIds.includes(badge.id)) return;

        // Check if badge is now earned
        if (checkBadgeEarned(badge, userStats)) {
            newBadges.push(badge);
        }
    });

    return newBadges;
};

// Format XP number with commas
export const formatXp = (xp) => {
    return xp.toLocaleString();
};

// Get level title
export const getLevelTitle = (level) => {
    if (level >= 20) return "Vocabulary Master";
    if (level >= 15) return "Word Expert";
    if (level >= 10) return "Language Learner";
    if (level >= 5) return "Word Explorer";
    return "Beginner";
};

// Calculate daily goal progress
export const calculateDailyProgress = (wordsToday, dailyGoal = 20) => {
    return Math.min((wordsToday / dailyGoal) * 100, 100);
};
