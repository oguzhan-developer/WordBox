import { supabase } from '../lib/supabaseClient';

/**
 * Service to handle data fetching from Supabase tables (news, stories, words)
 */
export const supabaseService = {
    // --- News & Stories ---

    async getContentByLevel(type, level) {
        try {
            const { data, error } = await supabase
                .from('contents')
                .select(`
                    *,
                    content_levels!inner (
                        level,
                        title,
                        content_text,
                        new_words
                    )
                `)
                .eq('type', type)
                .eq('content_levels.level', level)
                .order('published_at', { ascending: false });

            if (error) {
                return [];
            }

            return data.map(item => {
                const levelData = item.content_levels[0]; // content_levels is an array due to join
                if (!levelData) return null;

                return {
                    id: item.id,
                    slug: item.slug,
                    category: item.category,
                    categoryEn: item.category_en,
                    image: item.image,
                    publishedAt: item.published_at,
                    readTime: item.read_time_minutes,
                    views: item.views,
                    likes: item.likes,
                    title: levelData.title,
                    content: levelData.content_text,
                    newWords: levelData.new_words || [],
                    level: levelData.level,
                    type: item.type
                };
            }).filter(Boolean);
        } catch (err) {
            return [];
        }
    },

    async getContentBySlug(type, slug, level) {
        if (!slug) return null;

        try {
            // First get the content metadata
            const { data: content, error: contentError } = await supabase
                .from('contents')
                .select('*')
                .eq('slug', slug)
                .eq('type', type)
                .maybeSingle();

            if (contentError || !content) return null;

            // Then get the specific level data
            // We'll also fetch all available levels to show the switcher
            const { data: levels, error: levelsError } = await supabase
                .from('content_levels')
                .select('*')
                .eq('content_id', content.id);

            if (levelsError || !levels || levels.length === 0) return null;

            // Find requested level or fallback
            const levelData = levels.find(l => l.level === level) || levels[0];

            return {
                id: content.id,
                slug: content.slug,
                category: content.category,
                categoryEn: content.category_en,
                image: content.image,
                publishedAt: content.published_at,
                readTime: content.read_time_minutes,
                views: content.views,
                likes: content.likes,
                title: levelData.title,
                content: levelData.content_text,
                newWords: levelData.new_words || [],
                level: levelData.level,
                availableLevels: levels.map(l => l.level)
            };
        } catch (err) {
            return null;
        }
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
