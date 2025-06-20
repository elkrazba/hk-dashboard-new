export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <h1 className="section-title">HR Dashboard</h1>

      {/* Key Metrics Loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card bg-white">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Department Distribution Loading */}
      <div className="card bg-white">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 mx-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Loading */}
      <div className="card bg-white">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-1 h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

