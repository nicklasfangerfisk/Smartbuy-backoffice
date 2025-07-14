import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import { CssVarsProvider } from '@mui/joy/styles';

import Sidebar from './navigation/Sidebar';
import PageOrders from './Page/PageOrders';
import PageProducts from './Page/PageProducts';
import PageUsers from './Page/PageUsers';
import PageCustomers from './Page/PageCustomers';
import PageEmployees from './Page/PageEmployees';
import PageSuppliers from './Page/PageSuppliers';
import PageStorefronts from './Page/PageStorefronts';
import PagePurchaseOrders from './Page/PagePurchaseOrders';
import Login from './auth/Login';
import { supabase } from './utils/supabaseClient';
import { useState } from 'react';
import MobileMenu from './navigation/MobileMenu';
import { MobileMenuItem } from './navigation/menuConfig';
import PageTickets from './Page/PageTickets';
import PageSmsCampaigns from './Page/PageSmsCampaigns';
import { User, UserResponse } from '@supabase/supabase-js';

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
import PersonIcon from '@mui/icons-material/Person';
import './App.css'; // Import custom styles
import LoginLayout from './auth/LoginLayout';
import PageMovements from './Page/PageMovements';
import PageSettings from './Page/PageSettings';
import { MenuValue } from './navigation/menuConfig';

function Layout() {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const [mobileMenuValue, setMobileMenuValue] = useState<MenuValue>('dashboard');

  const mobileMenuItems: MobileMenuItem[] = [
    { label: 'Dashboard', icon: <DashboardRoundedIcon />, value: 'dashboard' },
    { label: 'Orders', icon: <ShoppingCartRoundedIcon />, value: 'orders' },
    { label: 'Customers', icon: <GroupRoundedIcon />, value: 'customers' },
    { label: 'My Profile', icon: <PersonIcon />, value: 'profile' },
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
      '/settings': 'profile', // Settings page maps to profile in mobile
    };
    setMobileMenuValue(pathToValueMap[location.pathname] || 'dashboard');
  }, [location.pathname]);

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
          height: '100%', // Use 100% instead of 100vh to take available space
          bgcolor: 'background.default',
          p: 0, // Remove app-level padding, let PageLayout handle all padding consistently
          width: isMobile ? '100%' : 'calc(100% - var(--Sidebar-width, 240px))',
          marginBottom: isMobile ? '56px' : 0, // Adjust for MobileMenu height
          overflow: 'auto', // Allow main content to scroll
        }}
      >
        {isMobile && location.pathname !== '/login' && (
          <MobileMenu
            items={mobileMenuItems}
            value={mobileMenuValue}
            onChange={(value: typeof mobileMenuValue) => {
              setMobileMenuValue(value);
              // Create route mapping from menu value to actual route
              const routeMap: Record<string, string> = {
                'home': '/',
                'dashboard': '/dashboard',
                'orders': '/orders',
                'products': '/products',
                'users': '/users',
                'customers': '/customers',
                'employees': '/employees',
                'suppliers': '/suppliers',
                'purchaseorders': '/purchase-orders',
                'tickets': '/tickets',
                'smscampaigns': '/sms-campaigns',
                'movements': '/movements',
                'profile': '/settings',
                'settings': '/settings'
              };
              
              const targetRoute = routeMap[value] || `/${value}`;
              navigate(targetRoute);
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
                <PageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <PageCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <PageEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <PageSuppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/storefronts"
            element={
              <ProtectedRoute>
                <PageStorefronts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PagePurchaseOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <PageTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-campaigns"
            element={
              <ProtectedRoute>
                <PageSmsCampaigns />
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
            path="/settings"
            element={
              <ProtectedRoute>
                <PageSettings />
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
