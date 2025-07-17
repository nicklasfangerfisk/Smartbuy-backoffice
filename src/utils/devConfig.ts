/**
 * Development configuration for API endpoints
 * 
 * This file allows developers to easily switch between local and production APIs
 * during development and testing.
 */

// Mutable configuration object that can be changed at runtime
export const DEV_CONFIG = {
  // Set to true to use production APIs during development
  // Useful for testing email functionality without local API server
  USE_PRODUCTION_API: true,  // Default to production since it's working
  
  // Local API port - configurable in UI
  LOCAL_API_PORT: 3000,
  
  // Production API URL (Vercel deployment)
  PRODUCTION_API_URL: 'https://smartbuybackoffice.vercel.app',
  
  // Log API requests for debugging
  LOG_API_REQUESTS: true,
};

/**
 * Get the appropriate API base URL based on environment and configuration
 */
export const getApiBaseUrl = (): string => {
  // In browser environment
  if (typeof window !== 'undefined') {
    // Always respect the USE_PRODUCTION_API setting first
    if (DEV_CONFIG.USE_PRODUCTION_API) {
      if (DEV_CONFIG.LOG_API_REQUESTS) {
        console.log('🌐 Using production API:', DEV_CONFIG.PRODUCTION_API_URL);
      }
      return DEV_CONFIG.PRODUCTION_API_URL;
    }
    
    // For local API, use the configured port
    const localUrl = `${window.location.protocol}//${window.location.hostname}:${DEV_CONFIG.LOCAL_API_PORT}`;
    if (DEV_CONFIG.LOG_API_REQUESTS) {
      console.log('🏠 Using local API:', localUrl);
    }
    return localUrl;
  }
  
  // Server-side environment
  return DEV_CONFIG.USE_PRODUCTION_API 
    ? DEV_CONFIG.PRODUCTION_API_URL 
    : `http://localhost:${DEV_CONFIG.LOCAL_API_PORT}`;
};
