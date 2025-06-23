import * as React from 'react';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SupplierDisplay from './SupplierDisplay';
import SupplierForm from '../Dialog/SupplierForm';
import Input from '@mui/joy/Input';

/**
 * Interface for supplier objects.
 */
interface Supplier {
  id: string;
  name: string;
  email: string;
  contact_name: string;
  phone: string;
  address: string;
  image_url: string;
}

/**
 * Utility function to upload an image to Supabase storage.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 */
// Fix missing return value in uploadImage and undefined setError
async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from('supplierimages').upload(fileName, file);
  if (uploadError) {
    throw new Error('Image upload failed: ' + (uploadError as Error).message);
  }
  const publicUrl = supabase.storage.from('supplierimages').getPublicUrl(fileName).data.publicUrl;
  if (!publicUrl) {
    throw new Error('Failed to retrieve public URL for uploaded image.');
  }
  return publicUrl;
}

/**
 * Component to display and manage suppliers.
 */
export default function Suppliers() {
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
  const [creating, setCreating] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [savingEdit, setSavingEdit] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<any | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    async function fetchSuppliers() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Suppliers').select('*');
      if (!error && data) {
        setSuppliers(data);
      } else if (error) {
        setError(error.message || 'Failed to fetch suppliers');
      }
      setLoading(false);
    }
    fetchSuppliers();
  }, []);

  // Fix uploadError type issue in handleCreateSupplier and handleSaveEdit
  async function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    let image_url = '';
    if (imageFile) {
      try {
        image_url = await uploadImage(imageFile);
      } catch (error) {
        setError((error as Error).message);
        setCreating(false);
        return;
      }
    }
    const { data, error } = await supabase.from('Suppliers').insert([{ ...form, image_url }]).select();
    if (!error && data && data.length > 0) {
      setSuppliers((prev) => [...prev, data[0]]);
      setForm({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
      setImageFile(null);
    } else if (error) {
      setError(error.message || 'Failed to create supplier');
    }
    setCreating(false);
  }

  async function handleEditSupplier(supplier: any) {
    setEditId(supplier.id);
    setEditForm({
      name: supplier.name || '',
      email: supplier.email || '',
      contact_name: supplier.contact_name || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      image_url: supplier.image_url || '',
    });
    setEditImageFile(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    setError(null);
    let image_url = editForm.image_url;
    if (editImageFile) {
      try {
        image_url = await uploadImage(editImageFile);
      } catch (error) {
        setError((error as Error).message);
        setSavingEdit(false);
        return;
      }
    }
    const { data, error: updateError } = await supabase.from('Suppliers').update({ ...editForm, image_url }).eq('id', editId).select();
    if (!updateError && data && data.length > 0) {
      setSuppliers((prev) => prev.map(s => s.id === editId ? data[0] : s));
      setEditId(null);
      setEditForm({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
      setEditImageFile(null);
    } else if (updateError) {
      setError(updateError.message || 'Failed to update supplier');
    }
    setSavingEdit(false);
  }

  function handleCancelEdit() {
    setEditId(null);
    setEditForm({ name: '', email: '', contact_name: '', phone: '', address: '', image_url: '' });
    setEditImageFile(null);
  }

  // Filter suppliers by name, contact_name, email, phone, or address
  const filteredSuppliers = suppliers.filter(supplier => {
    const q = search.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(q) ||
      supplier.contact_name?.toLowerCase().includes(q) ||
      supplier.email?.toLowerCase().includes(q) ||
      supplier.phone?.toLowerCase().includes(q) ||
      supplier.address?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Suppliers</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="solid" onClick={() => setAddOpen(true)} sx={{ minWidth: 140 }}>
          Add Supplier
        </Button>
      </Box>
      <SupplierForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          // Refresh suppliers list
          supabase.from('Suppliers').select('*').then(({ data, error }: { data: any; error: any }) => {
            if (data) setSuppliers(data);
          });
        }}
        mode="add"
      />
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="danger">Error: {error}</Typography>}
      <Grid container spacing={2}>
        {filteredSuppliers.map((supplier) => (
          <Grid xs={12} md={4} key={supplier.id}>
            <Card variant="outlined" sx={{ cursor: editId === supplier.id ? 'default' : 'pointer' }} onClick={() => {
              if (editId !== supplier.id) setSelectedSupplier(supplier);
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  {editId === supplier.id ? (
                    <Box component="form" onSubmit={handleSaveEdit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <input type="hidden" value={supplier.id} />
                      <input type="hidden" value={supplier.image_url} />
                      <Button type="submit" loading={savingEdit} startDecorator={<SaveIcon />}>Save</Button>
                      <Button type="button" variant="outlined" color="neutral" onClick={handleCancelEdit} startDecorator={<CancelIcon />}>Cancel</Button>
                    </Box>
                  ) : (
                    <>
                      <Typography level="h4">{supplier.name}</Typography>
                      <Typography level="body-md">Contact Name: {supplier.contact_name}</Typography>
                      <Typography level="body-md">Email: {supplier.email}</Typography>
                      <Typography level="body-md">Phone: {supplier.phone}</Typography>
                      <Typography level="body-md">Address: {supplier.address}</Typography>
                      <Button size="sm" variant="plain" startDecorator={<EditIcon />} onClick={e => { e.stopPropagation(); handleEditSupplier(supplier); }} sx={{ mt: 1 }}>Edit</Button>
                    </>
                  )}
                </Box>
                {/* Image on the right */}
                <Box sx={{ minWidth: 100, maxWidth: 120, textAlign: 'right' }}>
                  {(editId === supplier.id ? editForm.image_url : supplier.image_url) && (
                    <img
                      src={editId === supplier.id ? editForm.image_url : supplier.image_url}
                      alt={supplier.name}
                      style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'cover' }}
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedSupplier && (
        <SupplierDisplay supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      )}
    </Box>
  );
}
