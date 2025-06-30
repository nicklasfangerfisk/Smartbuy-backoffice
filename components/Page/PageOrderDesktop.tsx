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
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import { supabase } from '../../utils/supabaseClient';
import OrderTableCreate from '../Dialog/OrderTableCreate';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageOrderMobile, { PageOrderMobileItem } from './PageOrderMobile';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import { handleOrderClick } from '../../utils';
import GeneralTable from '../general/GeneralTable';
import PageLayout from '../layouts/PageLayout';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import fonts from '../../theme/fonts';

// Apply font size to Typography components
// Update font size to use small instead of medium
const typographyStyles = { fontSize: fonts.sizes.small };

export type OrderStatus = 'Paid' | 'Refunded' | 'Cancelled';

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

// Add prop validation for OrderTable
/**
 * Props for the OrderTable component.
 * @property {OrderRow[]} rows - Array of order rows to display in the table.
 * @property {(orderId: string) => void} [onRowClick] - Callback for when a row is clicked.
 * @property {boolean} orderDetailsOpen - Whether the order details modal is open.
 * @property {OrderRow | null} selectedOrder - The currently selected order.
 * @property {(orderUuid: string) => Promise<any[]>} fetchOrderItems - Function to fetch items for a specific order.
 * @property {() => void} onCloseOrderDetails - Callback to close the order details modal.
 */
interface OrderTableProps {
  rows: OrderRow[];
  onRowClick?: (orderId: string) => void;
  orderDetailsOpen: boolean;
  selectedOrder: OrderRow | null;
  fetchOrderItems: (orderUuid: string) => Promise<any[]>;
  onCloseOrderDetails: () => void;
}

// Add inline documentation for the OrderTable component
/**
 * OrderTable component displays a list of orders in a table format.
 * It supports filtering, searching, and viewing order details.
 *
 * @param {OrderTableProps} props - Props for the component.
 * @returns {JSX.Element} The rendered OrderTable component.
 */
export default function OrderTable({
  rows: initialRows,
  onRowClick,
  orderDetailsOpen,
  selectedOrder,
  onCloseOrderDetails,
}: OrderTableProps) {
  const [rows, setRows] = React.useState<OrderRow[]>(initialRows);
  const [order, setOrder] = React.useState<Order>('desc');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  // Add state for order details modal
  const [orderDetailsOpenState, setOrderDetailsOpen] = React.useState(false);
  const [selectedOrderState, setSelectedOrder] = React.useState<OrderRow | null>(null);
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
  // Add inline documentation for the fetchOrders function
  /**
   * Fetches the list of orders from the Supabase database.
   * Maps the fetched data to the OrderRow structure and updates the state.
   */
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
        status: (order.status as OrderStatus) || 'Paid',
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
    console.log('Fetching orders...');
    fetchOrders();
  }, []);

  // Add logs for state updates
  React.useEffect(() => {
    console.log('Rows updated:', rows);
  }, [rows]);

  React.useEffect(() => {
    console.log('Status filter updated:', statusFilter);
  }, [statusFilter]);

  React.useEffect(() => {
    console.log('Category filter updated:', categoryFilter);
  }, [categoryFilter]);

  React.useEffect(() => {
    console.log('Customer filter updated:', customerFilter);
  }, [customerFilter]);

  // Fix duplicate identifier for fetchOrderItems by renaming the local function
  async function fetchOrderItemsLocal(orderUuid: string) {
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

  // Add inline documentation for the renderFilters function
  /**
   * Renders the filter controls for the table, including status, category, and customer filters.
   *
   * @returns {JSX.Element} The rendered filter controls.
   */
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
  // Add inline documentation for the handleCreateOrder function
  /**
   * Handles the creation of a new order and its associated items.
   *
   * @param {{ product_uuid: string | null; quantity: number; unitprice: number; discount: number }[]} orderItems - List of items to add to the order.
   * @param {number} orderDiscount - Discount applied to the entire order.
   */
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

  // Add inline documentation for the handleOrderDetailsOpen function
  /**
   * Opens the order details modal for a specific order.
   *
   * @param {OrderRow} order - The order to view details for.
   */
  const handleOrderDetailsOpen = (order: OrderRow) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Add inline documentation for the handleOrderDetailsClose function
  /**
   * Closes the order details modal and clears the selected order.
   */
  const handleOrderDetailsClose = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Convert OrderRow[] to OrderListItem[] for mobile
  const orderListItems: PageOrderMobileItem[] = rows.map((row) => ({
    id: row.order_number_display || row.uuid,
    date: row.date,
    status: row.status,
    customer: row.customer,
  }));

  // Add inline documentation for the mobile rendering logic
  if (isMobile) {
    /**
     * Render the mobile-specific layout using the PageOrderMobile component.
     * Passes necessary props for handling order details and interactions.
     */
    return (
      <PageOrderMobile
        orders={orderListItems}
        onRowClick={(orderId: string) => {
          handleOrderClick(orderId, rows, setSelectedOrder, setOrderDetailsOpen);
        }}
        orderDetailsOpen={orderDetailsOpenState}
        selectedOrder={selectedOrderState}
        fetchOrderItems={fetchOrderItemsLocal}
        onCloseOrderDetails={() => setOrderDetailsOpen(false)}
      />
    );
  }
  // Add inline documentation for the desktop rendering logic
  /**
   * Render the desktop-specific layout with a table displaying orders.
   * Includes search, filters, and a button to create new orders.
   */
  return (
    <PageLayout>
      <Typography level="h2" sx={{ mb: 2, fontSize: 'xlarge' }}>
        Orders
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search orders..."
          sx={{ flex: 1, ...typographyStyles }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Filter status"
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value ?? '')}
          sx={{ minWidth: 160, ...typographyStyles }}
        >
          <Option value="">All Statuses</Option>
          {statusOptions.map((status) => (
            <Option key={status} value={status} sx={typographyStyles}>
              {status}
            </Option>
          ))}
        </Select>
        <Button
          onClick={handleOpenCreate}
          variant="solid"
          sx={typographyStyles}
        >
          Create Order
        </Button>
      </Box>
      <Card sx={{ pl: 0, pr: 0 }}>
        {loading && <LinearProgress />}
        <GeneralTable
          columns={[
            { id: 'order_number_display', label: 'Order #', minWidth: 100 },
            { id: 'date', label: 'Date', minWidth: 150 },
            { id: 'status', label: 'Status', minWidth: 100, align: 'right' },
            { id: 'customer_name', label: 'Customer', minWidth: 150 },
            { id: 'order_total', label: 'Total', minWidth: 100, format: (value) => `$${value.toFixed(2)}` },
          ]}
          rows={filteredRows.map((row) => ({
            order_number_display: row.order_number_display || '-',
            date: new Date(row.date).toLocaleString(),
            status: row.status,
            customer_name: row.customer.name,
            order_total: row.order_total || 0,
          }))}
          ariaLabel="Orders Table"
        />
      </Card>
      <OrderTableDetails
        open={orderDetailsOpen}
        onClose={handleOrderDetailsClose}
        selectedOrder={selectedOrder}
        fetchOrderItems={fetchOrderItemsLocal}
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
          <Typography
            id="create-order-modal"
            level="title-md"
            fontWeight="lg"
            sx={{ mb: 2 }}
          >
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
    </PageLayout>
  );
}
