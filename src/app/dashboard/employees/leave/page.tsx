'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { leaveService } from '@/services'
import LeaveRequestList from '@/modules/human-capital/components/leave/LeaveRequestList'
import NewLeaveRequestForm from '@/modules/human-capital/components/leave/NewLeaveRequestForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LeaveManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    if (!user) return
    try {
      const stats = await leaveService.getLeaveStatistics(
        user.role === 'hr_admin' || user.role === 'super_admin'
          ? undefined
          : user.id
      )
      setStats(stats)
    } catch (error) {
      console.error('Failed to load leave statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  if (authLoading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="section-title">Leave Management</h1>
        {!showNewRequestForm && (
          <button
            onClick={() => setShowNewRequestForm(true)}
            className="btn-primary"
          >
            New Leave Request
          </button>
        )}
      </div>

      {showNewRequestForm ? (
        <div className="card bg-white">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Leave Request</h2>
          <NewLeaveRequestForm
            currentUser={user}
            onRequestCreated={() => {
              setShowNewRequestForm(false)
              loadStats()
            }}
            onCancel={() => setShowNewRequestForm(false)}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="card bg-white">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              <>
                <div className="card bg-white">
                  <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="card bg-white">
                  <h3 className="text-lg font-medium text-gray-900">Approved</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="card bg-white">
                  <h3 className="text-lg font-medium text-gray-900">Rejected</h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
              </>
            )}
          </div>

          <div className="card bg-white">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Requests</h2>
            <LeaveRequestList
              currentUser={user}
              onUpdateRequest={() => loadStats()}
            />
          </div>
        </>
      )}
    </div>
  )
}

