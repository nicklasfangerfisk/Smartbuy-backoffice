import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';

/**
 * Props for the ProductDialog component.
 */
interface ProductDialogProps {
  /**
   * Controls the visibility of the modal.
   */
  open: boolean;

  /**
   * Callback function to close the modal.
   */
  onClose: () => void;

  /**
   * The product object to edit.
   */
  product: {
    ProductName: string;
    SalesPrice: number;
    CostPrice: number;
  } | null;

  /**
   * Callback function to save the product details.
   * @param values - The updated product details.
   */
  onSave: (values: { ProductName: string; SalesPrice: string; CostPrice: string }) => void;
}

/**
 * A modal dialog component for editing product details.
 */
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
    <Modal open={open} onClose={onClose} aria-labelledby="product-dialog-title">
      <ModalDialog>
        <DialogTitle id="product-dialog-title">Edit Product</DialogTitle>
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
