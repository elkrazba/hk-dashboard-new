"use client";

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@/types'
import Sidebar from '@/components/navigation/Sidebar'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: ReactNode
  user?: User | null
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  // If no user is present, redirect to login
  if (!user) {
    router.push('/auth/login')
    return null
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Get the current page title from the pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    if (!path) return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar user={user} activePath={pathname} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-lg font-medium text-gray-900">
                  {getPageTitle()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {user && (
                  <>
                    <div className="flex items-center space-x-2">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.first_name || 'User avatar'}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-500">
                        Welcome, {user.first_name || user.email}
                      </span>
                    </div>
                    <button 
                      className="btn-secondary text-sm hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Breadcrumb />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

