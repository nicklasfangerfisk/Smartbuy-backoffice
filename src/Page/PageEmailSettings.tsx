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

// Icons
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

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

export default function PageEmailSettings() {
  const [storefronts, setStorefronts] = useState<StorefrontItem[]>([]);
  const [selectedStorefront, setSelectedStorefront] = useState<string>('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);
  const [sendGridConfigured, setSendGridConfigured] = useState(false);

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
        const data = await response.json();
        setSendGridConfigured(data.configured);
      } else {
        // If we can't check the config, assume it's configured for testing
        setSendGridConfigured(true);
      }
    } catch (error) {
      console.error('Error checking SendGrid config:', error);
      // If we can't check the config, assume it's configured for testing
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
        message: error.message || 'Error sending test email',
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedStorefrontData = storefronts.find(s => s.id === selectedStorefront);

  return (
    <Box sx={{ p: 3, maxWidth: '1000px', mx: 'auto' }}>
      <Typography level="h2" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon />
        Email Configuration & Testing
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
                    Configuration check unavailable in development. To test emails, ensure these environment variables are set:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li><code>SENDGRID_API_KEY</code> - Your SendGrid API key</li>
                    <li><code>SENDGRID_FROM_EMAIL</code> - The sender email address</li>
                  </ul>
                  <Typography level="body-sm" sx={{ mt: 1 }}>
                    Try sending a test email below to verify your configuration.
                  </Typography>
                </div>
              </Alert>
            )}

            <Typography level="body-sm" color="neutral">
              Order confirmation emails are automatically sent when customers complete their checkout process.
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

        {/* Email Template Information */}
        <Card variant="outlined">
          <CardContent>
            <Typography level="title-md" sx={{ mb: 2 }}>
              Email Template Features
            </Typography>

            <Stack spacing={2}>
              <Typography level="body-sm">
                Order confirmation emails include the following storefront-specific customizations:
              </Typography>

              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                <li>
                  <Typography level="body-sm">
                    <strong>Storefront Logo:</strong> Displays the storefront's logo at the top of the email
                  </Typography>
                </li>
                <li>
                  <Typography level="body-sm">
                    <strong>Storefront Name:</strong> Used as the sender name and throughout the email
                  </Typography>
                </li>
                <li>
                  <Typography level="body-sm">
                    <strong>Store Link:</strong> Includes a "Visit Our Store" button if URL is configured
                  </Typography>
                </li>
                <li>
                  <Typography level="body-sm">
                    <strong>Order Details:</strong> Complete order summary with itemized pricing
                  </Typography>
                </li>
                <li>
                  <Typography level="body-sm">
                    <strong>Responsive Design:</strong> Mobile-friendly layout that works on all devices
                  </Typography>
                </li>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography level="body-sm" color="neutral">
                <strong>Note:</strong> Emails are sent automatically when orders are completed through the checkout process.
                This test functionality is for development and verification purposes only.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
