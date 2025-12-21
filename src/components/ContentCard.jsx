import { Link } from 'react-router-dom';
import { Clock, BookOpen, Eye } from 'lucide-react';
import Card from './Card';
import { LevelBadge, CategoryBadge } from './Badge';

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
    const typeIcons = {
        news: '📰',
        story: '😄',
        novel: '📚',
    };

    return (
        <Link to={`/read/${slug || id}?level=${level}`}>
            <Card hover className="h-full overflow-hidden group">
                {/* Image */}
                <div className="relative -m-4 sm:-m-5 mb-4">
                    <div className="aspect-video overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Overlays */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <CategoryBadge category={category} />
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                        {isRead && (
                            <span className="px-2 py-1 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg border border-white/20">
                                <span>OKUNDU</span>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        )}
                        {isNew && (
                            <span className="px-2 py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full animate-pulse shadow-lg border border-white/20">
                                YENİ
                            </span>
                        )}
                        <LevelBadge level={level} />
                    </div>

                    {/* Progress bar if started */}
                    {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                            <div
                                className="h-full bg-indigo-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-4 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-lg leading-tight">
                        {typeIcons[type]} {title}
                    </h3>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{readTime} dk</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{wordCount} kelime</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 mt-auto">
                        <div className={`w-full py-2.5 rounded-xl font-bold text-sm text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${isRead
                            ? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 group-hover:border-indigo-200'
                            : 'bg-white dark:bg-[#18181b] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-indigo-200 dark:group-hover:shadow-none'
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
