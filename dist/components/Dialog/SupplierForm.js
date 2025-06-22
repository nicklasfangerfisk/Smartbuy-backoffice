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
import { supabase } from '../../utils/supabaseClient';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
export default function SupplierForm({ open, onClose, onSaved, mode = 'add', supplier }) {
    const [name, setName] = React.useState((supplier === null || supplier === void 0 ? void 0 : supplier.name) || '');
    const [contactName, setContactName] = React.useState((supplier === null || supplier === void 0 ? void 0 : supplier.contact_name) || '');
    const [email, setEmail] = React.useState((supplier === null || supplier === void 0 ? void 0 : supplier.email) || '');
    const [phone, setPhone] = React.useState((supplier === null || supplier === void 0 ? void 0 : supplier.phone) || '');
    const [address, setAddress] = React.useState((supplier === null || supplier === void 0 ? void 0 : supplier.address) || '');
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        if (open && mode === 'edit' && supplier) {
            setName(supplier.name || '');
            setContactName(supplier.contact_name || '');
            setEmail(supplier.email || '');
            setPhone(supplier.phone || '');
            setAddress(supplier.address || '');
        }
        else if (open && mode === 'add') {
            setName('');
            setContactName('');
            setEmail('');
            setPhone('');
            setAddress('');
        }
    }, [open, mode, supplier]);
    const handleSave = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        setSaving(true);
        setError(null);
        const payload = {
            name,
            contact_name: contactName,
            email,
            phone,
            address,
        };
        let result;
        if (mode === 'add') {
            result = yield supabase.from('Suppliers').insert([payload]).select();
            setSaving(false);
            if (result.error) {
                setError(result.error.message);
            }
            else {
                // Pass the new supplier's id to the parent
                onSaved((_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id);
            }
            return;
        }
        else {
            result = yield supabase.from('Suppliers').update(payload).eq('id', supplier.id);
        }
        setSaving(false);
        if (result.error) {
            setError(result.error.message);
        }
        else {
            onSaved();
            // Do not call onClose() here; let parent handle closing the modal
        }
    });
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { sx: { minWidth: 400 }, children: [_jsx(ModalClose, {}), _jsxs(Typography, { level: "title-md", sx: { mb: 2 }, children: [mode === 'edit' ? 'Edit' : 'Add', " Supplier"] }), _jsxs("form", { onSubmit: e => { e.preventDefault(); e.stopPropagation(); handleSave(); }, children: [_jsx(Input, { placeholder: "Name", value: name, onChange: e => setName(e.target.value), sx: { mb: 2 }, required: true }), _jsx(Input, { placeholder: "Contact Name", value: contactName, onChange: e => setContactName(e.target.value), sx: { mb: 2 } }), _jsx(Input, { placeholder: "Email", value: email, onChange: e => setEmail(e.target.value), sx: { mb: 2 }, type: "email" }), _jsx(Input, { placeholder: "Phone", value: phone, onChange: e => setPhone(e.target.value), sx: { mb: 2 }, type: "tel" }), _jsx(Input, { placeholder: "Address", value: address, onChange: e => setAddress(e.target.value), sx: { mb: 2 } }), error && _jsx(Typography, { color: "danger", sx: { mb: 1 }, children: error }), _jsx(Button, { type: "submit", loading: saving, disabled: saving, variant: "solid", children: "Save" })] })] }) }));
}
