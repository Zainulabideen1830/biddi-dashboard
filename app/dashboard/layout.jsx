'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import RequireAuth from '@/components/auth/require-auth'
import Loader from '@/components/shared/loader'

const DashboardLayout = ({ children }) => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      const checkOnboardingStatus = async () => {
        try {
          if (user.hasCompanyInfo && user.subscription_status) {
            setIsChecking(false)
            return
          }

          if (!user.hasCompanyInfo) {
            router.replace('/onboarding/company-info')
            return
          }

          if (!user.subscription_status) {
            router.replace('/onboarding/payment')
            return
          }

          setIsChecking(false)
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          router.replace('/auth/sign-in')
        }
      }
      
      checkOnboardingStatus()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || !user) {
    return <RequireAuth>{children}</RequireAuth>
  }

  if (isChecking) {
    return <Loader />
  }

  return <div>{children}</div>
}

export default DashboardLayout