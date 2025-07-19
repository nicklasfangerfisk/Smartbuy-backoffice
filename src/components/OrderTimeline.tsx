import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { OrderTimelineService } from '../services/orderTimelineService';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import Tooltip from '@mui/joy/Tooltip';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';
import StepButton from '@mui/joy/StepButton';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import EmailIcon from '@mui/icons-material/Email';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import DraftsIcon from '@mui/icons-material/Drafts';
import PaymentIcon from '@mui/icons-material/Payment';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Types
export type OrderStatus = 'Draft' | 'Paid' | 'Confirmed' | 'Packed' | 'Delivery' | 'Complete' | 'Returned' | 'Cancelled';

export interface OrderStatusHistoryItem {
  id: string;
  order_uuid: string;
  status: OrderStatus;
  created_at: string;
  created_by?: string;
  notes?: string;
  metadata?: any;
}

export interface OrderEvent {
  id: string;
  order_uuid: string;
  event_type: string;
  event_data: any;
  created_at: string;
  created_by?: string;
  title?: string;
  description?: string;
}

export interface OrderTimelineProps {
  orderUuid: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
  onEventClick?: (event: OrderStatusHistoryItem | OrderEvent) => void;
  readOnly?: boolean;
  showSecondaryEvents?: boolean;
}

// Status configuration with order, icons, and colors
const STATUS_CONFIG: Record<OrderStatus, {
  order: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  label: string;
  description: string;
}> = {
  Draft: {
    order: 1,
    icon: <DraftsIcon />,
    color: 'neutral',
    label: 'Draft',
    description: 'Order saved as draft'
  },
  Paid: {
    order: 2,
    icon: <PaymentIcon />,
    color: 'success',
    label: 'Paid',
    description: 'Payment secured'
  },
  Confirmed: {
    order: 3,
    icon: <VerifiedIcon />,
    color: 'primary',
    label: 'Confirmed',
    description: 'Order confirmation sent'
  },
  Packed: {
    order: 4,
    icon: <InventoryIcon />,
    color: 'primary',
    label: 'Packed',
    description: 'Order packed for shipment'
  },
  Delivery: {
    order: 5,
    icon: <LocalShippingIcon />,
    color: 'primary',
    label: 'In Delivery',
    description: 'Forwarded to shipping supplier'
  },
  Complete: {
    order: 6,
    icon: <CheckCircleIcon />,
    color: 'success',
    label: 'Complete',
    description: 'Order fulfilled successfully'
  },
  Returned: {
    order: 7,
    icon: <AssignmentReturnIcon />,
    color: 'warning',
    label: 'Returned',
    description: 'Order returned by customer'
  },
  Cancelled: {
    order: 8,
    icon: <CancelIcon />,
    color: 'danger',
    label: 'Cancelled',
    description: 'Order cancelled'
  }
};

/**
 * OrderTimeline Component
 * 
 * A unified vertical timeline component showing order status progression and events
 * in chronological order. Combines status changes and events into a single timeline.
 * 
 * Props:
 * - orderUuid: UUID of the order to display timeline for
 * - currentStatus: Current status of the order
 * - onStatusChange: Callback when status is changed (optional)
 * - onEventClick: Callback when timeline item is clicked (optional)
 * - readOnly: Whether the timeline is read-only (default: false)
 * - showSecondaryEvents: Whether to show secondary events (default: true)
 */
export default function OrderTimeline({
  orderUuid,
  currentStatus,
  onStatusChange,
  onEventClick,
  readOnly = false,
  showSecondaryEvents = true
}: OrderTimelineProps) {
  const [statusHistory, setStatusHistory] = React.useState<OrderStatusHistoryItem[]>([]);
  const [events, setEvents] = React.useState<OrderEvent[]>([]);
  const [orderData, setOrderData] = React.useState<any>(null); // Store order data including payment_method
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load order status history and events
  React.useEffect(() => {
    if (!orderUuid) return;

    const loadTimelineData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load order data including payment method and current status
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('payment_method, checkout_data, checkout_completed_at, status, confirmation_sent_at')
          .eq('uuid', orderUuid)
          .single();
        
        if (orderError) {
          console.error('Error loading order data:', orderError);
        } else {
          setOrderData(order);
        }

        // Check if tables exist first
        const { eventsExists } = await OrderTimelineService.checkTablesExist();
        
        if (eventsExists) {
          // Load real data from database (Option 2: comprehensive events table)
          const [statusHistoryData, eventsData] = await Promise.all([
            OrderTimelineService.loadStatusHistory(orderUuid), // Status changes from events table
            showSecondaryEvents ? OrderTimelineService.loadEvents(orderUuid) : Promise.resolve([])
          ]);
          
          setStatusHistory(statusHistoryData);
          setEvents(eventsData);
        } else {
          // Fallback to mock data for demonstration
          console.log('Timeline tables not found, using mock data');
          const mockStatusHistory: OrderStatusHistoryItem[] = [
            {
              id: '1',
              order_uuid: orderUuid,
              status: 'Draft',
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              created_by: 'System',
              notes: 'Order created as draft'
            },
            {
              id: '2',
              order_uuid: orderUuid,
              status: 'Paid',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              created_by: 'Payment System',
              notes: 'Payment processed successfully'
            }
          ];

          const mockEvents: OrderEvent[] = showSecondaryEvents ? [
            {
              id: 'e1',
              order_uuid: orderUuid,
              event_type: 'email_sent',
              event_data: { 
                email_type: 'order_confirmation', 
                recipient: 'customer@example.com',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
              },
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
              title: 'Order confirmation sent',
              description: 'Confirmation email sent to customer'
            },
            {
              id: 'e2',
              order_uuid: orderUuid,
              event_type: 'support_ticket',
              event_data: { 
                ticket_id: 'T-12345', 
                status: 'resolved',
                subject: 'Delivery inquiry'
              },
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              title: 'Support ticket resolved',
              description: 'Customer inquiry about delivery status'
            }
          ] : [];

          setStatusHistory(mockStatusHistory);
          setEvents(mockEvents);
        }
      } catch (err: any) {
        console.error('Error loading timeline data:', err);
        setError('Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    loadTimelineData();
  }, [orderUuid, showSecondaryEvents]);

  // Reload timeline data when status changes to ensure we have the latest data
  React.useEffect(() => {
    // Only reload if we already have data and the status has changed significantly
    if (!loading && orderUuid && orderData) {
      // Check if the current status has progressed beyond what we have in orderData
      const currentOrderStatus = orderData.status;
      if (currentOrderStatus && currentStatus !== currentOrderStatus) {
        console.log(`Timeline: Status changed from ${currentOrderStatus} to ${currentStatus}, reloading data...`);
        
        // Reload order data to get updated fields
        const reloadOrderData = async () => {
          try {
            const { data: order, error: orderError } = await supabase
              .from('orders')
              .select('payment_method, checkout_data, checkout_completed_at, status, confirmation_sent_at')
              .eq('uuid', orderUuid)
              .single();
            
            if (orderError) {
              console.error('Error reloading order data:', orderError);
            } else {
              setOrderData(order);
            }

            // Also reload status history and events to get latest timeline items
            const { eventsExists } = await OrderTimelineService.checkTablesExist();
            
            if (eventsExists) {
              const [statusHistoryData, eventsData] = await Promise.all([
                OrderTimelineService.loadStatusHistory(orderUuid),
                showSecondaryEvents ? OrderTimelineService.loadEvents(orderUuid) : Promise.resolve([])
              ]);
              
              setStatusHistory(statusHistoryData);
              setEvents(eventsData);
            }
          } catch (err) {
            console.error('Error reloading timeline data:', err);
          }
        };

        reloadOrderData();
      }
    }
  }, [currentStatus, orderUuid, showSecondaryEvents, loading, orderData]);

  // Get all timeline items sorted by date
  const getAllTimelineItems = () => {
    const items: Array<{
      id: string;
      type: 'status' | 'event';
      created_at: string;
      data: OrderStatusHistoryItem | OrderEvent;
    }> = [];

    // Add status history items
    statusHistory.forEach(item => {
      items.push({
        id: item.id,
        type: 'status',
        created_at: item.created_at,
        data: item
      });
    });

    // Add events
    events.forEach(item => {
      items.push({
        id: item.id,
        type: 'event',
        created_at: item.created_at,
        data: item
      });
    });

    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Get the icon for an event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'email_sent':
      case 'order_confirmation_sent':
      case 'order_confirmation_resend':
        return <EmailIcon />;
      case 'support_ticket':
      case 'customer_inquiry':
        return <SupportAgentIcon />;
      case 'checkout_completed':
      case 'payment_received':
        return <PaymentIcon />;
      case 'order_shipped':
      case 'shipping_update':
        return <LocalShippingIcon />;
      case 'inventory_update':
      case 'stock_adjustment':
        return <InventoryIcon />;
      default:
        return <PendingIcon />;
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (readOnly || !onStatusChange) return;

    try {
      // Use the service to update status
      const result = await OrderTimelineService.addStatusChange(
        orderUuid, 
        newStatus, 
        `Status manually changed to ${newStatus}`,
        'Current User'
      );
      
      if (result.success) {
        // Refresh timeline data
        const { eventsExists } = await OrderTimelineService.checkTablesExist();
        if (eventsExists) {
          const updatedHistory = await OrderTimelineService.loadStatusHistory(orderUuid);
          setStatusHistory(updatedHistory);
        } else {
          // Update local mock data
          const newStatusItem: OrderStatusHistoryItem = {
            id: crypto.randomUUID(),
            order_uuid: orderUuid,
            status: newStatus,
            created_at: new Date().toISOString(),
            created_by: 'Current User',
            notes: `Status changed to ${newStatus}`
          };
          
          setStatusHistory(prev => [newStatusItem, ...prev]);
        }
        
        onStatusChange(newStatus);
      } else {
        console.error('Error changing status:', result.error);
        setError('Failed to change status: ' + result.error);
      }
    } catch (err: any) {
      console.error('Error changing status:', err);
      setError('Failed to change status');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size="sm" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="danger" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const timelineItems = getAllTimelineItems();

  // Get the active step index based on current status
  const getActiveStepIndex = () => {
    const statusOrder = ['Draft', 'Paid', 'Confirmed', 'Packed', 'Delivery', 'Complete'];
    return statusOrder.indexOf(currentStatus);
  };

  // Get all status steps for the stepper
  const getStatusSteps = () => {
    const statusOrder: OrderStatus[] = ['Draft', 'Paid', 'Confirmed', 'Packed', 'Delivery', 'Complete'];
    return statusOrder.map(status => ({
      status,
      config: STATUS_CONFIG[status],
      completed: STATUS_CONFIG[status].order <= STATUS_CONFIG[currentStatus].order
    }));
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {/* MUI Joy Stepper */}
      <Stepper orientation="vertical" sx={{ '--Stepper-verticalGap': '2rem' }}>
        {getStatusSteps().map((step, index) => {
          const isActive = step.status === currentStatus;
          const isCompleted = step.completed && !isActive;
          
          return (
            <Step
              key={step.status}
              indicator={
                <StepIndicator
                  variant={isCompleted ? 'solid' : isActive ? 'solid' : 'outlined'}
                  color={isCompleted ? 'success' : isActive ? 'primary' : 'neutral'}
                >
                  {step.config.icon}
                </StepIndicator>
              }
              sx={{
                '&::after': {
                  ...(index === getStatusSteps().length - 1 && { display: 'none' })
                }
              }}
            >
              <Box sx={{ ml: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    level="title-sm"
                    sx={{ 
                      color: isActive ? 'primary.main' : isCompleted ? 'success.main' : 'text.secondary'
                    }}
                  >
                    {step.config.label}
                    {step.status === 'Paid' && orderData?.payment_method && (
                      <Typography component="span" level="title-sm" sx={{ color: 'text.secondary', ml: 0.5 }}>
                        by {orderData.payment_method}
                      </Typography>
                    )}
                    {step.status === 'Confirmed' && orderData?.confirmation_sent_at && (
                      <Typography component="span" level="title-sm" sx={{ color: 'text.secondary', ml: 0.5 }}>
                        sent
                      </Typography>
                    )}
                  </Typography>
                  {step.status === 'Paid' && orderData?.checkout_data && (
                    <Button 
                      size="sm" 
                      variant="outlined" 
                      color="neutral"
                      onClick={() => onEventClick && onEventClick({
                        id: 'checkout_view',
                        order_uuid: orderUuid,
                        event_type: 'checkout_completed',
                        event_data: orderData.checkout_data,
                        created_at: orderData.checkout_completed_at || new Date().toISOString(),
                        title: 'View Checkout Details'
                      })}
                      sx={{ 
                        fontSize: '0.75rem', 
                        minHeight: '24px',
                        px: 1,
                        '--Button-gap': '4px'
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </Box>
                <Typography level="body-xs" color="neutral">
                  {step.config.description}
                  {step.status === 'Paid' && orderData?.checkout_completed_at && (
                    <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary', ml: 0.5 }}>
                      • {formatDate(orderData.checkout_completed_at)}
                    </Typography>
                  )}
                  {step.status === 'Confirmed' && orderData?.confirmation_sent_at && (
                    <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary', ml: 0.5 }}>
                      • {formatDate(orderData.confirmation_sent_at)}
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Step>
          );
        })}
      </Stepper>

      {/* Events Section (if any) */}
      {events.length > 0 && (
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography level="title-sm" sx={{ mb: 2, color: 'text.secondary' }}>
            Recent Activity
          </Typography>
          {events.slice(0, 3).map((event) => (
            <Box key={event.id} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: 'neutral.main', '& svg': { fontSize: '1rem' } }}>
                {getEventIcon(event.event_type)}
              </Box>
              <Typography level="body-xs" color="neutral">
                {event.title || event.event_type}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
