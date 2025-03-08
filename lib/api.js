import { useAuthStore } from '@/store/auth-store';

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map();

/**
 * Makes an authenticated API call with automatic token handling
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export async function apiCall(url, options = {}) {
  const authStore = useAuthStore.getState();
  
  // For auth endpoints, check if there's already a request in flight
  if ((url.includes('/api/auth/me') || url.includes('/api/auth/refresh-token')) && !options.isRetry) {
    const requestKey = `${options.method || 'GET'}:${url}`;
    
    // If there's already a request in flight for this URL, return the existing promise
    if (pendingRequests.has(requestKey)) {
      console.log(`Using existing in-flight request for ${requestKey}`);
      return pendingRequests.get(requestKey);
    }
    
    // Create a new promise for this request
    const requestPromise = (async () => {
      try {
        // Make the actual request
        const response = await makeAuthenticatedRequest(url, options, authStore);
        return response;
      } finally {
        // Remove this request from the pending map when it completes
        pendingRequests.delete(requestKey);
      }
    })();
    
    // Store the promise in the pending requests map
    pendingRequests.set(requestKey, requestPromise);
    
    // Return the promise
    return requestPromise;
  }
  
  // For non-auth endpoints or retries, just make the request
  return makeAuthenticatedRequest(url, options, authStore);
}

/**
 * Helper function to make an authenticated request
 */
async function makeAuthenticatedRequest(url, options, authStore) {
  // Check if authentication is required for this call
  const requiresAuth = options.requiresAuth !== false;
  
  // If authentication is required, validate the current auth state
  if (requiresAuth && authStore.isAuthenticated) {
    // Check when auth was last validated
    const lastValidated = authStore.lastValidated;
    const now = new Date();
    
    // If it's been more than 15 minutes since the last validation, validate again
    if (!lastValidated || (now - new Date(lastValidated)) > 15 * 60 * 1000) {
      // Use the debounced validateAuth function
      await authStore.validateAuth();
    }
  }
  
  const accessToken = authStore.tokens?.accessToken;
  
  // Prepare headers with authorization if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && requiresAuth ? { 'Authorization': `Bearer ${accessToken}` } : {})
  };
  
  // Make the API call
  try {
    // Skip duplicate calls to auth endpoints if they're already in progress
    if ((url.includes('/api/auth/me') || url.includes('/api/auth/refresh-token')) && 
        !options.isRetry && authStore.isLoading) {
      // Wait a bit and check if auth state was updated while we were waiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If auth was validated while we were waiting, we can use the result
      if (authStore.lastValidated) {
        const validatedTime = new Date(authStore.lastValidated);
        const timeSinceValidation = new Date() - validatedTime;
        
        // If validated less than 2 seconds ago, we can skip this call
        if (timeSinceValidation < 2000) {
          // Create a mock response for /me endpoint
          if (url.includes('/api/auth/me')) {
            return new Response(JSON.stringify({
              success: true,
              user: authStore.user
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Special handling for login endpoint - don't attempt token refresh for login failures
    if (url.includes('/api/auth/login')) {
      return response;
    }
    
    // If unauthorized, try to refresh token and retry
    if (response.status === 401 && requiresAuth && !options.isRefreshAttempt) {
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
          },
          isRefreshAttempt: true, // Prevent infinite refresh loops
          isRetry: true
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
  const { authFetch, validateAuth } = useAuthStore();
  
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
      
      // Parse the response JSON regardless of status code
      const responseData = await response.json().catch(() => ({}));
      
      // If the response is not OK, throw an error with the message from the API
      if (!response.ok) {
        // Use the error message from the API response if available
        throw new Error(responseData.message || `API error: ${response.status}`);
      }
      
      return responseData;
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
      
      // Parse the response JSON regardless of status code
      const responseData = await response.json().catch(() => ({}));
      
      // If the response is not OK, throw an error with the message from the API
      if (!response.ok) {
        // Use the error message from the API response if available
        throw new Error(responseData.message || `API error: ${response.status}`);
      }
      
      return responseData;
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
      
      // Parse the response JSON regardless of status code
      const responseData = await response.json().catch(() => ({}));
      
      // If the response is not OK, throw an error with the message from the API
      if (!response.ok) {
        // Use the error message from the API response if available
        throw new Error(responseData.message || `API error: ${response.status}`);
      }
      
      return responseData;
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
      
      // Parse the response JSON regardless of status code
      const responseData = await response.json().catch(() => ({}));
      
      // If the response is not OK, throw an error with the message from the API
      if (!response.ok) {
        // Use the error message from the API response if available
        throw new Error(responseData.message || `API error: ${response.status}`);
      }
      
      return responseData;
    },
    
    /**
     * Validates the current authentication state
     * 
     * @returns {Promise<boolean>} - Whether the user is authenticated
     */
    validateAuth: async () => {
      return await validateAuth(true);
    }
  };
} 