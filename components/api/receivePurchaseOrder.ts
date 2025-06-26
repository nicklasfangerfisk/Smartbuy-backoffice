import axios from 'axios';

/**
 * Sends a request to the backend to receive a purchase order.
 * @param {number} purchaseOrderId - The ID of the purchase order being received.
 * @param {Array} items - The items being received, each with product_id and quantity_received.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
export async function receivePurchaseOrder(purchaseOrderId: number, items: { product_id: number; quantity_received: number }[]) {
  try {
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
