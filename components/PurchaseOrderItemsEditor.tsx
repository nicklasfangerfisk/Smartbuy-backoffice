import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Autocomplete from '@mui/joy/Autocomplete';
import Box from '@mui/joy/Box';

// Types for product and item
interface Product {
  uuid: string;
  ProductName: string;
}

export interface PurchaseOrderItem {
  product_id: string | null;
  quantity: number;
  unit_price: number;
  notes?: string | null;
}

interface PurchaseOrderItemsEditorProps {
  orderId?: string;
  editable: boolean;
  onItemsChange?: (items: PurchaseOrderItem[]) => void;
  initialItems?: PurchaseOrderItem[];
}

export default function PurchaseOrderItemsEditor({ orderId, editable, onItemsChange, initialItems = [] }: PurchaseOrderItemsEditorProps) {
  const [items, setItems] = React.useState<PurchaseOrderItem[]>(initialItems);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    supabase.from('Products').select('uuid, ProductName').then(({ data }) => {
      setProducts(data || []);
    });
  }, []);

  const handleItemChange = (idx: number, field: keyof PurchaseOrderItem, value: any) => {
    setItems(items => {
      const newItems = items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
      if (onItemsChange) onItemsChange(newItems);
      return newItems;
    });
  };

  const handleAddItem = () => {
    setItems(items => {
      const newItems = [...items, { product_id: null, quantity: 1, unit_price: 0 }];
      if (onItemsChange) onItemsChange(newItems);
      return newItems;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items => {
      const newItems = items.filter((_, i) => i !== idx);
      if (onItemsChange) onItemsChange(newItems);
      return newItems;
    });
  };

  React.useEffect(() => {
    if (onItemsChange) onItemsChange(items);
    // eslint-disable-next-line
  }, [items]);

  return (
    <Box sx={{ mt: 2 }}>
      <Table size="sm" sx={{ minWidth: 500 }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            {editable && <th />}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.ProductName}
                  value={products.find((p) => p.uuid === item.product_id) || null}
                  onChange={(_e, value) => handleItemChange(idx, 'product_id', value ? value.uuid : null)}
                  disabled={!editable}
                  sx={{ minWidth: 180 }}
                  isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
                  required
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={e => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                  disabled={!editable}
                  sx={{ width: 80 }}
                  required
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={e => handleItemChange(idx, 'unit_price', Math.max(0, Number(e.target.value)))}
                  disabled={!editable}
                  sx={{ width: 100 }}
                  required
                />
              </td>
              <td>{(item.quantity * item.unit_price).toFixed(2)}</td>
              {editable && (
                <td>
                  <Button size="sm" color="danger" onClick={() => handleRemoveItem(idx)}>
                    Remove
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {editable && (
        <Button size="sm" variant="soft" onClick={handleAddItem} sx={{ mt: 1 }}>
          Add Item
        </Button>
      )}
    </Box>
  );
}
