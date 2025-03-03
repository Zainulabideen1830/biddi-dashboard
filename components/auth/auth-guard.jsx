'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import Loader from '../shared/loader'

/**
 * AuthGuard - Controls access to authentication and onboarding pages
 * 
 * This component implements the following rules:
 * 1. If a user is not authenticated, they can access sign-in and sign-up pages
 * 2. If a user is authenticated but hasn't verified their email, they can only access sign-up pages
 * 3. If a user is authenticated and has verified their email but hasn't completed onboarding, they can access onboarding pages
 * 4. If a user is authenticated and has completed onboarding, they are redirected to dashboard
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render if access is allowed
 * @param {boolean} props.requireAuth - Whether the page requires authentication
 * @param {boolean} props.requireNoAuth - Whether the page requires NO authentication (sign-in/sign-up)
 * @param {boolean} props.requireEmailVerified - Whether the page requires email verification
 * @param {boolean} props.requireCompanyInfo - Whether the page requires company info to be completed
 * @param {boolean} props.requireNoCompanyInfo - Whether the page requires company info to NOT be completed
 * @param {boolean} props.requireSubscription - Whether the page requires an active subscription
 * @param {boolean} props.requireNoSubscription - Whether the page requires NO active subscription
 */
export default function AuthGuard({ 
  children,
  requireAuth = false,
  requireNoAuth = false,
  requireEmailVerified = false,
  requireCompanyInfo = false,
  requireNoCompanyInfo = false,
  requireSubscription = false,
  requireNoSubscription = false
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, tokens, isAuthenticated, isLoading, isRefreshing, checkAuth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  

  useEffect(() => {
    let mounted = true
    let authCheckAttempts = 0;
    const MAX_AUTH_CHECK_ATTEMPTS = 2; // Limit the number of auth check attempts
    
    async function verifyAccess() {
      try {
        // First check if we need to verify authentication
        if (!isAuthenticated && requireAuth) {
          // Prevent infinite loops by limiting auth check attempts
          if (authCheckAttempts >= MAX_AUTH_CHECK_ATTEMPTS) {
            console.warn('Maximum auth check attempts reached, redirecting to login');
            const returnUrl = encodeURIComponent(pathname);
            router.replace(`/auth/sign-in?returnUrl=${returnUrl}`);
            return;
          }
          
          authCheckAttempts++;
          
          // Check if we have tokens
          if (!tokens || !tokens.accessToken) {
            // No tokens, redirect to login
            const returnUrl = encodeURIComponent(pathname)
            router.replace(`/auth/sign-in?returnUrl=${returnUrl}`)
            return
          }
          
          // Verify with the server
          const isValid = await checkAuth()
          
          if (!mounted) return
          
          if (!isValid) {
            // Redirect to login with the current URL as the return URL
            const returnUrl = encodeURIComponent(pathname)
            router.replace(`/auth/sign-in?returnUrl=${returnUrl}`)
            return
          }
        }
        
        // Get the latest user data from the store after checkAuth
        const currentUser = useAuthStore.getState().user
        const actualCurrentUser = currentUser?.user ? currentUser.user : currentUser
        
        // Check if email is verified
        const isEmailVerified = !!actualCurrentUser?.is_verified
        
        // Re-check helper functions with the latest user data
        const currentHasCompanyInfo = !!actualCurrentUser?.has_company_info
        const currentHasActiveSubscription = 
          actualCurrentUser?.subscription_status === 'ACTIVE' || 
          actualCurrentUser?.subscription_status === 'TRIAL'
        
        // Now apply the access rules
        
        // Rule 0: If page requires email verification but user's email is not verified
        if (requireEmailVerified && !isEmailVerified && isAuthenticated) {
          router.replace('/auth/sign-up')
          return
        }
        
        // Rule 1: If page requires no auth but user is authenticated
        if (requireNoAuth && isAuthenticated) {
          // If email is not verified, allow access to sign-up page
          if (!isEmailVerified && pathname.includes('/auth/sign-up')) {
            setIsChecking(false)
            return
          }
          
          // Redirect based on onboarding status
          if (!isEmailVerified) {
            router.replace('/auth/sign-up')
            return
          }
          
          if (!currentHasCompanyInfo) {
            router.replace('/auth/company-info')
            return
          }
          
          if (!currentHasActiveSubscription) {
            router.replace('/auth/payment')
            return
          }
          
          // If onboarding is complete, go to dashboard
          router.replace('/dashboard')
          return
        }
        
        // Rule 2: If page requires company info but user doesn't have it
        if (requireCompanyInfo && !currentHasCompanyInfo) {
          router.replace('/auth/company-info')
          return
        }
        
        // Rule 3: If page requires no company info but user has it
        if (requireNoCompanyInfo && currentHasCompanyInfo) {
          // If they have company info but no subscription, go to payment
          if (!currentHasActiveSubscription) {
            router.replace('/auth/payment')
            return
          }
          
          // If they have both, go to dashboard
          router.replace('/dashboard')
          return
        }
        
        // Rule 4: If page requires subscription but user doesn't have it
        if (requireSubscription && !currentHasActiveSubscription) {
          router.replace('/auth/payment')
          return
        }
        
        // Rule 5: If page requires no subscription but user has it
        if (requireNoSubscription && currentHasActiveSubscription) {
          router.replace('/dashboard')
          return
        }
        
        // If we get here, the user is allowed to access the page
        setIsChecking(false)
      } catch (error) {
        console.error('Auth guard error:', error)
        if (mounted) {
          // On error, allow access and let the page handle any issues
          setIsChecking(false)
        }
      }
    }
    
    verifyAccess()
    
    return () => {
      mounted = false
    }
  }, [
    isAuthenticated, 
    tokens,
    user, 
    pathname, 
    requireAuth,
    requireNoAuth,
    requireEmailVerified,
    requireCompanyInfo,
    requireNoCompanyInfo,
    requireSubscription,
    requireNoSubscription
  ])
  
  // Show loader while checking access
  if (isChecking || isLoading || isRefreshing) {
    return <Loader />
  }
  
  // If we get here, the user is allowed to access the page
  return children
} 