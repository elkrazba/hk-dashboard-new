import { useState, useEffect } from 'react'
import { employeeService } from '@/services'
import { Employee } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getAllEmployees()
        setEmployees(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employee data')
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">{error}</div>

  // Calculate metrics
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => emp.status === 'active').length
  const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length
  
  // Get department distribution
  const departmentCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <h1 className="section-title">HR Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-900">Total Employees</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{totalEmployees}</p>
        </div>
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-900">Active Employees</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{activeEmployees}</p>
        </div>
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-900">On Leave</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{onLeaveEmployees}</p>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="card bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Distribution</h3>
        <div className="space-y-4">
          {Object.entries(departmentCounts).map(([department, count]) => (
            <div key={department} className="flex items-center">
              <div className="w-48 text-sm font-medium text-gray-900">{department}</div>
              <div className="flex-1">
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-primary-600 rounded-full"
                    style={{
                      width: `${(count / totalEmployees) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm font-medium text-gray-900">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-4">
          {employees
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5)
            .map(employee => (
              <div key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {employee.users?.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={employee.users.avatar_url}
                        alt=""
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {employee.users?.first_name?.[0]}
                          {employee.users?.last_name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.users?.first_name} {employee.users?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(employee.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

