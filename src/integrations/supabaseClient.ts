// supabase/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// ✅ pulled from env.d.ts so TypeScript knows these exist
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// ✅ create a strongly typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
