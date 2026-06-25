export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: "admin" | "editor" | "viewer";
          is_active: boolean;
          valid_from: string | null;
          valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "admin" | "editor" | "viewer";
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "admin" | "editor" | "viewer";
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          path: string | null;
          sort_order: number;
          is_public: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
          path?: string | null;
          sort_order?: number;
          is_public?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          parent_id?: string | null;
          path?: string | null;
          sort_order?: number;
          is_public?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          category_id: string | null;
          status: "draft" | "published" | "archived";
          is_public: boolean;
          view_count: number;
          download_count: number;
          thumbnail_url: string | null;
          cover_color: string | null;
          search_vector: unknown;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          category_id?: string | null;
          status?: "draft" | "published" | "archived";
          is_public?: boolean;
          view_count?: number;
          download_count?: number;
          thumbnail_url?: string | null;
          cover_color?: string | null;
          search_vector?: unknown;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          category_id?: string | null;
          status?: "draft" | "published" | "archived";
          is_public?: boolean;
          view_count?: number;
          download_count?: number;
          thumbnail_url?: string | null;
          cover_color?: string | null;
          search_vector?: unknown;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      document_tags: {
        Row: {
          document_id: string;
          tag_id: string;
        };
        Insert: {
          document_id: string;
          tag_id: string;
        };
        Update: {
          document_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          user_id: string | null;
          document_id: string | null;
          category_id: string | null;
          permission: "view" | "download" | "edit" | "manage";
          granted_by: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          document_id?: string | null;
          category_id?: string | null;
          permission?: "view" | "download" | "edit" | "manage";
          granted_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          document_id?: string | null;
          category_id?: string | null;
          permission?: "view" | "download" | "edit" | "manage";
          granted_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      access_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: "login" | "logout" | "document_view" | "document_download";
          document_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: "login" | "logout" | "document_view" | "document_download";
          document_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: "login" | "logout" | "document_view" | "document_download";
          document_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      user_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_group_members: {
        Row: {
          group_id: string;
          user_id: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      group_permissions: {
        Row: {
          id: string;
          group_id: string;
          document_id: string | null;
          category_id: string | null;
          permission: "view" | "download" | "edit" | "manage";
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          document_id?: string | null;
          category_id?: string | null;
          permission?: "view" | "download" | "edit" | "manage";
          granted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          document_id?: string | null;
          category_id?: string | null;
          permission?: "view" | "download" | "edit" | "manage";
          granted_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_documents: {
        Args: {
          query_text: string;
          filter_category?: string | null;
          filter_type?: string | null;
          page_limit?: number;
          page_offset?: number;
        };
        Returns: {
          id: string;
          title: string;
          description: string | null;
          file_name: string;
          file_type: string;
          category_id: string | null;
          view_count: number;
          rank: number;
        }[];
      };
    };
    Enums: {
      user_role: "admin" | "editor" | "viewer";
      permission_type: "view" | "download" | "edit" | "manage";
      document_status: "draft" | "published" | "archived";
      access_action: "login" | "logout" | "document_view" | "document_download";
    };
  };
}
