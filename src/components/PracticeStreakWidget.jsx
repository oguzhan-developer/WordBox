/**
 * PracticeStreakWidget - Pratik serisi widget'ı
 * Dashboard'da kullanıcının çalışma serisini görselleştirir
 */

import { useMemo, useState } from 'react';
import { getStreakInfo, getDailyGoalStatus } from '../utils/studyGoals';
import { getWotdStreak } from '../utils/wordOfTheDay';
import { getReadingStreak } from '../utils/readingStats';

// Streak milestone'ları
const STREAK_MILESTONES = [
  { days: 7, emoji: '🔥', title: 'Haftalık Seri', reward: 50 },
  { days: 14, emoji: '⚡', title: 'İki Hafta', reward: 100 },
  { days: 30, emoji: '🌟', title: 'Aylık Seri', reward: 200 },
  { days: 60, emoji: '💎', title: 'İki Aylık', reward: 400 },
  { days: 100, emoji: '👑', title: '100 Gün', reward: 1000 },
  { days: 365, emoji: '🏆', title: 'Yıllık Seri', reward: 5000 },
];

// Streak motivasyon mesajları
const STREAK_MESSAGES = {
  0: { text: 'Bugün çalışmaya başla!', color: 'text-gray-500' },
  1: { text: 'Harika başlangıç! Devam et!', color: 'text-secondary' },
  3: { text: '3 gün seri! Momentum kazanıyorsun!', color: 'text-secondary-600' },
  7: { text: 'Bir hafta! 🔥 Muhteşemsin!', color: 'text-warning' },
  14: { text: '2 hafta! ⚡ Durdurulamıyorsun!', color: 'text-warning-600' },
  30: { text: '1 ay! 🌟 Efsanesin!', color: 'text-accent' },
  60: { text: '2 ay! 💎 İnanılmaz!', color: 'text-purple' },
  100: { text: '100 gün! 👑 Efsane!', color: 'text-danger' },
};

/**
 * Streak mesajını al
 */
const getStreakMessage = (streak) => {
  const thresholds = Object.keys(STREAK_MESSAGES).map(Number).sort((a, b) => b - a);
  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_MESSAGES[threshold];
    }
  }
  return STREAK_MESSAGES[0];
};

/**
 * Sonraki milestone'u hesapla
 */
const getNextMilestone = (currentStreak) => {
  return STREAK_MILESTONES.find(m => m.days > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
};

/**
 * Streak ateş animasyonu bileşeni
 */
const StreakFlames = ({ intensity = 1 }) => {
  const flameCount = Math.min(5, Math.ceil(intensity * 5));
  
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-lg transition-all duration-300 ${
            i < flameCount 
              ? 'opacity-100 animate-pulse' 
              : 'opacity-20'
          }`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          🔥
        </span>
      ))}
    </div>
  );
};

/**
 * Streak ring bileşeni
 */
const StreakRing = ({ current, target, size = 'md' }) => {
  const percentage = Math.min(100, (current / target) * 100);
  const sizeClasses = {
    sm: 'size-16',
    md: 'size-20',
    lg: 'size-24',
  };
  const textClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };
  
  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
        {/* Background ring */}
        <path
          className="text-gray-200 dark:text-slate-700"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        {/* Progress ring */}
        <path
          className="text-warning transition-all duration-500"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${percentage}, 100`}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-bold ${textClasses[size]}`}>
        <span className="bg-gradient-to-r from-warning to-accent bg-clip-text text-transparent">
          {current}
        </span>
      </div>
    </div>
  );
};

/**
 * Streak haftalık görünüm
 */
const WeeklyStreakView = ({ streak, dailyProgress }) => {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Pazartesi = 0

  return (
    <div className="flex justify-between gap-1 mt-4">
      {days.map((day, i) => {
        const isToday = i === adjustedToday;
        const isPast = i < adjustedToday;
        const isCompleted = isPast && streak > (adjustedToday - i);
        const isTodayCompleted = isToday && dailyProgress >= 100;
        
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className={`text-xs font-medium ${isToday ? 'text-warning' : 'text-gray-500'}`}>
              {day}
            </span>
            <div
              className={`size-6 rounded-full flex items-center justify-center text-xs transition-all ${
                isCompleted || isTodayCompleted
                  ? 'bg-gradient-to-br from-warning to-accent text-white'
                  : isToday
                  ? 'bg-warning/10 dark:bg-warning/30 text-warning ring-2 ring-warning'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
              }`}
            >
              {isCompleted || isTodayCompleted ? '✓' : isToday ? '!' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Ana PracticeStreakWidget bileşeni
 */
export default function PracticeStreakWidget({ variant = 'full', className = '' }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const streakData = useMemo(() => {
    const info = getStreakInfo();
    const goalStatus = getDailyGoalStatus();
    const wotdStreak = getWotdStreak();
    const readingStreak = getReadingStreak();
    const message = getStreakMessage(info.currentStreak);
    const nextMilestone = getNextMilestone(info.currentStreak);
    
    return {
      ...info,
      wotdStreak,
      readingStreak,
      message,
      nextMilestone,
      goalProgress: goalStatus.percentage,
      intensity: Math.min(1, info.currentStreak / 30),
    };
  }, []);

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 glass rounded-xl ${className}`}>
        <div className="size-10 rounded-full bg-gradient-to-br from-warning to-accent flex items-center justify-center">
          <span className="text-white font-bold">{streakData.currentStreak}</span>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {streakData.currentStreak} Gün Seri
          </div>
          <div className="text-xs text-gray-500">
            En yüksek: {streakData.longestStreak} gün
          </div>
        </div>
        <StreakFlames intensity={streakData.intensity} />
      </div>
    );
  }

  // Mini variant
  if (variant === 'mini') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">🔥</span>
        <span className="font-bold text-warning">{streakData.currentStreak}</span>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`glass-strong rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🔥</span>
          Çalışma Serisi
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-primary dark:text-primary-400 hover:underline"
        >
          {showDetails ? 'Kapat' : 'Detaylar'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-6">
        <StreakRing
          current={streakData.currentStreak}
          target={streakData.nextMilestone.days}
          size="lg"
        />
        
        <div className="flex-1">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {streakData.currentStreak} <span className="text-lg font-normal text-gray-500">gün</span>
          </div>
          <p className={`text-sm font-medium ${streakData.message.color}`}>
            {streakData.message.text}
          </p>
          
          {/* Next milestone progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Sonraki hedef: {streakData.nextMilestone.title}</span>
              <span>{streakData.nextMilestone.days - streakData.currentStreak} gün kaldı</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-warning to-accent transition-all duration-500"
                style={{
                  width: `${Math.min(100, (streakData.currentStreak / streakData.nextMilestone.days) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flames */}
      <div className="flex justify-center mt-4">
        <StreakFlames intensity={streakData.intensity} />
      </div>

      {/* Weekly view */}
      <WeeklyStreakView
        streak={streakData.currentStreak}
        dailyProgress={streakData.todayCompletion}
      />

      {/* Details panel */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
          {/* Streak types */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {streakData.wotdStreak}
              </div>
              <div className="text-xs text-gray-500">Kelime Serisi</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {streakData.readingStreak}
              </div>
              <div className="text-xs text-gray-500">Okuma Serisi</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {streakData.longestStreak}
              </div>
              <div className="text-xs text-gray-500">En Uzun Seri</div>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Hedefler
            </h4>
            <div className="flex flex-wrap gap-2">
              {STREAK_MILESTONES.slice(0, 4).map((milestone) => {
                const isAchieved = streakData.currentStreak >= milestone.days;
                const isNext = milestone === streakData.nextMilestone;
                
                return (
                  <div
                    key={milestone.days}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      isAchieved
                        ? 'bg-gradient-to-r from-warning to-accent text-white'
                        : isNext
                        ? 'bg-warning/10 dark:bg-warning/30 text-warning-600 dark:text-warning-400 ring-2 ring-warning'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                    }`}
                  >
                    <span>{milestone.emoji}</span>
                    <span>{milestone.days}d</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's progress */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bugünkü İlerleme
              </span>
              <span className="text-sm font-bold text-warning">
                {streakData.todayCompletion}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  streakData.todayCompletion >= 100
                    ? 'bg-secondary'
                    : streakData.todayCompletion >= 50
                    ? 'bg-warning'
                    : 'bg-accent'
                }`}
                style={{ width: `${streakData.todayCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {streakData.todayCompletion >= 100
                ? '✅ Bugünkü hedefinizi tamamladınız!'
                : streakData.todayCompletion >= 50
                ? '⚡ Seriyi korumak için %100\'e ulaşın'
                : '⚠️ Seriyi kaybetmemek için en az %50 tamamlayın'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Export sub-components for flexibility
export { StreakFlames, StreakRing, WeeklyStreakView, getStreakMessage, getNextMilestone };
