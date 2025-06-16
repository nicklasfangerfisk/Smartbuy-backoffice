import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
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
import SupplierForm from './SupplierForm';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import PurchaseOrderItemsEditor from './PurchaseOrderItemsEditor';
import { useEffect } from 'react';

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  mode?: 'add' | 'edit';
  order?: any; // for edit mode
}

const statusOptions = ['Pending', 'Approved', 'Received', 'Cancelled'];

export default function PurchaseOrderForm({ open, onClose, onCreated, mode = 'add', order }: PurchaseOrderFormProps) {
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
  const [items, setItems] = React.useState<any[]>([{ product_id: null, quantity: 1, unit_price: 0 }]);

  // Add a ref to store the last created supplier id
  const lastCreatedSupplierId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (open) {
      console.log('[PurchaseOrderForm] Modal opened');
      supabase.from('Suppliers').select('id, name').then(({ data }) => {
        setSuppliers(data || []);
      });
      if (mode === 'edit' && order?.id) {
        // Fetch items for this purchase order
        supabase.from('purchaseorderitems').select('*').eq('purchase_order_id', order.id).then(({ data }) => {
          setItems(data || []);
        });
      } else if (mode === 'add') {
        setItems([{ product_id: null, quantity: 1, unit_price: 0 }]);
      }
    } else {
      console.log('[PurchaseOrderForm] Modal closed');
    }
  }, [open, mode, order]);

  // After adding a supplier, refresh and select the new supplier
  const handleSupplierAdded = async (newSupplierId?: string) => {
    console.log('[PurchaseOrderForm] handleSupplierAdded called');
    const { data } = await supabase.from('Suppliers').select('id, name');
    setSuppliers(data || []);
    if (newSupplierId) {
      setSupplierId(newSupplierId);
      console.log('[PurchaseOrderForm] New supplier set:', newSupplierId);
    }
    setAddSupplierOpen(false);
    console.log('[PurchaseOrderForm] SupplierForm closed');
  };

  const generateOrderNumber = () => {
    // Example: PO-YYYYMMDD-XXXX (random 4 digits)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PO-${date}-${rand}`;
  };

  const handleSave = async () => {
    console.log('[PurchaseOrderForm] handleSave called');
    setSaving(true);
    setError(null);
    const payload: any = {
      order_date: orderDate,
      status,
      notes,
      supplier_id: supplierId,
    };
    if (mode === 'edit') {
      payload.order_number = orderNumber;
      payload.total = total ? parseFloat(total) : null;
    } else {
      payload.total = total ? parseFloat(total) : null;
    }
    let result;
    let purchaseOrderId = order?.id;
    if (mode === 'add') {
      result = await supabase.from('PurchaseOrders').insert([payload]).select();
      if (!result.error && result.data && result.data[0]) {
        purchaseOrderId = result.data[0].id;
      }
    } else {
      result = await supabase.from('PurchaseOrders').update(payload).eq('id', order.id);
    }
    if (!result.error && mode === 'add' && purchaseOrderId && items.length > 0) {
      // Insert items
      const itemsPayload = items.map(item => ({
        purchase_order_id: purchaseOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || null,
      }));
      const itemsResult = await supabase.from('purchaseorderitems').insert(itemsPayload);
      if (itemsResult.error) {
        setError('Failed to save items: ' + itemsResult.error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      console.log('[PurchaseOrderForm] Save error:', result.error.message);
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
      console.log('[PurchaseOrderForm] Purchase order saved and modal closed');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 400 }}>
        <ModalClose />
        <Typography level="title-md" sx={{ mb: 2 }}>{mode === 'edit' ? 'Edit' : 'Add'} Purchase Order</Typography>
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <Input
            type="date"
            value={orderDate}
            onChange={e => setOrderDate(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <Select
            value={status}
            onChange={(_, value) => setStatus(value ?? 'Pending')}
            sx={{ mb: 2, display: 'none' }}
            required
          >
            {statusOptions.map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
          {/* Hide status field in add mode */}
          {mode === 'edit' && (
            <Box sx={{ mb: 2 }}>
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
                onClick={() => {
                  // Cycle through status options on click
                  const idx = statusOptions.indexOf(status);
                  setStatus(statusOptions[(idx + 1) % statusOptions.length]);
                }}
              >
                {status}
              </Chip>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
            />
            <IconButton color="primary" sx={{ ml: 1 }} onClick={() => setAddSupplierOpen(true)}>
              <Add />
            </IconButton>
          </Box>
          <SupplierForm
            open={addSupplierOpen}
            onClose={() => setAddSupplierOpen(false)}
            onSaved={handleSupplierAdded}
            mode="add"
          />
          {mode === 'edit' && (
            <>
              <Input
                placeholder="Order Number"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Input
                placeholder="Total"
                value={total}
                onChange={e => setTotal(e.target.value)}
                sx={{ mb: 2 }}
                type="number"
                readOnly
              />
            </>
          )}
          <Input
            placeholder="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <PurchaseOrderItemsEditor
            orderId={order?.id}
            editable={mode === 'add'}
            onItemsChange={setItems}
            initialItems={items}
          />
          {/* Add padding between Add Item and Save button */}
          <Box sx={{ height: 16 }} />
          {error && <Typography color="danger" sx={{ mb: 1 }}>{error}</Typography>}
          <Button type="submit" loading={saving} disabled={saving} variant="solid">
            Save
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
}
