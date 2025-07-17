// Centralized API Client with error handling, retries, and logging
import { API_CONFIG, getApiUrl } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private async makeRequest<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = API_CONFIG.timeout,
      retries = API_CONFIG.retry.attempts
    } = options;

    const url = getApiUrl(endpoint);
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 API Request [Attempt ${attempt}]: ${method} ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 API Response: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            error: errorText || `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
          statusCode: response.status
        };

      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ API Request failed (attempt ${attempt}/${retries}):`, error);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.retry.delay * attempt));
        }
      }
    }

    return {
      success: false,
      error: `Request failed after ${retries} attempts: ${lastError?.message}`,
      statusCode: 0
    };
  }

  // Email API methods
  async sendOrderConfirmation(orderUuid?: string, testEmail?: string, storefrontId?: string) {
    return this.makeRequest('/api/send-order-confirmation', {
      method: 'POST',
      body: { orderUuid, testEmail, storefrontId }
    });
  }

  async sendSMSCampaign(campaignData: any) {
    return this.makeRequest('/api/send-sms-campaign', {
      method: 'POST',
      body: campaignData
    });
  }

  // Generic method for future endpoints
  async request<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, options);
  }

  // Health check method
  async healthCheck() {
    return this.makeRequest('/api/health', { method: 'GET' });
  }
}

export const apiClient = new ApiClient();
