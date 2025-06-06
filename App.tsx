import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';

import Sidebar from './components/Sidebar';
import OrderTable from './components/OrderTable';
import OrderList from './components/OrderList';
import Header from './components/Header';
import ProductTable from './components/ProductTable';
import UsersTable from './components/UsersTable';
import Suppliers from './components/Suppliers';
import PurchaseOrderTable from './components/PurchaseOrderTable';
import { useState } from 'react';

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

function DashboardHome() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        <DashboardRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Total Sales</Typography>
            <Typography level="h2" color="success">$12,340</Typography>
            <Typography level="body-sm" color="neutral">+5% from last month</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Orders</Typography>
            <Typography level="h2" color="primary">1,234</Typography>
            <Typography level="body-sm" color="neutral">+2% from last week</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Customers</Typography>
            <Typography level="h2" color="warning">567</Typography>
            <Typography level="body-sm" color="neutral">+8 new today</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function JoyOrderDashboardTemplate() {
  const [view, setView] = React.useState<'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders'>('home');
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
        <Header />
        <Sidebar setView={setView} view={view} />
        <Box
          component="main"
          className="MainContent"
          sx={{
            px: { xs: 2, md: 6 },
            pt: {
              xs: 'calc(12px + var(--Header-height))',
              sm: 'calc(12px + var(--Header-height))',
              md: 3,
            },
            pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
          }}
        >
          {view === 'home' && <DashboardHome />}
          {view === 'orders' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Breadcrumbs
                  size="sm"
                  aria-label="breadcrumbs"
                  separator={<ChevronRightRoundedIcon fontSize="small" />}
                  sx={{ pl: 0 }}
                >
                  <Link
                    underline="none"
                    color="neutral"
                    href="#"
                    aria-label="Home"
                    onClick={() => setView('home')}
                  >
                    <HomeRoundedIcon />
                  </Link>
                  <Link
                    underline="hover"
                    color="neutral"
                    href="#"
                    sx={{ fontSize: 12, fontWeight: 500 }}
                    onClick={() => setView('orders')}
                  >
                    Orders
                  </Link>
                </Breadcrumbs>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  mb: 1,
                  gap: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'start', sm: 'center' },
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                <Typography level="h2" component="h1">
                  Orders
                </Typography>
                <Button
                  color="primary"
                  startDecorator={<DownloadRoundedIcon />}
                  size="sm"
                >
                  Download PDF
                </Button>
              </Box>
              <OrderTable />
              <OrderList />
            </>
          )}
          {view === 'products' && <ProductTable />}
          {view === 'messages' && <Messages />}
          {view === 'users' && <UsersTable />}
          {view === 'suppliers' && <Suppliers />}
          {view === 'purchaseorders' && <PurchaseOrderTable />}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
