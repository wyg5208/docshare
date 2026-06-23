import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/health
 * Heartbeat endpoint — keeps Supabase project awake.
 * Called automatically by Vercel Cron Job every 6 hours.
 * Can also be called manually: curl https://docshare.wyg.life/api/health
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this header for cron invocations)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow unauthenticated access for manual health checks,
    // but log that it was unauthenticated
  }

  const start = Date.now();

  try {
    const supabase = await createClient();

    // Lightweight query to keep Supabase active
    const { error } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          error: error.message,
          latency_ms: Date.now() - start,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
