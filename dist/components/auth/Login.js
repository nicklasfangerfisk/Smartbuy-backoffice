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
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    function handleLogin(e) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            e.preventDefault();
            setLoading(true);
            setError(null);
            const { data, error: authError } = yield supabase.auth.signInWithPassword({ email, password });
            if (authError) {
                console.error('[Login] Auth error:', authError);
                setError(authError.message);
                setLoading(false);
                return;
            }
            // Fetch user role from users table
            const userId = (_a = data.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                setError('Login failed: No user ID.');
                setLoading(false);
                return;
            }
            let { data: userRow, error: userError } = yield supabase.from('users').select('*').eq('id', userId).single();
            if (userError || !userRow) {
                console.error('[Login] User fetch error:', userError);
                // If not found, upsert as employee by default
                const { error: upsertError } = yield supabase.from('users').upsert({
                    id: userId,
                    email: data.user.email,
                    name: ((_b = data.user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) || ((_c = data.user.user_metadata) === null || _c === void 0 ? void 0 : _c.name) || '',
                    role: 'employee',
                });
                if (upsertError) {
                    console.error('Upsert failed:', upsertError);
                    setError('Upsert failed: ' + upsertError.message);
                    setLoading(false);
                    return;
                }
                // Try fetching again, with up to 3 retries and a short delay
                let retries = 3;
                while (retries > 0) {
                    yield new Promise(res => setTimeout(res, 300));
                    const { data: retryRow, error: retryError } = yield supabase.from('users').select('*').eq('id', userId).single();
                    if (retryError) {
                        console.error('[Login] Retry user fetch error:', retryError);
                    }
                    if (retryRow && !retryError) {
                        userRow = retryRow;
                        userError = null;
                        break;
                    }
                    retries--;
                }
                if (userError || !userRow) {
                    setError('Access denied: User not found.');
                    yield supabase.auth.signOut();
                    setLoading(false);
                    return;
                }
            }
            if (userRow.role !== 'employee') {
                setError('Access denied: Only employees can access this app.');
                yield supabase.auth.signOut();
                setLoading(false);
                return;
            }
            setLoading(false);
            onLogin();
        });
    }
    function handleGoogleLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            setError(null);
            // Google OAuth flow will redirect, so we cannot block in place. Instead, block in App after redirect.
            setLoading(false);
        });
    }
    return (_jsx(Box, { sx: { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.body' }, children: _jsxs(Card, { sx: { minWidth: 340, p: 4 }, children: [_jsx(Typography, { level: "h3", sx: { mb: 2 }, children: "Sign in to Smartbuy" }), _jsxs("form", { onSubmit: handleLogin, children: [_jsx(Input, { type: "email", placeholder: "Email", value: email, onChange: e => setEmail(e.target.value), sx: { mb: 2 }, required: true }), _jsx(Input, { type: "password", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value), sx: { mb: 2 }, required: true }), _jsx(Button, { type: "submit", loading: loading, fullWidth: true, sx: { mb: 1 }, children: "Sign In" })] }), _jsx(Button, { onClick: handleGoogleLogin, variant: "outlined", fullWidth: true, sx: { mb: 1 }, disabled: loading, children: "Sign in with Google" }), error && _jsx(Typography, { color: "danger", sx: { mt: 1 }, children: error })] }) }));
}
