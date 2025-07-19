import { supabase } from '../utils/supabaseClient';
import type { OrderStatusHistoryItem, OrderEvent } from '../components/OrderTimeline';

/**
 * Service for managing order timeline data
 * This version is optimized for Option 2: Comprehensive Events Table
 * All events (including status changes) are stored in the order_events table
 */
export class OrderTimelineService {
  
  /**
   * Load order status history from events table
   * Filters for status_change events and transforms them to status history format
   */
  static async loadStatusHistory(orderUuid: string): Promise<OrderStatusHistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_uuid', orderUuid)
        .eq('event_type', 'status_change')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading status history:', error);
        return [];
      }

      // Transform events to status history format
      return (data || []).map(event => ({
        id: event.id,
        order_uuid: event.order_uuid,
        status: event.event_data?.new_status || 'Draft',
        created_at: event.created_at,
        created_by: event.created_by,
        notes: event.description,
        metadata: event.event_data
      }));
    } catch (err) {
      console.error('Error loading status history:', err);
      return [];
    }
  }

  /**
   * Load order events (non-status-change events)
   */
  static async loadEvents(orderUuid: string): Promise<OrderEvent[]> {
    try {
      const { data, error } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_uuid', orderUuid)
        .neq('event_type', 'status_change') // Exclude status changes
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading events:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error loading events:', err);
      return [];
    }
  }

  /**
   * Load all events (both status changes and other events)
   */
  static async loadAllEvents(orderUuid: string): Promise<OrderEvent[]> {
    try {
      const { data, error } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_uuid', orderUuid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading all events:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error loading all events:', err);
      return [];
    }
  }

  /**
   * Add a new status change
   * This will update the order status and create an event (trigger handles the event creation)
   */
  static async addStatusChange(
    orderUuid: string, 
    status: string, 
    notes?: string, 
    createdBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update the order status - the trigger will automatically create the event
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: status as any })
        .eq('uuid', orderUuid);

      if (orderError) {
        return { success: false, error: orderError.message };
      }

      // If we have additional notes, create a supplementary event
      if (notes && notes.trim()) {
        await this.addEvent(
          orderUuid,
          'status_change_note',
          { status, additional_notes: notes },
          `Status change note`,
          notes,
          createdBy
        );
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Add a custom event to the events table
   */
  static async addEvent(
    orderUuid: string,
    eventType: string,
    eventData: any,
    title: string,
    description?: string,
    createdBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('order_events')
        .insert({
          order_uuid: orderUuid,
          event_type: eventType,
          event_data: eventData,
          title,
          description,
          created_by: createdBy
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Add an email sent event
   */
  static async addEmailSentEvent(
    orderUuid: string,
    emailType: string,
    recipient: string,
    subject?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.addEvent(
      orderUuid,
      'email_sent',
      {
        email_type: emailType,
        recipient,
        subject,
        timestamp: new Date().toISOString()
      },
      `${emailType.replace('_', ' ')} email sent`,
      `Email sent to ${recipient}${subject ? ` - ${subject}` : ''}`,
      'System'
    );
  }

  /**
   * Add a support ticket event
   */
  static async addSupportTicketEvent(
    orderUuid: string,
    ticketId: string,
    ticketStatus: string,
    subject: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.addEvent(
      orderUuid,
      'support_ticket',
      {
        ticket_id: ticketId,
        status: ticketStatus,
        subject
      },
      `Support ticket ${ticketStatus}`,
      `Ticket ${ticketId}: ${subject}`,
      'Support Team'
    );
  }

  /**
   * Add a payment event
   */
  static async addPaymentEvent(
    orderUuid: string,
    paymentType: string,
    amount: number,
    currency: string = 'USD',
    transactionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.addEvent(
      orderUuid,
      'payment_received',
      {
        payment_type: paymentType,
        amount,
        currency,
        transaction_id: transactionId,
        timestamp: new Date().toISOString()
      },
      `Payment ${paymentType} received`,
      `${amount} ${currency} payment processed${transactionId ? ` (${transactionId})` : ''}`,
      'Payment System'
    );
  }

  /**
   * Add a shipping event
   */
  static async addShippingEvent(
    orderUuid: string,
    carrier: string,
    trackingNumber: string,
    status: string = 'shipped'
  ): Promise<{ success: boolean; error?: string }> {
    return this.addEvent(
      orderUuid,
      'shipping_update',
      {
        carrier,
        tracking_number: trackingNumber,
        status,
        timestamp: new Date().toISOString()
      },
      `Package ${status}`,
      `${carrier} tracking: ${trackingNumber}`,
      'Shipping System'
    );
  }

  /**
   * Check if the events table exists (for graceful degradation)
   */
  static async checkTablesExist(): Promise<{
    statusHistoryExists: boolean;
    eventsExists: boolean;
  }> {
    try {
      // For Option 2, we only have the events table
      const eventsQuery = supabase
        .from('order_events')
        .select('id')
        .limit(1);

      const result = await eventsQuery;

      return {
        statusHistoryExists: !result.error, // Status history is derived from events
        eventsExists: !result.error
      };
    } catch (err) {
      return {
        statusHistoryExists: false,
        eventsExists: false
      };
    }
  }

  /**
   * Get timeline statistics for an order
   */
  static async getTimelineStats(orderUuid: string): Promise<{
    totalEvents: number;
    statusChanges: number;
    emailsSent: number;
    supportTickets: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('order_events')
        .select('event_type')
        .eq('order_uuid', orderUuid);

      if (error || !data) {
        return { totalEvents: 0, statusChanges: 0, emailsSent: 0, supportTickets: 0 };
      }

      const stats = data.reduce((acc, event) => {
        acc.totalEvents++;
        switch (event.event_type) {
          case 'status_change':
            acc.statusChanges++;
            break;
          case 'email_sent':
            acc.emailsSent++;
            break;
          case 'support_ticket':
            acc.supportTickets++;
            break;
        }
        return acc;
      }, { totalEvents: 0, statusChanges: 0, emailsSent: 0, supportTickets: 0 });

      return stats;
    } catch (err) {
      return { totalEvents: 0, statusChanges: 0, emailsSent: 0, supportTickets: 0 };
    }
  }
}
