-- =====================================================
-- WORDBOX DATABASE SCHEMA
-- =====================================================
-- Bu şema tüm projenin veritabanı mimarisini tanımlar.
-- KURAL: Her veri tipi sadece kendi tablosunda bulunur.
-- İlişkiler junction/bridge tablolarıyla kurulur.
-- =====================================================

-- =====================================================
-- 1. WORDS TABLOSU - Tek kaynak (Single Source of Truth)
-- =====================================================
-- Tüm kelimeler burada tutulur. Başka hiçbir tabloda kelime verisi olmaz.

CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ana kelime bilgileri
    word VARCHAR(255) NOT NULL UNIQUE,
    phonetic VARCHAR(255),                           -- Fonetik yazım: /ˈwɔːtər/
    part_of_speech VARCHAR(50),                      -- noun, verb, adjective, adverb, etc.
    level VARCHAR(10) DEFAULT 'B1',                  -- A1, A2, B1, B2, C1, C2
    
    -- Türkçe anlamlar (birden fazla olabilir)
    meanings_tr JSONB DEFAULT '[]',                  -- ["anlam1", "anlam2", "anlam3"]
    
    -- İngilizce tanımlar (birden fazla olabilir)  
    definitions_en JSONB DEFAULT '[]',               -- ["definition1", "definition2"]
    
    -- Örnek cümleler
    examples_en JSONB DEFAULT '[]',                  -- ["Example sentence 1.", "Example sentence 2."]
    examples_tr JSONB DEFAULT '[]',                  -- ["Örnek cümle 1.", "Örnek cümle 2."]
    
    -- Ek bilgiler
    synonyms JSONB DEFAULT '[]',                     -- ["synonym1", "synonym2"]
    antonyms JSONB DEFAULT '[]',                     -- ["antonym1", "antonym2"]
    related_words JSONB DEFAULT '[]',                -- ["related1", "related2"]
    
    -- Kullanım notları
    usage_notes TEXT,                                -- Özel kullanım notları
    common_mistakes TEXT,                            -- Yaygın hatalar
    
    -- Görsel/Medya
    image_url VARCHAR(500),                          -- Kelimeyle ilişkili görsel
    audio_url VARCHAR(500),                          -- Telaffuz ses dosyası

    -- Zaman damgaları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Words tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_words_search ON words USING gin(to_tsvector('english', word));

-- =====================================================
-- 2. NEWS TABLOSU - Haber meta verileri
-- =====================================================
-- Sadece haber özellikleri burada. Kelimeler burada OLMAZ.

CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(500),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_time_minutes INTEGER DEFAULT 5,
    is_published BOOLEAN DEFAULT false,
    category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. NEWS_LEVELS TABLOSU - Seviye bazlı haber içerikleri
-- =====================================================
-- Kelimeler burada OLMAZ, sadece word_ids referansları olur.

CREATE TABLE IF NOT EXISTS news_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL,                      -- A1, A2, B1, B2, C1
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    summary TEXT,
    content_text TEXT NOT NULL,
    key_phrases JSONB DEFAULT '[]',                  -- Anahtar ifadeler
    comprehension_questions JSONB DEFAULT '[]',      -- Anlama soruları
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(news_id, level)
);

-- =====================================================
-- 4. NEWS_WORDS TABLOSU - Haber-Kelime İlişki Tablosu
-- =====================================================
-- Bu junction table haberlerdeki kelimeleri words tablosuna bağlar.
-- Kelime verisi BURADA TUTULMAZ, sadece referans edilir.

CREATE TABLE IF NOT EXISTS news_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_level_id UUID NOT NULL REFERENCES news_levels(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,                 -- Kelime sırası
    is_highlighted BOOLEAN DEFAULT false,            -- Vurgulu kelime mi?
    context_sentence TEXT,                           -- Bu haberdeki bağlam cümlesi (opsiyonel)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(news_level_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_news_words_level ON news_words(news_level_id);
CREATE INDEX IF NOT EXISTS idx_news_words_word ON news_words(word_id);

-- =====================================================
-- 5. STORIES TABLOSU - Hikaye meta verileri
-- =====================================================

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(500),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_time_minutes INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT false,
    category_id UUID REFERENCES story_categories(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. STORY_LEVELS TABLOSU - Seviye bazlı hikaye içerikleri
-- =====================================================

CREATE TABLE IF NOT EXISTS story_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    summary TEXT,
    content_text TEXT NOT NULL,
    key_phrases JSONB DEFAULT '[]',
    comprehension_questions JSONB DEFAULT '[]',
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(story_id, level)
);

-- =====================================================
-- 7. STORY_WORDS TABLOSU - Hikaye-Kelime İlişki Tablosu
-- =====================================================

CREATE TABLE IF NOT EXISTS story_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_level_id UUID NOT NULL REFERENCES story_levels(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT false,
    context_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(story_level_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_story_words_level ON story_words(story_level_id);
CREATE INDEX IF NOT EXISTS idx_story_words_word ON story_words(word_id);

-- =====================================================
-- 8. KATEGORİ TABLOLARI
-- =====================================================

CREATE TABLE IF NOT EXISTS news_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. USER_WORDS TABLOSU - Kullanıcı Kelime Listesi
-- =====================================================
-- Kullanıcıların öğrendiği/kaydettiği kelimeler

CREATE TABLE IF NOT EXISTS user_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,                           -- Auth user id
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    
    -- Öğrenme durumu
    status VARCHAR(20) DEFAULT 'learning',           -- learning, mastered, ignored
    mastery_level INTEGER DEFAULT 0,                 -- 0-100 arası ustalık seviyesi
    
    -- Spaced Repetition verileri
    next_review_at TIMESTAMP WITH TIME ZONE,
    ease_factor DECIMAL(3,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    
    -- İstatistikler
    times_seen INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    
    -- Meta
    notes TEXT,                                      -- Kullanıcı notları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_user_words_user ON user_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_words_status ON user_words(status);
CREATE INDEX IF NOT EXISTS idx_user_words_next_review ON user_words(next_review_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Words tablosu - herkes okuyabilir, sadece adminler yazabilir
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Words herkes okuyabilir" ON words
    FOR SELECT USING (true);

CREATE POLICY "Words adminler yazabilir" ON words
    FOR ALL USING (auth.jwt() ->> 'email' IN ('oguzhanfinal@gmail.com', 'admin@wordbox.com'));

-- User words - kullanıcılar sadece kendi verilerini görebilir
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own words" ON user_words
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- UPDATED_AT TRİGGER'I
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_words_updated_at BEFORE UPDATE ON user_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
