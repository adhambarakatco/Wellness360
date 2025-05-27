'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ChatbotButton from '@/components/dashboard/ChatbotButton'
import { useAuth } from '@/contexts/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { updateUser, isAuthenticated, isLoading } = useAuth()

  // Handle responsive behavior
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024)
      setIsSidebarOpen(window.innerWidth >= 1024)
    }
    
    // Check on mount and on resize
    checkSize()
    window.addEventListener('resize', checkSize)
    
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Get the current page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname === '/dashboard/activity') return 'Activity Tracking'
    if (pathname === '/dashboard/trainer') return 'AI Trainer'
    if (pathname === '/dashboard/profile') return 'Profile'
    if (pathname === '/dashboard/settings') return 'Settings'
    return 'Dashboard'
  }

  // Check if current page should have full width
  const isFullWidthPage = pathname === '/dashboard/trainer' || pathname === '/dashboard/activity' || pathname === '/dashboard';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        {/* Dashboard Header */}
        <DashboardHeader 
          title={getPageTitle()} 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-black/50 p-6">
          <div className={isFullWidthPage ? "w-full" : "container mx-auto"}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Chatbot Button */}
      <ChatbotButton />
    </div>
  )
} 