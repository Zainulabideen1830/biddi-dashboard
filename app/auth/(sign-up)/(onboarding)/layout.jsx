import RequireAuth from "@/components/auth/require-auth";
import AuthOnboardingLayout from "@/components/layouts/auth-onboarding-layout";

export default function SignUpLayout({ children }) {
    return (
        <RequireAuth>
            <AuthOnboardingLayout>{children}</AuthOnboardingLayout>
        </RequireAuth>
    )
}