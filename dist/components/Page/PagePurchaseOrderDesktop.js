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
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import PurchaseOrderForm from '../Dialog/PurchaseOrderForm';
import GeneralTable from '../general/GeneralTable';
export default function PurchaseOrderTable() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    useEffect(() => {
        function fetchOrders() {
            return __awaiter(this, void 0, void 0, function* () {
                setLoading(true);
                setError(null);
                // Fetch purchase orders and join supplier name
                const { data, error } = yield supabase
                    .from('PurchaseOrders')
                    .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
                    .order('order_date', { ascending: false });
                if (!error && data) {
                    setOrders(data);
                }
                else if (error) {
                    setError(error.message || 'Failed to fetch purchase orders');
                }
                setLoading(false);
            });
        }
        fetchOrders();
    }, []);
    const handleCreated = () => __awaiter(this, void 0, void 0, function* () {
        // Refresh orders after creation
        setLoading(true);
        setError(null);
        const { data, error } = yield supabase
            .from('PurchaseOrders')
            .select('id, order_number, order_date, status, total, notes, Suppliers(name)')
            .order('order_date', { ascending: false });
        if (!error && data) {
            setOrders(data);
        }
        else if (error) {
            setError(error.message || 'Failed to fetch purchase orders');
        }
        setLoading(false);
    });
    // Filter orders by order number, supplier name, and status
    const filteredOrders = orders.filter(order => {
        var _a, _b, _c;
        const matchesSearch = ((_a = order.order_number) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase().includes(search.toLowerCase())) ||
            ((_c = (_b = order.Suppliers) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });
    const columns = [
        { id: 'order_number', label: 'Order Number', minWidth: 100 },
        { id: 'order_date', label: 'Order Date', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'total', label: 'Total', minWidth: 100, format: (value) => `$${value.toFixed(2)}` },
        { id: 'notes', label: 'Notes', minWidth: 200 },
        { id: 'supplier_name', label: 'Supplier', minWidth: 150 },
    ];
    const rows = orders.map((order) => {
        var _a;
        return (Object.assign(Object.assign({}, order), { supplier_name: ((_a = order.Suppliers) === null || _a === void 0 ? void 0 : _a.name) || 'N/A' }));
    });
    return (_jsxs(Box, { sx: { width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2 }, children: "Purchase Orders" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 2 }, children: [_jsx(Input, { placeholder: "Search purchase orders...", sx: { flex: 1 }, value: search, onChange: e => setSearch(e.target.value) }), _jsxs(Select, { placeholder: "Filter status", value: statusFilter, onChange: (_, value) => setStatusFilter(value !== null && value !== void 0 ? value : ''), sx: { minWidth: 160 }, children: [_jsx(Option, { value: "", children: "All Statuses" }), _jsx(Option, { value: "Pending", children: "Pending" }), _jsx(Option, { value: "Approved", children: "Approved" }), _jsx(Option, { value: "Received", children: "Received" }), _jsx(Option, { value: "Cancelled", children: "Cancelled" })] }), _jsx(Button, { onClick: () => setAddDialogOpen(true), variant: "solid", children: "Add Purchase Order" })] }), _jsx(PurchaseOrderForm, { open: addDialogOpen, onClose: () => setAddDialogOpen(false), onCreated: handleCreated, mode: "add", order: null }), _jsx(PurchaseOrderForm, { open: editDialogOpen, onClose: () => { setEditDialogOpen(false); setSelectedOrder(null); }, onCreated: handleCreated, mode: "edit", order: selectedOrder }), _jsxs(Card, { children: [loading && _jsx(LinearProgress, {}), error && _jsxs(Typography, { color: "danger", children: ["Error: ", error] }), _jsx(GeneralTable, { columns: columns, rows: rows, ariaLabel: "Purchase Orders", minWidth: 800 })] })] }));
}
