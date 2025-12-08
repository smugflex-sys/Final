/**
 * API Service
 * Graceland Royal Academy School Management System
 */

import { API_CONFIG, buildUrl, getAuthToken, setAuthToken, removeAuthToken } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Make HTTP request with proper error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const token = getAuthToken();

    // Default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with provided headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Request configuration
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: data.code,
        };
        throw error;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    // Add query parameters
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional form data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = getAuthToken();
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers, // Don't set Content-Type for FormData (browser sets it automatically)
    });
  }

  /**
   * Download file
   */
  async download(endpoint: string, filename?: string): Promise<void> {
    const url = buildUrl(endpoint);
    const token = getAuthToken();

    const headers: HeadersInit = {
      'Accept': 'application/octet-stream',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header if not provided
      if (!filename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw new Error('Download failed. Please try again.');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    setAuthToken(token);
  }

  /**
   * Remove authentication token
   */
  clearToken(): void {
    removeAuthToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export individual methods for convenience
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) => apiService.get<T>(endpoint, params),
  post: <T>(endpoint: string, data?: any) => apiService.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => apiService.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiService.delete<T>(endpoint),
  patch: <T>(endpoint: string, data?: any) => apiService.patch<T>(endpoint, data),
  upload: <T>(endpoint: string, file: File, additionalData?: Record<string, any>) => 
    apiService.upload<T>(endpoint, file, additionalData),
  download: (endpoint: string, filename?: string) => apiService.download(endpoint, filename),
  setToken: (token: string) => apiService.setToken(token),
  clearToken: () => apiService.clearToken(),
  isAuthenticated: () => apiService.isAuthenticated(),
};

export default apiService;
