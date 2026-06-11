import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/analytics - Dashboard stats
export async function GET() {
  const supabase = await createClient();

  const [
    { count: totalDocs },
    { count: totalUsers },
    { count: totalViews },
    { count: totalDownloads },
  ] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("action", "document_view"),
    supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("action", "document_download"),
  ]);

  return NextResponse.json({
    total_documents: totalDocs || 0,
    total_users: totalUsers || 0,
    total_views: totalViews || 0,
    total_downloads: totalDownloads || 0,
  });
}
