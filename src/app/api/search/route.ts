import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/search - Full-text search
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!q) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabase.rpc("search_documents", {
    query_text: q,
    filter_category: category || null,
    filter_type: type || null,
    page_limit: limit,
    page_offset: offset,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
