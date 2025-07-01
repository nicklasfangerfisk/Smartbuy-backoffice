import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import GeneralTableMobile from '../general/GeneralTableMobile';
import DialogReceivePurchaseOrder from '../Dialog/DialogReceivePurchaseOrder';
import PurchaseOrderForm from '../Dialog/PurchaseOrderForm';
import LinearProgress from '@mui/joy/LinearProgress';
import { supabase } from '../utils/supabaseClient';

/**
 * Represents a purchase order item in the mobile view.
 * @property {string} id - Unique identifier for the purchase order.
 * @property {string} order_number - The order number.
 * @property {string} order_date - The date of the order.
 * @property {string} status - The status of the order.
 * @property {number} total - The total amount of the order.
 * @property {string} supplier_name - The name of the supplier.
 * @property {Object} [Suppliers] - Additional supplier details.
 * @property {string} Suppliers.name - The name of the supplier.
 */
export interface PagePurchaseOrderMobileItem {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  total: number;
  supplier_name: string;
  Suppliers?: {
    name: string;
  };
}

const statusOrder = { Pending: 0, Ordered: 1, Received: 2, Cancelled: 3 };

/**
 * PagePurchaseOrderMobile component displays a list of purchase orders in a mobile-friendly layout.
 *
 * @param {{ orders: PagePurchaseOrderMobileItem[] }} props - Props for the component.
 * @returns {JSX.Element} The rendered PagePurchaseOrderMobile component.
 */
const PagePurchaseOrderMobile: React.FC<{ orders: PagePurchaseOrderMobileItem[] }> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = React.useState<PagePurchaseOrderMobileItem[]>(initialOrders);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);
  const [poItems, setPoItems] = React.useState<any[]>([]);

  // Fetch orders on mount
  React.useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('PurchaseOrders')
        .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
        .order('order_date', { ascending: false });
      if (!error && data) {
        setOrders(data.map(order => ({
          ...order,
          supplier_name: order.Suppliers?.[0]?.name || 'N/A',
          Suppliers: undefined,
        })));
      } else if (error) {
        setError(error.message || 'Failed to fetch purchase orders');
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toString().toLowerCase().includes(search.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 99;
    if (statusA !== statusB) return statusA - statusB;
    return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
  });

  // Fetch PO items when opening receive dialog
  React.useEffect(() => {
    if (receiveDialogOpen && selectedOrder) {
      (async () => {
        const { data, error } = await supabase
          .from('purchaseorderitems')
          .select('id, product_id, Products(ProductName), quantity_ordered, quantity_received')
          .eq('purchase_order_id', selectedOrder.id);
        if (!error && data) setPoItems(data);
      })();
    }
  }, [receiveDialogOpen, selectedOrder]);

  // Always render the full component tree, never return early
  return (
    <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', p: 2 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Purchase Orders</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Input
          placeholder="Search purchase orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          placeholder="Filter status"
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value ?? '')}
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Received">Received</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
        <Button onClick={() => setAddDialogOpen(true)} variant="solid">
          Add Purchase Order
        </Button>
      </Box>
      <PurchaseOrderForm
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={async () => {
          setAddDialogOpen(false);
          setLoading(true);
          const { data, error } = await supabase
            .from('PurchaseOrders')
            .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
            .order('order_date', { ascending: false });
          if (!error && data) {
            setOrders(data.map(order => ({
              ...order,
              supplier_name: order.Suppliers?.[0]?.name || 'N/A',
              Suppliers: undefined,
            })));
          }
          setLoading(false);
        }}
        mode="add"
        order={undefined}
      />
      <DialogReceivePurchaseOrder
        open={receiveDialogOpen}
        onClose={() => setReceiveDialogOpen(false)}
        poId={selectedOrder?.order_number || selectedOrder?.id}
        items={poItems}
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
          // Refresh orders
          setLoading(true);
          const { data, error } = await supabase
            .from('PurchaseOrders')
            .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
            .order('order_date', { ascending: false });
          if (!error && data) {
            setOrders(data.map(order => ({
              ...order,
              supplier_name: order.Suppliers?.[0]?.name || 'N/A',
              Suppliers: undefined,
            })));
          }
          setLoading(false);
        }}
      />
      {loading && <LinearProgress />}
      {error && <Typography color="danger">Error: {error}</Typography>}
      <GeneralTableMobile
        items={Array.isArray(sortedOrders) ? sortedOrders : []}
        ariaLabel="Purchase Orders Mobile View"
        renderItem={order =>
          order ? (
            <Box>
              <Typography fontWeight="bold">Order Number: {order.order_number}</Typography>
              <Typography>Order Date: {order.order_date}</Typography>
              <Typography>Status: {order.status}</Typography>
              <Typography>Total: ${order.total?.toFixed(2) ?? '0.00'}</Typography>
              <Typography>Supplier: {order.supplier_name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {order.status === 'Pending' ? (
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={async () => {
                      if (order.id) {
                        const { error } = await supabase
                          .from('PurchaseOrders')
                          .update({ status: 'Ordered' })
                          .eq('id', order.id);
                        if (!error) {
                          setLoading(true);
                          const { data, error } = await supabase
                            .from('PurchaseOrders')
                            .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
                            .order('order_date', { ascending: false });
                          if (!error && data) {
                            setOrders(data.map(order => ({
                              ...order,
                              supplier_name: order.Suppliers?.[0]?.name || 'N/A',
                              Suppliers: undefined,
                            })));
                          }
                          setLoading(false);
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
                    onClick={async () => {
                      setSelectedOrder(order);
                      setReceiveDialogOpen(true);
                    }}
                    disabled={order.status !== 'Approved' && order.status !== 'Ordered'}
                  >
                    Receive
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Typography color="neutral">No data</Typography>
          )
        }
      />
    </Box>
  );
};

export default PagePurchaseOrderMobile;
