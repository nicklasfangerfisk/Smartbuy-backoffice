// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Anon Key:', supabaseAnonKey.slice(0, 6) + '...' + supabaseAnonKey.slice(-6));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Listen for auth state changes to handle token refresh
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Auth State Change]', event, session);
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

// Global session listener to handle session changes
let isHandlingSessionChange = false;

supabase.auth.onAuthStateChange((event, session) => {
  if (isHandlingSessionChange) return;
  isHandlingSessionChange = true;

  console.log('[Auth State Change]', event, session);
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  isHandlingSessionChange = false;
});
