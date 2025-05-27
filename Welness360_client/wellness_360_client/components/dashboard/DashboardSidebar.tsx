'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth'
import { 
  Moon, 
  LayoutDashboard, 
  Activity, 
  Calendar, 
  Lightbulb, 
  BarChart3, 
  CheckSquare, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'

interface DashboardSidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
  isMobile: boolean
}

export default function DashboardSidebar({ 
  isOpen, 
  toggleSidebar,
  isMobile
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Helper to get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path
  }

  // Define sidebar links
  const mainLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/dashboard/activity', label: 'Activity Tracking', icon: <Activity className="w-5 h-5" /> },
    { path: '/dashboard/trainer', label: 'AI Trainer', icon: <Lightbulb className="w-5 h-5" /> }
  ]

  const accountLinks = [
    { path: '/dashboard/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-r-white/10 flex flex-col transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'shadow-xl' : ''}`}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Wellness 360</span>
          </Link>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4">
            <h2 className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </h2>
            <nav className="space-y-1">
              {mainLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(link.path) 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-6 px-4">
            <h2 className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </h2>
            <nav className="space-y-1">
              {accountLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                Premium User
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 