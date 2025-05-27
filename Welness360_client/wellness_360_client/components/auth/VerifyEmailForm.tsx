'use client'

import { useState, useEffect, Suspense } from 'react'
import { Shield } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailFormContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(event.currentTarget)
    const otp = Array.from({ length: 6 }, (_, i) => 
      formData.get(`otp-${i}`)
    ).join('')

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit code')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess(result.message)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify email')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    setResendDisabled(true)
    setError('')
    setCountdown(60) // 60 seconds cooldown

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()
      
      if (!result.success) {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
      setResendDisabled(false)
      setCountdown(0)
    }
  }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      if (prevInput) prevInput.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8 bg-secondary-dark p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
          <p className="text-gray-400 text-sm text-center">
            We've sent a verification code to<br />
            <span className="text-white">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/50 rounded-lg p-4 text-sm text-primary">
              {success}
            </div>
            <Link 
              href="/login"
              className="block w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
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

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled}
                className="w-full bg-transparent border border-white/10 hover:border-white/20 text-white py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 
                  ? `Resend code in ${countdown}s` 
                  : 'Resend verification code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md space-y-8 bg-secondary-dark p-8 rounded-2xl border border-white/5">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailFormContent />
    </Suspense>
  )
} 