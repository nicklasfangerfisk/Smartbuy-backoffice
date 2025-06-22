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
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SupplierDisplay from './SupplierDisplay';
import SupplierForm from '../Dialog/SupplierForm';
import Input from '@mui/joy/Input';
export default function Suppliers() {
    const [suppliers, setSuppliers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [form, setForm] = React.useState({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
    const [creating, setCreating] = React.useState(false);
    const [imageFile, setImageFile] = React.useState(null);
    const [editId, setEditId] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
    const [editImageFile, setEditImageFile] = React.useState(null);
    const [savingEdit, setSavingEdit] = React.useState(false);
    const [selectedSupplier, setSelectedSupplier] = React.useState(null);
    const [addOpen, setAddOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    React.useEffect(() => {
        function fetchSuppliers() {
            return __awaiter(this, void 0, void 0, function* () {
                setLoading(true);
                setError(null);
                const { data, error } = yield supabase.from('Suppliers').select('*');
                if (!error && data) {
                    setSuppliers(data);
                }
                else if (error) {
                    setError(error.message || 'Failed to fetch suppliers');
                }
                setLoading(false);
            });
        }
        fetchSuppliers();
    }, []);
    function handleCreateSupplier(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            setCreating(true);
            setError(null);
            let image_url = '';
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = yield supabase.storage.from('supplierimages').upload(fileName, imageFile);
                if (uploadError) {
                    setError('Image upload failed: ' + uploadError.message);
                    setCreating(false);
                    return;
                }
                image_url = supabase.storage.from('supplierimages').getPublicUrl(fileName).data.publicUrl;
            }
            const { data, error } = yield supabase.from('Suppliers').insert([Object.assign(Object.assign({}, form), { image_url })]).select();
            if (!error && data && data.length > 0) {
                setSuppliers((prev) => [...prev, data[0]]);
                setForm({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
                setImageFile(null);
            }
            else if (error) {
                setError(error.message || 'Failed to create supplier');
            }
            setCreating(false);
        });
    }
    function handleEditSupplier(supplier) {
        return __awaiter(this, void 0, void 0, function* () {
            setEditId(supplier.id);
            setEditForm({
                name: supplier.name || '',
                email: supplier.email || '',
                contact_name: supplier.contact_name || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                image_url: supplier.image_url || '',
            });
            setEditImageFile(null);
        });
    }
    function handleSaveEdit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            setSavingEdit(true);
            setError(null);
            let image_url = editForm.image_url;
            if (editImageFile) {
                const fileExt = editImageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = yield supabase.storage.from('supplierimages').upload(fileName, editImageFile);
                if (uploadError) {
                    setError('Image upload failed: ' + uploadError.message);
                    setSavingEdit(false);
                    return;
                }
                image_url = supabase.storage.from('supplierimages').getPublicUrl(fileName).data.publicUrl;
            }
            const { data, error: updateError } = yield supabase.from('Suppliers').update(Object.assign(Object.assign({}, editForm), { image_url })).eq('id', editId).select();
            if (!updateError && data && data.length > 0) {
                setSuppliers((prev) => prev.map(s => s.id === editId ? data[0] : s));
                setEditId(null);
                setEditForm({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
                setEditImageFile(null);
            }
            else if (updateError) {
                setError(updateError.message || 'Failed to update supplier');
            }
            setSavingEdit(false);
        });
    }
    function handleCancelEdit() {
        setEditId(null);
        setEditForm({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
        setEditImageFile(null);
    }
    // Filter suppliers by name, contact_name, email, phone, or address
    const filteredSuppliers = suppliers.filter(supplier => {
        var _a, _b, _c, _d, _e;
        const q = search.toLowerCase();
        return (((_a = supplier.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(q)) ||
            ((_b = supplier.contact_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(q)) ||
            ((_c = supplier.email) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(q)) ||
            ((_d = supplier.phone) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(q)) ||
            ((_e = supplier.address) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(q)));
    });
    return (_jsxs(Box, { sx: { width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2 }, children: "Suppliers" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Input, { placeholder: "Search suppliers...", value: search, onChange: e => setSearch(e.target.value), sx: { flex: 1 } }), _jsx(Button, { variant: "solid", onClick: () => setAddOpen(true), sx: { minWidth: 140 }, children: "Add Supplier" })] }), _jsx(SupplierForm, { open: addOpen, onClose: () => setAddOpen(false), onSaved: () => {
                    setAddOpen(false);
                    // Refresh suppliers list
                    supabase.from('Suppliers').select('*').then(({ data, error }) => {
                        if (data)
                            setSuppliers(data);
                    });
                }, mode: "add" }), loading && _jsx(Typography, { children: "Loading..." }), error && _jsxs(Typography, { color: "danger", children: ["Error: ", error] }), _jsx(Grid, { container: true, spacing: 2, children: filteredSuppliers.map((supplier) => (_jsx(Grid, { xs: 12, md: 4, children: _jsx(Card, { variant: "outlined", sx: { cursor: editId === supplier.id ? 'default' : 'pointer' }, onClick: () => {
                            if (editId !== supplier.id)
                                setSelectedSupplier(supplier);
                        }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }, children: [_jsx(Box, { sx: { flex: 1 }, children: editId === supplier.id ? (_jsxs(Box, { component: "form", onSubmit: handleSaveEdit, sx: { display: 'flex', flexDirection: 'column', gap: 1 }, children: [_jsx("input", { type: "hidden", value: supplier.id }), _jsx("input", { type: "hidden", value: supplier.image_url }), _jsx(Button, { type: "submit", loading: savingEdit, startDecorator: _jsx(SaveIcon, {}), children: "Save" }), _jsx(Button, { type: "button", variant: "outlined", color: "neutral", onClick: handleCancelEdit, startDecorator: _jsx(CancelIcon, {}), children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { level: "h4", children: supplier.name }), _jsxs(Typography, { level: "body-md", children: ["Contact Name: ", supplier.contact_name] }), _jsxs(Typography, { level: "body-md", children: ["Email: ", supplier.email] }), _jsxs(Typography, { level: "body-md", children: ["Phone: ", supplier.phone] }), _jsxs(Typography, { level: "body-md", children: ["Address: ", supplier.address] }), _jsx(Button, { size: "sm", variant: "plain", startDecorator: _jsx(EditIcon, {}), onClick: e => { e.stopPropagation(); handleEditSupplier(supplier); }, sx: { mt: 1 }, children: "Edit" })] })) }), _jsx(Box, { sx: { minWidth: 100, maxWidth: 120, textAlign: 'right' }, children: (editId === supplier.id ? editForm.image_url : supplier.image_url) && (_jsx("img", { src: editId === supplier.id ? editForm.image_url : supplier.image_url, alt: supplier.name, style: { maxWidth: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'cover' }, onError: e => (e.currentTarget.style.display = 'none') })) })] }) }) }, supplier.id))) }), selectedSupplier && (_jsx(SupplierDisplay, { supplier: selectedSupplier, onClose: () => setSelectedSupplier(null) }))] }));
}
