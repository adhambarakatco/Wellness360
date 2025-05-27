'use client'

import { useState, useEffect } from 'react'
import { 
  Dumbbell, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  ArrowRight,
  Zap,
  Edit,
  X,
  Calendar,
  Target,
  Medal,
  BarChart,
  Activity,
  TrendingUp
} from 'lucide-react'
import WorkoutPlanCard from '@/components/dashboard/WorkoutPlanCard'
import WorkoutProfileEditor from '@/components/dashboard/WorkoutProfileEditor'
import { WorkoutProfile, WorkoutPlan } from '@/types/workout'
import { motion, AnimatePresence } from 'framer-motion'

export default function AITrainer() {
  const [profile, setProfile] = useState<WorkoutProfile | null>(null)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingPlan, setIsLoadingPlan] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCompletingDay, setIsCompletingDay] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [activeTab, setActiveTab] = useState<'plans' | 'profile'>('plans')
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Fetch profile on component mount
  useEffect(() => {
    fetchWorkoutProfile()
  }, [])

  // Fetch workout plan only when profile exists
  useEffect(() => {
    if (profile) {
      fetchWorkoutPlan()
    } else {
      // Reset plan to null and loading state when no profile exists
      setPlan(null)
      setIsLoadingPlan(false)
    }
  }, [profile])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Close confirmation modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmation) {
        setShowConfirmation(false)
      }
    }
    
    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [showConfirmation])

  // Lock scroll when confirmation modal is open
  useEffect(() => {
    if (showConfirmation) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showConfirmation])

  // Refetch profile when profile editor is closed
  useEffect(() => {
    if (!showProfileEditor) {
      fetchWorkoutProfile()
    }
  }, [showProfileEditor])

  const fetchWorkoutProfile = async () => {
    setIsLoadingProfile(true)
    setError(null)
    setProfileIncomplete(false)
    
    try {
      const response = await fetch('/api/workouts/profile')
      
      if (response.status === 404) {
        // Profile doesn't exist yet - this is not an error state
        setProfile(null)
        setIsLoadingProfile(false)
        return
      }
      
      if (response.status === 400) {
        // Profile is incomplete
        setProfile(null)
        setProfileIncomplete(true)
        setIsLoadingProfile(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }
      
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Only show error if it's not a 404/400 (profile not found/incomplete)
      if (error instanceof Error && !error.message.includes('404') && !error.message.includes('400')) {
        setError('Could not load your fitness profile. Please try again later.')
      }
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchWorkoutPlan = async () => {
    setIsLoadingPlan(true)
    setError(null)
    
    try {
      const response = await fetch('/api/workouts/plan')
      
      if (response.status === 404 || response.status === 400) {
        // Plan doesn't exist yet or profile is incomplete - this is not an error state
        setPlan(null)
        setIsLoadingPlan(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch workout plan: ${response.status}`)
      }
      
      const data = await response.json()
      setPlan(data)
    } catch (error) {
      console.error('Error fetching workout plan:', error)
      // Only show error if it's not a 404/400 (plan not found/profile incomplete)
      if (error instanceof Error && !error.message.includes('404') && !error.message.includes('400')) {
        setError('Could not load your workout plan. Please try again later.')
      }
    } finally {
      setIsLoadingPlan(false)
    }
  }

  const handleGeneratePlan = () => {
    if (plan) {
      // Show confirmation dialog if there's an existing plan
      setShowConfirmation(true)
    } else {
      // Generate directly if no plan exists
      generateWorkoutPlan()
    }
  }

  const generateWorkoutPlan = async () => {
    setIsGenerating(true)
    setError(null)
    setShowConfirmation(false) // Close the confirmation dialog if open
    
    try {
      const response = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'strength' }), // Could be customizable in the future
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate workout plan: ${response.status}`)
      }
      
      const data = await response.json()
      setPlan(data)
      setSuccessMessage('New workout plan generated successfully!')
    } catch (error) {
      console.error('Error generating workout plan:', error)
      setError('Could not generate a new workout plan. Please try again later.')
    } finally {
      setIsGenerating(false)
    }
  }

  const completeWorkoutDay = async (dayIndex: number) => {
    setIsCompletingDay(true)
    setActiveIndex(dayIndex)
    setError(null)
    
    try {
      const response = await fetch('/api/workouts/plan/complete-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dayIndex }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to mark workout as complete: ${response.status}`)
      }
      
      // Update the local state
      if (plan) {
        const updatedPlan = { ...plan }
        updatedPlan.workoutDays[dayIndex].isCompleted = true
        updatedPlan.workoutDays[dayIndex].completedAt = new Date().toISOString()
        setPlan(updatedPlan)
      }
      
      setSuccessMessage('Workout day marked as completed!')
    } catch (error) {
      console.error('Error completing workout day:', error)
      setError('Could not mark workout as complete. Please try again later.')
    } finally {
      setIsCompletingDay(false)
      setActiveIndex(null)
    }
  }

  const getWorkoutPlanStats = () => {
    if (!plan) return { total: 0, completed: 0 }
    
    const total = plan.workoutDays.length
    const completed = plan.workoutDays.filter(day => day.isCompleted).length
    
    return { total, completed }
  }

  const { total, completed } = getWorkoutPlanStats()

  return (
    <div className="w-full">
      {/* Header with Title and Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 w-full">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/20 p-2 rounded-md">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Workout Trainer</h1>
            <p className="text-gray-400 text-xs">
              Personalized workout plans based on your fitness profile and goals
            </p>
          </div>
        </div>
        
          {profile && (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg transition disabled:opacity-70 font-medium text-sm"
            >
              {isGenerating ? (
                <>
                <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                <RefreshCw className="w-4 h-4" />
                  Generate New Plan
                </>
              )}
            </button>
          )}
        </div>

        {/* Error & Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg p-3 flex items-start mb-3 text-sm"
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
        
        {profileIncomplete && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg p-3 flex items-start mb-3 text-sm"
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>Your fitness profile is incomplete. Please complete your profile to generate workout plans.</p>
          </motion.div>
        )}
        
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg p-3 flex items-start mb-3 text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-black/40 p-1 rounded-xl mb-4 w-full no-scrollbar">
            <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'plans'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Workout Plans</span>
            </button>
        
            <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Fitness Profile</span>
            </button>
        </div>

      {/* Content Container */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-3 sm:p-4 w-full mx-0">
        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="animate-in fade-in duration-300 w-full mx-0">
            {isLoadingPlan ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-gray-400 text-sm">Loading your workout plan...</p>
              </div>
            ) : !plan ? (
              <div className="text-center py-8 sm:py-12 max-w-lg mx-auto">
                <div className="bg-primary/10 p-3 rounded-full inline-flex mb-3">
                  <Dumbbell className="w-6 h-6 text-primary" />
              </div>
                <h3 className="text-lg font-semibold mb-2">No Workout Plan Yet</h3>
                <p className="text-gray-400 mb-4 px-4 sm:px-0 text-sm">
                  Generate your first AI workout plan tailored to your fitness profile and goals.
                </p>
                <button
                  onClick={handleGeneratePlan}
                  disabled={!profile || isGenerating}
                  className="bg-primary hover:bg-primary/90 text-white py-2 px-5 rounded-lg transition disabled:opacity-50 font-medium text-sm"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
              </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Generate Workout Plan
              </div>
                  )}
                </button>
                {!profile && (
                  <div className="mt-3 text-xs text-amber-400 flex items-center justify-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Complete your fitness profile first
              </div>
                )}
            </div>
          ) : (
              <div>
                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-black/60 border border-white/5 rounded-lg p-2.5 flex items-center">
                    <div className="bg-blue-500/20 p-2 rounded-lg mr-2.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Workout Days</p>
                      <p className="text-lg font-bold">{total}</p>
              </div>
            </div>
                  
                  <div className="bg-black/60 border border-white/5 rounded-lg p-2.5 flex items-center">
                    <div className="bg-green-500/20 p-2 rounded-lg mr-2.5">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Completed</p>
                      <p className="text-lg font-bold">{completed}</p>
        </div>
      </div>

                  <div className="bg-black/60 border border-white/5 rounded-lg p-2.5 flex items-center">
                    <div className="bg-primary/20 p-2 rounded-lg mr-2.5">
                      <Medal className="w-4 h-4 text-primary" />
                    </div>
            <div>
                      <p className="text-[10px] text-gray-400">Progress</p>
                      <p className="text-lg font-bold">
                        {total > 0 ? Math.round((completed / total) * 100) : 0}%
                      </p>
            </div>
          </div>
        </div>
        
                {/* Workout Days */}
                <div className="bg-black/20 border border-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <BarChart className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{plan.name}</span>
            </div>
                    <p className="text-xs text-primary font-medium">
                      {completed}/{total} completed
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {plan.workoutDays.map((day, index) => (
                      <WorkoutPlanCard
                        key={index}
                        day={day}
                        index={index}
                        isLoading={isCompletingDay && activeIndex === index}
                        onComplete={completeWorkoutDay}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-300 w-full mx-0">
            {isLoadingProfile ? (
              <div className="flex flex-col items-center justify-center py-12 w-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-gray-400 text-sm">Loading your fitness profile...</p>
              </div>
            ) : showProfileEditor ? (
              <div className="w-full mx-0">
                <WorkoutProfileEditor 
                  onProfileUpdated={() => {
                    fetchWorkoutProfile();
                    setShowProfileEditor(false);
                    setSuccessMessage('Your fitness profile has been updated successfully!');
                  }}
                />
              </div>
            ) : !profile ? (
              <div className="text-center py-8 sm:py-12 max-w-lg mx-auto">
                <div className="bg-primary/10 p-3 rounded-full inline-flex mb-3">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create Your Fitness Profile</h3>
                <p className="text-gray-400 mb-4 px-4 sm:px-0 text-sm">
                  Set up your fitness profile to get personalized workout recommendations.
              </p>
              <button
                  onClick={() => setShowProfileEditor(true)}
                  className="bg-primary hover:bg-primary/90 text-white py-2 px-5 rounded-lg transition font-medium text-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <Edit className="w-4 h-4" />
                    Create Profile
                  </div>
              </button>
            </div>
          ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    Fitness Profile
                  </h3>
                  <button
                    onClick={() => setShowProfileEditor(true)}
                    className="flex items-center gap-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary py-1 px-2 rounded-lg transition"
                  >
                    <Edit className="w-3 h-3" />
                    Edit Profile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Basic Information */}
                  <div className="bg-black/60 border border-white/5 rounded-lg p-4">
                    <h4 className="text-xs font-medium mb-3 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      Basic Information
                    </h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Age</span>
                        <span className="font-medium text-sm">{profile.age} years</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Height</span>
                        <span className="font-medium text-sm">{profile.height} cm</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Weight</span>
                        <span className="font-medium text-sm">{profile.weight} kg</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Target Weight</span>
                        <span className="font-medium text-sm">{profile.targetWeight} kg</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fitness Details */}
                  <div className="bg-black/60 border border-white/5 rounded-lg p-4">
                    <h4 className="text-xs font-medium mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Fitness Details
                    </h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Fitness Level</span>
                        <span className="font-medium text-sm capitalize">{profile.fitnessLevel}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Primary Goal</span>
                        <span className="font-medium text-sm capitalize">
                          {profile.fitnessGoals && profile.fitnessGoals.length > 0 
                            ? profile.fitnessGoals[0].replace(/_/g, ' ') 
                            : 'Not specified'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Secondary Goals</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {profile.fitnessGoals && profile.fitnessGoals.slice(1).map((goal, i) => (
                            <span key={i} className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full capitalize">
                              {typeof goal === 'string' ? goal.replace(/_/g, ' ') : goal}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-400">Weekly Activity</span>
                        <span className="font-medium text-sm">{profile.availableWorkoutDays} days/week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          )}
      </div>
      
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-xl p-5 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-2.5 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold">Generate New Plan?</h3>
              </div>
              
              <p className="text-gray-400 text-sm mb-5">
                This will delete your current workout plan and all progress tracking. Are you sure you want to continue?
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={generateWorkoutPlan}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  Yes, Replace Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 