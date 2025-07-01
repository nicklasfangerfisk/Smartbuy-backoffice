import * as React from 'react';
import { Box, Typography, Grid, Card } from '@mui/joy';
import { supabase } from '../utils/supabaseClient';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Dashboard page component that displays key metrics such as total sales,
 * order count, and customer count, along with their percentage changes
 * over the last 30 days.
 */

/**
 * Helper function to calculate the percentage change between two values.
 * @param curr The current value.
 * @param prev The previous value.
 * @returns The percentage change.
 */
function calculatePercentageChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

/**
 * Helper function to format a percentage change value.
 * @param val The percentage change value.
 * @returns A formatted string representing the percentage change.
 */
function formatPercentageChange(val: number | null): string {
  if (val == null) return '—';
  const sign = val > 0 ? '+' : val < 0 ? '−' : '';
  return `${sign}${Math.abs(Math.round(val))}%`;
}

/**
 * Fetches dashboard statistics from the Supabase database.
 * @returns An object containing total sales, order count, customer count,
 * and their percentage changes.
 */
async function fetchDashboardStatsHelper() {
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
    throw new Error('Failed to fetch order stats');
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

  return {
    totalSales: sumThis,
    orderCount: countThis,
    customerCount: customersThis.size,
    salesChange: calculatePercentageChange(sumThis, sumPrev),
    ordersChange: calculatePercentageChange(countThis, countPrev),
    customersChange: calculatePercentageChange(customersThis.size, customersPrev.size),
  };
}

const PageDashboard: React.FC = () => {
  const [totalSales, setTotalSales] = React.useState<number | null>(null);
  const [orderCount, setOrderCount] = React.useState<number | null>(null);
  const [customerCount, setCustomerCount] = React.useState<number | null>(null);
  const [salesChange, setSalesChange] = React.useState<number | null>(null);
  const [ordersChange, setOrdersChange] = React.useState<number | null>(null);
  const [customersChange, setCustomersChange] = React.useState<number | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  React.useEffect(() => {
    let isMounted = true;
    let first = true;
    async function fetchDashboardStats() {
      if (first) setInitialLoading(true);
      setError(null);
      try {
        const {
          totalSales,
          orderCount,
          customerCount,
          salesChange,
          ordersChange,
          customersChange,
        } = await fetchDashboardStatsHelper();
        if (isMounted) {
          setTotalSales(totalSales);
          setOrderCount(orderCount);
          setCustomerCount(customerCount);
          setSalesChange(salesChange);
          setOrdersChange(ordersChange);
          setCustomersChange(customersChange);
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (first) setInitialLoading(false);
        first = false;
      }
    }
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 10000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <Box sx={{
      p: { xs: 1, md: 4 },
      pt: { xs: 0, md: 4 }, // Remove top padding for mobile since header is gone
    }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <Typography level="h4">Total Sales</Typography>
            <Typography level="h2" color="success">
              {initialLoading ? 'Loading...' : error ? '—' : `$${totalSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {initialLoading ? '' : formatPercentageChange(salesChange)} from last 30 days
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
              {initialLoading ? '' : formatPercentageChange(ordersChange)} from last 30 days
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
              {initialLoading ? '' : formatPercentageChange(customersChange)} new last 30 days
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PageDashboard;
