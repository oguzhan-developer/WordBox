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
                .order('word', { ascending: true })
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
                .order('word', { ascending: true });

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

            // Fisher-Yates shuffle for unbiased randomization
            const shuffled = [...data];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
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
            // partOfSpeech'i array olarak normalize et
            let partOfSpeech = [];
            if (Array.isArray(wordData.partOfSpeech)) {
                partOfSpeech = wordData.partOfSpeech;
            } else if (typeof wordData.partOfSpeech === 'string' && wordData.partOfSpeech) {
                partOfSpeech = [wordData.partOfSpeech];
            }

            const insertData = {
                word: wordData.word?.trim().toLowerCase(),
                phonetic: wordData.phonetic || null,
                part_of_speech: partOfSpeech.length > 0 ? partOfSpeech : null,
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
                audio_url: wordData.audioUrl || null
            };

            const { data, error } = await supabase
                .from('words')
                .upsert(insertData, { onConflict: 'word' })
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
            if (wordData.partOfSpeech !== undefined) {
                // partOfSpeech'i array olarak normalize et
                let partOfSpeech = [];
                if (Array.isArray(wordData.partOfSpeech)) {
                    partOfSpeech = wordData.partOfSpeech;
                } else if (typeof wordData.partOfSpeech === 'string' && wordData.partOfSpeech) {
                    partOfSpeech = [wordData.partOfSpeech];
                }
                updateData.part_of_speech = partOfSpeech.length > 0 ? partOfSpeech : null;
            }
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

        // partOfSpeech array olarak normalize et
        let partOfSpeech = [];
        if (dbWord.part_of_speech) {
            if (Array.isArray(dbWord.part_of_speech)) {
                partOfSpeech = dbWord.part_of_speech;
            } else if (typeof dbWord.part_of_speech === 'string') {
                partOfSpeech = [dbWord.part_of_speech];
            }
        }

        return {
            id: dbWord.id,
            word: dbWord.word,
            phonetic: dbWord.phonetic,
            partOfSpeech: partOfSpeech,
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

    // --- KATEGORİLER ---

    /**
     * Haber kategorilerini getir
     */
    async getNewsCategories() {
        try {
            const { data, error } = await supabase
                .from('news_categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching news categories:', error);
                return [];
            }

            return data.map(cat => ({
                id: cat.id,
                name: cat.name,
                nameEn: cat.name_en,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color
            }));
        } catch (err) {
            console.error('Error in getNewsCategories:', err);
            return [];
        }
    },

    /**
     * Hikaye kategorilerini getir
     */
    async getStoryCategories() {
        try {
            const { data, error } = await supabase
                .from('story_categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching story categories:', error);
                return [];
            }

            return data.map(cat => ({
                id: cat.id,
                name: cat.name,
                nameEn: cat.name_en,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color
            }));
        } catch (err) {
            console.error('Error in getStoryCategories:', err);
            return [];
        }
    },

    // --- İSTATİSTİKLER ---

    /**
     * Dashboard için genel istatistikleri getir
     */
    async getDashboardStats() {
        try {
            const [wordsResult, newsResult, storiesResult] = await Promise.all([
                supabase.from('words').select('id', { count: 'exact', head: true }),
                supabase.from('news').select('id', { count: 'exact', head: true }).eq('is_published', true),
                supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_published', true)
            ]);

            return {
                totalWords: wordsResult.count || 0,
                totalNews: newsResult.count || 0,
                totalStories: storiesResult.count || 0
            };
        } catch (err) {
            console.error('Error in getDashboardStats:', err);
            return { totalWords: 0, totalNews: 0, totalStories: 0 };
        }
    },

    /**
     * Seviyeye göre kelime sayılarını getir
     */
    async getWordCountsByLevel() {
        try {
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
            const counts = {};

            await Promise.all(levels.map(async (level) => {
                const { count } = await supabase
                    .from('words')
                    .select('id', { count: 'exact', head: true })
                    .eq('level', level);
                counts[level] = count || 0;
            }));

            return counts;
        } catch (err) {
            console.error('Error in getWordCountsByLevel:', err);
            return { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
        }
    },

    /**
     * Haber görüntüleme sayısını artır
     */
    async incrementNewsViews(newsId) {
        try {
            const { error } = await supabase.rpc('increment_views', { 
                table_name: 'news', 
                row_id: newsId 
            });
            
            if (error) {
                // RPC yoksa manuel güncelle
                await supabase
                    .from('news')
                    .update({ views: supabase.sql`views + 1` })
                    .eq('id', newsId);
            }
        } catch (err) {
            console.error('Error incrementing views:', err);
        }
    },

    /**
     * Hikaye görüntüleme sayısını artır
     */
    async incrementStoryViews(storyId) {
        try {
            const { error } = await supabase.rpc('increment_views', { 
                table_name: 'stories', 
                row_id: storyId 
            });
            
            if (error) {
                // RPC yoksa manuel güncelle
                await supabase
                    .from('stories')
                    .update({ views: supabase.sql`views + 1` })
                    .eq('id', storyId);
            }
        } catch (err) {
            console.error('Error incrementing views:', err);
        }
    },

    /**
     * Günün Kelimesini Veritabanından Çek
     * Tarihe göre deterministik - aynı gün aynı kelime
     * @param {string} level - Kullanıcı seviyesi (opsiyonel, default: rastgele)
     * @returns {Promise<Object|null>} Kelime objesi
     */
    async getWordOfTheDay(level = null) {
        try {
            // Bugünün tarihini al - yılın günü olarak
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 0);
            const diff = today - startOfYear;
            const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

            // Kelimeleri çek
            let query = supabase
                .from('words')
                .select('*')
                .order('word', { ascending: true });

            if (level) {
                query = query.eq('level', level);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (!data || data.length === 0) return null;

            // Deterministik index hesapla (aynı gün aynı kelime)
            const index = dayOfYear % data.length;
            const word = data[index];

            return {
                word: word.word,
                phonetic: word.phonetic || '',
                turkish: word.meanings_tr ? word.meanings_tr[0] : '',
                partOfSpeech: Array.isArray(word.part_of_speech) ? word.part_of_speech : (word.part_of_speech ? [word.part_of_speech] : ['noun']),
                definition: word.definitions_en ? word.definitions_en[0] : '',
                example: word.example_sentence || '',
                level: word.level,
                category: word.category || 'general',
                id: word.id
            };
        } catch (err) {
            console.error('Error in getWordOfTheDay:', err);
            return null;
        }
    },

    // ============================================
    // USER WORDS - Kullanıcı Kelime Listesi
    // ============================================

    /**
     * Kullanıcının tüm kelimelerini getir
     */
    async getUserWords(userId) {
        try {
            console.log('[getUserWords] Fetching words for user:', userId);
            
            const { data, error } = await supabase
                .from('user_words')
                .select(`
                    *,
                    words (*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[getUserWords] Error fetching user words:', error);
                return [];
            }

            console.log('[getUserWords] Raw data from DB:', data);
            console.log('[getUserWords] Found', data?.length || 0, 'words');

            if (!data || data.length === 0) {
                console.log('[getUserWords] No words found, returning empty array');
                return [];
            }

            // Normalize data
            const normalized = data.map(uw => {
                const word = uw.words;
                if (!word) {
                    console.warn('[getUserWords] Word data missing for user_word:', uw);
                    return null;
                }
                return {
                    id: word.id,
                    word: word.word,
                    phonetic: word.phonetic || '',
                    partOfSpeech: Array.isArray(word.part_of_speech) ? word.part_of_speech : (word.part_of_speech ? [word.part_of_speech] : []),
                    turkish: (word.meanings_tr || []).join(', '),
                    definition: word.definitions_en?.[0] || '',
                    meanings: word.meanings_tr || [],
                    examples: word.examples_en || [],
                    examplesTr: word.examples_tr || [],
                    synonyms: word.synonyms || [],
                    antonyms: word.antonyms || [],
                    level: word.level,
                    usageNotes: word.usage_notes || '',
                    commonMistakes: word.common_mistakes || '',
                    // User-specific data
                    status: uw.status || 'new',
                    masteryLevel: uw.mastery_level || 0,
                    practiceCount: uw.times_seen || 0,
                    correctCount: uw.times_correct || 0,
                    incorrectCount: uw.times_incorrect || 0,
                    lastPractice: uw.last_seen_at,
                    nextReview: uw.next_review_at,
                    addedAt: uw.created_at,
                    notes: uw.notes,
                    source: uw.source,
                    // SRS data
                    easeFactor: uw.ease_factor || 2.5,
                    intervalDays: uw.interval_days || 1,
                    repetitions: uw.repetitions || 0,
                };
            }).filter(Boolean);
            
            console.log('[getUserWords] Normalized', normalized.length, 'words');
            return normalized;
        } catch (err) {
            console.error('[getUserWords] Exception:', err);
            return [];
        }
    },

    /**
     * Kullanıcıya kelime ekle
     */
    async addUserWord(userId, wordId, source = 'manual') {
        try {
            console.log('[addUserWord] Adding word:', { userId, wordId, source });
            
            const { data, error } = await supabase
                .from('user_words')
                .insert({
                    user_id: userId,
                    word_id: wordId,
                    status: 'new',
                    mastery_level: 0,
                    times_seen: 0,
                    times_correct: 0,
                    times_incorrect: 0,
                    source: source,
                    next_review_at: new Date().toISOString(),
                })
                .select(`
                    *,
                    words (*)
                `)
                .single();

            if (error) {
                // Duplicate entry is ok
                if (error.code === '23505') {
                    console.log('[addUserWord] Word already added by user (duplicate)');
                    return null;
                }
                console.error('[addUserWord] Error:', error);
                throw error;
            }

            console.log('[addUserWord] Successfully added, raw data:', data);

            // Normalize
            const word = data.words;
            const normalized = {
                id: word.id,
                word: word.word,
                phonetic: word.phonetic || '',
                partOfSpeech: Array.isArray(word.part_of_speech) ? word.part_of_speech : (word.part_of_speech ? [word.part_of_speech] : []),
                turkish: word.meanings_tr?.[0] || '',
                definition: word.definitions_en?.[0] || '',
                examples: word.examples_en || [],
                synonyms: word.synonyms || [],
                antonyms: word.antonyms || [],
                level: word.level,
                status: data.status,
                masteryLevel: data.mastery_level,
                practiceCount: data.times_seen,
                correctCount: data.times_correct,
                addedAt: data.created_at,
                source: data.source,
            };
            
            console.log('[addUserWord] Returning normalized:', normalized);
            return normalized;
        } catch (err) {
            console.error('[addUserWord] Exception:', err);
            throw err;
        }
    },

    /**
     * Kullanıcıdan kelime sil
     */
    async removeUserWord(userId, wordId) {
        try {
            const { error } = await supabase
                .from('user_words')
                .delete()
                .eq('user_id', userId)
                .eq('word_id', wordId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error in removeUserWord:', err);
            return false;
        }
    },

    /**
     * Kelime pratiği güncelle
     */
    async updateUserWordPractice(userId, wordId, isCorrect) {
        try {
            // Önce mevcut veriyi al
            const { data: current } = await supabase
                .from('user_words')
                .select('*')
                .eq('user_id', userId)
                .eq('word_id', wordId)
                .single();

            if (!current) return false;

            // Yeni değerleri hesapla
            const timesSeen = (current.times_seen || 0) + 1;
            const timesCorrect = (current.times_correct || 0) + (isCorrect ? 1 : 0);
            const timesIncorrect = (current.times_incorrect || 0) + (isCorrect ? 0 : 1);
            
            // Status güncelle
            let newStatus = current.status;
            if (timesCorrect >= 5) {
                newStatus = 'learned';
            } else if (timesSeen >= 1) {
                newStatus = 'learning';
            }

            // Mastery level hesapla (0-100)
            const masteryLevel = Math.min(100, Math.floor((timesCorrect / Math.max(1, timesSeen)) * 100));

            // SRS hesaplama (basit)
            let easeFactor = current.ease_factor || 2.5;
            let intervalDays = current.interval_days || 1;
            let repetitions = current.repetitions || 0;

            if (isCorrect) {
                repetitions += 1;
                if (repetitions === 1) {
                    intervalDays = 1;
                } else if (repetitions === 2) {
                    intervalDays = 6;
                } else {
                    intervalDays = Math.round(intervalDays * easeFactor);
                }
            } else {
                repetitions = 0;
                intervalDays = 1;
                easeFactor = Math.max(1.3, easeFactor - 0.2);
            }

            const nextReviewAt = new Date();
            nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

            // Güncelle
            const { error } = await supabase
                .from('user_words')
                .update({
                    times_seen: timesSeen,
                    times_correct: timesCorrect,
                    times_incorrect: timesIncorrect,
                    last_seen_at: new Date().toISOString(),
                    status: newStatus,
                    mastery_level: masteryLevel,
                    ease_factor: easeFactor,
                    interval_days: intervalDays,
                    repetitions: repetitions,
                    next_review_at: nextReviewAt.toISOString(),
                })
                .eq('user_id', userId)
                .eq('word_id', wordId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error in updateUserWordPractice:', err);
            return false;
        }
    },

    // ============================================
    // KNOWN_WORDS - Bildiği Kelimeler
    // ============================================

    /**
     * Kullanıcının bildiği kelimeleri getir
     */
    async getKnownWords(userId) {
        try {
            const { data, error } = await supabase
                .from('known_words')
                .select('word_id')
                .eq('user_id', userId);

            if (error) throw error;
            return new Set(data?.map(kw => kw.word_id) || []);
        } catch (err) {
            console.error('Error in getKnownWords:', err);
            return new Set();
        }
    },

    /**
     * Kelimeyi bildiği olarak işaretle
     */
    async markWordAsKnown(userId, wordId) {
        try {
            const { error } = await supabase
                .from('known_words')
                .insert({
                    user_id: userId,
                    word_id: wordId,
                    confidence: 'known'
                });

            if (error) {
                // Duplicate hatasıysa Ignore
                if (error.code === '23505') return true;
                throw error;
            }
            return true;
        } catch (err) {
            console.error('Error in markWordAsKnown:', err);
            return false;
        }
    },

    /**
     * Kullanıcı için rastgele kelimeler getir
     * - user_words'ta olmayan
     * - known_words'ta olmayan
     * - Seviyeye uygun
     */
    async getRandomWordsForLearning(userId, level, count = 10) {
        try {
            console.log('[getRandomWordsForLearning] Fetching words:', { userId, level, count });

            // Önce kullanıcının kelimelerini al
            const [userWordsResult, knownWordsResult] = await Promise.all([
                supabase.from('user_words').select('word_id').eq('user_id', userId),
                supabase.from('known_words').select('word_id').eq('user_id', userId)
            ]);

            const excludedWordIds = new Set([
                ...(userWordsResult.data?.map(w => w.word_id) || []),
                ...(knownWordsResult.data?.map(w => w.word_id) || [])
            ]);

            console.log('[getRandomWordsForLearning] Excluded words:', excludedWordIds.size);

            // Seviyedeki kelimeleri getir
            const { data: words, error } = await supabase
                .from('words')
                .select('*')
                .eq('level', level)
                .limit(count * 3); // Daha fazla getir, random seçeceğiz

            if (error) throw error;

            // Hariç tutulanları filtrele
            const availableWords = words?.filter(w => !excludedWordIds.has(w.id)) || [];

            // Fisher-Yates shuffle for unbiased randomization
            const shuffled = [...availableWords];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            const selected = shuffled.slice(0, count);

            // Normalize
            const normalized = selected.map(word => this.normalizeWord(word));

            console.log('[getRandomWordsForLearning] Returning:', normalized.length, 'words');
            return normalized;
        } catch (err) {
            console.error('Error in getRandomWordsForLearning:', err);
            return [];
        }
    },

    /**
     * Kelimeyi öğrenme listesine ekle (Bilmiyorum)
     */
    async learnWord(userId, wordId) {
        try {
            console.log('[learnWord] Adding word to learning:', { userId, wordId });

            const { data, error } = await supabase
                .from('user_words')
                .insert({
                    user_id: userId,
                    word_id: wordId,
                    status: 'new',
                    mastery_level: 0,
                    times_seen: 0,
                    times_correct: 0,
                    times_incorrect: 0,
                    ease_factor: 2.5,
                    interval_days: 1,
                    repetitions: 0,
                    next_review_at: new Date().toISOString()
                })
                .select(`
                    *,
                    words (*)
                `)
                .single();

            if (error) {
                // Duplicate hatasıysa
                if (error.code === '23505') {
                    console.log('[learnWord] Word already in user_words');
                    return null;
                }
                throw error;
            }

            const normalized = data.words ? this.normalizeWord(data.words) : null;
            if (normalized) {
                normalized.status = data.status;
                normalized.addedAt = data.created_at;
            }

            console.log('[learnWord] Word added successfully');
            return normalized;
        } catch (err) {
            console.error('Error in learnWord:', err);
            throw err;
        }
    },
};
