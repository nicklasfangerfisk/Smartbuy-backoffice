import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';

import Sidebar from './components/navigation/Sidebar';
import PageOrderDesktop from './components/Page/PageOrderDesktop';
import Header from './components/navigation/Header';
import PageProductDesktop from './components/Page/PageProductDesktop';
import PageUsersDesktop from './components/Page/PageUsersDesktop';
import PageUsersMobile from './components/Page/PageUsersMobile';
import Suppliers from './components/Page/Suppliers';
import PagePurchaseOrderDesktop from './components/Page/PagePurchaseOrderDesktop';
import PagePurchaseOrderMobile from './components/Page/PagePurchaseOrderMobile';
import Login from './components/auth/Login';
import { supabase } from './utils/supabaseClient';
import { useState } from 'react';
import MobileMenu, { MobileMenuItem } from './components/navigation/MobileMenu';
import useMediaQuery from '@mui/material/useMediaQuery';
import TicketList from './components/Page/PageTicketDesktop';
import PageSmsCampaignsDesktop from './components/Page/PageSmsCampaignsDesktop';
import PageSmsCampaignsMobile, { PageSmsCampaignsMobileItem } from './components/Page/PageSmsCampaignsMobile';
import { User, UserResponse } from '@supabase/supabase-js';
import { PagePurchaseOrderMobileItem } from './components/Page/PagePurchaseOrderMobile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PageDashboard from './components/Page/PageDashboard';
import { Database } from './components/general/supabase.types';

type AppUser = Database['public']['Tables']['users']['Row'] & { phone: string | null };

const muiTheme = createTheme({
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          } as React.CSSProperties,
        },
      },
    },
  },
});

function Home() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h1">Welcome to Smartbuy Backoffice</Typography>
      <Typography level="body-lg" sx={{ mt: 2 }}>
        Use the menu to manage orders and products.
      </Typography>
    </Box>
  );
}

function Messages() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2">Messages</Typography>
      <Typography level="body-md" sx={{ mt: 2 }}>
        This is the messages page. You can add your messages UI here.
      </Typography>
    </Box>
  );
}

export default function JoyOrderDashboardTemplate() {
  const [view, setView] = React.useState<'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders' | 'tickets' | 'smscampaigns'>('home');
  const [authChecked, setAuthChecked] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [campaigns, setCampaigns] = React.useState<PageSmsCampaignsMobileItem[]>([]);
  const [orders, setOrders] = React.useState<PagePurchaseOrderMobileItem[]>([]);
  const [users, setUsers] = React.useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [errorUsers, setErrorUsers] = React.useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  // Define which menu items to show in the mobile menu
  const mobileMenuItems: MobileMenuItem[] = [
    { label: 'Home', icon: <HomeRoundedIcon />, value: 'home' },
    { label: 'Orders', icon: <ShoppingCartRoundedIcon />, value: 'orders' },
    { label: 'Products', icon: <DashboardRoundedIcon />, value: 'products' },
  ];

  React.useEffect(() => {
    supabase.auth.getUser().then(
      (res: UserResponse) => { /* console.log('[Supabase Test] getUser result:', res); */ },
      (err: Error) => { /* console.error('[Supabase Test] getUser error:', err); */ }
    );

    supabase.auth.getUser().then(({ data }: UserResponse) => {
      if (data && data.user) {
        setUser(data.user);
      }
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data, error } = await supabase.from('Campaigns').select('*');
        if (error) throw error;
        setCampaigns(data || []);
      } catch (err) {
        /* console.error('Failed to fetch campaigns:', err); */
      }
    }

    fetchCampaigns();
  }, []);

  React.useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        setUsers(
          (data || []).map((user) => ({
            ...user,
            name: user.name || '',
            last_login: user.last_login || '',
            phone: user.phone ?? null, // Ensure 'phone' is explicitly set to null if undefined
          }))
        );
      } catch (err) {
        setErrorUsers('Failed to fetch users');
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  if (!authChecked) return null;
  if (!user) return <Login onLogin={async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }} />;

  return (
    <ThemeProvider theme={muiTheme}>
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100dvh', width: '100vw', overflow: 'hidden', position: 'fixed', inset: 0 }}>
          <Sidebar setView={setView} view={view} />
          {/* Only show Header on desktop or when not in mobile tickets view */}
          {!(isMobile && view === 'tickets') && <Header />}
          <Box
            component="main"
            className="MainContent"
            sx={{
              position: 'relative', // Ensure isolation
              px: view === 'tickets' ? 0 : { xs: 2, md: 6 },
              pt: view === 'tickets' ? 0 : {
                xs: 'calc(12px + var(--Header-height))',
                sm: 'calc(12px + var(--Header-height))',
                md: 3,
              },
              pb: view === 'tickets' ? 0 : { xs: 8, sm: 2, md: 3 },
              flex: 1,
              minWidth: 0,
              gap: 1,
              overflow: 'hidden', // Prevent bleed-through
              backgroundColor: 'background.paper', // Add background for isolation
              borderRadius: 2, // Optional: Add visual separation
              boxShadow: 1, // Optional: Add shadow for better isolation
            }}
          >
            {view === 'home' && <PageDashboard />}
            {view === 'orders' && <PageOrderDesktop />}
            {view === 'products' && <PageProductDesktop />}
            {view === 'messages' && <Messages />}
            {view === 'users' && (isMobile ? <PageUsersMobile users={users} /> : <PageUsersDesktop users={users} />)}
            {view === 'suppliers' && <Suppliers />}
            {view === 'purchaseorders' && (isMobile ? <PagePurchaseOrderMobile orders={orders} /> : <PagePurchaseOrderDesktop orders={orders} />)}
            {view === 'tickets' && <TicketList />}
            {view === 'smscampaigns' && (isMobile ? <PageSmsCampaignsMobile campaigns={campaigns} /> : <PageSmsCampaignsDesktop campaigns={campaigns} />)}
          </Box>
          {isMobile && (
            <MobileMenu
              items={mobileMenuItems}
              value={view}
              onChange={setView}
            />
          )}
        </Box>
      </CssVarsProvider>
    </ThemeProvider>
  );
}
