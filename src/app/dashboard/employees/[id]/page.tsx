'use client'

import EmployeeProfile from '@/modules/human-capital/components/EmployeeProfile'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EmployeeProfilePage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const canEdit = user?.role === 'super_admin' || user?.role === 'hr_admin'

  return <EmployeeProfile employeeId={id} canEdit={canEdit} />
}

