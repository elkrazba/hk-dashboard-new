export type Role = 
  | 'super_admin'
  | 'hr_admin'
  | 'project_manager'
  | 'team_lead'
  | 'employee'
  | 'intern'
  | 'partner'

export interface User {
  id: string
  email: string
  role: Role
  first_name?: string
  last_name?: string
  avatar_url?: string
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected'
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid'
export type ReviewStatus = 'scheduled' | 'in_progress' | 'completed'

// Performance Review Filter Types
export interface PerformanceReviewFilter {
  status?: ReviewStatus;
  timeframe?: 'upcoming' | 'past';
  dateRange?: [Date, Date];
  employee_id?: string;
  reviewer_id?: string;
  search?: string;
}

// Chart component types for Recharts
export interface ReviewTrend {
  month: string;
  count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface ChartLabel {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

export interface PerformanceStatistics {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  upcoming: number;
  averageRating: number;
  monthlyTrends: ReviewTrend[];
  ratingDistribution: RatingDistribution[];
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: LeaveType
  status: LeaveStatus
  start_date: string
  end_date: string
  reason?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  employee?: Employee
}

export interface PerformanceReview {
  id: string
  employee_id: string
  reviewer_id: string
  review_date: string
  status: ReviewStatus
  overall_rating?: number
  strengths?: string[]
  areas_for_improvement?: string[]
  goals?: string[]
  comments?: string
  completed_at?: string
  created_at: string
  updated_at: string
  employee?: Employee
  reviewer?: User
  feedback?: ReviewFeedback[]
}

export interface ReviewFeedback {
  id: string
  review_id: string
  reviewer_id: string
  feedback_type: string
  rating: number
  comments?: string
  created_at: string
  updated_at: string
  reviewer?: User
}

export interface Project {
  id: string
  name: string
  status: 'idea' | 'development' | 'beta' | 'live' | 'maintenance'
  description?: string
  start_date: string
  end_date?: string
  lead_id: string
  team_members: string[]
  budget?: number
  revenue?: number
}

export interface Employee {
  id: string
  user_id: string
  department: string
  position: string
  hire_date: string
  reports_to?: string
  reports_to_id?: string
  salary?: number
  status: 'active' | 'inactive' | 'on_leave'
  created_at: string
  updated_at: string
  users?: User  // Relation to User table in Supabase
}

