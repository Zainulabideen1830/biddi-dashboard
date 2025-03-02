'use client'

import { Suspense } from 'react'
import DashboardGuard from '@/components/auth/dashboard-guard'
import Loader from '@/components/shared/loader'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'

const DashboardLayout = ({ children }) => {
  return (
    <DashboardGuard>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className='overflow-y-auto pt-6 pb-20'>
            <Suspense fallback={<Loader />}>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardGuard>
  )
}

export default DashboardLayout