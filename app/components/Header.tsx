'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { useAuth } from '../modules/auth/AuthContext';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  user: User | null;
}

/**
 * Header Component
 * 
 * Displays the top navigation bar with company branding, notifications,
 * quick actions, and user profile dropdown.
 */
const Header: React.FC<HeaderProps> = ({ user }) => {
  const { signOut, userRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setShowQuickActions(false);
  };

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setShowNotifications(false);
    setShowQuickActions(false);
    setShowProfileMenu(!showProfileMenu);
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setShowProfileMenu(false);
    setShowQuickActions(false);
    setShowNotifications(!showNotifications);
  };

  // Toggle quick actions
  const toggleQuickActions = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setShowQuickActions(!showQuickActions);
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    closeAllDropdowns();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-4">
      <div className="flex items-center justify-between">
        {/* Company Branding */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-2">
              HK
            </div>
            <span className="text-xl font-bold text-gray-800">HK SOULUTION</span>
          </Link>
        </div>

        {/* Right Side - User Controls */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions Button */}
          <div className="relative">
            <button
              onClick={toggleQuickActions}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Quick actions"
            >
              <PlusIcon className="h-6 w-6 text-gray-600" />
            </button>

            {/* Quick Actions Dropdown */}
            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                  Quick Actions
                </div>
                <Link href="/projects/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  New Project
                </Link>
                <Link href="/hr/employees/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Add Employee
                </Link>
                <Link href="/finance/transactions/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Record Transaction
                </Link>
                <Link href="/documents/upload" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Upload Document
                </Link>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Notifications"
            >
              <div className="relative">
                <BellIcon className="h-6 w-6 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </div>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 flex justify-between">
                  <span>Notifications</span>
                  <Link href="/notifications" className="text-blue-600 hover:text-blue-800 text-xs">
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-800">Project Update: SEAVIBE</p>
                    <p className="text-xs text-gray-500">Milestone completed: Beta Release</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-800">Leave Request Approval</p>
                    <p className="text-xs text-gray-500">John Doe's leave request needs your approval</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-800">New Invoice Received</p>
                    <p className="text-xs text-gray-500">Invoice #INV-2023-045 from Supplier XYZ</p>
                    <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100">
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
          </Link>

          {/* Help */}
          <Link href="/help" className="p-2 rounded-full hover:bg-gray-100">
            <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
          </Link>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole || 'User'}</p>
                </div>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </Link>
                <Link href="/settings/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Account Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign Out
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

