"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Shield } from "lucide-react";
import type { Profile, Permission } from "@/lib/types";

export default function AdminPermissionsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedType, setSelectedType] = useState<"document" | "category">("document");
  const [selectedPerm, setSelectedPerm] = useState<"view" | "download" | "edit" | "manage">("view");

  const fetchData = async () => {
    const [{ data: u }, { data: d }, { data: c }, { data: p }] = await Promise.all([
      supabase.from("profiles").select("*").order("username"),
      supabase.from("documents").select("id, title").order("title"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("permissions").select("*, profiles(username), documents(title), categories(name)"),
    ]);
    setUsers(u || []);
    setDocuments(d || []);
    setCategories(c || []);
    setPermissions(p || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPermission = async () => {
    if (!selectedUser || !selectedTarget) return;

    const insert: Record<string, unknown> = {
      user_id: selectedUser,
      permission: selectedPerm,
    };

    if (selectedType === "document") {
      insert.document_id = selectedTarget;
    } else {
      insert.category_id = selectedTarget;
    }

    const { error } = await supabase.from("permissions").insert(insert);
    if (error) toast("error", "Failed to add permission");
    else {
      toast("success", "Permission added");
      fetchData();
    }
  };

  const removePermission = async (id: string) => {
    await supabase.from("permissions").delete().eq("id", id);
    toast("success", "Permission removed");
    fetchData();
  };

  const targets = selectedType === "document" ? documents : categories;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permissions</h1>
        <p className="text-muted-foreground">
          Documents are private by default. Grant explicit access here, or mark a document as
          &quot;Publicly accessible&quot; on its edit page to expose it to all signed-in users.
        </p>
      </div>

      {/* Add Permission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Grant Permission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.username}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Type</Label>
              <Select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as "document" | "category");
                  setSelectedTarget("");
                }}
              >
                <option value="document">Document</option>
                <option value="category">Category</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{selectedType === "document" ? "Document" : "Category"}</Label>
              <Select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)}>
                <option value="">Select {selectedType}</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {"title" in t ? t.title : t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={selectedPerm} onChange={(e) => setSelectedPerm(e.target.value as "view" | "download" | "edit" | "manage")}>
                <option value="view">Only View</option>
                <option value="download">View &amp; Download</option>
                <option value="edit">Edit</option>
                <option value="manage">Manage</option>
              </Select>
            </div>
            <Button onClick={addPermission} disabled={!selectedUser || !selectedTarget}>
              Grant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.length > 0 ? (
            <div className="space-y-2">
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {(perm as Permission & { profiles?: { username: string } }).profiles?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(perm as Permission & { documents?: { title: string }; categories?: { name: string } }).documents?.title ||
                          (perm as Permission & { documents?: { title: string }; categories?: { name: string } }).categories?.name ||
                          "Unknown"}{" "}
                        &middot; <span className="capitalize">
                          {perm.permission === "view" ? "Only View" :
                           perm.permission === "download" ? "View & Download" :
                           perm.permission === "edit" ? "Edit" : "Manage"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removePermission(perm.id)}
                    className="p-1 rounded hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No explicit permissions yet. Documents marked as &quot;Publicly accessible&quot; are
              visible to every signed-in user; all other documents are hidden until you grant access here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
