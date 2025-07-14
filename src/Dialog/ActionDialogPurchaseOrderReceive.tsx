import React, { useState, useEffect } from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Button from '@mui/joy/Button';
import Table from '@mui/joy/Table';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { receivePurchaseOrder } from '../api/receivePurchaseOrder';
import Snackbar from '@mui/joy/Snackbar';

interface POItem {
  id: string; // purchase order item id
  product_id: string | number; // actual product id
  ProductName: string;
  quantity_ordered: number;
  quantity_received: number;
}

interface ActionDialogPurchaseOrderReceiveProps {
  open: boolean;
  onClose: () => void;
  poId: string | number;
  orderNumber?: string | number; // Add orderNumber for display
  items: POItem[];
  onConfirm: (receivedItems: { id: string; quantity_received: number }[]) => void;
}

const ActionDialogPurchaseOrderReceive: React.FC<ActionDialogPurchaseOrderReceiveProps> = ({
  open,
  onClose,
  poId,
  orderNumber,
  items,
  onConfirm,
}) => {
  const [received, setReceived] = useState<POItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setReceived(items.map(item => ({
        id: item.id,
        product_id: item.product_id, // always use product_id from parent
        ProductName: item.ProductName, // always use flat ProductName
        quantity_ordered: item.quantity_ordered ?? 0,
        quantity_received: item.quantity_received ?? item.quantity_ordered ?? 0,
      })));
      setLoading(false);
    }
  }, [items, open]);

  const handleQtyChange = (id: string, value: string) => {
    // Allow empty string (for editing), or valid integer >= 0
    let intValue = 0;
    if (value === '') {
      intValue = 0;
    } else if (/^\d+$/.test(value)) {
      intValue = parseInt(value, 10);
    } else {
      return; // Ignore invalid input
    }
    setReceived(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity_received: intValue } : item
      )
    );
  };

  const handleConfirm = async () => {
    try {
      // Persist only product_id (as UUID string) and quantity_received
      const receivedItems = received.map(({ product_id, quantity_received }) => ({
        product_id: String(product_id), // always send as string (UUID)
        quantity_received,
      }));

      await receivePurchaseOrder(
        String(poId), // always send as string (UUID)
        receivedItems
      );

      // Call the onConfirm callback to refresh parent component
      onConfirm(received.map(item => ({
        id: item.id,
        quantity_received: item.quantity_received
      })));

      setSnackbarOpen(true); // Show toast
      onClose();
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      alert('Failed to receive purchase order. Please try again.');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} aria-labelledby="receive-po-dialog-title">
        <ModalDialog sx={{ minWidth: 400 }}>
          <ModalClose />
          <Typography id="receive-po-dialog-title" level="h4" sx={{ mb: 2 }}>
            Receive Purchase Order #{orderNumber ?? poId}
          </Typography>
          {loading ? (
            <Typography>Loading items...</Typography>
          ) : received.length === 0 ? (
            <Typography>No items found for this purchase order.</Typography>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Ordered</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {received.map(item => (
                  <tr key={item.id}>
                    <td>{item.ProductName}</td>
                    <td>{item.quantity_ordered}</td>
                    <td>
                      <Input
                        type="number"
                        value={item.quantity_received === 0 && received.find(i => i.id === item.id)?.quantity_received === 0 ? '0' : item.quantity_received}
                        onChange={e => handleQtyChange(item.id, e.target.value)}
                        sx={{ width: 80 }}
                        slotProps={{ input: { min: 0, max: item.quantity_ordered } }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.quantity_received === item.quantity_ordered ? (
                        <CheckCircleIcon sx={{ color: '#2e7d32' }} titleAccess="Received in full" />
                      ) : (
                        <CancelIcon sx={{ color: '#d32f2f' }} titleAccess="Not fully received" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="plain" onClick={onClose}>Cancel</Button>
            <Button variant="solid" onClick={handleConfirm}>Receive</Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        color="success"
        variant="soft"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        Purchase order received successfully!
      </Snackbar>
    </>
  );
};

export default ActionDialogPurchaseOrderReceive;
