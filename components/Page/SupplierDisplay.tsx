import React, { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import Card from '@mui/joy/Card';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';
import Table from '@mui/joy/Table';

/**
 * Represents a supplier in the system.
 * @property {string} id - The unique identifier for the supplier.
 * @property {string} name - The name of the supplier.
 * @property {string} address - The address of the supplier.
 * @property {string} contact_name - The contact person's name for the supplier.
 * @property {string} email - The email address of the supplier.
 * @property {string} phone - The phone number of the supplier.
 */
interface Supplier {
  id: string;
  name: string;
  address: string;
  contact_name: string;
  email: string;
  phone: string;
}

/**
 * Props for the SupplierDisplay component.
 * @property {Supplier} supplier - The supplier to display.
 * @property {() => void} onClose - Callback to close the supplier display.
 */
interface SupplierDisplayProps {
  supplier: Supplier;
  onClose: () => void;
}

/**
 * SupplierDisplay component displays supplier details and their associated purchase orders.
 *
 * @param {SupplierDisplayProps} props - Props for the component.
 * @returns {JSX.Element} The rendered SupplierDisplay component.
 */
export default function SupplierDisplay({ supplier, onClose }: SupplierDisplayProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseOrders() {
      setLoadingOrders(true);
      setOrdersError(null);
      const { data, error } = await supabase
        .from('PurchaseOrders')
        .select('id, order_number, order_date, status, total, notes')
        .eq('supplier_id', supplier.id)
        .order('order_date', { ascending: false });
      if (!error && data) {
        setPurchaseOrders(data);
      } else if (error) {
        setOrdersError(error.message || 'Failed to fetch purchase orders');
      }
      setLoadingOrders(false);
    }
    fetchPurchaseOrders();
  }, [supplier.id]);

  /**
   * Renders the purchase orders table.
   *
   * @returns {JSX.Element} The rendered purchase orders table.
   */
  const renderPurchaseOrders = () => (
    <Table aria-label="Supplier Purchase Orders" sx={{ minWidth: 700, mb: 2 }}>
      <thead>
        <tr>
          <th>Order #</th>
          <th>Date</th>
          <th>Status</th>
          <th>Total</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {purchaseOrders.map((order) => (
          <tr key={order.id}>
            <td>{order.order_number}</td>
            <td>{order.order_date}</td>
            <td>{order.status}</td>
            <td>{order.total != null ? `$${order.total.toFixed(2)}` : '—'}</td>
            <td>{order.notes || ''}</td>
          </tr>
        ))}
        {purchaseOrders.length === 0 && !loadingOrders && (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No purchase orders for this supplier.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '60vh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 2 }}>
      {/* Left: Supplier Info */}
      <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 340, maxWidth: 420, borderRight: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography level="h2" sx={{ flex: 1 }}>{supplier.name}</Typography>
          <Button onClick={onClose} variant="outlined" sx={{ ml: 2 }}>Close</Button>
        </Box>
        <Card variant="soft" sx={{ mb: 2 }}>
          <Typography level="h4" sx={{ mb: 1 }}>Company Information</Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography level="body-md"><b>Name:</b> {supplier.name}</Typography>
          <Typography level="body-md"><b>Address:</b> {supplier.address}</Typography>
        </Card>
        <Card variant="soft">
          <Typography level="h4" sx={{ mb: 1 }}>Contact Information</Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography level="body-md"><b>Contact Name:</b> {supplier.contact_name}</Typography>
          <Typography level="body-md"><b>Email:</b> {supplier.email}</Typography>
          <Typography level="body-md"><b>Phone:</b> {supplier.phone}</Typography>
        </Card>
      </Box>
      {/* Right: Purchase Orders */}
      <Box sx={{ flex: 2, p: 4, overflowY: 'auto' }}>
        <Typography level="h3" sx={{ mb: 2 }}>Purchase Orders</Typography>
        {loadingOrders && <Typography>Loading...</Typography>}
        {ordersError && <Typography color="danger">Error: {ordersError}</Typography>}
        {renderPurchaseOrders()}
      </Box>
    </Box>
  );
}
