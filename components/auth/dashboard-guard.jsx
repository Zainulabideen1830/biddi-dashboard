'use client'

import AuthGuard from './auth-guard'

/**
 * DashboardGuard - Protects dashboard routes by ensuring the user has completed onboarding
 * 
 * This component checks if the user has completed all required onboarding steps:
 * 1. User must be authenticated
 * 2. User must have company info
 * 3. User must have a subscription
 * 
 * If any of these conditions are not met, the user is redirected to the appropriate onboarding step.
 */
export default function DashboardGuard({ children }) {
    return (
        <AuthGuard 
            requireAuth 
            requireCompanyInfo 
            requireSubscription
        >
            {children}
        </AuthGuard>
    )
} 