import { useState, useEffect } from 'react'
import { LeaveType, User } from '@/types'
import { leaveService } from '@/services'

interface NewLeaveRequestFormProps {
  currentUser: User
  onRequestCreated: () => void
  onCancel: () => void
}

export default function NewLeaveRequestForm({
  currentUser,
  onRequestCreated,
  onCancel
}: NewLeaveRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveType, setLeaveType] = useState<LeaveType | ''>('')

  const validateDates = () => {
    if (!startDate || !endDate) return true
    const start = new Date(startDate)
    const end = new Date(endDate)
    return start <= end
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateDates()) {
      setError('End date must be after start date')
      return
    }

    if (!leaveType) {
      setError('Please select a leave type')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      employee_id: currentUser.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: formData.get('reason') as string
    }

    try {
      await leaveService.createLeaveRequest(data)
      onRequestCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leave request')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      const isValid = validateDates()
      if (!isValid) {
        setError('End date must be after start date')
      } else {
        setError(null)
      }
    }
  }, [startDate, endDate])

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700">
          Leave Type
        </label>
        <select
          id="leave_type"
          name="leave_type"
          required
          className="mt-1 block w-full input-field"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
        >
          <option value="">Select a leave type</option>
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal Leave</option>
          <option value="maternity">Maternity Leave</option>
          <option value="paternity">Paternity Leave</option>
          <option value="bereavement">Bereavement</option>
          <option value="unpaid">Unpaid Leave</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            className={`mt-1 block w-full input-field ${
              !validateDates() ? 'border-red-300' : ''
            }`}
            min={today}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              if (endDate && new Date(e.target.value) > new Date(endDate)) {
                setEndDate(e.target.value)
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            required
            className={`mt-1 block w-full input-field ${
              !validateDates() ? 'border-red-300' : ''
            }`}
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          required
          className="mt-1 block w-full input-field"
          placeholder="Please provide a reason for your leave request"
          minLength={10}
          maxLength={500}
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
          disabled={loading || !validateDates() || !leaveType}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}

