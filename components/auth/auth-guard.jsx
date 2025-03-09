'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
 * 5. Invited users bypass the company info and subscription steps
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
  const searchParams = useSearchParams()
  const { user, tokens, isAuthenticated, isLoading, isRefreshing, validateAuth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const authCheckRef = useRef(false)

  // Check if the user is accessing via an invitation link
  const isInvitationFlow = searchParams?.get('invitation')

  useEffect(() => {
    let mounted = true
    let authCheckAttempts = 0;
    const MAX_AUTH_CHECK_ATTEMPTS = 2; // Limit the number of auth check attempts
    
    // Prevent duplicate auth checks in the same render cycle
    if (authCheckRef.current) {
      return;
    }
    
    authCheckRef.current = true;
    
    async function verifyAccess() {
      try {
        // Special case: Allow access to sign-up page with invitation parameter
        if (isInvitationFlow && pathname.includes('/auth/sign-up')) {
          setIsChecking(false)
          return
        }
        
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
          
          // Verify with the server - use validateAuth instead of checkAuth
          const isValid = await validateAuth(true)
          
          if (!mounted) return
          
          if (!isValid) {
            // Redirect to login with the current URL as the return URL
            const returnUrl = encodeURIComponent(pathname)
            router.replace(`/auth/sign-in?returnUrl=${returnUrl}`)
            return
          }
        } else if (isAuthenticated && requireAuth) {
          // If already authenticated but we're on a protected route,
          // still validate the auth state to ensure it's current
          // But only do this if we haven't validated recently
          const lastValidated = useAuthStore.getState().lastValidated
          if (lastValidated) {
            const lastValidatedDate = new Date(lastValidated)
            const now = new Date()
            const timeSinceLastValidation = now - lastValidatedDate
            
            // If it's been more than 5 minutes since the last validation, validate again
            if (timeSinceLastValidation > 5 * 60 * 1000) {
              await validateAuth()
            }
          } else {
            await validateAuth()
          }
        }
        
        // Get the latest user data from the store after validation
        const currentUser = useAuthStore.getState().user
        const actualCurrentUser = currentUser?.user ? currentUser.user : currentUser
        
        // Check if email is verified
        const isEmailVerified = !!actualCurrentUser?.is_verified
        
        // Check if user was invited
        const isInvitedUser = !!actualCurrentUser?.is_invited
        
        // Check if user has a role (null role means onboarding is incomplete)
        const hasRole = !!actualCurrentUser?.role
        
        // Check if user is an admin (only if they have a role)
        const isAdmin = hasRole && actualCurrentUser.role.name === 'admin'
        
        // Check if user has company info
        const hasCompanyInfo = !!actualCurrentUser?.has_company_info
        
        // Check if user has an active subscription
        const hasActiveSubscription = 
          actualCurrentUser?.subscription_status === 'ACTIVE' || 
          actualCurrentUser?.subscription_status === 'TRIAL'
        
        // Determine if company info is required
        // Company info is required for admin users who weren't invited
        // For users with null roles, we assume they need company info if not invited
        const needsCompanyInfo = !isInvitedUser && !hasCompanyInfo && (hasRole ? isAdmin : true)
        
        // Determine if subscription is required
        // Subscription is required for admin users who weren't invited
        // For users with null roles, we assume they need subscription if not invited and they have company info
        const needsSubscription = !isInvitedUser && (hasRole ? isAdmin : hasCompanyInfo) && !hasActiveSubscription
        
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
          
          // Skip company info and payment steps for invited users
          if (!isInvitedUser) {
            // If user needs company info, redirect to company info page
            if (needsCompanyInfo) {
              console.log('[AuthGuard Rule 1] redirecting to company-info')
              router.replace('/auth/company-info')
              return
            }
            
            // If user needs subscription, redirect to payment page
            if (needsSubscription) {
              console.log('[AuthGuard Rule 1] redirecting to payment')
              router.replace('/auth/payment')
              return
            }
          }
          
          // If onboarding is complete, go to dashboard
          router.replace('/dashboard')
          return
        }
        
        // Rule 2: If page requires company info but user doesn't have it
        if (requireCompanyInfo && needsCompanyInfo) {
          console.log('[AuthGuard Rule 2] redirecting to company-info')
          router.replace('/auth/company-info')
          return
        }
        
        // Rule 3: If page requires no company info but user has it
        if (requireNoCompanyInfo && !needsCompanyInfo) {
          // If they have company info but need subscription, go to payment
          if (needsSubscription) {
            console.log('[AuthGuard Rule 3] redirecting to payment')
            router.replace('/auth/payment')
            return
          }
          
          // If they have both, go to dashboard
          router.replace('/dashboard')
          return
        }
        
        // Rule 4: If page requires subscription but user doesn't have it
        if (requireSubscription && needsSubscription) {
          console.log('[AuthGuard Rule 4] redirecting to payment')
          router.replace('/auth/payment')
          return
        }
        
        // Rule 5: If page requires no subscription but user has it
        if (requireNoSubscription && !needsSubscription && hasCompanyInfo) {
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
      } finally {
        authCheckRef.current = false;
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
    requireNoSubscription,
    validateAuth,
    isInvitationFlow
  ])
  
  // Show loader while checking access
  if (isChecking || isLoading || isRefreshing) {
    return <Loader />
  }
  
  // If we get here, the user is allowed to access the page
  return children
} 