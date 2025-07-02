import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import PurchaseOrderForm from '../Dialog/PurchaseOrderForm';
import Chip from '@mui/joy/Chip';
import GeneralTable from '../general/GeneralTable';
import type { PagePurchaseOrderMobileItem } from './PagePurchaseOrderMobile';
import useMediaQuery from '@mui/material/useMediaQuery';
import PagePurchaseOrderMobile from './PagePurchaseOrderMobile';
import fonts from '../theme/fonts';
import Table from '@mui/joy/Table';
import DialogReceivePurchaseOrder from '../Dialog/DialogReceivePurchaseOrder';
import type { Database } from '../general/supabase.types';
import PageLayout from '../layouts/PageLayout';

export default function PurchaseOrderTable() {
  const [orders, setOrders] = useState<PagePurchaseOrderMobileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [poItems, setPoItems] = useState<any[]>([]);

  const isMobile = useMediaQuery('(max-width:600px)');

  const typographyStyles = { fontSize: fonts.sizes.small };
  const headerStyles = { ...typographyStyles, fontWeight: 600, borderBottom: '1.5px solid #e0e0e0', background: 'inherit' };

  // Fetches the list of purchase orders from the Supabase database.
  // Updates the state with the fetched orders or sets an error message.
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      // Fetch purchase orders and join supplier name
      const { data, error }: { data: any; error: any } = await supabase
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

  // Refreshes the list of purchase orders after a new order is created or an existing order is edited.
  const handleCreated = async () => {
    setLoading(true);
    setError(null);
    const { data: ordersData, error: ordersError } = await supabase
      .from('PurchaseOrders')
      .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
      .order('order_date', { ascending: false });

    if (!ordersError && ordersData) {
      // Fix type mismatch in setOrders
      const mappedOrders = ordersData.map(order => ({
        ...order,
        supplier_name: order.Suppliers?.[0]?.name || 'N/A',
        Suppliers: undefined, // Remove Suppliers array to match expected type
      }));
      setOrders(mappedOrders);
      if (selectedOrder) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('purchaseorderitems')
          .select(`
            id,
            product_id,
            Products(ProductName),
            quantity_ordered,
            quantity_received
          `)
          .eq('purchase_order_id', selectedOrder.id);

        if (!itemsError && itemsData) {
          const mappedItems = itemsData.map(item => ({
            ...item,
            ProductName: item.Products[0]?.ProductName, // Access the first element of the Products array
          }));
          setPoItems(mappedItems);
        }
      }
    } else if (ordersError) {
      setError(ordersError.message || 'Failed to fetch purchase orders');
    }
    setLoading(false);
  };

  // Filters the list of purchase orders based on the search query and status filter.
  // @returns {PagePurchaseOrderMobileItem[]} The filtered list of purchase orders.
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toString().toLowerCase().includes(search.toLowerCase()) ||
      order.Suppliers?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { id: 'order_number', label: 'Order Number', minWidth: 100 },
    { id: 'order_date', label: 'Order Date', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'total', label: 'Total', minWidth: 100, format: (value: number | null) => value != null ? `$${value.toFixed(2)}` : '$0.00' },
    { id: 'notes', label: 'Notes', minWidth: 200 },
    { id: 'supplier_name', label: 'Supplier', minWidth: 150 },
  ];

  const rows = orders.map((order) => ({
    ...order,
    supplier_name: order.Suppliers?.name || 'N/A',
  }));

  // Convert orders to mobile items
  const mobileOrders = orders.map((order) => ({
    id: order.id || order.order_number,
    order_number: order.order_number,
    order_date: order.order_date,
    status: order.status,
    total: order.total ?? 0,
    supplier_name: order.Suppliers?.name || order.supplier_name || 'N/A',
    Suppliers: order.Suppliers,
  }));
  if (isMobile) {
    return <PagePurchaseOrderMobile orders={mobileOrders} />;
  }
  return (
    <PageLayout>
      <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 0, boxShadow: 'none', pl: 0, pr: 0, pt: 3, pb: 0 }}>
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>Purchase Orders</Typography>
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
          order={undefined}
        />
        <PurchaseOrderForm
          open={editDialogOpen}
          onClose={() => { setEditDialogOpen(false); setSelectedOrder(null); }}
          onCreated={handleCreated}
          mode="edit"
          order={selectedOrder}
        />
        <DialogReceivePurchaseOrder
          open={receiveDialogOpen && !!selectedOrder?.id && poItems.every(item => !!item.id && !!item.product_id)}
          onClose={() => setReceiveDialogOpen(false)}
          poId={selectedOrder?.id}
          orderNumber={selectedOrder?.order_number}
          items={poItems.filter(item => !!item.id && !!item.product_id)}
          onConfirm={async (receivedItems) => {
            for (const item of receivedItems) {
              await supabase
                .from('purchaseorderitems')
                .update({ quantity_received: item.quantity_received })
                .eq('id', item.id);
            }
            if (selectedOrder?.id) {
              await supabase
                .from('PurchaseOrders')
                .update({ status: 'Received' })
                .eq('id', selectedOrder.id);
            }
            setReceiveDialogOpen(false);
            await handleCreated();
          }}
        />
        <Card>
          {loading && <LinearProgress />}
          {error && <Typography color="danger">Error: {error}</Typography>}
          <Table aria-label="Purchase Orders" sx={{ minWidth: 800 }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.id} style={headerStyles}>{col.label}</th>
                ))}
                <th style={{ width: 120, ...headerStyles }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>No purchase orders found.</td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <tr key={row.id || row.order_number} style={{ cursor: 'pointer', height: 48 }}>
                  {columns.map(col => (
                    <td key={col.id} style={typographyStyles}>
                      {col.format ? col.format((row as any)[col.id]) : (row as any)[col.id]}
                    </td>
                  ))}
                  <td>
                    {row.status === 'Pending' ? (
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={async () => {
                          if (row.id) {
                            const { error } = await supabase
                              .from('PurchaseOrders')
                              .update({ status: 'Ordered' })
                              .eq('id', row.id);
                            if (error) {
                              alert('Failed to update order: ' + error.message);
                            } else {
                              await handleCreated();
                            }
                          }
                        }}
                      >
                        Order
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => {
                          setSelectedOrder(row);
                          setReceiveDialogOpen(true);
                        }}
                        disabled={row.status !== 'Approved' && row.status !== 'Ordered'}
                      >
                        Receive
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Box>
    </PageLayout>
  );
}
