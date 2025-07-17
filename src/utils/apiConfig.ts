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
  baseUrl: getApiBaseUrl(),
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
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  // Log API requests if enabled
  if (DEV_CONFIG.LOG_API_REQUESTS && typeof window !== 'undefined') {
    console.log(`🔌 API Request: ${options.method || 'GET'} ${url}`);
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, finalOptions);
    
    // Log response status if enabled
    if (DEV_CONFIG.LOG_API_REQUESTS && typeof window !== 'undefined') {
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);
    throw error;
  }
};

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
