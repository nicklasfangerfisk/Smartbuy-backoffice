import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import PurchaseOrderForm from './PurchaseOrderForm';
import Chip from '@mui/joy/Chip';

export default function PurchaseOrderTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

  const handleCreated = async () => {
    // Refresh orders after creation
    setLoading(true);
    setError(null);
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
  };

  // Filter orders by order number, supplier name, and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toString().toLowerCase().includes(search.toLowerCase()) ||
      order.Suppliers?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Purchase Orders</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search purchase orders..."
          sx={{ flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          placeholder="Filter status"
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value ?? '')}
          sx={{ minWidth: 160 }}
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Received">Received</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
        <Button
          onClick={() => setAddDialogOpen(true)}
          variant="solid"
        >
          Add Purchase Order
        </Button>
      </Box>
      <PurchaseOrderForm
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={handleCreated}
        mode="add"
        order={null}
      />
      <PurchaseOrderForm
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setSelectedOrder(null); }}
        onCreated={handleCreated}
        mode="edit"
        order={selectedOrder}
      />
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
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ cursor: 'pointer' }}
                onClick={() => { setSelectedOrder(order); setEditDialogOpen(true); }}>
                <td>{order.order_number}</td>
                <td>{order.Suppliers?.name || '—'}</td>
                <td>{order.order_date}</td>
                <td>
                  <Chip
                    variant="soft"
                    color={
                      order.status === 'Approved'
                        ? 'success'
                        : order.status === 'Received'
                        ? 'primary'
                        : order.status === 'Cancelled'
                        ? 'danger'
                        : 'neutral'
                    }
                    sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 'sm', px: 1.5, py: 0.5 }}
                  >
                    {order.status}
                  </Chip>
                </td>
                <td>{order.total != null ? `$${order.total.toFixed(2)}` : '—'}</td>
                <td>{order.notes || ''}</td>
              </tr>
            ))}
            {filteredOrders.length === 0 && !loading && (
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
