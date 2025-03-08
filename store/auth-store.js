// frontend/store/auth-store.js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Track if a refresh is already in progress to prevent multiple simultaneous refreshes
let isRefreshingToken = false
let refreshPromise = null

// Add tracking for auth validation to prevent duplicate calls
let isValidatingAuth = false
let validationPromise = null
let lastValidationTime = null
const VALIDATION_COOLDOWN = 2000 // 2 seconds cooldown between validations

// Add a request interceptor function
const createAuthFetch = (originalFetch) => async (url, options = {}) => {
  const authStore = useAuthStore.getState()
  const accessToken = authStore.tokens?.accessToken

  try {
    // Try the original request with the token in the Authorization header
    const headers = {
      ...options.headers,
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    }

    const response = await originalFetch(url, {
      ...options,
      headers
    })

    // If we get a 401, try to refresh the token
    if (response.status === 401) {
      // If we're already refreshing, wait for that to complete
      if (isRefreshingToken && refreshPromise) {
        try {
          // Wait for the existing refresh to complete
          const refreshSucceeded = await refreshPromise

          // If refresh succeeded, retry the original request
          if (refreshSucceeded) {
            const newAccessToken = useAuthStore.getState().tokens?.accessToken
            const newHeaders = {
              ...options.headers,
              ...(newAccessToken ? { 'Authorization': `Bearer ${newAccessToken}` } : {})
            }

            return originalFetch(url, {
              ...options,
              headers: newHeaders
            })
          } else {
            // If refresh failed, clear auth state
            authStore.clearAuth()
            throw new Error('Authentication failed')
          }
        } catch (refreshError) {
          authStore.clearAuth()
          throw new Error('Authentication failed during refresh')
        }
      } else {
        // Set refreshing state to true
        authStore.setRefreshing(true)

        // Start a new refresh
        isRefreshingToken = true
        refreshPromise = authStore.refreshToken()
          .finally(() => {
            isRefreshingToken = false
            refreshPromise = null
          })

        const refreshSuccess = await refreshPromise

        // Reset refreshing state
        authStore.setRefreshing(false)

        // If refresh succeeded, retry the original request
        if (refreshSuccess) {
          const newAccessToken = useAuthStore.getState().tokens?.accessToken
          const newHeaders = {
            ...options.headers,
            ...(newAccessToken ? { 'Authorization': `Bearer ${newAccessToken}` } : {})
          }

          return originalFetch(url, {
            ...options,
            headers: newHeaders
          })
        } else {
          // If refresh failed, clear auth state
          authStore.clearAuth()
          throw new Error('Authentication failed')
        }
      }
    }

    return response
  } catch (error) {
    // If there's a network error or other issue
    console.error('Request error:', error)
    throw error
  }
}

// Set up a timer for periodic validation
let authValidationTimer = null

// Function to set up periodic validation
const setupPeriodicValidation = (validateFn, interval = 5 * 60 * 1000) => {
  // Clear any existing timer
  if (authValidationTimer) {
    clearInterval(authValidationTimer)
  }
  
  // Set up new timer (default: check every 5 minutes)
  authValidationTimer = setInterval(validateFn, interval)
  
  // Return a cleanup function
  return () => {
    if (authValidationTimer) {
      clearInterval(authValidationTimer)
      authValidationTimer = null
    }
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      tokens: null, // Store both access and refresh tokens
      isAuthenticated: false,
      isLoading: false,
      isLoggingOut: false,
      isRefreshing: false,
      error: null,
      lastValidated: null, // Track when auth was last validated
      
      // User data (separate from auth state)
      user: null,

      // Set refreshing state
      setRefreshing: (isRefreshing) => set({ isRefreshing }),

      // Set tokens (authentication only)
      setTokens: (tokens) => {
        if (!tokens) {
          set({ tokens: null, isAuthenticated: false })
          return
        }
        
        set({ 
          tokens, 
          isAuthenticated: true,
          error: null
        })
      },
      
      // Update user data only (doesn't affect authentication state)
      updateUser: (userData) => {
        if (!userData) {
          set({ user: null })
          return
        }
        
        set({ user: userData })
      },

      // Token refresh function
      refreshToken: async () => {
        try {
          // If refresh is already in progress, return the existing promise
          if (isRefreshingToken && refreshPromise) {
            return refreshPromise
          }
          
          // Set refreshing state to true
          set({ isRefreshing: true })
          
          // Start a new refresh
          isRefreshingToken = true
          
          // Add a check to prevent infinite loops
          const refreshToken = get().tokens?.refreshToken;

          if (!refreshToken) {
            // console.error('No refresh token available');
            set({
              tokens: null,
              isAuthenticated: false,
              error: 'Session expired',
              isRefreshing: false
            });
            return false;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ refreshToken })
            }
          )

          if (!response.ok) {
            // Instead of throwing, handle the error gracefully
            // console.error('Failed to refresh token:', response.status);
            set({
              tokens: null,
              isAuthenticated: false,
              error: 'Session expired',
              isRefreshing: false
            });
            return false;
          }

          const data = await response.json()

          if (data.success && data.accessToken && data.refreshToken) {
            // Update tokens
            set({
              tokens: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
              },
              isAuthenticated: true,
              error: null,
              lastValidated: new Date().toISOString()
            })
            
            // If user data is returned, update it as well
            if (data.user) {
              set({ user: data.user })
            }
            
            return true;
          } else {
            console.error('No tokens returned from refresh');
            set({
              tokens: null,
              isAuthenticated: false,
              error: 'Session expired',
              isRefreshing: false
            });
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          set({
            tokens: null,
            isAuthenticated: false,
            error: 'Session expired',
            isRefreshing: false
          });
          return false;
        } finally {
          // Reset refreshing state
          set({ isRefreshing: false })
          isRefreshingToken = false
          refreshPromise = null
        }
      },

      // Create an authenticated fetch function that handles token refresh
      authFetch: (url, options) => {
        return createAuthFetch(fetch)(url, options)
      },

      // Initialize authentication with user data and tokens
      initAuth: (userData, authTokens) => {
        if (!userData || !authTokens) {
          console.error('Missing user data or tokens for authentication')
          return
        }
        
        set({
          user: userData,
          tokens: authTokens,
          isAuthenticated: true,
          error: null,
          lastValidated: new Date().toISOString()
        })
        
        // Set up periodic validation
        const cleanup = setupPeriodicValidation(() => {
          get().validateAuth()
        })
        
        // Return cleanup function
        return cleanup
      },
      
      // Clear authentication state only (preserve user data)
      clearAuth: () => {
        set({ 
          tokens: null, 
          isAuthenticated: false, 
          error: null 
        })
        
        // Clear periodic validation
        if (authValidationTimer) {
          clearInterval(authValidationTimer)
          authValidationTimer = null
        }
      },
      
      // Clear both authentication and user data
      clearSession: () => {
        set({ 
          user: null,
          tokens: null, 
          isAuthenticated: false, 
          error: null 
        })
        
        // Clear periodic validation
        if (authValidationTimer) {
          clearInterval(authValidationTimer)
          authValidationTimer = null
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Validate current authentication status
      validateAuth: async (force = false) => {
        const lastValidated = get().lastValidated
        const now = new Date()
        
        // Check if we're within the cooldown period
        if (lastValidationTime && !force) {
          const timeSinceLast = now - lastValidationTime
          if (timeSinceLast < VALIDATION_COOLDOWN) {
            console.log(`Skipping auth validation (cooldown: ${timeSinceLast}ms < ${VALIDATION_COOLDOWN}ms)`)
            return get().isAuthenticated
          }
        }
        
        // Skip validation if it was done recently (within the last minute) unless forced
        if (!force && lastValidated) {
          const lastValidatedDate = new Date(lastValidated)
          const timeSinceLastValidation = now - lastValidatedDate
          
          // If validated less than a minute ago, skip
          if (timeSinceLastValidation < 60 * 1000) {
            return get().isAuthenticated
          }
        }
        
        // If validation is already in progress, return the existing promise
        if (isValidatingAuth && validationPromise) {
          return validationPromise
        }
        
        // Update the last validation time
        lastValidationTime = now
        
        // Start a new validation
        isValidatingAuth = true
        validationPromise = get().checkAuth()
          .finally(() => {
            isValidatingAuth = false
            validationPromise = null
          })
        
        return validationPromise
      },

      // Check if the current authentication is valid
      checkAuth: async () => {
        try {
          // If validation is already in progress, return the existing promise
          if (isValidatingAuth && validationPromise && validationPromise !== true && validationPromise !== false) {
            return validationPromise
          }
          
          set({ isLoading: true, error: null })
          
          // Start a new validation
          isValidatingAuth = true
          
          const accessToken = get().tokens?.accessToken;

          if (!accessToken) {
            set({
              tokens: null,
              isAuthenticated: false,
              error: 'No access token available',
              isLoading: false
            });
            return false;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            
            // Make sure we're setting just the user data, not the entire response
            if (data.success && data.user) {
              set({ 
                user: data.user, 
                isAuthenticated: true, 
                error: null,
                lastValidated: new Date().toISOString()
              })
              return true
            }
          }

          // If me endpoint returns 401, try to refresh the token
          if (response.status === 401) {
            // If we're already refreshing, wait for that to complete
            if (isRefreshingToken && refreshPromise) {
              const refreshSucceeded = await refreshPromise
              return refreshSucceeded
            }

            // Otherwise, try to refresh the token
            return await get().refreshToken()
          }

          // If we get here, authentication failed
          set({
            tokens: null,
            isAuthenticated: false,
            error: 'Authentication failed',
            isLoading: false
          });
          return false
        } catch (error) {
          console.error('Check auth error:', error)
          set({
            error: error.message,
            isLoading: false
          });
          return false
        } finally {
          set({ isLoading: false })
          isValidatingAuth = false
          validationPromise = null
        }
      },

      logout: async () => {
        try {
          // Set loading state
          set({ isLoggingOut: true });

          const refreshToken = get().tokens?.refreshToken;

          // Then attempt to logout on the server
          if (refreshToken) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
              console.error('Logout failed on server, but proceeding with client logout');
            }
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Always clear the session on the client side, even if server logout fails
          get().clearSession();
          set({ isLoggingOut: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated from localStorage, validate the auth state
        if (state && state.isAuthenticated) {
          // Schedule validation to run after rehydration is complete
          setTimeout(() => {
            // Use a flag to prevent duplicate validations during initial load
            if (!isValidatingAuth) {
              state.validateAuth(true)
              
              // Set up periodic validation
              setupPeriodicValidation(() => {
                state.validateAuth()
              })
            }
          }, 0)
        }
      }
    }
  )
)

// For backward compatibility
useAuthStore.getState().setUser = (user, tokens) => {
  const store = useAuthStore.getState()
  
  if (tokens) {
    // If tokens are provided, update both user and tokens
    store.initAuth(user, tokens)
  } else if (user) {
    // If only user is provided, just update the user data
    // and preserve existing tokens
    store.updateUser(user)
  } else {
    // If neither is provided, clear the session
    store.clearSession()
  }
} 