-- ============================================================
-- 007_site_settings_extend.sql
-- ------------------------------------------------------------
-- Purpose: 扩展 site_settings 表，新增品牌、特性卡片、底栏、区域可见性设置
--
-- Design:
--   复用现有 key-value 表结构，仅插入新的默认值。
--   所有新 key 均使用 ON CONFLICT DO NOTHING 保证幂等。
--
-- Idempotency:
--   - INSERT 使用 ON CONFLICT (key) DO NOTHING
-- ============================================================

BEGIN;

-- 品牌设置
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name',    'DocShare'),
  ('site_icon',    'file-text')
ON CONFLICT (key) DO NOTHING;

-- 特性卡片区域
INSERT INTO public.site_settings (key, value) VALUES
  ('features_visible',     'true'),
  ('feature_card_1_title', 'Multi-Format Support'),
  ('feature_card_1_desc',  'Upload and preview PDFs, images, videos, audio files, and more directly in the browser.'),
  ('feature_card_1_icon',  'file-text'),
  ('feature_card_2_title', 'Smart Organization'),
  ('feature_card_2_desc',  'Organize documents with categories, tags, and powerful search to find what you need instantly.'),
  ('feature_card_2_icon',  'folder-open'),
  ('feature_card_3_title', 'Access Control'),
  ('feature_card_3_desc',  'Fine-grained permissions to control who can view and manage your documents.'),
  ('feature_card_3_icon',  'shield')
ON CONFLICT (key) DO NOTHING;

-- 首页区域可见性
INSERT INTO public.site_settings (key, value) VALUES
  ('categories_visible', 'true')
ON CONFLICT (key) DO NOTHING;

-- 底栏设置
INSERT INTO public.site_settings (key, value) VALUES
  ('footer_description', 'A modern document publishing and sharing platform. Upload, organize, and share your documents with ease.'),
  ('footer_copyright',   '')
ON CONFLICT (key) DO NOTHING;

COMMIT;
