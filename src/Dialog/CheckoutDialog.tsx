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
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

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
  method: 'card' | 'bank' | 'cash';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  bankAccount?: string;
  routingNumber?: string;
}

export interface DeliveryInfo {
  method: 'standard' | 'express' | 'overnight' | 'pickup';
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
  { label: 'Information' },
  { label: 'Delivery' },
  { label: 'Payment' }
];

export default function CheckoutDialog({ open, onClose, order, onSuccess }: CheckoutDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        return customerInfo.email.trim() !== '' && 
               customerInfo.phone?.trim() !== '' &&
               customerInfo.firstName?.trim() !== '' &&
               customerInfo.lastName?.trim() !== '' &&
               customerInfo.address?.trim() !== '' &&
               customerInfo.city?.trim() !== '' &&
               customerInfo.postalCode?.trim() !== '';
      case 1:
        return true; // Delivery method is always valid as it has a default value
      case 2:
        if (paymentInfo.method === 'card') {
          return paymentInfo.cardNumber?.length === 16 && 
                 paymentInfo.cardHolder?.trim() !== '' &&
                 paymentInfo.expiryDate?.length === 5 &&
                 paymentInfo.cvv?.length === 3;
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

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ 
        display: 'flex', 
        justifyContent: isFullscreen ? 'flex-end' : 'center', 
        alignItems: 'center',
        pr: isFullscreen ? '20px' : 0, // Add right padding in fullscreen to account for content area
        pl: isFullscreen ? '220px' : 0, // Add left padding to account for sidebar
      }}
    >
      <ModalDialog
        size="lg"
        sx={{
          width: isFullscreen ? 'calc(100vw - 240px)' : '90vw', // Account for sidebar and padding
          maxWidth: isFullscreen ? 'none' : 1000,
          height: isFullscreen ? 'calc(100vh - 60px)' : '90vh', // Account for top/bottom padding
          maxHeight: isFullscreen ? 'none' : 750,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          m: 0,
          borderRadius: isFullscreen ? '8px' : undefined,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Button
            variant="plain"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            startDecorator={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            sx={{ 
              color: 'neutral.500',
              '&:hover': {
                color: 'neutral.700',
                backgroundColor: 'neutral.50'
              }
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          <ModalClose />
        </Box>
        
        {orderCompleted ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: 2 
          }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
            <Typography level="h2">Order Completed!</Typography>
            <Typography level="body-lg" textAlign="center" color="neutral">
              Thank you for your order! Order #{order.order_number_display} has been processed successfully.
            </Typography>
          </Box>
        ) : (
          <Grid container sx={{ height: '100%' }}>
            {/* Order Summary Sidebar */}
            <Grid xs={12} md={4} sx={{ 
              borderRight: { md: '1px solid' }, 
              borderColor: { md: 'divider' },
              p: 3
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
                    {deliveryInfo.method === 'pickup' ? 'Shipping: Store pickup' : 'Shipping: Delivery to your door'}
                  </Typography>
                  <Typography level="body-sm">
                    {(() => {
                      const orderTotal = calculateTotal();
                      if (deliveryInfo.method === 'pickup') return 'Free';
                      if (orderTotal >= 1000) return 'Free';
                      return formatCurrencyWithSymbol(deliveryInfo.cost || 99);
                    })()}
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
              
              {/* Free shipping tracker */}
              {(() => {
                const currentTotal = calculateTotal();
                const freeShippingThreshold = 1000;
                const remaining = Math.max(0, freeShippingThreshold - currentTotal);
                const progress = Math.min(100, (currentTotal / freeShippingThreshold) * 100);
                
                return currentTotal < freeShippingThreshold ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                      Spend {formatCurrencyWithSymbol(remaining)} more for free shipping
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      height: 4, 
                      backgroundColor: 'neutral.200', 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        backgroundColor: 'success.main',
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>
                ) : (
                  <Typography level="body-xs" color="success" sx={{ mb: 2 }}>
                    🎉 You qualify for free shipping!
                  </Typography>
                );
              })()}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography level="title-md" sx={{ fontWeight: 700 }}>Total:</Typography>
                <Typography level="title-md" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {(() => {
                    const orderTotal = calculateTotal();
                    const shippingCost = deliveryInfo.method === 'pickup' ? 0 : (deliveryInfo.cost || 99);
                    const finalTotal = orderTotal >= 1000 ? orderTotal : orderTotal + shippingCost;
                    return formatCurrencyWithSymbol(finalTotal);
                  })()}
                </Typography>
              </Box>
            </Grid>

            {/* Main Content */}
            <Grid xs={12} md={8} sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              p: 3,
              pr: 4,
              minHeight: 0, // Allow flex child to shrink
              overflow: 'hidden'
            }}>
              {/* Stepper */}
              <Stepper sx={{ mb: 2 }}>
                {steps.map((step, index) => (
                  <Step
                    key={step.label}
                    indicator={
                      <StepIndicator
                        variant={activeStep === index ? 'solid' : activeStep > index ? 'solid' : 'outlined'}
                        color={activeStep > index ? 'success' : 'primary'}
                        sx={{
                          width: 12,
                          height: 12,
                          minWidth: 12,
                          fontSize: 0,
                          '--StepIndicator-size': '12px'
                        }}
                      >
                      </StepIndicator>
                    }
                  >
                    <StepButton onClick={() => setActiveStep(index)}>
                      {step.label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>

              {/* Error Alert */}
              {error && (
                <Alert color="danger" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Step Content */}
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                mb: 2, 
                width: '100%',
                minHeight: 0, // Allow content to shrink
                pr: 1, // Add padding for scrollbar
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0,0,0,0.3)',
                }
              }}>
                {getStepContent(activeStep)}
              </Box>

              {/* Navigation Buttons - Always Visible */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: activeStep === 0 ? 'flex-end' : 'space-between',
                pt: 2,
                mt: 'auto', // Push to bottom
                borderTop: '1px solid',
                borderColor: 'divider',
                flexShrink: 0 // Don't shrink this section
              }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    startDecorator={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  variant="solid"
                  endDecorator={<ChevronRightRoundedIcon />}
                  onClick={handleNext}
                  loading={loading}
                  disabled={!isStepValid(activeStep)}
                >
                  {activeStep === steps.length - 1 ? 'Complete Order' : 'Next'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </ModalDialog>
    </Modal>
  );
}
