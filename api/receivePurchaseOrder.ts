import { supabase } from '../src/utils/supabaseClient';

/**
 * Receives a purchase order and creates stock movement records.
 * @param {string} purchaseOrderId - The UUID of the purchase order being received.
 * @param {Array} items - The items being received, each with product_id (UUID string) and quantity_received.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
export async function receivePurchaseOrder(purchaseOrderId: string, items: { product_id: string; quantity_received: number }[]) {
  try {
    console.log('Receiving purchase order:', { purchaseOrderId, items });

    // Update purchase order items with received quantities
    for (const item of items) {
      const { error: updateError } = await supabase
        .from('purchaseorderitems')
        .update({ quantity_received: item.quantity_received })
        .eq('purchase_order_id', purchaseOrderId)
        .eq('product_id', item.product_id);

      if (updateError) {
        console.error('Error updating purchase order item:', updateError);
        throw new Error(`Failed to update purchase order item: ${updateError.message}`);
      }
    }

    // Create stock movement records for items received
    const stockMovements = items
      .filter(item => item.quantity_received > 0)
      .map(item => ({
        product_id: item.product_id,
        movement_type: 'incoming',
        quantity: item.quantity_received,
        date: new Date().toISOString(),
        reason: 'PO Receipt',
        referenceuuid: purchaseOrderId
      }));

    if (stockMovements.length > 0) {
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert(stockMovements);

      if (movementError) {
        console.error('Error inserting stock movements:', movementError);
        throw new Error(`Failed to insert stock movements: ${movementError.message}`);
      }
    }

    // Update purchase order status to 'Received'
    const { error: statusError } = await supabase
      .from('PurchaseOrders')
      .update({ status: 'Received' })
      .eq('id', purchaseOrderId);

    if (statusError) {
      console.error('Error updating purchase order status:', statusError);
      throw new Error(`Failed to update purchase order status: ${statusError.message}`);
    }

    console.log('Purchase order received successfully');
  } catch (error) {
    console.error('Error receiving purchase order:', error);
    throw error;
  }
}
