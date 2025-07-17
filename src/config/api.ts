// API Configuration - Environment-aware setup
import { DEV_CONFIG } from '../utils/devConfig';

export const API_CONFIG = {
  // Determine base URL based on environment and dev configuration
  get baseUrl() {
    if (typeof window !== 'undefined') {
      // Browser environment - respect DEV_CONFIG settings
      if (DEV_CONFIG.USE_PRODUCTION_API) {
        return DEV_CONFIG.PRODUCTION_API_URL;
      }
      // Use local API with configured port
      return `${window.location.protocol}//${window.location.hostname}:${DEV_CONFIG.LOCAL_API_PORT}`;
    }
    // Server environment
    return process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${DEV_CONFIG.LOCAL_API_PORT}`;
  },
  
  // API versioning
  version: 'v1',
  
  // Timeout settings
  timeout: 30000,
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
  }
};

export const API_ENDPOINTS = {
  // Email services
  EMAIL: {
    SEND_ORDER_CONFIRMATION: '/api/send-order-confirmation',
    SEND_SMS_CAMPAIGN: '/api/send-sms-campaign',
  },
  
  // Future endpoints can be added here
  ORDERS: {
    CREATE: '/api/orders/create',
    UPDATE: '/api/orders/update',
    DELETE: '/api/orders/delete',
  },
  
  PRODUCTS: {
    CREATE: '/api/products/create',
    UPDATE: '/api/products/update',
    DELETE: '/api/products/delete',
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};
