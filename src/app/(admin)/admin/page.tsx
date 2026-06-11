import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Files, Users, Eye, Download, Activity } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats in parallel
  const [
    { count: totalDocs },
    { count: totalUsers },
    { data: viewStats },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("access_logs")
      .select("action")
      .eq("action", "document_view"),
    supabase
      .from("access_logs")
      .select("*, profiles(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalViews = viewStats?.length || 0;

  const { count: totalDownloads } = await supabase
    .from("access_logs")
    .select("*", { count: "exact", head: true })
    .eq("action", "document_download");

  const stats = [
    { label: "Total Documents", value: totalDocs || 0, icon: Files, color: "text-blue-500" },
    { label: "Total Users", value: totalUsers || 0, icon: Users, color: "text-green-500" },
    { label: "Total Views", value: totalViews, icon: Eye, color: "text-purple-500" },
    { label: "Total Downloads", value: totalDownloads || 0, icon: Download, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your document platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-1.5 ${
                      log.action === "login"
                        ? "bg-green-100 text-green-600"
                        : log.action === "document_view"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-orange-100 text-orange-600"
                    }`}>
                      {log.action === "login" ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {log.profiles?.display_name || log.profiles?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {log.action.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
