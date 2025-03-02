// frontend/store/auth-store.js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Track if a refresh is already in progress to prevent multiple simultaneous refreshes
let isRefreshingToken = false
let refreshPromise = null

// Add a request interceptor function
const createAuthFetch = (originalFetch) => async (url, options = {}) => {
  const authStore = useAuthStore.getState()
  
  try {
    // Try the original request
    const response = await originalFetch(url, {
      ...options,
      credentials: 'include',
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
            return originalFetch(url, {
              ...options,
              credentials: 'include',
            })
          } else {
            // If refresh failed, clear auth state
            authStore.clearUser()
            throw new Error('Authentication failed')
          }
        } catch (refreshError) {
          authStore.clearUser()
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
          return originalFetch(url, {
            ...options,
            credentials: 'include',
          })
        } else {
          // If refresh failed, clear auth state
          authStore.clearUser()
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

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isRefreshing: false, // Add state for tracking token refresh
      error: null,
      
      // Set refreshing state
      setRefreshing: (isRefreshing) => set({ isRefreshing }),
      
      // Replace the refresh interval mechanism with a token refresh function
      refreshToken: async () => {
        try {
          // Set refreshing state to true
          set({ isRefreshing: true })
          
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
            {
              method: 'POST',
              credentials: 'include'
            }
          )
          
          if (!response.ok) {
            throw new Error('Failed to refresh token')
          }
          
          const data = await response.json()
          
          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, error: null })
            return true
          } else {
            throw new Error('No user data returned from refresh')
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          set({ user: null, isAuthenticated: false, error: 'Session expired' })
          return false
        } finally {
          // Reset refreshing state
          set({ isRefreshing: false })
        }
      },
      
      // Create an authenticated fetch function that handles token refresh
      authFetch: (url, options) => {
        return createAuthFetch(fetch)(url, options)
      },
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      clearUser: () => set({ user: null, isAuthenticated: false, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      logout: async () => {
        try {
          // Set loading state
          set({ isLoading: true });
          
          // Then attempt to logout on the server
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({}),
            credentials: 'include'
          });

          if (!response.ok) {
            console.error('Server logout failed, but continuing with client logout');
          }

          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });

          // Clear all storage regardless of server response
          if (typeof window !== 'undefined') {
            sessionStorage.clear();
            localStorage.clear();
            
            // Force clear cookies from the client side as well
            document.cookie.split(";").forEach((c) => {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
          }
          
          return true;
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear the state even if there's an error
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: 'Logout failed, but session was cleared locally' 
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            credentials: 'include'
          })
          
          if (response.ok) {
            const data = await response.json()
            // Make sure we're setting just the user data, not the entire response
            if (data.success && data.user) {
              set({ user: data.user, isAuthenticated: true, error: null })
              return true
            }
          }
          
          // If me endpoint returns 401, try to refresh the token
          if (response.status === 401) {
            // If we're already refreshing, wait for that to complete
            if (isRefreshingToken && refreshPromise) {
              return await refreshPromise
            }
            
            // Set refreshing to true before refresh attempt
            set({ isRefreshing: true })
            
            // Start a new refresh
            isRefreshingToken = true
            refreshPromise = get().refreshToken()
              .finally(() => {
                isRefreshingToken = false
                refreshPromise = null
                set({ isRefreshing: false })
              })
            
            return await refreshPromise
          }
          
          // Clear auth state if check fails
          set({ user: null, isAuthenticated: false, error: 'Authentication failed' })
          return false
        } catch (error) {
          console.error('Auth check error:', error)
          set({ user: null, isAuthenticated: false, error: error.message })
          return false
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
) 