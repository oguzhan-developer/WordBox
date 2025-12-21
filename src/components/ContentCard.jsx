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
                        {isNew && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
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
                <div className="space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {typeIcons[type]} {title}
                    </h3>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{readTime} dk</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{wordCount} kelime</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}</span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                        <span className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            {progress > 0 ? 'Okumaya Devam Et →' : 'Okumaya Başla →'}
                        </span>
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
