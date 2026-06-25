"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, UserX, Trash2, Calendar, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingValidity, setEditingValidity] = useState<string | null>(null);
  const [validityType, setValidityType] = useState<"permanent" | "period">("permanent");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, role: "admin" | "editor" | "viewer") => {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      toast("error", "Failed to update role");
    } else {
      toast("success", `Role updated to ${role}`);
      fetchUsers();
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isActive }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast("error", data.error || "Failed to update status");
    } else {
      toast("success", isActive ? "User deactivated" : "User activated");
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string, displayName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${displayName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast("error", data.error || "Failed to delete user");
      } else {
        toast("success", "User permanently deleted");
        fetchUsers();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openValidityEditor = (user: Profile) => {
    setEditingValidity(user.id);
    if (user.valid_from || user.valid_until) {
      setValidityType("period");
      setValidFrom(user.valid_from ? user.valid_from.slice(0, 10) : "");
      setValidUntil(user.valid_until ? user.valid_until.slice(0, 10) : "");
    } else {
      setValidityType("permanent");
      setValidFrom("");
      setValidUntil("");
    }
  };

  const saveValidity = async (userId: string) => {
    const body: Record<string, unknown> = {
      userId,
      action: "set_validity",
    };

    if (validityType === "permanent") {
      body.validFrom = null;
      body.validUntil = null;
    } else {
      body.validFrom = validFrom ? new Date(validFrom).toISOString() : null;
      body.validUntil = validUntil ? new Date(validUntil + "T23:59:59").toISOString() : null;
    }

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      toast("error", data.error || "Failed to update validity");
    } else {
      toast("success", "Validity period updated");
      setEditingValidity(null);
      fetchUsers();
    }
  };

  const getValidityStatus = (user: Profile) => {
    if (!user.is_active) return { label: "Disabled", color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800 matrix:text-red-400 matrix:bg-red-900/30 matrix:border-red-800" };
    if (!user.valid_from && !user.valid_until) return { label: "Permanent", color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800 matrix:text-green-400 matrix:bg-green-900/30 matrix:border-green-800" };

    const now = new Date();
    const from = user.valid_from ? new Date(user.valid_from) : null;
    const until = user.valid_until ? new Date(user.valid_until) : null;

    if ((from && now < from) || (until && now > until)) {
      return { label: "Expired", color: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800 matrix:text-orange-400 matrix:bg-orange-900/30 matrix:border-orange-800" };
    }
    return { label: "Valid", color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800 matrix:text-blue-400 matrix:bg-blue-900/30 matrix:border-blue-800" };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and roles</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Time Permission</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Joined</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => {
                  const validity = getValidityStatus(user);
                  return (
                    <tr key={user.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar_url}
                            alt={user.display_name || user.username}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {user.display_name || user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={user.role}
                          onChange={(e) =>
                            updateRole(user.id, e.target.value as "admin" | "editor" | "viewer")
                          }
                          className="w-28 h-8 text-xs"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {editingValidity === user.id ? (
                          <div className="space-y-2 min-w-[260px]">
                            <div className="flex items-center gap-2">
                              <select
                                value={validityType}
                                onChange={(e) => setValidityType(e.target.value as "permanent" | "period")}
                                className="text-xs border rounded px-2 py-1 bg-background"
                              >
                                <option value="permanent">Permanent</option>
                                <option value="period">Time Period</option>
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingValidity(null)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {validityType === "period" && (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="date"
                                  value={validFrom}
                                  onChange={(e) => setValidFrom(e.target.value)}
                                  className="h-7 text-xs w-[120px]"
                                />
                                <span className="text-xs text-muted-foreground">to</span>
                                <Input
                                  type="date"
                                  value={validUntil}
                                  onChange={(e) => setValidUntil(e.target.value)}
                                  className="h-7 text-xs w-[120px]"
                                />
                              </div>
                            )}
                            <Button
                              size="sm"
                              onClick={() => saveValidity(user.id)}
                              className="h-7 text-xs"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${validity.color}`}>
                              {validity.label}
                            </Badge>
                            {(user.valid_from || user.valid_until) && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(user.valid_from)} ~ {formatDate(user.valid_until)}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openValidityEditor(user)}
                              title="Set validity period"
                              className="h-6 w-6 p-0"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDateTime(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(user.id, user.is_active)}
                            title={user.is_active ? "Deactivate user" : "Activate user"}
                          >
                            {user.is_active ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id, user.display_name || user.username)}
                            disabled={deletingId === user.id}
                            title="Permanently delete user"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
