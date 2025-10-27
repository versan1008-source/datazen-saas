/**
 * API utilities for DataZen frontend
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for scraping operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface ScrapeRequest {
  url: string;
  data_type: 'text' | 'images' | 'links' | 'emails' | 'phone_numbers';
  ai_mode: boolean;
  custom_prompt?: string;
  check_robots?: boolean;
  resolve_owner?: boolean;
}

export interface EnhancedScrapeRequest {
  url: string;
  data_type: 'text' | 'images' | 'links' | 'emails' | 'phone_numbers' | 'linkedin_profile' | 'linkedin_company' | 'linkedin_jobs' | 'social_posts' | 'ecommerce_products';
  ai_mode: boolean;
  custom_prompt?: string;
  check_robots?: boolean;
  extract_structured_data?: boolean;
  resolve_owner?: boolean;
}

export interface ScrapeResponse {
  success: boolean;
  data_type: string;
  count: number;
  data: any[];
  timestamp: string;
  url?: string;
  original_url?: string;
  ai_processed?: boolean;
  model?: string;
  error?: string;
  processing_time_seconds?: number;
  ai_processing_error?: string;
  website_type?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    scraper: string;
    ai: string;
  };
  version: string;
}

export interface SupportedTypesResponse {
  supported_types: {
    [key: string]: {
      description: string;
      examples: string[];
    };
  };
  ai_mode: {
    description: string;
    benefits: string[];
  };
}

// API functions
export const apiService = {
  /**
   * Scrape a website
   */
  async scrapeWebsite(request: ScrapeRequest): Promise<ScrapeResponse> {
    try {
      // Use a longer timeout specifically for scraping operations
      const response = await api.post<ScrapeResponse>('/api/scrape', request, {
        timeout: 180000, // 3 minutes for complex scraping with AI
      });
      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data) {
        // Handle structured error responses from backend
        const errorDetail = error.response.data.detail || error.response.data.message || error.response.data.error || 'Scraping failed';
        throw new Error(errorDetail);
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout - the website or AI processing took too long to respond. Try again or disable AI mode for faster results.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to DataZen API. Please ensure the backend is running on http://localhost:8000');
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Network error - please check your internet connection and ensure the backend server is running.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred while scraping');
      }
    }
  },

  /**
   * Enhanced scrape a website with LinkedIn and social media support
   */
  async scrapeWebsiteEnhanced(request: EnhancedScrapeRequest): Promise<ScrapeResponse> {
    try {
      // Use a longer timeout specifically for enhanced scraping operations
      const response = await api.post<ScrapeResponse>('/api/scrape-enhanced', request, {
        timeout: 240000, // 4 minutes for complex enhanced scraping with AI
      });
      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data) {
        // Handle structured error responses from backend
        const errorDetail = error.response.data.detail || error.response.data.message || error.response.data.error || 'Enhanced scraping failed';
        throw new Error(errorDetail);
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout - the enhanced scraping took too long to respond. Try again or disable AI mode for faster results.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to DataZen API. Please ensure the backend is running on http://localhost:8000');
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Network error - please check your internet connection and ensure the backend server is running.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred while enhanced scraping');
      }
    }
  },

  /**
   * Test AI connection
   */
  async testAI(): Promise<{ success: boolean; available: boolean; error?: string }> {
    try {
      const response = await api.get('/api/test-ai');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        available: false,
        error: error.response?.data?.error || error.message || 'Failed to test AI connection'
      };
    }
  },

  /**
   * Get supported data types
   */
  async getSupportedTypes(): Promise<SupportedTypesResponse> {
    try {
      const response = await api.get<SupportedTypesResponse>('/api/supported-types');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get supported types');
    }
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await api.get<HealthResponse>('/api/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Health check failed');
    }
  },

  /**
   * Root endpoint info
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get API info');
    }
  },

  /**
   * Regenerate API key
   */
  async regenerateApiKey(): Promise<{ api_key: string; message: string }> {
    try {
      const response = await api.post<{ api_key: string; message: string }>('/api/auth/regenerate-api-key', {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to regenerate API key');
    }
  },

  /**
   * Create a scheduled job
   */
  async createScheduledJob(data: any): Promise<any> {
    try {
      const response = await api.post('/api/scheduling/jobs', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create scheduled job');
    }
  },

  /**
   * Get all scheduled jobs
   */
  async getScheduledJobs(): Promise<any[]> {
    try {
      const response = await api.get('/api/scheduling/jobs');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get scheduled jobs');
    }
  },

  /**
   * Delete a scheduled job
   */
  async deleteScheduledJob(jobId: number): Promise<any> {
    try {
      const response = await api.delete(`/api/scheduling/jobs/${jobId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete scheduled job');
    }
  },

  /**
   * Create a webhook
   */
  async createWebhook(data: any): Promise<any> {
    try {
      const response = await api.post('/api/webhooks', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create webhook');
    }
  },

  /**
   * Get all webhooks
   */
  async getWebhooks(): Promise<any[]> {
    try {
      const response = await api.get('/api/webhooks');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get webhooks');
    }
  },

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: number): Promise<any> {
    try {
      const response = await api.delete(`/api/webhooks/${webhookId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete webhook');
    }
  }
};

// Utility functions
export const downloadUtils = {
  /**
   * Download data as JSON file
   */
  downloadJSON(data: any, filename: string = 'datazen-export.json') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Download data as CSV file
   */
  downloadCSV(data: any[], filename: string = 'datazen-export.csv', dataType?: string) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    let headers = Array.from(allKeys);

    // For text data, prioritize 'text' column and filter out metadata columns
    if (dataType === 'text' || filename.includes('text')) {
      // Put 'text' first if it exists
      if (headers.includes('text')) {
        headers = ['text', ...headers.filter(h => h !== 'text')];
      }
    }

    // Create CSV content
    const csvContent = [
      // Header row
      headers.map(header => `"${header}"`).join(','),
      // Data rows
      ...data.map(item =>
        headers.map(header => {
          const value = item[header] || '';
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default api;
