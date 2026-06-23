/**
 * Cleanup: remove the test-granted permission for viewer -> USER_GUIDE.
 * Usage: npx tsx scripts/test-cleanup.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

(function loadEnv() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    if (!process.env[k]) process.env[k] = t.slice(eq + 1).trim();
  }
})();

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data: profile } = await sb
    .from("profiles")
    .select("id")
    .eq("username", "viewer")
    .single();

  const { data: doc } = await sb
    .from("documents")
    .select("id")
    .eq("title", "USER_GUIDE")
    .limit(1)
    .single();

  if (!profile || !doc) {
    console.error("Cannot find viewer or USER_GUIDE doc");
    process.exit(1);
  }

  const { error } = await sb
    .from("permissions")
    .delete()
    .eq("user_id", profile.id)
    .eq("document_id", doc.id);

  if (error) {
    console.error("Delete error:", error.message);
    process.exit(1);
  }
  console.log("✅ Cleaned up: removed viewer -> USER_GUIDE permission");

  const { data: remaining } = await sb
    .from("permissions")
    .select("id")
    .eq("user_id", profile.id);
  console.log(`viewer now has ${remaining?.length ?? 0} permissions (should be 3)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
