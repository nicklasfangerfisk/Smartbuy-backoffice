import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { supabase } from '../utils/supabaseClient';
import withAuth from '../auth/withAuth';

/**
 * Props for the ProductTableForm component.
 */
interface ProductTableFormProps {
  /**
   * Controls the visibility of the modal.
   */
  open: boolean;

  /**
   * Callback function to close the modal.
   */
  onClose: () => void;

  /**
   * The product object to edit or add.
   */
  product: {
    ProductName: string;
    SalesPrice: number;
    CostPrice: number;
    image_url?: string;
    min_stock?: number;
    max_stock?: number;
    reorder_amount?: number;
  } | null;

  /**
   * Callback function to save the product details.
   * @param values - The updated product details.
   */
  onSave: (values: { 
    ProductName: string; 
    SalesPrice: string; 
    CostPrice: string; 
    image_url?: string;
    min_stock?: string;
    max_stock?: string;
    reorder_amount?: string;
  }) => void;
}

/**
 * A modal dialog component for adding or editing product details.
 */
function ProductTableForm({ open, onClose, product, onSave }: ProductTableFormProps) {
  const [form, setForm] = React.useState({
    ProductName: product?.ProductName || '',
    SalesPrice: product?.SalesPrice?.toString() || '',
    CostPrice: product?.CostPrice?.toString() || '',
    image_url: product?.image_url || '',
    min_stock: product?.min_stock?.toString() || '',
    max_stock: product?.max_stock?.toString() || '',
    reorder_amount: product?.reorder_amount?.toString() || '',
  });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setForm({
      ProductName: product?.ProductName || '',
      SalesPrice: product?.SalesPrice?.toString() || '',
      CostPrice: product?.CostPrice?.toString() || '',
      image_url: product?.image_url || '',
      min_stock: product?.min_stock?.toString() || '',
      max_stock: product?.max_stock?.toString() || '',
      reorder_amount: product?.reorder_amount?.toString() || '',
    });
  }, [product]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('productimages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('productimages')
        .getPublicUrl(filePath);

      // Update form state
      setForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="product-table-form-title">
      <ModalDialog sx={{ minWidth: { xs: '90vw', sm: 500 } }}>
        <DialogTitle id="product-table-form-title">{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* Product Image Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Typography level="body-sm" sx={{ alignSelf: 'flex-start' }}>Product Image</Typography>
              
              {form.image_url ? (
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={form.image_url}
                    alt="Product"
                    variant="soft"
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'neutral.300'
                    }}
                  />
                  <IconButton
                    size="sm"
                    variant="solid"
                    color="danger"
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      minHeight: 24,
                      minWidth: 24
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'neutral.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.500',
                      backgroundColor: 'primary.50'
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoCameraIcon sx={{ fontSize: 32, color: 'neutral.400' }} />
                </Box>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              <Stack direction="row" spacing={1}>
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                  disabled={uploading}
                >
                  {form.image_url ? 'Change Image' : 'Upload Image'}
                </Button>
                {form.image_url && (
                  <Button
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Product Details */}
            <Input
              name="ProductName"
              value={form.ProductName}
              onChange={e => setForm({ ...form, ProductName: e.target.value })}
              placeholder="Product Name"
            />
            <Input
              name="SalesPrice"
              value={form.SalesPrice}
              onChange={e => setForm({ ...form, SalesPrice: e.target.value })}
              placeholder="Sales Price"
              type="number"
            />
            <Input
              name="CostPrice"
              value={form.CostPrice}
              onChange={e => setForm({ ...form, CostPrice: e.target.value })}
              placeholder="Cost Price"
              type="number"
            />

            {/* Inventory Management Section */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography level="title-md" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon />
                Inventory Management
              </Typography>
              <Stack spacing={2}>
                <Input
                  name="min_stock"
                  value={form.min_stock}
                  onChange={e => setForm({ ...form, min_stock: e.target.value })}
                  placeholder="Minimum Stock Level"
                  type="number"
                  startDecorator={<Typography level="body-sm">Min:</Typography>}
                />
                <Input
                  name="max_stock"
                  value={form.max_stock}
                  onChange={e => setForm({ ...form, max_stock: e.target.value })}
                  placeholder="Maximum Stock Level"
                  type="number"
                  startDecorator={<Typography level="body-sm">Max:</Typography>}
                />
                <Input
                  name="reorder_amount"
                  value={form.reorder_amount}
                  onChange={e => setForm({ ...form, reorder_amount: e.target.value })}
                  placeholder="Reorder Amount"
                  type="number"
                  startDecorator={<Typography level="body-sm">Reorder:</Typography>}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="plain" disabled={saving || uploading}>Cancel</Button>
          <Button onClick={handleSave} variant="solid" loading={saving} disabled={saving || uploading}>Save</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

export default withAuth(ProductTableForm);
