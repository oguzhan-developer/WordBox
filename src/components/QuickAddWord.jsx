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
  { word: 'serendipity', turkish: 'beklenmedik güzel keşif', phonetic: '/ˌserənˈdɪpɪti/', level: 'C1', partOfSpeech: 'noun' },
  { word: 'ephemeral', turkish: 'geçici, kısa ömürlü', phonetic: '/ɪˈfemərəl/', level: 'C1', partOfSpeech: 'adjective' },
  { word: 'ubiquitous', turkish: 'her yerde bulunan', phonetic: '/juːˈbɪkwɪtəs/', level: 'C1', partOfSpeech: 'adjective' },
  { word: 'eloquent', turkish: 'belagatli, etkileyici konuşan', phonetic: '/ˈeləkwənt/', level: 'B2', partOfSpeech: 'adjective' },
  { word: 'resilient', turkish: 'dayanıklı, çabuk toparlanan', phonetic: '/rɪˈzɪliənt/', level: 'B2', partOfSpeech: 'adjective' },
];

/**
 * Kelime öneri kartı
 */
const WordSuggestionCard = ({ word, onAdd }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white">{word.word}</span>
          <span className="text-xs text-gray-400">{word.phonetic}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(word.word);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10"
          >
            <Volume2 className="size-3 text-gray-400" />
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
        onClick={() => onAdd(word)}
        className="p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="size-4" />
      </button>
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
        setTurkish(found.turkish);
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
    } catch (error) {
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
