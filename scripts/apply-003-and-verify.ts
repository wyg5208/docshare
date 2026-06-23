/**
 * Test helper: applies 003 migration semantics in-place using the service_role
 * key, then prints diagnostic state before and after. Idempotent and safe to
 * re-run (subsequent runs will UPDATE 0 rows because everything is already
 * is_public=false).
 *
 * Usage: npx tsx scripts/apply-003-and-verify.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function snapshot(label: string) {
  console.log(`\n──── ${label} ────`);

  const { data: docs, error: e1 } = await supabase
    .from("documents")
    .select("id, title, is_public, status");
  if (e1) {
    console.error("documents query failed:", e1.message);
    return;
  }
  const total = docs?.length ?? 0;
  const publicCount = docs?.filter((d) => d.is_public).length ?? 0;
  const publishedCount = docs?.filter((d) => d.status === "published").length ?? 0;
  console.log(
    `documents: total=${total}, is_public=true count=${publicCount}, status=published count=${publishedCount}`
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, role");
  console.log(`profiles: total=${profiles?.length ?? 0}`);
  for (const p of profiles ?? []) {
    console.log(`   - ${p.username} [${p.role}]`);
  }

  const { data: perms } = await supabase
    .from("permissions")
    .select("id, user_id, document_id, category_id, permission");
  console.log(`permissions: total=${perms?.length ?? 0}`);
}

async function migrate() {
  // Mirrors 003_default_private_docs.sql: UPDATE all is_public=true → false.
  const { data, error } = await supabase
    .from("documents")
    .update({ is_public: false, updated_at: new Date().toISOString() })
    .eq("is_public", true)
    .select("id");

  if (error) {
    console.error("\n❌ migration failed:", error.message);
    process.exit(1);
  }
  console.log(`\n✅ migration applied: flipped ${data?.length ?? 0} document(s) to is_public=false`);
}

async function main() {
  console.log("🔑 Supabase URL:", URL);
  await snapshot("BEFORE migration");
  await migrate();
  await snapshot("AFTER migration");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
