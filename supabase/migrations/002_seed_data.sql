-- Seed Data for DocShare
-- Run after 001_initial_schema.sql

-- Default Categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Technical Documents', 'technical', 'Technical specifications, API docs, and guides', 1),
  ('Research Papers', 'research', 'Academic papers and research publications', 2),
  ('Presentations', 'presentations', 'Slides and presentation materials', 3),
  ('Media', 'media', 'Images, videos, and audio files', 4),
  ('Reports', 'reports', 'Business reports and analytics documents', 5);

-- Default Tags
INSERT INTO public.tags (name, slug, color) VALUES
  ('Guide', 'guide', '#3b82f6'),
  ('Tutorial', 'tutorial', '#10b981'),
  ('Reference', 'reference', '#8b5cf6'),
  ('Important', 'important', '#ef4444'),
  ('Archive', 'archive', '#6b7280'),
  ('New', 'new', '#f59e0b'),
  ('Popular', 'popular', '#ec4899');
