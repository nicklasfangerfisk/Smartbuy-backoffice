/**
 * CheckoutDialog - Clean checkout experience
 * 
 * Simplified checkout flow with:
 * 1. Customer Information
 * 2. Payment Method (mocked)
 * 3. Order Review & Confirmation
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

// Joy UI components
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';
import StepButton from '@mui/joy/StepButton';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import Alert from '@mui/joy/Alert';
import CircularProgress from '@mui/joy/CircularProgress';

// Icons
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import checkout step components
import CustomerInfoForm from './CheckoutSteps/CustomerInfoForm';
import DeliveryForm from './CheckoutSteps/DeliveryForm';
import PaymentForm from './CheckoutSteps/PaymentForm';

// Utilities
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';

// Types
import type { Database } from '../general/supabase.types';

export interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  order: {
    uuid: string;
    order_number_display?: string;
    order_total?: number;
    discount?: number;
    customer_name?: string;
    customer_email?: string;
  } | null;
  onSuccess: () => void;
}

export interface OrderItem {
  uuid: string;
  product_uuid: string | null;
  quantity: number;
  unitprice: number | null;
  discount: number | null;
  ProductName?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  newsletter?: boolean;
  reference?: string;
}

export interface PaymentInfo {
  method: 'card' | 'mobilepay' | 'viabill' | 'international';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  bankAccount?: string;
  routingNumber?: string;
}

export interface DeliveryInfo {
  method: 'standard' | 'express' | 'overnight';
  estimatedDays?: number;
  cost?: number;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const steps = [
  { label: 'Contact' },
  { label: 'Delivery' },
  { label: 'Payment' }
];

export default function CheckoutDialog({ open, onClose, order, onSuccess }: CheckoutDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: order?.customer_name || '',
    email: order?.customer_email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'USA',
    firstName: '',
    lastName: '',
    newsletter: false,
    reference: ''
  });
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    method: 'standard'
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Load order items when dialog opens
  useEffect(() => {
    if (open && order) {
      fetchOrderItems();
      // Reset state when opening
      setActiveStep(0);
      setOrderCompleted(false);
      setError(null);
      // Pre-populate customer info if available
      setCustomerInfo(prev => {
        const existingName = order.customer_name || prev.name;
        const nameParts = existingName.split(' ');
        return {
          ...prev,
          name: existingName,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: order.customer_email || prev.email,
        };
      });
    }
  }, [open, order]);

  const fetchOrderItems = async () => {
    if (!order) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('OrderItems')
        .select(`
          uuid,
          product_uuid,
          quantity,
          unitprice,
          discount,
          Products:product_uuid(ProductName)
        `)
        .eq('order_uuid', order.uuid);

      if (error) throw error;

      const mappedItems: OrderItem[] = data?.map((item: any) => ({
        ...item,
        ProductName: item.Products?.ProductName || 'Unknown Product',
      })) || [];

      setOrderItems(mappedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to load order items');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      // Update order with customer information and change status to Paid
      const customerName = customerInfo.firstName && customerInfo.lastName 
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : customerInfo.name || '';
        
      const { error: orderError } = await supabase
        .from('Orders')
        .update({
          customer_name: customerName,
          customer_email: customerInfo.email,
          status: 'Paid',
          // Add payment and shipping info as JSON in a notes field or separate table
        })
        .eq('uuid', order.uuid);

      if (orderError) throw orderError;

      // Create stock movements for order fulfillment
      if (orderItems.length > 0) {
        const stockMovements = orderItems.map(item => ({
          product_id: item.product_uuid!,
          movement_type: 'outgoing' as const,
          quantity: item.quantity,
          date: new Date().toISOString(),
          reason: 'Order Fulfillment',
          referenceuuid: order.uuid
        }));

        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert(stockMovements);

        if (movementError) {
          console.warn('Failed to create stock movements:', movementError);
          // Continue with order completion even if stock movements fail
        }
      }

      setOrderCompleted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        // Customer info step - check required fields
        return !!(customerInfo.email?.trim() && 
               customerInfo.phone?.trim() &&
               customerInfo.firstName?.trim() &&
               customerInfo.lastName?.trim() &&
               customerInfo.address?.trim() &&
               customerInfo.city?.trim() &&
               customerInfo.postalCode?.trim());
      case 1:
        return true; // Delivery method is always valid as it has a default value
      case 2:
        // Payment step - only validate card details if card is selected
        if (paymentInfo.method === 'card') {
          return !!(paymentInfo.cardNumber?.replace(/\s/g, '').length === 16 && 
                 paymentInfo.cardHolder?.trim() &&
                 paymentInfo.expiryDate?.length === 5 &&
                 paymentInfo.cvv?.length === 3);
        }
        return true; // Other payment methods are always valid for demo
      default:
        return false;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CustomerInfoForm
            customerInfo={customerInfo}
            onChange={setCustomerInfo}
            // onLogin prop is intentionally omitted to disable login in this app
            // Future microfrontend implementations can provide this handler
          />
        );
      case 1:
        return (
          <DeliveryForm
            deliveryInfo={deliveryInfo}
            onChange={setDeliveryInfo}
            subtotal={calculateTotal()}
          />
        );
      case 2:
        return (
          <PaymentForm
            paymentInfo={paymentInfo}
            onChange={setPaymentInfo}
          />
        );
      default:
        return null;
    }
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      const itemTotal = (item.unitprice || 0) * item.quantity;
      const itemDiscount = (item.discount || 0) * item.quantity;
      return sum + itemTotal - itemDiscount;
    }, 0);
    
    const orderDiscount = order?.discount || 0;
    return subtotal - orderDiscount;
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const shippingCost = deliveryInfo.cost || 0;
    return subtotal + shippingCost;
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: { xs: 0, md: 2 }, // No padding on mobile, some padding on desktop
        zIndex: 10001, // Ensure modal is above mobile menu
      }}
    >
      <ModalDialog
        size="lg"
        sx={{
          width: { xs: '100vw', md: '90vw' },
          maxWidth: { xs: 'none', md: 1000 },
          height: { xs: '100vh', md: '90vh' },
          maxHeight: { xs: 'none', md: 750 },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          m: 0,
          borderRadius: { xs: 0, md: 'md' }, // No border radius on mobile
          p: 0, // Remove default padding
        }}
      >
        {/* Header - only on desktop */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'flex-end', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <ModalClose />
        </Box>

        {/* Mobile Close Button */}
        <Box sx={{ 
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'flex-end', 
          alignItems: 'center',
          p: 1,
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'background.surface'
        }}>
          <ModalClose />
        </Box>
        
        {orderCompleted ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: 2,
            p: 3
          }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
            <Typography level="h2">Order Completed!</Typography>
            <Typography level="body-lg" textAlign="center" color="neutral">
              Thank you for your order! Order #{order.order_number_display} has been processed successfully.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: '100%',
            overflow: 'hidden'
          }}>
            {/* Mobile Order Summary - Collapsible */}
            <Box sx={{ 
              display: { xs: 'block', md: 'none' },
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              {/* Header with title and collapse button */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                pr: 6, // Add right padding to avoid close button
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography level="title-md">Order Summary</Typography>
                  <Typography level="body-sm" color="primary">
                    {formatCurrencyWithSymbol(calculateFinalTotal())}
                  </Typography>
                </Box>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
                  sx={{ 
                    minWidth: 'auto',
                    p: 1
                  }}
                >
                  {orderSummaryExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Button>
              </Box>
              
              {orderSummaryExpanded && (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'background.level1',
                  animation: 'fadeIn 0.2s ease-in-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}>
                  <Typography level="body-sm" color="neutral" sx={{ mb: 2 }}>
                    Order #{order.order_number_display}
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress size="sm" />
                    </Box>
                  ) : (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {orderItems.map((item) => (
                        <Box key={item.uuid} sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                              {item.ProductName}
                            </Typography>
                            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                              {formatCurrencyWithSymbol((item.unitprice || 0) * item.quantity - (item.discount || 0) * item.quantity)}
                            </Typography>
                          </Box>
                          <Typography level="body-xs" color="neutral">
                            Qty: {item.quantity} × {formatCurrencyWithSymbol(item.unitprice || 0)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography level="body-xs">Shipping</Typography>
                      <Typography level="body-xs">
                        {formatCurrencyWithSymbol(deliveryInfo.cost || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography level="body-xs">VAT included</Typography>
                      <Typography level="body-xs">
                        {formatCurrencyWithSymbol(orderItems.reduce((sum, item) => sum + (item.unitprice || 0) * item.quantity, 0) * 0.2)}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography level="title-sm" sx={{ fontWeight: 700 }}>Total:</Typography>
                    <Typography level="title-sm" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrencyWithSymbol(calculateFinalTotal())}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Desktop Order Summary Sidebar */}
            <Box sx={{ 
              display: { xs: 'none', md: 'block' },
              width: { md: '350px' },
              borderRight: '1px solid',
              borderColor: 'divider',
              p: 3,
              overflow: 'auto'
            }}>
              <Typography level="h4" sx={{ mb: 2 }}>
                Summary
              </Typography>
              
              <Typography level="body-sm" color="neutral" sx={{ mb: 2 }}>
                Order #{order.order_number_display}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {orderItems.map((item) => (
                    <Box key={item.uuid} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {item.ProductName}
                        </Typography>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {formatCurrencyWithSymbol((item.unitprice || 0) * item.quantity - (item.discount || 0) * item.quantity)}
                        </Typography>
                      </Box>
                      <Typography level="body-xs" color="neutral">
                        Qty: {item.quantity} × {formatCurrencyWithSymbol(item.unitprice || 0)}
                        {(item.discount || 0) > 0 && (
                          <Box component="span" sx={{ color: 'warning.main', ml: 1 }}>
                            ({item.discount}% off)
                          </Box>
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Subtotal and delivery costs */}
              <Stack spacing={0.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm">
                    Shipping: Delivery to your door
                  </Typography>
                  <Typography level="body-sm">
                    {formatCurrencyWithSymbol(deliveryInfo.cost || 0)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm">Subtotal:</Typography>
                  <Typography level="body-sm">
                    {formatCurrencyWithSymbol(orderItems.reduce((sum, item) => sum + (item.unitprice || 0) * item.quantity, 0))}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm">VAT included:</Typography>
                  <Typography level="body-sm">
                    {formatCurrencyWithSymbol(orderItems.reduce((sum, item) => sum + (item.unitprice || 0) * item.quantity, 0) * 0.2)}
                  </Typography>
                </Box>
              </Stack>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="title-md" sx={{ fontWeight: 700 }}>Total:</Typography>
                <Typography level="title-md" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrencyWithSymbol(calculateFinalTotal())}
                </Typography>
              </Box>
            </Box>

            {/* Main Content - Form Area */}
            <Box sx={{ 
              flex: 1,
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden'
            }}>
              {/* Stepper */}
              <Box sx={{ 
                p: { xs: 1, md: 3 },
                pb: { xs: 1, md: 2 },
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexShrink: 0 // Prevent shrinking
              }}>
                <Stepper sx={{ mb: 0 }}>
                  {steps.map((step, index) => (
                    <Step
                      key={step.label}
                      indicator={
                        <StepIndicator
                          variant={activeStep === index ? 'solid' : activeStep > index ? 'solid' : 'outlined'}
                          color={activeStep > index ? 'success' : 'primary'}
                          sx={{
                            width: { xs: 8, md: 12 },
                            height: { xs: 8, md: 12 },
                            minWidth: { xs: 8, md: 12 },
                            fontSize: 0,
                            '--StepIndicator-size': { xs: '8px', md: '12px' }
                          }}
                        >
                        </StepIndicator>
                      }
                    >
                      <StepButton onClick={() => setActiveStep(index)}>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                          {step.label}
                        </Typography>
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Error Alert */}
              {error && (
                <Box sx={{ p: { xs: 1, md: 3 }, pt: 0, flexShrink: 0 }}>
                  <Alert color="danger">
                    {error}
                  </Alert>
                </Box>
              )}

              {/* Step Content */}
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                p: { xs: 1, md: 3 },
                pt: { xs: 2, md: 3 },
                minHeight: 0 // Allow content to shrink
              }}>
                {getStepContent(activeStep)}
              </Box>

              {/* Navigation Buttons - Always Visible */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: { xs: 'stretch', md: activeStep === 0 ? 'flex-end' : 'space-between' },
                p: { xs: 1, md: 3 },
                borderTop: '1px solid',
                borderColor: 'divider',
                gap: { xs: 1, md: 2 },
                backgroundColor: 'background.surface',
                flexShrink: 0, // Never shrink this section
                position: { xs: 'sticky', md: 'static' }, // Sticky on mobile
                bottom: 0,
                zIndex: 10000 // Higher than mobile menu (9999)
              }}>
                {/* Next Button - Always visible, full width on mobile */}
                <Button
                  variant="solid"
                  endDecorator={<ChevronRightRoundedIcon />}
                  onClick={handleNext}
                  loading={loading}
                  disabled={!isStepValid(activeStep) || loading}
                  size="lg"
                  sx={{ 
                    width: { xs: '100%', md: 'auto' },
                    minHeight: '48px', // Ensure minimum touch target
                    order: { xs: 1, md: 2 },
                    fontWeight: 600 // Make text more prominent
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Approve and pay' : 'Next'}
                </Button>

                {/* Back Button - Always visible when not on first step, full width on mobile */}
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    startDecorator={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                    size="lg"
                    sx={{ 
                      width: { xs: '100%', md: 'auto' },
                      minHeight: '48px', // Ensure minimum touch target
                      order: { xs: 2, md: 1 }
                    }}
                  >
                    Back
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
