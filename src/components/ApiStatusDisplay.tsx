import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import { API_CONFIG } from '../utils/apiConfig';
import { DEV_CONFIG } from '../utils/devConfig';

interface ApiStatusDisplayProps {
  compact?: boolean;
}

export default function ApiStatusDisplay({ compact = false }: ApiStatusDisplayProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh when DEV_CONFIG changes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 500); // Check every 500ms for changes
    
    return () => clearInterval(interval);
  }, []);
  
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  const isDevelopment = typeof window !== 'undefined' && (
    currentHostname === 'localhost' || 
    currentHostname === '127.0.0.1' ||
    currentHostname.includes('github.dev') ||
    currentHostname.includes('gitpod.io') ||
    currentHostname.includes('codespaces') ||
    currentHostname.includes('stackblitz') ||
    currentHostname.includes('codesandbox')
  );
  
  const currentApiUrl = API_CONFIG.baseUrl;
  const usingProductionApi = currentApiUrl.includes('vercel.app') || (!isDevelopment && !currentApiUrl);

  if (compact) {
    return (
      <Chip
        size="sm"
        color={usingProductionApi ? 'success' : 'primary'}
        variant="soft"
      >
        {usingProductionApi ? '🌐 Production API' : '🏠 Local API'}
      </Chip>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="body-xs">Hostname:</Typography>
        <Typography level="body-xs" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {currentHostname}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="body-xs">Base URL:</Typography>
        <Typography level="body-xs" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {currentApiUrl || 'relative'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="body-xs">Environment:</Typography>
        <Chip
          size="sm"
          color={isDevelopment ? 'warning' : 'success'}
          variant="soft"
        >
          {isDevelopment ? 'Development' : 'Production'}
        </Chip>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="body-xs">API Source:</Typography>
        <Chip
          size="sm"
          color={usingProductionApi ? 'success' : 'primary'}
          variant="soft"
        >
          {usingProductionApi ? 'Production APIs' : 'Local APIs'}
        </Chip>
      </Box>
      {isDevelopment && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 1 }}>
          💡 To use local APIs, set USE_PRODUCTION_API to false in devConfig.ts
        </Typography>
      )}
    </Box>
  );
}
