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
import Table from '@mui/joy/Table';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from '@mui/icons-material/Add';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';
import DialogPurchaseOrder from './DialogPurchaseOrder';

// Define TypeScript interface for supplier
interface Supplier {
  id?: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  image_url?: string;
}

// Props interface
interface DialogSupplierProps {
  open: boolean;
  onClose: () => void;
  onSaved: (newSupplierId?: number) => void;
  mode?: 'add' | 'edit' | 'view';
  supplier?: Supplier;
  onDelete?: (id: number) => void;
  onEdit?: () => void;
}

/**
 * DialogSupplier Component
 * 
 * A unified modal for viewing, adding, and editing supplier information.
 * In view mode, displays supplier details and purchase orders.
 * 
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - onSaved: Callback function after saving the supplier.
 * - mode: 'add', 'edit', or 'view' mode.
 * - supplier: Supplier object for edit/view mode.
 * - onEdit: Callback to switch from view to edit mode.
 */
export default function DialogSupplier({ 
  open, 
  onClose, 
  onSaved, 
  mode = 'add', 
  supplier, 
  onDelete, 
  onEdit 
}: DialogSupplierProps) {
  // Form states
  const [name, setName] = React.useState(supplier?.name || '');
  const [contactName, setContactName] = React.useState(supplier?.contact_name || '');
  const [email, setEmail] = React.useState(supplier?.email || '');
  const [phone, setPhone] = React.useState(supplier?.phone || '');
  const [address, setAddress] = React.useState(supplier?.address || '');
  const [imageUrl, setImageUrl] = React.useState(supplier?.image_url || '');
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Purchase orders state (for view mode)
  const [purchaseOrders, setPurchaseOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);

  // Purchase order form state
  const [dialogPurchaseOrderOpen, setDialogPurchaseOrderOpen] = React.useState(false);

  React.useEffect(() => {
    if (open && (mode === 'edit' || mode === 'view') && supplier) {
      setName(supplier.name || '');
      setContactName(supplier.contact_name || '');
      setEmail(supplier.email || '');
      setPhone(supplier.phone || '');
      setAddress(supplier.address || '');
      setImageUrl(supplier.image_url || '');
      
      // Fetch purchase orders for view mode
      if (mode === 'view') {
        fetchPurchaseOrders();
      }
    } else if (open && mode === 'add') {
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setImageUrl('');
    }
  }, [open, mode, supplier]);

  const fetchPurchaseOrders = async () => {
    if (!supplier?.id) return;
    
    setLoadingOrders(true);
    setOrdersError(null);
    
    try {
      const { data, error } = await supabase
        .from('purchaseorders')
        .select('id, order_number, order_date, status, total, notes')
        .eq('supplier_id', supplier.id)
        .order('order_date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setPurchaseOrders(data);
      }
    } catch (err: any) {
      console.error('Error fetching purchase orders:', err);
      setOrdersError(err.message || 'Failed to fetch purchase orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePurchaseOrderCreated = () => {
    setDialogPurchaseOrderOpen(false);
    if (mode === 'view') {
      fetchPurchaseOrders(); // Refresh the purchase orders list
    }
  };

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
        .from('supplierimages')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('supplierimages')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      setUploading(true);
      
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('supplierimages')
          .remove([fileName]);
      }
      
      setImageUrl('');
    } catch (err: any) {
      console.error('Error removing image:', err);
      setError(err.message || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const supplierData = {
        name: name.trim(),
        contact_name: contactName.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        image_url: imageUrl || null,
      };

      if (mode === 'edit' && supplier?.id) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplier.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('suppliers')
          .insert([supplierData])
          .select();

        if (error) throw error;
        if (data?.[0]) {
          onSaved(data[0].id);
        }
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving supplier:', err);
      setError(err.message || 'Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!supplier?.id || !onDelete) return;
    
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplier.id);
      if (error) throw error;
      onDelete(supplier.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete supplier');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog sx={{ 
          minWidth: mode === 'view' ? { xs: '90vw', sm: '80vw', md: '1000px' } : 400, 
          maxWidth: mode === 'view' ? { xs: '95vw', sm: '90vw', md: '1200px' } : 500,
          minHeight: mode === 'view' ? '70vh' : 'auto',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}>
          <ModalClose />
          <Typography level="title-md" sx={{ mb: 2 }}>
            {mode === 'view' ? 'Supplier Details' : mode === 'edit' ? 'Edit' : 'Add'} 
            {mode !== 'view' ? ' Supplier' : ''}
          </Typography>
        
        {mode === 'view' ? (
          /* View Mode Layout */
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            height: '100%',
            overflow: 'hidden'
          }}>
            {/* Left: Supplier Info */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              minWidth: { xs: '100%', md: '340px' },
              maxWidth: { xs: '100%', md: '420px' },
              borderRight: { md: '1px solid' },
              borderColor: 'divider',
              pr: { md: 3 }
            }}>
              {/* Avatar Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar
                  size="lg"
                  src={imageUrl}
                  sx={{ width: 80, height: 80 }}
                >
                  {!imageUrl && name && name.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography level="h3" textAlign="center">{name}</Typography>
              </Box>

              {/* Company Information */}
              <Card variant="soft">
                <Typography level="h4" sx={{ mb: 0 }}>
                  Company
                </Typography>
                <Divider sx={{ mb: 0 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography level="body-md">
                    <strong>Name:</strong> {name}
                  </Typography>
                  <Typography level="body-md">
                    <strong>Address:</strong> {address || 'N/A'}
                  </Typography>
                </Box>
              </Card>

              {/* Contact Information */}
              <Card variant="soft">
                <Typography level="h4" sx={{ mb: 0 }}>
                  Contact
                </Typography>
                <Divider sx={{ mb: 0 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography level="body-md">
                    <strong>Contact Name:</strong> {contactName || 'N/A'}
                  </Typography>
                  
                  {/* Email with clickable button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography level="body-md" sx={{ flex: 1, minWidth: 0 }}>
                      <strong>Email:</strong> {email || 'N/A'}
                    </Typography>
                    {email && (
                      <Button
                        size="sm"
                        variant="outlined"
                        startDecorator={<EmailIcon />}
                        onClick={() => window.open(`mailto:${email}`, '_self')}
                        sx={{ flexShrink: 0 }}
                      >
                        Email
                      </Button>
                    )}
                  </Box>
                  
                  {/* Phone with clickable button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography level="body-md" sx={{ flex: 1, minWidth: 0 }}>
                      <strong>Phone:</strong> {phone || 'N/A'}
                    </Typography>
                    {phone && (
                      <Button
                        size="sm"
                        variant="outlined"
                        startDecorator={<PhoneIcon />}
                        onClick={() => window.open(`tel:${phone}`, '_self')}
                        sx={{ flexShrink: 0 }}
                      >
                        Call
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 'auto' }}>
                <Button 
                  variant="solid"
                  startDecorator={<AddIcon />}
                  onClick={() => setDialogPurchaseOrderOpen(true)}
                  sx={{ width: '100%' }}
                >
                  Add Purchase Order
                </Button>
                
                <Button 
                  variant="outlined"
                  startDecorator={<EditIcon />}
                  onClick={onEdit}
                  sx={{ width: '100%' }}
                >
                  Edit Supplier
                </Button>
              </Box>
            </Box>

            {/* Right: Purchase Orders */}
            <Box sx={{ 
              flex: 2, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <Typography level="h3" sx={{ mb: 2 }}>
                Purchase Orders
              </Typography>
              
              {loadingOrders && <Typography>Loading purchase orders...</Typography>}
              {ordersError && <Typography color="danger">Error: {ordersError}</Typography>}
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{order.order_date}</td>
                        <td>{order.status}</td>
                        <td>{order.total != null ? formatCurrencyWithSymbol(order.total) : '—'}</td>
                        <td>{order.notes || ''}</td>
                      </tr>
                    ))}
                    {purchaseOrders.length === 0 && !loadingOrders && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                          No purchase orders for this supplier.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Box>
            </Box>
          </Box>
        ) : (
          /* Edit/Add Mode Layout */
          <>
            {/* Image Upload Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 2 }}>
              <Typography level="body-sm">Supplier Avatar</Typography>
              
              {/* Avatar Display */}
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  size="lg"
                  src={imageUrl}
                  sx={{ width: 80, height: 80 }}
                >
                  {!imageUrl && name && name.substring(0, 2).toUpperCase()}
                </Avatar>
                
                {/* Remove button for existing image */}
                {imageUrl && (
                  <IconButton
                    size="sm"
                    variant="solid"
                    color="danger"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24
                    }}
                    onClick={handleRemoveImage}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
              
              {/* Upload Controls */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  disabled={uploading}
                />
                <Button
                  variant="outlined"
                  size="sm"
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  startDecorator={<PhotoCameraIcon />}
                >
                  {imageUrl ? 'Change Image' : 'Upload Image'}
                </Button>
              </Box>
              
              {/* Upload helper text */}
              <Typography level="body-xs" color="neutral" sx={{ textAlign: 'center' }}>
                Max 5MB (JPG, PNG, GIF)
              </Typography>
            </Box>

            <form onSubmit={e => { e.preventDefault(); e.stopPropagation(); handleSave(); }}>
              <Input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <Input
                placeholder="Contact Name"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                type="email"
                required
              />
              <Input
                placeholder="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                sx={{ mb: 2 }}
                type="tel"
              />
              <Input
                placeholder="Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                sx={{ mb: 2 }}
              />
              {error && <Typography color="danger" sx={{ mb: 1 }}>{error}</Typography>}
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                <Button 
                  type="submit" 
                  loading={saving} 
                  disabled={saving} 
                  variant="solid"
                  sx={{ flex: 1 }}
                >
                  {mode === 'edit' ? 'Update' : 'Save'}
                </Button>
                
                {mode === 'edit' && supplier?.id && onDelete && (
                  <Button
                    variant="outlined"
                    color="danger"
                    startDecorator={<DeleteIcon />}
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </form>
          </>
        )}
      </ModalDialog>
    </Modal>
    
    {/* Purchase Order Form Dialog */}
    <DialogPurchaseOrder
      open={dialogPurchaseOrderOpen}
      onClose={() => setDialogPurchaseOrderOpen(false)}
      onCreated={handlePurchaseOrderCreated}
      mode="add"
      order={supplier?.id ? {
        id: '',
        order_number: '',
        order_date: '',
        status: '',
        total: 0,
        notes: '',
        supplier_id: supplier.id.toString()
      } : undefined}
    />
    </>
  );
}
