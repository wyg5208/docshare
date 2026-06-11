/**
 * Seed script: Creates test user accounts with different roles.
 *
 * Prerequisites:
 *   1. .env.local file configured with Supabase credentials
 *   2. Database migrations executed (001 + 002)
 *
 * Usage: npx tsx scripts/seed-users.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// ── Load .env.local ─────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found. Please create it with Supabase credentials.");
    process.exit(1);
  }

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SUPABASE_URL.includes("placeholder")) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("   Required: NEXT_PUBLIC_SUPABASE_URL");
  console.error("   Required: SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

// ── Admin Client ────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Test Accounts ───────────────────────────────────────────────
const TEST_USERS = [
  {
    email: "admin@docshare.dev",
    password: "Admin123!",
    username: "admin",
    display_name: "Admin User",
    role: "admin" as const,
    bio: "Platform administrator with full access.",
  },
  {
    email: "editor@docshare.dev",
    password: "Editor123!",
    username: "editor",
    display_name: "Editor User",
    role: "editor" as const,
    bio: "Content editor who can upload and manage documents.",
  },
  {
    email: "viewer@docshare.dev",
    password: "Viewer123!",
    username: "viewer",
    display_name: "Viewer User",
    role: "viewer" as const,
    bio: "Regular user with read-only access.",
  },
];

// ── Seed Function ───────────────────────────────────────────────
async function seedUsers() {
  console.log("🔑 Connecting to Supabase:", SUPABASE_URL);
  console.log("");

  let created = 0;
  let skipped = 0;

  // Fetch existing users to check for duplicates
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  const existingUserMap = new Map(
    (allUsers?.users || []).map((u) => [u.email?.toLowerCase(), u])
  );

  for (const user of TEST_USERS) {
    const existingUser = existingUserMap.get(user.email.toLowerCase());

    if (existingUser) {
      // User exists - upsert profile (INSERT if missing, UPDATE if exists)
      console.log(`⏭  ${user.email} already exists, ensuring profile role is ${user.role}...`);
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: existingUser.id,
          username: user.username,
          role: user.role,
          display_name: user.display_name,
          bio: user.bio,
        });

      if (updateError) {
        console.error(`   ⚠ Failed to upsert profile: ${updateError.message}`);
      } else {
        console.log(`   ✅ Profile role set to ${user.role}`);
      }
      skipped++;
      continue;
    }

    // Create user via Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        username: user.username,
        display_name: user.display_name,
      },
    });

    if (error) {
      console.error(`❌ Failed to create ${user.email}:`, error.message);
      continue;
    }

    if (data?.user) {
      // The trigger `on_auth_user_created` auto-creates the profile,
      // but with default role 'viewer'. Upsert to ensure profile exists with correct role.
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          username: user.username,
          role: user.role,
          display_name: user.display_name,
          bio: user.bio,
        });

      if (profileError) {
        console.error(`   ⚠ Failed to update profile for ${user.email}:`, profileError.message);
      }

      console.log(`✅ Created ${user.email} (${user.role}) — ID: ${data.user.id}`);
      created++;
    }
  }

  console.log("");
  console.log("────────────────────────────────────────");
  console.log(`   Created: ${created}  |  Skipped: ${skipped}`);
  console.log("────────────────────────────────────────");
  console.log("");
  console.log("📋 Test Accounts:");
  console.log("   Admin:  admin@docshare.dev / Admin123!");
  console.log("   Editor: editor@docshare.dev / Editor123!");
  console.log("   Viewer: viewer@docshare.dev / Viewer123!");
  console.log("");
}

seedUsers().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
