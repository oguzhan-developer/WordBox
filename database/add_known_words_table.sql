-- =====================================================
-- KNOWN_WORDS TABLOSU - Kullanıcının bildiği kelimeler
-- =====================================================
-- "Biliyorum" olarak işaretlenen kelimeler burada tutulur.
-- Bu kelimeler tekrar öğrenme modunda gösterilmez.

CREATE TABLE IF NOT EXISTS known_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,

    -- Kelimeyi ne zaman bildiğini işaretledi
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Opsiyonel: Seviye (bilgi seviyesi)
    confidence VARCHAR(20) DEFAULT 'known',  -- known, fluent, native

    UNIQUE(user_id, word_id)
);

-- Performans için indeksler
CREATE INDEX IF NOT EXISTS idx_known_words_user ON known_words(user_id);
CREATE INDEX IF NOT EXISTS idx_known_words_word ON known_words(word_id);

-- RLS politikaları
ALTER TABLE known_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own known words" ON known_words
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own known words" ON known_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own known words" ON known_words
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- VARSAYILAN VERİLER (TEST İÇİN)
-- =====================================================
-- Mevcut kullanıcılar için örnek veri eklemek isterseniz:
-- INSERT INTO known_words (user_id, word_id, confidence)
-- SELECT user_id, word_id, 'known'
-- FROM user_words
-- WHERE status = 'mastered'
-- ON CONFLICT (user_id, word_id) DO NOTHING;
