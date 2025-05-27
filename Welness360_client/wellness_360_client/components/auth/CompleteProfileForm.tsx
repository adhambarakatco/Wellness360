'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/auth'

function CompleteProfileFormContent() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)

    const dob = formData.get('dob') as string
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    const data = {
      gender: formData.get('gender') as 'male' | 'female' | 'other',
      dob,
      age,
      height: parseInt(formData.get('height') as string),
      weight: parseInt(formData.get('weight') as string),
      activityLevel: formData.get('activityLevel') as
        | 'sedentary'
        | 'lightly active'
        | 'moderately active'
        | 'very active'
        | 'extremely active',
      goal: formData.get('goal') as 'maintain' | 'lose' | 'gain',
      dailyCalories: parseInt(formData.get('dailyCalories') as string),
      caloriesLeft: parseInt(formData.get('dailyCalories') as string) // Initially same as dailyCalories
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const result = await response.json()
      if (response.ok) {
        // Update user context
        updateUser(result.data)
        
        router.push('/dashboard')
      } else {
        setError(result.message || 'Failed to update profile')
      }
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 bg-secondary-dark p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Complete Your Profile</h2>
          <p className="text-gray-400 text-sm text-center">
            Help us personalize your wellness journey by providing some additional information
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Health Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Health Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium mb-2">
                  Height (cm)
                </label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  min="1"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                  placeholder="175"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium mb-2">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  min="1"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                  placeholder="70"
                />
              </div>

              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium mb-2">
                  Activity Level
                </label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly active">Lightly Active</option>
                  <option value="moderately active">Moderately Active</option>
                  <option value="very active">Very Active</option>
                  <option value="extremely active">Extremely Active</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium mb-2">
                  Fitness Goal
                </label>
                <select
                  id="goal"
                  name="goal"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                >
                  <option value="">Select goal</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="lose">Lose Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div>
                <label htmlFor="dailyCalories" className="block text-sm font-medium mb-2">
                  Daily Calorie Goal
                </label>
                <input
                  id="dailyCalories"
                  name="dailyCalories"
                  type="number"
                  min="500"
                  max="10000"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  <span>Updating...</span>
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CompleteProfileForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md p-8 flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </div>
    }>
      <CompleteProfileFormContent />
    </Suspense>
  )
}
