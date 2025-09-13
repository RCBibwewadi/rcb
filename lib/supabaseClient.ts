import { createClient } from "@supabase/supabase-js";

// Frontend client (Anon/Public key, safe for browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (Service Role Key, do NOT expose to browser)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
