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
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';
export default function TicketForm({ open, onClose, onCreated }) {
    const [newSubject, setNewSubject] = React.useState('');
    const [newRequester, setNewRequester] = React.useState('');
    const [creating, setCreating] = React.useState(false);
    const [error, setError] = React.useState(null);
    const handleCreateTicket = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setCreating(true);
        setError(null);
        const payload = { subject: newSubject, requester_name: newRequester, status: 'Open' };
        console.log('[TicketForm] Creating ticket with payload:', payload);
        const { error, data } = yield supabase.from('tickets').insert(payload);
        console.log('[TicketForm] Supabase insert result:', { error, data });
        if (error) {
            setError(error.message || JSON.stringify(error));
            console.error('[TicketForm] Error creating ticket:', error);
        }
        setCreating(false);
        if (!error) {
            setNewSubject('');
            setNewRequester('');
            onClose();
            if (onCreated)
                onCreated();
        }
    });
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { sx: { minWidth: 400 }, children: [_jsx(Typography, { level: "title-md", sx: { mb: 2 }, children: "Create Ticket" }), _jsxs("form", { onSubmit: handleCreateTicket, children: [_jsx(Input, { placeholder: "Subject", value: newSubject, onChange: e => setNewSubject(e.target.value), sx: { mb: 2 }, required: true }), _jsx(Input, { placeholder: "Requester Name", value: newRequester, onChange: e => setNewRequester(e.target.value), sx: { mb: 2 }, required: true }), error && _jsx(Typography, { color: "danger", sx: { mb: 1 }, children: error }), _jsx(Button, { type: "submit", loading: creating, disabled: creating || !newSubject || !newRequester, variant: "solid", children: "Create" })] })] }) }));
}
