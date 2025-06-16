import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: any;
  onSave: (values: { ProductName: string; SalesPrice: string; CostPrice: string }) => void;
}

export default function ProductDialog({ open, onClose, product, onSave }: ProductDialogProps) {
  const [form, setForm] = React.useState({
    ProductName: product?.ProductName || '',
    SalesPrice: product?.SalesPrice?.toString() || '',
    CostPrice: product?.CostPrice?.toString() || '',
  });

  React.useEffect(() => {
    setForm({
      ProductName: product?.ProductName || '',
      SalesPrice: product?.SalesPrice?.toString() || '',
      CostPrice: product?.CostPrice?.toString() || '',
    });
  }, [product]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Input
            name="ProductName"
            value={form.ProductName}
            onChange={e => setForm({ ...form, ProductName: e.target.value })}
            placeholder="Product Name"
            sx={{ mb: 2 }}
          />
          <Input
            name="SalesPrice"
            value={form.SalesPrice}
            onChange={e => setForm({ ...form, SalesPrice: e.target.value })}
            placeholder="Sales Price"
            type="number"
            sx={{ mb: 2 }}
          />
          <Input
            name="CostPrice"
            value={form.CostPrice}
            onChange={e => setForm({ ...form, CostPrice: e.target.value })}
            placeholder="Cost Price"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="plain">Cancel</Button>
          <Button onClick={() => onSave(form)} variant="solid">Save</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
