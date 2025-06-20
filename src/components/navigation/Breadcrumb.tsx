import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  name: string
  href: string
  current: boolean
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  
  const breadcrumbItems: BreadcrumbItem[] = paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`
    let name = path.charAt(0).toUpperCase() + path.slice(1)
    
    // Replace technical paths with friendly names
    switch (path) {
      case 'dashboard':
        name = 'Dashboard'
        break
      case 'employees':
        name = 'Employees'
        break
      case 'leave':
        name = 'Leave Management'
        break
      case 'performance':
        name = 'Performance Reviews'
        break
    }
    
    return {
      name,
      href,
      current: index === paths.length - 1
    }
  })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}
              <Link
                href={item.href}
                className={`ml-4 text-sm font-medium ${
                  item.current
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

