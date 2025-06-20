import { supabase } from '@/lib/supabase'
import { Employee } from '@/types'

export const employeeService = {
  async getEmployee(employeeId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users:id (
          email,
          first_name,
          last_name,
          role,
          avatar_url
        )
      `)
      .eq('id', employeeId)
      .single()

    if (error) {
      throw new Error(`Error fetching employee: ${error.message}`)
    }

    return data
  },

  async updateEmployee(employeeId: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating employee: ${error.message}`)
    }

    return data
  },

  async getAllEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users:id (
          email,
          first_name,
          last_name,
          role,
          avatar_url
        ),
        reports_to:reports_to (
          id,
          users:id (
            first_name,
            last_name
          )
        )
      `)
      .order('department', { ascending: true })

    if (error) {
      throw new Error(`Error fetching employees: ${error.message}`)
    }

    return data
  },

  async getEmployeesByDepartment(department: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users:id (
          email,
          first_name,
          last_name,
          role,
          avatar_url
        )
      `)
      .eq('department', department)
      .order('position', { ascending: true })

    if (error) {
      throw new Error(`Error fetching employees by department: ${error.message}`)
    }

    return data
  },

  async getDirectReports(managerId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users:id (
          email,
          first_name,
          last_name,
          role,
          avatar_url
        )
      `)
      .eq('reports_to', managerId)

    if (error) {
      throw new Error(`Error fetching direct reports: ${error.message}`)
    }

    return data
  }
}

