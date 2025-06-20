import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EmployeesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="section-title">Employee Directory</h1>
        <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

