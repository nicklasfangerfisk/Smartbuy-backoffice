import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';

/**
 * Props for the ProductTableForm component.
 */
interface ProductTableFormProps {
  /**
   * Controls the visibility of the modal.
   */
  open: boolean;

  /**
   * Callback function to close the modal.
   */
  onClose: () => void;

  /**
   * The product object to edit or add.
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
 * A modal dialog component for adding or editing product details.
 */
export default function ProductTableForm({ open, onClose, product, onSave }: ProductTableFormProps) {
  const [form, setForm] = React.useState({
    ProductName: product?.ProductName || '',
    SalesPrice: product?.SalesPrice?.toString() || '',
    CostPrice: product?.CostPrice?.toString() || '',
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm({
      ProductName: product?.ProductName || '',
      SalesPrice: product?.SalesPrice?.toString() || '',
      CostPrice: product?.CostPrice?.toString() || '',
    });
  }, [product]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="product-table-form-title">
      <ModalDialog>
        <DialogTitle id="product-table-form-title">{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
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
          <Button onClick={onClose} variant="plain" disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="solid" loading={saving} disabled={saving}>Save</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
