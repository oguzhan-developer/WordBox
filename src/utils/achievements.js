/**
 * Achievement Notifications Utility
 * Rozet ve başarı bildirimleri yönetimi
 */

const STORAGE_KEY = 'wordbox_achievement_queue';

// Başarı türleri ve mesajları
export const ACHIEVEMENTS = {
  // Kelime başarıları
  first_word: {
    id: 'first_word',
    title: 'İlk Adım!',
    description: 'İlk kelimeni öğrendin',
    icon: '🌱',
    xp: 10
  },
  words_10: {
    id: 'words_10',
    title: 'Başlangıç',
    description: '10 kelime öğrendin',
    icon: '📗',
    xp: 25
  },
  words_50: {
    id: 'words_50',
    title: 'Koleksiyoncu',
    description: '50 kelime öğrendin',
    icon: '📚',
    xp: 50
  },
  words_100: {
    id: 'words_100',
    title: 'Kelime Ustası',
    description: '100 kelime öğrendin',
    icon: '🎓',
    xp: 100
  },
  words_500: {
    id: 'words_500',
    title: 'Sözlük',
    description: '500 kelime öğrendin',
    icon: '📖',
    xp: 250
  },
  
  // Streak başarıları
  streak_3: {
    id: 'streak_3',
    title: 'Üç Günlük',
    description: '3 gün üst üste çalıştın',
    icon: '🔥',
    xp: 15
  },
  streak_7: {
    id: 'streak_7',
    title: 'Haftalık Seri',
    description: '7 gün üst üste çalıştın',
    icon: '💪',
    xp: 50
  },
  streak_30: {
    id: 'streak_30',
    title: 'Aylık Seri',
    description: '30 gün üst üste çalıştın',
    icon: '🏆',
    xp: 200
  },
  
  // Practice başarıları
  first_practice: {
    id: 'first_practice',
    title: 'Pratikçi',
    description: 'İlk pratik oturumunu tamamladın',
    icon: '✨',
    xp: 15
  },
  perfect_practice: {
    id: 'perfect_practice',
    title: 'Mükemmel!',
    description: 'Hiç hata yapmadan pratik tamamladın',
    icon: '💯',
    xp: 30
  },
  practice_10: {
    id: 'practice_10',
    title: 'Pratik Sever',
    description: '10 pratik oturumu tamamladın',
    icon: '🎯',
    xp: 50
  },
  
  // Okuma başarıları
  first_article: {
    id: 'first_article',
    title: 'Okuyucu',
    description: 'İlk makaleyi tamamladın',
    icon: '📰',
    xp: 20
  },
  articles_10: {
    id: 'articles_10',
    title: 'Kitap Kurdu',
    description: '10 makale okudun',
    icon: '📚',
    xp: 75
  },
  
  // XP başarıları
  xp_100: {
    id: 'xp_100',
    title: 'Yüzlük',
    description: '100 XP kazandın',
    icon: '⭐',
    xp: 10
  },
  xp_500: {
    id: 'xp_500',
    title: 'Beş Yüzlük',
    description: '500 XP kazandın',
    icon: '🌟',
    xp: 25
  },
  xp_1000: {
    id: 'xp_1000',
    title: 'Binlik',
    description: '1000 XP kazandın',
    icon: '💫',
    xp: 50
  },
  
  // Seviye başarıları
  level_a2: {
    id: 'level_a2',
    title: 'A2 Seviyesi',
    description: 'A2 seviyesine ulaştın',
    icon: '📈',
    xp: 100
  },
  level_b1: {
    id: 'level_b1',
    title: 'B1 Seviyesi',
    description: 'B1 seviyesine ulaştın',
    icon: '🚀',
    xp: 150
  },
  level_b2: {
    id: 'level_b2',
    title: 'B2 Seviyesi',
    description: 'B2 seviyesine ulaştın',
    icon: '🎖️',
    xp: 200
  }
};

/**
 * Kazanılmış başarıları getir
 */
const getEarnedAchievements = () => {
  try {
    const data = localStorage.getItem('wordbox_earned_achievements');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Kazanılmış başarıları kaydet
 */
const saveEarnedAchievements = (achievements) => {
  localStorage.setItem('wordbox_earned_achievements', JSON.stringify(achievements));
};

/**
 * Bildirim kuyruğunu getir
 */
const getNotificationQueue = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Bildirim kuyruğunu kaydet
 */
const saveNotificationQueue = (queue) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

/**
 * Başarı kontrolü ve bildirim ekle
 * @param {string} achievementId - Başarı ID
 * @returns {Object|null} - Kazanılan başarı veya null
 */
export const checkAndAwardAchievement = (achievementId) => {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return null;
  
  const earned = getEarnedAchievements();
  if (earned.includes(achievementId)) return null; // Zaten kazanılmış
  
  // Başarıyı kazanıldı olarak işaretle
  earned.push(achievementId);
  saveEarnedAchievements(earned);
  
  // Bildirim kuyruğuna ekle
  const queue = getNotificationQueue();
  queue.push({
    ...achievement,
    earnedAt: new Date().toISOString()
  });
  saveNotificationQueue(queue);
  
  return achievement;
};

/**
 * Bekleyen bildirimi al (FIFO)
 * @returns {Object|null} - Bildirim veya null
 */
export const getNextNotification = () => {
  const queue = getNotificationQueue();
  if (queue.length === 0) return null;
  
  const next = queue.shift();
  saveNotificationQueue(queue);
  return next;
};

/**
 * Bekleyen bildirim sayısını getir
 */
export const getPendingNotificationCount = () => {
  return getNotificationQueue().length;
};

/**
 * Tüm bekleyen bildirimleri temizle
 */
export const clearAllNotifications = () => {
  saveNotificationQueue([]);
};

/**
 * Başarı kazanıldı mı kontrol et
 * @param {string} achievementId - Başarı ID
 * @returns {boolean}
 */
export const isAchievementEarned = (achievementId) => {
  return getEarnedAchievements().includes(achievementId);
};

/**
 * Kazanılmış tüm başarıları getir
 * @returns {Array}
 */
export const getAllEarnedAchievements = () => {
  const earned = getEarnedAchievements();
  return earned.map(id => ACHIEVEMENTS[id]).filter(Boolean);
};

/**
 * Belirli metriklere göre başarı kontrolü
 * @param {Object} metrics - Kullanıcı metrikleri
 */
export const checkAchievementsForMetrics = (metrics) => {
  const newAchievements = [];
  
  // Kelime sayısı kontrolü
  if (metrics.wordsLearned >= 1) {
    const a = checkAndAwardAchievement('first_word');
    if (a) newAchievements.push(a);
  }
  if (metrics.wordsLearned >= 10) {
    const a = checkAndAwardAchievement('words_10');
    if (a) newAchievements.push(a);
  }
  if (metrics.wordsLearned >= 50) {
    const a = checkAndAwardAchievement('words_50');
    if (a) newAchievements.push(a);
  }
  if (metrics.wordsLearned >= 100) {
    const a = checkAndAwardAchievement('words_100');
    if (a) newAchievements.push(a);
  }
  if (metrics.wordsLearned >= 500) {
    const a = checkAndAwardAchievement('words_500');
    if (a) newAchievements.push(a);
  }
  
  // Streak kontrolü
  if (metrics.streak >= 3) {
    const a = checkAndAwardAchievement('streak_3');
    if (a) newAchievements.push(a);
  }
  if (metrics.streak >= 7) {
    const a = checkAndAwardAchievement('streak_7');
    if (a) newAchievements.push(a);
  }
  if (metrics.streak >= 30) {
    const a = checkAndAwardAchievement('streak_30');
    if (a) newAchievements.push(a);
  }
  
  // XP kontrolü
  if (metrics.xp >= 100) {
    const a = checkAndAwardAchievement('xp_100');
    if (a) newAchievements.push(a);
  }
  if (metrics.xp >= 500) {
    const a = checkAndAwardAchievement('xp_500');
    if (a) newAchievements.push(a);
  }
  if (metrics.xp >= 1000) {
    const a = checkAndAwardAchievement('xp_1000');
    if (a) newAchievements.push(a);
  }
  
  // Makale kontrolü
  if (metrics.articlesRead >= 1) {
    const a = checkAndAwardAchievement('first_article');
    if (a) newAchievements.push(a);
  }
  if (metrics.articlesRead >= 10) {
    const a = checkAndAwardAchievement('articles_10');
    if (a) newAchievements.push(a);
  }
  
  // Practice kontrolü
  if (metrics.practiceCompleted >= 1) {
    const a = checkAndAwardAchievement('first_practice');
    if (a) newAchievements.push(a);
  }
  if (metrics.practiceCompleted >= 10) {
    const a = checkAndAwardAchievement('practice_10');
    if (a) newAchievements.push(a);
  }
  
  return newAchievements;
};

/**
 * Perfect practice başarısı ver
 */
export const awardPerfectPractice = () => {
  return checkAndAwardAchievement('perfect_practice');
};

/**
 * Başarı ilerleme durumu
 * @returns {Object}
 */
export const getAchievementProgress = () => {
  const earned = getEarnedAchievements();
  const total = Object.keys(ACHIEVEMENTS).length;
  
  return {
    earned: earned.length,
    total,
    percentage: Math.round((earned.length / total) * 100),
    remaining: total - earned.length
  };
};
