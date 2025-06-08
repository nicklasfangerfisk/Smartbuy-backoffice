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
  items: { id: string; name?: string }[];
  created_by?: string;
  created_by_name?: string;
  created_by_email?: string;
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
        items: order.items || [],
        created_by: order.created_by || '',
        customer: order.customer
          ? order.customer
          : {
              initial: order.customer_initial || (order.customer_name ? order.customer_name[0] : '?'),
              name: order.customer_name || 'Unknown',
              email: order.customer_email || '',
            },
        created_by_name: order.created_by_name || '',
        created_by_email: order.created_by_email || '',
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

  // Fetch order items from Supabase OrderItems table when modal opens
  React.useEffect(() => {
    async function fetchOrderItems(orderUuid: string) {
      setOrderItemsLoading(true);
      const { data, error } = await supabase
        .from('OrderItems')
        .select('uuid as id, quantity, product_uuid, products(ProductName)')
        .eq('orderitems_order_uuid', orderUuid); // Use correct FK column name
      if (!error && data) {
        setOrderItems(
          data.map((item: any) => ({
            id: item.id,
            name: item.products?.ProductName || item.product_uuid, // Show product name if available, else uuid
            quantity: item.quantity,
          }))
        );
      } else {
        setOrderItems([]);
      }
      setOrderItemsLoading(false);
    }
    if (orderDetailsOpen && selectedOrder) {
      fetchOrderItems(selectedOrder.uuid);
    } else {
      setOrderItems([]);
    }
  }, [orderDetailsOpen, selectedOrder]);

  const renderFilters = () => (
    <React.Fragment>
      <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="paid">Paid</Option>
          <Option value="pending">Pending</Option>
          <Option value="refunded">Refunded</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Category</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="refund">Refund</Option>
          <Option value="purchase">Purchase</Option>
          <Option value="debit">Debit</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="olivia">Olivia Rhye</Option>
          <Option value="steve">Steve Hampton</Option>
          <Option value="ciaran">Ciaran Murray</Option>
          <Option value="marina">Marina Macdonald</Option>
          <Option value="charles">Charles Fulton</Option>
          <Option value="jay">Jay Hoper</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );

  // Update handleCreateOrder to accept product_id: string | null, quantity, and price
  async function handleCreateOrder(orderItems: { product_uuid: string | null; quantity: number; price: number }[]) {
    console.log('orderItems received:', orderItems); // Debug log
    setCreating(true);
    // 1. Create the order
    const { data: orderData, error: orderError } = await supabase.from('Orders').insert([
      {
        date: newOrder.date,
        status: newOrder.status,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
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
          order_uuid: orderUuid, // Use correct FK column name for OrderItems (UUID FK)
          product_uuid: item.product_uuid, // UUID FK for product
          quantity: item.quantity,
          price: item.price,
        }));
      console.log('OrderItems to insert:', itemsToInsert); // Debug log
      if (itemsToInsert.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase.from('OrderItems').insert(itemsToInsert);
        console.log('OrderItems insert result:', { itemsData, itemsError }); // Add this line
        if (itemsError) {
          console.error('OrderItems insert error:', itemsError); // Debug log
          setCreating(false);
          alert('Order created, but failed to add items: ' + itemsError.message);
          return;
        }
      } else {
        console.warn('No valid order items to insert.');
      }
    }
    setCreating(false);
    setCreateOpen(false);
    setNewOrder({ date: '', status: 'Paid', customer_name: '', customer_email: '' });
    // Refetch orders after a delay to allow for DB consistency
    setTimeout(() => {
      fetchOrders(); // Refresh orders in-place instead of reloading the page
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

  return (
    <Sheet
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        borderRadius: 'sm',
        boxShadow: 'md',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography level="h4" fontWeight="lg">
          Orders
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          Manage customer orders, view order details, and update order status.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Button
            variant="solid"
            onClick={handleOpenCreate}
            startDecorator={<CheckRoundedIcon />}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => {}}
            startDecorator={<FilterAltIcon />}
            endDecorator={<ArrowDropDownIcon />}
            sx={{ flex: 1 }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => {}}
            startDecorator={<SearchIcon />}
            sx={{ flex: 1 }}
          >
            Search
          </Button>
        </Box>
        {renderFilters()}
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Table
          aria-labelledby="tableTitle"
          sx={{ minWidth: 800 }}
          stickyHeader
          color="neutral"
        >
          <thead>
            <tr>
              <th>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={(e) => {
                    setSelected(e.target.checked ? rows.map((row) => row.uuid) : []);
                  }}
                  sx={{ m: 0 }}
                />
              </th>
              <th>Date</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Items</th>
              <th style={{ width: 120 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                  {loading ? (
                    <Typography level="body-sm">Loading orders...</Typography>
                  ) : (
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      No orders found.
                    </Typography>
                  )}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.uuid}
                onClick={() => handleOrderDetailsOpen(row)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <Checkbox
                    checked={selected.indexOf(row.uuid) !== -1}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selected, row.uuid]
                        : selected.filter((id) => id !== row.uuid);
                      setSelected(newSelected);
                    }}
                    sx={{ m: 0 }}
                  />
                </td>
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
                  {row.items && row.items.length > 0
                    ? row.items.map((item: any) => item.name || item.id).join(', ')
                    : '-'}
                </td>
                <td>
                  <RowMenu />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            {`Showing ${rows.length} ${rows.length === 1 ? 'order' : 'orders'}`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {}}
              disabled={loading}
              startDecorator={<KeyboardArrowLeftIcon />}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {}}
              disabled={loading}
              endDecorator={<KeyboardArrowRightIcon />}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>
      <Modal
        open={orderDetailsOpen}
        onClose={handleOrderDetailsClose}
        aria-labelledby="order-details-modal"
      >
        <ModalDialog
          aria-labelledby="order-details-modal"
          sx={{ maxWidth: 600, width: '100%' }}
        >
          <ModalClose />
          <Typography id="order-details-modal" level="title-md" fontWeight="lg" sx={{ mb: 2 }}>
            Order Details
          </Typography>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Order ID: {selectedOrder.uuid}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Date: {new Date(selectedOrder.date).toLocaleString()}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Status:{' '}
                  <Chip
                    variant="soft"
                    color={
                      selectedOrder.status === 'Paid'
                        ? 'success'
                        : selectedOrder.status === 'Refunded'
                        ? 'danger'
                        : 'neutral'
                    }
                    size="sm"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {selectedOrder.status}
                  </Chip>
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="body-sm" fontWeight="md">
                  Customer Information
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Name: {selectedOrder.customer.name}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Email: {selectedOrder.customer.email}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="body-sm" fontWeight="md">
                  Ordered Items
                </Typography>
                {orderItemsLoading ? (
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Loading items...
                  </Typography>
                ) : (
                  <Table size="sm" sx={{ minWidth: 500 }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ textAlign: 'right' }}>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={2} style={{ textAlign: 'center', padding: '16px' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                              No items found for this order.
                            </Typography>
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>
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
    </Sheet>
  );
}
