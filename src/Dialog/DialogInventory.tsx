import * as React from 'react';
import Dialog from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import type { Database } from '../general/supabase.types';

interface DialogInventoryProps {
  open: boolean;
  onClose: () => void;
  product: Database['public']['Tables']['Products']['Row'] | null;
  onSave: (values: { min_stock: number; max_stock: number; reorder_amount: number }) => void;
}

const DialogInventory: React.FC<DialogInventoryProps> = ({ open, onClose, product, onSave }) => {
  const [minStock, setMinStock] = React.useState<number>(product?.min_stock ?? 0);
  const [maxStock, setMaxStock] = React.useState<number>(product?.max_stock ?? 0);
  const [reorderAmount, setReorderAmount] = React.useState<number>(product?.reorder_amount ?? 0);

  React.useEffect(() => {
    setMinStock(product?.min_stock ?? 0);
    setMaxStock(product?.max_stock ?? 0);
    setReorderAmount(product?.reorder_amount ?? 0);
  }, [product]);

  const handleSave = () => {
    onSave({ min_stock: minStock, max_stock: maxStock, reorder_amount: reorderAmount });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 320, width: { xs: '90vw', sm: 400 } }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>Edit Inventory Settings</Typography>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Product ID</FormLabel>
            <Input value={product.ProductID ?? ''} disabled />
          </FormControl>
          <FormControl>
            <FormLabel>Product Name</FormLabel>
            <Input value={product.ProductName ?? ''} disabled />
          </FormControl>
          <FormControl>
            <FormLabel>Current Stock</FormLabel>
            <Input value={'N/A'} disabled />
          </FormControl>
          <FormControl>
            <FormLabel>Minimum Stock</FormLabel>
            <Input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <FormLabel>Maximum Stock</FormLabel>
            <Input type="number" value={maxStock} onChange={e => setMaxStock(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <FormLabel>Reorder Amount</FormLabel>
            <Input type="number" value={reorderAmount} onChange={e => setReorderAmount(Number(e.target.value))} />
          </FormControl>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="plain" onClick={onClose}>Cancel</Button>
          <Button variant="solid" onClick={handleSave}>Save</Button>
        </Box>
      </ModalDialog>
    </Dialog>
  );
};

export default DialogInventory;
