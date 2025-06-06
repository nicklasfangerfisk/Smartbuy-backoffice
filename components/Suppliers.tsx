import * as React from 'react';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import { supabase } from '../utils/supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SupplierDisplay from './SupplierDisplay';

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

  async function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    let image_url = '';
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('supplierimages').upload(fileName, imageFile);
      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message);
        setCreating(false);
        return;
      }
      image_url = supabase.storage.from('supplierimages').getPublicUrl(fileName).data.publicUrl;
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
      const fileExt = editImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('supplierimages').upload(fileName, editImageFile);
      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message);
        setSavingEdit(false);
        return;
      }
      image_url = supabase.storage.from('supplierimages').getPublicUrl(fileName).data.publicUrl;
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Suppliers</Typography>
      <Box component="form" onSubmit={handleCreateSupplier} sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} sx={{ minWidth: 180 }} />
        <Input placeholder="Contact Name" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} sx={{ minWidth: 180 }} />
        <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} sx={{ minWidth: 180 }} />
        <Input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} sx={{ minWidth: 140 }} />
        <Input placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} sx={{ minWidth: 220 }} />
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ minWidth: 180 }} />
        <Button type="submit" loading={creating} variant="solid">Add Supplier</Button>
      </Box>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="danger">Error: {error}</Typography>}
      <Grid container spacing={2}>
        {suppliers.map((supplier) => (
          <Grid xs={12} md={4} key={supplier.id}>
            <Card variant="outlined" sx={{ cursor: editId === supplier.id ? 'default' : 'pointer' }} onClick={() => {
              if (editId !== supplier.id) setSelectedSupplier(supplier);
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  {editId === supplier.id ? (
                    <Box component="form" onSubmit={handleSaveEdit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Input required placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      <Input placeholder="Contact Name" value={editForm.contact_name} onChange={e => setEditForm(f => ({ ...f, contact_name: e.target.value }))} />
                      <Input placeholder="Email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                      <Input placeholder="Phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                      <Input placeholder="Address" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
                      <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button type="submit" loading={savingEdit} startDecorator={<SaveIcon />}>Save</Button>
                        <Button type="button" variant="outlined" color="neutral" onClick={handleCancelEdit} startDecorator={<CancelIcon />}>Cancel</Button>
                      </Box>
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
