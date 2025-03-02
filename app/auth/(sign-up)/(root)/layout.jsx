import AuthOnboardingLayout from "@/components/layouts/auth-onboarding-layout";
import AuthGuard from "@/components/auth/auth-guard";

export default function SignUpLayout({ children }) {
    return (
        <AuthGuard requireNoAuth>
            <AuthOnboardingLayout>{children}</AuthOnboardingLayout>
        </AuthGuard>
    )
}