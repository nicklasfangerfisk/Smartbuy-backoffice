/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import { supabase } from '../utils/supabaseClient';
import OrderTableCreate from './OrderTableCreate';
import OrderTableDetails from './OrderTableDetails';
import useMediaQuery from '@mui/material/useMediaQuery';
import OrderTableMobile, { OrderTableMobileItem } from './OrderTableMobile';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

type OrderStatus = 'Paid' | 'Refunded' | 'Cancelled';

type Customer = {
  initial: string;
  name: string;
  email: string;
};

type OrderRow = {
  uuid: string;
  date: string;
  status: OrderStatus;
  customer: Customer;
  order_number_display?: string;
  order_total?: number;
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
  // Add category for filtering (optional, fallback to 'purchase')
  category?: string;
};

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Move</MenuItem>
        <Divider />
        <MenuItem color="danger">Delete</MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default function OrderTable() {
  const [order, setOrder] = React.useState<Order>('desc');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  // Add state for order details modal
  const [orderDetailsOpen, setOrderDetailsOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);
  // Add state for order items loading and data
  const [orderItems, setOrderItems] = React.useState<{ id: string; name?: string; quantity?: number }[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = React.useState(false);
  const [orderItemsAll, setOrderItemsAll] = React.useState<any[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newOrder, setNewOrder] = React.useState<{
    date: string;
    status: OrderStatus;
    customer_name: string;
    customer_email: string;
  }>({
    date: '',
    status: 'Paid',
    customer_name: '',
    customer_email: '',
  });

  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [customerFilter, setCustomerFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');

  const isMobile = useMediaQuery('(max-width:600px)');

  // Move fetchOrders outside useEffect so it can be called after order creation
  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('Orders')
      .select('*');
    if (!error && data) {
      // Map Supabase data to OrderRow structure
      const mapped = data.map((order: any) => ({
        uuid: order.uuid,
        date: order.date || order.created_at || '',
        status: order.status || 'Paid',
        customer: order.customer
          ? order.customer
          : {
              initial: order.customer_initial || (order.customer_name ? order.customer_name[0] : '?'),
              name: order.customer_name || 'Unknown',
              email: order.customer_email || '',
            },
        order_number_display: order.order_number_display,
        order_total: typeof order.order_total === 'number' ? order.order_total : 0,
        created_by: order.created_by || '',
        created_by_name: order.created_by_name || '',
        created_by_email: order.created_by_email || '',
        category: order.category || 'purchase', // fallback
      }));
      setRows(mapped);
    } else if (error) {
      console.error(error.message || 'Failed to fetch orders');
    }
    setLoading(false);
  }

  React.useEffect(() => {
    fetchOrders();
  }, []);

  // Move fetchOrderItems outside of useEffect so it can be passed as a prop
  async function fetchOrderItems(orderUuid: string) {
    // Join OrderItems with Products to get ProductName
    const { data, error } = await supabase
      .from('OrderItems')
      .select('*, Products:product_uuid(ProductName)')
      .eq('order_uuid', orderUuid);
    if (!error && data) {
      return data.map((item: any) => ({
        ...item,
        product_name: item.Products?.ProductName || item.product_uuid,
      }));
    } else {
      return [];
    }
  }

  // Collect unique statuses, categories, and customers from rows
  const statusOptions = Array.from(new Set(rows.map(r => r.status)));
  // For category, you may want to extract from order data if available, else keep static
  const categoryOptions = ['all', 'refund', 'purchase', 'debit']; // TODO: make dynamic if possible
  const customerOptions = Array.from(new Set(rows.map(r => r.customer.name)));

  // Filter rows based on search and status
  const filteredRows = rows.filter(row => {
    const matchesSearch =
      row.order_number_display?.toString().toLowerCase().includes(search.toLowerCase()) ||
      row.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = !statusFilter || row.status === statusFilter;
    return matchesSearch && statusMatch;
  });

  const renderFilters = () => (
    <React.Fragment>
      <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(_e, val) => setStatusFilter(val || '')}
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="">All</Option>
          {statusOptions.map(status => (
            <Option key={status} value={status}>{status}</Option>
          ))}
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Category</FormLabel>
        <Select
          size="sm"
          placeholder="All"
          value={categoryFilter}
          onChange={(_e, val) => setCategoryFilter(val || 'all')}
        >
          {categoryOptions.map(category => (
            <Option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</Option>
          ))}
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select
          size="sm"
          placeholder="All"
          value={customerFilter}
          onChange={(_e, val) => setCustomerFilter(val || 'all')}
        >
          <Option value="all">All</Option>
          {customerOptions.map(customer => (
            <Option key={customer} value={customer}>{customer}</Option>
          ))}
        </Select>
      </FormControl>
    </React.Fragment>
  );

  // Update handleCreateOrder to accept orderDiscount
  async function handleCreateOrder(orderItems: { product_uuid: string | null; quantity: number; unitprice: number; discount: number }[], orderDiscount: number) {
    setCreating(true);
    // 1. Create the order with order-level discount
    const { data: orderData, error: orderError } = await supabase.from('Orders').insert([
      {
        date: newOrder.date,
        status: newOrder.status,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        discount: orderDiscount,
      },
    ]).select();
    if (orderError || !orderData || !orderData[0]) {
      setCreating(false);
      alert('Failed to create order: ' + (orderError?.message || 'Unknown error'));
      return;
    }
    const orderUuid = orderData[0].uuid;
    // 2. Insert order items
    if (orderItems.length > 0) {
      const itemsToInsert = orderItems
        .filter(item => item.product_uuid && item.product_uuid.length > 0)
        .map(item => ({
          order_uuid: orderUuid,
          product_uuid: item.product_uuid,
          quantity: item.quantity,
          unitprice: item.unitprice,
          discount: item.discount,
        }));
      if (itemsToInsert.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase.from('OrderItems').insert(itemsToInsert);
        if (itemsError) {
          setCreating(false);
          alert('Order created, but failed to add items: ' + itemsError.message);
          return;
        }
      }
    }
    setCreating(false);
    setCreateOpen(false);
    setNewOrder({ date: '', status: 'Paid', customer_name: '', customer_email: '' });
    setTimeout(() => {
      fetchOrders();
    }, 1000);
  }

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setNewOrder({ date: '', status: 'Paid', customer_name: '', customer_email: '' });
  };

  const handleOrderDetailsOpen = (order: OrderRow) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleOrderDetailsClose = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Convert OrderRow[] to OrderListItem[] for mobile
  const orderListItems: OrderTableMobileItem[] = rows.map((row) => ({
    id: row.order_number_display || row.uuid,
    date: row.date,
    status: row.status,
    customer: row.customer,
  }));

  if (isMobile) {
    const handleMobileRowClick = (orderId: string) => {
      const found = rows.find(row => (row.order_number_display || row.uuid) === orderId);
      if (found) {
        setSelectedOrder(found);
        setOrderDetailsOpen(true);
      }
    };
    return <>
      <OrderTableMobile orders={orderListItems} onRowClick={handleMobileRowClick} />
      <OrderTableDetails
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        selectedOrder={selectedOrder}
        fetchOrderItems={fetchOrderItems}
      />
    </>;
  }
  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 2, textAlign: 'left' }}>Orders</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search orders..."
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
          {statusOptions.map(status => (
            <Option key={status} value={status}>{status}</Option>
          ))}
        </Select>
        <Button
          onClick={handleOpenCreate}
          variant="solid"
        >
          Create Order
        </Button>
      </Box>
      <Card>
        {loading && <LinearProgress />}
        <Table aria-label="Orders" sx={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Total</th>
              <th style={{ width: 120 }} />
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No orders found.</td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr
                key={row.uuid}
                onClick={() => handleOrderDetailsOpen(row)}
                style={{ cursor: 'pointer' }}
              >
                <td>{row.order_number_display || '-'}</td>
                <td>{new Date(row.date).toLocaleString()}</td>
                <td>
                  <Chip
                    variant="soft"
                    color={
                      row.status === 'Paid'
                        ? 'success'
                        : row.status === 'Refunded'
                        ? 'danger'
                        : 'neutral'
                    }
                    size="sm"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.status}
                  </Chip>
                </td>
                <td>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar size="sm">{row.customer.initial}</Avatar>
                    <div>
                      <Typography level="body-xs" fontWeight="md">
                        {row.customer.name}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        {row.customer.email}
                      </Typography>
                    </div>
                  </Box>
                </td>
                <td>
                  {typeof row.order_total === 'number' ? `$${row.order_total.toFixed(2)}` : '-'}
                </td>
                <td>
                  <RowMenu />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <OrderTableDetails
        open={orderDetailsOpen}
        onClose={handleOrderDetailsClose}
        selectedOrder={selectedOrder}
        fetchOrderItems={fetchOrderItems}
      />
      <Modal
        open={createOpen}
        onClose={handleCloseCreate}
        aria-labelledby="create-order-modal"
      >
        <ModalDialog
          aria-labelledby="create-order-modal"
          sx={{ maxWidth: 600, width: '100%' }}
        >
          <ModalClose />
          <Typography id="create-order-modal" level="title-md" fontWeight="lg" sx={{ mb: 2 }}>
            Create Order
          </Typography>
          <OrderTableCreate
            open={createOpen}
            creating={creating}
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            onClose={handleCloseCreate}
            onCreate={handleCreateOrder}
          />
        </ModalDialog>
      </Modal>
    </Box>
  );
}
