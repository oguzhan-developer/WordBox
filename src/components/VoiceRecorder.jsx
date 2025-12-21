/**
 * VoiceRecorder - Ses kayıt ve telaffuz pratiği bileşeni
 * Web Audio API ve MediaRecorder kullanarak ses kaydı yapar
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Check, X } from 'lucide-react';
import { speak } from '../utils/speechSynthesis';

// Kayıt durumları
const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  RECORDED: 'recorded',
  PLAYING: 'playing',
};

/**
 * Ses dalga formu görselleştirici
 */
const AudioWaveform = ({ isRecording, audioData = [] }) => {
  const bars = 30;
  
  return (
    <div className="flex items-center justify-center gap-0.5 h-16">
      {Array.from({ length: bars }).map((_, i) => {
        const height = isRecording
          ? Math.random() * 100
          : audioData[i] || 10;
        
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-brand-blue'
            }`}
            style={{ 
              height: `${Math.max(10, height)}%`,
              animationDelay: `${i * 30}ms`
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Kayıt süresi göstergesi
 */
const RecordingTimer = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return (
    <div className="flex items-center gap-2">
      <div className="size-3 rounded-full bg-red-500 animate-pulse" />
      <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
};

/**
 * Ana VoiceRecorder bileşeni
 */
export default function VoiceRecorder({ 
  targetWord, 
  onComplete,
  showReference = true,
  maxDuration = 10, // saniye
  className = ''
}) {
  const [state, setState] = useState(RECORDING_STATES.IDLE);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Mikrofon izni kontrolü
  useEffect(() => {
    checkPermission();
    return () => {
      cleanup();
    };
  }, []);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setHasPermission(result.state === 'granted');
      result.onchange = () => setHasPermission(result.state === 'granted');
    } catch (e) {
      // permissions API desteklenmiyorsa null bırak
      setHasPermission(null);
    }
  };

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  // Kayıt başlat
  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setState(RECORDING_STATES.RECORDED);
        
        // Stream'i durdur
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Her 100ms'de data chunk
      setState(RECORDING_STATES.RECORDING);
      setDuration(0);

      // Süre sayacı
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Kayıt hatası:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Mikrofon izni verilmedi');
      } else if (err.name === 'NotFoundError') {
        setError('Mikrofon bulunamadı');
      } else {
        setError('Kayıt başlatılamadı');
      }
    }
  }, [maxDuration]);

  // Kayıt durdur
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === RECORDING_STATES.RECORDING) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
    }
  }, [state]);

  // Kaydı oynat
  const playRecording = useCallback(() => {
    if (!audioUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => setState(RECORDING_STATES.RECORDED);
    audio.onpause = () => setState(RECORDING_STATES.RECORDED);
    
    audio.play();
    setState(RECORDING_STATES.PLAYING);
  }, [audioUrl]);

  // Oynatmayı duraklat
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(RECORDING_STATES.RECORDED);
    }
  }, []);

  // Yeniden kayıt
  const resetRecording = useCallback(() => {
    cleanup();
    setAudioUrl(null);
    setDuration(0);
    setState(RECORDING_STATES.IDLE);
  }, [cleanup]);

  // Referans kelimeyi dinlet
  const playReference = useCallback(() => {
    if (targetWord) {
      speak(targetWord, { rate: 0.85 });
    }
  }, [targetWord]);

  // Tamamlama
  const handleComplete = useCallback((success) => {
    onComplete?.({ success, audioUrl, duration });
  }, [onComplete, audioUrl, duration]);

  // Mikrofon izni yok
  if (hasPermission === false) {
    return (
      <div className={`p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center ${className}`}>
        <div className="size-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Mic className="size-8 text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
          Mikrofon İzni Gerekli
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Telaffuz pratiği için mikrofon erişimine izin verin.
        </p>
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          İzin Ver
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Hedef kelime */}
      {targetWord && showReference && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Bu kelimeyi söyleyin:</p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {targetWord}
            </h2>
            <button
              onClick={playReference}
              className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors"
              title="Telaffuzu dinle"
            >
              <Volume2 className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hata mesajı */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Dalga formu */}
      <div className="mb-6">
        <AudioWaveform isRecording={state === RECORDING_STATES.RECORDING} />
      </div>

      {/* Durum göstergesi */}
      <div className="flex justify-center mb-6">
        {state === RECORDING_STATES.RECORDING ? (
          <RecordingTimer seconds={duration} />
        ) : state === RECORDING_STATES.RECORDED || state === RECORDING_STATES.PLAYING ? (
          <span className="text-sm text-gray-500">
            Kayıt süresi: {duration} saniye
          </span>
        ) : (
          <span className="text-sm text-gray-500">
            Kaydetmek için mikrofon butonuna basın
          </span>
        )}
      </div>

      {/* Kontroller */}
      <div className="flex items-center justify-center gap-4">
        {state === RECORDING_STATES.IDLE && (
          <button
            onClick={startRecording}
            className="size-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
          >
            <Mic className="size-7" />
          </button>
        )}

        {state === RECORDING_STATES.RECORDING && (
          <button
            onClick={stopRecording}
            className="size-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all animate-pulse"
          >
            <Square className="size-6" />
          </button>
        )}

        {state === RECORDING_STATES.RECORDED && (
          <>
            <button
              onClick={resetRecording}
              className="size-12 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Yeniden kaydet"
            >
              <RotateCcw className="size-5" />
            </button>
            
            <button
              onClick={playRecording}
              className="size-16 rounded-full bg-brand-blue hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
              title="Kaydı dinle"
            >
              <Play className="size-7 ml-1" />
            </button>

            {onComplete && (
              <>
                <button
                  onClick={() => handleComplete(false)}
                  className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                  title="Tekrar dene"
                >
                  <X className="size-5" />
                </button>
                <button
                  onClick={() => handleComplete(true)}
                  className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center transition-colors"
                  title="Tamamlandı"
                >
                  <Check className="size-5" />
                </button>
              </>
            )}
          </>
        )}

        {state === RECORDING_STATES.PLAYING && (
          <>
            <button
              onClick={resetRecording}
              className="size-12 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Yeniden kaydet"
            >
              <RotateCcw className="size-5" />
            </button>
            
            <button
              onClick={pausePlayback}
              className="size-16 rounded-full bg-brand-blue hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-all"
              title="Duraklat"
            >
              <Pause className="size-7" />
            </button>
          </>
        )}
      </div>

      {/* İpucu */}
      <p className="text-xs text-center text-gray-400 mt-6">
        💡 Net bir şekilde konuşun ve arka plan gürültüsünü minimize edin
      </p>
    </div>
  );
}

/**
 * Kompakt versiyon - kelime kartlarında kullanım için
 */
export const VoiceRecorderMini = ({ word, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleClick = async () => {
    if (isRecording) {
      // Durdur
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setHasRecording(true);
    } else if (hasRecording) {
      // Sıfırla
      setHasRecording(false);
      audioChunksRef.current = [];
    } else {
      // Kaydet
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          onComplete?.({
            audioBlob: new Blob(audioChunksRef.current, { type: 'audio/webm' })
          });
        };

        mediaRecorder.start();
        setIsRecording(true);

        // 5 saniye sonra otomatik durdur
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            setHasRecording(true);
          }
        }, 5000);
      } catch (e) {
        console.error('Kayıt hatası:', e);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`size-10 rounded-lg flex items-center justify-center transition-all ${
        isRecording
          ? 'bg-red-500 text-white animate-pulse'
          : hasRecording
          ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
          : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20'
      }`}
      title={isRecording ? 'Kaydı durdur' : hasRecording ? 'Yeniden kaydet' : 'Kaydet'}
    >
      {isRecording ? (
        <Square className="size-4" />
      ) : hasRecording ? (
        <Check className="size-4" />
      ) : (
        <Mic className="size-4" />
      )}
    </button>
  );
};
