/**
 * API Configuration for development and production environments
 */

import { getApiBaseUrl as getDevApiBaseUrl, DEV_CONFIG } from './devConfig';

// Get the base URL for API calls
const getApiBaseUrl = (): string => {
  return getDevApiBaseUrl();
};

// API endpoint configuration
export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl(); // Make this dynamic
  },
  endpoints: {
    checkSendGridConfig: '/api/check-sendgrid-config',
    sendOrderConfirmation: '/api/send-order-confirmation',
    resendOrderConfirmation: '/api/resend-order-confirmation',
    sendSmsCampaign: '/api/send-sms-campaign',
    health: '/api/health'
  }
};

/**
 * Build a full API URL for the given endpoint
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

/**
 * Make an API request with proper error handling
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}${endpoint}`;
  
  // Ensure CORS is handled properly
  const finalOptions: RequestInit = {
    ...options,
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  if (DEV_CONFIG.LOG_API_REQUESTS) {
    console.log('API Request:', {
      url,
      method: finalOptions.method || 'GET',
      headers: finalOptions.headers,
      body: finalOptions.body,
      mode: finalOptions.mode,
      credentials: finalOptions.credentials,
    });
  }

  try {
    console.log('Making fetch request to:', url);
    const response = await fetch(url, finalOptions);
    
    if (DEV_CONFIG.LOG_API_REQUESTS) {
      console.log('API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('API Request Error details:', {
      url,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      requestOptions: finalOptions,
      navigator: {
        onLine: navigator.onLine,
        userAgent: navigator.userAgent
      }
    });
    
    // Additional error context
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network Error - possible causes:');
      console.error('1. CORS issue (but server has CORS headers)');
      console.error('2. Network connectivity problem');
      console.error('3. DNS resolution issue');
      console.error('4. SSL/TLS certificate issue');
      console.error('5. Firewall/proxy blocking request');
    }
    
    if (DEV_CONFIG.LOG_API_REQUESTS) {
      console.error('API Request Error:', {
        url,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        requestOptions: finalOptions
      });
    }
    throw error;
  }
}

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if we're running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get the current deployment URL (useful for Vercel)
 */
export const getDeploymentUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Vercel environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }
  
  return 'http://localhost:5173'; // Vite default
};
