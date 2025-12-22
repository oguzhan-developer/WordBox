-- =====================================================
-- WORDBOX DATABASE SCHEMA - TEMİZ VERSİYON
-- =====================================================
-- Oluşturma Tarihi: 2025-12-22
-- Bu şema projenin ihtiyaç duyduğu TÜM tabloları içerir.
-- Sırasıyla çalıştırın (foreign key bağımlılıkları var)
-- =====================================================

-- =====================================================
-- 1. WORDS TABLOSU - Tek Kaynak (Single Source of Truth)
-- =====================================================
-- Tüm kelimeler burada tutulur. Başka hiçbir tabloda kelime verisi olmaz.

CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ana kelime bilgileri
    word VARCHAR(255) NOT NULL UNIQUE,
    phonetic VARCHAR(255),
    part_of_speech VARCHAR(50),
    level VARCHAR(10) DEFAULT 'B1',
    
    -- Türkçe anlamlar (birden fazla olabilir)
    meanings_tr JSONB DEFAULT '[]',
    
    -- İngilizce tanımlar (birden fazla olabilir)  
    definitions_en JSONB DEFAULT '[]',
    
    -- Örnek cümleler
    examples_en JSONB DEFAULT '[]',
    examples_tr JSONB DEFAULT '[]',
    
    -- Ek bilgiler
    synonyms JSONB DEFAULT '[]',
    antonyms JSONB DEFAULT '[]',
    related_words JSONB DEFAULT '[]',
    
    -- Kullanım notları
    usage_notes TEXT,
    common_mistakes TEXT,
    
    -- Görsel/Medya
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    
    -- Meta veriler
    frequency_rank INTEGER,
    is_common BOOLEAN DEFAULT true,
    tags JSONB DEFAULT '[]',
    
    -- Zaman damgaları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Words tablosu için indeksler
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_level ON words(level);
CREATE INDEX idx_words_part_of_speech ON words(part_of_speech);
CREATE INDEX idx_words_frequency ON words(frequency_rank);

-- =====================================================
-- 2. KATEGORİ TABLOLARI
-- =====================================================

CREATE TABLE news_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE story_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. NEWS TABLOSU - Haber meta verileri
-- =====================================================

CREATE TABLE news (
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

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_published ON news(is_published);
CREATE INDEX idx_news_category ON news(category_id);

-- =====================================================
-- 4. NEWS_LEVELS TABLOSU - Seviye bazlı haber içerikleri
-- =====================================================

CREATE TABLE news_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
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
    
    UNIQUE(news_id, level)
);

CREATE INDEX idx_news_levels_news ON news_levels(news_id);
CREATE INDEX idx_news_levels_level ON news_levels(level);

-- =====================================================
-- 5. NEWS_WORDS TABLOSU - Haber-Kelime İlişki Tablosu
-- =====================================================

CREATE TABLE news_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_level_id UUID NOT NULL REFERENCES news_levels(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT false,
    context_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(news_level_id, word_id)
);

CREATE INDEX idx_news_words_level ON news_words(news_level_id);
CREATE INDEX idx_news_words_word ON news_words(word_id);

-- =====================================================
-- 6. STORIES TABLOSU - Hikaye meta verileri
-- =====================================================

CREATE TABLE stories (
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

CREATE INDEX idx_stories_slug ON stories(slug);
CREATE INDEX idx_stories_published ON stories(is_published);
CREATE INDEX idx_stories_category ON stories(category_id);

-- =====================================================
-- 7. STORY_LEVELS TABLOSU - Seviye bazlı hikaye içerikleri
-- =====================================================

CREATE TABLE story_levels (
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

CREATE INDEX idx_story_levels_story ON story_levels(story_id);
CREATE INDEX idx_story_levels_level ON story_levels(level);

-- =====================================================
-- 8. STORY_WORDS TABLOSU - Hikaye-Kelime İlişki Tablosu
-- =====================================================

CREATE TABLE story_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_level_id UUID NOT NULL REFERENCES story_levels(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT false,
    context_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(story_level_id, word_id)
);

CREATE INDEX idx_story_words_level ON story_words(story_level_id);
CREATE INDEX idx_story_words_word ON story_words(word_id);

-- =====================================================
-- 9. PROFILES TABLOSU - Kullanıcı Profilleri
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    level VARCHAR(10) DEFAULT 'A1',
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- 10. USER_WORDS TABLOSU - Kullanıcı Kelime Listesi (Opsiyonel)
-- =====================================================
-- Kullanıcıların öğrendiği/kaydettiği kelimeler
-- Şu an localStorage'da tutuluyor, ileride migration yapılabilir

CREATE TABLE user_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    
    -- Öğrenme durumu
    status VARCHAR(20) DEFAULT 'learning',
    mastery_level INTEGER DEFAULT 0,
    
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
    notes TEXT,
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_words_user ON user_words(user_id);
CREATE INDEX idx_user_words_status ON user_words(status);
CREATE INDEX idx_user_words_next_review ON user_words(next_review_at);

-- =====================================================
-- UPDATED_AT TRİGGER FONKSİYONU
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ları oluştur
CREATE TRIGGER update_words_updated_at 
    BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at 
    BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_levels_updated_at 
    BEFORE UPDATE ON news_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at 
    BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_levels_updated_at 
    BEFORE UPDATE ON story_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_words_updated_at 
    BEFORE UPDATE ON user_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =====================================================

-- Words tablosu - herkes okuyabilir
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Words herkes okuyabilir" ON words
    FOR SELECT USING (true);

CREATE POLICY "Words authenticated users insert" ON words
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Words authenticated users update" ON words
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Words authenticated users delete" ON words
    FOR DELETE USING (auth.role() = 'authenticated');

-- News tablosu - herkes okuyabilir
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News herkes okuyabilir" ON news
    FOR SELECT USING (true);

CREATE POLICY "News authenticated insert" ON news
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "News authenticated update" ON news
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "News authenticated delete" ON news
    FOR DELETE USING (auth.role() = 'authenticated');

-- News levels
ALTER TABLE news_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News levels herkes okuyabilir" ON news_levels
    FOR SELECT USING (true);

CREATE POLICY "News levels authenticated insert" ON news_levels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "News levels authenticated update" ON news_levels
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "News levels authenticated delete" ON news_levels
    FOR DELETE USING (auth.role() = 'authenticated');

-- News words
ALTER TABLE news_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News words herkes okuyabilir" ON news_words
    FOR SELECT USING (true);

CREATE POLICY "News words authenticated insert" ON news_words
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "News words authenticated delete" ON news_words
    FOR DELETE USING (auth.role() = 'authenticated');

-- News categories
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News categories herkes okuyabilir" ON news_categories
    FOR SELECT USING (true);

CREATE POLICY "News categories authenticated insert" ON news_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "News categories authenticated update" ON news_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "News categories authenticated delete" ON news_categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Stories tablosu
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories herkes okuyabilir" ON stories
    FOR SELECT USING (true);

CREATE POLICY "Stories authenticated insert" ON stories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Stories authenticated update" ON stories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Stories authenticated delete" ON stories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Story levels
ALTER TABLE story_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story levels herkes okuyabilir" ON story_levels
    FOR SELECT USING (true);

CREATE POLICY "Story levels authenticated insert" ON story_levels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Story levels authenticated update" ON story_levels
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Story levels authenticated delete" ON story_levels
    FOR DELETE USING (auth.role() = 'authenticated');

-- Story words
ALTER TABLE story_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story words herkes okuyabilir" ON story_words
    FOR SELECT USING (true);

CREATE POLICY "Story words authenticated insert" ON story_words
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Story words authenticated delete" ON story_words
    FOR DELETE USING (auth.role() = 'authenticated');

-- Story categories
ALTER TABLE story_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story categories herkes okuyabilir" ON story_categories
    FOR SELECT USING (true);

CREATE POLICY "Story categories authenticated insert" ON story_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Story categories authenticated update" ON story_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Story categories authenticated delete" ON story_categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Profiles - sadece kendi profilini görebilir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User words - sadece kendi kelimelerini görebilir
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own words select" ON user_words
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own words insert" ON user_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own words update" ON user_words
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users own words delete" ON user_words
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ÖRNEK VERİLER (Opsiyonel)
-- =====================================================

-- Örnek kategoriler
INSERT INTO news_categories (name, name_en, slug, icon, color) VALUES
    ('Teknoloji', 'Technology', 'technology', '💻', '#3B82F6'),
    ('Bilim', 'Science', 'science', '🔬', '#10B981'),
    ('Spor', 'Sports', 'sports', '⚽', '#F59E0B'),
    ('Sağlık', 'Health', 'health', '🏥', '#EF4444'),
    ('Eğitim', 'Education', 'education', '📚', '#8B5CF6');

INSERT INTO story_categories (name, name_en, slug, icon, color) VALUES
    ('Macera', 'Adventure', 'adventure', '🗺️', '#F59E0B'),
    ('Bilim Kurgu', 'Sci-Fi', 'sci-fi', '🚀', '#6366F1'),
    ('Romantik', 'Romance', 'romance', '💕', '#EC4899'),
    ('Gizem', 'Mystery', 'mystery', '🔍', '#6B7280'),
    ('Fantezi', 'Fantasy', 'fantasy', '🧙', '#8B5CF6');

-- Örnek kelimeler
INSERT INTO words (word, phonetic, part_of_speech, level, meanings_tr, definitions_en, examples_en, examples_tr) VALUES
    ('adventure', '/ədˈventʃər/', 'noun', 'A2', 
     '["macera", "serüven"]', 
     '["an exciting experience or undertaking"]',
     '["Life is an adventure.", "They went on an adventure in the mountains."]',
     '["Hayat bir maceradır.", "Dağlarda bir maceraya çıktılar."]'),
    
    ('discover', '/dɪˈskʌvər/', 'verb', 'A2',
     '["keşfetmek", "bulmak"]',
     '["to find something for the first time"]',
     '["Scientists discovered a new planet.", "I discovered a great restaurant."]',
     '["Bilim insanları yeni bir gezegen keşfetti.", "Harika bir restoran keşfettim."]'),
    
    ('environment', '/ɪnˈvaɪrənmənt/', 'noun', 'B1',
     '["çevre", "ortam"]',
     '["the natural world, surroundings"]',
     '["We must protect the environment.", "A positive work environment is important."]',
     '["Çevreyi korumalıyız.", "Olumlu bir çalışma ortamı önemlidir."]'),
    
    ('challenge', '/ˈtʃælɪndʒ/', 'noun', 'B1',
     '["meydan okuma", "zorluk"]',
     '["a difficult task or situation"]',
     '["Learning a new language is a challenge.", "She accepted the challenge."]',
     '["Yeni bir dil öğrenmek bir zorluktur.", "Meydan okumayı kabul etti."]'),
    
    ('opportunity', '/ˌɒpəˈtjuːnɪti/', 'noun', 'B1',
     '["fırsat", "olanak"]',
     '["a chance to do something"]',
     '["This is a great opportunity.", "Don''t miss the opportunity."]',
     '["Bu harika bir fırsat.", "Fırsatı kaçırma."]');
