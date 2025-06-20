import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { employeeService, userService } from '@/services'
import { Employee, User } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface EmployeeProfileProps {
  employeeId: string
  canEdit: boolean
}

export default function EmployeeProfile({ employeeId, canEdit }: EmployeeProfileProps) {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const data = await employeeService.getEmployee(employeeId)
        setEmployee(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employee')
      } finally {
        setLoading(false)
      }
    }

    loadEmployee()
  }, [employeeId])

  const handleUpdate = async (updates: Partial<Employee>) => {
    if (!employee) return

    try {
      const updatedEmployee = await employeeService.updateEmployee(employee.id, updates)
      setEmployee(updatedEmployee)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">{error}</div>
  if (!employee) return <div>Employee not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Back
          </button>
          <h1 className="section-title">Employee Profile</h1>
        </div>
        {canEdit && (
          <button
            className="btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center space-x-4">
          {employee.users?.avatar_url ? (
            <img
              src={employee.users.avatar_url}
              alt={`${employee.users.first_name} ${employee.users.last_name}`}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-2xl">
                {employee.users?.first_name?.[0]}
                {employee.users?.last_name?.[0]}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {employee.users?.first_name} {employee.users?.last_name}
            </h2>
            <p className="text-lg text-gray-600">{employee.position}</p>
            <p className="text-gray-500">{employee.department}</p>
          </div>
        </div>

        {isEditing ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleUpdate({
                position: formData.get('position') as string,
                department: formData.get('department') as string,
                status: formData.get('status') as Employee['status'],
              })
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                name="position"
                defaultValue={employee.position}
                className="input-field mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                name="department"
                defaultValue={employee.department}
                className="input-field mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                defaultValue={employee.status}
                className="input-field mt-1 w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
              <p>{employee.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p>{employee.users?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Hire Date</h3>
              <p>{new Date(employee.hire_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className={`capitalize ${
                employee.status === 'active' ? 'text-green-600' :
                employee.status === 'on_leave' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {employee.status.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

