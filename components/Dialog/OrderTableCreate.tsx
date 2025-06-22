import * as React from 'react';
import {
  Button, FormControl, FormLabel, Input, Modal, ModalDialog, ModalClose, Select, Option, Typography, Box, Divider, IconButton
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../../utils/supabaseClient';
import Autocomplete from '@mui/joy/Autocomplete';

type OrderStatus = 'Paid' | 'Refunded' | 'Cancelled';

interface Product {
  id: string;
  ProductName: string;
  SalesPrice?: number; // Add SalesPrice for autofill
}

interface OrderItemDraft {
  id: string; // unique key for React
  product: Product | null;
  quantity: number;
  unitprice: number;
  discount: number;
}

interface OrderTableCreateProps {
  open: boolean;
  creating: boolean;
  newOrder: {
    date: string;
    status: OrderStatus;
    customer_name: string;
    customer_email: string;
  };
  setNewOrder: React.Dispatch<React.SetStateAction<{
    date: string;
    status: OrderStatus;
    customer_name: string;
    customer_email: string;
  }>>;
  onClose: () => void;
  onCreate: (orderItems: { product_uuid: string; quantity: number; unitprice: number; discount: number }[], orderDiscount: number) => void;
}

const OrderTableCreate: React.FC<OrderTableCreateProps> = ({
  open,
  creating,
  newOrder,
  setNewOrder,
  onClose,
  onCreate,
}) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orderItems, setOrderItems] = React.useState<OrderItemDraft[]>([
    { id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: 0 },
  ]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [productsError, setProductsError] = React.useState<string | null>(null);
  const [orderDiscount, setOrderDiscount] = React.useState<number>(0);
  const [discountDialogOpen, setDiscountDialogOpen] = React.useState(false);
  const [pendingOrderDiscount, setPendingOrderDiscount] = React.useState<number | null>(null);
  const [orderDiscountTouched, setOrderDiscountTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setOrderItems([{ id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: 0 }]);
      setError(null);
      // Default date to today if not already set
      setNewOrder(o => ({
        ...o,
        date: o.date || new Date().toISOString().slice(0, 10)
      }));
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setLoadingProducts(true);
    setProductsError(null);
    supabase.from('Products').select('*').then(({ data, error }: { data: any; error: any }) => {
      if (!error && data) {
        if (data.length === 0) {
          setProductsError('No products available. Please add products first.');
        }
        setProducts(data.map((p: any) => ({
          id: p.uuid || p.id, // Prefer uuid, fallback to id
          ProductName: p.ProductName,
          SalesPrice: p.SalesPrice ?? 0
        })));
      } else {
        setProductsError('Failed to load products.');
      }
      setLoadingProducts(false);
    });
  }, [open]);

  const handleAddItem = () => {
    setOrderItems(items => [...items, { id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: orderDiscount }]);
  };

  const handleRemoveItem = (idx: number) => {
    setOrderItems(items => items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof OrderItemDraft, value: any) => {
    setOrderItems(items => items.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'product' && value) {
        const found = products.find(p => p.id === value.id);
        return { ...item, product: value, unitprice: found?.SalesPrice ?? 0 };
      }
      if (field === 'product' && !value) {
        return { ...item, product: null, unitprice: 0 };
      }
      return { ...item, [field]: value };
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = orderItems
      .filter(item => item.product && item.product.id && item.quantity > 0)
      .map(item => ({
        product_uuid: item.product!.id,
        quantity: item.quantity,
        unitprice: item.unitprice,
        discount: item.discount,
      }));
    if (items.length === 0) {
      setError('Please add at least one valid order item.');
      return;
    }
    setError(null);
    onCreate(items, orderDiscount);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog minWidth={400}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>Create Order</Typography>
        <form onSubmit={handleSubmit}>
          <FormControl sx={{ mb: 2 }} required>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={newOrder.date}
              onChange={e => setNewOrder(o => ({ ...o, date: e.target.value }))}
              required
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }} required>
            <FormLabel>Status</FormLabel>
            <Select
              value={newOrder.status}
              onChange={(_event: React.SyntheticEvent | null, v: OrderStatus | null) => setNewOrder(o => ({ ...o, status: v || 'Paid' }))}
            >
              <Option value="Paid">Paid</Option>
              <Option value="Refunded">Refunded</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </FormControl>
          <FormControl sx={{ mb: 2 }} required>
            <FormLabel>Customer Name</FormLabel>
            <Input
              value={newOrder.customer_name}
              onChange={e => setNewOrder(o => ({ ...o, customer_name: e.target.value }))}
              required
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }} required>
            <FormLabel>Customer Email</FormLabel>
            <Input
              type="email"
              value={newOrder.customer_email}
              onChange={e => setNewOrder(o => ({ ...o, customer_email: e.target.value }))}
              required
            />
          </FormControl>
          {/* Move Order Discount here, above Order Items */}
          <FormControl sx={{ mb: 2 }} required>
            <FormLabel>Order Discount (%)</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Input
                type="number"
                value={orderDiscount}
                disabled={orderItems.length > 0 && !(orderItems.length === 1 && !orderItems[0].product)}
                onChange={e => {
                  const newDiscount = Math.max(0, Math.min(100, Math.floor(Number(e.target.value))));
                  setOrderDiscount(newDiscount);
                  setOrderItems(items => items.map(item => ({ ...item, discount: newDiscount })));
                }}
                slotProps={{ input: { min: 0, max: 100, step: 1 } }}
                required
                placeholder="Order Discount %"
                sx={{ flex: 1 }}
              />
              {(orderItems.length > 1 || (orderItems.length === 1 && orderItems[0].product)) && (
                <Button size="sm" variant="outlined" onClick={() => setDiscountDialogOpen(true)}>
                  Edit
                </Button>
              )}
            </Box>
          </FormControl>
          {error && (
            <Typography color="danger" sx={{ mb: 1 }}>{error}</Typography>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Replace Typography with Box to avoid <div> inside <p> */}
          <Box sx={{ mb: 1, fontWeight: 'lg', fontSize: 'lg' }}>Order Items</Box>
          {productsError && (
            <Typography color="danger" sx={{ mb: 1 }}>{productsError}</Typography>
          )}
          {orderItems.map((item, idx) => (
            <Box key={item.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => option.ProductName}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={item.product}
                onChange={(_, value) => handleItemChange(idx, 'product', value)}
                loading={loadingProducts}
                placeholder={loadingProducts ? 'Loading...' : 'Search product'}
                sx={{ minWidth: 220 }}
                disabled={products.length === 0}
                required
                renderOption={(props, option) => (
                  <li {...props}>{option.ProductName}</li>
                )}
              />
              <Input
                type="number"
                value={item.quantity}
                onChange={e => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                sx={{ width: 80 }}
                required
                slotProps={{ input: { min: 1 } }}
              />
              <Input
                type="number"
                value={item.unitprice}
                onChange={e => handleItemChange(idx, 'unitprice', Math.max(0, Number(e.target.value)))}
                sx={{ width: 100 }}
                required
                slotProps={{ input: { min: 0, step: 0.01 } }}
                placeholder="Unit Price"
              />
              <Input
                type="number"
                value={item.discount}
                onChange={e => handleItemChange(idx, 'discount', Math.max(0, Math.min(100, Math.floor(Number(e.target.value)))))}
                sx={{ width: 80 }}
                required
                slotProps={{ input: { min: 0, max: 100, step: 1 } }}
                placeholder="Discount %"
              />
              <IconButton size="sm" color="danger" onClick={() => handleRemoveItem(idx)} disabled={orderItems.length === 1}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startDecorator={<AddIcon />} variant="soft" size="sm" onClick={handleAddItem} sx={{ mb: 2 }} disabled={!!productsError}>
            Add Item
          </Button>

          {/* Discount change dialog using ModalDialog */}
          <Modal open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)}>
            <ModalDialog sx={{ minWidth: 350 }}>
              <Typography level="title-md" sx={{ mb: 1 }}>
                Change Order Discount
              </Typography>
              <FormControl sx={{ mb: 2 }} required>
                <FormLabel>Change discount to (%)</FormLabel>
                <Input
                  type="number"
                  value={pendingOrderDiscount ?? orderDiscount}
                  onChange={e => setPendingOrderDiscount(Math.max(0, Math.min(100, Math.floor(Number(e.target.value)))))}
                  slotProps={{ input: { min: 0, max: 100, step: 1 } }}
                  required
                  autoFocus
                />
              </FormControl>
              <Typography sx={{ mb: 2 }}>
                How do you want to apply the new order discount?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setOrderDiscount(pendingOrderDiscount!);
                  setOrderItems(items => items.map(item => ({ ...item, discount: pendingOrderDiscount! })));
                  setDiscountDialogOpen(false);
                  setPendingOrderDiscount(null);
                }}>Overwrite all</Button>
                <Button onClick={() => {
                  setOrderDiscount(pendingOrderDiscount!);
                  setOrderItems(items => items.map(item => {
                    // Only update if the new discount is higher than the current item discount
                    if (item.discount < pendingOrderDiscount!) {
                      return { ...item, discount: pendingOrderDiscount! };
                    }
                    return item;
                  }));
                  setDiscountDialogOpen(false);
                  setPendingOrderDiscount(null);
                }}>Set discount on lower</Button>
                <Button variant="plain" onClick={() => {
                  setDiscountDialogOpen(false);
                  setPendingOrderDiscount(null);
                }}>Cancel</Button>
              </Box>
            </ModalDialog>
          </Modal>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" loading={creating} color="primary" disabled={!!productsError}>
              Create
            </Button>
            <Button variant="plain" onClick={onClose} disabled={creating}>
              Cancel
            </Button>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default OrderTableCreate;
