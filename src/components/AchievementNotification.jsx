import { useState, useEffect, useCallback } from 'react';
import { X, Star } from 'lucide-react';
import { getNextNotification, getPendingNotificationCount } from '../utils/achievements';

/**
 * Achievement Notification Component
 * Başarı bildirimlerini gösterir
 */
export default function AchievementNotification() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Bildirim kontrolü
  const checkForNotifications = useCallback(() => {
    const next = getNextNotification();
    if (next) {
      setNotification(next);
      setIsVisible(true);
      setIsExiting(false);
    }
  }, []);

  // Başlangıçta ve periyodik olarak kontrol
  useEffect(() => {
    // İlk kontrol
    const timeout = setTimeout(checkForNotifications, 1000);
    
    // Periyodik kontrol (her 5 saniye)
    const interval = setInterval(() => {
      if (!isVisible) {
        checkForNotifications();
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [checkForNotifications, isVisible]);

  // Otomatik kapanma
  useEffect(() => {
    if (isVisible && notification) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // 5 saniye sonra otomatik kapat
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, notification]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setNotification(null);
      setIsExiting(false);
      // Sonraki bildirimi kontrol et
      setTimeout(checkForNotifications, 500);
    }, 300);
  };

  if (!isVisible || !notification) return null;

  return (
    <div 
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${
        isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-1 shadow-2xl animate-pulse-slow">
        <div className="bg-white dark:bg-[#1a1a1e] rounded-xl p-4 pr-10">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-3xl">{notification.icon}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  🎉 Yeni Başarı!
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notification.description}
              </p>
              {notification.xp > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  <span>+{notification.xp} XP</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Achievement Badge
 * Küçük başarı gösterimi için
 */
export function AchievementBadge({ achievement, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg`}
      title={`${achievement.title}: ${achievement.description}`}
    >
      <span>{achievement.icon}</span>
    </div>
  );
}

/**
 * Achievement Progress Bar
 * Başarı ilerleme çubuğu
 */
export function AchievementProgressBar({ progress }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Başarılar</span>
        <span className="font-bold text-gray-900 dark:text-white">
          {progress.earned}/{progress.total}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {progress.remaining} başarı daha kazanabilirsin
      </p>
    </div>
  );
}
