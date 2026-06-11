# DocShare 用户操作指南 / User Guide

---

## 目录 / Table of Contents

1. [注册与登录 / Registration & Login](#1-注册与登录--registration--login)
2. [浏览文档 / Browsing Documents](#2-浏览文档--browsing-documents)
3. [搜索文档 / Searching Documents](#3-搜索文档--searching-documents)
4. [查看文档 / Viewing Documents](#4-查看文档--viewing-documents)
5. [收藏与书签 / Bookmarks](#5-收藏与书签--bookmarks)
6. [个人设置 / Account Settings](#6-个人设置--account-settings)
7. [管理员后台 / Admin Panel](#7-管理员后台--admin-panel)
8. [支持的预览格式 / Supported Preview Formats](#8-支持的预览格式--supported-preview-formats)

---

## 1. 注册与登录 / Registration & Login

### 注册 / Register
1. 点击页面右上角的 **Sign Up** / Click **Sign Up** in the top-right corner
2. 填写用户名、邮箱和密码（至少 6 位）/ Enter username, email, and password (min 6 characters)
3. 点击 **Create Account** / Click **Create Account**
4. 注册成功后跳转到登录页 / After registration, you will be redirected to the login page

### 登录 / Login
1. 点击 **Sign In** / Click **Sign In**
2. 输入邮箱和密码 / Enter email and password
3. 点击 **Sign In** / Click **Sign In**

### 忘记密码 / Forgot Password
1. 在登录页点击 **Forgot your password?** / Click **Forgot your password?** on the login page
2. 输入注册邮箱 / Enter your registered email
3. 查收邮件，点击重置链接完成密码修改 / Check your inbox and click the reset link

### 测试账号 / Test Accounts

| 角色 / Role | 邮箱 / Email | 密码 / Password |
|---|---|---|
| 管理员 / Admin | admin@docshare.dev | Admin123! |
| 编辑者 / Editor | editor@docshare.dev | Editor123! |
| 查看者 / Viewer | viewer@docshare.dev | Viewer123! |

---

## 2. 浏览文档 / Browsing Documents

### 首页 / Home Page (`/`)
- 查看分类概览和最新文档 / View category overview and latest documents
- 点击分类卡片进入分类详情 / Click a category card to view its details

### 浏览页 / Browse Page (`/browse`)
- 查看所有分类（网格布局）/ View all categories in a grid layout
- 查看最新发布的文档 / View recently published documents
- 点击分类名称进入子分类 / Click a category name to drill into subcategories

### 分类详情 / Category Details (`/browse/[category]`)
- 查看分类描述和子分类 / View category description and subcategories
- 浏览该分类下所有已发布文档 / Browse all published documents in this category

### 标签浏览 / Tag Browsing (`/tags`)
- 查看所有标签及其文档数量 / View all tags with document counts
- 点击标签查看关联文档 / Click a tag to see related documents

---

## 3. 搜索文档 / Searching Documents

### 快速搜索 / Quick Search
- 使用页面顶部的搜索栏 / Use the search bar at the top of the page
- 输入关键词后按 Enter / Type keywords and press Enter

### 高级搜索 / Advanced Search (`/search`)
- 支持按标题、描述、文件名搜索 / Search by title, description, or filename
- 使用文件类型筛选（PDF / 图片 / 视频 / 音频 / HTML / 文本）/ Filter by file type
- 搜索结果以卡片形式展示 / Results displayed as document cards

---

## 4. 查看文档 / Viewing Documents

### 文档详情 / Document Details (`/doc/[slug]`)
- **在线预览**：PDF、图片、视频、音频、HTML、纯文本均可在线预览
- **Online Preview**: PDF, images, videos, audio, HTML, and plain text can be previewed online
- **下载**：点击下载按钮保存文件 / **Download**: Click the download button to save
- **收藏**：点击书签图标添加到收藏 / **Bookmark**: Click the bookmark icon to save

### 文档信息 / Document Info
右侧面板显示 / Right sidebar shows:
- 文件名、类型、大小 / Filename, type, size
- 上传时间 / Upload date
- 浏览量与下载量 / View and download counts
- 所属分类 / Category
- 上传者信息 / Uploader info
- 关联标签 / Associated tags

---

## 5. 收藏与书签 / Bookmarks

> 需要登录 / Login required

1. 在文档详情页点击书签图标 ⭐ 添加收藏 / Click the bookmark icon on the document page
2. 再次点击取消收藏 / Click again to remove
3. 访问 `/bookmarks` 查看所有收藏 / Visit `/bookmarks` to view all bookmarks
4. 悬停书签卡片可快速移除 / Hover over a bookmark card to remove quickly

---

## 6. 个人设置 / Account Settings

> 需要登录 / Login required  
> 访问 `/settings` / Visit `/settings`

### 个人资料 / Profile
- **头像**：点击上传，支持 JPG/PNG/GIF/WebP，最大 5MB
- **Avatar**: Click to upload, supports JPG/PNG/GIF/WebP, max 5MB
- **显示名称**：修改显示名称 / **Display Name**: Change your display name
- **个人简介**：添加或修改简介 / **Bio**: Add or edit your bio
- 邮箱和用户名不可修改 / Email and username cannot be changed

### 安全 / Security
- 输入当前密码和新密码（至少 8 位）/ Enter current password and new password (min 8 characters)
- 点击 **Change Password** 确认 / Click **Change Password** to confirm

---

## 7. 管理员后台 / Admin Panel

> 仅管理员可访问 / Admin only  
> 访问 `/admin` / Visit `/admin`

### 仪表盘 / Dashboard
- 查看统计概览：文档数、用户数、浏览量、下载量
- View stats: total documents, users, page views, downloads
- 查看最近用户活动 / View recent user activities

### 文档管理 / Documents (`/admin/documents`)
- 查看所有文档列表（名称、分类、状态、大小、浏览量）
- View all documents (name, category, status, size, views)
- 编辑或删除文档 / Edit or delete documents
- 点击 **Upload Document** 上传新文档 / Click **Upload Document** to upload new files

### 上传文档 / Upload Document (`/admin/documents/new`)
1. 拖拽或点击上传文件（最大 500MB）/ Drag & drop or click to upload (max 500MB)
2. 填写标题和描述 / Enter title and description
3. 选择分类 / Select a category
4. 选择标签（可多选）/ Select tags (multiple allowed)
5. 设置状态：草稿（Draft）或已发布（Published）/ Set status: Draft or Published
6. 设置是否公开 / Set visibility (public or private)
7. 点击 **Upload & Publish** / Click **Upload & Publish**

### 分类管理 / Categories (`/admin/categories`)
- 创建/编辑/删除分类 / Create, edit, or delete categories
- 支持父子层级结构 / Supports parent-child hierarchy
- 设置名称、描述和父分类 / Set name, description, and parent category

### 标签管理 / Tags (`/admin/tags`)
- 创建/编辑/删除标签 / Create, edit, or delete tags
- 选择 8 种预设颜色 / Choose from 8 preset colors

### 用户管理 / Users (`/admin/users`)
- 查看所有用户列表 / View all users
- 修改用户角色：Admin / Editor / Viewer / Change user roles
- 激活或禁用用户 / Activate or disable users

### 权限管理 / Permissions (`/admin/permissions`)
- 为特定用户授予文档或分类级别的权限
- Grant document or category-level permissions to specific users
- 权限类型：View（查看）/ Edit（编辑）/ Manage（管理）
- Permission types: View / Edit / Manage

### 分析统计 / Analytics (`/admin/analytics`)
- 查看浏览量、下载量、登录次数 / View page views, downloads, login counts
- 查看活动日志，支持按类型筛选 / View activity logs with type filtering

---

## 8. 支持的预览格式 / Supported Preview Formats

| 文件类型 / File Type | 格式 / Formats | 预览方式 / Preview |
|---|---|---|
| 文档 / Documents | PDF | 内嵌 PDF 阅读器 / Embedded PDF viewer |
| 图片 / Images | JPG, PNG, GIF, WebP, SVG | 图片查看器 / Image viewer |
| 视频 / Video | MP4, WebM, AVI | 视频播放器 / Video player |
| 音频 / Audio | MP3, WAV, OGG, WebM | 音频播放器 / Audio player |
| 网页 / Web | HTML | iframe 沙箱 / iframe sandbox |
| 文本 / Text | TXT | 代码预览 / Code preview |
| Word 文档 / Word | DOC, DOCX | 仅下载 / Download only |
| 其他 / Other | — | 仅下载 / Download only |

---

## 常见问题 / FAQ

**Q: 为什么我无法访问 `/admin`？**  
**Q: Why can't I access `/admin`?**  
A: 只有 Admin 角色的用户可以访问后台。请使用管理员账号登录。  
A: Only users with the Admin role can access the admin panel. Please log in with an admin account.

**Q: 文档上传后在哪里显示？**  
**Q: Where do uploaded documents appear?**  
A: 已发布且公开的文档会出现在对应分类和浏览页中。草稿仅管理员可见。  
A: Published and public documents appear in their category and the browse page. Drafts are only visible to admins.

**Q: 如何收藏文档？**  
**Q: How do I bookmark a document?**  
A: 登录后，在文档详情页点击书签图标即可。  
A: Log in, then click the bookmark icon on the document detail page.

**Q: 上传文件有大小限制吗？**  
**Q: Is there a file size limit?**  
A: 单个文件最大 500MB。  
A: Maximum 500MB per file.
