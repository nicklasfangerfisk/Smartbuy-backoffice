/**
 * Development configuration for API endpoints
 * 
 * This file allows developers to easily switch between local and production APIs
 * during development and testing.
 */

export const DEV_CONFIG = {
  // Set to true to use production APIs during development
  // Useful for testing email functionality without local API server
  USE_PRODUCTION_API: true,
  
  // Production API URL (Vercel deployment)
  PRODUCTION_API_URL: 'https://smartbuy-backoffice.vercel.app',
  
  // Local API URL (if running API server locally)
  LOCAL_API_URL: 'http://localhost:3000',
  
  // Log API requests for debugging
  LOG_API_REQUESTS: true,
};

/**
 * Get the appropriate API base URL based on environment and configuration
 */
export const getApiBaseUrl = (): string => {
  // In browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check if we're in a development environment
    const isDevelopment = hostname === 'localhost' || 
                         hostname === '127.0.0.1' ||
                         hostname.includes('github.dev') ||
                         hostname.includes('gitpod.io') ||
                         hostname.includes('codespaces') ||
                         hostname.includes('stackblitz') ||
                         hostname.includes('codesandbox');
    
    // If we're in production (deployed to actual domain), always use current domain
    if (!isDevelopment) {
      if (DEV_CONFIG.LOG_API_REQUESTS) {
        console.log('🌐 Production environment detected, using current domain:', window.location.origin);
      }
      return window.location.origin;
    }
    
    // In development, check configuration
    if (DEV_CONFIG.USE_PRODUCTION_API) {
      if (DEV_CONFIG.LOG_API_REQUESTS) {
        console.log('🌐 Development environment using production API:', DEV_CONFIG.PRODUCTION_API_URL);
      }
      return DEV_CONFIG.PRODUCTION_API_URL;
    } else {
      if (DEV_CONFIG.LOG_API_REQUESTS) {
        console.log('🏠 Development environment using local API:', DEV_CONFIG.LOCAL_API_URL);
      }
      return DEV_CONFIG.LOCAL_API_URL;
    }
  }
  
  // Server-side environment
  return '';
};
