-- ============================================================
-- 005_permission_download_level.sql
-- ------------------------------------------------------------
-- Purpose: 将权限模型从 3 级 (view/edit/manage) 扩展为 4 级:
--   view     = Only View (仅浏览，不可下载)
--   download = View + Download (可浏览 + 可下载)
--   edit     = View + Download + Edit
--   manage   = 全部权限
--
-- Changes:
--   1. 为 permission_type 枚举新增 'download' 值
--   2. 重写 has_document_permission() 实现层级权限判断
--      权限层级: view < download < edit < manage
--      拥有更高权限自动包含低级权限
-- ============================================================

BEGIN;

-- 1. Add 'download' to the permission_type enum
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'download' AFTER 'view';

COMMIT;

-- Note: ALTER TYPE ADD VALUE cannot run inside a transaction in PG < 12,
-- but Supabase uses PG 15+, so wrapping in BEGIN/COMMIT is safe.

-- 2. Drop and recreate has_document_permission() to support hierarchical permission checks
-- Must DROP CASCADE because RLS policies depend on this function
DROP FUNCTION IF EXISTS has_document_permission(UUID, permission_type) CASCADE;

CREATE OR REPLACE FUNCTION has_document_permission(doc_id UUID, required_perm permission_type)
RETURNS boolean AS $$
DECLARE
  perm_level INT;
  user_max_level INT := 0;
  doc_is_public BOOLEAN;
BEGIN
  -- Admin bypasses all permission checks
  IF is_admin() THEN RETURN true; END IF;

  -- Map permission levels (higher number = more privileges)
  -- view=1, download=2, edit=3, manage=4
  perm_level := CASE required_perm
    WHEN 'view' THEN 1
    WHEN 'download' THEN 2
    WHEN 'edit' THEN 3
    WHEN 'manage' THEN 4
    ELSE 0
  END;

  -- Check if document is public (public docs grant 'view' level = 1)
  SELECT d.is_public INTO doc_is_public
  FROM public.documents d WHERE d.id = doc_id;

  IF doc_is_public = true AND perm_level <= 1 THEN
    RETURN true;
  END IF;

  -- Check explicit user permissions on this document
  SELECT COALESCE(MAX(
    CASE p.permission
      WHEN 'view' THEN 1
      WHEN 'download' THEN 2
      WHEN 'edit' THEN 3
      WHEN 'manage' THEN 4
      ELSE 0
    END
  ), 0) INTO user_max_level
  FROM public.permissions p
  WHERE p.document_id = doc_id
    AND p.user_id = auth.uid()
    AND (p.expires_at IS NULL OR p.expires_at > now());

  IF user_max_level >= perm_level THEN
    RETURN true;
  END IF;

  -- Check group permissions on this document
  SELECT COALESCE(MAX(
    CASE gp.permission
      WHEN 'view' THEN 1
      WHEN 'download' THEN 2
      WHEN 'edit' THEN 3
      WHEN 'manage' THEN 4
      ELSE 0
    END
  ), 0) INTO user_max_level
  FROM public.group_permissions gp
  JOIN public.user_group_members ugm ON ugm.group_id = gp.group_id
  WHERE gp.document_id = doc_id AND ugm.user_id = auth.uid();

  IF user_max_level >= perm_level THEN
    RETURN true;
  END IF;

  -- Check category-level permissions
  SELECT COALESCE(MAX(
    CASE p.permission
      WHEN 'view' THEN 1
      WHEN 'download' THEN 2
      WHEN 'edit' THEN 3
      WHEN 'manage' THEN 4
      ELSE 0
    END
  ), 0) INTO user_max_level
  FROM public.permissions p
  JOIN public.documents d ON d.id = doc_id
  WHERE p.category_id = d.category_id
    AND p.user_id = auth.uid()
    AND (p.expires_at IS NULL OR p.expires_at > now());

  IF user_max_level >= perm_level THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Recreate the RLS policies that were dropped by CASCADE
CREATE POLICY "Public documents viewable" ON public.documents FOR SELECT
  USING (is_public = true OR has_document_permission(id, 'view'));

CREATE POLICY "Editors modify own docs" ON public.documents FOR UPDATE
  USING (uploaded_by = auth.uid() OR has_document_permission(id, 'edit'));

