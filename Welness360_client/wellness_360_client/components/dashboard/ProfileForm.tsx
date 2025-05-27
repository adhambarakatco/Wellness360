'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth'
import { Shield, Save, X, User2, ChevronDown } from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  gender: 'male' | 'female' | 'other'
  dob: string
  height: number
  weight: number
  activityLevel: string
  goal: string
  memberSince: string
  dailyCalories: number
  caloriesLeft: number
}

export default function ProfileForm() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const result = await response.json()

      if (result.success) {
        setProfile(result.data)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const formData = new FormData(event.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      gender: formData.get('gender') as 'male' | 'female' | 'other',
      dob: formData.get('dob') as string,
      height: parseInt(formData.get('height') as string),
      weight: parseInt(formData.get('weight') as string),
      activityLevel: formData.get('activityLevel') as string,
      goal: formData.get('goal') as string,
      dailyCalories: parseInt(formData.get('dailyCalories') as string),
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(result.message)
        setProfile({ ...profile!, ...data } as UserProfile)
        updateUser({ firstName: data.firstName, lastName: data.lastName })
        setIsEditing(false)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Profile Overview Section */}
      <div className="lg:col-span-2 bg-secondary-dark/60 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden self-start">
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Avatar and Name */}
            <div className="relative group">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {getInitials(profile.firstName, profile.lastName)}
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-1">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full mb-6">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary">Premium Member</span>
            </div>

            {/* Stats */}
            <div className="w-full grid grid-cols-1 divide-x divide-white/10">
              <div className="px-4 text-center">
                <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wide">Member since</p>
                <p className="font-bold">{profile.memberSince ? formatDate(profile.memberSince) : 'April 2025'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="lg:col-span-3 bg-secondary-dark/60 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Personal Information</h2>
              <p className="text-sm text-gray-400">Update your personal details and preferences</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary/10 hover:bg-primary/20 text-primary font-medium px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              Edit Profile
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-primary flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-gray-200">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={profile.firstName}
                  required
                  readOnly={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-200">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  defaultValue={profile.lastName}
                  required
                  readOnly={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-200">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white/60 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-2 text-gray-200">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={profile.gender}
                  required
                  disabled={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium mb-2 text-gray-200">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  defaultValue={profile.dob?.split('T')[0]}
                  required
                  readOnly={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium mb-2 text-gray-200">
                  Height (cm)
                </label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  defaultValue={profile.height}
                  required
                  readOnly={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium mb-2 text-gray-200">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  defaultValue={profile.weight}
                  required
                  readOnly={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium mb-2 text-gray-200">
                  Activity Level
                </label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  defaultValue={profile.activityLevel}
                  required
                  disabled={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
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
                <label htmlFor="goal" className="block text-sm font-medium mb-2 text-gray-200">
                  Fitness Goal
                </label>
                <select
                  id="goal"
                  name="goal"
                  defaultValue={profile.goal}
                  required
                  disabled={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                >
                  <option value="">Select goal</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="lose">Lose Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div>
                <label htmlFor="dailyCalories" className="block text-sm font-medium mb-2 text-gray-200">
                  Daily Calorie Goal
                </label>
                <input
                  id="dailyCalories"
                  name="dailyCalories"
                  type="number"
                  defaultValue={profile.dailyCalories}
                  min="500"
                  max="10000"
                  required
                  readOnly={!isEditing}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 ${
                    isEditing 
                      ? 'focus:border-primary/50 focus:ring-1 focus:ring-primary/50 hover:border-white/20' 
                      : 'cursor-default'
                  } transition-all duration-200`}
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}