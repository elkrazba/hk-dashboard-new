import { useState, useEffect } from 'react'
import { User, Employee } from '@/types'
import { performanceService, employeeService } from '@/services'

interface NewReviewFormProps {
  currentUser: User
  onReviewCreated: () => void
  onCancel: () => void
}

export default function NewReviewForm({
  currentUser,
  onReviewCreated,
  onCancel
}: NewReviewFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [reviewDate, setReviewDate] = useState('')

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getAllEmployees()
        setEmployees(data)
      } catch (err) {
        setError('Failed to load employees')
      }
    }

    loadEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEmployee || !reviewDate) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await performanceService.createPerformanceReview({
        employee_id: selectedEmployee,
        reviewer_id: currentUser.id,
        review_date: reviewDate,
        status: 'scheduled'
      })
      onReviewCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule review')
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1) // Schedule at least 1 day in advance
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
          Employee
        </label>
        <select
          id="employee"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="mt-1 block w-full input-field"
          required
        >
          <option value="">Select an employee</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.users?.first_name} {employee.users?.last_name} - {employee.position}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="review_date" className="block text-sm font-medium text-gray-700">
          Review Date
        </label>
        <input
          type="date"
          id="review_date"
          value={reviewDate}
          onChange={(e) => setReviewDate(e.target.value)}
          min={minDateString}
          className="mt-1 block w-full input-field"
          required
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !selectedEmployee || !reviewDate}
        >
          {loading ? 'Scheduling...' : 'Schedule Review'}
        </button>
      </div>
    </form>
  )
}

