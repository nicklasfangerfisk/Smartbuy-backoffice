// Test checkout data persistence
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing Checkout Data Persistence...\n');

async function testCheckoutDataPersistence() {
  try {
    // 1. Check if checkout columns exist in Orders table
    console.log('1. Checking Orders table structure...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('uuid, checkout_data, checkout_completed_at, payment_method, billing_address, delivery_address, order_notes')
      .limit(1);

    if (ordersError) {
      console.error('❌ Orders table query failed:', ordersError.message);
      return;
    }

    console.log('✅ Orders table with checkout columns accessible');

    // 2. Find an existing order to test with
    console.log('\n2. Finding an existing draft order...');
    const { data: draftOrders, error: draftError } = await supabase
      .from('orders')
      .select('uuid, order_number_display, status')
      .eq('status', 'Draft')
      .limit(1);

    if (draftError) {
      console.error('❌ Draft orders query failed:', draftError.message);
      return;
    }

    if (!draftOrders || draftOrders.length === 0) {
      console.log('⚠️ No draft orders found, creating one...');
      
      // Create a test order
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          status: 'Draft',
          order_total: 99.99
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create test order:', createError.message);
        return;
      }

      console.log('✅ Created test order:', newOrder.order_number_display);
      var testOrder = newOrder;
    } else {
      var testOrder = draftOrders[0];
      console.log('✅ Found draft order:', testOrder.order_number_display);
    }

    // 3. Test updating checkout data
    console.log('\n3. Testing checkout data update...');
    const checkoutData = {
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1-555-0123'
      },
      billing: {
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US'
      },
      payment: {
        method: 'credit_card',
        cardType: 'visa',
        last4: '1234'
      }
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        checkout_data: checkoutData,
        checkout_completed_at: new Date().toISOString(),
        payment_method: 'credit_card',
        billing_address: checkoutData.billing,
        delivery_address: checkoutData.billing, // Same as billing for this test
        order_notes: 'Test checkout completed successfully',
        status: 'Paid'
      })
      .eq('uuid', testOrder.uuid)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Checkout data update failed:', updateError.message);
      return;
    }

    console.log('✅ Checkout data updated successfully');
    console.log('   Payment method:', updatedOrder.payment_method);
    console.log('   Checkout completed at:', updatedOrder.checkout_completed_at);
    console.log('   Order notes:', updatedOrder.order_notes);

    // 4. Verify data retrieval
    console.log('\n4. Verifying checkout data retrieval...');
    const { data: retrievedOrder, error: retrieveError } = await supabase
      .from('orders')
      .select('checkout_data, payment_method, billing_address, delivery_address')
      .eq('uuid', testOrder.uuid)
      .single();

    if (retrieveError) {
      console.error('❌ Data retrieval failed:', retrieveError.message);
      return;
    }

    console.log('✅ Checkout data retrieved successfully');
    console.log('   Customer name from checkout_data:', retrievedOrder.checkout_data.customer.name);
    console.log('   Billing city:', retrievedOrder.billing_address.city);
    console.log('   Payment method:', retrievedOrder.payment_method);

    console.log('\n🎉 Checkout data persistence test completed successfully!');
    console.log('💡 The checkout flow is ready to use in the application');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCheckoutDataPersistence();
