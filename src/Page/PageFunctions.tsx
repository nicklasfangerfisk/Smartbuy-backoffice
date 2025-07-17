import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Divider
} from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

interface ApiEndpoint {
  name: string;
  endpoint: string;
  method: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: any;
  }>;
  category: string;
}

const API_TEST_DEFINITIONS: ApiEndpoint[] = [
  {
    name: 'Health Check',
    endpoint: '/api/health',
    method: 'GET',
    description: 'Check API health and status',
    parameters: [],
    category: 'System'
  },
  {
    name: 'Send Order Confirmation',
    endpoint: '/api/send-order-confirmation',
    method: 'POST',
    description: 'Send order confirmation email',
    parameters: [
      {
        name: 'testEmail',
        type: 'string',
        required: false,
        description: 'Email address for test email',
        defaultValue: 'test@example.com'
      },
      {
        name: 'orderUuid',
        type: 'string',
        required: false,
        description: 'UUID of existing order'
      },
      {
        name: 'storefrontId',
        type: 'string',
        required: false,
        description: 'Storefront identifier'
      }
    ],
    category: 'Email'
  },
  {
    name: 'Send SMS Campaign',
    endpoint: '/api/send-sms-campaign',
    method: 'POST',
    description: 'Send SMS campaign',
    parameters: [
      {
        name: 'campaignId',
        type: 'string',
        required: true,
        description: 'Campaign identifier'
      },
      {
        name: 'message',
        type: 'string',
        required: true,
        description: 'SMS message content'
      }
    ],
    category: 'SMS'
  }
];

export default function PageFunctions() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [parameters, setParameters] = useState<Record<string, Record<string, any>>>({});

  const executeTest = async (apiDef: ApiEndpoint) => {
    const testKey = apiDef.name;
    setLoading(prev => ({ ...prev, [testKey]: true }));
    
    const startTime = Date.now();
    
    try {
      let result;
      const params = parameters[testKey] || {};
      
      // Convert parameters to proper format
      const body = apiDef.parameters.reduce((acc, param) => {
        const value = params[param.name] ?? param.defaultValue;
        if (value !== undefined && value !== '') {
          acc[param.name] = value;
        }
        return acc;
      }, {} as any);

      // Execute the API call
      if (apiDef.endpoint === '/api/health') {
        result = await apiClient.healthCheck();
      } else if (apiDef.endpoint === '/api/send-order-confirmation') {
        result = await apiClient.sendOrderConfirmation(
          body.orderUuid,
          body.testEmail,
          body.storefrontId
        );
      } else if (apiDef.endpoint === '/api/send-sms-campaign') {
        result = await apiClient.sendSMSCampaign(body);
      } else {
        result = await apiClient.request(apiDef.endpoint, {
          method: apiDef.method as any,
          body: Object.keys(body).length > 0 ? body : undefined
        });
      }

      const duration = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          ...result,
          duration,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          success: false,
          error: (error as Error).message,
          statusCode: 0,
          duration,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testKey]: false }));
    }
  };

  const updateParameter = (apiName: string, paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [apiName]: {
        ...prev[apiName],
        [paramName]: value
      }
    }));
  };

  const groupedApis = API_TEST_DEFINITIONS.reduce((acc, api) => {
    if (!acc[api.category]) acc[api.category] = [];
    acc[api.category].push(api);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        API Functions Test Console
      </Typography>
      
      <Alert color="primary" sx={{ mb: 3 }}>
        <Typography>
          This console allows you to test all API endpoints. Use this for development, 
          debugging, and validation of API functionality across environments.
        </Typography>
      </Alert>

      {Object.entries(groupedApis).map(([category, apis]) => (
        <Card key={category} sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="h3" sx={{ mb: 2 }}>
              {category} APIs
            </Typography>
            
            {apis.map((apiDef) => {
              const testKey = apiDef.name;
              const result = testResults[testKey];
              const isLoading = loading[testKey];
              
              return (
                <Accordion key={apiDef.name} sx={{ mb: 2 }}>
                  <AccordionSummary
                    indicator={<ExpandMoreIcon />}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip color={apiDef.method === 'GET' ? 'primary' : 'warning'}>
                        {apiDef.method}
                      </Chip>
                      <Typography level="title-md">{apiDef.name}</Typography>
                      <Typography level="body-sm" sx={{ ml: 'auto' }}>
                        {apiDef.endpoint}
                      </Typography>
                      {result && (
                        <Chip 
                          color={result.success ? 'success' : 'danger'}
                          startDecorator={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
                        >
                          {result.success ? 'Success' : 'Failed'}
                        </Chip>
                      )}
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                      {apiDef.description}
                    </Typography>
                    
                    {apiDef.parameters.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography level="title-sm" sx={{ mb: 1 }}>Parameters:</Typography>
                        <Grid container spacing={2}>
                          {apiDef.parameters.map((param) => (
                            <Grid xs={12} md={6} key={param.name}>
                              <Box>
                                <Typography level="body-sm" sx={{ mb: 1 }}>
                                  {param.name} {param.required && <span style={{ color: 'red' }}>*</span>}
                                </Typography>
                                <input
                                  type="text"
                                  placeholder={param.description}
                                  value={parameters[testKey]?.[param.name] ?? param.defaultValue ?? ''}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParameter(testKey, param.name, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                  }}
                                />
                                <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                  {`${param.type}${param.required ? ' (required)' : ' (optional)'}`}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    <Button
                      startDecorator={isLoading ? <CircularProgress size="sm" /> : <PlayArrowIcon />}
                      onClick={() => executeTest(apiDef)}
                      disabled={isLoading}
                      color="primary"
                      sx={{ mb: 2 }}
                    >
                      {isLoading ? 'Testing...' : 'Test API'}
                    </Button>
                    
                    {result && (
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography level="title-sm">Test Result</Typography>
                            <Typography level="body-xs">
                              {result.duration}ms | {new Date(result.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Chip color={result.success ? 'success' : 'danger'}>
                              Status: {result.statusCode}
                            </Chip>
                            <Chip color={result.success ? 'success' : 'danger'}>
                              {result.success ? 'Success' : 'Failed'}
                            </Chip>
                          </Box>
                          
                          {result.error && (
                            <Alert color="danger" sx={{ mb: 2 }}>
                              <Typography level="body-sm">{result.error}</Typography>
                            </Alert>
                          )}
                          
                          {result.data && (
                            <Box>
                              <Typography level="title-sm" sx={{ mb: 1 }}>Response Data:</Typography>
                              <Box 
                                component="pre" 
                                sx={{ 
                                  background: 'var(--joy-palette-neutral-50)',
                                  p: 2,
                                  borderRadius: 'sm',
                                  overflow: 'auto',
                                  fontSize: 'sm'
                                }}
                              >
                                {JSON.stringify(result.data, null, 2)}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
