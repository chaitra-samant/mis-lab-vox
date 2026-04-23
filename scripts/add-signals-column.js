import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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
const DB_URL = env.SUPABASE_DB_URL;

async function main() {
  console.log("🚀 Adding 'signals' column to ai_analyses...");
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  try {
    await client.query("ALTER TABLE public.ai_analyses ADD COLUMN IF NOT EXISTS signals JSONB;");
    console.log("✅ Column 'signals' added successfully.");
  } catch (err) {
    console.error("❌ Error adding column:", err.message);
  } finally {
    await client.end();
  }
}

main();
