import * as React from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Divider, Box, Table } from '@mui/joy';
import type { Database } from '../../components/general/supabase.types';

export type OrderTableDetailsProps = {
  open: boolean;
  onClose: () => void;
  selectedOrder: any;
  fetchOrderItems: (orderUuid: string) => Promise<(Database['public']['Tables']['OrderItems']['Row'] & { product_name?: string; name?: string })[]>;
};

export default function OrderTableDetails({ open, onClose, selectedOrder, fetchOrderItems }: OrderTableDetailsProps) {
  const [orderItems, setOrderItems] = React.useState<(Database['public']['Tables']['OrderItems']['Row'] & { product_name?: string; name?: string })[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadItems() {
      if (selectedOrder) {
        setOrderItemsLoading(true);
        const items = await fetchOrderItems(selectedOrder.uuid);
        setOrderItems(items);
        setOrderItemsLoading(false);
      } else {
        setOrderItems([]);
      }
    }
    if (open && selectedOrder) {
      loadItems();
    } else {
      setOrderItems([]);
    }
  }, [open, selectedOrder, fetchOrderItems]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="order-details-modal">
      <ModalDialog aria-labelledby="order-details-modal" sx={{ maxWidth: 600, width: '100%' }}>
        <ModalClose />
        <Typography id="order-details-modal" level="title-md" fontWeight="lg" sx={{ mb: 2 }}>
          Order Details
        </Typography>
        {selectedOrder && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Order ID: {selectedOrder.uuid}
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Date: {new Date(selectedOrder.date).toLocaleString()}
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Status: {selectedOrder.status}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="body-sm" fontWeight="md">
                Customer Information
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Name: {selectedOrder.customer.name}
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Email: {selectedOrder.customer.email}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="body-sm" fontWeight="md">
                Ordered Items
              </Typography>
              {orderItemsLoading ? (
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Loading items...
                </Typography>
              ) : (
                <Table size="sm" sx={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Discount (%)</th>
                      <th style={{ textAlign: 'right' }}>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
                          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                            No items found for this order.
                          </Typography>
                        </td>
                      </tr>
                    ) : (
                      orderItems.map(function(item) {
                        return (
                          <tr key={item.uuid}>
                            <td>{item.product_name || item.name || item.product_uuid}</td>
                            <td style={{ textAlign: 'right' }}>{item.quantity ?? '-'}</td>
                            <td style={{ textAlign: 'right' }}>{item.unitprice != null ? `$${Number(item.unitprice).toFixed(2)}` : '-'}</td>
                            <td style={{ textAlign: 'right' }}>{item.discount != null ? `${Number(item.discount).toFixed(2)}%` : '-'}</td>
                            <td style={{ textAlign: 'right' }}>{item.price != null ? `$${Number(item.price).toFixed(2)}` : '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              )}
            </Box>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
