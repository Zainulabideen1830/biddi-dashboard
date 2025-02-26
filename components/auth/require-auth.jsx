'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import Loader from '../shared/loader'

export default function RequireAuth({ children }) {
    const router = useRouter()
    const { 
        user, 
        isAuthenticated,
        isLoading: storeLoading,
        checkAuth,
        scheduleTokenRefresh,
        clearRefreshInterval
    } = useAuthStore()
    const [isChecking, setIsChecking] = useState(true)
    
    useEffect(() => {
        let mounted = true
        
        async function verifyAuthentication() {
            try {
                const isValid = await checkAuth()
                
                if (mounted) {
                    if (!isValid) {
                        router.replace(`/auth/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`)
                    } else {
                        scheduleTokenRefresh()
                        setIsChecking(false)
                    }
                }
            } catch (error) {
                console.error('Auth verification error:', error)
                if (mounted) {
                    router.replace('/auth/sign-in')
                }
            }
        }
        
        verifyAuthentication()
        
        return () => {
            mounted = false
            clearRefreshInterval()
        }
    }, []) // Remove dependencies to ensure single check
    
    if (isChecking || storeLoading) {
        return <Loader />
    }
    
    if (!isAuthenticated || !user) {
        return null
    }
    
    return children
}