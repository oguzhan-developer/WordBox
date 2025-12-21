/**
 * notificationService.js - Çalışma hatırlatma bildirimleri
 * Web Notification API kullanarak kullanıcıya hatırlatmalar gönderir
 */

const STORAGE_KEY = 'wordbox-notifications';
const REMINDER_KEY = 'wordbox-reminder-settings';

// Varsayılan ayarlar
const DEFAULT_SETTINGS = {
  enabled: false,
  reminderTime: '10:00', // HH:MM formatında
  dailyGoalReminder: true,
  streakReminder: true,
  wordOfDayReminder: true,
  practiceReminder: true,
  practiceReminderInterval: 4, // saat
  soundEnabled: true,
  lastReminderSent: null,
  permissionGranted: false,
};

/**
 * Bildirim ayarlarını localStorage'dan al
 */
export const getNotificationSettings = () => {
  try {
    const stored = localStorage.getItem(REMINDER_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Bildirim ayarları yüklenemedi:', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Bildirim ayarlarını kaydet
 */
export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify({
      ...getNotificationSettings(),
      ...settings,
    }));
    return true;
  } catch (e) {
    console.error('Bildirim ayarları kaydedilemedi:', e);
    return false;
  }
};

/**
 * Bildirim izni iste
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Bu tarayıcı bildirimleri desteklemiyor.');
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    saveNotificationSettings({ permissionGranted: true });
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    saveNotificationSettings({ permissionGranted: permission === 'granted' });
    return permission;
  } catch (e) {
    console.error('Bildirim izni alınamadı:', e);
    return 'error';
  }
};

/**
 * Bildirim izni durumunu kontrol et
 */
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Bildirim gönder
 */
export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Bildirimler kullanılamıyor.');
    return null;
  }

  const settings = getNotificationSettings();
  
  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'wordbox-notification',
    requireInteraction: false,
    silent: !settings.soundEnabled,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  try {
    const notification = new Notification(title, { ...defaultOptions, ...options });
    
    notification.onclick = (event) => {
      event.preventDefault();
      const url = notification.data?.url || '/';
      window.focus();
      window.location.href = url;
      notification.close();
    };

    // Bildirim geçmişine ekle
    addToNotificationHistory(title, options);
    
    return notification;
  } catch (e) {
    console.error('Bildirim gönderilemedi:', e);
    return null;
  }
};

/**
 * Bildirim geçmişine ekle
 */
const addToNotificationHistory = (title, options) => {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.unshift({
      title,
      body: options.body,
      timestamp: Date.now(),
      type: options.tag || 'general',
    });
    // Son 50 bildirimi tut
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.warn('Bildirim geçmişi kaydedilemedi:', e);
  }
};

/**
 * Bildirim geçmişini al
 */
export const getNotificationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Bildirim geçmişini temizle
 */
export const clearNotificationHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ============================================
// HATIRATMA TİPLERİ
// ============================================

/**
 * Günlük hedef hatırlatması
 */
export const sendDailyGoalReminder = (currentProgress, targetProgress) => {
  const remaining = targetProgress - currentProgress;
  
  if (remaining <= 0) {
    return sendNotification('🎉 Harika İş!', {
      body: 'Bugünkü hedefini tamamladın! Devam et!',
      tag: 'daily-goal-complete',
      data: { url: '/dashboard' },
    });
  }
  
  return sendNotification('📚 Günlük Hedef Hatırlatması', {
    body: `Hedefe ${remaining} kelime kaldı. Şimdi pratik yapmak ister misin?`,
    tag: 'daily-goal-reminder',
    data: { url: '/practice' },
  });
};

/**
 * Streak hatırlatması
 */
export const sendStreakReminder = (currentStreak) => {
  if (currentStreak === 0) {
    return sendNotification('🔥 Yeni Seri Başlat!', {
      body: 'Bugün çalışarak yeni bir seri başlat!',
      tag: 'streak-reminder',
      data: { url: '/practice' },
    });
  }
  
  return sendNotification('🔥 Seriyi Koru!', {
    body: `${currentStreak} günlük serini kaybetme! Bugün pratik yap.`,
    tag: 'streak-reminder',
    data: { url: '/practice' },
  });
};

/**
 * Günün kelimesi hatırlatması
 */
export const sendWordOfDayReminder = (word) => {
  return sendNotification('✨ Günün Kelimesi', {
    body: `Bugünün kelimesi: "${word.word}" - ${word.turkish}`,
    tag: 'wotd-reminder',
    data: { url: '/dashboard' },
  });
};

/**
 * Pratik hatırlatması
 */
export const sendPracticeReminder = () => {
  const messages = [
    { title: '📖 Öğrenme Zamanı!', body: 'Bir kaç dakika pratik yapmak ister misin?' },
    { title: '🧠 Beyin Egzersizi', body: 'Kelime pratiği ile hafızanı güçlendir!' },
    { title: '⏰ Mola Zamanı', body: 'Kısa bir İngilizce pratiği molası ne dersin?' },
    { title: '🎯 Hedefine Yaklaş', body: 'Bugünkü hedefine ulaşmak için pratik yap!' },
    { title: '💪 Hazır mısın?', body: 'Yeni kelimeler öğrenmenin tam zamanı!' },
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return sendNotification(randomMessage.title, {
    body: randomMessage.body,
    tag: 'practice-reminder',
    data: { url: '/practice' },
  });
};

/**
 * Tamamlanmamış pratik hatırlatması
 */
export const sendIncompleteSessionReminder = (practiceType) => {
  return sendNotification('⏸️ Yarım Kalan Pratik', {
    body: `${practiceType} pratiğini tamamlamadın. Devam etmek ister misin?`,
    tag: 'incomplete-session',
    data: { url: '/practice' },
  });
};

/**
 * Başarı bildirimi
 */
export const sendAchievementNotification = (achievement) => {
  return sendNotification('🏆 Yeni Başarı!', {
    body: `"${achievement.name}" rozetini kazandın!`,
    tag: 'achievement',
    data: { url: '/profile' },
  });
};

/**
 * Seviye atlama bildirimi
 */
export const sendLevelUpNotification = (newLevel) => {
  return sendNotification('🎉 Seviye Atladın!', {
    body: `Tebrikler! Artık ${newLevel} seviyesindesin!`,
    tag: 'level-up',
    data: { url: '/profile' },
  });
};

// ============================================
// ZAMANLAYICI SİSTEMİ
// ============================================

let reminderInterval = null;

/**
 * Hatırlatıcı zamanlayıcıyı başlat
 */
export const startReminderScheduler = () => {
  const settings = getNotificationSettings();
  
  if (!settings.enabled || !settings.permissionGranted) {
    return;
  }

  // Her dakika kontrol et
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  reminderInterval = setInterval(() => {
    checkAndSendReminders();
  }, 60000); // 1 dakika

  // İlk kontrolü hemen yap
  checkAndSendReminders();
};

/**
 * Hatırlatıcı zamanlayıcıyı durdur
 */
export const stopReminderScheduler = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
};

/**
 * Hatırlatmaları kontrol et ve gönder
 */
const checkAndSendReminders = () => {
  const settings = getNotificationSettings();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Günlük hatırlatma zamanı kontrolü
  if (settings.dailyGoalReminder && currentTime === settings.reminderTime) {
    const lastSent = settings.lastReminderSent;
    const today = now.toDateString();
    
    if (lastSent !== today) {
      sendPracticeReminder();
      saveNotificationSettings({ lastReminderSent: today });
    }
  }
  
  // Pratik aralığı hatırlatması
  if (settings.practiceReminder) {
    const lastPractice = localStorage.getItem('lastPracticeTime');
    if (lastPractice) {
      const hoursSince = (Date.now() - parseInt(lastPractice)) / (1000 * 60 * 60);
      if (hoursSince >= settings.practiceReminderInterval) {
        sendPracticeReminder();
        localStorage.setItem('lastPracticeTime', Date.now().toString());
      }
    }
  }
};

/**
 * Test bildirimi gönder
 */
export const sendTestNotification = () => {
  return sendNotification('🔔 Test Bildirimi', {
    body: 'Bildirimler düzgün çalışıyor!',
    tag: 'test-notification',
    data: { url: '/settings' },
  });
};

// Hook: React component'lerde kullanmak için
export const useNotifications = () => {
  return {
    settings: getNotificationSettings(),
    saveSettings: saveNotificationSettings,
    requestPermission: requestNotificationPermission,
    checkPermission: checkNotificationPermission,
    sendNotification,
    sendDailyGoalReminder,
    sendStreakReminder,
    sendWordOfDayReminder,
    sendPracticeReminder,
    sendAchievementNotification,
    sendLevelUpNotification,
    sendTestNotification,
    startScheduler: startReminderScheduler,
    stopScheduler: stopReminderScheduler,
    history: getNotificationHistory,
    clearHistory: clearNotificationHistory,
  };
};

export default {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  checkNotificationPermission,
  sendNotification,
  sendDailyGoalReminder,
  sendStreakReminder,
  sendWordOfDayReminder,
  sendPracticeReminder,
  sendAchievementNotification,
  sendLevelUpNotification,
  sendTestNotification,
  startReminderScheduler,
  stopReminderScheduler,
  getNotificationHistory,
  clearNotificationHistory,
};
