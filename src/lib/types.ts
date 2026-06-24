import type { Database } from "./database.types";

// Re-export database types
export type { Database };

// User types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type UserRole = "admin" | "editor" | "viewer";

// Document types
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export type DocumentStatus = "draft" | "published" | "archived";

// Category types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

// Tag types
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

// Permission types
export type Permission = Database["public"]["Tables"]["permissions"]["Row"];
export type PermissionType = "view" | "download" | "edit" | "manage";

// Bookmark types
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

// Access Log types
export type AccessLog = Database["public"]["Tables"]["access_logs"]["Row"];
export type AccessAction = "login" | "logout" | "document_view" | "document_download";

// User Group types
export type UserGroup = Database["public"]["Tables"]["user_groups"]["Row"];

// Extended types for UI
export interface DocumentWithRelations extends Document {
  categories?: Category | null;
  tags?: Tag[];
  profiles?: Profile | null;
  bookmarks?: Bookmark[];
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  document_count?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_type: string;
  category_id: string | null;
  view_count: number;
  rank: number;
}

export interface AnalyticsStats {
  total_documents: number;
  total_users: number;
  total_views: number;
  total_downloads: number;
  views_today: number;
  views_this_week: number;
}

export interface DailyStats {
  date: string;
  views: number;
  downloads: number;
  logins: number;
}
