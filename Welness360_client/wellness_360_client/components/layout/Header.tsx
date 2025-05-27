'use client'
import Link from 'next/link'
import { Moon, Menu, X, User, ChevronDown, LogOut, LayoutDashboard, MessageSquareText } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import ChatbotOverlay from '@/components/dashboard/ChatbotOverlay'
import NotificationCenter from './NotificationCenter'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user?.firstName || !user?.lastName) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/5">
      <div className="container py-4">
        <nav className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group relative"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:scale-95 transition-all duration-300 relative">
              <Moon className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-primary rounded-xl opacity-50 group-hover:scale-150 transition-transform duration-500 blur-xl" />
            </div>
            <span className="font-bold text-xl tracking-tight">Wellness 360</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-y-[-2px] relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </Link>
            <Link 
              href="/features" 
              className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-y-[-2px] relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Features
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-y-[-2px] relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              About
            </Link>
    
            <div className="h-4 w-px bg-white/10" />
            
            {/* Chatbot Button - Only show if authenticated */}
            {isAuthenticated && (
              <>
                <NotificationCenter />
                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="flex items-center gap-2 p-2 bg-primary rounded-full text-white hover:bg-primary-dark transition-all duration-300"
                  aria-label="Open AI assistant"
                >
                  <MessageSquareText className="w-5 h-5" />
                </button>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-secondary-dark rounded-lg shadow-lg border border-white/10 overflow-hidden z-50">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all duration-200 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-y-[-2px]"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:translate-y-[-2px] relative group"
                >
                  <span className="relative z-10">Register</span>
                  <div className="absolute inset-0 bg-primary rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-xl" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 md:hidden text-gray-300 hover:text-white transition-colors relative group"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 top-3' : 'top-1'}`} />
              <span className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'top-3'}`} />
              <span className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 top-3' : 'top-5'}`} />
            </div>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden absolute left-0 right-0 top-[73px] bg-black/95 backdrop-blur-lg border-b border-white/5 transform transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? 'opacity-100 translate-y-0 visible' 
              : 'opacity-0 -translate-y-4 invisible h-0 overflow-hidden'
          }`}
        >
          <div className="container py-4">
            <nav className="flex flex-col gap-3">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition-all duration-300 px-2 py-2 rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/features" 
                className="text-gray-300 hover:text-white transition-all duration-300 px-2 py-2 rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-white transition-all duration-300 px-2 py-2 rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link> 
              <div className="h-px bg-white/10 my-2" />
              
              {/* Mobile Chatbot Button - Only show if authenticated */}
              {isAuthenticated && (
                <>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsChatbotOpen(true);
                    }}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 px-2 py-2 rounded-lg hover:bg-white/5"
                  >
                    <MessageSquareText className="w-4 h-4" />
                    Chat with AI Assistant
                  </button>
                  <div className="px-2 py-2">
                    <NotificationCenter />
                  </div>
                </>
              )}
              
              {isAuthenticated ? (
                <>
                  {user && (
                    <div className="px-2 py-2 text-gray-400 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                        {getUserInitials()}
                      </div>
                      <div className="text-sm">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  )}
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 px-2 py-2 rounded-lg hover:bg-white/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-2 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-300 hover:text-white transition-all duration-300 px-2 py-2 rounded-lg hover:bg-white/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-all duration-300 text-center hover:shadow-lg hover:shadow-primary/25 relative group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10">Register</span>
                    <div className="absolute inset-0 bg-primary rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-xl" />
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Add ChatbotOverlay to the Header component only if authenticated */}
      {isAuthenticated && <ChatbotOverlay isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />}
    </header>
  )
} 