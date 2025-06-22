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
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Card from '@mui/joy/Card';
import Button from '@mui/joy/Button';
// Dummy data for now
const campaigns = [
    { id: 1, name: 'June Promo', sent: 1200, status: 'Completed', date: '2025-06-01' },
    { id: 2, name: 'Flash Sale', sent: 800, status: 'Scheduled', date: '2025-06-15' },
];
// Get API base URL from environment variable or default to local
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
export default function SmsCampaignsTable() {
    const [sending, setSending] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);
    function handleSendCampaign() {
        return __awaiter(this, void 0, void 0, function* () {
            setSending(true);
            setError(null);
            setSuccess(null);
            try {
                const resp = yield fetch(`${API_BASE_URL}/send-sms-campaign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'This is a test SMS campaign!' })
                });
                const result = yield resp.json();
                if (!resp.ok)
                    throw new Error(result.error || 'Failed to send SMS');
                setSuccess(`Sent to ${result.sent} recipients!`);
            }
            catch (err) {
                setError(err.message || String(err));
            }
            finally {
                setSending(false);
            }
        });
    }
    return (_jsxs(Card, { sx: { width: '100%', minHeight: '100dvh', p: 4, m: 2, bgcolor: 'background.body', borderRadius: 2, boxShadow: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { level: "h4", children: "SMS Campaigns" }), _jsx(Button, { variant: "solid", color: "primary", onClick: handleSendCampaign, loading: sending, children: "Send Test Campaign" })] }), error && _jsx(Typography, { color: "danger", children: error }), success && _jsx(Typography, { color: "success", children: success }), _jsxs(Table, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Sent" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Date" })] }) }), _jsx("tbody", { children: campaigns.map(c => (_jsxs("tr", { children: [_jsx("td", { children: c.name }), _jsx("td", { children: c.sent }), _jsx("td", { children: c.status }), _jsx("td", { children: c.date })] }, c.id))) })] })] }));
}
