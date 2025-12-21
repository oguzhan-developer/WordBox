/**
 * Study Goals Utility
 * Günlük ve haftalık çalışma hedefleri yönetimi
 */

const STORAGE_KEY = 'wordbox_study_goals';

// Varsayılan hedefler
const DEFAULT_GOALS = {
  daily: {
    wordsToLearn: 10,
    practiceMinutes: 15,
    articlesToRead: 1,
    reviewWords: 20
  },
  weekly: {
    wordsToLearn: 50,
    practiceMinutes: 90,
    articlesToRead: 5,
    perfectPractice: 3 // 100% başarı oranı
  }
};

/**
 * Storage'dan goals verisini al
 */
const getGoalsData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initializeGoals();
  } catch (error) {
    console.error('Goals verisi okunamadı:', error);
    return initializeGoals();
  }
};

/**
 * Goals verisini storage'a kaydet
 */
const saveGoalsData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Goals verisi kaydedilemedi:', error);
  }
};

/**
 * Goals verisini başlat
 */
const initializeGoals = () => {
  const today = new Date().toDateString();
  const weekStart = getWeekStart();
  
  return {
    goals: { ...DEFAULT_GOALS },
    dailyProgress: {
      date: today,
      wordsLearned: 0,
      practiceMinutes: 0,
      articlesRead: 0,
      reviewsCompleted: 0
    },
    weeklyProgress: {
      weekStart,
      wordsLearned: 0,
      practiceMinutes: 0,
      articlesRead: 0,
      perfectPractices: 0
    },
    history: [],
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
      goalCompletionDays: []
    }
  };
};

/**
 * Hafta başlangıcını al (Pazartesi)
 */
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toDateString();
};

/**
 * Günlük/haftalık progress'i kontrol et ve sıfırla
 */
const checkAndResetProgress = (data) => {
  const today = new Date().toDateString();
  const currentWeekStart = getWeekStart();
  
  // Günlük reset
  if (data.dailyProgress.date !== today) {
    // Önceki günü history'e ekle
    if (data.dailyProgress.date) {
      data.history.push({
        date: data.dailyProgress.date,
        ...data.dailyProgress,
        goalsCompleted: calculateDailyCompletion(data)
      });
      
      // History'yi son 30 gün ile sınırla
      if (data.history.length > 30) {
        data.history = data.history.slice(-30);
      }
    }
    
    // Streak hesapla
    const completion = calculateDailyCompletion(data);
    if (completion >= 100) {
      data.streaks.currentStreak++;
      data.streaks.goalCompletionDays.push(data.dailyProgress.date);
      if (data.streaks.currentStreak > data.streaks.longestStreak) {
        data.streaks.longestStreak = data.streaks.currentStreak;
      }
    } else if (completion < 50) {
      // %50'den az tamamlandıysa streak sıfırla
      data.streaks.currentStreak = 0;
    }
    
    data.dailyProgress = {
      date: today,
      wordsLearned: 0,
      practiceMinutes: 0,
      articlesRead: 0,
      reviewsCompleted: 0
    };
  }
  
  // Haftalık reset
  if (data.weeklyProgress.weekStart !== currentWeekStart) {
    data.weeklyProgress = {
      weekStart: currentWeekStart,
      wordsLearned: 0,
      practiceMinutes: 0,
      articlesRead: 0,
      perfectPractices: 0
    };
  }
  
  return data;
};

/**
 * Günlük hedef tamamlama yüzdesini hesapla
 */
const calculateDailyCompletion = (data) => {
  const { dailyProgress, goals } = data;
  const dailyGoals = goals.daily;
  
  const completion = [
    Math.min(100, (dailyProgress.wordsLearned / dailyGoals.wordsToLearn) * 100),
    Math.min(100, (dailyProgress.practiceMinutes / dailyGoals.practiceMinutes) * 100),
    Math.min(100, (dailyProgress.articlesRead / dailyGoals.articlesToRead) * 100),
    Math.min(100, (dailyProgress.reviewsCompleted / dailyGoals.reviewWords) * 100)
  ];
  
  return Math.round(completion.reduce((a, b) => a + b, 0) / completion.length);
};

/**
 * Haftalık hedef tamamlama yüzdesini hesapla
 */
const calculateWeeklyCompletion = (data) => {
  const { weeklyProgress, goals } = data;
  const weeklyGoals = goals.weekly;
  
  const completion = [
    Math.min(100, (weeklyProgress.wordsLearned / weeklyGoals.wordsToLearn) * 100),
    Math.min(100, (weeklyProgress.practiceMinutes / weeklyGoals.practiceMinutes) * 100),
    Math.min(100, (weeklyProgress.articlesRead / weeklyGoals.articlesToRead) * 100),
    Math.min(100, (weeklyProgress.perfectPractices / weeklyGoals.perfectPractice) * 100)
  ];
  
  return Math.round(completion.reduce((a, b) => a + b, 0) / completion.length);
};

/**
 * Kelime öğrenildiğinde kaydet
 * @param {number} count - Öğrenilen kelime sayısı
 */
export const recordWordsLearned = (count = 1) => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  data.dailyProgress.wordsLearned += count;
  data.weeklyProgress.wordsLearned += count;
  
  saveGoalsData(data);
};

/**
 * Practice süresi kaydet
 * @param {number} minutes - Dakika cinsinden süre
 */
export const recordPracticeTime = (minutes) => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  data.dailyProgress.practiceMinutes += minutes;
  data.weeklyProgress.practiceMinutes += minutes;
  
  saveGoalsData(data);
};

/**
 * Makale okunduğunda kaydet
 */
export const recordArticleRead = () => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  data.dailyProgress.articlesRead += 1;
  data.weeklyProgress.articlesRead += 1;
  
  saveGoalsData(data);
};

/**
 * Review tamamlandığında kaydet
 * @param {number} count - Tamamlanan review sayısı
 */
export const recordReviewsCompleted = (count = 1) => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  data.dailyProgress.reviewsCompleted += count;
  
  saveGoalsData(data);
};

/**
 * Perfect practice kaydet (100% başarı)
 */
export const recordPerfectPractice = () => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  data.weeklyProgress.perfectPractices += 1;
  
  saveGoalsData(data);
};

/**
 * Hedefleri güncelle
 * @param {Object} newGoals - Yeni hedefler
 */
export const updateGoals = (newGoals) => {
  let data = getGoalsData();
  
  data.goals = {
    daily: { ...data.goals.daily, ...newGoals.daily },
    weekly: { ...data.goals.weekly, ...newGoals.weekly }
  };
  
  saveGoalsData(data);
};

/**
 * Günlük hedef durumunu getir
 */
export const getDailyGoalStatus = () => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  saveGoalsData(data);
  
  const { dailyProgress, goals } = data;
  const dailyGoals = goals.daily;
  
  return {
    goals: dailyGoals,
    progress: dailyProgress,
    completion: calculateDailyCompletion(data),
    items: [
      {
        id: 'wordsToLearn',
        label: 'Kelime Öğren',
        icon: '📚',
        current: dailyProgress.wordsLearned,
        target: dailyGoals.wordsToLearn,
        percentage: Math.min(100, Math.round((dailyProgress.wordsLearned / dailyGoals.wordsToLearn) * 100))
      },
      {
        id: 'practiceMinutes',
        label: 'Practice Süresi',
        icon: '⏱️',
        current: dailyProgress.practiceMinutes,
        target: dailyGoals.practiceMinutes,
        unit: 'dk',
        percentage: Math.min(100, Math.round((dailyProgress.practiceMinutes / dailyGoals.practiceMinutes) * 100))
      },
      {
        id: 'articlesToRead',
        label: 'Makale Oku',
        icon: '📖',
        current: dailyProgress.articlesRead,
        target: dailyGoals.articlesToRead,
        percentage: Math.min(100, Math.round((dailyProgress.articlesRead / dailyGoals.articlesToRead) * 100))
      },
      {
        id: 'reviewWords',
        label: 'Kelime Tekrar',
        icon: '🔄',
        current: dailyProgress.reviewsCompleted,
        target: dailyGoals.reviewWords,
        percentage: Math.min(100, Math.round((dailyProgress.reviewsCompleted / dailyGoals.reviewWords) * 100))
      }
    ]
  };
};

/**
 * Haftalık hedef durumunu getir
 */
export const getWeeklyGoalStatus = () => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  saveGoalsData(data);
  
  const { weeklyProgress, goals } = data;
  const weeklyGoals = goals.weekly;
  
  return {
    goals: weeklyGoals,
    progress: weeklyProgress,
    completion: calculateWeeklyCompletion(data),
    items: [
      {
        id: 'wordsToLearn',
        label: 'Kelime Öğren',
        icon: '📚',
        current: weeklyProgress.wordsLearned,
        target: weeklyGoals.wordsToLearn,
        percentage: Math.min(100, Math.round((weeklyProgress.wordsLearned / weeklyGoals.wordsToLearn) * 100))
      },
      {
        id: 'practiceMinutes',
        label: 'Practice Süresi',
        icon: '⏱️',
        current: weeklyProgress.practiceMinutes,
        target: weeklyGoals.practiceMinutes,
        unit: 'dk',
        percentage: Math.min(100, Math.round((weeklyProgress.practiceMinutes / weeklyGoals.practiceMinutes) * 100))
      },
      {
        id: 'articlesToRead',
        label: 'Makale Oku',
        icon: '📖',
        current: weeklyProgress.articlesRead,
        target: weeklyGoals.articlesToRead,
        percentage: Math.min(100, Math.round((weeklyProgress.articlesRead / weeklyGoals.articlesToRead) * 100))
      },
      {
        id: 'perfectPractice',
        label: 'Perfect Practice',
        icon: '🏆',
        current: weeklyProgress.perfectPractices,
        target: weeklyGoals.perfectPractice,
        percentage: Math.min(100, Math.round((weeklyProgress.perfectPractices / weeklyGoals.perfectPractice) * 100))
      }
    ]
  };
};

/**
 * Streak bilgisini getir
 */
export const getStreakInfo = () => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  return {
    currentStreak: data.streaks.currentStreak,
    longestStreak: data.streaks.longestStreak,
    todayCompletion: calculateDailyCompletion(data)
  };
};

/**
 * Geçmiş verileri getir
 */
export const getGoalHistory = () => {
  const data = getGoalsData();
  return data.history;
};

/**
 * Motivasyon mesajı getir
 */
export const getMotivationMessage = () => {
  let data = getGoalsData();
  data = checkAndResetProgress(data);
  
  const completion = calculateDailyCompletion(data);
  const streak = data.streaks.currentStreak;
  
  if (completion >= 100) {
    return { emoji: '🎉', message: 'Bugünkü hedeflerini tamamladın! Harikasın!' };
  } else if (completion >= 75) {
    return { emoji: '🔥', message: 'Neredeyse tamam! Biraz daha gayret!' };
  } else if (completion >= 50) {
    return { emoji: '💪', message: 'Yarısını geçtin, devam et!' };
  } else if (completion >= 25) {
    return { emoji: '🌱', message: 'Güzel başlangıç! Hedefine doğru ilerle!' };
  } else if (streak > 0) {
    return { emoji: '⚡', message: `${streak} günlük serin var! Bugün de devam et!` };
  } else {
    return { emoji: '📚', message: 'Yeni bir gün, yeni fırsatlar! Hadi başla!' };
  }
};
