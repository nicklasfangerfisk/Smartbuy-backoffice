import { supabase } from './supabaseClient';
import { apiClient } from '../services/apiClient';

/**
 * Send order confirmation email via API (browser-safe)
 */
async function sendOrderConfirmationViaAPI(orderUuid: string, storefrontId?: string, customerEmail?: string): Promise<void> {
  try {
    console.log(`📧 Sending order confirmation email for order: ${orderUuid}`);
    const result = await apiClient.sendOrderConfirmation(orderUuid, undefined, storefrontId, customerEmail);
    
    if (!result.success) {
      // If API returns 404, it means we're in development mode without Vercel
      if (result.statusCode === 404) {
        console.warn('Email API not available. To test email functionality, run with "vercel dev" instead of "npm run dev".');
        return;
      }
      
      throw new Error(result.error || `API error! status: ${result.statusCode}`);
    }
    
    console.log('✅ Order confirmation email sent successfully');
  } catch (error: any) {
    // If fetch fails completely (network error), just log and continue
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      console.warn('Email API not available. To test email functionality, run with "vercel dev" instead of "npm run dev".');
      return;
    }
    
    // Re-throw other errors
    throw error;
  }
}

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  storefront_id?: string;
  discount?: number;
  notes?: string;
  orderItems: Array<{
    product_uuid: string;
    quantity: number;
    unitprice: number;
    discount?: number;
  }>;
}

export interface OrderCreationResult {
  success: boolean;
  order?: {
    uuid: string;
    order_number_display: string;
  };
  error?: string;
}

/**
 * Creates a new order with associated items and optionally sends confirmation email
 */
export async function createOrderWithItems(
  orderData: CreateOrderData,
  sendConfirmationEmail: boolean = true
): Promise<OrderCreationResult> {
  try {
    // Create the order (total will be computed by database triggers from OrderItems)
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        storefront_id: orderData.storefront_id || null,
        discount: orderData.discount || 0,
        // notes: orderData.notes || null, // Temporarily disabled until column is added
        // order_total: finalTotal, // Remove - let database triggers compute this
        status: 'Draft',
        date: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { success: false, error: orderError.message };
    }

    const orderUuid = orderResult.uuid;

    // Create order items
    const orderItemsData = orderData.orderItems.map(item => ({
      order_uuid: orderUuid,
      product_uuid: item.product_uuid,
      quantity: item.quantity,
      unitprice: item.unitprice,
      discount: item.discount || 0
    }));

    const { error: itemsError } = await supabase
      .from('orderitems')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to delete the created order
      await supabase.from('orders').delete().eq('uuid', orderUuid);
      return { success: false, error: itemsError.message };
    }

    const result = {
      success: true,
      order: {
        uuid: orderUuid,
        order_number_display: orderResult.order_number_display || `Order #${orderResult.order_number}`
      }
    };

    // Send confirmation email if requested and order is completed
    if (sendConfirmationEmail && orderData.customer_email) {
      try {
        await sendOrderConfirmationViaAPI(orderUuid, orderData.storefront_id, orderData.customer_email);
      } catch (emailError) {
        console.warn('Failed to send confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
    }

    return result;
  } catch (error: any) {
    console.error('Error in createOrderWithItems:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Completes an order (moves from Draft to Paid) and sends confirmation email
 */
export async function completeOrder(
  orderUuid: string,
  customerInfo?: {
    name?: string;
    email?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('uuid', orderUuid)
      .single();

    if (fetchError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Update order status and customer info if provided
    const updateData: any = { status: 'Paid' };
    
    if (customerInfo?.name) {
      updateData.customer_name = customerInfo.name;
    }
    if (customerInfo?.email) {
      updateData.customer_email = customerInfo.email;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('uuid', orderUuid);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Create stock movements for inventory tracking
    const { data: orderItems, error: itemsError } = await supabase
      .from('OrderItems')
      .select('product_uuid, quantity')
      .eq('order_uuid', orderUuid);

    if (!itemsError && orderItems && orderItems.length > 0) {
      const stockMovements = orderItems
        .filter(item => item.product_uuid) // Only items with valid product UUIDs
        .map(item => ({
          product_id: item.product_uuid!,
          movement_type: 'outgoing' as const,
          quantity: item.quantity,
          date: new Date().toISOString(),
          reason: 'Order Fulfillment',
          referenceuuid: orderUuid
        }));

      if (stockMovements.length > 0) {
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert(stockMovements);

        if (movementError) {
          console.warn('Failed to create stock movements:', movementError);
          // Continue with order completion even if stock movements fail
        }
      }
    }

    // Send order confirmation email
    const finalEmail = customerInfo?.email || order.customer_email;
    if (finalEmail) {
      try {
        await sendOrderConfirmationViaAPI(orderUuid, order.storefront_id, finalEmail);
      } catch (emailError) {
        console.warn('Failed to send confirmation email:', emailError);
        // Don't fail the order completion if email fails
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error completing order:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets available storefronts for order creation
 */
export async function getAvailableStorefronts() {
  try {
    const { data, error } = await supabase
      .from('storefronts')
      .select('id, name, url, is_online')
      .eq('is_online', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching storefronts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching storefronts:', error);
    return [];
  }
}
