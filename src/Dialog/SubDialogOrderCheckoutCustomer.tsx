/**
 * SubDialogOrderCheckoutCustomer - First step of checkout process
 * 
 * Collects customer information including name, email, phone, and address
 */

import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import Checkbox from '@mui/joy/Checkbox';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

// Icons
import LoginIcon from '@mui/icons-material/Login';

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

interface SubDialogOrderCheckoutCustomerProps {
  customerInfo: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
  onLogin?: () => void; // Optional login handler for microfrontend use
}

export default function SubDialogOrderCheckoutCustomer({ customerInfo, onChange, onLogin }: SubDialogOrderCheckoutCustomerProps) {
  const handleChange = (field: keyof CustomerInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...customerInfo,
      [field]: event.target.value,
    });
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Placeholder for future microfrontend integration
      console.log('Login functionality not available in this app');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={3} sx={{ width: '100%' }}>
        {/* Login Option */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography level="body-sm" color="neutral" sx={{ mb: 2 }}>
            Already have an account? Sign in to auto-fill your information
          </Typography>
          <Button
            variant="outlined"
            startDecorator={<LoginIcon />}
            onClick={handleLogin}
            disabled={!onLogin} // Disabled when no login handler provided
            sx={{ minWidth: 150 }}
          >
            Login
          </Button>
        </Box>

        <Divider sx={{ my: 1 }}>
          <Typography level="body-xs" color="neutral">
            or continue as guest
          </Typography>
        </Divider>

        {/* Contact Information Section */}
        <Box>
          <Typography level="h4" sx={{ mb: 3 }}>
            Contact
          </Typography>
          
          <Stack spacing={2}>
            <FormControl required>
              <FormLabel>Email *</FormLabel>
              <Input
                type="email"
                value={customerInfo.email}
                onChange={handleChange('email')}
                placeholder="Enter email"
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone Number *</FormLabel>
              <Input
                value={customerInfo.phone || ''}
                onChange={handleChange('phone')}
                placeholder="Enter phone number"
                variant="outlined"
              />
            </FormControl>

            <Checkbox
              checked={customerInfo.newsletter || false}
              onChange={(event) => onChange({
                ...customerInfo,
                newsletter: event.target.checked,
              })}
              label="I would like to receive newsletters"
              sx={{ mt: 1 }}
            />
          </Stack>
        </Box>

        {/* Delivery Address Section */}
        <Box>
          <Typography level="h4" sx={{ mb: 3 }}>
            Address
          </Typography>
          
          <Stack spacing={2}>
            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
              <Grid xs={12} md={6}>
                <FormControl required>
                  <FormLabel>First Name *</FormLabel>
                  <Input
                    value={customerInfo.firstName || ''}
                    onChange={handleChange('firstName')}
                    placeholder="Enter first name"
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} md={6}>
                <FormControl required>
                  <FormLabel>Last Name *</FormLabel>
                  <Input
                    value={customerInfo.lastName || ''}
                    onChange={handleChange('lastName')}
                    placeholder="Enter last name"
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
              <Grid xs={12}>
                <FormControl required>
                  <FormLabel>Address*</FormLabel>
                  <Input
                    value={customerInfo.address || ''}
                    onChange={handleChange('address')}
                    placeholder="Enter address and house number"
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
              <Grid xs={12} md={4}>
                <FormControl required>
                  <FormLabel>Postal Code *</FormLabel>
                  <Input
                    value={customerInfo.postalCode || ''}
                    onChange={handleChange('postalCode')}
                    placeholder="Enter postal code"
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
              
              <Grid xs={12} md={8}>
                <FormControl required>
                  <FormLabel>City *</FormLabel>
                  <Input
                    value={customerInfo.city || ''}
                    onChange={handleChange('city')}
                    placeholder="Enter city"
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
            </Grid>

            <FormControl>
              <FormLabel>Reference</FormLabel>
              <Input
                value={customerInfo.reference || ''}
                onChange={handleChange('reference')}
                placeholder="Reference/employee number"
                variant="outlined"
              />
            </FormControl>

            <Stack spacing={1} sx={{ mt: 2 }}>
              <Checkbox
                label="Log me in so I can easily shop again"
                sx={{ fontSize: 'sm' }}
              />
              <Checkbox
                label="The addess is not my home address"
                sx={{ fontSize: 'sm' }}
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
