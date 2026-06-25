-- ============================================================
-- 008_cover_images.sql
-- ------------------------------------------------------------
-- Purpose: 为首页背景图和文档封面图功能提供数据支撑
--
-- Changes:
--   1. documents 表新增 cover_color TEXT 列（纯色背景模式）
--   2. site_settings 表插入 hero_bg_type / hero_bg_image 默认值
--
-- Idempotency:
--   - ALTER TABLE 使用 IF NOT EXISTS (PG 11+)
--   - INSERT 使用 ON CONFLICT (key) DO NOTHING
-- ============================================================

BEGIN;

-- 1. 为 documents 表添加 cover_color 列
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS cover_color TEXT;

-- 2. site_settings: 首页 Hero 背景设置
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_bg_type',  'gradient'),
  ('hero_bg_image', '')
ON CONFLICT (key) DO NOTHING;

COMMIT;
