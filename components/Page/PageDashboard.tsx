import * as React from 'react';
import { Box, Typography, Grid, Card } from '@mui/joy';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { supabase } from '../../utils/supabaseClient';

const PageDashboard: React.FC = () => {
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
};

export default PageDashboard;
