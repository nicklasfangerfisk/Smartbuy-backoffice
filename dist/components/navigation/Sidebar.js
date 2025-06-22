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
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ColorSchemeToggle from './ColorSchemeToggle';
import UserDialog from '../Dialog/UserDialog';
import { closeSidebar } from '../../utils';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
function Toggler({ defaultExpanded = false, renderToggle, children, }) {
    const [open, setOpen] = React.useState(defaultExpanded);
    return (_jsxs(React.Fragment, { children: [renderToggle({ open, setOpen }), _jsx(Box, { sx: [
                    {
                        display: 'grid',
                        transition: '0.2s ease',
                        '& > *': {
                            overflow: 'hidden',
                        },
                    },
                    open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
                ], children: children })] }));
}
export default function Sidebar({ setView, view }) {
    var _a, _b;
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null); // Auth user
    const [userProfile, setUserProfile] = useState(null); // Contextual user row
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    useEffect(() => {
        function fetchUsers() {
            return __awaiter(this, void 0, void 0, function* () {
                const { data, error } = yield supabase.from('users').select('*');
                if (!error && data)
                    setUsers(data);
            });
        }
        fetchUsers();
        function handleAuthUser(authUser) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                setUser(authUser);
                if (authUser) {
                    // Try to fetch user row
                    let { data: userRow } = yield supabase.from('users').select('*').eq('id', authUser.id).single();
                    if (!userRow) {
                        // If not found, upsert as employee by default
                        yield supabase.from('users').upsert({
                            id: authUser.id,
                            email: authUser.email,
                            name: ((_a = authUser.user_metadata) === null || _a === void 0 ? void 0 : _a.full_name) || null,
                            avatar_url: ((_b = authUser.user_metadata) === null || _b === void 0 ? void 0 : _b.avatar_url) || null,
                            role: 'employee',
                        });
                        userRow = Object.assign(Object.assign({}, authUser), { role: 'employee' });
                    }
                    // Do NOT sign out or block user here based on role; only set profile state
                    setUserProfile(userRow);
                    setEditName(userRow.name || '');
                    setEditAvatar(userRow.avatar_url || '');
                }
                else {
                    setUserProfile(null);
                    setEditName('');
                    setEditAvatar('');
                }
            });
        }
        supabase.auth.getUser().then(({ data }) => handleAuthUser(data.user));
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            var _a;
            handleAuthUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
        });
        return () => { listener === null || listener === void 0 ? void 0 : listener.subscription.unsubscribe(); };
    }, []);
    const handleEditProfile = () => __awaiter(this, void 0, void 0, function* () {
        if (!user)
            return;
        yield supabase.from('users').update({ name: editName, avatar_url: editAvatar }).eq('id', user.id);
        // Refresh user profile
        const { data: userRows } = yield supabase.from('users').select('*').eq('id', user.id).single();
        setUserProfile(userRows || null);
        setEditOpen(false);
    });
    return (_jsxs(Sheet, { className: "Sidebar", sx: {
            position: { xs: 'fixed', md: 'sticky' },
            transform: {
                xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                md: 'none',
            },
            transition: 'transform 0.4s, width 0.4s',
            zIndex: 10000,
            minHeight: '100dvh',
            width: 'var(--Sidebar-width)',
            top: 0,
            p: 2,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRight: '1px solid',
            borderColor: 'divider',
        }, children: [_jsx(GlobalStyles, { styles: (theme) => ({
                    ':root': {
                        '--Sidebar-width': '220px',
                        [theme.breakpoints.up('lg')]: {
                            '--Sidebar-width': '240px',
                        },
                    },
                }) }), _jsx(Box, { className: "Sidebar-overlay", sx: {
                    position: 'fixed',
                    zIndex: 9998,
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    opacity: 'var(--SideNavigation-slideIn)',
                    backgroundColor: 'var(--joy-palette-background-backdrop)',
                    transition: 'opacity 0.4s',
                    transform: {
                        xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
                        lg: 'translateX(-100%)',
                    },
                }, onClick: () => closeSidebar() }), _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx("img", { src: "/favicon.svg", alt: "Logo", style: { width: 28, height: 28, borderRadius: 6 } }), _jsx(Typography, { level: "title-lg", children: "Smartbuy" }), _jsx(ColorSchemeToggle, { sx: { ml: 'auto' } })] }), _jsx(Input, { size: "sm", startDecorator: _jsx(SearchRoundedIcon, {}), placeholder: "Search" }), _jsx(Box, { sx: {
                    minHeight: 0,
                    overflow: 'hidden auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    [`& .${listItemButtonClasses.root}`]: {
                        gap: 1.5,
                    },
                }, children: _jsxs(List, { size: "sm", sx: {
                        gap: 1,
                        '--List-nestedInsetStart': '30px',
                        '--ListItem-radius': (theme) => theme.vars.radius.sm,
                    }, children: [_jsx(ListItem, { nested: true, children: _jsx(Toggler, { defaultExpanded: true, renderToggle: ({ open, setOpen }) => (_jsxs(ListItemButton, { onClick: () => setOpen(!open), children: [_jsx(DashboardRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "title-sm", children: "Sales" }) }), _jsx(KeyboardArrowDownIcon, { sx: [
                                                open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                                            ] })] })), children: _jsxs(List, { sx: { gap: 0.5 }, children: [_jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'home', onClick: () => setView('home'), children: [_jsx(HomeRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Home" }) })] }) }), _jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'orders', onClick: () => setView('orders'), children: [_jsx(ShoppingCartRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Orders" }) })] }) }), _jsx(ListItem, { nested: true, children: _jsx(Toggler, { renderToggle: ({ open, setOpen }) => (_jsxs(ListItemButton, { onClick: () => setOpen(!open), children: [_jsx(AssignmentRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Deliveries" }) }), _jsx(KeyboardArrowDownIcon, { sx: [
                                                                open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                                                            ] })] })), children: _jsxs(List, { sx: { gap: 0.5 }, children: [_jsx(ListItem, { sx: { mt: 0.5 }, children: _jsx(ListItemButton, { children: "New order" }) }), _jsx(ListItem, { children: _jsx(ListItemButton, { children: "Backlog" }) }), _jsx(ListItem, { children: _jsx(ListItemButton, { children: "In progress" }) }), _jsx(ListItem, { children: _jsx(ListItemButton, { children: "Shipped" }) })] }) }) })] }) }) }), _jsx(ListItem, { nested: true, children: _jsx(Toggler, { defaultExpanded: true, renderToggle: ({ open, setOpen }) => (_jsxs(ListItemButton, { onClick: () => setOpen(!open), children: [_jsx(SupportRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "title-sm", children: "Support" }) }), _jsx(KeyboardArrowDownIcon, { sx: [
                                                open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                                            ] })] })), children: _jsxs(List, { sx: { gap: 0.5 }, children: [_jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'messages', onClick: () => setView('messages'), children: [_jsx(QuestionAnswerRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Messages" }) }), _jsx(Chip, { size: "sm", color: "primary", variant: "solid", children: "4" })] }) }), _jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'tickets', onClick: () => setView('tickets'), children: [_jsx(AssignmentRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Tickets" }) }), _jsx(Chip, { size: "sm", color: "primary", variant: "solid", children: "2" })] }) }), _jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'users', onClick: () => setView('users'), children: [_jsx(GroupRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Users" }) })] }) })] }) }) }), _jsx(ListItem, { nested: true, children: _jsx(Toggler, { defaultExpanded: true, renderToggle: ({ open, setOpen }) => (_jsxs(ListItemButton, { onClick: () => setOpen(!open), children: [_jsx(AssignmentRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "title-sm", children: "Purchasing" }) }), _jsx(KeyboardArrowDownIcon, { sx: [
                                                open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                                            ] })] })), children: _jsxs(List, { sx: { gap: 0.5 }, children: [_jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'products', onClick: () => setView('products'), children: [_jsx(AssignmentRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "Products" }) })] }) }), _jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'suppliers', onClick: () => setView('suppliers'), children: [_jsx(StorefrontIcon, { sx: { mr: 0.5 } }), "Suppliers"] }) }), _jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'purchaseorders', onClick: () => setView('purchaseorders'), children: [_jsx(AssignmentTurnedInIcon, { sx: { mr: 0.5 } }), "Purchase Orders"] }) })] }) }) }), _jsx(ListItem, { nested: true, children: _jsx(Toggler, { defaultExpanded: true, renderToggle: ({ open, setOpen }) => (_jsxs(ListItemButton, { onClick: () => setOpen(!open), children: [_jsx(AssignmentRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "title-sm", children: "Marketing" }) }), _jsx(KeyboardArrowDownIcon, { sx: [
                                                open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                                            ] })] })), children: _jsx(List, { sx: { gap: 0.5 }, children: _jsx(ListItem, { children: _jsxs(ListItemButton, { selected: view === 'smscampaigns', onClick: () => setView('smscampaigns'), children: [_jsx(AssignmentRoundedIcon, {}), _jsx(ListItemContent, { children: _jsx(Typography, { level: "body-sm", children: "SMS Campaigns" }) })] }) }) }) }) })] }) }), _jsx(Box, { sx: { mt: 'auto', mb: 2 }, children: _jsxs(List, { sx: { p: 0 }, children: [_jsx(ListItem, { sx: { p: 0, alignItems: 'stretch' }, children: _jsxs(ListItemButton, { sx: { width: '100%', alignItems: 'center', minHeight: 40 }, children: [_jsx(SettingsRoundedIcon, { sx: { mr: 1 } }), _jsx(ListItemContent, { sx: { display: 'flex', alignItems: 'center', p: 0 }, children: _jsx(Typography, { level: "body-sm", children: "Settings" }) })] }) }), _jsx(ListItem, { sx: { p: 0, alignItems: 'stretch' }, children: _jsxs(ListItemButton, { onClick: () => __awaiter(this, void 0, void 0, function* () { yield supabase.auth.signOut(); }), sx: { width: '100%', alignItems: 'center', minHeight: 40 }, children: [_jsx(LogoutRoundedIcon, { sx: { mr: 1 } }), _jsx(ListItemContent, { sx: { display: 'flex', alignItems: 'center', p: 0 }, children: _jsx(Typography, { level: "body-sm", children: "Logout" }) })] }) })] }) }), _jsx(Divider, {}), _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center', minHeight: 48 }, children: [_jsx(Avatar, { variant: "outlined", size: "sm", src: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.avatar_url) || ((_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.avatar_url) || undefined, onClick: () => setUserDialogOpen(true), sx: { cursor: 'pointer' } }), _jsxs(Box, { sx: { minWidth: 0, flex: 1, cursor: 'pointer' }, onClick: () => setUserDialogOpen(true), children: [_jsx(Typography, { level: "title-sm", children: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.name) || ((_b = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) || (user === null || user === void 0 ? void 0 : user.email) || 'Not signed in' }), _jsx(Typography, { level: "body-xs", children: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.email) || (user === null || user === void 0 ? void 0 : user.email) || '' })] })] }), _jsx(UserDialog, { open: userDialogOpen, onClose: () => setUserDialogOpen(false), userProfile: userProfile, editName: editName, setEditName: setEditName, editAvatar: editAvatar, setEditAvatar: setEditAvatar, onSave: handleEditProfile })] }));
}
