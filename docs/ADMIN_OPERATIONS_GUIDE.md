# DocShare — Administrator Operations Guide

**Live URL:** [https://docshare.wyg.life](https://docshare.wyg.life)

---

## Table of Contents

1. [Initial Setup Checklist](#1-initial-setup-checklist)
2. [Login Credentials](#2-login-credentials)
3. [First-Time Admin Setup](#3-first-time-admin-setup)
4. [Managing Documents](#4-managing-documents)
5. [Managing Categories](#5-managing-categories)
6. [Managing Tags](#6-managing-tags)
7. [Managing Users](#7-managing-users)
8. [Managing Permissions](#8-managing-permissions)
9. [Site Settings](#9-site-settings)
10. [Analytics & Monitoring](#10-analytics--monitoring)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Initial Setup Checklist

Before the system is fully operational, ensure the following steps are completed:

| Step | Status | Description |
|------|--------|-------------|
| ✅ Database migration | Done | All tables, RLS policies, and triggers created |
| ✅ Seed data | Done | Default categories and tags populated |
| ✅ Test accounts | Done | Admin, Editor, and Viewer accounts created |
| ✅ Storage buckets | Done | `documents` (private, 500MB) and `avatars` (public, 5MB) created |
| ✅ Domain binding | Done | Custom domain `docshare.wyg.life` configured |
| ✅ Auth callback URL | Done | Supabase Auth redirect URL configured |

### Supabase Auth Configuration

Ensure these are set in **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL:** `https://docshare.wyg.life`
- **Redirect URLs:** `https://docshare.wyg.life/api/auth/callback`

---

## 2. Login Credentials

### Pre-configured Test Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@docshare.dev | Admin123! | Full system access |
| **Editor** | editor@docshare.dev | Editor123! | Upload & manage documents |
| **Viewer** | viewer@docshare.dev | Viewer123! | Browse & download public documents |

### Login Instructions

1. Navigate to [https://docshare.wyg.life/login](https://docshare.wyg.life/login)
2. Enter the email address and password
3. Click **Sign In**
4. You will be redirected to the home page

> **Security Note:** It is strongly recommended to change all default passwords after first login. Go to [https://docshare.wyg.life/settings](https://docshare.wyg.life/settings) → Security tab to update your password.

---

## 3. First-Time Admin Setup

### Accessing the Admin Panel

1. Log in with the admin account (admin@docshare.dev)
2. Click the **Dashboard** button in the top navigation bar (blue button with dashboard icon)
3. Or navigate directly to [https://docshare.wyg.life/admin](https://docshare.wyg.life/admin)

### Admin Panel Overview

The admin dashboard provides:
- **Statistics Cards:** Total documents, users, page views, and downloads at a glance
- **Recent Activity:** Last 10 user actions (logins, views, downloads)
- **Sidebar Navigation:** Quick access to all management sections

### Recommended First Steps

1. **Review Categories** → `/admin/categories`
   - Edit or delete default categories
   - Create categories that match your organization's structure
   - Set up parent-child hierarchies for complex taxonomies

2. **Customize Tags** → `/admin/tags`
   - Remove default tags or add new ones
   - Assign meaningful colors for visual identification

3. **Upload Initial Documents** → `/admin/documents/new`
   - Start with a few key documents to test the system
   - Assign appropriate categories and tags

4. **Create User Accounts** (if needed)
   - Users can self-register at `/register`
   - Or use the seed script to create additional test accounts

---

## 4. Managing Documents

### Uploading a New Document

1. Navigate to **Admin → Documents** → Click **Upload Document**
2. Drag and drop a file or click to browse (max 500MB)
3. Fill in the details:
   - **Title** (required): Display name for the document
   - **Description** (optional): Brief summary shown on the document page
   - **Category**: Select from the category tree
   - **Status**: 
     - `Published` — visible to users (based on public/private setting)
     - `Draft` — only visible in admin panel
   - **Publicly accessible**: 
     - ✅ Checked — anyone can view without login
     - ☐ Unchecked — only logged-in users can view
4. Select relevant **Tags** (click to toggle, multiple allowed)
5. **Cover Image** (optional): Set a visual cover for the document card
   - **None** — default file type icon
   - **Color** — solid color background with white icon (pick from 12 preset colors)
   - **Preset** — choose from 12 document-themed Unsplash images
   - **Custom** — upload your own cover image (max 5MB)
6. Click **Upload Document**

**Supported file formats:**
| Type | Formats | Preview |
|------|---------|---------|
| Documents | PDF | ✅ Inline PDF viewer |
| Images | JPG, PNG, GIF, WebP, SVG | ✅ Image viewer |
| Video | MP4, WebM, AVI | ✅ Video player |
| Audio | MP3, WAV, OGG | ✅ Audio player |
| Web pages | HTML | ✅ iframe preview |
| Text files | TXT | ✅ Code/text preview |
| Word documents | DOC, DOCX | ❌ Download only |
| Other files | Any | ❌ Download only |

### Editing a Document

1. Go to **Admin → Documents**
2. Click the **⋮** (actions menu) on the document row
3. Select **Edit**
4. Modify title, description, category, tags, status, or visibility
5. Optionally upload a **replacement file** (the old file is kept until replaced)
6. Optionally update the **Cover Image** (same options as upload: None/Color/Preset/Custom)
7. Click **Save Changes**

### Deleting a Document

1. Click the **⋮** (actions menu) on the document row
2. Select **Delete**
3. Confirm the deletion in the dialog

> **Warning:** Deletion is permanent and cannot be undone. The file is also removed from storage.

---

## 5. Managing Categories

### Creating a Category

1. Navigate to **Admin → Categories**
2. Click **New Category**
3. Fill in:
   - **Name**: Display name (e.g., "Technical Reports")
   - **Description** (optional): Shown on the browse page
   - **Parent Category** (optional): Select to create a subcategory
4. Click **Save**

> A URL-friendly slug is auto-generated from the name (e.g., "Technical Reports" → `technical-reports`).

### Editing a Category

- Click the **Edit** button next to the category name
- Modify the name, description, or parent assignment
- Save changes

### Deleting a Category

- Click the **Delete** button
- Documents in this category will **not** be deleted — they become uncategorized

### Best Practices

- Use a **flat structure** (1-2 levels) for simple organizations
- Use a **hierarchical structure** (parent → child) for complex taxonomies
- Keep names short and descriptive

---

## 6. Managing Tags

### Creating a Tag

1. Navigate to **Admin → Tags**
2. Click **New Tag**
3. Enter a tag name (e.g., "Urgent", "Reference", "Draft")
4. Select a color from the 8 preset options
5. Click **Save**

### Using Tags

- Tags are applied to documents during upload or editing
- Multiple tags can be assigned to a single document
- Users can browse documents by tag at `/tags`
- Tags appear on document detail pages and are clickable

### Deleting a Tag

- Removing a tag detaches it from all associated documents
- The documents themselves are not affected

---

## 7. Managing Users

### Viewing Users

Navigate to **Admin → Users** to see:
- User avatar and display name
- Username
- Role (Admin / Editor / Viewer)
- Account status (Active / Disabled)
- **Time Permission** — validity period status with color badge
- Registration date

### Time Permission Column

The **Time Permission** column displays the user's account validity status using color-coded badges:

| Badge | Color | Meaning |
|-------|-------|--------|
| **Permanent** | 🟢 Green | Account is always active, no time limit |
| **Valid** | 🔵 Blue | Within the valid date range (shows dates) |
| **Expired** | 🟠 Orange | Past the valid date range (shows dates) |
| **Disabled** | 🔴 Red | Manually disabled by administrator |

### Setting User Validity Period

1. Click the **calendar icon** (📅) next to a user's Time Permission badge
2. An inline editor will appear with two options:
   - **Permanent** — Account has no time restriction
   - **Time Period** — Specify a start date and end date
3. For Time Period mode, select the **Valid From** and **Valid Until** dates
4. Click **Save** to apply

> **Priority Rule:** Manual disable (`is_active = false`) always takes precedence over the validity period. Even if a user is within their valid time range, disabling the account will immediately block their access.

### Changing User Roles

- Click the **role dropdown** next to any user
- Select the new role:
  - **Admin**: Full access to admin panel, all management features
  - **Editor**: Can upload and manage documents
  - **Viewer**: Read-only access to public documents (default)

### Disabling / Enabling Users

- Click the **toggle button** to disable an account (user cannot log in)
- Click again to re-enable the account
- Disabling does **not** delete the user's data or documents
- Disabled users who are currently logged in will be forcibly logged out on their next request

### Deleting a User

- Click the **red trash icon** (🗑️) next to the user row
- Confirm the deletion in the dialog
- This permanently removes the user's profile record

> **Warning:** User deletion is irreversible. Consider disabling the account instead if you may need to restore access later.

### How Users Register

- Users can self-register at `https://docshare.wyg.life/register`
- New users are assigned the **Viewer** role by default
- New users default to **Permanent** validity (no time restriction)
- Admins can promote users to Editor or Admin as needed

---

## 8. Managing Permissions

### Understanding Permissions

By default, all **published + public** documents are visible to everyone. The Permissions page allows fine-grained access control for specific users.

### Permission Levels (4-Tier Model)

DocShare uses a hierarchical 4-level permission model. Higher levels automatically include all lower-level capabilities:

| Level | Name | Capabilities |
|-------|------|--------------|
| 1 | **Only View** | Online preview only; download button is disabled |
| 2 | **View & Download** | Preview + download files to device |
| 3 | **Edit** | All above + modify document content |
| 4 | **Manage** | Full control including deletion |

> **Example:** A user with "Edit" permission can also view and download, without needing separate lower-level grants.

### Granting Permissions

1. Navigate to **Admin → Permissions**
2. In the grant form:
   - **Select User**: Choose the user to grant access
   - **Target Type**: Choose "Document" or "Category"
   - **Select Target**: Pick the specific document or category
   - **Permission Level**: Select from Only View / View & Download / Edit / Manage
3. Click **Grant Permission**

### Revoking Permissions

- Find the permission entry in the list
- Click the **Delete** button to revoke

---

## 9. Site Settings

Navigate to **Admin → Site Settings** (`/admin/site-settings`) to customize the entire site appearance without modifying code or redeploying.

The settings page is organized into **5 tabs**:

### Brand Tab

- **Site Name**: The name displayed in the navigation bar and footer (default: "DocShare")
- **Site Icon**: Choose from 18 predefined lucide icons for the navigation bar logo
- A live preview of the navigation bar is shown below the settings

### Hero Tab

- **Hero Title / Highlight / Subtitle**: Edit the main text content on the home page hero section
- **Hero Background**: Choose from three background modes:
  - **Gradient** (default) — CSS gradient background
  - **Preset** — Select from 12 education/campus-themed Unsplash images
  - **Custom** — Upload your own image (max 5MB, stored in Supabase Storage)
- When a background image is set, text automatically switches to white with a semi-transparent overlay for readability

### Features Tab

- **Show/Hide Toggle**: Control whether the three feature cards below the hero are visible
- **Card 1/2/3 Settings**: Edit title, description, and icon for each feature card
- A live preview grid shows the current appearance

### Sections Tab

- **Categories Visible**: Toggle whether the Categories section is shown on the home page

### Footer Tab

- **Brand Description**: The text displayed in the footer below the site name
- **Copyright Text**: Custom copyright line (leave empty for auto-generated format: © 2026 SiteName. All rights reserved.)
- A live footer preview is shown below

> **Note:** Each tab has independent **Save** and **Restore Defaults** buttons. Changes take effect immediately after saving — no redeployment needed.

---

## 10. Analytics & Monitoring

### Dashboard Statistics

Navigate to **Admin → Analytics** to view:

| Metric | Description |
|--------|-------------|
| Total Page Views | All document page views since launch |
| Total Downloads | All file download events |
| Total Logins | User login count |
| Today's Views | Page views in the current day |

### Activity Log

- Displays up to **100 recent events**
- Each entry shows: user, action type, related document, timestamp
- Filter by activity type using the dropdown:
  - **Login** — user authentication events
  - **Logout** — user sign-out events
  - **Document Views** — document page visits
  - **Downloads** — file download actions

Each action type has a distinct icon and color in the Admin Dashboard's "Recent Activity" card:
- Login → green (LogIn icon)
- Logout → gray (LogOut icon)
- Document View → blue (Eye icon)
- Download → orange (Download icon)

### Using Analytics

- Identify **popular documents** by view/download counts
- Track **user engagement** through login frequency
- Monitor **system usage** trends over time

---

## 11. Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Cannot access `/admin` | Ensure you are logged in with an Admin role account |
| "Failed to fetch" on login | Check Supabase environment variables on Vercel; verify Auth callback URL includes `docshare.wyg.life` |
| Document preview not loading | Check that the Supabase `documents` storage bucket exists and files are uploaded correctly |
| Avatar upload fails | Ensure the `avatars` storage bucket exists and is set to **Public** |
| Users see empty page after login | Verify that `profiles` table has data (run seed script if needed) |
| Search returns no results | Ensure documents are set to `published` status and `is_public = true` |

### Reseeding Test Accounts

If test accounts are missing or profiles are empty, run:

```bash
npm run seed
```

This will create or update the three default accounts and ensure profile records exist.

### Viewing Build Logs

If the Vercel deployment has issues, check:
- **Vercel Dashboard** → your project → **Deployments** → click the latest deployment → **Build Logs**
- **Runtime Logs** for server-side errors after deployment

---

## Quick Reference

| URL | Description |
|-----|-------------|
| [docshare.wyg.life](https://docshare.wyg.life) | Home page |
| [docshare.wyg.life/login](https://docshare.wyg.life/login) | Login page |
| [docshare.wyg.life/register](https://docshare.wyg.life/register) | Registration page |
| [docshare.wyg.life/admin](https://docshare.wyg.life/admin) | Admin dashboard |
| [docshare.wyg.life/browse](https://docshare.wyg.life/browse) | Browse all categories |
| [docshare.wyg.life/tags](https://docshare.wyg.life/tags) | Browse all tags |
| [docshare.wyg.life/search](https://docshare.wyg.life/search) | Search documents |
| [docshare.wyg.life/bookmarks](https://docshare.wyg.life/bookmarks) | My bookmarks (login required) |
| [docshare.wyg.life/settings](https://docshare.wyg.life/settings) | Account settings (login required) |
| [docshare.wyg.life/admin/site-settings](https://docshare.wyg.life/admin/site-settings) | Site appearance settings (admin only) |

---

*DocShare Administrator Guide — Last updated: June 25, 2026 (v1.8.1)*
