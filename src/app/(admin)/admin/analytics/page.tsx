"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { BarChart3, Eye, Download, LogIn, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { AccessLog } from "@/lib/types";

export default function AdminAnalyticsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<(AccessLog & { profiles?: { username: string; display_name: string } | null; documents?: { title: string } | null })[]>([]);
  const [filterAction, setFilterAction] = useState("");
  const [stats, setStats] = useState({
    totalViews: 0,
    totalDownloads: 0,
    totalLogins: 0,
    todayViews: 0,
  });

  useEffect(() => {
    fetchData();
  }, [filterAction]);

  const fetchData = async () => {
    // Fetch stats
    const [views, downloads, logins, todayViews] = await Promise.all([
      supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("action", "document_view"),
      supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("action", "document_download"),
      supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("action", "login"),
      supabase
        .from("access_logs")
        .select("*", { count: "exact", head: true })
        .eq("action", "document_view")
        .gte("created_at", new Date().toISOString().split("T")[0]),
    ]);

    setStats({
      totalViews: views.count || 0,
      totalDownloads: downloads.count || 0,
      totalLogins: logins.count || 0,
      todayViews: todayViews.count || 0,
    });

    // Fetch logs
    let query = supabase
      .from("access_logs")
      .select("*, profiles(username, display_name), documents(title)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filterAction) {
      query = query.eq("action", filterAction);
    }

    const { data } = await query;
    setLogs(data || []);
  };

  const actionIcons = {
    login: <LogIn className="h-3.5 w-3.5" />,
    logout: <LogIn className="h-3.5 w-3.5" />,
    document_view: <Eye className="h-3.5 w-3.5" />,
    document_download: <Download className="h-3.5 w-3.5" />,
  };

  const actionColors = {
    login: "bg-green-100 text-green-600",
    logout: "bg-gray-100 text-gray-600",
    document_view: "bg-blue-100 text-blue-600",
    document_download: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Monitor user activity and document engagement</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalViews}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-orange-50 p-2 text-orange-500">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalDownloads}</p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-50 p-2 text-green-500">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalLogins}</p>
              <p className="text-xs text-muted-foreground">Total Logins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-purple-50 p-2 text-purple-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.todayViews}</p>
              <p className="text-xs text-muted-foreground">Views Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-40"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="document_view">Document Views</option>
            <option value="document_download">Downloads</option>
          </Select>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-1.5 ${actionColors[log.action] || "bg-gray-100"}`}>
                      {actionIcons[log.action]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {log.profiles?.display_name || log.profiles?.username || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="capitalize">{log.action.replace("_", " ")}</span>
                        {log.documents?.title && (
                          <> &middot; {log.documents.title}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No activity recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
