'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth'

// Create a separate component to use searchParams to prevent the error
function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Check for redirect cookie when component mounts
  useEffect(() => {
    // If there's a redirectTo URL param, we'll use it after successful login
    const redirectPath = searchParams.get('redirectTo')
    if (redirectPath) {
      // Store in sessionStorage for after successful login
      sessionStorage.setItem('redirectTo', redirectPath)
    }
  }, [searchParams])
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, password: data.password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      
      const result = await response.json()
      

      if (response.ok && result) {
        // Get user data from response
        const userData = {
          email: result.user.email || data.email,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          isEmailVerified: result.user.isEmailVerified || true
        }
        
        // Use the auth context to set user data and handle redirect
        authLogin(userData)
        
        // Check if there's a redirect path from middleware
        const redirectTo = sessionStorage.getItem('redirectTo')
        if (redirectTo) {
          sessionStorage.removeItem('redirectTo')
          router.push(redirectTo)
        }
      } else {
        if (result.isEmailVerified === false) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          setError(result.message || 'Failed to login')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8 bg-secondary-dark p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-gray-400 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-light">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

// Export a Suspense-wrapped version of the form
export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md p-8 flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}