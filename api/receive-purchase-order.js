const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Receives a purchase order and creates stock movement records.
 * @param {number} purchaseOrderId - The ID of the purchase order being received.
 * @param {Array} items - The items being received, each with product_id and quantity_received.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
async function receivePurchaseOrder(purchaseOrderId, items) {
  const stockMovements = items.map(item => ({
    product_id: item.product_id,
    movement_type: 'incoming',
    quantity: item.quantity_received,
    date: new Date().toISOString(),
    reason: 'PO Receipt',
    purchase_order_id: purchaseOrderId
  }));

  const { data, error } = await supabase.from('stock_movements').insert(stockMovements);

  if (error) {
    console.error('Error inserting stock movements:', error);
    throw new Error('Failed to insert stock movements');
  }

  console.log('Stock movements created successfully:', data);
}

// HTTP handler for Vercel/Next.js/Node.js API route
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { purchaseOrderId, items } = req.body;
    if (!purchaseOrderId || !Array.isArray(items)) {
      res.status(400).json({ error: 'Missing purchaseOrderId or items' });
      return;
    }
    await receivePurchaseOrder(purchaseOrderId, items);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
