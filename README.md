# DocShare - 文档共享平台

**版本**: v1.4.0  
**更新日期**: 2026 年 6 月 25 日

---

DocShare 是一个基于 Next.js 和 Supabase 构建的现代化文档共享平台，支持文档上传、在线预览、分类管理、全文搜索、书签收藏等功能，并提供完善的 Admin 后台管理能力。

## 🌟 功能特性

### 用户端
- 📄 **文档管理** - 上传、浏览、搜索和收藏文档（支持 PDF、音视频等多种格式）
- 🔍 **全文搜索** - 基于文档标题、描述和标签的智能搜索
- 🏷️ **分类与标签** - 按分类和标签组织文档，支持多维度浏览
- 🔖 **书签收藏** - 收藏喜欢的文档，随时回顾
- ✉️ **邮箱验证** - 注册后需验证邮箱才能使用完整功能
- 🌙 **暗色模式** - 支持明/暗主题切换

### 管理后台
- 📊 **数据看板** - 文档数量、用户统计、存储用量等关键指标一览
- 👥 **用户管理** - 查看、编辑用户信息与权限
- 📁 **文档管理** - 后台审核、编辑和管理所有文档
- 🏷️ **分类/标签管理** - 维护文档分类体系和标签库
- 🔐 **权限控制** - 基于角色的访问控制（Admin/Viewer）+ 文档级显式授权（默认私有）
- 📈 **数据分析** - 访问趋势、热门文档等分析报表
- 📝 **站点文案编辑** - Admin 可自定义首页 Hero 文案，无需改代码
- 📖 **操作指南** - 内置交互式管理员操作帮助

### 运维
- 💓 **心跳机制** - 自动保持 Supabase 项目活跃（Vercel Cron Job）
- 🔒 **中间件安全** - 统一的路由保护和认证检查

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) + React 19 |
| 样式 | Tailwind CSS 4 |
| 后端/数据库 | Supabase (PostgreSQL + Auth + Storage) |
| 认证 | Supabase Auth (SSR) |
| 图表 | Recharts |
| PDF 预览 | react-pdf |
| 音频可视化 | wavesurfer.js |
| 部署 | Vercel |
| 语言 | TypeScript |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Supabase 项目（[supabase.com](https://supabase.com)）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd share_web
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**

   复制 `.env.example` 为 `.env.local` 并填入你的 Supabase 配置：
   ```bash
   cp .env.example .env.local
   ```

   需要配置的变量：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   SUPABASE_SECRET_KEY=sb_secret_your-key
   CRON_SECRET=your-random-secret-here   # 用 openssl rand -hex 32 生成
   ```

4. **初始化数据（可选）**
   ```bash
   npm run seed
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 [http://localhost:3000](http://localhost:3000)

### 生产部署

项目针对 Vercel 部署优化，`vercel.json` 已配置 Cron Job 心跳任务：

```json
{
  "crons": [{ "path": "/api/health", "schedule": "0 0 * * *" }]
}
```

> ⚠️ 部署到 Vercel 后，需在 Dashboard 中配置 `CRON_SECRET` 环境变量。

## 📂 项目结构

```
src/
├── app/
│   ├── (admin)/admin/     # 管理后台（文档、用户、分类、标签、权限、分析）
│   ├── (auth)/            # 认证页面（登录、注册、忘记密码、邮箱验证）
│   ├── (dashboard)/       # 用户面板（书签、设置）
│   ├── (public)/          # 公开页面布局
│   ├── api/               # API 路由（analytics, auth, bookmarks, documents, health, search）
│   ├── browse/            # 文档浏览
│   ├── doc/               # 文档详情
│   ├── search/            # 搜索结果
│   └── tags/              # 标签页面
├── components/            # 公共组件
├── lib/                   # 工具库（Supabase 客户端、中间件等）
└── middleware.ts          # Next.js 中间件
```

## 📖 文档

- [用户操作指南](docs/USER_GUIDE.md)
- [管理员操作指南](docs/ADMIN_OPERATIONS_GUIDE.md)
- [迭代记录](docs/) - 每次版本更新的详细记录

## 最新版本 (v1.4.0)

**发布日期**: 2026-06-25

### 新增功能

#### 用户有效期管理 📅
- ✅ 管理员可设置用户激活有效期（期间有效 / 永久有效）
- ✅ Admin 用户管理页新增 **Time Permission** 列，以颜色徽章直观展示状态
- ✅ 支持四种状态标识：Permanent（绿色）、Valid（蓝色）、Expired（橙色）、Disabled（红色）
- ✅ 内联日期选择器，快速编辑用户有效期

### 安全增强
- ✅ 登录流程新增用户状态与有效期检查，过期/禁用用户无法登录
- ✅ 中间件层面实时拦截过期用户的受保护路由访问
- ✅ 友好提醒提示：被禁用/过期用户登录时显示引导联系管理员的消息

### 技术改进
- 📝 数据库新增 `valid_from` / `valid_until` 字段（迁移 006）
- 🎨 中间件 profile 查询缓存优化，避免重复 DB 查询
- 🔐 `/api/users` PATCH 端点新增 `set_validity` action

> 详见：[docs/v1.4.0_2026-06-25_用户有效期管理功能.md](docs/v1.4.0_2026-06-25_用户有效期管理功能.md)

## 版本历史

### v1.4.0 (2026-06-25)
- ✅ 新增用户有效期管理功能（期间有效 / 永久有效）
- ✅ Admin 用户管理页新增 Time Permission 列，颜色徽章展示状态
- ✅ 登录流程 + 中间件层面双重检查，过期/禁用用户自动拦截
- ✅ 友好提示：被禁用/过期用户看到引导联系管理员的消息
- ✅ 数据库迁移 006（valid_from / valid_until 字段）

### v1.3.0 (2026-06-25)
- ✅ 权限模型新增 `download` 级别，实现"仅浏览不可下载"的细粒度控制
- ✅ 修复用户管理 Deactivate 按钮因 RLS 静默失效的 Bug
- ✅ 新增用户物理删除功能（服务端 API route + admin client）
- ✅ 新增数据库迁移 005 + `/api/users` API route
> [查看详情](docs/v1.3.0_2026-06-25_权限下载级别扩展与用户管理完善.md)

### v1.2.0 (2026-06-24)
- ✅ 新增 `site_settings` 键值表 + Admin 编辑页 `/admin/site-settings`
- ✅ 首页 Hero 文案可由 Admin 自助修改，无需改代码重新部署
- ✅ 修复 Settings 页文件上传控件中文问题，强制英文 UI
- ✅ 数据库迁移 004 幂等可重复执行

### v1.1.1 (2026-06-24)
- ✅ 修复 5 个公共页面（`/browse`、`/browse/[slug]`、`/search`、`/tags`、`/tags/[slug]`）顶部导航栏缺失问题
- ✅ 统一站点 Header/Footer 在所有用户可达页面的一致展示
- ✅ 沉淀 Next.js 路由组布局陷阱的诊断与最小改动修复方案

### v1.1.0 (2026-06-24)
- ✅ 修复文档权限模型越权可见问题（方案②：最小改动止血）
- ✅ 新增数据库迁移 003，历史文档默认私有化
- ✅ 上传/编辑页 `isPublic` 默认值改为 false 并增加风险提示
- ✅ 移除应用层 4 处 `is_public=true` 硬过滤，统一交由 RLS 决定可见性
- ✅ `/admin/permissions` 文案同步默认私有语义
- ✅ 新增 4 个测试/诊断脚本，E2E 覆盖未登录/viewer/admin/授权后 4 类场景

### v1.0.1 (2026-06-12)
- ✅ 修复 Admin 用户角色数据问题，恢复后台访问和 Dashboard 按钮
- ✅ 新增 Supabase 心跳机制，防止免费套餐项目自动休眠
- ✅ 中间件优化：API 路由快速通道 + 邮箱验证门控
- ✅ 登录/注册流程增加邮箱验证状态检查
- ✅ 新增 `vercel.json` Cron Job 配置和 `CRON_SECRET` 环境变量

### v1.0.0 (2026-06-11)
- ✅ DocShare 文档共享平台初始发布
- ✅ 文档上传、浏览、搜索、收藏等核心功能
- ✅ Admin 后台管理（用户、文档、分类、标签、权限、分析）
- ✅ Supabase Auth 认证集成（登录、注册、密码重置）
- ✅ 基于角色的访问控制（Admin/Viewer）
- ✅ 暗色模式支持
- ✅ PWA 支持（manifest 配置）

---

**当前版本**: v1.4.0
