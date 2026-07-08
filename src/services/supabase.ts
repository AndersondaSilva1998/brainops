// Supabase client stub.
// Intentionally NOT importing @supabase/supabase-js yet so the project builds
// without the dependency. When you're ready to wire the backend:
//   1) bun add @supabase/supabase-js
//   2) uncomment the createClient() block
//   3) set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

// import { createClient } from "@supabase/supabase-js";
// export const supabase = isSupabaseConfigured
//   ? createClient(supabaseConfig.url!, supabaseConfig.anonKey!)
//   : null;
export const supabase = null as unknown;
