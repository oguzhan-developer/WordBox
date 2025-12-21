import { supabase } from '../lib/supabaseClient';

/**
 * Service to handle data fetching from Supabase tables (news, stories, words)
 * Updated for separate news and stories tables
 */
export const supabaseService = {
    // --- NEWS ---

    async getNewsByLevel(level) {
        try {
            const { data, error } = await supabase
                .from('news')
                .select(`
                    *,
                    news_levels!inner (
                        level,
                        title,
                        subtitle,
                        summary,
                        content_text,
                        new_words,
                        key_phrases,
                        comprehension_questions,
                        word_count
                    ),
                    news_categories (
                        name,
                        name_en,
                        slug,
                        icon,
                        color
                    )
                `)
                .eq('news_levels.level', level)
                .eq('is_published', true)
                .order('published_at', { ascending: false });

            if (error) {
                console.error('Error fetching news:', error);
                return [];
            }

            return data.map(item => {
                const levelData = item.news_levels[0];
                if (!levelData) return null;

                const category = item.news_categories;

                return {
                    id: item.id,
                    slug: item.slug,
                    category: category?.name || '',
                    categoryEn: category?.name_en || '',
                    categorySlug: category?.slug || '',
                    categoryIcon: category?.icon || '',
                    categoryColor: category?.color || '',
                    image: item.image,
                    publishedAt: item.published_at,
                    readTime: item.read_time_minutes,
                    views: item.views,
                    likes: item.likes,
                    bookmarks: item.bookmarks,
                    title: levelData.title,
                    subtitle: levelData.subtitle,
                    summary: levelData.summary,
                    content: levelData.content_text,
                    newWords: levelData.new_words || [],
                    keyPhrases: levelData.key_phrases || [],
                    comprehensionQuestions: levelData.comprehension_questions || [],
                    wordCount: levelData.word_count || 0,
                    level: levelData.level,
                    type: 'news'
                };
            }).filter(Boolean);
        } catch (err) {
            console.error('Error in getNewsByLevel:', err);
            return [];
        }
    },

    async getNewsBySlug(slug, level) {
        if (!slug) return null;

        try {
            // Get the news metadata
            const { data: news, error: newsError } = await supabase
                .from('news')
                .select(`
                    *,
                    news_categories (
                        name,
                        name_en,
                        slug,
                        icon,
                        color
                    )
                `)
                .eq('slug', slug)
                .eq('is_published', true)
                .maybeSingle();

            if (newsError || !news) return null;

            // Get all available levels for this news
            const { data: levels, error: levelsError } = await supabase
                .from('news_levels')
                .select('*')
                .eq('news_id', news.id);

            if (levelsError || !levels || levels.length === 0) return null;

            // Find requested level or fallback
            const levelData = levels.find(l => l.level === level) || levels[0];
            const category = news.news_categories;

            return {
                id: news.id,
                slug: news.slug,
                category: category?.name || '',
                categoryEn: category?.name_en || '',
                categorySlug: category?.slug || '',
                categoryIcon: category?.icon || '',
                categoryColor: category?.color || '',
                image: news.image,
                publishedAt: news.published_at,
                readTime: news.read_time_minutes,
                views: news.views,
                likes: news.likes,
                bookmarks: news.bookmarks,
                title: levelData.title,
                subtitle: levelData.subtitle,
                summary: levelData.summary,
                content: levelData.content_text,
                newWords: levelData.new_words || [],
                keyPhrases: levelData.key_phrases || [],
                comprehensionQuestions: levelData.comprehension_questions || [],
                wordCount: levelData.word_count || 0,
                level: levelData.level,
                availableLevels: levels.map(l => l.level),
                type: 'news'
            };
        } catch (err) {
            console.error('Error in getNewsBySlug:', err);
            return null;
        }
    },

    // --- STORIES ---

    async getStoriesByLevel(level) {
        try {
            const { data, error } = await supabase
                .from('stories')
                .select(`
                    *,
                    story_levels!inner (
                        level,
                        title,
                        subtitle,
                        summary,
                        content_text,
                        new_words,
                        key_phrases,
                        comprehension_questions,
                        word_count
                    ),
                    story_categories (
                        name,
                        name_en,
                        slug,
                        icon,
                        color
                    )
                `)
                .eq('story_levels.level', level)
                .eq('is_published', true)
                .order('published_at', { ascending: false });

            if (error) {
                console.error('Error fetching stories:', error);
                return [];
            }

            return data.map(item => {
                const levelData = item.story_levels[0];
                if (!levelData) return null;

                const category = item.story_categories;

                return {
                    id: item.id,
                    slug: item.slug,
                    category: category?.name || '',
                    categoryEn: category?.name_en || '',
                    categorySlug: category?.slug || '',
                    categoryIcon: category?.icon || '',
                    categoryColor: category?.color || '',
                    image: item.image,
                    publishedAt: item.published_at,
                    readTime: item.read_time_minutes,
                    views: item.views,
                    likes: item.likes,
                    bookmarks: item.bookmarks,
                    title: levelData.title,
                    subtitle: levelData.subtitle,
                    summary: levelData.summary,
                    content: levelData.content_text,
                    newWords: levelData.new_words || [],
                    keyPhrases: levelData.key_phrases || [],
                    comprehensionQuestions: levelData.comprehension_questions || [],
                    wordCount: levelData.word_count || 0,
                    level: levelData.level,
                    type: 'story'
                };
            }).filter(Boolean);
        } catch (err) {
            console.error('Error in getStoriesByLevel:', err);
            return [];
        }
    },

    async getStoryBySlug(slug, level) {
        if (!slug) return null;

        try {
            // Get the story metadata
            const { data: story, error: storyError } = await supabase
                .from('stories')
                .select(`
                    *,
                    story_categories (
                        name,
                        name_en,
                        slug,
                        icon,
                        color
                    )
                `)
                .eq('slug', slug)
                .eq('is_published', true)
                .maybeSingle();

            if (storyError || !story) return null;

            // Get all available levels for this story
            const { data: levels, error: levelsError } = await supabase
                .from('story_levels')
                .select('*')
                .eq('story_id', story.id);

            if (levelsError || !levels || levels.length === 0) return null;

            // Find requested level or fallback
            const levelData = levels.find(l => l.level === level) || levels[0];
            const category = story.story_categories;

            return {
                id: story.id,
                slug: story.slug,
                category: category?.name || '',
                categoryEn: category?.name_en || '',
                categorySlug: category?.slug || '',
                categoryIcon: category?.icon || '',
                categoryColor: category?.color || '',
                image: story.image,
                publishedAt: story.published_at,
                readTime: story.read_time_minutes,
                views: story.views,
                likes: story.likes,
                bookmarks: story.bookmarks,
                title: levelData.title,
                subtitle: levelData.subtitle,
                summary: levelData.summary,
                content: levelData.content_text,
                newWords: levelData.new_words || [],
                keyPhrases: levelData.key_phrases || [],
                comprehensionQuestions: levelData.comprehension_questions || [],
                wordCount: levelData.word_count || 0,
                level: levelData.level,
                availableLevels: levels.map(l => l.level),
                type: 'story'
            };
        } catch (err) {
            console.error('Error in getStoryBySlug:', err);
            return null;
        }
    },

    // --- LEGACY COMPATIBILITY ---
    // Keep old function names for backwards compatibility
    async getContentByLevel(type, level) {
        if (type === 'news') {
            return this.getNewsByLevel(level);
        } else if (type === 'story') {
            return this.getStoriesByLevel(level);
        }
        return [];
    },

    async getContentBySlug(type, slug, level) {
        if (type === 'news') {
            return this.getNewsBySlug(slug, level);
        } else if (type === 'story') {
            return this.getStoryBySlug(slug, level);
        }
        return null;
    },

    // --- Words ---

    async getWordsByLevel(level) {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('level', level);

        if (error) {
            return [];
        }
        return data;
    },

    async searchWords(query) {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .or(`word.ilike.%${query}%,turkish.ilike.%${query}%,definition.ilike.%${query}%`);

        if (error) {
            console.error('Error searching words:', error);
            return [];
        }
        return data;
    },

    async getRandomWords(count = 10, level = null) {
        let query = supabase.from('words').select('*');
        if (level) query = query.eq('level', level);

        const { data, error } = await query;

        if (error) {
            return [];
        }

        return data.sort(() => Math.random() - 0.5).slice(0, count);
    }
};
