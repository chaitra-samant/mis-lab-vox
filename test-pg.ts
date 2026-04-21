import { Client } from 'pg';
import * as fs from 'fs';

try {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    for (const line of envContent.split('\n')) {
        if (!line || line.startsWith('#')) continue;
        const [k, ...v] = line.split('=');
        if (k && v) process.env[k.trim()] = v.join('=').trim();
    }
} catch(e) {}

async function run() {
    const client = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
    });
    await client.connect();
    
    // Check the trigger definition
    const res = await client.query(`
        SELECT pg_get_functiondef(oid) 
        FROM pg_proc 
        WHERE proname = 'handle_new_user'
    `);
    console.log(res.rows[0].pg_get_functiondef);
    
    await client.end();
}
run();
