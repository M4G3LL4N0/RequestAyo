import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA, SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export const supabase = createClient(
  SUPABASE_URL || "https://supabase-not-configured.invalid",
  SUPABASE_ANON_KEY || "unconfigured",
  {
    db: { schema: SUPABASE_SCHEMA },
  },
);
