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
    
    try {
        const testEmail = `test-trigger-${Date.now()}@test.com`;
        
        await client.query(`
            INSERT INTO auth.users (
                id,
                email,
                raw_user_meta_data
            ) VALUES (
                gen_random_uuid(),
                $1,
                '{"role": "customer"}'
            )
        `, [testEmail]);
        console.log("Success! Trigger didn't complain.");
    } catch(err) {
        console.error("DB Error:", err);
    }
    
    await client.end();
}
run();
