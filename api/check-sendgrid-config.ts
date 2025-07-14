import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if SendGrid is properly configured
    const configured = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
    
    res.status(200).json({ 
      configured,
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      hasFromEmail: !!process.env.SENDGRID_FROM_EMAIL
    });
  } catch (error: any) {
    console.error('Error checking SendGrid config:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      configured: false
    });
  }
}
