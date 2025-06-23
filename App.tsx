import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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

export default function App() {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Sidebar setView={(view) => console.log(view)} view="home" />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              p: 3,
              width: { sm: '100%', md: 'calc(100% - 240px)' },
            }}
          >
            <Header />
            <Routes>
              <Route path="/" element={<PageDashboard />} />
              <Route path="/orders" element={<PageOrderDesktop rows={[]} orderDetailsOpen={false} selectedOrder={null} fetchOrderItems={(orderUuid) => Promise.resolve([])} onCloseOrderDetails={() => {}} />} />
              <Route path="/products" element={<PageProductDesktop />} />
              <Route
                path="/users"
                element={
                  isMobile ? <PageUsersMobile users={[]} /> : <PageUsersDesktop users={[]} />
                }
              />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/purchase-orders" element={<PagePurchaseOrderDesktop orders={[]} />} />
              <Route path="/login" element={<Login onLogin={() => {}} />} />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/sms-campaigns" element={<PageSmsCampaignsDesktop campaigns={[]} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </CssVarsProvider>
  );
}
