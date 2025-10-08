import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Package,
  Settings,
  Upload,
  Home,
  Menu,
  X,
  Truck,
  LogOut,
  User as UserIcon,
  Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { user, logout } = useAuth()

  // Navigation items based on user role
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Shipments', href: '/shipments', icon: Truck },
    { name: 'Field Settings', href: '/field-settings', icon: Settings },
    { name: 'Import Data', href: '/import', icon: Upload },
  ]

  // Add User Management for admin and super admin
  const navigation = user?.role === 'admin' || user?.role === 'super_admin'
    ? [...baseNavigation, { name: 'User Management', href: '/users', icon: Users }]
    : baseNavigation

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="h-full min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-full lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-semibold text-white">
              Shipment Manager
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-white/20 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto sidebar-nav min-h-0">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative z-10
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}
                  `} />
                  {item.name}
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role.split('_').map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 h-full min-h-screen lg:flex lg:flex-col">
        {/* Mobile menu button - only visible on mobile */}
        <div className="lg:hidden sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
            </h1>
            <button
              onClick={logout}
              className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
