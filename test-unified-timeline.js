// Test the unified timeline component
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎯 Testing Unified Timeline Component...\n');

async function testUnifiedTimeline() {
  try {
    // 1. Check if we have an order to work with
    console.log('1. Finding an order to test with...');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('uuid, order_number_display, status, customer_name')
      .limit(1);

    if (orderError || !orders || orders.length === 0) {
      console.log('❌ No orders found or error:', orderError?.message);
      return;
    }

    const testOrder = orders[0];
    console.log(`✅ Found order: ${testOrder.order_number_display} (${testOrder.customer_name})`);
    console.log(`   Current status: ${testOrder.status}`);
    console.log(`   UUID: ${testOrder.uuid}`);

    // 2. Check current timeline items
    console.log('\n2. Checking current timeline items...');
    const { data: events, error: eventsError } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_uuid', testOrder.uuid)
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError.message);
      return;
    }

    console.log(`✅ Found ${events.length} timeline items`);
    
    // Display current timeline items
    if (events.length > 0) {
      console.log('\n   Current timeline:');
      events.forEach((event, index) => {
        const date = new Date(event.created_at).toLocaleDateString();
        const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        console.log(`   ${index + 1}. ${event.event_type} - ${event.title || 'No title'} (${date} ${time})`);
      });
    }

    // 3. Add a diverse set of events to test the unified timeline
    console.log('\n3. Adding diverse events to test unified timeline...');
    
    const testEvents = [
      {
        event_type: 'checkout_completed',
        title: 'Checkout completed',
        description: 'Customer completed the checkout process',
        event_data: { payment_method: 'credit_card', amount: 99.99 }
      },
      {
        event_type: 'order_confirmation_sent',
        title: 'Order confirmation sent',
        description: 'Confirmation email sent to customer',
        event_data: { recipient: testOrder.customer_name, template: 'order_confirmation' }
      },
      {
        event_type: 'inventory_update',
        title: 'Inventory updated',
        description: 'Stock levels adjusted for ordered items',
        event_data: { items_processed: 3, total_quantity: 5 }
      }
    ];

    const createdEvents = [];
    for (const eventData of testEvents) {
      const { data: newEvent, error: createError } = await supabase
        .from('order_events')
        .insert({
          order_uuid: testOrder.uuid,
          event_type: eventData.event_type,
          title: eventData.title,
          description: eventData.description,
          event_data: eventData.event_data,
          created_by: 'Timeline Test'
        })
        .select()
        .single();

      if (createError) {
        console.error(`❌ Failed to create ${eventData.event_type} event:`, createError.message);
      } else {
        console.log(`✅ Created ${eventData.event_type} event`);
        createdEvents.push(newEvent);
      }
    }

    // 4. Show the final timeline
    console.log('\n4. Final unified timeline preview:');
    const { data: finalEvents, error: finalError } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_uuid', testOrder.uuid)
      .order('created_at', { ascending: false })
      .limit(10);

    if (finalError) {
      console.error('❌ Error fetching final timeline:', finalError.message);
      return;
    }

    console.log('\n   📋 Unified Timeline Preview:');
    console.log('   ================================');
    finalEvents.forEach((event, index) => {
      const date = new Date(event.created_at).toLocaleDateString();
      const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Determine the icon/type
      let icon = '📋';
      if (event.event_type.includes('status')) icon = '📊';
      if (event.event_type.includes('email') || event.event_type.includes('confirmation')) icon = '📧';
      if (event.event_type.includes('payment') || event.event_type.includes('checkout')) icon = '💳';
      if (event.event_type.includes('inventory') || event.event_type.includes('stock')) icon = '📦';
      if (event.event_type.includes('support') || event.event_type.includes('ticket')) icon = '🎧';
      
      console.log(`   ${icon} ${event.title}`);
      console.log(`      ${event.description || 'No description'}`);
      console.log(`      ${date} at ${time} • by ${event.created_by || 'System'}`);
      console.log('');
    });

    console.log('🎉 Unified Timeline Test Completed!');
    console.log('\n💡 Benefits of the unified approach:');
    console.log('   ✅ Single chronological view of all order activity');
    console.log('   ✅ Status changes integrated with events');
    console.log('   ✅ Clear visual hierarchy with icons and colors');
    console.log('   ✅ Interactive elements (clickable checkout events)');
    console.log('   ✅ Simplified component structure');
    
    console.log('\n🚀 Open http://localhost:5173 to see the timeline in action!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testUnifiedTimeline();
