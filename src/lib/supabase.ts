import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Service role key — only accessible server-side (no VITE_ prefix = not exposed to browser)
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta as any).env?.["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.");
}

if (!supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. supabaseAdmin will use the anon key — RLS will NOT be bypassed and server queries may return empty results."
  );
}

export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);

export const supabaseAdmin = createClient(
  supabaseUrl as string,
  supabaseServiceKey ?? (supabaseAnonKey as string),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
