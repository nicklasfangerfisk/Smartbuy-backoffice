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
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import IconButton from '@mui/joy/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import Avatar from '@mui/joy/Avatar';
import ProductTableForm from '../Dialog/ProductTableForm';
export default function ProductTableMobile() {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [editProduct, setEditProduct] = React.useState(null);
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
    const handleDelete = (uuid) => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        yield supabase.from('Products').delete().eq('uuid', uuid);
        setProducts(products.filter((p) => p.uuid !== uuid));
        setLoading(false);
    });
    const handleAddDialogSave = (values) => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        yield supabase.from('Products').insert([
            {
                ProductName: values.ProductName,
                SalesPrice: parseFloat(values.SalesPrice),
                CostPrice: parseFloat(values.CostPrice),
                CreatedAt: new Date().toISOString(),
            },
        ]);
        const { data } = yield supabase.from('Products').select('*');
        if (data)
            setProducts(data);
        setAddDialogOpen(false);
        setLoading(false);
    });
    const handleEditDialogSave = (values) => __awaiter(this, void 0, void 0, function* () {
        if (!editProduct)
            return;
        setLoading(true);
        yield supabase.from('Products').update({
            ProductName: values.ProductName,
            SalesPrice: parseFloat(values.SalesPrice),
            CostPrice: parseFloat(values.CostPrice),
        }).eq('uuid', editProduct.uuid);
        const { data } = yield supabase.from('Products').select('*');
        if (data)
            setProducts(data);
        setEditDialogOpen(false);
        setEditProduct(null);
        setLoading(false);
    });
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2 }, children: "Products" }), _jsx(Button, { onClick: () => setAddDialogOpen(true), sx: { mb: 2 }, variant: "solid", children: "Add Product" }), _jsx(ProductTableForm, { open: addDialogOpen, onClose: () => setAddDialogOpen(false), product: null, onSave: handleAddDialogSave }), _jsx(ProductTableForm, { open: editDialogOpen, onClose: () => { setEditDialogOpen(false); setEditProduct(null); }, product: editProduct, onSave: handleEditDialogSave }), _jsxs(List, { children: [products.map((product) => (_jsxs(ListItem, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(ListItemDecorator, { children: product.ImageUrl ? (_jsx(Avatar, { src: product.ImageUrl })) : (_jsx(Avatar, { children: _jsx(ImageIcon, {}) })) }), _jsxs(ListItemContent, { children: [_jsx(Typography, { level: "title-md", children: product.ProductName }), _jsxs(Typography, { level: "body-sm", children: ["Sales: ", product.SalesPrice, " | Cost: ", product.CostPrice] }), _jsx(Typography, { level: "body-xs", color: "neutral", children: product.CreatedAt })] }), _jsx(IconButton, { size: "sm", color: "primary", onClick: () => { setEditProduct(product); setEditDialogOpen(true); }, children: _jsx(EditIcon, {}) }), _jsx(IconButton, { size: "sm", color: "danger", onClick: () => handleDelete(product.uuid), children: _jsx(DeleteIcon, {}) })] }, product.uuid))), products.length === 0 && !loading && (_jsx(Typography, { level: "body-sm", sx: { textAlign: 'center', color: '#888', width: '100%' }, children: "No products found." }))] })] }));
}
