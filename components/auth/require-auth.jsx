'use client'

import AuthGuard from './auth-guard'

/**
 * RequireAuth - Simple wrapper around AuthGuard that only requires authentication
 * 
 * This component is a convenience wrapper that only checks if the user is authenticated.
 * For more complex access control, use AuthGuard directly.
 */
export default function RequireAuth({ children }) {
    return (
        <AuthGuard requireAuth>
            {children}
        </AuthGuard>
    )
}