/**
 * Test script for Order Timeline functionality
 * Tests the Option 2 implementation with comprehensive events table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderTimeline() {
  console.log('🧪 Testing Order Timeline functionality...\n');

  try {
    // 1. Check if the order_events table exists
    console.log('1. Checking if order_events table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('order_events')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Order events table not found:', tableError.message);
      console.log('💡 Please run the migration first:');
      console.log('   Copy the contents of migrations/2025-07-19-order-status-tracking-option2.sql');
      console.log('   and run it in your Supabase SQL editor');
      return;
    }
    console.log('✅ Order events table exists');

    // 2. Find an existing order to test with
    console.log('\n2. Finding an existing order...');
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

    // 3. Check existing events for this order
    console.log('\n3. Checking existing events for this order...');
    const { data: existingEvents } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_uuid', testOrder.uuid)
      .order('created_at', { ascending: false });

    console.log(`✅ Found ${existingEvents?.length || 0} existing events`);
    if (existingEvents && existingEvents.length > 0) {
      console.log('   Recent events:');
      existingEvents.slice(0, 3).forEach(event => {
        console.log(`   - ${event.event_type}: ${event.title} (${new Date(event.created_at).toLocaleDateString()})`);
      });
    }

    // 4. Test adding a new event
    console.log('\n4. Testing event creation...');
    const testEventData = {
      order_uuid: testOrder.uuid,
      event_type: 'timeline_test',
      event_data: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Testing timeline functionality'
      },
      title: 'Timeline Test Event',
      description: 'This is a test event created by the timeline test script',
      created_by: 'Test Script'
    };

    const { data: newEvent, error: eventError } = await supabase
      .from('order_events')
      .insert(testEventData)
      .select()
      .single();

    if (eventError) {
      console.log('❌ Failed to create test event:', eventError.message);
      return;
    }
    console.log('✅ Successfully created test event:', newEvent.id);

    // 5. Test status change (this will trigger the automatic event creation)
    console.log('\n5. Testing status change event creation...');
    const originalStatus = testOrder.status;
    const newStatus = originalStatus === 'Draft' ? 'Paid' : 'Draft';

    const { error: statusError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('uuid', testOrder.uuid);

    if (statusError) {
      console.log('❌ Failed to update order status:', statusError.message);
      return;
    }

    // Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if the status change event was created
    const { data: statusEvents } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_uuid', testOrder.uuid)
      .eq('event_type', 'status_change')
      .order('created_at', { ascending: false })
      .limit(1);

    if (statusEvents && statusEvents.length > 0) {
      const latestStatusEvent = statusEvents[0];
      console.log('✅ Status change event created automatically');
      console.log(`   From: ${latestStatusEvent.event_data.old_status} → To: ${latestStatusEvent.event_data.new_status}`);
    } else {
      console.log('⚠️  Status change event not found (trigger may not be working)');
    }

    // 6. Revert the status change
    console.log('\n6. Reverting status change...');
    await supabase
      .from('orders')
      .update({ status: originalStatus })
      .eq('uuid', testOrder.uuid);

    // 7. Test the helper function
    console.log('\n7. Testing helper function...');
    const { data: helperResult, error: helperError } = await supabase
      .rpc('add_order_event', {
        p_order_uuid: testOrder.uuid,
        p_event_type: 'helper_test',
        p_event_data: { test: 'helper function', created_at: new Date().toISOString() },
        p_title: 'Helper Function Test',
        p_description: 'Testing the add_order_event helper function',
        p_created_by: 'Test Script'
      });

    if (helperError) {
      console.log('❌ Helper function failed:', helperError.message);
    } else {
      console.log('✅ Helper function worked, event ID:', helperResult);
    }

    // 8. Final summary
    console.log('\n8. Final event count...');
    const { data: finalEvents } = await supabase
      .from('order_events')
      .select('event_type')
      .eq('order_uuid', testOrder.uuid);

    const eventCounts = finalEvents?.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    console.log('✅ Event summary:');
    Object.entries(eventCounts || {}).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} events`);
    });

    console.log('\n🎉 Timeline test completed successfully!');
    console.log('💡 You can now use the timeline in the Order Dialog');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testOrderTimeline();
