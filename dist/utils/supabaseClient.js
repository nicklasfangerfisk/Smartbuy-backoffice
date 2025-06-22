var _a, _b;
// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : '';
const supabaseAnonKey = (_b = process.env.SUPABASE_ANON_KEY) !== null && _b !== void 0 ? _b : '';
console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Anon Key:', supabaseAnonKey.slice(0, 6) + '...' + supabaseAnonKey.slice(-6));
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
