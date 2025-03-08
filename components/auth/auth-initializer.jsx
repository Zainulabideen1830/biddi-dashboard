'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

/**
 * AuthInitializer - Initializes and validates authentication state on app load
 * 
 * This component should be placed high in the component tree, ideally in the root layout
 * It ensures that the authentication state is validated when the app loads and sets up
 * periodic validation to keep the auth state in sync with the server.
 */
export default function AuthInitializer({ children }) {
  const { isAuthenticated, validateAuth } = useAuthStore()
  
  useEffect(() => {
    // If the user is authenticated according to localStorage,
    // validate their authentication status immediately
    if (isAuthenticated) {
      validateAuth(true)
    }
    
    // No need to set up periodic validation here as it's handled in the store
  }, [isAuthenticated, validateAuth])
  
  return children
} 