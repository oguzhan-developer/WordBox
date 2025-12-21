/**
 * Word of the Day Utility
 * Provides daily vocabulary motivation
 * Rotates based on date (deterministic)
 */

// Collection of interesting words with detailed information
const WORD_COLLECTION = [
  {
    word: 'Serendipity',
    phonetic: '/ˌserənˈdipəti/',
    turkish: 'Tesadüfi güzel keşif',
    partOfSpeech: 'noun',
    definition: 'The occurrence of events by chance in a happy way.',
    example: 'Meeting my best friend at a random cafe was pure serendipity.',
    level: 'C1',
    category: 'abstract',
  },
  {
    word: 'Ephemeral',
    phonetic: '/ɪˈfem(ə)rəl/',
    turkish: 'Geçici, kısa ömürlü',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time.',
    example: 'The beauty of cherry blossoms is ephemeral.',
    level: 'C1',
    category: 'description',
  },
  {
    word: 'Resilience',
    phonetic: '/rɪˈzɪlɪəns/',
    turkish: 'Dayanıklılık, esneklik',
    partOfSpeech: 'noun',
    definition: 'The capacity to recover quickly from difficulties.',
    example: 'Her resilience after the setback was inspiring.',
    level: 'B2',
    category: 'character',
  },
  {
    word: 'Meticulous',
    phonetic: '/məˈtɪkjʊləs/',
    turkish: 'Titiz, detaycı',
    partOfSpeech: 'adjective',
    definition: 'Showing great attention to detail; very careful and precise.',
    example: 'He was meticulous in his research.',
    level: 'B2',
    category: 'character',
  },
  {
    word: 'Eloquent',
    phonetic: '/ˈeləkwənt/',
    turkish: 'Güzel konuşan, etkili',
    partOfSpeech: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing.',
    example: 'She gave an eloquent speech about climate change.',
    level: 'B2',
    category: 'communication',
  },
  {
    word: 'Wanderlust',
    phonetic: '/ˈwɒndəlʌst/',
    turkish: 'Seyahat tutkusu',
    partOfSpeech: 'noun',
    definition: 'A strong desire to travel and explore the world.',
    example: 'His wanderlust led him to visit 50 countries.',
    level: 'B2',
    category: 'emotion',
  },
  {
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪkwɪtəs/',
    turkish: 'Her yerde bulunan',
    partOfSpeech: 'adjective',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Smartphones have become ubiquitous in modern society.',
    level: 'C1',
    category: 'description',
  },
  {
    word: 'Pragmatic',
    phonetic: '/præɡˈmætɪk/',
    turkish: 'Pragmatik, pratik',
    partOfSpeech: 'adjective',
    definition: 'Dealing with things sensibly and realistically.',
    example: 'We need a pragmatic approach to solve this problem.',
    level: 'B2',
    category: 'thinking',
  },
  {
    word: 'Ambiguous',
    phonetic: '/æmˈbɪɡjuəs/',
    turkish: 'Belirsiz, çok anlamlı',
    partOfSpeech: 'adjective',
    definition: 'Open to more than one interpretation; unclear.',
    example: 'His answer was deliberately ambiguous.',
    level: 'B2',
    category: 'communication',
  },
  {
    word: 'Catalyst',
    phonetic: '/ˈkætəlɪst/',
    turkish: 'Katalizör, tetikleyici',
    partOfSpeech: 'noun',
    definition: 'A person or thing that causes an important change.',
    example: 'The book was a catalyst for social change.',
    level: 'B2',
    category: 'abstract',
  },
  {
    word: 'Nostalgia',
    phonetic: '/nɒˈstældʒə/',
    turkish: 'Nostalji, hasret',
    partOfSpeech: 'noun',
    definition: 'A sentimental longing for the past.',
    example: 'Looking at old photos filled her with nostalgia.',
    level: 'B1',
    category: 'emotion',
  },
  {
    word: 'Perseverance',
    phonetic: '/ˌpɜːsɪˈvɪərəns/',
    turkish: 'Azim, sebat',
    partOfSpeech: 'noun',
    definition: 'Persistence in doing something despite difficulty.',
    example: 'His perseverance paid off when he finally succeeded.',
    level: 'B2',
    category: 'character',
  },
  {
    word: 'Innovative',
    phonetic: '/ˈɪnəveɪtɪv/',
    turkish: 'Yenilikçi, yaratıcı',
    partOfSpeech: 'adjective',
    definition: 'Featuring new methods; advanced and original.',
    example: 'The company is known for its innovative products.',
    level: 'B1',
    category: 'business',
  },
  {
    word: 'Profound',
    phonetic: '/prəˈfaʊnd/',
    turkish: 'Derin, etkili',
    partOfSpeech: 'adjective',
    definition: 'Very great or intense; showing deep insight.',
    example: 'The experience had a profound effect on him.',
    level: 'B2',
    category: 'description',
  },
  {
    word: 'Versatile',
    phonetic: '/ˈvɜːsətaɪl/',
    turkish: 'Çok yönlü',
    partOfSpeech: 'adjective',
    definition: 'Able to adapt or be adapted to many different uses.',
    example: 'She is a versatile actress who can play any role.',
    level: 'B1',
    category: 'character',
  },
  {
    word: 'Authentic',
    phonetic: '/ɔːˈθentɪk/',
    turkish: 'Otantik, gerçek',
    partOfSpeech: 'adjective',
    definition: 'Of undisputed origin; genuine.',
    example: 'The restaurant serves authentic Italian cuisine.',
    level: 'B1',
    category: 'description',
  },
  {
    word: 'Empathy',
    phonetic: '/ˈempəθi/',
    turkish: 'Empati, duygudaşlık',
    partOfSpeech: 'noun',
    definition: 'The ability to understand and share feelings of others.',
    example: 'A good leader shows empathy towards their team.',
    level: 'B1',
    category: 'emotion',
  },
  {
    word: 'Intuitive',
    phonetic: '/ɪnˈtjuːɪtɪv/',
    turkish: 'Sezgisel',
    partOfSpeech: 'adjective',
    definition: 'Using or based on intuition rather than conscious thought.',
    example: 'The app has an intuitive interface.',
    level: 'B2',
    category: 'thinking',
  },
  {
    word: 'Tenacious',
    phonetic: '/tɪˈneɪʃəs/',
    turkish: 'Azimli, ısrarcı',
    partOfSpeech: 'adjective',
    definition: 'Tending to keep a firm hold; persistent.',
    example: 'Her tenacious efforts led to success.',
    level: 'C1',
    category: 'character',
  },
  {
    word: 'Diligent',
    phonetic: '/ˈdɪlɪdʒənt/',
    turkish: 'Çalışkan, gayretli',
    partOfSpeech: 'adjective',
    definition: 'Having or showing care in one\'s work or duties.',
    example: 'She is a diligent student who always does her homework.',
    level: 'B1',
    category: 'character',
  },
  {
    word: 'Inevitable',
    phonetic: '/ɪˈnevɪtəbl/',
    turkish: 'Kaçınılmaz',
    partOfSpeech: 'adjective',
    definition: 'Certain to happen; unavoidable.',
    example: 'Change is inevitable in life.',
    level: 'B2',
    category: 'abstract',
  },
];

// Get a deterministic word based on the date
const getDayIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % WORD_COLLECTION.length;
};

/**
 * Get Word of the Day
 * Returns the same word for the entire day
 */
export const getWordOfTheDay = () => {
  const index = getDayIndex();
  return {
    ...WORD_COLLECTION[index],
    date: new Date().toISOString().split('T')[0],
  };
};

/**
 * Get previous days' words
 * @param {number} count - Number of previous words to get
 */
export const getPreviousWords = (count = 7) => {
  const todayIndex = getDayIndex();
  const words = [];
  
  for (let i = 1; i <= count; i++) {
    const index = (todayIndex - i + WORD_COLLECTION.length) % WORD_COLLECTION.length;
    const date = new Date();
    date.setDate(date.getDate() - i);
    words.push({
      ...WORD_COLLECTION[index],
      date: date.toISOString().split('T')[0],
    });
  }
  
  return words;
};

/**
 * Check if word was learned today
 */
export const isWordLearnedToday = () => {
  try {
    const stored = localStorage.getItem('wotd_learned');
    if (stored) {
      const data = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      return data.date === today && data.learned;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Mark today's word as learned
 */
export const markWordAsLearned = () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('wotd_learned', JSON.stringify({
    date: today,
    learned: true,
  }));
};

/**
 * Get learning streak for WOTD
 */
export const getWotdStreak = () => {
  try {
    const stored = localStorage.getItem('wotd_streak');
    if (stored) {
      const data = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (data.lastDate === today) {
        return data.streak;
      } else if (data.lastDate === yesterdayStr) {
        return data.streak; // Streak continues, not broken
      }
    }
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Update WOTD streak
 */
export const updateWotdStreak = () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  try {
    const stored = localStorage.getItem('wotd_streak');
    let streak = 1;
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.lastDate === yesterdayStr) {
        streak = data.streak + 1;
      } else if (data.lastDate === today) {
        streak = data.streak; // Already counted today
      }
    }
    
    localStorage.setItem('wotd_streak', JSON.stringify({
      lastDate: today,
      streak,
    }));
    
    return streak;
  } catch {
    return 1;
  }
};
