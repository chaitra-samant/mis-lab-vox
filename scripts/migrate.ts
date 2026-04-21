/**
 * Supabase Migration Runner
 * Applies SQL migrations to the Supabase database
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    const env: Record<string, string> = {};
    for (const line of lines) {
      if (!line || line.startsWith("#")) continue;
      const [key, ...value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.join("=").trim();
      }
    }
    return env;
  } catch (error) {
    console.error("❌ Could not read .env.local file");
    process.exit(1);
  }
}

const envVars = loadEnvFile();
const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration(name: string, sqlPath: string) {
  try {
    console.log(`\n📝 Running migration: ${name}`);
    const sqlPath_full = join(process.cwd(), sqlPath);
    const sql = readFileSync(sqlPath_full, "utf-8");

    // Note: This uses the admin client to execute SQL
    // We need to split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    for (const statement of statements) {
      try {
        const { error } = await adminClient.rpc("exec_sql", { sql: statement });
        if (error && !error.message.includes("does not exist")) {
          console.warn(`⚠️ Warning: ${error.message}`);
        }
      } catch (err: any) {
        // Some statements might fail, continue
        if (!err.message?.includes("does not exist")) {
          console.warn(`⚠️ Warning: ${err.message}`);
        }
      }
    }

    console.log(`✅ Migration ${name} completed`);
  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}`);
  }
}

async function main() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║  Supabase Migration Runner                         ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  // Note: Direct SQL execution via RPC requires setup
  // For now, we'll document manual migration instructions
  console.log(
    "⚠️ Please apply the following migrations manually in Supabase SQL Editor:\n"
  );
  console.log("1. Schema: supabase/schema.sql");
  console.log("2. RLS & Triggers: supabase/rls.sql");
  console.log("3. Seed Data: supabase/seed.sql\n");

  console.log(
    "Or use Supabase CLI:\n" +
      "  supabase db push\n"
  );
}

main();
