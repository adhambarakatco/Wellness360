'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'

function ForgotPasswordFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [isOTPSent, setIsOTPSent] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Handle OTP input focus and auto-advance
  const handleOTPInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    const isBackspace = value === ''

    // Handle pasting
    if (value.length > 1) {
      e.preventDefault()
      const digits = value.replace(/\D/g, '').split('').slice(0, 6)
      
      digits.forEach((digit, i) => {
        const input = document.getElementById(`otp-${i}`) as HTMLInputElement
        if (input) {
          input.value = digit
          if (i === digits.length - 1 && i < 5) {
            const nextInput = document.getElementById(`otp-${i + 1}`) as HTMLInputElement
            if (nextInput) nextInput.focus()
          }
        }
      })
      return
    }

    // Handle single digit input
    if (value && !isBackspace && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    pastedData.split('').forEach((digit, i) => {
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement
      if (input) {
        input.value = digit
      }
    })

    // Focus the next empty input or the last input if all are filled
    const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5
    const nextInput = document.getElementById(`otp-${nextEmptyIndex}`) as HTMLInputElement
    if (nextInput) nextInput.focus()
  }

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess(result.message)
        setIsOTPSent(true)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process request')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsResetting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const otp = Array.from({ length: 6 }, (_, i) => formData.get(`otp-${i}`)).join('')
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsResetting(false)
      return
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit code')
      setIsResetting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess('Password reset successfully! Redirecting to login in 3 seconds...')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8 bg-secondary-dark p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
          <p className="text-gray-400 text-sm text-center">
            {!isOTPSent 
              ? 'Enter your email address to reset your password' 
              : 'Enter the verification code sent to your email'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary/10 border border-primary/50 rounded-lg p-4 text-sm text-primary">
            {success}
          </div>
        )}

        {!isOTPSent ? (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:text-primary-light">
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-4 text-center">
                  Verification Code
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      name={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      pattern="[0-9]"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      className="w-full aspect-square bg-black/50 border border-white/10 rounded-lg text-center text-xl font-bold text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                      onChange={(e) => handleOTPInput(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
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
                disabled={isResetting}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md p-8 flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </div>
    }>
      <ForgotPasswordFormContent />
    </Suspense>
  )
}