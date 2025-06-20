'use client'

import { ReactNode } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}

