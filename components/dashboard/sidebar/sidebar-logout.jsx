'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-toastify';

const SidebarLogout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { clearSession, logout } = useAuthStore();

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            
            await logout();

            clearSession();
            
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
        <Button variant="ghost" size="lg" className='px-3' onClick={handleSignOut}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Signing Out...
                </>
            ) : (
                <div className="flex justify-end items-center w-full h-full">
                    <LogOut className='!size-5 rotate-180' />
                </div>
            )}
        </Button>
    )
}

export default SidebarLogout