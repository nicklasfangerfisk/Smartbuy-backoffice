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
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import Sidebar from './components/navigation/Sidebar';
import PageOrderDesktop from './components/Page/PageOrderDesktop';
import Header from './components/navigation/Header';
import PageProductDesktop from './components/Page/PageProductDesktop';
import UsersTable from './components/Page/UsersTable';
import Suppliers from './components/Page/Suppliers';
import PurchaseOrderTable from './components/Page/PurchaseOrderTable';
import Login from './components/auth/Login';
import { supabase } from './utils/supabaseClient';
import MobileMenu from './components/navigation/MobileMenu';
import useMediaQuery from '@mui/material/useMediaQuery';
import TicketList from './components/Page/PageTicketDesktop';
import SmsCampaignsTable from './components/Page/SmsCampaignsTable';
import PageSmsCampaignsDesktop from './components/Page/PageSmsCampaignsDesktop';
import PageSmsCampaignsMobile from './components/Page/PageSmsCampaignsMobile';
function Home() {
    return (_jsxs(Box, { sx: { p: 4 }, children: [_jsx(Typography, { level: "h1", children: "Welcome to Smartbuy Backoffice" }), _jsx(Typography, { level: "body-lg", sx: { mt: 2 }, children: "Use the menu to manage orders and products." })] }));
}
function Messages() {
    return (_jsxs(Box, { sx: { p: 4 }, children: [_jsx(Typography, { level: "h2", children: "Messages" }), _jsx(Typography, { level: "body-md", sx: { mt: 2 }, children: "This is the messages page. You can add your messages UI here." })] }));
}
function DashboardHome() {
    const [totalSales, setTotalSales] = React.useState(null);
    const [orderCount, setOrderCount] = React.useState(null);
    const [customerCount, setCustomerCount] = React.useState(null);
    const [salesChange, setSalesChange] = React.useState(null);
    const [ordersChange, setOrdersChange] = React.useState(null);
    const [customersChange, setCustomersChange] = React.useState(null);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        let isMounted = true;
        let first = true;
        function fetchDashboardStats() {
            return __awaiter(this, void 0, void 0, function* () {
                if (first)
                    setInitialLoading(true);
                setError(null);
                // Date ranges: last 30 days and previous 30 days
                const now = new Date();
                const end = now.toISOString().slice(0, 10);
                const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const prevEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 - 1).toISOString().slice(0, 10);
                const ordersRes = yield supabase
                    .from('Orders')
                    .select('order_total, customer_email, date', { count: 'exact' })
                    .not('order_total', 'is', null);
                if (ordersRes.error || !ordersRes.data) {
                    if (isMounted)
                        setError('Failed to fetch order stats');
                    if (first)
                        setInitialLoading(false);
                    return;
                }
                const orders = ordersRes.data;
                const ordersThis = orders.filter((o) => o.date && o.date >= start && o.date <= end);
                const ordersPrev = orders.filter((o) => o.date && o.date >= prevStart && o.date <= prevEnd);
                const sumThis = ordersThis.reduce((acc, row) => acc + (typeof row.order_total === 'number' ? row.order_total : 0), 0);
                const sumPrev = ordersPrev.reduce((acc, row) => acc + (typeof row.order_total === 'number' ? row.order_total : 0), 0);
                const countThis = ordersThis.length;
                const countPrev = ordersPrev.length;
                const customersThis = new Set(ordersThis.map((o) => o.customer_email).filter(Boolean));
                const customersPrev = new Set(ordersPrev.map((o) => o.customer_email).filter(Boolean));
                const pct = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
                if (isMounted) {
                    setTotalSales(sumThis);
                    setOrderCount(countThis);
                    setCustomerCount(customersThis.size);
                    setSalesChange(pct(sumThis, sumPrev));
                    setOrdersChange(pct(countThis, countPrev));
                    setCustomersChange(pct(customersThis.size, customersPrev.size));
                }
                if (first)
                    setInitialLoading(false);
                first = false;
            });
        }
        fetchDashboardStats();
        const interval = setInterval(fetchDashboardStats, 10000);
        return () => { isMounted = false; clearInterval(interval); };
    }, []);
    function formatChange(val) {
        if (val == null)
            return '—';
        const sign = val > 0 ? '+' : val < 0 ? '−' : '';
        return `${sign}${Math.abs(Math.round(val))}%`;
    }
    return (_jsxs(Box, { sx: { p: 4 }, children: [_jsxs(Typography, { level: "h2", sx: { mb: 2 }, children: [_jsx(DashboardRoundedIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), " Dashboard"] }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { xs: 12, md: 4, children: _jsxs(Card, { variant: "outlined", children: [_jsx(Typography, { level: "h4", children: "Total Sales" }), _jsx(Typography, { level: "h2", color: "success", children: initialLoading ? 'Loading...' : error ? '—' : `$${totalSales === null || totalSales === void 0 ? void 0 : totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }), _jsxs(Typography, { level: "body-sm", color: "neutral", children: [initialLoading ? '' : formatChange(salesChange), " from last 30 days"] })] }) }), _jsx(Grid, { xs: 12, md: 4, children: _jsxs(Card, { variant: "outlined", children: [_jsx(Typography, { level: "h4", children: "Orders" }), _jsx(Typography, { level: "h2", color: "primary", children: initialLoading ? 'Loading...' : error ? '—' : orderCount === null || orderCount === void 0 ? void 0 : orderCount.toLocaleString() }), _jsxs(Typography, { level: "body-sm", color: "neutral", children: [initialLoading ? '' : formatChange(ordersChange), " from last 30 days"] })] }) }), _jsx(Grid, { xs: 12, md: 4, children: _jsxs(Card, { variant: "outlined", children: [_jsx(Typography, { level: "h4", children: "Customers" }), _jsx(Typography, { level: "h2", color: "warning", children: initialLoading ? 'Loading...' : error ? '—' : customerCount === null || customerCount === void 0 ? void 0 : customerCount.toLocaleString() }), _jsxs(Typography, { level: "body-sm", color: "neutral", children: [initialLoading ? '' : formatChange(customersChange), " new last 30 days"] })] }) })] })] }));
}
export default function JoyOrderDashboardTemplate() {
    const [view, setView] = React.useState('home');
    const [authChecked, setAuthChecked] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const isMobile = useMediaQuery('(max-width:600px)');
    // Define which menu items to show in the mobile menu
    const mobileMenuItems = [
        { label: 'Home', icon: _jsx(HomeRoundedIcon, {}), value: 'home' },
        { label: 'Orders', icon: _jsx(ShoppingCartRoundedIcon, {}), value: 'orders' },
        { label: 'Products', icon: _jsx(DashboardRoundedIcon, {}), value: 'products' },
    ];
    React.useEffect(() => {
        supabase.auth.getUser().then((res) => console.log('[Supabase Test] getUser result:', res), (err) => console.error('[Supabase Test] getUser error:', err));
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setAuthChecked(true);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            var _a;
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
        });
        return () => { listener === null || listener === void 0 ? void 0 : listener.subscription.unsubscribe(); };
    }, []);
    if (!authChecked)
        return null;
    if (!user)
        return _jsx(Login, { onLogin: () => __awaiter(this, void 0, void 0, function* () {
                const { data } = yield supabase.auth.getUser();
                setUser(data.user);
            }) });
    return (_jsxs(CssVarsProvider, { disableTransitionOnChange: true, children: [_jsx(CssBaseline, {}), _jsxs(Box, { sx: { display: 'flex', minHeight: '100dvh', width: '100vw', overflow: 'hidden', position: 'fixed', inset: 0 }, children: [_jsx(Sidebar, { setView: setView, view: view }), !(isMobile && view === 'tickets') && _jsx(Header, {}), _jsxs(Box, { component: "main", className: "MainContent", sx: {
                            px: view === 'tickets' ? 0 : { xs: 2, md: 6 },
                            pt: view === 'tickets' ? 0 : {
                                xs: 'calc(12px + var(--Header-height))',
                                sm: 'calc(12px + var(--Header-height))',
                                md: 3,
                            },
                            pb: view === 'tickets' ? 0 : { xs: 8, sm: 2, md: 3 },
                            flex: 1,
                            minWidth: 0,
                            gap: 1,
                            overflow: 'auto',
                        }, children: [view === 'home' && _jsx(DashboardHome, {}), view === 'orders' && _jsx(PageOrderDesktop, {}), view === 'products' && _jsx(PageProductDesktop, {}), view === 'messages' && _jsx(Messages, {}), view === 'users' && _jsx(UsersTable, {}), view === 'suppliers' && _jsx(Suppliers, {}), view === 'purchaseorders' && _jsx(PurchaseOrderTable, {}), view === 'tickets' && _jsx(TicketList, {}), view === 'smscampaigns' && _jsx(SmsCampaignsTable, {}), view === 'smscampaignsdesktop' && _jsx(PageSmsCampaignsDesktop, {}), view === 'smscampaignsmobile' && _jsx(PageSmsCampaignsMobile, {})] }), isMobile && (_jsx(MobileMenu, { items: mobileMenuItems, value: view, onChange: setView }))] })] }));
}
