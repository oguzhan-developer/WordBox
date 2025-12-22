import { useState, useCallback, memo } from 'react';
import { Volume2, Star, Trash2, BarChart2 } from 'lucide-react';
import Card from './Card';
import { LevelBadge, StatusBadge } from './Badge';
import { speak } from '../utils/speechSynthesis';
import { WordDifficultyBadge, WordProgressBar } from './WordDifficultyIndicator';

// Enhanced speech synthesis with better voice quality
const speakWord = (text) => {
    speak(text, {
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0,
        onError: (error) => {
            console.warn('Speech synthesis error:', error);
        }
    });
};

// Vocabulary Card for word list
const VocabularyCard = memo(function VocabularyCard({
    word,
    onRemove,
    onPractice,
    onToggleFavorite,
    showDetails: _showDetails = false,
}) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorite, setIsFavorite] = useState(word.isFavorite || false);

    const handlePlayAudio = useCallback((e) => {
        e.stopPropagation();
        speakWord(word.word);
    }, [word.word]);

    const handleFavorite = useCallback((e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        onToggleFavorite?.(word.id);
    }, [isFavorite, onToggleFavorite, word.id]);

    const handleRemove = useCallback((e) => {
        e.stopPropagation();
        onRemove?.(word.id);
    }, [onRemove, word.id]);

    const handleFlip = useCallback(() => {
        setIsFlipped(!isFlipped);
    }, [isFlipped]);

    return (
        <div
            className={`card-flip h-64 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
        >
            <div className="card-flip-inner relative w-full h-full">
                {/* Front Side */}
                <Card glass className="card-flip-front absolute inset-0 flex flex-col !p-5 shadow-xl hover:shadow-2xl transition-all">
                    {/* Top bar */}
                    <div className="flex items-center justify-between flex-shrink-0 mb-3">
                        <LevelBadge level={word.level} size="sm" />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePlayAudio}
                                className="size-9 rounded-xl glass hover:bg-indigo-500/20 transition-all hover:scale-110 flex items-center justify-center"
                            >
                                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </button>
                            <button
                                onClick={handleFavorite}
                                className="size-9 rounded-xl glass hover:bg-yellow-500/20 transition-all hover:scale-110 flex items-center justify-center"
                            >
                                <Star className={`w-4 h-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Word */}
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 truncate max-w-full px-2">{word.word}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate max-w-full">{word.phonetic}</p>
                        <span className="mt-2 px-3 py-1 text-xs glass rounded-full text-gray-700 dark:text-gray-300 truncate max-w-full">{word.partOfSpeech}</span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between flex-shrink-0 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <StatusBadge status={word.status || 'new'} />
                            <WordDifficultyBadge wordId={word.id || word.word} size="xs" showLabel={false} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Çevirmek için tıkla</span>
                    </div>
                </Card>

                {/* Back Side */}
                <Card glass className="card-flip-back absolute inset-0 flex flex-col !p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 shadow-xl">
                    {/* Turkish meaning */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">{word.turkish}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{word.definition}</p>
                    </div>

                    {/* Example sentence */}
                    {word.examples && word.examples[0] && (
                        <div className="p-3 glass rounded-xl mb-3 shadow-lg">
                            <p className="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-2">
                                "{word.examples[0]}"
                            </p>
                        </div>
                    )}

                    {/* SRS Progress */}
                    <div className="mb-3 px-1">
                        <WordProgressBar wordId={word.id || word.word} showBox={true} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPractice?.(word);
                            }}
                            className="px-4 py-2 gradient-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5"
                        >
                            Pratik Yap
                        </button>
                        <button
                            onClick={handleRemove}
                            className="size-10 rounded-xl glass hover:bg-red-500/20 transition-all hover:scale-110 flex items-center justify-center"
                        >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
});

export default VocabularyCard;

// Vocabulary List Item (for list view)
export const VocabularyListItem = memo(function VocabularyListItem({
    word,
    onRemove,
    onSelect,
    isSelected = false,
}) {
    const handlePlayAudio = useCallback((e) => {
        e.stopPropagation();
        speakWord(word.word);
    }, [word.word]);

    return (
        <div
            className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer
        ${isSelected
                    ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                    : 'border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                }
      `}
            onClick={() => onSelect?.(word)}
        >
            {/* Checkbox */}
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect?.(word)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600 dark:checked:border-indigo-600"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Word info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{word.word}</span>
                    <button
                        onClick={handlePlayAudio}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <Volume2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{word.turkish}</p>
            </div>

            {/* Level & Status */}
            <div className="hidden sm:flex items-center gap-2">
                <LevelBadge level={word.level} size="sm" />
                <StatusBadge status={word.status || 'new'} />
            </div>

            {/* Practice count */}
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <BarChart2 className="w-4 h-4" />
                <span>{word.practiceCount || 0}</span>
            </div>

            {/* Remove button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(word.id);
                }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
                <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400" />
            </button>
        </div>
    );
});

// Word Preview Card (for sidebar details)
export const WordDetailCard = memo(function WordDetailCard({ word, onClose: _onClose, onPractice, onRemove }) {
    const handlePlayAudio = useCallback(() => {
        speakWord(word.word);
    }, [word.word]);

    return (
        <Card className="sticky top-24 dark:bg-gray-800 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{word.word}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 dark:text-gray-400">{word.phonetic}</span>
                        <button
                            onClick={handlePlayAudio}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                    </div>
                </div>
                <LevelBadge level={word.level} />
            </div>

            {/* Part of speech */}
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">{word.partOfSpeech}</span>

            {/* Meanings */}
            <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2">
                    <span className="text-lg">🇹🇷</span>
                    <p className="font-medium text-gray-900 dark:text-white">{word.turkish}</p>
                </div>
                <div className="flex items-start gap-2">
                    <span className="text-lg">🇬🇧</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{word.definition}</p>
                </div>
            </div>

            {/* Synonyms */}
            {word.synonyms && word.synonyms.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase mb-2">Eş Anlamlılar</p>
                    <div className="flex flex-wrap gap-2">
                        {word.synonyms.map((syn, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
                                {syn}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Examples */}
            {word.examples && word.examples.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase mb-2">Örnek Cümleler</p>
                    <div className="space-y-2">
                        {word.examples.slice(0, 2).map((example, i) => (
                            <p key={i} className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                "{example}"
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{word.practiceCount || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pratik</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {word.correctCount || 0}/{word.practiceCount || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Doğru</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => onPractice?.(word)}
                    className="flex-1 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                    Pratik Yap
                </button>
                <button
                    onClick={() => onRemove?.(word.id)}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </Card>
    );
});
