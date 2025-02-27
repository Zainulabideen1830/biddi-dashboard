// /app/auth/(sign-up)/verify-email/page.jsx

"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { useAuthStore } from '@/store/auth-store'

const VerifyEmail = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [verificationStatus, setVerificationStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
    const { setUser, checkAuth } = useAuthStore()

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token')
            if (!token) {
                setVerificationStatus('error')
                toast.error('Invalid verification link')
                return
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${token}`,
                    {
                        credentials: 'include'
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error)
                }

                // Update auth store and verify session is active
                setUser(data.user)
                await checkAuth()
                
                setVerificationStatus('success')
                toast.success('Email verified successfully!')
                
                // Redirect after ensuring auth state is updated
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1000)
            } catch (error) {
                setVerificationStatus('error')
                toast.error(error.message || 'Verification failed')
            }
        }

        verifyEmail()
    }, [searchParams, router, setUser, checkAuth])

    if (verificationStatus === 'verifying') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p>Verifying your email...</p>
                </div>
            </div>
        )
    }

    if (verificationStatus === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
                    <p>Redirecting you to complete your account setup...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
                <p>The verification link is invalid or has expired.</p>
                <button 
                    onClick={() => router.push('/auth/sign-in')}
                    className="text-primary hover:underline"
                >
                    Return to Sign In
                </button>
            </div>
        </div>
    )
}

export default VerifyEmail