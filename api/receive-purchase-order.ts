import type { VercelRequest, VercelResponse } from '@vercel/node';
import { receivePurchaseOrder } from './receivePurchaseOrder';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { purchaseOrderId, items } = req.body;

    if (!purchaseOrderId || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Missing purchaseOrderId or items' });
    }

    await receivePurchaseOrder(purchaseOrderId, items);
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
