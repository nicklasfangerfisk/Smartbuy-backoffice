/**
 * PaymentForm - Second step of checkout process
 * 
 * Collects payment method information (mocked for demo purposes)
 * Supports credit card, bank transfer, and cash payment methods
 */

import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';

// Icons
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyIcon from '@mui/icons-material/Money';
import InfoIcon from '@mui/icons-material/Info';

import type { PaymentInfo } from '../CheckoutDialog';

interface PaymentFormProps {
  paymentInfo: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
}

export default function PaymentForm({ paymentInfo, onChange }: PaymentFormProps) {
  const handleMethodChange = (method: 'card' | 'bank' | 'cash') => {
    onChange({
      ...paymentInfo,
      method,
      // Reset fields when switching methods
      cardNumber: method === 'card' ? paymentInfo.cardNumber : '',
      cardHolder: method === 'card' ? paymentInfo.cardHolder : '',
      expiryDate: method === 'card' ? paymentInfo.expiryDate : '',
      cvv: method === 'card' ? paymentInfo.cvv : '',
      bankAccount: method === 'bank' ? paymentInfo.bankAccount : '',
      routingNumber: method === 'bank' ? paymentInfo.routingNumber : '',
    });
  };

  const handleChange = (field: keyof PaymentInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.substring(0, 19); // Max 16 digits + 3 spaces
    }
    
    // Format expiry date as MM/YY
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      if (value.length > 5) value = value.substring(0, 5);
    }
    
    // Limit CVV to 3 digits
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    }

    onChange({
      ...paymentInfo,
      [field]: value,
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography level="h4" sx={{ mb: 3 }}>
        Payment Method
      </Typography>

      <Alert color="warning" startDecorator={<InfoIcon />} sx={{ mb: 3, width: '100%' }}>
        This is a demo checkout. No real payments will be processed.
      </Alert>
      
      <Stack spacing={3} sx={{ width: '100%' }}>
        {/* Payment Method Selection */}
        <FormControl>
          <FormLabel>Select Payment Method</FormLabel>
          <RadioGroup 
            value={paymentInfo.method} 
            onChange={(event) => handleMethodChange(event.target.value as any)}
          >
            <Stack spacing={2}>
              <Card 
                variant={paymentInfo.method === 'card' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'card' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('card')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="card" />
                    <CreditCardIcon />
                    <Box>
                      <Typography level="title-sm">Credit/Debit Card</Typography>
                      <Typography level="body-xs" color="neutral">
                        Pay securely with your card
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card 
                variant={paymentInfo.method === 'bank' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'bank' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('bank')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="bank" />
                    <AccountBalanceIcon />
                    <Box>
                      <Typography level="title-sm">Bank Transfer</Typography>
                      <Typography level="body-xs" color="neutral">
                        Direct bank transfer
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card 
                variant={paymentInfo.method === 'cash' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'cash' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('cash')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="cash" />
                    <MoneyIcon />
                    <Box>
                      <Typography level="title-sm">Cash Payment</Typography>
                      <Typography level="body-xs" color="neutral">
                        Pay with cash on delivery
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </RadioGroup>
        </FormControl>

        {/* Credit Card Form */}
        {paymentInfo.method === 'card' && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Card Information
              </Typography>
              
              <Stack spacing={2}>
                <FormControl required>
                  <FormLabel>Card Number</FormLabel>
                  <Input
                    value={paymentInfo.cardNumber || ''}
                    onChange={handleChange('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    startDecorator={<CreditCardIcon />}
                  />
                </FormControl>

                <FormControl required>
                  <FormLabel>Cardholder Name</FormLabel>
                  <Input
                    value={paymentInfo.cardHolder || ''}
                    onChange={handleChange('cardHolder')}
                    placeholder="John Doe"
                  />
                </FormControl>

                <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
                  <Grid xs={8}>
                    <FormControl required>
                      <FormLabel>Expiry Date</FormLabel>
                      <Input
                        value={paymentInfo.expiryDate || ''}
                        onChange={handleChange('expiryDate')}
                        placeholder="MM/YY"
                      />
                    </FormControl>
                  </Grid>
                  
                  <Grid xs={4}>
                    <FormControl required>
                      <FormLabel>CVV</FormLabel>
                      <Input
                        value={paymentInfo.cvv || ''}
                        onChange={handleChange('cvv')}
                        placeholder="123"
                        type="password"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Bank Transfer Form */}
        {paymentInfo.method === 'bank' && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Bank Information
              </Typography>
              
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>Account Number</FormLabel>
                  <Input
                    value={paymentInfo.bankAccount || ''}
                    onChange={handleChange('bankAccount')}
                    placeholder="123456789"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Routing Number</FormLabel>
                  <Input
                    value={paymentInfo.routingNumber || ''}
                    onChange={handleChange('routingNumber')}
                    placeholder="987654321"
                  />
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Cash Payment Info */}
        {paymentInfo.method === 'cash' && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Cash Payment
              </Typography>
              
              <Typography level="body-sm" color="neutral">
                Payment will be collected upon delivery. Please have the exact amount ready.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
