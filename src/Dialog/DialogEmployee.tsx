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
import { supabase } from '../utils/supabaseClient';

// Define TypeScript interface for employee profile
export interface EmployeeProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  last_login?: string;
  phone_number?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'staff' | 'employee' | 'user';
  department?: string;
  position?: string;
}

// Props interface
interface DialogEmployeeProps {
  open: boolean;
  onClose: () => void;
  employee?: EmployeeProfile;
  mode?: 'add' | 'edit' | 'view';
  onSaved?: () => void;
}

/**
 * DialogEmployee Component
 * 
 * A modal form for managing employee profiles, including personal information,
 * role assignment, and avatar management.
 * 
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - employee: Employee data for edit/view mode.
 * - mode: 'add', 'edit', or 'view' mode.
 * - onSaved: Callback after successful save.
 */
export default function DialogEmployee({ 
  open, 
  onClose, 
  employee, 
  mode = 'add',
  onSaved 
}: DialogEmployeeProps) {
  // Form states
  const [firstName, setFirstName] = React.useState(employee?.first_name || '');
  const [lastName, setLastName] = React.useState(employee?.last_name || '');
  const [email, setEmail] = React.useState(employee?.email || '');
  const [phoneNumber, setPhoneNumber] = React.useState(employee?.phone_number || '');
  const [role, setRole] = React.useState<string>(employee?.role || 'employee');
  const [department, setDepartment] = React.useState(employee?.department || '');
  const [position, setPosition] = React.useState(employee?.position || '');
  const [avatarUrl, setAvatarUrl] = React.useState(employee?.avatar_url || '');
  
  // UI states
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && employee) {
      setFirstName(employee.first_name || '');
      setLastName(employee.last_name || '');
      setEmail(employee.email || '');
      setPhoneNumber(employee.phone_number || '');
      setRole(employee.role || 'employee');
      setDepartment(employee.department || '');
      setPosition(employee.position || '');
      setAvatarUrl(employee.avatar_url || '');
    } else if (open && mode === 'add') {
      // Reset form for add mode
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setRole('employee');
      setDepartment('');
      setPosition('');
      setAvatarUrl('');
    }
    setError(null);
  }, [open, employee, mode]);

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
      const filePath = `avatars/employee_${Date.now()}.${fileExt}`;
      
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
      const employeeData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || null,
        role: role,
        department: department.trim() || null,
        position: position.trim() || null,
        avatar_url: avatarUrl || null,
      };

      if (mode === 'edit' && employee?.id) {
        const { error } = await supabase
          .from('users')
          .update(employeeData)
          .eq('id', employee.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('users')
          .insert([employeeData]);

        if (error) throw error;
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setError(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || 'Employee';
  const isReadOnly = mode === 'view';

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 600, width: '100%' }}>
        <DialogTitle>
          {mode === 'add' ? 'Add Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Details'}
        </DialogTitle>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'flex-start' }}>
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
            
            {employee?.last_login && (
              <Typography level="body-xs" sx={{ mt: 1, textAlign: 'center' }}>
                Last login:<br />
                {new Date(employee.last_login).toLocaleString()}
              </Typography>
            )}
          </Box>
          
          <Divider orientation="vertical" sx={{ mx: 1, alignSelf: 'stretch' }} />
          
          {/* Form Section */}
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
            
            <Box>
              <Typography level="body-sm" sx={{ mb: 1 }}>Phone Number</Typography>
              <Input
                placeholder="Phone number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isReadOnly}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography level="body-sm" sx={{ mb: 1 }}>Role</Typography>
                <Select
                  value={role}
                  onChange={(_, newValue) => setRole(newValue as string)}
                  disabled={isReadOnly}
                >
                  <Option value="employee">Employee</Option>
                  <Option value="staff">Staff</Option>
                  <Option value="manager">Manager</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography level="body-sm" sx={{ mb: 1 }}>Department</Typography>
                <Input
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isReadOnly}
                />
              </Box>
            </Box>
            
            <Box>
              <Typography level="body-sm" sx={{ mb: 1 }}>Position</Typography>
              <Input
                placeholder="Job position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={isReadOnly}
              />
            </Box>
            
            <Box>
              <Typography level="body-sm" sx={{ mb: 1 }}>Avatar URL</Typography>
              <Input
                placeholder="Avatar image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isReadOnly}
              />
            </Box>
            
            {error && (
              <Typography color="danger" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
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
              {mode === 'edit' ? 'Update' : 'Create'} Employee
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
