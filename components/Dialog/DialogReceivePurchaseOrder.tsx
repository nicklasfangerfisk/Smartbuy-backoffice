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

interface POItem {
  id: string;
  ProductName: string;
  quantity_ordered: number;
  quantity_received: number;
}

interface DialogReceivePurchaseOrderProps {
  open: boolean;
  onClose: () => void;
  poId: string | number;
  items: POItem[];
  onConfirm: (receivedItems: { id: string; quantity_received: number }[]) => void;
}

const DialogReceivePurchaseOrder: React.FC<DialogReceivePurchaseOrderProps> = ({
  open,
  onClose,
  poId,
  items,
  onConfirm,
}) => {
  const [received, setReceived] = useState<POItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setReceived(items.map(item => ({
        id: item.id,
        ProductName: item.ProductName,
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
      // Persist only id and quantity_received
      const receivedItems = received.map(({ id, quantity_received }) => ({
        product_id: parseInt(id, 10),
        quantity_received,
      }));

      await receivePurchaseOrder(parseInt(poId.toString(), 10), receivedItems);

      alert('Purchase order received successfully!');
      onClose();
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      alert('Failed to receive purchase order. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="receive-po-dialog-title">
      <ModalDialog sx={{ minWidth: 400 }}>
        <ModalClose />
        <Typography id="receive-po-dialog-title" level="h4" sx={{ mb: 2 }}>
          Receive Purchase Order #{poId}
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
                  <td>{item.ProductName || item.id}</td>
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
  );
};

export default DialogReceivePurchaseOrder;
