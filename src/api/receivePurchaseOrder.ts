import axios from 'axios';

/**
 * Sends a request to the backend to receive a purchase order.
 * @param {string} purchaseOrderId - The UUID of the purchase order being received.
 * @param {Array} items - The items being received, each with product_id (UUID string) and quantity_received.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
export async function receivePurchaseOrder(purchaseOrderId: string, items: { product_id: string; quantity_received: number }[]) {
  try {
    console.log('Sending to backend:', { purchaseOrderId, items }); // Debug log
    const response = await axios.post('/api/receive-purchase-order', {
      purchaseOrderId,
      items,
    });

    console.log('Purchase order received successfully:', response.data);
  } catch (error) {
    console.error('Error receiving purchase order:', error);
    throw new Error('Failed to receive purchase order');
  }
}
