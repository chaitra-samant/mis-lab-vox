const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
