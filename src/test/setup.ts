import "@testing-library/jest-dom";

// Silence specific console noise during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    // Suppress known benign React Router / Radix warnings in test env
    if (
      msg.includes("Warning: An update to") ||
      msg.includes("Not implemented") ||
      msg.includes("Error: Could not parse CSS")
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

import * as fs from 'fs'
import * as path from 'path'

// Load real env vars if they exist
const envPath = path.resolve('.env.local')
const realEnv: Record<string, string> = {}
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) return
    const [key, ...valueParts] = trimmedLine.split('=')
    if (key && valueParts.length > 0) {
      realEnv[key.trim()] = valueParts.join('=').trim()
    }
  })
}

// Set process.env for service role
process.env.SUPABASE_SERVICE_ROLE_KEY = realEnv['SUPABASE_SERVICE_ROLE_KEY'] || realEnv['VITE_SUPABASE_SERVICE_ROLE_KEY']

// Env configuration for tests
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        ...realEnv,
        VITE_USE_MOCK_AUTH: "true",
        MODE: "test",
        DEV: true,
        PROD: false,
      },
    },
  },
  writable: true,
});
