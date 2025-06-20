import { useState, useEffect } from 'react'
import { LeaveRequest, User } from '@/types'
import { leaveService } from '@/services'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface LeaveRequestListProps {
  currentUser: User
  onUpdateRequest?: (request: LeaveRequest) => void
}

export default function LeaveRequestList({ currentUser, onUpdateRequest }: LeaveRequestListProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRequests = async () => {
      try {
        // If HR admin or super admin, get all requests, otherwise get only user's requests
        const data = await leaveService.getLeaveRequests(
          currentUser.role === 'hr_admin' || currentUser.role === 'super_admin'
            ? undefined
            : currentUser.id
        )
        setRequests(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leave requests')
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [currentUser])

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const updatedRequest = await leaveService.updateLeaveRequest(requestId, {
        status,
        approved_by: currentUser.id
      })
      setRequests(requests.map(req => 
        req.id === updatedRequest.id ? updatedRequest : req
      ))
      onUpdateRequest?.(updatedRequest)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No leave requests found.
        </div>
      ) : (
        requests.map(request => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {request.employee?.users?.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={request.employee.users.avatar_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        {request.employee?.users?.first_name?.[0]}
                        {request.employee?.users?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {request.employee?.users?.first_name} {request.employee?.users?.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {request.employee?.position} • {request.employee?.department}
                  </p>
                </div>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}
              `}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Leave Type:</span>{' '}
                {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)}
              </div>
              <div>
                <span className="font-medium">Duration:</span>{' '}
                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
              </div>
              {request.reason && (
                <div className="col-span-2">
                  <span className="font-medium">Reason:</span>{' '}
                  {request.reason}
                </div>
              )}
            </div>

            {request.status === 'pending' &&
              (currentUser.role === 'hr_admin' || currentUser.role === 'super_admin') && (
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => handleStatusUpdate(request.id, 'rejected')}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(request.id, 'approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

