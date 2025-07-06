/**
 * PagePurchaseOrders - Purchase order management and receiving
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * Dialogs: PurchaseOrderForm, DialogReceivePurchaseOrder
 * Data: Supabase PurchaseOrders and PurchaseOrderItems tables
 */

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
import IconButton from '@mui/joy/IconButton';
import Chip from '@mui/joy/Chip';
import Table from '@mui/joy/Table';
import Stack from '@mui/joy/Stack';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PurchaseOrderForm from '../Dialog/PurchaseOrderForm';
import DialogReceivePurchaseOrder from '../Dialog/DialogReceivePurchaseOrder';
import PageLayout from '../layouts/PageLayout';
import fonts from '../theme/fonts';
import type { Database } from '../general/supabase.types';

// Types
export interface PurchaseOrderItem {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  total: number;
  notes?: string;
  supplier_name: string;
  Suppliers?: {
    name: string;
  };
}

// Status order for sorting
const statusOrder = { Pending: 0, Ordered: 1, Approved: 2, Received: 3, Cancelled: 4 };

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };
const headerStyles = { ...typographyStyles, fontWeight: 600, borderBottom: '1.5px solid #e0e0e0', background: 'inherit' };

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Ordered': return 'primary';
    case 'Approved': return 'primary';
    case 'Received': return 'success';
    case 'Cancelled': return 'danger';
    default: return 'neutral';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending': return <PendingIcon />;
    case 'Ordered': return <ShoppingCartIcon />;
    case 'Approved': return <ShoppingCartIcon />;
    case 'Received': return <CheckCircleIcon />;
    case 'Cancelled': return <CancelIcon />;
    default: return <PendingIcon />;
  }
};

const PagePurchaseOrders = () => {
  const { isMobile } = useResponsive();
  
  // Data states
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderItem | null>(null);
  const [poItems, setPoItems] = useState<any[]>([]);

  // Fetch purchase orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('PurchaseOrders')
        .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
        .order('order_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedOrders = data.map(order => ({
          ...order,
          supplier_name: order.Suppliers?.[0]?.name || 'N/A',
          Suppliers: undefined, // Remove to match expected type
        }));
        setOrders(mappedOrders);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch PO items for receiving
  const fetchPoItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchaseorderitems')
        .select('id, product_id, Products(ProductName), quantity_ordered, quantity_received')
        .eq('purchase_order_id', orderId);

      if (error) throw error;

      if (data) {
        const mappedItems = data.map(item => ({
          ...item,
          ProductName: item.Products?.[0]?.ProductName || 'Unknown Product',
        }));
        setPoItems(mappedItems);
      }
    } catch (err) {
      console.error('Error fetching PO items:', err);
    }
  };

  // Handle order creation/update
  const handleOrderChange = async () => {
    await fetchOrders();
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('PurchaseOrders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };

  // Handle receive order
  const handleReceiveOrder = async (order: PurchaseOrderItem) => {
    setSelectedOrder(order);
    await fetchPoItems(order.id);
    setReceiveDialogOpen(true);
  };

  // Handle receive confirmation
  const handleReceiveConfirm = async (receivedItems: any[]) => {
    try {
      // Update item quantities
      for (const item of receivedItems) {
        await supabase
          .from('purchaseorderitems')
          .update({ quantity_received: item.quantity_received })
          .eq('id', item.id);
      }

      // Update order status
      if (selectedOrder?.id) {
        await supabase
          .from('PurchaseOrders')
          .update({ status: 'Received' })
          .eq('id', selectedOrder.id);
      }

      setReceiveDialogOpen(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to receive order');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toString().toLowerCase().includes(search.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 99;
    if (statusA !== statusB) return statusA - statusB;
    return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
  });

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
          Purchase Orders
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchIcon />}
            sx={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={(_, value) => setStatusFilter(value ?? '')}
            sx={{ minWidth: 120 }}
          >
            <Option value="">All</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Ordered">Ordered</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Received">Received</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Box>

        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ width: '100%', mb: 2 }}
        >
          Add Purchase Order
        </Button>
      </ResponsiveContainer>

      {/* Loading and Error States */}
      {loading && <LinearProgress />}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="danger">Error: {error}</Typography>
        </Box>
      )}

      {/* Orders List */}
      <Box>
        {sortedOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No purchase orders found
            </Typography>
          </Box>
        ) : (
          sortedOrders.map((order) => (
            <Box 
              key={order.id} 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'background.level1'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Status Icon */}
                <Box 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: `${getStatusColor(order.status)}.100`,
                    color: `${getStatusColor(order.status)}.600`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}
                >
                  {getStatusIcon(order.status)}
                </Box>

                {/* Main Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography 
                      level="title-sm" 
                      sx={{ 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '60%'
                      }}
                    >
                      Order #{order.order_number}
                    </Typography>
                    
                    {/* Status Chip */}
                    <Chip 
                      size="sm"
                      color={getStatusColor(order.status)}
                      variant="soft"
                      sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                    >
                      {order.status}
                    </Chip>
                  </Box>
                  
                  <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                    {order.supplier_name} • {new Date(order.order_date).toLocaleDateString()}
                  </Typography>
                  
                  <Typography level="body-sm" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Total: ${order.total?.toFixed(2) || '0.00'}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {order.status === 'Pending' ? (
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(order.id, 'Ordered')}
                      >
                        Order
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => handleReceiveOrder(order)}
                        disabled={order.status !== 'Approved' && order.status !== 'Ordered'}
                      >
                        Receive
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer variant="table-page">
      <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
        Purchase Orders
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search purchase orders..."
          sx={{ flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
        />
        <Select
          placeholder="Filter status"
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value ?? '')}
          sx={{ minWidth: 160 }}
        >
          <Option value="">All Statuses</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Ordered">Ordered</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Received">Received</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
        <Button
          onClick={() => setAddDialogOpen(true)}
          variant="solid"
          startDecorator={<AddIcon />}
        >
          Add Purchase Order
        </Button>
      </Box>

      <Card sx={{ overflow: 'visible' }}>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        
        <Table aria-label="Purchase Orders" sx={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={headerStyles}>Order Number</th>
              <th style={headerStyles}>Order Date</th>
              <th style={headerStyles}>Status</th>
              <th style={headerStyles}>Total</th>
              <th style={headerStyles}>Supplier</th>
              <th style={headerStyles}>Notes</th>
              <th style={{ width: 120, ...headerStyles }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                  No purchase orders found.
                </td>
              </tr>
            )}
            {sortedOrders.map((order) => (
              <tr key={order.id} style={{ cursor: 'pointer', height: 48 }}>
                <td style={typographyStyles}>{order.order_number}</td>
                <td style={typographyStyles}>{new Date(order.order_date).toLocaleDateString()}</td>
                <td style={typographyStyles}>
                  <Chip
                    size="sm"
                    color={getStatusColor(order.status)}
                    variant="soft"
                  >
                    {order.status}
                  </Chip>
                </td>
                <td style={typographyStyles}>${order.total?.toFixed(2) || '0.00'}</td>
                <td style={typographyStyles}>{order.supplier_name}</td>
                <td style={typographyStyles}>{order.notes || '-'}</td>
                <td>
                  {order.status === 'Pending' ? (
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(order.id, 'Ordered')}
                    >
                      Order
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => handleReceiveOrder(order)}
                      disabled={order.status !== 'Approved' && order.status !== 'Ordered'}
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
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
      
      {/* Add Purchase Order Dialog */}
      <PurchaseOrderForm
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={handleOrderChange}
        mode="add"
        order={undefined}
      />

      {/* Receive Purchase Order Dialog */}
      <DialogReceivePurchaseOrder
        open={receiveDialogOpen && !!selectedOrder?.id}
        onClose={() => {
          setReceiveDialogOpen(false);
          setSelectedOrder(null);
        }}
        poId={selectedOrder?.id || ''}
        orderNumber={selectedOrder?.order_number || ''}
        items={poItems.filter(item => !!item.id && !!item.product_id)}
        onConfirm={handleReceiveConfirm}
      />
    </PageLayout>
  );
};

export default PagePurchaseOrders;
