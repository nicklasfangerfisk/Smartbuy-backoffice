import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Autocomplete from '@mui/joy/Autocomplete';
import Box from '@mui/joy/Box';
export default function PurchaseOrderItemsEditor({ orderId, editable, onItemsChange, initialItems = [] }) {
    const [items, setItems] = React.useState(initialItems);
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
        supabase.from('Products').select('uuid, ProductName').then(({ data }) => {
            setProducts(data || []);
        });
    }, []);
    const handleItemChange = (idx, field, value) => {
        setItems(items => {
            const newItems = items.map((item, i) => i === idx ? Object.assign(Object.assign({}, item), { [field]: value }) : item);
            if (onItemsChange)
                onItemsChange(newItems);
            return newItems;
        });
    };
    const handleAddItem = () => {
        setItems(items => {
            const newItems = [...items, { product_id: null, quantity: 1, unit_price: 0 }];
            if (onItemsChange)
                onItemsChange(newItems);
            return newItems;
        });
    };
    const handleRemoveItem = (idx) => {
        setItems(items => {
            const newItems = items.filter((_, i) => i !== idx);
            if (onItemsChange)
                onItemsChange(newItems);
            return newItems;
        });
    };
    React.useEffect(() => {
        if (onItemsChange)
            onItemsChange(items);
        // eslint-disable-next-line
    }, [items]);
    return (_jsxs(Box, { sx: { mt: 2 }, children: [_jsxs(Table, { size: "sm", sx: { minWidth: 500 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Product" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Unit Price" }), _jsx("th", { children: "Total" }), editable && _jsx("th", {})] }) }), _jsx("tbody", { children: items.map((item, idx) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(Autocomplete, { options: products, getOptionLabel: (option) => option.ProductName, value: products.find((p) => p.uuid === item.product_id) || null, onChange: (_e, value) => handleItemChange(idx, 'product_id', value ? value.uuid : null), disabled: !editable, sx: { minWidth: 180 }, isOptionEqualToValue: (option, value) => option.uuid === value.uuid, required: true }) }), _jsx("td", { children: _jsx(Input, { type: "number", value: item.quantity, onChange: e => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value))), disabled: !editable, sx: { width: 80 }, required: true }) }), _jsx("td", { children: _jsx(Input, { type: "number", value: item.unit_price, onChange: e => handleItemChange(idx, 'unit_price', Math.max(0, Number(e.target.value))), disabled: !editable, sx: { width: 100 }, required: true }) }), _jsx("td", { children: (item.quantity * item.unit_price).toFixed(2) }), editable && (_jsx("td", { children: _jsx(Button, { size: "sm", color: "danger", onClick: () => handleRemoveItem(idx), children: "Remove" }) }))] }, idx))) })] }), editable && (_jsx(Button, { size: "sm", variant: "soft", onClick: handleAddItem, sx: { mt: 1 }, children: "Add Item" }))] }));
}
