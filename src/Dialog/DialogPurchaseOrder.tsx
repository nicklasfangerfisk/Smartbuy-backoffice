import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { preparePurchaseOrderItemCurrencyData, formatCurrencyWithSymbol } from '../utils/currencyUtils';
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
import Add from '@mui/icons-material/Add';
import DialogSupplier from './DialogSupplier';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import SubDialogPurchaseOrderItems, { type PurchaseOrderItem } from './SubDialogPurchaseOrderItems';
import { useEffect } from 'react';

/**
 * Props for the DialogPurchaseOrder component.
 */
interface DialogPurchaseOrderProps {
  /**
   * Controls the visibility of the modal.
   */
  open: boolean;

  /**
   * Callback function to close the modal.
   */
  onClose: () => void;

  /**
   * Callback function triggered when a purchase order is created.
   */
  onCreated: () => void;

  /**
   * Specifies whether the form is in "add", "edit", or "view" mode.
   */
  mode?: 'add' | 'edit' | 'view';

  /**
   * The purchase order object for editing.
   */
  order?: {
    id: string;
    order_number: string;
    order_date: string;
    status: string;
    total: number;
    notes: string;
    supplier_id: string;
  };
}

const statusOptions = ['Pending', 'Approved', 'Received', 'Cancelled'];

/**
 * A modal dialog component for adding or editing purchase orders.
 */
export default function DialogPurchaseOrder({ open, onClose, onCreated, mode = 'add', order }: DialogPurchaseOrderProps) {
  const [orderNumber, setOrderNumber] = React.useState(order?.order_number || '');
  const [orderDate, setOrderDate] = React.useState(order?.order_date || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = React.useState(order?.status || 'Pending');
  const [total, setTotal] = React.useState(order?.total ? String(order.total) : '');
  const [notes, setNotes] = React.useState(order?.notes || '');
  const [supplierId, setSupplierId] = React.useState<string | null>(order?.supplier_id || null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [supplierInput, setSupplierInput] = React.useState('');
  const [addSupplierOpen, setAddSupplierOpen] = React.useState(false);
  const [items, setItems] = React.useState<PurchaseOrderItem[]>([{ product_id: null, quantity_ordered: 1, unit_price: 0 }]);

  // Add a ref to store the last created supplier id
  const lastCreatedSupplierId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (open) {
      console.log('[DialogPurchaseOrder] Modal opened');
      supabase.from('Suppliers').select('id, name').then(({ data }) => {
        setSuppliers(data || []);
      });
      if ((mode === 'edit' || mode === 'view') && order?.id) {
        // Fetch items for this purchase order
        supabase.from('purchaseorderitems').select('*').eq('purchase_order_id', order.id).then(({ data }) => {
          setItems(data || []);
        });
      } else if (mode === 'add') {
        setItems([{ product_id: null, quantity_ordered: 1, unit_price: 0 }]);
      }
    } else {
      console.log('[DialogPurchaseOrder] Modal closed');
    }
  }, [open, mode, order]);

  React.useEffect(() => {
    if (open && order) {
      // Update all form fields when order changes
      setOrderNumber(order.order_number || '');
      setOrderDate(order.order_date || new Date().toISOString().slice(0, 10));
      setStatus(order.status || 'Pending');
      setTotal(order.total ? String(order.total) : '');
      setNotes(order.notes || '');
      setSupplierId(order.supplier_id || null);
    } else if (open && mode === 'add') {
      // Reset form for add mode
      setOrderNumber('');
      setOrderDate(new Date().toISOString().slice(0, 10));
      setStatus('Pending');
      setTotal('');
      setNotes('');
      setSupplierId(null);
      setSupplierInput('');
    }
  }, [open, order, mode]);

  // After adding a supplier, refresh and select the new supplier
  const handleSupplierAdded = async (newSupplierId?: string | number) => {
    console.log('[DialogPurchaseOrder] handleSupplierAdded called');
    const { data } = await supabase.from('Suppliers').select('id, name');
    setSuppliers(data || []);
    if (newSupplierId) {
      setSupplierId(String(newSupplierId));
      console.log('[DialogPurchaseOrder] New supplier set:', newSupplierId);
    }
    setAddSupplierOpen(false);
    console.log('[DialogPurchaseOrder] DialogSupplier closed');
  };

  const generateOrderNumber = () => {
    // Example: PO-YYYYMMDD-XXXX (random 4 digits)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PO-${date}-${rand}`;
  };

  // Calculate total from items
  const calculateItemsTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity_ordered * item.unit_price);
    }, 0);
  };

  // Update total when items change
  React.useEffect(() => {
    const newTotal = calculateItemsTotal();
    setTotal(newTotal.toString());
  }, [items]);

  const handleSave = async () => {
    console.log('[DialogPurchaseOrder] handleSave called');
    setSaving(true);
    setError(null);
    const payload: any = {
      order_date: orderDate,
      status,
      notes,
      supplier_id: supplierId,
      total: total ? parseFloat(total) : null,
    };
    
    if (mode === 'edit') {
      payload.order_number = orderNumber;
    } else if (mode === 'add') {
      // Generate order number for new orders
      payload.order_number = generateOrderNumber();
    }
    
    let result;
    let purchaseOrderId = order?.id;
    if (mode === 'add') {
      result = await supabase.from('PurchaseOrders').insert([payload]).select();
      if (!result.error && result.data && result.data[0]) {
        purchaseOrderId = result.data[0].id;
      }
    } else if (order) { // Ensure 'order' is defined before accessing 'order.id'
      result = await supabase.from('PurchaseOrders').update(payload).eq('id', order.id);
    }
    if (result && !result.error && mode === 'add' && purchaseOrderId && items.length > 0) {
      // Insert items
      const itemsPayload = items
        .filter(item => item.product_id)
        .map(item => preparePurchaseOrderItemCurrencyData({
          purchase_order_id: purchaseOrderId,
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          unit_price: item.unit_price,
          notes: item.notes || null,
        }));
      if (itemsPayload.length === 0) {
        setError('Please select a product for each item before saving.');
        setSaving(false);
        return;
      }
      const itemsResult = await supabase.from('purchaseorderitems').insert(itemsPayload);
      if (itemsResult.error) {
        setError('Failed to save items: ' + itemsResult.error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    if (result?.error) {
      setError(result.error.message);
      console.log('[DialogPurchaseOrder] Save error:', result.error.message);
    } else {
      onCreated();
      onClose();
      setOrderNumber('');
      setOrderDate(new Date().toISOString().slice(0, 10));
      setStatus('Pending');
      setTotal('');
      setNotes('');
      setSupplierId(null);
      setSupplierInput('');
      console.log('[DialogPurchaseOrder] Purchase order saved and modal closed');
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="purchase-order-form-title">
      <ModalDialog 
        size="lg"
        sx={{
          width: { xs: '100vw', md: '90vw' },
          maxWidth: { xs: 'none', md: 1200 },
          height: { xs: '100vh', md: '90vh' },
          maxHeight: { xs: 'none', md: 800 },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          m: 0,
          borderRadius: { xs: 0, md: 'md' },
          p: 0,
        }}
      >
        {/* Header - only on desktop */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography id="purchase-order-form-title" level="title-md">
            {mode === 'edit' ? 'Edit' : mode === 'view' ? 'View' : 'Add'} Purchase Order
          </Typography>
          <ModalClose />
        </Box>

        {/* Mobile Header */}
        <Box sx={{ 
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography id="purchase-order-form-title" level="title-md">
            {mode === 'edit' ? 'Edit' : mode === 'view' ? 'View' : 'Add'} Purchase Order
          </Typography>
          <ModalClose />
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Left Side - Header Information */}
          <Box sx={{ 
            width: { xs: '100%', md: '400px' },
            borderRight: { xs: 'none', md: '1px solid' },
            borderBottom: { xs: '1px solid', md: 'none' },
            borderColor: 'divider',
            p: 3,
            overflow: 'auto',
            flexShrink: 0
          }}>
            <Typography level="title-sm" sx={{ mb: 2 }}>Order Information</Typography>
            
            <form onSubmit={e => { e.preventDefault(); if (mode !== 'view') handleSave(); }}>
              <Input
                type="date"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                sx={{ mb: 2 }}
                required
                readOnly={mode === 'view'}
                startDecorator={<Typography level="body-sm" sx={{ minWidth: 80 }}>Date:</Typography>}
              />

              {/* Status Field */}
              {(mode === 'edit' || mode === 'view') && (
                <Box sx={{ mb: 2 }}>
                  <Typography level="body-sm" sx={{ mb: 1 }}>Status:</Typography>
                  <Chip
                    variant="soft"
                    color={
                      status === 'Approved'
                        ? 'success'
                        : status === 'Received'
                        ? 'primary'
                        : status === 'Cancelled'
                        ? 'danger'
                        : 'neutral'
                    }
                    sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 'md', px: 1.5, py: 0.5 }}
                    onClick={mode === 'view' ? undefined : () => {
                      // Cycle through status options on click (only in edit mode)
                      const idx = statusOptions.indexOf(status);
                      setStatus(statusOptions[(idx + 1) % statusOptions.length]);
                    }}
                  >
                    {status}
                  </Chip>
                </Box>
              )}

              {/* Supplier Field */}
              <Box sx={{ mb: 2 }}>
                <Typography level="body-sm" sx={{ mb: 1 }}>Supplier:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Autocomplete
                    options={suppliers}
                    getOptionLabel={option => option.name}
                    value={suppliers.find(s => s.id === supplierId) || null}
                    onChange={(_e, value) => setSupplierId(value ? value.id : null)}
                    inputValue={supplierInput}
                    onInputChange={(_e, value) => setSupplierInput(value)}
                    placeholder="Select supplier"
                    sx={{ flex: 1, mb: 0 }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    required
                    readOnly={mode === 'view'}
                  />
                  {mode !== 'view' && (
                    <IconButton color="primary" sx={{ ml: 1 }} onClick={() => setAddSupplierOpen(true)}>
                      <Add />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Order Number and Total - for edit/view modes */}
              {(mode === 'edit' || mode === 'view') && (
                <>
                  <Input
                    placeholder="Order Number"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    sx={{ mb: 2 }}
                    readOnly={mode === 'view'}
                    startDecorator={<Typography level="body-sm" sx={{ minWidth: 80 }}>Number:</Typography>}
                  />
                  <Input
                    placeholder="Total"
                    value={total}
                    onChange={e => setTotal(e.target.value)}
                    sx={{ mb: 2 }}
                    type="number"
                    readOnly
                    startDecorator={<Typography level="body-sm" sx={{ minWidth: 80 }}>Total:</Typography>}
                  />
                </>
              )}

              {/* Notes Field */}
              <Input
                placeholder="Notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                sx={{ mb: 2 }}
                readOnly={mode === 'view'}
                startDecorator={<Typography level="body-sm" sx={{ minWidth: 80 }}>Notes:</Typography>}
              />

              {/* Action Buttons */}
              {mode !== 'view' && (
                <Box sx={{ mt: 3 }}>
                  {error && <Typography color="danger" sx={{ mb: 2 }}>{error}</Typography>}
                  <Button type="submit" loading={saving} disabled={saving} variant="solid" fullWidth>
                    Save Purchase Order
                  </Button>
                </Box>
              )}
            </form>

            {/* Supplier Form Dialog */}
            <DialogSupplier
              open={addSupplierOpen}
              onClose={() => setAddSupplierOpen(false)}
              onSaved={handleSupplierAdded}
              mode="add"
            />
          </Box>

          {/* Right Side - Order Items */}
          <Box sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              p: 1,
              borderBottom: '0px solid',
              borderColor: 'divider',
              flexShrink: 0
            }}>
              <Typography level="title-sm">Order Items</Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              p: 2,
              paddingBottom: 0
            }}>
              <SubDialogPurchaseOrderItems
                orderId={order?.id}
                editable={mode === 'add' || mode === 'edit'}
                onItemsChange={setItems}
                initialItems={items}
              />
            </Box>

            {/* Totals Section */}
            <Box sx={{ 
              borderTop: '1px solid',
              borderColor: 'divider',
              p: 3,
              flexShrink: 0,
              backgroundColor: 'background.level1'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                maxWidth: { xs: '100%', md: '400px' },
                ml: 'auto'
              }}>
                <Typography level="title-md" sx={{ fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography level="title-md" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatCurrencyWithSymbol(calculateItemsTotal())}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
