-- ============================================================
-- 009_permission_role_baseline.sql
-- ------------------------------------------------------------
-- Purpose: 为权限检查引入角色默认基线 + 用户组分类权限支持
--
-- 评审修订 v2:
--   1. 角色基线仅对 required_perm >= 'download' 生效，不影响 RLS 可见性
--   2. 完整重建所有 4 条 documents RLS 策略（修复 CASCADE 遗漏）
--   3. 新增用户组对分类的权限检查
--   4. 唯一性约束 + 数据清理（保留最高权限记录）
--   5. 审计日志扩展
-- ============================================================

BEGIN;

-- ============================================================
-- Part 1: 重写 has_document_permission() 函数
-- ============================================================
DROP FUNCTION IF EXISTS has_document_permission(UUID, permission_type) CASCADE;

CREATE OR REPLACE FUNCTION has_document_permission(doc_id UUID, required_perm permission_type)
RETURNS boolean AS $$
DECLARE
  perm_level INT;
  user_max_level INT := 0;
  doc_is_public BOOLEAN;
  user_role_text TEXT;
  role_base_level INT := 0;
  temp_level INT;
BEGIN
  -- Admin bypasses all permission checks
  IF is_admin() THEN RETURN true; END IF;

  -- Map required permission to numeric level
  perm_level := CASE required_perm
    WHEN 'view' THEN 1
    WHEN 'download' THEN 2
    WHEN 'edit' THEN 3
    WHEN 'manage' THEN 4
    ELSE 0
  END;

  -- Step 1: Public document check (grants view level = 1)
  SELECT d.is_public INTO doc_is_public FROM public.documents d WHERE d.id = doc_id;
  IF doc_is_public = true AND perm_level <= 1 THEN
    RETURN true;
  END IF;

  -- Step 2: Explicit user permissions on this document
  SELECT COALESCE(MAX(
    CASE p.permission
      WHEN 'view' THEN 1 WHEN 'download' THEN 2
      WHEN 'edit' THEN 3 WHEN 'manage' THEN 4 ELSE 0
    END
  ), 0) INTO temp_level
  FROM public.permissions p
  WHERE p.document_id = doc_id AND p.user_id = auth.uid()
    AND (p.expires_at IS NULL OR p.expires_at > now());
  user_max_level := GREATEST(user_max_level, temp_level);

  -- Step 3: Group permissions on this document
  SELECT COALESCE(MAX(
    CASE gp.permission
      WHEN 'view' THEN 1 WHEN 'download' THEN 2
      WHEN 'edit' THEN 3 WHEN 'manage' THEN 4 ELSE 0
    END
  ), 0) INTO temp_level
  FROM public.group_permissions gp
  JOIN public.user_group_members ugm ON ugm.group_id = gp.group_id
  WHERE gp.document_id = doc_id AND ugm.user_id = auth.uid();
  user_max_level := GREATEST(user_max_level, temp_level);

  -- Step 4: Category-level user permissions
  SELECT COALESCE(MAX(
    CASE p.permission
      WHEN 'view' THEN 1 WHEN 'download' THEN 2
      WHEN 'edit' THEN 3 WHEN 'manage' THEN 4 ELSE 0
    END
  ), 0) INTO temp_level
  FROM public.permissions p
  JOIN public.documents d ON d.id = doc_id
  WHERE p.category_id = d.category_id AND p.user_id = auth.uid()
    AND (p.expires_at IS NULL OR p.expires_at > now());
  user_max_level := GREATEST(user_max_level, temp_level);

  -- Step 5: Group permissions on category (NEW)
  SELECT COALESCE(MAX(
    CASE gp.permission
      WHEN 'view' THEN 1 WHEN 'download' THEN 2
      WHEN 'edit' THEN 3 WHEN 'manage' THEN 4 ELSE 0
    END
  ), 0) INTO temp_level
  FROM public.group_permissions gp
  JOIN public.user_group_members ugm ON ugm.group_id = gp.group_id
  JOIN public.documents d ON d.id = doc_id
  WHERE gp.category_id = d.category_id AND ugm.user_id = auth.uid();
  user_max_level := GREATEST(user_max_level, temp_level);

  -- Step 6: Role baseline — ONLY for operations beyond 'view'
  -- This ensures Editor role does NOT bypass RLS visibility,
  -- but grants download capability on documents they can already see.
  IF perm_level > 1 THEN
    SELECT role INTO user_role_text FROM public.profiles WHERE id = auth.uid();
    role_base_level := CASE user_role_text
      WHEN 'editor' THEN 2  -- Editor baseline = download
      ELSE 0               -- Viewer has no baseline
    END;
    user_max_level := GREATEST(user_max_level, role_base_level);
  END IF;

  RETURN user_max_level >= perm_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- Part 2: 完整重建所有 documents 表 RLS 策略
-- CASCADE 仅删除依赖 has_document_permission() 的策略 (SELECT, UPDATE)，
-- INSERT/DELETE 策略不依赖该函数，需显式 DROP。
-- ============================================================
DROP POLICY IF EXISTS "Public documents viewable" ON public.documents;
DROP POLICY IF EXISTS "Editors modify own docs" ON public.documents;
DROP POLICY IF EXISTS "Editors can insert" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete" ON public.documents;

CREATE POLICY "Public documents viewable" ON public.documents FOR SELECT
  USING (is_public = true OR has_document_permission(id, 'view'));

CREATE POLICY "Editors modify own docs" ON public.documents FOR UPDATE
  USING (uploaded_by = auth.uid() OR has_document_permission(id, 'edit'));

CREATE POLICY "Editors can insert" ON public.documents FOR INSERT
  WITH CHECK (is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "Admins can delete" ON public.documents FOR DELETE
  USING (is_admin() OR uploaded_by = auth.uid());

-- ============================================================
-- Part 3: 清理重复权限记录（保留权限等级最高的记录，等级相同则保留最新）
-- ============================================================
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id,
        COALESCE(document_id, '00000000-0000-0000-0000-000000000000'),
        COALESCE(category_id, '00000000-0000-0000-0000-000000000000')
      ORDER BY
        CASE permission
          WHEN 'manage' THEN 4 WHEN 'edit' THEN 3
          WHEN 'download' THEN 2 ELSE 1
        END DESC,
        created_at DESC
    ) AS rn
  FROM public.permissions
)
DELETE FROM public.permissions
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ============================================================
-- Part 4: 创建唯一约束（防止重复授权）
-- 使用 UNIQUE CONSTRAINT（而非 UNIQUE INDEX）以兼容 PostgREST 的 upsert/onConflict 语义。
-- PostgreSQL 中 NULL 值在唯一约束中被视为不同值，因此：
--   - (user1, doc1) 与 (user1, doc1) → 重复，被阻止 ✓
--   - (user1, NULL) 与 (user1, NULL) → 不重复（NULLs distinct） ✓
-- ============================================================
ALTER TABLE public.permissions
  ADD CONSTRAINT uq_user_doc_perm UNIQUE (user_id, document_id);

ALTER TABLE public.permissions
  ADD CONSTRAINT uq_user_cat_perm UNIQUE (user_id, category_id);

-- ============================================================
-- Part 5: 扩展审计日志枚举
-- ============================================================
ALTER TYPE access_action ADD VALUE IF NOT EXISTS 'permission_grant';
ALTER TYPE access_action ADD VALUE IF NOT EXISTS 'permission_revoke';

COMMIT;
