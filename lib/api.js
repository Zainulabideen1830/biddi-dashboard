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
  
  // If authentication is required, check token validity and refresh if needed
  if (requiresAuth && authStore.isAuthenticated) {
    // Check if token is expired or about to expire
    const accessToken = authStore.tokens?.accessToken;
    
    if (accessToken) {
      try {
        // Check if token is expired or about to expire (within 30 seconds)
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeToExpiry = expiryTime - currentTime;
        
        // If token is expired or about to expire (less than 30 seconds), refresh it silently
        if (timeToExpiry < 30000) {
          console.log('Token is about to expire, refreshing silently...');
          await authStore.refreshToken(true);
        } 
        // If it's been more than 5 minutes since the last validation, validate auth state silently
        else {
          const lastValidated = authStore.lastValidated;
          if (lastValidated) {
            const lastValidatedDate = new Date(lastValidated);
            const timeSinceLastValidation = currentTime - lastValidatedDate;
            
            if (timeSinceLastValidation > 5 * 60 * 1000) {
              await authStore.validateAuth(false, true);
            }
          } else {
            await authStore.validateAuth(false, true);
          }
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
        // If we can't parse the token, try to refresh it silently
        await authStore.refreshToken(true);
      }
    }
  }
  
  // Get the access token from the auth store (which might have been refreshed)
  const accessToken = authStore.tokens?.accessToken;
  
  // Set up the request options
  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(requiresAuth && accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    }
  };
  
  try {
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Handle 401 errors (token expired) by refreshing the token and retrying
    if (response.status === 401 && requiresAuth && !options.isRetry) {
      console.log('Received 401, attempting to refresh token and retry silently');
      
      // Try to refresh the token silently
      const refreshSuccess = await authStore.refreshToken(true);
      
      if (refreshSuccess) {
        // If refresh succeeded, retry the request with the new token
        console.log('Token refreshed successfully, retrying request');
        return apiCall(url, { ...options, isRetry: true });
      } else {
        // If refresh failed, throw an error
        throw new Error('Authentication failed');
      }
    }
    
    // Parse the response
    const data = await response.json();
    
    // If the response includes onboarding status, update the user data
    if (data.onboardingStatus && data.user) {
      // Merge onboarding status with user data
      const enhancedUser = {
        ...data.user,
        onboardingStatus: data.onboardingStatus
      };
      
      // Update the user data in the auth store
      authStore.updateUser(enhancedUser);
    } else if (data.user) {
      // If there's user data but no onboarding status, calculate it
      const user = data.user;
      const hasRole = !!user.role;
      const hasCompanyInfo = !!user.has_company_info;
      const hasSubscription = user.subscription_status === 'ACTIVE' || user.subscription_status === 'TRIAL';
      const isInvited = !!user.is_invited;
      
      const onboardingStatus = {
        isComplete: isInvited || (hasRole && hasCompanyInfo && hasSubscription),
        needsCompanyInfo: !isInvited && !hasCompanyInfo,
        needsSubscription: !isInvited && hasCompanyInfo && !hasSubscription
      };
      
      // Merge onboarding status with user data
      const enhancedUser = {
        ...user,
        onboardingStatus
      };
      
      // Update the user data in the auth store
      authStore.updateUser(enhancedUser);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
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
      
      // apiCall already returns the parsed JSON data, not the response object
      return response;
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
      
      // apiCall already returns the parsed JSON data, not the response object
      return response;
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
      
      // apiCall already returns the parsed JSON data, not the response object
      return response;
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
      
      // apiCall already returns the parsed JSON data, not the response object
      return response;
    },
    
    /**
     * Validates the current authentication state
     * 
     * @param {boolean} force - Whether to force validation even if recently validated
     * @param {boolean} silent - Whether to perform a silent validation without UI changes
     * @returns {Promise<boolean>} - Whether the user is authenticated
     */
    validateAuth: async (force = true, silent = true) => {
      return await validateAuth(force, silent);
    }
  };
} 