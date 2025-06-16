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
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import ProductTableForm from './ProductTableForm';

export default function ProductTable() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    ProductName: '',
    SalesPrice: '',
    CostPrice: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<any>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUploading, setImageUploading] = React.useState(false);
  const [search, setSearch] = React.useState('');

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

  const handleDelete = async (uuid: string) => {
    setSubmitting(true);
    const { error } = await supabase.from('Products').delete().eq('uuid', uuid);
    setSubmitting(false);
    if (!error) {
      setProducts(products.filter((p) => p.uuid !== uuid));
    }
  };

  const startEdit = (product: any) => {
    setEditProduct(product);
    setEditDialogOpen(true);
  };

  const handleEditDialogSave = async (values: { ProductName: string; SalesPrice: string; CostPrice: string }) => {
    if (!editProduct) return;
    setSubmitting(true);
    console.log('Editing product:', editProduct);
    console.log('Form values:', values);
    const { error, data } = await supabase.from('Products').update({
      ProductName: values.ProductName,
      SalesPrice: parseFloat(values.SalesPrice),
      CostPrice: parseFloat(values.CostPrice),
    }).eq('uuid', editProduct.uuid).select();
    if (error) {
      console.error('Supabase update error:', error);
      alert('Failed to update product: ' + error.message);
    } else {
      console.log('Update result:', data);
    }
    setSubmitting(false);
    setEditDialogOpen(false);
    setEditProduct(null);
    if (!error) {
      // Refresh products
      const { data } = await supabase.from('Products').select('*');
      if (data) setProducts(data);
    }
  };

  const handleAddDialogSave = async (values: { ProductName: string; SalesPrice: string; CostPrice: string }) => {
    setSubmitting(true);
    const { data, error } = await supabase.from('Products').insert([
      {
        ProductName: values.ProductName,
        SalesPrice: parseFloat(values.SalesPrice),
        CostPrice: parseFloat(values.CostPrice),
        CreatedAt: new Date().toISOString(),
      },
    ]).select();
    setSubmitting(false);
    setAddDialogOpen(false);
    if (!error) {
      // Refresh products
      const { data } = await supabase.from('Products').select('*');
      if (data) setProducts(data);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.ProductName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 32 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Products</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search products..."
          sx={{ flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          onClick={() => setAddDialogOpen(true)}
          loading={submitting || imageUploading}
          disabled={submitting || imageUploading}
          variant="solid"
        >
          Add Product
        </Button>
      </Box>
      <ProductTableForm
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        product={null}
        onSave={handleAddDialogSave}
      />
      <ProductTableForm
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditProduct(null); }}
        product={editProduct}
        onSave={handleEditDialogSave}
      />
      <Card>
        {loading && <LinearProgress />}
        <Table aria-label="Products" sx={{ minWidth: 700 }}>
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
            {filteredProducts.map((product) => (
              <tr key={product.uuid}>
                <td>{product.uuid}</td>
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
                <td>{product.ProductName}</td>
                <td>{product.SalesPrice}</td>
                <td>{product.CostPrice}</td>
                <td>{product.CreatedAt}</td>
                <td>
                  <IconButton size="sm" color="primary" onClick={() => startEdit(product)} disabled={submitting}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="sm" color="danger" onClick={() => handleDelete(product.uuid)} disabled={submitting}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    component="label"
                    size="sm"
                    color="neutral"
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
                  </IconButton>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
