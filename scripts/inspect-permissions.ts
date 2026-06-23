/**
 * Diagnostic query: prints permissions detail and document visibility map
 * to verify the visibility model after applying 003.
 *
 * Usage: npx tsx scripts/inspect-permissions.ts
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
  const { data: perms } = await sb
    .from("permissions")
    .select(
      "id, permission, expires_at, profiles:user_id(username, role), documents:document_id(title), categories:category_id(name)"
    );
  console.log("\n──── permissions detail ────");
  for (const p of perms ?? []) {
    type ProfileRef = { username: string; role: string } | null;
    type DocRef = { title: string } | null;
    type CatRef = { name: string } | null;
    const pp = p as unknown as {
      permission: string;
      profiles: ProfileRef;
      documents: DocRef;
      categories: CatRef;
    };
    console.log(
      `   ${pp.profiles?.username ?? "?"} [${pp.profiles?.role ?? "?"}] -> ${
        pp.documents?.title ?? pp.categories?.name ?? "?"
      } (${pp.permission})`
    );
  }

  const { data: docs } = await sb
    .from("documents")
    .select("title, is_public, status")
    .order("created_at");
  console.log("\n──── documents state ────");
  for (const d of docs ?? []) {
    console.log(
      `   [is_public=${d.is_public}] [${d.status}] ${d.title}`
    );
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
