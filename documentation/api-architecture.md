# SmartBack API Architecture

## Overview

This document outlines the robust, scalable API architecture implemented for SmartBack. The architecture is designed to support both current back-office operations and future storefront integrations with clearly defined, versioned APIs.

## Architecture Components

### 1. Configuration Layer (`src/config/api.ts`)
- **Environment-aware base URL detection**
- **API endpoint definitions with versioning**
- **Centralized configuration for timeouts and retries**
- **Future-proof endpoint categorization**

### 2. API Client Layer (`src/services/apiClient.ts`)
- **Centralized HTTP client with error handling**
- **Automatic retry mechanism with exponential backoff**
- **Request/response logging for debugging**
- **TypeScript-typed responses**
- **Timeout management**

### 3. API Endpoints (`/api/*.js`)
- **Vercel-compatible JavaScript modules**
- **Consistent error handling and responses**
- **Environment variable configuration**
- **Health check endpoint for monitoring**

### 4. Testing Infrastructure
- **Built-in Functions test page at `/functions`**
- **Comprehensive test suite (`test-api-architecture.js`)**
- **Individual endpoint testing capabilities**

## API Endpoints

### Current Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/health` | GET | System health check | ✅ Active |
| `/api/send-order-confirmation` | POST | Email order confirmations | ✅ Active |
| `/api/send-sms-campaign` | POST | SMS campaign delivery | ✅ Active |

### Future Endpoints (Planned)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/orders/create` | POST | Create new orders | 📋 Planned |
| `/api/v1/orders/update` | PUT | Update existing orders | 📋 Planned |
| `/api/v1/products/create` | POST | Create new products | 📋 Planned |
| `/api/v1/products/update` | PUT | Update existing products | 📋 Planned |

## Development Workflow

### 1. Local Development

```bash
# Start with Vercel dev for full API support
vercel dev --listen 3000

# Alternative: Standard Vite dev (limited API functionality)
npm run dev
```

### 2. Testing APIs

#### Option A: Built-in Functions Page
1. Navigate to `/functions` in the application
2. Select the API to test
3. Fill in required parameters
4. Click "Test API" to execute

#### Option B: Automated Test Suite
```bash
# Run comprehensive API tests
node test-api-architecture.js
```

#### Option C: Individual Endpoint Testing
```bash
# Test specific endpoints
node test-api-endpoint.js
```

### 3. Adding New APIs

#### Step 1: Define the Endpoint
Add to `src/config/api.ts`:
```typescript
export const API_ENDPOINTS = {
  // ...existing endpoints
  NEW_CATEGORY: {
    CREATE_ITEM: '/api/v1/items/create',
    UPDATE_ITEM: '/api/v1/items/update',
  }
};
```

#### Step 2: Create the API Handler
Create `/api/your-endpoint.js`:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Your implementation here
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

#### Step 3: Add Client Method
Extend `src/services/apiClient.ts`:
```typescript
async yourNewMethod(data: any) {
  return this.makeRequest('/api/your-endpoint', {
    method: 'POST',
    body: data
  });
}
```

#### Step 4: Add to Test Suite
Update `src/Pages/FunctionsTestPage.tsx`:
```typescript
const API_TEST_DEFINITIONS: ApiEndpoint[] = [
  // ...existing definitions
  {
    name: 'Your New API',
    endpoint: '/api/your-endpoint',
    method: 'POST',
    description: 'Description of your API',
    parameters: [/* parameter definitions */],
    category: 'Your Category'
  }
];
```

## Production Deployment

### Environment Variables
Required for production:
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Configuration
The `vercel.json` configuration ensures proper API handling:
```json
{
  "functions": {
    "api/*.js": {
      "includeFiles": "src/**"
    }
  }
}
```

### Health Monitoring
Use the health endpoint to monitor system status:
```bash
curl https://your-domain.vercel.app/api/health
```

## Best Practices

### 1. Error Handling
- Always return consistent error responses
- Log errors for debugging but don't expose internal details
- Use appropriate HTTP status codes

### 2. Request Validation
- Validate all input parameters
- Check required fields before processing
- Sanitize inputs to prevent injection attacks

### 3. Response Format
Standardized response format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}
```

### 4. Testing
- Test all APIs through the Functions page before deployment
- Run automated test suite regularly
- Test both success and error scenarios

### 5. Security
- Validate authentication for sensitive endpoints
- Use environment variables for sensitive configuration
- Implement rate limiting for public APIs

## Troubleshooting

### Common Issues

1. **404 Error on API Calls**
   - Ensure using `vercel dev` instead of `npm run dev`
   - Check endpoint exists in `/api` directory
   - Verify route is correctly defined

2. **CORS Issues**
   - APIs are configured for same-origin requests
   - For cross-origin, add CORS headers to API handlers

3. **Environment Variables Not Loading**
   - Create `.env.local` file in root directory
   - Ensure variables are prefixed correctly for client-side access
   - Restart development server after changes

4. **Timeout Errors**
   - Check network connectivity
   - Verify external services (SendGrid, Supabase) are accessible
   - Increase timeout values if needed

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## Future Roadmap

### Phase 1: Current (Completed)
- ✅ Email API endpoints
- ✅ Health check system
- ✅ Testing infrastructure
- ✅ Error handling framework

### Phase 2: Core Business APIs (Planned)
- 📋 Orders management API
- 📋 Products management API
- 📋 Customer management API
- 📋 Inventory management API

### Phase 3: External Integrations (Planned)
- 📋 Payment processing APIs
- 📋 Shipping integration APIs
- 📋 Analytics and reporting APIs
- 📋 Third-party marketplace APIs

### Phase 4: Advanced Features (Planned)
- 📋 Rate limiting and throttling
- 📋 API key authentication
- 📋 Webhook support
- 📋 Real-time notifications

## Contributing

When adding new APIs or modifying existing ones:

1. Follow the established patterns and conventions
2. Add comprehensive tests to the test suite
3. Update this documentation
4. Test thoroughly in both development and production environments
5. Consider backwards compatibility for existing integrations

For questions or support, refer to the development team or create an issue in the project repository.
