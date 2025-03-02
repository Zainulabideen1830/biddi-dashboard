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
 * 2. If a user is authenticated but hasn't completed onboarding, they can access onboarding pages
 * 3. If a user is authenticated and has completed onboarding, they are redirected to dashboard
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render if access is allowed
 * @param {boolean} props.requireAuth - Whether the page requires authentication
 * @param {boolean} props.requireNoAuth - Whether the page requires NO authentication (sign-in/sign-up)
 * @param {boolean} props.requireCompanyInfo - Whether the page requires company info to be completed
 * @param {boolean} props.requireNoCompanyInfo - Whether the page requires company info to NOT be completed
 * @param {boolean} props.requireSubscription - Whether the page requires an active subscription
 * @param {boolean} props.requireNoSubscription - Whether the page requires NO active subscription
 */
export default function AuthGuard({ 
  children,
  requireAuth = false,
  requireNoAuth = false,
  requireCompanyInfo = false,
  requireNoCompanyInfo = false,
  requireSubscription = false,
  requireNoSubscription = false
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, isRefreshing, checkAuth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  
  // Get the actual user object, handling both flat and nested structures
  const actualUser = user?.user ? user.user : user

  // Helper functions to check user state
  const hasCompanyInfo = () => !!actualUser?.has_company_info
  const hasActiveSubscription = () => 
    actualUser?.subscription_status === 'ACTIVE' || 
    actualUser?.subscription_status === 'TRIAL'

  useEffect(() => {
    let mounted = true
    
    async function verifyAccess() {
      try {
        // First check if we need to verify authentication
        if (!isAuthenticated && requireAuth) {
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
        
        // Now apply the access rules
        
        // Rule 1: If page requires no auth but user is authenticated
        if (requireNoAuth && isAuthenticated) {
          // Redirect based on onboarding status
          if (!hasCompanyInfo()) {
            router.replace('/auth/company-info')
            return
          }
          
          if (!hasActiveSubscription()) {
            router.replace('/auth/payment')
            return
          }
          
          // If onboarding is complete, go to dashboard
          router.replace('/dashboard')
          return
        }
        
        // Rule 2: If page requires company info but user doesn't have it
        if (requireCompanyInfo && !hasCompanyInfo()) {
          router.replace('/auth/company-info')
          return
        }
        
        // Rule 3: If page requires no company info but user has it
        if (requireNoCompanyInfo && hasCompanyInfo()) {
          // If they have company info but no subscription, go to payment
          if (!hasActiveSubscription()) {
            router.replace('/auth/payment')
            return
          }
          
          // If they have both, go to dashboard
          router.replace('/dashboard')
          return
        }
        
        // Rule 4: If page requires subscription but user doesn't have it
        if (requireSubscription && !hasActiveSubscription()) {
          router.replace('/auth/payment')
          return
        }
        
        // Rule 5: If page requires no subscription but user has it
        if (requireNoSubscription && hasActiveSubscription()) {
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
    user, 
    pathname, 
    requireAuth,
    requireNoAuth,
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