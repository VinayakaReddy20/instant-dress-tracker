// supabase/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

// ✅ pulled from env.d.ts so TypeScript knows these exist
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// ✅ create a strongly typed Supabase client with persistent sessions
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'sb-xvnyhgbthylvauedesbl-auth-token'
  }
});

// Add global error handling for Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in');
  }
});


