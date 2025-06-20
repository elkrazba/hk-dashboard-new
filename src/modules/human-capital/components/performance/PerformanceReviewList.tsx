import { useState, useEffect, useMemo } from 'react'
import { PerformanceReview, User } from '@/types'
import { performanceService } from '@/services'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface PerformanceReviewListProps {
  currentUser: User
  onUpdateReview?: (review: PerformanceReview) => void
  onViewDetails?: (review: PerformanceReview) => void
}

export default function PerformanceReviewList({
  currentUser,
  onUpdateReview,
  onViewDetails
}: PerformanceReviewListProps) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'review_date' | 'employee_name' | 'status'>('review_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await performanceService.getPerformanceReviews(
          currentUser.role === 'hr_admin' || currentUser.role === 'super_admin'
            ? undefined
            : currentUser.id
        )
        setReviews(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load performance reviews')
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [currentUser])

  const handleSort = (field: 'review_date' | 'employee_name' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    // First, filter by search term
    const filtered = reviews.filter(review => {
      const employeeName = `${review.employee?.users?.first_name || ''} ${review.employee?.users?.last_name || ''}`.toLowerCase()
      const position = (review.employee?.position || '').toLowerCase()
      const department = (review.employee?.department || '').toLowerCase()
      const status = (review.status || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      
      return employeeName.includes(searchLower) || 
             position.includes(searchLower) || 
             department.includes(searchLower) ||
             status.includes(searchLower)
    })
    
    // Then, sort the filtered results
    return [...filtered].sort((a, b) => {
      if (sortField === 'review_date') {
        const dateA = new Date(a.review_date).getTime()
        const dateB = new Date(b.review_date).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      } else if (sortField === 'employee_name') {
        const nameA = `${a.employee?.users?.first_name || ''} ${a.employee?.users?.last_name || ''}`.toLowerCase()
        const nameB = `${b.employee?.users?.first_name || ''} ${b.employee?.users?.last_name || ''}`.toLowerCase()
        return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortField === 'status') {
        const statusA = a.status.toLowerCase()
        const statusB = b.status.toLowerCase()
        return sortDirection === 'asc' ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA)
      }
      return 0
    })
  }, [reviews, searchTerm, sortField, sortDirection])

  // Paginate the filtered and sorted reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedReviews.slice(startIndex, endIndex)
  }, [filteredAndSortedReviews, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage)

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name, position, department, or status..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleSort('review_date')}
            className={`px-3 py-1 text-sm border rounded-md ${
              sortField === 'review_date' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
            }`}
          >
            Date {sortField === 'review_date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('employee_name')}
            className={`px-3 py-1 text-sm border rounded-md ${
              sortField === 'employee_name' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
            }`}
          >
            Name {sortField === 'employee_name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('status')}
            className={`px-3 py-1 text-sm border rounded-md ${
              sortField === 'status' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
            }`}
          >
            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {filteredAndSortedReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No performance reviews found.
        </div>
      ) : (
        paginatedReviews.map(review => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {review.employee?.users?.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={review.employee.users.avatar_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        {review.employee?.users?.first_name?.[0]}
                        {review.employee?.users?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {review.employee?.users?.first_name} {review.employee?.users?.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {review.employee?.position} • {review.employee?.department}
                  </p>
                </div>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${getStatusColor(review.status)}
              `}>
                {review.status.replace('_', ' ').charAt(0).toUpperCase() + 
                 review.status.slice(1).replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Review Date:</span>{' '}
                {new Date(review.review_date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Reviewer:</span>{' '}
                {review.reviewer?.first_name} {review.reviewer?.last_name}
              </div>
              {review.overall_rating && (
                <div>
                  <span className="font-medium">Overall Rating:</span>{' '}
                  {review.overall_rating}/5
                </div>
              )}
              {review.completed_at && (
                <div>
                  <span className="font-medium">Completed:</span>{' '}
                  {new Date(review.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {review.comments && (
              <div className="text-sm">
                <span className="font-medium">Comments:</span>
                <p className="mt-1 text-gray-600">{review.comments}</p>
              </div>
            )}

            {(currentUser.role === 'hr_admin' || currentUser.role === 'super_admin') && (
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => onViewDetails && onViewDetails(review)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        ))
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded-md text-sm ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

