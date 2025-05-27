'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  firstName: string
  lastName: string
  isEmailVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user')
        
        if (storedUser) {
          try {
            // Parse stored user data
            const userData = JSON.parse(storedUser)
            setUser(userData)
          } catch (error) {
            console.error('Failed to parse stored user:', error)
            localStorage.removeItem('user')
          }
        }
        
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    router.push('/dashboard')
  }

  const logout = async () => {
    // call the logout endpoint
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      router.push('/login')
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
    } 
  }

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated))
      }
      return updated
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 