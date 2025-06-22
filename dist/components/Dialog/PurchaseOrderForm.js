var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Autocomplete from '@mui/joy/Autocomplete';
import IconButton from '@mui/joy/IconButton';
import Add from '@mui/icons-material/Add';
import SupplierForm from './SupplierForm';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import PurchaseOrderItemsEditor from './PurchaseOrderItemsEditor';
const statusOptions = ['Pending', 'Approved', 'Received', 'Cancelled'];
export default function PurchaseOrderForm({ open, onClose, onCreated, mode = 'add', order }) {
    const [orderNumber, setOrderNumber] = React.useState((order === null || order === void 0 ? void 0 : order.order_number) || '');
    const [orderDate, setOrderDate] = React.useState((order === null || order === void 0 ? void 0 : order.order_date) || new Date().toISOString().slice(0, 10));
    const [status, setStatus] = React.useState((order === null || order === void 0 ? void 0 : order.status) || 'Pending');
    const [total, setTotal] = React.useState((order === null || order === void 0 ? void 0 : order.total) ? String(order.total) : '');
    const [notes, setNotes] = React.useState((order === null || order === void 0 ? void 0 : order.notes) || '');
    const [supplierId, setSupplierId] = React.useState((order === null || order === void 0 ? void 0 : order.supplier_id) || null);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [suppliers, setSuppliers] = React.useState([]);
    const [supplierInput, setSupplierInput] = React.useState('');
    const [addSupplierOpen, setAddSupplierOpen] = React.useState(false);
    const [items, setItems] = React.useState([{ product_id: null, quantity: 1, unit_price: 0 }]);
    // Add a ref to store the last created supplier id
    const lastCreatedSupplierId = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            console.log('[PurchaseOrderForm] Modal opened');
            supabase.from('Suppliers').select('id, name').then(({ data }) => {
                setSuppliers(data || []);
            });
            if (mode === 'edit' && (order === null || order === void 0 ? void 0 : order.id)) {
                // Fetch items for this purchase order
                supabase.from('purchaseorderitems').select('*').eq('purchase_order_id', order.id).then(({ data }) => {
                    setItems(data || []);
                });
            }
            else if (mode === 'add') {
                setItems([{ product_id: null, quantity: 1, unit_price: 0 }]);
            }
        }
        else {
            console.log('[PurchaseOrderForm] Modal closed');
        }
    }, [open, mode, order]);
    // After adding a supplier, refresh and select the new supplier
    const handleSupplierAdded = (newSupplierId) => __awaiter(this, void 0, void 0, function* () {
        console.log('[PurchaseOrderForm] handleSupplierAdded called');
        const { data } = yield supabase.from('Suppliers').select('id, name');
        setSuppliers(data || []);
        if (newSupplierId) {
            setSupplierId(String(newSupplierId));
            console.log('[PurchaseOrderForm] New supplier set:', newSupplierId);
        }
        setAddSupplierOpen(false);
        console.log('[PurchaseOrderForm] SupplierForm closed');
    });
    const generateOrderNumber = () => {
        // Example: PO-YYYYMMDD-XXXX (random 4 digits)
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `PO-${date}-${rand}`;
    };
    const handleSave = () => __awaiter(this, void 0, void 0, function* () {
        console.log('[PurchaseOrderForm] handleSave called');
        setSaving(true);
        setError(null);
        const payload = {
            order_date: orderDate,
            status,
            notes,
            supplier_id: supplierId,
        };
        if (mode === 'edit') {
            payload.order_number = orderNumber;
            payload.total = total ? parseFloat(total) : null;
        }
        else {
            payload.total = total ? parseFloat(total) : null;
        }
        let result;
        let purchaseOrderId = order === null || order === void 0 ? void 0 : order.id;
        if (mode === 'add') {
            result = yield supabase.from('PurchaseOrders').insert([payload]).select();
            if (!result.error && result.data && result.data[0]) {
                purchaseOrderId = result.data[0].id;
            }
        }
        else {
            result = yield supabase.from('PurchaseOrders').update(payload).eq('id', order.id);
        }
        if (!result.error && mode === 'add' && purchaseOrderId && items.length > 0) {
            // Insert items
            const itemsPayload = items.map(item => ({
                purchase_order_id: purchaseOrderId,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                notes: item.notes || null,
            }));
            const itemsResult = yield supabase.from('purchaseorderitems').insert(itemsPayload);
            if (itemsResult.error) {
                setError('Failed to save items: ' + itemsResult.error.message);
                setSaving(false);
                return;
            }
        }
        setSaving(false);
        if (result.error) {
            setError(result.error.message);
            console.log('[PurchaseOrderForm] Save error:', result.error.message);
        }
        else {
            onCreated();
            onClose();
            setOrderNumber('');
            setOrderDate(new Date().toISOString().slice(0, 10));
            setStatus('Pending');
            setTotal('');
            setNotes('');
            setSupplierId(null);
            setSupplierInput('');
            console.log('[PurchaseOrderForm] Purchase order saved and modal closed');
        }
    });
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { sx: { minWidth: 400 }, children: [_jsx(ModalClose, {}), _jsxs(Typography, { level: "title-md", sx: { mb: 2 }, children: [mode === 'edit' ? 'Edit' : 'Add', " Purchase Order"] }), _jsxs("form", { onSubmit: e => { e.preventDefault(); handleSave(); }, children: [_jsx(Input, { type: "date", value: orderDate, onChange: e => setOrderDate(e.target.value), sx: { mb: 2 }, required: true }), _jsx(Select, { value: status, onChange: (_, value) => setStatus(value !== null && value !== void 0 ? value : 'Pending'), sx: { mb: 2, display: 'none' }, required: true, children: statusOptions.map(opt => (_jsx(Option, { value: opt, children: opt }, opt))) }), mode === 'edit' && (_jsx(Box, { sx: { mb: 2 }, children: _jsx(Chip, { variant: "soft", color: status === 'Approved'
                                    ? 'success'
                                    : status === 'Received'
                                        ? 'primary'
                                        : status === 'Cancelled'
                                            ? 'danger'
                                            : 'neutral', sx: { textTransform: 'capitalize', fontWeight: 600, fontSize: 'md', px: 1.5, py: 0.5 }, onClick: () => {
                                    // Cycle through status options on click
                                    const idx = statusOptions.indexOf(status);
                                    setStatus(statusOptions[(idx + 1) % statusOptions.length]);
                                }, children: status }) })), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(Autocomplete, { options: suppliers, getOptionLabel: option => option.name, value: suppliers.find(s => s.id === supplierId) || null, onChange: (_e, value) => setSupplierId(value ? value.id : null), inputValue: supplierInput, onInputChange: (_e, value) => setSupplierInput(value), placeholder: "Select supplier", sx: { flex: 1, mb: 0 }, isOptionEqualToValue: (option, value) => option.id === value.id, required: true }), _jsx(IconButton, { color: "primary", sx: { ml: 1 }, onClick: () => setAddSupplierOpen(true), children: _jsx(Add, {}) })] }), _jsx(SupplierForm, { open: addSupplierOpen, onClose: () => setAddSupplierOpen(false), onSaved: handleSupplierAdded, mode: "add" }), mode === 'edit' && (_jsxs(_Fragment, { children: [_jsx(Input, { placeholder: "Order Number", value: orderNumber, onChange: e => setOrderNumber(e.target.value), sx: { mb: 2 } }), _jsx(Input, { placeholder: "Total", value: total, onChange: e => setTotal(e.target.value), sx: { mb: 2 }, type: "number", readOnly: true })] })), _jsx(Input, { placeholder: "Notes", value: notes, onChange: e => setNotes(e.target.value), sx: { mb: 2 } }), _jsx(PurchaseOrderItemsEditor, { orderId: order === null || order === void 0 ? void 0 : order.id, editable: mode === 'add', onItemsChange: setItems, initialItems: items }), _jsx(Box, { sx: { height: 16 } }), error && _jsx(Typography, { color: "danger", sx: { mb: 1 }, children: error }), _jsx(Button, { type: "submit", loading: saving, disabled: saving, variant: "solid", children: "Save" })] })] }) }));
}
