import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";
import { getServerEnv } from "../validators/env.schema";

let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (adminClientInstance) {
    return adminClientInstance;
  }

  const env = getServerEnv();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  adminClientInstance = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClientInstance;
}
