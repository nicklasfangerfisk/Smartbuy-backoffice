// Health check API endpoint

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      endpoints: [
        '/api/send-order-confirmation',
        '/api/check-sendgrid-config',
        '/api/resend-order-confirmation',
        '/api/send-sms-campaign',
        '/api/health'
      ],
      configuration: {
        sendgrid: {
          hasApiKey: !!process.env.SENDGRID_API_KEY,
          hasFromEmail: !!process.env.SENDGRID_FROM_EMAIL,
          apiKeyLength: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 0
        },
        supabase: {
          hasUrl: !!process.env.VITE_SUPABASE_URL,
          hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        twilio: {
          hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
          hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
          hasMessagingService: !!process.env.TWILIO_MESSAGING_SERVICE_SID
        }
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
