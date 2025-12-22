/**
 * Speech Recognition Utilities
 * Web Speech API kullanarak telaffuz tanıma ve değerlendirme
 */

// Browser desteği kontrolü
export const isSpeechRecognitionSupported = () => {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition
  );
};

// SpeechRecognition API'yi al
const getSpeechRecognition = () => {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

/**
 * Basit metin benzerlik skoru hesaplama (Levenshtein Distance bazlı)
 * @param {string} s1 - Birinci string
 * @param {string} s2 - İkinci string
 * @returns {number} - 0-100 arası benzerlik skoru
 */
export const calculateSimilarity = (s1, s2) => {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();
  
  if (str1 === str2) return 100;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const matrix = [];
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const distance = matrix[str1.length][str2.length];
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(similarity);
};

/**
 * Fonetik benzerlik analizi
 * Yaygın telaffuz hatalarını hesaba katar
 */
const PHONETIC_EQUIVALENTS = [
  ['th', 'd'], ['th', 't'], ['th', 'f'], ['th', 'v'],
  ['r', 'l'],
  ['w', 'v'],
  ['sh', 's'], ['sh', 'ch'],
  ['ch', 'j'],
  ['ng', 'n'],
  ['ph', 'f'],
  ['tion', 'shun'],
  ['sion', 'zhun'],
];

export const calculatePhoneticSimilarity = (spoken, target) => {
  let adjustedSpoken = spoken.toLowerCase();
  let adjustedTarget = target.toLowerCase();
  
  // Fonetik eşdeğerleri uygula
  PHONETIC_EQUIVALENTS.forEach(([a, b]) => {
    if (adjustedSpoken.includes(b) && adjustedTarget.includes(a)) {
      adjustedSpoken = adjustedSpoken.replace(new RegExp(b, 'g'), a);
    }
    if (adjustedSpoken.includes(a) && adjustedTarget.includes(b)) {
      adjustedSpoken = adjustedSpoken.replace(new RegExp(a, 'g'), b);
    }
  });
  
  return calculateSimilarity(adjustedSpoken, adjustedTarget);
};

/**
 * Telaffuz skoru hesaplama
 * @param {string} spoken - Söylenen kelime
 * @param {string} target - Hedef kelime
 * @returns {Object} - Skor ve detaylar
 */
export const evaluatePronunciation = (spoken, target) => {
  const exactSimilarity = calculateSimilarity(spoken, target);
  const phoneticSimilarity = calculatePhoneticSimilarity(spoken, target);
  
  // Ağırlıklı ortalama: fonetik benzerlik daha önemli
  const score = Math.round(exactSimilarity * 0.3 + phoneticSimilarity * 0.7);
  
  let grade, feedback, emoji;
  
  if (score >= 95) {
    grade = 'excellent';
    feedback = 'Mükemmel telaffuz! 👏';
    emoji = '🌟';
  } else if (score >= 85) {
    grade = 'good';
    feedback = 'Çok iyi! Küçük iyileştirmeler yapabilirsin.';
    emoji = '✨';
  } else if (score >= 70) {
    grade = 'fair';
    feedback = 'İyi deneme! Biraz daha pratik yap.';
    emoji = '👍';
  } else if (score >= 50) {
    grade = 'needs-work';
    feedback = 'Gelişmeye devam! Tekrar dene.';
    emoji = '💪';
  } else {
    grade = 'try-again';
    feedback = 'Tekrar dinle ve söyle.';
    emoji = '🎯';
  }
  
  return {
    score,
    grade,
    feedback,
    emoji,
    spoken,
    target,
    exactSimilarity,
    phoneticSimilarity,
  };
};

/**
 * Pronunciation Analyzer Class
 * Sürekli telaffuz analizi için
 */
export class PronunciationAnalyzer {
  constructor(options = {}) {
    if (!isSpeechRecognitionSupported()) {
      throw new Error('Speech Recognition not supported');
    }
    
    const SpeechRecognition = getSpeechRecognition();
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.maxAlternatives = options.maxAlternatives || 3;
    
    this.targetWord = '';
    this.isListening = false;
    this.callbacks = {
      onResult: null,
      onInterim: null,
      onError: null,
      onEnd: null,
      onStart: null,
    };
    
    this._setupEventListeners();
  }
  
  _setupEventListeners() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart?.();
    };
    
    this.recognition.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const spoken = lastResult[0].transcript;
        const confidence = lastResult[0].confidence;
        
        // Tüm alternatifleri topla
        const alternatives = [];
        for (let i = 0; i < lastResult.length; i++) {
          alternatives.push({
            transcript: lastResult[i].transcript,
            confidence: lastResult[i].confidence,
          });
        }
        
        const evaluation = evaluatePronunciation(spoken, this.targetWord);
        
        this.callbacks.onResult?.({
          ...evaluation,
          confidence: Math.round(confidence * 100),
          alternatives,
        });
      } else {
        // Interim sonuç
        const interim = lastResult[0].transcript;
        this.callbacks.onInterim?.(interim);
      }
    };
    
    this.recognition.onerror = (event) => {
      this.isListening = false;
      
      let errorMessage = 'Bir hata oluştu';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Ses algılanamadı. Lütfen tekrar deneyin.';
          break;
        case 'audio-capture':
          errorMessage = 'Mikrofon bulunamadı. Lütfen mikrofon bağlayın.';
          break;
        case 'not-allowed':
          errorMessage = 'Mikrofon izni reddedildi. Ayarlardan izin verin.';
          break;
        case 'network':
          errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
          break;
        case 'aborted':
          errorMessage = 'Dinleme iptal edildi.';
          break;
        default:
          errorMessage = `Hata: ${event.error}`;
      }
      
      this.callbacks.onError?.(errorMessage, event.error);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd?.();
    };
  }
  
  /**
   * Dinlemeyi başlat
   * @param {string} targetWord - Hedef kelime
   */
  start(targetWord) {
    if (this.isListening) {
      this.stop();
    }
    
    this.targetWord = targetWord;
    
    try {
      this.recognition.start();
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        // Zaten çalışıyor, yeniden başlat
        this.recognition.stop();
        setTimeout(() => this.recognition.start(), 100);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Dinlemeyi durdur
   */
  stop() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }
  
  /**
   * Dinlemeyi iptal et
   */
  abort() {
    this.recognition.abort();
  }
  
  /**
   * Callback'leri ayarla
   */
  on(event, callback) {
    const key = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (Object.prototype.hasOwnProperty.call(this.callbacks, key)) {
      this.callbacks[key] = callback;
    }
    return this;
  }
  
  /**
   * Dili değiştir
   */
  setLanguage(lang) {
    this.recognition.lang = lang;
  }
}

/**
 * Tek seferlik telaffuz değerlendirmesi
 * @param {string} targetWord - Hedef kelime
 * @param {number} timeout - Timeout süresi (ms)
 * @returns {Promise<Object>} - Değerlendirme sonucu
 */
export const evaluatePronunciationOnce = (targetWord, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported()) {
      reject(new Error('Speech Recognition not supported'));
      return;
    }
    
    const analyzer = new PronunciationAnalyzer();
    let timeoutId;
    
    analyzer
      .on('result', (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .on('error', (message, _error) => {
        clearTimeout(timeoutId);
        reject(new Error(message));
      });
    
    timeoutId = setTimeout(() => {
      analyzer.stop();
      reject(new Error('Zaman aşımı. Ses algılanamadı.'));
    }, timeout);
    
    analyzer.start(targetWord);
  });
};

/**
 * Kelime için telaffuz ipuçları oluştur
 */
export const getPronunciationTips = (word) => {
  const tips = [];
  const lowerWord = word.toLowerCase();
  
  // Common pronunciation rules
  if (lowerWord.includes('th')) {
    tips.push('💡 "th" sesi için dilinizi dişlerinizin arasına hafifçe koyun');
  }
  
  if (lowerWord.includes('tion')) {
    tips.push('💡 "-tion" eki "şın" gibi okunur');
  }
  
  if (lowerWord.includes('gh')) {
    tips.push('💡 "gh" genellikle sessizdir veya "f" gibi okunur');
  }
  
  if (lowerWord.includes('ough')) {
    tips.push('💡 "ough" kelimeye göre farklı okunabilir (off, oo, oh)');
  }
  
  if (lowerWord.endsWith('ed')) {
    tips.push('💡 "-ed" eki t/d sesinden sonra "id", diğerlerinde "t" veya "d" gibi okunur');
  }
  
  if (lowerWord.includes('silent')) {
    tips.push('💡 "silent" kelimesindeki "l" harfi sessizdir');
  }
  
  if (/[aeiou]{2}/.test(lowerWord)) {
    tips.push('💡 Yan yana sesli harfler genellikle tek ses olarak okunur');
  }
  
  return tips.length > 0 ? tips : ['💡 Yavaşça ve net bir şekilde telaffuz edin'];
};

export default {
  isSpeechRecognitionSupported,
  calculateSimilarity,
  calculatePhoneticSimilarity,
  evaluatePronunciation,
  PronunciationAnalyzer,
  evaluatePronunciationOnce,
  getPronunciationTips,
};
