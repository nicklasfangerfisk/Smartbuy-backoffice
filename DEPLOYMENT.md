# Production Deployment Configuration

This document explains how to configure environment variables for the Vercel production deployment to enable API functionality.

## Required Environment Variables for Vercel

Add these environment variables in your Vercel dashboard (Settings → Environment Variables):

### Supabase Configuration
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### SendGrid Configuration (for emails)
```
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your-from-email@domain.com
```

### Twilio Configuration (for SMS)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_MESSAGING_SERVICE_SID=your_twilio_messaging_service_sid_here
```

## API Configuration

The application is configured to:

### Production Environment
- Use relative API paths (`/api/*`) when deployed on Vercel
- APIs are automatically available at the same domain as the frontend

### Development Environment
- Automatically use production APIs for reliable testing
- Can be configured to use local APIs by editing `src/utils/devConfig.ts`
- Set `USE_PRODUCTION_API: false` to use local development APIs

## Available API Endpoints

Once deployed, these endpoints will be available:

- `GET /api/health` - Health check
- `GET /api/check-sendgrid-config` - Check SendGrid configuration
- `POST /api/send-order-confirmation` - Send order confirmation emails
- `POST /api/resend-order-confirmation` - Resend order confirmations
- `POST /api/send-sms-campaign` - Send SMS campaigns

## Testing

1. **Deploy to Vercel**: Push changes to main branch
2. **Configure Environment Variables**: Add all required variables in Vercel dashboard
3. **Test Email Functionality**: Use the Modules page → Email Configuration to send test emails
4. **Monitor Logs**: Check Vercel function logs for any issues

## Development Setup

For local development that uses production APIs:

1. Ensure `USE_PRODUCTION_API: true` in `src/utils/devConfig.ts`
2. The app will automatically use the production API endpoints
3. No local API server needed for email functionality

## Troubleshooting

### Email Not Working
1. Verify SendGrid environment variables are set in Vercel
2. Check Vercel function logs for errors
3. Ensure SendGrid API key has send permissions

### API Endpoints Not Found
1. Verify files exist in `/api` directory
2. Check Vercel build logs for deployment issues
3. Ensure `vercel.json` is properly configured

### Development Issues
1. Check browser console for API request logs
2. Verify production URL in `devConfig.ts`
3. Test with `USE_PRODUCTION_API: false` for local debugging
