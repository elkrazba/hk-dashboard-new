'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PerformanceReview } from '@/types'
import PerformanceReviewList from '@/modules/human-capital/components/performance/PerformanceReviewList'
import PerformanceMetrics from '@/modules/human-capital/components/performance/PerformanceMetrics'
import NewReviewForm from '@/modules/human-capital/components/performance/NewReviewForm'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { performanceService } from '@/services'

// Review Details Component to display inside the modal
interface ReviewDetailsProps {
  review: PerformanceReview;
  onClose: () => void;
  onSubmitFeedback?: (reviewId: string, feedback: { rating: number; comments: string }) => Promise<void>;
  currentUser: any;
}

function ReviewDetails({ review, onClose, onSubmitFeedback, currentUser }: ReviewDetailsProps) {
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComments, setFeedbackComments] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitFeedback) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await onSubmitFeedback(review.id, {
        rating: feedbackRating,
        comments: feedbackComments
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 border-l-4 border-primary-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {review.employee?.users?.avatar_url ? (
                <img
                  className="h-12 w-12 rounded-full"
                  src={review.employee.users.avatar_url}
                  alt=""
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm text-gray-500">
                    {review.employee?.users?.first_name?.[0]}
                    {review.employee?.users?.last_name?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {review.employee?.users?.first_name} {review.employee?.users?.last_name}
              </h3>
              <p className="text-sm text-gray-500">
                {review.employee?.position} • {review.employee?.department}
              </p>
            </div>
          </div>
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${review.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
              review.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'}
          `}>
            {review.status.replace('_', ' ').charAt(0).toUpperCase() + 
             review.status.slice(1).replace('_', ' ')}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Review Details</h4>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Scheduled Date:</span>{' '}
                {new Date(review.review_date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Reviewer:</span>{' '}
                {review.reviewer?.first_name} {review.reviewer?.last_name}
              </div>
              {review.completed_at && (
                <div>
                  <span className="font-medium">Completed:</span>{' '}
                  {new Date(review.completed_at).toLocaleDateString()}
                </div>
              )}
              {review.overall_rating && (
                <div>
                  <span className="font-medium">Overall Rating:</span>{' '}
                  <span className="flex items-center">
                    {review.overall_rating}/5
                    <div className="flex ml-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`w-4 h-4 ${star <= review.overall_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {review.comments && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Feedback</h4>
              <p className="text-gray-700">{review.comments}</p>
            </div>
          )}
        </div>
        
        {/* Feedback Form - Only show if the review is for the current user and status is in_progress */}
        {review.employee_id === currentUser.id && review.status === 'in_progress' && !success && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Submit Your Feedback</h4>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      type="button"
                      key={rating}
                      onClick={() => setFeedbackRating(rating)}
                      className="focus:outline-none"
                    >
                      <svg 
                        className={`w-8 h-8 ${rating <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Share your thoughts about this review..."
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
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!feedbackRating || submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Feedback submitted successfully</h3>
                <p className="mt-2 text-sm text-green-700">
                  Thank you for providing your feedback. It has been recorded.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function PerformanceReviewsPage() {
  const { user, loading } = useAuth()
  const [showMetrics, setShowMetrics] = useState(true)
  const [showNewReviewModal, setShowNewReviewModal] = useState(false)
  const [showReviewDetailsModal, setShowReviewDetailsModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Filter state
  const [filter, setFilter] = useState({
    status: undefined,
    timeframe: undefined,
    dateRange: undefined
  })

  // Handle filter changes from PerformanceMetrics
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter
    }))
  }, [])
  
  // Handle viewing review details
  const handleViewDetails = useCallback((review: PerformanceReview) => {
    setSelectedReview(review)
    setShowReviewDetailsModal(true)
  }, [])
  
  // Handle review creation/update - triggers a refresh of data
  const handleReviewChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])
  
  // Handle feedback submission
  const handleSubmitFeedback = useCallback(async (reviewId: string, feedback: { rating: number; comments: string }) => {
    await performanceService.submitFeedback(reviewId, feedback)
    handleReviewChange()
  }, [handleReviewChange])
  
  if (loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="section-title">Performance Reviews</h1>
        {(user.role === 'hr_admin' || user.role === 'super_admin') && (
          <button
            onClick={() => setShowNewReviewModal(true)}
            className="btn-primary"
          >
            Schedule Review
          </button>
        )}
      </div>

      {showMetrics && (
        <PerformanceMetrics
          employeeId={
            user.role === 'hr_admin' || user.role === 'super_admin'
              ? undefined
              : user.id
          }
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="card bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Review History</h2>
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
          </button>
        </div>
        <PerformanceReviewList 
          currentUser={user} 
          onViewDetails={handleViewDetails}
          filter={filter}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <Modal
        isOpen={showNewReviewModal}
        onClose={() => setShowNewReviewModal(false)}
        title="Schedule Performance Review"
      >
        <NewReviewForm
          currentUser={user}
          onReviewCreated={() => {
            setShowNewReviewModal(false)
            // Trigger a refresh of the review list and metrics
            handleReviewChange()
          }}
          onCancel={() => setShowNewReviewModal(false)}
        />
      </Modal>
      
      {/* Review Details Modal */}
      {selectedReview && (
        <Modal
          isOpen={showReviewDetailsModal}
          onClose={() => setShowReviewDetailsModal(false)}
          title="Performance Review Details"
        >
          <ReviewDetails
            review={selectedReview}
            onClose={() => setShowReviewDetailsModal(false)}
            onSubmitFeedback={handleSubmitFeedback}
            currentUser={user}
          />
        </Modal>
      )}
    </div>
  )
}
