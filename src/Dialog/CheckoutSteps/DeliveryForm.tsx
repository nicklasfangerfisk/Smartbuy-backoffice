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
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SpeedIcon from '@mui/icons-material/Speed';
import { formatCurrency } from '../../utils/currencyUtils';

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

interface DeliveryFormProps {
  deliveryInfo: DeliveryInfo;
  onChange: (deliveryInfo: DeliveryInfo) => void;
}

const deliveryOptions = [
  {
    value: 'standard',
    label: 'Standard Delivery',
    description: '5-7 business days',
    cost: 0,
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
  },
  {
    value: 'pickup',
    label: 'Store Pickup',
    description: 'Ready in 2 hours',
    cost: 0,
    icon: <Inventory2Icon />
  }
];

export default function DeliveryForm({ deliveryInfo, onChange }: DeliveryFormProps) {
  const handleMethodChange = (method: DeliveryInfo['method']) => {
    const option = deliveryOptions.find(opt => opt.value === method);
    onChange({
      ...deliveryInfo,
      method,
      cost: option?.cost || 0,
      estimatedDays: method === 'overnight' ? 1 : method === 'express' ? 3 : method === 'pickup' ? 0 : 6
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography level="h4" sx={{ mb: 2 }}>
          Delivery Method
        </Typography>
        
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
                      {option.cost > 0 ? (
                        <Chip variant="soft" color="primary">
                          {formatCurrency(option.cost)}
                        </Chip>
                      ) : (
                        <Chip variant="soft" color="success">
                          Free
                        </Chip>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </RadioGroup>

        {deliveryInfo.method === 'pickup' && (
          <Card variant="soft" color="neutral" sx={{ mt: 2 }}>
            <CardContent>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Pickup Location
              </Typography>
              <Typography level="body-sm">
                Main Store<br />
                123 Business Street<br />
                Copenhagen, Denmark 2100<br />
                <strong>Hours:</strong> Mon-Fri 9:00-18:00, Sat 10:00-16:00
              </Typography>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
