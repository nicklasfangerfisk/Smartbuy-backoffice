import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      console.error('[Login] Auth error:', authError);
      setError(authError.message);
      setLoading(false);
      return;
    }
    // Fetch user role from users table
    const userId = data.user?.id;
    if (!userId) {
      setError('Login failed: No user ID.');
      setLoading(false);
      return;
    }
    let { data: userRow, error: userError } = await supabase.from('users').select('*').eq('id', userId).single();
    if (userError || !userRow) {
      console.error('[Login] User fetch error:', userError);
      // If not found, upsert as employee by default
      const { error: upsertError } = await supabase.from('users').upsert({
        id: userId,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
        role: 'employee',
      });
      if (upsertError) {
        console.error('Upsert failed:', upsertError);
        setError('Upsert failed: ' + upsertError.message);
        setLoading(false);
        return;
      }
      // Try fetching again, with up to 3 retries and a short delay
      let retries = 3;
      while (retries > 0) {
        await new Promise(res => setTimeout(res, 300));
        const { data: retryRow, error: retryError } = await supabase.from('users').select('*').eq('id', userId).single();
        if (retryError) {
          console.error('[Login] Retry user fetch error:', retryError);
        }
        if (retryRow && !retryError) {
          userRow = retryRow;
          userError = null;
          break;
        }
        retries--;
      }
      if (userError || !userRow) {
        setError('Access denied: User not found.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    }
    if (userRow.role !== 'employee') {
      setError('Access denied: Only employees can access this app.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    setLoading(false);
    onLogin();
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    // Google OAuth flow will redirect, so we cannot block in place. Instead, block in App after redirect.
    setLoading(false);
  }

  return (
    // Inline documentation for layout isolation
    // The main content is wrapped in a Box with full-height and centered alignment to ensure layout isolation.
    // A Card component is used to visually separate the login form.
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.body' }}>
      <Card sx={{ minWidth: 340, p: 4 }}>
        <Typography level="h3" sx={{ mb: 2 }}>Sign in to Smartbuy</Typography>
        <form onSubmit={handleLogin}>
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} required />
          <Button type="submit" loading={loading} fullWidth sx={{ mb: 1 }}>Sign In</Button>
        </form>
        <Button onClick={handleGoogleLogin} variant="outlined" fullWidth sx={{ mb: 1 }} disabled={loading}>Sign in with Google</Button>
        {error && <Typography color="danger" sx={{ mt: 1 }}>{error}</Typography>}
      </Card>
    </Box>
  );
}
