import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

try {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    for (const line of envContent.split('\n')) {
        if (!line || line.startsWith('#')) continue;
        const [k, ...v] = line.split('=');
        if (k && v) process.env[k.trim()] = v.join('=').trim();
    }
} catch(e) {}

const client = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const testEmail = `test-trigger-${Date.now()}@test.com`;
  console.log('Creating...', testEmail);
  const { data, error } = await client.auth.admin.createUser({
    email: testEmail,
    password: "TestPassword@2026",
    user_metadata: { role: "customer" }
  });
  
  if (error) {
    console.error("Full Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success:", data.user.id);
  }
}
test();
