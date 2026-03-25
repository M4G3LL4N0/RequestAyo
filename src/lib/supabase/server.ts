import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./config";

export function createServerSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: SUPABASE_SCHEMA },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// For future auth integration
export function createServerClient(cookieStore: any) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: SUPABASE_SCHEMA },
    auth: {
      cookieStore,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
