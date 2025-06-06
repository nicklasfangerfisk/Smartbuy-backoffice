import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';

export default function ProductTable() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    ProductName: '',
    SalesPrice: '',
    CostPrice: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState({ ProductName: '', SalesPrice: '', CostPrice: '' });
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUploading, setImageUploading] = React.useState(false);

  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('Products').select('*');
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImageToStorage = async (file: File, productId: number) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${productId}_${Date.now()}.${fileExt}`;
    // Remove any existing file with the same path (optional, for overwrite safety)
    await supabase.storage.from('productimages').remove([filePath]);
    const { error: uploadError } = await supabase.storage.from('productimages').upload(filePath, file, { upsert: true });
    if (!uploadError) {
      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from('productimages').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;
      // Update the product row with the public URL
      await supabase.from('Products').update({ ImageUrl: publicUrl }).eq('id', productId);
    }
    return { error: uploadError, filePath };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Insert product first
    const { data, error } = await supabase.from('Products').insert([
      {
        ProductName: form.ProductName,
        SalesPrice: parseFloat(form.SalesPrice),
        CostPrice: parseFloat(form.CostPrice),
        CreatedAt: new Date().toISOString(),
      },
    ]).select();
    let newProductId = data && data[0] && data[0].id;
    // Upload image if present
    if (!error && imageFile && newProductId) {
      setImageUploading(true);
      await uploadImageToStorage(imageFile, newProductId);
      setImageUploading(false);
    }
    setSubmitting(false);
    if (!error) {
      setForm({ ProductName: '', SalesPrice: '', CostPrice: '' });
      setImageFile(null);
      // Refresh products
      const { data } = await supabase.from('Products').select('*');
      if (data) setProducts(data);
    }
  };

  const handleDelete = async (id: number) => {
    setSubmitting(true);
    const { error } = await supabase.from('Products').delete().eq('id', id);
    setSubmitting(false);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const startEdit = (product: any) => {
    setEditId(product.id);
    setEditForm({
      ProductName: product.ProductName,
      SalesPrice: product.SalesPrice,
      CostPrice: product.CostPrice,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setSubmitting(true);
    const { error } = await supabase.from('Products').update({
      ProductName: editForm.ProductName,
      SalesPrice: parseFloat(editForm.SalesPrice),
      CostPrice: parseFloat(editForm.CostPrice),
    }).eq('id', editId);
    setSubmitting(false);
    if (!error) {
      setEditId(null);
      setEditForm({ ProductName: '', SalesPrice: '', CostPrice: '' });
      // Refresh products
      const { data } = await supabase.from('Products').select('*');
      if (data) setProducts(data);
    }
  };

  return (
    <Sheet sx={{ width: '100%', borderRadius: 'sm', overflow: 'auto', mt: 2 }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Products
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          name="ProductName"
          placeholder="Product name"
          value={form.ProductName}
          onChange={handleChange}
          required
        />
        <Input
          name="SalesPrice"
          placeholder="Sales price"
          type="number"
          value={form.SalesPrice}
          onChange={handleChange}
          required
        />
        <Input
          name="CostPrice"
          placeholder="Cost price"
          type="number"
          value={form.CostPrice}
          onChange={handleChange}
          required
        />
        <Button
          component="label"
          variant="outlined"
          startDecorator={<ImageIcon />}
          disabled={submitting || imageUploading}
        >
          {imageFile ? imageFile.name : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Button>
        <Button type="submit" loading={submitting || imageUploading} disabled={submitting || imageUploading} variant="solid">
          Add Product
        </Button>
      </Box>
      <Table stickyHeader hoverRow>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Product</th>
            <th>Sales price</th>
            <th>Cost price</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              {/* Show image if available */}
              <td>
                {product.ImageUrl ? (
                  <img
                    src={product.ImageUrl}
                    alt={product.ProductName}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <span style={{ color: '#aaa' }}>No image</span>
                )}
              </td>
              {editId === product.id ? (
                <>
                  <td>
                    <Input
                      name="ProductName"
                      value={editForm.ProductName}
                      onChange={handleEditChange}
                      size="sm"
                    />
                  </td>
                  <td>
                    <Input
                      name="SalesPrice"
                      type="number"
                      value={editForm.SalesPrice}
                      onChange={handleEditChange}
                      size="sm"
                    />
                  </td>
                  <td>
                    <Input
                      name="CostPrice"
                      type="number"
                      value={editForm.CostPrice}
                      onChange={handleEditChange}
                      size="sm"
                    />
                  </td>
                  <td>{product.CreatedAt}</td>
                  <td style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <IconButton size="sm" color="primary" onClick={handleEditSubmit} disabled={submitting || imageUploading} type="button">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="sm" color="neutral" onClick={() => setEditId(null)} disabled={submitting || imageUploading} type="button">
                      ✕
                    </IconButton>
                    <Button
                      component="label"
                      size="sm"
                      variant="outlined"
                      startDecorator={<ImageIcon />}
                      disabled={submitting || imageUploading}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageUploading(true);
                            const file = e.target.files[0];
                            await uploadImageToStorage(file, product.id);
                            // Refresh products after upload
                            const { data } = await supabase.from('Products').select('*');
                            if (data) setProducts(data);
                            setImageUploading(false);
                          }
                        }}
                      />
                      <ImageIcon />
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td>{product.ProductName}</td>
                  <td>{product.SalesPrice}</td>
                  <td>{product.CostPrice}</td>
                  <td>{product.CreatedAt}</td>
                  <td>
                    <IconButton size="sm" color="primary" onClick={() => startEdit(product)} disabled={submitting}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="sm" color="danger" onClick={() => handleDelete(product.id)} disabled={submitting}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {loading && <Typography>Loading...</Typography>}
    </Sheet>
  );
}
