"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Shield, Info, Eye, Users, ChevronDown, ChevronRight } from "lucide-react";
import type { Profile, Permission } from "@/lib/types";

type PermLevel = "view" | "download" | "edit" | "manage";

const PERM_LEVELS: Record<PermLevel, number> = { view: 1, download: 2, edit: 3, manage: 4 };
const PERM_LABELS: Record<PermLevel, string> = {
  view: "Only View",
  download: "View & Download",
  edit: "Edit",
  manage: "Manage",
};

const ROLE_BASELINES: Record<string, { level: string; description: string; color: string }> = {
  admin: { level: "Manage", description: "Full access — bypasses all checks", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  editor: { level: "Download", description: "Can download any document they can see (visibility still requires explicit grant)", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  viewer: { level: "None", description: "No default access — needs explicit permission grant", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

export default function AdminPermissionsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [documents, setDocuments] = useState<{ id: string; title: string; is_public: boolean; category_id: string | null }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedType, setSelectedType] = useState<"document" | "category">("document");
  const [selectedPerm, setSelectedPerm] = useState<PermLevel>("view");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    const [{ data: u }, { data: d }, { data: c }, { data: p }] = await Promise.all([
      supabase.from("profiles").select("*").order("username"),
      supabase.from("documents").select("id, title, is_public, category_id").order("title"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("permissions").select("*, profiles(username, role), documents(title), categories(name)"),
    ]);
    setUsers(u || []);
    setDocuments(d || []);
    setCategories(c || []);
    setPermissions(p || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group users by role for the selector
  const usersByRole = useMemo(() => {
    const groups: Record<string, Profile[]> = { admin: [], editor: [], viewer: [] };
    users.forEach((u) => {
      const role = u.role || "viewer";
      if (groups[role]) groups[role].push(u);
      else groups.viewer.push(u);
    });
    return groups;
  }, [users]);

  // Group permissions by user for display
  const permsByUser = useMemo(() => {
    const map = new Map<string, { user: { id: string; username: string; role: string }; perms: (Permission & { documents?: { title: string }; categories?: { name: string } })[] }>();
    permissions.forEach((perm) => {
      const p = perm as Permission & { profiles?: { username: string; role: string }; documents?: { title: string }; categories?: { name: string } };
      const userId = perm.user_id ?? "";
      if (!userId) return;
      if (!map.has(userId)) {
        map.set(userId, {
          user: { id: userId, username: p.profiles?.username || "Unknown", role: p.profiles?.role || "viewer" },
          perms: [],
        });
      }
      map.get(userId)!.perms.push(p);
    });
    return Array.from(map.values()).sort((a, b) => {
      const roleOrder: Record<string, number> = { admin: 0, editor: 1, viewer: 2 };
      return (roleOrder[a.user.role] ?? 2) - (roleOrder[b.user.role] ?? 2) || a.user.username.localeCompare(b.user.username);
    });
  }, [permissions]);

  // Permission Preview: compute effective permissions for selected user
  const previewData = useMemo(() => {
    if (!selectedUser) return null;
    const user = users.find((u) => u.id === selectedUser);
    if (!user) return null;
    const userPerms = permissions.filter((p) => p.user_id === selectedUser);

    // Build effective permission map for each document
    const docEffective = documents.slice(0, 50).map((doc) => {
      const sources: string[] = [];
      let maxLevel = 0;

      // Public document grants view
      if (doc.is_public) {
        maxLevel = Math.max(maxLevel, 1);
        sources.push("is_public=true");
      }

      // Direct document permission
      const directPerm = userPerms.find((p) => p.document_id === doc.id);
      if (directPerm) {
        const level = PERM_LEVELS[directPerm.permission as PermLevel] || 0;
        maxLevel = Math.max(maxLevel, level);
        sources.push(`Direct: ${directPerm.permission}`);
      }

      // Category permission
      if (doc.category_id) {
        const catPerm = userPerms.find((p) => p.category_id === doc.category_id);
        if (catPerm) {
          const level = PERM_LEVELS[catPerm.permission as PermLevel] || 0;
          maxLevel = Math.max(maxLevel, level);
          const catName = categories.find((c) => c.id === doc.category_id)?.name || "Category";
          sources.push(`${catName}: ${catPerm.permission}`);
        }
      }

      // Role baseline (only for download+)
      const roleBaseline = user.role === "editor" ? 2 : 0;
      if (roleBaseline > 0 && maxLevel >= 1) {
        // Editor baseline only applies if already visible
        maxLevel = Math.max(maxLevel, roleBaseline);
        if (roleBaseline > (PERM_LEVELS[(directPerm?.permission || "view") as PermLevel] || 0)) {
          sources.push("Role baseline: download");
        }
      }

      return { doc, maxLevel, sources };
    }).filter((d) => d.maxLevel > 0); // Only show docs user has access to

    return { user, docEffective };
  }, [selectedUser, users, documents, categories, permissions]);

  const addPermission = async () => {
    if (!selectedUser || !selectedTarget) return;

    const record: Record<string, unknown> = {
      user_id: selectedUser,
      permission: selectedPerm,
    };

    if (selectedType === "document") {
      record.document_id = selectedTarget;
    } else {
      record.category_id = selectedTarget;
    }

    const { error } = await supabase.from("permissions").upsert(record, {
      onConflict: selectedType === "document"
        ? "user_id,document_id"
        : "user_id,category_id",
    });

    if (error) {
      toast("error", "Failed to grant permission");
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("access_logs").insert({
          user_id: user.id,
          action: "permission_grant" as const,
          metadata: {
            target_user: selectedUser,
            target_type: selectedType,
            target_id: selectedTarget,
            permission: selectedPerm,
          },
        });
      }
      toast("success", "Permission granted");
      fetchData();
    }
  };

  const removePermission = async (id: string) => {
    const permToRemove = permissions.find((p) => p.id === id);
    const { error } = await supabase.from("permissions").delete().eq("id", id);
    if (error) {
      toast("error", "Failed to remove permission");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user && permToRemove) {
      await supabase.from("access_logs").insert({
        user_id: user.id,
        action: "permission_revoke" as const,
        metadata: {
          target_user: permToRemove.user_id,
          target_type: permToRemove.document_id ? "document" : "category",
          target_id: permToRemove.document_id || permToRemove.category_id,
          permission: permToRemove.permission,
        },
      });
    }
    toast("success", "Permission removed");
    fetchData();
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const targets = selectedType === "document" ? documents : categories;

  // Detect override hints: category perm vs direct perm
  const getOverrideHint = (perm: Permission): string | null => {
    if (perm.document_id) {
      // Check if there's a category perm for the same user on the doc's category
      const doc = documents.find((d) => d.id === perm.document_id);
      if (doc?.category_id) {
        const catPerm = permissions.find(
          (p) => p.user_id === perm.user_id && p.category_id === doc.category_id
        );
        if (catPerm) {
          const catLevel = PERM_LEVELS[catPerm.permission as PermLevel] || 0;
          const docLevel = PERM_LEVELS[perm.permission as PermLevel] || 0;
          if (catLevel >= docLevel) {
            return `Category already grants "${catPerm.permission}" — this is redundant`;
          }
          return `Overrides category "${catPerm.permission}" → "${perm.permission}"`;
        }
      }
    }
    return null;
  };

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 4: return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case 3: return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case 2: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 1: return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const levelToLabel = (level: number): string => {
    switch (level) {
      case 4: return "Manage";
      case 3: return "Edit";
      case 2: return "Download";
      case 1: return "View";
      default: return "None";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permissions</h1>
        <p className="text-muted-foreground">
          Documents are private by default. Grant explicit access here, or mark a document as
          &quot;Publicly accessible&quot; on its edit page to expose it to all signed-in users.
        </p>
      </div>

      {/* 2.2 Role Baseline Info Card */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Role Baseline Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(ROLE_BASELINES).map(([role, info]) => (
              <div key={role} className={`rounded-lg p-3 ${info.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold capitalize text-sm">{role}</span>
                  <Badge variant="outline" className="text-xs">{info.level}</Badge>
                </div>
                <p className="text-xs opacity-80">{info.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grant Permission Form — 2.1 User selector grouped by role */}
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
                {usersByRole.editor.length > 0 && (
                  <optgroup label="── Editors ──">
                    {usersByRole.editor.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.display_name || u.username}
                      </option>
                    ))}
                  </optgroup>
                )}
                {usersByRole.viewer.length > 0 && (
                  <optgroup label="── Viewers ──">
                    {usersByRole.viewer.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.display_name || u.username}
                      </option>
                    ))}
                  </optgroup>
                )}
                {usersByRole.admin.length > 0 && (
                  <optgroup label="── Admins ──">
                    {usersByRole.admin.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.display_name || u.username}
                      </option>
                    ))}
                  </optgroup>
                )}
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
              <Select value={selectedPerm} onChange={(e) => setSelectedPerm(e.target.value as PermLevel)}>
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

      {/* 2.3 Permission Preview Panel */}
      {selectedUser && previewData && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              Permission Preview — {previewData.user.display_name || previewData.user.username}
              <Badge className={ROLE_BASELINES[previewData.user.role || "viewer"]?.color || ""}>
                {previewData.user.role || "viewer"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {previewData.docEffective.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">Document</th>
                      <th className="pb-2 font-medium">Effective</th>
                      <th className="pb-2 font-medium">Sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.docEffective.map(({ doc, maxLevel, sources }) => (
                      <tr key={doc.id} className="border-b border-dashed last:border-0">
                        <td className="py-2 pr-4 max-w-[200px] truncate">{doc.title}</td>
                        <td className="py-2 pr-4">
                          <Badge className={getLevelColor(maxLevel)}>{levelToLabel(maxLevel)}</Badge>
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">{sources.join(" · ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {documents.length > 50 && (
                  <p className="text-xs text-muted-foreground mt-2">Showing first 50 documents</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This user has no effective permissions on any document.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2.4 Active Permissions grouped by user + 2.5 Conflict hints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Permissions
            <Badge variant="secondary" className="ml-2">{permissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permsByUser.length > 0 ? (
            <div className="space-y-2">
              {permsByUser.map(({ user: groupUser, perms }) => {
                const isExpanded = expandedUsers.has(groupUser.id);
                return (
                  <div key={groupUser.id} className="border rounded-lg overflow-hidden">
                    {/* User group header */}
                    <button
                      onClick={() => toggleUserExpand(groupUser.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium text-sm">{groupUser.username}</span>
                      <Badge className={ROLE_BASELINES[groupUser.role]?.color || ""} >
                        {groupUser.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {perms.length} permission{perms.length > 1 ? "s" : ""}
                      </span>
                    </button>
                    {/* Expanded permission list */}
                    {isExpanded && (
                      <div className="border-t divide-y">
                        {perms.map((perm) => {
                          const hint = getOverrideHint(perm);
                          return (
                            <div key={perm.id} className="flex items-center justify-between px-4 py-2.5 pl-10">
                              <div className="flex items-center gap-3 min-w-0">
                                <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm truncate">
                                    {(perm as Permission & { documents?: { title: string }; categories?: { name: string } }).documents?.title ||
                                      (perm as Permission & { documents?: { title: string }; categories?: { name: string } }).categories?.name ||
                                      "Unknown"}
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {perm.document_id ? "Doc" : "Category"}
                                    </Badge>
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge className={getLevelColor(PERM_LEVELS[perm.permission as PermLevel] || 0)}>
                                      {PERM_LABELS[perm.permission as PermLevel] || perm.permission}
                                    </Badge>
                                    {/* 2.5 Override/conflict hint */}
                                    {hint && (
                                      <span className={`text-xs italic ${hint.includes("redundant") ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
                                        {hint}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removePermission(perm.id)}
                                className="p-1.5 rounded hover:bg-destructive/10 shrink-0"
                                title="Remove permission"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
