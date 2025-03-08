'use client'

import AuthOnboardingLayout from "@/components/layouts/auth-onboarding-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import Loader from "@/components/shared/loader";

export default function OnboardingLayout({ children }) {
    const pathname = usePathname();
    const { validateAuth, isLoading } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    
    // Determine which page we're on to set the appropriate guards
    const isCompanyInfoPage = pathname.includes('/auth/company-info');
    const isPaymentPage = pathname.includes('/auth/payment');
    
    // Verify authentication on mount
    useEffect(() => {
        async function verifyAuth() {
            // Use validateAuth instead of checkAuth to leverage the debouncing mechanism
            await validateAuth();
            setIsChecking(false);
        }
        
        verifyAuth();
    }, [validateAuth]);
    
    // Show loader while checking auth
    if (isChecking || isLoading) {
        return <Loader />;
    }
    
    return (
        <AuthGuard 
            requireAuth
            requireEmailVerified
            requireNoCompanyInfo={isCompanyInfoPage}
            requireCompanyInfo={isPaymentPage}
            requireNoSubscription={isPaymentPage}
        >
            <AuthOnboardingLayout>{children}</AuthOnboardingLayout>
        </AuthGuard>
    );
}