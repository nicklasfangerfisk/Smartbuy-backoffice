# Deployment Guide

This guide covers deployment strategies for the SmartBack application, focusing on Vercel deployment and best practices.

## Vercel Deployment (Recommended)

### 1. Project Setup

When deploying to Vercel, follow these best practices to ensure successful builds:

#### Set the Correct Build Output Directory

- Vercel automatically detects Vite projects and sets the correct output directory
- For custom setups, specify the output directory in `vercel.json`:

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "outputDirectory": "dist"
}
```

#### Configure Routing for SPA

For React apps using React Router, ensure all routes are rewritten to `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. Environment Variables

Set up environment variables in the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build Configuration

Ensure your `package.json` has the correct build scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 4. Static Assets

- Place all static assets (images, fonts, icons) in the `public` folder
- These files will be served directly by Vercel
- Use relative paths to reference assets

### 5. API Routes

SmartBack uses Vercel API routes for server-side functionality:

```
/api
├── receivePurchaseOrder.ts
├── send-sms-campaign.ts
└── ... (other API endpoints)
```

These are automatically deployed as serverless functions.

## Development vs Production

### Local Development

```bash
# Frontend only (fast HMR)
npm run dev

# Full-stack with API routes (recommended)
vercel dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing Before Deployment

Always test locally before deploying:

```bash
# Test with Vercel CLI
vercel dev

# Test production build
npm run build && npm run preview
```

## Build Optimization

### 1. Dependencies

- Ensure all dependencies are listed in `package.json`
- Remove unused dependencies to reduce bundle size
- Use production builds of libraries

### 2. Code Splitting

Vite automatically handles code splitting. Optimize further by:

```javascript
// Dynamic imports for large components
const LazyComponent = lazy(() => import('./components/LazyComponent'));

// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 3. Asset Optimization

- Optimize images before adding to `public` folder
- Use appropriate image formats (WebP, AVIF)
- Implement lazy loading for images

## Troubleshooting

### Common Build Issues

**1. Missing Dependencies**
```bash
# Error: Module not found
npm install <missing-package>
```

**2. Environment Variables Not Loading**
- Check variable names start with `VITE_`
- Verify variables are set in Vercel dashboard
- Restart development server after changes

**3. Build Failures**
```bash
# Check build logs
vercel logs <deployment-url>

# Force redeploy
vercel --force
```

**4. Routing Issues**
- Ensure `vercel.json` has correct rewrite rules
- Check React Router configuration
- Verify basename settings

### Performance Issues

**1. Bundle Size**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

**2. Lighthouse Scores**
- Use Vercel's built-in Lighthouse integration
- Optimize Core Web Vitals
- Implement proper caching strategies

## Monitoring and Analytics

### 1. Vercel Analytics

Enable Vercel Analytics for performance monitoring:

```bash
npm install @vercel/analytics
```

```javascript
// In your main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 2. Error Tracking

Consider implementing error tracking:

```javascript
// Error boundary for production
class ErrorBoundary extends React.Component {
  // Implementation
}
```

## Security Considerations

### 1. Environment Variables

- Never commit sensitive data to version control
- Use Vercel's environment variable management
- Rotate API keys regularly

### 2. API Security

- Implement proper authentication for API routes
- Use CORS headers appropriately
- Validate all input data

### 3. Content Security Policy

Add CSP headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        }
      ]
    }
  ]
}
```

## Alternative Deployment Options

### 1. Netlify

- Similar to Vercel
- Requires similar configuration
- Good for static sites

### 2. AWS Amplify

- More complex setup
- Better for AWS-integrated projects
- Good for enterprise deployments

### 3. Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Project Structure Best Practices

Organize your project for optimal deployment:

```
/
├── public/                 # Static assets
├── src/                   # Source code
├── api/                   # API routes (for Vercel)
├── migrations/            # Database migrations
├── documentation/         # Project documentation
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── .env.local            # Local environment (not committed)
```

## Continuous Deployment

### 1. Git Integration

- Connect your repository to Vercel
- Enable automatic deployments
- Set up preview deployments for branches

### 2. Build Hooks

Use webhooks for external triggers:

```bash
# Trigger deployment via API
curl -X POST https://api.vercel.com/v1/integrations/deploy/your-hook-id
```

### 3. Release Management

Use the built-in release automation:

```bash
# Automated release with deployment
npm run auto-release
```

This will:
- Version the application
- Create release notes
- Trigger deployment
- Tag the release

## Scaling Considerations

### 1. Function Limits

- Vercel functions have execution time limits
- Consider breaking down complex operations
- Use background jobs for heavy processing

### 2. Database Connections

- Supabase handles connection pooling
- Consider caching strategies
- Monitor query performance

### 3. CDN and Caching

- Vercel provides global CDN
- Configure appropriate cache headers
- Use static generation where possible

By following these deployment practices, you'll ensure a smooth, reliable deployment process for the SmartBack application.
