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
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import Card from '@mui/joy/Card';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';
import Table from '@mui/joy/Table';
// Props: supplier (object), onClose (function)
export default function SupplierDisplay({ supplier, onClose }) {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    useEffect(() => {
        function fetchPurchaseOrders() {
            return __awaiter(this, void 0, void 0, function* () {
                setLoadingOrders(true);
                setOrdersError(null);
                const { data, error } = yield supabase
                    .from('PurchaseOrders')
                    .select('id, order_number, order_date, status, total, notes')
                    .eq('supplier_id', supplier.id)
                    .order('order_date', { ascending: false });
                if (!error && data) {
                    setPurchaseOrders(data);
                }
                else if (error) {
                    setOrdersError(error.message || 'Failed to fetch purchase orders');
                }
                setLoadingOrders(false);
            });
        }
        fetchPurchaseOrders();
    }, [supplier.id]);
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'row', width: '100%', minHeight: '60vh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 2 }, children: [_jsxs(Box, { sx: { flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 340, maxWidth: 420, borderRight: '1px solid', borderColor: 'divider' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(Typography, { level: "h2", sx: { flex: 1 }, children: supplier.name }), _jsx(Button, { onClick: onClose, variant: "outlined", sx: { ml: 2 }, children: "Close" })] }), _jsxs(Card, { variant: "soft", sx: { mb: 2 }, children: [_jsx(Typography, { level: "h4", sx: { mb: 1 }, children: "Company Information" }), _jsx(Divider, { sx: { mb: 1 } }), _jsxs(Typography, { level: "body-md", children: [_jsx("b", { children: "Name:" }), " ", supplier.name] }), _jsxs(Typography, { level: "body-md", children: [_jsx("b", { children: "Address:" }), " ", supplier.address] })] }), _jsxs(Card, { variant: "soft", children: [_jsx(Typography, { level: "h4", sx: { mb: 1 }, children: "Contact Information" }), _jsx(Divider, { sx: { mb: 1 } }), _jsxs(Typography, { level: "body-md", children: [_jsx("b", { children: "Contact Name:" }), " ", supplier.contact_name] }), _jsxs(Typography, { level: "body-md", children: [_jsx("b", { children: "Email:" }), " ", supplier.email] }), _jsxs(Typography, { level: "body-md", children: [_jsx("b", { children: "Phone:" }), " ", supplier.phone] })] })] }), _jsxs(Box, { sx: { flex: 2, p: 4, overflowY: 'auto' }, children: [_jsx(Typography, { level: "h3", sx: { mb: 2 }, children: "Purchase Orders" }), loadingOrders && _jsx(Typography, { children: "Loading..." }), ordersError && _jsxs(Typography, { color: "danger", children: ["Error: ", ordersError] }), _jsxs(Table, { "aria-label": "Supplier Purchase Orders", sx: { minWidth: 700, mb: 2 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order #" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Notes" })] }) }), _jsxs("tbody", { children: [purchaseOrders.map((order) => (_jsxs("tr", { children: [_jsx("td", { children: order.order_number }), _jsx("td", { children: order.order_date }), _jsx("td", { children: order.status }), _jsx("td", { children: order.total != null ? `$${order.total.toFixed(2)}` : '—' }), _jsx("td", { children: order.notes || '' })] }, order.id))), purchaseOrders.length === 0 && !loadingOrders && (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: { textAlign: 'center', color: '#888' }, children: "No purchase orders for this supplier." }) }))] })] })] })] }));
}
