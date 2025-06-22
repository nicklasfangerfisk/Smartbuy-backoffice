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
import * as React from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Divider, Box, Table } from '@mui/joy';
export default function OrderTableDetails({ open, onClose, selectedOrder, fetchOrderItems }) {
    const [orderItems, setOrderItems] = React.useState([]);
    const [orderItemsLoading, setOrderItemsLoading] = React.useState(false);
    React.useEffect(() => {
        function loadItems() {
            return __awaiter(this, void 0, void 0, function* () {
                if (selectedOrder) {
                    setOrderItemsLoading(true);
                    const items = yield fetchOrderItems(selectedOrder.uuid);
                    setOrderItems(items);
                    setOrderItemsLoading(false);
                }
                else {
                    setOrderItems([]);
                }
            });
        }
        if (open && selectedOrder) {
            loadItems();
        }
        else {
            setOrderItems([]);
        }
    }, [open, selectedOrder, fetchOrderItems]);
    return (_jsx(Modal, { open: open, onClose: onClose, "aria-labelledby": "order-details-modal", children: _jsxs(ModalDialog, { "aria-labelledby": "order-details-modal", sx: { maxWidth: 600, width: '100%' }, children: [_jsx(ModalClose, {}), _jsx(Typography, { id: "order-details-modal", level: "title-md", fontWeight: "lg", sx: { mb: 2 }, children: "Order Details" }), selectedOrder && (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1 }, children: [_jsxs(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: ["Order ID: ", selectedOrder.uuid] }), _jsxs(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: ["Date: ", new Date(selectedOrder.date).toLocaleString()] }), _jsxs(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: ["Status: ", selectedOrder.status] })] }), _jsx(Divider, {}), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1 }, children: [_jsx(Typography, { level: "body-sm", fontWeight: "md", children: "Customer Information" }), _jsxs(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: ["Name: ", selectedOrder.customer.name] }), _jsxs(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: ["Email: ", selectedOrder.customer.email] })] }), _jsx(Divider, {}), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1 }, children: [_jsx(Typography, { level: "body-sm", fontWeight: "md", children: "Ordered Items" }), orderItemsLoading ? (_jsx(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: "Loading items..." })) : (_jsxs(Table, { size: "sm", sx: { minWidth: 500 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Product" }), _jsx("th", { style: { textAlign: 'right' }, children: "Quantity" }), _jsx("th", { style: { textAlign: 'right' }, children: "Unit Price" }), _jsx("th", { style: { textAlign: 'right' }, children: "Discount (%)" }), _jsx("th", { style: { textAlign: 'right' }, children: "Total Price" })] }) }), _jsx("tbody", { children: orderItems.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: { textAlign: 'center', padding: '16px' }, children: _jsx(Typography, { level: "body-sm", sx: { color: 'text.secondary' }, children: "No items found for this order." }) }) })) : (orderItems.map(function (item) {
                                                var _a;
                                                return (_jsxs("tr", { children: [_jsx("td", { children: item.product_name || item.name || item.product_uuid }), _jsx("td", { style: { textAlign: 'right' }, children: (_a = item.quantity) !== null && _a !== void 0 ? _a : '-' }), _jsx("td", { style: { textAlign: 'right' }, children: item.unitprice != null ? `$${Number(item.unitprice).toFixed(2)}` : '-' }), _jsx("td", { style: { textAlign: 'right' }, children: item.discount != null ? `${Number(item.discount).toFixed(2)}%` : '-' }), _jsx("td", { style: { textAlign: 'right' }, children: item.price != null ? `$${Number(item.price).toFixed(2)}` : '-' })] }, item.uuid));
                                            })) })] }))] })] }))] }) }));
}
