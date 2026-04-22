import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split(/\r?\n/).forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const supabase = createClient(env['VITE_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

async function run() {
  const { data, error } = await supabase.from('complaints').select('*').limit(5)
  if (error) {
    console.error(error)
    return
  }
  console.log('Complaints Data:', JSON.stringify(data, null, 2))
}

run()
