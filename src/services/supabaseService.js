import { supabase } from '../lib/supabaseClient';

/**
 * WordBox Supabase Service
 * =========================
 * Tüm veritabanı işlemleri bu servis üzerinden yapılır.
 * 
 * MİMARİ KURALLARI:
 * - Words tablosu tek kaynak (Single Source of Truth)
 * - Kelimeler ASLA news/stories tablolarında tutulmaz
 * - İlişkiler junction tablolarıyla (news_words, story_words) kurulur
 * - Tüm değişkenler camelCase
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
                        id,
                        level,
                        title,
                        subtitle,
                        summary,
                        content_text,
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

            // Her haber için kelimeleri junction tablosundan çek
            const results = await Promise.all(data.map(async (item) => {
                const levelData = item.news_levels[0];
                if (!levelData) return null;

                // Kelimeleri words tablosundan çek (junction table üzerinden)
                const newWords = await this.getWordsForNewsLevel(levelData.id);

                const category = item.news_categories;
                
                const contentWordCount = levelData.content_text 
                    ? levelData.content_text.split(/\s+/).filter(Boolean).length 
                    : 0;

                return {
                    id: item.id,
                    newsLevelId: levelData.id,
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
                    newWords: newWords,
                    keyPhrases: levelData.key_phrases || [],
                    comprehensionQuestions: levelData.comprehension_questions || [],
                    wordCount: levelData.word_count || contentWordCount,
                    level: levelData.level,
                    type: 'news'
                };
            }));

            return results.filter(Boolean);
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
            
            // Kelimeleri junction tablosundan çek
            const newWords = await this.getWordsForNewsLevel(levelData.id);
            
            const category = news.news_categories;
            
            const contentWordCount = levelData.content_text 
                ? levelData.content_text.split(/\s+/).filter(Boolean).length 
                : 0;

            return {
                id: news.id,
                newsLevelId: levelData.id,
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
                newWords: newWords,
                keyPhrases: levelData.key_phrases || [],
                comprehensionQuestions: levelData.comprehension_questions || [],
                wordCount: levelData.word_count || contentWordCount,
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
                        id,
                        level,
                        title,
                        subtitle,
                        summary,
                        content_text,
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

            // Her hikaye için kelimeleri junction tablosundan çek
            const results = await Promise.all(data.map(async (item) => {
                const levelData = item.story_levels[0];
                if (!levelData) return null;

                // Kelimeleri words tablosundan çek (junction table üzerinden)
                const newWords = await this.getWordsForStoryLevel(levelData.id);

                const category = item.story_categories;
                
                const contentWordCount = levelData.content_text 
                    ? levelData.content_text.split(/\s+/).filter(Boolean).length 
                    : 0;

                return {
                    id: item.id,
                    storyLevelId: levelData.id,
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
                    newWords: newWords,
                    keyPhrases: levelData.key_phrases || [],
                    comprehensionQuestions: levelData.comprehension_questions || [],
                    wordCount: levelData.word_count || contentWordCount,
                    level: levelData.level,
                    type: 'story'
                };
            }));

            return results.filter(Boolean);
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
            
            // Kelimeleri junction tablosundan çek
            const newWords = await this.getWordsForStoryLevel(levelData.id);
            
            const category = story.story_categories;
            
            const contentWordCount = levelData.content_text 
                ? levelData.content_text.split(/\s+/).filter(Boolean).length 
                : 0;

            return {
                id: story.id,
                storyLevelId: levelData.id,
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
                newWords: newWords,
                keyPhrases: levelData.key_phrases || [],
                comprehensionQuestions: levelData.comprehension_questions || [],
                wordCount: levelData.word_count || contentWordCount,
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

    /**
     * Tüm kelimeleri getir (pagination destekli)
     */
    async getAllWords(options = {}) {
        const { page = 1, limit = 50, level = null, search = null } = options;
        const offset = (page - 1) * limit;

        try {
            let query = supabase
                .from('words')
                .select('*', { count: 'exact' });

            if (level) {
                query = query.eq('level', level);
            }

            if (search) {
                query = query.or(`word.ilike.%${search}%,meanings_tr.cs.["${search}"]`);
            }

            query = query
                .order('word', { ascending: true })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching words:', error);
                return { words: [], total: 0 };
            }

            return { 
                words: data.map(this.normalizeWord), 
                total: count 
            };
        } catch (err) {
            console.error('Error in getAllWords:', err);
            return { words: [], total: 0 };
        }
    },

    /**
     * Kelime ID'ye göre getir
     */
    async getWordById(wordId) {
        try {
            const { data, error } = await supabase
                .from('words')
                .select('*')
                .eq('id', wordId)
                .single();

            if (error) {
                console.error('Error fetching word:', error);
                return null;
            }

            return this.normalizeWord(data);
        } catch (err) {
            console.error('Error in getWordById:', err);
            return null;
        }
    },

    /**
     * Kelime ara (arama terimi ile)
     */
    async searchWords(query, options = {}) {
        const { limit = 20 } = options;

        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('words')
                .select('*')
                .or(`word.ilike.%${query}%,meanings_tr.cs.["${query}"]`)
                .order('frequency_rank', { ascending: true, nullsFirst: false })
                .limit(limit);

            if (error) {
                console.error('Error searching words:', error);
                return [];
            }

            return data.map(this.normalizeWord);
        } catch (err) {
            console.error('Error in searchWords:', err);
            return [];
        }
    },

    /**
     * Seviyeye göre kelimeleri getir
     */
    async getWordsByLevel(level) {
        try {
            const { data, error } = await supabase
                .from('words')
                .select('*')
                .eq('level', level)
                .order('frequency_rank', { ascending: true, nullsFirst: false });

            if (error) {
                console.error('Error fetching words by level:', error);
                return [];
            }

            return data.map(this.normalizeWord);
        } catch (err) {
            console.error('Error in getWordsByLevel:', err);
            return [];
        }
    },

    /**
     * Rastgele kelimeler getir (quiz için)
     */
    async getRandomWords(count = 10, level = null) {
        try {
            let query = supabase.from('words').select('*');
            
            if (level) {
                query = query.eq('level', level);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching random words:', error);
                return [];
            }

            // Shuffle ve limit
            const shuffled = data.sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count).map(this.normalizeWord);
        } catch (err) {
            console.error('Error in getRandomWords:', err);
            return [];
        }
    },

    /**
     * Yeni kelime ekle
     */
    async createWord(wordData) {
        try {
            const insertData = {
                word: wordData.word?.trim().toLowerCase(),
                phonetic: wordData.phonetic || null,
                part_of_speech: wordData.partOfSpeech || null,
                level: wordData.level || 'B1',
                meanings_tr: wordData.meaningsTr || [],
                definitions_en: wordData.definitionsEn || [],
                examples_en: wordData.examplesEn || [],
                examples_tr: wordData.examplesTr || [],
                synonyms: wordData.synonyms || [],
                antonyms: wordData.antonyms || [],
                related_words: wordData.relatedWords || [],
                usage_notes: wordData.usageNotes || null,
                common_mistakes: wordData.commonMistakes || null,
                image_url: wordData.imageUrl || null,
                audio_url: wordData.audioUrl || null,
                frequency_rank: wordData.frequencyRank || null,
                is_common: wordData.isCommon ?? true,
                tags: wordData.tags || []
            };

            const { data, error } = await supabase
                .from('words')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('Error creating word:', error);
                throw error;
            }

            return this.normalizeWord(data);
        } catch (err) {
            console.error('Error in createWord:', err);
            throw err;
        }
    },

    /**
     * Kelime güncelle
     */
    async updateWord(wordId, wordData) {
        try {
            const updateData = {};

            if (wordData.word !== undefined) updateData.word = wordData.word?.trim().toLowerCase();
            if (wordData.phonetic !== undefined) updateData.phonetic = wordData.phonetic;
            if (wordData.partOfSpeech !== undefined) updateData.part_of_speech = wordData.partOfSpeech;
            if (wordData.level !== undefined) updateData.level = wordData.level;
            if (wordData.meaningsTr !== undefined) updateData.meanings_tr = wordData.meaningsTr;
            if (wordData.definitionsEn !== undefined) updateData.definitions_en = wordData.definitionsEn;
            if (wordData.examplesEn !== undefined) updateData.examples_en = wordData.examplesEn;
            if (wordData.examplesTr !== undefined) updateData.examples_tr = wordData.examplesTr;
            if (wordData.synonyms !== undefined) updateData.synonyms = wordData.synonyms;
            if (wordData.antonyms !== undefined) updateData.antonyms = wordData.antonyms;
            if (wordData.relatedWords !== undefined) updateData.related_words = wordData.relatedWords;
            if (wordData.usageNotes !== undefined) updateData.usage_notes = wordData.usageNotes;
            if (wordData.commonMistakes !== undefined) updateData.common_mistakes = wordData.commonMistakes;
            if (wordData.imageUrl !== undefined) updateData.image_url = wordData.imageUrl;
            if (wordData.audioUrl !== undefined) updateData.audio_url = wordData.audioUrl;
            if (wordData.frequencyRank !== undefined) updateData.frequency_rank = wordData.frequencyRank;
            if (wordData.isCommon !== undefined) updateData.is_common = wordData.isCommon;
            if (wordData.tags !== undefined) updateData.tags = wordData.tags;

            const { data, error } = await supabase
                .from('words')
                .update(updateData)
                .eq('id', wordId)
                .select()
                .single();

            if (error) {
                console.error('Error updating word:', error);
                throw error;
            }

            return this.normalizeWord(data);
        } catch (err) {
            console.error('Error in updateWord:', err);
            throw err;
        }
    },

    /**
     * Kelime sil
     */
    async deleteWord(wordId) {
        try {
            const { error } = await supabase
                .from('words')
                .delete()
                .eq('id', wordId);

            if (error) {
                console.error('Error deleting word:', error);
                throw error;
            }

            return true;
        } catch (err) {
            console.error('Error in deleteWord:', err);
            throw err;
        }
    },

    /**
     * Veritabanı kelime verisini normalize et (snake_case -> camelCase)
     */
    normalizeWord(dbWord) {
        if (!dbWord) return null;
        
        return {
            id: dbWord.id,
            word: dbWord.word,
            phonetic: dbWord.phonetic,
            partOfSpeech: dbWord.part_of_speech,
            level: dbWord.level,
            meaningsTr: dbWord.meanings_tr || [],
            definitionsEn: dbWord.definitions_en || [],
            examplesEn: dbWord.examples_en || [],
            examplesTr: dbWord.examples_tr || [],
            synonyms: dbWord.synonyms || [],
            antonyms: dbWord.antonyms || [],
            relatedWords: dbWord.related_words || [],
            usageNotes: dbWord.usage_notes,
            commonMistakes: dbWord.common_mistakes,
            imageUrl: dbWord.image_url,
            audioUrl: dbWord.audio_url,
            frequencyRank: dbWord.frequency_rank,
            isCommon: dbWord.is_common,
            tags: dbWord.tags || [],
            createdAt: dbWord.created_at,
            updatedAt: dbWord.updated_at,
            
            // Geriye uyumluluk için eski alan adları
            turkish: (dbWord.meanings_tr || [])[0] || '',
            definition: (dbWord.definitions_en || [])[0] || '',
            examples: dbWord.examples_en || []
        };
    },

    // --- NEWS-WORDS İLİŞKİ FONKSİYONLARI ---

    /**
     * News level'a kelime ekle
     */
    async addWordToNewsLevel(newsLevelId, wordId, options = {}) {
        try {
            const { displayOrder = 0, isHighlighted = false, contextSentence = null } = options;

            const { data, error } = await supabase
                .from('news_words')
                .insert({
                    news_level_id: newsLevelId,
                    word_id: wordId,
                    display_order: displayOrder,
                    is_highlighted: isHighlighted,
                    context_sentence: contextSentence
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error adding word to news:', err);
            throw err;
        }
    },

    /**
     * News level'dan kelime çıkar
     */
    async removeWordFromNewsLevel(newsLevelId, wordId) {
        try {
            const { error } = await supabase
                .from('news_words')
                .delete()
                .eq('news_level_id', newsLevelId)
                .eq('word_id', wordId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error removing word from news:', err);
            throw err;
        }
    },

    /**
     * News level'ın kelimelerini getir
     */
    async getWordsForNewsLevel(newsLevelId) {
        try {
            const { data, error } = await supabase
                .from('news_words')
                .select(`
                    id,
                    display_order,
                    is_highlighted,
                    context_sentence,
                    words (*)
                `)
                .eq('news_level_id', newsLevelId)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching news words:', error);
                return [];
            }

            return data.map(nw => ({
                ...this.normalizeWord(nw.words),
                displayOrder: nw.display_order,
                isHighlighted: nw.is_highlighted,
                contextSentence: nw.context_sentence
            }));
        } catch (err) {
            console.error('Error in getWordsForNewsLevel:', err);
            return [];
        }
    },

    // --- STORY-WORDS İLİŞKİ FONKSİYONLARI ---

    /**
     * Story level'a kelime ekle
     */
    async addWordToStoryLevel(storyLevelId, wordId, options = {}) {
        try {
            const { displayOrder = 0, isHighlighted = false, contextSentence = null } = options;

            const { data, error } = await supabase
                .from('story_words')
                .insert({
                    story_level_id: storyLevelId,
                    word_id: wordId,
                    display_order: displayOrder,
                    is_highlighted: isHighlighted,
                    context_sentence: contextSentence
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error adding word to story:', err);
            throw err;
        }
    },

    /**
     * Story level'dan kelime çıkar
     */
    async removeWordFromStoryLevel(storyLevelId, wordId) {
        try {
            const { error } = await supabase
                .from('story_words')
                .delete()
                .eq('story_level_id', storyLevelId)
                .eq('word_id', wordId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error removing word from story:', err);
            throw err;
        }
    },

    /**
     * Story level'ın kelimelerini getir
     */
    async getWordsForStoryLevel(storyLevelId) {
        try {
            const { data, error } = await supabase
                .from('story_words')
                .select(`
                    id,
                    display_order,
                    is_highlighted,
                    context_sentence,
                    words (*)
                `)
                .eq('story_level_id', storyLevelId)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching story words:', error);
                return [];
            }

            return data.map(sw => ({
                ...this.normalizeWord(sw.words),
                displayOrder: sw.display_order,
                isHighlighted: sw.is_highlighted,
                contextSentence: sw.context_sentence
            }));
        } catch (err) {
            console.error('Error in getWordsForStoryLevel:', err);
            return [];
        }
    },
};
