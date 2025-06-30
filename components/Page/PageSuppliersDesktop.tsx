import * as React from 'react';
import Card from '@mui/joy/Card';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import SupplierForm from '../Dialog/SupplierForm';
import Typography from '@mui/joy/Typography';
import PageLayout from '../layouts/PageLayout';
import Input from '@mui/joy/Input';

// Define the Supplier type for better type safety
interface Supplier {
  id: string | number;
  name: string;
  email?: string;
  contact_name?: string;
  phone?: string;
  address?: string;
  image_url?: string;
}

export default function PageSuppliersDesktop() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [editedSupplier, setEditedSupplier] = React.useState<Supplier | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'view' | 'edit' | 'add'>('view');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('Suppliers').select('*');
    if (error) console.log('error', error);
    else setSuppliers(data || []);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditedSupplier(supplier);
    setMode('edit');
    setIsOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    const { error } = await supabase.from('Suppliers').delete().eq('id', id);
    if (error) console.log('error', error);
    else fetchSuppliers();
  };

  const handleSave = async (supplier: Supplier) => {
    const { error } = await supabase
      .from('Suppliers')
      .upsert(supplier);
    if (error) console.log('error', error);
    else {
      setIsOpen(false);
      fetchSuppliers();
    }
  };

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
          pt: 0, // Remove top padding for consistency
          pb: 0,
        }}
      >
        <Typography level="h2" sx={{ mb: 2, fontSize: 'xlarge', textAlign: 'left' }} gutterBottom>
          Suppliers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="solid"
            onClick={() => {
              setEditedSupplier(null);
              setMode('add');
              setIsOpen(true);
            }}
            sx={{ minWidth: 140 }}
          >
            Add Supplier
          </Button>
        </Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {suppliers
            .filter((supplier) =>
              supplier.name?.toLowerCase().includes(search.toLowerCase()) ||
              supplier.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
              supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
              supplier.phone?.toLowerCase().includes(search.toLowerCase()) ||
              supplier.address?.toLowerCase().includes(search.toLowerCase())
            )
            .map((supplier) => (
              <Grid key={supplier.id} xs={12} md={4}>
                <Card variant="outlined">
                  <Box sx={{ p: 2 }}>
                    <Typography level="h4" sx={{ mb: 1 }}>{supplier.name}</Typography>
                    <Typography level="body-md"><b>Address:</b> {supplier.address || 'N/A'}</Typography>
                    <Typography level="body-md"><b>Contact Name:</b> {supplier.contact_name || 'N/A'}</Typography>
                    <Typography level="body-md"><b>Email:</b> {supplier.email || 'N/A'}</Typography>
                    <Typography level="body-md"><b>Phone:</b> {supplier.phone || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(supplier)}
                      startDecorator={<EditIcon />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete(supplier.id)}
                      startDecorator={<CancelIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
        </Grid>
        <SupplierForm
          open={isOpen}
          onClose={() => setIsOpen(false)}
          supplier={editedSupplier as any}
          onSaved={() => {
            setIsOpen(false);
            fetchSuppliers();
          }}
          mode={mode === 'edit' || mode === 'add' ? mode : undefined}
        />
      </Box>
    </PageLayout>
  );
}
