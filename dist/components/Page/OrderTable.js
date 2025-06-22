var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import { supabase } from '../../utils/supabaseClient';
import OrderTableCreate from '../Dialog/OrderTableCreate';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import useMediaQuery from '@mui/material/useMediaQuery';
import OrderTableMobile from './OrderTableMobile';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}
function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}
function RowMenu() {
    return (_jsxs(Dropdown, { children: [_jsx(MenuButton, { slots: { root: IconButton }, slotProps: { root: { variant: 'plain', color: 'neutral', size: 'sm' } }, children: _jsx(MoreHorizRoundedIcon, {}) }), _jsxs(Menu, { size: "sm", sx: { minWidth: 140 }, children: [_jsx(MenuItem, { children: "Edit" }), _jsx(MenuItem, { children: "Rename" }), _jsx(MenuItem, { children: "Move" }), _jsx(Divider, {}), _jsx(MenuItem, { color: "danger", children: "Delete" })] })] }));
}
export default function OrderTable() {
    const [order, setOrder] = React.useState('desc');
    const [selected, setSelected] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    // Add state for order details modal
    const [orderDetailsOpen, setOrderDetailsOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    // Add state for order items loading and data
    const [orderItems, setOrderItems] = React.useState([]);
    const [orderItemsLoading, setOrderItemsLoading] = React.useState(false);
    const [orderItemsAll, setOrderItemsAll] = React.useState([]);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [newOrder, setNewOrder] = React.useState({
        date: '',
        status: 'Paid',
        customer_name: '',
        customer_email: '',
    });
    const [statusFilter, setStatusFilter] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [customerFilter, setCustomerFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const isMobile = useMediaQuery('(max-width:600px)');
    // Move fetchOrders outside useEffect so it can be called after order creation
    function fetchOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            const { data, error } = yield supabase
                .from('Orders')
                .select('*');
            if (!error && data) {
                // Map Supabase data to OrderRow structure
                const mapped = data.map((order) => ({
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
            }
            else if (error) {
                console.error(error.message || 'Failed to fetch orders');
            }
            setLoading(false);
        });
    }
    React.useEffect(() => {
        fetchOrders();
    }, []);
    // Move fetchOrderItems outside of useEffect so it can be passed as a prop
    function fetchOrderItems(orderUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            // Join OrderItems with Products to get ProductName
            const { data, error } = yield supabase
                .from('OrderItems')
                .select('*, Products:product_uuid(ProductName)')
                .eq('order_uuid', orderUuid);
            if (!error && data) {
                return data.map((item) => {
                    var _a;
                    return (Object.assign(Object.assign({}, item), { product_name: ((_a = item.Products) === null || _a === void 0 ? void 0 : _a.ProductName) || item.product_uuid }));
                });
            }
            else {
                return [];
            }
        });
    }
    // Collect unique statuses, categories, and customers from rows
    const statusOptions = Array.from(new Set(rows.map(r => r.status)));
    // For category, you may want to extract from order data if available, else keep static
    const categoryOptions = ['all', 'refund', 'purchase', 'debit']; // TODO: make dynamic if possible
    const customerOptions = Array.from(new Set(rows.map(r => r.customer.name)));
    // Filter rows based on search and status
    const filteredRows = rows.filter(row => {
        var _a, _b, _c;
        const matchesSearch = ((_a = row.order_number_display) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase().includes(search.toLowerCase())) ||
            ((_c = (_b = row.customer) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase()));
        const statusMatch = !statusFilter || row.status === statusFilter;
        return matchesSearch && statusMatch;
    });
    const renderFilters = () => (_jsxs(React.Fragment, { children: [_jsxs(FormControl, { size: "sm", children: [_jsx(FormLabel, { children: "Status" }), _jsxs(Select, { size: "sm", placeholder: "Filter by status", value: statusFilter, onChange: (_e, val) => setStatusFilter(val || ''), slotProps: { button: { sx: { whiteSpace: 'nowrap' } } }, children: [_jsx(Option, { value: "", children: "All" }), statusOptions.map(status => (_jsx(Option, { value: status, children: status }, status)))] })] }), _jsxs(FormControl, { size: "sm", children: [_jsx(FormLabel, { children: "Category" }), _jsx(Select, { size: "sm", placeholder: "All", value: categoryFilter, onChange: (_e, val) => setCategoryFilter(val || 'all'), children: categoryOptions.map(category => (_jsx(Option, { value: category, children: category.charAt(0).toUpperCase() + category.slice(1) }, category))) })] }), _jsxs(FormControl, { size: "sm", children: [_jsx(FormLabel, { children: "Customer" }), _jsxs(Select, { size: "sm", placeholder: "All", value: customerFilter, onChange: (_e, val) => setCustomerFilter(val || 'all'), children: [_jsx(Option, { value: "all", children: "All" }), customerOptions.map(customer => (_jsx(Option, { value: customer, children: customer }, customer)))] })] })] }));
    // Update handleCreateOrder to accept orderDiscount
    function handleCreateOrder(orderItems, orderDiscount) {
        return __awaiter(this, void 0, void 0, function* () {
            setCreating(true);
            // 1. Create the order with order-level discount
            const { data: orderData, error: orderError } = yield supabase.from('Orders').insert([
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
                alert('Failed to create order: ' + ((orderError === null || orderError === void 0 ? void 0 : orderError.message) || 'Unknown error'));
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
                    const { data: itemsData, error: itemsError } = yield supabase.from('OrderItems').insert(itemsToInsert);
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
        });
    }
    const handleOpenCreate = () => {
        setCreateOpen(true);
    };
    const handleCloseCreate = () => {
        setCreateOpen(false);
        setNewOrder({ date: '', status: 'Paid', customer_name: '', customer_email: '' });
    };
    const handleOrderDetailsOpen = (order) => {
        setSelectedOrder(order);
        setOrderDetailsOpen(true);
    };
    const handleOrderDetailsClose = () => {
        setOrderDetailsOpen(false);
        setSelectedOrder(null);
    };
    // Convert OrderRow[] to OrderListItem[] for mobile
    const orderListItems = rows.map((row) => ({
        id: row.order_number_display || row.uuid,
        date: row.date,
        status: row.status,
        customer: row.customer,
    }));
    if (isMobile) {
        // Move all mobile-specific logic and rendering to OrderTableMobile
        return (_jsx(OrderTableMobile, { orders: orderListItems, onRowClick: (orderId) => {
                const found = rows.find(row => (row.order_number_display || row.uuid) === orderId);
                if (found) {
                    setSelectedOrder(found);
                    setOrderDetailsOpen(true);
                }
            }, orderDetailsOpen: orderDetailsOpen, selectedOrder: selectedOrder, fetchOrderItems: fetchOrderItems, onCloseOrderDetails: () => setOrderDetailsOpen(false) }));
    }
    return (_jsxs(Box, { sx: { width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2, textAlign: 'left' }, children: "Orders" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 2 }, children: [_jsx(Input, { placeholder: "Search orders...", sx: { flex: 1 }, value: search, onChange: e => setSearch(e.target.value) }), _jsxs(Select, { placeholder: "Filter status", value: statusFilter, onChange: (_, value) => setStatusFilter(value !== null && value !== void 0 ? value : ''), sx: { minWidth: 160 }, children: [_jsx(Option, { value: "", children: "All Statuses" }), statusOptions.map(status => (_jsx(Option, { value: status, children: status }, status)))] }), _jsx(Button, { onClick: handleOpenCreate, variant: "solid", children: "Create Order" })] }), _jsxs(Card, { children: [loading && _jsx(LinearProgress, {}), _jsxs(Table, { "aria-label": "Orders", sx: { minWidth: 800 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order #" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Customer" }), _jsx("th", { children: "Total" }), _jsx("th", { style: { width: 120 } })] }) }), _jsxs("tbody", { children: [filteredRows.length === 0 && !loading && (_jsx("tr", { children: _jsx("td", { colSpan: 6, style: { textAlign: 'center', color: '#888' }, children: "No orders found." }) })), filteredRows.map((row) => (_jsxs("tr", { onClick: () => handleOrderDetailsOpen(row), style: { cursor: 'pointer' }, children: [_jsx("td", { children: row.order_number_display || '-' }), _jsx("td", { children: new Date(row.date).toLocaleString() }), _jsx("td", { children: _jsx(Chip, { variant: "soft", color: row.status === 'Paid'
                                                        ? 'success'
                                                        : row.status === 'Refunded'
                                                            ? 'danger'
                                                            : 'neutral', size: "sm", sx: { textTransform: 'capitalize' }, children: row.status }) }), _jsx("td", { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Avatar, { size: "sm", children: row.customer.initial }), _jsxs("div", { children: [_jsx(Typography, { level: "body-xs", fontWeight: "md", children: row.customer.name }), _jsx(Typography, { level: "body-xs", sx: { color: 'text.secondary' }, children: row.customer.email })] })] }) }), _jsx("td", { children: typeof row.order_total === 'number' ? `$${row.order_total.toFixed(2)}` : '-' }), _jsx("td", { children: _jsx(RowMenu, {}) })] }, row.uuid)))] })] })] }), _jsx(OrderTableDetails, { open: orderDetailsOpen, onClose: handleOrderDetailsClose, selectedOrder: selectedOrder, fetchOrderItems: fetchOrderItems }), _jsx(Modal, { open: createOpen, onClose: handleCloseCreate, "aria-labelledby": "create-order-modal", children: _jsxs(ModalDialog, { "aria-labelledby": "create-order-modal", sx: { maxWidth: 600, width: '100%' }, children: [_jsx(ModalClose, {}), _jsx(Typography, { id: "create-order-modal", level: "title-md", fontWeight: "lg", sx: { mb: 2 }, children: "Create Order" }), _jsx(OrderTableCreate, { open: createOpen, creating: creating, newOrder: newOrder, setNewOrder: setNewOrder, onClose: handleCloseCreate, onCreate: handleCreateOrder })] }) })] }));
}
