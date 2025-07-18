/**
 * PageOrders - Order management table with CRUD operations
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useRespo    // Event handlers
    const handleOrderClick = (uuid: string) => {
        const order = orders.find(o => o.uuid === uuid);
        if (order) {
            setSelectedOrder(order);
            setOrderDetailsOpen(true);
        }
    };

    const handleCheckoutClick = (order: OrderRow) => {
        setSelectedOrder(order);
        setCheckoutDialogOpen(true);
    };

    const handleCreateOrder = () => {
        setCreateOrderDialogOpen(true);
    };
 * Dialogs: DialogOrder, ResponsiveModal
 * Data: Supabase Orders table with real-time updates
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import Snackbar from '@mui/joy/Snackbar';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveModal from '../components/ResponsiveModal';
import PageLayout from '../layouts/PageLayout';
import DialogOrder, { OrderProfile } from '../Dialog/DialogOrder';
import ActionDialogOrderCheckout from '../Dialog/ActionDialogOrderCheckout';
import fonts from '../theme/fonts';
import { formatCurrency } from '../utils/currencyUtils';
import { prepareOrderCurrencyData, prepareOrderItemCurrencyData } from '../utils/currencyUtils';

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };

// Types
export type OrderStatus = 'Draft' | 'Paid' | 'Refunded' | 'Cancelled';

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
  category?: string;
};

const PageOrders = () => {
    const { isMobile } = useResponsive();
    
    // Data states
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(false);
    
    // UI states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
    const [creatingOrder, setCreatingOrder] = useState(false);
    
    // Toast notification states
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');

    // Utility functions
    const showToast = (message: string, color: 'success' | 'warning' | 'danger' = 'success') => {
        setToastMessage(message);
        setToastColor(color);
        setToastOpen(true);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Draft':
                return 'neutral';
            case 'Paid':
                return 'success';
            case 'Refunded':
                return 'warning';
            case 'Cancelled':
                return 'danger';
            default:
                return 'neutral';
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'Draft':
                return <ShoppingCartIcon />;
            case 'Paid':
                return <AttachMoneyIcon />;
            case 'Refunded':
                return <AttachMoneyIcon />;
            case 'Cancelled':
                return <ShoppingCartIcon />;
            default:
                return <ShoppingCartIcon />;
        }
    };

    // Data fetching
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*');

            if (error) {
                console.error('Error fetching orders:', error);
                showToast('Failed to fetch orders', 'danger');
                return;
            }

            if (data) {
                const mappedOrders = data.map((order: any) => ({
                    uuid: order.uuid,
                    date: order.date || order.created_at || order['Created at'] || '',
                    status: (order.status as OrderStatus) || 'Paid',
                    customer: order.customer || {
                        initial: order.customer_initial || (order.customer_name ? order.customer_name[0] : '?'),
                        name: order.customer_name || 'Unknown',
                        email: order.customer_email || '',
                    },
                    order_number_display: order.order_number_display,
                    order_total: typeof order.order_total === 'number' ? order.order_total : 0,
                    created_by: order.created_by || '',
                    created_by_name: order.created_by_name || '',
                    created_by_email: order.created_by_email || '',
                    category: order.category || 'purchase',
                })).sort((a, b) => {
                    // Sort by date descending (newest first)
                    const dateA = new Date(a.date || 0);
                    const dateB = new Date(b.date || 0);
                    return dateB.getTime() - dateA.getTime();
                });
                setOrders(mappedOrders);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            showToast('Failed to fetch orders', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderItems = async (orderUuid: string) => {
        try {
            const { data, error } = await supabase
                .from('orderitems')
                .select('*, Products:product_uuid(ProductName)')
                .eq('order_uuid', orderUuid);

            if (error) {
                console.error('Error fetching order items:', error);
                return [];
            }

            return data?.map((item: any) => ({
                ...item,
                product_name: item.Products?.ProductName || item.product_uuid,
            })) || [];
        } catch (err) {
            console.error('Error fetching order items:', err);
            return [];
        }
    };

    // Effects
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filtering
    const filteredOrders = orders.filter(order => {
        const matchesSearch = !search || 
            order.order_number_display?.toString().toLowerCase().includes(search.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesCategory = !categoryFilter || order.category === categoryFilter;
        const matchesCustomer = !customerFilter || order.customer.name === customerFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesCustomer;
    });

    // Get unique values for filters
    const statusOptions = Array.from(new Set(orders.map(order => order.status)));
    const categoryOptions = Array.from(new Set(orders.map(order => order.category || 'purchase')));
    const customerOptions = Array.from(new Set(orders.map(order => order.customer.name)));

    // Dialog helper functions
    const handleAddOrder = () => {
        setSelectedOrder(null);
        setDialogMode('add');
        setOrderDialogOpen(true);
    };

    const handleEditOrder = (order: OrderRow) => {
        setSelectedOrder(order);
        setDialogMode('edit');
        setOrderDialogOpen(true);
    };

    const handleViewOrder = (order: OrderRow) => {
        setSelectedOrder(order);
        setDialogMode('view');
        setOrderDialogOpen(true);
    };

    const handleDialogClose = () => {
        setOrderDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleOrderSaved = () => {
        fetchOrders(); // Refresh the order list
    };

    // Convert OrderRow to OrderProfile format for dialog
    const convertToOrderProfile = (order: OrderRow): OrderProfile => ({
        id: order.uuid,
        uuid: order.uuid,
        order_number: order.order_number_display,
        date: order.date,
        status: order.status,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        total: order.order_total,
    });

    // Event handlers
    const handleOrderClick = (orderId: string) => {
        const order = orders.find(o => o.uuid === orderId || o.order_number_display === orderId);
        if (order) {
            handleViewOrder(order);
        }
    };

    const handleCheckoutClick = (order: OrderRow) => {
        setSelectedOrder(order);
        setCheckoutDialogOpen(true);
    };

    const handleCreateOrder = () => {
        handleAddOrder();
    };

    const handleCloseFilters = () => {
        setFilterDialogOpen(false);
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setCategoryFilter('');
        setCustomerFilter('');
    };

    // Mobile view component
    const MobileView = () => (
        <Box sx={{ pb: 2 }}>
            {/* Search Bar */}
            <ResponsiveContainer variant="page" padding="medium">
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Input
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startDecorator={<SearchIcon />}
                        sx={{ flex: 1, fontSize: '16px' }}
                    />
                    <IconButton
                        variant="soft"
                        onClick={() => setFilterDialogOpen(true)}
                        sx={{ flexShrink: 0 }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>

                {/* Active Filters */}
                {(statusFilter || categoryFilter || customerFilter) && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {statusFilter && (
                            <Chip size="sm" variant="soft" color="primary">
                                Status: {statusFilter}
                            </Chip>
                        )}
                        {categoryFilter && (
                            <Chip size="sm" variant="soft" color="primary">
                                Category: {categoryFilter}
                            </Chip>
                        )}
                        {customerFilter && (
                            <Chip size="sm" variant="soft" color="primary">
                                Customer: {customerFilter}
                            </Chip>
                        )}
                    </Box>
                )}

                {/* Loading indicator */}
                {loading && <LinearProgress sx={{ mb: 2 }} />}
            </ResponsiveContainer>

            {/* Orders List */}
            <Box>
                {filteredOrders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="neutral">
                            {loading ? 'Loading orders...' : 'No orders found'}
                        </Typography>
                    </Box>
                ) : (
                    filteredOrders.map((order) => (
                        <Box 
                            key={order.uuid} 
                            sx={{ 
                                p: 2, 
                                borderBottom: '1px solid', 
                                borderColor: 'divider',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'background.level1'
                                }
                            }}
                            onClick={() => handleOrderClick(order.uuid)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                                        fontSize: '14px',
                                        fontWeight: 'bold',
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
                                            Order #{order.order_number_display || order.uuid.substring(0, 8)}
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
                                        {order.customer.name} • {new Date(order.date).toLocaleDateString()}
                                    </Typography>
                                    
                                    {order.order_total && (
                                        <Typography 
                                            level="body-xs" 
                                            sx={{ 
                                                fontWeight: 'bold',
                                                color: 'primary.600'
                                            }}
                                        >
                                            {formatCurrency(order.order_total)}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                {order.status === 'Draft' && (
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        color="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCheckoutClick(order);
                                        }}
                                        startDecorator={<PaymentIcon />}
                                    >
                                        Checkout
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Floating Action Button */}
            <IconButton
                color="primary"
                variant="soft"
                size="sm"
                sx={{
                    position: 'fixed',
                    bottom: 80,
                    right: 16,
                    zIndex: 1000,
                    borderRadius: '8px',
                    width: 40,
                    height: 40,
                    boxShadow: 'sm',
                    bgcolor: 'primary.100',
                    '&:hover': {
                        bgcolor: 'primary.200',
                        boxShadow: 'md'
                    }
                }}
                onClick={handleCreateOrder}
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    // Desktop view component
    const DesktopView = () => (
        <ResponsiveContainer variant="table-page">
            <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
                Orders
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Input
                    placeholder="Search orders..."
                    sx={{ flex: 1, fontSize: fonts.sizes.small }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    startDecorator={<SearchIcon />}
                />
                <Select
                    placeholder="Filter status"
                    value={statusFilter}
                    onChange={(_, value) => setStatusFilter(value || '')}
                    sx={{ minWidth: 160, fontSize: fonts.sizes.small }}
                >
                    <Option value="">All Statuses</Option>
                    {statusOptions.map((status) => (
                        <Option key={status} value={status}>
                            {status}
                        </Option>
                    ))}
                </Select>
                <Button
                    variant="solid"
                    startDecorator={<AddIcon />}
                    onClick={handleCreateOrder}
                    sx={{ fontSize: fonts.sizes.small }}
                >
                    Create Order
                </Button>
            </Box>
            
            <Card sx={{ overflow: 'visible' }}>
                {loading && <LinearProgress />}
                <Table aria-label="Orders" sx={{ tableLayout: 'auto' }}>
                    <thead>
                        <tr>
                            <th style={typographyStyles}>Order #</th>
                            <th style={typographyStyles}>Date</th>
                            <th style={typographyStyles}>Customer</th>
                            <th style={typographyStyles}>Status</th>
                            <th style={typographyStyles}>Total</th>
                            <th style={typographyStyles}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                                    {loading ? 'Loading orders...' : 'No orders found.'}
                                </td>
                            </tr>
                        )}
                        {filteredOrders.map((order) => (
                            <tr 
                                key={order.uuid} 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleOrderClick(order.uuid)}
                            >
                                <td style={typographyStyles}>
                                    {order.order_number_display || order.uuid.substring(0, 8)}
                                </td>
                                <td style={typographyStyles}>
                                    {new Date(order.date).toLocaleDateString()}
                                </td>
                                <td style={typographyStyles}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ 
                                            width: 24, 
                                            height: 24, 
                                            borderRadius: '50%', 
                                            bgcolor: 'primary.100',
                                            color: 'primary.600',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {order.customer.initial}
                                        </Box>
                                        <Box>
                                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                                                {order.customer.name}
                                            </Typography>
                                            <Typography level="body-xs" color="neutral">
                                                {order.customer.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </td>
                                <td style={typographyStyles}>
                                    <Chip 
                                        size="sm" 
                                        variant="soft" 
                                        color={getStatusColor(order.status)}
                                    >
                                        {order.status}
                                    </Chip>
                                </td>
                                <td style={typographyStyles}>
                                    <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                                        {order.order_total ? formatCurrency(order.order_total) : 'N/A'}
                                    </Typography>
                                </td>
                                <td style={typographyStyles}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {order.status === 'Draft' && (
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCheckoutClick(order);
                                                }}
                                                startDecorator={<PaymentIcon />}
                                            >
                                                Checkout
                                            </Button>
                                        )}
                                    </Box>
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
            
            {/* Order Dialog (Create/Edit/View) */}
            <DialogOrder
                open={orderDialogOpen}
                onClose={handleDialogClose}
                order={selectedOrder ? convertToOrderProfile(selectedOrder) : undefined}
                mode={dialogMode}
                onSaved={handleOrderSaved}
                fetchOrderItems={fetchOrderItems}
            />

            {/* Checkout Dialog */}
            <ActionDialogOrderCheckout
                open={checkoutDialogOpen}
                onClose={() => setCheckoutDialogOpen(false)}
                order={selectedOrder ? {
                    uuid: selectedOrder.uuid,
                    order_number_display: selectedOrder.order_number_display,
                    order_total: selectedOrder.order_total,
                    customer_name: selectedOrder.customer.name,
                    customer_email: selectedOrder.customer.email,
                } : null}
                onSuccess={() => {
                    setCheckoutDialogOpen(false);
                    fetchOrders(); // Refresh orders after successful checkout
                    showToast('Order completed successfully!', 'success');
                }}
            />
            
            {/* Filter Dialog (Mobile) */}
            {isMobile && (
                <ResponsiveModal
                    open={filterDialogOpen}
                    onClose={handleCloseFilters}
                    title="Filter Orders"
                    size="medium"
                    actions={
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="plain" 
                                onClick={handleClearFilters}
                                sx={typographyStyles}
                            >
                                Clear All
                            </Button>
                            <Button 
                                variant="solid"
                                onClick={handleCloseFilters}
                                sx={typographyStyles}
                            >
                                Apply
                            </Button>
                        </Box>
                    }
                >
                    <Stack spacing={2}>
                        <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Select
                                placeholder="All statuses"
                                value={statusFilter}
                                onChange={(_, value) => setStatusFilter(value || '')}
                            >
                                <Option value="">All Statuses</Option>
                                {statusOptions.map((status) => (
                                    <Option key={status} value={status}>
                                        {status}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Category</FormLabel>
                            <Select
                                placeholder="All categories"
                                value={categoryFilter}
                                onChange={(_, value) => setCategoryFilter(value || '')}
                            >
                                <Option value="">All Categories</Option>
                                {categoryOptions.map((category) => (
                                    <Option key={category} value={category}>
                                        {category}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Customer</FormLabel>
                            <Select
                                placeholder="All customers"
                                value={customerFilter}
                                onChange={(_, value) => setCustomerFilter(value || '')}
                            >
                                <Option value="">All Customers</Option>
                                {customerOptions.map((customer) => (
                                    <Option key={customer} value={customer}>
                                        {customer}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </ResponsiveModal>
            )}

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ 
                    top: 16,
                    zIndex: 2000
                }}
            >
                <Alert 
                    color={toastColor}
                    variant="solid"
                    sx={{ width: '100%' }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        </PageLayout>
    );
};

export default PageOrders;
