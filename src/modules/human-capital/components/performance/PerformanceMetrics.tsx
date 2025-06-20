import { useState, useEffect } from 'react'
import { performanceService } from '@/services'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, ResponsiveContainer } from 'recharts'

interface PerformanceMetricsProps {
  employeeId?: string
  onFilterChange?: (filter: {
    status?: string;
    timeframe?: 'upcoming' | 'past';
    dateRange?: [Date, Date];
  }) => void;
}

interface ReviewTrend {
  month: string;
  count: number;
}

interface RatingDistribution {
  rating: number;
  count: number;
}

interface ExtendedStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  upcoming: number;
  averageRating: number;
  monthlyTrends: ReviewTrend[];
  ratingDistribution: RatingDistribution[];
}

export default function PerformanceMetrics({ employeeId, onFilterChange }: PerformanceMetricsProps) {
  const [stats, setStats] = useState<ExtendedStats>({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    upcoming: 0,
    averageRating: 0,
    monthlyTrends: [],
    ratingDistribution: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await performanceService.getReviewStatistics(employeeId)
        
        // If the extended statistics are already provided by the API
        if ('upcoming' in data && 'averageRating' in data && 
            'monthlyTrends' in data && 'ratingDistribution' in data) {
          setStats(data as ExtendedStats)
        } else {
          // If the API only returns basic stats, we'll mock the extended data for now
          // In a real implementation, you would update the performanceService to return this data
          setStats({
            ...data,
            upcoming: Math.floor(Math.random() * 5) + 1, // Mock data - replace with actual API data
            averageRating: 3.7, // Mock data - replace with actual API data
            monthlyTrends: [
              { month: 'Jan', count: 3 },
              { month: 'Feb', count: 5 },
              { month: 'Mar', count: 2 },
              { month: 'Apr', count: 7 },
              { month: 'May', count: 4 },
              { month: 'Jun', count: 6 }
            ], // Mock data - replace with actual API data
            ratingDistribution: [
              { rating: 1, count: 2 },
              { rating: 2, count: 5 },
              { rating: 3, count: 12 },
              { rating: 4, count: 18 },
              { rating: 5, count: 8 }
            ] // Mock data - replace with actual API data
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [employeeId])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">{error}</div>

  // Colors for charts
  const COLORS = ['#3B82F6', '#FBBF24', '#10B981', '#9CA3AF'];
  const RADIAN = Math.PI / 180;
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Create data for the status pie chart
  const statusData = [
    { name: 'Scheduled', value: stats.scheduled },
    { name: 'In Progress', value: stats.in_progress },
    { name: 'Completed', value: stats.completed }
  ];

  // Handle status filter clicks
  const handleStatusClick = (status) => {
    if (onFilterChange) {
      onFilterChange({ status });
    }
  };

  // Handle upcoming reviews click
  const handleUpcomingClick = () => {
    if (onFilterChange) {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      onFilterChange({ 
        timeframe: 'upcoming', 
        dateRange: [today, thirtyDaysLater] 
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onFilterChange && onFilterChange({})}
        >
          <h3 className="text-lg font-medium text-gray-900">Total Reviews</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div 
          className="card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleStatusClick('scheduled')}
        >
          <h3 className="text-lg font-medium text-gray-900">Scheduled</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.scheduled}</p>
        </div>
        <div 
          className="card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleStatusClick('in_progress')}
        >
          <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.in_progress}</p>
        </div>
        <div 
          className="card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleStatusClick('completed')}
        >
          <h3 className="text-lg font-medium text-gray-900">Completed</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Reviews */}
        <div 
          className="card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleUpcomingClick}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Reviews (Next 30 days)</h3>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-purple-600">{stats.upcoming}</p>
            <div className="text-sm text-gray-500">Click to view details</div>
          </div>
        </div>
        
        {/* Average Rating */}
        <div className="card bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Average Rating</h3>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.averageRating.toFixed(1)}/5.0</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="card bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends Line Chart */}
        <div className="card bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Review Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.monthlyTrends}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="card bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.ratingDistribution}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

