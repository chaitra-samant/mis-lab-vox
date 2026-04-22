import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Manually parse .env.local
const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split(/\r?\n/).forEach(line => {
  const trimmedLine = line.trim()
  if (!trimmedLine || trimmedLine.startsWith('#')) return
  const [key, ...valueParts] = trimmedLine.split('=')
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = env['VITE_SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('Verifying Supabase Connection...')
  
  const tables = ['customers', 'employees', 'complaints', 'ai_analyses', 'faqs']
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.error(`❌ Error accessing table "${table}":`, error.message)
    } else {
      console.log(`✅ Table "${table}" is accessible.`)
    }
  }
}

verify()
