import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Stack from '@mui/joy/Stack';
import Grid from '@mui/joy/Grid';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Alert from '@mui/joy/Alert';
import LinearProgress from '@mui/joy/LinearProgress';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import CircularProgress from '@mui/joy/CircularProgress';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import PaymentIcon from '@mui/icons-material/Payment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExtensionIcon from '@mui/icons-material/Extension';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LaunchIcon from '@mui/icons-material/Launch';
import BuildIcon from '@mui/icons-material/Build';
import PendingIcon from '@mui/icons-material/Pending';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';

// Layout Components
import PageLayout from '../layouts/PageLayout';
import ResponsiveContainer from '../components/ResponsiveContainer';

// Hooks
import { useResponsive } from '../hooks/useResponsive';

// Theme
import fonts from '../theme/fonts';

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
  status: 'Available' | 'Coming Soon' | 'Configured';
  category: 'communication' | 'payments' | 'analytics' | 'security' | 'integration';
  onClick?: () => void;
  features?: string[];
  version?: string;
}

interface ModuleStats {
  totalModules: number;
  activeModules: number;
  configuredModules: number;
  integrationHealth: number;
}

export default function PageModules() {
  const [storefronts, setStorefronts] = useState<StorefrontItem[]>([]);
  const [selectedStorefront, setSelectedStorefront] = useState<string>('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);
  const [sendGridConfigured, setSendGridConfigured] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Module statistics
  const [moduleStats] = useState<ModuleStats>({
    totalModules: 8,
    activeModules: 1,
    configuredModules: 1,
    integrationHealth: 87.5
  });

  const { isMobile } = useResponsive();

  // Module definitions
  const modules: ModuleTile[] = [
    {
      id: 'email-config',
      name: 'Email Configuration',
      description: 'Configure order confirmation emails and SendGrid integration',
      icon: <EmailIcon />,
      status: 'Available',
      category: 'communication',
      onClick: () => setEmailDialogOpen(true),
      features: ['Order Confirmations', 'Custom Templates', 'Multi-storefront'],
      version: '1.0.0'
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      description: 'Integrate payment processing solutions',
      icon: <PaymentIcon />,
      status: 'Coming Soon',
      category: 'payments',
      features: ['Stripe Integration', 'PayPal Support', 'Multi-currency'],
      version: '2.0.0'
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Advanced analytics and reporting tools',
      icon: <AnalyticsIcon />,
      status: 'Coming Soon',
      category: 'analytics',
      features: ['Real-time Metrics', 'Custom Reports', 'Export Options'],
      version: '1.5.0'
    },
    {
      id: 'security-audit',
      name: 'Security Audit',
      description: 'Security monitoring and compliance tools',
      icon: <SecurityIcon />,
      status: 'Coming Soon',
      category: 'security',
      features: ['Vulnerability Scanning', 'Compliance Reports', 'Access Logs'],
      version: '1.2.0'
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      description: 'Real-time notifications for customers and staff',
      icon: <NotificationsIcon />,
      status: 'Coming Soon',
      category: 'communication',
      features: ['Customer Alerts', 'Staff Updates', 'Custom Triggers'],
      version: '1.1.0'
    },
    {
      id: 'api-integrations',
      name: 'API Integrations',
      description: 'Connect with third-party services and platforms',
      icon: <IntegrationInstructionsIcon />,
      status: 'Coming Soon',
      category: 'integration',
      features: ['REST APIs', 'Webhooks', 'Custom Connectors'],
      version: '2.1.0'
    },
    {
      id: 'inventory-sync',
      name: 'Inventory Sync',
      description: 'Synchronize inventory across multiple channels',
      icon: <RefreshIcon />,
      status: 'Coming Soon',
      category: 'integration',
      features: ['Multi-channel Sync', 'Real-time Updates', 'Conflict Resolution'],
      version: '1.3.0'
    },
    {
      id: 'customer-portal',
      name: 'Customer Portal',
      description: 'Self-service portal for customers',
      icon: <StorefrontIcon />,
      status: 'Coming Soon',
      category: 'communication',
      features: ['Order History', 'Account Management', 'Support Tickets'],
      version: '1.4.0'
    }
  ];

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
      setTestResult({
        success: false,
        message: error.message || 'Unknown error occurred',
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCategoryColor = (category: string) => {
    const colors = {
      communication: 'primary.500',
      payments: 'success.500',
      analytics: 'warning.500',
      security: 'danger.500',
      integration: 'neutral.500'
    };
    return colors[category as keyof typeof colors] || 'neutral.500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Coming Soon': return 'warning';
      case 'Configured': return 'primary';
      default: return 'neutral';
    }
  };

  const getStatusText = (status: string) => {
    return status;
  };

  // Filter modules by category and search
  const filteredModules = modules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];

  const selectedStorefrontData = storefronts.find(s => s.id === selectedStorefront);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <ResponsiveContainer padding="medium">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h2" sx={{ fontSize: fonts.sizes.xlarge }}>
            Modules
          </Typography>
          <IconButton 
            variant="soft" 
            color="primary"
            onClick={() => {
              fetchStorefronts();
              checkSendGridConfig();
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {/* Stats Overview for Mobile */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={6}>
            <Card variant="soft" sx={{ height: '100%' }}>
              <CardContent>
                <Typography level="h3" sx={{ fontWeight: 'bold', color: 'primary.500' }}>
                  {moduleStats.totalModules}
                </Typography>
                <Typography level="body-xs" color="neutral">
                  Total Modules
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6}>
            <Card variant="soft" sx={{ height: '100%' }}>
              <CardContent>
                <Typography level="h3" sx={{ fontWeight: 'bold', color: 'success.500' }}>
                  {moduleStats.activeModules}
                </Typography>
                <Typography level="body-xs" color="neutral">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Module Grid for Mobile */}
        <Grid container spacing={2} sx={{ mt: 0, mb: 4 }}>
          {filteredModules.map((module) => (
            <Grid xs={12} sm={6} key={module.id} sx={{ display: 'flex' }}>
              <Card
                variant="outlined"
                sx={{
                  width: '100%',
                  height: '100%',
                  cursor: module.status === 'Available' ? 'pointer' : 'default',
                  opacity: module.status === 'Coming Soon' ? 0.75 : 1,
                  boxSizing: 'border-box',
                  '&:hover': module.status === 'Available' ? {
                    boxShadow: 'md',
                    transform: 'translateY(-2px)',
                    zIndex: 1
                  } : {}
                }}
                onClick={module.onClick}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ fontSize: '1.5rem', color: getCategoryColor(module.category) }}>
                      {module.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                        {module.name}
                      </Typography>
                      <Chip
                        size="sm"
                        color={getStatusColor(module.status)}
                        variant="soft"
                      >
                        {getStatusText(module.status)}
                      </Chip>
                    </Box>
                  </Box>
                  <Typography level="body-xs" color="neutral">
                    {module.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </ResponsiveContainer>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer variant="table-page">
      <Typography level="h2" sx={{ mb: 3, fontSize: fonts.sizes.xlarge }}>
        Modules
      </Typography>
      
      {/* Enhanced Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={3}>
          <Card variant="soft" sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'primary.500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ExtensionIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography level="body-xs" color="neutral">
                    Total Modules
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {moduleStats.totalModules}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={3}>
          <Card variant="soft" sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)',
            border: '1px solid rgba(46, 125, 50, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'success.500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography level="body-xs" color="neutral">
                    Active
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {moduleStats.activeModules}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={3}>
          <Card variant="soft" sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(237, 108, 2, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
            border: '1px solid rgba(237, 108, 2, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'warning.500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PendingIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography level="body-xs" color="neutral">
                    Configured
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {moduleStats.configuredModules}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={3}>
          <Card variant="soft" sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'primary.600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography level="body-xs" color="neutral">
                    Health Score
                  </Typography>
                  <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {moduleStats.integrationHealth}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Input
          placeholder="Search modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by category"
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value || 'all')}
          sx={{ minWidth: 200 }}
        >
          <Option value="all">All Categories</Option>
          <Option value="communication">Communication</Option>
          <Option value="payments">Payments</Option>
          <Option value="analytics">Analytics</Option>
          <Option value="security">Security</Option>
          <Option value="integration">Integration</Option>
        </Select>
        <Button variant="solid" startDecorator={<BuildIcon />}>
          Module Builder
        </Button>
      </Box>

      {/* Module Grid */}
      <Grid container spacing={3} sx={{ mt: 0, mb: 4 }}>
        {filteredModules.map((module) => (
          <Grid xs={12} sm={6} lg={4} xl={3} key={module.id} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{
                width: '100%',
                height: '100%',
                cursor: module.status === 'Available' ? 'pointer' : 'default',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                boxSizing: 'border-box',
                '&:hover': module.status === 'Available' ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl',
                  borderColor: getCategoryColor(module.category),
                  zIndex: 1
                } : {},
                opacity: module.status === 'Coming Soon' ? 0.75 : 1
              }}
              onClick={module.onClick}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {/* Module Header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box
                      sx={{
                        fontSize: '2.5rem',
                        color: getCategoryColor(module.category),
                      }}
                    >
                      {module.icon}
                    </Box>
                    <Chip
                      size="sm"
                      color={getStatusColor(module.status)}
                      variant="soft"
                    >
                      {getStatusText(module.status)}
                    </Chip>
                  </Stack>
                  
                  {/* Module Info */}
                  <Box>
                    <Typography level="title-lg" sx={{ mb: 1 }}>
                      {module.name}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
                      {module.description}
                    </Typography>
                  </Box>

                  {/* Features */}
                  {module.features && (
                    <Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 1 }}>
                        Features:
                      </Typography>
                      <Stack spacing={0.5}>
                        {module.features.map((feature, index) => (
                          <Typography key={index} level="body-xs" sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}>
                            • {feature}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Version */}
                  {module.version && (
                    <Typography level="body-xs" sx={{ 
                      color: 'text.tertiary',
                      textAlign: 'right'
                    }}>
                      v{module.version}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
      
      {/* Email Configuration Modal */}
      <Modal open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <ModalDialog size="md" sx={{ maxWidth: '500px' }}>
          <ModalClose />
          <DialogTitle>
            <EmailIcon sx={{ mr: 1 }} />
            Email Configuration
          </DialogTitle>
          
          <DialogContent>
            <Typography level="body-md" sx={{ mb: 3 }}>
              Configure your SendGrid integration for order confirmation emails
            </Typography>
            
            <Stack spacing={3}>
              <Alert 
                color={sendGridConfigured ? 'success' : 'warning'}
                startDecorator={sendGridConfigured ? <CheckCircleIcon /> : <WarningIcon />}
              >
                <Typography level="title-sm">
                  {sendGridConfigured ? 'SendGrid Integration Active' : 'SendGrid Configuration Required'}
                </Typography>
                <Typography level="body-sm">
                  {sendGridConfigured 
                    ? 'Your email integration is properly configured and ready to use.'
                    : 'Configure SendGrid to enable order confirmation emails and notifications.'
                  }
                </Typography>
              </Alert>
              
              {storefronts.length > 0 && (
                <FormControl>
                  <FormLabel>Select Storefront</FormLabel>
                  <Select 
                    value={selectedStorefront}
                    onChange={(_, value) => setSelectedStorefront(value || '')}
                  >
                    {storefronts.map((storefront) => (
                      <Option key={storefront.id} value={storefront.id}>
                        {storefront.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel>Test Email Address</FormLabel>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={loading}
                />
              </FormControl>
              
              {testResult && (
                <Alert 
                  color={testResult.success ? 'success' : 'danger'}
                  startDecorator={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                  <Typography level="body-sm">
                    {testResult.message}
                  </Typography>
                  <Typography level="body-xs" sx={{ mt: 1 }}>
                    {testResult.timestamp.toLocaleTimeString()}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </DialogContent>
          
          <DialogActions>
            <Button variant="outlined" onClick={() => setEmailDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleSendTestEmail}
              loading={loading}
              startDecorator={<SendIcon />}
            >
              Send Test Email
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </PageLayout>
  );
}
