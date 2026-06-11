-- DocShare Database Schema
-- Run this in Supabase SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE permission_type AS ENUM ('view', 'edit', 'manage');
CREATE TYPE document_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE access_action AS ENUM ('login', 'logout', 'document_view', 'document_download');

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'viewer' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Categories (hierarchical tree)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  path TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status document_status DEFAULT 'draft' NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  download_count INTEGER DEFAULT 0 NOT NULL,
  thumbnail_url TEXT,
  search_vector tsvector,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_documents_search ON public.documents USING gin(search_vector);
CREATE INDEX idx_documents_category ON public.documents(category_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_public ON public.documents(is_public) WHERE is_public = true;

-- Tags
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Document Tags (many-to-many)
CREATE TABLE public.document_tags (
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);
CREATE INDEX idx_document_tags_tag ON public.document_tags(tag_id);

-- Permissions
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  permission permission_type NOT NULL DEFAULT 'view',
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT permission_target CHECK (
    (document_id IS NOT NULL AND category_id IS NULL) OR
    (document_id IS NULL AND category_id IS NOT NULL)
  )
);
CREATE INDEX idx_permissions_user ON public.permissions(user_id);
CREATE INDEX idx_permissions_document ON public.permissions(document_id);
CREATE INDEX idx_permissions_category ON public.permissions(category_id);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, document_id)
);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- Access Logs
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action access_action NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_access_logs_user ON public.access_logs(user_id);
CREATE INDEX idx_access_logs_action ON public.access_logs(action);
CREATE INDEX idx_access_logs_created ON public.access_logs(created_at DESC);

-- User Groups
CREATE TABLE public.user_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.user_group_members (
  group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE public.group_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  permission permission_type NOT NULL DEFAULT 'view',
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT group_permission_target CHECK (
    (document_id IS NOT NULL AND category_id IS NULL) OR
    (document_id IS NULL AND category_id IS NOT NULL)
  )
);

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update document search_vector
CREATE OR REPLACE FUNCTION documents_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.file_name, '')), 'C');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_search_update
  BEFORE INSERT OR UPDATE OF title, description, file_name
  ON public.documents
  FOR EACH ROW EXECUTE FUNCTION documents_search_trigger();

-- Auto-update category path
CREATE OR REPLACE FUNCTION update_category_path()
RETURNS trigger AS $$
DECLARE
  parent_path TEXT;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT path INTO parent_path FROM public.categories WHERE id = NEW.parent_id;
    NEW.path := COALESCE(parent_path, '') || '/' || NEW.slug;
  ELSE
    NEW.path := '/' || NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER category_path_update
  BEFORE INSERT OR UPDATE OF parent_id, slug
  ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_category_path();

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check document permission
CREATE OR REPLACE FUNCTION has_document_permission(doc_id UUID, perm permission_type)
RETURNS boolean AS $$
BEGIN
  IF is_admin() THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = doc_id AND (
      (perm = 'view' AND d.is_public = true)
      OR EXISTS (
        SELECT 1 FROM public.permissions p
        WHERE p.document_id = doc_id AND p.user_id = auth.uid()
          AND (p.expires_at IS NULL OR p.expires_at > now())
      )
      OR EXISTS (
        SELECT 1 FROM public.group_permissions gp
        JOIN public.user_group_members ugm ON ugm.group_id = gp.group_id
        WHERE gp.document_id = doc_id AND ugm.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.permissions p
        WHERE p.category_id = d.category_id AND p.user_id = auth.uid()
          AND (p.expires_at IS NULL OR p.expires_at > now())
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Full-text search function
CREATE OR REPLACE FUNCTION search_documents(
  query_text TEXT,
  filter_category UUID DEFAULT NULL,
  filter_type TEXT DEFAULT NULL,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, description TEXT,
  file_name TEXT, file_type TEXT,
  category_id UUID, view_count INTEGER, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.title, d.description, d.file_name, d.file_type,
    d.category_id, d.view_count,
    ts_rank(d.search_vector, websearch_to_tsquery('english', query_text)) AS rank
  FROM public.documents d
  WHERE d.search_vector @@ websearch_to_tsquery('english', query_text)
    AND d.status = 'published'
    AND (filter_category IS NULL OR d.category_id = filter_category)
    AND (filter_type IS NULL OR d.file_type = filter_type)
    AND (d.is_public = true OR has_document_permission(d.id, 'view'))
  ORDER BY rank DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public categories viewable" ON public.categories FOR SELECT
  USING (is_public = true OR is_admin() OR auth.role() = 'authenticated');
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (is_admin());

-- Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
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

-- Tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags viewable" ON public.tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage tags" ON public.tags FOR ALL USING (is_admin());

-- Document Tags
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View document tags" ON public.document_tags FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Manage document tags" ON public.document_tags FOR ALL
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM public.documents WHERE id = document_id AND uploaded_by = auth.uid()
  ));

-- Permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage permissions" ON public.permissions FOR ALL USING (is_admin());
CREATE POLICY "Users view own permissions" ON public.permissions FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL
  USING (user_id = auth.uid());

-- Access Logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view logs" ON public.access_logs FOR SELECT USING (is_admin());
CREATE POLICY "Users view own logs" ON public.access_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert logs" ON public.access_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- User Groups
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage groups" ON public.user_groups FOR ALL USING (is_admin());
CREATE POLICY "Authenticated view groups" ON public.user_groups FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage members" ON public.user_group_members FOR ALL USING (is_admin());
CREATE POLICY "View own memberships" ON public.user_group_members FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins manage group perms" ON public.group_permissions FOR ALL USING (is_admin());
CREATE POLICY "View group perms" ON public.group_permissions FOR SELECT
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM public.user_group_members
    WHERE group_id = group_permissions.group_id AND user_id = auth.uid()
  ));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Note: Run these manually in Supabase Dashboard > Storage
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 524288000)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 5242880)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated can view documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Admins can upload documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  ));
CREATE POLICY "Admins can update documents" ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND is_admin());
CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND is_admin());

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
