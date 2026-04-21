/**
 * CCIS — AuraBank | SQL Runner via Supabase REST
 * 
 * This script executes SQL files against your Supabase project
 * by using a PostgreSQL direct connection.
 * 
 * Add SUPABASE_DB_URL to your .env.local:
 * Format: postgresql://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
 * 
 * Find it at: Supabase Dashboard → Project Settings → Database → Connection string → URI
 */

import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@supabase/supabase-js";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  const raw = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const DB_URL = env.SUPABASE_DB_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!DB_URL) {
  console.error("❌ Missing SUPABASE_DB_URL in .env.local");
  console.error("   Add it from: Supabase Dashboard → Project Settings → Database → Connection string → URI");
  console.error("   Format: postgresql://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const AUTH_USERS = [
  { email: "ceo@aurabank.in",           password: "AuraBank@2026", role: "ceo",      publicId: "e0000001-0000-0000-0000-000000000001", table: "employees" },
  { email: "priya@aurabank.in",         password: "AuraBank@2026", role: "employee", publicId: "e0000001-0000-0000-0000-000000000002", table: "employees" },
  { email: "rohan@aurabank.in",         password: "AuraBank@2026", role: "employee", publicId: "e0000001-0000-0000-0000-000000000003", table: "employees" },
  { email: "sneha@aurabank.in",         password: "AuraBank@2026", role: "employee", publicId: "e0000001-0000-0000-0000-000000000004", table: "employees" },
  { email: "kiran@aurabank.in",         password: "AuraBank@2026", role: "employee", publicId: "e0000001-0000-0000-0000-000000000005", table: "employees" },
  { email: "arjun@aurabank.in",         password: "AuraBank@2026", role: "employee", publicId: "e0000001-0000-0000-0000-000000000006", table: "employees" },
  { email: "rahul.sharma@gmail.com",    password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000001", table: "customers" },
  { email: "ananya.verma@gmail.com",    password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000002", table: "customers" },
  { email: "mihir.joshi@gmail.com",     password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000003", table: "customers" },
  { email: "preethi.nair@gmail.com",    password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000004", table: "customers" },
  { email: "sameer.khan@gmail.com",     password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000005", table: "customers" },
  { email: "divya.patel@gmail.com",     password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000006", table: "customers" },
  { email: "akash.singh@gmail.com",     password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000007", table: "customers" },
  { email: "nisha.reddy@gmail.com",     password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000008", table: "customers" },
  { email: "vikram.iyer@gmail.com",     password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000009", table: "customers" },
  { email: "pooja.agarwal@gmail.com",   password: "Customer@2026", role: "customer", publicId: "c0000001-0000-0000-0000-000000000010", table: "customers" },
];

async function runSQLFile(client, label, filePath) {
  console.log(`\n📋 Running ${label}...`);
  const sql = readFileSync(filePath, "utf-8");
  try {
    await client.query(sql);
    console.log(`   ✅ ${label} complete`);
  } catch (err) {
    if (err.message?.includes("already exists") || err.message?.includes("duplicate key")) {
      console.log(`   ⚠️  ${label}: Some objects already exist (ok, skipping)`);
    } else {
      console.error(`   ❌ ${label} error: ${err.message}`);
    }
  }
}

async function createAuthUsers() {
  console.log("\n👤 Ensuring Auth users exist...");
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = new Map(listData?.users?.map(u => [u.email, u.id]) ?? []);
  const linked = [];

  for (const user of AUTH_USERS) {
    if (existing.has(user.email)) {
      console.log(`   ⏭️  Exists: ${user.email} (${existing.get(user.email)})`);
      linked.push({ ...user, authId: existing.get(user.email) });
      continue;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: user.role },
    });
    if (error) {
      console.error(`   ❌ Failed: ${user.email} — ${error.message}`);
    } else {
      console.log(`   ✅ Created: ${user.email}`);
      linked.push({ ...user, authId: data.user.id });
    }
  }
  return linked;
}

async function linkAuthIds(client, users) {
  console.log("\n🔗 Linking auth IDs to public tables...");
  for (const user of users) {
    if (!user.authId) continue;
    try {
      await client.query(
        `UPDATE public.${user.table} SET auth_id = $1 WHERE id = $2`,
        [user.authId, user.publicId]
      );
      console.log(`   ✅ Linked ${user.email} → ${user.table}`);
    } catch (err) {
      console.error(`   ❌ Link failed for ${user.email}: ${err.message}`);
    }
  }
}

async function main() {
  console.log("🚀 CCIS AuraBank — Database Setup");
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log("=".repeat(50));

  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("   ✅ Connected to database");

  await runSQLFile(client, "schema.sql", join(__dirname, "..", "supabase", "schema.sql"));
  await runSQLFile(client, "rls.sql",    join(__dirname, "..", "supabase", "rls.sql"));
  await runSQLFile(client, "seed.sql",   join(__dirname, "..", "supabase", "seed.sql"));

  const linked = await createAuthUsers();
  await linkAuthIds(client, linked);

  await client.end();

  console.log("\n" + "=".repeat(50));
  console.log("✅ Setup complete!\n");
  console.log("📋 Demo Login Credentials:");
  console.log("   👤 CEO:       ceo@aurabank.in           / AuraBank@2026  → /ceo");
  console.log("   🏢 Employee:  priya@aurabank.in          / AuraBank@2026  → /agent");
  console.log("   🙋 Customer:  rahul.sharma@gmail.com     / Customer@2026  → /customer");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
