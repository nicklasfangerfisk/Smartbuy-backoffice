import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Divider from '@mui/joy/Divider';
import Alert from '@mui/joy/Alert';
import Chip from '@mui/joy/Chip';
import Grid from '@mui/joy/Grid';
import CircularProgress from '@mui/joy/CircularProgress';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import AspectRatio from '@mui/joy/AspectRatio';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChatIcon from '@mui/icons-material/Chat';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';

// Utils
import { supabase } from '../utils/supabaseClient';

interface StorefrontItem {
  id: string;
  name: string;
  url?: string;
  logo_url?: string;
  is_online: boolean;
}

interface EmailTestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

interface ModuleTile {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon' | 'configured';
  category: 'communication' | 'payments' | 'analytics' | 'security' | 'integration';
  onClick?: () => void;
}

export default function PageModules() {
  const [storefronts, setStorefronts] = useState<StorefrontItem[]>([]);
  const [selectedStorefront, setSelectedStorefront] = useState<string>('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);
  const [sendGridConfigured, setSendGridConfigured] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Module definitions
  const modules: ModuleTile[] = [
    {
      id: 'email-config',
      name: 'Email Configuration',
      description: 'Configure order confirmation emails and SendGrid integration',
      icon: <EmailIcon />,
      status: 'available',
      category: 'communication',
      onClick: () => setEmailDialogOpen(true)
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      description: 'Stripe, PayPal, and other payment processor integrations',
      icon: <PaymentIcon />,
      status: 'coming-soon',
      category: 'payments'
    },
    {
      id: 'shopping-cart',
      name: 'Shopping Cart Widget',
      description: 'Customizable cart component for storefronts',
      icon: <ShoppingCartIcon />,
      status: 'coming-soon',
      category: 'integration'
    },
    {
      id: 'live-chat',
      name: 'Live Chat Support',
      description: 'Real-time customer support chat widget',
      icon: <ChatIcon />,
      status: 'coming-soon',
      category: 'communication'
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Google Analytics and custom tracking integration',
      icon: <AnalyticsIcon />,
      status: 'coming-soon',
      category: 'analytics'
    },
    {
      id: 'security',
      name: 'Security Module',
      description: 'SSL certificates, security headers, and fraud protection',
      icon: <SecurityIcon />,
      status: 'coming-soon',
      category: 'security'
    },
    {
      id: 'notifications',
      name: 'Push Notifications',
      description: 'Browser push notifications for order updates',
      icon: <NotificationsIcon />,
      status: 'coming-soon',
      category: 'communication'
    },
    {
      id: 'api-integrations',
      name: 'API Integrations',
      description: 'Connect with external services and webhooks',
      icon: <IntegrationInstructionsIcon />,
      status: 'coming-soon',
      category: 'integration'
    }
  ];

  // Load storefronts on component mount
  useEffect(() => {
    fetchStorefronts();
    checkSendGridConfig();
  }, []);

  const fetchStorefronts = async () => {
    try {
      const { data, error } = await supabase
        .from('storefronts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStorefronts(data || []);
      
      // Auto-select first storefront if available
      if (data && data.length > 0) {
        setSelectedStorefront(data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching storefronts:', err);
    }
  };

  const checkSendGridConfig = async () => {
    try {
      const response = await fetch('/api/check-sendgrid-config');
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setSendGridConfigured(data.configured);
        } else {
          setSendGridConfigured(true);
        }
      } else {
        setSendGridConfigured(true);
      }
    } catch (error) {
      console.error('Error checking SendGrid config:', error);
      setSendGridConfigured(true);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter a test email address',
        timestamp: new Date()
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          storefrontId: selectedStorefront || null
        }),
      });

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        if (responseText.includes('Authentication Required') || responseText.includes('Vercel Authentication')) {
          setTestResult({
            success: false,
            message: 'API endpoints require authentication. Please disable Vercel protection for API routes or authenticate.',
            timestamp: new Date()
          });
        } else {
          setTestResult({
            success: false,
            message: 'API endpoints not available in development. Deploy to Vercel to test email functionality.',
            timestamp: new Date()
          });
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      setTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Test email sent successfully!' : 'Failed to send test email'),
        timestamp: new Date()
      });
    } catch (error: any) {
      if (error.message.includes('Unexpected token')) {
        setTestResult({
          success: false,
          message: 'API endpoints require authentication or are not available. Please check Vercel project settings.',
          timestamp: new Date()
        });
      } else {
        setTestResult({
          success: false,
          message: error.message || 'Error sending test email',
          timestamp: new Date()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'configured': return 'primary';
      case 'coming-soon': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'configured': return 'Configured';
      case 'coming-soon': return 'Coming Soon';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'communication': return '#2196F3';
      case 'payments': return '#4CAF50';
      case 'analytics': return '#FF9800';
      case 'security': return '#F44336';
      case 'integration': return '#9C27B0';
      default: return '#757575';
    }
  };

  const selectedStorefrontData = storefronts.find(s => s.id === selectedStorefront);

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Typography level="h2" sx={{ mb: 1 }}>
        Storefront Modules
      </Typography>
      <Typography level="body-lg" sx={{ mb: 4, color: 'text.secondary' }}>
        Enhance your storefronts with powerful modules and integrations
      </Typography>

      {/* Module Grid */}
      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid xs={12} sm={6} md={4} lg={3} key={module.id}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                cursor: module.status === 'available' ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': module.status === 'available' ? {
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                  borderColor: getCategoryColor(module.category)
                } : {},
                opacity: module.status === 'coming-soon' ? 0.7 : 1
              }}
              onClick={module.onClick}
            >
              <AspectRatio ratio="1" sx={{ bgcolor: 'background.level1' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    height: '100%'
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '3rem',
                      color: getCategoryColor(module.category),
                      mb: 2
                    }}
                  >
                    {module.icon}
                  </Box>
                  
                  <Typography level="title-md" textAlign="center" sx={{ mb: 1 }}>
                    {module.name}
                  </Typography>
                  
                  <Typography level="body-sm" textAlign="center" sx={{ color: 'text.secondary', mb: 2 }}>
                    {module.description}
                  </Typography>
                  
                  <Chip
                    color={getStatusColor(module.status)}
                    size="sm"
                    variant="soft"
                  >
                    {getStatusText(module.status)}
                  </Chip>
                </Box>
              </AspectRatio>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Categories Legend */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography level="title-sm" sx={{ mb: 2 }}>
          Module Categories
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {['communication', 'payments', 'analytics', 'security', 'integration'].map((category) => (
            <Chip
              key={category}
              variant="outlined"
              sx={{
                borderColor: getCategoryColor(category),
                color: getCategoryColor(category)
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Chip>
          ))}
        </Box>
      </Box>

      {/* Email Configuration Dialog */}
      <Modal open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <ModalDialog size="lg" sx={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
          <ModalClose />
          <Typography level="h3" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            Email Configuration
          </Typography>

          <Stack spacing={4}>
            {/* SendGrid Configuration Status */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  SendGrid Configuration
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip 
                    color={sendGridConfigured ? 'success' : 'warning'}
                    variant="soft"
                    startDecorator={sendGridConfigured ? <CheckCircleIcon /> : <ErrorIcon />}
                  >
                    {sendGridConfigured ? 'Ready for Testing' : 'Development Mode'}
                  </Chip>
                </Box>

                {!sendGridConfigured && (
                  <Alert color="neutral" sx={{ mb: 2 }}>
                    <div>
                      <Typography level="title-sm">Development Mode</Typography>
                      <Typography level="body-sm">
                        Configuration check unavailable in development. Ensure these environment variables are set:
                      </Typography>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li><code>SENDGRID_API_KEY</code> - Your SendGrid API key</li>
                        <li><code>SENDGRID_FROM_EMAIL</code> - The sender email address</li>
                      </ul>
                    </div>
                  </Alert>
                )}

                <Typography level="body-sm" color="neutral">
                  Order confirmation emails are automatically sent when customers complete checkout.
                  Each storefront can have its own branding in the email template.
                </Typography>
              </CardContent>
            </Card>

            {/* Test Email Functionality */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md" sx={{ mb: 3 }}>
                  Test Order Confirmation Email
                </Typography>

                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <Stack spacing={2}>
                      <FormControl>
                        <FormLabel>Select Storefront</FormLabel>
                        <select
                          value={selectedStorefront}
                          onChange={(e) => setSelectedStorefront(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Default (No Storefront)</option>
                          {storefronts.map(storefront => (
                            <option key={storefront.id} value={storefront.id}>
                              {storefront.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Test Email Address</FormLabel>
                        <Input
                          type="email"
                          placeholder="test@example.com"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                      </FormControl>

                      <Button
                        variant="solid"
                        startDecorator={loading ? <CircularProgress size="sm" /> : <SendIcon />}
                        onClick={handleSendTestEmail}
                        disabled={loading || !sendGridConfigured}
                        sx={{ mt: 1 }}
                      >
                        {loading ? 'Sending...' : 'Send Test Email'}
                      </Button>
                    </Stack>
                  </Grid>

                  <Grid xs={12} md={6}>
                    {selectedStorefrontData && (
                      <Card variant="soft">
                        <CardContent>
                          <Typography level="title-sm" sx={{ mb: 2 }}>
                            Selected Storefront Preview
                          </Typography>
                          
                          <Stack spacing={1}>
                            <Typography level="body-sm">
                              <strong>Name:</strong> {selectedStorefrontData.name}
                            </Typography>
                            {selectedStorefrontData.url && (
                              <Typography level="body-sm">
                                <strong>URL:</strong> {selectedStorefrontData.url}
                              </Typography>
                            )}
                            {selectedStorefrontData.logo_url && (
                              <Typography level="body-sm">
                                <strong>Logo:</strong> Configured
                              </Typography>
                            )}
                            <Typography level="body-sm">
                              <strong>Status:</strong> {selectedStorefrontData.is_online ? 'Online' : 'Offline'}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                </Grid>

                {testResult && (
                  <Alert
                    color={testResult.success ? 'success' : 'danger'}
                    sx={{ mt: 3 }}
                  >
                    <div>
                      <Typography level="title-sm">
                        {testResult.success ? 'Success!' : 'Error'}
                      </Typography>
                      <Typography level="body-sm">{testResult.message}</Typography>
                      <Typography level="body-xs" sx={{ mt: 1, opacity: 0.7 }}>
                        {testResult.timestamp.toLocaleString()}
                      </Typography>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
