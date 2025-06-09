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
import Login from './components/Login';
import { supabase } from './utils/supabaseClient';
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
  const [totalSales, setTotalSales] = React.useState<number | null>(null);
  const [orderCount, setOrderCount] = React.useState<number | null>(null);
  const [customerCount, setCustomerCount] = React.useState<number | null>(null);
  const [salesChange, setSalesChange] = React.useState<number | null>(null);
  const [ordersChange, setOrdersChange] = React.useState<number | null>(null);
  const [customersChange, setCustomersChange] = React.useState<number | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    let first = true;
    async function fetchDashboardStats() {
      if (first) setInitialLoading(true);
      setError(null);
      // Date ranges: last 30 days and previous 30 days
      const now = new Date();
      const end = now.toISOString().slice(0, 10);
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const prevEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10);

      const ordersRes = await supabase
        .from('Orders')
        .select('order_total, customer_email, date', { count: 'exact' })
        .not('order_total', 'is', null);
      if (ordersRes.error || !ordersRes.data) {
        if (isMounted) setError('Failed to fetch order stats');
        if (first) setInitialLoading(false);
        return;
      }
      const orders = ordersRes.data;
      const ordersThis = orders.filter((o: any) => o.date && o.date >= start && o.date <= end);
      const ordersPrev = orders.filter((o: any) => o.date && o.date >= prevStart && o.date <= prevEnd);
      const sumThis = ordersThis.reduce((acc: number, row: any) => acc + (typeof row.order_total === 'number' ? row.order_total : 0), 0);
      const sumPrev = ordersPrev.reduce((acc: number, row: any) => acc + (typeof row.order_total === 'number' ? row.order_total : 0), 0);
      const countThis = ordersThis.length;
      const countPrev = ordersPrev.length;
      const customersThis = new Set(ordersThis.map((o: any) => o.customer_email).filter(Boolean));
      const customersPrev = new Set(ordersPrev.map((o: any) => o.customer_email).filter(Boolean));
      const pct = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
      if (isMounted) {
        setTotalSales(sumThis);
        setOrderCount(countThis);
        setCustomerCount(customersThis.size);
        setSalesChange(pct(sumThis, sumPrev));
        setOrdersChange(pct(countThis, countPrev));
        setCustomersChange(pct(customersThis.size, customersPrev.size));
      }
      if (first) setInitialLoading(false);
      first = false;
    }
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 10000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  function formatChange(val: number | null) {
    if (val == null) return '—';
    const sign = val > 0 ? '+' : val < 0 ? '−' : '';
    return `${sign}${Math.abs(Math.round(val))}%`;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        <DashboardRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Total Sales</Typography>
            <Typography level="h2" color="success">
              {initialLoading ? 'Loading...' : error ? '—' : `$${totalSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {initialLoading ? '' : formatChange(salesChange)} from last 30 days
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Orders</Typography>
            <Typography level="h2" color="primary">
              {initialLoading ? 'Loading...' : error ? '—' : orderCount?.toLocaleString()}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {initialLoading ? '' : formatChange(ordersChange)} from last 30 days
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Customers</Typography>
            <Typography level="h2" color="warning">
              {initialLoading ? 'Loading...' : error ? '—' : customerCount?.toLocaleString()}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {initialLoading ? '' : formatChange(customersChange)} new last 30 days
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function JoyOrderDashboardTemplate() {
  const [view, setView] = React.useState<'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders'>('home');
  const [authChecked, setAuthChecked] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  if (!authChecked) return null;
  if (!user) return <Login onLogin={async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }} />;

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
