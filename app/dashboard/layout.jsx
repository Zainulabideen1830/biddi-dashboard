'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import RequireAuth from '@/components/auth/require-auth'
import Loader from '@/components/shared/loader'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
const DashboardLayout = ({ children }) => {
  return (
    <RequireAuth>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className='overflow-y-auto'>
            <Suspense fallback={<Loader />}>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  )
}

export default DashboardLayout