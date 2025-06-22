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
/*
Layout & Responsive Design Refactor Documentation
-------------------------------------------------

Problem:
- Content from multiple pages (e.g., dashboard, products) was visible simultaneously due to insufficient layout isolation.
- Responsive design was inconsistent, with some manual JS checks and static layouts.
- Build errors (e.g., Vercel) due to incorrect prop usage in mobile components.

Solution (June 2025):
- All main page components (including this one) now wrap their desktop views in a full-size Box/Sheet/Card to ensure strict page isolation and prevent bleed-through.
- Mobile/desktop views are conditionally rendered using MUI's useMediaQuery.
- Removed invalid props from mobile components (e.g., ProductTableMobile).
- Responsive design is enforced using MUI breakpoints and layout containers (Box, Card, etc.).

Best Practices Going Forward:
- Use a single layout shell (App-level) and strict router-based navigation to ensure only one page is visible at a time.
- Use MUI's responsive utilities (breakpoints, sx, useMediaQuery) for dynamic layout, not manual window checks.
- Always wrap main content in a container that covers the background and prevents layout bleed-through.
- Avoid passing unnecessary props to mobile/desktop components; let them manage their own state if possible.
- Document any major layout or responsive changes in the codebase for future maintainers.

Next Steps (Optional):
- Migrate to a dynamic, router-based layout if not already in place.
- Refactor all pages/components to follow this strict layout and responsive strategy.
- Review for any remaining layout or prop errors.
*/
import * as React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import ProductTableForm from '../Dialog/ProductTableForm';
import useMediaQuery from '@mui/material/useMediaQuery';
import ProductTableMobile from './PageProductMobile';
export default function ProductTable() {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [form, setForm] = React.useState({
        ProductName: '',
        SalesPrice: '',
        CostPrice: '',
    });
    const [submitting, setSubmitting] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [editProduct, setEditProduct] = React.useState(null);
    const [imageFile, setImageFile] = React.useState(null);
    const [imageUploading, setImageUploading] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const isMobile = useMediaQuery('(max-width: 600px)');
    React.useEffect(() => {
        function fetchProducts() {
            return __awaiter(this, void 0, void 0, function* () {
                setLoading(true);
                const { data, error } = yield supabase.from('Products').select('*');
                if (!error && data) {
                    setProducts(data);
                }
                setLoading(false);
            });
        }
        fetchProducts();
    }, []);
    const handleChange = (e) => {
        setForm(Object.assign(Object.assign({}, form), { [e.target.name]: e.target.value }));
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };
    const uploadImageToStorage = (file, productId) => __awaiter(this, void 0, void 0, function* () {
        const fileExt = file.name.split('.').pop();
        const filePath = `${productId}_${Date.now()}.${fileExt}`;
        // Remove any existing file with the same path (optional, for overwrite safety)
        yield supabase.storage.from('productimages').remove([filePath]);
        const { error: uploadError } = yield supabase.storage.from('productimages').upload(filePath, file, { upsert: true });
        if (!uploadError) {
            // Get the public URL
            const { data: publicUrlData } = supabase.storage.from('productimages').getPublicUrl(filePath);
            const publicUrl = publicUrlData.publicUrl;
            // Update the product row with the public URL
            yield supabase.from('Products').update({ ImageUrl: publicUrl }).eq('id', productId);
        }
        return { error: uploadError, filePath };
    });
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setSubmitting(true);
        // Insert product first
        const { data, error } = yield supabase.from('Products').insert([
            {
                ProductName: form.ProductName,
                SalesPrice: parseFloat(form.SalesPrice),
                CostPrice: parseFloat(form.CostPrice),
                CreatedAt: new Date().toISOString(),
            },
        ]).select();
        let newProductId = data && data[0] && data[0].id;
        // Upload image if present
        if (!error && imageFile && newProductId) {
            setImageUploading(true);
            yield uploadImageToStorage(imageFile, newProductId);
            setImageUploading(false);
        }
        setSubmitting(false);
        if (!error) {
            setForm({ ProductName: '', SalesPrice: '', CostPrice: '' });
            setImageFile(null);
            // Refresh products
            const { data } = yield supabase.from('Products').select('*');
            if (data)
                setProducts(data);
        }
    });
    const handleDelete = (uuid) => __awaiter(this, void 0, void 0, function* () {
        setSubmitting(true);
        const { error } = yield supabase.from('Products').delete().eq('uuid', uuid);
        setSubmitting(false);
        if (!error) {
            setProducts(products.filter((p) => p.uuid !== uuid));
        }
    });
    const startEdit = (product) => {
        setEditProduct(product);
        setEditDialogOpen(true);
    };
    const handleEditDialogSave = (values) => __awaiter(this, void 0, void 0, function* () {
        if (!editProduct)
            return;
        setSubmitting(true);
        console.log('Editing product:', editProduct);
        console.log('Form values:', values);
        const { error, data } = yield supabase.from('Products').update({
            ProductName: values.ProductName,
            SalesPrice: parseFloat(values.SalesPrice),
            CostPrice: parseFloat(values.CostPrice),
        }).eq('uuid', editProduct.uuid).select();
        if (error) {
            console.error('Supabase update error:', error);
            alert('Failed to update product: ' + error.message);
        }
        else {
            console.log('Update result:', data);
        }
        setSubmitting(false);
        setEditDialogOpen(false);
        setEditProduct(null);
        if (!error) {
            // Refresh products
            const { data } = yield supabase.from('Products').select('*');
            if (data)
                setProducts(data);
        }
    });
    const handleAddDialogSave = (values) => __awaiter(this, void 0, void 0, function* () {
        setSubmitting(true);
        const { data, error } = yield supabase.from('Products').insert([
            {
                ProductName: values.ProductName,
                SalesPrice: parseFloat(values.SalesPrice),
                CostPrice: parseFloat(values.CostPrice),
                CreatedAt: new Date().toISOString(),
            },
        ]).select();
        setSubmitting(false);
        setAddDialogOpen(false);
        if (!error) {
            // Refresh products
            const { data } = yield supabase.from('Products').select('*');
            if (data)
                setProducts(data);
        }
    });
    // Filter products by search
    const filteredProducts = products.filter((product) => { var _a; return (_a = product.ProductName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase()); });
    if (isMobile) {
        return _jsx(ProductTableMobile, {});
    }
    return (_jsxs(Box, { sx: { width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2 }, children: "Products" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 2 }, children: [_jsx(Input, { placeholder: "Search products...", sx: { flex: 1 }, value: search, onChange: e => setSearch(e.target.value) }), _jsx(Button, { onClick: () => setAddDialogOpen(true), loading: submitting || imageUploading, disabled: submitting || imageUploading, variant: "solid", children: "Add Product" })] }), _jsx(ProductTableForm, { open: addDialogOpen, onClose: () => setAddDialogOpen(false), product: null, onSave: handleAddDialogSave }), _jsx(ProductTableForm, { open: editDialogOpen, onClose: () => { setEditDialogOpen(false); setEditProduct(null); }, product: editProduct, onSave: handleEditDialogSave }), _jsxs(Card, { children: [loading && _jsx(LinearProgress, {}), _jsxs(Table, { "aria-label": "Products", sx: { minWidth: 700 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Image" }), _jsx("th", { children: "Product" }), _jsx("th", { children: "Sales price" }), _jsx("th", { children: "Cost price" }), _jsx("th", { children: "Created" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [filteredProducts.map((product) => (_jsxs("tr", { children: [_jsx("td", { children: product.uuid }), _jsx("td", { children: product.ImageUrl ? (_jsx("img", { src: product.ImageUrl, alt: product.ProductName, style: { width: 48, height: 48, objectFit: 'cover', borderRadius: 4 } })) : (_jsx("span", { style: { color: '#aaa' }, children: "No image" })) }), _jsx("td", { children: product.ProductName }), _jsx("td", { children: product.SalesPrice }), _jsx("td", { children: product.CostPrice }), _jsx("td", { children: product.CreatedAt }), _jsxs("td", { children: [_jsx(IconButton, { size: "sm", color: "primary", onClick: () => startEdit(product), disabled: submitting, children: _jsx(EditIcon, {}) }), _jsx(IconButton, { size: "sm", color: "danger", onClick: () => handleDelete(product.uuid), disabled: submitting, children: _jsx(DeleteIcon, {}) }), _jsxs(IconButton, { component: "label", size: "sm", color: "neutral", disabled: submitting || imageUploading, sx: { minWidth: 0, px: 1 }, children: [_jsx("input", { type: "file", accept: "image/*", hidden: true, onChange: (e) => __awaiter(this, void 0, void 0, function* () {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        setImageUploading(true);
                                                                        const file = e.target.files[0];
                                                                        yield uploadImageToStorage(file, product.id);
                                                                        // Refresh products after upload
                                                                        const { data } = yield supabase.from('Products').select('*');
                                                                        if (data)
                                                                            setProducts(data);
                                                                        setImageUploading(false);
                                                                    }
                                                                }) }), _jsx(ImageIcon, {})] })] })] }, product.uuid))), filteredProducts.length === 0 && !loading && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', color: '#888' }, children: "No products found." }) }))] })] })] })] }));
}
