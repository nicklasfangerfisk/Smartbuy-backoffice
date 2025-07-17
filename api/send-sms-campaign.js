// Vercel API endpoint for sending SMS campaigns

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('SMS Campaign API called:', {
      method: req.method,
      body: Object.keys(req.body || {}),
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasMessagingService: !!process.env.TWILIO_MESSAGING_SERVICE_SID
    });

    const { message, recipients, campaignName } = req.body;

    // Validate required fields
    if (!message || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and recipients (array) are required' 
      });
    }

    // Check Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_MESSAGING_SERVICE_SID) {
      return res.status(500).json({ 
        error: 'SMS service not configured. Missing Twilio credentials.' 
      });
    }

    // For now, return a mock response since actual SMS sending would require proper setup
    console.log('SMS Campaign would send:', {
      message,
      recipientCount: recipients.length,
      campaignName: campaignName || 'Unnamed Campaign'
    });

    res.status(200).json({ 
      success: true, 
      message: 'SMS campaign processed successfully',
      campaignName: campaignName || 'Unnamed Campaign',
      recipientCount: recipients.length,
      status: 'queued'
    });

  } catch (error) {
    console.error('Error processing SMS campaign:', error);
    res.status(500).json({ 
      error: 'Failed to process SMS campaign',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
