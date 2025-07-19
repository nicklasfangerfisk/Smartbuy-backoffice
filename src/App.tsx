import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import { CssVarsProvider } from '@mui/joy/styles';

import Menu from './navigation/Menu';
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
import PageTickets from './Page/PageTickets';
import PageSmsCampaigns from './Page/PageSmsCampaigns';
import { User, UserResponse } from '@supabase/supabase-js';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useResponsive } from './hooks/useResponsive';
import PageDashboard from './Page/PageDashboard';
import { Database } from './general/supabase.types';
import ProtectedRoute from './auth/ProtectedRoute';
import './App.css'; // Import custom styles
import LoginLayout from './auth/LoginLayout';
import PageMovements from './Page/PageMovements';
import PageModules from './Page/PageModules';
import PageSettings from './Page/PageSettings';
import PageFunctions from './Page/PageFunctions';
import { MenuValue } from './navigation/menuConfig';

function Layout() {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const [currentView, setCurrentView] = useState<MenuValue>('dashboard');

  // Update current view based on pathname
  React.useEffect(() => {
    const pathToValueMap: Record<string, MenuValue> = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/orders': 'orders',
      '/products': 'products',
      '/users': 'users',
      '/customers': 'customers',
      '/employees': 'employees',
      '/suppliers': 'suppliers',
      '/purchase-orders': 'purchaseorders',
      '/tickets': 'tickets',
      '/sms-campaigns': 'smscampaigns',
      '/movements': 'movements',
      '/settings': 'settings',
      '/modules': 'modules',
      '/functions': 'functions',
      '/storefronts': 'storefronts',
    };
    setCurrentView(pathToValueMap[location.pathname] || 'dashboard');
  }, [location.pathname]);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      overflow: 'hidden',
      width: '100vw',
      boxSizing: 'border-box',
    }}>
      <Menu 
        onViewChange={setCurrentView}
        currentView={currentView}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
          p: 0,
          minWidth: 0, // Allow content to shrink properly
          overflow: 'auto',
          boxSizing: 'border-box',
        }}
      >
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
          <Route
            path="/modules"
            element={
              <ProtectedRoute>
                <PageModules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functions"
            element={
              <ProtectedRoute>
                <PageFunctions />
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
