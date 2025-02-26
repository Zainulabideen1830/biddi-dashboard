// frontend/store/auth-store.js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({}),
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to sign out');
          }

          // Clear the auth store state
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });

          // Clear all storage
          sessionStorage.clear(); // Clear all sessionStorage, not just auth-storage
          localStorage.clear(); // Clear localStorage as well if you're using it

          // Force clear cookies from the client side as well
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });

        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            credentials: 'include',
            // headers: {
            //   'Cache-Control': 'no-cache',
            //   'Pragma': 'no-cache'
            // }
          })
          
          if (response.ok) {
            const { user } = await response.json()
            set({ user, isAuthenticated: true, error: null })
            return true
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
      },

      // Add token refresh scheduling
      scheduleTokenRefresh: () => {
        // Refresh 1 minute before token expires
        const REFRESH_BUFFER = 60000 // 1 minute
        const TOKEN_LIFETIME = 14 * 60000 // 14 minutes (15min token - 1min buffer)
        
        const refreshInterval = setInterval(async () => {
          const { isAuthenticated } = get()
          if (isAuthenticated) {
            try {
              const refreshResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
                {
                  method: 'POST',
                  credentials: 'include'
                }
              )
              
              if (!refreshResponse.ok) {
                throw new Error('Failed to refresh token')
              }
              
              const { user } = await refreshResponse.json()
              set({ user, isAuthenticated: true, error: null })
            } catch (error) {
              console.error('Token refresh failed:', error)
              // Only clear auth if refresh explicitly failed
              if (error.message === 'Failed to refresh token') {
                set({ user: null, isAuthenticated: false, error: 'Session expired' })
              }
            }
          }
        }, TOKEN_LIFETIME)

        // Store interval ID for cleanup
        set({ refreshInterval: refreshInterval })
        
        // Cleanup on unmount
        return () => clearInterval(refreshInterval)
      },

      // Clean up refresh interval
      clearRefreshInterval: () => {
        const { refreshInterval } = get()
        if (refreshInterval) {
          clearInterval(refreshInterval)
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