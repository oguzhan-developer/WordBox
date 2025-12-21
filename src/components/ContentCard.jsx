import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Eye, Bookmark } from 'lucide-react';
import Card from './Card';
import { LevelBadge, CategoryBadge } from './Badge';
import { isBookmarked, toggleBookmark } from '../utils/bookmarks';
import { getReadingTimeInfo, getReadingTimeEmoji } from '../utils/readingTime';
import { useUser } from '../context/UserContext';

// Content Card for news, stories, and novels
export default function ContentCard({
    id,
    slug,
    title,
    image,
    category,
    level,
    readTime,
    wordCount,
    views,
    publishedAt,
    progress = 0,
    isNew = false,
    isRead = false,
    type = 'news', // news, story, novel
}) {
    const { user } = useUser();
    const [bookmarked, setBookmarked] = useState(false);
    
    // Calculate personalized reading time
    const readingInfo = getReadingTimeInfo(wordCount, user?.level || 'B1', level);
    const timeEmoji = getReadingTimeEmoji(readingInfo.minutes);
    
    // Check bookmark status on mount
    useEffect(() => {
        setBookmarked(isBookmarked(id));
    }, [id]);
    
    // Handle bookmark toggle
    const handleBookmarkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const content = { id, title, type, level, thumbnail: image };
        const newState = toggleBookmark(content);
        setBookmarked(newState);
    };
    
    const typeIcons = {
        news: '📰',
        story: '😄',
        novel: '📚',
    };

    return (
        <Link to={`/read/${slug || id}?level=${level}`}>
            <Card glass hover className="h-full overflow-hidden group shadow-xl hover:shadow-2xl">
                {/* Image */}
                <div className="relative -m-6 mb-5">
                    <div className="aspect-video overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Overlays */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <CategoryBadge category={category} />
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        {/* Bookmark Button */}
                        <button
                            onClick={handleBookmarkClick}
                            className={`p-2 rounded-xl glass shadow-lg transition-all hover:scale-110 ${
                                bookmarked 
                                    ? 'text-pink-600 dark:text-pink-400' 
                                    : 'text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400'
                            }`}
                            aria-label={bookmarked ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        >
                            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                        </button>
                        {isRead && (
                            <span className="px-3 py-1.5 glass text-green-600 dark:text-green-400 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg">
                                <span>OKUNDU</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        )}
                        {isNew && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                                YENİ
                            </span>
                        )}
                        <LevelBadge level={level} />
                    </div>

                    {/* Progress bar if started */}
                    {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 glass">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    {/* Title - fixed height for alignment, truncate with ellipsis */}
                    <h3 
                        className="font-bold text-gray-900 dark:text-white line-clamp-2 overflow-hidden group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all text-lg leading-tight h-[3rem]"
                        title={title}
                    >
                        {typeIcons[type]} {title}
                    </h3>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 font-semibold mt-3">
                        <div className="flex items-center gap-1.5" title={`Tahmini okuma süresi (${user?.level || 'B1'} seviyesi için)`}>
                            <span>{timeEmoji}</span>
                            <Clock className="w-4 h-4" />
                            <span>{readingInfo.formatted}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            <span>{wordCount} kelime</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold ${readingInfo.difficultyColor}`} title="Zorluk seviyenize göre">
                            <span>{readingInfo.difficultyLabel}</span>
                        </div>
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1 min-h-[1rem]"></div>

                    {/* Action Button */}
                    <div className="pt-3">
                        <div className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${isRead
                            ? 'glass text-gray-800 dark:text-gray-200 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            : 'gradient-primary text-white group-hover:shadow-indigo-500/50 group-hover:-translate-y-0.5'
                            }`}>
                            {isRead ? 'Tekrar Oku' : (progress > 0 ? 'Okumaya Devam Et' : 'Okumaya Başla')}
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

// Compact Content Card (for carousels)
export function ContentCardCompact({
    id,
    slug,
    title,
    image,
    level,
    readTime,
}) {
    return (
        <Link to={`/read/${slug || id}?level=${level}`}>
            <div className="flex-shrink-0 w-48 sm:w-56 group">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                        <LevelBadge level={level} size="xs" />
                    </div>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{readTime} dk okuma</p>
            </div>
        </Link>
    );
}

// Featured Content Card (larger, for hero section)
export function ContentCardFeatured({
    id,
    slug,
    title,
    image,
    category,
    level,
    readTime,
    wordCount,
    description,
}) {
    return (
        <Link to={`/read/${slug || id}?level=${level}`}>
            <Card hover className="overflow-hidden group">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="lg:w-1/2">
                        <div className="relative aspect-video lg:aspect-[4/3] rounded-xl overflow-hidden">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <CategoryBadge category={category} />
                                <LevelBadge level={level} />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-1/2 flex flex-col justify-center">
                        <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">📰 Günün Haberi</span>
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-gray-500 dark:text-gray-400">{readTime} dk</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-gray-500 dark:text-gray-400">{wordCount} yeni kelime</span>
                            </div>
                        </div>
                        <button className="self-start px-6 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity">
                            Okumaya Başla
                        </button>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
