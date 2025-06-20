import { supabase } from '@/lib/supabase'
import { 
  PerformanceReview, 
  ReviewStatus, 
  ReviewFeedback,
  PerformanceReviewFilter,
  PerformanceStatistics
} from '@/types'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

// Extended statistics interfaces
export interface ReviewTrend {
  month: string;
  count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface ExtendedStatistics {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  upcoming: number;
  averageRating: number;
  monthlyTrends: ReviewTrend[];
  ratingDistribution: RatingDistribution[];
}

// Helper to build filter conditions for Supabase query
const buildFilterQuery = <T>(
  query: PostgrestFilterBuilder<T>,
  filter: PerformanceReviewFilter = {}
): PostgrestFilterBuilder<T> => {
  let filteredQuery = query;
  
  if (filter.status) {
    filteredQuery = filteredQuery.eq('status', filter.status);
  }
  
  if (filter.employee_id) {
    filteredQuery = filteredQuery.eq('employee_id', filter.employee_id);
  }
  
  if (filter.reviewer_id) {
    filteredQuery = filteredQuery.eq('reviewer_id', filter.reviewer_id);
  }
  
  if (filter.timeframe === 'upcoming') {
    const today = new Date().toISOString().split('T')[0];
    filteredQuery = filteredQuery.gte('review_date', today);
  } else if (filter.timeframe === 'past') {
    const today = new Date().toISOString().split('T')[0];
    filteredQuery = filteredQuery.lt('review_date', today);
  }
  
  if (filter.dateRange) {
    const [startDate, endDate] = filter.dateRange;
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    filteredQuery = filteredQuery
      .gte('review_date', startDateStr)
      .lte('review_date', endDateStr);
  }
  
  return filteredQuery;
}

export const performanceService = {
  /**
   * Get performance reviews with optional filtering
   */
  async getPerformanceReviews(employeeId?: string, filter?: PerformanceReviewFilter): Promise<PerformanceReview[]> {
    try {
      let query = supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:employee_id (
            *,
            users:id (
              email,
              first_name,
              last_name,
              role,
              avatar_url
            )
          ),
          reviewer:reviewer_id (
            email,
            first_name,
            last_name,
            role,
            avatar_url
          ),
          feedback:review_feedback (
            *,
            reviewer:reviewer_id (
              email,
              first_name,
              last_name,
              role
            )
          )
        `)
        .order('review_date', { ascending: false });

      // Apply user-specific filter
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      // Apply additional filters if provided
      if (filter) {
        query = buildFilterQuery(query, filter);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching performance reviews: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting performance reviews:', error);
      throw error;
    }
  },
  
  /**
   * Get a single performance review by ID
   */
  async getPerformanceReviewById(reviewId: string): Promise<PerformanceReview> {
    try {
      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:employee_id (
            *,
            users:id (
              email,
              first_name,
              last_name,
              role,
              avatar_url
            )
          ),
          reviewer:reviewer_id (
            email,
            first_name,
            last_name,
            role,
            avatar_url
          ),
          feedback:review_feedback (
            *,
            reviewer:reviewer_id (
              email,
              first_name,
              last_name,
              role
            )
          )
        `)
        .eq('id', reviewId)
        .single();
      
      if (error) {
        throw new Error(`Error fetching performance review: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting performance review:', error);
      throw error;
    }
  },

  async createPerformanceReview(review: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert(review)
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating performance review: ${error.message}`)
    }

    return data
  },

  async updatePerformanceReview(
    reviewId: string,
    updates: Partial<PerformanceReview>
  ): Promise<PerformanceReview> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .update({
        ...updates,
        completed_at: updates.status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating performance review: ${error.message}`)
    }

    return data
  },

  /**
   * Submit feedback for a performance review
   */
  async submitFeedback(reviewId: string, feedback: { rating: number; comments: string }): Promise<PerformanceReview> {
    try {
      // Update the main review with overall rating and comments
      const { data, error } = await supabase
        .from('performance_reviews')
        .update({
          overall_rating: feedback.rating,
          comments: feedback.comments,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error submitting feedback: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
  
  /**
   * Get enhanced performance review statistics
   */
  async getReviewStatistics(employeeId?: string): Promise<PerformanceStatistics> {
    try {
      // Get basic counts query
      let query = supabase
        .from('performance_reviews')
        .select('status, overall_rating, review_date', { count: 'exact' });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Error fetching review statistics: ${error.message}`);
      }

      // Calculate status counts
      const scheduled = data?.filter(r => r.status === 'scheduled').length || 0;
      const in_progress = data?.filter(r => r.status === 'in_progress').length || 0;
      const completed = data?.filter(r => r.status === 'completed').length || 0;

      // Calculate average rating from completed reviews with ratings
      const ratingsData = data?.filter(r => r.status === 'completed' && r.overall_rating) || [];
      let averageRating = 0;
      
      if (ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, review) => acc + (review.overall_rating || 0), 0);
        averageRating = sum / ratingsData.length;
      }

      // Get upcoming reviews (next 30 days)
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const upcomingQuery = supabase
        .from('performance_reviews')
        .select('id', { count: 'exact' })
        .gte('review_date', today.toISOString().split('T')[0])
        .lte('review_date', thirtyDaysLater.toISOString().split('T')[0]);
      
      if (employeeId) {
        upcomingQuery.eq('employee_id', employeeId);
      }
      
      const { count: upcoming, error: upcomingError } = await upcomingQuery;
      
      if (upcomingError) {
        throw new Error(`Error fetching upcoming reviews: ${upcomingError.message}`);
      }

      // Generate monthly trends (last 6 months)
      const monthlyTrends = await this.getMonthlyTrends(employeeId);
      
      // Get rating distribution
      const ratingDistribution = await this.getRatingDistribution(employeeId);

      return {
        total: count || 0,
        scheduled,
        in_progress,
        completed,
        upcoming: upcoming || 0,
        averageRating,
        monthlyTrends,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting review statistics:', error);
      throw error;
    }
  },
  
  /**
   * Helper method to get monthly trends for the last 6 months
   */
  async getMonthlyTrends(employeeId?: string): Promise<ReviewTrend[]> {
    try {
      const months = [];
      const currentDate = new Date();
      
      // Get data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = month.toLocaleString('default', { month: 'short' });
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
        
        let query = supabase
          .from('performance_reviews')
          .select('id', { count: 'exact' })
          .gte('review_date', startDate)
          .lte('review_date', endDate);
        
        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }
        
        const { count, error } = await query;
        
        if (error) {
          throw new Error(`Error fetching monthly trend data: ${error.message}`);
        }
        
        months.push({
          month: monthName,
          count: count || 0
        });
      }
      
      return months;
    } catch (error) {
      console.error('Error getting monthly trends:', error);
      return []; // Return empty array on error to prevent UI breakage
    }
  },
  
  /**
   * Helper method to get rating distribution
   */
  async getRatingDistribution(employeeId?: string): Promise<RatingDistribution[]> {
    try {
      const distribution = [];
      
      // Get count for each rating 1-5
      for (let rating = 1; rating <= 5; rating++) {
        let query = supabase
          .from('performance_reviews')
          .select('id', { count: 'exact' })
          .eq('overall_rating', rating);
        
        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }
        
        const { count, error } = await query;
        
        if (error) {
          throw new Error(`Error fetching rating distribution data: ${error.message}`);
        }
        
        distribution.push({
          rating,
          count: count || 0
        });
      }
      
      return distribution;
    } catch (error) {
      console.error('Error getting rating distribution:', error);
      return []; // Return empty array on error to prevent UI breakage
    }
  }
}

