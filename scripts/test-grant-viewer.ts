/**
 * Test: Grant viewer access to one USER_GUIDE document to verify RLS whitelist works.
 * Usage: npx tsx scripts/test-grant-viewer.ts
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
  // Get viewer profile id
  const { data: profile, error: e1 } = await sb
    .from("profiles")
    .select("id, username")
    .eq("username", "viewer")
    .single();
  if (e1 || !profile) {
    console.error("Cannot find viewer profile:", e1?.message);
    process.exit(1);
  }
  console.log("viewer id:", profile.id);

  // Get a USER_GUIDE document
  const { data: doc, error: e2 } = await sb
    .from("documents")
    .select("id, title")
    .eq("title", "USER_GUIDE")
    .limit(1)
    .single();
  if (e2 || !doc) {
    console.error("Cannot find USER_GUIDE doc:", e2?.message);
    process.exit(1);
  }
  console.log("doc id:", doc.id, "title:", doc.title);

  // Grant view permission
  const { error: e3 } = await sb.from("permissions").insert({
    user_id: profile.id,
    document_id: doc.id,
    permission: "view",
  });
  if (e3) {
    console.error("Insert error:", e3.message);
    process.exit(1);
  }
  console.log("✅ Granted viewer -> USER_GUIDE (view)");

  // Print new permissions total
  const { data: perms } = await sb
    .from("permissions")
    .select("id")
    .eq("user_id", profile.id);
  console.log(`viewer now has ${perms?.length ?? 0} total permissions`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
