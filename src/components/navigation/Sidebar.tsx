import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/types'

interface SidebarProps {
  user: User | null
  activePath: string
}

interface MenuItem {
  name: string
  href: string
  icon: string // Using emoji for now, can replace with proper icons later
  roles: string[]
  subItems?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    roles: ['super_admin', 'hr_admin', 'project_manager', 'team_lead', 'employee']
  },
  {
    name: 'Human Resources',
    href: '/dashboard/employees',
    icon: '👥',
    roles: ['super_admin', 'hr_admin', 'project_manager', 'team_lead'],
    subItems: [
      {
        name: 'Employee Directory',
        href: '/dashboard/employees',
        icon: '📋',
        roles: ['super_admin', 'hr_admin', 'project_manager', 'team_lead']
      },
      {
        name: 'Leave Management',
        href: '/dashboard/employees/leave',
        icon: '📅',
        roles: ['super_admin', 'hr_admin']
      },
      {
        name: 'Performance Reviews',
        href: '/dashboard/employees/performance',
        icon: '📈',
        roles: ['super_admin', 'hr_admin', 'team_lead']
      }
    ]
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: '📋',
    roles: ['super_admin', 'project_manager', 'team_lead']
  },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: '📁',
    roles: ['super_admin', 'hr_admin', 'project_manager', 'team_lead', 'employee']
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: '⚙️',
    roles: ['super_admin']
  }
]

export default function Sidebar({ user, activePath }: SidebarProps) {
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    item => user && item.roles.includes(user.role)
  )

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return activePath === href
    }
    return activePath.startsWith(href)
  }

  const MenuItem = ({ item }: { item: MenuItem }) => {
    const isActive = isActiveLink(item.href)
    const hasSubItems = item.subItems && item.subItems.length > 0

    return (
      <>
        <Link
          href={item.href}
          className={`
            flex items-center px-4 py-3 text-sm font-medium rounded-lg
            ${isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <span className="mr-3">{item.icon}</span>
          {item.name}
        </Link>
        {hasSubItems && isActive && (
          <div className="ml-8 space-y-1">
            {item.subItems?.map(subItem => (
              <MenuItem key={subItem.href} item={subItem} />
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <div className="px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          <span className="text-2xl font-bold text-primary-600">HK SOLUTION</span>
        </div>
        
        <nav className="space-y-1">
          {filteredMenuItems.map(item => (
            <div key={item.href}>
              <MenuItem item={item} />
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="absolute bottom-0 w-64 px-4 py-6 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {user?.avatar_url ? (
              <img
                className="h-8 w-8 rounded-full"
                src={user.avatar_url}
                alt={`${user.first_name} ${user.last_name}`}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

