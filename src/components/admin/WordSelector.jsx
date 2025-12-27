import { useState, useEffect } from 'react';
import { Search, Plus, ChevronUp, ChevronDown, X, RefreshCw } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { useToast } from '../Toast';

/**
 * Kelime Arama ve Ekleme Bileşeni
 * Var olan kelimeler arasında arama yapıp ekleme yapar
 */
function WordSelector({ selectedWords, onChange, disabled = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const toast = useToast();

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const results = await supabaseService.searchWords(searchQuery, { limit: 10 });
                    // Zaten ekli olanları filtrele
                    const filteredResults = results.filter(
                        word => !selectedWords.some(sw => sw.id === word.id)
                    );
                    setSearchResults(filteredResults);
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedWords]);

    const handleAddWord = (word) => {
        const newSelectedWords = [...selectedWords, word];
        onChange(newSelectedWords);
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
        toast.success(`"${word.word}" eklendi`);
    };

    const handleRemoveWord = (wordId) => {
        const newSelectedWords = selectedWords.filter(w => w.id !== wordId);
        onChange(newSelectedWords);
    };

    const handleMoveWord = (index, direction) => {
        const newWords = [...selectedWords];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newWords.length) return;
        [newWords[index], newWords[newIndex]] = [newWords[newIndex], newWords[index]];
        onChange(newWords);
    };

    return (
        <div className="space-y-3">
            {/* Eklenen Kelimeler Listesi */}
            {selectedWords.length > 0 && (
                <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 grid grid-cols-12 gap-2">
                        <span className="col-span-1">#</span>
                        <span className="col-span-3">Kelime</span>
                        <span className="col-span-3">Türkçe</span>
                        <span className="col-span-3">Seviye</span>
                        <span className="col-span-2 text-right">İşlem</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-700 max-h-64 overflow-y-auto">
                        {selectedWords.map((word, index) => (
                            <div key={word.id} className="px-3 py-2 text-sm grid grid-cols-12 gap-2 items-center hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <span className="col-span-1 text-gray-400">{index + 1}</span>
                                <span className="col-span-3 font-medium text-gray-900 dark:text-white truncate">
                                    {word.word}
                                </span>
                                <span className="col-span-3 text-gray-600 dark:text-gray-400 truncate">
                                    {word.meaningsTr?.[0] || word.turkish || '-'}
                                </span>
                                <span className="col-span-3">
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                        word.level === 'A1' ? 'bg-green-100 text-green-700' :
                                        word.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                                        word.level === 'B1' ? 'bg-yellow-100 text-yellow-700' :
                                        word.level === 'B2' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {word.level}
                                    </span>
                                </span>
                                <div className="col-span-2 flex justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleMoveWord(index, -1)}
                                        disabled={index === 0 || disabled}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleMoveWord(index, 1)}
                                        disabled={index === selectedWords.length - 1 || disabled}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWord(word.id)}
                                        disabled={disabled}
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Kelime Sayısı */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Toplam: {selectedWords.length} kelime
            </div>

            {/* Kelime Arama */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Kelime ara... (min 2 karakter)"
                            disabled={disabled}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        />
                        {isSearching && (
                            <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                        )}
                    </div>
                </div>

                {/* Arama Sonuçları Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(word => (
                            <button
                                key={word.id}
                                type="button"
                                onClick={() => handleAddWord(word)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between"
                            >
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">{word.word}</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                                        - {word.meaningsTr?.[0] || word.turkish || 'Anlam yok'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                        word.level === 'A1' ? 'bg-green-100 text-green-700' :
                                        word.level === 'A2' ? 'bg-blue-100 text-blue-700' :
                                        word.level === 'B1' ? 'bg-yellow-100 text-yellow-700' :
                                        word.level === 'B2' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {word.level}
                                    </span>
                                    <Plus className="w-4 h-4 text-green-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        Kelime bulunamadı. Önce "Kelimeler" sekmesinden ekleyin.
                    </div>
                )}
            </div>

            {/* Bilgi */}
            <p className="text-xs text-gray-400 dark:text-gray-500">
                💡 Kelimeler "Kelimeler" sekmesinden eklenir. Burada var olan kelimeler arasından seçim yapılır.
            </p>
        </div>
    );
}

export default WordSelector;
