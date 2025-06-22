import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
const resolutionOptions = [
    'Refund issued',
    'Replacement sent',
    'Order cancelled',
    'Technical support provided',
    'Information provided',
    'Awaiting customer response',
    'Other',
];
const TicketResForm = ({ open, onClose, onSubmit }) => {
    console.debug('TicketResForm rendered, open:', open);
    const [resolution, setResolution] = React.useState('');
    const [resolutionComment, setResolutionComment] = React.useState('');
    React.useEffect(() => {
        if (!open) {
            setResolution('');
            setResolutionComment('');
        }
    }, [open]);
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { children: [_jsx(DialogTitle, { children: "Resolve Ticket" }), _jsxs(DialogContent, { sx: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }, children: [_jsx(Select, { value: resolution, onChange: (_, value) => setResolution(value || ''), placeholder: "Select resolution", required: true, children: resolutionOptions.map(opt => (_jsx(Option, { value: opt, children: opt }, opt))) }), _jsx(Textarea, { minRows: 3, placeholder: "Resolution comment to customer...", value: resolutionComment, onChange: e => setResolutionComment(e.target.value) })] }), _jsxs(DialogActions, { children: [_jsx(Button, { variant: "plain", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "solid", color: "primary", disabled: !resolution, onClick: () => {
                                onSubmit(resolution, resolutionComment);
                                onClose();
                            }, children: "Submit" })] })] }) }));
};
export default TicketResForm;
