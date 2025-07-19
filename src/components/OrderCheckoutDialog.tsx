import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { OrderTimelineService } from '../services/orderTimelineService';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Checkbox from '@mui/joy/Checkbox';
import Divider from '@mui/joy/Divider';
import Alert from '@mui/joy/Alert';
import CircularProgress from '@mui/joy/CircularProgress';

// Icons
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Types
export interface CheckoutData {
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    newsletter?: boolean;
  };
  deliveryInfo: {
    method: 'standard' | 'express' | 'overnight';
    cost: number;
    estimatedDays: number;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  paymentInfo: {
    method: 'card' | 'mobilepay' | 'viabill' | 'international';
    // Note: Never store actual payment details in frontend state
    // These would be tokenized by payment processor
  };
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  useBillingAsDelivery?: boolean;
}

export interface OrderCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  order: {
    uuid: string;
    order_number_display?: string;
    order_total?: number;
    customer_name?: string;
    customer_email?: string;
  } | null;
  onSuccess: () => void;
  mode?: 'checkout' | 'view';
  existingCheckoutData?: CheckoutData;
}

const deliveryOptions = [
  { value: 'standard', label: 'Standard Delivery', cost: 0, days: 5 },
  { value: 'express', label: 'Express Delivery', cost: 15, days: 2 },
  { value: 'overnight', label: 'Overnight Delivery', cost: 35, days: 1 }
];

const paymentMethods = [
  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { value: 'mobilepay', label: 'MobilePay', icon: '📱' },
  { value: 'viabill', label: 'ViaBill', icon: '💰' },
  { value: 'international', label: 'International Transfer', icon: '🌍' }
];

/**
 * OrderCheckoutDialog Component
 * 
 * Handles the checkout process for orders moving from Draft to Paid status.
 * Can also display checkout data in view mode for completed orders.
 * 
 * Props:
 * - open: Whether the dialog is open
 * - onClose: Function to close the dialog
 * - order: Order data
 * - onSuccess: Callback after successful checkout
 * - mode: 'checkout' for active checkout, 'view' for displaying existing data
 * - existingCheckoutData: Pre-filled checkout data for view mode
 */
export default function OrderCheckoutDialog({
  open,
  onClose,
  order,
  onSuccess,
  mode = 'checkout',
  existingCheckoutData
}: OrderCheckoutDialogProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);

  // Checkout form state
  const [checkoutData, setCheckoutData] = React.useState<CheckoutData>({
    customerInfo: {
      firstName: '',
      lastName: '',
      email: order?.customer_email || '',
      phone: '',
      newsletter: false
    },
    deliveryInfo: {
      method: 'standard',
      cost: 0,
      estimatedDays: 5,
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'Denmark'
      }
    },
    paymentInfo: {
      method: 'card'
    },
    useBillingAsDelivery: true
  });

  // Initialize with existing data if in view mode
  React.useEffect(() => {
    if (existingCheckoutData) {
      setCheckoutData(existingCheckoutData);
    } else if (order) {
      // Pre-populate with order data
      setCheckoutData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          firstName: order.customer_name?.split(' ')[0] || '',
          lastName: order.customer_name?.split(' ').slice(1).join(' ') || '',
          email: order.customer_email || ''
        }
      }));
    }
  }, [existingCheckoutData, order]);

  const steps = [
    { 
      label: 'Contact Information', 
      icon: <PersonIcon />,
      description: 'Your details'
    },
    { 
      label: 'Delivery', 
      icon: <LocalShippingIcon />,
      description: 'Where to send it'
    },
    { 
      label: 'Payment', 
      icon: <PaymentIcon />,
      description: 'How to pay'
    }
  ];

  const isReadOnly = mode === 'view';

  // Handle form updates
  const updateCheckoutData = (section: keyof CheckoutData, data: any) => {
    if (isReadOnly) return;
    
    setCheckoutData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  // Calculate total including delivery
  const calculateTotal = () => {
    const orderTotal = order?.order_total || 0;
    const deliveryCost = checkoutData.deliveryInfo.cost;
    return orderTotal + deliveryCost;
  };

  // Validate current step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Contact info
        return !!(
          checkoutData.customerInfo.firstName &&
          checkoutData.customerInfo.lastName &&
          checkoutData.customerInfo.email &&
          checkoutData.customerInfo.phone
        );
      case 1: // Delivery
        return !!(
          checkoutData.deliveryInfo.address.street &&
          checkoutData.deliveryInfo.address.city &&
          checkoutData.deliveryInfo.address.postalCode
        );
      case 2: // Payment
        return !!checkoutData.paymentInfo.method;
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (isStepValid(activeStep) && activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Complete checkout
  const handleCompleteCheckout = async () => {
    if (!order?.uuid) return;

    setProcessing(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Process payment with payment gateway
      // 2. Create payment intent
      // 3. Handle payment confirmation
      
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update order with checkout data
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'Paid',
          customer_name: `${checkoutData.customerInfo.firstName} ${checkoutData.customerInfo.lastName}`,
          customer_email: checkoutData.customerInfo.email,
          checkout_data: checkoutData,
          checkout_completed_at: new Date().toISOString(),
          payment_method: checkoutData.paymentInfo.method,
          delivery_method: checkoutData.deliveryInfo.method,
          delivery_address: checkoutData.deliveryInfo.address,
          billing_address: checkoutData.useBillingAsDelivery 
            ? checkoutData.deliveryInfo.address 
            : checkoutData.billingAddress
        })
        .eq('uuid', order.uuid);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Log checkout completion event
      await OrderTimelineService.addEvent(
        order.uuid,
        'checkout_completed',
        {
          payment_method: checkoutData.paymentInfo.method,
          delivery_method: checkoutData.deliveryInfo.method,
          total_amount: calculateTotal(),
          customer_email: checkoutData.customerInfo.email
        },
        'Checkout completed',
        `Customer completed checkout with ${checkoutData.paymentInfo.method} payment`,
        'Checkout System'
      );

      // Log payment event
      await OrderTimelineService.addPaymentEvent(
        order.uuid,
        checkoutData.paymentInfo.method,
        calculateTotal(),
        'DKK',
        `mock-txn-${Date.now()}`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Contact Information
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography level="h4">Contact Information</Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={checkoutData.customerInfo.firstName}
                  onChange={(e) => updateCheckoutData('customerInfo', { firstName: e.target.value })}
                  disabled={isReadOnly}
                  required
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={checkoutData.customerInfo.lastName}
                  onChange={(e) => updateCheckoutData('customerInfo', { lastName: e.target.value })}
                  disabled={isReadOnly}
                  required
                />
              </FormControl>
            </Box>
            
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={checkoutData.customerInfo.email}
                onChange={(e) => updateCheckoutData('customerInfo', { email: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input
                value={checkoutData.customerInfo.phone}
                onChange={(e) => updateCheckoutData('customerInfo', { phone: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </FormControl>
            
            {!isReadOnly && (
              <Checkbox
                label="Subscribe to newsletter"
                checked={checkoutData.customerInfo.newsletter}
                onChange={(e) => updateCheckoutData('customerInfo', { newsletter: e.target.checked })}
              />
            )}
          </Box>
        );

      case 1: // Delivery
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography level="h4">Delivery Information</Typography>
            
            <FormControl>
              <FormLabel>Delivery Method</FormLabel>
              <Select
                value={checkoutData.deliveryInfo.method}
                onChange={(_, value) => {
                  const option = deliveryOptions.find(opt => opt.value === value);
                  if (option) {
                    updateCheckoutData('deliveryInfo', {
                      method: value,
                      cost: option.cost,
                      estimatedDays: option.days
                    });
                  }
                }}
                disabled={isReadOnly}
              >
                {deliveryOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label} - {option.cost > 0 ? `${option.cost} DKK` : 'Free'} ({option.days} days)
                  </Option>
                ))}
              </Select>
            </FormControl>
            
            <Typography level="title-sm">Delivery Address</Typography>
            
            <FormControl>
              <FormLabel>Street Address</FormLabel>
              <Input
                value={checkoutData.deliveryInfo.address.street}
                onChange={(e) => updateCheckoutData('deliveryInfo', {
                  address: { ...checkoutData.deliveryInfo.address, street: e.target.value }
                })}
                disabled={isReadOnly}
                required
              />
            </FormControl>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  value={checkoutData.deliveryInfo.address.city}
                  onChange={(e) => updateCheckoutData('deliveryInfo', {
                    address: { ...checkoutData.deliveryInfo.address, city: e.target.value }
                  })}
                  disabled={isReadOnly}
                  required
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Postal Code</FormLabel>
                <Input
                  value={checkoutData.deliveryInfo.address.postalCode}
                  onChange={(e) => updateCheckoutData('deliveryInfo', {
                    address: { ...checkoutData.deliveryInfo.address, postalCode: e.target.value }
                  })}
                  disabled={isReadOnly}
                  required
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Select
                  value={checkoutData.deliveryInfo.address.country}
                  onChange={(_, value) => updateCheckoutData('deliveryInfo', {
                    address: { ...checkoutData.deliveryInfo.address, country: value }
                  })}
                  disabled={isReadOnly}
                >
                  <Option value="Denmark">Denmark</Option>
                  <Option value="Sweden">Sweden</Option>
                  <Option value="Norway">Norway</Option>
                  <Option value="Germany">Germany</Option>
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 2: // Payment
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography level="h4">Payment Information</Typography>
            
            <FormControl>
              <FormLabel>Payment Method</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {paymentMethods.map(method => (
                  <Box
                    key={method.value}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: checkoutData.paymentInfo.method === method.value ? 'primary.main' : 'divider',
                      borderRadius: 'sm',
                      cursor: isReadOnly ? 'default' : 'pointer',
                      backgroundColor: checkoutData.paymentInfo.method === method.value ? 'primary.softBg' : 'transparent',
                      '&:hover': isReadOnly ? {} : {
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => !isReadOnly && updateCheckoutData('paymentInfo', { method: method.value })}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>{method.icon}</Typography>
                      <Typography level="body-md">{method.label}</Typography>
                      {checkoutData.paymentInfo.method === method.value && (
                        <CheckCircleIcon color="primary" />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </FormControl>
            
            <Alert color="primary" variant="soft">
              <Typography level="body-sm">
                <strong>Secure Payment:</strong> Your payment information is processed securely by our payment provider.
                We never store your card details.
              </Typography>
            </Alert>

            <Divider />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography level="title-sm">Order Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="body-sm">Order Total:</Typography>
                <Typography level="body-sm">{order?.order_total || 0} DKK</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="body-sm">Delivery:</Typography>
                <Typography level="body-sm">
                  {checkoutData.deliveryInfo.cost > 0 ? `${checkoutData.deliveryInfo.cost} DKK` : 'Free'}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="title-sm">Total:</Typography>
                <Typography level="title-sm" color="primary">
                  {calculateTotal()} DKK
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <ModalClose />
        <Typography level="title-lg" sx={{ mb: 2 }}>
          {isReadOnly ? 'Checkout Details' : 'Complete Your Order'}
        </Typography>
        
        <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
          Order: {order.order_number_display}
        </Typography>

        {/* Stepper */}
        <Box sx={{ mb: 3 }}>
          <Stepper sx={{ width: '100%' }}>
            {steps.map((step, index) => (
              <Step
                key={index}
                indicator={
                  <StepIndicator
                    variant={activeStep === index ? 'solid' : activeStep > index ? 'solid' : 'outlined'}
                    color={activeStep > index ? 'success' : 'primary'}
                  >
                    {activeStep > index ? <CheckCircleIcon /> : step.icon}
                  </StepIndicator>
                }
              >
                <Box>
                  <Typography level="title-sm">{step.label}</Typography>
                  <Typography level="body-xs" color="neutral">{step.description}</Typography>
                </Box>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4, minHeight: '300px' }}>
          {renderStepContent()}
        </Box>

        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button
            variant="plain"
            onClick={activeStep === 0 ? onClose : handlePrevious}
            disabled={processing}
          >
            {activeStep === 0 ? 'Cancel' : 'Previous'}
          </Button>

          {!isReadOnly && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep) || processing}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteCheckout}
                  disabled={!isStepValid(activeStep) || processing}
                  loading={processing}
                  startDecorator={processing ? <CircularProgress size="sm" /> : <PaymentIcon />}
                >
                  Complete Order - {calculateTotal()} DKK
                </Button>
              )}
            </Box>
          )}

          {isReadOnly && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
}
