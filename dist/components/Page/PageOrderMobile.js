import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import GeneralTableMobile from '../general/GeneralTableMobile';
function RowMenu() {
    return (_jsxs(Dropdown, { children: [_jsx(MenuButton, { slots: { root: IconButton }, slotProps: { root: { variant: 'plain', color: 'neutral', size: 'sm' } }, children: _jsx(MoreHorizRoundedIcon, {}) }), _jsxs(Menu, { size: "sm", sx: { minWidth: 140 }, children: [_jsx(MenuItem, { children: "Edit" }), _jsx(MenuItem, { children: "Rename" }), _jsx(MenuItem, { children: "Move" }), _jsx(Divider, {}), _jsx(MenuItem, { color: "danger", children: "Delete" })] })] }));
}
export default function OrderTableMobile({ orders, onRowClick, orderDetailsOpen, selectedOrder, fetchOrderItems, onCloseOrderDetails }) {
    return (_jsxs(Box, { sx: { width: '100vw', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: { xs: 2, md: 4 }, position: 'fixed', inset: 0, zIndex: 12000 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2, textAlign: 'left' }, children: "Orders" }), _jsx(GeneralTableMobile, { items: orders, renderItem: (order) => (_jsxs(Box, { children: [_jsx(Typography, { children: order.date }), _jsx(Typography, { children: order.status }), _jsx(Typography, { children: order.customer.name })] })), ariaLabel: "Orders Mobile View" }), _jsx(OrderTableDetails, { open: orderDetailsOpen, onClose: onCloseOrderDetails, selectedOrder: selectedOrder, fetchOrderItems: fetchOrderItems })] }));
}
