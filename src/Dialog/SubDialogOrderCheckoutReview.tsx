/**
 * SubDialogOrderCheckoutReview - Final step of checkout process
 * 
 * Displays order summary, customer information, and payment details for review
 */

import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import Chip from '@mui/joy/Chip';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';

import type { CustomerInfo, PaymentInfo, OrderItem } from './ActionDialogOrderCheckout';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';

interface SubDialogOrderCheckoutReviewProps {
  order: {
    uuid: string;
    order_number_display?: string;
    order_total?: number;
    discount?: number;
  } | null;
  orderItems: OrderItem[];
  customerInfo: CustomerInfo;
  paymentInfo: PaymentInfo;
}

export default function SubDialogOrderCheckoutReview({ order, orderItems, customerInfo, paymentInfo }: SubDialogOrderCheckoutReviewProps) {
  if (!order) return null;

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = (item.unitprice || 0) * item.quantity;
      const itemDiscount = (item.discount || 0) * item.quantity;
      return sum + itemTotal - itemDiscount;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const orderDiscount = order.discount || 0;
  const total = subtotal - orderDiscount;

  const getPaymentMethodDisplay = () => {
    switch (paymentInfo.method) {
      case 'card':
        return {
          title: 'Credit Card',
          details: [
            { label: 'Card Number', value: `****${paymentInfo.cardNumber?.slice(-4) || ''}` },
            { label: 'Cardholder', value: paymentInfo.cardHolder || '' },
            { label: 'Expires', value: paymentInfo.expiryDate || '' },
          ]
        };
      case 'mobilepay':
        return {
          title: 'MobilePay',
          details: [
            { label: 'Method', value: 'MobilePay' },
          ]
        };
      case 'viabill':
        return {
          title: 'ViaBill',
          details: [
            { label: 'Method', value: 'ViaBill Financing' },
          ]
        };
      case 'international':
        return {
          title: 'International Payment',
          details: [
            { label: 'Method', value: 'International Transfer' },
          ]
        };
      default:
        return { title: 'Unknown', details: [] };
    }
  };

  const paymentMethod = getPaymentMethodDisplay();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography level="h4" sx={{ mb: 3 }}>
        Review Your Order
      </Typography>
      
      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
        {/* Order Items */}
        <Grid xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Order Items
              </Typography>
              
              <List>
                {orderItems.map((item, index) => (
                  <React.Fragment key={item.uuid}>
                    <ListItem>
                      <ListItemContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Box>
                            <Typography level="title-sm">{item.ProductName}</Typography>
                            <Typography level="body-xs" color="neutral">
                              Quantity: {item.quantity} × {formatCurrencyWithSymbol(item.unitprice || 0)}
                            </Typography>
                            {(item.discount || 0) > 0 && (
                              <Typography level="body-xs" color="danger">
                                Item discount: -{formatCurrencyWithSymbol((item.discount || 0) * item.quantity)}
                              </Typography>
                            )}
                          </Box>
                          <Typography level="title-sm">
                            {formatCurrencyWithSymbol((item.unitprice || 0) * item.quantity - (item.discount || 0) * item.quantity)}
                          </Typography>
                        </Box>
                      </ListItemContent>
                    </ListItem>
                    {index < orderItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm">Subtotal</Typography>
                  <Typography level="body-sm">{formatCurrencyWithSymbol(subtotal)}</Typography>
                </Box>
                
                {orderDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography level="body-sm">Order Discount</Typography>
                    <Typography level="body-sm" color="danger">
                      -{formatCurrencyWithSymbol(orderDiscount)}
                    </Typography>
                  </Box>
                )}
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="title-md" fontWeight="bold">Total</Typography>
                  <Typography level="title-md" fontWeight="bold">
                    {formatCurrencyWithSymbol(total)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Information */}
        <Grid xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Shipping Address
              </Typography>
              
              <Stack spacing={1}>
                <Typography level="body-sm" fontWeight="bold">{customerInfo.name}</Typography>
                {customerInfo.address && (
                  <Typography level="body-sm">{customerInfo.address}</Typography>
                )}
                {(customerInfo.city || customerInfo.postalCode) && (
                  <Typography level="body-sm">
                    {customerInfo.city && customerInfo.postalCode 
                      ? `${customerInfo.city}, ${customerInfo.postalCode}`
                      : customerInfo.city || customerInfo.postalCode
                    }
                  </Typography>
                )}
                {customerInfo.country && (
                  <Typography level="body-sm">{customerInfo.country}</Typography>
                )}
                <Typography level="body-sm">{customerInfo.email}</Typography>
                {customerInfo.phone && (
                  <Typography level="body-sm">{customerInfo.phone}</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Payment Method
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography level="title-sm">{paymentMethod.title}</Typography>
                  <Chip size="sm" color="primary" variant="soft">
                    {paymentInfo.method.toUpperCase()}
                  </Chip>
                </Box>
                
                {paymentMethod.details.map((detail, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography level="body-sm" color="neutral">{detail.label}:</Typography>
                    <Typography level="body-sm">{detail.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
