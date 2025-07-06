import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Link from '@mui/joy/Link';
import Checkbox from '@mui/joy/Checkbox';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}

interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

function ColorSchemeToggle(props: IconButtonProps) {
  const { onClick, ...other } = props;
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <IconButton
      aria-label="toggle light/dark mode"
      size="sm"
      variant="outlined"
      disabled={!mounted}
      onClick={(event) => {
        setMode(mode === 'light' ? 'dark' : 'light');
        onClick?.(event);
      }}
      {...other}
    >
      {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

export default function Login({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.pathname === '/login') {
      async function checkSession() {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          navigate('/dashboard');
        }
      }
      checkSession();
    }
  }, [navigate]);

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
      let retryRow: any;
      let retryError: any;
      while (retries > 0) {
        await new Promise(res => setTimeout(res, 300));
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
        retryRow = data;
        retryError = error;
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
    navigate('/dashboard');
  }

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ':root': {
            '--Form-maxWidth': '800px',
            '--Transition-duration': '0.4s',
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: '100%', md: '50vw' },
          transition: 'width var(--Transition-duration)',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255 255 255 / 0.2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundColor: 'rgba(19 19 24 / 0.4)',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: '100%',
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{ py: 3, display: 'flex', justifyContent: 'space-between' }}
          >
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              <IconButton variant="soft" color="primary" size="sm">
                <BadgeRoundedIcon />
              </IconButton>
              <Typography level="title-lg">SmartBack</Typography>
            </Box>
            <ColorSchemeToggle />
          </Box>
          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: 'hidden',
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  Sign in
                </Typography>
                <Typography level="body-sm">
                  Welcome back to SmartBack! Please sign in to continue.
                </Typography>
              </Stack>
            </Stack>
            <Stack sx={{ gap: 4, mt: 2 }}>
              <form onSubmit={handleLogin}>
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </FormControl>
                <FormControl required>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    name="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    disabled={loading}
                  />
                </FormControl>
                <Stack sx={{ gap: 4, mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Checkbox size="sm" label="Remember me" name="persistent" />
                    <Link level="title-sm" href="#forgot-password">
                      Forgot your password?
                    </Link>
                  </Box>
                  <Button type="submit" fullWidth loading={loading}>
                    Sign in
                  </Button>
                </Stack>
              </form>
            </Stack>
            {error && (
              <Box sx={{ mt: 2 }}>
                <Typography level="body-sm" color="danger">
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: 'center' }}>
              © SmartBack {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: '100%',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: '50vw' },
          transition:
            'background-image var(--Transition-duration), left var(--Transition-duration) !important',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          backgroundColor: 'background.level1',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundImage:
              'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
          },
        })}
      />
    </CssVarsProvider>
  );
}
