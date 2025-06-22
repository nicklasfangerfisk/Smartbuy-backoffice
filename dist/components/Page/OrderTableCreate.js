import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Button, FormControl, FormLabel, Input, Modal, ModalDialog, ModalClose, Select, Option, Typography, Box, Divider, IconButton } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../../utils/supabaseClient';
import Autocomplete from '@mui/joy/Autocomplete';
const OrderTableCreate = ({ open, creating, newOrder, setNewOrder, onClose, onCreate, }) => {
    const [products, setProducts] = React.useState([]);
    const [orderItems, setOrderItems] = React.useState([
        { id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: 0 },
    ]);
    const [loadingProducts, setLoadingProducts] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [productsError, setProductsError] = React.useState(null);
    const [orderDiscount, setOrderDiscount] = React.useState(0);
    const [discountDialogOpen, setDiscountDialogOpen] = React.useState(false);
    const [pendingOrderDiscount, setPendingOrderDiscount] = React.useState(null);
    const [orderDiscountTouched, setOrderDiscountTouched] = React.useState(false);
    React.useEffect(() => {
        if (open) {
            setOrderItems([{ id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: 0 }]);
            setError(null);
            // Default date to today if not already set
            setNewOrder(o => (Object.assign(Object.assign({}, o), { date: o.date || new Date().toISOString().slice(0, 10) })));
        }
    }, [open]);
    React.useEffect(() => {
        if (!open)
            return;
        setLoadingProducts(true);
        setProductsError(null);
        supabase.from('Products').select('*').then(({ data, error }) => {
            if (!error && data) {
                if (data.length === 0) {
                    setProductsError('No products available. Please add products first.');
                }
                setProducts(data.map((p) => {
                    var _a;
                    return ({
                        id: p.uuid || p.id, // Prefer uuid, fallback to id
                        ProductName: p.ProductName,
                        SalesPrice: (_a = p.SalesPrice) !== null && _a !== void 0 ? _a : 0
                    });
                }));
            }
            else {
                setProductsError('Failed to load products.');
            }
            setLoadingProducts(false);
        });
    }, [open]);
    const handleAddItem = () => {
        setOrderItems(items => [...items, { id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: orderDiscount }]);
    };
    const handleRemoveItem = (idx) => {
        setOrderItems(items => items.filter((_, i) => i !== idx));
    };
    const handleItemChange = (idx, field, value) => {
        setOrderItems(items => items.map((item, i) => {
            var _a;
            if (i !== idx)
                return item;
            if (field === 'product' && value) {
                const found = products.find(p => p.id === value.id);
                return Object.assign(Object.assign({}, item), { product: value, unitprice: (_a = found === null || found === void 0 ? void 0 : found.SalesPrice) !== null && _a !== void 0 ? _a : 0 });
            }
            if (field === 'product' && !value) {
                return Object.assign(Object.assign({}, item), { product: null, unitprice: 0 });
            }
            return Object.assign(Object.assign({}, item), { [field]: value });
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const items = orderItems
            .filter(item => item.product && item.product.id && item.quantity > 0)
            .map(item => ({
            product_uuid: item.product.id,
            quantity: item.quantity,
            unitprice: item.unitprice,
            discount: item.discount,
        }));
        if (items.length === 0) {
            setError('Please add at least one valid order item.');
            return;
        }
        setError(null);
        onCreate(items, orderDiscount);
    };
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { minWidth: 400, children: [_jsx(ModalClose, {}), _jsx(Typography, { level: "h4", sx: { mb: 2 }, children: "Create Order" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(FormControl, { sx: { mb: 2 }, required: true, children: [_jsx(FormLabel, { children: "Date" }), _jsx(Input, { type: "date", value: newOrder.date, onChange: e => setNewOrder(o => (Object.assign(Object.assign({}, o), { date: e.target.value }))), required: true })] }), _jsxs(FormControl, { sx: { mb: 2 }, required: true, children: [_jsx(FormLabel, { children: "Status" }), _jsxs(Select, { value: newOrder.status, onChange: (_event, v) => setNewOrder(o => (Object.assign(Object.assign({}, o), { status: v || 'Paid' }))), children: [_jsx(Option, { value: "Paid", children: "Paid" }), _jsx(Option, { value: "Refunded", children: "Refunded" }), _jsx(Option, { value: "Cancelled", children: "Cancelled" })] })] }), _jsxs(FormControl, { sx: { mb: 2 }, required: true, children: [_jsx(FormLabel, { children: "Customer Name" }), _jsx(Input, { value: newOrder.customer_name, onChange: e => setNewOrder(o => (Object.assign(Object.assign({}, o), { customer_name: e.target.value }))), required: true })] }), _jsxs(FormControl, { sx: { mb: 2 }, required: true, children: [_jsx(FormLabel, { children: "Customer Email" }), _jsx(Input, { type: "email", value: newOrder.customer_email, onChange: e => setNewOrder(o => (Object.assign(Object.assign({}, o), { customer_email: e.target.value }))), required: true })] }), _jsxs(FormControl, { sx: { mb: 2 }, required: true, children: [_jsx(FormLabel, { children: "Order Discount (%)" }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Input, { type: "number", value: orderDiscount, disabled: orderItems.length > 0 && !(orderItems.length === 1 && !orderItems[0].product), onChange: e => {
                                                const newDiscount = Math.max(0, Math.min(100, Math.floor(Number(e.target.value))));
                                                setOrderDiscount(newDiscount);
                                                setOrderItems(items => items.map(item => (Object.assign(Object.assign({}, item), { discount: newDiscount }))));
                                            }, slotProps: { input: { min: 0, max: 100, step: 1 } }, required: true, placeholder: "Order Discount %", sx: { flex: 1 } }), (orderItems.length > 1 || (orderItems.length === 1 && orderItems[0].product)) && (_jsx(Button, { size: "sm", variant: "outlined", onClick: () => setDiscountDialogOpen(true), children: "Edit" }))] })] }), error && (_jsx(Typography, { color: "danger", sx: { mb: 1 }, children: error })), _jsx(Divider, { sx: { my: 2 } }), _jsx(Box, { sx: { mb: 1, fontWeight: 'lg', fontSize: 'lg' }, children: "Order Items" }), productsError && (_jsx(Typography, { color: "danger", sx: { mb: 1 }, children: productsError })), orderItems.map((item, idx) => (_jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center', mb: 1 }, children: [_jsx(Autocomplete, { options: products, getOptionLabel: (option) => option.ProductName, isOptionEqualToValue: (option, value) => option.id === value.id, value: item.product, onChange: (_, value) => handleItemChange(idx, 'product', value), loading: loadingProducts, placeholder: loadingProducts ? 'Loading...' : 'Search product', sx: { minWidth: 220 }, disabled: products.length === 0, required: true, renderOption: (props, option) => (_jsx("li", Object.assign({}, props, { children: option.ProductName }))) }), _jsx(Input, { type: "number", value: item.quantity, onChange: e => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value))), sx: { width: 80 }, required: true, slotProps: { input: { min: 1 } } }), _jsx(Input, { type: "number", value: item.unitprice, onChange: e => handleItemChange(idx, 'unitprice', Math.max(0, Number(e.target.value))), sx: { width: 100 }, required: true, slotProps: { input: { min: 0, step: 0.01 } }, placeholder: "Unit Price" }), _jsx(Input, { type: "number", value: item.discount, onChange: e => handleItemChange(idx, 'discount', Math.max(0, Math.min(100, Math.floor(Number(e.target.value))))), sx: { width: 80 }, required: true, slotProps: { input: { min: 0, max: 100, step: 1 } }, placeholder: "Discount %" }), _jsx(IconButton, { size: "sm", color: "danger", onClick: () => handleRemoveItem(idx), disabled: orderItems.length === 1, children: _jsx(DeleteIcon, {}) })] }, item.id))), _jsx(Button, { startDecorator: _jsx(AddIcon, {}), variant: "soft", size: "sm", onClick: handleAddItem, sx: { mb: 2 }, disabled: !!productsError, children: "Add Item" }), _jsx(Modal, { open: discountDialogOpen, onClose: () => setDiscountDialogOpen(false), children: _jsxs(ModalDialog, { sx: { minWidth: 350 }, children: [_jsx(Typography, { level: "title-md", sx: { mb: 1 }, children: "Change Order Discount" }), _jsxs(FormControl, { sx: { mb: 2 }, required: true, children: [_jsx(FormLabel, { children: "Change discount to (%)" }), _jsx(Input, { type: "number", value: pendingOrderDiscount !== null && pendingOrderDiscount !== void 0 ? pendingOrderDiscount : orderDiscount, onChange: e => setPendingOrderDiscount(Math.max(0, Math.min(100, Math.floor(Number(e.target.value))))), slotProps: { input: { min: 0, max: 100, step: 1 } }, required: true, autoFocus: true })] }), _jsx(Typography, { sx: { mb: 2 }, children: "How do you want to apply the new order discount?" }), _jsxs(Box, { sx: { display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: [_jsx(Button, { onClick: () => {
                                                    setOrderDiscount(pendingOrderDiscount);
                                                    setOrderItems(items => items.map(item => (Object.assign(Object.assign({}, item), { discount: pendingOrderDiscount }))));
                                                    setDiscountDialogOpen(false);
                                                    setPendingOrderDiscount(null);
                                                }, children: "Overwrite all" }), _jsx(Button, { onClick: () => {
                                                    setOrderDiscount(pendingOrderDiscount);
                                                    setOrderItems(items => items.map(item => {
                                                        // Only update if the new discount is higher than the current item discount
                                                        if (item.discount < pendingOrderDiscount) {
                                                            return Object.assign(Object.assign({}, item), { discount: pendingOrderDiscount });
                                                        }
                                                        return item;
                                                    }));
                                                    setDiscountDialogOpen(false);
                                                    setPendingOrderDiscount(null);
                                                }, children: "Set discount on lower" }), _jsx(Button, { variant: "plain", onClick: () => {
                                                    setDiscountDialogOpen(false);
                                                    setPendingOrderDiscount(null);
                                                }, children: "Cancel" })] })] }) }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mt: 2 }, children: [_jsx(Button, { type: "submit", loading: creating, color: "primary", disabled: !!productsError, children: "Create" }), _jsx(Button, { variant: "plain", onClick: onClose, disabled: creating, children: "Cancel" })] })] })] }) }));
};
export default OrderTableCreate;
