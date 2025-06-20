'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '../modules/auth/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ServerIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  userRole: UserRole;
}

// Interface for navigation items
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: NavItem[];
}

/**
 * Sidebar Component
 * 
 * Displays a responsive navigation sidebar with role-based menu items
 * and collapsible sections.
 */
const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  
  // Reset mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Toggle a section's expanded state
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if a nav item should be shown based on user role
  const shouldShowNavItem = (roles: UserRole[]): boolean => {
    if (!roles.length || !userRole) return false;
    // Special case: 'all' means all authenticated users
    if (roles.includes('all' as UserRole)) return true;
    return roles.includes(userRole);
  };

  // Check if the current path matches a nav item or its children
  const isActiveRoute = (href: string, children?: NavItem[]): boolean => {
    if (pathname === href) return true;
    if (children) {
      return children.some(child => isActiveRoute(child.href));
    }
    return false;
  };

  // Define navigation structure with role-based access
  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['all' as UserRole]
    },
    {
      name: 'Human Resources',
      href: '/hr',
      icon: UserGroupIcon,
      roles: ['superadmin', 'hr_admin', 'team_lead'],
      children: [
        {
          name: 'Employees',
          href: '/hr/employees',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin', 'team_lead']
        },
        {
          name: 'Attendance',
          href: '/hr/attendance',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin', 'team_lead']
        },
        {
          name: 'Leave Management',
          href: '/hr/leave',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin', 'team_lead', 'employee']
        },
        {
          name: 'Payroll',
          href: '/hr/payroll',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin']
        },
        {
          name: 'Performance',
          href: '/hr/performance',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin', 'team_lead']
        },
        {
          name: 'Training',
          href: '/hr/training',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin', 'team_lead', 'employee']
        },
        {
          name: 'Recruitment',
          href: '/hr/recruitment',
          icon: UserGroupIcon,
          roles: ['superadmin', 'hr_admin']
        }
      ]
    },
    {
      name: 'Projects & Brands',
      href: '/projects',
      icon: BriefcaseIcon,
      roles: ['superadmin', 'project_manager', 'team_lead', 'employee'],
      children: [
        {
          name: 'All Projects',
          href: '/projects/all',
          icon: BriefcaseIcon,
          roles: ['superadmin', 'project_manager', 'team_lead', 'employee']
        },
        {
          name: 'My Projects',
          href: '/projects/my',
          icon: BriefcaseIcon,
          roles: ['superadmin', 'project_manager', 'team_lead', 'employee', 'intern']
        },
        {
          name: 'Roadmaps',
          href: '/projects/roadmaps',
          icon: BriefcaseIcon,
          roles: ['superadmin', 'project_manager', 'team_lead']
        },
        {
          name: 'Resources',
          href: '/projects/resources',
          icon: BriefcaseIcon,
          roles: ['superadmin', 'project_manager', 'team_lead']
        }
      ]
    },
    {
      name: 'Strategy & KPIs',
      href: '/strategy',
      icon: ChartBarIcon,
      roles: ['superadmin', 'project_manager', 'team_lead'],
      children: [
        {
          name: 'Company OKRs',
          href: '/strategy/okrs',
          icon: ChartBarIcon,
          roles: ['superadmin', 'project_manager', 'team_lead']
        },
        {
          name: 'Department Goals',
          href: '/strategy/departments',
          icon: ChartBarIcon,
          roles: ['superadmin', 'project_manager', 'team_lead']
        },
        {
          name: 'Analytics',
          href: '/strategy/analytics',
          icon: ChartBarIcon,
          roles: ['superadmin', 'project_manager', 'team_lead']
        }
      ]
    },
    {
      name: 'Communication',
      href: '/communication',
      icon: ChatBubbleLeftRightIcon,
      roles: ['all' as UserRole],
      children: [
        {
          name: 'Announcements',
          href: '/communication/announcements',
          icon: ChatBubbleLeftRightIcon,
          roles: ['all' as UserRole]
        },
        {
          name: 'Team Chat',
          href: '/communication/chat',
          icon: ChatBubbleLeftRightIcon,
          roles: ['all' as UserRole]
        },
        {
          name: 'Watercooler',
          href: '/communication/watercooler',
          icon: ChatBubbleLeftRightIcon,
          roles: ['all' as UserRole]
        }
      ]
    },
    {
      name: 'Finance',
      href: '/finance',
      icon: CurrencyDollarIcon,
      roles: ['superadmin', 'hr_admin'],
      children: [
        {
          name: 'Budget',
          href: '/finance/budget',
          icon: CurrencyDollarIcon,
          roles: ['superadmin', 'hr_admin']
        },
        {
          name: 'Transactions',
          href: '/finance/transactions',
          icon: CurrencyDollarIcon,
          roles: ['superadmin', 'hr_admin']
        },
        {
          name: 'Invoices',
          href: '/finance/invoices',
          icon: CurrencyDollarIcon,
          roles: ['superadmin', 'hr_admin']
        },
        {
          name: 'Reports',
          href: '/finance/reports',
          icon: CurrencyDollarIcon,
          roles: ['superadmin', 'hr_admin']
        }
      ]
    },
    {
      name: 'Legal & Compliance',
      href: '/legal',
      icon: ScaleIcon,
      roles: ['superadmin', 'hr_admin'],
      children: [
        {
          name: 'Contracts',
          href: '/legal/contracts',
          icon: ScaleIcon,
          roles: ['superadmin', 'hr_admin']
        },
        {
          name: 'NDAs',
          href: '/legal/ndas',
          icon: ScaleIcon,
          roles: ['superadmin', 'hr_admin']
        },
        {
          name: 'Certifications',
          href: '/legal/certifications',
          icon: ScaleIcon,
          roles: ['superadmin', 'hr_admin']
        }
      ]
    },
    {
      name: 'Documents & Assets',
      href: '/assets',
      icon: ServerIcon,
      roles: ['all' as UserRole],
      children: [
        {
          name: 'All Documents',
          href: '/assets/documents',
          icon: DocumentTextIcon,
          roles: ['all' as UserRole]
        },
        {
          name: 'Brand Assets',
          href: '/assets/brand',
          icon: ServerIcon,
          roles: ['all' as UserRole]
        },
        {
          name: 'Templates',
          href: '/assets/templates',
          icon: DocumentTextIcon,
          roles: ['all' as UserRole]
        }
      ]
    },
    {
      name: 'AI Assistant',
      href: '/ai',
      icon: SparklesIcon,
      roles: ['all' as UserRole]
    }
  ];

  // Render a navigation item with collapsible children
  const renderNavItem = (item: NavItem) => {
    // Skip items the user doesn't have access to
    if (!shouldShowNavItem(item.roles)) return null;

    const isActive = isActiveRoute(item.href, item.children);
    const isExpanded = expandedSections[item.name];
    const hasChildren = item.children && item.children.length > 0;

    // Base styles
    let itemClasses = "flex items-center w-full px-4 py-2 text-sm text-left ";
    
    // Apply active/inactive styles
    itemClasses += isActive 
      ? "text-blue-600 font-medium " 
      : "text-gray-700 hover:bg-gray-100 ";

    return (
      <div key={item.name} className="w-full">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleSection(item.name)}
              className={`${itemClasses} justify-between`}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </div>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
            
            {/* Collapsible Children */}
            {isExpanded && (
              <div className="pl-10 space-y-1 py-1">
                {item.children?.map((child) => 
                  shouldShowNavItem(child.roles) && (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`block px-4 py-2 text-sm ${
                        pathname === child.href
                          ? "text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {child.name}
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        ) : (
          <Link href={item.href} className={itemClasses}>
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.name}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-2">
            HK
          </div>
          <span className="text-lg font-bold text-gray-800">HK SOULUTION</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HK SOULUTION</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

