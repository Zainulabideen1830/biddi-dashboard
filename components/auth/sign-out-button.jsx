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
    const { clearUser, logout } = useAuthStore();

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            
            await logout();
            
            // Force a complete page reload and redirect
            if (typeof window !== 'undefined') {
                // Clear any query parameters and force reload
                window.location.replace('/auth/sign-in');
            }
            
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
            console.error('Sign out error:', error);
        } finally {
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