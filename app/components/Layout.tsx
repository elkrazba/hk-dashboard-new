'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../modules/auth/AuthContext';

/**
 * Layout component props
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * Main Layout Component
 * 
 * Provides the structure for the dashboard with a header, sidebar, and main content area.
 * Handles responsive layout and authentication state.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading, userRole } = useAuth();
  const pathname = usePathname();
  
  // Check if the current path is an authentication page
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Show a minimal layout for authentication pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user && !isAuthPage) {
    // This will be handled by middleware redirecting to login page
    return null;
  }

  // Main dashboard layout for authenticated users
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header user={user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white p-4 text-center text-gray-500 text-sm border-t">
          <p>© {new Date().getFullYear()} HK SOULUTION. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

