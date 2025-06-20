import { supabase } from '@/lib/supabase'
import { LeaveRequest, LeaveStatus, LeaveType } from '@/types'

export const leaveService = {
  async getLeaveRequests(employeeId?: string) {
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employee_id (
          *,
          users:id (
            email,
            first_name,
            last_name,
            role
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching leave requests: ${error.message}`)
    }

    return data
  },

  async createLeaveRequest(request: Partial<LeaveRequest>) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(request)
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating leave request: ${error.message}`)
    }

    return data
  },

  async updateLeaveRequest(
    requestId: string,
    updates: {
      status: LeaveStatus
      approved_by?: string
    }
  ) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        ...updates,
        approved_at: updates.status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating leave request: ${error.message}`)
    }

    return data
  },

  async getLeaveStatistics(employeeId?: string) {
    let query = supabase
      .from('leave_requests')
      .select('status', { count: 'exact' })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching leave statistics: ${error.message}`)
    }

    return {
      total: count,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      approved: data?.filter(r => r.status === 'approved').length || 0,
      rejected: data?.filter(r => r.status === 'rejected').length || 0
    }
  }
}

