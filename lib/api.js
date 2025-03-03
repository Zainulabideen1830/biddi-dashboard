import { useAuthStore } from '@/store/auth-store';

/**
 * Makes an authenticated API call with automatic token handling
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function apiCall(url, options = {}) {
  const authStore = useAuthStore.getState();
  const accessToken = authStore.tokens?.accessToken;
  
  // Prepare headers with authorization if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
  };
  
  // Make the API call
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // If unauthorized, try to refresh token and retry
    if (response.status === 401 && !options.isRefreshAttempt) {
      // Attempt to refresh the token
      const refreshSuccess = await authStore.refreshToken();
      
      if (refreshSuccess) {
        // Get the new token and retry the request
        const newAccessToken = useAuthStore.getState().tokens?.accessToken;
        
        return apiCall(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`
          }
        });
      } else {
        // If refresh failed, clear auth state
        authStore.clearAuth();
        throw new Error('Authentication failed');
      }
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

/**
 * Custom hook for making API calls with authentication
 * 
 * @returns {Object} - API utility functions
 */
export function useApi() {
  const { authFetch } = useAuthStore();
  
  return {
    /**
     * Makes a GET request to the API
     * 
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - Additional fetch options
     * @returns {Promise<any>} - The parsed response data
     */
    get: async (endpoint, options = {}) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const response = await apiCall(url, {
        method: 'GET',
        ...options
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API error: ${response.status}`);
      }
      
      return response.json();
    },
    
    /**
     * Makes a POST request to the API
     * 
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The data to send
     * @param {Object} options - Additional fetch options
     * @returns {Promise<any>} - The parsed response data
     */
    post: async (endpoint, data, options = {}) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const response = await apiCall(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API error: ${response.status}`);
      }
      
      return response.json();
    },
    
    /**
     * Makes a PUT request to the API
     * 
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The data to send
     * @param {Object} options - Additional fetch options
     * @returns {Promise<any>} - The parsed response data
     */
    put: async (endpoint, data, options = {}) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const response = await apiCall(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API error: ${response.status}`);
      }
      
      return response.json();
    },
    
    /**
     * Makes a DELETE request to the API
     * 
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - Additional fetch options
     * @returns {Promise<any>} - The parsed response data
     */
    delete: async (endpoint, options = {}) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const response = await apiCall(url, {
        method: 'DELETE',
        ...options
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API error: ${response.status}`);
      }
      
      return response.json();
    }
  };
} 