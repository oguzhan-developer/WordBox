-- =====================================================
-- MIGRATION: part_of_speech alanını array (JSONB) olarak güncelle
-- =====================================================
-- Bu migration mevcut VARCHAR part_of_speech değerlerini
-- JSONB array formatına dönüştürür.
-- =====================================================

-- 1. Geçici sütun oluştur
ALTER TABLE words ADD COLUMN IF NOT EXISTS part_of_speech_new JSONB DEFAULT '[]';

-- 2. Mevcut verileri dönüştür
-- Eğer part_of_speech string ise, array'e çevir
UPDATE words 
SET part_of_speech_new = 
    CASE 
        WHEN part_of_speech IS NULL THEN '[]'::jsonb
        WHEN part_of_speech::text LIKE '[%' THEN part_of_speech::jsonb  -- Zaten array ise
        ELSE jsonb_build_array(part_of_speech)  -- String ise array'e çevir
    END
WHERE part_of_speech_new = '[]' OR part_of_speech_new IS NULL;

-- 3. Eski sütunu sil ve yenisini yeniden adlandır
-- NOT: Bu işlem geri alınamaz, önce backup alın!
-- ALTER TABLE words DROP COLUMN part_of_speech;
-- ALTER TABLE words RENAME COLUMN part_of_speech_new TO part_of_speech;

-- Alternatif: Sadece tipi değiştir (PostgreSQL 12+ gerektirir)
-- ALTER TABLE words ALTER COLUMN part_of_speech TYPE JSONB USING 
--     CASE 
--         WHEN part_of_speech IS NULL THEN '[]'::jsonb
--         WHEN part_of_speech::text LIKE '[%' THEN part_of_speech::jsonb
--         ELSE jsonb_build_array(part_of_speech)
--     END;

-- =====================================================
-- ROLLBACK (gerekirse):
-- ALTER TABLE words DROP COLUMN IF EXISTS part_of_speech_new;
-- =====================================================
