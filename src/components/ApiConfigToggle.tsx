import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Switch from '@mui/joy/Switch';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import { DEV_CONFIG, getApiBaseUrl } from '../utils/devConfig';

const ApiConfigToggle = () => {
  const [useProductionApi, setUseProductionApi] = useState(DEV_CONFIG.USE_PRODUCTION_API);
  const [localPort, setLocalPort] = useState(DEV_CONFIG.LOCAL_API_PORT.toString());
  const [currentApiUrl, setCurrentApiUrl] = useState('');

  useEffect(() => {
    // Update the current API URL when toggle or port changes
    setCurrentApiUrl(getApiBaseUrl());
  }, [useProductionApi, localPort]);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseProductionApi(newValue);
    
    // Update the DEV_CONFIG in real-time
    DEV_CONFIG.USE_PRODUCTION_API = newValue;
    
    // Update current API URL display
    setCurrentApiUrl(getApiBaseUrl());
    
    if (DEV_CONFIG.LOG_API_REQUESTS) {
      console.log(`API environment switched to: ${newValue ? 'Production' : 'Local'}`);
    }
  };

  const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPort = event.target.value;
    setLocalPort(newPort);
    
    // Update the DEV_CONFIG in real-time (only if it's a valid number)
    const portNumber = parseInt(newPort, 10);
    if (!isNaN(portNumber) && portNumber > 0 && portNumber <= 65535) {
      DEV_CONFIG.LOCAL_API_PORT = portNumber;
      
      // Update current API URL display if using local API
      if (!useProductionApi) {
        setCurrentApiUrl(getApiBaseUrl());
      }
      
      if (DEV_CONFIG.LOG_API_REQUESTS) {
        console.log(`Local API port changed to: ${portNumber}`);
      }
    }
  };

  const isLocal = !useProductionApi;
  const apiStatus = useProductionApi ? 'Production' : 'Local';
  const apiColor = useProductionApi ? 'danger' : 'success';

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography level="body-sm">Local API</Typography>
          <Switch
            checked={useProductionApi}
            onChange={handleToggle}
            color={useProductionApi ? 'danger' : 'success'}
            variant={useProductionApi ? 'solid' : 'outlined'}
          />
          <Typography level="body-sm">Production API</Typography>
        </Stack>
        <Chip 
          color={apiColor} 
          variant="soft"
          size="sm"
        >
          {apiStatus}
        </Chip>
      </Stack>
      
      <Box>
        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          Current API: {currentApiUrl}
        </Typography>
      </Box>
      
      {isLocal && (
        <Box>
          <FormControl size="sm">
            <FormLabel>Local API Port</FormLabel>
            <Input
              value={localPort}
              onChange={handlePortChange}
              placeholder="3000"
              type="number"
              slotProps={{
                input: {
                  min: 1,
                  max: 65535,
                },
              }}
              sx={{ maxWidth: '120px' }}
            />
          </FormControl>
          <Typography level="body-xs" sx={{ color: 'warning.400', mt: 1 }}>
            ⚠️ Make sure your local server is running on port {localPort}
          </Typography>
        </Box>
      )}
      
      {useProductionApi && (
        <Typography level="body-xs" sx={{ color: 'danger.400' }}>
          🌐 Using production API - emails will be sent to real recipients
        </Typography>
      )}
    </Stack>
  );
};

export default ApiConfigToggle;
