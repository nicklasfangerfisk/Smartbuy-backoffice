import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Autocomplete from '@mui/joy/Autocomplete';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';

/**
 * Represents a product in the database.
 */
interface Product {
  uuid: string;
  ProductName: string;
}

/**
 * Represents an item in the purchase order.
 */
export interface PurchaseOrderItem {
  product_id: string | null;
  quantity_ordered: number;
  unit_price: number;
  notes?: string | null;
}

/**
 * Props for the PurchaseOrderItemsEditor component.
 */
interface PurchaseOrderItemsEditorProps {
  /**
   * The ID of the purchase order (optional).
   */
  orderId?: string;

  /**
   * Specifies whether the table is editable.
   */
  editable: boolean;

  /**
   * Callback function triggered when items are changed.
   */
  onItemsChange?: (items: PurchaseOrderItem[]) => void;

  /**
   * The initial list of items.
   */
  initialItems?: PurchaseOrderItem[];
}

/**
 * A table component for managing purchase order items.
 */
export default function PurchaseOrderItemsEditor({ orderId, editable, onItemsChange, initialItems = [] }: PurchaseOrderItemsEditorProps) {
  const [items, setItems] = React.useState<PurchaseOrderItem[]>(initialItems);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    supabase.from('Products').select('uuid, ProductName').then(({ data, error }) => {
      if (error) {
        console.error('Failed to fetch products:', error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
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
      const newItems = [...items, { product_id: null, quantity_ordered: 1, unit_price: 0 }];
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

  // Calculate total from current items
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity_ordered * item.unit_price);
    }, 0);
  };

  return (
    <Box sx={{ mt: 0 }}>
      {/* Mobile View - Stack Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {items.length === 0 ? (
          <Typography color="neutral" textAlign="center" sx={{ py: 4 }}>
            No items added yet
          </Typography>
        ) : (
          items.map((item, idx) => (
            <Box key={idx} sx={{ 
              mb: 2, 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 'md' 
            }}>
              <Box sx={{ mb: 2 }}>
                <Typography level="body-sm" sx={{ mb: 1 }}>Product:</Typography>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.ProductName}
                  value={products.find((p) => p.uuid === item.product_id) || null}
                  onChange={(_e, value) => handleItemChange(idx, 'product_id', value ? value.uuid : null)}
                  disabled={!editable}
                  sx={{ width: '100%' }}
                  isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
                  required
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Quantity:</Typography>
                  <Input
                    type="number"
                    value={item.quantity_ordered ?? 1}
                    onChange={e => handleItemChange(idx, 'quantity_ordered', Math.max(1, Number(e.target.value)))}
                    disabled={!editable}
                    sx={{ width: '100%' }}
                    required
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Unit Price:</Typography>
                  <Input
                    type="number"
                    value={item.unit_price ?? 0}
                    onChange={e => handleItemChange(idx, 'unit_price', Math.max(0, Number(e.target.value)))}
                    disabled={!editable}
                    sx={{ width: '100%' }}
                    required
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography level="body-sm" color="neutral">Total:</Typography>
                  <Typography level="title-sm">{formatCurrencyWithSymbol(item.quantity_ordered * item.unit_price)}</Typography>
                </Box>
                {editable && (
                  <Button size="sm" color="danger" onClick={() => handleRemoveItem(idx)}>
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          ))
        )}

        {/* Mobile Total */}
        {items.length > 0 && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'background.level1', 
            borderRadius: 'md',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                Total:
              </Typography>
              <Typography level="title-sm" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {formatCurrencyWithSymbol(calculateTotal())}
              </Typography>
            </Box>
          </Box>
        )}

        {editable && (
          <Button size="sm" variant="soft" onClick={handleAddItem} sx={{ mt: 1 }} fullWidth>
            Add Item
          </Button>
        )}
      </Box>

      {/* Desktop View - Table */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size="sm" sx={{ 
          minWidth: 500,
          '& th': {
            padding: '12px 8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderBottom: '2px solid',
            borderColor: 'divider'
          },
          '& td': {
            padding: '8px',
            verticalAlign: 'middle'
          }
        }}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Product</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Unit Price</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
              {editable && <th style={{ width: '10%', textAlign: 'center' }}></th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={editable ? 5 : 4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  No items added yet
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px' }}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.ProductName}
                      value={products.find((p) => p.uuid === item.product_id) || null}
                      onChange={(_e, value) => handleItemChange(idx, 'product_id', value ? value.uuid : null)}
                      disabled={!editable}
                      sx={{ width: '100%' }}
                      isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
                      required
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <Input
                      type="number"
                      value={item.quantity_ordered ?? 1}
                      onChange={e => handleItemChange(idx, 'quantity_ordered', Math.max(1, Number(e.target.value)))}
                      disabled={!editable}
                      sx={{ width: '100%', maxWidth: 100 }}
                      required
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <Input
                      type="number"
                      value={item.unit_price ?? 0}
                      onChange={e => handleItemChange(idx, 'unit_price', Math.max(0, Number(e.target.value)))}
                      disabled={!editable}
                      sx={{ width: '100%', maxWidth: 120 }}
                      required
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrencyWithSymbol(item.quantity_ordered * item.unit_price)}
                  </td>
                  {editable && (
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <Button size="sm" color="danger" onClick={() => handleRemoveItem(idx)}>
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {editable && (
          <Button size="sm" variant="soft" onClick={handleAddItem} sx={{ mt: 2 }}>
            Add Item
          </Button>
        )}
      </Box>
    </Box>
  );
}
