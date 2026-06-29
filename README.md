# DocShare - 文档共享平台

**版本**: v1.9.2  
**更新日期**: 2026 年 6 月 29 日

---

DocShare 是一个基于 Next.js 和 Supabase 构建的现代化文档共享平台，支持文档上传、在线预览、分类管理、全文搜索、书签收藏等功能，并提供完善的 Admin 后台管理能力。

## 🌟 功能特性

### 用户端
- 📄 **文档管理** - 上传、浏览、搜索和收藏文档（支持 PDF、音视频等多种格式）
- 🔍 **全文搜索** - 基于文档标题、描述和标签的智能搜索
- 🏷️ **分类与标签** - 按分类和标签组织文档，支持多维度浏览
- 🔖 **书签收藏** - 收藏喜欢的文档，随时回顾
- ✉️ **邮箱验证** - 注册后需验证邮箱才能使用完整功能
- 🎨 **多主题系统** - 支持 Light / Dark Night / Sci-Fi Green 三种主题一键切换

### 管理后台
- 📊 **数据看板** - 文档数量、用户统计、存储用量等关键指标一览
- 👥 **用户管理** - 查看、编辑用户信息与权限
- 📁 **文档管理** - 后台审核、编辑和管理所有文档
- 🏷️ **分类/标签管理** - 维护文档分类体系和标签库
- 🔐 **权限控制** - 基于角色的访问控制（Admin/Viewer）+ 文档级显式授权（默认私有）
- 📈 **数据分析** - 访问趋势、热门文档等分析报表
- 📝 **站点文案编辑** - Admin 可自定义首页 Hero 文案、特性卡片、品牌标识、底栏内容等全站内容
- 🎨 **品牌自定义** - Admin 可修改站点名称、Logo 图标，适配不同项目场景
- 🖼️ **首页背景图** - Admin 可为首页 Hero 选择预设图片或上传自定义背景图
- 📷 **文档封面图** - 文档卡片支持纯色背景+图标、预设图片、自定义上传三种封面模式
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

## 最新版本 (v1.9.2)

**发布日期**: 2026-06-29

### Bug 修复（安全性）

#### 文档预览权限绕过修复 🔒
- ✅ 修复 `document-preview.tsx` fallback 分支中绕过 `canDownload` 权限控制的直接下载链接
- ✅ 不可预览文件类型改为显示友好提示，引导用户通过受权限控制的 Download 按钮操作
- ✅ 清理未使用的 Button 和 Download 导入

> 详见：[docs/v1.9.2_2026-06-29_文档预览权限绕过修复.md](docs/v1.9.2_2026-06-29_文档预览权限绕过修复.md)

## 版本历史

### v1.9.2 (2026-06-29)
- ✅ 修复 `document-preview.tsx` fallback 分支权限绕过漏洞
- ✅ 不可预览文件类型移除直接下载链接，改为友好提示
- ✅ 清理未使用导入
> [查看详情](docs/v1.9.2_2026-06-29_文档预览权限绕过修复.md)

### v1.9.1 (2026-06-29)
- ✅ 将 iframe PDF 预览替换为 react-pdf Canvas 渲染，修复移动端无法在线阅读 PDF
- ✅ 支持逐页翻页导航、响应式宽度适配、CJK 字体渲染
- ✅ 修复预览容器 overflow-hidden 导致的内容裁剪
- ✅ PDF 加载失败时提供下载降级方案
> [查看详情](docs/v1.9.1_2026-06-29_移动端PDF预览修复.md)

### v1.9.0 (2026-06-25)
- ✅ 权限系统架构升级：角色基线 + 显式覆盖层方案
- ✅ 重写 `has_document_permission()` 函数，引入角色默认基线
- ✅ 新增权限唯一约束，防止重复授权
- ✅ 前端 canDownload 改用 RPC 统一判断
- ✅ 重构 Admin 权限管理页面 UI
- ✅ 新增权限变更审计日志
> [查看详情](docs/v1.9.0_2026-06-25_权限系统架构优化.md)

### v1.8.2 (2026-06-25)
- ✅ 导航栏新增用户帮助图标（`?`），所有用户可访问操作指南弹窗
- ✅ 弹窗包含 9 个帮助主题（入门/注册登录/浏览搜索/预览下载/收藏/设置/主题/FAQ）
- ✅ 管理员操作指南同步更新 v1.3.0~v1.8.1 功能内容
- ✅ 用户操作手册新增主题切换章节
> [查看详情](docs/v1.8.2_2026-06-25_用户帮助手册入口与文档同步更新.md)

### v1.8.1 (2026-06-25)
- ✅ 修复退出登录后 Sign In / Sign Up 按钮点击无响应问题
- ✅ 修复 Next.js Router Cache 未刷新导致登出后导航异常
- ✅ 多浏览器 Tab 登出状态自动同步（Supabase BroadcastChannel）
- ✅ 其它 Tab 登出时自动刷新 Router Cache，受保护页面正确重定向
> [查看详情](docs/v1.8.1_2026-06-25_登出后按钮失效与多Tab同步修复.md)

### v1.8.0 (2026-06-25)
- ✅ 新增 Dark Night 黑夜主题 + Sci-Fi Green 科幻主题
- ✅ Header 右侧主题切换器（下拉菜单，图标+预览色块）
- ✅ 主题选择 localStorage 持久化 + 平滑过渡动画
- ✅ Tailwind v4 @custom-variant 自定义 matrix 变体
- ✅ Admin 页面硬编码颜色 dark/matrix 适配
> [查看详情](docs/v1.8.0_2026-06-25_多主题系统实现.md)

### v1.7.0 (2026-06-25)
- ✅ 首页 Hero 支持三种背景模式（渐变/预设图/自定义上传）
- ✅ 文档卡片支持三种封面模式（默认/纯色+图标/图片）
- ✅ Admin 站点设置页 Hero 背景图管理（含实时预览）
- ✅ Admin 文档新建/编辑页 Cover Image 设置
- ✅ 可复用 ImageUploadPicker 组件 + 12 张教育主题预设图
> [查看详情](docs/v1.7.0_2026-06-25_首页背景图与文档封面图功能.md)

### v1.6.0 (2026-06-25)
- ✅ 首页特性卡片支持管理员编辑标题、描述、图标，支持整体隐藏
- ✅ 导航栏 Logo 图标和站点名称支持管理员自定义
- ✅ 底栏品牌描述和版权文字支持管理员编辑
- ✅ 首页 Categories 区域支持管理员隐藏
- ✅ 管理员设置页重构为 5 Tab 编辑界面
- ✅ 新增全局站点设置 Context 和动态图标渲染工具
> [查看详情](docs/v1.6.0_2026-06-25_站点全局可编辑扩展.md)

### v1.5.0 (2026-06-25)
- ✅ 修复 Admin Dashboard "Recently Activity" 空白问题
- ✅ 补全 4 种活动事件记录（login/logout/document_view/document_download）
- ✅ 完善 Dashboard 活动图标和 Analytics 筛选器
> [查看详情](docs/v1.5.0_2026-06-25_Admin活动日志记录系统修复与完善.md)

### v1.4.1 (2026-06-25)
- ✅ USER_GUIDE.md 新增账号有效期说明、下载权限控制说明
- ✅ admin-help-button.tsx 权限模型更新为 4 级 + 用户管理章节扩展
> [查看详情](docs/v1.4.1_2026-06-25_用户操作手册与管理员帮助指南更新.md)

### v1.4.0 (2026-06-25)
- ✅ 新增用户有效期管理功能（期间有效 / 永久有效）
- ✅ Admin 用户管理页新增 Time Permission 列，颜色徽章展示状态
- ✅ 登录流程 + 中间件层面双重检查，过期/禁用用户自动拦截
- ✅ 友好提示：被禁用/过期用户看到引导联系管理员的消息
- ✅ 数据库迁移 006（valid_from / valid_until 字段）
> [查看详情](docs/v1.4.0_2026-06-25_用户有效期管理功能.md)

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

**当前版本**: v1.9.2
