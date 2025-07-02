/*
Layout & Responsive Design Refactor Documentation
-------------------------------------------------

Problem:
- Content from multiple pages (e.g., dashboard, products) was visible simultaneously due to insufficient layout isolation.
- Responsive design was inconsistent, with some manual JS checks and static layouts.
- Build errors (e.g., Vercel) due to incorrect prop usage in mobile components.

Solution (June 2025):
- All main page components (including this one) now wrap their desktop views in a full-size Box/Sheet/Card to ensure strict page isolation and prevent bleed-through.
- Mobile/desktop views are conditionally rendered using MUI's useMediaQuery.
- Removed invalid props from mobile components (e.g., ProductTableMobile).
- Responsive design is enforced using MUI breakpoints and layout containers (Box, Card, etc.).

Best Practices Going Forward:
- Use a single layout shell (App-level) and strict router-based navigation to ensure only one page is visible at a time.
- Use MUI's responsive utilities (breakpoints, sx, useMediaQuery) for dynamic layout, not manual window checks.
- Always wrap main content in a container that covers the background and prevents layout bleed-through.
- Avoid passing unnecessary props to mobile/desktop components; let them manage their own state if possible.
- Document any major layout or responsive changes in the codebase for future maintainers.

Next Steps (Optional):
- Migrate to a dynamic, router-based layout if not already in place.
- Refactor all pages/components to follow this strict layout and responsive strategy.
- Review for any remaining layout or prop errors.
*/

import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
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
import Chip from '@mui/joy/Chip';
import Tooltip from '@mui/joy/Tooltip';
import ProductTableForm from '../Dialog/ProductTableForm';
import useMediaQuery from '@mui/material/useMediaQuery';
import ProductTableMobile from './PageProductMobile';
import PageLayout from '../layouts/PageLayout';

/**
 * ProductTable component displays a list of products in a table format.
 * It supports adding, editing, and searching for products.
 *
 * @returns {JSX.Element} The rendered ProductTable component.
 */

export default function ProductTable() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [productStocks, setProductStocks] = React.useState<{ [productId: string]: number }>({});
  const [stockLoading, setStockLoading] = React.useState(false);
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
  const isMobile = useMediaQuery('(max-width: 600px)');

  // Calculate current stock for all products
  const fetchProductStocks = async (productList: any[]) => {
    setStockLoading(true);
    const stockMap: { [productId: string]: number } = {};
    
    try {
      // Get all stock movements in one query
      const { data: movements, error } = await supabase
        .from('stock_movements')
        .select('product_id, movement_type, quantity');

      if (!error && movements) {
        // Calculate stock for each product
        productList.forEach(product => {
          const productMovements = movements.filter(m => m.product_id === product.uuid);
          const totalStock = productMovements.reduce((total, movement) => {
            switch (movement.movement_type) {
              case 'incoming':
                return total + movement.quantity;
              case 'outgoing':
                return total - movement.quantity;
              case 'adjustment':
                return total + movement.quantity; // Already signed
              default:
                return total;
            }
          }, 0);
          stockMap[product.uuid] = totalStock;
        });
      }
    } catch (err) {
      console.error('Error fetching stock levels:', err);
    } finally {
      setProductStocks(stockMap);
      setStockLoading(false);
    }
  };

  // Get stock level status and color
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { status: 'Out of Stock', color: 'danger' as const };
    if (stock <= 10) return { status: 'Low Stock', color: 'warning' as const };
    return { status: 'In Stock', color: 'success' as const };
  };

  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('Products').select('*');
      if (!error && data) {
        setProducts(data);
        // Fetch stock levels for all products
        await fetchProductStocks(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  /**
   * Handles changes to the form inputs for adding or editing a product.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handles changes to the image input for uploading a product image.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */

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
      if (data) {
        setProducts(data);
        await fetchProductStocks(data);
      }
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
      if (data) {
        setProducts(data);
        await fetchProductStocks(data);
      }
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
      if (data) {
        setProducts(data);
        await fetchProductStocks(data);
      }
    }
  };

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.ProductName?.toLowerCase().includes(search.toLowerCase())
  );

  if (isMobile) {
    return <ProductTableMobile />;
  }
  return (
    <PageLayout>
      <Box
        sx={{
          width: '100%',
          minHeight: '100dvh',
          bgcolor: 'background.body',
          borderRadius: 0,
          boxShadow: 'none',
          pl: 0,
          pr: 0,
        }}
      >
        <Typography level="h2" sx={{ mb: 2, fontSize: 'xlarge' }}>
          Products
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Input
            placeholder="Search products..."
            sx={{ flex: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          onClose={() => {
            setEditDialogOpen(false);
            setEditProduct(null);
          }}
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
                <th>Current Stock</th>
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
                  <td>
                    {stockLoading ? (
                      <Typography level="body-sm" sx={{ color: 'neutral.500' }}>Loading...</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={getStockStatus(productStocks[product.uuid] || 0).color}
                        >
                          {getStockStatus(productStocks[product.uuid] || 0).status}
                        </Chip>
                        <Tooltip 
                          title={`Current stock level: ${productStocks[product.uuid] || 0} units`}
                          arrow
                        >
                          <Typography 
                            level="body-sm" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: getStockStatus(productStocks[product.uuid] || 0).color === 'danger' ? 'danger.500' :
                                     getStockStatus(productStocks[product.uuid] || 0).color === 'warning' ? 'warning.600' : 
                                     'success.600'
                            }}
                          >
                            {productStocks[product.uuid] || 0}
                          </Typography>
                        </Tooltip>
                        {/* Stock level bar indicator */}
                        <Box
                          sx={{
                            width: 40,
                            height: 4,
                            bgcolor: 'neutral.200',
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(100, Math.max(0, ((productStocks[product.uuid] || 0) / 50) * 100))}%`,
                              height: '100%',
                              bgcolor: getStockStatus(productStocks[product.uuid] || 0).color === 'danger' ? 'danger.400' :
                                      getStockStatus(productStocks[product.uuid] || 0).color === 'warning' ? 'warning.400' : 
                                      'success.400',
                              borderRadius: 2
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </td>
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
                            if (data) {
                              setProducts(data);
                              await fetchProductStocks(data);
                            }
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
                  <td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Box>
    </PageLayout>
  );
}
