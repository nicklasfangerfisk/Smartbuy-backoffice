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
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Divider from '@mui/joy/Divider';
import { supabase } from '../../utils/supabaseClient';
export default function UserDialog({ open, onClose, userProfile, editName, setEditName, editAvatar, setEditAvatar, onSave }) {
    // Avatar upload state
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef(null);
    function handleFileChange(e) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const file = e.target.files && e.target.files[0];
            if (!file || !(userProfile === null || userProfile === void 0 ? void 0 : userProfile.id))
                return;
            setUploading(true);
            try {
                const fileExt = ((_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.replace(/\./, '')) || 'png';
                const filePath = `avatars/${userProfile.id}_${Date.now()}.${fileExt}`;
                // Upload file (do not remove first, just upsert)
                const uploadResult = yield supabase.storage.from('avatars').upload(filePath, file, { upsert: true, contentType: file.type });
                if (uploadResult.error)
                    throw uploadResult.error;
                // Always get the public URL from the returned path
                const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath).data;
                if (publicUrl)
                    setEditAvatar(publicUrl);
            }
            catch (err) {
                // Optionally show error to user
                console.error('Avatar upload failed', err);
            }
            setUploading(false);
        });
    }
    return (_jsx(Modal, { open: open, onClose: onClose, children: _jsxs(ModalDialog, { children: [_jsx(DialogTitle, { children: "Edit Profile" }), _jsxs(DialogContent, { sx: { display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'flex-start' }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }, children: [_jsx(Avatar, { src: editAvatar || (userProfile === null || userProfile === void 0 ? void 0 : userProfile.avatar_url) || '', alt: editName || (userProfile === null || userProfile === void 0 ? void 0 : userProfile.name) || 'Avatar', sx: { width: 96, height: 96, mb: 1 } }), _jsxs(Typography, { level: "body-xs", sx: { mt: 1, textAlign: 'center' }, children: ["Last login:", _jsx("br", {}), (userProfile === null || userProfile === void 0 ? void 0 : userProfile.last_login) ? new Date(userProfile.last_login).toLocaleString() : 'Never'] })] }), _jsx(Divider, { orientation: "vertical", sx: { mx: 1, alignSelf: 'stretch' } }), _jsxs(Box, { sx: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(Typography, { level: "body-sm", children: "Name" }), _jsx(Input, { placeholder: "Your name", value: editName, onChange: (e) => setEditName(e.target.value), sx: { mb: 1 } }), _jsx(Typography, { level: "body-sm", children: "Avatar URL" }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Input, { placeholder: "Avatar image URL", value: editAvatar, onChange: (e) => setEditAvatar(e.target.value), sx: { flex: 1 } }), _jsx("input", { type: "file", accept: "image/*", style: { display: 'none' }, ref: fileInputRef, onChange: handleFileChange, disabled: uploading }), _jsx(IconButton, { component: "span", onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: uploading, title: "Upload from device", children: _jsx(PhotoCamera, {}) })] })] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { variant: "plain", onClick: onClose, disabled: uploading, children: "Cancel" }), _jsx(Button, { onClick: () => {
                                onSave();
                                onClose();
                            }, disabled: uploading, children: "Save" })] })] }) }));
}
