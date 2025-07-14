import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabaseClient';
import { sendOrderConfirmationEmail } from '../utils/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderUuid, resendEmail = false } = req.body;

    if (!orderUuid) {
      return res.status(400).json({ error: 'Order UUID is required' });
    }

    // Check if order exists and get its details
    const { data: order, error: orderError } = await supabase
      .from('Orders')
      .select('*')
      .eq('uuid', orderUuid)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only send email for paid orders, unless explicitly requesting resend
    if (!resendEmail && order.status !== 'Paid') {
      return res.status(400).json({ 
        error: 'Order confirmation emails are only sent for paid orders',
        orderStatus: order.status
      });
    }

    if (!order.customer_email) {
      return res.status(400).json({ error: 'Order has no customer email address' });
    }

    // Send the confirmation email
    const success = await sendOrderConfirmationEmail(orderUuid, order.storefront_id);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Order confirmation email sent successfully',
        orderNumber: order.order_number_display,
        customerEmail: order.customer_email
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send order confirmation email'
      });
    }
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
