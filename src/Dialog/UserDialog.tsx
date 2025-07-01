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
import { supabase } from '../utils/supabaseClient';

// Define TypeScript interface for userProfile
interface UserProfile {
  id: string;
  name?: string;
  avatar_url?: string;
  last_login?: string;
}

// Props interface
interface UserDialogProps {
  open: boolean; // Whether the modal is open
  onClose: () => void; // Function to close the modal
  userProfile: UserProfile; // User profile data
  editName: string; // Current name being edited
  setEditName: (v: string) => void; // Function to update the name
  editAvatar: string; // Current avatar URL being edited
  setEditAvatar: (v: string) => void; // Function to update the avatar URL
  onSave: () => void; // Function to save changes
}

/**
 * UserDialog Component
 * 
 * A modal form for editing user profiles, including their name and avatar.
 * 
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - userProfile: User profile data.
 * - editName: Current name being edited.
 * - setEditName: Function to update the name.
 * - editAvatar: Current avatar URL being edited.
 * - setEditAvatar: Function to update the avatar URL.
 * - onSave: Function to save changes.
 */
export default function UserDialog({ open, onClose, userProfile, editName, setEditName, editAvatar, setEditAvatar, onSave }: UserDialogProps) {
  // Avatar upload state
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file || !userProfile?.id) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fileExt = file.name.split('.').pop()?.replace(/\./, '') || 'png';
      const filePath = `avatars/${userProfile.id}_${Date.now()}.${fileExt}`;
      // Upload file (do not remove first, just upsert)
      const uploadResult = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadResult.error) throw uploadResult.error;
      // Always get the public URL from the returned path
      const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath).data;
      if (publicUrl) setEditAvatar(publicUrl);
    } catch (err) {
      setUploadError('Failed to upload avatar. Please try again.');
      console.error('Avatar upload failed', err);
    }
    setUploading(false);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'flex-start' }}>
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }}>
            <Avatar
              src={editAvatar || userProfile?.avatar_url || ''}
              alt={editName || userProfile?.name || 'Avatar'}
              sx={{ width: 96, height: 96, mb: 1 }}
            />
            <Typography level="body-xs" sx={{ mt: 1, textAlign: 'center' }}>
              Last login:<br />
              {userProfile?.last_login ? new Date(userProfile.last_login).toLocaleString() : 'Never'}
            </Typography>
          </Box>
          <Divider orientation="vertical" sx={{ mx: 1, alignSelf: 'stretch' }} />
          {/* Edit Section */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography level="body-sm">Name</Typography>
            <Input
              placeholder="Your name"
              value={editName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
              sx={{ mb: 1 }}
              required
            />
            <Typography level="body-sm">Avatar URL</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Input
                placeholder="Avatar image URL"
                value={editAvatar}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditAvatar(e.target.value)}
                sx={{ flex: 1 }}
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
              />
              <IconButton
                component="span"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload from device"
              >
                <PhotoCamera />
              </IconButton>
            </Box>
            {uploadError && <Typography color="danger" sx={{ mt: 1 }}>{uploadError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="plain" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button
            onClick={() => {
              onSave();
              onClose();
            }}
            disabled={uploading || !editName}
          >
            Save
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
