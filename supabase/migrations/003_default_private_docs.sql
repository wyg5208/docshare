-- ============================================================
-- 003_default_private_docs.sql
-- ------------------------------------------------------------
-- Purpose: 默认私有化文档（最小改动止血方案）
--
-- Background:
--   原 RLS 策略 USING (is_public = true OR has_document_permission(...))
--   配合上传页默认 isPublic=true，导致新用户能看到几乎所有文档。
--   本迁移采取"通过数据状态约束权限"的最小改动思路：
--     - 不修改 RLS 策略 / 函数（保持向后兼容）
--     - 把所有历史 is_public=true 的文档改为 false
--     - 新文档默认 is_public=false（前端默认值同步修改）
--   这样 RLS 中的 OR 短路只剩 has_document_permission 分支生效，
--   未授权用户将看不到任何文档，符合"白名单"语义。
--
-- 影响：
--   - 现有所有文档将变为「非公开」，必须由管理员到 /admin/permissions
--     页面或重新勾选「Publicly accessible」后才会再次可见。
--   - 管理员（is_admin()）始终可见全部，不受影响。
-- ============================================================

BEGIN;

-- 紧急止血：把现有所有文档批量回填为非公开
UPDATE public.documents
SET is_public = false,
    updated_at = now()
WHERE is_public = true;

-- documents.is_public 默认值已为 false（见 001_initial_schema.sql L59），
-- 此处仅做 idempotent 重申，避免未来迁移误改默认值。
ALTER TABLE public.documents
  ALTER COLUMN is_public SET DEFAULT false;

COMMIT;
