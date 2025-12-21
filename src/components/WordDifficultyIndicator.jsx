import { useMemo } from 'react';
import { getSrsData, BOX_LABELS, BOX_COLORS } from '../utils/spacedRepetition';

/**
 * Word Difficulty Indicator Component
 * Shows the difficulty level of a word based on SRS data and user performance
 */

// Difficulty levels based on performance
const DIFFICULTY_LEVELS = {
    mastered: { label: 'Ustalaşmış', color: 'text-green-500', bg: 'bg-green-500', icon: '🏆' },
    easy: { label: 'Kolay', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: '😊' },
    normal: { label: 'Normal', color: 'text-blue-500', bg: 'bg-blue-500', icon: '📚' },
    challenging: { label: 'Zorlu', color: 'text-orange-500', bg: 'bg-orange-500', icon: '💪' },
    hard: { label: 'Zor', color: 'text-red-500', bg: 'bg-red-500', icon: '🔥' },
    unknown: { label: 'Yeni', color: 'text-gray-500', bg: 'bg-gray-500', icon: '✨' },
};

/**
 * Calculate difficulty based on SRS data
 * @param {Object} srsEntry - SRS data for the word
 * @returns {Object} Difficulty info
 */
function calculateDifficulty(srsEntry) {
    if (!srsEntry || srsEntry.reviewCount === 0) {
        return DIFFICULTY_LEVELS.unknown;
    }
    
    const { box, correctCount, reviewCount, streak } = srsEntry;
    const accuracy = reviewCount > 0 ? (correctCount / reviewCount) * 100 : 0;
    
    // Mastered: Box 6 with high accuracy
    if (box >= 6 && accuracy >= 90) {
        return DIFFICULTY_LEVELS.mastered;
    }
    
    // Easy: Box 4-5 with good accuracy or high streak
    if ((box >= 4 && accuracy >= 80) || streak >= 5) {
        return DIFFICULTY_LEVELS.easy;
    }
    
    // Normal: Box 2-3 with average accuracy
    if (box >= 2 && accuracy >= 60) {
        return DIFFICULTY_LEVELS.normal;
    }
    
    // Challenging: Low box or low accuracy
    if (box <= 2 && accuracy < 60 && accuracy >= 40) {
        return DIFFICULTY_LEVELS.challenging;
    }
    
    // Hard: Box 1 with very low accuracy
    if (accuracy < 40) {
        return DIFFICULTY_LEVELS.hard;
    }
    
    return DIFFICULTY_LEVELS.normal;
}

/**
 * Word Difficulty Indicator - Badge version
 */
export function WordDifficultyBadge({ wordId, size = 'sm', showLabel = true }) {
    const srsData = useMemo(() => getSrsData(), []);
    const srsEntry = srsData[wordId];
    const difficulty = useMemo(() => calculateDifficulty(srsEntry), [srsEntry]);
    
    const sizeClasses = {
        xs: 'text-[10px] px-1.5 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
    };
    
    return (
        <span 
            className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClasses[size]} ${difficulty.bg}/10 ${difficulty.color}`}
            title={`Zorluk: ${difficulty.label}`}
        >
            <span>{difficulty.icon}</span>
            {showLabel && <span>{difficulty.label}</span>}
        </span>
    );
}

/**
 * Word Progress Bar - Shows SRS box progress
 */
export function WordProgressBar({ wordId, showBox = true }) {
    const srsData = useMemo(() => getSrsData(), []);
    const srsEntry = srsData[wordId] || { box: 1, reviewCount: 0 };
    const box = srsEntry.box || 1;
    const progress = ((box - 1) / 5) * 100;
    
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all ${BOX_COLORS[box]}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {showBox && (
                <span className={`text-[10px] font-bold ${BOX_COLORS[box].replace('bg-', 'text-')}`}>
                    {BOX_LABELS[box]}
                </span>
            )}
        </div>
    );
}

/**
 * Word Stats Mini - Shows quick stats
 */
export function WordStatsMini({ wordId }) {
    const srsData = useMemo(() => getSrsData(), []);
    const srsEntry = srsData[wordId] || { box: 1, reviewCount: 0, correctCount: 0, streak: 0 };
    const accuracy = srsEntry.reviewCount > 0 
        ? Math.round((srsEntry.correctCount / srsEntry.reviewCount) * 100) 
        : 0;
    
    if (srsEntry.reviewCount === 0) {
        return (
            <span className="text-xs text-gray-400">Henüz pratik yapılmadı</span>
        );
    }
    
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-600 dark:text-gray-400">
                {srsEntry.reviewCount} tekrar
            </span>
            <span className={accuracy >= 70 ? 'text-green-500' : accuracy >= 50 ? 'text-orange-500' : 'text-red-500'}>
                %{accuracy} doğru
            </span>
            {srsEntry.streak > 0 && (
                <span className="text-orange-500 flex items-center gap-0.5">
                    🔥 {srsEntry.streak}
                </span>
            )}
        </div>
    );
}

/**
 * Full Word Difficulty Card
 */
export function WordDifficultyCard({ wordId, word }) {
    const srsData = useMemo(() => getSrsData(), []);
    const srsEntry = srsData[wordId] || { box: 1, reviewCount: 0, correctCount: 0, streak: 0 };
    const difficulty = useMemo(() => calculateDifficulty(srsEntry), [srsEntry]);
    const accuracy = srsEntry.reviewCount > 0 
        ? Math.round((srsEntry.correctCount / srsEntry.reviewCount) * 100) 
        : 0;
    
    return (
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Zorluk Analizi</span>
                <WordDifficultyBadge wordId={wordId} size="sm" />
            </div>
            
            <WordProgressBar wordId={wordId} />
            
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{srsEntry.reviewCount}</p>
                    <p className="text-[10px] text-gray-500">Tekrar</p>
                </div>
                <div>
                    <p className={`text-lg font-bold ${accuracy >= 70 ? 'text-green-500' : accuracy >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                        {accuracy}%
                    </p>
                    <p className="text-[10px] text-gray-500">Başarı</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-orange-500">{srsEntry.streak}</p>
                    <p className="text-[10px] text-gray-500">Seri</p>
                </div>
            </div>
        </div>
    );
}

export default {
    WordDifficultyBadge,
    WordProgressBar,
    WordStatsMini,
    WordDifficultyCard,
    calculateDifficulty,
    DIFFICULTY_LEVELS
};
