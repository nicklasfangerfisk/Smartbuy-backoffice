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
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/joy/Box';
export default function UsersTable() {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        function fetchUsers() {
            return __awaiter(this, void 0, void 0, function* () {
                setLoading(true);
                setError(null);
                // Get current user from Supabase Auth
                const { data: { user: authUser }, error: authError, } = yield supabase.auth.getUser();
                if (authError || !authUser) {
                    setError('Could not get current user');
                    setLoading(false);
                    return;
                }
                // Fetch current user's role from users table
                console.log('UsersTable: authUser.id', authUser.id);
                const { data: userRow, error: userError, status, statusText } = yield supabase
                    .from('users')
                    .select('role')
                    .eq('id', authUser.id)
                    .single();
                if (userError || !userRow) {
                    // Log error for debugging
                    console.error('UsersTable: Could not get user role', { userError, userRow, authUserId: authUser.id, status, statusText });
                    setError('Could not get user role');
                    setLoading(false);
                    return;
                }
                const role = userRow.role;
                let usersData = [];
                let usersError = null;
                if (role === 'employee') {
                    // Employees see all users
                    const { data, error } = yield supabase.from('users').select('*');
                    usersData = data || [];
                    usersError = error;
                }
                else {
                    // Customers see only themselves
                    const { data, error } = yield supabase.from('users').select('*').eq('id', authUser.id);
                    usersData = data || [];
                    usersError = error;
                }
                if (!usersError && usersData) {
                    setUsers(usersData);
                }
                else if (usersError) {
                    setError(typeof usersError === 'string' ? usersError : (usersError.message || 'Failed to fetch users'));
                }
                setLoading(false);
            });
        }
        fetchUsers();
    }, []);
    function copyToClipboard(value) {
        navigator.clipboard.writeText(value);
    }
    // Responsive: show a card view for users on mobile (xs), table for sm and up
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    if (isMobile) {
        return (_jsxs(Sheet, { sx: {
                width: '100%',
                borderRadius: 'sm',
                overflow: 'auto',
                mt: 1,
                p: 1,
                minHeight: '60dvh',
                boxShadow: 'sm',
                maxWidth: '100vw',
                bgcolor: 'background.body',
            }, children: [_jsx(Typography, { level: "h3", sx: { mb: 1, fontSize: 20 }, children: "Users" }), _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: users.map((user) => (_jsxs(Sheet, { variant: "outlined", sx: { p: 1.5, borderRadius: 'sm', boxShadow: 'xs', display: 'flex', flexDirection: 'column', gap: 0.5 }, children: [_jsx(Typography, { level: "body-xs", fontWeight: "lg", children: user.name || '-' }), _jsx(Typography, { level: "body-xs", sx: { color: 'text.secondary' }, children: user.email || '-' }), _jsxs(Typography, { level: "body-xs", children: ["Role: ", user.role || '-'] }), _jsxs(Typography, { level: "body-xs", children: ["ID: ", user.id || '-'] }), _jsxs(Typography, { level: "body-xs", children: ["Created: ", user.created_at ? new Date(user.created_at).toLocaleString() : '-'] }), _jsxs(Typography, { level: "body-xs", children: ["Last Login: ", user.last_login ? new Date(user.last_login).toLocaleString() : '-'] }), _jsxs(Typography, { level: "body-xs", children: ["Phone: ", user.phone || '-'] })] }, user.id))) }), loading && _jsx(Typography, { level: "body-xs", children: "Loading..." }), error && _jsxs(Typography, { color: "danger", level: "body-xs", children: ["Error: ", error] })] }));
    }
    return (_jsxs(Sheet, { sx: {
            width: '100%',
            minHeight: '100dvh',
            borderRadius: 'sm',
            overflow: 'auto',
            mt: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 2 },
            boxShadow: { xs: 'sm', sm: 'md' },
            maxWidth: { xs: '100vw', sm: '100%' },
            bgcolor: 'background.body',
        }, children: [_jsx(Typography, { level: "h3", sx: { mb: { xs: 1, sm: 2 }, fontSize: { xs: 20, sm: 28 } }, children: "Users" }), _jsxs(Table, { stickyHeader: true, hoverRow: true, borderAxis: "both", size: "sm", sx: {
                    '--TableCell-height': { xs: '40px', sm: '56px' },
                    '& td, & th': { verticalAlign: 'middle', p: { xs: 0.5, sm: 1.5 }, fontSize: { xs: 12, sm: 16 } },
                    minWidth: { xs: 360, sm: 800 },
                    width: '100%',
                    tableLayout: 'fixed',
                    wordBreak: 'break-word',
                }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { minWidth: 80 }, children: "ID" }), _jsx("th", { style: { minWidth: 80 }, children: "Name" }), _jsx("th", { style: { minWidth: 120 }, children: "Email" }), _jsx("th", { style: { minWidth: 60 }, children: "Role" }), _jsx("th", { style: { minWidth: 100 }, children: "Created On" }), _jsx("th", { style: { minWidth: 100 }, children: "Last Login" }), _jsx("th", { style: { minWidth: 80 }, children: "Phone" })] }) }), _jsx("tbody", { children: users.map((user) => (_jsxs("tr", { style: {
                                display: 'table-row',
                                wordBreak: 'break-word',
                            }, children: [_jsx("td", { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }, children: [_jsx(Typography, { level: "body-xs", sx: { wordBreak: 'break-all' }, children: user.id || '-' }), user.id && (_jsx(IconButton, { size: "sm", sx: { '--IconButton-size': '22px', minWidth: 22, minHeight: 22, p: 0.25 }, onClick: () => copyToClipboard(user.id), title: "Copy ID", children: _jsx(ContentCopyIcon, { fontSize: "inherit", sx: { fontSize: 14 } }) }))] }) }), _jsx("td", { children: _jsx(Typography, { level: "body-xs", children: user.name || '-' }) }), _jsx("td", { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }, children: [_jsx(Typography, { level: "body-xs", sx: { wordBreak: 'break-all' }, children: user.email || '-' }), user.email && (_jsx(IconButton, { size: "sm", sx: { '--IconButton-size': '22px', minWidth: 22, minHeight: 22, p: 0.25 }, onClick: () => copyToClipboard(user.email), title: "Copy Email", children: _jsx(ContentCopyIcon, { fontSize: "inherit", sx: { fontSize: 14 } }) }))] }) }), _jsx("td", { children: _jsx(Typography, { level: "body-xs", children: user.role || '-' }) }), _jsx("td", { children: _jsx(Typography, { level: "body-xs", children: user.created_at ? new Date(user.created_at).toLocaleString() : '-' }) }), _jsx("td", { children: _jsx(Typography, { level: "body-xs", children: user.last_login ? new Date(user.last_login).toLocaleString() : '-' }) }), _jsx("td", { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }, children: [_jsx(Typography, { level: "body-xs", children: user.phone || '-' }), user.phone && (_jsx(IconButton, { size: "sm", sx: { '--IconButton-size': '22px', minWidth: 22, minHeight: 22, p: 0.25 }, onClick: () => copyToClipboard(user.phone), title: "Copy Phone", children: _jsx(ContentCopyIcon, { fontSize: "inherit", sx: { fontSize: 14 } }) }))] }) })] }, user.id))) })] }), loading && _jsx(Typography, { level: "body-xs", children: "Loading..." }), error && _jsxs(Typography, { color: "danger", level: "body-xs", children: ["Error: ", error] })] }));
}
