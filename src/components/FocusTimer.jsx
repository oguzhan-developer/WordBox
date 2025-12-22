import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';

/**
 * Focus Timer Component - Pomodoro-style study timer
 * Features:
 * - Customizable work/break durations
 * - Audio notifications
 * - Session counter
 * - Minimal distraction design
 */

const PRESETS = {
  pomodoro: { work: 25, break: 5, label: 'Pomodoro', icon: '🍅' },
  short: { work: 15, break: 3, label: 'Kısa', icon: '⚡' },
  long: { work: 45, break: 10, label: 'Uzun', icon: '🧘' },
  custom: { work: 25, break: 5, label: 'Özel', icon: '⚙️' },
};

export default function FocusTimer({ isOpen, onClose }) {
  const [preset, setPreset] = useState('pomodoro');
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [timeLeft, setTimeLeft] = useState(PRESETS.pomodoro.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef(null);
  
  // Get current preset values - memoized to prevent effect dependency changes
  const currentPreset = useMemo(() => 
    preset === 'custom' 
      ? { work: customWork, break: customBreak } 
      : PRESETS[preset],
    [preset, customWork, customBreak]
  );
  
  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = isBreak ? 440 : 880; // Different pitch for work/break
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      console.log('Audio not available');
    }
  }, [soundEnabled, isBreak]);
  
  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playSound();
    
    if (isBreak) {
      // Break ended, start new work session
      setIsBreak(false);
      setTimeLeft(currentPreset.work * 60);
      setSessions(prev => prev + 1);
    } else {
      // Work ended, start break
      setIsBreak(true);
      setTimeLeft(currentPreset.break * 60);
    }
    setIsRunning(false);
  }, [isBreak, currentPreset, playSound]);
  
  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed - handle in next tick to avoid setState in effect
      const timer = setTimeout(handleTimerComplete, 0);
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete]);
  
  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(currentPreset.work * 60);
  }, [currentPreset]);
  
  // Change preset
  const changePreset = useCallback((newPreset) => {
    setPreset(newPreset);
    setIsRunning(false);
    setIsBreak(false);
    const p = newPreset === 'custom' 
      ? { work: customWork, break: customBreak }
      : PRESETS[newPreset];
    setTimeLeft(p.work * 60);
  }, [customWork, customBreak]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const totalTime = isBreak ? currentPreset.break * 60 : currentPreset.work * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Timer Container */}
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${
        isBreak 
          ? 'bg-gradient-to-br from-green-500/90 to-emerald-600/90' 
          : 'bg-gradient-to-br from-brand-purple/90 to-brand-blue/90'
      }`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        </div>
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isBreak ? '☕' : '🎯'}</span>
            <h2 id="timer-title" className="text-xl font-bold text-white">
              {isBreak ? 'Mola Zamanı' : 'Odaklan'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/50" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Ayarlar"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="relative mx-6 mb-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <p className="text-sm font-bold text-white/80 mb-3">Zamanlayıcı Modu</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(PRESETS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => changePreset(key)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                    preset === key 
                      ? 'bg-white/30 ring-2 ring-white/50' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span>{value.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">{value.label}</div>
                    {key !== 'custom' && (
                      <div className="text-xs text-white/60">{value.work}dk / {value.break}dk</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {preset === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Çalışma (dk)</label>
                  <input
                    type="number"
                    value={customWork}
                    onChange={(e) => setCustomWork(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-white/50 border-none"
                    min="1"
                    max="120"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">Mola (dk)</label>
                  <input
                    type="number"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-white/50 border-none"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Main Timer */}
        <div className="relative flex flex-col items-center py-8 px-6">
          {/* Circular progress */}
          <div className="relative w-56 h-56">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={628}
                strokeDashoffset={628 - (progress / 100) * 628}
                className="transition-all duration-1000"
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-black text-white tracking-wider">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-white/60 mt-2 font-medium">
                {isBreak ? 'Mola' : 'Çalışma'} • Oturum {sessions + 1}
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={reset}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all hover:scale-105"
              aria-label="Sıfırla"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-6 rounded-3xl transition-all hover:scale-105 shadow-lg ${
                isRunning 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-white text-brand-purple'
              }`}
              aria-label={isRunning ? 'Duraklat' : 'Başlat'}
            >
              {isRunning ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 fill-current" />
              )}
            </button>
            
            <div className="p-4 rounded-2xl bg-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{sessions}</div>
                <div className="text-xs text-white/60">Oturum</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tip */}
        <div className="relative px-6 pb-6">
          <div className="p-4 rounded-2xl bg-white/10 text-center">
            <p className="text-sm text-white/80">
              {isBreak 
                ? '💡 Kısa bir yürüyüş yapın veya gözlerinizi dinlendirin' 
                : '💡 Bildirimleri kapatın ve tek bir göreve odaklanın'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
