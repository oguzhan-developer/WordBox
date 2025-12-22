-- =====================================================
-- FIX RLS POLICIES - Profiles and User Words
-- =====================================================
-- Bu dosya RLS policy sorunlarını düzeltir
-- Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Eski policy'leri sil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Yeni, daha esnek policy'ler oluştur
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id" ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- 3. user_words policy'lerini kontrol et ve gerekirse güncelle
DROP POLICY IF EXISTS "Users own words select" ON user_words;
DROP POLICY IF EXISTS "Users own words insert" ON user_words;
DROP POLICY IF EXISTS "Users own words update" ON user_words;
DROP POLICY IF EXISTS "Users own words delete" ON user_words;

CREATE POLICY "Enable read access for own words" ON user_words
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own words" ON user_words
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own words" ON user_words
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own words" ON user_words
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Profiles tablosuna eksik kolonları ekle (eğer yoksa)
DO $$ 
BEGIN
    -- words_learned kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'words_learned') THEN
        ALTER TABLE profiles ADD COLUMN words_learned INTEGER DEFAULT 0;
    END IF;

    -- words_today kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'words_today') THEN
        ALTER TABLE profiles ADD COLUMN words_today INTEGER DEFAULT 0;
    END IF;

    -- articles_read kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'articles_read') THEN
        ALTER TABLE profiles ADD COLUMN articles_read INTEGER DEFAULT 0;
    END IF;

    -- practice_count kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'practice_count') THEN
        ALTER TABLE profiles ADD COLUMN practice_count INTEGER DEFAULT 0;
    END IF;

    -- perfect_practices kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'perfect_practices') THEN
        ALTER TABLE profiles ADD COLUMN perfect_practices INTEGER DEFAULT 0;
    END IF;

    -- last_practice_date kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_practice_date') THEN
        ALTER TABLE profiles ADD COLUMN last_practice_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- earned_badges kolonu (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'earned_badges') THEN
        ALTER TABLE profiles ADD COLUMN earned_badges JSONB DEFAULT '[]';
    END IF;

    -- completed_levels kolonu (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'completed_levels') THEN
        ALTER TABLE profiles ADD COLUMN completed_levels JSONB DEFAULT '[]';
    END IF;

    -- read_articles kolonu (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'read_articles') THEN
        ALTER TABLE profiles ADD COLUMN read_articles JSONB DEFAULT '[]';
    END IF;

    -- preferences kolonu zaten var ama kontrol edelim
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- 5. Verify
SELECT 'RLS Policies fixed successfully!' as message;
