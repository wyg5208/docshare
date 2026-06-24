-- ============================================================
-- 004_site_settings.sql
-- ------------------------------------------------------------
-- Purpose: 站点可编辑文案存储（首页 Hero 等）
--
-- Design:
--   通用 key-value 表，便于后续扩展更多可编辑字段（footer、about 等）。
--   - 任何人（含匿名）可读：用于服务端渲染首页
--   - 仅 admin 可写：通过 RLS + is_admin() 函数
--
-- Idempotency:
--   - 表使用 IF NOT EXISTS
--   - 策略使用 DROP POLICY IF EXISTS 后重建
--   - 种子使用 ON CONFLICT DO NOTHING（仅首次插入默认值）
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site settings"   ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;

-- 任意访问者均可读（包含未登录用户访问首页）
CREATE POLICY "Public read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- 仅管理员可写
CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- updated_at 触发器
DROP TRIGGER IF EXISTS site_settings_updated ON public.site_settings;
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 种子：首页 Hero 默认文案
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_title_main',      'Your Documents,'),
  ('hero_title_highlight', 'Organized & Accessible'),
  ('hero_subtitle',        'A modern platform to publish, organize, and share your documents. Support for PDFs, images, videos, audio files, and more.')
ON CONFLICT (key) DO NOTHING;

COMMIT;
