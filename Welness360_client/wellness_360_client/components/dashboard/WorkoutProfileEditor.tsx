'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Dumbbell, 
  Target,
  HeartPulse,
  Scale,
  Timer,
  Calendar,
  Building,
  Footprints,
  Plus,
  X,
  Info,
  Check
} from 'lucide-react'
import { WorkoutProfile, FitnessLevel, FitnessGoal } from '@/types/workout'
import { motion, AnimatePresence } from 'framer-motion'

const fitnessLevels = Object.values(FitnessLevel)
const fitnessGoals = [
  { value: FitnessGoal.WEIGHT_LOSS, label: 'Weight Loss' },
  { value: FitnessGoal.MUSCLE_GAIN, label: 'Muscle Gain' },
  { value: FitnessGoal.ENDURANCE, label: 'Endurance' },
  { value: FitnessGoal.FLEXIBILITY, label: 'Flexibility' },
  { value: FitnessGoal.STRENGTH, label: 'Strength' },
  { value: FitnessGoal.GENERAL_FITNESS, label: 'General Fitness' }
]
const popularActivities = [
  'running', 'walking', 'swimming', 'cycling', 'weightlifting', 
  'yoga', 'pilates', 'hiit', 'boxing', 'basketball', 
  'soccer', 'tennis', 'golf', 'dancing', 'hiking'
]
const commonEquipment = [
  'dumbbells', 'barbells', 'resistance bands', 'kettlebells', 
  'yoga mat', 'treadmill', 'exercise bike', 'elliptical', 
  'pull-up bar', 'bench', 'stability ball', 'medicine ball'
]
const commonInjuries = [
  'lower back pain', 'knee injury', 'shoulder pain', 'ankle sprain',
  'wrist pain', 'neck pain', 'hip pain', 'elbow pain'
]

interface WorkoutProfileEditorProps {
  onProfileUpdated?: () => void;
}

export default function WorkoutProfileEditor({ onProfileUpdated }: WorkoutProfileEditorProps) {
  const [profile, setProfile] = useState<Partial<WorkoutProfile>>({
    fitnessLevel: '',
    fitnessGoals: [],
    preferredActivities: [],
    targetWeight: 0,
    hasInjuries: false,
    injuries: [],
    availableWorkoutDays: 3,
    preferredWorkoutDuration: 30,
    hasGymAccess: false,
    availableEquipment: []
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [newInjury, setNewInjury] = useState('')
  const [newActivity, setNewActivity] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [activeSection, setActiveSection] = useState<'basic' | 'fitness' | 'schedule' | 'equipment'>('basic')

  // Fetch profile on component mount
  useEffect(() => {
    fetchWorkoutProfile()
  }, [])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const fetchWorkoutProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/workouts/profile')
      
      if (response.status === 400) {
        setError('')  
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }
      
      const data = await response.json()
      setProfile(data || {})
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Could not load your fitness profile. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Only include the fields required by the API
      const dataToSubmit = {
        fitnessLevel: profile.fitnessLevel,
        fitnessGoals: profile.fitnessGoals || [],
        preferredActivities: profile.preferredActivities || [],
        targetWeight: profile.targetWeight,
        hasInjuries: profile.hasInjuries,
        injuries: profile.injuries || [],
        availableWorkoutDays: profile.availableWorkoutDays,
        preferredWorkoutDuration: profile.preferredWorkoutDuration,
        hasGymAccess: profile.hasGymAccess,
        availableEquipment: profile.availableEquipment || []
      };
      
      const response = await fetch('/api/workouts/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`)
      }
      
      const data = await response.json()
      setProfile(data)
      setSuccessMessage('Your fitness profile has been updated successfully!')
      onProfileUpdated?.()
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Could not update your fitness profile. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setProfile(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setProfile(prev => ({ ...prev, [name]: Number(value) }))
    } else {
      setProfile(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleMultiSelectChange = (name: string, value: string) => {
    setProfile(prev => {
      const values = prev[name as keyof WorkoutProfile] as string[] || []
      if (values.includes(value)) {
        return { ...prev, [name]: values.filter(v => v !== value) }
      } else {
        return { ...prev, [name]: [...values, value] }
      }
    })
  }

  const addCustomItem = (field: keyof WorkoutProfile, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return
    
    setProfile(prev => {
      const values = prev[field] as string[] || []
      if (!values.includes(value)) {
        return { ...prev, [field]: [...values, value.trim()] }
      }
      return prev
    })
    
    setValue('')
  }

  const removeItem = (field: keyof WorkoutProfile, value: string) => {
    setProfile(prev => {
      const values = prev[field] as string[] || []
      return { ...prev, [field]: values.filter(v => v !== value) }
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-gray-400">Loading your fitness profile...</p>
      </div>
    )
  }

  return (
    <div className="w-full mx-0">
      <form onSubmit={handleSubmit} className="space-y-8 w-full mx-0">
      {/* Error & Success Messages */}
        <AnimatePresence>
      {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl p-4 flex items-start mb-4 w-full"
            >
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
            </motion.div>
      )}
      
      {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl p-4 flex items-start mb-4 w-full"
            >
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Navigation */}
        <div className="flex overflow-x-auto bg-black/30 p-1 rounded-xl w-full no-scrollbar">
          <button 
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'basic'
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Basic Info</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveSection('fitness')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'fitness'
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Fitness Goals</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveSection('schedule')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'schedule'
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveSection('equipment')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'equipment'
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Equipment</span>
          </button>
        </div>

          {/* Basic Info Section */}
        {activeSection === 'basic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-6 w-full mx-0"
          >
            <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
            <p className="text-sm text-gray-400 pb-4 border-b border-white/10">
              Tell us about your physical characteristics so we can better personalize your workout plans
            </p>
            
            <div className="space-y-6 w-full mx-0">
              <div className="space-y-2 w-full">
                <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-300">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  id="targetWeight"
                  name="targetWeight"
                  min="30"
                  max="200"
                  value={profile.targetWeight || ''}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-primary focus:border-primary text-lg"
                  required
                />
              </div>
              
              <div className="space-y-2 hidden">
                <label htmlFor="age" className="block text-sm font-medium text-gray-300">
                  Age (years)
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="14"
                  max="90"
                  value={profile.age || ''}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2 hidden">
                <label htmlFor="height" className="block text-sm font-medium text-gray-300">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min="100"
                  max="250"
                  value={profile.height || ''}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2 hidden">
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  min="30"
                  max="200"
                  value={profile.weight || ''}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-primary focus:border-primary"
                  required
                />
            </div>
          </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-primary" />
                Injuries
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="hasInjuries"
                  name="hasInjuries"
                  checked={profile.hasInjuries || false}
                  onChange={handleChange}
                  className="w-4 h-4 bg-black/50 border-white/10 rounded focus:ring-primary accent-primary"
                />
                <label htmlFor="hasInjuries" className="text-sm">
                  I have injuries or conditions that limit my workout
                </label>
              </div>
              
              {profile.hasInjuries && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.injuries?.map((injury, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full"
                      >
                        {injury}
                        <X 
                          className="w-3.5 h-3.5 ml-0.5 cursor-pointer hover:text-white" 
                          onClick={() => removeItem('injuries', injury)}
                        />
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Add injury or condition"
                        value={newInjury}
                        onChange={(e) => setNewInjury(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addCustomItem('injuries', newInjury, setNewInjury)}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <p className="font-medium mb-2">Common injuries:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {commonInjuries.map((injury) => (
                        <span
                          key={injury}
                          onClick={() => addCustomItem('injuries', injury, setNewInjury)}
                          className={`cursor-pointer text-xs px-3 py-1.5 rounded-full transition ${
                            profile.injuries?.includes(injury) 
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          {injury}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Fitness Goals Section */}
        {activeSection === 'fitness' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-6 w-full mx-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Fitness Goals & Level</h3>
            </div>
            <p className="text-sm text-gray-400 pb-4 border-b border-white/10">
              Tell us about your fitness level and goals to create a tailored workout plan
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-300">
                  Fitness Level
                </label>
                <select
                  id="fitnessLevel"
                  name="fitnessLevel"
                  value={profile.fitnessLevel || ''}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-primary focus:border-primary capitalize"
                  required
                >
                  <option value="" disabled>Select your fitness level</option>
                  {fitnessLevels.map(level => (
                    <option key={level} value={level} className="capitalize">
                      {level.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Fitness Goals</h4>
                <p className="text-xs text-gray-400">Select one or more goals</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {fitnessGoals.map(goal => (
                    <div
                    key={goal.value}
                      className={`flex items-center justify-center gap-2 border p-3 rounded-lg cursor-pointer transition ${
                      profile.fitnessGoals?.includes(goal.value)
                          ? 'bg-primary/20 border-primary/30 text-primary'
                          : 'border-white/10 bg-black/40 hover:bg-black/60 text-gray-300'
                      }`}
                      onClick={() => handleMultiSelectChange('fitnessGoals', goal.value)}
                    >
                      {profile.fitnessGoals?.includes(goal.value) && (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{goal.label}</span>
                    </div>
                ))}
              </div>
                {(!profile.fitnessGoals || profile.fitnessGoals.length === 0) && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Please select at least one fitness goal
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Preferred Activities</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.preferredActivities?.map((activity, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-xs px-3 py-1.5 rounded-full"
                  >
                    {activity}
                      <X 
                        className="w-3.5 h-3.5 ml-0.5 cursor-pointer hover:text-white" 
                        onClick={() => removeItem('preferredActivities', activity)}
                      />
                    </span>
                ))}
              </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                <input
                  type="text"
                      placeholder="Add activity"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-primary focus:border-primary"
                />
                  </div>
                <button
                  type="button"
                  onClick={() => addCustomItem('preferredActivities', newActivity, setNewActivity)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition"
                >
                    <Plus className="w-5 h-5" />
                </button>
              </div>

                <div className="mt-2 text-sm">
                  <p className="font-medium mb-2">Popular activities:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularActivities.map((activity) => (
                      <span
                        key={activity}
                        onClick={() => addCustomItem('preferredActivities', activity, setNewActivity)}
                        className={`cursor-pointer text-xs px-3 py-1.5 rounded-full transition ${
                          profile.preferredActivities?.includes(activity) 
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Schedule Section */}
        {activeSection === 'schedule' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-6 w-full mx-0"
          >
            <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Workout Schedule</h3>
              </div>
            <p className="text-sm text-gray-400 pb-4 border-b border-white/10">
              Let us know your availability for workouts
            </p>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="availableWorkoutDays" className="block text-sm font-medium text-gray-300">
                  Days per week available for workout
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, availableWorkoutDays: day }))}
                      className={`aspect-square p-3 rounded-lg flex items-center justify-center transition ${
                        profile.availableWorkoutDays === day
                          ? 'bg-primary text-white'
                          : 'bg-black/50 border border-white/10 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="preferredWorkoutDuration" className="block text-sm font-medium text-gray-300">
                  Preferred workout duration (minutes)
                </label>
                <div className="w-full relative mt-1">
                  <input
                    type="range"
                  id="preferredWorkoutDuration"
                  name="preferredWorkoutDuration"
                    min="15"
                    max="120"
                    step="5"
                    value={profile.preferredWorkoutDuration || 30}
                  onChange={handleChange}
                    className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="absolute left-0 right-0 -bottom-6 flex justify-between px-1 text-xs text-gray-500">
                    <span>15m</span>
                    <span>30m</span>
                    <span>45m</span>
                    <span>60m</span>
                    <span>90m</span>
                    <span>120m</span>
                  </div>
                  <div className="text-center mt-8 text-lg font-bold text-primary">
                    {profile.preferredWorkoutDuration} minutes
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

          {/* Equipment Section */}
        {activeSection === 'equipment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-6 w-full mx-0"
          >
            <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Equipment & Gym Access</h3>
              </div>
            <p className="text-sm text-gray-400 pb-4 border-b border-white/10">
              Tell us what equipment you have access to for your workouts
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasGymAccess"
                  name="hasGymAccess"
                  checked={profile.hasGymAccess || false}
                  onChange={handleChange}
                  className="w-4 h-4 bg-black/50 border-white/10 rounded focus:ring-primary accent-primary"
                />
                <label htmlFor="hasGymAccess" className="text-sm">
                  I have access to a gym
                </label>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Available Equipment</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.availableEquipment?.map((equipment, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-xs px-3 py-1.5 rounded-full"
                  >
                    {equipment}
                      <X 
                        className="w-3.5 h-3.5 ml-0.5 cursor-pointer hover:text-white" 
                        onClick={() => removeItem('availableEquipment', equipment)}
                      />
                    </span>
                ))}
              </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                <input
                  type="text"
                      placeholder="Add equipment"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-primary focus:border-primary"
                />
                  </div>
                <button
                  type="button"
                  onClick={() => addCustomItem('availableEquipment', newEquipment, setNewEquipment)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition"
                >
                    <Plus className="w-5 h-5" />
                </button>
              </div>

                <div className="mt-2 text-sm">
                  <p className="font-medium mb-2">Common equipment:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {commonEquipment.map((equipment) => (
                      <span
                        key={equipment}
                        onClick={() => addCustomItem('availableEquipment', equipment, setNewEquipment)}
                        className={`cursor-pointer text-xs px-3 py-1.5 rounded-full transition ${
                          profile.availableEquipment?.includes(equipment) 
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              </div>
          </motion.div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between pt-2 w-full">
          <div className="space-x-2">
            {activeSection !== 'basic' && (
                    <button
                      type="button"
                onClick={() => {
                  if (activeSection === 'fitness') setActiveSection('basic')
                  if (activeSection === 'schedule') setActiveSection('fitness')
                  if (activeSection === 'equipment') setActiveSection('schedule')
                }}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm"
              >
                Previous
                    </button>
            )}
            {activeSection !== 'equipment' && (
                            <button
                              type="button"
                onClick={() => {
                  if (activeSection === 'basic') setActiveSection('fitness')
                  if (activeSection === 'fitness') setActiveSection('schedule')
                  if (activeSection === 'schedule') setActiveSection('equipment')
                }}
                className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm"
              >
                Next
                            </button>
            )}
          </div>
            <button
              type="submit"
              disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 px-6 rounded-lg transition disabled:opacity-70 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
        </div>
      </form>
    </div>
  )
} 