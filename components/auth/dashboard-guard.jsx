'use client'

import AuthGuard from './auth-guard'

/**
 * DashboardGuard - Protects dashboard routes
 * 
 * This component ensures that only authenticated users with:
 * 1. Verified email
 * 2. Completed company info (admin users only, not required for invited users)
 * 3. Active subscription (admin users only, not required for invited users)
 * can access dashboard pages.
 * 
 * Note: Users who joined via invitation already have company info and don't need to complete onboarding.
 * The is_invited field is used to identify these users and exempt them from company info and subscription requirements.
 */
export default function DashboardGuard({ children }) {
    return (
        <AuthGuard 
            requireAuth 
            requireEmailVerified
            requireCompanyInfo 
            requireSubscription
        >
            {children}
        </AuthGuard>
    )
} 