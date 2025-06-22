import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
export default function ProductDialog({ open, onClose, product, onSave }) {
    var _a, _b;
    const [form, setForm] = React.useState({
        ProductName: (product === null || product === void 0 ? void 0 : product.ProductName) || '',
        SalesPrice: ((_a = product === null || product === void 0 ? void 0 : product.SalesPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '',
        CostPrice: ((_b = product === null || product === void 0 ? void 0 : product.CostPrice) === null || _b === void 0 ? void 0 : _b.toString()) || '',
    });
    React.useEffect(() => {
        var _a, _b;
        setForm({
            ProductName: (product === null || product === void 0 ? void 0 : product.ProductName) || '',
            SalesPrice: ((_a = product === null || product === void 0 ? void 0 : product.SalesPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            CostPrice: ((_b = product === null || product === void 0 ? void 0 : product.CostPrice) === null || _b === void 0 ? void 0 : _b.toString()) || '',
        });
    }, [product]);
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { children: [_jsx(DialogTitle, { children: "Edit Product" }), _jsxs(DialogContent, { children: [_jsx(Input, { name: "ProductName", value: form.ProductName, onChange: e => setForm(Object.assign(Object.assign({}, form), { ProductName: e.target.value })), placeholder: "Product Name", sx: { mb: 2 } }), _jsx(Input, { name: "SalesPrice", value: form.SalesPrice, onChange: e => setForm(Object.assign(Object.assign({}, form), { SalesPrice: e.target.value })), placeholder: "Sales Price", type: "number", sx: { mb: 2 } }), _jsx(Input, { name: "CostPrice", value: form.CostPrice, onChange: e => setForm(Object.assign(Object.assign({}, form), { CostPrice: e.target.value })), placeholder: "Cost Price", type: "number" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, variant: "plain", children: "Cancel" }), _jsx(Button, { onClick: () => onSave(form), variant: "solid", children: "Save" })] })] }) }));
}
