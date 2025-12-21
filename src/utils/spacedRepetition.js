/**
 * Spaced Repetition System (SRS) Utility
 * Implements a simplified SM-2 algorithm for optimal vocabulary learning
 * 
 * Box System:
 * - Box 1: New words - review today
 * - Box 2: Review after 1 day
 * - Box 3: Review after 3 days
 * - Box 4: Review after 7 days
 * - Box 5: Review after 14 days
 * - Box 6: Mastered - review after 30 days
 */

const STORAGE_KEY = 'wordbox_srs_data';

// Box intervals in days
const BOX_INTERVALS = {
  1: 0,   // Today
  2: 1,   // Tomorrow
  3: 3,   // 3 days
  4: 7,   // 1 week
  5: 14,  // 2 weeks
  6: 30,  // 1 month (mastered)
};

// Box labels for UI
export const BOX_LABELS = {
  1: 'Yeni',
  2: '1 Gün',
  3: '3 Gün',
  4: '1 Hafta',
  5: '2 Hafta',
  6: 'Uzman',
};

// Box colors for UI
export const BOX_COLORS = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-indigo-500',
  6: 'bg-green-500',
};

/**
 * Get SRS data from localStorage
 */
export const getSrsData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Save SRS data to localStorage
 */
const saveSrsData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving SRS data:', e);
  }
};

/**
 * Initialize or get SRS entry for a word
 * @param {string} wordId - Unique word identifier
 */
export const initWordSrs = (wordId) => {
  const data = getSrsData();
  
  if (!data[wordId]) {
    data[wordId] = {
      box: 1,
      lastReview: null,
      nextReview: new Date().toISOString().split('T')[0],
      reviewCount: 0,
      correctCount: 0,
      streak: 0,
    };
    saveSrsData(data);
  }
  
  return data[wordId];
};

/**
 * Record a review result for a word
 * @param {string} wordId - Unique word identifier
 * @param {boolean} correct - Whether the answer was correct
 */
export const recordReview = (wordId, correct) => {
  const data = getSrsData();
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize if not exists
  if (!data[wordId]) {
    data[wordId] = {
      box: 1,
      lastReview: null,
      nextReview: today,
      reviewCount: 0,
      correctCount: 0,
      streak: 0,
    };
  }
  
  const entry = data[wordId];
  entry.reviewCount += 1;
  entry.lastReview = today;
  
  if (correct) {
    entry.correctCount += 1;
    entry.streak += 1;
    
    // Move to next box (max 6)
    entry.box = Math.min(6, entry.box + 1);
  } else {
    entry.streak = 0;
    
    // Move back to box 1 or 2 based on current progress
    entry.box = entry.box > 3 ? 2 : 1;
  }
  
  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + BOX_INTERVALS[entry.box]);
  entry.nextReview = nextDate.toISOString().split('T')[0];
  
  saveSrsData(data);
  return entry;
};

/**
 * Get words that are due for review today
 * @param {Array} vocabulary - User's vocabulary list
 */
export const getDueWords = (vocabulary) => {
  const data = getSrsData();
  const today = new Date().toISOString().split('T')[0];
  
  return vocabulary.filter(word => {
    const wordId = word.id || word.word;
    const entry = data[wordId];
    
    // New words without SRS entry
    if (!entry) return true;
    
    // Check if due for review
    return entry.nextReview <= today;
  }).map(word => ({
    ...word,
    srs: data[word.id || word.word] || { box: 1, streak: 0 },
  }));
};

/**
 * Get words by box number
 * @param {Array} vocabulary - User's vocabulary list
 * @param {number} box - Box number (1-6)
 */
export const getWordsByBox = (vocabulary, box) => {
  const data = getSrsData();
  
  return vocabulary.filter(word => {
    const wordId = word.id || word.word;
    const entry = data[wordId];
    
    if (!entry && box === 1) return true;
    return entry?.box === box;
  });
};

/**
 * Get SRS statistics
 * @param {Array} vocabulary - User's vocabulary list
 */
export const getSrsStats = (vocabulary) => {
  const data = getSrsData();
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    total: vocabulary.length,
    dueToday: 0,
    boxes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    mastered: 0,
    averageAccuracy: 0,
    longestStreak: 0,
  };
  
  let totalReviews = 0;
  let totalCorrect = 0;
  
  vocabulary.forEach(word => {
    const wordId = word.id || word.word;
    const entry = data[wordId];
    
    if (!entry) {
      stats.boxes[1] += 1;
      stats.dueToday += 1;
      return;
    }
    
    stats.boxes[entry.box] += 1;
    
    if (entry.box === 6) {
      stats.mastered += 1;
    }
    
    if (entry.nextReview <= today) {
      stats.dueToday += 1;
    }
    
    totalReviews += entry.reviewCount;
    totalCorrect += entry.correctCount;
    
    if (entry.streak > stats.longestStreak) {
      stats.longestStreak = entry.streak;
    }
  });
  
  stats.averageAccuracy = totalReviews > 0 
    ? Math.round((totalCorrect / totalReviews) * 100) 
    : 0;
  
  return stats;
};

/**
 * Get word's SRS info with human-readable labels
 * @param {string} wordId - Unique word identifier
 */
export const getWordSrsInfo = (wordId) => {
  const data = getSrsData();
  const entry = data[wordId];
  
  if (!entry) {
    return {
      box: 1,
      boxLabel: BOX_LABELS[1],
      boxColor: BOX_COLORS[1],
      streak: 0,
      nextReview: 'Bugün',
      accuracy: 0,
    };
  }
  
  const today = new Date();
  const nextDate = new Date(entry.nextReview);
  const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  
  let nextReviewLabel = 'Bugün';
  if (diffDays === 1) nextReviewLabel = 'Yarın';
  else if (diffDays > 1) nextReviewLabel = `${diffDays} gün sonra`;
  else if (diffDays < 0) nextReviewLabel = 'Bugün';
  
  return {
    box: entry.box,
    boxLabel: BOX_LABELS[entry.box],
    boxColor: BOX_COLORS[entry.box],
    streak: entry.streak,
    nextReview: nextReviewLabel,
    accuracy: entry.reviewCount > 0 
      ? Math.round((entry.correctCount / entry.reviewCount) * 100) 
      : 0,
    reviewCount: entry.reviewCount,
  };
};

/**
 * Reset SRS data for a word
 * @param {string} wordId - Unique word identifier
 */
export const resetWordSrs = (wordId) => {
  const data = getSrsData();
  delete data[wordId];
  saveSrsData(data);
};

/**
 * Reset all SRS data
 */
export const resetAllSrs = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get recommended study order based on SRS
 * Prioritizes: due words, lower boxes, longer time since review
 * @param {Array} vocabulary - User's vocabulary list
 * @param {number} limit - Maximum words to return
 */
export const getStudyQueue = (vocabulary, limit = 20) => {
  const dueWords = getDueWords(vocabulary);
  
  // Sort by: box number (ascending), then by last review (oldest first)
  return dueWords
    .sort((a, b) => {
      // First by box (lower boxes = more urgent)
      if (a.srs.box !== b.srs.box) {
        return a.srs.box - b.srs.box;
      }
      // Then by last review date (older first)
      const aDate = a.srs.lastReview || '1970-01-01';
      const bDate = b.srs.lastReview || '1970-01-01';
      return aDate.localeCompare(bDate);
    })
    .slice(0, limit);
};
