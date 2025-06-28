import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CssVarsProvider, CssBaseline } from '@mui/joy';
import Box from '@mui/joy/Box';

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
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import './App.css'; // Import custom styles
import LoginLayout from './components/auth/LoginLayout';
import PageMovementsDesktop from './components/Page/PageMovementsDesktop';
import PageInventoryDesktop from './components/Page/PageInventoryDesktop';
import PageSettingsDesktop from './components/Page/PageSettingsDesktop';
import PageSettingsMobile from './components/Page/PageSettingsMobile';
import PageMovementsMobile from './components/Page/PageMovementsMobile';

function Layout() {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  const [mobileMenuValue, setMobileMenuValue] = useState<'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders' | 'tickets' | 'smscampaigns' | 'movements'>('home');
  const [users, setUsers] = useState<{
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    created_at: string | null;
    last_login: string | null;
    phone: string | null;
  }[]>([]);

  const mobileMenuItems: MobileMenuItem[] = [
    { label: 'Home', icon: <HomeRoundedIcon />, value: 'home' },
    { label: 'Orders', icon: <ShoppingCartRoundedIcon />, value: 'orders' },
    { label: 'Users', icon: <GroupRoundedIcon />, value: 'users' },
    { label: 'Suppliers', icon: <SettingsRoundedIcon />, value: 'suppliers' },
  ];

  React.useEffect(() => {
    const pathToValueMap: Record<string, typeof mobileMenuValue> = {
      '/': 'home',
      '/dashboard': 'home',
      '/orders': 'orders',
      '/products': 'products',
      '/users': 'users',
      '/suppliers': 'suppliers',
      '/purchase-orders': 'purchaseorders',
      '/tickets': 'tickets',
      '/sms-campaigns': 'smscampaigns',
      '/movements': 'movements',
    };
    setMobileMenuValue(pathToValueMap[location.pathname] || 'home');
  }, [location.pathname]);

  React.useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        console.log('Fetched users:', data);
        const mappedUsers = (data || []).map((user) => ({
          id: user.id,
          name: user.name || null,
          email: user.email,
          role: user.role || null,
          created_at: user.created_at || null,
          last_login: user.last_login || null,
          phone: user.phone || null,
        }));
        setUsers(mappedUsers);
      }
    }

    fetchUsers();
  }, []);

  console.log('isMobile:', isMobile);

  return (
    <Box sx={{ display: 'flex' }}>
      {location.pathname !== '/login' && <Sidebar setView={(view) => console.log(view)} view="home" />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: location.pathname !== '/dashboard' && location.pathname !== '/login' ? 3 : 0,
          width: { sm: '100%', md: 'calc(100% - 240px)' },
          marginBottom: isMobile ? '56px' : 0, // Adjust for MobileMenu height
        }}
      >
        {/* Only render Header on pages where it is wanted, not on dashboard */}
        {location.pathname !== '/login' && location.pathname !== '/dashboard' && <Header />}
        {isMobile && location.pathname !== '/login' && (
          <MobileMenu
            items={mobileMenuItems}
            value={mobileMenuValue}
            onChange={(value: typeof mobileMenuValue) => {
              setMobileMenuValue(value);
              navigate(`/${value}`);
            }}
            toggleSidebar={() => console.log('Sidebar toggled')} // Provide toggleSidebar prop
          />
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <PageOrderDesktop rows={[]} orderDetailsOpen={false} selectedOrder={null} fetchOrderItems={(orderUuid) => Promise.resolve([])} onCloseOrderDetails={() => {}} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <PageProductDesktop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                {isMobile ? (
                  <PageUsersMobile users={users} />
                ) : (
                  <PageUsersDesktop users={users} />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PagePurchaseOrderDesktop orders={[]} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-campaigns"
            element={
              <ProtectedRoute>
                <PageSmsCampaignsDesktop campaigns={[]} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movements"
            element={
              <ProtectedRoute>
                {isMobile ? (
                  <PageMovementsMobile />
                ) : (
                  <PageMovementsDesktop />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <PageInventoryDesktop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                {isMobile ? <PageSettingsMobile /> : <PageSettingsDesktop />}
              </ProtectedRoute>
            }
          />
          {/* Redirect all unknown routes to / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <CssVarsProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login/*" element={<LoginLayout />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </Router>
    </CssVarsProvider>
  );
}
