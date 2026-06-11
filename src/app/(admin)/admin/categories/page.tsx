"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setParentId("");
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parent_id || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const slug = slugify(name);

    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update({ name, slug, description: description || null, parent_id: parentId || null })
        .eq("id", editing.id);
      if (error) toast("error", "Failed to update");
      else toast("success", "Category updated");
    } else {
      const { error } = await supabase.from("categories").insert({
        name,
        slug,
        description: description || null,
        parent_id: parentId || null,
      });
      if (error) toast("error", "Failed to create");
      else toast("success", "Category created");
    }

    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Documents will be uncategorized.")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast("success", "Category deleted");
    fetchCategories();
  };

  // Build tree
  const rootCategories = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  const renderCategory = (cat: Category, depth: number = 0) => (
    <div key={cat.id}>
      <div
        className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-lg"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <div className="flex items-center gap-2">
          {depth > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{cat.name}</span>
          <span className="text-xs text-muted-foreground">{cat.slug}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(cat)} className="p-1 rounded hover:bg-muted">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="p-1 rounded hover:bg-muted">
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      {getChildren(cat.id).map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize documents with folder structure</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-2">
          {rootCategories.length > 0 ? (
            rootCategories.map((cat) => renderCategory(cat))
          ) : (
            <p className="text-center text-muted-foreground py-8">No categories yet</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">None (root)</option>
                {categories
                  .filter((c) => c.id !== editing?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
