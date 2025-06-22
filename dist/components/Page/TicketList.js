var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { useTickets } from '../hooks/useTickets';
import { supabase } from '../../utils/supabaseClient';
import TicketForm from '../Dialog/TicketForm';
import { FormControl, Textarea } from '@mui/joy';
import { Stack } from '@mui/system';
import { Sheet } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import TicketListMobile from './TicketListMobile';
import Snackbar from '@mui/joy/Snackbar';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { useTicketActivities } from '../hooks/useTickets';
export default function TicketList(_a) {
    var props = __rest(_a, []);
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState('Open');
    const [createOpen, setCreateOpen] = React.useState(false);
    const { tickets, loading, error, refresh } = useTickets();
    const filtered = tickets.filter((ticket) => {
        var _a, _b;
        const statusMatch = (status === 'All' || ticket.status === status);
        const subjectMatch = (_a = ticket.subject) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase());
        const requesterMatch = (_b = ticket.requester_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase());
        return statusMatch && (subjectMatch || requesterMatch);
    });
    const [selectedId, setSelectedId] = React.useState(null);
    const isMobile = useMediaQuery('(max-width:600px)');
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    React.useEffect(() => {
        if (!isMobile && !selectedId && filtered.length > 0) {
            setSelectedId(filtered[0].id);
        }
        // Do not clear selectedId on mobile
        // eslint-disable-next-line
    }, [filtered, isMobile]);
    const selectedTicket = filtered.find((t) => t.id === selectedId) || filtered[0];
    const { activities, refresh: refreshActivities } = useTicketActivities((selectedTicket === null || selectedTicket === void 0 ? void 0 : selectedTicket.id) || null);
    const [activityMessage, setActivityMessage] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [sendError, setSendError] = React.useState(null);
    const messagesEndRef = React.useRef(null);
    React.useEffect(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [activities]);
    function handleSendActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!activityMessage.trim() || !selectedTicket)
                return;
            setSending(true);
            setSendError(null);
            const payload = {
                ticket_id: selectedTicket.id,
                activity_type: 'chat',
                message: activityMessage,
                direction: 'outbound',
                timestamp: new Date().toISOString(),
            };
            const { error } = yield supabase.from('ticketactivities').insert(payload);
            if (error) {
                setSendError(error.message || JSON.stringify(error));
                setSending(false);
                return;
            }
            setActivityMessage('');
            setSending(false);
            refreshActivities();
        });
    }
    function handleResolveTicket(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = yield supabase.from('tickets').update({ status: 'Closed' }).eq('id', ticketId);
            if (!error) {
                setSnackbarMessage('Ticket was resolved successfully');
                setSnackbarOpen(true);
                refresh();
            }
            // Optionally handle error
        });
    }
    function handleReopenTicket(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = yield supabase.from('tickets').update({ status: 'Open' }).eq('id', ticketId);
            if (!error) {
                setSnackbarMessage('The ticket was reopened successfully');
                setSnackbarOpen(true);
                setStatus('Open');
                setSelectedId(ticketId);
                refresh();
            }
            // Optionally handle error
        });
    }
    // Formatting helpers for message input
    function insertAtCursor(before, after = before) {
        const textarea = document.querySelector('textarea[aria-label="Message"]');
        if (!textarea)
            return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = activityMessage;
        const selected = value.substring(start, end);
        let newValue = value.substring(0, start) + before + selected + after + value.substring(end);
        setActivityMessage(newValue);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length + selected.length);
        }, 0);
    }
    function handleBold() { insertAtCursor('**', '**'); }
    function handleItalic() { insertAtCursor('_', '_'); }
    function handleStrike() { insertAtCursor('~~', '~~'); }
    function handleBullet() { insertAtCursor('\n- ', ''); }
    const allowedStatuses = ['Open', 'Pending', 'Closed'];
    // Prepare mobile items
    const mobileTickets = filtered.map((ticket) => {
        var _a, _b;
        return ({
            id: ticket.id,
            subject: ticket.subject,
            status: allowedStatuses.includes(ticket.status) ? ticket.status : 'Open',
            requester_name: (_a = ticket.requester_name) !== null && _a !== void 0 ? _a : '',
            updated_at: (_b = ticket.updated_at) !== null && _b !== void 0 ? _b : undefined,
        });
    });
    const allClosed = filtered.length > 0 && filtered.every((t) => t.status === 'Closed');
    // Only show the beach splash if there are tickets, all are closed, and the filter is set to 'Open'
    const allClosedSplash = filtered.length > 0 && filtered.every(t => t.status === 'Closed') && (status === 'Open');
    if (isMobile) {
        if (allClosedSplash) {
            return (_jsxs(Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: 2,
                }, children: [_jsx(BeachAccessIcon, { sx: { fontSize: 80, color: '#1976d2' } }), _jsx(Typography, { level: "h3", sx: { fontWeight: 700, textAlign: 'center' }, children: "All done, you can now go to the beach" })] }));
        }
        // Show list if no ticket selected, otherwise show chat
        if (!selectedId) {
            return (_jsx(TicketListMobile, { tickets: mobileTickets, onRowClick: id => setSelectedId(id), selectedId: selectedId }));
        }
        // Show chat view for selected ticket (reuse desktop chat UI)
        return (_jsxs(Box, { sx: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                zIndex: 1200,
                background: '#f7f8fa',
                pb: '56px',
            }, children: [!isMobile && selectedTicket && (_jsx(Box, { sx: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.body',
                        zIndex: 1,
                    }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Avatar, { size: "md" }), _jsxs(Box, { children: [_jsx(Typography, { level: "title-md", sx: { fontWeight: 'lg' }, children: selectedTicket.requester_name || 'User' }), _jsxs(Typography, { level: "body-xs", color: "neutral", children: ["@", selectedTicket.requester_name || 'user'] })] })] }) })), _jsxs(Box, { sx: { flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f7f8fa', minHeight: 0 }, children: [activities.map((act, idx) => {
                            const isOutbound = act.direction === 'outbound';
                            return (_jsxs(Box, { sx: { display: 'flex', flexDirection: isOutbound ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1.5 }, children: [!isOutbound && (_jsx(Avatar, { size: "sm" })), _jsxs(Box, { sx: {
                                            maxWidth: '70%',
                                            minWidth: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isOutbound ? 'flex-end' : 'flex-start',
                                        }, children: [_jsx(Box, { sx: {
                                                    p: 1.25,
                                                    borderRadius: 'lg',
                                                    boxShadow: 'sm',
                                                    mb: 0.5,
                                                    backgroundColor: isOutbound ? 'var(--joy-palette-primary-solidBg)' : 'background.body',
                                                    color: isOutbound ? '#fff' : 'var(--joy-palette-text-primary)',
                                                }, children: _jsx(Typography, { level: "body-sm", sx: { color: isOutbound ? '#fff' : 'inherit' }, children: act.message }) }), _jsxs(Box, { sx: { display: 'flex', gap: 1, mb: 0.25 }, children: [_jsx(Typography, { level: "body-xs", children: act.sender_name || (isOutbound ? 'You' : 'User') }), _jsx(Typography, { level: "body-xs", sx: { color: 'text.tertiary' }, children: act.timestamp ? new Date(act.timestamp).toLocaleString() : '' })] })] }), isOutbound && (_jsx(Avatar, { size: "sm" }))] }, act.id || idx));
                        }), _jsx("div", { ref: messagesEndRef }), activities.length === 0 && (_jsx(Typography, { color: "neutral", children: "No communication yet." }))] }), _jsxs(Box, { sx: {
                        p: 2,
                        background: '#fff',
                        borderTop: '1px solid #e0e0e0',
                        borderRadius: 0,
                        boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        zIndex: 2,
                    }, children: [_jsx(FormControl, { sx: { m: 0 }, children: _jsx(Textarea, { placeholder: "Type something here\u2026", "aria-label": "Message", value: activityMessage, minRows: 3, maxRows: 10, onChange: e => setActivityMessage(e.target.value), onKeyDown: event => {
                                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                                        handleSendActivity();
                                    }
                                }, disabled: selectedTicket.status === 'Closed', endDecorator: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, pr: 1, pl: 1, borderTop: '1px solid', borderColor: 'divider', background: 'transparent', gap: 1, width: '100%' }, children: [_jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleBold, disabled: selectedTicket.status === 'Closed', children: _jsx(FormatBoldRoundedIcon, {}) }), _jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleItalic, disabled: selectedTicket.status === 'Closed', children: _jsx(FormatItalicRoundedIcon, {}) }), _jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleStrike, disabled: selectedTicket.status === 'Closed', children: _jsx(StrikethroughSRoundedIcon, {}) }), _jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleBullet, disabled: selectedTicket.status === 'Closed', children: _jsx(FormatListBulletedRoundedIcon, {}) })] }), _jsx(Box, { sx: { flex: 1 } }), _jsx(Button, { size: "sm", color: "primary", sx: { alignSelf: 'center', borderRadius: 'sm', ml: 1 }, endDecorator: _jsx(SendRoundedIcon, {}), onClick: handleSendActivity, disabled: sending || !activityMessage.trim() || selectedTicket.status === 'Closed', title: selectedTicket.status === 'Closed' ? 'Ticket needs to be reopened to respond' : '', children: "Send" })] }), sx: {
                                    '& textarea:first-of-type': {
                                        minHeight: 72,
                                        background: '#f7f8fa',
                                    },
                                    background: '#f7f8fa',
                                    borderRadius: 'md',
                                    boxShadow: 'xs',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                } }) }), sendError && _jsx(Typography, { color: "danger", sx: { px: 2, pb: 1 }, children: sendError })] })] }));
    }
    // Desktop view
    if (allClosedSplash) {
        return (_jsxs(Box, { sx: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 2,
            }, children: [_jsx(BeachAccessIcon, { sx: { fontSize: 80, color: '#1976d2' } }), _jsx(Typography, { level: "h3", sx: { fontWeight: 700, textAlign: 'center' }, children: "All done, you can now go to the beach" })] }));
    }
    if (!isMobile && filtered.length === 0) {
        return (_jsxs(Box, { sx: { display: 'flex', height: '100%', minHeight: 0, background: '#f7f8fa', borderRadius: 2, overflow: 'hidden', boxShadow: 1, width: '100%', maxWidth: '100vw' }, children: [_jsxs(Box, { sx: { width: 340, minWidth: 0, maxWidth: 340, borderRight: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }, children: [_jsxs(Box, { sx: { p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { level: "h4", children: "Tickets" }), _jsx(Button, { size: "sm", onClick: () => setCreateOpen(true), variant: "solid", children: "New" })] }), _jsx(Input, { placeholder: "Search tickets...", startDecorator: _jsx(SearchRoundedIcon, {}), value: search, onChange: e => setSearch(e.target.value), sx: { width: '100%' } }), _jsxs(Select, { size: "sm", value: status, onChange: (_, value) => setStatus(value), sx: { mt: 1, width: '100%' }, children: [_jsx(Option, { value: "Open", children: "Open" }), _jsx(Option, { value: "Pending", children: "Pending" }), _jsx(Option, { value: "Closed", children: "Closed" }), _jsx(Option, { value: "All", children: "All" })] })] }), _jsx(Typography, { color: "neutral", sx: { textAlign: 'center', mt: 4 }, children: "No tickets found." })] }), _jsx(Box, { sx: { flex: 1, background: '#f7f8fa', minWidth: 0 } })] }));
    }
    return (_jsxs(Box, { sx: { width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }, children: [_jsxs(Box, { sx: { width: 340, minWidth: 0, maxWidth: 340, borderRight: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }, children: [_jsxs(Box, { sx: { p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { level: "h4", children: "Tickets" }), _jsx(Button, { size: "sm", onClick: () => setCreateOpen(true), variant: "solid", children: "New" })] }), _jsx(Input, { placeholder: "Search tickets...", startDecorator: _jsx(SearchRoundedIcon, {}), value: search, onChange: e => setSearch(e.target.value), sx: { width: '100%' } }), _jsxs(Select, { size: "sm", value: status, onChange: (_, value) => setStatus(value), sx: { mt: 1, width: '100%' }, children: [_jsx(Option, { value: "Open", children: "Open" }), _jsx(Option, { value: "Pending", children: "Pending" }), _jsx(Option, { value: "Closed", children: "Closed" }), _jsx(Option, { value: "All", children: "All" })] })] }), _jsxs(List, { sx: { flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 0, minWidth: 0 }, children: [filtered.map(ticket => (_jsx(ListItem, { sx: { p: 0 }, children: _jsxs(ListItemButton, { selected: selectedId === ticket.id, onClick: () => setSelectedId(ticket.id), sx: { alignItems: 'center', py: 2, px: 2 }, children: [_jsx(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 48, mr: 2 }, children: _jsx(Avatar, { size: "sm", src: '' }) }), _jsxs(ListItemContent, { sx: { minWidth: 0 }, children: [_jsx(Typography, { level: "title-sm", noWrap: true, children: ticket.subject }), _jsx(Typography, { level: "body-xs", color: "neutral", noWrap: true, children: ticket.status })] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 80 }, children: [_jsx(Chip, { size: "sm", color: ticket.status === 'Open' ? 'primary' : ticket.status === 'Pending' ? 'warning' : 'neutral', variant: "soft", sx: { mb: 0.5 }, children: ticket.status }), _jsx(Typography, { level: "body-xs", color: "neutral", children: ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : '' })] })] }) }, ticket.id))), filtered.length === 0 && (_jsx(ListItem, { children: _jsx(Typography, { color: "neutral", children: "No tickets found." }) }))] }), _jsx(TicketForm, { open: createOpen, onClose: () => setCreateOpen(false), onCreated: refresh })] }), _jsx(Box, { sx: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f7f8fa', minWidth: 0, overflowX: 'hidden' }, children: selectedTicket && (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 3,
                                py: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'background.body',
                            }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Avatar, { size: "lg", src: '' }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Typography, { level: "title-md", sx: { fontWeight: 'lg' }, children: selectedTicket.requester_name || 'User' }), _jsx(Chip, { variant: "outlined", size: "sm", color: "neutral", sx: { borderRadius: 'sm', fontSize: 'xs', px: 0.75 }, startDecorator: _jsx(Box, { component: "span", sx: { width: 8, height: 8, bgcolor: 'success.500', borderRadius: '50%', display: 'inline-block' } }), children: "Online" })] }), _jsxs(Typography, { level: "body-xs", color: "neutral", children: ["@", selectedTicket.requester_name || 'user'] })] })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Button, { size: "sm", variant: "outlined", color: "neutral", startDecorator: _jsx(PhoneInTalkRoundedIcon, {}), component: "a", href: selectedTicket.requester_name ? `tel:${selectedTicket.requester_name}` : undefined, target: "_self", rel: "noopener", disabled: !selectedTicket.requester_name, children: "Call" }), _jsx(Button, { size: "sm", variant: "outlined", color: "neutral", children: "View profile" }), selectedTicket.status === 'Closed' ? (_jsx(Button, { size: "sm", variant: "solid", color: "danger", onClick: () => handleReopenTicket(selectedTicket.id), children: "Reopen" })) : (_jsx(Button, { size: "sm", variant: "solid", color: "primary", onClick: () => handleResolveTicket(selectedTicket.id), disabled: selectedTicket.status === 'Closed', children: "Resolve" }))] })] }), _jsxs(Box, { sx: { flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f7f8fa' }, children: [activities.map((act, idx) => {
                                    const isOutbound = act.direction === 'outbound';
                                    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: isOutbound ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1.5 }, children: [!isOutbound && (_jsx(Avatar, { size: "sm", src: '', sx: { mb: 'auto' } })), _jsxs(Box, { sx: { maxWidth: '60%', minWidth: 'auto', display: 'flex', flexDirection: 'column', alignItems: isOutbound ? 'flex-end' : 'flex-start' }, children: [_jsx(Sheet, { variant: isOutbound ? 'solid' : 'soft', color: isOutbound ? 'primary' : 'neutral', sx: Object.assign({ p: 1.25, borderRadius: 'lg', boxShadow: 'sm', mb: 0.5 }, (isOutbound
                                                            ? {
                                                                borderTopRightRadius: 0,
                                                                borderTopLeftRadius: 'lg',
                                                                backgroundColor: 'var(--joy-palette-primary-solidBg)',
                                                            }
                                                            : {
                                                                borderTopLeftRadius: 0,
                                                                borderTopRightRadius: 'lg',
                                                                backgroundColor: 'background.body',
                                                            })), children: _jsx(Typography, { level: "body-sm", sx: {
                                                                color: isOutbound ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-primary)',
                                                            }, children: act.message }) }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { justifyContent: isOutbound ? 'flex-end' : 'flex-start', mb: 0.25 }, children: [_jsx(Typography, { level: "body-xs", children: act.sender_name || (isOutbound ? 'You' : 'User') }), _jsx(Typography, { level: "body-xs", sx: { color: 'text.tertiary' }, children: act.timestamp ? new Date(act.timestamp).toLocaleString() : '' })] })] }), isOutbound && (_jsx(Avatar, { size: "sm", src: '', sx: { mb: 'auto' } }))] }, act.id || idx));
                                }), _jsx("div", { ref: messagesEndRef }), activities.length === 0 && (_jsx(Typography, { color: "neutral", children: "No communication yet." }))] }), _jsx(Divider, { sx: { m: 0 } }), _jsxs(Box, { sx: {
                                p: 2,
                                background: '#fff',
                                borderTop: '1px solid #e0e0e0',
                                borderRadius: 0,
                                boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }, children: [_jsx(Box, { sx: { px: 0, pb: 0, background: 'transparent', boxShadow: 'none', borderRadius: 0 }, children: _jsx(FormControl, { sx: { m: 0 }, children: _jsx(Textarea, { placeholder: "Type something here\u2026", "aria-label": "Message", value: activityMessage, minRows: 3, maxRows: 10, onChange: e => setActivityMessage(e.target.value), onKeyDown: event => {
                                                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                                                    handleSendActivity();
                                                }
                                            }, disabled: selectedTicket.status === 'Closed', endDecorator: _jsxs(Stack, { direction: "row", sx: {
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexGrow: 1,
                                                    py: 1,
                                                    pr: 1,
                                                    pl: 1,
                                                    borderTop: '1px solid',
                                                    borderColor: 'divider',
                                                    background: 'transparent',
                                                }, children: [_jsxs(Box, { children: [_jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleBold, disabled: selectedTicket.status === 'Closed', children: _jsx(FormatBoldRoundedIcon, {}) }), _jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleItalic, disabled: selectedTicket.status === 'Closed', children: _jsx(FormatItalicRoundedIcon, {}) }), _jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleStrike, disabled: selectedTicket.status === 'Closed', children: _jsx(StrikethroughSRoundedIcon, {}) }), _jsx(IconButton, { size: "sm", variant: "plain", color: "neutral", onClick: handleBullet, disabled: selectedTicket.status === 'Closed', children: _jsx(FormatListBulletedRoundedIcon, {}) })] }), _jsx(Button, { size: "sm", color: "primary", sx: { alignSelf: 'center', borderRadius: 'sm' }, endDecorator: _jsx(SendRoundedIcon, {}), onClick: handleSendActivity, disabled: sending || !activityMessage.trim() || selectedTicket.status === 'Closed', title: selectedTicket.status === 'Closed' ? 'Ticket needs to be reopened to respond' : '', children: "Send" })] }), sx: {
                                                '& textarea:first-of-type': {
                                                    minHeight: 72,
                                                    background: '#f7f8fa',
                                                },
                                                background: '#f7f8fa',
                                                borderRadius: 'md',
                                                boxShadow: 'xs',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            } }) }) }), sendError && _jsx(Typography, { color: "danger", sx: { px: 3, pb: 1 }, children: sendError })] })] })) }), _jsx(Snackbar, { open: snackbarOpen, autoHideDuration: 2500, onClose: () => setSnackbarOpen(false), color: "success", variant: "soft", anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: snackbarMessage })] }));
}
