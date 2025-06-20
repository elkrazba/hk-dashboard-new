import { useState, useEffect } from 'react'
import Link from 'next/link'
import { employeeService } from '@/services'
import { Employee } from '@/types'

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getAllEmployees()
        setEmployees(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employees')
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [])

  // Get unique departments for filter
  const departments = ['all', ...new Set(employees.map(emp => emp.department))]

  const filteredEmployees = selectedDepartment === 'all'
    ? employees
    : employees.filter(emp => emp.department === selectedDepartment)

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="section-title">Employee Directory</h1>
        <select
          className="input-field"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>
              {dept === 'all' ? 'All Departments' : dept}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <Link
            key={employee.id}
            href={`/dashboard/employees/${employee.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              {employee.users?.avatar_url ? (
                <img
                  src={employee.users.avatar_url}
                  alt={`${employee.users.first_name} ${employee.users.last_name}`}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    {employee.users?.first_name?.[0]}
                    {employee.users?.last_name?.[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  {employee.users?.first_name} {employee.users?.last_name}
                </h3>
                <p className="text-sm text-gray-500">{employee.position}</p>
                <p className="text-sm text-gray-500">{employee.department}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm">
                <span className="font-medium">Reports to: </span>
                {employee.reports_to?.users
                  ? `${employee.reports_to.users.first_name} ${employee.reports_to.users.last_name}`
                  : 'No manager'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status: </span>
                <span className={`capitalize ${
                  employee.status === 'active' ? 'text-green-600' :
                  employee.status === 'on_leave' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {employee.status.replace('_', ' ')}
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

