import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import IconButton from '@mui/joy/IconButton';
import Divider from '@mui/joy/Divider';
import Switch from '@mui/joy/Switch';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import LanguageIcon from '@mui/icons-material/Language';
import Circle from '@mui/icons-material/Circle';

// Define TypeScript interface for storefront
interface Storefront {
  id?: string;
  name: string;
  url?: string;
  logo_url?: string;
  is_online: boolean;
}

// Props interface
interface DialogStorefrontProps {
  open: boolean;
  onClose: () => void;
  onSaved: (newStorefrontId?: string) => void;
  mode?: 'add' | 'edit' | 'view';
  storefront?: Storefront;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
}

/**
 * DialogStorefront Component
 * 
 * A unified modal for viewing, adding, and editing storefront information.
 * 
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - onSaved: Callback function after saving the storefront.
 * - mode: 'add', 'edit', or 'view' mode.
 * - storefront: Storefront object for edit/view mode.
 * - onEdit: Callback to switch from view to edit mode.
 */
export default function DialogStorefront({ 
  open, 
  onClose, 
  onSaved, 
  mode = 'add', 
  storefront, 
  onDelete, 
  onEdit 
}: DialogStorefrontProps) {
  // Form states
  const [name, setName] = React.useState(storefront?.name || '');
  const [url, setUrl] = React.useState(storefront?.url || '');
  const [logoUrl, setLogoUrl] = React.useState(storefront?.logo_url || '');
  const [isOnline, setIsOnline] = React.useState(storefront?.is_online || false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && (mode === 'edit' || mode === 'view') && storefront) {
      setName(storefront.name || '');
      setUrl(storefront.url || '');
      setLogoUrl(storefront.logo_url || '');
      setIsOnline(storefront.is_online || false);
    } else if (open && mode === 'add') {
      setName('');
      setUrl('');
      setLogoUrl('');
      setIsOnline(false);
    }
    setError(null);
  }, [open, mode, storefront]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('storefrontlogos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('storefrontlogos')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!logoUrl) return;

    try {
      setUploading(true);
      
      // Extract filename from URL
      const fileName = logoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('storefrontlogos')
          .remove([fileName]);
      }
      
      setLogoUrl('');
    } catch (err: any) {
      console.error('Error removing logo:', err);
      setError(err.message || 'Failed to remove logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const storefrontData = {
        name: name.trim(),
        url: url.trim() || null,
        logo_url: logoUrl || null,
        is_online: isOnline,
      };

      if (mode === 'edit' && storefront?.id) {
        const { error } = await supabase
          .from('storefronts')
          .update(storefrontData)
          .eq('id', storefront.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('storefronts')
          .insert([storefrontData])
          .select();

        if (error) throw error;
        if (data?.[0]) {
          onSaved(data[0].id);
        }
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving storefront:', err);
      setError(err.message || 'Failed to save storefront');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!storefront?.id || !onDelete) return;
    
    if (!confirm('Are you sure you want to delete this storefront?')) return;
    
    try {
      const { error } = await supabase.from('storefronts').delete().eq('id', storefront.id);
      if (error) throw error;
      onDelete(storefront.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete storefront');
    }
  };

  const getStorefrontInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStorefrontColor = (name: string): 'primary' | 'danger' | 'success' | 'warning' | 'neutral' => {
    const colors: ('primary' | 'danger' | 'success' | 'warning' | 'neutral')[] = ['primary', 'danger', 'success', 'warning', 'neutral'];
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ 
        minWidth: mode === 'view' ? { xs: '90vw', sm: '600px' } : 400, 
        maxWidth: mode === 'view' ? { xs: '95vw', sm: '800px' } : 500,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <ModalClose />
        <Typography level="title-md" sx={{ mb: 2 }}>
          {mode === 'view' ? 'Storefront Details' : mode === 'edit' ? 'Edit' : 'Add'} 
          {mode !== 'view' ? ' Storefront' : ''}
        </Typography>
      
      {mode === 'view' ? (
        /* View Mode Layout */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              size="lg"
              src={logoUrl}
              color={getStorefrontColor(name)}
              sx={{ width: 80, height: 80 }}
            >
              {!logoUrl && getStorefrontInitials(name)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography level="title-lg" fontWeight="bold">
                  {name}
                </Typography>
                <Chip
                  size="sm"
                  color={isOnline ? 'success' : 'neutral'}
                  startDecorator={<Circle sx={{ fontSize: 12 }} />}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Chip>
              </Box>
              
              {url && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LanguageIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />
                  <Typography 
                    level="body-sm" 
                    color="neutral"
                    component="a"
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {url}
                  </Typography>
                  <IconButton
                    size="sm"
                    variant="plain"
                    component="a"
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LaunchIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {onEdit && (
              <Button
                variant="outlined"
                startDecorator={<EditIcon />}
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outlined"
                color="danger"
                startDecorator={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        /* Edit/Add Mode */
        <Stack spacing={2}>
          {/* Logo Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              size="lg"
              src={logoUrl}
              color={name ? getStorefrontColor(name) : 'neutral'}
              sx={{ width: 80, height: 80 }}
            >
              {!logoUrl && name && getStorefrontInitials(name)}
            </Avatar>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Button
                size="sm"
                variant="outlined"
                startDecorator={<PhotoCameraIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                loading={uploading}
              >
                Upload Logo
              </Button>
              {logoUrl && (
                <IconButton
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Form Fields */}
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter storefront name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Website URL</FormLabel>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Status</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Switch
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
              />
              <Typography level="body-sm">
                {isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </FormControl>

          {error && (
            <Typography color="danger" level="body-sm">
              {error}
            </Typography>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleSave}
              loading={saving}
              disabled={!name.trim()}
            >
              {mode === 'edit' ? 'Update' : 'Add'} Storefront
            </Button>
          </Box>
        </Stack>
      )}
      </ModalDialog>
    </Modal>
  );
}
