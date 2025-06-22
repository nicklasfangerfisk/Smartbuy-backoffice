import * as React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import IconButton from '@mui/joy/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import Avatar from '@mui/joy/Avatar';
import ProductTableForm from '../Dialog/ProductTableForm';

export default function ProductTableMobile() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<any>(null);

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

  const handleDelete = async (uuid: string) => {
    setLoading(true);
    await supabase.from('Products').delete().eq('uuid', uuid);
    setProducts(products.filter((p) => p.uuid !== uuid));
    setLoading(false);
  };

  const handleAddDialogSave = async (values: { ProductName: string; SalesPrice: string; CostPrice: string }) => {
    setLoading(true);
    await supabase.from('Products').insert([
      {
        ProductName: values.ProductName,
        SalesPrice: parseFloat(values.SalesPrice),
        CostPrice: parseFloat(values.CostPrice),
        CreatedAt: new Date().toISOString(),
      },
    ]);
    const { data } = await supabase.from('Products').select('*');
    if (data) setProducts(data);
    setAddDialogOpen(false);
    setLoading(false);
  };

  const handleEditDialogSave = async (values: { ProductName: string; SalesPrice: string; CostPrice: string }) => {
    if (!editProduct) return;
    setLoading(true);
    await supabase.from('Products').update({
      ProductName: values.ProductName,
      SalesPrice: parseFloat(values.SalesPrice),
      CostPrice: parseFloat(values.CostPrice),
    }).eq('uuid', editProduct.uuid);
    const { data } = await supabase.from('Products').select('*');
    if (data) setProducts(data);
    setEditDialogOpen(false);
    setEditProduct(null);
    setLoading(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Products</Typography>
      <Button onClick={() => setAddDialogOpen(true)} sx={{ mb: 2 }} variant="solid">
        Add Product
      </Button>
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
      <List>
        {products.map((product) => (
          <ListItem key={product.uuid} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ListItemDecorator>
              {product.ImageUrl ? (
                <Avatar src={product.ImageUrl} />
              ) : (
                <Avatar><ImageIcon /></Avatar>
              )}
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-md">{product.ProductName}</Typography>
              <Typography level="body-sm">Sales: {product.SalesPrice} | Cost: {product.CostPrice}</Typography>
              <Typography level="body-xs" color="neutral">{product.CreatedAt}</Typography>
            </ListItemContent>
            <IconButton size="sm" color="primary" onClick={() => { setEditProduct(product); setEditDialogOpen(true); }}>
              <EditIcon />
            </IconButton>
            <IconButton size="sm" color="danger" onClick={() => handleDelete(product.uuid)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
        {products.length === 0 && !loading && (
          <Typography level="body-sm" sx={{ textAlign: 'center', color: '#888', width: '100%' }}>No products found.</Typography>
        )}
      </List>
    </Box>
  );
}
