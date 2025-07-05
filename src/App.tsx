import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import { CssVarsProvider } from '@mui/joy/styles';

import Sidebar from './navigation/Sidebar';
import PageOrders from './Page/PageOrders';
import PageProducts from './Page/PageProducts';
import PageUsersDesktop from './Page/PageUsersDesktop';
import PageUsersMobile from './Page/PageUsersMobile';
import PageSuppliersDesktop from './Page/PageSuppliersDesktop';
import PagePurchaseOrderDesktop from './Page/PagePurchaseOrderDesktop';
import PagePurchaseOrderMobile from './Page/PagePurchaseOrderMobile';
import Login from './auth/Login';
import { supabase } from './utils/supabaseClient';
import { useState } from 'react';
import MobileMenu from './navigation/MobileMenu';
import { MobileMenuItem } from './navigation/menuConfig';
import TicketList from './Page/PageTicketDesktop';
import PageSmsCampaignsDesktop from './Page/PageSmsCampaignsDesktop';
import PageSmsCampaignsMobile, { PageSmsCampaignsMobileItem } from './Page/PageSmsCampaignsMobile';
import { User, UserResponse } from '@supabase/supabase-js';
import { PagePurchaseOrderMobileItem } from './Page/PagePurchaseOrderMobile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useResponsive } from './hooks/useResponsive';
import PageDashboard from './Page/PageDashboard';
import { Database } from './general/supabase.types';
import ProtectedRoute from './auth/ProtectedRoute';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import './App.css'; // Import custom styles
import LoginLayout from './auth/LoginLayout';
import PageMovements from './Page/PageMovements';
import PageInventoryDesktop from './Page/PageInventoryDesktop';
import PageSettingsDesktop from './Page/PageSettingsDesktop';
import PageSettingsMobile from './Page/PageSettingsMobile';
import { MenuValue } from './navigation/menuConfig';

function Layout() {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const [mobileMenuValue, setMobileMenuValue] = useState<MenuValue>('dashboard');
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
    { label: 'Dashboard', icon: <DashboardRoundedIcon />, value: 'dashboard' },
    { label: 'Orders', icon: <ShoppingCartRoundedIcon />, value: 'orders' },
    { label: 'Users', icon: <GroupRoundedIcon />, value: 'users' },
    { label: 'Settings', icon: <SettingsRoundedIcon />, value: 'settings' },
  ];

  React.useEffect(() => {
    const pathToValueMap: Record<string, typeof mobileMenuValue> = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/orders': 'orders',
      '/products': 'dashboard', // Products grouped under dashboard for mobile
      '/users': 'users',
      '/suppliers': 'dashboard', // Suppliers grouped under dashboard for mobile
      '/purchase-orders': 'dashboard', // Purchase orders grouped under dashboard for mobile
      '/tickets': 'dashboard', // Tickets grouped under dashboard for mobile
      '/sms-campaigns': 'dashboard', // SMS campaigns grouped under dashboard for mobile
      '/movements': 'dashboard', // Movements grouped under dashboard for mobile
      '/inventory': 'dashboard', // Inventory grouped under dashboard for mobile
      '/settings': 'settings',
    };
    setMobileMenuValue(pathToValueMap[location.pathname] || 'dashboard');
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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {location.pathname !== '/login' && !isMobile && <Sidebar setView={(view) => console.log(view)} view="home" />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflowY: 'auto',
          bgcolor: 'background.default',
          p: location.pathname !== '/dashboard' && location.pathname !== '/login' && location.pathname !== '/tickets' && location.pathname !== '/movements' ? 3 : 0,
          width: isMobile ? '100%' : 'calc(100% - var(--Sidebar-width, 240px))',
          marginBottom: isMobile ? '56px' : 0, // Adjust for MobileMenu height
        }}
      >
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
                <PageOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <PageProducts />
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
                <PageSuppliersDesktop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PagePurchaseOrderDesktop />
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
                <PageMovements />
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
      <Router>
        <Routes>
          <Route path="/login/*" element={<LoginLayout />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </Router>
    </CssVarsProvider>
  );
}
