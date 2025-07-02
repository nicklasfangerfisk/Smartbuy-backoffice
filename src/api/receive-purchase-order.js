require('dotenv').config();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey);
console.log('SUPABASE_URL:', supabaseUrl);
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, serviceRoleKey);

/**
 * Receives a purchase order and creates stock movement records.
 * @param {number} purchaseOrderId - The ID of the purchase order being received.
 * @param {Array} items - The items being received, each with product_id and quantity_received.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
async function receivePurchaseOrder(supabase, purchaseOrderId, items) {
  const stockMovements = items.map(item => ({
    product_id: item.product_id,
    movement_type: 'incoming', // use allowed value per schema
    quantity: item.quantity_received,
    date: new Date().toISOString(),
    reason: 'PO Receipt',
    referenceuuid: purchaseOrderId // inject as referenceuuid
  }));

  const { data, error } = await supabase.from('stock_movements').insert(stockMovements);

  if (error) {
    console.error('Error inserting stock movements:', error);
    // Log full error object for debugging
    console.error('Supabase error details:', JSON.stringify(error, null, 2));
    throw new Error('Failed to insert stock movements: ' + error.message);
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
    await receivePurchaseOrder(supabase, purchaseOrderId, items);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
