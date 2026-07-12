import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

function createSafeClient(url: string, key: string) {
  if (!url || !key) {
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        eq: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
        ilike: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
        order: () => ({ limit: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }), range: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
        limit: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        neq: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
        gte: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
        range: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
    } as unknown as ReturnType<typeof createClient>;
  }
  return createClient(url, key);
}

export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createSafeClient(supabaseUrl, supabaseServiceKey);
