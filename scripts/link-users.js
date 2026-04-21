/**
 * CCIS — AuraBank | Auth Linker
 * 
 * This script links the Supabase Auth Users (created earlier) 
 * to the seeded public.employees and public.customers tables.
 * 
 * It uses the standard Supabase Client with the SERVICE_ROLE_KEY
 * to bypass RLS. No DB URL required.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const AUTH_USERS = [
  { email: "ceo@aurabank.in",           publicId: "e0000001-0000-0000-0000-000000000001", table: "employees" },
  { email: "priya@aurabank.in",         publicId: "e0000001-0000-0000-0000-000000000002", table: "employees" },
  { email: "rohan@aurabank.in",         publicId: "e0000001-0000-0000-0000-000000000003", table: "employees" },
  { email: "sneha@aurabank.in",         publicId: "e0000001-0000-0000-0000-000000000004", table: "employees" },
  { email: "kiran@aurabank.in",         publicId: "e0000001-0000-0000-0000-000000000005", table: "employees" },
  { email: "arjun@aurabank.in",         publicId: "e0000001-0000-0000-0000-000000000006", table: "employees" },
  { email: "rahul.sharma@gmail.com",    publicId: "c0000001-0000-0000-0000-000000000001", table: "customers" },
  { email: "ananya.verma@gmail.com",    publicId: "c0000001-0000-0000-0000-000000000002", table: "customers" },
  { email: "mihir.joshi@gmail.com",     publicId: "c0000001-0000-0000-0000-000000000003", table: "customers" },
  { email: "preethi.nair@gmail.com",    publicId: "c0000001-0000-0000-0000-000000000004", table: "customers" },
  { email: "sameer.khan@gmail.com",     publicId: "c0000001-0000-0000-0000-000000000005", table: "customers" },
  { email: "divya.patel@gmail.com",     publicId: "c0000001-0000-0000-0000-000000000006", table: "customers" },
  { email: "akash.singh@gmail.com",     publicId: "c0000001-0000-0000-0000-000000000007", table: "customers" },
  { email: "nisha.reddy@gmail.com",     publicId: "c0000001-0000-0000-0000-000000000008", table: "customers" },
  { email: "vikram.iyer@gmail.com",     publicId: "c0000001-0000-0000-0000-000000000009", table: "customers" },
  { email: "pooja.agarwal@gmail.com",   publicId: "c0000001-0000-0000-0000-000000000010", table: "customers" },
];

async function main() {
  console.log("🔗 Linking Auth Users to Public Tables...");
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  
  const emailToAuthId = new Map(users.map(u => [u.email, u.id]));
  
  for (const user of AUTH_USERS) {
    const authId = emailToAuthId.get(user.email);
    if (!authId) {
      console.warn(`⚠️  User not found in Auth: ${user.email}`);
      continue;
    }
    
    console.log(`   Attempting to link ${user.email}...`);
    const { error: updateError } = await supabase
      .from(user.table)
      .update({ auth_id: authId })
      .eq("id", user.publicId);
      
    if (updateError) {
      console.error(`   ❌ Error linking ${user.email}:`, updateError.message);
    } else {
      console.log(`   ✅ Linked ${user.email}`);
    }
  }
  
  console.log("\n✨ All done! Auth links updated.");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
