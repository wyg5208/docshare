# 迭代记录_2026-06-24_文档权限模型修复（默认私有化）

## 基本信息
- **日期**: 2026-06-24
- **版本**: v1.1.0
- **迭代代号**: ITERATION_003 / PERMISSION_FIX
- **类型**: Bug 修复 + 默认行为语义变更（最小改动止血方案）
- **涉及模块**: 数据库迁移、文档可见性 RLS、上传/编辑页、首页/浏览页/标签页查询、Admin 权限管理页
- **状态**: ✅ 已完成

## 任务目标

修复一个影响生产环境数据可见性的关键安全/权限问题：

> **用户反馈**：新注册的普通用户登录后，能看到系统中"几乎所有"文档；而期望的产品语义是——
> **新用户默认看不到任何文档，只有 Admin 在 `/admin/permissions` 页面显式授予 view 权限后，对应文档才对该用户可见。**

本次迭代采用 **方案②（最小改动止血）**，在不大改 RLS 策略和函数签名的前提下，通过 **将历史数据默认私有化 + 修正客户端硬过滤** 的方式快速止血，恢复符合预期的权限语义。同时通过 E2E 验证确认四类典型用户场景下文档可见集合均符合预期。

## 问题诊断与分析

### 现象

| 用户 | 实际行为（修复前） | 期望行为 |
|------|-------------------|----------|
| 未登录访客 | 看到所有 published 文档 | 仅看 `is_public=true` 的文档 |
| 普通登录用户 (viewer) | 看到几乎所有文档 | 仅看 admin 显式授予 view 的文档 |
| editor | 自己上传 + 几乎所有文档 | 自己上传 + 被授权文档 |
| admin | 全部 | 全部 |

### 根因分析

经排查，这是一个由 **数据库 RLS + DB 函数 + 上传默认值 + 应用层硬过滤** 四层叠加形成的"组合 Bug"：

#### 根因 1：RLS 策略的 OR 短路

`documents` 表的 SELECT RLS 策略形如：

```sql
USING (is_public = true OR has_document_permission(id, 'view'))
```

只要 `is_public = true`，OR 短路立即放行，跳过权限检查。

#### 根因 2：上传默认值为 public

`src/app/(admin)/admin/documents/new/page.tsx` 中：

```ts
const [isPublic, setIsPublic] = useState(true); // ❌ 默认勾选公开
```

历史上传的绝大部分文档因此被存为 `is_public=true`，与根因 1 叠加 → 几乎全部文档对所有人可见。

#### 根因 3：`has_document_permission()` 函数内部冗余条款

DB 函数体内同样含 `(perm = 'view' AND d.is_public = true)` 分支，即使应用层试图通过权限检查路径也会被该条款放行。

#### 根因 4：应用层多处硬过滤 `is_public=true`

为了"展示公开文档"的产品意图，开发者在 4 个查询位置添加了 `.eq("is_public", true)`：

- `src/app/page.tsx`（首页推荐）
- `src/app/browse/page.tsx`（文档浏览）
- `src/app/browse/[slug]/page.tsx`（按分类浏览）
- `src/app/tags/[slug]/page.tsx`（按标签浏览）

这一硬过滤的副作用是：**即使 admin 已经把某个非 public 文档授权给 viewer，viewer 也仍然看不到**——因为客户端层就把它过滤掉了。这与"显式授权后应可见"的语义完全冲突。

### 综合诊断

> **不是单点 Bug，而是"默认值不安全 + RLS 短路 + 应用层硬过滤"三股力量同时作用的结果。**
> - 默认值不安全 ⇒ 历史数据全是 public
> - RLS 短路 ⇒ 所有 public 文档对所有人可见
> - 应用层硬过滤 ⇒ 显式授权失效

## 解决方案与实施（方案②：最小改动止血）

### 方案对比

| 方案 | 描述 | 改动量 | 是否本次采用 |
|------|------|--------|--------------|
| 方案① | 纯白名单：移除 `is_public OR ...`，只看权限表 | 大（改 RLS + 函数） | ❌ 推迟 |
| **方案②** | **历史数据默认私有 + 上传默认私有 + 移除应用层硬过滤** | **小** | **✅ 本次** |
| 方案③ | 引入 `visibility` 三态枚举（public/internal/private） | 大（改表结构） | ❌ 推迟 |

方案②的核心思想：**RLS 不动，但让 `is_public=true` 这一"绿色通道"在数据层面变得稀有**——历史数据全部清零、新建文档默认 false、UI 增加风险提示，从而把"显式授权"重新拉回为唯一可见路径。

### 1. 数据库迁移：默认私有化（关键）

**新增文件**：`supabase/migrations/003_default_private_docs.sql`

核心 SQL：

```sql
-- 1) 重申列默认值为 false（防止未来误回滚）
ALTER TABLE public.documents
  ALTER COLUMN is_public SET DEFAULT false;

-- 2) 历史数据一次性私有化
UPDATE public.documents
SET is_public = false
WHERE is_public = true;
```

执行后，所有历史文档进入"需显式授权才可见"的状态，未登录用户 `/browse` 页面将看到 `No documents available yet`。

### 2. 上传/编辑页默认值修改

**`src/app/(admin)/admin/documents/new/page.tsx`**

```diff
- const [isPublic, setIsPublic] = useState(true);
+ const [isPublic, setIsPublic] = useState(false);
```

UI 同步增加风险提示文案，明确告知：

> ⚠️ 勾选"公开"将使该文档对**所有访客和登录用户**可见，跳过任何权限授权。请仅在确实需要全员可见时勾选。

**`src/app/(admin)/admin/documents/[id]/edit/page.tsx`** 同样调整默认值与文案。

### 3. 移除应用层 4 处硬过滤

**`src/app/page.tsx` / `src/app/browse/page.tsx` / `src/app/browse/[slug]/page.tsx` / `src/app/tags/[slug]/page.tsx`**

```diff
  const { data } = await supabase
    .from("documents")
    .select("...")
-   .eq("is_public", true)
    .eq("status", "published")
    .order("created_at", { ascending: false });
```

移除后：
- 未登录用户 → RLS 仅放行 `is_public=true`（迁移后为 0 条）→ 看到空列表（符合预期）
- 已登录用户 → RLS 放行 `is_public=true OR has_document_permission(id,'view')` → 看到自己被授权的文档（符合预期）

**思路转变**：从"应用层决定能看什么"转为"完全信任 RLS 决定每个用户能看什么"。

### 4. Admin 权限管理页文案修正

**`src/app/(admin)/admin/permissions/page.tsx`**

更新文案以反映新的默认私有语义，明确告知 Admin：
- 文档默认对所有非作者用户**不可见**
- 必须通过本页显式授予 `view` 权限，目标用户才能看到该文档
- 如需全员可见，须在文档编辑页勾选"公开"（高风险操作）

### 5. 辅助测试与诊断脚本（运行时无影响）

| 脚本 | 用途 |
|------|------|
| `scripts/apply-003-and-verify.ts` | 应用迁移 003 并验证历史数据已全部私有化 |
| `scripts/inspect-permissions.ts` | 列出当前 `document_permissions` 表全部授权记录 |
| `scripts/test-grant-viewer.ts` | 模拟为 viewer 授予某文档 view 权限并断言可见性 |
| `scripts/test-cleanup.ts` | 清理测试授权记录，恢复干净状态 |

这些脚本仅供开发/运维使用，不被 Next.js 构建打包，不影响生产运行时。

## 技术实现细节

### 关键 SQL 片段

```sql
-- supabase/migrations/003_default_private_docs.sql
BEGIN;

ALTER TABLE public.documents
  ALTER COLUMN is_public SET DEFAULT false;

UPDATE public.documents
SET is_public = false
WHERE is_public = true;

COMMIT;
```

### RLS 策略示意（未修改，保持原样）

```sql
-- documents 表 SELECT 策略（沿用，仅靠数据层私有化达到等价效果）
CREATE POLICY documents_select ON public.documents
FOR SELECT TO authenticated, anon
USING (
  is_public = true
  OR has_document_permission(id, 'view')
);
```

### 应用层查询（修复后）

```ts
// src/app/browse/page.tsx
const { data: documents } = await supabase
  .from("documents")
  .select("id, title, slug, description, ...")
  // 不再 .eq("is_public", true)
  .eq("status", "published")
  .order("created_at", { ascending: false });
```

## 测试验证

### E2E 场景测试

| # | 场景 | 期望 | 实际 | 结果 |
|---|------|------|------|------|
| 1 | 未登录用户访问 `/browse` | 0 文档（"No documents available yet"） | 0 文档 | ✅ |
| 2 | viewer 登录后访问 `/browse`（已被授权 3 篇） | 仅看到 3 篇 | 3 篇 | ✅ |
| 3 | admin 登录后访问 `/browse` | 全部 5 篇 published 文档 | 5 篇 | ✅ |
| 4 | admin 在 `/admin/permissions` 给 viewer 新增 USER_GUIDE 的 view 权限，viewer 重新登录 | 4 篇 | 4 篇 | ✅ |
| 5 | `tsc --noEmit` 类型检查 | 全部通过 | 通过 | ✅ |

### 行为预期表（实施后）

| 用户类型 | 看到的文档集合 |
|---------|---------------|
| 未登录访客 | 仅 `is_public=true` 的文档（迁移后为空集） |
| 普通登录用户 (viewer) | 仅 admin 在 `/admin/permissions` 显式授予 `view` 的文档 |
| editor | 自己上传的文档 + 被授权的文档 |
| admin | 全部文档 |

### 类型检查

```
> tsc --noEmit
✓ 0 errors
```

## 技术栈

- **数据库**: PostgreSQL (Supabase) + RLS + SECURITY DEFINER 函数
- **后端 API**: Supabase JS Client (SSR)
- **前端**: Next.js 15 App Router + React 19
- **测试工具**: tsx + Supabase Service Role Key（脚本场景）
- **类型系统**: TypeScript strict + `tsc --noEmit`

## 经验教训

### 1. "默认值"是权限模型的一等公民

**教训**：`useState(true)` 这种看似无害的 UI 默认勾选，叠加 OR 型 RLS 策略后会瞬间放大为"全员可见"。安全相关字段的默认值必须是"最严格"的（即 `false` / `private` / `none`），让"放行"成为显式动作。

### 2. RLS 与应用层过滤要二选一，不能同时存在

**教训**：原本应用层加 `.eq("is_public", true)` 是出于"我已经替 RLS 兜底"的好意，但实际把 RLS 想要表达的"已授权可见"语义完全屏蔽了。
**原则**：信任 RLS，应用层只负责业务过滤（status、order、search 等），不重复表达可见性。

### 3. OR 型策略的危险性

**教训**：`USING (A OR B)` 在 PostgreSQL 中是短路求值，只要 A 为真就不评估 B。当 A（`is_public=true`）的"为真概率"很高时，B（细粒度权限）几乎不起作用。
**改进方向（后续）**：引入 `visibility` 三态枚举（方案③），让 RLS 改为 `CASE` 分支语义，避免短路陷阱。

### 4. 渐进式修复优于推倒重来

本次采用方案②（最小改动）而非方案①（推倒 RLS）：
- 优点：改动面小、风险低、可在 1 个迭代内交付
- 代价：方案②保留了方案①的隐患（见下"局限性"）

## 局限性与已知风险

方案②是"止血"方案而非"根治"方案，以下风险**仍然存在**：

1. **`is_public=true` 仍是绿色通道**：RLS 中 `is_public = true OR ...` 的策略未修改。若未来某个开发者或 Admin 误把某文档 `is_public` 设为 true，所有登录用户和访客将立刻可见，**绕过任何权限表配置**。

2. **`has_document_permission()` 函数内部仍含 `is_public` 短路条款**：影响面与上一条相同。

3. **没有审计日志**：本次未引入"谁、何时、把哪个文档设为 public"的审计追踪。

### 后续升级路径

| 阶段 | 方案 | 主要工作 |
|------|------|---------|
| 短期（已交付） | 方案② | 数据私有化 + UI 默认值 + 移除硬过滤 |
| 中期 | 方案① | 重写 RLS：`USING (has_document_permission(id, 'view'))`，移除 `is_public` 通道 |
| 长期 | 方案③ | 引入 `visibility ENUM('public','internal','private')`，RLS 按枚举值分支 |

## 交付物清单

### 新增文件

1. `supabase/migrations/003_default_private_docs.sql` —— 历史数据私有化迁移
2. `scripts/apply-003-and-verify.ts` —— 迁移应用与验证脚本
3. `scripts/inspect-permissions.ts` —— 权限表巡检脚本
4. `scripts/test-grant-viewer.ts` —— 授权可见性 E2E 验证脚本
5. `scripts/test-cleanup.ts` —— 测试授权清理脚本
6. `docs/ITERATION_003_PERMISSION_FIX.md` —— 本迭代记录文档

### 修改文件

1. `src/app/(admin)/admin/documents/new/page.tsx` —— `isPublic` 默认值 `true → false`，新增风险提示
2. `src/app/(admin)/admin/documents/[id]/edit/page.tsx` —— 同上
3. `src/app/(admin)/admin/permissions/page.tsx` —— 文案更新反映"默认私有"语义
4. `src/app/page.tsx` —— 移除 `.eq("is_public", true)` 硬过滤
5. `src/app/browse/page.tsx` —— 移除 `.eq("is_public", true)` 硬过滤
6. `src/app/browse/[slug]/page.tsx` —— 移除 `.eq("is_public", true)` 硬过滤
7. `src/app/tags/[slug]/page.tsx` —— 移除 `.eq("is_public", true)` 硬过滤
8. `README.md` —— 版本号、版本历史、最新版本说明同步更新

## 下一步优化建议

### 短期（1~2 个迭代）

1. **引入"公开文档"二次确认**：在编辑页勾选 `isPublic=true` 时弹出确认弹窗，要求 Admin 输入文档标题以确认。
2. **审计日志**：对 `documents.is_public` 字段从 false → true 的变更打点记录，写入 `audit_log` 表。
3. **`/admin/permissions` 页面新增"公开文档"清单 Tab**：让 Admin 一眼看到当前所有 `is_public=true` 的文档，便于复盘。

### 中期（3~6 个迭代）

1. **升级到方案①（白名单 RLS）**：移除 `is_public` 通道，所有可见性走权限表。需要先把"全员可见"的需求改用"授权给 'all_users' 系统角色"实现。
2. **修复 `has_document_permission()` 函数**：删除 `(perm = 'view' AND d.is_public = true)` 内部短路条款。

### 长期

1. **方案③：visibility 三态枚举**，配合组织/团队级共享、过期时间等高级权限场景。
2. **基于 ABAC（属性级访问控制）的策略引擎**，支持按部门、按标签、按时间窗口的细粒度授权。

## 验收标准

- [x] 历史 `documents.is_public=true` 的记录全部更新为 false
- [x] `documents.is_public` 列默认值为 false
- [x] 上传/编辑页 `isPublic` 默认未勾选
- [x] 上传/编辑页含明确风险提示文案
- [x] 4 处应用层 `.eq("is_public", true)` 硬过滤已移除
- [x] 未登录用户 `/browse` 显示空列表
- [x] viewer 仅看到被显式授权的文档
- [x] admin 显式授权后，viewer 立即（重新登录）可见目标文档
- [x] admin 仍可看到全部文档
- [x] `tsc --noEmit` 通过
- [x] 迭代记录文档已生成
- [x] README.md 版本号、版本历史已同步

## 总结

本次迭代以 **"最小改动止血"** 为指导思想，用 **1 条数据库迁移 + 2 处 UI 默认值修改 + 4 处应用层硬过滤移除 + 1 处文案修正** 的极小改动量，修复了一个长期隐藏的"权限越权可见"严重问题，恢复了"默认私有 + 显式授权才可见"的产品语义。

E2E 验证证明：四类用户场景（未登录 / viewer / admin / 授权后 viewer）的文档可见集合均与预期一致，且 TypeScript 类型检查 0 错误。

虽然本方案保留了 `is_public=true` 这条 RLS 绿色通道作为已知风险，但通过"数据层清零 + UI 强警告"已经把误用概率降到极低；后续可通过方案①（白名单 RLS）或方案③（visibility 枚举）做根治升级。

> **核心收获**：权限相关字段的"默认值"和"应用层兜底过滤"是两个最容易被忽视的攻击面。本次问题恰恰是这两个反模式同时存在导致的——任何一个单独都不会出问题，但组合起来就是"全员可见"的灾难。
