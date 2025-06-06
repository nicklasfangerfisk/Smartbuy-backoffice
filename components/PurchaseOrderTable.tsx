import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';

export default function PurchaseOrderTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      // Fetch purchase orders and join supplier name
      const { data, error } = await supabase
        .from('PurchaseOrders')
        .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
        .order('order_date', { ascending: false });
      if (!error && data) {
        setOrders(data);
      } else if (error) {
        setError(error.message || 'Failed to fetch purchase orders');
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Purchase Orders</Typography>
      <Card>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        <Table aria-label="Purchase Orders" sx={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>{order.Suppliers?.name || '—'}</td>
                <td>{order.order_date}</td>
                <td>{order.status}</td>
                <td>{order.total != null ? `$${order.total.toFixed(2)}` : '—'}</td>
                <td>{order.notes || ''}</td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No purchase orders found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Box>
  );
}
