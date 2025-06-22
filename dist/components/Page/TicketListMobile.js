import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
const statusColors = {
    Open: { color: 'success', label: 'Open' },
    Pending: { color: 'warning', label: 'Pending' },
    Closed: { color: 'neutral', label: 'Closed' },
};
export default function TicketListMobile({ tickets, onRowClick, selectedId, status }) {
    // Only show the beach splash if there are tickets, all are closed, and the filter is not set to 'Closed' or 'All'
    const allClosedSplash = tickets.length > 0 && tickets.every(t => t.status === 'Closed') && (status === 'Open');
    return (_jsx(Box, { sx: { p: 0, background: '#fff', minHeight: '100vh' }, children: allClosedSplash ? (_jsxs(Box, { sx: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 2,
            }, children: [_jsx(BeachAccessIcon, { sx: { fontSize: 80, color: '#1976d2' } }), _jsx(Typography, { level: "h3", sx: { fontWeight: 700, textAlign: 'center' }, children: "All done, you can now go to the beach" })] })) : (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 0 }, children: [tickets.map((ticket, idx) => {
                    var _a, _b, _c;
                    return (_jsxs(React.Fragment, { children: [_jsxs(Box, { sx: {
                                    px: 2,
                                    pt: 2,
                                    pb: 1.5,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    cursor: onRowClick ? 'pointer' : undefined,
                                    background: selectedId === ticket.id ? '#f0f4ff' : 'transparent',
                                    transition: 'background 0.2s',
                                }, onClick: () => onRowClick === null || onRowClick === void 0 ? void 0 : onRowClick(ticket.id), children: [_jsx(Avatar, { size: "sm", sx: { bgcolor: '#e3e3e3', color: '#333', fontWeight: 700, mt: 0.5 }, children: ((_a = ticket.requester_name) === null || _a === void 0 ? void 0 : _a[0]) || '?' }), _jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Typography, { level: "title-sm", sx: { fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }, children: ticket.subject }), _jsx(Typography, { level: "body-xs", color: "neutral", sx: { mb: 0.5, wordBreak: 'break-word' }, children: ticket.requester_name }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }, children: [_jsx(Typography, { level: "body-xs", color: "neutral", children: ticket.updated_at ? new Date(ticket.updated_at).toISOString().slice(0, 10) : '' }), _jsx(Typography, { level: "body-xs", color: "neutral", children: "\u2022" }), _jsx(Typography, { level: "body-xs", color: "neutral", sx: { wordBreak: 'break-all' }, children: ticket.id })] })] }), _jsx(Chip, { variant: "soft", size: "sm", color: (_b = statusColors[ticket.status]) === null || _b === void 0 ? void 0 : _b.color, sx: { fontWeight: 600, px: 1.5, py: 0.5, ml: 1 }, children: (_c = statusColors[ticket.status]) === null || _c === void 0 ? void 0 : _c.label })] }), _jsx(Box, { sx: { pl: 7, pt: 1, pb: 0.5, color: 'text.secondary', fontSize: 18, fontWeight: 400 }, children: "..." }), idx < tickets.length - 1 && _jsx(Divider, { sx: { mx: 2, my: 0.5 } })] }, ticket.id));
                }), tickets.length === 0 && (_jsx(Typography, { color: "neutral", sx: { textAlign: 'center', mt: 4 }, children: "No tickets found." }))] })) }));
}
