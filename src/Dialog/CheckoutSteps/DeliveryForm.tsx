import React from 'react';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import Box from '@mui/joy/Box';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SpeedIcon from '@mui/icons-material/Speed';
import { formatCurrency, formatCurrencyWithSymbol } from '../../utils/currencyUtils';

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

interface DeliveryFormProps {
  deliveryInfo: DeliveryInfo;
  onChange: (deliveryInfo: DeliveryInfo) => void;
  subtotal?: number; // Add subtotal prop for free shipping calculation
}

const deliveryOptions = [
  {
    value: 'standard',
    label: 'Standard Delivery',
    description: '5-7 business days',
    cost: 99, // Changed from 0 to 99 - free with qualifying orders
    icon: <LocalShippingIcon />
  },
  {
    value: 'express',
    label: 'Express Delivery',
    description: '2-3 business days',
    cost: 199,
    icon: <SpeedIcon />
  },
  {
    value: 'overnight',
    label: 'Overnight Delivery',
    description: 'Next business day',
    cost: 349,
    icon: <FlightTakeoffIcon />
  }
];

export default function DeliveryForm({ deliveryInfo, onChange, subtotal = 0 }: DeliveryFormProps) {
  const freeShippingThreshold = 1000;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  
  const getActualCost = (baseCost: number, method: string) => {
    if (method === 'standard' && qualifiesForFreeShipping) return 0;
    return baseCost;
  };

  const handleMethodChange = (method: DeliveryInfo['method']) => {
    const option = deliveryOptions.find(opt => opt.value === method);
    const actualCost = getActualCost(option?.cost || 0, method);
    
    onChange({
      ...deliveryInfo,
      method,
      cost: actualCost,
      estimatedDays: method === 'overnight' ? 1 : method === 'express' ? 3 : 6
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography level="h4" sx={{ mb: 2 }}>
          Delivery Method
        </Typography>
        
        {/* Free shipping tracker */}
        {(() => {
          const remaining = Math.max(0, freeShippingThreshold - subtotal);
          const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
          
          return subtotal < freeShippingThreshold ? (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'neutral.50', borderRadius: 'sm' }}>
              <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
                🚚 Spend {formatCurrencyWithSymbol(remaining)} more for free standard shipping
              </Typography>
              <Box sx={{ 
                position: 'relative',
                width: '100%', 
                height: 8, 
                backgroundColor: '#e5e5e5', 
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #d4d4d8'
              }}>
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${progress}%`, 
                  height: '100%', 
                  backgroundColor: '#22c55e',
                  borderRadius: 3,
                  transition: 'width 0.3s ease-in-out'
                }} />
              </Box>
              <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                {formatCurrencyWithSymbol(subtotal)} of {formatCurrencyWithSymbol(freeShippingThreshold)}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'success.50', borderRadius: 'sm' }}>
              <Typography level="body-sm" color="success" sx={{ fontWeight: 600 }}>
                🎉 You qualify for free standard shipping!
              </Typography>
            </Box>
          );
        })()}
        
        <RadioGroup
          value={deliveryInfo.method}
          onChange={(event) => handleMethodChange(event.target.value as DeliveryInfo['method'])}
        >
          <Stack spacing={2}>
            {deliveryOptions.map((option) => (
              <Card
                key={option.value}
                variant={deliveryInfo.method === option.value ? 'soft' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 'sm'
                  }
                }}
                onClick={() => handleMethodChange(option.value as DeliveryInfo['method'])}
              >
                <CardContent>
                  <Radio
                    value={option.value}
                    sx={{ display: 'none' }}
                  />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ color: 'primary.500' }}>
                      {option.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography level="title-md">
                        {option.label}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {option.description}
                      </Typography>
                    </Box>
                    <Box>
                      {(() => {
                        const actualCost = getActualCost(option.cost, option.value);
                        const originalCost = option.cost;
                        
                        if (actualCost === 0 && originalCost > 0) {
                          // Free due to qualifying order
                          return (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip variant="soft" color="success">
                                Free
                              </Chip>
                              <Typography level="body-xs" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                {formatCurrency(originalCost)}
                              </Typography>
                            </Stack>
                          );
                        } else if (actualCost > 0) {
                          return (
                            <Chip variant="soft" color="primary">
                              {formatCurrency(actualCost)}
                            </Chip>
                          );
                        } else {
                          return (
                            <Chip variant="soft" color="success">
                              Free
                            </Chip>
                          );
                        }
                      })()}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
