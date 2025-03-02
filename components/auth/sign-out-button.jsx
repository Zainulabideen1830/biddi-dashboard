'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-toastify';

const SignOutButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleSignOut = async () => {
        try {
            // Prevent multiple clicks
            if (isLoading) return;
            
            setIsLoading(true);
            
            // Call the logout function from auth store
            const success = await logout();
            
            // Clear any client-side cookies
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // Clear storage
            if (typeof window !== 'undefined') {
                sessionStorage.clear();
                localStorage.clear();
                
                // Use a small timeout to ensure state is cleared before redirect
                setTimeout(() => {
                    // Force a hard redirect to the sign-in page
                    window.location.href = '/auth/sign-in';
                }, 100);
            }
            
        } catch (error) {
            toast.error('Failed to sign out. Please try again.');
            console.error('Sign out error:', error);
            setIsLoading(false);
        }
    }

    return (
        <Button onClick={handleSignOut} className='mt-4' disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Signing Out...
                </>
            ) : (
                "Sign Out"
            )}
        </Button>
    )
}

export default SignOutButton