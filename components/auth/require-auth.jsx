'use client'

import AuthGuard from './auth-guard'

/**
 * RequireAuth - Simple wrapper around AuthGuard that requires authentication and email verification
 * 
 * This component is a convenience wrapper that checks if the user is authenticated and has verified their email.
 * For more complex access control, use AuthGuard directly.
 * 
 * Note: This does NOT check for onboarding completion. For dashboard access, use DashboardGuard instead.
 */
export default function RequireAuth({ children }) {
    return (
        <AuthGuard 
            requireAuth
            requireEmailVerified
        >
            {children}
        </AuthGuard>
    )
}