'use client'

import AuthOnboardingLayout from "@/components/layouts/auth-onboarding-layout";
import RequireAuth from "@/components/auth/require-auth";

export default function OnboardingLayout({ children }) {
    return (
        <RequireAuth>
            <AuthOnboardingLayout>{children}</AuthOnboardingLayout>
        </RequireAuth>
    );
}