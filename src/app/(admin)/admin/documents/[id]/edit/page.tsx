"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, File } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { ALL_ACCEPTED_TYPES } from "@/lib/constants";
import type { Category, Tag } from "@/lib/types";
import { ImageUploadPicker } from "@/components/admin/image-upload-picker";
import { DOCUMENT_COVER_PRESETS, COVER_COLORS } from "@/lib/preset-images";

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Cover image state
  const [coverMode, setCoverMode] = useState<"none" | "color" | "preset" | "custom">("none");
  const [coverColor, setCoverColor] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [newFile, setNewFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<{
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Load document and metadata
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [{ data: doc }, { data: cats }, { data: tagData }, { data: docTags }] =
          await Promise.all([
            supabase.from("documents").select("*").eq("id", documentId).single(),
            supabase.from("categories").select("*").order("name"),
            supabase.from("tags").select("*").order("name"),
            supabase
              .from("document_tags")
              .select("tag_id")
              .eq("document_id", documentId),
          ]);

        if (!doc) {
          toast("error", "Document not found");
          router.push("/admin/documents");
          return;
        }

        setTitle(doc.title);
        setDescription(doc.description || "");
        setCategoryId(doc.category_id || "");
        setStatus(doc.status as "draft" | "published");
        setIsPublic(doc.is_public);
        setExistingFile({ name: doc.file_name, type: doc.file_type, size: doc.file_size });

        // Restore cover image state
        if (doc.thumbnail_url) {
          setCoverMode("custom"); // treat any existing URL as custom
          setCoverImageUrl(doc.thumbnail_url);
        } else if (doc.cover_color) {
          setCoverMode("color");
          setCoverColor(doc.cover_color);
        } else {
          setCoverMode("none");
        }

        if (docTags) {
          setSelectedTags(docTags.map((dt: { tag_id: string }) => dt.tag_id));
        }

        setCategories(cats || []);
        setTags(tagData || []);
      } catch {
        toast("error", "Failed to load document");
        router.push("/admin/documents");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [documentId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setNewFile(selected);
  };

  const removeNewFile = () => {
    setNewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates: Record<string, unknown> = {
        title,
        description: description || null,
        category_id: categoryId || null,
        status,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
        thumbnail_url:
          coverMode === "preset" || coverMode === "custom"
            ? coverImageUrl || null
            : null,
        cover_color: coverMode === "color" ? coverColor || null : null,
      };

      // Upload new file if selected
      if (newFile) {
        const fileName = `${Date.now()}-${newFile.name}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, newFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        updates.file_name = newFile.name;
        updates.file_path = filePath;
        updates.file_type = newFile.type;
        updates.file_size = newFile.size;
      }

      // Update document
      const { error: docError } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", documentId);

      if (docError) throw new Error(`Update failed: ${docError.message}`);

      // Update tags: delete existing, re-insert
      await supabase.from("document_tags").delete().eq("document_id", documentId);
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map((tagId) => ({
          document_id: documentId,
          tag_id: tagId,
        }));
        await supabase.from("document_tags").insert(tagInserts);
      }

      toast("success", "Document updated successfully!");
      router.push("/admin/documents");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast("error", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Document</h1>
        <p className="text-muted-foreground">Update document details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File */}
        <Card>
          <CardHeader>
            <CardTitle>File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingFile && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <File className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{existingFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(existingFile.size)} &middot; {existingFile.type}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Replace file (optional)
              </Label>
              {newFile ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg border-primary/30 bg-primary/5">
                  <File className="h-6 w-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{newFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(newFile.size)} &middot; {newFile.type}
                    </p>
                  </div>
                  <button type="button" onClick={removeNewFile} className="p-1 rounded hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Click to select a replacement file
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ALL_ACCEPTED_TYPES.join(",")}
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploadPicker
              label=""
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              mode={coverMode}
              onModeChange={(m) => {
                setCoverMode(m);
                if (m === "none") {
                  setCoverColor("");
                  setCoverImageUrl("");
                }
              }}
              presets={DOCUMENT_COVER_PRESETS}
              colors={COVER_COLORS}
              colorValue={coverColor}
              onColorChange={setCoverColor}
              uploadPath="uploads/covers"
            />
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="isPublic" className="text-sm cursor-pointer">
                  Publicly accessible
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                When unchecked, only users explicitly granted access via
                <span className="mx-1 font-medium">Permissions</span>
                will see this document.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "text-white"
                        : "bg-background hover:bg-muted"
                    }`}
                    style={
                      selectedTags.includes(tag.id)
                        ? { backgroundColor: tag.color, borderColor: tag.color }
                        : { borderColor: tag.color, color: tag.color }
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/documents")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
