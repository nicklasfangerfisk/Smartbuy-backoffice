import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Autocomplete from '@mui/joy/Autocomplete';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import Table from '@mui/joy/Table';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Add from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Database } from '../general/supabase.types';

// Types and interfaces
type OrderStatus = 'Draft' | 'Paid' | 'Refunded' | 'Cancelled';

interface Product {
  id: string;
  ProductName: string;
  SalesPrice?: number;
}

interface Storefront {
  id: string;
  name: string;
  is_online: boolean;
}

interface OrderItemDraft {
  id: string;
  product: Product | null;
  quantity: number;
  unitprice: number;
  discount: number;
}

export interface OrderProfile {
  id?: string;
  uuid?: string;
  order_number?: string;
  date: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  total?: number;
  discount?: number;
  notes?: string;
}

interface DialogOrderProps {
  open: boolean;
  onClose: () => void;
  order?: OrderProfile;
  mode?: 'add' | 'edit' | 'view';
  onSaved?: () => void;
  fetchOrderItems?: (orderUuid: string) => Promise<any[]>;
}

/**
 * DialogOrder Component
 * 
 * A unified modal dialog for managing orders, combining functionality for:
 * - Creating new orders (add mode)
 * - Editing existing orders (edit mode)  
 * - Viewing order details (view mode)
 * 
 * Props:
 * - open: Whether the modal is open
 * - onClose: Function to close the modal
 * - order: Order data for edit/view mode
 * - mode: 'add', 'edit', or 'view' mode
 * - onSaved: Callback after successful save
 * - fetchOrderItems: Function to fetch order items for view/edit
 */
export default function DialogOrder({ 
  open, 
  onClose, 
  order, 
  mode = 'add',
  onSaved,
  fetchOrderItems 
}: DialogOrderProps) {
  // Form states
  const [orderNumber, setOrderNumber] = React.useState('');
  const [orderDate, setOrderDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = React.useState<OrderStatus>('Draft');
  const [storefrontId, setStorefrontId] = React.useState<string>('');
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [total, setTotal] = React.useState('0');
  const [discount, setDiscount] = React.useState(0);
  const [notes, setNotes] = React.useState('');
  
  // Order items states
  const [orderItems, setOrderItems] = React.useState<OrderItemDraft[]>([
    { id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: 0 }
  ]);
  const [existingOrderItems, setExistingOrderItems] = React.useState<any[]>([]);
  
  // Product selection states
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  
  // Storefront states
  const [storefronts, setStorefronts] = React.useState<Storefront[]>([]);
  const [loadingStorefronts, setLoadingStorefronts] = React.useState(false);
  
  // UI states
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [productsError, setProductsError] = React.useState<string | null>(null);

  // Initialize form when modal opens or order changes
  React.useEffect(() => {
    if (open && order) {
      setOrderNumber(order.order_number || '');
      setOrderDate(order.date || new Date().toISOString().slice(0, 10));
      setStatus(order.status || 'Draft');
      setCustomerName(order.customer_name || '');
      setCustomerEmail(order.customer_email || '');
      setTotal(order.total ? String(order.total) : '0');
      setDiscount(order.discount || 0);
      setNotes(order.notes || '');
      setStorefrontId((order as any).storefront_id || '');
    } else if (open && mode === 'add') {
      // Reset form for add mode
      setOrderNumber(generateOrderNumber());
      setOrderDate(new Date().toISOString().slice(0, 10));
      setStatus('Draft');
      setCustomerName('');
      setCustomerEmail('');
      setTotal('0');
      setDiscount(0);
      setNotes('');
      setStorefrontId('');
      setOrderItems([{ id: crypto.randomUUID(), product: null, quantity: 1, unitprice: 0, discount: 0 }]);
    }
    setError(null);
  }, [open, order, mode]);

  // Load existing order items for edit/view mode
  React.useEffect(() => {
    if (open && (mode === 'edit' || mode === 'view') && order?.uuid && fetchOrderItems) {
      setLoading(true);
      fetchOrderItems(order.uuid)
        .then(items => {
          setExistingOrderItems(items);
        })
        .catch(err => {
          console.error('Error loading order items:', err);
          setError('Failed to load order items');
        })
        .finally(() => setLoading(false));
    }
  }, [open, mode, order, fetchOrderItems]);

  // Load storefronts when dialog opens
  React.useEffect(() => {
    if (open) {
      setLoadingStorefronts(true);
      const loadStorefronts = async () => {
        try {
          // First, let's see all storefronts for debugging
          const { data: allStorefronts, error: allError } = await supabase
            .from('storefronts')
            .select('id, name, is_online');
          
          console.log('All storefronts in database:', allStorefronts);
          
          const { data, error } = await supabase
            .from('storefronts')
            .select('id, name, is_online')
            .eq('is_online', true)
            .order('name', { ascending: true });
          
          console.log('Storefronts loaded:', data, 'Error:', error);
          
          if (!error && data) {
            setStorefronts(data);
          } else {
            console.error('Error loading storefronts:', error);
          }
        } catch (err) {
          console.error('Error loading storefronts:', err);
        } finally {
          setLoadingStorefronts(false);
        }
      };
      
      loadStorefronts();
    }
  }, [open]);

  // Load products for add/edit mode
  React.useEffect(() => {
    if (open && (mode === 'add' || mode === 'edit')) {
      setLoadingProducts(true);
      setProductsError(null);
      supabase.from('Products').select('*').then(({ data, error }) => {
        if (!error && data) {
          if (data.length === 0) {
            setProductsError('No products available. Please add products first.');
          }
          setProducts(data.map((p: any) => ({
            id: p.uuid || p.id,
            ProductName: p.ProductName,
            SalesPrice: p.SalesPrice ?? 0
          })));
        } else {
          setProductsError('Failed to load products. Please try again later.');
        }
        setLoadingProducts(false);
      });
    }
  }, [open, mode]);

  const generateOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${date}-${rand}`;
  };

  // Calculate total from order items
  const calculateItemsTotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitprice;
      const discountAmount = itemTotal * (item.discount / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  // Update total when items change
  React.useEffect(() => {
    if (mode === 'add' || mode === 'edit') {
      const newTotal = calculateItemsTotal();
      const finalTotal = newTotal - (newTotal * (discount / 100));
      setTotal(finalTotal.toFixed(2));
    }
  }, [orderItems, discount, mode]);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { 
      id: crypto.randomUUID(), 
      product: null, 
      quantity: 1, 
      unitprice: 0, 
      discount: 0 
    }]);
  };

  const handleRemoveItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof OrderItemDraft, value: any) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleProductSelect = (id: string, product: Product | null) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { 
        ...item, 
        product,
        unitprice: product?.SalesPrice || 0
      } : item
    ));
  };

  const handleSave = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Customer name and email are required');
      return;
    }

    if (mode === 'add') {
      const validItems = orderItems.filter(item => item.product && item.quantity > 0);
      if (validItems.length === 0) {
        setError('Please add at least one valid order item');
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === 'edit' && order?.id) {
        const orderData = {
          order_number: orderNumber,
          date: orderDate,
          status: status,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          // total: parseFloat(total), // Remove - should be computed from order items
          discount: discount,
          // notes: notes.trim() || null, // Temporarily disabled until column is added
          storefront_id: storefrontId || null, // Include storefront ID
        };

        const { error } = await supabase
          .from('Orders')
          .update(orderData)
          .eq('id', order.id);

        if (error) throw error;
      } else if (mode === 'add') {
        // For add mode, exclude order_number as it's auto-generated
        const orderData = {
          // order_number: orderNumber, // Remove - auto-generated identity column
          date: orderDate,
          status: status,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          // total: parseFloat(total), // Remove - should be computed from order items
          discount: discount,
          // notes: notes.trim() || null, // Temporarily disabled until column is added
          storefront_id: storefrontId || null, // Include storefront ID
        };

        const { data, error } = await supabase
          .from('Orders')
          .insert([orderData])
          .select()
          .single();

        if (error) throw error;

        // Insert order items
        if (data) {
          const itemsToInsert = orderItems
            .filter(item => item.product && item.quantity > 0)
            .map(item => ({
              order_uuid: data.uuid,
              product_uuid: item.product!.id,
              quantity: item.quantity,
              unitprice: item.unitprice,
              discount: item.discount,
              price: (item.quantity * item.unitprice) * (1 - item.discount / 100)
            }));

          if (itemsToInsert.length > 0) {
            const { error: itemsError } = await supabase
              .from('OrderItems')
              .insert(itemsToInsert);

            if (itemsError) throw itemsError;
          }
        }
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving order:', err);
      setError(err.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = mode === 'view';
  const isViewMode = mode === 'view';

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 1200, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <ModalClose />
        <Typography level="title-lg" sx={{ mb: 2 }}>
          {mode === 'add' ? 'Create Order' : mode === 'edit' ? 'Edit Order' : 'Order Details'}
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3,
          minHeight: '400px'
        }}>
          {/* Left Column: Order Header Information */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Order Information */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography level="title-sm">Order Information</Typography>
              
              {/* Only show order number in edit mode - it's auto-generated in add mode */}
              {mode === 'edit' && (
                <FormControl>
                  <FormLabel>Order Number</FormLabel>
                  <Input
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Auto-generated"
                  />
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  disabled={isReadOnly}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={status}
                  onChange={(_, value) => setStatus(value as OrderStatus)}
                  disabled={isReadOnly}
                >
                  <Option value="Draft">Draft</Option>
                  <Option value="Paid">Paid</Option>
                  <Option value="Refunded">Refunded</Option>
                  <Option value="Cancelled">Cancelled</Option>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Customer Information */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography level="title-sm">Customer Information</Typography>
              
              <FormControl>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Customer name"
                  required
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Customer Email</FormLabel>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="customer@example.com"
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Storefront</FormLabel>
                <Select
                  value={storefrontId}
                  onChange={(_, value) => setStorefrontId(value || '')}
                  disabled={isReadOnly || loadingStorefronts}
                  placeholder="Select a storefront (optional)"
                >
                  <Option value="">No specific storefront</Option>
                  {storefronts.map((storefront) => (
                    <Option key={storefront.id} value={storefront.id}>
                      {storefront.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Order Summary */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography level="title-sm">Order Summary</Typography>
              
              <FormControl>
                <FormLabel>Order Discount (%)</FormLabel>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                  slotProps={{ input: { min: 0, max: 100, step: 0.01 } }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Total Amount</FormLabel>
                <Input
                  value={formatCurrencyWithSymbol(parseFloat(total))}
                  disabled
                  sx={{ fontWeight: 'bold' }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Order notes (optional)"
                />
              </FormControl>
            </Box>
          </Box>

          {/* Right Column: Order Items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography level="title-sm">
                {isViewMode ? 'Ordered Items' : 'Order Items'}
              </Typography>
              {!isReadOnly && (
                <Button
                  startDecorator={<Add />}
                  onClick={handleAddItem}
                  size="sm"
                  variant="outlined"
                >
                  Add Item
                </Button>
              )}
            </Box>

            {isViewMode ? (
              // View mode: Show existing items in table
              loading ? (
                <Typography>Loading items...</Typography>
              ) : (
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Disc %</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingOrderItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
                          <Typography level="body-sm" color="neutral">
                            No items found for this order.
                          </Typography>
                        </td>
                      </tr>
                    ) : (
                      existingOrderItems.map((item, index) => (
                        <tr key={item.id || item.uuid || index}>
                          <td>
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                              {item.ProductName || item.name || item.product_uuid}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Typography level="body-sm">
                              {item.quantity}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Typography level="body-sm">
                              {typeof item.unitprice === 'number' || typeof item.unitprice === 'string' 
                                ? formatCurrencyWithSymbol(Number(item.unitprice)) 
                                : '-'
                              }
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Typography level="body-sm">
                              {typeof item.discount === 'number' || typeof item.discount === 'string' 
                                ? `${Number(item.discount).toFixed(1)}%` 
                                : '-'
                              }
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                              {typeof item.price === 'number' || typeof item.price === 'string' 
                                ? formatCurrencyWithSymbol(Number(item.price)) 
                                : '-'
                              }
                            </Typography>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )
            ) : (
              // Add/Edit mode: Show editable items in a more compact layout
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {productsError && (
                  <Typography color="warning" level="body-sm">
                    {productsError}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '400px', overflowY: 'auto' }}>
                  {orderItems.map((item) => (
                    <Box key={item.id} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1, 
                      p: 2, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 'sm',
                      bgcolor: 'background.surface'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                          Item {orderItems.indexOf(item) + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={orderItems.length === 1}
                          color="danger"
                          size="sm"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Autocomplete
                        placeholder="Select product"
                        options={products}
                        getOptionLabel={(option) => option.ProductName}
                        value={item.product}
                        onChange={(_, value) => handleProductSelect(item.id, value)}
                        loading={loadingProducts}
                        size="sm"
                      />
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                        <Box>
                          <FormLabel sx={{ fontSize: 'xs' }}>Quantity</FormLabel>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            size="sm"
                            slotProps={{ input: { min: 1 } }}
                          />
                        </Box>
                        
                        <Box>
                          <FormLabel sx={{ fontSize: 'xs' }}>Unit Price</FormLabel>
                          <Input
                            type="number"
                            value={item.unitprice}
                            onChange={(e) => handleItemChange(item.id, 'unitprice', parseFloat(e.target.value) || 0)}
                            size="sm"
                            slotProps={{ input: { min: 0, step: 0.01 } }}
                          />
                        </Box>
                        
                        <Box>
                          <FormLabel sx={{ fontSize: 'xs' }}>Discount %</FormLabel>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            size="sm"
                            slotProps={{ input: { min: 0, max: 100, step: 0.01 } }}
                          />
                        </Box>
                      </Box>
                      
                      {item.product && item.quantity > 0 && (
                        <Box sx={{ textAlign: 'right', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                            Item Total: {formatCurrencyWithSymbol(
                              (item.quantity * item.unitprice) * (1 - item.discount / 100)
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography color="danger" level="body-sm">
              {error}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          
          {/* Resend Email Button - only show for paid orders with email */}
          {order && order.status === 'Paid' && order.customer_email && (
            <Button
              variant="outlined"
              color="primary"
              onClick={async () => {
                try {
                  const response = await fetch('/api/resend-order-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      orderUuid: order.uuid,
                      resendEmail: true 
                    }),
                  });
                  
                  const result = await response.json();
                  if (result.success) {
                    alert('Confirmation email sent successfully!');
                  } else {
                    alert('Failed to send email: ' + result.error);
                  }
                } catch (err: any) {
                  alert('Error sending email: ' + err.message);
                }
              }}
              disabled={saving}
            >
              Resend Email
            </Button>
          )}
          
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!customerName.trim() || !customerEmail.trim()}
            >
              {mode === 'edit' ? 'Update Order' : 'Create Order'}
            </Button>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
}
