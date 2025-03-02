'use client'

import AuthOnboardingLayout from "@/components/layouts/auth-onboarding-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { usePathname } from "next/navigation";

export default function OnboardingLayout({ children }) {
    const pathname = usePathname();
    
    // Determine which page we're on to set the appropriate guards
    const isCompanyInfoPage = pathname.includes('/auth/company-info');
    const isPaymentPage = pathname.includes('/auth/payment');
    
    return (
        <AuthGuard 
            requireAuth
            requireNoCompanyInfo={isCompanyInfoPage}
            requireCompanyInfo={isPaymentPage}
            requireNoSubscription={isPaymentPage}
        >
            <AuthOnboardingLayout>{children}</AuthOnboardingLayout>
        </AuthGuard>
    );
}