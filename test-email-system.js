/**
 * Test script for order confirmation emails
 * Run this to test email functionality with real or test data
 */

import { supabase } from './src/utils/supabaseClient.js';
import { sendOrderConfirmationEmail, sendTestOrderConfirmationEmail } from '../src/utils/emailService';

async function testEmailFunctionality() {
  console.log('🔍 Testing Order Confirmation Email System...\n');

  // Test 1: Send a test email
  console.log('📧 Test 1: Sending test email to nicklas_bak@outlook.dk');
  try {
    const testEmailSuccess = await sendTestOrderConfirmationEmail('nicklas_bak@outlook.dk');
    console.log(`✅ Test email result: ${testEmailSuccess ? 'SUCCESS' : 'FAILED'}\n`);
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }

  // Test 2: Check for existing orders
  console.log('📋 Test 2: Checking for existing orders in database...');
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        uuid,
        order_number_display,
        customer_name,
        customer_email,
        status,
        order_total,
        storefront_id
      `)
      .order('Created at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('📝 No orders found in database');
      return;
    }

    console.log(`📊 Found ${orders.length} recent orders:`);
    orders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.order_number_display} - ${order.customer_name} (${order.status})`);
      console.log(`     Email: ${order.customer_email || 'No email'}`);
      console.log(`     Total: $${order.order_total || 0}`);
      console.log(`     Storefront: ${order.storefront_id || 'None'}\n`);
    });

    // Test 3: Send real order confirmation if we have a paid order
    const paidOrder = orders.find(o => o.status === 'Paid' && o.customer_email);
    if (paidOrder) {
      console.log(`📬 Test 3: Sending real order confirmation for ${paidOrder.order_number_display}`);
      console.log(`   Original customer: ${paidOrder.customer_email}`);
      console.log(`   Test recipient: nicklas_bak@outlook.dk\n`);
      
      // We'll modify the order temporarily to use our test email
      const { error: updateError } = await supabase
        .from('orders')
        .update({ customer_email: 'nicklas_bak@outlook.dk' })
        .eq('uuid', paidOrder.uuid);

      if (updateError) {
        console.error('❌ Error updating order email:', updateError);
        return;
      }

      const realEmailSuccess = await sendOrderConfirmationEmail(paidOrder.uuid, paidOrder.storefront_id);
      console.log(`✅ Real order email result: ${realEmailSuccess ? 'SUCCESS' : 'FAILED'}`);

      // Restore original email
      await supabase
        .from('orders')
        .update({ customer_email: paidOrder.customer_email })
        .eq('uuid', paidOrder.uuid);

    } else {
      console.log('📝 No paid orders with email found for real order test');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }

  console.log('\n🎉 Email testing complete!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailFunctionality().catch(console.error);
}

export { testEmailFunctionality };
