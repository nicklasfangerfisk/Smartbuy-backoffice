const { createClient } = require('@supabase/supabase-js');

// Hardcoded values for testing
const supabaseUrl = "https://tfzvtzqybgbzxcxozdes.supabase.co";
const supabaseAnonKey = "sb_secret_YVA0WknkMnp5oCSCUlkiSA_Al48ZJ7h";
const email = "nicklas_bak@hotmail.com";
const password = "1234";

console.log('[DEBUG] SUPABASE_URL:', supabaseUrl);
console.log('[DEBUG] SUPABASE_ANON_KEY:', supabaseAnonKey);
console.log('[DEBUG] Email:', email);
console.log('[DEBUG] Password:', password);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    // Try to sign in with email and password
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      console.error('Login error:', loginError);
      return;
    }
    console.log('Login successful:', loginData);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAuth();
