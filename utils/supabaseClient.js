// Jest stub for supabase client during tests
// This file replaces the real supabase client to avoid import.meta.env errors
module.exports = {
  supabase: {},
};
