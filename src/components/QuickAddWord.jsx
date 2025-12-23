/**
 * QuickAddWord - Hızlı kelime ekleme bileşeni
 * Herhangi bir yerden kelime eklemeyi sağlar
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, X, Search, Loader2, Volume2, Sparkles } from 'lucide-react';
import Modal from './Modal';
import { useUser } from '../context/UserContext';
import { useToast } from './Toast';
import { speak } from '../utils/speechSynthesis';

// Örnek kelime veritabanı (gerçek API ile değiştirilebilir)
const SAMPLE_WORDS = [
  // C1 Kelimeleri
  { word: 'serendipity', turkish: 'beklenmedik güzel keşif', phonetic: '/ˌserənˈdɪpɪti/', level: 'C1', partOfSpeech: 'noun', definition: 'The occurrence of events by chance in a happy way', examples: ['Finding that book was pure serendipity.'] },
  { word: 'ephemeral', turkish: 'geçici, kısa ömürlü', phonetic: '/ɪˈfemərəl/', level: 'C1', partOfSpeech: 'adjective', definition: 'Lasting for a very short time', examples: ['Fashion trends are often ephemeral.'] },
  { word: 'ubiquitous', turkish: 'her yerde bulunan', phonetic: '/juːˈbɪkwɪtəs/', level: 'C1', partOfSpeech: 'adjective', definition: 'Present, appearing, or found everywhere', examples: ['Smartphones have become ubiquitous.'] },
  { word: 'pragmatic', turkish: 'pragmatik, gerçekçi', phonetic: '/præɡˈmætɪk/', level: 'C1', partOfSpeech: 'adjective', definition: 'Dealing with things sensibly and realistically', examples: ['We need a pragmatic approach to this problem.'] },
  { word: 'meticulous', turkish: 'titiz, ayrıntıcı', phonetic: '/məˈtɪkjələs/', level: 'C1', partOfSpeech: 'adjective', definition: 'Showing great attention to detail', examples: ['She was meticulous in her research.'] },
  { word: 'alleviate', turkish: 'hafifletmek, azaltmak', phonetic: '/əˈliːvieɪt/', level: 'C1', partOfSpeech: 'verb', definition: 'To make suffering or a problem less severe', examples: ['The medicine helped alleviate the pain.'] },

  // B2 Kelimeleri
  { word: 'eloquent', turkish: 'belagatli, etkileyici konuşan', phonetic: '/ˈeləkwənt/', level: 'B2', partOfSpeech: 'adjective', definition: 'Fluent or persuasive in speaking or writing', examples: ['She gave an eloquent speech.'] },
  { word: 'resilient', turkish: 'dayanıklı, çabuk toparlanan', phonetic: '/rɪˈzɪliənt/', level: 'B2', partOfSpeech: 'adjective', definition: 'Able to recover quickly from difficulties', examples: ['Children are remarkably resilient.'] },
  { word: 'comprehend', turkish: 'kavramak, anlamak', phonetic: '/ˌkɒmprɪˈhend/', level: 'B2', partOfSpeech: 'verb', definition: 'To understand something completely', examples: ['I cannot comprehend why he did that.'] },
  { word: 'diligent', turkish: 'çalışkan, azimli', phonetic: '/ˈdɪlɪdʒənt/', level: 'B2', partOfSpeech: 'adjective', definition: 'Having or showing care in one\'s work', examples: ['She is a diligent student.'] },
  { word: 'innovative', turkish: 'yenilikçi', phonetic: '/ˈɪnəvətɪv/', level: 'B2', partOfSpeech: 'adjective', definition: 'Featuring new methods or advanced techniques', examples: ['The company is known for innovative products.'] },

  // B1 Kelimeleri
  { word: 'accomplish', turkish: 'başarmak, gerçekleştirmek', phonetic: '/əˈkʌmplɪʃ/', level: 'B1', partOfSpeech: 'verb', definition: 'To achieve or complete successfully', examples: ['She accomplished her goal.'] },
  { word: 'appreciate', turkish: 'takdir etmek, değer vermek', phonetic: '/əˈpriːʃieɪt/', level: 'B1', partOfSpeech: 'verb', definition: 'To be grateful for something', examples: ['I appreciate your help.'] },
  { word: 'concentrate', turkish: 'odaklanmak, konsantre olmak', phonetic: '/ˈkɒnsntreɪt/', level: 'B1', partOfSpeech: 'verb', definition: 'To direct attention toward something', examples: ['I need to concentrate on my work.'] },
  { word: 'determine', turkish: 'belirlemek, karar vermek', phonetic: '/dɪˈtɜːmɪn/', level: 'B1', partOfSpeech: 'verb', definition: 'To cause something to occur in a particular way', examples: ['Factors that determine prices.'] },
  { word: 'encourage', turkish: 'teşvik etmek', phonetic: '/ɪnˈkʌrɪdʒ/', level: 'B1', partOfSpeech: 'verb', definition: 'To give support or confidence', examples: ['Parents should encourage their children.'] },

  // A2 Kelimeleri
  { word: 'achieve', turkish: 'başarmak, elde etmek', phonetic: '/əˈtʃiːv/', level: 'A2', partOfSpeech: 'verb', definition: 'To succeed in doing something', examples: ['She achieved great success.'] },
  { word: 'improve', turkish: 'iyileştirmek', phonetic: '/ɪmˈpruːv/', level: 'A2', partOfSpeech: 'verb', definition: 'To make something better', examples: ['I want to improve my English.'] },
  { word: 'realize', turkish: 'fark etmek, anlamak', phonetic: '/ˈriːəlaɪz/', level: 'A2', partOfSpeech: 'verb', definition: 'To become aware of something', examples: ['I realized my mistake.'] },
  { word: 'develop', turkish: 'geliştirmek', phonetic: '/dɪˈveləp/', level: 'A2', partOfSpeech: 'verb', definition: 'To grow or change into something more advanced', examples: ['Children develop quickly.'] },
  { word: 'consider', turkish: 'düşünmek, göz önünde bulundurmak', phonetic: '/kənˈsɪdə/', level: 'A2', partOfSpeech: 'verb', definition: 'To think carefully about something', examples: ['Please consider my offer.'] },
];

/**
 * Kelime öneri kartı
 */
const WordSuggestionCard = ({ word, onAdd }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`flex flex-col p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{word.word}</span>
            <span className="text-xs text-gray-400">{word.phonetic}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(word.word);
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
              aria-label={`"${word.word}" kelimesini seslendir`}
              title={`"${word.word}" kelimesini seslendir`}
            >
              <Volume2 className="size-3 text-gray-400" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-brand-blue">{word.turkish}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
              {word.level}
            </span>
            <span className="text-xs text-gray-400">{word.partOfSpeech}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(word);
          }}
          className="p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          aria-label={`"${word.word}" kelimesini listeye ekle`}
          title={`"${word.word}" kelimesini ekle`}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (word.definition || word.examples) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {word.definition && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 italic">
              "{word.definition}"
            </p>
          )}
          {word.examples?.[0] && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Ex: {word.examples[0]}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hızlı kelime ekleme formu
 */
const QuickAddForm = ({ onSubmit, isLoading }) => {
  const [word, setWord] = useState('');
  const [turkish, setTurkish] = useState('');
  const [level, setLevel] = useState('B1');
  const [autoTranslate, setAutoTranslate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && turkish.trim()) {
      onSubmit({ word: word.trim(), turkish: turkish.trim(), level });
      setWord('');
      setTurkish('');
    }
  };

  // Basit otomatik çeviri simülasyonu
  useEffect(() => {
    if (autoTranslate && word.length > 2) {
      const found = SAMPLE_WORDS.find(
        w => w.word.toLowerCase() === word.toLowerCase()
      );
      if (found) {
        // Use setTimeout to avoid cascading render warning
        const timeoutId = setTimeout(() => setTurkish(found.turkish), 0);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [word, autoTranslate]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            İngilizce
          </label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="English word..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Türkçe
          </label>
          <input
            type="text"
            value={turkish}
            onChange={(e) => setTurkish(e.target.value)}
            placeholder="Türkçe anlam..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm"
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Otomatik çevir
          </label>
        </div>

        <button
          type="submit"
          disabled={!word.trim() || !turkish.trim() || isLoading}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Ekle
        </button>
      </div>
    </form>
  );
};

/**
 * Ana QuickAddWord bileşeni
 */
export default function QuickAddWord({ isOpen, onClose }) {
  const { addWord } = useUser();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState([]);

  const filteredSuggestions = SAMPLE_WORDS.filter(
    w => w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
         w.turkish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWord = useCallback(async (wordData) => {
    setIsLoading(true);
    try {
      const newWord = {
        id: `word-${Date.now()}`,
        word: wordData.word,
        turkish: wordData.turkish,
        phonetic: wordData.phonetic || '',
        partOfSpeech: wordData.partOfSpeech || '',
        definition: wordData.definition || '',
        examples: wordData.examples || [],
        level: wordData.level || 'B1',
        status: 'new',
        addedAt: new Date().toISOString(),
      };

      addWord(newWord);
      setRecentlyAdded(prev => [newWord, ...prev.slice(0, 4)]);
      toast.success(`"${wordData.word}" eklendi!`);
    } catch {
      toast.error('Kelime eklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [addWord, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hızlı Kelime Ekle" size="lg">
      <div className="space-y-6">
        {/* Hızlı ekleme formu */}
        <QuickAddForm onSubmit={handleAddWord} isLoading={isLoading} />

        {/* Arama */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kelime ara..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>

        {/* Öneriler */}
        {searchQuery && filteredSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Öneriler</h4>
            {filteredSuggestions.map((word) => (
              <WordSuggestionCard
                key={word.word}
                word={word}
                onAdd={handleAddWord}
              />
            ))}
          </div>
        )}

        {/* Son eklenenler */}
        {recentlyAdded.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Sparkles className="size-4" />
              Az önce eklendi
            </h4>
            <div className="flex flex-wrap gap-2">
              {recentlyAdded.map((word) => (
                <span
                  key={word.id}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
                >
                  {word.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Popüler kelimeler */}
        {!searchQuery && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Popüler Kelimeler</h4>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_WORDS.slice(0, 3).map((word) => (
                <WordSuggestionCard
                  key={word.word}
                  word={word}
                  onAdd={handleAddWord}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Floating Action Button (FAB) versiyonu
 */
export const QuickAddFAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 size-14 rounded-full bg-brand-blue text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center z-40"
        aria-label="Hızlı kelime ekle"
      >
        <Plus className="size-6" />
      </button>
      <QuickAddWord isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

/**
 * Küçük inline versiyon
 */
export const QuickAddInline = ({ onAdd }) => {
  const [word, setWord] = useState('');
  const [turkish, setTurkish] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && turkish.trim()) {
      onAdd({ word: word.trim(), turkish: turkish.trim() });
      setWord('');
      setTurkish('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="English"
        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm"
      />
      <input
        type="text"
        value={turkish}
        onChange={(e) => setTurkish(e.target.value)}
        placeholder="Türkçe"
        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm"
      />
      <button
        type="submit"
        disabled={!word.trim() || !turkish.trim()}
        className="px-4 py-2 bg-brand-blue text-white rounded-lg disabled:opacity-50"
      >
        <Plus className="size-4" />
      </button>
    </form>
  );
};
