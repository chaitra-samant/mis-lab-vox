
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
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const res = await client.query("SELECT COUNT(*) FROM complaints");
  console.log("Total complaints:", res.rows[0].count);
  
  const res2 = await client.query("SELECT COUNT(*) FROM ai_analyses");
  console.log("Total AI analyses:", res2.rows[0].count);

  const res3 = await client.query("SELECT * FROM complaints LIMIT 1");
  console.log("Sample complaint:", res3.rows[0]);

  await client.end();
}

main().catch(err => console.error(err));
