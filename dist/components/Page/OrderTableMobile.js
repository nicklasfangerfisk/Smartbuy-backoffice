import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListDivider from '@mui/joy/ListDivider';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import OrderTableDetails from '../Dialog/OrderTableDetails';
function RowMenu() {
    return (_jsxs(Dropdown, { children: [_jsx(MenuButton, { slots: { root: IconButton }, slotProps: { root: { variant: 'plain', color: 'neutral', size: 'sm' } }, children: _jsx(MoreHorizRoundedIcon, {}) }), _jsxs(Menu, { size: "sm", sx: { minWidth: 140 }, children: [_jsx(MenuItem, { children: "Edit" }), _jsx(MenuItem, { children: "Rename" }), _jsx(MenuItem, { children: "Move" }), _jsx(Divider, {}), _jsx(MenuItem, { color: "danger", children: "Delete" })] })] }));
}
export default function OrderTableMobile({ orders, onRowClick, orderDetailsOpen, selectedOrder, fetchOrderItems, onCloseOrderDetails }) {
    return (_jsxs(Box, { sx: { width: '100vw', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: { xs: 2, md: 4 }, position: 'fixed', inset: 0, zIndex: 12000 }, children: [_jsx(Typography, { level: "h2", sx: { mb: 2, textAlign: 'left' }, children: "Orders" }), orders.map((listItem) => (_jsxs(List, { size: "sm", sx: { '--ListItem-paddingX': 0 }, children: [_jsxs(ListItem, { sx: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            cursor: onRowClick ? 'pointer' : undefined,
                        }, onClick: () => onRowClick === null || onRowClick === void 0 ? void 0 : onRowClick(listItem.id), children: [_jsxs(ListItemContent, { sx: { display: 'flex', gap: 2, alignItems: 'start' }, children: [_jsx(ListItemDecorator, { children: _jsx(Avatar, { size: "sm", children: listItem.customer.initial }) }), _jsxs("div", { children: [_jsx(Typography, { gutterBottom: true, sx: { fontWeight: 600 }, children: listItem.customer.name }), _jsx(Typography, { level: "body-xs", gutterBottom: true, children: listItem.customer.email }), _jsxs(Box, { sx: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 0.5,
                                                    mb: 1,
                                                }, children: [_jsx(Typography, { level: "body-xs", children: listItem.date }), _jsx(Typography, { level: "body-xs", children: "\u2022" }), _jsx(Typography, { level: "body-xs", children: listItem.id })] }), _jsx(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }, children: _jsx(RowMenu, {}) })] })] }), _jsx(Chip, { variant: "soft", size: "sm", startDecorator: {
                                    Paid: _jsx(CheckRoundedIcon, {}), Refunded: _jsx(AutorenewRoundedIcon, {}), Cancelled: _jsx(BlockIcon, {}),
                                }[listItem.status], color: {
                                    Paid: 'success', Refunded: 'neutral', Cancelled: 'danger',
                                }[listItem.status], children: listItem.status })] }), _jsx(ListDivider, {})] }, listItem.id))), _jsx(OrderTableDetails, { open: orderDetailsOpen, onClose: onCloseOrderDetails, selectedOrder: selectedOrder, fetchOrderItems: fetchOrderItems })] }));
}
