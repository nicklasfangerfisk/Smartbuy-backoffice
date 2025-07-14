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
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import { supabase } from '../utils/supabaseClient';

// Define TypeScript interface for customer profile
export interface CustomerProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  last_login?: string;
  phone_number?: string;
  email?: string;
  role?: 'customer' | 'vip' | 'premium';
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
}

// Props interface
interface DialogCustomerProps {
  open: boolean;
  onClose: () => void;
  customer?: CustomerProfile;
  mode?: 'add' | 'edit' | 'view';
  onSaved?: () => void;
}

/**
 * DialogCustomer Component
 * 
 * A modal form for managing customer profiles, including personal information,
 * customer tier assignment, address details, and avatar management.
 * 
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - customer: Customer data for edit/view mode.
 * - mode: 'add', 'edit', or 'view' mode.
 * - onSaved: Callback after successful save.
 */
export default function DialogCustomer({ 
  open, 
  onClose, 
  customer, 
  mode = 'add',
  onSaved 
}: DialogCustomerProps) {
  // Form states
  const [firstName, setFirstName] = React.useState(customer?.first_name || '');
  const [lastName, setLastName] = React.useState(customer?.last_name || '');
  const [email, setEmail] = React.useState(customer?.email || '');
  const [phoneNumber, setPhoneNumber] = React.useState(customer?.phone_number || '');
  const [role, setRole] = React.useState<string>(customer?.role || 'customer');
  const [address, setAddress] = React.useState(customer?.address || '');
  const [city, setCity] = React.useState(customer?.city || '');
  const [postalCode, setPostalCode] = React.useState(customer?.postal_code || '');
  const [country, setCountry] = React.useState(customer?.country || '');
  const [notes, setNotes] = React.useState(customer?.notes || '');
  const [avatarUrl, setAvatarUrl] = React.useState(customer?.avatar_url || '');
  
  // UI states
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && customer) {
      setFirstName(customer.first_name || '');
      setLastName(customer.last_name || '');
      setEmail(customer.email || '');
      setPhoneNumber(customer.phone_number || '');
      setRole(customer.role || 'customer');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      setPostalCode(customer.postal_code || '');
      setCountry(customer.country || '');
      setNotes(customer.notes || '');
      setAvatarUrl(customer.avatar_url || '');
    } else if (open && mode === 'add') {
      // Reset form for add mode
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setRole('customer');
      setAddress('');
      setCity('');
      setPostalCode('');
      setCountry('');
      setNotes('');
      setAvatarUrl('');
    }
    setError(null);
  }, [open, customer, mode]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    setUploading(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop()?.replace(/\./, '') || 'png';
      const filePath = `avatars/customer_${Date.now()}.${fileExt}`;
      
      const uploadResult = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });
      
      if (uploadResult.error) throw uploadResult.error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (publicUrl) setAvatarUrl(publicUrl);
    } catch (err: any) {
      setError('Failed to upload avatar. Please try again.');
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const customerData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || null,
        role: role,
        address: address.trim() || null,
        city: city.trim() || null,
        postal_code: postalCode.trim() || null,
        country: country.trim() || null,
        notes: notes.trim() || null,
        avatar_url: avatarUrl || null,
      };

      if (mode === 'edit' && customer?.id) {
        const { error } = await supabase
          .from('users')
          .update(customerData)
          .eq('id', customer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('users')
          .insert([customerData]);

        if (error) throw error;
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving customer:', err);
      setError(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || 'Customer';
  const isReadOnly = mode === 'view';

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 700, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <DialogTitle>
          {mode === 'add' ? 'Add Customer' : mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
        </DialogTitle>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Avatar and Basic Info Section */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'flex-start' }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }}>
              <Avatar
                src={avatarUrl}
                alt={displayName}
                sx={{ width: 96, height: 96, mb: 1 }}
              >
                {!avatarUrl && displayName.substring(0, 2).toUpperCase()}
              </Avatar>
              
              {!isReadOnly && (
                <>
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
                    title="Upload avatar"
                    size="sm"
                    sx={{ mt: 1 }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </>
              )}
              
              {customer?.last_login && (
                <Typography level="body-xs" sx={{ mt: 1, textAlign: 'center' }}>
                  Last login:<br />
                  {new Date(customer.last_login).toLocaleString()}
                </Typography>
              )}
            </Box>
            
            <Divider orientation="vertical" sx={{ mx: 1, alignSelf: 'stretch' }} />
            
            {/* Basic Info */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>First Name</Typography>
                  <Input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isReadOnly}
                    required
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Last Name</Typography>
                  <Input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isReadOnly}
                    required
                  />
                </Box>
              </Box>
              
              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>Email</Typography>
                <Input
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Phone Number</Typography>
                  <Input
                    placeholder="Phone number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isReadOnly}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Customer Tier</Typography>
                  <Select
                    value={role}
                    onChange={(_, newValue) => setRole(newValue as string)}
                    disabled={isReadOnly}
                  >
                    <Option value="customer">Customer</Option>
                    <Option value="vip">VIP</Option>
                    <Option value="premium">Premium</Option>
                  </Select>
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Address Section */}
          <Box>
            <Typography level="title-sm" sx={{ mb: 2 }}>Address Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>Street Address</Typography>
                <Input
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isReadOnly}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>City</Typography>
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isReadOnly}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Postal Code</Typography>
                  <Input
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    disabled={isReadOnly}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Country</Typography>
                  <Input
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isReadOnly}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Additional Info Section */}
          <Box>
            <Typography level="title-sm" sx={{ mb: 2 }}>Additional Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>Avatar URL</Typography>
                <Input
                  placeholder="Avatar image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={isReadOnly}
                />
              </Box>
              
              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>Notes</Typography>
                <Textarea
                  placeholder="Customer notes or special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isReadOnly}
                  minRows={3}
                />
              </Box>
            </Box>
          </Box>
          
          {error && (
            <Typography color="danger" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button variant="plain" onClick={onClose} disabled={saving || uploading}>
            Cancel
          </Button>
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              disabled={saving || uploading || !firstName.trim() || !lastName.trim() || !email.trim()}
              loading={saving}
            >
              {mode === 'edit' ? 'Update' : 'Create'} Customer
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
