/**
 * SubDialogOrderCheckoutPayment - Second step of checkout process
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
import MoneyIcon from '@mui/icons-material/Money';
import InfoIcon from '@mui/icons-material/Info';

// Custom MobilePay Icon Component
const MobilePayIcon = ({ sx }: { sx?: any }) => (
  <Box
    component="img"
    src="/mobilepay-icon.svg"
    alt="MobilePay"
    sx={{
      width: 24,
      height: 24,
      ...sx
    }}
  />
);

import type { PaymentInfo as BasePaymentInfo } from './ActionDialogOrderCheckout';

type PaymentMethod = 'card' | 'mobilepay' | 'viabill' | 'international';

interface PaymentInfo extends BasePaymentInfo {
  method: PaymentMethod;
}

interface SubDialogOrderCheckoutPaymentProps {
  paymentInfo: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
}

export default function SubDialogOrderCheckoutPayment({ paymentInfo, onChange }: SubDialogOrderCheckoutPaymentProps) {
  const handleMethodChange = (method: PaymentMethod) => {
    onChange({
      ...paymentInfo,
      method,
      // Reset fields when switching methods
      cardNumber: method === 'card' ? paymentInfo.cardNumber : '',
      cardHolder: method === 'card' ? paymentInfo.cardHolder : '',
      expiryDate: method === 'card' ? paymentInfo.expiryDate : '',
      cvv: method === 'card' ? paymentInfo.cvv : '',
      bankAccount: '',
      routingNumber: '',
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

      <Stack spacing={3} sx={{ width: '100%' }}>
        {/* Payment Method Selection */}
        <FormControl>
          <FormLabel>Select Payment Method</FormLabel>
          <RadioGroup 
            value={paymentInfo.method} 
            onChange={(event) => handleMethodChange(event.target.value as any)}
          >
            <Stack spacing={2}>
              {/* Cards */}
              <Card 
                variant={paymentInfo.method === 'card' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'card' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('card')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="card" />
                    <Box>
                      <Typography level="title-sm">Cards</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <CreditCardIcon sx={{ fontSize: 32 }} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* MobilePay */}
              <Card 
                variant={paymentInfo.method === 'mobilepay' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'mobilepay' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('mobilepay')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="mobilepay" />
                    <Box>
                      <Typography level="title-sm">MobilePay</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <MobilePayIcon sx={{ width: 32, height: 32 }} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Apple Pay / Google Pay (Viabill) */}
              <Card 
                variant={paymentInfo.method === 'viabill' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'viabill' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('viabill')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="viabill" />
                    <Box>
                      <Typography level="title-sm">Apple Pay / Google Pay</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                        {/* Placeholder SVGs for Apple Pay & Google Pay */}
                        <Box component="span" sx={{ fontWeight: 700, fontSize: 18, color: '#000', px: 1, borderRadius: 1, background: '#fff', border: '1px solid #eee' }}> Pay</Box>
                        <Box component="span" sx={{ fontWeight: 700, fontSize: 18, color: '#4285F4', px: 1, borderRadius: 1, background: '#fff', border: '1px solid #eee' }}>G Pay</Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* International Credit Cards */}
              <Card 
                variant={paymentInfo.method === 'international' ? 'solid' : 'outlined'}
                color={paymentInfo.method === 'international' ? 'primary' : 'neutral'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMethodChange('international')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value="international" />
                    <Box>
                      <Typography level="title-sm">International Credit Cards</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <CreditCardIcon sx={{ fontSize: 32 }} />
                      </Box>
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
      </Stack>
    </Box>
  );
}
