/**
 * PronunciationChecker - Telaffuz Kontrol Bileşeni
 * Web Speech Recognition API ile telaffuz değerlendirmesi
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, RefreshCw, Check, X, AlertCircle, Loader2, Lightbulb } from 'lucide-react';
import { speak, isSpeechSupported } from '../utils/speechSynthesis';
import {
  isSpeechRecognitionSupported,
  PronunciationAnalyzer,
  evaluatePronunciation,
  getPronunciationTips,
} from '../utils/speechRecognition';

// Skor renkleri ve stilleri
const GRADE_STYLES = {
  excellent: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
    ring: 'ring-green-400',
  },
  good: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
    ring: 'ring-blue-400',
  },
  fair: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
    ring: 'ring-yellow-400',
  },
  'needs-work': {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
    ring: 'ring-orange-400',
  },
  'try-again': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    ring: 'ring-red-400',
  },
};

/**
 * Skor Göstergesi
 */
const ScoreIndicator = ({ score, grade, size = 'md' }) => {
  const sizes = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-20 h-20 text-xl',
  };
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={GRADE_STYLES[grade]?.text || 'text-gray-500'}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className={`font-bold ${GRADE_STYLES[grade]?.text || 'text-gray-700'}`}>
        {score}
      </span>
    </div>
  );
};

/**
 * Dalga Animasyonu (dinlerken)
 */
const ListeningWaves = () => {
  return (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-brand-blue rounded-full animate-pulse"
          style={{
            height: `${12 + Math.random() * 12}px`,
            animationDelay: `${i * 100}ms`,
            animationDuration: '0.5s',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Ana PronunciationChecker Bileşeni
 */
export default function PronunciationChecker({
  word,
  phonetic,
  onResult,
  autoStart = false,
  showTips = true,
  compact = false,
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  
  const analyzerRef = useRef(null);
  
  // Destek kontrolü
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);
  
  // Analyzer oluştur
  useEffect(() => {
    if (!isSupported) return;
    
    try {
      analyzerRef.current = new PronunciationAnalyzer({
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 3,
      });
      
      analyzerRef.current
        .on('start', () => {
          setIsListening(true);
          setError(null);
          setInterimText('');
        })
        .on('interim', (text) => {
          setInterimText(text);
        })
        .on('result', (evaluation) => {
          setResult(evaluation);
          setAttempts(prev => prev + 1);
          onResult?.(evaluation);
        })
        .on('error', (message) => {
          setError(message);
        })
        .on('end', () => {
          setIsListening(false);
          setInterimText('');
        });
    } catch (err) {
      setError('Ses tanıma başlatılamadı');
    }
    
    return () => {
      analyzerRef.current?.stop();
    };
  }, [isSupported, onResult]);
  
  // Otomatik başlat
  useEffect(() => {
    if (autoStart && isSupported && !isListening) {
      startListening();
    }
  }, [autoStart, isSupported]);
  
  const startListening = useCallback(() => {
    if (!analyzerRef.current || isListening) return;
    
    setResult(null);
    setError(null);
    analyzerRef.current.start(word);
  }, [word, isListening]);
  
  const stopListening = useCallback(() => {
    analyzerRef.current?.stop();
  }, []);
  
  const handlePlayWord = useCallback(() => {
    if (isSpeechSupported()) {
      speak(word);
    }
  }, [word]);
  
  const handleRetry = useCallback(() => {
    setResult(null);
    setError(null);
    startListening();
  }, [startListening]);
  
  // Desteklenmiyorsa uyarı göster
  if (!isSupported) {
    return (
      <div className={`p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 ${compact ? 'p-2' : ''}`}>
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="size-5" />
          <span className="text-sm">
            Tarayıcınız ses tanımayı desteklemiyor.
          </span>
        </div>
      </div>
    );
  }
  
  // Kompakt mod
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Dinle butonu */}
        <button
          onClick={handlePlayWord}
          className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          title="Kelimeyi dinle"
        >
          <Volume2 className="size-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Mikrofon butonu */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-lg transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : result
              ? `${GRADE_STYLES[result.grade].bg} ${GRADE_STYLES[result.grade].text}`
              : 'bg-brand-blue text-white hover:bg-blue-700'
          }`}
          title={isListening ? 'Dinlemeyi durdur' : 'Telaffuz et'}
        >
          {isListening ? (
            <MicOff className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
        </button>
        
        {/* Sonuç */}
        {result && (
          <span className={`text-sm font-medium ${GRADE_STYLES[result.grade].text}`}>
            {result.score}%
          </span>
        )}
      </div>
    );
  }
  
  // Tam mod
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            Telaffuz Kontrolü
          </h4>
          <p className="text-sm text-gray-500">
            "{word}" kelimesini söyleyin
          </p>
        </div>
        
        {/* Dinle butonu */}
        <button
          onClick={handlePlayWord}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-sm"
        >
          <Volume2 className="size-4" />
          Dinle
        </button>
      </div>
      
      {/* Kelime ve fonetik */}
      <div className="text-center py-4">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {word}
        </span>
        {phonetic && (
          <span className="block text-sm text-gray-500 mt-1">{phonetic}</span>
        )}
      </div>
      
      {/* Dinleme durumu */}
      {isListening && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue">
            <div className="relative">
              <Mic className="size-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>
            <span>Dinleniyor...</span>
          </div>
          
          {interimText && (
            <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
              "{interimText}"
            </p>
          )}
          
          <div className="mt-4">
            <ListeningWaves />
          </div>
        </div>
      )}
      
      {/* Sonuç */}
      {result && !isListening && (
        <div className={`p-4 rounded-xl border ${GRADE_STYLES[result.grade].bg} ${GRADE_STYLES[result.grade].border}`}>
          <div className="flex items-start gap-4">
            <ScoreIndicator score={result.score} grade={result.grade} />
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{result.emoji}</span>
                <span className={`font-medium ${GRADE_STYLES[result.grade].text}`}>
                  {result.feedback}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Söylenen: "{result.spoken}"
              </p>
              
              {result.confidence && (
                <p className="text-xs text-gray-500 mt-1">
                  Güven: %{result.confidence}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hata */}
      {error && !isListening && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="size-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Butonlar */}
      <div className="flex justify-center gap-3">
        {!isListening ? (
          <>
            <button
              onClick={startListening}
              className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Mic className="size-5" />
              {result ? 'Tekrar Dene' : 'Başla'}
            </button>
            
            {result && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="size-5" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={stopListening}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            <MicOff className="size-5" />
            Durdur
          </button>
        )}
      </div>
      
      {/* İpuçları */}
      {showTips && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
            <Lightbulb className="size-4" />
            <span className="text-sm font-medium">Telaffuz İpuçları</span>
          </div>
          <ul className="space-y-1">
            {getPronunciationTips(word).map((tip, i) => (
              <li key={i} className="text-sm text-blue-600 dark:text-blue-300">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Deneme sayısı */}
      {attempts > 0 && (
        <p className="text-center text-xs text-gray-400">
          {attempts}. deneme
        </p>
      )}
    </div>
  );
}

/**
 * Mini telaffuz kontrolü (kart içi kullanım)
 */
export const PronunciationCheckerMini = ({ word, onResult }) => {
  return (
    <PronunciationChecker
      word={word}
      onResult={onResult}
      compact={true}
      showTips={false}
    />
  );
};

/**
 * Telaffuz pratiği modu için wrapper
 */
export const PronunciationPractice = ({ words, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  
  const currentWord = words[currentIndex];
  
  const handleResult = useCallback((result) => {
    const newResults = [...results, { word: currentWord, ...result }];
    setResults(newResults);
    
    // Sonraki kelimeye geç
    if (currentIndex < words.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2000);
    } else {
      // Tamamlandı
      onComplete?.(newResults);
    }
  }, [currentIndex, currentWord, words.length, results, onComplete]);
  
  return (
    <div className="space-y-6">
      {/* İlerleme */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">
          {currentIndex + 1}/{words.length}
        </span>
      </div>
      
      {/* Mevcut kelime */}
      {currentWord && (
        <PronunciationChecker
          key={currentWord.word || currentWord}
          word={currentWord.word || currentWord}
          phonetic={currentWord.phonetic}
          onResult={handleResult}
        />
      )}
      
      {/* Önceki sonuçlar */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Önceki Sonuçlar</h4>
          <div className="flex flex-wrap gap-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${GRADE_STYLES[r.grade].bg} ${GRADE_STYLES[r.grade].text}`}
              >
                <span>{r.word}</span>
                <span className="font-medium">{r.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
