import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Autocomplete from '@mui/joy/Autocomplete';
import Box from '@mui/joy/Box';

export default function PurchaseOrderItemsEditor({ orderId, editable, onItemsChange, initialItems = [] }) {
  const [items, setItems] = React.useState(initialItems);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    supabase.from('Products').select('uuid, ProductName').then(({ data }) => {
      setProducts(data || []);
    });
  }, []);

  const handleItemChange = (idx, field, value) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    if (onItemsChange) onItemsChange(items);
  };

  const handleAddItem = () => {
    setItems(items => [...items, { product_id: null, quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = idx => {
    setItems(items => items.filter((_, i) => i !== idx));
    if (onItemsChange) onItemsChange(items);
  };

  React.useEffect(() => {
    if (onItemsChange) onItemsChange(items);
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
                  getOptionLabel={option => option.ProductName}
                  value={products.find(p => p.uuid === item.product_id) || null}
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
