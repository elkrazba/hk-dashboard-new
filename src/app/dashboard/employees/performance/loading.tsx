import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PerformanceReviewsLoading() {
  return (
    <div className="space-y-6">
      <h1 className="section-title">Performance Reviews</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card bg-white">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="card bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <LoadingSpinner />
      </div>
    </div>
  )
}

