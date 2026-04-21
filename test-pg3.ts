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
        await client.query(`
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            BEGIN
              -- If role is 'customer', create a customer record
              IF NEW.raw_user_meta_data->>'role' = 'customer' THEN
                INSERT INTO public.customers (auth_id, name, email)
                VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email)
                ON CONFLICT (auth_id) DO NOTHING;
              
              -- If role is 'employee' or 'ceo', create an employee record
              ELSIF NEW.raw_user_meta_data->>'role' IN ('employee', 'ceo') THEN
                INSERT INTO public.employees (auth_id, name, email, department, role, is_ceo)
                VALUES (
                  NEW.id,
                  COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
                  NEW.email,
                  COALESCE(NEW.raw_user_meta_data->>'department', 'Operations'),
                  CASE WHEN NEW.raw_user_meta_data->>'role' = 'ceo' THEN 'senior_agent' ELSE 'agent' END,
                  NEW.raw_user_meta_data->>'role' = 'ceo'
                )
                ON CONFLICT (auth_id) DO NOTHING;
              END IF;

              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        console.log("Trigger replaced successfully!");
    } catch(err) {
        console.error("DB Error:", err);
    }
    
    await client.end();
}
run();
